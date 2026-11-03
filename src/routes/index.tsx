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
      <section className="relative w-full h-[65vh] md:h-[75vh] overflow-hidden bg-background">
        <video
          ref={videoRef}
          key={heroVideo.asset_id}
          src={heroVideo.url}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-background/10" />
        <div className="relative z-10 h-full flex flex-col items-center justify-end pb-10 text-center px-6">
          <p className="text-xs tracking-[0.3em] uppercase text-foreground/80 mb-2">Royal Silver</p>
          <h1 className="font-serif text-4xl md:text-6xl tracking-tight italic text-foreground">
            תכשיטים שמספרים סיפור
          </h1>
          <p className="mt-3 max-w-sm text-sm md:text-base text-foreground/70 leading-relaxed">
            עיצובים עדינים שנבחרים אחד־אחד, לענידה יומיומית ולרגעים שנשארים בזיכרון.
          </p>

          <a
            href="#collections"
            className="mt-6 inline-block bg-foreground text-background px-9 py-3.5 text-xs tracking-widest uppercase hover:opacity-90 transition"
          >
            לקולקציה
          </a>
        </div>
      </section>

      {/* COLLECTIONS */}
      <section id="collections" className="container mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">הקולקציות שלנו</p>
          <h2 className="font-serif text-4xl md:text-5xl italic">בחרי את הסיפור שלך</h2>
          <p className="text-sm text-muted-foreground mt-4 max-w-md mx-auto leading-relaxed">
            כל קולקציה נבנתה סביב מצב רוח אחר — מהעדין שבשרשראות ועד הברק של העגילים.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          {collections.map((c) => (
            <Link
              key={c.slug}
              to="/category/$slug"
              params={{ slug: c.slug }}
              className="relative aspect-[4/5] overflow-hidden group block"
            >
              <img
                src={c.src}
                alt={c.title}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
              <div className="absolute bottom-8 right-8 text-background">
                <h3 className="font-serif text-3xl italic">{c.title}</h3>
                <p className="text-xs tracking-widest uppercase mt-2 border-b border-background pb-1 inline-block">
                  צפי בקולקציה
                </p>
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
            <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">הקולקציות שלנו</p>
            <h2 className="font-serif text-4xl md:text-5xl italic mb-8">תכשיטי גברים</h2>
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

      {/* BEST SELLERS */}
      <BestSellers />

      {/* BRAND STORY */}
      <section className="container mx-auto px-6 py-20 md:py-24 border-t border-border">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl italic mb-6">כל תכשיט נבחר בקפידה</h2>
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
