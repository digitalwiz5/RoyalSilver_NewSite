import { PRODUCTS_QUERY, PRODUCT_BY_HANDLE_QUERY, storefrontApiRequest, type ShopifyProduct } from "./shopify";
interface PageInfo { hasNextPage: boolean; endCursor: string | null }
export interface Connection<T> { edges: Array<{ node: T }>; pageInfo?: PageInfo }
export type CatalogProduct = ShopifyProduct["node"] & { descriptionHtml?: string };

/** Keep source order, deduplicate identities only, and fail closed on a broken cursor. */
export async function collectPages<T>(read: (after: string | null) => Promise<Connection<T>>, identity: (node: T) => string) {
  const result: Array<{ node: T }> = [];
  const ids = new Set<string>();
  const cursors = new Set<string>();
  let after: string | null = null;
  for (;;) {
    const page = await read(after);
    for (const edge of page.edges) {
      const id = identity(edge.node);
      if (!ids.has(id)) { result.push(edge); ids.add(id); }
    }
    if (!page.pageInfo?.hasNextPage) return result;
    const next = page.pageInfo.endCursor;
    if (!next || cursors.has(next)) throw new Error("Shopify returned an invalid pagination cursor");
    cursors.add(next);
    after = next;
  }
}

const CATALOG_QUERY = PRODUCTS_QUERY
  .replace("$query: String)", "$query: String, $after: String)")
  .replace("query: $query) {", "query: $query, after: $after, sortKey: CREATED_AT, reverse: true) {\n pageInfo { hasNextPage endCursor }")
  .replace("variants(first: 10)", "variants(first: 250)");

export async function fetchCategoryProducts(query: string): Promise<ShopifyProduct[]> {
  const products = await collectPages(async (after) => {
    const response = await storefrontApiRequest(CATALOG_QUERY, { first: 50, query, after });
    const page = response?.data?.products as Connection<CatalogProduct> | undefined;
    if (!page) throw new Error("Shopify category data unavailable");
    return page;
  }, (node) => node.id);
  return products;
}

const DETAIL_QUERY = PRODUCT_BY_HANDLE_QUERY
  .replace("images(first: 10) {", "images(first: 100) { pageInfo { hasNextPage endCursor }")
  .replace("variants(first: 20) {", "variants(first: 100) { pageInfo { hasNextPage endCursor }");
const MORE_IMAGES = `query ProductImages($handle: String!, $after: String) {
  productByHandle(handle: $handle) { images(first: 100, after: $after) {
    pageInfo { hasNextPage endCursor } edges { node { url altText } }
  } }
}`;
const MORE_VARIANTS = `query ProductVariants($handle: String!, $after: String) {
  productByHandle(handle: $handle) { variants(first: 100, after: $after) {
    pageInfo { hasNextPage endCursor }
    edges { node { id sku title image { url altText } price { amount currencyCode }
      compareAtPrice { amount currencyCode } availableForSale selectedOptions { name value } } }
  } }
}`;

export async function fetchCatalogProduct(handle: string): Promise<CatalogProduct | null> {
  const response = await storefrontApiRequest(DETAIL_QUERY, { handle });
  if (!response) throw new Error("Shopify product data unavailable");
  const product = response.data?.productByHandle as (CatalogProduct & {
    images: Connection<{ url: string; altText: string | null }>;
    variants: Connection<CatalogProduct["variants"]["edges"][number]["node"]>;
  }) | null;
  if (!product) return null;
  async function complete<T>(first: Connection<T>, query: string, field: "images" | "variants", id: (node: T) => string) {
    return collectPages<T>(async (after) => {
      if (after === null) return first;
      const next = await storefrontApiRequest(query, { handle, after });
      const page = next?.data?.productByHandle?.[field] as Connection<T> | undefined;
      if (!page) throw new Error("Shopify product page unavailable");
      return page;
    }, id);
  }
  const [images, variants] = await Promise.all([
    complete(product.images, MORE_IMAGES, "images", (image) => image.url),
    complete(product.variants, MORE_VARIANTS, "variants", (variant) => variant.id),
  ]);
  return { ...product, images: { edges: images }, variants: { edges: variants } };
}