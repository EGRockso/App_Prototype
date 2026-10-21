// Local-only verification. All third-party browser requests are intercepted.
// No invented project token: keyed SDK transport audit needs a separately supplied public token.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import {
  safeUtmValue, readUtm, isNewSignup, downloadPlatform, filterSdkEvent, sdkOptions,
  CONSENT_KEY, SESSION_KEY, TEST_KEY, CONSENT_VERSION, SDK_URL, SDK_INTEGRITY,
} from '../assets/analytics.js';
import { analyticsConfig } from '../assets/analytics-config.js';
const { chromium } = await import(process.env.ROCKSO_PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const mime = {'.html':'text/html', '.js':'application/javascript', '.css':'text/css', '.svg':'image/svg+xml', '.png':'image/png', '.avif':'image/avif', '.jpg':'image/jpeg', '.woff2':'font/woff2'};
const server = http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let file = path.resolve(root, '.'+pathname);
    if (file !== root && !file.startsWith(root + path.sep)) throw new Error('Invalid path');
    if ((await fs.stat(file)).isDirectory()) file = path.join(file, 'index.html');
    res.writeHead(200, {'content-type':mime[path.extname(file)] || 'application/octet-stream'});
    res.end(await fs.readFile(file));
  } catch { res.writeHead(404); res.end('Not found'); }
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base = `http://127.0.0.1:${server.address().port}`;
let passed=0;
const report={checks:[], sdkAudit:null, keyedSdkAudit:'NOT RUN: real public project token not provided; no fictitious token used'};
async function check(name, fn) { await fn(); passed++; report.checks.push(name); console.log('PASS '+name); }
const sdkPath = process.env.ROCKSO_POSTHOG_SDK_PATH;
const realToken = process.env.ROCKSO_POSTHOG_PUBLIC_KEY || '';
let sdkSource;
if (sdkPath) {
 sdkSource=await fs.readFile(sdkPath,'utf8');
 assert.equal('sha384-'+createHash('sha384').update(sdkSource).digest('base64'), SDK_INTEGRITY);
}
const browser=await chromium.launch({headless:true,...(process.env.ROCKSO_BROWSER_PATH?{executablePath:process.env.ROCKSO_BROWSER_PATH}:{})});
const stub=`window.__signupCalls=[]; window.__signupReply={data:{ok:true,alreadyRegistered:false},error:null}; window.supabase={createClient:()=>({auth:{getUser:async()=>({data:{user:{id:'local-demo-fixture'}},error:null})},functions:{invoke:async(name,options)=>{window.__signupCalls.push({name,body:options.body}); if(window.__signupDelay)return await new Promise(resolve=>window.__signupResolve=resolve);return window.__signupReply;}}})};`;
async function setup({test=true,production=false,token='',runtimeConfiguration=false,minimal=false,configurationEnabled=true,shippedConfiguration=false}={}) {
 // PostHog excludes HeadlessChrome/automation as bots. Exercise the normal
 // visitor pipeline without weakening the SDK's production bot filter.
 const context=await browser.newContext({serviceWorkers:'block',userAgent:`Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${browser.version()} Safari/537.36`});
 await context.addInitScript(version=>{
  Object.defineProperty(Navigator.prototype,'webdriver',{get:()=>false});
  if(navigator.userAgentData)Object.defineProperty(navigator.userAgentData,'brands',{get:()=>[{brand:'Chromium',version},{brand:'Google Chrome',version}]});
 },browser.version().split('.')[0]);
 const posthogRequests=[];const collectorRequests=[];
 await context.route('**/*',async route=>{
  const url=new URL(route.request().url());
  if(url.hostname==='hegtnyarfeoyapobysee.supabase.co' && url.pathname==='/functions/v1/analytics-collect'){
   collectorRequests.push({method:route.request().method(),body:route.request().postData()});
   return route.fulfill({contentType:'application/json',body:route.request().method()==='GET'?JSON.stringify({landing_enabled:configurationEnabled,minimal_enabled:minimal,projectToken:configurationEnabled?token:'',api_host:'https://eu.i.posthog.com'}):'{"ok":true}',headers:{'access-control-allow-origin':'*','access-control-allow-methods':'GET, POST, OPTIONS','access-control-allow-headers':'*'}});
  }
  if (url.hostname.endsWith('posthog.com')) {
   posthogRequests.push({url:url.href,method:route.request().method(),body:route.request().postData(),headers:route.request().headers()});
   if(url.href===SDK_URL && sdkSource)return route.fulfill({contentType:'application/javascript',body:sdkSource,headers:{'access-control-allow-origin':'*'}});
   return route.fulfill({contentType:'application/json',body:'{"status":1}',headers:{'access-control-allow-origin':'*','access-control-allow-methods':'POST, OPTIONS','access-control-allow-headers':'*'}});
  }
  if(url.hostname==='cdn.jsdelivr.net')return route.fulfill({contentType:'application/javascript',body:stub});
  if(production && url.origin==='https://rockso.app'){
   if(url.pathname==='/assets/analytics-config.js' && shippedConfiguration){const response=await context.request.get(base+url.pathname);return route.fulfill({status:response.status(),headers:response.headers(),body:await response.body()});}
   if(url.pathname==='/assets/analytics-config.js' && runtimeConfiguration)return route.fulfill({contentType:'application/javascript',body:`export const analyticsConfig=Object.freeze({enabled:true,minimalEnabled:${minimal},projectToken:"",configurationUrl:"https://hegtnyarfeoyapobysee.supabase.co/functions/v1/analytics-collect"});`});
   if(url.pathname==='/assets/analytics-config.js' && !token)return route.fulfill({contentType:'application/javascript',body:'export const analyticsConfig=Object.freeze({enabled:false,projectToken:""});'});
   if(url.pathname==='/assets/analytics-config.js' && token)return route.fulfill({contentType:'application/javascript',body:`export const analyticsConfig=Object.freeze({enabled:true,projectToken:${JSON.stringify(token)}});`});
   const response=await context.request.get(base+url.pathname);
   return route.fulfill({status:response.status(),headers:response.headers(),body:await response.body()});
  }
  if(url.origin===base)return route.continue();
  return route.abort();
 });
 if(test)await context.addInitScript(({TEST_KEY})=>{if(location.hostname==='127.0.0.1')sessionStorage.setItem(TEST_KEY,'enabled');},{TEST_KEY});
 const page=await context.newPage();
 return {context,page,posthogRequests,collectorRequests,origin:production?'https://rockso.app':base};
}
const events=async page=>{
 await page.waitForFunction(()=>!!window.RocksoAnalytics);
 return page.evaluate(()=>window.RocksoAnalytics.getTestEvents());
};
const stored=(page,type,key)=>page.evaluate(({type,key})=>window[type].getItem(key),{type,key});
async function accept(page,english=false){await page.getByRole('button',{name:english?'Accept':'Accepter',exact:true}).click();}
async function refuse(page,english=false){await page.getByRole('button',{name:english?'Refuse':'Refuser',exact:true}).click();}
async function open(page){await page.locator('[data-analytics-preferences]').click();}
try {
 await check('public configuration has no inline key; runtime configuration is separately gated',async()=>{
  assert.equal(analyticsConfig.enabled,false);assert.equal(analyticsConfig.projectToken,'');assert.ok(analyticsConfig.configurationUrl.endsWith('/analytics-collect'));
 });
 await check('shipped disabled configuration prevents every analytics request after acceptance',async()=>{
  const s=await setup({test:false,production:true,token:realToken,shippedConfiguration:true});
  await s.context.addInitScript(({key,version})=>{const now=Date.now();localStorage.setItem(key,JSON.stringify({version,accepted:true,createdAt:now,expiresAt:now+86400000}));},{key:CONSENT_KEY,version:CONSENT_VERSION});
  await s.page.goto(s.origin+'/');await s.page.waitForTimeout(150);
  assert.equal(s.posthogRequests.length,0);assert.equal(s.collectorRequests.length,0);await s.context.close();
 });
 await check('five UTM fields accept new experiment slugs without a campaign list',async()=>{
  assert.deepEqual(readUtm('?utm_source=New-Partner&utm_medium=social&utm_campaign=launch-2041-z&utm_content=creative_b&utm_term=multisport'),{
   utm_source:'new-partner',utm_medium:'social',utm_campaign:'launch-2041-z',utm_content:'creative_b',utm_term:'multisport'});
  assert.deepEqual(readUtm('?utm_source=newsletter&utm_medium=email'),{utm_source:'newsletter',utm_medium:'email'});
 });
 await check('UTM validator rejects emails, URLs, phones, tokens, UUIDs, sensitive labels and encoding',async()=>{
  for(const bad of ['a@example.com','https://example.com','0612345678','ad-0612345678','abc%40example','abc%2540example','user_id-123','patient-card','injury-history','email-list','aaaaaaaaaaaaaaaaaaaaaaaa','550e8400-e29b-41d4-a716-446655440000','x'.repeat(65),'hello world','a\nmail'])assert.equal(safeUtmValue(bad),null,bad);
  for(const query of ['?utm_source=social&utm_content=a%40example.com','?utm_source=a&utm_source=b','?utm_source=social&token=secret','?utm_campaign=clean&email=a%40example.com','?utm_source=double%2540encoded'])assert.deepEqual(readUtm(query),{});
  assert.deepEqual(readUtm('?utm_source=social&gclid=private-click&unknown=ignored'),{utm_source:'social'});
 });
 await check('Supabase conversion contract is strict; business UI remains unchanged',async()=>{
  assert.equal(isNewSignup({ok:true,alreadyRegistered:false},null),true);
  for(const data of [null,{}, {ok:false,alreadyRegistered:false},{ok:true},{ok:'true',alreadyRegistered:false},{ok:true,alreadyRegistered:true}])assert.equal(isNewSignup(data,null),false);
  assert.equal(isNewSignup({ok:true,alreadyRegistered:false},{message:'error'}),false);
 });
 await check('only genuine store destinations qualify; hash/relative/unsafe destinations do not',async()=>{
  for(const href of ['#','#download','','/index.html','javascript:alert(1)','https://apps.apple.com.evil.invalid/app/id123','https://play.google.com/store/apps/details','https://apps.apple.com/','https://u:p@apps.apple.com/app/id123'])assert.equal(downloadPlatform(href,base),null);
  assert.equal(downloadPlatform('https://apps.apple.com/app/testflight/id899247664',base),'ios');
  assert.equal(downloadPlatform('https://play.google.com/store/apps/details?id=com.example.app',base),'android');
 });
 await check('SDK configuration disables automatic capture, persistence, flags, replay, logs and beacons',async()=>{
  const o=sdkOptions(crypto.randomUUID(),()=>null,new AbortController().signal);
  for(const name of ['autocapture','capture_pageview','capture_pageleave','capture_heatmaps','capture_dead_clicks','capture_exceptions','capture_performance','rageclick','save_campaign_params','save_referrer','cross_subdomain_cookie'])assert.equal(o[name],false,name);
  for(const name of ['disable_session_recording','disable_surveys','disable_external_dependency_loading','advanced_disable_flags','disable_persistence','disable_beacon','opt_out_capturing_by_default'])assert.equal(o[name],true,name);
  assert.equal(o.person_profiles,'never');assert.equal(o.persistence,'memory');assert.equal(o.logs.captureConsoleLogs,false);assert.equal(o.fetch_options.referrerPolicy,'no-referrer');
 });
 await check('payload is rebuilt; SDK/user/profile/URL/referrer/device identifiers are discarded',async()=>{
  const id=crypto.randomUUID();
  const payload=filterSdkEvent({event:'landing_page_viewed',uuid:crypto.randomUUID(),timestamp:new Date().toISOString(),$set:{email:'do-not-send@example.invalid'},properties:{page_id:'home_fr',language:'fr',platform:'ios',email:'do-not-send@example.invalid',$set:{private:'text'},$initial_current_url:'https://secret.invalid',$referrer:'https://secret.invalid',$current_url:'https://secret.invalid',$device_id:'private',distinct_id:'account-id',utm_source:'social',utm_content:'do-not-send@example.invalid'}},{allowed:true,id,environment:'test',projectToken:''});
  assert.deepEqual(Object.keys(payload.properties).sort(),['surface','distinct_id','$process_person_profile','$geoip_disable','$ip','environment','page_id','language','platform','utm_source'].sort());
  assert.equal(payload.properties.distinct_id,id);assert.ok(!JSON.stringify(payload).includes('do-not-send'));
  assert.equal(filterSdkEvent({event:'$snapshot'}, {allowed:true,id}),null);
  assert.equal(filterSdkEvent(payload,{allowed:false,id}),null);
 });
 await check('development and missing-key production remain off; URL parameters cannot enable tracking',async()=>{
  for(const production of [false,true]){
   const {context,page,origin,posthogRequests}=await setup({test:false,production});
   await page.goto(origin+'/?analytics_test=1&__posthog_debug=true');
   assert.equal(await page.locator('.analytics-consent[open]').count(),0);
   assert.deepEqual(await events(page),[]);assert.equal(await stored(page,'sessionStorage',SESSION_KEY),null);
   if(production)assert.equal(await page.evaluate(()=>window.RocksoAnalytics.enableTestMode()),false);
   assert.deepEqual(posthogRequests,[]);await context.close();
  }
 });
 await check('before consent and after refusal: no events, SDK requests, analytics storage or cookies',async()=>{
  const {context,page,posthogRequests}=await setup();await page.goto(base+'/');
  assert.deepEqual(await events(page),[]);assert.equal(await stored(page,'sessionStorage',SESSION_KEY),null);
  await refuse(page);assert.deepEqual(await events(page),[]);
  assert.equal(JSON.parse(await stored(page,'localStorage',CONSENT_KEY)).accepted,false);
  await page.goto(base+'/demo-login.html');assert.equal(await page.locator('.analytics-consent[open]').count(),0);
  assert.equal(await stored(page,'sessionStorage',SESSION_KEY),null);assert.deepEqual(posthogRequests,[]);
  assert.deepEqual(await context.cookies(),[]);await context.close();
 });
 await check('accept/refuse have equal prominence; keyboard dismissal and blocked preference storage collect nothing',async()=>{
  const {context,page,posthogRequests}=await setup();await page.setViewportSize({width:320,height:568});await page.goto(base+'/');
  const styles=await page.locator('.analytics-consent-actions button').evaluateAll(buttons=>buttons.map(button=>{
   const style=getComputedStyle(button);return [style.backgroundColor,style.color,style.fontSize,style.padding,button.getBoundingClientRect().width];
  }));assert.deepEqual(styles[0],styles[1]);
  assert.equal(await page.evaluate(()=>document.querySelector('.analytics-consent').getBoundingClientRect().width<=innerWidth),true);
  await page.keyboard.press('Escape');assert.deepEqual(await events(page),[]);assert.equal(await stored(page,'localStorage',CONSENT_KEY),null);
  await open(page);
  await page.evaluate(()=>{Storage.prototype.setItem=function(){throw new Error('storage unavailable');};});
  await accept(page);assert.deepEqual(await events(page),[]);assert.equal(await stored(page,'sessionStorage',SESSION_KEY),null);
  assert.match(await page.locator('.analytics-consent [role="status"]').textContent(),/désactivée/);
  assert.deepEqual(posthogRequests,[]);await context.close();
 });
 await check('closing consent is not acceptance; later acceptance does not replay a prior signup',async()=>{
  const {context,page}=await setup();await page.goto(base+'/demo-login.html');
  await page.getByRole('button',{name:'Fermer',exact:true}).click();
  await page.locator('#signup-email').fill('not-sent-to-analytics@example.invalid');await page.locator('#signup-submit').click();
  assert.deepEqual(await events(page),[]);await open(page);await accept(page);
  assert.deepEqual((await events(page)).map(e=>e.event),['early_access_page_viewed']);await context.close();
 });
 await check('home-to-form attribution transfers all five UTMs and the random visit ID after consent',async()=>{
  const {context,page,posthogRequests}=await setup();
  await page.goto(base+'/?utm_source=partner&utm_medium=social&utm_campaign=launch-next&utm_content=variant-b&utm_term=multisport');await accept(page);
  const home=(await events(page))[0];assert.equal(home.event,'landing_page_viewed');
  await page.locator('main a[href="demo-login.html"]').first().click();
  const form=(await events(page))[0];assert.equal(form.event,'early_access_page_viewed');
  assert.equal(home.properties.distinct_id,form.properties.distinct_id);
  for(const key of ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'])assert.equal(form.properties[key],home.properties[key]);
  assert.equal(form.properties.environment,'test');assert.deepEqual(posthogRequests,[]);
  assert.deepEqual(await context.cookies(),[]);
  assert.deepEqual(await page.evaluate(()=>Object.keys(localStorage)),[CONSENT_KEY]);await context.close();
 });
 await check('suspicious UTM parameters never reach events or tab storage',async()=>{
  const {context,page}=await setup();await page.goto(base+'/?utm_source=social&utm_content=private%40example.invalid&access_token=never-send');await accept(page);
  const text=JSON.stringify(await events(page))+await stored(page,'sessionStorage',SESSION_KEY);
  assert.ok(!/private|example.invalid|never-send|utm_source/.test(text));await context.close();
 });
 for(const [file,english] of [['demo-login.html',false],['demo-login-en.html',true]]){
  await check(file+': new/existing/error/malformed responses and original form payload',async()=>{
   const {context,page,posthogRequests}=await setup();await page.goto(base+'/'+file);await accept(page,english);
   const button=page.locator('#signup-submit');await button.click();assert.equal(await page.evaluate(()=>window.__signupCalls.length),0);
   const cases=[{data:{ok:true,alreadyRegistered:true},error:null},{data:{ok:false,alreadyRegistered:false},error:null},{data:null,error:null},{data:{},error:null},{data:{ok:true,alreadyRegistered:false},error:{message:'simulated'}},{data:{ok:true,alreadyRegistered:false,email:'not-sent@example.invalid'},error:null}];
   for(const reply of cases){
    await page.evaluate(value=>window.__signupReply=value,reply);
    await page.locator('#signup-email').fill('not-sent@example.invalid');await page.locator('#signup-role').selectOption('coach');await page.locator('#signup-organisation').fill('NOT SENT TO POSTHOG');
    await button.click();await page.waitForFunction(()=>!document.querySelector('#signup-submit').disabled);
   }
   assert.deepEqual((await events(page)).map(e=>e.event),['early_access_page_viewed','early_access_submitted']);
   assert.ok(!JSON.stringify(await events(page)).includes('not-sent'));assert.ok(!JSON.stringify(await events(page)).includes('NOT SENT'));
   const calls=await page.evaluate(()=>window.__signupCalls);
   assert.equal(calls.length,cases.length);assert.ok(calls.every(c=>c.name==='request-beta-access'&&Object.keys(c.body).sort().join(',')==='email,locale,organisation,role,source'));
   assert.equal(calls[0].body.source,english?'early_access_web_en':'early_access_web');
   assert.equal((await button.textContent()).trim(),english?'Notify me at launch':'Me prévenir au lancement');
   assert.deepEqual(posthogRequests,[]);await context.close();
  });
 }
 await check('download # is ignored; valid download records only platform and fixed placement',async()=>{
  const {context,page}=await setup();await page.goto(base+'/');await accept(page);
  const badge=page.locator('[data-analytics-download]').first();await badge.click();assert.equal((await events(page)).length,1);
  await badge.evaluate(link=>{link.href='https://apps.apple.com/app/testflight/id899247664';link.target='_blank';});
  const popupPromise=page.waitForEvent('popup');await badge.click();const popup=await popupPromise;await popup.close();
  const e=(await events(page)).at(-1);assert.equal(e.event,'download_clicked');assert.equal(e.properties.download_platform,'ios');
  assert.equal(e.properties.placement,'footer');assert.ok(!JSON.stringify(e).includes('apple.com'));await context.close();
 });
 await check('withdrawal from a legal page purges the session and blocks an in-flight signup conversion',async()=>{
  const {context,page,posthogRequests}=await setup();await page.goto(base+'/demo-login.html');await accept(page);
  await page.evaluate(()=>window.__signupDelay=true);await page.locator('#signup-email').fill('not-sent@example.invalid');await page.locator('#signup-submit').click();
  const legal=await context.newPage();await legal.goto(base+'/privacy.html');assert.deepEqual(await events(legal),[]);
  await open(legal);await refuse(legal);
  await page.waitForFunction(()=>window.RocksoAnalytics.getTestEvents().length===0);
  assert.equal(await stored(page,'sessionStorage',SESSION_KEY),null);
  await page.evaluate(()=>window.__signupResolve({data:{ok:true,alreadyRegistered:false},error:null}));
  await page.waitForFunction(()=>!document.querySelector('#signup-submit').disabled);
  assert.deepEqual(await events(page),[]);assert.deepEqual(posthogRequests,[]);await context.close();
 });
 await check('expired/corrupt consent and expired visit IDs fail closed',async()=>{
  const {context,page}=await setup();await page.goto(base+'/');await refuse(page);
  await page.evaluate(({CONSENT_KEY,SESSION_KEY,CONSENT_VERSION})=>{
   const createdAt=Date.now()-181*86400000;localStorage.setItem(CONSENT_KEY,JSON.stringify({version:CONSENT_VERSION,accepted:true,createdAt,expiresAt:createdAt+180*86400000}));
   sessionStorage.setItem(SESSION_KEY,JSON.stringify({id:crypto.randomUUID(),updatedAt:Date.now()-31*60000,utm:{utm_source:'obsolete'}}));
  },{CONSENT_KEY,SESSION_KEY,CONSENT_VERSION});
  await page.reload();assert.deepEqual(await events(page),[]);assert.equal(await stored(page,'sessionStorage',SESSION_KEY),null);
  await accept(page);assert.ok(!JSON.stringify(await events(page)).includes('obsolete'));
  await page.evaluate(key=>localStorage.setItem(key,'invalid'),CONSENT_KEY);await page.reload();assert.deepEqual(await events(page),[]);await context.close();
 });
 await check('updated FR/EN information matches consent version; superseded acceptance fails closed and text fits mobile',async()=>{
  for(const [home,policy,english] of [['index.html','privacy.html',false],['index-en.html','privacy-en.html',true]]){
   const {context,page,posthogRequests}=await setup();await page.goto(base+'/'+home);
   await page.evaluate(({CONSENT_KEY})=>{
    const createdAt=Date.now();
    localStorage.setItem(CONSENT_KEY,JSON.stringify({version:'2026-10-20.1',accepted:true,createdAt,expiresAt:createdAt+180*86400000}));
   },{CONSENT_KEY});
   assert.notEqual(CONSENT_VERSION,'2026-10-20.1');await page.reload();
   assert.deepEqual(await events(page),[]);assert.equal(await stored(page,'sessionStorage',SESSION_KEY),null);
   assert.equal(await page.locator('.analytics-consent[open]').count(),1);
   const dialogText=await page.locator('.analytics-consent').textContent();
   assert.match(dialogText,english?/acquisition sources/:/sources d’acquisition/);
   assert.match(dialogText,english?/withdraw consent at any time/:/retirer votre accord à tout moment/);
   assert.equal(await page.locator('.analytics-consent a').getAttribute('href'),policy+(english?'#website-analytics':'#site-analytics'));
   for(const width of [320,390,1280]){
    await page.setViewportSize({width,height:800});
    assert.equal(await page.locator('.analytics-consent').evaluate(el=>el.scrollWidth<=el.clientWidth+1),true);
    await page.getByRole('button',{name:english?'Refuse':'Refuser',exact:true}).scrollIntoViewIfNeeded();
    assert.equal(await page.getByRole('button',{name:english?'Refuse':'Refuser',exact:true}).isVisible(),true);
   }
   if(process.env.ROCKSO_ANALYTICS_SCREENSHOT_DIR){
    await page.setViewportSize({width:390,height:844});
    await page.screenshot({path:path.join(process.env.ROCKSO_ANALYTICS_SCREENSHOT_DIR,`rockso-consent-updated-${english?'en':'fr'}.png`)});
   }
   await page.goto(base+'/'+policy);
   assert.equal(await page.locator('[data-analytics-policy-version]').getAttribute('data-analytics-policy-version'),CONSENT_VERSION);
   assert.equal(await page.locator('main').getAttribute('data-privacy-version'),'2026-10-18.1');
   assert.match(await page.locator('[data-analytics-retention-pending]').textContent(),/12 (mois|months)/);
   for(const width of [320,390,1280]){
    await page.setViewportSize({width,height:800});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
   }
   assert.deepEqual(await events(page),[]);assert.equal(posthogRequests.length,0);await context.close();
  }
 });
 await check('OAuth, beta invitations, old home pages and both demos have no analytics inclusion or activation',async()=>{
  const {context,page,posthogRequests}=await setup();
  for(const file of ['oauth/garmin/callback/index.html','oauth/coros/callback/index.html','oauth/polar/callback/index.html','oauth/suunto/callback/index.html','beta-access.html','demo-app.html','demo/index.html','app-demo/index.html','index-old.html','index-en-old.html']){
   const source=await fs.readFile(path.join(root,file),'utf8');assert.ok(!source.includes('assets/analytics.js'),file);
   await page.goto(base+'/'+file,{waitUntil:'domcontentloaded'});
   assert.equal(await page.evaluate(()=>typeof window.RocksoAnalytics),'undefined',file);
   // Guard remains closed even if this module is accidentally included later.
   await page.addScriptTag({type:'module',url:base+'/assets/analytics.js'});
   assert.equal(await page.evaluate(()=>typeof window.RocksoAnalytics),'undefined',file);
  }
  assert.deepEqual(posthogRequests,[]);await context.close();
 });
 await check('all eight legal pages expose preference management without page events',async()=>{
  const {context,page,posthogRequests}=await setup();
  for(const file of ['privacy.html','privacy-en.html','cgu.html','terms-en.html','mentions-legales.html','legal-notice-en.html','account-deletion.html','account-deletion-en.html']){
   await page.goto(base+'/'+file);assert.equal(await page.locator('[data-analytics-preferences]:visible').count(),1);
   assert.deepEqual(await events(page),[]);await open(page);assert.equal(await page.locator('.analytics-consent[open]').count(),1);
   assert.equal(await stored(page,'sessionStorage',SESSION_KEY),null);
  }
  assert.deepEqual(posthogRequests,[]);await context.close();
 });
 if(sdkSource){
  await check('real pinned SDK generates implicit properties; final filter removes them (keyless offline audit)',async()=>{
   const {context,page,posthogRequests}=await setup({test:false});
   await page.goto(base+'/?email=raw-marker%40example.invalid#access_token=raw-token');
   await page.addScriptTag({content:sdkSource});
   const audit=await page.evaluate(async()=>{
    const {sdkOptions,filterSdkEvent}=await import('/assets/analytics.js');
    const id=crypto.randomUUID();const sdk=new window.posthog.constructor();
    sdk.set_config(sdkOptions(id,()=>null,new AbortController().signal));
    sdk.opt_in_capturing({captureEventName:false});
    const sdkConsentKeys=Object.keys(localStorage);
    sdk.opt_out_capturing();sdk.clear_opt_in_out_capturing();
    const clearedConsentKeys=Object.keys(localStorage);
    // Exercise the real enrichment method without inventing a token or calling init.
    const persistence={properties:()=>({distinct_id:id,$referrer:'https://private.invalid/?email=marker',$initial_current_url:location.href}),remove_event_timer:()=>undefined,get_property:()=>undefined};
    sdk.persistence=persistence;sdk.sessionPersistence=persistence;
    const raw=sdk.calculateEventProperties('landing_page_viewed',{page_id:'home_fr',language:'fr',platform:'desktop'});
    const result=filterSdkEvent({event:'landing_page_viewed',properties:raw},{allowed:true,id,environment:'test',projectToken:''});
    return {version:sdk.version,rawKeys:Object.keys(raw).sort(),filteredKeys:Object.keys(result.properties).sort(),filtered:JSON.stringify(result),sdkConsentKeys,clearedConsentKeys};
   });
   assert.equal(audit.version,'1.380.0');
   for(const key of ['$current_url','$raw_user_agent','$referrer','$initial_current_url','$screen_width'])assert.ok(audit.rawKeys.includes(key),key);
   assert.ok(!/raw-marker|raw-token|private.invalid|\$current_url|\$referrer|\$raw_user_agent|\$device_id/.test(audit.filtered));
   assert.deepEqual(audit.sdkConsentKeys,['rockso_audience_sdk_consent']);assert.deepEqual(audit.clearedConsentKeys,[]);
   assert.deepEqual(posthogRequests,[]);report.sdkAudit={version:audit.version,rawKeys:audit.rawKeys,filteredKeys:audit.filteredKeys,sdkConsentKeys:audit.sdkConsentKeys,clearedConsentKeys:audit.clearedConsentKeys};await context.close();
  });
 }else console.log('BLOCKED real SDK property audit: set ROCKSO_POSTHOG_SDK_PATH to the verified pinned SDK file.');
 if(realToken && sdkSource){
  if(!/^phc_[a-z0-9_-]{12,196}$/i.test(realToken))throw new Error('Only a real separately supplied public project token is accepted; token value withheld.');
  // Never log the request body/token, including in assertion failure messages.
  const decodedCaptures=requests=>requests.filter(r=>r.method==='POST').map(request=>{
   let payload;
   try { payload=JSON.parse(request.body); }
   catch { throw new Error('Unexpected SDK wire encoding; request contents withheld.'); }
   assert.ok(payload && typeof payload==='object' && !Array.isArray(payload),'Expected one JSON event per request');
   assert.ok(request.headers.referer===undefined,'No HTTP referrer may reach PostHog');
   assert.ok(request.headers.cookie===undefined,'No Cookie header may reach PostHog');
   const url=new URL(request.url);
   assert.equal(url.hostname,'eu.i.posthog.com');
   assert.equal(url.pathname,'/e/');
   assert.ok(!url.search.includes(realToken),'Project token must not appear in request URL');
   const p=payload.properties;
   assert.ok(p && p.token===realToken,'SDK transport must retain only the supplied public project token');
   assert.equal(p.$geoip_disable,true);assert.equal(p.$ip,null);assert.equal(p.$process_person_profile,false);
   const keys=['surface','distinct_id','$process_person_profile','$geoip_disable','$ip','environment','page_id','language','platform','token','utm_source','utm_medium','utm_campaign','utm_content','utm_term'];
   if(payload.event==='download_clicked')keys.push('download_platform','placement');
   assert.ok(Object.keys(p).every(key=>keys.includes(key)),'Unexpected implicit SDK property');
   assert.ok(Object.keys(payload).every(key=>['event','uuid','timestamp','properties'].includes(key)),'Unexpected implicit top-level SDK field');
   assert.match(p.distinct_id,/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i);
   assert.equal(p.environment,'production');
   assert.ok(!/wire-private|secret-fragment|\$current_url|\$referrer|\$raw_user_agent|\$device_id|\$set/.test(request.body),'Private markers or implicit SDK fields reached the wire');
   return payload;
  });
  const waitForCaptures=async(requests,count)=>{
   await assert.doesNotReject(async()=>{
    const deadline=Date.now()+10000;
    while(requests.filter(r=>r.method==='POST').length<count && Date.now()<deadline)await new Promise(resolve=>setTimeout(resolve,50));
    assert.equal(requests.filter(r=>r.method==='POST').length,count);
   },'Expected locally intercepted SDK capture count');
  };
  await check('unconfigured server fails closed after acceptance without SDK loading or counter writes',async()=>{
   const {context,page,origin,posthogRequests,collectorRequests}=await setup({test:false,production:true,token:realToken,runtimeConfiguration:true,configurationEnabled:false});
   await page.goto(origin+'/index.html');await accept(page);await page.waitForTimeout(250);
   assert.equal(posthogRequests.length,0);assert.equal(collectorRequests.filter(r=>r.method==='POST').length,0);
   await context.close();
  });
  await check('runtime configuration and Supabase counters start only after consent; no visit ID in aggregate request',async()=>{
   const {context,page,origin,posthogRequests,collectorRequests}=await setup({test:false,production:true,token:realToken,runtimeConfiguration:true});
   await page.goto(origin+'/index.html?utm_source=partner&utm_campaign=new-launch');
   assert.equal(collectorRequests.length,0);assert.equal(posthogRequests.length,0);
   await accept(page);await waitForCaptures(posthogRequests,1);
   await page.waitForTimeout(200);
   const writes=collectorRequests.filter(r=>r.method==='POST').map(r=>JSON.parse(r.body));
   assert.equal(writes.length,1);assert.equal(writes[0].mode,'landing');assert.equal(writes[0].events[0].event,'landing_page_viewed');
   assert.ok(!/distinct_id|session_id|email|\$device_id/.test(JSON.stringify(writes)));
   assert.equal(writes[0].events[0].properties.utm_campaign,'new-launch');
   await open(page);await refuse(page);const n=collectorRequests.length;
   await page.evaluate(()=>window.dispatchEvent(new CustomEvent('rockso:early-access-confirmed')));await page.waitForTimeout(100);
   assert.equal(collectorRequests.length,n);await context.close();
  });
  await check('independent minimal audience counts pages without a PostHog consent or visitor identifier',async()=>{
   const {context,page,origin,posthogRequests,collectorRequests}=await setup({test:false,production:true,token:realToken,runtimeConfiguration:true,minimal:true});
   await page.goto(origin+'/index.html?utm_source=partner&utm_campaign=anonymous-launch');await page.waitForTimeout(300);
   await refuse(page);assert.equal(posthogRequests.length,0);
   const writes=collectorRequests.filter(r=>r.method==='POST').map(r=>JSON.parse(r.body));assert.equal(writes.length,1);assert.equal(writes[0].mode,'audience');
   assert.ok(!/distinct_id|session_id|user_id/.test(JSON.stringify(writes)));
   assert.equal(await stored(page,'sessionStorage',SESSION_KEY),null);
   const badge=page.locator('[data-analytics-download]').first();await badge.click();await page.waitForTimeout(100);
   assert.equal(collectorRequests.filter(r=>r.method==='POST').length,1,'Hash download must not count');
   await page.locator('a[href*="demo-login.html"]').first().click();await page.waitForTimeout(300);
   const names=collectorRequests.filter(r=>r.method==='POST').map(r=>JSON.parse(r.body).events[0].event);
   assert.ok(names.includes('landing_cta_clicked'));assert.ok(names.includes('early_access_page_viewed'));
   assert.equal(collectorRequests.filter(r=>r.method==='POST').map(r=>JSON.parse(r.body)).find(b=>b.events[0].event==='early_access_page_viewed').events[0].properties.utm_campaign,'anonymous-launch');
   assert.equal(posthogRequests.length,0);
   await context.close();
  });
  await check('real public key: refusal never initializes the SDK or sends a request',async()=>{
   const {context,page,origin,posthogRequests}=await setup({test:false,production:true,token:realToken});
   await page.goto(origin+'/');await refuse(page);await page.goto(origin+'/demo-login.html');
   assert.equal(posthogRequests.length,0);assert.equal(await stored(page,'sessionStorage',SESSION_KEY),null);
   assert.deepEqual(await context.cookies(),[]);await context.close();
  });
  for(const [home,form,english] of [['index.html','demo-login.html',false],['index-en.html','demo-login-en.html',true]]){
   await check('real SDK '+(english?'EN':'FR')+': four events, GeoIP disabled, no implicit collection, withdrawal stops transport',async()=>{
    const {context,page,origin,posthogRequests}=await setup({test:false,production:true,token:realToken});
    await page.goto(origin+'/'+home+'?utm_source=partner&utm_medium=social&utm_campaign=launch-next&utm_content=variant-b&utm_term=multisport#secret-fragment');
    assert.equal(posthogRequests.length,0);await accept(page,english);
    try { await waitForCaptures(posthogRequests,1); }
    catch(error){
     console.log('Sanitized SDK initialization diagnostic',JSON.stringify(await page.evaluate(()=>({
      sdkPresent:!!window.posthog,loaded:!!window.posthog?.__loaded,version:window.posthog?.version,
      optedOut:window.posthog?.has_opted_out_capturing?.(),
      scriptPresent:!!document.querySelector('script[integrity]'),
      sessionPresent:!!sessionStorage.getItem('rockso_audience_session_v1'),
      consentAccepted:JSON.parse(localStorage.getItem('rockso_audience_consent_v1'))?.accepted,
      userAgent:navigator.userAgent,
     }))));
     console.log('Intercepted SDK endpoint paths',posthogRequests.map(r=>({method:r.method,path:new URL(r.url).pathname})));
     throw error;
    }
    const runtime=await page.evaluate(()=>{
     const c=window.posthog.config;
     return Object.fromEntries(['autocapture','capture_pageview','capture_pageleave','capture_heatmaps','capture_dead_clicks','capture_exceptions','capture_performance','rageclick','disable_scroll_properties','disable_session_recording','enable_recording_console_log','disable_surveys','disable_conversations','disable_product_tours','disable_web_experiments','disable_external_dependency_loading','advanced_disable_flags','remote_config_refresh_interval_ms','opt_in_site_apps','person_profiles','save_campaign_params','save_referrer','persistence','disable_persistence','cross_subdomain_cookie','opt_out_capturing_by_default','request_batching','api_transport','disable_beacon','__preview_disable_beacon','disable_compression','debug'].map(key=>[key,c[key]]));
    });
    const expected=sdkOptions('',()=>null,new AbortController().signal);
    for(const [key,value] of Object.entries(runtime))assert.equal(value,expected[key],key);
    assert.deepEqual(await page.evaluate(()=>({consoleLogs:window.posthog.config.logs.captureConsoleLogs,credentials:window.posthog.config.fetch_options.credentials,referrerPolicy:window.posthog.config.fetch_options.referrerPolicy})),{consoleLogs:false,credentials:'omit',referrerPolicy:'no-referrer'});
    const badge=page.locator('[data-analytics-download]').first();await badge.click();
    assert.equal(posthogRequests.filter(r=>r.method==='POST').length,1);
    // Test fixture only: no real store link is configured or opened remotely.
    await badge.evaluate(link=>{link.href='https://apps.apple.com/app/testflight/id899247664';link.target='_blank';});
    const popupPromise=page.waitForEvent('popup');await badge.click();const popup=await popupPromise;await popup.close();
    await waitForCaptures(posthogRequests,2);
    await page.goto(origin+'/'+form+'?email=wire-private%40example.invalid');await waitForCaptures(posthogRequests,3);
    for(const reply of [{data:{ok:true,alreadyRegistered:true},error:null},{data:null,error:{message:'simulated'}},{data:{ok:true,alreadyRegistered:false},error:null}]){
     await page.evaluate(value=>window.__signupReply=value,reply);
     await page.locator('#signup-email').fill('wire-private@example.invalid');
     await page.locator('#signup-organisation').fill('wire-private-organisation');
     await page.locator('#signup-submit').click();await page.waitForFunction(()=>!document.querySelector('#signup-submit').disabled);
    }
    await waitForCaptures(posthogRequests,4);
    const payloads=decodedCaptures(posthogRequests);
    assert.deepEqual(payloads.map(p=>p.event),['landing_page_viewed','download_clicked','early_access_page_viewed','early_access_submitted']);
    assert.equal(new Set(payloads.map(p=>p.properties.distinct_id)).size,1);
    for(const p of payloads){
     assert.equal(p.properties.language,english?'en':'fr');
     for(const key of ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'])assert.ok(typeof p.properties[key]==='string',key);
    }
    assert.deepEqual(await context.cookies(),[]);
    assert.deepEqual((await page.evaluate(()=>Object.keys(localStorage))).sort(),[CONSENT_KEY,'rockso_audience_sdk_consent'].sort());
    assert.deepEqual(await page.evaluate(()=>Object.keys(sessionStorage)),[SESSION_KEY]);
    await open(page);await refuse(page,english);
    assert.equal(await page.evaluate(()=>window.posthog.config.fetch_options.signal.aborted),true);
    assert.equal(await stored(page,'sessionStorage',SESSION_KEY),null);
    assert.deepEqual(await page.evaluate(()=>Object.keys(localStorage)),[CONSENT_KEY]);
    await page.evaluate(()=>window.dispatchEvent(new CustomEvent('rockso:early-access-confirmed')));
    await page.waitForTimeout(700);
    assert.equal(posthogRequests.filter(r=>r.method==='POST').length,4);
    assert.ok(posthogRequests.every(r=>r.url===SDK_URL || (r.method==='POST' && new URL(r.url).pathname==='/e/') || r.method==='OPTIONS'),'Unexpected flags, replay, logs or other SDK endpoint');
    report.keyedSdkDetails??={sdkVersion:'1.380.0',realPostHogRequests:0,languages:[],events:[],propertyKeys:[]};
    report.keyedSdkDetails.languages.push(english?'en':'fr');
    report.keyedSdkDetails.events=[...new Set(payloads.map(p=>p.event))];
    report.keyedSdkDetails.propertyKeys=[...new Set(payloads.flatMap(p=>Object.keys(p.properties)))].sort();
    await context.close();
   });
  }
  report.keyedSdkAudit='PASS: real token supplied externally; all SDK requests intercepted locally';
 }
 console.log(`${passed} checks passed. No browser request was sent to PostHog or the real Supabase backend.`);
 if(process.env.ROCKSO_ANALYTICS_REPORT)await fs.writeFile(process.env.ROCKSO_ANALYTICS_REPORT,JSON.stringify(report,null,2));
 console.log(report.keyedSdkAudit);
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
