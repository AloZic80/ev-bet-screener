// node tests/scope-v468-test.js — v4.68, the scope Alonzo and ChatGPT agreed after the losing week (owner: "BUILD", 2026-11-11):
// 1. Kalshi: pressing Send the Sentinels again with the same prices never changes the book (both directions).
// 2. Long-shot moneylines (La Contadora under 45%), in every mode: a market price is required, the smallest bet, 3 a game day and 1 a game,
//    counting logged bets; the decision says "LONG-SHOT ML $1.00 · N of 3 used today".
// 3. A moneyline the model puts 8+ points above the market: no stake, "RESEARCH", a 👀 Watch record with its own tag. Not for spreads.
// 4. Performance: "N settled tickets · X unique outcomes · Y unique games"; two tickets on one outcome are one forecast.
// 5. The bet editor's optional Cover %: before the game it counts; after the start it is shown only; a pregame cover is not replaced after kickoff.
// 6. The CSV's four new columns, from the bet's frozen snapshot, blank when missing.
// Every expected number is worked here by hand, not with the page's functions.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,700)); };
const iso=ms=>new Date(ms).toISOString(), near=(a,b)=>Math.abs(a-b)<1e-6;
const am=p=>p>=0.5?String(Math.round(-100*p/(1-p))):'+'+Math.round(100*(1-p)/p);
function route(p, html, S){ return p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
  if(S && /\/live\?/.test(u)){ const bets=JSON.parse(decodeURIComponent(u.split('bets=')[1])); const R={}; bets.forEach(d=>{ const [kind,idx,bk]=d.id.split(':'); const pr=S.live&&S.live(kind,+idx,bk); if(pr) R[d.id]={ok:true, price:pr, bid:pr-0.02, at:Date.now()}; }); return r.fulfill({contentType:'application/json',body:JSON.stringify({results:R})}); }
  if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); }); }
async function open(b, o){ const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:o.W||1280,height:900}}); await ctx.clock.install({time:new Date(o.NOW)});
  await ctx.addInitScript(([R,d,bk,L])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books:bk,bank:'500',cfgVer:3.03})); localStorage.setItem('mbev.cards','0');
    if(R) localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows:R})); if(L) localStorage.setItem('mbev.log',JSON.stringify(L)); }catch(e){} },[o.rows||null,o.day,o.books||'Novig, Kalshi, Polymarket, Bovada',o.log||null]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); const S={ctx,p,errs,live:o.live};
  await route(p, html, S); await p.goto('http://app.test/'); await p.waitForTimeout(1300); return S; }

