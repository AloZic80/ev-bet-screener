// node tests/v530-paper-test.js — v5.30 Paper money (owner "BUILD I SAID", 11/25; Sally's spec of 11/17). Every pregame card La Contadora approves whose chance
// is under the plan minimum is saved once as a $1 paper bet (IndexedDB), its near-start price taken in the last 30 minutes, graded by ESPN, and shown in
// Reports › Paper money (God view only). Recording only: no decision, stake, real total, Today card or mbev.log changes.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8'), FX=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures-nhl-2026-11-05.json'),'utf8'));
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,600)); };
const H=3600e3, TIP=Date.parse('2026-11-27T01:00:00Z'), NOW=TIP-7*H, DAY='2026-11-26', iso=ms=>new Date(ms).toISOString();   // Thu 11/26, noon CT; games 7:00 PM CT
const T=(ha,abbr)=>({ha,id:abbr,abbr,name:abbr+' Team',loc:abbr,nick:'Team',logo:'',rec:'',color:'333333',alt:'ffffff'});
const am=p=>p>=0.5?String(Math.round(-100*p/(1-p))):'+'+Math.round(100*(1-p)/p);
// model = market = the chance, so La Contadora's chance is exactly it; price `gap` under it at Novig (no fee)
const row=(id,player,c,o)=>Object.assign({name:player,team:'T'+id,game:'T'+id+' @ H'+id,matchup:'T'+id+' @ H'+id,side:'O',sport:'NHL',market:'1.5 Shots On Goal',kind:'prop',book:'Novig',offeredRaw:am(c-0.04),offeredProb:+(c-0.04).toFixed(4),fairProb:c,fairRaw:'',mktProb:c,stars:3,evModel:'market',
  gameInfo:{state:'pre',startISO:iso(TIP),eventId:'7'+id,timeCT:'',detail:'',teams:[T('away','T'+id),T('home','H'+id)]},src:'api:NHL:props',apiKey:id+(o&&o.mk||''),loadedAt:iso(NOW-60e3)}, o||{});
const px=(r,p)=>Object.assign(r,{offeredProb:p, offeredRaw:am(p)});
function board(at, ch){ ch=ch||{}; const L=[row('c','Charlie Strong',0.62), row('e','Echo Slight',0.55), row('g','Golf Coin',0.47), row('h','Hotel Unlikely',0.40),
    px(row('f','Foxtrot Fail',0.47),0.48) /* no edge: fails the value rule */,
    px(row('g','Golf Coin',0.46,{market:'0.5 Points',mk:'pts'}),0.43) /* same player, same game, a lower EV: $0 from the one-per-player limit */];
  L.forEach(r=>{ r.loadedAt=iso(at-60e3); if(ch[r.name+'|'+r.market]!=null) px(r, ch[r.name+'|'+r.market]); }); return {v:1,savedAt:iso(at),slate:DAY,rows:L}; }
const LOG=[{id:'r1',key:'r1',kind:'prop',sport:'NBA',book:'Novig',name:'Real One',market:'1.5 Threes',side:'O',odds:'+100',stake:2,game:'AA @ BB',start:'2026-11-25T01:00:00Z',date:'2026-11-24',placedAt:'2026-11-24T20:00:00Z',snap:{at:'2026-11-24T20:00:00Z',act:0.47,actNet:0.04},result:'win',gradedBy:'manual',manual:true},
  {id:'r2',key:'r2',kind:'prop',sport:'NBA',book:'Novig',name:'Real Two',market:'2.5 Assists',side:'U',odds:'-110',stake:3,game:'CC @ DD',start:'2026-11-25T02:00:00Z',date:'2026-11-24',placedAt:'2026-11-24T21:00:00Z',snap:{at:'2026-11-24T21:00:00Z',act:0.58,actNet:0.03},result:'loss',gradedBy:'manual',manual:true}];
