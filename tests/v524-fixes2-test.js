// v5.24 (step 5): the second-pass review fixes. Every check here fails on the step 4 build (2145c0a) and passes now.
// Sections: 1 What filled? through several stops (S1-1, N2), 2 the row a pick showed is the row that is saved (S1-2), 3 an open form survives repaints, price moves and a game start (S1-3, N6),
// 4 the true cause when nothing can be sized (N1), 5 What filled? defaults, refusals and sanity limits (N4, N5), 6 Remove, Undo under a full storage, the save-failure banner, Not now (S2-1, S2-2, S3),
// 7 words (the price rule, Polymarket team text, the moved card), 8 the customer build’s first frame (reg2 S2). Boots the practice copy (tests/practice-copy.js, Sunday 2026-11-15 12:00 PM CT).
const path=require('path'), fs=require('fs');
const { chromium } = require('playwright');
const html=fs.readFileSync(process.argv[2]||path.join(__dirname,'..','index.html'),'utf8');
const K=require('./v524-easy-kit.js')(html);
const T=K.mk(), check=T.check, tx=K.T;
const cust=html.replace('const DEV_APP=true','const DEV_APP=false'); if(cust===html) throw new Error('the DEV_APP flag was not found');
const open=async(b,W,H,o)=>{ const A=await K.open(b,W||1280,H||900,o); A.page.setDefaultTimeout(6000); await A.page.evaluate(()=>{ window.tx=s=>String(s||'').replace(/\s+/g,' ').trim(); }); return A; };   // tx also exists in the page
const LIVE=(price,delay)=>async route=>{ const u=new URL(route.request().url()); let bets=[]; try{ bets=JSON.parse(u.searchParams.get('bets')||'[]'); }catch(e){}
  const R={}; bets.forEach(d=>{ R[d.id]={ok:true, src:d.book, price, bid:+(price-0.01).toFixed(3), ask:price, title:d.name, ref:'LIVE-'+d.id, at:new Date().toISOString(), outcome:d.book==='novig'?'out-1':undefined}; });
  if(delay) await new Promise(x=>setTimeout(x,delay));
  await route.fulfill({status:200, contentType:'application/json', headers:{'access-control-allow-origin':'*','access-control-allow-credentials':'true','access-control-allow-headers':'*'}, body:JSON.stringify({at:new Date().toISOString(), results:R})}); };
const isLive=u=>/0xbeta|workers\.dev/.test(u.hostname)&&u.pathname==='/live';
const EX={practice:{rows:K.EXROWS}};
// the Polymarket US pick: open its page and its What filled? form
async function fillOpen(b, W, H, delay){ const A=await open(b,W,H,EX), p=A.page; await A.ctx.route(isLive, LIVE(0.57, delay||200));
  const k=await p.evaluate(()=>{ const x=easyList().picks.find(q=>q.book==='Polymarket US'); ezS().key=x.key; easyPaintToday(); return x.key; });
  await p.click('#ezPlaced'); await p.waitForSelector('#ezHost .ez-fillf'); await p.waitForTimeout(300); return {A,p,k}; }
const S=async fn=>{ try{ await fn(); }catch(e){ T.fail++; console.log('FAIL (a step crashed)  → '+String(e&&e.message).split('\n')[0].slice(0,200)); } };   // a crashing step is one failure, and the rest still run
const tapFill=async(p, ms)=>{ await p.click('#ezFSave'); await p.waitForTimeout(ms||1300); };
const fillState=p=>p.evaluate(()=>({n:logged.length, ad:logged.filter(x=>x.name==='Anthony Davis').length, note:tx((document.getElementById('ezFNote')||{}).innerText), conf:!!document.querySelector('#ezPick .ez-conf'), confText:tx((document.querySelector('#ezPick .ez-conf')||{}).innerText)}));

