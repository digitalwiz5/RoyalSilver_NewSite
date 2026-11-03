import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { storefrontApiRequest, PRODUCTS_QUERY, isHiddenHandle, type ShopifyProduct } from "@/lib/shopify";
import { useCartSync } from "@/hooks/useCartSync";
import { Toaster } from "@/components/ui/sonner";
import { pageMeta, canonical, breadcrumbLd } from "@/lib/seo";
import { compareCategoryProducts } from "@/lib/category-order";
import { fetchShayProduct, groupShayCards } from "@/lib/shay";
import { fetchCategoryProducts } from "@/lib/shopify-catalog";

export type CategoryDef = {
  title: string;
  /** Hebrew Shopify tag that places a product in this category (one tag per product). */
  tag: string;
  /** Legacy product_type fallback so untagged existing products keep showing. */
  productType?: string;
  /** Broad Shopify tag accepted together with the "נשים" tag (e.g. טבעות + נשים). */
  genericTag?: string;
  /** Extra Shopify tags that also place a product in this category. */
  altTags?: string[];
  group: "women" | "men";
  intro: string;
  meta: string;
};

export const CATEGORIES: Record<string, CategoryDef> = {
  necklaces: {
    title: "שרשראות נשים",
    tag: "שרשראות נשים",
    productType: "שרשראות",
    genericTag: "שרשראות",
    group: "women",
    intro: "יש תכשיטים שמשלימים הופעה, ויש כאלה שהופכים אותה לבלתי נשכחת. שרשראות בעיצובים עדינים ועל־זמניים, שמוסיפות נגיעה של אור, נשיות ואלגנטיות לכל רגע.",
    meta: "שרשראות כסף 925, תליונים עדינים וסטים לשכבות. עיצוב נשי ועדין, משלוח עד הבית ב־29.90 ₪.",
  },
  earrings: {
    title: "עגילי נשים",
    tag: "עגילי נשים",
    productType: "עגילים",
    genericTag: "עגילים",
    group: "women",
    intro: "לפעמים מספיק ניצוץ קטן כדי לשנות את כל ההופעה. עגילים בעיצובים עדינים ומלאי נוכחות, שמאירים את הפנים ומוסיפים נגיעה של אלגנטיות לכל רגע.",
    meta: "עגילי מואסנייט, סוליטר וזרקון בכסף 925 ובציפוי זהב. ברק נקי לענידה יומיומית ולערב.",
  },
  rings: {
    title: "טבעות נשים",
    tag: "טבעות נשים",
    productType: "טבעות",
    genericTag: "טבעות",
    group: "women",
    intro: "יש פרטים קטנים שמספרים סיפור שלם. טבעות בעיצובים על־זמניים, עם שיבוצים מלאי ברק ונגיעות של אלגנטיות, שמעניקות לכל מחווה יופי מיוחד משלה.",
    meta: "טבעות כסף 925, טבעות מואסנייט וטבעות משובצות זרקונים בעיצוב נקי ונצחי. משלוח עד הבית ב־29.90 ₪.",
  },
  bracelets: {
    title: "צמידים נשים",
    tag: "צמידים נשים",
    productType: "צמידים",
    genericTag: "צמידים",
    group: "women",
    intro: "הקסם נמצא בפרטים הקטנים. צמידים בעיצובים עדינים ומלאי נוכחות, שמוסיפים ברק ואלגנטיות לכל תנועה – בפני עצמם או בשילוב עם תכשיטים נוספים.",
    meta: "צמידי טניס, צמידי חמסה וצמידים עדינים בגימור יוקרתי. משלוח עד הבית ב־29.90 ₪.",
  },
  sets: {
    title: "סטים",
    tag: "סטים",
    productType: "סטים",
    group: "women",
    intro: "כשכל פרט מתחבר בהרמוניה, נוצר מראה שלם. סטים של תכשיטים בעיצובים משלימים, שמביאים יחד ברק, איזון ואלגנטיות לכל רגע.",
    meta: "סטי תכשיטים תואמים — שרשרת, עגילים, צמיד וטבעת בגימור יוקרתי. משלוח עד הבית ב־29.90 ₪.",
  },
  "men-necklaces": {
    title: "שרשראות גברים",
    tag: "שרשראות גברים",
    genericTag: "שרשראות",
    group: "men",
    intro: "נוכחות שקטה שמורגשת בכל הופעה. שרשראות לגבר בקווים נקיים ובעיצובים על־זמניים, שמשלבות אופי אישי עם אלגנטיות יומיומית.",
    meta: "שרשראות גברים בעיצוב נקי ועל־זמני. משלוח עד הבית ב־29.90 ₪.",
  },
  "men-bracelets": {
    title: "צמידים גברים",
    tag: "צמידים גברים",
    genericTag: "צמידים",
    altTags: ["צמידי גבר"],
    group: "men",
    intro: "הפרטים הקטנים הם אלה שיוצרים נוכחות. צמידים לגבר בעיצובים מדויקים, שמשלבים אופי, עוצמה ואלגנטיות בלי להתאמץ.",
    meta: "צמידים לגברים בעיצוב נקי ומדויק. משלוח עד הבית ב־29.90 ₪.",
  },
};

