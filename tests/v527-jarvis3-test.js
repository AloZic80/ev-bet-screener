// node tests/v527-jarvis3-test.js [index.html] — v5.27 🤖 Jarvis, part 3 (review rounds 2 and 3: already bet, shifted rows, stale numbers, the scout share, one alert, writes, Talk now on clock-change days, two tabs, the count, the right book, the ticket on a phone, the lease, never over the page). The setup, the fake board and the fake Worker are in v527-jarvis-lib.js (no real API).
const { chromium, html, check, open, ev, safe, pop, tick, click, fresh, cardSave, NOW, DAY, KO, H, M, iso, ROWS, res } = require('./v527-jarvis-lib.js');
(async()=>{ const b=await chromium.launch(); let X;
  // ================= 7. round 2 (the review of 69e5685): each check fails on that commit =================
  await safe('round 2: J1 already bet', async()=>{
    X=await open(b,1280,{}); await X.p.waitForTimeout(1500); await fresh(X.p);
    const P=await pop(X.p); const n=await cardSave(X.p, P.key); await X.p.waitForTimeout(200);
    const a=await ev(X.p,k=>({cur:(window._jvCur||{}).k, toast:(document.getElementById('kalToast')||{}).textContent||'', done:!!jvRun().done[k]}), P.key);
    check('J1: a pick placed from its card leaves the pop-up at once (after the board render, no tick) and says it is already in the Bet log', n===1 && a.cur!==P.key && /already in your Bet log/.test(a.toast) && a.done, {n, a});
    const Q=await pop(X.p); await click(X.p,'#jvPop .jv-bet');
    await ev(X.p,k=>{ const r=lastRows.find(x=>pxKey(x)===k && scApproved(x)); r.prior={id:'elsewhere'}; }, Q.key);   // placed elsewhere, before any render
    const n0=await ev(X.p,()=>logged.length); await click(X.p,'#jvPop .eb-save'); await X.p.waitForTimeout(150);
    const b1=await ev(X.p,k=>({n:logged.length, cur:(window._jvCur||{}).k, form:!!document.querySelector('#jvPop .editor')}), Q.key);
    check('J1: Save in the pop-up on a pick that became already bet is refused (nothing logged) and the pop-up moves on', b1.n===n0 && b1.cur!==Q.key, b1);
    check('no page errors (J1)', !X.errs.length, X.errs); await X.ctx.close(); });
  await safe('round 2: J2 idx shift', async()=>{
    X=await open(b,1280,{}); await X.p.waitForTimeout(1500); await fresh(X.p);
    await click(X.p,'#jvPop .jv-later'); const P=await pop(X.p);
    await ev(X.p,k=>{ const r=lastRows.find(x=>pxKey(x)===k); r.offeredProb=0.70; r.offeredRaw='-233'; lastRows=lastRows.filter(x=>x.name!=='Justin Jefferson'); refresh(); }, P.key); await X.p.waitForTimeout(150);
    const Q=await pop(X.p); await click(X.p,'#jvPop .jv-bet');
    const ed=await ev(X.p,()=>{ const e=document.querySelector('#jvPop .editor'); return e?e.querySelector('b').textContent:null; });
    check('J2: after a reload shifts the rows, a pick no longer approved leaves the pop-up, and I bet this opens the form of the pick shown (never another player by idx)', Q && Q.key!==P.key && ed && ed.indexOf(Q.pick.split(' Over')[0])===0, {was:P.pick, now:Q&&Q.pick, ed});
    check('no page errors (J2)', !X.errs.length, X.errs); await X.ctx.close(); });
  await safe('round 2: J3 stale numbers', async()=>{
    X=await open(b,1280,{}); await X.p.waitForTimeout(1500); await fresh(X.p);
    const P=await pop(X.p);
    const st=await ev(X.p,k=>{ const r=lastRows.find(x=>pxKey(x)===k); r.offeredProb=0.56; r.offeredRaw='-127'; refresh(); }, P.key); await X.p.waitForTimeout(150);
    const Q=await pop(X.p); const cur=await ev(X.p,k=>{ const r=lastRows.find(x=>pxKey(x)===k && scApproved(x)); return '$'+(+r.stake).toFixed(2); }, P.key);
    check('J3: a new price redraws the pop-up after the render with the row’s current stake (no tick)', Q && Q.key===P.key && Q.kv.Stake===cur && Q.kv.Stake!==P.kv.Stake, {before:P.kv.Stake, now:Q&&Q.kv.Stake, row:cur});
    await click(X.p,'#jvPop .jv-bet');
    await ev(X.p,k=>{ const c=JSON.parse(localStorage.getItem('mbev.cfg')); c.bank='2000'; localStorage.setItem('mbev.cfg',JSON.stringify(c)); loadCfg(); refresh(); }, P.key); await X.p.waitForTimeout(150);
    const z=await ev(X.p,k=>({form:!!document.querySelector('#jvPop .editor'), stake:(document.querySelector('#jvPop .jv-k:nth-child(2) b')||{}).textContent, row:'$'+(+lastRows.find(x=>pxKey(x)===k && scApproved(x)).stake).toFixed(2), msg:(document.querySelector('#jvPop .jv-msg')||{}).textContent}), P.key);
    check('J3: with the form open, new numbers close the form and redraw; the next form opens at the row’s current stake', !z.form && z.stake===z.row && /numbers changed/.test(z.msg), z);
    await click(X.p,'#jvPop .jv-bet'); const es=await ev(X.p,k=>({ed:(document.querySelector('#jvPop .eb-stake')||{}).value, row:(+lastRows.find(x=>pxKey(x)===k && scApproved(x)).stake).toFixed(2)}), P.key);
    check('J3: …and it does', es.ed===es.row, es);
    check('no page errors (J3)', !X.errs.length, X.errs); await X.ctx.close(); });
  await safe('round 2: J4 scout share', async()=>{
    X=await open(b,1280,{}); await X.p.waitForTimeout(1500);
    const r=await ev(X.p,async()=>{ const runs=[]; scRunRow=async(row)=>{ runs.push(row.src+':'+row.cap); if(row.src==='bp_props'){ const R=scRunGet(); R.used+=Math.min(2,row.cap); scRunSet(R); } return 'ok'; };
      localStorage.removeItem('mbev.schedRun'); for(let i=0;i<3;i++){ const R=jvRun(); R.scoutAt=0; jvRunSet(R); await jvScout(); }
      document.querySelector('.tab[data-view="v-settings"]').click(); document.getElementById('jarvisPanel').open=true; jvPaint(true); const txt=document.getElementById('jvScouts').textContent;
      const G=JSON.parse(localStorage.getItem('mbev.sched')||'{}'); G.rows=[{id:'z',sp:'NHL',src:'bp_props',pages:2,t:'17:00',days:'all',cap:2}]; localStorage.setItem('mbev.sched',JSON.stringify(G));
      const R=jvRun(); R.scCalls=0; R.scoutAt=0; jvRunSet(R); runs.push('|'); await jvScout(); return {runs, txt}; });
    check('J4: Jarvis’s own BettingPros scouts stay inside 3 calls a day (one scout of 2, then the Sentinels), and the panel says “Jarvis scouts today: 2 of 3”', r.runs.slice(0,3).join()==='bp_props:3,sent:0,sent:0' && /^Jarvis scouts today: 2 of 3/.test(r.txt), r);
    check('J4: with a ⏰ set time still to come today, Jarvis sends only the Sentinels', r.runs[r.runs.length-1]==='sent:0', r.runs);
    check('no page errors (J4)', !X.errs.length, X.errs); await X.ctx.close(); });
  await safe('round 2: J5 one alert, one news call', async()=>{
    X=await open(b,1280,{ai:true, notif:'granted'}); await X.p.waitForTimeout(2500);
    const r=await ev(X.p,async()=>{ Object.defineProperty(document,'hidden',{configurable:true, get:()=>true}); const a=lastRows.find(x=>x.apiKey==='a'); window._notes=[]; window._beeps=0;
      scAlert([a], {on:true, news:false}); const inside={notes:window._notes.length, beeps:window._beeps, banner:!!document.querySelector('#scAlert.on')};
      const R=jvRun(); R.quiet=Date.now()+3600e3; jvRunSet(R); scAlert([a], {on:true, news:false}); const outside={notes:window._notes.length, beeps:window._beeps};
      R.quiet=0; jvRunSet(R); Object.defineProperty(document,'hidden',{configurable:true, get:()=>false}); return {inside, outside}; });
    check('J5: inside a Jarvis window the 🔔 alert stays quiet for the picks Jarvis pops (no sound, notification or banner); outside it alerts as before', r.inside.notes===0 && r.inside.beeps===0 && !r.inside.banner && r.outside.notes===1 && r.outside.beeps===1, r);
    const n0=X.S.ai.length;
    await ev(X.p,async()=>{ localStorage.removeItem('mbev.ai.news'); const R=jvRun(); R.asked={}; jvRunSet(R); const c=lastRows.find(x=>x.apiKey==='b'); await Promise.all([scNewsAll([c],[{k:'zz'}]), jvNews(c)]); });
    const calls=X.S.ai.slice(n0).map(x=>x.input&&x.input.player);
    check('J5: the 🔔 news check and Jarvis share one AI news call for the same pick', calls.length===1, calls);
    check('no page errors (J5)', !X.errs.length, X.errs); await X.ctx.close(); });
  await safe('round 2: J6 writes', async()=>{
    X=await open(b,1280,{init:`(()=>{ const o=Storage.prototype.setItem; window._w=0; Storage.prototype.setItem=function(k,v){ if(k==='mbev.jarvisRun') window._w++; return o.call(this,k,v); }; })();`}); await X.p.waitForTimeout(1500);
    const w=await ev(X.p,()=>{ jvTick(); jvTick(); const a=window._w; for(let i=0;i<6;i++) jvTick(); return {a, b:window._w}; });
    check('J6: mbev.jarvisRun is written only when something changed (six quiet ticks: no write)', w.b===w.a, w);
    await X.ctx.close(); });
  await safe('round 2: J7 Talk now on a clock-change day', async()=>{
    X=await open(b,1280,{at:Date.parse('2026-11-01T05:30:00Z') /* Sun Nov 1, 12:30 AM CDT; clocks fall back at 2 AM */}); await X.p.waitForTimeout(1500);
    const t=await ev(X.p,()=>{ document.querySelector('.tab[data-view="v-settings"]').click(); document.getElementById('jarvisPanel').open=true; jvPaint(true); document.getElementById('jvTalk').click(); return new Date(jvRun().talk).toLocaleString('en-US',{timeZone:'America/Chicago'}); });
    check('J7: Talk now ends at the next Central midnight, also on the day the clocks change', t==='11/2/2026, 12:00:00 AM', t);
    await X.ctx.close(); });
  await safe('round 2: J8 two tabs', async()=>{
    X=await open(b,1280,{ctxRoute:true}); await X.p.waitForTimeout(3000);
    const [B]=await Promise.all([X.ctx.waitForEvent('page'), X.p.evaluate(()=>{ window.open('http://app.test/'); })]); await B.waitForTimeout(3500);
    await B.evaluate(()=>{ scRunRow=async()=>'ok'; perfBeep=()=>{}; jvTick(); }); await X.p.evaluate(()=>jvTick()); await B.waitForTimeout(200);
    const a=await pop(X.p), bb=await pop(B);
    check('J8: two tabs open: only one shows the pop-up', (!!a)!==(!!bb), {A:a&&a.pick, B:bb&&bb.pick});
    await X.ctx.close(); });
  await safe('round 2: J9 count and phone', async()=>{
    X=await open(b,390,{ai:true, h:844}); await X.p.waitForTimeout(1500); await fresh(X.p);
    const P=await pop(X.p);
    const m=await ev(X.p,()=>{ const R=jvRun(); const q=window._jvQ[0]; R.skip[q.k]=1; jvRunSet(R); const c=window._jvCur; c.sig=''; jvRecheck(); return (document.querySelector('#jvPop .jv-n')||{}).textContent||''; });
    const nb=parseInt(P.more,10), na=parseInt(m,10);
    check('J9: “N more after this” counts only picks that will show (one queued pick skipped: one fewer)', nb>=2 && na===nb-1, {before:P.more, after:m});
    const d=await ev(X.p,()=>{ const x=document.querySelector('#jvPop details.jv-more'); return x?{open:x.open, ai:!!x.querySelector('.jv-ai')}:null; });
    check('J9: at 390 px the ticket and the AI line are folded under a toggle', d && !d.open && d.ai, d);
    await X.ctx.close();
    X=await open(b,1280,{h:800, ai:true}); await X.p.waitForTimeout(1500); await fresh(X.p);
    for(let i=0;i<5;i++){ const has=await ev(X.p,()=>{ const k=(window._jvCur||{}).k; return !!k && [...document.querySelectorAll('#placeCards .pcard')].some(x=>x.dataset.pck===k); }); if(has) break; await click(X.p,'#jvPop .jv-later'); }
    const d2=await ev(X.p,()=>{ const x=document.querySelector('#jvPop details.jv-more'); return x?x.open:null; });
    await click(X.p,'#jvPop .jv-why'); await X.p.waitForTimeout(400);
    const w=await ev(X.p,()=>{ const k=window._jvCur.k, c=[...document.querySelectorAll('#placeCards .pcard')].find(x=>x.dataset.pck===k), p=document.getElementById('jvPop').getBoundingClientRect(); if(!c) return null; const r=c.getBoundingClientRect(); return {top:r.top, popBottom:p.bottom, atEnd:Math.ceil(scrollY+innerHeight)>=document.documentElement.scrollHeight-2, why:c.querySelector('details.sc-why').open}; });
    check('J9: open on a computer; Why? puts the card below the pop-up with Why this play? open', d2===true && w && w.why && (w.top>=w.popBottom-1 || w.atEnd), {d2, w});
    check('no page errors (J9)', !X.errs.length, X.errs); await X.ctx.close(); });

  // ================= 8. round 3 (the review of af32355): each check fails on that commit =================
  await safe('round 3: N1 the right book', async()=>{
    X=await open(b,1280,{}); await X.p.waitForTimeout(1500); await fresh(X.p);
    await click(X.p,'#jvPop .jv-later');
    const r=await ev(X.p,async()=>{ const shown=document.querySelector('#jvPop .jv-pick').textContent; window._rab=[]; quoteFor=async(x,bk)=>{ if(window._rec) window._rab.push(x.name+' @ '+bk); return null; };   /* the book-open handler asks the book for the row it opens */
      const w={location:{}, close(){}, focus(){}, document:{write(){},close(){}}}; slipWindow=()=>w;
      lastRows=lastRows.filter(x=>x.name!=='Justin Jefferson'); refresh(); window._rec=1; document.querySelector('#jvPop .jv-open').click();   // the rows shift; the tap comes before the pop-up redraws
      await new Promise(z=>setTimeout(z,200)); const now=document.querySelector('#jvPop .jv-pick').textContent; document.querySelector('#jvPop .jv-open').click(); await new Promise(z=>setTimeout(z,200));
      return {shown, now, rab:window._rab}; });
    const nm=x=>x.split(' Over')[0];
    check('N1: after the rows shift, Open the book opens the slip of the pick the pop-up shows (never another player’s by an old idx; a tap before the redraw is held and the pop-up redrawn)', r.rab.length>=1 && r.rab.every(x=>x.indexOf(nm(r.now))===0), r);
    check('no page errors (N1)', !X.errs.length, X.errs); await X.ctx.close(); });
  await safe('round 3: N2 ticket on a phone', async()=>{
    X=await open(b,390,{ai:true, h:844}); await X.p.waitForTimeout(1500); await fresh(X.p);
    for(let i=0;i<4;i++){ const s0=await pop(X.p); if(s0 && /Horvat/.test(s0.pick)) break; await click(X.p,'#jvPop .jv-later'); }
    const t=await ev(X.p,()=>{ const k=document.querySelector('#jvPop .sc-tkt'), d=document.querySelector('#jvPop details.jv-more'), el=document.getElementById('jvPop');
      return {pick:document.querySelector('#jvPop .jv-pick').textContent, tkt:!!k && k.getClientRects().length>0 && !k.closest('details:not([open])'), dOpen:d&&d.open, mark:d?getComputedStyle(d.querySelector('.jv-mk'),'::before').content:null, sw:document.documentElement.scrollWidth, vw:innerWidth, over:el.scrollWidth>el.clientWidth+1}; });
    check('N2: at 390 px the Kalshi “Type this” ticket is in view; only the news and price-move lines fold, with a ▸ marker; the pop-up fits', /Horvat/.test(t.pick) && t.tkt && t.dOpen===false && /▸/.test(t.mark||'') && t.sw<=t.vw+1 && !t.over, t);
    const k2=await ev(X.p,()=>{ const d=document.querySelector('#jvPop details.jv-more'); d.open=true; d.dispatchEvent(new Event('toggle')); const c=window._jvCur; c.sig=''; jvRecheck(); const d2=document.querySelector('#jvPop details.jv-more'); return {open:d2&&d2.open, mark:d2?getComputedStyle(d2.querySelector('.jv-mk'),'::before').content:null}; });
    check('N2: opened by you, it stays open (▾) when the pop-up redraws', k2.open===true && /▾/.test(k2.mark||''), k2);
    await X.ctx.close(); });
  const W8=`(()=>{ const o=Storage.prototype.setItem; window._w={}; Storage.prototype.setItem=function(k,v){ window._w[k]=(window._w[k]||0)+1; return o.call(this,k,v); }; })();`;
  await safe('round 3: N3 quiet lease', async()=>{
    for(const [at,lbl,max] of [['2026-11-10T16:00:00Z','outside a window (10 AM)',0],['2026-11-10T18:05:00Z','inside a window, one tab',12]]){
      X=await open(b,1280,{at:Date.parse(at), init:W8}); await X.p.waitForTimeout(1500);
      const w0=await ev(X.p,()=>window._w['mbev.jarvisLease']||0); await X.p.clock.runFor(10*M); await X.p.waitForTimeout(200); const w1=await ev(X.p,()=>window._w['mbev.jarvisLease']||0);
      check('N3: mbev.jarvisLease writes in 10 minutes '+lbl+': '+(w1-w0)+' (at most '+max+')', w1-w0<=max, {w0,w1}); await X.ctx.close(); }
    X=await open(b,1280,{}); await X.p.waitForTimeout(1500); await fresh(X.p);
    const o=await ev(X.p,()=>{ const want=lastRows.filter(scApproved).sort((a,b)=>mathKey(b)-mathKey(a)).map(r=>pxKey(r)); const c=window._jvCur; const R=jvRun(); delete R.seen[c.k]; jvRunSet(R); window._jvQ.push({k:c.k, near:false}); jvClose(false); window._beeps=0; jvPump();   // handed back by another tab, queued last
      return {first:window._jvCur.k===want[0], beeps:window._beeps}; });
    check('N3: a pick handed back by another tab pops in La Contadora’s order, with no second tone', o.first && o.beeps===0, o);
    await X.ctx.close(); });
  await safe('round 3: N4 never over the page', async()=>{
    for(const W of [390,1000,1280,1960]){
      X=await open(b,W,{}); await X.p.waitForTimeout(1500); await fresh(X.p); await X.p.waitForTimeout(100);
      const c=await ev(X.p,()=>{ const ids=['#themer','#layoutBtn','#sbFoldBtn','#ssFoldBtn','.tabs .tab[data-view="v-board"]','.tabs .tab[data-view="v-settings"]']; const out={};
        ids.forEach(s=>{ const e=document.querySelector(s); if(!e || !e.getClientRects().length) return; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); const h=document.elementFromPoint(r.left+r.width/2, r.top+r.height/2); out[s]=!!h && !h.closest('#jvPop'); });
        return {shown:!document.getElementById('jvPop').hidden, pos:getComputedStyle(document.getElementById('jvPop')).position, out}; });
      check('N4 '+W+' px: the pop-up sits in the page, and the header buttons and tabs are not covered by it', c.shown && c.pos!=='fixed' && Object.values(c.out).length>=3 && Object.values(c.out).every(Boolean), c);
      check('no page errors (N4 '+W+')', !X.errs.length, X.errs); await X.ctx.close(); }
    X=await open(b,1280,{}); await X.p.waitForTimeout(1500);
    const t=await ev(X.p,()=>{ localStorage.removeItem('mbev.jarvis'); jvClose(true); localStorage.removeItem('mbev.jarvisRun'); window._jvRunMem=null; window._jvRunLast=null; window._jvWasOpen=false; jvTick(); const off={active:jvActive(), pop:!!window._jvCur, open:jvOpen(), wd:navigator.webdriver};
      localStorage.setItem('mbev.jarvis','{}'); jvTick(); return {off, on:{active:jvActive(), pop:!!window._jvCur}}; });
    check('N4: a test browser (navigator.webdriver) that never saved mbev.jarvis gets no Jarvis even inside a window; once mbev.jarvis is saved, it pops', t.off.wd && t.off.open && !t.off.active && !t.off.pop && t.on.active && t.on.pop, t);
    await X.ctx.close(); });

  const {pass, fail}=res(); console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
