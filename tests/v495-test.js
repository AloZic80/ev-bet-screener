// node tests/v495-test.js — v4.95 (Alonzo: "i want both bets. the more better, and the following"; "IMAGINE ANOTHER book under that saying, 53.7 etc.
// so, i can choose one or the other"; "build cabron"): under the card's price, the same bet at your other books ("also at"), cheapest first, each
// with its price and whether La Contadora is OK with it at that book. Display only: the card's book, stake and EV are unchanged.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,600)); };
const NOW=Date.parse('2026-11-13T19:00:00Z'), iso=ms=>new Date(ms).toISOString(), TIP=Date.parse('2026-11-14T02:00:00Z');
const T=(ha,abbr)=>({ha,id:abbr,abbr,name:abbr+' Team',loc:abbr,nick:'Team',logo:'',rec:'',color:'333333',alt:'ffffff'});
const GI={state:'pre',startISO:iso(TIP),eventId:'1',timeCT:'',detail:'',teams:[T('away','CHA'),T('home','PHX')]};
const am=p=>p>=0.5?String(Math.round(-100*p/(1-p))):'+'+Math.round(100*(1-p)/p);
const row=(id,name,book,price,extra)=>Object.assign({name,team:'PHX',game:'CHA @ PHX',matchup:'CHA @ PHX',side:'O',sport:'NBA',market:'1.5 Threes',kind:'prop',book,offeredRaw:am(price),offeredProb:price,fairProb:0.62,fairRaw:'',mktProb:0.60,stars:3,evModel:'market',gameInfo:GI,src:'api:NBA:props',apiKey:id,loadedAt:iso(NOW-60e3)},extra||{});
const ROWS=[row('nv','Two Books','Novig',0.52), row('dk','Two Books','DraftKings',0.537), row('pm','Two Books','Polymarket US',0.66), row('fd','Two Books','FanDuel',0.50),
  row('solo','One Book','Novig',0.52,{name:'One Book'})];
(async()=>{ const b=await chromium.launch(); const errs=[];
  for(const W of [390,1280]){ const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:W,height:1000}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(([R])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig,DraftKings,Polymarket US',bank:'500',cfgVer:3.03})); localStorage.setItem('mbev.cards','1'); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:'2026-11-13',rows:R})); }catch(e){} },[ROWS]);
  const p=await ctx.newPage(); p.on('pageerror',e=>errs.push(W+': '+e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1300);
  const before=await p.evaluate(()=>{ const r=lastRows.find(x=>x.apiKey==='nv'); return {stake:r.stake, net:r.actNet}; });
  const A=await p.evaluate(()=>{ const r=lastRows.find(x=>x.apiKey==='nv'); return altBooksOf(r).map(a=>({book:a.book, p:a.p, ok:a.ok, mx:a.mx})); });
  if(W===390){
    check('the same bet at the other books you use, cheapest first; FanDuel (not yours) left out; the card’s own book not repeated', A.length===2 && /DraftKings/.test(A[0].book) && /Polymarket/.test(A[1].book) && A[0].p<A[1].p, A);
    check('each is checked against La Contadora’s OK to at that book: 53.7% OK, 66% over', A[0] && A[0].ok===true && A[1] && A[1].ok===false && A[0].mx>0.537, A);
    check('a bet at only one book gets no “also at” row', await p.evaluate(()=>altBooksOf(lastRows.find(x=>x.apiKey==='solo')).length===0));
  }
  let C=null; for(const t of ['boring','safe','volado','lucky','hail']){ await p.evaluate(m=>{ try{ setMode(m); }catch(e){} }, t); await p.waitForTimeout(250);
    C=await p.evaluate(()=>{ const c=[...document.querySelectorAll('.sc-card')].find(x=>x.textContent.includes('Two Books') && x.querySelector('.sc-alts')); if(!c) return null; const al=[...c.querySelectorAll('.sc-alt')], r=c.getBoundingClientRect();
      return {txt:c.querySelector('.sc-alts').textContent, n:al.length, ok:al.map(x=>x.classList.contains('ok')), idx:al.map(x=>+x.dataset.altIdx), keys:al.map(x=>(lastRows.find(r=>r.idx===+x.dataset.altIdx)||{}).apiKey), fits:al.every(x=>{ const b=x.getBoundingClientRect(); return b.right<=r.right+1 && b.height>=32; })}; });
    if(C) break; }
  check(W+' px: the card shows "also at" with DraftKings 53.7% · OK ✓ first, then Polymarket greyed as over', C && C.n===2 && /also at/i.test(C.txt) && /53\.7%/.test(C.txt) && /OK ✓/.test(C.txt) && /over/.test(C.txt) && C.ok[0]===true && C.ok[1]===false, C);
  check(W+' px: each box points to its own book’s row (a tap opens that book), fits inside the card and is big enough to tap', C && C.keys[0]==='dk' && C.keys[1]==='pm' && C.fits, C);
  const after=await p.evaluate(()=>{ const r=lastRows.find(x=>x.apiKey==='nv'); return {stake:r.stake, net:r.actNet}; });
  check(W+' px: display only: the card’s stake and EV did not move', after.stake===before.stake && after.net===before.net, {before, after});
  const clean=await p.evaluate(()=>{ const vis=e=>!!(e && e.offsetParent); const sub=[...document.querySelectorAll('.board-panel .pc-head .sc-sub')]; const c=document.getElementById('contadora');
    const inBox=!!document.querySelector('.sc-bet .sc-alts'); document.getElementById('barMoreBtn').click(); const subOpen=sub.some(vis); document.getElementById('barMoreBtn').click();
    const hd=document.querySelector('#placeCards>.pc-head:not(.pc-x)'); return {subHidden:sub.length>0 && !sub.some(vis), contadoraHidden:!vis(c), subOpen, inBox, headHidden:!vis(hd)}; });
  check(W+' px: the “The Sentinels · Place these” heading waits behind Filters too (Alonzo: “just SEND the Sentinels”)', clean.headHidden, clean);
  check(W+' px: with Filters closed only the buttons show: La Contadora’s sentence and the long notes under The Sentinels are hidden, and come back when Filters is opened (Alonzo: “only the button for Send the Sentinels”)', clean.subHidden && clean.contadoraHidden && clean.subOpen, clean);
  check(W+' px: “also at” sits inside the price box, right under the price', clean.inBox, clean);
  const ty=()=>p.evaluate(()=>{ const t=document.querySelector('#apiDock .tabs'), r=document.getElementById('apiRow'); return {top:Math.round(t.getBoundingClientRect().top), rowAbove:r.getBoundingClientRect().bottom<=t.getBoundingClientRect().top+1}; });
  const t0=await ty(); await p.click('#bpChip'); await p.waitForTimeout(300); const t1=await ty(); await p.click('#bpChip'); await p.waitForTimeout(200);
  check(W+' px: the API row sits on the tabs; opening BettingPros does not move Board / Live Games / Parlay (Alonzo: \u201cthe APIs on top of Board, Live games, parlay\u201d)', t0.rowAbove && t1.top===t0.top, {t0,t1});
  const over=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth); check(W+' px: no sideways scroll', over<=0, over);
  await ctx.close(); }
  check('no page errors', !errs.length, errs);
  await b.close(); console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(fail?1:0); })();
