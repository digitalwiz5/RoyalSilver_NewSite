import type { ShopifyProduct } from "./shopify";

type Product = ShopifyProduct["node"];
type Variant = Product["variants"]["edges"][number]["node"];

/** Approved supplemental media never replaces the live catalog gallery. */
export function mergeGalleryImages(...groups: Product["images"]["edges"][]) {
  const seen = new Set<string>();
  return groups.flat().filter(({ node }) => {
    const identity = node.url.split("?")[0];
    if (seen.has(identity)) return false;
    seen.add(identity);
    return true;
  });
}

/** A card may quick-add only a product with no customer choice. */
export function requiresProductSelection(product: Product) {
  return product.options.some((option) => option.values.length > 1);
}

/** Purchasing never falls back to a different combination. */
export function exactVariant(variants: Variant[], selection: Record<string, string>) {
  return variants.find((variant) => variant.selectedOptions.every((option) => selection[option.name] === option.value));
}

/** Source image relationships, not accessibility text, select generic variant media. */
export function variantGalleryImages(product: Product, variant?: Variant) {
  const images = product.images.edges;
  const linked = variant?.image;
  if (!linked) return images;
  const existing = images.find((image) => image.node.url === linked.url);
  return [existing ?? { node: linked }, ...images.filter((image) => image.node.url !== linked.url)];
}

export function variantShownByPrimaryImage(product: Product) {
  const primary = product.images.edges[0]?.node.url;
  if (!primary) return undefined;
  // Shared media cannot identify a unique choice. Preserve source default in that case.
  const linked = product.variants.edges.filter(({ node }) => node.image?.url === primary);
  return linked.length === 1 ? linked[0]?.node : undefined;
}