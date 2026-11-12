// node tests/same-player-test.js — v4.47. Alonzo, 11/10: he bet Jordan Mason rushing yards (logged from his book, no game text), and the Sentinels card
// "Jordan Mason Under 11.5 Rushing Attempts, Novig +106, Buffalo @ Minnesota" showed nothing: "sometimes it is bad or not recommended to make bets on the
// same person on the same game. Correlation." The one-bet-per-player rule (v2.50) needed the same game text on both sides, so it never fired.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const NOW=Date.parse('2026-11-10T19:00:00Z'), H=3600e3, iso=ms=>new Date(ms).toISOString(), DAY='2026-11-10';
const KO=Date.parse('2026-11-11T01:15:00Z');   // 7:15 PM CT
const T=(ha,abbr,loc,nick)=>({ha,id:abbr,abbr,name:loc+' '+nick,loc,nick,logo:'',rec:'',color:'333333',alt:'ffffff'});
const GI=start=>({state:'pre',startISO:iso(start),eventId:'401777',timeCT:'',detail:'',teams:[T('away','BUF','Buffalo','Bills'),T('home','MIN','Minnesota','Vikings')]});
// the board writes the game with full names (as The Odds API and SportsGameOdds rows do)
const prop=(id,name,team,market,side,price,fair,start,extra)=>Object.assign({name,team,game:'Buffalo Bills @ Minnesota Vikings',matchup:'Buffalo Bills @ Minnesota Vikings',side,sport:'NFL',market,kind:'prop',book:'Novig',
  offeredRaw:price>=0.5?String(Math.round(-100*price/(1-price))):'+'+Math.round(100*(1-price)/price),offeredProb:price,fairProb:fair,fairRaw:'',mktProb:+(price+0.02).toFixed(3),stars:4,evModel:'projection',projValue:10,
  gameInfo:GI(start),src:'api:NFL:props',apiKey:id,loadedAt:iso(NOW-60e3)},extra||{});
// his bet as autoAddFromDesc logs a Novig fill: no game text, no team, the book's words
const MASON={id:'nv1',key:'nv1',name:'Jordan Mason',sport:'NFL',kind:'prop',market:'62.5 Rushing Yards',side:'O',team:null,game:'',matchup:'',book:'Novig',odds:'-110',offeredRaw:'-110',offeredProb:0.524,stake:2.5,fee:0,
  date:DAY,dateSet:true,gameInfo:{state:'pre',startISO:iso(KO),teams:[]},start:iso(KO),autoFrom:'novig',fills:['f1'],placedAt:iso(NOW-H),snap:{at:iso(NOW-H)}};
// a teammate bet logged with codes only: "BUF @ MIN"
const COOK={id:'nv2',key:'nv2',name:'James Cook',sport:'NFL',kind:'prop',market:'15.5 Rushing Attempts',side:'O',team:'BUF',game:'BUF @ MIN',matchup:'BUF @ MIN',book:'Novig',odds:'-115',offeredRaw:'-115',stake:1.5,fee:0,
  date:DAY,dateSet:true,start:iso(KO),autoFrom:'novig',fills:['f2'],placedAt:iso(NOW-H)};
const ROWS=[prop('m1','Jordan Mason','MIN','11.5 Rushing Attempts','U',0.485,0.53,KO),          // the card in the screenshot
            prop('m2','Jordan Mason','MIN','11.5 Rushing Attempts','U',0.485,0.53,KO+7*24*H),  // the same player next week: not this game
            prop('j1','Justin Jefferson','MIN','75.5 Receiving Yards','O',0.5,0.57,KO),       // another player in this game
            prop('d1','Davante Adams','LV','60.5 Receiving Yards','O',0.5,0.57,KO,{game:'Las Vegas Raiders @ Denver Broncos',matchup:'Las Vegas Raiders @ Denver Broncos',
              gameInfo:{state:'pre',startISO:iso(KO),eventId:'401888',teams:[T('away','LV','Las Vegas','Raiders'),T('home','DEN','Denver','Broncos')]}})];   // another game, same time
