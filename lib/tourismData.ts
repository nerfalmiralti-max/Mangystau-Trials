import { PLACES, type TravelPlace } from "@/lib/siteData";

export type TourismFilterId =
  | "nature"
  | "canyons"
  | "history"
  | "sea"
  | "family"
  | "popular";

export type PlaceReview = {
  id: string;
  author: string;
  date: string;
  rating: number;
  title: string;
  text: string;
  tripType: string;
};

export type PlaceTourismProfile = {
  id: string;
  photo: string | null;
  rating: number;
  reviewCount: number;
  popularityScore: number;
  distanceFromAktauKm: number;
  categoryLabel: string;
  filters: TourismFilterId[];
  visitTime: string;
  seoDescription: string;
  highlights: string[];
  touristTips: string[];
  reviews: PlaceReview[];
};

export type PopularTourRoute = {
  id: string;
  title: string;
  distance: string;
  duration: string;
  placeIds: string[];
  points: string[];
  note: string;
};

export const TOURISM_FILTERS: { id: TourismFilterId; label: string }[] = [
  { id: "nature", label: "\u043f\u0440\u0438\u0440\u043e\u0434\u0430" },
  { id: "canyons", label: "\u043a\u0430\u043d\u044c\u043e\u043d\u044b" },
  { id: "history", label: "\u0438\u0441\u0442\u043e\u0440\u0438\u044f" },
  { id: "sea", label: "\u043c\u043e\u0440\u0435" },
  {
    id: "family",
    label: "\u0441\u0435\u043c\u0435\u0439\u043d\u044b\u0439 \u043e\u0442\u0434\u044b\u0445",
  },
  {
    id: "popular",
    label: "\u043f\u043e\u043f\u0443\u043b\u044f\u0440\u043d\u043e\u0435",
  },
];

export const MANGYSTAU_PLACE_IDS = [
  "aktau",
  "bozzhyra",
  "sherkala",
  "torysh",
  "shakpak-ata",
  "caspian-sea",
  "tuzbair",
];

const CATEGORY_LABELS = {
  nature: "\u043f\u0440\u0438\u0440\u043e\u0434\u0430",
  canyons: "\u043a\u0430\u043d\u044c\u043e\u043d\u044b",
  history: "\u0438\u0441\u0442\u043e\u0440\u0438\u044f",
  sea: "\u043c\u043e\u0440\u0435",
  popular: "\u043f\u043e\u043f\u0443\u043b\u044f\u0440\u043d\u043e\u0435",
} as const;

