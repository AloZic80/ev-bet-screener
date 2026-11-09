// node tests/own-bets-test.js — bets you add yourself, end to end: every price format, stake and winnings, won/lost,
// not started / in progress / over, ESPN grading, the BettingPros fill-in, the Live tab's exchange request, and the
// Performance calendar. Dates are relative to now, so it never goes stale.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const CT=ms=>new Date(ms).toLocaleDateString('en-CA',{timeZone:'America/Chicago'});
const now=(()=>{ const r=Date.now(), [h,m,sec]=new Date(r).toLocaleTimeString('en-GB',{timeZone:'America/Chicago',hour12:false}).split(':').map(Number); return r-((h%24)*3600+m*60+sec)*1000+12*3600e3; })(), H=3600e3, D=24*H;
const atCT=(day,h)=>new Date(day+'T'+String(h).padStart(2,'0')+':00:00-06:00').getTime();
const cday=n=>{ const d=new Date(CT(now)+'T12:00:00Z'); d.setUTCDate(d.getUTCDate()+n); return d.toISOString().slice(0,10); };   // calendar days, safe across daylight saving
const TODAY=cday(0), YDAY=cday(-1), TWO=cday(-2), TMRW=cday(1), NEXT=cday(3);
const T_LIVE=now-H, T_FINAL=atCT(YDAY,18), T_FUT=atCT(TMRW,18);
const ev=(id,t,away,home,state,ap,hp)=>({ id, date:new Date(t).toISOString(), shortName:away+' @ '+home,
  status:{type:{state, completed:state==='post', name:state==='post'?'STATUS_FINAL':'', detail:state==='post'?'Final':state==='in'?'Q2 5:00':'', shortDetail:state==='post'?'Final':state==='in'?'Q2 5:00':''}},
  competitions:[{competitors:[{homeAway:'home',score:String(hp||0),winner:state==='post'&&hp>ap,team:{abbreviation:home,shortDisplayName:home}},{homeAway:'away',score:String(ap||0),winner:state==='post'&&ap>hp,team:{abbreviation:away,shortDisplayName:away}}]}] });
const EVENTS=[ev('gLive',T_LIVE,'LAL','BOS','in',40,44), ev('gFinal',T_FINAL,'NY','MIA','post',100,110), ev('gFut',T_FUT,'CHA','DET','pre')];
const BOARD=[{name:'Josh Allen',game:'BUF @ MIA',matchup:'BUF @ MIA',side:'O',sport:'NFL',market:'245.5 Passing Yards',kind:'prop',book:'DraftKings',offeredRaw:'-110',offeredProb:0.5238,fairProb:0.58,fairRaw:'-138',mktProb:0.55,stars:3,evModel:'projection',
  gameInfo:{state:'pre',startISO:new Date(now+30*H).toISOString(),timeCT:'',detail:'',teams:[]},src:'api:NFL:props',apiKey:'ja'}];
