import { createFileRoute, redirect } from "@tanstack/react-router";
import { catalogProductDestination } from "@/lib/catalog-product-links";

// Shopify catalogs use /products/; the storefront's product template uses /product/.
export const Route = createFileRoute("/products/$handle")({
  beforeLoad: ({ params, location }) => {
    throw redirect({
      href: catalogProductDestination(params.handle, location.searchStr),
      statusCode: 301,
      replace: true,
    });
  },
});