import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { pageMeta, canonical, breadcrumbLd } from "@/lib/seo";
import { BRAND_IDENTITY } from "@/lib/brand-identity";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: pageMeta({
      title: "מדיניות פרטיות | Royal Silver",
      description:
        "כיצד Royal Silver אוספת, שומרת ומגנה על המידע שלך בעת גלישה ורכישה באתר — מדיניות פרטיות מלאה בעברית ובאנגלית.",
      path: "/privacy",
    }),
    links: canonical("/privacy"),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbLd([
            { name: "דף הבית", path: "/" },
            { name: "מדיניות פרטיות", path: "/privacy" },
          ]),
        ),
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <Header />
      <main id="main-content" className="container mx-auto px-6 py-16 max-w-4xl">
        <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">מדיניות פרטיות / Privacy Policy</p>
        <h1 className="font-serif text-4xl md:text-5xl italic mb-4">
          מדיניות פרטיות
        </h1>
        <p className="text-lg text-muted-foreground mb-10">
          Privacy Policy
        </p>

        <div className="space-y-10 leading-relaxed text-foreground/90">
          {/* INTRO */}
          <section>
            <p className="mb-4">
              ברוכים הבאים לאתר <strong>Royal Silver | רויאל סילבר</strong> (להלן: "האתר"). מסמך זה מסביר את השימוש במידע; גלישה באתר אינה הסכמה לעוגיות פרסום במקום שבו נדרשת הסכמה.
            </p>
            <p className="text-muted-foreground">
              Welcome to the <strong>Royal Silver | רויאל סילבר</strong> website (hereinafter: "the Site"). This notice explains data use; browsing is not advertising consent where consent is required.
            </p>
          </section>

          {/* BUSINESS INFO */}
          <section>
            <h2 className="font-serif text-2xl italic mb-4">פרטי העסק | Business Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p><strong>שם העסק:</strong> רויאל סילבר</p>
                <p><strong>Business Name:</strong> Royal Silver</p>
                <p><strong>כתובת:</strong> הטייסים 4, רחובות, ישראל</p>
                <p><strong>Address:</strong> Hataisim 4, Rehovot, Israel</p>
              </div>
              <div className="space-y-2">
                <p><strong>טלפון / וואטסאפ:</strong> <a className="underline underline-offset-4" href={`tel:${BRAND_IDENTITY.telephone}`}><bdi>{BRAND_IDENTITY.displayTelephone}</bdi></a></p>
                <p><strong>Phone / WhatsApp:</strong> <a className="underline underline-offset-4" href={`tel:${BRAND_IDENTITY.telephone}`}><bdi>{BRAND_IDENTITY.telephone}</bdi></a></p>
                <p><strong>אימייל:</strong> <a className="underline underline-offset-4" href="mailto:digitalwiz5@gmail.com">digitalwiz5@gmail.com</a></p>
                <p><strong>Email:</strong> <a className="underline underline-offset-4" href="mailto:digitalwiz5@gmail.com">digitalwiz5@gmail.com</a></p>
              </div>
            </div>
          </section>

          {/* PRIVACY POLICY */}
          <section>
            <h2 className="font-serif text-2xl italic mb-4">מדיניות פרטיות | Privacy Policy</h2>

            <div className="space-y-5">
              <div>
                <h3 className="font-semibold mb-1">איסוף מידע | Information Collection</h3>
                <p>אנו עשויים לאסוף מידע אישי כגון: שם מלא, טלפון, אימייל, כתובת למשלוח, פרטי הזמנה, כתובת IP ונתוני גלישה. המידע נאסף בעת רכישה, הרשמה או יצירת קשר.</p>
                <p className="text-muted-foreground mt-1">We may collect personal information such as: full name, phone, email, shipping address, order details, IP address and browsing data. Information is collected during purchase, registration or contact.</p>
              </div>

              <div>
                <h3 className="font-semibold mb-1">שימוש במידע | Use of Information</h3>
                <p>המידע משמש ל: טיפול בהזמנות ומשלוחים, שירות לקוחות, שיפור האתר, שליחת עדכונים (בהסכמה).</p>
                <p className="text-muted-foreground mt-1">Information is used for: order and shipping processing, customer service, site improvement, sending updates (with consent).</p>
              </div>

              <div>
                <h3 className="font-semibold mb-1">מסירת מידע | Information Disclosure</h3>
                <p>המידע לא יימכר לצדדים שלישיים, למעט: חברות משלוחים, ספקי סליקה, דרישה חוקית.</p>
                <p className="text-muted-foreground mt-1">Information will not be sold to third parties, except: shipping companies, payment processors, legal requirements.</p>
              </div>

              <div>
                <h3 className="font-semibold mb-1">אבטחת מידע | Data Security</h3>
                <p>האתר משתמש באמצעי אבטחה מתקדמים. פרטי אשראי אינם נשמרים במערכת האתר.</p>
                <p className="text-muted-foreground mt-1">The Site uses advanced security measures. Credit card details are not stored in the Site system.</p>
              </div>

              <div>
                <h3 className="font-semibold mb-1">Cookies</h3>
                <p>האתר משתמש בקובצי Cookies לצורך תפעול, ניתוח ושיווק.</p>
                <p className="text-muted-foreground mt-1">The Site uses cookies for operation, analytics and marketing.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Meta Pixel והסכמת פרסום | Advertising privacy</h3>
                <p>Royal Silver משתמשת בפיקסל של Meta (Facebook ו־Instagram) למדידת צפייה בעמודים ובמוצרים, הוספה לסל ולשיפור מודעות. כאשר המעקב מותר, נשלחים ל־Meta כתובת עמוד ללא פרטי קשר, מזהי מוצרים ווריאציות, סכומים ומטבע, פרטי דפדפן, כתובת IP ומזהי עוגיות כגון _fbp ו־_fbc. אין באתר זה העברת אימייל, טלפון או מזהה לקוח לצורך התאמה מתקדמת, ואין דיווח התחלת תשלום, רכישה או Conversions API נוסף מ־Lovable. התשלום מתבצע בשופיפיי, שם התחלת תשלום נמדדת בנפרד וחלות הגדרות הפרטיות והמעקב של התשלום.</p>
                <p className="mt-2">באזורים המחייבים הסכמה, או כשהאזור אינו ידוע, המעקב חסום עד לקבלת עוגיות פרסום. בשאר האזורים המעקב מופעל בכפוף לדחייה מפורשת ולאותות פרטיות בדפדפן. אפשר לדחות באותה קלות כמו לקבל, ולבטל בכל עת באמצעות „הגדרות עוגיות” בתחתית האתר; הביטול חל מיד וגם בלשוניות אחרות. עוגיות תפעוליות של הסל נשארות זמינות. הבחירה, מועד הבחירה, האזור, מזהה מקומי אקראי ונוסח ההודעה נשמרים בדפדפן, כולל תיעוד הסכמה קודמת כשמבטלים אותה. מחיקת אחסון הדפדפן מוחקת תיעוד מקומי זה.</p>
                <p className="text-muted-foreground mt-2">Meta Pixel receives page/product views and cart additions for advertising measurement and optimization, including page URLs, product/variant IDs, values, currency, browser/IP information and advertising cookie identifiers. No advanced customer matching or additional InitiateCheckout/Purchase/CAPI reporting is enabled by this site. Shopify measures checkout initiation and has separate privacy controls. Consent-required or unknown regions are blocked until acceptance. Cookie settings allow rejection or withdrawal at any time, including across tabs. Choice, time, region, local visitor ID and notice text/history are stored locally; clearing browser storage deletes this local evidence.</p>
                <a className="inline-block underline mt-2" href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noreferrer">מדיניות הפרטיות של Meta</a>
              </div>
            </div>
          </section>

          {/* TERMS OF SERVICE */}
          <section>
            <h2 className="font-serif text-2xl italic mb-4">תנאי שימוש | Terms of Service</h2>

            <div className="space-y-5">
              <div>
                <h3 className="font-semibold mb-1">כללי | General</h3>
                <p>האתר משמש כחנות אונליין למכירת תכשיטים. הנהלת האתר רשאית לעדכן תנאים אלו בכל עת.</p>
                <p className="text-muted-foreground mt-1">The Site serves as an online store for jewelry sales. Site management may update these terms at any time.</p>
              </div>

              <div>
                <h3 className="font-semibold mb-1">הזמנות ותשלומים | Orders & Payments</h3>
                <p>כל הזמנה כפופה לאישור. ניתן לבטל הזמנה במקרה של טעות / תקלה. התשלום מתבצע דרך ספקים מאובטחים.</p>
                <p className="text-muted-foreground mt-1">Every order is subject to approval. Orders may be cancelled in case of error. Payment is processed through secure providers.</p>
              </div>

              <div>
                <h3 className="font-semibold mb-1">מחירים | Pricing</h3>
                <p>המחירים בשקלים חדשים (₪) וניתנים לשינוי.</p>
                <p className="text-muted-foreground mt-1">Prices are in New Israeli Shekels (₪) and subject to change.</p>
              </div>

              <div>
                <h3 className="font-semibold mb-1">משלוחים | Shipping</h3>
                <p>זמני אספקה משוערים בלבד. אין אחריות לעיכובים של צד שלישי.</p>
                <p className="text-muted-foreground mt-1">Delivery times are estimates only. No liability for third-party delays.</p>
              </div>
            </div>
          </section>

          {/* JEWELRY POLICY */}
          <section>
            <h2 className="font-serif text-2xl italic mb-4">מדיניות תכשיטים | Jewelry Policy</h2>
            <p>המוצרים עשויים לכלול: כסף 925, ציפוי זהב, פלדת אל חלד.</p>
            <p className="text-muted-foreground mt-2">Products may include: 925 silver, gold plating, stainless steel.</p>
            <p className="mt-3">חשוב לדעת: התכשיטים עוצבו לענידה יומיומית מחומרים איכותיים. שינויי גוון קלים בציפוי לאורך זמן נחשבים בלאי טבעי ואינם מהווים פגם.</p>
            <p className="text-muted-foreground mt-1">Important to know: our jewelry is designed for everyday wear using quality materials. Slight changes in plating tone over time are considered natural wear, not a defect.</p>
          </section>

          {/* RETURNS */}
          <section>
            <h2 className="font-serif text-2xl italic mb-4">החזרות וביטולים | Returns</h2>
            <p>ניתן להחזיר מוצר תוך 14 ימים בתנאים: לא נעשה שימוש, באריזה מקורית.</p>
            <p className="text-muted-foreground mt-2">Products may be returned within 14 days: unused, in original packaging.</p>
            <p className="mt-3">לא ניתן להחזיר: עגילים, מוצרים בהתאמה אישית.</p>
            <p className="text-muted-foreground mt-1">Cannot be returned: earrings, custom-made products.</p>
          </section>

          {/* LIMITATION OF LIABILITY */}
          <section>
            <h2 className="font-serif text-2xl italic mb-4">הגבלת אחריות | Limitation of Liability</h2>
            <p>האתר אינו אחראי ל: שימוש לא נכון, שבר או בלאי, נזקים עקיפים.</p>
            <p className="text-muted-foreground mt-2">The Site is not liable for: improper use, breakage or wear, indirect damages.</p>
          </section>

          {/* INTELLECTUAL PROPERTY */}
          <section>
            <h2 className="font-serif text-2xl italic mb-4">קניין רוחני | Intellectual Property</h2>
            <p>כל התוכן באתר שייך ל־Royal Silver | רויאל סילבר ואין לעשות בו שימוש ללא אישור.</p>
            <p className="text-muted-foreground mt-2">All content on the Site belongs to Royal Silver | רויאל סילבר and may not be used without permission.</p>
          </section>

          {/* GOVERNING LAW */}
          <section>
            <h2 className="font-serif text-2xl italic mb-4">דין וסמכות שיפוט | Governing Law</h2>
            <p>הדין החל: מדינת ישראל. סמכות שיפוט: בתי המשפט באזור המרכז.</p>
            <p className="text-muted-foreground mt-2">Governing law: State of Israel. Jurisdiction: courts in the Central District.</p>
          </section>

          {/* UPDATES */}
          <section>
            <h2 className="font-serif text-2xl italic mb-4">עדכונים | Updates</h2>
            <p>הנהלת האתר רשאית לעדכן מסמך זה בכל עת. הגרסה באתר היא הקובעת.</p>
            <p className="text-muted-foreground mt-2">Site management may update this document at any time. The version on the Site is the binding one.</p>
          </section>

          <p className="text-sm text-muted-foreground pt-6 border-t border-border">
            מסמך זה עודכן בתאריך | Last updated: 20 באוקטובר 2026 | October 20, 2026
          </p>

          <div>
            <Link to="/" className="inline-block border-b border-foreground pb-1 text-sm">
              חזרה לעמוד הבית | Back to Home
            </Link>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border mt-12">
        <div className="container mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div className="col-span-2">
            <h3 className="font-serif text-3xl italic mb-3">Royal Silver</h3>
            <p className="text-muted-foreground max-w-xs">תכשיטים עדינים, עיצוב נצחי. | Delicate jewelry, timeless design.</p>
          </div>
          <div>
            <h4 className="font-medium mb-3">חנות | Shop</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>שרשראות | Necklaces</li>
              <li>עגילים | Earrings</li>
              <li>טבעות | Rings</li>
              <li>צמידים | Bracelets</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-3">שירות | Service</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>צרי קשר | Contact</li>
              <li>משלוחים | Shipping</li>
              <li>החזרות | Returns</li>
              <li><Link to="/accessibility" className="hover:opacity-70">הצהרת נגישות | Accessibility</Link></li>
              <li><Link to="/terms" className="hover:opacity-70">תקנון ותנאי שימוש | Terms</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
          © 2026 Royal Silver | רויאל סילבר. כל הזכויות שמורות | All rights reserved.
        </div>
      </footer>
    </div>
  );
}
