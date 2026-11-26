// node tests/v536-partfill-test.js — v5.36 (owner 2026-11-26: "Our app keeps saying that it hasn't hooked, but it has"): a Make order that was partly taken says so.
// The taken part is already a bet; only the rest is waiting. Found from the book's own fills for the same market and side (or the order's own filled count). An order with no fill still says "not bets until they fill". No page errors.
const L=require('./v527-jarvis-lib.js'); const {chromium,check,open,ev,safe}=L;
(async()=>{ const b=await chromium.launch(); const X=await open(b,1280);
  await safe('part-filled orders', async()=>{
    const r=await ev(X.p,()=>{
      window._myFills=[{book:'novig', id:'f1', ref:'mkt1', outcome:'oc1', action:'buy', cost:1.2, qty:2.5, price:0.48, ts:Date.now()-60000}];
      const ord={book:'novig', id:'o1', ref:'mkt1', outcome:'oc1', action:'buy', price:0.48, qty:7.52};
      const other={book:'novig', id:'o2', ref:'mkt2', outcome:'oc9', action:'buy', price:0.5, qty:2};
      const a=orderMatchedCost(ord), b=orderMatchedCost(other), c=orderMatchedCost({book:'novig', ref:'mkt1', outcome:'ocX', price:0.48, qty:1}), d=orderMatchedCost({book:'novig', ref:'zz', price:0.4, qty:5, filled:1.5});
      const el=document.getElementById('ordersTop'); renderOrdersTop([ord], 3.61); const t1=el.textContent; renderOrdersTop([other], 1); const t2=el.textContent;
      return {a,b,c,d,t1,t2}; });
    check('the matched part is found from the fills for the same market and side ($1.20)', Math.abs(r.a-1.2)<1e-9, r);
    check('another market has no matched part', r.b===0, r.b);
    check('the same market on the other side does not count', r.c===0, r.c);
    check('an order that reports its own filled count counts it (1.5 contracts at 40% = $0.60)', Math.abs(r.d-0.6)<1e-9, r.d);
    check('the top line says part of it already matched, and no longer says "not bets until they fill"', /part of it already matched/.test(r.t1) && !/not bets until they fill/.test(r.t1), r.t1);
    check('an order with nothing matched still says it is not a bet until it fills', /not bets until they fill/.test(r.t2) && !/already matched/.test(r.t2), r.t2);
  });
  check('no page errors', X.errs.length===0, X.errs.slice(0,3));
  await b.close(); const r=L.res(); console.log('\n'+r.pass+' passed, '+r.fail+' failed'); process.exit(r.fail?1:0); })();
