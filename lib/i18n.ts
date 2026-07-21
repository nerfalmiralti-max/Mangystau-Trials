export type AppLanguage = "kk" | "ru" | "en";

export const supportedLanguages: readonly AppLanguage[] = ["kk", "ru", "en"];
export const languageCookieName = "mangystau-language";
export const languageModeCookieName = "mangystau-language-mode";

type TranslationValues = Record<string, string | number>;

const uiText = {
  "Skip to content": { ru: "Перейти к содержимому", kk: "Мазмұнға өту" },
  "Open menu": { ru: "Открыть меню", kk: "Мәзірді ашу" },
  "Close menu": { ru: "Закрыть меню", kk: "Мәзірді жабу" },
  "Primary navigation": { ru: "Основная навигация", kk: "Негізгі навигация" },
  "Mobile navigation": { ru: "Мобильная навигация", kk: "Мобильді навигация" },
  "Secondary navigation": { ru: "Дополнительная навигация", kk: "Қосымша навигация" },
  "Menu": { ru: "Меню", kk: "Мәзір" },
  "Destination guides": { ru: "Гиды по местам", kk: "Орындар гидтері" },
  "Language": { ru: "Язык", kk: "Тіл" },
  "Select language": { ru: "Выбрать язык", kk: "Тілді таңдау" },
  "Current language": { ru: "Текущий язык", kk: "Ағымдағы тіл" },
  "Kazakh": { ru: "Казахский", kk: "Қазақша" },
  "Russian": { ru: "Русский", kk: "Орысша" },
  "English": { ru: "Английский", kk: "Ағылшынша" },
  "Auto": { ru: "Авто", kk: "Авто" },
  "Save": { ru: "Сохранить", kk: "Сақтау" },
  "Reset": { ru: "Сбросить", kk: "Қалпына келтіру" },
  "Back": { ru: "Назад", kk: "Артқа" },
  "Continue": { ru: "Продолжить", kk: "Жалғастыру" },
  "Loading page content": { ru: "Загрузка страницы", kk: "Бет жүктелуде" },
  "Loading route builder": { ru: "Загрузка планировщика", kk: "Маршрут құрастырушы жүктелуде" },
  "Notifications": { ru: "Уведомления", kk: "Хабарламалар" },

  "Home": { ru: "Главная", kk: "Басты" },
  "Explore Kazakhstan through practical travel experiences and discover hidden destinations.": { ru: "Исследуйте Казахстан через практичные маршруты и открывайте малоизвестные места.", kk: "Қазақстанды практикалық сапарлар арқылы зерттеп, көпшілік біле бермейтін орындарды ашыңыз." },
  "Use a scenario-based travel assistant and build personalized journeys across Kazakhstan.": { ru: "Используйте сценарный помощник и создавайте персональные путешествия по Казахстану.", kk: "Сценарийлік көмекшімен Қазақстан бойынша жеке сапарлар құрыңыз." },
  "Interactive map of Kazakhstan with destinations, routes, and hidden gems.": { ru: "Интерактивная карта Казахстана с локациями, маршрутами и малоизвестными местами.", kk: "Бағыттар, маршруттар және жасырын орындары бар Қазақстанның интерактивті картасы." },
  "Generate optimized travel routes based on your budget, time, and interests.": { ru: "Создавайте оптимальные маршруты с учётом бюджета, времени и интересов.", kk: "Бюджетіңізге, уақытыңызға және қызығушылықтарыңызға сай оңтайлы маршруттар құрыңыз." },
  "Customize your MangystauTrails experience and preferences.": { ru: "Настройте MangystauTrails и параметры путешествия под себя.", kk: "MangystauTrails тәжірибесі мен сапар параметрлерін өзіңізге бейімдеңіз." },
  "Popular destinations": { ru: "Популярные направления", kk: "Танымал бағыттар" },
  "Routes": { ru: "Маршруты", kk: "Маршруттар" },
  "Popular routes": { ru: "Популярные маршруты", kk: "Танымал маршруттар" },
  "Aktau starts": { ru: "Старт из Актау", kk: "Ақтаудан бастау" },
  "Generate a route to Kazakhstan attractions by trip length, travel pace and interest, then preview the path directly on the built-in map.": { ru: "Создайте маршрут по достопримечательностям Казахстана с учётом длительности, темпа и интересов, затем посмотрите путь на встроенной карте.", kk: "Сапар ұзақтығы, қарқыны және қызығушылықтарыңыз бойынша Қазақстанның көрікті жерлеріне маршрут құрып, жолды кірістірілген картадан көріңіз." },
  "Contact": { ru: "Связаться", kk: "Байланыс" },
  "Tell us about your route": { ru: "Расскажите о своём маршруте", kk: "Маршрутыңыз туралы айтыңыз" },
  "All four fields are required. We only show confirmation after your route details are saved.": { ru: "Все четыре поля обязательны. Подтверждение появится только после сохранения деталей маршрута.", kk: "Төрт өрістің бәрі міндетті. Растау маршрут мәліметтері сақталғаннан кейін ғана көрсетіледі." },
  "Route request details": { ru: "Детали запроса на маршрут", kk: "Маршрут сұрауының мәліметтері" },
  "Name": { ru: "Имя", kk: "Аты" },
  "Travel window": { ru: "Даты поездки", kk: "Сапар мерзімі" },
  "Message": { ru: "Сообщение", kk: "Хабарлама" },
  "April, 3 days, flexible": { ru: "Апрель, 3 дня, даты гибкие", kk: "Сәуір, 3 күн, мерзімі икемді" },
  "Tell us where you want to go, your pace, group size and what feels important.": { ru: "Укажите, куда хотите поехать, темп, размер группы и важные для вас детали.", kk: "Қайда барғыңыз келетінін, қарқыныңызды, топ көлемін және маңызды мәліметтерді жазыңыз." },
  "characters": { ru: "символов", kk: "таңба" },
  "Try again": { ru: "Повторить", kk: "Қайталау" },
  "Sending…": { ru: "Отправка…", kk: "Жіберілуде…" },
  "Send message": { ru: "Отправить сообщение", kk: "Хабарлама жіберу" },
  "Add a travel window, even if your dates are flexible.": { ru: "Укажите период поездки, даже если даты гибкие.", kk: "Күндеріңіз икемді болса да, сапар мерзімін көрсетіңіз." },
  "Tell us a little about the route you have in mind.": { ru: "Немного расскажите о задуманном маршруте.", kk: "Ойыңыздағы маршрут туралы қысқаша жазыңыз." },
  "Add at least 12 characters about your trip.": { ru: "Добавьте не менее 12 символов о поездке.", kk: "Сапар туралы кемінде 12 таңба жазыңыз." },
  "This request could not be verified.": { ru: "Не удалось проверить этот запрос.", kk: "Бұл сұрауды тексеру мүмкін болмады." },
  "Refresh the page and try again.": { ru: "Обновите страницу и повторите попытку.", kk: "Бетті жаңартып, қайталап көріңіз." },
  "We could not verify that your route request was saved. Your details are still here; try again.": { ru: "Не удалось подтвердить сохранение запроса. Все данные остались в форме — повторите попытку.", kk: "Сұраудың сақталғанын растау мүмкін болмады. Мәліметтер формада қалды — қайталап көріңіз." },
  "Your route request has been saved. We’ll use the details to help prepare your Mangystau journey.": { ru: "Запрос на маршрут сохранён. Мы используем детали, чтобы помочь подготовить путешествие по Мангистау.", kk: "Маршрут сұрауы сақталды. Мәліметтер Маңғыстау сапарын дайындауға көмектеседі." },
  "Route request saved": { ru: "Запрос на маршрут сохранён", kk: "Маршрут сұрауы сақталды" },
  "Your route details are safely recorded.": { ru: "Детали маршрута надёжно сохранены.", kk: "Маршрут мәліметтері сенімді сақталды." },
  "The network interrupted the request. Your details are still here; try again.": { ru: "Сеть прервала запрос. Все данные остались в форме — повторите попытку.", kk: "Желі сұрауды үзді. Мәліметтер формада қалды — қайталап көріңіз." },
  "Start exploring Kazakhstan": { ru: "Начать путешествие по Казахстану", kk: "Қазақстанды зерттеуді бастау" },
  "Trip support": { ru: "Помощь с поездкой", kk: "Сапарды қолдау" },
  "Plan with MangystauTrails": { ru: "Планируйте с MangystauTrails", kk: "MangystauTrails-пен жоспарлаңыз" },
  "Made by 2Starks": { ru: "Создано 2Starks", kk: "2Starks жасаған" },
  "MangystauTrails is a practical travel platform that builds personalized routes across Kazakhstan in seconds, combining smart recommendations, real locations, and adaptive planning.": {
    ru: "MangystauTrails — практичная туристическая платформа, которая за секунды создаёт персональные маршруты по Казахстану, объединяя рекомендации, реальные места и гибкое планирование.",
    kk: "MangystauTrails — ақылды ұсыныстарды, нақты орындарды және икемді жоспарлауды біріктіріп, Қазақстан бойынша жеке маршруттарды бірнеше секундта құратын практикалық туристік платформа."
  },
  "Share your dates, pace and dream stops. Your request is saved with the practical details needed to shape a Mangystau journey around your group.": {
    ru: "Укажите даты, темп и желаемые остановки. Запрос сохранится вместе с практическими деталями, чтобы подготовить поездку по Мангистау для вашей группы.",
    kk: "Күндерді, қарқынды және қалаған аялдамаларды көрсетіңіз. Сұрау тобыңызға сай Маңғыстау сапарын дайындауға қажет мәліметтермен бірге сақталады."
  },
  "Editorial score {score} / 5 · {time}": { ru: "Редакционная оценка {score} / 5 · {time}", kk: "Редакциялық баға {score} / 5 · {time}" },

  "Log in": { ru: "Войти", kk: "Кіру" },
  "Sign up": { ru: "Регистрация", kk: "Тіркелу" },
  "Create account": { ru: "Создать аккаунт", kk: "Аккаунт жасау" },
  "Account access": { ru: "Доступ к аккаунту", kk: "Аккаунтқа кіру" },
  "Secure HTTP-only session": { ru: "Защищённая HTTP-only сессия", kk: "Қорғалған HTTP-only сессия" },
  "Your name": { ru: "Ваше имя", kk: "Атыңыз" },
  "Show password": { ru: "Показать пароль", kk: "Құпиясөзді көрсету" },
  "Hide password": { ru: "Скрыть пароль", kk: "Құпиясөзді жасыру" },
  "Confirm password": { ru: "Повторите пароль", kk: "Құпиясөзді растаңыз" },
  "Repeat your password": { ru: "Введите пароль ещё раз", kk: "Құпиясөзді қайталаңыз" },
  "At least {count} characters": { ru: "Не менее {count} символов", kk: "Кемінде {count} таңба" },
  "Use {min}–{max} characters.": { ru: "Используйте от {min} до {max} символов.", kk: "{min}–{max} таңба қолданыңыз." },
  "Keep your saved routes together": { ru: "Храните маршруты в одном месте", kk: "Маршруттарды бір жерде сақтаңыз" },
  "Restore your travel context on return": { ru: "Возвращайтесь к сохранённому контексту поездки", kk: "Сапар контекстіне қайта оралыңыз" },
  "Use a secure HTTP-only session": { ru: "Используйте защищённую HTTP-only сессию", kk: "Қорғалған HTTP-only сессияны пайдаланыңыз" },
  "Enter your name.": { ru: "Введите имя.", kk: "Атыңызды енгізіңіз." },
  "Enter your email address.": { ru: "Введите email.", kk: "Email енгізіңіз." },
  "Enter a valid email address.": { ru: "Введите корректный email.", kk: "Дұрыс email енгізіңіз." },
  "Enter your password.": { ru: "Введите пароль.", kk: "Құпиясөзді енгізіңіз." },
  "Confirm your password.": { ru: "Подтвердите пароль.", kk: "Құпиясөзді растаңыз." },
  "Passwords do not match.": { ru: "Пароли не совпадают.", kk: "Құпиясөздер сәйкес емес." },
  "Use at least {count} characters.": { ru: "Используйте не менее {count} символов.", kk: "Кемінде {count} таңба қолданыңыз." },
  "Use {count} characters or fewer.": { ru: "Используйте не более {count} символов.", kk: "{count} таңбадан асырмаңыз." },
  "Check the highlighted fields and try again.": { ru: "Проверьте отмеченные поля и повторите попытку.", kk: "Белгіленген өрістерді тексеріп, қайталап көріңіз." },
  "We couldn’t log you in. Check your password or create a new account.": {
    ru: "Не удалось войти. Проверьте пароль или создайте новый аккаунт.",
    kk: "Кіру мүмкін болмады. Құпиясөзді тексеріңіз немесе жаңа аккаунт жасаңыз."
  },
  "We could not complete authentication. Please try again.": { ru: "Не удалось завершить авторизацию. Повторите попытку.", kk: "Авторизацияны аяқтау мүмкін болмады. Қайта көріңіз." },
  "We could not reach the secure account backend. You can retry, return home, or continue using the public guide and plans stored on this device.": {
    ru: "Не удалось подключиться к защищённому сервису аккаунтов. Можно повторить попытку, вернуться на главную или продолжить с публичным гидом и планами на этом устройстве.",
    kk: "Қорғалған аккаунт қызметіне қосылу мүмкін болмады. Қайта көруге, басты бетке оралуға немесе осы құрылғыдағы гид пен жоспарларды пайдалануға болады."
  },
  "An account with this email already exists.": { ru: "Аккаунт с таким email уже существует.", kk: "Бұл email-мен аккаунт бұрыннан бар." },
  "Account created. Your secure session is ready.": { ru: "Аккаунт создан. Защищённая сессия готова.", kk: "Аккаунт жасалды. Қорғалған сессия дайын." },
  "Welcome back. Your secure session has been restored.": { ru: "С возвращением. Защищённая сессия восстановлена.", kk: "Қайта қош келдіңіз. Қорғалған сессия қалпына келтірілді." },
  "Account created": { ru: "Аккаунт создан", kk: "Аккаунт жасалды" },
  "Welcome back": { ru: "С возвращением", kk: "Қайта қош келдіңіз" },
  "Creating account…": { ru: "Создание аккаунта…", kk: "Аккаунт жасалуда…" },
  "Logging in…": { ru: "Вход…", kk: "Кіру…" },
  "Checking your secure session…": { ru: "Проверяем защищённую сессию…", kk: "Қорғалған сессия тексерілуде…" },
  "Account status": { ru: "Статус аккаунта", kk: "Аккаунт күйі" },
  "Account service is temporarily unavailable": { ru: "Сервис аккаунтов временно недоступен", kk: "Аккаунт қызметі уақытша қолжетімсіз" },
  "Retry account service": { ru: "Повторить подключение", kk: "Қайта қосылу" },
  "Continue without an account": { ru: "Продолжить без аккаунта", kk: "Аккаунтсыз жалғастыру" },
  "Back to home": { ru: "На главную", kk: "Басты бетке" },
  "Sign-in is paused until the secure account service responds.": { ru: "Вход приостановлен до восстановления сервиса аккаунтов.", kk: "Аккаунт қызметі қалпына келгенше кіру тоқтатылды." },
  "We could not sign you out. Please try again.": { ru: "Не удалось выйти. Повторите попытку.", kk: "Шығу мүмкін болмады. Қайта көріңіз." },
  "We could not reach the account service. Your session is still active.": { ru: "Сервис аккаунтов недоступен. Ваша сессия всё ещё активна.", kk: "Аккаунт қызметі қолжетімсіз. Сессияңыз әлі белсенді." },

  "Smart route builder": { ru: "Умный планировщик", kk: "Ақылды маршрут құрастырушы" },
  "Build a Mangystau expedition": { ru: "Соберите экспедицию по Мангистау", kk: "Маңғыстау экспедициясын құрыңыз" },
  "Four short decisions become a practical route with road time, safety notes and a backup plan.": {
    ru: "Четыре коротких шага превращаются в практичный маршрут с временем в пути, советами по безопасности и запасным планом.",
    kk: "Төрт қысқа шешім жол уақыты, қауіпсіздік ескертпелері және қосалқы жоспары бар практикалық маршрутқа айналады."
  },
  "Step {current} of {total}": { ru: "Шаг {current} из {total}", kk: "{total} қадамның {current}-і" },
  "Route builder progress": { ru: "Прогресс планировщика", kk: "Маршрут құрастыру барысы" },
  "Trip": { ru: "Поездка", kk: "Сапар" },
  "Road": { ru: "Дорога", kk: "Жол" },
  "Style": { ru: "Стиль", kk: "Стиль" },
  "Destination": { ru: "Направление", kk: "Бағыт" },
  "How much time do you have?": { ru: "Сколько у вас времени?", kk: "Қанша уақытыңыз бар?" },
  "Keep one daylight buffer for remote roads.": { ru: "Оставьте запас светового дня для удалённых дорог.", kk: "Шалғай жолдарға күндізгі уақыт қорын қалдырыңыз." },
  "Trip length": { ru: "Длительность поездки", kk: "Сапар ұзақтығы" },
  "Trip length in days": { ru: "Длительность поездки в днях", kk: "Сапар ұзақтығы күнмен" },
  "{count} day": { ru: "{count} день", kk: "{count} күн" },
  "{count} days": { ru: "{count} дней", kk: "{count} күн" },
  "Starting point": { ru: "Точка старта", kk: "Бастау нүктесі" },
  "Aktau airport": { ru: "Аэропорт Актау", kk: "Ақтау әуежайы" },
  "How will you travel?": { ru: "Как вы будете путешествовать?", kk: "Қалай саяхаттайсыз?" },
  "Remote tracks change what is realistically reachable.": { ru: "Тип транспорта определяет доступность удалённых дорог.", kk: "Көлік түрі шалғай жолдардың қолжетімділігін анықтайды." },
  "Transport": { ru: "Транспорт", kk: "Көлік" },
  "Driver-guide": { ru: "Водитель-гид", kk: "Жүргізуші-гид" },
  "Own 4x4": { ru: "Свой 4×4", kk: "Жеке 4×4" },
  "Sedan": { ru: "Седан", kk: "Седан" },
  "Travel group": { ru: "Группа", kk: "Саяхат тобы" },
  "Solo": { ru: "Один", kk: "Жалғыз" },
  "Friends": { ru: "Друзья", kk: "Достар" },
  "Family": { ru: "Семья", kk: "Отбасы" },
  "Sedan routes stay close to reliable roads. For Bozzhyra and Tuzbair, switch to a driver-guide or 4x4.": {
    ru: "Маршруты для седана проходят по надёжным дорогам. Для Бозжыры и Тузбаира выберите водителя-гида или 4×4.",
    kk: "Седан маршруттары сенімді жолдармен өтеді. Бозжыра мен Тұзбайыр үшін жүргізуші-гидті немесе 4×4 таңдаңыз."
  },
  "What should the trip feel like?": { ru: "Какой должна быть поездка?", kk: "Сапар қандай болсын?" },
  "The route adapts its stops, pace and cost range.": { ru: "Маршрут подстроит остановки, темп и бюджет.", kk: "Маршрут аялдамаларды, қарқынды және бюджетті бейімдейді." },
  "Main interest": { ru: "Главный интерес", kk: "Негізгі қызығушылық" },
  "Wild landscapes": { ru: "Дикая природа", kk: "Жабайы табиғат" },
  "Photography": { ru: "Фотография", kk: "Фотография" },
  "Sacred places": { ru: "Священные места", kk: "Қасиетті орындар" },
  "Family-friendly": { ru: "Для семьи", kk: "Отбасына қолайлы" },
  "Expedition": { ru: "Экспедиция", kk: "Экспедиция" },
  "Pace": { ru: "Темп", kk: "Қарқын" },
  "Relaxed": { ru: "Спокойный", kk: "Баяу" },
  "Balanced": { ru: "Сбалансированный", kk: "Теңгерімді" },
  "Active": { ru: "Активный", kk: "Белсенді" },
  "Budget style": { ru: "Формат бюджета", kk: "Бюджет түрі" },
  "Smart": { ru: "Рациональный", kk: "Үнемді" },
  "Comfort": { ru: "Комфорт", kk: "Жайлы" },
  "Private": { ru: "Приватный", kk: "Жеке" },
  "Choose the main highlight": { ru: "Выберите главное место", kk: "Негізгі орынды таңдаңыз" },
  "You can still change or shorten the route after it is built.": { ru: "После создания маршрут можно изменить или сократить.", kk: "Маршрут жасалғаннан кейін оны өзгертуге немесе қысқартуға болады." },
  "Duration": { ru: "Длительность", kk: "Ұзақтығы" },
  "Group": { ru: "Группа", kk: "Топ" },
  "Focus": { ru: "Фокус", kk: "Бағыт" },
  "Create my route": { ru: "Создать маршрут", kk: "Маршрут құру" },
  "Additional parameters": { ru: "Дополнительные параметры", kk: "Қосымша параметрлер" },
  "Optional details for a more precise route": { ru: "Необязательные детали для более точного маршрута", kk: "Нақтырақ маршрут үшін қосымша мәліметтер" },
  "{count} selected": { ru: "Выбрано: {count}", kk: "Таңдалды: {count}" },
  "No additional parameters": { ru: "Дополнительные параметры не выбраны", kk: "Қосымша параметрлер таңдалмаған" },
  "Avoid the roughest tracks": { ru: "Избегать самых сложных дорог", kk: "Ең күрделі жолдардан аулақ болу" },
  "Keep the route on more reliable access roads where possible.": { ru: "По возможности использовать более надёжные подъездные дороги.", kk: "Мүмкіндігінше сенімді кірме жолдарды пайдалану." },
  "Preferred light": { ru: "Предпочтительное время", kk: "Қалаған уақыт" },
  "Any daylight": { ru: "Любое светлое время", kk: "Кез келген күндізгі уақыт" },
  "Sunrise": { ru: "Рассвет", kk: "Күн шығуы" },
  "Sunset": { ru: "Закат", kk: "Күн батуы" },
  "Overnight style": { ru: "Формат ночёвки", kk: "Түнеу түрі" },
  "Flexible": { ru: "Гибкий", kk: "Икемді" },
  "Guesthouse": { ru: "Гостевой дом", kk: "Қонақ үй" },
  "Camp": { ru: "Кемпинг", kk: "Лагерь" },
  "Reset additional parameters": { ru: "Сбросить дополнительные параметры", kk: "Қосымша параметрлерді қалпына келтіру" },
  "Reliable roads": { ru: "Надёжные дороги", kk: "Сенімді жолдар" },
  "Light: {value}": { ru: "Время: {value}", kk: "Уақыт: {value}" },
  "Stay: {value}": { ru: "Ночёвка: {value}", kk: "Түнеу: {value}" },
  "Route ready": { ru: "Маршрут готов", kk: "Маршрут дайын" },
  "Route ready. The map now follows this expedition.": { ru: "Маршрут готов. Карта теперь показывает эту экспедицию.", kk: "Маршрут дайын. Карта осы экспедицияны көрсетеді." },
  "Preferences changed. Create the route again to refresh the plan and map.": { ru: "Параметры изменены. Создайте маршрут заново, чтобы обновить план и карту.", kk: "Параметрлер өзгерді. Жоспар мен картаны жаңарту үшін маршрутты қайта құрыңыз." },
  "{days} days · {stops} stops": { ru: "{days} дней · {stops} остановок", kk: "{days} күн · {stops} аялдама" },
  "Distance": { ru: "Расстояние", kk: "Қашықтық" },
  "Road time": { ru: "Время в пути", kk: "Жол уақыты" },
  "Difficulty": { ru: "Сложность", kk: "Күрделілік" },
  "Budget": { ru: "Бюджет", kk: "Бюджет" },
  "Why this fits": { ru: "Почему маршрут подходит", kk: "Неге бұл маршрут сай келеді" },
  "Journey timeline": { ru: "План по дням", kk: "Күндер жоспары" },
  "What to take": { ru: "Что взять", kk: "Не алу керек" },
  "Safety check": { ru: "Безопасность", kk: "Қауіпсіздік" },
  "Where to stay": { ru: "Где остановиться", kk: "Қайда түнеу керек" },
  "Backup route": { ru: "Запасной маршрут", kk: "Қосалқы маршрут" },
  "Save route": { ru: "Сохранить маршрут", kk: "Маршрутты сақтау" },
  "Saved": { ru: "Сохранено", kk: "Сақталды" },
  "Saving…": { ru: "Сохранение…", kk: "Сақталуда…" },
  "Removing…": { ru: "Удаление…", kk: "Жойылуда…" },
  "Share plan": { ru: "Поделиться планом", kk: "Жоспармен бөлісу" },
  "View on map": { ru: "Показать на карте", kk: "Картадан көру" },
  "Live preview": { ru: "Предпросмотр", kk: "Алдын ала көру" },
  "Your route will explain every important choice.": { ru: "Маршрут объяснит каждое важное решение.", kk: "Маршрут әр маңызды шешімді түсіндіреді." },
  "Not just pins: road time, difficulty, equipment, overnight options and a safer alternative.": { ru: "Не просто точки: время в пути, сложность, снаряжение, ночёвки и безопасная альтернатива.", kk: "Тек нүктелер емес: жол уақыты, күрделілік, жабдық, түнеу және қауіпсіз балама." },
  "A route paced to daylight": { ru: "Маршрут с учётом светового дня", kk: "Күндізгі уақытқа сай маршрут" },
  "Practical road and safety context": { ru: "Практичный контекст дорог и безопасности", kk: "Жол мен қауіпсіздік туралы практикалық мәлімет" },
  "One shareable plan for the whole group": { ru: "Один общий план для всей группы", kk: "Бүкіл топқа ортақ бір жоспар" },
  "Route status": { ru: "Статус маршрута", kk: "Маршрут күйі" },
  "Log in to sync and keep this route": { ru: "Войдите, чтобы синхронизировать маршрут", kk: "Маршрутты синхрондау үшін кіріңіз" },
  "Shareable route link": { ru: "Ссылка на маршрут", kk: "Маршрут сілтемесі" },
  "Open shareable route": { ru: "Открыть маршрут", kk: "Маршрутты ашу" },

  "Mangystau begins where familiar routes end.": { ru: "Мангистау начинается там, где заканчиваются привычные маршруты.", kk: "Маңғыстау таныс маршруттар аяқталған жерде басталады." },
  "Build a road-tested journey through chalk canyons, sacred places and the Caspian coast — with the timing, transport and safety context remote travel needs.": { ru: "Соберите проверенное путешествие по меловым каньонам, священным местам и побережью Каспия — с учётом времени, транспорта и безопасности удалённых маршрутов.", kk: "Борлы шатқалдар, қасиетті орындар және Каспий жағалауы арқылы жол, көлік және қауіпсіздік ескерілген сапар құрыңыз." },
  "Explore places": { ru: "Исследовать места", kk: "Орындарды зерттеу" },
  "Route studio": { ru: "Студия маршрутов", kk: "Маршрут студиясы" },
  "A realistic Mangystau plan in minutes.": { ru: "Реалистичный план по Мангистау за несколько минут.", kk: "Маңғыстаудың нақты жоспары бірнеше минутта." },
  "Choose your pace, road setup and main landscape. The planner turns them into a day-by-day route with honest travel notes.": { ru: "Выберите темп, транспорт и главное место. Планировщик соберёт маршрут по дням с честными дорожными примечаниями.", kk: "Қарқынды, көлікті және негізгі көріністі таңдаңыз. Жоспарлаушы оларды нақты ескертпелері бар күндік маршрутқа айналдырады." },
  "Build a route": { ru: "Создать маршрут", kk: "Маршрут құру" },
  "Open map": { ru: "Открыть карту", kk: "Картаны ашу" },
  "Live atlas": { ru: "Живой атлас", kk: "Жанды атлас" },
  "Read the landscape before the road.": { ru: "Изучите ландшафт до начала пути.", kk: "Жолға дейін жер бедерін зерттеңіз." },
  "Compare Mangystau's key stops on one map, follow a practical route and open the field guide for each place.": { ru: "Сравните главные места Мангистау на одной карте, выберите практичный маршрут и откройте гид по каждой точке.", kk: "Маңғыстаудың негізгі орындарын бір картада салыстырып, практикалық маршрут пен әр орынның гидін ашыңыз." },
  "Explore the map": { ru: "Исследовать карту", kk: "Картаны зерттеу" },
  "Plan a route": { ru: "Спланировать маршрут", kk: "Маршрут жоспарлау" },
  "Field guide": { ru: "Полевой гид", kk: "Далалық гид" },
  "Know the place before you arrive.": { ru: "Узнайте место до приезда.", kk: "Орынды бармай тұрып таныңыз." },
  "Road access, visit time, conditions and responsible travel guidance for Mangystau's defining landscapes.": { ru: "Доступ по дорогам, время посещения, условия и ответственное путешествие по главным ландшафтам Мангистау.", kk: "Маңғыстаудың негізгі көріністеріне жол, уақыт, жағдай және жауапты саяхат нұсқаулары." },
  "Browse locations": { ru: "Смотреть локации", kk: "Локацияларды көру" },
  "Travel guide": { ru: "Туристический гид", kk: "Саяхат гиді" },
  "Ask the questions that change a trip.": { ru: "Задавайте вопросы, которые меняют поездку.", kk: "Сапарды өзгертетін сұрақтарды қойыңыз." },
  "Get focused help with seasons, drivers, road conditions, packing and the right pace for your group.": { ru: "Получите точные рекомендации по сезону, водителям, дорогам, снаряжению и темпу вашей группы.", kk: "Маусым, жүргізушілер, жол, жабдық және топ қарқыны туралы нақты кеңес алыңыз." },
  "Ask the guide": { ru: "Спросить гида", kk: "Гидтен сұрау" },
  "Preferences": { ru: "Параметры", kk: "Параметрлер" },
  "Set up the way you travel.": { ru: "Настройте свой формат путешествия.", kk: "Саяхат тәсілін баптаңыз." },
  "Keep language, map style and location access together in one calm control panel.": { ru: "Управляйте языком, стилем карты и геолокацией в одной спокойной панели.", kk: "Тіл, карта стилі және геолокацияны бір ықшам панельде басқарыңыз." },
  "Open guide": { ru: "Открыть гид", kk: "Гидті ашу" },
  "Saved trips": { ru: "Сохранённые поездки", kk: "Сақталған сапарлар" },
  "Your collection": { ru: "Ваша коллекция", kk: "Жинағыңыз" },
  "Pick up the journey where you left it.": { ru: "Продолжите путешествие с того места, где остановились.", kk: "Сапарды тоқтаған жерден жалғастырыңыз." },
  "Saved places, stays and generated routes remain on this device for quick access.": { ru: "Сохранённые места, ночёвки и маршруты остаются на этом устройстве для быстрого доступа.", kk: "Сақталған орындар, түнеулер және маршруттар осы құрылғыда жылдам қолжетімді болады." },
  "Create a route": { ru: "Создать маршрут", kk: "Маршрут құру" },
  "Low-signal travel": { ru: "Поездки без связи", kk: "Байланысы әлсіз сапар" },
  "Prepare the essentials before you leave Aktau.": { ru: "Подготовьте главное до выезда из Актау.", kk: "Ақтаудан шықпай тұрып қажеттісін дайындаңыз." },
  "Keep the most useful route notes close when the road moves beyond reliable coverage.": { ru: "Сохраните важные заметки до того, как дорога уйдёт из зоны стабильной связи.", kk: "Жол тұрақты байланыстан алыстағанда маңызды ескертпелерді қолжетімді ұстаңыз." },
  "Prepare a guide": { ru: "Подготовить гид", kk: "Гидті дайындау" },
  "Traveler account": { ru: "Аккаунт путешественника", kk: "Саяхатшы аккаунты" },
  "Keep your Mangystau plans together.": { ru: "Храните планы по Мангистау вместе.", kk: "Маңғыстау жоспарларын бірге сақтаңыз." },
  "Sign in to manage your profile and keep the planning flow personal across visits.": { ru: "Войдите, чтобы управлять профилем и сохранять персональный контекст планирования.", kk: "Профильді басқару және жеке жоспарлау контекстін сақтау үшін кіріңіз." },
  "Sign in": { ru: "Войти", kk: "Кіру" },
  "Support": { ru: "Поддержка", kk: "Қолдау" },
  "Get help without losing the route.": { ru: "Получите помощь, не теряя маршрут.", kk: "Маршрутты жоғалтпай көмек алыңыз." },
  "Find quick answers, share feedback or report a problem from one compact screen.": { ru: "Найдите быстрые ответы, отправьте отзыв или сообщите о проблеме на одном экране.", kk: "Жылдам жауап тауып, пікір жіберіңіз немесе мәселе туралы бір экраннан хабарлаңыз." },
  "Settings": { ru: "Настройки", kk: "Баптаулар" },
  "Built by 2Starks": { ru: "Создано 2Starks", kk: "2Starks жасаған" },
  "A calmer way into wild Mangystau.": { ru: "Спокойный путь в дикий Мангистау.", kk: "Жабайы Маңғыстауға сабырлы жол." },
  "A focused travel product for planning remote routes with context, restraint and respect for place.": { ru: "Сфокусированный туристический продукт для планирования удалённых маршрутов с контекстом и уважением к месту.", kk: "Шалғай маршруттарды контекстпен және орынға құрметпен жоспарлауға арналған өнім." },
  "Explore Mangystau": { ru: "Исследовать Мангистау", kk: "Маңғыстауды зерттеу" },
  "Sunset over the white chalk cliffs of Bozzhyra in Mangystau": { ru: "Закат над белыми меловыми скалами Бозжыры в Мангистау", kk: "Маңғыстаудағы Бозжыраның ақ борлы жартастарындағы күн батуы" },
  "ideal first trip": { ru: "идеальная первая поездка", kk: "алғашқы сапарға қолайлы" },
  "remote roads": { ru: "удалённые дороги", kk: "шалғай жолдар" },
  "prime season": { ru: "лучший сезон", kk: "үздік маусым" },

  "Mangystau Trails": { ru: "Mangystau Trails", kk: "Mangystau Trails" },
  "Home | Mangystau Trails": { ru: "Главная | Mangystau Trails", kk: "Басты | Mangystau Trails" },
  "Explore | Mangystau Trails": { ru: "Карта | Mangystau Trails", kk: "Карта | Mangystau Trails" },
  "Routes | Mangystau Trails": { ru: "Маршруты | Mangystau Trails", kk: "Маршруттар | Mangystau Trails" },
  "Guide | Mangystau Trails": { ru: "Гид | Mangystau Trails", kk: "Гид | Mangystau Trails" },
  "Locations | Mangystau Trails": { ru: "Локации | Mangystau Trails", kk: "Локациялар | Mangystau Trails" },
  "Profile | Mangystau Trails": { ru: "Профиль | Mangystau Trails", kk: "Профиль | Mangystau Trails" },
  "Log in | Mangystau Trails": { ru: "Вход | Mangystau Trails", kk: "Кіру | Mangystau Trails" },
  "Sign up | Mangystau Trails": { ru: "Регистрация | Mangystau Trails", kk: "Тіркелу | Mangystau Trails" },
  "Saved | Mangystau Trails": { ru: "Сохранено | Mangystau Trails", kk: "Сақталған | Mangystau Trails" },
  "Settings | Mangystau Trails": { ru: "Настройки | Mangystau Trails", kk: "Баптаулар | Mangystau Trails" },
  "Help | Mangystau Trails": { ru: "Помощь | Mangystau Trails", kk: "Көмек | Mangystau Trails" },
  "About | Mangystau Trails": { ru: "О проекте | Mangystau Trails", kk: "Жоба туралы | Mangystau Trails" },
  "Offline | Mangystau Trails": { ru: "Офлайн | Mangystau Trails", kk: "Офлайн | Mangystau Trails" },
  "Mangystau route planning, destination guides and practical travel tools for Kazakhstan.": {
    ru: "Маршруты по Мангистау, гиды по местам и практичные инструменты для путешествий по Казахстану.",
    kk: "Маңғыстау маршруттары, орындар гидтері және Қазақстанға арналған практикалық саяхат құралдары."
  },
  "Explore Mangystau destinations, routes and map filters.": { ru: "Исследуйте места Мангистау, маршруты и фильтры карты.", kk: "Маңғыстау орындарын, маршруттарын және карта сүзгілерін зерттеңіз." },
  "Build a practical Mangystau route around your time, transport and travel style.": { ru: "Создайте практичный маршрут по Мангистау с учётом времени, транспорта и стиля поездки.", kk: "Уақыт, көлік және сапар стиліне сай практикалық Маңғыстау маршрутын құрыңыз." },
  "Use the Mangystau guide for places, stays and practical trip context.": { ru: "Используйте гид по Мангистау для выбора мест, ночёвок и подготовки поездки.", kk: "Орындарды, түнеуді және сапар мәліметтерін таңдау үшін Маңғыстау гидін пайдаланыңыз." },
  "Manage your Mangystau Trails account and saved travel context.": { ru: "Управляйте аккаунтом Mangystau Trails и сохранёнными данными поездок.", kk: "Mangystau Trails аккаунтын және сақталған сапар деректерін басқарыңыз." },
} as const;

