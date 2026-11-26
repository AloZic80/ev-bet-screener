// node tests/v533-autopilot-test.js [index.html] — v5.33 (owner 2026-11-25: "make it AUTOMATIC"; "after each day, it needs to ask me... Proceed?"): the Autopilot card in Settings (status, Proceed for today, Stop, Resume, the automatic-sending switch),
// the Proceed question on the Auto bet button when the Worker says it is not armed today, and AUTOMATIC sending: one approved Novig pick per look, the top one first, never the same pick twice, nothing when the switch is off, when the Worker is not armed,
// stopped, out of budget, when sync is off, for a Kalshi pick or a game about to start. A fake Worker (no real API). The Bet log is never touched. No page errors.
const L=require('./v527-jarvis-lib.js'); const {chromium,check,open,ev,safe,pop,tick}=L;
(async()=>{ const b=await chromium.launch(); const X=await open(b,1280); const posts=[]; X.dialogs=[]; X.answerOk=true;
  let status={ok:true, mode:'LIVE', day:'2026-11-10', budget:10, reserved:1, left:9, killed:false, requireArm:true, armed:true, orders:[{t:Date.now()-60000, name:'CLE to win', result:'placed', price:'0.595', qty:168}]};
  let orderAnswer=()=>({ok:true, placed:true, mode:'LIVE', orderId:'o', price:'0.595', qty:168, cost:1});
  X.p.on('dialog',d=>{ X.dialogs.push(d.message()); return X.answerOk?d.accept():d.dismiss(); });
  await X.p.route(/api\.0xbeta\.dev\/live/,r=>{ const u=new URL(r.request().url()); let id='x'; try{ id=JSON.parse(u.searchParams.get('bets'))[0].id; }catch(e){}
    r.fulfill({contentType:'application/json',body:JSON.stringify({at:new Date().toISOString(),results:{[id]:{ok:true,price:0.54,ref:'11111111-1111-4111-8111-111111111111',outcome:'22222222-2222-4222-8222-222222222222',title:'CLE',at:new Date().toISOString()}}})}); });
  await X.p.route(/api\.0xbeta\.dev\/autobet/,r=>{ const q=r.request(), path=new URL(q.url()).pathname; const cors={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'POST, GET, OPTIONS'};
    if(q.method()==='OPTIONS') return r.fulfill({status:204,headers:cors});
    const body=JSON.parse(q.postData()||'{}'); posts.push({path, method:q.method(), body, headers:q.headers()});
    let out; if(path==='/autobet/status') out=status; else if(path==='/autobet/arm'){ status={...status, armed:body.on===true}; out={ok:true, armed:body.on===true}; } else if(path==='/autobet/kill'){ status={...status, killed:body.on===true}; out={ok:true, kill:{on:body.on===true}}; } else out=orderAnswer();
    r.fulfill({status:200, headers:cors, contentType:'application/json', body:JSON.stringify(out)}); });
  const sync=()=>ev(X.p,()=>{ SY.on=true; SY.key='sk-test'; SY.dev='Test'; });
  const reset=async()=>{ posts.length=0; X.dialogs=[]; X.answerOk=true; await ev(X.p,()=>{ localStorage.removeItem('mbev.autoSent'); localStorage.removeItem('mbev.autobet'); apStatus=null; window._apBusy=false; }); };
  const topKeys=()=>ev(X.p,()=>lastRows.filter(r=>scApproved(r) && LIVE_BOOK(r.book)==='novig').sort((a,b)=>mathKey(b)-mathKey(a)).map(r=>pxKey(r)));
  await safe('card', async()=>{
    await sync(); await ev(X.p,()=>{ document.querySelector('.tab[data-view="v-settings"]').click(); document.getElementById('apPanel').open=true; }); await ev(X.p,()=>apRefresh()); const t=await ev(X.p,()=>document.getElementById('apBody').textContent);
    check('the Autopilot card shows the mode (REAL money), armed for today, $1.00 used of $10.00, $9.00 left and the last order', /REAL money/.test(t) && /armed for today/.test(t) && /\$1\.00 used of \$10\.00/.test(t) && /\$9\.00 left/.test(t) && /CLE to win/.test(t) && /168 contracts at 59\.5%/.test(t), t);
    status={...status, armed:false}; await ev(X.p,()=>apRefresh()); check('not armed: the card says to press Proceed for today', /not armed: press Proceed/.test(await ev(X.p,()=>document.getElementById('apBody').textContent)), null);
    await reset(); X.answerOk=false; await ev(X.p,()=>document.getElementById('apProceed').click()); await X.p.waitForTimeout(300);
    check('Proceed for today: the confirm box is cancelled, nothing is sent', X.dialogs.length===1 && /Proceed for today/.test(X.dialogs[0]) && !posts.some((x)=>x.path==='/autobet/arm'), [X.dialogs, posts.map((x)=>x.path)]);
    X.answerOk=true; X.dialogs=[]; await ev(X.p,()=>document.getElementById('apProceed').click()); await X.p.waitForTimeout(500);
    check('Proceed for today: OK arms the Worker (POST /autobet/arm {on:true}), the card says armed, and the sync key is sent', posts.some((x)=>x.path==='/autobet/arm' && x.body.on===true && x.headers['x-sync-key']==='sk-test') && /armed for today/.test(await ev(X.p,()=>document.getElementById('apBody').textContent)), posts.map((x)=>x.path));
    await reset(); await ev(X.p,()=>document.getElementById('apStop').click()); await X.p.waitForTimeout(500);
    check('Stop: asks, then POST /autobet/kill {on:true}, and the card says STOPPED', posts.some((x)=>x.path==='/autobet/kill' && x.body.on===true) && /STOPPED/.test(await ev(X.p,()=>document.getElementById('apBody').textContent)), posts.map((x)=>x.path));
    await reset(); await ev(X.p,()=>document.getElementById('apResume').click()); await X.p.waitForTimeout(500);
    check('Resume: asks, then POST /autobet/kill {on:false}', posts.some((x)=>x.path==='/autobet/kill' && x.body.on===false), posts.map((x)=>x.path));
    await ev(X.p,()=>{ const c=document.getElementById('apAuto'); c.checked=true; c.dispatchEvent(new Event('change',{bubbles:true})); });
    check('the automatic-sending switch is saved on this device', (await ev(X.p,()=>localStorage.getItem('mbev.autoSend')))==='1', null);
    await ev(X.p,()=>{ const c=document.getElementById('apAuto'); c.checked=false; c.dispatchEvent(new Event('change',{bubbles:true})); }); check('...and turns off', (await ev(X.p,()=>localStorage.getItem('mbev.autoSend')))==='0', null);
  });
  await safe('proceed on the button', async()=>{
    await reset(); status={...status, killed:false, armed:false}; let armedNow=false; orderAnswer=()=>armedNow?{ok:true, placed:true, mode:'LIVE', price:'0.595', qty:168, cost:1}:{ok:false, reason:'not_armed_today'};
    await ev(X.p,()=>{ localStorage.removeItem('mbev.jarvisRun'); window._jvRunMem=null; jvClose(true); window._jvWasOpen=false; }); await tick(X.p);
    await X.p.unroute(/api\.0xbeta\.dev\/autobet\/arm/).catch(()=>{});
    const wrap=async()=>{ await ev(X.p,()=>{ document.querySelector('#jvPop .jv-auto').click(); }); await X.p.waitForTimeout(700); };
    X.dialogs=[]; X.answerOk=true; const armOrig=posts.length; armedNow=false; const p0=posts.length;
    // after the arm call the fake Worker order answer turns to success
    X.p.on('request',(rq)=>{ if(/\/autobet\/arm/.test(rq.url()) && rq.method()==='POST') armedNow=true; });
    await wrap(); const paths=posts.slice(p0).map((x)=>x.path);
    check('Auto bet while not armed: the Worker says not_armed_today, the app asks "Proceed for today?", arms, and sends the order again (order, arm, order)', paths.join()==='/autobet,/autobet/arm,/autobet' && X.dialogs.length===2 && /Proceed for today/.test(X.dialogs[1]), [paths, X.dialogs.map((d)=>d.slice(0,40))]);
    check('...and the pop-up says the order was placed', /Order placed at Novig/.test(await ev(X.p,()=>(document.querySelector('#jvPop .jv-msg')||{}).textContent||'')), null);
    armedNow=false; posts.length=0; X.dialogs=[]; let n=0; X.p.removeAllListeners('dialog'); X.p.on('dialog',(d)=>{ X.dialogs.push(d.message()); n++; return n===2?d.dismiss():d.accept(); }); await wrap();
    check('saying no to Proceed: only the first order request is sent, nothing is armed, and the pop-up says it is not armed', posts.map((x)=>x.path).join()==='/autobet' && /not armed for today/.test(await ev(X.p,()=>(document.querySelector('#jvPop .jv-msg')||{}).textContent||'')), [posts.map((x)=>x.path)]);
    X.p.removeAllListeners('dialog'); X.p.on('dialog',(d)=>{ X.dialogs.push(d.message()); return X.answerOk?d.accept():d.dismiss(); });
  });
  await safe('automatic', async()=>{
    await sync(); await ev(X.p,()=>{ localStorage.setItem('mbev.autoSend','1'); }); orderAnswer=()=>({ok:true, placed:true, mode:'LIVE', price:'0.595', qty:168, cost:1}); await reset();
    status={ok:true, mode:'LIVE', day:'2026-11-10', budget:10, reserved:0, left:10, killed:false, requireArm:true, armed:true, orders:[]};
    const keys=await topKeys(); check('setup: two approved Novig picks on the board (Kalshi and just-missed ones are not candidates)', keys.length===2, keys);
    const logged0=await ev(X.p,()=>logged.length);
    const t1=await ev(X.p,()=>autoTick()); const o1=posts.filter((x)=>x.path==='/autobet');
    check('look 1: exactly ONE order request, for the TOP pick (best by La Contadora order), with the fresh ids, the exact limit and both locks', t1.sent===keys[0] && o1.length===1 && o1[0].body.key===keys[0] && o1[0].body.marketId==='11111111-1111-4111-8111-111111111111' && o1[0].body.limit>0 && o1[0].body.limit<1 && o1[0].body.book==='Novig' && o1[0].headers['x-sync-key']==='sk-test', [t1, o1.length]);
    const t2=await ev(X.p,()=>autoTick()); const o2=posts.filter((x)=>x.path==='/autobet');
    check('look 2: the NEXT pick, a different one', t2.sent===keys[1] && o2.length===2 && o2[1].body.key===keys[1] && keys[0]!==keys[1], [t2, o2.length]);
    const t3=await ev(X.p,()=>autoTick()); check('look 3: nothing new, nothing sent (never the same pick twice)', t3.skip==='nothing new' && posts.filter((x)=>x.path==='/autobet').length===2, t3);
    check('the sent picks are remembered on this device for today (so a reload cannot resend)', (await ev(X.p,()=>Object.keys(autoSentGet().keys).length))===2, null);
    check('each automatic order is recorded (mbev.autobet), marked auto', (await ev(X.p,()=>JSON.parse(localStorage.getItem('mbev.autobet')||'[]').filter((x)=>x.auto).length))===2, null);
    const gate=async(name, mut, want)=>{ await reset(); const keep={...status}; mut(); const t=await ev(X.p,()=>autoTick()); status=keep; await ev(X.p,()=>{ localStorage.setItem('mbev.autoSend','1'); SY.on=true; SY.key='sk-test'; }); check('no order when: '+name, (t.skip===want) && posts.filter((x)=>x.path==='/autobet').length===0, [t, posts.map((x)=>x.path)]); };
    await gate('the switch is OFF', () => { ev(X.p,()=>{ localStorage.setItem('mbev.autoSend','0'); }); }, 'off'); await ev(X.p,()=>{ localStorage.setItem('mbev.autoSend','1'); });
    await gate('the Worker is not armed for today', () => { status={...status, armed:false}; }, 'not armed');
    await gate('the kill switch is on', () => { status={...status, killed:true}; }, 'killed');
    await gate('under $1 is left today', () => { status={...status, left:0.5}; }, 'budget');
    await reset(); await ev(X.p,()=>{ SY.on=false; }); const tn=await ev(X.p,()=>autoTick()); await sync(); check('no order when sync is off (no status)', tn.skip==='no status' && posts.length===0, [tn, posts.length]);
    await reset(); await ev(X.p,()=>{ lastRows.filter((r)=>scApproved(r)&&LIVE_BOOK(r.book)==='novig').forEach((r)=>{ r.gameInfo=Object.assign({},r.gameInfo,{startISO:new Date(Date.now()+60e3).toISOString()}); }); }); const tc=await ev(X.p,()=>autoTick());
    check('no order for a game that starts in under 3 minutes', tc.skip==='nothing new' && posts.filter((x)=>x.path==='/autobet').length===0, tc);
    check('automatic sending never touches the Bet log', (await ev(X.p,()=>logged.length))===logged0, null);
    // a refused order is final for that pick
    await ev(X.p,()=>{ lastRows.forEach((r)=>{ if(r.gameInfo && r.gameInfo.startISO) r.gameInfo=Object.assign({},r.gameInfo,{startISO:new Date(Date.now()+3*3600e3).toISOString()}); }); });
    await reset(); orderAnswer=()=>({ok:false, reason:'live_price_above_limit'}); const tr=await ev(X.p,()=>autoTick()), tr2=await ev(X.p,()=>autoTick()), tr3=await ev(X.p,()=>autoTick());
    check('a refused order is recorded and that pick is not tried again; the other pick is tried once; then nothing', tr.ok===false && tr.reason==='live_price_above_limit' && tr2.sent && tr2.sent!==tr.sent && tr3.skip==='nothing new' && posts.filter((x)=>x.path==='/autobet').length===2, [tr, tr2, tr3]);
  });
  await safe('check now, working now, last look, looks today', async()=>{
    await sync(); await ev(X.p,()=>{ localStorage.setItem('mbev.autoSend','1'); localStorage.removeItem('mbev.autoLook'); localStorage.removeItem('mbev.autoLast'); }); orderAnswer=()=>({ok:true, placed:true, mode:'LIVE', price:'0.595', qty:168, cost:1}); await reset();
    status={ok:true, mode:'LIVE', day:'2026-11-10', budget:10, reserved:0, left:10, killed:false, requireArm:true, armed:true, orders:[]};
    await ev(X.p,()=>{ document.querySelector('.tab[data-view="v-settings"]').click(); document.getElementById('apPanel').open=true; window._doing=[]; const o=apDoing; apDoing=function(t){ window._doing.push(t); return o(t); }; });
    check('the card has a Check now button', (await ev(X.p,()=>!!document.getElementById('apCheck')))===true, null);
    const p0=posts.filter((x)=>x.path==='/autobet').length; await ev(X.p,()=>document.getElementById('apCheck').click()); await X.p.waitForTimeout(900);
    const sentNow=posts.filter((x)=>x.path==='/autobet').length-p0;
    check('Check now runs one look right away: one order request, and the card says what it found', sentNow===1 && /Checked: sent 1 pick to the Worker/.test(await ev(X.p,()=>document.getElementById('apMsg').textContent)), [sentNow, await ev(X.p,()=>document.getElementById('apMsg').textContent)]);
    const d=await ev(X.p,()=>window._doing);
    check('while it works the card says what it is doing: asking the Worker, searching the board, found one and sending (and clears at the end)', d.some((x)=>/asking the Worker/.test(x)) && d.some((x)=>/searching the board/.test(x)) && d.some((x)=>/found one/.test(x)) && d[d.length-1]==='', d);
    const last=await ev(X.p,()=>document.getElementById('apNow').textContent);
    check('after a look the card says when the last look was and what it found', /Last look: .*sent 1 pick/.test(last), last);
    check('Looks today lists it, marked as pressed by you', /Looks today/.test(await ev(X.p,()=>document.getElementById('apLook').textContent)) && /you pressed Check now/.test(await ev(X.p,()=>document.getElementById('apLook').textContent)), await ev(X.p,()=>document.getElementById('apLook').textContent));
    await ev(X.p,()=>autoTick(false)); await ev(X.p,()=>autoTick(false)); await ev(X.p,()=>autoTick(false)); await ev(X.p,()=>autoTick(false));
    const rows=await ev(X.p,()=>JSON.parse(localStorage.getItem('mbev.autoLook')).rows);
    check('the same "nothing new" many times is one line with a count, not many lines', rows.filter((x)=>/nothing new/.test(x.w)).length===1 && rows.some((x)=>x.n>=2), rows);
    await reset(); status={...status, requireArm:undefined, armed:true}; const tw=await ev(X.p,()=>autoTick()); check('fails closed: if the Worker does not require the daily Proceed yet, nothing is sent automatically', tw.skip==='not armed' && posts.filter((x)=>x.path==='/autobet').length===0, [tw, posts.length]);
    status={...status, requireArm:true, armed:true}; await ev(X.p,()=>{ localStorage.setItem('mbev.autoSend','0'); }); await ev(X.p,()=>document.getElementById('apCheck').click()); await X.p.waitForTimeout(500);
    check('Check now with the switch off sends nothing and says the switch is off', /switch is off|box is not ticked/.test(await ev(X.p,()=>document.getElementById('apMsg').textContent)) && posts.filter((x)=>x.path==='/autobet').length===0, await ev(X.p,()=>document.getElementById('apMsg').textContent));
    // the WIU case (owner, 2026-11-25): a model-EV outlier or a stale last-seen price is never approved, so it is never sent
    await reset(); await ev(X.p,()=>{ localStorage.setItem('mbev.autoSend','1'); }); status={...status, requireArm:true, armed:true, killed:false, left:10};
    const both=await ev(X.p,()=>{ const A=lastRows.filter((r)=>scApproved(r)&&LIVE_BOOK(r.book)==='novig'); A.forEach((r)=>{ r.outlier=true; }); return [A.length, A.every((r)=>!scApproved(r))]; });
    const to=await ev(X.p,()=>autoTick()); check('an outlier pick (like the WIU one) is not approved, so the automatic look sends nothing', both[0]>=1 && both[1]===true && to.skip==='nothing new' && posts.filter((x)=>x.path==='/autobet').length===0, [both, to]);
  });
  await safe('the report (v5.34: when it went out, how many, how many passed, almost made it)', async()=>{
    await ev(X.p,()=>{ lastRows.forEach((r)=>{ r.outlier=false; }); });   /* the earlier outlier block marked the approved rows */
    await sync(); await reset(); await ev(X.p,()=>{ localStorage.setItem('mbev.autoSend','1'); localStorage.removeItem('mbev.autoLook'); }); orderAnswer=()=>({ok:true, placed:true, mode:'LIVE', price:'0.595', qty:168, cost:1});
    status={ok:true, mode:'LIVE', day:'2026-11-10', budget:10, reserved:0, left:10, killed:false, requireArm:true, armed:true, orders:[]};
    await ev(X.p,()=>{ lastRows.forEach((r)=>{ if(r.gameInfo && r.gameInfo.startISO) r.gameInfo=Object.assign({},r.gameInfo,{startISO:new Date(Date.now()+3*3600e3).toISOString()}); }); });
    const c0=await ev(X.p,()=>apBoardCounts());
    const want=await ev(X.p,()=>({novig:lastRows.filter((r)=>LIVE_BOOK(r.book)==='novig').length, approved:lastRows.filter((r)=>LIVE_BOOK(r.book)==='novig'&&scApproved(r)).length}));
    check('the board counts match the board: Novig picks seen and approved', c0.novig===want.novig && c0.approved===want.approved && c0.approved>=2, [c0.novig, c0.approved, want]);
    const p0=posts.length; const html0=await ev(X.p,()=>apReportHtml()); check('the report is read-only: it sends nothing', posts.length===p0 && /Report/.test(html0) && /approved \(these can be sent\)/.test(html0), html0.slice(0,200));
    await ev(X.p,()=>autoTick()); const h1=await ev(X.p,()=>apReportHtml()); check('after one automatic send the report says 1 sent, 1 placed, 0 refused and the time it went out', /<b>1<\/b> sent · <b>1<\/b> placed · <b>0<\/b> refused · went out at \d{1,2}:\d{2}/.test(h1), h1.slice(0,400));
    await ev(X.p,()=>{ const A=lastRows.filter((r)=>scApproved(r)&&LIVE_BOOK(r.book)==='novig'); A.forEach((r)=>{ r.outlier=true; r.actNet=0.05; }); });
    const c1=await ev(X.p,()=>apBoardCounts()); const h2=await ev(X.p,()=>apReportHtml());
    check('a pick that was approved but is now an outlier is "almost made it", with the plain reason', c1.near.filter((x)=>/trust limit \(outlier\)/.test(x.why)).length===2 && /Almost made it/.test(h2) && /15% trust limit/.test(h2), [c1.near, h2.slice(0,300)]);
    await ev(X.p,()=>{ lastRows.filter((r)=>LIVE_BOOK(r.book)==='novig').forEach((r)=>{ r.outlier=false; r.prior=true; }); });
    const c2=await ev(X.p,()=>apBoardCounts()); check('a pick you already bet is not listed as almost made it', c2.near.length===0, c2.near);
    await ev(X.p,()=>{ document.querySelector('.tab[data-view="v-settings"]').click(); document.getElementById('apPanel').open=true; }); await X.p.waitForTimeout(300);
    check('the Autopilot card shows the report when opened', /Report/.test(await ev(X.p,()=>document.getElementById('apReport').textContent)) && /look/.test(await ev(X.p,()=>document.getElementById('apReport').textContent)), await ev(X.p,()=>document.getElementById('apReport').textContent));
  });
  check('no page errors', X.errs.length===0, X.errs.slice(0,3));
  await b.close(); const r=L.res(); console.log('\n'+r.pass+' passed, '+r.fail+' failed'); process.exit(r.fail?1:0); })();
