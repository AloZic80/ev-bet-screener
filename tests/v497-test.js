// node tests/v497-test.js — v4.97, Las Karens' safe fixes (owner: "build"): on a phone the bet form opens where it can be seen (above the bottom bar)
// and Save says "✓ Saved" with a short tap guard; "wins $" is always the profit; the % box says "Pays back $"; the app opens once on the tab that
// holds the #1 math pick; Brujo's heading counts the approved long shots above it; 16px fields and 40px buttons on a phone. Display only.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,600)); };
const NOW=Date.parse('2026-11-13T19:00:00Z'), iso=ms=>new Date(ms).toISOString(), TIP=Date.parse('2026-11-14T02:00:00Z');
const T=(ha,abbr)=>({ha,id:abbr,abbr,name:abbr+' Team',loc:abbr,nick:'Team',logo:'',rec:'',color:'333333',alt:'ffffff'});
const GI=(e)=>({state:'pre',startISO:iso(TIP),eventId:e,timeCT:'',detail:'',teams:[T('away','CHA'),T('home','PHX')]});
const am=p=>p>=0.5?String(Math.round(-100*p/(1-p))):'+'+Math.round(100*(1-p)/p);
const row=(id,name,book,price,fair,mkt,extra)=>Object.assign({name,team:'PHX',game:'CHA @ PHX',matchup:'CHA @ PHX',side:'O',sport:'NBA',market:'1.5 Threes',kind:'prop',book,offeredRaw:am(price),offeredProb:price,fairProb:fair,fairRaw:'',mktProb:mkt,stars:3,evModel:'market',gameInfo:GI(id),src:'api:NBA:props',apiKey:id,loadedAt:iso(NOW-60e3)},extra||{});
// a clean Volado bet (chance 50-60%) is the only actionable one; Machín (the saved tab) holds only an outlier
const ROWS=[row('vol','Clean Pick','Novig',0.54,0.585,0.575), row('out','Way Off','Novig',0.55,0.75,0.62)];
(async()=>{ const b=await chromium.launch(); const errs=[];
  for(const W of [390,1280]){ const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:W,height:760}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(([R])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig',bank:'500',cfgVer:3.03})); localStorage.setItem('mbev.cards','1'); localStorage.setItem('mbev.mode',JSON.stringify({mode:'safe'})); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:'2026-11-13',rows:R})); }catch(e){} },[ROWS]);
  const p=await ctx.newPage(); p.on('pageerror',e=>errs.push(W+': '+e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1500);
  const st=await p.evaluate(()=>({mode:betMode, top:!!document.querySelector('.sc-mathtop'), toast:(document.getElementById('savedToast')||{}).textContent||''}));
  check(W+' px: the app opened on the tab with the #1 math pick (🪙 Volado), not on Machín’s untrusted outlier, and said so', st.mode==='volado' && st.top && /#1 math pick/.test(st.toast), st);
  const again=await p.evaluate(()=>{ setMode('safe'); return betMode; }); await p.waitForTimeout(200);
  check(W+' px: once only: picking a tab afterwards stays on it', await p.evaluate(()=>betMode)==='safe' && again==='safe');
  await p.evaluate(()=>setMode('volado')); await p.waitForTimeout(250);
  const money=await p.evaluate(()=>{ const c=[...document.querySelectorAll('.sc-card')].find(x=>x.textContent.includes('Clean Pick')); return c?c.querySelector('.sc-money').textContent:''; });
  check(W+' px: the card says "wins $" = the profit, and an exchange also says what comes back', /wins \$[\d.]+ · back \$[\d.]+/.test(money), money);
  await p.evaluate(()=>{ const c=[...document.querySelectorAll('.sc-card')].find(x=>x.textContent.includes('Clean Pick')); window.scrollTo(0, c.getBoundingClientRect().top+scrollY-20); }); await p.waitForTimeout(150);
  await p.evaluate(()=>{ const c=[...document.querySelectorAll('.sc-card')].find(x=>x.textContent.includes('Clean Pick')); c.querySelector('.bet-btn').click(); }); await p.waitForTimeout(500);
  const ed=await p.evaluate(()=>{ const e=document.querySelector('.sc-card .editor'); if(!e) return null; const r=e.getBoundingClientRect(), d=document.getElementById('apiDock').getBoundingClientRect(), save=[...e.querySelectorAll('button')].find(x=>/Save bet/.test(x.textContent)); const s=save.getBoundingClientRect();
    return {top:Math.round(r.top), saveBottom:Math.round(s.bottom), dockTop:Math.round(d.top), lab:(e.querySelector('.eb-win-l')||{}).textContent, fs:parseFloat(getComputedStyle(e.querySelector('input')).fontSize), btnH:Math.round(s.height)}; });
  check(W+' px: "I bet this" opens the form where it can be seen: its Save button is above the bottom bar', ed && ed.top>=0 && ed.saveBottom<=ed.dockTop, ed);
  check(W+' px: the % box says "Pays back $" (what comes back), not "To win"', ed && ed.lab==='Pays back $', ed);
  if(W===390) check('phone: form fields are 16px (no iPhone zoom) and the Save button is at least 40px tall', ed && ed.fs>=16 && ed.btnH>=40, ed);
  await p.evaluate(()=>{ const e=document.querySelector('.sc-card .editor'); [...e.querySelectorAll('button')].find(x=>/Save bet/.test(x.textContent)).click(); }); await p.waitForTimeout(250);
  const sv=await p.evaluate(()=>({toast:document.getElementById('savedToast').textContent, on:document.getElementById('savedToast').classList.contains('on'), guard:document.body.classList.contains('tap-guard'), n:logged.length}));
  check(W+' px: Save shows "✓ Saved …" above the bottom bar, and the board ignores taps for a moment', sv.on && /^✓ Saved: /.test(sv.toast) && sv.guard && sv.n===1, sv);
  await p.waitForTimeout(900);
  check(W+' px: the tap guard lifts after a moment', await p.evaluate(()=>!document.body.classList.contains('tap-guard')));
  const over=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth); check(W+' px: no sideways scroll', over<=0, over);
  await ctx.close(); }
  check('no page errors', !errs.length, errs);
  await b.close(); console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(fail?1:0); })();
