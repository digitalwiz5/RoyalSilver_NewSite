import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorRouteComponent,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { IS_PREVIEW, IS_STAGING, NOINDEX } from "@/lib/safe-mode";
import { AccessibilityWidget } from "@/components/AccessibilityWidget";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { AdvertisingConsent } from "@/components/AdvertisingConsent";
import { DiscountBenefit } from "@/components/DiscountBenefit";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">העמוד לא נמצא</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          העמוד שחיפשת לא קיים או שהועבר למקום אחר.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            לדף הבית
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          העמוד לא נטען
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          משהו השתבש אצלנו. אפשר לנסות לרענן או לחזור לדף הבית.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            נסי שוב
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            לדף הבית
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
      meta: [
        ...(NOINDEX ? [{ name: "robots", content: "noindex, nofollow" }] : []),
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: "Royal Silver — תכשיטים עדינים איכותיים" },
        { name: "description", content: "קולקציית תכשיטים איכותיים — שרשראות, עגילים, טבעות וצמידים. משלוח עד הבית ב־29.90 ₪." },
        { name: "author", content: "Royal Silver" },
        { property: "og:title", content: "Royal Silver — תכשיטים עדינים איכותיים" },
        { property: "og:description", content: "קולקציית תכשיטים איכותיים — שרשראות, עגילים, טבעות וצמידים." },
        { property: "og:type", content: "website" },
        { name: "google-site-verification", content: "Ch0sqwyrEYYXdNPjeX3IUUW2JK1IfWIA2LOpz7y7BrI" },
        { name: "twitter:card", content: "summary" },
        { name: "twitter:title", content: "Royal Silver — תכשיטים עדינים איכותיים" },
        { name: "twitter:description", content: "קולקציית תכשיטים איכותיים — שרשראות, עגילים, טבעות וצמידים." },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400&family=Heebo:wght@300;400;500;600&display=swap" },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent as unknown as ErrorRouteComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <HeadContent />
      </head>
      <body>
        <a href="#main-content" className="skip-link">דלג לתוכן הראשי</a>
        {children}
        <AccessibilityWidget />
        <WhatsAppButton />
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {(IS_PREVIEW || IS_STAGING) && (
        <div dir="rtl" className="bg-foreground text-background text-center text-xs py-1.5 px-3">
          {IS_STAGING
            ? "גרסת בדיקה · הקנייה אמיתית: כל הזמנה שתושלם תיווצר בחנות"
            : "תצוגה מקדימה לבדיקה בלבד · התשלום והעגלה מדומים, לא נוצרת הזמנה"}
        </div>
      )}
      <DiscountBenefit />
      <Outlet />
      <AdvertisingConsent />
    </QueryClientProvider>
  );
}
