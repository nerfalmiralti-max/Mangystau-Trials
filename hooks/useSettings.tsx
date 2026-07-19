"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { MotionConfig } from "framer-motion";
import {
  defaultSettings,
  detectLanguage,
  readStoredSettings,
  resolveLanguage,
  settingsChangedEvent,
  writeStoredSettings,
  type AppLanguage,
  type AppSettings,
} from "@/lib/settingsStorage";

type TranslationKey =
  | "nav.home"
  | "nav.routes"
  | "nav.explore"
  | "nav.map"
  | "nav.route"
  | "nav.places"
  | "nav.locations"
  | "nav.guide"
  | "nav.settings"
  | "nav.saved"
  | "nav.offline"
  | "nav.profile"
  | "nav.help"
  | "nav.about"
  | "nav.start"
  | "nav.preferences"
  | "nav.savedMeta"
  | "nav.offlineMeta"
  | "nav.account"
  | "nav.support"
  | "nav.quickAccess"
  | "auth.login"
  | "auth.signup"
  | "auth.logout"
  | "auth.createAccount"
  | "auth.pleaseWait"
  | "settings.current"
  | "settings.saved"
  | "settings.save"
  | "settings.saving"
  | "settings.unsaved"
  | "settings.language"
  | "settings.auto"
  | "settings.autoBadge"
  | "settings.appearance"
  | "settings.mapStyle"
  | "settings.locationPermission"
  | "settings.locationHelp"
  | "settings.status"
  | "settings.coordinates"
  | "settings.notShared"
  | "settings.enable"
  | "settings.update"
  | "settings.updating"
  | "settings.notifications"
  | "settings.routeUpdates"
  | "settings.weatherAlerts"
  | "settings.newDestinations"
  | "settings.satellitePreview"
  | "settings.light"
  | "settings.dark"
  | "settings.system"
  | "settings.standard"
  | "settings.satellite"
  | "settings.enabled"
  | "settings.disabled"
  | "settings.denied"
  | "settings.notSupported"
  | "profile.title"
  | "profile.description"
  | "profile.label"
  | "profile.saved"
  | "profile.trips"
  | "profile.routes"
  | "profile.since"
  | "profile.name"
  | "profile.email"
  | "profile.country"
  | "profile.session"
  | "profile.active"
  | "profile.notSet"
  | "profile.touristAccess"
  | "profile.loginTitle"
  | "profile.signupTitle"
  | "profile.loginCopy"
  | "profile.signupCopy"
  | "profile.welcomeBack"
  | "profile.newTraveler"
  | "profile.sessionNote"
  | "profile.touristName"
  | "profile.password"
  | "profile.accountCreated"
  | "profile.welcome"
  | "profile.signedOut"
  | "help.faq"
  | "help.feedbackEyebrow"
  | "help.sendFeedback"
  | "help.email"
  | "help.subject"
  | "help.message"
  | "help.send"
  | "help.feedbackSaved"
  | "help.invalidEmail"
  | "help.required"
  | "help.reportProblem"
  | "help.problemReport"
  | "help.category"
  | "help.description"
  | "help.optionalScreenshot"
  | "help.reportSaved";

type SettingsContextValue = {
  settings: AppSettings;
  detectedLanguage: AppLanguage;
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  saveSettings: (settings: AppSettings) => AppSettings;
};

