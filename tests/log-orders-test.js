// node tests/log-orders-test.js — v4.17. Alonzo: "I don't see them on my Bet log, so where are they?" His three Kalshi orders (Filled 0)
// were not bets, so they were only in the Board's Makes bar. The Bet log now lists orders waiting at the books: shares, limit, cost, game,
// "0 filled", the money held, and that they move into the log when they fill. No orders: nothing shown. Phone (390) and computer (1280).
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const NOW=Date.parse('2026-11-07T20:00:00Z'), iso=ms=>new Date(ms).toISOString(), G=Date.parse('2026-11-07T23:00:00Z');
const O=(id,team,title,price,qty)=>({id,book:'kalshi',ref:'KX-'+id,side:'yes',action:'buy',price,qty,filled:0,title,bet:{sport:'NCAAF',kind:'moneyline',team,start:iso(G)}});
const ORD={orders:[O('a','BGSU','Kent St. vs Bowling Green',0.37,3),O('b','UNC','North Carolina vs UConn',0.45,3.01),O('c','OKST','Oklahoma St. vs Kansas St.',0.49,2)]};
(async()=>{
  const b=await chromium.launch();
  for(const W of [390,1280]){
    const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:W,height:900}}); await ctx.clock.install({time:new Date(NOW)});
    const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); let ORDERS=ORD;
    await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
      if(/\/mine\/orders/.test(u)) return r.fulfill({contentType:'application/json',body:JSON.stringify(ORDERS)});
      if(/\/mine\/fills/.test(u)) return r.fulfill({contentType:'application/json',body:JSON.stringify({fills:[]})});
      if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
    await p.goto('http://app.test/'); await p.waitForTimeout(800);
    await p.evaluate(()=>{ document.querySelector('.tab[data-view="v-log"]').click(); return syncOrders(true); }); await p.waitForTimeout(600);
    const R=await p.evaluate(()=>{ const e=document.getElementById('logOrders'); return {hidden:e.hidden, text:e.textContent.replace(/\s+/g,' '), right:Math.max(...[...e.querySelectorAll('*')].map(x=>x.getBoundingClientRect().right)), vw:document.documentElement.clientWidth, sw:document.documentElement.scrollWidth}; });
    check(W+' px: the Bet log shows "Waiting at your books · 3 orders · $3.45 held"', !R.hidden && /Waiting at your books · 3 orders · \$3\.45 held/.test(R.text), R.text.slice(0,120));
    check(W+' px: each order: YES · team to win, the market, shares at the limit = cost, 0 filled, the game time', /YES · BGSU to win/.test(R.text) && /Kent St\. vs Bowling Green/.test(R.text) && /3 shares at 37¢ = \$1\.11 · 0 filled/.test(R.text) && /3\.01 shares at 45¢ = \$1\.36/.test(R.text) && /2 shares at 49¢ = \$0\.98/.test(R.text) && /game /.test(R.text), R.text);
    check(W+' px: it says they are not bets yet and go into the log when they fill', /Not bets yet/.test(R.text) && /goes into the Bet log/.test(R.text), R.text.slice(0,300));
    check(W+' px: nothing runs off the screen', R.sw<=R.vw+1 && R.right<=R.vw+1, {right:R.right, vw:R.vw, sw:R.sw});
    const top=await p.evaluate(()=>{ document.querySelector('.tab[data-view="v-board"]').click(); const e=document.getElementById('ordersTop'); return {hidden:e.hidden, text:e.textContent, shown:!!e.offsetParent}; });
    check(W+' px: the top of the Board says "3 orders waiting at 3 Kalshi · $3.45 held · not bets until they fill"', !top.hidden && top.shown && /3 orders waiting at 3 Kalshi · \$3\.45 held · not bets until they fill/.test(top.text), top);
    await p.evaluate(()=>document.getElementById('ordersTopGo').click()); await p.waitForTimeout(200);
    check(W+' px: See them › opens the Bet log', await p.evaluate(()=>document.getElementById('v-log').classList.contains('on')), true);
    ORDERS={at:'x',orders:[],errors:{kalshi:'401 unauthorized'}}; await p.evaluate(()=>syncOrders(true)); await p.waitForTimeout(500);
    const E=await p.evaluate(()=>({box:document.getElementById('logOrders').textContent, top:document.getElementById('ordersTop').textContent}));
    check(W+' px: when the Worker cannot read Kalshi, it says so (Bet log and top) instead of showing nothing', /Could not read your orders from the books: Kalshi: 401 unauthorized/.test(E.box) && /Could not read your orders: Kalshi: 401 unauthorized/.test(E.top), E);
    ORDERS={orders:[]}; await p.evaluate(()=>syncOrders(true)); await p.waitForTimeout(500);
    check(W+' px: no orders: the box is gone', await p.evaluate(()=>document.getElementById('logOrders').hidden), true);
    check(W+' px: no page errors', !errs.length, errs);
    await ctx.close();
  }
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
