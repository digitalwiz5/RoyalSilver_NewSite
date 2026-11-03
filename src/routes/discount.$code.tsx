import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCartStore } from "@/stores/cartStore";

export const Route = createFileRoute("/discount/$code")({
  head: () => ({ meta: [
    { title: "קוד הטבה — Royal Silver" },
    { name: "description", content: "הפעלת קוד הטבה בחנות התכשיטים Royal Silver." },
    { property: "og:title", content: "קוד הטבה — Royal Silver" },
    { property: "og:description", content: "הפעלת קוד הטבה בחנות התכשיטים Royal Silver." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex,follow" },
  ] }),
  component: DiscountLink,
});

function DiscountLink() {
  const { code } = Route.useParams();
  const navigate = useNavigate();
  useEffect(() => {
    let active = true;
    void useCartStore.getState().applyDiscountCode(code).finally(() => {
      if (active) void navigate({ to: "/", replace: true });
    });
    return () => { active = false; };
  }, [code, navigate]);
  return <main id="main-content" className="min-h-screen flex items-center justify-center text-muted-foreground" dir="rtl">מפעילים את ההטבה…</main>;
}