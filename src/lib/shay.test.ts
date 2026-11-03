import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { combineShayProducts, groupShayCards, shaySelection, shayImageIndex, SHAY_IMAGES, SHAY_VARIANTS, SHAY_SOURCE_HANDLES, SHAY_HANDLE, shaySitemapUrls } from './shay';
import type { ShopifyProduct } from './shopify';
function sources(): ShopifyProduct[] { return ['15439679193309','15439679226077'].map((id,i)=>({node:{id:`gid://shopify/Product/${id}`,handle:SHAY_SOURCE_HANDLES[i],title:'source',description:'',images:{edges:[]},options:[],priceRange:{minVariantPrice:{amount:'269',currencyCode:'ILS'}},variants:{edges:SHAY_VARIANTS.filter(v=>v.productId===id).map(v=>({node:{id:`gid://shopify/ProductVariant/${v.id}`,sku:v.sku,title:v.sourceColor,selectedOptions:[{name:'צבע',value:v.sourceColor}],availableForSale:true,price:{amount:'269',currencyCode:'ILS'}}}))}}})); }
describe('Shay original commerce identities',()=>{
 const cases=[['3 מ״מ','כסף','68229468422365','JEW1307-1'],['3 מ״מ','זהב','68229468455133','JEW1307-2'],['3 מ״מ','רוז גולד','68229468487901','JEW1307-3'],['3.5 מ״מ','כסף','68229468618973','JEW1308-1'],['3.5 מ״מ','זהב','68229468651741','JEW1308-2'],['3.5 מ״מ','רוז גולד','68229468684509','JEW1308-3']];
 for(const [size,color,id,sku] of cases)it(`${size}/${color} keeps its original ID, SKU and 269 ILS`,()=>{const p=combineShayProducts(sources());assert.ok(p);const v=shaySelection(p,size,color);assert.equal(v?.id,`gid://shopify/ProductVariant/${id}`);assert.equal(v?.sku,sku);assert.equal(v?.price.amount,'269');});
 it('requires both explicit size and color',()=>{const p=combineShayProducts(sources());assert.ok(p);assert.equal(shaySelection(p,'3 מ״מ'),undefined);assert.equal(shaySelection(p,undefined,'כסף'),undefined);});
 it('does not invent unavailable mappings or transfer stock',()=>{const src=sources();src[1].node.variants.edges[0].node.availableForSale=false;src[0].node.variants.edges[0].node.sku='mismatch';const p=combineShayProducts(src);assert.ok(p);assert.equal(shaySelection(p,'3 מ״מ','כסף'),undefined);assert.equal(shaySelection(p,'3.5 מ״מ','כסף')?.availableForSale,false);});
 it('preserves live prices rather than overriding them locally',()=>{const src=sources();src[1].node.variants.edges[0].node.price.amount='229';const p=combineShayProducts(src);assert.ok(p);assert.equal(shaySelection(p,'3.5 מ״מ','כסף')?.price.amount,'229');assert.equal(p.priceRange.minVariantPrice.amount,'229');});
 it('replaces two source products with one card without mutating sources',()=>{const src=sources();const p=combineShayProducts(src);const cards=groupShayCards(src,p);assert.equal(cards.length,1);assert.equal(cards[0].node.handle,SHAY_HANDLE);assert.deepEqual(src.map(p=>p.node.handle),SHAY_SOURCE_HANDLES);});
 it('includes one Shay card even when source category tags do not match the legacy query',()=>{const p=combineShayProducts(sources());const cards=groupShayCards([],p);assert.equal(cards.length,1);assert.equal(cards[0].node.handle,SHAY_HANDLE);});
 it('lists only the unified Shay URL in the sitemap, never the two source handles',()=>{
  const edges=[...SHAY_SOURCE_HANDLES.map((handle,i)=>({handle,updatedAt:`2026-10-1${i}T00:00:00Z`})),{handle:'צמיד-רון',updatedAt:'2026-10-05T00:00:00Z'}];
  const urls=shaySitemapUrls(edges,'https://www.royalsilver.net');
  assert.equal(urls.length,1);
  assert.equal(urls[0].url,`https://www.royalsilver.net/product/${encodeURIComponent(SHAY_HANDLE)}`);
  assert.equal(urls[0].lastmod,'2026-10-11');
  assert.ok(!urls.some(u=>SHAY_SOURCE_HANDLES.some(h=>u.url.includes(h))));
 });
 it('adds the worn-ear photo to the gallery without replacing the main image or shifting variant order',()=>{
  const p=combineShayProducts(sources());
  assert.ok(p);
  const urls=SHAY_IMAGES.map(e=>e.node.url);
  assert.equal(urls.length,SHAY_VARIANTS.length+2);
  const worn=urls.find(u=>u.includes('SHAY_MODEL_worn_ear'));
  assert.ok(worn,'worn-ear photo is in the gallery');
  assert.notEqual(urls[0],worn);
  assert.equal(urls.indexOf(worn),urls.length-1);
  assert.ok(p.images.edges.some(e=>e.node.url.includes('SHAY_MODEL_worn_ear')));
  SHAY_VARIANTS.forEach((v,i)=>{assert.equal(shayImageIndex(v.size,v.color),i+1);assert.equal(urls[i+1],v.image);});
 });
});
