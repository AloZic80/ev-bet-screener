// node tests/v528-slips-test.js [index.html] — v5.28 (owner 11/22: "the Upload option on the bet log did not read it" · "Build"; 11/23: "It's confusing ... I need to be able to tell
// the difference and have it preload correctly"). A fake Worker (no real API) answers the slips job with the owner's three DK Predictions trades (MIN @ SF, Sun Nov 22 2026, all won)
// and the slip job with the 49ers trade. Bet log › Import: a picture → three rows with the exact numbers, Save → three settled bets; the same picture again → 0 new; the hand-made
// agent-notes file then the picture → 0 new; two overlapping pictures → no duplicate; an unclear stake blocks its row until fixed; AI off / Worker paused → no call and the plain
// sentence; a .json file still imports; nothing in Easy; 390 and 1280 px fit. + Add a bet › Read slip: MIN @ SF, Nov 22, SF, DK Predictions (exchange, % mode), Cost 26.80,
// 65%, Pays back 40.00, Won, saved with profit +13.20; a game that is not on ESPN leaves the game empty with ⚠ (never the first game in the list); 3 bets in one picture → Bet log › Import.
// Odds: cost 26.80 for 40.00 is a 67% price, American −203 (the brief's "+49" is the profit per $100, 49.25%, not American odds); 26.65→41.00 −186; 26.95→49.00 −122.
const path=require('path'); const fs=require('fs'); const { chromium } = require('playwright');
const html=fs.readFileSync(process.argv[2]||path.join(__dirname,'..','index.html'),'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,600)); };
const NOW=Date.parse('2026-11-23T17:00:00Z'), PASSW='pw-secret-528';
const PNG=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==','base64');
const pic=(n)=>({name:'shot'+(n||'')+'.png', mimeType:'image/png', buffer:PNG});
// ESPN: MIN @ SF on Sun Nov 22 (final 10-35), and IND @ HOU on Thu Nov 19 (the first game in the list: it must never be picked by default)
const tm=(ha,ab,loc,nick,score)=>({homeAway:ha, score:String(score), team:{abbreviation:ab, location:loc, name:nick, displayName:loc+' '+nick, shortDisplayName:nick}});
const EV=[
  {id:'401IND', date:'2026-11-20T01:15:00Z', name:'Indianapolis Colts at Houston Texans', shortName:'IND @ HOU', status:{type:{state:'post', completed:true, shortDetail:'Final'}}, competitions:[{competitors:[tm('away','IND','Indianapolis','Colts',20), tm('home','HOU','Houston','Texans',23)]}]},
  {id:'401MIN', date:'2026-11-22T21:25:00Z', name:'Minnesota Vikings at San Francisco 49ers', shortName:'MIN @ SF', status:{type:{state:'post', completed:true, shortDetail:'Final'}}, competitions:[{competitors:[tm('away','MIN','Minnesota','Vikings',10), tm('home','SF','San Francisco','49ers',35)]}]},
];
const evOnDay=d=>EV.filter(e=>new Date(e.date).toLocaleDateString('en-CA',{timeZone:'America/Chicago'}).replace(/-/g,'')===d);
// the Worker's answers (as the slips / slip jobs return them)
const ML={book:'DK Predictions', kind:'single', status:'won', placedAt:'Nov 22, 2026 at 6:35:34 PM', stake:26.8, payout:40, pricePct:65, game:'MIN Vikings @ SF 49ers', finalScore:'MIN 10, SF 35', sport:'NFL', legs:[{team:'SF 49ers', market:'Moneyline', side:'SF 49ers'}], confidence:'high', unclear:[]};
const CMC={book:'DK Predictions', kind:'single', status:'won', placedAt:'Nov 22, 2026 at 6:56:35 PM', stake:26.65, payout:41, pricePct:63, game:'MIN Vikings @ SF 49ers', finalScore:'MIN 10, SF 35', sport:'NFL', legs:[{player:'Christian McCaffrey', team:'SF', market:'Anytime TD', line:0.5, side:'Over'}], confidence:'high', unclear:[]};
const PUR={book:'DK Predictions', kind:'single', status:'won', placedAt:'Nov 22, 2026 at 6:57:05 PM', stake:26.95, payout:49, pricePct:53, game:'MIN Vikings @ SF 49ers', finalScore:'MIN 10, SF 35', sport:'NFL', legs:[{player:'Brock Purdy', team:'SF', market:'Passing Touchdowns', line:1.5, side:'Over'}], confidence:'high', unclear:[]};
const THREE={bets:[ML,CMC,PUR], partial:1, unclear:[]};
const SLIP1={book:'DK Predictions', kind:'single', status:'won', placedAt:'Nov 22, 2026 at 6:35:34 PM', stake:26.8, odds:null, totalPayout:40, pricePct:65, game:'MIN Vikings @ SF 49ers', finalScore:'MIN 10, SF 35', sport:'NFL', legs:[{team:'SF 49ers', market:'Moneyline', side:'SF 49ers'}], confidence:'high', unclear:[], betsOnScreen:1};
let Q=[], SLIP=SLIP1; const CALLS=[];
async function worker(route){ const req=route.request(), u=new URL(req.url());
  if(u.pathname==='/ai/status') return route.fulfill({status:200, contentType:'application/json', body:JSON.stringify({setUp:true, spentToday:0.1, spentMonth:1, capDay:5, capMonth:90})});
  if(u.pathname==='/ai'){ if(req.method()==='OPTIONS') return route.fulfill({status:204, headers:{'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'POST, GET, OPTIONS'}});
    let body={}; try{ body=JSON.parse(req.postData()||'{}'); }catch(e){} CALLS.push({job:body.job, keys:Object.keys(body.input||{}), img:String((body.input||{}).image||'').slice(0,40)});
    const out=body.job==='slips'?(Q.length?Q.shift():THREE):SLIP;
    return route.fulfill({status:200, contentType:'application/json', body:JSON.stringify({ok:true, job:body.job, out, usd:0.01, spentToday:0.11, spentMonth:1.01})}); }
  return route.fulfill({status:200, contentType:'application/json', body:'{}'}); }
async function open(b, o){ o=o||{}; const ctx=await b.newContext({timezoneId:'America/Chicago', viewport:{width:o.w||1280, height:900}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(([on, pass, log])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.pass',pass); if(on) localStorage.setItem('mbev.ai.on','1');
    localStorage.setItem('mbev.ai.status', JSON.stringify({setUp:true, spentToday:0, spentMonth:0, capDay:5, capMonth:90, at:Date.now()})); localStorage.setItem('mbev.log', JSON.stringify(log||[])); }catch(e){} }, [o.on!==false, PASSW, o.log||[]]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/0xbeta\.dev/.test(u)) return worker(r);
    if(/espn/.test(u) && /scoreboard/.test(u)){ const d=new URL(u).searchParams.get('dates'); return r.fulfill({contentType:'application/json', body:JSON.stringify({events:d?evOnDay(d):EV, week:{number:12}})}); }
    if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(2500); return {ctx,p,errs}; }
const ev=async(p,fn,arg)=>{ try{ return await p.evaluate(fn,arg); }catch(e){ return {evalError:String(e.message||e).slice(0,300)}; } };
const toLog=async p=>{ await ev(p,()=>{ document.querySelector('.tab[data-view="v-log"]').click(); const d=document.querySelector('.lc-impbox'); d.open=true; }); await p.waitForTimeout(200); };
const waitMsg=async(p,re,ms)=>{ try{ await p.waitForFunction(r=>new RegExp(r).test(document.getElementById('lcImpMsg').textContent), re.source, {timeout:ms||8000}); }catch(e){} return ev(p,()=>document.getElementById('lcImpMsg').textContent); };
const rows=p=>ev(p,()=>[...document.querySelectorAll('#lcImpList .lc-shot')].map(b=>({t:b.textContent.replace(/\s+/g,' ').trim(), on:b.querySelector('.lc-on').checked, dis:b.querySelector('.lc-on').disabled, day:b.querySelector('.lc-day').value, book:b.querySelector('.lc-book').value, st:b.querySelector('.lc-st').value, ret:b.querySelector('.lc-ret').value, res:b.querySelector('.lc-res').value, paid:b.querySelector('.lc-paid').value, line:(b.querySelector('.lc-line')||{}).value})));
const nAi=job=>CALLS.filter(c=>c.job===job).length;
const SAVED=p=>ev(p,()=>logged.filter(b=>String(b.id).startsWith('imp-')).map(b=>({id:b.id, name:b.name, market:b.market, side:b.side, kind:b.kind, book:b.book, stake:b.stake, odds:b.odds, result:b.result, profit:betProfit(b), gradedBy:b.gradedBy, day:gameDayOf(b), placedAt:b.placedAt||null, game:b.game, sport:b.sport})));

(async()=>{ const t0=Date.now(); const b=await chromium.launch();
  // ===== 1. One picture, three DK Predictions trades =====
  let S=await open(b); await toLog(S.p);
  let st=await ev(S.p,()=>({acc:document.getElementById('lcFile').accept, mul:document.getElementById('lcFile').multiple}));
  check('1. the import box takes .json and pictures, several at once', /\.json/.test(st.acc) && /image\/\*/.test(st.acc) && st.mul===true, st);
  await S.p.setInputFiles('#lcFile', pic()); let m=await waitMsg(S.p,/Read 3 bets/);
  let R=await rows(S.p);
  check('1. one slips call, with only the picture (no log data)', nAi('slips')===1 && JSON.stringify(CALLS[0].keys.sort())===JSON.stringify(['image','mediaType']), CALLS);
  check('1. "Read 3 bets from 1 picture", the cut-off sentence, nothing saved yet', /^Read 3 bets from 1 picture\./.test(m) && /1 more bet was cut off at the screen edge: scroll and add another screenshot\./.test(m) && /Nothing is saved until you press Save/.test(m), m);
  check('1. three rows, all ticked, day 2026-11-22, book DK Predictions, cost 26.80 / 26.65 / 26.95, return 40 / 41 / 49, Won',
    R.length===3 && R.every(r=>r.on && !r.dis && r.day==='2026-11-22' && r.book==='DK Predictions' && r.res==='win') && R.map(r=>r.st).join()==='26.8,26.65,26.95' && R.map(r=>r.ret).join()==='40,41,49' && R.map(r=>r.paid).join()==='40,41,49', R);
  check('1. the 49ers moneyline, McCaffrey Over 0.5 Anytime TD, Purdy Over 1.5 Passing TDs, game MIN @ SF',
    /^SF 49ers Moneyline · MIN @ SF/.test((R[0]||{}).t) && /^Christian McCaffrey Over 0\.5 Anytime TD · MIN @ SF/.test((R[1]||{}).t) && /^Brock Purdy Over 1\.5 Passing TDs · MIN @ SF/.test((R[2]||{}).t) && (R[1]||{}).line==='0.5' && (R[2]||{}).line==='1.5' && (R[0]||{}).line===undefined, R.map(r=>r.t.slice(0,60)));
  check('1. each row shows what was read: Bought / paid / % / won / placed 6:35:34 PM CT / final score; odds −203 / −186 / −122; profit +13.20 / +14.35 / +22.05',
    /Bought \$26\.80 · paid \$40\.00 · 65% · won · placed Nov 22, 6:35:34 PM CT · MIN Vikings @ SF 49ers · final MIN 10, SF 35 · odds -203 · profit \+\$13\.20/.test((R[0]||{}).t) && /odds -186 · profit \+\$14\.35/.test((R[1]||{}).t) && /placed Nov 22, 6:56:35 PM CT/.test((R[1]||{}).t) && /odds -122 · profit \+\$22\.05/.test((R[2]||{}).t), R.map(r=>r.t));
  st=await ev(S.p,()=>({ls:Object.keys(localStorage).filter(k=>/[A-Za-z0-9+/]{200,}/.test(localStorage.getItem(k)||'')).filter(k=>!/mbev\.(cache|board|sb|espn)/.test(k)), n:logged.length}));
  check('1. the picture is kept nowhere (no long base64 in storage), nothing saved', st.n===0 && !st.ls.some(k=>/ai|lc|log/.test(k)), st);
  // layout at 1280
  st=await ev(S.p,()=>{ const de=document.documentElement, cw=de.clientWidth; return {sw:de.scrollWidth, cw, bad:[...document.querySelectorAll('#lcImpList .lc-shot, #lcImpDrop')].filter(e=>e.getBoundingClientRect().right>cw+1).length}; });
  check('1. 1280 px: the rows and the drop box fit', st.sw<=st.cw+1 && st.bad===0, st);
  await ev(S.p,()=>document.getElementById('lcImpSave').click()); await S.p.waitForTimeout(400);
  m=await ev(S.p,()=>document.getElementById('lcImpMsg').textContent); let V=await SAVED(S.p);
  check('1. Save: exactly 3 settled bets ("Saved 3 tickets")', /^Saved 3 tickets to your Bet log\./.test(m) && V.length===3, {m, n:V.length});
  check('1. saved as the book shows them: won, profit 13.20 / 14.35 / 22.05, odds -203 / -186 / -122, DK Predictions, NFL, MIN @ SF, game day 2026-11-22, gradedBy import',
    V.every(x=>x.result==='win' && x.gradedBy==='import' && x.book==='DK Predictions' && x.day==='2026-11-22' && x.sport==='NFL' && x.game==='MIN @ SF') && V.map(x=>x.profit).join()==='13.2,14.35,22.05' && V.map(x=>x.odds).join()==='-203,-186,-122' && V.map(x=>x.stake).join()==='26.8,26.65,26.95', V);
  check('1. the bets: SF 49ers Moneyline, McCaffrey O 0.5 Anytime TD, Purdy O 1.5 Passing TDs; placed 6:35:34 PM CT (00:35:34Z)',
    (V[0]||{}).name==='SF 49ers' && (V[0]||{}).kind==='moneyline' && (V[0]||{}).market==='Moneyline' && (V[1]||{}).name==='Christian McCaffrey' && (V[1]||{}).market==='0.5 Anytime TD' && (V[1]||{}).side==='O' && (V[2]||{}).market==='1.5 Passing TDs' && (V[0]||{}).placedAt==='2026-11-23T00:35:34.000Z' && (V[2]||{}).placedAt==='2026-11-23T00:57:05.000Z', V);
  // ===== 2. The same picture again → 0 new =====
  await S.p.setInputFiles('#lcFile', pic()); m=await waitMsg(S.p,/Read 3 bets/); R=await rows(S.p);
  check('2. the same picture again: "3 already in your Bet log (left out)", each row marked and not tickable', /3 already in your Bet log \(left out\)/.test(m) && R.length===3 && R.every(r=>!r.on && r.dis && /already in your Bet log/.test(r.t)), {m, R:R.map(r=>[r.on,r.dis])});
  await ev(S.p,()=>document.getElementById('lcImpSave').click()); await S.p.waitForTimeout(300); V=await SAVED(S.p);
  check('2. Save saves 0 more (still 3)', V.length===3, V.length);
  // 390 px with rows on screen
  await S.p.setViewportSize({width:390, height:900}); await S.p.setInputFiles('#lcFile', pic()); await waitMsg(S.p,/Read 3 bets/); await S.p.waitForTimeout(200);
  st=await ev(S.p,()=>{ const de=document.documentElement, cw=de.clientWidth; return {sw:de.scrollWidth, cw, bad:[...document.querySelectorAll('#lcImpList .lc-shot, #lcImpList .lc-shot input, #lcImpList .lc-shot select, #lcImpDrop')].filter(e=>e.getClientRects().length && e.getBoundingClientRect().right>cw+1).map(e=>e.className)}; });
  check('2. 390 px: the rows, their boxes and the drop box fit the screen', st.sw<=st.cw+1 && !st.bad.length, st);
  check('1-2. no page errors', !S.errs.length, S.errs); await S.ctx.close();

  // ===== 3. The hand-made agent-notes file, then the picture → 0 new; a .json still imports as before =====
  S=await open(b); await toLog(S.p); let c0=nAi('slips');
  const DOC=fs.readFileSync(path.join(__dirname,'..','agent-notes','dk-predictions-2026-11-22_import.json'));
  await S.p.setInputFiles('#lcFile', {name:'dk.json', mimeType:'application/json', buffer:DOC}); await S.p.waitForTimeout(400);
  m=await ev(S.p,()=>document.getElementById('lcImpMsg').textContent);
  check('3. a .json file still reads as before ("3 singles and 0 parlays read")', /^3 singles and 0 parlays read\. Check them, then save\./.test(m) && nAi('slips')===c0, m);
  await ev(S.p,()=>document.getElementById('lcImpSave').click()); await S.p.waitForTimeout(400); V=await SAVED(S.p);
  check('3. the file saves its 3 bets', V.length===3 && V.every(x=>x.id.startsWith('imp-alonzo-dkp')), V.map(x=>x.id));
  await S.p.setInputFiles('#lcFile', pic()); m=await waitMsg(S.p,/Read 3 bets/); R=await rows(S.p);
  check('3. then the picture: all 3 already in your Bet log (Anytime TD Scorer = Anytime TD, Passing Touchdowns = Passing TDs), none tickable', /3 already in your Bet log/.test(m) && R.every(r=>r.dis && !r.on), {m, R:R.map(r=>r.t.slice(0,80))});
  await ev(S.p,()=>document.getElementById('lcImpSave').click()); await S.p.waitForTimeout(300); V=await SAVED(S.p);
  check('3. 0 new (still 3)', V.length===3, V.length);
  check('3. no page errors', !S.errs.length, S.errs); await S.ctx.close();

  // ===== 4. Two overlapping pictures → no duplicate =====
  S=await open(b); await toLog(S.p); c0=nAi('slips');
  Q=[{bets:[ML,CMC], partial:0, unclear:[]}, {bets:[Object.assign({},CMC,{stake:26.6, placedAt:'Nov 22, 2026 at 6:56:35 PM'}), PUR], partial:0, unclear:[]}];
  await S.p.setInputFiles('#lcFile', [pic(1), pic(2)]); m=await waitMsg(S.p,/Read 3 bets/); R=await rows(S.p);
  check('4. two overlapping pictures: 2 calls, 3 rows, "1 read twice (shown once)"', nAi('slips')===c0+2 && R.length===3 && /^Read 3 bets from 2 pictures · 1 read twice \(shown once\)/.test(m), {m, n:R.length});
  check('4. no page errors', !S.errs.length, S.errs); await S.ctx.close();
  // ===== 5. An unclear stake blocks the row until it is fixed; an unknown result too =====
  S=await open(b); await toLog(S.p);
  Q=[{bets:[Object.assign({},PUR,{stake:undefined, unclear:['stake']}), Object.assign({},CMC,{status:'unknown', payout:undefined})], partial:0, unclear:[]}];
  await S.p.setInputFiles('#lcFile', pic(3)); await waitMsg(S.p,/need a fix/); R=await rows(S.p);
  const fresh=R.slice(-2);
  m=await ev(S.p,()=>[...document.querySelectorAll('#lcImpList .lc-shot')].slice(-2).map(b=>({need:b.querySelector('.lc-need').textContent, hid:b.querySelector('.lc-need').hidden, unc:!!b.querySelector('label.lc-unc .lc-st'), warn:(b.querySelector('.ai-warn')||{}).textContent||''})));
  check('5. the bet with no stake read: not tickable, "Fill in the cost", the Cost box marked ⚠ and "Not clear on the screenshot: stake"', (fresh[0]||{}).dis && !(fresh[0]||{}).on && /^Fill in the cost to import this one\.$/.test((m[0]||{}).need) && !(m[0]||{}).hid && (m[0]||{}).unc && /stake/.test((m[0]||{}).warn), {fresh:fresh[0], m:m[0]});
  check('5. the bet with an unknown result: not tickable until a result is chosen ("Fill in the result")', (fresh[1]||{}).dis && (fresh[1]||{}).res==='?' && /the result/.test((m[1]||{}).need), {r:fresh[1], m:m[1]});
  await ev(S.p,()=>document.getElementById('lcImpSave').click()); await S.p.waitForTimeout(300);
  V=await SAVED(S.p); m=await ev(S.p,()=>document.getElementById('lcImpMsg').textContent);
  check('5. Save leaves the two blocked rows out (0 saved, 2 left out)', V.length===0 && /2 left out/.test(m), {n:V.length, m});
  check('5. no bet without a stake was saved', V.every(x=>x.stake>0), V.map(x=>x.stake));
  await S.ctx.close();
  S=await open(b); await toLog(S.p);
  Q=[{bets:[Object.assign({},PUR,{stake:undefined, payout:49, unclear:['stake']})], partial:0, unclear:[]}];
  await S.p.setInputFiles('#lcFile', pic(4)); await waitMsg(S.p,/need a fix/);
  await S.p.fill('#lcImpList .lc-shot .lc-st','26.95'); await S.p.fill('#lcImpList .lc-shot .lc-ret','49'); await S.p.waitForTimeout(100); R=await rows(S.p);
  check('5. typed the cost and the return: the row becomes tickable and ticked', (R[0]||{}).on && !(R[0]||{}).dis, R[0]);
  await ev(S.p,()=>document.getElementById('lcImpSave').click()); await S.p.waitForTimeout(300); V=await SAVED(S.p);
  check('5. then it saves: Purdy, won, cost 26.95, profit 22.05', V.length===1 && (V[0]||{}).stake===26.95 && (V[0]||{}).profit===22.05 && (V[0]||{}).result==='win', V);
  check('5. no page errors', !S.errs.length, S.errs); await S.ctx.close();

  // ===== 6. AI off / Worker paused → no call and the plain sentence; Easy → nothing =====
  S=await open(b,{on:false}); await toLog(S.p); let n0=CALLS.length;
  await S.p.setInputFiles('#lcFile', pic()); await S.p.waitForTimeout(400); m=await ev(S.p,()=>document.getElementById('lcImpMsg').textContent);
  check('6. AI off: "Turn on the AI helper in Settings to read screenshots." and no call', m==='Turn on the AI helper in Settings to read screenshots.' && CALLS.length===n0, m); await S.ctx.close();
  S=await open(b); await toLog(S.p); n0=CALLS.length; await ev(S.p,()=>wkPause(10*60e3,'the Worker answered 429 (too many requests)'));
  await S.p.setInputFiles('#lcFile', pic()); await S.p.waitForTimeout(400); m=await ev(S.p,()=>document.getElementById('lcImpMsg').textContent);
  check('6. Worker paused: says so ("Your Worker is paused until … Nothing was sent") and no call', /^Your Worker is paused until .+\. Nothing was sent: add the screenshot again after that\.$/.test(m) && CALLS.length===n0, m);
  await ev(S.p,()=>{ const w=wkState(); w.pause=0; wkSave(); easySetLevel('easy'); }); await S.p.waitForTimeout(300); n0=CALLS.length;
  st=await ev(S.p,async()=>{ const before=document.getElementById('lcImpMsg').textContent; const blob=await (await fetch('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==')).blob();
    await lcShotRun([new File([blob],'x.png',{type:'image/png'})]); const d=document.getElementById('lcImpDrop'); return {same:document.getElementById('lcImpMsg').textContent===before, vis:!!(d&&d.getClientRects().length)}; });
  check('6. Easy: no import box on screen, and a picture does nothing (no call, no message)', st.same && !st.vis && CALLS.length===n0, st);
  check('6. no page errors', !S.errs.length, S.errs); await S.ctx.close();

  // ===== 7. + Add a bet › Read slip: the 49ers trade preloads correctly =====
  const openAdd=async p=>{ await ev(p,()=>{ const t=document.querySelector('.tab[data-view="v-add"]'); if(t) t.click(); const P=document.getElementById('addBetPanel'); P.open=true; P.dispatchEvent(new Event('toggle')); }); await p.waitForTimeout(1500); };
  const readSlip=async p=>{ await ev(p,async()=>{ const blob=await (await fetch('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==')).blob(); await aiSlipRead(new File([blob],'s.png',{type:'image/png'})); });
    await ev(p,async()=>{ const u=document.getElementById('aiSlipUse'); if(u){ u.click(); } }); await p.waitForTimeout(1800); };
  const form=p=>ev(p,()=>{ const g=id=>document.getElementById(id), ed=document.querySelector('#abHost .editor'), q=c=>ed&&ed.querySelector(c), sel=g('abGame'), bs=q('.eb-book');
    return {sport:g('abSport').value, type:g('abType').value, game:sel.value, gameTxt:sel.selectedOptions[0]?sel.selectedOptions[0].textContent:'', first:sel.options[0]&&sel.options[0].value, free:g('abGameFree').value, date:g('abDate').value, team:g('abTeam').value, teamDisp:g('abTeam').style.display,
      book:bs&&bs.value, bookTxt:bs&&bs.selectedOptions[0]&&bs.selectedOptions[0].textContent, dkTxt:bs&&[...bs.options].filter(o=>o.value==='DraftKings').map(o=>o.textContent)[0], note:(ed&&ed.querySelector('.ab-bknote')&&!ed.querySelector('.ab-bknote').hidden)?ed.querySelector('.ab-bknote').textContent:'',
      mode:q('.eb-mode')&&q('.eb-mode').value, cost:q('.eb-cost')&&q('.eb-cost').value, pct:q('.eb-pct')&&q('.eb-pct').value, pays:q('.eb-win')&&q('.eb-win').value, odds:q('.eb-odds')&&q('.eb-odds').value, tot:q('.eb-tot-o')&&q('.eb-tot-o').value, result:g('abResult').value, placed:g('abPlaced').value,
      unc:[...document.querySelectorAll('#addBetPanel .ai-unclear')].map(e=>(e.querySelector('label')||e).textContent.trim().slice(0,20)), msg:g('aiSlipOut').textContent}; });
  S=await open(b); await openAdd(S.p); SLIP=SLIP1; await readSlip(S.p); let F=await form(S.p);
  check('7. the slip job was called once', nAi('slip')===1, nAi('slip'));
  check('7. (a) the game is MIN @ SF on Sun Nov 22 (found by its teams, not the first game IND @ HOU)', F.game==='401MIN' && /^MIN @ SF/.test(F.gameTxt) && F.date==='2026-11-22' && F.free==='' && F.sport==='NFL' && F.type==='moneyline', F);
  check('7. (b) the team is SF', F.team==='SF', F.team);
  check('7. (c) the book is DK Predictions, shown as "DK Predictions (exchange · price in %)", DraftKings as "DraftKings (sportsbook)", with the exchange line under it', F.book==='DraftKings Predictions' && F.bookTxt==='DK Predictions (exchange · price in %)' && F.dkTxt==='DraftKings (sportsbook)' && /DK Predictions is the DraftKings exchange, not the DraftKings sportsbook/.test(F.note), F);
  check('7. (d)(e) the price: % mode, Cost 26.80 @ 65%, Pays back 40.00 (and the odds box -203, never 0; Total payout 40.00)', F.mode==='pct' && F.cost==='26.80' && F.pct==='65' && F.pays==='40.00' && F.odds==='-203' && F.tot==='40.00', F);
  check('7. (f) the result is Won; placed at 6:35 PM (Central); only the game marked ⚠ (round 2, F2: found from the placed day, no game date printed)', F.result==='win' && F.placed==='2026-11-22T18:35' && F.unc.length===1 && /^Game/.test(F.unc[0]), F);
  await S.p.click('#abHost .eb-save'); await S.p.waitForTimeout(900);
  V=await ev(S.p,()=>{ const L=logged[logged.length-1]; return L?{book:L.book, result:L.result, stake:L.stake, profit:betProfit(L), game:L.game, team:L.team, name:L.name, day:gameDayOf(L), kind:L.kind}:null; });
  check('7. Save: a won DK Predictions bet on SF, MIN @ SF, Nov 22, cost 26.80, profit +13.20 (paid − cost)', V && V.book==='DraftKings Predictions' && V.result==='win' && V.stake===26.8 && Math.abs(V.profit-13.2)<0.005 && V.game==='MIN @ SF' && V.team==='SF' && V.day==='2026-11-22' && V.kind==='moneyline', V);
  // a game that is not on ESPN: empty with ⚠, the matchup typed; a DraftKings card with a % price → DK Predictions, marked ⚠
  SLIP=Object.assign({}, SLIP1, {book:'DraftKings', game:'NYJ Jets @ MIA Dolphins', finalScore:'', legs:[{team:'NYJ Jets', market:'Moneyline', side:'NYJ Jets'}]}); await readSlip(S.p); F=await form(S.p);
  check('7. no matching game: the game is empty (not the first in the list), "NYJ @ MIA" typed in Not listed?, marked ⚠; game day from the placed date', F.game==='' && F.first==='' && F.free==='NYJ @ MIA' && F.date==='2026-11-22' && F.unc.some(x=>/^Game/.test(x)), F);
  check('7. "DraftKings" with a % price → DK Predictions, marked ⚠ (unsure)', F.book==='DraftKings Predictions' && F.unc.some(x=>/^Book/.test(x)), F);
  check('7. no matching game: the team is the one read (NYJ), never the first team of the first game', F.team==='NYJ', F);
  // three bets in one picture → Bet log › Import
  SLIP=Object.assign({}, SLIP1, {betsOnScreen:3}); n0=nAi('slips');
  await ev(S.p,async()=>{ const blob=await (await fetch('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==')).blob(); await aiSlipRead(new File([blob],'s.png',{type:'image/png'})); });
  m=await ev(S.p,()=>document.getElementById('aiSlipOut').textContent);
  check('7. a picture with 3 bets: "This picture has 3 bets: open Bet log › Import to add them all."', /This picture has 3 bets: open Bet log › Import to add them all\./.test(m), m);
  await ev(S.p,()=>document.getElementById('aiSlipToImp').click()); m=await waitMsg(S.p,/Read 3 bets/);
  st=await ev(S.p,()=>({view:document.body.dataset.view, open:document.querySelector('.lc-impbox').open}));
  check('7. Open Bet log › Import: the Bet log, the import box open, the same picture read there (3 rows)', st.view==='v-log' && st.open && nAi('slips')===n0+1 && /^Read 3 bets from 1 picture/.test(m), {st, m});
  check('7. no page errors', !S.errs.length, S.errs); await S.ctx.close();
  // ===== R2 (review round 2) =====
  // F1: a second real buy of the same trade (7:40 PM next to the logged 6:57 PM) is a new bet; two cards of one picture are two bets
  S=await open(b); await toLog(S.p);
  await S.p.setInputFiles('#lcFile', pic()); await waitMsg(S.p,/Read 3 bets/); await ev(S.p,()=>document.getElementById('lcImpSave').click()); await S.p.waitForTimeout(400);
  const PUR2=Object.assign({},PUR,{stake:27.1, placedAt:'Nov 22, 2026 at 7:40:12 PM'});
  Q=[{bets:[PUR2], partial:0, unclear:[]}]; await S.p.setInputFiles('#lcFile', pic(5)); m=await waitMsg(S.p,/Read 1 bet/); R=await rows(S.p);
  check('R2 F1. a second buy of the Purdy trade (27.10 at 7:40 PM, the 6:57 PM one logged) is not "already in your Bet log" and is ticked', R.length===1 && R[0].on && !R[0].dis && !/already/.test(R[0].t) && !/already/.test(m), {m, R});
  await ev(S.p,()=>document.getElementById('lcImpSave').click()); await S.p.waitForTimeout(400); V=await SAVED(S.p);
  check('R2 F1. it saves: 4 bets, two Purdy buys', V.length===4 && V.filter(x=>x.name==='Brock Purdy').length===2, V.map(x=>[x.name,x.stake]));
  Q=[{bets:[PUR, Object.assign({},PUR,{placedAt:'Nov 22, 2026 at 7:40:12 PM'})], partial:0, unclear:[]}]; await S.p.setInputFiles('#lcFile', pic(6)); m=await waitMsg(S.p,/Read 2 bets/); R=await rows(S.p);
  check('R2 F1. two cards of one picture (same trade, 6:57 and 7:40 PM): 2 rows, none "read twice"', R.length===2 && !/read twice/.test(m), {m, n:R.length});
  check('R2 F1. the 6:57 PM one is already in the log, the 7:40 PM one too (just saved)', R.every(r=>/already in your Bet log/.test(r.t)), R.map(r=>r.t.slice(0,90)));
  // F3: a won trade with no payout read needs what it paid back before it can be ticked
  Q=[{bets:[Object.assign({},ML,{payout:undefined, placedAt:'Nov 22, 2026 at 8:10:00 PM'})], partial:0, unclear:[]}]; await S.p.setInputFiles('#lcFile', pic(7)); await waitMsg(S.p,/Read 3 bets/); R=(await rows(S.p)).slice(-1);
  let nd=await ev(S.p,()=>{ const b=[...document.querySelectorAll('#lcImpList .lc-shot')].pop(); return {need:b.querySelector('.lc-need').textContent, unc:!!b.querySelector('label.lc-unc .lc-paid')}; });
  check('R2 F3. a won trade with no payout read (return from the %): not tickable, "Fill in what it paid back", Paid back marked ⚠', R[0] && R[0].dis && !R[0].on && R[0].paid==='' && /what it paid back/.test(nd.need) && nd.unc, {R, nd});
  await S.p.locator('#lcImpList .lc-shot').last().locator('.lc-paid').fill('40'); await S.p.waitForTimeout(100); R=(await rows(S.p)).slice(-1);
  check('R2 F3. typed Paid back 40: ticked', R[0].on && !R[0].dis, R[0]);
  await ev(S.p,()=>document.getElementById('lcImpSave').click()); await S.p.waitForTimeout(400); V=await SAVED(S.p);
  const ml8=V.find(x=>x.placedAt==='2026-11-23T02:10:00.000Z');
  check('R2 F3. saved with what the book paid: odds -203, profit +13.20 (not -186 / +14.43 from the %)', ml8 && ml8.odds==='-203' && ml8.profit===13.2, ml8);
  // F6: the year nearest the placed date, or today
  const yr=await ev(S.p,()=>({a:aiBetDay({placedAt:'Dec 31, 2026 at 7:00 PM', gameDate:'Sun, Jan 3'}).day, b:aiWhenCT('Dec 30 8:00 PM', Date.parse('2027-01-02T18:00:00Z')).day, c:aiWhenCT('Nov 22 6:35 PM').day, d:aiWhenCT('Nov 22, 2026 at 6:35 PM', Date.parse('2028-06-01T00:00:00Z')).day}));
  check('R2 F6. Dec 31, 2026 + "Sun, Jan 3" → 2027-01-03; "Dec 30" read Jan 2, 2027 → 2026-12-30; a printed year is kept', yr.a==='2027-01-03' && yr.b==='2026-12-30' && yr.c==='2026-11-22' && yr.d==='2026-11-22', yr);
  check('R2 no page errors', !S.errs.length, S.errs); await S.ctx.close();
  // F2: Read slip never picks a game that ended before the bet was placed
  S=await open(b); await openAdd(S.p);
  SLIP=Object.assign({}, SLIP1, {placedAt:'Nov 23, 2026 at 9:05 AM', finalScore:''}); await readSlip(S.p); F=await form(S.p);
  check('R2 F2. placed Mon 9:05 AM, MIN @ SF was Sun 3:25 PM: the game is left empty with ⚠ (not the finished game)', F.game==='' && F.unc.some(x=>/^Game/.test(x)), F);
  check('R2 F2. no page errors', !S.errs.length, S.errs); await S.ctx.close();
  await b.close(); console.log('\n'+pass+' passed, '+fail+' failed ('+Math.round((Date.now()-t0)/1000)+' s)'); process.exit(fail?1:0); })();
