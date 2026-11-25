// node tests/v530-paper-sync-test.js — v5.30 round 3 (owner 11/25: "Paper grade could be on the app but be graded apart away from the repo"): the app sends its
// paper records to the owner's Worker (POST /paper) and reads the Worker's grades back (GET /paper?since=), against a fake Worker that follows the v3.51
// contract (src/paper.js): both locks, first sighting frozen, seq paging, result written by the Worker only. Also: no calls without a sync password or while
// paused, the backfill once, local grading when the Worker is down, void not counted, a live or pick'em real bet never marks "bet for real", the hang line.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html'); const crypto=require('crypto');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8'), FX=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures-nhl-2026-11-05.json'),'utf8'));
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,600)); };
const H=3600e3, TIP=Date.parse('2026-11-27T01:00:00Z'), NOW=TIP-7*H, DAY='2026-11-26', iso=ms=>new Date(ms).toISOString();
const PW='paper-test-pw', KEY=crypto.createHash('sha256').update('0xbeta-sync:'+PW).digest('hex'), PASS='screener-pass';
const T=(ha,abbr)=>({ha,id:abbr,abbr,name:abbr+' Team',loc:abbr,nick:'Team',logo:'',rec:'',color:'333333',alt:'ffffff'});
const am=p=>p>=0.5?String(Math.round(-100*p/(1-p))):'+'+Math.round(100*(1-p)/p);
const row=(id,player,c,o)=>Object.assign({name:player,team:'T'+id,game:'T'+id+' @ H'+id,matchup:'T'+id+' @ H'+id,side:'O',sport:'NHL',market:'1.5 Shots On Goal',kind:'prop',book:'Novig',offeredRaw:am(c-0.04),offeredProb:+(c-0.04).toFixed(4),fairProb:c,fairRaw:'',mktProb:c,stars:3,evModel:'market',
  gameInfo:{state:'pre',startISO:iso(TIP),eventId:'7'+id,timeCT:'',detail:'',teams:[T('away','T'+id),T('home','H'+id)]},src:'api:NHL:props',apiKey:id,loadedAt:iso(NOW)}, o||{});
