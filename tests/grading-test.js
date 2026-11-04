// node tests/grading-test.js — automatic grading of bets added after their game started (the 4-hour rule in evOkFor).
// Dates are relative to now, so this never goes stale.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const ct=ms=>new Date(ms).toLocaleDateString('en-CA',{timeZone:'America/Chicago'});
const DAY=ct(Date.now()-86400e3), YMD=DAY.replace(/-/g,'');                 // yesterday in Central time
const at=hCT=>new Date(DAY+'T'+String(hCT).padStart(2,'0')+':00:00-06:00').toISOString();   // a CT hour yesterday (CST; close enough in CDT)
const T1=at(12), T2=at(19);                                                 // two CHA @ DET games yesterday: noon (CHA wins), 7 pm (DET wins)
const game=(id,date,homePts,awayPts)=>({ id, date, shortName:'CHA @ DET', status:{type:{state:'post',completed:true,name:'STATUS_FINAL',detail:'Final',shortDetail:'Final'}},
  competitions:[{competitors:[{homeAway:'home',score:String(homePts),winner:homePts>awayPts,team:{abbreviation:'DET',shortDisplayName:'Pistons'}},
                              {homeAway:'away',score:String(awayPts),winner:awayPts>homePts,team:{abbreviation:'CHA',shortDisplayName:'Hornets'}}]}] });
const now=new Date().toISOString();
const bet=(id,extra)=>Object.assign({id,key:id,kind:'moneyline',sport:'NBA',name:'DET',team:'DET',game:'CHA @ DET',market:'Moneyline',betnow:'DET ML',book:'DraftKings',odds:'-150',stake:5,date:DAY,snap:{at:now}},extra);
const LOG=[
  bet('typed',  {dateSet:true, manual:true, start:null, srcType:'manual'}),         // typed game + chosen date, saved today
  bet('picked', {dateSet:true, manual:true, start:T2,   srcType:'manual'}),         // picked the 7 pm game from the ESPN list, saved today
  bet('board',  {srcType:'api', start:null})                                         // came from the board, not added by hand: the 4-hour rule applies
];
(async()=>{ const b=await chromium.launch(); const ctx=await b.newContext();
  await ctx.addInitScript(log=>{ try{ if(sessionStorage.getItem('seeded')) return; sessionStorage.setItem('seeded','1'); localStorage.clear(); localStorage.setItem('mbev.log',JSON.stringify(log)); }catch(e){} }, LOG);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/site\.api\.espn\.com.*\/basketball\/nba\/scoreboard/.test(u)){ const m=u.match(/dates=(\d{8})/);
      return r.fulfill({contentType:'application/json',body:JSON.stringify({events:(m&&m[1]===YMD)?[game('g1',T1,98,104),game('g2',T2,112,104)]:[]})}); }
    if(/espn\.com/.test(u)&&/scoreboard/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(3500);   // grading runs on page load
  const R=await p.evaluate(()=>Object.fromEntries(logged.map(x=>[x.id,{result:x.result||null, start:x.start||null, why:x.why&&x.why.reason||null}])));
  check('typed game with the date you chose, saved after the game: graded', R.typed.result!=null, R.typed);
  check('picked game: graded against that exact game (7 pm, DET won), not the noon game', R.picked.result==='win' && R.picked.start===new Date(T2).toISOString(), R.picked);
  check('a bet from the board saved after kickoff still isn’t matched (4-hour rule kept)', R.board.result==null && R.board.why==='game not found on ESPN', R.board);
  check('no page errors', errs.length===0, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
