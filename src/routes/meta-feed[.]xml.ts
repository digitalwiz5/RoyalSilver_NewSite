import { createFileRoute } from "@tanstack/react-router";
import { buildFeedItems, feedXml, type FeedProduct } from "@/lib/meta-feed";
import {
  SHOPIFY_API_VERSION,
  SHOPIFY_STOREFRONT_TOKEN,
  SHOPIFY_STOREFRONT_URL,
} from "@/lib/shopify";

const FEED_QUERY = `
  query MetaFeed($after: String) {
    products(first: 100, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes {
        id handle title description productType tags
        images(first: 10) { edges { node { url } } }
        variants(first: 100) {
          edges { node {
            id sku title availableForSale
            price { amount currencyCode }
            compareAtPrice { amount currencyCode }
            image { url }
            selectedOptions { name value }
          } }
        }
      }
    }
  }
`;

/** Reads every product page; a broken page fails the whole feed so Meta keeps its last good copy. */
async function fetchAllProducts(): Promise<FeedProduct[]> {
  const products: FeedProduct[] = [];
  const cursors = new Set<string>();
  let after: string | null = null;
  for (;;) {
    const response = await fetch(SHOPIFY_STOREFRONT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query: FEED_QUERY, variables: { after } }),
    });
    if (!response.ok) throw new Error(`Shopify ${SHOPIFY_API_VERSION} returned ${response.status}`);
    const json = (await response.json()) as {
      data?: {
        products?: {
          pageInfo: { hasNextPage: boolean; endCursor: string | null };
          nodes: FeedProduct[];
        };
      };
      errors?: unknown;
    };
    const page = json.data?.products;
    if (!page || json.errors) throw new Error("Shopify catalog data unavailable");
    products.push(...page.nodes);
    if (!page.pageInfo.hasNextPage) return products;
    const next = page.pageInfo.endCursor;
    if (!next || cursors.has(next))
      throw new Error("Shopify returned an invalid pagination cursor");
    cursors.add(next);
    after = next;
  }
}

export const Route = createFileRoute("/meta-feed.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        try {
          const items = buildFeedItems(await fetchAllProducts(), origin);
          return new Response(feedXml(items, origin), {
            headers: {
              "Content-Type": "application/xml; charset=utf-8",
              "Cache-Control": "public, max-age=900",
              "X-Robots-Tag": "noindex",
            },
          });
        } catch {
          // 503 (not an empty feed) so Meta does not mark every product as deleted.
          return new Response("Catalog temporarily unavailable", {
            status: 503,
            headers: { "Retry-After": "600" },
          });
        }
      },
    },
  },
});
