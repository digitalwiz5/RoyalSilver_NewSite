import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { pageMeta, canonical, breadcrumbLd } from "@/lib/seo";
import { BRAND_IDENTITY } from "@/lib/brand-identity";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: pageMeta({
      title: "תקנון ותנאי שימוש | Royal Silver",
      description:
        "תנאי השימוש, ההזמנה והרכישה באתר Royal Silver — כל הפרטים על ההזמנה, התשלום וזכויותייך כלקוחה.",
      path: "/terms",
    }),
    links: canonical("/terms"),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbLd([
            { name: "דף הבית", path: "/" },
            { name: "תקנון ותנאי שימוש", path: "/terms" },
          ]),
        ),
      },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <Header />
      <main id="main-content" className="container mx-auto px-6 py-16 max-w-4xl">
        <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">
          תקנון ותנאי שימוש
        </p>
        <h1 className="font-serif text-4xl md:text-5xl italic mb-4">תקנון שימוש באתר</h1>
        <p className="text-lg text-muted-foreground mb-10">
          תקנון זה מנוסח בלשון נקבה מטעמי נוחות בלבד, ומופנה לנשים וגברים כאחד.
        </p>

        <div className="space-y-10 leading-relaxed text-foreground/90">
          <section>
            <h2 className="font-serif text-2xl italic mb-3">1. כללי</h2>
            <p>
              ברוכים הבאים לאתר <strong>Royal Silver | רויאל סילבר</strong> (להלן: "האתר").
              האתר משמש כחנות אונליין למכירת תכשיטים. הגלישה והשימוש באתר, לרבות ביצוע
              רכישות, מהווים הסכמה מלאה ובלתי מסויגת לכל תנאי תקנון זה. אם אינך מסכימה לאחד
              או יותר מהתנאים — אנא הימנעי משימוש באתר.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl italic mb-3">2. הגדרות</h2>
            <ul className="list-disc pr-6 space-y-2">
              <li><strong>"האתר":</strong> אתר האינטרנט royalsilver.net.</li>
              <li><strong>"החברה" / "הנהלת האתר":</strong> בעלי האתר ומפעיליו.</li>
              <li><strong>"משתמשת":</strong> כל אדם הגולש או מבצע פעולה באתר.</li>
              <li><strong>"מוצרים":</strong> תכשיטים ופריטים המוצעים למכירה באתר.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl italic mb-3">3. כשרות לביצוע רכישה</h2>
            <p>
              רשאית לבצע רכישה באתר משתמשת בת 18 שנים ומעלה, בעלת תעודת זהות ישראלית
              תקפה, וברשותה כתובת דוא"ל וכרטיס אשראי תקף. הזמנת קטין מחייבת אישור הורה
              או אפוטרופוס חוקי.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl italic mb-3">4. הזמנות ותשלום</h2>
            <ul className="list-disc pr-6 space-y-2">
              <li>הזמנה תחשב כאושרה רק לאחר קבלת אישור סופי במייל מהאתר.</li>
              <li>התשלום מתבצע באמצעות ספקי סליקה מאובטחים. פרטי האשראי אינם נשמרים בשרתי האתר.</li>
              <li>המחירים באתר נקובים בשקלים חדשים (₪) וכוללים מע"מ. דמי משלוח אינם כלולים אלא אם צוין אחרת.</li>
              <li>הנהלת האתר רשאית לשנות מחירים, מבצעים והטבות בכל עת וללא הודעה מוקדמת.</li>
              <li>במקרה של טעות מהותית במחיר מוצר, רשאית הנהלת האתר לבטל את ההזמנה ולהשיב את התשלום במלואו.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl italic mb-3">5. מלאי וזמינות</h2>
            <p>
              הצגת מוצר באתר אינה מהווה התחייבות לקיומו במלאי. במקרה שמוצר אזל, יוצע
              ללקוחה מוצר חלופי או החזר כספי מלא, לפי בחירתה.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl italic mb-3">6. משלוחים</h2>
            <ul className="list-disc pr-6 space-y-2">
              <li>זמני האספקה הם משוערים בלבד וחלים ימי עסקים בלבד (א'–ה', לא כולל חגים).</li>
              <li>אספקה תתבצע באמצעות חברת שליחויות / דואר ישראל לכתובת שתימסר בעת ההזמנה.</li>
              <li>משלוח עד הבית — 29.90 ₪ בכל סכום קנייה.</li>
              <li>הנהלת האתר לא תהיה אחראית לעיכובים שמקורם בצד שלישי, כגון חברת שליחויות או דואר.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl italic mb-3">7. ביטול עסקה והחזרות</h2>
            <p>
              בהתאם לחוק הגנת הצרכן, תשמ"א-1981, ניתן לבטל עסקה תוך 14 ימים מקבלת המוצר,
              בתנאי שהמוצר לא נעשה בו שימוש, ארוז באריזתו המקורית, ומלווה בחשבונית.
            </p>
            <p className="mt-3">
              <strong>חריגים:</strong> לא ניתן להחזיר עגילים מטעמי היגיינה ולא ניתן להחזיר
              מוצרים בהזמנה אישית או חריטה.
            </p>
            <p className="mt-3">
              דמי המשלוח והחזרת המוצר לחברה יחולו על הלקוחה. החזר כספי יבוצע באותו אמצעי
              תשלום ששימש לביצוע הרכישה, בניכוי דמי ביטול בשיעור של עד 5% מערך העסקה או 100 ₪
              — הנמוך מבין השניים.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl italic mb-3">8. אחריות ומדיניות תכשיטים</h2>
            <ul className="list-disc pr-6 space-y-2">
              <li>המוצרים עשויים מכסף 925, ציפוי זהב או פלדת אל חלד — כמפורט בדף המוצר.</li>
              <li>התכשיטים עוצבו לענידה יומיומית מחומרים איכותיים ועמידים.</li>
              <li>שינויי גוון קלים בציפוי לאורך זמן נחשבים בלאי טבעי ואינם פגם.</li>
              <li>אחריות החברה מוגבלת לפגמי ייצור בלבד, לתקופה של 30 יום מקבלת המוצר.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl italic mb-3">9. קניין רוחני</h2>
            <p>
              כל התכנים באתר — לרבות עיצוב, טקסטים, תמונות, לוגו וקוד — הם רכושה הבלעדי
              של Royal Silver. אין להעתיק, להפיץ, לשכפל או לעשות בהם שימוש מסחרי ללא
              אישור מראש ובכתב מהנהלת האתר.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl italic mb-3">10. אחריות ושיפוי</h2>
            <p>
              הנהלת האתר לא תישא באחריות לנזק ישיר או עקיף שייגרם כתוצאה משימוש באתר או
              במוצרים, לרבות נזקי גוף, רכוש או כל נזק תוצאתי. המשתמשת מתחייבת לשפות את
              החברה בגין כל נזק שיגרם בעקבות שימוש בלתי תקין באתר או הפרת תנאי תקנון זה.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl italic mb-3">11. פרטיות</h2>
            <p>
              המידע שייאסף עליך מנוהל בהתאם ל
              <Link to="/privacy" className="underline underline-offset-4">
                מדיניות הפרטיות
              </Link>
              {" "}של האתר, המהווה חלק בלתי נפרד מתקנון זה.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl italic mb-3">12. דין וסמכות שיפוט</h2>
            <p>
              על תקנון זה יחול הדין הישראלי בלבד. סמכות השיפוט הבלעדית בכל מחלוקת תהיה
              נתונה לבתי המשפט המוסמכים במחוז המרכז.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl italic mb-3">13. שינויים בתקנון</h2>
            <p>
              הנהלת האתר רשאית לעדכן את התקנון בכל עת. הנוסח המחייב הוא הנוסח המעודכן
              המופיע באתר במועד ביצוע הפעולה.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl italic mb-3">14. יצירת קשר</h2>
            <p>
              לכל שאלה ניתן לפנות אלינו במייל{" "}
              <a className="underline underline-offset-4" href="mailto:info@royalsilver.net">
                info@royalsilver.net
              </a>{" "}
              או בוואטסאפ{" "}
              <a className="underline underline-offset-4" href={`tel:${BRAND_IDENTITY.telephone}`}>
                <bdi>{BRAND_IDENTITY.displayTelephone}</bdi>
              </a>
              .
            </p>
          </section>

          <p className="text-sm text-muted-foreground pt-6 border-t border-border">
            עודכן לאחרונה: יוני 2026
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
