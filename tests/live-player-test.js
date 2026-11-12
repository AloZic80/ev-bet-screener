// node tests/live-player-test.js — v4.76 (Alonzo, 11/12, with ESPN's screen "WSH 101 IND 114 · 4th" next to Live Games saying "Game not found
// on ESPN · Not started" for AJ Dybantsa Under 23.5 Pts+Reb at Novig, −104, $2.61: "our app says, it can't get data? or found? why?").
// Novig names a player prop only as "<player> <line> <stat>", so the fill is saved without its game. Live Games now finds that game the way
// grading does after the final: the in-progress or final game of that sport, within 90 minutes of Novig's start, whose box score lists the
// player; exactly one, or none. And a game that went final settles a prop only from ESPN's final box score, never a copy read mid-game.
// v4.77: a box score that does not list him yet is read again once a minute; a same-named player in another game is not taken while his game waits.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,700)); };
const NOW=Date.parse('2026-11-13T02:10:00Z'), TIP=Date.parse('2026-11-13T00:00:00Z'), DAY='2026-11-12';   // 8:10 PM CT; tip-off 6:00 PM CT
const LAB=['MIN','FG','3PT','FT','OREB','DREB','REB','AST','STL','BLK','TO','PF','+/-','PTS'];
const ath=(n,reb,pts)=>({athlete:{displayName:n}, stats:['30','5-12','1-3','3-4','1',String(reb-1),String(reb),'2','1','0','2','2','-8',String(pts)]});
const team=(t)=>({id:t[1], abbreviation:t[0], displayName:t[2], shortDisplayName:t[2].split(' ').pop(), name:t[2].split(' ').pop(), location:t[2].split(' ').slice(0,-1).join(' '), color:'333333', alternateColor:'ffffff', logo:''});
const status=(state)=>({clock:300, displayClock:state==='in'?'5:00':'0.0', period:4, type:{state, completed:state==='post', name:state==='post'?'STATUS_FINAL':state==='in'?'STATUS_IN_PROGRESS':'STATUS_SCHEDULED',
  description:state==='post'?'Final':state==='in'?'In Progress':'Scheduled', detail:state==='post'?'Final':state==='in'?'5:00 - 4th Quarter':'6:00 PM CST', shortDetail:state==='post'?'Final':state==='in'?'5:00 - 4th':'6:00 PM CST'}});
const game=(id,away,home,start,state,as,hs)=>({id, date:new Date(start).toISOString().replace(/:\d\d\.\d{3}Z$/,'Z'), name:away[2]+' at '+home[2], shortName:away[0]+' @ '+home[0], status:status(state),
  competitions:[{id, date:new Date(start).toISOString(), status:status(state), competitors:[{id:home[1], homeAway:'home', team:team(home), score:String(hs)},{id:away[1], homeAway:'away', team:team(away), score:String(as)}]}]});
const box=(state, teams)=>({header:{competitions:[{status:{type:{state, completed:state==='post'}}}]}, boxscore:{players:teams.map(([ab,list])=>({team:{abbreviation:ab}, statistics:[{labels:LAB, athletes:list}]}))}});
const WSH=['WSH','27','Washington Wizards'], IND=['IND','11','Indiana Pacers'], BOS=['BOS','2','Boston Celtics'], NYK=['NYK','18','New York Knicks'], LAL=['LAL','13','Los Angeles Lakers'], PHX=['PHX','21','Phoenix Suns'];
// the Novig fill as the Worker describes it: player, stat, line, side, Novig's start; no teams
const FILL={book:'novig', id:'nvf-aj-1', price:0.5098, cost:2.50, fee:0.11, qty:4.9, ts:Date.parse('2026-11-12T23:40:00Z'),
  bet:{sport:'NBA', kind:'prop', player:'AJ Dybantsa', statText:'POINTS REBOUNDS', line:23.5, side:'U', start:new Date(TIP).toISOString(), desc:'AJ Dybantsa 23.5 POINTS_REBOUNDS', eventId:'nv-ev-1'}};
