// node tests/v519-compa-test.js [index.html] — v5.19: 🤝 El Compa, the owner’s companion chat (owner, 11/16: "i want the AI as my companion … this is mine personally").
// A fake Worker answers job "compa" (Worker v3.47: {ok, reply, toolCalls, turn, out}) with scripted tool calls; no real API. Covers: hidden while the AI helper is off; a chat round-trip
// (job compa, the chat and a compact context); a read tool runs here and its result goes back with the turn unchanged; an action (Scout NHL) shows "El Compa wants to: … · cost [Do it] [No]",
// No runs nothing, Do it runs the real scRunRow once; no passphrase, sync key, bet note or bet id in any payload; everything escaped, only http(s) links; the chat kept for the day, Clear;
// phone 390 full-screen sheet with a 16 px input; no page errors.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,600)); };
const NOW=Date.parse('2026-11-16T18:00:00Z'), H=3600e3, iso=ms=>new Date(ms).toISOString(), DAY='2026-11-16', YDAY='2026-11-15', PASSW='pw-secret-123', SYNCK='sync-key-secret-456';
const team=(ha,a)=>({ha,abbr:a,name:a,loc:a,color:'333333',alt:'cccccc',logo:''});
const GI={state:'pre',startISO:iso(NOW+3*H),timeCT:'',detail:'',teams:[team('away','DEN'),team('home','LAL')]};
const prow=(name,mkt,side,book,odds,p,fair,o)=>Object.assign({name,team:'DEN',game:'DEN @ LAL',matchup:'DEN @ LAL',side,sport:'NBA',market:mkt,kind:'prop',book,offeredRaw:odds,offeredProb:p,fairProb:fair,fairRaw:'',mktProb:fair,stars:3,evModel:'market',gameInfo:GI,src:'api:NBA:props',apiKey:null,loadedAt:iso(NOW-10*60e3)},o||{});
const ROWS=[prow('Nikola Jokic','11.5 Rebounds','O','DraftKings','-110',0.5238,0.58), prow('Jamal Murray','1.5 Triples Made','O','DraftKings','+120',0.4545,0.47)];
const bet=(id,o)=>Object.assign({id,key:id,sport:'NBA',kind:'prop',book:'FanDuel',odds:'-110',stake:5,date:YDAY,dateSet:true,manual:true,game:'DEN @ LAL',name:'Nikola Jokic',side:'O',market:'11.5 Rebounds',betnow:'O 11.5 -110',notes:'my secret note',snap:{at:iso(NOW-30*H)}},o);
const LOG=[bet('b-won-777',{result:'win',stake:4,odds:'+100',start:iso(NOW-28*H)}), bet('b-lost-888',{result:'loss',stake:3,start:iso(NOW-28*H)}), bet('b-open-999',{date:DAY,start:iso(NOW+3*H)})];
// the fake Worker
const CALLS=[]; const FAKE={key:''}; const S={left:40, props:[]};
const T=(id,name,input)=>({type:'tool_use', id, name, input});
function answer(input){ const M=input.messages||[], last=String((M[M.length-1]||{}).content||''), n=(input.toolResults||[]).length;
  const ok=(reply, calls, turn)=>({ok:true, job:'compa', reply, toolCalls:calls||[], turn:turn||[], out:{reply, toolCalls:calls||[], turn:turn||[]}, usage:{in:900,out:120,cacheRead:0,cacheWrite:0,searches:0}, usd:0.012, spentToday:0.2, spentMonth:3.5});
  if(/^hola/.test(last)) return ok('Órale, Jefe. <img src=x onerror="window._xss=1"> <b>bold</b> See https://www.espn.com/nba/injuries. Not this: javascript:alert(1)');
  if(/card/.test(last)){ if(n===0){ const tu=T('toolu_card','get_card',{key:FAKE.key}); const turn=[{type:'thinking', thinking:'', signature:'sig-XyZ+/='},{type:'text', text:'Let me look.'}, tu]; return ok('Let me look.', [{id:tu.id, name:tu.name, input:tu.input, action:false}], turn); } return ok('That card shows a chance as La Contadora counts it.'); }
  if(/log/.test(last)){ if(n===0){ const tu=T('toolu_log','get_log_summary',{range:'all', sport:null, book:null, result:null}); return ok('', [{id:tu.id, name:tu.name, input:tu.input, action:false}], [tu]); } return ok('Two settled bets: one win, one loss.'); }
  if(/scout/.test(last)){ if(n===0){ const tu=T('toolu_sc','scout_now',{sport:'NHL', cost:{text:'2 BettingPros calls', bettingpros:2, sgo:0, oddsapi:0, oddspapi:0}}); return ok('I can scout NHL for you.', [{id:tu.id, name:tu.name, input:tu.input, action:true}], [{type:'text', text:'I can scout NHL for you.'}, tu]); } return ok('Okay, as the app reported.'); }
  return ok('Unknown in this test.'); }
