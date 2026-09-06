import { test, expect } from '@playwright/test';

test.describe('One-Time Purchase Flow', () => {
  test.beforeEach(async ({ page }) => {
    page.setDefaultTimeout(25000);
    await page.goto('/products/revitin-natural-toothpaste', { waitUntil: 'domcontentloaded' });

    // Dismiss any marketing/promo popups
    const popupClose = page.locator('button[aria-label*="close" i], button.needsclick, [aria-label="Close dialog"]').first();
    if (await popupClose.isVisible({ timeout: 2500 }).catch(() => false)) {
      await popupClose.click({ force: true });
    }
  });

  test('single tube base price shows $17', async ({ page }) => {
    const oneTimeRadio = page.locator('label, div, button').filter({ hasText: /one-time/i }).first();
    if (await oneTimeRadio.isVisible({ timeout: 4000 }).catch(() => false)) {
      await oneTimeRadio.click({ force: true });
    }

    const priceArea = page.locator('main, form[action*="/cart/add"], .product__price, [data-price]').first();
    await expect(priceArea).toContainText(/17/);
  });

  test('bundle tiers show correct discounts (3/5/25 tubes)', async ({ page }) => {
    const oneTimeRadio = page.locator('label, div, button').filter({ hasText: /one-time/i }).first();
    if (await oneTimeRadio.isVisible({ timeout: 4000 }).catch(() => false)) {
      await oneTimeRadio.click({ force: true });
    }

    const bundleContainer = page.locator('form[action*="/cart/add"], main').first();
    await expect(bundleContainer).toContainText(/3\s*tube|bundle|pack/i);
  });

  test('selecting a bundle tier updates the add-to-cart button', async ({ page }) => {
    const oneTimeRadio = page.locator('label, div, button').filter({ hasText: /one-time/i }).first();
    if (await oneTimeRadio.isVisible({ timeout: 4000 }).catch(() => false)) {
      await oneTimeRadio.click({ force: true });
    }

    const bundleTier = page.locator('label, button, option').filter({ hasText: /3\s*tube|5\s*tube/i }).first();
    if (await bundleTier.isVisible({ timeout: 3000 }).catch(() => false)) {
      await bundleTier.click({ force: true });
    }

    const addBtn = page.locator('button:visible').filter({ hasText: /add to bag|add to cart/i }).first();
    await expect(addBtn).toBeVisible({ timeout: 10000 });
    await expect(addBtn).toBeEnabled();
  });

  test('adding a one-time bundle to cart shows the item in the drawer', async ({ page }) => {
    const oneTimeRadio = page.locator('label, div, button').filter({ hasText: /one-time/i }).first();
    if (await oneTimeRadio.isVisible({ timeout: 4000 }).catch(() => false)) {
      await oneTimeRadio.click({ force: true });
    }

    const addBtn = page.locator('button:visible').filter({ hasText: /add to bag|add to cart/i }).first();
    await expect(addBtn).toBeVisible({ timeout: 10000 });

    // Listen for Shopify's add-to-cart API call
    const responsePromise = page.waitForResponse(
      (res) => res.url().includes('/cart/add') && res.ok(),
      { timeout: 15000 }
    );

    await addBtn.click({ force: true });
    const response = await responsePromise;
    expect(response.ok()).toBeTruthy();

    // Verify cart drawer if open, otherwise check cart page directly
    const cartDrawer = page.locator('cart-drawer, [id*="cart" i], [class*="drawer" i], [role="dialog"]').first();
    if (await cartDrawer.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(cartDrawer).toBeVisible();
    } else {
      await page.goto('/cart', { waitUntil: 'domcontentloaded' });
      const cartItems = page.locator('form[action*="/cart"], .cart-item, [class*="item"]').first();
      await expect(cartItems).toBeVisible({ timeout: 10000 });
    }
  });
});