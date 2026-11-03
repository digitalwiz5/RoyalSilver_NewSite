/** Guy necklace (JNM1139) — browser-safe media mapping shared by card and product page. */
export const OMER_HANDLE = "שרשרת-סטיל-לגבר-מצפן-עם-עוגן";

interface ProductMedia {
  images: { edges: { node: { url: string; altText: string | null } }[] };
  variants: { edges: { node: { sku?: string | null; image?: { url: string; altText: string | null } | null } }[] };
}

/** Keep silver/black/gold ordering, but always resolve current Shopify variant media. */
export function guyImages(product: ProductMedia) {
  const ordered = ["JNM1139-1", "JNM1139-2", "JNM1139-3"].flatMap((sku) => {
    const image = product.variants.edges.find(({ node }) => node.sku === sku)?.node.image;
    return image ? [{ node: image }] : [];
  });
  const seen = new Set<string>();
  return [...ordered, ...product.images.edges].filter(({ node }) => {
    if (seen.has(node.url)) return false;
    seen.add(node.url);
    return true;
  });
}

export function guyImageIndexForColor(product: ProductMedia, color: string) {
  const sku = ({ כסף: "JNM1139-1", שחור: "JNM1139-2", זהב: "JNM1139-3" } as Record<string, string>)[color];
  const url = product.variants.edges.find(({ node }) => node.sku === sku)?.node.image?.url;
  const index = guyImages(product).findIndex(({ node }) => node.url === url);
  return index >= 0 ? index : 0;
}

export const OMER_COLOR_IMAGE: Record<string, number> = { כסף: 0, שחור: 1, זהב: 2 };