async function open(b, S, at){ const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:1280,height:1000}}); await ctx.clock.install({time:new Date(at||NOW)});
  await ctx.addInitScript((d)=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig',bank:'500',cfgVer:3.03})); localStorage.setItem('mbev.slate',d); }catch(e){} }, DAY);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); S.sum=S.sum||{};
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/espn\.com/.test(u)){ let m;
      if((m=u.match(/sports\/[a-z-]+\/([a-z0-9.-]+)\/scoreboard/))) return r.fulfill({contentType:'application/json',body:JSON.stringify({events:(S.games[m[1]]||[])})});
      if((m=u.match(/summary\?event=(\w+)/))){ S.sum[m[1]]=(S.sum[m[1]]||0)+1; return r.fulfill({contentType:'application/json',body:JSON.stringify(S.box[m[1]]||{})}); }
      return r.fulfill({contentType:'application/json',body:'{}'}); }
    if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1200); return {ctx,p,errs}; }
const live=async(p)=>{ await p.evaluate(async()=>{ const idle=async()=>{ for(let i=0;i<100 && liveBusy;i++) await new Promise(r=>setTimeout(r,50)); }; await idle(); await renderLive(true); await idle(); }); await p.waitForTimeout(150); };
const view=(p)=>p.evaluate(()=>[...document.querySelectorAll('#liveBody .lgame')].map(g=>({head:[...((g.querySelector('.lgame-h')||{}).children||[])].map(c=>c.textContent).join(' ').replace(/\s+/g,' ').trim(), box:!!g.querySelector('.lgame-h.lbox'),
  bets:(g.querySelector('.lg-bets')||{}).textContent.replace(/\s+/g,' ').trim(), st:[...g.querySelectorAll('.lbet')].map(x=>((x.querySelector('b')||{}).textContent||'')+' | '+((x.querySelector('.lst')||{}).textContent||''))})));
