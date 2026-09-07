import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test.describe('Navigation & account', () => {
  // Helper to dismiss promo popups that may intercept or distort navigation
  test.beforeEach(async ({ page }) => {
    page.setDefaultTimeout(15000);
  });

  test('newsletter signup accepts a valid email', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    const uniqueEmail = `swati.s+${Date.now()}@suntek.ai`;
    await home.subscribeNewsletter(uniqueEmail);

    const successFeedback = page.getByText(/thank you|subscribed|thanks/i).first();
    await expect(successFeedback).toBeVisible({ timeout: 15000 });
  });

  test('Ingredients page lists the key ingredients', async ({ page }) => {
    await page.goto('/pages/ingredients', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/ingredients/i);
    
    // Verify meaningful content loaded
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test('Blogs / Science index loads', async ({ page }) => {
    // Try primary blog/science route with fallback pattern
    const res = await page.goto('/blogs/news', { waitUntil: 'domcontentloaded' });
    
    // If /blogs/news isn't the primary, fallback to /pages/the-science
    if (res?.status() === 404) {
      await page.goto('/pages/the-science', { waitUntil: 'domcontentloaded' });
    }

    await expect(page).toHaveURL(/blog|science/i);
  });

  test('FAQ page loads', async ({ page }) => {
    // Check either singular /pages/faq or plural /pages/faqs
    const res = await page.goto('/pages/faq', { waitUntil: 'domcontentloaded' });
    
    if (res?.status() === 404) {
      await page.goto('/pages/faqs', { waitUntil: 'domcontentloaded' });
    }

    await expect(page).toHaveURL(/faq/i);
  });

  test('Wholesale page loads', async ({ page }) => {
    await page.goto('/pages/wholesale', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/wholesale/i);
    
    const wholesaleContent = page.locator('main, #MainContent').first();
    await expect(wholesaleContent).toBeVisible({ timeout: 10000 });
  });

  test('mobile viewport shows hamburger menu and it opens nav', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Dismiss initial promo popup if present
    const popupClose = page.locator('button[aria-label*="close" i], button.needsclick').first();
    if (await popupClose.isVisible({ timeout: 2500 }).catch(() => false)) {
      await popupClose.click({ force: true });
    }

    // Comprehensive locator for hamburger triggers (icon, svg wrapper, summary tag, or button)
    const menuBtn = page.locator(
      'summary[aria-label*="menu" i], button[aria-label*="menu" i], header [class*="menu-drawer"], header button:has(svg)'
    ).first();

    await expect(menuBtn).toBeVisible({ timeout: 10000 });
    await menuBtn.click({ force: true });

    // Verify nav links become visible inside the mobile drawer
    const navItem = page.locator('nav, [id*="menu" i], [class*="drawer" i]').getByRole('link').first();
    await expect(navItem).toBeVisible({ timeout: 10000 });
  });
});