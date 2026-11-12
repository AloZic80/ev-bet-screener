// node tests/awol-test.js — v4.81 (Alonzo, Thu 11/12, the Collin Gillespie card, Novig −135, "⚠ Novig did not find this exact game", still under
// 💪 Machín: "Why is this still under Machín and it says Novig sentinels can't find it? Those go either on OLD or a AWOL category / Tab if they can't be
// found anymore"). 👻 AWOL: a card whose own book said it cannot find the bet on the last check (a 🦑 Sentinels press, the open check, a tap on the
// price) is listed under 👻 AWOL, whatever its chance; a check that finds it sends it back. Busy, not mapped or a Draw are on our side: not AWOL.
// Listing only: the stake stays; it is not counted in "to bet now".
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,700)); };
const NOW=Date.parse('2026-11-12T19:00:00Z'), DAY='2026-11-12', TIP=Date.parse('2026-11-13T02:00:00Z'), iso=ms=>new Date(ms).toISOString();
const T=(ha,abbr,loc,nick)=>({ha,id:abbr,abbr,name:loc+' '+nick,loc,nick,logo:'',rec:'',color:'333333',alt:'ffffff'});
const GI={state:'pre',startISO:iso(TIP),eventId:'401900',timeCT:'',detail:'',teams:[T('away','CHA','Charlotte','Hornets'),T('home','PHX','Phoenix','Suns')]};
const am=p=>p>=0.5?String(Math.round(-100*p/(1-p))):'+'+Math.round(100*(1-p)/p);
const row=(id,name,team,market,book,price,c,extra)=>Object.assign({name,team,game:'CHA @ PHX',matchup:'CHA @ PHX',side:'O',sport:'NBA',market,kind:'prop',book,offeredRaw:am(price),offeredProb:price,fairProb:c,fairRaw:'',mktProb:c,stars:3,evModel:'market',
  gameInfo:GI,src:'api:NBA:props',apiKey:id,loadedAt:iso(NOW-60e3)},extra||{});
