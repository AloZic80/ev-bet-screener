// node tests/v525-grading-test.js — v5.25 (Build A, owner "FIX" 11/21): results you can trust.
// GRADING-1 Check results never re-grades an old bet from a later meeting of the same teams (the real #checkResults button, the real NHL capture of 11/05);
// GRADING-2 Live Games never settles tomorrow's bet from tonight's final; GRADING-3 a postponed game is not a 0-0 final; GRADING-4 a same-name player in
// another game does not grade a Novig prop; GRADING-5 a doubleheader bet on game 2 is not graded on game 1; GRADING-6 a void stays void; GRADING-K1 a
// prop exactly on a whole-number line is a push; GRADING-8 a book's result is not cleared when its fill was read the day after.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
const FX=require('./fixtures-nhl-2026-11-05.json');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const H={'access-control-allow-origin':'*'}; const J=o=>({contentType:'application/json',headers:H,body:JSON.stringify(o)});
const ev=(id,date,away,home,as,hs,st)=>({id,date,status:{type:Object.assign({state:'post',completed:true,name:'STATUS_FINAL',shortDetail:'Final'},st||{})},
  competitions:[{competitors:[{homeAway:'away',score:String(as),team:{abbreviation:away}},{homeAway:'home',score:String(hs),team:{abbreviation:home}}]}]});
