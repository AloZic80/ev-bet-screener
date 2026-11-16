// node tests/v515-ai-test.js [index.html] — v5.15: the AI helper, app side (owner 11/15-16: "its only for me now." · "Lets use it to its full potential. All that we can." · "LETS CHOOSE SONNET").
// Contract: agent-notes/ai-helper-contract_2026-11-15_v1.md; the Worker is prop-bet-api src/ai.js (branch claude/ai-helper). The Worker's /ai and /ai/status are routed here with fake
// JSON answers per job and per error code: no real API. Covers: off until /ai/status says set up and the switch is on (every button hidden while off); plain words for every error code
// (caps, locked, not set up, ...); each job's happy path and its confirm step (slip single and parlay, prices, news, match, grade, settle, market, ask, weekly, bug); nothing is saved
// without Use or Save; the data points written (mbev.ai.slips, names, sources, markets, news, log), in sync's allow-list; names and markets used with the AI off; Clear AI data;
// 390, 1000, 1280 and 1960 px, light and dark, nothing wider than the screen; no page errors (other than the one thrown on purpose for the bug note).
// Fails on the v5.13 file, passes on the new one.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,500)); };
const NOW=Date.parse('2026-11-16T18:00:00Z'), H=3600e3, iso=ms=>new Date(ms).toISOString(), DAY='2026-11-16', YDAY='2026-11-15', PASSW='pw-secret-123';
const team=(ha,a)=>({ha,abbr:a,name:a,loc:a,color:'333333',alt:'cccccc',logo:''});
const GI={state:'pre',startISO:iso(NOW+3*H),timeCT:'',detail:'',teams:[team('away','DEN'),team('home','LAL')]};
const prow=(name,mkt,side,book,odds,p,fair,o)=>Object.assign({name,team:'DEN',game:'DEN @ LAL',matchup:'DEN @ LAL',side,sport:'NBA',market:mkt,kind:'prop',book,offeredRaw:odds,offeredProb:p,fairProb:fair,fairRaw:'',mktProb:fair,stars:3,evModel:'market',gameInfo:GI,src:'api:NBA:props',apiKey:null,loadedAt:iso(NOW-10*60e3)},o||{});
const ROWS=[prow('Nikola Jokic','11.5 Rebounds','O','DraftKings','-110',0.5238,0.58), prow('Nikola Jokic','11.5 Rebounds','U','DraftKings','-110',0.5238,0.42),
  prow('Jamal Murray','1.5 Triples Made','O','DraftKings','+120',0.4545,0.47), prow('Jamal Murray','0.5 Double Double','O','DraftKings','+400',0.2,0.21)];
const bet=(id,o)=>Object.assign({id,key:id,sport:'NBA',kind:'prop',book:'FanDuel',odds:'-110',stake:5,date:YDAY,dateSet:true,manual:true,game:'DEN @ LAL',name:'Nikola Jokic',side:'O',market:'11.5 Rebounds',betnow:'O 11.5 -110',notes:'my secret note',snap:{at:iso(NOW-30*H)}},o);
const LOG=[ bet('b-won',{result:'win',gradedBy:'manual',stake:4,odds:'+100',start:iso(NOW-28*H)}), bet('b-lost',{result:'loss',gradedBy:'manual',stake:3,start:iso(NOW-28*H)}),
  bet('b-ungraded',{result:'?',why:{reason:'stat not found'},start:iso(NOW-28*H)}), bet('b-ungraded2',{name:'Jamal Murray',market:'2.5 Threes',result:'?',start:iso(NOW-28*H)}),
  bet('b-novig',{book:'Novig',date:DAY,start:iso(NOW+3*H),odds:'-108'}) ];
// the fake Worker
let STATUS={code:200, body:{setUp:true, spentToday:0.12, spentMonth:3.4, capDay:5, capMonth:90}}; let ERR=null; const CALLS=[];
const OUT={
  slip:{book:'FanDuel', kind:'single', stake:10, odds:-115, toWin:8.7, legs:[{player:'Nikola Jokic', market:'Rebounds', line:11.5, side:'Over'}], confidence:'high', unclear:['odds']},
  slipPar:{book:'PrizePicks', kind:'parlay', stake:5, odds:400, legs:[{player:'Nikola Jokic',market:'Rebounds',line:11.5,side:'Over'},{player:'Jamal Murray',market:'Points',line:20.5,side:'Under'},{player:'LeBron James',market:'Assists',line:7.5,side:'Over'}], entryType:'flex', paysAll:5, flexPays:['2x','0.4x'], free:false, confidence:'medium', unclear:[]},
  prices:{book:'FanDuel', rows:[{player:'Nikola Jokic', market:'Rebounds', line:11.5, side:'Over', odds:-105},{player:'Somebody Else', market:'Points', line:20.5, side:'Over', odds:110}], unclear:['Somebody Else points under odds']},
  news:{status:'questionable', summary:'Listed questionable with a sore ankle on Sunday.', checkedAt:iso(NOW), sources:[{title:'NBA injury report', url:'https://www.espn.com/nba/injuries', seen:true}]},
  match:{i:1, confidence:'high', why:'Same player (Joker is Nikola Jokic), rebounds, 11.5, over, same game.'},
  grade:{result:'win', stat:'14', source:{title:'Nuggets vs Lakers box score', url:'https://www.espn.com/nba/boxscore/_/gameId/401', seen:true}, why:'He had 14 rebounds; the line was 11.5 over.'},
  settle:{agrees:false, ourResult:'loss', stat:'9', source:{title:'Box score', url:'https://www.nba.com/game/den-lal', seen:true}, why:'He had 9 rebounds, under 11.5.'},
  market:{map:[{name:'Triples Made', key:'threes', why:'three-pointers made'},{name:'Double Double', key:null, why:'no known market'}]},
  ask:{answer:'You won 1 of 2 settled NBA bets, +$1.00 in all.', table:[['Sport','Bets','Profit'],['NBA','2','+1.00']], usedRows:2},
  weekly:{text:'This week you placed a few bets. Too few settled bets to tell skill from luck.'},
  bug:{title:'Test error thrown on purpose', likelyCause:'A test threw it.', steps:['opened the page']},
};
let SLIPKIND='slip';
async function worker(route){ const req=route.request(), u=new URL(req.url());
  if(u.pathname==='/ai/status'){ CALLS.push({path:'/ai/status', pass:req.headers()['x-screener-pass']||''}); return route.fulfill({status:STATUS.code, contentType:'application/json', body:JSON.stringify(STATUS.body)}); }
  if(u.pathname==='/ai'){ if(req.method()==='OPTIONS') return route.fulfill({status:204, headers:{'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'POST, GET, OPTIONS'}});
    let body={}; try{ body=JSON.parse(req.postData()||'{}'); }catch(e){}
    CALLS.push({path:'/ai', job:body.job, input:body.input, pass:req.headers()['x-screener-pass']||'', ct:req.headers()['content-type']||'', raw:(req.postData()||'').length<400000?req.postData():'(large)'});
    if(ERR) return route.fulfill({status:ERR.code, contentType:'application/json', body:JSON.stringify(ERR.body)});
    const out=body.job==='slip'?OUT[SLIPKIND]:OUT[body.job];
    return route.fulfill({status:200, contentType:'application/json', body:JSON.stringify({ok:true, job:body.job, out, usage:{in:900,out:200,cacheRead:0,cacheWrite:0,searches:0}, usd:0.0123, spentToday:0.1323, spentMonth:3.4123})}); }
  return route.fulfill({status:401, contentType:'application/json', body:'{"error":"locked: wrong or missing screener passphrase"}'}); }
const ALLERR=[];
async function open(b, o){ o=o||{}; const ctx=await b.newContext({timezoneId:'America/Chicago', viewport:{width:o.w||1280, height:o.h||900}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(([L,rows,on,dark,pass])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.pass',pass);
    if(L) localStorage.setItem('mbev.log',JSON.stringify(L)); if(rows) localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:'2026-11-16',rows}));
    if(on) localStorage.setItem('mbev.ai.on','1'); localStorage.setItem('mbev.cards','1'); localStorage.setItem('mbev.cfg',JSON.stringify({books:'DraftKings, FanDuel, Novig',bank:'5000',cfgVer:3.03})); if(dark) localStorage.setItem('mbev.theme','dark'); }catch(e){} }, [o.log===undefined?LOG:o.log, o.rows===undefined?ROWS:o.rows, o.on!==false, !!o.dark, PASSW]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>{ if(!/boom for the bug note/.test(e.message)){ errs.push(e.message); ALLERR.push(e.message+' @ '+String(e.stack||'').split('\n').slice(1,3).join(' | ')); } });
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/0xbeta\.dev/.test(u)) return worker(r); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(3500); if(o.dark) await p.evaluate(()=>{ document.documentElement.setAttribute('data-theme','dark'); });
  return {ctx,p,errs}; }
