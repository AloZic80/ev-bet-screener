// node tests/v512-money-test.js — v5.12 bug fixes (owner 11/15: "ok"), money and records:
// P1 a parlay you saved (+ Add a bet, the Bet log panel, this tab: parlayRecord saves it as result 'pending') marks its picks on the Parlays tab
//    ("✓ you bet this: in your … parlay", and they leave entries and slips); before, only a parlay with no result at all did, so none ever did.
//    The rule (v4.19, unchanged): an open parlay saved in the last 2 days, on the pick's game day, with a leg naming the player (or team), the line and the side when written.
//    A pending single typed in (+ Add a bet, graded 'pending' before its game ends) is marked the same way.
// F2 Fix on a bet linked to two different orders takes the fee of both orders (fillFee), not only the last one; a bet linked before v5.12 (fee of its
//    earlier orders not counted) keeps the fee it has.
// E3 Bet log › edit Save keeps a stake or price a re-read of the fills brought while the form was open, when the form left that field as it opened.
// B4 entryPInfo reads the fee as betFeeOf does: b.fee (an edit) first, then snap.fee.
// Every dollar value below is worked out by hand in the comments.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const NOW=Date.parse('2026-11-15T20:00:00Z'), H=3600e3, iso=ms=>new Date(ms).toISOString(), DAY='2026-11-15', TMRW='2026-11-16';
const bet=(id,o)=>Object.assign({id, key:id, sport:'NBA', kind:'prop', book:'Kalshi', odds:'+100', stake:2.07, date:TMRW, dateSet:true, game:'LAL @ BOS', name:'Player '+id, side:'O', market:'10.5 Points', betnow:'O 10.5 +100', start:iso(NOW+20*H), snap:{at:iso(NOW-6*H), fee:0.035}}, o);
// Kalshi fills: 4 contracts at 50¢ cost $2.00 plus a $0.07 fee = $2.07 (fee rate 0.07 ÷ 2.00 = 0.035)
const fill=(id,o)=>bet(id, Object.assign({autoFrom:'kalshi', fillBook:'kalshi', fillRef:'KX-'+id, fillSide:'yes', fills:[id+'-1'], fillQty:4, fillCost:2.07, placedAt:iso(NOW-H), placedAtSource:'book_fill'}, o));
const LOG=[
  bet('two', {stake:4, snap:{at:iso(NOW-6*H), fee:0}}),                                                   // F2: logged by hand at $4.00, then linked to two orders
  bet('leg', {fillBook:'kalshi', fillRef:'KX-leg', fillSide:'yes', fills:['leg-a'], fillQty:4, fillCost:2.07}),   // F2: linked to one order before v5.12 (no fillFee)
  fill('ew'), fill('ep'), fill('et'),                                                                     // E3
  bet('bf', {date:DAY, start:iso(NOW-5*H), fee:0.02}),                                                    // B4: an edit saved fee 0.02, the snapshot has 0.035
  bet('sg', {sport:'NFL', book:'Bovada', name:'Devin Singletary', market:'15.5 Rushing Attempts', side:'U', odds:'+105', stake:2, date:DAY, start:iso(NOW+3*H), result:'pending', snap:{at:iso(NOW-2*H), fee:0}}) ];   // P1: a single typed in, graded pending
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago', viewport:{width:1400,height:1000}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(L=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.log',JSON.stringify(L)); }catch(e){} }, LOG);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1200);
  const g=id=>p.evaluate(id=>{ const x=logged.find(y=>y.id===id); return x?JSON.parse(JSON.stringify(x)):null; }, id);

  // ---- P1: a parlay saved in the Bet log panel marks its picks on the Parlays tab ----
  await p.click('.tab[data-view="v-log"]'); await p.waitForTimeout(200);
  await p.evaluate(()=>{ document.getElementById('parlayPanel').open=true; });
  await p.selectOption('#plBook','PrizePicks'); await p.fill('#plPicks','2'); await p.fill('#plStake','5'); await p.fill('#plAll','15'); await p.fill('#plDay',DAY);
  await p.fill('#plLegs','Singletary U 15.5 rush att, Maye O 20.5 completions'); await p.click('#plAdd'); await p.waitForTimeout(200);
  const P1=await p.evaluate(()=>{ const T=Date.parse('2026-11-16T00:00:00Z'), row=(name,team,market,side,game)=>({kind:'prop',sport:'NFL',book:'Novig',name,team,market,side,game,idx:Math.floor(Math.random()*1e6),gameInfo:{startISO:new Date(T).toISOString()}});
    const SING=row('Devin Singletary','NYG','15.5 Rushing Attempts','U','NYG @ PHI'), MAYE=row('Drake Maye','NE','20.5 Completions','O','GB @ NE'), OTHER=row('Drake Maye','NE','25.5 Completions','O','GB @ NE'), OSIDE=row('Drake Maye','NE','20.5 Completions','U','GB @ NE');
    const pl=logged.find(x=>x.kind==='parlay' && x.book==='PrizePicks'), out={result:pl&&pl.result, maye:pkParlaysWith(MAYE).length, sing:pkParlaysWith(SING).length, other:pkParlaysWith(OTHER).length, oside:pkParlaysWith(OSIDE).length,
      tag:pkBetTag({r:MAYE}), left:pkNotLogged([{name:'Drake Maye',r:MAYE},{name:'Drake Maye',r:OTHER},{name:'Drake Maye',r:OSIDE}]).map(l=>l.r.market+' '+l.r.side), note:window._pkInLogged};
    const singleOnly=(()=>{ const keep=logged; logged=logged.filter(x=>x.kind!=='parlay'); const t=pkBetTag({r:SING}); logged=keep; return t; })();
    // another parlay for a game 2 days later (11/17) does not mark tonight's pick (pkSameDay); a settled one marks nothing
    const r17=row('Drake Maye','NE','20.5 Completions','O','GB @ NE'); r17.gameInfo={startISO:'2026-11-17T18:00:00Z'};
    pl.result='win'; pl.parlay.hits=2; pl.parlay.payout=15; const settled=pkParlaysWith(MAYE).length; pl.result='pending'; pl.parlay.hits=null; pl.parlay.payout=null;
    return Object.assign(out,{singleOnly, otherDay:pkParlaysWith(r17).length, settled}); });
  check('P1: the Bet log panel saves the parlay as result pending', P1.result==='pending', P1.result);
  check('P1: both of its picks are found (Maye Over 20.5 Completions, Singletary Under 15.5 Rushing Attempts); another line (25.5) and the other side (Under 20.5) are not', P1.maye===1 && P1.sing===1 && P1.other===0 && P1.oside===0, P1);
  check('P1: the pick says "✓ you bet this: in your PrizePicks parlay (2 picks)"', /✓ you bet this: in your PrizePicks parlay \(2 picks\)/.test(P1.tag), P1.tag);
  check('P1: the pick leaves entries and slips (1 left out, the 25.5 line and the Under stay)', JSON.stringify(P1.left)==='["25.5 Completions O","20.5 Completions U"]' && P1.note===1, {left:P1.left, note:P1.note});
  check('P1: a pending single typed in (Bovada $2.00, Singletary Under 15.5) marks the pick too: "single $2.00 on Bovada"', /✓ you bet this: single \$2\.00 on Bovada/.test(P1.singleOnly), P1.singleOnly);
  check('P1: a settled parlay, and a pick on another game day, are not marked', P1.settled===0 && P1.otherDay===0, {settled:P1.settled, otherDay:P1.otherDay});
  await p.click('.tab[data-view="v-log"]'); await p.waitForTimeout(200);

  // ---- F2: Fix on a bet linked to two orders takes the fee of both ----
  // two orders of 4 contracts at 50¢, $2.00 + $0.07 fee each: $4.14 in all, fee $0.14 on $4.00 = 0.035. If it wins: 8 × $1 = $8.00 − $4.14 = +$3.86.
  // Before: the fee of the last order alone, $0.07 ÷ ($4.14 − $0.07) = 0.0172, so a win showed +$4.00 ($0.14 too much).
  const F2=await p.evaluate(()=>{ const x=logged.find(y=>y.id==='two');
    linkFill(x, {book:'kalshi', id:'two-a', ref:'KX-two', side:'yes', qty:4, cost:2.00, fee:0.07, price:0.5, ts:Date.now()-2*3600e3});
    linkFill(x, {book:'kalshi', id:'two-b', ref:'KX-two', side:'yes', qty:4, cost:2.00, fee:0.07, price:0.5, ts:Date.now()-3600e3}); saveLog(); renderLog();
    const d=JSON.parse(JSON.stringify(x.fillDiff||null)), i=logged.indexOf(x), btn=document.querySelector('#logBody button.fill-fix[data-i="'+i+'"]'); if(btn) btn.click();
    return {btn:!!btn, diff:d, stake:x.stake, fee:x.fee, fillCost:x.fillCost, ifWin:betProfit(Object.assign({},x,{result:'win'}))}; });
  check('F2: linked to two orders ($2.07 + $2.07): the Fix line says $4.14 with the fee of both, $0.14', F2.diff && F2.diff.stake===4.14 && Math.abs(F2.diff.fee-0.14)<1e-9, F2.diff);
  check('F2: Fix writes stake $4.14 and fee 0.035 ($0.14 on $4.00); if it wins +$3.86 ($8.00 − $4.14), not +$4.00', F2.btn && F2.stake===4.14 && Math.abs(F2.fee-0.035)<1e-9 && F2.ifWin===3.86, F2);
  // a bet linked to one order before v5.12 (its fee not counted), then a second order: Fix keeps the fee it has (snap.fee 0.035): +$3.86 too
  const F2b=await p.evaluate(()=>{ const x=logged.find(y=>y.id==='leg');
    linkFill(x, {book:'kalshi', id:'leg-b', ref:'KX-leg', side:'yes', qty:4, cost:2.00, fee:0.07, price:0.5, ts:Date.now()-3600e3}); saveLog(); renderLog();
    const d=JSON.parse(JSON.stringify(x.fillDiff||null)), i=logged.indexOf(x), btn=document.querySelector('#logBody button.fill-fix[data-i="'+i+'"]'); if(btn) btn.click();
    return {btn:!!btn, diff:d, stake:x.stake, fee:x.fee, feeOf:betFeeOf(x), ifWin:betProfit(Object.assign({},x,{result:'win'}))}; });
  check('F2: a bet linked before v5.12, then a second order: Fix takes $4.14 and keeps its fee (0.035 from the snapshot); if it wins +$3.86', F2b.btn && F2b.stake===4.14 && F2b.fee===undefined && Math.abs(F2b.feeOf-0.035)<1e-9 && F2b.ifWin===3.86, F2b);

  // ---- E3: a re-read while Bet log › edit is open ----
  const edit=async id=>{ const i=await p.evaluate(id=>logged.findIndex(x=>x.id===id), id); await p.evaluate(i=>document.querySelector('#logBody button.kill.edit[data-i="'+i+'"]').click(), i); await p.waitForTimeout(300); };
  const save=async()=>{ await p.evaluate(()=>document.querySelector('#logBody tr.editor .eb-save').click()); await p.waitForTimeout(400); };
  const reread=(id,o)=>p.evaluate(([id,o])=>{ const x=logged.find(y=>y.id===id); linkFill(x, Object.assign({book:'kalshi', id:id+'-1', ref:'KX-'+id, side:'yes', ts:Date.now()}, o)); saveLog(); return {stake:x.stake, odds:x.odds}; }, [id,o]);
  // the order grew to 5 contracts: $2.50 + $0.09 = $2.59. If it wins: 5 × $1 = $5.00 − $2.59 = +$2.41 (the $2.07 put back would say +$1.93)
  await edit('ew'); const ew0=await reread('ew', {qty:5, cost:2.50, fee:0.09, price:0.5}); await save(); const ew=await g('ew'), ewP=await p.evaluate(()=>betProfit(Object.assign({},logged.find(y=>y.id==='ew'),{result:'win'})));
  check('E3: the order grew to $2.59 while the form was open, Save with nothing typed: the stake stays $2.59 (not $2.07), even money (50%), nothing marked, no To win', ew0.stake===2.59 && ew.stake===2.59 && Math.abs(Math.abs(parseFloat(ew.odds))-100)<1e-9 && ew.accountingSource===undefined && ew.towin==null, {reread:ew0, stake:ew.stake, odds:ew.odds, src:ew.accountingSource, towin:ew.towin});
  check('E3: if it wins +$2.41 ($5.00 − $2.59)', ewP===2.41, ewP);
  // the order grew at a new price: 5 contracts at 52¢ = $2.60 + $0.09 = $2.69, odds −108; Save with nothing typed keeps both
  await edit('ep'); const ep0=await reread('ep', {qty:5, cost:2.60, fee:0.09, price:0.52}); await save(); const ep=await g('ep');
  check('E3: a re-read at a new price (52¢, −108, $2.69) while the form was open: Save with nothing typed keeps −108 and $2.69, nothing marked', ep0.odds==='-108' && ep.odds==='-108' && ep.stake===2.69 && ep.accountingSource===undefined && /-108/.test(ep.betnow||''), {reread:ep0, odds:ep.odds, stake:ep.stake, src:ep.accountingSource, betnow:ep.betnow});
  // the same re-read, but you typed a cost of $3.00 in the form: yours is saved and the bet is marked yours
  await edit('et'); await reread('et', {qty:5, cost:2.50, fee:0.09, price:0.5}); await p.fill('#logBody tr.editor .eb-cost','3.00'); await save(); const et=await g('et');
  check('E3: a cost typed in the form ($3.00) still wins over the re-read ($3.00 saved), and marks the bet yours', et.stake===3 && et.accountingSource==='user', {stake:et.stake, src:et.accountingSource});

  // ---- B4: the entry price reads the fee as betFeeOf ----
  // +100 = 50%; with the fee an edit saved (0.02): 50% × 1.02 = 51.0% (it read the snapshot's 0.035 first: 51.75%)
  const B4=await p.evaluate(()=>{ const x=logged.find(y=>y.id==='bf'); return {p:entryPInfo(x).p, src:entryPInfo(x).src, feeOf:betFeeOf(x)}; });
  check('B4: entry price 51.0% (50% × 1.02, the edited fee), not 51.75%', Math.abs(B4.p-0.51)<1e-9 && B4.src==='paid_odds' && B4.feeOf===0.02, B4);
  const B4b=await p.evaluate(()=>{ const x=Object.assign({}, logged.find(y=>y.id==='bf')); delete x.fee; return entryPInfo(x).p; });
  check('B4: with no edited fee, the snapshot\'s 0.035: 51.75%', Math.abs(B4b-0.5175)<1e-9, B4b);

  check('no page errors', !errs.length, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
