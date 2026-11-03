import { REAL_TO_PRETTY_HANDLE } from "./handles";

/** Local destination for Shopify-style links; no domain or commerce identity changes. */
export function catalogProductDestination(handle: string, searchStr = "") {
  const publicHandle = REAL_TO_PRETTY_HANDLE[handle] ?? handle;
  return `/product/${encodeURIComponent(publicHandle)}${searchStr}`;
}