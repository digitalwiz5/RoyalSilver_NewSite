import { useEffect, useState } from "react";
import { useCartStore } from "@/stores/cartStore";
import { IRIS_CODE, IRIS_MESSAGE } from "@/lib/cart-discounts";

export function DiscountBenefit() {
  const [hydrated, setHydrated] = useState(false);
  const code = useCartStore(s => s.discountCode);
  const applicable = useCartStore(s => s.discountApplicable);
  const empty = useCartStore(s => s.items.length === 0);
  useEffect(() => { setHydrated(true); }, []);
  if (!hydrated || code?.toLowerCase() !== IRIS_CODE || (!empty && !applicable)) return null;
  return <div role="status" className="border-b border-border bg-secondary px-4 py-3 text-center text-sm leading-relaxed" dir="rtl">{IRIS_MESSAGE}</div>;
}