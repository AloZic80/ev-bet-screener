// node tests/v568-board-opens-test.js — v5.68 (owner 2026-11-27: "Build Stage A2"): the Board fills itself when the page opens, from the Worker's saved loads only (cache_only), never a BettingPros call.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+(ok?'':'  → '+JSON.stringify(got))); };
(async()=>{ const b=await chromium.launch();
  const run=async(init,wait)=>{ const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:1280,height:900}}); await ctx.addInitScript(([i])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); for(const k in i) localStorage.setItem(k,i[k]); }catch(e){} },[init]);
    const p=await ctx.newPage(); const errs=[], reqs=[]; p.on('pageerror',e=>errs.push(e.message));
    await p.route('**/*',r=>{ const u=r.request().url();
      if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
      if(/api\.0xbeta\.dev\/props/.test(u)){ reqs.push(u); return r.fulfill({contentType:'application/json',body:JSON.stringify({props:[],note:'nothing saved by the Worker yet',_meta:{cache_only_empty:true,budget:{limit:50,used:3,left:47}}})}); }
      if(/api\.0xbeta\.dev\/budget/.test(u)) return r.fulfill({contentType:'application/json',body:JSON.stringify({limit:50,used:3,left:47})});
      if(/api\.0xbeta\.dev/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'});
      if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'});
      return r.abort(); });
    await p.goto('http://app.test/'); await p.waitForTimeout(wait||4500); return {p,reqs,errs,ctx}; };
  let R=await run({'mbev.pass':'pw123456'});
  check('on open it asks the Worker for the Board with cache_only=1 and never with fresh', R.reqs.length>=1 && /cache_only=1/.test(R.reqs[0]) && !/fresh=1/.test(R.reqs[0]), R.reqs);
  const st=await R.p.evaluate(()=>document.getElementById('apiStatus').textContent);
  check('when the Worker has nothing saved the line says so and tells you to press Load once', /nothing saved/i.test(st) && /Press Load once/.test(st), st);
  check('and the saved board is not touched (no rows replaced by an empty answer)', await R.p.evaluate(()=>(typeof lastRows!=='undefined')&&lastRows.length===0), 0);
  check('the flag is not left on for a real Load afterwards', await R.p.evaluate(()=>window._cacheOnly===false), 0);
  check('no page errors', !R.errs.length, R.errs); await R.ctx.close();
  R=await run({'mbev.pass':'pw123456','mbev.openLoad':'off'});
  check('with the box turned off it asks nothing', R.reqs.length===0, R.reqs); await R.ctx.close();
  R=await run({});
  check('with no passphrase set yet it asks nothing (there is nothing to ask with)', R.reqs.length===0, R.reqs);
  const t=await R.p.evaluate(()=>{ _olLast=0; window._cacheOnly=false; return {on:document.getElementById('olOn').checked, ver:SCREENER_VERSION}; }); check('the Settings box is on by default and the version is v5.68 or later', t.on===true && /^v5\.(6[8-9]|[7-9]\d)$/.test(t.ver), t); await R.ctx.close();
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0); })();
