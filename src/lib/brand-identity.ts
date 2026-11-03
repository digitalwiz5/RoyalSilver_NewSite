import logoAsset from "../assets/royalsilver-logo.png.asset.json";

/** Verified storefront identity; never infer contact details or social accounts. */
export const BRAND_IDENTITY = {
  name: "Royal Silver | רויאל סילבר",
  alternateName: ["Royal Silver", "רויאל סילבר"],
  url: "https://www.royalsilver.net",
  telephone: "+972502426661",
  displayTelephone: "050-242-6661",
  facebook: "https://www.facebook.com/share/1JthjFJdWu/?mibextid=wwXIfr",
} as const;

export function brandStructuredData(socialUrls: string[]) {
  const home = `${BRAND_IDENTITY.url}/`;
  const storeId = `${home}#organization`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "OnlineStore",
        "@id": storeId,
        name: BRAND_IDENTITY.name,
        alternateName: [...BRAND_IDENTITY.alternateName],
        url: home,
        description: "חנות התכשיטים המקוונת Royal Silver | רויאל סילבר — טבעות, עגילים, שרשראות וצמידים.",
        logo: `${BRAND_IDENTITY.url}${logoAsset.url}`,
        telephone: BRAND_IDENTITY.telephone,
        contactPoint: {
          "@type": "ContactPoint",
          telephone: BRAND_IDENTITY.telephone,
          contactType: "customer service",
          availableLanguage: "he",
        },
        sameAs: [...new Set(socialUrls)],
      },
      {
        "@type": "WebSite",
        "@id": `${home}#website`,
        name: BRAND_IDENTITY.name,
        alternateName: [...BRAND_IDENTITY.alternateName],
        url: home,
        inLanguage: "he-IL",
        publisher: { "@id": storeId },
      },
    ],
  };
}