const PLACE_TOURISM: Record<string, PlaceTourismProfile> = {
  aktau: {
    id: "aktau",
    photo: "/locations/photos/caspian-sea.jpg",
    rating: 4.6,
    reviewCount: 241,
    popularityScore: 86,
    distanceFromAktauKm: 0,
    categoryLabel: CATEGORY_LABELS.sea,
    filters: ["sea", "family", "popular"],
    visitTime: "1 day",
    seoDescription:
      "Aktau travel guide for Mangystau routes, Caspian Sea sunsets, local logistics, ratings, reviews and route planning.",
    highlights: [
      "Best base for Mangystau driver-guides",
      "Caspian sunsets and city logistics in one stop",
      "Easy start for family-friendly coastal time",
    ],
    touristTips: [
      "Buy water, snacks, fuel and offline maps before leaving Aktau.",
      "Use the city as a calm first night before remote desert travel.",
      "Keep one evening free for the Caspian shoreline and sunset.",
    ],
    reviews: [
      {
        id: "aktau-review-1",
        author: "Aida K.",
        date: "2026-05-18",
        rating: 5,
        title: "Perfect starting point",
        text: "We used Aktau for supplies, guide pickup and a quiet sea evening before Bozzhyra. It made the whole trip easier.",
        tripType: "Couple",
      },
      {
        id: "aktau-review-2",
        author: "Mikhail R.",
        date: "2026-04-07",
        rating: 4.5,
        title: "Good logistics hub",
        text: "Not the wildest stop, but very practical. The coast is beautiful at sunset and the city is useful before long roads.",
        tripType: "Friends",
      },
    ],
  },
  bozzhyra: {
    id: "bozzhyra",
    photo: "/locations/photos/bozzhyra.jpg",
    rating: 4.9,
    reviewCount: 318,
    popularityScore: 99,
    distanceFromAktauKm: 315,
    categoryLabel: CATEGORY_LABELS.canyons,
    filters: ["nature", "canyons", "popular"],
    visitTime: "2 days",
    seoDescription:
      "Bozzhyra guide with white cliffs, route timing, rating, tourist reviews, coordinates and 4x4 planning tips.",
    highlights: [
      "White cliffs and huge desert scale",
      "Best with sunrise or sunset viewpoints",
      "Remote route that needs a 4x4 plan",
    ],
    touristTips: [
      "Travel with a local driver-guide and a reliable 4x4.",
      "Carry extra water, snacks, first-aid basics and warm evening layers.",
      "Avoid cliff edges in wind and do not drive off existing tracks.",
    ],
    reviews: [
      {
        id: "bozzhyra-review-1",
        author: "Dana S.",
        date: "2026-05-29",
        rating: 5,
        title: "Unreal landscape",
        text: "The cliffs looked different every hour. It is not a casual day trip, but with a guide it was the highlight of Kazakhstan.",
        tripType: "Adventure",
      },
      {
        id: "bozzhyra-review-2",
        author: "Timur A.",
        date: "2026-04-12",
        rating: 4.8,
        title: "Worth the long road",
        text: "Go prepared and keep the schedule flexible. Sunset over the chalk cliffs was absolutely worth the drive.",
        tripType: "Friends",
      },
    ],
  },
  sherkala: {
    id: "sherkala",
    photo: "/locations/photos/sherkala.jpg",
    rating: 4.8,
    reviewCount: 184,
    popularityScore: 90,
    distanceFromAktauKm: 180,
    categoryLabel: CATEGORY_LABELS.nature,
    filters: ["nature", "history", "popular"],
    visitTime: "2-4 hours",
    seoDescription:
      "Sherkala Mountain guide with rating, reviews, route ideas from Aktau, visit timing and tourist safety tips.",
    highlights: [
      "Fortress-like mountain silhouette",
      "Strong photo stop on the road from Aktau",
      "Good pairing with Shakpak-Ata or Torysh",
    ],
    touristTips: [
      "Arrive early or late for softer light and less heat.",
      "Do not climb steep loose sections without local advice.",
      "Bring sturdy shoes because the ground can be sharp and uneven.",
    ],
    reviews: [
      {
        id: "sherkala-review-1",
        author: "Olga N.",
        date: "2026-05-02",
        rating: 4.8,
        title: "Short and memorable",
        text: "A beautiful stop that does not need the whole day. The mountain shape is even more impressive in person.",
        tripType: "Family",
      },
      {
        id: "sherkala-review-2",
        author: "Nursultan T.",
        date: "2026-03-30",
        rating: 4.7,
        title: "Great road break",
        text: "We visited between Aktau and the deeper desert route. The stop gave the day a strong visual moment.",
        tripType: "Solo",
      },
    ],
  },
  torysh: {
    id: "torysh",
    photo: "/locations/photos/torysh.jpg",
    rating: 4.7,
    reviewCount: 126,
    popularityScore: 82,
    distanceFromAktauKm: 125,
    categoryLabel: CATEGORY_LABELS.nature,
    filters: ["nature", "family", "popular"],
    visitTime: "2-3 hours",
    seoDescription:
      "Torysh Valley guide with stone spheres, family-friendly route timing, rating, reviews and practical Mangystau tips.",
    highlights: [
      "Stone spheres scattered across the valley",
      "Easy walk compared with deeper desert viewpoints",
      "Good for families who want unusual geology",
    ],
    touristTips: [
      "Visit in the morning for cooler walking conditions.",
      "Do not climb or move the stone formations.",
      "Combine with Sherkala if road timing and weather are comfortable.",
    ],
    reviews: [
      {
        id: "torysh-review-1",
        author: "Elena V.",
        date: "2026-06-04",
        rating: 4.7,
        title: "Kids loved it",
        text: "The landscape is unusual and easy to explore. We kept the visit short and it worked well with children.",
        tripType: "Family",
      },
      {
        id: "torysh-review-2",
        author: "Arman B.",
        date: "2026-04-21",
        rating: 4.6,
        title: "Strange and beautiful",
        text: "The stone balls make the valley feel like a natural museum. Bring water and keep enough time for photos.",
        tripType: "Friends",
      },
    ],
  },
  "shakpak-ata": {
    id: "shakpak-ata",
    photo: "/locations/photos/shakpak-ata.jpg",
    rating: 4.6,
    reviewCount: 91,
    popularityScore: 76,
    distanceFromAktauKm: 130,
    categoryLabel: CATEGORY_LABELS.history,
    filters: ["history", "popular"],
    visitTime: "2-3 hours",
    seoDescription:
      "Shakpak-Ata guide with history, rock-cut mosque context, route tips, rating, reviews and responsible travel advice.",
    highlights: [
      "Rock-cut mosque and quiet heritage atmosphere",
      "Meaningful cultural stop before desert routes",
      "Works well with Sherkala on a one-day loop",
    ],
    touristTips: [
      "Dress respectfully and keep noise low around the site.",
      "Ask a local guide for context before entering.",
      "Avoid touching fragile stone surfaces or carved details.",
    ],
    reviews: [
      {
        id: "shakpak-review-1",
        author: "Saule M.",
        date: "2026-05-11",
        rating: 4.6,
        title: "Quiet and respectful",
        text: "A calm historical stop with a strong sense of place. It is best with someone who can explain the context.",
        tripType: "Couple",
      },
      {
        id: "shakpak-review-2",
        author: "Ilya P.",
        date: "2026-04-18",
        rating: 4.5,
        title: "Adds depth to the route",
        text: "After many landscapes, this stop made the trip feel more connected to local history and traditions.",
        tripType: "Solo",
      },
    ],
  },
  "caspian-sea": {
    id: "caspian-sea",
    photo: "/locations/photos/caspian-sea.jpg",
    rating: 4.7,
    reviewCount: 203,
    popularityScore: 84,
    distanceFromAktauKm: 15,
    categoryLabel: CATEGORY_LABELS.sea,
    filters: ["sea", "family", "popular"],
    visitTime: "2-5 hours",
    seoDescription:
      "Caspian Sea Coast guide near Aktau with family-friendly timing, ratings, reviews, coordinates and route button.",
    highlights: [
      "Calm coastal time near Aktau",
      "Good sunset stop after city logistics",
      "Family-friendly alternative to long desert roads",
    ],
    touristTips: [
      "Choose a sheltered coast section if traveling with children.",
      "Bring sun protection because shade can be limited.",
      "Check wind before planning a long beach stop.",
    ],
    reviews: [
      {
        id: "caspian-review-1",
        author: "Madina E.",
        date: "2026-06-16",
        rating: 4.8,
        title: "Beautiful sunset",
        text: "We kept the evening simple: sea, rocks and sunset. It was a nice reset before the desert route.",
        tripType: "Family",
      },
      {
        id: "caspian-review-2",
        author: "Sergey L.",
        date: "2026-05-25",
        rating: 4.6,
        title: "Easy coastal stop",
        text: "Good if you want something lighter than a full expedition day. The coastline is quiet and photogenic.",
        tripType: "Couple",
      },
    ],
  },
  tuzbair: {
    id: "tuzbair",
    photo: "/locations/photos/tuzbair.jpg",
    rating: 4.8,
    reviewCount: 147,
    popularityScore: 88,
    distanceFromAktauKm: 300,
    categoryLabel: CATEGORY_LABELS.canyons,
    filters: ["nature", "canyons", "popular"],
    visitTime: "4-6 hours",
    seoDescription:
      "Tuzbair Salt Flats guide with white cliffs, route timing, rating, reviews, distance from Aktau and safety tips.",
    highlights: [
      "White cliffs and salt flat foreground",
      "Strong stop for photographers",
      "Remote feeling without losing route flexibility",
    ],
    touristTips: [
      "Use a local driver because dry tracks can become confusing.",
      "Protect eyes and skin from bright reflected light.",
      "Avoid driving onto soft salt or wet clay after rain.",
    ],
    reviews: [
      {
        id: "tuzbair-review-1",
        author: "Kira Z.",
        date: "2026-05-20",
        rating: 4.8,
        title: "Like another planet",
        text: "The white cliffs and salt surface are very different from other Mangystau stops. Great for a slower photo day.",
        tripType: "Friends",
      },
      {
        id: "tuzbair-review-2",
        author: "Azamat Y.",
        date: "2026-04-26",
        rating: 4.7,
        title: "Go with a driver",
        text: "The place is beautiful, but the road choices matter. A local driver kept the day comfortable and safe.",
        tripType: "Adventure",
      },
    ],
  },
};

