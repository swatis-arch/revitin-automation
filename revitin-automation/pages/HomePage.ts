import { Page, Locator, expect } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly shopRevitinCta: Locator;
  readonly cartToggle: Locator;
  readonly quickAddTiles: Locator;
  readonly newsletterContainer: Locator;
  readonly newsletterInput: Locator;
  readonly newsletterSubmit: Locator;
  readonly newsletterSuccess: Locator;

  constructor(page: Page) {
    this.page = page;
    this.shopRevitinCta = page.getByRole('link', { name: /shop/i }).first();
    this.cartToggle = page.locator('[data-cart-toggle], a[href*="/cart"], button:has-text("Cart")').first();
    this.quickAddTiles = page.locator('button:has-text("Quick Add"), a:has-text("Quick Add")');

    // General fallback for Klaviyo and generic theme newsletter forms
    this.newsletterContainer = page.locator('.klaviyo-form-UR9w6e, form[action*="/contact"]');
    this.newsletterInput = page.locator('input[type="email"], input[name="email"]').last();
    this.newsletterSubmit = page.locator('button[type="submit"], form[action*="/contact"] button').last();
    this.newsletterSuccess = page.locator('newsletter-form .success, [data-testid="form-success"], .klaviyo-form-UR9w6e div:has-text("Thank")');
  }

  async goto() {
    await this.page.goto('/', { waitUntil: 'load', timeout: 45000 });
    await expect(this.page).toHaveTitle(/Revitin/i, { timeout: 15000 });
    await this.dismissPromoPopup();
  }

  async dismissPromoPopup() {
    // Blanket list of modal close buttons across desktop, mobile, and Klaviyo overlays
    const closeButtons = this.page.locator(
      'button[aria-label*="close" i], [class*="close" i][role="button"], button.needsclick, button:has-text("✕"), button:has-text("×")'
    );

    try {
      if (await closeButtons.first().isVisible({ timeout: 2500 })) {
        await closeButtons.first().click({ force: true });
        await this.page.waitForTimeout(500);
      }
    } catch {
      // No popup appeared; proceed without stalling
    }
  }

  async openNav(linkName: string | RegExp) {
    await this.dismissPromoPopup();
    await this.page.getByRole('link', { name: linkName }).first().click();
  }

  async openQuickAddByIndex(index: number) {
    await this.dismissPromoPopup();
    await this.quickAddTiles.nth(index).click({ force: true });
  }

  async subscribeNewsletter(email: string) {
    await this.dismissPromoPopup();

    // Find the email input anywhere inside footer/klaviyo forms
    const emailInput = this.page.locator(
      'footer input[type="email"], [class*="klaviyo"] input[type="email"], input[placeholder*="email" i]'
    ).first();

    await emailInput.scrollIntoViewIfNeeded();
    await emailInput.waitFor({ state: 'visible', timeout: 10000 });
    await emailInput.click({ force: true });
    await emailInput.fill(email);

    // Try clicking the submit button; if not found or detached, hit Enter
    const submitBtn = this.page.locator(
      'footer button[type="submit"], [class*="klaviyo"] button[type="submit"], footer button:has-text("Subscribe"), footer button:has-text("Sign Up")'
    ).first();

    if (await submitBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await submitBtn.click({ force: true });
    } else {
      await emailInput.press('Enter');
    }
  }
}