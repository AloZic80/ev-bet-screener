// node tests/v484-test.js — v4.84 (agreed with Sally, owner "BUILD" Thu 11/12; from "Bet As If You're Wrong"): the estimated fee-adjusted synthetic
// hold, a LABEL only. Best price on each side of the same exact market at the books you bet, fees in: H = Σ p·(1+fee) − 1. Both sides read within
// 10 minutes and within 5 minutes of each other; missing or stale: no number. Underround: CHECK. Saved on new bets. Never changes a stake.
// Gillespie Over 1.5 Threes at Novig 55% and Under at Novig 47% (no Novig fee before the game): 0.55 + 0.47 − 1 = 2.0%.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,700)); };
const NOW=Date.parse('2026-11-12T19:00:00Z'), DAY='2026-11-12', TIP=Date.parse('2026-11-13T02:00:00Z'), iso=ms=>new Date(ms).toISOString();
const T=(ha,abbr,loc,nick)=>({ha,id:abbr,abbr,name:loc+' '+nick,loc,nick,logo:'',rec:'',color:'333333',alt:'ffffff'});
const GI={state:'pre',startISO:iso(TIP),eventId:'401900',timeCT:'',detail:'',teams:[T('away','CHA','Charlotte','Hornets'),T('home','PHX','Phoenix','Suns')]};
const am=p=>p>=0.5?String(Math.round(-100*p/(1-p))):'+'+Math.round(100*(1-p)/p);
const row=(id,o)=>Object.assign({name:'Collin Gillespie',team:'PHX',game:'CHA @ PHX',matchup:'CHA @ PHX',side:'O',sport:'NBA',market:'1.5 Threes',kind:'prop',book:'Novig',fairRaw:'',stars:3,evModel:'market',
  gameInfo:GI,src:'api:NBA:props',apiKey:id,loadedAt:iso(NOW-60e3)},o,{offeredRaw:am(o.offeredProb)});
const ROWS=[row('o',{offeredProb:0.55, fairProb:0.64, mktProb:0.64}), row('u',{side:'U', offeredProb:0.47, fairProb:0.36, mktProb:0.36}),
  row('dk',{side:'U', book:'DraftKings', offeredProb:0.40, fairProb:0.36, mktProb:0.36}),   // not one of his books: never counted
  row('mp',{name:'PHX', team:'PHX', side:'', kind:'moneyline', market:'Moneyline', offeredProb:0.60, fairProb:0.66, mktProb:0.66}), row('mc',{name:'CHA', team:'CHA', side:'', kind:'moneyline', market:'Moneyline', offeredProb:0.43, fairProb:0.34, mktProb:0.34}),
  row('tq',{name:'Total', team:'', side:'O', kind:'total', market:'? Total', offeredProb:0.5, fairProb:0.5, mktProb:0.5}), row('tu',{name:'Total', team:'', side:'U', kind:'total', market:'? Total', offeredProb:0.5, fairProb:0.5, mktProb:0.5}),   // no line: no market
  row('sx',{name:'ARS', team:'ARS', game:'ARS @ CHE', matchup:'ARS @ CHE', side:'', sport:'SOCCER', kind:'moneyline', market:'Moneyline', offeredProb:0.40, fairProb:0.46, mktProb:0.46})];
