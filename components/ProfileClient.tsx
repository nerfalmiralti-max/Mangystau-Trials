"use client";

import Link from "next/link";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import AnimatedHero from "@/components/AnimatedHero";
import AnimatedTitle from "@/components/AnimatedTitle";
import {
  moveGuestStoredIdsToOwner,
  readStoredIds,
  setStoredIdsOwner,
  useStoredIds,
  writeStoredIds,
} from "@/components/useStoredIds";
import { useSettings } from "@/hooks/useSettings";
import {
  GUIDE_FAVORITES_KEY,
  LOCATION_FAVORITES_KEY,
  SAVED_HOTELS_KEY,
  SAVED_ROUTES_KEY,
} from "@/lib/appStorage";
import {
  AUTH_EMAIL_MAX_LENGTH,
  AUTH_NAME_MAX_LENGTH,
  AUTH_PASSWORD_MAX_LENGTH,
  AUTH_PASSWORD_MIN_LENGTH,
  AuthField,
  AuthFieldErrors,
  AuthFormMode,
  getSafeAuthRedirect,
  readAuthFormMode,
  validateAuthForm,
} from "@/lib/authValidation";

type TouristProfile = {
  id: string;
  name: string | null;
  email: string | null;
  country: string | null;
  createdAt: string;
  visits?: Array<{ id: string }>;
  savedLocations?: Array<{ locationId: string }>;
  savedRoutes?: Array<{ planId: string }>;
};

type AuthResponse = {
  tourist?: TouristProfile | null;
  error?: string;
  details?: string;
  developmentDetails?: string;
};

type Feedback = {
  kind: "error" | "success";
  message: string;
};

type ServiceState =
  | { status: "checking" | "available" }
  | { status: "unavailable"; message: string; details?: string };

const legacyLocalAuthKeys = [
  "mangystau:local-auth-users",
  "mangystau:local-auth-session",
];

const emptyForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const emptyAttempts: Record<AuthFormMode, boolean> = {
  login: false,
  register: false,
};

const inputClassName =
  "min-h-12 w-full rounded-2xl border border-white/10 bg-[#0f0f0f] px-4 py-3 text-white outline-none transition-colors placeholder:text-white/28 focus:border-white/35 disabled:cursor-not-allowed disabled:opacity-55 md:py-4";

