export const CONSENT_KEY = "royalsilver-advertising-consent";
export const NOTICE_VERSION = "meta-2026-10-20-v1";
export const ADVERTISING_NOTICE = "Royal Silver משתמשת ב־Meta Pixel לשיתוף נתוני גלישה, צפייה במוצרים, הוספה לסל ומעבר לתשלום עם Meta לצורך מדידת פרסום ושיפור מודעות. המידע כולל כתובת עמוד, מזהי מוצרים, סכומים, פרטי דפדפן, כתובת IP ומזהי עוגיות. אפשר לקבל או לדחות ולשנות את הבחירה בהגדרות עוגיות בכל עת.";
export type ConsentChoice = "accepted" | "rejected";
export interface ConsentRecord {
  visitor: string;
  choice: ConsentChoice;
  region: string | null;
  timestamp: string;
  noticeVersion: string;
  notice: string;
  history: Array<{ choice: ConsentChoice; timestamp: string; region: string | null; noticeVersion: string; notice: string }>;
}
const REQUIRED_REGIONS = new Set("AT BE BG HR CY CZ DK EE FI FR DE GR HU IS IE IT LI LV LT LU MT NL NO PL PT RO SK SI ES SE GB CH BR CA ZA KR TH TR".split(" "));
export function requiresAdvertisingConsent(region: string | null): boolean {
  return !region || !/^[A-Z]{2}$/.test(region) || region === "XX" || region === "T1" || REQUIRED_REGIONS.has(region);
}
export function advertisingAllowed(region: string | null, choice?: ConsentChoice, optOut = false): boolean {
  if (optOut || choice === "rejected") return false;
  return choice === "accepted" || !requiresAdvertisingConsent(region);
}
export function readConsent(): ConsentRecord | null {
  try {
    const record = JSON.parse(localStorage.getItem(CONSENT_KEY) || "null");
    return record && (record.choice === "accepted" || record.choice === "rejected") && typeof record.visitor === "string" && Array.isArray(record.history) ? record : null;
  } catch { return null; }
}
export function saveConsent(choice: ConsentChoice, region: string | null): boolean {
  const previous = readConsent();
  const timestamp = new Date().toISOString();
  const evidence = { choice, region, timestamp, noticeVersion: NOTICE_VERSION, notice: ADVERTISING_NOTICE };
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ ...evidence, visitor: previous?.visitor || crypto.randomUUID(), history: [...(previous?.history || []), evidence] } satisfies ConsentRecord));
    window.dispatchEvent(new Event("royalsilver:consent"));
    return true;
  } catch { return false; }
}
let regionPromise: Promise<string | null> | undefined;
export function resolveRegion(): Promise<string | null> {
  regionPromise ??= (async () => {
    try {
      const response = await fetch("/cdn-cgi/trace", { signal: AbortSignal.timeout(2000), credentials: "same-origin" });
      if (!response.ok) return null;
      const region = (await response.text()).match(/^loc=([A-Z0-9]{2})$/m)?.[1] ?? null;
      return region === "XX" || region === "T1" ? null : region;
    } catch { return null; }
  })();
  return regionPromise;
}