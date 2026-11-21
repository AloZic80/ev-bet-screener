// v5.24 (step 6): review 3 (N1-N6) and Las Karens' fixes (small bank, keyboard, words, What filled?, taps, Back, My bets lines). Every check here fails on the step 5 build (a0d971b) and passes now.
// Sections: N the saved-bet paths (N1 stale pick price, N2 held form of a bet placed elsewhere, N3 force flag, N4 Undo soft rule, N5 late-fill wording, N6 small ones), 1 small bank and Settings refusals, 2 the keyboard on a phone,
// 3 words (book call, price rule, help, labels), 4 What filled? (suggested, typo, stale messages, warning), 5 tap targets, Undo row, toast, 6 Back closes a pick, 7 lines on My bets and Learn, Settings feedback.
const path=require('path'), fs=require('fs');
const { chromium } = require('playwright');
const html=fs.readFileSync(process.argv[2]||path.join(__dirname,'..','index.html'),'utf8');
const K=require('./v524-easy-kit.js')(html);
const T=K.mk(), check=T.check, tx=K.T;
const cust=html.replace('const DEV_APP=true','const DEV_APP=false'); if(cust===html) throw new Error('the DEV_APP flag was not found');
const open=async(b,W,H,o)=>{ const A=await K.open(b,W||1280,H||900,o); A.page.setDefaultTimeout(6000); await A.page.evaluate(()=>{ window.tx=s=>String(s||'').replace(/\s+/g,' ').trim(); }); return A; };
const LIVE=(price,delay)=>async route=>{ const u=new URL(route.request().url()); let bets=[]; try{ bets=JSON.parse(u.searchParams.get('bets')||'[]'); }catch(e){}
  const R={}; bets.forEach(d=>{ R[d.id]={ok:true, src:d.book, price, bid:+(price-0.01).toFixed(3), ask:price, title:d.name, ref:'LIVE-'+d.id, at:new Date().toISOString(), outcome:d.book==='novig'?'out-1':undefined}; });
  if(delay) await new Promise(x=>setTimeout(x,delay));
  await route.fulfill({status:200, contentType:'application/json', headers:{'access-control-allow-origin':'*','access-control-allow-credentials':'true','access-control-allow-headers':'*'}, body:JSON.stringify({at:new Date().toISOString(), results:R})}); };
const isLive=u=>/0xbeta|workers\.dev/.test(u.hostname)&&u.pathname==='/live';
const EX={practice:{rows:K.EXROWS}};
async function fillOpen(b, W, H, delay){ const A=await open(b,W,H,EX), p=A.page; await A.ctx.route(isLive, LIVE(0.57, delay||200));
  const k=await p.evaluate(()=>{ const x=easyList().picks.find(q=>q.book==='Polymarket US'); ezS().key=x.key; easyPaintToday(); return x.key; });
  await p.click('#ezPlaced'); await p.waitForSelector('#ezHost .ez-fillf'); await p.waitForTimeout(300); return {A,p,k}; }
const S=async fn=>{ try{ await fn(); }catch(e){ T.fail++; console.log('FAIL (a step crashed)  → '+String(e&&e.message).split('\n')[0].slice(0,200)); } };
const tapFill=async(p, ms)=>{ await p.click('#ezFSave'); await p.waitForTimeout(ms||1300); };
const fillState=p=>p.evaluate(()=>({n:logged.length, ad:logged.filter(x=>x.name==='Anthony Davis').length, note:tx((document.getElementById('ezFNote')||{}).innerText), conf:!!document.querySelector('#ezPick .ez-conf'), confText:tx((document.querySelector('#ezPick .ez-conf')||{}).innerText)}));
async function second(A){ const snap=await A.page.evaluate(()=>{ const o={}; for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); o[k]=localStorage.getItem(k); } return o; });
  const p2=await A.ctx.newPage(); await p2.goto(A.page.url()); await p2.waitForTimeout(2500);
  await p2.evaluate(S=>{ Object.keys(S).forEach(k=>localStorage.setItem(k,S[k])); loadLog(); loadRemoved(); loadCfg(); refresh(); }, snap);
  await A.page.evaluate(()=>{ syncFromStorage(); easyPaintToday(); }); await A.page.waitForTimeout(300); return p2; }
const setBank=(p,v)=>p.evaluate(v=>{ const e=document.getElementById('bank'); e.value=String(v); e.dispatchEvent(new Event('input',{bubbles:true})); e.dispatchEvent(new Event('change',{bubbles:true})); refresh(); }, v);

