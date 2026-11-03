import silver from "@/assets/eitan-silver-black.png.asset.json";
import black from "@/assets/eitan-black.png.asset.json";
import gold from "@/assets/eitan-gold-black-new.png.asset.json";
import rose from "@/assets/eitan-rose-black.png.asset.json";
import blackHand from "@/assets/eitan-black-hand.webp.asset.json";
import portrait from "@/assets/eitan-lior-rose.webp.asset.json";
import { mergeGalleryImages } from "./product-presentation";

export const EITAN_HANDLE = "צמיד-סטיל-לגבר-טניס-בגטים";
type Image = { node: { url: string; altText: string | null } };
interface Media {
  images: { edges: Image[] };
  variants: { edges: { node: { sku?: string | null; image?: Image["node"] | null } }[] };
}
const approvedByColor: Record<string, Image[]> = {
  שחור: [
    { node: { url: black.url, altText: "צמיד איתן בגוון שחור" } },
    { node: { url: blackHand.url, altText: "צמיד איתן בגוון שחור על היד" } },
  ],
  "כסף שחור": [{ node: { url: silver.url, altText: "צמיד איתן בגוון כסוף עם זירקונים שחורים" } }],
  "זהב שחור": [{ node: { url: gold.url, altText: "צמיד איתן בגוון זהב שחור" } }],
  "רוז שחור": [
    { node: { url: rose.url, altText: "צמיד איתן בגוון רוז שחור" } },
    { node: { url: portrait.url, altText: "ליאור עונד צמיד איתן בגוון רוז שחור" } },
  ],
};
// Original Shopify catalog close-up visually matched to live JBM1216-4 product image.
const ROSE_CLOSEUP = "F49B7EFB-8810-45A8-BF5C-013DE5B1C2B9.png";
export function eitanImages(product: Media) {
  return mergeGalleryImages(product.images.edges, Object.values(approvedByColor).flat());
}
export function eitanImageIndexForColor(product: Media, color: string) {
  const images = eitanImages(product);
  const sku = ({ "כסף שחור": "JBM1216-1", שחור: "JBM1216-2", "זהב שחור": "JBM1216-3", "רוז שחור": "JBM1216-4" } as Record<string, string>)[color];
  const closeup = color === "רוז שחור" ? product.images.edges.find(({ node }) => node.url.split("?")[0].endsWith(`/${ROSE_CLOSEUP}`))?.node.url : undefined;
  const target = closeup ?? product.variants.edges.find(({ node }) => node.sku === sku)?.node.image?.url ?? approvedByColor[color]?.[0]?.node.url;
  const index = images.findIndex(({ node }) => node.url === target);
  return index >= 0 ? index : 0;
}