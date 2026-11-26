// node tests/v524-shell-test.js — v5.24 (step 1, owner 11/20: "we need to differentiate already"; "for me in GOD mode, let me tell the difference of what they cant see and i can"):
// the View as switch (html[data-viewas], mbev.viewAs, this device only), the four Easy tabs and empty Easy views, the level labels (html[data-labels]) and the Who sees what panel.
// The default (God) must look and behave exactly as v5.23; Easy hides the God chrome by CSS only and refuses every God tab.
const path=require('path'), fs=require('fs');
const { chromium } = require('playwright');
const F = require('./practice-fixtures.js');
const html=fs.readFileSync(process.argv[2]||path.join(__dirname,'..','index.html'),'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,700)); };

// Boot: the same seeds as the practice copy (a saved board with cards, a bet log), plus any extra keys; clock fixed; every network call stubbed.
async function boot(b, W, H, extra){
  const ctx=await b.newContext({timezoneId:'America/Chicago',locale:'en-US',viewport:{width:W,height:H||900},deviceScaleFactor:1});
  await ctx.clock.install({time:new Date(F.NOW)});
  await ctx.addInitScript(s=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear();
      localStorage.setItem('mbev.cfg',JSON.stringify(s.cfg)); localStorage.setItem('mbev.mode',JSON.stringify({mode:'volado'})); localStorage.setItem('mbev.cards','1'); localStorage.setItem('mbev.pass','practice');
      localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date(s.now-120000).toISOString(),slate:s.day,rows:s.rows})); localStorage.setItem('mbev.log',JSON.stringify(s.log));
      if(s.theme) localStorage.setItem('mbev.theme',s.theme); Object.keys(s.ls||{}).forEach(k=>localStorage.setItem(k,s.ls[k])); }catch(e){} },
    {cfg:F.CFG, now:F.NOW, day:F.DAY, rows:F.BOARD_ROWS(), log:F.LOG_ROWS(), theme:(extra||{}).theme||null, ls:(extra||{}).ls||null});
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(W+': '+e.message));
  await p.route('**/*',r=>{ const u=r.request().url();
    if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/0xbeta|workers\.dev/.test(u)) return r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:'{}'});
    if(/espn\.com.*scoreboard/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'});
    return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1500);
  return {ctx,p,errs}; }

// in-page helpers
const SNAP=()=>{ const vis=e=>{ const r=e.getBoundingClientRect(); return r.width>0&&r.height>0&&getComputedStyle(e).display!=='none'&&getComputedStyle(e).visibility!=='hidden'; };
  return {
    level:document.documentElement.getAttribute('data-viewas'), labels:document.documentElement.getAttribute('data-labels'),
    tabs:[...document.querySelectorAll('.tabs .tab')].filter(vis).map(t=>t.textContent.trim().replace(/\s+\d+$/,'')),
    etabsShown:[...document.querySelectorAll('.tabs .tab.etab')].filter(vis).length, godTabsShown:[...document.querySelectorAll('.tabs .tab:not(.etab)')].filter(vis).length,
    viewsShown:[...document.querySelectorAll('.view')].filter(vis).map(v=>v.id), on:[...document.querySelectorAll('.view.on')].map(v=>v.id), bodyView:document.body.dataset.view, bodyGroup:document.body.dataset.group,
    sub:[...document.querySelectorAll('#subTabs>button')].filter(vis).length, sw:document.documentElement.scrollWidth-innerWidth,
    banner:(()=>{ const b=document.getElementById('easyBanner'); if(!b) return null; const r=b.getBoundingClientRect(); return {shown:vis(b), h:Math.round(r.height*10)/10, text:b.innerText.trim().replace(/\s+/g,' ')}; })(),
    key:localStorage.getItem('mbev.viewAs'), lab:localStorage.getItem('mbev.viewLabels') }; };

