// node tests/bugfix-money-test.js — v5.11 bug fixes (owner 11/15: "Fix all 8"), the money and records ones:
// M1 a stake or odds corrected by hand in Bet log › edit on a book fill is marked accountingSource 'user', so a later re-read of the book's fills leaves it alone
//    (it survives a reload and a sync merge; a Save with nothing changed marks nothing; an 'import' stays 'import').
//    v5.11 (fixer): a Save with nothing changed in % mode marks nothing and keeps the fee and To win also where whole odds do not survive the @ % box
//    (+330, +220, +100 with a To win); a stake typed in the Bet log row's Stake box marks it too; only bets the app logged from a fill (autoFrom) are
//    marked (a bet you logged and linked later keeps its Fix / Keep mine line); when the order of a marked bet grows, the Fix / Keep mine line says so.
// M2 betProfit (and the To win shown for open bets) uses the fee saved with the bet (snap.fee) when no edit saved one (b.fee): a Kalshi or Polymarket US win
//    is the payout minus the stake (stake = cost × (1 + fee)), not the stake times the odds.
// M3 a new parlay gets its own key, so two parlays with the same name on the same day stay two records (also through a sync join) and count as two in Reports;
//    parlays saved before keep the keys they had. v5.11 (fixer): Reports reads each of those as its own game and outcome from its id (read only).
// Every dollar value below is worked out by hand in the comments, not with the page's own functions.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const prob=o=>{ const n=parseFloat(o); return !isFinite(n)?null:n>0?100/(n+100):(-n)/(-n+100); };   // American odds → chance (+100 and −100 are both even money, 50%)
const NOW=Date.parse('2026-11-15T20:00:00Z'), H=3600e3, iso=ms=>new Date(ms).toISOString(), DAY='2026-11-15', TMRW='2026-11-16';
// Kalshi: 4 contracts at 50¢ cost $2.00, the fee is 0.07 × 4 × 0.50 × 0.50 = $0.07, so the stake is $2.07 = $2.00 × (1 + 0.035) and snap.fee = 0.07 ÷ 2.00 = 0.035.
// A win pays 4 × $1 = $4.00: profit $4.00 − $2.07 = $1.93 (before the fix: $2.07 × (2 − 1) = $2.07, $0.14 too much).
const bet=(id,o)=>Object.assign({id, key:id, sport:'NBA', kind:'prop', book:'Kalshi', odds:'+100', stake:2.07, date:DAY, dateSet:true, game:'LAL @ BOS', name:'Player '+id, side:'O', market:'10.5 Points', betnow:'O 10.5 +100', start:iso(NOW-5*H), snap:{at:iso(NOW-6*H), fee:0.035}}, o);
const won={result:'win', gradedBy:'manual', resultSrc:'you'};
const fill=(id,o)=>bet(id, Object.assign({date:TMRW, start:iso(NOW+20*H), autoFrom:'kalshi', fillBook:'kalshi', fillRef:'KX-'+id, fillSide:'yes', fills:[id+'-1'], fillQty:4, fillCost:2.07, placedAt:iso(NOW-H), placedAtSource:'book_fill'}, o));
const oldPl=(id,legs,stake,all)=>({id, kind:'parlay', date:'2026-11-13', start:null, name:'Parlay · 3 picks', sport:'PARLAY', market:'3-pick parlay', betnow:'3 picks', book:'PrizePicks', odds:stake===5?'+400':'+500', fair:'', stake, result:'pending', closing:'',
  parlay:{picks:3, legs, pays:{all, m1:0, m2:0}, hits:null, payout:null}, snap:{at:iso(NOW-50*H), screener:'v5.10', said:{decision:'PARLAY', onList:false}}});   // saved before v5.11 (on 11/13): no key
