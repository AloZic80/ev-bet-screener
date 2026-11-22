// node tests/v526-inputs-test.js — v5.26 (Build B, owner "BUILD ALL" 11/22): prices typed or read, and which game a bet is.
// PRICES-1 + Add a bet's Consensus odds: an Other side box; the market is this side ÷ (both sides), only for a real book (over 98%, under 125%); one side
//          alone is no market check (said plainly); the other side is saved with the bet (snap.consensus.other_side).
// PRICES-2 What should I bet?: a thin exchange book (ask more than 10 points over its bid) does not set the fair chance.
// PRICES-3 the Odds box: a typographic minus is a minus; only EVEN, a %, a decimal above 1.00 or a whole American price of 100+ is a price.
// PRICES-4 a game with a Draw: the two team moneylines are not "both sides".
// EV-3     "also at" prices a FanDuel Predicts row with its fee (its real book, not the label "FD Predicts").
// R2-2     a start saved hours off: the nearest game only when it is clearly the nearest (within 12 h, the next one at least twice as far).
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,700)); };
const NOW=Date.parse('2026-11-10T19:00:00Z'), iso=ms=>new Date(ms).toISOString(), DAY='2026-11-10', KO=Date.parse('2026-11-11T01:15:00Z');
const am=p=>p>=0.5?String(Math.round(-100*p/(1-p))):'+'+Math.round(100*(1-p)/p);
const T=(ha,abbr,loc,nick)=>({ha,id:abbr,abbr,name:loc+' '+nick,loc,nick,logo:'',rec:'',color:'333333',alt:'ffffff'});
const GI=(g,a,h)=>({state:'pre',startISO:iso(KO+g*20*60e3),eventId:'40300'+g,timeCT:'',detail:'',teams:[T('away',a,'Away','A'),T('home',h,'Home','H')]});
const row=(o)=>Object.assign({side:'O',sport:'NHL',kind:'prop',book:'Novig',stars:4,evModel:'projection',src:'api:NHL:props',loadedAt:iso(NOW-60e3)},o,{offeredRaw:o.offeredRaw||am(o.offeredProb),fairRaw:am(o.fairProb)});
const ev=(id,date,away,home,as,hs)=>({id,date,status:{type:{state:'post',completed:true,name:'STATUS_FINAL',shortDetail:'Final'}},
  competitions:[{competitors:[{homeAway:'away',score:String(as),team:{abbreviation:away}},{homeAway:'home',score:String(hs),team:{abbreviation:home}}]}]});
