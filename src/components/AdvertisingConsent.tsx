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
    {open && <section aria-label="הסכמה לעוגיות פרסום" className="fixed bottom-0 inset-x-0 z-50 border-t border-border bg-background px-5 py-5" dir="rtl">
      <div className="mx-auto max-w-4xl">
        <h2 className="font-serif text-2xl mb-2">הפרטיות שלך</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">{ADVERTISING_NOTICE}</p>
        <Link to="/privacy" className="inline-block text-sm underline mt-2">מדיניות פרטיות</Link>
        <div className="flex flex-wrap gap-3 mt-4">
          <Button variant="outline" onClick={() => choose("accepted")}>קבלת עוגיות פרסום</Button>
          <Button variant="outline" onClick={() => choose("rejected")}>דחיית עוגיות פרסום</Button>
          {hasChoice && <Button variant="ghost" onClick={() => setOpen(false)}>סגירה ללא שינוי</Button>}
        </div>
        {error && <p className="text-sm text-destructive mt-2">לא ניתן לשמור את הבחירה בדפדפן; המעקב לא הופעל מחדש.</p>}
      </div>
    </section>}
  </>;
}