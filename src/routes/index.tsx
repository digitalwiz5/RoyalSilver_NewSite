import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { Header } from "@/components/Header";
import { useCartSync } from "@/hooks/useCartSync";
import { Toaster } from "@/components/ui/sonner";
import { BestSellers } from "@/components/BestSellers";
import { SocialLinks, socialLinks } from "@/components/SocialLinks";

import heroVideo from "@/assets/hero-video.mp4.asset.json";
import logoAsset from "@/assets/royalsilver-logo.png.asset.json";
import ringsImg from "@/assets/collection-rings.jpg";
import earringsImg from "@/assets/collection-earrings.jpg";
import necklacesImg from "@/assets/collection-necklaces.jpg";
import braceletsAsset from "@/assets/collection-bracelets.png.asset.json";
import setsAsset from "@/assets/collection-sets.png.asset.json";
import eitanModelAsset from "@/assets/eitan-black-hand.webp.asset.json";
import { pageMeta, canonical } from "@/lib/seo";
import { BRAND_IDENTITY, brandStructuredData } from "@/lib/brand-identity";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      ...pageMeta({
        title: "Royal Silver | רויאל סילבר — חנות תכשיטים",
        description:
          "Royal Silver | רויאל סילבר — חנות התכשיטים הרשמית ב־www.royalsilver.net. גלי טבעות, עגילים, שרשראות וצמידים לנשים ולגברים. ליצירת קשר: 050-242-6661.",
        path: "/",
        imageAlt: "Royal Silver — קולקציית תכשיטים",
      }),
      { property: "og:image:type", content: "image/jpeg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
    ],
    links: canonical("/"),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(brandStructuredData(socialLinks.map((s) => s.href))),
      },
    ],
  }),

  component: Home,
});

