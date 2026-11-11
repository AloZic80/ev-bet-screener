// node tests/novig-identity-test.js — v4.72 (agreed with ChatGPT, owner "BUILD" 11/11). The 10 agreed cases:
// a Novig game total is graded only from the one ESPN game with Novig's teams at Novig's kickoff (full game), and that game is frozen; anything else
// is "NOVIG EVENT MISMATCH · review". An open, partly filled Novig order shows what was bought and the rest apart; other fill histories are
// "unknown" and never called wrong. Your own and imported corrections stay. (Commanders-Rams Under 44.5 was graded from Broncos-Panthers.)
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,600)); };
const NOW=Date.parse('2026-11-11T18:00:00Z'), KO='2026-11-08T21:25:00Z';
const ev=(id,away,home,date,as,hs)=>({id,date,competitions:[{competitors:[{homeAway:'away',team:{abbreviation:away},score:String(as)},{homeAway:'home',team:{abbreviation:home},score:String(hs)}],status:{type:{state:'post',completed:true}}}],status:{type:{state:'post',completed:true}}});
const T=(id,o)=>Object.assign({id,key:id,sport:'NFL',kind:'total',book:'Novig',autoFrom:'novig',fillBook:'novig',fillRef:'m'+id,fills:['o:'+id],fillCost:1,name:'WSH @ LAR',game:'WSH @ LAR',market:'44.5 Total',side:'U',odds:'+138',stake:1,date:'2026-11-08',dateSet:true,start:KO,result:'pending',snap:{at:'2026-11-08T15:00:00Z'}},o);
(async()=>{ const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago'}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(()=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); }catch(e){} });
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1000);
  // ESPN that Sunday: Commanders at Rams 3:25 PM CT (17-14: 31 points, Under 44.5 wins); Broncos at Panthers at the same time
  const E=[ev('401','WSH','LAR',KO,17,14), ev('402','DEN','CAR',KO,27,24)];
  const r=await p.evaluate(([E,T0])=>{ const out={}; const mk=o=>Object.assign(JSON.parse(T0),o); window.fetchScoreboardDay=async()=>E;
    // 1: exact teams and kickoff → one game, frozen
    let b=mk({}); out.c1=nvPick(b,E); out.c1={id:out.c1.ev&&out.c1.ev.id, frozen:b.espnEv, review:b.nvReview||null, grade:(()=>{ const g=gradeGameLine(b,E[0]); return g&&(g.push?'push':g.won?'win':'loss'); })()};
    // 2: teams Novig names are not in any game at that time
    b=mk({game:'DEN @ KC'}); const r2=nvPick(b,E); out.c2={ev:!!r2.ev, review:b.nvReview, text:nvReviewText(b), frozen:b.espnEv||null};
    // 3: two ESPN games with these teams at that time
    b=mk({}); const r3=nvPick(b,E.concat([Object.assign(JSON.parse(JSON.stringify(E[0])),{id:'409'})])); out.c3={ev:!!r3.ev, review:b.nvReview};
    // 4: a part-game market (1st half)
    b=mk({nvPart:'1H'}); const r4=nvPick(b,E); out.c4={ev:!!r4.ev, review:b.nvReview};
    // also: no teams, no kickoff, kickoff 3 hours off
    b=mk({game:'',name:'Total'}); out.c4b=nvPick(b,E).ev?'graded':b.nvReview;
    b=mk({start:null}); out.c4c=nvPick(b,E).ev?'graded':b.nvReview;
    b=mk({start:'2026-11-09T00:30:00Z'}); out.c4d=nvPick(b,E).ev?'graded':b.nvReview;
    return out; },[E,JSON.stringify(T('t',{}))]);
  check('1: Commanders at Rams, Novig kickoff 3:25 PM: the one ESPN game matches, its id 401 is frozen, Under 44.5 wins (31 points)', r.c1.id==='401' && r.c1.frozen==='401' && !r.c1.review && r.c1.grade==='win', r.c1);
  check('2: teams that are in no game at that time: no grade, "NOVIG EVENT MISMATCH · review (no ESPN game has these teams at this time)"', !r.c2.ev && !r.c2.frozen && r.c2.text==='NOVIG EVENT MISMATCH · review (no ESPN game has these teams at this time)', r.c2);
  check('3: two ESPN games match: no grade, "more than one game matches"', !r.c3.ev && r.c3.review==='more than one game matches', r.c3);
  check('4: a part-game Novig total is not graded ("a part-game market")', !r.c4.ev && r.c4.review==='a part-game market', r.c4);
  check('4b: no teams from Novig, no kickoff, or a kickoff 3 hours off: no grade, each says why', r.c4b==='Novig did not name the teams' && r.c4c==='no kickoff time from Novig' && r.c4d==='no ESPN game has these teams at this time', {b:r.c4b, c:r.c4c, d:r.c4d});
  // 5: the frozen game is used again; a later run that does not find it waits, it never searches again
  const r5=await p.evaluate(([E,T0])=>{ const b=Object.assign(JSON.parse(T0),{espnEv:'401'}); const twin=Object.assign(JSON.parse(JSON.stringify(E[0])),{id:'499'});
    const a=nvPick(b,[twin].concat(E)); const c=nvPick(b,[twin]); return {a:a.ev&&a.ev.id, c:!!c.ev, wait:!!c.wait, still:b.espnEv}; },[E,JSON.stringify(T('t',{}))]);
  check('5: later runs grade from frozen game 401 even with a look-alike (499) listed first; without 401 it waits and does not switch', r5.a==='401' && !r5.c && r5.wait && r5.still==='401', r5);
  // the whole grading run (autoGradeLog): the Commanders-Rams ticket that the app once graded from Broncos-Panthers
  await p.evaluate(([E,a,c])=>{ window.fetchScoreboardDay=async()=>E; logged.length=0; logged.push(JSON.parse(a), JSON.parse(c)); saveLog(); },[E,JSON.stringify(T('g',{})),JSON.stringify(T('m',{game:'DEN @ KC',name:'DEN @ KC'}))]);
  await p.evaluate(async()=>{ await autoGradeLog(); }); await p.waitForTimeout(300);
  const g=await p.evaluate(()=>logged.map(b=>({id:b.id, res:b.result, ev:b.espnEv||null, why:b.why&&b.why.reason})));
  const gg=g.find(x=>x.id==='g'), gm=g.find(x=>x.id==='m');
  check('grading run: the Commanders-Rams Under is graded a win from game 401 (not from Broncos-Panthers)', gg.res==='win' && gg.ev==='401', gg);
  check('grading run: the mismatched one is left ungraded with "NOVIG EVENT MISMATCH · review"', gm.res!=='win' && gm.res!=='loss' && /^NOVIG EVENT MISMATCH · review/.test(gm.why||''), gm);
  // 6, 7, 8: fill completeness
  const f=await p.evaluate(()=>{ const b={id:'f',fillBook:'novig',autoFrom:'novig',nvOrders:['ord1'],stake:2,odds:'+100',result:'pending',name:'X',book:'Novig'};
    myOrders={orders:[{book:'novig',id:'ord1',qty:10,filled:4,price:0.5}]}; const st=nvFillState(b), note=nvFillNote(b).replace(/<[^>]+>/g,'');
    myOrders={orders:[]}; const st2=nvFillState(b), note2=nvFillNote(b), tag=srcTagCore(Object.assign({},b));
    return {st, note, stake:b.stake, st2, note2, tag}; });
  check('6: an open order of 10 shares, 4 filled, $2.00 bought: the stake stays $2.00 (only what was bought)', f.st.k==='open_partial' && f.st.bought===2 && f.stake===2, f.st);
  check('7: the rest is shown apart: "Open order, partly filled · $2.00 bought · the rest is not bought yet ($3.00 still open)" (6 shares × 50¢)', f.note==='Open order, partly filled · $2.00 bought · the rest is not bought yet ($3.00 still open)', f.note);
  check('8: with no open order the state is "unknown": nothing on the row, and the tooltip only says completeness is unknown (never "wrong" or "understated")', f.st2.k==='unknown' && f.note2==='' && /fill completeness unknown: closed-order history unavailable/.test(f.tag) && !/understat|wrong|incomplete/i.test(f.tag), {st2:f.st2, tag:f.tag.slice(0,300)});
  // 9: reading the same fill again changes nothing
  const r9=await p.evaluate(()=>{ const b={id:'r',autoFrom:'novig',fills:['o:ord1'],fillCost:2,fillQty:4,stake:2,odds:'+100'}; const fl={book:'novig',id:'o:ord1',order:'ord1',cost:2,fee:0,qty:4,price:0.5,bet:{eventId:'ev9'}};
    linkFill(b,fl); const a=b.stake; linkFill(b,fl); linkFill(b,fl); return {a, b:b.stake, q:b.fillQty, orders:b.nvOrders, ev:b.nvEvent}; });
  check('9: the same fill read three times: stake $2.00, 4 shares, one order kept (ord1), Novig event kept as provenance', r9.a===2 && r9.b===2 && r9.q===4 && JSON.stringify(r9.orders)==='["ord1"]' && r9.ev==='ev9', r9);
  // 10: corrections stay: an imported result is not regraded by Check results or the book's settlement, and a fill re-read does not change it
  await p.evaluate(([E,a])=>{ logged.length=0; const x=JSON.parse(a); x.result='loss'; x.gradedBy='import'; x.accountingSource='import'; x.stake=1.5; logged.push(x); saveLog();
    scoreboardCache.NFL=E; window.fetchScoreboard=async()=>E; },[E,JSON.stringify(T('i',{}))]);
  await p.evaluate(async()=>{ await checkResultsRun(); }); await p.waitForTimeout(200);
  const r10=await p.evaluate(()=>{ const b=logged[0]; linkFill(b,{book:'novig',id:'o:i',order:'i',cost:1,fee:0,qty:2,price:0.42}); return {res:b.result, st:b.stake, by:b.gradedBy, note:nvFillNote(b)}; });
  check('10: an imported correction (lost, $1.50) stays: Check results does not regrade it (ESPN says the Under won), a fill re-read keeps $1.50, no fill note', r10.res==='loss' && r10.st===1.5 && r10.by==='import' && r10.note==='', r10);
  check('no page errors', !errs.length, errs);
  await b.close(); console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(fail?1:0); })();
