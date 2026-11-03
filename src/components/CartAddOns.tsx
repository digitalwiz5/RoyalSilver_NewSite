import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useCartStore } from "@/stores/cartStore";
import { fetchCategoryProducts } from "@/lib/shopify-catalog";
import { cartAddOns, productMinPrice } from "@/lib/gifts";
import { formatPrice } from "@/lib/shopify";

/** "What else to add": complementary pieces from other jewelry families. Links to the product page (no silent add). */
export function CartAddOns({ onNavigate }: { onNavigate: () => void }) {
  const items = useCartStore((s) => s.items);
  const { data } = useQuery({ queryKey: ["products", "all-catalog"], queryFn: () => fetchCategoryProducts(""), staleTime: 5 * 60_000 });
  if (!data || !items.length) return null;
  const picks = cartAddOns(
    data,
    items.map((i) => ({ productId: i.product.node.id, handle: i.product.node.handle, title: i.product.node.title, tags: i.product.node.tags })),
  );
  if (!picks.length) return null;
  return (
    <section aria-label="מה עוד להוסיף" className="pt-2">
      <h3 className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">מה עוד להוסיף</h3>
      <ul className="grid grid-cols-2 gap-3">
        {picks.map((p) => (
          <li key={p.node.id}>
            <Link to="/product/$handle" params={{ handle: p.node.handle }} onClick={onNavigate} className="block">
              <div className="aspect-square bg-secondary overflow-hidden">
                {p.node.images.edges[0] && <img src={p.node.images.edges[0].node.url} alt={p.node.images.edges[0].node.altText || p.node.title} loading="lazy" className="w-full h-full object-cover" />}
              </div>
              <p className="text-xs mt-2 line-clamp-2">{p.node.title}</p>
              <p className="text-xs text-muted-foreground">{formatPrice(String(productMinPrice(p)), p.node.priceRange.minVariantPrice.currencyCode)}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
