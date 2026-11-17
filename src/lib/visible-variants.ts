/**
 * Storefront-visible variants. Some Shopify variants stay untouched in Shopify (inventory/sync identities)
 * but are not offered on the site. The product page and the Meta catalog feed share these rules,
 * so ads never advertise a variant the site will not sell.
 */
export const ORI_HANDLE = "שרשרת-מגן-דוד-ה-לבן";
export const ORI_WHITE_SKU = "JNM1118-1";
export const EFRAT_HANDLE = "שרשרת-כסף-925-עניבה-עם-טיפה-משובצת-באבני-זרקון";
export const EFRAT_HIDDEN_SKUS = new Set(["JNW1022-2"]);
// Green leaf drop earrings: only the green variant (JEW1001-1) is offered for now.
export const LOTUS_HANDLE = "עגיל-כסף-חישוק-משובץ-דגם-לוטוס-לבן";
export const LOTUS_HIDDEN_SKUS = new Set(["JEW1001-2"]);

export function isVisibleVariant(
  handle: string | undefined,
  sku: string | null | undefined,
): boolean {
  if (handle === ORI_HANDLE) return sku === ORI_WHITE_SKU;
  if (handle === EFRAT_HANDLE) return !EFRAT_HIDDEN_SKUS.has(sku ?? "");
  if (handle === LOTUS_HANDLE) return !LOTUS_HIDDEN_SKUS.has(sku ?? "");
  return true;
}