async function worker(route){ const req=route.request(), u=new URL(req.url());
  if(u.pathname==='/ai/status') return route.fulfill({status:200, contentType:'application/json', body:JSON.stringify({setUp:true, spentToday:0.12, spentMonth:3.4, capDay:5, capMonth:90})});
  if(u.pathname==='/ai'){ if(req.method()==='OPTIONS') return route.fulfill({status:204, headers:{'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'POST, GET, OPTIONS'}});
    let body={}; try{ body=JSON.parse(req.postData()||'{}'); }catch(e){}
    CALLS.push({job:body.job, input:body.input, raw:req.postData()||''});
    if(body.job!=='compa') return route.fulfill({status:200, contentType:'application/json', body:JSON.stringify({ok:true, job:body.job, out:{}, usd:0})});
    return route.fulfill({status:200, contentType:'application/json', body:JSON.stringify(answer(body.input||{}))}); }
  if(u.pathname==='/budget') return route.fulfill({contentType:'application/json', body:JSON.stringify({limit:50, used:50-S.left, left:S.left})});
  if(u.pathname==='/props' && u.searchParams.get('cache_only')==='1') return route.fulfill({contentType:'application/json', body:JSON.stringify({props:[],_meta:{cache_only_empty:true}})});   /* v5.68: the Board opening asks for saved loads only: not a BettingPros call */
  if(u.pathname==='/props'){ S.props.push(u.searchParams.get('sport')+':'+u.searchParams.get('pages')); return route.fulfill({contentType:'application/json', body:JSON.stringify({props:[],source_count:0,debug:{}})}); }
  if(u.pathname==='/live') return route.fulfill({contentType:'application/json', body:JSON.stringify({at:new Date().toISOString(), results:{}})});
  return route.fulfill({status:200, contentType:'application/json', body:'{}'}); }
async function open(b, o){ o=o||{}; const ctx=await b.newContext({timezoneId:'America/Chicago', viewport:{width:o.w||1280, height:o.h||900}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(([L,rows,on,pass,sk,keep])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); if(!keep) localStorage.clear(); localStorage.setItem('mbev.pass',pass); localStorage.setItem('mbev.syncKey',sk);
    localStorage.setItem('mbev.log',JSON.stringify(L)); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:'2026-11-16',rows}));
    if(on) localStorage.setItem('mbev.ai.on','1'); else localStorage.removeItem('mbev.ai.on'); localStorage.setItem('mbev.cards','1'); localStorage.setItem('mbev.cfg',JSON.stringify({books:'DraftKings, FanDuel, Novig',bank:'5000',cfgVer:3.03})); }catch(e){} }, [LOG, ROWS, o.on!==false, PASSW, SYNCK, !!o.keep]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/0xbeta\.dev/.test(u)) return worker(r); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(3500);
  return {ctx,p,errs}; }
