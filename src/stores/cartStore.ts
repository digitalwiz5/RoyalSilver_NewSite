import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  storefrontApiRequest,
  SHOPIFY_STORE_PERMANENT_DOMAIN,
  type ShopifyProduct,
} from "@/lib/shopify";
import { HOME_ONLY_HANDLES } from "@/lib/handles";
import { trackCommerce } from "@/lib/meta-pixel";
import { SAFE_MODE } from "@/lib/safe-mode";
import { IRIS_CODE, readDiscountCost, singleDiscountCode } from "@/lib/cart-discounts";


export interface CartItem {
  lineId: string | null;
  product: ShopifyProduct;
  variantId: string;
  variantTitle: string;
  price: { amount: string; currencyCode: string };
  quantity: number;
  selectedOptions: Array<{ name: string; value: string }>;
  /** Lead image of the selected variant at add time, so the cart shows the chosen colour. */
  imageUrl?: string;
}

export type ShippingMethod = "home";

// Digital items with requires_shipping=false in Shopify (no shipping charged at checkout).
export const NO_SHIPPING_HANDLES: string[] = ["מוצר-בדיקה"];

export const SHIPPING_OPTIONS: Record<
  ShippingMethod,
  { label: string; price: number; note: string }
> = {
  home: {
    label: "משלוח עד הבית",
    price: 29.9,
    note: "השליח יתאם את המסירה באמצעות מספר הטלפון שהוזן בהזמנה. חשוב להיות זמינים לשיחת השליח כדי למנוע עיכוב או החזרת החבילה.",
  },
};

interface CartStore {
  items: CartItem[];
  cartId: string | null;
  checkoutUrl: string | null;
  isLoading: boolean;
  isSyncing: boolean;
  checkoutInitiated: boolean;
  shippingMethod: ShippingMethod;
  discountCode: string | null;
  discountApplicable: boolean;
  discountError: string | null;
  isApplyingDiscount: boolean;
  discountAmount: number | null;
  merchandiseSubtotal: number | null;
  merchandiseTotal: number | null;
  prepareCheckout: () => Promise<string | null>;
  refreshCartCost: () => Promise<void>;
  applyDiscountCode: (code: string) => Promise<void>;
  removeDiscountCode: () => Promise<void>;
  setShippingMethod: (method: ShippingMethod) => Promise<void>;
  addItem: (item: Omit<CartItem, "lineId">) => Promise<void>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  clearCart: () => void;
  syncCart: () => Promise<void>;
  getCheckoutUrl: () => string | null;
  markCheckoutStarted: () => void;
}

const CART_QUERY = `query cart($id: ID!) { cart(id: $id) { id totalQuantity } }`;

const CART_COST_QUERY = `
  query cartCost($id: ID!) {
    cart(id: $id) {
      id
      discountCodes { code applicable }
      cost { subtotalAmount { amount currencyCode } }
      discountAllocations { discountedAmount { amount currencyCode } }
      lines(first: 100) {
        edges { node { cost { subtotalAmount { amount } totalAmount { amount } } discountAllocations { discountedAmount { amount currencyCode } } } }
      }
    }
  }`;

const CART_DISCOUNT_CODES_UPDATE_MUTATION = `
  mutation cartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]!) {
    cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
      cart { id discountCodes { code applicable } }
      userErrors { field message }
    }
  }`;


const CART_ATTRIBUTES_UPDATE_MUTATION = `
  mutation cartAttributesUpdate($cartId: ID!, $attributes: [AttributeInput!]!) {
    cartAttributesUpdate(cartId: $cartId, attributes: $attributes) {
      cart { id }
      userErrors { field message }
    }
  }`;

const CART_NOTE_UPDATE_MUTATION = `
  mutation cartNoteUpdate($cartId: ID!, $note: String!) {
    cartNoteUpdate(cartId: $cartId, note: $note) { cart { id } userErrors { field message } }
  }`;

async function pushShippingMethodToShopify(cartId: string, method: ShippingMethod) {
  const opt = SHIPPING_OPTIONS[method];
  const value = `${opt.label}${opt.price > 0 ? ` (${opt.price.toFixed(2)} ₪)` : " (חינם)"}`;
  try {
    await storefrontApiRequest(CART_ATTRIBUTES_UPDATE_MUTATION, {
      cartId,
      attributes: [
        { key: "שיטת משלוח", value },
        { key: "shipping_method", value: "home_delivery" },
      ],
    });
    await storefrontApiRequest(CART_NOTE_UPDATE_MUTATION, {
      cartId,
      note: `שיטת משלוח: ${value}`,
    });
  } catch {
    /* non-blocking */
  }
}


