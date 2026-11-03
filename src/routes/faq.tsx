import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { pageMeta, canonical, breadcrumbLd } from "@/lib/seo";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: pageMeta({
      title: "שאלות נפוצות | Royal Silver",
      description:
        "כל מה שרצית לדעת לפני ההזמנה — חומרים, משלוחים, החזרות וטיפול בתכשיטים של Royal Silver.",
      path: "/faq",
    }),
    links: canonical("/faq"),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbLd([
            { name: "דף הבית", path: "/" },
            { name: "שאלות נפוצות", path: "/faq" },
          ]),
        ),
      },
    ],
  }),
  component: FaqPage,
});

const faqs = [
  {
    q: "מאילו חומרים עשויים התכשיטים?",
    a: "רוב התכשיטים שלנו עשויים כסף סטרלינג 925 אמיתי, חלקם בציפוי זהב 14 קראט, ולצידם פריטים מנירוסטה איכותית. כל התכשיטים היפואלרגניים וללא ניקל — מתאימים גם לעור רגיש.",
  },
  {
    q: "האם התכשיטים עמידים במים?",
    a: "תכשיטי הנירוסטה וחלק מתכשיטי הכסף עמידים במים. לשמירה על הברק לאורך זמן מומלץ להימנע ממגע ממושך עם מי ים, בריכה, בישום וחומרי ניקוי.",
  },
  {
    q: "כמה עולה המשלוח?",
    a: "משלוח עד הבית — 29.90 ₪.",
  },
  {
    q: "מה מדיניות ההחזרות?",
    a: "יש לך 14 יום מיום קבלת המוצר להחזיר אותו באריזתו המקורית וללא סימני שימוש — בהתאם למדיניות ההחזרות. פרטים מלאים בעמוד ההחזרות.",
  },
  {
    q: "איך אדע איזו מידת טבעת להזמין?",
    a: "רוב הטבעות שלנו מתכווננות ומתאימות לרוב המידות. בטבעות עם מידות קבועות מופיע מדריך מידות בעמוד המוצר.",
  },
  {
    q: "האם ניתן להזמין מתנה?",
    a: "בשמחה! כל תכשיט מגיע באריזת מתנה אלגנטית. ניתן להוסיף ברכה אישית — כתבי לנו בהערות להזמנה או בוואטסאפ.",
  },
  {
    q: "איך יוצרים איתכם קשר?",
    a: "הדרך המהירה ביותר היא דרך כפתור הוואטסאפ הירוק באתר. אפשר גם במייל info@royalsilver.net ונחזור אלייך בהקדם.",
  },
];

function FaqPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <Header />
      <main id="main-content" className="container mx-auto px-6 py-16 max-w-4xl">
        <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">שירות לקוחות</p>
        <h1 className="font-serif text-4xl md:text-5xl italic mb-4">שאלות נפוצות</h1>
        <p className="text-lg text-muted-foreground mb-10">
          ריכזנו עבורך את התשובות לשאלות הנפוצות ביותר.
        </p>

        <div className="space-y-8 leading-relaxed text-foreground/90">
          {faqs.map((f) => (
            <section key={f.q} className="border-b border-border pb-6">
              <h2 className="font-serif text-2xl italic mb-2">{f.q}</h2>
              <p>{f.a}</p>
            </section>
          ))}

          <section>
            <p>
              לא מצאת תשובה? בדקי גם את עמודי{" "}
              <Link to="/shipping" className="underline hover:opacity-70">המשלוחים</Link>
              {" "}ו{" "}
              <Link to="/returns" className="underline hover:opacity-70">ההחזרות</Link>,
              או פני אלינו בוואטסאפ — אנחנו כאן בשבילך.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
