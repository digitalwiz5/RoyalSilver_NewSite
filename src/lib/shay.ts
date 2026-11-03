import model from '@/assets/shay/SHAY_MODEL_v2.webp.asset.json';
import silver3 from '@/assets/shay/SHAY_3mm_silver_five_ovals.jpg.asset.json';
import gold3 from '@/assets/shay/SHAY_3mm_gold_five_ovals.jpg.asset.json';
import rose3 from '@/assets/shay/SHAY_3mm_rose_gold_five_ovals.jpg.asset.json';
import silver35 from '@/assets/shay/SHAY_3_5mm_silver_five_ovals.jpg.asset.json';
import gold35 from '@/assets/shay/SHAY_3_5mm_gold_five_ovals.jpg.asset.json';
import rose35 from '@/assets/shay/SHAY_3_5mm_rose_gold_five_ovals.jpg.asset.json';
import wornEar from '@/assets/shay/SHAY_MODEL_worn_ear.png.asset.json';
import { SHAY_DESCRIPTION_HTML } from './shay-copy';
import { storefrontApiRequest, PRODUCT_BY_HANDLE_QUERY, type ShopifyProduct } from './shopify';
export const SHAY_HANDLE = 'עגילי-שי';
export const SHAY_TITLE = 'עגילי שי – חישוקי כסף 925 משובצים בזירקונים אובליים';
export const SHAY_SUBTITLE = 'חישוק קלאסי עם חמש אבני זירקון אובליות — ניצוץ עדין ליום־יום ולערב.';
export const SHAY_SEO = { title: 'עגילי שי – עגילי חישוק מכסף 925 עם זירקונים | Royal Silver', description: 'עגילי שי מבית Royal Silver – חישוקי כסף 925 משובצים בחמש אבני זירקון אובליות. לבחירה בשני גדלים ובשלושה גוונים. מתנה אלגנטית ומלאת ברק.' };
export const SHAY_SOURCE_HANDLES = ['עגיל-כסף-חישוק-אבנים-3-ממ', 'עגיל-כסף-חישוק-אבנים-3-5-ממ'];
export const SHAY_SIZES = ['3 מ״מ', '3.5 מ״מ'];
export const SHAY_COLORS = ['כסף', 'זהב', 'רוז גולד'];
export const SHAY_VARIANTS = [
 {size:'3 מ״מ',color:'כסף',sourceColor:'כסף',productId:'15439679193309',id:'68229468422365',sku:'JEW1307-1',image:silver3.url},
 {size:'3 מ״מ',color:'זהב',sourceColor:'זהב',productId:'15439679193309',id:'68229468455133',sku:'JEW1307-2',image:gold3.url},
 {size:'3 מ״מ',color:'רוז גולד',sourceColor:'רוז',productId:'15439679193309',id:'68229468487901',sku:'JEW1307-3',image:rose3.url},
 {size:'3.5 מ״מ',color:'כסף',sourceColor:'כסף',productId:'15439679226077',id:'68229468618973',sku:'JEW1308-1',image:silver35.url},
 {size:'3.5 מ״מ',color:'זהב',sourceColor:'זהב',productId:'15439679226077',id:'68229468651741',sku:'JEW1308-2',image:gold35.url},
 {size:'3.5 מ״מ',color:'רוז גולד',sourceColor:'רוז',productId:'15439679226077',id:'68229468684509',sku:'JEW1308-3',image:rose35.url},
] as const;
export const SHAY_IMAGES = [{node:{url:model.url,altText:'עגילי שי מכסף 925 משובצים בזירקונים אובליים על דוגמנית – Royal Silver'}}, ...SHAY_VARIANTS.map(v=>({node:{url:v.image,altText:`עגילי שי בגוון ${v.color}, אבני ${v.size} — המחשה`}})), {node:{url:wornEar.url,altText:'עגילי שי מכסף 925 משובצים בזירקונים אובליים על אוזן דוגמנית – Royal Silver'}}];
export type ShayProduct = ShopifyProduct['node'] & {descriptionHtml:string};
export function combineShayProducts(products:ShopifyProduct[]):ShayProduct|null {
 const first=products.find(p=>p.node.id==='gid://shopify/Product/15439679193309')?.node;
 if(!first)return null;
 const edges=SHAY_VARIANTS.flatMap(m=>{
  const source=products.find(p=>p.node.id===`gid://shopify/Product/${m.productId}`)?.node;
  const v=source?.variants.edges.find(({node})=>node.id===`gid://shopify/ProductVariant/${m.id}` && node.sku===m.sku && node.selectedOptions.some(o=>o.value===m.sourceColor))?.node;
  if(!v)return [];
  return [{node:{...v,title:`${m.size} / ${m.color}`,selectedOptions:[{name:'גודל האבנים',value:m.size},{name:'צבע',value:m.color}]}}];
 });
 if(!edges.length)return null;
 const lowest=edges.reduce((a,b)=>Number(a.node.price.amount)<=Number(b.node.price.amount)?a:b).node.price;
 const createdAt=products.filter(p=>SHAY_SOURCE_HANDLES.includes(p.node.handle)).flatMap(p=>p.node.createdAt?[p.node.createdAt]:[]).sort().at(-1) ?? first.createdAt;
 return {...first,createdAt,handle:SHAY_HANDLE,title:SHAY_TITLE,description:SHAY_SEO.description,descriptionHtml:SHAY_DESCRIPTION_HTML,images:{edges:SHAY_IMAGES},variants:{edges},options:[{name:'גודל האבנים',values:SHAY_SIZES},{name:'צבע',values:SHAY_COLORS}],priceRange:{minVariantPrice:lowest},compareAtPriceRange:undefined};
}
export async function fetchShayProduct():Promise<ShayProduct|null>{
 const sources=await Promise.all(SHAY_SOURCE_HANDLES.map(async handle=>{
  const res=await storefrontApiRequest(PRODUCT_BY_HANDLE_QUERY,{handle});
  const node=res?.data?.productByHandle;
  return node?{node} as ShopifyProduct:null;
 }));
 return combineShayProducts(sources.filter((p):p is ShopifyProduct=>p!==null));
}
export function groupShayCards(products:ShopifyProduct[],merged:ShayProduct|null):ShopifyProduct[]{
 const result:ShopifyProduct[]=[];let inserted=false;
 for(const p of products){
  if(SHAY_SOURCE_HANDLES.includes(p.node.handle)||p.node.handle===SHAY_HANDLE){if(!inserted&&merged){result.push({node:merged});inserted=true;}}
  else result.push(p);
 }
 if(!inserted&&merged)result.push({node:merged});
 return result;
}
export function shayImageIndex(size?:string,color?:string){const i=SHAY_VARIANTS.findIndex(v=>v.size===size&&v.color===color);return i<0?0:i+1;}
export function shaySelection(product:ShopifyProduct['node'],size?:string,color?:string){
 if(!size||!color)return undefined;
  return product.variants.edges.find(({node})=>node.selectedOptions.some(o=>o.name==='גודל האבנים'&&o.value===size)&&node.selectedOptions.some(o=>o.name==='צבע'&&o.value===color))?.node;
}
/** Sitemap: the unified page is listed once; the two source products are never listed. */
export function shaySitemapUrls(products:{handle:string;updatedAt:string}[],siteUrl:string){
 const sources=products.filter(p=>SHAY_SOURCE_HANDLES.includes(p.handle));
 if(!sources.length)return [];
 const lastmod=sources.map(p=>p.updatedAt.slice(0,10)).sort().at(-1);
 return [{url:`${siteUrl}/product/${encodeURIComponent(SHAY_HANDLE)}`,lastmod}];
}