const translations: Record<AppLanguage, Record<TranslationKey, string>> = {
  en: {
    "nav.home": "Home",
    "nav.routes": "Routes",
    "nav.explore": "Explore",
    "nav.map": "Map",
    "nav.route": "Route",
    "nav.places": "Places",
    "nav.locations": "Locations",
    "nav.guide": "Guide",
    "nav.settings": "Settings",
    "nav.saved": "Saved",
    "nav.offline": "Offline",
    "nav.profile": "Profile",
    "nav.help": "Help & FAQ",
    "nav.about": "About",
    "nav.start": "Start",
    "nav.preferences": "Preferences",
    "nav.savedMeta": "Places, hotels, routes",
    "nav.offlineMeta": "Guides and maps",
    "nav.account": "Account",
    "nav.support": "Support",
    "nav.quickAccess": "Quick access",
    "auth.login": "Log in",
    "auth.signup": "Sign up",
    "auth.logout": "Logout",
    "auth.createAccount": "Create account",
    "auth.pleaseWait": "Please wait...",
    "settings.current": "Current settings",
    "settings.saved": "Settings saved",
    "settings.save": "Save changes",
    "settings.saving": "Saving...",
    "settings.unsaved": "Unsaved changes",
    "settings.language": "Language",
    "settings.auto": "Auto",
    "settings.autoBadge": "Auto",
    "settings.appearance": "Appearance",
    "settings.mapStyle": "Map Style",
    "settings.locationPermission": "Location Permission",
    "settings.locationHelp": "Location is requested only after you click Enable.",
    "settings.status": "Status",
    "settings.coordinates": "Coordinates",
    "settings.notShared": "Not shared",
    "settings.enable": "Enable",
    "settings.update": "Update",
    "settings.updating": "Updating...",
    "settings.notifications": "Notifications",
    "settings.routeUpdates": "Route Updates",
    "settings.weatherAlerts": "Weather Alerts",
    "settings.newDestinations": "New Destinations",
    "settings.satellitePreview": "Satellite map preview mode",
    "settings.light": "Light",
    "settings.dark": "Dark",
    "settings.system": "System",
    "settings.standard": "Standard",
    "settings.satellite": "Satellite",
    "settings.enabled": "Enabled",
    "settings.disabled": "Disabled",
    "settings.denied": "Denied",
    "settings.notSupported": "Not supported",
    "profile.title": "Tourist Profile",
    "profile.description": "Account access, saved trip context and session control in one compact place.",
    "profile.label": "Profile",
    "profile.saved": "Saved",
    "profile.trips": "Trips",
    "profile.routes": "Routes",
    "profile.since": "Since",
    "profile.name": "Name",
    "profile.email": "Email",
    "profile.country": "Country",
    "profile.session": "Session",
    "profile.active": "Active",
    "profile.notSet": "Not set",
    "profile.touristAccess": "Tourist access",
    "profile.loginTitle": "Log in to your route space",
    "profile.signupTitle": "Sign up for smarter trips",
    "profile.loginCopy": "Use your email and password to return to saved routes, visited places and your travel profile.",
    "profile.signupCopy": "Create an account to save generated routes, remember your travel style and build future Kazakhstan plans faster.",
    "profile.welcomeBack": "Welcome back",
    "profile.newTraveler": "New traveler",
    "profile.sessionNote": "Local demo session",
    "profile.touristName": "Tourist name",
    "profile.password": "Password",
    "profile.accountCreated": "Account created. Welcome to MangystauTrails.",
    "profile.welcome": "Welcome back.",
    "profile.signedOut": "You are signed out.",
    "help.faq": "FAQ",
    "help.feedbackEyebrow": "Contact & Feedback",
    "help.sendFeedback": "Send feedback",
    "help.email": "Email / Gmail",
    "help.subject": "Subject",
    "help.message": "Message",
    "help.send": "Send",
    "help.feedbackSaved": "Feedback saved. Thank you.",
    "help.invalidEmail": "Please enter a valid email address.",
    "help.required": "Email, subject and message are required.",
    "help.reportProblem": "Report a Problem",
    "help.problemReport": "Problem report",
    "help.category": "Category",
    "help.description": "Description",
    "help.optionalScreenshot": "Optional screenshot",
    "help.reportSaved": "Report saved locally",
  },
  ru: {
    "nav.home": "Главная",
    "nav.routes": "Маршруты",
    "nav.explore": "Карта",
    "nav.map": "Карта",
    "nav.route": "Маршрут",
    "nav.places": "Места",
    "nav.locations": "Локации",
    "nav.guide": "Гид",
    "nav.settings": "Настройки",
    "nav.saved": "Сохранено",
    "nav.offline": "Офлайн",
    "nav.profile": "Профиль",
    "nav.help": "Помощь",
    "nav.about": "О проекте",
    "nav.start": "Старт",
    "nav.preferences": "Параметры",
    "nav.savedMeta": "Места, отели, маршруты",
    "nav.offlineMeta": "Гиды и карты",
    "nav.account": "Аккаунт",
    "nav.support": "Поддержка",
    "nav.quickAccess": "Быстрый доступ",
    "auth.login": "Войти",
    "auth.signup": "Регистрация",
    "auth.logout": "Выйти",
    "auth.createAccount": "Создать аккаунт",
    "auth.pleaseWait": "Подождите...",
    "settings.current": "Текущие настройки",
    "settings.saved": "Настройки сохранены",
    "settings.save": "Сохранить изменения",
    "settings.saving": "Сохранение...",
    "settings.unsaved": "Есть несохраненные изменения",
    "settings.language": "Язык",
    "settings.auto": "Авто",
    "settings.autoBadge": "Авто",
    "settings.appearance": "Тема",
    "settings.mapStyle": "Стиль карты",
    "settings.locationPermission": "Доступ к геолокации",
    "settings.locationHelp": "Геолокация запрашивается только после нажатия Enable.",
    "settings.status": "Статус",
    "settings.coordinates": "Координаты",
    "settings.notShared": "Не передано",
    "settings.enable": "Включить",
    "settings.update": "Обновить",
    "settings.updating": "Обновление...",
    "settings.notifications": "Уведомления",
    "settings.routeUpdates": "Обновления маршрутов",
    "settings.weatherAlerts": "Погода",
    "settings.newDestinations": "Новые места",
    "settings.satellitePreview": "Режим спутниковой карты",
    "settings.light": "Светлая",
    "settings.dark": "Темная",
    "settings.system": "Системная",
    "settings.standard": "Стандарт",
    "settings.satellite": "Спутник",
    "settings.enabled": "Включено",
    "settings.disabled": "Выключено",
    "settings.denied": "Запрещено",
    "settings.notSupported": "Не поддерживается",
    "profile.title": "Профиль туриста",
    "profile.description": "Доступ к аккаунту, сохраненные поездки и управление сессией в одном месте.",
    "profile.label": "Профиль",
    "profile.saved": "Сохранено",
    "profile.trips": "Поездки",
    "profile.routes": "Маршруты",
    "profile.since": "С",
    "profile.name": "Имя",
    "profile.email": "Email",
    "profile.country": "Страна",
    "profile.session": "Сессия",
    "profile.active": "Активна",
    "profile.notSet": "Не указано",
    "profile.touristAccess": "Доступ туриста",
    "profile.loginTitle": "Войдите в пространство маршрутов",
    "profile.signupTitle": "Создайте профиль для поездок",
    "profile.loginCopy": "Используйте email и пароль, чтобы вернуться к маршрутам, местам и профилю.",
    "profile.signupCopy": "Создайте аккаунт, чтобы сохранять маршруты, стиль поездки и будущие планы по Казахстану.",
    "profile.welcomeBack": "С возвращением",
    "profile.newTraveler": "Новый турист",
    "profile.sessionNote": "Локальная demo-сессия",
    "profile.touristName": "Имя туриста",
    "profile.password": "Пароль",
    "profile.accountCreated": "Аккаунт создан. Добро пожаловать в MangystauTrails.",
    "profile.welcome": "С возвращением.",
    "profile.signedOut": "Вы вышли из аккаунта.",
    "help.faq": "FAQ",
    "help.feedbackEyebrow": "Связь и отзыв",
    "help.sendFeedback": "Отправить отзыв",
    "help.email": "Email / Gmail",
    "help.subject": "Тема",
    "help.message": "Сообщение",
    "help.send": "Отправить",
    "help.feedbackSaved": "Отзыв сохранен. Спасибо.",
    "help.invalidEmail": "Введите корректный email.",
    "help.required": "Email, тема и сообщение обязательны.",
    "help.reportProblem": "Сообщить о проблеме",
    "help.problemReport": "Отчет о проблеме",
    "help.category": "Категория",
    "help.description": "Описание",
    "help.optionalScreenshot": "Скриншот (необязательно)",
    "help.reportSaved": "Отчет сохранен локально",
  },
  kk: {
    "nav.home": "Басты",
    "nav.routes": "Маршруттар",
    "nav.explore": "Карта",
    "nav.map": "Карта",
    "nav.route": "Маршрут",
    "nav.places": "Орындар",
    "nav.locations": "Локациялар",
    "nav.guide": "Гид",
    "nav.settings": "Баптаулар",
    "nav.saved": "Сақталған",
    "nav.offline": "Офлайн",
    "nav.profile": "Профиль",
    "nav.help": "Көмек",
    "nav.about": "Жоба туралы",
    "nav.start": "Бастау",
    "nav.preferences": "Параметрлер",
    "nav.savedMeta": "Орындар, қонақүйлер, маршруттар",
    "nav.offlineMeta": "Гидтер және карталар",
    "nav.account": "Аккаунт",
    "nav.support": "Қолдау",
    "nav.quickAccess": "Жылдам қолжеткізу",
    "auth.login": "Кіру",
    "auth.signup": "Тіркелу",
    "auth.logout": "Шығу",
    "auth.createAccount": "Аккаунт жасау",
    "auth.pleaseWait": "Күтіңіз...",
    "settings.current": "Ағымдағы баптаулар",
    "settings.saved": "Баптаулар сақталды",
    "settings.save": "Өзгерістерді сақтау",
    "settings.saving": "Сақталуда...",
    "settings.unsaved": "Сақталмаған өзгерістер бар",
    "settings.language": "Тіл",
    "settings.auto": "Авто",
    "settings.autoBadge": "Авто",
    "settings.appearance": "Көрініс",
    "settings.mapStyle": "Карта стилі",
    "settings.locationPermission": "Геолокация рұқсаты",
    "settings.locationHelp": "Геолокация Enable басылғаннан кейін ғана сұралады.",
    "settings.status": "Күйі",
    "settings.coordinates": "Координаттар",
    "settings.notShared": "Берілмеген",
    "settings.enable": "Қосу",
    "settings.update": "Жаңарту",
    "settings.updating": "Жаңартылуда...",
    "settings.notifications": "Хабарламалар",
    "settings.routeUpdates": "Маршрут жаңартулары",
    "settings.weatherAlerts": "Ауа райы",
    "settings.newDestinations": "Жаңа орындар",
    "settings.satellitePreview": "Спутниктік карта режимі",
    "settings.light": "Жарық",
    "settings.dark": "Қараңғы",
    "settings.system": "Жүйелік",
    "settings.standard": "Стандарт",
    "settings.satellite": "Спутник",
    "settings.enabled": "Қосулы",
    "settings.disabled": "Өшірулі",
    "settings.denied": "Тыйым салынған",
    "settings.notSupported": "Қолдау жоқ",
    "profile.title": "Турист профилі",
    "profile.description": "Аккаунт, сақталған сапарлар және сессия басқаруы бір жерде.",
    "profile.label": "Профиль",
    "profile.saved": "Сақталған",
    "profile.trips": "Сапарлар",
    "profile.routes": "Маршруттар",
    "profile.since": "Бастап",
    "profile.name": "Аты",
    "profile.email": "Email",
    "profile.country": "Ел",
    "profile.session": "Сессия",
    "profile.active": "Белсенді",
    "profile.notSet": "Көрсетілмеген",
    "profile.touristAccess": "Турист кіруі",
    "profile.loginTitle": "Маршрут кеңістігіне кіріңіз",
    "profile.signupTitle": "Сапарлар үшін профиль жасаңыз",
    "profile.loginCopy": "Маршруттарға, орындарға және профильге оралу үшін email мен парольді қолданыңыз.",
    "profile.signupCopy": "Маршруттарды, сапар стилін және болашақ жоспарларды сақтау үшін аккаунт жасаңыз.",
    "profile.welcomeBack": "Қайта қош келдіңіз",
    "profile.newTraveler": "Жаңа турист",
    "profile.sessionNote": "Жергілікті demo-сессия",
    "profile.touristName": "Турист аты",
    "profile.password": "Пароль",
    "profile.accountCreated": "Аккаунт жасалды. MangystauTrails-қа қош келдіңіз.",
    "profile.welcome": "Қайта қош келдіңіз.",
    "profile.signedOut": "Аккаунттан шықтыңыз.",
    "help.faq": "FAQ",
    "help.feedbackEyebrow": "Байланыс және пікір",
    "help.sendFeedback": "Пікір жіберу",
    "help.email": "Email / Gmail",
    "help.subject": "Тақырып",
    "help.message": "Хабарлама",
    "help.send": "Жіберу",
    "help.feedbackSaved": "Пікір сақталды. Рақмет.",
    "help.invalidEmail": "Дұрыс email енгізіңіз.",
    "help.required": "Email, тақырып және хабарлама міндетті.",
    "help.reportProblem": "Мәселе туралы хабарлау",
    "help.problemReport": "Мәселе есебі",
    "help.category": "Санат",
    "help.description": "Сипаттама",
    "help.optionalScreenshot": "Скриншот (міндетті емес)",
    "help.reportSaved": "Есеп жергілікті сақталды",
  },
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [detectedLanguage, setDetectedLanguage] = useState<AppLanguage>("en");
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setDetectedLanguage(detectLanguage());
      setSettings(readStoredSettings());
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = resolveLanguage(settings, detectedLanguage);
  }, [detectedLanguage, settings]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "mangystau:settings") {
        setSettings(readStoredSettings());
      }
    };
    const handleSettingsChanged = (event: Event) => {
      const nextSettings = (event as CustomEvent<AppSettings>).detail;
      setSettings(nextSettings);
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(settingsChangedEvent, handleSettingsChanged);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(settingsChangedEvent, handleSettingsChanged);
    };
  }, []);

  const saveSettings = useCallback((nextSettings: AppSettings) => {
    const savedSettings = writeStoredSettings(nextSettings);
    setSettings(savedSettings);
    return savedSettings;
  }, []);

  const language = resolveLanguage(settings, detectedLanguage);
  const t = useCallback((key: TranslationKey) => translations[language][key] ?? translations.en[key], [language]);
  const value = useMemo(
    () => ({
      settings,
      detectedLanguage,
      language,
      t,
      saveSettings,
    }),
    [detectedLanguage, language, saveSettings, settings, t]
  );

  return (
    <SettingsContext.Provider value={value}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider");
  }

  return context;
}
