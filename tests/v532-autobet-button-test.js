// node tests/v532-autobet-button-test.js [index.html] — v5.32 "Auto bet $1" in the Jarvis pop-up (owner 2026-11-25: "do REAL MONEY first"): one tap and one confirm; the app sends ONE POST /autobet (the exact limit, the Novig market and outcome ids from a
// FRESH quote, the pick key, the stake) with the passphrase and the sync key; the words for placed, refused and killed; nothing without sync or without a confirm; never on a just-missed pick; the Bet log is never touched here. A fake Worker (no real API).
const L=require('./v527-jarvis-lib.js'); const {chromium,check,open,ev,safe,pop,tick}=L;
(async()=>{ const b=await chromium.launch(); const X=await open(b,1280); const posts=[]; let answer={status:200, body:{ok:true, placed:true, mode:'LIVE', orderId:'o1', price:'0.595', qty:168, cost:1, reservedAfter:1}};
  X.p.on('dialog',d=>{ X.dialogs=(X.dialogs||[]); X.dialogs.push(d.message()); return (X.answerOk===false)?d.dismiss():d.accept(); });
  await X.p.route(/api\.0xbeta\.dev\/live/,r=>{ const u=new URL(r.request().url()); let id='x'; try{ id=JSON.parse(u.searchParams.get('bets'))[0].id; }catch(e){}
    r.fulfill({contentType:'application/json',body:JSON.stringify({at:new Date().toISOString(),results:{[id]:{ok:true,price:0.54,ref:'11111111-1111-4111-8111-111111111111',outcome:'22222222-2222-4222-8222-222222222222',title:'CLE',at:new Date().toISOString()}}})}); });
  await X.p.route(/api\.0xbeta\.dev\/autobet/,r=>{ const q=r.request(); const cors={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'POST, GET, OPTIONS'};
    if(q.method()==='OPTIONS') return r.fulfill({status:204,headers:cors});
    posts.push({headers:q.headers(), body:JSON.parse(q.postData()||'{}')}); r.fulfill({status:answer.status, headers:cors, contentType:'application/json', body:JSON.stringify(answer.body)}); });
  const msg=()=>ev(X.p,()=>(document.querySelector('#jvPop .jv-msg')||{}).textContent||'');
  const click=async()=>{ await ev(X.p,()=>{ document.querySelector('#jvPop .jv-auto').click(); }); await X.p.waitForTimeout(500); };
  await safe('button', async()=>{
    await ev(X.p,()=>{ localStorage.removeItem('mbev.jarvisRun'); window._jvRunMem=null; jvClose(true); window._jvWasOpen=false; });
    await tick(X.p); const P=await pop(X.p);
    check('an approved Novig pick shows the button "Auto bet $1"', P && P.btns.includes('Auto bet $1'), P && P.btns);
    const near=await ev(X.p,()=>{ const n=lastRows.find(r=>jvNearOk(r)); jvShow(n,true); return [...document.querySelectorAll('#jvPop .jv-b button')].map(x=>x.textContent.trim()); });
    check('a just-missed pick never shows it', Array.isArray(near) && !near.includes('Auto bet $1'), near);
    await ev(X.p,()=>{ localStorage.removeItem('mbev.jarvisRun'); window._jvRunMem=null; jvClose(true); window._jvWasOpen=false; }); await tick(X.p);
    const logged0=await ev(X.p,()=>logged.length);
    // sync off: nothing is sent
    await ev(X.p,()=>{ window._syOn=SY.on; SY.on=false; }); X.dialogs=[]; await click();
    check('sync off: it says to turn sync on, asks nothing and sends nothing', /Turn on sync first/.test(await msg()) && posts.length===0 && X.dialogs.length===0, [await msg(), posts.length]);
    await ev(X.p,()=>{ SY.on=true; SY.key='sk-test-key'; SY.dev='Test'; });
    // confirm cancelled
    X.answerOk=false; X.dialogs=[]; await click(); check('the confirm box is cancelled: nothing is sent, and the box named the pick, the exact limit and "REAL"', posts.length===0 && X.dialogs.length===1 && /REAL order at Novig/.test(X.dialogs[0]) && /or better/.test(X.dialogs[0]), [X.dialogs, posts.length]);
    // OK
    X.answerOk=true; X.dialogs=[]; await click();
    const lim=await ev(X.p,()=>{ const r=jvCurRow(window._jvCur); return jvMax(r); });
    const p0=posts[0]; check('OK: exactly one POST /autobet with the fresh quote ids, the exact limit, the pick key, the stake and both locks (sync key header)', posts.length===1 && p0.body.marketId==='11111111-1111-4111-8111-111111111111' && p0.body.outcomeId==='22222222-2222-4222-8222-222222222222' && Math.abs(p0.body.limit-lim)<1e-12 && p0.body.book==='Novig' && p0.body.stake>0 && p0.body.startMs>0 && p0.body.key && p0.headers['x-sync-key']==='sk-test-key' && p0.headers['content-type']==='application/json', p0);
    check('placed: the words say the mode, the contracts, the price and about $1.00, and that nothing else is needed', /Order placed at Novig \(LIVE\): 1\.68 contracts at up to 59\.5% for about \$1\.00/.test(await msg()), await msg());
    answer={status:200, body:{ok:false, reason:'over_daily_budget'}}; await click(); check('refused: "Not placed: the limit for today is reached"', /Not placed: the limit for today is reached/.test(await msg()), await msg());
    answer={status:200, body:{ok:false, reason:'blocked', killed:true}}; await click(); check('blocked by Novig: says so and that the kill switch is now ON', /Novig blocked it/.test(await msg()) && /kill switch is now ON/.test(await msg()), await msg());
    answer={status:401, body:{error:'locked'}}; await click(); check('a 401 answer is shown, not hidden', /Not placed/.test(await msg()), await msg());
    const rec=await ev(X.p,()=>JSON.parse(localStorage.getItem('mbev.autobet')||'[]'));
    check('each tap is recorded on this device (mbev.autobet): 4 entries, the first placed', rec.length===4 && rec[0].ok===true && rec[1].ok===false, rec);
    check('the Bet log is never touched by the button', (await ev(X.p,()=>logged.length))===logged0, null);
  });
  check('no page errors', X.errs.length===0, X.errs.slice(0,3));
  await b.close(); const r=L.res(); console.log('\n'+r.pass+' passed, '+r.fail+' failed'); process.exit(r.fail?1:0); })();
