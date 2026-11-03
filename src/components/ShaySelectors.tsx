import { Button } from '@/components/ui/button';
import { SHAY_SIZES, SHAY_COLORS, shaySelection } from '@/lib/shay';
import type { ShopifyProduct } from '@/lib/shopify';
export function ShaySelectors({product,selected,onChange}:{product:ShopifyProduct['node'];selected:Record<string,string>;onChange:(selection:Record<string,string>)=>void}){
 const variant=shaySelection(product,selected['גודל האבנים'],selected['צבע']);
 return <div id="size-selector" className="space-y-6 mb-6 scroll-mt-24">
 <fieldset><legend className="text-xs mb-3">בחרי גודל אבן</legend><div className="flex flex-wrap gap-2">{SHAY_SIZES.map(value=><Button key={value} variant={selected['גודל האבנים']===value?'hero':'outline'} aria-pressed={selected['גודל האבנים']===value} onClick={()=>onChange({...selected,'גודל האבנים':value})}>{value}</Button>)}</div><p className="text-xs text-muted-foreground mt-3">המידות מתייחסות לאבנים, לא לקוטר החישוק.</p></fieldset>
 <fieldset><legend className="text-xs mb-3">בחרי צבע</legend><div className="flex flex-wrap gap-2">{SHAY_COLORS.map(value=><Button key={value} variant="outline" aria-pressed={selected['צבע']===value} className={selected['צבע']===value?'border-foreground ring-1 ring-foreground':''} onClick={()=>onChange({...selected,'צבע':value})}><span aria-hidden className={`h-5 w-5 rounded-full border border-border ${value==='כסף'?'bg-metal-silver':value==='זהב'?'bg-metal-gold':'bg-metal-rose'}`}/>{value}</Button>)}</div></fieldset>
 <p className="text-xs text-muted-foreground" aria-live="polite">{variant?`מק״ט: ${variant.sku} • ${variant.availableForSale?'זמין להזמנה':'אזל מהמלאי'}`:'בחרי גודל וצבע'}</p>
 </div>;
}
