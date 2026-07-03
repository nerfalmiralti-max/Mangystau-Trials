export const SITE_NAME = "MangystauTrails";

export const DEFAULT_DESCRIPTION =
  "MangystauTrails combines digital routes, destination guides, ratings, reviews and an interactive travel assistant for journeys across Kazakhstan.";

export const SITE_URL = getSiteUrl();

function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "https://mangystautrails.vercel.app";
}
