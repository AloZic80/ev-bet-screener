// node tests/v534-storage-test.js [index.html] — v5.34 (owner 2026-11-25: "THIS BETS SHOULD BE SAVING OUT OF HERE IN A CLOUD"): Settings shows what uses this browser's space (biggest first, the rebuildable caches marked),
// and a button that clears ONLY the caches the app rebuilds (two confirms; the first Cancel does nothing). Bets, notes and settings are never touched. No page errors.
const L=require('./v527-jarvis-lib.js'); const {chromium,check,open,ev,safe}=L;
(async()=>{ const b=await chromium.launch(); const X=await open(b,1280); X.dialogs=[]; X.answers=[true,true];
  X.p.on('dialog',d=>{ X.dialogs.push(d.message()); const a=X.answers.length?X.answers.shift():true; return a?d.accept():d.dismiss(); });
  await safe('breakdown and free space', async()=>{
    await ev(X.p,()=>{ localStorage.setItem('mbev.px','p'.repeat(90000)); localStorage.setItem('mbev.teamlogos','t'.repeat(30000)); localStorage.setItem('mbev.watchObs','w'.repeat(60000)); localStorage.setItem('mbev.notesAll','1'); localStorage.setItem('mbev.theme','dark'); document.querySelector('.tab[data-view="v-settings"]').click(); });
    await X.p.waitForTimeout(400);
    const t=await ev(X.p,()=>document.getElementById('storageTop').textContent); const html=await ev(X.p,()=>document.getElementById('storageTop').innerHTML);
    check('the readout lists the biggest keys first (px, then watchObs, then teamlogos)', t.indexOf('px')>=0 && t.indexOf('px')<t.indexOf('watchObs') && t.indexOf('watchObs')<t.indexOf('teamlogos'), t.slice(0,300));
    check('rebuildable caches are marked as cache, a non-cache key (watchObs) is not', /px · [^<]*<b>cache<\/b>/.test(html) && !/watchObs · [^<]*<b>cache<\/b>/.test(html), html.slice(0,500));
    const bet0=await ev(X.p,()=>[localStorage.getItem('mbev.log'), localStorage.getItem('mbev.watchObs').length, localStorage.getItem('mbev.theme'), localStorage.getItem('mbev.notesAll')]);
    X.dialogs=[]; X.answers=[false]; await ev(X.p,()=>document.getElementById('storageFree').click()); await X.p.waitForTimeout(200);
    check('Cancel at the first question does nothing (one question asked, caches still there)', X.dialogs.length===1 && (await ev(X.p,()=>!!localStorage.getItem('mbev.px') && !!localStorage.getItem('mbev.teamlogos')))===true, X.dialogs);
    X.dialogs=[]; X.answers=[true,false]; await ev(X.p,()=>document.getElementById('storageFree').click()); await X.p.waitForTimeout(200);
    check('Cancel at the second question does nothing too', X.dialogs.length===2 && (await ev(X.p,()=>!!localStorage.getItem('mbev.px')))===true, X.dialogs.length);
    X.dialogs=[]; X.answers=[true,true]; await ev(X.p,()=>document.getElementById('storageFree').click()); await X.p.waitForTimeout(300);
    const after=await ev(X.p,()=>({px:localStorage.getItem('mbev.px'), logos:localStorage.getItem('mbev.teamlogos'), log:localStorage.getItem('mbev.log'), w:(localStorage.getItem('mbev.watchObs')||'').length, theme:localStorage.getItem('mbev.theme'), notes:localStorage.getItem('mbev.notesAll'), say:document.getElementById('storageUse').textContent}));
    check('two Yes answers clear the rebuildable caches (px, teamlogos)', after.px===null && after.logos===null, after);
    check('...and leave the bet log, the watch record, notes and settings exactly as they were', after.log===bet0[0] && after.w===bet0[1] && after.theme===bet0[2] && after.notes===bet0[3], [after.log===bet0[0], after.w, after.theme, after.notes]);
    check('...and say how much was freed', /Freed about \d+ KB/.test(after.say), after.say);
  });
  check('no page errors', X.errs.length===0, X.errs.slice(0,3));
  await b.close(); const r=L.res(); console.log('\n'+r.pass+' passed, '+r.fail+' failed'); process.exit(r.fail?1:0); })();
