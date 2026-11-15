// node tests/v513-firstrun-test.js [index.html] — v5.13 (owner 11/15: "Yes", from the Las Karens review, agent-notes/karens-review_2026-11-15_v1.md).
// A. FIRST RUN, no passphrase, the Worker answers 401 "locked": (1) a calm one-line note instead of the red "HTTP 401 ... {json}" banner, with a button to Settings › Connect, no "!"
//    on the Bet log tab, its × tappable on a phone (not under the bottom dock) and not covering the More ▾ items; other real errors keep the warning in plain words; (2) Paste is
//    reachable on an empty board and the Sample reads props and says it is a sample; (3) Load starts on the sport in season (NFL in November), a saved Default sport still wins;
//    (4) Leagues says "could not check: not connected", not "no games".
// B. WORDS: (5) TODAY "won +$X profit"; (6) fee / Kelly / devig lines; (7) the Scorecard says parlays are left out, Reports notes a small sample next to the ROI and profit tiles.
// Fails on the v5.12 file, passes on the new one.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,600)); };
const NOW=Date.parse('2026-11-15T18:00:00Z'), H=3600e3, iso=ms=>new Date(ms).toISOString(), DAY='2026-11-15';   // Sun 12:00 PM CT, November
const bet=(id,o)=>Object.assign({id,key:id,sport:'NFL',kind:'prop',book:'Novig',odds:'+100',stake:2,date:DAY,dateSet:true,manual:true,game:'KC @ BUF',name:'Player '+id,side:'O',market:'10.5 Points',betnow:'O 10.5 +100',snap:{at:iso(NOW-5*H)}},o);
const LOG=[ bet('won',{stake:3,odds:'-150',result:'win',gradedBy:'manual',start:iso(NOW-4*H)}), bet('lost',{stake:1.5,result:'loss',gradedBy:'manual',start:iso(NOW-4*H)}),
  { id:'pw', kind:'parlay', sport:'PARLAY', book:'PrizePicks', name:'Parlay · 3 picks', market:'3-pick parlay', odds:'+400', stake:5, date:DAY, dateSet:true, result:'win', start:iso(NOW-4*H),
    parlay:{picks:3, legs:'a; b; c', pays:{all:25,m1:0,m2:0}, hits:3, payout:25}, snap:{at:iso(NOW-5*H)} } ];
const ALLERR=[]; let WORKER={status:401, body:'{"error":"locked: wrong or missing screener passphrase"}'};
async function open(b, o){ o=o||{}; const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:o.w||390,height:o.h||800}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(([L,cfg,dark])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); if(L) localStorage.setItem('mbev.log',JSON.stringify(L)); if(cfg) localStorage.setItem('mbev.cfg',JSON.stringify(cfg)); if(dark) localStorage.setItem('mbev.theme','dark'); }catch(e){} }, [o.log||null,o.cfg||null,!!o.dark]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>{ errs.push(e.message); ALLERR.push(e.message); });
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/0xbeta/.test(u)) return r.fulfill({status:WORKER.status,contentType:'application/json',body:WORKER.body}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(3500); if(o.dark) await p.evaluate(()=>{ document.documentElement.setAttribute('data-theme','dark'); });
  return {ctx,p,errs}; }
const bar=p=>p.evaluate(()=>{ const el=document.getElementById('fillWarn'), t=document.querySelector('.tab[data-view="v-log"]'), n=t.querySelector('.tab-n'), r=el.getBoundingClientRect(), dk=document.getElementById('apiDock').getBoundingClientRect(),
  x=document.getElementById('fillWarnX'), xr=x?x.getBoundingClientRect():null, hit=xr?document.elementFromPoint(xr.left+xr.width/2, xr.top+xr.height/2):null;
  return {hidden:el.hidden, txt:el.innerText.replace(/\s+/g,' '), border:getComputedStyle(el).borderTopColor, ring:t.classList.contains('tab-alert'), mark:getComputedStyle(n,'::before').content, title:t.title||'', go:!!document.getElementById('fillWarnSet'),
    bottom:Math.round(r.bottom), dockTop:Math.round(dk.top), xW:xr?Math.round(xr.width):0, xH:xr?Math.round(xr.height):0, xHit:!!(hit && (hit===x||x.contains(hit))), xInside:!!(xr && xr.top>=0 && xr.bottom<=innerHeight && xr.right<=innerWidth)}; });