export default function ProfileClient() {
  const { t } = useSettings();
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = readAuthFormMode(searchParams.get("mode"));
  const successRedirect = getSafeAuthRedirect(searchParams.get("next"), "/profile");
  const continueHref = successRedirect === "/profile" ? "/explore" : successRedirect;
  const [form, setForm] = useState(emptyForm);
  const [tourist, setTourist] = useState<TouristProfile | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [serviceState, setServiceState] = useState<ServiceState>({ status: "checking" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [completedAuthMode, setCompletedAuthMode] = useState<AuthFormMode | null>(null);
  const [showPasswords, setShowPasswords] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<AuthField, boolean>>>({});
  const [attemptedModes, setAttemptedModes] = useState(emptyAttempts);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const redirectTimerRef = useRef<number | null>(null);
  const guideFavoriteIds = useStoredIds(GUIDE_FAVORITES_KEY);
  const locationFavoriteIds = useStoredIds(LOCATION_FAVORITES_KEY);
  const savedHotelIds = useStoredIds(SAVED_HOTELS_KEY);
  const savedRouteIds = useStoredIds(SAVED_ROUTES_KEY);
  const validation = useMemo(() => validateAuthForm(mode, form), [form, mode]);
  const savedPlaceCount = useMemo(
    () => new Set([...guideFavoriteIds, ...locationFavoriteIds]).size,
    [guideFavoriteIds, locationFavoriteIds]
  );
  const savedCount = savedPlaceCount + savedHotelIds.length + savedRouteIds.length;
  const hasSucceeded = completedAuthMode !== null;
  const isSubmitDisabled =
    isSubmitting ||
    hasSucceeded ||
    serviceState.status === "checking" ||
    serviceState.status === "unavailable";

  const loadProfile = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch("/api/auth/me", {
        cache: "no-store",
        credentials: "same-origin",
        signal,
      });
      const payload = (await response.json().catch(() => ({}))) as AuthResponse;

      if (signal?.aborted) return;

      if (response.ok && payload.tourist) {
        if (!moveGuestStoredIdsToOwner(payload.tourist.id)) {
          setStoredIdsOwner(payload.tourist.id);
        }
        mergeServerSavedContent(payload.tourist);
        void syncLocalSavedContent();
        setTourist(payload.tourist);
        setServiceState({ status: "available" });
        return;
      }

      if (response.status === 401) {
        setStoredIdsOwner(null);
        setTourist(null);
        setServiceState({ status: "available" });
        return;
      }

      setServiceState(createUnavailableState(payload));
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        setServiceState(createUnavailableState());
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    for (const key of legacyLocalAuthKeys) {
      window.localStorage.removeItem(key);
    }

    const timer = window.setTimeout(() => {
      void loadProfile(controller.signal);
    }, 0);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [loadProfile]);

  useEffect(() => {
    if (serviceState.status !== "available" || tourist) return;

    const frame = window.requestAnimationFrame(() => {
      (mode === "register" ? nameInputRef.current : emailInputRef.current)?.focus();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [mode, serviceState.status, tourist]);

  useEffect(
    () => () => {
      if (redirectTimerRef.current !== null) {
        window.clearTimeout(redirectTimerRef.current);
      }
    },
    []
  );

  const updateForm = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (feedback?.kind === "error") setFeedback(null);
  };

  const switchMode = (nextMode: AuthFormMode) => {
    if (nextMode === mode || hasSucceeded) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("mode", nextMode);
    setFeedback(null);
    router.push(`/profile?${params.toString()}`, { scroll: false });
  };

  const retryAccountService = () => {
    setFeedback(null);
    setCompletedAuthMode(null);
    setServiceState({ status: "checking" });
    void loadProfile();
  };

  const submitAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitDisabled) return;

    setAttemptedModes((current) => ({ ...current, [mode]: true }));
    setFeedback(null);
    setCompletedAuthMode(null);

    if (!validation.ok) {
      setFeedback({ kind: "error", message: "Check the highlighted fields and try again." });
      focusFirstInvalidField(mode, validation.errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/auth/${mode === "register" ? "register" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(validation.data),
      });
      const payload = (await response.json().catch(() => ({}))) as AuthResponse;

      if (!response.ok || !payload.tourist) {
        if (response.status === 503) {
          setServiceState(createUnavailableState(payload));
          return;
        }

        setFeedback({
          kind: "error",
          message: payload.error ?? "We could not complete authentication. Please try again.",
        });
        return;
      }

      const authenticatedTourist = {
        ...payload.tourist,
        visits: payload.tourist.visits ?? [],
      };
      if (!moveGuestStoredIdsToOwner(authenticatedTourist.id)) {
        setStoredIdsOwner(authenticatedTourist.id);
      }
      mergeServerSavedContent(authenticatedTourist);
      void syncLocalSavedContent();
      setServiceState({ status: "available" });
      setFeedback({
        kind: "success",
        message:
          mode === "register"
            ? "Account created. Your secure session is ready."
            : "Welcome back. Your secure session has been restored.",
      });
      setCompletedAuthMode(mode);

      redirectTimerRef.current = window.setTimeout(() => {
        setForm(emptyForm);
        setTourist(authenticatedTourist);
        router.replace(successRedirect, { scroll: false });
      }, 900);
    } catch {
      setServiceState(createUnavailableState());
    } finally {
      setIsSubmitting(false);
    }
  };

  const logout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
      const payload = (await response.json().catch(() => ({}))) as AuthResponse;

      if (!response.ok) {
        setFeedback({
          kind: "error",
          message: payload.error ?? "We could not sign you out. Please try again.",
        });
        return;
      }

      const params = new URLSearchParams(searchParams.toString());
      params.set("mode", "login");
      setStoredIdsOwner(null);
      setTourist(null);
      setForm(emptyForm);
      setCompletedAuthMode(null);
      setFeedback({ kind: "success", message: t("profile.signedOut") });
      setServiceState({ status: "available" });
      router.replace(`/profile?${params.toString()}`, { scroll: false });
    } catch {
      setFeedback({
        kind: "error",
        message: "We could not reach the account service. Your session is still active.",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const showError = (field: AuthField) =>
    Boolean(validation.errors[field]) && (Boolean(touched[field]) || attemptedModes[mode]);

  return (
    <div className="relative min-h-screen bg-[#070707] text-white">
      <AnimatedHero activeTab="profile" />

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 md:pb-16 md:pt-12 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="space-y-8 md:space-y-10"
        >
          <div className="space-y-3">
            <AnimatedTitle text={t("profile.title")} className="text-3xl md:text-4xl" />
            <p className="max-w-3xl text-sm leading-7 text-white/70 md:text-base md:leading-8">
              {t("profile.description")}
            </p>
          </div>

          {serviceState.status === "checking" && !tourist ? (
            <AccountLoadingState />
          ) : tourist ? (
            <div className="glass-card p-5 md:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white text-xl font-semibold text-black">
                    {getInitials(tourist.name || tourist.email || "MT")}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/40">{t("profile.label")}</p>
                    <h2 className="mt-2 truncate text-xl font-semibold text-white md:text-2xl">
                      {tourist.name || "MangystauTrails Traveler"}
                    </h2>
                    <p className="mt-1 truncate text-sm text-white/58">{tourist.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  disabled={isLoggingOut}
                  className="btn chat-button justify-center disabled:cursor-not-allowed disabled:opacity-55"
                >
                  {isLoggingOut ? "Signing out…" : t("auth.logout")}
                </button>
              </div>

              {feedback && <FeedbackNotice feedback={feedback} />}

              <div className="mt-5 grid gap-3 sm:grid-cols-4">
                <ProfileStat label={t("profile.saved")} value={savedCount.toString()} />
                <ProfileStat label={t("profile.trips")} value={(tourist.visits ?? []).length.toString()} />
                <ProfileStat label={t("profile.routes")} value={savedRouteIds.length.toString()} />
                <ProfileStat label={t("profile.since")} value={new Date(tourist.createdAt).getFullYear().toString()} />
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <InfoLine label={t("profile.name")} value={tourist.name || t("profile.notSet")} />
                <InfoLine label={t("profile.email")} value={tourist.email || t("profile.notSet")} />
                <InfoLine label={t("profile.country")} value={tourist.country || t("profile.notSet")} />
                <InfoLine label={t("profile.session")} value={t("profile.active")} />
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {serviceState.status === "unavailable" && (
                <AccountServiceNotice
                  state={serviceState}
                  onRetry={retryAccountService}
                  continueHref={continueHref}
                />
              )}

              <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="glass-card p-5 md:p-8">
                  <p className="text-sm uppercase tracking-[0.24em] text-white/40">{t("profile.touristAccess")}</p>
                  <h2 className="mt-4 text-xl font-semibold md:text-2xl">
                    {mode === "login" ? t("profile.loginTitle") : t("profile.signupTitle")}
                  </h2>
                  <p className="mt-4 leading-7 text-white/70">
                    {mode === "login" ? t("profile.loginCopy") : t("profile.signupCopy")}
                  </p>

                  <div
                    className="mt-6 grid grid-cols-2 gap-2 rounded-3xl border border-white/10 bg-white/5 p-2"
                    role="group"
                    aria-label="Account access"
                  >
                    {(["login", "register"] as AuthFormMode[]).map((item) => (
                      <button
                        key={item}
                        type="button"
                        aria-pressed={mode === item}
                        onClick={() => switchMode(item)}
                        disabled={hasSucceeded}
                        className={`btn ${mode === item ? "btn-active" : "bg-white/5 text-white/80"}`}
                      >
                        {item === "login" ? t("auth.login") : t("auth.signup")}
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 grid gap-3 text-sm text-white/62">
                    <Benefit text="Keep your saved routes together" />
                    <Benefit text="Restore your travel context on return" />
                    <Benefit text="Use a secure HTTP-only session" />
                  </div>
                </div>

                <form
                  id="auth-form-panel"
                  aria-busy={isSubmitting}
                  noValidate
                  onSubmit={submitAuth}
                  className="glass-card p-5 md:p-8"
                >
                  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.24em] text-white/40">
                        {mode === "login" ? t("profile.welcomeBack") : t("profile.newTraveler")}
                      </p>
                      <h2 className="mt-3 text-xl font-semibold md:text-2xl">
                        {mode === "login" ? t("auth.login") : t("auth.signup")}
                      </h2>
                    </div>
                    <div className="w-fit rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/50">
                      Secure HTTP-only session
                    </div>
                  </div>

                  <div className="grid gap-4">
                    {mode === "register" && (
                      <div className="grid gap-2">
                        <label htmlFor="auth-name" className="text-sm text-white/60">
                          {t("profile.touristName")}
                        </label>
                        <input
                          ref={nameInputRef}
                          id="auth-name"
                          name="name"
                          type="text"
                          value={form.name}
                          onChange={(event) => updateForm("name", event.target.value)}
                          onBlur={() => setTouched((current) => ({ ...current, name: true }))}
                          autoComplete="name"
                          autoFocus
                          maxLength={AUTH_NAME_MAX_LENGTH}
                          aria-invalid={showError("name")}
                          aria-describedby={showError("name") ? "auth-name-error" : undefined}
                          className={inputClassName}
                          placeholder="Your name"
                        />
                        <FieldError id="auth-name-error" error={validation.errors.name} show={showError("name")} />
                      </div>
                    )}

                    <div className="grid gap-2">
                      <label htmlFor="auth-email" className="text-sm text-white/60">
                        {t("profile.email")}
                      </label>
                      <input
                        ref={emailInputRef}
                        id="auth-email"
                        name="email"
                        type="email"
                        inputMode="email"
                        value={form.email}
                        onChange={(event) => updateForm("email", event.target.value)}
                        onBlur={() => setTouched((current) => ({ ...current, email: true }))}
                        autoComplete="email"
                        autoCapitalize="none"
                        autoFocus={mode === "login"}
                        maxLength={AUTH_EMAIL_MAX_LENGTH}
                        spellCheck={false}
                        aria-invalid={showError("email")}
                        aria-describedby={showError("email") ? "auth-email-error" : undefined}
                        className={inputClassName}
                        placeholder="tourist@example.com"
                      />
                      <FieldError id="auth-email-error" error={validation.errors.email} show={showError("email")} />
                    </div>

                    <div className="grid gap-2">
                      <div className="flex items-center justify-between gap-3">
                        <label htmlFor="auth-password" className="text-sm text-white/60">
                          {t("profile.password")}
                        </label>
                        <button
                          type="button"
                          aria-controls={
                            mode === "register"
                              ? "auth-password auth-confirm-password"
                              : "auth-password"
                          }
                          aria-pressed={showPasswords}
                          onClick={() => setShowPasswords((current) => !current)}
                          className="min-h-11 rounded-full px-3 text-xs font-semibold text-white/62 transition-colors hover:bg-white/8 hover:text-white"
                        >
                          {showPasswords ? "Hide password" : "Show password"}
                        </button>
                      </div>
                      <input
                        id="auth-password"
                        name="password"
                        type={showPasswords ? "text" : "password"}
                        value={form.password}
                        onChange={(event) => updateForm("password", event.target.value)}
                        onBlur={() => setTouched((current) => ({ ...current, password: true }))}
                        autoComplete={mode === "register" ? "new-password" : "current-password"}
                        minLength={AUTH_PASSWORD_MIN_LENGTH}
                        maxLength={AUTH_PASSWORD_MAX_LENGTH}
                        aria-invalid={showError("password")}
                        aria-describedby={
                          mode === "register"
                            ? `auth-password-requirements${showError("password") ? " auth-password-error" : ""}`
                            : showError("password")
                              ? "auth-password-error"
                              : undefined
                        }
                        className={inputClassName}
                        placeholder={`At least ${AUTH_PASSWORD_MIN_LENGTH} characters`}
                      />
                      {mode === "register" && (
                        <p id="auth-password-requirements" className="text-xs leading-5 text-white/42">
                          Use {AUTH_PASSWORD_MIN_LENGTH}–{AUTH_PASSWORD_MAX_LENGTH} characters.
                        </p>
                      )}
                      <FieldError
                        id="auth-password-error"
                        error={validation.errors.password}
                        show={showError("password")}
                      />
                    </div>

                    {mode === "register" && (
                      <div className="grid gap-2">
                        <label htmlFor="auth-confirm-password" className="text-sm text-white/60">
                          Confirm password
                        </label>
                        <input
                          id="auth-confirm-password"
                          name="confirmPassword"
                          type={showPasswords ? "text" : "password"}
                          value={form.confirmPassword}
                          onChange={(event) => updateForm("confirmPassword", event.target.value)}
                          onBlur={() => setTouched((current) => ({ ...current, confirmPassword: true }))}
                          autoComplete="new-password"
                          minLength={AUTH_PASSWORD_MIN_LENGTH}
                          maxLength={AUTH_PASSWORD_MAX_LENGTH}
                          aria-invalid={showError("confirmPassword")}
                          aria-describedby={showError("confirmPassword") ? "auth-confirm-password-error" : undefined}
                          className={inputClassName}
                          placeholder="Repeat your password"
                        />
                        <FieldError
                          id="auth-confirm-password-error"
                          error={validation.errors.confirmPassword}
                          show={showError("confirmPassword")}
                        />
                      </div>
                    )}
                  </div>

                  {feedback && <FeedbackNotice feedback={feedback} />}

                  <button
                    type="submit"
                    disabled={isSubmitDisabled}
                    className="btn chat-button mt-6 w-full justify-center disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {getSubmitLabel(mode, isSubmitting, completedAuthMode)}
                  </button>

                  {serviceState.status === "unavailable" && (
                    <p className="mt-3 text-center text-xs leading-5 text-white/45">
                      Sign-in is paused until the secure account service responds.
                    </p>
                  )}
                </form>
              </div>
            </div>
          )}
        </motion.section>
      </main>
    </div>
  );
}

function AccountLoadingState() {
  return (
    <div className="glass-card grid gap-4 p-5 md:grid-cols-[1fr_1.2fr] md:p-8" role="status" aria-live="polite">
      <span className="sr-only">Checking your secure session…</span>
      <div className="space-y-4" aria-hidden="true">
        <div className="h-4 w-36 animate-pulse rounded-full bg-white/10" />
        <div className="h-9 w-2/3 animate-pulse rounded-xl bg-white/10" />
        <div className="h-4 w-full animate-pulse rounded-full bg-white/8" />
      </div>
      <div className="space-y-4" aria-hidden="true">
        <div className="h-14 animate-pulse rounded-2xl bg-white/8" />
        <div className="h-14 animate-pulse rounded-2xl bg-white/8" />
        <div className="h-12 animate-pulse rounded-full bg-white/10" />
      </div>
    </div>
  );
}

function AccountServiceNotice({
  state,
  onRetry,
  continueHref,
}: {
  state: Extract<ServiceState, { status: "unavailable" }>;
  onRetry: () => void;
  continueHref: string;
}) {
  return (
    <section
      className="glass-card border-amber-200/18 bg-amber-200/[0.04] p-5 md:p-6"
      role="alert"
      aria-live="assertive"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-100/65">Account status</p>
      <h2 className="mt-3 text-xl font-semibold text-white">Account service is temporarily unavailable</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-white/68">{state.message}</p>
      {process.env.NODE_ENV === "development" && state.details && (
        <details className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-white/52">
          <summary className="cursor-pointer font-semibold text-white/70">Development details</summary>
          <p className="mt-2 break-words font-mono leading-5">{state.details}</p>
        </details>
      )}
      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button type="button" onClick={onRetry} className="btn btn-active justify-center">
          Retry account service
        </button>
        <Link href={continueHref} className="btn justify-center">
          Continue without an account
        </Link>
        <Link href="/" className="btn justify-center text-white/72">
          Back to home
        </Link>
      </div>
    </section>
  );
}

function FeedbackNotice({ feedback }: { feedback: Feedback }) {
  return (
    <p
      className={`mt-5 rounded-2xl border p-4 text-sm leading-6 ${
        feedback.kind === "success"
          ? "border-emerald-300/20 bg-emerald-300/[0.07] text-emerald-50/85"
          : "border-rose-300/20 bg-rose-300/[0.07] text-rose-50/85"
      }`}
      role={feedback.kind === "error" ? "alert" : "status"}
      aria-live={feedback.kind === "error" ? "assertive" : "polite"}
    >
      {feedback.message}
    </p>
  );
}

function FieldError({ id, error, show }: { id: string; error?: string; show: boolean }) {
  if (!show || !error) return null;

  return (
    <p id={id} className="text-xs leading-5 text-rose-200" role="alert">
      {error}
    </p>
  );
}

function Benefit({ text }: { text: string }) {
  return (
    <p className="flex items-center gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/8 text-xs text-white/78" aria-hidden="true">
        ✓
      </span>
      {text}
    </p>
  );
}

function ProfileStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-white/5 p-4">
      <p className="text-xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/38">{label}</p>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 rounded-[18px] border border-white/10 bg-white/5 px-4 py-3">
      <span className="text-sm text-white/45">{label}</span>
      <span className="truncate text-sm font-medium text-white">{value}</span>
    </div>
  );
}

function createUnavailableState(payload?: AuthResponse): Extract<ServiceState, { status: "unavailable" }> {
  const suppliedDetails = payload?.developmentDetails ?? payload?.details;

  return {
    status: "unavailable",
    message:
      "We could not reach the secure account backend. You can retry, return home, or continue using the public guide and plans stored on this device.",
    details: typeof suppliedDetails === "string" ? suppliedDetails : undefined,
  };
}

function mergeServerSavedContent(tourist: TouristProfile) {
  const savedLocationIds = (tourist.savedLocations ?? [])
    .map((item) => item.locationId)
    .filter((id): id is string => typeof id === "string" && id.length > 0);
  const savedPlanIds = (tourist.savedRoutes ?? [])
    .map((item) => item.planId)
    .filter((id): id is string => typeof id === "string" && id.length > 0);

  if (savedLocationIds.length > 0) {
    writeStoredIds(LOCATION_FAVORITES_KEY, [
      ...savedLocationIds,
      ...readStoredIds(LOCATION_FAVORITES_KEY),
    ]);
  }

  if (savedPlanIds.length > 0) {
    writeStoredIds(SAVED_ROUTES_KEY, [
      ...savedPlanIds,
      ...readStoredIds(SAVED_ROUTES_KEY),
    ]);
  }
}

async function syncLocalSavedContent() {
  const requests = [
    ...readStoredIds(LOCATION_FAVORITES_KEY).map((locationId) =>
      fetch("/api/saved-locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ locationId }),
      })
    ),
    ...readStoredIds(SAVED_ROUTES_KEY).map((planId) =>
      fetch("/api/saved-routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ planId }),
      })
    ),
  ];

  await Promise.allSettled(requests);
}

function focusFirstInvalidField(mode: AuthFormMode, errors: AuthFieldErrors) {
  const order: AuthField[] = mode === "register"
    ? ["name", "email", "password", "confirmPassword"]
    : ["email", "password"];
  const firstInvalid = order.find((field) => errors[field]);
  if (!firstInvalid) return;

  const id = firstInvalid === "confirmPassword" ? "auth-confirm-password" : `auth-${firstInvalid}`;
  window.requestAnimationFrame(() => document.getElementById(id)?.focus());
}

function getSubmitLabel(
  mode: AuthFormMode,
  isSubmitting: boolean,
  completedAuthMode: AuthFormMode | null
) {
  if (completedAuthMode) return completedAuthMode === "register" ? "Account created" : "Welcome back";
  if (isSubmitting) return mode === "register" ? "Creating account…" : "Logging in…";
  return mode === "register" ? "Create account" : "Log in";
}

function getInitials(value: string) {
  return value
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "MT";
}
