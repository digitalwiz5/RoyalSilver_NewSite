import { HIDDEN_HANDLES, PRETTY_TO_REAL_HANDLE, REAL_TO_PRETTY_HANDLE } from "./handles";
import { SHAY_HANDLE, SHAY_SEO, SHAY_SOURCE_HANDLES, SHAY_TITLE, SHAY_VARIANTS } from "./shay";
import { isVisibleVariant } from "./visible-variants";

/**
 * Meta (Facebook/Instagram) catalog feed built from live Shopify Storefront data.
 * One item per storefront-visible variant. `id` is the numeric Shopify variant ID, the same value the
 * site's Pixel sends as content_ids, so catalog ads and retargeting match the products people viewed.
 * Links point to this site's product pages, never to the password-locked Shopify Online Store.
 */

export const BRAND = "Royal Silver";

export interface FeedVariant {
  id: string;
  sku: string | null;
  title: string;
  availableForSale: boolean;
  price: { amount: string; currencyCode: string };
  compareAtPrice: { amount: string; currencyCode: string } | null;
  image: { url: string } | null;
  selectedOptions: Array<{ name: string; value: string }>;
}

export interface FeedProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  productType?: string;
  tags?: string[];
  images: { edges: Array<{ node: { url: string } }> };
  variants: { edges: Array<{ node: FeedVariant }> };
}

export interface FeedItem {
  id: string;
  item_group_id: string;
  title: string;
  description: string;
  availability: "in stock" | "out of stock";
  condition: "new";
  price: string;
  sale_price?: string;
  link: string;
  image_link: string;
  additional_image_link: string[];
  brand: string;
  color?: string;
  size?: string;
  product_type?: string;
}

const numericId = (gid: string) => gid.split("/").pop()?.split("?")[0] ?? gid;
const money = (m: { amount: string; currencyCode: string }) =>
  `${Number(m.amount).toFixed(2)} ${m.currencyCode}`;
const COLOR_NAMES = ["צבע", "color", "colour", "גוון"];
const SIZE_NAMES = ["מידה", "גודל", "size", "גודל האבנים", "אורך"];
const optionValue = (v: FeedVariant, names: string[]) =>
  v.selectedOptions.find(
    (o) => names.includes(o.name.trim().toLowerCase()) || names.includes(o.name.trim()),
  )?.value;

function isHidden(realHandle: string) {
  const pretty = REAL_TO_PRETTY_HANDLE[realHandle] ?? realHandle;
  return (
    HIDDEN_HANDLES.has(realHandle) ||
    HIDDEN_HANDLES.has(pretty) ||
    HIDDEN_HANDLES.has(PRETTY_TO_REAL_HANDLE[pretty] ?? "")
  );
}

/** Meta caps titles at 200 characters and descriptions at 9,999; keep plain text with collapsed whitespace. */
function clean(text: string, max: number) {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t;
}

function absolute(url: string, origin: string) {
  return /^https?:\/\//.test(url) ? url : `${origin}${url.startsWith("/") ? "" : "/"}${url}`;
}

function pricing(v: FeedVariant): Pick<FeedItem, "price" | "sale_price"> {
  const compare =
    v.compareAtPrice && Number(v.compareAtPrice.amount) > Number(v.price.amount)
      ? v.compareAtPrice
      : null;
  return compare
    ? { price: money(compare), sale_price: money(v.price) }
    : { price: money(v.price) };
}

function variantTitle(productTitle: string, v: FeedVariant) {
  const extra = v.selectedOptions.map((o) => o.value).filter((x) => x && x !== "Default Title");
  return clean(extra.length ? `${productTitle} – ${extra.join(" / ")}` : productTitle, 200);
}

export function buildFeedItems(products: FeedProduct[], origin: string): FeedItem[] {
  const items: FeedItem[] = [];
  const seen = new Set<string>();
  const push = (item: FeedItem) => {
    if (seen.has(item.id) || !item.image_link) return;
    seen.add(item.id);
    items.push(item);
  };

  for (const p of products) {
    if (isHidden(p.handle) || SHAY_SOURCE_HANDLES.includes(p.handle)) continue;
    const pretty = REAL_TO_PRETTY_HANDLE[p.handle] ?? p.handle;
    const link = `${origin}/product/${encodeURIComponent(pretty)}`;
    const images = p.images.edges.map((e) => e.node.url);
    const description = clean(p.description || p.title, 5000);
    for (const { node: v } of p.variants.edges) {
      if (!isVisibleVariant(p.handle, v.sku)) continue;
      const lead = v.image?.url ?? images[0];
      if (!lead) continue;
      push({
        id: numericId(v.id),
        item_group_id: numericId(p.id),
        title: variantTitle(p.title, v),
        description,
        availability: v.availableForSale ? "in stock" : "out of stock",
        condition: "new",
        ...pricing(v),
        link,
        image_link: lead,
        additional_image_link: images.filter((u) => u !== lead).slice(0, 9),
        brand: BRAND,
        color: optionValue(v, COLOR_NAMES),
        size: optionValue(v, SIZE_NAMES),
        product_type: p.productType || undefined,
      });
    }
  }

  // Shay is one presentation product built from two Shopify source products; its variants keep their original IDs.
  const shayLink = `${origin}/product/${encodeURIComponent(SHAY_HANDLE)}`;
  for (const m of SHAY_VARIANTS) {
    const source = products.find((p) => numericId(p.id) === m.productId);
    const v = source?.variants.edges.find(
      ({ node }) => numericId(node.id) === m.id && node.sku === m.sku,
    )?.node;
    if (!v) continue;
    push({
      id: m.id,
      item_group_id: "shay",
      title: clean(`${SHAY_TITLE} – ${m.size} / ${m.color}`, 200),
      description: SHAY_SEO.description,
      availability: v.availableForSale ? "in stock" : "out of stock",
      condition: "new",
      ...pricing(v),
      link: shayLink,
      image_link: absolute(m.image, origin),
      additional_image_link: SHAY_VARIANTS.filter((x) => x.id !== m.id).map((x) =>
        absolute(x.image, origin),
      ),
      brand: BRAND,
      color: m.color,
      size: m.size,
    });
  }
  return items;
}

const xmlEscape = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

/** RSS 2.0 with the g: namespace, which Meta Commerce Manager accepts as a scheduled data feed. */
export function feedXml(items: FeedItem[], origin: string): string {
  const field = (name: string, value: string | undefined) =>
    value ? `      <g:${name}>${xmlEscape(value)}</g:${name}>` : null;
  const body = items
    .map((i) =>
      [
        "    <item>",
        field("id", i.id),
        field("item_group_id", i.item_group_id),
        field("title", i.title),
        field("description", i.description),
        field("availability", i.availability),
        field("condition", i.condition),
        field("price", i.price),
        field("sale_price", i.sale_price),
        field("link", i.link),
        field("image_link", i.image_link),
        ...i.additional_image_link.map((u) => field("additional_image_link", u)),
        field("brand", i.brand),
        field("color", i.color),
        field("size", i.size),
        field("product_type", i.product_type),
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n"),
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${BRAND}</title>
    <link>${xmlEscape(origin)}</link>
    <description>${BRAND} product catalog</description>
${body}
  </channel>
</rss>`;
}
