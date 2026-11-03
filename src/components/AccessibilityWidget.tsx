import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Accessibility, X, Plus, Minus, RotateCcw } from "lucide-react";

type Settings = {
  fontScale: number;
  contrast: "normal" | "high" | "inverted";
  grayscale: boolean;
  highlightLinks: boolean;
  readableFont: boolean;
  pauseAnimations: boolean;
  bigCursor: boolean;
};

const DEFAULTS: Settings = {
  fontScale: 1,
  contrast: "normal",
  grayscale: false,
  highlightLinks: false,
  readableFont: false,
  pauseAnimations: false,
  bigCursor: false,
};

const STORAGE_KEY = "a11y-settings";

function applySettings(s: Settings) {
  const root = document.documentElement;
  root.style.fontSize = `${s.fontScale * 100}%`;
  root.dataset.a11yContrast = s.contrast;
  root.dataset.a11yGrayscale = s.grayscale ? "on" : "off";
  root.dataset.a11yLinks = s.highlightLinks ? "on" : "off";
  root.dataset.a11yReadable = s.readableFont ? "on" : "off";
  root.dataset.a11yAnim = s.pauseAnimations ? "off" : "on";
  root.dataset.a11yCursor = s.bigCursor ? "big" : "normal";
}

export function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULTS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = { ...DEFAULTS, ...JSON.parse(raw) };
        setSettings(parsed);
        applySettings(parsed);
      }
    } catch {}
  }, []);

  const update = (patch: Partial<Settings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    applySettings(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  const reset = () => {
    setSettings(DEFAULTS);
    applySettings(DEFAULTS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="פתיחת תפריט נגישות"
        className="fixed bottom-4 left-4 z-50 h-12 w-12 rounded-full bg-foreground text-background shadow-lg flex items-center justify-center hover:opacity-90 focus:outline-none focus-visible:ring-4 focus-visible:ring-ring"
      >
        <Accessibility className="h-6 w-6" strokeWidth={1.5} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 flex items-stretch"
          role="dialog"
          aria-modal="true"
          aria-label="תפריט נגישות"
          onClick={() => setOpen(false)}
        >
          <div
            dir="rtl"
            className="ms-auto w-full max-w-sm bg-background h-full overflow-y-auto p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl">נגישות</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="סגירה"
                className="p-2 hover:opacity-70 focus-visible:ring-2 focus-visible:ring-ring rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <section className="mb-6">
              <h3 className="text-sm font-medium mb-3">גודל טקסט</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => update({ fontScale: Math.max(0.85, settings.fontScale - 0.1) })}
                  aria-label="הקטן טקסט"
                  className="h-11 w-11 border border-border rounded flex items-center justify-center hover:bg-accent"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="flex-1 text-center text-sm" aria-live="polite">
                  {Math.round(settings.fontScale * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => update({ fontScale: Math.min(1.6, settings.fontScale + 0.1) })}
                  aria-label="הגדל טקסט"
                  className="h-11 w-11 border border-border rounded flex items-center justify-center hover:bg-accent"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </section>

            <section className="mb-6">
              <h3 className="text-sm font-medium mb-3">ניגודיות</h3>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { v: "normal", l: "רגיל" },
                  { v: "high", l: "גבוה" },
                  { v: "inverted", l: "הפוך" },
                ] as const).map((o) => (
                  <button
                    key={o.v}
                    type="button"
                    onClick={() => update({ contrast: o.v })}
                    aria-pressed={settings.contrast === o.v}
                    className={`min-h-11 text-sm border rounded px-2 ${
                      settings.contrast === o.v
                        ? "bg-foreground text-background border-foreground"
                        : "border-border hover:bg-accent"
                    }`}
                  >
                    {o.l}
                  </button>
                ))}
              </div>
            </section>

            <section className="mb-6 space-y-2">
              {[
                { k: "grayscale" as const, l: "גווני אפור" },
                { k: "highlightLinks" as const, l: "הדגשת קישורים" },
                { k: "readableFont" as const, l: "גופן קריא" },
                { k: "pauseAnimations" as const, l: "עצירת אנימציות" },
                { k: "bigCursor" as const, l: "סמן גדול" },
              ].map((o) => (
                <label
                  key={o.k}
                  className="flex items-center justify-between gap-3 min-h-11 px-3 border border-border rounded cursor-pointer hover:bg-accent"
                >
                  <span className="text-sm">{o.l}</span>
                  <input
                    type="checkbox"
                    checked={Boolean(settings[o.k])}
                    onChange={(e) => update({ [o.k]: e.target.checked } as Partial<Settings>)}
                    className="h-5 w-5"
                  />
                </label>
              ))}
            </section>

            <button
              type="button"
              onClick={reset}
              className="w-full min-h-11 flex items-center justify-center gap-2 border border-border rounded hover:bg-accent text-sm mb-4"
            >
              <RotateCcw className="h-4 w-4" />
              איפוס הגדרות
            </button>

            <Link
              to="/accessibility"
              onClick={() => setOpen(false)}
              className="block text-center text-sm underline underline-offset-4 hover:opacity-70"
            >
              הצהרת נגישות
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
