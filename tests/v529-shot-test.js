// node tests/v529-shot-test.js [index.html] — v5.29 (owner 11/23: "FIX"): screenshots from an iPhone always read or say why; Anthropic's reason shown; El Compa sees the import.
// A fake Worker (no real API). A picture with an empty type named IMG_1.PNG is read in Bet log › Import, in El Compa (📷) and in Read slip; a .txt is refused with
// "That file is not a picture I can read (PNG or JPG screenshot)." everywhere, with no AI call; the Worker's {ok:false, error:'rejected', detail:'Schema is too complex for compilation.'}
// shows the app's words plus the detail (as text, at most 200 characters) in El Compa (chat and 📷), the import message line and Read slip; read_last_slip reports the import rows.
const path=require('path'); const fs=require('fs'); const { chromium } = require('playwright');
const html=fs.readFileSync(process.argv[2]||path.join(__dirname,'..','index.html'),'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,600)); };
const NOW=Date.parse('2026-11-23T17:00:00Z'), PASSW='pw-secret-529';
const B64='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const NOPIC='That file is not a picture I can read (PNG or JPG screenshot).', DETAIL='Schema is too complex for compilation.';
const BETS3={bets:[
  {book:'DK Predictions', kind:'single', status:'won', placedAt:'Nov 22, 2026 at 6:35:34 PM', stake:26.8, payout:40, pricePct:65, game:'MIN Vikings @ SF 49ers', sport:'NFL', legs:[{team:'SF 49ers', market:'Moneyline', side:'SF 49ers'}], confidence:'high', unclear:[]},
  {book:'DK Predictions', kind:'single', status:'won', placedAt:'Nov 22, 2026 at 6:56:35 PM', stake:26.65, payout:41, pricePct:63, game:'MIN Vikings @ SF 49ers', sport:'NFL', legs:[{player:'Christian McCaffrey', market:'Anytime TD', line:0.5, side:'Over'}], confidence:'high', unclear:[]},
  {book:'DK Predictions', kind:'single', status:'won', placedAt:'Nov 22, 2026 at 6:57:05 PM', stake:26.95, payout:49, pricePct:53, game:'MIN Vikings @ SF 49ers', sport:'NFL', legs:[{player:'Brock Purdy', market:'Passing Touchdowns', line:1.5, side:'Over'}], confidence:'high', unclear:[]}], partial:0, unclear:[]};
const SLIP={book:'DK Predictions', kind:'single', status:'won', placedAt:'Nov 22, 2026 at 6:35:34 PM', stake:26.8, totalPayout:40, pricePct:65, game:'MIN Vikings @ SF 49ers', sport:'NFL', legs:[{team:'SF 49ers', market:'Moneyline', side:'SF 49ers'}], confidence:'high', unclear:[], betsOnScreen:1};
const tm=(ha,ab,loc,nick,score)=>({homeAway:ha, score:String(score), team:{abbreviation:ab, location:loc, name:nick, displayName:loc+' '+nick, shortDisplayName:nick}});
const EV=[{id:'401MIN', date:'2026-11-22T21:25:00Z', name:'Minnesota Vikings at San Francisco 49ers', shortName:'MIN @ SF', status:{type:{state:'post', completed:true, shortDetail:'Final'}}, competitions:[{competitors:[tm('away','MIN','Minnesota','Vikings',10), tm('home','SF','San Francisco','49ers',35)]}]}];
let REJECT=null, SLIPANS=SLIP; const CALLS=[], SLIPSQ=[];
async function worker(route){ const req=route.request(), u=new URL(req.url());
  if(u.pathname==='/ai/status') return route.fulfill({status:200, contentType:'application/json', body:JSON.stringify({setUp:true, spentToday:0.1, spentMonth:1, capDay:5, capMonth:90})});
  if(u.pathname==='/ai'){ if(req.method()==='OPTIONS') return route.fulfill({status:204, headers:{'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'POST, GET, OPTIONS'}});
    let body={}; try{ body=JSON.parse(req.postData()||'{}'); }catch(e){} CALLS.push({job:body.job, keys:Object.keys(body.input||{})});
    if(REJECT) return route.fulfill({status:400, contentType:'application/json', body:JSON.stringify(Object.assign({ok:false, error:'rejected', usd:0}, REJECT))});
    const out=body.job==='slips'?(SLIPSQ.length?SLIPSQ.shift():BETS3):body.job==='slip'?SLIPANS:{reply:'Hola.', toolCalls:[], turn:[]};
    return route.fulfill({status:200, contentType:'application/json', body:JSON.stringify({ok:true, job:body.job, out, usd:0.01, spentToday:0.11, spentMonth:1.01})}); }
  return route.fulfill({status:200, contentType:'application/json', body:'{}'}); }
async function open(b, w){ const ctx=await b.newContext({timezoneId:'America/Chicago', viewport:{width:w||1280, height:w&&w<500?844:900}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(([pass])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.pass',pass); localStorage.setItem('mbev.ai.on','1');
    localStorage.setItem('mbev.ai.status', JSON.stringify({setUp:true, spentToday:0, spentMonth:0, capDay:5, capMonth:90, at:Date.now()})); localStorage.setItem('mbev.log','[]'); }catch(e){} }, [PASSW]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/0xbeta\.dev/.test(u)) return worker(r);
    if(/espn/.test(u) && /scoreboard/.test(u)){ const d=new URL(u).searchParams.get('dates'); return r.fulfill({contentType:'application/json', body:JSON.stringify({events:(!d||d==='20261122')?EV:[], week:{number:12}})}); }
    if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:JSON.stringify({events:[]})}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(2500); return {ctx,p,errs}; }
const ev=async(p,fn,arg)=>{ try{ return await p.evaluate(fn,arg); }catch(e){ return {evalError:String(e.message||e).slice(0,300)}; } };
// put a File made in the page (any name and type, as an iPhone hands it over) into a file input and fire change
const pickInto=(p,id,name,type,text)=>ev(p,async([id,name,type,text,b64])=>{ const blob=text!=null?new Blob([text]):await (await fetch('data:image/png;base64,'+b64)).blob();
  const f=new File([blob], name, {type}); const dt=new DataTransfer(); dt.items.add(f); const inp=document.getElementById(id); inp.files=dt.files; const o={name:inp.files[0].name, type:inp.files[0].type}; inp.dispatchEvent(new Event('change',{bubbles:true})); return o; }, [id,name,type,text==null?null:text,B64]);
const toLog=async p=>{ await ev(p,()=>{ document.querySelector('.tab[data-view="v-log"]').click(); const d=document.querySelector('.lc-impbox'); d.open=true; }); await p.waitForTimeout(200); };
const impMsg=p=>ev(p,()=>document.getElementById('lcImpMsg').textContent);
const chat=p=>ev(p,()=>compaGet().msgs.map(m=>m.role+': '+m.content));
const nAi=job=>CALLS.filter(c=>c.job===job).length;
const openAdd=async p=>{ await ev(p,()=>{ const t=document.querySelector('.tab[data-view="v-add"]'); if(t) t.click(); const P=document.getElementById('addBetPanel'); P.open=true; P.dispatchEvent(new Event('toggle')); }); await p.waitForTimeout(1200); };

(async()=>{ const t0=Date.now(); const b=await chromium.launch();
  // ===== 1. Bet log › Import: an iPhone picture (empty type, IMG_1.PNG) is read; a .txt is refused with the sentence =====
  let S=await open(b); await toLog(S.p);
  let st=await ev(S.p,()=>[aiIsPic(new File(['x'],'IMG_1.PNG',{type:''})), aiIsPic(new File(['x'],'IMG_2.HEIC',{type:''})), aiIsPic(new File(['x'],'a.heic',{type:'image/heic'})), aiIsPic(new File(['x'],'photo',{type:''})), aiIsPic(new File(['x'],'photo',{type:''}),true), aiIsPic(new File(['x'],'n.txt',{type:''}),true), aiIsPic(new File(['x'],'n.txt',{type:'text/plain'}),true), aiIsPic(new File(['x'],'b.json',{type:''}),true)]);
  check('1. aiIsPic: IMG_1.PNG (no type) yes, IMG_2.HEIC (no type) yes, image/heic yes, no name and no type only from a picker, .txt and .json no', JSON.stringify(st)==='[true,true,true,false,true,false,false,false]', st);
  let n0=nAi('slips'); let f=await pickInto(S.p,'lcFile','IMG_1.PNG','');
  try{ await S.p.waitForFunction(()=>/Read 3 bets/.test(document.getElementById('lcImpMsg').textContent), null, {timeout:8000}); }catch(e){}
  let m=await impMsg(S.p), nr=await ev(S.p,()=>document.querySelectorAll('#lcImpList .lc-shot').length);
  check('1. a file with an empty type named IMG_1.PNG: one slips call, "Read 3 bets from 1 picture", 3 rows', f.type==='' && nAi('slips')===n0+1 && /^Read 3 bets from 1 picture\./.test(m) && nr===3, {f, m, nr});
  // read_last_slip sees the import rows
  let R=await ev(S.p,async()=>await compaAct({name:'read_last_slip', input:{}}, {}));
  check('3. read_last_slip reports the 📷 import: count 3, three short lines (49ers Moneyline, McCaffrey, Purdy), not "No slip has been read"', R && R.done===true && R.screenshotImport && R.screenshotImport.count===3 && R.screenshotImport.bets.length===3 && /^SF 49ers Moneyline · DK Predictions · 2026-11-22 · cost \$26\.80 · returns \$40\.00 · won/.test(R.screenshotImport.bets[0]) && /McCaffrey/.test(R.screenshotImport.bets[1]) && /Purdy Over 1\.5/.test(R.screenshotImport.bets[2]) && !/No slip has been read/.test(JSON.stringify(R)) && /Bet log › Import has 3 bets read from screenshots/.test(R.result||''), R);
  n0=CALLS.length; f=await pickInto(S.p,'lcFile','notes.txt','text/plain','hello'); await S.p.waitForTimeout(400); m=await impMsg(S.p);
  check('1. a .txt in the import box: "'+NOPIC+'", no AI call', m===NOPIC && CALLS.length===n0, {m, calls:CALLS.length-n0});
  // the import still takes a .json file
  f=await pickInto(S.p,'lcFile','bets.json','', JSON.stringify({type:'augi-bet-import', v:2, singles:[], parlays:[]})); await S.p.waitForTimeout(400); m=await impMsg(S.p);
  check('1. a .json with an empty type still goes to the file import (not refused as a picture)', m!==NOPIC && !/Reading picture/.test(m) && CALLS.length===n0, m);
  // ===== 2. El Compa 📷: an iPhone picture is read; a .txt is refused; Reading N pictures comes first =====
  await ev(S.p,()=>{ compaOpen(); }); n0=nAi('slips');
  await pickInto(S.p,'compaShotFile','IMG_1.PNG',''); await S.p.waitForTimeout(2000); let C=await chat(S.p);
  check('2. El Compa 📷 with IMG_1.PNG (no type): "Reading 1 picture for your Bet log…" then "3 bets read"', nAi('slips')===n0+1 && C.some(x=>/^note: Reading 1 picture for your Bet log…$/.test(x)) && /3 bets read/.test(C[C.length-1]||''), C.slice(-3));
  n0=CALLS.length; await pickInto(S.p,'compaShotFile','notes.txt','text/plain','hello'); await S.p.waitForTimeout(400); C=await chat(S.p);
  check('2. El Compa 📷 with a .txt: says "'+NOPIC+'", no AI call', C[C.length-1]==='note: '+NOPIC && CALLS.length===n0, C.slice(-2));
  // ===== 4. The Worker's rejected + detail: Compa chat, Compa 📷, import message line =====
  REJECT={detail:DETAIL};
  await ev(S.p,()=>{ const i=document.getElementById('compaIn'); i.value='hola'; document.getElementById('compaSend').click(); }); await S.p.waitForTimeout(1200); C=await chat(S.p);
  const want='Anthropic did not accept this request. Try a different picture or question. Anthropic said: “'+DETAIL+'”';
  check('4. El Compa chat: the app’s words plus Anthropic’s reason', C[C.length-1]==='note: '+want, C.slice(-2));
  await pickInto(S.p,'compaShotFile','IMG_1.PNG',''); await S.p.waitForTimeout(2000); C=await chat(S.p); m=await impMsg(S.p);
  check('4. El Compa 📷: "No bets were read." with the reason', /^note: No bets were read\. .*Anthropic did not accept this request\..*Anthropic said: “Schema is too complex for compilation\.”/.test(C[C.length-1]||''), C.slice(-2));
  check('4. Bet log › Import message line shows the reason', m.includes(want), m);
  REJECT={detail:'<b>bold</b> '+'x'.repeat(400)};
  await pickInto(S.p,'lcFile','IMG_1.PNG',''); await S.p.waitForTimeout(1500); st=await ev(S.p,()=>({t:document.getElementById('lcImpMsg').textContent, b:!!document.querySelector('#lcImpMsg b')}));
  const said=(st.t.match(/Anthropic said: “([^”]*)”/)||[])[1]||'';
  check('4. the detail is text (no <b> element) and cut to 200 characters', !st.b && said.length===200 && said.startsWith('<b>bold</b>'), {len:said.length, b:st.b});
  check('no page errors (Bet log, El Compa)', !S.errs.length, S.errs); await S.ctx.close();
  // ===== 5. Read slip: an iPhone picture is read; a .txt is refused; the rejected detail shows =====
  S=await open(b); REJECT=null; await openAdd(S.p); n0=nAi('slip');
  await pickInto(S.p,'aiSlipFile','IMG_1.PNG',''); await S.p.waitForTimeout(2500);
  let out=await ev(S.p,()=>document.getElementById('aiSlipOut').textContent);
  check('5. Read slip with IMG_1.PNG (no type): one slip call, no error', nAi('slip')===n0+1 && !/could not|not a picture|did not accept/.test(out), {n:nAi('slip')-n0, out:out.slice(0,200)});
  n0=CALLS.length; await pickInto(S.p,'aiSlipFile','notes.txt','text/plain','hello'); await S.p.waitForTimeout(400); out=await ev(S.p,()=>document.getElementById('aiSlipOut').textContent);
  check('5. Read slip with a .txt: "'+NOPIC+'", no AI call', out===NOPIC && CALLS.length===n0, out);
  REJECT={detail:DETAIL}; await pickInto(S.p,'aiSlipFile','IMG_1.PNG',''); await S.p.waitForTimeout(1500);
  st=await ev(S.p,()=>({t:document.getElementById('aiSlipOut').textContent, err:!!document.querySelector('#aiSlipOut .ai-err')}));
  check('5. Read slip shows the app’s words plus Anthropic’s reason', st.err && st.t===want, st);
  REJECT={}; await pickInto(S.p,'aiSlipFile','IMG_1.PNG',''); await S.p.waitForTimeout(1500); out=await ev(S.p,()=>document.getElementById('aiSlipOut').textContent);
  check('5. with no detail: only the app’s words (no "Anthropic said")', out==='Anthropic did not accept this request. Try a different picture or question.', out);
  check('no page errors (Read slip)', !S.errs.length, S.errs); await S.ctx.close();
  // ===== 6. + Add a bet: Save is never silent (owner 11/23: "when I Saved Bet, it went NOWHERE") =====
  const NOGAME=Object.assign({}, SLIP, {status:'open'}); delete NOGAME.game; delete NOGAME.gameDate; delete NOGAME.placedAt;   // not settled yet, no game, no day: the app cannot know the game
  const inView=(p,sel)=>ev(p,s=>{ const e=document.querySelector(s); if(!e || !e.getClientRects().length) return {vis:false}; const r=e.getBoundingClientRect(); return {vis:r.bottom>0 && r.top<innerHeight && r.right<=document.documentElement.clientWidth+1, text:e.textContent.replace(/\s+/g,' ').trim(), cls:e.className, color:getComputedStyle(e).color}; }, sel);
  const slipSave=p=>ev(p,()=>{ const s=document.querySelector('#abHost .eb-save'); s.click(); });
  const pickGame=p=>ev(p,()=>{ const sel=document.getElementById('abGame'), o=[...sel.options].find(x=>/MIN/.test(x.textContent)); if(!o) return false; sel.value=o.value; sel.dispatchEvent(new Event('change',{bubbles:true})); const t=document.getElementById('abTeam'), to=t&&t.options?[...t.options].find(x=>/^SF\b|49ers/.test(x.value+' '+x.textContent)):null; if(to){ t.value=to.value; t.dispatchEvent(new Event('change',{bubbles:true})); } return o.textContent+' / '+(t&&t.value); });   // the owner picks the game, then his team (SF)
  const readSlip=async p=>{ await ev(p,async b64=>{ const blob=await (await fetch('data:image/png;base64,'+b64)).blob(); await aiSlipRead(new File([blob],'IMG_1.PNG',{type:''})); const u=document.getElementById('aiSlipUse'); if(u) u.click(); }, B64); await p.waitForTimeout(1800); };
  for(const W of [390, 1280]){
    S=await open(b, W); REJECT=null; SLIPANS=NOGAME; await openAdd(S.p); await readSlip(S.p);
    let n=await ev(S.p,()=>logged.length); await slipSave(S.p); await S.p.waitForTimeout(600); let M=await inView(S.p,'#abHost .eb-msg');
    const red=await ev(S.p,()=>getComputedStyle(document.documentElement).getPropertyValue('--loss').trim());
    check('6. '+W+' px: a Read slip answer with no game, game date or placed time: Save says in red next to Save, in view: "Not saved: add the game first"', M.vis && /^Not saved: add the game first/.test(M.text) && /ab-no/.test(M.cls) && (await ev(S.p,()=>logged.length))===n, {M, red});
    const gfoc=await ev(S.p,()=>({need:document.getElementById('abGame').classList.contains('ab-need'), focus:document.activeElement&&document.activeElement.id, color:getComputedStyle(document.getElementById('abGame')).outlineColor, btn:(()=>{ const r=document.querySelector('#abHost .eb-save').getBoundingClientRect(); return r.top>=0 && r.bottom<=innerHeight; })()}));
    check('6. '+W+' px: the Game box is outlined in red and focused; the Save button stays in view with the message', gfoc.need && gfoc.focus==='abGame' && gfoc.color===await ev(S.p,()=>getComputedStyle(document.querySelector('#abHost .eb-msg')).color) && gfoc.btn, gfoc);
    const gm=await pickGame(S.p); await ev(S.p,()=>{ const r=document.getElementById('abResult'); r.value='win'; r.dispatchEvent(new Event('change',{bubbles:true})); }); await S.p.waitForTimeout(300);
    await ev(S.p,()=>{ const c=document.querySelector('#abHost .eb-cost')||document.querySelector('#abHost .eb-stake'); window._c0=c&&c.value; if(c){ c.value=''; c.dispatchEvent(new Event('input',{bubbles:true})); } }); await S.p.waitForTimeout(200);
    await slipSave(S.p); await S.p.waitForTimeout(600); M=await inView(S.p,'#abHost .eb-msg');
    check('6. '+W+' px: no cost: the editor’s own refusal, red, in view, nothing saved', M.vis && /Cost|stake/i.test(M.text) && (await ev(S.p,()=>logged.length))===n, M);
    await ev(S.p,()=>{ const c=document.querySelector('#abHost .eb-cost')||document.querySelector('#abHost .eb-stake'); if(c){ c.value=window._c0; c.dispatchEvent(new Event('input',{bubbles:true})); } }); await S.p.waitForTimeout(200);
    for(let k=0;k<3 && (await ev(S.p,()=>logged.length))===n;k++){ await slipSave(S.p); await S.p.waitForTimeout(700); }
    M=await inView(S.p,'#abHost .eb-msg'); let T=await ev(S.p,()=>({toast:(document.getElementById('savedToast')||{}).textContent||'', n:logged.length, show:!!document.querySelector('#abHost .eb-msg .ab-show'), L:logged[logged.length-1]&&{day:gameDayOf(logged[logged.length-1]), id:logged[logged.length-1].id}}));
    check('6. '+W+' px: game picked: saved, and next to Save (green, in view) "Saved: SF … moneyline · DK Predictions · $26.80 · Won → Bet log › Sun Nov 22" with Show it; the toast says the same', T.n===n+1 && M.vis && /ab-yes/.test(M.cls) && /^Saved: SF.* moneyline · DK Predictions · \$26\.80 · Won → Bet log › Sun Nov 22 Show it$/.test(M.text) && T.show && /^✓ Saved: .*→ Bet log › Sun Nov 22$/.test(T.toast) && T.L.day==='2026-11-22', {gm, M, T});
    await ev(S.p,()=>document.querySelector('#abHost .eb-msg .ab-show').click()); await S.p.waitForTimeout(700);
    T=await ev(S.p,id=>{ const i=logged.findIndex(b=>b.id===id), el=document.querySelector('#logBody [data-i="'+i+'"]'), tr=el&&el.closest('tr'), r=tr&&tr.getBoundingClientRect(); return {view:document.body.dataset.view, row:!!tr, inView:!!r && r.bottom>0 && r.top<innerHeight, dayOpen:logDays['2026-11-22']===true}; }, T.L.id);
    check('6. '+W+' px: Show it opens the Bet log on Sun Nov 22 with the new bet in view', T.row && T.inView && T.dayOpen, T);
    check('6. '+W+' px: no page errors', !S.errs.length, S.errs); await S.ctx.close(); }
  // the owner's BARE slip (the real Worker v3.50: no placedAt, no game, no game date, no sport): settled, so its game is the team’s last final game, marked ⚠, and Save saves it
  const BARE={book:'DK Predictions', kind:'single', status:'won', stake:26.8, totalPayout:40, pricePct:65, legs:[{team:'SF 49ers', market:'Moneyline', side:'SF 49ers'}], confidence:'high', unclear:[], betsOnScreen:1};
  for(const W of [390, 1280]){
    S=await open(b, W); SLIPANS=BARE; await openAdd(S.p); await readSlip(S.p);
    let F=await ev(S.p,()=>{ const g=document.getElementById('abGame'); return {game:g.value, txt:g.selectedOptions[0]&&g.selectedOptions[0].textContent, warn:!!(g.closest('.field')&&g.closest('.field').classList.contains('ai-unclear')), team:document.getElementById('abTeam').value, date:document.getElementById('abDate').value}; });
    check('8. '+W+' px: BARE slip (won, no day, no game): MIN @ SF (Sun Nov 22, the last final game with SF) filled and marked ⚠, team SF', F.game==='401MIN' && F.warn && /SF/.test(F.team), F);
    let n=await ev(S.p,()=>logged.length); for(let k=0;k<3 && (await ev(S.p,()=>logged.length))===n;k++){ await slipSave(S.p); await S.p.waitForTimeout(700); }
    let M=await inView(S.p,'#abHost .eb-msg'), T=await ev(S.p,()=>{ const L=logged[logged.length-1]; return {n:logged.length, day:L&&gameDayOf(L), game:L&&L.game, res:L&&L.result, toast:(document.getElementById('savedToast')||{}).textContent||''}; });
    check('8. '+W+' px: Save bet saves it under Sun Nov 22 with the green "Saved: SF moneyline · DK Predictions · $26.80 · Won → Bet log › Sun Nov 22" next to Save, in view, and the toast', T.n===n+1 && T.day==='2026-11-22' && T.game==='MIN @ SF' && T.res==='win' && /^Saved: SF moneyline · DK Predictions · \$26\.80 · Won → Bet log › Sun Nov 22 Show it$/.test(M.text) && /ab-yes/.test(M.cls) && M.vis && /^✓ Saved: SF moneyline/.test(T.toast), {T, M});
    check('8. '+W+' px: no page errors', !S.errs.length, S.errs); await S.ctx.close(); }
  // two final games of SF on the same day: none picked, both listed first, ⚠
  S=await open(b); EV.push({id:'401SF2', date:'2026-11-22T18:00:00Z', name:'San Francisco 49ers at Seattle Seahawks', shortName:'SF @ SEA', status:{type:{state:'post', completed:true, shortDetail:'Final'}}, competitions:[{competitors:[tm('away','SF','San Francisco','49ers',7), tm('home','SEA','Seattle','Seahawks',3)]}]});
  SLIPANS=BARE; await openAdd(S.p); await readSlip(S.p);
  let F=await ev(S.p,()=>{ const g=document.getElementById('abGame'); return {game:g.value, first:[...g.options].slice(0,3).map(o=>o.value), warn:!!(g.closest('.field')&&g.closest('.field').classList.contains('ai-unclear'))}; });
  check('8. two SF final games the same day: no game picked, ⚠, both listed first in the Game menu', F.game==='' && F.warn && F.first[0]==='' && F.first.slice(1).sort().join()==='401MIN,401SF2', F);
  EV.pop(); await S.ctx.close();
  // duplicate: the hand-made import file first, then the same 49ers trade from Read slip
  S=await open(b); SLIPANS=NOGAME; await toLog(S.p);
  await S.p.setInputFiles('#lcFile', {name:'dk-predictions-2026-11-22_import.json', mimeType:'application/json', buffer:fs.readFileSync(path.join(__dirname,'..','agent-notes','dk-predictions-2026-11-22_import.json'))}); await S.p.waitForTimeout(500);
  await ev(S.p,()=>document.getElementById('lcImpSave').click()); await S.p.waitForTimeout(500);
  let nI=await ev(S.p,()=>logged.length); await openAdd(S.p); await readSlip(S.p); await pickGame(S.p); await S.p.waitForTimeout(300);
  await slipSave(S.p); await S.p.waitForTimeout(600); let M=await inView(S.p,'#abHost .eb-msg');
  check('6. the 49ers trade already imported from the file: "Not saved: already in your Bet log (Sun Nov 22, imported)" in red with Show it; nothing saved', nI>=3 && /^Not saved: already in your Bet log \(Sun Nov 22, imported\)\./.test(M.text) && /Show it$/.test(M.text) && /ab-no/.test(M.cls) && M.vis && (await ev(S.p,()=>logged.length))===nI, {nI, M});
  await ev(S.p,()=>document.querySelector('#abHost .eb-msg .ab-show').click()); await S.p.waitForTimeout(700);
  let T=await ev(S.p,()=>{ const i=logged.findIndex(b=>b.name==='SF 49ers'), el=document.querySelector('#logBody [data-i="'+i+'"]'), tr=el&&el.closest('tr'), r=tr&&tr.getBoundingClientRect(); return {view:document.body.dataset.view, inView:!!r && r.bottom>0 && r.top<innerHeight}; });
  check('6. Show it on the duplicate opens the imported bet in the Bet log', T.inView, T);
  // a failed log save
  await openAdd(S.p); await ev(S.p,()=>{ window.lsSafeSet=()=>false; window.logMakeRoom=()=>false; }); SLIPANS=Object.assign({}, NOGAME, {stake:5, totalPayout:9});
  await readSlip(S.p); await pickGame(S.p); await S.p.waitForTimeout(300); let n=await ev(S.p,()=>logged.length);
  for(let k=0;k<3 && (await ev(S.p,()=>logged.length))===n;k++){ await slipSave(S.p); await S.p.waitForTimeout(700); }
  M=await inView(S.p,'#abHost .eb-msg');
  check('6. the Bet log cannot be saved on this device: red "Saved on this page only … storage full" next to Save', /^Saved on this page only: the Bet log could not be saved on this device \(storage full\)/.test(M.text) && /ab-no/.test(M.cls) && M.vis, M);
  check('6. no page errors (duplicate, storage)', !S.errs.length, S.errs); await S.ctx.close();
  // ===== 7. Bet log › Import at 390 px: Save is never silent =====
  const noCost=x=>{ const y=Object.assign({}, x); delete y.stake; y.unclear=['stake']; return y; };
  S=await open(b, 390); await toLog(S.p);
  SLIPSQ.push({bets:BETS3.bets.map(noCost), partial:0, unclear:[]}); await pickInto(S.p,'lcFile','IMG_1.PNG',''); try{ await S.p.waitForFunction(()=>/Read 3 bets/.test(document.getElementById('lcImpMsg').textContent), null, {timeout:8000}); }catch(e){}
  let need=await ev(S.p,()=>{ const b=document.querySelector('#lcImpList .lc-shot .lc-need'), r=b&&b.getBoundingClientRect(); return b&&{t:b.textContent, vis:!b.hidden && !!b.getClientRects().length, fits:r.right<=document.documentElement.clientWidth+1 && r.left>=0, color:getComputedStyle(b).color}; });
  check('7. 390 px: each blocked row says which box is missing, visible and inside the screen', need && need.vis && need.fits && /Fill in the cost/.test(need.t), need);
  await ev(S.p,()=>window.scrollTo(0,0)); await ev(S.p,()=>document.getElementById('lcImpSave').click()); await S.p.waitForTimeout(500);
  M=await inView(S.p,'#lcImpSay'); let first=await ev(S.p,()=>{ const r=document.querySelector('#lcImpList .lc-shot').getBoundingClientRect(); return r.bottom>0 && r.top<innerHeight; });
  check('7. (1) all rows blocked, Save: "Nothing ticked: 3 bets need a box filled first (the ⚠ ones)." under the Save button, in red; the first blocked row in view; nothing saved', /^Nothing ticked: 3 bets need a box filled first \(the ⚠ ones\)\.$/.test(M.text) && /ab-no/.test(M.cls) && first && (await ev(S.p,()=>logged.length))===0 && (await impMsg(S.p))===M.text, {M, first});
  await ev(S.p,()=>{ lcRows=[]; lcImpPaint(); }); SLIPSQ.push({bets:[BETS3.bets[0], noCost(BETS3.bets[1]), noCost(BETS3.bets[2])], partial:0, unclear:[]}); await pickInto(S.p,'lcFile','IMG_2.PNG',''); try{ await S.p.waitForFunction(()=>/Read 3 bets/.test(document.getElementById('lcImpMsg').textContent), null, {timeout:8000}); }catch(e){}
  await ev(S.p,()=>window.scrollTo(0,0)); await ev(S.p,()=>document.getElementById('lcImpSave').click()); await S.p.waitForTimeout(500); M=await inView(S.p,'#lcImpSay');
  check('7. (2) one row ticked, Save: "Saved 1 ticket to your Bet log · 2 left out. → Bet log › Sun Nov 22" under the button, green, in view, with Show it', /^Saved 1 ticket to your Bet log · 2 left out\. → Bet log › Sun Nov 22 Show it$/.test(M.text) && /ab-yes/.test(M.cls) && M.vis && (await ev(S.p,()=>logged.length))===1, M);
  await ev(S.p,()=>document.querySelector('#lcImpSay .ab-show').click()); await S.p.waitForTimeout(700);
  T=await ev(S.p,()=>{ const el=document.querySelector('#logBody [data-i="0"]'), tr=el&&el.closest('tr'), r=tr&&tr.getBoundingClientRect(); return {inView:!!r && r.bottom>0 && r.top<innerHeight, dayOpen:logDays['2026-11-22']===true}; });
  check('7. (2) Show it opens Sun Nov 22 with the saved bet in view', T.inView && T.dayOpen, T);
  await toLog(S.p); await ev(S.p,()=>{ window.lsSafeSet=()=>false; window.logMakeRoom=()=>false; });
  await ev(S.p,()=>{ lcRows=[]; lcImpPaint(); }); SLIPSQ.push({bets:[BETS3.bets[1]], partial:0, unclear:[]}); await pickInto(S.p,'lcFile','IMG_3.PNG',''); try{ await S.p.waitForFunction(()=>/Read 1 bet/.test(document.getElementById('lcImpMsg').textContent), null, {timeout:8000}); }catch(e){}
  await ev(S.p,()=>document.getElementById('lcImpSave').click()); await S.p.waitForTimeout(500); M=await inView(S.p,'#lcImpSay');
  check('7. (3) the Bet log cannot be saved: "Not saved on this device …" under the button, red, in view', /^Not saved on this device: the Bet log could not be saved \(storage full\)/.test(M.text) && /ab-no/.test(M.cls) && M.vis, M);
  await ev(S.p,()=>{ window.lsSafeSet=(k,v)=>{ try{ localStorage.setItem(k,v); return true; }catch(e){ return false; } }; lcRows=[]; lcImpPaint(); });
  const NODAY=Object.assign({}, BETS3.bets[0]); delete NODAY.placedAt; delete NODAY.game; SLIPSQ.push({bets:[NODAY], partial:0, unclear:[]}); await pickInto(S.p,'lcFile','IMG_4.PNG',''); try{ await S.p.waitForFunction(()=>/Read 1 bet/.test(document.getElementById('lcImpMsg').textContent), null, {timeout:15000}); }catch(e){}
  let RW=await ev(S.p,()=>{ const b=document.querySelector('#lcImpList .lc-shot'); return b&&{day:b.querySelector('.lc-day').value, unc:b.querySelector('.lc-day').closest('label').classList.contains('lc-unc'), t:b.textContent.replace(/\s+/g,' ').slice(0,160)}; });
  check('7. (4) a won screenshot row with no game day: the day of SF’s last final game (2026-11-22), marked ⚠, not blocked for the game day', RW && RW.day==='2026-11-22' && RW.unc && /MIN @ SF/.test(RW.t), RW);
  check('7. no page errors', !S.errs.length, S.errs); await S.ctx.close();
  await b.close(); console.log('\n'+pass+' passed, '+fail+' failed ('+Math.round((Date.now()-t0)/1000)+' s)'); process.exit(fail?1:0); })();
