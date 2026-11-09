// node tests/watch-v2-test.js — v4.45, Watch bets v2 (plan: agent-notes/watch-v2-plan_2026-11-09_v1.md; owner: "BUILD").
// Sightings (only changes are kept), one pick per game at 5 minutes before kickoff (primary within 30 min, stale fallback 31-120, none),
// game-by-game market − model Brier with 5,000 game resamples, stages by bets AND games, the verdict, two ROIs never mixed,
// free exchange closing prices (de-vigged) with the reason when one is missing, merging two devices' copies, and dropping sightings after grading.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const NOW=Date.parse('2026-11-09T19:00:00Z'), iso=ms=>new Date(ms).toISOString(), DAY='2026-11-09', TIP=Date.parse('2026-11-10T02:30:00Z');
const T=(ha,abbr)=>({ha,id:abbr,abbr,name:abbr+' Team',loc:abbr,nick:'Team',logo:'',rec:'',color:'333333',alt:'ffffff'});
const row=(id,name,team,price,fair,mkt)=>({name,team,game:team+' @ X'+id,matchup:team+' @ X'+id,side:'O',sport:'NHL',market:'1.5 Shots',kind:'prop',book:'Novig',offeredRaw:String(Math.round(-100*price/(1-price))),offeredProb:price,fairProb:fair,fairRaw:'',mktProb:mkt,stars:4,evModel:'projection',projValue:2.1,
  gameInfo:{state:'pre',startISO:iso(TIP),eventId:'401'+id.length,timeCT:'',detail:'',teams:[T('away',team),T('home','X'+id)]},src:'api:NHL:props',apiKey:id,loadedAt:iso(NOW-60e3)});
