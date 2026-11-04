// node tests/pick6-lines-test.js — Parlays > Get Pick6 lines, against a stub Worker that answers like the step-2 routes
// (src=oddsapi_events, src=oddsapi_props; The Odds API's JSON passed through unchanged).
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const soon=h=>new Date(Date.now()+h*3600e3).toISOString();
const T={'BUF @ MIA':[['away','BUF','Bills','Buffalo'],['home','MIA','Dolphins','Miami']], 'HOU @ IND':[['away','HOU','Texans','Houston'],['home','IND','Colts','Indianapolis']],
  'LAR @ SEA':[['away','LAR','Rams','Los Angeles'],['home','SEA','Seahawks','Seattle']], 'ATL @ NO':[['away','ATL','Falcons','Atlanta'],['home','NO','Saints','New Orleans']]};
const H={'BUF @ MIA':5,'HOU @ IND':6,'LAR @ SEA':8,'ATL @ NO':7};
const gi=g=>({state:'pre', startISO:soon(H[g]), timeCT:'', detail:'', teams:T[g].map(([ha,abbr,nick,loc])=>({ha,abbr,name:nick,nick,loc}))});
const leg=(name,game,market,book,mkt,fair)=>({name,game,matchup:game,side:'O',sport:'NFL',market,kind:'prop',book,offeredRaw:'-119',offeredProb:0.5434,fairProb:fair,fairRaw:'-130',mktProb:mkt,stars:3,evModel:'projection',gameInfo:gi(game),src:'api:NFL:props',apiKey:name+book});
const ROWS=[ leg('Josh Allen','BUF @ MIA','245.5 Passing Yards','DraftKings',.58,.62), leg('Tyreek Hill','BUF @ MIA','71.5 Receiving Yards','DraftKings',.59,.64),
  leg('Stefon Diggs','HOU @ IND','5.5 Receptions','DraftKings',.60,.66), leg('Puka Nacua','LAR @ SEA','68.5 Receiving Yards','FanDuel',.56,.63),
  leg('Puka Nacua','LAR @ SEA','70.5 Receiving Yards','DraftKings',.62,.66), leg('Bijan Robinson','ATL @ NO','74.5 Rushing Yards','DraftKings',.57,.60) ];
// The Odds API shapes: events list, then one event's odds with bookmakers -> markets -> outcomes {name, description, point}
const EVENTS=[{id:'ev-bufmia',sport_key:'americanfootball_nfl',commence_time:soon(H['BUF @ MIA']),home_team:'Miami Dolphins',away_team:'Buffalo Bills'},
  {id:'ev-houind',sport_key:'americanfootball_nfl',commence_time:soon(H['HOU @ IND']),home_team:'Indianapolis Colts',away_team:'Houston Texans'},
  {id:'ev-larsea',sport_key:'americanfootball_nfl',commence_time:soon(H['LAR @ SEA']),home_team:'Seattle Seahawks',away_team:'Los Angeles Rams'}];   // ATL @ NO missing on purpose
const ou=(p,pt)=>[{name:'Over',description:p,point:pt},{name:'Under',description:p,point:pt}];
const PROPS={'ev-bufmia':[{key:'pick6',markets:[{key:'player_reception_yds',outcomes:ou('Tyreek Hill',71.5)}]}],                    // Hill same line; Allen not offered
  'ev-houind':[{key:'pick6',markets:[{key:'player_receptions',outcomes:ou('Stefon Diggs',6.5)}]}],                                      // Diggs at a different line
  'ev-larsea':[{key:'pick6',markets:[{key:'player_reception_yds',outcomes:ou('Puka Nacua',70.5)}]},{key:'prizepicks',markets:[{key:'player_reception_yds',outcomes:ou('Puka Nacua',68.5)}]}]};
