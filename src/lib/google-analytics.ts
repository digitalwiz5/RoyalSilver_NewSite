/**
 * Google Analytics 4 for the storefront. It is driven from the Meta Pixel module's consent and event points
 * (meta-pixel.ts), so both tools share one consent decision, one page-view de-duplication and one set of
 * commerce events. Never loaded in dev, preview or staging builds (NO_TRACKING).
 * Purchases happen in Shopify checkout; connect GA4 there through Shopify's Google & YouTube app, not here.
 */
import { NO_TRACKING } from "./safe-mode";

export const GA_MEASUREMENT_ID = "G-BED7CYTM2Z";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

interface Item {
  variantId: string;
  price: { amount: string; currencyCode: string };
  quantity: number;
}

let loaded = false;

// gtag.js reads the Arguments object, not a plain array, so this must stay a classic function.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function gtag(..._args: unknown[]) {
  window.dataLayer = window.dataLayer || [];
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(arguments);
}

/** GA4 ecommerce items: numeric Shopify variant ID, the same identifier the Pixel and Meta catalog use. */
export function gaItems(items: Item[]) {
  return items.map((item) => ({
    item_id: item.variantId.split("/").pop() || item.variantId,
    price: Number(item.price.amount),
    quantity: item.quantity,
  }));
}

export function gaGrant() {
  if (NO_TRACKING) return;
  if (!loaded) {
    if (document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) {
      console.warn(
        "Royal Silver: another Google tag install was detected; duplicate initialization skipped.",
      );
      return;
    }
    window.gtag = gtag;
    gtag("consent", "default", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "granted",
    });
    gtag("js", new Date());
    // Page views are sent manually on every client-side navigation.
    gtag("config", GA_MEASUREMENT_ID, { send_page_view: false });
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);
    loaded = true;
  } else {
    gtag("consent", "update", { analytics_storage: "granted" });
  }
}

export function gaRevoke() {
  if (!loaded) return;
  gtag("consent", "update", { analytics_storage: "denied" });
}

export function gaPageView() {
  if (!loaded) return;
  gtag("event", "page_view", {
    page_location: window.location.href,
    page_path: window.location.pathname,
    page_title: document.title,
  });
}

export function gaCommerce(event: "ViewContent" | "AddToCart", items: Item[]) {
  if (!loaded || !items.length) return;
  const value = items.reduce((sum, item) => sum + Number(item.price.amount) * item.quantity, 0);
  gtag("event", event === "ViewContent" ? "view_item" : "add_to_cart", {
    currency: items[0]?.price.currencyCode || "ILS",
    value,
    items: gaItems(items),
  });
}
