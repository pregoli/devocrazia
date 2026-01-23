/**
 * Pre-render script for Devocrazia
 * 
 * Generates static HTML files for each article with correct meta tags
 * so social media crawlers can see article-specific previews.
 * 
 * Run after build: node scripts/prerender.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../dist');

// Site configuration
const SITE_URL = 'https://devocrazia.com';
const SITE_NAME = 'Devocrazia';

// Articles data (mirrored from src/data/articles.ts)
const articles = [
  {
    slug: "sse-order-processing-real-time-dotnet",
    category: "API",
    title: "Server-Sent Events in .NET 10: Real-Time Order Processing with Clean Architecture",
    description: "Build production-ready SSE streaming with Clean Architecture and DDD. Learn TypedResults.ServerSentEvents, bounded channels for backpressure, and automatic reconnection with Last-Event-ID replay.",
    authorName: "Paolo Regoli",
    date: "2026-01-17",
    heroImage: "/images/sse-order-processing-hero.png",
    tags: [".NET 10", "SSE", "Clean Architecture", "DDD"],
    readTime: 12,
  },
  {
    slug: "rich-domain-modelling-escape-anaemic-models",
    category: "Patterns",
    title: "Rich Domain Modelling: Escaping the Anaemic Model Trap",
    description: "Learn how to build domain models that combine data and behaviour, enforce invariants, and make invalid states unrepresentable. Covers value objects, entities, aggregates, and the specification pattern.",
    authorName: "Paolo Regoli",
    date: "2025-12-25",
    heroImage: "/images/rich-domain-model-hero.png",
    tags: ["C#", "DDD", "Clean Code", "OOP"],
    readTime: 12,
  },
  {
    slug: "mastering-saga-pattern-distributed-transactions-dotnet",
    category: "Patterns",
    title: "Mastering the Saga Pattern for Distributed Transactions in .NET 10",
    description: "A comprehensive guide to implementing the Saga Pattern with MassTransit, RabbitMQ, and SQL Server. Learn orchestration, automatic compensation, and the Outbox pattern for reliable distributed workflows.",
    authorName: "Paolo Regoli",
    date: "2025-12-23",
    heroImage: "/images/saga-pattern-hero.png",
    tags: [".NET", "Saga Pattern", "MassTransit", "Microservices"],
    readTime: 12,
  },
  {
    slug: "building-bank-atm-event-sourcing-cqrs-dotnet",
    category: "Patterns",
    title: "Building a Bank ATM System with Event Sourcing and CQRS in .NET 9",
    description: "A deep dive into implementing Event Sourcing, CQRS, and Domain-Driven Design for a production-ready banking system. Covers aggregates, projections, snapshotting, and multiple query strategies.",
    authorName: "Paolo Regoli",
    date: "2025-07-20",
    heroImage: "/images/event-sourcing-cqrs-hero.png",
    tags: [".NET", "Event Sourcing", "CQRS", "DDD"],
    readTime: 15,
  },
  {
    slug: "optimising-llm-inputs-json-vs-toon-explained",
    category: "AI",
    title: "Optimizing LLM Inputs: JSON vs TOON Explained",
    description: "Learn how TOON offers a more token-efficient alternative to JSON when sending structured data to LLMs. This article breaks down real-world use cases, conversion methods, and best practices for optimizing AI workflows.",
    authorName: "Paolo Regoli",
    date: "2025-11-15",
    heroImage: "/images/json-vs-toon-hero.png",
    tags: ["AI", "Optimization"],
    readTime: 7,
  },
];

// Static pages to pre-render
const staticPages = [
  { path: '/', title: 'Devocrazia - Software Engineering & Architecture Blog', description: 'Insights on software architecture, .NET development, Domain-Driven Design, Event Sourcing, and cloud technologies by Paolo Regoli.' },
  { path: '/articles', title: 'All Articles | Devocrazia', description: 'Browse all articles about software architecture, .NET development, and cloud technologies.' },
  { path: '/about', title: 'About | Devocrazia', description: 'Learn about Paolo Regoli, the author behind Devocrazia.' },
  { path: '/contact', title: 'Contact | Devocrazia', description: 'Get in touch with Paolo Regoli.' },
  { path: '/privacy', title: 'Privacy Policy | Devocrazia', description: 'Privacy Policy for Devocrazia.' },
];

function generateMetaTags(article) {
  const articleUrl = `${SITE_URL}/articles/${article.slug}`;
  const ogImageUrl = `${SITE_URL}${article.heroImage}`;
  
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
  const ogImageUrl = `${SITE_URL}/images/og-image.png`;
  
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
  
  // Read the base HTML from dist
  const baseHtmlPath = path.join(distDir, 'index.html');
  
  if (!fs.existsSync(baseHtmlPath)) {
    console.error('❌ dist/index.html not found. Run "npm run build" first.');
    process.exit(1);
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
  
  console.log('\n✅ Pre-render complete!');
  console.log(`   Generated ${articles.length} article pages`);
  console.log(`   Generated ${staticPages.length} static pages`);
}

prerender().catch(console.error);
