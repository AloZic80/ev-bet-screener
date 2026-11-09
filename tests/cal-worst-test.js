// node tests/cal-worst-test.js — v4.08, Alonzo's November (screenshot, 11/6): Fri 11/6 had 14 bets playing and none settled, and the
// calendar showed it red −$32.24 and called it the worst day. "Worst is only REAL DATA ... the worst day in history." Now money in play
// is grey and never a loss; best and worst are settled days only, with their date; and the worst day ever is shown too.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const NOW=Date.parse('2026-11-07T04:00:00Z');   // Fri 11/6, 10 PM CT
const at=(d,h)=>new Date(d+'T'+String(h).padStart(2,'0')+':00:00-06:00').toISOString();
let k=0; const bet=(d,o)=>Object.assign({id:'b'+(++k),key:'b'+k,sport:'NBA',kind:'prop',book:'Novig',odds:'+100',stake:10,date:d,dateSet:true,manual:true,game:'LAL @ BOS',name:'P'+k,side:'O',market:'10.5 Points',betnow:'O 10.5 +100',start:at(d,18),snap:{at:at(d,12)}},o);
const won=(d,pl)=>bet(d,{stake:10,towin:pl,result:'win',gradedBy:'manual'}), lost=(d,st)=>bet(d,{stake:st,result:'loss',gradedBy:'manual'});
const LOG=[won('2026-11-01',9.39), lost('2026-11-02',9.54), won('2026-11-03',1.20), won('2026-11-04',20.88), won('2026-11-05',24.20),
  bet('2026-11-06',{stake:32.24, start:at('2026-11-06',19)}),           // playing
  bet('2026-11-06',{stake:2.60, start:at('2026-11-06',23)}),            // not started yet
  lost('2026-10-20',50)];                                                // the worst day ever (October)
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:1400,height:1000}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(L=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.log',JSON.stringify(L)); }catch(e){} }, LOG);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1200); await p.evaluate(()=>document.querySelector('.tab[data-view="v-perf"]').click())   /* v4.29: under its main tab now */; await p.waitForTimeout(400);
  const c=await p.evaluate(()=>{ const cell=d=>{ const e=document.querySelector('.cal-c[data-day="'+d+'"]'); return {cls:e.className, v:e.querySelector('.v').innerText.replace(/\s+/g,' ')}; };
    return {fri:cell('2026-11-06'), big:document.getElementById('calToday').innerText.replace(/\s+/g,' '), month:document.getElementById('calMonthTot').innerText, foot:document.getElementById('calFoot').innerText.replace(/\s+/g,' ')}; });
  check('Fri 11/6 (playing, nothing settled): grey $34.84, not red, no L', !/ l\b| w\b/.test(c.fri.cls) && / tp\b/.test(c.fri.cls) && /\$34\.84/.test(c.fri.v), c.fri);
  check('the top: $34.84 in grey today · $32.24 in play · $2.60 to play (no −$32.24)', !/−\$32\.24/.test(c.big) && /\$32\.24 in play/.test(c.big) && /\$2\.60 to play/.test(c.big), c.big);
  check('the month counts settled days only: +$46.13', /\+\$46\.13/.test(c.month), c.month);
  check('best day +$24.20 (Thu 11/5), worst −$9.54 (Mon 11/2): real results only', /Best day \+\$24\.20 Thu, 11\/5/.test(c.foot) && /worst −\$9\.54 Mon, 11\/2/.test(c.foot), c.foot);
  check('ever: best +$24.20 (Thu 11/5) · worst −$50.00 (Tue 10/20), over your whole history', /Ever: best \+\$24\.20 Thu, 11\/5 · worst −\$50\.00 Tue, 10\/20/.test(c.foot), c.foot);
  check('days: 4 up · 1 down (Friday is not counted yet)', /4 up · 1 down/.test(c.foot), c.foot);
  for(const w of [1280,390]){ await p.setViewportSize({width:w,height:1000}); await p.waitForTimeout(200);
    const sp=await p.evaluate(()=>{ const bad=[]; document.querySelectorAll('.cal-c.has').forEach(c=>{ const r=c.getBoundingClientRect(); c.querySelectorAll('.v, .v *').forEach(e=>{ const q=e.getBoundingClientRect(); if(q.width && (q.right>r.right+0.5 || q.left<r.left-0.5)) bad.push(c.dataset.day+': '+e.textContent); }); }); return bad; });
    check('at '+w+' px wide, every day amount fits its box (+$20.88, +$24.20, $34.84)', !sp.length, sp); }
  check('no page errors', !errs.length, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
