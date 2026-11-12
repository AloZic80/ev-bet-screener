// node tests/fill-prior-test.js — v4.25. Alonzo, 11/8: "I made this bet hours ago, yet it does not show I made a bet on that play. Not the same
// price, but it should not allow me, or should say that I already made a bet." A Novig "CHI Winner" fill ($1.23 → $5.72, PHI @ CHI 2:35 PM)
// is logged by autoAddFromDesc with name "CHI", team "CHI" and no game text; the Sentinels card says "Chicago Bulls · Moneyline · Novig +388,
// Philadelphia @ Chicago, 2:30 PM". The card (and the row) must say ALREADY BET; the same team's game on another day must not.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const NOW=Date.parse('2026-11-08T19:00:00Z'), H=3600e3, M=60e3, iso=ms=>new Date(ms).toISOString(), DAY='2026-11-08';   // 1 PM CT
const TIP=Date.parse('2026-11-08T20:30:00Z');   // 2:30 PM CT on the board; Novig says 2:35
// the bet as autoAddFromDesc logs a Novig moneyline fill (v3.89): name = team code, no game, kickoff from the book
const FILL_BET={id:'nv1',key:'nv1',name:'CHI',sport:'NBA',kind:'moneyline',market:'Moneyline',side:'',team:'CHI',game:'',matchup:'',book:'Novig',odds:'+365',offeredRaw:'+365',offeredProb:0.215,stake:1.23,fee:0,
  date:DAY,dateSet:true,gameDay:DAY,gameInfo:{state:'pre',startISO:iso(TIP+5*M),teams:[]},autoFrom:'novig',fills:['f1'],fillQty:5.72,fillCost:1.23,fillBook:'novig',fillRef:'2c91fd9d6593',fillOutcome:'o-chi',placedAt:iso(NOW-2*H),snap:{at:iso(NOW-2*H)}};
const T=(ha,abbr,loc,nick)=>({ha,id:abbr,abbr,name:loc+' '+nick,loc,nick,logo:'',rec:'',color:'333333',alt:'ffffff'});
const ml=(name,team,game,start,book,away,home,extra)=>Object.assign({name,team,game,matchup:game,side:'',sport:'NBA',market:'Moneyline',kind:'moneyline',book,offeredRaw:'+388',offeredProb:0.205,fairProb:0.235,fairRaw:'',mktProb:0.23,stars:4,evModel:'market',
  gameInfo:{state:'pre',startISO:iso(start),timeCT:'',detail:'',teams:[T('away',away[0],away[1],away[2]),T('home',home[0],home[1],home[2])]},src:'api:NBA:moneyline',loadedAt:iso(NOW-60e3)},extra||{});
const ROWS=[ml('Chicago Bulls','Chicago Bulls','Philadelphia 76ers @ Chicago Bulls',TIP,'Novig',['PHI','Philadelphia','76ers'],['CHI','Chicago','Bulls'],{apiKey:'g1'}),   // full names, as The Odds API writes them
            ml('CHI','CHI','CHI @ MIL',TIP+24*H,'Novig',['CHI','Chicago','Bulls'],['MIL','Milwaukee','Bucks'],{apiKey:'g2'}),   // the Bulls again tomorrow: not this bet
            ml('Philadelphia 76ers','Philadelphia 76ers','Philadelphia 76ers @ Chicago Bulls',TIP,'Novig',['PHI','Philadelphia','76ers'],['CHI','Chicago','Bulls'],{apiKey:'g3', offeredRaw:'-550', offeredProb:0.846, fairProb:0.765, mktProb:0.77})];   // the other side of your game, priced like one
(async()=>{
  const b=await chromium.launch();
  const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:1280,height:900}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(([L,R,d])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.log',JSON.stringify(L)); localStorage.setItem('mbev.cfg',JSON.stringify({books:['Novig','Kalshi']})); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows:R})); }catch(e){} }, [[FILL_BET],ROWS,DAY]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/api\.0xbeta\.dev/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'});
    if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1200);
  await p.evaluate(()=>setMode('clair')); await p.waitForTimeout(300);   /* v4.74: these sample bets are approved long shots (under 45%), listed under Clairvoyant */
  const st=await p.evaluate(()=>lastRows.map(r=>({name:r.name, prior:!!r.prior, flags:(r.flags||[]).filter(f=>f[0]==='dupe'||f[0]==='warn').map(f=>f[1]).join(' | ')})));
  const chi=st.find(x=>x.name==='Chicago Bulls'), tmrw=st.find(x=>x.name==='CHI'), phi=st.find(x=>/76ers/.test(x.name));
  check('the Bulls moneyline today at Novig is ALREADY BET (your Novig fill: name "CHI", no game text, a different price), with the price you got', chi && chi.prior && /ALREADY BET at \+365/.test(chi.flags), chi);
  check('the Bulls tomorrow are not (another game)', tmrw && !tmrw.prior, tmrw);
  check('the 76ers in your game: the OTHER side warning, not already bet', phi && !phi.prior && /OTHER side/.test(phi.flags), phi);
  const card=await p.evaluate(()=>{ const c=[...document.querySelectorAll('#placeCards .sc-card, #placeCards .pcard')].find(x=>/Chicago Bulls/.test(x.textContent)); return c?c.innerText.replace(/\s+/g,' ').slice(0,200):null; });
  const row=await p.evaluate(()=>{ const rows=[...document.querySelectorAll('#tbody tr')]; const t=rows.find(x=>x.classList.contains('dupe') && /Chicago Bulls/.test(x.textContent)), g=rows.find(x=>x.classList.contains('group-row') && /ALREADY BET/.test(x.textContent)); return {dupe:!!t, group:g?g.innerText.replace(/\s+/g,' '):null, stat:(document.querySelector('.statbox')||{}).innerText||''}; });
  check('so the Place these card is gone and the row sits under Already bet (the count says 1 already bet)', card===null && row.dupe && /1 already bet/.test(row.stat.replace(/\s+/g,' ')), {card, row});
  check('no page errors', !errs.length, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
