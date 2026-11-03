import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { Toaster } from "@/components/ui/sonner";
import { useCartSync } from "@/hooks/useCartSync";
import { isHiddenHandle } from "@/lib/shopify";
import { fetchCategoryProducts } from "@/lib/shopify-catalog";
import { compareCategoryProducts } from "@/lib/category-order";
import { giftPool, PRICE_BANDS, type PriceBand, type Recipient } from "@/lib/gifts";
import { pageMeta, canonical, breadcrumbLd } from "@/lib/seo";

export const Route = createFileRoute("/gifts")({
  validateSearch: (search: Record<string, unknown>): { for?: "her" | "him" } =>
    search.for === "him" ? { for: "him" } : search.for === "her" ? { for: "her" } : {},
  head: () => ({
    meta: pageMeta({
      title: "מתנות | Royal Silver",
      description: "מצאו תכשיט במתנה לפי למי ובאיזה תקציב. תכשיטי כסף עדינים, משלוח עד הבית ב־29.90 ₪ והחזרה עד 14 יום.",
      path: "/gifts",
    }),
    links: canonical("/gifts"),
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(breadcrumbLd([{ name: "דף הבית", path: "/" }, { name: "מתנות", path: "/gifts" }])) },
    ],
  }),
  component: GiftsPage,
});

const RECIPIENTS: Array<{ id: Recipient; label: string }> = [
  { id: "her", label: "מתנה לה" },
  { id: "him", label: "מתנה לו" },
];

function GiftsPage() {
  useCartSync();
  const search = Route.useSearch();
  const [recipient, setRecipient] = useState<Recipient>(search.for ?? "her");
  const [band, setBand] = useState<PriceBand>("all");
  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", "all-catalog"],
    queryFn: () => fetchCategoryProducts(""),
  });
  const list = (data ? giftPool(data, recipient, band) : [])
    .filter((p) => !isHiddenHandle(p.node.handle))
    .sort((a, b) => compareCategoryProducts(a.node, b.node));

  const chip = (active: boolean) =>
    `px-4 py-2.5 min-h-11 text-sm border transition ${active ? "bg-foreground text-background border-foreground" : "border-border hover:bg-secondary"}`;

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <Header />
      <section className="container mx-auto px-6 pt-12 md:pt-16 pb-8 text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">מתנות</p>
        <h1 className="font-serif text-5xl md:text-6xl italic">תכשיט שנשאר</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-5 max-w-md mx-auto leading-relaxed">
          בחרו למי המתנה ומה התקציב, ונציג את התכשיטים שזמינים כרגע. משלוח עד הבית ב־29.90 ₪, והחזרה עד 14 יום בהתאם למדיניות.
        </p>
      </section>

      <section className="container mx-auto px-6 pb-6 space-y-4">
        <div role="group" aria-label="למי המתנה" className="flex flex-wrap justify-center gap-2">
          {RECIPIENTS.map((r) => (
            <button key={r.id} type="button" aria-pressed={recipient === r.id} className={chip(recipient === r.id)} onClick={() => setRecipient(r.id)}>
              {r.label}
            </button>
          ))}
        </div>
        <div role="group" aria-label="תקציב" className="flex flex-wrap justify-center gap-2">
          {(Object.keys(PRICE_BANDS) as PriceBand[]).map((id) => (
            <button key={id} type="button" aria-pressed={band === id} className={chip(band === id)} onClick={() => setBand(id)}>
              {PRICE_BANDS[id].label}
            </button>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-6 pb-24" aria-live="polite">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-[3/4] bg-secondary animate-pulse" />)}
          </div>
        ) : isError ? (
          <p className="text-center text-muted-foreground py-16">לא הצלחנו לטעון את המוצרים כרגע. נסו לרענן את הדף.</p>
        ) : list.length ? (
          <>
            <p className="text-center text-xs text-muted-foreground mb-6">{list.length} תכשיטים</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {list.map((p) => <ProductCard key={p.node.id} product={p} />)}
            </div>
          </>
        ) : (
          <div className="text-center py-16 border border-dashed border-border">
            <p className="font-serif text-2xl italic mb-3">אין כרגע תכשיטים בטווח הזה</p>
            <button type="button" className="text-sm border-b border-foreground pb-1" onClick={() => setBand("all")}>הצגת כל המחירים</button>
            <div className="mt-4"><Link to="/" className="text-sm text-muted-foreground underline">חזרה לדף הבית</Link></div>
          </div>
        )}
      </section>
      <Toaster position="top-center" />
    </div>
  );
}
