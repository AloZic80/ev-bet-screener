// node tests/v577-novig-names-test.js — v5.77 (owner 2026-11-27: a Novig tennis bet "V. Lepchenko to win" was saved through From your books › Add as an NFL team and tied to it;
// "use the NOVIG API to come back and add the bets made today correctly"): a side the book names in words is logged by itself under those words, Novig's own result grades it,
// the Add form no longer picks a game or a team for you and will not tie a book bet to boxes that say something else, a bet already saved wrong is offered a fix, and a card's
// Save checks the log for the same bet.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+(ok?'':'  → '+JSON.stringify(got).slice(0,700))); };
const NOW=Date.now(), H=3600e3, iso=t=>new Date(t).toISOString(), CORS={'access-control-allow-origin':'*','access-control-allow-headers':'*'};
const dayCT=t=>new Date(t).toLocaleDateString('en-CA',{timeZone:'America/Chicago'});
const TEN_START=NOW-6*H, NFL_START=NOW-5*H;
// what Worker v3.92 sends (its own words): a tennis moneyline has no team code; it now carries the other side, the league, the sport and the event
const fill=(order, ref, oi, price, qty, cost, bet, ago)=>({book:'novig', id:'o:'+order, order, ids:['f-'+order], pieces:1, ref, outcome:ref+'-o'+oi, price, qty, cost, fee:0, ts:NOW-(ago||7*H), action:'buy', side:null, taker:true, title:bet?bet.desc:null, bet});
const TEN_NEW={sport:null, start:iso(TEN_START), title:'V. Lepchenko · V. Lepchenko', desc:'V. Lepchenko', eventId:'ev-ten', league:'WTA', sportName:'TENNIS', eventDesc:'L. Samson vs V. Lepchenko', opp:'L. Samson', kind:'moneyline', teamName:'V. Lepchenko', team:null};
const TEN_OLD={sport:null, start:iso(TEN_START), title:'V. Lepchenko · V. Lepchenko', desc:'V. Lepchenko', eventId:'ev-ten', kind:'moneyline', teamName:'V. Lepchenko', team:null};   // what Worker v3.91 sent
const NFL_CODE={sport:null, start:iso(NFL_START-60*60e3), title:'CHI @ PHI MONEYLINE · PHI', desc:'CHI @ PHI MONEYLINE', eventId:'ev-nfl', away:'CHI', home:'PHI', league:'NFL', sportName:'FOOTBALL', opp:'CHI', kind:'moneyline', teamName:'PHI', team:'PHI'};
const NFL_NAME={sport:null, start:iso(NOW+30*H), title:'Raiders @ Chiefs · Chiefs', desc:'Raiders @ Chiefs', eventId:'ev-kc', league:'NFL', sportName:'FOOTBALL', eventDesc:'Las Vegas Raiders at Kansas City Chiefs', opp:'Raiders', kind:'moneyline', teamName:'Chiefs', team:null};
const F_TEN=fill('ord-lep','mkt-ten',0,0.22,4.44,0.9768,TEN_NEW), F_NFL=fill('ord-phi','mkt-nfl',1,0.4505,2.22,1,NFL_CODE,6*H), F_KC=fill('ord-kc','mkt-kc',0,0.6667,1.5,1,NFL_NAME,5*H);
const nfl=(id, t, away, home, as, hs)=>{ const post=NOW>t+3.5*H; return {id, date:iso(t), name:away+' at '+home, shortName:away+' @ '+home, status:{type:{state:post?'post':'pre', completed:post, shortDetail:post?'Final':'Scheduled', name:post?'STATUS_FINAL':'STATUS_SCHEDULED'}},
  competitions:[{competitors:[{homeAway:'away', score:String(as), winner:post?as>hs:undefined, team:{abbreviation:away, displayName:away+' Team', shortDisplayName:away}},{homeAway:'home', score:String(hs), winner:post?hs>as:undefined, team:{abbreviation:home, displayName:home+' Team', shortDisplayName:home}}]}]}; };
const NFL=[nfl('e1', NFL_START, 'PIT', 'DEN', 17, 24), nfl('e2', NFL_START-60*60e3, 'CHI', 'PHI', 10, 23)];
async function boot(seed){ const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago', viewport:{width:1400,height:1000}});
  await ctx.addInitScript(S=>{ try{ if(sessionStorage.getItem('seeded')) return; sessionStorage.setItem('seeded','1'); localStorage.clear(); localStorage.setItem('mbev.pass','x'); localStorage.setItem('mbev.fillV','95'); Object.entries(S||{}).forEach(([k,v])=>localStorage.setItem(k, typeof v==='string'?v:JSON.stringify(v))); }catch(e){} }, seed||{});
  const p=await ctx.newPage(); const W={fills:[], settlements:[], errs:[], urls:[]}; p.on('pageerror',e=>W.errs.push(e.message)); p.on('dialog',d=>d.accept());
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/espn\.com/.test(u)) return r.fulfill({contentType:'application/json',headers:CORS,body:JSON.stringify(/football\/nfl\/scoreboard/.test(u)?{week:{number:12},events:NFL}:{events:[]})});
    if(/\/mine\//.test(u)) W.urls.push(u);
    if(/\/mine\/receipts/.test(u)) return r.fulfill({contentType:'application/json',headers:CORS,body:'{"fills":[],"settlements":[]}'});
    if(/\/mine\/fills/.test(u)) return r.fulfill({contentType:'application/json',headers:CORS,body:JSON.stringify({fills:W.fills, settlements:W.settlements, errors:{}, notes:{}})});
    if(/\/mine\/orders/.test(u)) return r.fulfill({contentType:'application/json',headers:CORS,body:'{"orders":[],"errors":{}}'});
    if(r.request().method()==='OPTIONS') return r.fulfill({status:204,headers:CORS}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1500);
  const read=async()=>{ await p.evaluate(()=>syncFills(true)); await p.waitForTimeout(700); };
  const bets=()=>p.evaluate(()=>logged.map(L=>({id:L.id, name:L.name, market:L.market, kind:L.kind, sport:L.sport, game:L.game, team:L.team, date:(typeof gameDayOf==='function'?gameDayOf(L):L.date), start:L.start, stake:L.stake, odds:L.odds, book:L.book, autoFrom:L.autoFrom, fills:L.fills, result:L.result, resultSrc:L.resultSrc, gradedBy:L.gradedBy, bookPaid:L.bookPaid, manual:L.manual, fixedFrom:L.fixedFrom, fitOk:L.fitOk, edits:L.edits, snap:L.snap, win:(typeof betProfit==='function'?betProfit(Object.assign({},L,{result:'win'})):null)})));
  return {b, p, W, read, bets}; }
