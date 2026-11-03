import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { pageMeta, canonical, breadcrumbLd } from "@/lib/seo";

export const Route = createFileRoute("/accessibility")({
  head: () => ({
    meta: pageMeta({
      title: "הצהרת נגישות | Royal Silver",
      description:
        "אתר Royal Silver מונגש בהתאם לתקן הישראלי 5568 ול־WCAG 2.1 רמה AA, כדי שכל אחת תוכל לגלוש ולרכוש בנוחות.",
      path: "/accessibility",
    }),
    links: canonical("/accessibility"),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbLd([
            { name: "דף הבית", path: "/" },
            { name: "הצהרת נגישות", path: "/accessibility" },
          ]),
        ),
      },
    ],
  }),
  component: AccessibilityPage,
});

function AccessibilityPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <Header />
      <main id="main-content" className="container mx-auto px-6 py-16 max-w-3xl">
        <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">נגישות</p>
        <h1 className="font-serif text-4xl md:text-5xl italic mb-8">הצהרת נגישות</h1>

        <div className="space-y-6 leading-relaxed text-foreground/90">
          <p>
            אתר Royal Silver רואה בנגישות ערך מרכזי ופועל להנגיש את שירותיו לכלל הציבור,
            לרבות אנשים עם מוגבלויות, מתוך תפיסה שכל אדם זכאי לשוויון הזדמנויות במידע
            ובחוויית הקנייה המקוונת.
          </p>

          <section>
            <h2 className="font-serif text-2xl italic mb-3">תקני הנגישות באתר</h2>
            <p>
              האתר הונגש בהתאם לדרישות תקנות שוויון זכויות לאנשים עם מוגבלות (התאמות
              נגישות לשירות), התשע"ג-2013, ובהתאם לתקן הישראלי ת"י 5568 המבוסס על הנחיות
              <span> WCAG 2.1 ברמת AA.</span>
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl italic mb-3">התאמות הנגישות באתר</h2>
            <ul className="list-disc pr-6 space-y-2">
              <li>תפריט נגישות נגיש מכל עמוד באמצעות כפתור צף בפינת המסך.</li>
              <li>אפשרות להגדלה והקטנה של גודל הטקסט.</li>
              <li>מצבי ניגודיות גבוהה והיפוך צבעים.</li>
              <li>תצוגה בגווני אפור והדגשת קישורים.</li>
              <li>גופן קריא ועצירת אנימציות.</li>
              <li>הגדלת סמן העכבר.</li>
              <li>תמיכה בניווט מקלדת ובקוראי מסך, כותרות סמנטיות וטקסט חלופי לתמונות.</li>
              <li>שמירת ההעדפות בדפדפן המשתמש בין ביקורים.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl italic mb-3">חלקים שטרם הונגשו</h2>
            <p>
              ייתכן שבחלקים מסוימים באתר, בעיקר עמודי צד שלישי או תכנים חיצוניים, טרם
              הושלמה ההנגשה המלאה. אנו פועלים באופן שוטף לשיפור הנגישות.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl italic mb-3">פנייה בנושא נגישות</h2>
            <p>
              נתקלת בבעיית נגישות באתר? נשמח לקבל את פנייתך. נטפל בבקשה בהקדם האפשרי.
            </p>
            <ul className="mt-3 space-y-1">
              <li>
                דוא"ל:{" "}
                <a className="underline underline-offset-4" href="mailto:accessibility@royalsilver.net">
                  accessibility@royalsilver.net
                </a>
              </li>
              <li>אתר: royalsilver.net</li>
            </ul>
          </section>

          <p className="text-sm text-muted-foreground pt-4 border-t border-border">
            הצהרה זו עודכנה בתאריך 16 במאי 2026.
          </p>

          <div>
            <Link to="/" className="inline-block border-b border-foreground pb-1 text-sm">
              חזרה לעמוד הבית
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
