import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { buildFeedItems, feedXml, type FeedProduct, type FeedVariant } from "./meta-feed";
import { EFRAT_HANDLE } from "./visible-variants";
import { SHAY_VARIANTS } from "./shay";

const ORIGIN = "https://new.royalsilver.net";
const variant = (id: string, sku: string, extra: Partial<FeedVariant> = {}): FeedVariant => ({
  id: `gid://shopify/ProductVariant/${id}`,
  sku,
  title: "Default Title",
  availableForSale: true,
  price: { amount: "249.0", currencyCode: "ILS" },
  compareAtPrice: null,
  image: null,
  selectedOptions: [{ name: "Title", value: "Default Title" }],
  ...extra,
});
const product = (
  id: string,
  handle: string,
  variants: FeedVariant[],
  images = ["https://cdn.shopify.com/a.jpg"],
): FeedProduct => ({
  id: `gid://shopify/Product/${id}`,
  handle,
  title: "שרשרת בדיקה",
  description: "תיאור   עם\nרווחים",
  images: { edges: images.map((url) => ({ node: { url } })) },
  variants: { edges: variants.map((node) => ({ node })) },
});

describe("Meta catalog feed", () => {
  it("uses the numeric variant ID the Pixel sends and links to this site's product page", () => {
    const [item] = buildFeedItems([product("1", "שרשרת-בדיקה", [variant("111", "A-1")])], ORIGIN);
    assert.equal(item.id, "111");
    assert.equal(item.item_group_id, "1");
    assert.equal(item.link, `${ORIGIN}/product/${encodeURIComponent("שרשרת-בדיקה")}`);
    assert.equal(item.price, "249.00 ILS");
    assert.equal(item.sale_price, undefined);
    assert.equal(item.description, "תיאור עם רווחים");
    assert.equal(item.title, "שרשרת בדיקה");
  });

  it("reports a real discount as price + sale_price and marks unavailable variants out of stock", () => {
    const [item] = buildFeedItems(
      [
        product("1", "x", [
          variant("111", "A-1", {
            availableForSale: false,
            compareAtPrice: { amount: "299", currencyCode: "ILS" },
          }),
        ]),
      ],
      ORIGIN,
    );
    assert.equal(item.price, "299.00 ILS");
    assert.equal(item.sale_price, "249.00 ILS");
    assert.equal(item.availability, "out of stock");
  });

  it("names option values, leads with the variant image and keeps the rest as additional images", () => {
    const [item] = buildFeedItems(
      [
        product(
          "1",
          "x",
          [
            variant("111", "A-1", {
              image: { url: "https://cdn.shopify.com/b.jpg" },
              selectedOptions: [
                { name: "צבע", value: "כסף" },
                { name: "מידה", value: "7" },
              ],
            }),
          ],
          ["https://cdn.shopify.com/a.jpg", "https://cdn.shopify.com/b.jpg"],
        ),
      ],
      ORIGIN,
    );
    assert.equal(item.title, "שרשרת בדיקה – כסף / 7");
    assert.equal(item.color, "כסף");
    assert.equal(item.size, "7");
    assert.equal(item.image_link, "https://cdn.shopify.com/b.jpg");
    assert.deepEqual(item.additional_image_link, ["https://cdn.shopify.com/a.jpg"]);
  });

  it("skips hidden products, storefront-hidden variants and the Shay source products", () => {
    const items = buildFeedItems(
      [
        product("1", "טבעת-לירון", [variant("111", "H-1")]),
        product("2", EFRAT_HANDLE, [variant("221", "JNW1022-1"), variant("222", "JNW1022-2")]),
        product(SHAY_VARIANTS[0].productId, "עגיל-כסף-חישוק-אבנים-3-ממ", [
          variant(SHAY_VARIANTS[0].id, SHAY_VARIANTS[0].sku),
        ]),
      ],
      ORIGIN,
    );
    assert.deepEqual(
      items.filter((i) => i.item_group_id !== "shay").map((i) => i.id),
      ["221"],
    );
    const shay = items.find((i) => i.item_group_id === "shay");
    assert.equal(shay?.id, SHAY_VARIANTS[0].id);
    assert.equal(shay?.link, `${ORIGIN}/product/${encodeURIComponent("עגילי-שי")}`);
    assert.ok(shay?.image_link.startsWith(`${ORIGIN}/media/`));
  });

  it("escapes XML and emits the g: namespace", () => {
    const items = buildFeedItems([product("1", "x", [variant("111", "A-1")])], ORIGIN);
    items[0].title = "A & <B>";
    const xml = feedXml(items, ORIGIN);
    assert.match(xml, /xmlns:g="http:\/\/base.google.com\/ns\/1.0"/);
    assert.match(xml, /<g:title>A &amp; &lt;B&gt;<\/g:title>/);
  });
});
