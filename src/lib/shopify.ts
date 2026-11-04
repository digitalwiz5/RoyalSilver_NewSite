import { toast } from "sonner";
import { SAFE_MODE, simulateStorefront } from "./safe-mode";

export const SHOPIFY_API_VERSION = "2026-10";
// Defaults point at the live store. Override with VITE_SHOPIFY_STORE_DOMAIN / VITE_SHOPIFY_STOREFRONT_TOKEN
// (e.g. a Shopify development store for checkout testing). Storefront tokens are public, read-scoped tokens.
const env = (import.meta.env ?? {}) as Record<string, string | undefined>;
export const SHOPIFY_STORE_PERMANENT_DOMAIN = env.VITE_SHOPIFY_STORE_DOMAIN || "hc2k41-jj.myshopify.com";
export const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
export const SHOPIFY_STOREFRONT_TOKEN = env.VITE_SHOPIFY_STOREFRONT_TOKEN || "a564c7ce70db2fb2445c493004236901";

export interface ShopifyProduct {
  node: {
    id: string;
    createdAt?: string;
    title: string;
    description: string;
    handle: string;
    tags?: string[];
    priceRange: {
      minVariantPrice: { amount: string; currencyCode: string };
    };
    compareAtPriceRange?: {
      minVariantPrice: { amount: string; currencyCode: string };
    };
    images: {
      edges: Array<{ node: { url: string; altText: string | null } }>;
    };
    variants: {
      edges: Array<{
        node: {
          id: string;
          sku?: string | null;
          image?: { url: string; altText: string | null } | null;
          title: string;
          price: { amount: string; currencyCode: string };
          compareAtPrice?: { amount: string; currencyCode: string } | null;
          availableForSale: boolean;
          selectedOptions: Array<{ name: string; value: string }>;
        };
      }>;
    };
    options: Array<{ name: string; values: string[] }>;
  };
}

export async function storefrontApiRequest(query: string, variables: Record<string, unknown> = {}) {
  if (SAFE_MODE) {
    const simulated = simulateStorefront(query, variables);
    if (simulated) return simulated;
  }
  const response = await fetch(SHOPIFY_STOREFRONT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (response.status === 402) {
    toast.error("נדרשת מנוי Shopify פעיל לטעינת מוצרים");
    return;
  }

  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

  const data = await response.json();
  if (data.errors) throw new Error(`Shopify error: ${data.errors.map((e: { message: string }) => e.message).join(", ")}`);
  return data;
}

export const PRODUCTS_QUERY = `
  query GetProducts($first: Int!, $query: String) {
    products(first: $first, query: $query) {
      edges {
        node {
          id title description handle createdAt tags
          priceRange { minVariantPrice { amount currencyCode } }
          compareAtPriceRange { minVariantPrice { amount currencyCode } }
          images(first: 5) { edges { node { url altText } } }
          variants(first: 10) {
            edges { node {
              id sku title
              image { url altText }
              price { amount currencyCode }
              compareAtPrice { amount currencyCode }
              availableForSale
              selectedOptions { name value }
            } }
          }
          options { name values }
        }
      }
    }
  }
`;

export const PRODUCT_BY_HANDLE_QUERY = `
  query GetProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id title description descriptionHtml handle createdAt tags
      priceRange { minVariantPrice { amount currencyCode } }
      compareAtPriceRange { minVariantPrice { amount currencyCode } }
      images(first: 10) { edges { node { url altText } } }
      variants(first: 20) {
        edges { node {
          id sku title
          image { url altText }
          price { amount currencyCode }
          compareAtPrice { amount currencyCode }
          availableForSale
          selectedOptions { name value }
        } }
      }
      options { name values }
    }
  }
`;

export function formatPrice(amount: string, currency: string) {
  const n = Math.round(parseFloat(amount));
  const symbol = currency === "ILS" ? "₪" : currency;
  return `${n.toLocaleString("he-IL")}${symbol}`;
}

/** Discount % when a valid compare-at price exists, otherwise null. */
export function discountPercent(price: string, compareAt?: string | null) {
  const p = parseFloat(price);
  const c = compareAt ? parseFloat(compareAt) : NaN;
  if (!isFinite(p) || !isFinite(c) || c <= p) return null;
  return Math.round(((c - p) / c) * 100);
}

import { PRETTY_TO_REAL_HANDLE, REAL_TO_PRETTY_HANDLE, HIDDEN_HANDLES } from "./handles";

export { PRETTY_TO_REAL_HANDLE, REAL_TO_PRETTY_HANDLE, HIDDEN_HANDLES };

export function prettyHandle(handle: string) {
  return REAL_TO_PRETTY_HANDLE[handle] ?? handle;
}

export function realHandle(handle: string) {
  return PRETTY_TO_REAL_HANDLE[handle] ?? handle;
}

export function isHiddenHandle(handle: string) {
  return HIDDEN_HANDLES.has(handle) || HIDDEN_HANDLES.has(REAL_TO_PRETTY_HANDLE[handle]);
}

/**
 * Display-only formatting for size/stone-size option values.
 * Never changes the underlying Shopify value — only how it is shown.
 * "0.5 CT – 5.0 mm" → "0.5 קראט | 5 מ״מ"   |   "6 מ\"מ" → "6 מ״מ"
 */
export function formatSizeValue(value: string) {
  const raw = value.trim();
  const num = (s: string) => String(parseFloat(s));

  const ct = raw.match(/(\d+(?:\.\d+)?)\s*(?:ct|CT|קראט)/i);
  const mm = raw.match(/(\d+(?:\.\d+)?)\s*(?:mm|מ["״']{0,2}מ)/i);

  const parts: string[] = [];
  if (ct) parts.push(`${num(ct[1])} קראט`);
  if (mm) parts.push(`${num(mm[1])} מ״מ`);
  if (parts.length) return parts.join(" | ");
  return raw;
}
