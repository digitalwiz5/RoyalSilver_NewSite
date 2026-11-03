export const IRIS_CODE = "iris27";
export const IRIS_MESSAGE = "ההטבה של איריס הופעלה — 10% הנחה על כל התכשיטים";

export function singleDiscountCode(code: string): string[] {
  const normalized = code.trim().slice(0, 40);
  return normalized ? [normalized] : [];
}

type Money = { amount: string };
type Allocation = { discountedAmount: Money };
export interface DiscountCart {
  discountCodes: Array<{ code: string; applicable: boolean }>;
  discountAllocations: Allocation[];
  cost: { subtotalAmount: Money };
  lines: { edges: Array<{ node: { cost: { subtotalAmount: Money; totalAmount: Money }; discountAllocations: Allocation[] } }> };
}

/** Shopify subtotal includes line discounts, but excludes cart-level allocations.
 * Never calculate a percentage in the browser or discount the delivery estimate. */
export function readDiscountCost(cart: DiscountCart) {
  const cartDiscount = cart.discountAllocations.reduce((sum, a) => sum + Number(a.discountedAmount.amount), 0);
  const lineDiscount = cart.lines.edges.reduce((sum, { node }) => sum + node.discountAllocations.reduce((n, a) => n + Number(a.discountedAmount.amount), 0), 0);
  const subtotal = Number(cart.cost.subtotalAmount.amount);
  const round = (n: number) => Math.round(n * 100) / 100;
  return { discountAmount: round(cartDiscount + lineDiscount), merchandiseSubtotal: round(subtotal + lineDiscount), merchandiseTotal: round(Math.max(0, subtotal - cartDiscount)) };
}