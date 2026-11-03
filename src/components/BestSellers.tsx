import { useQuery } from "@tanstack/react-query";
import { storefrontApiRequest, PRODUCTS_QUERY, isHiddenHandle, type ShopifyProduct } from "@/lib/shopify";
import { ProductCard } from "@/components/ProductCard";

export function BestSellers() {
  const { data, isLoading } = useQuery({
    queryKey: ["products", "bestsellers"],
    queryFn: async () => {
      const res = await storefrontApiRequest(PRODUCTS_QUERY, { first: 8 });
      return (res?.data?.products?.edges || []) as ShopifyProduct[];
    },
  });

  return (
    <section className="container mx-auto px-6 py-24 border-t border-border">
      <div className="text-center mb-12">
        <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">
          הקולקציה החמה
        </p>
        <h2 className="font-serif text-4xl md:text-5xl italic">הנמכרים ביותר</h2>
        <p className="text-sm text-muted-foreground mt-3">
          הפריטים האהובים ביותר על הלקוחות שלנו
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-secondary animate-pulse" />
          ))}
        </div>
      ) : data && data.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {data
            .filter((p) => !isHiddenHandle(p.node.handle))
            .slice(0, 4)
            .map((p) => (
              <ProductCard key={p.node.id} product={p} />
            ))}
        </div>
      ) : null}
    </section>
  );
}
