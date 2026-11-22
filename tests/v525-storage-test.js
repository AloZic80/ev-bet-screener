// node tests/v525-storage-test.js — v5.25 (Build A, ENG-2 / ENG-1): the storage guard, with a filled localStorage in Chromium.
// (a) sync on, storage full: a new bet that could not be saved is never deleted from the Worker (no tombstone), and it is saved once the sync meta frees room;
// (b) at the wall the bet log makes room from Watch sightings, then the oldest pruned Watch records, then grade history older than 30 days, never from bets;
// (c) Settings says how full storage is and about how many more bets fit; the Bet log says so calmly over 80%;
// (d) a setting that cannot be saved says so in its own note, and a settings save never hides the bet log banner.
// Round 2 (review HS-1, HS-5): a bet removed on purpose after a failed save stays removed; Watch records dropped for room are dropped on this device only.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs'); const zlib=require('zlib');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const mkBet=i=>({id:'seed-'+i, key:'k'+i, date:'2026-11-0'+(1+i%9), name:'Player '+i, sport:'NBA', market:'24.5 Points', book:'Novig', game:'A @ B', odds:'-110', stake:5, kind:'prop', side:'O', srcType:'api', result:i%2?'win':'loss', gradedBy:'espn', start:'2026-11-0'+(1+i%9)+'T00:00:00Z', snap:{at:'2026-11-0'+(1+i%9)+'T00:00:00Z', pad:'x'.repeat(1100)}});
async function boot(b, seed, route){
  const ctx=await b.newContext({timezoneId:'America/Chicago'});
  await ctx.addInitScript(S=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); for(const k in S) localStorage.setItem(k,S[k]); }catch(e){} }, seed);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(route){ const a=route(u,r); if(a) return a; }
    if(/espn/.test(u)) return r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1500); return {ctx,p,errs}; }
// fill to the last character (leaving FREE), after the caches are gone
const fill=(p,FREE)=>p.evaluate(FREE=>{ LS_CACHES.forEach(k=>localStorage.removeItem(k)); localStorage.removeItem('zfill');
  let lo=0,hi=6e6; while(lo<hi-1){ const m=(lo+hi)>>1; try{ localStorage.setItem('zfill','x'.repeat(m)); lo=m; }catch(e){ hi=m; } } localStorage.setItem('zfill','x'.repeat(Math.max(0,lo-FREE))); }, FREE);
