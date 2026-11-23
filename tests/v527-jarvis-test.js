// node tests/v527-jarvis-test.js [index.html] — v5.27 🤖 Jarvis (owner 11/22: "i want my scout to think for me and tell me what to bet, based off La Conta' but still to do the work for me ...
// i still need to click and make the bet, but for it to do pop ups"; "approved only ... a near miss if it feels it"; "time would be dynamic ... during the week, its based off lunch or
// break, meetings, etc, and weekend its almost ALL DAY"; "sound on"). A fake board and a fake Worker (no real API). Covers: the windows by weekday and time (inside, outside, the end minute,
// past midnight, a day off, Talk now, Quiet for 1 hour); a new approved pick pops once, in La Contadora's order; the numbers on the pop-up are the card's (stake, OK up to, the Kalshi
// ticket); I bet this opens the card's own form, saves through the normal path, and the pick never pops again; Not now (30 min) and Skip today; the near-miss rule, its cap of 2 and its
// words; the "While you were away" digest; the Scout reused inside windows only; sound and notification; the spend line; nothing in Easy or with DEV_APP false; no AI call with the AI
// off or the Worker paused; stakes and decisions the same with Jarvis on and off; 390, 1000, 1280 and 1960 px fit. No page errors.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,700)); };
const NOW=Date.parse('2026-11-10T18:10:00Z') /* Tue 12:10 PM CT */, iso=ms=>new Date(ms).toISOString(), DAY='2026-11-10', KO=Date.parse('2026-11-11T01:15:00Z'), H=3600e3, M=60e3;
const T=(ha,abbr,loc,nick)=>({ha,id:abbr,abbr,name:loc+' '+nick,loc,nick,logo:'',rec:'',color:'333333',alt:'ffffff'});
const GI=(start,id,a,h)=>({state:'pre',startISO:iso(start),eventId:id,timeCT:'',detail:'',teams:[T('away',a[0],a[1],a[2]),T('home',h[0],h[1],h[2])]});
const G4=GI(KO+3*H,'401004',['NYR','New York','Rangers'],['PIT','Pittsburgh','Penguins']), G1=GI(KO,'401001',['BUF','Buffalo','Bills'],['MIN','Minnesota','Vikings']), G2=GI(KO+2*H,'401002',['NYI','New York','Islanders'],['SJ','San Jose','Sharks']), G3=GI(KO+H,'401003',['BOS','Boston','Bruins'],['TOR','Toronto','Maple Leafs']);
const am=p=>p>=0.5?String(Math.round(-100*p/(1-p))):'+'+Math.round(100*(1-p)/p);
const prop=(id,name,team,market,side,price,fair,mkt,gi,sport,extra)=>Object.assign({name,team,game:gi.teams[0].abbr+' @ '+gi.teams[1].abbr,matchup:gi.teams[0].abbr+' @ '+gi.teams[1].abbr,side,sport,market,kind:'prop',book:'Novig',
  offeredRaw:am(price),offeredProb:price,fairProb:fair,fairRaw:am(fair),mktProb:mkt,stars:4,evModel:'projection',projValue:10,gameInfo:gi,src:'api:seed:'+sport,apiKey:id,loadedAt:iso(NOW-60e3)},extra||{});
const ROWS=[
  prop('a','Justin Jefferson','MIN','75.5 Receiving Yards','O',0.54,0.62,0.60,G1,'NFL'),
  prop('b','Artemi Panarin','NYR','0.5 Points','O',0.62,0.68,0.66,G4,'NHL'),
  prop('k','Bo Horvat','NYI','1.5 Shots','O',0.52,0.60,0.585,G2,'NHL',{book:'Kalshi'}),
  prop('n1','David Pastrnak','BOS','3.5 Shots','O',0.60,0.62,0.599,G3,'NHL'),       // near misses: the model likes them, her EV with the market is 0% or better but under the floor
  prop('n2','Brad Marchand','BOS','2.5 Shots','O',0.60,0.62,0.599,G3,'NHL'),
  prop('n3','Auston Matthews','TOR','3.5 Shots','O',0.60,0.62,0.599,G3,'NHL')];