const fallbackByCategory: Record<
  TravelPlace["category"],
  Pick<PlaceTourismProfile, "categoryLabel" | "filters">
> = {
  city: { categoryLabel: CATEGORY_LABELS.popular, filters: ["popular", "family"] },
  nature: { categoryLabel: CATEGORY_LABELS.nature, filters: ["nature", "popular"] },
  culture: { categoryLabel: CATEGORY_LABELS.history, filters: ["history", "popular"] },
  desert: { categoryLabel: CATEGORY_LABELS.nature, filters: ["nature", "popular"] },
};

export const POPULAR_MANGYSTAU_ROUTES: PopularTourRoute[] = [
  {
    id: "aktau-bozzhyra",
    title: "\u0410\u043a\u0442\u0430\u0443 \u2192 \u0411\u043e\u0437\u0436\u044b\u0440\u0430",
    distance: "300-320 km",
    duration: "5-6 hours one way",
    placeIds: ["aktau", "shakpak-ata", "sherkala", "bozzhyra"],
    points: ["Aktau", "Shakpak-Ata", "Sherkala", "Bozzhyra viewpoint"],
    note: "Best as a 2-day 4x4 route with sunset or sunrise at the cliffs.",
  },
  {
    id: "aktau-sherkala",
    title: "\u0410\u043a\u0442\u0430\u0443 \u2192 \u0428\u0435\u0440\u043a\u0430\u043b\u0430",
    distance: "170-190 km",
    duration: "2.5-3.5 hours one way",
    placeIds: ["aktau", "shakpak-ata", "sherkala"],
    points: ["Aktau", "Shakpak-Ata", "Sherkala Mountain"],
    note: "A strong one-day route if you leave early and avoid the hottest hours.",
  },
  {
    id: "aktau-torysh",
    title: "\u0410\u043a\u0442\u0430\u0443 \u2192 \u0422\u043e\u0440\u044b\u0448",
    distance: "110-130 km",
    duration: "2-2.5 hours one way",
    placeIds: ["aktau", "torysh"],
    points: ["Aktau", "Torysh valley", "Stone spheres viewpoint"],
    note: "Good for families and first-time visitors who want a shorter Mangystau route.",
  },
  {
    id: "aktau-caspian",
    title: "\u0410\u043a\u0442\u0430\u0443 \u2192 \u041a\u0430\u0441\u043f\u0438\u0439\u0441\u043a\u043e\u0435 \u043c\u043e\u0440\u0435",
    distance: "15-45 km",
    duration: "30-60 minutes",
    placeIds: ["aktau", "caspian-sea"],
    points: ["Aktau", "Caspian coast", "Sunset viewpoint"],
    note: "A light coastal plan for arrival day, kids, or a calm break between desert drives.",
  },
];