const ev=async(p,fn,arg)=>{ try{ return await p.evaluate(fn,arg); }catch(e){ return {evalError:String(e.message||e).slice(0,200)}; } };
const vis=(p,sel)=>ev(p,s=>{ const el=document.querySelector(s); return !!(el && el.getClientRects().length && getComputedStyle(el).visibility!=='hidden'); },sel);
const send=async(p,t)=>{ const r=await ev(p,t=>{ const i=document.getElementById('compaIn'), b=document.getElementById('compaSend'); if(!i || !b) return false; i.value=t; b.click(); return true; },t); await p.waitForTimeout(900); return r; };
const compaCalls=()=>CALLS.filter(c=>c.job==='compa');
const listTxt=p=>ev(p,()=>((document.getElementById('compaList')||{}).textContent)||'');
const safe=async(name,f)=>{ try{ await f(); }catch(e){ check(name+' (threw)', false, String(e.message||e).slice(0,300)); } };
(async()=>{ const b=await chromium.launch(); let X; const ERRS=[];
  // 1. Hidden while the AI helper is off.
  X=await open(b,{on:false});
  await safe('off', async()=>{ const has=await ev(X.p,()=>!!document.getElementById('compaBtn'));
    check('1. with the AI helper off, the 🤝 El Compa button exists but is hidden, and nothing is sent', has===true && !(await vis(X.p,'#compaBtn')) && !compaCalls().length, {has}); });
  ERRS.push(...X.errs); await X.ctx.close();

  // 2. Chat round-trip, escaping, links.
  X=await open(b,{});
  await safe('chat', async()=>{
    const v=await vis(X.p,'#compaBtn'), txt=await ev(X.p,()=>(document.getElementById('compaBtn')||{}).textContent||'');
    check('2. with the AI helper on, a floating "🤝 El Compa" button shows on the Board', v===true && /🤝\s*El Compa/.test(txt), {v, txt});
    await ev(X.p,()=>{ const t=document.querySelector('.tab[data-view="v-settings"]'); if(t) t.click(); }); await X.p.waitForTimeout(300);
    check('2. it shows on another page too (Settings)', await vis(X.p,'#compaBtn'), null);
    await ev(X.p,()=>{ const t=document.querySelector('.tab[data-view="v-board"]'); if(t) t.click(); });
    await ev(X.p,()=>document.getElementById('compaBtn').click()); await X.p.waitForTimeout(300);
    const pv=await vis(X.p,'#compaPanel'), foot=await ev(X.p,()=>(document.querySelector('#compaPanel .cp-foot')||{}).textContent||'');
    check('2. one tap opens the chat panel with the cost note "This costs about 1–3¢ a message"', pv===true && /This costs about 1–3¢ a message/.test(foot), {pv, foot});
    const sent=await send(X.p,'hola compa');
    const c=compaCalls()[0]||{}, inp=c.input||{};
    check('2. Send posts job "compa" with the chat (text only) and a compact context', sent===true && compaCalls().length===1 && JSON.stringify(inp.messages)===JSON.stringify([{role:'user',content:'hola compa'}]) && Array.isArray(inp.toolResults) && !inp.toolResults.length && inp.context && inp.context.board && Array.isArray(inp.context.board.approvedCards) && inp.context.plan && inp.context.logToday && inp.context.quotas && inp.context.costs && inp.context.costs.scout_now, {sent, n:compaCalls().length, keys:Object.keys(inp.context||{})});
    const ctx=inp.context||{};
    check('2. the context: counts per tab, approved cards (≤15, key/player/market/book/price/stake/chance/tab), today’s log totals, quotas, costs', ctx.board && typeof ctx.board.approvedPerTab==='object' && ctx.board.approvedCards.length<=15 && ctx.board.approvedCards.every(x=>'key' in x && 'player' in x && 'price' in x && 'stake' in x && 'chance' in x && 'tab' in x) && ctx.logToday.bets!=null, ctx.board);
    const esc=await ev(X.p,()=>{ const L=document.getElementById('compaList'), him=[...L.querySelectorAll('.cp-him')].pop(); return {img:L.querySelectorAll('img').length, b:L.querySelectorAll('.cp-him b').length, xss:window._xss||null, text:him?him.textContent:'', links:[...L.querySelectorAll('a')].map(a=>a.getAttribute('href')), rel:[...L.querySelectorAll('a')].map(a=>a.rel)}; });
    check('2. the reply is shown as text: the <img> and <b> are escaped (no element, nothing ran)', esc.img===0 && esc.b===0 && esc.xss===null && /<img src=x/.test(esc.text) && /<b>bold<\/b>/.test(esc.text), esc);
    check('2. only an http(s) address becomes a link (no javascript:), opened in a new tab with noopener', JSON.stringify(esc.links)==='["https://www.espn.com/nba/injuries"]' && /noopener/.test(esc.rel[0]||''), esc);
    // 3. Read tool round-trip.
    FAKE.key=await ev(X.p,()=>pxKey(lastRows.find(r=>r.name==='Nikola Jokic')));
    const n0=compaCalls().length; await send(X.p,'why this card?'); await X.p.waitForTimeout(600);
    const C=compaCalls().slice(n0), r1=(C[1]||{}).input||{}, rd=(r1.toolResults||[])[0]||{};
    check('3. a read tool (get_card) runs in the app with no question: two calls, the second carries the result for its id', C.length===2 && rd.results && rd.results.length===1 && rd.results[0].id==='toolu_card' && /Nikola Jokic/.test(rd.results[0].content) && /"chance"/.test(rd.results[0].content) && !(await ev(X.p,()=>!!document.querySelector('#compaList .cp-ask'))), {n:C.length, rd});
    check('3. the turn goes back exactly as the Worker returned it (thinking signature included); the chat and context are the same in both calls', JSON.stringify(rd.turn)===JSON.stringify([{type:'thinking', thinking:'', signature:'sig-XyZ+/='},{type:'text', text:'Let me look.'},{type:'tool_use', id:'toolu_card', name:'get_card', input:{key:FAKE.key}}]) && JSON.stringify(r1.messages)===JSON.stringify(C[0].input.messages) && JSON.stringify(r1.context)===JSON.stringify(C[0].input.context), rd.turn);
    const lt=await listTxt(X.p);
    check('3. the chat shows the answer', /That card shows a chance as La Contadora counts it/.test(lt), lt.slice(-200));
    const n1=compaCalls().length; await send(X.p,'how did my log do?'); await X.p.waitForTimeout(600);
    const lg=(((compaCalls()[n1+1]||{}).input||{}).toolResults||[{results:[{}]}])[0].results[0].content||'';
    check('3. get_log_summary: counts and bets, only settled bets win or lose; no bet ids or notes', /"wins":1/.test(lg) && /"losses":1/.test(lg) && /"open":1/.test(lg) && !/b-won-777|b-lost-888|b-open-999|my secret note/.test(lg), lg.slice(0,300));
    // 4. Action: No runs nothing; Do it runs the real scRunRow once.
    await ev(X.p,()=>{ window._nRun=0; window._runArgs=null; const o=scRunRow; scRunRow=async function(row, how){ window._nRun++; window._runArgs=[row&&row.sp, how]; return o(row, how); }; });
    const n2=compaCalls().length; await send(X.p,'scout nhl please'); await X.p.waitForTimeout(400);
    const ask=await ev(X.p,()=>{ const a=document.querySelector('#compaList .cp-ask'); return a?a.textContent:''; });
    check('4. an action shows the confirm card first: "El Compa wants to: Scout NHL now · up to 2 BettingPros calls [Do it] [No]", nothing run yet', /El Compa wants to:\s*Scout NHL now · up to 2 BettingPros calls/.test(ask) && /Do it/.test(ask) && /No/.test(ask) && (await ev(X.p,()=>window._nRun))===0 && compaCalls().length===n2+1, {ask, n:compaCalls().length-n2});
    await ev(X.p,()=>document.querySelector('#compaList [data-cp="no"]').click()); await X.p.waitForTimeout(900);
    const noRes=((((compaCalls()[n2+1]||{}).input||{}).toolResults||[])[0]||{}).results||[];
    check('4. No: scRunRow never ran, no BettingPros call, and El Compa is told "No"', (await ev(X.p,()=>window._nRun))===0 && S.props.length===0 && noRes.length===1 && /"ownerSaid":"No"/.test(noRes[0].content) && /You said No/.test(await listTxt(X.p)), {nRun:await ev(X.p,()=>window._nRun), props:S.props, noRes});
    await ev(X.p,()=>{ sportNext={NHL:Date.now()+3*3600e3}; window._scScanAt=Date.now()+30*864e5; scanSportTimes=async()=>{}; });   /* an NHL game in 3 hours (the fake ESPN has none), as v518 does */
    const n3=compaCalls().length; await send(X.p,'scout nhl now'); await X.p.waitForTimeout(400);
    await ev(X.p,()=>document.querySelector('#compaList [data-cp="yes"]').click()); await X.p.waitForTimeout(3500);
    const run=await ev(X.p,()=>({n:window._nRun, a:window._runArgs})), yes=((((compaCalls()[n3+1]||{}).input||{}).toolResults||[])[0]||{}).results||[];
    check('4. Do it: the real scRunRow ran once for NHL (BettingPros props asked for NHL) and the result went back', run.n===1 && run.a[0]==='NHL' && run.a[1]==='now' && S.props.length===1 && /^NHL:/.test(S.props[0]) && yes.length===1 && /"done":true/.test(yes[0].content) && /Scouted/.test(yes[0].content), {run, props:S.props, yes});
    // 5. No secret in any payload.
    const raws=CALLS.map(c=>c.raw).join('\n');
    check('5. no passphrase, sync key, bet note or bet id in any request to the AI', CALLS.length>=8 && !raws.includes(PASSW) && !raws.includes(SYNCK) && !raws.includes('my secret note') && !/b-won-777|b-lost-888|b-open-999/.test(raws), CALLS.length);
    // 6. History for the day; Clear.
    const st=await ev(X.p,()=>JSON.parse(localStorage.getItem('mbev.compa')||'null'));
    check('6. the chat is kept for today in mbev.compa (this device)', st && st.day===('2026-11-16') && st.msgs.length>=8 && st.msgs.some(m=>m.role==='user' && m.content==='hola compa'), st && {day:st.day, n:st.msgs.length});
  });
  ERRS.push(...X.errs);
  // reload: the chat is still there; Clear empties it
  await safe('reload', async()=>{ await X.p.reload(); await X.p.waitForTimeout(3000);
    await ev(X.p,()=>document.getElementById('compaBtn').click()); await X.p.waitForTimeout(300);
    check('6. after a reload the chat is still there', /hola compa/.test(await listTxt(X.p)), (await listTxt(X.p)).slice(0,80));
    await ev(X.p,()=>document.getElementById('compaClear').click()); await X.p.waitForTimeout(200);
    check('6. Clear empties it', (await ev(X.p,()=>localStorage.getItem('mbev.compa')))===null && !/hola compa/.test(await listTxt(X.p)), await listTxt(X.p));
    const many=await ev(X.p,()=>{ for(let i=0;i<130;i++) compaPush(i%2?'assistant':'user','m'+i); return JSON.parse(localStorage.getItem('mbev.compa')).msgs.length; });
    check('6. at most the last 100 messages are kept', many===100, many);
    await ev(X.p,()=>compaClear()); });
  ERRS.push(...X.errs); await X.ctx.close();

  // 7. Phone 390: a full-screen sheet; 16 px input; nothing wider than the screen.
  X=await open(b,{w:390, h:844});
  await safe('phone', async()=>{
    const bt=await ev(X.p,()=>{ const r=document.getElementById('compaBtn').getBoundingClientRect(); return {l:r.left, r:r.right, b:r.bottom, h:r.height, vw:innerWidth, vh:innerHeight}; });
    check('7. phone 390: the button is inside the screen and 44 px tall', bt.l>=0 && bt.r<=bt.vw && bt.b<=bt.vh && bt.h>=44, bt);
    await ev(X.p,()=>document.getElementById('compaBtn').click()); await X.p.waitForTimeout(300);
    const sh=await ev(X.p,()=>{ const r=document.getElementById('compaPanel').getBoundingClientRect(), i=document.getElementById('compaIn'), s=document.getElementById('compaSend').getBoundingClientRect(); return {x:r.left, y:r.top, w:r.width, h:r.height, vw:innerWidth, vh:innerHeight, fs:getComputedStyle(i).fontSize, sendIn:s.right<=innerWidth && s.bottom<=innerHeight, sw:document.documentElement.scrollWidth}; });
    check('7. phone 390: the chat is a full-screen sheet, the input is 16 px, Send is on screen, nothing wider than 390', sh.x===0 && sh.y===0 && Math.round(sh.w)===390 && Math.round(sh.h)===sh.vh && sh.fs==='16px' && sh.sendIn && sh.sw<=390, sh);
    await send(X.p,'hola'); const lt=await listTxt(X.p);
    check('7. phone 390: a message and its answer show in the sheet', /Órale, Jefe/.test(lt), lt.slice(0,120));
    await ev(X.p,()=>document.getElementById('compaX').click()); await X.p.waitForTimeout(200);
    check('7. × closes it and the button comes back', !(await vis(X.p,'#compaPanel')) && (await vis(X.p,'#compaBtn')), null);
  });
  ERRS.push(...X.errs); await X.ctx.close();
  // 8. Desktop 1960: a side panel, not full screen.
  X=await open(b,{w:1960, h:1000});
  await safe('wide', async()=>{ await ev(X.p,()=>document.getElementById('compaBtn').click()); await X.p.waitForTimeout(300);
    const r=await ev(X.p,()=>{ const r=document.getElementById('compaPanel').getBoundingClientRect(); return {l:r.left, w:r.width, r:r.right, vw:innerWidth}; });
    check('8. computer 1960: a side panel on the right (400 px), the board stays in view', r.w<=400 && r.w>=300 && r.r<=r.vw && r.l>r.vw/2, r); });
  ERRS.push(...X.errs); await X.ctx.close();
  check('9. no page errors', ERRS.length===0, ERRS.slice(0,5));
  await b.close();
  console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail?1:0);
})();
