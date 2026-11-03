import { createFileRoute } from "@tanstack/react-router";
import { HIDDEN_HANDLES, PRETTY_TO_REAL_HANDLE, REAL_TO_PRETTY_HANDLE } from "@/lib/handles";
import { SHAY_SOURCE_HANDLES, shaySitemapUrls } from "@/lib/shay";

const SITE_URL = "https://www.royalsilver.net";
const SHOPIFY_API_VERSION = "2025-07";
const SHOPIFY_STORE_PERMANENT_DOMAIN = "hc2k41-jj.myshopify.com";

const STATIC_PATHS = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/category/necklaces", priority: "0.9", changefreq: "daily" },
  { path: "/category/earrings", priority: "0.9", changefreq: "daily" },
  { path: "/category/rings", priority: "0.9", changefreq: "daily" },
  { path: "/category/bracelets", priority: "0.9", changefreq: "daily" },
  { path: "/category/sets", priority: "0.9", changefreq: "daily" },
  { path: "/category/men-necklaces", priority: "0.9", changefreq: "daily" },
  { path: "/category/men-bracelets", priority: "0.9", changefreq: "daily" },
  { path: "/shipping", priority: "0.5", changefreq: "monthly" },
  { path: "/returns", priority: "0.5", changefreq: "monthly" },
  { path: "/faq", priority: "0.5", changefreq: "monthly" },
  { path: "/privacy", priority: "0.3", changefreq: "yearly" },
  { path: "/terms", priority: "0.3", changefreq: "yearly" },
  { path: "/accessibility", priority: "0.3", changefreq: "yearly" },
];

const PRODUCT_HANDLES_QUERY = `
  query GetProductHandles($first: Int!) {
    products(first: $first) {
      edges { node { handle updatedAt } }
    }
  }
`;

type ProductEdge = { node: { handle: string; updatedAt: string } };

async function fetchProductHandles(): Promise<ProductEdge[]> {
  try {
    const response = await fetch(
      `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": process.env["SHOPIFY_STOREFRONT_TOKEN"] ?? "a564c7ce70db2fb2445c493004236901",
        },
        body: JSON.stringify({ query: PRODUCT_HANDLES_QUERY, variables: { first: 100 } }),
      },
    );
    if (!response.ok) return [];
    const data = (await response.json()) as { data?: { products?: { edges?: ProductEdge[] } } };
    return data.data?.products?.edges ?? [];
  } catch {
    return [];
  }
}

function isHidden(realHandle: string) {
  const pretty = REAL_TO_PRETTY_HANDLE[realHandle] ?? realHandle;
  return HIDDEN_HANDLES.has(realHandle) || HIDDEN_HANDLES.has(pretty) || HIDDEN_HANDLES.has(PRETTY_TO_REAL_HANDLE[pretty] ?? "");
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const productEdges = await fetchProductHandles();

        const productUrls = productEdges
          .map(({ node }) => node)
          .filter((p) => !isHidden(p.handle) && !SHAY_SOURCE_HANDLES.includes(p.handle))
          .map((p) => {
            const pretty = REAL_TO_PRETTY_HANDLE[p.handle] ?? p.handle;
            const url = `${SITE_URL}/product/${encodeURIComponent(pretty)}`;
            const lastmod = p.updatedAt ? p.updatedAt.slice(0, 10) : undefined;
            return { url, lastmod, priority: "0.8", changefreq: "weekly" };
          });

        const staticUrls = STATIC_PATHS.map((s) => ({ ...s, url: `${SITE_URL}${s.path}`, lastmod: undefined }));

        const shayUrls = shaySitemapUrls(productEdges.map(({ node }) => node), SITE_URL).map((u) => ({
          ...u,
          priority: "0.8",
          changefreq: "weekly",
        }));

        const allUrls = [...staticUrls, ...productUrls, ...shayUrls]
          .map(({ url, lastmod, priority, changefreq }) =>
            [
              "  <url>",
              `    <loc>${url}</loc>`,
              lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
              `    <changefreq>${changefreq}</changefreq>`,
              `    <priority>${priority}</priority>`,
              "  </url>",
            ]
              .filter(Boolean)
              .join("\n"),
          )
          .join("\n");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${allUrls}\n</urlset>`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
