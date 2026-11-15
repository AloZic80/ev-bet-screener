// node tests/bugfix-layout-test.js — v5.11 bug fixes, layout and words (owner 11/15: "Fix all 8"). Each fix is measured in the page, and each one is also
// measured with its own v5.11 rule taken out (CSSOM) to show the bug it fixes, so a later change that brings a bug back fails here.
// L1  Bet log at 900 px: the log table ran 111 px past its box (the buttons were cut off). Cause: the Date, Bet and button columns kept fixed widths
//     (118 / 180 / 150 px) that only fit the full 1,180 px page. From 641 to 1179 px they are as wide as what they hold (the date stays on one line).
//     Phones and the full page unchanged.
// L2  Bet log › edit on a phone: Book, Enter as, Odds, Stake and Cover % were off the right of the part of the table you can see, the Real money box 18 to
//     19 px past it from 390 to 1000 px. The form now wraps inside that part (100vw − 67 px, as the v5.10 lines) and stays there when the table is scrolled to
//     its buttons (where edit is). Light and dark. The board and + Add a bet are not touched.
// L3  + Add a bet's boxes were 18 px wider than the same boxes in I bet this and Bet log › edit: #abHost sits in a <details>, whose own inner box does not
//     take the page's border-box sizing (content-box: padding and border added to the width). Now the same widths; no other form changes.
// L4  Kalshi: "pay up to 64.9%" sat next to "a limit of 64¢" as two numbers for one order. The words now tie them (the % stays, the ¢ stays, the v5.05
//     strip is unchanged): bet form "pay up to X% max (a N¢ limit on Kalshi: whole cents, rounded down)", + Add a bet "On Kalshi that is the N¢ limit above:
//     Kalshi takes whole cents, so X% rounds down.", card "OK to X% (N¢ limit)". Other books unchanged.
// L5  Reports: the chosen period button (Day, Month, Year, All, Custom) in dark mode was white on the scheme's light accent colour (1.5 to 2.1:1). Now white
//     on the scheme's dark button colour (--brand, as the other chosen buttons), 4.5:1 or more in every scheme; light mode unchanged.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
const seed=require('./seed.js');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,900)); };
const errs=[];
// in the page: take out the stylesheet rules whose text matches (the v5.11 rule under test), to measure the page as it was before; returns how many
const OFF=`window.__off=function(re){ re=new RegExp(re); let n=0; for(const sh of document.styleSheets){ let rs; try{ rs=sh.cssRules; }catch(e){ continue; } for(let i=rs.length-1;i>=0;i--){ if(re.test(rs[i].cssText)){ sh.deleteRule(i); n++; } } } return n; };`;
const L1_RULE='1179px[\\s\\S]*#logBody td:first-child', L2_RULE='^#logBody tr\\.editor \\.editor-row \\{', L3_RULE='^#abHost \\{ box-sizing: border-box', L5_RULE='data-theme="dark"\\] \\.rp-seg button\\.on';
// ---- L2 / L3 / L4 data: tonight's NBA game (ESPN stub), two Kalshi board rows, a Bovada single, a Kalshi bet with a book ID, a parlay
const NOW=Date.parse('2026-11-15T18:00:00Z'), H=3600e3, iso=ms=>new Date(ms).toISOString();   // Sun 12:00 CT
const ev={ id:'401909001', date:'2026-11-16T01:00Z', shortName:'CHA @ DET', status:{type:{state:'pre',completed:false,name:'STATUS_SCHEDULED',detail:'Sun, November 15th at 8:00 PM EST',shortDetail:'11/15 - 8:00 PM EST'}},
  competitions:[{ competitors:[{homeAway:'home',score:'0',team:{abbreviation:'DET',shortDisplayName:'Pistons',name:'Pistons',location:'Detroit'}},{homeAway:'away',score:'0',team:{abbreviation:'CHA',shortDisplayName:'Hornets',name:'Hornets',location:'Charlotte'}}] }] };
const team=(ha,abbr)=>({ha,id:abbr,abbr,name:abbr,loc:abbr,nick:abbr,logo:'',rec:'',color:'333333',alt:'ffffff'});
const am=p=>p>=0.5?String(Math.round(-100*p/(1-p))):'+'+Math.round(100*(1-p)/p);
const row=(o)=>Object.assign({name:'Akron Zips',team:'AKR',game:'AKR @ KENT',matchup:'AKR @ KENT',side:'',sport:'NCAAF',market:'Moneyline',kind:'moneyline',book:'Kalshi',offeredRaw:'-105',offeredProb:0.512,fairProb:0.55,fairRaw:'',mktProb:0.55,stars:null,evModel:'market',
  gameInfo:{state:'pre',startISO:iso(NOW+6*H),timeCT:'',detail:'',teams:[team('away','AKR'),team('home','KENT')]},src:'api:oddsapi:NCAAF',apiKey:'k2',loadedAt:iso(NOW-20e3)},o||{});
