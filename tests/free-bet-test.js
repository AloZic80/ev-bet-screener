// node tests/free-bet-test.js — v4.03. Alonzo: "I put a freebie on 11/2 and when I edit and put it as a freebie, it still counts it
// as a loss (red) on Performance." Ticking Free bet and then Mark LOSS closed the editor without the tick, and a parlay's editor had
// no Free bet at all. Now the tick saves at once, in both editors; a free bet that loses is $0; a free parlay that wins pays its winnings.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const NOW=Date.parse('2026-11-06T18:00:00Z');
const B=(id,o)=>Object.assign({id,key:id,sport:'NFL',kind:'prop',book:'DraftKings',odds:'+150',stake:5,date:'2026-11-02',dateSet:true,manual:true,game:'PHI @ WSH',name:'P '+id,side:'O',market:'50.5 Rushing Yards',betnow:'O 50.5 +150',result:'loss',gradedBy:'manual',resultSrc:'you',snap:{at:'2026-11-02T15:00:00Z'}},o);
const PL=(id,o)=>B(id,Object.assign({kind:'parlay',name:'Bovada combo · 3 picks',market:'3-pick parlay',betnow:'3 picks',book:'Bovada',odds:'+700',parlay:{legs:'A +100; B +100; C +100',picks:3,hits:1,payout:0,pays:{all:40}}},o));
const LOG=[B('save'), B('mark'), PL('pl'), PL('plwin',{date:'2026-11-03',result:'win',stake:5,parlay:{legs:'A +100; B +100; C +100',picks:3,hits:3,payout:40,pays:{all:40}}})];
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:1400,height:1000}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(L=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.log',JSON.stringify(L)); }catch(e){} }, LOG);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1200); await p.click('.tab[data-view="v-log"]'); await p.waitForTimeout(300);
  const open=async id=>{ const i=await p.evaluate(id=>logged.findIndex(x=>x.id===id), id); await p.evaluate(i=>document.querySelector('#logBody button.edit[data-i="'+i+'"]').click(), i); await p.waitForTimeout(300); };
  const tick=sel=>p.evaluate(sel=>{ const c=document.querySelector('#logBody '+sel); c.checked=true; c.dispatchEvent(new Event('change')); }, sel);
  const pl=id=>p.evaluate(id=>{ const x=logged.find(y=>y.id===id); return {free:!!x.free, pl:betProfit(x)}; }, id);
  await open('save'); await tick('.eb-free'); await p.evaluate(()=>document.querySelector('#logBody tr.editor .eb-save').click()); await p.waitForTimeout(300);
  check('Free bet, then Save changes: a lost $5 free bet is $0', JSON.stringify(await pl('save'))==='{"free":true,"pl":0}', await pl('save'));
  await open('mark'); await tick('.eb-free'); await p.evaluate(()=>document.querySelector('#logBody .eb-res[data-res="loss"]').click()); await p.waitForTimeout(300);
  check('Free bet, then Mark LOSS (the way that lost the tick): $0', JSON.stringify(await pl('mark'))==='{"free":true,"pl":0}', await pl('mark'));
  await open('pl'); check('the parlay editor has a Free bet tick', await p.evaluate(()=>!!document.querySelector('#logBody .pl-free')), true);
  await tick('.pl-free'); await p.evaluate(()=>document.querySelector('#logBody .pl-cancel').click()); await p.waitForTimeout(300);
  check('a free parlay that missed: $0, saved even when you close the editor with Cancel', JSON.stringify(await pl('pl'))==='{"free":true,"pl":0}', await pl('pl'));
  await open('plwin'); await tick('.pl-free'); await p.evaluate(()=>document.querySelector('#logBody .pl-cancel').click()); await p.waitForTimeout(300);
  check('a free parlay that hit pays its winnings: $40 − $5 = $35 (the stake does not come back)', (await pl('plwin')).pl===35, await pl('plwin'));
  await p.click('.tab[data-view="v-perf"]'); await p.waitForTimeout(400);
  const c=await p.evaluate(()=>{ const e=document.querySelector('.cal-c[data-day="2026-11-02"]'); return {cls:e.className, v:e.querySelector('.v').textContent}; });
  check('Performance calendar, 11/2: not red ($0.00, no loss)', !/ l\b/.test(c.cls) && /\$0\.00/.test(c.v), c);
  await p.reload(); await p.waitForTimeout(1200);
  check('after a reload, all four are still free bets', await p.evaluate(()=>logged.every(x=>x.free===true)), true);
  check('no page errors', !errs.length, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