const res=(p,n)=>p.evaluate(n=>{ const b=logged.find(x=>x.name===n); return b?{result:b.result||null, game:b.game||'', start:b.start, snapAt:b.snap&&b.snap.at}:null; },n);
(async()=>{ const b=await chromium.launch(); let v;
  // 1 — Alonzo's case: WSH @ IND in the 4th, BOS @ NYK at the same time, LAL @ PHX later; AJ is only in the WSH @ IND box score
  const S1={games:{nba:[game('401',WSH,IND,TIP,'in',101,114), game('402',BOS,NYK,TIP,'in',88,90), game('403',LAL,PHX,TIP+3*3600e3,'pre',0,0)]},
    box:{'401':box('in',[['WSH',[ath('AJ Dybantsa',6,14)]],['IND',[ath('Pascal Siakam',8,20)]]]), '402':box('in',[['BOS',[ath('Jayson Tatum',7,25)]],['NYK',[ath('Jalen Brunson',3,30)]]])}};
  let T=await open(b,S1);
  await T.p.evaluate(f=>{ autoAddFromDesc(f); }, FILL);
  await T.p.evaluate(([tip,day])=>{ addToLog({name:'Pascal Siakam', sport:'NBA', kind:'prop', market:'27.5 Points', side:'O', game:'WSH @ IND', book:'Novig', offeredRaw:'-110', offeredProb:0.5238, stake:5, gameDay:day, gameInfo:{state:'pre', startISO:new Date(tip).toISOString(), teams:[]}, src:'api:NBA:props'}); }, [TIP,DAY]);
  const aj=await res(T.p,'AJ Dybantsa');
  check('the Novig fill is saved as Alonzo saw it: AJ Dybantsa, no game, Novig start 6:00 PM CT', aj && aj.game==='' && aj.start===new Date(TIP).toISOString(), aj);
  await live(T.p); v=await view(T.p);
  const g1=v.find(x=>x.st.some(s=>/AJ Dybantsa/.test(s)));
  check('1: AJ Dybantsa is shown under WSH @ IND with ESPN\'s game box (not "Game not found on ESPN")', g1 && g1.box && /WSH|WAS/.test(g1.head) && /IND/.test(g1.head) && /101/.test(g1.head) && /114/.test(g1.head) && !/not found|did not name/i.test(g1.head), g1);
  check('1: "YOUR BETS ON WSH @ IND · 2 · $7.61": his two bets on that game in one group', g1 && /^YOUR BETS ON (WSH|WAS) @ IND · 2 · \$7\.61$/.test(g1.bets), g1&&g1.bets);
  check('1: the live stat replaces "Not started": 14 pts + 6 reb = 20, room 3.5 under 23.5', g1 && g1.st.some(s=>/^AJ Dybantsa \| 20 · room 3\.5 · projection/.test(s)), g1&&g1.st);
  check('1: only the two games that started at 6:00 PM were read (the 9:00 PM game was not)', S1.sum['401']>=1 && S1.sum['402']>=1 && !S1.sum['403'], S1.sum);
  // 2 — the scoreboard says final but ESPN's box score is still the in-game copy: nothing is settled from it
  S1.games.nba[0]=game('401',WSH,IND,TIP,'post',108,121); S1.games.nba[1]=game('402',BOS,NYK,TIP,'post',101,99);
  await live(T.p);
  const r2=[await res(T.p,'AJ Dybantsa'), await res(T.p,'Pascal Siakam')];
  check('2: final on the scoreboard, box score not final yet: neither bet is settled from a mid-game copy (Siakam had 20 of his 27.5)', !r2[0].result && !r2[1].result, r2);
  // 3 — ESPN's final box score: AJ 18 + 7 = 25 (Under 23.5 lost), Siakam 28 (Over 27.5 won)
  S1.box['401']=box('post',[['WSH',[ath('AJ Dybantsa',7,18)]],['IND',[ath('Pascal Siakam',9,28)]]]);
  await live(T.p);
  const r3=[await res(T.p,'AJ Dybantsa'), await res(T.p,'Pascal Siakam')];
  check('3: settled from the final box score: AJ Under 23.5 lost (25), Siakam Over 27.5 won (28)', r3[0].result==='loss' && r3[1].result==='win', r3);
  check('no page errors (Alonzo\'s case)', !T.errs.length, T.errs); await T.ctx.close();
  // 4 — two games list a player by that name: no guess
  const S4={games:{nba:[game('401',WSH,IND,TIP,'in',101,114), game('402',BOS,NYK,TIP,'in',88,90)]},
    box:{'401':box('in',[['WSH',[ath('AJ Dybantsa',6,14)]]]), '402':box('in',[['BOS',[ath('AJ Dybantsa',2,4)]]])}};
  T=await open(b,S4); await T.p.evaluate(f=>{ autoAddFromDesc(f); }, FILL); await live(T.p); v=await view(T.p);
  check('4: the name is in two box scores: no guess; "Novig did not name the game · found by the player once it starts", "Game not known yet"', v.length===1 && !v[0].box && v[0].head==='Novig did not name the game · found by the player once it starts NBA' && v[0].st[0]==='AJ Dybantsa | Game not known yet', v);
  check('no page errors (two names)', !T.errs.length, T.errs); await T.ctx.close();
  // 5 — before tip-off: ESPN lists no players yet; nothing is guessed and no box score is read
  const S5={games:{nba:[game('401',WSH,IND,TIP,'pre',0,0), game('402',BOS,NYK,TIP,'pre',0,0)], nhl:[]}, box:{}};
  T=await open(b,S5,TIP-20*60e3);
  await T.p.evaluate(f=>{ autoAddFromDesc(f); autoAddFromDesc(Object.assign({},f,{id:'nvf-nhl-1', bet:Object.assign({},f.bet,{sport:'NHL', player:'Cole Caufield', statText:'SHOTS ON GOAL', line:3.5, side:'O', start:new Date(Date.parse(f.bet.start)+30*60e3).toISOString()})})); }, FILL);
  await live(T.p); v=await view(T.p);
  check('5: before tip-off, not found yet: says Novig did not name the game; v4.77: its start is still ahead, so the status is "Not started" (a game that has started but is not found says "Game not known yet")', v.some(x=>x.head==='Novig did not name the game · found by the player once it starts NBA' && x.st[0]==='AJ Dybantsa | Not started'), v);
  check('5: the NBA and NHL bets with no game are two groups, not one "Game not found" list', v.length===2 && v.every(x=>/^YOUR BETS ON · 1 ·/.test(x.bets)), v.map(x=>x.bets));
  check('5: no box score is read before any game starts', !Object.keys(S5.sum).length, S5.sum);
  check('no page errors (before tip-off)', !T.errs.length, T.errs); await T.ctx.close();
  // 6 — v4.77 (Los Chismosos): an NFL box score lists a player only after his first stat. AJ is not listed at first; the box score is read again
  // at most once a minute, so he is found a minute later, not never.
  const S6={games:{nba:[game('401',WSH,IND,TIP,'in',20,18)]}, box:{'401':box('in',[['WSH',[ath('Bilal Coulibaly',2,4)]],['IND',[ath('Pascal Siakam',3,6)]]])}};
  T=await open(b,S6); await T.p.evaluate(f=>{ autoAddFromDesc(f); }, FILL); await live(T.p); v=await view(T.p);
  check('6: AJ is not in the box score yet: not found, no guess', v.length===1 && !v[0].box && S6.sum['401']===1, {v, reads:S6.sum});
  S6.box['401']=box('in',[['WSH',[ath('AJ Dybantsa',3,8),ath('Bilal Coulibaly',2,4)]],['IND',[ath('Pascal Siakam',3,6)]]]);
  await live(T.p); v=await view(T.p);
  check('6: within the minute the box score is not read again (no hammering ESPN)', S6.sum['401']===1 && v.length===1 && !v[0].box, {v, reads:S6.sum});
  await T.p.clock.fastForward(61000); await live(T.p); v=await view(T.p);
  check('6: a minute later it is read again and AJ is found under WSH @ IND (8 + 3 = 11, room 12.5)', v.length===1 && v[0].box && v[0].st.some(x=>/^AJ Dybantsa \| 11 · room 12\.5/.test(x)), {v, reads:S6.sum});
  check('no page errors (late listing)', !T.errs.length, T.errs); await T.ctx.close();
  // 7 — v4.77 (Los Chismosos): another player with the same name is in an earlier game that started; the bet's own game (Novig's start) has not.
  // No guess while a game in the window has not started; once it starts, the game that starts when Novig said is taken.
  const S7={games:{nba:[game('501',BOS,NYK,TIP-60*60e3,'in',40,38), game('401',WSH,IND,TIP,'pre',0,0)]}, box:{'501':box('in',[['BOS',[ath('AJ Dybantsa',1,2)]],['NYK',[ath('Jalen Brunson',2,15)]]])}};
  T=await open(b,S7,TIP-20*60e3); await T.p.evaluate(f=>{ autoAddFromDesc(f); }, FILL); await live(T.p); v=await view(T.p);
  check('7: the same name in an earlier game while the bet\'s game has not started: no guess ("Not started", Novig did not name the game)', v.length===1 && !v[0].box && v[0].st[0]==='AJ Dybantsa | Not started', v);
  S7.games.nba[1]=game('401',WSH,IND,TIP,'in',30,28); S7.box['401']=box('in',[['WSH',[ath('AJ Dybantsa',6,14)]],['IND',[ath('Pascal Siakam',3,6)]]]);
  await T.p.clock.fastForward(30*60e3); await live(T.p); v=await view(T.p);
  const g7=v.find(x=>x.st.some(s=>/AJ Dybantsa/.test(s)));
  check('7: once his game starts, the one that starts when Novig said is taken: WSH @ IND, 14 + 6 = 20', g7 && g7.box && /WSH|WAS/.test(g7.head) && /IND/.test(g7.head) && g7.st.some(x=>/^AJ Dybantsa \| 20 · room 3\.5/.test(x)), v);
  check('no page errors (same name)', !T.errs.length, T.errs); await T.ctx.close();
  await b.close(); console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(fail?1:0); })();
