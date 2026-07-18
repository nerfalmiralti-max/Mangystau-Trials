export type Coordinates = [number, number];

const earthRadiusKm = 6371;

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function getHaversineDistanceKm(from: Coordinates, to: Coordinates) {
  const [fromLat, fromLng] = from;
  const [toLat, toLng] = to;
  const deltaLat = toRadians(toLat - fromLat);
  const deltaLng = toRadians(toLng - fromLng);
  const lat1 = toRadians(fromLat);
  const lat2 = toRadians(toLat);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistanceKm(distanceKm: number) {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }

  if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)} km`;
  }

  return `${Math.round(distanceKm)} km`;
}

export function sortByDistance<T>(
  items: T[],
  origin: Coordinates,
  getCoordinates: (item: T) => Coordinates
) {
  return items
    .map((item) => {
      const distanceFromUserKm = getHaversineDistanceKm(origin, getCoordinates(item));

      return {
        ...item,
        distanceFromUserKm,
        formattedDistanceFromUser: formatDistanceKm(distanceFromUserKm),
      };
    })
    .sort((a, b) => a.distanceFromUserKm - b.distanceFromUserKm);
}

export function buildGoogleMapsDirectionsUrl(destination: Coordinates, origin?: Coordinates) {
  const [destinationLat, destinationLng] = destination;
  const destinationParam = `${destinationLat},${destinationLng}`;
  const originParam = origin ? `&origin=${origin[0]},${origin[1]}` : "";

  return `https://www.google.com/maps/dir/?api=1${originParam}&destination=${destinationParam}&travelmode=driving`;
}

export function buildGoogleMapsRouteUrl(stops: Coordinates[]) {
  if (stops.length === 0) {
    return "https://www.google.com/maps";
  }

  if (stops.length === 1) {
    return buildGoogleMapsDirectionsUrl(stops[0]);
  }

  const origin = stops[0];
  const destination = stops.at(-1) ?? stops[0];
  const waypoints = stops.slice(1, -1);
  const params = new URLSearchParams({
    api: "1",
    origin: origin.join(","),
    destination: destination.join(","),
    travelmode: "driving",
  });

  if (waypoints.length > 0) {
    params.set("waypoints", waypoints.map((coordinates) => coordinates.join(",")).join("|"));
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