(async()=>{ const b=await chromium.launch(); const calls=[]; let mode='ok';
  const ctx=await b.newContext({viewport:{width:1440,height:1000}});
  await ctx.addInitScript(rows=>{ try{ if(sessionStorage.getItem('seeded')) return; sessionStorage.setItem('seeded','1'); localStorage.clear(); localStorage.setItem('mbev.pk',JSON.stringify({app:'DraftKings Pick 6',play:'power',minP:0.54,oneGame:true,pays:{}}));
    const day=new Date().toLocaleDateString('en-CA',{timeZone:'America/Chicago'}); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:day,rows})); }catch(e){} }, ROWS);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/espn\.com.*scoreboard/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'});
    if(/api\.0xbeta\.dev\/src\/odds\?/.test(u)){ const q=new URL(u).searchParams; calls.push(Object.fromEntries(q));
      if(mode==='404') return r.fulfill({status:404,contentType:'application/json',body:'{"error":"not found"}'});
      const hdr={'x-src-quota':JSON.stringify({'x-requests-remaining':'331','x-requests-last':'4'}),'access-control-allow-origin':'*','access-control-expose-headers':'x-src-quota, x-src-cached'};   // like the real Worker
      if(q.get('src')==='oddsapi_events') return r.fulfill({contentType:'application/json',headers:hdr,body:JSON.stringify(EVENTS)});
      if(q.get('src')==='oddsapi_props'){ const e=EVENTS.find(x=>x.id===q.get('event')); return r.fulfill({contentType:'application/json',headers:hdr,body:JSON.stringify(Object.assign({},e,{bookmakers:PROPS[q.get('event')]||[]}))}); } }
    return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1500); await p.click('.tab[data-view="v-parlay"]'); await p.waitForTimeout(400);
  const lineCol=async n=>p.$eval('#pkPool',(t,n)=>{ const r=[...t.rows].find(x=>x.innerText.includes(n)); return r?r.cells[4].innerText.trim()+' | '+r.cells[2].innerText.trim():null; },n);
  check('before looking up: no ✓ on sportsbook lines for Pick6 (DraftKings row preferred, marked check the line)', /check the line/.test(await lineCol('Puka'))&&/70\.5/.test(await lineCol('Puka')), await lineCol('Puka'));
  const btn=await p.$eval('#pkDfs',e=>e.innerText.replace(/\s+/g,' '));
  check('button: Get Pick6 lines, 4 games, about 16 credits', /Get Pick6 lines/.test(btn)&&/4 games, about 16 credits/.test(btn), btn);
  await p.click('#pkDfsGo'); await p.waitForTimeout(1200);
  const props=calls.filter(c=>c.src==='oddsapi_props');
  check('one events call, then one props call per game found (3; ATL @ NO not in the feed)', calls.filter(c=>c.src==='oddsapi_events').length===1 && props.length===3, calls.map(c=>c.src+(c.event?':'+c.event:'')));
  check('props calls ask for the 4 NFL stats only', props.every(c=>c.markets==='player_pass_yds,player_rush_yds,player_reception_yds,player_receptions' && c.sport==='americanfootball_nfl'), props[0]);
  const msg=await p.$eval('#pkDfs',e=>e.innerText.replace(/\s+/g,' '));
  check('status: 3 games, about 12 credits, 331 left, ATL @ NO not found', /Looked up 3 games, about 12 credits, 331 left/.test(msg)&&/ATL @ NO/.test(msg), msg);
  check('after the lookup nothing is left to look up (the game missing from the feed isn’t offered again)', /all looked up/.test(msg) && await p.$eval('#pkDfsGo',b=>b.disabled), msg);
  check('Puka: the DraftKings row at Pick6’s 70.5 gets the ✓', /Pick6 ✓/.test(await lineCol('Puka'))&&/70\.5/.test(await lineCol('Puka')), await lineCol('Puka'));
  check('Tyreek Hill: same line on Pick6, ✓', /Pick6 ✓/.test(await lineCol('Tyreek')), await lineCol('Tyreek'));
  check('Stefon Diggs: Pick6 has 6.5, board 5.5, marked', /Pick6 has 6\.5/.test(await lineCol('Diggs')), await lineCol('Diggs'));
  check('Josh Allen: not on Pick6', /not on Pick6/.test(await lineCol('Josh Allen')), await lineCol('Josh Allen'));
  check('Bijan (game not in the feed): still check the line', /check the line/.test(await lineCol('Bijan')), await lineCol('Bijan'));
  const legs=await p.$$eval('#pkCards .pk-card',cs=>cs.map(c=>[...c.querySelectorAll('.pk-legs li')].map(l=>l.firstChild.firstChild.textContent.trim())));
  check('best entries leave out Diggs (wrong line) and Allen (not offered)', legs.flat().every(n=>n!=='Stefon Diggs'&&n!=='Josh Allen') && legs[0].length===2, legs);
  check('Diggs and Allen can’t be ticked for your own entry', await p.$$eval('#pkPool tr',t=>t.filter(r=>/Diggs|Josh Allen/.test(r.innerText)).every(r=>r.querySelector('input').disabled)), true);
  await p.click('#pkApp button[data-v="PrizePicks"]'); await p.waitForTimeout(300);
  check('PrizePicks: the same lookup gives Puka’s PrizePicks line (68.5, FanDuel row) the ✓', /PrizePicks ✓/.test(await lineCol('Puka'))&&/68\.5/.test(await lineCol('Puka')), await lineCol('Puka'));
  // the Worker without the new routes
  mode='404'; await p.evaluate(()=>{ pkDfs.games.clear(); pkDfs.missing.clear(); pkDfs.lines={}; pkDfs.msg=''; }); await p.click('#pkApp button[data-v="DraftKings Pick 6"]'); await p.waitForTimeout(200);
  await p.click('#pkDfsGo'); await p.waitForTimeout(800);
  const m404=await p.$eval('#pkDfs',e=>e.innerText.replace(/\s+/g,' '));
  check('Worker without the routes: a plain message, nothing breaks', /doesn.t have this yet/.test(m404), m404);
  check('no page errors', errs.length===0, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
