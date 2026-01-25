import { test, expect } from '@playwright/test';

test.describe('Contact Form', () => {
  test('form has all required fields', async ({ page }) => {
    await page.goto('/contact');
    
    await expect(page.locator('#name')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#subject')).toBeVisible();
    await expect(page.locator('#message')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('form has Web3Forms configuration', async ({ page }) => {
    await page.goto('/contact');
    
    // Check form action
    const form = page.locator('form');
    await expect(form).toHaveAttribute('action', 'https://api.web3forms.com/submit');
    
    // Check access key is present
    await expect(page.locator('input[name="access_key"]')).toBeAttached();
  });

  test('form has correct redirect configured', async ({ page }) => {
    await page.goto('/contact');
    
    // Check redirect hidden field points to thank-you
    const redirectInput = page.locator('input[name="redirect"]');
    await expect(redirectInput).toBeAttached();
    const redirectValue = await redirectInput.getAttribute('value');
    expect(redirectValue).toContain('/thank-you');
  });

  test('form validation prevents empty submission', async ({ page }) => {
    await page.goto('/contact');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Should still be on contact page (HTML5 validation prevents submission)
    await expect(page).toHaveURL(/\/contact/);
  });

  test('form fields accept input', async ({ page }) => {
    await page.goto('/contact');
    
    await page.fill('#name', 'Test User');
    await page.fill('#email', 'test@example.com');
    await page.fill('#subject', 'Test Subject');
    await page.fill('#message', 'This is a test message.');
    
    // Verify values are set
    await expect(page.locator('#name')).toHaveValue('Test User');
    await expect(page.locator('#email')).toHaveValue('test@example.com');
  });
});

test.describe('Thank You Page', () => {
  test('thank-you page loads', async ({ page }) => {
    await page.goto('/thank-you');
    await expect(page).toHaveTitle(/Message Sent|Thank/i);
  });

  test('thank-you page has back to home link', async ({ page }) => {
    await page.goto('/thank-you');
    await expect(page.locator('a:has-text("Back to Home")').first()).toBeVisible();
  });
});
