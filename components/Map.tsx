"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { DivIcon, LatLngBoundsExpression, LatLngExpression } from "leaflet";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import { PLACES } from "@/lib/siteData";
import { useSettings } from "@/hooks/useSettings";
import {
  buildMapRouteState,
  type MapRouteMode,
} from "@/lib/mapRouteLogic";
import {
  buildDefaultMapMarkerLayout,
  buildMapMarkerLayout,
  type MapMarkerLayoutItem,
  type MapScreenPoint,
} from "@/lib/mapMarkerLayout";
import { getPlaceTourism } from "@/lib/tourismData";
import type { MapSticker } from "@/lib/travelTypes";

const standardTileLayer = {
  url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution: "&copy; OpenStreetMap contributors",
};

const satelliteTileLayer = {
  url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  attribution: "Tiles &copy; Esri",
};

type NomadMapProps = {
  routePlaceIds?: string[];
  focusedPlaceId?: string;
  showAllConnections?: boolean;
  routeMode?: MapRouteMode;
  startPlaceId?: string;
  destinationPlaceId?: string;
  onMarkerClick?: (placeId: string) => void;
};

function MapFocus({ bounds, routeMode }: { bounds: LatLngBoundsExpression; routeMode: MapRouteMode }) {
  const map = useMap();

  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, {
        padding: routeMode === "route" ? [64, 64] : [40, 40],
        maxZoom: routeMode === "route" ? 10 : 9,
      });
    }
  }, [bounds, map, routeMode]);

  return null;
}

function SmartMarkerLayer({
  stickers,
  focusedPlaceId,
  onMarkerClick,
}: {
  stickers: MapSticker[];
  focusedPlaceId?: string;
  onMarkerClick?: (placeId: string) => void;
}) {
  const map = useMap();
  const [layoutItems, setLayoutItems] = useState<MapMarkerLayoutItem[]>(() =>
    buildDefaultMapMarkerLayout(stickers)
  );

  const recalculateLayout = useCallback(() => {
    const mapSize = map.getSize();
    const points = stickers.reduce<Record<string, MapScreenPoint>>((collection, sticker) => {
      const point = map.latLngToContainerPoint(sticker.coordinates);

      collection[sticker.id] = {
        x: point.x,
        y: point.y,
      };

      return collection;
    }, {});

    setLayoutItems(
      buildMapMarkerLayout({
        stickers,
        points,
        mapSize: {
          x: mapSize.x,
          y: mapSize.y,
        },
        zoom: map.getZoom(),
        focusedPlaceId,
      })
    );
  }, [focusedPlaceId, map, stickers]);

  useEffect(() => {
    let frame = 0;
    const scheduleLayout = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(recalculateLayout);
    };

    scheduleLayout();
    map.on("move", scheduleLayout);
    map.on("zoom", scheduleLayout);
    map.on("moveend", scheduleLayout);
    map.on("zoomend", scheduleLayout);
    map.on("resize", scheduleLayout);

    return () => {
      cancelAnimationFrame(frame);
      map.off("move", scheduleLayout);
      map.off("zoom", scheduleLayout);
      map.off("moveend", scheduleLayout);
      map.off("zoomend", scheduleLayout);
      map.off("resize", scheduleLayout);
    };
  }, [map, recalculateLayout]);

  const openCluster = (layoutItem: MapMarkerLayoutItem) => {
    const coordinates = layoutItem.memberStickers.map((sticker) => sticker.coordinates);

    if (coordinates.length === 0) {
      return;
    }

    map.flyToBounds(L.latLngBounds(coordinates), {
      animate: true,
      duration: 0.22,
      maxZoom: Math.max(map.getZoom() + 2, 11),
      padding: [72, 72],
    });
  };

  return (
    <>
      {layoutItems.map((layoutItem) => {
        const place = PLACES.find((item) => item.id === layoutItem.sticker.placeId) ?? PLACES[0];
        const profile = getPlaceTourism(place);

        return (
          <Marker
            key={layoutItem.id}
            icon={createStickerIcon(layoutItem)}
            position={layoutItem.coordinates}
            opacity={layoutItem.opacity}
            zIndexOffset={layoutItem.zIndexOffset}
            eventHandlers={{
              click: () => {
                if (layoutItem.kind === "cluster") {
                  openCluster(layoutItem);
                  return;
                }

                onMarkerClick?.(layoutItem.sticker.placeId);
              },
            }}
          >
            {layoutItem.kind === "sticker" ? (
              <Popup>
                <div className="space-y-3">
                  <strong className="block text-base">{place.name}</strong>
                  <p className="text-sm leading-5 text-slate-700">{place.desc}</p>
                  <p className="text-xs text-slate-600">
                    {profile.rating.toFixed(1)} rating / {profile.categoryLabel}
                  </p>
                  <p className="text-xs text-slate-600">Visit time: {profile.visitTime}</p>
                  <a
                    href={`/locations/${place.id}`}
                    className="inline-flex rounded-full bg-[#0f766e] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#134e4a]"
                  >
                    View guide
                  </a>
                </div>
              </Popup>
            ) : null}
          </Marker>
        );
      })}
    </>
  );
}

