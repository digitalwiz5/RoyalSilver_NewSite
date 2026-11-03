import { Link, useLocation } from "@tanstack/react-router";
import { HOME_ONLY_HANDLES, PRETTY_TO_REAL_HANDLE } from "@/lib/handles";
import { ChevronDown, Menu } from "lucide-react";
import { useState } from "react";
import { CartDrawer } from "@/components/CartDrawer";
import { SocialLinks } from "@/components/SocialLinks";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type NavItem = { label: string; slug: string };
type NavGroup = { label: string; items: NavItem[] };

const navGroups: NavGroup[] = [
  {
    label: "נשים",
    items: [
      { label: "שרשראות נשים", slug: "necklaces" },
      { label: "עגילי נשים", slug: "earrings" },
      { label: "טבעות נשים", slug: "rings" },
      { label: "צמידים נשים", slug: "bracelets" },
      { label: "סטים", slug: "sets" },
    ],
  },
  {
    label: "גברים",
    items: [
      { label: "שרשראות גברים", slug: "men-necklaces" },
      { label: "צמידים גברים", slug: "men-bracelets" },
    ],
  },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = useLocation({ select: (l) => l.pathname });
  const productMatch = pathname.match(/^\/product\/(.+)$/);
  const productHandle = productMatch ? decodeURIComponent(productMatch[1]) : null;
  const isHomeOnlyProduct =
    productHandle !== null &&
    (HOME_ONLY_HANDLES.has(productHandle) ||
      HOME_ONLY_HANDLES.has(PRETTY_TO_REAL_HANDLE[productHandle] ?? ""));

  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="bg-foreground text-background text-center text-xs py-2 tracking-widest uppercase">
        {isHomeOnlyProduct
          ? "משלוח עד הבית ב־29.90 ₪ • 2–5 ימי עסקים"
          : "משלוח עד הבית ב־29.90 ₪"}
      </div>
      <div className="container mx-auto px-6 h-16 flex items-center justify-between" dir="rtl">
        <div className="flex items-center gap-2">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button className="md:hidden p-2 hover:opacity-70" aria-label="תפריט">
                <Menu className="h-5 w-5" strokeWidth={1.25} />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72" dir="rtl">
              <SheetHeader>
                <SheetTitle className="font-serif text-2xl italic text-right">תפריט</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col mt-6">
                <Link
                  to="/"
                  onClick={() => setOpen(false)}
                  className="text-base py-3 px-2 border-b border-border hover:opacity-60 transition"
                >
                  הכל
                </Link>
                {navGroups.map((g) => (
                  <div key={g.label} className="border-b border-border">
                    <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground pt-4 pb-1 px-2">
                      {g.label}
                    </p>
                    {g.items.map((item) => (
                      <Link
                        key={item.slug}
                        to="/category/$slug"
                        params={{ slug: item.slug }}
                        onClick={() => setOpen(false)}
                        className="block text-base py-2.5 px-2 hover:opacity-60 transition"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <Link to="/" className="font-serif text-3xl tracking-tight italic">
            royalsilver
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm tracking-wider">
          <Link to="/" className="hover:opacity-60 transition">
            הכל
          </Link>
          {navGroups.map((g) => (
            <div key={g.label} className="relative group">
              <button className="flex items-center gap-1 hover:opacity-60 transition py-4">
                {g.label}
                <ChevronDown className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
              <div className="absolute top-full right-0 hidden group-hover:block pt-1 min-w-44">
                <div className="bg-background border border-border shadow-sm py-2">
                  {g.items.map((item) => (
                    <Link
                      key={item.slug}
                      to="/category/$slug"
                      params={{ slug: item.slug }}
                      className="block px-5 py-2.5 hover:bg-secondary transition whitespace-nowrap"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </nav>
        <div className="flex items-center gap-1 sm:gap-3">
          <SocialLinks className="mr-2" />
          <CartDrawer />
        </div>
      </div>
    </header>
  );
}