const NOTIF=perm=>`window._notes=[]; window.Notification=class{ constructor(t,o){ window._notes.push({t, body:(o||{}).body, tag:(o||{}).tag}); } close(){} static get permission(){ return '${perm}'; } static requestPermission(){ window._askedPerm=1; return Promise.resolve('${perm}'); } };`;
async function open(b, W, opt){ opt=opt||{};
  const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:W,height:opt.h||900}}); await ctx.clock.install({time:new Date(opt.at||NOW)});
  await ctx.addInitScript(([R,d,o])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig, Kalshi',bank:'500',cfgVer:3.03})); localStorage.setItem('mbev.cards','1');
    localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows:R})); localStorage.setItem('mbev.jarvis',JSON.stringify(o.jarvis||{}));   /* a test browser opts in (round 3, N4) */
    if(o.ai){ localStorage.setItem('mbev.ai.on','1'); localStorage.setItem('mbev.ai.status',JSON.stringify({setUp:true, spentToday:0, spentMonth:0, capDay:5, capMonth:90, at:Date.now()})); localStorage.setItem('mbev.pass','pw'); }
    if(o.log) localStorage.setItem('mbev.ai.log',JSON.stringify(o.log)); }catch(e){} },[ROWS,DAY,{jarvis:opt.jarvis||null, ai:!!opt.ai, log:opt.aiLog||null}]);
  await ctx.addInitScript(NOTIF(opt.notif||'default')); if(opt.init) await ctx.addInitScript(opt.init);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  const S={ai:[], news:opt.news||'ok', live:0, props:0};
  await (opt.ctxRoute?ctx:p).route('**/*',r=>{ const req=r.request(), u=req.url();
    if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:opt.html||html});
    if(/api\.0xbeta\.dev\/ai\/status/.test(u)) return r.fulfill({contentType:'application/json',body:JSON.stringify({setUp:!!opt.ai, spentToday:0.2, spentMonth:3.1, capDay:5, capMonth:90})});
    if(/api\.0xbeta\.dev\/ai$/.test(u)){ if(req.method()==='OPTIONS') return r.fulfill({status:204, headers:{'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'POST, GET, OPTIONS'}});
      let body={}; try{ body=JSON.parse(req.postData()||'{}'); }catch(e){} S.ai.push(body);
      const st=typeof S.news==='function'?S.news(body):S.news;
      return r.fulfill({contentType:'application/json',body:JSON.stringify({ok:true, job:body.job, out:{status:st, summary:st==='ok'?'Expected to play.':'Listed questionable.', sources:[]}, usd:0.04, spentToday:0.24, spentMonth:3.14})}); }
    if(/api\.0xbeta\.dev\/budget/.test(u)) return r.fulfill({contentType:'application/json',body:JSON.stringify({limit:50,used:10,left:40})});
    if(/api\.0xbeta\.dev\/props/.test(u)){ S.props++; return r.fulfill({contentType:'application/json',body:JSON.stringify({props:[],source_count:0,debug:{}})}); }
    if(/api\.0xbeta\.dev\/live/.test(u)){ S.live++; return r.fulfill({contentType:'application/json',body:JSON.stringify({at:new Date().toISOString(),results:{}})}); }
    if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'});
    if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'});
    return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1300);
  // the Scout and the Sentinels are counted, not run (the fake Worker has no prices): Jarvis must call them the existing way (scRunRow) and only inside a window
  await p.evaluate(()=>{ window._runs=[]; scRunRow=async(row,how)=>{ window._runs.push(row.src+':'+how); return 'ok'; }; window._beeps=0; perfBeep=()=>{ window._beeps++; }; });
  return {ctx,p,errs,S}; }
const ev=async(p,fn,arg)=>{ try{ return await p.evaluate(fn,arg); }catch(e){ return {evalError:String(e.message||e).slice(0,300)}; } };
const safe=async(name,f)=>{ try{ await f(); }catch(e){ check(name+' (threw)', false, String(e.message||e).slice(0,300)); } };
const pop=p=>ev(p,()=>{ const el=document.getElementById('jvPop'); if(!el || el.hidden) return null; const q=s=>{ const x=el.querySelector(s); return x?x.textContent.trim():null; };
  const kv={}; el.querySelectorAll('.jv-k').forEach(k=>{ kv[k.querySelector('span').textContent]=k.querySelector('b').textContent; });
  return {head:q('.jv-t'), pick:q('.jv-pick'), more:q('.jv-n'), kv, ok:q('.jv-ok'), nm:q('.jv-nm'), ai:q('.jv-ai'), tkt:(el.querySelector('.sc-tkt')||{}).outerHTML||null, btns:[...el.querySelectorAll('.jv-b button, .jv-b a, .jv-self')].map(x=>x.textContent.trim()), key:(window._jvCur||{}).k||null, near:!!(window._jvCur||{}).near, digest:!!(window._jvCur||{}).digest, dl:[...el.querySelectorAll('.jv-dl li')].map(x=>x.textContent)}; });
const tick=p=>ev(p,()=>{ jvTick(); });
const click=async(p,sel)=>{ await ev(p,s=>{ const b=document.querySelector(s); if(b) b.click(); },sel); await p.waitForTimeout(120); };
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
  // ================= 3. outside the window: silent, then the digest =================
  await safe('digest', async()=>{
    X=await open(b,1280,{at:Date.parse('2026-11-10T19:20:00Z') /* 1:20 PM: between the windows */});
    await X.p.waitForTimeout(1500); await tick(X.p);
    const o=await ev(X.p,()=>({pop:!!(document.getElementById('jvPop')&&!document.getElementById('jvPop').hidden), away:jvRun().away.map(x=>x.t), runs:window._runs.length, beeps:window._beeps}));
    check('outside the windows: silent (no pop-up, no sound, no Scout) and a short “While you were away” list of the approved picks', !o.pop && o.away.length===3 && o.runs===0 && o.beeps===0 && o.away.some(x=>/^Bo Horvat Over 1\.5 Shots · Kalshi$/.test(x)), o);
    await X.p.clock.runFor(25*M); await X.p.waitForTimeout(300); await tick(X.p);
    check('still no Scout outside the windows', (await ev(X.p,()=>window._runs.length))===0, null);
    await ev(X.p,()=>{ const r=lastRows.find(x=>x.apiKey==='a'); r.offeredProb=0.55; r.offeredRaw='-122'; refresh(); });
    await X.p.clock.runFor(76*M); await X.p.waitForTimeout(300); await tick(X.p);   // 3:01 PM
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
    await tick(X.p); await X.p.waitForTimeout(500); await X.p.clock.runFor(16*M); await X.p.waitForTimeout(500);
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

  // ================= 7. round 2 (the review of 69e5685): each check fails on that commit =================
  const fresh=p=>ev(p,()=>{ localStorage.removeItem('mbev.jarvisRun'); window._jvRunMem=null; window._jvRunLast=null; jvClose(true); window._jvWasOpen=false; jvTick(); });
  const cardSave=(p,k)=>ev(p,k=>{ const r=lastRows.find(x=>pxKey(x)===k && scApproved(x)); const w=document.createElement('div'); w.id='fakeCards'; w.innerHTML=placeCardHtml(r,cfgRead(),{}); document.body.appendChild(w); const c=w.firstElementChild; openBetEditor(c, r); c.querySelector('.eb-save').click(); w.remove(); return logged.length; }, k);
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
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
