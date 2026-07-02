"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { LatLngBoundsExpression, LatLngExpression } from "leaflet";
import { useEffect } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import { PLACES, getPlacesByIds } from "@/lib/siteData";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

type NomadMapProps = {
  routePlaceIds?: string[];
  focusedPlaceId?: string;
  showAllConnections?: boolean;
  onMarkerClick?: (placeId: string) => void;
};

type ImageImport = string | { src: string };

function getImageUrl(image: ImageImport) {
  return typeof image === "string" ? image : image.src;
}

const defaultIcon = L.icon({
  iconRetinaUrl: getImageUrl(markerIcon2x),
  iconUrl: getImageUrl(markerIcon),
  shadowUrl: getImageUrl(markerShadow),
  iconSize: [32, 42],
  iconAnchor: [16, 42],
});

L.Marker.prototype.options.icon = defaultIcon;

function MapFocus({ bounds }: { bounds: LatLngBoundsExpression }) {
  const map = useMap();

  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 9 });
    }
  }, [bounds, map]);

  return null;
}

export default function Map({
  routePlaceIds = [],
  focusedPlaceId,
  showAllConnections = false,
  onMarkerClick,
}: NomadMapProps) {
  const routePlaces = getPlacesByIds(routePlaceIds);
  const activePlaces = routePlaces.length > 0 ? routePlaces : PLACES;
  const routeLine: LatLngExpression[] = routePlaces.map((place) => place.coordinates);
  const bounds: LatLngBoundsExpression = activePlaces.map((place) => place.coordinates);
  const hubPlace = PLACES.find((place) => place.id === "almaty") ?? PLACES[0];
  const connectionLines: LatLngExpression[][] = showAllConnections
    ? PLACES.filter((place) => place.id !== hubPlace.id).map((place) => [
        hubPlace.coordinates,
        place.coordinates,
      ])
    : [];

  return (
    <div className="h-[520px] w-full overflow-hidden rounded-[22px] border border-white/10 bg-white/5 shadow-[inset_0_0_80px_rgba(15,23,42,0.15)]">
      <MapContainer
        bounds={bounds}
        boundsOptions={{ padding: [48, 48] }}
        className="h-full w-full"
        scrollWheelZoom={false}
      >
        <MapFocus bounds={bounds} />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {showAllConnections ? (
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
              color: "#0f766e",
              opacity: 0.9,
              weight: 5,
              dashArray: "8 5",
            }}
          />
        ) : null}

        {PLACES.map((place) => {
          const isActive =
            showAllConnections ||
            routePlaceIds.length === 0 ||
            routePlaceIds.includes(place.id) ||
            focusedPlaceId === place.id;

          return (
            <Marker
              key={place.id}
              icon={defaultIcon}
              position={place.coordinates}
              opacity={isActive ? 1 : 0.35}
              eventHandlers={{
                click: () => onMarkerClick?.(place.id),
              }}
            >
              <Popup>
                <div className="space-y-3">
                  <strong className="block text-base">{place.name}</strong>
                  <p className="text-sm leading-5 text-slate-700">{place.desc}</p>
                  <p className="text-xs text-slate-600">Region: {place.region}</p>
                  <p className="text-xs text-slate-600">Best time: {place.bestTime}</p>
                  <a
                    href={`/locations/${place.id}`}
                    className="inline-flex rounded-full bg-[#0f766e] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#134e4a]"
                  >
                    View guide
                  </a>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