(async()=>{
  // ---- 1. bets the book names in words log by themselves, correctly ----
  { const S=await boot(); S.W.fills=[F_TEN, F_NFL, F_KC]; await S.read(); let B=await S.bets();
    const T=B.find(x=>(x.fills||[]).includes('o:ord-lep')), P=B.find(x=>(x.fills||[]).includes('o:ord-phi')), K=B.find(x=>(x.fills||[]).includes('o:ord-kc'));
    check('the tennis bet is logged by itself under Novig’s own words: V. Lepchenko, Moneyline, $0.98 at +355, from Novig', T && T.name==='V. Lepchenko' && T.market==='Moneyline' && T.kind==='moneyline' && T.team==null && T.stake===0.98 && T.odds==='+355' && T.book==='Novig' && T.autoFrom==='novig', T);
    check('with its league, its match and its day from Novig (WTA · L. Samson vs V. Lepchenko)', T && T.sport==='WTA' && T.game==='L. Samson vs V. Lepchenko' && T.date===dayCT(TEN_START) && T.start===iso(TEN_START), T);
    check('a bet with team codes is logged exactly as before (PHI, CHI @ PHI)', P && P.name==='PHI' && P.team==='PHI' && P.game==='CHI @ PHI' && P.autoFrom==='novig', P);
    check('a side named in full words is logged under those words, never as the other team (Chiefs)', K && K.name==='Chiefs' && K.team==null && K.sport==='NFL' && /Chiefs/.test(K.game||''), K);
    check('nothing is left waiting in From your books, and three bets are in the log', B.length===3 && await S.p.evaluate(()=>fillPending.length)===0, [B.length, await S.p.evaluate(()=>fillPending.length)]);
    await S.p.evaluate(async()=>{ try{ await checkResultsRun(); }catch(e){} }); await S.p.waitForTimeout(1200); B=await S.bets();
    check('ESPN grading leaves the two named bets alone and still grades the team bet', !B.find(x=>x.name==='V. Lepchenko').result && !B.find(x=>x.name==='Chiefs').result && B.find(x=>x.name==='PHI').result==='win', B.map(x=>[x.name,x.result]));
    S.W.settlements=[{book:'novig', ref:'mkt-ten', oid:'mkt-ten-o0', side:null, outcome:'win', grade:'WIN', qty:4.44, cost:0.9768, payout:4.44, pnl:3.4632, ts:NOW-4*H}, {book:'novig', ref:'mkt-kc', oid:'mkt-kc-o1', side:null, outcome:'win', grade:'WIN', qty:1.5, cost:0.5, payout:1.5, pnl:1, ts:NOW-1*H}];
    await S.read(); B=await S.bets(); const T2=B.find(x=>x.name==='V. Lepchenko');
    check('Novig’s own result grades the tennis bet: WIN, from Novig, paid $4.44', T2.result==='win' && T2.resultSrc==='Novig' && T2.bookPaid===4.44, T2);
    check('its profit as a win is what Novig paid less what it cost: $3.46', Math.abs(T2.win-3.46)<0.006, T2.win);
    check('a result for the OTHER side of a market never grades your side (Chiefs still open)', !B.find(x=>x.name==='Chiefs').result, B.find(x=>x.name==='Chiefs'));
    await S.p.evaluate(()=>{ const L=logged.find(x=>x.name==='Chiefs'); L.result='loss'; L.gradedBy='manual'; L.resultSrc='you'; saveLog(); });
    S.W.settlements.push({book:'novig', ref:'mkt-kc', oid:'mkt-kc-o0', side:null, outcome:'win', grade:'WIN', qty:1.5, cost:1, payout:1.5, pnl:0.5, ts:NOW}); await S.read(); B=await S.bets();
    check('a result you set yourself is never replaced by the book’s', B.find(x=>x.name==='Chiefs').result==='loss' && B.find(x=>x.name==='Chiefs').gradedBy==='manual', B.find(x=>x.name==='Chiefs'));
    await S.read(); await S.read(); check('more reads add nothing and list nothing', (await S.bets()).length===3 && await S.p.evaluate(()=>fillPending.length)===0, 0);
    check('no page errors (1)', !S.W.errs.length, S.W.errs); await S.b.close(); }
  // ---- 2. the row that was already waiting on his screen (read by v5.76 from Worker v3.91) ----
  { const old=fill('ord-lep','mkt-ten',0,0.22,4.44,0.9768,TEN_OLD);
    const S=await boot({'mbev.fillPending':[old], 'mbev.fillSeen':{'novig:o:ord-lep':{s:'pending',q:4.44}}}); S.W.fills=[F_TEN]; await S.read(); const B=await S.bets();
    check('a tennis row already waiting in From your books is logged by itself, once', B.length===1 && B[0].name==='V. Lepchenko' && (B[0].fills||[]).includes('o:ord-lep') && await S.p.evaluate(()=>fillPending.length)===0, B);
    check('and gets its match, league and day from the fresh read, without its name changing', B[0].game==='L. Samson vs V. Lepchenko' && B[0].sport==='WTA' && B[0].start===iso(TEN_START), B[0]);
    check('no page errors (2)', !S.W.errs.length, S.W.errs); await S.b.close(); }
  // ---- 3. a bet already saved wrong: the tennis bet saved as PIT, and a bet saved as the other team ----
  { const snap={at:iso(NOW-6*H), screener:'v5.76', price:'+355', book:'Novig'};
    const phantom={id:'ph-1', key:'k1', name:'PIT', market:'Moneyline', kind:'moneyline', sport:'NFL', team:'PIT', game:'PIT @ DEN', date:dayCT(NFL_START), dateSet:true, start:iso(NFL_START), stake:0.98, odds:'+355', book:'Novig', betnow:'PIT ML', fills:['o:ord-lep'], fillBook:'novig', fillRef:'mkt-ten', fillOutcome:'mkt-ten-o0', fillQty:4.44, fillCost:0.98, fillFee:0, manual:true, srcType:'manual', result:'loss', snap};
    const wrongSide={id:'ph-2', key:'k2', name:'CHI', market:'Moneyline', kind:'moneyline', sport:'NFL', team:'CHI', game:'CHI @ PHI', date:dayCT(NFL_START), dateSet:true, start:iso(NFL_START-60*60e3), stake:1, odds:'+122', book:'Novig', fills:['o:ord-phi'], fillBook:'novig', fillRef:'mkt-nfl', fillOutcome:'mkt-nfl-o1', fillQty:2.22, fillCost:1, fillFee:0, manual:true, srcType:'manual', result:'loss'};
    const rightHand={id:'ok-1', key:'k3', name:'PHI', market:'Moneyline', kind:'moneyline', sport:'NFL', team:'PHI', game:'CHI @ PHI', date:dayCT(NFL_START), dateSet:true, start:iso(NFL_START-60*60e3), stake:2, odds:'+120', book:'Novig', fills:['o:ord-phi2'], fillBook:'novig', fillRef:'mkt-nfl', fillOutcome:'mkt-nfl-o1', fillQty:4.4, fillCost:2, manual:true, srcType:'manual'};
    const seen={'novig:o:ord-lep':{s:'added',q:4.44}, 'novig:o:ord-phi':{s:'added',q:2.22}, 'novig:o:ord-phi2':{s:'added',q:4.4}};
    const S=await boot({'mbev.log':[phantom, wrongSide, rightHand], 'mbev.fillSeen':seen}); S.W.fills=[F_TEN, F_NFL, fill('ord-phi2','mkt-nfl',1,0.4545,4.4,2,NFL_CODE,6*H)];
    S.W.settlements=[{book:'novig', ref:'mkt-ten', oid:'mkt-ten-o0', side:null, outcome:'win', grade:'WIN', qty:4.44, cost:0.9768, payout:4.44, pnl:3.4632, ts:NOW-4*H}];
    await S.read(); await S.p.evaluate(()=>document.querySelector('.tab[data-view="v-log"]').click()); await S.p.waitForTimeout(400);
    let N=await S.p.evaluate(()=>({hidden:document.getElementById('logFix').hidden, text:document.getElementById('logFix').textContent, rows:document.querySelectorAll('#logFix .fx-row').length}));
    check('the Bet log lists the two bets that do not match their Novig bet, and not the one that does', !N.hidden && N.rows===2 && /2 bets in your log do not match/.test(N.text), N);
    check('it says what your log has and what Novig says (PIT Moneyline ← V. Lepchenko to win, L. Samson vs V. Lepchenko)', /PIT Moneyline/.test(N.text) && /Novig says: V\. Lepchenko to win \(L\. Samson vs V\. Lepchenko\)/.test(N.text) && /CHI Moneyline/.test(N.text) && /Novig says: PHI to win/.test(N.text), N.text);
    await S.p.evaluate(()=>{ [...document.querySelectorAll('#logFix .fx-row')].find(r=>/PIT Moneyline/.test(r.textContent)).querySelector('.fx-fix').click(); }); await S.p.waitForTimeout(1200);
    let B=await S.bets(), T=B.find(x=>x.id==='ph-1');
    check('Fix it rewrites that bet from Novig’s words: V. Lepchenko, Moneyline, WTA, its match and its day', T && T.name==='V. Lepchenko' && T.market==='Moneyline' && T.sport==='WTA' && T.team==null && T.game==='L. Samson vs V. Lepchenko' && T.start===iso(TEN_START) && T.fixedFrom==='novig', T);
    check('the stake, the price, the fill and the snapshot are untouched; the old values are kept in its edits', T.stake===0.98 && T.odds==='+355' && (T.fills||[]).includes('o:ord-lep') && JSON.stringify(T.snap)===JSON.stringify(snap) && T.edits && T.edits[0].before.name==='PIT' && T.edits[0].before.game==='PIT @ DEN' && T.edits[0].before.sport==='NFL', T);
    check('its result is Novig’s own (WIN), not the football game’s (the seed said LOSS)', T.result==='win' && T.resultSrc==='Novig' && T.bookPaid===4.44, [T.result, T.resultSrc, T.bookPaid]);
    await S.p.evaluate(()=>{ [...document.querySelectorAll('#logFix .fx-row')].find(r=>/CHI Moneyline/.test(r.textContent)).querySelector('.fx-fix').click(); }); await S.p.waitForTimeout(1200); B=await S.bets(); const C=B.find(x=>x.id==='ph-2');
    check('a bet saved as the other team is put on its real team (CHI → PHI, same game)', C && C.name==='PHI' && C.team==='PHI' && C.game==='CHI @ PHI' && C.edits[0].before.team==='CHI', C);
    N=await S.p.evaluate(()=>({hidden:document.getElementById('logFix').hidden})); check('with both fixed the notice is gone, and the log still has three bets', N.hidden && B.length===3, [N, B.length]);
    check('no page errors (3)', !S.W.errs.length, S.W.errs); await S.b.close(); }
  // ---- 3b. the real bet was typed by hand afterwards: Fix ties Novig's bet to that row and removes the wrong one ----
  { const phantom={id:'ph-1', name:'PIT', market:'Moneyline', kind:'moneyline', sport:'NFL', team:'PIT', game:'PIT @ DEN', date:dayCT(NFL_START), dateSet:true, start:iso(NFL_START), stake:0.98, odds:'+355', book:'Novig', fills:['o:ord-lep'], fillBook:'novig', fillRef:'mkt-ten', fillOutcome:'mkt-ten-o0', fillQty:4.44, fillCost:0.98, manual:true, srcType:'manual', result:'loss'};
    const hand={id:'hand-1', name:'V. LEPCHENKO', market:'Moneyline', kind:'moneyline', sport:'NFL', team:'V. LEPCHENKO', game:'Samson vs Lepchenko', date:dayCT(TEN_START), dateSet:true, stake:0.98, odds:'+355', book:'Novig', manual:true, srcType:'manual', result:'win', gradedBy:'manual', resultSrc:'you'};
    const keep={id:'ph-9', name:'PIT', market:'Moneyline', kind:'moneyline', sport:'NFL', team:'PIT', game:'PIT @ DEN', date:dayCT(NFL_START), dateSet:true, start:iso(NFL_START), stake:1, odds:'+138', book:'Novig', fills:['o:ord-hon'], fillBook:'novig', fillRef:'mkt-hon', fillOutcome:'mkt-hon-o0', fillQty:2.38, fillCost:1, manual:true, srcType:'manual'};
    const HON=Object.assign({}, TEN_NEW, {title:'N. Honda · N. Honda', desc:'N. Honda', teamName:'N. Honda', opp:'H. Matsuoka', eventDesc:'N. Honda vs H. Matsuoka', league:'ITF'});
    const S=await boot({'mbev.log':[phantom, hand, keep], 'mbev.fillSeen':{'novig:o:ord-lep':{s:'added',q:4.44}, 'novig:o:ord-hon':{s:'added',q:2.38}}}); S.W.fills=[F_TEN, fill('ord-hon','mkt-hon',0,0.42,2.38,1,HON)];
    await S.read(); await S.p.evaluate(()=>document.querySelector('.tab[data-view="v-log"]').click()); await S.p.waitForTimeout(300);
    await S.p.evaluate(()=>{ [...document.querySelectorAll('#logFix .fx-row')].find(r=>/V\. Lepchenko/.test(r.textContent)).querySelector('.fx-fix').click(); }); await S.p.waitForTimeout(1200);
    let B=await S.bets(); const st=await S.p.evaluate(()=>({removed:removedBets.map(x=>x.id), lost:(typeof jrMissing==='function'?jrMissing().length:-1)}));
    check('when you had already typed the real bet, Fix ties Novig’s bet to your row and removes the wrong row (kept in Removed), with no “gone” alarm', !B.find(x=>x.id==='ph-1') && (B.find(x=>x.id==='hand-1').fills||[]).includes('o:ord-lep') && st.removed.includes('ph-1') && st.lost===0, [B.map(x=>[x.id,x.name,x.fills]), st]);
    check('your own result on that row stays', B.find(x=>x.id==='hand-1').result==='win' && B.find(x=>x.id==='hand-1').gradedBy==='manual', B.find(x=>x.id==='hand-1'));
    await S.p.evaluate(()=>{ document.querySelector('#logFix .fx-keep').click(); }); await S.p.waitForTimeout(300); B=await S.bets();
    check('Leave it keeps a row exactly as it is and stops asking', B.find(x=>x.id==='ph-9').name==='PIT' && B.find(x=>x.id==='ph-9').fitOk===true && await S.p.evaluate(()=>document.getElementById('logFix').hidden), B.find(x=>x.id==='ph-9'));
    check('no page errors (3b)', !S.W.errs.length, S.W.errs); await S.b.close(); }
  // ---- 4. the Add form no longer picks a game or a team for you, and will not tie a book bet to boxes that say something else ----
  { const half=fill('ord-half','mkt-half',0,0.5,2,1,{sport:null, start:iso(NOW+2*H), title:'x', desc:'DEN @ PIT 1H MONEYLINE', kind:'other', part:true, teamName:'DEN'});
    const nameless=Object.assign(fill('ord-gone','mkt-gone',0,0.4,3,1.2,null), {title:null});
    const ten0=Object.assign({}, F_TEN, {id:'o:ord-ten0', order:'ord-ten0', price:0});   // a tennis bet the app cannot log by itself (no price read): it still must not become an NFL team
    const S=await boot(); S.W.fills=[nameless, ten0]; await S.read(); await S.p.evaluate(()=>{ renderFromBooks(); document.querySelector('.tab[data-view="v-log"]').click(); }); await S.p.waitForTimeout(300);
    check('a bet the book could not describe waits in From your books', await S.p.evaluate(()=>fillPending.length)===2 && (await S.bets()).length===0, await S.p.evaluate(()=>fillPending.map(f=>f.id)));
    await S.p.evaluate(()=>{ const i=fillPending.findIndex(f=>f.id==='o:ord-gone'); document.querySelectorAll('#fromBooks .fb-add')[i].click(); }); await S.p.waitForTimeout(2600);
    let F=await S.p.evaluate(()=>{ const g=document.getElementById('abGame'); return {tab:document.getElementById('v-add').classList.contains('on'), game:g.value, gameText:g.options[g.selectedIndex].text, n:g.options.length}; });
    check('Add opens the form with NO game chosen (it took the first game in the list)', F.tab && F.game==='' && /pick the game/.test(F.gameText) && F.n===3, F);
    await S.p.fill('#abPlayer','Someone'); await S.p.fill('#abStat','Points'); await S.p.fill('#abLine','10.5'); await S.p.click('#abHost .eb-save'); await S.p.waitForTimeout(500);
    check('Save bet then refuses until a game is picked, and logs nothing', (await S.bets()).length===0 && /add the game first/.test(await S.p.evaluate(()=>document.querySelector('#abHost .eb-msg').textContent)), await S.p.evaluate(()=>document.querySelector('#abHost .eb-msg').textContent));
    // the tennis bet through the form: pick the NFL game by hand; no team is chosen; choosing PIT is refused once, and saving anyway does not tie the Novig bet to it
    await S.p.evaluate(()=>{ document.querySelector('.tab[data-view="v-log"]').click(); renderFromBooks(); }); await S.p.waitForTimeout(200);
    await S.p.evaluate(()=>{ const i=fillPending.findIndex(f=>f.id==='o:ord-ten0'); document.querySelectorAll('#fromBooks .fb-add')[i].click(); }); await S.p.waitForTimeout(2600);
    await S.p.selectOption('#abGame','e1'); await S.p.waitForTimeout(300);
    F=await S.p.evaluate(()=>{ const t=document.getElementById('abTeam'); return {type:document.getElementById('abType').value, team:t.value, teamText:t.options[t.selectedIndex]?t.options[t.selectedIndex].text:null, opts:[...t.options].map(o=>o.value)}; });
    check('with a game picked by hand, NO team is chosen for a side that is not one of its two teams (it took the away team)', F.type==='moneyline' && F.team==='' && /pick the team/.test(F.teamText) && F.opts.includes('PIT') && F.opts.includes('DEN'), F);
    await S.p.fill('#abHost .eb-pct','22'); await S.p.dispatchEvent('#abHost .eb-pct','input'); await S.p.click('#abHost .eb-save'); await S.p.waitForTimeout(500);
    check('Save bet refuses with no team', (await S.bets()).length===0 && /add the team first/.test(await S.p.evaluate(()=>document.querySelector('#abHost .eb-msg').textContent)), await S.p.evaluate(()=>document.querySelector('#abHost .eb-msg').textContent));
    await S.p.selectOption('#abTeam','PIT'); await S.p.waitForTimeout(200); await S.p.click('#abHost .eb-save'); await S.p.waitForTimeout(500);
    const m1=await S.p.evaluate(()=>({msg:document.querySelector('#abHost .eb-msg').textContent, btn:document.querySelector('#abHost .eb-save').textContent, n:logged.length}));
    check('choosing PIT for it is refused once, in words: the Novig bet is “V. Lepchenko to win”, the boxes say “PIT”', m1.n===0 && /the Novig bet is "V\. Lepchenko to win", and the boxes say "PIT"/.test(m1.msg) && /Save bet anyway/.test(m1.btn), m1);
    for(let i=0;i<3 && (await S.bets()).length===0;i++){ await S.p.click('#abHost .eb-save'); await S.p.waitForTimeout(600); }
    const B=await S.bets(), st=await S.p.evaluate(()=>({pending:fillPending.map(f=>f.id), seen:(fillSeen['novig:o:ord-ten0']||{}).s}));
    check('Save bet anyway saves PIT as a bet of its own, NOT tied to the tennis bet, which stays in From your books', B.length===1 && B[0].name==='PIT' && !(B[0].fills||[]).length && st.pending.includes('o:ord-ten0') && st.seen!=='added', [B, st]);
    check('no page errors (4)', !S.W.errs.length, S.W.errs); await S.b.close(); }
  // ---- 5. a card's Save checks the log for the same bet (Isaiah Joe was logged from the fill, then again from the card) ----
  { const day=dayCT(NOW), auto={id:'ij-1', name:'Isaiah Joe', market:'3.5 Threes', side:'U', kind:'prop', sport:'NBA', game:'MIL @ DET', date:day, dateSet:true, start:iso(NOW+2*H), stake:2.35, odds:'-142', book:'Polymarket US', autoFrom:'poly', fills:['pm-1'], fillBook:'poly', fillRef:'slug-1', fillQty:4, fillCost:2.35, placedAt:iso(NOW-10*60e3), placedAtSource:'book_fill'};
    const S=await boot({'mbev.log':[auto]});
    const press=async(stake)=>S.p.evaluate(async(stake)=>{ const L=logged[0], r=Object.assign(rowFromBet(L), {src:'api:bp', idx:-1}), h=document.createElement('div'); h.className='pcard'; h.id='cardHost'; document.body.appendChild(h); openBetEditor(h, r); await new Promise(z=>setTimeout(z,200));
      const ed=h.querySelector('.editor'), sb=ed.querySelector('.eb-save'), st=ed.querySelector('.eb-stake'), c=ed.querySelector('.eb-cost'); if(st){ st.value=String(stake); st.dispatchEvent(new Event('input',{bubbles:true})); } if(c){ c.value=String(stake); c.dispatchEvent(new Event('input',{bubbles:true})); }
      sb.dataset.ok='1'; sb.dataset.hs='1'; sb.dataset.lc='1'; const n0=logged.length; sb.click(); await new Promise(z=>setTimeout(z,200)); const out={n0, n1:logged.length, msg:(ed.querySelector('.eb-msg')||{}).textContent||'', btn:sb.textContent, connected:ed.isConnected};
      if(logged.length===n0){ sb.click(); await new Promise(z=>setTimeout(z,200)); out.n2=logged.length; } h.remove(); return out; }, stake);
    const a=await press(2.35);
    check('saving the same bet again from its card is refused once and says where it already is', a.n1===a.n0 && /already in your Bet log/.test(a.msg) && /from your book/.test(a.msg) && /Polymarket US/.test(a.msg) && /Save bet anyway/.test(a.btn), a);
    check('a second press saves it (a real second bet stays possible)', a.n2===a.n0+1, a);
    await S.p.evaluate(()=>{ logged.pop(); saveLog(); }); const c=await press(7);
    check('a bet of another size on the same prop is not called the same bet', c.n1===c.n0+1 && !/already in your Bet log/.test(c.msg), c);
    check('no page errors (5)', !S.W.errs.length, S.W.errs); await S.b.close(); }
  // ---- 6. a named side is matched to a logged bet by whole words only ----
  { const S=await boot(); const r=await S.p.evaluate(()=>{ const fb=(n)=>({kind:'moneyline', teamName:n, team:null}), x=(name,team)=>({kind:'moneyline', name, team, book:'Novig'});
      return {sinnerNE:betMatches(fb('J. Sinner'), x('NE','NE')), sakkariARI:betMatches(fb('M. Sakkari'), x('ARI','ARI')), samsonSA:betMatches(fb('L. Samson'), x('SA','SA')), same:betMatches(fb('V. Lepchenko'), x('V. LEPCHENKO','V. LEPCHENKO')), inside:betMatches(fb('Chiefs'), x('Kansas City Chiefs',null)), code:betMatches({kind:'moneyline', team:'PHI', teamName:'PHI'}, x('PHI','PHI'))}; });
    check('a team code inside a player’s name is not a match (NE in Sinner, ARI in Sakkari, SA in Samson)', r.sinnerNE===false && r.sakkariARI===false && r.samsonSA===false, r);
    check('the same words, a name inside a longer name, and team codes still match', r.same===true && r.inside===true && r.code===true, r);
    check('no page errors (6)', !S.W.errs.length, S.W.errs); await S.b.close(); }
  // ---- 7. the backup journal (v5.76) checked again: no false alarm for a bet taken out on purpose, and the log's own room comes first ----
  { const mk=(id,name,extra)=>Object.assign({id, name, market:'Moneyline', kind:'moneyline', sport:'NFL', team:name, game:'PIT @ DEN', date:dayCT(NOW), dateSet:true, stake:1, odds:'+100', book:'Novig', snap:{at:iso(NOW), note:'x'.repeat(200)}}, extra||{});
    const S=await boot({'mbev.log':[mk('j-1','PIT'), mk('j-2','DEN'), mk('j-3','CHI'), mk('j-4','PHI')]});
    await S.p.evaluate(()=>{ saveLog(); jrWrite(); });
    await S.p.evaluate(()=>{ easyUnsave(logged.find(b=>b.id==='j-1')); }); await S.p.waitForTimeout(300);
    check('Easy’s Undo takes a bet out on purpose: the journal does not call it gone', await S.p.evaluate(()=>!logged.some(b=>b.id==='j-1') && jrMissing().length===0 && document.getElementById('logLost').hidden), await S.p.evaluate(()=>jrMissing().map(e=>e.b.id)));
    await S.p.evaluate(()=>{ const i=logged.findIndex(b=>b.id==='j-2'); logged.splice(i,1); saveLog(); renderLog(); }); await S.p.waitForTimeout(400);
    check('a bet that simply disappears is still shown (the alarm itself still works)', await S.p.evaluate(()=>jrMissing().length===1 && jrMissing()[0].b.id==='j-2' && !document.getElementById('logLost').hidden), await S.p.evaluate(()=>jrMissing().map(e=>e.b.id)));
    await S.p.evaluate(()=>{ [...document.querySelectorAll('#logLost button')].find(x=>/Restore/.test(x.textContent)).click(); }); await S.p.waitForTimeout(300);
    await S.p.evaluate(()=>{ const L=logged.find(b=>b.id==='j-3'); L.odds='+200'; saveLog(); jrWrite(); });   // the same length as '+100'
    check('an edit that keeps the bet’s length is copied to the journal too', await S.p.evaluate(()=>JSON.parse(lsPlain('mbev.logJournal'))['j-3'].b.odds==='+200'), await S.p.evaluate(()=>JSON.parse(lsPlain('mbev.logJournal'))['j-3'].b.odds));
    await S.p.evaluate(()=>{ localStorage.setItem('zz.other', JSON.stringify({'t-9':{b:{id:'t-9',name:'Other tab'},at:1,n:1}})); const J=JSON.parse(lsPlain('mbev.logJournal')); J['t-9']={b:{id:'t-9',name:'Other tab'},at:1,n:1,ack:true}; localStorage.setItem('mbev.logJournal', JSON.stringify(J)); localStorage.removeItem('zz.other'); jrWrite(); });
    check('an entry another tab wrote is kept when this tab writes', await S.p.evaluate(()=>!!JSON.parse(lsPlain('mbev.logJournal'))['t-9']), 0);
    await S.p.evaluate(()=>{ document.querySelector('.tab[data-view="v-log"]').click(); document.getElementById('wipe').click(); }); await S.p.waitForTimeout(600);
    check('Delete all (asked twice) is on purpose: no bet is called gone afterwards', await S.p.evaluate(()=>logged.length===0 && jrMissing().length===0), await S.p.evaluate(()=>[logged.length, jrMissing().map(e=>e.b.id)]));
    // storage: with the browser nearly full the journal steps aside and the log still saves
    const r=await S.p.evaluate(()=>{ logged.push({id:'s-1', name:'Room test', market:'Moneyline', kind:'moneyline', stake:1, odds:'+100', book:'Novig', date:'2026-11-27'}); const free=lsQuota()-lsSize(); try{ localStorage.setItem('zz.fill', 'x'.repeat(Math.max(0, free-300000))); }catch(e){ return {err:String(e)}; }
      saveLog(); jrWrite(); const out={full:window._jrFull, journal:localStorage.getItem('mbev.logJournal'), logOk:window._logSaveBad===false && /Room test/.test(lsPlain('mbev.log')||''), left:lsQuota()-lsSize()}; localStorage.removeItem('zz.fill'); saveLog(); jrWrite(); out.after={full:window._jrFull, back:!!localStorage.getItem('mbev.logJournal')}; return out; });
    check('with the browser’s storage nearly full the journal steps aside (it is not written) and the log itself still saves', r.full===true && r.journal===null && r.logOk===true, r);
    check('and it comes back by itself once there is room', r.after && r.after.full===false && r.after.back===true, r.after);
    check('no page errors (7)', !S.W.errs.length, S.W.errs); await S.b.close(); }
  // ---- 8. second review (2026-11-28): a side the book names in words against a bet already in the log under a team code; the other side of a market; the journal ----
  { const st=NOW+20*H, row=(id,name,sport,game,extra)=>Object.assign({id, key:'k-'+id, name, market:'Moneyline', kind:'moneyline', sport, team:name, game, date:dayCT(st), dateSet:true, start:iso(st), stake:1, odds:'-120', book:'Novig', manual:true, srcType:'manual'}, extra||{});
    const wordFill=(order, ref, words)=>fill(order, ref, 0, 0.5455, 1.83, 1, {sport:null, start:iso(st), title:words+' · '+words, desc:words, eventId:'ev-'+order, kind:'moneyline', teamName:words, team:null}, 1*H);   // what Worker v3.91 sends: words only, no league
    // 8a. the league's own team list ties it: no second row
    { const S=await boot({'mbev.log':[row('h-den','DEN','NFL','DEN @ PIT'), row('h-kc','KC','NFL','LV @ KC')]}); S.W.fills=[wordFill('ord-den','mkt-den','Denver Broncos'), wordFill('ord-kc2','mkt-kc2','Chiefs')]; await S.read(); const B=await S.bets();
      check('“Denver Broncos” from the book is tied to the DEN bet already in the log, and “Chiefs” to KC: still two rows, none added', B.length===2 && (B.find(x=>x.id==='h-den').fills||[]).includes('o:ord-den') && (B.find(x=>x.id==='h-kc').fills||[]).includes('o:ord-kc2') && await S.p.evaluate(()=>fillPending.length)===0, B.map(x=>[x.id,x.name,x.fills]));
      check('this app tells the Worker it understands Novig’s own results (nv=1) on both reads', S.W.urls.some(u=>/\/mine\/fills\?[^#]*nv=1/.test(u)) && S.W.urls.some(u=>/\/mine\/receipts\?[^#]*nv=1/.test(u)), S.W.urls.slice(0,4));
      check('no page errors (8a)', !S.W.errs.length, S.W.errs); await S.b.close(); }
    // 8b. no team list for that league: it cannot tell, so it waits (not tied on a guess, not added as a second row)
    //     (the row's stake and price differ from the book bet's on purpose: the same cost to the cent, price and day would tie them by the older rule, fingerprintPending)
    { const S=await boot({'mbev.log':[row('h-nba','DEN','NBA','DEN @ LAL',{stake:2, odds:'-105'})]}); S.W.fills=[wordFill('ord-nug','mkt-nug','Denver Nuggets')]; await S.read(); let B=await S.bets();
      const P=await S.p.evaluate(()=>{ document.querySelector('.tab[data-view="v-log"]').click(); renderFromBooks(); const el=document.getElementById('fromBooks'); return {n:fillPending.length, text:el.textContent, tie:!!el.querySelector('.fb-tie'), add:!!el.querySelector('.fb-add')}; });
      check('a bet named in words that MAY be a logged bet waits in From your books: one row in the log, not tied', B.length===1 && !(B[0].fills||[]).length && P.n===1, [B.length, B[0].fills, P.n]);
      check('it names the row it may be and offers It is that bet next to Add', /This may be the bet already in your log: DEN Moneyline, \$2\.00/.test(P.text) && P.tie && P.add, P);
      await S.read(); await S.read(); B=await S.bets(); check('more reads change nothing (still one row, still waiting)', B.length===1 && await S.p.evaluate(()=>fillPending.length)===1, B.length);
      await S.p.evaluate(()=>document.querySelector('#fromBooks .fb-tie').click()); await S.p.waitForTimeout(500); B=await S.bets();
      check('It is that bet ties them: one row, with the book bet on it, nothing left waiting', B.length===1 && (B[0].fills||[]).includes('o:ord-nug') && await S.p.evaluate(()=>fillPending.length)===0, B.map(x=>[x.id,x.fills]));
      await S.read(); B=await S.bets(); check('and it stays tied on the next read', B.length===1 && (B[0].fills||[]).includes('o:ord-nug') && await S.p.evaluate(()=>fillPending.length)===0, B.map(x=>[x.id,x.fills]));
      check('no page errors (8b)', !S.W.errs.length, S.W.errs); await S.b.close(); }
    { const S=await boot({'mbev.log':[row('h-nba','DEN','NBA','DEN @ LAL',{stake:2, odds:'-105'})]}); S.W.fills=[wordFill('ord-nug','mkt-nug','Denver Nuggets')]; await S.read();
      await S.p.evaluate(()=>{ document.querySelector('.tab[data-view="v-log"]').click(); renderFromBooks(); document.querySelector('#fromBooks .fb-add').click(); }); await S.p.waitForTimeout(600); let B=await S.bets();
      check('Add adds it as a bet of its own under the book’s words (your press, your call)', B.length===2 && B.some(x=>x.name==='Denver Nuggets' && (x.fills||[]).includes('o:ord-nug')) && !(B.find(x=>x.id==='h-nba').fills||[]).length, B.map(x=>[x.id,x.name,x.fills]));
      await S.read(); await S.read(); B=await S.bets(); check('and more reads add nothing after that', B.length===2 && await S.p.evaluate(()=>fillPending.length)===0, B.map(x=>[x.id,x.name,x.fills]));
      check('no page errors (8c)', !S.W.errs.length, S.W.errs); await S.b.close(); }
    // 8d. the rule itself
    { const S=await boot(); const R=await S.p.evaluate(()=>{ const gi=(a,al,an,h,hl,hn)=>({teams:[{ha:'away', abbr:a, loc:al, nick:an, name:an},{ha:'home', abbr:h, loc:hl, nick:hn, name:hn}]});
        const rams={kind:'moneyline', name:'LA', team:'LA', market:'Moneyline', sport:'NFL', game:'LA @ SEA', gameInfo:gi('LAR','Los Angeles','Rams','SEA','Seattle','Seahawks')}, bolts={kind:'moneyline', name:'LAC', team:'LAC', market:'Moneyline', sport:'NFL', game:'LAC @ DEN', gameInfo:gi('LAC','Los Angeles','Chargers','DEN','Denver','Broncos')};
        const la={kind:'moneyline', name:'LAC', team:'LAC', market:'Moneyline', sport:'NFL', game:'LA @ LAC', gameInfo:gi('LAR','Los Angeles','Rams','LAC','Los Angeles','Chargers')};
        const fb=w=>({kind:'moneyline', teamName:w, team:null}), M=(f,L)=>fillMisfitBet({book:'novig', bet:f}, Object.assign({manual:true}, L));
        window._settlements=[{book:'novig', ref:'m1', oid:'m1-o1', side:null, outcome:'loss'}, {book:'novig', ref:'m1', oid:'m1-o0', side:null, outcome:'win'}];
        const sf=o=>{ const x=settlementFor({fillBook:'novig', fillRef:'m1', fillOutcome:o}); return x?x.outcome:null; };
        return {chargersVsRams:betMatches(fb('Los Angeles Chargers'), rams), chargersVsChargers:betMatches(fb('Los Angeles Chargers'), bolts), cityOnly:sideNameFit('Los Angeles', la, 'LAC'), nick:sideNameFit('Chargers', la, 'LAC'),
          sox:sideNameFit('Sox', {name:'BOS', team:'BOS', sport:'MLB'}, 'BOS'), ny:sideNameFit('New York', {name:'NYG', team:'NYG', sport:'NFL'}, 'NYG'), sinner:sideNameFit('J. Sinner', {name:'NE', team:'NE', sport:'NFL'}, 'NE'), sinnerNoList:sideNameFit('J. Sinner', {name:'NE', team:'NE', sport:'NBA'}, 'NE'),
          win:sf('m1-o0'), loss:sf('m1-o1'), none:sf(null),
          otherTeam:M(fb('Chiefs'), {kind:'moneyline', name:'LV', team:'LV', sport:'NFL', game:'LV @ KC'}), otherGame:M(fb('V. Lepchenko'), {kind:'moneyline', name:'PIT', team:'PIT', sport:'NFL', game:'PIT @ DEN'}),
          sameWords:M(fb('Denver Broncos'), {kind:'moneyline', name:'DEN', team:'DEN', sport:'NFL', game:'DEN @ PIT'}), noList:M(fb('V. Lepchenko'), {kind:'moneyline', name:'DEN', team:'DEN', sport:'NBA', game:'DEN @ LAL'}),
          codes:M({kind:'moneyline', teamName:'TBL', team:'TBL'}, {kind:'moneyline', name:'TB', team:'TB', sport:'NHL', game:'TB @ FLA'}), codesOther:M({kind:'moneyline', teamName:'FLA', team:'FLA'}, {kind:'moneyline', name:'TB', team:'TB', sport:'NHL', game:'TB @ FLA'}),
          ramsRowChargersBet:M({kind:'moneyline', teamName:'LAC', team:'LAC'}, {kind:'moneyline', name:'LA', team:'LA', sport:'NFL', game:'LA @ SEA'}),
          fsuVsFla:(()=>{ const g=gi('FLA','Florida','Gators','FSU','Florida State','Seminoles'); g.teams[0].name='Florida'; g.teams[1].name='Florida St'; const fla={kind:'moneyline', name:'FLA', team:'FLA', market:'Moneyline', sport:'NCAAF', game:'FLA @ FSU', gameInfo:g}, fsu={kind:'moneyline', name:'FSU', team:'FSU', market:'Moneyline', sport:'NCAAF', game:'FLA @ FSU', gameInfo:g};
            return [betMatches(fb('Florida State'), fla), betMatches(fb('Florida State'), fsu), betMatches(fb('Florida'), fla), betMatches(fb('Florida'), fsu), betMatches(fb('Florida State Seminoles'), fsu), betMatches(fb('Florida State Seminoles'), fla), betMatches(fb('Gators'), fla)]; })(),
          noSport:[sideNameFit('Denver Broncos', {name:'DEN', team:'DEN'}, 'DEN'), sideNameFit('Denver Nuggets', {name:'DEN', team:'DEN'}, 'DEN'), sideNameFit('V. Lepchenko', {name:'PIT', team:'PIT'}, 'PIT')]}; });
      check('“Los Angeles Chargers” is not the Rams (same city), and is the Chargers', R.chargersVsRams===false && R.chargersVsChargers===true, R);
      check('a city or a nickname two teams share is “cannot tell” (Los Angeles, Sox, New York); a nickname one team has is that team', R.cityOnly===-1 && R.sox===-1 && R.ny===-1 && R.nick===1, R);
      check('a player’s name is never a team code: no with the league’s list, no without it', R.sinner===0 && R.sinnerNoList===0, R);
      check('a book result is taken only for the side the bet holds, whichever comes first in the list', R.win==='win' && R.loss==='loss' && R.none===null, R);
      check('the repair list also finds a side named in words saved as the other team (Chiefs saved as LV) and a bet of another game (V. Lepchenko saved as PIT) without the league from the Worker', R.otherTeam==='team' && R.otherGame==='game', R);
      check('and leaves alone the same team in other words, a league with no list, and two codes for one team (TB, TBL)', R.sameWords==='' && R.noList==='' && R.codes==='' && R.codesOther==='team', R);
      check('“Florida State” is Florida State and never Florida (a team’s exact name outranks a name found inside the words); “Florida” is Florida; nicknames still work', JSON.stringify(R.fsuVsFla)===JSON.stringify([false,true,true,false,true,false,true]), R.fsuVsFla);
      check('the repair list sees a Chargers bet tied to a Rams row (LA and LAC are two teams)', R.ramsRowChargersBet==='team', R.ramsRowChargersBet);
      check('a row with no sport: the league’s list can say yes (DEN is Denver Broncos), otherwise it cannot tell or says no', JSON.stringify(R.noSport)===JSON.stringify([1,-1,0]), R.noSport);
      check('no page errors (8d)', !S.W.errs.length, S.W.errs); await S.b.close(); }
    // 8e. Fix it and a result you typed yourself
    { const mine={id:'m-1', key:'km1', name:'PIT', market:'Moneyline', kind:'moneyline', sport:'NFL', team:'PIT', game:'PIT @ DEN', date:dayCT(NFL_START), dateSet:true, start:iso(NFL_START), stake:0.98, odds:'+355', book:'Novig', fills:['o:ord-lep'], fillBook:'novig', fillRef:'mkt-ten', fillOutcome:'mkt-ten-o0', fillQty:4.44, fillCost:0.98, fillFee:0, manual:true, srcType:'manual', result:'win', gradedBy:'manual', resultSrc:'you'};
      const S=await boot({'mbev.log':[mine], 'mbev.fillSeen':{'novig:o:ord-lep':{s:'added',q:4.44}}}); S.W.fills=[fill('ord-lep','mkt-ten',0,0.22,4.44,0.9768,TEN_OLD)]; await S.read();
      const r1=await S.p.evaluate(()=>{ const L=logged[0], f=window._fills[0], why=fillMisfitBet(f, L), how=fixFromFill(L, f); return {why, how, name:L.name, result:L.result, gradedBy:L.gradedBy, before:L.edits&&L.edits[0].before.result}; });
      check('with no result from the book, Fix keeps the result you typed yourself (the Worker before v3.92 sends none)', r1.why==='game' && r1.how==='fixed' && r1.name==='V. Lepchenko' && r1.result==='win' && r1.gradedBy==='manual', r1);
      check('no page errors (8e)', !S.W.errs.length, S.W.errs); await S.b.close(); }
    { const mine={id:'m-2', key:'km2', name:'PIT', market:'Moneyline', kind:'moneyline', sport:'NFL', team:'PIT', game:'PIT @ DEN', date:dayCT(NFL_START), dateSet:true, start:iso(NFL_START), stake:0.98, odds:'+355', book:'Novig', fills:['o:ord-lep'], fillBook:'novig', fillRef:'mkt-ten', fillOutcome:'mkt-ten-o0', fillQty:4.44, fillCost:0.98, fillFee:0, manual:true, srcType:'manual', result:'loss', gradedBy:'manual', resultSrc:'you'};
      const S=await boot({'mbev.log':[mine], 'mbev.fillSeen':{'novig:o:ord-lep':{s:'added',q:4.44}}}); S.W.fills=[F_TEN]; S.W.settlements=[{book:'novig', ref:'mkt-ten', oid:'mkt-ten-o0', side:null, outcome:'win', grade:'WIN', qty:4.44, cost:0.9768, payout:4.44, pnl:3.4632, ts:NOW-4*H}]; await S.read();
      const r0=await S.p.evaluate(()=>({result:logged[0].result, gradedBy:logged[0].gradedBy}));
      await S.p.evaluate(()=>{ document.querySelector('.tab[data-view="v-log"]').click(); }); await S.p.waitForTimeout(300); await S.p.evaluate(()=>{ document.querySelector('#logFix .fx-fix').click(); }); await S.p.waitForTimeout(1200); const B=await S.bets();
      check('before Fix, a result you typed is not replaced by the book’s', r0.result==='loss' && r0.gradedBy==='manual', r0);
      check('Fix it from Novig, with Novig’s own result in hand, takes Novig’s (WIN); what you had typed is kept in the bet’s history', B[0].name==='V. Lepchenko' && B[0].result==='win' && B[0].resultSrc==='Novig' && B[0].edits[0].before.result==='loss', B[0]);
      check('no page errors (8f)', !S.W.errs.length, S.W.errs); await S.b.close(); }
    // 8g. the journal and the three ways a bet is taken out for good
    { const mk=(id,name)=>({id, key:'kj-'+id, name, market:'1.5 Points', kind:'prop', side:'O', sport:'NBA', date:dayCT(NOW), dateSet:true, stake:1, odds:'+100', book:'Novig'});   // props with no game: nothing grades them while the test runs
      const S=await boot({'mbev.log':[mk('u-1','Player One'), mk('u-2','Player Two'), mk('u-3','Player Three'), mk('u-4','Player Four')]}); await S.p.evaluate(()=>{ saveLog(); jrWrite(); });
      const r=await S.p.evaluate(async()=>{ const own=id=>{ const b=logged.find(x=>x.id===id); easyOwn()[id]={key:'k'+id, sig:easySig(b)}; easyOwnSave(); };
        own('u-1'); const a=easyUndo('u-1'); own('u-2'); const b=easyRemoveBet('u-2');
        removeBet(logged.find(x=>x.id==='u-3'), 0); document.querySelector('.tab[data-view="v-log"]').click(); try{ renderRemoved(); }catch(e){} const fb=document.querySelector('button.rm-forget'); if(fb) fb.click();
        await new Promise(z=>setTimeout(z,300)); return {a, b, forgot:!!fb, left:logged.map(x=>x.id), removed:removedBets.map(x=>x.id), gone:jrMissing().map(e=>e.b.id), lostHidden:document.getElementById('logLost').hidden}; });
      check('Easy’s Undo, Easy’s Remove and “forget” in the Removed list take a bet out on purpose: the journal calls none of them gone', r.left.join()==='u-4' && !r.removed.length && r.forgot && r.gone.length===0 && r.lostHidden, r);
      check('no page errors (8g)', !S.W.errs.length, S.W.errs); await S.b.close(); } }
  console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail?1:0);
})();
