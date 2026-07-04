import { buildGoogleMapsDirectionsUrl, sortByDistance, type Coordinates } from "@/lib/geo";
import { mangystauHotels, nearbyServices } from "@/lib/hotelsData";

export type GuideFilter =
  | "nature"
  | "history"
  | "family"
  | "adventure"
  | "camping"
  | "photography"
  | "beach"
  | "mountain";

export type GuideDestination = {
  id: string;
  name: string;
  category: string;
  image: string;
  gallery: string[];
  coordinates: Coordinates;
  rating: number;
  reviewCount: number;
  distanceFromAktauKm: number;
  visitTime: string;
  travelTime: string;
  transportType: string;
  difficulty: string;
  temperature: string;
  bestSeason: string;
  filters: GuideFilter[];
  searchTerms: string[];
  description: string;
  story: string;
  legend: string;
  facts: string[];
  whatToTake: string[];
  warnings: string[];
  weather: string;
  routeTitle: string;
  routePoints: string[];
};

export const guideFilters: { id: GuideFilter; label: string }[] = [
  { id: "nature", label: "Nature" },
  { id: "history", label: "History" },
  { id: "family", label: "Family" },
  { id: "adventure", label: "Adventure" },
  { id: "camping", label: "Camping" },
  { id: "photography", label: "Photography" },
  { id: "beach", label: "Beach" },
  { id: "mountain", label: "Mountain" },
];