async function run(log, rows, mode){ rows=rows||ROWS;   // v4.48: other boards and a board mode
  const b=await chromium.launch();
  const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:1280,height:900}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(([L,R,d,m])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.log',JSON.stringify(L)); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig, Kalshi',bank:'500',cfgVer:3.03})); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows:R})); if(m) localStorage.setItem('mbev.mode',JSON.stringify({mode:m,day:d})); }catch(e){} }, [log,rows,DAY,mode||null]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1300);
  const st=await p.evaluate(()=>lastRows.map(r=>({k:r.apiKey, stake:r.stake, sp:!!r.samePlayer, corr:r.corr||0, flags:(r.flags||[]).filter(f=>f[0]==='warn'||f[0]==='corr').map(f=>f[1]).join(' | ')})));
  const cards=await p.evaluate(()=>[...document.querySelectorAll('#placeCards .sc-card')].map(c=>c.innerText.replace(/\s+/g,' ')));
  const head=await p.evaluate(()=>{ const h=document.querySelector('#placeCards .pc-head'); return h?h.innerText.replace(/\s+/g,' '):''; });
  st.forEach(x=>{ x.live=x.live||''; }); const lv=await p.evaluate(()=>lastRows.map(r=>({k:r.apiKey, live:(r.flags||[]).filter(f=>f[0]==='live').map(f=>f[1]).join(' | ')})));
  lv.forEach(x=>{ const y=st.find(z=>z.k===x.k); if(y) y.live=x.live; });
  /* v4.76: the best bets are split into five tabs by La Contadora's chance (every prop on these boards is between 51% and 54%: 🪙 Volado, not the 💪 Machín tab the page opens in). Place these is read in each tab and combined (all: its cards, not the 🍀 / 🔮 extras, which were never in Safe's list; heads: each tab's Place these header); then back to the tab the page opened in. cards and head above stay that tab's, as before. */
  const all=[], heads=[]; for(const m of ['boring','safe','volado','lucky','clair']){ await p.evaluate(m=>setMode(m),m); await p.waitForTimeout(300);
    const t=await p.evaluate(()=>({c:[...document.querySelectorAll('#placeCards .sc-card:not(.sc-x)')].map(c=>c.innerText.replace(/\s+/g,' ')), h:[...document.querySelectorAll('#placeCards .pc-head:not(.pc-x)')].map(h=>h.innerText.replace(/\s+/g,' '))})); all.push(...t.c); heads.push(...t.h); }
  await p.evaluate(m=>setMode(m), mode||'safe'); await p.waitForTimeout(300);
  return {b, p, st, cards, head, errs, all, heads};
}
(async()=>{
  let {b, st, cards, errs, all, heads}=await run([MASON]); const g=k=>st.find(x=>x.k===k)||{};   /* v4.76: + all and heads, Place these in every tab (see run) */
  check('Mason Under 11.5 Rushing Attempts: your Mason Over 62.5 Rushing Yards (logged from Novig, no game text) is found; one bet per player, no stake', g('m1').sp && g('m1').stake===0 && /PLAYER EXPOSURE · already hold Mason Over 62\.5 Rushing Yards: no additional stake/.test(g('m1').flags) && /Same game as your Mason/.test(g('m1').flags), g('m1'));
  check('so today\'s Mason card is not in Place these (next week\'s still is)', !all.some(t=>/Jordan Mason/.test(t) && /Today/.test(t)) && all.some(t=>/Jordan Mason/.test(t) && !/Today/.test(t)), all.map(t=>t.slice(0,90)));   /* v4.76: Place these of all five tabs (next week's Mason is under 🪙 Volado) */
  check('Mason next week is another game: not blocked', !g('m2').sp && g('m2').stake>0, g('m2'));
  check('Jefferson (another player, same game, no game text on your bet): not blocked, and not tied to it without a team code', !g('j1').sp && g('j1').stake>0, g('j1'));
  check('Adams in another game at the same time: nothing', !g('d1').sp && !g('d1').corr, g('d1'));
  check('no page errors (1)', !errs.length, errs); await b.close();
  ({b, st, cards, errs, all}=await run([COOK]));
  check('a teammate bet saved as "BUF @ MIN" is the same game as "Buffalo Bills @ Minnesota Vikings" (ESPN codes): Jefferson says so', /Same game as your Cook/.test(g('j1').flags) && g('j1').corr===1 && !g('j1').sp, g('j1'));
  check('the Place card shows it: 🔗 Same game as your Cook … (it was in the table only)', all.some(t=>/Justin Jefferson/.test(t) && /🔗 Same game as your Cook/.test(t)), all.filter(t=>/Jefferson/.test(t)).map(t=>t.slice(0,200)));   /* v4.76: Place these of all five tabs (Jefferson, 53.8%, is under 🪙 Volado) */
  check('another game at the same time is not tied to it', !g('d1').corr, g('d1'));
  check('no page errors (2)', !errs.length, errs); await b.close();
  // v4.48: the bet you hold saved its model and market → better or worse than it (not added either way)
  const MASON2=Object.assign({}, MASON, {snap:{at:iso(NOW-H), model:0.56, market:0.53, fee:0}});
  ({b, st, cards, errs}=await run([MASON2]));
  check('v4.48: "this one looks better (+5.9% vs +3.2% when you took yours)": La Contadora at your price then, and still no stake', g('m1').stake===0 && /this one looks better \(\+5\.9% vs \+3\.2% when you took yours\)/.test(g('m1').flags), g('m1'));
  await b.close();
  // v4.48: before either is placed, two props on Mason in this game → only the better one (La Contadora's EV) keeps its stake
  const TWO=[ROWS[0], prop('m3','Jordan Mason','MIN','62.5 Rushing Yards','O',0.5,0.53,KO), ROWS[2]];
  TWO[1].mktProb=0.51; TWO[0].mktProb=0.505;
  let head; ({b, st, cards, head, errs, all, heads}=await run([], TWO));
  check('v4.48: nothing bet yet: Mason Under 11.5 Rushing Attempts (+5.9%) keeps its stake; Mason Over 62.5 Rushing Yards (+3.4%) gets none and says why', g('m1').stake>0 && g('m3').stake===0 && /PLAYER EXPOSURE · Mason Under 11\.5 Rushing Attempts is the better bet on this player \(\+5\.9% vs \+3\.4%\): one bet per player/.test(g('m3').flags) && /best bet on this player: Mason Over 62\.5 Rushing Yards is skipped/.test(g('m1').live), {m1:g('m1'), m3:g('m3')});
  check('v4.48: one Mason card in Place these, and Jefferson (another player) keeps his', all.filter(t=>/Jordan Mason/.test(t)).length===1 && all.some(t=>/Justin Jefferson/.test(t)), all.map(t=>t.slice(0,80)));   /* v4.76: Place these of all five tabs (both are under 🪙 Volado) */
  /* v4.76: the opening tab (💪 Machín, Safe's key) has no Place these on this board: the header is read where these bets are listed now (🪙 Volado), so the check is not empty */
  check('v4.48: no mode note on Place these (in 🪙 Volado, where these bets are listed now; was Safe)', heads.length>0 && !heads.some(h=>/Board mode/.test(h)), heads.map(h=>h.slice(0,200)));
  check('no page errors (3)', !errs.length, errs); await b.close();
  // v4.50: the modes changed meaning; v4.51: each mode lists only its own bets (Safe the best bets, Feeling Lucky the ones that just missed,
  // Clairvoyant the Hail Marys): tests/modes-perfecta-test.js. What stays here: the name matching, and that a mode other than Safe has no Place these.
  /* v4.76: Clairvoyant is 🔮 Brujo, which also lists the approved bets under 45%: none on this board (51.4% and 53.8%), so it still has no Place these.
     Its mode line still says where the best bets are: now none under 💪 Machín (Safe's key) and the 3 under 🪙 Volado (50 to 60%). */
  let p; ({b, p, st, cards, head, errs}=await run([], ROWS, 'clair'));
  check('v4.51: 🔮 Brujo (was Clairvoyant) on: the best bets are not listed here (no Place these, no "Board mode" note): only the Hail Marys header, with none on this board, and the mode line says where the best bets are (v4.76: under 🪙 Volado, none under 💪 Machín)', !/Board mode/.test(head) && !/Place these/i.test(head) && /HAIL MARYS · 0/i.test(head) && /No long shot on the board right now/.test(head) && !cards.length && await p.evaluate(()=>/No bets under 💪 Machín right now · 🪙 Volado has 3\./.test(document.getElementById('contadora').textContent) && lastRows.filter(r=>r.stake>0).length===3), head.slice(-330));
  const nm=await p.evaluate(()=>{ const P=(n,t)=>({name:n, team:t||null, kind:'prop', sport:'NFL'}); return {
    initial:samePlayerAs(P('J. Mason'),P('Jordan Mason')), accent:samePlayerAs(P('Jonathan Lekkerimäki'),P('Jonathan Lekkerimaki')), short:samePlayerAs(P('Jon Smith'),P('Jonathan Smith')),
    fake:samePlayerAs(P('Five Star','MIN'),P('Four Star','MIN')), allen:samePlayerAs(P('Josh Allen','BUF'),P('Josh Allen','JAX')), line:samePlayerAs({name:'Jordan Mason',kind:'spread'},P('Jordan Mason')) }; });
  check('v4.48: same player: J. Mason = Jordan Mason, accents, Jon = Jonathan; not Five Star / Four Star, not two Josh Allens on two teams, not a game line', nm.initial && nm.accent && nm.short && !nm.fake && !nm.allen && !nm.line, nm);
  check('no page errors (4)', !errs.length, errs); await b.close();
  console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail?1:0);
})();
