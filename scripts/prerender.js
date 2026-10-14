/**
 * Pre-render script for Devocrazia
 *
 * Generates static HTML files for each article with correct meta tags
 * so social media crawlers can see article-specific previews, and
 * generates sitemap.xml.
 *
 * Article data comes from src/data/articles.ts (the single source of truth),
 * imported via Node's TypeScript type stripping.
 *
 * Run after build: node --experimental-strip-types scripts/prerender.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { articles } from '../src/data/articles.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../dist');
const publicDir = path.resolve(__dirname, '../public');

// Site configuration
const SITE_URL = 'https://devocrazia.com';
const SITE_NAME = 'Devocrazia';
const DEFAULT_OG_IMAGE = '/images/og-image.png';

// Static pages to pre-render. Pages without a fixed lastmod use the newest article date.
const staticPages = [
  { path: '/', title: 'Devocrazia - Software Engineering & Architecture Blog', description: 'Insights on software architecture, .NET development, Domain-Driven Design, Event Sourcing, and cloud technologies by Paolo Regoli.', changefreq: 'weekly', priority: '1.0' },
  { path: '/about', title: 'About | Devocrazia', description: 'Learn about Paolo Regoli, the author behind Devocrazia.', lastmod: '2025-01-01', changefreq: 'monthly', priority: '0.8' },
  { path: '/articles', title: 'All Articles | Devocrazia', description: 'Browse all articles about software architecture, .NET development, and cloud technologies.', changefreq: 'weekly', priority: '0.9' },
  { path: '/contact', title: 'Contact | Devocrazia', description: 'Get in touch with Paolo Regoli.', lastmod: '2025-01-01', changefreq: 'monthly', priority: '0.5' },
  { path: '/privacy', title: 'Privacy Policy | Devocrazia', description: 'Privacy Policy for Devocrazia.', lastmod: '2025-01-01', changefreq: 'yearly', priority: '0.3' },
];

/** Social crawlers don't render SVG, so previews use the PNG export of the hero image. */
function socialImage(article) {
  return article.heroImage ? article.heroImage.replace(/\.svg$/i, '.png') : DEFAULT_OG_IMAGE;
}

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
      [socialImage(article), 'social preview PNG'],
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

function generateMetaTags(article) {
  const articleUrl = `${SITE_URL}/articles/${article.slug}`;
  const ogImageUrl = `${SITE_URL}${socialImage(article)}`;

  return `
    <!-- Primary Meta Tags -->
    <title>${article.title} | ${SITE_NAME}</title>
    <meta name="title" content="${article.title} | ${SITE_NAME}" />
    <meta name="description" content="${article.description}" />
    <meta name="author" content="${article.authorName}" />
    <meta name="keywords" content="${article.tags.join(', ')}" />

    <!-- Canonical URL -->
    <link rel="canonical" href="${articleUrl}" />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${articleUrl}" />
    <meta property="og:title" content="${article.title}" />
    <meta property="og:description" content="${article.description}" />
    <meta property="og:image" content="${ogImageUrl}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:locale" content="en_GB" />

    <!-- Article-specific OG tags -->
    <meta property="article:published_time" content="${article.date}" />
    <meta property="article:modified_time" content="${article.date}" />
    <meta property="article:author" content="${article.authorName}" />
    <meta property="article:section" content="${article.category}" />
    ${article.tags.map(tag => `<meta property="article:tag" content="${tag}" />`).join('\n    ')}

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${articleUrl}" />
    <meta name="twitter:title" content="${article.title}" />
    <meta name="twitter:description" content="${article.description}" />
    <meta name="twitter:image" content="${ogImageUrl}" />
    <meta name="twitter:label1" content="Reading time" />
    <meta name="twitter:data1" content="${article.readTime} min read" />`;
}

function generateStaticMetaTags(page) {
  const pageUrl = `${SITE_URL}${page.path}`;
  const ogImageUrl = `${SITE_URL}${DEFAULT_OG_IMAGE}`;

  return `
    <!-- Primary Meta Tags -->
    <title>${page.title}</title>
    <meta name="title" content="${page.title}" />
    <meta name="description" content="${page.description}" />
    <meta name="author" content="Paolo Regoli" />

    <!-- Canonical URL -->
    <link rel="canonical" href="${pageUrl}" />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${pageUrl}" />
    <meta property="og:title" content="${page.title}" />
    <meta property="og:description" content="${page.description}" />
    <meta property="og:image" content="${ogImageUrl}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:locale" content="en_GB" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${pageUrl}" />
    <meta name="twitter:title" content="${page.title}" />
    <meta name="twitter:description" content="${page.description}" />
    <meta name="twitter:image" content="${ogImageUrl}" />`;
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateSitemap() {
  const newestArticleDate = articles.map((a) => a.date).sort().at(-1);

  const pageEntries = staticPages.map((page) => `  <url>
    <loc>${SITE_URL}${page.path}</loc>
    <lastmod>${page.lastmod ?? newestArticleDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`);

  const articleEntries = articles.map((article) => {
    const image = article.heroImage ? `
    <image:image>
      <image:loc>${SITE_URL}${article.heroImage}</image:loc>
      <image:title>${escapeXml(article.title)}</image:title>
    </image:image>` : '';

    return `  <url>
    <loc>${SITE_URL}/articles/${article.slug}</loc>
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

function createHtmlForArticle(baseHtml, article) {
  const metaTags = generateMetaTags(article);

  // Replace the meta tags section in the base HTML
  // Find the closing </head> and insert our meta tags before it
  // Also remove any existing meta tags that we're replacing

  let html = baseHtml;

  // Remove existing primary meta tags (we'll replace them)
  html = html.replace(/<title>.*?<\/title>/s, '');
  html = html.replace(/<meta name="title"[^>]*>/g, '');
  html = html.replace(/<meta name="description"[^>]*>/g, '');
  html = html.replace(/<meta name="author"[^>]*>/g, '');
  html = html.replace(/<meta name="keywords"[^>]*>/g, '');
  html = html.replace(/<link rel="canonical"[^>]*>/g, '');
  html = html.replace(/<meta property="og:[^>]*>/g, '');
  html = html.replace(/<meta property="article:[^>]*>/g, '');
  html = html.replace(/<meta name="twitter:[^>]*>/g, '');

  // Insert new meta tags before </head>
  html = html.replace('</head>', `${metaTags}\n  </head>`);

  return html;
}

function createHtmlForStaticPage(baseHtml, page) {
  const metaTags = generateStaticMetaTags(page);

  let html = baseHtml;

  // Remove existing primary meta tags
  html = html.replace(/<title>.*?<\/title>/s, '');
  html = html.replace(/<meta name="title"[^>]*>/g, '');
  html = html.replace(/<meta name="description"[^>]*>/g, '');
  html = html.replace(/<meta name="author"[^>]*>/g, '');
  html = html.replace(/<meta name="keywords"[^>]*>/g, '');
  html = html.replace(/<link rel="canonical"[^>]*>/g, '');
  html = html.replace(/<meta property="og:[^>]*>/g, '');
  html = html.replace(/<meta property="article:[^>]*>/g, '');
  html = html.replace(/<meta name="twitter:[^>]*>/g, '');

  // Insert new meta tags before </head>
  html = html.replace('</head>', `${metaTags}\n  </head>`);

  return html;
}

async function prerender() {
  console.log('🚀 Starting pre-render...\n');

  validateArticles();

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

    const html = createHtmlForArticle(baseHtml, article);
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

    const html = createHtmlForStaticPage(baseHtml, page);
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
