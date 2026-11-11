// node tests/import-v2-test.js — v4.70 (Alonzo: "BUILD import"): the bet-import file, version 2. It also takes moneylines, spreads and totals,
// tickets already settled (result and profit as the book shows them), free and bonus bets, parlays written as text, and fixes to bets already in
// the log (applied only when exactly one bet matches, old values kept in the bet's edits). And Polymarket wins keep the payout after its fee.
// Every expected number is worked here by hand.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,700)); };
const NOW=Date.parse('2026-11-11T18:00:00Z');
const bet=(id,o)=>Object.assign({id,key:id,sport:'NHL',kind:'prop',book:'Novig',odds:'-122',fair:'',stake:3.34,date:'2026-10-29',dateSet:true,manual:true,name:'Player '+id,side:'O',market:'1.5 Shots',betnow:'O 1.5 -122',result:'win',gradedBy:'manual',snap:{at:'2026-10-29T15:00:00Z'},start:null},o);
const LOG=[bet('z',{name:'Fabian Zetterlund'}),                                                          // fix: $4.09, won $3.29
  bet('t',{name:'Brice Turang',sport:'MLB',odds:'+126',stake:0.99,date:'2026-10-26'}),                     // fix: won → lost
  bet('w1',{name:'Jaylen Warren',book:'DK Predictions',stake:3.04,date:'2026-10-25',result:'loss'}),       // fix only the DK one
  bet('w2',{name:'Jaylen Warren',book:'Novig',stake:2.85,date:'2026-10-25'}),
  bet('d1',{name:'Twin',stake:1,date:'2026-11-02'}), bet('d2',{name:'Twin',stake:1,date:'2026-11-02'}),    // two match: left for you
  {id:'pc',key:'pc',kind:'parlay',date:'2026-11-08',dateSet:true,start:null,name:'Novig combo · 2 picks',sport:'PARLAY',market:'2-pick parlay',book:'Novig',odds:'+56',fair:'',stake:5,result:'win',towin:2.81,closing:'',parlay:{picks:2,legs:'',pays:{all:7.81},payout:7.81}},
  // Polymarket win graded by the book with no fee: $1.00 at +317 shows +$3.17; Polymarket reports pnl 2.95 on a $1.00 position
  bet('pm',{name:'Indiana Pacers',kind:'moneyline',sport:'NBA',book:'Polymarket US',odds:'+317',stake:1,date:'2026-11-04',market:'Moneyline',side:'',fillBook:'poly',fillRef:'nba-ind-x',fillSide:'yes',gradedBy:'book'})];
const DOC={type:'augi-bet-import',v:2,importId:'t1',singles:[
  {day:'2026-10-31',book:'FD Predicts',kind:'spread',sport:'NCAAF',team:'Oregon',point:-3.5,stake:2.75,americanOdds:-114,result:'win',profit:2.25,free:true},      // bonus: $0 of yours, +$2.25
  {day:'2026-11-01',book:'FD Predicts',kind:'total',sport:'NFL',game:'KC @ DEN',outcome:'Under',point:41.5,stake:4.59,americanOdds:104,result:'loss',profit:0,free:true}, // bonus loss: $0
  {day:'2026-10-31',book:'DraftKings',kind:'spread',sport:'NCAAF',team:'UNLV',point:-21.5,stake:2.12,americanOdds:-113,result:'loss',profit:-2.12},
  {day:'2026-11-08',book:'Novig',kind:'moneyline',sport:'NBA',team:'Bulls',stake:1.23,americanOdds:365,result:'loss',profit:-1.23},
  {day:'2026-10-26',book:'Novig',kind:'prop',sport:'NHL',player:'Evan Bouchard',market:'Shots On Goal',outcome:'Over',point:2.5,stake:1.16,americanOdds:-120,result:'sold',profit:-0.05},
  {day:'2026-11-12',book:'Novig',kind:'moneyline',sport:'NBA',team:'Knicks',stake:1,americanOdds:-150}],                                                          // open: no result
  parlays:[{day:'2026-10-24',platform:'DraftKings',picks:3,legsText:'Arch Manning 1.5 Yes; Trinidad Chambliss 1.5 Yes; Arch Manning 229.5 Yes',stake:4.81,quotedPayout:26.72,result:'loss',profit:-4.81}],
  fixes:[{day:'2026-10-29',book:'Novig',name:'Zetterlund',stake:3.34,set:{stake:4.09,result:'win',profit:3.29},note:'JuiceReel'},
    {day:'2026-10-26',book:'Novig',name:'Turang',stake:0.99,set:{result:'loss'}},
    {day:'2026-10-25',book:'DK',name:'Warren',stake:3.04,set:{stake:2.75,odds:'-122',result:'loss'}},
    {day:'2026-11-02',book:'Novig',name:'Twin',stake:1,set:{result:'loss'}},
    {day:'2026-11-08',book:'Novig',name:'combo',stake:5,set:{result:'win',profit:2.56}},
    {day:'2026-11-09',book:'Novig',name:'Nobody',stake:1,set:{result:'loss'}}]};
