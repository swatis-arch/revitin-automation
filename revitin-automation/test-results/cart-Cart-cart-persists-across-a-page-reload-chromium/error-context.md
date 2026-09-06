# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: cart.spec.ts >> Cart >> cart persists across a page reload
- Location: tests\cart.spec.ts:66:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('main, form[action*="/cart"], [class*="cart"]').locator(':visible').filter({ hasText: /revitin|toothpaste|subtotal|checkout|\$/i }).first()
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for locator('main, form[action*="/cart"], [class*="cart"]').locator(':visible').filter({ hasText: /revitin|toothpaste|subtotal|checkout|\$/i }).first()

```

```yaml
- heading "Your connection needs to be verified before you can proceed" [level=1]
- main:
  - heading [level=2]
  - paragraph
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Cart', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     page.setDefaultTimeout(25000);
  6  | 
  7  |     // Dismiss marketing overlays if present
  8  |     const closeBtn = page.locator('button[aria-label*="close" i], button.needsclick, [aria-label="Close dialog"]').first();
  9  |     if (await closeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
  10 |       await closeBtn.click({ force: true });
  11 |     }
  12 |   });
  13 | 
  14 |   test('cart is empty on a fresh session', async ({ page, context }) => {
  15 |     // Clear cookies/storage to guarantee an unpolluted fresh session
  16 |     await context.clearCookies();
  17 |     await page.goto('/cart', { waitUntil: 'domcontentloaded' });
  18 | 
  19 |     // Verify empty cart state (theme empty-state text or empty bag messaging)
  20 |     const emptyNotice = page.locator(':visible').filter({
  21 |       hasText: /empty|your bag is empty|nothing here/i,
  22 |     }).first();
  23 | 
  24 |     await expect(emptyNotice).toBeVisible({ timeout: 10000 });
  25 |   });
  26 | 
  27 |   test('adding an item updates the subtotal and item count', async ({ page }) => {
  28 |     await page.goto('/products/revitin-natural-toothpaste', { waitUntil: 'domcontentloaded' });
  29 | 
  30 |     // Locate visible add button and trigger click directly
  31 |     const addBtn = page.locator('button:visible').filter({ hasText: /add to bag|add to cart/i }).first();
  32 |     await expect(addBtn).toBeAttached({ timeout: 10000 });
  33 |     await addBtn.evaluate((el: HTMLElement) => el.click());
  34 | 
  35 |     // Check cart drawer visible or redirect to /cart to verify line item exists
  36 |     const cartIndicator = page.locator('cart-drawer:visible, [role="dialog"]:visible, .cart-drawer:visible').first();
  37 |     if (await cartIndicator.isVisible({ timeout: 4000 }).catch(() => false)) {
  38 |       await expect(cartIndicator).toContainText(/\$|\d+/);
  39 |     } else {
  40 |       await page.goto('/cart', { waitUntil: 'domcontentloaded' });
  41 |       const cartItem = page.locator(':visible').filter({ hasText: /revitin|toothpaste|\$/i }).first();
  42 |       await expect(cartItem).toBeVisible({ timeout: 10000 });
  43 |     }
  44 |   });
  45 | 
  46 |   test('checkout button redirects to Shopify checkout', async ({ page }) => {
  47 |     await page.goto('/products/revitin-natural-toothpaste', { waitUntil: 'domcontentloaded' });
  48 | 
  49 |     // Add product to cart
  50 |     const addBtn = page.locator('button:visible').filter({ hasText: /add to bag|add to cart/i }).first();
  51 |     await expect(addBtn).toBeAttached({ timeout: 10000 });
  52 |     await addBtn.evaluate((el: HTMLElement) => el.click());
  53 | 
  54 |     // Wait for cart drawer or open /cart directly
  55 |     const checkoutBtn = page.locator('button:visible, a:visible').filter({ hasText: /check\s*out/i }).first();
  56 |     if (await checkoutBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
  57 |       await checkoutBtn.evaluate((el: HTMLElement) => el.click());
  58 |     } else {
  59 |       await page.goto('/checkout', { waitUntil: 'domcontentloaded' });
  60 |     }
  61 | 
  62 |     // Shopify checkout routes to /checkouts/, shop.app, or myshopify checkout domains
  63 |     await expect(page).toHaveURL(/checkouts|checkout|shop\.app/i, { timeout: 15000 });
  64 |   });
  65 | 
  66 |   test('cart persists across a page reload', async ({ page }) => {
  67 |     await page.goto('/products/revitin-natural-toothpaste', { waitUntil: 'domcontentloaded' });
  68 | 
  69 |     // 1. Add item to cart
  70 |     const addBtn = page.locator('button:visible').filter({ hasText: /add to bag|add to cart/i }).first();
  71 |     await expect(addBtn).toBeAttached({ timeout: 10000 });
  72 |     await addBtn.evaluate((el: HTMLElement) => el.click());
  73 | 
  74 |     // 2. Open /cart and wait for load to settle before reloading
  75 |     await page.goto('/cart', { waitUntil: 'load', timeout: 20000 });
  76 | 
  77 |     // 3. Reload safely using waitUntil: 'commit' or standard reload
  78 |     await page.reload({ waitUntil: 'commit' });
  79 | 
  80 |     // 4. Verify cart product or non-empty cart state persists
  81 |     const cartProduct = page.locator('main, form[action*="/cart"], [class*="cart"]')
  82 |       .locator(':visible')
  83 |       .filter({ hasText: /revitin|toothpaste|subtotal|checkout|\$/i })
  84 |       .first();
  85 | 
> 86 |     await expect(cartProduct).toBeVisible({ timeout: 15000 });
     |                               ^ Error: expect(locator).toBeVisible() failed
  87 |   });
  88 | })
  89 | 
```