async function open(b, o){ o=o||{};
  const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:1280,height:900}}); await ctx.clock.install({time:new Date(o.now||NOW)});
  await ctx.addInitScript(([R,d,Lg,books])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books,bank:'1000',cfgVer:3.03}));
    if(R) localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows:R})); if(Lg) localStorage.setItem('mbev.log',JSON.stringify(Lg)); }catch(e){} }, [o.rows||null,DAY,o.log||null,o.books||'Novig, Kalshi, DraftKings, Bovada']);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(o.live && /\/live\?/.test(u)) return r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(o.live(u))});
    if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'});
    if(/espn/.test(u)){ const a=o.espn&&o.espn(u); return r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(a||{events:[]})}); } return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1400);
  return {ctx,p,errs};
}
(async()=>{
  const b=await chromium.launch(); const allErrs=[];
  // ---------- PRICES-3: the Odds box reading ----------
  { const S=await open(b);
    const R=await S.p.evaluate(()=>['−110','–110','-110','+120','120','EVEN','52%','1.91','2.00','52','+99','-50','1,91','5/2','2','0.52','1.00',''].map(t=>[t, typeof oddsIn==='function'?oddsIn(t):'(no oddsIn)']));
    const m=Object.fromEntries(R);
    check('PRICES-3: a typographic minus (U+2212) or an en dash is a minus: −110 and –110 read -110 (they read +110)', m['−110']==='-110' && m['–110']==='-110', R.slice(0,2));
    check('PRICES-3: real prices still read: -110, +120, 120 → +120, EVEN, 52% → -108, 1.91 → -110, 2.00 → +100', m['-110']==='-110' && m['+120']==='+120' && m['120']==='+120' && m['EVEN']==='EVEN' && m['52%']==='-108' && m['1.91']==='-110' && m['2.00']==='+100', R.slice(2,9));
    check('PRICES-3: not prices, refused: 52, +99, -50, 1,91, 5/2, 2, 0.52, 1.00 (empty stays empty)', ['52','+99','-50','1,91','5/2','2','0.52','1.00'].every(k=>m[k]===null) && m['']==='', R.slice(9));
    allErrs.push(...S.errs); await S.ctx.close(); }
  // the real bet form on a board row: "−110" pasted is -110 (52.4%) in the value line, and "52" will not save
  { const RW=[row({name:'Ola Odds',market:'1.5 Shots',team:'AWA',game:'AWA @ HMA',matchup:'AWA @ HMA',book:'DraftKings',offeredProb:0.5,fairProb:0.5,mktProb:0.5,gameInfo:GI(1,'AWA','HMA'),apiKey:'oo'})];
    const S=await open(b,{rows:RW});
    const E=await S.p.evaluate(async()=>{ const r=lastRows.find(x=>x.apiKey==='oo'), tr=document.createElement('tr'); document.getElementById('logBody').appendChild(tr); openBetEditor(tr, r, {cols:11}); await new Promise(z=>setTimeout(z,150));
      const e=document.querySelector('.editor'), oi=e.querySelector('.eb-odds'), set=async v=>{ oi.value=v; oi.dispatchEvent(new Event('input',{bubbles:true})); await new Promise(z=>setTimeout(z,80)); return e.querySelector('.eb-check').textContent; };
      const dash=await set('−110'); await set('52'); const st=e.querySelector('.eb-stake'); if(st){ st.value='10'; st.dispatchEvent(new Event('input',{bubbles:true})); }
      const n0=logged.length; const sb=e.querySelector('.eb-save'); sb.dataset.ok='1'; sb.dataset.hs='1'; sb.dataset.lc='1'; sb.click(); await new Promise(z=>setTimeout(z,150));
      return {dash, saved:logged.length>n0, say:(e.querySelector('.eb-msg')||e).textContent.slice(0,400)}; });
    check('PRICES-3: in the bet form, a pasted "−110" is -110 = 52.4% (it read +110 = 47.6%)', /-110 = 52\.4%/.test(E.dash), E.dash);
    check('PRICES-3: "52" in the Odds box does not save, and says "Type the odds"', !E.saved && /Type the odds/.test(E.say), E);
    allErrs.push(...S.errs); await S.ctx.close(); }
  // ---------- PRICES-1: Consensus odds, both sides ----------
  { const S=await open(b);
    const C=await S.p.evaluate(()=>{ const set=(id,v)=>{ const e=document.getElementById(id); if(e) e.value=v; }, rd=()=>{ const f=abRowFields(); return {mkt:f.mktProb, cons:f.consOdds, other:f.consOtherOdds, why:f._cons}; };
      set('abCover','58'); set('abCons','-122'); set('abConsO','-102'); const both=rd();
      set('abConsO',''); const one=rd();
      set('abCons','-110'); set('abConsO','+300'); const bad=rd();
      set('abCons','−110'); set('abConsO','-110'); const even=rd();
      return {both, one, bad, even, box:!!document.getElementById('abConsO')}; });
    // -122 = 54.95%, -102 = 50.50%: 54.95 ÷ 105.45 = 52.11% (it was 54.95%, the vig still in)
    check('PRICES-1: an Other side box sits next to Consensus odds', C.box, C.box);
    check('PRICES-1: -122 with the other side at -102: market 52.11% (vig out), not 54.95%', Math.abs(C.both.mkt-0.5211)<0.0002 && C.both.cons==='-122' && C.both.other==='-102', C.both);
    check('PRICES-1: one side alone is not a market price (no market check), and says so (_cons one)', C.one.mkt===null && C.one.why==='one' && C.one.cons==='-122', C.one);
    check('PRICES-1: two sides that do not add to a real book (-110 and +300: 77%) are not used', C.bad.mkt===null && C.bad.why==='bad', C.bad);
    check('PRICES-1: a pasted typographic minus is read too: −110 / -110 → 50.0%', Math.abs(C.even.mkt-0.5)<1e-9, C.even);
    const sv=await S.p.evaluate(()=>{ addToLog(Object.assign(abRowFields(), {name:'Cons Saved', book:'DraftKings', offeredRaw:'-110', offeredProb:0.5238, stake:5, fee:0})); const L=logged[logged.length-1]; return L.snap.consensus; });
    check('PRICES-1: both consensus prices are saved with the bet (snap.consensus)', sv && sv.bet_side==='−110'.replace('−','-') && sv.other_side==='-110', sv);
    allErrs.push(...S.errs); await S.ctx.close(); }
  // ---------- PRICES-2: a thin exchange book does not set the fair chance ----------
  // Novig ask 50 / bid 49 (middle 49.5); Kalshi ask 65 / bid 43.5 (21.5 points wide: thin). Fair from the tight book alone: 49.5% (it was 51.88%, the average)
  { const S=await open(b,{live:u=>{ const D=JSON.parse(decodeURIComponent(u.split('bets=')[1])); const R={}; D.forEach(d=>{ if(/novig:me/.test(d.id)) R[d.id]={ok:true, price:0.50, bid:0.49}; else if(/kalshi:me/.test(d.id)) R[d.id]={ok:true, price:0.65, bid:0.435}; }); return {results:R}; }});
    const X=await S.p.evaluate(async()=>{ const set=(id,v)=>{ const e=document.getElementById(id); if(!e) return; if(e.tagName==='SELECT' && ![...e.options].some(o=>o.value===v)){ const o=document.createElement('option'); o.value=v; o.textContent=v; e.appendChild(o); } e.value=v; };
      document.querySelector('.tab[data-view="v-add"]').click(); await new Promise(z=>setTimeout(z,300));
      set('abSport','NBA'); set('abType','prop'); set('abGameFree','LAL @ BOS'); set('abPlayer','Thin Book'); set('abStat','Points'); set('abLine','24.5'); set('abPick','O');
      abX=null; await abAsk(true); return {mid:abX&&abX.mid, from:abX&&abX.from, f:(()=>{ const f=abRowFields(); return [f.kind,f.game,f.name,f.market,f.side]; })()}; });
    check('PRICES-2: the thin Kalshi book (65 / 43.5) is left out of the fair chance: 49.5% from Novig alone (it was 51.88%)', X.mid!=null && Math.abs(X.mid-0.495)<1e-9 && X.from==='Novig', X);
    allErrs.push(...S.errs); await S.ctx.close(); }
  // ---------- PRICES-4: a soccer game with a Draw ----------
  // Pinnacle-derived fair: Arsenal 49.30%, Chelsea 24.68%, Draw 26.02%. Bovada Arsenal +112 (47.17%): EV 49.30 ÷ 47.17 − 1 = +4.5%
  { const G={state:'pre',startISO:iso(KO),eventId:'50001',teams:[T('away','CHE','Chelsea','Blues'),T('home','ARS','Arsenal','Gunners')]};
    const s=(o)=>row(Object.assign({sport:'EPL', kind:'moneyline', market:'Moneyline', side:'', game:'Chelsea @ Arsenal', matchup:'Chelsea @ Arsenal', book:'Bovada', gameInfo:G, src:'api:EPL:odds'},o));
    const N={state:'pre',startISO:iso(KO+3600e3),eventId:'50002',teams:[T('away','LAL','Los Angeles','Lakers'),T('home','BOS','Boston','Celtics')]};
    const n=(o)=>row(Object.assign({sport:'NBA', kind:'moneyline', market:'Moneyline', side:'', game:'Los Angeles Lakers @ Boston Celtics', matchup:'Los Angeles Lakers @ Boston Celtics', book:'Bovada', gameInfo:N, src:'api:NBA:odds'},o));
    const RW=[s({name:'Arsenal',team:'ARS',offeredRaw:'+112',offeredProb:100/212,fairProb:0.4930,mktProb:0.4930,apiKey:'ars'}), s({name:'Chelsea',team:'CHE',offeredRaw:'+300',offeredProb:0.25,fairProb:0.2468,mktProb:0.2468,apiKey:'che'}), s({name:'Draw',team:'ARS',offeredRaw:'+275',offeredProb:1/3.75,fairProb:0.2602,mktProb:0.2602,apiKey:'drw'}),
      n({name:'Boston Celtics',team:'BOS',offeredRaw:'-135',offeredProb:135/235,fairProb:0.5851,mktProb:0.5851,apiKey:'bos'}), n({name:'Los Angeles Lakers',team:'LAL',offeredRaw:'+120',offeredProb:100/220,fairProb:0.4149,mktProb:0.4149,apiKey:'lal'})];
    const S=await open(b,{rows:RW});
    const X=await S.p.evaluate(()=>Object.fromEntries(lastRows.map(r=>[r.apiKey,{pass:r.pass, stake:r.stake, sum:r.pairSum==null?null:+r.pairSum.toFixed(4), out:(r.flags||[]).filter(f=>f[0]==='out').map(f=>f[1]).join(' | ').slice(0,120)}])));
    check('PRICES-4: Arsenal +112 in a game with a Draw is not paired with Chelsea ("both sides sum to 74%, juice left in")', X.ars && X.ars.sum===null && !/juice left in/.test(X.ars.out), X.ars);
    check('PRICES-4: it is judged on its own EV (+4.5%) and passes', X.ars && X.ars.pass===true, X.ars);
    check('PRICES-4: an NBA moneyline pair still pairs (both sides 100%)', X.bos && Math.abs(X.bos.sum-1)<0.001 && X.lal && Math.abs(X.lal.sum-1)<0.001, {bos:X.bos, lal:X.lal});
    allErrs.push(...S.errs); await S.ctx.close(); }
  // ---------- EV-3: also at, a FanDuel Predicts row ----------
  // Model 55%, market 54%: her chance 54.35%. Card at Kalshi 51¢. The same bet on the board at FanDuel Predicts 52¢. FanDuel Predicts' fee: 2% of the payout
  // = 0.02 ÷ 0.52 = 3.85% of the stake. OK up to: 54.35 ÷ (1.015 + 0.02) ... the row's own number is 51.55%; 52¢ is over it (it said OK ✓ up to 53.5%)
  { const G=GI(2,'AWB','HMB'), base={name:'Fay Predict',market:'1.5 Shots',team:'AWB',game:'AWB @ HMB',matchup:'AWB @ HMB',fairProb:0.55,mktProb:0.54,gameInfo:G};
    const RW=[row(Object.assign({},base,{book:'Kalshi',offeredProb:0.51,offeredRaw:'-104',apiKey:'kal'})), row(Object.assign({},base,{book:'FanDuel Predicts',offeredProb:0.52,offeredRaw:'-108',apiKey:'fdp'}))];
    const S=await open(b,{rows:RW, books:'Novig, Kalshi, FanDuel Predicts'});
    const X=await S.p.evaluate(()=>{ const r=lastRows.find(x=>x.apiKey==='kal'), own=lastRows.find(x=>x.apiKey==='fdp'), W=altBooksAll(r), a=W.mine.concat(W.ref).find(e=>/FD Predicts|FanDuel Predicts/.test(e.book||''));
      return a?{book:a.book, state:a.state, mx:a.mx!=null?+a.mx.toFixed(4):null, net:a.net!=null?+a.net.toFixed(4):null, rowNet:own.actNet!=null?+own.actNet.toFixed(4):null, rowMx:+maxPriceFor(okProbR(own), own.book, cfgRead().eMin).toFixed(4)}:{none:true, W:JSON.stringify(W).slice(0,300)}; });
    check('EV-3: the FD Predicts chip is "over" (52¢ is over its OK up to with the fee), not OK ✓', X.state==='over', X);
    check('EV-3: the chip’s OK up to and EV are the FanDuel Predicts row’s own (51.55%, +0.65%)', X.mx!=null && Math.abs(X.mx-X.rowMx)<1e-4 && Math.abs(X.net-X.rowNet)<1e-4 && Math.abs(X.mx-0.5155)<0.001, X);
    allErrs.push(...S.errs); await S.ctx.close(); }
  // ---------- R2-2: MLB NYY @ BOS, Friday 6:10 PM CT (NYY lost 2-7) and Saturday 1:10 PM CT (NYY won 5-1); the Friday bets' start saved 6 h and 7 h late ----------
  { const FRI=ev('fri','2026-11-21T00:10Z','NYY','BOS',2,7), SAT=ev('sat','2026-11-21T19:10Z','NYY','BOS',5,1);
    const bet=(id,x)=>Object.assign({id,key:id,sport:'MLB',game:'NYY @ BOS',book:'DraftKings',odds:'-110',stake:10,kind:'moneyline',name:'NYY',team:'NYY',market:'Moneyline',betnow:'NYY ML',date:'2026-11-20',snap:{at:'2026-11-20T15:00:00Z'}},x);
    const LOG=[bet('late6',{start:'2026-11-21T06:10:00.000Z'}), bet('late7',{start:'2026-11-21T07:10:00.000Z'}), bet('ok',{start:'2026-11-21T00:10:00.000Z'})];
    const S=await open(b,{now:Date.parse('2026-11-22T03:00:00Z'), log:LOG, espn:u=>{ if(!/baseball\/mlb\/scoreboard/.test(u)) return null; const d=(u.match(/dates=(\d{8})/)||[])[1]; return {events:d==='20261120'?[FRI]:d==='20261121'?[SAT]:[]}; }});
    await S.p.evaluate(async()=>{ agBusy=false; logBusy=0; await autoGradeLog(); }); await S.p.waitForTimeout(300);
    const X=await S.p.evaluate(()=>Object.fromEntries(logged.map(x=>[x.id,{r:x.result||'-', start:x.start, why:x.why?x.why.reason:''}])));
    const O=await S.p.evaluate(([F,Sa])=>{ const g=id=>logged.find(x=>x.id===id); const n=e=>e?e.id:null; return {late6:n(ownGameFor(Object.assign({},g('late6'),{result:null}), [F,Sa])), late7:n(ownGameFor(Object.assign({},g('late7'),{start:'2026-11-21T07:10:00.000Z',result:null}), [F,Sa]))}; }, [FRI,SAT]);
    check('R2-2: the bet saved 6 h late is Friday’s (6 h away; Saturday’s is 13 h, more than twice as far): graded LOSS 2-7 (it was WIN from Saturday)', X.late6.r==='loss', X.late6);
    check('R2-2: its start is moved to Friday’s', Date.parse(X.late6.start)===Date.parse('2026-11-21T00:10Z'), X.late6.start);
    check('R2-2: the bet saved 7 h late is left open (Friday 7 h, Saturday 12 h: not clearly the nearest), and Look out says why', X.late7.r==='-' && /not clearly the one/.test(X.late7.why), X.late7);
    check('R2-2: the bet at the right start is graded as before (LOSS)', X.ok.r==='loss', X.ok);
    check('R2-2: Check results and Live Games (ownGameFor) take the same rule: Friday for 6 h late, none for 7 h late (it was Saturday, the only game that Central day)', O.late6==='fri' && O.late7===null, O);
    allErrs.push(...S.errs); await S.ctx.close(); }
  check('no page errors', !allErrs.length, allErrs.slice(0,5));
  await b.close(); console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(fail?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
