// node tests/v526-money-test.js — v5.26 (Build B, owner "BUILD ALL" 11/22): money from the book's fills.
// PROFIT-1 a won exchange bet of two orders is paid from what all its contracts cost (not at the last order's price); its saved price is the average.
// PROFIT-3 a won fill bet pays $1 a contract minus its cost (not from a whole American price), on betProfit, rpToWin and the Today card's Open upside.
// PROFIT-2 / GRADING-7 partial sales add up by sale id, after each sale's fee; SOLD when they reach the contracts bought; the rest settles at $1 a contract
// if it wins; a full sale counts its sell fee; a re-read never adds a sale twice; Kalshi's settlement of a closed position (side null) grades nothing.
// Every dollar value is worked out by hand in the comments (independent of the page's own functions).
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const NOW=Date.parse('2026-11-22T18:00:00Z'), H=3600e3, iso=ms=>new Date(ms).toISOString();
const BET=(player,line)=>({kind:'prop', sport:'NBA', player, statText:'Points', line, side:'O', start:iso(NOW+6*H), away:'LAL', home:'BOS'});
const buy=(id,ref,price,qty,cost,fee,player,o)=>Object.assign({book:'kalshi', id, ref, side:'yes', action:'buy', price, qty, cost, fee, ts:NOW-3*H, bet:BET(player,10.5)}, o||{});
const sell=(id,ref,price,qty,fee,player,o)=>Object.assign({book:'kalshi', id, ref, side:'yes', action:'sell', price, qty, cost:+(price*qty).toFixed(2), fee, ts:NOW-2*H, bet:BET(player,10.5)}, o||{});
let SERVE={fills:[], settlements:[]};
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago', viewport:{width:1400,height:1000}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(()=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.fillV','95'); }catch(e){} });
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/\/mine\/fills/.test(u)) return r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(Object.assign({errors:{}}, SERVE))});
    if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1200);
  const sync=async()=>{ await p.evaluate(async()=>{ fillBusy=false; fillAt=0; await syncFills(true); }); await p.waitForTimeout(150); };
  const get=name=>p.evaluate(n=>{ const x=logged.find(y=>y.name===n); return x?{odds:x.odds, stake:x.stake, fee:x.fee, fillQty:x.fillQty, fillCost:x.fillCost, result:x.result||null, sold:x.sold||null, soldFills:x.soldFills, soldCash:x.soldCash, profit:betProfit(x), toWin:rpToWin(x), n:logged.filter(y=>y.name===n).length}:null; }, name);

  // ---- PROFIT-1: two orders on one market. 10 @ 40¢ ($4.00 + $0.17 fee) then 10 @ 60¢ ($6.00 + $0.17). Paid $10.34 for 20 contracts.
  // A win pays 20 × $1 = $20.00: +$9.66 in either order. Average price (10.34 − 0.34) ÷ 20 = 50¢ = -100 (before: -150, the last order's 60¢; a win +$6.19).
  SERVE={fills:[buy('a1','KX-AAA',0.40,10,4.00,0.17,'Alan Ames')], settlements:[]}; await sync();
  SERVE={fills:[buy('a1','KX-AAA',0.40,10,4.00,0.17,'Alan Ames'), buy('a2','KX-AAA',0.60,10,6.00,0.17,'Alan Ames',{ts:NOW-2.5*H})], settlements:[]}; await sync();
  let A=await get('Alan Ames');
  check('PROFIT-1: the two orders are one bet of 20 contracts costing $10.34', A && A.n===1 && A.fillQty===20 && Math.abs(A.stake-10.34)<0.005, A);
  check('PROFIT-1: its price is the average of all 20 contracts, 50¢ (-100), not the last order’s 60¢ (-150)', A && A.odds==='-100', A&&A.odds);
  check('PROFIT-1: open, a win would make +$9.66 (rpToWin: 20 − 10.34)', A && Math.abs(A.toWin-9.66)<0.005, A&&A.toWin);
  SERVE.settlements=[{book:'kalshi', ref:'KX-AAA', side:'yes', result:'yes', outcome:'win', payout:20, ts:NOW-H}]; await sync();
  A=await get('Alan Ames');
  check('PROFIT-1: Kalshi settles YES: +$9.66 (20 × $1 − $10.34; it was +$6.19)', A && A.result==='win' && Math.abs(A.profit-9.66)<0.005, A);
  // the same two orders the other way round (60¢ first): +$9.66 too (before: +$14.80)
  SERVE={fills:[buy('b1','KX-BBB',0.60,10,6.00,0.17,'Bob Brown')], settlements:[]}; await sync();
  SERVE={fills:[buy('b1','KX-BBB',0.60,10,6.00,0.17,'Bob Brown'), buy('b2','KX-BBB',0.40,10,4.00,0.17,'Bob Brown',{ts:NOW-2.5*H})], settlements:[{book:'kalshi', ref:'KX-BBB', side:'yes', result:'yes', outcome:'win', payout:20, ts:NOW-H}]}; await sync();
  const B2=await get('Bob Brown');
  check('PROFIT-1: orders the other way round (60¢ then 40¢) also +$9.66 (it was +$14.80)', B2 && B2.result==='win' && Math.abs(B2.profit-9.66)<0.005, B2);

  // ---- PROFIT-3: one order of 190 contracts at 52¢, $98.80 + $3.32 fee = $102.12. A win: 190 − 102.12 = +$87.88 (from -108 rounded: +$88.16)
  SERVE={fills:[buy('c1','KX-CCC',0.52,190,98.80,3.32,'Carl Cole')], settlements:[]}; await sync();
  let C=await get('Carl Cole');
  check('PROFIT-3: open, the Open upside of the bet is +$87.88 (190 × $1 − $102.12)', C && Math.abs(C.toWin-87.88)<0.005, C);
  const today=await p.evaluate(()=>{ try{ renderTodayBar(); }catch(e){} const t=document.querySelector('.tb-scen'); return t?t.textContent:''; });
  check('PROFIT-3: the Today card’s Open upside counts $87.88 for it (with $9.66, $9.66 settled... only open bets count)', /87\.88/.test(today), today.slice(0,240));
  SERVE.settlements=[{book:'kalshi', ref:'KX-CCC', side:'yes', result:'yes', outcome:'win', payout:190, ts:NOW-H}]; await sync();
  C=await get('Carl Cole');
  check('PROFIT-3: won: +$87.88, not +$88.16 from the rounded -108', C && C.result==='win' && Math.abs(C.profit-87.88)<0.005, C);
  // a bet whose stake you corrected is left to its odds (accountingSource user), and a To win typed wins over the contracts
  const U=await p.evaluate(()=>{ const base={kind:'prop', result:'win', odds:'-108', stake:102.12, autoFrom:'kalshi', fills:['z'], fillQty:190, fillCost:102.12, snap:{fee:0.0336}};
    return {user:betProfit(Object.assign({},base,{accountingSource:'user'})), towin:betProfit(Object.assign({},base,{towin:80})), regrow:betProfit(Object.assign({},base,{bookPaid:150, resultSrc:'Kalshi'}))}; });
  check('PROFIT-3: a stake you corrected keeps the odds math; a typed To win wins; a Kalshi payout that is not $1 a contract held falls back to the odds', Math.abs(U.user-88.16)<0.02 && U.towin===80 && Math.abs(U.regrow-88.16)<0.02, U);

  // ---- PROFIT-2 / GRADING-7: 10 contracts at 50¢, $5.00 + $0.18 fee = $5.18.
  // (b) sold 5 at 70¢ ($3.50 − $0.08 = $3.42), the other 5 WIN: 3.42 + 5 − 5.18 = +$3.24 (before: +$4.82)
  SERVE={fills:[buy('d1','KX-DDD',0.50,10,5.00,0.18,'Dan Dale')], settlements:[]}; await sync();
  SERVE.fills.unshift(sell('ds1','KX-DDD',0.70,5,0.08,'Dan Dale')); await sync(); await sync();   // read twice: the sale counts once
  let D=await get('Dan Dale');
  check('PROFIT-2: one sale of 5 is counted once, after its fee ($3.42), even when read twice; not SOLD (5 of 10)', D && D.soldFills===5 && Math.abs(D.soldCash-3.42)<0.005 && !D.sold, D);
  check('PROFIT-2: open, a win would make +$3.24 (3.42 + 5 − 5.18)', D && Math.abs(D.toWin-3.24)<0.005, D&&D.toWin);
  SERVE.settlements=[{book:'kalshi', ref:'KX-DDD', side:'yes', result:'yes', outcome:'win', payout:5, ts:NOW-H}]; await sync();
  D=await get('Dan Dale');
  check('PROFIT-2: the other 5 win: +$3.24 (it was +$4.82)', D && D.result==='win' && Math.abs(D.profit-3.24)<0.005, D);
  // (a) the same, the other 5 LOSE: 3.42 − 5.18 = −$1.76 (before: −$5.18)
  SERVE={fills:[sell('es1','KX-EEE',0.70,5,0.08,'Ed Ely'), buy('e1','KX-EEE',0.50,10,5.00,0.18,'Ed Ely')], settlements:[{book:'kalshi', ref:'KX-EEE', side:'yes', result:'no', outcome:'loss', payout:0, ts:NOW-H}]};   // the Worker lists the newest first
  await sync();
  const E=await get('Ed Ely');
  check('PROFIT-2: sold 5, the other 5 lose: −$1.76 (it was −$5.18)', E && E.result==='loss' && Math.abs(E.profit+1.76)<0.005, E);
  // (c) two sales: 5 at 70¢ ($3.42) then 5 at 80¢ ($4.00 − $0.07 = $3.93): SOLD for $7.35, +$2.17 (before: never SOLD, graded as a whole)
  SERVE={fills:[buy('f1','KX-FFF',0.50,10,5.00,0.18,'Fay Fox')], settlements:[]}; await sync();
  SERVE.fills.unshift(sell('fs1','KX-FFF',0.70,5,0.08,'Fay Fox')); await sync();
  SERVE.fills.unshift(sell('fs2','KX-FFF',0.80,5,0.07,'Fay Fox',{ts:NOW-1.5*H})); await sync();
  // Kalshi then lists the closed position's settlement with no side (yes and no both 0): it must not grade the bet
  SERVE.settlements=[{book:'kalshi', ref:'KX-FFF', side:null, result:'yes', outcome:null, payout:0, ts:NOW-H}]; await sync();
  const F=await get('Fay Fox');
  check('PROFIT-2: two sales that close the position make it SOLD for $7.35 (3.42 + 3.93): +$2.17', F && F.sold && Math.abs(F.sold.price-7.35)<0.005 && Math.abs(F.profit-2.17)<0.005, F);
  check('PROFIT-2: Kalshi’s settlement of the closed position (side null) gives it no win or loss', F && !F.result, F&&F.result);
  // a partial sale then a side-null settlement (should not happen at Kalshi, but must not grade a full win either)
  SERVE={fills:[sell('hs1','KX-HHH',0.70,5,0.08,'Hal Hunt'), buy('h1','KX-HHH',0.50,10,5.00,0.18,'Hal Hunt')], settlements:[{book:'kalshi', ref:'KX-HHH', side:null, result:'yes', outcome:null, payout:0, ts:NOW-H}]}; await sync();
  const Hh=await get('Hal Hunt');
  check('PROFIT-2: a side-null Kalshi settlement after a sale grades nothing', Hh && !Hh.result && Hh.soldFills===5, Hh);
  // (d) one sale of all 10 at 70¢: $7.00 − $0.15 = $6.85: +$1.67 (before: +$1.82, the sell fee left out)
  SERVE={fills:[sell('gs1','KX-GGG',0.70,10,0.15,'Gus Gale'), buy('g1','KX-GGG',0.50,10,5.00,0.18,'Gus Gale')], settlements:[]}; await sync();
  const G=await get('Gus Gale');
  check('PROFIT-2: a full sale counts its sell fee: SOLD $6.85, +$1.67 (it was +$1.82)', G && G.sold && Math.abs(G.sold.price-6.85)<0.005 && Math.abs(G.profit-1.67)<0.005, G);
  // a hand-typed amount lost still wins over the sales; a push refunds the part not sold
  const T=await p.evaluate(()=>{ const x={kind:'prop', stake:5.18, autoFrom:'kalshi', fills:['q'], fillQty:10, fillCost:5.18, soldBy:{'s:q1':{q:5,cash:3.42}}, soldFills:5, soldCash:3.42};
    return {lost:betProfit(Object.assign({},x,{result:'loss', lostAmt:2})), push:betProfit(Object.assign({},x,{result:'push'})), old:betProfit({kind:'prop', stake:5.18, odds:'+100', result:'win', soldFills:5, soldCash:3.5})}; });
  // push: 3.42 + 5.18 × 5/10 − 5.18 = +$0.83. A bet sold in part before v5.26 (no soldBy) keeps its old profit: +$5.18 at +100
  check('PROFIT-2: a Lost $ you typed wins; a push refunds the 5 not sold (+$0.83); a bet from before v5.26 (no soldBy) is unchanged', T.lost===-2 && Math.abs(T.push-0.83)<0.005 && Math.abs(T.old-5.18)<0.005, T);
  // Novig: a hedge of part of the position (buy of the other outcome) counts as a sale: 10 contracts at 50¢ ($5.00); hedge 4 of the other side at 45¢ ($1.80):
  // 4 pairs pay $4 → cash $4 − $1.80 = $2.20. The other 6 win: 2.20 + 6 − 5.00 = +$3.20
  const N=await p.evaluate(async()=>{ const B=(o)=>Object.assign({kind:'prop', sport:'NHL', player:'Nils Nord', statText:'Shots On Goal', line:1.5, side:'O', start:new Date(Date.now()+6*3600e3).toISOString()},o);
    window._nvServe={fills:[{book:'novig', id:'n2', ref:'m-nord', outcome:'o-no', action:'buy', price:0.45, qty:4, cost:1.80, fee:0, ts:Date.now()-2*3600e3, bet:B({side:'U'})},
      {book:'novig', id:'n1', ref:'m-nord', outcome:'o-yes', action:'buy', price:0.5, qty:10, cost:5.00, fee:0, ts:Date.now()-3*3600e3, bet:B()}], settlements:[]}; return 1; });
  SERVE=await p.evaluate(()=>window._nvServe); await sync();
  const Nn=await p.evaluate(()=>{ const x=logged.find(y=>y.name==='Nils Nord' && y.side==='O'); return x?{soldFills:x.soldFills, soldCash:x.soldCash, sold:!!x.sold, toWin:rpToWin(x), n:logged.filter(y=>y.name==='Nils Nord').length}:null; });
  check('PROFIT-2: a Novig hedge of 4 of 10 is a sale of 4 for $2.20; the bet stays open (not SOLD) and would make +$3.20 if it wins', Nn && Nn.soldFills===4 && Math.abs(Nn.soldCash-2.2)<0.005 && !Nn.sold && Math.abs(Nn.toWin-3.2)<0.005, Nn);

  check('no page errors', !errs.length, errs);
  await b.close(); console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(fail?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
