// node tests/v567-autoload-card-test.js — v5.67 (owner 2026-11-27: "go with yours, build it"; "go with your picks, 1 and 2"): the Auto loads and data check card on the control page.
const path=require('path'); const { chromium } = require('playwright'); const FILE='file://'+path.join(__dirname,'..','control.html');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+(ok?'':'  → '+JSON.stringify(got))); };
(async()=>{ const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:1280,height:900}}); const p=await ctx.newPage(); const errs=[], posts=[]; p.on('pageerror',e=>errs.push(String(e))); p.on('dialog',d=>d.accept());
  const NOW=Date.now(); let on=true, mode='ok';
  await p.route(/api\.0xbeta\.dev\//,r=>{ const u=new URL(r.request().url()); let out={ok:true};
    if(/autoload\/status/.test(u.pathname)) out=mode==='404'?null:{ok:true,on:on,scoutReserve:0.15,sources:[
      {id:'oddsapi',name:'The Odds API',key:true,left:412,dayStart:420,usedToday:8,shareToday:85,dueByNow:40,held:null,error:null,lastAt:new Date(NOW-600000).toISOString(),loads:[{at:new Date(NOW-600000).toISOString(),what:'americanfootball_nfl',cost:1,note:'12 games'}],resets:'the 1st at 12 AM UTC'},
      {id:'oddspapi',name:'OddsPapi',key:true,left:0,dayStart:null,usedToday:0,shareToday:null,dueByNow:null,held:new Date(NOW+40000000).toISOString(),error:'totals answered 403',lastAt:null,loads:[],resets:'the 1st at 12 AM UTC'}],
      watch:{day:'2026-11-27',at:NOW-3600000,ok:false,summary:'OddsPapi is failing.',issues:[{source:'OddsPapi',severity:'broken',plain:'Every game call answers 403.',fix:'Check the book names.'},{source:'The Odds API',severity:'note',plain:'Resets on the 1st.',fix:'none'}]}};
    if(/autoload\/watch/.test(u.pathname)&&r.request().method()==='POST'){ posts.push('watch'); }
    if(/autoload\/mode/.test(u.pathname)){ posts.push('mode:'+r.request().postData()); on=JSON.parse(r.request().postData()).on; out={ok:true,on:on}; }
    if(out===null) return r.fulfill({status:404,contentType:'application/json',body:'{}'});
    r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*','access-control-allow-headers':'*'},body:JSON.stringify(out)}); });
  await p.addInitScript(()=>{ localStorage.setItem('mbev.pass','pass1234'); localStorage.setItem('mbev.syncKey','abcdef'); localStorage.setItem('mbev.ctl.tab','all'); });
  await p.goto(FILE); await p.waitForTimeout(1200);
  const sum=await p.evaluate(()=>document.getElementById('auSum').textContent), cls=await p.evaluate(()=>document.getElementById('auSum').className);
  check('the closed line shows on, what is left of each source, and the data check count', /Auto loads · on/.test(sum) && /Odds API 412/.test(sum) && /OddsPapi 0/.test(sum) && /data check: 1 to look at/.test(sum), sum);
  check('the line is orange (class full) because a source is paused and the check found something', cls==='full', cls);
  await p.evaluate(()=>{ document.getElementById('auBox').open=true; });
  const body=await p.evaluate(()=>document.getElementById('auBody').innerText);
  check('each source shows what is left, today\'s share and its last load', body.includes('The Odds API · 412 left (resets the 1st at 12 AM UTC) · today 8 of about 85') && /americanfootball_nfl \(12 games\)/.test(body), body);
  check('a paused source shows until when and why', body.includes('OddsPapi · 0 left (resets the 1st at 12 AM UTC)') && /paused until/.test(body) && /totals answered 403/.test(body), body);
  check('the data check shows its time, its summary and each problem in plain words (broken first wording, note last)', /Data check · .* · OddsPapi is failing\./.test(body) && /Broken: OddsPapi — Every game call answers 403\. To check: Check the book names\./.test(body) && /Note: The Odds API — Resets on the 1st\./.test(body), body);
  await p.click('#auWatch'); await p.waitForTimeout(500); check('Check the data now asks the Worker once', posts.filter(x=>x==='watch').length===1, posts);
  await p.click('#auPause'); await p.waitForTimeout(600); check('Pause sends on:false, the card says paused and the button offers Resume', posts.some(x=>/"on":false/.test(x)) && /Auto loads · paused/.test(await p.evaluate(()=>document.getElementById('auSum').textContent)) && /Resume/.test(await p.evaluate(()=>document.getElementById('auPause').textContent)), posts);
  mode='404'; await p.reload(); await p.waitForTimeout(1000); check('on an older Worker the card says so plainly instead of breaking', /not on the Worker yet/.test(await p.evaluate(()=>document.getElementById('auSum').textContent)), 0);
  check('no page errors', !errs.length, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0); })();