(async()=>{
  const b=await chromium.launch();
  // ---- A1: first run at 390 x 800 ----
  let S=await open(b,{w:390,h:800}); let W=await bar(S.p);
  check('1. first run (no passphrase, the Worker answers 401): one calm line "Not connected yet: add your screener passphrase in Settings › Connect", no HTTP, no JSON, no 401', !W.hidden && /Not connected yet: add your screener passphrase in Settings › Connect/.test(W.txt) && !/HTTP|\{|401|A bet you just placed/.test(W.txt), W.txt);
  check('1. it is not red (the border is not the loss red), the Bet log tab has no red ring or "!", and the Open Settings button is there', !/192, ?57, ?43/.test(W.border) && !W.ring && !/!/.test(W.mark) && !W.title && W.go, {border:W.border, ring:W.ring, mark:W.mark, go:W.go});
  check('1. it sits above the bottom dock (nothing under the bar) and its × is 44 px, inside the screen and is the element hit at its centre (390 px)', W.bottom<=W.dockTop && W.xW>=44 && W.xH>=44 && W.xInside && W.xHit, W);
  const more=await S.p.evaluate(async()=>{ const box=document.getElementById('boardMore'); box.open=true; await new Promise(r=>setTimeout(r,200)); const fw=document.getElementById('fillWarn');
    return [...document.querySelectorAll('#boardMoreList button')].map(x=>{ const r=x.getBoundingClientRect(); const hit=document.elementFromPoint(r.left+r.width/2, r.top+r.height/2); return {t:x.textContent.trim().slice(0,14), covered:!!(hit && fw.contains(hit)), visible:r.height>0}; }); });
  check('1. the More ▾ items (Filters, Leagues, Parole, Moneylines ...) are not covered by the note', more.length>=4 && more.every(x=>x.visible && !x.covered), more);
  await S.p.evaluate(()=>{ document.getElementById('boardMore').open=false; });
  await S.p.evaluate(()=>(document.getElementById('fillWarnSet')||{click(){}}).click()); await S.p.waitForTimeout(300);
  const st=await S.p.evaluate(()=>({view:document.body.dataset.view||'', on:(document.querySelector('.view.on')||{}).id||'', open:document.getElementById('srcSettings').open, focus:(document.activeElement||{}).id||''}));
  check('1. the button opens Settings with the Connect section open and the passphrase box ready', (st.view==='v-settings'||st.on==='v-settings') && st.open && st.focus==='screenerPass', st);
  await S.p.evaluate(()=>{ document.querySelector('.tab[data-view="v-board"]').click(); });
  await S.p.evaluate(()=>(document.getElementById('fillWarnX')||{click(){}}).click()); W=await bar(S.p);
  check('1. the × hides the note', W.hidden, W);
  // other real errors keep the warning, in plain words
  WORKER={status:500, body:'{"error":"boom","detail":"stack trace"}'}; await S.p.evaluate(async()=>{ localStorage.removeItem('mbev.fillWarnHid'); await syncFills(true); }); W=await bar(S.p);
  check('1. a real error (the Worker 500) stays a red warning, in plain words, no raw JSON', !W.hidden && /Your books were not read: the Worker had a problem \(error 500\)/.test(W.txt) && !/\{|HTTP|stack/.test(W.txt) && /192, ?57, ?43|rgb/.test(W.border) && W.ring, W);
  WORKER={status:401, body:'{"error":"locked"}'}; await S.p.evaluate(async()=>{ window._fillOkAt=Date.now()-60000; await syncFills(true); }); W=await bar(S.p);
  check('1. a passphrase that worked this session and then stops: the warning stays (red) and says so in plain words', !W.hidden && /no longer accepts your screener passphrase/.test(W.txt) && !/HTTP|\{/.test(W.txt) && W.ring, W);
  await S.ctx.close();
  // 360 px phone: the × is tappable
  WORKER={status:401, body:'{"error":"locked"}'}; S=await open(b,{w:360,h:640}); W=await bar(S.p);
  check('1. at 360 x 640 the note is above the dock and its × can be tapped', !W.hidden && W.bottom<=W.dockTop && W.xInside && W.xHit && W.xW>=44, W);
  const more2=await S.p.evaluate(async()=>{ document.getElementById('boardMore').open=true; await new Promise(r=>setTimeout(r,200)); const fw=document.getElementById('fillWarn'); return [...document.querySelectorAll('#boardMoreList button')].map(x=>{ const r=x.getBoundingClientRect(); const hit=document.elementFromPoint(r.left+r.width/2, r.top+r.height/2); return !!(hit && fw.contains(hit)); }); });
  check('1. at 360 x 640 the More ▾ items are not covered', more2.length>=4 && more2.every(c=>!c), more2);
  await S.ctx.close();
  // ---- A2: empty board, Paste, Sample (1280) ----
  S=await open(b,{w:1280,h:900}); await S.p.evaluate(()=>{ document.querySelector('.tab[data-view="v-board"]').click(); });
  const ep=await S.p.evaluate(()=>{ const e=document.getElementById('emptyPaste'); return {has:!!e, shown:!!(e && e.offsetParent), txt:document.getElementById('emptyMsg').innerText}; });
  check('2. the empty-board text says "or paste a board" with a button', ep.has && ep.shown && /paste a board/i.test(ep.txt), ep);
  await S.p.evaluate(()=>(document.getElementById('emptyPaste')||{click(){}}).click()); await S.p.waitForTimeout(300);
  const pv=await S.p.evaluate(()=>({view:document.body.dataset.view||(document.querySelector('.view.on')||{}).id, open:document.getElementById('pastePanel').open, vis:!!document.getElementById('input').offsetParent}));
  check('2. the button opens the Paste panel (textarea visible)', /v-paste/.test(pv.view) && pv.open && pv.vis, pv);
  await S.p.evaluate(()=>document.getElementById('demo').click()); await S.p.waitForTimeout(500);
  const sm=await S.p.evaluate(()=>({diag:document.getElementById('diag').innerText.replace(/\s+/g,' '), rows:lastRows.length, ta:document.getElementById('input').value.slice(0,40)}));
  check('2. Sample reads props (not "Read 0 props"), and says it is a sample', sm.rows>=2 && /Read \d+ props/.test(sm.diag) && !/Read 0 props/.test(sm.diag) && /This is a sample/i.test(sm.diag), sm);
  await S.ctx.close();
  // ---- A3: the sport Load starts on ----
  S=await open(b,{w:1280,h:900}); let sp=await S.p.evaluate(()=>document.getElementById('apiSport').value);
  check('3. in November, with no schedule known, Load starts on NFL (not MLB)', sp==='NFL', sp); await S.ctx.close();
  S=await open(b,{w:1280,h:900,cfg:{defSport:'NBA',cfgVer:3.03}}); sp=await S.p.evaluate(()=>document.getElementById('apiSport').value);
  check('3. a Default sport you saved (NBA) still wins', sp==='NBA', sp); await S.ctx.close();
  // ---- A4: Leagues locked ----
  S=await open(b,{w:1280,h:900}); await S.p.evaluate(async()=>{ document.querySelector('.tab[data-view="v-leagues"]').click(); await lgScan(); }); await S.p.waitForTimeout(500);
  const lg=await S.p.evaluate(()=>({msg:document.getElementById('lgMsg').innerText.replace(/\s+/g,' '), body:document.getElementById('lgBody').innerText.replace(/\s+/g,' ')}));
  check('4. Leagues: a locked source says "could not check: not connected", and is not counted as no games', /could not check: not connected/i.test(lg.msg) && /Could not check The Odds API: not connected/.test(lg.body) && !/locked, check the passphrase/.test(lg.msg), lg); await S.ctx.close();
  // ---- 5, 6, 7 ----
  S=await open(b,{w:1280,h:1000,log:LOG}); await S.p.evaluate(()=>{ document.querySelector('.tab[data-view="v-board"]').click(); });
  const tb=await S.p.evaluate(()=>document.getElementById('todayBar').innerText.replace(/\s+/g,' '));
  check('5. TODAY: "won +$X profit vs lost $Y" (the profit of the winners, not money returned): $3 at -150 wins +$2.00, and the parlay +$20.00', /✓ played \$[\d.]+ → won \+\$22\.00 profit vs lost \$1\.50/.test(tb), tb.slice(0,300));
  await S.p.evaluate(()=>{ document.querySelector('.tab[data-view="v-settings"]').click(); }); await S.p.waitForTimeout(200);
  const rg=await S.p.evaluate(()=>({g:document.getElementById('rgGrid').innerText.replace(/\s+/g,' '), poly:document.querySelector('label[for="fPoly"]').textContent, polyT:document.querySelector('label[for="fPoly"]').title, novT:document.querySelector('label[for="fNovig"]').title, hint:document.querySelector('#kelly').closest('details').querySelector('p.hint').textContent}));
  check('6. rules at a glance: Kelly says what it comes to (0.25 and 0.5: together 0.125 of full Kelly)', /Kelly 0\.25 × edge after a 0\.5 haircut: together 0\.125 of full Kelly/.test(rg.g), rg.g);
  check('6. Polymarket US says × (1 − price), the same way as Kalshi (rules and the fee box)', /Polymarket US 6\.95% of price × \(1 − price\), the same way as Kalshi/.test(rg.g) && /\(× \(1 − price\)\)/.test(rg.poly) && /same way as Kalshi/.test(rg.polyT), [rg.poly, rg.polyT]);
  check('6. Novig says when the live fee applies (only the extra before the game; 6% × (1 − price) more once it has started)', /Novig 0% extra only that extra before the game; once the game has started, 6% × \(1 − price\) more/.test(rg.g) && /Once the game has started/.test(rg.novT), [rg.novT]);
  check('6. the devig method is one plain line in the rules (Multiplicative, the snapshot\'s "multiplicative v1")', /Devig method Multiplicative each side’s price is divided by both sides added up \(multiplicative v1\)/.test(rg.g), rg.g);
  check('6. Stake sizing hint says the two multiply (0.25 × 0.5 = 0.125)', /Kelly 0\.25 with a haircut of 0\.5 stakes 0\.125 of what full Kelly would/.test(rg.hint), rg.hint);
  await S.p.evaluate(()=>{ document.querySelector('.tab[data-view="v-perf"]').click(); }); await S.p.waitForTimeout(300);
  const sc=await S.p.evaluate(()=>({n:(document.querySelector('.sc-parlay-note')||{}).innerText||''}));
  check('7. Scorecard says parlays are left out and how far the totals differ (settled parlay +$20.00)', /Parlays are left out of this Scorecard/.test(sc.n) && /Results by day/.test(sc.n) && /1 settled parlay came to \+\$20\.00/.test(sc.n), sc.n);
  await S.p.evaluate(()=>{ document.querySelector('.tab[data-view="v-reports"]').click(); }); await S.p.waitForTimeout(500);
  const rp=await S.p.evaluate(()=>[...document.querySelectorAll('#rpHead .rp-k')].filter(k=>/Settled profit|ROI/.test(k.innerText)).map(k=>k.innerText.replace(/\s+/g,' ')));
  check('7. Reports: with 3 settled bets, the "too few to rank" note sits inside the Settled profit and ROI tiles (the page\'s own rpSample word)', rp.length===2 && rp.every(t=>/too few to rank: read with care/.test(t)), rp);
  await S.ctx.close();
  // a big sample has no note (rpSample returns "" from 100)
  const BIG=[]; for(let i=0;i<110;i++) BIG.push(bet('b'+i,{stake:2,odds:'+100',result:i%2?'win':'loss',gradedBy:'manual',start:iso(NOW-4*H),game:'G'+i+' @ X'}));
  S=await open(b,{w:1280,h:1000,log:BIG}); await S.p.evaluate(()=>{ document.querySelector('.tab[data-view="v-reports"]').click(); }); await S.p.waitForTimeout(500);
  const rp2=await S.p.evaluate(()=>[...document.querySelectorAll('#rpHead .rp-tn')].length); check('7. Reports: 110 settled bets: no small-sample note on the tiles', rp2===0, rp2); await S.ctx.close();
  // ---- layout: 4 widths, light and dark: no sideways scroll, the note above the dock, × tappable ----
  for(const dark of [false,true]) for(const w of [390,1000,1280,1960]){ WORKER={status:401, body:'{"error":"locked"}'}; S=await open(b,{w, h:w<700?800:900, dark, log:LOG}); const L=await bar(S.p);
    const ov=await S.p.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
    check('layout '+w+' px '+(dark?'dark':'light')+': the note is above the dock, its × is tappable, no sideways scroll', !L.hidden && L.bottom<=L.dockTop && L.xInside && L.xHit && ov<=1, {bottom:L.bottom, dockTop:L.dockTop, xHit:L.xHit, ov}); await S.ctx.close(); }
  check('no page errors', !ALLERR.length, ALLERR);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
