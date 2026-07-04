import type { MapSticker } from "@/lib/travelTypes";

export type MapScreenPoint = {
  x: number;
  y: number;
};

export type MapScreenSize = {
  x: number;
  y: number;
};

export type MapMarkerPlacement = "top" | "bottom" | "left" | "right";

export type MapMarkerLayoutItem = {
  id: string;
  kind: "sticker" | "cluster";
  sticker: MapSticker;
  memberStickers: MapSticker[];
  coordinates: [number, number];
  offsetX: number;
  offsetY: number;
  placement: MapMarkerPlacement;
  opacity: number;
  zIndexOffset: number;
  isSelected: boolean;
};

type LayoutRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type DisplayCandidate = {
  id: string;
  kind: "sticker" | "cluster";
  sticker: MapSticker;
  memberStickers: MapSticker[];
  coordinates: [number, number];
  point: MapScreenPoint;
  isSelected: boolean;
};

type LayoutCandidate = {
  rect: LayoutRect;
  offsetX: number;
  offsetY: number;
  placement: MapMarkerPlacement;
  score: number;
};

const stickerWidth = 148;
const stickerHeight = 78;
const currentAnchorX = 74;
const currentAnchorY = 72;
const edgePadding = 10;

export function buildMapMarkerLayout({
  stickers,
  points,
  mapSize,
  zoom,
  focusedPlaceId,
}: {
  stickers: MapSticker[];
  points: Record<string, MapScreenPoint>;
  mapSize: MapScreenSize;
  zoom: number;
  focusedPlaceId?: string;
}): MapMarkerLayoutItem[] {
  if (stickers.length === 0 || mapSize.x <= 0 || mapSize.y <= 0) {
    return [];
  }

  const displayItems = buildDisplayItems(stickers, points, zoom, focusedPlaceId);
  const selectedPoint = focusedPlaceId
    ? points[`sticker-${focusedPlaceId}`]
    : undefined;
  const separationStrength = getSeparationStrength(zoom);
  const placedRects: LayoutRect[] = [];

  return displayItems
    .sort(sortDisplayItems)
    .map((item, index) => {
      const layout = chooseLayout({
        item,
        placedRects,
        mapSize,
        zoom,
        separationStrength,
      });

      placedRects.push(layout.rect);

      const baseOpacity = item.kind === "cluster" || item.sticker.isActive ? 1 : 0.42;
      const selectedDistance =
        selectedPoint && !item.isSelected
          ? getDistance(item.point, selectedPoint)
          : Number.POSITIVE_INFINITY;
      const nearbySelectedOpacity = selectedDistance < 210 ? 0.58 : 1;

      return {
        id: item.id,
        kind: item.kind,
        sticker: item.sticker,
        memberStickers: item.memberStickers,
        coordinates: item.coordinates,
        offsetX: layout.offsetX,
        offsetY: layout.offsetY,
        placement: layout.placement,
        opacity: Math.min(baseOpacity, nearbySelectedOpacity),
        zIndexOffset: getZIndexOffset(item, index),
        isSelected: item.isSelected,
      };
    });
}

export function buildDefaultMapMarkerLayout(stickers: MapSticker[]): MapMarkerLayoutItem[] {
  return stickers.map((sticker) => ({
    id: sticker.id,
    kind: "sticker",
    sticker,
    memberStickers: [sticker],
    coordinates: sticker.coordinates,
    offsetX: 0,
    offsetY: 0,
    placement: "top",
    opacity: sticker.isActive ? 1 : 0.42,
    zIndexOffset:
      sticker.role === "destination" ? 900 : sticker.role === "start" ? 700 : 0,
    isSelected: false,
  }));
}

function buildDisplayItems(
  stickers: MapSticker[],
  points: Record<string, MapScreenPoint>,
  zoom: number,
  focusedPlaceId?: string
) {
  const clusters = buildClusters(stickers, points, zoom, focusedPlaceId);
  const items: DisplayCandidate[] = [];

  for (const group of clusters) {
    if (group.length === 1) {
      const sticker = group[0];
      const point = points[sticker.id];

      if (!point) {
        continue;
      }

      items.push({
        id: sticker.id,
        kind: "sticker",
        sticker,
        memberStickers: [sticker],
        coordinates: sticker.coordinates,
        point,
        isSelected: sticker.placeId === focusedPlaceId,
      });
      continue;
    }

    const clusterSticker = createClusterSticker(group);
    const point = getAveragePoint(group, points);

    items.push({
      id: clusterSticker.id,
      kind: "cluster",
      sticker: clusterSticker,
      memberStickers: group,
      coordinates: getAverageCoordinates(group),
      point,
      isSelected: false,
    });
  }

  return items;
}

