// v5.24 (step 4): the review fixes, the exchange "What filled?" form and the small-bankroll message. Every check here fails on the step 3b build (b7f6f7b) and passes now.
// Sections: 1 saved-bet integrity (S1-1, S1-2, S1-3), 2 storage full and the tab a form records (S2), 3 messages after a reload, a started game and a sync deletion (S3),
// 4 money (tickets name the market, exchange game totals hidden, price and limit in one unit, wins equal the saved record: a property test through the real bet form),
// 5 words (+100, plus prices, moved card, edge line, glosses, sacks, a win with no price), 6 What filled? (and its record equals a God user typing the same fill),
// 7 small bankroll, 8 My bets dev note. Boots the practice copy (tests/practice-copy.js, Sunday 2026-11-15 12:00 PM CT).
const path=require('path'), fs=require('fs');
const { chromium } = require('playwright');
const html=fs.readFileSync(process.argv[2]||path.join(__dirname,'..','index.html'),'utf8');
const K=require('./v524-easy-kit.js')(html);
const T=K.mk(), check=T.check, tx=K.T;
const cust=html.replace('const DEV_APP=true','const DEV_APP=false'); if(cust===html) throw new Error('the DEV_APP flag was not found');
const open=(b,W,H,o)=>K.open(b,W||1280,H||900,o);
const LIVE=(price)=>async route=>{ const u=new URL(route.request().url()); let bets=[]; try{ bets=JSON.parse(u.searchParams.get('bets')||'[]'); }catch(e){}
  const R={}; bets.forEach(d=>{ R[d.id]={ok:true, src:d.book, price, bid:+(price-0.01).toFixed(3), ask:price, title:d.name, ref:'LIVE-'+d.id, at:new Date().toISOString(), outcome:d.book==='novig'?'out-1':undefined}; });
  await new Promise(x=>setTimeout(x,2200));   // a slow read: the wait in I placed it
  await route.fulfill({status:200, contentType:'application/json', headers:{'access-control-allow-origin':'*','access-control-allow-credentials':'true','access-control-allow-headers':'*'}, body:JSON.stringify({at:new Date().toISOString(), results:R})}); };
const isLive=u=>/0xbeta|workers\.dev/.test(u.hostname)&&u.pathname==='/live';
// the sportsbook pick Luka at a price the form calls "Not worth it": I placed it falls back to the full form in the pick page (the form a person saves from)
async function formOpen(p){ await p.evaluate(()=>{ const r=gN('Luka Doncic'); r.offeredRaw='-400'; r.offeredProb=toProb('-400'); }); await p.click('#ezPlaced'); await p.waitForSelector('#ezHost .editor .eb-save',{timeout:8000}); await p.waitForTimeout(200); }
async function saveForm(p){ for(let i=0;i<3;i++){ if(!(await p.$('#ezHost .editor .eb-save'))) break; await p.click('#ezHost .editor .eb-save'); await p.waitForTimeout(350); } }