const LOG=[
  bet('k1', Object.assign({autoFrom:'kalshi', fillBook:'kalshi', fills:['k1-1'], fillQty:4, fillCost:2.07}, won)),   // fee only in snap.fee → +$1.93
  bet('k2', Object.assign({fee:0.035}, won)),                                                                     // the same bet, its fee saved by an edit (b.fee) → +$1.93
  bet('k3', Object.assign({towin:1.90}, won)),                                                                    // a typed To win → +$1.90 as typed
  bet('nv', Object.assign({book:'Novig', odds:'-150', stake:3, betnow:'O 10.5 -150', snap:{at:iso(NOW-6*H), fee:0}}, won)),   // Novig, no fee: $3 at −150 wins $3 × 100 ÷ 150 = $2.00
  bet('ls', {result:'loss', gradedBy:'manual', resultSrc:'you'}),                                                  // a loss → −$2.07 (the whole stake, fee included)
  bet('ph', {result:'push', gradedBy:'manual', resultSrc:'you'}),                                                  // a push → $0.00
  bet('fk', Object.assign({free:true}, won)),                                                                      // a free Kalshi bet that wins: the winnings only, $1.93
  bet('fb', Object.assign({book:'Bovada', odds:'+150', stake:5, free:true, betnow:'O 10.5 +150', snap:{at:iso(NOW-6*H), fee:0}}, won)),   // a free Bovada bet: $5 at +150 wins $7.50
  bet('op', {book:'Polymarket US', start:iso(NOW+2*H)}),                                                           // open, fee only in snap.fee: to win $1.93, total $4.00
  fill('fl'), fill('fn'), fill('fi', {accountingSource:'import'}), fill('fp'),                                     // M1: stake corrected by hand / saved unchanged / corrected by an import / price corrected by hand
  // M1 (fixer): fills whose whole odds do not survive the @ % box (23.3% saves as +329, 31.3% as +219, 50.0% as −100); a fill corrected in the row's Stake box; a bet logged by hand and linked to a fill later
  fill('pa', {book:'Polymarket US', autoFrom:'poly', fillBook:'poly', fillRef:'PM-pa', odds:'+330', betnow:'O 10.5 +330', stake:1, fillQty:4.13, fillCost:1, snap:{at:iso(NOW-6*H), fee:0.0417}}),
  fill('pb', {book:'Polymarket US', autoFrom:'poly', fillBook:'poly', fillRef:'PM-pb', odds:'+330', betnow:'O 10.5 +330', stake:1, fillQty:4.13, fillCost:1, snap:{at:iso(NOW-6*H), fee:0.0417}}),
  fill('kc', {odds:'+220', betnow:'O 10.5 +220', stake:1, fillQty:3.13, fillCost:1, snap:{at:iso(NOW-6*H), fee:0.0481}}), fill('kt', {towin:1.93}), fill('fs'), fill('fw'),
  bet('hl', {date:TMRW, start:iso(NOW+20*H), fillBook:'kalshi', fillRef:'KX-hl', fillSide:'yes', fills:['hl-1'], fillQty:4, fillCost:2.07}),
  // Kalshi rounds its fee up to the cent: 2 contracts at 50¢ ($1.00) were charged $0.04 (0.07 × 2 × 0.25 = $0.035 before rounding), stake $1.04, snap.fee 0.04: a win is $2.00 − $1.04 = +$0.96
  bet('fr', Object.assign({date:'2026-11-14', start:iso(NOW-30*H), stake:1.04, autoFrom:'kalshi', fillBook:'kalshi', fillRef:'KX-fr', fillSide:'yes', fills:['fr-1'], fillQty:2, fillCost:1.04, snap:{at:iso(NOW-31*H), fee:0.04}}, won)),
  oldPl('op1','A O 1.5; B O 2.5; C U 3.5',5,25), oldPl('op2','D O 1.5; E O 2.5; F U 3.5',4,24)];                     // M3: two parlays saved before v5.11, same name, same day
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago', viewport:{width:1400,height:1000}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(L=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.log',JSON.stringify(L)); }catch(e){} }, LOG);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1200);
  const g=id=>p.evaluate(id=>{ const x=logged.find(y=>y.id===id); return x?JSON.parse(JSON.stringify(x)):null; }, id);

  // ---- M2: profit with the fee saved with the bet ----
  const P=await p.evaluate(()=>Object.fromEntries(logged.filter(x=>x.kind!=='parlay').map(x=>[x.id, betProfit(x)])));
  check('M2: a Kalshi win with the fee only in snap.fee makes +$1.93 ($4.00 paid − $2.07 staked), not +$2.07', P.k1===1.93, P.k1);
  check('M2: the same bet with the fee saved by an edit (b.fee) makes +$1.93', P.k2===1.93, P.k2);
  check('M2: a Kalshi win with a typed To win makes what was typed, +$1.90', P.k3===1.9, P.k3);
  check('M2: a Novig win (no fee): $3 at −150 makes +$2.00', P.nv===2, P.nv);
  check('M2: a loss is −$2.07 (the stake, fee included); a push is $0.00', P.ls===-2.07 && P.ph===0, {ls:P.ls, ph:P.ph});
  check('M2: a free Kalshi win pays the winnings only, +$1.93; a free Bovada win ($5 at +150) +$7.50', P.fk===1.93 && P.fb===7.5, {fk:P.fk, fb:P.fb});
  check('M2: a Kalshi win whose fee was rounded up ($0.04 on $1.00, snap.fee 0.04) makes $2.00 − $1.04 = +$0.96', P.fr===0.96, P.fr);
  const day=await p.evaluate(d=>{ const x=dayStats()[d]; return {profit:+x.profit.toFixed(2), settled:x.settled}; }, DAY);
  check('M2: Performance, the day: 1.93 + 1.93 + 1.90 + 2.00 − 2.07 + 0 + 1.93 + 7.50 = +$15.12 (it was +$15.40: two wins $0.14 too high)', day.profit===15.12 && day.settled===8, day);
  const sc=await p.evaluate(d=>{ const S=scoreSet(logged).settled.filter(x=>x._day===d); return {n:S.length, pl:+S.reduce((t,x)=>t+x._pl,0).toFixed(2)}; }, DAY);
  check('M2: Scorecard (free bets stay out): 1.93 + 1.93 + 1.90 + 2.00 − 2.07 + 0 = +$5.69 on 6 bets (it was +$5.83)', sc.n===6 && sc.pl===5.69, sc);
  const op=await p.evaluate(()=>{ const x=logged.find(y=>y.id==='op'); return {tw:+rpToWin(x).toFixed(2), pay:+betPayout(x).toFixed(2), row:lgTwHtml(x).replace(/&nbsp;/g,' ').replace(/<[^>]+>/g,'')}; });
  check('M2: an open Polymarket US bet with the fee only in snap.fee: To win $1.93, total payout $4.00 (Reports, Bet log row, Live Games)', op.tw===1.93 && op.pay===4 && /to win \$1\.93 · total \$4\.00/.test(op.row), op);
  await p.evaluate(()=>{ tbDay=null; renderTodayBar(); });
  const up=await p.evaluate(()=>(document.getElementById('todayBar').textContent.replace(/\s+/g,' ').match(/Open upside \+\$[\d.]+/)||[''])[0]);
  check('M2: TODAY: Open upside +$1.93 (it was +$2.07)', up==='Open upside +$1.93', up);

  // ---- M1: a correction made by hand in Bet log › edit stays ----
  await p.click('.tab[data-view="v-log"]'); await p.waitForTimeout(300);
  const edit=async id=>{ const i=await p.evaluate(id=>logged.findIndex(x=>x.id===id), id); await p.evaluate(i=>document.querySelector('#logBody button.kill.edit[data-i="'+i+'"]').click(), i); await p.waitForTimeout(300); };
  const save=async()=>{ await p.evaluate(()=>document.querySelector('#logBody tr.editor .eb-save').click()); await p.waitForTimeout(400); };
  await edit('fn'); const mode=await p.$eval('#logBody tr.editor .eb-mode', x=>x.value); await save();
  let fn=await g('fn');
  check('M1: Save with nothing changed (Kalshi opens in %): stake $2.07 and the even-money price kept (the form writes +100 as −100), nothing marked', mode==='pct' && fn.stake===2.07 && prob(fn.odds)===0.5 && fn.accountingSource===undefined, {mode, stake:fn.stake, odds:fn.odds, src:fn.accountingSource});
  await edit('fr'); await save(); const fr=await p.evaluate(()=>{ const x=logged.find(y=>y.id==='fr'); return {fee:x.fee, src:x.accountingSource, pl:betProfit(x)}; });
  check('M1: Save with nothing changed keeps the fee the book charged (no estimate written over it): still +$0.96, nothing marked', fr.fee===undefined && fr.src===undefined && fr.pl===0.96, fr);
  await edit('fp'); await p.fill('#logBody tr.editor .eb-pct','52'); await save();
  const fp=await p.evaluate(()=>{ const x=logged.find(y=>y.id==='fp'); return {odds:x.odds, fee:x.fee, src:x.accountingSource, ifWin:betProfit(Object.assign({},x,{result:'win'}))}; });
  // 52% saves as −108; Kalshi's fee at 52% is 0.07 × 0.48 = 0.0336; if it wins: $2.07 × (208/108 − 1 − 0.0336) ÷ 1.0336 = +$1.79
  check('M1: a price corrected by hand (50% → 52%) is saved with its own fee and marked "user"', fp.odds==='-108' && Math.abs(fp.fee-0.0336)<1e-9 && fp.src==='user' && fp.ifWin===1.79, fp);
  await edit('fl'); await p.fill('#logBody tr.editor .eb-cost','2.50'); await save();
  let fl=await g('fl');
  check('M1: the stake corrected by hand ($2.07 → $2.50) is saved and marked accountingSource "user"', fl.stake===2.5 && fl.accountingSource==='user', {stake:fl.stake, src:fl.accountingSource});
  await edit('fi'); await p.fill('#logBody tr.editor .eb-cost','2.30'); await save();
  const fi=await g('fi');
  check('M1: a bet an import corrected stays "import" when edited by hand', fi.stake===2.3 && fi.accountingSource==='import', {stake:fi.stake, src:fi.accountingSource});
  // v5.11 (fixer): Save with nothing changed where whole odds do not survive the @ % box: nothing marked, and the stake, the fee the bet has and its To win stay
  const nc=async id=>{ await edit(id); const m=await p.$eval('#logBody tr.editor .eb-mode', x=>x.value), box=await p.$eval('#logBody tr.editor .eb-pct', x=>x.value); await save(); const x=await g(id); return {mode:m, box, odds:x.odds, stake:x.stake, fee:x.fee, src:x.accountingSource, towin:x.towin}; };
  const pa=await nc('pa'), kc=await nc('kc'), kt=await nc('kt');
  check('M1 (fixer): Polymarket US fill at +330 (the @ % box opens at 23.3), Save with nothing changed: nothing marked, stake $1.00, no fee estimate written over the saved one', pa.mode==='pct' && pa.box==='23.3' && pa.src===undefined && pa.stake===1 && pa.fee===undefined && Math.abs(prob(pa.odds)-100/430)<0.001, pa);
  check('M1 (fixer): Kalshi fill at +220 (31.3), Save with nothing changed: nothing marked, stake $1.00, no fee estimate written', kc.mode==='pct' && kc.box==='31.3' && kc.src===undefined && kc.stake===1 && kc.fee===undefined, kc);
  check('M1 (fixer): Kalshi fill at +100 with a To win of $1.93, Save with nothing changed (the form saves even money as −100): the To win stays, nothing marked', kt.mode==='pct' && kt.towin===1.93 && kt.src===undefined && kt.stake===2.07 && prob(kt.odds)===0.5, kt);
  await edit('pb'); await p.fill('#logBody tr.editor .eb-date','2026-11-17'); await save(); const pb=await g('pb');
  check('M1 (fixer): only the Game day changed on a +330 fill: the day moves, nothing marked, no fee written', pb.date==='2026-11-17' && pb.accountingSource===undefined && pb.stake===1 && pb.fee===undefined, {date:pb.date, src:pb.accountingSource, stake:pb.stake, fee:pb.fee});
  // a bet logged by hand and linked to a fill later (fillBook only): a re-read never puts its numbers back, so it is not marked, and its Fix / Keep mine line stays on
  await edit('hl'); await p.fill('#logBody tr.editor .eb-cost','3.00'); await save();
  const hl=await p.evaluate(()=>{ const x=logged.find(y=>y.id==='hl'), src=x.accountingSource; linkFill(x, {book:'kalshi', id:'hl-1', ref:'KX-hl', side:'yes', qty:4, cost:2.00, fee:0.07, price:0.5, ts:Date.now()}); saveLog(); return {stake:x.stake, src, diff:x.fillDiff?x.fillDiff.stake:null}; });
  check('M1 (fixer): a bet logged by hand and linked to a fill, its stake edited to $3.00: not marked, and a re-read shows the book\'s $2.07 (Fix / Keep mine)', hl.stake===3 && hl.src===undefined && hl.diff===2.07, hl);
  // the Stake box in the Bet log row, on a fill: $2.07 → $2.50 is marked, and a re-read of the same 4 contracts ($2.00 + $0.07) leaves $2.50
  await p.evaluate(()=>{ const i=logged.findIndex(x=>x.id==='fs'), inp=document.querySelector('#logBody input.stake-in[data-i="'+i+'"]'); inp.value='2.50'; inp.dispatchEvent(new Event('change')); }); await p.waitForTimeout(300);
  const fs1=await p.evaluate(()=>{ const x=logged.find(y=>y.id==='fs'), src=x.accountingSource; linkFill(x, {book:'kalshi', id:'fs-1', ref:'KX-fs', side:'yes', qty:4, cost:2.00, fee:0.07, price:0.5, ts:Date.now()}); saveLog(); return {stake:x.stake, src, diff:!!x.fillDiff}; });
  check('M1 (fixer): a stake typed in the Bet log row ($2.07 → $2.50) on a fill is marked "user"; a re-read of the same 4 contracts leaves $2.50, with no line', fs1.stake===2.5 && fs1.src==='user' && !fs1.diff, fs1);
  // the fills read again while Bet log › edit is open on a fill (the order grew to $2.59), then Save with nothing typed: the form opened at $2.07, so nothing is marked
  await edit('fw'); await p.evaluate(()=>{ const x=logged.find(y=>y.id==='fw'); linkFill(x, {book:'kalshi', id:'fw-1', ref:'KX-fw', side:'yes', qty:5, cost:2.50, fee:0.09, price:0.5, ts:Date.now()}); saveLog(); }); await save();
  const fw=await g('fw');
  check('M1 (fixer): a re-read while the form is open, then Save with nothing typed: not taken for a change you made (nothing marked)', fw.accountingSource===undefined, {stake:fw.stake, src:fw.accountingSource});
  await p.reload(); await p.waitForTimeout(1200);
  fl=await g('fl');
  check('M1: after a reload the corrected stake and the mark are still there', fl.stake===2.5 && fl.accountingSource==='user', {stake:fl.stake, src:fl.accountingSource});
  // the book's fills read again: the order grew to 5 contracts, $2.50 + $0.09 fee = $2.59 (what a partial fill does)
  const reread=id=>p.evaluate(id=>{ const x=logged.find(y=>y.id===id); linkFill(x, {book:'kalshi', id:id+'-1', ref:'KX-'+id, side:'yes', qty:5, cost:2.50, fee:0.09, price:0.5, ts:Date.now()}); saveLog(); return {stake:x.stake, odds:x.odds, fillCost:x.fillCost, fillQty:x.fillQty, diff:x.fillDiff?x.fillDiff.stake:null}; }, id);
  const o1=fl.odds, r1=await reread('fl'), r0=await reread('fn');
  check('M1: a re-read of the fills leaves the corrected bet alone ($2.50 at even money; the fill itself says $2.59, 5 contracts); v5.11 (fixer): the order grew (4 → 5 contracts), so the Fix / Keep mine line shows the book\'s $2.59', r1.stake===2.5 && r1.odds===o1 && prob(r1.odds)===0.5 && r1.fillCost===2.59 && r1.fillQty===5 && r1.diff===2.59, r1);
  await p.evaluate(()=>{ renderLog(); }); await p.waitForTimeout(200);
  const kp=await p.evaluate(()=>{ const i=logged.findIndex(x=>x.id==='fl'), k=document.querySelector('#logBody button.fill-keep[data-i="'+i+'"]'), t=k?k.closest('.fill-diff').textContent.replace(/\s+/g,' ').trim():''; if(k) k.click(); const x=logged.find(y=>y.id==='fl'); return {line:t, stake:x.stake, src:x.accountingSource, diff:!!x.fillDiff}; });
  check('M1 (fixer): the Bet log row says "Kalshi says 50.0% (even money) · $2.59" with Fix and Keep mine; Keep mine closes it and $2.50 stays', /Kalshi says 50\.0% \([^)]*100\) · \$2\.59 Fix Keep mine/.test(kp.line) && kp.stake===2.5 && kp.src==='user' && !kp.diff, kp);
  const r2=await p.evaluate(()=>{ const x=logged.find(y=>y.id==='fl'); linkFill(x, {book:'kalshi', id:'fl-1', ref:'KX-fl', side:'yes', qty:5, cost:2.50, fee:0.09, price:0.5, ts:Date.now()}); saveLog(); return {stake:x.stake, diff:!!x.fillDiff}; });
  check('M1 (fixer): the same 5 contracts read again: no new line, still $2.50', r2.stake===2.5 && !r2.diff, r2);
  check('M1: a bet nobody corrected still follows the book ($2.07 → $2.59)', r0.stake===2.59 && prob(r0.odds)===0.5, r0);
  // sync: the corrected record against the cloud's older copy, both ways round (three-way merge on the last shared copy)
  const sy=await p.evaluate(()=>{ const old=JSON.parse(JSON.stringify(logged.find(y=>y.id==='fl'))); old.stake=2.07; old.fillQty=4; old.fillCost=2.07; delete old.accountingSource; delete old.edits; delete old.fee;
    SY={meta:syncNewMeta(), on:false}; const st=syncSt('log'); syncBaseColl([['fl', syncStrip(old)]], st);
    const a=syncMergeAll({coll:{log:{fl:{v:syncStrip(old), m:Date.now()-5000}}}, del:{}, set:{}}, false), here=logged.find(y=>y.id==='fl');
    const one={stake:here.stake, src:here.accountingSource};   // this device has the correction, the cloud the old copy
    const mine=syncStrip(here); logged=logged.map(y=>y.id==='fl'?Object.assign({},old):y);   // the other way: this device has the old copy, the cloud the correction
    SY={meta:syncNewMeta(), on:false}; syncBaseColl([['fl', syncStrip(old)]], syncSt('log'));
    syncMergeAll({coll:{log:{fl:{v:mine, m:Date.now()+5000}}}, del:{}, set:{}}, false); const there=logged.find(y=>y.id==='fl');
    linkFill(there, {book:'kalshi', id:'fl-1', ref:'KX-fl', side:'yes', qty:6, cost:3.00, fee:0.11, price:0.5, ts:Date.now()});
    const two={stake:there.stake, src:there.accountingSource, synced:'accountingSource' in syncStrip(there)}; SY=null; saveLog(); return {one, two}; });
  check('M1: sync keeps the correction either way round, and a re-read after the merge still leaves it alone', sy.one.stake===2.5 && sy.one.src==='user' && sy.two.stake===2.5 && sy.two.src==='user' && sy.two.synced, sy);
  // v5.11 (fixer): that last re-read grew the order to 6 contracts, $3.00 + $0.11 fee = $3.11, so the line is back. Fix takes the book's numbers:
  // stake $3.11, even money, fee 0.11 ÷ 3.00 = 0.03667; if it wins, 6 × $1 = $6.00 − $3.11 = +$2.89
  await p.evaluate(()=>{ renderLog(); }); await p.waitForTimeout(200);
  const fx=await p.evaluate(()=>{ const i=logged.findIndex(x=>x.id==='fl'), b=document.querySelector('#logBody button.fill-fix[data-i="'+i+'"]'); if(b) b.click(); const x=logged.find(y=>y.id==='fl'); return {btn:!!b, stake:x.stake, p:toProb(x.odds), fee:x.fee, src:x.accountingSource, diff:!!x.fillDiff, ifWin:betProfit(Object.assign({},x,{result:'win'}))}; });
  check('M1 (fixer): the order grew to 6 contracts ($3.11): Fix takes the book\'s stake, price and fee and the bet stays "user"; if it wins +$2.89 ($6.00 − $3.11)', fx.btn && fx.stake===3.11 && fx.p===0.5 && Math.abs(fx.fee-0.11/3)<1e-9 && fx.src==='user' && !fx.diff && fx.ifWin===2.89, fx);

  // ---- M3: two parlays with the same name on the same day ----
  await p.click('.tab[data-view="v-log"]'); await p.waitForTimeout(200);
  await p.evaluate(()=>{ document.getElementById('parlayPanel').open=true; });
  for(const legs of ['G O 1.5, H O 2.5, I U 3.5','J O 1.5, K O 2.5, L U 3.5']){
    await p.selectOption('#plBook','PrizePicks'); await p.fill('#plPicks','3'); await p.fill('#plStake','5'); await p.fill('#plAll','25'); await p.fill('#plDay','2026-11-14'); await p.fill('#plLegs',legs); await p.click('#plAdd'); await p.waitForTimeout(150); }
  let np=await p.evaluate(()=>logged.filter(x=>x.kind==='parlay' && x.date==='2026-11-14').map(x=>({id:x.id, key:x.key, name:x.name, sig:betSig(x), out:rpOutKey(x), game:rpGameKey(x)})));
  check('M3: two parlays, same name and day ("Parlay · 3 picks", 11/14, $5 to pay $25): two records, each with its own key', np.length===2 && np[0].name===np[1].name && !!np[0].key && !!np[1].key && np[0].key!==np[1].key, np.map(x=>({key:x.key, name:x.name})));
  check('M3: they no longer share the key a sync join matches on, nor the Reports outcome and game keys', np.length===2 && np[0].sig!==np[1].sig && np[0].out!==np[1].out && np[0].game!==np[1].game, np.map(x=>[x.sig, x.out]));
  await p.reload(); await p.waitForTimeout(1200);
  const np2=await p.evaluate(()=>logged.filter(x=>x.kind==='parlay' && x.date==='2026-11-14').map(x=>x.key));
  check('M3: after a reload: still two records, with the same keys', np2.length===2 && np2.every(Boolean) && np2.join()===np.map(x=>x.key).join(), np2);
  // a device joins the sync: the cloud has the first one (saved on the phone), this device the second; neither is taken for a copy of the other
  const jn=await p.evaluate(()=>{ const P=logged.filter(x=>x.kind==='parlay' && x.date==='2026-11-14'), first=P[0], second=P[1];
    logged=logged.filter(x=>x!==first); SY={meta:syncNewMeta(), on:false};
    syncMergeAll({coll:{log:{[first.id]:{v:syncStrip(first), m:Date.now()}}}, del:{}, set:{}}, true); SY=null; saveLog();
    return logged.filter(x=>x.kind==='parlay' && x.date==='2026-11-14').map(x=>x.id).sort().join()===[first.id, second.id].sort().join(); });
  await p.reload(); await p.waitForTimeout(1200);
  const jn2=await p.evaluate(()=>logged.filter(x=>x.kind==='parlay' && x.date==='2026-11-14').length);
  check('M3: a sync join keeps both (the cloud\'s and this device\'s), and both are there after a reload', jn===true && jn2===2, {both:jn, afterReload:jn2});
  const rc=await p.evaluate(()=>{ const P=logged.filter(x=>x.kind==='parlay' && x.date==='2026-11-14'); P.forEach(x=>{ x.parlay.hits=0; x.parlay.payout=0; x.result='loss'; }); saveLog(); return rpCounts(P); });
  check('M3: Reports counts them as 2 outcomes on 2 games (it said 1 and 1)', rc.outcomes===2 && rc.games===2, rc);
  const old=await p.evaluate(()=>{ const a=logged.find(x=>x.id==='op1'), c=logged.find(x=>x.id==='op2'), done=x=>Object.assign({}, x, {result:'loss', parlay:Object.assign({}, x.parlay, {hits:0, payout:0})});
    return {keys:[a.key, c.key], sig:betSig(a), game:rpGameKey(a), sameOut:rpOutKey(a)===rpOutKey(c), counts:rpCounts([done(a), done(c)]), n:logged.filter(x=>x.kind==='parlay' && x.date==='2026-11-13').length}; });
  check('M3: the two parlays saved before keep what they had (no key added, the same sync signature) and stay two records; v5.11 (fixer): Reports reads each as its own game and outcome from its id (2 outcomes on 2 games once settled; it said 1 and 1)', old.n===2 && old.keys[0]===undefined && old.keys[1]===undefined && old.sig==='2026-11-13|parlay 3 picks|3-pick parlay||prizepicks|+400|5.00' && old.game==='x2026-11-13|parlay|op1' && !old.sameOut && old.counts.outcomes===2 && old.counts.games===2, old);
  check('no page errors', !errs.length, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