function buildClusters(
  stickers: MapSticker[],
  points: Record<string, MapScreenPoint>,
  zoom: number,
  focusedPlaceId?: string
) {
  const clusterRadius = getClusterRadius(zoom);
  const minClusterSize = getMinClusterSize(zoom);

  if (clusterRadius <= 0) {
    return stickers.map((sticker) => [sticker]);
  }

  const clusters: MapSticker[][] = [];
  const visited = new Set<string>();
  const candidates = stickers.filter((sticker) => Boolean(points[sticker.id]));

  for (const sticker of candidates) {
    if (visited.has(sticker.id)) {
      continue;
    }

    if (sticker.placeId === focusedPlaceId || sticker.role !== "place") {
      visited.add(sticker.id);
      clusters.push([sticker]);
      continue;
    }

    const group: MapSticker[] = [sticker];
    visited.add(sticker.id);

    for (let cursor = 0; cursor < group.length; cursor += 1) {
      const current = group[cursor];
      const currentPoint = points[current.id];

      for (const candidate of candidates) {
        if (
          visited.has(candidate.id) ||
          candidate.placeId === focusedPlaceId ||
          candidate.role !== "place"
        ) {
          continue;
        }

        const candidatePoint = points[candidate.id];

        if (getDistance(currentPoint, candidatePoint) <= clusterRadius) {
          visited.add(candidate.id);
          group.push(candidate);
        }
      }
    }

    if (group.length >= minClusterSize) {
      clusters.push(group);
    } else {
      clusters.push(...group.map((item) => [item]));
    }
  }

  return clusters;
}

function chooseLayout({
  item,
  placedRects,
  mapSize,
  zoom,
  separationStrength,
}: {
  item: DisplayCandidate;
  placedRects: LayoutRect[];
  mapSize: MapScreenSize;
  zoom: number;
  separationStrength: number;
}) {
  const preferredPlacements = getPlacementOrder(item.point, mapSize, separationStrength);
  const shifts = getOffsetCandidates(separationStrength, item.isSelected);
  let bestCandidate: LayoutCandidate | null = null;

  for (const placement of preferredPlacements) {
    for (const shift of shifts) {
      const desiredRect = buildRectForPlacement(item.point, placement, shift);
      const clampedRect = clampRect(desiredRect, mapSize);
      const score =
        getCollisionScore(clampedRect, placedRects) +
        getClampPenalty(desiredRect, clampedRect) +
        Math.abs(shift.x) * 0.08 +
        Math.abs(shift.y) * 0.08 +
        getPlacementPenalty(placement, preferredPlacements[0], zoom);

      const candidate = {
        rect: clampedRect,
        offsetX: clampedRect.x - (item.point.x - currentAnchorX),
        offsetY: clampedRect.y - (item.point.y - currentAnchorY),
        placement,
        score,
      };

      if (!bestCandidate || candidate.score < bestCandidate.score) {
        bestCandidate = candidate;
      }

      if (score <= 0.1) {
        return candidate;
      }
    }
  }

  return bestCandidate ?? {
    rect: clampRect(buildRectForPlacement(item.point, "top", { x: 0, y: 0 }), mapSize),
    offsetX: 0,
    offsetY: 0,
    placement: "top" as const,
    score: 0,
  };
}

function getPlacementOrder(
  point: MapScreenPoint,
  mapSize: MapScreenSize,
  separationStrength: number
): MapMarkerPlacement[] {
  if (separationStrength < 0.16) {
    return ["top", "bottom", "right", "left"];
  }

  const availableSpace: Record<MapMarkerPlacement, number> = {
    top: point.y,
    bottom: mapSize.y - point.y,
    left: point.x,
    right: mapSize.x - point.x,
  };

  return (Object.keys(availableSpace) as MapMarkerPlacement[]).sort(
    (first, second) => availableSpace[second] - availableSpace[first]
  );
}

function getOffsetCandidates(separationStrength: number, isSelected: boolean) {
  if (isSelected || separationStrength <= 0) {
    return [{ x: 0, y: 0 }];
  }

  const small = Math.round(24 * separationStrength);
  const medium = Math.round(44 * separationStrength);
  const large = Math.round(64 * separationStrength);

  return [
    { x: 0, y: 0 },
    { x: small, y: 0 },
    { x: -small, y: 0 },
    { x: 0, y: small },
    { x: 0, y: -small },
    { x: medium, y: small },
    { x: -medium, y: small },
    { x: medium, y: -small },
    { x: -medium, y: -small },
    { x: large, y: 0 },
    { x: -large, y: 0 },
    { x: 0, y: large },
    { x: 0, y: -large },
  ];
}