async function open(b,W){ const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:W,height:1000}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(L=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.log',JSON.stringify(L)); }catch(e){} }, LOG);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1200); return {ctx,p,errs}; }
const load=async p=>{ await p.setInputFiles('#lcFile',{name:'bets.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(DOC))}); await p.waitForTimeout(400); };
(async()=>{ const b=await chromium.launch();
  let {ctx,p,errs}=await open(b,1280);
  check('a version 1 file is still read (one prop single)', await p.evaluate(()=>lcParse({type:'augi-bet-import',v:1,singles:[{day:'2026-11-01',book:'Novig',player:'A',market:'Points',outcome:'Over',point:9.5,stake:1,quotedPayout:2}],parlays:[]}).tickets.length===1), null);
  check('a version 1 file cannot carry results (they are ignored)', await p.evaluate(()=>!lcParse({type:'augi-bet-import',v:1,singles:[{day:'2026-11-01',book:'Novig',player:'A',market:'Points',outcome:'Over',point:9.5,stake:1,quotedPayout:2,result:'win',profit:1}],parlays:[]}).tickets[0].result), null);
  await load(p);
  const msg=await p.evaluate(()=>document.getElementById('lcImpMsg').textContent);
  check('the file reads "6 singles and 1 parlay and 6 fixes"', /^6 singles and 1 parlay and 6 fixes read/.test(msg), msg);
  const fx=await p.evaluate(()=>[...document.querySelectorAll('#lcImpList .lc-fix')].map(x=>({t:x.textContent.replace(/\s+/g,' ').trim(), on:x.querySelector('.lc-on').checked, dis:x.querySelector('.lc-on').disabled})));
  check('fixes that match exactly one bet start ticked; "Twin" (two bets) and "Nobody" (none) are disabled with the reason', fx.filter(f=>f.on).length===4 && /more than one bet matches/.test(fx[3].t) && fx[3].dis && /no bet matches/.test(fx[5].t) && fx[5].dis, fx.map(f=>f.t.slice(0,90)));
  check('the Zetterlund fix lists what it changes', /Fix Zetterlund · 2026-10-29 · Novig · \$3\.34: result win, stake \$4\.09, profit \+\$3\.29/.test(fx[0].t), fx[0].t);
  await p.evaluate(()=>document.getElementById('lcImpSave').click()); await p.waitForTimeout(400);
  const m2=await p.evaluate(()=>document.getElementById('lcImpMsg').textContent);
  check('save: "Saved 7 tickets to your Bet log · fixed 4 bets · 2 left out. 1 have no result yet"', /^Saved 7 tickets to your Bet log · fixed 4 bets · 2 left out\. 1 have no result yet/.test(m2), m2);
  const R=await p.evaluate(()=>{ const f=n=>logged.find(b=>b.name===n); const P=b=>b?betProfit(b):null;
    return {oregon:{free:!!f('Oregon').free, p:P(f('Oregon')), kind:f('Oregon').kind, mkt:f('Oregon').market}, kc:{p:P(f('KC @ DEN')), mkt:f('KC @ DEN').market, side:f('KC @ DEN').side},
      unlv:P(f('UNLV')), bulls:{p:P(f('Bulls')), mkt:f('Bulls').market}, bouch:{p:P(f('Evan Bouchard')), mkt:f('Evan Bouchard').market}, knicks:{res:f('Knicks').result||null, p:P(f('Knicks'))},
      par:(()=>{ const x=logged.find(b=>b.kind==='parlay' && b.date==='2026-10-24'); return {p:P(x), legs:x.parlay.legs, picks:x.parlay.picks}; })(),
      z:{st:f('Fabian Zetterlund').stake, p:P(f('Fabian Zetterlund')), ed:(f('Fabian Zetterlund').edits||[]).map(e=>[e.before.stake,e.note])}, t:{res:f('Brice Turang').result, p:P(f('Brice Turang'))},
      w1:{st:logged.find(b=>b.id==='w1').stake, odds:logged.find(b=>b.id==='w1').odds, p:P(logged.find(b=>b.id==='w1'))}, w2:{st:logged.find(b=>b.id==='w2').stake, ed:(logged.find(b=>b.id==='w2').edits||[]).length},
      twins:logged.filter(b=>b.name==='Twin').map(b=>b.result), combo:P(logged.find(b=>b.id==='pc')) }; });
  check('Oregon −3.5 (bonus): saved as a spread, free, profit +$2.25 (FanDuel’s bonus pays the winnings only)', R.oregon.free && R.oregon.p===2.25 && R.oregon.kind==='spread' && R.oregon.mkt==='-3.5 Spread', R.oregon);
  check('KC @ DEN Under 41.5 (bonus, lost): a total, Under, costs you $0', R.kc.p===0 && R.kc.mkt==='41.5 Total' && R.kc.side==='U', R.kc);
  check('UNLV −21.5 lost −$2.12; Bulls moneyline lost −$1.23; Bouchard cashed out −$0.05', R.unlv===-2.12 && R.bulls.p===-1.23 && R.bulls.mkt==='Moneyline' && R.bouch.p===-0.05 && R.bouch.mkt==='2.5 Shots On Goal', {unlv:R.unlv, bulls:R.bulls, bouch:R.bouch});
  check('Knicks (no result in the file): saved open, no profit yet', (R.knicks.res==null || R.knicks.res==='pending') && R.knicks.p==null, R.knicks);
  check('the DraftKings parlay written as text: 3 picks, lost −$4.81', R.par.p===-4.81 && R.par.picks===3 && /Arch Manning 1\.5 Yes/.test(R.par.legs), R.par);
  check('fix: Zetterlund is $4.09 and +$3.29, the old $3.34 kept in its edits', R.z.st===4.09 && R.z.p===3.29 && R.z.ed.length===1 && R.z.ed[0][0]===3.34 && /import fix: JuiceReel/.test(R.z.ed[0][1]), R.z);
  check('fix: Turang becomes a loss, −$0.99', R.t.res==='loss' && R.t.p===-0.99, R.t);
  check('fix by book: the DraftKings Warren is $2.75 at −122 (−$2.75); the Novig Warren is untouched', R.w1.st===2.75 && R.w1.odds==='-122' && R.w1.p===-2.75 && R.w2.st===2.85 && R.w2.ed===0, {w1:R.w1, w2:R.w2});
  check('the two "Twin" bets are not touched (more than one matched)', R.twins.every(x=>x==='win'), R.twins);
  check('fix on a parlay: the Novig combo pays +$2.56 (was +$2.81)', R.combo===2.56, R.combo);
  await load(p); const again=await p.evaluate(()=>({m:document.getElementById('lcImpMsg').textContent, fixOn:[...document.querySelectorAll('#lcImpList .lc-fix .lc-on')].filter(x=>!x.disabled).length, t:document.getElementById('lcImpList').textContent}));
  check('loading the same file again: all 7 tickets are "already in your log" and no fix applies twice (each says "already done" or no longer matches)', /7 already in your log/.test(again.m) && again.fixOn===0 && /already done/.test(again.t), again);
  // Polymarket fee: $1.00 at +317 = +$3.17 at the price; the settlement says pnl 2.95 on a $1.00 position
  const pm=await p.evaluate(()=>{ const b=logged.find(x=>x.id==='pm'), before=betProfit(b); window._settlements=[{book:'poly',ref:'nba-ind-x',side:'yes',outcome:'win',cost:1,pnl:2.95,payout:3.95}];
    const S=settlementFor(b), did=polyPaid(b,S); const once=polyPaid(b,S); return {before, after:betProfit(b), did, once, src:b.towinSrc}; });
  check('Polymarket win: +$3.17 at the price becomes +$2.95, what Polymarket paid after its fee; only once', pm.before===3.17 && pm.after===2.95 && pm.did && !pm.once && pm.src==='book', pm);
  const half=await p.evaluate(()=>{ const b={result:'win', stake:0.5}; polyPaid(b,{book:'poly',outcome:'win',cost:2,pnl:4}); return b.towin; });
  check('two bets on one Polymarket position share its profit by stake: $0.50 of a $2.00 position gets $1.00 of $4.00', half===1, half);
  const typed=await p.evaluate(()=>{ const b={result:'win', stake:1, towin:3.10}; return polyPaid(b,{book:'poly',outcome:'win',cost:1,pnl:2.95})||b.towin; });
  check('winnings you typed are never replaced', typed===3.1, typed);
  check('no page errors', !errs.length, errs); await ctx.close();
  for(const W of [390,1000,1960]){ ({ctx,p,errs}=await open(b,W)); await load(p);
    const g=await p.evaluate(()=>{ const d=document.querySelector('.lc-impbox'); if(d) d.open=true; const el=document.getElementById('lcImpList'); return {n:el.querySelectorAll('.lc-imp').length, over:document.documentElement.scrollWidth-innerWidth}; });
    check(W+' px: the 13 rows (7 tickets, 6 fixes) list without sideways scroll', g.n===13 && g.over<=0, g); check('no page errors ('+W+')', !errs.length, errs); await ctx.close(); }
  await b.close(); console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(fail?1:0); })();
