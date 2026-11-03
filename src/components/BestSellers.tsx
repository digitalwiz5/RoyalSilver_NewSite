import { useQuery } from "@tanstack/react-query";
import { storefrontApiRequest, PRODUCTS_QUERY, isHiddenHandle, type ShopifyProduct } from "@/lib/shopify";
import { ProductCard } from "@/components/ProductCard";
import { isPurchasable } from "@/lib/gifts";

// Real sales ranking from Shopify (sortKey BEST_SELLING), not a manual or default-order pick.
const BEST_SELLING_QUERY = PRODUCTS_QUERY.replace("products(first: $first, query: $query)", "products(first: $first, query: $query, sortKey: BEST_SELLING)");

export function BestSellers() {
  const { data, isLoading } = useQuery({
    queryKey: ["products", "bestsellers"],
    queryFn: async () => {
      const res = await storefrontApiRequest(BEST_SELLING_QUERY, { first: 16 });
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
          התכשיטים שהלקוחות שלנו בחרו הכי הרבה
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
            .filter((p) => !isHiddenHandle(p.node.handle) && isPurchasable(p))
            .slice(0, 4)
            .map((p) => (
              <ProductCard key={p.node.id} product={p} />
            ))}
        </div>
      ) : null}
    </section>
  );
}
