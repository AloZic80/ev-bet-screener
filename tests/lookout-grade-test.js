// node tests/lookout-grade-test.js — v3.96, with ESPN's real box scores. Alonzo, 11/5 11:44 PM: "you can't check those 2 and just
// apply if won or lost? You have the dates they played and the ESPN api." Both were in Look out:
//  - Saquon Barkley Over 53.5 Rushing Yards, Sun 11/1 PHI @ WSH (13 carries, 30 yards: Lost): grading only looked 4 days back.
//  - Pavel Dorofeyev Over 2.5 Shots On Goal, Thu 11/5 PHI @ NYR (4 shots: Won), logged from Novig: the phone read the fill after
//    10 PM, and the 4-hour rule counted from then, so the 6 PM game "started too long before the bet".
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8'), NHL=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures-nhl-2026-11-05.json'),'utf8')), NFL=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures-nfl-2026-11-01.json'),'utf8'));
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const LOG=[
  {id:'saq',key:'saq',sport:'NFL',kind:'prop',book:'Novig',odds:'+120',stake:5,date:'2026-11-01',dateSet:true,manual:true,game:'PHI @ WSH',matchup:'PHI @ WSH',name:'Saquon Barkley',side:'O',market:'53.5 Rushing Yards',betnow:'O 53.5 +120',snap:{at:'2026-11-02T02:00:00Z'}},
  {id:'saq2',key:'saq2',sport:'NFL',kind:'prop',book:'Novig',odds:'+120',stake:5,date:'2026-11-01',dateSet:true,game:'PHI @ WSH',matchup:'PHI @ WSH',name:'Saquon Barkley',side:'O',market:'53.5 Rushing Yards',betnow:'O 53.5 +120',fills:['f-saq'],snap:{at:'2026-11-05T22:00:00Z'}},   // v3.97: Alonzo's real case: logged from the Novig fill on 11/5, not "by hand"
  {id:'saq3',key:'saq3',sport:'NFL',kind:'prop',book:'Novig',odds:'+120',stake:5,date:'2026-11-01',dateSet:true,game:'',matchup:'',name:'Saquon Barkley',side:'O',market:'53.5 Rushing Yards',betnow:'O 53.5 +120',autoFrom:'novig',fills:['f-saq3'],snap:{at:'2026-11-05T22:00:00Z'}},   // the same with no teams saved
  {id:'dor',key:'dor',sport:'NHL',kind:'prop',book:'Novig',odds:'-115',stake:4.8,date:'2026-11-05',dateSet:true,game:'',matchup:'',name:'Pavel Dorofeyev',side:'O',market:'2.5 Shots On Goal',betnow:'O 2.5 -115',start:'2026-11-06T00:00:00.000Z',autoFrom:'novig',fills:['f-dor'],fixSog94:1,fix83:1,snap:{at:'2026-11-06T04:30:00Z'}}];   // read at 10:30 PM
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago'}); await ctx.clock.install({time:new Date('2026-11-06T05:44:00Z')});
  await ctx.addInitScript(L=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.log',JSON.stringify(L)); }catch(e){} }, LOG);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(), H={'access-control-allow-origin':'*'}, J=o=>r.fulfill({contentType:'application/json',headers:H,body:JSON.stringify(o)});
    if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/hockey\/nhl\/scoreboard/.test(u)) return J(/dates=20261105/.test(u)?NHL.scoreboard:{events:[]});
    if(/hockey\/nhl\/summary/.test(u)) return J(NHL.summary);
    if(/football\/nfl\/scoreboard/.test(u)) return J(/dates=20261101/.test(u)?NFL.scoreboard:{events:[]});
    if(/football\/nfl\/summary/.test(u)) return J(NFL.summary);
    if(/espn/.test(u)) return J({}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(5000);
  const R=await p.evaluate(()=>Object.fromEntries(logged.map(x=>[x.id,x.result||'-'])));
  check('Saquon Over 53.5 Rushing Yards (30 yards), game 4 days ago: graded Lost on its own', R.saq==='loss', R);
  check('v3.97: the same Saquon bet logged from the Novig fill on 11/5 (not by hand): Lost', R.saq2==='loss', R);
  check('v3.97: and with no teams saved: Lost', R.saq3==='loss', R);
  check('Dorofeyev Over 2.5 SOG (4 shots), logged from Novig after 10 PM: graded Won on its own', R.dor==='win', R);
  await p.click('.tab[data-view="v-log"]'); await p.waitForTimeout(300);
  const n=await p.evaluate(()=>document.querySelectorAll('#lookOut .lo-row').length);
  check('Look out is empty', n===0, n);
  check('no page errors', !errs.length, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
