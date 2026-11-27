// node tests/v565-order-line-test.js — v5.65 (owner 2026-11-27: "itd be nice if i can see what was betted"): a placed order shows its game and the dollars.
const path=require('path'); const { chromium } = require('playwright'); const FILE='file://'+path.join(__dirname,'..','control.html');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+(ok?'':'  → '+JSON.stringify(got))); };
(async()=>{ const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:1280,height:900}}); const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  const NOW=Date.now();
  await p.route(/api\.0xbeta\.dev\//,r=>{ const u=new URL(r.request().url()); let out={ok:true};
    if(/autobet\/status/.test(u.pathname)) out={ok:true,mode:'LIVE',day:'2026-11-27',budget:10,reserved:2,left:8,killed:false,requireArm:false,armed:true,orders:[
      {t:NOW-60000,result:'placed',name:'Under 40.5 Total',game:'NDSU @ SJSU',price:0.485,qty:196,cost:0.95},
      {t:NOW-120000,result:'placed',name:'Old order',price:0.5,qty:200}]};
    r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*','access-control-allow-headers':'*'},body:JSON.stringify(out)}); });
  await p.addInitScript(()=>{ localStorage.setItem('mbev.pass','pass1234'); localStorage.setItem('mbev.syncKey','abcdef'); localStorage.setItem('mbev.ctl.tab','all'); });
  await p.goto(FILE); await p.waitForTimeout(1200);
  const t=await p.evaluate(()=>document.getElementById('orders').innerText);
  check('a new order shows the game under the pick', /Under 40\.5 Total/.test(t) && /NDSU @ SJSU/.test(t), t);
  check('it shows the dollars: $0.95 to pay 1.96 back', /\$0\.95 to pay 1\.96 back/.test(t), t);
  check('an old order without a game or cost still shows as before', /Old order/.test(t) && /2\.00 contracts at up to 50\.0%/.test(t), t);
  check('no page errors', !errs.length, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0); })();
