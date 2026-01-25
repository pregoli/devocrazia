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
