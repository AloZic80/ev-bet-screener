// node tests/v498-test.js (fixture from phone-today-test.js) — v4.64 (Alonzo, phone, a screenshot of the Today card: "Even this"): on a phone the Today card is one line, closed
// every time the app opens: the day, what was bet, the record, what is in play and bets to check; a tap opens the whole card (‹ › days, by book).
// At 1000, 1280 and 1960 px nothing changes.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,600)); };
const NOW=Date.parse('2026-11-05T18:00:00Z'), H=3600e3, iso=ms=>new Date(ms).toISOString(), DAY='2026-11-05';
const bet=(id,o)=>Object.assign({id,key:id,sport:'NBA',kind:'prop',book:'Novig',odds:'+100',stake:2,date:DAY,dateSet:true,manual:true,game:'LAL @ BOS',name:'Player '+id,side:'O',market:'10.5 Points',betnow:'O 10.5 +100',snap:{at:iso(NOW-5*H)}},o);
const LOG=[bet('won',{stake:3,odds:'-150',result:'win',gradedBy:'manual',start:iso(NOW-4*H)}), bet('lost',{stake:1.5,result:'loss',gradedBy:'manual',start:iso(NOW-4*H)}), bet('playing',{stake:2,start:iso(NOW-H)}), bet('later',{stake:4,start:iso(NOW+5*H)})];
async function open(b,W,log){ const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:W,height:900}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(L=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.log',JSON.stringify(L)); }catch(e){} }, log);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1500); return {ctx,p,errs}; }
const vis=(p,sel)=>p.evaluate(s=>{ const e=document.querySelector(s); if(!e) return null; const r=e.getBoundingClientRect(); return r.width>0 && r.height>0 && getComputedStyle(e).display!=='none'; }, sel);
const txt=(p,sel)=>p.evaluate(s=>document.querySelector(s).textContent.replace(/\s+/g,' ').trim(), sel);
(async()=>{ const b=await chromium.launch();
  for(const W of [390,1000,1280,1960]){ let {ctx,p,errs}=await open(b,W,LOG);
    await p.click('#tbFoldBtn'); await p.waitForTimeout(250);
    const r=await p.evaluate(()=>{ const t=document.getElementById('todayBar'), k=t.querySelector(':scope>.tb-k'), a=t.querySelector(':scope>.tb-t.all'), kr=k.getBoundingClientRect();
      const kids=[...k.children].filter(x=>x.offsetParent).map(x=>x.getBoundingClientRect()), tiles=[...a.querySelectorAll(':scope>.tb-l2')].map(x=>x.getBoundingClientRect());
      const sum=document.querySelector('#tbFoldBtn .hf-sum');
      return {rowsK:new Set(kids.map(x=>Math.round(x.top/30))).size, kH:Math.round(kr.height), tilesRow:new Set(tiles.map(x=>Math.round(x.top))).size, nTiles:tiles.length, tileBox:tiles.every(x=>x.width>=150), aH:Math.round(a.getBoundingClientRect().height), sumHidden:sum?getComputedStyle(sum).visibility==='hidden':true,
        text:a.textContent.replace(/\s+/g,' '), over:document.documentElement.scrollWidth-innerWidth}; });
    const wide=W>=1000;
    check(W+' px: v4.98 (Alonzo: "in ROWS not columns" … "make it nice"): open, the day is one header row'+(wide?' (one line)':' (wraps on a phone)'), wide ? r.kH<=80 : r.kH<=200, r);
    check(W+' px: the same numbers and words as before: played → won vs lost, IN PLAY, to play, best · worst', /played \$4\.50 → won \$2\.00 vs lost \$1\.50/.test(r.text) && /IN PLAY \$2\.00/.test(r.text) && /to play \$4\.00/.test(r.text) && /best \+\$8\.50 · worst −\$1\.50/.test(r.text), r.text.slice(0,300));
    check(W+' px: '+(wide?'the four tiles side by side, no empty space under them':'the tiles one under another'), r.nTiles===4 && r.tileBox && (wide ? r.tilesRow===1 && r.aH<=260 : r.tilesRow===4), r);
    check(W+' px: while open, the one line does not repeat the totals; no sideways scroll', r.sumHidden && r.over<=0, r);
    check(W+' px: no page errors', !errs.length, errs); await ctx.close(); }
  await b.close(); console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(fail?1:0); })();
