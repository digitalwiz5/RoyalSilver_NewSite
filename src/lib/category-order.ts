/** All categories use creation dates, never edit dates or manual handle priorities. */
export function compareCategoryProducts(a: { createdAt?: string }, b: { createdAt?: string }): number {
  const timestamp = (date?: string) => {
    const value = date ? Date.parse(date) : NaN;
    return Number.isFinite(value) ? value : 0;
  };
  return timestamp(b.createdAt) - timestamp(a.createdAt);
}