const ROWS=[row('mid','Will Cuylle','NYR',0.535,0.5546,0.526)];
let LIVE=null;   // the /live answer the stub gives
async function page(){
  const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:1280,height:900}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(([R,d])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig, Kalshi',bank:'500',cfgVer:3.03})); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows:R})); }catch(e){} }, [ROWS,DAY]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/0xbeta.*\/live\?/.test(u) && LIVE){ const q=JSON.parse(decodeURIComponent(u.split('bets=')[1])); const res={}; q.forEach(d=>{ res[d.id]=LIVE(d); }); return r.fulfill({contentType:'application/json',body:JSON.stringify({results:res})}); }
    if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1300); return {b,p,errs};
}
(async()=>{
  let {b,p,errs}=await page();
  // 1. the key and the first snapshot
  let W=await p.evaluate(()=>JSON.parse(JSON.stringify(watchAll())));
  check('one record, keyed by sport, player, stat family, side, exact line and ESPN event; device time, a device id and the time zone are kept', W.length===1 && W[0].k==='NHL|will cuylle|sog|O|1.5|e4013' && W[0].tsrc==='device' && /^d[a-z0-9]+$/.test(W[0].dev) && W[0].tz===360 && W[0].ev==='4013' && W[0].ld && W[0].ld.book==='novig', {k:W[0]&&W[0].k, dev:W[0]&&W[0].dev, tz:W[0]&&W[0].tz});
  // 2. sightings: unchanged adds nothing, a change adds one audit entry and never touches the first snapshot
  const sg=await p.evaluate(async()=>{ const o=watchAll()[0], r=JSON.parse(JSON.stringify(audit(lastRows, cfgRead()).find(x=>x.watch)));
    const before={price:o.price, at:o.at}; watchNote([r]); const a=(o.sig||[]).length;
    r.offeredProb=0.54; watchNote([r]); const b2=(o.sig||[]).length; watchNote([r]);
    return {a, b:b2, c:(o.sig||[]).length, sigPrice:o.sig&&o.sig[0]&&o.sig[0].price, price:o.price, at:o.at===before.at, n:watchAll().length}; });
  check('an unchanged re-sighting adds nothing; a new price adds one audit sighting; the first snapshot (53.5%) stays', sg.a===0 && sg.b===1 && sg.c===1 && sg.sigPrice===0.54 && sg.price===0.535 && sg.at && sg.n===1, sg);
  // 3. one pick per game at the cutoff
  const pol=await p.evaluate(()=>{ const now=Date.now(), m=60e3, A=watchAll(); A.length=0; window._wpol={};
    const R=(k,g,st,seenAgo,actNet,extra)=>Object.assign({k, v:2, at:new Date(now-6*3600e3).toISOString(), ver:'v4.45', sport:'NHL', kind:'prop', name:k, market:'1.5 Shots', side:'O', game:g, ev:g, start:new Date(st).toISOString(), book:'Kalshi', price:0.5, fee:0.03, model:0.56, mkt:0.5, blend:0.521, actNet, net:0.08, result:null, seen:st-seenAgo, nSig:0}, extra||{});
    const s1=now+2*m;   // these games start in 2 minutes: their cutoff has passed
    A.push(R('a1','GA',s1,10*m,0.012), R('a2','GA',s1,40*m,0.030), R('a3','GA',s1,3*m,0.050));   // a3 was seen after the cutoff: not used
    A.push(R('b1','GB',s1,20*m,0.0200), R('b2','GB',s1,8*m,0.02005));   // EV tie within 0.0001: the fresher (b2)
    A.push(R('c1','GC',s1,60*m,0.015));   // stale fallback
    A.push(R('d1','GD',s1,180*m,0.015));  // nothing within 2 hours
    A.push(R('e1','GE',now+60*m,10*m,0.015));   // cutoff not reached yet
    const n=watchPolicyRun(), P=watchPolAll(), g=x=>P['NHL|e'+x]||null;
    const first=JSON.stringify(P); A.find(o=>o.k==='a1').actNet=-0.5; watchPolicyRun(); const same=JSON.stringify(watchPolAll())===first;
    return {n, A:g('GA'), B:g('GB'), C:g('GC'), D:g('GD'), E:g('GE'), same}; });
  check('game A: primary pick a1 (seen 10 min before kickoff), not a2 (stale, higher EV) nor a3 (seen after the cutoff)', pol.A && pol.A.status==='primary' && pol.A.k==='a1' && pol.A.snap.price===0.5 && pol.A.snap.age===10 && pol.A.why==='the only candidate', pol.A);
  check('game B: an EV tie within 0.0001 goes to the fresher price', pol.B && pol.B.k==='b2' && pol.B.why==='EV tie: the fresher price', pol.B&&{k:pol.B.k,why:pol.B.why});
  check('game C: last seen 60 min before kickoff → stale fallback; game D: 3 hours → no qualifying pick; game E: not decided before its cutoff', pol.C && pol.C.status==='fallback' && pol.D && pol.D.status==='none' && /2 hours/.test(pol.D.why) && pol.E===null && pol.n===4, {C:pol.C&&pol.C.status, D:pol.D&&pol.D.why, E:pol.E, n:pol.n});
  check('a pick is made once and never recomputed (even after the record changes)', pol.same, pol.same);
  // 4. statistics: game-balanced headline, stages by bets and games, verdict, credible gate
  const st=await p.evaluate(()=>{ const mk=(nG,per,mod,mkt,price,book,closeFair)=>{ const A=[]; for(let g=0;g<nG;g++) for(let j=0;j<per;j++){ const i=g*per+j, y=(i%5)<3;
      A.push({k:'s'+i, sport:'NHL', ev:'g'+g, game:'G'+g, start:'2026-11-08T23:00:00Z', book, model:mod, mkt, blend:mkt+0.35*(mod-mkt), price, fee:0, result:y?'win':'loss', ld:{}, close:closeFair?{t:Date.parse('2026-11-08T22:55:00Z'), p:0.51, opp:0.51, fair:closeFair}:undefined}); } return A; };
    const small=[{k:'x1',sport:'NHL',ev:'A',model:0.6,mkt:0.5,price:0.5,result:'win'},{k:'x2',sport:'NHL',ev:'A',model:0.6,mkt:0.5,price:0.5,result:'win'},{k:'x3',sport:'NHL',ev:'A',model:0.6,mkt:0.5,price:0.5,result:'win'},{k:'x4',sport:'NHL',ev:'B',model:0.6,mkt:0.5,price:0.5,result:'loss'}];
    const S0=watchStats(small,{pol:{}}), byHand=((0.25-0.16)+(0.25-0.36))/2, betW=(3*(0.25-0.16)+(0.25-0.36))/4;
    const t0=performance.now(); const Sc=watchStats(mk(1000,2,0.6,0.5,0.5,'Kalshi',0.52),{pol:{}}); const ms=performance.now()-t0;
    const Sn=watchStats(mk(1000,2,0.6,0.5,0.5,'Bovada',null),{pol:{}});   // no closes: cannot be Credible
    const Sw=watchStats(mk(500,2,0.6,0.5,0.5,'Kalshi',0.52),{pol:{}});    // 1,000 bets in 500 games: range wider than ±0.005
    const Sd=watchStats(mk(60,2,0.6,0.5,0.5,'Kalshi',null),{pol:{}});     // 120 bets in 60 games: directional
    const Sz=watchStats(mk(200,2,0.55,0.55,0.5,'Kalshi',null),{pol:{}});   // the same forecast: no verdict
    return {d0:S0.d, byHand, dBet:S0.dBet, betW, games0:S0.games,
      c:{stage:Sc.stage, verdict:Sc.verdict, half:Sc.half, ci:Sc.ci, d:Sc.d, boot:Sc.boot, clv:Sc.clv.mean, cap:Sc.clv.captured, roi:Sc.roi, ms},
      n:{stage:Sn.stage, miss:Sn.clv.miss}, w:{stage:Sw.stage, half:Sw.half}, dd:Sd.stage, z:{verdict:Sz.verdict, stage:Sz.stage}}; });
  check('headline: market − model averaged inside each game, then across games (a game with 3 props counts once); bet by bet kept apart', Math.abs(st.d0-st.byHand)<1e-12 && Math.abs(st.dBet-st.betW)<1e-12 && st.games0===2, st);
  check('2,000 bets in 1,000 games, model better, closes and ROI agree: Credible, "Materially favors the model", 5,000 resamples, range within ±0.005', /^Credible evidence/.test(st.c.stage) && st.c.verdict==='Materially favors the model' && st.c.boot===5000 && st.c.half<=0.005 && st.c.ci[0]>0.001 && st.c.ci[0]<=st.c.d && st.c.d<=st.c.ci[1] && st.c.cap===2000 && st.c.clv>0 && st.c.roi>0, st.c);
  check('the 5,000 resamples run fast (under 2 s)', st.c.ms<2000, Math.round(st.c.ms)+' ms');
  check('same numbers with no closing prices (sportsbook): Useful, not Credible ("closing line and ROI do not both agree"); the missing close says why', /^Useful comparison/.test(st.n.stage) && /do not both agree/.test(st.n.stage) && st.n.miss['sportsbook price (no free close)']===2000, st.n);
  check('1,000 bets in only 500 games: range wider than ±0.005, so Useful, not Credible', /^Useful comparison/.test(st.w.stage) && /wider than ±0\.005/.test(st.w.stage) && st.w.half>0.005, st.w);
  check('120 bets in 60 games: Directional; identical forecasts: "No verdict: the range includes zero"', /^Directional/.test(st.dd) && st.z.verdict==='No verdict: the range includes zero', {dd:st.dd, z:st.z});
  // 5. two ROIs, never mixed: the policy picks at their own snapshot price
  const roi=await p.evaluate(()=>{ const A=[{k:'p1',sport:'NHL',ev:'1',model:0.6,mkt:0.5,price:0.40,fee:0,result:'win'},{k:'p2',sport:'NHL',ev:'2',model:0.6,mkt:0.5,price:0.40,fee:0,result:'loss'},{k:'p3',sport:'NHL',ev:'3',model:0.6,mkt:0.5,price:0.40,fee:0,result:'win'}];
    const pol={'NHL|e1':{status:'primary',k:'p1',sport:'NHL',start:'2026-11-08T23:00:00Z',devName:'iPhone',snap:{price:0.5,fee:0}},'NHL|e2':{status:'primary',k:'p2',sport:'NHL',start:'2026-11-08T23:00:00Z',devName:'Mac',snap:{price:0.5,fee:0}},'NHL|e3':{status:'fallback',k:'p3',sport:'NHL',start:'2026-11-08T23:00:00Z',devName:'Mac',snap:{price:0.25,fee:0}},'NHL|e4':{status:'none',sport:'NHL',start:'2026-11-08T23:00:00Z'}};
    const S=watchStats(A,{pol}); return {all:S.roi, pri:S.pol.primary.roi, fb:S.pol.fallback.roi, none:S.pol.none, rate:S.pol.rate, dev:S.pol.primary.byDev.map(x=>x.k).sort().join(','), band:S.pol.primary.byBand[0].k}; });
  check('All-Watch ROI at the first price 40% (+1.5 − 1 + 1.5)/3 = +66.7%; primary picks at their snapshot price (+100% − 100%)/2 = 0; fallback alone +300%; 1 no-pick; primary rate 2/4', Math.abs(roi.all-2/3)<1e-9 && Math.abs(roi.pri)<1e-9 && Math.abs(roi.fb-3)<1e-9 && roi.none===1 && roi.rate===0.5 && roi.dev==='Mac,iPhone' && roi.band==='5 PM or later', roi);
  // 6. closing prices from the exchange, de-vigged, with the reason when there is none
  LIVE=d=>d.name==='Close Me'?{ok:true, price:0.55, bid:0.53, src:'kalshi'}:{ok:false, note:'Kalshi: no market at your line'};
  const cl=await p.evaluate(async()=>{ const now=Date.now(), A=watchAll(); A.length=0; const ld={book:'kalshi',sport:'NHL',kind:'prop',stat:'Shots',line:1.5,side:'O',away:'NYR',home:'BOS'};
    A.push({k:'c1', sport:'NHL', name:'Close Me', ev:'c', start:new Date(now+6*60e3).toISOString(), book:'Kalshi', price:0.5, fee:0, model:0.56, mkt:0.5, result:null, ld:Object.assign({name:'Close Me'},ld)});
    A.push({k:'c2', sport:'NHL', name:'Moved', ev:'d', start:new Date(now+6*60e3).toISOString(), book:'Kalshi', price:0.5, fee:0, model:0.56, mkt:0.5, result:null, ld:Object.assign({name:'Moved'},ld)});
    A.push({k:'c3', sport:'NHL', name:'Later', ev:'e', start:new Date(now+60*60e3).toISOString(), book:'Kalshi', price:0.5, fee:0, model:0.56, mkt:0.5, result:null, ld:Object.assign({name:'Later'},ld)});
    watchCloseAt=0; const n=await watchCloseScan(); return {n, c1:A[0].close, w2:A[1].closeWhy, c3:A[2].close||null, t3:A[2].closeTry||null}; });
  check('in the last 10 minutes: the Kalshi close is taken with both sides (ask 55¢, other side 1 − 53¢ = 47¢) → fair 55/(55+47) = 53.9%; a moved line keeps its reason; a game an hour away is not asked', cl.n===1 && cl.c1 && cl.c1.p===0.55 && cl.c1.opp===0.47 && Math.abs(cl.c1.fair-0.5392)<1e-4 && cl.w2==='line moved (not comparable)' && cl.c3===null && cl.t3===null, cl);
  const clv=await p.evaluate(()=>{ const A=watchAll(); A[0].start=new Date(Date.now()-60e3).toISOString(); A[0].close.t=Date.now()-120e3; A[1].start=A[0].start; A[2].start=A[0].start; delete A[2].ld; const S=watchStats(A,{pol:{}}); return S.clv; });
  check('Watch CLV on exchange-priced observations: 3 eligible, 1 captured, CLV 53.9/50 − 1 = +7.8%, by exchange, missing reasons named', clv.eligible===3 && clv.captured===1 && Math.abs(clv.mean-(0.5392/0.5-1))<1e-4 && clv.byX[0].x==='Kalshi' && clv.miss['line moved (not comparable)']===1 && clv.miss['saved before v4.45']===1, clv);
  // 7. two devices: the earliest valid snapshot is kept whole, the other goes to alt; malformed and post-start copies lose; merging is symmetric
  const mg=await p.evaluate(()=>{ const base={k:'m', sport:'NHL', start:'2026-11-09T23:00:00Z', result:null};
    const a=Object.assign({}, base, {at:'2026-11-09T18:00:00Z', dev:'dA', price:0.50, fee:0, model:0.56, mkt:0.51, blend:0.53, actNet:0.02, net:0.1, ver:'v4.45', sig:[{t:1,price:0.5}], seen:5});
    const b=Object.assign({}, base, {at:'2026-11-09T18:20:00Z', dev:'dB', price:0.47, fee:0, model:0.57, mkt:0.52, blend:0.54, actNet:0.06, net:0.2, ver:'v4.45', close:{t:9, p:0.5, opp:0.5, fair:0.5}});
    const m1=watchMergeRec(a,b), m2=watchMergeRec(b,a), bad=Object.assign({}, a, {price:0}), late=Object.assign({}, a, {at:'2026-11-09T23:30:00Z'});
    const mb=watchMergeRec(bad,b), ml=watchMergeRec(late,b);
    return {price:m1.price, model:m1.model, actNet:m1.actNet, dev:m1.dev, alt:m1.alt&&m1.alt.map(x=>x.price), conflict:m1.conflict, close:!!m1.close, sig:(m1.sig||[]).length, sym:syncQuick(watchSyncForm(m1))===syncQuick(watchSyncForm(m2)), bad:mb.price, late:ml.price}; });
  check('two copies: the earlier (50%, its own model 56% and EV) is kept whole, the later (47%) in alt, flagged as a conflict (20 min apart); the close is kept; the same result either way round', mg.price===0.5 && mg.model===0.56 && mg.actNet===0.02 && mg.dev==='dA' && JSON.stringify(mg.alt)==='[0.47]' && mg.conflict===true && mg.close && mg.sig===1 && mg.sym, mg);
  check('a malformed copy (price 0) or one saved after the start loses to the valid one', mg.bad===0.47 && mg.late===0.47, {bad:mg.bad, late:mg.late});
  const sy=await p.evaluate(()=>{ SY={meta:syncNewMeta(), on:false}; window._watch=[{k:'m', sport:'NHL', start:'2026-11-09T23:00:00Z', at:'2026-11-09T18:20:00Z', dev:'dB', price:0.47, fee:0, model:0.57, mkt:0.52, ver:'v4.45', result:null, sig:[{t:1,price:0.47}], seen:7}];
    window._wpol={'NHL|eZ':{gk:'NHL|eZ', status:'none', at:'2026-11-09T23:00:00Z', dev:'dB'}};
    const L=syncColls().watch.list(); const stripped=!('sig' in L[0][1]) && !('seen' in L[0][1]);
    const R={coll:{watch:{m:{v:{k:'m', sport:'NHL', start:'2026-11-09T23:00:00Z', at:'2026-11-09T18:00:00Z', dev:'dA', price:0.5, fee:0, model:0.56, mkt:0.51, ver:'v4.45', result:'win', gradedAt:'2026-11-10T05:00:00Z'}, m:Date.now()+1000}},
      wpol:{'NHL|eZ':{v:{gk:'NHL|eZ', status:'primary', k:'m', at:'2026-11-09T23:01:00Z', dev:'dA', snap:{price:0.5}}, m:Date.now()+1000}}}, del:{}, set:{}};
    const res=syncMergeAll(R,false), o=watchAll()[0], d=watchPolAll()['NHL|eZ'];
    return {stripped, push:res.push, price:o.price, alt:o.alt&&o.alt[0].price, result:o.result, sigKept:(o.sig||[]).length, seen:o.seen, pol:d.status, k:d.k, conflict:d.conflict, other:d.other&&d.other.status}; });
  check('sync: sightings stay on the device (not sent); a cloud copy merges into the earliest snapshot, keeps this device\'s sightings and the result, and goes back up', sy.stripped && sy.push && sy.price===0.5 && sy.alt===0.47 && sy.result==='win' && sy.sigKept===1 && sy.seen===7, sy);
  check('sync: a primary pick from the other device beats this device\'s "no pick"; the difference is flagged', sy.pol==='primary' && sy.k==='m' && sy.conflict===true && sy.other==='none', sy);
  // 8. dropping sightings once graded (sync off: after 7 days)
  const pr=await p.evaluate(()=>{ SY=null; const now=Date.now(); window._watch=[{k:'q1', sport:'NHL', ev:'Q', start:new Date(now-9*86400e3).toISOString(), at:new Date(now-9.2*86400e3).toISOString(), price:0.5, model:0.56, mkt:0.5, result:'win', gradedAt:new Date(now-8*86400e3).toISOString(), sig:[{t:1},{t:2}], seen:now-9.1*86400e3, ld:{}},
      {k:'q2', sport:'NHL', ev:'R', start:new Date(now-2*86400e3).toISOString(), at:new Date(now-2.2*86400e3).toISOString(), price:0.5, model:0.56, mkt:0.5, result:'win', gradedAt:new Date(now-1*86400e3).toISOString(), sig:[{t:1}], seen:1}];
    window._wpol={'NHL|eQ':{status:'primary',k:'q1'}, 'NHL|eR':{status:'primary',k:'q2'}};
    const n=watchPrune(), A=watchAll(); return {n, q1:{pruned:A[0].pruned, sig:A[0].sig||null, ld:A[0].ld||null, nSig:A[0].nSig, first:!!A[0].first, last:!!A[0].last, result:A[0].result}, q2:{pruned:!!A[1].pruned, sig:(A[1].sig||[]).length}}; });
  check('graded 8 days ago with sync off: sightings dropped, the compact record kept (result, count, first and last seen); graded yesterday: kept for now', pr.n===1 && pr.q1.pruned && pr.q1.sig===null && pr.q1.ld===null && pr.q1.nSig===2 && pr.q1.first && pr.q1.last && pr.q1.result==='win' && !pr.q2.pruned && pr.q2.sig===1, pr);
  // 9. the panel: only drawn when Performance is open
  const ui=await p.evaluate(async()=>{ const el=document.getElementById('watchStudy'); el.innerHTML=''; renderPerf(); const before=el.innerHTML.length;
    document.querySelector('.tab[data-view="v-perf"]').click(); await new Promise(r=>setTimeout(r,300)); return {before, txt:el.innerText.replace(/\s+/g,' ')}; });
  check('Watch stats wait until Performance opens, then show the headline, two ROIs, the one-pick table and exchange CLV', ui.before===0 && /Market − model Brier, game by game/.test(ui.txt) && /Two ROIs, never mixed/i.test(ui.txt) && /Primary: price seen within 30 min/.test(ui.txt) && /Stale fallback/.test(ui.txt) && /Watch CLV on exchange-priced observations/i.test(ui.txt) && /device clocks/.test(ui.txt), ui.txt.slice(0,400));
  check('no page errors', !errs.length, errs); await b.close();
  console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail?1:0);
})();
