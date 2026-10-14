// Shared by the SPA and scripts/prerender.js, which loads it with Node type stripping:
// keep this file free of imports and non-erasable TypeScript (enums, namespaces).

export const SITE_URL = "https://devocrazia.com";
export const SITE_NAME = "Devocrazia";
export const DEFAULT_OG_IMAGE = "/images/og-image.png";

/**
 * Absolute production URL for a site path, for canonical, og:url and the sitemap.
 * Cloudflare Pages serves each prerendered page at its trailing-slash URL and
 * 308-redirects the bare one, so the trailing slash avoids pointing at a redirect.
 * It is always the production host, so preview deployments never compete with it in search.
 */
export function canonicalUrl(path: string): string {
  return `${SITE_URL}${path.endsWith("/") ? path : `${path}/`}`;
}

/** Social crawlers don't render SVG, so previews use the PNG export of the hero image. */
export function socialImage(heroImage?: string): string {
  return heroImage ? heroImage.replace(/\.svg$/i, ".png") : DEFAULT_OG_IMAGE;
}
