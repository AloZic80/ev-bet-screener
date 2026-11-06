// node tests/check-results-test.js — "Check results" (v3.84) never undoes a result you set yourself, and never erases a settled
// result when ESPN cannot grade the bet. Alonzo: "I put WON WON and LOST, press Check results again, they come back."
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const at=(d,h)=>new Date(d+'T'+String(h).padStart(2,'0')+':00:00-05:00').toISOString();
const bet=(id,o)=>Object.assign({id,key:id,sport:'NBA',kind:'prop',book:'Novig',odds:'-110',stake:5,date:'2026-10-31',game:'LAL @ BOS',name:'Jaylen Brown',side:'O',market:'24.5 Points',betnow:'Over 24.5',start:at('2026-10-31',18),snap:{at:at('2026-10-31',12)}},o);
const LOG=[bet('m1'), bet('m2',{name:'Austin Reaves',market:'5.5 Assists'}), bet('m3',{kind:'moneyline',name:'LAL',team:'LAL',market:'Moneyline',betnow:'LAL ML'}),   // to be graded by hand in Look out
  bet('s1',{name:'Derrick White',market:'2.5 Threes',result:'win',resultSrc:'Novig'})];   // settled by the book; ESPN cannot grade it
const EV={events:[{id:'401',date:at('2026-10-31',18),status:{type:{state:'post',completed:true,shortDetail:'Final'}},competitions:[{competitors:[
  {homeAway:'away',score:'101',winner:false,team:{abbreviation:'LAL'}},{homeAway:'home',score:'112',winner:true,team:{abbreviation:'BOS'}}]}]}]};
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago'});
  await ctx.addInitScript(L=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.log',JSON.stringify(L)); }catch(e){} }, LOG);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/basketball\/nba\/scoreboard/.test(u)) return r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(EV)});
    if(/espn/.test(u)) return r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:'{}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1500); await p.click('.tab[data-view="v-log"]'); await p.waitForTimeout(400);
  const res=()=>p.evaluate(()=>({r:logged.map(x=>x.id+':'+(x.result||'-')).join(' '), look:document.querySelectorAll('#lookOut .lo-row').length}));
  const before=await res();
  // v3.96: Look out bets from the last 30 days are graded on their own: m3 (LAL moneyline, LAL lost 101-112) is Lost before you tap
  const auto=await res();
  check('v3.96: the LAL moneyline from 10/31 is graded Lost on its own (ESPN), only the 2 props wait for you', /m3:loss/.test(auto.r) && auto.look===2, auto);
  for(const r of ['win','win']){ await p.click('#lookOut .lo-res[data-res="'+r+'"]'); await p.waitForTimeout(250); }
  const graded=await res();
  await p.click('#checkResults'); await p.waitForTimeout(1500);
  const after=await res();
  check('Look out had the 2 props ESPN cannot grade (the moneyline graded itself)', before.look===2, before);
  check('Won, Won, Lost set by you', /m1:win m2:win m3:loss/.test(graded.r) && graded.look===0, graded);
  check('Check results again keeps your results (ESPN says LAL lost, your Lost stays; props it cannot grade stay Won)', /m1:win m2:win m3:loss/.test(after.r) && after.look===0, after);
  check('a result the book settled is not erased when ESPN cannot grade the bet', /s1:win/.test(after.r), after.r);
  await p.reload(); await p.waitForTimeout(1500); await p.click('.tab[data-view="v-log"]'); await p.waitForTimeout(300); await p.click('#checkResults'); await p.waitForTimeout(1500);
  const again=await res();
  check('after a reload and another Check results, still all set', /m1:win m2:win m3:loss s1:win/.test(again.r) && again.look===0, again);
  check('no page errors', !errs.length, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