(async()=>{ const b=await chromium.launch();
  for(const W of [1280,390]){
    const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:W,height:1000}}); await ctx.clock.install({time:new Date(NOW)});
    await ctx.addInitScript(([R,d])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig,Kalshi',bank:'500',cfgVer:3.03})); localStorage.setItem('mbev.cards','1'); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows:R})); }catch(e){} },[ROWS,DAY]);
    const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
      if(/\/live\?/.test(u)){ const bets=JSON.parse(decodeURIComponent(u.split('bets=')[1])), R={};
        bets.forEach(d=>{ const k=d.book==='kalshi', O=d.side!=='U'; R[d.id]=(d.kind!=='prop')?{ok:false, note:'no live source for this book'}:{ok:true, src:d.book, price:k?(O?0.56:0.46):(O?0.55:0.47), bid:k?(O?0.55:0.44):(O?0.53:0.45), at:new Date(NOW+5000).toISOString(), outcome:'o', title:'t'}; });
        return r.fulfill({contentType:'application/json',body:JSON.stringify({results:R})}); }
      if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
    await p.goto('http://app.test/'); await p.waitForTimeout(1300);
    const look=()=>p.evaluate(()=>{ const g=k=>lastRows.find(r=>r.apiKey===k)||{}; return {o:g('o').sh||null, oTxt:shText(g('o')), oStake:+(+g('o').stake||0).toFixed(2), mp:shText(g('mp')), sx:g('sx').sh||null, tq:g('tq').sh||null}; });
    const ev=(f)=>p.evaluate(f).then(()=>p.waitForTimeout(300));
    if(W===1280){
      const v0=await look();
      check('Over at Novig 55% + Under at Novig 47%: "Hold 2.0% · O Novig -122 · U Novig +113" (DraftKings 40% is not one of his books, so it never counts)', v0.o && v0.o.ok && Math.abs(v0.o.feeAdjusted-0.02)<1e-9 && v0.oTxt==='Hold 2.0% · O Novig -122 · U Novig +113', v0);
      check('a moneyline in a sport with no draw is two-way: PHX 60% + CHA 43% = 3.0%; a soccer moneyline (three-way) gets no tag', /^Hold 3\.0% · PHX Novig -150 · CHA Novig \+133$/.test(v0.mp) && v0.sx===null, {mp:v0.mp, sx:v0.sx});
      const card=await p.evaluate(()=>{ const c=[...document.querySelectorAll('#placeCards .sc-card')].find(x=>/Collin Gillespie/.test(x.textContent)&&/Threes/.test(x.textContent)); const s=c&&c.querySelector('.sc-pill.sh'); return s?{t:s.textContent, cls:s.className}:null; });
      check('the card shows the tag ("standard" band, 2 to 4%)', card && card.t==='Hold 2.0% · O Novig -122 · U Novig +113' && /\bstd\b/.test(card.cls), card);
      // a 🦑 press: Kalshi quotes add both sides at the same moment (the Under at 1 − the Over's bid), fees in
      await p.evaluate(async()=>{ await shopExchanges(); }); await p.waitForTimeout(500);
      const v1=await look();
      const kU=0.45*(1+0.0695*0.55);   // Kalshi Under from the Over's bid 55¢, with Kalshi's fee
      check('after a press: the best Under is Kalshi 45¢ (1 − the Over’s 55¢ bid), fee in: Hold '+((0.55+kU-1)*100).toFixed(1)+'% ("low" band, under 2%); the quoted hold before fees is kept', v1.o && v1.o.ok && Math.abs(v1.o.feeAdjusted-(0.55+kU-1))<1e-4 && Math.abs(v1.o.quoted-0.00)<1e-4 && /U Kalshi 45¢$/.test(v1.oTxt), v1);
      // label only: the stake never moves with the hold
      const s0=v1.oStake;
      await ev(()=>{ lastRows.forEach(r=>{ /* every row: the press read Novig for the DraftKings row too (Novig is his book) */ delete r._shopQ; delete r._openQ; delete r._altQ; delete r.shop; delete r._liveAt; delete r.priceAt; }); lastRows.find(x=>x.apiKey==='u').loadedAt=new Date(Date.now()-8*60e3).toISOString(); refresh(); });
      const v2=await look();
      check('Over read 1 minute ago, Under 8 minutes ago: more than 5 minutes apart, so no number ("Hold —")', v2.o && !v2.o.ok && /more than 5 minutes apart/.test(v2.o.why), v2.o);
      await ev(()=>{ lastRows.find(x=>x.apiKey==='u').loadedAt=new Date(Date.now()-20*60e3).toISOString(); refresh(); });
      const v3=await look();
      check('the Under read 20 minutes ago: "the other side has no price read in the last 10 minutes"', v3.o && !v3.o.ok && /other side has no price read in the last 10 minutes/.test(v3.o.why), v3.o);
      await ev(()=>{ const u=lastRows.find(x=>x.apiKey==='u'); u.loadedAt=new Date(Date.now()-60e3).toISOString(); u.offeredProb=0.43; u.offeredRaw='+133'; refresh(); });
      const v4=await look();
      check('Under 43% + Over 55% = −2.0%: "UNDERROUND · CHECK, not a bet · Hold −2.0%"', v4.o && v4.o.ok && /^UNDERROUND · CHECK, not a bet · Hold −2\.0% · /.test(v4.oTxt), v4.oTxt);
      check('a label only: the Over’s stake is the same whatever the hold (fresh, stale, underround)', v2.oStake===s0 && v3.oStake===s0 && v4.oStake===s0, {s0, v2:v2.oStake, v3:v3.oStake, v4:v4.oStake});
      const snap=await p.evaluate(()=>{ addToLog(lastRows.find(x=>x.apiKey==='o')); const b=logged[logged.length-1]; return b.snap && b.snap.syntheticHold; });
      check('a new bet keeps the hold when taken: type, quoted, fee-adjusted, both sides (book, price, time), policy synthetic-hold-v1', snap && snap.type==='two_way' && snap.policy==='synthetic-hold-v1' && snap.sides.length===2 && snap.sides.every(x=>x.book && x.price && x.observedAt) && Math.abs(snap.feeAdjusted+0.02)<1e-9, snap);
      check('Los Chismosos: a total with no line ("? Total") is no market: no tag', v0.tq===null, v0.tq);
      await ev(()=>{ const u=lastRows.find(x=>x.apiKey==='u'); u._gi=u.gameInfo; u.gameInfo=Object.assign({}, u.gameInfo, {startISO:new Date(Date.parse(u.gameInfo.startISO)+864e5).toISOString()}); refresh(); });
      const d1=await look();
      check('Los Chismosos: the same teams the next day are another game: their Under never pairs with tonight’s Over', d1.o && !d1.o.ok, d1.o);
      await ev(()=>{ const u=lastRows.find(x=>x.apiKey==='u'); u.gameInfo=u._gi; delete u._gi; refresh(); });
      await p.clock.fastForward(11*60e3); await p.waitForTimeout(200);
      const x1=await p.evaluate(()=>shText(lastRows.find(x=>x.apiKey==='o')));
      check('Los Chismosos: with the page left open, a hold whose prices are now over 10 minutes old reads "Hold —"', /^Hold — · /.test(x1), x1);
    } else {
      const L=await p.evaluate(()=>{ const c=[...document.querySelectorAll('#placeCards .sc-card')].find(x=>/Collin Gillespie/.test(x.textContent)&&/Threes/.test(x.textContent)), s=c&&c.querySelector('.sc-pill.sh'), r=s&&s.getBoundingClientRect(), cr=c&&c.getBoundingClientRect();
        return {t:s?s.textContent:null, inside:!!(r&&cr&&r.right<=cr.right+1&&r.left>=cr.left-1), sideways:document.documentElement.scrollWidth>innerWidth}; });
      check('390 px: the tag fits inside the card, no sideways scroll', L.t && L.inside && !L.sideways, L);
    }
    check('no page errors ('+W+')', !errs.length, errs); await ctx.close(); }
  await b.close(); console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(fail?1:0); })();
