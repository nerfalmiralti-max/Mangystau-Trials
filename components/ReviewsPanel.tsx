"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { validateReviewInput, type ReviewFieldErrors } from "@/lib/reviewValidation";
import { useToast } from "@/components/ToastProvider";
import type { PlaceReview } from "@/lib/tourismData";

type CommunityReview = {
  id: string;
  rating: number;
  title: string | null;
  text: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  isOwner: boolean;
};

type ReviewsResponse = {
  reviews?: CommunityReview[];
  review?: CommunityReview;
  authenticated?: boolean;
  error?: string;
  fieldErrors?: ReviewFieldErrors;
};

type ReviewForm = { rating: number; title: string; text: string };

const emptyForm: ReviewForm = { rating: 5, title: "", text: "" };

export default function ReviewsPanel({
  placeId,
  placeName,
  editorialNotes,
}: {
  placeId: string;
  placeName: string;
  editorialNotes: PlaceReview[];
}) {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<CommunityReview[]>([]);
  const [authenticated, setAuthenticated] = useState(false);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "unavailable">("loading");
  const [form, setForm] = useState<ReviewForm>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<ReviewFieldErrors>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState("");
  const retryButtonRef = useRef<HTMLButtonElement>(null);
  const restoreRetryFocusRef = useRef(false);
  const loadAbortRef = useRef<AbortController | null>(null);
  const loadRequestIdRef = useRef(0);
  const mutationPendingRef = useRef(false);
  const reviewsSectionRef = useRef<HTMLElement>(null);
  const ownReview = useMemo(() => reviews.find((review) => review.isOwner), [reviews]);

  const loadReviews = useCallback(async () => {
    const requestId = loadRequestIdRef.current + 1;
    const controller = new AbortController();
    loadRequestIdRef.current = requestId;
    loadAbortRef.current?.abort();
    loadAbortRef.current = controller;
    setLoadState("loading");
    setStatus("");

    try {
      const response = await fetch(`/api/reviews?placeId=${encodeURIComponent(placeId)}`, {
        cache: "no-store",
        credentials: "same-origin",
        signal: controller.signal,
      });
      const payload = (await response.json().catch(() => ({}))) as ReviewsResponse;
      if (!response.ok) throw new Error(payload.error || "Reviews could not be loaded.");
      if (controller.signal.aborted || loadRequestIdRef.current !== requestId) return;

      setReviews(payload.reviews ?? []);
      setAuthenticated(Boolean(payload.authenticated));
      setLoadState("ready");
    } catch {
      if (controller.signal.aborted || loadRequestIdRef.current !== requestId) return;
      setLoadState("unavailable");
    } finally {
      if (loadRequestIdRef.current === requestId) {
        loadAbortRef.current = null;
      }
    }
  }, [placeId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadReviews();
    }, 0);

    return () => {
      window.clearTimeout(timer);
      loadRequestIdRef.current += 1;
      loadAbortRef.current?.abort();
      loadAbortRef.current = null;
    };
  }, [loadReviews]);

  useEffect(() => {
    if (!restoreRetryFocusRef.current) return;

    if (loadState === "ready") {
      restoreRetryFocusRef.current = false;
      return;
    }

    if (loadState === "unavailable") {
      const frame = window.requestAnimationFrame(() => retryButtonRef.current?.focus());
      restoreRetryFocusRef.current = false;
      return () => window.cancelAnimationFrame(frame);
    }
  }, [loadState]);

  const retryReviews = () => {
    restoreRetryFocusRef.current = true;
    void loadReviews();
  };

  const submitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (mutationPendingRef.current) return;
    setStatus("");
    const validated = validateReviewInput(form);
    if (!validated.success) {
      setFieldErrors(validated.errors);
      setStatus("Check the highlighted review fields.");
      focusFirstReviewError(validated.errors);
      return;
    }

    setFieldErrors({});
    mutationPendingRef.current = true;
    setIsSubmitting(true);
    try {
      const response = await fetch(editingId ? `/api/reviews/${editingId}` : "/api/reviews", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ placeId, ...validated.data }),
      });
      const payload = (await response.json().catch(() => ({}))) as ReviewsResponse;
      if (!response.ok || !payload.review) {
        setFieldErrors(payload.fieldErrors ?? {});
        if (response.status === 401) setAuthenticated(false);
        focusFirstReviewError(payload.fieldErrors ?? {});
        throw new Error(payload.error || "Review could not be saved.");
      }

      setReviews((current) =>
        editingId
          ? current.map((review) => (review.id === editingId ? payload.review! : review))
          : [payload.review!, ...current]
      );
      setForm(emptyForm);
      setEditingId(null);
      setStatus(editingId ? "Review updated." : "Review published.");
      showToast({
        kind: "success",
        title: editingId ? "Review updated" : "Review published",
        message: `${placeName} community notes are up to date.`,
      });
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Review could not be saved.");
    } finally {
      mutationPendingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const startEditing = (review: CommunityReview) => {
    setEditingId(review.id);
    setForm({ rating: review.rating, title: review.title ?? "", text: review.text });
    setFieldErrors({});
    setStatus("");
    window.requestAnimationFrame(() => document.getElementById("review-title")?.focus());
  };

  const deleteReview = async (reviewId: string) => {
    if (confirmDeleteId !== reviewId) {
      setConfirmDeleteId(reviewId);
      setStatus("Press Confirm delete to remove your review.");
      return;
    }

    if (mutationPendingRef.current) return;

    mutationPendingRef.current = true;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const payload = (await response.json().catch(() => ({}))) as ReviewsResponse;
      if (!response.ok) {
        if (response.status === 401) setAuthenticated(false);
        throw new Error(payload.error || "Review could not be deleted.");
      }

      setReviews((current) => current.filter((review) => review.id !== reviewId));
      setConfirmDeleteId(null);
      setEditingId(null);
      setForm(emptyForm);
      setStatus("Review deleted.");
      showToast({ kind: "success", title: "Review deleted" });
      window.requestAnimationFrame(() => reviewsSectionRef.current?.focus());
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Review could not be deleted.");
    } finally {
      mutationPendingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <section
      ref={reviewsSectionRef}
      id="reviews"
      tabIndex={-1}
      className="rounded-[18px] border border-white/10 bg-white/5 p-5 outline-none md:rounded-[22px] md:p-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#d9b382]">Community</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Traveler reviews</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/58">
            Account reviews are live submissions. Editorial notes below are clearly marked previews.
          </p>
        </div>
        {loadState === "unavailable" ? (
          <button ref={retryButtonRef} type="button" onClick={retryReviews} className="btn min-h-11 justify-center">
            Retry
          </button>
        ) : null}
      </div>

      {loadState === "loading" ? (
        <div role="status" className="mt-5 grid gap-3" aria-label="Loading traveler reviews">
          <div className="h-24 animate-pulse rounded-2xl bg-white/6" />
          <span className="sr-only">Loading traveler reviews</span>
        </div>
      ) : loadState === "unavailable" ? (
        <p className="mt-5 rounded-2xl border border-amber-200/15 bg-amber-200/7 p-4 text-sm leading-6 text-amber-50/75">
          Live community reviews are unavailable until the account database is connected. Editorial notes remain available for trip comparison.
        </p>
      ) : reviews.length > 0 ? (
        <div className="mt-5 grid gap-3">
          <AnimatePresence initial={false}>
            {reviews.map((review) => (
              <motion.article
                key={review.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-2xl border border-white/10 bg-black/12 p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold text-white">{review.title || `${placeName} visit`}</p>
                    <p className="mt-1 text-xs text-white/42">
                      {review.author} · {formatReviewDate(review.updatedAt || review.createdAt)}
                    </p>
                  </div>
                  <span className="w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                    {review.rating.toFixed(1)} / 5
                  </span>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-white/68">{review.text}</p>
                {review.isOwner ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" onClick={() => startEditing(review)} className="btn min-h-10 px-4 py-2 text-xs">
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => void deleteReview(review.id)}
                      className="btn min-h-10 px-4 py-2 text-xs text-rose-100 disabled:opacity-50"
                    >
                      {confirmDeleteId === review.id ? "Confirm delete" : "Delete"}
                    </button>
                    {confirmDeleteId === review.id ? (
                      <button type="button" onClick={() => setConfirmDeleteId(null)} className="btn min-h-10 px-4 py-2 text-xs">
                        Cancel
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <p className="mt-5 rounded-2xl border border-white/10 bg-white/4 p-4 text-sm text-white/58">
          No traveler reviews yet. Be the first to share a useful, specific visit note.
        </p>
      )}

      {loadState === "ready" ? (
        authenticated ? (
          !ownReview || editingId ? (
            <ReviewForm
              form={form}
              errors={fieldErrors}
              editing={Boolean(editingId)}
              submitting={isSubmitting}
              onChange={setForm}
              onCancel={() => {
                setEditingId(null);
                setForm(emptyForm);
                setFieldErrors({});
              }}
              onSubmit={submitReview}
            />
          ) : null
        ) : (
          <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-6 text-white/62">Log in to publish and manage your own review.</p>
            <Link
              href={`/profile?mode=login&next=${encodeURIComponent(`/locations/${placeId}#reviews`)}`}
              className="btn chat-button min-h-11 justify-center"
            >
              Log in to review
            </Link>
          </div>
        )
      ) : null}

      {status ? (
        <p aria-live="polite" className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white/72">
          {status}
        </p>
      ) : null}

      <div className="mt-6 border-t border-white/10 pt-5">
        <h3 className="text-base font-semibold text-white">Editorial field notes</h3>
        <div className="mt-3 grid gap-3">
          {editorialNotes.map((note) => (
            <article key={note.id} className="rounded-2xl border border-white/8 bg-white/[0.035] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-white/86">{note.title}</p>
                <span className="rounded-full border border-[#d9b382]/20 bg-[#d9b382]/8 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-[#e7cda7]">
                  Editorial preview
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-white/60">{note.text}</p>
              <p className="mt-3 text-xs text-white/38">Research note · {note.tripType} · {note.rating.toFixed(1)} / 5</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ReviewForm({
  form,
  errors,
  editing,
  submitting,
  onChange,
  onCancel,
  onSubmit,
}: {
  form: ReviewForm;
  errors: ReviewFieldErrors;
  editing: boolean;
  submitting: boolean;
  onChange: (form: ReviewForm) => void;
  onCancel: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form aria-busy={submitting} onSubmit={onSubmit} className="mt-5 rounded-2xl border border-white/10 bg-black/14 p-4" noValidate>
      <h3 className="font-semibold text-white">{editing ? "Edit your review" : "Share a visit note"}</h3>
      <fieldset className="mt-4" aria-describedby={errors.rating ? "review-rating-error" : undefined}>
        <legend className="text-sm text-white/62">Rating</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              id={`review-rating-${rating}`}
              type="button"
              aria-pressed={form.rating === rating}
              onClick={() => onChange({ ...form, rating })}
              className={`btn min-h-11 min-w-11 justify-center ${form.rating === rating ? "btn-active" : ""}`}
            >
              {rating}
            </button>
          ))}
        </div>
        {errors.rating ? <p id="review-rating-error" role="alert" className="mt-2 text-sm text-rose-200">{errors.rating}</p> : null}
      </fieldset>
      <label className="mt-4 grid gap-2">
        <span className="text-sm text-white/62">Title <span className="text-white/35">(optional)</span></span>
        <input
          id="review-title"
          value={form.title}
          maxLength={80}
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? "review-title-error" : undefined}
          onChange={(event) => onChange({ ...form, title: event.target.value })}
          className="min-h-12 rounded-2xl border border-white/10 bg-[#0f0f0f] px-4 text-white outline-none focus:border-white/30"
          placeholder="What stood out?"
        />
        {errors.title ? <span id="review-title-error" role="alert" className="text-sm text-rose-200">{errors.title}</span> : null}
      </label>
      <label className="mt-4 grid gap-2">
        <span className="text-sm text-white/62">Your experience</span>
        <textarea
          id="review-text"
          required
          minLength={20}
          maxLength={1200}
          value={form.text}
          aria-invalid={Boolean(errors.text)}
          aria-describedby={errors.text ? "review-text-error" : undefined}
          onChange={(event) => onChange({ ...form, text: event.target.value })}
          className="min-h-32 resize-y rounded-2xl border border-white/10 bg-[#0f0f0f] px-4 py-3 text-white outline-none focus:border-white/30"
          placeholder="Road conditions, timing, guide support and one tip for the next traveler."
        />
        <span className="flex justify-between gap-3 text-xs text-white/38">
          <span id={errors.text ? "review-text-error" : undefined} role={errors.text ? "alert" : undefined}>{errors.text || "20–1,200 characters"}</span>
          <span>{form.text.length}/1200</span>
        </span>
      </label>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button type="submit" disabled={submitting} className="btn chat-button min-h-11 justify-center disabled:opacity-50">
          {submitting ? "Saving…" : editing ? "Update review" : "Publish review"}
        </button>
        {editing ? (
          <button type="button" onClick={onCancel} className="btn min-h-11 justify-center">
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}

function focusFirstReviewError(errors: ReviewFieldErrors) {
  const targetId = errors.rating
    ? "review-rating-1"
    : errors.title
      ? "review-title"
      : errors.text
        ? "review-text"
        : null;

  if (!targetId) return;
  window.requestAnimationFrame(() => document.getElementById(targetId)?.focus());
}

function formatReviewDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Recent visit"
    : new Intl.DateTimeFormat("en", { year: "numeric", month: "short", day: "numeric" }).format(date);
}
