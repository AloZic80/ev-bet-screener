// node tests/tabs-test.js — v4.29. Alonzo, after seeing Augi's Odds Board: "I like his GUI, it is cleaner ... we can change it to my liking, but in
// his style ... his 5 tabs". The bar has Board, Live Games, Parlay, Bet log, Settings. Leagues, Parole and Moneylines sit in the row under Board;
// + Add a bet and Performance under Bet log. The main tab stays lit while one of its row's views is open. His green, his font. Phone and Mac.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
(async()=>{
  const b=await chromium.launch();
  for(const [W,theme] of [[1280,'light'],[390,'dark']]){
    const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:W,height:900},colorScheme:theme});
    await ctx.addInitScript(t=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.theme',t); }catch(e){} }, theme);
    const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
    await p.goto('http://app.test/'); await p.waitForTimeout(900);
    const st=()=>p.evaluate(()=>{ const vis=e=>{ const r=e.getBoundingClientRect(); return r.width>0&&r.height>0&&getComputedStyle(e).display!=='none'; };
      return {main:[...document.querySelectorAll('.tabs .tab')].filter(vis).map(t=>t.textContent.trim().replace(/\s+\d+$/,'')), sub:[...document.querySelectorAll('#subTabs>button')].filter(vis).map(t=>t.textContent.trim()),
        lit:[...document.querySelectorAll('.tabs .tab.on,.tabs .tab.grp')].map(t=>t.textContent.trim()), view:(document.querySelector('.view.on')||{}).id,
        acc:getComputedStyle(document.querySelector('.tabs .tab.on,.tabs .tab.grp')).backgroundColor, font:getComputedStyle(document.body).fontFamily,
        fit:[...document.querySelectorAll('.tabs .tab')].every(t=>t.getBoundingClientRect().right<=document.documentElement.clientWidth+1), sw:document.documentElement.scrollWidth, cw:document.documentElement.clientWidth}; });
    let s=await st();
    check(W+' px: the bar has Augi\'s five tabs, in his order', s.main.join('|')==='Board|Live Games|Parlay|Bet log|Settings', s.main);
    check(W+' px: under Board, the row: Board · Leagues · Parole · Moneylines', s.sub.join('|')==='Board|🌍 Leagues|🔓 Parole|Moneylines', s.sub);
    check(W+' px: the active tab is his solid green (#087B44), and the page uses the phone\'s own font', s.acc==='rgb(8, 123, 68)' && /system-ui/.test(s.font), {acc:s.acc, font:s.font});
    check(W+' px: the five tabs fit the width, nothing scrolls sideways', s.fit && s.sw<=s.cw+1, {sw:s.sw, cw:s.cw});
    await p.evaluate(()=>[...document.querySelectorAll('#subTabs .tab')].find(t=>/Leagues/.test(t.textContent)).click()); await p.waitForTimeout(200); s=await st();
    check(W+' px: Leagues opens its view and Board stays lit', s.view==='v-leagues' && s.lit.join()==='Board', {view:s.view, lit:s.lit});
    await p.evaluate(()=>document.querySelector('#subTabs .subhome[data-group="board"]').click()); await p.waitForTimeout(200); s=await st();
    check(W+' px: the Board pill in the row goes back to the board', s.view==='v-board', s.view);
    await p.click('.tabs .tab[data-view="v-log"]'); await p.waitForTimeout(200); s=await st();
    check(W+' px: Bet log shows its row: Bet log · + Add a bet · Performance · 📊 Reports (v4.89)', s.view==='v-log' && s.sub.join('|')==='Bet log|+ Add a bet|Performance|📊 Reports', {view:s.view, sub:s.sub});
    await p.evaluate(()=>[...document.querySelectorAll('#subTabs .tab')].find(t=>/Performance/.test(t.textContent)).click()); await p.waitForTimeout(200); s=await st();
    check(W+' px: Performance opens and Bet log stays lit', s.view==='v-perf' && s.lit.join()==='Bet log', {view:s.view, lit:s.lit});
    for(const v of ['v-live','v-parlay','v-settings']){ await p.click('.tabs .tab[data-view="'+v+'"]'); await p.waitForTimeout(150); s=await st();
      check(W+' px: '+v+' opens with no row under it', s.view===v && !s.sub.length, {view:s.view, sub:s.sub}); }
    await p.evaluate(()=>window.scrollTo(0, document.documentElement.scrollHeight/2)); await p.waitForTimeout(150);
    const pin=await p.evaluate(()=>{ const t=document.querySelector('.tabs').getBoundingClientRect(), sel=document.getElementById('ssSport').getBoundingClientRect(), g=document.getElementById('ssGames').getBoundingClientRect();
      return {bottom:Math.round(t.bottom), vh:window.innerHeight, pos:getComputedStyle(document.querySelector('.tabs')).position, menuAbove:sel.bottom<=g.top+1}; });
    check(W+' px: v4.30: the five tabs stay pinned to the bottom of the screen while scrolling', pin.pos==='fixed' && Math.abs(pin.bottom-pin.vh)<=1, pin);
    await p.mouse.wheel(0,-3000); await p.waitForTimeout(200);   // v4.32: and after scrolling back up to the top
    const up=await p.evaluate(()=>{ const t=document.querySelector('.tabs'); return {bottom:Math.round(t.getBoundingClientRect().bottom), vh:window.innerHeight, parentIsBody:t.parentNode===document.body, y:Math.round(scrollY)}; });
    check(W+' px: v4.32: scrolled back up, the bar is still at the bottom, and it sits directly in the page body (iPhone Safari)', Math.abs(up.bottom-up.vh)<=1 && up.parentIsBody, up);
    check(W+' px: v4.30: the ribbon menu (My games, Top events, NBA...) sits above the scores', pin.menuAbove, pin);
    check(W+' px: no page errors', !errs.length, errs);
    await ctx.close();
  }
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
