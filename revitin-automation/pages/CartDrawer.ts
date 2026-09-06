import { Page, Locator, expect } from '@playwright/test';

export class CartDrawer {
  readonly page: Page;
  readonly drawer: Locator;
  readonly lineItems: Locator;
  readonly subtotal: Locator;
  readonly checkoutBtn: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    this.page = page;
    this.drawer = page.locator('[data-cart-drawer], #CartDrawer, .cart-drawer').first();
    this.lineItems = this.drawer.locator('[data-cart-item], .cart-item');
    this.subtotal = this.drawer.getByText(/subtotal/i);
    this.checkoutBtn = this.drawer.getByRole('link', { name: /checkout/i });
    this.emptyState = this.drawer.getByText(/cart is empty/i);
  }

  async waitForOpen() {
    await expect(this.drawer).toBeAttached({ timeout: 8000 });
  }

  async itemCount(): Promise<number> {
    return this.lineItems.count();
  }

  async goToCheckout() {
    await this.checkoutBtn.click();
    await this.page.waitForURL(/\/checkouts\//, { timeout: 15000 });
  }
}