const board=at=>{ const L=[row('c','Charlie Strong',0.62), row('g','Golf Coin',0.47), row('h','Hotel Unlikely',0.40), row('i','India Coin',0.48)]; L.forEach(r=>r.loadedAt=iso(at)); return {v:1,savedAt:iso(at),slate:DAY,rows:L}; };
// ---- the fake Worker (v3.51 contract)
function fakeWorker(){ const W={recs:new Map(), alias:new Map(), seq:0, calls:[], posts:[], down:false, badLocks:0};
  const MUT=['near','stale','nb','nsWhy','nsLast','nsMiss','obs','nObs'], SERVER=['id','seq','upd','srv','result','gradedAt','gradedBy','grade','gradeWhy','voidWhy','parked','appResult','appGradedAt'];
  W.bump=r=>{ r.seq=++W.seq; r.upd=new Date().toISOString(); };
  W.grade=(name,result)=>{ for(const r of W.recs.values()) if(r.name===name && !r.result){ r.result=result; r.gradedAt=new Date().toISOString(); r.gradedBy='worker-espn'; delete r.gradeWhy; if(result==='void') r.voidWhy='postponed'; W.bump(r); } };
  W.handle=(req)=>{ const u=new URL(req.url()), h=req.headers(); W.calls.push(req.method()+' '+u.pathname+u.search);
    if(W.down) return {status:500, body:JSON.stringify({ok:false,error:'down'})};
    if(h['x-screener-pass']!==PASS || h['x-sync-key']!==KEY){ W.badLocks++; return {status:401, body:JSON.stringify({ok:false,code:'bad_key',error:'wrong sync password'})}; }
    if(u.pathname==='/paper/head') return {status:200, body:JSON.stringify({seq:W.seq, records:W.recs.size, open:[...W.recs.values()].filter(r=>!r.result).length, settled:{}, voided:0, parked:0, lastTick:null})};
    if(u.pathname==='/paper' && req.method()==='GET'){ const since=+u.searchParams.get('since')||0, lim=Math.min(500,+u.searchParams.get('limit')||200);
      const L=[...W.recs.values()].filter(r=>r.seq>since).sort((a,b)=>a.seq-b.seq), page=L.slice(0,lim), more=L.length>lim;
      return {status:200, body:JSON.stringify({ok:true, seq:more?page[page.length-1].seq:W.seq, more, records:page})}; }
    if(u.pathname==='/paper' && req.method()==='POST'){ const t=req.postData()||''; if(t.length>2*1024*1024) return {status:413, body:'{"ok":false}'};
      const list=JSON.parse(t).records; if(!Array.isArray(list) || list.length>300) return {status:413, body:'{"ok":false}'}; W.posts.push(list.map(x=>x.k));
      const out={ok:true, added:0, updated:0, same:0, rejected:[]};
      for(const x of list){ const s=Date.parse(x.start), ft=x.first&&(+x.first.t||Date.parse(x.first.at));
        if(!x.k || isNaN(s) || !x.sport || !(ft>0) || ft>=s || JSON.stringify(x).length>32*1024){ out.rejected.push({k:String(x.k||'').slice(0,120), why:'first seen at or after the start'}); continue; }
        const id=W.alias.get(x.k)||(x.pk&&W.alias.get(x.pk)); let r=id&&W.recs.get(id);
        if(!r){ r={}; Object.keys(x).forEach(f=>{ if(!SERVER.includes(f)) r[f]=x[f]; }); r.id=x.k; r.result=null; r.gradeWhy='waiting for the game'; W.recs.set(r.id,r); out.added++; W.bump(r); }
        else { const was=JSON.stringify(r); if(!r.result) MUT.forEach(f=>{ if(x[f]!==undefined) r[f]=x[f]; }); if(x.real && !r.real) r.real=x.real; if(x.realSeen && !r.realSeen) r.realSeen=x.realSeen;
          if(JSON.stringify(r)===was) out.same++; else { out.updated++; W.bump(r); } }
        [x.k,x.pk].forEach(k=>{ if(k && !W.alias.has(k)) W.alias.set(k, r.id); }); }
      out.seq=W.seq; return {status:200, body:JSON.stringify(out)}; }
    return {status:405, body:'{"ok":false}'}; };
  W.paper=()=>W.calls.filter(c=>/ \/paper/.test(c));
  return W; }
