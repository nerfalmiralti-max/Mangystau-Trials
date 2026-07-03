export type PlaceCategory = "city" | "nature" | "culture" | "desert";

export type TravelPlace = {
  id: string;
  name: string;
  region: string;
  desc: string;
  category: PlaceCategory;
  duration: string;
  bestTime: string;
  coordinates: [number, number];
  facts: string[];
  bio: string;
  image?: string | null;
  gallery?: string[];
  practicalInfo?: string[];
  safetyTips?: string[];
  leaveNoTrace?: string[];
};

export type RouteTemplate = {
  id: string;
  title: string;
  mood: string;
  days: number;
  distance: string;
  placeIds: string[];
  description: string;
  steps: string[];
};

export const PLACES: TravelPlace[] = [
  {
    id: "aktau",
    name: "Aktau",
    region: "Mangystau",
    desc: "Caspian Sea base city for Mangystau desert routes",
    category: "city",
    duration: "1 day",
    bestTime: "April - October",
    coordinates: [43.653, 51.197],
    facts: [
      "Best city base for Bozzhyra trips",
      "Use it for supplies and driver-guide pickup",
      "Caspian sunsets work well before desert travel",
    ],
    bio:
      "Aktau is the practical coastal base for Mangystau: stock up, meet a guide and start remote desert routes with less stress.",
    image: "/locations/photos/caspian-sea.jpg",
    gallery: ["/locations/photos/caspian-sea.jpg", "/locations/aktau.svg"],
    practicalInfo: [
      "Plan logistics in Aktau before leaving for the desert.",
      "Stock up on water, snacks, fuel and a local SIM card.",
      "Confirm 4x4 bookings and driver-guide availability in advance.",
    ],
    safetyTips: [
      "Use official taxis or hotel transfers in the city.",
      "Keep a printed address if your guide speaks limited English.",
      "Rest before desert travel and avoid late-night departures.",
    ],
    leaveNoTrace: [
      "Do not leave waste along the beach or dunes.",
      "Respect local fishing and coastal communities.",
      "Keep noise low near residential areas and cultural sites.",
    ],
  },
  {
    id: "shakpak-ata",
    name: "Shakpak-Ata",
    region: "Mangystau",
    desc: "Rock-cut mosque and quiet desert heritage stop",
    category: "culture",
    duration: "2-3 hours",
    bestTime: "April - June, September - October",
    coordinates: [44.441, 51.166],
    facts: [
      "Works as a meaningful stop before deeper desert roads",
      "Respect quiet religious spaces",
      "Best visited with a local driver-guide",
    ],
    bio:
      "Shakpak-Ata adds cultural depth to a Mangystau route, turning the drive into more than a transfer between viewpoints.",
    image: "/locations/photos/shakpak-ata.jpg",
    gallery: ["/locations/photos/shakpak-ata.jpg", "/locations/shakpak-ata.svg"],
    practicalInfo: [
      "Dress respectfully for the religious site.",
      "Combine the stop with nearby Mangystau viewpoints.",
      "Allow time for the road to remain comfortable in spring and autumn.",
    ],
    safetyTips: [
      "Stay on the marked paths around the mosque.",
      "Carry shade and water in the heat.",
      "Mind local customs and do not disturb worshippers.",
    ],
    leaveNoTrace: [
      "Leave the building and its surroundings untouched.",
      "Do not climb on fragile stone surfaces.",
      "Take only photos, leave only footprints.",
    ],
  },
  {
    id: "sherkala",
    name: "Sherkala Mountain",
    region: "Mangystau",
    desc: "Standalone desert mountain with wide steppe views",
    category: "desert",
    duration: "2-4 hours",
    bestTime: "April - June, September - October",
    coordinates: [44.239, 52.006],
    facts: [
      "Good scenic pause on Mangystau expeditions",
      "Light changes quickly near sunset",
      "Avoid climbing without guide advice",
    ],
    bio:
      "Sherkala gives a route a memorable desert silhouette before the wilder scale of Bozzhyra.",
    image: "/locations/photos/sherkala.jpg",
    gallery: ["/locations/photos/sherkala.jpg", "/locations/sherkala.svg"],
    practicalInfo: [
      "Bring a windproof layer and sturdy shoes.",
      "Best visits are late afternoon or early morning.",
      "Combine Sherkala with nearby Kozha or mouth of the plateau.",
    ],
    safetyTips: [
      "Use a local guide to identify safe approaches.",
      "Avoid loose rocks and stay low on steep terrain.",
      "Keep distance from the edge of cliffs in windy conditions.",
    ],
    leaveNoTrace: [
      "Keep the headland free from litter.",
      "Do not carve or damage rock formations.",
      "Respect the quiet and stillness of the mountain.",
    ],
  },
  {
    id: "torysh",
    name: "Torysh Valley",
    region: "Mangystau",
    desc: "Valley of stone spheres and easy desert geology walks",
    category: "nature",
    duration: "2-3 hours",
    bestTime: "April - June, September - October",
    coordinates: [44.107, 51.769],
    facts: [
      "Known for natural spherical stone formations",
      "Works well as a shorter family-friendly Mangystau stop",
      "Best explored in the cooler morning or late afternoon",
    ],
    bio:
      "Torysh adds a playful geological stop to Mangystau routes: round stone concretions scattered across a quiet desert valley.",
    image: "/locations/photos/torysh.jpg",
    gallery: ["/locations/photos/torysh.jpg"],
    practicalInfo: [
      "Pair Torysh with Sherkala for a manageable one-day route from Aktau.",
      "Wear sturdy shoes because the ground is uneven and dusty.",
      "Carry water and sun protection even for a short visit.",
    ],
    safetyTips: [
      "Do not climb unstable rocks or move the stone formations.",
      "Keep children close on rough ground and around larger stones.",
      "Avoid walking far from the vehicle in midday heat.",
    ],
    leaveNoTrace: [
      "Leave all stone formations exactly where they are.",
      "Do not carve names or marks into rocks.",
      "Pack out every piece of trash from the valley.",
    ],
  },
  {
    id: "caspian-sea",
    name: "Caspian Sea Coast",
    region: "Mangystau",
    desc: "Rocky shoreline, quiet water and sunset views near Aktau",
    category: "nature",
    duration: "2-5 hours",
    bestTime: "May - September",
    coordinates: [43.662, 51.146],
    facts: [
      "Best light comes near sunset",
      "A calm family-friendly break between desert routes",
      "Wind can change plans quickly along the coast",
    ],
    bio:
      "The Caspian coast gives Mangystau travelers a softer rhythm: sea air, rocky shorelines and an easy reset before or after desert drives.",
    image: "/locations/photos/caspian-sea.jpg",
    gallery: ["/locations/photos/caspian-sea.jpg"],
    practicalInfo: [
      "Use the coast as a light arrival-day or rest-day plan.",
      "Bring sun protection and a windproof layer.",
      "Check local swimming advice before entering the water.",
    ],
    safetyTips: [
      "Stay back from slippery rocks near the waterline.",
      "Watch children closely because the rocky shore can be uneven.",
      "Avoid remote shoreline sections after dark without a local driver.",
    ],
    leaveNoTrace: [
      "Take all picnic waste back to Aktau.",
      "Do not disturb shore birds or local fishing areas.",
      "Avoid driving onto fragile coastal ground.",
    ],
  },
  {
    id: "tuzbair",
    name: "Tuzbair Salt Flats",
    region: "Mangystau",
    desc: "White cliffs, salt-pan textures and remote desert light",
    category: "desert",
    duration: "4-6 hours",
    bestTime: "April - June, September - October",
    coordinates: [44.096, 53.333],
    facts: [
      "Photogenic salt flat and chalk escarpment landscape",
      "Local driver guidance helps with track choices",
      "Bright reflected light makes sun protection important",
    ],
    bio:
      "Tuzbair is a quiet white-cliff landscape where salt flats and chalk walls make Mangystau feel almost lunar.",
    image: "/locations/photos/tuzbair.jpg",
    gallery: ["/locations/photos/tuzbair.jpg"],
    practicalInfo: [
      "Use a local driver if combining Tuzbair with deeper desert routes.",
      "Bring sunglasses, sunscreen and enough drinking water.",
      "Avoid the salt pan after rain or when the surface looks soft.",
    ],
    safetyTips: [
      "Stay with the vehicle route and do not cross unknown soft ground.",
      "Protect eyes from bright reflected light.",
      "Keep extra time in the plan because tracks can be slow.",
    ],
    leaveNoTrace: [
      "Do not drive over fragile salt textures for photos.",
      "Keep camps and food stops away from delicate surfaces.",
      "Leave the cliff and salt-pan edges unmarked.",
    ],
  },
  {
    id: "almaty",
    name: "Almaty",
    region: "Almaty",
    desc: "Mountains, cafes, parks and cultural city rhythm",
    category: "city",
    duration: "1-2 days",
    bestTime: "April - October",
    coordinates: [43.238, 76.945],
    facts: [
      "Start here for mountain routes",
      "Good base for Charyn and Kaindy",
      "Many English-speaking guides",
    ],
    bio:
      "Almaty is the easiest entry point for a first Kazakhstan trip: mountain views, city comfort and fast access to nature.",
    image: "/locations/almaty.svg",
    gallery: ["/locations/almaty.svg"],
    practicalInfo: [
      "Book a hotel close to the city center or Medeu transport hub.",
      "Use local taxis or ride apps for quick city transfers.",
      "Visit Panfilov Park, Green Bazaar and Kok-Tobe with spare time.",
    ],
    safetyTips: [
      "Keep your personal belongings secure in busy markets.",
      "Carry small cash for markets and mountain transfers.",
      "Avoid walking alone late in unfamiliar neighborhoods.",
    ],
    leaveNoTrace: [
      "Take all trash from city day trips home with you.",
      "Avoid disturbing public gardens and park areas.",
      "Support local vendors with respect and small purchases.",
    ],
  },
  {
    id: "astana",
    name: "Astana",
    region: "Akmola",
    desc: "Futuristic capital with architecture and river walks",
    category: "city",
    duration: "1 day",
    bestTime: "May - September",
    coordinates: [51.169, 71.449],
    facts: [
      "Best for architecture lovers",
      "Compact city route works in one day",
      "Cold and windy in winter",
    ],
    bio:
      "Astana is a planned capital with clean boulevards, modern landmarks and a strong contrast to Kazakhstan's wild landscapes.",
    image: "/locations/astana.svg",
    gallery: ["/locations/astana.svg"],
    practicalInfo: [
      "Wear windproof layers in the riverfront area.",
      "Combine Baiterek, Nurzhol Boulevard and the National Museum.",
      "Reserve museum tickets if visiting in high season.",
    ],
    safetyTips: [
      "Stay near the main sights for the best city feel.",
      "Take care crossing busy boulevards and tram zones.",
      "Keep a digital map handy for architecturally dense areas.",
    ],
    leaveNoTrace: [
      "Do not leave litter around river walkways.",
      "Respect museum photography rules.",
      "Stay on marked pedestrian paths around major monuments.",
    ],
  },
  {
    id: "charyn",
    name: "Charyn Canyon",
    region: "Almaty Region",
    desc: "Red canyon walls and dramatic viewpoints",
    category: "nature",
    duration: "1 day",
    bestTime: "March - November",
    coordinates: [43.354, 79.08],
    facts: [
      "Around 200 km from Almaty",
      "Valley of Castles is the classic route",
      "Bring water and sun protection",
    ],
    bio:
      "Charyn Canyon is one of the most iconic natural sights in Kazakhstan, especially for first-time visitors.",
    image: "/locations/charyn.svg",
    gallery: ["/locations/charyn.svg"],
    practicalInfo: [
      "Start early to avoid the hottest part of the day.",
      "Pack sturdy shoes for canyon paths.",
      "Combine Charyn with a village visit or picnic stop.",
    ],
    safetyTips: [
      "Keep children close on steep edges.",
      "Bring enough water and a sun hat.",
      "Watch for loose stones and slippery paths.",
    ],
    leaveNoTrace: [
      "Do not leave trash inside the canyon.",
      "Stay on established paths to protect vegetation.",
      "Avoid making fires in the canyon area.",
    ],
  },
  {
    id: "kaindy",
    name: "Kaindy Lake",
    region: "Almaty Region",
    desc: "Turquoise mountain lake with a sunken forest",
    category: "nature",
    duration: "1 day",
    bestTime: "June - September",
    coordinates: [42.984, 78.466],
    facts: [
      "High mountain road requires planning",
      "Often paired with Kolsai Lakes",
      "Weather changes quickly",
    ],
    bio:
      "Kaindy Lake feels cinematic: cold turquoise water, pine trunks rising from the lake and quiet mountain air.",
    image: "/locations/kaindy.svg",
    gallery: ["/locations/kaindy.svg"],
    practicalInfo: [
      "Drive high mountain roads with a local driver in summer.",
      "Pair Kaindy with Kolsai Lakes for a complete mountain loop.",
      "Bring layers and rain protection for sudden weather changes.",
    ],
    safetyTips: [
      "Keep to the main trail and avoid steep forest slopes.",
      "Carry enough water and avoid late returns after dark.",
      "Listen to guide advice for the lake access route.",
    ],
    leaveNoTrace: [
      "Leave the forest shoreline intact and undisturbed.",
      "Do not pick plants or break branches.",
      "Use marked camping areas if staying overnight.",
    ],
  },
  {
    id: "turkistan",
    name: "Turkistan",
    region: "Turkistan",
    desc: "Silk Road heritage and historic architecture",
    category: "culture",
    duration: "1 day",
    bestTime: "March - May, September - November",
    coordinates: [43.297, 68.252],
    facts: [
      "Key Silk Road destination",
      "Visit Khoja Ahmed Yasawi Mausoleum",
      "Hot summers, plan mornings and evenings",
    ],
    bio:
      "Turkistan brings cultural depth to a Kazakhstan route with spiritual history, old trade routes and warm southern atmosphere.",
    image: "/locations/turkistan.svg",
    gallery: ["/locations/turkistan.svg"],
    practicalInfo: [
      "Visit early morning to avoid midday heat in summer.",
      "Dress respectfully at spiritual sites.",
      "Consider combining Turkistan with southern Kazakh craft markets.",
    ],
    safetyTips: [
      "Stay hydrated and use sun protection in summer.",
      "Keep valuables secure in busy visitor areas.",
      "Follow local guidance around monuments.",
    ],
    leaveNoTrace: [
      "Do not leave trash near historic buildings.",
      "Avoid touching frescoes and architectural details.",
      "Use guided paths and avoid sensitive archaeological areas.",
    ],
  },
  {
    id: "bozzhyra",
    name: "Bozzhyra",
    region: "Mangystau",
    desc: "White cliffs, desert silence and alien landscapes",
    category: "desert",
    duration: "2 days",
    bestTime: "April - June, September - October",
    coordinates: [43.415, 54.071],
    facts: [
      "4x4 vehicle is strongly recommended",
      "Best with a local driver-guide",
      "No city services nearby",
    ],
    bio:
      "Bozzhyra is for travelers who want the raw, remote side of Kazakhstan: chalk cliffs, open sky and desert scale.",
    image: "/locations/photos/bozzhyra.jpg",
    gallery: ["/locations/photos/bozzhyra.jpg", "/locations/bozzhyra.svg"],
    practicalInfo: [
      "Book a local guide and 4x4 well in advance.",
      "Carry enough water, snacks, and a first-aid kit.",
      "Plan for cooler nights and strong daytime sun.",
    ],
    safetyTips: [
      "Do not venture off track without a guide.",
      "Avoid travel during the hottest midday hours.",
      "Keep your group together and notify someone of your route.",
    ],
    leaveNoTrace: [
      "Leave the chalk cliffs and desert floor untouched.",
      "Pack out all waste and minimize campfire impact.",
      "Respect the fragile desert ecology and wildlife.",
    ],
  },
];

