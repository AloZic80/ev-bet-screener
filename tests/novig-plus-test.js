// node tests/novig-plus-test.js — v4.40. Alonzo, 11/9: his Novig portfolio shows "Jonathan Lekkerimaki 2+ Yes · Shots On Goal", $2.15 to pay $4.17,
// PHI @ VAN 8:30 PM, placed 1:07 PM; at 1:17 the screener's card "Lekkerimaki Over 1.5 Shots · Novig -108" still asked him to bet it.
// "2+" is Over 1.5 even when Novig also sends 2 as the line; the board checks your book fills themselves (logged or not); and the whole flow, a fills
// read in Novig's words, ends with the card ALREADY BET.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const NOW=Date.parse('2026-11-09T19:17:00Z'), H=3600e3, iso=ms=>new Date(ms).toISOString(), DAY='2026-11-09';
const TIP=Date.parse('2026-11-10T02:30:00Z');
const T=(ha,abbr,loc,nick)=>({ha,id:abbr,abbr,name:loc+' '+nick,loc,nick,logo:'',rec:'',color:'333333',alt:'ffffff'});
const prop=(id,name,market,side,extra)=>Object.assign({name,team:'VAN',game:'PHI @ VAN',matchup:'PHI @ VAN',side,sport:'NHL',market,kind:'prop',book:'Novig',offeredRaw:'-108',offeredProb:0.519,fairProb:0.555,fairRaw:'-125',mktProb:0.526,stars:4,evModel:'projection',projValue:2.1,
  gameInfo:{state:'pre',startISO:iso(TIP),timeCT:'',detail:'',teams:[T('away','PHI','Philadelphia','Flyers'),T('home','VAN','Vancouver','Canucks')]},src:'api:NHL:props',apiKey:id,loadedAt:iso(NOW-60e3)},extra||{});
const ROWS=[prop('r1','Jonathan Lekkerimaki','1.5 Shots','O'), prop('r2','Jonathan Lekkerimaki','2.5 Shots','O',{offeredRaw:'+170',offeredProb:0.37,fairProb:0.42}), prop('r3','Will Cuylle','1.5 Shots','O',{team:'NYR'})];
// the fill as the Worker sends it: "2+" is not "player line STAT", so no player; Novig's strike 2 as the line; the outcome "Yes" → O
const FILL={book:'novig', id:'db2f96ba5aaf', ref:'mk-lek', outcome:'o-yes', action:'buy', price:0.515, qty:4.17, cost:2.15, fee:0, ts:Date.parse('2026-11-09T19:07:00Z'),
  title:'Jonathan Lekkerimaki 2+ SHOTS_ON_GOAL · Yes', bet:{sport:'NHL', start:iso(TIP), desc:'Jonathan Lekkerimaki 2+ SHOTS_ON_GOAL', kind:'prop', player:null, statText:'Jonathan Lekkerimaki 2+ SHOTS_ON_GOAL', line:2, side:'O'}};