(async()=>{
 const b=await chromium.launch();

 // ---------- 1. What filled? through several stops ----------
 await S(async()=>{ const {A,p,k}=await fillOpen(b,1280,900);
   await p.evaluate(key=>{ const c=cfgRead(), used=((dayStats()[gameDayOf(easyRowByKey(key))]||{}).staked)||0; document.getElementById('dayMaxPct').value=String((used+3)/c.bank*100); }, k);
   await p.fill('#ezFSh','16'); await p.fill('#ezFPx','62');
   const n0=(await fillState(p)).n; await tapFill(p); const t1=await fillState(p); await tapFill(p); const t2=await fillState(p);
   check('1a (S1-1, N2): a fill above her most AND past the daily max: the first Save says which limit (the daily limit) and saves nothing', t1.n===n0 && /Daily limit reached/.test(t1.note) && /Nothing was saved yet/.test(t1.note), t1.note);
   check('1b (S1-1, N2): the second Save (“If it really filled, tap again”) saves the fill: one bet, the confirmation, and it says which limits were passed', t2.n===n0+1 && t2.ad===1 && t2.conf && /went past the daily limit/.test(t2.confText) && /the most La Contadora would pay/.test(t2.confText), {t2:t2.confText.slice(0,300), n:[n0,t2.n]});
   check('1c: the bet saved is the typed fill (16 shares at 62 cents), one copy', await p.evaluate(()=>{ const x=logged.find(q=>q.name==='Anthony Davis'); return !!x && Math.abs(x.stake-easyFillMath(easyRowByKey(window._ezS.key)||lastRows.find(r=>r.name==='Anthony Davis'),16,62).cost)<0.006; }), t2.n);
   check('1d: no page errors', A.errors.length===0, A.errors); await A.ctx.close(); });
 await S(async()=>{ const {A,p,k}=await fillOpen(b,1280,900);   // three stops in a row: the risk limit, the daily limit, a price above her most
   await p.evaluate(key=>{ const c=cfgRead(), r=easyRowByKey(key), used=((dayStats()[gameDayOf(r)]||{}).staked)||0; document.getElementById('dayMaxPct').value=String((used+3)/c.bank*100); r.flags.push(['warn','outlier limit reached (5 a day) — skip']); }, k);
   await p.fill('#ezFSh','16'); await p.fill('#ezFPx','62'); const n0=(await fillState(p)).n; await tapFill(p); const t1=await fillState(p); await tapFill(p); const t2=await fillState(p);
   check('1e (S1-1): three stops in a row (risk limit, daily limit, a price above her most): the first tap names the first one, the second tap saves, once', t1.n===n0 && /riskier/.test(t1.note) && t2.n===n0+1 && t2.ad===1 && /riskier picks today/.test(t2.confText) && /the daily limit/.test(t2.confText), {t1:t1.note, t2:t2.confText.slice(0,260)});
   await A.ctx.close(); });
 await S(async()=>{ const {A,p,k}=await fillOpen(b,1280,900);   // only a price above her most: it was warned about on screen, so one tap saves
   await p.fill('#ezFSh','16'); await p.fill('#ezFPx','62'); const n0=(await fillState(p)).n; await tapFill(p); const t1=await fillState(p);
   check('1f: a price above her most alone (warned on screen) still saves on the first tap, and the confirmation says only that (not the daily limit)', t1.n===n0+1 && t1.conf && /went past the most La Contadora would pay/.test(t1.confText) && !/daily limit|riskier/.test(t1.confText), t1.confText.slice(0,300)); await A.ctx.close(); });

 // ---------- 2. the row a pick showed is the row that is saved ----------
 for (const variant of ['hidden','approved']) await S(async()=>{ const A=await open(b,1280,900), p=A.page;
   const pre=await p.evaluate(v=>{ const L=easyList(), x=L.picks.find(q=>!ezIsEx(q)), other=BET_BOOKS.find(bk=>bk!==x.r.book && !/kalshi|poly|novig/i.test(bk));
     let dup; if(v==='hidden') dup=Object.assign({}, x.r, {book:other, offeredRaw:'-900', offeredProb:toProb('-900'), idx:-5, stake:0});
     else { const am=Math.round(americanOf(x.r.offeredProb))-4; dup=Object.assign({}, x.r, {book:other, idx:-6, offeredRaw:String(am), offeredProb:toProb(String(am)), actNet:x.r.actNet-0.004}); }
     lastRows.unshift(dup); const shown=easyList().picks.find(q=>q.key===x.key); ezS().key=x.key; easyPaintToday();
     return {key:x.key, shownBook:shown.r.book, shownPrice:shown.r.offeredRaw, dupBook:other, dupFirst:easyRowByKey(x.key)===dup}; }, variant);
   await p.waitForTimeout(300); await p.click('#ezPlaced'); let conf=true; try{ await p.waitForSelector('#ezPick .ez-conf',{timeout:9000}); }catch(e){ conf=false; }
   const R=await p.evaluate(()=>{ const x=logged[logged.length-1]; return {n:logged.length, book:x&&x.book, odds:x&&x.odds, conf:tx((document.querySelector('#ezPick .ez-conf')||{}).innerText||'')}; });
   check('2'+(variant==='hidden'?'a':'b')+' (S1-2): a second book’s row of the same prop sits first in the board ('+variant+'): I placed it saves the book and price the pick page showed ('+pre.shownBook+' '+pre.shownPrice+'), never the other row', pre.dupFirst && conf && R.book===pre.shownBook && String(R.odds).replace('+','')===String(pre.shownPrice).replace('+',''), {pre, R:{book:R.book, odds:R.odds}});
   await A.ctx.close(); });
 await S(async()=>{ const A=await open(b,1280,900,EX), p=A.page; await A.ctx.route(isLive, LIVE(0.57,200));
   const R=await p.evaluate(async()=>{ const x=easyList().picks.find(q=>q.book==='Polymarket US'); const dup=Object.assign({}, x.r, {book:'Kalshi', idx:99}); lastRows.unshift(dup);
     const res=await easyFillSave(x.key, 10, 57); const bt=res.saved?logged.find(z=>z.id===res.id):null; return {res:{saved:res.saved, reason:res.reason}, book:bt&&bt.book}; });
   check('2c (S1-2): What filled? for a prop read at Polymarket US and Kalshi saves the Polymarket US fill the pick showed', R.res.saved && /polymarket/i.test(R.book), R);
   const G=await p.evaluate(async()=>{ const L=easyList(), x=L.picks.find(q=>!ezIsEx(q)), n0=logged.length; lastRows.splice(lastRows.indexOf(x.r),1);
     const other=BET_BOOKS.find(bk=>bk!==x.r.book && !/kalshi|poly|novig/i.test(bk)); const dup=Object.assign({}, x.r, {book:other, idx:-8, offeredRaw:'-250', offeredProb:toProb('-250')}); lastRows.unshift(dup);
     const res=await easyPlacedSave(x.key,{pick:x}); return {res:{saved:res.saved, reason:res.reason}, n:logged.length-n0}; });
   check('2d (S1-2): the pick’s own row is gone and only another book’s row of the same prop is on the board: nothing is saved (the pick changed), never the other book', !G.res.saved && G.res.reason==='gone' && G.n===0, G);
   check('2e: no page errors', A.errors.length===0, A.errors); await A.ctx.close(); });

 // ---------- 3. an open form survives repaints, price moves and a game start ----------
 await S(async()=>{ const {A,p,k}=await fillOpen(b,390,844);   // phone: the price moves past her most while What filled? is open
   await p.fill('#ezFSh','11'); await p.fill('#ezFPx','58');
   const vis=()=>p.evaluate(()=>{ const e=document.getElementById('ezFSave'); const R=e?e.getBoundingClientRect():null; const top=R&&R.width?document.elementFromPoint(R.left+R.width/2, R.top+R.height/2):null;
     return {rects:e?e.getClientRects().length:0, onTop:!!(top && e && (top===e || e.contains(top))), pane:getComputedStyle(document.getElementById('ezPick')).display, ovl:document.getElementById('v-etoday').classList.contains('ez-ovl'), sh:(document.getElementById('ezFSh')||{}).value, note:tx((document.getElementById('ezNote')||{}).innerText)}; });
   await p.evaluate(key=>{ const r=easyRowByKey(key); r.offeredProb=0.66; r.offeredRaw='-194'; easyPaintToday(); }, k); await p.waitForTimeout(300);
   const v1=await vis();
   check('3a (S1-3): the pick leaves the list (price past her most) while What filled? is open: the form stays on screen with what was typed, and the Save button can be tapped', v1.rects>0 && v1.onTop && v1.pane!=='none' && v1.ovl && v1.sh==='11', v1);
   check('3b (S1-3): the pane says, calmly, that the price changed', /The price changed/.test(v1.note) && /record what you placed/.test(v1.note), v1.note);
   const n0=(await fillState(p)).n; await tapFill(p,1500); if(!(await fillState(p)).conf) await tapFill(p,1500); const t=await fillState(p);
   check('3c (S1-3): it still records what filled (one bet)', t.n===n0+1 && t.conf, t.confText.slice(0,160)); await A.ctx.close(); });
 await S(async()=>{ const A=await open(b,390,844), p=A.page; await A.ctx.route(isLive, LIVE(0.57,200));   // phone: the full form of a sportsbook pick, then the price moves
   await p.evaluate(()=>{ const x=easyList().picks.find(q=>q.r.name==='Luka Doncic'); ezS().key=x.key; easyPaintToday(); const r=gN('Luka Doncic'); r.offeredRaw='-400'; r.offeredProb=toProb('-400'); });
   await p.waitForTimeout(250); await p.click('#ezPlaced'); await p.waitForSelector('#ezHost .editor .eb-save',{timeout:9000}); await p.waitForTimeout(250);
   await p.evaluate(()=>{ const r=gN('Luka Doncic'); r.offeredRaw='-900'; r.offeredProb=toProb('-900'); refresh(); easyPaintToday(); }); await p.waitForTimeout(300);
   const v=await p.evaluate(()=>{ const e=document.querySelector('#ezHost .editor .eb-save'); const R=e?e.getBoundingClientRect():null; return {rects:e?e.getClientRects().length:0, pane:getComputedStyle(document.getElementById('ezPick')).display, ovl:document.getElementById('v-etoday').classList.contains('ez-ovl'), note:tx((document.getElementById('ezNote')||{}).innerText)}; });
   check('3d (S1-3): a sportsbook pick’s full form also stays open on a phone when the pick leaves the list, with the calm price line', v.rects>0 && v.pane!=='none' && v.ovl && /The price changed/.test(v.note), v);
   for(let i=0;i<3;i++){ if(!(await p.$('#ezHost .editor .eb-save'))) break; await p.click('#ezHost .editor .eb-save'); await p.waitForTimeout(350); }
   check('3e (S1-3): and its Save still records the bet', !!(await p.$('#ezPick .ez-conf')), null); await A.ctx.close(); });
 await S(async()=>{ const {A,p,k}=await fillOpen(b,1280,900);   // the game starts while the form is open (30 minutes ago): it can still be recorded, and it says so
   await p.fill('#ezFSh','11'); await p.fill('#ezFPx','57');
   await p.evaluate(key=>{ const r=easyRowByKey(key); Object.assign(r.gameInfo, {startISO:new Date(Date.now()-30*60e3).toISOString(), state:'in'}); easyPaintToday(); }, k); await p.waitForTimeout(300);
   const note=await p.evaluate(()=>tx((document.getElementById('ezNote')||{}).innerText)), still=await p.$('#ezFSave');
   check('3f (N6): the game starts while the form is open: the form stays and says so calmly', !!still && /The game has started/.test(note) && /4 hours/.test(note), note);
   const n0=(await fillState(p)).n; await tapFill(p,1500); if(!(await fillState(p)).conf) await tapFill(p,1500); const t=await fillState(p);
   check('3g (N6): a fill typed after the start (started 30 minutes ago) is saved, and the confirmation says the game had started', t.n===n0+1 && t.conf && /already started/.test(t.confText), t.confText.slice(0,260)); await A.ctx.close(); });
 await S(async()=>{ const {A,p,k}=await fillOpen(b,1280,900);   // started 5 hours ago: refused, calmly, with the typed values kept
   await p.fill('#ezFSh','13'); await p.fill('#ezFPx','56');
   await p.evaluate(key=>{ const r=easyRowByKey(key); Object.assign(r.gameInfo, {startISO:new Date(Date.now()-5*3600e3).toISOString(), state:'in'}); easyPaintToday(); }, k); await p.waitForTimeout(300);
   const n0=(await fillState(p)).n; await tapFill(p); const t=await fillState(p); const keep=await p.evaluate(()=>({sh:(document.getElementById('ezFSh')||{}).value, px:(document.getElementById('ezFPx')||{}).value}));
   check('3h (N6): a game that started more than 4 hours ago is refused calmly, nothing is saved, and the typed shares and price are still there', t.n===n0 && /too long ago/.test(t.note) && keep.sh==='13' && keep.px==='56', {note:t.note, keep}); await A.ctx.close(); });

 // ---------- 4. the true cause when nothing can be sized ----------
 for (const sc of [{bank:500, used:false}, {bank:200, used:false}, {bank:2000, used:true}]) await S(async()=>{ const A=await open(b,1280,900), p=A.page;
   await p.evaluate(sc=>{ const e=document.getElementById('bank'); e.value=String(sc.bank); e.dispatchEvent(new Event('input',{bubbles:true})); e.dispatchEvent(new Event('change',{bubbles:true}));
     if(sc.used){ const day=gameDayOf(easyList().picks[0].r), used=((dayStats()[day]||{}).staked)||0, room=cfgRead().dayMax-used; const m=lastRows.find(r=>r.name==='Patrick Mahomes'); addToLog(Object.assign({}, m, {stake:+(room-0.5).toFixed(2)})); saveLog(); } refresh(); }, sc);
   await p.waitForTimeout(1600); await p.evaluate(()=>easyPaintToday()); await p.waitForTimeout(300);
   const R=await p.evaluate(()=>{ const ns=easyListNoStake(0.60), causes={}; ns.keys.forEach(k=>{ const r=easyRowByKey(k); causes[k]={name:r.name, flags:(r.flags||[]).map(f=>f[1]).filter(t=>/daily max|game cap|one per player|PLAYER|minimum/.test(t)).map(t=>t.slice(0,30))}; });
     return {listed:easyList().total, ns:{total:ns.total, min:ns.min, day:ns.day, game:ns.game, player:ns.player, other:ns.other}, text:tx(document.getElementById('ezList').innerText), causes, minReal:ns.keys.filter(k=>{ const f=(easyRowByKey(k).flags||[]).map(x=>x[1]); return !f.some(t=>/^(daily max reached|game cap reached)|PLAYER EXPOSURE|one per player/.test(t)) && f.some(t=>/under the \$.*minimum/.test(t)); }).length}; });
   const lim=R.ns.day+R.ns.game+R.ns.player+R.ns.other;
   check('4'+(sc.bank===500?'a':sc.bank===200?'b':'c')+' (N1): $'+sc.bank+(sc.used?' with the day’s max used':'')+': “Put a bigger number in Settings” appears only for picks whose bet is under the $1 minimum ('+R.ns.min+' of '+R.ns.total+'); every limit that is used up is named, and raising money is never offered for it',
     R.listed===0 ? (R.ns.min===R.minReal && (R.ns.min>0)===/Put a bigger number in Settings/.test(R.text) && (lim>0)===/limit/.test(R.text) && (lim>0 ? /a safety stop/.test(R.text) : true) && !(lim>0 && R.ns.min===0 && /bigger number/.test(R.text)) && (R.ns.day>0 ? /today’s limit is used up \(a safety stop\)\. It resets tomorrow\./.test(R.text) : true)) : sc.bank===2000, {listed:R.listed, ns:R.ns, text:R.text.slice(60,520), minReal:R.minReal});
   await A.ctx.close(); });

 // ---------- 5. What filled? starts at the card’s price; refuses a fill that cannot make money, too many shares, a price outside 1 to 99 ----------
 await S(async()=>{ const {A,p,k}=await fillOpen(b,1280,900);
   const D=await p.evaluate(key=>{ const x=easyList().picks.find(q=>q.key===key); return {px:(document.getElementById('ezFPx')||{}).value, card:easyCentsOf(x.r), limit:x.nums.limit, warn:tx((document.getElementById('ezFWarn')||{}).innerText)}; }, k);
   check('5a (N4): the form starts at the price on the card ('+D.card+'¢), not the limit ('+D.limit+'¢), and shows no above-the-limit warning', D.px===String(D.card) && D.card<D.limit && D.warn==='', D);
   const n0=(await fillState(p)).n, tryFill=async(sh,px)=>{ await p.fill('#ezFSh',sh); await p.fill('#ezFPx',px); const live=await p.evaluate(()=>tx((document.getElementById('ezFLine')||{}).innerText)+' | '+tx((document.getElementById('ezFWarn')||{}).innerText)); await tapFill(p,700); const t=await fillState(p); return {n:t.n, note:t.note, live, conf:t.conf}; };
   const w=await tryFill('1','99'); check('5b (N5): 1 share at 99 cents (it costs as much as it pays) is not saved: the screen and the Save both say it cannot make money', w.n===n0 && /cannot make money/.test(w.note) && /cannot make money/.test(w.live), w);
   const big=await tryFill('10001','57'); check('5c (sanity): more than 10,000 shares is refused calmly', big.n===n0 && /more than 10,000 shares/.test(big.note) && /more than 10,000/.test(big.live), big);
   const c0=await tryFill('10','0.57'); check('5d (sanity): a price typed in dollars (0.57) is refused calmly: 1 to 99 cents', c0.n===n0 && /from 1 to 99 cents/.test(c0.note), c0);
   const c1=await tryFill('10','100'); check('5e (sanity): 100 cents is refused', c1.n===n0 && /from 1 to 99 cents/.test(c1.note), c1);
   const ok=await tryFill('12','57'); check('5f: a plain fill (12 shares at 57 cents) still saves', ok.n===n0+1 && ok.conf, ok); await A.ctx.close(); });

 // ---------- 6. Remove, Undo under a full storage, the banner, Not now ----------
 await S(async()=>{ const A=await open(b,1280,900), p=A.page; await p.click('#ezPlaced'); await p.waitForSelector('#ezPick .ez-conf',{timeout:9000});
   const R=await p.evaluate(()=>{ const id=Object.keys(easyOwn())[0], bt=logged.find(x=>x.id===id), f={book:'kalshi', id:'F-77', qty:12, cost:9.6, fee:0.2, price:0.8, ts:Date.now()}; linkFill(bt,f); fillSeen['kalshi:F-77']={s:'linked',q:12}; saveLog();
     const u=easyUndo(id), rm=easyRemoveBet(id); return {undo:u.reason, rm:rm, inLog:logged.some(x=>x.id===id), btn:exBetsHtml().indexOf('data-ex="rm" data-id="'+id+'"')>=0}; });
   check('6a (S2-1): My bets Remove refuses a bet a book fill has linked to (like Undo), keeps it in the log, and shows no Remove button for it', R.undo==='changed' && R.rm.removed===false && R.rm.reason==='changed' && R.inLog && !R.btn, R); await A.ctx.close(); });
 await S(async()=>{ const A=await open(b,1280,900), p=A.page; await p.click('#ezPlaced'); await p.waitForSelector('#ezPick .ez-conf',{timeout:9000});
   const R=await p.evaluate(()=>{ const id=Object.keys(easyOwn())[0], real=Storage.prototype.setItem; Storage.prototype.setItem=function(k,v){ if(k==='mbev.log') throw new DOMException('full','QuotaExceededError'); return real.call(this,k,v); };
     const n0=logged.length, u=easyUndo(id); const r={undo:{removed:u.removed, reason:u.reason}, msg:easyUndoMsg(u), inMem:logged.some(x=>x.id===id), n:[n0,logged.length], own:!!easyOwn()[id], inStore:easyStored(id)};
     const g=easyRemoveBet(id); r.remove={removed:g.removed, reason:g.reason, text:easyRemoveStorageMsg ? easyRemoveStorageMsg() : ''}; r.inMem2=logged.some(x=>x.id===id); Storage.prototype.setItem=real; return r; });
   check('6b (S2-2): Undo under a full storage: the bet is still in memory and in storage, Easy still owns it, and the message says it could not be removed on this device (never “Removed”)', R.undo.removed===false && R.undo.reason==='storage' && /could not be removed on this device/.test(R.msg) && !/^Removed/.test(R.msg) && R.inMem && R.own && R.inStore && R.n[0]===R.n[1], R);
   check('6c (S2-2): My bets Remove under a full storage keeps the bet too', R.remove.removed===false && R.remove.reason==='storage' && R.inMem2, R.remove);
   const U=await p.evaluate(()=>{ const id=Object.keys(easyOwn())[0], u=easyUndo(id); return {removed:u.removed, inLog:logged.some(x=>x.id===id)}; });
   check('6d: once storage works again the same Undo removes it', U.removed===true && !U.inLog, U); await A.ctx.close(); });
 await S(async()=>{ const A=await open(b,1280,900,{easy:false}), p=A.page;   // the save-failure banner is worded for the level showing
   const R=await p.evaluate(()=>{ const real=Storage.prototype.setItem; Storage.prototype.setItem=function(k,v){ if(k==='mbev.log') throw new DOMException('full','QuotaExceededError'); return real.call(this,k,v); };
     localStorage.setItem('mbev.easy','{"welcomed":1}'); saveLog(); const god=document.getElementById('saveFail').textContent; easySetLevel('easy'); const easy=document.getElementById('saveFail').textContent; easySetLevel('god'); const god2=document.getElementById('saveFail').textContent;
     Storage.prototype.setItem=real; saveLog(); return {god, easy, god2, gone:!document.getElementById('saveFail')}; });
   check('6e (S3-1): a banner raised in God and then seen in Easy has the Easy words (no “Claude Code”), and back in God it has the God words again', /Claude Code/.test(R.god) && !/Claude Code|bet log|browser storage/i.test(R.easy) && /Claude Code/.test(R.god2) && R.gone, R);
   const E=await p.evaluate(()=>{ easySetLevel('easy'); const real=Storage.prototype.setItem; Storage.prototype.setItem=function(k,v){ if(k==='mbev.log') throw new DOMException('full','QuotaExceededError'); return real.call(this,k,v); }; saveLog(); const easy=document.getElementById('saveFail').textContent; easySetLevel('god'); const god=document.getElementById('saveFail').textContent; Storage.prototype.setItem=real; saveLog(); return {easy, god}; });
   check('6f (S3-1): a banner raised in Easy and then seen in God has the God words', !/Claude Code/.test(E.easy) && /Claude Code/.test(E.god), E); await A.ctx.close(); });
 await S(async()=>{ const {A,p,k}=await fillOpen(b,1280,900,1800);   // Not now while the save is in flight must not close the form or save
   await p.fill('#ezFSh','12'); await p.fill('#ezFPx','57'); const n0=(await fillState(p)).n; await p.click('#ezFSave'); await p.waitForTimeout(200);
   const B=await p.evaluate(()=>{ const no=document.getElementById('ezFNo'); const dis=!!(no&&no.disabled); if(no){ no.disabled=false; no.click(); } return {busy:ezS().busy, dis, form:!!ezS().form}; });
   await p.waitForTimeout(2600); const t=await fillState(p);
   check('6g (S3): Not now cannot be pressed while What filled? is saving (the button is off, and a press changes nothing), and the one save finishes with one bet', B.busy && B.dis && B.form && t.n===n0+1 && t.ad===1, {B, t:[t.n,n0,t.ad]}); await A.ctx.close(); });
 await S(async()=>{ const A=await open(b,1280,900), p=A.page; const R=await p.evaluate(()=>{ sessionStorage.setItem('easyOwn','[]'); window._easyOwn=null; return {arr:Array.isArray(easyOwn())}; });
   check('6h: a stored list in place of the ownership record is not accepted as one', R.arr===false, R); await A.ctx.close(); });

 // ---------- 7. words ----------
 await S(async()=>{ const A=await open(b,1280,900,EX), p=A.page;
   const W=await p.evaluate(()=>{ const L=easyList(), luka=gN('Luka Doncic'), minus={r:Object.assign({}, luka, {offeredRaw:'+105', offeredProb:toProb('+105')})}, plus=Object.assign({}, luka, {offeredRaw:'+120', offeredProb:toProb('+120'), fairProb:0.5, mktProb:0.48, actProb:0.487});
     const base=(n,o)=>Object.assign({}, gN(n), o), ml=base('Los Angeles Lakers',{book:'Polymarket US', stake:10, offeredProb:0.55, offeredRaw:'-122', fairProb:0.66, mktProb:0.64}), mlV=Object.assign({}, ml, {_openQ:{ok:true, src:'poly', title:'Lakers vs Suns', yes:0.55}});
     const side=r=>{ const T=easyTypeThis(r); return T&&T.rows ? T.rows.find(w=>w.label==='Side').note : null; };
     const rowE=base('Anthony Davis',{book:'Polymarket US', stake:10, offeredProb:0.5, offeredRaw:'+100'});
     const m={key:'k', r:minus.r, sentence:'x', oldPrice:'-150', newPrice:'-150', breakEven:0.6, most:0.6, book:'B', priceMoved:false, chanceMoved:true};
     return {rule:easyFairText(minus.r).rule, plusRule:(easyFairText(plus)||{}).rule||'', sideMl:side(ml), sideMlV:side(mlV), sideProp:side(rowE), moved:ezMovedHtml(m)}; });
   check('7a (money N7): “Is the price fair?” for a minus price says a smaller minus number is better and any plus number is also fine', /^A smaller minus number is a better price \(any plus number is also fine\)\. Place it only at -?\d+ or a smaller minus number;/.test(W.rule), W.rule);
   check('7b: and for a plus price it says a bigger plus number is better', /^A bigger plus number is a better price\./.test(W.plusRule) && !/smaller minus/.test(W.plusRule), W.plusRule);
   check('7c (money N8): a Polymarket US team bet states its market in plain words only when the app has read that market; otherwise it says to pick the team on the market the app shows', /Pick the team on the market the app shows\./.test(W.sideMl) && !/The market is the/.test(W.sideMl) && /The market is the Los Angeles Lakers to win\./.test(W.sideMlV) && !/Pick the team/.test(W.sideMlV) && /The market is Anthony Davis 13\+ Rebounds\./.test(W.sideProp), {ml:W.sideMl, v:W.sideMlV, prop:W.sideProp});
   check('7d (money N8): a “Not worth it now” card never says “right at the limit”', !/right at the limit/.test(W.moved) && /just above the most La Contadora would pay/.test(W.moved), W.moved.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').slice(0,300)); await A.ctx.close(); });

 // ---------- 8. the customer build’s first frame ----------
 await S(async()=>{ const A=await open(b,390,844,{html:cust, easy:false, pre:async p=>{ await p.evaluate(()=>{ localStorage.setItem('mbev.viewAs','god'); localStorage.setItem('mbev.easy','{"welcomed":1}'); }); }}), p=A.page;
   const fr=await A.ctx.newPage(); await fr.addInitScript(()=>{ window.__vals=[]; try{ new MutationObserver(ms=>ms.forEach(m=>window.__vals.push(m.target.getAttribute('data-viewas')))).observe(document,{subtree:true, attributes:true, attributeFilter:['data-viewas']}); }catch(e){} localStorage.setItem('mbev.viewAs','god'); });
   const base=await p.evaluate(()=>location.href); await fr.goto(base); await fr.waitForTimeout(800);
   const F=await fr.evaluate(()=>({vals:window.__vals, now:document.documentElement.getAttribute('data-viewas')}));
   check('8a (reg2 S2): a customer build (DEV_APP false) with a stored viewAs “god”: every value the page ever sets on data-viewas is easy (the head script sets it, so there is no God frame before the big script runs)', F.vals.length>0 && F.vals.every(v=>v==='easy') && F.now==='easy', F);
   const D=await open(b,390,844,{easy:false, pre:async p=>{ await p.evaluate(()=>{ localStorage.setItem('mbev.viewAs','god'); }); }}); const d=await D.page.evaluate(()=>document.documentElement.getAttribute('data-viewas'));
   check('8b: the dev app is unchanged: a stored “god” stays God', d==='god', d);
   check('8c: the flag is defined once (one “const DEV_APP=” in the file, in the head script)', (html.match(/const DEV_APP=/g)||[]).length===1 && html.indexOf('const DEV_APP=')<html.indexOf('data-viewas'), (html.match(/const DEV_APP=/g)||[]).length);
   await D.ctx.close(); await A.ctx.close(); });

 await b.close(); console.log('\n'+T.pass+' passed, '+T.fail+' failed'); process.exit(T.fail?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