const ROWS=[row(),
  row({name:'Kal Kelly',team:'TK',game:'TK @ HK',matchup:'TK @ HK',side:'O',sport:'NHL',market:'1.5 Shots On Goal',kind:'prop',offeredRaw:am(0.62),offeredProb:0.62,fairProb:0.69,mktProb:0.66,stars:3,evModel:'market',apiKey:'kk',
    gameInfo:{state:'pre',startISO:iso(NOW+8*H),eventId:'8k',timeCT:'',detail:'',teams:[team('away','TK'),team('home','HK')]},src:'api:NHL:props'}),
  row({name:'Novi Same',team:'TN',game:'TN @ HN',matchup:'TN @ HN',side:'O',sport:'NHL',market:'1.5 Shots On Goal',kind:'prop',book:'Novig',offeredRaw:am(0.62),offeredProb:0.62,fairProb:0.69,mktProb:0.66,stars:3,evModel:'market',apiKey:'nn',
    gameInfo:{state:'pre',startISO:iso(NOW+8*H),eventId:'8n',timeCT:'',detail:'',teams:[team('away','TN'),team('home','HN')]},src:'api:NHL:props'})];
const LOG=[{id:'s1', key:'s1', kind:'moneyline', sport:'NBA', book:'Bovada', name:'DET', team:'DET', market:'Moneyline', betnow:'DET ML', game:'CHA @ DET', odds:'+100', stake:1.52, date:'2026-11-15', dateSet:true, start:'2026-11-16T01:00:00Z', manual:true, snap:{at:iso(NOW-H)}},
  {id:'k1', key:'k1', kind:'moneyline', sport:'NBA', book:'Kalshi', name:'CHA', team:'CHA', market:'Moneyline', betnow:'CHA ML', game:'CHA @ DET', odds:'-163', stake:5.44, date:'2026-11-15', dateSet:true, start:'2026-11-16T01:00:00Z', fillRef:'7c9e6679-7425-40de-944b-e07fc1f90ae7', snap:{at:iso(NOW-2*H)}},
  {id:'pl1', key:'pl1', kind:'parlay', sport:'NBA', book:'DraftKings', name:'3-pick parlay', market:'Parlay', odds:'+600', stake:5, towin:30, date:'2026-11-15', dateSet:true, parlay:{picks:3, pays:{all:35}, legs:'a; b; c'}, snap:{at:iso(NOW-H)}}];
const ratio=(a,b)=>{ const lum=c=>{ const f=v=>{ v/=255; return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4); }; return 0.2126*f(c[0])+0.7152*f(c[1])+0.0722*f(c[2]); }; const x=lum(a), y=lum(b); return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05); };
const rgb=s=>{ const m=String(s).match(/rgba?\(([^)]+)\)/); return m?m[1].split(/[ ,/]+/).filter(Boolean).map(Number):null; };
// by hand (not the page's functions): La Contadora's most on Kalshi (smooth fee 7% × (1 − p)) for her chance q and the floor
const evAt=(q,p,rate)=>{ const f=(rate==null?0.07:rate)*(1-p); return ((q/p-1)-f)/(1+f); };
const mostAt=(q,eMin,rate)=>{ let lo=0.01, hi=0.99; for(let i=0;i<60;i++){ const m=(lo+hi)/2; if(evAt(q,m,rate)>=eMin) lo=m; else hi=m; } return lo; };
async function stubbed(ctx){ const p=await ctx.newPage(); p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*', r=>{ const u=r.request().url();
    if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/site\.api\.espn\.com.*\/basketball\/nba\/scoreboard/.test(u)){ const m=u.match(/dates=(\d{8})/), d=m&&m[1]; return r.fulfill({contentType:'application/json',body:JSON.stringify({events:(!d||d==='20261115')?[ev]:[]})}); }
    if(/espn\.com/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'});
    if(/\/live\?/.test(u)){ let ids=[]; try{ ids=JSON.parse(decodeURIComponent(u.split('bets=')[1]||'')).map(x=>x.id); }catch(e){}   // the Sentinels: Kalshi at 62¢ for every Kalshi bet asked
      const R={}; ids.forEach(id=>{ if(/kalshi/.test(id)) R[id]={ok:true, price:0.62, src:'kalshi', title:'x'}; }); return r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({results:R})}); }
    if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:'{}'});
    return r.abort(); });
  await p.goto('http://app.test/index.html'); await p.waitForTimeout(1500); await p.evaluate(OFF); return p; }