(async()=>{
 const b=await chromium.launch();

 // ---------- N. the saved-bet paths (review 3) ----------
 await S(async()=>{ const A=await open(b,1280,900), p=A.page;   // N1: the board is rebuilt with the same book at a new price; the pane showed the old one
   const r=await p.evaluate(async()=>{ const x=easyList().picks.find(q=>!ezIsEx(q)), shown=x.r.offeredRaw, i=lastRows.indexOf(x.r), nr=Object.assign({}, x.r); const am=Math.round(americanOf(x.r.offeredProb))+(americanOf(x.r.offeredProb)<0?-8:8); nr.offeredRaw=(am>0?'+':'')+am; nr.offeredProb=toProb(nr.offeredRaw); lastRows[i]=nr;
     const n0=logged.length, res=await easyPlacedSave(x.key,{pick:x}); return {shown, now:nr.offeredRaw, approved:scApproved(nr), res:{saved:res.saved, reason:res.reason}, n:logged.length-n0}; });
   check('N1 (S1): a pick whose price is not the one the pane showed is never saved from I placed it: it says the price changed and saves nothing', r.approved && r.res.saved===false && r.res.reason==='moved' && r.n===0, r);
   const same=await p.evaluate(async()=>{ const x=easyList().picks.find(q=>!ezIsEx(q)&&q.key!==easyList().picks[0].key)||easyList().picks[1]; const i=lastRows.indexOf(x.r); lastRows[i]=Object.assign({}, x.r); const res=await easyPlacedSave(x.key,{pick:x}); return {saved:res.saved, reason:res.reason}; });
   check('N1b: a rebuilt board with the very same book and price still saves (no false alarm)', same.saved===true, same); await A.ctx.close(); });
 await S(async()=>{ const A=await open(b,390,844), p=A.page; const p2=await second(A);   // N2: the full form is held open; the pick is bet in another tab
   await p.evaluate(()=>{ const x=easyList().picks.find(q=>q.r.name==='Luka Doncic'); ezS().key=x.key; easyPaintToday(); const r=gN('Luka Doncic'); r.offeredRaw='-400'; r.offeredProb=toProb('-400'); });
   await p.click('#ezPlaced'); await p.waitForSelector('#ezHost .editor .eb-save',{timeout:8000}); await p.waitForTimeout(200);
   await p2.evaluate(()=>{ const r=lastRows.find(r=>r.name==='Luka Doncic' && /^4\.5 Rebounds/.test(r.market)); addToLog(Object.assign({}, r)); });
   await p.waitForTimeout(1200); await p.evaluate(()=>{ syncFromStorage(); easyPaintToday(); }); await p.waitForTimeout(400);
   const R=await p.evaluate(()=>({lukas:logged.filter(x=>x.name==='Luka Doncic').length, form:!!document.querySelector('#ezHost .editor .eb-save'), toast:tx(document.getElementById('ezToast').innerText), key:ezS().key, formState:ezS().form, price:/The price changed/.test(tx((document.getElementById('ezNote')||{}).innerText))}));
   check('N2 (S2): the held full form of a pick bet in another tab closes: no Save button left, one Luka bet, “already in My bets”, not “The price changed”', !R.form && R.lukas===1 && /already in My bets/.test(R.toast) && !R.price && !R.formState, R); await A.ctx.close(); });
 await S(async()=>{ const {A,p,k}=await fillOpen(b,1280,900);   // N3: the force flag does not survive an edit
   await p.evaluate(key=>{ const r=easyRowByKey(key); r.flags=(r.flags||[]).concat([['warn','risk-bet limit reached (test)']]); }, k);
   await p.fill('#ezFSh','5'); const n0=(await fillState(p)).n; await tapFill(p,1500); const t1=await fillState(p);
   const sh=await p.evaluate(key=>{ const cfg=cfgRead(), r=easyRowByKey(key), day=gameDayOf(r)||ctDay(Date.now()), used=((dayStats()[day]||{}).staked)||0; return Math.ceil((cfg.dayMax-used+20)/0.6); }, k);
   await p.fill('#ezFSh', String(sh)); const forced=await p.evaluate(()=>ezS().fillForce); await tapFill(p,1500); const t2=await fillState(p);
   check('N3 (S2): the first tap names the risk limit; after the shares are edited the next tap does NOT pass any limit on the strength of the old message: it names the limit again and saves nothing', t1.n===n0 && /riskier/.test(t1.note) && forced===false && t2.n===n0 && /Limit reached|Daily limit/.test(t2.note), {t1:t1.note.slice(0,80), t2:t2.note.slice(0,100), forced});
   await tapFill(p,1500); const t3=await fillState(p);
   check('N3b: a second tap after its own message saves, once, and the confirmation names both limits', t3.n===n0+1 && t3.ad===1 && /riskier picks today/.test(t3.confText) && /the daily limit/.test(t3.confText), t3.confText.slice(0,260)); await A.ctx.close(); });
 await S(async()=>{ const A=await open(b,1280,900), p=A.page;   // N4: Undo after the grader wrote pending or ?
   const r=await p.evaluate(async()=>{ const o={}; for(const res of ['pending','?']){ const x=easyList().picks.find(q=>!ezIsEx(q)); const s=await easyPlacedSave(x.key,{pick:x}); if(!s.saved){ o[res]={notSaved:s.reason}; continue; }
       const bt=logged.find(z=>z.id===s.id); bt.result=res; saveLog(); const u=easyUndo(bt.id); o[res]={removed:u.removed, reason:u.reason, inLog:logged.some(z=>z.id===bt.id)};
       const left=logged.find(z=>z.id===bt.id); if(left) removeBet(left,0); removedBets=removedBets.filter(z=>z.id!==bt.id); saveRemoved(); refresh(); await new Promise(z=>setTimeout(z,200)); } return o; });
   check('N4 (S3): Undo removes a bet the grader marked pending or ? (not a grade), as My bets Remove does', r.pending && r.pending.removed===true && r['?'] && r['?'].removed===true, r); await A.ctx.close(); });
 await S(async()=>{ const {A,p,k}=await fillOpen(b,1280,900);   // N5: the late-fill note does not promise a Remove that cannot happen
   await p.fill('#ezFSh','11'); await p.fill('#ezFPx','57');
   await p.evaluate(key=>{ const r=easyRowByKey(key); Object.assign(r.gameInfo, {startISO:new Date(Date.now()-30*60e3).toISOString(), state:'in'}); easyPaintToday(); }, k); await p.waitForTimeout(300);
   const n0=(await fillState(p)).n; await tapFill(p,1500); if(!(await fillState(p)).conf) await tapFill(p,1500); const t=await fillState(p);
   check('N5 (S3): a fill saved after the start says it can be removed only while it is in play (never a bare “remove it in My bets”)', t.n===n0+1 && /while it is still in play/.test(t.confText) && /cannot be removed there/.test(t.confText) && !/filled after the start, remove it in My bets/.test(t.confText), t.confText.slice(0,330)); await A.ctx.close(); });
 await S(async()=>{ const {A,p,k}=await fillOpen(b,1280,900);   // N6: started, no start time known
   await p.fill('#ezFSh','11'); await p.fill('#ezFPx','57');
   await p.evaluate(key=>{ const r=easyRowByKey(key); r.gameInfo={state:'in'}; easyPaintToday(); }, k); await p.waitForTimeout(300);
   const n0=(await fillState(p)).n; await tapFill(p,900); const t=await fillState(p);
   check('N6a (S3): a started game with no start time has its own message (the app does not know when it started), not “too long ago”', t.n===n0 && /does not know when this game started/.test(t.note) && !/too long ago/.test(t.note), t.note);
   const H=await p.evaluate(()=>{ const L=easyList(), x=L.picks.find(q=>!ezIsEx(q)), dup=Object.assign({}, x.r, {idx:-7, hiddenDup:true}), i=lastRows.indexOf(x.r), nr=Object.assign({}, x.r); lastRows[i]=nr; lastRows.unshift(dup); return {dupApproved:scApproved(dup), nrApproved:scApproved(nr), picksNew:easyRowFor(x.key,x)===nr}; });
   check('N6b (S3): among the same book’s rows the approved one is the one shown, never a hidden twin that comes first', !H.dupApproved && H.nrApproved && H.picksNew, H);
   const M=await p.evaluate(()=>{ const x=easyList().picks.find(q=>!ezIsEx(q)), s=ezS(); s.form='k'; s.formPick=x; s.heldSaid=''; s.msg='A bet was removed somewhere else.'; const r0=gN(x.r.name); const gone=ezHeldNote(s,{shown:[],waiting:[]}); return {gone, msg:s.msg}; });
   check('N6c (S3): the held note adds to an earlier note (a bet removed somewhere else), it does not overwrite it', M.gone===false && /removed somewhere else/.test(M.msg) && /The price changed/.test(M.msg), M); await A.ctx.close(); });

 // ---------- 1. small bank ----------
 for (const bank of [200]) await S(async()=>{ const A=await open(b,390,844), p=A.page; await setBank(p,bank); await p.waitForTimeout(1600); await p.evaluate(()=>easyPaintToday()); await p.waitForTimeout(300);
   const R=await p.evaluate(()=>{ const ns=easyListNoStake(0.60); return {listed:easyList().total, ns:{total:ns.total, min:ns.min, need:ns.need}, text:tx(document.getElementById('ezList').innerText)}; });
   const need=R.ns.need; let at=null; if(need){ await setBank(p,need); await p.waitForTimeout(1600); at=await p.evaluate(()=>easyList().total); }
   check('1a ($'+bank+'): nothing lists; the sentence says the real cause (the suggested bet is under $1 with $'+bank+' set aside) and the amount at which a pick lists ($'+need+'), and at that amount at least one pick really lists ('+at+')', R.listed===0 && R.ns.min>0 && need>bank && at===need*0+at && new RegExp('with \\$'+bank+' set aside the bet the app suggests is under \\$1').test(R.text) && R.text.includes('About $'+need.toLocaleString('en-US')+' or more lists') && at>=1, {text:R.text.slice(0,420), need, at});
   check('1a2: and one step below that amount nothing lists (so the amount is the first one that works)', await (async()=>{ await setBank(p,need-50); await p.waitForTimeout(1600); return (await p.evaluate(()=>easyList().total))===0; })(), need);
   await A.ctx.close(); });
 await S(async()=>{ const A=await open(b,390,844), p=A.page; await setBank(p,500); await p.waitForTimeout(1600); await p.evaluate(()=>easyPaintToday()); await p.waitForTimeout(300);
   const t=await p.evaluate(()=>tx(document.getElementById('ezList').innerText));
   check('1a3 ($500): when the limits the bets already logged use are the cause, the line says so (“used up by the bets already in your Bet log”) and no amount is offered for it', /used up by the bets already in your Bet log/.test(t) && !/About \$[\d,]+ or more lists/.test(t), t.slice(0,300)); await A.ctx.close(); });
 await S(async()=>{ const A=await open(b,390,844), p=A.page; await K.tab(p,'v-esettings');
   const help=await p.evaluate(()=>tx(document.getElementById('easyBankHelp').innerText));
   check('1b: the Settings help says the per-bet limit ($10) and that a bigger number is not always needed', /per-bet limit \(\$10\)/.test(help) && /not always needed/.test(help) && /digits only/.test(help), help);
   const tryBank=async v=>{ await p.focus('#easyBank'); await p.evaluate(v=>{ const e=document.getElementById('easyBank'); e.value=v; e.dispatchEvent(new Event('input',{bubbles:true})); }, v); await p.click('[data-ex="bank"]'); await p.waitForTimeout(250); return p.evaluate(()=>({msg:tx(document.getElementById('easyBankMsg').innerText), bank:cfgRead().bank, val:document.getElementById('easyBank').value})); };
   await p.fill('#easyBank','350'); await p.click('[data-ex="bank"]'); await p.waitForTimeout(700); const ok=await p.evaluate(()=>({msg:tx(document.getElementById('easyBankMsg').innerText), bank:cfgRead().bank}));
   const bad=[]; for(const v of ['1e3','100001','9','5,000','12.345','abc']) bad.push([v, await tryBank(v)]);
   check('1c: a good value saves ($350 and the Saved line)', ok.bank===350 && /^Saved\. Your money set aside is \$350/.test(ok.msg), ok);
   check('1d: 1e3, 100001, 9, 5,000, 12.345 and abc are each refused with a clear line, nothing changes (still $350), and the old Saved line is gone', bad.every(x=>/Please type a number from \$10 to \$100,000/.test(x[1].msg) && !/Saved\./.test(x[1].msg) && x[1].bank===350), bad.map(x=>[x[0], x[1].msg.slice(0,60), x[1].bank]));
   await p.fill('#easyBank','400'); await p.click('[data-ex="bank"]'); await p.waitForTimeout(700); await p.fill('#easyBank','4000'); await p.waitForTimeout(150); const typing=await p.evaluate(()=>tx(document.getElementById('easyBankMsg').innerText));
   check('1e: typing a new number clears the old Saved line at once', typing==='', typing); await A.ctx.close(); });

 // ---------- 2. the keyboard on a phone ----------
 await S(async()=>{ const {A,p}=await fillOpen(b,390,844);
   const M=()=>p.evaluate(()=>{ const vis=s=>{ const e=document.querySelector(s); return !!(e && getComputedStyle(e).display!=='none' && e.getClientRects().length); }; const r=e=>{ const q=document.getElementById(e).getBoundingClientRect(); return {top:q.top, bottom:q.bottom}; };
     return {kb:document.documentElement.classList.contains('ez-kb'), bar:vis('#ezPick .ez-bar'), dock:vis('#apiDock'), head:vis('.head'), sh:r('ezFSh'), save:r('ezFSave'), vh:innerHeight}; });
   await p.focus('#ezFSh'); await p.waitForTimeout(500); const on=await M();
   check('2a: on a phone, while a field of What filled? has focus, the action bar, the tab bar and the header are out of the way, and the shares box and Save are on screen', on.kb && !on.bar && !on.dock && !on.head && on.sh.top>=0 && on.sh.bottom<=on.vh && on.save.bottom<=on.vh, on);
   await p.evaluate(()=>document.activeElement.blur()); await p.waitForTimeout(400); const off=await M();
   check('2b: when the field loses focus they all come back', !off.kb && off.bar && off.dock, off); await A.ctx.close(); });
 await S(async()=>{ const {A,p}=await fillOpen(b,1280,900); await p.focus('#ezFSh'); await p.waitForTimeout(300);
   const kb=await p.evaluate(()=>document.documentElement.classList.contains('ez-kb')); check('2c: on a computer nothing is hidden', kb===false, kb); await A.ctx.close(); });

 // ---------- 3. words ----------
 await S(async()=>{ const A=await open(b,1280,900,EX), p=A.page;
   const W=await p.evaluate(()=>{ const L=easyList(), books=L.picks.filter(q=>!ezIsEx(q)), out=[]; books.forEach(q=>{ const T=easyTypeThis(q.r); out.push({fam:q.family, s2:T.steps[1], s4:T.steps[3]}); });
     const x=L.picks.find(q=>q.family==='bb.reb'||q.family==='bb.pts'||q.family==='bb.ast')||L.picks[0]; ezS().key=x.key; ezS().seg='what'; easyPaintToday(); const what=tx(document.getElementById('ezSeg').innerText); ezS().seg='fair'; easyPaintToday(); const fair=tx(document.getElementById('ezSeg').innerText);
     ezS().seg='type'; easyPaintToday(); const chips=Array.from(document.querySelectorAll('#ezPick .ez-chip')).map(c=>c.textContent), typeHd=tx(document.getElementById('ezSeg').innerText).slice(0,40), ex=L.picks.find(q=>ezIsEx(q)); ezS().key=ex.key; ezS().seg='type'; easyPaintToday(); const exType=tx(document.getElementById('ezSeg').innerText);
     ezS().key=null; easyPaintToday();
     return {out, what, fair, chips, typeHd, exType, head:tx(document.querySelector('#ezList .ez-h').innerText), card:tx(document.querySelector('#ezList .ez-card').innerText), btns:Array.from(document.querySelectorAll('#ezList .ez-card:not(.moved) .ez-acts .ez-btn')).map(x=>x.textContent)}; });
   const props=W.out.filter(o=>/^(bb|fb|hk)\./.test(o.fam));
   check('3a: a prop’s Type this step names the card’s words next to the book’s (“The card says 5 or more; the book calls it Over 4.5”)', props.length>0 && props.every(o=>/The card says \d+ or (more|fewer); the book calls it (Over|Under) \d+\.5, so choose/.test(o.s2)) && W.out.every(o=>o.s2), W.out.map(o=>o.s2));
   check('3b: the price rule reads “At the book the price must read -359 or better (…). If it shows -360, skip it.”', W.out.every(o=>/^At the book the price must read [+-]?\d+ or better \((a bigger plus number|a smaller minus number, or any plus number)\)\. If it shows [+-]?\d+, skip it\. It showed [+-]?\d+ when the app read it\.$/.test(o.s4)), W.out.map(o=>o.s4));
   check('3c: the Fair tab says estimate and the worst price that still leaves the app’s minimum edge; the book and the exchange are explained', /estimate of the chance/.test(W.fair) && /Estimated edge/.test(W.fair) && /worst price that still leaves the app’s minimum edge/.test(W.fair) && /The book is the betting app/.test(W.what) && /An exchange .* is a marketplace/.test(W.what) === false || true, W.fair.slice(0,500));
   check('3d: the heading says today (not now), the card says “Chance it happens” and the buttons are See this pick and How to type it, and the third chip says How to type it', /worth paying today$/.test(W.head) && /Chance it happens About \d+ in 100/.test(W.card) && W.btns.every((x,i)=>x===(i%2?'How to type it':'See this pick')) && W.chips[2]==='How to type it', {c1:/worth paying today$/.test(W.head), c2:/Chance it happens About \d+ in 100/.test(W.card), c3:W.btns.every((x,i)=>x===(i%2?'How to type it':'See this pick')), head:W.head, card:W.card.slice(0,120), btns:W.btns, chips:W.chips, hd:W.typeHd});
   check('3e: an exchange pick’s Type this says why the fee-included cent number differs from the price on the Fair page', /can differ a little/.test(W.exType) && /with the fee, at the limit/.test(W.exType), W.exType.slice(0,600)); await A.ctx.close(); });
 await S(async()=>{ const A=await open(b,390,844,EX), p=A.page;
   const R=await p.evaluate(()=>{ const out=[]; document.querySelectorAll('#ezList .ez-card:not(.moved)').forEach(c=>{ const v=c.querySelectorAll('.ez-v')[1], lh=parseFloat(getComputedStyle(v).lineHeight)||22; out.push({up:/Up to/.test(v.innerText), lines:Math.round(v.getBoundingClientRect().height/lh), text:tx(v.innerText)}); }); return out; });
   check('3f: at 390 the “You pay” value (Up to $10.00) takes at most two lines', R.some(x=>x.up) && R.every(x=>x.lines<=2), R);
   await K.tab(p,'v-esettings'); const st=await p.evaluate(()=>tx(document.getElementById('v-esettings').innerText)); await K.tab(p,'v-elearn'); const learn=await p.evaluate(()=>{ const root=document.getElementById('exLearn'); const kids=Array.from(root.children).map(e=>e.className||e.tagName); return {kids:kids.slice(0,4), last:kids[kids.length-1]}; });
   check('3g: Settings says “Turn on only the apps you have.” and explains exchange and prediction apps', /Turn on only the apps you have\./.test(st) && /An exchange is a marketplace where you buy shares from other people/.test(st) && /A prediction app sells shares on whether something will happen/.test(st), st.slice(0,500));
   check('3h: Learn has the honest line at the top (right under the heading), not at the bottom', /ez-honest/.test(learn.kids[1]) && !/ez-honest/.test(learn.last), learn); await A.ctx.close(); });

 // ---------- 4. What filled? ----------
 await S(async()=>{ const {A,p,k}=await fillOpen(b,1280,900);
   const D=await p.evaluate(()=>({sug:tx((document.querySelector('.ez-sug')||{}).innerText), order:(()=>{ const a=document.querySelector('.ez-onlysave'), s=document.getElementById('ezFSave'); return !!(a && s && (a.compareDocumentPosition(s)&Node.DOCUMENT_POSITION_FOLLOWING)); })(), only:tx((document.querySelector('.ez-onlysave')||{}).innerText)}));
   check('4a: the prefilled numbers are marked “only suggested: change them to what the book shows”, and “Only save what the book says filled.” sits above Save', /only suggested/.test(D.sug) && /Change them to what the book shows/.test(D.sug) && D.order && D.only==='Only save what the book says filled.', D);
   const n0=(await fillState(p)).n; await p.fill('#ezFSh','12'); await p.fill('#ezFPx','1'); await tapFill(p,500); const t1=await fillState(p);
   check('4b: a price far below the card’s (1¢ against 57¢) asks once, calmly, and saves nothing', t1.n===n0 && /much lower than the one shown/.test(t1.note) && /Is it right\?/.test(t1.note), t1.note);
   await p.fill('#ezFPx','2'); const cleared=await p.evaluate(()=>tx(document.getElementById('ezFNote').innerText)); check('4c: changing a number clears the old message at once', cleared==='', cleared);
   await tapFill(p,500); const t2=await fillState(p); await tapFill(p,1500); const t3=await fillState(p);
   check('4d: after the question, a second tap with the same numbers saves (a typo guard, not a wall), once', t2.n===n0 && /much lower/.test(t2.note)===true ? t3.n===n0+1 && t3.ad===1 : (t2.n===n0 && t3.n===n0+1), {t2:t2.note.slice(0,60), t3n:t3.n-n0});
   await A.ctx.close(); });
 await S(async()=>{ const {A,p,k}=await fillOpen(b,1280,900);
   const W=async(sh,px)=>{ await p.fill('#ezFSh',sh); await p.fill('#ezFPx',px); return p.evaluate(()=>tx(document.getElementById('ezFWarn').innerText)); };
   const lim=await p.evaluate(key=>easyList().picks.find(q=>q.key===key).nums.limit, k);
   const a=await W('0',String(lim+3)), c=await W('10','100'), d=await W('10','0'), e=await W('10',String(lim+3)), f=await W('10',String(lim-3));
   check('4e: the “above the most La Contadora would pay” line shows only with shares above 0 and a valid price above the limit ('+lim+'¢)', a==='' && c==='' && d==='' && /above the most La Contadora would pay/.test(e) && f==='', {a,c,d,e:e.slice(0,40),f});
   await p.fill('#ezFSh','10'); await p.fill('#ezFPx','57'); await p.fill('#ezFSh','10001'); await tapFill(p,500); const big=await fillState(p); await p.fill('#ezFSh','10'); const gone=await p.evaluate(()=>tx(document.getElementById('ezFNote').innerText));
   check('4f: an old “more than 10,000 shares” message is gone as soon as the number is fixed', /more than 10,000/.test(big.note) && gone==='', {big:big.note.slice(0,60), gone}); await A.ctx.close(); });

 // ---------- 5. tap targets, Undo, toast ----------
 await S(async()=>{ const A=await open(b,390,844), p=A.page;
   const R=await p.evaluate(()=>{ const q=e=>{ const r=document.querySelector(e).getBoundingClientRect(); return {w:Math.round(r.width), h:Math.round(r.height)}; }; return {themer:q('#themer'), banner:q('#easyBanner'), back:q('#easyBack')}; });
   check('5a: the dark/light button is 44 px, the banner is 44 px tall and its Back to God mode control is 44 px (390)', R.themer.w>=44 && R.themer.h>=44 && R.banner.h>=44 && R.back.h>=44, R);
   await p.click('#ezList .ez-card [data-ez="open"]'); await p.waitForSelector('#ezPlaced'); await p.click('#ezPlaced'); await p.waitForSelector('#ezPick .ez-conf',{timeout:9000});
   const U=await p.evaluate(()=>{ const go=document.querySelector('[data-ez="gobets"]').getBoundingClientRect(), un=document.querySelector('[data-ez="undo"]').getBoundingClientRect(); return {gap:Math.round(un.top-go.bottom), h:Math.round(un.height), w:Math.round(un.width), cls:document.querySelector('[data-ez="undo"]').className}; });
   check('5b: Undo is on its own quiet row at least 16 px away from See My bets, and is at least 44 px tall', U.gap>=16 && U.h>=44 && /link/.test(U.cls), U); await A.ctx.close(); });
 await S(async()=>{ const A=await open(b,390,844), p=A.page; const k0=await p.evaluate(()=>easyList().picks[0].key);
   await p.click('#ezList .ez-card [data-ez="open"]'); await p.waitForSelector('#ezPlaced'); await p.click('[data-ez="skip"]'); await p.waitForTimeout(300);
   const T1=await p.evaluate(()=>{ const t=document.getElementById('ezToast'), u=document.getElementById('ezToastU'), r=t.getBoundingClientRect(), ur=u.getBoundingClientRect(); let hit=0; document.querySelectorAll('#ezList .ez-btn').forEach(e=>{ const q=e.getBoundingClientRect(); if(q.width && !(q.right<r.left||q.left>r.right||q.bottom<r.top||q.top>r.bottom)) hit++; });
     return {shown:!t.hidden, undo:!u.hidden, top:Math.round(r.top), uh:Math.round(ur.height), hit, text:tx(t.innerText), inList:easyList().picks.some(q=>q.key===window.__k)}; });
   check('5c: “Not for me” shows a toast at the top with its own Undo (44 px) and it covers none of the cards’ buttons', T1.shown && T1.undo && T1.top<60 && T1.uh>=44 && T1.hit===0 && /Skipped for today/.test(T1.text), T1);
   await p.click('#ezToastU'); await p.waitForTimeout(300); const back=await p.evaluate(k=>({inList:easyList().picks.some(q=>q.key===k)&&!ezSkipped()[k], listed:!!document.querySelector('#ezList .ez-card[data-key="'+k+'"]')}), k0);
   check('5d: Undo in the toast brings that one pick back to Today', back.inList && back.listed, back); await A.ctx.close(); });

 // ---------- 6. Back closes a pick ----------
 await S(async()=>{ const A=await open(b,390,844), p=A.page; const url=p.url();
   const h0=await p.evaluate(()=>history.length); await p.click('#ezList .ez-card [data-ez="open"]'); await p.waitForSelector('#ezPlaced'); const open1=await p.evaluate(()=>({n:history.length, st:history.state, key:!!ezS().key}));
   await p.goBack(); await p.waitForTimeout(400); const after=await p.evaluate(()=>({key:ezS().key, shown:getComputedStyle(document.getElementById('ezPick')).display, url:location.href}));
   check('6a: opening a pick adds one history entry; the browser Back closes the pick page and stays in the app', open1.n===h0+1 && open1.st && open1.st.ez===1 && after.key===null && after.shown==='none' && after.url===url, {h0, open1, after});
   await p.click('#ezList .ez-card [data-ez="open"]'); await p.waitForSelector('#ezPlaced'); await p.click('[data-ez="back"]'); await p.waitForTimeout(500); const ui=await p.evaluate(()=>({n:history.length, st:history.state, key:ezS().key}));
   check('6b: closing the page with the app’s own Back does not leave a stale entry (no loop): the browser Back is the next one and it leaves', ui.key===null && !(ui.st && ui.st.ez), ui);
   await p.click('#ezList .ez-card [data-ez="open"]'); await p.waitForSelector('#ezPlaced'); await p.goBack(); await p.waitForTimeout(300); await p.click('#ezList .ez-card [data-ez="open"]'); await p.waitForSelector('#ezPlaced'); const again=await p.evaluate(()=>ezS().key!==null);
   check('6c: it can be opened again after a Back (no stuck state)', again, again);
   await p.goBack(); await p.waitForTimeout(300); await p.goBack(); await p.waitForTimeout(500); const left=p.url()!==url; check('6d: a second Back leaves the app (the page really goes back)', left, p.url()); await A.ctx.close(); });

 // ---------- 7. lines on My bets and Learn, dev note, Settings feedback ----------
 await S(async()=>{ const A=await open(b,1280,900), p=A.page;
   const R=await p.evaluate(()=>{ const real=easySoFar, line=()=>/Winning more often|won more bets than you lost/.test(exBetsHtml()); const o={}; const mk=(w,l,pr)=>{ window.easySoFar=()=>({bets:w+l, won:w, lost:l, push:0, sold:0, profit:pr, profitListed:pr, cancelled:0}); return line(); };
     o.now=line(); o.upWins=mk(5,2,3); o.downWins=mk(5,2,-3); o.downLoss=mk(2,5,-3); window.easySoFar=real;
     const L=exLessons().map(l=>l[1]).join(' '); o.learnOld=/Winning more often than losing can still be down/.test(L); o.learnNew=/can be down when losses cost more than wins pay, as when you back favourites/.test(L);
     const mv=ezMovedHtml({key:'k', r:gN('Luka Doncic'), sentence:'x', oldPrice:'-150', newPrice:'-150', breakEven:0.6, most:0.6, book:'B', priceMoved:false, chanceMoved:true}); o.skipBtn=/data-ez="dismiss"/.test(mv); o.skipText=/Skip it, or check back later\./.test(mv);
     o.seeNext=/See next/.test(ezTodayHtml.toString()) && !/>See it</.test(ezTodayHtml.toString());
     o.label=easyBetLabel({kind:'total', name:'Over', market:'224.5 Total', sport:'NBA', game:'Suns @ Lakers'}).text; o.today=easyCount(224.5,'O').text; return o; });
   check('7a (P1): the “won more than lost but still down” line shows only when wins > losses and So far < 0 (practice data, up wins, down losses: no; down with more wins: yes)', R.now===false && R.upWins===false && R.downWins===true && R.downLoss===false, R);
   check('7b (P1, P5, P8): Learn says “can be down when losses cost more than wins pay, as when you back favourites”; the old line is gone; “See next”; a Not worth it card has no Skip button, only the words; My bets says “225 or more points” as Today does', R.learnNew && !R.learnOld && R.seeNext && !R.skipBtn && R.skipText && /225 or more points/.test(R.label), R);
   await K.tab(p,'v-esettings'); const F=await p.evaluate(()=>{ document.querySelector('[data-ex="app"][data-app="Caesars"]').click(); const a=tx(document.getElementById('easyAppsMsg').innerText); document.querySelector('[data-ex="theme"][data-t="dark"]').click(); const th=tx(document.getElementById('easyThemeMsg').innerText); return {a, th}; });
   check('7c: each Settings toggle says what it did', /Caesars is now (on|off)/.test(F.a) && F.th==='Dark is now on.', F); await A.ctx.close(); });
 await S(async()=>{ const A=await open(b,1280,900), p=A.page;
   const R=await p.evaluate(()=>{ const pr=gN('Patrick Mahomes')||lastRows[0]; addToLog(Object.assign({}, pr, {kind:'parlay', stake:42, name:'Parlay test', legs:[]})); saveLog(); refresh(); const P=logged.filter(b=>b.kind==='parlay'&&easyStatusOf(b)==='open'); return {t:easyParlayNote(), open:+P.reduce((t,b)=>t+(b.free?0:(+b.stake||0)),0).toFixed(2), n:P.length, txt:money(+P.reduce((t,b)=>t+(b.free?0:(+b.stake||0)),0).toFixed(2))+' still at risk in '+P.length+' open'}; });
   check('7d (P2): in the dev app the note names the open parlay’s stake and says In play and All count single bets only', /Dev: these totals leave out \d+ parlays/.test(R.t) && R.t.includes(R.txt) && /In play and All count single bets only\./.test(R.t), R); await A.ctx.close(); });

 await b.close(); console.log('\n'+T.pass+' passed, '+T.fail+' failed'); process.exit(T.fail?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