function buildRectForPlacement(
  point: MapScreenPoint,
  placement: MapMarkerPlacement,
  shift: MapScreenPoint
): LayoutRect {
  const gap = 10;

  if (placement === "bottom") {
    return {
      x: point.x - stickerWidth / 2 + shift.x,
      y: point.y + gap + shift.y,
      width: stickerWidth,
      height: stickerHeight,
    };
  }

  if (placement === "left") {
    return {
      x: point.x - stickerWidth - gap + shift.x,
      y: point.y - stickerHeight / 2 + shift.y,
      width: stickerWidth,
      height: stickerHeight,
    };
  }

  if (placement === "right") {
    return {
      x: point.x + gap + shift.x,
      y: point.y - stickerHeight / 2 + shift.y,
      width: stickerWidth,
      height: stickerHeight,
    };
  }

  return {
    x: point.x - stickerWidth / 2 + shift.x,
    y: point.y - stickerHeight - gap + shift.y,
    width: stickerWidth,
    height: stickerHeight,
  };
}

function clampRect(rect: LayoutRect, mapSize: MapScreenSize): LayoutRect {
  return {
    ...rect,
    x: clamp(rect.x, edgePadding, Math.max(edgePadding, mapSize.x - rect.width - edgePadding)),
    y: clamp(rect.y, edgePadding, Math.max(edgePadding, mapSize.y - rect.height - edgePadding)),
  };
}

function getCollisionScore(rect: LayoutRect, placedRects: LayoutRect[]) {
  return placedRects.reduce((score, placedRect) => {
    const overlapWidth = Math.max(
      0,
      Math.min(rect.x + rect.width, placedRect.x + placedRect.width) -
        Math.max(rect.x, placedRect.x)
    );
    const overlapHeight = Math.max(
      0,
      Math.min(rect.y + rect.height, placedRect.y + placedRect.height) -
        Math.max(rect.y, placedRect.y)
    );

    return score + overlapWidth * overlapHeight;
  }, 0);
}

function getClampPenalty(rect: LayoutRect, clampedRect: LayoutRect) {
  return (Math.abs(rect.x - clampedRect.x) + Math.abs(rect.y - clampedRect.y)) * 12;
}

function getPlacementPenalty(
  placement: MapMarkerPlacement,
  preferredPlacement: MapMarkerPlacement,
  zoom: number
) {
  if (placement === preferredPlacement) {
    return 0;
  }

  return zoom >= 10.75 && placement !== "top" ? 180 : 18;
}

function sortDisplayItems(first: DisplayCandidate, second: DisplayCandidate) {
  return getDisplayPriority(first) - getDisplayPriority(second);
}

function getDisplayPriority(item: DisplayCandidate) {
  if (item.isSelected) return 0;
  if (item.sticker.role === "destination") return 1;
  if (item.sticker.role === "start") return 2;
  if (item.kind === "cluster") return 3;
  if (item.sticker.isActive) return 4;
  return 5;
}

function getZIndexOffset(item: DisplayCandidate, index: number) {
  if (item.isSelected) return 1400;
  if (item.sticker.role === "destination") return 1000;
  if (item.sticker.role === "start") return 800;
  if (item.kind === "cluster") return 650;
  return 200 - index;
}

function getClusterRadius(zoom: number) {
  if (zoom >= 10.25) {
    return 0;
  }

  return 48 + getSeparationStrength(zoom) * 52;
}

function getMinClusterSize(zoom: number) {
  if (zoom < 8) {
    return 4;
  }

  return 5;
}

function getSeparationStrength(zoom: number) {
  if (zoom >= 11.5) {
    return 0;
  }

  if (zoom <= 8) {
    return 1;
  }

  return (11.5 - zoom) / 3.5;
}

function createClusterSticker(group: MapSticker[]): MapSticker {
  const representative = group[0];

  return {
    ...representative,
    id: `cluster-${group.map((sticker) => sticker.placeId).sort().join("-")}`,
    placeId: representative.placeId,
    name: `${group.length} places`,
    label: "Cluster",
    description: "Zoom in to expand",
    icon: "+",
    role: "place",
    isActive: true,
  };
}

function getAveragePoint(group: MapSticker[], points: Record<string, MapScreenPoint>) {
  const totals = group.reduce(
    (sum, sticker) => {
      const point = points[sticker.id];
      return {
        x: sum.x + point.x,
        y: sum.y + point.y,
      };
    },
    { x: 0, y: 0 }
  );

  return {
    x: totals.x / group.length,
    y: totals.y / group.length,
  };
}

function getAverageCoordinates(group: MapSticker[]): [number, number] {
  const totals = group.reduce(
    (sum, sticker) => ({
      lat: sum.lat + sticker.coordinates[0],
      lng: sum.lng + sticker.coordinates[1],
    }),
    { lat: 0, lng: 0 }
  );

  return [totals.lat / group.length, totals.lng / group.length];
}

function getDistance(first: MapScreenPoint, second: MapScreenPoint) {
  return Math.hypot(first.x - second.x, first.y - second.y);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
