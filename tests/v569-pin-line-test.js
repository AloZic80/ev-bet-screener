// node tests/v569-pin-line-test.js — v5.69 (owner 2026-11-27: "record what Pinnacle had, against our bet we placed ... under the Orders Placed in small letters, across"): a small proof line under each placed order.
const path=require('path'); const { chromium } = require('playwright'); const FILE='file://'+path.join(__dirname,'..','control.html');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+(ok?'':'  → '+JSON.stringify(got))); };
(async()=>{ const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:1280,height:900}}); const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  const NOW=Date.now();
  const orders=[
    {t:NOW-300000,result:'placed',name:'Chiefs to win (Worker pick)',game:'Raiders @ Chiefs',price:0.485,qty:196,cost:0.95,startMs:NOW+3600000,pin:{side:'home',provider:'pinnapi',at:NOW-300000,ml:{home:1.82,away:2.08},fair:0.5333,was:0.5333,net:0.0667}},
    {t:NOW-900000,result:'placed',name:'Eagles to win (Worker pick)',game:'Eagles @ Giants',price:0.5,qty:200,cost:1,startMs:NOW-60000,pin:{side:'away',provider:'pinnodds',at:NOW-900000,ml:{home:2.2,away:1.7},fair:0.5622,was:0.56,net:0.05},close:{fair:0.58,ml:{home:2.3,away:1.65},provider:'pinnapi',at:NOW-300000,minToStart:5}},
    {t:NOW-1200000,result:'placed',name:'Old one',price:0.5,qty:200,cost:1},
    {t:NOW-1500000,result:'placed',name:'Gone game',price:0.5,qty:200,cost:1,startMs:NOW-3600000,pin:{side:'home',provider:'pinnapi',at:NOW-1500000,ml:{home:1.9,away:1.95},fair:0.51,net:0.04},close:{unread:'Pinnacle (pinnapi): the game is no longer listed',at:NOW-1000000}}];
  await p.route(/api\.0xbeta\.dev\//,r=>{ const u=new URL(r.request().url()); let out={ok:true}; if(/autobet\/status/.test(u.pathname)) out={ok:true,mode:'LIVE',day:'2026-11-27',budget:10,reserved:3,left:7,killed:false,requireArm:false,armed:true,orders:orders};
    r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*','access-control-allow-headers':'*'},body:JSON.stringify(out)}); });
  await p.addInitScript(()=>{ localStorage.setItem('mbev.pass','pass1234'); localStorage.setItem('mbev.syncKey','abcdef'); localStorage.setItem('mbev.ctl.tab','all'); });
  await p.goto(FILE); await p.waitForTimeout(1200);
  const rows=await p.evaluate(()=>[...document.querySelectorAll('#orders tr.pinrow td')].map(td=>({t:td.textContent, fs:getComputedStyle(td).fontSize, span:td.colSpan})));
  check('a line under each placed order that has Pinnacle data (3 of 4; the old order has none)', rows.length===3, rows.length);
  const first=rows.find(r=>/Chiefs|1\.82/.test(r.t))||{t:''};
  check('the first line: the time, both Pinnacle prices, the fair chance, what we ordered at, the edge after fees, and the provider', /Pinnacle at .*: home 1\.82 \/ away 2\.08 → fair chance 53\.3% · ordered at 48\.5% on Novig · edge \+6\.7% after fees · from pinnapi/.test(first.t), first.t);
  check('an order whose game has not started says the closing look comes just before kickoff', /closing look comes just before kickoff/.test(first.t), first.t);
  const second=rows.find(r=>/pinnodds/.test(r.t))||{t:''};
  check('a closed one shows Pinnacle at kickoff, how the fair chance moved since the order, and whether it beat our price', /5 min before kickoff: home 2\.3 \/ away 1\.65 → fair 58\.0% \(\+1\.8 points since we ordered; beat our price by 8\.0 points\)/.test(second.t), second.t);
  const gone=rows.find(r=>/no longer listed/.test(r.t))||{t:''}; check('a game Pinnacle no longer lists says so plainly', /closing look: Pinnacle \(pinnapi\): the game is no longer listed/.test(gone.t), gone.t);
  check('the lines are small (12 px), grey and run across the whole row', rows.every(r=>r.fs==='12px' && r.span===4), rows.map(r=>[r.fs,r.span]));
  check('no page errors', !errs.length, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0); })();