async function page(seed){
  const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:1280,height:900}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(([R,d,s])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.log',JSON.stringify(s.log||[])); if(s.myFills) localStorage.setItem('mbev.myFills',JSON.stringify(s.myFills)); localStorage.setItem('mbev.pass','x'); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig, Kalshi',cfgVer:3.03})); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows:R})); }catch(e){} }, [ROWS,DAY,seed]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/api\.0xbeta\.dev\/mine\/fills/.test(u)) return r.fulfill({contentType:'application/json',body:JSON.stringify(seed.serve?{fills:[JSON.parse(JSON.stringify(FILL))],settlements:[]}:{fills:[],settlements:[]})});
    if(/api\.0xbeta\.dev/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'});
    if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1200);
  return {b,p,errs};
}
const rowsOf=p=>p.evaluate(()=>Object.fromEntries(lastRows.map(r=>[r.apiKey,{prior:!!r.prior, flags:(r.flags||[]).filter(f=>f[0]==='dupe').map(f=>f[1]).join(' | ')}])));
(async()=>{
  // 1. how the app reads Novig's "2+"
  let {b,p,errs}=await page({});
  const nf=await p.evaluate(F=>{ const f=JSON.parse(JSON.stringify(F)); normFillBet(f); return f.bet; }, FILL);
  check('"Jonathan Lekkerimaki 2+ SHOTS_ON_GOAL" with Novig\'s line 2 reads as Jonathan Lekkerimaki, Over 1.5, Shots On Goal', nf.player==='Jonathan Lekkerimaki' && nf.line===1.5 && nf.side==='O' && /SHOTS ON GOAL/i.test(nf.statText), nf);
  const ps=await p.evaluate(()=>{ const L=(m,o)=>Object.assign({name:'Jonathan Lekkerimaki',market:m,side:'O',sport:'NHL',kind:'prop'},o||{}), r=(m,sd)=>({name:'Jonathan Lekkerimaki',market:m,side:sd||'O',sport:'NHL',kind:'prop'});
    return {fromBook:propSame(L('2 Shots On Goal',{autoFrom:'novig'}),r('1.5 Shots')), notTyped:propSame(L('2 Shots On Goal'),r('1.5 Shots')), not25:propSame(L('2 Shots On Goal',{autoFrom:'novig'}),r('2.5 Shots')), under:propSame(L('2 Shots On Goal',{autoFrom:'novig'}),r('1.5 Shots','U'))}; });
  check('a bet already logged from Novig as "2 Shots On Goal" is Over 1.5 (from a book only; not 2.5, not the Under)', ps.fromBook && !ps.notTyped && !ps.not25 && !ps.under, ps);
  check('with no fills and no log, the card is bettable', !(await rowsOf(p)).r1.prior, null);
  check('no page errors (1)', !errs.length, errs); await b.close();
  // 2. the fill alone (kept from the last read, not in the Bet log) makes the card ALREADY BET
  ({b,p,errs}=await page({myFills:[{id:'db2f96ba5aaf', book:'novig', bet:Object.assign({},FILL.bet,{player:'Jonathan Lekkerimaki', statText:'SHOTS ON GOAL', line:1.5}), price:0.515, cost:2.15, ts:FILL.ts, sold:false}]}));
  let R=await rowsOf(p);
  check('a Novig fill that is not in the Bet log still makes Over 1.5 ALREADY BET at -106 (your price, 51.5%)', R.r1.prior && /ALREADY BET at -106/.test(R.r1.flags), R.r1);
  check('Over 2.5 and Will Cuylle stay bettable', !R.r2.prior && !R.r3.prior, [R.r2,R.r3]);
  check('the card is gone from Place these', !(await p.evaluate(()=>[...document.querySelectorAll('#placeCards .sc-card')].some(c=>/Lekkerimaki/.test(c.textContent) && /Over 1\.5/.test(c.textContent)))), null);
  check('no page errors (2)', !errs.length, errs); await b.close();
  // 3. the whole flow: the fills read brings Novig's words; the card ends ALREADY BET and the bet is in the log
  ({b,p,errs}=await page({serve:true}));
  await p.evaluate(()=>syncFills(true)); await p.waitForTimeout(800);
  R=await rowsOf(p); const lg=await p.evaluate(()=>logged.map(x=>({name:x.name, market:x.market, side:x.side, book:x.book, stake:x.stake})));
  check('after the fills read: Over 1.5 is ALREADY BET and your $2.15 Novig bet is in the Bet log', R.r1.prior && /ALREADY BET/.test(R.r1.flags) && lg.length===1 && lg[0].stake===2.15 && /Lekkerimaki/.test(lg[0].name), {row:R.r1, lg});
  check('Over 2.5 stays bettable', !R.r2.prior, R.r2);
  check('no page errors (3)', !errs.length, errs); await b.close();
  // 4. bets already logged as "2 Shots On Goal" from Novig are corrected once: Over 1.5; an automatic PUSH at 2 is a WIN at 1.5; your own grade stays
  const old=(id,o)=>Object.assign({id,key:id,name:'Will Cuylle',sport:'NHL',kind:'prop',market:'2 Shots On Goal',side:'O',betnow:'O 2 -104',book:'Novig',odds:'-104',stake:3.07,date:'2026-11-08',dateSet:true,start:'2026-11-09T00:00:00Z',autoFrom:'novig',fixSog94:1,snap:{at:'2026-11-08T18:00:00Z'}},o);   // fixSog94: done long ago on his phone (v3.94)
  ({b,p,errs}=await page({log:[old('a',{result:'push',resultSrc:'ESPN'}), old('b',{result:'push',gradedBy:'manual'}), old('c',{result:'loss',resultSrc:'ESPN'}), old('d',{autoFrom:undefined, market:'2 Shots On Goal'}), old('e',{market:'1.5 Shots On Goal'})]}));
  await p.evaluate(()=>autoGradeLog()); await p.waitForTimeout(600);
  const fx=await p.evaluate(()=>Object.fromEntries(logged.map(x=>[x.id,{m:x.market, r:x.result||null, bn:x.betnow, ed:(x.edits||[]).length}])));
  check('Novig "2 Shots On Goal" (an automatic push) becomes Over 1.5 and a WIN, the old text kept in edits', fx.a.m==='1.5 Shots On Goal' && fx.a.r==='win' && fx.a.bn==='O 1.5 -104' && fx.a.ed===1, fx.a);
  check('a push you set yourself keeps your result (the line is still corrected)', fx.b.m==='1.5 Shots On Goal' && fx.b.r==='push', fx.b);
  check('a loss stays a loss', fx.c.m==='1.5 Shots On Goal' && fx.c.r==='loss', fx.c);
  check('a bet not logged from a Novig fill, and a .5 line, are left alone', fx.d.m==='2 Shots On Goal' && fx.e.m==='1.5 Shots On Goal' && fx.e.ed===0, [fx.d,fx.e]);
  const again=await p.evaluate(async()=>{ await autoGradeLog(); return logged.find(x=>x.id==='a').market; });
  check('it runs once (a second check does not move 1.5 again)', again==='1.5 Shots On Goal', again);
  check('no page errors (4)', !errs.length, errs); await b.close();
  console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail?1:0);
})();
