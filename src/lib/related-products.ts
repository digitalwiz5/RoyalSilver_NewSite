/**
 * "מוצרים שאתם עשויים לאהוב" helpers — kept browser-safe so the rules are testable.
 */

/**
 * Handles that must never be suggested (owner request, 30 Oct 2026): the two hoop
 * earrings "עגיל כסף חישוק אבנים" (JEW1307 3 מ״מ and JEW1308 3.5 מ״מ).
 * This only removes them from the suggestions block — they stay listed in their own
 * category and on their own product pages, and nothing in Shopify changes.
 */
export const RELATED_EXCLUDED_HANDLES = new Set([
  "עגיל-כסף-חישוק-אבנים-3-ממ",
  "עגיל-כסף-חישוק-אבנים-3-5-ממ",
]);

export function isRelatedExcludedHandle(handle: string) {
  return RELATED_EXCLUDED_HANDLES.has(handle);
}

const CATEGORY_KEYWORDS = ["טבעת", "שרשרת", "צמיד", "עגיל", "סט"];

/**
 * Shopify matches a whole word only, so "title:עגיל" finds just the two products whose
 * title is literally "עגיל …". The trailing wildcard keeps every "עגילי …" earring in
 * the pool, which is what the suggestions block needs.
 */
export function relatedQuery(title: string) {
  const keyword = CATEGORY_KEYWORDS.find((k) => title.includes(k));
  return keyword ? `title:${keyword}*` : "";
}

/** Men's items are tagged גברים in Shopify; keep men's and women's suggestions separate. */
export function isMensProduct(tags?: string[]) {
  return (tags || []).some((t) => t.includes("גברים"));
}

type PoolItem = { node: { id: string; handle: string; tags?: string[] } };

/** Drop the product itself, the never-suggested handles, and the other gender's items. */
export function relatedPool<T extends PoolItem>(products: T[], current: { id: string; tags?: string[] }) {
  const mensOnly = isMensProduct(current.tags);
  return products.filter(
    (p) =>
      p.node.id !== current.id &&
      !isRelatedExcludedHandle(p.node.handle) &&
      isMensProduct(p.node.tags) === mensOnly,
  );
}
