import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('homepage loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Devocrazia/);
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('articles page loads', async ({ page }) => {
    await page.goto('/articles');
    await expect(page).toHaveTitle(/Articles/);
    await expect(page.locator('h1')).toContainText('Articles');
  });

  test('about page loads', async ({ page }) => {
    await page.goto('/about');
    await expect(page).toHaveTitle(/About/);
  });

  test('contact page loads', async ({ page }) => {
    await page.goto('/contact');
    await expect(page).toHaveTitle(/Contact/);
    await expect(page.locator('form')).toBeVisible();
  });

  test('privacy page loads', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page).toHaveTitle(/Privacy/);
  });

  test('navigation links work', async ({ page }) => {
    await page.goto('/');
    
    // Click Articles link
    await page.click('nav >> text=Articles');
    await expect(page).toHaveURL(/\/articles/);
    
    // Click About link
    await page.click('nav >> text=About');
    await expect(page).toHaveURL(/\/about/);
    
    // Click Contact link
    await page.click('nav >> text=Contact');
    await expect(page).toHaveURL(/\/contact/);
    
    // Click Home link
    await page.click('nav >> text=Home');
    await expect(page).toHaveURL('/');
  });
});

test.describe('Articles', () => {
  const articles = [
    'sse-order-processing-real-time-dotnet',
    'rich-domain-modelling-escape-anaemic-models',
    'mastering-saga-pattern-distributed-transactions-dotnet',
    'building-bank-atm-event-sourcing-cqrs-dotnet',
    'optimising-llm-inputs-json-vs-toon-explained',
  ];

  for (const slug of articles) {
    test(`article page loads: ${slug}`, async ({ page }) => {
      await page.goto(`/articles/${slug}`);
      
      // Should not redirect to error or homepage
      await expect(page).toHaveURL(`/articles/${slug}`);
      
      // Article title should be visible (use first h1 in header)
      await expect(page.locator('header h1').first()).toBeVisible();
      
      // Back button should exist
      await expect(page.locator('text=Back to Articles')).toBeVisible();
    });
  }

  test('article page has share button', async ({ page }) => {
    await page.goto('/articles/sse-order-processing-real-time-dotnet');
    await expect(page.locator('button:has-text("Share")')).toBeVisible();
  });

  test('share dropdown opens', async ({ page }) => {
    await page.goto('/articles/sse-order-processing-real-time-dotnet');
    await page.click('button:has-text("Share")');
    await expect(page.locator('text=LinkedIn')).toBeVisible();
    await expect(page.locator('text=Copy link')).toBeVisible();
  });
});

test.describe('SEO tags', () => {
  // The prerendered HTML carries the tags for crawlers that don't run JavaScript; once the SPA loads,
  // Helmet replaces them, so a page must never end up with two canonicals or a stale one.
  // Cloudflare 308-redirects bare paths to the trailing-slash URL, so canonical URLs end in a slash.
  // The tests request the trailing-slash URL because `vite preview` serves bare paths from the SPA
  // fallback (the homepage HTML) instead of redirecting like production does.
  test('article canonical and og tags are absolute and consistent', async ({ page }) => {
    const slug = 'sse-order-processing-real-time-dotnet';
    await page.goto(`/articles/${slug}/`);
    await expect(page.locator('header h1').first()).toBeVisible();

    const expectedUrl = `https://devocrazia.com/articles/${slug}/`;
    const canonicals = await page.locator('link[rel="canonical"]').evaluateAll(els => els.map(e => e.getAttribute('href')));
    const ogUrls = await page.locator('meta[property="og:url"]').evaluateAll(els => els.map(e => e.getAttribute('content')));
    const ogImages = await page.locator('meta[property="og:image"]').evaluateAll(els => els.map(e => e.getAttribute('content')));

    expect(canonicals).toEqual([expectedUrl]);
    expect(ogUrls).toEqual([expectedUrl]);
    expect(ogImages).toHaveLength(1);
    expect(ogImages[0]).toMatch(/^https:\/\/devocrazia\.com\/.+\.png$/);
    await expect(page).toHaveTitle(/Server-Sent Events|SSE/);
    await expect(page).not.toHaveTitle(/^Devocrazia$/);
  });

  test('client-side navigation updates the canonical instead of adding one', async ({ page }) => {
    const canonical = page.locator('link[rel="canonical"]');
    await page.goto('/');
    await expect(canonical).toHaveAttribute('href', 'https://devocrazia.com/');

    const articleLink = page.locator('main a[href^="/articles/"]').first();
    const href = await articleLink.getAttribute('href');
    await articleLink.click();
    await expect(page.locator('header h1').first()).toBeVisible();
    await expect(canonical).toHaveCount(1);
    await expect(canonical).toHaveAttribute('href', `https://devocrazia.com${href}/`);
    await expect(page.locator('meta[property="og:url"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');

    await page.click('nav >> text=About');
    await expect(page).toHaveTitle('About | Devocrazia');
    await expect(canonical).toHaveCount(1);
    await expect(canonical).toHaveAttribute('href', 'https://devocrazia.com/about/');
    await expect(page.locator('meta[property^="article:"]')).toHaveCount(0);
  });

  test('404 page is noindex and has no canonical', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  });

  test('static page canonical ends with a slash', async ({ page }) => {
    await page.goto('/about/');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://devocrazia.com/about/');
  });

  test('sitemap URLs end with a slash', async ({ request }) => {
    const sitemap = await (await request.get('/sitemap.xml')).text();
    const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
    expect(locs.length).toBeGreaterThan(0);
    for (const loc of locs) expect(loc).toMatch(/^https:\/\/devocrazia\.com\/(.*\/)?$/);
  });
});

test.describe('No Redirect Loops', () => {
  test('direct article URL works', async ({ page }) => {
    const response = await page.goto('/articles/sse-order-processing-real-time-dotnet');
    expect(response?.status()).toBe(200);
  });

  test('about page no redirect loop', async ({ page }) => {
    const response = await page.goto('/about');
    expect(response?.status()).toBe(200);
  });

  test('trailing slash handled', async ({ page }) => {
    const response = await page.goto('/about/');
    expect(response?.status()).toBe(200);
    // Should still show about content
    await expect(page).toHaveTitle(/About/);
  });
});
