import type { TravelPlace } from "@/lib/siteData";

export type Location = TravelPlace;

export type RouteStop = {
  id: string;
  name: string;
  coordinates: [number, number];
  note: string;
};

export type RoutePlan = {
  title: string;
  days: number;
  difficulty: string;
  stops: RouteStop[];
  steps: string[];
};

export type AssistantPlaceRecommendation = {
  id: string;
  name: string;
  category: string;
  reason: string;
};

export type AssistantResponse = {
  recommendedPlaces: AssistantPlaceRecommendation[];
  routePlan: RoutePlan;
  explanation: string;
  warnings: string[];
  estimatedTime: string;
  transportTips: string[];
};

export type MapSticker = {
  id: string;
  placeId: string;
  name: string;
  coordinates: [number, number];
  category: string;
  icon: string;
  label: string;
  description: string;
  role: "place" | "start" | "destination";
  isActive: boolean;
};
