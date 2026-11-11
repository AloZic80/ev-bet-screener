// node tests/bp-several-test.js — v4.11. Alonzo: "give an option to choose all of those or not, around what we can do" / "we can choose".
// ☰ Several: tick the sports (All with games / None), see the calls against what is left today, Load loads the ticked ones soonest
// first, skips sports with no game in 24 hours, and stops before going over the calls left. Checked at 390 and 1280 px.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const NOW=Date.parse('2026-11-07T18:00:00Z'), H=3600e3;
(async()=>{
  const b=await chromium.launch();
  for(const W of [390,1280]){
    const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:W,height:1000}}); await ctx.clock.install({time:new Date(NOW)});
    await ctx.addInitScript(()=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); }catch(e){} });
    const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    const S={left:12, calls:[]};
    await p.route('**/*',r=>{ const u=r.request().url();
      if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
      if(/api\.0xbeta\.dev\/budget/.test(u)) return r.fulfill({contentType:'application/json',body:JSON.stringify({limit:50,used:50-S.left,left:S.left})});
      if(/api\.0xbeta\.dev\/props/.test(u)){ const sp=new URL(u).searchParams.get('sport'), pg=+new URL(u).searchParams.get('pages'); S.calls.push(sp); S.left-=pg; return r.fulfill({contentType:'application/json',body:JSON.stringify({props:[],source_count:0,debug:{}})}); }
      if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'});
      return r.abort(); });
    await p.goto('http://app.test/'); await p.waitForTimeout(1500);
    await p.evaluate(()=>{ const f=document.getElementById('bpFoldBtn'); if(f && getComputedStyle(f).display!=='none' && f.getAttribute('aria-expanded')!=='true') f.click(); }); await p.waitForTimeout(150);   // v4.63: on a phone the BettingPros panel opens from its line
    // NBA tomorrow-ish (5 h), NHL in 3 h, NFL Sunday (> 24 h), WNBA none
    await p.evaluate(([N,H])=>{ sportNext={NHL:N+3*H, NBA:N+5*H, NFL:N+40*H, WNBA:null}; window._bpLeft=12; document.getElementById('apiPages').value='5'; paintSportSelects(); bmPaint(); },[NOW,H]);
    await p.click('#bpMultiBtn'); await p.waitForTimeout(150);
    const A=await p.evaluate(()=>({on:[...document.querySelectorAll('#bpMulti [data-bmsp]')].filter(x=>x.checked).map(x=>x.dataset.bmsp), cost:document.querySelector('#bpMulti .bm-cost').textContent, sel:document.getElementById('apiSport').disabled, btn:document.getElementById('bpMultiBtn').textContent,
      vw:document.documentElement.clientWidth, sw:document.documentElement.scrollWidth, right:Math.max(...[...document.querySelectorAll('#bpMulti, #bpMulti *')].map(x=>x.getBoundingClientRect().right))}));
    check(W+' px: opening ☰ Several ticks the sports with a game in 24 hours (NHL, NBA), not NFL Sunday or WNBA', JSON.stringify(A.on)==='["NHL","NBA"]' && A.sel && /Several · 2/.test(A.btn), A);
    check(W+' px: it says the cost: up to 10 calls (2 × 5), 12 left today', /up to 10 calls \(2 × 5\)/.test(A.cost) && /12 left today/.test(A.cost), A.cost);
    check(W+' px: nothing runs off the screen', A.right<=A.vw+1 && A.sw<=A.vw+1, {right:A.right, vw:A.vw, sw:A.sw});
    if(W===1280){
      await p.click('#loadApi'); await p.waitForTimeout(1500);
      const st=await p.evaluate(()=>document.getElementById('apiStatus').textContent);
      check('Load loads NHL then NBA (soonest first), nothing else', JSON.stringify(S.calls)==='["NHL","NBA"]', {calls:S.calls, st});
      check('the status line says how each one went', /NHL/.test(st) && /NBA/.test(st), st);
      // tick NFL too and have only 7 left: NHL loads, NBA would go over, NFL skipped (no game in 24 h)
      S.calls=[]; S.left=7;
      await p.evaluate(()=>{ window._bpLeft=7; const c=document.querySelector('#bpMulti [data-bmsp="NFL"]'); c.checked=true; c.dispatchEvent(new Event('change',{bubbles:true})); });
      const c2=await p.evaluate(()=>document.querySelector('#bpMulti .bm-cost').textContent);
      check('with 7 left it warns: only the first 1 will load, and NFL has no game in 24 h', /only the first 1 will load/.test(c2) && /1 with no game in 24 h, skipped/.test(c2), c2);
      await p.click('#loadApi'); await p.waitForTimeout(1500);
      const st2=await p.evaluate(()=>document.getElementById('apiStatus').textContent);
      check('it loads NHL only and says NBA was not loaded (2 calls left) and NFL skipped', JSON.stringify(S.calls)==='["NHL"]' && /NBA: not loaded, 2 BettingPros calls left today/.test(st2) && /NFL: no game in the next 24 hours, skipped/.test(st2), {calls:S.calls, st2});
      await p.click('#bpMulti [data-bm="none"]'); S.calls=[]; await p.click('#loadApi'); await p.waitForTimeout(300);
      const st3=await p.evaluate(()=>document.getElementById('apiStatus').textContent);
      check('None: Load asks to tick a sport and spends nothing', /tick at least one sport/.test(st3) && !S.calls.length, st3);
      await p.click('#bpMultiBtn'); S.left=40; await p.evaluate(()=>{ window._bpLeft=40; const s=document.getElementById('apiSport'); s.value='NBA'; }); await p.click('#loadApi'); await p.waitForTimeout(1200);
      const D=await p.evaluate(()=>({hidden:document.getElementById('bpMulti').hidden, sel:document.getElementById('apiSport').disabled}));
      check('closing ☰ Several brings the one-sport menu back: Load loads just that sport', D.hidden && !D.sel && JSON.stringify(S.calls)==='["NBA"]', {D, calls:S.calls});
    }
    check(W+' px: no page errors', !errs.length, errs);
    await ctx.close();
  }
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
