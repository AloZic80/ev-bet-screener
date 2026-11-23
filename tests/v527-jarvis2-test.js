// node tests/v527-jarvis2-test.js [index.html] — v5.27 🤖 Jarvis, part 2 (the round-1 build: the away digest, near-misses, the AI line, the Worker paused, mute, Easy and a customer build, layout). The setup, the fake board and the fake Worker are in v527-jarvis-lib.js (no real API).
const { chromium, html, check, open, ev, safe, pop, tick, click, fresh, cardSave, NOW, DAY, KO, H, M, iso, ROWS, res } = require('./v527-jarvis-lib.js');
(async()=>{ const b=await chromium.launch(); let X;
  // ================= 3. outside the window: silent, then the digest =================
  await safe('digest', async()=>{
    X=await open(b,1280,{at:Date.parse('2026-11-10T19:20:00Z') /* 1:20 PM: between the windows */});
    await X.p.waitForTimeout(1500); await tick(X.p);
    const o=await ev(X.p,()=>({pop:!!(document.getElementById('jvPop')&&!document.getElementById('jvPop').hidden), away:jvRun().away.map(x=>x.t), runs:window._runs.length, beeps:window._beeps}));
    check('outside the windows: silent (no pop-up, no sound, no Scout) and a short “While you were away” list of the approved picks', !o.pop && o.away.length===3 && o.runs===0 && o.beeps===0 && o.away.some(x=>/^Bo Horvat Over 1\.5 Shots · Kalshi$/.test(x)), o);
    await X.p.clock.fastForward(25*M); await X.p.waitForTimeout(300); await tick(X.p);   /* fastForward: the clock jumps (due timers fire once), so the file stays well under 300 s */
    check('still no Scout outside the windows', (await ev(X.p,()=>window._runs.length))===0, null);
    await ev(X.p,()=>{ const r=lastRows.find(x=>x.apiKey==='a'); r.offeredProb=0.55; r.offeredRaw='-122'; refresh(); });
    await X.p.clock.fastForward(76*M); await X.p.waitForTimeout(300); await tick(X.p);   // 3:01 PM
    const D=await pop(X.p);
    check('at the start of the next window the digest comes first: the picks seen while away, with what happened to each (price moved, still approved)', D && D.digest && D.head==='🤖 Jarvis · While you were away' && D.dl.length===3 && D.dl.some(x=>/Justin Jefferson .*price moved up 1\.0 pts · still approved, it pops next/.test(x)), D);
    await click(X.p,'#jvPop .jv-dg-go'); const D2=await pop(X.p);
    check('OK on the digest: the picks pop', D2 && !D2.digest && D2.head==='🤖 Jarvis · Bet this', D2&&D2.head);
    check('no page errors (digest)', !X.errs.length, X.errs);
    await X.ctx.close();
  });
  // ================= 4. near-misses, the AI line, the Worker paused =================
  await safe('near', async()=>{
    X=await open(b,1280,{ai:true, notif:'granted', news:body=>body.input && body.input.player==='Brad Marchand'?'questionable':'ok', aiLog:[{at:new Date(NOW-H).toISOString(), job:'news', usd:0.04},{at:new Date(NOW-2*H).toISOString(), job:'slip', usd:0.02},{at:new Date(NOW-5*24*H).toISOString(), job:'news', usd:0.5},{at:'2026-10-20T15:00:00Z', job:'news', usd:9}]});
    await X.p.waitForTimeout(2500);
    const on=await ev(X.p,()=>aiOn()); check('setup: the AI helper is on', on, on);
    const seen=[]; for(let i=0;i<12;i++){ const P=await pop(X.p); if(!P){ await tick(X.p); await X.p.waitForTimeout(400); continue; } seen.push(P); await X.p.waitForTimeout(400); const P2=await pop(X.p); seen[seen.length-1]=P2||P; await click(X.p,'#jvPop .jv-skip'); await tick(X.p); await X.p.waitForTimeout(400); }
    const appr=seen.filter(x=>!x.near), near=seen.filter(x=>x.near);
    check('approved picks get one AI line from the news check (a label)', appr.length===3 && appr.every(x=>/^📰 Available: Expected to play\. · AI news check, a label only$/.test(x.ai||'')), appr.map(x=>x.ai));
    const nk=await ev(X.p,K=>K.map(k=>lastRows.find(r=>pxKey(r)===k).name), near.map(x=>x.key));
    check('near-misses: at most 2 a day, only those whose news check gives no warning (Marchand is questionable: never shown)', near.length===2 && !nk.includes('Brad Marchand'), nk);
    check('a near-miss says “Just missed · not approved · the app gives it no stake” and has no stake line (its news line is there)', near.length>0 && near.every(x=>x.head==='🤖 Jarvis · 🍀 Just missed' && x.nm==='Just missed · not approved · the app gives it no stake' && !('Stake' in x.kv) && !x.tkt && /^📰 Available: Expected to play\./.test(x.ai||'')), near);
    const inp=X.S.ai.map(x=>x.job+':'+Object.keys(x.input||{}).sort().join(','));
    check('AI calls only through aiCall, job news, with only what it needs (game, sport, market, start, player, team)', X.S.ai.length>0 && X.S.ai.every(x=>x.job==='news') && inp.every(s=>/^news:(game,market,player,sport,startISO,team|game,market,player,sport,startISO)$/.test(s)), inp);
    const nNews=X.S.ai.length;
    // the spend line
    await ev(X.p,()=>{ document.querySelector('.tab[data-view="v-settings"]').click(); document.getElementById('jarvisPanel').open=true; jvPaint(true); });
    const sp=await ev(X.p,()=>document.getElementById('jvSpend').textContent);
    check('the spend line: today’s and this month’s AI spend from mbev.ai.log, and the Worker’s caps ($5 a day, $90 a month)', /^AI spent today \$0\.\d\d · this month \$0\.\d\d \(from the AI log\)\. The Worker’s caps: \$5\.00 a day, \$90\.00 a month/.test(sp) && !/\$9\./.test(sp), sp);
    const m=sp.match(/today \$(\d+\.\d\d) · this month \$(\d+\.\d\d)/); const tD=m&&+m[1], tM=m&&+m[2];
    check('…the numbers add up (today ≥ $0.06 with the seeded 6¢ plus each news check; the month adds the 50¢ from 5 days ago, not October)', m && tD>=0.06 && Math.abs(tM-tD-0.5)<0.006, {tD,tM});
    // the Worker paused: no AI call, no Scout
    await ev(X.p,()=>{ document.querySelector('.tab[data-view="v-board"]').click(); localStorage.removeItem('mbev.jarvisRun'); window._jvRunMem=null; jvClose(true); window._runs=[]; localStorage.removeItem('mbev.ai.news'); wkPause(60*60e3,'test'); });
    await tick(X.p); await X.p.waitForTimeout(500); await X.p.clock.fastForward(16*M); await X.p.waitForTimeout(500);
    const pz=await pop(X.p);
    check('Worker paused: picks still pop from the board, with no AI call and no Scout', pz && X.S.ai.length===nNews && (await ev(X.p,()=>window._runs.length))===0, {pop:pz&&pz.head, ai:X.S.ai.length-nNews});
    // a notification while the tab is hidden
    await ev(X.p,()=>{ Object.defineProperty(document,'hidden',{configurable:true, get:()=>true}); jvClose(true); const R=jvRun(); R.seen={}; R.toned={}; jvRunSet(R); window._notes=[]; jvTick(); });
    const nt=await ev(X.p,()=>window._notes.slice());
    check('with notifications allowed and the tab hidden: a notification for the pick', nt.length===1 && /^🤖 Jarvis · Bet this$/.test(nt[0].t) && / · \$\d+\.\d\d$/.test(nt[0].body), nt);
    await ev(X.p,()=>{ Object.defineProperty(document,'hidden',{configurable:true, get:()=>false}); });
    check('no page errors (near)', !X.errs.length, X.errs);
    await X.ctx.close();
  });
  // ================= 5. mute, AI off, Easy, DEV_APP false, the same decisions =================
  await safe('off', async()=>{
    X=await open(b,1280,{jarvis:{sound:false}});
    await X.p.waitForTimeout(1500); await tick(X.p);
    const P=await pop(X.p); const bp=await ev(X.p,()=>window._beeps);
    check('Sound off: it pops with no tone', P && bp===0, {P:!!P, bp});
    await ev(X.p,()=>{ jvClose(true); localStorage.removeItem('mbev.jarvisRun'); window._jvRunMem=null; document.documentElement.setAttribute('data-viewas','easy'); jvTick(); });
    const e=await ev(X.p,()=>({cur:!!window._jvCur, el:!!(document.getElementById('jvPop')&&!document.getElementById('jvPop').hidden), active:jvActive()}));
    check('nothing pops in Easy', !e.cur && !e.el && !e.active, e);
    await ev(X.p,()=>{ document.documentElement.setAttribute('data-viewas','god'); });
    const same=await ev(X.p,()=>{ const snap=()=>lastRows.map(r=>r.apiKey+':'+(!!r.pass)+':'+(+r.stake||0).toFixed(2)+':'+r.idx).join(','); const a=snap(); localStorage.setItem('mbev.jarvis',JSON.stringify({on:false})); refresh(); const b=snap(); localStorage.setItem('mbev.jarvis','{}'); refresh(); return {same:a===b && snap()===a}; });
    check('stakes, decisions and order are the same with Jarvis on and off', same.same, same);
    check('no page errors (off)', !X.errs.length, X.errs);
    await X.ctx.close();
    X=await open(b,1280,{html:html.replace('<script>const DEV_APP=true;','<script>const DEV_APP=false;')});
    await X.p.waitForTimeout(1500); await ev(X.p,()=>{ try{ jvTick(); }catch(e){} });
    const d=await ev(X.p,()=>({cur:!!window._jvCur, el:!!(document.getElementById('jvPop')&&!document.getElementById('jvPop').hidden), active:jvActive()}));
    check('nothing pops in a customer build (DEV_APP false)', !d.cur && !d.el && !d.active, d);
    await X.ctx.close();
  });
  // ================= 6. layout 390 and 1280 =================
  for(const W of [390,1000,1280,1960]) await safe('layout '+W, async()=>{
    X=await open(b,W,{ai:true});
    await X.p.waitForTimeout(1500); await tick(X.p); await X.p.waitForTimeout(300);
    const L=await ev(X.p,()=>{ const el=document.getElementById('jvPop'); if(!el || el.hidden) return null; const r=el.getBoundingClientRect(); const kids=[...el.querySelectorAll('*')].filter(x=>x.getClientRects().length).map(x=>x.getBoundingClientRect());
      const big=parseFloat(getComputedStyle(el.querySelector('.jv-pick')).fontSize), btn=[...el.querySelectorAll('.jv-b button, .jv-b a')].map(x=>x.getBoundingClientRect().height);
      return {l:r.left, r:r.right, top:r.top, vw:innerWidth, sw:document.documentElement.scrollWidth, maxR:Math.max(...kids.map(k=>k.right)), minL:Math.min(...kids.map(k=>k.left)), big, btnMin:Math.min(...btn), overX:el.scrollWidth>el.clientWidth+1}; });
    check(W+' px: the pop-up sits at the top, inside the screen, big type (22 px pick), buttons 44 px tall, nothing runs off', L && L.top<=10 && L.l>=0 && L.r<=L.vw+1 && L.maxR<=L.r+1 && L.minL>=L.l-1 && L.sw<=L.vw+1 && L.big>=22 && L.btnMin>=44 && !L.overX, L);
    await click(X.p,'#jvPop .jv-bet');
    const L2=await ev(X.p,()=>{ const el=document.getElementById('jvPop'); return {sw:document.documentElement.scrollWidth, vw:innerWidth, overX:el.scrollWidth>el.clientWidth+1, ed:!!el.querySelector('.editor')}; });
    check(W+' px: with the bet form open in it, still no sideways scroll', L2.ed && L2.sw<=L2.vw+1 && !L2.overX, L2);
    await ev(X.p,()=>{ jvClose(true); document.querySelector('.tab[data-view="v-settings"]').click(); document.getElementById('jarvisPanel').open=true; jvPaint(true); });
    await X.p.waitForTimeout(200);
    const Q=await ev(X.p,()=>({sw:document.documentElement.scrollWidth, vw:innerWidth, right:Math.max(...[...document.querySelectorAll('#jarvisPanel, #jarvisPanel *')].filter(x=>x.getClientRects().length).map(x=>x.getBoundingClientRect().right))}));
    check(W+' px: the 🤖 Jarvis panel fits', Q.sw<=Q.vw+1 && Q.right<=Q.vw+1, Q);
    if(W===1280){ await click(X.p,'#jvNotif'); check('“Turn on phone/browser notifications” asks the browser once', (await ev(X.p,()=>window._askedPerm))===1, null); }
    check(W+' px: no page errors', !X.errs.length, X.errs);
    await X.ctx.close();
  });

  const {pass, fail}=res(); console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
