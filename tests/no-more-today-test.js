// node tests/no-more-today-test.js — v4.79 (Los Chismosos, the v4.78 review): "No more today" must mean the day's Hail Marys (3) or near-misses (5)
// are used. A Hail Mary candidate can also be held back by the long-shot moneyline allowance (3 a game day, one a game, in every mode). v4.78 read
// that cap as "you have used today's Hail Marys" and said "🔮 no more today (3 a day)" with none used. Text only: no stake or offer changes.
// La Contadora by hand (as in scope-v468): model 42%, market 38%: min(0.42, 0.38 + 0.35 × 0.04) = 39.4% (a long-shot moneyline, under 45%).
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,700)); };
const NOW=Date.parse('2026-11-09T19:00:00Z'), DAY='2026-11-09', TIP=Date.parse('2026-11-10T02:30:00Z'), iso=ms=>new Date(ms).toISOString();
const T=(ha,abbr)=>({ha,id:abbr,abbr,name:abbr+' Team',loc:abbr,nick:'Team',logo:'',rec:'',color:'333333',alt:'ffffff'});
const am=p=>p>=0.5?String(Math.round(-100*p/(1-p))):'+'+Math.round(100*(1-p)/p);
const ml=(id,team,opp,price,fair,mkt)=>({name:team,team,game:team+' @ '+opp,matchup:team+' @ '+opp,side:'',sport:'NFL',market:'Moneyline',kind:'moneyline',book:'Novig',offeredRaw:am(price),offeredProb:price,fairProb:fair,fairRaw:'',mktProb:mkt,stars:null,evModel:'market',
  gameInfo:{state:'pre',startISO:iso(TIP),eventId:'7700'+id,timeCT:'',detail:'',teams:[T('away',team),T('home',opp)]},src:'api:NFL:lines',apiKey:id,loadedAt:iso(NOW-60e3)});
// A (36%, EV +9.44%) and C (37.5%, +5.07%) take the 2nd and 3rd long-shot moneylines today (one is logged). X: +400 (20%), model 21%, market 19%:
// La Contadora min(0.21, 0.19 + 0.35 × 0.02) = 19.7%, EV −1.5%: under the floor, so it is a Hail Mary candidate, held back by the 3-a-day allowance.
const ROWS=[ml('A','NYJ','MIA',0.36,0.42,0.38), ml('C','KCC','LVR',0.375,0.42,0.38), ml('X','DEN','LAC',0.20,0.21,0.19)];
const LOG=[{id:'old',key:'old',sport:'NFL',kind:'moneyline',name:'NEP',team:'NEP',game:'BUF @ NEP',market:'Moneyline',betnow:'NEP ML',book:'Novig',odds:'+150',fair:'',stake:1,date:DAY,dateSet:true,start:iso(TIP),result:'pending',snap:{at:iso(NOW-3600e3),act:0.40,market:0.37,policy:'act-v2',screener:'v4.67'}}];
(async()=>{ const b=await chromium.launch();
  for(const W of [1280,390]){
    const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:W,height:1000}}); await ctx.clock.install({time:new Date(NOW)});
    await ctx.addInitScript(([R,d,L])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig',bank:'500',cfgVer:3.03})); localStorage.setItem('mbev.cards','1');
      localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows:R})); localStorage.setItem('mbev.log',JSON.stringify(L)); }catch(e){} },[ROWS,DAY,LOG]);
    const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
    await p.goto('http://app.test/'); await p.waitForTimeout(1300);
    await p.evaluate(()=>setMode('clair')); await p.waitForTimeout(300);
    const look=()=>p.evaluate(()=>{ const r=k=>lastRows.find(x=>x.apiKey===k)||{}, X=r('X');
      return {A:+(r('A').stake||0).toFixed(2), C:+(r('C').stake||0).toFixed(2), X:{xc:X.xc||null, cap:!!X.xCap, day:!!X.xCapDay, why:X.xWhy||'', stake:+(X.stake||0)},
        info:((document.getElementById('contadora')||{}).textContent||'').replace(/\s+/g,' ').trim(), page:/No more today/i.test((document.getElementById('placeCards')||{}).textContent||'')}; });
    const v=await look();
    check(W+' px: A and C take the 2nd and 3rd long-shot moneylines today ($1.00 each); X (+400, EV −1.5%) is a Hail Mary candidate held back by that allowance', v.A===1 && v.C===1 && v.X.xc==='hail' && v.X.cap && /^LONG-SHOT ML: 3 a game day and one a game/.test(v.X.why) && v.X.stake===0, v);
    check(W+' px: no Hail Mary is used today, so Brujo does not say "no more today"; v4.80 (Los Chismosos): it names what holds the long shot back: "🔮 long-shot moneyline limit used (3 a game day, one a game)"', !v.X.day && /🔮 long-shot moneyline limit used \(3 a game day, one a game\)/.test(v.info) && !/no more today/i.test(v.info) && !v.page, v.info);
    if(W===1280){
      // three Hail Marys logged today: now the day's count is used too, and "no more today (3 a day)" is right
      await p.evaluate(()=>{ for(let i=0;i<3;i++) addToLog(Object.assign({}, lastRows.find(x=>x.apiKey==='X'), {name:'Used '+i, team:'U'+i, game:'U'+i+' @ V'+i, matchup:'U'+i+' @ V'+i, apiKey:'h'+i, kind:'prop', market:'0.5 Goals', side:'O', tier:'hail', stake:1})); refresh(); }); await p.waitForTimeout(400);
      const w=await look();
      check('three Hail Marys logged today: X is held back by the day count too, and Brujo says "🔮 no more today (3 a day), 3 of 3 used today"', w.X.day && /🔮 no more today \(3 a day\), 3 of 3 used today/.test(w.info), w); }
    check('no page errors ('+W+')', !errs.length, errs); await ctx.close(); }
  await b.close(); console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(fail?1:0); })();
