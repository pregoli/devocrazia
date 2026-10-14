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
  // The prerendered HTML and the SPA's Helmet both write these tags, so every copy must agree.
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

    expect(canonicals.length).toBeGreaterThan(0);
    expect(new Set(canonicals)).toEqual(new Set([expectedUrl]));
    expect(new Set(ogUrls)).toEqual(new Set([expectedUrl]));
    for (const image of ogImages) expect(image).toMatch(/^https:\/\/devocrazia\.com\/.+\.png$/);
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