const CART_CREATE_MUTATION = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id checkoutUrl
        lines(first: 100) { edges { node { id merchandise { ... on ProductVariant { id } } } } }
      }
      userErrors { field message }
    }
  }`;

const CART_LINES_ADD_MUTATION = `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { id lines(first: 100) { edges { node { id merchandise { ... on ProductVariant { id } } } } } }
      userErrors { field message }
    }
  }`;

const CART_LINES_UPDATE_MUTATION = `
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { id } userErrors { field message } }
  }`;

const CART_LINES_REMOVE_MUTATION = `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { id } userErrors { field message } }
  }`;

function formatCheckoutUrl(checkoutUrl: string): string {
  try {
    const url = new URL(checkoutUrl);
    // The custom domain (royalsilver.net) points to this storefront, not to
    // Shopify's storefront, so checkout must run on the myshopify domain.
    url.host = SHOPIFY_STORE_PERMANENT_DOMAIN;
    url.protocol = "https:";
    url.searchParams.set("channel", "online_store");
    return url.toString();
  } catch {
    return checkoutUrl;
  }
}


function isCartNotFoundError(userErrors: Array<{ field: string[] | null; message: string }>) {
  return userErrors.some(
    (e) => e.message.toLowerCase().includes("cart not found") || e.message.toLowerCase().includes("does not exist"),
  );
}

async function createShopifyCart(item: CartItem) {
  const data = await storefrontApiRequest(CART_CREATE_MUTATION, {
    input: { lines: [{ quantity: item.quantity, merchandiseId: item.variantId }] },
  });
  if (data?.data?.cartCreate?.userErrors?.length > 0) return null;
  const cart = data?.data?.cartCreate?.cart;
  if (!cart?.checkoutUrl) return null;
  const lineId = cart.lines.edges[0]?.node?.id;
  if (!lineId) return null;
  return { cartId: cart.id as string, checkoutUrl: formatCheckoutUrl(cart.checkoutUrl), lineId: lineId as string };
}

async function addLineToShopifyCart(cartId: string, item: CartItem) {
  const data = await storefrontApiRequest(CART_LINES_ADD_MUTATION, {
    cartId,
    lines: [{ quantity: item.quantity, merchandiseId: item.variantId }],
  });
  const userErrors = data?.data?.cartLinesAdd?.userErrors || [];
  if (isCartNotFoundError(userErrors)) return { success: false, cartNotFound: true };
  if (userErrors.length > 0) return { success: false };
  const lines = data?.data?.cartLinesAdd?.cart?.lines?.edges || [];
  const newLine = lines.find(
    (l: { node: { id: string; merchandise: { id: string } } }) => l.node.merchandise.id === item.variantId,
  );
  return { success: true, lineId: newLine?.node?.id as string | undefined };
}

async function updateShopifyCartLine(cartId: string, lineId: string, quantity: number) {
  const data = await storefrontApiRequest(CART_LINES_UPDATE_MUTATION, {
    cartId,
    lines: [{ id: lineId, quantity }],
  });
  const userErrors = data?.data?.cartLinesUpdate?.userErrors || [];
  if (isCartNotFoundError(userErrors)) return { success: false, cartNotFound: true };
  if (userErrors.length > 0) return { success: false };
  return { success: true };
}

async function removeLineFromShopifyCart(cartId: string, lineId: string) {
  const data = await storefrontApiRequest(CART_LINES_REMOVE_MUTATION, { cartId, lineIds: [lineId] });
  const userErrors = data?.data?.cartLinesRemove?.userErrors || [];
  if (isCartNotFoundError(userErrors)) return { success: false, cartNotFound: true };
  if (userErrors.length > 0) return { success: false };
  return { success: true };
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      cartId: null,
      checkoutUrl: null,
      isLoading: false,
      isSyncing: false,
      checkoutInitiated: false,
      shippingMethod: "home",
      discountCode: null,
      discountApplicable: false,
      discountError: null,
      isApplyingDiscount: false,
      discountAmount: null,
      merchandiseSubtotal: null,
      merchandiseTotal: null,

      refreshCartCost: async () => {
        const { cartId } = get();
        if (!cartId) {
          set({ discountAmount: null, merchandiseSubtotal: null, merchandiseTotal: null });
          return;
        }
        try {
          const data = await storefrontApiRequest(CART_COST_QUERY, { id: cartId });
          const cart = data?.data?.cart;
          if (!cart) throw new Error("Cart unavailable");
          const selected = get().discountCode;
          const applicable = cart.discountCodes.some((d: { code: string; applicable: boolean }) => d.applicable && d.code.toLowerCase() === selected?.toLowerCase());
          set({ ...readDiscountCost(cart), discountApplicable: applicable });
        } catch {
          set({ discountAmount: null, merchandiseSubtotal: null, merchandiseTotal: null });
        }
      },

      applyDiscountCode: async (code) => {
        const trimmed = singleDiscountCode(code)[0];
        if (!trimmed) return;
        const { cartId } = get();
        if (!cartId) {
          set({ discountCode: trimmed, discountApplicable: false, discountAmount: null, discountError: null });
          return;
        }
        set({ isApplyingDiscount: true, discountError: null });
        try {
          const data = await storefrontApiRequest(CART_DISCOUNT_CODES_UPDATE_MUTATION, {
            cartId,
            discountCodes: singleDiscountCode(trimmed),
          });
          const result = data?.data?.cartDiscountCodesUpdate;
          if (result?.userErrors?.length > 0) {
            set({ discountError: "לא ניתן להחיל את הקוד הזה", discountApplicable: false, discountAmount: null });
            return;
          }
          if (!result?.cart) throw new Error("Discount verification unavailable");
          const applied = (result?.cart?.discountCodes || []).find(
            (d: { code: string; applicable: boolean }) => d.code.toLowerCase() === trimmed.toLowerCase(),
          );
          if (applied?.applicable) {
            set({ discountCode: applied.code, discountApplicable: true, discountError: null });
            await get().refreshCartCost();
          } else {
            set({
              discountCode: null,
              discountApplicable: false,
              discountAmount: null,
              discountError: "קוד הקופון אינו תקף או שאינו מתאים לפריטים שבעגלה",
            });
          }
        } catch {
          set({ discountError: "אירעה שגיאה, נסו שוב", discountApplicable: false, discountAmount: null });
        } finally {
          set({ isApplyingDiscount: false });
        }
      },

      removeDiscountCode: async () => {
        const { cartId } = get();
        if (!cartId) {
          set({ discountCode: null, discountApplicable: false, discountError: null, discountAmount: null });
          return;
        }
        set({ isApplyingDiscount: true });
        try {
          const data = await storefrontApiRequest(CART_DISCOUNT_CODES_UPDATE_MUTATION, { cartId, discountCodes: [] });
          if (!data?.data?.cartDiscountCodesUpdate?.cart || data.data.cartDiscountCodesUpdate.userErrors.length) throw new Error("Removal failed");
          set({ discountCode: null, discountApplicable: false, discountError: null, discountAmount: null });
          await get().refreshCartCost();
        } catch {
          set({ discountError: "לא ניתן להסיר את הקופון כרגע, נסו שוב" });
        } finally {
          set({ isApplyingDiscount: false });
        }
      },



      setShippingMethod: async (method) => {
        set({ shippingMethod: method });
        const { cartId } = get();
        if (cartId) await pushShippingMethodToShopify(cartId, method);
      },

      addItem: async (item) => {
        const { items, cartId, clearCart } = get();
        const existing = items.find((i) => i.variantId === item.variantId);
        set({ shippingMethod: "home" });
        set({ isLoading: true });
        try {
          if (!cartId) {
            const result = await createShopifyCart({ ...item, lineId: null });
            if (result) {
              set({
                cartId: result.cartId,
                checkoutUrl: result.checkoutUrl,
                items: [{ ...item, lineId: result.lineId }],
              });
              await pushShippingMethodToShopify(result.cartId, "home");
              trackCommerce("AddToCart", [item]);
            }
          } else if (existing) {
            const newQty = existing.quantity + item.quantity;
            if (!existing.lineId) return;
            const result = await updateShopifyCartLine(cartId, existing.lineId, newQty);
            if (result.success) {
              const cur = get().items;
              set({ items: cur.map((i) => (i.variantId === item.variantId ? { ...i, quantity: newQty } : i)) });
              trackCommerce("AddToCart", [item]);
            } else if (result.cartNotFound) clearCart();
          } else {
            const result = await addLineToShopifyCart(cartId, { ...item, lineId: null });
            if (result.success) {
              const cur = get().items;
              set({ items: [...cur, { ...item, lineId: result.lineId ?? null }] });
              await pushShippingMethodToShopify(cartId, "home");
              trackCommerce("AddToCart", [item]);
            } else if (result.cartNotFound) clearCart();
          }
        } finally {
          if (get().items.length > 0) {
            const code = get().discountCode;
            if (code) await get().applyDiscountCode(code);
            else await get().refreshCartCost();
          }
          set({ isLoading: false });
        }
      },

      updateQuantity: async (variantId, quantity) => {
        if (quantity <= 0) return get().removeItem(variantId);
        const { items, cartId, clearCart } = get();
        const item = items.find((i) => i.variantId === variantId);
        if (!item?.lineId || !cartId) return;
        set({ isLoading: true });
        try {
          const result = await updateShopifyCartLine(cartId, item.lineId, quantity);
          if (result.success) {
            const cur = get().items;
            set({ items: cur.map((i) => (i.variantId === variantId ? { ...i, quantity } : i)) });
            const code = get().discountCode;
            if (code) await get().applyDiscountCode(code);
            else await get().refreshCartCost();
          } else if (result.cartNotFound) clearCart();
        } finally {
          set({ isLoading: false });
        }
      },

      removeItem: async (variantId) => {
        const { items, cartId, clearCart } = get();
        const item = items.find((i) => i.variantId === variantId);
        if (!item?.lineId || !cartId) return;
        set({ isLoading: true });
        try {
          const result = await removeLineFromShopifyCart(cartId, item.lineId);
          if (result.success) {
            const cur = get().items;
            const newItems = cur.filter((i) => i.variantId !== variantId);
            newItems.length === 0 ? clearCart() : set({ items: newItems });
            if (newItems.length > 0) await get().refreshCartCost();
          } else if (result.cartNotFound) clearCart();
        } finally {
          set({ isLoading: false });
        }
      },

      clearCart: () =>
        set({
          items: [],
          cartId: null,
          checkoutUrl: null,
          discountCode: get().discountCode?.toLowerCase() === IRIS_CODE ? IRIS_CODE : null,
          discountApplicable: false,
          discountError: null,
          discountAmount: null,
          merchandiseSubtotal: null,
          merchandiseTotal: null,
        }),

      prepareCheckout: async () => {
        if (SAFE_MODE) {
          set({ discountError: "מצב פיתוח: התשלום מנוטרל ולא נוצרת הזמנה." });
          return null;
        }
        const code = get().discountCode;
        if (code) await get().applyDiscountCode(code);
        await get().refreshCartCost();
        if (get().merchandiseTotal === null || (code && !get().discountApplicable)) {
          set({ discountError: "לא ניתן לאמת את סכום ההזמנה וההטבה כרגע. נסו שוב לפני התשלום." });
          return null;
        }
        return get().getCheckoutUrl();
      },

      markCheckoutStarted: () => set({ checkoutInitiated: true }),
      getCheckoutUrl: () => {
        const url = get().checkoutUrl;
        return url ? formatCheckoutUrl(url) : null;
      },


      syncCart: async () => {
        const { cartId, isSyncing, clearCart } = get();
        if (!cartId || isSyncing) return;
        set({ isSyncing: true });
        try {
          const data = await storefrontApiRequest(CART_QUERY, { id: cartId });
          if (!data) return;
          const cart = data?.data?.cart;
          if (!cart || cart.totalQuantity === 0) clearCart();
          else {
            const code = get().discountCode;
            if (code) await get().applyDiscountCode(code);
            else await get().refreshCartCost();
          }
        } finally {
          set({ isSyncing: false });
        }
      },
    }),
    {
      name: "royalsilver-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        items: s.items,
        cartId: s.cartId,
        checkoutUrl: s.checkoutUrl,
        shippingMethod: s.shippingMethod,
        discountCode: s.discountCode,
        discountApplicable: s.discountApplicable,
      }),

    },
  ),
);