(async()=>{ const b=await chromium.launch(); let S;
  // ================= 1: Kalshi, repeated presses =================
  { const NOW=Date.parse('2026-11-11T19:00:00Z'), KO=Date.parse('2026-11-12T01:15:00Z');
    const T=(ha,abbr)=>({ha,id:abbr,abbr,name:abbr+' Team',loc:abbr,nick:'Team',logo:'',rec:'',color:'333333',alt:'ffffff'});
    const prop=(id,price)=>({name:'Kal '+id,team:'AAA',game:'AAA @ HHH',matchup:'AAA @ HHH',side:'O',sport:'NBA',market:'20.5 Points',kind:'prop',book:'Novig',offeredRaw:am(price),offeredProb:price,fairProb:0.58,fairRaw:am(0.58),mktProb:0.56,stars:4,evModel:'projection',projValue:22,
      gameInfo:{state:'pre',startISO:iso(KO),eventId:'90901',timeCT:'',detail:'',teams:[T('away','AAA'),T('home','HHH')]},src:'api:NBA:props',apiKey:id,loadedAt:iso(NOW-60e3)});
    // By hand: chance = min(0.58, 0.56 + 0.35 × 0.02) = 0.567. EV = ((0.567/p − 1) − f)/(1 + f). Kalshi f = 0.07 × (1 − p); Polymarket US f = 0.0695 × (1 − p).
    // a) Kalshi 54.05%: listed fee 0.032165, EV +1.63% (best at the listed fee) but under the 1.5% floor once the fee is rounded up on whole contracts;
    //    Polymarket US 54.1%: fee 0.031901, EV +1.57%. The card goes to Polymarket US and must stay there on every press.
    // b) Kalshi 53%: fee 0.0329, EV +3.57% (a cent of rounding on 2+ contracts costs at most 0.94 points: still over the floor); Polymarket US 53.5%:
    //    fee 0.032318, EV +2.66%. The card goes to Kalshi and must stay there on every press.
    const evH=(p,f)=>((0.567/p-1)-f)/(1+f);
    check('by hand: Kalshi 54.05% +'+(evH(0.5405,0.07*0.4595)*100).toFixed(2)+'%, Polymarket US 54.1% +'+(evH(0.541,0.0695*0.459)*100).toFixed(2)+'%; Kalshi 53% +'+(evH(0.53,0.07*0.47)*100).toFixed(2)+'%, Polymarket US 53.5% +'+(evH(0.535,0.0695*0.465)*100).toFixed(2)+'%',
      near(+(evH(0.5405,0.07*0.4595)*100).toFixed(2),1.63) && near(+(evH(0.541,0.0695*0.459)*100).toFixed(2),1.57) && near(+(evH(0.53,0.07*0.47)*100).toFixed(2),3.57) && near(+(evH(0.535,0.0695*0.465)*100).toFixed(2),2.66), null);
    for(const [tag,q,want] of [['Kalshi fails after rounding',{kalshi:0.5405, poly:0.541},'Polymarket US'],['Kalshi passes after rounding',{kalshi:0.53, poly:0.535},'Kalshi']]){
      S=await open(b,{NOW,day:'2026-11-11',rows:[prop('k',0.53)],live:(k,i,bk)=>q[bk]||null});
      const seen=[]; for(let i=0;i<3;i++){ await S.p.evaluate(async()=>{ await shopExchanges(); }); await S.p.waitForTimeout(250);
        seen.push(await S.p.evaluate(()=>{ const r=lastRows.find(x=>x.apiKey==='k'); return r.book+' '+r.offeredProb+(r.pass?' pass':' no'); })); }
      check(tag+': three presses with the same prices show the same book every time ('+want+')', seen.every(x=>x===seen[0]) && seen[0].startsWith(want+' ') && / pass$/.test(seen[0]), seen);
      check('no page errors ('+tag+')', !S.errs.length, S.errs); await S.ctx.close(); } }

  // ================= 2 and 3: long-shot moneylines and the gap research =================
  { const NOW=Date.parse('2026-11-09T19:00:00Z'), DAY='2026-11-09', TIP=Date.parse('2026-11-10T02:30:00Z');
    const T=(ha,abbr)=>({ha,id:abbr,abbr,name:abbr+' Team',loc:abbr,nick:'Team',logo:'',rec:'',color:'333333',alt:'ffffff'});
    const ml=(id,team,opp,price,fair,mkt,kind)=>({name:team,team,game:team+' @ '+opp,matchup:team+' @ '+opp,side:'',sport:'NFL',market:kind==='spread'?'+3.5':'Moneyline',kind:kind||'moneyline',book:'Novig',offeredRaw:am(price),offeredProb:price,fairProb:fair,fairRaw:'',mktProb:mkt,stars:null,evModel:'market',
      gameInfo:{state:'pre',startISO:iso(TIP),eventId:'7700'+id,timeCT:'',detail:'',teams:[T('away',team),T('home',opp)]},src:'api:NFL:lines',apiKey:id,loadedAt:iso(NOW-60e3)});
    // La Contadora by hand, model 42%, market 38%: chance = min(0.42, 0.38 + 0.35 × 0.04) = 0.394 (under 45%: a long-shot moneyline). Novig has no fee.
    // EV = 0.394/p − 1: A at 36% +9.44%; B at 37% +6.49%; C at 37.5% +5.07%; F at 37.7% +4.51%; D at 38% +3.68%.
    // One long-shot moneyline is already logged today, in B's game. So: A is the 2nd of 3, B is skipped (one a game), C is the 3rd, F and D hit the limit.
    const ROWS=[ml('A','NYJ','MIA',0.36,0.42,0.38), ml('B','BUF','NEP',0.37,0.42,0.38), ml('C','KCC','LVR',0.375,0.42,0.38), ml('F','DEN','LAC',0.377,0.42,0.38), ml('D','SFO','SEA',0.38,0.42,0.38),
      // Gap: model 58.5%, market 50%: 8.5 points apart (over 8). Chance 0.50 + 0.35 × 0.085 = 0.52975, EV at 49% = +8.11%: before v4.68 it was staked.
      ml('G','DAL','PHI',0.49,0.585,0.50), ml('S','GBP','CHI',0.49,0.585,0.50,'spread'),
      // No market price: model 40% at 33% (+21% on the model alone): a long-shot moneyline with nothing to confirm it.
      ml('N','DET','MIN',0.33,0.40,null)];
    const LOG=[{id:'old',key:'old',sport:'NFL',kind:'moneyline',name:'NEP',team:'NEP',game:'BUF @ NEP',market:'Moneyline',betnow:'NEP ML',book:'Novig',odds:'+150',fair:'',stake:1,date:DAY,dateSet:true,start:iso(TIP),result:'pending',snap:{at:iso(NOW-3600e3),act:0.40,market:0.37,policy:'act-v2',screener:'v4.67'}}];
    S=await open(b,{NOW,day:DAY,rows:ROWS,log:LOG,books:'Novig'});
    const R=await S.p.evaluate(()=>Object.fromEntries(lastRows.map(r=>[r.apiKey,{stake:+(r.stake||0).toFixed(2), pass:!!r.pass, act:r.actProb!=null?+r.actProb.toFixed(5):null, ev:r.actNet!=null?+(r.actNet*100).toFixed(2):null, n:r.lsmlN||null, gap:!!r.gapRes, watch:!!r.watch,
      flags:(r.flags||[]).map(f=>f[1]).filter(t=>/LONG-SHOT|GAP|limit/.test(t)), dec:decisionHtml(r,cfgRead()).replace(/<br>/g,' · ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim()}])));
    check('by hand: A is a long shot at La Contadora 39.4% with EV +9.44%', near(R.A.act,0.394) && near(R.A.ev,9.44), R.A);
    check('A: the 2nd long-shot moneyline today (one is logged), staked at the smallest bet, $1.00: "LONG-SHOT ML $1.00 smallest bet · market-confirmed · 2 of 3 used today · one a game"', R.A.stake===1 && R.A.n===2 && /^LONG-SHOT ML \$1\.00 smallest bet · market-confirmed · 2 of 3 used today · one a game$/.test(R.A.dec), R.A);
    check('B (+6.49%): no stake and not counted: you already hold a moneyline in its game (the game-line rule says so first; the one-a-game long-shot limit is the backstop)', R.B.stake===0 && R.B.n===null && /^SKIP already bet/.test(R.B.dec), R.B);
    check('C (+5.07%): the 3rd, $1.00, "3 of 3 used today"', R.C.stake===1 && R.C.n===3 && /3 of 3 used today/.test(R.C.dec), R.C);
    check('F (+4.51%) and D (+3.68%): the limit is reached, no stake, "SKIP long-shot ML limit (3 a day)"', R.F.stake===0 && R.D.stake===0 && /^SKIP long-shot ML limit \(3 a day\)$/.test(R.F.dec) && /^SKIP long-shot ML limit \(3 a day\)$/.test(R.D.dec), {F:R.F, D:R.D});
    check('N, no market price: not offered in any mode ("LONG-SHOT ML · no market price"), no stake', R.N.stake===0 && !R.N.pass && R.N.flags.some(t=>/^LONG-SHOT ML · no market price: not offered in any mode$/.test(t)), R.N);
    check('G, model 8.5 points above the market: research, no stake, Watch, "RESEARCH model 8+ pts above market · no automatic stake" (her EV +8.11% would have staked it before)', R.G.gap && R.G.watch && R.G.stake===0 && !R.G.pass && near(R.G.ev,8.11) && /^RESEARCH model 8\+ pts above market · no automatic stake$/.test(R.G.dec) && R.G.flags.some(t=>/^MONEYLINE GAP RESEARCH · model 8\+ points above market \(58\.5% vs 50\.0%\)/.test(t)), R.G);
    check('S, the same gap on a spread: not research (moneylines only)', !R.S.gap && !R.S.flags.some(t=>/GAP/.test(t)), R.S);
    const W=await S.p.evaluate(()=>watchAll().map(o=>({name:o.name, tag:o.tag||null, why:o.why||null})));
    const wg=W.find(o=>o.name==='DAL');
    check('the 👀 Watch record for G carries its own tag and reason ("ml_gap_research", "MONEYLINE GAP RESEARCH · model 8+ points above market")', wg && wg.tag==='ml_gap_research' && wg.why==='MONEYLINE GAP RESEARCH · model 8+ points above market', W);
    // Hail Marys (Clairvoyant) share the 3 a day: turn it on; every long-shot moneyline left is past the limit, so none is offered as a Hail Mary.
    await S.p.evaluate(()=>setMode('hail')); await S.p.waitForTimeout(300);
    const H=await S.p.evaluate(()=>lastRows.filter(r=>r.tier==='hail' && lsmlRow(r)).map(r=>r.apiKey));
    check('Clairvoyant: no long-shot moneyline past the 3 a day is offered as a Hail Mary', H.length===0, H);
    // A bet logged from G is research: kept out of the scorecard
    await S.p.evaluate(()=>{ addToLog(lastRows.find(r=>r.apiKey==='G')); });
    const lg=await S.p.evaluate(()=>{ const L=logged[logged.length-1]; L.stake=1; L.result='win'; L.gradedBy='manual';   /* a research bet you placed yourself */ const z=scoreSet(logged); return {gap:!!L.gapRes, inScore:z.settled.some(x=>x.b===L), control:scoreSet([Object.assign({},L,{gapRes:undefined})]).settled.length}; });
    check('a bet logged from G is saved as gap research and kept out of the scorecard (the same bet without the mark would count)', lg.gap && !lg.inScore && lg.control===1, lg);
    check('no page errors (long shots)', !S.errs.length, S.errs); await S.ctx.close(); }

  // ================= 4, 5, 6: the Bet log =================
  { const NOW=Date.parse('2026-11-11T18:00:00Z'), H=3600e3, DAY='2026-11-11';
    const bet=(id,o)=>Object.assign({id,key:id,sport:'NFL',kind:'prop',book:'Bovada',odds:'+100',stake:2,date:DAY,dateSet:true,manual:true,game:'NYJ @ MIA',name:'Player '+id,side:'O',market:'0.5 Defense Sacks',betnow:'O 0.5 +100',snap:{at:iso(NOW-5*H)},start:iso(NOW-4*H)},o);
    // d1 and d2: two tickets on one outcome (same day, game, player, stat and line, side), both won at +100: $4.00 profit, one forecast at 60% (−150).
    // m2: a cover of 58% typed after its game started: Slight Lean, shown only. m1: a game still to come, cover typed before it.
    const LOG=[bet('d1',{name:'Tuipulotu',fair:'-150',result:'win',gradedBy:'manual'}), bet('d2',{name:'Tuipulotu',fair:'-150',result:'win',gradedBy:'manual'}),
      bet('m2',{name:'Other',game:'BUF @ NEP',fair:'',result:'win',gradedBy:'manual'}), bet('m1',{name:'Later',game:'KCC @ LVR',fair:'',result:'pending',start:iso(NOW+5*H)}),
      bet('c1',{name:'Snap',game:'DAL @ PHI',fair:'',result:'pending',start:iso(NOW+6*H),snap:{at:iso(NOW-H),market:0.52,act:0.526,policy:'act-v2',screener:'v4.67'}})];
    S=await open(b,{NOW,day:DAY,log:LOG}); const p=S.p;
    await p.click('.tab[data-view="v-log"]'); await p.waitForTimeout(300);
    const edit=async(id,val)=>{ const i=await p.evaluate(id=>logged.findIndex(x=>x.id===id), id); await p.click('#logBody button.kill.edit[data-i="'+i+'"]'); await p.waitForTimeout(250);
      await p.fill('#logBody tr.editor .eb-cover', val); await p.click('#logBody tr.editor .eb-save'); await p.waitForTimeout(350); };
    await edit('m1','61'); await edit('m2','58');
    let L=await p.evaluate(()=>Object.fromEntries(logged.map(b=>[b.id,{cover:b.cover||null, hist:(b.coverHist||[]).map(x=>x.p), band:logBandOf(b)}])));
    check('m1, typed 61% three hours... five hours before its game: saved as 0.61, before the start, typed by you, with the app version and policy; band Lean', L.m1.cover && L.m1.cover.p===0.61 && L.m1.cover.pre===true && L.m1.cover.src==='typed_by_user' && L.m1.cover.app==='v4.68' && L.m1.cover.policy==='act-v2' && L.m1.cover.gameStart===iso(NOW+5*H) && L.m1.band===5, L.m1);
    check('m2, typed 58% after its game started: saved as after the start (pre false); band Slight Lean, shown', L.m2.cover && L.m2.cover.p===0.58 && L.m2.cover.pre===false && L.m2.band===4, L.m2);
    const chip=await p.evaluate(()=>{ const i=logged.findIndex(x=>x.id==='m2'); return logBandChip(logged[i]); });
    check('m2 chip says "added after the game started: shown, not judged"', /Cover you typed 58\.0% · added after the game started: shown, not judged/.test(chip), chip);
    // after m1's kickoff a new cover does not replace the pregame one
    await p.clock.fastForward(6*H); await p.waitForTimeout(300); await edit('m1','70');
    L=await p.evaluate(()=>Object.fromEntries(logged.map(b=>[b.id,{cover:b.cover||null, hist:(b.coverHist||[]).map(x=>x.p)}])));
    check('m1 after kickoff: typing 70% keeps the 61% typed before the game; 70% goes into its history', L.m1.cover.p===0.61 && L.m1.cover.pre===true && L.m1.hist.length===1 && L.m1.hist[0]===0.7, L.m1);
    // calibration and the Bet result study
    const cal=await p.evaluate(()=>calibrationPoints().map(x=>({c:x.cover, won:x.won})));
    check('calibration: the two Tuipulotu tickets are one forecast (60%, won); m2 (typed after the start) is left out: 1 point', cal.length===1 && near(cal[0].c,0.6) && cal[0].won, cal);
    await p.evaluate(()=>{ document.querySelector('.tab[data-view="v-perf"]').click(); }); await p.waitForTimeout(400);
    const st=await p.evaluate(()=>({sum:document.getElementById('studySum').textContent, rows:[...document.querySelectorAll('#studyRows tr')].map(t=>[...t.querySelectorAll('td')].map(d=>d.textContent.replace(/\s+/g,' ').trim()).slice(0,7))}));
    // settled: d1, d2, m2 = 3 tickets; outcomes: Tuipulotu, Other = 2; games: NYJ @ MIA, BUF @ NEP = 2
    check('Performance: "3 settled tickets · 2 unique outcomes · 2 unique games"', /3 settled tickets · 2 unique outcomes · 2 unique games/.test(st.sum), st.sum);
    const lean=st.rows.find(r=>/^Lean/.test(r[0])), sl=st.rows.find(r=>/^Slight Lean/.test(r[0]));
    check('Bet result study, Lean: 3 bets (d1, d2, m1), 2–0–0, expected 60.0% and won 100% on one outcome (profit counts both tickets)', lean && lean[1]==='3' && lean[3]==='2–0–0' && lean[4]==='60.0%' && lean[5]==='100.0%', lean);
    check('Bet result study, Slight Lean (m2, typed after the start): 1–0–0, no expected % and no hit rate (not judged)', sl && sl[3]==='1–0–0' && sl[4]==='—' && sl[5]==='—', sl);
    // CSV
    const csv=await p.evaluate(()=>logCsv('')); const lines=csv.replace(/^﻿/,'').split('\r\n'), head=lines[0].split(',');
    check('CSV: the four new columns come last: market chance %, La Contadora chance %, policy, app version', head.slice(-4).join('|')==='market chance %|La Contadora chance %|policy|app version' && head.length===29, head.slice(-5));
    const c1=lines.find(l=>/Snap/.test(l)).split(','), d1=lines.find(l=>/Tuipulotu/.test(l)).split(',');
    check('CSV: c1 shows 52.0, 52.6, act-v2, v4.67 from its snapshot; an older bet without them leaves the four blank', c1.slice(-4).join('|')==='52.0|52.6|act-v2|v4.67' && d1.slice(-4).join('|')==='|||', {c1:c1.slice(-4), d1:d1.slice(-4)});
    // the phone: the Cover % box fits
    check('no page errors (Bet log)', !S.errs.length, S.errs); await S.ctx.close(); }
  { const NOW=Date.parse('2026-11-11T18:00:00Z');
    for(const W of [390,1000,1280,1960]){ S=await open(b,{NOW,day:'2026-11-11',W,log:[{id:'x',key:'x',sport:'NFL',kind:'prop',book:'Bovada',odds:'+100',stake:2,date:'2026-11-11',dateSet:true,manual:true,game:'NYJ @ MIA',name:'Wide',side:'O',market:'0.5 Defense Sacks',betnow:'O 0.5 +100',fair:'',result:'pending',start:iso(NOW+3600e3)}]});
      await S.p.click('.tab[data-view="v-log"]'); await S.p.waitForTimeout(300); await S.p.click('#logBody button.kill.edit[data-i="0"]'); await S.p.waitForTimeout(250);
      const g=await S.p.evaluate(()=>{ const i=document.querySelector('#logBody tr.editor .eb-cover'), r=i.getBoundingClientRect(); return {vis:r.width>0 && r.height>0, right:r.right, iw:innerWidth, over:document.documentElement.scrollWidth-innerWidth}; });
      check(W+' px: the Cover % box shows in the editor, inside the screen, no sideways scroll', g.vis && g.right<=g.iw && g.over<=0, g);
      check('no page errors ('+W+')', !S.errs.length, S.errs); await S.ctx.close(); } }
  // ================= 7: a Novig fill read the morning after (Alonzo: Paul George and Wendell Carter Jr., placed Tue 11:59 AM, shown "bet 11/11, 7:25 AM · game unknown") =================
  { const NOW=Date.parse('2026-11-11T15:00:00Z');   // Wed 9:00 AM CT
    const PL=Date.parse('2026-11-10T18:01:00Z'), READ=Date.parse('2026-11-11T13:25:00Z');   // placed Tue 12:01 PM CT; the app read the fill Wed 7:25 AM CT
    const LOG=[{id:'pg',key:'pg',sport:'NBA',kind:'prop',book:'Novig',autoFrom:'novig',fills:['ff1ca85d3d9f'],odds:'-108',fair:'-105',stake:1,date:'2026-11-10',dateSet:true,game:'',wrongGame18:'BOS @ PHI',name:'Paul George',side:'U',market:'23.5 Pts+Reb',betnow:'U 23.5 -108',placedAt:iso(PL),snap:{at:iso(READ)},start:null}];
    S=await open(b,{NOW,day:'2026-11-11',log:LOG}); await S.p.waitForTimeout(1500);
    const g=await S.p.evaluate(()=>{ const L=logged.find(x=>x.id==='pg'); return {game:L.game, wrong:L.wrongGame18||null, edits:(L.edits||[]).length}; });
    check('the bet placed Tue 12:01 PM gets its game (BOS @ PHI) back, so ESPN can grade it; the change is recorded', g.game==='BOS @ PHI' && !g.wrong && g.edits===1, g);
    await S.p.click('.tab[data-view="v-log"]'); await S.p.waitForTimeout(300);
    const txt=await S.p.evaluate(()=>document.getElementById('logBody').textContent.replace(/\s+/g,' '));
    check('the Bet log says "bet 11/10, 12:01 PM" (when you placed it), not 11/11, 7:25 AM, and no longer "game unknown"', /bet 11\/10, 12:01 PM/.test(txt) && !/bet 11\/11, 7:25/.test(txt) && !/game unknown · the book/.test(txt), txt.slice(0,300));
    check('no page errors (fill read late)', !S.errs.length, S.errs); await S.ctx.close(); }
  await b.close(); console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(fail?1:0); })();
