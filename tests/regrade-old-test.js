// node tests/regrade-old-test.js — v3.95. v3.94 cleared the results of NHL shots bets of every age so they would be graded again
// with the shots fix, but grading only looks at the last 4 days: older ones went to Look out ("30 to check"). Now every bet v3.94
// cleared is graded again, whatever its age. ESPN's real box score of PHI @ NYR, 11/5 (Dorofeyev: 4 shots, 1 goal), 11 days later.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8'), FX=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures-nhl-2026-11-05.json'),'utf8'));
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const bet=(id,o)=>Object.assign({id,key:id,sport:'NHL',kind:'prop',book:'Novig',odds:'-115',stake:4.8,date:'2026-11-05',game:'PHI @ NYR',matchup:'PHI @ NYR',name:'Pavel Dorofeyev',side:'O',market:'2.5 Shots On Goal',betnow:'O 2.5 -115',start:'2026-11-06T00:00:00.000Z',fix83:1,snap:{at:'2026-11-05T23:45:00Z'}},o);
const LOG=[bet('cleared',{fixSog94:1}),   // what v3.94 left on the phone: no result
  bet('cleared2',{fixSog94:1, game:'', matchup:'', autoFrom:'novig'}),   // logged from Novig with no teams
  bet('notyet',{result:'loss'}),   // a device that never ran v3.94: graded Lost the old way
  bet('plain',{market:'2.5 Shots',result:'win'}),   // "Shots" was always graded right: left alone
  bet('mine',{fixSog94:1, result:'loss', gradedBy:'manual', resultSrc:'you'})];
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago'}); await ctx.clock.install({time:new Date('2026-11-16T18:00:00Z')});
  await ctx.addInitScript(L=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.log',JSON.stringify(L)); }catch(e){} }, LOG);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(), H={'access-control-allow-origin':'*'}; if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/hockey\/nhl\/scoreboard/.test(u)) return r.fulfill({contentType:'application/json',headers:H,body:JSON.stringify(/dates=20261105/.test(u)?FX.scoreboard:{events:[]})});
    if(/hockey\/nhl\/summary/.test(u)) return r.fulfill({contentType:'application/json',headers:H,body:JSON.stringify(FX.summary)});
    if(/espn/.test(u)) return r.fulfill({contentType:'application/json',headers:H,body:'{}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(4000);
  const R=await p.evaluate(()=>Object.fromEntries(logged.map(x=>[x.id,x.result||'-'])));
  check('11 days later: a shots bet v3.94 cleared is graded again (Won, 4 shots)', R.cleared==='win', R);
  check('the same with no teams saved (logged from Novig)', R.cleared2==='win', R);
  check('a bet graded the old way, from a device that never ran v3.94, is graded again: Won', R.notyet==='win', R);
  check('a plain "Shots" bet keeps its result', R.plain==='win', R);
  check('your own result stays', R.mine==='loss', R);
  await p.click('.tab[data-view="v-log"]'); await p.waitForTimeout(300);
  { const n=await p.evaluate(()=>document.querySelectorAll('#lookOut .lo-row').length); check('nothing left in Look out', n===0, n); }
  check('no page errors', !errs.length, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
