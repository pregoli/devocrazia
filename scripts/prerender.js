/**
 * Pre-render script for Devocrazia
 *
 * Generates static HTML files for each article with correct meta tags
 * so social media crawlers can see article-specific previews, and
 * generates sitemap.xml.
 *
 * Article data comes from src/data/articles.ts (the single source of truth) and the
 * head tags and static pages from src/lib/site.ts (shared with the SPA's Layout), both
 * imported via Node's TypeScript type stripping.
 *
 * Run after build: node --experimental-strip-types scripts/prerender.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { articles } from '../src/data/articles.ts';
import { SITE_URL, canonicalUrl, socialImage, staticPages, staticPageMeta, articlePageMeta } from '../src/lib/site.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../dist');
const publicDir = path.resolve(__dirname, '../public');

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

/**
 * Renders a page's shared head tags (src/lib/site.ts) to HTML. Each tag carries Helmet's
 * data-react-helmet marker, so once the SPA loads, Helmet owns and replaces these tags
 * (on the first render and on every navigation) instead of adding duplicates next to them.
 */
function renderHead({ title, tags }) {
  const attrs = (values) => Object.entries(values).map(([key, value]) => `${key}="${escapeMarkup(value)}"`).join(' ');
  return [
    `<title>${escapeMarkup(title)}</title>`,
    ...tags.map(({ tag, attrs: values }) => `<${tag} ${attrs(values)} data-react-helmet="true" />`),
  ].map((line) => `\n    ${line}`).join('');
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
    // A callback, so `$&` and other replacement patterns in the metadata are inserted literally.
    .replace('</head>', () => `${metaTags}\n  </head>`);
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

    const html = injectMetaTags(baseHtml, renderHead(articlePageMeta(article)));
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

    const html = injectMetaTags(baseHtml, renderHead(staticPageMeta(page.path)));
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
