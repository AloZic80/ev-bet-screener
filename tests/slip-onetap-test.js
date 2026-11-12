// node tests/slip-onetap-test.js — v4.42. Alonzo: "my slips do not open when I press the icon to open the app, those links are NOT working". On a phone the
// card's price chip is now the slip link itself when the book's price is already known (one real tap, which iOS can hand to the book's app). Owner:
// "APP link first and then https last": Novig's chip is the app link, and the tap also shows the bar with the website; on a Mac nothing changes.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium, devices } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const NOW=Date.parse('2026-11-09T19:00:00Z'), iso=ms=>new Date(ms).toISOString(), DAY='2026-11-09', TIP=Date.parse('2026-11-10T02:30:00Z');
const T=(ha,abbr,loc,nick)=>({ha,id:abbr,abbr,name:loc+' '+nick,loc,nick,logo:'',rec:'',color:'333333',alt:'ffffff'});
const row=(id,name,book,price,extra)=>Object.assign({name,team:'VAN',game:'PHI @ VAN',matchup:'PHI @ VAN',side:'O',sport:'NHL',market:'1.5 Shots',kind:'prop',book,offeredRaw:'-108',offeredProb:price,fairProb:0.5546,fairRaw:'',mktProb:0.526,stars:4,evModel:'projection',projValue:2.1,
  gameInfo:{state:'pre',startISO:iso(TIP),timeCT:'',detail:'',teams:[T('away','PHI','Philadelphia','Flyers'),T('home','VAN','Vancouver','Canucks')]},src:'api:NHL:props',apiKey:id,loadedAt:iso(NOW-60e3)},extra||{});
async function run(ctxOpt, rows){
  const b=await chromium.launch(); const ctx=await b.newContext(Object.assign({timezoneId:'America/Chicago'},ctxOpt)); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(([R,d])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig, Kalshi, PrizePicks',bank:'500',cfgVer:3.03})); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows:R})); }catch(e){} },[rows,DAY]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); let asked=0;
  await ctx.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/\/live\?bets=/.test(u)){ asked++; const ds=JSON.parse(decodeURIComponent(u.split('bets=')[1])); const R={}; ds.forEach(d=>{ if(/^q:/.test(d.id)) R[d.id]={ok:true,src:'novig',price:0.519,outcome:'o-123',ref:'m-1',at:new Date().toISOString()}; });   /* only the tap's own check (q:…), not the background scans */ return r.fulfill({contentType:'application/json',body:JSON.stringify({results:R})}); }
    if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1300);
  await p.evaluate(()=>setMode('volado')); await p.waitForTimeout(300);   /* v4.76: the approved bets are split into the tabs by La Contadora's chance: these (53.6%: market 52.6% + 0.35 × (55.46 − 52.6)) are under 🪙 Volado (50 to 60%), not the default 💪 Machín; the iPhone and the Mac read their cards there */
  return {b,ctx,p,errs,asked:()=>asked};
}
const chip=(p,name)=>p.evaluate(n=>{ const c=[...document.querySelectorAll('#placeCards .sc-card')].find(x=>x.textContent.includes(n)); const e=c&&c.querySelector('.sc-price.book'); return e?{tag:e.tagName, href:e.getAttribute('href'), target:e.getAttribute('target')}:null; }, name);
(async()=>{
  const known={ok:true,src:'novig',price:0.519,outcome:'o-777',ref:'m-7',at:new Date(NOW).toISOString()};
  const R=[row('lek','Jonathan Lekkerimaki','Novig',0.519,{_openQ:known}), row('far','Will Cuylle','Novig',0.519,{team:'NYR',game:'NYR @ MTL',matchup:'NYR @ MTL',_openQ:Object.assign({},known,{price:0.70,outcome:'o-far'})}),
           row('none','Elias Pettersson','Novig',0.519)];
  // iPhone
  let {b,ctx,p,errs,asked}=await run(devices['iPhone 13'], R);
  const lek=await chip(p,'Lekkerimaki'), far=await chip(p,'Cuylle'), none=await chip(p,'Pettersson');
  check('iPhone, Novig price known: the chip IS the link, the Novig app link with your $ filled (one tap, no waiting)', lek && lek.tag==='A' && /^novigapp:\/\/events\/o-777\/novig\/\d+\.\d\d$/.test(lek.href), lek);
  check('iPhone, the known price is far from the card (maybe another market): not a direct link (the tap checks first)', far && far.tag==='SPAN', far);
  check('iPhone, no Novig price known yet: not a direct link either', none && none.tag==='SPAN', none);
  // tapping the link chip: the page does not swallow it (no check, no bar)
  const n0=asked();
  await p.evaluate(()=>{ const c=[...document.querySelectorAll('#placeCards .sc-card')].find(x=>x.textContent.includes('Lekkerimaki')); const a=c.querySelector('a.sc-price'); a.addEventListener('click',ev=>ev.preventDefault(),{once:true}); a.querySelector('b').dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true})); }); await p.waitForTimeout(700);   // the test page cannot follow novigapp://, so the browser's own follow is stopped; the app's handler still runs
  const bw=await p.evaluate(()=>{ const e=document.getElementById('slipGo'); if(!e||e.hidden) return null; return {app:e.querySelector('.slip-go-a').getAttribute('href'), web:(e.querySelector('.slip-go-w')||{getAttribute:()=>null}).getAttribute('href')}; });
  check('tapping it opens the app link (the page does not swallow the tap or ask for the price again), and the bar then offers the website in case the app did not open', !!bw && /^novigapp:\/\/events\/o-777/.test(bw.app) && /^https:\/\/novig\.com\/events\/o-777/.test(bw.web||'') && asked()===n0, {bw, asked:asked()-n0});
  // the old way still works when the price is not known: tap → check → bar with the https slip first
  await p.evaluate(()=>{ const e=document.getElementById('slipGo'); if(e) e.hidden=true; const c=[...document.querySelectorAll('#placeCards .sc-card')].find(x=>x.textContent.includes('Pettersson')); c.querySelector('.sc-price.book').dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true})); }); await p.waitForTimeout(900);
  const bar2=await p.evaluate(()=>{ const e=document.getElementById('slipGo'), a=e&&e.querySelector('.slip-go-a'), w=e&&e.querySelector('.slip-go-w'); return e&&!e.hidden?{href:a.getAttribute('href'), app:w&&w.getAttribute('href'), target:a.getAttribute('target')}:null; });
  check('price not known: the tap checks it, then the bar offers the Novig app link first and the website (https) last', bar2 && /^novigapp:\/\/events\/o-123\/novig\//.test(bar2.href) && /^https:\/\/novig\.com\/events\/o-123\/novig\//.test(bar2.app||''), bar2);
  check('no page errors (iPhone)', !errs.length, errs); await b.close();
  // Mac: unchanged (no link chips; the side window)
  ({b,ctx,p,errs,asked}=await run({viewport:{width:1280,height:900}}, R));
  const mac=await chip(p,'Lekkerimaki');
  check('Mac: the chip stays a button (the slip opens in the side window, as before)', mac && mac.tag==='SPAN', mac);
  check('no page errors (Mac)', !errs.length, errs); await b.close();
  console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail?1:0);
})();