(async()=>{ const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:1400,height:1000}}); await ctx.clock.install({time:now}); /* noon in Chicago on today's date, so 'an hour ago' never crosses midnight */ const live=[];
  await ctx.addInitScript(([rows,day])=>{ try{ if(sessionStorage.getItem('seeded')) return; sessionStorage.setItem('seeded','1'); localStorage.clear();
    localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:day,rows})); }catch(e){} }, [BOARD,TMRW]);   // the board you'd load for tomorrow's game
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/site\.api\.espn\.com.*\/basketball\/nba\/scoreboard/.test(u)){ const m=u.match(/dates=(\d{8})/), d=m?m[1]:TODAY.replace(/-/g,'');
      return r.fulfill({contentType:'application/json',body:JSON.stringify({events:EVENTS.filter(e=>CT(Date.parse(e.date)).replace(/-/g,'')===d)})}); }
    if(/espn\.com.*scoreboard/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'});
    if(/api\.0xbeta\.dev\/live\?/.test(u)){ live.push(decodeURIComponent(u.split('bets=')[1]||'')); return r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:'{"results":{}}'}); }
    return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1500);
  await p.evaluate(()=>document.querySelector('.tab[data-view="v-add"]').click())   /* v4.29: under its main tab now */; await p.waitForTimeout(400);
  // the entry choices offered
  await p.selectOption('#abSport','NBA'); await p.waitForTimeout(1500); await p.waitForSelector('#abHost .editor');
  const ui=await p.evaluate(()=>({modes:[...document.querySelectorAll('#abHost .eb-mode option')].map(o=>o.textContent), odds:document.querySelector('#abHost .eb-odds').placeholder,
    fields:['.eb-stake','.eb-win-o','.eb-cost','.eb-pct','.eb-win'].filter(s=>document.querySelector('#abHost '+s)).length, results:[...document.querySelectorAll('#abResult option')].map(o=>o.textContent),
    games:[...document.querySelectorAll('#abGame option')].map(o=>o.value)}));
  check('choices: odds or %; one odds box for American, decimal or %; stake and To win; cost and payout in % mode', ui.modes.join('/')==='odds/%' && /-110/.test(ui.odds) && /1\.91/.test(ui.odds) && /%/.test(ui.odds) && ui.fields===5, ui);
  check('choices: Result is Not played yet / Won / Lost / Push', /Not played yet/.test(ui.results[0]) && ui.results.length===4, ui.results);
  check('ESPN game list has yesterday’s, today’s and tomorrow’s games', ['gLive','gFinal','gFut'].every(id=>ui.games.includes(id)), ui.games);
  async function add(o){
    if(o.sport){ await p.selectOption('#abSport',o.sport); await p.waitForTimeout(900); }
    await p.selectOption('#abType',o.type||'moneyline'); await p.fill('#abGameFree',''); await p.dispatchEvent('#abGameFree','input');
    if(o.game) await p.selectOption('#abGame',o.game); else { await p.fill('#abGameFree',o.typed); await p.dispatchEvent('#abGameFree','input'); }
    await p.waitForTimeout(200); if(o.date) await p.fill('#abDate',o.date);
    if(o.team){ if(await p.isVisible('#abTeam')) await p.selectOption('#abTeam',o.team,{timeout:3000}); else await p.fill('#abTeamFree',o.team); }
    if(o.player){ await p.fill('#abPlayer',o.player); await p.fill('#abStat',o.stat); await p.selectOption('#abPick',o.pick); await p.fill('#abLine',o.line); }
    await p.waitForSelector('#abHost .editor'); await p.selectOption('#abHost .eb-book',o.book); await p.selectOption('#abHost .eb-mode',o.mode||'odds');
    if((o.mode||'odds')==='odds'){ await p.fill('#abHost .eb-odds',o.odds||''); await p.fill('#abHost .eb-stake',o.stake); await p.fill('#abHost .eb-win-o',o.towin||''); }
    else { await p.fill('#abHost .eb-pct',''); await p.fill('#abHost .eb-cost',o.cost); await p.fill('#abHost .eb-win',o.win); }
    await p.selectOption('#abResult',o.result||''); await p.waitForTimeout(250);
    const n0=await p.evaluate(()=>logged.length); for(let i=0;i<3 && await p.evaluate(()=>logged.length)===n0;i++){ await p.click('#abHost .eb-save'); await p.waitForTimeout(400); }
    await p.waitForTimeout(500); const ok=await p.evaluate(n=>logged.length>n,n0);
    return ok ? p.evaluate(()=>{ const x=logged[logged.length-1]; return {i:logged.length-1, id:x.id, game:x.game, date:x.date, start:x.start, odds:x.odds, stake:x.stake, towin:x.towin, result:x.result||null, book:x.book}; })
              : {notSaved: await p.$eval('#abHost .eb-msg',e=>e.textContent).catch(()=>'?')};
  }
  const B={};
  B.fut   = await add({game:'gFut',  team:'DET', book:'Novig',     odds:'-110',  stake:'10'});                       // American, not started
  B.live  = await add({game:'gLive', team:'BOS', book:'DraftKings',odds:'1.91',  stake:'10'});                       // decimal, in progress
  B.fin   = await add({game:'gFinal',team:'MIA', book:'FanDuel',   odds:'52.4%', stake:'10'});                       // %, over: ESPN grades it
  B.kal   = await add({game:'gFinal',team:'NY',  book:'Kalshi',    mode:'pct', cost:'5', win:'9', result:'loss'});   // cost + payout, lost
  B.typW  = await add({typed:'SAC @ UTA', date:TWO,  team:'UTAH', book:'BetMGM', odds:'-110', stake:'10', towin:'9.50', result:'win'});   // typed, won, To win
  B.typP  = await add({typed:'SAC @ UTA', date:YDAY, team:'SAC', book:'BetMGM', odds:'+120', stake:'4'});         // typed, over, no result
  B.typF  = await add({typed:'POR @ PHX', date:NEXT, team:'PHX', book:'BetMGM', odds:'-150', stake:'6'});         // typed, not started
  B.prop  = await add({sport:'NFL', type:'prop', typed:'BUF @ MIA', date:TMRW, player:'Josh Allen', stat:'Passing Yards', pick:'O', line:'245.5', book:'DraftKings', odds:'-110', stake:'5'});
  console.log('saved:',JSON.stringify(B));
  check('all 8 bets saved', Object.values(B).every(x=>x && x.id), Object.fromEntries(Object.entries(B).map(([k,v])=>[k,!!(v&&v.id)])));
  check('formats: American -110, decimal 1.91 → -110, 52.4% → -110, cost $5 for a $9 payout → To win $4', B.fut.odds==='-110' && B.live.odds==='-110' && B.fin.odds==='-110' && B.kal.towin===4, [B.fut.odds,B.live.odds,B.fin.odds,B.kal.towin]);
  check('picked games keep their start time; typed games keep the date you chose', B.fut.start && B.live.start && B.fin.start && !B.typW.start && B.typW.date===TWO && B.typF.date===NEXT, [B.typW.date,B.typF.date]);
  // reload: grading runs, the board's BettingPros row fills the prop, the Live tab asks the exchanges
  await p.reload(); await p.waitForTimeout(3500);
  const R=await p.evaluate(ids=>ids.map(id=>{ const i=logged.findIndex(x=>x.id===id), x=logged[i]; const btn=document.querySelector('#logBody button.kill.edit[data-i="'+i+'"]');
    const row=btn&&btn.closest('tr'); const st=row&&row.cells[0].querySelector('[title="game day"]'); return {result:x.result||null, profit:betProfit(x), state:st?st.textContent.trim():'', fair:x.fair||null, net:x.net==null?null:+x.net.toFixed(4)}; }), Object.values(B).map(x=>x.id));
  const S=Object.fromEntries(Object.keys(B).map((k,j)=>[k,R[j]])); console.log('after reload:',JSON.stringify(S));
  check('not started (picked game, tomorrow): says “plays …”', /^plays /.test(S.fut.state), S.fut.state);
  check('in progress (picked game, started an hour ago): says “in progress …”', /in progress/.test(S.live.state), S.live.state);
  check('over (picked game, final): ESPN graded it WIN (MIA won), +$9.09, and it says “played …”', S.fin.result==='win' && /^played /.test(S.fin.state) && S.fin.profit===9.09, S.fin);   // 52.4% is -110; $10 at -110 pays $9.09
  check('lost (Result box): profit −$5, “played …”', S.kal.result==='loss' && S.kal.profit===-5 && /^played /.test(S.kal.state), S.kal);
  check('won with To win $9.50 (typed game): profit +$9.50, shows it was played', S.typW.result==='win' && S.typW.profit===9.5 && /played/.test(S.typW.state||''), S.typW);
  check('typed game, day passed, no result: says it’s over and asks for the result', /over|passed/.test(S.typP.state||'') && /result/.test(S.typP.state||''), S.typP.state);
  check('typed game in the future: says “plays …”', /^plays /.test(S.typF.state||''), S.typF.state);
  check('BettingPros fill-in: the hand-added prop picked up the board’s fair price and EV', S.prop.fair!=null && S.prop.net!=null, S.prop);
  // Live tab: open exchange bets go to the Worker's live-price route (Kalshi / Polymarket / Novig only)
  await p.click('.tab[data-view="v-live"]'); await p.waitForTimeout(800); await p.evaluate(()=>{ const b=document.querySelector('.tb-espn'); if(b) b.click(); }); await p.waitForTimeout(1500);
  const asked=live.join(' ');
  check('Live tab asks the Worker for a live price on the open Novig bet', asked.includes(B.fut.id), live.length+' request(s)');
  // Performance calendar
  await p.evaluate(()=>document.querySelector('.tab[data-view="v-perf"]').click())   /* v4.29: under its main tab now */; await p.waitForTimeout(600);
  const cal=await p.evaluate(d=>{ const x=calDays('All'); return {y:x[d[0]]||null, two:x[d[1]]||null}; },[YDAY,TWO]);
  check('calendar, yesterday: 1 win, 1 loss, 1 still open; +$9.09 − $5 = +$4.09, the open $4 is in play, not lost (v4.07)', cal.y && cal.y.w===1 && cal.y.l===1 && cal.y.open===1 && Math.abs(cal.y.profit-4.09)<0.01 && cal.y.playingAmt===4, cal.y);
  check('calendar, two days ago: the typed bet you won, +$9.50', cal.two && cal.two.w===1 && Math.abs(cal.two.profit-9.5)<0.01, cal.two);
  const cell=await p.evaluate(d=>{ const c=document.querySelector('.cal-c[data-day="'+d+'"]'); return c?c.innerText.replace(/\s+/g,' '):null; }, TWO);
  check('the calendar shows that day', !!cell, cell);
  check('no page errors', errs.length===0, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
