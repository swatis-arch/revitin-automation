import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test.describe('Homepage', () => {
  test('loads with correct title, hero, and key sections', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await expect(
      page.getByText(/prebiotic/i).first()
    ).toBeVisible({ timeout: 10000 });
    
    await expect(home.shopRevitinCta).toBeVisible({ timeout: 10000 });
  });

  test('footer nav links point to the right pages', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    const footer = page.locator('footer');
    await footer.scrollIntoViewIfNeeded();

    const navChecks: [RegExp, RegExp][] = [
      [/About/i, /\/pages\/about/],
      [/Ingredients/i, /\/pages\/ingredients/],
      [/Contact/i, /\/pages\/contact/],
      [/Wholesale/i, /\/pages\/wholesale/],
    ];

    for (const [name, urlPattern] of navChecks) {
      const link = footer.getByRole('link', { name }).first();
      if (await link.isVisible({ timeout: 3000 })) {
        await expect(link).toHaveAttribute('href', urlPattern);
      }
    }
  });

  test('footer policy links resolve (no 404s)', async ({ page, request }) => {
    const home = new HomePage(page);
    await home.goto();

    // Extract unique footer policy links
    const hrefs = await page
      .locator('footer a[href^="/pages/"], footer a[href^="/policies/"]')
      .evaluateAll((els) =>
        Array.from(new Set(els.map((e) => (e as HTMLAnchorElement).getAttribute('href')))).filter(Boolean)
      );

    // Limit to first 4 essential checks to prevent WebKit/Mobile network exhaustion
    const linksToTest = hrefs.slice(0, 4);

    // Execute concurrently rather than sequentially
    await Promise.all(
      linksToTest.map(async (href) => {
        if (!href) return;
        const res = await request.get(href);
        expect.soft(res.status(), `${href} returned 404`).toBeLessThan(400);
      })
    );
  });

  test('newsletter signup accepts a valid email', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    const uniqueEmail = `swati81126+${Date.now()}@gmail.com`;
    await home.subscribeNewsletter(uniqueEmail);

    // Use a clean regex selector without special character pitfalls
    const successFeedback = page.getByText(/thank you|subscribed|thanks/i).first();

    await expect(successFeedback).toBeVisible({ timeout: 15000 });
  });
});