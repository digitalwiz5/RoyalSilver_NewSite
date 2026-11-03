import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { pageMeta, canonical, breadcrumbLd } from "@/lib/seo";

export const Route = createFileRoute("/returns")({
  head: () => ({
    meta: pageMeta({
      title: "החזרות והחלפות | Royal Silver",
      description:
        "14 יום להחזרה בהתאם למדיניות ההחזרות של Royal Silver — כך מחזירים או מחליפים תכשיט, שלב אחר שלב.",
      path: "/returns",
    }),
    links: canonical("/returns"),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbLd([
            { name: "דף הבית", path: "/" },
            { name: "החזרות", path: "/returns" },
          ]),
        ),
      },
    ],
  }),
  component: ReturnsPage,
});

function ReturnsPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <Header />
      <main id="main-content" className="container mx-auto px-6 py-16 max-w-4xl">
        <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">שירות לקוחות</p>
        <h1 className="font-serif text-4xl md:text-5xl italic mb-4">החזרות והחלפות</h1>
        <p className="text-lg text-muted-foreground mb-10">
          14 יום להחזרה בהתאם למדיניות ההחזרות.
        </p>

        <div className="space-y-10 leading-relaxed text-foreground/90">
          <section>
            <h2 className="font-serif text-2xl italic mb-3">14 יום להחזרה</h2>
            <p>
              ניתן להחזיר מוצר תוך <strong>14 יום</strong> מיום קבלתו, באריזתו
              המקורית וללא סימני שימוש, בהתאם למדיניות ההחזרות.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl italic mb-3">איך מבצעים החזרה?</h2>
            <ul className="list-disc pr-6 space-y-2">
              <li>פונים אלינו בוואטסאפ או במייל עם מספר ההזמנה.</li>
              <li>אנחנו מעבירים הנחיות להחזרת המוצר אלינו.</li>
              <li>לאחר קבלת המוצר ובדיקתו, הזיכוי מבוצע לאמצעי התשלום ששימש ברכישה.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl italic mb-3">החלפות</h2>
            <p>
              רוצה להחליף דגם או צבע? נשמח לעזור. פני אלינו ונמצא יחד את התכשיט
              המושלם עבורך.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl italic mb-3">מקרים חריגים</h2>
            <p>
              מוצרים שהוזמנו בהתאמה אישית או שבוצע בהם שינוי לבקשת הלקוחה לא ניתנים
              להחזרה, אלא במקרה של פגם במוצר. במקרה של פגם — נחליף או נזכה במלואו,
              כמובן.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl italic mb-3">יצירת קשר</h2>
            <p>
              לבירור החזרה או החלפה:{" "}
              <a href="mailto:info@royalsilver.net?subject=החזרה" className="underline hover:opacity-70">
                info@royalsilver.net
              </a>{" "}
              או בוואטסאפ דרך הכפתור הירוק באתר.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
