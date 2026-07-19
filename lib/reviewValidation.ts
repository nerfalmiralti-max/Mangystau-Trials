export type ReviewFieldErrors = Partial<Record<"rating" | "title" | "text", string>>;

export type ValidReviewInput = {
  rating: number;
  title: string | null;
  text: string;
};

export function validateReviewInput(input: Record<string, unknown>) {
  const rating = typeof input.rating === "number" ? input.rating : Number(input.rating);
  const title = readText(input.title, 80);
  const text = readText(input.text, 1200);
  const errors: ReviewFieldErrors = {};

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    errors.rating = "Choose a rating from 1 to 5.";
  }
  if (title.length > 80) errors.title = "Keep the title under 80 characters.";
  if (text.length < 20) errors.text = "Add at least 20 characters about your visit.";
  if (text.length > 1200) errors.text = "Keep the review under 1,200 characters.";

  return Object.keys(errors).length > 0
    ? { success: false as const, errors }
    : {
        success: true as const,
        data: { rating, title: title || null, text } satisfies ValidReviewInput,
      };
}

function readText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.replace(/\0/g, "").trim().slice(0, maxLength + 1);
}
