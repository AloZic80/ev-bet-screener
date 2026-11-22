// node tests/v526-limits-test.js — v5.26 (Build B, owner "BUILD ALL" 11/22): the limits on a stake, applied everywhere (no limit's size changed).
// STAKE-1 the game cap holds over the board's own rows of one game (best first, same team and side 1.5x) and with nothing logged.
// STAKE-5 a free bet in the Bet log counts $0 toward the daily max and the game cap when stakes are sized (board, + Add a bet, Easy).
// STAKE-2 + Add a bet sizes like the board: the bet's own game day, long-shot moneylines, one bet per player, the moneyline gap rule, the model-only count.
// STAKE-3 the bet form's "recommended at this price" says $0 and the board's reason on a card the board gave $0 for a limit.
// STAKE-4 / EASY6-1 Easy's "About $X or more lists at least one pick" never names an amount at or under the one set aside, nor one where nothing lists.
// Settings in this file: $1,000 set aside: quarter Kelly on half the edge, $1 to $10 bets, $100 a day (10%), $20 a game (2%). Worked out by hand below.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,700)); };
const NOW=Date.parse('2026-11-10T19:00:00Z'), iso=ms=>new Date(ms).toISOString(), DAY='2026-11-10', TMRW='2026-11-11', KO=Date.parse('2026-11-11T01:15:00Z');
const T=(ha,abbr,loc,nick)=>({ha,id:abbr,abbr,name:loc+' '+nick,loc,nick,logo:'',rec:'',color:'333333',alt:'ffffff'});
const L='ABCDEFGH', GI=g=>({state:'pre',startISO:iso(KO+g*20*60e3),eventId:'40200'+g,timeCT:'',detail:'',teams:[T('away','AW'+L[g],'Awayville','Aways'),T('home','HM'+L[g],'Hometown','Homes')]});
const am=p=>p>=0.5?String(Math.round(-100*p/(1-p))):'+'+Math.round(100*(1-p)/p);
const prop=(id,name,market,p,fair,mkt,g,book,o)=>Object.assign({name,team:'AW'+L[g],game:'AW'+L[g]+' @ HM'+L[g],matchup:'AW'+L[g]+' @ HM'+L[g],side:'O',sport:'NHL',market,kind:'prop',book:book||'Novig',offeredRaw:am(p),offeredProb:p,fairProb:fair,fairRaw:am(fair),mktProb:mkt,stars:4,evModel:'projection',projValue:2,gameInfo:GI(g),src:'api:NHL:props',apiKey:id,loadedAt:iso(NOW-60e3)},o||{});
const logBet=(id,o)=>Object.assign({id, key:id, sport:'NHL', kind:'prop', book:'DraftKings', odds:'-110', stake:10, date:DAY, start:iso(KO+7*20*60e3), game:'AWH @ HMH', name:'Zed Zero '+id, side:'O', market:'0.5 Points', betnow:'O 0.5', snap:{at:iso(NOW-3600e3)}}, o);
async function open(b, o){ o=o||{};
  const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:1280,height:900}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(([R,d,Lg,bank,easy])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig, Kalshi, DraftKings, Polymarket',bank:String(bank),cfgVer:3.03}));
    localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows:R})); if(Lg) localStorage.setItem('mbev.log',JSON.stringify(Lg)); if(easy) localStorage.setItem('mbev.easy','{"welcomed":1}'); }catch(e){} }, [o.rows||[],DAY,o.log||null,o.bank||1000,!!o.easy]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1400);
  const rows=()=>p.evaluate(()=>lastRows.map(r=>({k:r.apiKey, stake:+(+r.stake||0).toFixed(2), capBy:r.capBy||null, warn:(r.flags||[]).filter(f=>f[0]==='warn'||f[0]==='corr').map(f=>f[1]).join(' | ')})));
  return {ctx,p,errs,rows};
}
(async()=>{
  const b=await chromium.launch(); const allErrs=[];
  // ---------- STAKE-1 (a): five props on five players of ONE game, nothing logged. Price 56%, model 63%, market 64%: her chance min(63, 64 − 0.35) = 62.65%,
  // EV 62.65 ÷ 56 − 1 = +11.9%: Kelly 1000 × 0.25 × 0.0595 ÷ 0.786 = $18.92, held to the $10 largest bet. Cap $20 a game. All five are the same team, Over:
  // first $10; second: room min(20 − 10 × 1.5, 20 − 10) = $5; third: min(20 − 15 × 1.5, 20 − 15) < 0 → $0 with "game cap reached". Total $15 (it was $50).
  { const NM=['Alan Ace','Bo Beck','Cy Cruz','Del Dunn','Eli Eck'], R=['a','b','c','d','e'].map((k,i)=>prop('g'+k,NM[i],(0.5+i)+' Shots',0.56,0.63,0.64,1));
    const S=await open(b,{rows:R}); const X=await S.rows(), sum=+X.reduce((t,x)=>t+x.stake,0).toFixed(2);
    check('STAKE-1: five $10 props on one game, nothing logged, under a $20 cap: $15 in all ($10 + $5, the same team and side count 1.5×), not $50', sum===15 && X.filter(x=>x.stake>0).length===2, X.map(x=>[x.k,x.stake,x.capBy]));
    check('STAKE-1: the rows left out say "game cap reached"', X.filter(x=>!(x.stake>0)).length===3 && X.filter(x=>!(x.stake>0)).every(x=>/game cap reached/.test(x.warn)), X.map(x=>x.warn.slice(0,90)));
    const ez=await S.p.evaluate(()=>{ try{ const L=easyList(0.60); return L.picks.map(x=>x.r.apiKey); }catch(e){ return 'err '+e.message; } });
    check('STAKE-1: Easy lists no more on the game than the board stakes', Array.isArray(ez) && ez.length<=2, ez);
    allErrs.push(...S.errs); await S.ctx.close(); }
  // ---------- STAKE-1 (b): $200 set aside (cap $4), one prop: price 70.19%, model 75.89%, market 78.25%: Kelly $4.78 → held to the $4.00 cap (it was $4.78)
  { const S=await open(b,{bank:200, rows:[prop('one','Solo Single','0.5 Points',0.7019,0.7589,0.7825,2)]}); const X=await S.rows();
    check('STAKE-1: with $200 set aside one bet is held to the $4.00 game cap (it was $4.78)', X[0] && X[0].stake===4 && X[0].capBy==='game', X);
    allErrs.push(...S.errs); await S.ctx.close(); }
  // ---------- STAKE-5: a $95 🎁 free bet logged on today's games, then a prop worth $10: the day has $100 of room, so $10 (it was $5, "daily max")
  { const S=await open(b,{rows:[prop('fr','Fred Free','1.5 Shots',0.50,0.55,0.56,2)], log:[logBet('free95',{stake:95, free:true})]}); const X=await S.rows();
    check('STAKE-5: a free bet counts $0 toward the daily max when the board sizes: $10, not $5', X[0] && X[0].stake===10, X);
    // the game cap: a $15 free bet on the same game (AWC @ HMC) leaves the whole $20, so $10 (it was $5)
    allErrs.push(...S.errs); await S.ctx.close(); }
  { const S=await open(b,{rows:[prop('fg','Gil Game','1.5 Shots',0.50,0.55,0.56,2)], log:[logBet('free15',{stake:15, free:true, game:'AWC @ HMC', start:iso(KO+2*20*60e3), name:'Other Guy', team:'HMC'})]}); const X=await S.rows();
    check('STAKE-5: a free bet counts $0 toward the game cap: $10, not $5', X[0] && X[0].stake===10, X);
    const ab=await S.p.evaluate(()=>{ const r=abStake({fair:0.55, mkt:0.56, p:0.50, fee:0, book:'DraftKings', game:'AWC @ HMC'}); return {s:r.s, notes:r.notes}; });
    check('STAKE-5: + Add a bet counts the free bet $0 too: $10', ab.s===10, ab);
    allErrs.push(...S.errs); await S.ctx.close(); }
  // ---------- STAKE-2: + Add a bet (abStake, called as the form calls it)
  { const LOG=[logBet('held',{name:'Adam Able', game:'AWD @ HMD', team:'AWD', start:iso(KO+3*20*60e3), market:'0.5 Points', stake:3}),
      logBet('today100',{stake:100})];
    const S=await open(b,{rows:[prop('x','Board Filler','0.5 Shots',0.50,0.52,0.52,5)], log:LOG});
    const A=await S.p.evaluate(([DAY,TMRW])=>{ const o=(x)=>Object.assign({fee:0, book:'Novig', outLimit:false, sport:'NHL'}, x);
      // (1) away moneyline at 33.0%, model 36%, market 37.04% (+170): her chance min(36, 37.04 − 0.36) = 36% < 45%: a long shot: the smallest bet, $1.00 (board: $1, 1 of 3)
      const ls=abStake(o({fair:0.36, mkt:0.3704, p:0.33, kind:'moneyline', name:'AWE', team:'AWE', game:'AWE @ HME', day:TMRW}));
      const lsNo=abStake(o({fair:0.36, mkt:null, noMkt:true, p:0.33, kind:'moneyline', name:'AWE', team:'AWE', game:'AWE @ HME', day:TMRW}));
      // (2) Adam Able Over 1.5 Shots at +100 (50%), model 55%, market 55.95% (-127): $10 by Kelly, but the log holds Adam Able in that game: $0, PLAYER EXPOSURE
      const held=abStake(o({fair:0.55, mkt:0.5595, p:0.50, kind:'prop', name:'Adam Able', team:'AWD', game:'AWD @ HMD', day:DAY}));
      // (3) the same kind of prop on tomorrow's game, with $100 logged on today's: tomorrow has its own $100: $10 (it was $0, "trimmed to your daily max")
      const tm=abStake(o({fair:0.55, mkt:0.5595, p:0.50, kind:'prop', name:'New Guy', team:'AWF', game:'AWF @ HMF', day:TMRW}));
      const td=abStake(o({fair:0.55, mkt:0.5595, p:0.50, kind:'prop', name:'New Guy', team:'AWF', game:'AWF @ HMF', day:DAY}));
      // (4) a moneyline with the model 9 points above the market: research only, $0 (it was $1.00)
      const gap=abStake(o({fair:0.55, mkt:0.46, p:0.44, kind:'moneyline', name:'AWG', team:'AWG', game:'AWG @ HMG', day:TMRW}));
      return {ls:[ls.s, (ls.notes||[]).join(' ')], lsNo:[lsNo.s, lsNo.why], held:[held.s, held.why], tm:[tm.s, (tm.notes||[]).join(' ')], td:[td.s, td.why], gap:[gap.s, gap.why]}; }, [DAY,TMRW]);
    check('STAKE-2: a long-shot moneyline (her 36%) is held to the smallest bet, $1.00, "1 of 3" (it was $5.59)', A.ls[0]===1 && /long-shot moneyline: the smallest bet \(1 of 3/.test(A.ls[1]), A.ls);
    check('STAKE-2: a long-shot moneyline with no market price: $0, not offered', A.lsNo[0]===0 && /LONG-SHOT ML · no market price/.test(A.lsNo[1]), A.lsNo);
    check('STAKE-2: a second bet on a player you hold in that game: $0, "PLAYER EXPOSURE · already hold Able Over 0.5 Points" (it was $10)', A.held[0]===0 && /PLAYER EXPOSURE · already hold Able Over 0\.5 Points: no additional stake/.test(A.held[1]), A.held);
    check('STAKE-2: a bet on tomorrow’s game takes tomorrow’s room: $10 with $100 logged today (it was $0)', A.tm[0]===10, A.tm);
    check('STAKE-2: a bet on today’s games with today full: $0, trimmed to the daily max', A.td[0]===0 && /daily max/.test(A.td[1]||''), A.td);
    check('STAKE-2: a moneyline with the model 9 points above the market: $0, MONEYLINE GAP RESEARCH (it was $1.00)', A.gap[0]===0 && /MONEYLINE GAP RESEARCH/.test(A.gap[1]||''), A.gap);
    allErrs.push(...S.errs); await S.ctx.close(); }
  { // 3 long-shot moneylines logged for tomorrow, and 5 bets with no market check: the 4th long shot and the 6th model-only bet get $0
    const ml=(id,team,g)=>logBet(id,{kind:'moneyline', name:team, team, market:'Moneyline', side:null, betnow:team+' ML', odds:'+200', stake:1, date:TMRW, start:iso(KO+24*3600e3+g*600e3), game:team+' @ HM'+id, snap:{at:iso(NOW-3600e3), act:0.35}});
    const mo=(id)=>logBet(id,{name:'Model Only '+id, stake:1, date:TMRW, start:iso(KO+24*3600e3), game:'AW'+id+' @ HM'+id, snap:{at:iso(NOW-3600e3), modelOnly:true}});
    const S=await open(b,{rows:[prop('x','Board Filler','0.5 Shots',0.50,0.52,0.52,5)], log:[ml('m1','AAA',1), ml('m2','BBB',2), ml('m3','CCC',3), mo('o1'), mo('o2'), mo('o3'), mo('o4'), mo('o5')]});
    const A=await S.p.evaluate(TMRW=>{ const o=(x)=>Object.assign({fee:0, book:'Novig', outLimit:false, sport:'NHL'}, x);
      const ls=abStake(o({fair:0.36, mkt:0.3704, p:0.33, kind:'moneyline', name:'AWE', team:'AWE', game:'AWE @ HME', day:TMRW}));
      const m6=abStake(o({fair:0.55, mkt:null, noMkt:true, p:0.50, kind:'prop', name:'Sixth Guy', team:'AWF', game:'AWF @ HMF', day:TMRW}));
      return {ls:[ls.s, ls.why], m6:[m6.s, m6.why]}; }, TMRW);
    check('STAKE-2: the 4th long-shot moneyline of the game day: $0, "LONG-SHOT ML limit reached (3 a game day)"', A.ls[0]===0 && /LONG-SHOT ML limit reached \(3 a game day\)/.test(A.ls[1]||''), A.ls);
    check('STAKE-2: the 6th bet of the day with no market check: $0, "model-only limit reached (5 a day …)" (it was $1.00)', A.m6[0]===0 && /model-only limit reached \(5 a day/.test(A.m6[1]||''), A.m6);
    allErrs.push(...S.errs); await S.ctx.close(); }
  // ---------- STAKE-3: $100 logged on today's games: the board gives every card $0 ("daily max reached"); the bet form must not say $10
  { const S=await open(b,{rows:[prop('dm','Dana Daymax','1.5 Shots',0.50,0.55,0.56,2)], log:[logBet('full',{stake:100})]});
    const X=await S.rows();
    const ed=await S.p.evaluate(async()=>{ const r=lastRows.find(x=>x.apiKey==='dm'), tr=document.createElement('tr'); document.getElementById('logBody').appendChild(tr); openBetEditor(tr, r, {cols:11}); await new Promise(z=>setTimeout(z,150));
      const e=tr.querySelector('.editor')||document.querySelector('.editor'); const rec=e?e.querySelector('.eb-rec').textContent:null;
      let rec2=null; if(e){ const oi=e.querySelector('.eb-odds'); if(oi){ oi.value='+110'; oi.dispatchEvent(new Event('input',{bubbles:true})); await new Promise(z=>setTimeout(z,80)); rec2=e.querySelector('.eb-rec').textContent; } }
      return {rec, rec2}; });
    check('STAKE-3: the board gave the card $0 for the daily max', X[0] && X[0].stake===0 && /daily max reached/.test(X[0].warn), X);
    check('STAKE-3: the form says "recommended at this price: $0.00 · the board: daily max reached …" (it said $10.00)', ed.rec && /recommended at this price: \$0\.00 · the board: daily max reached/.test(ed.rec), ed);
    check('STAKE-3: a better price typed does not lift a limit: still $0.00', ed.rec2 && /\$0\.00/.test(ed.rec2), ed.rec2);
    allErrs.push(...S.errs); await S.ctx.close(); }
  // ---------- STAKE-4 / EASY6-1: $60 set aside; the same prop at Kalshi 62¢ (her EV +5.9%: under $1 at $60) and Novig 60¢ (a model-EV outlier, held to $1,
  // never listed by Easy). The board keeps one bet per player, the better EV (Novig), so the Kalshi pick never lists at any amount: no "About $X" sentence
  // (it said "About $50 or more", under the $60 already set aside, where nothing lists)
  { const S=await open(b,{bank:60, easy:true, rows:[prop('k','Gus Gray','0.5 Assists',0.62,0.70,0.66,0,'Kalshi'), prop('n','Gus Gray','0.5 Assists',0.60,0.70,0.66,0,'Novig')]});
    await S.p.evaluate(()=>easySetLevel('easy')); await S.p.waitForTimeout(600);
    const N=await S.p.evaluate(()=>{ const n=easyListNoStake(0.60); return {min:n.min, need:n.need, bank:cfgRead().bank}; });
    check('STAKE-4: Easy never names an amount at or under the money set aside ($60): no sentence here, since the other book takes the one-per-player place', N.need===null || N.need>N.bank, N);
    if(N.need!=null){ await S.p.evaluate(v=>{ const e=document.getElementById('bank'); e.value=String(v); e.dispatchEvent(new Event('input',{bubbles:true})); e.dispatchEvent(new Event('change',{bubbles:true})); }, N.need); await S.p.waitForTimeout(300);
      const n2=await S.p.evaluate(()=>easyList(0.60).total); check('STAKE-4: at the amount named, Easy lists a pick', n2>=1, {need:N.need, listed:n2}); }
    allErrs.push(...S.errs); await S.ctx.close(); }
  // a plain case still names an amount above the one set aside: one Kalshi prop, her EV +5.9%, $1 at about $... (whatever it is, above $60 and Easy lists it there)
  { const S=await open(b,{bank:60, easy:true, rows:[prop('k1','Kay Kaplan','0.5 Assists',0.62,0.70,0.66,0,'Kalshi')]});
    await S.p.evaluate(()=>easySetLevel('easy')); await S.p.waitForTimeout(600);
    const N=await S.p.evaluate(()=>{ const n=easyListNoStake(0.60); return {min:n.min, need:n.need, bank:cfgRead().bank}; });
    let listed=null; if(N.need!=null){ await S.p.evaluate(v=>{ const e=document.getElementById('bank'); e.value=String(v); e.dispatchEvent(new Event('input',{bubbles:true})); e.dispatchEvent(new Event('change',{bubbles:true})); }, N.need); await S.p.waitForTimeout(300); listed=await S.p.evaluate(()=>easyList(0.60).total); }
    check('EASY6-1: one pick under $1: the amount named is above $60 and lists it', N.min===1 && N.need>60 && listed>=1, Object.assign(N,{listed}));
    allErrs.push(...S.errs); await S.ctx.close(); }
  check('no page errors', !allErrs.length, allErrs.slice(0,5));
  await b.close(); console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(fail?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