const ev=async(p,fn,arg)=>{ try{ return await p.evaluate(fn,arg); }catch(e){ return {evalError:String(e.message||e).slice(0,200)}; } };
const tab=(p,v)=>ev(p,v=>{ const t=document.querySelector('.tab[data-view="'+v+'"]'); if(t) t.click(); },v);
const lastAi=job=>CALLS.filter(c=>c.path==='/ai' && (!job || c.job===job)).slice(-1)[0]||null;
const nAi=()=>CALLS.filter(c=>c.path==='/ai').length;
// a picture made in the page (3000 x 1200), dropped on a drop zone
const dropPic=(p,zone)=>ev(p,async z=>{ const c=document.createElement('canvas'); c.width=3000; c.height=1200; const x=c.getContext('2d'); x.fillStyle='#fff'; x.fillRect(0,0,3000,1200); x.fillStyle='#000'; x.font='80px sans-serif'; x.fillText('Jokic Over 11.5 Rebounds -115 $10',100,300);
  const blob=await new Promise(r=>c.toBlob(r,'image/png')); const f=new File([blob],'slip.png',{type:'image/png'}); const dt=new DataTransfer(); dt.items.add(f);
  const el=document.getElementById(z); if(!el) return 'no zone'; el.dispatchEvent(new DragEvent('drop',{dataTransfer:dt, bubbles:true, cancelable:true})); return 'dropped'; }, zone);
const waitFor=async(p,fn,arg,ms)=>{ try{ await p.waitForFunction(fn,arg,{timeout:ms||6000}); return true; }catch(e){ return false; } };

