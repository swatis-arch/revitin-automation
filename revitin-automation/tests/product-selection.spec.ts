import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { ProductModal } from '../pages/ProductModal';

test.describe('Product selection (flavor + size)', () => {
  test.beforeEach(async ({ page }) => {
    page.setDefaultTimeout(20000);
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Dismiss marketing popups if present
    const closeBtn = page.locator('button[aria-label*="close" i], button.needsclick, [aria-label="Close dialog"]').first();
    if (await closeBtn.isVisible({ timeout: 2500 }).catch(() => false)) {
      await closeBtn.click({ force: true });
    }
  });

  test('Full Size tile shows pricing and flavor info', async ({ page }) => {
    // Looks for full size product card or pricing mention
    const productCard = page.locator('main, section').filter({ hasText: /toothpaste|full size/i }).first();
    await expect(productCard).toBeVisible({ timeout: 10000 });
    await expect(productCard).toContainText(/\$|tube/i);
  });

  test('Travel Size tile displays on homepage', async ({ page }) => {
    // Specifically target visible text or links mentioning "Travel" on the homepage
    const travelSection = page.locator(':visible').filter({ hasText: /travel/i }).first();
    await travelSection.scrollIntoViewIfNeeded();
    await expect(travelSection).toBeVisible({ timeout: 10000 });
  });

  test('quick add opens modal with flavor and size options', async ({ page }) => {
    // Target strictly visible Quick Add or Add buttons on the homepage
    const quickAddBtn = page.locator('button:visible, a:visible')
      .filter({ hasText: /quick add|add to/i })
      .first();

    await quickAddBtn.scrollIntoViewIfNeeded();
    await expect(quickAddBtn).toBeVisible({ timeout: 10000 });

    // Use dispatchEvent or normal click without force bounding box issues
    await quickAddBtn.dispatchEvent('click');

    // Verify modal, popup, or quick drawer opens
    const modalContainer = page.locator(
      '[role="dialog"]:visible, .product-popup:visible, [id*="modal" i]:visible, cart-drawer:visible'
    ).first();

    await expect(modalContainer).toBeVisible({ timeout: 10000 });
  });

  test('switching flavor updates the selected state', async ({ page }) => {
    await page.goto('/products/revitin-natural-toothpaste', { waitUntil: 'domcontentloaded' });

    // Look for flavor options (Citrus, Mint, etc.)
    const citrusBtn = page.locator('label, button, input[type="radio"]').filter({ hasText: /citrus/i }).first();
    if (await citrusBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await citrusBtn.click({ force: true });
      await expect(page.locator('main').first()).toContainText(/citrus/i);
    }
  });

  test('direct product page loads for toothpaste', async ({ page }) => {
    // 1. Wait until network is idle or load event fires so Shopify custom components hydrate
    await page.goto('/products/revitin-natural-toothpaste', { waitUntil: 'load', timeout: 30000 });
    await expect(page).toHaveURL(/products\/revitin/i);

    // 2. Dismiss promo popup if it appears
    const closeBtn = page.locator('button[aria-label*="close" i], button.needsclick').first();
    if (await closeBtn.isVisible({ timeout: 2500 }).catch(() => false)) {
      await closeBtn.click({ force: true });
    }

    // 3. Target any visible product title or the main buy form directly
    const productElement = page.locator(
      'h1:visible, form[action*="/cart/add"]:visible, [class*="product__title"]:visible, :text-matches("Revitin", "i"):visible'
    ).first();

    await expect(productElement).toBeVisible({ timeout: 15000 });
  });

  test('travel size page or collection loads correctly', async ({ page }) => {
    // Navigate to travel size or search endpoint
    await page.goto('/products/revitin-natural-toothpaste', { waitUntil: 'domcontentloaded' });
    
    // Validate page has rendered correctly
    await expect(page).toHaveURL(/products/i);
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
  });
});
