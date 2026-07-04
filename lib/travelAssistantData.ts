export type TravelAssistantPlaceId =
  | "bozzhyra"
  | "sherkala"
  | "torysh"
  | "tuzbair"
  | "beket-ata";

export type RecommendedTransport = "Sedan" | "Crossover" | "SUV" | "Walking";

export type TravelAssistantScenario =
  | "route"
  | "hotels"
  | "taxi"
  | "safety"
  | "offline"
  | "planner";

export type TripDuration = "1-day" | "2-days" | "weekend";
export type TripInterest = "nature" | "history" | "family" | "extreme";
export type TripBudget = "budget" | "standard" | "comfort";

export type TravelAssistantPlace = {
  id: TravelAssistantPlaceId;
  name: string;
  label: string;
  category: string;
  coordinates: [number, number];
  description: string;
  routeTitle: string;
  distanceFromAktauKm: number;
  estimatedTime: string;
  roadDifficulty: string;
  recommendedTransport: RecommendedTransport;
  ordinaryCarAccess: boolean;
  hardToAccess: boolean;
  routePoints: string[];
  safetyTips: string[];
  packingList: string[];
  offlinePack: string[];
  taxi: {
    estimatedPrice: string;
    waitingTime: string;
    demoDriverNote: string;
  };
};

export type StayOption = {
  placeId: TravelAssistantPlaceId;
  name: string;
  type: "Hotel" | "Guest house" | "Camp" | "Eco stay";
  distance: string;
  price: string;
  note: string;
};

export type EmergencyContact = {
  label: string;
  value: string;
  note: string;
};

export type PreparedItinerary = {
  id: string;
  title: string;
  duration: TripDuration;
  interest: TripInterest;
  budget: TripBudget;
  summary: string;
  transport: string;
  stops: TravelAssistantPlaceId[];
  days: string[];
};

export const defaultAssistantPlaceId: TravelAssistantPlaceId = "bozzhyra";

