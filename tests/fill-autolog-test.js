// node tests/fill-autolog-test.js — Novig bets go into the Bet log on their own (v3.89), even when they match nothing on the log
// or the board, as long as Novig says what they are. Only an undescribed "Novig market 01a…" waits in From your books, and an
// Ignore there sticks for good. Alonzo's own fills of 11/5: O'Reilly Over 1.5 Shots On Goal, Necas Under 1.5 Points,
// Larsson Over 10.5 Points; and the sold 10/26 one he kept ignoring.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const now=Date.now(), H=3600e3, iso=ms=>new Date(ms).toISOString(), CT=ms=>new Date(ms).toLocaleDateString('en-CA',{timeZone:'America/Chicago'});
const fill=(id,ref,price,qty,cost,bet,o)=>Object.assign({book:'novig', id, ref, outcome:'o-'+id, action:'buy', price, qty, cost, fee:0, ts:now-2*H, bet}, o||{});
const FILLS=[
  fill('f1','m-oreilly',.515,8.44,4.35,{kind:'prop', sport:'NHL', player:"Ryan O'Reilly", statText:'Shots On Goal', line:1.5, side:'O', start:iso(now+2*H)}),
  fill('f2','m-necas',.67,1.49,1.00,{kind:'prop', sport:'NHL', player:'Martin Necas', statText:'Points', line:1.5, side:'U', start:iso(now+2*H)}),
  fill('f3','m-larsson',.505,5.14,2.60,{kind:'prop', sport:'NBA', player:'Pelle Larsson', statText:'Points', line:10.5, side:'O', start:iso(now+2*H)}),
  fill('f4','01a17446',.545,2.12,1.16,{desc:''})];   // Novig did not say what this one is
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago', viewport:{width:1400,height:1000}});
  await ctx.addInitScript(()=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.fillV','95'); }catch(e){} });
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/\/mine\/fills/.test(u)) return r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({fills:FILLS, settlements:[], errors:{}})});
    if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1200);
  await p.evaluate(async()=>{ fillBusy=false; await syncFills(true); }); await p.waitForTimeout(300);
  const L=await p.evaluate(()=>logged.map(x=>({name:x.name, market:x.market, side:x.side, book:x.book, odds:x.odds, stake:x.stake, day:gameDayOf(x), ref:x.fillRef})));
  const want=[["Ryan O'Reilly",'1.5 Shots On Goal','O',4.35],['Martin Necas','1.5 Points','U',1.00],['Pelle Larsson','10.5 Points','O',2.60]];
  check('the 3 described Novig bets are in the Bet log on their own: player, line, stat, side, cost, Novig, their day', L.length===3 && want.every(([n,m,sd,st])=>L.some(x=>x.name===n && x.market===m && x.side===sd && x.stake===st && x.book==='Novig' && x.day===CT(now+2*H) && x.ref)), L);
  check('the price is the one Novig filled (51.5% = -106)', L.some(x=>x.name==="Ryan O'Reilly" && x.odds==='-106'), L.map(x=>x.odds));
  let pend=await p.evaluate(()=>{ renderFromBooks(); return fillPending.map(f=>f.id); });
  check('only the undescribed one waits in From your books', pend.join()==='f4', pend);
  await p.click('.tab[data-view="v-log"]'); await p.waitForTimeout(300);
  await p.click('#fromBooks .fb-ign'); await p.waitForTimeout(300);
  // whatever re-reads the fills (another sync, the reset that clears what was seen, a reload), it stays ignored and nothing doubles
  await p.evaluate(async()=>{ fillSeen={}; localStorage.removeItem('mbev.fillV'); fillBusy=false; await syncFills(true); renderFromBooks(); }); await p.waitForTimeout(300);
  pend=await p.evaluate(()=>fillPending.map(f=>f.id));
  check('Ignore sticks, even after the app forgets what it had seen and reads the fills again', pend.length===0, pend);
  await p.reload(); await p.waitForTimeout(1200); await p.evaluate(async()=>{ fillBusy=false; await syncFills(true); renderFromBooks(); }); await p.waitForTimeout(300);
  const after=await p.evaluate(()=>({n:logged.length, pend:fillPending.length, shown:!!document.querySelector('#fromBooks .fb-ign')}));
  check('after a reload and another read: the same 3 bets (no doubles), nothing back in From your books', after.n===3 && after.pend===0 && !after.shown, after);
  check('no page errors', !errs.length, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
