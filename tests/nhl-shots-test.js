// node tests/nhl-shots-test.js — v3.94, with ESPN's real box score of PHI @ NYR, 11/5 (tests/fixtures-nhl-2026-11-05.json).
// Pavel Dorofeyev: 4 shots, 1 goal. His Novig Over 2.5 Shots On Goal won (Novig paid $8.97), but the app read "Shots On GOAL"
// as goals (1) and graded it Lost, or left it in Look out. Shots now come first; bets graded the old way are graded again.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8'), FX=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures-nhl-2026-11-05.json'),'utf8'));
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const bet=(id,o)=>Object.assign({id,key:id,sport:'NHL',kind:'prop',book:'Novig',odds:'-115',stake:4.8,date:'2026-11-05',dateSet:true,game:'',matchup:'',name:'Pavel Dorofeyev',side:'O',market:'2.5 Shots On Goal',betnow:'O 2.5 -115',start:'2026-11-06T00:00:00.000Z',autoFrom:'novig',snap:{at:'2026-11-05T23:45:00Z'}},o);
const LOG=[bet('auto'),   // logged on its own from Novig: no teams, found by the player in the box score
  bet('old',{game:'PHI @ NYR',result:'loss'}),   // graded Lost by the old rule
  bet('mine',{game:'PHI @ NYR',result:'loss',gradedBy:'manual',resultSrc:'you'}),   // your own result stays
  bet('goal',{game:'PHI @ NYR',market:'0.5 Goals',betnow:'O 0.5 +200'}),   // goals still read as goals (1)
  bet('ft',{game:'PHI @ NYR',name:'Will Cuylle',market:'2.5 Shots On Goal'})];   // a PHI player
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago'}); await ctx.clock.install({time:new Date('2026-11-06T05:03:00Z')});
  await ctx.addInitScript(L=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.log',JSON.stringify(L));
    localStorage.setItem('mbev.fillSeen',JSON.stringify({'novig:ign1':{s:'ignored',q:2.12}})); localStorage.setItem('mbev.fillV','95');
    localStorage.setItem('mbev.fillPending',JSON.stringify([{book:'novig',id:'ign1',ref:'01a17446',price:.545,qty:2.12,cost:1.16,fee:0,action:'buy',ts:Date.now()}])); }catch(e){} }, LOG);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(), H={'access-control-allow-origin':'*'}; if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/hockey\/nhl\/scoreboard/.test(u)) return r.fulfill({contentType:'application/json',headers:H,body:JSON.stringify(/dates=20261105/.test(u)?FX.scoreboard:{events:[]})});
    if(/hockey\/nhl\/summary/.test(u)) return r.fulfill({contentType:'application/json',headers:H,body:JSON.stringify(FX.summary)});
    if(/espn/.test(u)) return r.fulfill({contentType:'application/json',headers:H,body:'{}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(4000);
  const R=await p.evaluate(()=>Object.fromEntries(logged.map(x=>[x.id,x.result||'-'])));
  check('Dorofeyev Over 2.5 Shots On Goal (4 shots) is Won, as Novig paid it; found by the player with no teams saved', R.auto==='win', R);
  check('a shots bet the old rule graded Lost is graded again: Won', R.old==='win', R);
  check('a result you set yourself is not touched', R.mine==='loss', R);
  check('a goals bet still reads goals: Over 0.5 Goals (1 goal) Won', R.goal==='win', R);
  check('Will Cuylle (PHI, 0 shots) Over 2.5 Shots On Goal: Lost, from the shots column', R.ft==='loss', R);
  await p.evaluate(()=>{ renderFromBooks(); });
  check('a fill ignored on another device (synced as ignored) is not listed in From your books', await p.evaluate(()=>!document.querySelector('#fromBooks .fb-ign')), await p.evaluate(()=>fillPending.length));
  check('no page errors', !errs.length, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