(async()=>{
  const b=await chromium.launch();

  // ---------- 1. God is the default and looks as it did ----------
  for(const [W,theme] of [[1280,'light'],[390,'dark']]){
    const X=await boot(b,W,900,{theme}); const s=await X.p.evaluate(SNAP);
    const keys=await X.p.evaluate(()=>Object.keys(localStorage).sort().join(','));
    check('God '+W+' px: no key, so the app is in God view and the bar is exactly Board|Live Games|Parlay|Bet log|Settings', s.level==='god' && s.tabs.join('|')==='Board|Live Games|Parlay|Bet log|Settings', {level:s.level, tabs:s.tabs});
    check('God '+W+' px: the Easy tabs and the four Easy views are not visible, the Board is the open view, body[data-view] is v-board', s.etabsShown===0 && s.viewsShown.join()==='v-board' && s.on.join()==='v-board' && s.bodyView==='v-board' && s.bodyGroup==='board', s);
    check('God '+W+' px: no banner shows, no sideways scroll', (!s.banner || !s.banner.shown) && s.sw<=0, {banner:s.banner, sw:s.sw});
    check('God '+W+' px: nothing new is saved at start-up (no mbev.viewAs, no mbev.viewLabels)', !/mbev\.viewAs|mbev\.viewLabels/.test(keys), keys);
    const cards=await X.p.evaluate(()=>document.querySelectorAll('#placeCards .sc-card').length);
    check('God '+W+' px: the Board still draws its cards', cards>=1, cards);
    check('God '+W+' px: no page errors', !X.errs.length, X.errs);
    await X.ctx.close(); }

  // ---------- 2. Easy view from a saved key ----------
  for(const [W,theme] of [[1280,'light'],[390,'dark'],[390,'light'],[1280,'dark']]){
    const X=await boot(b,W,900,{theme,ls:{'mbev.viewAs':'easy'}}); const p=X.p; let s=await p.evaluate(SNAP);
    check('Easy '+W+' '+theme+': four tabs Today|My bets|Learn|Settings, the five God tabs hidden', s.tabs.join('|')==='Today|My bets|Learn|Settings' && s.godTabsShown===0, {tabs:s.tabs, god:s.godTabsShown});
    check('Easy '+W+' '+theme+': #v-etoday is the only visible view and is the open one; body[data-view] follows; no sub-tab row', s.viewsShown.join()==='v-etoday' && s.on.join()==='v-etoday' && s.bodyView==='v-etoday' && s.bodyGroup==='etoday' && s.sub===0, s);
    check('Easy '+W+' '+theme+': the slim banner shows, one line, 44 px, with the exact words', s.banner && s.banner.shown && s.banner.h===44 && (W>640 ? s.banner.text==='Customer view: this is what an Easy subscriber sees · Back to God mode' : s.banner.text==='Customer view · Back to God mode'), s.banner);
    const chrome=await p.evaluate(()=>{ const vis=e=>{ if(!e) return false; const r=e.getBoundingClientRect(); return r.width>0&&r.height>0&&getComputedStyle(e).display!=='none'; };
      const dock=document.getElementById('apiDock'), dh=Math.round(dock.getBoundingClientRect().height), v=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--dockH'));
      return {todayBar:vis(document.getElementById('todayBar')), tbFold:vis(document.getElementById('tbFoldBtn')), strip:vis(document.getElementById('scoreStrip')), ssFold:vis(document.getElementById('ssFoldBtn')), apiRow:vis(document.getElementById('apiRow')), compa:vis(document.getElementById('compaBtn')),
        sync:vis(document.getElementById('syncChip')), ver:vis(document.getElementById('verTag')), themer:vis(document.getElementById('themer')), layout:vis(document.getElementById('layoutBtn')), statbox:vis(document.querySelector('.statbox')),
        dockBottom:Math.round(dock.getBoundingClientRect().bottom), vh:innerHeight, dockH:dh, dockVar:v, bodyPad:parseFloat(getComputedStyle(document.body).paddingBottom), titleSet:!!document.querySelector('.head h1')}; });
    check('Easy '+W+' '+theme+': the God chrome is gone (Today bar, score strip, Sources row, El Compa, sync chip, version, layout button, board count) and the theme button stays',
      !chrome.todayBar && !chrome.tbFold && !chrome.strip && !chrome.ssFold && !chrome.apiRow && !chrome.compa && !chrome.sync && !chrome.ver && !chrome.layout && !chrome.statbox && chrome.themer, chrome);
    check('Easy '+W+' '+theme+': the dock sits at the bottom and --dockH follows its new height (dock + 10), the page keeps room under the content', Math.abs(chrome.dockBottom-chrome.vh)<=1 && Math.abs(chrome.dockVar-(chrome.dockH+10))<=2 && chrome.bodyPad>=chrome.dockH, chrome);
    check('Easy '+W+' '+theme+': no sideways scroll', s.sw<=0, s.sw);
    // a programmatic click on a God tab does nothing (more than 20 code paths do this)
    const g=await p.evaluate(()=>{ const out={}; for(const v of ['v-board','v-live','v-settings','v-log','v-parlay']){ const t=document.querySelector('.tab[data-view="'+v+'"]'); t.click(); out[v]=[...document.querySelectorAll('.view.on')].map(x=>x.id).join()+'|'+document.body.dataset.view; }
      const sub=document.querySelector('#subTabs .tab[data-view="v-leagues"]'); sub.click(); out.leagues=[...document.querySelectorAll('.view.on')].map(x=>x.id).join()+'|'+document.body.dataset.view;
      document.querySelector('.subhome[data-group="log"]').click(); out.subhome=[...document.querySelectorAll('.view.on')].map(x=>x.id).join();
      return out; });
    check('Easy '+W+' '+theme+': a programmatic click on a God tab does nothing (Easy Today stays open)', Object.values(g).every(x=>x.startsWith('v-etoday')), g);
    // the Easy tabs open their views
    for(const [v,t] of [['v-ebets','My bets'],['v-elearn','Learn'],['v-esettings','Settings'],['v-etoday','Today']]){
      await p.click('.tabs .tab.etab[data-view="'+v+'"]'); await p.waitForTimeout(100); const q=await p.evaluate(SNAP);
      check('Easy '+W+' '+theme+': the '+t+' tab opens its own empty view and nothing else', q.viewsShown.join()===v && q.on.join()===v && q.bodyView===v, {shown:q.viewsShown, on:q.on, body:q.bodyView}); }
    const ph=await p.evaluate(()=>[...document.querySelectorAll('.eview')].map(v=>v.querySelector('h2').textContent+' / '+v.querySelector('p').textContent));
    check('Easy '+W+' '+theme+': Today, My bets, Learn and Settings all have their real content (v5.24 steps 3a and 3b), no placeholder line is left', ph.length===4 && ph.every(x=>!/coming in the next step/.test(x)) && /^My bets \//.test(ph[1]) && /^Learn \//.test(ph[2]) && /^Settings \//.test(ph[3]), ph);   // v5.24 (step 3b): My bets, Learn and Settings are built too (3a: Today)
    // Back to God mode
    await p.click('#easyBack'); await p.waitForTimeout(200); s=await p.evaluate(SNAP);
    check('Easy '+W+' '+theme+': Back to God mode returns to God: five tabs, the Board open, no banner, the key says god', s.level==='god' && s.tabs.join('|')==='Board|Live Games|Parlay|Bet log|Settings' && s.on.join()==='v-board' && s.bodyView==='v-board' && !(s.banner&&s.banner.shown) && s.key==='god' && s.etabsShown===0, s);
    const back=await p.evaluate(()=>{ document.querySelector('.tab[data-view="v-live"]').click(); const a=document.querySelector('.view.on').id; document.querySelector('.tabs .tab.etab[data-view="v-etoday"]').click(); const b2=document.querySelector('.view.on').id; document.querySelector('.tab[data-view="v-board"]').click(); return a+'|'+b2; });
    check('Easy '+W+' '+theme+': in God an Easy tab click does nothing and a God tab works again', back==='v-live|v-live', back);
    check('Easy '+W+' '+theme+': no page errors', !X.errs.length, X.errs);
    await X.ctx.close(); }

  // ---------- 3. The switch in Settings (God side) ----------
  for(const W of [1280,390]){
    const X=await boot(b,W,900,{}); const p=X.p;
    await p.click('.tabs .tab[data-view="v-settings"]'); await p.waitForTimeout(250);
    const box=await p.evaluate(()=>{ const bx=document.getElementById('easySwitchBox'), st=document.getElementById('v-settings'); const r=bx&&bx.getBoundingClientRect();
      return {exists:!!bx, first:st.firstElementChild===bx, god:bx&&bx.classList.contains('god-only'), shown:r&&r.width>0&&r.height>0, h:bx&&bx.querySelector('h2').textContent, line:bx&&bx.querySelector('.es-line').textContent,
        radios:[...bx.querySelectorAll('[role=radio]')].map(x=>x.textContent.trim()+(x.disabled?' (disabled)':'')+'='+x.getAttribute('aria-checked')), sw:bx&&bx.querySelector('[role=switch]').getAttribute('aria-label'), legend:bx&&bx.querySelector('.es-legend').textContent.trim(), who:!!bx&&!!bx.querySelector('details#easyWho'),
        whoClosed:!bx.querySelector('details#easyWho').open, panelsClosed:[...document.querySelectorAll('#v-settings details.panel.fold')].every(d=>!d.open)}; });
    check('Switch '+W+' px: View as is the first Settings section (god-only), with the heading, the 3-way control (Plus disabled), the line, the toggle, the legend and the Who sees what panel',
      box.exists && box.first && box.god && box.shown && box.h==='View as' && box.line==='Changes only what you see. Prices, stakes and results do not change.' && box.radios.join('|')==='⚡ God=true|🟢 Easy=false|⭐ Plus (later) (disabled)=false' && box.sw==='Show who sees what' && box.legend==='⚡ God only · ⭐ Plus (later) · 🟢 Customers see this' && box.who && box.whoClosed && box.panelsClosed, box);
    await p.click('#easySwitchBox [data-level="easy"]'); await p.waitForTimeout(250); let s=await p.evaluate(SNAP);
    check('Switch '+W+' px: tapping 🟢 Easy switches to Easy: four tabs, Today open, banner, key saved', s.level==='easy' && s.tabs.join('|')==='Today|My bets|Learn|Settings' && s.on.join()==='v-etoday' && s.key==='easy' && s.banner && s.banner.shown, s);
    await p.reload(); await p.waitForTimeout(1500); s=await p.evaluate(SNAP);
    check('Switch '+W+' px: after a reload Easy is still the level and Today is open (first paint and boot)', s.level==='easy' && s.on.join()==='v-etoday' && s.bodyView==='v-etoday' && s.tabs.join('|')==='Today|My bets|Learn|Settings', s);
    await p.click('#easyBack'); await p.waitForTimeout(250); s=await p.evaluate(SNAP);
    check('Switch '+W+' px: Back to God mode restores God with the Board', s.level==='god' && s.on.join()==='v-board' && s.tabs.join('|')==='Board|Live Games|Parlay|Bet log|Settings' && s.key==='god', s);
    await p.click('.tabs .tab[data-view="v-settings"]'); await p.waitForTimeout(150);
    await p.click('#easySwitchBox [data-level="god"]'); await p.waitForTimeout(150); s=await p.evaluate(SNAP);
    check('Switch '+W+' px: tapping ⚡ God while already in God stays on Settings', s.level==='god' && s.on.join()==='v-settings', s);
    const plus=await p.evaluate(()=>{ const b2=document.getElementById('easyLvPlus'); b2.click(); return {lvl:document.documentElement.getAttribute('data-viewas'), dis:b2.disabled}; });
    check('Switch '+W+' px: Plus is disabled and does nothing', plus.dis && plus.lvl==='god', plus);
    check('Switch '+W+' px: no page errors', !X.errs.length, X.errs);
    await X.ctx.close(); }

  // ---------- 4. Level labels: shown, and they move nothing ----------
  for(const [W,theme] of [[390,'light'],[1280,'light'],[390,'dark'],[1280,'dark']]){
    const X=await boot(b,W,900,{theme}); const p=X.p;
    const MEASURE=()=>{ const r=e=>{ const q=e.getBoundingClientRect(); return [Math.round(q.left*10)/10,Math.round(q.top*10)/10,Math.round(q.width*10)/10,Math.round(q.height*10)/10]; };
      const o={}; [...document.querySelectorAll('.tabs .tab')].filter(t=>t.getBoundingClientRect().width>0).forEach((t,i)=>{ o['tab'+i+':'+t.textContent.trim()]=r(t)+'|'+t.textContent; });
      const c=document.querySelector('#placeCards .sc-card'); if(c) o.card=r(c); o.dock=r(document.getElementById('apiDock')); o.head=r(document.querySelector('.head')); const bm=document.getElementById('boardMore'); if(bm) o.more=r(bm);
      o.sw=document.documentElement.scrollWidth-innerWidth; o.tabText=[...document.querySelectorAll('.tabs .tab')].map(t=>t.textContent).join('~'); return o; };
    const same=(a,c)=>{ const bad=[]; for(const k of Object.keys(a)) if(JSON.stringify(a[k])!==JSON.stringify(c[k])) bad.push(k+': '+JSON.stringify(a[k])+' -> '+JSON.stringify(c[k])); return bad; };
    const a1=await p.evaluate(MEASURE);
    await p.click('.tabs .tab[data-view="v-settings"]'); await p.waitForTimeout(250);
    const SETM=()=>[...document.querySelectorAll('#v-settings>.panel, #v-settings>details')].map(e=>{ const q=e.getBoundingClientRect(); return [Math.round(q.left*10)/10,Math.round(q.top*10)/10,Math.round(q.width*10)/10,Math.round(q.height*10)/10].join(','); }).join(';');
    const s1=await p.evaluate(SETM); const bodyH1=await p.evaluate(()=>document.documentElement.scrollHeight);
    await p.click('#easyLabelsBtn'); await p.waitForTimeout(250);
    const on=await p.evaluate(()=>{ const de=document.documentElement; const c=el=>{ const x=getComputedStyle(el,'::after'); return {content:x.content, display:x.display, pos:x.position, h:parseFloat(x.height), fs:parseFloat(x.fontSize), color:x.color, bg:x.backgroundColor}; };
      return {labels:de.getAttribute('data-labels'), key:localStorage.getItem('mbev.viewLabels'), btn:document.getElementById('easyLabelsBtn').getAttribute('aria-checked'), tab:c(document.querySelector('.tabs .tab[data-lv="god"]')), panel:c(document.getElementById('srcSettings')), etab:c(document.querySelector('.tabs .tab.etab')),
        n:document.querySelectorAll('[data-lv]').length, vals:[...new Set([...document.querySelectorAll('[data-lv]')].map(e=>e.dataset.lv))].sort().join(',')}; });
    check('Labels '+W+' '+theme+': the toggle sets data-labels="1", saves mbev.viewLabels and shows a pill (⚡ on God items, 🟢 on Easy tabs) drawn by CSS, absolute, 12 px or more', on.labels==='1' && on.key==='1' && on.btn==='true' && /⚡/.test(on.tab.content) && /⚡/.test(on.panel.content) && /🟢/.test(on.etab.content) && on.tab.pos==='absolute' && on.panel.pos==='absolute' && on.tab.fs>=12 && on.panel.fs>=12 && on.vals==='easy,god', on);
    const s2=await p.evaluate(SETM); const bodyH2=await p.evaluate(()=>document.documentElement.scrollHeight);
    check('Labels '+W+' '+theme+': the Settings sections do not move (same boxes, same page height)', s1===s2 && bodyH1===bodyH2, {bodyH1, bodyH2, s1:s1.slice(0,160), s2:s2.slice(0,160)});
    await p.click('.tabs .tab[data-view="v-board"]'); await p.waitForTimeout(250);
    const a2=await p.evaluate(MEASURE); const bad=same(a1,a2);
    check('Labels '+W+' '+theme+': the tabs, dock, header and first card do not move and the tab text is unchanged', bad.length===0, bad);
    await p.evaluate(()=>{ document.getElementById('boardMore').open=true; }); await p.waitForTimeout(150);
    const mo=await p.evaluate(()=>{ const bs=[...document.querySelectorAll('#boardMoreList button')]; return {n:bs.length, lv:bs.filter(x=>x.dataset.lv==='god').length, txt:bs.map(x=>x.textContent.trim()).join('|'), pseudo:bs.every(x=>/⚡/.test(getComputedStyle(x,'::after').content))}; });
    check('Labels '+W+' '+theme+': every More item (Filters & sort, Leagues, Parole, Moneylines) carries a God label and its text is unchanged', mo.n===4 && mo.lv===4 && mo.pseudo && mo.txt==='🔎 Filters & sort|🌍 Leagues|🔓 Parole|Moneylines', mo);
    await p.click('.tabs .tab[data-view="v-log"]'); await p.waitForTimeout(150);
    const sub=await p.evaluate(()=>[...document.querySelectorAll('#subTabs>.tab')].filter(t=>t.getBoundingClientRect().width>0).map(t=>t.dataset.lv+'|'+/⚡/.test(getComputedStyle(t,'::after').content)));
    check('Labels '+W+' '+theme+': the Bet log row (+ Add a bet, Performance, Reports) is labelled', sub.length===3 && sub.every(x=>x==='god|true'), sub);
    const secs=await p.evaluate(()=>{ const items=[...document.querySelectorAll('#v-settings>.panel, #v-settings>details')].filter(e=>e.id!=='easySwitchBox'); return {n:items.length, labelled:items.filter(e=>e.dataset.lv==='god').length}; });
    check('Labels '+W+' '+theme+': all 18 Settings sections are labelled (v5.27: + 🤖 Jarvis; v5.33: + 🚀 Autopilot)', secs.n===18 && secs.labelled===18, secs);
    // contrast of the new coloured things
    const cr=await p.evaluate(()=>{ const rgb=s=>(s.match(/[\d.]+/g)||[]).map(Number); const L=c=>{ const a=c.slice(0,3).map(v=>{ v/=255; return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4); }); return .2126*a[0]+.7152*a[1]+.0722*a[2]; };
      const ratio=(f,g)=>{ const a=L(f), c=L(g); return (Math.max(a,c)+.05)/(Math.min(a,c)+.05); };
      const out={}; const test=(k,fg,bg)=>{ out[k]=Math.round(ratio(rgb(fg),rgb(bg))*100)/100; };
      for(const l of ['god','plus','easy']){ const probe=document.createElement('span'); probe.setAttribute('data-lv',l); document.body.appendChild(probe); const x=getComputedStyle(probe,'::after'); test('badge-'+l,x.color,x.backgroundColor); probe.remove(); }
      return out; });
    check('Labels '+W+' '+theme+': badge text and fill are at least 4.5:1 (God, Plus, Easy)', Object.values(cr).every(v=>v>=4.5), cr);
    check('Labels '+W+' '+theme+': no page errors, no sideways scroll', !X.errs.length && a2.sw<=0 && a1.sw<=0, X.errs);
    await X.ctx.close(); }

  // ---------- 5. Who sees what: the registry ----------
  for(const W of [1280,390]){
    const X=await boot(b,W,900,{}); const p=X.p;
    await p.click('.tabs .tab[data-view="v-settings"]'); await p.waitForTimeout(200); await p.click('#easyWho>summary'); await p.waitForTimeout(150);
    const R=await p.evaluate(()=>{ const reg=EASY_REGISTRY; const c={god:0,plus:0,easy:0}; reg.forEach(r=>c[r[2]]++);
      const miss=reg.filter(r=>{ try{ return !document.querySelector(r[4]); }catch(e){ return true; } }).map(r=>r[0]+' '+r[4]);
      const names=reg.map(r=>r[0]); const dup=names.filter((n,i)=>names.indexOf(n)!==i);
      const btns=[...document.querySelectorAll('#easyWhoBody .ew-cnt')].map(x=>x.dataset.ew+'='+x.querySelector('b').textContent);
      return {n:reg.length, c, miss, dup, shape:reg.every(r=>r.length===5 && r.every(x=>typeof x==='string' && x.length>0) && ['god','plus','easy'].includes(r[2])), btns, rows:document.querySelectorAll('#easyWhoBody .ew-row').length, open:document.getElementById('easyWho').open, apos:reg.some(r=>/'/.test(r[0]+r[1]+r[3])),
        note:document.querySelector('#easyWhoBody .ew-note').textContent}; });
    check('Who '+W+' px: about 50 rows, each with feature, where, level, why and a selector; no duplicate names', R.n>=45 && R.n<=60 && R.shape && R.dup.length===0, {n:R.n, dup:R.dup, shape:R.shape});
    check('Who '+W+' px: every selector in the registry exists in the page', R.miss.length===0, R.miss);
    check('Who '+W+' px: the counts are computed from the array and add up (God + Plus + Easy = all rows = rows listed)', R.btns.join()==='god='+R.c.god+',plus='+R.c.plus+',easy='+R.c.easy+',all='+R.n && R.c.god+R.c.plus+R.c.easy===R.n && R.rows===R.n && R.c.plus===0 && R.c.easy>=4, R);
    check('Who '+W+' px: read-only, with the note', /Version 1 is read-only\. To move a feature to another level, tell El Capataz\./.test(R.note), R.note);
    for(const lv of ['easy','plus','god','all']){
      await p.click('#easyWhoBody .ew-cnt[data-ew="'+lv+'"]'); await p.waitForTimeout(80);
      const f=await p.evaluate(()=>({rows:document.querySelectorAll('#easyWhoBody .ew-row').length, lv:[...new Set([...document.querySelectorAll('#easyWhoBody .ew-row')].map(x=>x.dataset.ewlv))].join(), empty:(document.querySelector('#easyWhoBody .ew-empty')||{}).textContent||'', pressed:document.querySelector('#easyWhoBody .ew-cnt[aria-pressed="true"]').dataset.ew}));
      const want=lv==='all'?R.n:R.c[lv];
      check('Who '+W+' px: tapping the '+lv+' count filters the list to '+want+' rows', f.rows===want && f.pressed===lv && (lv==='all'||lv==='plus'||f.lv===lv) && (lv!=='plus'||/Nothing is assigned to Plus yet/.test(f.empty)), f); }
    check('Who '+W+' px: no page errors', !X.errs.length, X.errs);
    await X.ctx.close(); }

  // ---------- 6. Sizes: 12 px text, 44 px targets, no overflow (new controls) ----------
  for(const [W,theme] of [[390,'light'],[390,'dark'],[1280,'light'],[1280,'dark']]){
    const X=await boot(b,W,900,{theme}); const p=X.p;
    await p.click('.tabs .tab[data-view="v-settings"]'); await p.waitForTimeout(200); await p.click('#easyWho>summary'); await p.waitForTimeout(150);
    const M=await p.evaluate(()=>{ const box=document.getElementById('easySwitchBox'); const small=[], tiny=[]; const walk=root=>{ root.querySelectorAll('*').forEach(e=>{ const own=[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()); const r=e.getBoundingClientRect(); if(own&&r.width>0&&r.height>0&&getComputedStyle(e).display!=='none'&&parseFloat(getComputedStyle(e).fontSize)<11.99) small.push(e.className+':'+e.textContent.trim().slice(0,20)); }); };
      walk(box); box.querySelectorAll('button,summary').forEach(e=>{ const r=e.getBoundingClientRect(); if(r.height<43.99 || r.width<43.99) tiny.push((e.id||e.className||e.tagName)+':'+Math.round(r.width)+'x'+Math.round(r.height)); });
      const over=[...box.querySelectorAll('*')].filter(e=>e.getBoundingClientRect().right>box.getBoundingClientRect().right+1).map(e=>e.className);
      return {small, tiny, over, sw:document.documentElement.scrollWidth-innerWidth}; });
    check('Sizes '+W+' '+theme+': View as section: every text is 12 px or more, every button and summary is at least 44 px, nothing sticks out, no sideways scroll', !M.small.length && !M.tiny.length && !M.over.length && M.sw<=0, M);
    await p.click('#easySwitchBox [data-level="easy"]'); await p.waitForTimeout(250);
    const E=await p.evaluate(()=>{ const small=[]; document.querySelectorAll('#easyBanner *, #v-etoday *, .tabs .tab.etab').forEach(e=>{ const own=[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()); const r=e.getBoundingClientRect(); if(own&&r.width>0&&r.height>0&&getComputedStyle(e).display!=='none'&&parseFloat(getComputedStyle(e).fontSize)<11.99) small.push(e.className); });
      const bk=document.getElementById('easyBack').getBoundingClientRect(), ban=document.getElementById('easyBanner').getBoundingClientRect(), tabs=[...document.querySelectorAll('.tabs .tab.etab')].map(t=>Math.round(t.getBoundingClientRect().height)), th=document.getElementById('themer').getBoundingClientRect();
      const rgb=s=>(s.match(/[\d.]+/g)||[]).map(Number); const L=c=>{ const a=c.slice(0,3).map(v=>{ v/=255; return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4); }); return .2126*a[0]+.7152*a[1]+.0722*a[2]; };
      const ratio=(f,g)=>{ const a=L(f), c=L(g); return (Math.max(a,c)+.05)/(Math.min(a,c)+.05); };
      const back=document.getElementById('easyBack'); const cs=getComputedStyle(back), bg=getComputedStyle(document.getElementById('easyBanner')).backgroundColor;
      return {small, backH:Math.round(bk.height), backW:Math.round(bk.width), banH:Math.round(ban.height), tabs, backContrast:Math.round(ratio(rgb(cs.color),rgb(bg))*100)/100, textContrast:Math.round(ratio(rgb(getComputedStyle(document.getElementById('easyBanner')).color),rgb(bg))*100)/100, sw:document.documentElement.scrollWidth-innerWidth}; });
    check('Sizes '+W+' '+theme+': the banner is 44 px, its Back to God mode control is at least 44 px tall, text 12 px or more, contrast 4.5:1, the Easy tabs are 44 px or more', E.banH===44 && E.backH>=44 && E.backW>=44 && !E.small.length && E.backContrast>=4.5 && E.textContrast>=4.5 && E.tabs.every(h=>h>=44) && E.sw<=0, E);
    check('Sizes '+W+' '+theme+': no page errors', !X.errs.length, X.errs);
    await X.ctx.close(); }

  await b.close();
  console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail?1:0);
})();
