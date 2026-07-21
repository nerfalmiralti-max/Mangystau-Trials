"use client";

import {
  type FormEvent,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CONTACT_LIMITS,
  type ContactField,
  type ContactFieldErrors,
  isContactRequestId,
  validateContactInput,
} from "@/lib/contactValidation";
import { useToast } from "@/components/ToastProvider";
import { useSettings } from "@/hooks/useSettings";

type ContactFormState = Record<ContactField, string> & {
  company: string;
};

type SubmissionPhase = "idle" | "validating" | "submitting" | "success" | "error";

type SubmissionState = {
  phase: SubmissionPhase;
  message: string;
  retryable: boolean;
};

type ContactResponse = {
  ok?: boolean;
  code?: string;
  message?: string;
  error?: string;
  fieldErrors?: ContactFieldErrors;
  retryable?: boolean;
  resetRequestId?: boolean;
};

type ContactDraft = Partial<ContactFormState> & {
  requestId?: unknown;
  savedAt?: unknown;
};

const emptyForm: ContactFormState = {
  name: "",
  email: "",
  travelWindow: "",
  message: "",
  company: "",
};
const idleSubmission: SubmissionState = { phase: "idle", message: "", retryable: false };
const contactDraftBaseKey = "mangystau:contact-draft";
const contactDraftTtlMs = 24 * 60 * 60 * 1000;
const fieldOrder: ContactField[] = ["name", "email", "travelWindow", "message"];

