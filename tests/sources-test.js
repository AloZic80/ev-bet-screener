// node tests/sources-test.js — the data sources row is back on the main page, and every sport gets through:
// The Odds API lists leagues by sport (soccer worldwide, fighting, cricket, rugby…) and takes any key you type
// (a tennis tournament); a Draw makes a market 3-way in any sport; the Sportsbook API keeps a league it does not
// know instead of dropping it. The Worker and ESPN are stubbed; no credits are spent.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const now=Date.now(), H=3600e3, iso=ms=>new Date(ms).toISOString();
const SOURCES={sources:[{id:'bettingpros',name:'BettingPros',key:true,free:'50 a day'},{id:'oddsapi',name:'The Odds API',key:true,loads:true,free:'500 credits'},
  {id:'sbapi',name:'Sportsbook API',key:true,loads:true,free:'150 a day'},{id:'sgo',name:'SportsGameOdds',key:true,loads:true,free:'2,500 games'}]};
const bk=(key,title,mk)=>({key,title,markets:mk});
const h2h=(outs)=>({key:'h2h',outcomes:outs.map(([name,price])=>({name,price}))});
const ODDS={
  soccer_netherlands_eredivisie:[{id:'e1',commence_time:iso(now+30*H),home_team:'Ajax',away_team:'AZ Alkmaar',bookmakers:[
    bk('pinnacle','Pinnacle',[h2h([['Ajax',-120],['AZ Alkmaar',+300],['Draw',+280]])]),
    bk('novig','Novig',[h2h([['Ajax',+105],['AZ Alkmaar',+290],['Draw',+270]])])]}],
  tennis_atp_paris_masters:[{id:'t1',commence_time:iso(now+20*H),home_team:'Jannik Sinner',away_team:'Carlos Alcaraz',bookmakers:[
    bk('pinnacle','Pinnacle',[h2h([['Jannik Sinner',-110],['Carlos Alcaraz',-102]])]),
    bk('novig','Novig',[h2h([['Jannik Sinner',+110],['Carlos Alcaraz',-130]])])]}],
  boxing_boxing:[{id:'x1',commence_time:iso(now+60*H),home_team:'Fighter A',away_team:'Fighter B',bookmakers:[
    bk('pinnacle','Pinnacle',[h2h([['Fighter A',-200],['Fighter B',+180],['Draw',+2000]])]),
    bk('novig','Novig',[h2h([['Fighter A',-150],['Fighter B',+140]])]),                     // 2-way: a draw refunds — a different bet
    bk('kalshi','Kalshi',[h2h([['Fighter A',-190],['Fighter B',+175],['Draw',+1800]])])]}],
  cricket_test_match:[{id:'c1',commence_time:iso(now+40*H),home_team:'Australia',away_team:'England',bookmakers:[
    bk('pinnacle','Pinnacle',[h2h([['Australia',-105],['England',+260],['Draw',+400]])]),
    bk('novig','Novig',[h2h([['Australia',+120],['England',+250],['Draw',+380]])])]}],
};
const SB={advantages:[0,1,2].map(i=>{ const t=['WIN','WIN','DRAW'][i], pk=['p1','p2',null][i];
  return {market:{key:'m1',type:'MONEYLINE_3WAY',segment:'REGULATION_TIME',event:{startTime:iso(now+50*H),homeParticipantKey:'p1',participants:[{key:'p1',name:'Club Brugge',shortName:'BRU'},{key:'p2',name:'Anderlecht',shortName:'AND'}],
    competitionInstance:{competition:{shortName:'BEL_PRO_LEAGUE',name:'Belgian Pro League'}}}},
    outcomes:[{type:t,participantKey:pk,payout:[2.3,3.9,3.8][i],source:'NOVIG',modifier:0}],
    marketStatistics:[{type:'OUTCOME_IMPLIED_PROBABILITY_AVERAGE',subType:t,participantKey:pk,value:[44,26,30][i],modifier:0}]}; })};
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago', viewport:{width:1400,height:1000}});
  await ctx.addInitScript(()=>{ try{ if(sessionStorage.getItem('seeded')) return; sessionStorage.setItem('seeded','1'); localStorage.clear(); }catch(e){} });
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); const asked=[], espn=[];
  const J=(r,j,h)=>r.fulfill({contentType:'application/json',headers:Object.assign({'access-control-allow-origin':'*','access-control-expose-headers':'x-src-quota,x-src-cached'},h||{}),body:JSON.stringify(j)});
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/api\.0xbeta\.dev\/src\/status/.test(u)) return J(r,SOURCES);
    if(/api\.0xbeta\.dev\/src\/odds\?/.test(u)){ asked.push(decodeURIComponent(u.split('?')[1])); const k=(u.match(/[?&]sport=([^&]+)/)||[])[1]; return J(r,ODDS[decodeURIComponent(k||'')]||[],{'x-src-quota':JSON.stringify({'x-requests-remaining':'480','x-requests-last':'1'})}); }
    if(/api\.0xbeta\.dev\/src\/sbapi/.test(u)) return J(r,SB);
    if(/api\.0xbeta\.dev/.test(u)) return J(r,{});
    if(/espn\.com.*scoreboard/.test(u)){ espn.push(u.replace(/^.*sports\//,'').replace(/\/scoreboard.*$/,'')); return J(r,{events:[]}); }
    return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1500);
  const where=await p.evaluate(()=>{ const bar=document.getElementById('srcBar'); return {inHead:!!bar.closest('.head'), inSettings:!!bar.closest('#v-settings'), chips:[...bar.querySelectorAll('.src-chip')].map(c=>c.dataset.src), shown:bar.getBoundingClientRect().height>0}; });
  check('sources row is on the main page (not in Settings), one button per source', where.inHead && !where.inSettings && where.shown && ['bettingpros','oddsapi','sbapi','sgo'].every(s=>where.chips.includes(s)), where);
  check('Settings keeps only the passphrase', await p.evaluate(()=>!!document.querySelector('#v-settings #screenerPass') && !document.querySelector('#v-settings .src-chip')), true);
  await p.click('.src-chip[data-src="oddsapi"]'); await p.waitForTimeout(300);
  const menu=await p.evaluate(()=>Object.fromEntries([...document.querySelectorAll('#oaSport optgroup')].map(g=>[g.label,[...g.querySelectorAll('option')].map(o=>o.value)])));
  const n=Object.values(menu).reduce((t,a)=>t+a.length,0);
  check('The Odds API menu lists leagues by sport: '+n+' leagues', n>=60 && ['EPL','EREDIVISIE','BRASILEIRAO','ARGENTINA','JLEAGUE','LIBERTADORES','UECL'].every(c=>(menu.Soccer||[]).includes(c)) && (menu.Fighting||[]).includes('MMA') && (menu.Cricket||[]).includes('IPL') && (menu.Rugby||[]).includes('NRL'), Object.fromEntries(Object.entries(menu).map(([k,v])=>[k,v.length])));
  check('the panel opens right under the row (main page)', await p.evaluate(()=>{ const pn=document.getElementById('srcPanel'); return pn.style.display==='block' && !!pn.closest('.head'); }), true);
  const load=async(sel,typed)=>{ if(sel) await p.selectOption('#oaSport',sel); await p.fill('#oaKey',typed||''); await p.click('.oddsLoad[data-src="oddsapi"]'); await p.waitForTimeout(900); return p.textContent('#srcMsg'); };
  let m=await load('EREDIVISIE');
  const ere=await p.evaluate(()=>lastRows.filter(r=>r.sport==='EREDIVISIE').map(r=>({name:r.name,fair:+r.fairProb.toFixed(3),book:r.book,soccer:isSoccer(r.sport)})));
  check('Eredivisie loads: home, away and Draw, priced against Pinnacle with the 3-way cut removed', ere.length===3 && ere.some(x=>x.name==='Draw') && ere.every(x=>x.soccer) && Math.abs(ere.reduce((t,x)=>t+x.fair,0)-1)<0.01, {msg:m, rows:ere});
  check('it asked for the right league and ESPN for its games (game times, grading)', asked.some(q=>/sport=soccer_netherlands_eredivisie/.test(q)) && espn.includes('soccer/ned.1'), {asked:asked.slice(-1), espn:[...new Set(espn)]});
  m=await load('','tennis_atp_paris_masters');
  const ten=await p.evaluate(()=>lastRows.filter(r=>/PARIS/.test(r.sport)).map(r=>({sport:r.sport,name:r.name,kind:r.kind})));
  check('any key typed works: a tennis tournament, 2-way', ten.length===2 && ten[0].sport==='ATP_PARIS_MASTERS' && asked.some(q=>/sport=tennis_atp_paris_masters/.test(q)), {msg:m, rows:ten});
  m=await load('TESTCRICKET');
  const cr=await p.evaluate(()=>lastRows.filter(r=>r.sport==='TESTCRICKET').map(r=>r.name));
  check('a Draw makes it 3-way in any sport (Test cricket)', cr.length===3 && cr.includes('Draw'), {msg:m, rows:cr});
  m=await load('BOXING');
  const bx=await p.evaluate(()=>lastRows.filter(r=>r.sport==='BOXING').map(r=>({name:r.name,book:r.book,fair:+r.fairProb.toFixed(3)})));
  const fa=(bx.find(x=>x.name==='Fighter A')||{}).fair, pinA=(200/300)/((200/300)+(100/280)+(100/2100));   // Pinnacle's own 3-way no-vig (-200, +180, +2000)
  check('a game with a Draw is 3-way for every book: a 2-way line (draw refunds) is not mixed in or offered', bx.length>0 && bx.every(x=>x.book!=='Novig') && Math.abs(fa-pinA)<0.002 && bx.some(x=>x.name==='Draw'), {msg:m, rows:bx, pinnacleA:+pinA.toFixed(3)});
  check('a bad key is refused before any call', /characters/.test(await load('','tennis atp!')) , await p.textContent('#srcMsg'));
  await p.click('.src-chip[data-src="sbapi"]'); await p.waitForTimeout(300); await p.click('#sbLoad'); await p.waitForTimeout(900);
  const sb=await p.evaluate(()=>({msg:document.getElementById('srcMsg').textContent, out:document.getElementById('srcOut').textContent, rows:lastRows.filter(r=>r.src==='api:sbapi:ev').map(r=>({sport:r.sport,name:r.name,soccer:isSoccer(r.sport),label:SPORT_NAMES[r.sport]}))}));
  check('Sportsbook API keeps a league it does not know (Belgian Pro League), 3-way, under its own name', sb.rows.length===3 && sb.rows.every(x=>x.sport==='BEL_PRO_LEAGUE' && x.soccer && x.label==='Belgian Pro League') && !/league not set up/.test(sb.out), sb);
  // phone: the row wraps, nothing runs off the screen
  await p.setViewportSize({width:390,height:844}); await p.click('.tab[data-view="v-board"]'); await p.waitForTimeout(300);
  const ph=await p.evaluate(()=>{ const bar=document.getElementById('srcBar'), r=bar.getBoundingClientRect(); return {left:r.left, right:r.right, w:innerWidth, overflow:document.documentElement.scrollWidth>innerWidth+1}; });
  check('phone: the sources row fits the screen', ph.left>=0 && ph.right<=ph.w+1 && !ph.overflow, ph);
  check('no page errors', errs.length===0, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
