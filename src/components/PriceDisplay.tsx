import { formatPrice, discountPercent } from "@/lib/shopify";

interface Props {
  amount: string;
  currencyCode: string;
  compareAtAmount?: string | null;
  /** prefix such as "החל מ־" */
  prefix?: string;
  size?: "sm" | "lg";
  className?: string;
}

/**
 * Elegant price block: current price dominant, original price muted + struck
 * through, subtle dynamic discount label. RTL-aware.
 */
export function PriceDisplay({
  amount,
  currencyCode,
  compareAtAmount,
  prefix,
  size = "sm",
  className = "",
}: Props) {
  const percent = discountPercent(amount, compareAtAmount);
  const current = `${prefix ?? ""}${formatPrice(amount, currencyCode)}`;

  return (
    <div className={className}>
      <div className={`flex items-baseline gap-2.5 ${size === "sm" ? "justify-center" : ""}`}>
        <span
          className={
            size === "lg"
              ? "text-2xl md:text-[26px] text-foreground"
              : "text-sm text-foreground"
          }
        >
          {current}
        </span>
        {percent !== null && compareAtAmount && (
          <span
            className={`line-through text-muted-foreground/70 ${
              size === "lg" ? "text-base" : "text-xs"
            }`}
          >
            {formatPrice(compareAtAmount, currencyCode)}
          </span>
        )}
      </div>
      {percent !== null && (
        <span
          className={`mt-1.5 inline-block border border-foreground/20 px-2 py-0.5 text-[10px] tracking-[0.18em] text-foreground/70 ${
            size === "lg" ? "text-[11px]" : ""
          }`}
        >
          {percent}% הנחה
        </span>
      )}
    </div>
  );
}
