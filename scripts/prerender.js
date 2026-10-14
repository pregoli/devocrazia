/**
 * Pre-render script for Devocrazia
 *
 * Generates static HTML files for each article with correct meta tags
 * so social media crawlers can see article-specific previews, and
 * generates sitemap.xml.
 *
 * Article data comes from src/data/articles.ts (the single source of truth) and
 * URL helpers from src/lib/site.ts, both imported via Node's TypeScript type stripping.
 *
 * Run after build: node --experimental-strip-types scripts/prerender.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { articles } from '../src/data/articles.ts';
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE, canonicalUrl, socialImage } from '../src/lib/site.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../dist');
const publicDir = path.resolve(__dirname, '../public');

// Static pages to pre-render. Pages without a fixed lastmod use the newest article date.
const staticPages = [
  { path: '/', title: 'Devocrazia - Software Engineering & Architecture Blog', description: 'Insights on software architecture, .NET development, Domain-Driven Design, Event Sourcing, and cloud technologies by Paolo Regoli.', changefreq: 'weekly', priority: '1.0' },
  { path: '/about', title: 'About | Devocrazia', description: 'Learn about Paolo Regoli, the author behind Devocrazia.', lastmod: '2025-01-01', changefreq: 'monthly', priority: '0.8' },
  { path: '/articles', title: 'All Articles | Devocrazia', description: 'Browse all articles about software architecture, .NET development, and cloud technologies.', changefreq: 'weekly', priority: '0.9' },
  { path: '/contact', title: 'Contact | Devocrazia', description: 'Get in touch with Paolo Regoli.', lastmod: '2025-01-01', changefreq: 'monthly', priority: '0.5' },
  { path: '/privacy', title: 'Privacy Policy | Devocrazia', description: 'Privacy Policy for Devocrazia.', lastmod: '2025-01-01', changefreq: 'yearly', priority: '0.3' },
];

/** Fail the build early if an article references files that don't exist. */
function validateArticles() {
  const errors = [];
  const publicFileExists = (urlPath) => fs.existsSync(path.join(publicDir, urlPath));

  const duplicates = (values) => values.filter((value, i) => values.indexOf(value) !== i);
  for (const slug of duplicates(articles.map((a) => a.slug))) errors.push(`duplicate slug "${slug}"`);
  for (const id of duplicates(articles.map((a) => a.id))) errors.push(`duplicate id ${id}`);

  for (const article of articles) {
    const required = [
      [`/content/articles/${article.slug}.md`, 'article markdown'],
      [article.image, 'preview image'],
      [socialImage(article.heroImage), 'social preview PNG'],
    ];
    if (article.heroImage) required.push([article.heroImage, 'hero image']);

    for (const [urlPath, label] of required) {
      if (!publicFileExists(urlPath)) errors.push(`${article.slug}: ${label} not found at public${urlPath}`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Invalid article data in src/data/articles.ts:\n   - ${errors.join('\n   - ')}`);
  }
}

/** House style: articles never use em dashes. Checks every article markdown file (including Medium versions) and the metadata. */
function validateNoEmDashes() {
  const EM_DASH = '—';
  const errors = [];
  const contentDir = path.join(publicDir, 'content/articles');

  for (const file of fs.readdirSync(contentDir).filter((f) => f.endsWith('.md'))) {
    fs.readFileSync(path.join(contentDir, file), 'utf-8').split('\n').forEach((line, i) => {
      if (line.includes(EM_DASH)) errors.push(`public/content/articles/${file}:${i + 1}`);
    });
  }

  for (const article of articles) {
    for (const [field, value] of Object.entries(article)) {
      if (JSON.stringify(value).includes(EM_DASH)) errors.push(`src/data/articles.ts: "${article.slug}" ${field}`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Em dashes are not allowed in articles. Use a comma, colon, parentheses, or a new sentence instead:\n   - ${errors.join('\n   - ')}`);
  }
}

/** Escapes text for HTML attribute values and XML text, so a quote or ampersand in a title can't break the markup. */
function escapeMarkup(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateMetaTags(article) {
  const articleUrl = canonicalUrl(`/articles/${article.slug}`);
  const ogImageUrl = `${SITE_URL}${socialImage(article.heroImage)}`;
  const title = escapeMarkup(article.title);
  const description = escapeMarkup(article.description);
  const author = escapeMarkup(article.authorName);

  return `
    <!-- Primary Meta Tags -->
    <title>${title} | ${SITE_NAME}</title>
    <meta name="title" content="${title} | ${SITE_NAME}" />
    <meta name="description" content="${description}" />
    <meta name="author" content="${author}" />
    <meta name="keywords" content="${escapeMarkup(article.tags.join(', '))}" />

    <!-- Canonical URL -->
    <link rel="canonical" href="${articleUrl}" />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${articleUrl}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${ogImageUrl}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:locale" content="en_GB" />

    <!-- Article-specific OG tags -->
    <meta property="article:published_time" content="${article.date}" />
    <meta property="article:modified_time" content="${article.date}" />
    <meta property="article:author" content="${author}" />
    <meta property="article:section" content="${escapeMarkup(article.category)}" />
    ${article.tags.map(tag => `<meta property="article:tag" content="${escapeMarkup(tag)}" />`).join('\n    ')}

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${articleUrl}" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${ogImageUrl}" />
    <meta name="twitter:label1" content="Reading time" />
    <meta name="twitter:data1" content="${article.readTime} min read" />`;
}

function generateStaticMetaTags(page) {
  const pageUrl = canonicalUrl(page.path);
  const ogImageUrl = `${SITE_URL}${DEFAULT_OG_IMAGE}`;
  const title = escapeMarkup(page.title);
  const description = escapeMarkup(page.description);

  return `
    <!-- Primary Meta Tags -->
    <title>${title}</title>
    <meta name="title" content="${title}" />
    <meta name="description" content="${description}" />
    <meta name="author" content="Paolo Regoli" />

    <!-- Canonical URL -->
    <link rel="canonical" href="${pageUrl}" />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${pageUrl}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${ogImageUrl}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:locale" content="en_GB" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${pageUrl}" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${ogImageUrl}" />`;
}

function generateSitemap() {
  const newestArticleDate = articles.map((a) => a.date).sort().at(-1);

  const pageEntries = staticPages.map((page) => `  <url>
    <loc>${canonicalUrl(page.path)}</loc>
    <lastmod>${page.lastmod ?? newestArticleDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`);

  const articleEntries = articles.map((article) => {
    const image = article.heroImage ? `
    <image:image>
      <image:loc>${SITE_URL}${article.heroImage}</image:loc>
      <image:title>${escapeMarkup(article.title)}</image:title>
    </image:image>` : '';

    return `  <url>
    <loc>${canonicalUrl(`/articles/${article.slug}`)}</loc>
    <lastmod>${article.date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>${image}
  </url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">

  <!-- Main Pages -->
${pageEntries.join('\n  \n')}

  <!-- Articles -->
${articleEntries.join('\n  \n')}

</urlset>
`;
}

/** Replaces the default meta tags from index.html with page-specific ones. */
function injectMetaTags(baseHtml, metaTags) {
  return baseHtml
    .replace(/<title>.*?<\/title>/s, '')
    .replace(/<meta name="title"[^>]*>/g, '')
    .replace(/<meta name="description"[^>]*>/g, '')
    .replace(/<meta name="author"[^>]*>/g, '')
    .replace(/<meta name="keywords"[^>]*>/g, '')
    .replace(/<link rel="canonical"[^>]*>/g, '')
    .replace(/<meta property="og:[^>]*>/g, '')
    .replace(/<meta property="article:[^>]*>/g, '')
    .replace(/<meta name="twitter:[^>]*>/g, '')
    .replace('</head>', `${metaTags}\n  </head>`);
}

async function prerender() {
  console.log('🚀 Starting pre-render...\n');

  validateArticles();
  validateNoEmDashes();

  // Read the base HTML from dist
  const baseHtmlPath = path.join(distDir, 'index.html');

  if (!fs.existsSync(baseHtmlPath)) {
    throw new Error('dist/index.html not found. Run "npm run build" first.');
  }

  const baseHtml = fs.readFileSync(baseHtmlPath, 'utf-8');

  // Pre-render article pages
  console.log('📝 Pre-rendering articles...');
  for (const article of articles) {
    const articleDir = path.join(distDir, 'articles', article.slug);
    fs.mkdirSync(articleDir, { recursive: true });

    const html = injectMetaTags(baseHtml, generateMetaTags(article));
    fs.writeFileSync(path.join(articleDir, 'index.html'), html);

    console.log(`   ✓ /articles/${article.slug}`);
  }

  // Pre-render static pages
  console.log('\n📄 Pre-rendering static pages...');
  for (const page of staticPages) {
    const pagePath = page.path === '/'
      ? path.join(distDir, 'index.html')
      : path.join(distDir, page.path.slice(1), 'index.html');

    if (page.path !== '/') {
      fs.mkdirSync(path.dirname(pagePath), { recursive: true });
    }

    const html = injectMetaTags(baseHtml, generateStaticMetaTags(page));
    fs.writeFileSync(pagePath, html);

    console.log(`   ✓ ${page.path}`);
  }

  // Generate sitemap
  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), generateSitemap());
  console.log('\n🗺️  Generated sitemap.xml');

  console.log('\n✅ Pre-render complete!');
  console.log(`   Generated ${articles.length} article pages`);
  console.log(`   Generated ${staticPages.length} static pages`);
}

prerender().catch((error) => {
  console.error(`\n❌ ${error.message}`);
  process.exit(1);
});