export const ROUTES: RouteTemplate[] = [
  {
    id: "almaty-nature",
    title: "Almaty Nature Loop",
    mood: "Mountains and canyon",
    days: 3,
    distance: "520 km",
    placeIds: ["almaty", "kaindy", "charyn"],
    description:
      "A balanced route from Almaty to Kaindy Lake and Charyn Canyon with enough time for views, photos and rest.",
    steps: [
      "Day 1: Almaty city walk, Kok-Tobe and food spots.",
      "Day 2: Early road to Kaindy Lake, mountain viewpoints and overnight near Saty.",
      "Day 3: Charyn Canyon walk, sunset viewpoint and return to Almaty.",
    ],
  },
  {
    id: "capital-sprint",
    title: "Capital Sprint",
    mood: "Architecture and city comfort",
    days: 1,
    distance: "35 km",
    placeIds: ["astana"],
    description:
      "A compact Astana plan for travelers who want modern architecture, museums and an evening river walk.",
    steps: [
      "Morning: Baiterek, Nurzhol Boulevard and coffee stop.",
      "Afternoon: National Museum or Khan Shatyr.",
      "Evening: Ishim river walk and city lights.",
    ],
  },
  {
    id: "silk-road",
    title: "Silk Road Heritage",
    mood: "History and culture",
    days: 2,
    distance: "190 km",
    placeIds: ["turkistan"],
    description:
      "A southern cultural route centered on Turkistan, heritage architecture and slow evening walks.",
    steps: [
      "Day 1: Arrival, Yasawi Mausoleum and old city area.",
      "Day 2: Local markets, viewpoints and relaxed departure.",
    ],
  },
  {
    id: "mangystau-expedition",
    title: "Mangystau Expedition",
    mood: "Remote desert",
    days: 4,
    distance: "780 km",
    placeIds: ["aktau", "shakpak-ata", "sherkala", "bozzhyra"],
    description:
      "A rugged 4x4 desert route for travelers who want silence, scale and unusual landscapes.",
    steps: [
      "Day 1: Aktau arrival, supplies and guide briefing.",
      "Day 2: Road into Mangystau, sunset near Bozzhyra.",
      "Day 3: Viewpoints, short hikes and desert camp.",
      "Day 4: Return to Aktau with photo stops.",
    ],
  },
  {
    id: "mangystau-family-loop",
    title: "Mangystau Family Loop",
    mood: "Sea, geology and easy stops",
    days: 2,
    distance: "260 km",
    placeIds: ["aktau", "caspian-sea", "torysh", "sherkala"],
    description:
      "A lighter Mangystau route from Aktau with the Caspian coast, Torysh stone spheres and Sherkala without overloading the day.",
    steps: [
      "Day 1: Aktau arrival, Caspian coast and sunset.",
      "Day 2: Morning road to Torysh, Sherkala photo stop and return before late evening.",
    ],
  },
  {
    id: "white-cliffs-route",
    title: "White Cliffs Route",
    mood: "Canyons and salt flats",
    days: 3,
    distance: "540 km",
    placeIds: ["aktau", "tuzbair", "bozzhyra"],
    description:
      "A compact 4x4 plan for travelers who want Mangystau's pale cliffs, salt textures and big desert viewpoints.",
    steps: [
      "Day 1: Prepare in Aktau and confirm the 4x4 route.",
      "Day 2: Tuzbair salt flats and white cliffs with a slow photo schedule.",
      "Day 3: Bozzhyra viewpoint and return with buffer time.",
    ],
  },
];