export type UiTextKey = keyof typeof uiText;

export function isAppLanguage(value: unknown): value is AppLanguage {
  return value === "kk" || value === "ru" || value === "en";
}

export function getLanguageFromAcceptLanguage(value: string | null | undefined): AppLanguage {
  const languages = (value ?? "")
    .split(",")
    .map((entry) => entry.trim().split(";")[0]?.toLowerCase())
    .filter(Boolean);

  for (const language of languages) {
    if (language === "kk" || language?.startsWith("kk-")) return "kk";
    if (language === "ru" || language?.startsWith("ru-")) return "ru";
    if (language === "en" || language?.startsWith("en-")) return "en";
  }

  return "en";
}

export function translateUiText(
  language: AppLanguage,
  key: UiTextKey,
  values: TranslationValues = {}
) {
  const translated = language === "en" ? key : uiText[key][language];

  return Object.entries(values).reduce(
    (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
    translated as string
  );
}

export function translateKnownText(language: AppLanguage, value: string) {
  const item = uiText[value as UiTextKey];
  if (!item) return value;
  return language === "en" ? value : item[language];
}

export function getLanguageLocale(language: AppLanguage) {
  if (language === "kk") return "kk-KZ";
  if (language === "ru") return "ru-RU";
  return "en-US";
}
