import { useState, useEffect } from "react";

const WHATSAPP_NUMBER = "972502426661"; // +972 50-242-6661, no "+"
const PREFILLED_MESSAGE =
  "היי, הגעתי דרך אתר Royal Silver ואשמח לעזרה 😊";

function buildWhatsAppUrl() {
  const text = encodeURIComponent(PREFILLED_MESSAGE);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}

export function WhatsAppButton() {
  const [showTooltip, setShowTooltip] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Reveal with a slight delay so it doesn't pop in during page load
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 600);
    return () => clearTimeout(t);
  }, []);

  const href = buildWhatsAppUrl();

  return (
    <div
      dir="rtl"
      className={`fixed bottom-5 left-5 z-50 flex items-center transition-all duration-500 ${
        mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
      style={{ pointerEvents: "auto" }}
    >
      {/* Tooltip / label — appears to the right of the button (RTL) */}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="צריכה עזרה? דברי איתנו ב-WhatsApp"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        className={`group flex items-center gap-2 rounded-full bg-[#25D366] shadow-lg shadow-black/15 ring-1 ring-black/5 transition-all duration-300 hover:bg-[#1ebe5d] hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#25D366] ${
          showTooltip ? "pl-3 pr-2" : "p-2.5"
        }`}
      >
        {/* Official WhatsApp glyph (SVG) */}
        <svg
          viewBox="0 0 32 32"
          className="h-6 w-6 shrink-0 fill-white"
          aria-hidden="true"
        >
          <path d="M16.001 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.258.59 4.462 1.71 6.4L3.2 28.8l6.56-1.71a12.74 12.74 0 0 0 6.241 1.6h.005c7.06 0 12.8-5.74 12.8-12.8 0-3.42-1.33-6.63-3.75-9.05a12.7 12.7 0 0 0-9.055-3.74zm0 23.04h-.004a10.6 10.6 0 0 1-5.4-1.48l-.387-.23-4.018 1.05 1.072-3.916-.253-.402a10.58 10.58 0 0 1-1.624-5.66c0-5.86 4.77-10.63 10.634-10.63 2.84 0 5.51 1.11 7.52 3.12a10.56 10.56 0 0 1 3.114 7.518c0 5.86-4.77 10.63-10.63 10.63zm5.83-7.96c-.32-.16-1.89-.932-2.18-1.039-.293-.107-.507-.16-.72.16-.213.32-.826 1.04-1.013 1.253-.187.213-.373.24-.693.08-.32-.16-1.35-.498-2.572-1.587-.95-.847-1.592-1.893-1.778-2.213-.187-.32-.02-.493.14-.653.144-.143.32-.373.48-.56.16-.187.213-.32.32-.533.107-.213.053-.4-.027-.56-.08-.16-.72-1.736-.986-2.376-.26-.625-.524-.54-.72-.55l-.613-.01c-.213 0-.56.08-.853.4-.293.32-1.12 1.093-1.12 2.666 0 1.573 1.146 3.092 1.306 3.305.16.213 2.253 3.44 5.46 4.826.762.329 1.357.525 1.82.672.765.243 1.462.21 2.013.127.614-.092 1.89-.773 2.156-1.52.266-.746.266-1.386.186-1.52-.08-.133-.293-.213-.613-.373z" />
        </svg>

        <span
          className={`whitespace-nowrap text-sm font-medium text-white transition-all duration-300 ${
            showTooltip
              ? "max-w-[220px] opacity-100"
              : "max-w-0 overflow-hidden opacity-0"
          }`}
        >
          צריכה עזרה? דברי איתנו ב-WhatsApp
        </span>
      </a>
    </div>
  );
}
