import silverHand from "@/assets/lior-silver-hand.png.asset.json";

export const LIOR_HANDLE = "צמיד-סטיל-לגבר-בשילוב-פלטה-קטנה";
type Image = { url: string; altText: string | null };
interface LiorMedia {
  images: { edges: { node: Image }[] };
  variants: { edges: { node: { sku?: string | null; image?: Image | null; selectedOptions: { name: string; value: string }[] } }[] };
}
// This already-uploaded Shopify photo was visually verified against IMG_2815.
// The approved original is retained only as a fallback if a supplier sync removes it.
const SILVER_HAND_FILENAME = "ADFEE098-D066-4B05-90B2-2372722DA1A9.png";
const mediaIdentity = (url: string) => url.split("?")[0];

/** Explicit approved model assignment plus current SKU-linked Shopify media. */
export function liorGalleryImages(product: LiorMedia, color: string) {
  const sku = color === "כסף" ? "JBM1215-2" : color === "שחור" ? "JBM1215-1" : undefined;
  if (!sku) return [];
  const linked = product.variants.edges
    .filter(({ node }) => node.sku === sku || (node.sku?.startsWith("JBM1215-") && node.selectedOptions.some(option => option.value === color)))
    .flatMap(({ node }) => node.image ? [{ node: node.image }] : []);
  const linkedIds = new Set(linked.map(({ node }) => mediaIdentity(node.url)));
  const currentPhotos = product.images.edges.filter(({ node }) => linkedIds.has(mediaIdentity(node.url)));
  const hand = product.images.edges.find(({ node }) => mediaIdentity(node.url).endsWith(`/${SILVER_HAND_FILENAME}`))
    ?? { node: { url: silverHand.url, altText: "צמיד ליאור בגוון כסף על יד של גבר" } };
  const seen = new Set<string>();
  return [...(color === "כסף" ? [hand] : []), ...currentPhotos, ...linked].filter(({ node }) => {
    const key = mediaIdentity(node.url);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}