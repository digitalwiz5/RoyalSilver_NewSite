/**
 * Safe mode (V2 work copy). Active in `vite dev` and in preview builds unless VITE_RS_ALLOW_LIVE=1.
 * While active: Shopify Storefront reads stay real (read-only), every cart/checkout mutation is
 * simulated locally (no carts are created in Shopify), the Meta Pixel never loads, and checkout is blocked.
 */
/** Public preview builds (VITE_RS_PREVIEW=1) are always in safe mode: no real carts, no Pixel, no checkout. */
export const IS_PREVIEW: boolean = import.meta.env?.VITE_RS_PREVIEW === "1";
export const SAFE_MODE: boolean =
  (Boolean(import.meta.env?.DEV) || IS_PREVIEW) && import.meta.env?.VITE_RS_ALLOW_LIVE !== "1";

let lineSeq = 0;

/** Returns a fake Storefront API response for cart operations, or null for real read queries. */
export function simulateStorefront(query: string, variables: Record<string, unknown>) {
  const mutation = query.match(/^\s*mutation\s+(\w+)/)?.[1];
  const lineNode = (merchandiseId: unknown) => ({ node: { id: `dev-line-${++lineSeq}`, merchandise: { id: merchandiseId } } });
  const lines = Array.isArray(variables.lines) ? (variables.lines as Array<{ merchandiseId?: unknown }>) : [];
  const input = variables.input as { lines?: Array<{ merchandiseId?: unknown }> } | undefined;

  switch (mutation) {
    case "cartCreate":
      return { data: { cartCreate: { cart: { id: "dev-cart", checkoutUrl: "https://dev.invalid/checkout", lines: { edges: (input?.lines ?? []).map((l) => lineNode(l.merchandiseId)) } }, userErrors: [] } } };
    case "cartLinesAdd":
      return { data: { cartLinesAdd: { cart: { id: "dev-cart", lines: { edges: lines.map((l) => lineNode(l.merchandiseId)) } }, userErrors: [] } } };
    case "cartLinesUpdate":
    case "cartLinesRemove":
    case "cartAttributesUpdate":
    case "cartNoteUpdate":
      return { data: { [mutation]: { cart: { id: "dev-cart" }, userErrors: [] } } };
    case "cartDiscountCodesUpdate":
      return { data: { cartDiscountCodesUpdate: { cart: { id: "dev-cart", discountCodes: [] }, userErrors: [] } } };
  }
  if (mutation) return { data: {}, errors: [{ message: "Blocked by safe mode" }] }; // unknown mutation: never send

  if (typeof variables.id === "string" && variables.id.startsWith("dev-cart")) {
    if (/query\s+cartCost/.test(query)) return { data: { cart: null } }; // cost refresh falls back to client totals
    return { data: { cart: { id: "dev-cart", totalQuantity: 1 } } }; // keeps the persisted dev cart across reloads
  }
  return null;
}
