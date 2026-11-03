/** Approved specs only; prices, variants and availability always come from Shopify. */
export const MENS_BRACELETS: Record<string, {
  sku: string;
  lengthCm: number;
  shortenedLengthCm?: number;
  extensionCm?: number;
  design: string;
}> = {
  "צמיד-סטיל-לגבר": {
    sku: "JBM1214-1", lengthCm: 19, extensionCm: 3,
    design: "חוליות מתכת מלוטשות עם פלטה מרכזית משובצת אבן זירקון קטנה.",
  },
  "צמיד-לגבר-קרמי-מעוצב-2": {
    sku: "JBM1184-1", lengthCm: 20.5, shortenedLengthCm: 19.5,
    design: "חוליות קרמיקה כהות עם אלמנטים בגוון כסף.",
  },
  "צמיד-לגבר-קרמי-מעוצב-1": {
    sku: "JBM1183-1", lengthCm: 20.5, shortenedLengthCm: 19.5,
    design: "חוליות קרמיקה כהות עם אלמנטים בגוון כסף.",
  },
  "צמיד-לגבר-קרמי-מעוצב": {
    sku: "JBM1182-1", lengthCm: 20.5, shortenedLengthCm: 19.5,
    design: "גוונים כהים ואלמנטים מלוטשים בגוון כסף.",
  },
  "צמיד-לגבר-סטיל-דגם-steelgrid": {
    sku: "JBM1201-1", lengthCm: 20.5, shortenedLengthCm: 19.5,
    design: "חוליות פלדת אל־חלד במבנה מודרני עם טקסטורה מעוצבת.",
  },
};