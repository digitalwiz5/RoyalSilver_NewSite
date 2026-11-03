import { useEffect, useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ADVERTISING_NOTICE, CONSENT_KEY, readConsent, requiresAdvertisingConsent, resolveRegion, saveConsent } from "@/lib/advertising-consent";
import { trackCurrentPage, updatePixelConsent } from "@/lib/meta-pixel";

export function AdvertisingConsent() {
  const [region, setRegion] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(false);
  const [hasChoice, setHasChoice] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const pathname = useLocation({ select: location => location.pathname });
  useEffect(() => {
    let active = true;
    let resolved = false;
    let location: string | null = null;
    const sync = () => {
      if (!resolved) return;
      updatePixelConsent(location);
      setHasChoice(readConsent() !== null);
      setOpen(requiresAdvertisingConsent(location) && !readConsent());
    };
    void resolveRegion().then(value => {
      if (!active) return;
      location = value; resolved = true; setRegion(value); sync();
    });
    const storage = (event: StorageEvent) => { if (event.key === CONSENT_KEY || event.key === null) sync(); };
    window.addEventListener("royalsilver:consent", sync);
    window.addEventListener("storage", storage);
    return () => { active = false; window.removeEventListener("royalsilver:consent", sync); window.removeEventListener("storage", storage); };
  }, []);
  useEffect(() => { trackCurrentPage(); }, [pathname]);
  const choose = (choice: "accepted" | "rejected") => {
    if (saveConsent(choice, region)) { setError(false); setOpen(false); }
    else setError(true);
  };
  return <>
    {!open && <Button variant="outline" size="sm" className="fixed bottom-3 left-20 z-40 text-xs" onClick={() => setOpen(true)}>הגדרות עוגיות</Button>}
    {open && <section aria-label="הסכמה לעוגיות פרסום" className="fixed bottom-0 inset-x-0 z-50 border-t border-border bg-background px-4 py-3 md:px-5 md:py-5 max-h-[60vh] overflow-y-auto" dir="rtl">
      <div className="mx-auto max-w-4xl">
        <h2 className="font-serif text-lg md:text-2xl mb-1 md:mb-2">הפרטיות שלך</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {expanded ? ADVERTISING_NOTICE : "אנו משתמשים ב־Meta Pixel למדידת פרסום ושיפור מודעות, רק בהסכמתך."}
          {" "}<button type="button" className="underline" aria-expanded={expanded} onClick={() => setExpanded(v => !v)}>{expanded ? "הצגה מקוצרת" : "פרטים נוספים"}</button>
          {" · "}<Link to="/privacy" className="underline">מדיניות פרטיות</Link>
        </p>
        <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2 md:gap-3 mt-3">
          <Button variant="outline" onClick={() => choose("accepted")}>קבלת עוגיות פרסום</Button>
          <Button variant="outline" onClick={() => choose("rejected")}>דחיית עוגיות פרסום</Button>
          {hasChoice && <Button variant="ghost" className="col-span-2 md:col-span-1" onClick={() => setOpen(false)}>סגירה ללא שינוי</Button>}
        </div>
        {error && <p className="text-sm text-destructive mt-2">לא ניתן לשמור את הבחירה בדפדפן; המעקב לא הופעל מחדש.</p>}
      </div>
    </section>}
  </>;
}