(async()=>{
 const b=await chromium.launch();

 // ---------- 1. saved-bet integrity ----------
 { const A=await open(b), p=A.page; await formOpen(p);
   // S1-1: another bet joins the log while the form is open (a second tab, a sync pull, a fill logged for you)
   const god=await p.evaluate(()=>{ const m=gN('Patrick Mahomes'); addToLog(Object.assign({}, m, {stake:7})); const id=logged[logged.length-1].id; refresh(); easyPaintToday(); return {id, n:logged.length}; });
   await saveForm(p); await p.waitForSelector('#ezPick .ez-conf',{timeout:6000});
   const C=await p.evaluate(()=>({t:document.querySelector('#ezPick .ez-conf').innerText.replace(/\s+/g,' '), undo:document.querySelector('#ezPick [data-ez="undo"]').dataset.id, ids:logged.map(x=>x.id), lastName:logged[logged.length-1].name}));
   check('1a (S1-1): the confirmation is for the bet the form saved (Luka), never for a bet that joined the log meanwhile (Mahomes)', /Luka/.test(C.t) && !/Mahomes/.test(C.t) && C.undo!==god.id && C.lastName==='Luka Doncic', {t:C.t.slice(0,120), undo:C.undo, god:god.id});
   await p.click('#ezPick [data-ez="undo"]'); await p.waitForTimeout(400);
   const U=await p.evaluate(id=>({god:logged.some(x=>x.id===id), godStored:JSON.parse(localStorage.getItem('mbev.log')).some(x=>x.id===id), godRemoved:removedBets.some(x=>x.id===id), luka:logged.some(x=>x.name==='Luka Doncic' && x.market==='4.5 Rebounds' && /-400/.test(x.odds)), toast:(document.getElementById('ezToast')||{}).innerText}), god.id);
   check('1b (S1-1): Undo removes Luka and leaves the other bet in the log, in storage, and off the removed list', U.god && U.godStored && !U.godRemoved && !U.luka, U);
   check('1c: no page errors', A.errors.length===0, A.errors); await A.ctx.close(); }

 { const A=await open(b), p=A.page; await p.waitForTimeout(200);
   const O=await p.evaluate(()=>{ const id=logged.find(x=>x.kind!=='parlay' && easyStatusOf(x)==='open').id, n=logged.length, u=easyUndo(id), r=easyRemoveBet(id); return {u, r, n, n2:logged.length, still:logged.some(x=>x.id===id), rm:removedBets.some(x=>x.id===id)}; });
   check('1d (S1-1): Undo and the My bets remove refuse a bet Easy did not save (a God bet): it stays, nothing is on the removed list', O.u.removed===false && O.u.reason==='not from Easy' && O.r.removed===false && O.r.reason==='not here' && O.still && O.n===O.n2 && !O.rm, O);
   await p.click('#ezPlaced'); await p.waitForFunction(()=>document.querySelector('#ezPick .ez-conf'),null,{timeout:8000}); await K.tab(p,'v-ebets');
   const L=await p.evaluate(()=>{ const rows=[...document.querySelectorAll('#exBets .ex-row[data-st="open"]')].map(r=>({id:r.dataset.id, rm:!!r.querySelector('[data-ex="rm"]')})); const own=Object.keys(easyOwn()); return {rows, own, ownRm:rows.filter(r=>own.includes(r.id)).map(r=>r.rm), otherRm:rows.filter(r=>!own.includes(r.id)).map(r=>r.rm)}; });
   check('1e (S1-1): in My bets "Logged by mistake? Remove it" is on the bet Easy saved and on no other bet', L.own.length===1 && L.ownRm.every(Boolean) && L.otherRm.length>=2 && L.otherRm.every(x=>!x), L);
   const R=await p.evaluate(()=>{ const id=Object.keys(easyOwn())[0]; const k=easyOwn()[id].key; delete window._easyOwn; const again=Object.keys(easyOwn()); const u=easyUndo(id); return {again, u, k}; });
   check('1f (S3-1): what Easy saved is remembered for this tab after the page forgets it in memory (a reload), so Undo still works', R.again.length===1 && R.u.removed===true, R);
   check('1g: no page errors', A.errors.length===0, A.errors); await A.ctx.close(); }

 { // S1-2: the same pick is saved elsewhere while the live price is being read; and a second tap while a save is in flight
   const A=await open(b,1280,900,{practice:{rows:K.EXROWS}}), p=A.page; await A.ctx.route(isLive, LIVE(0.57));
   const k=await p.evaluate(()=>easyList().picks.find(x=>x.book==='Polymarket US').key);
   await p.evaluate(key=>{ window.__a=easyPlacedSave(key); window.__b=easyPlacedSave(key); return 1; }, k); await p.waitForTimeout(900);
   await p.evaluate(key=>{ const r=easyRowByKey(key); addToLog(Object.assign({}, r)); refresh(); }, k);
   const D=await p.evaluate(async()=>{ const a=await window.__a, b=await window.__b; return {a, b, copies:logged.filter(x=>x.name==='Anthony Davis').length, hosts:document.querySelectorAll('.pcard .editor').length}; });
   check('1h (S1-2): a pick bet elsewhere during the live read is not saved again (reason already), and a second tap while the save is in flight is ignored (reason busy): one copy in the log', D.a.saved===false && D.a.reason==='already' && D.b.saved===false && D.b.reason==='busy' && D.copies===1 && D.hosts===0, D);
   check('1i: no page errors', A.errors.length===0, A.errors); await A.ctx.close(); }

 { // S1-3: Undo refuses a bet that changed after it was saved; the same bet is removed once nothing differs
   const A=await open(b), p=A.page;
   const M=await p.evaluate(async()=>{ const out=[], keys=easyList().picks.map(x=>x.key);
     const muts=[['graded as a win', x=>{ x.result='win'; }, x=>{ delete x.result; }], ['sold', x=>{ x.sold={price:6, at:Date.now()}; }, x=>{ delete x.sold; }], ['linked to a book fill', x=>{ x.fillRef='K-1'; x.fillBook='kalshi'; }, x=>{ delete x.fillRef; delete x.fillBook; }],
       ['logged from a fill', x=>{ x.autoFrom='fill:1'; }, x=>{ delete x.autoFrom; }], ['has fills', x=>{ x.fills=[{id:1, qty:3}]; }, x=>{ delete x.fills; }], ['edited after saving', x=>{ x.stake=7; x.edits=[{at:'x', before:{stake:10}}]; }, x=>{ x.stake=10; delete x.edits; }], ['stake changed', x=>{ x.stake=9; }, x=>{ x.stake=10; }]];
     for(let i=0;i<muts.length;i++){ const [nm, m, un]=muts[i], k=keys[0]; const res=await easyPlacedSave(k); const bet=logged.find(x=>x.id===res.id), n=logged.length, rb=removedBets.length; m(bet);
       const u1=easyUndo(res.id); const kept=logged.some(x=>x.id===res.id) && logged.length===n && removedBets.length===rb; un(bet); const u2=easyUndo(res.id);
       out.push({nm, saved:res.saved, refused:u1.removed===false && u1.reason==='changed', kept, removedAfter:u2.removed===true && !logged.some(x=>x.id===res.id) && removedBets.length===rb}); }
     return out; });
   check('1j (S1-3): Undo refuses a bet that was graded, sold, linked to a fill, logged from a fill, given fills, edited or changed (7 cases); each stays in the log and off the removed list; once nothing differs the same Undo works', M.length===7 && M.every(x=>x.saved && x.refused && x.kept && x.removedAfter), M);
   const msg=await p.evaluate(()=>easyUndoMsg({removed:false, reason:'changed'}));
   check('1k (S1-3): the refusal is calm and says what to do (remove it in My bets, which asks first)', /has changed since you saved it, so it stays/.test(msg) && /My bets/.test(msg) && /asks first/.test(msg) && !/error|failed|wrong/i.test(msg), msg);
   check('1l: no page errors', A.errors.length===0, A.errors); await A.ctx.close(); }

 // ---------- 2. storage full, and the tab a form records ----------
 { const A=await open(b), p=A.page;
   await p.evaluate(()=>{ const real=Storage.prototype.setItem; window.__real=real; Storage.prototype.setItem=function(k,v){ if(k==='mbev.log') throw new DOMException('full','QuotaExceededError'); return real.call(this,k,v); }; });
   const n0=await p.evaluate(()=>({n:logged.length, ls:JSON.parse(localStorage.getItem('mbev.log')).length, keys:easyList().picks.map(x=>x.key)}));
   await p.click('#ezPlaced'); await p.waitForTimeout(1500);
   const S=await p.evaluate(()=>({n:logged.length, ls:JSON.parse(localStorage.getItem('mbev.log')).length, conf:!!document.querySelector('#ezPick .ez-conf'), note:(document.getElementById('ezNote')||{}).innerText||'', banner:(document.getElementById('saveFail')||{innerText:''}).innerText, keys:easyList().picks.map(x=>x.key), text:document.getElementById('v-etoday').innerText, toast:(document.getElementById('savedToast')||{className:''}).className}));
   check('2a (S2): storage full: it never says Saved to My bets, says plainly it could not be saved on this device, the bet is not kept in memory, and the pick stays on Today', !S.conf && !/Saved to My bets/.test(S.text) && /could not be saved on this device/.test(S.note) && S.n===n0.n && S.ls===n0.ls && S.keys.join()===n0.keys.join() && !/\bon\b/.test(S.toast), {note:S.note.slice(0,140), n:[S.n,n0.n], keys:S.keys.length});
   check('2b (S2): the red banner has no God words in Easy (never "Tell Claude Code")', !/Claude Code|bet log|browser storage/i.test(S.banner), S.banner);
   await p.evaluate(()=>{ Storage.prototype.setItem=window.__real; }); await p.click('#ezPlaced'); await p.waitForSelector('#ezPick .ez-conf',{timeout:8000});
   const Q=await p.evaluate(()=>({stored:JSON.parse(localStorage.getItem('mbev.log')).length, n:logged.length, banner:!!document.getElementById('saveFail')}));
   check('2c: once storage works again the same tap saves, the bet is in storage, and the banner is gone', Q.stored===n0.ls+1 && Q.n===n0.n+1 && !Q.banner, Q);
   check('2d: no page errors', A.errors.length===0, A.errors); await A.ctx.close(); }

 { // S2-2: the full form records the pick's own tab, not the God tab that happens to be open
   const A=await open(b,1280,900,{easy:false}), p=A.page; await p.evaluate(()=>{ setMode('volado'); localStorage.setItem('mbev.easy','{"welcomed":1}'); easySetLevel('easy'); }); await p.waitForTimeout(600);
   await formOpen(p); await saveForm(p); await p.waitForSelector('#ezPick .ez-conf',{timeout:6000});
   const S=await p.evaluate(()=>{ const x=logged[logged.length-1]; return {name:x.name, mode:x.snap.mode, tab:x.snap.listed&&x.snap.listed.tab, fam:window._easyFam, betMode:betMode}; });
   check('2e (S2-2): with Volado open in God, a Boring pick saved from the form records snap.mode "boring" (its own tab), and the tab is not left set', S.name==='Luka Doncic' && S.mode==='boring' && S.fam===null && S.betMode==='volado', S);
   check('2f: no page errors', A.errors.length===0, A.errors); await A.ctx.close(); }

 // ---------- 3. messages ----------
 { const A=await open(b), p=A.page;
   await p.click('#ezPlaced'); await p.waitForSelector('#ezPick .ez-conf',{timeout:8000});
   await p.evaluate(()=>{ delete window._easyOwn; sessionStorage.removeItem('easyOwn'); });
   await p.click('#ezPick [data-ez="undo"]'); await p.waitForTimeout(300);
   const M=await p.evaluate(()=>({toast:document.getElementById('ezToast').innerText, still:logged.some(x=>x.name==='Luka Doncic' && easyStatusOf(x)==='open')}));
   check('3a (S3-1): after the page forgot what it saved, Undo leaves the bet and says "This bet was not saved here, so it stays." (no pointer to a screen that is not there)', M.toast==='This bet was not saved here, so it stays.' && M.still, M);
   check('3b: no page errors', A.errors.length===0, A.errors); await A.ctx.close(); }
 { const A=await open(b), p=A.page;
   await p.click('#ezPlaced'); await p.waitForSelector('#ezPick .ez-conf',{timeout:8000});
   await p.evaluate(()=>{ const r=gN('Luka Doncic'); r.gameInfo.state='in'; });   // the game starts while the confirmation is on screen
   await p.click('#ezPick [data-ez="undo"]'); await p.waitForTimeout(300);
   const M=await p.evaluate(()=>({toast:document.getElementById('ezToast').innerText, bets:logged.some(x=>x.name==='Luka Doncic' && easyStatusOf(x)==='open'), list:easyList().picks.some(x=>x.r.name==='Luka Doncic')}));
   check('3c (S3-2): Undo after the game started removes the bet and does not say the pick is back on Today', !M.bets && !M.list && !/back on Today/.test(M.toast) && /Removed from My bets/.test(M.toast) && /not on Today any more/.test(M.toast), M);
   check('3d: no page errors', A.errors.length===0, A.errors); await A.ctx.close(); }
 { const A=await open(b), p=A.page; await formOpen(p);
   await p.evaluate(()=>{ const i=logged.findIndex(x=>x.kind!=='parlay' && easyStatusOf(x)==='open'); logged.splice(i,1); saveLog(); easyPaintToday(); }); await p.waitForTimeout(300);
   const N=await p.evaluate(()=>(document.getElementById('ezNote')||{}).innerText||'');
   check('3e (S3-3): a bet removed by a sync while the form is open is said (calmly) in the pick page', /removed somewhere else/.test(N) && /Check My bets/.test(N), N);
   await saveForm(p); await p.waitForSelector('#ezPick .ez-conf',{timeout:6000}); const C=await p.evaluate(()=>document.querySelector('#ezPick .ez-conf').innerText.replace(/\s+/g,' '));
   check('3f (S3-3): the person\'s own Save still shows the confirmation (and its Undo) after that deletion', /Luka/.test(C) && /Undo/.test(C), C.slice(0,120));
   check('3g: no page errors', A.errors.length===0, A.errors); await A.ctx.close(); }

 // ---------- 4. money ----------
 { const A=await open(b,1280,900,{practice:{rows:K.EXROWS}}), p=A.page;
   const Y=await p.evaluate(()=>{ const out={}, base=(n,o)=>Object.assign({}, gN(n), o);
     const ex=(bk,r)=>{ const x=Object.assign({}, r, {book:bk, stake:10}); const T=easyTypeThis(x); return T && T.rows ? T.rows.filter(w=>w.label==='Side').map(w=>w.value+' | '+w.note)[0] : null; };
     const rows={ prop:base('Anthony Davis',{offeredProb:0.5, offeredRaw:'+100'}), under:base('Anthony Davis',{side:'U', offeredProb:0.5, offeredRaw:'+100', fairProb:0.62, mktProb:0.6}), ml:base('Los Angeles Lakers',{offeredProb:0.55, offeredRaw:'-122', fairProb:0.66, mktProb:0.64}), fav:base('Seattle Seahawks',{offeredProb:0.5, offeredRaw:'+100', fairProb:0.62, mktProb:0.6}), dog:base('Miami Heat',{offeredProb:0.5, offeredRaw:'+100', fairProb:0.62, mktProb:0.6}) };
     ['Kalshi','Polymarket US'].forEach(bk=>{ Object.keys(rows).forEach(k=>{ out[bk+':'+k]=ex(bk, rows[k]); }); });
     out.total=ex('Kalshi', base('BUF @ MIA',{offeredProb:0.5, offeredRaw:'+100', fairProb:0.62, mktProb:0.6}));
     const tot=base('BUF @ MIA',{book:'Kalshi', offeredProb:0.5, offeredRaw:'+100', fairProb:0.66, mktProb:0.64, actProb:0.66, stake:10});
     out.hideKalshiTotal={ok:easyExOk(tot), sentence:!!easySentence(tot,true), okAtBook:easyExOk(Object.assign({}, tot, {book:'DraftKings'}))};
     return out; });
   const has=(k,...w)=>w.every(x=>String(Y[k]).includes(x));
   check('4a (S1 review): a Kalshi moneyline names the team market with YES: "YES on the market for the Los Angeles Lakers to win"', has('Kalshi:ml','YES on the market for the Los Angeles Lakers to win'), Y['Kalshi:ml']);
   check('4b (S1 review): a Kalshi favourite spread is YES on its own market; an underdog spread is NO on the FAVOURITE\'s market (Miami +4.5: NO on Seattle? the other team)', /^YES on the market for the Seattle Seahawks to win by over 2\.5/.test(Y['Kalshi:fav']) && /^NO on the market for the .+ to win by over 4\.5/.test(Y['Kalshi:dog']) && !/Miami Heat to win/.test(Y['Kalshi:dog'].split(' | ')[0]), {fav:Y['Kalshi:fav'], dog:Y['Kalshi:dog']});
   check('4c (review item 17): a Kalshi prop Over names its market too ("YES on the market for Anthony Davis 13+ Rebounds") and the Under says NO on it and what it means', /^YES on the market for Anthony Davis 13\+ Rebounds \|/.test(Y['Kalshi:prop']) && /^NO on the market for Anthony Davis 13\+ Rebounds \|.*NO on the “13\+” market is the Under/.test(Y['Kalshi:under']), {o:Y['Kalshi:prop'], u:Y['Kalshi:under']});
   check('4d (review 2, step 5): Polymarket US keeps its side button and its Yes / No hint for a team bet (a moneyline and both spreads); the market sentence is stated only when verified (tests/v524-fixes2-test.js 7c), otherwise it says to pick the team on the market the app shows; a prop still names its market', /\| .*Pick the team on the market the app shows\./.test(Y['Polymarket US:ml']) && /Polymarket US: .*Yes \/ No/.test(Y['Polymarket US:dog']) && /Pick the team on the market the app shows\./.test(Y['Polymarket US:dog']) && /The market is Anthony Davis 13\+ Rebounds\./.test(Y['Polymarket US:prop']), {ml:Y['Polymarket US:ml'], dog:Y['Polymarket US:dog'], prop:Y['Polymarket US:prop']});
   check('4e (review 2): an exchange game total is not shown as a pick (its Yes / No or Over / Under wording is unverified); the same total at a sportsbook still is', Y.hideKalshiTotal.ok===false && Y.hideKalshiTotal.okAtBook===true && !/45\+/.test(String(Y.total)), Y.hideKalshiTotal);
   check('4f: no page errors', A.errors.length===0, A.errors); await A.ctx.close(); }

 { // exchange prices: the price a share is charged and the limit are in the same unit (never "costs 74¢" next to "limit 73¢")
   const A=await open(b,1280,900,{practice:{rows:K.EXROWS}}), p=A.page;
   const X=await p.evaluate(()=>{ const out={rows:0, ok:0, hidden:0, bad:[], fn:typeof easyExOk==='function'}; if(!out.fn) return out; const dav=gN('Anthony Davis'); const imp=a=>a>0?100/(a+100):(-a)/(-a+100);
     for(const bk of ['Kalshi','Polymarket US']){ for(let a=-1500;a<=900;a+=3){ if(a>-100 && a<100) continue; const p0=imp(a); const r=Object.assign({}, dav, {book:bk, offeredProb:p0, offeredRaw:(a>0?'+':'')+a, fairProb:Math.min(0.97,p0+0.12), mktProb:Math.min(0.97,p0+0.10), actProb:Math.min(0.97,p0+0.11), stake:10, kind:'prop', side:'O'}); out.rows++;
       const n=easyNums(r); if(!n.ok || !easyPriceOk(r)) continue; if(!easyExOk(r)){ out.hidden++; continue; } const F=easyFairText(r), px=parseInt(easyPriceText(r),10), lim=parseInt((F.rule.match(/limit of (\d+)¢/)||[])[1],10), shown=parseInt((F.mean.match(/costs (\d+)¢/)||[])[1],10);
       if(!(px<=lim && shown===px && n.limit===lim)) out.bad.push({a, p0, px, shown, lim, rule:F.rule}); else out.ok++; }
     } return out; });
   check('4g (review 7): for every exchange pick shown ('+X.ok+' of '+X.rows+' generated Kalshi and Polymarket US rows, '+X.hidden+' hidden because a share cannot be bought at or under the limit) the price said and the limit are in the same cent: price at or under the limit, and the "A share costs N¢" line equals the price', X.fn && X.ok>300 && X.bad.length===0, X.bad.slice(0,4));
   check('4h: no page errors', A.errors.length===0, A.errors); await A.ctx.close(); }

 { // wins and back equal exactly what the saved record shows (betProfit of the bet the real form saves): thousands of rows through the real bet form
   const A=await open(b,1280,900), p=A.page;
   const P=await p.evaluate(()=>{ const out={rows:0, bad:{}, ex:[]}; const bump=(k,e)=>{ out.bad[k]=out.bad[k]||[]; if(out.bad[k].length<4) out.bad[k].push(e); out.bad[k+'#']=(out.bad[k+'#']||0)+1; };
     const keep={refresh:window.refresh, renderLog:window.renderLog, renderPerf:window.renderPerf, renderTodayBar:window.renderTodayBar, savedToast:window.savedToast, saveLog:window.saveLog}; keep.fetch=window.fetch; window.fetch=()=>new Promise(()=>{}); window.refresh=()=>{}; window.renderLog=()=>{}; window.renderPerf=()=>{}; window.renderTodayBar=()=>{}; window.savedToast=()=>{}; window.saveLog=()=>{};
     const hostOf=()=>{ const h=document.createElement('div'); h.className='pcard'; h.style.cssText='position:fixed;left:0;top:120px;width:700px;visibility:hidden'; document.body.appendChild(h); return h; };
     const saved=r=>{ const h=hostOf(); try{ openBetEditor(h, r); const ed=h.querySelector('.editor'), sb=ed.querySelector('.eb-save'); sb.dataset.ok='1'; sb.dataset.hs='1'; sb.dataset.lc='1'; const n0=logged.length; sb.click(); return logged.length>n0 ? logged.pop() : null; } finally{ h.remove(); } };
     const imp=a=>a>0?100/(a+100):(-a)/(-a+100), dec=a=>a>0?1+a/100:1+100/(-a);
     let seed=5; const rnd=()=>{ seed=(seed*1103515245+12345)%2147483648; return seed/2147483648; };
     const T={dk:gN('Luka Doncic'), novig:lastRows.find(r=>r.name==='James Cook'), bov:lastRows.find(r=>r.name==='Jaylen Waddle')};
     const one=(tag, r)=>{ out.rows++; const n=easyNums(r); const sv=saved(r); if(!sv){ bump(tag+': not saved', {raw:r.offeredRaw, st:r.stake}); return; } const w=betProfit(Object.assign({}, sv, {result:'win'}));
       if(!n.ok){ bump(tag+': easyNums not ok', {raw:r.offeredRaw}); return; }
       if(sv.stake!==n.st) bump(tag+': stake', {raw:r.offeredRaw, saved:sv.stake, easy:n.st});
       if(w!==n.wins) bump(tag+': wins', {raw:r.offeredRaw, stake:sv.stake, savedOdds:sv.odds, easy:n.wins, record:w});
       if(+(sv.stake+w).toFixed(2)!==n.back) bump(tag+': back', {raw:r.offeredRaw, easy:n.back, record:+(sv.stake+w).toFixed(2)}); };
     const mkr=(t,bk,a,st)=>Object.assign({}, T[t], {book:bk, offeredRaw:(a>0?'+':'')+a, offeredProb:imp(a), stake:st});
     for(let i=0;i<1500;i++){ const a=Math.floor(100+rnd()*1900)*(rnd()<0.5?1:-1), st=i%3===0 ? 10 : i%3===1 ? +(rnd()*100).toFixed(2) : +(rnd()*50+0.004).toFixed(4); one('sportsbook (DraftKings)', mkr('dk','DraftKings',a,st)); }
     for(let i=0;i<1200;i++){ const a=Math.floor(100+rnd()*1900)*(rnd()<0.5?1:-1), st=+(rnd()*100).toFixed(2); one('Novig', mkr('novig','Novig',a,st)); }
     for(let i=0;i<800;i++){ const a=Math.floor(100+rnd()*1900)*(rnd()<0.5?1:-1), st=+(rnd()*100).toFixed(2); one('Bovada', mkr('bov','Bovada',a,st)); }
     for(let d=1.10; d<=6.0; d+=0.01){ const D=+d.toFixed(2), P0=1/D, raw=americanOf(P0); one('decimal-priced', Object.assign({}, T.bov, {book:'Bovada', offeredRaw:(raw>0?'+':'')+raw, offeredProb:P0, stake:100})); }
     [[38.85,-120,'dk'],[6.53,-200,'dk'],[10,-103,'novig'],[8.4375,-150,'dk'],[10,+100,'dk'],[10,+100,'novig']].forEach(([st,a,t])=>one('known case '+t+' '+a+' $'+st, mkr(t, t==='dk'?'DraftKings':'Novig', a, st)));
     Object.assign(window, keep); return out; });
   const bad=Object.keys(P.bad).filter(k=>!/#$/.test(k));
   check('4i (review 4 to 6): over '+P.rows+' generated rows (sportsbook, Novig, Bovada, decimal-priced, half-cent wins, the Lakers stake) saved through the real bet form: the stake, the wins and the back Easy shows equal betProfit of the saved record to the cent', P.rows>3500 && bad.length===0, bad.map(k=>[k, P.bad[k+'#'], P.bad[k][0]]).slice(0,5));
   check('4j: no page errors', A.errors.length===0, A.errors); await A.ctx.close(); }

 { // the ticket's cost and the form's line are one number: easyFillMath at the default equals kalshiHow and polyHow (thousands of rows)
   const A=await open(b,1280,900,{practice:{rows:K.EXROWS}}), p=A.page;
   const F=await p.evaluate(()=>{ const out={n:0, bad:[]}; if(typeof easyFillMath!=='function') return {n:0, bad:['no easyFillMath']}; const dav=gN('Anthony Davis'); let seed=3; const rnd=()=>{ seed=(seed*1103515245+12345)%2147483648; return seed/2147483648; };
     for(const bk of ['Kalshi','Polymarket US']) for(let i=0;i<1500;i++){ const p0=+(0.2+rnd()*0.7).toFixed(2), st=+(2+rnd()*60).toFixed(2), r=Object.assign({}, dav, {book:bk, offeredProb:p0, offeredRaw:'-110', fairProb:Math.min(0.97,p0+0.14), mktProb:Math.min(0.97,p0+0.12), actProb:Math.min(0.97,p0+0.13), stake:st, kind:'prop', side:'O'});
       const n=easyNums(r); if(!n.ok) continue; out.n++; const M=easyFillMath(r, n.shares, n.limit); if(!M || M.cost!==n.cost || M.payout!==n.payout || M.wins!==n.wins) out.bad.push({bk, p0, st, shares:n.shares, lim:n.limit, tick:[n.cost,n.payout], line:M&&[M.cost,M.payout]}); }
     return out; });
   check('4k: the "That costs $X with the fee and pays $Y" line equals the ticket (most it can cost, pays) for the default shares and limit, on '+F.n+' generated Kalshi and Polymarket US picks', F.n>1500 && F.bad.length===0, F.bad.slice(0,3));
   check('4l: no page errors', A.errors.length===0, A.errors); await A.ctx.close(); }

 // ---------- 5. words ----------
 { const A=await open(b,1280,900), p=A.page;
   const W=await p.evaluate(()=>{ const luka=gN('Luka Doncic'), o={};
     const r100=Object.assign({}, luka, {offeredRaw:'+100', offeredProb:0.5, fairProb:0.66, mktProb:0.62, actProb:0.64}); o.p100=easyFairText(r100)&&easyFairText(r100).mean; o.p100price=easyPriceText(r100);
     const plus=Object.assign({}, luka, {offeredRaw:'+120', offeredProb:toProb('+120'), fairProb:0.5, mktProb:0.48, actProb:0.487}); const sp=easyStrictPrice(plus); o.plus={strict:sp&&sp.text, fair:easyFairText(plus)&&easyFairText(plus).rule};
     const minus=Object.assign({}, luka, {offeredRaw:'+105', offeredProb:toProb('+105')}); o.step4=easyTypeThis(minus)&&easyTypeThis(minus).steps[3]; o.minusStrict=easyStrictPrice(minus)&&easyStrictPrice(minus).text;
     o.edge=easyEdgeLines(luka).line2; const neg=Object.assign({}, luka, {actNet:-0.03}); o.edgeNeg=easyEdgeLines(neg).line2;
     const gl=k=>easyGloss(k); o.gloss={pass:gl('passing yard'), rec:gl('receiving yard'), ast:gl('assist')};
     const sack=Object.assign({}, gN('Isiah Pacheco'), {market:'0.5 Sacks', side:'O'}); const dsack=Object.assign({}, gN('Isiah Pacheco'), {market:'4.5 Defense Sacks', side:'O'}); o.sack=[easySentence(sack,true), easySentence(dsack,true)];
     return o; });
   check('5a (review 11): a +100 price is explained as +100: "+100 means you bet $100 to win $100." (never -100)', W.p100==='+100 means you bet $100 to win $100.' && W.p100price==='+100', {mean:W.p100, price:W.p100price});
   check('5b (review S3 list): for a plus price the rule says a bigger plus number is better, and does not talk about a smaller minus number', W.plus.strict && /^\+/.test(W.plus.strict) && /A bigger plus number is a better price\./.test(W.plus.fair) && !/smaller minus/.test(W.plus.fair), W.plus);
   check('5c (review 12): a minus rule with a plus price on the card says any plus number is also fine in the step that checks the price', /^At the book the price must read -?\d+ or better \(a smaller minus number, or any plus number\)\./.test(W.step4), {s:W.step4, strict:W.minusStrict});
   check('5d (review 13): the edge line says "more back" (or "less back"), not "cents back"', /about 5\.9 cents more back for each \$1 put in, on average, over many bets\./.test(W.edge) && /cents less back/.test(W.edgeNeg) && !/cents back/.test(W.edge+W.edgeNeg), {e:W.edge, n:W.edgeNeg});
   check('5e (review 14): the glosses are right (passing yards include the run after the catch; receiving yards are counted from the line to where he is stopped; a hockey assist can be one of two)', /including the run after the catch/.test(W.gloss.pass) && /from the line of scrimmage to where he is stopped/.test(W.gloss.rec) && /up to two players/.test(W.gloss.ast) && !/straight to/.test(W.gloss.ast), W.gloss);
   check('5f (review 15): the sack families (a shared sack counts half; "Defense Sacks" may be a team total) are not worded or shown', W.sack[0]===null && W.sack[1]===null, W.sack);
   check('5g: no page errors', A.errors.length===0, A.errors); await A.ctx.close(); }

 { // the moved card says what changed and never prints one number twice
   const A=await open(b,1280,900), p=A.page;
   const M=await p.evaluate(async()=>{ const out={}; easyRemember(); const bam=gN('Bam Adebayo'); const raw0=bam.offeredRaw;
     bam.offeredRaw='-253'; bam.offeredProb=toProb('-253'); const m1=easyMovedList().filter(m=>m.r===bam)[0]; out.a=m1 ? tx(ezMovedHtml(m1)) : null; out.aMost=m1&&[(m1.breakEven*100), (m1.most*100)];
     bam.offeredRaw='-260'; bam.offeredProb=toProb('-260'); const m2=easyMovedList().filter(m=>m.r===bam)[0]; out.b=m2 ? tx(ezMovedHtml(m2)) : null;
     bam.offeredRaw=raw0; bam.offeredProb=toProb(raw0); bam.fairProb=0.66; bam.mktProb=0.62; bam.actProb=0.64; const m3=easyMovedList().filter(m=>m.r===bam)[0]; out.c=m3 ? tx(ezMovedHtml(m3)) : null; return out;
     function tx(h){ const d=document.createElement('div'); d.innerHTML=h; return d.innerText.replace(/\s+/g,' ').trim(); } });
   check('5h (review 10): at -253 (just past her most) the break-even and her most are two different numbers (71.67% and 71.65%), never the same one twice', M.a && /needs a 71\.67% chance to break even\. The most La Contadora would pay is 71\.65%\./.test(M.a), {a:M.a, v:M.aMost});
   check('5i (review 9): a moved card says what changed: "What changed: the price." when it moved', M.b && /What changed: the price\./.test(M.b) && /Price before\s*-230/.test(M.b) && /Price now\s*-260/.test(M.b), M.b);
   check('5j (review 9): when only La Contadora\'s chance changed the card says so and shows the price once, not a before and now pair', M.c && /What changed: La Contadora’s chance\. The price is the same\./.test(M.c) && !/Price before/.test(M.c) && /Price now\s*-230/.test(M.c), M.c);
   check('5k: no page errors', A.errors.length===0, A.errors); await A.ctx.close(); }

 { // a win whose price was not saved is not a plain win with $0
   const A=await open(b,390,844), p=A.page;
   const B=await p.evaluate(()=>({so:easySoFar(), n:logged.length}));
   await p.evaluate(()=>{ logged.push({id:'nopx1', name:'Cole Anthony', sport:'NBA', market:'5.5 Rebounds', side:'O', kind:'prop', book:'DraftKings', odds:'', stake:10, result:'win', date:'2026-11-14', start:'2026-11-14T20:00:00Z', snap:{}}); saveLog(); refresh(); easyPaintBets(); });
   await K.tab(p,'v-ebets'); await p.waitForTimeout(300);
   const Z=await p.evaluate(()=>({so:easySoFar(), row:(document.querySelector('#exBets .ex-row[data-id="nopx1"]')||{innerText:''}).innerText.replace(/\s+/g,' '), st:easyStatusOf(logged.find(x=>x.id==='nopx1')), counts:[...document.querySelectorAll('#exBets .ex-f')].map(e=>e.innerText).join('|')}));
   check('5l (review 16): a win with no readable price is listed as "Price not saved", is not counted in So far (same bets, same money) and not in the Won filter', Z.st==='nopx' && /Price not saved/.test(Z.row) && /Won/.test(Z.row) && Z.so.bets===B.so.bets && Z.so.won===B.so.won && Z.so.profit===B.so.profit && /All \(\d+\)/.test(Z.counts), {z:Z.so, b:B.so, row:Z.row.slice(0,140)});
   check('5m: no page errors', A.errors.length===0, A.errors); await A.ctx.close(); }

 // ---------- 6. What filled? ----------
 { const A=await open(b,1280,900,{practice:{rows:K.EXROWS}}), p=A.page;
   const k=await p.evaluate(()=>easyList().picks.find(x=>x.book==='Polymarket US').key);
   await p.click('#ezList .ez-card[data-key="'+k.replace(/"/g,'\\"')+'"] [data-ez="open"]'); await p.waitForTimeout(250); const n0=await p.evaluate(()=>logged.length);
   await p.click('#ezPlaced'); await p.waitForSelector('#ezHost .ez-fillf'); await p.waitForFunction(()=>/The price changed/.test((document.getElementById('ezFNote')||{}).innerText||''),null,{timeout:9000});
   const F=await p.evaluate(()=>{ const tx=s=>String(s).replace(/\s+/g,' ').trim(); return {form:tx(document.getElementById('ezHost').innerText), sh:document.getElementById('ezFSh').value, px:document.getElementById('ezFPx').value, line:document.getElementById('ezFLine').innerText, note:document.getElementById('ezFNote').innerText, editor:!!document.querySelector('#ezHost .editor'), n:logged.length, pane:tx(document.getElementById('ezPick').innerText), nums:{sh:easyList().picks.find(x=>x.book==='Polymarket US').nums.shares, lim:easyList().picks.find(x=>x.book==='Polymarket US').nums.limit, card:easyCentsOf(easyList().picks.find(x=>x.book==='Polymarket US').r)}}; });
   check('6a: tapping I placed it on an exchange pick opens "What filled?" with the ticket\'s shares ('+F.nums.sh+') and the price on the card ('+F.nums.card+'¢, v5.24 step 5: not the limit, '+F.nums.lim+'¢) filled in, and saves nothing yet', /What filled\?/.test(F.form) && +F.sh===F.nums.sh && +F.px===F.nums.card && F.nums.card<F.nums.lim && F.n===n0 && !F.editor, {sh:F.sh, px:F.px, n:F.n});
   check('6b: the live line reads "That costs $9.40 with the fee and pays $16.00 if it happens." for 16 shares at the card\'s 57¢ (step 5: it was $9.87 at the 60¢ limit)', F.line==='That costs $9.40 with the fee and pays $16.00 if it happens.' && +F.sh===16 && +F.px===57, F.line);
   check('6c: when the live price changed it says "The price changed. Check the price at the book, then tell us what filled." and still shows the form', F.note==='The price changed. Check the price at the book, then tell us what filled.', F.note);
   check('6d: the pick page shows no God form and no EV or God word', !F.editor && !K.GODONLY.test(F.pane) && !/\bEV\b|Sentinel|Worth it|Save bet/.test(F.pane), F.pane.slice(0,200));
   await p.fill('#ezFPx','65'); await p.waitForTimeout(100); const W65=await p.evaluate(()=>({warn:document.getElementById('ezFWarn').innerText, line:document.getElementById('ezFLine').innerText}));
   check('6e: a price above her most gets the calm warning "This is above the most La Contadora would pay" and is still allowed', /^This is above the most La Contadora would pay \(60¢\)\./.test(W65.warn) && /That costs \$/.test(W65.line), W65);
   await p.fill('#ezFPx','55'); await p.fill('#ezFSh','12'); await p.waitForTimeout(100);
   const L55=await p.evaluate(()=>({warn:document.getElementById('ezFWarn').innerText, line:document.getElementById('ezFLine').innerText, M:easyFillMath(easyRowByKey(window._ezS.formPick.key), 12, 55)}));
   check('6f: 12 shares at 55¢ gives the line from the fee math ($'+(L55.M&&L55.M.cost)+' and pays $12.00) and no warning', L55.warn==='' && L55.line==='That costs '+'$'+L55.M.cost.toFixed(2)+' with the fee and pays $12.00 if it happens.', L55);
   await p.fill('#ezFSh','10.5'); await p.waitForTimeout(100); const WH=await p.evaluate(()=>document.getElementById('ezFLine').innerText);
   check('6g: Polymarket US takes whole shares: 10.5 shares says so', /whole shares/.test(WH), WH);
   check('6h: no page errors', A.errors.length===0, A.errors); await A.ctx.close(); }

 for(const [label, name, book, wantRows] of [['Polymarket US','Anthony Davis','Polymarket US',K.EXROWS], ['Kalshi','Anthony Davis','Kalshi',rs=>{ rs.forEach(r=>{ if(r.name==='Anthony Davis' && /poly/i.test(r.book)){ r.book='Kalshi'; r.fairProb=0.645; r.mktProb=0.62; r.offeredProb=0.57; r.offeredRaw='-133'; } }); return rs; }]]){
   // the record the Easy form saves is IDENTICAL to a God user typing the same fill by hand (Cost, Price and Pays back)
   const strip=o=>{ const j=JSON.parse(JSON.stringify(o)); const walk=x=>{ if(Array.isArray(x)) return x.map(walk); if(x && typeof x==='object'){ const y={}; Object.keys(x).sort().forEach(k=>{ y[k]=walk(x[k]); }); return y; } if(typeof x==='string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d/.test(x) && !/^\d{4}-\d\d-\d\dT00:00:00/.test(x)) return '<time>'; return x; }; const w=walk(j); delete w.id; return w; };
   const flat=(o,pre,out)=>{ out=out||{}; if(Array.isArray(o)||(o&&typeof o==='object')){ Object.keys(o).forEach(k=>flat(o[k],(pre?pre+'.':'')+k,out)); } else out[pre]=o; return out; };
   const A1=await open(b,1280,900,{practice:{rows:wantRows}}), A2=await open(b,1280,900,{practice:{rows:wantRows}, easy:false}), p1=A1.page, p2=A2.page;
   const k=await p1.evaluate(()=>easyList().picks.find(x=>x.r.name==='Anthony Davis').key); const info=await p1.evaluate(()=>{ const x=easyList().picks.find(q=>q.r.name==='Anthony Davis'); return {fam:passFam(x.r), sh:x.nums.shares, lim:x.nums.limit, cost:x.nums.cost, payout:x.nums.payout}; });
   const typed=[[info.sh, info.lim],[Math.max(1,Math.floor(info.sh)-2), info.lim-4]];
   for(const [sh,cents] of typed){
     const M=await p1.evaluate(([key,s,c])=>easyFillMath(easyRowByKey(key), s, c), [k,sh,cents]);
     // Easy form
     await p1.evaluate(key=>{ ezS().key=key; easyPaintToday(); }, k); await p1.waitForSelector('#ezPlaced'); await p1.click('#ezPlaced'); await p1.waitForSelector('#ezHost .ez-fillf');
     await p1.fill('#ezFSh', String(sh)); await p1.fill('#ezFPx', String(cents)); await p1.click('#ezFSave'); await p1.waitForSelector('#ezPick .ez-conf',{timeout:9000});
     const rec1=await p1.evaluate(()=>JSON.parse(JSON.stringify(logged[logged.length-1]))), conf=await p1.evaluate(()=>document.querySelector('#ezPick .ez-conf').innerText.replace(/\s+/g,' '));
     // God, by hand: the same card in its own tab, "I bet this", then type Cost, Price and Pays back
     await p2.evaluate(m=>setMode(m), info.fam); await p2.waitForTimeout(450); const idx=await p2.evaluate(()=>String(gN('Anthony Davis').idx)); const n2=await p2.evaluate(()=>logged.length);
     await p2.click('#placeCards .sc-card[data-idx="'+idx+'"] .bet-btn'); await p2.waitForSelector('#placeCards .editor .eb-save');
     await p2.waitForFunction(()=>{ const l=document.querySelector('#placeCards .editor .eb-live'); return !l || !/checking/.test(l.textContent); },null,{timeout:8000}); await p2.waitForTimeout(200);
     await p2.fill('#placeCards .editor .eb-cost', M.cost.toFixed(2)); await p2.fill('#placeCards .editor .eb-pct', String(cents)); await p2.fill('#placeCards .editor .eb-win', M.payout.toFixed(2));
     for(let i=0;i<3 && (await p2.evaluate(n=>logged.length===n,n2));i++){ await p2.click('#placeCards .editor .eb-save'); await p2.waitForTimeout(300); }
     const rec2=await p2.evaluate(()=>JSON.parse(JSON.stringify(logged[logged.length-1])));
     const a=flat(strip(rec1)), c=flat(strip(rec2)), keys=[...new Set(Object.keys(a).concat(Object.keys(c)))], diff=keys.filter(x=>JSON.stringify(a[x])!==JSON.stringify(c[x]));
     check('6i ('+label+', '+sh+' shares at '+cents+'¢): the record Easy saves is identical to a God user typing Cost $'+M.cost.toFixed(2)+', Price '+cents+', Pays back $'+M.payout.toFixed(2)+' ('+keys.length+' fields compared; ids and clock times aside)', diff.length===0 && keys.length>60 && rec1.stake===M.cost && rec1.towin===+(M.payout-M.cost).toFixed(2), {fields:keys.length, diff:diff.map(x=>[x,a[x],c[x]]).slice(0,8), stake:rec1.stake, towin:rec1.towin});
     check('6j ('+label+'): the record shows what was typed: stake = cost, a win pays the typed total (betProfit = pays − cost to the cent), and the confirmation says it', (await p1.evaluate(b=>betProfit(Object.assign({}, b, {result:'win'})), rec1))===+(M.payout-M.cost).toFixed(2) && new RegExp('cost \\$'+M.cost.toFixed(2).replace('.','\\.')+' · pays \\$'+M.payout.toFixed(2).replace('.','\\.')+' if it happens').test(conf) && !/ticket/i.test(conf), {conf:conf.slice(0,200)});
     // Undo works on it (an Easy bet), and the pick is back, for the next typed fill
     await p1.click('#ezPick [data-ez="undo"]'); await p1.waitForTimeout(400);
     const gone=await p1.evaluate(()=>!logged.some(x=>x.name==='Anthony Davis')); check('6k ('+label+'): Undo removes the bet the form saved', gone, gone);
     await p2.evaluate(()=>{ const i=logged.findIndex(x=>x.name==='Anthony Davis'); if(i>=0) logged.splice(i,1); saveLog(); refresh(); }); }
   check('6l ('+label+'): no page errors', A1.errors.length===0 && A2.errors.length===0, A1.errors.concat(A2.errors)); await A1.ctx.close(); await A2.ctx.close(); }

 { // the form never saves a second copy, never mentions a God form, and a limit the person set needs a second tap
   const A=await open(b,1280,900,{practice:{rows:K.EXROWS}}), p=A.page; await A.ctx.route(isLive, LIVE(0.57));
   const k=await p.evaluate(()=>easyList().picks.find(x=>x.book==='Polymarket US').key);
   await p.evaluate(key=>{ ezS().key=key; easyPaintToday(); }, k); await p.click('#ezPlaced'); await p.waitForSelector('#ezHost .ez-fillf'); await p.waitForTimeout(100);
   await p.evaluate(key=>{ window.__x=ezFillSaveUi(key); }, k); await p.waitForTimeout(700);
   await p.evaluate(key=>{ const r=easyRowByKey(key); addToLog(Object.assign({}, r)); refresh(); }, k); await p.waitForTimeout(3500);
   const D=await p.evaluate(()=>({copies:logged.filter(x=>x.name==='Anthony Davis').length, pane:document.getElementById('ezPick').innerText.replace(/\s+/g,' '), conf:!!document.querySelector('#ezPick .ez-conf')}));
   check('6m (S1-2 for the form): the same pick saved elsewhere while the form waits for the live read is not saved again: one copy, and the page says it is already in My bets', D.copies===1 && !D.conf && /already in My bets/.test(D.pane), D);
   check('6n: no page errors', A.errors.length===0, A.errors); await A.ctx.close(); }

 // ---------- 7. small bankroll ----------
 for(const [bank, expectMsg] of [[200,true],[2000,false]]){
   const A=await open(b,1280,900), p=A.page;
   await p.evaluate(v=>{ const i=document.getElementById('bank'); i.value=String(v); i.dispatchEvent(new Event('input',{bubbles:true})); i.dispatchEvent(new Event('change',{bubbles:true})); }, bank); await p.waitForTimeout(1000); await p.evaluate(()=>easyPaintToday()); await p.waitForTimeout(300);
   const S=await p.evaluate(()=>{ const L=easyList(), N=easyListNoStake(); return {bank:cfgRead().bank, list:L.total, noStake:N.total, h:(document.querySelector('#ezList .ez-h')||{innerText:''}).innerText, text:document.getElementById('ezList').innerText.replace(/\s+/g,' '), link:!!document.querySelector('#ezList [data-ez="settings"]'), stakes:lastRows.filter(r=>r.pass).map(r=>r.stake)}; });
   if(expectMsg){
     check('7a ($'+bank+'): no pick gets a stake, so Today says how many prices are worth paying and why none is shown (under $1 with the money set aside) and never "a normal day"', S.bank===bank && S.list===0 && S.noStake>0 && new RegExp('\\d+ prices? (is|are) worth paying today, but with \\$'+bank+' set aside the bet the app suggests is under \\$1, so (it is|they are) not listed\\. (About \\$[\\d,]+ or more lists at least one pick\\. )?Put a bigger number in Settings to see (them|it)\\.').test(S.text) && !/normal day/.test(S.text) && S.link, {list:S.list, noStake:S.noStake, h:S.h, link:S.link});
     await p.click('#ezList [data-ez="settings"]'); await p.waitForTimeout(400); const v=await p.evaluate(()=>(document.querySelector('.view.on')||{}).id);
     check('7b ($'+bank+'): the Settings link goes to Settings, where the money set aside is changed', v==='v-esettings', v);
     // raising it brings the picks back, with no change to how a stake is sized: the stakes are the board's own
     await p.evaluate(()=>{ const i=document.getElementById('bank'); i.value='2000'; i.dispatchEvent(new Event('input',{bubbles:true})); i.dispatchEvent(new Event('change',{bubbles:true})); }); await p.waitForTimeout(900);
     const back=await p.evaluate(()=>({list:easyList().total, st:easyList().picks.map(x=>x.nums.st)})); check('7c: at $2,000 the five picks are back with their $10 stakes (unchanged sizing)', back.list===5 && back.st.slice(0,4).every(x=>x===10), back);
   } else check('7d ($'+bank+'): with a bigger number nothing says the bet is under $1 and the five picks are listed', S.list===5 && !/under \$1 with the money you set aside/.test(S.text) && S.link===false, {list:S.list, h:S.h});
   check('7e ($'+bank+'): no page errors', A.errors.length===0, A.errors); await A.ctx.close(); }

 // ---------- 8. My bets: the dev note about parlays ----------
 { const A=await open(b,1280,900), p=A.page; await K.tab(p,'v-ebets');
   const D=await p.evaluate(()=>({note:(document.querySelector('#exBets .ex-dev')||{innerText:''}).innerText.replace(/\s+/g,' ').trim(), par:logged.filter(x=>x.kind==='parlay').length, settled:+logged.filter(x=>x.kind==='parlay').reduce((t,x)=>t+(betProfit(x)==null?0:betProfit(x)),0).toFixed(2)}));
   check('8a: in the dev app the totals say what they leave out: "Dev: these totals leave out N parlays ($X settled)."', D.par===2 && new RegExp('^Dev: these totals leave out 2 parlays \\(.*'+Math.abs(D.settled).toFixed(2).replace('.','\\.')+' settled.*\\)\\. In play and All count single bets only\\.$').test(D.note), D);
   check('8b: no page errors', A.errors.length===0, A.errors); await A.ctx.close(); }
 { const A=await open(b,1280,900,{html:cust, easy:false, pre:async p=>{ await p.evaluate(()=>{ localStorage.setItem('mbev.easy','{"welcomed":1}'); }); await p.reload(); await p.waitForTimeout(2500); }}), p=A.page; await K.tab(p,'v-ebets');
   const D=await p.evaluate(()=>({dev:typeof DEV_APP!=='undefined' && DEV_APP, level:easyLevel(), text:document.getElementById('exBets').innerText, note:!!document.querySelector('#exBets .ex-dev'), par:logged.filter(x=>x.kind==='parlay').length}));
   check('8c: a customer build never shows the dev note, and no word about parlays', D.dev===false && D.level==='easy' && D.par>0 && !D.note && !/parlay|Dev:/i.test(D.text), {dev:D.dev, par:D.par});
   check('8d: no page errors', A.errors.length===0, A.errors); await A.ctx.close(); }

 await b.close();
 console.log('\n'+T.pass+' passed, '+T.fail+' failed'); process.exit(T.fail?1:0);
})();