const addBet=(p,id)=>p.evaluate(id=>{ addToLog({name:'New Guy', sport:'NBA', market:'20.5 Points', book:'Novig', offeredRaw:'-105', stake:5, kind:'prop', side:'O', src:'api:x'}); logged[logged.length-1].id=id; saveLog(); }, id);
(async()=>{
  const b=await chromium.launch(); const allErrs=[];
  // ---------- (a) sync on, at the wall: the Worker keeps the bet; the room the meta frees saves it ----------
  { let srv={rev:0, doc:null, nonce:''};
    const route=(u,r)=>{ if(!/api\.0xbeta\.dev/.test(u)) return null; const req=r.request(), U=new URL(u), H={'access-control-allow-origin':'http://app.test','access-control-allow-credentials':'true','access-control-allow-headers':'*','access-control-expose-headers':'*','content-type':'application/json'};
      if(req.method()==='OPTIONS') return r.fulfill({status:204,headers:H,body:''});
      if(U.pathname==='/sync/head') return r.fulfill({headers:H, body:JSON.stringify({doc:srv.doc?{rev:srv.rev}:null, board:{rev:0}})});
      if(U.pathname==='/sync' && req.method()==='GET') return r.fulfill({headers:Object.assign({'x-sync-nonce':srv.nonce,'x-sync-rev':String(srv.rev)},H), body:srv.doc?JSON.stringify(srv.doc):JSON.stringify({empty:true})});
      if(U.pathname==='/sync' && req.method()==='PUT'){ let bd=req.postDataBuffer(); if((req.headers()['x-sync-enc']||'')==='gzip') bd=zlib.gunzipSync(bd); const d=JSON.parse(bd.toString()); srv.rev++; srv.doc=d; srv.nonce=d.nonce; return r.fulfill({headers:H, body:JSON.stringify({ok:true, head:{rev:srv.rev}})}); }
      if(/^\/sync\/board/.test(U.pathname)) return r.fulfill({headers:H, body:JSON.stringify({ok:true, head:{rev:1}})});
      return r.fulfill({headers:H, body:'{}'}); };
    const {ctx,p,errs}=await boot(b,{'mbev.log':JSON.stringify(Array.from({length:300},(_,i)=>mkBet(i))), 'mbev.syncOn':'1', 'mbev.syncKey':'k'.repeat(64)}, route);
    await p.waitForTimeout(4000);
    await p.evaluate(()=>{ const gh={}; for(let i=0;i<17000;i++) gh['2026-11-0'+(i%9+1)+'|NBA|Player '+i+'|24.5 Points|-110']={sport:'NBA',gross:0.05,won:i%2==0,cover:0.55,net:0.05,stars:3,mkt:0.52,lg:0.1}; Object.assign(gradeHistory,gh); saveGradeHistory(); });
    await fill(p,0); await addBet(p,'NEWBET'); await p.waitForTimeout(7000);
    await p.reload(); await p.waitForTimeout(7000);
    const st=await p.evaluate(()=>({mem:logged.some(x=>x.id==='NEWBET'), ls:JSON.parse(localStorage.getItem('mbev.log')||'[]').some(x=>x.id==='NEWBET'), tomb:(()=>{ try{ return !!JSON.parse(localStorage.getItem('mbev.syncMeta')).c.log.T.NEWBET; }catch(e){ return 'none'; } })()}));
    const sv={has:!!(srv.doc&&srv.doc.coll.log.NEWBET), del:!!(srv.doc&&srv.doc.del&&srv.doc.del.log&&srv.doc.del.log.NEWBET)};
    check('(a) sync on, storage full: after a reload the new bet is still here (saved with the room the sync meta freed, or put back from the Worker)', st.mem, st);
    check('(a) no tombstone for it, here or on the Worker, and the Worker still has it', st.tomb!==true && sv.has && !sv.del, {st, sv});
    allErrs.push(...errs); await ctx.close(); }
  // ---------- (a2) the tombstone rule itself: while the last log save failed, a missing bet makes no tombstone ----------
  { const {ctx,p,errs}=await boot(b,{'mbev.log':JSON.stringify([mkBet(1)])});
    const r=await p.evaluate(()=>{ const st={S:{},T:{},B:{},H:{gone:'h1'}}; syncDetectColl([], st, 1, true); const keep=!st.T.gone && st.H.gone==='h1';
      const st2={S:{},T:{},B:{},H:{gone:'h1'}}; syncDetectColl([], st2, 1); return {keep, normal:!!st2.T.gone}; });
    check('(a) keepGone: no tombstone while the log could not be saved; a real deletion still makes one', r.keep && r.normal, r);
    allErrs.push(...errs); await ctx.close(); }
  // ---------- (b) the wall: Watch sightings, then the oldest pruned Watch records, then old grade history; never bets ----------
  { const W=[]; for(let i=0;i<3;i++) W.push({k:'live'+i, at:'2026-11-20T00:00:00Z', sport:'NBA', sig:[[1,2]]});
    for(let i=0;i<400;i++) W.push({k:'old'+i, at:'2026-10-'+String(1+(i%28)).padStart(2,'0')+'T00:00:00Z', first:'2026-10-'+String(1+(i%28)).padStart(2,'0')+'T00:00:00Z', sport:'NBA', result:'win', gradedAt:'2026-10-30T00:00:00Z', pruned:true, pad:'y'.repeat(500)});
    const GH={}; for(let i=0;i<50;i++) GH['2026-09-01|NBA|P'+i+'|1.5 Pts|-110']={sport:'NBA',gross:0.05,won:true,pad:'z'.repeat(400)};
    const LOG=Array.from({length:20},(_,i)=>mkBet(i));
    const {ctx,p,errs}=await boot(b,{'mbev.log':JSON.stringify(LOG), 'mbev.watchObs':JSON.stringify(W), 'mbev.gradehistory':JSON.stringify(GH)});
    await p.waitForTimeout(1000); await fill(p,0);
    const before=await p.evaluate(()=>({w:JSON.parse(localStorage.getItem('mbev.watchObs')).length, gh:Object.keys(JSON.parse(localStorage.getItem('mbev.gradehistory')||'{}')).length}));
    await addBet(p,'WALL1');
    const after=await p.evaluate(()=>{ const W=JSON.parse(localStorage.getItem('mbev.watchObs')), L=JSON.parse(localStorage.getItem('mbev.log'));
      return {saved:L.some(x=>x.id==='WALL1'), n:L.length, banner:!!document.getElementById('saveFail'), sig:W.filter(o=>o.sig).length, live:W.filter(o=>!o.pruned).length, pruned:W.filter(o=>o.pruned).length,
        oldestLeft:W.filter(o=>o.pruned).map(o=>o.first).sort()[0], gh:Object.keys(JSON.parse(localStorage.getItem('mbev.gradehistory')||'{}')).length}; });
    check('(b) at the wall the new bet is saved (no red banner), every bet kept', after.saved && after.n===21 && !after.banner, after);
    check('(b) Watch sightings went first, then only some of the oldest pruned Watch records (unpruned records kept)', after.sig===0 && after.live===3 && after.pruned<400 && after.pruned>0 && after.oldestLeft>'2026-10-01', {before, after});
    check('(b) grade history was not touched while Watch records made enough room', after.gh===before.gh, {before:before.gh, after:after.gh});
    // now no Watch room is left to give: old grade history goes next
    await p.evaluate(()=>{ window._watch=[]; localStorage.setItem('mbev.watchObs','[]'); }); await fill(p,0);
    await p.evaluate(()=>{ for(let i=0;i<8;i++){ addToLog({name:'Big '+i, sport:'NBA', market:'20.5 Points', book:'Novig', offeredRaw:'-105', stake:5, kind:'prop', side:'O', src:'api:x'}); logged[logged.length-1].id='WALL2-'+i; } saveLog(); });
    const a2=await p.evaluate(()=>({saved:JSON.parse(localStorage.getItem('mbev.log')).filter(x=>/^WALL2/.test(x.id)).length, gh:Object.keys(JSON.parse(localStorage.getItem('mbev.gradehistory')||'{}')).length, banner:!!document.getElementById('saveFail')}));
    check('(b) with no Watch room left, grade history older than 30 days makes the room', a2.saved===8 && a2.gh<before.gh && !a2.banner, a2);
    // and when nothing is left to give, the red banner says so (bets in memory are kept)
    await fill(p,0); await p.evaluate(()=>{ addToLog({name:'Huge', sport:'NBA', market:'20.5 Points', book:'Novig', offeredRaw:'-105', stake:5, kind:'prop', side:'O', src:'api:x', notes:'n'.repeat(400000)}); logged[logged.length-1].id='HUGE'; logged[logged.length-1].notes='n'.repeat(400000); saveLog(); });
    const a3=await p.evaluate(()=>({banner:!!document.getElementById('saveFail'), mem:logged.length}));
    check('(b) nothing left to drop: the red banner shows, no bet is dropped from memory', a3.banner && a3.mem===30, a3);
    allErrs.push(...errs); await ctx.close(); }
  // ---------- (c) Storage used in Settings; a calm line on the Bet log over 80% ----------
  { const {ctx,p,errs}=await boot(b,{'mbev.log':JSON.stringify(Array.from({length:20},(_,i)=>mkBet(i)))});
    await p.click('.tab[data-view="v-settings"]'); await p.waitForTimeout(300);
    const s1=await p.evaluate(()=>({t:(document.getElementById('storageUse')||{}).textContent||'', vis:(()=>{ const e=document.getElementById('storageUse'); const r=e&&e.getBoundingClientRect(); return !!(r&&r.height>0); })()}));
    check('(c) Settings shows "Storage used: X% of this browser’s space (about N more bets fit)"', /^Storage used: \d+% of this browser’s space \(about [\d,]+ more bets fit\)\.$/.test(s1.t) && s1.vis, s1);
    await p.click('.tab[data-view="v-log"]'); await p.waitForTimeout(300);
    const w0=await p.evaluate(()=>document.getElementById('storageWarn').hidden);
    await p.evaluate(()=>{ localStorage.setItem('zfill','x'.repeat(Math.round(5242880*0.85))); }); await p.click('.tab[data-view="v-settings"]'); await p.click('.tab[data-view="v-log"]'); await p.waitForTimeout(300);
    const w1=await p.evaluate(()=>{ const e=document.getElementById('storageWarn'); return {hidden:e.hidden, t:e.textContent, color:getComputedStyle(e).color}; });
    check('(c) the Bet log is quiet under 80% and says so calmly over 80% (amber, not the red banner)', w0===true && w1.hidden===false && /^Storage used: 8\d% /.test(w1.t), w1);
    allErrs.push(...errs); await ctx.close(); }
  // ---------- (d) settings: a failed save says so; a settings save never hides the bet-log banner ----------
  { const {ctx,p,errs}=await boot(b,{'mbev.log':JSON.stringify([mkBet(1)])});
    await p.evaluate(()=>{ save(); saveSweet(); }); await fill(p,0);
    await p.evaluate(()=>{ const e=document.getElementById('bank'); e.value='12500.55555'; e.dispatchEvent(new Event('change',{bubbles:true})); save(); });
    const d1=await p.evaluate(()=>({note:(document.getElementById('cfgSaveFail')||{}).textContent||'', logBanner:!!document.getElementById('saveFail'), stored:JSON.parse(localStorage.getItem('mbev.cfg')||'{}').bank}));
    check('(d) a bank that cannot be saved says so in its own note (not the bet log banner)', /setting you changed could not be saved/.test(d1.note) && !d1.logBanner && d1.stored!=='12500.55555', d1);
    await p.evaluate(()=>{ const sw=document.getElementById('swStars'); if(sw){ sw.value=String(sw.value)+'0000'; } saveSweet(); });
    const d2=await p.evaluate(()=>!!document.getElementById('cfgSaveFail'));
    check('(d) saveSweet uses the same safe save and note', d2, d2);
    await p.evaluate(()=>{ localStorage.removeItem('zfill'); saveFailNote(true); save(); });
    const d3=await p.evaluate(()=>({log:!!document.getElementById('saveFail'), cfg:!!document.getElementById('cfgSaveFail'), stored:JSON.parse(localStorage.getItem('mbev.cfg')||'{}').bank}));
    check('(d) once it saves, its note goes and the bet log banner stays', d3.log && !d3.cfg && d3.stored==='12500.55555', d3);
    allErrs.push(...errs); await ctx.close(); }
  // ================= v5.25 round 2 (review HS-1, HS-5): sync after a failed save =================
  const mkWorker=()=>{ const W={srv:{rev:0, doc:null, nonce:''}, down:false};
    W.route=(u,r)=>{ if(!/api\.0xbeta\.dev/.test(u)) return null; const req=r.request(), U=new URL(u), H={'access-control-allow-origin':'http://app.test','access-control-allow-credentials':'true','access-control-allow-headers':'*','access-control-expose-headers':'*','content-type':'application/json'}, srv=W.srv;
      if(req.method()==='OPTIONS') return r.fulfill({status:204,headers:H,body:''});
      if(W.down && /^\/sync/.test(U.pathname)) return r.fulfill({status:500,headers:H,body:'{}'});
      if(U.pathname==='/sync/head') return r.fulfill({headers:H, body:JSON.stringify({doc:srv.doc?{rev:srv.rev}:null, board:{rev:0}})});
      if(U.pathname==='/sync' && req.method()==='GET') return r.fulfill({headers:Object.assign({'x-sync-nonce':srv.nonce,'x-sync-rev':String(srv.rev)},H), body:srv.doc?JSON.stringify(srv.doc):JSON.stringify({empty:true})});
      if(U.pathname==='/sync' && req.method()==='PUT'){ let bd=req.postDataBuffer(); if((req.headers()['x-sync-enc']||'')==='gzip') bd=zlib.gunzipSync(bd); const d=JSON.parse(bd.toString()); srv.rev++; srv.doc=d; srv.nonce=d.nonce; return r.fulfill({headers:H, body:JSON.stringify({ok:true, head:{rev:srv.rev}})}); }
      if(/^\/sync\/board/.test(U.pathname)) return r.fulfill({headers:H, body:JSON.stringify({ok:true, head:{rev:1}})});
      return r.fulfill({headers:H, body:'{}'}); }; return W; };
  const small=i=>{ const x=mkBet(i); x.snap={at:x.snap.at}; return x; };
  // HS-1: one failed save, the Worker down, then a bet you remove on purpose: it stays removed (a deletion mark goes up)
  { const W=mkWorker(); const {ctx,p,errs}=await boot(b,{'mbev.log':JSON.stringify(Array.from({length:30},(_,i)=>small(i))), 'mbev.syncOn':'1', 'mbev.syncKey':'k'.repeat(64)}, W.route);
    await p.waitForTimeout(4000); await fill(p,0); W.down=true; await addBet(p,'NEWBET'); await p.waitForTimeout(6000);
    await p.evaluate(()=>localStorage.removeItem('zfill'));
    await p.evaluate(()=>{ removeBet(logged.find(x=>x.id==='seed-0'), 0); });
    W.down=false; await p.waitForTimeout(2000); await p.evaluate(()=>syncNow({force:true})); await p.waitForTimeout(3000); await p.evaluate(()=>syncNow({force:true})); await p.waitForTimeout(2000);
    const r=await p.evaluate(()=>({here:logged.some(x=>x.id==='seed-0'), n:logged.length, newbet:logged.some(x=>x.id==='NEWBET')}));
    const sv={has0:!!(W.srv.doc&&W.srv.doc.coll.log['seed-0']), del0:!!(W.srv.doc&&W.srv.doc.del.log&&W.srv.doc.del.log['seed-0']), hasNew:!!(W.srv.doc&&W.srv.doc.coll.log.NEWBET)};
    check('HS-1: a bet removed on purpose after a failed save stays removed (here and on the Worker, with its deletion mark); the unsaved bet is kept', !r.here && !sv.has0 && sv.del0 && r.newbet && sv.hasNew, {r, sv});
    allErrs.push(...errs); await ctx.close(); }
  // HS-5: Watch records dropped to make room are forgotten on this device only: no deletion mark, and the cloud copy does not bring them back here
  { const W=mkWorker(); const WR=[]; for(let i=0;i<60;i++) WR.push({k:'old'+i, at:'2026-10-'+String(1+(i%28)).padStart(2,'0')+'T00:00:00Z', first:'2026-10-'+String(1+(i%28)).padStart(2,'0')+'T00:00:00Z', sport:'NBA', result:'win', gradedAt:'2026-10-30T00:00:00Z', pruned:true, pad:'y'.repeat(500)});
    const {ctx,p,errs}=await boot(b,{'mbev.log':JSON.stringify(Array.from({length:20},(_,i)=>small(i))), 'mbev.watchObs':JSON.stringify(WR), 'mbev.syncOn':'1', 'mbev.syncKey':'k'.repeat(64)}, W.route);
    await p.waitForTimeout(5000); const cloud0=W.srv.doc?Object.keys(W.srv.doc.coll.watch||{}).length:0;
    await fill(p,0); await addBet(p,'WALLW'); await p.waitForTimeout(6000); await p.evaluate(()=>syncNow({force:true})); await p.waitForTimeout(3000);
    const r=await p.evaluate(()=>{ const m=JSON.parse(localStorage.getItem('mbev.syncMeta')), st=m.c.watch||{}; return {saved:JSON.parse(localStorage.getItem('mbev.log')).some(x=>x.id==='WALLW'), here:watchAll().length, T:Object.keys(st.T||{}).length, X:Object.keys(st.X||{}).length}; });
    const del=W.srv.doc&&W.srv.doc.del&&W.srv.doc.del.watch?Object.keys(W.srv.doc.del.watch).length:0;
    check('HS-5: Watch records dropped for room leave no deletion mark (here or on the Worker) and are not put back on this device', cloud0===60 && r.saved && r.here<60 && r.T===0 && r.X===60-r.here && del===0, {cloud0, r, del});
    const m=await p.evaluate(()=>{ const st={S:{},T:{},B:{},H:{},X:{w1:1}}; const o=syncMergeColl([], {w1:{v:{k:'w1'},m:5}, w2:{v:{k:'w2'},m:5}}, {}, st, false); return o.out.map(x=>x[0]).join(','); });
    check('HS-5: the merge skips only the dropped ids', m==='w2', m);
    allErrs.push(...errs); await ctx.close(); }
  check('no page errors', !allErrs.length, allErrs.slice(0,5));
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
