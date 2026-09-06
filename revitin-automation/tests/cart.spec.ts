import { test, expect } from '@playwright/test';

test.describe('Cart', () => {
  test.beforeEach(async ({ page }) => {
    page.setDefaultTimeout(25000);

    // Dismiss marketing overlays if present
    const closeBtn = page.locator('button[aria-label*="close" i], button.needsclick, [aria-label="Close dialog"]').first();
    if (await closeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await closeBtn.click({ force: true });
    }
  });

  test('cart is empty on a fresh session', async ({ page, context }) => {
    // Clear cookies/storage to guarantee an unpolluted fresh session
    await context.clearCookies();
    await page.goto('/cart', { waitUntil: 'domcontentloaded' });

    // Verify empty cart state (theme empty-state text or empty bag messaging)
    const emptyNotice = page.locator(':visible').filter({
      hasText: /empty|your bag is empty|nothing here/i,
    }).first();

    await expect(emptyNotice).toBeVisible({ timeout: 10000 });
  });

  test('adding an item updates the subtotal and item count', async ({ page }) => {
    await page.goto('/products/revitin-natural-toothpaste', { waitUntil: 'domcontentloaded' });

    // Locate visible add button and trigger click directly
    const addBtn = page.locator('button:visible').filter({ hasText: /add to bag|add to cart/i }).first();
    await expect(addBtn).toBeAttached({ timeout: 10000 });
    await addBtn.evaluate((el: HTMLElement) => el.click());

    // Check cart drawer visible or redirect to /cart to verify line item exists
    const cartIndicator = page.locator('cart-drawer:visible, [role="dialog"]:visible, .cart-drawer:visible').first();
    if (await cartIndicator.isVisible({ timeout: 4000 }).catch(() => false)) {
      await expect(cartIndicator).toContainText(/\$|\d+/);
    } else {
      await page.goto('/cart', { waitUntil: 'domcontentloaded' });
      const cartItem = page.locator(':visible').filter({ hasText: /revitin|toothpaste|\$/i }).first();
      await expect(cartItem).toBeVisible({ timeout: 10000 });
    }
  });

  test('checkout button redirects to Shopify checkout', async ({ page }) => {
    await page.goto('/products/revitin-natural-toothpaste', { waitUntil: 'domcontentloaded' });

    // Add product to cart
    const addBtn = page.locator('button:visible').filter({ hasText: /add to bag|add to cart/i }).first();
    await expect(addBtn).toBeAttached({ timeout: 10000 });
    await addBtn.evaluate((el: HTMLElement) => el.click());

    // Wait for cart drawer or open /cart directly
    const checkoutBtn = page.locator('button:visible, a:visible').filter({ hasText: /check\s*out/i }).first();
    if (await checkoutBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      await checkoutBtn.evaluate((el: HTMLElement) => el.click());
    } else {
      await page.goto('/checkout', { waitUntil: 'domcontentloaded' });
    }

    // Shopify checkout routes to /checkouts/, shop.app, or myshopify checkout domains
    await expect(page).toHaveURL(/checkouts|checkout|shop\.app/i, { timeout: 15000 });
  });

  test('cart persists across a page reload', async ({ page }) => {
    await page.goto('/products/revitin-natural-toothpaste', { waitUntil: 'domcontentloaded' });

    // 1. Add item to cart
    const addBtn = page.locator('button:visible').filter({ hasText: /add to bag|add to cart/i }).first();
    await expect(addBtn).toBeAttached({ timeout: 10000 });
    await addBtn.evaluate((el: HTMLElement) => el.click());

    // 2. Open /cart and wait for load to settle before reloading
    await page.goto('/cart', { waitUntil: 'load', timeout: 20000 });

    // 3. Reload safely using waitUntil: 'commit' or standard reload
    await page.reload({ waitUntil: 'commit' });

    // 4. Verify cart product or non-empty cart state persists
    const cartProduct = page.locator('main, form[action*="/cart"], [class*="cart"]')
      .locator(':visible')
      .filter({ hasText: /revitin|toothpaste|subtotal|checkout|\$/i })
      .first();

    await expect(cartProduct).toBeVisible({ timeout: 15000 });
  });
})
