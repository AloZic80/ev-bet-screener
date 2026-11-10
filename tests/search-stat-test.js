// node tests/search-stat-test.js — v4.59 (Alonzo: "I want to be able to search by sacks"): the board's search box also matches the stat,
// in the source's words ("0.5 Defense Sacks" from SportsGameOdds, "Defensive Sacks" from BettingPros) and in the short words on the card ("Sacks", "Rec Yds").
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,500)); };
const NOW=Date.parse('2026-11-10T19:00:00Z'), iso=ms=>new Date(ms).toISOString(), KO=Date.parse('2026-11-11T01:15:00Z');
const T=(ha,abbr)=>({ha,id:abbr,abbr,name:abbr+' Team',loc:abbr,nick:'Team',logo:'',rec:'',color:'333333',alt:'ffffff'});
const row=(id,name,market,g,book,src)=>({name,team:'A'+g,game:'A'+g+' @ H'+g,matchup:'A'+g+' @ H'+g,side:'O',sport:'NFL',market,kind:'prop',book,offeredRaw:'+120',offeredProb:0.4545,fairProb:0.52,fairRaw:'-108',mktProb:0.51,stars:4,evModel:'projection',projValue:1,gameInfo:{state:'pre',startISO:iso(KO+g*60e3),eventId:'50500'+g,timeCT:'',detail:'',teams:[T('away','A'+g),T('home','H'+g)]},src,apiKey:id,loadedAt:iso(NOW-60e3)});
const R=[row('s1','Sack Man','0.5 Defense Sacks',1,'Bovada','api:sgo:NFL'), row('s2','Edge Rusher','0.5 Defensive Sacks',2,'DraftKings','api:NFL:props'), row('r1','Wide Out','62.5 Receiving Yards',3,'Bovada','api:sgo:NFL')];
(async()=>{ const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:1280,height:900}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(([R])=>{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Bovada, DraftKings',bank:'500',cfgVer:3.03})); localStorage.setItem('mbev.cards','0'); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:'2026-11-10',rows:R})); },[R]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1300);
  const q=async t=>p.evaluate(t=>{ const i=document.getElementById('filterPlayer'); i.value=t; i.dispatchEvent(new Event('input',{bubbles:true})); return lastRows.filter(r=>passesSearch(r)).map(r=>r.apiKey).sort().join(','); }, t);
  const ph=await p.evaluate(()=>document.getElementById('filterPlayer').placeholder);
  check('the search box says what it searches: "Search player, team or stat…"', ph==='Search player, team or stat…', ph);
  check('"sack" finds both sacks bets (SportsGameOdds "Defense Sacks" and BettingPros "Defensive Sacks") and not the receiving yards', (await q('sack'))==='s1,s2', await q('sack'));
  check('"Defensive Sacks" finds the BettingPros one', (await q('Defensive Sacks'))==='s2', await q('Defensive Sacks'));
  check('"rec yds" (the short words on the card) finds Receiving Yards', (await q('rec yds'))==='r1', await q('rec yds'));
  check('the player and the team still work: "wide" and "A1"', (await q('wide'))==='r1' && (await q('A1 @'))==='s1', [await q('wide'), await q('A1 @')]);
  check('an empty box shows all three', (await q(''))==='r1,s1,s2', await q(''));
  check('no page errors', !errs.length, errs);
  await b.close(); console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(fail?1:0); })();
