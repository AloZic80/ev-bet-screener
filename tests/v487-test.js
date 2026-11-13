// node tests/v487-test.js — v4.87 (agreed with Sally, owner "Build" Fri 11/13; Alonzo: "Why don't these have bands?"): a book fill that matched no
// board card has no forecast, so no cover band. It gets an ENTRY PRICE BAND: the win rate its price needed to break even, fee included
// (cost ÷ payout: an exchange pays $1 a share, so cost ÷ shares). A price, not a forecast: never in fair, cover or the snapshot, never in the
// calibration, the forecast bands, EV or the Scorecard. Its own table in Performance.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,700)); };
const NOW=Date.parse('2026-11-13T19:00:00Z'), iso=ms=>new Date(ms).toISOString(), H=3600e3;
const bet=(id,o)=>Object.assign({id,key:id,sport:'NHL',kind:'prop',book:'Novig',stake:4.52,date:'2026-11-12',dateSet:true,game:'',name:'P '+id,side:'O',market:'2.5 SOG',betnow:'O 2.5 -113',snap:{at:iso(NOW-30*H)},start:iso(NOW-24*H),result:'pending'},o);
// Dahlin: 8 shares for $4.52 = 56.5% (Slight Lean). Diabate: −147 with no fill numbers = 59.5% (Slight Lean). Holloway: a loss at 59.3%.
// Seguin matched a card: his fair −120 (54.5%) is a forecast band (On the Line), never an entry price.
const LOG=[bet('d1',{name:'Rasmus Dahlin', odds:'-113', autoFrom:'novig', fillCost:4.52, fillQty:8, result:'win', gradedBy:'espn'}),
  bet('d2',{name:'Moussa Diabate', market:'0.5 Blk', odds:'-147', autoFrom:'novig', stake:2.94, result:'win', gradedBy:'espn'}),
  bet('d3',{name:'Dylan Holloway', side:'U', odds:'-146', autoFrom:'novig', fillCost:5.93, fillQty:10, stake:5.93, result:'loss', gradedBy:'espn'}),
  bet('s1',{name:'Tyler Seguin', market:'1.5 Shots', odds:'-104', fair:'-120', autoFrom:'novig', fillCost:5.1, fillQty:10, result:'win', gradedBy:'espn'}),
  bet('h1',{name:'Typed Bet', odds:'+120', manual:true, result:'win', gradedBy:'manual'})];
(async()=>{ const b=await chromium.launch();
  for(const W of [1280,390]){
    const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:W,height:1000}}); await ctx.clock.install({time:new Date(NOW)});
    await ctx.addInitScript(L=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.log',JSON.stringify(L)); }catch(e){} }, LOG);
    const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
    await p.goto('http://app.test/'); await p.waitForTimeout(1300);
    const v=await p.evaluate(()=>{ const by=n=>logged.find(x=>x.name===n), chip=n=>{ const t=document.createElement('div'); t.innerHTML=logBandChip(by(n)); return t.textContent; };
      return {d1:chip('Rasmus Dahlin'), d2:chip('Moussa Diabate'), d3:chip('Dylan Holloway'), s1:chip('Tyler Seguin'), h1:chip('Typed Bet'),
        fair:['Rasmus Dahlin','Moussa Diabate','Dylan Holloway'].map(n=>[by(n).fair||null, by(n).cover||null, (by(n).snap||{}).market??null]),
        cal:calibrationPoints?calibrationPoints(logged).length:null}; });
    if(W===1280){
      check('Dahlin (8 shares for $4.52): "ENTRY PRICE · 56.5% · Slight Lean · no forecast"', v.d1==='ENTRY PRICE · 56.5% · Slight Lean · no forecast', v.d1);
      check('Diabate (−147, no fill numbers): the price itself, 59.5%', v.d2==='ENTRY PRICE · 59.5% · Slight Lean · no forecast', v.d2);
      check('Seguin matched a card (fair −120): his forecast band "On the Line", not an entry price', v.s1==='On the Line', v.s1);
      check('a bet you typed (not a fill) with no cover keeps "no band"', v.h1==='no band', v.h1);
      check('nothing is written into fair, cover or the snapshot’s market chance', v.fair.every(x=>x.every(y=>y===null)), v.fair);
      // Performance: its own table; not in the cover bands' calibration
      await p.evaluate(()=>{ document.querySelector('.tab[data-view="v-perf"]').click(); }); await p.waitForTimeout(500);
      const t=await p.evaluate(()=>({hidden:document.getElementById('entryPanel').hidden, rows:[...document.querySelectorAll('#entryRows tr')].map(r=>[...r.children].map(c=>c.textContent.replace(/\s+/g,' ').trim())), head:document.querySelector('#entryPanel h2').textContent}));
      check('Performance › Entry-price bands: "price benchmark, not forecast calibration"; Slight Lean: 3 tickets, 2–1–0, average break-even 58.4%, hit rate 66.7%', !t.hidden && /price benchmark, not forecast calibration/.test(t.head) && t.rows.length===1 && t.rows[0][0].startsWith('Slight Lean') && t.rows[0][1]==='3' && t.rows[0][3]==='2–1–0' && t.rows[0][4]==='58.4%' && t.rows[0][5]==='66.7%', t);
      const cal=await p.evaluate(()=>{ const pts=calibrationPoints(logged); return pts.length; });
      check('the calibration counts only Seguin (the one forecast): the entry prices never enter it', cal===1, cal);
    } else {
      const s=await p.evaluate(()=>{ document.querySelector('.tab[data-view="v-log"]').click(); return new Promise(r=>setTimeout(()=>{ const c=[...document.querySelectorAll('.ep-chip')][0]; const rc=c&&c.getBoundingClientRect(); r({n:document.querySelectorAll('.ep-chip').length, fits:!!rc && rc.right<=innerWidth+1, sideways:document.documentElement.scrollWidth>innerWidth}); }, 500)); });
      check('390 px: the Bet log shows the entry-price chips, inside the screen, no sideways scroll', s.n>=3 && s.fits && !s.sideways, s);
    }
    check('no page errors ('+W+')', !errs.length, errs); await ctx.close(); }
  await b.close(); console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(fail?1:0); })();