export const CHAT_OPTIONS = [
  "Build me a 3 day nature route",
  "Where should I go first in Kazakhstan?",
  "What should I know before Bozzhyra?",
  "Plan one day in Astana",
  "I want culture and history",
];

export const normalizeQuery = (text: string) => text.trim().toLowerCase();

const includesAny = (text: string, words: string[]) =>
  words.some((word) => text.includes(word));

export function getPlacesByIds(ids: string[]) {
  return ids
    .map((id) => PLACES.find((place) => place.id === id))
    .filter((place): place is TravelPlace => Boolean(place));
}

export function getPlaceBySlug(slug: string) {
  return PLACES.find((place) => place.id === slug);
}

export function buildRouteToPlace(placeId: string, days = 2) {
  const destination = PLACES.find((place) => place.id === placeId) ?? PLACES[0];
  const start = destination.id === "almaty" ? destination : PLACES.find((place) => place.id === "almaty") ?? PLACES[0];
  const placeIds = start.id === destination.id ? [destination.id] : [start.id, destination.id];
  const adjustedDays = Math.max(1, Math.min(5, days));

  const transport =
    destination.category === "desert"
      ? "4x4 with a local driver-guide"
      : destination.category === "city"
        ? "taxi, walking and public transport"
        : "car transfer with early departure";

  const steps =
    start.id === destination.id
      ? [
          `Day 1: Arrive in ${destination.name}, check the central area and choose a comfortable base.`,
          `Day ${adjustedDays}: Keep the final part flexible for cafes, viewpoints and departure timing.`,
        ]
      : [
          `Day 1: Start in ${start.name}, prepare transport, water and offline map.`,
          `Day 2: Travel to ${destination.name} by ${transport}, stop at viewpoints and arrive before sunset.`,
          `Day ${adjustedDays}: Slow morning at ${destination.name}, then return or continue the route.`,
        ];

  return {
    title: `Road to ${destination.name}`,
    destination,
    placeIds,
    transport,
    days: adjustedDays,
    steps: Array.from(new Set(steps)),
  };
}

