// node tests/v502-test.js — v5.02 (Alonzo, pasting DK Predictions' own header logo): DK Predictions shows its own mark, not the DraftKings
// sportsbook's; the sportsbook keeps its mark; the logo is a real image that draws. Display only.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,400)); };
(async()=>{ const b=await chromium.launch(); const errs=[]; const p=await b.newPage(); p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1200);
  const L=await p.evaluate(()=>{ const dkp=LOGOS['dk predictions']; return {has:!!dkp && /^data:image\/svg\+xml;base64,/.test(dkp), a:bookLogo('DK Predictions')===dkp, b:bookLogo('DraftKings Predictions')===dkp, c:bookLogo('draftkings predictions')===dkp, dk:bookLogo('DraftKings')===LOGOS.draftkings, fd:bookLogo('FanDuel Predicts')===null, ver:SCREENER_VERSION}; });
  check('DK Predictions (any spelling) gets its own mark', L.has && L.a && L.b && L.c, L);
  check('the DraftKings sportsbook keeps its own mark; FanDuel Predicts still has none', L.dk && L.fd, L);
  const img=await p.evaluate(async()=>{ const i=new Image(); i.src=LOGOS['dk predictions']; await new Promise(r=>{ i.onload=r; i.onerror=r; }); return {w:i.naturalWidth, h:i.naturalHeight}; });
  check('the logo is a real 40×40 image that draws', img.w===40 && img.h===40, img);
  check('version v5.02 or later in the three places', await p.evaluate(()=>/^v5\.\d\d$/.test(SCREENER_VERSION) && SCREENER_VERSION>='v5.02' && document.title.includes(SCREENER_VERSION) && document.getElementById('verTag').textContent===SCREENER_VERSION));
  check('no page errors', !errs.length, errs);
  await b.close(); console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(fail?1:0); })();
