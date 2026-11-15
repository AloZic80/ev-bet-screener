// node tests/v511-followups-test.js — v5.11 follow-ups found by the v5.11 reviewers (owner 11/15: "You found bugs but left alone ? Why not address them?").
// (1) The Bet log's "Add a parlay / Pick 6" panel keeps the Game day typed: an entry for a past day counts on that day (dateSet), as + Add a bet's parlay
//     does; before, it counted on the day it was saved. (2) TODAY's Open upside for a free pending parlay is its winnings (Pays − entry), as betProfit pays
//     it; before, a free $5 entry paying $25 showed +$25.00. (3) The parlay hints say what the app does: shown in the Today ribbon (apps without a tile
//     under Other), out of the Scorecard and the stake sizes, but its entry counts in today's total for the daily max (the Hard stop).
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,700)); };
const NOW=Date.parse('2026-11-15T18:00:00Z'), H=3600e3, iso=ms=>new Date(ms).toISOString();   // Sun 12:00 PM CT
const FREE={id:'pf1', kind:'parlay', sport:'PARLAY', book:'PrizePicks', name:'Parlay · 3 picks', market:'3-pick parlay', odds:'+400', stake:5, free:true, date:'2026-11-15', dateSet:true,
  parlay:{picks:3, legs:'a; b; c', pays:{all:25, m1:0, m2:0}, hits:null, payout:null}, result:'pending', snap:{at:iso(NOW-H)}};
async function open(b, log){ const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:1280,height:1000}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(([L])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.log',JSON.stringify(L)); }catch(e){} }, [log]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1300); return {ctx,p,errs}; }
(async()=>{
  const b=await chromium.launch();
  // (2) TODAY: a free pending $5 entry paying $25
  let S=await open(b,[FREE]);
  const up=await S.p.evaluate(()=>{ const e=document.querySelector('.tb-scen .tb-up'); return e?e.textContent.trim():null; });
  check('TODAY: a free pending $5 entry that pays $25 shows Open upside +$20.00 (its winnings; the entry does not come back), not +$25.00', up==='+$20.00', up);
  // (3) the two hints
  const hints=await S.p.evaluate(()=>[...document.querySelectorAll('#addBetPanel .hint, #parlayPanel .hint')].map(x=>x.textContent.replace(/\s+/g,' ').trim()).filter(t=>/prices single bets/.test(t)));
  check('both parlay hints say it counts in today’s total for the daily max (the Hard stop) and that pick’em apps get their own tile (v5.12)', hints.length===2 && hints.every(t=>/Its entry does count in today’s total for your daily max \(the Hard stop\)\./.test(t.replace(/'/g,'’')) && /pick’em apps such as PrizePicks get their own tile/.test(t) && !/not against the screener/.test(t)), hints);
  // (1) the Bet log panel: Game day 11/14 typed on 11/15
  await S.p.evaluate(()=>{ const d=document.getElementById('parlayPanel'); if(d) d.open=true; });
  const rec=await S.p.evaluate(()=>{ const g=id=>document.getElementById(id); g('plBook').value='PrizePicks'; g('plPicks').value='3'; g('plStake').value='5'; g('plAll').value='25'; g('plDay').value='2026-11-14'; g('plLegs').value='x; y; z';
    const n0=logged.length; g('plAdd').click(); const r=logged[logged.length-1]; return {added:logged.length-n0, dateSet:r&&r.dateSet, date:r&&r.date, day:r?gameDayOf(r):null}; });
  check('Bet log panel, Game day 11/14 typed on Sun 11/15: the entry counts on 11/14 (dateSet), as + Add a bet’s parlay does', rec.added===1 && rec.dateSet===true && rec.day==='2026-11-14', rec);
  const rec2=await S.p.evaluate(()=>{ const g=id=>document.getElementById(id); g('plStake').value='5'; g('plAll').value='15'; g('plPicks').value='2'; g('plDay').value='2026-11-15'; g('plAdd').click(); const r=logged[logged.length-1]; return {day:gameDayOf(r), dateSet:r.dateSet}; });
  check('Bet log panel, today’s date left as it is: it counts on today (11/15), as before', rec2.day==='2026-11-15', rec2);
  check('no page errors', !S.errs.length, S.errs); await S.ctx.close();
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