export default function ContactForm() {
  const { showToast } = useToast();
  const { formatNumber, translate } = useSettings();
  const [form, setForm] = useState<ContactFormState>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<ContactFieldErrors>({});
  const [submission, setSubmission] = useState<SubmissionState>(idleSubmission);
  const [draftReady, setDraftReady] = useState(false);
  const [draftScope, setDraftScope] = useState<string | null>(null);
  const [requestId, setRequestId] = useState(createSubmissionId);
  const formRef = useRef<HTMLFormElement>(null);
  const fieldRefs = useRef<Partial<Record<ContactField, HTMLInputElement | HTMLTextAreaElement>>>({});
  const submittingRef = useRef(false);
  const isSubmitting = submission.phase === "submitting";

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    void (async () => {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
          credentials: "same-origin",
          signal: controller.signal,
        });
        const payload = response.ok
          ? ((await response.json()) as {
              tourist?: {
                id?: string | null;
                name?: string | null;
                email?: string | null;
              } | null;
            })
          : null;
        const tourist = payload?.tourist ?? null;
        const scope = tourist?.id ? `tourist:${tourist.id}` : response.status === 401 ? "guest" : null;
        if (!active) return;

        const draft = scope ? readContactDraft(scope) : null;
        setForm((current) => ({
          ...current,
          name:
            current.name ||
            readDraftField(draft?.name, CONTACT_LIMITS.name) ||
            tourist?.name ||
            "",
          email:
            current.email ||
            readDraftField(draft?.email, CONTACT_LIMITS.email) ||
            tourist?.email ||
            "",
          travelWindow:
            current.travelWindow ||
            readDraftField(draft?.travelWindow, CONTACT_LIMITS.travelWindow),
          message: current.message || readDraftField(draft?.message, CONTACT_LIMITS.message),
        }));
        if (isContactRequestId(draft?.requestId)) setRequestId(draft.requestId);
        setDraftScope(scope);
      } catch {
        // Do not load an unscoped PII draft when account identity cannot be verified.
      } finally {
        if (active) setDraftReady(true);
      }
    })();

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (!draftReady || !draftScope) return;

    try {
      window.sessionStorage.removeItem(contactDraftBaseKey);
      const storageKey = getContactDraftKey(draftScope);
      if (!form.travelWindow.trim() && !form.message.trim()) {
        window.sessionStorage.removeItem(storageKey);
        return;
      }

      window.sessionStorage.setItem(
        storageKey,
        JSON.stringify({
          name: form.name,
          email: form.email,
          travelWindow: form.travelWindow,
          message: form.message,
          requestId,
          savedAt: Date.now(),
        })
      );
    } catch {
      // A failed draft write must never block form submission.
    }
  }, [draftReady, draftScope, form.email, form.message, form.name, form.travelWindow, requestId]);

  const updateForm = (field: keyof ContactFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));

    if (field !== "company") {
      setFieldErrors((current) => {
        if (!current[field]) return current;
        const next = { ...current };
        delete next[field];
        return next;
      });
    }

    if (submission.phase !== "idle" && submission.phase !== "submitting") {
      setSubmission(idleSubmission);
    }
  };

  const submitContact = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current) return;

    setSubmission({ phase: "validating", message: "", retryable: false });
    const validation = validateContactInput({ ...form, requestId });

    if (!validation.ok) {
      setFieldErrors(localizeContactErrors(validation.errors, translate));
      setSubmission({
        phase: "error",
        message: translate(validation.formError || "Check the highlighted fields and try again."),
        retryable: false,
      });
      focusFirstError(validation.errors, fieldRefs);
      return;
    }

    submittingRef.current = true;
    setFieldErrors({});
    setSubmission({ phase: "submitting", message: "", retryable: false });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(validation.data),
      });
      const payload = readContactResponse(await response.json().catch(() => null));

      if (!response.ok || payload.ok !== true || !isSuccessfulContactCode(payload.code)) {
        const nextErrors = localizeContactErrors(payload.fieldErrors ?? {}, translate);
        setFieldErrors(nextErrors);
        if (payload.resetRequestId) setRequestId(createSubmissionId());
        setSubmission({
          phase: "error",
          message: translate(
            payload.error ||
              "We could not verify that your route request was saved. Your details are still here; try again."
          ),
          retryable: payload.retryable ?? (response.status >= 500 || response.status === 429),
        });
        focusFirstError(nextErrors, fieldRefs);
        return;
      }

      const successMessage = translate(
        payload.message ||
          "Your route request has been saved. We’ll use the details to help prepare your Mangystau journey."
      );
      setRequestId(createSubmissionId());
      setForm((current) => ({ ...current, travelWindow: "", message: "", company: "" }));
      setSubmission({ phase: "success", message: successMessage, retryable: false });
      showToast({
        kind: "success",
        title: translate("Route request saved"),
        message: translate("Your route details are safely recorded."),
      });
    } catch {
      setSubmission({
        phase: "error",
        message: translate("The network interrupted the request. Your details are still here; try again."),
        retryable: true,
      });
    } finally {
      submittingRef.current = false;
    }
  };

  return (
    <form
      ref={formRef}
      id="contact"
      noValidate
      onSubmit={submitContact}
      aria-busy={isSubmitting}
      className="glass-card p-5 md:p-6"
    >
      <div className="mb-5">
        <p className="text-sm uppercase tracking-[0.24em] text-white/40">{translate("Contact")}</p>
        <h2 className="mt-3 text-2xl font-semibold text-white">{translate("Tell us about your route")}</h2>
        <p className="mt-2 text-sm leading-6 text-white/54">
          {translate("All four fields are required. We only show confirmation after your route details are saved.")}
        </p>
      </div>

      <input
        tabIndex={-1}
        autoComplete="off"
        value={form.company}
        onChange={(event) => updateForm("company", event.target.value)}
        className="pointer-events-none absolute -left-[10000px] h-px w-px opacity-0"
        name="company"
        aria-hidden="true"
      />

      <fieldset disabled={isSubmitting} className="min-w-0 border-0 p-0 disabled:opacity-80">
        <legend className="sr-only">{translate("Route request details")}</legend>
        <div className="grid gap-x-4 sm:grid-cols-2 [&>label]:sm:mt-0">
          <ContactFieldWrapper
            inputId="contact-name"
            label={translate("Name")}
            error={fieldErrors.name}
            errorId="contact-name-error"
          >
            <input
              ref={(element) => { fieldRefs.current.name = element ?? undefined; }}
              id="contact-name"
              name="name"
              required
              maxLength={CONTACT_LIMITS.name}
              autoComplete="name"
              value={form.name}
              onChange={(event) => updateForm("name", event.target.value)}
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? "contact-name-error" : undefined}
              className={contactFieldClass(Boolean(fieldErrors.name))}
              placeholder={translate("Your name")}
            />
          </ContactFieldWrapper>

          <ContactFieldWrapper
            inputId="contact-email"
            label="Email"
            error={fieldErrors.email}
            errorId="contact-email-error"
          >
            <input
              ref={(element) => { fieldRefs.current.email = element ?? undefined; }}
              id="contact-email"
              name="email"
              required
              type="email"
              inputMode="email"
              maxLength={CONTACT_LIMITS.email}
              autoComplete="email"
              value={form.email}
              onChange={(event) => updateForm("email", event.target.value)}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? "contact-email-error" : undefined}
              className={contactFieldClass(Boolean(fieldErrors.email))}
              placeholder="you@example.com"
            />
          </ContactFieldWrapper>
        </div>

        <ContactFieldWrapper
          inputId="contact-travel-window"
          label={translate("Travel window")}
          error={fieldErrors.travelWindow}
          errorId="contact-travel-window-error"
        >
          <input
            ref={(element) => { fieldRefs.current.travelWindow = element ?? undefined; }}
            id="contact-travel-window"
            name="travelWindow"
            required
            maxLength={CONTACT_LIMITS.travelWindow}
            autoComplete="off"
            value={form.travelWindow}
            onChange={(event) => updateForm("travelWindow", event.target.value)}
            aria-invalid={Boolean(fieldErrors.travelWindow)}
            aria-describedby={fieldErrors.travelWindow ? "contact-travel-window-error" : undefined}
            className={contactFieldClass(Boolean(fieldErrors.travelWindow))}
            placeholder={translate("April, 3 days, flexible")}
          />
        </ContactFieldWrapper>

        <ContactFieldWrapper
          inputId="contact-message"
          label={translate("Message")}
          error={fieldErrors.message}
          errorId="contact-message-error"
        >
          <textarea
            ref={(element) => { fieldRefs.current.message = element ?? undefined; }}
            id="contact-message"
            name="message"
            required
            minLength={12}
            maxLength={CONTACT_LIMITS.message}
            value={form.message}
            onChange={(event) => updateForm("message", event.target.value)}
            aria-invalid={Boolean(fieldErrors.message)}
            aria-describedby={
              fieldErrors.message
                ? "contact-message-error contact-message-hint"
                : "contact-message-hint"
            }
            className={`${contactFieldClass(Boolean(fieldErrors.message))} min-h-32 resize-y`}
            placeholder={translate("Tell us where you want to go, your pace, group size and what feels important.")}
          />
          <span id="contact-message-hint" className="mt-1 text-xs text-white/52">
            {formatNumber(12)}–{formatNumber(CONTACT_LIMITS.message)} {translate("characters")}
          </span>
        </ContactFieldWrapper>
      </fieldset>

      <AnimatePresence initial={false} mode="popLayout">
        {submission.message ? (
          <motion.div
            key={`${submission.phase}:${submission.message}`}
            initial={{ opacity: 0, y: 6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            role={submission.phase === "error" ? "alert" : "status"}
            aria-live={submission.phase === "error" ? "assertive" : "polite"}
            className={`mt-2 overflow-hidden rounded-2xl border p-4 text-sm leading-6 ${
              submission.phase === "success"
                ? "border-emerald-300/30 bg-emerald-300/8 text-emerald-50 shadow-[0_0_28px_rgba(52,211,153,0.06)]"
                : "border-amber-300/35 bg-amber-300/8 text-amber-50"
            }`}
          >
            <div className="flex items-start gap-3">
              <span aria-hidden="true" className="mt-0.5 font-bold">
                {submission.phase === "success" ? "✓" : "!"}
              </span>
              <div className="min-w-0 flex-1">
                <p>{submission.message}</p>
                {submission.retryable ? (
                  <button
                    type="button"
                    onClick={() => formRef.current?.requestSubmit()}
                    className="mt-2 min-h-11 rounded-full border border-white/16 px-4 text-xs font-semibold text-white transition duration-150 hover:bg-white/8"
                  >
                    {translate("Try again")}
                  </button>
                ) : null}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <button
        type="submit"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
        className="btn chat-button mt-5 inline-grid min-h-12 w-full place-items-center overflow-hidden transition duration-150 hover:-translate-y-0.5 active:translate-y-px disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0"
      >
        <span className="inline-flex min-h-5 items-center justify-center gap-2">
          {isSubmitting ? (
            <>
              <span
                aria-hidden="true"
                className="size-4 animate-spin rounded-full border-2 border-white/25 border-t-white"
              />
              {translate("Sending…")}
            </>
          ) : (
            translate("Send message")
          )}
        </span>
      </button>
    </form>
  );
}

function ContactFieldWrapper({
  inputId,
  label,
  error,
  errorId,
  children,
}: {
  inputId: string;
  label: string;
  error?: string;
  errorId: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4 grid min-w-0 gap-2 first:mt-0 sm:first:mt-0">
      <label htmlFor={inputId} className="text-sm font-medium text-white/64">
        {label}
      </label>
      {children}
      <span
        id={errorId}
        aria-hidden={error ? undefined : true}
        className={`min-h-5 text-xs leading-5 ${error ? "text-amber-200" : "text-transparent"}`}
      >
        {error ? (
          <>
            <span aria-hidden="true" className="mr-1">!</span>
            {error}
          </>
        ) : null}
      </span>
    </div>
  );
}

function contactFieldClass(hasError: boolean) {
  return `min-h-12 w-full min-w-0 rounded-2xl border bg-[#0f0f0f] px-4 py-3 text-white outline-none transition-[border-color,box-shadow,background-color] duration-200 placeholder:text-white/28 focus:ring-4 ${
    hasError
      ? "border-amber-300/55 focus:border-amber-200/75 focus:ring-amber-300/10"
      : "border-white/10 hover:border-white/20 focus:border-[#d9b382]/55 focus:ring-[#d9b382]/10"
  }`;
}

function localizeContactErrors(
  errors: ContactFieldErrors,
  translate: (value: string) => string
) {
  return Object.fromEntries(
    Object.entries(errors).map(([field, message]) => [field, translate(message)])
  ) as ContactFieldErrors;
}

function isSuccessfulContactCode(code: unknown) {
  return (
    code === "CONTACT_STORED" ||
    code === "CONTACT_STORED_AND_NOTIFIED" ||
    code === "CONTACT_ALREADY_STORED"
  );
}

function readContactResponse(value: unknown): ContactResponse {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as ContactResponse)
    : {};
}

function focusFirstError(
  errors: ContactFieldErrors,
  refs: RefObject<Partial<Record<ContactField, HTMLInputElement | HTMLTextAreaElement>>>
) {
  const firstError = fieldOrder.find((field) => Boolean(errors[field]));
  if (!firstError) return;
  window.requestAnimationFrame(() => refs.current?.[firstError]?.focus());
}

function createSubmissionId() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  const random = Math.random().toString(36).slice(2);
  return `${Date.now().toString(36)}_${random}_${random}`.slice(0, CONTACT_LIMITS.requestId);
}

function getContactDraftKey(scope: string) {
  return `${contactDraftBaseKey}:${scope}`;
}

function readContactDraft(scope: string): ContactDraft | null {
  try {
    const storageKey = getContactDraftKey(scope);
    const rawDraft = window.sessionStorage.getItem(storageKey);
    if (!rawDraft) return null;

    const draft = JSON.parse(rawDraft) as ContactDraft;
    const savedAt = typeof draft.savedAt === "number" ? draft.savedAt : 0;
    if (savedAt <= 0 || Date.now() - savedAt > contactDraftTtlMs) {
      window.sessionStorage.removeItem(storageKey);
      return null;
    }

    return draft;
  } catch {
    return null;
  }
}

function readDraftField(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.slice(0, maxLength) : "";
}
