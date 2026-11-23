// node tests/v527-jarvis-test.js [index.html] — v5.27 🤖 Jarvis, part 1 (the round-1 build: the windows by weekday, the pop-up and its numbers, I bet this, Not now, Skip today, the Scout reused). The setup, the fake board and the fake Worker are in v527-jarvis-lib.js (no real API).
const { chromium, html, check, open, ev, safe, pop, tick, click, fresh, cardSave, NOW, DAY, KO, H, M, iso, ROWS, res } = require('./v527-jarvis-lib.js');
(async()=>{ const b=await chromium.launch(); let X;
  // ================= 1. the windows =================
  X=await open(b,1280);
  await safe('windows', async()=>{
    const W=await ev(X.p,()=>{ const at=s=>Date.parse(s), J=jvGet(); const f=t=>jvInWin(at(t), J);
      const J2=JSON.parse(JSON.stringify(J)); J2.days[5].w.push(['22:00','02:00']); const J3=JSON.parse(JSON.stringify(J2)); J3.days[5].off=true; const f2=(t,j)=>jvInWin(at(t), j);
      return {tue1210:f('2026-11-10T18:10:00Z'), tue1259:f('2026-11-10T18:59:00Z'), tue1300:f('2026-11-10T19:00:00Z'), tue1515:f('2026-11-10T21:15:00Z'), tue1530:f('2026-11-10T21:30:00Z'), tue0900:f('2026-11-10T15:00:00Z'),
        sat0900:f('2026-11-14T15:00:00Z'), sat2200:f('2026-11-15T04:00:00Z'), sat2300:f('2026-11-15T05:00:00Z'), sun1200:f('2026-11-15T18:00:00Z'),
        fri2300:f2('2026-11-14T05:00:00Z',J2), sat0100:f2('2026-11-14T07:00:00Z',J2), sat0230:f2('2026-11-14T08:30:00Z',J2), sat0100off:f2('2026-11-14T07:00:00Z',J3)}; });
    check('weekdays: inside 12:00–1:00 PM and 3:00–3:30 PM (Central), outside at 1:00 PM sharp, 3:30 PM and 9 AM', W.tue1210 && W.tue1259 && !W.tue1300 && W.tue1515 && !W.tue1530 && !W.tue0900, W);
    check('weekends: almost all day, 9:00 AM–11:00 PM (inside at 9 AM, 10 PM and noon Sunday; outside at 11 PM)', W.sat0900 && W.sat2200 && !W.sat2300 && W.sun1200, W);
    check('a window that ends after midnight (Fri 10 PM–2 AM) is inside at 11 PM and at 1 AM Saturday, outside at 2:30 AM; with Friday off, 1 AM Saturday is outside', W.fri2300 && W.sat0100 && !W.sat0230 && !W.sat0100off, W);
    const def=await ev(X.p,()=>{ const J=jvGet(); return {on:J.on, sound:J.sound, mon:J.days[1].w, sat:J.days[6].w, sun:J.days[0].w}; });
    check('defaults: on, sound on, Mon–Fri 12:00–1:00 PM and 3:00–3:30 PM, Sat–Sun 9:00 AM–11:00 PM', def.on && def.sound && JSON.stringify(def.mon)==='[["12:00","13:00"],["15:00","15:30"]]' && JSON.stringify(def.sat)==='[["09:00","23:00"]]' && JSON.stringify(def.sun)==='[["09:00","23:00"]]', def);
    // Settings: the panel, Talk now and Quiet for 1 hour
    await ev(X.p,()=>{ document.querySelector('.tab[data-view="v-settings"]').click(); document.getElementById('jarvisPanel').open=true; jvPaint(true); });
    const P=await ev(X.p,()=>({days:[...document.querySelectorAll('#jvWeek .jv-day .jv-dn')].map(x=>x.textContent), mon:[...document.querySelectorAll('#jvWeek .jv-day[data-d="1"] input[type="time"]')].map(x=>x.value), now:document.getElementById('jvNow').textContent, reg:EASY_REGISTRY.some(r=>r[4]==='#jarvisPanel' && r[2]==='god'), sync:SYNC_SETS.jarvis}));
    check('Settings › 🤖 Jarvis: seven days, Monday first, each window as two times; it says it is inside the window now; God only; synced as mbev.jarvis', P.days.length===7 && P.days[0]==='Monday' && P.mon.join()==='12:00,13:00,15:00,15:30' && /^On: inside your window now/.test(P.now) && P.reg && P.sync==='mbev.jarvis', P);
    await click(X.p,'#jvWeek .jv-day[data-d="2"] [data-jv="add"]');
    await ev(X.p,()=>{ const i=document.querySelectorAll('#jvWeek .jv-day[data-d="2"] input[type="time"]'); i[4].value='18:00'; i[4].dispatchEvent(new Event('change',{bubbles:true})); i[5].value='19:30'; i[5].dispatchEvent(new Event('change',{bubbles:true})); });
    const e1=await ev(X.p,()=>JSON.parse(localStorage.getItem('mbev.jarvis')).days[2].w);
    await click(X.p,'#jvWeek .jv-day[data-d="2"] [data-jv="del"][data-i="0"]');
    const e2=await ev(X.p,()=>JSON.parse(localStorage.getItem('mbev.jarvis')).days[2].w);
    await ev(X.p,()=>{ const c=document.querySelector('#jvWeek .jv-day[data-d="3"] [data-jv="off"]'); c.checked=true; c.dispatchEvent(new Event('change',{bubbles:true})); });
    const e3=await ev(X.p,()=>{ const J=JSON.parse(localStorage.getItem('mbev.jarvis')); return {off:J.days[3].off, wedIn:jvInWin(Date.parse('2026-11-11T18:10:00Z'))}; });
    check('add a window (6:00–7:30 PM), remove one, a day off: saved in mbev.jarvis and used', JSON.stringify(e1)==='[["12:00","13:00"],["15:00","15:30"],["18:00","19:30"]]' && JSON.stringify(e2)==='[["15:00","15:30"],["18:00","19:30"]]' && e3.off && !e3.wedIn, {e1,e2,e3});
    await ev(X.p,()=>{ localStorage.setItem('mbev.jarvis','{}'); jvPaint(true); });
    await click(X.p,'#jvQuiet');
    const q1=await ev(X.p,()=>({open:jvOpen(), now:document.getElementById('jvNow').textContent, btn:document.getElementById('jvQuiet').textContent, mins:Math.round((jvRun().quiet-Date.now())/60e3), at3:jvOpen(Date.parse('2026-11-10T21:10:00Z'))}));
    check('Quiet for 1 hour: closed now inside the window, for 60 minutes (the 3 PM window opens as usual); the panel says until when', !q1.open && /^Quiet until 1:1\d PM\.$/.test(q1.now) && q1.btn==='End quiet' && q1.mins===60 && q1.at3, q1);
    await click(X.p,'#jvQuiet');
    const t1=await ev(X.p,()=>{ const at=Date.parse('2026-11-10T20:00:00Z'); return {two:jvOpen(at)}; });   // 2 PM: between the windows
    await click(X.p,'#jvTalk');
    const t2=await ev(X.p,()=>({two:jvOpen(Date.parse('2026-11-10T20:00:00Z')), late:jvOpen(Date.parse('2026-11-11T05:30:00Z')), after:jvOpen(Date.parse('2026-11-11T06:05:00Z')), btn:document.getElementById('jvTalk').textContent, pressed:document.getElementById('jvTalk').getAttribute('aria-pressed')}));
    await click(X.p,'#jvTalk');
    const t3=await ev(X.p,()=>jvOpen(Date.parse('2026-11-10T20:00:00Z')));
    check('Talk now: open between windows and late in the evening, until midnight (not after); pressed again it stops', !t1.two && t2.two && t2.late && !t2.after && t2.btn==='Stop talking' && t2.pressed==='true' && !t3, {t1,t2,t3});
    await ev(X.p,()=>{ document.querySelector('.tab[data-view="v-board"]').click(); });
  });
  // ================= 2. the pop-up =================
  await safe('pop-up', async()=>{
    const st=await ev(X.p,()=>lastRows.map(r=>({k:r.apiKey, ok:scApproved(r), near:jvNearOk(r), stake:+r.stake||0, act:r.actNet!=null?+r.actNet.toFixed(4):null, xc:r.xc||null})));
    check('setup: Jefferson, Panarin and Horvat (Kalshi) approved; Pastrnak, Marchand and Matthews are 🍀 Just missed rows (not approved, no stake)', ['a','b','k'].every(k=>st.find(x=>x.k===k).ok) && ['n1','n2','n3'].every(k=>{ const x=st.find(y=>y.k===k); return x.near && !x.ok; }), st);
    await ev(X.p,()=>{ localStorage.removeItem('mbev.jarvisRun'); window._jvRunMem=null; jvClose(true); window._jvWasOpen=false; window._beeps=0; });
    await tick(X.p);
    const order=await ev(X.p,()=>[window._jvCur&&window._jvCur.k].concat((window._jvQ||[]).map(x=>x.k)).map(k=>lastRows.find(r=>pxKey(r)===k).apiKey));
    const want=await ev(X.p,()=>lastRows.filter(scApproved).sort((a,b)=>mathKey(b)-mathKey(a)).map(r=>r.apiKey));
    const P1=await pop(X.p);
    check('inside the window: the approved picks pop one at a time, in La Contadora’s order (mathKey), the first shown and the rest queued', P1 && JSON.stringify(order)===JSON.stringify(want) && order.length===3 && P1.more==='2 more after this', {order, want, more:P1&&P1.more});
    check('the pop-up says it plainly: "🤖 Jarvis · Bet this", the pick, "La Contadora approves it", the book, the stake, "Price must be … or better", the price age; the buttons', P1 && P1.head==='🤖 Jarvis · Bet this' && P1.ok==='La Contadora approves it' && P1.kv.Book && /^\$\d+\.\d\d$/.test(P1.kv.Stake) && / or better$/.test(P1.kv['Price must be']) && /ago$/.test(P1.kv['Price read']) && JSON.stringify(P1.btns)==='["Open the book ↗","I bet this","Not now","Skip today","Why?"]', P1);
    check('sound on: one tone when it pops', (await ev(X.p,()=>window._beeps))===1, null);
    // the numbers are the card's (the card is built by the board's own placeCardHtml for the same row)
    const card=async key=>ev(X.p,k=>{ const r=lastRows.find(x=>pxKey(x)===k && scApproved(x)); if(!r) return null; const d=document.createElement('div'); d.innerHTML=placeCardHtml(r, cfgRead(), {}); const c=d.firstElementChild;
      const t=[...c.querySelectorAll('.sc-t')].find(x=>x.querySelector('.sc-tk').textContent==='OK up to'); return {book:r.book, stake:c.querySelector('.sc-money b').textContent, ok:t?t.querySelector('b').textContent:null, tkt:(c.querySelector('.sc-tkt')||{}).outerHTML||null}; }, key);
    const C1=await card(P1.key);
    check('the stake and OK up to on the pop-up are the card’s ('+(C1&&C1.stake)+', '+(C1&&C1.ok)+')', C1 && P1.kv.Stake===C1.stake && P1.kv['Price must be']===C1.ok+' or better', {pop:[P1.kv.Stake, P1.kv['Price must be']], card:C1});
    const k1=P1.key; await click(X.p,'#jvPop .jv-later'); const P2=await pop(X.p); const C2=await card(P2.key);
    const k2=P2.key; await click(X.p,'#jvPop .jv-skip'); const P3=await pop(X.p); const C3=await card(P3.key);
    check('Not now and Skip today each show the next pick', P2 && P3 && k2!==k1 && P3.key!==k2 && P3.key!==k1, [k1,k2,P3&&P3.key]);
    const PK=[[P1,C1],[P2,C2],[P3,C3]].find(x=>x[1] && x[1].book==='Kalshi');
    check('the Kalshi pick shows the card’s own “Type this” ticket (side, limit, shares, cost, expires), and the card’s stake and limit', PK && PK[0].tkt && PK[0].tkt===PK[1].tkt && PK[0].kv.Stake===PK[1].stake && PK[0].kv['Price must be']===PK[1].ok+' or better', PK&&{pop:PK[0].tkt&&PK[0].tkt.slice(0,240), kv:PK[0].kv, card:{stake:PK[1].stake, ok:PK[1].ok, tkt:PK[1].tkt&&PK[1].tkt.slice(0,240)}});
    check('every pick shown has the card’s stake and OK up to', [[P2,C2],[P3,C3]].every(x=>x[1] && x[0].kv.Stake===x[1].stake && x[0].kv['Price must be']===x[1].ok+' or better'), [[P2&&P2.kv,C2],[P3&&P3.kv,C3]]);
    // I bet this: the card's own form, inside the pop-up; Save is the normal save
    const n0=await ev(X.p,()=>logged.length);
    await click(X.p,'#jvPop .jv-bet');
    const ed=await ev(X.p,()=>{ const e=document.querySelector('#jvPop .editor'); return e?{stake:e.querySelector('.eb-stake').value, book:e.querySelector('.eb-book').value, save:!!e.querySelector('.eb-save')}:null; });
    check('I bet this opens the card’s own bet form in the pop-up, at the card’s book', ed && ed.save && ed.book===C3.book, {ed, book:C3.book});
    await click(X.p,'#jvPop .eb-save'); await X.p.waitForTimeout(150);
    let msg=await ev(X.p,()=>{ const m=document.querySelector('#jvPop .eb-msg'); return m?m.textContent:''; }); if(msg){ await click(X.p,'#jvPop .eb-save'); await X.p.waitForTimeout(150); }
    const sv=await ev(X.p,k=>({n:logged.length, last:logged[logged.length-1]&&{book:logged[logged.length-1].book, key:pxKey(logged[logged.length-1]), snap:!!logged[logged.length-1].snap}, stored:JSON.parse(localStorage.getItem('mbev.log')||'[]').length, prior:lastRows.filter(r=>pxKey(r)===k).some(r=>r.prior) && !lastRows.some(r=>pxKey(r)===k && scApproved(r)), done:!!jvRun().done[k], cur:(window._jvCur||{}).k||null}),P3.key);
    check('Save logs the bet the normal way (in the saved log, with its snapshot); the pick is ALREADY BET, Jarvis marks it done and moves on', sv.n===n0+1 && sv.stored===sv.n && sv.last && sv.last.book===C3.book && sv.last.snap && sv.prior && sv.done && sv.cur!==P3.key, {sv, msg});
    await ev(X.p,()=>{ jvClose(true); }); await tick(X.p); await tick(X.p);
    const after=await ev(X.p,()=>[ (window._jvCur||{}).k ].concat((window._jvQ||[]).map(x=>x.k)).filter(Boolean));
    check('ticks later: the bet placed and the one skipped never pop again; the snoozed one waits (nothing pops)', !after.includes(P3.key) && !after.includes(k2) && !after.includes(k1), after);
    await X.p.clock.runFor(31*M); await X.p.waitForTimeout(300); await tick(X.p);
    const back=await ev(X.p,()=>[ (window._jvCur||{}).k ].concat((window._jvQ||[]).map(x=>x.k)).filter(Boolean));
    check('Not now: 30 minutes later (still inside the window) it comes back, once', back.filter(k=>k===k1).length===1 && !back.includes(k2) && !back.includes(P3.key), back);
    // the Scout was reused inside the window: the Scout first (BettingPros, inside its cap), then the Sentinels
    const runs=await ev(X.p,()=>window._runs.slice());
    check('inside the window Jarvis reuses the Scout the existing way (scRunRow): the Scout first, then the Sentinels every 10–15 minutes', runs.length>=2 && runs[0]==='bp_props:scout' && runs.slice(1).every(x=>x==='sent:scout'), runs);
    const R2=await ev(X.p,()=>{ const R=jvRun(); return {gap:R.nextAt-Date.now()}; });
    check('the next check is 10 to 15 minutes ahead, not on the minute', R2.gap>0 && R2.gap<=15*M+50e3, R2);
    check('no AI call with the AI helper off (no AI line either)', X.S.ai.length===0 && P1.ai===null, {ai:X.S.ai.length, line:P1.ai});
    check('no page errors (pop-up)', !X.errs.length, X.errs);
  });
  await X.ctx.close();
  const {pass, fail}=res(); console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