export const travelAssistantPlaces: TravelAssistantPlace[] = [
  {
    id: "bozzhyra",
    name: "Bozzhyra",
    label: "White cliffs",
    category: "Nature / desert",
    coordinates: [43.415, 54.071],
    description:
      "Remote chalk cliffs, wide desert silence and one of Mangystau's strongest sunset viewpoints.",
    routeTitle: "Aktau -> Zhanaozen supplies -> Bozzhyra",
    distanceFromAktauKm: 300,
    estimatedTime: "5-6 hours one way",
    roadDifficulty: "Hard off-road",
    recommendedTransport: "SUV",
    ordinaryCarAccess: false,
    hardToAccess: true,
    routePoints: ["Aktau", "Zhanaozen", "Beket-Ata junction", "Bozzhyra viewpoint"],
    safetyTips: [
      "Start early and avoid arriving after dark.",
      "Take a local driver-guide for off-road navigation.",
      "Carry extra water, food, power bank and offline maps.",
    ],
    packingList: ["5+ liters of water per person", "Sun hat", "Warm layer", "Offline map", "First-aid kit"],
    offlinePack: ["Offline Google/Apple map area", "Driver contact", "GPS coordinates", "Sunset buffer"],
    taxi: {
      estimatedPrice: "95 000 - 140 000 KZT",
      waitingTime: "20-45 min for driver confirmation",
      demoDriverNote: "Private 4x4 driver recommended; confirm return pickup and viewpoints.",
    },
  },
  {
    id: "sherkala",
    name: "Sherkala Mountain",
    label: "Desert mountain",
    category: "Nature / history",
    coordinates: [44.239, 52.006],
    description:
      "A standalone desert mountain with broad steppe views and strong photo stops near golden hour.",
    routeTitle: "Aktau -> Shakpak-Ata -> Sherkala",
    distanceFromAktauKm: 170,
    estimatedTime: "2.5-3 hours one way",
    roadDifficulty: "Moderate desert road",
    recommendedTransport: "Crossover",
    ordinaryCarAccess: true,
    hardToAccess: false,
    routePoints: ["Aktau", "Shakpak-Ata", "Sherkala viewpoint"],
    safetyTips: [
      "Avoid steep climbing without a guide.",
      "Keep distance from loose rock edges.",
      "Plan the visit for morning or late afternoon light.",
    ],
    packingList: ["Water", "Windproof layer", "Comfortable shoes", "Phone tripod", "Snacks"],
    offlinePack: ["Saved route from Aktau", "Viewpoint coordinates", "Fuel stop note"],
    taxi: {
      estimatedPrice: "45 000 - 70 000 KZT",
      waitingTime: "15-30 min for driver confirmation",
      demoDriverNote: "Crossover is comfortable; ask the driver to wait during the viewpoint stop.",
    },
  },
  {
    id: "torysh",
    name: "Torysh Valley",
    label: "Stone spheres",
    category: "Nature / family",
    coordinates: [44.107, 51.769],
    description:
      "A playful geology stop known for natural stone spheres and easy short walks on uneven ground.",
    routeTitle: "Aktau -> Torysh -> Sherkala",
    distanceFromAktauKm: 120,
    estimatedTime: "2-2.5 hours one way",
    roadDifficulty: "Easy to moderate",
    recommendedTransport: "Crossover",
    ordinaryCarAccess: true,
    hardToAccess: false,
    routePoints: ["Aktau", "Torysh Valley", "Sherkala optional stop"],
    safetyTips: [
      "Keep children close around uneven stones.",
      "Do not move or damage the stone formations.",
      "Avoid midday heat during summer months.",
    ],
    packingList: ["Water", "Closed shoes", "Sun protection", "Light snacks", "Wet wipes"],
    offlinePack: ["Saved Torysh pin", "Family route note", "Return timing"],
    taxi: {
      estimatedPrice: "35 000 - 55 000 KZT",
      waitingTime: "10-25 min for driver confirmation",
      demoDriverNote: "Good half-day request from Aktau; combine with Sherkala if time allows.",
    },
  },
  {
    id: "tuzbair",
    name: "Tuzbair Salt Flats",
    label: "Salt cliffs",
    category: "Nature / extreme",
    coordinates: [44.096, 53.333],
    description:
      "White cliffs, bright salt-pan textures and a remote landscape that needs careful road timing.",
    routeTitle: "Aktau -> Beineu road -> Tuzbair",
    distanceFromAktauKm: 250,
    estimatedTime: "4-5 hours one way",
    roadDifficulty: "Hard off-road after rain",
    recommendedTransport: "SUV",
    ordinaryCarAccess: false,
    hardToAccess: true,
    routePoints: ["Aktau", "Fuel stop", "Tuzbair upper view", "Salt flat edge"],
    safetyTips: [
      "Avoid the salt pan if the surface looks wet or soft.",
      "Use sunglasses because reflected light is strong.",
      "Keep a weather buffer and do not drive unknown tracks alone.",
    ],
    packingList: ["Sunglasses", "Sunscreen", "Water reserve", "Offline map", "Tow strap with driver"],
    offlinePack: ["Upper viewpoint pin", "Weather check", "Fuel plan", "Return buffer"],
    taxi: {
      estimatedPrice: "80 000 - 120 000 KZT",
      waitingTime: "20-45 min for driver confirmation",
      demoDriverNote: "Request SUV only and ask whether recent rain affected the track.",
    },
  },
  {
    id: "beket-ata",
    name: "Beket-Ata",
    label: "Pilgrimage site",
    category: "History / culture",
    coordinates: [43.595, 54.073],
    description:
      "A remote underground mosque and sacred pilgrimage stop often combined with Bozzhyra routes.",
    routeTitle: "Aktau -> Zhanaozen -> Beket-Ata",
    distanceFromAktauKm: 280,
    estimatedTime: "4.5-5.5 hours one way",
    roadDifficulty: "Remote desert road",
    recommendedTransport: "SUV",
    ordinaryCarAccess: false,
    hardToAccess: true,
    routePoints: ["Aktau", "Zhanaozen", "Beket-Ata parking area", "Pilgrimage path"],
    safetyTips: [
      "Dress respectfully and keep noise low.",
      "Carry water for the walking section.",
      "Confirm road condition and return timing with a local driver.",
    ],
    packingList: ["Respectful clothing", "Water", "Comfortable walking shoes", "Head covering", "Offline map"],
    offlinePack: ["Parking area pin", "Walking path note", "Driver contact", "Return schedule"],
    taxi: {
      estimatedPrice: "85 000 - 130 000 KZT",
      waitingTime: "20-45 min for driver confirmation",
      demoDriverNote: "SUV with a driver familiar with pilgrimage logistics is recommended.",
    },
  },
];

