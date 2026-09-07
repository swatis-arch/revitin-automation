import { Page, Locator, expect } from '@playwright/test';

/**
 * The product quick-view modal / product page purchase panel.
 * Covers flavor select (Citrus/Mint/Variety), size (Full/Travel),
 * purchase type (Subscribe & Save vs One-time), frequency, and add-to-cart/bag.
 */
export class ProductModal {
  readonly page: Page;
  readonly modal: Locator;
  readonly flavorCitrus: Locator;
  readonly flavorMint: Locator;
  readonly flavorVariety: Locator;
  readonly sizeFull: Locator;
  readonly sizeTravel: Locator;
  readonly subscribeTab: Locator;
  readonly oneTimeTab: Locator;
  readonly frequencySelect: Locator;
  readonly addToCartBtn: Locator;
  readonly addToBagBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.modal = page.locator('[role="dialog"], .product-modal, .quick-add-modal').first();
    this.flavorCitrus = this.modal.getByText('Citrus', { exact: false }).first();
    this.flavorMint = this.modal.getByText('Mint', { exact: false }).first();
    this.flavorVariety = this.modal.getByText('Variety', { exact: false }).first();
    this.sizeFull = this.modal.getByText('Full Size', { exact: false }).first();
    this.sizeTravel = this.modal.getByText('Travel Size', { exact: false }).first();
    this.subscribeTab = this.modal.getByText('Subscribe & Save', { exact: false }).first();
    this.oneTimeTab = this.modal.getByText('One-Time Purchase', { exact: false }).first();
    this.frequencySelect = this.modal.locator('select, [data-frequency-select]').first();
    this.addToCartBtn = this.modal.getByRole('button', { name: /add to cart/i });
    this.addToBagBtn = this.modal.getByRole('button', { name: /add to bag/i });
  }

  async waitForOpen() {
    // toBeAttached() rather than toBeVisible(): the modal animates in and
    // webkit sometimes reports it as not-yet-visible during the transition.
    await expect(this.modal).toBeAttached({ timeout: 8000 });
  }

  async selectFlavor(flavor: 'Citrus' | 'Mint' | 'Variety') {
    const target = { Citrus: this.flavorCitrus, Mint: this.flavorMint, Variety: this.flavorVariety }[flavor];
    await target.click();
  }

  async selectPurchaseType(type: 'Subscribe' | 'OneTime') {
    const target = type === 'Subscribe' ? this.subscribeTab : this.oneTimeTab;
    await target.click();
  }

  async selectFrequency(label: string) {
    if (await this.frequencySelect.count()) {
      await this.frequencySelect.selectOption({ label });
    }
  }

  async addToCart() {
    if (await this.addToCartBtn.count()) {
      await this.addToCartBtn.click();
    } else {
      await this.addToBagBtn.click();
    }
  }
}
