// Shared by the SPA and scripts/prerender.js, which loads it with Node type stripping:
// keep this file free of imports and non-erasable TypeScript (enums, namespaces).

export const SITE_URL = "https://devocrazia.com";
export const SITE_NAME = "Devocrazia";
export const DEFAULT_OG_IMAGE = "/images/og-image.png";
const AUTHOR = "Paolo Regoli";

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

/** A head tag as plain data, so prerender.js can render it to HTML and Layout can render it with Helmet. */
export interface HeadTag {
  tag: "meta" | "link";
  attrs: Record<string, string>;
}

export interface PageMeta {
  title: string;
  tags: HeadTag[];
}

export interface StaticPage {
  path: string;
  title: string;
  description: string;
  /** Sitemap fields. Pages without a fixed lastmod use the newest article date. */
  lastmod?: string;
  changefreq: string;
  priority: string;
}

/** The prerendered static pages: their SEO metadata (for the SPA and the prerendered HTML) and sitemap entries. */
export const staticPages: StaticPage[] = [
  { path: "/", title: "Devocrazia - Software Engineering & Architecture Blog", description: "Insights on software architecture, .NET development, Domain-Driven Design, Event Sourcing, and cloud technologies by Paolo Regoli.", changefreq: "weekly", priority: "1.0" },
  { path: "/about", title: "About | Devocrazia", description: "Learn about Paolo Regoli - Software Engineer with almost twenty years of experience building software across Europe and Australia.", lastmod: "2025-01-01", changefreq: "monthly", priority: "0.8" },
  { path: "/articles", title: "Articles | Devocrazia", description: "Browse all articles about software engineering, architecture, and cloud technologies.", changefreq: "weekly", priority: "0.9" },
  { path: "/contact", title: "Contact | Devocrazia", description: "Get in touch with me. Have a question, project proposal, or just want to say hi? I'd love to hear from you.", lastmod: "2025-01-01", changefreq: "monthly", priority: "0.5" },
  { path: "/privacy", title: "Privacy Policy | Devocrazia", description: "Privacy Policy for Devocrazia - how we handle your data and protect your privacy.", lastmod: "2025-01-01", changefreq: "yearly", priority: "0.3" },
];

const meta = (key: "name" | "property", value: string, content: string): HeadTag => ({ tag: "meta", attrs: { [key]: value, content } });

function sharedTags(title: string, description: string, url: string, imageUrl: string, type: string): HeadTag[] {
  return [
    meta("name", "title", title),
    meta("name", "description", description),
    { tag: "link", attrs: { rel: "canonical", href: url } },
    meta("property", "og:type", type),
    meta("property", "og:url", url),
    meta("property", "og:image", imageUrl),
    meta("property", "og:image:width", "1200"),
    meta("property", "og:image:height", "630"),
    meta("property", "og:site_name", SITE_NAME),
    meta("property", "og:locale", "en_GB"),
    meta("name", "twitter:card", "summary_large_image"),
    meta("name", "twitter:url", url),
    meta("name", "twitter:image", imageUrl),
    meta("name", "twitter:description", description),
  ];
}

export function staticPageMeta(path: string): PageMeta {
  const page = staticPages.find((p) => p.path === path);
  if (!page) throw new Error(`No static page metadata for "${path}"`);
  return {
    title: page.title,
    tags: [
      ...sharedTags(page.title, page.description, canonicalUrl(page.path), `${SITE_URL}${DEFAULT_OG_IMAGE}`, "website"),
      meta("name", "author", AUTHOR),
      meta("property", "og:title", page.title),
      meta("property", "og:description", page.description),
      meta("name", "twitter:title", page.title),
    ],
  };
}

/** The Article fields the head tags need (a structural subset of `Article` in src/data/articles.ts). */
export interface ArticleSeo {
  slug: string;
  title: string;
  description: string;
  authorName: string;
  date: string;
  category: string;
  tags: string[];
  readTime: number;
  heroImage?: string;
}

export function articlePageMeta(article: ArticleSeo): PageMeta {
  const title = `${article.title} | ${SITE_NAME}`;
  return {
    title,
    tags: [
      ...sharedTags(title, article.description, canonicalUrl(`/articles/${article.slug}`), `${SITE_URL}${socialImage(article.heroImage)}`, "article"),
      meta("name", "author", article.authorName),
      meta("name", "keywords", article.tags.join(", ")),
      meta("property", "og:title", article.title),
      meta("property", "og:description", article.description),
      meta("property", "article:published_time", article.date),
      meta("property", "article:modified_time", article.date),
      meta("property", "article:author", article.authorName),
      meta("property", "article:section", article.category),
      ...article.tags.map((tag) => meta("property", "article:tag", tag)),
      meta("name", "twitter:title", article.title),
      meta("name", "twitter:label1", "Reading time"),
      meta("name", "twitter:data1", `${article.readTime} min read`),
    ],
  };
}

/** Pages that aren't prerendered and shouldn't be indexed (404, thank-you): no canonical, and noindex. */
export function noindexPageMeta(title: string, description: string): PageMeta {
  return {
    title: `${title} | ${SITE_NAME}`,
    tags: [meta("name", "description", description), meta("name", "robots", "noindex")],
  };
}
