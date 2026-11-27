// node tests/v563-redraw-log-test.js — v5.63. Owner: a Board row shifts every few seconds. A redraw log in Settings says what asked for each redraw.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+(ok?'':'  → '+JSON.stringify(got))); };
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:1280,height:900}});
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/api\.0xbeta\.dev/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'});
    if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1200);
  check('version is v5.63', await p.evaluate(()=>SCREENER_VERSION==='v5.63' && document.getElementById('verTag').textContent==='v5.63' && /v5\.63/.test(document.title)), 0);
  await p.evaluate(()=>{ _rdLog=[]; _rdLast=0; function viaTest(){ render([],cfgRead()); } viaTest(); viaTest(); });
  const n=await p.evaluate(()=>_rdLog.length); check('each redraw is logged (2 asked, 2 logged)', n===2, n);
  const v=await p.evaluate(()=>_rdLog[0].via); check('a line says who asked (the caller function and its line)', /viaTest@\d+/.test(v), v);
  await p.evaluate(()=>{ for(let i=0;i<80;i++) rdLogNote(false); }); check('only the last 60 are kept', await p.evaluate(()=>_rdLog.length)===60, 0);
  await p.evaluate(()=>{ document.getElementById('rdLog').open=true; }); await p.waitForTimeout(100);
  const t=await p.evaluate(()=>document.getElementById('rdLogBox').textContent); check('opening the box shows the lines', /\+\d+\.\ds/.test(t), t.slice(0,80));
  await p.evaluate(()=>document.getElementById('rdClear').click()); check('Clear empties it', await p.evaluate(()=>document.getElementById('rdLogBox').textContent)==='No redraws yet.', 0);
  check('no page errors', !errs.length, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