(async()=>{
  const b=await chromium.launch();
  // ===== 1. OFF until set up and switched on =====
  let S=await open(b,{on:false});
  let st=await ev(S.p,()=>({cls:document.documentElement.classList.contains('ai-on'), slip:!!(document.getElementById('aiSlip')&&document.getElementById('aiSlip').getClientRects().length), shot:!!(document.getElementById('aiShotBtn')&&document.getElementById('aiShotBtn').getClientRects().length), sw:document.getElementById('aiOnBox')?document.getElementById('aiOnBox').disabled:null}));
  check('1. off by default: no ai-on class, Read slip and Add prices from a screenshot hidden, the switch disabled until the Worker is checked', st.cls===false && !st.slip && !st.shot && st.sw===true, st);
  STATUS={code:200, body:{setUp:false, spentToday:0, spentMonth:0, capDay:5, capMonth:90}};
  await tab(S.p,'v-settings'); await ev(S.p,()=>{ const d=document.getElementById('aiPanel'); d.open=true; d.dispatchEvent(new Event('toggle')); }); await S.p.waitForTimeout(600);
  st=await ev(S.p,()=>({t:document.getElementById('aiStatus').textContent, sw:document.getElementById('aiOnBox').disabled}));
  check('1. the Worker says it is not set up: "Not set up on your Worker yet (it has no Anthropic key)" and the switch stays disabled', /Not set up on your Worker yet \(it has no Anthropic key\)/.test(st.t) && st.sw===true, st);
  STATUS={code:401, body:{error:'locked: wrong or missing screener passphrase'}}; await ev(S.p,()=>document.getElementById('aiCheck').click()); await S.p.waitForTimeout(500);
  st=await ev(S.p,()=>document.getElementById('aiStatus').textContent);
  check('1. locked: "Your Worker did not accept the screener passphrase. Check it in Settings › Connect." (no JSON)', /did not accept the screener passphrase\. Check it in Settings › Connect/.test(st) && !/\{/.test(st), st);
  STATUS={code:200, body:{setUp:true, spentToday:0.12, spentMonth:3.4, capDay:5, capMonth:90}}; await ev(S.p,()=>document.getElementById('aiCheck').click()); await S.p.waitForTimeout(500);
  st=await ev(S.p,()=>({t:document.getElementById('aiStatus').textContent, sw:document.getElementById('aiOnBox').disabled, cls:document.documentElement.classList.contains('ai-on')}));
  check('1. set up: the switch can be ticked; still off until ticked; spent and caps shown "Spent today $0.12 of $5.00 · this month $3.40 of $90.00"', st.sw===false && st.cls===false && /Spent today \$0\.12 of \$5\.00 · this month \$3\.40 of \$90\.00/.test(st.t), st);
  const passOk=CALLS.filter(c=>c.path==='/ai/status').every(c=>c.pass===PASSW);
  check('1. /ai/status is sent with the screener passphrase header like the other Worker calls', passOk && CALLS.some(c=>c.path==='/ai/status'), CALLS.map(c=>c.path+':'+(c.pass?'pass':'none')));
  await ev(S.p,()=>{ const s=document.getElementById('aiOnBox'); s.checked=true; s.dispatchEvent(new Event('change')); });
  st=await ev(S.p,()=>({cls:document.documentElement.classList.contains('ai-on'), on:localStorage.getItem('mbev.ai.on'), t:document.getElementById('aiStatus').textContent}));
  check('1. ticked: html.ai-on, mbev.ai.on = 1, "On." in the status line', st.cls===true && st.on==='1' && /^On\./.test(st.t), st);
  await S.ctx.close();

  // ===== 2. plain words for every error code =====
  S=await open(b,{});
  const errCases=[
    ['cap day',429,{ok:false,error:'cap',which:'day',resets:'2026-11-17T06:00:00.000Z',spentToday:5.01,capDay:5},/Today’s AI budget is used up \(it keeps a little in reserve for the largest job\): \$5\.01 of \$5\.00 spent\. Nothing was sent\. It starts again Tue, 11\/17, 12:00 AM CT\./],
    ['cap month',429,{ok:false,error:'cap',which:'month',resets:'2026-12-01T06:00:00.000Z',spentMonth:90.2,capMonth:90},/This month’s AI budget is used up \(it keeps a little in reserve for the largest job\): \$90\.20 of \$90\.00 spent\. Nothing was sent\. It starts again Tue, 12\/1, 12:00 AM CT\./],
    ['origin',403,{ok:false,error:'origin'},/did not accept requests from this web address\. Nothing was sent/],
    ['content_type',415,{ok:false,error:'content_type'},/refused the request format/],
    ['too_large',413,{ok:false,error:'too_large'},/too large to send\. Try a smaller screenshot or less text\. Nothing was sent/],
    ['not_locked',503,{ok:false,error:'not_locked'},/no screener passphrase set/],
    ['locked',401,{error:'locked: wrong or missing screener passphrase'},/Your Worker did not accept the screener passphrase\. Check it in Settings › Connect\./],
    ['bad_input',400,{ok:false,error:'bad_input',why:'image over 5 MB'},/The Worker could not take this request: image over 5 MB\./],
    ['refusal',200,{ok:false,error:'refusal',usd:0.002,spentToday:0.2,spentMonth:3.5},/The AI declined to answer this one\. Nothing was changed\./],
    ['max_tokens',200,{ok:false,error:'max_tokens',usd:0.01},/The answer was too long and was cut off/],
    ['bad_output',200,{ok:false,error:'bad_output',usd:0.01},/The answer could not be read\. Nothing was changed/],
    ['busy',502,{ok:false,error:'busy',status:529},/Anthropic is busy right now\. Try again in a minute\./],
    ['bad_key',502,{ok:false,error:'bad_key',status:401},/The Anthropic key on your Worker was not accepted/],
    ['rejected',502,{ok:false,error:'rejected',status:400},/Anthropic did not accept this request/],
    ['api',502,{ok:false,error:'api',status:500},/The AI helper could not answer \(error 500\)\. Nothing was changed\./],
    ['not_set_up',503,{ok:false,error:'not_set_up'},/not set up on your Worker yet \(it has no Anthropic key\)\. Nothing was sent\./]];
  for(const [n,code,body,re] of errCases){ ERR={code,body}; const r=await ev(S.p,()=>aiCall('news',{player:'Nikola Jokic',game:'DEN @ LAL',sport:'NBA'}));
    check('2. '+n+': plain words, no JSON', r && r.ok===false && re.test(r.err||'') && !/[{}]/.test(r.err||''), r); }
  const off=await ev(S.p,()=>({on:aiOn(), btn:!!document.getElementById('aiSlip').getClientRects().length}));
  check('2. after "not set up" from the Worker the helper turns itself off (aiOn false)', off.on===false, off);
  await ev(S.p,()=>{ aiPutLocal('status',{setUp:true, spentToday:0, spentMonth:0, capDay:5, capMonth:90}); aiPaint(); });
  ERR={code:429,body:{ok:false,error:'cap',which:'day',resets:'2026-11-17T06:00:00.000Z',spentToday:5.01,capDay:5}};
  await tab(S.p,'v-add'); await ev(S.p,()=>{ const P=document.getElementById('addBetPanel'); P.open=true; P.dispatchEvent(new Event('toggle')); }); await S.p.waitForTimeout(1200);
  await dropPic(S.p,'aiSlipDrop'); await waitFor(S.p,()=>/budget/.test((document.getElementById('aiSlipOut')||{}).textContent||''));
  check('2b. a 429 cap answer from /ai does NOT pause the other Worker calls (wkPaused false)', (await ev(S.p,()=>({p:wkPaused()}))).p===false, null);
  st=await ev(S.p,()=>document.getElementById('aiSlipOut').textContent);
  check('2. a cap on Read slip shows in the slip box in plain words (Today’s AI budget is used up …)', /Today’s AI budget is used up/.test(st||'') && !/[{}]/.test(st||''), st);
  ERR=null;
  const lg=await ev(S.p,()=>JSON.parse(localStorage.getItem('mbev.ai.log')||'[]'));
  check('2. jobs with a cost are in mbev.ai.log as {at, job, usd} (a refusal still costs)', Array.isArray(lg) && lg.some(x=>x.job==='news' && x.usd===0.002 && x.at) && lg.every(x=>x.at && x.job && typeof x.usd==='number'), lg);
  await S.ctx.close();

  // ===== 3. slip: single bet =====
  S=await open(b,{}); SLIPKIND='slip';
  await tab(S.p,'v-add'); await ev(S.p,()=>{ const P=document.getElementById('addBetPanel'); P.open=true; P.dispatchEvent(new Event('toggle')); }); await S.p.waitForTimeout(1500);
  st=await ev(S.p,()=>({vis:!!document.getElementById('aiSlipPick').getClientRects().length, txt:document.getElementById('aiSlip').innerText.replace(/\s+/g,' '), n:logged.length}));
  check('3. + Add a bet shows "📷 Read slip" with pick, paste or drop', st.vis && /📷 Read slip/.test(st.txt) && /Pick, paste \(Ctrl\+V\) or drop a screenshot of your bet slip/.test(st.txt), st);
  const n0=st.n;
  await dropPic(S.p,'aiSlipDrop'); await waitFor(S.p,()=>!!document.getElementById('aiSlipUse'));
  let c=lastAi('slip');
  check('3. the slip goes as a JPEG of at most 1,600 px (3000 x 1200 → 1600 x 640), base64 with no data: prefix, with the passphrase header', !!c && c.input.mediaType==='image/jpeg' && !/^data:/.test(c.input.image) && /^[A-Za-z0-9+/=]+$/.test(c.input.image.slice(0,200)) && c.pass===PASSW && JSON.stringify(await ev(S.p,()=>window._aiLastImg))==='{"w":1600,"h":640,"type":"image/jpeg"}', c&&{mt:c.input.mediaType, pre:c.input.image.slice(0,12), img:await ev(S.p,()=>window._aiLastImg)});
  st=await ev(S.p,()=>({t:document.getElementById('aiSlipOut').innerText.replace(/\s+/g,' '), player:document.getElementById('abPlayer').value, n:logged.length}));
  check('3. the proposal lists what was read ("Read from the slip", Book FanDuel, Stake $ 10.00, Odds -115 ⚠, Pick Nikola Jokic Over 11.5 Rebounds) and nothing is filled or saved before Use', /Read from the slip/.test(st.t) && /Book FanDuel/.test(st.t) && /Stake \$ 10\.00/.test(st.t) && /Odds -115 ⚠/.test(st.t) && /Nikola Jokic Over 11\.5 Rebounds/.test(st.t) && /Not clear on the slip: odds/.test(st.t) && st.player==='' && st.n===n0, st);
  await ev(S.p,()=>document.getElementById('aiSlipUse').click()); await S.p.waitForTimeout(400);
  st=await ev(S.p,()=>{ const h=document.getElementById('abHost'), q=s=>h.querySelector(s); return {type:document.getElementById('abType').value, player:document.getElementById('abPlayer').value, stat:document.getElementById('abStat').value, line:document.getElementById('abLine').value, pick:document.getElementById('abPick').value,
    book:q('.eb-book')&&q('.eb-book').value, odds:q('.eb-odds')&&q('.eb-odds').value, stake:q('.eb-stake')&&q('.eb-stake').value, oddsUnclear:!!(q('.eb-odds')&&q('.eb-odds').closest('.ai-unclear')), gameUnclear:!!document.getElementById('abGame').closest('.ai-unclear'), n:logged.length, msg:document.getElementById('aiSlipOut').innerText}; });
  check('3. Use fills the single-bet form (Player prop, Nikola Jokic, Rebounds, 11.5, Over, FanDuel, -115, $10.00), marks the unclear odds and the game to pick, and saves nothing', st.type==='prop' && st.player==='Nikola Jokic' && st.stat==='Rebounds' && st.line==='11.5' && st.pick==='O' && st.book==='FanDuel' && st.odds==='-115' && st.stake==='10.00' && st.oddsUnclear && st.gameUnclear && st.n===n0 && /Check every box/.test(st.msg), st);
  await ev(S.p,()=>{ const h=document.getElementById('abHost'), sk=h.querySelector('.eb-stake'); sk.value='12.00'; sk.dispatchEvent(new Event('input',{bubbles:true})); const gf=document.getElementById('abGameFree'); gf.value='DEN @ LAL'; gf.dispatchEvent(new Event('input',{bubbles:true}));
    const d=document.getElementById('abDate'); d.value='2026-11-15'; d.dispatchEvent(new Event('input',{bubbles:true})); const r=document.getElementById('abResult'); r.value='win'; r.dispatchEvent(new Event('change',{bubbles:true})); });
  await S.p.waitForTimeout(400); await ev(S.p,()=>document.getElementById('abHost').querySelector('.eb-save').click()); await S.p.waitForTimeout(900);
  st=await ev(S.p,()=>({n:logged.length, L:logged[logged.length-1]&&{name:logged[logged.length-1].name, stake:logged[logged.length-1].stake, book:logged[logged.length-1].book, odds:logged[logged.length-1].odds}, slips:JSON.parse(localStorage.getItem('mbev.ai.slips')||'[]'), raw:localStorage.getItem('mbev.ai.slips')||''}));
  const sl=st.slips[0]||{};
  check('3. Save bet saves it ($12.00 at FanDuel, -115) and writes the data point {at, book, kind, fields read, corrections:{stake:[10,12]}} with no picture', st.n===n0+1 && st.L && st.L.stake===12 && st.L.book==='FanDuel' && st.slips.length===1 && sl.at && sl.book==='FanDuel' && sl.kind==='single' && sl.fields && sl.fields.player==='Nikola Jokic' && sl.fields.odds==='-115' && JSON.stringify(sl.corrections)==='{"stake":[10,12]}' && !/image|base64/.test(st.raw) && st.raw.length<2000, st);
  // parlay slip
  SLIPKIND='slipPar'; const n1=st.n;
  await dropPic(S.p,'aiSlipDrop'); await waitFor(S.p,()=>!!document.getElementById('aiSlipUse'));
  st=await ev(S.p,()=>({t:document.getElementById('aiSlipOut').innerText.replace(/\s+/g,' '), n:logged.length}));
  check('3. a pick’em slip: the proposal says "Parlay or pick’em, 3 picks", Entry flex, and Save parlay; nothing saved yet', /Parlay or pick’em, 3 picks/.test(st.t) && /Entry flex/.test(st.t) && /press Save parlay/.test(st.t) && st.n===n1, st);
  await ev(S.p,()=>document.getElementById('aiSlipUse').click()); await S.p.waitForTimeout(400);
  st=await ev(S.p,()=>{ const g=id=>document.getElementById(id); return {type:g('abType').value, book:g('abParBook').value, kind:g('abParKind').value, picks:g('abParPicks').value, stake:g('abParStake').value, all:g('abParAll').value, m1:g('abParM1').value, m2:g('abParM2').value, free:g('abParFree').checked, legs:g('abParLegs').value, parOn:g('addBetPanel').classList.contains('ab-par-on'), n:logged.length}; });
  check('3. Use fills Parlay / pick’em: PrizePicks, Flex, 3 picks, Entry $5.00, Pays if all hit $25.00 (5 × $5), if 1 misses $10.00, if 2 miss $2.00, the legs; nothing saved', st.type==='parlay' && st.parOn && st.book==='PrizePicks' && st.kind==='flex' && st.picks==='3' && st.stake==='5.00' && st.all==='25.00' && st.m1==='10.00' && st.m2==='2.00' && !st.free && /Nikola Jokic O 11\.5 Rebounds, Jamal Murray U 20\.5 Points/.test(st.legs) && st.n===n1, st);
  await ev(S.p,()=>document.getElementById('abParSave').click()); await S.p.waitForTimeout(500);
  st=await ev(S.p,()=>({n:logged.length, L:logged[logged.length-1], slips:JSON.parse(localStorage.getItem('mbev.ai.slips')||'[]')}));
  const sp=st.slips[1]||{};
  check('3. Save parlay saves the entry (PrizePicks, $5, pays $25) and a second data point, kind parlay, no corrections', st.n===n1+1 && st.L.kind==='parlay' && st.L.book==='PrizePicks' && st.L.stake===5 && st.L.parlay.pays.all===25 && sp.kind==='parlay' && sp.book==='PrizePicks' && JSON.stringify(sp.corrections)==='{}' && sp.fields.picks===3, {n:st.n, sp});
  await ev(S.p,()=>{ document.getElementById('abType').value='prop'; abFields(); });
  // Ignore leaves the form alone
  SLIPKIND='slip'; await dropPic(S.p,'aiSlipDrop'); await waitFor(S.p,()=>!!document.getElementById('aiSlipIgnore'));
  await ev(S.p,()=>document.getElementById('aiSlipIgnore').click());
  st=await ev(S.p,()=>({p:document.getElementById('abPlayer').value, out:document.getElementById('aiSlipOut').innerHTML, n:logged.length}));
  check('3. Ignore clears the proposal and fills nothing', st.out==='' && st.n===n1+1 && st.p==='', st);
  await S.ctx.close();

  // ===== 4. prices from a screenshot + 5. news =====
  S=await open(b,{log:LOG.filter(x=>x.id!=='b-novig')}); await tab(S.p,'v-board'); await ev(S.p,()=>{ const m=document.querySelector('#modeBar button[data-mode="volado"]'); if(m) m.click(); }); await S.p.waitForTimeout(500);   // the 58% chance is on the Volado tab
  // news
  const pre=await ev(S.p,()=>{ const card=[...document.querySelectorAll('#placeCards .pcard')].find(c=>{ const r=lastRows.find(x=>x.idx===+c.dataset.idx); return r && r.name==='Nikola Jokic'; }); const r=card?lastRows.find(x=>x.idx===+card.dataset.idx):null; return r?{stake:r.stake, act:r.actNet, pass:r.pass, idx:r.idx}:null; });
  const nb=await ev(S.p,idx=>{ const card=document.querySelector('.pcard[data-idx="'+idx+'"]'); if(!card) return 'no card'; const d=card.querySelector('details.sc-why'); if(d) d.open=true; const btn=card.querySelector('.ai-news-btn'); if(!btn) return 'no button'; btn.click(); return btn.textContent; }, pre&&pre.idx);
  await waitFor(S.p,()=>/Questionable/.test(document.body.innerText));
  c=lastAi('news');
  st=await ev(S.p,idx=>{ const card=document.querySelector('.pcard[data-idx="'+idx+'"]'); const r=lastRows.find(x=>x.idx===idx); return {card:card?card.innerText.replace(/\s+/g,' '):'', link:card?(card.querySelector('.ai-news a')||{}).href:'', news:JSON.parse(localStorage.getItem('mbev.ai.news')||'{}'), stake:r&&r.stake, act:r&&r.actNet, pass:r&&r.pass}; }, pre&&pre.idx);
  const nk=Object.keys(st.news)[0]||'';
  check('5. Why this play? › "📰 Check news" sends the player, game and sport only, and shows the status, summary and the source link', /Check news/.test(String(nb)) && c && c.input.player==='Nikola Jokic' && c.input.sport==='NBA' && /DEN @ LAL/.test(c.input.game) && !('stake' in c.input) && /Questionable/.test(st.card) && /Listed questionable with a sore ankle/.test(st.card) && st.link==='https://www.espn.com/nba/injuries', {nb, inp:c&&c.input, link:st.link});
  await S.p.waitForTimeout(300);
  st=await ev(S.p,idx=>{ const card=document.querySelector('.pcard[data-idx="'+idx+'"]'); const r=lastRows.find(x=>x.idx===idx); return {flag:!!(card && card.querySelector('.ai-newsflag')), ft:card&&card.querySelector('.ai-newsflag')?card.querySelector('.ai-newsflag').textContent:'', stake:r&&r.stake, act:r&&r.actNet, pass:r&&r.pass, news:JSON.parse(localStorage.getItem('mbev.ai.news')||'{}')}; }, pre&&pre.idx);
  const ne=st.news[nk]||{};
  check('5. the card gets "⚠ check news" for that day, a label only: stake, La Contadora’s EV and pass unchanged; cached in mbev.ai.news by sport|player|day', st.flag && st.ft==='⚠ check news' && pre && st.stake===pre.stake && st.act===pre.act && st.pass===pre.pass && nk==='NBA|nikola jokic|'+DAY && ne.status==='questionable' && ne.sources.length===1 && ne.checkedAt, {st, pre, nk});
  st=await ev(S.p,()=>({vis:!!document.getElementById('aiShotBtn').getClientRects().length, t:document.getElementById('aiShotBtn').textContent, rows:lastRows.length}));
  check('4. the Board has "📷 Add prices from a screenshot"', st.vis && /📷 Add prices from a screenshot/.test(st.t), st);
  await ev(S.p,()=>document.getElementById('aiShotBtn').click()); await dropPic(S.p,'aiShotDrop'); await waitFor(S.p,()=>!!document.getElementById('aiShotAdd'));
  c=lastAi('prices');
  st=await ev(S.p,()=>({t:document.getElementById('aiShotOut').innerText.replace(/\s+/g,' '), shot:lastRows.filter(r=>r.src==='ai-shot').length, book:(document.getElementById('aiShotBook')||{}).value, chk:[...document.querySelectorAll('.ai-shot-chk')].map(x=>({c:x.checked,d:x.disabled}))}));
  check('4. the rows are shown first: 2 read, 1 can be priced (Jokic Over 11.5 against the board’s fair price), the other "no fair price on the board … not added"; nothing on the board yet', !!c && c.input.mediaType==='image/jpeg' && /2 prices, 1 can be priced/.test(st.t) && /no fair price on the board for this one/.test(st.t) && st.shot===0 && st.book==='FanDuel' && (st.chk||[]).length===2 && st.chk[0].c && st.chk[1].d, st);
  const before=await ev(S.p,()=>lastRows.length);
  await ev(S.p,()=>document.getElementById('aiShotAdd').click()); await S.p.waitForTimeout(800);
  st=await ev(S.p,()=>{ const R=lastRows.filter(r=>r.src==='ai-shot'); const r=R[0]||{}; const card=r.idx!=null?document.querySelector('.pcard[data-idx="'+r.idx+'"]'):null; let saved=null; try{ saved=JSON.parse(localStorage.getItem('mbev.board')).rows.filter(x=>x.src==='ai-shot').length; }catch(e){}
    return {n:R.length, book:r.book, odds:r.offeredRaw, fair:r.fairProb, priceAt:r.priceAt, act:r.actNet!=null||r.net!=null, card:card?card.innerText.replace(/\s+/g,' ').slice(0,4000):'', saved, msg:document.getElementById('aiShotOut').innerText}; });
  check('4. Add puts 1 row on the board: FanDuel -105, src ai-shot, the board’s fair price, priced by La Contadora, the read time as its price time, saved with the board', st.n===1 && st.book==='FanDuel' && st.odds==='-105' && st.fair===0.58 && st.act && Math.abs(Date.parse(st.priceAt)-NOW)<60e3 && st.saved===1, st);
  check('4. its card says "📷 read from a screenshot"', /📷 read from a screenshot/.test(st.card), String(st.card||'').slice(0,300));
  // market names (7)
  await tab(S.p,'v-settings'); await ev(S.p,()=>{ const d=document.getElementById('aiPanel'); d.open=true; });
  const calls0=nAi();
  await ev(S.p,()=>document.getElementById('aiMkNow').click()); await waitFor(S.p,()=>!!document.querySelector('.ai-mk-use'));
  c=lastAi('market');
  st=await ev(S.p,()=>({box:document.getElementById('aiMkBox').innerText.replace(/\s+/g,' '), fam:statFam('Triples Made')}));
  check('7. unknown BettingPros market names (Triples Made, Double Double) go in one call with the known keys; the map waits in Settings › AI helper; nothing used before Use', !!c && JSON.stringify(c.input.names)==='["Triples Made","Double Double"]' && c.input.known.some(k=>k.key==='threes') && /Market names to confirm/.test(st.box) && /Triples Made = Three-pointers made/.test(st.box) && st.fam!=='threes', {names:c&&c.input.names, st});
  await ev(S.p,()=>document.getElementById('aiMkNow').click()); await S.p.waitForTimeout(300);
  st=await ev(S.p,()=>document.getElementById('aiMkMsg').textContent);
  check('7. at most once a day: a second press sends nothing ("already checked today")', /already checked today/.test(st) && nAi()===calls0+1, {st, calls:nAi()-calls0});
  await ev(S.p,()=>document.querySelector('.ai-mk-use').click()); await ev(S.p,()=>document.querySelector('.ai-mk-ign')&&document.querySelector('.ai-mk-ign').click());
  st=await ev(S.p,()=>({m:JSON.parse(localStorage.getItem('mbev.ai.markets')||'{}'), box:document.getElementById('aiMkBox').innerText}));
  check('7. Use / Ignore: mbev.ai.markets {"triples made":{key:"threes"}, "double double":{key:null}}', (st.m||{})['triples made'] && (st.m||{})['triples made'].key==='threes' && (st.m||{})['double double'] && (st.m||{})['double double'].key===null && !/Market names to confirm/.test(st.box), st.m);
  await ev(S.p,()=>{ localStorage.setItem('mbev.ai.on','0'); aiPaint(); window._aiMkC=null; });
  const c1=nAi(); st=await ev(S.p,()=>({fam:statFam('Triples Made'), match:betMatches({kind:'prop',player:'Jamal Murray',statText:'Threes',line:1.5,side:'O'},{kind:'prop',name:'Jamal Murray',market:'1.5 Triples Made',side:'O',sport:'NBA'}), on:document.documentElement.classList.contains('ai-on'), btns:document.querySelectorAll('.ai-news-btn').length}));
  check('7. with the AI off the confirmed name is used by the matcher (statFam = threes; a "Threes" fill matches a "Triples Made" bet) and no call is made', st.fam==='threes' && st.match===true && nAi()===c1 && st.on===false, st);
  await tab(S.p,'v-board'); await S.p.waitForTimeout(300);
  st=await ev(S.p,()=>({btns:[...document.querySelectorAll('.ai-news-btn')].filter(x=>x.getClientRects().length).length, shot:!!document.getElementById('aiShotBtn').getClientRects().length, flag:document.querySelectorAll('.ai-newsflag').length, shotTag:/read from a screenshot/.test(document.body.innerText)}));
  check('1. AI off: no AI buttons on the board (Check news, Add prices from a screenshot); the labels already earned stay', st.btns===0 && !st.shot && st.shotTag, st);
  await S.ctx.close();

  // ===== 6. match (fills) + grade + settle =====
  S=await open(b,{});
  await ev(S.p,()=>{ fillPending=[{book:'novig', id:'f1', action:'buy', price:0.52, cost:5.2, fee:0, qty:10, ts:Date.now()-2*3600e3, title:'Joker boards 11.5', bet:{kind:'prop', desc:'Joker boards', line:11.5, side:'O', start:new Date(Date.now()+3*3600e3).toISOString()}}]; saveFills(); renderFromBooks(); });
  await tab(S.p,'v-log'); await S.p.waitForTimeout(300);
  st=await ev(S.p,()=>({t:(document.getElementById('fromBooks')||{}).innerText||'', btn:!!document.querySelector('.ai-match'), bf:betForFill(fillPending[0])?'found':'none'}));
  check('6. a fill the app could not match (From your books) has "✨ Suggest the match"; the app’s own matcher finds nothing for it', st.btn && /Suggest the match/.test(st.t) && st.bf==='none', st);
  await ev(S.p,()=>document.querySelector('.ai-match').click()); await waitFor(S.p,()=>!!document.querySelector('.ai-match-use'));
  c=lastAi('match');
  st=await ev(S.p,()=>({t:document.getElementById('fromBooks').innerText.replace(/\s+/g,' '), fills:(logged.find(b=>b.id==='b-novig')||{}).fills||null, n:fillPending.length}));
  check('6. the fill and the candidates go (no ids); the proposal "Suggested match: Your logged bet: Nikola Jokic …" with why; nothing linked before Use', !!c && c.input.fill.book==='Novig' && Array.isArray(c.input.candidates) && c.input.candidates[0].i===1 && /Nikola Jokic/.test(c.input.candidates[0].label) && !/b-novig|f1/.test(JSON.stringify(c.input)) && /Suggested match: Your logged bet: Nikola Jokic/.test(st.t) && /Joker is Nikola Jokic/.test(st.t) && !st.fills && st.n===1, {cand:c&&c.input.candidates, st});
  await ev(S.p,()=>document.querySelector('.ai-match-use').click()); await S.p.waitForTimeout(400);
  st=await ev(S.p,()=>({fills:(logged.find(b=>b.id==='b-novig')||{}).fills||null, n:fillPending.length, seen:fillSeen['novig:f1'], names:JSON.parse(localStorage.getItem('mbev.ai.names')||'[]')}));
  const nm=st.names[0]||{};
  check('6. Use links the fill to the bet (fills [f1], gone from the list, seen linked) and keeps the pair in mbev.ai.names {kind fill, book, fill, to bet, card, at}', JSON.stringify(st.fills)==='["f1"]' && st.n===0 && st.seen && st.seen.s==='linked' && st.names.length===1 && nm.kind==='fill' && nm.book==='novig' && nm.to==='bet' && /joker boards/.test(nm.fill) && /nikola jokic/.test(nm.card) && nm.at, st);
  await ev(S.p,()=>{ localStorage.setItem('mbev.ai.on','0'); aiPaint(); logged.push(Object.assign({}, logged.find(b=>b.id==='b-novig'), {id:'b-novig2', key:'b-novig2', fills:undefined, fillRef:undefined, fillBook:undefined, fillQty:undefined, fillCost:undefined})); });
  const c2=nAi();
  st=await ev(S.p,()=>{ const f2={book:'novig', id:'f2', action:'buy', price:0.52, cost:5.2, fee:0, qty:10, ts:Date.now()-3600e3, title:'Joker boards 11.5', bet:{kind:'prop', desc:'Joker boards', line:11.5, side:'O', start:new Date(Date.now()+3*3600e3).toISOString()}}; const a=betForFill(f2); const keep=localStorage.getItem('mbev.ai.names'); localStorage.removeItem('mbev.ai.names'); const n=betForFill(f2); localStorage.setItem('mbev.ai.names',keep); return {withNames:a&&a.id, without:n?n.id:null}; });
  check('6. with the AI off, the next fill with the same name matches the bet from mbev.ai.names (b-novig2), and does not without the table; no call made', st.withNames==='b-novig2' && st.without===null && nAi()===c2, st);
  await ev(S.p,()=>{ localStorage.setItem('mbev.ai.on','1'); aiPaint(); logged=logged.filter(b=>b.id!=='b-novig2'); renderLog(); renderLookOut(); });
  // grade
  st=await ev(S.p,()=>({btns:document.querySelectorAll('#lookOut .ai-grade').length, t:(document.getElementById('lookOut')||{}).innerText||''}));
  check('6. Look out lists the bets not graded, each with "✨ Find the result"', st.btns>=2 && /Find the result/.test(st.t), st.btns);
  const gi=await ev(S.p,()=>logged.findIndex(b=>b.id==='b-ungraded'));
  await ev(S.p,i=>document.querySelector('#lookOut .ai-grade[data-i="'+i+'"]').click(), gi); await waitFor(S.p,()=>!!document.querySelector('.ai-grade-use'));
  c=lastAi('grade');
  st=await ev(S.p,()=>({t:document.getElementById('lookOut').innerText.replace(/\s+/g,' '), r:logged.find(b=>b.id==='b-ungraded').result, link:(document.querySelector('#lookOut .ai-src a')||{}).href}));
  check('6. the bet goes as player, market, line, side, game, sport, date (no stake, no notes, no id); the proposal shows "Result found: Won · stat 14", the source link and why; still not graded before Use', !!c && c.input.bet.player==='Nikola Jokic' && c.input.bet.market==='Rebounds' && c.input.bet.line===11.5 && c.input.bet.side==='Over' && c.input.bet.date===YDAY && !/stake|notes|secret|b-ungraded/.test(JSON.stringify(c.input)) && /Result found: Won · stat 14/.test(st.t) && /He had 14 rebounds/.test(st.t) && st.link==='https://www.espn.com/nba/boxscore/_/gameId/401' && st.r==='?', {inp:c&&c.input, st});
  await ev(S.p,()=>document.querySelector('.ai-grade-use').click()); await S.p.waitForTimeout(400);
  st=await ev(S.p,()=>{ const b=logged.find(b=>b.id==='b-ungraded'); return {r:b.result, by:b.gradedBy, src:b.resultSrc, grades:JSON.parse(localStorage.getItem('mbev.grades')||'{}'), sources:JSON.parse(localStorage.getItem('mbev.ai.sources')||'{}'), saved:(JSON.parse(localStorage.getItem('mbev.log')||'[]').find(x=>x.id==='b-ungraded')||{}).result}; });
  check('6. Use marks it WON through the Look out list’s own Won button (gradedBy manual, resultSrc you, remembered, saved) and keeps the domain per sport and market in mbev.ai.sources', st.r==='win' && st.by==='manual' && st.src==='you' && st.saved==='win' && st.grades.id && st.grades.id['b-ungraded'] && st.sources['NBA|reb'] && st.sources['NBA|reb'].last==='espn.com' && st.sources['NBA|reb'].domains['espn.com']===1, st);
  st=await ev(S.p,()=>{ const b=logged.find(b=>b.id==='b-ungraded'), sv=JSON.parse(localStorage.getItem('mbev.log')||'[]').find(x=>x.id==='b-ungraded')||{}; const d=document.createElement('div'); d.innerHTML=aiGradeNoteHtml(b);
    const m=syncMerge3(Object.assign({},b), Object.assign({},b,{stake:9}), Object.assign({},b), 1, 2);
    const n=aiLink({title:'Made up page', url:'https://fake.example.com/x', seen:false}), y=aiLink({title:'Real', url:'https://www.espn.com/x', seen:true});
    return {a:b.aiGrade, saved:sv.aiGrade, snapHas:!!(b.snap&&b.snap.aiGrade), note:d.innerText, merged:m.aiGrade, unseen:n, seenLink:y}; });
  check('6b. Use also stores aiGrade {domain, at, result} on the row (top level, not in snap), saved, kept by the sync merge; the Bet log note says "result found by the AI helper · espn.com"', st.a && st.a.domain==='espn.com' && st.a.result==='win' && /^20/.test(st.a.at) && st.saved && st.saved.domain==='espn.com' && !st.snapHas && st.merged && st.merged.domain==='espn.com' && /result found by the AI helper · espn\.com/.test(st.note), st);
  check('6b. a source with seen false is plain text with "(not from its search)", not a link; a seen one is a link', !/<a /.test(st.unseen) && /not from its search/.test(st.unseen) && /<a href="https:\/\/www\.espn\.com/.test(st.seenLink), st);
  const gi2=await ev(S.p,()=>logged.findIndex(b=>b.id==='b-ungraded2'));
  await ev(S.p,i=>document.querySelector('#lookOut .ai-grade[data-i="'+i+'"]').click(), gi2); await waitFor(S.p,()=>!!document.querySelector('.ai-grade-ign'));
  await ev(S.p,()=>document.querySelector('.ai-grade-ign').click()); await S.p.waitForTimeout(200);
  st=await ev(S.p,()=>({r:logged.find(b=>b.id==='b-ungraded2').result, prop:!!document.querySelector('.ai-grade-use')}));
  check('6. Ignore drops the proposal and leaves the bet not graded', st.r==='?' && !st.prop, st);
  // settle
  await ev(S.p,()=>{ window._fills=[{book:'kalshi', id:'k1', ref:'KX-1', side:'yes', action:'buy', price:0.5, cost:5, fee:0.1, qty:10, ts:Date.now()-30*3600e3, title:'Jokic 12+ rebounds', bet:{kind:'prop', player:'Nikola Jokic', statText:'Rebounds', line:11.5, side:'O', start:new Date(Date.now()-28*3600e3).toISOString(), sport:'NBA'}}];
    window._settlements=[{book:'kalshi', ref:'KX-1', outcome:'win', side:'yes'}]; const d=document.getElementById('myBooksBox'); if(d) d.open=true; renderMyBooks(); });
  const logBefore=await ev(S.p,()=>localStorage.getItem('mbev.log'));
  st=await ev(S.p,()=>({btn:!!document.querySelector('.ai-settle'), t:(document.getElementById('myBooksBody')||{}).innerText||''}));
  check('6. My books: a fill the book settled has "✨ Check the book’s grade"', st.btn && /Check the book’s grade/.test(st.t), st.btn);
  await ev(S.p,()=>document.querySelector('.ai-settle').click()); await waitFor(S.p,()=>/Does not agree/.test(document.getElementById('myBooksBody').innerText));
  c=lastAi('settle');
  st=await ev(S.p,()=>({t:document.getElementById('myBooksBody').innerText.replace(/\s+/g,' '), log:localStorage.getItem('mbev.log')}));
  check('6. settle shows "Does not agree with Kalshi (the book says win; the official result says Lost, stat 9)", the source and "A check only"; the log does not change', !!c && c.input.bookResult==='win' && c.input.bet.player==='Nikola Jokic' && /⚠ Does not agree with Kalshi \(the book says win; the official result says Lost, stat 9\)/.test(st.t) && /nba\.com/.test(st.t) && /A check only: nothing in your log changes/.test(st.t) && st.log===logBefore, {t:String(st.t||'').slice(0,400)});
  // ===== 8. ask + 9. weekly =====
  await tab(S.p,'v-reports'); await S.p.waitForTimeout(300);
  await ev(S.p,()=>{ const q=document.getElementById('aiAskQ'); q.value='How did my NBA bets do?'; document.getElementById('aiAskGo').click(); }); await waitFor(S.p,()=>/You won 1 of 2/.test(document.getElementById('aiAskOut').innerText));
  c=lastAi('ask');
  st=await ev(S.p,()=>({t:document.getElementById('aiAskOut').innerText.replace(/\s+/g,' '), send:document.getElementById('aiAskSend').textContent, n:logged.length}));
  const raw=c?JSON.stringify(c.input):'';
  check('8. Ask my log sends the question, the fields it needs (date, result, profit, stake, sport) and one compact row per bet, never notes, ids or keys', !!c && JSON.stringify(c.input.fields)==='["date","result","profit","stake","sport"]' && c.input.rows.length===st.n && c.input.rows.every(r=>r.length===5) && !/secret note|b-won|b-lost|pw-secret|snap/.test(raw) && /only: date, result, profit, stake, sport/.test(st.send), {fields:c&&c.input.fields, row0:c&&c.input.rows[0], send:st.send});
  check('8. the answer and its table show, with how many rows it used', /You won 1 of 2 settled NBA bets/.test(st.t) && /Sport Bets Profit/i.test(st.t) && /Based on 2 of the/.test(st.t), st.t);
  await ev(S.p,()=>document.getElementById('aiWeekGo').click()); await waitFor(S.p,()=>/Too few settled bets/.test(document.getElementById('aiWeekOut').innerText));
  c=lastAi('weekly');
  const wk=await ev(S.p,()=>{ const d=dayStats(), t=ctDay(Date.now()); let n=0; for(let i=0;i<7;i++){ const k=ctDay(Date.parse(t+'T12:00:00Z')-i*86400e3); if(d[k]) n+=d[k].bets; } return {n, out:document.getElementById('aiWeekOut').innerText}; });
  check('9. This week in plain words sends only the totals the app added up (the Bet log’s Last 7 days: bets, staked, won, lost, profit …) and shows the text', !!c && c.input.summary && c.input.summary.bets===wk.n && typeof c.input.summary.profit==='number' && c.input.summary.from && !c.input.rows && /Too few settled bets to tell skill from luck/.test(wk.out), {sum:c&&c.input.summary, wk});
  // ===== 10. bug note =====
  await ev(S.p,()=>{ document.querySelector('.tab[data-view="v-board"]').click(); const s=document.createElement('script'); s.textContent='throw new Error("boom for the bug note")'; document.head.appendChild(s); }); await S.p.waitForTimeout(400);
  st=await ev(S.p,()=>{ const el=document.getElementById('aiBugBar'); return el?{vis:!el.hidden, t:el.innerText}:null; });
  check('10. a caught page error shows "Something on this page went wrong" with "Send a bug note"', st && st.vis && /Something on this page went wrong: (Uncaught Error: )?boom for the bug note/.test(st.t) && /Send a bug note/.test(st.t), st);
  await ev(S.p,()=>{ const bt=document.createElement('button'); bt.id='tapSecret'; bt.type='button'; bt.setAttribute('data-who','Nikola Jokic'); bt.textContent='Nikola Jokic over 11.5 $12.34 a@b.com'; document.body.appendChild(bt); bt.click(); bt.remove();
    window._aiErr.msg='boom for the bug note, failed for $12.34 and me@x.com '+'x'.repeat(2000); window._aiErr.stack='s $5 '+'y'.repeat(3000); });
  await ev(S.p,()=>document.getElementById('aiBugSend').click()); await waitFor(S.p,()=>/Sent:/.test(document.getElementById('aiBugMsg').textContent));
  c=lastAi('bug');
  st=await ev(S.p,()=>document.getElementById('aiBugMsg').textContent);
  const braw=c?JSON.stringify(c.input):'';
  check('10. the note has the version, the error, the stack, where, and at most 20 recent taps; no bets, no keys, no passphrase', !!c && /^v5\./.test(c.input.version) && /boom for the bug note/.test(c.input.error) && typeof c.input.stack==='string' && c.input.where && Array.isArray(c.input.recent) && c.input.recent.length>=1 && c.input.recent.length<=20 && !/pw-secret|secret note|"stake"|b-won/.test(braw) && /Sent: Test error thrown on purpose/.test(st), {inp:c&&{v:c.input.version, e:c.input.error, w:c.input.where, recent:c.input.recent}, st});
  check('10b. the recent taps hold only an element id and data attribute names (no visible text, no data values); error and stack are cut to 1,000 characters with amounts and emails blanked', !!c && c.input.recent.some(x=>/button#tapSecret \[data-who\]/.test(x)) && !/Jokic|11\.5|12\.34|a@b\.com/.test(JSON.stringify(c.input.recent)) && c.input.error.length<=1000 && c.input.stack.length<=1000 && !/12\.34|me@x\.com|\$5/.test(braw), {recent:c&&c.input.recent.slice(-3), el:c&&c.input.error.length, sl:c&&c.input.stack.length});
  st=await ev(S.p,()=>aiScrub('paid $12.34 to me@x.com',1000)+'|'+(document.getElementById('aiBugBar').innerText||''));
  check('10b. the bug bar says exactly what is sent', /paid \$… to …\|/.test(st) && /It sends: the app version, this error and its stack \(each cut to 1,000 characters/.test(st) && /element ids and data names only/.test(st), st);
  check('0. POST /ai sends Content-Type application/json and the passphrase header', CALLS.filter(x=>x.path==='/ai').length>0 && CALLS.filter(x=>x.path==='/ai').every(x=>/^application\/json/.test(x.ct) && x.pass===PASSW), CALLS.filter(x=>x.path==='/ai').slice(0,2).map(x=>[x.ct,x.pass]));
  // ===== 11. data points, sync, clear =====
  st=await ev(S.p,()=>({sets:Object.values(SYNC_SETS).filter(k=>/^mbev\.ai\./.test(k)).sort(), keys:Object.keys(localStorage).filter(k=>/^mbev\.ai\./.test(k)).sort(), allPass:true}));
  check('11. the data points are in sync’s allow-list (SYNC_SETS): mbev.ai.slips, names, sources, markets, news, log', JSON.stringify(st.sets)==='["mbev.ai.log","mbev.ai.markets","mbev.ai.names","mbev.ai.news","mbev.ai.slips","mbev.ai.sources"]', st);
  const allPass=CALLS.filter(c=>c.path==='/ai').every(c=>c.pass===PASSW) && !CALLS.some(c=>c.raw && c.raw.indexOf(PASSW)>=0);
  check('11. every /ai call carries the passphrase as the header only, never in the body', allPass, CALLS.length);
  await tab(S.p,'v-settings'); await ev(S.p,()=>{ document.getElementById('aiPanel').open=true; aiPanelPaint(); });
  st=await ev(S.p,()=>document.getElementById('aiLogList').innerText.replace(/\s+/g,' '));
  check('1. Settings › AI helper lists recent jobs with their cost (Check the book’s grade $0.012 …)', /Check the book’s grade \$0\.012/.test(st) && /Find the result/.test(st) && /Suggest the match/.test(st), String(st||'').slice(0,300));
  await ev(S.p,()=>document.getElementById('aiClear').click()); let k1=await ev(S.p,()=>Object.keys(localStorage).filter(k=>/^mbev\.ai\.(slips|names|sources|markets|news|log)$/.test(k)).length);
  await ev(S.p,()=>document.getElementById('aiClear').click());
  st=await ev(S.p,()=>({k:Object.keys(localStorage).filter(k=>/^mbev\.ai\.(slips|names|sources|markets|news|log)$/.test(k)), on:localStorage.getItem('mbev.ai.on'), msg:document.getElementById('aiClearMsg').textContent}));
  check('11. Clear AI data asks for a second tap, then removes the data points (the switch stays)', k1>=3 && st.k.length===0 && st.on==='1' && /Cleared/.test(st.msg), {k1, st});
  await S.ctx.close();

  // ===== 12. layout: 390, 1000, 1280, 1960, light and dark =====
  const L=[];
  for(const w of [390,1000,1280,1960]) for(const dark of [false,true]){
    S=await open(b,{w, h:900, dark});
    await tab(S.p,'v-add'); await ev(S.p,()=>{ const P=document.getElementById('addBetPanel'); P.open=true; P.dispatchEvent(new Event('toggle')); }); await S.p.waitForTimeout(900);
    await ev(S.p,o=>{ document.getElementById('aiSlipOut').innerHTML=aiSlipPropHtml(o); }, OUT.slipPar);
    let m=await ev(S.p,()=>{ const de=document.documentElement, z=document.getElementById('aiSlipDrop').getBoundingClientRect(), u=document.getElementById('aiSlipUse').getBoundingClientRect(), col=getComputedStyle(document.querySelector('#aiSlipOut .ai-prop')).color, bg=getComputedStyle(document.querySelector('#aiSlipOut .ai-prop')).backgroundColor;
      return {sw:de.scrollWidth, cw:de.clientWidth, zr:Math.round(z.right), uh:Math.round(u.height), col, bg}; });
    const ok1=m.sw<=m.cw+1 && m.zr<=m.cw && m.uh>=44 && m.col!==m.bg;
    await tab(S.p,'v-settings'); await ev(S.p,()=>{ const d=document.getElementById('aiPanel'); d.open=true; aiPanelPaint(); d.scrollIntoView(); }); await S.p.waitForTimeout(200);
    const m2=await ev(S.p,()=>{ const de=document.documentElement, r=document.getElementById('aiPanel').getBoundingClientRect(); return {sw:de.scrollWidth, cw:de.clientWidth, right:Math.round(r.right)}; });
    await tab(S.p,'v-reports'); await S.p.waitForTimeout(200);
    const m3=await ev(S.p,()=>{ const de=document.documentElement, r=document.getElementById('aiRpPanel').getBoundingClientRect(), q=document.getElementById('aiAskQ').getBoundingClientRect(); return {sw:de.scrollWidth, cw:de.clientWidth, right:Math.round(r.right), qh:Math.round(q.height), fs:getComputedStyle(document.getElementById('aiAskQ')).fontSize}; });
    await tab(S.p,'v-board'); await S.p.waitForTimeout(200);
    const m4=await ev(S.p,()=>{ aiShotOpen(true); window._aiShot={at:new Date().toISOString(), book:'FanDuel', rows:[{x:{player:'Nikola Jokic',market:'Rebounds',line:11.5,side:'Over',odds:-105},base:lastRows[0]},{x:{player:'Somebody With A Long Name',game:'DEN @ LAL',market:'Points + Rebounds + Assists',line:40.5,side:'Under',odds:110},base:null}], unclear:['one cut-off row']};
      document.getElementById('aiShotOut').innerHTML=aiShotPropHtml(); const de=document.documentElement, r=document.getElementById('aiShotBox').getBoundingClientRect(), a=document.getElementById('aiShotAdd').getBoundingClientRect(); return {sw:de.scrollWidth, cw:de.clientWidth, right:Math.round(r.right), ah:Math.round(a.height)}; });
    L.push({w, dark, ok:ok1 && m2.sw<=m2.cw+1 && m2.right<=m2.cw && m3.sw<=m3.cw+1 && m3.right<=m3.cw && m3.fs==='16px' && m4.sw<=m4.cw+1 && m4.right<=m4.cw && m4.ah>=44, m, m2, m3, m4});
    await S.ctx.close(); }
  check('12. at 390, 1000, 1280 and 1960 px, light and dark: the slip box and its proposal, Settings › AI helper, Ask my log and the screenshot rows on the Board fit the screen; buttons 44 px; the question box 16 px (no phone zoom)', L.every(x=>x.ok), L.filter(x=>!x.ok).slice(0,3));

  check('no page errors (other than the one thrown on purpose for the bug note)', ALLERR.length===0, ALLERR.slice(0,5));
  await b.close();
  console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(fail?1:0);
})().catch(e=>{ console.log('FAIL crashed: '+(e&&e.stack||e)); process.exit(1); });
