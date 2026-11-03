import { Facebook, Instagram } from "lucide-react";
import { BRAND_IDENTITY } from "@/lib/brand-identity";

export const socialLinks = [
  {
    label: "אינסטגרם",
    href: "https://www.instagram.com/royal_silver_jewelry_store?igsi=MThhNHJnd3E4c2lwcw%3D%3D&utm_source=qr",
    icon: Instagram,
  },
  {
    label: "פייסבוק",
    href: BRAND_IDENTITY.facebook,
    icon: Facebook,
  },
];

export function SocialLinks({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {socialLinks.map((s) => (
        <a
          key={s.label}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={s.label}
          className="hover:opacity-60 transition-opacity"
        >
          <s.icon className="h-5 w-5" strokeWidth={1.25} />
        </a>
      ))}
    </div>
  );
}
