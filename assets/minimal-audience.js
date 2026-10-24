// Independent baseline, dormant until its collection scope is approved.
// No visitor/session ID, cookies, localStorage, fingerprint or individual path.
import { analyticsConfig } from './analytics-config.js?v=20261024-privacy';
import { readUtm, downloadPlatform } from './analytics.js?v=20261024-privacy';
const pages={ '/':['home_fr','fr','landing_page_viewed'], '/index.html':['home_fr','fr','landing_page_viewed'], '/index-en.html':['home_en','en','landing_page_viewed'], '/demo-login.html':['early_access_fr','fr','early_access_page_viewed'], '/demo-login-en.html':['early_access_en','en','early_access_page_viewed'] };
export async function mountMinimalAudience(){
 const page=pages[location.pathname];
 if(!page || analyticsConfig.minimalEnabled!==true || location.protocol!=='https:' || !['rockso.app','www.rockso.app'].includes(location.hostname))return;
 const endpoint=analyticsConfig.configurationUrl;
 if(endpoint!=='https://hegtnyarfeoyapobysee.supabase.co/functions/v1/analytics-collect')return;
 try{
  const response=await fetch(endpoint,{credentials:'omit',referrerPolicy:'no-referrer'});const config=response.ok?await response.json():null;
  if(!config?.minimal_enabled)return;
  const utm=readUtm(location.search);
  const properties={page_id:page[0],language:page[1],...utm};
  for(const link of document.querySelectorAll('a[href]')){
   try{const url=new URL(link.href,location.href);if(url.origin!==location.origin||!['/demo-login.html','/demo-login-en.html'].includes(url.pathname))continue;for(const [key,value] of Object.entries(utm))url.searchParams.set(key,value);link.href=url.href;}catch{}
  }
  const send=(event,extra={})=>fetch(endpoint,{method:'POST',keepalive:true,headers:{'content-type':'application/json'},credentials:'omit',referrerPolicy:'no-referrer',body:JSON.stringify({mode:'audience',surface:'landing',events:[{id:crypto.randomUUID(),event,platform:'unknown',properties:{...properties,...extra}}]})}).catch(()=>{});
  await send(page[2]);
  document.addEventListener('click',event=>{
   if(event.defaultPrevented||event.button!==0)return;
   const link=event.target.closest?.('a');if(!link)return;
   const destination=downloadPlatform(link.getAttribute('href'),location.href);
   if(destination && link.matches('[data-analytics-download][data-analytics-placement="footer"]'))void send('download_clicked',{download_platform:destination,placement:'footer'});
   try { const url=new URL(link.href,location.href);if(url.origin===location.origin && ['/demo-login.html','/demo-login-en.html'].includes(url.pathname))void send('landing_cta_clicked',{destination:'early_access'}); }catch{}
  });
  // This is a UI signal, not the authoritative count of confirmed prospects.
  window.addEventListener('rockso:early-access-confirmed',()=>void send('early_access_submitted'));
 }catch{/* Counts never block the website. */}
}
if(typeof window!=='undefined')void mountMinimalAudience();
