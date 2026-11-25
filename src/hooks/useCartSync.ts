import { useEffect } from "react";
import { useCartStore } from "@/stores/cartStore";

/**
 * Re-reads the cart from Shopify whenever the shopper returns to the site, including the Back button
 * from checkout (bfcache restore). Never clears the cart on its own: a customer who leaves checkout
 * without paying keeps their items. After a completed order Shopify no longer returns the cart, and
 * syncCart empties it then.
 */
export function useCartSync() {
  const syncCart = useCartStore((s) => s.syncCart);

  useEffect(() => {
    syncCart();
    const onVisible = () => {
      if (document.visibilityState === "visible") syncCart();
    };
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) syncCart();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [syncCart]);
}
