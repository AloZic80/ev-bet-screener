// node tests/fill-warn-test.js — v4.46. Owner, 11/10: "my bets are not getting picked up ... they still show at the board", "another one ... was NOT
// logged". When the read of your books failed, nothing said so (Check my books now even said "all 3 books answered"). Now a red line under the Today card.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const NOW=Date.parse('2026-11-10T19:00:00Z');
let FILLS={status:500, body:'Internal error'};
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:390,height:900}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(()=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig, Kalshi',bank:'500',cfgVer:3.03})); }catch(e){} });
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/\/mine\/fills/.test(u)) return FILLS.status===200?r.fulfill({contentType:'application/json',body:JSON.stringify(FILLS.body)}):r.fulfill({status:FILLS.status,contentType:'text/plain',body:FILLS.body});
    if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(3500);   // the first read runs 2.5 s after load
  const w=()=>p.evaluate(()=>{ const el=document.getElementById('fillWarn'); return {hidden:el.hidden, txt:el.innerText.replace(/\s+/g,' ')}; });
  let W=await w();
  check('the Worker answers HTTP 500: a red line under the Today card says your books were not read, why, and what to do', !W.hidden && /Your books were not read: the Worker answered HTTP 500: Internal error/.test(W.txt) && /I bet this/.test(W.txt) && /Check now/.test(W.txt), W);
  const msg=await p.evaluate(async()=>{ document.getElementById('fillsNow').click(); await new Promise(r=>setTimeout(r,400)); return document.getElementById('fillsMsg').textContent; });
  check('Check my books now says it could not read them (it used to say "all 3 books answered")', /^could not read your books: the Worker answered HTTP 500/.test(msg) && !/all 3 books answered/.test(msg), msg);
  FILLS={status:429, body:'Error 1027'}; await p.evaluate(async()=>{ await syncFills(true); }); W=await w();
  check('HTTP 429 says the Worker is over its daily limit', !W.hidden && /HTTP 429 \(over its daily limit\)/.test(W.txt), W.txt);
  FILLS={status:200, body:{fills:[], settlements:[], errors:{}}};
  await p.evaluate(async()=>{ document.getElementById('fillWarnGo').click(); await new Promise(r=>setTimeout(r,400)); }); W=await w();
  check('Check now on the red line reads again; when the books answer, the line goes away', W.hidden, W);
  FILLS={status:200, body:{fills:[], settlements:[], errors:{novig:'401 token expired'}}}; await p.evaluate(async()=>{ await syncFills(true); }); W=await w();
  check('a book you bet (Novig) failing on its own is named: "Not read from Novig: 401 token expired"', !W.hidden && /Not read from Novig: 401 token expired/.test(W.txt), W.txt);
  // v4.49 (owner: "it is great, but NO WAY to remove it. Perhaps circle the Bet log"): × hides it until the problem changes; the Bet log tab keeps a red ring
  FILLS={status:200, body:{fills:[], settlements:[], errors:{novig:'429 error code: 1015 '}}}; await p.evaluate(async()=>{ await syncFills(true); }); W=await w();
  const tab=()=>p.evaluate(()=>{ const t=document.querySelector('.tab[data-view="v-log"]'), n=t.querySelector('.tab-n'), cs=getComputedStyle(n); return {ring:t.classList.contains('tab-alert'), title:t.title||'', shadow:cs.boxShadow, tabShadow:getComputedStyle(t).boxShadow, shown:cs.display!=='none', mark:getComputedStyle(n,'::before').content, txt:n.textContent}; });   // v4.50: the circle is on the number, not on the whole tab
  let T=await tab();
  check('v4.49: no stray space before the period ("…code: 1015."); v4.50 (owner: "just a circle on the number, not the word Bet log"): the red circle is on the Bet log number only (a "!" when there is no number), the tab itself has none, the message is on hover', /Not read from Novig: 429 error code: 1015\. A bet/.test(W.txt) && T.ring && /Not read from Novig/.test(T.title) && /rgb/.test(T.shadow) && !/inset/.test(T.shadow) && T.tabShadow==='none' && T.shown && T.txt==='' && /!/.test(T.mark), {txt:W.txt.slice(0,80), T});
  await p.evaluate(()=>document.getElementById('fillWarnX').click()); W=await w(); T=await tab();
  check('v4.49: × hides the bar; the ring on the Bet log tab stays', W.hidden && T.ring, {W, T:T.ring});
  await p.evaluate(async()=>{ await syncFills(true); renderFillWarn(); }); W=await w();
  check('v4.49: the same problem on the next check stays hidden', W.hidden, W);
  const fb=await p.evaluate(()=>{ const el=document.getElementById('fromBooks'); return {shown:el.style.display!=='none', txt:el.innerText.replace(/\s+/g,' '), btn:!!el.querySelector('.fw-go'), ids:document.querySelectorAll('#fillWarnGo').length}; });
  check('v4.49: the Bet log (From your books) says it too, with Check now, and not "all matched"', fb.shown && /⚠ Not read from Novig: 429 error code: 1015\./.test(fb.txt) && fb.btn && !/all matched/.test(fb.txt) && fb.ids<=1, fb);
  FILLS={status:500, body:'Internal error'}; await p.evaluate(async()=>{ await syncFills(true); }); W=await w();
  check('v4.49: a different problem (the Worker itself) shows the bar again', !W.hidden && /HTTP 500/.test(W.txt), W.txt.slice(0,90));
  FILLS={status:200, body:{fills:[], settlements:[], errors:{}}}; await p.evaluate(async()=>{ await syncFills(true); }); W=await w(); T=await tab();
  const hid=await p.evaluate(()=>localStorage.getItem('mbev.fillWarnHid'));
  check('v4.49: fixed: the bar and the ring go, and the hidden choice is forgotten (a new problem will show)', W.hidden && !T.ring && !hid, {W:W.hidden, ring:T.ring, hid});
  FILLS={status:200, body:{fills:[], settlements:[], errors:{poly:'no key'}}}; await p.evaluate(async()=>{ await syncFills(true); }); W=await w();
  check('a book not in Books you bet (Polymarket US) failing does not raise the line', W.hidden, W);
  await p.evaluate(()=>{ window._fillOkAt=Date.now()-10*60e3; renderFillWarn(); }); W=await w();
  check('last good read over 6 minutes ago: says when', !W.hidden && /Your books were last read at/.test(W.txt), W.txt);
  await p.setViewportSize({width:1280,height:900}); const ov=await p.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth);
  check('fits on a phone and a computer (no sideways scroll)', ov, ov);
  check('no page errors', !errs.length, errs); await b.close();
  console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail?1:0);
})();