// La Contadora = c (model = market): 64% at 58% (Novig, no fee): EV +10.3%, 💪 Machín
const ROWS=[row('g','Collin Gillespie','PHX','1.5 Threes','Novig',0.58,0.64), row('b','Devin Booker','PHX','2.5 Threes','Novig',0.58,0.64), row('m','Miles Bridges','CHA','1.5 Threes','Novig',0.58,0.64)];
(async()=>{ const b=await chromium.launch();
  for(const W of [1280,390,1000,1960]){
    const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:W,height:1000}}); await ctx.clock.install({time:new Date(NOW)});
    await ctx.addInitScript(([R,d])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig',bank:'500',cfgVer:3.03})); localStorage.setItem('mbev.cards','1'); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows:R})); }catch(e){} },[ROWS,DAY]);
    const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    const ANS={};   // what Novig answers, by player name
    await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
      if(/\/live\?/.test(u)){ const bets=JSON.parse(decodeURIComponent(u.split('bets=')[1])), R={}; bets.forEach(d=>{ const a=ANS[d.name]; R[d.id]=a==='found'?{ok:true, src:'novig', price:0.58, bid:0.56, at:Date.now(), outcome:'o-'+d.name}:a||{ok:true, src:'novig', price:0.58, bid:0.56, at:Date.now(), outcome:'o-'+d.name}; }); return r.fulfill({contentType:'application/json',body:JSON.stringify({results:R})}); }
      if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
    await p.goto('http://app.test/'); await p.waitForTimeout(1300);
    const tabs=()=>p.evaluate(()=>[...document.querySelectorAll('#modeBar button')].map(x=>x.textContent.replace(/\s+/g,' ').trim()));
    const press=async()=>{ await p.evaluate(async()=>{ await shopExchanges(); }); await p.waitForTimeout(400); };
    const t0=await tabs();
    if(W===1280) check('seven tabs: 👻 AWOL after ⏱ Old, 0 at first; the three bets under 💪 Machín', t0.length===7 && /^👻 AWOL 0$/.test(t0[6]) && /^💪 Machín 3$/.test(t0[1]), t0);
    // a 🦑 press: Novig cannot find Gillespie's market; Booker is busy (our side); Bridges is found
    ANS['Collin Gillespie']={ok:false, note:'Novig: no market at your line'}; ANS['Devin Booker']={ok:false, busy:true, note:'Novig: busy — too many markets to read in one go, try again in a minute'};
    await press();
    const t1=await tabs();
    const s1=await p.evaluate(()=>({g:modeFamOf(lastRows.find(r=>r.apiKey==='g')), b:modeFamOf(lastRows.find(r=>r.apiKey==='b')), stake:+lastRows.find(r=>r.apiKey==='g').stake, count:(document.getElementById('count')||{}).textContent||''}));
    if(W===1280){
      check('Novig says "no market at your line" for Gillespie: he moves to 👻 AWOL (1), 💪 Machín 2; "busy" is our side: Booker stays', /^👻 AWOL 1$/.test(t1[6]) && /^💪 Machín 2$/.test(t1[1]) && s1.g==='awol' && s1.b==='safe', {t1, s1});
      check('listing only: Gillespie keeps his stake; the big number counts only what you can bet now (2)', s1.stake>0 && /^2$/.test(s1.count.trim()), s1);
      const pw=await p.evaluate(()=>[...document.querySelectorAll('#cuts .pass-where .cut-list > div')].map(x=>x.textContent.trim()));
      check('"N elsewhere ▸" says where he is: "1 in 👻 AWOL: the book could not find them on its last check, look at the book first"', pw.includes('1 in 👻 AWOL: the book could not find them on its last check, look at the book first'), pw);
      await p.evaluate(()=>setMode('awol')); await p.waitForTimeout(400);
      const v=await p.evaluate(()=>{ const t=x=>x?x.textContent.replace(/\s+/g,' ').trim():null; const c=[...document.querySelectorAll('#placeCards .sc-card')].find(x=>/Collin Gillespie/.test(x.textContent));
        return {cards:[...document.querySelectorAll('#placeCards .sc-card')].length, pill:c?t(c.querySelector('.sc-pill.awol')):null, head:t(document.querySelector('#placeCards .pc-head')), lc:t(document.getElementById('contadora'))}; });
      check('👻 AWOL lists his card with the reason: "👻 AWOL · Novig: no market at your line (…)"', v.cards===1 && /^👻 AWOL · Novig: no market at your line \(\d+s ago\)$/.test(v.pill||''), v);
      const lab=await p.evaluate(()=>{ const c=[...document.querySelectorAll('#placeCards .sc-card')].find(x=>/Collin Gillespie/.test(x.textContent)); return {ring:((c&&c.querySelector('.sc-ringb'))||{}).textContent||'', top:!!(c&&/#1 MATH PICK/.test(c.textContent)), betNow:!!(c&&/BET NOW/.test(c.textContent))}; });
      check('v4.82: his card never says BET NOW or #1 MATH PICK while the book cannot find it (the ring itself stays: the six checks are frozen)', !lab.betNow && !lab.top && (!lab.ring || /👻 AWOL · look at the book first/.test(lab.ring)), lab);
      check('its Place these and La Contadora say: look at the book first; a Sentinels press that finds it sends it back', /👻 not found at the book/.test(v.head||'') && /the book could not find these on its last check\. Look at the book first/.test(v.head||'') && /The book could not find these on its last check/.test(v.lc||''), v);
      // Novig finds it again: back to 💪 Machín
      ANS['Collin Gillespie']='found'; ANS['Devin Booker']='found'; await press(); await p.evaluate(()=>setMode('safe')); await p.waitForTimeout(300);
      const t2=await tabs();
      check('a press that finds him sends him back: 💪 Machín 3, 👻 AWOL 0', /^💪 Machín 3$/.test(t2[1]) && /^👻 AWOL 0$/.test(t2[6]), t2);
      // the open check after a load ("no market at your line" there sets exClosed): it was the Started group; now 👻 AWOL
      await p.evaluate(()=>{ const r=lastRows.find(x=>x.apiKey==='m'); r.exClosed='Novig: no market at your line'; refresh(); }); await p.waitForTimeout(300);
      const t3=await tabs(), m3=await p.evaluate(()=>modeFamOf(lastRows.find(r=>r.apiKey==='m')));
      const b3=await p.evaluate(()=>{ setMode('awol'); const r=lastRows.find(x=>x.apiKey==='m'); return {stake:+r.stake, hidden:document.getElementById('cHideStarted').checked}; }); await p.evaluate(()=>setMode('safe'));
      check('the open check that finds his market closed (v2.97: no money for a market with no seller, unchanged) lists Bridges under 👻 AWOL, not 💪 Machín; with no stake he is not a card, so the AWOL number stays 0', m3==='awol' && /^👻 AWOL 0$/.test(t3[6]) && /^💪 Machín 2$/.test(t3[1]) && b3.stake===0, {t3, m3, b3});
      await p.evaluate(()=>{ delete lastRows.find(x=>x.apiKey==='m').exClosed; refresh(); }); await p.waitForTimeout(300);
      // a tap on the price: Novig does not find it → 👻 AWOL; "not mapped" (our side) does not
      ANS['Collin Gillespie']={ok:false, note:'Novig: no market at your line'};
      await p.evaluate(()=>{ window.open=()=>({location:{href:''}, close(){}}); });   // the slip window (not needed here)
      await p.evaluate(()=>{ const c=[...document.querySelectorAll('#placeCards .sc-card')].find(x=>/Collin Gillespie/.test(x.textContent)); c.querySelector('.sc-price').click(); }); await p.waitForTimeout(1500);
      const t4=await tabs(), g4=await p.evaluate(()=>modeFamOf(lastRows.find(r=>r.apiKey==='g')));
      check('your tap on the price: Novig "did not find this exact game" → the card moves to 👻 AWOL (Alonzo’s case)', g4==='awol' && /^👻 AWOL 1$/.test(t4[6]), {t4, g4});
      const nm=await p.evaluate(()=>({mapped:awolNote('Novig: league not mapped'), busy:awolNote('Novig: busy — too many markets'), draw:awolNote('Draw: not read (only the two teams are matched)'), tell:awolNote('Novig: couldn\'t tell which outcome is yours'), gone:awolNote('Kalshi lists X at 2.5+ — not your 1.5'), listed:awolNote('Polymarket: Collin Gillespie not listed'), game:awolNote('Kalshi: game not found (KXNBAGAME)')}));
      check('what counts: not mapped, busy, a Draw, "could not tell" and (v4.81, Los Chismosos) "game not found" are our side, not AWOL; not listed and the line moved are AWOL', !nm.mapped && !nm.busy && !nm.draw && !nm.tell && !nm.game && nm.gone && nm.listed, nm);
      const held=await p.evaluate(()=>{ const r=lastRows.find(x=>x.apiKey==='g'); return rowAwol(Object.assign({}, r, {prior:{tier:''}})); });
      check('a bet you already hold is never AWOL (it stays where it is)', held===false, held); }
    const over=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth), bar=await p.evaluate(()=>{ const r=document.getElementById('modeBar').getBoundingClientRect(); return {w:Math.round(r.width), right:Math.round(r.right), btns:[...document.querySelectorAll('#modeBar button')].every(x=>{ const q=x.getBoundingClientRect(); return q.right<=innerWidth+1 && q.left>=-1; })}; });
    check(W+' px: seven tabs on screen (they wrap), no sideways scroll', over<=0 && bar.btns, {over, bar});
    check('no page errors ('+W+')', !errs.length, errs); await ctx.close(); }
  await b.close(); console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(fail?1:0); })();
