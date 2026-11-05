// node tests/parlay-edit-test.js — editing a logged parlay (v3.85): each leg and its odds, add or remove a leg, the stake, and
// what it pays if all hit. Alonzo's Bovada 3-pick: logged as +862 paying $9.62; Bovada paid $13.66 (+1266, won $12.66).
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const day=new Date().toLocaleDateString('en-CA',{timeZone:'America/Chicago'});
const PAR={id:'px1', key:'px1', kind:'parlay', date:day, start:null, name:'Bovada combo · 3 picks', sport:'PARLAY', market:'3-pick parlay', betnow:'3 picks', book:'Bovada', odds:'+862', stake:1, result:'pending', closing:'',
  parlay:{picks:3, legs:'OFI Crete OFI CRETE +0.5 Spread -122; Besiktas JK @ Celtic Over 3 Total Pts +105; Chicago Blackhawks CHI +1.5 Spread +158', pays:{all:9.62,m1:0,m2:0}, hits:null, payout:null}, snap:{at:new Date().toISOString()}};
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago', viewport:{width:1400,height:1000}});
  await ctx.addInitScript(L=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.log',JSON.stringify(L)); }catch(e){} }, [PAR]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1200); await p.click('.tab[data-view="v-log"]'); await p.waitForTimeout(300);
  await p.click('#logBody .pl-edit'); await p.waitForTimeout(200);
  const legs=await p.$$eval('#logBody .pl-ed .pl-leg',r=>r.map(x=>x.querySelector('.pl-lt').value+' | '+x.querySelector('.pl-lo').value));
  check('the editor shows each leg with its own odds', legs.length===3 && /OFI Crete .* \| -122/.test(legs[0]) && /\| \+105/.test(legs[1]) && /Blackhawks .* \| \+158/.test(legs[2]), legs);
  check('and the pay it was saved with ($9.62)', await p.$eval('#logBody .pl-ed .pl-pay',x=>x.value)==='9.62', true);
  // fix it to Bovada's slip: Panarin +225 instead of the Blackhawks, OFI Crete at +105
  const L=await p.$$('#logBody .pl-ed .pl-leg');
  await (await L[0].$('.pl-lo')).fill('+105');
  await (await L[2].$('.pl-lt')).fill('Artemi Panarin (LA) 1+ Powerplay Points'); await (await L[2].$('.pl-lo')).fill('+225');
  await p.waitForTimeout(100);
  const calc=await p.evaluate(()=>({pay:document.querySelector('#logBody .pl-ed .pl-pay').value, txt:document.querySelector('#logBody .pl-ed .pl-calc').textContent}));
  check('the pay follows the legs: $1 at +225, +105, +105 = $13.66 (odds +1266, wins $12.66), as Bovada', calc.pay==='13.66' && /odds \+1266/.test(calc.txt) && /wins \$12\.66/.test(calc.txt), calc);
  await p.click('#logBody .pl-ed .pl-save'); await p.waitForTimeout(300);
  let x=await p.evaluate(()=>{ const b=logged[0]; return {odds:b.odds, all:b.parlay.pays.all, legs:b.parlay.legs, picks:b.parlay.picks, row:document.querySelector('#logBody .pl-hit').innerText}; });
  check('saved: the new legs and odds, +1266, pays $13.66', x.odds==='+1266' && x.all===13.66 && x.picks===3 && /Panarin .* \+225/.test(x.legs) && /all 3 hit — \$13\.66/.test(x.row), x);
  await p.selectOption('#logBody .pl-hit','3'); await p.waitForTimeout(300);
  x=await p.evaluate(()=>({res:logged[0].result, payout:logged[0].parlay.payout, profit:betProfit(logged[0])}));
  check('marked all 3 hit: profit +$12.66', x.res==='win' && x.payout===13.66 && Math.abs(x.profit-12.66)<0.001, x);
  // the book's own number typed in wins over the legs; and a graded parlay keeps its new payout
  await p.click('#logBody .pl-edit'); await p.waitForTimeout(200);
  await p.fill('#logBody .pl-ed .pl-pay','13.70'); await p.fill('#logBody .pl-ed .pl-st','1'); await p.waitForTimeout(100);
  check('a pay you type is kept when you change the stake', await p.$eval('#logBody .pl-ed .pl-pay',x=>x.value)==='13.70', true);
  await p.click('#logBody .pl-ed .pl-ladd'); await p.waitForTimeout(100);
  const n=await p.$$eval('#logBody .pl-ed .pl-leg',r=>r.length);
  await p.click('#logBody .pl-ed .pl-leg:last-child .pl-ldel'); await p.waitForTimeout(100);
  check('legs can be added and removed', n===4 && await p.$$eval('#logBody .pl-ed .pl-leg',r=>r.length)===3, n);
  await p.click('#logBody .pl-ed .pl-save'); await p.waitForTimeout(300);
  x=await p.evaluate(()=>({payout:logged[0].parlay.payout, profit:+betProfit(logged[0]).toFixed(2), edits:(logged[0].edits||[]).length}));
  check('an all-hit parlay takes its new payout; each edit is kept on record', x.payout===13.7 && x.profit===12.7 && x.edits===2, x);
  await p.click('#checkResults'); await p.waitForTimeout(1200);
  check('Check results leaves the edited, graded parlay alone', await p.evaluate(()=>logged[0].result==='win' && logged[0].parlay.payout===13.7 && logged[0].odds===fmtOdds(Math.round(americanOf(1/13.7)))), true);
  await p.reload(); await p.waitForTimeout(1200);
  check('all of it survives a reload', await p.evaluate(()=>logged[0].parlay.pays.all===13.7 && logged[0].result==='win'), true);
  await p.setViewportSize({width:390,height:844}); await p.click('.tab[data-view="v-log"]'); await p.waitForTimeout(200);
  const dbtn=await p.$('#logBody .log-day-btn[aria-expanded="false"]'); if(dbtn) await dbtn.click();
  await p.click('#logBody .pl-edit'); await p.waitForTimeout(200);
  check('phone: the editor fits the screen', await p.evaluate(()=>{ const e=document.querySelector('#logBody .pl-ed .pl-edbox'); return !!e && e.getBoundingClientRect().width>0; }), true);
  check('no page errors', !errs.length, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
