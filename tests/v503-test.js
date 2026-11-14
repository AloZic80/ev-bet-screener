// node tests/v503-test.js — v5.03 (found by the redesign planners): v5.01 declared a second `function calRows`, so Performance’s
// "Is the model honest?" tables called Said vs won’s version and broke. Renamed to saidWonRows; no function name may be declared twice.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,400)); };
const names=(html.match(/(?:^|[;}\s])function\s+([A-Za-z0-9_$]+)\s*\(/gm)||[]).map(x=>x.replace(/.*function\s+/,'').replace(/\s*\($/,'')), seen={}, dup=[];
names.forEach(n=>{ if(seen[n]) dup.push(n); seen[n]=1; });
check('no function name is declared twice in index.html (a later one silently replaces the earlier)', dup.length===0, [...new Set(dup)]);
(async()=>{ const b=await chromium.launch(); const errs=[]; const p=await b.newPage(); p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1200);
  const R=await p.evaluate(()=>{ const h=calRows([{cover:0.62,won:true,net:0.05},{cover:0.63,won:false,net:0.04}], [['60–65%',.60,.65]], x=>x.cover); let thrown=''; try{ renderCalibration(); }catch(e){ thrown=e.message; } return {h, thrown, sw:typeof saidWonRows}; });
  check('Performance’s calRows(pts, bands, keyOf) works again: a band row with 2 bets, 1 won', /^<tr><td>60–65%<\/td><td class="num">2<\/td><td class="num">1<\/td>/.test(R.h), R.h.slice(0,120));
  check('renderCalibration runs without an error; Said vs won uses saidWonRows', !R.thrown && R.sw==='function', R);
  check('no page errors', !errs.length, errs);
  await b.close(); console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(fail?1:0); })();