(async()=>{
  const b=await chromium.launch();
  // ================= L1: the Bet log table at six widths (the sample log the reports use) =================
  const L1={};
  for(const W of [390,768,900,1000,1280,1960]){
    const ctx=await b.newContext({viewport:{width:W,height:900}, timezoneId:'America/Chicago'}); await ctx.addInitScript(seed); const p=await ctx.newPage(); p.on('pageerror',e=>errs.push('L1 '+W+': '+e.message));
    await p.route('**/*',r=>{const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/espn\.com.*scoreboard/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort();});
    await p.goto('http://app.test/'); await p.waitForTimeout(1200); await p.evaluate(OFF);
    await p.evaluate(()=>document.querySelector('.tab[data-view="v-log"]').click()); await p.waitForTimeout(500);
    const m=()=>p.evaluate(()=>{ const t=document.getElementById('logBody').closest('table'), s=t.closest('.scroll'), R=s.getBoundingClientRect(), visR=R.left+s.clientLeft+s.clientWidth;
      const tr=[...document.querySelectorAll('#logBody tr')].find(x=>!x.classList.contains('log-day') && !x.hidden && x.children.length===11), mw=k=>tr?getComputedStyle(tr.children[k]).minWidth:null;
      const btns=tr?[...tr.lastElementChild.querySelectorAll('button')].map(x=>x.getBoundingClientRect()):[];
      const dn=tr?[...tr.children[0].childNodes].find(n=>n.nodeType===3 && n.textContent.trim()):null, rg=document.createRange(); if(dn) rg.selectNodeContents(dn);   /* the date (2026-11-15) on one line, not "2026-" / "11-15" */
      return {over:s.scrollWidth-s.clientWidth, side:document.documentElement.scrollWidth>innerWidth, cols:[...t.querySelectorAll('thead th')].map(th=>Math.round(th.getBoundingClientRect().width)), min:[mw(0),mw(1),mw(10)], btnsIn:btns.length>0 && btns.every(r=>r.right<=visR+0.5), dateLines:dn?rg.getClientRects().length:null}; });
    const a=await m(); const n=await p.evaluate(re=>window.__off(re), L1_RULE); await p.waitForTimeout(150); const bf=await m();
    L1[W]={after:a, before:bf, ruleFound:n}; await ctx.close(); }
  const r1=W=>L1[W];
  check('L1 900 px: the log table fits its box (it ran '+r1(900).before.over+' px past it, the buttons cut off), every button on the screen; no sideways page scroll',
    r1(900).ruleFound===1 && r1(900).before.over>=50 && r1(900).after.over<=2 && r1(900).after.btnsIn && !r1(900).before.btnsIn && !r1(900).after.side, {after:r1(900).after, before:{over:r1(900).before.over, btnsIn:r1(900).before.btnsIn}});
  check('L1 the cause: from 641 to 1179 px the Date, Bet and button columns have no fixed width (they had 118 / 180 / 150 px); 768, 900 and 1000 px', [768,900,1000].every(W=>r1(W).after.min.join()==='0px,0px,0px' && r1(W).before.min.join()==='118px,180px,150px'), [768,900,1000].map(W=>[W, r1(W).after.min, r1(W).before.min]));
  check('L1 the date (2026-11-15) stays on one line at every width', [390,768,900,1000,1280,1960].every(W=>r1(W).after.dateLines===1), [390,768,900,1000,1280,1960].map(W=>[W, r1(W).after.dateLines]));
  check('L1 1000 px: the table fits (it ran '+r1(1000).before.over+' px past its box); 768 px (a tablet, still a scrolling table): '+r1(768).after.over+' px to scroll sideways instead of '+r1(768).before.over,
    r1(1000).after.over<=2 && r1(1000).after.btnsIn && r1(768).after.over<r1(768).before.over-100 && !r1(1000).after.side && !r1(768).after.side, {w1000:r1(1000).after.over, b1000:r1(1000).before.over, w768:r1(768).after.over, b768:r1(768).before.over});
  check('L1 390, 1280 and 1960 px unchanged: the fixed widths stay, every column the same width with or without the v5.11 rule; no sideways page scroll',
    [390,1280,1960].every(W=>r1(W).after.min.join()==='118px,180px,150px' && r1(W).after.cols.join()===r1(W).before.cols.join() && r1(W).after.over===r1(W).before.over && !r1(W).after.side), [390,1280,1960].map(W=>[W, r1(W).after.cols.join('/'), r1(W).after.over]));
  // ================= L2: Bet log › edit, light and dark, eight widths, the table at the left and scrolled to its buttons =================
  const geo=(p)=>p.evaluate(()=>{ const e=document.querySelector('#logBody tr.editor'); if(!e) return null; let a=e.parentElement; while(a && a!==document.body){ const o=getComputedStyle(a).overflowX; if(o==='auto'||o==='scroll') break; a=a.parentElement; }
    const R=a.getBoundingClientRect(), vis={l:Math.round(R.left+a.clientLeft), r:Math.round(R.left+a.clientLeft+a.clientWidth)};
    const cls=x=>x.tagName.toLowerCase()+(typeof x.className==='string'&&x.className?'.'+x.className.trim().split(/\s+/).join('.'):'')+((x.textContent||'').trim()?' "'+x.textContent.trim().slice(0,14)+'"':'');
    let n=0; const out=[];
    e.querySelectorAll('.editor-row, .editor-row *').forEach(x=>{ if(x.tagName==='OPTION' || x.classList.contains('eb-tw-brk') || x.classList.contains('eb-money-brk')) return; if(!x.getClientRects().length) return; const r=x.getBoundingClientRect(); if(r.width<1 || r.height<1) return;
      n++; if(r.left<vis.l-0.5 || r.right>vis.r+0.5) out.push({x:cls(x), l:Math.round(r.left), r:Math.round(r.right)}); });
    const lab=t=>{ const l=[...e.querySelectorAll('label')].find(x=>x.firstChild && x.firstChild.nodeType===3 && x.firstChild.textContent.trim().startsWith(t)); return !!(l && l.getClientRects().length); };
    return {vis, n, out, sl:Math.round(a.scrollLeft), side:document.documentElement.scrollWidth>innerWidth, has:{book:lab('Book'), mode:lab('Enter as'), cover:lab('Cover %'), money:!!e.querySelector('.eb-money')}}; });
  const openEdit=(p,id,right)=>p.evaluate(([id,right])=>{ document.querySelectorAll('#logBody tr.editor').forEach(x=>x.remove()); const i=logged.findIndex(x=>x.id===id), btn=document.querySelector('#logBody button.kill.edit[data-i="'+i+'"]');
    let a=btn.closest('.scroll'); a.scrollLeft=right?a.scrollWidth:0; btn.click(); return true; }, [id,right]);
  const L2={}, L3={}, L4={};
  for(const theme of ['light','dark']){
    const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:1280,height:900}}); await ctx.clock.install({time:new Date(NOW)});
    await ctx.addInitScript(([rows,L,d,th])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.theme',th); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig, Kalshi, Polymarket US, Bovada',bank:'500',cfgVer:3.03})); localStorage.setItem('mbev.cards','1'); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows})); localStorage.setItem('mbev.log',JSON.stringify(L)); }catch(e){} }, [ROWS,LOG,'2026-11-15',theme]);
    const p=await stubbed(ctx);
    const T={};
    for(const W of [360,390,414,768,900,1000,1280,1960]){ await p.setViewportSize({width:W,height:900}); await p.evaluate(()=>document.querySelector('.tab[data-view="v-log"]').click()); await p.waitForTimeout(300);
      const g={};
      await openEdit(p,'s1',false); await p.waitForTimeout(250); await p.fill('#logBody tr.editor .eb-win-o','3.04'); await p.waitForTimeout(250); g.left=await geo(p);   // "This looks like the total payout" shows its line too
      await openEdit(p,'s1',true); await p.waitForTimeout(300); g.right=await geo(p);   // a phone: the table scrolled to its buttons, where edit is
      await openEdit(p,'k1',false); await p.waitForTimeout(300); g.kal=await geo(p);   // a Kalshi bet in %, with its book ID
      await p.evaluate(()=>document.querySelectorAll('#logBody tr.editor').forEach(x=>x.remove()));
      T[W]=g; }
    // the same form as before v5.11 (its rule out): at 390 px fields were off the screen (the bug)
    await p.setViewportSize({width:390,height:900}); const nOff=await p.evaluate(re=>window.__off(re), L2_RULE); await openEdit(p,'s1',false); await p.waitForTimeout(300); const before=await geo(p);
    await p.evaluate(()=>document.querySelectorAll('#logBody tr.editor').forEach(x=>x.remove()));
    L2[theme]={T, before, nOff};
    if(theme==='light'){
      // ---- the board as a table and + Add a bet: their forms are not touched (no width cap, not sticky)
      await p.setViewportSize({width:390,height:900});
      const other=await p.evaluate(async()=>{ document.querySelector('.tab[data-view="v-add"]').click(); const d=document.getElementById('addBetPanel'); if(!d.open){ d.open=true; d.dispatchEvent(new Event('toggle')); }
        for(let i=0;i<30 && !document.querySelector('#abHost .editor');i++) await new Promise(r=>setTimeout(r,100));
        const ab=document.querySelector('#abHost .editor-row'), s=x=>x?getComputedStyle(x):null;
        return {ab:ab?{maxW:s(ab).maxWidth, pos:s(ab).position}:null}; });
      // ================= L3: + Add a bet's boxes against I bet this and Bet log › edit =================
      for(const W of [1280,390]){ await p.setViewportSize({width:W,height:900});
        const wd=(sel)=>p.evaluate(sel=>{ const e=document.querySelector(sel); if(!e) return null; const o={}; ['.eb-odds','.eb-stake','.eb-win-o','.eb-tot-o','.eb-cost','.eb-pct','.eb-win'].forEach(c=>{ const x=e.querySelector(c); if(x && x.getClientRects().length) o[c]={w:Math.round(x.getBoundingClientRect().width*10)/10, bs:getComputedStyle(x).boxSizing}; }); return o; }, sel);
        const abOpen=async(book)=>{ await p.evaluate(async()=>{ document.querySelector('.tab[data-view="v-add"]').click(); const d=document.getElementById('addBetPanel'); if(!d.open){ d.open=true; d.dispatchEvent(new Event('toggle')); } for(let i=0;i<30 && !document.querySelector('#abHost .editor');i++) await new Promise(r=>setTimeout(r,100)); }); await p.waitForTimeout(200);
          await p.selectOption('#abHost .eb-book', book); await p.waitForTimeout(250); };
        await abOpen('Bovada'); const add=await wd('#abHost .editor'); await abOpen('Polymarket US'); const addPct=await wd('#abHost .editor');
        await p.evaluate(()=>document.querySelector('.tab[data-view="v-log"]').click()); await p.waitForTimeout(300); await openEdit(p,'s1',false); await p.waitForTimeout(300); const log=await wd('#logBody tr.editor');
        await p.evaluate(()=>document.querySelectorAll('#logBody tr.editor').forEach(x=>x.remove()));
        await p.evaluate(()=>{ document.querySelector('.tab[data-view="v-board"]').click(); setMode('volado'); }); await p.waitForTimeout(500);
        const cardOk=await p.evaluate(()=>{ const c=[...document.querySelectorAll('#placeCards .pcard')].find(x=>/AKR @ KENT/.test(x.textContent)); if(!c) return false; if(!c.querySelector('.editor')) c.querySelector('.bet-btn').click(); return !!c.querySelector('.editor'); }); await p.waitForTimeout(250);
        const cardPct=cardOk?await wd('#placeCards .editor'):null;
        if(cardOk){ await p.selectOption('#placeCards .editor .eb-mode','odds'); await p.waitForTimeout(200); }
        const card=cardOk?await wd('#placeCards .editor'):null;
        // other forms with the v5.11 L3 rule out: only + Add a bet's boxes move
        const otherNow=await p.evaluate(()=>{ const w=s=>[...document.querySelectorAll(s)].filter(x=>x.getClientRects().length).map(x=>Math.round(x.getBoundingClientRect().width*10)/10); return {card:w('#placeCards .editor input, #placeCards .editor select'), grid:(()=>{ document.querySelector('.tab[data-view="v-add"]').click(); return w('#addBetPanel .ab-grid input, #addBetPanel .ab-grid select'); })(), parlay:(()=>{ document.querySelector('.tab[data-view="v-log"]').click(); document.getElementById('parlayPanel').open=true; return w('#parlayPanel input, #parlayPanel select'); })()}; });
        await abOpen('Bovada'); const addNow=await wd('#abHost .editor');
        const n3=await p.evaluate(re=>window.__off(re), L3_RULE); await p.waitForTimeout(150);
        const addOff=await wd('#abHost .editor');
        const otherOff=await p.evaluate(()=>{ const w=s=>[...document.querySelectorAll(s)].filter(x=>x.getClientRects().length).map(x=>Math.round(x.getBoundingClientRect().width*10)/10); return {card:(()=>{ document.querySelector('.tab[data-view="v-board"]').click(); return w('#placeCards .editor input, #placeCards .editor select'); })(), grid:(()=>{ document.querySelector('.tab[data-view="v-add"]').click(); return w('#addBetPanel .ab-grid input, #addBetPanel .ab-grid select'); })(), parlay:(()=>{ document.querySelector('.tab[data-view="v-log"]').click(); return w('#parlayPanel input, #parlayPanel select'); })()}; });
        await p.evaluate(()=>{ document.getElementById('parlayPanel').open=false; const x=document.querySelector('#placeCards .editor .eb-cancel'); if(x) x.click(); });
        L3[W]={add, addPct, log, card, cardPct, otherNow, otherOff, addNow, addOff, n3};
        if(W===1280){ await p.reload(); await p.waitForTimeout(1500); await p.evaluate(OFF); } }   // the rule back for 390
      L3.other=other;
      // ================= L4: the Kalshi words (card, I bet this, + Add a bet), a Novig card for comparison =================
      await p.setViewportSize({width:1280,height:1000}); await p.reload(); await p.waitForTimeout(1500); await p.evaluate(OFF);
      const C=await p.evaluate(()=>{ const c=cfgRead(); return {eMin:c.eMin, w:c.mWeight, kal:c.fees.kalshi}; });
      const findCard=async(name)=>{ const n=await p.evaluate(()=>document.querySelectorAll('#modeBar button').length); for(let i=0;i<Math.max(1,n);i++){ await p.evaluate(i=>{ const bt=document.querySelectorAll('#modeBar button')[i]; if(bt) bt.click(); }, i); await p.waitForTimeout(200);
        const ok=await p.evaluate(nm=>{ const c=[...document.querySelectorAll('#placeCards .sc-card')].find(x=>x.textContent.includes(nm)); if(!c) return false; const d=c.querySelector('details.sc-why'); if(d) d.open=true; return true; }, name); if(ok) return true; } return false; };
      const cardTxt=nm=>p.evaluate(nm=>{ const c=[...document.querySelectorAll('#placeCards .sc-card')].find(x=>x.textContent.includes(nm)); if(!c) return null; const t=e=>e?e.innerText.replace(/\s+/g,' ').trim():null;
        return {pick:t(c.querySelector('.sc-pick')), tip:(c.querySelector('.sc-pick .imp')||{}).title||null, line:t(c.querySelector('.sc-kx')), how:t(c.querySelector('.kx-how')), tile:[...c.querySelectorAll('.sc-t')].map(t).find(x=>/^OK UP TO/i.test(x))||null}; }, nm);
      await findCard('Kal Kelly'); L4.kal=await cardTxt('Kal Kelly'); await findCard('Novi Same'); L4.nov=await cardTxt('Novi Same');
      await findCard('Kal Kelly'); await p.evaluate(()=>{ const c=[...document.querySelectorAll('#placeCards .sc-card')].find(x=>x.textContent.includes('Kal Kelly')); c.querySelector('.bet-btn').click(); }); await p.waitForTimeout(900);
      L4.form=await p.evaluate(()=>{ const e=document.querySelector('#placeCards .editor'), t=c=>{ const x=e&&e.querySelector(c); return x?x.innerText.replace(/\s+/g,' ').trim():null; }; return {rec:t('.eb-rec'), live:t('.eb-live')}; });
      await p.evaluate(()=>{ const x=document.querySelector('#placeCards .editor .eb-cancel'); if(x) x.click(); });
      await findCard('Novi Same'); await p.evaluate(()=>{ const c=[...document.querySelectorAll('#placeCards .sc-card')].find(x=>x.textContent.includes('Novi Same')); c.querySelector('.bet-btn').click(); }); await p.waitForTimeout(900);
      L4.formNov=await p.evaluate(()=>{ const e=document.querySelector('#placeCards .editor'), x=e&&e.querySelector('.eb-live'); return x?x.innerText.replace(/\s+/g,' ').trim():null; });
      await p.evaluate(()=>{ const x=document.querySelector('#placeCards .editor .eb-cancel'); if(x) x.click(); });
      const addV=async(book,mode,odds)=>p.evaluate(async([book,mode,odds])=>{ document.querySelector('.tab[data-view="v-add"]').click(); const d=document.getElementById('addBetPanel'); if(!d.open){ d.open=true; d.dispatchEvent(new Event('toggle')); }
        for(let i=0;i<30 && !document.querySelector('#abHost .editor');i++) await new Promise(r=>setTimeout(r,100));
        const h=document.getElementById('abHost'), bs=h.querySelector('.eb-book'); bs.value=book; bs.dispatchEvent(new Event('change',{bubbles:true})); await new Promise(r=>setTimeout(r,200));
        const md=h.querySelector('.eb-mode'); md.value=mode; md.dispatchEvent(new Event('change',{bubbles:true})); await new Promise(r=>setTimeout(r,200));
        const m=document.getElementById('abMore'); if(m) m.open=true; const c=document.getElementById('abCover'); c.value='69'; c.dispatchEvent(new Event('input',{bubbles:true}));
        const o=h.querySelector('.eb-odds'); o.value=odds; o.dispatchEvent(new Event('input',{bubbles:true})); await new Promise(r=>setTimeout(r,500));
        const v=document.getElementById('abVerdict'); return v?[...v.querySelectorAll(':scope > *')].map(x=>x.innerText.replace(/\s+/g,' ').trim()).filter(Boolean):null; }, [book,mode,odds]);
      L4.add=await addV('Kalshi','odds','-163'); L4.addNov=await addV('Novig','odds','-163');
      L4.C=C; }
    await ctx.close(); }
  // ---- L2 checks
  const PH=[360,390,414], ALLW=[360,390,414,768,900,1000,1280,1960];
  for(const theme of ['light','dark']){ const T=L2[theme].T;
    check('L2 '+theme+': Bet log › edit on a phone (360, 390, 414 px): every field (Book, Enter as, Odds, Stake, To win, Total payout, the check line, Game day, Placed at, Cover %, the Real money box, the result buttons, Save, Cancel) inside the part of the table you can see; no sideways page scroll',
      PH.every(W=>T[W].left && T[W].left.n>20 && !T[W].left.out.length && !T[W].left.side && T[W].left.has.book && T[W].left.has.mode && T[W].left.has.cover && T[W].left.has.money), PH.map(W=>[W, T[W].left&&T[W].left.n, T[W].left&&T[W].left.out.slice(0,4)]));
    check('L2 '+theme+': the same at 768, 900, 1000, 1280 and 1960 px (the Real money box ran 18 to 19 px past the edge from 390 to 1000 px)', [768,900,1000,1280,1960].every(W=>T[W].left && !T[W].left.out.length && !T[W].left.side), [768,900,1000,1280,1960].map(W=>[W, T[W].left&&T[W].left.out.slice(0,3)]));
    check('L2 '+theme+': with the table scrolled to its buttons (where edit is, on a phone) the form opens in view at every width, not off to the left', ALLW.every(W=>T[W].right && !T[W].right.out.length && !T[W].right.side) && PH.every(W=>T[W].right.sl>300), ALLW.map(W=>[W, T[W].right&&T[W].right.sl, T[W].right&&T[W].right.out.slice(0,3)]));
    check('L2 '+theme+': a Kalshi bet in % (Cost, Price, Max payout) with its book bet ID: every field inside at every width', ALLW.every(W=>T[W].kal && !T[W].kal.out.length && !T[W].kal.side), ALLW.map(W=>[W, T[W].kal&&T[W].kal.out.slice(0,3)])); }
  { const B=L2.light.before; check('L2 the bug, with the v5.11 rule out: at 390 px '+(B?B.out.length:'?')+' parts of the form were off the screen (Book, Enter as, Odds, Stake, Cover %, the Real money box)', L2.light.nOff===1 && B && B.out.length>=5 && B.out.some(x=>/Book/.test(x.x)) && B.out.some(x=>/eb-money/.test(x.x)), B&&B.out.slice(0,8)); }
  check('L2 the board and + Add a bet are not touched: their form rows have no width cap and are not sticky', L3.other && L3.other.ab && L3.other.ab.maxW==='none' && L3.other.ab.pos==='static', L3.other);
  // ---- L3 checks
  for(const W of [1280,390]){ const X=L3[W]; if(!X){ check('L3 '+W+' px measured', false, null); continue; }
    const same=(a,b,keys)=>keys.every(k=>a&&b&&a[k]&&b[k]&&Math.abs(a[k].w-b[k].w)<0.6);
    check('L3 '+W+' px: + Add a bet’s Odds, Stake, To win and Total payout boxes are as wide as in Bet log › edit and I bet this (border-box like them)', same(X.add,X.log,['.eb-odds','.eb-stake','.eb-win-o','.eb-tot-o']) && same(X.add,X.card,['.eb-odds','.eb-stake','.eb-win-o','.eb-tot-o']) && Object.values(X.add).every(v=>v.bs==='border-box'), {add:X.add, log:X.log, card:X.card});
    check('L3 '+W+' px: in % mode Cost, @ and Pays back as wide as in I bet this', same(X.addPct,X.cardPct,['.eb-cost','.eb-pct','.eb-win']), {add:X.addPct, card:X.cardPct});
    check('L3 '+W+' px: no other form changes with the rule (I bet this, the + Add a bet fields above the form, the parlay form); with it out only + Add a bet’s boxes move'+(W===1280?' (Stake 18 px wider: the bug)':''),
      X.n3===1 && JSON.stringify(X.otherNow)===JSON.stringify(X.otherOff) && X.otherNow.card.length>3 && X.otherNow.grid.length>5 && X.otherNow.parlay.length>5 && (W!==1280 || (X.addOff['.eb-stake'].w-X.addNow['.eb-stake'].w>17 && X.addOff['.eb-odds'].w-X.addNow['.eb-odds'].w>17)), {now:X.addNow, off:X.addOff}); }
  // ---- L4 checks
  { const C=L4.C, q=Math.min(0.69, 0.66+C.w*(0.69-0.66)), mx=mostAt(q,C.eMin,C.kal/100), X=(mx*100).toFixed(1), N=Math.floor(mx*100+1e-9);
    const q2=0.69, mx2=mostAt(q2,C.eMin,C.kal/100), X2=(mx2*100).toFixed(1), N2=Math.floor(mx2*100+1e-9);
    const k=L4.kal||{};
    check('L4 Kalshi card: "OK to '+X+'% ('+N+'¢ limit)" over the strip’s "Limit '+N+'¢" (one number in ¢, worked out by hand: her chance '+(q*100).toFixed(2)+'%, the smooth fee, the '+(C.eMin*100)+'% floor)', k.pick==='Over 1.5 price 62.0% · OK to '+X+'% ('+N+'¢ limit)' && /Limit \d+¢/.test(k.line||'') && (k.line||'').includes('Limit '+N+'¢'), k);
    check('L4 Kalshi card: the hover text says why ("On Kalshi that is a '+N+'¢ limit: Kalshi takes whole cents, so '+X+'% rounds down.")', (k.tip||'').endsWith('you can pay up to '+X+'% after its fee and still clear your floor on that. On Kalshi that is a '+N+'¢ limit: Kalshi takes whole cents, so '+X+'% rounds down.'), k.tip);
    check('L4 the v5.05 strip is unchanged: On Kalshi YES · Shares · Limit '+N+'¢ · Max cost; Limit price '+N+'¢ the maximum; Maximum cost $… At the current 62¢ ask about $…; the OK up to tile '+N+'¢',
      /^on kalshi yes shares \d+\.\d\d limit \d+¢ max cost \$\d+\.\d\d$/.test((k.line||'').toLowerCase()) && new RegExp('3 · Limit price '+N+'¢ the maximum: La Contadora\'s most, never higher').test(k.how||'') && /Then check Maximum cost \$\d+\.\d\d At the current 62¢ ask about \$\d+\.\d\d · Max payout \$\d+\.\d\d/.test(k.how||'') && (k.tile||'').startsWith('OK UP TO '+N+'¢'), {line:k.line, tile:k.tile});
    check('L4 Novig card unchanged: "OK to N%" (its own fee) with no limit words', L4.nov && /^Over 1\.5 price 62\.0% · OK to \d+\.\d%$/.test(L4.nov.pick||'') && !/limit/i.test(L4.nov.tip||''), L4.nov&&L4.nov.pick);
    const f=L4.form||{};
    check('L4 I bet this on the Kalshi card: "… shares at a limit of '+N+'¢ …" and the live line "pay up to '+X+'% max (a '+N+'¢ limit on Kalshi: whole cents, rounded down) ✓ 62.0% is OK": the same limit', new RegExp('shares at a limit of '+N+'¢').test(f.rec||'') && (f.live||'').includes('pay up to '+X+'% max (a '+N+'¢ limit on Kalshi: whole cents, rounded down) ✓ 62.0% is OK'), f);
    check('L4 I bet this on the Novig card: "pay up to N% max" as before, no limit words', /pay up to \d+\.\d% max/.test(L4.formNov||'') && !/limit/.test(L4.formNov||''), L4.formNov);
    const a=L4.add||[], ai=a.findIndex(x=>x.startsWith('Pay up to '+X2+'%'));
    check('L4 + Add a bet, Kalshi at −163 (cover 69%): "… shares at a limit of '+N2+'¢", "Pay up to '+X2+'% …" and under it "On Kalshi that is the '+N2+'¢ limit above: Kalshi takes whole cents, so '+X2+'% rounds down."',
      a.some(x=>new RegExp('shares at a limit of '+N2+'¢').test(x)) && ai>=0 && a[ai+1]==='On Kalshi that is the '+N2+'¢ limit above: Kalshi takes whole cents, so '+X2+'% rounds down.', a.slice(0,5));
    check('L4 + Add a bet at Novig: no Kalshi line', (L4.addNov||[]).some(x=>/^Pay up to/.test(x)) && !(L4.addNov||[]).some(x=>/On Kalshi/.test(x)), (L4.addNov||[]).slice(0,4)); }
  // ================= L5: the chosen Reports period, light and dark, five schemes =================
  const L5={};
  for(const theme of ['light','dark']){
    const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:1000,height:900}}); await ctx.clock.install({time:new Date(NOW)});
    await ctx.addInitScript(([L,th])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.theme',th); localStorage.setItem('mbev.log',JSON.stringify(L)); }catch(e){} }, [LOG,theme]);
    const p=await stubbed(ctx);
    await p.evaluate(()=>document.querySelector('.tab[data-view="v-reports"]').click()); await p.waitForTimeout(600);
    for(const pal of ['green','blue','red','purple','graphite']){
      const col=()=>p.evaluate(pal=>{ document.documentElement.setAttribute('data-palette',pal); const b=document.querySelector('#rpPer button[data-p="month"]'); b.click(); const x=document.querySelector('#rpPer button.on'), s=getComputedStyle(x); return {on:x.dataset.p, fg:s.color, bg:s.backgroundColor, w:s.fontWeight}; }, pal);
      const now=await col(); const n=await p.evaluate(re=>window.__off(re), L5_RULE); const off=await col();
      L5[theme+'/'+pal]={now, off, n, rNow:ratio(rgb(now.fg),rgb(now.bg)), rOff:ratio(rgb(off.fg),rgb(off.bg))};
      await p.reload(); await p.waitForTimeout(1300); await p.evaluate(OFF); await p.evaluate(()=>document.querySelector('.tab[data-view="v-reports"]').click()); await p.waitForTimeout(500); }
    await ctx.close(); }
  const pals=['green','blue','red','purple','graphite'];
  check('L5 dark: the chosen period button (Month) is 4.5:1 or more in every scheme (from its computed colours)', pals.every(x=>L5['dark/'+x].now.on==='month' && L5['dark/'+x].rNow>=4.5), pals.map(x=>[x, +L5['dark/'+x].rNow.toFixed(2)]));
  check('L5 dark, the bug: with the v5.11 rule out it was white on the light accent colour, under 3:1 in every scheme ('+L5['dark/green'].rOff.toFixed(2)+':1 in the green one)', pals.every(x=>L5['dark/'+x].n===1 && L5['dark/'+x].rOff<3 && L5['dark/'+x].off.bg!==L5['dark/'+x].now.bg), pals.map(x=>[x, L5['dark/'+x].off.bg, +L5['dark/'+x].rOff.toFixed(2)]));
  check('L5 light unchanged: the same colours with or without the rule, 4.5:1 or more', pals.every(x=>L5['light/'+x].now.fg===L5['light/'+x].off.fg && L5['light/'+x].now.bg===L5['light/'+x].off.bg && L5['light/'+x].rNow>=4.5), pals.map(x=>[x, L5['light/'+x].now.bg, +L5['light/'+x].rNow.toFixed(2)]));
  check('no page errors', !errs.length, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
