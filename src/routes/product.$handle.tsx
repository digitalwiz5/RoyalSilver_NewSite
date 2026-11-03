import DOMPurify from "dompurify";
import oriModel from "@/assets/ori-necklace-model.png.asset.json";
import oriProduct from "@/assets/ori-necklace-product.png.asset.json";
import { MAAYAN_HANDLE, MAAYAN_IMAGES } from "@/lib/maayan";
import { MATAR_HANDLE, MATAR_ALTS } from "@/lib/matar";
import { OMER_HANDLE, guyImages, guyImageIndexForColor } from "@/lib/omer";
import { IDAN_HANDLE, IDAN_IMAGES } from "@/lib/idan";
import { MENS_BRACELETS } from "@/lib/mens-bracelets";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SHAY_HANDLE, SHAY_IMAGES, SHAY_SUBTITLE, SHAY_SEO, fetchShayProduct, shayImageIndex, shaySelection } from "@/lib/shay";
import { ShaySelectors } from "@/components/ShaySelectors";
import { fetchCatalogProduct } from "@/lib/shopify-catalog";
import { RelatedProducts } from "@/components/RelatedProducts";
import { exactVariant, variantGalleryImages, variantShownByPrimaryImage } from "@/lib/product-presentation";
import { setProductView } from "@/lib/meta-pixel";
import { LIOR_HANDLE, liorGalleryImages } from "@/lib/lior";
import { EITAN_HANDLE, eitanImages, eitanImageIndexForColor } from "@/lib/eitan";

const LIA_HANDLE = "טבעת-כסף-זרקון-ריבוע";
const ORI_HANDLE = "שרשרת-מגן-דוד-ה-לבן";
const ORI_WHITE_SKU = "JNM1118-1";
const EFRAT_HANDLE = "שרשרת-כסף-925-עניבה-עם-טיפה-משובצת-באבני-זרקון";
const EFRAT_HIDDEN_SKUS = new Set(["JNW1022-2"]);
const EFRAT_HIDDEN_COLORS = new Set(["שחור"]);
// Green leaf drop earrings: only the green variant (JEW1001-1) is offered for now;
// the white variant stays untouched in Shopify and is hidden from the storefront.
const LOTUS_HANDLE = "עגיל-כסף-חישוק-משובץ-דגם-לוטוס-לבן";
const LOTUS_HIDDEN_SKUS = new Set(["JEW1001-2"]);
const LOTUS_HIDDEN_COLORS = new Set(["לבן"]);
const LOTUS_GREEN_IMAGES = [
  { node: { url: "https://cdn.shopify.com/s/files/1/0849/2086/0893/files/99EA752F-A7A4-40A8-B468-4EA56630CE08.png?v=1793364622", altText: "עגילי כסף תלויים עם זירקונים ירוקים על רקע בד פשתן" } },
  { node: { url: "https://cdn.shopify.com/s/files/1/0849/2086/0893/files/F0FD3758-2CD4-4EED-97F6-291711C1BB36.png?v=1793364622", altText: "עגיל כסף תלוי עם זירקונים ירוקים על האוזן" } },
];
const VARIANT_IMAGES: Record<string, Record<string, { url: string; alt: string }[]>> = {
  // Neta: both Shopify variants link to the silver image, so the colour mapping
  // points at the live Shopify media files directly.
  "leaf-shine-עגילי-חישוק-עלה-חלקים": {
    כסף: [
      { url: "https://cdn.shopify.com/s/files/1/0849/2086/0893/files/IMG_2785.png?v=1793352579", alt: "עגילי נטע בגוון כסף על רקע בד פשתן" },
      { url: "https://cdn.shopify.com/s/files/1/0849/2086/0893/files/IMG_2786.png?v=1793352579", alt: "עגילי נטע בגוון כסף על האוזן" },
    ],
    זהב: [
      { url: "https://cdn.shopify.com/s/files/1/0849/2086/0893/files/IMG_2784.png?v=1793352579", alt: "עגילי נטע בגוון זהב על רקע בד פשתן" },
      { url: "https://cdn.shopify.com/s/files/1/0849/2086/0893/files/IMG_2787.png?v=1793352579", alt: "עגילי נטע בגוון זהב על האוזן" },
    ],
  },
  // Efrat: all Shopify variants link to the same image, so the colour mapping
  // points at the live Shopify media files directly.
  [EFRAT_HANDLE]: {
    כחול: [
      { url: "https://cdn.shopify.com/s/files/1/0849/2086/0893/files/ABBE6B59-EE84-4166-A5DC-28036A716100_3e4f3e06-776e-46bc-90df-d68645d613dd.jpg", alt: "שרשרת אפרת עם טיפה כחולה משובצת זירקונים על רקע פשתן" },
      { url: "https://cdn.shopify.com/s/files/1/0849/2086/0893/files/2E5A7108-4C70-4ED6-A8C5-5868811E5F02.png", alt: "דוגמנית עונדת את שרשרת אפרת עם הטיפה הכחולה" },
    ],
    ירוק: [
      { url: "https://cdn.shopify.com/s/files/1/0849/2086/0893/files/ABBE6B59-EE84-4166-A5DC-28036A716100.jpg", alt: "שרשרת אפרת עם טיפה ירוקה משובצת זירקונים על רקע פשתן" },
    ],
    לבן: [
      { url: "https://cdn.shopify.com/s/files/1/0849/2086/0893/files/2C581F33-743C-4F6F-BD4D-0408B3E0FB62.png", alt: "שרשרת אפרת עם טיפה לבנה שקופה משובצת זירקונים על רקע פשתן" },
    ],
  },
};
import { HOME_ONLY_HANDLES } from "@/lib/handles";
import { pageMeta, canonical, breadcrumbLd, absoluteUrl } from "@/lib/seo";
import { createFileRoute, Link, useRouter, redirect, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo, useRef, useEffect, type ReactNode } from "react";
import { PriceDisplay } from "@/components/PriceDisplay";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ChevronLeft,
  Truck,
  RefreshCw,
  Shield,
  Sparkles,
  Gem,
  Gift,
  Lock,
  Droplets,
  Shell,

} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  storefrontApiRequest,
  PRODUCT_BY_HANDLE_QUERY,
  formatPrice,
  realHandle,
  REAL_TO_PRETTY_HANDLE,
  isHiddenHandle,
  formatSizeValue,
} from "@/lib/shopify";
import { SUBTITLES } from "@/lib/subtitles";
import { useCartStore } from "@/stores/cartStore";
import { useCartSync } from "@/hooks/useCartSync";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

