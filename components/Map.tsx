"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import type { DivIcon, LatLngBoundsExpression, LatLngExpression } from "leaflet";
import { useCallback, useEffect, useId, useMemo, useState } from "react";
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
  showRouteLine?: boolean;
  visiblePlaceIds?: string[];
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

function MapAccessibility({
  label,
  descriptionId,
}: {
  label: string;
  descriptionId: string;
}) {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    container.setAttribute("role", "region");
    container.setAttribute("aria-label", label);
    container.setAttribute("aria-describedby", descriptionId);

    return () => {
      container.removeAttribute("role");
      container.removeAttribute("aria-label");
      container.removeAttribute("aria-describedby");
    };
  }, [descriptionId, label, map]);

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

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    map.flyToBounds(L.latLngBounds(coordinates), {
      animate: !reduceMotion,
      duration: reduceMotion ? 0 : 0.22,
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
                    Editorial score {profile.rating.toFixed(1)} / 5 · {profile.categoryLabel}
                  </p>
                  <p className="text-xs text-slate-600">Visit time: {profile.visitTime}</p>
                  <Link
                    href={`/locations/${place.id}`}
                    className="inline-flex rounded-full bg-[#0f766e] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#134e4a]"
                  >
                    View guide
                  </Link>
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
  showRouteLine = true,
  visiblePlaceIds,
  routeMode = "network",
  startPlaceId,
  destinationPlaceId,
  onMarkerClick,
}: NomadMapProps) {
  const { settings } = useSettings();
  const [tileLoadFailed, setTileLoadFailed] = useState(false);
  const [tileRetryKey, setTileRetryKey] = useState(0);
  const mapDescriptionId = useId();
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
  const stickers = useMemo(
    () =>
      showRouteLine
        ? routeState.stickers
        : routeState.stickers.map((sticker) => ({
            ...sticker,
            label: sticker.category,
            role: "place" as const,
          })),
    [routeState.stickers, showRouteLine]
  );
  const visibleStickers = useMemo(() => {
    if (visiblePlaceIds === undefined) return stickers;

    const visibleIds = new Set(visiblePlaceIds);
    return stickers.filter((sticker) => visibleIds.has(sticker.placeId));
  }, [stickers, visiblePlaceIds]);
  const hasSchematicLines =
    (showAllConnections && routeMode === "network") ||
    (showRouteLine && routeLine.length > 1);

  return (
    <div
      className="relative h-[400px] w-full overflow-hidden rounded-[18px] border border-white/10 bg-white/5 shadow-[inset_0_0_80px_rgba(15,23,42,0.15)] sm:h-[520px] sm:rounded-[22px]"
    >
      <p id={mapDescriptionId} className="sr-only">
        Interactive map with {visibleStickers.length} destination markers. Use the arrow keys
        to pan the map and the plus or minus keys to zoom.
      </p>
      <MapContainer
        bounds={bounds}
        boundsOptions={{ padding: [48, 48] }}
        className="h-full w-full"
        preferCanvas
        scrollWheelZoom={false}
      >
        <MapAccessibility
          label={routeMode === "route" ? "Interactive travel route map" : "Interactive travel map"}
          descriptionId={mapDescriptionId}
        />
        <MapFocus bounds={bounds} routeMode={routeMode} />
        <TileLayer
          key={`${settings.mapStyle}-${tileRetryKey}`}
          url={tileLayer.url}
          attribution={tileLayer.attribution}
          eventHandlers={{
            loading: () => setTileLoadFailed(false),
            tileerror: () => setTileLoadFailed(true),
          }}
        />

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
        ) : showRouteLine && routeLine.length > 1 ? (
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
          stickers={visibleStickers}
          focusedPlaceId={focusedPlaceId}
          onMarkerClick={onMarkerClick}
        />
      </MapContainer>

      {hasSchematicLines ? (
        <p className="pointer-events-none absolute right-3 top-3 z-[500] max-w-[calc(100%-5rem)] rounded-full border border-white/12 bg-[#0b0b0b]/84 px-3 py-2 text-[11px] font-medium text-white/72 shadow-lg backdrop-blur-md">
          Schematic route · lines connect stops, not turn-by-turn roads
        </p>
      ) : null}

      {tileLoadFailed ? (
        <div
          role="status"
          className="absolute inset-x-3 bottom-3 z-[600] flex flex-col gap-3 rounded-2xl border border-amber-200/20 bg-[#15110c]/94 p-3 text-xs text-amber-50 shadow-xl backdrop-blur-md sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="leading-5">
            Map background is unavailable. The visible pins and route lines are planning references only.
          </p>
          <button
            type="button"
            onClick={() => {
              setTileLoadFailed(false);
              setTileRetryKey((value) => value + 1);
            }}
            className="btn shrink-0 justify-center"
          >
            Retry map
          </button>
        </div>
      ) : null}
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
