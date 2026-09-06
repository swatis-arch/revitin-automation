# Revitin.com — Playwright Automation Suite

Scaffold for automated regression testing of revitin.com (Shopify store), built
on the patterns from the existing suite: `page.goto()` preferred over `.click()`
for navigation, and `toBeAttached()` preferred over `toBeVisible()` for elements
that animate in (modals, drawers) — this was needed to fix webkit timeout/flake
issues previously.

## Setup

```bash
npm install
npx playwright install --with-deps
npm test                 # all projects (chromium, webkit, mobile-chrome)
npm run test:chromium    # single browser
npm run report           # view HTML report after a run
```

## Structure

```
revitin-automation/
├── playwright.config.ts
├── pages/                  # Page Object Models
│   ├── HomePage.ts
│   ├── ProductModal.ts
│   └── CartDrawer.ts
└── tests/
    ├── homepage.spec.ts
    ├── product-selection.spec.ts
    ├── subscribe-and-save.spec.ts
    ├── one-time-purchase.spec.ts
    ├── cart.spec.ts
    └── navigation.spec.ts
```

## What's covered now

- Homepage load, hero copy, header nav hrefs, footer link health check, newsletter signup
- Flavor (Mint/Citrus/Variety) and size (Full/Travel) selection, quick-add modal, direct product URLs
- Subscribe & Save: Trio (3 tubes, $42, save 18%) and Family pack (5 tubes, $68, save 20%), frequency selector, cancel-anytime disclosure
- One-Time Purchase: single tube ($17) and bundle tiers (3/5/25 tubes) with discount badges
- Cart drawer: empty state, subtotal update on add, checkout redirect to Shopify `/checkouts/`, persistence across reload
- Cross-page nav: account/login redirect, ingredients, blogs, FAQ, wholesale, mobile hamburger menu

Selectors are written defensively (text/role based) since I couldn't inspect the
live rendered DOM/data-attributes from here — expect to tighten a few locators
(e.g. `data-cart-item`, the newsletter success state, `aria-selected` on flavor
swatches) once run against the real site and adjusted to actual attributes.

## Ideas for what to add next

**Checkout & payment (high value, currently missing)**
- Guest checkout happy path through to the Shopify payment step (stop short of
  a real charge, or use Shopify's test/bogus gateway if the dev store supports it)
- Discount code field: valid code, invalid code, expired code
- Shipping: address validation, free-shipping threshold messaging if any

**Subscription management**
- Editing an existing subscription (skip/swap/cancel) via the customer account
  portal — likely a separate subscription-management app (Recharge/Skio/etc.);
  worth checking which one revitin.com uses since that changes the selectors entirely
- Subscription vs one-time price delta assertions (make sure the "up to 20%"
  claim matches the actual math for each tier)

**Cross-sell / upsell**
- "No thanks!" comparison table interaction (the Revitin vs Traditional Toothpaste table)
- Any post-add-to-cart upsell/cross-sell offers in the drawer

**Data-driven variant matrix**
- Parametrize flavor × size × purchase-type × frequency into a single data-driven
  spec instead of hand-written cases, so every combination is exercised (e.g.
  `for (const flavor of ['Mint','Citrus','Variety']) for (const size of [...])`)

**Visual/regression**
- Playwright's `toHaveScreenshot()` on the hero, product modal, and cart drawer
  to catch unintended theme/CSS changes between deploys

**Accessibility**
- Basic axe-core pass (`@axe-core/playwright`) on homepage, product page, cart —
  low effort, catches contrast/label regressions early

**Performance smoke**
- Assert core pages respond within a budget (e.g. via `page.goto` timing or
  Playwright's tracing) since Shopify apps/scripts can bloat load time over time

**API-level checks (faster than UI, good for CI gating)**
- Shopify's storefront `/cart.js` and `/cart/add.js` endpoints can be hit
  directly via `request` fixture to validate cart math without going through
  the UI — useful as a fast pre-check before the full UI suite runs

## Suggested CI setup

Run `chromium` on every PR (fast signal), and the full matrix
(`chromium` + `webkit` + `mobile-chrome`) nightly or pre-release, given webkit's
history of flakiness on this site.