/** Men's group tags — excluded from every women's category so the product_type fallback never pulls men's items in. */
const MEN_TAGS = ["שרשראות גברים", "צמידים גברים", "עגילים גברים"];

export function categoryQuery(cat: CategoryDef): string {
  const tagQ = `tag:'${cat.tag}'`;
  const groupTag = cat.group === "men" ? "גברים" : "נשים";
  const generic = cat.genericTag ? ` OR (tag:'${groupTag}' AND tag:'${cat.genericTag}')` : "";
  const alt = (cat.altTags ?? []).map((t) => ` OR tag:'${t}'`).join("");
  const type = cat.productType ? ` OR product_type:'${cat.productType}'` : "";
  const base = `(${tagQ}${type}${generic}${alt})`;
  if (cat.group !== "women") return base;
  // Men's tags guard — but a product explicitly tagged for this women's category stays,
  // so dual-category items (e.g. תום: both necklaces categories) are not excluded.
  const guard = MEN_TAGS.map((t) => `(-tag:'${t}' OR ${tagQ})`).join(" ");
  return `${base} ${guard}`;
}

export const Route = createFileRoute("/category/$slug")({
  beforeLoad: ({ params }) => {
    if (!CATEGORIES[params.slug]) throw notFound();
  },
  loader: async ({ params }) => {
    try {
      const cat = CATEGORIES[params.slug];
      if (!cat) return null;
      const res = await storefrontApiRequest(PRODUCTS_QUERY, {
        first: 1,
        query: categoryQuery(cat),
      });
      const image = res?.data?.products?.edges?.[0]?.node?.images?.edges?.[0]?.node?.url;
      return { image: (image as string | undefined) ?? null };
    } catch {
      return null;
    }
  },
  head: ({ params, loaderData }) => {
    const cat = CATEGORIES[params.slug];
    const title = cat ? `${cat.title} | Royal Silver` : "קולקציה | Royal Silver";
    const description = cat?.meta ?? "קולקציית התכשיטים של Royal Silver.";
    const path = `/category/${params.slug}`;
    return {
      meta: pageMeta({
        title,
        description,
        path,
        image: loaderData?.image ?? null,
        imageAlt: cat ? `${cat.title} — Royal Silver` : "Royal Silver",
      }),
      links: canonical(path),
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(
            breadcrumbLd([
              { name: "דף הבית", path: "/" },
              { name: cat?.title ?? "קולקציה", path },
            ]),
          ),
        },
      ],
    };
  },


  component: CategoryPage,
  notFoundComponent: () => (
    <div dir="rtl" className="min-h-screen flex items-center justify-center">
      <p className="font-serif text-2xl italic">הקטגוריה לא נמצאה</p>
    </div>
  ),
});

function CategoryPage() {
  useCartSync();
  const { slug } = Route.useParams();
  const cat = CATEGORIES[slug];

  const { data, isLoading } = useQuery({
    queryKey: ["products", "category", slug],
    queryFn: async () => {
      const products = await fetchCategoryProducts(categoryQuery(cat));
      if (slug === "earrings") {
        return groupShayCards(products, await fetchShayProduct());
      }
      return products;
    },
  });

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <Header />

      <section className="container mx-auto px-6 pt-12 md:pt-16 pb-12 text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">
          {cat.group === "men" ? "קולקציית גברים" : "קולקציית תכשיטי נשים"}
        </p>
        <h1 className="font-serif text-5xl md:text-6xl italic">{cat.title}</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-5 max-w-md mx-auto leading-relaxed">
          {cat.intro}
        </p>
      </section>


      <section className="container mx-auto px-6 pb-24">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-secondary animate-pulse" />
            ))}
          </div>
        ) : data && data.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {data
              .filter((p) => !isHiddenHandle(p.node.handle))
              .sort((a, b) => compareCategoryProducts(a.node, b.node))
              .map((p) => (
                <ProductCard key={p.node.id} product={p} categorySlug={slug} />
              ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-border">
            <p className="font-serif text-2xl italic mb-3">אין מוצרים בקטגוריה זו</p>
            <Link to="/" className="text-sm border-b border-foreground pb-1 inline-block mt-3">
              חזרה לעמוד הראשי
            </Link>
          </div>
        )}
      </section>

      <Toaster position="top-center" />
    </div>
  );
}
