// node tests/fill-add-test.js — From your books › Add (v3.87): opens the + Add a bet tab with the fill filled in (it used to switch
// to the Board tab, where the form is not, and drop the fill), keeps the fill listed until Save bet, then links it to the new bet.
// Alonzo's case: Novig, Saquon Barkley Over 53.5 Rushing Yards, $5.00 at 45.5%, played Sunday 11/1.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const FILL={book:'novig', id:'nv-saquon', ref:'74e79907e5ac', price:0.455, qty:10.98, cost:5, fee:0, ts:Date.now()-5*86400e3,
  bet:{sport:'NFL', kind:'prop', player:'Saquon Barkley', statText:'Rushing Yards', side:'O', line:53.5, away:'PHI', home:'WSH'}};
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago', viewport:{width:1400,height:1000}});
  await ctx.addInitScript(F=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.fillV','95'); localStorage.setItem('mbev.fillPending',JSON.stringify([F])); }catch(e){} }, FILL);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1200);
  await p.evaluate(()=>{ renderFromBooks(); document.querySelector('.tab[data-view="v-log"]').click(); }); await p.waitForTimeout(300);
  await p.click('#fromBooks .fb-add'); await p.waitForTimeout(1600);
  const s1=await p.evaluate(()=>({addTab:document.getElementById('v-add').classList.contains('on'), panelShown:document.getElementById('addBetPanel').getBoundingClientRect().height>0,
    player:(document.getElementById('abPlayer')||{}).value, cost:((document.querySelector('#abHost .eb-cost')||{}).value), stillListed:fillPending.length}));
  check('Add opens the + Add a bet tab with the fill filled in (player, cost)', s1.addTab && s1.panelShown && s1.player==='Saquon Barkley' && s1.cost==='5.00', s1);
  check('the fill stays in From your books until the bet is saved', s1.stillListed===1, s1.stillListed);
  // the game is not on ESPN's current slate: type it with its day, as the form asks
  await p.fill('#abGameFree','PHI @ WSH'); await p.dispatchEvent('#abGameFree','input'); await p.fill('#abDate','2026-11-01'); await p.waitForTimeout(300);
  const n0=await p.evaluate(()=>logged.length);
  for(let i=0;i<3 && await p.evaluate(()=>logged.length)===n0;i++){ await p.click('#abHost .eb-save'); await p.waitForTimeout(500); }
  const s2=await p.evaluate(()=>{ const L=logged[logged.length-1]; return {n:logged.length, name:L&&L.name, book:L&&L.book, ref:L&&L.fillRef, listed:fillPending.length, seen:(fillSeen['novig:nv-saquon']||{}).s}; });
  check('Save bet logs it on Novig, linked to the fill, and it leaves the list', s2.n===n0+1 && s2.name==='Saquon Barkley' && s2.book==='Novig' && s2.ref==='74e79907e5ac' && s2.listed===0 && s2.seen==='added', s2);
  await p.reload(); await p.waitForTimeout(1200);
  const s3=await p.evaluate(()=>({n:logged.length, listed:fillPending.length}));
  check('after a reload: the bet is in the log, the fill does not come back', s3.n===n0+1 && s3.listed===0, s3);
  check('no page errors', !errs.length, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
