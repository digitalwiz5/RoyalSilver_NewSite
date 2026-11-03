import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { pageMeta, canonical, breadcrumbLd } from "@/lib/seo";

export const Route = createFileRoute("/shipping")({
  head: () => ({
    meta: pageMeta({
      title: "משלוחים ואספקה | Royal Silver",
      description:
        "משלוח עד הבית ב־29.90 ₪ — כל פרטי המשלוח של Royal Silver.",
      path: "/shipping",
    }),
    links: canonical("/shipping"),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbLd([
            { name: "דף הבית", path: "/" },
            { name: "משלוחים", path: "/shipping" },
          ]),
        ),
      },
    ],
  }),
  component: ShippingPage,
});

function ShippingPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <Header />
      <main id="main-content" className="container mx-auto px-6 py-16 max-w-4xl">
        <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">שירות לקוחות</p>
        <h1 className="font-serif text-4xl md:text-5xl italic mb-4">משלוחים</h1>
        <p className="text-lg text-muted-foreground mb-10">
          כל ההזמנות נארזות בקפידה ונשלחות אלייך בדרך הנוחה לך ביותר.
        </p>

        <div className="space-y-10 leading-relaxed text-foreground/90">
          <section>
            <h2 className="font-serif text-2xl italic mb-3">אפשרויות משלוח</h2>
            <ul className="list-disc pr-6 space-y-2">
              <li>
                <strong>משלוח עד הבית — 29.90 ₪.</strong>{" "}
                שליח עד הדלת, לכל הארץ.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl italic mb-3">אחרי ההזמנה</h2>
            <p>
              אנו עושים כל מאמץ שהתכשיט שלך יגיע מוקדם ככל האפשר, ונעדכן אותך
              בהתקדמות המשלוח.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl italic mb-3">מעקב אחר ההזמנה</h2>
            <p>
              לאחר שההזמנה יוצאת מהסטודיו תקבלי עדכון בפרטי הקשר שמסרת בעת הרכישה.
              לכל שאלה בנוגע לסטטוס ההזמנה ניתן לפנות אלינו בוואטסאפ או במייל{" "}
              <a href="mailto:info@royalsilver.net" className="underline hover:opacity-70">
                info@royalsilver.net
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl italic mb-3">שאלות נוספות</h2>
            <p>
              לא מצאת תשובה? צוות השירות שלנו זמין עבורך בוואטסאפ דרך הכפתור הירוק
              באתר, או במייל — ונחזור אלייך בהקדם.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