const box=(players,done)=>({header:{competitions:[{status:{type:{state:done===false?'in':'post',completed:done!==false}}}]},boxscore:{players}});
async function boot(b, {now, log, route}){
  const ctx=await b.newContext({timezoneId:'America/Chicago'});
  await ctx.addInitScript(L=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.log',JSON.stringify(L)); }catch(e){} }, log);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  if(now) await p.clock.setFixedTime(new Date(now));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/espn/.test(u)){ const a=route&&route(u); return r.fulfill(J(a||{events:[]})); } return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(2500);
  return {ctx, p, errs};
}
const res=(p)=>p.evaluate(()=>Object.fromEntries(logged.map(x=>[x.id,{r:x.result||'-',start:x.start||'',game:x.game||'',why:x.why?x.why.reason:''}])));
(async()=>{
  const b=await chromium.launch(); const allErrs=[];
  // ---------- GRADING-1: the real Check results button, tonight's PHI @ NYR final (NYR 3-2, Acciari 1 goal, 2 shots) ----------
  { const OLD='2026-10-18T23:00:00Z';
    const bet=(id,x)=>Object.assign({id,key:id,sport:'NHL',game:'PHI @ NYR',book:'DraftKings',odds:'-110',stake:10,date:'2026-10-18',start:OLD,snap:{at:'2026-10-18T17:00:00Z'}},x);
    const LOG=[bet('ml-old',{kind:'moneyline',name:'PHI',team:'PHI',market:'Moneyline',betnow:'PHI ML',result:'win'}),
      bet('tot-old',{kind:'total',name:'PHI @ NYR',market:'4.5 Total',side:'U',betnow:'U 4.5',result:'win'}),
      bet('goal-old',{kind:'prop',name:'Noel Acciari',market:'0.5 Goals',side:'U',betnow:'U 0.5',result:'win'}),
      bet('book-old',{kind:'prop',name:'Noel Acciari',market:'0.5 Goals',side:'U',betnow:'U 0.5',book:'Kalshi',result:'win',gradedBy:'book',resultSrc:'Kalshi'}),
      bet('nostart',{kind:'moneyline',name:'PHI',team:'PHI',market:'Moneyline',betnow:'PHI ML',result:'win',start:undefined,noStart:1}),
      bet('away-old',{kind:'moneyline',name:'PHI',team:'PHI',market:'Moneyline',betnow:'PHI ML',game:'NYR @ PHI',date:'2026-10-09',start:'2026-10-09T23:00:00Z',snap:{at:'2026-10-09T17:00:00Z'},result:'win'}),
      bet('loss-old',{kind:'moneyline',name:'NYR',team:'NYR',market:'Moneyline',betnow:'NYR ML',result:'loss'}),
      bet('tonight',{kind:'moneyline',name:'NYR',team:'NYR',market:'Moneyline',betnow:'NYR ML',date:'2026-11-05',start:'2026-11-06T00:00:00Z',snap:{at:'2026-11-05T20:00:00Z'},result:'loss'})];   // saved wrong: the button puts tonight's own bet right
    const {ctx,p,errs}=await boot(b,{now:'2026-11-06T05:00:00Z', log:LOG, route:u=>{ if(/hockey\/nhl\/scoreboard/.test(u)){ const d=(u.match(/dates=(\d{8})/)||[])[1]; return (!d||d==='20261105')?FX.scoreboard:{events:[]}; }
      if(/hockey\/nhl\/summary/.test(u) && /401892653/.test(u)) return FX.summary; return null; }});
    await p.click('.tab[data-view="v-log"]'); await p.waitForTimeout(400); await p.click('#checkResults'); await p.waitForTimeout(2500);
    const r=await res(p), stored=await p.evaluate(()=>JSON.parse(localStorage.getItem('mbev.log')).map(x=>x.id+':'+(x.result||'-')).join(' '));
    check('GRADING-1: one press of Check results with a rematch final today leaves every bet settled on an earlier meeting as it was (moneyline, total, props, book-settled, no start, swapped venue, a loss)',
      ['ml-old','tot-old','goal-old','book-old','nostart','away-old'].every(k=>r[k].r==='win') && r['loss-old'].r==='loss', r);
    check('GRADING-1: tonight’s own bet is still graded by the button (NYR won 3-2)', r.tonight.r==='win', r.tonight);
    check('GRADING-1: what was saved matches', /ml-old:win .*loss-old:loss tonight:win/.test(stored), stored);
    allErrs.push(...errs); await ctx.close(); }
  // ---------- GRADING-2: Live Games, Friday DET @ CHA final 99-110, bets carry Saturday CHA @ DET ----------
  { const SAT='2026-11-22T00:00:00Z', bet=(id,x)=>Object.assign({id,key:id,sport:'NBA',game:'CHA @ DET',book:'DraftKings',odds:'-110',stake:10,date:'2026-11-21',start:SAT,snap:{at:'2026-11-20T20:00:00Z'}},x);
    const LOG=[bet('det-ml',{kind:'moneyline',name:'DET',team:'DET',market:'Moneyline',betnow:'DET ML'}), bet('over',{kind:'total',name:'CHA @ DET',market:'215.5 Total',side:'O',betnow:'O 215.5'}),
      bet('cha-sp',{kind:'spread',name:'CHA',team:'CHA',market:'+3.5 Spread',betnow:'CHA +3.5'})];
    const FRI=ev('fri','2026-11-21T00:00Z','DET','CHA',99,110);
    const {ctx,p,errs}=await boot(b,{now:'2026-11-21T03:30:00Z', log:LOG, route:u=>{ if(/basketball\/nba\/scoreboard/.test(u)){ const d=(u.match(/dates=(\d{8})/)||[])[1]; return (!d||d==='20261120')?{events:[FRI]}:{events:[]}; } return null; }});
    await p.click('.tab[data-view="v-live"]'); await p.waitForTimeout(2500);
    const r=await res(p);
    check('GRADING-2: Live Games does not settle Saturday’s bets from Friday’s final of the same two teams', ['det-ml','over','cha-sp'].every(k=>r[k].r==='-'), r);
    allErrs.push(...errs); await ctx.close(); }
  // ---------- GRADING-3: a postponed game (real ESPN shape: STATUS_POSTPONED, state post, completed false, 0-0) ----------
  { const bet=(id,x)=>Object.assign({id,key:id,sport:'NBA',game:'LAL @ DEN',book:'DraftKings',odds:'-110',stake:10,date:'2026-11-20',start:'2026-11-21T02:00:00Z',snap:{at:'2026-11-19T20:00:00Z'}},x);
    const LOG=[bet('under',{kind:'total',name:'LAL @ DEN',market:'220.5 Total',side:'U',betnow:'U 220.5'}), bet('lal',{kind:'spread',name:'LAL',team:'LAL',market:'+4.5 Spread',betnow:'LAL +4.5'})];
    const PPD=ev('ppd','2026-11-21T02:00Z','LAL','DEN',0,0,{id:'6',name:'STATUS_POSTPONED',state:'post',completed:false,detail:'Postponed',shortDetail:'Postponed'});
    const {ctx,p,errs}=await boot(b,{now:'2026-11-21T05:00:00Z', log:LOG, route:u=>/basketball\/nba\/scoreboard/.test(u)?{events:[PPD]}:null});
    const r1=await res(p); await p.click('.tab[data-view="v-log"]'); await p.waitForTimeout(400); await p.click('#checkResults'); await p.waitForTimeout(1500);
    const r2=await res(p), look=await p.evaluate(()=>[...document.querySelectorAll('#lookOut .lo-why')].map(x=>x.textContent).join(' | '));
    check('GRADING-3: a postponed game grades nothing (no Under win, no spread win from a 0-0 "final")', !['win','loss','push'].includes(r1.under.r) && !['win','loss','push'].includes(r1.lal.r), r1);
    check('GRADING-3: Check results grades nothing either', !['win','loss','push'].includes(r2.under.r) && !['win','loss','push'].includes(r2.lal.r), r2);
    check('GRADING-3: Look out says why (postponed / cancelled: ask the book)', (look.match(/postponed \/ cancelled: ask the book/g)||[]).length===2, look);
    const pl=await p.evaluate(P=>typeof evPlayed!=='function'?'no evPlayed':({ppd:evPlayed(P), fin:evPlayed({status:{type:{state:'post',completed:true,name:'STATUS_FINAL'}}}), can:evPlayed({status:{type:{state:'post',completed:true,name:'STATUS_CANCELED'}}})}), PPD);
    check('GRADING-3: evPlayed: postponed no, final yes, cancelled no', pl.ppd===false && pl.fin===true && pl.can===false, pl);
    allErrs.push(...errs); await ctx.close(); }
  // ---------- GRADING-5: doubleheader NYY @ BOS, bets on game 2 (6:10 pm), game 1 final 2-7 at 4 pm ----------
  { const G2='2026-11-22T00:10:00Z', bet=(id,x)=>Object.assign({id,key:id,sport:'MLB',game:'NYY @ BOS',book:'DraftKings',odds:'-110',stake:10,date:'2026-11-21',start:G2,snap:{at:'2026-11-21T15:00:00Z'},kind:'moneyline',name:'NYY',team:'NYY',market:'Moneyline',betnow:'NYY ML'},x);
    const LOG=[bet('board'), bet('hand',{manual:true,dateSet:true})];
    const E1=ev('g1','2026-11-21T18:10Z','NYY','BOS',2,7), E2=ev('g2',G2.replace(':00Z','Z'),'NYY','BOS',0,0,{state:'pre',completed:false,name:'STATUS_SCHEDULED'});
    const {ctx,p,errs}=await boot(b,{now:'2026-11-21T22:00:00Z', log:LOG, route:u=>/baseball\/mlb\/scoreboard/.test(u)?{events:[E1,E2]}:null});
    const r=await res(p);
    check('GRADING-5: bets on game 2 are not graded from game 1 (still open at 4 pm)', r.board.r==='-' && r.hand.r==='-', r);
    check('GRADING-5: their start stays game 2’s', Date.parse(r.board.start)===Date.parse(G2) && Date.parse(r.hand.start)===Date.parse(G2), r);
    allErrs.push(...errs); await ctx.close(); }
  // ---------- GRADING-4: NHL Sebastian Aho, a Novig prop with no teams, his game at 6 pm; another Aho played at noon ----------
  { const T0='2026-11-22T00:00:00Z';
    const LOG=[{id:'aho',key:'aho',sport:'NHL',kind:'prop',name:'Sebastian Aho',market:'2.5 Shots On Goal',side:'O',betnow:'O 2.5',book:'Novig',autoFrom:'novig',dateSet:true,date:'2026-11-21',game:'',odds:'-110',stake:10,start:T0,placedAt:'2026-11-21T20:00:00Z',snap:{at:'2026-11-21T20:00:00Z'}}];
    const NOON=ev('noon','2026-11-21T18:00Z','PIT','NYR',2,3), SIX=ev('six','2026-11-22T00:00Z','CAR','BOS',0,0,{state:'pre',completed:false,name:'STATUS_SCHEDULED'});
    const BX=box([{team:{abbreviation:'PIT'},statistics:[{labels:['G','A','S'],athletes:[{athlete:{displayName:'Sebastian Aho'},stats:['0','0','1']}]}]}]);
    const {ctx,p,errs}=await boot(b,{now:'2026-11-21T23:50:00Z', log:LOG, route:u=>{ if(/hockey\/nhl\/scoreboard/.test(u)) return {events:[NOON,SIX]}; if(/summary/.test(u) && /noon/.test(u)) return BX; return null; }});
    const r=await res(p);
    check('GRADING-4: the noon game’s Aho does not grade the bet on the 6 pm game (no result, no game written, start kept)', r.aho.r==='-' && r.aho.game==='' && r.aho.start===T0, r.aho);
    const strict=await p.evaluate(()=>{ const B={boxscore:{players:[{statistics:[{name:'defensive',labels:['TOT','SACKS'],athletes:[{athlete:{displayName:'Josh Allen'},stats:['5','1']}]}]}]}};
      return {grade:nflStat(B,'Josh Allen','30.5 Rushing Yards'), pick:nflStat(B,'Josh Allen','30.5 Rushing Yards',true)}; });
    check('GRADING-4: picking a game needs the stat in its own table; grading a player who played keeps "0"', strict.grade===0 && strict.pick===null, strict);
    allErrs.push(...errs); await ctx.close(); }
  // ---------- GRADING-K1 (whole-number line = push) and GRADING-6 (a void stays void) and GRADING-8 (a book result read late) ----------
  { const bet=(id,x)=>Object.assign({id,key:id,sport:'NBA',game:'LAL @ DEN',book:'Novig',odds:'-110',stake:10,date:'2026-11-20',start:'2026-11-21T02:00:00Z',snap:{at:'2026-11-20T18:00:00Z'},kind:'prop',name:'Nikola Jokic'},x);
    const LOG=[bet('o27',{market:'27 Points',side:'O',betnow:'O 27'}), bet('u27',{market:'27 Points',side:'U',betnow:'U 27'}), bet('o12',{market:'12 Rebounds',side:'O',betnow:'O 12'}),
      bet('ctl',{market:'26.5 Points',side:'O',betnow:'O 26.5'}), bet('old-loss',{market:'27 Points',side:'O',betnow:'O 27',result:'loss'}),   // saved loss earlier: Check results puts push
      bet('void-pre',{kind:'moneyline',name:'MIA',team:'MIA',game:'MIA @ BOS',market:'Moneyline',betnow:'MIA ML',start:'2026-11-22T00:30:00Z',date:'2026-11-21',voided:1,voidedAt:1,result:'push'}),
      bet('void-post',{kind:'total',name:'LAL @ DEN',market:'200.5 Total',side:'U',betnow:'U 200.5',voided:1,voidedAt:1,result:'push'}),
      bet('void-lost',{kind:'prop',name:'Nobody Here',market:'10.5 Points',side:'O',betnow:'O 10.5',voided:1,voidedAt:1}),
      bet('late',{kind:'moneyline',name:'DEN',team:'DEN',game:'MIA @ ORL',market:'Moneyline',betnow:'DEN ML',book:'Kalshi',fillBook:'kalshi',fillRef:'KX1',start:'2026-11-17T00:00:00Z',date:'2026-11-16',placedAt:'2026-11-16T20:00:00Z',snap:{at:'2026-11-17T15:00:00Z'},result:'win',resultSrc:'Kalshi'}),
      bet('late2',{kind:'moneyline',name:'DEN',team:'DEN',game:'MIA @ ORL',market:'Moneyline',betnow:'DEN ML',book:'Kalshi',fillBook:'kalshi',fillRef:'KX2',start:'2026-11-17T00:00:00Z',date:'2026-11-16',snap:{at:'2026-11-17T15:00:00Z'},result:'win',gradedBy:'book'})];
    const FIN=ev('jok','2026-11-21T02:00Z','LAL','DEN',100,113);
    const BX=box([{team:{abbreviation:'DEN'},statistics:[{labels:['MIN','PTS','REB','AST'],athletes:[{athlete:{displayName:'Nikola Jokic'},stats:['36','27','12','9']}]}]}]);
    const {ctx,p,errs}=await boot(b,{now:'2026-11-21T05:00:00Z', log:LOG, route:u=>{ if(/basketball\/nba\/scoreboard/.test(u)){ const d=(u.match(/dates=(\d{8})/)||[])[1]; return (!d||d==='20261120')?{events:[FIN]}:{events:[]}; } if(/summary/.test(u) && /jok/.test(u)) return BX; return null; }});
    const r1=await res(p);
    check('K1: Over 27 and Under 27 points at 27, and Over 12 rebounds at 12, are pushes (the automatic grader)', r1.o27.r==='push' && r1.u27.r==='push' && r1.o12.r==='push', r1);
    check('K1: the control Over 26.5 at 27 is a win', r1.ctl.r==='win', r1.ctl);
    await p.click('.tab[data-view="v-log"]'); await p.waitForTimeout(400); await p.click('#checkResults'); await p.waitForTimeout(1500);
    const r2=await res(p);
    check('K1: Check results says push for a prop on its line (a loss saved before becomes push; the pushes stay)', r2['old-loss'].r==='push' && r2.o27.r==='push' && r2.u27.r==='push', [r2['old-loss'],r2.o27.r,r2.u27.r]);
    const fn=await p.evaluate(()=>({row:gradeRow({name:'Nikola Jokic',market:'27 Points',side:'O',sport:'NBA'},{boxscore:{players:[{statistics:[{labels:['PTS'],athletes:[{athlete:{displayName:'Nikola Jokic'},stats:['27']}]}]}]}}),
      pvO:propVerdict(27,27,'O',27,'post',1,'').text, pvU:propVerdict(27,27,'U',27,'post',1,'').text, pvIn:propVerdict(27,27,'U',27,'in',0.9,'').text}));
    check('K1: gradeRow (the board) says push; Live Games says Push for both sides at the final', fn.row && fn.row.push===true && /^Push/.test(fn.pvO) && /^Push/.test(fn.pvU) && !/^Push/.test(fn.pvIn), fn);
    check('GRADING-6: a bet voided before its game stays push (the v2.85 guard leaves it)', r1['void-pre'].r==='push' && r2['void-pre'].r==='push', [r1['void-pre'],r2['void-pre']]);
    check('GRADING-6: a bet voided after its game stays push when Check results runs (ESPN says the Under 200.5 lost)', r2['void-post'].r==='push', r2['void-post']);
    const look=await p.evaluate(()=>[...document.querySelectorAll('#lookOut .lo-row')].map(x=>x.textContent).join(' | '));
    check('GRADING-6: a void that lost its push is shown in Look out, not hidden', /voided, but its push was lost/.test(look), look.slice(0,300));
    check('GRADING-8: a Kalshi result read the morning after is not cleared (resultSrc Kalshi, and gradedBy book)', r1.late.r==='win' && r2.late.r==='win' && r1.late2.r==='win' && r2.late2.r==='win', [r1.late, r1.late2]);
    allErrs.push(...errs); await ctx.close(); }
  // ---------- K1 and GRADING-3 in Live Games: an open prop at 27 settles push ----------
  { const LOG=[{id:'lv',key:'lv',sport:'NBA',game:'LAL @ DEN',book:'Novig',odds:'-110',stake:10,date:'2026-11-20',start:'2026-11-21T02:00:00Z',snap:{at:'2026-11-20T18:00:00Z'},kind:'prop',name:'Nikola Jokic',market:'27 Points',side:'U',betnow:'U 27'}];
    const FIN=ev('jok','2026-11-21T02:00Z','LAL','DEN',100,113);
    const BX=box([{team:{abbreviation:'DEN'},statistics:[{labels:['MIN','PTS','REB','AST'],athletes:[{athlete:{displayName:'Nikola Jokic'},stats:['36','27','12','9']}]}]}]);
    const {ctx,p,errs}=await boot(b,{now:'2026-11-21T05:00:00Z', log:LOG, route:u=>{ if(/basketball\/nba\/scoreboard/.test(u)){ const d=(u.match(/dates=(\d{8})/)||[])[1]; return (!d||d==='20261120')?{events:[FIN]}:{events:[]}; } if(/summary/.test(u) && /jok/.test(u)) return BX; return null; }});
    await p.evaluate(()=>{ logged[0].result=undefined; delete logged[0].result; }); await p.click('.tab[data-view="v-live"]'); await p.waitForTimeout(2500);
    const r=await res(p), txt=await p.evaluate(()=>(document.querySelector('#liveBody')||{}).textContent||'');
    check('K1: Live Games settles an Under 27 at 27 as push', r.lv.r==='push', r.lv);
    allErrs.push(...errs); await ctx.close(); }
  check('no page errors', !allErrs.length, allErrs.slice(0,5));
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