export function buildAssistantReply(input: string) {
  const prompt = normalizeQuery(input);

  if (includesAny(prompt, ["hello", "hi", "hey", "start", "begin", "привет", "начать"])) {
    return "Tell me your travel dates, city of arrival, budget level and mood: nature, city, culture, food or remote landscapes. If you are unsure, start with Almaty: it gives the safest mix of comfort, mountains and day trips.";
  }

  if (includesAny(prompt, ["1 day", "one day", "один день", "1 день", "day trip"])) {
    return "For one day, keep the route compact. In Almaty: Kok-Tobe, Panfilov Park, Green Bazaar, then Medeu or a mountain viewpoint. In Astana: Baiterek, Nurzhol Boulevard, National Museum or Khan Shatyr, then an Ishim river walk.";
  }

  if (includesAny(prompt, ["2 day", "two day", "2 дня", "weekend", "выходные"])) {
    return "For 2 days, choose one base and one strong outside trip. Best easy plan: Day 1 Almaty city, Kok-Tobe and food stops. Day 2 Charyn Canyon with early departure, water, sun protection and return before late evening.";
  }

  if (includesAny(prompt, ["3", "three", "nature", "природ", "горы", "mountain"])) {
    return "For a 3 day nature trip, choose Almaty Nature Loop: Day 1 Almaty, Day 2 Kaindy Lake or Kolsai area, Day 3 Charyn Canyon. It is the best first route because travel time, scenery and comfort are balanced.";
  }

  if (includesAny(prompt, ["4 day", "four", "5 day", "five", "неделя", "week"])) {
    return "For 4-5 days, build a stronger loop: Almaty arrival, Kaindy/Kolsai overnight near Saty, Charyn Canyon, then one flexible city day for food, viewpoints and rest. If you want remote drama, use those days for Mangystau with a 4x4 guide instead.";
  }

  if (includesAny(prompt, ["bozzhyra", "mangystau", "desert", "бозжыра", "мангыстау", "мангистау", "пустын"])) {
    return "For Bozzhyra, plan a 4x4 car, local driver-guide, offline maps, water, snacks and warm layers for evening. Do not treat it like a city day trip: the beauty is remote, and the logistics matter.";
  }

  if (includesAny(prompt, ["astana", "capital", "астана", "столица"])) {
    return "In Astana, start with Baiterek and Nurzhol Boulevard, then visit the National Museum or Khan Shatyr, and finish with an Ishim river walk after sunset.";
  }

  if (includesAny(prompt, ["almaty", "алматы", "алма"])) {
    return "In Almaty, combine city comfort with mountain access: Panfilov Park, Green Bazaar, Kok-Tobe, then Medeu or a nearby viewpoint. For a stronger nature day, add Charyn Canyon or Kaindy Lake with an early transfer.";
  }

  if (includesAny(prompt, ["charyn", "чарын", "canyon", "каньон"])) {
    return "For Charyn Canyon, leave Almaty early, carry water and sun protection, walk the Valley of Castles, and save time for a sunset viewpoint if transport allows. It works as a long day trip, but do not underestimate the road time.";
  }

  if (includesAny(prompt, ["kaindy", "kolsai", "каинды", "кайнды", "кольсай", "lake", "озеро"])) {
    return "For Kaindy and Kolsai, plan mountain weather and slower roads. Best simple format: overnight near Saty, Kaindy first, Kolsai next, then return to Almaty. Bring layers, cash for local services and offline maps.";
  }

  if (includesAny(prompt, ["culture", "history", "turkistan", "культур", "истори", "туркестан"])) {
    return "For culture and history, go to Turkistan. Build the day around the Yasawi Mausoleum, old city area, local food and a slow evening walk when the heat drops.";
  }

  if (includesAny(prompt, ["budget", "cheap", "cost", "money", "бюджет", "дешев", "сколько стоит", "цена"])) {
    return "For a budget-friendly Kazakhstan trip, stay in Almaty or Astana, use city taxis and public transport, choose one paid long transfer, and keep remote places for when you can share a car. Markets, city walks and viewpoints give strong value.";
  }

  if (includesAny(prompt, ["transport", "car", "taxi", "train", "bus", "транспорт", "машин", "такси", "поезд", "автобус"])) {
    return "Transport rule: use walking, taxis and public transport inside cities; use a planned car transfer for Charyn, Kaindy and Kolsai; use 4x4 plus local driver for Mangystau and Bozzhyra. For intercity comfort, compare trains and domestic flights.";
  }

  if (includesAny(prompt, ["safe", "danger", "risk", "solo", "woman", "безопас", "опасн", "одна", "один"])) {
    return "Kazakhstan is manageable for careful travelers: keep documents backed up, use registered taxis, share long-route details, avoid remote areas without a guide, carry water outside cities and check weather before mountain or desert trips.";
  }

  if (includesAny(prompt, ["family", "kids", "children", "ребен", "дет", "семья"])) {
    return "With family or kids, keep routes shorter and predictable: Almaty city, Kok-Tobe, parks, Medeu area, Astana architecture walks and museums. Avoid very long desert roads unless the group is comfortable with remote travel.";
  }

  if (includesAny(prompt, ["food", "eat", "restaurant", "dish", "еда", "ресторан", "что попробовать"])) {
    return "For food, try beshbarmak, baursak, kazy, lagman, plov and tea culture. In cities, mix one local restaurant with a market stop like Green Bazaar. For remote trips, carry snacks because cafes can be far apart.";
  }

  if (includesAny(prompt, ["season", "month", "weather", "winter", "summer", "spring", "autumn", "сезон", "погода", "зима", "лето", "весна", "осень"])) {
    return "Best general season is April to October. Spring and autumn are comfortable for cities, canyons and Turkistan. Summer is good for high mountain lakes but hot in the south. Winter works best for city routes and snowy mountain views near Almaty.";
  }

  if (includesAny(prompt, ["visa", "passport", "document", "виза", "паспорт", "документ"])) {
    return "For documents, check your passport validity, entry rules for your nationality and hotel registration requirements before departure. Keep digital copies offline. I cannot confirm live visa rules, so verify them with an official source before booking.";
  }

  if (includesAny(prompt, ["pack", "bring", "clothes", "wear", "bag", "что взять", "одежд", "рюкзак"])) {
    return "Pack layers, comfortable walking shoes, sun protection, refillable water bottle, power bank, offline maps and some cash. For mountains add a warm layer and rain shell. For desert add extra water, snacks and wind protection.";
  }

  if (includesAny(prompt, ["photo", "instagram", "view", "sunset", "sunrise", "фото", "вид", "закат", "рассвет"])) {
    return "For photos, choose Kok-Tobe or mountain viewpoints near Almaty, Valley of Castles in Charyn, Kaindy Lake for surreal water colors, Astana city lights, Turkistan in soft evening light and Bozzhyra for sunrise or sunset scale.";
  }

  if (includesAny(prompt, ["romantic", "couple", "date", "роман", "пара", "свидан"])) {
    return "For a romantic route, choose Almaty cafes plus Kok-Tobe at sunset, a calm mountain viewpoint, or an Astana evening river walk. If you want something cinematic, Kaindy/Kolsai with an overnight near Saty feels more memorable.";
  }

  if (includesAny(prompt, ["adventure", "extreme", "hike", "camp", "приключ", "поход", "кемп", "экстрим"])) {
    return "For adventure, choose Charyn hiking viewpoints, Kaindy/Kolsai mountain roads, or Mangystau desert landscapes. Keep it safe: local guide for remote zones, offline maps, water, weather check and no last-minute night driving.";
  }

  if (includesAny(prompt, ["first", "where should", "куда", "впервые", "первый раз"])) {
    return "Start in Almaty if this is your first Kazakhstan trip. It gives you city comfort, mountain access, and easy day trips to Kaindy Lake and Charyn Canyon.";
  }

  if (includesAny(prompt, ["compare", "better", "which", "or ", "сравни", "лучше", "или"])) {
    return "Choose by mood: Almaty is best for first-time nature and food, Astana for clean architecture and an easy city day, Turkistan for history, Charyn for a dramatic day trip, Kaindy/Kolsai for mountains, and Bozzhyra for remote desert scale.";
  }

  return "I would choose the route based on your travel style: Almaty Nature Loop for first-time nature, Capital Sprint for one clean city day, Silk Road Heritage for culture, Mangystau Expedition for remote desert adventure, or a compact city route if time and budget are tight.";
}
