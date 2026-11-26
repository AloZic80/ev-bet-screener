// node tests/v536-partfill-test.js — v5.36/v5.37 (owner 2026-11-26: "Our app keeps saying that it hasn't hooked, but it has"; v5.36 did not fire on his real Pollard order because the saved fill did not keep its market, side or order).
// A Make order that was partly taken says so. Checked through the REAL path: a fill in the shape the Worker sends goes through myFillsKeep (what the app saves), then the open order (the Worker's shape) is checked against it.
// Matches by the order's own id, or by market + side. Another market or the other side does not count. An untouched order still says it is not a bet until it fills. No page errors.
const L=require('./v527-jarvis-lib.js'); const {chromium,check,open,ev,safe}=L;
(async()=>{ const b=await chromium.launch(); const X=await open(b,1280);
  await safe('part-filled orders', async()=>{
    const r=await ev(X.p,()=>{
      const wfill={book:'novig', id:'f1', order:'ord1', ts:Date.now()-60000, action:'buy', price:0.48, qty:2.5, cost:1.2, fee:0, ref:'mkt1', outcome:'oc1', side:null, bet:{sport:'NFL', kind:'prop', player:'Tony Pollard', statText:'Rushing Yards', line:54.5, side:'U'}};
      const kept=myFillsKeep([wfill, {book:'novig', id:'f2', action:'sell', ref:'mkt1', outcome:'oc1', bet:{kind:'prop'}}, {book:'novig', id:'f3', ref:'mkt3', bet:{kind:'other'}}]);
      myFillsSet(kept);
      const ordSame={book:'novig', id:'ord1', ref:'mkt1', outcome:'oc1', action:'buy', price:0.48, qty:7.52};
      const ordTwo={book:'novig', id:'ord2', ref:'mkt1', outcome:'oc1', action:'buy', price:0.48, qty:7.52};
      const ordOtherSide={book:'novig', id:'ord3', ref:'mkt1', outcome:'ocX', action:'buy', price:0.48, qty:1};
      const ordOtherMkt={book:'novig', id:'ord4', ref:'mkt2', outcome:'oc9', action:'buy', price:0.5, qty:2};
      const ordSelf={book:'novig', id:'ord5', ref:'zz', price:0.4, qty:5, filled:1.5};
      const el=document.getElementById('ordersTop'); renderOrdersTop([ordTwo], 3.61); const t1=el.textContent; renderOrdersTop([ordOtherMkt], 1); const t2=el.textContent;
      return {kept:kept.length, k0:kept[0], same:orderMatchedCost(ordSame), two:orderMatchedCost(ordTwo), side:orderMatchedCost(ordOtherSide), mkt:orderMatchedCost(ordOtherMkt), self:orderMatchedCost(ordSelf), t1, t2, saved:JSON.parse(localStorage.getItem('mbev.myFills')||'[]')[0]}; });
    check('myFillsKeep keeps a fill\'s market, side and order, and drops sales and "other" kinds', r.kept===1 && r.k0.ref==='mkt1' && r.k0.outcome==='oc1' && r.k0.order==='ord1', r.k0);
    check('what is saved in the browser has them too', r.saved && r.saved.ref==='mkt1' && r.saved.order==='ord1', r.saved);
    check('the order whose own fill is saved: matched $1.20', Math.abs(r.same-1.2)<1e-9, r.same);
    check('a second order on the same market and side sees the matched $1.20 too (Novig shows MATCHED and OPEN together)', Math.abs(r.two-1.2)<1e-9, r.two);
    check('the other side of the same market does not count', r.side===0, r.side);
    check('another market has nothing matched', r.mkt===0, r.mkt);
    check('an order that reports its own filled count counts it (1.5 contracts at 40% = $0.60)', Math.abs(r.self-0.6)<1e-9, r.self);
    check('the top line says there is already a matched bet on this market, and no longer says "not bets until they fill"', /already have a matched bet on this market/.test(r.t1) && !/not bets until they fill/.test(r.t1), r.t1);
    check('an order with nothing matched still says it is not a bet until it fills', /not bets until they fill/.test(r.t2) && !/matched bet/.test(r.t2), r.t2);
  });
  check('no page errors', X.errs.length===0, X.errs.slice(0,3));
  await b.close(); const r=L.res(); console.log('\n'+r.pass+' passed, '+r.fail+' failed'); process.exit(r.fail?1:0); })();
