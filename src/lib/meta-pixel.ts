import { advertisingAllowed, readConsent } from "./advertising-consent";
import { NO_TRACKING } from "./safe-mode";
export const META_PIXEL_ID = "2901339290228652";
type PixelArgs = unknown[];
interface PixelFunction {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue: PixelArgs[];
  push: PixelFunction;
  loaded: boolean;
  version: string;
}
declare global {
  interface Window { fbq?: PixelFunction; _fbq?: PixelFunction; }
  interface Navigator { globalPrivacyControl?: boolean; }
}
export const STOREFRONT_EVENTS = ["PageView", "ViewContent", "AddToCart"] as const;
type CommerceEvent = "ViewContent" | "AddToCart";
interface Item { variantId: string; price: { amount: string; currencyCode: string }; quantity: number; }
let currentRegion: string | null = null;
let regionResolved = false;
let initialized = false;
let granted = false;
let lastPage: string | null = null;
let view: { path: string; items: Item[] } | null = null;
let lastView: string | null = null;
export function commerceParameters(items: Item[]) {
  const contents = items.map(item => ({ id: item.variantId.split("/").pop() || item.variantId, quantity: item.quantity, item_price: Number(item.price.amount) }));
  return { content_type: "product", content_ids: contents.map(item => item.id), contents, num_items: items.reduce((sum, item) => sum + item.quantity, 0), value: items.reduce((sum, item) => sum + Number(item.price.amount) * item.quantity, 0), currency: items[0]?.price.currencyCode || "ILS" };
}
function permission() {
  return regionResolved && advertisingAllowed(currentRegion, readConsent()?.choice, navigator.globalPrivacyControl === true || navigator.doNotTrack === "1");
}
function dispatch(...args: unknown[]) {
  const fbq = window.fbq;
  if (!fbq) return;
  if (fbq.callMethod) fbq.callMethod.apply(fbq, args);
  else fbq.queue.push(args);
}
function cleanAddress() {
  // Remove contact identifiers before Meta reads the URL, retaining store navigation parameters.
  const url = new URL(window.location.href);
  let changed = false;
  for (const key of [...url.searchParams.keys()]) {
    if (/email|phone|first.?name|last.?name|address|customer|access.?token/i.test(key)) {
      url.searchParams.delete(key); changed = true;
    }
  }
  if (changed) window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
}
export function updatePixelConsent(region: string | null) {
  if (NO_TRACKING) return; // never load or fire the production Meta Pixel from dev, preview or staging builds
  currentRegion = region;
  regionResolved = true;
  if (!permission()) {
    if (initialized) {
      if (window.fbq?.queue) window.fbq.queue = window.fbq.queue.filter(args => args[0] !== "track" && args[0] !== "trackCustom");
      dispatch("consent", "revoke");
    }
    granted = false;
    return;
  }
  if (!initialized) {
    // Do not layer this install over a pixel installed by another system.
    if (window.fbq || document.querySelector('script[src*="fbevents.js"]')) {
      console.warn("Royal Silver: another Meta Pixel install was detected; duplicate initialization skipped.");
      return;
    }
    cleanAddress();
    const fbq = function (...args: unknown[]) {
      if (fbq.callMethod) fbq.callMethod.apply(fbq, args);
      else fbq.queue.push(args);
    } as PixelFunction;
    fbq.queue = []; fbq.push = fbq; fbq.loaded = true; fbq.version = "2.0";
    window.fbq = fbq; window._fbq = fbq;
    dispatch("set", "autoConfig", false, META_PIXEL_ID);
    dispatch("init", META_PIXEL_ID, {}, { agent: "royalsilver" });
    const script = document.createElement("script");
    script.async = true; script.src = "https://connect.facebook.net/en_US/fbevents.js";
    script.referrerPolicy = "strict-origin";
    document.head.appendChild(script);
    initialized = true;
  }
  const newlyGranted = !granted;
  granted = true;
  dispatch("consent", "grant");
  if (newlyGranted) { lastPage = null; lastView = null; }
  trackCurrentPage();
}
export function trackCurrentPage() {
  if (!granted || !permission()) return;
  cleanAddress();
  const path = window.location.pathname;
  if (lastPage !== path) {
    lastPage = path; lastView = null;
    dispatch("track", "PageView", {}, { eventID: crypto.randomUUID() });
  }
  if (view?.path === path && lastView !== path) {
    lastView = path;
    trackCommerce("ViewContent", view.items);
  }
}
export function setProductView(items: Item[]) {
  view = { path: window.location.pathname, items };
  trackCurrentPage();
  return () => { view = null; };
}
export function trackCommerce(event: CommerceEvent, items: Item[]) {
  try {
    if (!granted || !permission() || !items.length) return;
    dispatch("track", event, commerceParameters(items), { eventID: crypto.randomUUID() });
  } catch { /* Advertising must never interrupt checkout or cart updates. */ }
}