export function isMangystauPlace(placeId: string) {
  return MANGYSTAU_PLACE_IDS.includes(placeId);
}

export function getPlaceTourism(place: TravelPlace): PlaceTourismProfile {
  const profile = PLACE_TOURISM[place.id];

  if (profile) {
    return profile;
  }

  const fallback = fallbackByCategory[place.category];
  const rating = 4.6;

  return {
    id: place.id,
    photo: place.image ?? null,
    rating,
    reviewCount: 72,
    popularityScore: 60,
    distanceFromAktauKm: getDistanceFromAktauKm(place),
    categoryLabel: fallback.categoryLabel,
    filters: fallback.filters,
    visitTime: place.duration,
    seoDescription: `${place.name} travel guide with practical route details, rating, reviews and tourist tips for Kazakhstan.`,
    highlights: place.facts.slice(0, 3),
    touristTips: (place.practicalInfo ?? place.facts).slice(0, 3),
    reviews: [
      {
        id: `${place.id}-review-1`,
        author: "NomadGo traveler",
        date: "2026-04-10",
        rating,
        title: "Useful stop for the route",
        text: "The place fits well into a planned Kazakhstan route when transport and timing are prepared in advance.",
        tripType: "Route",
      },
    ],
  };
}

export function getPlaceTourismBySlug(slug: string) {
  const place = PLACES.find((item) => item.id === slug);
  return place ? getPlaceTourism(place) : null;
}

export function getMangystauDestinations() {
  return MANGYSTAU_PLACE_IDS.map((id) => PLACES.find((place) => place.id === id))
    .filter((place): place is TravelPlace => Boolean(place))
    .map((place) => ({
      place,
      profile: getPlaceTourism(place),
    }));
}

export function getRelatedPlaces(place: TravelPlace, limit = 3) {
  const currentProfile = getPlaceTourism(place);
  const currentFilters = new Set(currentProfile.filters);

  return PLACES.filter((item) => item.id !== place.id)
    .map((item) => {
      const profile = getPlaceTourism(item);
      const sharedFilters = profile.filters.filter((filter) => currentFilters.has(filter)).length;
      const regionScore = item.region === place.region ? 3 : 0;
      const categoryScore = item.category === place.category ? 2 : 0;

      return {
        place: item,
        profile,
        score: sharedFilters * 4 + regionScore + categoryScore + profile.rating,
      };
    })
    .sort((first, second) => second.score - first.score)
    .slice(0, limit);
}

export function buildDirectionsUrl(place: TravelPlace) {
  const [lat, lng] = place.coordinates;
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
}

function getDistanceFromAktauKm(place: TravelPlace) {
  const aktau = PLACES.find((item) => item.id === "aktau");

  if (!aktau || place.id === "aktau") {
    return 0;
  }

  return Math.round(haversineDistanceKm(aktau.coordinates, place.coordinates));
}

function haversineDistanceKm(first: TravelPlace["coordinates"], second: TravelPlace["coordinates"]) {
  const earthRadiusKm = 6371;
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const [firstLat, firstLng] = first.map(toRadians) as [number, number];
  const [secondLat, secondLng] = second.map(toRadians) as [number, number];
  const latDistance = secondLat - firstLat;
  const lngDistance = secondLng - firstLng;
  const a =
    Math.sin(latDistance / 2) ** 2 +
    Math.cos(firstLat) * Math.cos(secondLat) * Math.sin(lngDistance / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
