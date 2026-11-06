// node tests/fill-oneclick-test.js — v3.91. Alonzo's My books on 11/5: Larsson, O'Reilly, Necas showed "✗ not logged" with
// "checked: added · prop/Pelle Larsson/POINTS/10.5/O": the app had marked them added, but no bet in the log carried them.
// 1) such a fill is logged again on the next check; 2) + Add logs a described bet in one tap, no form.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const now=Date.now(), H=3600e3, iso=ms=>new Date(ms).toISOString();
const fill=(id,ref,price,qty,cost,bet)=>({book:'novig', id, ref, outcome:'o-'+id, action:'buy', price, qty, cost, fee:0, ts:now-2*H, bet});
const FILLS=[
  fill('f3','m-larsson',.505,5.14,2.60,{kind:'prop', sport:'NBA', player:'Pelle Larsson', statText:'POINTS', line:10.5, side:'O', start:iso(now+3*H)}),
  fill('f1','m-oreilly',.515,8.44,4.35,{kind:'prop', sport:'NHL', player:"Ryan O'Reilly", statText:'SHOTS ON GOAL', line:1.5, side:'O', start:iso(now+2*H)}),
  fill('f2','m-necas',.67,1.49,1.00,{kind:'prop', sport:'NHL', player:'Martin Necas', statText:'POINTS', line:1.5, side:'U', start:iso(now+2*H)})];
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago', viewport:{width:1400,height:1000}});
  // what Alonzo's device held: all three marked "added", none in the log; O'Reilly's bet was removed from the log by hand
  await ctx.addInitScript(F=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.fillV','95');
    const s={}; F.forEach(f=>s[f.book+':'+f.id]={s:'added',q:f.qty}); localStorage.setItem('mbev.fillSeen',JSON.stringify(s));
    localStorage.setItem('mbev.removed',JSON.stringify([{id:'r1',name:"Ryan O'Reilly",market:'1.5 Shots On Goal',side:'O',book:'Novig',fills:['f1'],removedAt:new Date().toISOString()}])); }catch(e){} }, FILLS);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/\/mine\/fills/.test(u)) return r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({fills:FILLS, settlements:[], errors:{}})});
    if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1200);
  await p.evaluate(async()=>{ fillBusy=false; await syncFills(true); renderMyBooks(); }); await p.waitForTimeout(300);
  let L=await p.evaluate(()=>logged.map(x=>({name:x.name, market:x.market, side:x.side, stake:x.stake, book:x.book})));
  check('marked added but missing from the log: Larsson and Necas are logged again on the next check', L.length===2 && L.some(x=>x.name==='Pelle Larsson' && x.market==='10.5 Points' && x.side==='O' && x.stake===2.6) && L.some(x=>x.name==='Martin Necas' && x.side==='U' && x.stake===1), L);
  check('a bet you removed from the log by hand does not come back by itself', !L.some(x=>x.name==="Ryan O'Reilly"), L.map(x=>x.name));
  await p.click('.tab[data-view="v-log"]'); await p.waitForTimeout(200);
  const btn=await p.evaluate(()=>[...document.querySelectorAll('.mb-add')].map(x=>x.dataset.k));
  check('My books: only O\'Reilly is not logged, with + Add', btn.join()==='novig:f1', btn);
  await p.evaluate(()=>document.querySelector('.mb-add[data-k="novig:f1"]').click()); await p.waitForTimeout(600);
  const r=await p.evaluate(()=>({tab:document.getElementById('v-add').classList.contains('on'), bet:logged.find(x=>x.name==="Ryan O'Reilly"), left:document.querySelectorAll('.mb-add').length}));
  check('+ Add logs it in one tap: no form, O\'Reilly Over 1.5 Shots On Goal, $4.35 at -106 on Novig', !r.tab && r.bet && r.bet.market==='1.5 Shots On Goal' && r.bet.side==='O' && r.bet.stake===4.35 && r.bet.odds==='-106' && r.bet.book==='Novig' && r.left===0, r);
  await p.reload(); await p.waitForTimeout(1200); await p.evaluate(async()=>{ fillBusy=false; await syncFills(true); });
  check('after a reload and another read: 3 bets, no doubles', await p.evaluate(()=>logged.length), 3);
  check('no page errors', !errs.length, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
