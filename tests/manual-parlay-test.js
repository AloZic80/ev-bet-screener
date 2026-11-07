// node tests/manual-parlay-test.js — v4.19. Alonzo (Parlays tab, a 2-leg slip: Devin Singletary Under 15.5 Rush Att + Drake Maye Over 20.5
// Completions): "I made this bet and saved it manually, but you don't identify it as already bet on." A parlay typed in the Bet log counts
// like one logged from the Parlays tab: its picks are left out of slips and entries, and tagged "✓ you bet this", however the legs are typed.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const NOW=Date.parse('2026-11-07T18:00:00Z');
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:1280,height:900}}); await ctx.clock.install({time:new Date(NOW)});
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(800);
  const R=await p.evaluate(()=>{
    const row=(name,team,market,side,game)=>({kind:'prop',sport:'NFL',book:'Novig',name,team,market,side,game,idx:Math.floor(Math.random()*1e6)});
    const SING=row('Devin Singletary','NYG','15.5 Rushing Attempts','U','NYG @ PHI'), MAYE=row('Drake Maye','NE','20.5 Completions','O','GB @ NE'), OTHER=row('Drake Maye','NE','25.5 Completions','O','GB @ NE'), OTHERSIDE=row('Devin Singletary','NYG','15.5 Rushing Attempts','O','NYG @ PHI');
    const run=legs=>{ logged=[{id:'pm',kind:'parlay',name:'Parlay · 2 picks',market:'2-pick parlay',book:'Novig',stake:1,odds:'+320',date:ctDay(Date.now()+86400e3),parlay:{picks:2,legs,pays:{all:4.2}}}];
      return {sing:pkParlaysWith(SING).length, maye:pkParlaysWith(MAYE).length, other:pkParlaysWith(OTHER).length, otherSide:pkParlaysWith(OTHERSIDE).length,
        tag:pkBetTag({r:SING}), left:pkNotLogged([{name:'Devin Singletary',r:SING},{name:'Drake Maye',r:MAYE},{name:'x',r:OTHER}]).map(l=>l.r.market)}; };
    return { short:run('Singletary U 15.5 rush att, Maye O 20.5 completions'), full:run('Devin Singletary Under 15.5 Rushing Attempts +105; Drake Maye Over 20.5 Completions +105'),
      lines:run('Singletary u15.5 RA\nMaye o20.5 comp'), none:run(''),
      single:(logged=[{id:'s1',kind:'prop',name:'Devin Singletary',market:'15.5 Rushing Attempts',side:'U',book:'Bovada',stake:2,odds:'+105',date:ctDay(Date.now())}], pkBetTag({r:SING})),
      singleOther:(logged=[{id:'s2',kind:'prop',name:'Devin Singletary',market:'15.5 Receptions',side:'U',book:'Bovada',stake:2,odds:'+105',date:ctDay(Date.now())}], pkBetTag({r:SING})) }; });
  check('legs typed short ("Singletary U 15.5 rush att, Maye O 20.5 completions"): both picks are found', R.short.sing===1 && R.short.maye===1, R.short);
  check('legs typed in full with ";" and odds: both found', R.full.sing===1 && R.full.maye===1, R.full);
  check('legs on new lines, "u15.5" / "o20.5": both found', R.lines.sing===1 && R.lines.maye===1, R.lines);
  check('another line (25.5) and the other side (Over 15.5) are not this bet', R.short.other===0 && R.short.otherSide===0 && R.full.other===0 && R.full.otherSide===0, R.short);
  check('the pick is tagged "✓ you bet this: in your Novig parlay (2 picks)"', /✓ you bet this: in your Novig parlay \(2 picks\)/.test(R.short.tag), R.short.tag);
  check('both picks are left out of slips and entries; another line stays', JSON.stringify(R.short.left)==='["25.5 Completions"]', R.short.left);
  check('a parlay with no legs typed changes nothing', R.none.sing===0 && R.none.left.length===3, R.none);
  check('a single typed in with + Add a bet ("Devin Singletary Under 15.5 Rushing Attempts", Bovada) is tagged "single $2.00 on Bovada"', /✓ you bet this: single \$2\.00 on Bovada/.test(R.single), R.single);
  check('the same player and line in another stat (Receptions) is not this bet', R.singleOther==='', R.singleOther);
  check('no page errors', !errs.length, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
