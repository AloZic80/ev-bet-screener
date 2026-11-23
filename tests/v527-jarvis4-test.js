// node tests/v527-jarvis4-test.js [index.html] — v5.27 🤖 Jarvis, part 4 (review rounds 4 to 6: a steady page, the chip, the refused-tap words). The setup, the fake board and the fake Worker are in v527-jarvis-lib.js (no real API).
const { chromium, html, check, open, ev, safe, pop, tick, click, fresh, cardSave, NOW, DAY, KO, H, M, iso, ROWS, res } = require('./v527-jarvis-lib.js');
(async()=>{ const b=await chromium.launch(); let X;
  // ================= 9. round 4 (the review of 1b39290): each check fails on that commit =================
  for(const W of [390,1280]) for(const sy of [0,400,5000]) await safe('round 4: N5 steady '+W+' from '+sy, async()=>{
    X=await open(b,W,{ai:true, h:844}); await X.p.waitForTimeout(1500);
    const r=await ev(X.p,async(sy)=>{ const sl=ms=>new Promise(z=>setTimeout(z,ms)); jvClose(true); await sl(50); window.scrollTo(0,sy); await sl(80);
      const m=[...document.querySelectorAll('button, .tab, h2')].find(e=>{ if(e.closest('#jvPop') || e.closest('#jvChip')) return false; const st=getComputedStyle(e); if(e.closest('[style*="fixed"]')) return false; let x=e; while(x && x!==document.body){ const p=getComputedStyle(x).position; if(p==='fixed' || p==='sticky') return false; x=x.parentElement; } const q=e.getBoundingClientRect(); return q.height>0 && q.top>60 && q.bottom<innerHeight-60; });
      if(!m) return {none:true}; const T=[]; const at=l=>T.push([l, +(m.getBoundingClientRect().top).toFixed(1)]); at('start'); let pop0=null;
      localStorage.removeItem('mbev.ai.news'); const R=jvRun(); R.seen={}; R.snooze={}; R.skip={}; R.toned={}; R.asked={}; jvRunSet(R); window._jvWasOpen=true; jvTick(); await sl(30); at('open'); { const pp=document.getElementById('jvPop'), q=pp.getBoundingClientRect(); pop0={top:+q.top.toFixed(1), shown:!pp.hidden, y:scrollY}; } await sl(400); at('news line');
      const sm=document.querySelector('#jvPop details.jv-more>summary'); if(sm){ sm.click(); await sl(80); at('fold'); }
      document.querySelector('#jvPop .jv-later').click(); await sl(150); at('Not now'); document.querySelector('#jvPop .jv-skip').click(); await sl(150); at('Skip today');
      jvClose(true); await sl(150); at('close'); const t0=T[0][1]; return {mark:(m.textContent||'').trim().slice(0,24), T, max:Math.max(...T.map(x=>Math.abs(x[1]-t0))), pop0, yClose:scrollY}; }, sy); const innerH=844;
    if(sy===0){ check('N5 '+W+' px from the top of the page: the pop-up opens in view (its top on screen) and pushes the page down; closing just closes (round 5)', r && !r.none && r.pop0 && r.pop0.top>=0 && r.pop0.top<innerH && r.pop0.shown && r.yClose===0, r); }
    else check('N5 '+W+' px from scrollY '+sy+': no control on screen moves more than 2 px when the pop-up opens, gets its news line, folds, goes to the next pick, skips or closes (moved '+(r&&r.max!=null?r.max.toFixed(1):'?')+' px)', r && !r.none && r.max<=2, r);
    check('no page errors (N5 '+W+' '+sy+')', !X.errs.length, X.errs); await X.ctx.close(); });
  for(const W of [390,1000,1280,1960]) await safe('round 4: N6 chip '+W, async()=>{
    X=await open(b,W,{h:844}); await X.p.waitForTimeout(1500);
    const sw=await ev(X.p,async(W)=>{ const sl=ms=>new Promise(z=>setTimeout(z,ms)); jvClose(true); window.scrollTo(0,0); await sl(50); const hh=Math.ceil(document.querySelector('.head').getBoundingClientRect().bottom+scrollY); window.scrollTo(0,hh+20); await sl(50); const R=jvRun(); R.seen={}; R.toned={}; jvRunSet(R); window._jvWasOpen=true; jvTick(); await sl(150);
      const pb=document.getElementById('jvPop').getBoundingClientRect().bottom, maxY=document.documentElement.scrollHeight-innerHeight; let shown=0, steps=0, bad=[], firstY=null, txt='', h=0, top=0, gut=false;
      for(let y=scrollY; y<=maxY; y+=40){ window.scrollTo(0,y); await sl(40); steps++; const ch=document.getElementById('jvChip'); if(!ch || ch.hidden) continue; shown++; if(firstY==null) firstY=scrollY; const r=ch.getBoundingClientRect(); txt=ch.textContent; h=r.height; top=r.top; gut=ch.classList.contains('gutter');
        for(let x=r.left+2; x<r.right; x+=6) for(let yy=r.top+2; yy<r.bottom; yy+=5) document.elementsFromPoint(x,yy).forEach(e=>{ if(e===ch || ch.contains(e)) return; const i=e.closest('button, a[href], input, select, summary, [role="button"], .tab'); if(i && !bad.includes(i.id||i.className)) bad.push(i.id||i.className); }); }
      return {hh, popBottom:pb, steps, shown, firstY, txt, h, top, gut, bad}; }, W);
    check('N6 '+W+' px: scrolled past the header ('+sw.hh+' px), the pop-up opens above the screen; scrolling the whole page, the chip (“🤖 Jarvis: N picks ↑”, “🤖 N picks ↑” on a phone) is never over a button or link, at most 40 px tall at the top'+(W>=1960?', in the right gutter':''), sw.popBottom<=0 && sw.shown>0 && (W<700?/^🤖 \d+ picks? ↑$/:/^🤖 Jarvis: \d+ picks? ↑$/).test(sw.txt) && sw.h<=40 && sw.top>=0 && sw.top<=8 && sw.bad.length===0 && (W<1960 || sw.gut), sw);
    await ev(X.p,async(y)=>{ window.scrollTo(0,y); await new Promise(z=>setTimeout(z,80)); }, sw.firstY); await click(X.p,'#jvChip'); await X.p.waitForTimeout(250);
    const d=await ev(X.p,()=>{ const r=document.getElementById('jvPop').getBoundingClientRect(); return {top:r.top, bottom:r.bottom, chipHidden:document.getElementById('jvChip').hidden}; });
    check('N6 '+W+' px: tapping it brings the pop-up into view, and the chip goes away', d.top>=-1 && d.top<200 && d.chipHidden, d);
    const f=await ev(X.p,async()=>{ const sl=ms=>new Promise(z=>setTimeout(z,ms)); window.scrollTo(0,600); await sl(100); const a=!document.getElementById('jvChip').hidden;
      const r=lastRows.find(x=>scApproved(x)), w=document.createElement('div'); w.className='pcard'; document.querySelector('.wrap').appendChild(w); openBetEditor(w, r); window.dispatchEvent(new Event('scroll')); await sl(100); const b2=document.getElementById('jvChip').hidden; w.remove(); return {shownScrolled:a, hiddenWithForm:b2}; });
    check('N6 '+W+' px: hidden while a bet form is open', f.hiddenWithForm, f);
    check('no page errors (N6 '+W+')', !X.errs.length, X.errs); await X.ctx.close(); });
  await safe('round 4: S3 wording', async()=>{
    X=await open(b,1280,{}); await X.p.waitForTimeout(1500); await fresh(X.p);
    const r=await ev(X.p,()=>{ const k=window._jvCur.k; quoteFor=async()=>null; slipWindow=()=>({location:{}, close(){}, focus(){}}); lastRows=lastRows.filter(x=>pxKey(x)!==k); refresh(); document.querySelector('#jvPop .jv-open').click();
      return {moved:window._jvCur.k!==k, msg:document.querySelector('#jvPop .jv-msg').textContent}; });
    check('S3: a tap refused because its pick left the board shows the next pick with “The last pick changed; this is the next one.”', r.moved && r.msg==='The last pick changed; this is the next one.', r);
    await X.ctx.close(); });
  // ================= 10. round 6 (the review of 38f505c): each check fails on that commit =================
  for(const W of [390,1280]) await safe('round 6: D1/D2 '+W, async()=>{
    X=await open(b,W,{h:844, ai:true}); await X.p.waitForTimeout(1500);
    const d2=await ev(X.p,async()=>{ const sl=ms=>new Promise(z=>setTimeout(z,ms)); const out=[]; jvClose(true); window.scrollTo(0,0); await sl(50); const hh=Math.ceil(document.querySelector('.head').getBoundingClientRect().bottom+scrollY);
      for(const y of [40, hh-10]){ jvClose(true); await sl(50); window.scrollTo(0,y); await sl(60); const R=jvRun(); R.seen={}; R.toned={}; jvRunSet(R); window._jvWasOpen=true; jvTick(); await sl(120); const q=document.getElementById('jvPop').getBoundingClientRect(); out.push({y, y1:scrollY, top:Math.round(q.top), bottom:Math.round(q.bottom), chip:!document.getElementById('jvChip')||!document.getElementById('jvChip').hidden?!!document.getElementById('jvChip')&&!document.getElementById('jvChip').hidden:false}); }
      return {hh, out}; });
    check('D2 '+W+' px: scrolled less than the header’s height ('+d2.hh+' px), a new pick opens in view (no hold, no chip)', d2.out.every(o=>o.y1===o.y && o.bottom>0 && !o.chip), d2);
    await ev(X.p,async()=>{ jvClose(true); window.scrollTo(0,0); await new Promise(z=>setTimeout(z,50)); const R=jvRun(); R.seen={}; R.toned={}; jvRunSet(R); window._jvWasOpen=true; jvTick(); await new Promise(z=>setTimeout(z,400)); window.scrollTo(0,50); await new Promise(z=>setTimeout(z,80)); });
    const s0=X.p.locator('#jvPop details.jv-more>summary'); const bb=await s0.boundingBox(); const y0=await ev(X.p,()=>scrollY), o0=await ev(X.p,()=>document.querySelector('#jvPop details.jv-more').open);
    await X.p.mouse.click(bb.x+20, bb.y+bb.height/2); await X.p.waitForTimeout(250);
    const a=await ev(X.p,()=>{ const sm=document.querySelector('#jvPop details.jv-more>summary'); return {open:sm.parentElement.open, top:sm.getBoundingClientRect().top, y:scrollY}; });
    const r=await ev(X.p,async()=>{ const y=scrollY; const c=window._jvCur; c.sig=''; jvRecheck(); await new Promise(z=>setTimeout(z,100)); return {y0:y, y1:scrollY}; });
    check('D1 '+W+' px: with the pop-up partly in view, the News fold (opened or closed) and a redraw grow or shrink it downward: the page does not scroll and the fold stays under your finger', a.open!==o0 && a.y===y0 && Math.abs(a.top-bb.y)<=2 && r.y1===r.y0, {before:{top:bb.y, y:y0}, after:a, redraw:r});
    check('no page errors (D1/D2 '+W+')', !X.errs.length, X.errs); await X.ctx.close(); });
  const {pass, fail}=res(); console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
