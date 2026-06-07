export const PLACES = [
  {
    name: "Almaty",
    desc: "Mountains and cultural capital",
    facts: [
      "Largest city in Kazakhstan",
      "Located near the Tian Shan mountains",
      "Former capital of Kazakhstan",
      "Tour guide: +7 701 123 45 67",
    ],
    bio:
      "Almaty is the cultural and economic center of Kazakhstan, known for its green streets, mountains and modern lifestyle.",
  },
  {
    name: "Astana",
    desc: "Futuristic capital city",
    facts: [
      "Capital of Kazakhstan since 1997",
      "Known for modern architecture",
      "One of the coldest capitals in the world",
      "Tour guide: +7 702 555 88 11",
    ],
    bio:
      "Astana is a planned capital city with futuristic buildings and rapid development.",
  },
  {
    name: "Charyn Canyon",
    desc: "Grand canyon of Central Asia",
    facts: [
      "Around 154 km long",
      "Formed over millions of years",
      "Part of Charyn National Park",
      "Tour guide: +7 707 222 90 10",
    ],
    bio:
      "Charyn Canyon is one of the most dramatic natural landscapes in Kazakhstan.",
  },
  {
    name: "Kaindy Lake",
    desc: "Sunken forest lake",
    facts: [
      "Formed after 1911 earthquake",
      "Contains submerged pine forest",
      "Located in the mountains near Almaty",
      "Tour guide: +7 705 888 44 22",
    ],
    bio:
      "Kaindy Lake is famous for its underwater forest and surreal turquoise water.",
  },
  {
    name: "Bozzhyra",
    desc: "Alien desert landscape",
    facts: [
      "Located in Mangystau region",
      "White chalk cliffs",
      "One of the most surreal landscapes in Kazakhstan",
      "Tour guide: +7 700 333 11 99",
    ],
    bio:
      "Bozzhyra is known for its dramatic white cliffs and alien-like scenery.",
  },
];

export const ROUTES = [
  {
    title: "Silk Road Insight",
    description:
      "Трехдневный маршрут через Алматы, озеро Каинды и Чарынский каньон для первого знакомства с регионом.",
  },
  {
    title: "Capital Sprint",
    description:
      "Однодневный маршрут по Астане: Байтерек, Хан-Шатыр и набережная.",
  },
  {
    title: "Mountain Retreat",
    description:
      "Путешествие к озеру Каинды и зеленым долинам Алматы с ночевкой в горах.",
  },
  {
    title: "Desert Minimal",
    description:
      "Легкий маршрут по Бозжыра и западным пейзажам для стильного цифрового опыта.",
  },
];

export const CHAT_OPTIONS = [
  "Куда можно пойти в Казахстане?",
  "Что посмотреть в Алматы?",
  "Как посмотреть Астану за один день?",
  "Какие природные места стоит посетить?",
  "Мне нужен маршрут на 3 дня",
];

export const BUILTIN_RESPONSES: Record<string, string> = {
  "куда можно пойти в казахстане?":
    "В NomadGo вы найдете ключевые маршруты: Алматы с горами, Астана с футуристической архитектурой, Чарынский каньон, озеро Каинды и Бозжыра.",
  "что посмотреть в алматы?":
    "В Алматы стоит посетить зеленые парки, площадь Республики, Кок-Тобе и отправиться на однодневную поездку к озеру Каинды или в Чарынский каньон.",
  "как посмотреть астану за один день?":
    "Начните с Байтерека, затем прогуляйтесь по Хан-Шатыр и завершите день на набережной реки Есиль.",
  "какие природные места стоит посетить?":
    "Лучшие природные локации: Чарынский каньон, озеро Каинды и Бозжыра — разный ландшафт, разное настроение.",
  "мне нужен маршрут на 3 дня":
    "День 1: Алматы и Кок-Тобе. День 2: озеро Каинды и Чарынский каньон. День 3: Астана — Байтерек, Хан-Шатыр и набережная.",
};

export const normalizeQuery = (text: string) => text.trim().toLowerCase();
