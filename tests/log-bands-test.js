// node tests/log-bands-test.js — v4.66 (Alonzo: "I want to be able to click on the betting range for example or tell on the log which ones are classified
// as unlikely, coin flip, etc, but after the bet or on the log"): every single in the Bet log shows its cover band (from the fair odds saved with it); a
// tap on a band, in the log or in the Bet result study, shows only that band's bets with their record, how often they won against how often they should
// have, and the profit. Checked on a computer and on a phone. Numbers by hand.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,700)); };
const NOW=Date.parse('2026-11-11T18:00:00Z'), H=3600e3, iso=ms=>new Date(ms).toISOString(), DAY='2026-11-11';
const bet=(id,o)=>Object.assign({id,key:id,sport:'NBA',kind:'prop',book:'Novig',odds:'+100',stake:2,date:DAY,dateSet:true,manual:true,game:'LAL @ BOS',name:'Player '+id,side:'O',market:'10.5 Points',betnow:'O 10.5 +100',snap:{at:iso(NOW-5*H)},start:iso(NOW-4*H)},o);
// fair odds by hand: +150 → 100/250 = 40.0% (Unlikely); +120 → 100/220 = 45.5% (Coin Flip); -138 → 138/238 = 58.0% (Slight Lean); -150 → 150/250 = 60.0% (Lean)
const LOG=[bet('u1',{fair:'+150',odds:'+200',result:'win',gradedBy:'manual'}), bet('u2',{fair:'+150',odds:'+200',result:'loss',gradedBy:'manual'}), bet('u3',{fair:'+150',odds:'+200',result:'loss',gradedBy:'manual'}),
  bet('c1',{fair:'+120',odds:'+130',result:'loss',gradedBy:'manual'}), bet('s1',{fair:'-138',odds:'-108',result:'win',gradedBy:'manual'}), bet('l1',{fair:'-150',odds:'-120',result:'pending',start:iso(NOW+5*H)}),
  bet('nf',{fair:'',odds:'+100',result:'loss',gradedBy:'manual'}),
  {id:'pl1',key:'pl1',kind:'parlay',date:DAY,dateSet:true,start:null,name:'Parlay · 2 picks',sport:'PARLAY',market:'2-pick parlay',book:'Kalshi',odds:'+250',fair:'',stake:2,result:'pending',closing:''}];
async function open(b,W){ const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:W,height:1000}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(L=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.log',JSON.stringify(L)); }catch(e){} }, LOG);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1300); await p.evaluate(()=>document.querySelector('.tab[data-view="v-log"]').click()); await p.waitForTimeout(300); return {ctx,p,errs}; }
const rowsShown=p=>p.evaluate(()=>[...document.querySelectorAll('#logBody tr:not(.log-day)')].filter(t=>!t.hidden && t.getBoundingClientRect().height>0).map(t=>{ const c=t.querySelector('button.lbf'); return {name:(t.querySelector('.pick')||{}).textContent, band:c?c.textContent:null, vis:c?c.getBoundingClientRect().height>0:null}; }));
(async()=>{ const b=await chromium.launch();
  for(const W of [1280,390]){ let {ctx,p,errs}=await open(b,W);
    let R=await rowsShown(p); const by=Object.fromEntries(R.map(r=>[r.name,r.band]));
    check(W+' px: every single in the Bet log shows its band, worked by hand from its fair odds (+150 = 40% Unlikely, +120 = 45.5% Coin Flip, −138 = 58% Slight Lean, −150 = 60% Lean; none saved = "no band"); the parlay has none', by['Player u1']==='Unlikely' && by['Player c1']==='Coin Flip' && by['Player s1']==='Slight Lean' && by['Player l1']==='Lean' && by['Player nf']==='no band' && by['Parlay · 2 picks']===null && R.filter(r=>r.band).every(r=>r.vis), by);
    await p.click('#logBody button.lbf[data-band="1"]'); await p.waitForTimeout(250);
    R=await rowsShown(p); const f=await p.evaluate(()=>document.getElementById('logFilter').textContent.replace(/\s+/g,' ').trim());
    // by hand: Unlikely = 3 bets, 1–2; expected 40% each; won 1 of 2 decided? no: 1 win, 2 losses → 33% vs 40%. Profit: +$4.00 (2 at +200) − $2 − $2 = $0.00
    check(W+' px: a tap on "Unlikely" shows only the three Unlikely bets, with "3 bets · 1–2–0 · won 33% vs 40% expected · +$0.00"', R.length===3 && R.every(r=>r.band==='Unlikely') && /Unlikely/.test(f) && /3 bets · 1–2–0 · won 33% vs 40% expected · \+\$0\.00/.test(f), {R, f});
    await p.click('#logFilterOff'); await p.waitForTimeout(200);
    R=await rowsShown(p);
    check(W+' px: "show all" brings every bet back', R.length===8, R.length);
    await p.evaluate(()=>{ document.querySelector('.tab[data-view="v-perf"]').click(); }); await p.waitForTimeout(400);
    const st=await p.evaluate(()=>[...document.querySelectorAll('#studyRows tr')].map(t=>[...t.querySelectorAll('td')].map(d=>d.textContent.replace(/\s+/g,' ').trim()).slice(0,6)));
    const un=st.find(r=>/^Unlikely/.test(r[0])), ns=st.find(r=>/no cover saved/.test(r[0]));
    check(W+' px: the Bet result study counts 3 Unlikely bets at a 40.0% average and the bet with no fair odds under "no cover saved" (it was counted as Unlikely at 0%)', un && un[1]==='3' && un[4]==='40.0%' && ns && ns[1]==='1', {un, ns});
    await p.evaluate(()=>{ const s=document.querySelector('#studyRows button.lbf[data-band="4"]'); s.scrollIntoView(); }); await p.click('#studyRows button.lbf[data-band="4"]'); await p.waitForTimeout(400);
    R=await rowsShown(p); const f2=await p.evaluate(()=>({f:document.getElementById('logFilter').textContent.replace(/\s+/g,' ').trim(), view:document.body.dataset.view}));
    check(W+' px: in Performance › Bet result study, a tap on "Slight Lean" opens the Bet log with only that band: "1 bet · 1–0–0 · won 100% vs 58% expected · +$1.85"', f2.view==='v-log' && R.length===1 && R[0].band==='Slight Lean' && /1 bet · 1–0–0 · won 100% vs 58% expected · \+\$1\.85/.test(f2.f), {R, f2});
    await p.click('#logBody button.lbf[data-band="4"]'); await p.waitForTimeout(200);
    check(W+' px: tapping the same band again in the log shows everything again', (await rowsShown(p)).length===8, null);
    const over=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
    if(W===390) check('phone: no sideways scroll', over<=0, over);
    check('no page errors ('+W+')', !errs.length, errs); await ctx.close(); }
  await b.close(); console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(fail?1:0); })();
