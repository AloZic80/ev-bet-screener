// node tests/v516-sweet-test.js — v5.16 (owner 11/16: "sweet spot is confusing then. it makes me think that it fits what im going for").
// 🎯 SWEET SPOT (isSweet) now also needs the card inside My plan (La Contadora's chance at or above the plan's minimum) and a price the card
// trusts as shown (evDisplayState 'actionable': not stale, not unconfirmed, not an outlier). A label only: stake, BET / SKIP and order unchanged.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,500)); };
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:1280,height:900}});
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1200);
  const R=await p.evaluate(()=>{ const set=(id,v)=>{ const e=document.getElementById(id); if(e) e.value=String(v); };
    set('swStars',1); set('swNetMin',0); set('swNetMax',50); set('swOMin',-1000); set('swOMax',1000); set('planMin',50);
    const base={pass:true, stake:2.12, stars:4, net:0.08, actNet:0.037, mktNet:0.014, offeredRaw:'+108', book:'Novig', actProb:0.55};
    const one=x=>{ try{ return isSweet(Object.assign({}, base, x)); }catch(e){ return 'ERR '+e.message; } };
    return {inPlanFresh:one({}), outOfPlan:one({actProb:0.498}), atPlanEdge:one({actProb:0.50}), outlier:one({outlier:true}), unconfirmed:one({shopChk:{none:true}}), stake0:one({stake:0})}; });
  check('a best bet inside My plan with a trusted price still shows 🎯 SWEET SPOT', R.inPlanFresh===true, R);
  check('outside My plan (her chance 49.8% under a 50% plan): no SWEET SPOT', R.outOfPlan===false, R);
  check('at the plan edge (50.0% in a 50% plan): SWEET SPOT, as the plan line counts 50.0% inside', R.atPlanEdge===true, R);
  check('an outlier (untrusted) card: no SWEET SPOT', R.outlier===false, R);
  check('best book no longer confirmed (stale, last seen): no SWEET SPOT', R.unconfirmed===false, R);
  check('unchanged rule: no stake, no SWEET SPOT', R.stake0===false, R);
  check('no page errors', !errs.length, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