async function open(W, opts){ opts=opts||{};
  const b=opts.browser||await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:1280,height:900}}); await ctx.clock.install({time:new Date(opts.now||NOW)});
  if(opts.pre) await ctx.addInitScript(opts.pre);
  await ctx.addInitScript(([B,L,sync,key,pass,pause])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig, Kalshi',bank:'500',cfgVer:3.03}));
    if(B) localStorage.setItem('mbev.board',JSON.stringify(B)); localStorage.setItem('mbev.log',JSON.stringify(L||[])); localStorage.setItem('mbev.pass',pass);
    if(sync){ localStorage.setItem('mbev.syncOn','1'); localStorage.setItem('mbev.syncKey',key); }
    if(pause){ const d=new Date().toLocaleDateString('en-CA',{timeZone:'America/Chicago'}); localStorage.setItem('mbev.wk',JSON.stringify({d, n:0, p:{}, pause:Date.now()+3600e3, why:'test'})); } }catch(e){} },
    [opts.board===undefined?board(opts.now||NOW):opts.board, opts.log||[], opts.sync!==false, KEY, PASS, !!opts.paused]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(), Hd={'access-control-allow-origin':'*'}; if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/api\.0xbeta\.dev\/paper/.test(u)){ if(W.hook){ const h=W.hook(r.request()); if(h){ const uu=new URL(u); W.calls.push(r.request().method()+' '+uu.pathname+uu.search); } if(h==='hang') return; if(h) return r.fulfill({status:h.status, contentType:'application/json', headers:Hd, body:h.body}); } const a=W.handle(r.request()); return r.fulfill({status:a.status, contentType:'application/json', headers:Hd, body:a.body}); }
    if(/0xbeta/.test(u)) return r.fulfill({status:503, contentType:'application/json', headers:Hd, body:'{"ok":false,"code":"no_key"}'});
    if(opts.espn && /hockey\/nhl\/scoreboard/.test(u)) return r.fulfill({contentType:'application/json',headers:Hd,body:JSON.stringify(/dates=20261105/.test(u)?FX.scoreboard:{events:[]})});
    if(opts.espn && /hockey\/nhl\/summary/.test(u)) return r.fulfill({contentType:'application/json',headers:Hd,body:JSON.stringify(FX.summary)});
    if(/espn/.test(u)) return r.fulfill({contentType:'application/json',headers:Hd,body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(opts.wait||1800); return {b,ctx,p,errs}; }
const recs=p=>p.evaluate(()=>ppS().A.map(o=>JSON.parse(JSON.stringify(o))));
const by=(A,n)=>A.find(o=>o.name===n);
const reports=async p=>{ await p.evaluate(()=>document.querySelector('.tab[data-view="v-reports"]').click()); await p.waitForTimeout(400); return p.evaluate(()=>document.getElementById('ppBody').innerText.replace(/\s+/g,' ')); };
(async()=>{ const t0=Date.now(); const browser=await chromium.launch();
  // ---- 1. device A: the first load sends its paper bets in one POST, with both locks in headers (never in the URL); redraws with no change send nothing
  const W=fakeWorker(); let {ctx,p,errs}=await open(W, {browser});
  let A=await recs(p);
  check('device A: 3 paper bets (Golf, Hotel, India), sent in one POST at load after one GET; the locks are headers, never in a URL', A.length===3 && W.posts.length===1 && W.posts[0].length===3 && W.recs.size===3 && W.badLocks===0 && W.calls[0]==='GET /paper?since=0&limit=500' && !W.calls.some(c=>c.includes(KEY)||c.includes(PASS)||c.includes(PW)), {calls:W.calls, posts:W.posts});
  check('each record says it was sent (wkSent)', A.every(o=>o.wkSent>0), A.map(o=>o.wkSent));
  await p.evaluate(()=>{ refresh(); refresh(); refresh(); }); await p.waitForTimeout(400);
  check('three redraws with nothing new: no POST', W.posts.length===1, W.posts.length);
  await ctx.clock.setSystemTime(new Date(NOW+20*60e3));
  await p.evaluate(()=>{ const r=lastRows.find(x=>x.name==='Golf Coin'); r.offeredProb=0.42; r.offeredRaw='+138'; r.loadedAt=new Date().toISOString(); refresh(); }); await p.waitForTimeout(400);
  check('a new price on Golf Coin only: one POST with only that record', W.posts.length===2 && W.posts[1].length===1 && /golf coin/.test(W.posts[1][0]), W.posts);
  // ---- 2. the Worker grades: a GET (Reports open, a few minutes later) merges its grade; the local first sighting stays
  const gk=[...W.recs.values()].find(r=>r.name==='Golf Coin'); gk.first=Object.assign({}, gk.first, {price:0.99}); W.grade('Golf Coin','win'); W.grade('India Coin','void');
  let txt=await reports(p); const gets0=W.calls.filter(c=>c.startsWith('GET')).length;
  await ctx.clock.fastForward(5*60e3); await p.waitForTimeout(600);
  A=await recs(p); const g=by(A,'Golf Coin'), ic=by(A,'India Coin');
  check('with Reports open, the next check (a few minutes) GETs the grades: Golf Coin Won by worker-espn, the local first price (0.43) kept', W.calls.filter(c=>c.startsWith('GET')).length===gets0+1 && g.result==='win' && g.gradedBy==='worker-espn' && g.first.price===0.43, {calls:W.calls.slice(-3), g:{r:g.result, by:g.gradedBy, f:g.first.price}});
  txt=await p.evaluate(()=>document.getElementById('ppBody').innerText.replace(/\s+/g,' '));
  const ag=await p.evaluate(()=>{ const L=ppS().A.filter(o=>o.group==='coin'); return ppAgg(L, o=>o.first); });
  check('void is neither a win nor a loss: the Coin Flip group counts 1 settled (Golf), India is "void ($1 back, not counted)"', ic.result==='void' && ag.n===1 && ag.w===1 && /1 void \(\$1 back, not counted\)/.test(txt), {n:ag.n, w:ag.w, l:ag.l, txt:txt.slice(txt.indexOf('Coin Flip'), txt.indexOf('Coin Flip')+200)});
  check('the one plain line: graded by your Worker (count), waiting, parked, last check', /Graded by your Worker: 2 · waiting: 1 · parked: 0 · last check \d/.test(txt), txt.slice(txt.indexOf('Graded by'), txt.indexOf('Graded by')+120));
  const nGet=W.calls.length; await p.evaluate(()=>document.querySelector('.tab[data-view="v-board"]').click()); await ctx.clock.fastForward(10*60e3); await p.waitForTimeout(300);
  check('with Reports closed and nothing due: no more GETs', W.calls.length===nGet, W.calls.slice(nGet));
  check('no page errors (A)', !errs.length, errs); await ctx.close();
  // ---- 3. device B (a fresh browser, the same sync password): the records from device A come in with their grades
  ({ctx,p,errs}=await open(W, {browser, board:null}));
  A=await recs(p);
  check('device B: one GET brings device A’s 3 paper bets, Golf Coin Won, first price as the Worker froze it; nothing to POST back', A.length===3 && by(A,'Golf Coin').result==='win' && by(A,'Hotel Unlikely').result===null && W.posts.length===2, {n:A.length, posts:W.posts.length});
  check('no page errors (B)', !errs.length, errs); await ctx.close();
  // ---- 4. no sync password, or the Worker paused: no paper calls, and the line says so plainly
  const W2=fakeWorker(); ({ctx,p,errs}=await open(W2, {browser, sync:false}));
  txt=await reports(p);
  check('no sync password: no paper call, and "Saved on this device only: add your sync password in Settings to grade on your Worker"', W2.paper().length===0 && txt.includes('Saved on this device only: add your sync password in Settings to grade on your Worker.') && (await recs(p)).length===3, {calls:W2.calls});
  // ---- 5. the backfill: turning the password on later sends the 3 records once; a reload sends nothing again
  await p.evaluate(([k])=>{ localStorage.setItem('mbev.syncOn','1'); localStorage.setItem('mbev.syncKey',k); SY.on=true; SY.key=k; ppWkTick(); }, [KEY]); await p.waitForTimeout(600);
  check('backfill: with the password set, the 3 saved paper bets go up in one POST', W2.posts.length===1 && W2.posts[0].length===3 && W2.recs.size===3, W2.posts);
  await p.reload(); await p.waitForTimeout(1800); await p.evaluate(()=>{ refresh(); ppWkTick(); }); await p.waitForTimeout(400);
  check('backfill once: a reload GETs but posts nothing again', W2.posts.length===1 && W2.calls.filter(c=>c.startsWith('GET')).length>=2, W2.calls);
  check('no page errors (no password, backfill)', !errs.length, errs); await ctx.close();
  const W3=fakeWorker(); ({ctx,p,errs}=await open(W3, {browser, paused:true}));
  txt=await reports(p); await p.evaluate(()=>{ refresh(); ppWkTick(); }); await p.waitForTimeout(300);
  check('Worker paused: no paper call, and the line says it is paused', W3.paper().length===0 && /Your Worker is paused/.test(txt), {calls:W3.calls, line:txt.slice(txt.indexOf('Your Worker'), txt.indexOf('Your Worker')+120)});
  await ctx.close();
  // ---- 6. the Worker down: paper bets are graded on this device (the same ESPN code), and the line says why; with the Worker up the device leaves it to the Worker
  const rec=()=>({k:'NHL|pavel dorofeyev|sog|O|2.5|e401892653', pk:'NHL|pavel dorofeyev|sog|O|2.5|2026-11-06T00:00:00.000Z', v:1, policy:'paper-v1', at:'2026-11-05T22:00:00.000Z', snap:{at:'2026-11-05T22:00:00.000Z'}, sport:'NHL', kind:'prop', name:'Pavel Dorofeyev', team:'PHI', market:'2.5 Shots On Goal', side:'O', line:null, betnow:'O 2.5 -108', game:'PHI @ NYR', matchup:'PHI @ NYR', ev:'401892653', start:'2026-11-06T00:00:00.000Z', date:'2026-11-05', dateSet:true, book:'Novig', planMin:50, group:'coin', result:null,
    first:{t:Date.parse('2026-11-05T22:00:00Z'), at:'2026-11-05T22:00:00.000Z', price:0.52, fee:0, act:0.477, actNet:0.03, kelly:2, stake:2, limitZero:false}, near:null, stale:null, nsMiss:{}, obs:[]});
  const run6=async down=>{ const W4=fakeWorker(); W4.down=down; const o=await open(W4, {browser, now:Date.parse('2026-11-06T05:03:00Z'), board:null, espn:true});
    const r=await o.p.evaluate(async([x,held])=>{ if(held) x.wkSent=1; const S=ppS(); S.A.push(x); S.by.set(x.k,x); S.by.set(x.pk,x); await autoGradeLog(); await paperGrade(); document.querySelector('.tab[data-view="v-reports"]').click(); await new Promise(z=>setTimeout(z,300)); return {r:x.result, by:x.gradedBy||null, line:(document.getElementById('ppWk')||{}).textContent||''}; }, [rec(), !down]);
    await o.ctx.close(); return r; };
  const dn=await run6(true), up=await run6(false);
  check('Worker down (500): graded on this device from ESPN (Won, espn) and the line says the Worker could not take them', dn.r==='win' && dn.by==='espn' && /could not take the paper bets/.test(dn.line), dn);
  check('Worker up: the device does not grade a record the Worker holds (the Worker does)', up.r===null, up);
  // ---- 7. p9: a live or pick’em real bet never marks the paper bet "bet for real"; a pregame single does
  const bet=(id,o)=>Object.assign({id,key:id,kind:'prop',sport:'NHL',book:'Novig',name:'Golf Coin',market:'1.5 Shots On Goal',side:'O',odds:'+133',stake:2,game:'Tg @ Hg',start:iso(TIP),date:DAY,placedAt:iso(NOW-H),snap:{at:iso(NOW-H)}},o||{});
  const C7={same:[bet('a')], live:[bet('d',{placedAt:iso(TIP+600e3),snap:{at:iso(TIP+600e3)}})], pickem:[bet('f',{book:'PrizePicks'})]}, want={same:true, live:false, pickem:false}, got={};
  for(const k of Object.keys(C7)){ const W5=fakeWorker(); const o=await open(W5, {browser, sync:false, log:C7[k], board:{v:1,savedAt:iso(NOW),slate:DAY,rows:[row('g','Golf Coin',0.47)]}}); await reports(o.p);
    got[k]=await o.p.evaluate(()=>{ const x=ppS().A.find(o=>o.name==='Golf Coin'); return {real:!!(x&&x.real), seen:!!(x&&x.realSeen)}; }); await o.ctx.close(); }
  check('p9: a pregame single marks "bet for real"; a live bet and a pick’em bet do not (neither the log match nor the board’s ALREADY BET)', got.same.real && !got.live.real && !got.live.seen && !got.pickem.real && !got.pickem.seen, got);
  // ---- 8. p4: a storage that never answers is said plainly after about 5 seconds; every save refused: said once, no stream of page errors
  { const W6=fakeWorker(); const o=await open(W6, {browser, sync:false, pre:()=>{ IDBFactory.prototype.open=function(){ return {}; }; }, wait:1500});
    await reports(o.p); const early=await o.p.evaluate(()=>ppS().err); await o.p.waitForTimeout(4500); await reports(o.p);
    const late=await o.p.evaluate(()=>({err:ppS().err, ready:ppS().ready, n:ppS().A.length, shown:document.getElementById('ppBody').innerText}));
    check('p4 hang: after about 5 seconds the panel says the storage did not open (paper bets kept while the page is open)', !early && late.ready && /did not open in 5 seconds/.test(late.err) && late.shown.includes('did not open in 5 seconds') && late.n===3, {early, late:{err:late.err, n:late.n}});
    check('no page errors (hang)', !o.errs.length, o.errs); await o.ctx.close(); }
  { const W7=fakeWorker(); const o=await open(W7, {browser, sync:false, pre:()=>{ IDBObjectStore.prototype.put=function(){ throw new DOMException('full','QuotaExceededError'); }; }});
    for(let i=0;i<5;i++){ await o.p.evaluate(()=>{ ppS().A.forEach(ppDirty); ppFlush(); refresh(); }); await o.p.waitForTimeout(100); }
    const r=await o.p.evaluate(()=>({err:ppS().err, fails:ppS().saveFails, next:ppS().saveNext-Date.now()}));
    check('p4 every save refused: one plain line, retried with a backoff, no page errors', /could not save on this device \(QuotaExceededError\)/.test(r.err) && r.fails===1 && r.next>20e3 && !o.errs.length, {r, errs:o.errs.slice(0,3)});
    await o.ctx.close(); }
  // ---- 9. round 4 (review F1–F7)
  const addCard=(p,name,ch)=>p.evaluate(([n,c])=>{ const r=JSON.parse(JSON.stringify(lastRows.find(x=>x.name==='Golf Coin'))); r.name=n; r.team='T'+c; r.apiKey=c; r.game=r.matchup='T'+c+' @ H'+c; r.gameInfo.eventId='7'+c; r.loadedAt=new Date().toISOString(); lastRows.push(r); refresh(); }, [name,ch]);
  const minutes=async(o,n)=>{ for(let i=0;i<n;i++){ await o.ctx.clock.fastForward(60e3); await o.p.evaluate(()=>{ try{ refresh(); }catch(e){} }); await o.p.waitForTimeout(40); } };
  { // F1: a card whose POST failed is sent after a reload (wkDirty saved), and nobody else grades it meanwhile
    const W8=fakeWorker(); const o=await open(W8, {browser}); W8.down=true; await o.ctx.clock.setSystemTime(new Date(NOW+10*60e3)); await addCard(o.p,'Juliet Coin','j'); await o.p.waitForTimeout(500);
    const j1=await o.p.evaluate(()=>{ const x=ppS().A.find(o=>o.name==='Juliet Coin'); return {sent:!!x.wkSent, dirty:!!x.wkDirty}; });
    W8.down=false; await o.ctx.clock.setSystemTime(new Date(NOW+40*60e3)); await o.p.reload(); await o.p.waitForTimeout(1800);
    check('F1: a card first seen while the Worker was down (unsent, wkDirty saved) reaches the Worker after a reload', !j1.sent && j1.dirty && [...W8.recs.values()].some(r=>r.name==='Juliet Coin') && (await o.p.evaluate(()=>!ppS().A.find(o=>o.name==='Juliet Coin').wkDirty)), {j1, worker:W8.recs.size});
    check('no page errors (F1)', !o.errs.length, o.errs); await o.ctx.close(); }
  { // F2: loaded while the Worker is paused: once the pause ends, a new card is sent
    const W9=fakeWorker(); const o=await open(W9, {browser, paused:true}); const s0=await o.p.evaluate(()=>ppWk().started);
    await o.p.evaluate(()=>{ const w=wkState(); w.pause=Date.now()+5*60e3; wkSave(); }); await o.ctx.clock.fastForward(6*60e3); await addCard(o.p,'Kilo Coin','k'); await minutes(o, 5);
    check('F2: a page loaded while paused starts after the pause and sends its cards (Kilo Coin and the first 3)', s0===false && [...W9.recs.values()].some(r=>r.name==='Kilo Coin') && W9.recs.size===4, {s0, worker:[...W9.recs.values()].map(r=>r.name)});
    await o.ctx.close(); }
  { // F3: a record the Worker refuses is graded on this device, and the line counts it
    const W10=fakeWorker(); W10.hook=r=>{ if(r.method()!=='POST') return null; const list=JSON.parse(r.postData()).records; return {status:200, body:JSON.stringify({ok:true, seq:W10.seq, added:0, updated:0, same:0, rejected:list.map(x=>({k:x.k.slice(0,120), why:'first sighting in the future'}))})}; };
    const o=await open(W10, {browser, now:Date.parse('2026-11-06T05:03:00Z'), board:null, espn:true});
    const r=await o.p.evaluate(async(x)=>{ const S=ppS(); S.A.push(x); S.by.set(x.k,x); S.by.set(x.pk,x); ppDirty(x); await ppPush(); await paperGrade(); return {rej:x.wkRej||null, r:x.result, by:x.gradedBy||null, line:ppWkLine()}; }, rec());
    check('F3: refused by the Worker → graded on this device (Won, espn) and the line says "1 refused by the Worker"', r.rej && r.r==='win' && r.by==='espn' && /1 refused by the Worker/.test(r.line), r);
    await o.ctx.close(); }
  { // F4: the first GET never answers: it gives up after 20 seconds, and within 30 minutes the Worker has the paper bets
    const W11=fakeWorker(); let n=0; W11.hook=r=>(r.method()==='GET' && n++===0)?'hang':null; const o=await open(W11, {browser}); await reports(o.p); await minutes(o, 30);
    check('F4: a stalled GET times out (20 s) and the paper bets reach the Worker within 30 minutes', W11.recs.size===3 && !(await o.p.evaluate(()=>ppWk().busyG)), {calls:W11.paper().slice(0,4), n:W11.recs.size});
    await o.ctx.close(); }
  { // F5 + F6: POST failing (GET fine) backs off on its own; malformed answers are failures with a backoff, no page error, bounded paging
    const W12=fakeWorker(); const o=await open(W12, {browser}); W12.hook=r=>r.method()==='POST'?{status:507, body:'{"ok":false,"error":"store","code":"store"}'}:null; await reports(o.p);
    await o.ctx.clock.setSystemTime(new Date(NOW+10*60e3)); await addCard(o.p,'Lima Coin','l'); const c0=W12.paper().length; await minutes(o, 30);
    const C=W12.paper().slice(c0), posts=C.filter(c=>c.startsWith('POST')).length;
    check('F5: POST failing while GET works: POSTs back off on their own (≤ 6 in 30 minutes, Reports open)', posts>=3 && posts<=6, {posts, gets:C.length-posts});
    await o.ctx.close();
    const W13=fakeWorker(); W13.hook=r=>r.method()==='GET'?{status:200, body:'{"ok":true,"seq":3,"more":true,"records":{}}'}:null; const q=await open(W13, {browser}); await reports(q.p); await minutes(q, 30);
    const g13=W13.paper().filter(c=>c.startsWith('GET')).length, l13=await q.p.evaluate(()=>ppWkLine());
    check('F6: records:{} is a failed GET: no page error, backed off (≤ 6 GETs in 30 min), the line says it could not be read, the device grades', !q.errs.length && g13<=6 && /could not be read/.test(l13) && (await q.p.evaluate(()=>!ppWkGrades())), {g13, l13, errs:q.errs.slice(0,2)});
    await q.ctx.close();
    const W14=fakeWorker(); W14.hook=r=>r.method()==='GET'?{status:200, body:'{"ok":true,"more":true,"records":[]}'}:null; const q2=await open(W14, {browser}); await reports(q2.p); await minutes(q2, 10);
    const g14=W14.paper().filter(c=>c.startsWith('GET')).length;
    check('F6: more:true with no seq stops paging (one GET a check, ≤ 5 in 10 minutes)', g14<=5 && !q2.errs.length, {g14});
    await q2.ctx.close(); }
  { // F7: the read position is saved only with its records: a device whose first saves failed reads them all again
    const W15=fakeWorker(); let o=await open(W15, {browser}); await o.ctx.close();
    o=await open(W15, {browser, board:null, pre:()=>{ if(!sessionStorage.getItem('idbok')) IDBObjectStore.prototype.put=function(){ throw new DOMException('full','QuotaExceededError'); }; }});
    const v1=await o.p.evaluate(()=>({n:ppS().A.length, seq:JSON.parse(localStorage.getItem('mbev.paperWk')||'{}').seq||0}));
    await o.p.evaluate(()=>sessionStorage.setItem('idbok','1')); await o.p.reload(); await o.p.waitForTimeout(1800);
    const v2=await o.p.evaluate(()=>({n:ppS().A.length, seq:JSON.parse(localStorage.getItem('mbev.paperWk')||'{}').seq||0}));
    check('F7: saves refused on the first visit: the position stays 0; after the storage recovers a reload brings the 3 records back', v1.n===3 && v1.seq===0 && v2.n===3 && v2.seq===3, {v1, v2});
    check('no page errors (F7)', !o.errs.length, o.errs); await o.ctx.close(); }
  await browser.close();
  console.log(`\n${pass} passed, ${fail} failed · ${Math.round((Date.now()-t0)/1000)} s`); process.exit(fail?1:0);
})();
