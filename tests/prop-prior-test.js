// node tests/prop-prior-test.js — v4.39. Alonzo, 11/9: "I made this bet but it still shows as bettable on the app. That is a crucial fix."
// The Sentinels card: Jonathan Lekkerimaki (VAN) Over 1.5 Shots, Novig -108, Philadelphia @ Vancouver 8:30 PM CT. His Novig fill is logged by
// autoAddFromDesc in Novig's words: "Jonathan Lekkerimäki", "1.5 Shots On Goal". coreKey (exact text) missed it, so the card stayed in Place these.
// Same player (accents, case, an initial), the same stat family, line and side, the same game → ALREADY BET. A different line, the Under,
// another player with the same last name, or the same prop tomorrow are not.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const NOW=Date.parse('2026-11-09T19:00:00Z'), H=3600e3, iso=ms=>new Date(ms).toISOString(), DAY='2026-11-09';
const TIP=Date.parse('2026-11-10T02:30:00Z');   // 8:30 PM CT
const T=(ha,abbr,loc,nick)=>({ha,id:abbr,abbr,name:loc+' '+nick,loc,nick,logo:'',rec:'',color:'333333',alt:'ffffff'});
const GI=start=>({state:'pre',startISO:iso(start),timeCT:'',detail:'',teams:[T('away','PHI','Philadelphia','Flyers'),T('home','VAN','Vancouver','Canucks')]});
const prop=(id,name,market,side,start,extra)=>Object.assign({name,team:'VAN',game:'PHI @ VAN',matchup:'PHI @ VAN',side,sport:'NHL',market,kind:'prop',book:'Novig',offeredRaw:'-108',offeredProb:0.519,fairProb:0.555,fairRaw:'-125',mktProb:0.526,stars:4,evModel:'projection',projValue:2.1,
  gameInfo:GI(start),src:'api:NHL:props',apiKey:id,loadedAt:iso(NOW-60e3)},extra||{});
// what autoAddFromDesc logs from the Novig fill (v3.89): Novig's player name and stat words
const FILL={id:'nv1',key:'nv1',name:'Jonathan Lekkerimäki',sport:'NHL',kind:'prop',market:'1.5 Shots On Goal',side:'O',team:null,game:'PHI @ VAN',matchup:'PHI @ VAN',book:'Novig',odds:'-110',offeredRaw:'-110',offeredProb:0.524,stake:2.17,fee:0,
  date:DAY,dateSet:true,gameInfo:{state:'pre',startISO:iso(TIP+2*60e3),teams:[]},start:iso(TIP+2*60e3),autoFrom:'novig',fills:['f1'],fillBook:'novig',fillRef:'abc123',fillSide:'yes',placedAt:iso(NOW-H),snap:{at:iso(NOW-H)}};
const ROWS=[prop('r1','Jonathan Lekkerimaki','1.5 Shots','O',TIP),               // the card in the screenshot: this is the bet
            prop('r2','Jonathan Lekkerimaki','2.5 Shots','O',TIP,{offeredRaw:'+170',offeredProb:0.37,fairProb:0.42}),   // another line: not this bet
            prop('r3','Jonathan Lekkerimaki','1.5 Shots','U',TIP,{offeredRaw:'+120',offeredProb:0.455,fairProb:0.5}),    // the Under: the other side
            prop('r4','Nils Lekkerimaki','1.5 Shots','O',TIP),                    // another player, same last name
            prop('r5','Jonathan Lekkerimaki','1.5 Shots','O',TIP+48*H)];          // the same prop in another game
(async()=>{
  const b=await chromium.launch();
  const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:1280,height:900}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(([L,R,d])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.log',JSON.stringify(L)); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig, Kalshi',cfgVer:3.03})); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows:R})); }catch(e){} }, [[FILL],ROWS,DAY]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/api\.0xbeta\.dev/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'});
    if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1300);
  const st=await p.evaluate(()=>lastRows.map(r=>({k:r.apiKey, prior:!!r.prior, flags:(r.flags||[]).filter(f=>f[0]==='dupe'||f[0]==='warn').map(f=>f[1]).join(' | ')})));
  const g=k=>st.find(x=>x.k===k)||{};
  check('Lekkerimaki Over 1.5 Shots (the card) is ALREADY BET: your Novig fill says "Lekkerimäki", "1.5 Shots On Goal", -110', g('r1').prior && /ALREADY BET at -110/.test(g('r1').flags), g('r1'));
  check('Over 2.5 Shots is not already bet (another line)', !g('r2').prior, g('r2'));
  check('the Under 1.5 is not already bet, and says it is the other side', !g('r3').prior && /this is the other side/.test(g('r3').flags), g('r3'));
  check('Nils Lekkerimaki is another player: not already bet', !g('r4').prior, g('r4'));
  check('the same prop in another game (2 days later) is not already bet', !g('r5').prior, g('r5'));
  const cards=await p.evaluate(()=>[...document.querySelectorAll('#placeCards .sc-card')].map(c=>c.getAttribute('data-pck')||c.innerText.slice(0,80)));
  const inPlace=await p.evaluate(()=>[...document.querySelectorAll('#placeCards .sc-card')].some(c=>/Jonathan Lekkerimaki/.test(c.textContent) && /Over 1\.5/.test(c.textContent) && !/2\.5/.test(c.textContent) && /Today/.test(c.textContent)));
  check('the card is gone from Place these', !inPlace, cards);
  // the same check from the page's own helper, for the ways books write names and stats
  const h=await p.evaluate(()=>{ const r={name:'Jonathan Lekkerimaki',market:'1.5 Shots',side:'O',sport:'NHL',kind:'prop'}, L=(name,market,side,o)=>Object.assign({name,market,side,sport:'NHL',kind:'prop'},o||{});
    return {initial:propSame(L('J. Lekkerimaki','1.5 SOG','O'),r), caps:propSame(L('JONATHAN LEKKERIMÄKI','1.5 shots on goal','O'),r), period:propSame(L('Jonathan Lekkerimaki','1.5 1st Period Shots','O'),r), pp:propSame(L('Jonathan Lekkerimaki','0.5 Power Play Points','O'),{name:'Jonathan Lekkerimaki',market:'0.5 Points',side:'O',sport:'NHL',kind:'prop'}), nba:propSame(L('Jonathan Lekkerimaki','1.5 Shots','O',{sport:'NBA'}),r), goals:propSame(L('Jonathan Lekkerimaki','1.5 Goals','O'),r)}; });
  check('"J. Lekkerimaki 1.5 SOG" and "JONATHAN LEKKERIMÄKI 1.5 shots on goal" are the same bet; 1st-period shots, power-play points, goals and another sport are not', h.initial && h.caps && !h.period && !h.pp && !h.nba && !h.goals, h);
  check('no page errors', !errs.length, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
