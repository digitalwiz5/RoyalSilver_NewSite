/** Category-only presentation; all commerce data remains untouched. */
const APPROVED_CARD_COPY: Record<string, { title: string; description: string }> = {
  JBM1184: {
    title: "צמיד נועם",
    description: "צמיד קרמי בגוונים כהים וכסף, במראה אלגנטי ומדויק.",
  },
  JBM1183: {
    title: "צמיד עידו",
    description: "צמיד קרמי בעיצוב מודרני, עם שילוב של שחור וכסף ונוכחות גברית נקייה.",
  },
  JBM1213: {
    title: "צמיד איתי",
    description: "צמיד גברי המשלב חרוזים בגוונים עמוקים עם אלמנטים מפלדת אל־חלד, ב־5 צבעים לבחירה.",
  },
  JBM1215: {
    title: "צמיד ליאור",
    description: "צמיד חוליות מפלדת אל־חלד עם פלטה מרכזית מינימליסטית, בשחור או בכסף.",
  },
  JBM1214: {
    title: "צמיד רון",
    description: "צמיד סטיל לגבר עם חוליות מתכת ופלטה מרכזית משובצת זירקון. אורך 19+3 ס״מ.",
  },
  JBM1201: {
    title: "צמיד דים",
    description: "צמיד סטיל לגבר בעיצוב חוליות מודרני ויוקרתי. אורך 20.5 ס״מ, עם אפשרות קיצור ל־19.5 ס״מ.",
  },
  JBM1182: {
    title: "צמיד טל",
    description: "צמיד בגוונים כהים וכסף, עם מרכז מתכתי מלוטש ומראה אלגנטי.",
  },
};

export function mensBraceletCardCopy(
  title: string,
  skus: Array<string | null | undefined>,
  description: string,
) {
  for (const sku of skus) {
    const copy = APPROVED_CARD_COPY[(sku ?? "").split("-")[0]];
    if (copy) return copy;
  }

  return {
    title: title.split(/\s+[–—-]\s+/)[0].trim(),
    // Use existing product copy, never generate specifications for future items.
    description: /jetem|ג[׳'’]?אטם|ספק-/i.test(description)
      ? ""
      : description.replace(/\s+/g, " ").trim(),
  };
}