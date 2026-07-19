import { describe, expect, it } from "vitest";

import { validateReviewInput } from "@/lib/reviewValidation";

describe("review validation", () => {
  it("normalizes a valid review", () => {
    expect(
      validateReviewInput({
        rating: "5",
        title: "  Worth the early start  ",
        text: "  Beautiful landscape, and our guide kept the route safe.  ",
      })
    ).toEqual({
      success: true,
      data: {
        rating: 5,
        title: "Worth the early start",
        text: "Beautiful landscape, and our guide kept the route safe.",
      },
    });
  });

  it("uses null for an omitted optional title", () => {
    const result = validateReviewInput({
      rating: 4,
      text: "Clear directions and enough detail for a careful visit.",
    });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.title).toBeNull();
  });

  it.each([0, 6, 2.5, "five", null, undefined])("rejects invalid rating %p", (rating) => {
    const result = validateReviewInput({
      rating,
      text: "This review contains enough useful detail for validation.",
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.errors.rating).toBe("Choose a rating from 1 to 5.");
  });

  it("rejects short and oversized content at exact boundaries", () => {
    const short = validateReviewInput({ rating: 5, text: "x".repeat(19) });
    const minimum = validateReviewInput({ rating: 5, text: "x".repeat(20) });
    const long = validateReviewInput({
      rating: 5,
      title: "x".repeat(81),
      text: "x".repeat(1201),
    });

    expect(short.success).toBe(false);
    expect(minimum.success).toBe(true);
    expect(long).toEqual({
      success: false,
      errors: {
        title: "Keep the title under 80 characters.",
        text: "Keep the review under 1,200 characters.",
      },
    });
  });

  it("strips null bytes before validating and returning text", () => {
    const result = validateReviewInput({
      rating: 4,
      title: "Safe\0 trip",
      text: "A\0 detailed account with enough characters to be accepted.",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("Safe trip");
      expect(result.data.text).not.toContain("\0");
    }
  });
});
