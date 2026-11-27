// node tests/v570-calm-polling-test.js — v5.70 (owner 2026-11-27: 86,052 of 100,000 requests used by 3 PM; "Build calm polling and the request counter"): the control page asks the Worker less when it is only left open, and shows today's request count.
const path=require('path'); const { chromium } = require('playwright'); const FILE='file://'+path.join(__dirname,'..','control.html');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+(ok?'':'  → '+JSON.stringify(got))); };
(async()=>{ const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:1280,height:900}}); const p=await ctx.newPage(); const errs=[]; let status=0; p.on('pageerror',e=>errs.push(String(e)));
  await ctx.clock.install({time:new Date('2026-11-27T21:00:00Z')});
  await p.route(/api\.0xbeta\.dev\//,r=>{ const u=new URL(r.request().url()); let out={ok:true}; if(/autobet\/status/.test(u.pathname)){ status++; out={ok:true,mode:'LIVE',day:'2026-11-27',budget:10,reserved:0,left:10,killed:false,requireArm:true,armed:true,orders:[]}; }
    if(/autoload\/status/.test(u.pathname)) out={ok:true,on:true,sources:[{id:'oddsapi',name:'The Odds API',key:true,left:400,usedToday:0,shareToday:50,held:null,error:null,loads:[],resets:'the 1st at 12 AM UTC'}],watch:null};
    if(/autoload\/requests/.test(u.pathname)) out={ok:true,requests:{day:'2026-11-27',total:86052,preflights:1200,byDevice:[{k:'Control page',n:30112},{k:'app',n:41000},{k:'hands-free',n:1440}],byRoute:[],limit:100000,resets:'00:00 UTC'}};
    r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*','access-control-allow-headers':'*'},body:JSON.stringify(out)}); });
  await p.addInitScript(()=>{ localStorage.setItem('mbev.pass','pass1234'); localStorage.setItem('mbev.syncKey','abcdef'); localStorage.setItem('mbev.ctl.tab','all'); });
  await p.goto(FILE); await p.clock.runFor(1500); const n0=status;
  check('it asks once when the page opens', n0>=1, n0);
  status=0; for(let k=0;k<6;k++){ await p.evaluate(()=>document.dispatchEvent(new Event('pointerdown'))); await p.clock.runFor(30000); }
  check('while you keep using it, 3 minutes bring 2 or 3 asks (about one a minute; the old rhythm asked 6)', status>=2 && status<=3, status);
  status=0; await p.clock.runFor(180000); check('left alone for 3 minutes it asks at most twice (the old rhythm asked six times)', status<=2, status);
  status=0; await p.clock.runFor(15*60000); check('left open for 15 minutes it asks about every 5 minutes (at most 5; the old rhythm asked 30)', status<=5, status);
  await p.evaluate(()=>{ Object.defineProperty(document,'hidden',{get:()=>true,configurable:true}); Object.defineProperty(document,'visibilityState',{get:()=>'hidden',configurable:true}); }); status=0; await p.clock.runFor(10*60000); check('with the tab hidden it asks nothing', status===0, status);
  await p.evaluate(()=>{ Object.defineProperty(document,'hidden',{get:()=>false,configurable:true}); Object.defineProperty(document,'visibilityState',{get:()=>'visible',configurable:true}); document.dispatchEvent(new Event('visibilitychange')); }); await p.clock.runFor(500); check('coming back to the tab asks once at once', status===1, status);
  status=0; await p.evaluate(()=>document.dispatchEvent(new Event('pointerdown'))); await p.clock.runFor(300); check('a tap right after that does not ask again (under 60 seconds since the last ask)', status===0, status);
  await p.evaluate(()=>{ document.getElementById('auBox').open=true; }); await p.clock.runFor(2000);
  const rq=await p.evaluate(()=>document.getElementById('auReq').textContent), sum=await p.evaluate(()=>({t:document.getElementById('auSum').textContent,c:document.getElementById('auSum').className}));
  check('the card shows today\'s requests (about), the share of 100,000, preflights and the biggest senders, and when it resets', /86,052 of 100,000 \(86%\)/.test(rq) && /1,200 preflights/.test(rq) && /Control page 30112/.test(rq) && /app 41000/.test(rq) && /resets 6 PM Chicago/.test(rq), rq);
  check('from 70% the closed line turns orange and says requests 86%', /requests 86%/.test(sum.t) && sum.c==='full', sum);
  check('no page errors', !errs.length, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0); })();