export default function Map({
  routePlaceIds = [],
  focusedPlaceId,
  showAllConnections = false,
  routeMode = "network",
  startPlaceId,
  destinationPlaceId,
  onMarkerClick,
}: NomadMapProps) {
  const { settings } = useSettings();
  const tileLayer = settings.mapStyle === "Satellite" ? satelliteTileLayer : standardTileLayer;
  const routeState = useMemo(
    () =>
      buildMapRouteState({
        routePlaceIds,
        focusedPlaceId,
        routeMode,
        startPlaceId,
        destinationPlaceId,
      }),
    [destinationPlaceId, focusedPlaceId, routeMode, routePlaceIds, startPlaceId]
  );

  const routeLine: LatLngExpression[] = useMemo(
    () => routeState.routePlaces.map((place) => place.coordinates),
    [routeState.routePlaces]
  );
  const bounds: LatLngBoundsExpression = useMemo(
    () => routeState.activePlaces.map((place) => place.coordinates),
    [routeState.activePlaces]
  );
  const connectionLines: LatLngExpression[][] = useMemo(() => {
    const hubPlace = PLACES.find((place) => place.id === "almaty") ?? PLACES[0];

    return showAllConnections
      ? PLACES.filter((place) => place.id !== hubPlace.id).map((place) => [
          hubPlace.coordinates,
          place.coordinates,
        ])
      : [];
  }, [showAllConnections]);

  return (
    <div
      className="relative h-[400px] w-full overflow-hidden rounded-[18px] border border-white/10 bg-white/5 shadow-[inset_0_0_80px_rgba(15,23,42,0.15)] sm:h-[520px] sm:rounded-[22px]"
      aria-label="Interactive travel map"
    >
      <MapContainer
        bounds={bounds}
        boundsOptions={{ padding: [48, 48] }}
        className="h-full w-full"
        preferCanvas
        scrollWheelZoom={false}
      >
        <MapFocus bounds={bounds} routeMode={routeMode} />
        <TileLayer key={settings.mapStyle} url={tileLayer.url} attribution={tileLayer.attribution} />

        {showAllConnections && routeMode === "network" ? (
          connectionLines.map((positions, index) => (
            <Polyline
              key={`connection-${index}`}
              positions={positions}
              pathOptions={{
                color: index % 2 === 0 ? "#f59e0b" : "#0f766e",
                opacity: 0.55,
                weight: 3,
                dashArray: index % 2 === 0 ? "5 8" : "2 6",
              }}
            />
          ))
        ) : routeLine.length > 1 ? (
          <Polyline
            positions={routeLine}
            pathOptions={{
              color: routeMode === "route" ? "#f59e0b" : "#0f766e",
              opacity: routeMode === "route" ? 0.95 : 0.9,
              weight: routeMode === "route" ? 6 : 5,
              dashArray: routeMode === "route" ? "1 0" : "8 5",
            }}
          />
        ) : null}

        <SmartMarkerLayer
          stickers={routeState.stickers}
          focusedPlaceId={focusedPlaceId}
          onMarkerClick={onMarkerClick}
        />
      </MapContainer>
    </div>
  );
}

function createStickerIcon(layoutItem: MapMarkerLayoutItem): DivIcon {
  const sticker = layoutItem.sticker;
  const roleClass =
    sticker.role === "start"
      ? " nomad-map-sticker-start"
      : sticker.role === "destination"
        ? " nomad-map-sticker-destination"
        : "";
  const activeClass = sticker.isActive ? " nomad-map-sticker-active" : "";
  const transform = `translate3d(${layoutItem.offsetX}px, ${layoutItem.offsetY}px, 0)`;

  return L.divIcon({
    className: "nomad-map-sticker-wrapper",
    html: `
      <div class="nomad-map-sticker${roleClass}${activeClass}" data-placement="${layoutItem.placement}" style="transform: ${transform};">
        <div class="nomad-map-sticker-row">
          <span class="nomad-map-sticker-icon">${escapeHtml(sticker.icon)}</span>
          <span class="nomad-map-sticker-title">${escapeHtml(sticker.name)}</span>
        </div>
        <div class="nomad-map-sticker-label">${escapeHtml(sticker.label)}</div>
        <div class="nomad-map-sticker-desc">${escapeHtml(sticker.description)}</div>
      </div>
    `,
    iconSize: [148, 78],
    iconAnchor: [74, 72],
    popupAnchor: [0, -64],
  });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
