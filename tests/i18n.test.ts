import { describe, expect, it } from "vitest";

import {
  getLanguageFromAcceptLanguage,
  getLanguageLocale,
  translateUiText,
} from "@/lib/i18n";

describe("application localization", () => {
  it.each([
    ["en", "Home"],
    ["ru", "Главная"],
    ["kk", "Басты"],
  ] as const)("renders the Home label in %s", (language, expected) => {
    expect(translateUiText(language, "Home")).toBe(expected);
  });

  it("detects supported locales from an Accept-Language priority list", () => {
    expect(getLanguageFromAcceptLanguage("de-DE,de;q=0.9,ru-RU;q=0.8,en;q=0.7")).toBe("ru");
    expect(getLanguageFromAcceptLanguage("kk-KZ,ru;q=0.8")).toBe("kk");
    expect(getLanguageFromAcceptLanguage("fr-FR")).toBe("en");
  });

  it("provides locale identifiers for number, date and metadata formatting", () => {
    expect(getLanguageLocale("en")).toBe("en-US");
    expect(getLanguageLocale("ru")).toBe("ru-RU");
    expect(getLanguageLocale("kk")).toBe("kk-KZ");
  });
});
