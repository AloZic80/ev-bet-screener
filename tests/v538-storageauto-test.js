// node tests/v538-storageauto-test.js — v5.38 (owner 2026-11-26: "i need the storage issue to be fixed on its own. i dont want to do anything"): at 75% full or more the app clears ONLY the caches it rebuilds, by itself, without asking.
// Below 75% nothing is touched. Bets, notes, settings, the watch record and the fills are never touched. It runs when the space readout renders. If the space is still over 80% (something that is not a cache), the warning names the biggest items. No page errors.
const L=require('./v527-jarvis-lib.js'); const {chromium,check,open,ev,safe}=L;
(async()=>{ const b=await chromium.launch(); const X=await open(b,1280);
  await safe('auto free', async()=>{
    const keep=await ev(X.p,()=>{ localStorage.setItem('mbev.theme','dark'); localStorage.setItem('mbev.notesAll','my notes'); localStorage.setItem('mbev.myFills','[{"id":"f1"}]'); localStorage.setItem('mbev.watchObs','w'.repeat(50000)); return {theme:localStorage.getItem('mbev.theme'), notes:localStorage.getItem('mbev.notesAll'), fills:localStorage.getItem('mbev.myFills'), w:localStorage.getItem('mbev.watchObs').length, log:localStorage.getItem('mbev.log')}; });
    const lo=await ev(X.p,()=>{ localStorage.setItem('mbev.px','p'.repeat(900000)); const r=storageAutoFree(); return {r, px:!!localStorage.getItem('mbev.px'), pct:storageUseInfo().pct}; });
    check('below 75% full nothing is cleared', lo.r===0 && lo.px===true && lo.pct<75, lo);
    const hi=await ev(X.p,()=>{ localStorage.setItem('mbev.px','p'.repeat(2200000)); localStorage.setItem('mbev.teamlogos','t'.repeat(2000000)); const pct0=storageUseInfo().pct; const r=storageAutoFree(); return {pct0, r, px:localStorage.getItem('mbev.px'), logos:localStorage.getItem('mbev.teamlogos'), pct1:storageUseInfo().pct, auto:window._storageAuto}; });
    check('at 75% or more the rebuildable caches (price history, team logos) are cleared by themselves', hi.pct0>=75 && hi.r>0 && hi.px===null && hi.logos===null && hi.pct1<75, hi);
    const after=await ev(X.p,()=>({theme:localStorage.getItem('mbev.theme'), notes:localStorage.getItem('mbev.notesAll'), fills:localStorage.getItem('mbev.myFills'), w:localStorage.getItem('mbev.watchObs').length, log:localStorage.getItem('mbev.log')}));
    check('...and bets, notes, settings, the watch record and the fills are exactly as they were', after.theme===keep.theme && after.notes===keep.notes && after.fills===keep.fills && after.w===keep.w && after.log===keep.log, [after.theme, after.notes, after.fills, after.w, after.log===keep.log]);
    const rd=await ev(X.p,()=>{ localStorage.setItem('mbev.px','p'.repeat(2200000)); localStorage.setItem('mbev.teamlogos','t'.repeat(2000000)); storageUseRender(); return {px:localStorage.getItem('mbev.px'), say:document.getElementById('storageUse').textContent}; });
    check('reading the space (Settings, Bet log, page open) does it too, and says so in plain words', rd.px===null && /Cleared the rebuildable caches by itself at/.test(rd.say), rd.say);
    const big=await ev(X.p,()=>{ localStorage.setItem('mbev.watchObs','w'.repeat(4300000)); storageUseRender(); const w=document.getElementById('storageWarn'); return {hidden:w.hidden, text:w.textContent, watch:localStorage.getItem('mbev.watchObs').length}; });
    check('when something that is not a cache fills the space, the warning names it, and that item is not touched', big.hidden===false && /Biggest: watchObs/.test(big.text) && big.watch===4300000, big.text.slice(0,260));
  });
  check('no page errors', X.errs.length===0, X.errs.slice(0,3));
  await b.close(); const r=L.res(); console.log('\n'+r.pass+' passed, '+r.fail+' failed'); process.exit(r.fail?1:0); })();
