// node tests/v531-prefill-test.js — v5.31 prefill (owner 2026-11-25: BUILD A to C, agreed with El Consultor): Open the book asks for a FRESH quote every press (never the saved one),
// refuses a prefilled slip when the price now is above the unrounded OK up to, puts the fresh quote and the exact limit in the pop-up's data-prefill (description only: no URL, no token),
// and clears data-prefill when the pop-up closes, when the bet changes, and when the check fails. No page errors. A fake Worker (no real API).
const L=require('./v527-jarvis-lib.js'); const {chromium,check,open,ev,safe,pop,tick,NOW}=L;
(async()=>{ const b=await chromium.launch(); let X;
  X=await open(b,1280);
  const quote={price:0.54, mode:'ok'}; let liveCalls=0;
  await X.p.route(/api\.0xbeta\.dev\/live/,r=>{ liveCalls++; if(quote.mode==='fail') return r.abort(); const u=new URL(r.request().url()); let id='x'; try{ id=JSON.parse(u.searchParams.get('bets'))[0].id; }catch(e){}
    r.fulfill({contentType:'application/json',body:JSON.stringify({at:new Date().toISOString(),results:{[id]:{ok:true,price:quote.price,outcome:'OUT-123',title:'Justin Jefferson Over 75.5 Receiving Yards',at:new Date().toISOString()}}})}); });
  await safe('prefill', async()=>{
    await ev(X.p,()=>{ localStorage.removeItem('mbev.jarvisRun'); window._jvRunMem=null; jvClose(true); window._jvWasOpen=false; });
    await tick(X.p);
    const P=await pop(X.p); check('setup: the pop-up shows an approved Novig pick', P && /Bet this/.test(P.head) && P.kv.Book==='Novig', P);
    const D0=await ev(X.p,()=>{ try{ return JSON.parse(document.getElementById('jvPop').getAttribute('data-prefill')); }catch(e){ return null; } });
    check('data-prefill: book, pick, game, stake, the exact limit (a number), a label, and no URL, token or key', D0 && typeof D0.limitExact==='number' && D0.limitExact>0 && D0.limitExact<1 && D0.book==='Novig' && D0.stake>0 && /not evidence of a bet/.test(D0.status) && !/https?:|token|api[_-]?key|passphrase|cookie|session/i.test(JSON.stringify(D0).replace(/"rowKey":"[^"]*"/,'')), D0);
    const lim=D0&&D0.limitExact;
    // within the limit: a fresh quote, stamped
    quote.price=Math.max(0.01, lim-0.02); const c0=liveCalls;
    await ev(X.p,()=>{ document.querySelector('#jvPop .jv-open').click(); }); await X.p.waitForTimeout(500);
    const D1=await ev(X.p,()=>{ try{ return JSON.parse(document.getElementById('jvPop').getAttribute('data-prefill')); }catch(e){ return null; } });
    check('Open the book within the limit: a live call was made and the fresh quote is stamped (price, title, outcome id, within limit)', liveCalls>c0 && D1 && D1.freshQuote && D1.freshQuote.withinLimit===true && D1.freshQuote.outcome==='OUT-123' && Math.abs(D1.freshQuote.priceProb-quote.price)<1e-9, {liveCalls:liveCalls-c0, fq:D1&&D1.freshQuote});
    // a second press within 60 s must ask again (never the saved quote)
    const c1=liveCalls; await ev(X.p,()=>{ document.querySelector('#jvPop .jv-open').click(); }); await X.p.waitForTimeout(500);
    check('a second press within a minute asks the Worker again (a fresh quote, not the saved one)', liveCalls>c1, {calls:liveCalls-c1});
    // over the limit: no prefilled slip, data cleared, the reason shown
    quote.price=Math.min(0.99, lim+0.03);
    await ev(X.p,()=>{ document.querySelector('#jvPop .jv-open').click(); }); await X.p.waitForTimeout(500);
    const T2=await ev(X.p,()=>({note:(document.querySelector('#jvPop .jv-msg')||{}).textContent, has:document.getElementById('jvPop').hasAttribute('data-prefill')}));
    check('price above OK up to: "slip not opened" is shown and data-prefill is cleared', /slip not opened/.test(T2.note||'') && T2.has===false, T2);
  });
  await safe('clear on close and on failure', async()=>{
    await ev(X.p,()=>{ localStorage.removeItem('mbev.jarvisRun'); window._jvRunMem=null; jvClose(true); window._jvWasOpen=false; });
    await tick(X.p);
    let has=await ev(X.p,()=>document.getElementById('jvPop').hasAttribute('data-prefill')); check('a new pop-up carries data-prefill', has===true, has);
    await ev(X.p,()=>{ jvClose(true); }); await X.p.waitForTimeout(150);
    has=await ev(X.p,()=>document.getElementById('jvPop').hasAttribute('data-prefill')); check('closing the pop-up clears data-prefill', has===false, has);
    await ev(X.p,()=>{ localStorage.removeItem('mbev.jarvisRun'); window._jvRunMem=null; window._jvWasOpen=false; });
    await tick(X.p); quote.mode='fail';
    await ev(X.p,()=>{ document.querySelector('#jvPop .jv-open').click(); }); await X.p.waitForTimeout(600);
    has=await ev(X.p,()=>document.getElementById('jvPop').hasAttribute('data-prefill')); check('a failed quote request clears data-prefill (fails closed)', has===false, has);
    quote.mode='ok';
  });
  const logged=await ev(X.p,()=>JSON.parse(localStorage.getItem('mbev.log')||'[]').length);
  check('prefill never writes a Bet-log entry', logged===0, logged);
  check('no page errors', X.errs.length===0, X.errs.slice(0,3));
  await b.close(); const r=L.res(); console.log('\n'+r.pass+' passed, '+r.fail+' failed'); process.exit(r.fail?1:0); })();