const SEO_OVERRIDES: Record<string, { title: string; description: string }> = {
  [SHAY_HANDLE]: SHAY_SEO,
  "טבעת-ליה": {
    title: "טבעת ליה – טבעת כסף 925 עם זרקון מרובע | Royal Silver",
    description: "גלי את טבעת ליה מבית Royal Silver – טבעת כסף 925 בעיצוב סוליטר עדין, עם אבן זרקון מרובעת ונוצצת. תכשיט קלאסי לכל אירוע.",
  },
  "טבעת-חן-לב": {
    title: "טבעת חן לב – טבעת לב מכסף 925 | Royal Silver",
    description: "הכירי את טבעת חן לב מבית Royal Silver: טבעת כסף 925 בעיצוב לב רומנטי, משובצת אבני זירקון נוצצות. תכשיט עדין ומיוחד לכל יום ולמתנה.",
  },
  "סט-נוי": {
    title: "סט נוי – שרשרת, עגילים וצמיד | Royal Silver",
    description: "מארז יוקרתי הכולל שרשרת, צמיד ועגילים תואמים, משובצים באבנים לבנות סינתטיות המדמות יהלומים בגימור יוקרתי.",
  },
  "טבעת-נוגה": {
    title: "טבעת נוגה – טבעת כסף 925 עם 7 זרקונים | Royal Silver",
    description: "הכירי את טבעת נוגה מבית Royal Silver: טבעת כסף סטרלינג 925 עם שבע אבני זרקון נוצצות. עיצוב עדין, אלגנטי ועל־זמני.",
  },
  "צמיד-סטיל-לגבר-בשילוב-פלטה-קטנה": {
    title: "צמיד ליאור לגבר – צמיד סטיל שחור או כסף | Royal Silver",
    description: "צמיד ליאור מבית Royal Silver – צמיד פלדת אל־חלד לגבר בעיצוב מודרני ונקי, באורך 19+3 ס״מ ובבחירה בין שחור לכסף.",
  },
  "צמיד-רון": {
    title: "צמיד רון לגבר – צמיד סטיל עם פלטה משובצת זירקון | Royal Silver",
    description: "צמיד רון של Royal Silver – צמיד סטיל לגבר עם חוליות מתכת ופלטה מרכזית משובצת אבן זירקון קטנה. אורך 19+3 ס״מ, בשחור/כסף, זהב/כסף או כסף.",
  },
  "צמיד-דים": {
    title: "צמיד דים לגבר – צמיד סטיל יוקרתי | Royal Silver",
    description: "צמיד דים של Royal Silver – צמיד פלדת אל־חלד לגבר בעיצוב חוליות מודרני ויוקרתי. אורך 20.5 ס״מ עם אפשרות התאמה ל־19.5 ס״מ.",
  },
  "שרשרת-עילי": {
    title: "שרשרת עילי לגבר עם תליון חמסה | Royal Silver",
    description: "שרשרת עילי לגבר עם תליון חמסה חלול בעיצוב נקי ומודרני. תכשיט עם משמעות ונוכחות עדינה מבית Royal Silver.",
  },
  "שרשרת-גיא": {
    title: "שרשרת גיא – מצפן ועוגן לגבר | Royal Silver",
    description: "שרשרת לגבר עם תליון מצפן ועוגן, בעיצוב בעל נוכחות. זמינה בכסף, שחור וזהב. אורך 50 ס״מ + 7 ס״מ הארכה. משלוח עד הבית ב־29.90 ₪.",
  },
  "שרשרת-מטר": {
    title: "שרשרת מטר – שרשרת כפולה מכסף 925 עם טיפות שחורות | Royal Silver",
    description: "שרשרת מטר מכסף 925 בשתי שכבות בסגנון עניבה עם זירקונים שחורים בצורת טיפה. משלוח עד הבית בלבד ב־29.90 ₪, תוך 2–5 ימי עסקים.",
  },
  "שרשרת-מעיין": {
    title: "שרשרת מעיין – שרשרת כפולה מכסף 925 עם טיפות ירוקות | Royal Silver",
    description: "שרשרת מעיין מכסף 925 בשתי שכבות עם שלוש טיפות ירוקות וסיומת משתלשלת. משלוח עד הבית בלבד ב־29.90 ₪, תוך 2–5 ימי עסקים.",
  },
  "שרשרת-ליבי": {
    title: "שרשרת ליבי – שרשרת לב כפול בגוון כסף | Royal Silver",
    description: "שרשרת ליבי מבית Royal Silver – שרשרת עדינה עם תליון לב כפול, אבן מרכזית נוצצת ושיבוץ אבנים אלגנטי. מתנה רומנטית ומלאת משמעות.",
  },
  "שרשרת-תום": {
    title: "שרשרת תום – מגן דוד קטן לבנים ולבנות | Royal Silver",
    description:
      "שרשרת תום עם תליון מגן דוד קטן ועדין בגוון כסוף. שרשרת קצרה המתאימה במיוחד לילדים ולנוער, לבנים ולבנות. מתנה עם משמעות מבית Royal Silver.",
  },
  "צמיד-איתן": {
    title: "צמיד איתן – צמיד טניס לגבר | Royal Silver",
    description:
      "צמיד איתן לגבר מסטיינלס סטיל, בשיבוץ זירקונים שחורים מלבניים ובארבעה גוונים לבחירה.",
  },
  "שרשרת-אורי": {
    title: "שרשרת אורי – מגן דוד משובץ עם האות ה׳ | Royal Silver",
    description:
      "שרשרת אורי לגבר עם תליון מגן דוד משובץ והאות ה׳ במרכזו. עיצוב בעל משמעות בגוון לבן, לענידה יומיומית או כמתנה.",
  },
  "טבעת-ליאור": {
    title: "טבעת ליאור | טבעת אירוסין יוקרתית מכסף 925 | Royal Silver",
    description:
      "טבעת ליאור היא טבעת אירוסין יוקרתית מכסף סטרלינג 925 בשיבוץ אבן מואסנייט מרהיבה. משלוח מהיר ואחריות על כל הזמנה.",
  },
  "עגילי-אמה": {
    title: "עגילי אמה | מוסנייט כסף 925 בציפוי זהב 18K",
    description:
      "עגילי אמה – עגילי סוליטר מוסנייט מכסף 925 בציפוי זהב 18K. עגילים יוקרתיים לעור רגיש, באריזת מתנה מפנקת. מתנה לאישה שאוהבת אלגנטיות.",
  },
  "shira-bracelet": {
    title: "צמיד שירה מכסף 925 בציפוי זהב | Royal Silver",
    description:
      "הכירי את צמיד שירה של Royal Silver: צמיד כסף 925 בציפוי זהב, עם שרשרת עדינה וזוגות אבנים נוצצות. גלי את הפרטים והזמיני אונליין.",
  },
  "ella-bracelet": {
    title: "צמיד אלה – צמיד פנינים בגוון כסף | Royal Silver",
    description:
      "הכירי את צמיד אלה מבית Royal Silver: פנינים מלאכותיות לבנות, חרוזים בגוון כסף ותליון נוצץ בעיצוב עדין ליום־יום ולרגעים חגיגיים.",
  },
  "avigail-bracelet": {
    title: "צמיד אביגיל בגוון זהב | Royal Silver",
    description:
      "הכירי את צמיד אביגיל מבית Royal Silver: צמיד פליז עדין בגוון זהב עם אבן דקורטיבית בצורת מרקיזה. 179 ₪ ומשלוח עד הבית ב־29.90 ₪.",
  },
  "yasmin-bracelet": {
    title: "צמיד יסמין – צמיד עלים משובץ | Royal Silver",
    description:
      "צמיד יסמין בעיצוב ענפים ועלים עם אבנים שקופות מנצנצות. גווני כסף וזהב, 169 ₪ לצמיד ומשלוח עד הבית ב־29.90 ₪.",
  },
  "עגילי-עדי": {
    title: "עגילי עדי – חישוקים קטנים מכסף סטרלינג 925 | Royal Silver",
    description:
      "עגילי עדי – חישוקים קטנים ועדינים מכסף סטרלינג 925, בשיבוץ אבנים מנצנצות בחלקם הקדמי. קוטר 15 מ״מ, מתנה אלגנטית לכל יום.",
  },
  "צמיד-עינת": {
    title: "צמיד עינת בגוון זהב עם זירקון | Royal Silver",
    description:
      "הכירי את צמיד עינת של Royal Silver: צמיד כסף סטרלינג 925 בגוון זהב, עם זירקון בחיתוך מרקיזה ושרשרת עדינה. נגיעה אלגנטית לכל יום.",
  },
};

/** Merged/renamed products — old URLs permanently point to the new page. */
const HANDLE_REDIRECTS: Record<string, string> = {
  "lia-silver-princess-ring": "טבעת-ליה",
  // the slug was typed with the wrong model name; only חן לב is correct
  "mia-heart-ring": "טבעת-חן-לב",
  "טבעת-נועה-טבעת-נצח-בציפוי-זהב-משובצת-זרקונים": "טבעת-נועה",
  "טבעת-כסף-925-דקה-עם-זירקוניה-מבריקה": "טבעת-נועה",
  // every legacy Shopify handle → its pretty, up-to-date slug
  ...REAL_TO_PRETTY_HANDLE,
};


