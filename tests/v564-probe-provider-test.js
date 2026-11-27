// node tests/v564-probe-provider-test.js — v5.64 (owner 2026-11-27: "i have the key already"): the control page's Pinnacle look has a provider picker, so PinnRadar can be read from the page.
const path=require('path'); const { chromium } = require('playwright'); const FILE='file://'+path.join(__dirname,'..','control.html');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+(ok?'':'  → '+JSON.stringify(got))); };
(async()=>{ const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:1280,height:900}}); const p=await ctx.newPage(); const errs=[], urls=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.route(/api\.0xbeta\.dev\//,r=>{ const u=new URL(r.request().url()); urls.push(u.pathname+u.search); let out={ok:true}; if(/handsfree\/probe/.test(u.pathname)) out={ok:true,provider:u.searchParams.get('provider')||'pinnapi',sports:[{sport_id:1,status:'ok',events:3,leagues:['EPL (3)'],sample:{home:'Arsenal',periods:{num_0:{money_line:{home:2.2,draw:3.4,away:3.1}}}}}]};
    r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*','access-control-allow-headers':'*'},body:JSON.stringify(out)}); });
  await p.addInitScript(()=>{ localStorage.setItem('mbev.pass','pass1234'); localStorage.setItem('mbev.syncKey','abcdef'); localStorage.setItem('mbev.ctl.tab','all'); });
  await p.goto(FILE); await p.waitForTimeout(900);
  const opts=await p.evaluate(()=>[...document.querySelectorAll('#hfProv option')].map(o=>o.value).join());
  check('the picker offers pinnapi, Pinnodds and PinnRadar', opts==='pinnapi,pinnodds,pinnradar', opts);
  await p.evaluate(()=>{ var e=document.getElementById('hfSports'); e.value='1'; for(var d=e.closest('details'); d; d=d.parentElement&&d.parentElement.closest('details')) d.open=true; }); await p.click('#hfProbe'); await p.waitForTimeout(500);
  check('pinnapi (the default) asks without a provider', urls.some(u=>/handsfree\/probe\?sport=1$/.test(u)), urls);
  await p.selectOption('#hfProv','pinnradar'); await p.click('#hfProbe'); await p.waitForTimeout(500);
  check('PinnRadar asks with provider=pinnradar', urls.some(u=>/probe\?sport=1&provider=pinnradar/.test(u)), urls);
  check('the soccer three-way sample is shown', await p.evaluate(()=>/draw/.test(document.getElementById('hfProbeOut').textContent)||[...document.querySelectorAll('#hfProbeOut pre')].some(x=>/draw/.test(x.textContent))), 0);
  check('no page errors', !errs.length, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0); })();
