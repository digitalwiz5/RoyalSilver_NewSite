import ogHome from "@/assets/og-home.jpg.asset.json";

/** Canonical origin for the site. All canonical/og URLs are built from it. */
export const SITE_URL = "https://www.royalsilver.net";

/** Brand fallback share image (absolute, crawler-accessible). */
export const DEFAULT_OG_IMAGE = `${SITE_URL}${ogHome.url}`;

export function absoluteUrl(path: string) {
  return path.startsWith("http") ? path : `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  type?: "website" | "article" | "product";
  imageAlt?: string;
};

/** Builds a complete, unique set of title / description / OG / Twitter tags. */
export function pageMeta({
  title,
  description,
  path,
  image,
  type = "website",
  imageAlt,
}: PageMetaInput) {
  const url = absoluteUrl(path);
  const img = image ? absoluteUrl(image) : DEFAULT_OG_IMAGE;
  return [
    { title },
    { name: "description", content: description },
    { property: "og:site_name", content: "Royal Silver" },
    { property: "og:locale", content: "he_IL" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: type },
    { property: "og:url", content: url },
    { property: "og:image", content: img },
    { property: "og:image:secure_url", content: img },
    { property: "og:image:alt", content: imageAlt ?? title },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: img },
    { name: "twitter:image:alt", content: imageAlt ?? title },
  ];
}

export function canonical(path: string) {
  return [{ rel: "canonical" as const, href: absoluteUrl(path) }];
}

/** BreadcrumbList JSON-LD from [{ name, path }] crumbs (home first). */
export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
