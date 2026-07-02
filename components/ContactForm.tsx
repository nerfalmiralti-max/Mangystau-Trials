"use client";

import { type FormEvent, useState } from "react";

type ContactFormState = {
  name: string;
  email: string;
  travelWindow: string;
  message: string;
  company: string;
};

type SubmitState = {
  type: "idle" | "success" | "error";
  message: string;
};

const emptyForm: ContactFormState = {
  name: "",
  email: "",
  travelWindow: "",
  message: "",
  company: "",
};

export default function ContactForm() {
  const [form, setForm] = useState<ContactFormState>(emptyForm);
  const [submitState, setSubmitState] = useState<SubmitState>({
    type: "idle",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateForm = (field: keyof ContactFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submitContact = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitState({ type: "idle", message: "" });
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "Message could not be sent. Please try again.");
      }

      setForm(emptyForm);
      setSubmitState({
        type: "success",
        message: data.message || "Message sent. We will reply by email soon.",
      });
    } catch (error) {
      setSubmitState({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Message could not be sent. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form id="contact" onSubmit={submitContact} className="glass-card p-5 md:p-6">
      <div className="mb-5">
        <p className="text-sm uppercase tracking-[0.24em] text-white/40">Contact</p>
        <h2 className="mt-3 text-2xl font-semibold text-white">Tell us about your route</h2>
      </div>

      <input
        tabIndex={-1}
        autoComplete="off"
        value={form.company}
        onChange={(event) => updateForm("company", event.target.value)}
        className="hidden"
        name="company"
        aria-hidden="true"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm text-white/60">Name</span>
          <input
            required
            value={form.name}
            onChange={(event) => updateForm("name", event.target.value)}
            className="rounded-2xl border border-white/10 bg-[#0f0f0f] px-4 py-3 text-white outline-none transition focus:border-white/30"
            placeholder="Your name"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-white/60">Email</span>
          <input
            required
            type="email"
            value={form.email}
            onChange={(event) => updateForm("email", event.target.value)}
            className="rounded-2xl border border-white/10 bg-[#0f0f0f] px-4 py-3 text-white outline-none transition focus:border-white/30"
            placeholder="you@example.com"
          />
        </label>
      </div>

      <label className="mt-4 grid gap-2">
        <span className="text-sm text-white/60">Travel window</span>
        <input
          value={form.travelWindow}
          onChange={(event) => updateForm("travelWindow", event.target.value)}
          className="rounded-2xl border border-white/10 bg-[#0f0f0f] px-4 py-3 text-white outline-none transition focus:border-white/30"
          placeholder="April, 3 days, flexible"
        />
      </label>

      <label className="mt-4 grid gap-2">
        <span className="text-sm text-white/60">Message</span>
        <textarea
          required
          minLength={12}
          value={form.message}
          onChange={(event) => updateForm("message", event.target.value)}
          className="min-h-32 resize-y rounded-2xl border border-white/10 bg-[#0f0f0f] px-4 py-3 text-white outline-none transition focus:border-white/30"
          placeholder="Tell us where you want to go, your pace, group size and what feels important."
        />
      </label>

      {submitState.message ? (
        <p
          aria-live="polite"
          className={`mt-4 rounded-2xl border p-4 text-sm leading-6 ${
            submitState.type === "success"
              ? "border-[#0f766e]/45 bg-[#0f766e]/12 text-white"
              : "border-[#f59e0b]/45 bg-[#f59e0b]/12 text-white"
          }`}
        >
          {submitState.message}
        </p>
      ) : null}

      <button disabled={isSubmitting} className="btn chat-button mt-5 w-full disabled:opacity-50">
        {isSubmitting ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