export const stayOptions: StayOption[] = [
  {
    placeId: "bozzhyra",
    name: "Bozzhyra Desert Camp",
    type: "Camp",
    distance: "Near viewpoint zone",
    price: "Demo: 35 000 KZT per person",
    note: "Confirm water, dinner and guide transfer before booking.",
  },
  {
    placeId: "bozzhyra",
    name: "Zhanaozen Guest Base",
    type: "Guest house",
    distance: "Route buffer stop",
    price: "Demo: 18 000 KZT per room",
    note: "Useful if you want to split the long road.",
  },
  {
    placeId: "sherkala",
    name: "Aktau City Hotel",
    type: "Hotel",
    distance: "Best base in Aktau",
    price: "Demo: 28 000 KZT per room",
    note: "Good for a day trip with return before evening.",
  },
  {
    placeId: "torysh",
    name: "Family Guest House Aktau",
    type: "Guest house",
    distance: "Aktau base",
    price: "Demo: 22 000 KZT per room",
    note: "Easy option for Torysh and Sherkala family loop.",
  },
  {
    placeId: "tuzbair",
    name: "Tuzbair Mobile Camp",
    type: "Camp",
    distance: "Seasonal remote camp",
    price: "Demo: 40 000 KZT per person",
    note: "Ask about road condition, meals and sleeping bags.",
  },
  {
    placeId: "beket-ata",
    name: "Pilgrim Rest Stop",
    type: "Eco stay",
    distance: "Route area",
    price: "Demo: donation / basic stay",
    note: "Expect simple conditions and respectful behavior.",
  },
];

export const emergencyContacts: EmergencyContact[] = [
  { label: "Emergency", value: "112", note: "Universal emergency number in Kazakhstan." },
  { label: "Police", value: "102", note: "Use for safety incidents or lost documents." },
  { label: "Ambulance", value: "103", note: "Medical emergency support." },
  { label: "Driver request demo", value: "+7 700 000 00 00", note: "Placeholder for future partner drivers." },
];

export const preparedItineraries: PreparedItinerary[] = [
  {
    id: "one-day-nature-standard",
    title: "One-day nature loop",
    duration: "1-day",
    interest: "nature",
    budget: "standard",
    summary: "A lighter day from Aktau with stone spheres, Sherkala views and a safe return.",
    transport: "Crossover with local driver",
    stops: ["torysh", "sherkala"],
    days: [
      "Morning: leave Aktau early for Torysh Valley and keep the walk short.",
      "Afternoon: continue to Sherkala for the main viewpoint.",
      "Evening: return to Aktau before dark and keep dinner flexible.",
    ],
  },
  {
    id: "two-days-history-standard",
    title: "Two-day history and desert route",
    duration: "2-days",
    interest: "history",
    budget: "standard",
    summary: "A cultural route that combines Beket-Ata with remote desert planning.",
    transport: "SUV with driver-guide",
    stops: ["beket-ata", "bozzhyra"],
    days: [
      "Day 1: prepare in Aktau, drive toward Beket-Ata and keep the visit respectful and slow.",
      "Day 2: visit Bozzhyra viewpoints in the calm part of the day, then return with buffer time.",
    ],
  },
  {
    id: "weekend-family-budget",
    title: "Weekend family loop",
    duration: "weekend",
    interest: "family",
    budget: "budget",
    summary: "A practical weekend that avoids the hardest roads and keeps stops short.",
    transport: "Crossover or arranged taxi",
    stops: ["torysh", "sherkala"],
    days: [
      "Day 1: Aktau coast, supplies and an easy sunset.",
      "Day 2: Torysh Valley in the morning and Sherkala photo stop after lunch.",
      "Day 3: optional slow breakfast, sea walk and return logistics.",
    ],
  },
  {
    id: "weekend-extreme-comfort",
    title: "Weekend extreme cliffs",
    duration: "weekend",
    interest: "extreme",
    budget: "comfort",
    summary: "A stronger SUV plan for travelers who want Tuzbair and Bozzhyra with less rushing.",
    transport: "Private SUV tour",
    stops: ["tuzbair", "bozzhyra", "beket-ata"],
    days: [
      "Day 1: leave Aktau with supplies and reach Tuzbair upper viewpoints.",
      "Day 2: Bozzhyra viewpoint schedule with sunset buffer and driver-guided tracks.",
      "Day 3: Beket-Ata or slower return depending on road and weather.",
    ],
  },
];

export function getAssistantPlaceById(id: string | null | undefined) {
  return travelAssistantPlaces.find((place) => place.id === id);
}

export function getStayOptions(placeId: TravelAssistantPlaceId) {
  const directMatches = stayOptions.filter((stay) => stay.placeId === placeId);
  return directMatches.length > 0 ? directMatches : stayOptions.slice(0, 2);
}

export function getPreparedItinerary(
  duration: TripDuration,
  budget: TripBudget,
  interest: TripInterest
) {
  return (
    preparedItineraries.find(
      (itinerary) =>
        itinerary.duration === duration &&
        itinerary.budget === budget &&
        itinerary.interest === interest
    ) ??
    preparedItineraries.find(
      (itinerary) => itinerary.duration === duration && itinerary.interest === interest
    ) ??
    preparedItineraries.find((itinerary) => itinerary.duration === duration) ??
    preparedItineraries[0]
  );
}
