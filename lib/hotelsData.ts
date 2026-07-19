import type { Coordinates } from "@/lib/geo";

export type HotelType = "hotel" | "guest house" | "camping" | "resort";

export type HotelOption = {
  id: string;
  name: string;
  type: HotelType;
  cityArea: string;
  coordinates: Coordinates;
  address: string;
  rating: number;
  priceRange: string;
  image: string;
  amenities: string[];
  recommendedFor: string[];
};

export type NearbyService = {
  id: string;
  name: string;
  type:
    | "transport"
    | "fuel"
    | "medical"
    | "airport"
    | "camping"
    | "restaurant"
    | "toilet"
    | "pharmacy";
  coordinates: Coordinates;
  address: string;
  note: string;
};

export function isPreviewHotel(hotel: Pick<HotelOption, "address">) {
  return /\bdemo\b/i.test(hotel.address);
}

export function buildHotelMapsSearchUrl(
  hotel: Pick<HotelOption, "name" | "address" | "coordinates">
) {
  const query = isPreviewHotel(hotel)
    ? hotel.coordinates.join(",")
    : `${hotel.name}, ${hotel.address}`;

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export const mangystauHotels: HotelOption[] = [
  {
    id: "renaissance-aktau",
    name: "Renaissance Aktau Hotel",
    type: "hotel",
    cityArea: "Aktau seaside",
    coordinates: [43.6479, 51.1558],
    address: "Microdistrict 9, Aktau",
    rating: 4.6,
    priceRange: "55 000 - 95 000 KZT",
    image: "/locations/photos/caspian-sea.jpg",
    amenities: ["Sea view", "Breakfast", "Airport transfer"],
    recommendedFor: ["Comfort base", "Business travelers", "First night in Aktau"],
  },
  {
    id: "holiday-inn-aktau",
    name: "Holiday Inn Aktau",
    type: "hotel",
    cityArea: "Aktau center",
    coordinates: [43.6536, 51.1622],
    address: "Microdistrict 4, Aktau",
    rating: 4.4,
    priceRange: "38 000 - 70 000 KZT",
    image: "/locations/photos/caspian-sea.jpg",
    amenities: ["Breakfast", "Parking", "City access"],
    recommendedFor: ["Short stays", "Route preparation", "Families"],
  },
  {
    id: "grand-hotel-victory",
    name: "Grand Hotel Victory Aktau",
    type: "hotel",
    cityArea: "Aktau city",
    coordinates: [43.6583, 51.1664],
    address: "Microdistrict 13, Aktau",
    rating: 4.5,
    priceRange: "42 000 - 82 000 KZT",
    image: "/locations/photos/caspian-sea.jpg",
    amenities: ["Restaurant", "Gym", "Driver pickup"],
    recommendedFor: ["Comfort", "Driver meeting point", "Longer stays"],
  },
  {
    id: "caspian-riviera-grand-palace",
    name: "Caspian Riviera Grand Palace",
    type: "resort",
    cityArea: "Aktau coast",
    coordinates: [43.6324, 51.1499],
    address: "Warm Beach area, Aktau",
    rating: 4.5,
    priceRange: "70 000 - 135 000 KZT",
    image: "/locations/photos/caspian-sea.jpg",
    amenities: ["Sea access", "Pool", "Restaurant"],
    recommendedFor: ["Rest day", "Couples", "Sea views"],
  },
  {
    id: "chagala-aktau",
    name: "Chagala Aktau Hotel",
    type: "hotel",
    cityArea: "Aktau center",
    coordinates: [43.6515, 51.1591],
    address: "Microdistrict 1, Aktau",
    rating: 4.1,
    priceRange: "28 000 - 52 000 KZT",
    image: "/locations/photos/caspian-sea.jpg",
    amenities: ["Breakfast", "Laundry", "Central location"],
    recommendedFor: ["Budget comfort", "Solo travelers", "City base"],
  },
  {
    id: "dostar-hotel-aktau",
    name: "Dostar Hotel Aktau",
    type: "hotel",
    cityArea: "Aktau",
    coordinates: [43.6702, 51.1785],
    address: "Aktau northern city area",
    rating: 4.0,
    priceRange: "22 000 - 42 000 KZT",
    image: "/locations/photos/caspian-sea.jpg",
    amenities: ["Parking", "Cafe", "Simple rooms"],
    recommendedFor: ["Budget stays", "Driver pickup", "Early departure"],
  },
  {
    id: "three-dolphins",
    name: "Three Dolphins Hotel",
    type: "hotel",
    cityArea: "Aktau seaside",
    coordinates: [43.6501, 51.1511],
    address: "Aktau seaside district",
    rating: 4.2,
    priceRange: "26 000 - 50 000 KZT",
    image: "/locations/photos/caspian-sea.jpg",
    amenities: ["Sea walk", "Breakfast", "Family rooms"],
    recommendedFor: ["Families", "Sea evening", "Short stays"],
  },
  {
    id: "hotel-salem-aktau",
    name: "Hotel Salem Aktau",
    type: "hotel",
    cityArea: "Aktau",
    coordinates: [43.6648, 51.1724],
    address: "Aktau city area",
    rating: 3.9,
    priceRange: "18 000 - 34 000 KZT",
    image: "/locations/photos/caspian-sea.jpg",
    amenities: ["Budget rooms", "Parking", "Cafe nearby"],
    recommendedFor: ["Budget", "Transit", "Simple overnight"],
  },
  {
    id: "aktau-airport-hotel",
    name: "Aktau Airport Hotel",
    type: "hotel",
    cityArea: "Aktau airport",
    coordinates: [43.8582, 51.0888],
    address: "Aktau International Airport area",
    rating: 4.0,
    priceRange: "24 000 - 46 000 KZT",
    image: "/locations/photos/caspian-sea.jpg",
    amenities: ["Airport access", "Early flights", "Taxi pickup"],
    recommendedFor: ["Late arrivals", "Early flights", "Transit"],
  },
  {
    id: "bozzhyra-desert-camp",
    name: "Bozzhyra Desert Camp",
    type: "camping",
    cityArea: "Bozzhyra area",
    coordinates: [43.422, 54.052],
    address: "Demo camp near Bozzhyra viewpoint zone",
    rating: 4.3,
    priceRange: "35 000 - 55 000 KZT",
    image: "/locations/photos/bozzhyra.jpg",
    amenities: ["Dinner demo", "Guide pickup", "Sunset access"],
    recommendedFor: ["4x4 tours", "Sunset", "Remote overnight"],
  },
  {
    id: "sherkala-guest-camp",
    name: "Sherkala Guest Camp",
    type: "guest house",
    cityArea: "Sherkala route",
    coordinates: [44.228, 51.988],
    address: "Demo guest stay near Sherkala route",
    rating: 4.1,
    priceRange: "18 000 - 32 000 KZT",
    image: "/locations/photos/sherkala.jpg",
    amenities: ["Local dinner", "Parking", "Route advice"],
    recommendedFor: ["One-day loop", "Families", "Local stop"],
  },
  {
    id: "torysh-family-camp",
    name: "Torysh Family Camp",
    type: "camping",
    cityArea: "Torysh Valley",
    coordinates: [44.101, 51.781],
    address: "Demo camping near Torysh Valley",
    rating: 4.0,
    priceRange: "15 000 - 28 000 KZT",
    image: "/locations/photos/torysh.jpg",
    amenities: ["Family stop", "Picnic area", "Guide contact"],
    recommendedFor: ["Family routes", "Geology stops", "Budget travelers"],
  },
];

export const nearbyServices: NearbyService[] = [
  {
    id: "aktau-driver-hub",
    name: "Aktau Driver Hub",
    type: "transport",
    coordinates: [43.6527, 51.161],
    address: "Aktau center",
    note: "Demo pickup point for taxi, crossover and SUV drivers.",
  },
  {
    id: "aktau-airport",
    name: "Aktau International Airport",
    type: "airport",
    coordinates: [43.8582, 51.0888],
    address: "Aktau airport area",
    note: "Useful for arrivals, departures and airport hotel stays.",
  },
  {
    id: "munaily-fuel-stop",
    name: "Munaily Fuel Stop",
    type: "fuel",
    coordinates: [43.695, 51.313],
    address: "Road from Aktau toward inland routes",
    note: "Demo fuel stop before longer Mangystau drives.",
  },
  {
    id: "aktau-medical-center",
    name: "Aktau Medical Center",
    type: "medical",
    coordinates: [43.6532, 51.1694],
    address: "Aktau city",
    note: "Demo emergency planning point for city-based travelers.",
  },
  {
    id: "aktau-pharmacy-center",
    name: "Central Aktau Pharmacy",
    type: "pharmacy",
    coordinates: [43.6518, 51.1635],
    address: "Aktau center",
    note: "Demo pharmacy stop before remote routes.",
  },
  {
    id: "aktau-seaside-restaurant",
    name: "Caspian Seaside Restaurant",
    type: "restaurant",
    coordinates: [43.6506, 51.1498],
    address: "Aktau seaside",
    note: "Demo food stop near the coast and city hotels.",
  },
  {
    id: "aktau-public-toilets",
    name: "Aktau Seaside Facilities",
    type: "toilet",
    coordinates: [43.6539, 51.1512],
    address: "Aktau promenade",
    note: "Demo public facilities marker for city-based plans.",
  },
  {
    id: "zhanaozen-fuel",
    name: "Zhanaozen Fuel Stop",
    type: "fuel",
    coordinates: [43.34, 52.86],
    address: "Zhanaozen route area",
    note: "Useful demo fuel stop before Bozzhyra and Beket-Ata routes.",
  },
  {
    id: "route-basic-facilities",
    name: "Route Facilities Point",
    type: "toilet",
    coordinates: [43.46, 52.98],
    address: "Remote route demo stop",
    note: "Basic facilities are limited; confirm with your driver.",
  },
  {
    id: "bozzhyra-tour-camp",
    name: "Bozzhyra Tour Camp",
    type: "camping",
    coordinates: [43.424, 54.06],
    address: "Demo remote camp near Bozzhyra",
    note: "Remote stay option that requires SUV logistics.",
  },
];
