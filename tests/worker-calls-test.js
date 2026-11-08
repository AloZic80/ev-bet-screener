// node tests/worker-calls-test.js — v4.24. Cloudflare: "exceeded its daily requests limit" (142k; 8,700 per 15 min on a Saturday). The app
// now counts its calls to the Worker (⚡ chip on the Sources row), pauses background polling for 10 minutes when the Worker answers 429 or a
// 5xx that says the limit is reached, polls fills and orders every minute while you use the page and every 3 when it is left open, prices
// your open bets every 5 minutes when no kickoff is near, re-prices a live-edges team only when ESPN's number moved, and switches to cookie
// mode (no CORS preflight) once the Worker says it accepts the passphrase as a cookie.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const NOW=Date.parse('2026-11-07T20:00:00Z'), H=3600e3, M=60e3, iso=ms=>new Date(ms).toISOString(), DAY='2026-11-07';
const B=(id,o)=>Object.assign({id,kind:'prop',book:'Novig',odds:'+127',stake:1,sport:'NHL',date:DAY,start:iso(NOW+5*H),name:'Kris Letang',market:'1.5 Shots On Goal',side:'O',team:'PIT',game:'PIT @ NYR',autoFrom:'novig',fillBook:'novig',fillRef:'m'+id,fills:['f'+id]},o);
const LOG=[B('1'),B('2',{name:'Tyler Bertuzzi',start:iso(NOW+30*M)})];
async function open(b, url, opts){
  const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:1280,height:900}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(([L,o])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.log',JSON.stringify(L)); localStorage.setItem('mbev.pass','secret1'); if(o.cfg) localStorage.setItem('mbev.cfg',JSON.stringify(o.cfg)); }catch(e){} }, [LOG,opts||{}]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  const hits=[]; const S={fail:null, cookieOk:false};
  await p.route('**/*',r=>{ const u=r.request().url();
    if(u.startsWith(url)) return r.fulfill({contentType:'text/html',body:html});
    if(/api\.0xbeta\.dev/.test(u)){ const pth=new URL(u).pathname; hits.push({t:Date.now(), p:pth, h:r.request().headers()});
      if(S.fail) return r.fulfill(S.fail);
      const H={'content-type':'application/json','access-control-allow-origin':r.request().headers()['origin']||'*','access-control-allow-credentials':'true','access-control-expose-headers':'x-auth-cookie'}; if(S.cookieOk) H['x-auth-cookie']='1';   // as the Worker (v3.41) answers
      if(pth==='/budget') return r.fulfill({headers:H,body:JSON.stringify({limit:50,used:20,left:30})});
      if(pth==='/mine/fills') return r.fulfill({headers:H,body:JSON.stringify({fills:[]})});
      if(pth==='/mine/orders') return r.fulfill({headers:H,body:JSON.stringify({orders:[]})});
      if(pth==='/live'){ const bets=JSON.parse(new URL(u).searchParams.get('bets')||'[]'), R={}; bets.forEach(x=>{ R[x.id]={ok:true,src:x.book,price:0.45,bid:0.44,ask:0.45,title:x.name,ref:'R'+x.id,at:new Date().toISOString()}; }); return r.fulfill({headers:H,body:JSON.stringify({results:R})}); }
      return r.fulfill({headers:H,body:'{}'}); }
    if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto(url); await p.waitForTimeout(800);
  return {ctx,p,hits,S,errs};
}
(async()=>{
  const b=await chromium.launch();
  { const {ctx,p,hits,S,errs}=await open(b,'http://app.test/');
    await p.waitForTimeout(3500);   // the first fills / orders / live prices / budget reads
    const n0=hits.length, chip=await p.evaluate(()=>{ const e=document.querySelector('#srcBar .src-chip.wk'); return e?{t:e.textContent, n:wkState().n, p:wkState().p}:null; });
    check('the ⚡ chip counts the calls this page made to the Worker, by path (budget, fills, orders, live)', chip && chip.n===n0 && /Worker/.test(chip.t) && chip.p['/mine/fills']>=1 && chip.p['/live']>=1, {chip, n0});
    // the user is active: fills again after a minute, not after 20 s
    await p.mouse.wheel(0,10); const a0=hits.filter(x=>x.p==='/mine/fills').length;
    await p.clock.fastForward(25000); await p.waitForTimeout(300); const a1=hits.filter(x=>x.p==='/mine/fills').length;
    await p.clock.fastForward(40000); await p.waitForTimeout(300); const a2=hits.filter(x=>x.p==='/mine/fills').length;
    check('fills are read once a minute while you use the page (not 25 s in; yes 65 s in)', a1===a0 && a2===a0+1, {a0,a1,a2});
    // left open: every 3 minutes
    await p.evaluate(()=>{ window._bUserT=0; }); const i0=hits.filter(x=>x.p==='/mine/fills').length;
    await p.clock.fastForward(100000); await p.waitForTimeout(300); const i1=hits.filter(x=>x.p==='/mine/fills').length;
    await p.clock.fastForward(100000); await p.waitForTimeout(300); const i2=hits.filter(x=>x.p==='/mine/fills').length;
    check('left open (no scroll, tap or key for 3 min): fills every 3 minutes (not at 100 s; yes at 200 s)', i1===i0 && i2===i0+1, {i0,i1,i2});
    // live prices: a bet kicks off in 30 min → every minute; move the clock so no kickoff is within an hour → every 5
    const l0=hits.filter(x=>x.p==='/live').length; await p.clock.fastForward(65000); await p.waitForTimeout(300); const l1=hits.filter(x=>x.p==='/live').length;
    check('your open bets are priced every minute when one kicks off within the hour', l1>l0, {l0,l1});
    await p.evaluate(()=>{ logged.forEach(x=>{ x.start=new Date(Date.now()+5*3600e3).toISOString(); }); liveAt=Date.now(); });
    const l2=hits.filter(x=>x.p==='/live').length; await p.clock.fastForward(130000); await p.waitForTimeout(300); const l3=hits.filter(x=>x.p==='/live').length;
    await p.clock.fastForward(200000); await p.waitForTimeout(300); const l4=hits.filter(x=>x.p==='/live').length;
    check('and every 5 minutes when no kickoff is near (none at 130 s; yes by 330 s)', l3===l2 && l4>l2, {l2,l3,l4});
    // the Worker says the limit is reached: background polling pauses 10 minutes, the chip says so, a press still goes through
    S.fail={status:500, contentType:'text/html', body:'<html>error code: 1027 — daily request limit exceeded</html>'};
    await p.evaluate(()=>syncFills(true)); await p.waitForTimeout(400); S.fail=null;
    const paused=await p.evaluate(()=>({paused:wkPaused(), chip:(document.querySelector('#srcBar .src-chip.wk')||{}).textContent, why:wkState().why}));
    const c0=hits.length; await p.clock.fastForward(5*60000); await p.waitForTimeout(400); const c1=hits.length;
    check('a 5xx that says "1027 … limit exceeded" pauses background checks 10 minutes: no calls in the next 5 min, the chip says paused', paused.paused && /paused/.test(paused.chip) && /limit/.test(paused.why) && c1===c0, {paused, c0, c1});
    await p.evaluate(()=>syncFills(true)); await p.waitForTimeout(300);
    check('a press of your own (Check my books now) still goes through while paused', hits.length===c0+1 && hits[hits.length-1].p==='/mine/fills', hits.length-c0);
    await p.clock.fastForward(6*60000); await p.waitForTimeout(600);
    check('after the 10 minutes, polling resumes on its own', !(await p.evaluate(()=>wkPaused())) && hits.length>c0+1, hits.length-c0);
    // 429 too
    S.fail={status:429, contentType:'application/json', body:'{"error":"rate"}'}; await p.evaluate(()=>syncFills(true)); await p.waitForTimeout(300); S.fail=null;
    check('a 429 pauses too', await p.evaluate(()=>wkPaused() && /429/.test(wkState().why)), true);
    check('no page errors', !errs.length, errs);
    await ctx.close(); }
  // cookie mode: served from props.0xbeta.dev, the Worker answers x-auth-cookie: 1 → the next calls carry no passphrase header (no preflight)
  { const {ctx,p,hits,S,errs}=await open(b,'https://props.0xbeta.dev/', {});
    S.cookieOk=true; await p.evaluate(()=>syncFills(true)); await p.waitForTimeout(400);
    const before=hits.length; await p.evaluate(()=>syncOrders(true)); await p.waitForTimeout(400);
    const last=hits[hits.length-1];
    check('cookie mode: after the Worker says x-auth-cookie: 1, the next call has no x-screener-pass header (so no preflight) and the mbev_pass cookie is set', hits.length>before && !last.h['x-screener-pass'] && await p.evaluate(()=>/mbev_pass=secret1/.test(document.cookie) && localStorage.getItem('mbev.wkCookie')==='1'), {h:last.h, cookie:await p.evaluate(()=>document.cookie)});
    // the Worker stops taking the cookie (401): back to the header, retried once
    let n401=0; await p.route('**/api.0xbeta.dev/mine/orders**', r=>{ const h=r.request().headers(); if(!h['x-screener-pass']){ n401++; return r.fulfill({status:401, contentType:'application/json', body:'{"error":"locked"}'}); } return r.fulfill({contentType:'application/json', body:'{"orders":[]}'}); });
    const ok=await p.evaluate(async()=>{ const r=await fetch(API_BASE+'/mine/orders',{headers:apiHeaders()}); return r.status; });
    check('a 401 in cookie mode: back to the header and retried once (the call succeeds)', ok===200 && n401===1 && await p.evaluate(()=>localStorage.getItem('mbev.wkCookie')!=='1'), {ok, n401});
    check('no page errors', !errs.length, errs);
    await ctx.close(); }
  // live edges: two games in progress, ESPN unchanged → the second scan asks the Worker for nothing
  { const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:1280,height:900}}); await ctx.clock.install({time:new Date(NOW)});
    await ctx.addInitScript(()=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.pass','secret1'); localStorage.setItem('mbev.cfg',JSON.stringify({books:['Kalshi','Novig']})); }catch(e){} });
    const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); const live=[];
    const ev=(id,a,h)=>({id, date:iso(NOW-H), status:{type:{state:'in',completed:false,detail:'3rd'},period:3,displayClock:'5:00'}, competitions:[{competitors:[{homeAway:'away',team:{abbreviation:a,displayName:a,name:a,id:a},score:'10'},{homeAway:'home',team:{abbreviation:h,displayName:h,name:h,id:h},score:'14'}],situation:{lastPlay:{id:'p1'}}}]});
    await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
      if(/api\.0xbeta\.dev\/live\?/.test(u)){ const bets=JSON.parse(new URL(u).searchParams.get('bets')||'[]'); live.push(bets.map(x=>x.id)); const R={}; bets.forEach(x=>{ R[x.id]={ok:true,src:x.book,price:0.5,bid:0.49,ask:0.5,title:x.name,ref:'R'+x.id,at:new Date().toISOString()}; }); return r.fulfill({contentType:'application/json',body:JSON.stringify({results:R})}); }
      if(/api\.0xbeta\.dev/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'});
      if(/espn.*basketball\/nba\/scoreboard/.test(u)) return r.fulfill({contentType:'application/json',body:JSON.stringify({events:[ev('e1','DAL','PHI'),ev('e2','KC','BUF')]})});   // NBA: a day-based scoreboard (the NFL one is fetched by week)
      if(/espn.*\/probabilities/.test(u)) return r.fulfill({contentType:'application/json',body:JSON.stringify({pageCount:1, items:[{homeWinPercentage:0.62, awayWinPercentage:0.38}]})});
      if(/espn.*\/summary/.test(u)) return r.fulfill({contentType:'application/json',body:JSON.stringify({header:{competitions:[{status:{type:{state:'in'}}}]}})});
      if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
    await p.goto('http://app.test/'); await p.waitForTimeout(800);
    await p.evaluate(()=>{ document.querySelector('.tab[data-view="v-live"]').click(); }); await p.waitForTimeout(300);
    await p.evaluate(()=>leScan(true)); await p.waitForTimeout(1500);
    const n1=live.length, ids1=[].concat(...live);
    check('live edges, first scan: both teams of both games asked, only at the exchanges you bet (Kalshi, Novig; not Polymarket)', n1>0 && ids1.length===8 && ids1.every(i=>/:(kalshi|novig)$/.test(i)), {n1, ids1});
    await p.evaluate(()=>leScan(true)); await p.waitForTimeout(1200);
    const stamp=await p.evaluate(()=>(document.getElementById('leStamp')||{}).textContent||'');
    check('second scan, ESPN unchanged: nothing asked again, the stamp says 8 prices kept from the last scan', live.length===n1 && /8 prices kept from the last scan/.test(stamp), {calls:live.length-n1, stamp});
    check('no page errors', !errs.length, errs);
    await ctx.close(); }
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