export const guideDestinations: GuideDestination[] = [
  {
    id: "bozzhyra",
    name: "Bozzhyra",
    category: "White cliffs",
    image: "/locations/photos/bozzhyra.jpg",
    gallery: ["/locations/photos/bozzhyra.jpg", "/locations/bozzhyra.svg", "/locations/photos/tuzbair.jpg"],
    coordinates: [43.415, 54.071],
    rating: 4.9,
    reviewCount: 128,
    distanceFromAktauKm: 300,
    visitTime: "2 days",
    travelTime: "5-6h",
    transportType: "SUV",
    difficulty: "Hard",
    temperature: "18-32C",
    bestSeason: "Apr-Jun, Sep-Oct",
    filters: ["nature", "adventure", "camping", "photography"],
    searchTerms: ["sunset", "cliffs", "desert", "4x4", "camping", "photography"],
    description: "Remote chalk cliffs, desert silence and one of Mangystau's strongest sunset viewpoints.",
    story: "Bozzhyra feels like the sea left a white stone cathedral behind. Most trips begin in Aktau and become a slow expedition into open desert.",
    legend: "Local guides often describe the cliffs as a place where the steppe keeps its old memory in stone.",
    facts: ["Remote viewpoint", "No city services nearby", "Best with a local driver-guide"],
    whatToTake: ["Water reserve", "Offline map", "Warm layer", "Power bank", "First-aid kit"],
    warnings: ["Do not drive unknown tracks alone.", "Avoid late arrival after sunset.", "SUV is strongly recommended."],
    weather: "Dry, windy and exposed; nights can be cool even after warm days.",
    routeTitle: "Aktau -> Zhanaozen -> Bozzhyra",
    routePoints: ["Aktau", "Zhanaozen supplies", "Beket-Ata junction", "Bozzhyra viewpoint"],
  },
  {
    id: "sherkala",
    name: "Sherkala",
    category: "Desert mountain",
    image: "/locations/photos/sherkala.jpg",
    gallery: ["/locations/photos/sherkala.jpg", "/locations/sherkala.svg", "/locations/photos/torysh.jpg"],
    coordinates: [44.239, 52.006],
    rating: 4.7,
    reviewCount: 94,
    distanceFromAktauKm: 170,
    visitTime: "2-4h",
    travelTime: "2.5-3h",
    transportType: "Crossover",
    difficulty: "Moderate",
    temperature: "16-30C",
    bestSeason: "Apr-Jun, Sep-Oct",
    filters: ["nature", "history", "photography", "mountain"],
    searchTerms: ["mountain", "history", "sunset", "easy hike", "viewpoint"],
    description: "A standalone desert mountain with broad steppe views and strong golden-hour photos.",
    story: "Sherkala is the visual anchor of many one-day Mangystau loops: simple, bold and easy to recognize from far away.",
    legend: "Its name is often translated as Lion City, a reminder of the fortress-like shape rising from the steppe.",
    facts: ["Great sunset stop", "Works with Torysh", "Avoid steep climbing without guide advice"],
    whatToTake: ["Windproof layer", "Closed shoes", "Water", "Camera"],
    warnings: ["Loose rocks near steep slopes.", "Wind can be strong at the viewpoint."],
    weather: "Usually dry and windy; late afternoon is softer for light and heat.",
    routeTitle: "Aktau -> Shakpak-Ata -> Sherkala",
    routePoints: ["Aktau", "Shakpak-Ata", "Sherkala viewpoint"],
  },
  {
    id: "torysh",
    name: "Torysh",
    category: "Stone spheres",
    image: "/locations/photos/torysh.jpg",
    gallery: ["/locations/photos/torysh.jpg", "/locations/photos/sherkala.jpg", "/locations/photos/caspian-sea.jpg"],
    coordinates: [44.107, 51.769],
    rating: 4.6,
    reviewCount: 88,
    distanceFromAktauKm: 120,
    visitTime: "2-3h",
    travelTime: "2-2.5h",
    transportType: "Crossover",
    difficulty: "Easy",
    temperature: "17-31C",
    bestSeason: "Apr-Jun, Sep-Oct",
    filters: ["nature", "family", "photography"],
    searchTerms: ["family", "easy hike", "geology", "kids", "stone spheres"],
    description: "A playful geology stop with natural stone spheres and short family-friendly walks.",
    story: "Torysh is where the desert becomes tactile: round stones, low horizons and a route that does not need to feel extreme.",
    legend: "Travelers sometimes call it a valley of ancient games because the stones look intentionally placed.",
    facts: ["Family-friendly", "Uneven ground", "Good with Sherkala"],
    whatToTake: ["Water", "Closed shoes", "Sun protection", "Snacks"],
    warnings: ["Do not move stone formations.", "Keep children close on uneven ground."],
    weather: "Open and sunny; avoid the hottest midday hours in summer.",
    routeTitle: "Aktau -> Torysh -> Sherkala",
    routePoints: ["Aktau", "Torysh Valley", "Sherkala optional stop"],
  },
  {
    id: "tuzbair",
    name: "Tuzbair",
    category: "Salt cliffs",
    image: "/locations/photos/tuzbair.jpg",
    gallery: ["/locations/photos/tuzbair.jpg", "/locations/photos/bozzhyra.jpg", "/locations/photos/sherkala.jpg"],
    coordinates: [44.096, 53.333],
    rating: 4.8,
    reviewCount: 76,
    distanceFromAktauKm: 250,
    visitTime: "4-6h",
    travelTime: "4-5h",
    transportType: "SUV",
    difficulty: "Hard",
    temperature: "18-34C",
    bestSeason: "Apr-Jun, Sep-Oct",
    filters: ["nature", "adventure", "camping", "photography"],
    searchTerms: ["salt", "white cliffs", "sunset", "adventure", "4x4"],
    description: "White cliffs, salt-pan textures and a remote landscape that needs careful road timing.",
    story: "Tuzbair is quieter than the headline viewpoints, with bright salt light and a slower, almost lunar rhythm.",
    legend: "Guides often treat Tuzbair as a place to read the weather and the ground before going deeper.",
    facts: ["Very bright salt surface", "Weather-sensitive road", "Strong photo stop"],
    whatToTake: ["Sunglasses", "Sunscreen", "Water reserve", "Offline map"],
    warnings: ["Avoid wet or soft salt-pan surfaces.", "Use SUV after rain."],
    weather: "Bright and exposed; reflected light makes sun protection important.",
    routeTitle: "Aktau -> Fuel stop -> Tuzbair",
    routePoints: ["Aktau", "Fuel stop", "Tuzbair upper view", "Salt flat edge"],
  },
  {
    id: "beket-ata",
    name: "Beket-Ata",
    category: "Pilgrimage site",
    image: "/locations/photos/shakpak-ata.jpg",
    gallery: ["/locations/photos/shakpak-ata.jpg", "/locations/photos/bozzhyra.jpg", "/locations/shakpak-ata.svg"],
    coordinates: [43.595, 54.073],
    rating: 4.8,
    reviewCount: 82,
    distanceFromAktauKm: 280,
    visitTime: "3-5h",
    travelTime: "4.5-5.5h",
    transportType: "SUV",
    difficulty: "Moderate",
    temperature: "18-32C",
    bestSeason: "Apr-Jun, Sep-Oct",
    filters: ["history", "family", "adventure"],
    searchTerms: ["history", "pilgrimage", "mosque", "culture", "route"],
    description: "A remote underground mosque and sacred pilgrimage stop often paired with Bozzhyra.",
    story: "The route to Beket-Ata is about respect and pacing as much as scenery: the journey is part of the visit.",
    legend: "Beket-Ata is remembered as a wise teacher and protector, and visitors keep the place quiet.",
    facts: ["Respectful clothing", "Walking section", "Often combined with Bozzhyra"],
    whatToTake: ["Respectful clothing", "Water", "Comfortable shoes", "Head covering"],
    warnings: ["Keep noise low.", "Confirm return timing with the driver."],
    weather: "Remote and exposed; start early and avoid unnecessary night driving.",
    routeTitle: "Aktau -> Zhanaozen -> Beket-Ata",
    routePoints: ["Aktau", "Zhanaozen", "Beket-Ata parking", "Pilgrimage path"],
  },
  {
    id: "kapamsay",
    name: "Kapamsay",
    category: "Canyon walk",
    image: "/locations/photos/tuzbair.jpg",
    gallery: ["/locations/photos/tuzbair.jpg", "/locations/photos/sherkala.jpg"],
    coordinates: [44.508, 51.362],
    rating: 4.5,
    reviewCount: 41,
    distanceFromAktauKm: 145,
    visitTime: "2-3h",
    travelTime: "2.5h",
    transportType: "Crossover",
    difficulty: "Moderate",
    temperature: "17-31C",
    bestSeason: "Apr-Jun, Sep-Oct",
    filters: ["nature", "adventure", "photography"],
    searchTerms: ["canyon", "easy hike", "rocks", "photography"],
    description: "A compact canyon-style stop for travelers who want texture without a very long expedition.",
    story: "Kapamsay gives a route a more intimate scale after wide steppe views.",
    legend: "Its narrow shapes make many visitors slow down and listen to the wind.",
    facts: ["Good half-day stop", "Rock textures", "Works with northern routes"],
    whatToTake: ["Water", "Closed shoes", "Hat"],
    warnings: ["Avoid loose edges.", "Do not enter narrow parts in unstable weather."],
    weather: "Best in mild light; canyon shade can feel cooler than open steppe.",
    routeTitle: "Aktau -> Kapamsay",
    routePoints: ["Aktau", "Road stop", "Kapamsay walk"],
  },
  {
    id: "aktau-seaside",
    name: "Aktau Seaside",
    category: "Caspian coast",
    image: "/locations/photos/caspian-sea.jpg",
    gallery: ["/locations/photos/caspian-sea.jpg", "/locations/aktau.svg"],
    coordinates: [43.662, 51.146],
    rating: 4.4,
    reviewCount: 118,
    distanceFromAktauKm: 3,
    visitTime: "2-5h",
    travelTime: "10-20m",
    transportType: "Sedan",
    difficulty: "Easy",
    temperature: "20-30C",
    bestSeason: "May-Sep",
    filters: ["family", "beach", "photography"],
    searchTerms: ["beach", "sunset", "family", "sea", "hotels"],
    description: "Rocky shoreline, sea air and easy sunset walks before or after desert drives.",
    story: "The Caspian coast is the soft landing: slower, social and easy to reach from hotels.",
    legend: "Locals often treat the seaside as the place to reset after the dust of the road.",
    facts: ["Easy arrival-day plan", "Good sunset", "Near city hotels"],
    whatToTake: ["Wind layer", "Water", "Camera"],
    warnings: ["Stay back from slippery rocks.", "Check local swimming advice."],
    weather: "Breezy and changeable; sunset can be cooler than expected.",
    routeTitle: "Aktau hotel -> Seaside walk",
    routePoints: ["Aktau center", "Seaside promenade", "Sunset viewpoint"],
  },
  {
    id: "karynzharyk",
    name: "Karynzharyk",
    category: "Desert depression",
    image: "/locations/photos/bozzhyra.jpg",
    gallery: ["/locations/photos/bozzhyra.jpg", "/locations/photos/tuzbair.jpg"],
    coordinates: [42.675, 54.072],
    rating: 4.9,
    reviewCount: 52,
    distanceFromAktauKm: 360,
    visitTime: "2-3 days",
    travelTime: "6-8h",
    transportType: "SUV",
    difficulty: "Hard",
    temperature: "18-35C",
    bestSeason: "Apr-Jun, Sep-Oct",
    filters: ["nature", "adventure", "camping", "photography"],
    searchTerms: ["extreme", "adventure", "desert", "camping", "remote"],
    description: "A remote desert depression for stronger expeditions with a guide and full supplies.",
    story: "Karynzharyk is not a quick stop; it is the kind of place that rewards careful logistics.",
    legend: "Travelers describe it as a landscape where distance itself becomes the main sight.",
    facts: ["Remote expedition", "Guide required", "Weather buffer needed"],
    whatToTake: ["Extra fuel plan", "Water reserve", "Camp kit", "Satellite/offline backup"],
    warnings: ["Do not attempt alone.", "Build in a full weather buffer."],
    weather: "Hot, dry and exposed; wind can change visibility and road comfort.",
    routeTitle: "Aktau -> Ustyurt route -> Karynzharyk",
    routePoints: ["Aktau", "Supply stop", "Guide checkpoint", "Karynzharyk viewpoint"],
  },
  {
    id: "sultan-epe",
    name: "Sultan-Epe",
    category: "Sacred valley",
    image: "/locations/photos/shakpak-ata.jpg",
    gallery: ["/locations/photos/shakpak-ata.jpg", "/locations/photos/caspian-sea.jpg"],
    coordinates: [44.528, 51.187],
    rating: 4.6,
    reviewCount: 46,
    distanceFromAktauKm: 135,
    visitTime: "2-4h",
    travelTime: "2-3h",
    transportType: "Crossover",
    difficulty: "Moderate",
    temperature: "17-30C",
    bestSeason: "Apr-Jun, Sep-Oct",
    filters: ["history", "family", "nature"],
    searchTerms: ["history", "sacred", "family", "valley"],
    description: "A quiet cultural and natural stop with a slower, respectful rhythm.",
    story: "Sultan-Epe is best visited without rushing: part landscape, part memory.",
    legend: "The site is tied to local spiritual traditions, so simple respectful behavior matters.",
    facts: ["Cultural stop", "Quiet atmosphere", "Good with northern routes"],
    whatToTake: ["Water", "Modest clothing", "Closed shoes"],
    warnings: ["Keep noise low.", "Do not disturb sacred areas."],
    weather: "Mild seasons are best; bring shade in warm months.",
    routeTitle: "Aktau -> Sultan-Epe",
    routePoints: ["Aktau", "Northern route", "Sultan-Epe valley"],
  },
  {
    id: "saura",
    name: "Saura",
    category: "Hidden lake",
    image: "/locations/photos/torysh.jpg",
    gallery: ["/locations/photos/torysh.jpg", "/locations/photos/caspian-sea.jpg"],
    coordinates: [44.283, 51.743],
    rating: 4.5,
    reviewCount: 37,
    distanceFromAktauKm: 105,
    visitTime: "2-3h",
    travelTime: "2h",
    transportType: "Crossover",
    difficulty: "Easy",
    temperature: "18-31C",
    bestSeason: "Apr-Jun, Sep-Oct",
    filters: ["nature", "family", "photography"],
    searchTerms: ["family", "easy hike", "lake", "quiet", "nature"],
    description: "A quieter nature stop that works well for a softer family-friendly route.",
    story: "Saura is useful when the trip needs a calmer point between bigger landscapes.",
    legend: "Its quiet water makes it feel more hidden than its distance from Aktau suggests.",
    facts: ["Calm stop", "Short visit", "Pairs with Torysh"],
    whatToTake: ["Water", "Light snacks", "Sun protection"],
    warnings: ["Stay on stable ground.", "Keep the area clean and quiet."],
    weather: "Comfortable in shoulder seasons; avoid harsh midday heat.",
    routeTitle: "Aktau -> Saura -> Torysh",
    routePoints: ["Aktau", "Saura", "Torysh optional stop"],
  },
];

export function getGuideDestinationById(id: string | null | undefined) {
  return guideDestinations.find((destination) => destination.id === id);
}

export function buildDestinationRouteUrl(destination: GuideDestination, origin?: Coordinates) {
  return buildGoogleMapsDirectionsUrl(destination.coordinates, origin);
}

export function getHotelsNearDestination(destination: GuideDestination, limit = 4) {
  return sortByDistance(mangystauHotels, destination.coordinates, (hotel) => hotel.coordinates).slice(0, limit);
}

export function getServicesNearDestination(destination: GuideDestination, limit = 6) {
  return sortByDistance(nearbyServices, destination.coordinates, (service) => service.coordinates).slice(0, limit);
}

export function getGuideSearchText(destination: GuideDestination) {
  return [
    destination.name,
    destination.category,
    destination.description,
    destination.story,
    destination.legend,
    ...destination.filters,
    ...destination.searchTerms,
    ...destination.facts,
  ]
    .join(" ")
    .toLowerCase();
}