async function open(opts){ opts=opts||{};
  const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:opts.w||1280,height:900},acceptDownloads:true}); await ctx.clock.install({time:new Date(opts.now||NOW)});
  await ctx.addInitScript(([B,L,cfg])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify(cfg)); if(B) localStorage.setItem('mbev.board',JSON.stringify(B)); localStorage.setItem('mbev.log',JSON.stringify(L||[])); }catch(e){} }, [opts.board===undefined?board(opts.now||NOW):opts.board, opts.log===undefined?LOG:opts.log, {books:'Novig, Kalshi',bank:'500',cfgVer:3.03}]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(), Hd={'access-control-allow-origin':'*'}; if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'});
    if(opts.espn && /hockey\/nhl\/scoreboard/.test(u)) return r.fulfill({contentType:'application/json',headers:Hd,body:JSON.stringify(/dates=20261105/.test(u)?FX.scoreboard:{events:[]})});
    if(opts.espn && /hockey\/nhl\/summary/.test(u)) return r.fulfill({contentType:'application/json',headers:Hd,body:JSON.stringify(FX.summary)});
    if(/espn/.test(u)) return r.fulfill({contentType:'application/json',headers:Hd,body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1500); return {b,ctx,p,errs}; }
const recs=p=>p.evaluate(()=>ppS().A.map(o=>JSON.parse(JSON.stringify(o))));
const by=(A,name,mk)=>A.find(o=>o.name===name && (!mk || o.market===mk));
const real=p=>p.evaluate(()=>({log:localStorage.getItem('mbev.log'), today:(document.getElementById('todayBar')||{}).innerText||'', head:(document.getElementById('rpHead')||{}).innerText||'', split:(document.getElementById('rpSplit')||{}).innerText||'', score:(document.getElementById('scoreBody')||{}).innerText||'', rows:(typeof lastRows!=='undefined'?lastRows:[]).map(r=>[r.name,r.market,r.pass,+(+r.stake||0).toFixed(2)])}));
async function goReports(p){ await p.evaluate(()=>document.querySelector('.tab[data-view="v-reports"]').click()); await p.waitForTimeout(500); }
(async()=>{
  const t0=Date.now();
  // ---- 1. recording at noon CT (7 hours before the games)
  let {b,ctx,p,errs}=await open();
  let A=await recs(p);
  const gc=by(A,'Golf Coin','1.5 Shots On Goal'), hu=by(A,'Hotel Unlikely'), gp=by(A,'Golf Coin','0.5 Points');
  check('an approved Coin Flip card under the 50% plan (Golf Coin, 47%) is one paper bet at $1, its first price frozen, in "Paper · Coin Flip"', !!gc && gc.group==='coin' && gc.first.price===0.43 && gc.first.act===0.47 && gc.first.kelly>0 && gc.result===null && gc.planMin===50 && gc.policy==='paper-v1' && /^v5\.\d\d$/.test(gc.ver), gc&&{g:gc.group,f:gc.first});
  check('an approved card under 45% (Hotel Unlikely, 40%) is a paper bet in "Paper · Unlikely (<45%)", reported apart', !!hu && hu.group==='unlikely', hu&&hu.group);
  check('approved cards inside the plan (Charlie 62%, Echo 55%) are not paper bets', !by(A,'Charlie Strong') && !by(A,'Echo Slight'), A.map(o=>o.name));
  check('a card that fails the price / value rules (Foxtrot, no edge) is not a paper bet', !by(A,'Foxtrot Fail'), A.map(o=>o.name));
  check('a $0 from the one-per-player limit (Golf Coin 0.5 Points, the lower EV on the same player) stays a paper bet, marked $0 from a limit, with the stake the rules gave it', !!gp && gp.first.limitZero===true && gp.first.stake===0 && gp.first.kelly>0, gp&&gp.first);
  check('one record per outcome: 3 paper bets, and redraws add no copies', A.length===3 && (await p.evaluate(()=>{ refresh(); refresh(); return ppS().A.length; }))===3, A.length);
  const idb=await p.evaluate(()=>new Promise(res=>{ const q=indexedDB.open('mbev-paper',1); q.onsuccess=()=>{ const g=q.result.transaction('paper').objectStore('paper').getAll(); g.onsuccess=()=>res(g.result.length); }; q.onerror=()=>res(-1); }));
  check('they are saved in IndexedDB (mbev-paper), not in localStorage', idb===3 && !/Golf Coin/.test(await p.evaluate(()=>Object.keys(localStorage).filter(k=>k!=='mbev.board' && !/^mbev\.(px|price|watch|shadow|seen|sh)/i.test(k)).map(k=>localStorage.getItem(k)).join('|'))), idb);
  // nothing about a paper bet changes the board: the same rows, passes and stakes with paperNote turned into a no-op
  const snapB=()=>p.evaluate(()=>{ refresh(); return JSON.stringify({rows:lastRows.map(r=>[r.name,r.market,r.pass,+(+r.stake||0).toFixed(2),r.flags.map(f=>f.join(':')).join(';'),r.actNet]), board:(document.getElementById('v-board')||document.body).innerText.replace(/\s+/g,' ')}); });
  const st1=await snapB(); await p.evaluate(()=>{ window._ppKeep=window.paperNote; window.paperNote=()=>0; }); const st2=await snapB(); await p.evaluate(()=>{ window.paperNote=window._ppKeep; refresh(); });
  check('the board is drawn the same with Paper money recording or not: rows, passes, stakes, flags and the board text (recording only)', st1===st2 && st1.length>500, [st1.length,st2.length]);
  // the guess before any outcome; layout; Easy
  await goReports(p);
  const txt=await p.evaluate(()=>document.getElementById('ppBody').innerText.replace(/\s+/g,' '));
  check('Reports › Paper money shows the written guess before any outcome, word for word, and "Not judged yet"', txt.includes('“48.5–50% beats 45–48.5% on flat-$1 ROI at the near-start price; judged after 100 outcomes and 50 games each side.”') && /Not judged yet/.test(txt) && /before the first paper outcome/.test(txt), txt.slice(0,400));
  check('the two groups are shown apart, with the calm "no money was bet" wording', /Paper · Unlikely \(<45%\)/.test(txt) && /Paper · Coin Flip \(45% to plan minimum\)/.test(txt) && /No money was bet/.test(txt), txt.slice(0,600));
  const before=await real(p);
  await p.click('#ppCsv'); await p.waitForTimeout(300);
  check('CSV of paper bets says its result next to the button', /Saved 3 paper bets to paper-money-2026-11-26\.csv/.test(await p.evaluate(()=>document.getElementById('ppCsvMsg').textContent)), await p.evaluate(()=>document.getElementById('ppCsvMsg').textContent));
  const fit=async()=>p.evaluate(()=>{ document.querySelectorAll('#ppPanel details').forEach(d=>d.open=true); const pn=document.getElementById('ppPanel'), r=pn.getBoundingClientRect(); return {doc:document.documentElement.scrollWidth, vw:innerWidth, right:Math.round(r.right), pw:pn.scrollWidth, pc:pn.clientWidth}; });
  let F=await fit(); check('1280 px: Paper money fits (no sideways scroll, the panel inside the screen)', F.doc<=F.vw && F.right<=F.vw && F.pw<=F.pc+1, F);
  await b.close();
  // ---- 2. 40 minutes before: the stale step; 6 minutes before: the near-start price (a reload: IndexedDB keeps the records)
  ({b,ctx,p,errs}=await open());
  const reload=async(at, ch)=>{ await ctx.clock.setSystemTime(new Date(at)); await p.evaluate(B=>localStorage.setItem('mbev.board',JSON.stringify(B)), board(at, ch)); await p.reload(); await p.waitForTimeout(1500); };
  await reload(TIP-40*60e3, {'Golf Coin|1.5 Shots On Goal':0.42});
  A=await recs(p);
  check('a reload keeps every paper bet (IndexedDB)', A.length===3, A.length);
  check('40 minutes before the start: the stale-fallback step is saved (0.42, 40 min), no near-start price yet, the first price kept', by(A,'Golf Coin','1.5 Shots On Goal').stale && by(A,'Golf Coin','1.5 Shots On Goal').stale.price===0.42 && by(A,'Golf Coin','1.5 Shots On Goal').stale.age===40 && !by(A,'Golf Coin','1.5 Shots On Goal').near && by(A,'Golf Coin','1.5 Shots On Goal').first.price===0.43, by(A,'Golf Coin','1.5 Shots On Goal'));
  await reload(TIP-20*60e3, {'Golf Coin|1.5 Shots On Goal':0.41});
  await reload(TIP-6*60e3, {'Golf Coin|1.5 Shots On Goal':0.44, 'Hotel Unlikely|1.5 Shots On Goal':0.41});
  A=await recs(p); const g2=by(A,'Golf Coin','1.5 Shots On Goal'), h2=by(A,'Hotel Unlikely');
  check('the near-start price is the sighting closest to 5 minutes before the start within 30 minutes (6 min: 0.44, not 20 min: 0.41); the first price (0.43) is kept', g2.near && g2.near.price===0.44 && g2.near.age===6 && g2.first.price===0.43, {near:g2.near, first:g2.first.price});
  check('a card that no longer qualifies near the start (Hotel: price moved past her chance) gets no near-start price, and the reason is saved and counted', !h2.near && /not approved/.test(h2.nsWhy||'') && Object.values(h2.nsMiss||{}).reduce((t,x)=>t+x,0)>=1, {nsWhy:h2.nsWhy, nsMiss:h2.nsMiss});
  await reload(TIP+10*60e3, {'Golf Coin|1.5 Shots On Goal':0.30});
  A=await recs(p);
  check('after the start nothing changes (no new near-start or first price)', by(A,'Golf Coin','1.5 Shots On Goal').near.price===0.44 && A.length===3, by(A,'Golf Coin','1.5 Shots On Goal').near);
  check('no page errors (1, 2)', !errs.length, errs); await b.close();
  // ---- 3. grading from ESPN: Dorofeyev Over 2.5 Shots On Goal (4 shots, ESPN box score 11/5) settles the paper bet as Won; a reload keeps it
  ({b,ctx,p,errs}=await open({now:Date.parse('2026-11-06T05:03:00Z'), board:null, log:[], espn:true}));
  const g=await p.evaluate(async()=>{ const s={t:Date.parse('2026-11-05T22:00:00Z'), at:'2026-11-05T22:00:00.000Z', ver:'v5.30', book:'Novig', price:0.52, raw:'-108', fee:0, model:0.49, mkt:0.47, act:0.477, actNet:0.03, net:0.05, kelly:2.1, stake:2.1, limitZero:false};
    const o={k:'NHL|pavel dorofeyev|sog|O|2.5|2026-11-06T00:00:00.000Z', v:1, policy:'paper-v1', at:s.at, ver:'v5.30', snap:{at:s.at}, sport:'NHL', kind:'prop', name:'Pavel Dorofeyev', team:'PHI', market:'2.5 Shots On Goal', side:'O', line:null, betnow:'O 2.5 -108', game:'PHI @ NYR', matchup:'PHI @ NYR', ev:null,
      start:'2026-11-06T00:00:00.000Z', date:'2026-11-05', dateSet:true, book:'Novig', planMin:50, planSince:'2026-11-11', group:'coin', exchange:true, result:null, first:s, near:Object.assign({},s,{t:s.t+7e6, at:'2026-11-05T23:55:00.000Z', price:0.53, age:5}), stale:null, nb:null, nsMiss:{}, obs:[{t:s.t,p:0.52,a:0.477}], nObs:1};
    const S=ppS(); S.A.push(o); S.by.set(o.k,o); ppDirty(o); await ppFlush(); const n=await paperGrade(); return {n, r:o.result, by:o.gradedBy, obs:o.obs, log:localStorage.getItem('mbev.log')}; });
  check('ESPN grades the paper bet with the Bet log’s own code: Won (4 shots over 2.5), by espn; the sightings list is dropped, the record kept', g.n===1 && g.r==='win' && g.by==='espn' && g.obs===undefined, g);
  check('grading a paper bet leaves mbev.log untouched (still empty)', g.log==='[]', g.log);
  await p.reload(); await p.waitForTimeout(1500);
  const g3=await recs(p);
  check('a reload keeps the settled paper bet (IndexedDB): Won, first and near-start snapshots whole', g3.length===1 && g3[0].result==='win' && g3[0].first.price===0.52 && g3[0].near.price===0.53, g3[0]&&{r:g3[0].result,f:g3[0].first&&g3[0].first.price});
  check('no page errors (3)', !errs.length, errs); await b.close();
  // ---- 4. real money never changes: the same Bet log, Today card, Reports totals and Scorecard with settled paper bets as without
  ({b,ctx,p,errs}=await open());
  await goReports(p);
  const r0=await real(p);
  await p.evaluate(async()=>{ ppS().A.forEach((o,i)=>{ o.near=Object.assign({}, o.first, {age:5}); o.result=i%2?'loss':'win'; o.gradedBy='espn'; ppDirty(o); }); await ppFlush(); renderLog(); renderPerf(); renderTodayBar(); rpRender(); });
  await p.waitForTimeout(300);
  const r1=await real(p), t2=await p.evaluate(()=>document.getElementById('ppBody').innerText.replace(/\s+/g,' '));
  check('with settled paper bets: mbev.log, the Today card, Reports totals and the Scorecard are exactly as before', r0.log===r1.log && r0.today===r1.today && r0.head===r1.head && r0.split===r1.split && r0.score===r1.score && JSON.parse(r1.log).length===2, {today:r1.today.slice(0,80), head:r1.head.slice(0,120)});
  check('the paper section shows the settled paper bets at $1 (near-start headline)', /\$1 on each, near-start price: \d settled/.test(t2), t2.slice(0,700));
  check('real-money words never show paper dollars: the Reports head counts only the 2 real tickets', !/Golf Coin|Hotel Unlikely/.test(r1.head+r1.split+r1.today+r1.score), null);
  await b.close();
  // ---- 5. 390 px fits; Easy shows nothing
  ({b,ctx,p,errs}=await open({w:390}));
  await goReports(p);
  F=await p.evaluate(()=>{ document.querySelectorAll('#ppPanel details').forEach(d=>d.open=true); const pn=document.getElementById('ppPanel'), r=pn.getBoundingClientRect(); return {doc:document.documentElement.scrollWidth, vw:innerWidth, right:Math.round(r.right), pw:pn.scrollWidth, pc:pn.clientWidth, shown:pn.offsetParent!==null}; });
  check('390 px: Paper money fits (no sideways scroll, the panel inside the screen)', F.shown && F.doc<=F.vw && F.right<=F.vw && F.pw<=F.pc+1, F);
  await p.evaluate(()=>localStorage.setItem('mbev.viewAs','easy')); await p.reload(); await p.waitForTimeout(1500);
  const E=await p.evaluate(()=>({easy:document.documentElement.getAttribute('data-viewas'), panel:(()=>{ const el=document.getElementById('ppPanel'); return el && el.offsetParent!==null; })(), words:/Paper money|paper bet/i.test(document.body.innerText)}));
  check('Easy shows nothing of Paper money', E.easy==='easy' && !E.panel && !E.words, E);
  check('no page errors (5)', !errs.length, errs); await b.close();
  console.log(`\n${pass} passed, ${fail} failed · ${Math.round((Date.now()-t0)/1000)} s`); process.exit(fail?1:0);
})();
