import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCategoryProducts } from "@/lib/shopify-catalog";
import { isHiddenHandle } from "@/lib/shopify";
import { isMensProduct, relatedPool, relatedQuery } from "@/lib/related-products";
import { ProductCard } from "@/components/ProductCard";

/** "מוצרים שאתם עשויים לאהוב" — random similar products from the same category. */
export function RelatedProducts({
  product,
}: {
  product: { id: string; title: string; handle: string; tags?: string[] };
}) {
  const mensOnly = isMensProduct(product.tags);
  const query = relatedQuery(product.title);
  const { data } = useQuery({
    queryKey: ["products", "related", query],
    queryFn: () => fetchCategoryProducts(query),
    staleTime: 5 * 60 * 1000,
  });

  const items = useMemo(() => {
    const pool = relatedPool(
      (data || []).filter((p) => !isHiddenHandle(p.node.handle)),
      product,
    );
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 4);
  }, [data, product]);

  if (items.length === 0) return null;

  return (
    <section className="mt-16 md:mt-24 border-t border-border pt-12 md:pt-16">
      <div className="text-center mb-10">
        <h2 className="font-serif text-3xl md:text-4xl italic">מוצרים שאתם עשויים לאהוב</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
        {items.map((p) => (
          <ProductCard key={p.node.id} product={p} categorySlug={mensOnly ? "men-bracelets" : undefined} />
        ))}
      </div>
    </section>
  );
}
