// node tests/v528-compa-edit-test.js [index.html] — v5.28 (owner 11/23: "Build it all! Now"): El Compa's new tools, with a fake Worker that answers job "compa" with tool_use blocks
// (no real API). fill_bet_form fills the 49ers DK Predictions trade (MIN @ SF, Nov 22, SF, DK Predictions in % mode, Cost 26.80 @ 65%, Pays back 40.00, Won), marks the boxes ⚠
// and saves nothing; find_bets lists bets; edit_bet asks with before → after, No changes nothing, Yes changes exactly that bet and keeps the history, snap untouched; a stake
// change without the owner's words is refused; a result set by an import is not changed without the owner naming the bet and the result, then "overrides a result you or your
// book set"; a picture in the chat goes to the slips job and opens Bet log › Import with the 3 DK trades, and no picture goes into the chat.
const path=require('path'); const fs=require('fs'); const { chromium } = require('playwright');
const html=fs.readFileSync(process.argv[2]||path.join(__dirname,'..','index.html'),'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,600)); };
const NOW=Date.parse('2026-11-23T17:00:00Z'), PASSW='pw-secret-528c';
const PNG=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==','base64');
const tm=(ha,ab,loc,nick,score)=>({homeAway:ha, score:String(score), team:{abbreviation:ab, location:loc, name:nick, displayName:loc+' '+nick, shortDisplayName:nick}});
const EV=[
  {id:'401IND', date:'2026-11-20T01:15:00Z', name:'Indianapolis Colts at Houston Texans', shortName:'IND @ HOU', status:{type:{state:'post', completed:true, shortDetail:'Final'}}, competitions:[{competitors:[tm('away','IND','Indianapolis','Colts',20), tm('home','HOU','Houston','Texans',23)]}]},
  {id:'401MIN', date:'2026-11-22T21:25:00Z', name:'Minnesota Vikings at San Francisco 49ers', shortName:'MIN @ SF', status:{type:{state:'post', completed:true, shortDetail:'Final'}}, competitions:[{competitors:[tm('away','MIN','Minnesota','Vikings',10), tm('home','SF','San Francisco','49ers',35)]}]}];
const evOnDay=d=>EV.filter(e=>new Date(e.date).toLocaleDateString('en-CA',{timeZone:'America/Chicago'}).replace(/-/g,'')===d);
const SNAP={at:'2026-11-23T00:35:40.000Z', said:{decision:'IMPORTED', onList:false}, model:0.7};
const LOG=[
  {id:'b-ml', key:'import|b-ml', sport:'NFL', kind:'moneyline', book:'DK Predictions', odds:'-203', stake:26.8, date:'2026-11-22', dateSet:true, manual:true, game:'MIN @ SF', name:'SF 49ers', team:'SF 49ers', side:'', market:'Moneyline', result:'win', towin:13.2, paidReal:true, gradedBy:'import', accountingSource:'import', snap:SNAP, edits:[]},
  {id:'b-open', key:'b-open', sport:'NBA', kind:'prop', book:'FanDuel', odds:'-110', stake:5, date:'2026-11-23', dateSet:true, manual:true, game:'DEN @ LAL', name:'Nikola Jokic', side:'O', market:'11.5 Rebounds', betnow:'O 11.5 -110', snap:{at:'2026-11-23T15:00:00.000Z', model:0.58}}];
const BETS3={bets:[
  {book:'DK Predictions', kind:'single', status:'won', placedAt:'Nov 22, 2026 at 6:35:34 PM', stake:26.8, payout:40, pricePct:65, game:'MIN Vikings @ SF 49ers', sport:'NFL', legs:[{team:'SF 49ers', market:'Moneyline', side:'SF 49ers'}], confidence:'high', unclear:[]},
  {book:'DK Predictions', kind:'single', status:'won', placedAt:'Nov 22, 2026 at 6:56:35 PM', stake:26.65, payout:41, pricePct:63, game:'MIN Vikings @ SF 49ers', sport:'NFL', legs:[{player:'Christian McCaffrey', market:'Anytime TD', line:0.5, side:'Over'}], confidence:'high', unclear:[]},
  {book:'DK Predictions', kind:'single', status:'won', placedAt:'Nov 22, 2026 at 6:57:05 PM', stake:26.95, payout:49, pricePct:53, game:'MIN Vikings @ SF 49ers', sport:'NFL', legs:[{player:'Brock Purdy', market:'Passing Touchdowns', line:1.5, side:'Over'}], confidence:'high', unclear:[]}], partial:0, unclear:[]};
const FILL=[['book','DK Predictions'],['sport','NFL'],['type','moneyline'],['game','MIN @ SF'],['gameDate','2026-11-22'],['team','SF 49ers'],['pricePct','65'],['stake','26.80'],['totalPayout','40.00'],['placedAt','Nov 22, 2026 6:35:34 PM'],['result','won']].map(([field,value])=>({field,value}));
const CALLS=[];
const T=(id,name,input)=>({type:'tool_use', id, name, input});
function answer(input){ const M=input.messages||[], last=String((M[M.length-1]||{}).content||''), n=(input.toolResults||[]).length;
  const ok=(reply, calls, turn)=>({ok:true, job:'compa', reply, toolCalls:calls||[], turn:turn||[], out:{reply, toolCalls:calls||[], turn:turn||[]}, usd:0.01, spentToday:0.2, spentMonth:3.5});
  const one=(id,name,inp,action)=>{ const tu=T(id,name,inp); return ok('', [{id, name, input:inp, action}], [tu]); };
  if(n>0) return ok('Done, as the app says.');
  if(/fill/.test(last)) return one('t_fill','fill_bet_form',{fields:FILL},false);
  if(/find/.test(last)) return one('t_find','find_bets',{text:'49ers', day:'', book:''},false);
  if(/jokic line/.test(last)) return one('t_e1','edit_bet',{id:'b-open', changes:[{field:'line', value:'12.5'},{field:'odds', value:'-115'}]},true);
  if(/stake/.test(last)) return one('t_e2','edit_bet',{id:'b-open', changes:[{field:'stake', value:'9'}]},true);
  if(/12\.5 line/.test(last)) return one('t_e4','edit_bet',{id:'b-open', changes:[{field:'stake', value:'12.5'}]},true);   // round 2, F4
  if(/days ago/.test(last)) return one('t_e5','edit_bet',{id:'b-open', changes:[{field:'stake', value:'2'}]},true);
  if(/lose\?|\bif the\b/.test(last)) return one('t_e6','edit_bet',{id:'b-ml', changes:[{field:'result', value:'loss'}]},true);   // round 2, F5
  if(/a loss|lost/.test(last)) return one('t_e3','edit_bet',{id:'b-ml', changes:[{field:'result', value:'loss'}]},true);
  return ok('Unknown in this test.'); }
async function worker(route){ const req=route.request(), u=new URL(req.url());
  if(u.pathname==='/ai/status') return route.fulfill({status:200, contentType:'application/json', body:JSON.stringify({setUp:true, spentToday:0.1, spentMonth:1, capDay:5, capMonth:90})});
  if(u.pathname==='/ai'){ if(req.method()==='OPTIONS') return route.fulfill({status:204, headers:{'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'POST, GET, OPTIONS'}});
    let body={}; try{ body=JSON.parse(req.postData()||'{}'); }catch(e){} CALLS.push({job:body.job, input:body.input, raw:(req.postData()||'').length<200000?req.postData():'(large)'});
    if(body.job==='slips') return route.fulfill({status:200, contentType:'application/json', body:JSON.stringify({ok:true, job:'slips', out:BETS3, usd:0.01})});
    if(body.job!=='compa') return route.fulfill({status:200, contentType:'application/json', body:JSON.stringify({ok:true, job:body.job, out:{}, usd:0})});
    return route.fulfill({status:200, contentType:'application/json', body:JSON.stringify(answer(body.input||{}))}); }
  return route.fulfill({status:200, contentType:'application/json', body:'{}'}); }
async function open(b){ const ctx=await b.newContext({timezoneId:'America/Chicago', viewport:{width:1280, height:900}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(([pass, log])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.pass',pass); localStorage.setItem('mbev.ai.on','1');
    localStorage.setItem('mbev.ai.status', JSON.stringify({setUp:true, spentToday:0, spentMonth:0, capDay:5, capMonth:90, at:Date.now()})); localStorage.setItem('mbev.log', JSON.stringify(log)); }catch(e){} }, [PASSW, LOG]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/0xbeta\.dev/.test(u)) return worker(r);
    if(/espn/.test(u) && /scoreboard/.test(u)){ const d=new URL(u).searchParams.get('dates'); return r.fulfill({contentType:'application/json', body:JSON.stringify({events:d?evOnDay(d):EV, week:{number:12}})}); }
    if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(2500); return {ctx,p,errs}; }
const ev=async(p,fn,arg)=>{ try{ return await p.evaluate(fn,arg); }catch(e){ return {evalError:String(e.message||e).slice(0,300)}; } };
const send=async(p,t,ms)=>{ await ev(p,t=>{ compaOpen(); const i=document.getElementById('compaIn'); i.value=t; document.getElementById('compaSend').click(); },t); await p.waitForTimeout(ms||1200); };
const ask=p=>ev(p,()=>{ const a=document.querySelector('#compaList .cp-ask'); return a?{t:a.textContent.replace(/\s+/g,' ').trim(), rows:[...a.querySelectorAll('.cp-diff tbody tr')].map(tr=>[...tr.children].map(td=>td.textContent))}:null; });
const answerAsk=(p,yes)=>ev(p,y=>{ const b=document.querySelector('#compaList [data-cp="'+(y?'yes':'no')+'"]'); if(b) b.click(); return !!b; }, yes);
const bet=(p,id)=>ev(p,id=>{ const b=logged.find(x=>x.id===id); if(!b) return null; const o=JSON.parse(JSON.stringify(b)); delete o.lsmlCls; return o; }, id);   // lsmlCls: the app's own long-shot label, re-stamped at each render
const saved=(p,id)=>ev(p,id=>{ const L=JSON.parse(localStorage.getItem('mbev.log')||'[]'); return L.find(x=>x.id===id)||null; }, id);
const lastResult=name=>{ for(let i=CALLS.length-1;i>=0;i--){ const c=CALLS[i]; if(c.job!=='compa') continue; for(const rd of (c.input.toolResults||[])) for(const r of rd.results||[]) if(rd.turn.some(t=>t.name===name && t.id===r.id)) return (()=>{ try{ return JSON.parse(r.content); }catch(e){ return r.content; } })(); } return null; };

(async()=>{ const t0=Date.now(); const b=await chromium.launch(); let S=await open(b);
  // 1. fill_bet_form: the 49ers DK Predictions trade, nothing saved
  const n0=await ev(S.p,()=>logged.length); await send(S.p,'fill in my 49ers trade', 4500);
  const F=await ev(S.p,()=>{ const g=id=>document.getElementById(id), ed=document.querySelector('#abHost .editor'), q=c=>ed&&ed.querySelector(c), sel=g('abGame');
    return {game:sel.value, gameTxt:(sel.selectedOptions[0]||{}).textContent||'', date:g('abDate').value, team:g('abTeam').value, type:g('abType').value, sport:g('abSport').value, book:q('.eb-book').value, mode:q('.eb-mode').value, cost:q('.eb-cost').value, pct:q('.eb-pct').value, pays:q('.eb-win').value, result:g('abResult').value, placed:g('abPlaced').value,
      unc:[...document.querySelectorAll('#addBetPanel .ai-unclear')].length, n:logged.length, open:g('addBetPanel').open}; });
  check('1. fill_bet_form fills the 49ers DK Predictions trade: MIN @ SF (not the first game), Nov 22, SF, moneyline, NFL, DK Predictions in % mode, Cost 26.80 @ 65, Pays back 40.00, Won, placed 6:35 PM',
    F.game==='401MIN' && /^MIN @ SF/.test(F.gameTxt) && F.date==='2026-11-22' && F.team==='SF' && F.type==='moneyline' && F.sport==='NFL' && F.book==='DraftKings Predictions' && F.mode==='pct' && F.cost==='26.80' && F.pct==='65' && F.pays==='40.00' && F.result==='win' && F.placed==='2026-11-22T18:35', F);
  check('1. it saves nothing (log unchanged) and marks the boxes it filled ⚠', F.n===n0 && F.unc>=8 && F.open, {n:F.n, n0, unc:F.unc});
  let R=lastResult('fill_bet_form');
  check('1. its tool result says saved:false and names the game, no ask was shown', R && R.done===true && R.saved===false && /^MIN @ SF/.test(R.game) && !(await ask(S.p)), R);
  // 2. find_bets
  await send(S.p,'find my 49ers bet'); R=lastResult('find_bets');
  check('2. find_bets lists the matching bet (id, day, book, stake, result, who set it)', R && R.count===1 && R.bets[0].id==='b-ml' && R.bets[0].day==='2026-11-22' && R.bets[0].book==='DK Predictions' && R.bets[0].stake===26.8 && R.bets[0].result==='win' && R.bets[0].resultSetBy==='import', R);
  // 3. edit_bet asks with before → after; No changes nothing
  const before=await bet(S.p,'b-open'), mlBefore=await bet(S.p,'b-ml');
  await send(S.p,'change the jokic line to 12.5 and odds -115'); let A=await ask(S.p);
  check('3. edit_bet asks first: "El Compa wants to: Change your bet Nikola Jokic …" with before → after (Market 11.5 → 12.5 Rebounds, Odds -110 → -115)', A && /El Compa wants to: Change your bet Nikola Jokic/.test(A.t) && A.rows.some(r=>r[0]==='Market' && r[1]==='11.5 Rebounds' && r[2]==='12.5 Rebounds') && A.rows.some(r=>r[0]==='Odds' && r[1]==='-110' && r[2]==='-115') && A.rows.length===2, A);
  await answerAsk(S.p,false); await S.p.waitForTimeout(900);
  check('3. No: nothing changed', JSON.stringify(await bet(S.p,'b-open'))===JSON.stringify(before), await bet(S.p,'b-open'));
  // Yes: exactly that bet, the history kept, snap untouched, saved
  await send(S.p,'change the jokic line to 12.5 and odds -115'); await answerAsk(S.p,true); await S.p.waitForTimeout(900);
  let B=await bet(S.p,'b-open'), L=await saved(S.p,'b-open');
  check('3. Yes: the line and the odds change, nothing else; the old values in edits; snap unchanged; saved to the Bet log', B.market==='12.5 Rebounds' && B.odds==='-115' && B.stake===5 && B.name==='Nikola Jokic' && B.edits.length===1 && B.edits[0].before.market==='11.5 Rebounds' && B.edits[0].before.odds==='-110' && /El Compa edit/.test(B.edits[0].note)
    && JSON.stringify(B.snap)===JSON.stringify(before.snap) && L && L.market==='12.5 Rebounds', B);
  { const now=await bet(S.p,'b-ml'); const diff=Object.keys(Object.assign({},now,mlBefore)).filter(k=>JSON.stringify(now[k])!==JSON.stringify(mlBefore[k])); check('3. the other bet is untouched', !diff.length, {diff, now:diff.map(k=>[k,mlBefore[k],now[k]])}); }
  // 4. a stake change without the owner's words is refused; with them it is shown and allowed
  await send(S.p,'change the jokic stake please'); A=await ask(S.p);
  check('4. a stake El Compa proposes that the owner did not state: refused in the ask ("you did not state the new stake")', A && /stake: you did not state the new stake \(\$9\.00\) in your message/.test(A.t) && !A.rows.length, A);
  await answerAsk(S.p,true); await S.p.waitForTimeout(900); B=await bet(S.p,'b-open');
  check('4. Do it on a refused change changes nothing (stake still 5)', B.stake===5 && B.edits.length===1, {stake:B.stake, edits:B.edits.length});
  await send(S.p,'set the jokic stake to 9'); A=await ask(S.p);
  check('4. with "set the jokic stake to 9" the ask shows Stake $5.00 → $9.00', A && A.rows.some(r=>r[0]==='Stake' && r[1]==='$5.00' && r[2]==='$9.00'), A);
  await answerAsk(S.p,true); await S.p.waitForTimeout(900); B=await bet(S.p,'b-open');
  check('4. Yes: stake 9, history kept (2 edits), snap unchanged', B.stake===9 && B.edits.length===2 && B.edits[1].before.stake===5 && JSON.stringify(B.snap)===JSON.stringify(before.snap), B);
  // R2 F4: a number that is not a stated stake is refused
  for(const [msg, n] of [['move it to the 12.5 line', '12.50'], ['I bet it 2 days ago', '2.00']]){ await send(S.p, msg); A=await ask(S.p);
    check('R2 F4. "'+msg+'": the stake $'+n+' is refused (not a stated stake)', A && new RegExp('stake: you did not state the new stake \\(\\$'+n.replace('.','\\.')+'\\)').test(A.t) && !A.rows.length, A); await answerAsk(S.p,false); await S.p.waitForTimeout(700); }
  check('R2 F4. stake still 9', (await bet(S.p,'b-open')).stake===9, null);
  // R2 F5: a question or a conditional is not an override
  for(const msg of ['did the 49ers lose?', 'if the 49ers lost, mark it a loss']){ await send(S.p, msg); A=await ask(S.p);
    check('R2 F5. "'+msg+'": not an override (refused)', A && /result: win was set by an import/.test(A.t) && !/overrides/.test(A.t), A); await answerAsk(S.p,false); await S.p.waitForTimeout(700); }
  { const P=await ev(S.p,()=>{ compaPush('user','SF 49ers bet: a win is a win'); const P=cpEditPlan({input:{id:'b-ml', changes:[{field:'result',value:'win'}]}}); return {bad:P.bad||null, refused:P.refused, rows:P.rows||null}; });
    check('R2 F5. the same result again ("a win is a win") changes nothing, and does not relabel the import result as yours', /result: already win/.test(P.bad||'') && !P.rows, P); }
  // 5. a result set by an import is not changed without the override words
  await send(S.p,'mark that one a loss'); A=await ask(S.p);
  check('5. a result set by an import, the owner not naming the bet: refused ("set by an import; name this bet and the new result")', A && /result: win was set by an import; name this bet and the new result in your message to change it/.test(A.t) && !/overrides/.test(A.t), A);
  await answerAsk(S.p,true); await S.p.waitForTimeout(900); B=await bet(S.p,'b-ml');
  check('5. nothing changed', JSON.stringify(B)===JSON.stringify(mlBefore), B.result);
  await send(S.p,'the 49ers moneyline lost, the book was wrong'); A=await ask(S.p);
  check('5. naming the 49ers and "lost": the ask says it overrides a result you or your book set, Result win → loss', A && /overrides a result you or your book set/.test(A.t) && A.rows.some(r=>r[0]==='Result' && /^win/.test(r[1]) && /^loss/.test(r[2])), A);
  await answerAsk(S.p,true); await S.p.waitForTimeout(900); B=await bet(S.p,'b-ml');
  check('5. Yes: result loss by you, the old result in edits, snap unchanged, stake unchanged', B.result==='loss' && B.gradedBy==='manual' && B.stake===26.8 && B.edits.length===1 && B.edits[0].before.result==='win' && B.edits[0].before.gradedBy==='import' && JSON.stringify(B.snap)===JSON.stringify(SNAP), B);
  // 6. a picture in the chat → slips job → Bet log › Import with the 3 trades; no picture in the chat
  const nc=CALLS.filter(c=>c.job==='compa').length;
  await ev(S.p,()=>compaOpen()); await S.p.setInputFiles('#compaShotFile', {name:'dk.png', mimeType:'image/png', buffer:PNG}); await S.p.waitForTimeout(2500);
  const P=await ev(S.p,()=>({view:document.body.dataset.view, open:document.querySelector('.lc-impbox').open, rows:[...document.querySelectorAll('#lcImpList .lc-shot')].map(x=>x.textContent.replace(/\s+/g,' ').slice(0,60)), list:document.getElementById('compaList').textContent, store:localStorage.getItem('mbev.compa')||''}));
  check('6. a picture in El Compa: one slips call, Bet log › Import open with the 3 DK trades', CALLS.filter(c=>c.job==='slips').length===1 && P.view==='v-log' && P.open && P.rows.length===3 && /^SF 49ers Moneyline/.test(P.rows[0]), P);
  check('6. El Compa says "3 bets read: check them in the Bet log › Import and press Save the ticked tickets"', /3 bets read: check them in the Bet log › Import and press Save the ticked tickets\./.test(P.list), P.list.slice(-300));
  check('6. no picture in the chat: no compa call, and the stored chat has no image data', CALLS.filter(c=>c.job==='compa').length===nc && !/iVBOR|base64|\/9j\//.test(P.store), P.store.length);
  check('no passphrase in any request body or on screen', !CALLS.some(c=>String(c.raw||'').includes(PASSW)) && !(await ev(S.p,p=>document.body.innerText.includes(p), PASSW)), null);
  check('no page errors', !S.errs.length, S.errs); await S.ctx.close();
  await b.close(); console.log('\n'+pass+' passed, '+fail+' failed ('+Math.round((Date.now()-t0)/1000)+' s)'); process.exit(fail?1:0); })();
