import { useEffect } from "react";
import { useCartStore } from "@/stores/cartStore";

export function useCartSync() {
  const syncCart = useCartStore((s) => s.syncCart);
  const checkoutInitiated = useCartStore((s) => s.checkoutInitiated);
  const clearCart = useCartStore((s) => s.clearCart);
  const markCheckoutStarted = useCartStore((s) => s.markCheckoutStarted);

  useEffect(() => {
    syncCart();
    const handler = () => {
      if (document.visibilityState !== "visible") return;
      // If the user went to Shopify checkout and came back, clear the cart
      // since Shopify doesn't empty the cart automatically after purchase.
      if (useCartStore.getState().checkoutInitiated) {
        clearCart();
        useCartStore.setState({ checkoutInitiated: false });
      } else {
        syncCart();
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [syncCart, checkoutInitiated, clearCart, markCheckoutStarted]);
}
