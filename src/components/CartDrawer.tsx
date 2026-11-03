import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ShoppingBag, Minus, Plus, Trash2, Loader2 } from "lucide-react";
import { useCartStore, SHIPPING_OPTIONS, NO_SHIPPING_HANDLES, type ShippingMethod } from "@/stores/cartStore";
import { formatPrice, formatSizeValue } from "@/lib/shopify";
import { IRIS_CODE, IRIS_MESSAGE } from "@/lib/cart-discounts";
import { CartAddOns } from "@/components/CartAddOns";

export function CartDrawer() {
  const [open, setOpen] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [checkingOut, setCheckingOut] = useState(false);
  const {
    items,
    isLoading,
    isSyncing,
    updateQuantity,
    removeItem,
    prepareCheckout,
    syncCart,
    markCheckoutStarted,
    shippingMethod,
    setShippingMethod,
    discountCode,
    discountApplicable,
    discountError,
    isApplyingDiscount,
    applyDiscountCode,
    removeDiscountCode,
    discountAmount,
    merchandiseSubtotal,
    merchandiseTotal,
    refreshCartCost,
  } = useCartStore();
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + parseFloat(i.price.amount) * i.quantity, 0);
  const currency = items[0]?.price.currencyCode || "ILS";
  const requiresHomeDelivery = false;
  const effectiveShippingMethod: ShippingMethod = "home";
  const allNoShipping = items.length > 0 && items.every((i) => NO_SHIPPING_HANDLES.includes(i.product.node.handle));
  const shippingCost = allNoShipping ? 0 : SHIPPING_OPTIONS[effectiveShippingMethod].price;
  const symbol = currency === "ILS" ? "₪" : currency;
  const fmt = (n: number) =>
    `${n.toLocaleString("he-IL", { minimumFractionDigits: n % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 })}${symbol}`;


  useEffect(() => {
    if (open) syncCart();
  }, [open, syncCart]);

  useEffect(() => {
    if (items.length) refreshCartCost();
  }, [items, discountApplicable, refreshCartCost]);

  useEffect(() => {
    if (shippingMethod !== "home") void setShippingMethod("home");
  }, [requiresHomeDelivery, shippingMethod, setShippingMethod]);

  const handleCheckout = async () => {
    const checkoutWindow = window.open("about:blank", "_blank");
    if (checkoutWindow) checkoutWindow.opener = null;
    setCheckingOut(true);
    try {
      const url = await prepareCheckout();
      if (!url) { checkoutWindow?.close(); return; }
      markCheckoutStarted();
      if (checkoutWindow) checkoutWindow.location.href = url;
      else window.open(url, "_blank");
      setOpen(false);
    } catch {
      checkoutWindow?.close();
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="relative p-2 hover:opacity-70 transition-opacity"
          aria-label="עגלת קניות"
        >
          <ShoppingBag className="h-5 w-5" strokeWidth={1.25} />
          {totalItems > 0 && (
            <span className="absolute -top-1 -left-1 h-4 w-4 rounded-full bg-foreground text-background text-[10px] flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:max-w-md flex flex-col" dir="rtl">
        <SheetHeader>
          <SheetTitle className="font-serif text-2xl tracking-wide">העגלה שלי</SheetTitle>
          <SheetDescription>
            {totalItems === 0 ? "העגלה ריקה" : `${totalItems} פריטים בעגלה`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col flex-1 pt-6 min-h-0">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <ShoppingBag className="h-10 w-10 mx-auto mb-3 opacity-40" strokeWidth={1} />
                <p className="text-sm">העגלה ריקה</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto pr-1 min-h-0 space-y-5">
                {items.map((item) => (
                  <div key={item.variantId} className="flex gap-4 pb-5 border-b border-border">
                    <div className="w-20 h-24 bg-secondary overflow-hidden flex-shrink-0">
                      {(item.imageUrl || item.product.node.images?.edges?.[0]?.node) && (
                        <img
                          src={item.imageUrl ?? item.product.node.images.edges[0].node.url}
                          alt={item.product.node.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif text-base">{item.product.node.title}</h4>
                      {(() => {
                        const options = item.selectedOptions.filter(
                          (o) =>
                            o.value !== "Default Title" &&
                            o.name.toLowerCase() !== "title" &&
                            o.value.trim() !== "",
                        );
                        return options.length > 0 ? (
                          <p className="text-xs text-muted-foreground mt-1" dir="rtl">
                            {options.map((o) => formatSizeValue(o.value)).join(" • ")}
                          </p>
                        ) : null;
                      })()}
                      <p className="mt-2 text-sm">{formatPrice(item.price.amount, item.price.currencyCode)}</p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-border">
                          <button
                            className="px-2 py-1 hover:bg-secondary"
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-3 text-sm">{item.quantity}</span>
                          <button
                            className="px-2 py-1 hover:bg-secondary"
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button
                          className="text-muted-foreground hover:text-foreground"
                          onClick={() => removeItem(item.variantId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <CartAddOns onNavigate={() => setOpen(false)} />
              </div>

              <div className="pt-4 border-t border-border space-y-4">
                <div className="space-y-2">
                  <p className="text-xs tracking-widest uppercase text-muted-foreground">קוד קופון</p>
                  {discountApplicable && discountCode ? (
                    <div className="flex items-center justify-between border border-foreground p-3 text-sm">
                      <span className="min-w-0 leading-relaxed">{discountCode.toLowerCase() === IRIS_CODE ? IRIS_MESSAGE : `הקוד ${discountCode} הוחל בהצלחה`}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isApplyingDiscount}
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => removeDiscountCode()}
                      >
                        הסרה
                      </Button>
                    </div>
                  ) : (
                    <form
                      className="flex gap-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        applyDiscountCode(codeInput);
                      }}
                    >
                      <input
                        value={codeInput}
                        onChange={(e) => setCodeInput(e.target.value)}
                        placeholder="הזינו קוד קופון"
                        maxLength={40}
                        aria-label="קוד קופון"
                        className="min-w-0 flex-1 border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
                      />
                      <Button type="submit" variant="outline" disabled={isApplyingDiscount || !codeInput.trim()}>
                        {isApplyingDiscount ? <Loader2 className="h-4 w-4 animate-spin" /> : "החלה"}
                      </Button>
                    </form>
                  )}
                  {discountError && <p className="text-[11px] text-destructive">{discountError}</p>}
                </div>

                <div className="space-y-2">
                  <p className="text-xs tracking-widest uppercase text-muted-foreground">שיטת משלוח</p>
                  {(Object.keys(SHIPPING_OPTIONS) as ShippingMethod[])
                    .filter((key) => key === "home")
                    .map((key) => {
                    const opt = SHIPPING_OPTIONS[key];
                    const active = true;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setShippingMethod(key)}
                        className={`w-full text-right border p-3 transition-colors ${
                          active ? "border-foreground bg-secondary" : "border-border hover:border-foreground/40"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-2 text-sm">
                            <span
                              className={`h-3.5 w-3.5 rounded-full border flex-shrink-0 ${
                                active ? "border-foreground bg-foreground" : "border-muted-foreground"
                              }`}
                            />
                            {opt.label}
                          </span>
                          <span className="text-sm font-medium">
                            {opt.price === 0 ? "חינם" : fmt(opt.price)}
                          </span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-muted-foreground mt-2">{opt.note}</p>
                      </button>
                    );
                  })}
                  {requiresHomeDelivery && (
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      פריטים מסוימים בעגלה נשלחים עד הבית בלבד. דמי המשלוח הכוללים להזמנה הם 29.90 ₪.
                    </p>
                  )}
                  <p className="text-[11px] text-muted-foreground">
                    יש להזין מספר טלפון תקין וכתובת מלאה בשלב התשלום.
                  </p>
                </div>

                <div className="space-y-2 text-sm">

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">סכום ביניים</span>
                    <span>{fmt(merchandiseSubtotal ?? totalPrice)}</span>
                  </div>
                  {discountApplicable && discountAmount !== null && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">הנחה{discountCode ? ` (${discountCode})` : ""}</span>
                      <span className="font-medium">−{fmt(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{SHIPPING_OPTIONS[effectiveShippingMethod].label}</span>
                    <span className={shippingCost === 0 ? "text-muted-foreground" : "font-medium"}>
                      {shippingCost === 0 ? "חינם" : fmt(shippingCost)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between text-base">
                  <span className="font-serif">סה"כ</span>
                  <span className="font-medium">
                    {merchandiseTotal === null ? "מעדכנים את הסכום…" : fmt(merchandiseTotal + shippingCost)}
                  </span>
                </div>


                <Button
                  variant="hero"
                  size="lg"
                  className="w-full"
                  disabled={isLoading || isSyncing || isApplyingDiscount || checkingOut}
                  onClick={handleCheckout}
                >
                  {isLoading || isSyncing || isApplyingDiscount || checkingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : "מעבר לתשלום"}
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