/** Builds a 140–160 char meta description that ends on a whole word. */
function trimToMeta(text: string) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= 158) return clean;
  const cut = clean.slice(0, 158);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 120 ? cut.slice(0, lastSpace) : cut).replace(/[,.\u05be\-–]$/, "")}…`;
}



export const Route = createFileRoute("/product/$handle")({
  beforeLoad: ({ params }) => {
    const handle = decodeURIComponent(params.handle);
    if (isHiddenHandle(handle) || isHiddenHandle(realHandle(handle))) {
      throw notFound();
    }
    const target = HANDLE_REDIRECTS[handle];
    if (target) {
      throw redirect({ to: "/product/$handle", params: { handle: target }, replace: true });
    }
  },
  loader: async ({ params }) => {
    try {
      const handle = decodeURIComponent(params.handle);
      const p = handle === SHAY_HANDLE ? await fetchShayProduct() : await fetchCatalogProduct(realHandle(handle));
      if (!p) return null;
      const variants = (p.variants?.edges ?? []) as { node: { availableForSale: boolean } }[];
      return {
        title: p.title as string,
        description: trimToMeta(String(p.description ?? "")),
        image: (p.images?.edges?.[0]?.node?.url as string | undefined) ?? null,
        price: (p.priceRange?.minVariantPrice?.amount as string | undefined) ?? null,
        currency: (p.priceRange?.minVariantPrice?.currencyCode as string | undefined) ?? "ILS",
        available: variants.some((v) => v.node.availableForSale),
      };
    } catch {
      return null;
    }
  },
  head: ({ params, loaderData }) => {
    const handle = decodeURIComponent(params.handle);
    const override = SEO_OVERRIDES[REAL_TO_PRETTY_HANDLE[realHandle(handle)] ?? handle];
    const name = loaderData?.title ?? handle.replace(/-/g, " ");
    const title = override?.title ?? `${name} | Royal Silver`;
    const description =
      override?.description ??
      (loaderData?.description ||
        `${name} מקולקציית Royal Silver. משלוח עד הבית ב־29.90 ₪ ו־14 יום להחזרה.`);
    const image =
      realHandle(handle) === IDAN_HANDLE
        ? absoluteUrl(IDAN_IMAGES[0].node.url)
      : handle === "טבעת-סתיו"
        ? "https://www.royalsilver.net/og-stav-ring.png"
        : loaderData?.image;
    const path = `/product/${encodeURIComponent(handle)}`;
    const scripts: { type: string; children: string }[] = [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbLd([
            { name: "דף הבית", path: "/" },
            { name, path },
          ]),
        ),
      },
    ];
    if (loaderData?.price) {
      scripts.push({
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name,
          description,
          ...(image ? { image: [image] } : {}),
          brand: { "@type": "Brand", name: "Royal Silver" },
          offers: {
            "@type": "Offer",
            url: absoluteUrl(path),
            price: Number(loaderData.price).toFixed(2),
            priceCurrency: loaderData.currency ?? "ILS",
            availability: loaderData.available
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          },
        }),
      });
    }
    return {
      meta: pageMeta({
        title,
        description,
        path,
        image: image ?? null,
        type: "product",
        imageAlt: name,
      }),
      links: canonical(path),
      scripts,
    };
  },



  component: ProductPage,
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    console.error("Product page error:", error);
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-6">
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            אירעה שגיאה בטעינת המוצר. נסי שוב מאוחר יותר.
          </p>
          <Button onClick={() => { router.invalidate(); reset(); }}>נסי שוב</Button>
        </div>
      </div>
    );
  },
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center">
      <Link to="/" className="underline">חזרה לחנות</Link>
    </div>
  ),
});

// Hebrew/English color name → CSS color mapping for swatches
const COLOR_MAP: Record<string, string> = {
  זהב: "#d4af37",
  כסף: "#c0c0c0",
  "כסף 925": "#c9ccce",
  "ציפוי זהב": "#d4af37",
  "ציפוי זהב 18k": "#d4af37",
  "ציפוי זהב 18K": "#d4af37",
  "רוז גולד": "#b76e79",
  ורוד: "#f4c2c2",
  שחור: "#0a0a0a",
  לבן: "#fafafa",
  אדום: "#c0392b",
  ירוק: "#2e7d32",
  כחול: "#1e3a8a",
  סגול: "#7e57c2",
  טורקיז: "#40e0d0",
  חום: "#8b5a2b",
  שמפניה: "#f7e7ce",
  ברונזה: "#cd7f32",
  gold: "#d4af37",
  silver: "#c0c0c0",
  "rose gold": "#b76e79",
  black: "#0a0a0a",
  white: "#fafafa",
  "כסף שחור": "#c0c0c0",
  "זהב שחור": "#d4af37",
  "רוז שחור": "#b76e79",
};

const EITAN_COLOR_LABELS: Record<string, string> = {
  "כסף שחור": "כסוף",
  שחור: "שחור",
  "זהב שחור": "זהב",
  "רוז שחור": "רוז גולד",
};

function colorFor(value: string) {
  return COLOR_MAP[value.trim().toLowerCase()] || COLOR_MAP[value.trim()] || "#e8e4dd";
}

function isColorOption(name: string) {
  const n = name.toLowerCase();
  return n.includes("צבע") || n.includes("color") || n.includes("colour");
}

function isSizeOption(name: string) {
  const n = name.toLowerCase();
  return n.includes("מידה") || n.includes("גודל") || n.includes("size");
}

interface Variant {
  id: string;
  image?: { url: string; altText: string | null } | null;
  sku?: string | null;
  title: string;
  price: { amount: string; currencyCode: string };
  compareAtPrice?: { amount: string; currencyCode: string } | null;
  availableForSale: boolean;
  selectedOptions: { name: string; value: string }[];
}

const SECTION_EMOJI = /(📋|❤️|📦|✨|💎|✅|🎁)/gu;

/** Shopify strips line breaks from plain-text descriptions — rebuild them. */
export function normalizeDescription(raw: string) {
  let t = (raw || "").replace(/\r/g, "");
  // break before section headings
  t = t.replace(SECTION_EMOJI, "\n\n$1");
  // break before bullets
  t = t.replace(/\s*([•✔])\s*/g, "\n$1 ");
  // one sentence per line (Hebrew/Latin sentence enders)
  t = t.replace(/([.!?])\s+(?=[^\s])/g, "$1\n");
  return t
    .split("\n")
    .map((l) => l.trim())
    .filter((l, i, arr) => l !== "" || arr[i - 1] !== "")
    .join("\n")
    .trim();
}

/** Renders a plain-text description with headings, bullets and breathing room. */
function RichDescription({ text }: { text: string }) {
  const lines = normalizeDescription(text).split("\n").map((l) => l.trim());
  const blocks: ReactNode[] = [];
  let bullets: string[] = [];

  const flush = (key: string) => {
    if (!bullets.length) return;
    blocks.push(
      <ul key={key} className="space-y-2 mb-6">
        {bullets.map((b, i) => (
          <li key={i} className="flex gap-2.5 text-foreground/80 leading-relaxed">
            <span className="mt-[0.55rem] h-1 w-1 shrink-0 rounded-full bg-foreground/40" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    );
    bullets = [];
  };

  lines.forEach((line, i) => {
    if (!line) {
      flush(`u${i}`);
      return;
    }
    if (/^[•✔\-*]/.test(line)) {
      bullets.push(line.replace(/^[•✔\-*]\s*/, ""));
      return;
    }
    flush(`u${i}`);
    // Heading: short line starting with an emoji / symbol
    if (/^[^\p{L}\p{N}]/u.test(line) && /\p{L}/u.test(line) && line.length < 40) {
      blocks.push(
        <h3
          key={`h${i}`}
          className="text-sm tracking-widest uppercase mt-8 first:mt-0 mb-3 pb-2 border-b border-border"
        >
          {line}
        </h3>
      );
      return;
    }
    blocks.push(
      <p key={`p${i}`} className="text-foreground/80 leading-[1.9] mb-4">
        {line}
      </p>
    );
  });
  flush("u-end");

  return <div>{blocks}</div>;
}

/** Luxury-styled renderer for authored Shopify HTML descriptions. */
function LuxuryHtml({ html }: { html: string }) {
  return (
    <div
      className="
        [&_h3]:font-serif [&_h3]:italic [&_h3]:text-xl [&_h3]:md:text-2xl
        [&_h3]:mt-16 [&_h3]:md:mt-20 [&_h3]:first:mt-0 [&_h3]:mb-6 [&_h3]:pb-4
        [&_h3]:border-b [&_h3]:border-border
        [&_p]:text-[15px] [&_p]:md:text-base [&_p]:text-foreground/75
        [&_p]:leading-[2.1] [&_p]:mb-6 [&_p]:max-w-[46ch] [&_p]:md:max-w-[52ch]
        [&_ul]:space-y-4 [&_ul]:mb-8 [&_ul]:max-w-[46ch] [&_ul]:md:max-w-[52ch]
        [&_li]:relative [&_li]:pr-6 [&_li]:text-[15px] [&_li]:text-foreground/75
        [&_li]:leading-[1.85]
        [&_li]:before:absolute [&_li]:before:right-0 [&_li]:before:top-[0.75em]
        [&_li]:before:h-1 [&_li]:before:w-1 [&_li]:before:rounded-full
        [&_li]:before:bg-foreground/30
        [&_table]:w-full [&_table]:text-sm [&_table]:border-collapse
        [&_table]:max-w-[46ch] [&_table]:md:max-w-[52ch] [&_table]:mb-8
        [&_td]:py-4 [&_td]:border-b [&_td]:border-border/60 [&_td]:align-top
        [&_td:first-child]:w-32 [&_td:first-child]:md:w-40
        [&_td:first-child]:text-muted-foreground [&_td:first-child]:tracking-wide
        [&_strong]:font-normal [&_strong]:text-foreground
      "
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(html, { USE_PROFILES: { html: true }, FORBID_TAGS: ["style", "form", "input", "button"], FORBID_ATTR: ["style"] }),
      }}
    />
  );
}

function ProductPage() {
  useCartSync();
  const { handle } = Route.useParams();
  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);
  const [imgIdx, setImgIdx] = useState(0);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [imageFit, setImageFit] = useState<Record<number, "contain" | "cover">>({});
  const galleryTouchStartX = useRef<number | null>(null);
  // Callback-style ref in state: the product block mounts after async data loads, so observe once it exists.
  const [ctaEl, setCtaEl] = useState<HTMLDivElement | null>(null);
  const [stickyOn, setStickyOn] = useState(false);
  useEffect(() => {
    if (!ctaEl) return;
    const update = () => setStickyOn(ctaEl.getBoundingClientRect().bottom < 0); // setState bails out when unchanged
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, [ctaEl]);

  const { data, isLoading: loadingProduct } = useQuery({
    queryKey: ["product", handle],
    queryFn: async () => {
      if (handle === SHAY_HANDLE) return fetchShayProduct();
      return fetchCatalogProduct(realHandle(handle));
    },
  });

  const visibleVariantEdges = useMemo(() => {
    const edges = (data?.variants.edges ?? []) as { node: Variant }[];
    return data?.handle === ORI_HANDLE
      ? edges.filter((edge) => edge.node.sku === ORI_WHITE_SKU)
      : data?.handle === EFRAT_HANDLE
        ? edges.filter((edge) => !EFRAT_HIDDEN_SKUS.has(edge.node.sku ?? ""))
        : data?.handle === LOTUS_HANDLE
          ? edges.filter((edge) => !LOTUS_HIDDEN_SKUS.has(edge.node.sku ?? ""))
          : edges;
  }, [data]);

  // Initialize default selected options from the first storefront-visible variant.
  const firstVariant: Variant | undefined = visibleVariantEdges[0]?.node;
  const sizeOptionName: string | undefined = (data?.options || []).find(
    (o: { name: string; values: string[] }) => (isSizeOption(o.name) || ((data?.handle === "טבעת-כסף-לב" || data?.handle === LIA_HANDLE) && o.name === "מידת-הטבעת")) && o.values.length > 1
  )?.name;
  const defaults = useMemo(() => {
    const d: Record<string, string> = {};
    if (data?.handle === SHAY_HANDLE) return d;
    firstVariant?.selectedOptions.forEach((o) => {
      if (o.name !== sizeOptionName) d[o.name] = o.value;
    });
    // Only a unique Shopify variant/image relationship can identify the lead colour.
    const leadVariant = data ? variantShownByPrimaryImage(data) : undefined;
    const colorOpt = (data?.options || []).find(
      (o: { name: string; values: string[] }) => isColorOption(o.name) && o.values.length > 1
    );
    if (colorOpt && leadVariant) {
      const match = leadVariant.selectedOptions.find((option) => option.name === colorOpt.name);
      if (match) d[colorOpt.name] = match.value;
    }
    if (data?.handle === EITAN_HANDLE && colorOpt?.values.includes("שחור")) {
      const blackVariant = data.variants.edges.find(
        (edge: { node: Variant }) =>
          edge.node.availableForSale &&
          edge.node.selectedOptions.some((option) => option.name === colorOpt.name && option.value === "שחור"),
      );
      if (blackVariant) d[colorOpt.name] = "שחור";
    }
    if (data?.handle === EFRAT_HANDLE && colorOpt?.values.includes("כחול")) d[colorOpt.name] = "כחול";
    return d;
  }, [firstVariant, sizeOptionName, data]);


  const currentSelected = { ...defaults, ...selected };

  // Find matching variant based on selection
  const matchedVariant: Variant | undefined = useMemo(() => {
    if (!data) return undefined;
    return exactVariant(visibleVariantEdges.map((edge) => edge.node), currentSelected);
  }, [data, currentSelected, visibleVariantEdges]);

  useEffect(() => {
    if (!data) return;
    const item = data.variants.edges[0]?.node;
    if (!item) return;
    return setProductView([{ variantId: item.id, price: item.price, quantity: 1 }]);
  }, [data]);

  if (loadingProduct) {
    return (
      <div dir="rtl" className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="animate-spin" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div dir="rtl" className="min-h-screen bg-background">
        <Header />
        <div className="text-center py-32">
          <p className="font-serif text-2xl italic mb-4">המוצר לא נמצא</p>
          <Link to="/" className="underline">חזרה לחנות</Link>
        </div>
      </div>
    );
  }

  const options: { name: string; values: string[] }[] = data.handle === ORI_HANDLE
    ? (data.options || []).map((option: { name: string; values: string[] }) => ({
        ...option,
        values: option.values.filter((value) => value === "לבן"),
      }))
    : data.handle === EFRAT_HANDLE
      ? (data.options || []).map((option: { name: string; values: string[] }) => ({
          ...option,
          values: option.values.filter((value) => !EFRAT_HIDDEN_COLORS.has(value)),
        }))
      : data.handle === LOTUS_HANDLE
        ? (data.options || []).map((option: { name: string; values: string[] }) => ({
            ...option,
            values: option.values.filter((value) => !LOTUS_HIDDEN_COLORS.has(value)),
          }))
        : data.options || [];

  // Fallback variant ignores the (mandatory) size choice so the price still reflects the colour.
  const partialVariant: Variant | undefined = visibleVariantEdges
    .map((e: { node: Variant }) => e.node)
    .find((v: Variant) =>
      v.selectedOptions.every(
        (o) => o.name === sizeOptionName || currentSelected[o.name] === o.value
      )
    );
  const isShay = data.handle === SHAY_HANDLE;
  const shayVariant = isShay ? shaySelection(data, selected["גודל האבנים"], selected["צבע"]) : undefined;
  const variant = isShay ? shayVariant || firstVariant : matchedVariant || partialVariant || firstVariant;

  // Eitan keeps every approved image visible in one gallery. Other products continue
  // to follow their selected-colour image mapping.
  const colorOptionName = options.find((o) => isColorOption(o.name) && o.values.length > 1)?.name;
  const selectedColor = colorOptionName ? currentSelected[colorOptionName] : undefined;
  const allImages = data.images.edges as { node: { url: string; altText: string | null } }[];
  // The gallery follows the Shopify media order; selecting a colour leads with that variant's image.
  const baseColorImages = Object.keys(selected).length > 0
    ? variantGalleryImages(data, matchedVariant || partialVariant)
    : allImages;
  const explicitImages = selectedColor ? VARIANT_IMAGES[realHandle(handle)]?.[selectedColor] : undefined;
  const colorImages = explicitImages?.length
    ? explicitImages.map((image) => ({ node: { url: image.url, altText: image.alt } }))
    : baseColorImages;
  const oriImages = [
    { node: { url: oriModel.url, altText: "דוגמן עונד את שרשרת אורי על רקע שנהב" } },
    { node: { url: oriProduct.url, altText: "שרשרת אורי עם מגן דוד משובץ והאות ה׳ בגוון לבן" } },
  ];
  const images = isShay ? SHAY_IMAGES : data.handle === LOTUS_HANDLE
    ? LOTUS_GREEN_IMAGES
    : data.handle === LIOR_HANDLE
      ? liorGalleryImages(data, selectedColor ?? "שחור")
    : data.handle === EITAN_HANDLE
    ? eitanImages(data)
    : data.handle === IDAN_HANDLE
      ? IDAN_IMAGES
    : data.handle === ORI_HANDLE
      ? oriImages
    : data.handle === MAAYAN_HANDLE
      ? MAAYAN_IMAGES
    : data.handle === OMER_HANDLE
      ? guyImages(data)
    : data.handle === MATAR_HANDLE
      ? allImages.map((img: { node: { url: string; altText: string | null } }, i: number) => ({ node: { url: img.node.url, altText: MATAR_ALTS[i] ?? `שרשרת מטר מכסף 925 עם טיפות שחורות – תמונה ${i + 1}` } }))
    : colorImages.length
      ? colorImages
      : allImages;
  const activeImg = Math.min(imgIdx, images.length - 1);

  const imageIndexForColor = (color: string) => {
    if (data.handle === OMER_HANDLE) return guyImageIndexForColor(data, color);
    if (data.handle === EITAN_HANDLE) return eitanImageIndexForColor(data, color);
    return 0;
  };

  const moveGallery = (direction: 1 | -1) => {
    if (images.length < 2) return;
    setImgIdx((current) => (current + direction + images.length) % images.length);
  };

  const needsSize = isShay ? !shayVariant : Boolean(sizeOptionName) && !selected[sizeOptionName as string];

  // Gallery image that shows the stone-size guide, if the product has one.
  const sizeGuideIdx = images.findIndex((e) =>
    /מדריך|מידות|טבלת|size|guide|mm|מ״מ/i.test(e.node.altText || "")
  );

  // Authored HTML descriptions get the luxury layout; legacy plain text falls back.
  const rawHtml: string = data.descriptionHtml || "";
  const isRich = /<[a-z][a-z0-9]*[\s>]/i.test(rawHtml);
  // No dedicated Shopify summary field is loaded. Keep Description exclusively
  // in the full-description area, including the opening sentence for plain text.
  const restDescription = isRich ? "" : (data.description || "").trim();

  // FAQ — נבנה לפי מאפייני המוצר
  const textForFaq = `${data.title} ${data.description || ""}`;
  const isMoissanite = /מואסנייט|מואסנייט/.test(textForFaq);
  const isSilver925 = /925/.test(textForFaq);
  const isChenHeart = data.handle === "טבעת-כסף-לב";
  const isLia = data.handle === LIA_HANDLE;
  const isInbal = data.handle === "טבעת-מוסאניט-מתכווננת-חצי-נצח-כסף-925";
  const isRing = /טבעת/.test(data.title);
  const isAdjustable = /מתכוונן|מתכווננת/.test(textForFaq);
  const isZircon = /זרקוני|זירקוני/.test(textForFaq);

  const subtitle = isShay ? SHAY_SUBTITLE : SUBTITLES[REAL_TO_PRETTY_HANDLE[data.handle] ?? data.handle] || "";

  const isShellSet = /קונכיות/.test(data.title);
  const isShirleySet = /שירלי/.test(data.title);
  const isNoySet = /סט נוי/.test(data.title);
  const isTahel = /תהל/.test(data.title);
  const displayedHtmlRest = isShirleySet
    ? rawHtml
        .replace(/חומר בסיס:\s*(?:פלדת אל[־-]חלד(?:\s*\(Stainless Steel\))?|Stainless Steel)/gi, "חומר בסיס: נחושת")
        .replace(/ציפוי:\s*ציפוי בגוון רוז[־-]גולד בתהליך Electroplating/gi, "ציפוי: בגוון זהב 14K (585)")
        .replace(/אבן מרכזית:\s*אבן סינתטית בגוון אמרלד\s*\(Simulated Emerald\)/gi, "אבן מרכזית: זירקוניה בגוון ירוק")
        .replace(/אבנים משובצות:\s*[^<]*/gi, "אבנים משובצות: זירקוניה שקופה")
        .replace(/Stainless Steel/gi, "נחושת")
        .replace(/Simulated Emerald/gi, "זירקוניה בגוון ירוק")
        .replace(/כסף\s*(?:סטרלינג\s*)?(?:S?925|925S)/gi, "")
    : rawHtml;
  // Products whose price depends on the chosen size show "starting from" until a size is picked.
  const hasPriceRange =
    new Set(
      visibleVariantEdges.map((e) => e.node.price.amount),
    ).size > 1;
  const isAdi = /עגילי עדי/.test(data.title);
  const isMoran = /מורן/.test(data.title);
  const isHomeOnly = HOME_ONLY_HANDLES.has(data.handle);
  const isStav = /סתיו/.test(data.title);
  const isEinat = /עינת/.test(data.title);
  const isEitan = data.handle === EITAN_HANDLE;
  const isLior = data.handle === LIOR_HANDLE;
  const isOri = data.handle === ORI_HANDLE;
  const isEfrat = data.handle === EFRAT_HANDLE;
  const isMaayan = data.handle === MAAYAN_HANDLE;
  const isMatar = data.handle === MATAR_HANDLE;
  const isOmer = data.handle === OMER_HANDLE;
  const isGuy = data.handle === "שרשרת-כסף-גלשן-נשוך";
  const mensBracelet = MENS_BRACELETS[data.handle];
  // Per-product label for the size selector: rings use ring size,
  // hoop earrings (e.g. עגילי רומי) use earring diameter, others use stone size.
  const isBraceletSize = /צמיד/.test(data.title);
  const sizeLabel = isBraceletSize ? "בחרי מידת צמיד" : /טבעת/.test(data.title)
    ? "בחרי מידת טבעת"
    : /עגיל/.test(data.title)
      ? "בחרי את קוטר העגיל"
      : "בחרי גודל אבן";
  const sizeHelperText = isBraceletSize ? "בחרי את המידה המתאימה לך מבין האפשרויות הזמינות." : /טבעת/.test(data.title)
    ? "בחרי את מידת הטבעת המתאימה לך – מידה מדויקת לנוחות מקסימלית."
    : /עגיל/.test(data.title)
      ? "בחרי את קוטר העגיל המתאים לסגנון שלך – ממראה עדין ויומיומי ועד למראה בולט."
      : "בחרי את גודל האבן המתאים לסגנון שלך – ממראה יומיומי ועד למראה יוקרתי ובולט.";

  const trustBadges: { icon: typeof Gem; label: string }[] = [
    ...(isShay ? [{ icon: Gem, label: "כסף סטרלינג 925" }, { icon: Sparkles, label: "חמש אבני זירקון אובליות בכל עגיל" }] : mensBracelet
      ? [
          { icon: Sparkles, label: "עיצוב נקי וגברי" },
          { icon: Gem, label: mensBracelet.extensionCm
              ? `אורך ${mensBracelet.lengthCm}+${mensBracelet.extensionCm} ס״מ`
              : `אורך ${mensBracelet.lengthCm} ס״מ • קיצור ל־${mensBracelet.shortenedLengthCm} ס״מ` },
        ]
      : isShellSet
      ? [
          { icon: Sparkles, label: "עיצוב קיצי בשכבות" },
          { icon: Shell, label: "חרוזים ואלמנטים בהשראת הים" },
        ]
      : isEitan
        ? [
            { icon: Gem, label: "זירקונים שחורים בחיתוך מלבני" },
            { icon: Droplets, label: "עמיד במים ואינו משחיר" },
          ]
      : isMatar
        ? [
            { icon: Gem, label: "כסף 925" },
            { icon: Sparkles, label: "שתי שכבות וזירקונים שחורים בצורת טיפה" },
          ]
      : isMaayan
        ? [
            { icon: Gem, label: "כסף 925" },
            { icon: Sparkles, label: "שתי שכבות ושלוש טיפות ירוקות" },
          ]
      : isEfrat
        ? [
            { icon: Gem, label: "כסף 925" },
            { icon: Sparkles, label: "טיפה צבעונית במסגרת זירקונים" },
          ]
      : isGuy
        ? [
            { icon: Gem, label: "תליון גלשן עם חריטת גל" },
            { icon: Sparkles, label: "עיצוב קטן ועדין" },
          ]
      : isOmer
        ? [
            { icon: Gem, label: "תליון מצפן עם עוגן" },
            { icon: Sparkles, label: "50 ס״מ + 7 ס״מ הארכה" },
          ]
      : isOri
        ? [
            { icon: Gem, label: "מגן דוד משובץ עם האות ה׳" },
            { icon: Sparkles, label: "גוון לבן" },
          ]
      : isShirleySet
        ? [
            { icon: Gem, label: "סט תואם — שרשרת ועגילים" },
            { icon: Sparkles, label: "גוון זהב חם וגימור מבריק" },
          ]
      : isNoySet
        ? [
            { icon: Gem, label: "סט 3 חלקים תואמים" },
            { icon: Sparkles, label: "אבנים לבנות סינתטיות המדמות יהלומים" },
          ]
        : isTahel
          ? [
              { icon: Gem, label: "כסף סטרלינג 925" },
              { icon: Sparkles, label: "אבן Moissanite סגולה בגימור Rose Gold" },
            ]
        : isAdi
          ? [
              { icon: Gem, label: "כסף סטרלינג 925" },
              { icon: Sparkles, label: "שיבוץ אבנים מנצנצות בחישוק עדין" },
            ]
          : isMoran
            ? [
                { icon: Sparkles, label: "חישוק פתוח ומתכוונן" },
                { icon: Shield, label: "אין צורך לבחור מידה" },
                { icon: Gift, label: "מגיעה באריזת מתנה של Royal Silver" },
              ]
            : isStav
              ? [
                  { icon: Gem, label: "כסף סטרלינג 925 עם חותמת S925" },
                  { icon: Sparkles, label: "חישוק פתוח ומתכוונן" },
                  { icon: Shield, label: "אין צורך לבחור מידה" },
                  { icon: Droplets, label: "עמידה במים ואינה משחירה" },
                ]
            : isEinat
          ? [
              { icon: Gem, label: "כסף סטרלינג S925 בגוון זהב" },
              { icon: Sparkles, label: "זירקון שקוף בחיתוך מרקיזה" },
            ]
            : isLia
          ? [{ icon: Gem, label: "כסף סטרלינג 925" }, { icon: Sparkles, label: "זרקון שקוף בחיתוך מרובע" }]
            : isChenHeart
          ? [
              { icon: Gem, label: "כסף סטרלינג 925" },
              { icon: Sparkles, label: "זירקון בצורת לב ושתי אבני צד" },
            ]
            : []),

    ...(isShay ? [{ icon: Gift, label: "מתנה קטנה עם הרבה משמעות" }] : []),
    { icon: Truck, label: isHomeOnly && !isLia ? "משלוח עד הבית • 2–5 ימי עסקים" : "משלוח עד הבית ב־29.90 ₪" },
    { icon: Lock, label: "תשלום מאובטח" },
  ];

  const faq: { q: string; a: string }[] = [
    ...(isShay ? [
      { q: "ממה עשויים עגילי שי?", a: "כסף סטרלינג 925, עם חמש אבני זירקון שקופות בחיתוך אובלי בכל עגיל וסגירת קליק." },
      { q: "האם האבנים הן יהלומים?", a: "לא. האבנים הן זירקונים, והגוונים זהב ורוז גולד אינם זהב מלא." },
      { q: "מה ההבדל בין שני הגדלים?", a: "3 מ״מ ו־3.5 מ״מ מתייחסים לגודל האבנים בנתוני המקור, ולא לקוטר החישוק." },
      { q: "האם הם מתאימים למתנה?", a: "כן. עגילי שי מתאימים למתנת יום הולדת, יום נישואין, מחווה רומנטית או מתנה לעצמך." },
    ] : []),
    ...(mensBracelet ? [{
      q: "מה אורך הצמיד והאם ניתן לקצר אותו?",
      a: `אורך הצמיד ${mensBracelet.lengthCm} ס״מ. ניתן לקצר ל־${mensBracelet.shortenedLengthCm} ס״מ באמצעות הסוגר הנוסף.`,
    }] : []),
    ...(isMatar ? [{ q: "ממה עשויה השרשרת?", a: "כסף 925, בשתי שכבות בסגנון עניבה עם זירקונים שחורים בצורת טיפה." }] : []),
    ...(isMaayan ? [{ q: "ממה עשויה השרשרת?", a: "כסף 925, בשתי שכבות עם שלוש טיפות ירוקות." }] : []),
    ...(isEitan
      ? [
          { q: "ממה עשוי הצמיד?", a: "מסטיינלס סטיל, בשיבוץ זירקונים שחורים." },
          { q: "האם האורך מתכוונן?", a: "כן. אורך הצמיד הוא 18 ס״מ, עם תוספת של 2 ס״מ להתאמה באמצעות חוליות הסגירה." },
          { q: "באילו גוונים אפשר לבחור?", a: "כסוף, שחור, זהב ורוז גולד, בהתאם לזמינות של כל גרסה." },
        ]
      : []),
    ...(isEfrat
      ? [
          { q: "ממה עשויה השרשרת?", a: "כסף 925, עם אבני זירקון סביב תליון הטיפה." },
          { q: "באילו צבעים אפשר לרכוש?", a: "כחול וירוק, בהתאם למלאי בפועל." },
        ]
      : []),
    ...(isGuy
      ? [
          { q: "ממה עשויה השרשרת?", a: "כסף. דרגת הכסף אינה מצוינת." },
          { q: "מה מידות התליון?", a: "1.5 × 0.5 ס״מ. אלה מידות התליון, לא אורך השרשרת." },
          { q: "מה אורך השרשרת?", a: "אורך השרשרת אינו מצוין בנתוני המוצר." },
        ]
      : []),
    ...(isOmer
      ? [
          { q: "ממה עשויה השרשרת?", a: "סטיל." },
          { q: "מה אורך השרשרת?", a: "50 ס״מ, עם שרשרת הארכה של 7 ס״מ להתאמה." },
          { q: "באילו גוונים אפשר לבחור?", a: "כסף, שחור וזהב — הגוון מתייחס לתליון, והשרשרת בגוון כסוף בכל הגרסאות. בהתאם לזמינות של כל גרסה." },
        ]
      : []),
    ...(isOri
      ? [
          { q: "ממה עשויה השרשרת?", a: "כסף, לפי תיאור המוצר שנמסר." },
          { q: "איזה גוון זמין באתר?", a: "גוון לבן בלבד, בהתאם לזמינות המלאי." },
        ]
      : []),
    ...(isStav
      ? [
          { q: "האם צריך לבחור מידה?", a: "לא. טבעת סתיו היא טבעת פתוחה ומתכווננת, ולכן ניתן להתאים אותה בעדינות לאצבע." },
          { q: "האם הטבעת עשויה כסף 925?", a: "כן. הטבעת עשויה כסף סטרלינג 925 ונושאת חותמת S925 בחלקו הפנימי של החישוק." },
          { q: "האם הטבעת עמידה במים?", a: "כן. טבעת סתיו מתאימה לענידה יומיומית, עמידה במים ואינה משחירה." },
        ]
      : []),
    ...(isChenHeart
      ? [
          { q: "ממה עשויה הטבעת?", a: "כסף סטרלינג 925 בגימור מבריק, עם זירקון שקוף בצורת לב ושתי אבני זירקון עגולות בצדדים." },
          { q: "האם האבנים הן יהלומים?", a: "לא. השיבוץ הוא של שלוש אבני זירקון שקופות." },
        ]
      : []),
    ...(isLia ? [{ q: "ממה עשויה הטבעת?", a: "כסף סטרלינג 925 עם זרקון שקוף בחיתוך מרובע – Princess Cut, בשיבוץ ארבע שיניים." }, { q: "האם האבן היא יהלום?", a: "לא. האבן היא זרקון שקוף." }] : []),
    ...(isInbal
      ? [
          { q: "ממה עשויה הטבעת?", a: "כסף סטרלינג 925 בגוון כסף, משובצת אבני מואסנייט לאורך החלק העליון." },
          { q: "האם צריך לבחור מידה?", a: "לא. טבעת ענבל היא טבעת מתכווננת, המאפשרת התאמה עדינה של ההיקף למגוון מידות אצבע." },
          { q: "האם הטבעת עמידה במים?", a: "כן. טבעת ענבל עמידה במים ואינה משחירה, באיכות ברמה הגבוהה ביותר — מתאימה לענידה יומיומית." },
        ]
      : []),
    ...(isEinat
      ? [{ q: "ממה עשוי הצמיד?", a: "כסף סטרלינג S925 בגוון זהב, משובץ זירקון שקוף בחיתוך מרקיזה." }]
      : []),
    ...(isMoissanite
      ? [{ q: "האם המואסנייט נוצץ כמו יהלום?", a: "מואסנייט מפזרת אור בעוצמה גבוהה במיוחד, ולכן הברק שלה מרשים ונראה לעין מכל זווית — נוכחות יוקרתית בכל תאורה." }]
      : []),
    ...(isMoran
      ? [{ q: "האם צריך לבחור מידה?", a: "לא. טבעת מורן מעוצבת עם חישוק פתוח ומתכוונן, המאפשר התאמה עדינה לאצבע. מומלץ להימנע מכיפוף חוזר וחזק של החישוק." }]
      : []),

    ...(isAdi
      ? [
          { q: "ממה עשויים העגילים?", a: "כסף סטרלינג 925." },
          { q: "באיזה גוון העגילים?", a: "גוון כסף." },
          { q: "מה גודל העגילים?", a: "קוטר של 15 מ״מ — חישוק קטן ועדין." },
          { q: "האם הם מתאימים כמתנה?", a: "בהחלט. העיצוב הקלאסי והאלגנטי הופך אותם למתנה נהדרת." },
        ]
      : []),
    isHomeOnly && !isLia
      ? { q: "תוך כמה זמן המשלוח מגיע?", a: "פריט זה נשלח עד הבית בלבד ב־29.90 ₪, תוך 2–5 ימי עסקים." }
      : { q: "כמה עולה המשלוח?", a: "משלוח עד הבית — 29.90 ₪ בכל סכום קנייה." },
    { q: "האם יש אחריות על המוצר?", a: "אנחנו עומדים מאחורי איכות התכשיטים שלנו. אם קיבלת מוצר פגום או שגוי — נחליף או נזכה בהתאם למדיניות האתר." },
  ];



  const handleAdd = async () => {
    if (needsSize) {
      toast.error(isShay ? "יש לבחור גודל וצבע לפני ההוספה לסל" : "יש לבחור גודל לפני ההוספה לסל");
      document.getElementById("size-selector")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const purchaseVariant = isShay ? shayVariant : matchedVariant;
    if (!purchaseVariant?.availableForSale) return;
    await addItem({
      product: { node: data },
      variantId: purchaseVariant.id,
      variantTitle: purchaseVariant.title,
      price: purchaseVariant.price,
      quantity: 1,
      selectedOptions: purchaseVariant.selectedOptions || [],
      imageUrl: images[0]?.node.url,
    });
  };

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <Header />
      {stickyOn && variant?.availableForSale && (
        <div className="md:hidden fixed bottom-0 inset-x-0 z-40 flex items-center gap-3 border-t border-border bg-background px-4 py-3" dir="rtl">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-muted-foreground">{data.title}</p>
            <p className="text-base font-medium">{formatPrice(variant.price.amount, variant.price.currencyCode)}</p>
          </div>
          <Button variant="hero" size="lg" className="shrink-0" onClick={handleAdd} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : needsSize ? "בחירת מידה" : "הוספה לסל"}
          </Button>
        </div>
      )}
      <div className="container mx-auto px-6 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ChevronLeft className="h-4 w-4 rotate-180" /> חזרה
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
          {/* GALLERY */}
          <div id="product-gallery" className="scroll-mt-24">
            <div
              className={`${isEitan || isLior || isOri || isEfrat || isMaayan || isMatar || isOmer || isGuy || isGuy ? "aspect-square" : "aspect-[3/4]"} bg-secondary overflow-hidden mb-3 touch-pan-y`}
              onTouchStart={(event) => {
                galleryTouchStartX.current = event.touches[0]?.clientX ?? null;
              }}
              onTouchEnd={(event) => {
                const startX = galleryTouchStartX.current;
                const endX = event.changedTouches[0]?.clientX;
                galleryTouchStartX.current = null;
                if (startX == null || endX == null || Math.abs(endX - startX) < 45) return;
                moveGallery(endX < startX ? 1 : -1);
              }}
            >
              {images[activeImg] && (
                <img
                  src={images[activeImg].node.url}
                  alt={images[activeImg].node.altText || data.title}
                  className={`w-full h-full ${
                    isShay || isLia || isChenHeart || isEitan || isLior || isOri || isEfrat || isMaayan || isMatar || isOmer || isGuy || isNoySet || imageFit[activeImg] === "contain" ||
                    /מדריך|טבלת|מידות|infographic|קולאז|collage|grid|6 תמונות|שישה/i.test(images[activeImg].node.altText || "")
                      ? "object-contain"
                      : "object-cover"
                  }`}
                  onLoad={(e) => {
                    const img = e.currentTarget;
                    const ratio = img.naturalWidth / img.naturalHeight;
                    // Landscape or square-ish images (e.g. multi-panel infographics)
                    // do not fill a 3:4 portrait frame; show them fully instead.
                    if (ratio > 1.05) {
                      setImageFit((prev) => ({ ...prev, [activeImg]: "contain" }));
                    }
                  }}
                />
              )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((img: { node: { url: string; altText: string | null } }, i: number) => (
                  <Button variant="ghost"
                    key={i}
                    aria-label={`תמונה ${i + 1}`}
                    onClick={() => setImgIdx(i)}
                    className={`h-auto p-0 aspect-square overflow-hidden ${
                      i === activeImg ? "ring-1 ring-foreground" : ""
                    }`}
                  >
                    <img
                      src={img.node.url}
                      alt=""
                      className={`w-full h-full ${
                        isShay || isLia || isChenHeart || isEitan || isLior || isOri || isEfrat || isMaayan || isMatar || isOmer || isGuy || isNoySet || /מדריך|טבלת|מידות|infographic|קולאז|collage|grid|6 תמונות|שישה/i.test(img.node.altText || "")
                          ? "object-contain"
                          : "object-cover"
                      }`}
                    />
                  </Button>
                ))}
              </div>
            )}
            {(isMaayan || isMatar || isOmer || isGuy) && images[activeImg] && (
              <Dialog>
                <DialogTrigger asChild><Button variant="outline" className="mt-3">הגדלת תמונה</Button></DialogTrigger>
                <DialogContent className="max-w-3xl" aria-describedby={undefined}>
                  <DialogTitle className="sr-only">{data.title} — תמונה מוגדלת</DialogTitle>
                  <img src={images[activeImg].node.url} alt={images[activeImg].node.altText ?? data.title} className="max-h-[80dvh] w-full object-contain" />
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* DETAILS */}
          <div className="md:py-4">
            <h1 className="font-serif text-3xl md:text-5xl italic mb-4 leading-tight">{data.title}</h1>

            {subtitle && (
              <p className="text-[15px] md:text-base text-foreground/70 leading-[1.9] mb-7 max-w-[42ch]">
                {subtitle}
              </p>
            )}

            {(isTahel || hasPriceRange) && sizeOptionName && !selected[sizeOptionName] ? (
              <PriceDisplay
                className="mb-2"
                size="lg"
                prefix="החל מ־"
                amount={data.priceRange.minVariantPrice.amount}
                currencyCode={data.priceRange.minVariantPrice.currencyCode}
                compareAtAmount={data.compareAtPriceRange?.minVariantPrice.amount}
              />
            ) : (
              variant && (
                <PriceDisplay
                  className="mb-2"
                  size="lg"
                  amount={variant.price.amount}
                  currencyCode={variant.price.currencyCode}
                  compareAtAmount={variant.compareAtPrice?.amount}
                />
              )
            )}

            <p className="text-xs text-muted-foreground mb-8">
              {isHomeOnly && !isLia
                ? 'המחיר כולל מע"מ • משלוח עד הבית בלבד ב־29.90 ₪ • 2–5 ימי עסקים'
                : 'המחיר כולל מע"מ • משלוח עד הבית ב־29.90 ₪'}
            </p>

            {/* TRUST BADGES */}
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mb-10 text-[13px] tracking-wide text-foreground/80">
              {trustBadges.map((b) => (
                <li key={b.label} className="flex items-center gap-2.5">
                  <b.icon aria-hidden className="h-4 w-4 shrink-0 text-foreground/60" strokeWidth={1.5} />
                  <span>{b.label}</span>
                </li>
              ))}
            </ul>


            {/* OPTION SELECTORS */}
            {isShay ? <ShaySelectors product={data} selected={selected} onChange={(selection) => {
              setSelected(selection);
              setImgIdx(shayImageIndex(selection["גודל האבנים"], selection["צבע"]));
            }} /> : options.map((opt) => {
              const isColor = isColorOption(opt.name);
              const isSize = isSizeOption(opt.name) || ((isChenHeart || isLia) && opt.name === "מידת-הטבעת");
              const sel = currentSelected[opt.name];

              if (opt.values.length <= 1) return null;

              return (
                <div key={opt.name} id={isSize ? "size-selector" : undefined} className="mb-6 scroll-mt-24">
                  <div className="flex items-baseline justify-between mb-3">
                    <p className="text-xs tracking-widest uppercase">
                      {isColor ? "בחרי צבע" : isSize ? sizeLabel : opt.name}
                      {isSize && !sel && (
                        <span className="ms-2 normal-case tracking-normal text-muted-foreground">
                          (חובה לבחור)
                        </span>
                      )}
                    </p>
                    <span className={`text-sm ${isEitan && isColor ? "font-medium text-foreground" : "text-muted-foreground"}`} dir="rtl">
                      {sel ? (isSize ? formatSizeValue(sel) : isEitan && isColor ? `נבחר להזמנה: ${EITAN_COLOR_LABELS[sel] ?? sel}` : sel) : ""}
                    </span>
                  </div>

                  {isColor ? (
                    <div className="flex flex-wrap gap-4">
                      {opt.values.map((v) => (
                        <button
                          key={v}
                          onClick={() => {
                            setSelected((s) => ({ ...s, [opt.name]: v }));
                            setImgIdx(imageIndexForColor(v));
                          }}
                          aria-label={isEitan ? EITAN_COLOR_LABELS[v] ?? v : v}
                          aria-pressed={sel === v}
                          title={isEitan ? EITAN_COLOR_LABELS[v] ?? v : v}
                          className={`flex items-center gap-2 border px-3 py-2 text-sm transition ${
                            sel === v
                              ? "border-foreground ring-1 ring-foreground ring-offset-4 ring-offset-background"
                              : "border-border hover:border-foreground/50"
                          }`}
                        >
                          <span
                            aria-hidden
                            className="h-6 w-6 rounded-full border border-border shadow-sm"
                            style={{ background: colorFor(v) }}
                          />
                          <span>{isEitan ? EITAN_COLOR_LABELS[v] ?? v : v}</span>
                        </button>
                      ))}
                    </div>
                  ) : isSize ? (
                    <div className="flex flex-wrap gap-2">
                      {opt.values.map((v) => (
                        <button
                          key={v}
                          onClick={() => setSelected((s) => ({ ...s, [opt.name]: v }))}
                          dir="rtl"
                          title={formatSizeValue(v)}
                          className={`min-w-[3rem] px-4 py-2.5 text-sm border transition whitespace-nowrap ${
                            sel === v
                              ? "border-foreground bg-foreground text-background"
                              : "border-border hover:border-foreground"
                          }`}
                        >
                          {formatSizeValue(v)}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {opt.values.map((v) => (
                        <button
                          key={v}
                          onClick={() => setSelected((s) => ({ ...s, [opt.name]: v }))}
                          className={`px-4 py-2 text-sm border transition ${
                            sel === v
                              ? "border-foreground bg-foreground text-background"
                              : "border-border hover:border-foreground"
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  )}

                  {isColor && handle === "yasmin-bracelet" && (
                    <p className="mt-3 max-w-[46ch] text-xs leading-relaxed text-muted-foreground">
                      נמכר כצמיד יחיד. בתמונות מוצגים גם שני הגוונים יחד להמחשת השילוב.
                    </p>
                  )}

                  {isSize && (
                    <div className="mt-3 space-y-2 max-w-[46ch]">
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {sizeHelperText}
                      </p>
                      {sizeGuideIdx >= 0 && <p className="text-xs leading-relaxed text-muted-foreground">
                        לא בטוחה איזה גודל לבחור? מדריך המידות שלנו יעזור לך לראות את ההבדלים.
                      </p>}
                      {sizeGuideIdx >= 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setImgIdx(sizeGuideIdx);
                            document
                              .getElementById("product-gallery")
                              ?.scrollIntoView({ behavior: "smooth", block: "center" });
                          }}
                          className="text-xs border-b border-foreground pb-0.5"
                        >
                          מדריך מידות
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            <div ref={setCtaEl}>
            <Button
              variant="hero"
              size="lg"
              className="w-full mt-2"
              onClick={handleAdd}
              disabled={isLoading || !variant?.availableForSale || (!needsSize && !matchedVariant && !isShay)}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : variant?.availableForSale ? "הוספה לסל" : "אזל מהמלאי"}
            </Button>
            </div>

            {/* TRUST BADGES */}
            <div className="grid grid-cols-2 gap-3 mt-6 text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Truck className="h-4 w-4" />
                <span>{isHomeOnly && !isLia ? "עד הבית 29.90 ₪ • 2–5 ימי עסקים" : "משלוח עד הבית ב־29.90 ₪"}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <RefreshCw className="h-4 w-4" />
                <span>14 יום להחזרה</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>תשלום מאובטח</span>
              </div>
            </div>

            {/* ACCORDIONS */}
            <Accordion type="single" collapsible className="mt-8 border-t border-border">
              {restDescription && (
                <AccordionItem value="description">
                  <AccordionTrigger className="text-sm tracking-widest uppercase">
                    תיאור מלא
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-6">
                    <RichDescription text={restDescription} />
                  </AccordionContent>
                </AccordionItem>
              )}
              <AccordionItem value="shipping">
                <AccordionTrigger className="text-sm tracking-widest uppercase">
                  משלוח והחזרות
                </AccordionTrigger>
                <AccordionContent className="text-foreground/80 leading-relaxed space-y-2">
                  {isHomeOnly ? (
                    <>
                      <p>• משלוח עד הבית בלבד — 29.90 ₪.</p>
                      {!isLia && <p>• זמן אספקה: 2–5 ימי עסקים.</p>}
                    </>
                  ) : (
                    <>
                      <p>• משלוח עד הבית — 29.90 ₪ בכל סכום קנייה.</p>
                    </>
                  )}
                  <p>• ניתן להחזיר את המוצר תוך 14 יום מקבלתו, באריזה המקורית וללא שימוש.</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="materials">
                <AccordionTrigger className="text-sm tracking-widest uppercase">
                  חומרים ואיכות
                </AccordionTrigger>
                <AccordionContent className="text-foreground/80 leading-relaxed space-y-2">
                  {isShay ? (
                    <>
                      <p>• חומר: כסף סטרלינג 925.</p>
                      <p>• אבנים: חמש אבני זירקון שקופות בחיתוך אובלי בכל עגיל, לא יהלומים.</p>
                      <p>• מידות האבנים: 3 מ״מ או 3.5 מ״מ; אלה אינן מידות קוטר החישוק.</p>
                      <p>• גוונים: כסף, זהב ורוז גולד. הגוונים אינם זהב מלא.</p>
                      <p>• סגירה: קליק.</p>
                    </>
                  ) : isLia ? (
                    <>
                      <p>• חומר: כסף סטרלינג 925.</p>
                      <p>• אבן: זרקון שקוף בחיתוך מרובע – Princess Cut.</p>
                      <p>• שיבוץ: ארבע שיניים. צבע מתכת: כסף.</p>
                    </>
                  ) : isChenHeart ? (
                    <>
                      <p>• חומר: כסף סטרלינג 925.</p>
                      <p>• אבן מרכזית: זירקון שקוף בצורת לב.</p>
                      <p>• אבני צד: שתי אבני זירקון עגולות.</p>
                      <p>• צבע: כסף. גימור: מבריק.</p>
                    </>
                  ) : isInbal ? (
                    <>
                      <p>• חומר: כסף סטרלינג 925.</p>
                      <p>• שיבוץ: אבני מואסנייט לאורך החלק העליון של הטבעת.</p>
                      <p>• גוון: כסף.</p>
                      <p>• מידה: מתכווננת — מאפשרת התאמה נוחה למגוון מידות אצבע.</p>
                      <p>• עמידה במים ואינה משחירה — איכות ברמה הגבוהה ביותר, מתאימה לענידה יומיומית.</p>
                    </>
                  ) : mensBracelet ? (
                    <>
                      <p>• עיצוב: {mensBracelet.design}</p>
                      <p>• אורך הצמיד: {mensBracelet.lengthCm} ס״מ.</p>
                      <p>• ניתן לקצר ל־{mensBracelet.shortenedLengthCm} ס״מ באמצעות הסוגר הנוסף.</p>
                    </>
                  ) : isShirleySet ? (
                    <>
                      <p>• חומר בסיס: נחושת</p>
                      <p>• ציפוי: ציפוי בגוון זהב 14K (585)</p>
                      <p>• אבן מרכזית: זירקוניה בגוון ירוק</p>
                      <p>• אבנים משובצות: זירקוניה שקופה</p>
                      <p>• גימור: מבריק ואלגנטי</p>
                    </>
                  ) : isNoySet ? (
                    <>
                      <p>• עגילים: Copper, בגימור Electroplating</p>
                      <p>• שרשרת: Copper, בגימור Electroplating</p>
                      <p>• אבנים: אבנים לבנות סינתטיות המדמות יהלומים</p>
                      <p>• הסט כולל שלושה תכשיטים תואמים: שרשרת, זוג עגילים וצמיד.</p>
                      <p>• המחיר המוצג הוא עבור הסט המלא.</p>
                    </>
                  ) : isTahel ? (
                    <>
                      <p>• חומר: כסף סטרלינג 925 (S925)</p>
                      <p>• אבן: Moissanite בגוון סגול / Violet, חיתוך עגול</p>
                      <p>• שיבוץ: 6 שיניים</p>
                      <p>• צבע וגימור המתכת: Rose Gold</p>
                      <p>• סוג: זוג עגילי סטאד</p>
                      <p>• מידות: 5 מ"מ – למראה עדין וקלאסי; 6.5 מ"מ – למראה בולט ונוכח יותר.</p>
                    </>
                  ) : isAdi ? (
                    <>
                      <p>• חומר: כסף סטרלינג 925</p>
                      <p>• סוג: עגילי חישוק קטנים ועדינים</p>
                      <p>• שיבוץ: אבנים מנצנצות בחלק הקדמי של החישוק</p>
                      <p>• קוטר: 15 מ״מ</p>
                    </>
                  ) : isEitan ? (
                    <>
                      <p>• חומר: סטיינלס סטיל — פלדת אל־חלד.</p>
                      <p>• שיבוץ: זירקונים שחורים מלבניים.</p>
                      <p>• אורך: 18 ס״מ + 2 ס״מ להתאמה.</p>
                      <p>• סגירה: סגר חוליות מתכוונן.</p>
                      <p>• אינו משחיר ועמיד במים בשימוש יומיומי.</p>
                    </>
                  ) : isMatar ? (
                    <>
                      <p>• חומר: כסף 925.</p>
                      <p>• אבנים: זירקונים שחורים בצורת טיפה.</p>
                      <p>• עיצוב: דו־שכבתי בסגנון עניבה.</p>
                    </>
                  ) : isMaayan ? (
                    <>
                      <p>• חומר: כסף 925.</p>
                      <p>• מבנה: שתי שכבות עם סיומת משתלשלת.</p>
                      <p>• תליונים: שלוש טיפות בצבע ירוק.</p>
                    </>
                  ) : isEfrat ? (
                    <>
                      <p>• חומר: כסף 925.</p>
                      <p>• סגנון: שרשרת עניבה עם תליון טיפה.</p>
                      <p>• שיבוץ: אבני זירקון.</p>
                      <p>• צבעים לרכישה: כחול וירוק, בהתאם למלאי בפועל.</p>
                    </>
                  ) : isGuy ? (
                    <>
                      <p>• חומר: כסף.</p>
                      <p>• עיצוב: תליון גלשן עם חריטת גל.</p>
                      <p>• מידות התליון: 1.5 × 0.5 ס״מ.</p>
                    </>
                  ) : isOmer ? (
                    <>
                      <p>• חומר: סטיל.</p>
                      <p>• אורך: 50 ס״מ + 7 ס״מ שרשרת הארכה.</p>
                      <p>• תליון: עגול בעיצוב מצפן ועוגן.</p>
                      <p>• גוונים: כסף, שחור וזהב.</p>
                    </>
                  ) : isOri ? (
                    <>
                      <p>• חומר: כסף, לפי תיאור המוצר שנמסר.</p>
                      <p>• עיצוב: מגן דוד משובץ עם האות ה׳.</p>
                      <p>• גוון זמין באתר: לבן.</p>
                    </>
                  ) : (
                    <>
                      {options.filter((option) => option.name !== "Title").map((option) => (
                        <p key={option.name}>• {option.name}: {option.values.join(" / ")}</p>
                      ))}
                    </>
                  )}
                </AccordionContent>
              </AccordionItem>
              {isShirleySet && (
                <AccordionItem value="product-details">
                  <AccordionTrigger className="text-sm tracking-widest uppercase">
                    פרטי המוצר
                  </AccordionTrigger>
                  <AccordionContent className="text-foreground/80 leading-relaxed space-y-2">
                    <p>• הסט כולל: שרשרת + זוג עגילים תואמים</p>
                    <p>• גוון: זהב חם</p>
                    <p>• אבן מרכזית: זירקוניה בגוון ירוק</p>
                    <p>• אבנים משובצות: זירקוניה שקופה</p>
                    <p>• חומר בסיס: נחושת</p>
                    <p>• ציפוי: בגוון זהב 14K (585)</p>
                  </AccordionContent>
                </AccordionItem>
              )}
              {faq.map((f, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-sm tracking-widest uppercase text-right">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-foreground/80 leading-relaxed">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

          </div>
        </div>

        {isRich && displayedHtmlRest && (
          <section className="mt-8 md:mt-12 border-t border-border pt-8 md:pt-12">
            <div className="max-w-3xl mx-auto">
              <LuxuryHtml html={displayedHtmlRest} />
            </div>
          </section>
        )}

        <RelatedProducts
          product={{ id: data.id, title: data.title, handle: data.handle, tags: data.tags }}
        />
      </div>

      <Toaster position="top-center" />
    </div>
  );
}
