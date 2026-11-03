# ROYAL SILVER V2 — SHOPIFY THEME

Based on **Dawn** (Shopify, free, MIT licence). Native Liquid/JSON-template theme; no external frontend, no separate catalog, no custom checkout.
Isolated from royalsilver.net, the Lovable project and the live Shopify theme. Nothing here has been pushed to any store.

## Status (honest)
- Verified: `shopify theme check` → 0 errors, 9 warnings (run on a short path; long Windows paths cause false errors).
- NOT verified: visual rendering, RTL behaviour, sliders in RTL, cart drawer, sticky bar. These need a real Shopify preview (see below).
- Hebrew storefront strings: `locales/he.json` (machine-drafted; needs a native read-through). Theme-editor labels remain English.

## What was customised
- `layout/theme.liquid`: `dir="rtl"` for he/ar/fa/ur/yi, loads `assets/royal.css`.
- All Dawn CSS converted from left/right to logical properties (identical in LTR) + RTL overrides in `assets/royal.css` (drawers, arrows, sliders, bidi prices).
- Ivory/linen/charcoal color schemes in `config/settings_data.json`; cart type = drawer.
- New editable sections: `royal-category-tiles` (7 category tiles), `royal-trust-strip`.
- `snippets/royal-sticky-atc.liquid`: mobile sticky add-to-cart; it clicks the real form button so Shopify fires AddToCart once. Toggle: "Sticky add-to-cart bar on mobile" in the product section.
- Homepage (`templates/index.json`): hero, category tiles, editor's picks, gifting, trust strip, brand story. All editable in the theme editor.
- Product template: gallery with thumbnails + lightbox zoom, collapsible Shipping / Returns / Service tabs, variant picker, related products.
- Only verified facts used: ₪29.90 delivery, 14-day returns, 050-242-6661, info@royalsilver.net.

## After connecting a dev store, set up in Shopify admin
1. Navigation: `main-menu` (women/men categories) and `footer` (shipping, returns, FAQ, privacy, terms, accessibility, contact).
2. Pick a collection in each category tile and in "Editor's picks" (the sample uses `all`; do not label as "best sellers" without sales data).
3. Create pages (about, FAQ, accessibility) with approved text; policies via Settings → Policies.
4. Upload hero/lifestyle images in the theme editor.

## Preview (needs your authorization; I have none)
```bash
npm i -g @shopify/cli
shopify theme dev --store <your-DEVELOPMENT-store>.myshopify.com --path rs-theme
```
Use a Shopify development store with sample data. To test with the live catalogue, `shopify theme push --unpublished --store ...` creates an unpublished theme only. **Never run `shopify theme publish`, and never push to the live theme ID.** Preview URL is private and noindex.

## Analytics architecture (no manual pixel)
- Dawn already dispatches Shopify Standard Events (PageView, product/collection views). No Meta code is added here.
- Install the official **Facebook & Instagram** sales channel (or Shopify Customer Events / Web Pixels) once, with a **new test dataset** for the dev store. It supplies PageView, ViewContent, AddToCart, InitiateCheckout, Purchase (+ Conversions API with dedup) from Shopify's own events and the checkout.
- Do not paste a Pixel snippet into `theme.liquid`; that is the usual cause of double counting.
- Production pixel stays untouched until separate approval; verify with Meta Test Events before switching.

## Known risks to test first
RTL sliders (`direction:ltr` workaround), cart-drawer slide direction, facet drawer, pagination arrows, quick-add, and Hebrew font rendering (Assistant). Free Dawn has no built-in reviews or size charts.
