import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useCartStore } from "@/stores/cartStore";
import { prettyHandle, type ShopifyProduct } from "@/lib/shopify";
import { PriceDisplay } from "@/components/PriceDisplay";

import { subtitleForHandle } from "@/lib/subtitles";
import { Loader2 } from "lucide-react";
import { MAAYAN_HANDLE, MAAYAN_IMAGES } from "@/lib/maayan";
import { MATAR_HANDLE } from "@/lib/matar";
import { OMER_HANDLE, guyImages } from "@/lib/omer";
import { mensBraceletCardCopy } from "@/lib/mens-bracelet-cards";
import { IDAN_HANDLE, IDAN_IMAGES } from "@/lib/idan";
import { SHAY_HANDLE, SHAY_SUBTITLE } from "@/lib/shay";
import { Button } from "@/components/ui/button";
import { requiresProductSelection } from "@/lib/product-presentation";
import { EITAN_HANDLE, eitanImages } from "@/lib/eitan";

const EFRAT_HANDLE = "שרשרת-כסף-925-עניבה-עם-טיפה-משובצת-באבני-זרקון";
// סט נוי — קולאז' מאושר, מוצג בשלמותו ללא חיתוך
const NOY_HANDLE = "סט-תכשיטים-זרקונים-4-חלקים";

// Card and gallery lead images always follow the Shopify media order —
// the store owner manages image order in Shopify, with no per-product code overrides.


function isInfographicImage(img: { node: { altText: string | null } }) {
  return /מדריך|טבלת|מידות|infographic|קולאז|collage|grid|6 תמונות|שישה/i.test(img.node.altText || "");
}

export function ProductCard({ product, categorySlug }: { product: ShopifyProduct; categorySlug?: string }) {
  const node = product.node;
  const variant = node.handle === "שרשרת-מגן-דוד-ה-לבן"
    ? node.variants.edges.find((edge) => edge.node.sku === "JNM1118-1")?.node
    : node.handle === EFRAT_HANDLE
      ? node.variants.edges.find((edge) => edge.node.sku === "JNW1022-3")?.node
      : node.handle === "עגיל-כסף-חישוק-משובץ-דגם-לוטוס-לבן"
        ? node.variants.edges.find((edge) => edge.node.sku === "JEW1001-1")?.node
        : node.variants.edges[0]?.node;
  const allImages = node.handle === EITAN_HANDLE ? eitanImages(node) : node.handle === IDAN_HANDLE ? IDAN_IMAGES : node.handle === MAAYAN_HANDLE ? MAAYAN_IMAGES : node.handle === OMER_HANDLE ? guyImages(node) : node.images.edges;
  const images = allImages;
  const subtitle = subtitleForHandle(node.handle);
  const isMensBraceletCard = categorySlug === "men-bracelets";
  const cardCopy = isMensBraceletCard
    ? mensBraceletCardCopy(node.title, node.variants.edges.map(({ node: item }) => item.sku), subtitle || node.description)
    : { title: node.handle === SHAY_HANDLE ? "עגילי שי" : node.title, description: node.handle === SHAY_HANDLE ? SHAY_SUBTITLE : subtitle };
  const hasPriceRange = new Set(node.variants.edges.map((v) => v.node.price.amount)).size > 1;
  const needsSelection = requiresProductSelection(node) && node.handle !== "שרשרת-מגן-דוד-ה-לבן";

  const [hover, setHover] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);

  const onAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (needsSelection) return;
    if (!variant?.availableForSale) return;
    await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });
  };

  const leadIsInfographic = node.handle === SHAY_HANDLE || node.handle === "טבעת-כסף-זרקון-ריבוע" || node.handle === NOY_HANDLE || node.handle === IDAN_HANDLE || node.handle === MAAYAN_HANDLE || node.handle === MATAR_HANDLE || (images[0] ? isInfographicImage(images[0]) : false);
  const hoverIsInfographic = node.handle === SHAY_HANDLE || node.handle === "טבעת-כסף-זרקון-ריבוע" || node.handle === NOY_HANDLE || node.handle === IDAN_HANDLE || node.handle === MAAYAN_HANDLE || node.handle === MATAR_HANDLE || (images[1] ? isInfographicImage(images[1]) : false);

  return (
    <Link
      to="/product/$handle"
      params={{ handle: prettyHandle(node.handle) }}
      className="group block"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="relative aspect-[3/4] bg-secondary overflow-hidden">
        {images[0] && (
          <img
            src={images[0].node.url}
            alt={images[0].node.altText || node.title}
            className={`absolute inset-0 w-full h-full transition-[opacity,transform] duration-[1200ms] ease-out group-hover:scale-[1.03] ${
              leadIsInfographic ? "object-contain" : "object-cover"
            }`}
            style={{ opacity: hover && images[1] ? 0 : 1 }}
          />
        )}
        {images[1] && (
          <img
            src={images[1].node.url}
            alt={node.title}
            className={`absolute inset-0 w-full h-full transition-[opacity,transform] duration-[1200ms] ease-out group-hover:scale-[1.03] ${
              hoverIsInfographic ? "object-contain" : "object-cover"
            }`}
            style={{ opacity: hover ? 1 : 0 }}
          />
        )}
        {needsSelection ? (
          <span className="absolute bottom-3 left-3 right-3 bg-background/95 text-foreground text-xs text-center py-3 opacity-0 group-hover:opacity-100 transition-opacity">{node.handle === SHAY_HANDLE ? "בחירת גודל וצבע" : "בחירת אפשרויות"}</span>
        ) : <Button
          variant="ghost"
          onClick={onAdd}
          disabled={isLoading || !variant?.availableForSale}
          className="absolute bottom-3 left-3 right-3 bg-background/95 text-foreground text-xs tracking-widest uppercase py-3 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-foreground hover:text-background disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="h-3 w-3 animate-spin mx-auto" /> : variant?.availableForSale ? "הוספה לעגלה" : "אזל מהמלאי"}
        </Button>}
      </div>
      <div className="pt-4 md:pt-5 text-center">
        <h3 className="font-serif text-[15px] md:text-lg font-normal leading-snug line-clamp-2 min-h-[2.9rem]">{cardCopy.title}</h3>
        {(cardCopy.description || isMensBraceletCard) && (
          <p className={isMensBraceletCard
            ? "mt-2 text-[13px] text-muted-foreground leading-5 line-clamp-2 h-10"
            : "mt-1 text-[13px] text-muted-foreground leading-snug"}>{cardCopy.description}</p>
        )}
        <PriceDisplay
          className={isMensBraceletCard ? "mt-3" : "mt-1"}
          amount={node.priceRange.minVariantPrice.amount}
          currencyCode={node.priceRange.minVariantPrice.currencyCode}
          compareAtAmount={node.compareAtPriceRange?.minVariantPrice.amount}
          prefix={hasPriceRange ? "החל מ־" : undefined}
        />


      </div>
    </Link>
  );
}