function Home() {
  useCartSync();

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    let inView = false;
    const apply = () => {
      const shouldPlaySound = inView && !document.hidden;
      el.muted = !shouldPlaySound;
      if (shouldPlaySound) el.play().catch(() => {});
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting && entry.intersectionRatio >= 0.5;
        apply();
      },
      { threshold: [0, 0.5, 1] },
    );
    observer.observe(el);

    // browsers may block unmuted playback until the user interacts once
    const onInteract = () => apply();
    document.addEventListener("click", onInteract);
    document.addEventListener("touchstart", onInteract, { passive: true });
    document.addEventListener("visibilitychange", apply);

    return () => {
      observer.disconnect();
      document.removeEventListener("click", onInteract);
      document.removeEventListener("touchstart", onInteract);
      document.removeEventListener("visibilitychange", apply);
      el.muted = true;
    };
  }, []);



  const collections = [
    { src: ringsImg, title: "טבעות נשים", slug: "rings" },
    { src: earringsImg, title: "עגילי נשים", slug: "earrings" },
    { src: necklacesImg, title: "שרשראות נשים", slug: "necklaces" },
    { src: braceletsAsset.url, title: "צמידים נשים", slug: "bracelets" },
    { src: setsAsset.url, title: "סטים", slug: "sets" },
  ] as const;

  const menCollections = [
    { title: "שרשראות גברים", slug: "men-necklaces" },
    { title: "צמידים גברים", slug: "men-bracelets" },
  ] as const;

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <Header />

      {/* INTRO VIDEO */}
      <section className="relative w-full h-[78vh] md:h-[86vh] overflow-hidden bg-secondary">
        <video
          ref={videoRef}
          key={heroVideo.filename}
          src={heroVideo.url}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background from-15% via-background/75 via-40% to-transparent to-70%" />
        <div className="relative z-10 h-full flex flex-col items-center justify-end pb-12 md:pb-16 text-center px-6">
          <p className="rs-eyebrow mb-4 text-foreground/80">Royal Silver</p>
          <h1 className="font-serif text-5xl md:text-7xl font-light italic leading-[1.05] text-foreground">
            תכשיטים שמספרים סיפור
          </h1>
          <span className="rs-rule my-5" aria-hidden="true" />
          <p className="max-w-md text-sm md:text-base text-foreground/75 leading-relaxed">
            עיצובים עדינים שנבחרים אחד־אחד, לענידה יומיומית ולרגעים שנשארים בזיכרון.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href="#collections" className="rs-btn-solid">לקולקציה</a>
            <Link to="/gifts" className="rs-btn-ghost">מתנות</Link>
          </div>
        </div>
      </section>

      {/* QUICK CATEGORIES */}
      <nav aria-label="קניות לפי קטגוריה" className="border-b border-border">
        <ul className="rs-rail container mx-auto px-6 py-4 flex gap-2 overflow-x-auto md:justify-center whitespace-nowrap">
          {[
            ["rings", "טבעות"], ["earrings", "עגילים"], ["necklaces", "שרשראות"], ["bracelets", "צמידים"],
            ["sets", "סטים"], ["men-necklaces", "שרשראות גברים"], ["men-bracelets", "צמידים גברים"],
          ].map(([slug, label]) => (
            <li key={slug}>
              <Link
                to="/category/$slug"
                params={{ slug }}
                className="inline-flex items-center min-h-11 px-5 border border-border text-sm hover:bg-foreground hover:text-background hover:border-foreground transition-colors duration-300"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* COLLECTIONS */}
      <section id="collections" className="container mx-auto px-4 md:px-6 py-20 md:py-28">
        <div className="text-center mb-12 md:mb-16 rs-reveal">
          <p className="rs-eyebrow mb-4">הקולקציות שלנו</p>
          <h2 className="font-serif text-4xl md:text-6xl font-light italic">בחרי את הסיפור שלך</h2>
          <span className="rs-rule my-6" aria-hidden="true" />
          <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
            כל קולקציה נבנתה סביב מצב רוח אחר — מהעדין שבשרשראות ועד הברק של העגילים.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {collections.map((c, i) => (
            <Link
              key={c.slug}
              to="/category/$slug"
              params={{ slug: c.slug }}
              className={`rs-tile rs-reveal relative overflow-hidden group block ${
                i === 0 ? "col-span-2 aspect-[5/4] md:aspect-auto md:row-span-2" : "aspect-[4/5]"
              }`}
            >
              <img
                src={c.src}
                alt={c.title}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/55 via-foreground/5 to-transparent" />
              <div className="absolute bottom-5 right-5 md:bottom-8 md:right-8 text-background">
                <h3 className={`font-serif font-light italic ${i === 0 ? "text-3xl md:text-5xl" : "text-xl md:text-3xl"}`}>{c.title}</h3>
                <span className="rs-link text-[0.6875rem] tracking-[0.22em] uppercase mt-2 md:mt-3">צפי בקולקציה</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* MEN'S COLLECTIONS */}
      <section className="border-t border-border bg-secondary">
        <div className="container mx-auto px-6 py-20 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="aspect-[4/5] overflow-hidden bg-background">
            <img
              src={eitanModelAsset.url}
              alt="צמיד איתן מקולקציית תכשיטי הגברים של Royal Silver"
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="rs-eyebrow mb-4">הקולקציות שלנו</p>
            <h2 className="font-serif text-4xl md:text-6xl font-light italic mb-8">תכשיטי גברים</h2>
            <nav aria-label="קטגוריות תכשיטי גברים" className="border-t border-border">
              {menCollections.map((collection) => (
                <Link
                  key={collection.slug}
                  to="/category/$slug"
                  params={{ slug: collection.slug }}
                  className="flex items-center justify-between py-5 border-b border-border text-lg hover:opacity-60 transition"
                >
                  <span>{collection.title}</span>
                  <span aria-hidden="true">←</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </section>

      {/* GIFTS */}
      <section aria-labelledby="gifts-title" className="border-y border-border bg-secondary">
        <div className="container mx-auto px-6 py-16 md:py-20 text-center rs-reveal">
          <p className="rs-eyebrow mb-4">מתנות</p>
          <h2 id="gifts-title" className="font-serif text-4xl md:text-5xl font-light italic">תכשיט שנשאר</h2>
          <span className="rs-rule my-6" aria-hidden="true" />
          <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
            בחרו למי המתנה ומה התקציב, ונציג את התכשיטים שזמינים כרגע.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-3 md:gap-5 max-w-3xl mx-auto">
            {([
              { who: "her", title: "מתנה לה", src: necklacesImg },
              { who: "him", title: "מתנה לו", src: eitanModelAsset.url },
            ] as const).map((g) => (
              <Link key={g.who} to="/gifts" search={{ for: g.who }} className="rs-tile group relative block aspect-[4/5] overflow-hidden">
                <img src={g.src} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/5 to-transparent" />
                <div className="absolute bottom-5 inset-x-0 text-center text-background">
                  <h3 className="font-serif text-2xl md:text-3xl font-light italic">{g.title}</h3>
                  <span className="rs-link text-[0.6875rem] tracking-[0.22em] uppercase mt-2">לבחירת מתנה</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* BEST SELLERS */}
      <BestSellers />

      {/* BRAND STORY */}
      <section className="container mx-auto px-6 py-20 md:py-28 border-t border-border">
        <div className="grid md:grid-cols-2 gap-10 md:gap-20 items-center max-w-5xl mx-auto">
          <div className="rs-tile relative aspect-[4/5] overflow-hidden rs-reveal">
            <img src={necklacesImg} alt="שרשרת עדינה מקולקציית Royal Silver" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
          </div>
          <div className="text-center md:text-start rs-reveal">
          <h2 className="font-serif text-4xl md:text-5xl font-light italic mb-6">כל תכשיט נבחר בקפידה</h2>
          <span className="rs-rule mb-8 mx-auto md:mx-0 md:ms-0" aria-hidden="true" />
          <p className="text-[15px] md:text-base text-foreground/75 leading-[2] mb-4">
            ב־Royal Silver | רויאל סילבר אנחנו מאמינים שתכשיט הוא הרבה יותר מאביזר – הוא חלק מהרגעים שאת רוצה לזכור.
          </p>
          <p className="text-[15px] md:text-base text-foreground/75 leading-[2] mb-4">
            לכן אנחנו מקפידים לבחור קולקציות איכותיות, בעיצובים על־זמניים ובגימור מוקפד, כדי שתוכלי ליהנות מתכשיט שנראה נפלא גם ביום הראשון וגם הרבה אחריו.
          </p>
          <p className="text-[15px] md:text-base text-foreground/75 leading-[2]">
            המטרה שלנו פשוטה: להעניק לך חווית קנייה נעימה, שירות אישי ותכשיטים שתשמחי לענוד שוב ושוב.
          </p>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="bg-secondary py-20">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {[
            { t: "חומרים איכותיים", d: "כסף סטרלינג 925, נירוסטה וציפויים עמידים — היפואלרגני וללא ניקל." },
            { t: "משלוח עד הבית ב־29.90 ₪", d: "משלוח עד הבית ב־29.90 ₪, לכל הארץ." },
            { t: "14 יום להחזרה", d: "בהתאם למדיניות ההחזרות." },
          ].map((v) => (
            <div key={v.t}>
              <h3 className="font-serif text-2xl italic mb-3">{v.t}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{v.d}</p>
            </div>
          ))}
        </div>
      </section>


      {/* FOOTER */}
      <footer className="border-t border-border">
        <div className="container mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div className="col-span-2">
            <h3 className="font-serif text-3xl italic mb-3">Royal Silver</h3>
            <p className="text-muted-foreground max-w-xs leading-relaxed">תכשיטים עדינים בעיצוב נצחי, לענידה יומיומית.</p>
            <SocialLinks className="mt-5" />
          </div>
          <div>
            <h4 className="font-medium mb-3">חנות</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link to="/category/$slug" params={{ slug: "necklaces" }} className="hover:opacity-70">שרשראות נשים</Link></li>
              <li><Link to="/category/$slug" params={{ slug: "earrings" }} className="hover:opacity-70">עגילי נשים</Link></li>
              <li><Link to="/category/$slug" params={{ slug: "rings" }} className="hover:opacity-70">טבעות נשים</Link></li>
              <li><Link to="/category/$slug" params={{ slug: "bracelets" }} className="hover:opacity-70">צמידים נשים</Link></li>
              <li><Link to="/category/$slug" params={{ slug: "sets" }} className="hover:opacity-70">סטים</Link></li>
              <li><Link to="/category/$slug" params={{ slug: "men-necklaces" }} className="hover:opacity-70">שרשראות גברים</Link></li>
              <li><Link to="/category/$slug" params={{ slug: "men-bracelets" }} className="hover:opacity-70">צמידים גברים</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-3">שירות</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="mailto:info@royalsilver.net" className="hover:opacity-70">צרי קשר</a></li>
              <li><a href={`tel:${BRAND_IDENTITY.telephone}`} className="hover:opacity-70"><bdi>{BRAND_IDENTITY.displayTelephone}</bdi></a></li>
              <li><Link to="/shipping" className="hover:opacity-70">משלוחים</Link></li>
              <li><Link to="/returns" className="hover:opacity-70">החזרות</Link></li>
              <li><Link to="/faq" className="hover:opacity-70">שאלות נפוצות</Link></li>
              <li><Link to="/accessibility" className="hover:opacity-70">הצהרת נגישות</Link></li>
              <li><Link to="/privacy" className="hover:opacity-70">מדיניות פרטיות</Link></li>
              <li><Link to="/terms" className="hover:opacity-70">תקנון ותנאי שימוש</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border py-8 flex flex-col items-center gap-4">
          <img
            src={logoAsset.url}
            alt="לוגו Royal Silver"
            loading="lazy"
            className="w-44 h-auto object-contain"
          />
          <p className="text-center text-xs text-muted-foreground">
            © 2026 Royal Silver. כל הזכויות שמורות.
          </p>
          <p className="text-center text-xs text-muted-foreground">
            נבנה ופורסם באמצעות{" "}
            <a
              href="https://www.digitalwiz.digital"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:opacity-70 transition-opacity"
            >
              DigitalWiz
            </a>
          </p>
        </div>
      </footer>

      <Toaster position="top-center" />
    </div>
  );
}
