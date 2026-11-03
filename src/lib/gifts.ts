/**
 * Gift browsing helpers (browser-safe, testable). Everything here derives from real catalog data:
 * live Shopify prices, tags and titles. No occasion/"bestseller" claims are made.
 */
import type { ShopifyProduct } from "./shopify";
import { isMensProduct, isRelatedExcludedHandle } from "./related-products";

export type Recipient = "her" | "him";
export type PriceBand = "all" | "low" | "mid" | "high";

/** Upper bounds are inclusive; shown to shoppers in ILS. */
export const PRICE_BANDS: Record<PriceBand, { label: string; min: number; max: number }> = {
  all: { label: "כל המחירים", min: 0, max: Infinity },
  low: { label: "עד 250 ₪", min: 0, max: 250 },
  mid: { label: "250–350 ₪", min: 250.01, max: 350 },
  high: { label: "מעל 350 ₪", min: 350.01, max: Infinity },
};

export function productMinPrice(product: ShopifyProduct): number {
  const prices = product.node.variants.edges.map((v) => parseFloat(v.node.price.amount)).filter((n) => isFinite(n) && n > 0);
  return prices.length ? Math.min(...prices) : parseFloat(product.node.priceRange.minVariantPrice.amount);
}

export function isPurchasable(product: ShopifyProduct): boolean {
  return product.node.variants.edges.some((v) => v.node.availableForSale);
}

export function giftPool(products: ShopifyProduct[], recipient: Recipient, band: PriceBand): ShopifyProduct[] {
  const { min, max } = PRICE_BANDS[band];
  return products.filter((p) => {
    if (!isPurchasable(p)) return false;
    if (isMensProduct(p.node.tags) !== (recipient === "him")) return false;
    const price = productMinPrice(p);
    return price >= min && price <= max;
  });
}

const FAMILIES = ["טבעת", "שרשרת", "צמיד", "עגיל", "סט"] as const;
export function productFamily(title: string): string | null {
  return FAMILIES.find((f) => title.includes(f)) ?? null;
}

/**
 * Cart add-ons: same audience, purchasable, not already in the cart, never the excluded handles, and a
 * *different* jewelry family than what is already in the cart (complements rather than duplicates).
 */
export function cartAddOns(products: ShopifyProduct[], cart: Array<{ productId: string; handle: string; title: string; tags?: string[] }>, limit = 2): ShopifyProduct[] {
  if (!cart.length) return [];
  const inCart = new Set(cart.map((c) => c.productId));
  const families = new Set(cart.map((c) => productFamily(c.title)).filter(Boolean));
  const mens = cart.every((c) => isMensProduct(c.tags));
  const womens = cart.every((c) => !isMensProduct(c.tags));
  if (!mens && !womens) return [];
  return products
    .filter((p) => isPurchasable(p) && !inCart.has(p.node.id) && !isRelatedExcludedHandle(p.node.handle))
    .filter((p) => isMensProduct(p.node.tags) === mens)
    .filter((p) => {
      const family = productFamily(p.node.title);
      return family !== null && !families.has(family);
    })
    .slice(0, limit);
}
