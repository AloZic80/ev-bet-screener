// node tests/v513-money-test.js — v5.13 fixes from Las Karens' review of 11/15 (items 3 to 6; owner "Yes"):
// E1 an exchange bet's price is shown as the price paid, fee included (the one betProfit counts a win at): Kalshi $10 at 40¢ (fee 0.07 × 0.60 = 4.2% of the
//    cost) wins $10 × (2.5 − 1 − 0.042) ÷ 1.042 = +$13.99, so it shows +140 ("40¢ + fee"), not +150; Polymarket US $10 at 25¢ (fee 0.0695 × 0.75 = 5.2125%)
//    wins $10 × (4 − 1 − 0.052125) ÷ 1.052125 = +$28.02: +280 ("25¢ + fee"), not +300; Novig (fee 0) stays +150 and +$15.00. In the bet form ("= 40¢ + fee = +140
//    paid"), the Bet log row and Reports' table. The saved odds (+150), the fee and every profit are unchanged.
// E2 the Bet log's daily-max meter counts what the Hard stop counts (dayStats().staked): $45.00 of singles + two PrizePicks entries $10.00 and $10.01 = $65.01;
//    a free bet ($5) is $0, as the Hard stop (before: "$50.00", parlays left out and the free bet counted).
// E3 the Bet log's "Add a parlay / Pick 6" panel: Entry type Power / Flex, the Free entry tick (free:true, the entry still typed, as + Add a bet), Picks 2 to 12,
//    Pays if all hit filled in from the Parlays tab's PrizePicks payouts (4-pick Power 10x: $5 → $50.00; 5-pick Flex 10x / 2x / 0.4x: $10 → $100.00, $20.00, $4.00),
//    a box you typed is kept; no box runs over the next at 390, 1000, 1280 and 1960 px, and the Book list is wide enough for its longest name.
// E4 a bet typed in + Add a bet with no fair price is saved as NO FAIR PRICE (unpriced, not on the list), not SKIP; an older own bet saved as SKIP with no fair
//    price is read as not priced in TODAY (not "against the screener"); a priced own SKIP stays against; Scorecard eligibility is unchanged.
// Every dollar value below is worked out by hand in the comments, not with the page's own functions.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const NOW=Date.parse('2026-11-15T20:00:00Z'), H=3600e3, iso=ms=>new Date(ms).toISOString(), DAY='2026-11-15';
const won={result:'win', gradedBy:'manual', resultSrc:'you'};
const single=(id,o)=>Object.assign({id, key:id, sport:'NBA', kind:'prop', book:'DraftKings', odds:'-110', stake:10, date:DAY, dateSet:true, game:'LAL @ BOS', name:'Player '+id, side:'O', market:'10.5 Points', betnow:'O 10.5', start:iso(NOW+5*H), snap:{at:iso(NOW-H), fee:0, model:0.55, act:0.54, said:{decision:'BET', stake:10, onList:true}}}, o);
const pl=(id,stake)=>({id, key:'parlay|'+id, kind:'parlay', date:DAY, dateSet:true, start:null, name:'Parlay · 3 picks', sport:'PARLAY', market:'3-pick parlay', betnow:'3 picks', book:'PrizePicks', odds:'+400', fair:'', stake, result:'pending', closing:'',
  parlay:{picks:3, legs:'', pays:{all:+(stake*5).toFixed(2), m1:0, m2:0}, hits:null, payout:null}, snap:{at:iso(NOW-H), said:{decision:'PARLAY', onList:false}}});
const LOG=[
  // E1: settled exchange wins, priced as + Add a bet saves them in % mode (stake = the cost, odds from the @ %, the fee on top)
  single('kx', Object.assign({book:'Kalshi', odds:'+150', stake:10, date:'2026-11-14', start:iso(NOW-30*H), betnow:'O 10.5 +150', snap:{at:iso(NOW-31*H), fee:0.042}}, won)),
  single('pm', Object.assign({book:'Polymarket US', odds:'+300', stake:10, date:'2026-11-14', start:iso(NOW-30*H), betnow:'O 10.5 +300', snap:{at:iso(NOW-31*H), fee:0.052125}}, won)),
  single('nv', Object.assign({book:'Novig', odds:'+150', stake:10, date:'2026-11-14', start:iso(NOW-30*H), betnow:'O 10.5 +150', snap:{at:iso(NOW-31*H), fee:0}}, won)),
  // E2: today: singles $30 + $14.98 (+ the two $0.01 bets below = $45.00), a free $5 bet, two PrizePicks entries $10.00 and $10.01
  single('s1', {stake:30}), single('s2', {stake:14.98}), single('fr', {stake:5, free:true}), pl('p1',10), pl('p2',10.01),
  // E4: an own bet typed before v5.13 with no fair price (saved SKIP), and an own typed bet with a fair price the screener skipped
  single('un', {manual:true, stake:0.01, book:'BetMGM', fair:'', snap:{at:iso(NOW-H), fee:0, model:null, said:{decision:'SKIP', stake:0, onList:false}}}),
  single('sk', {manual:true, stake:0.01, book:'BetMGM', fair:'-120', snap:{at:iso(NOW-H), fee:0, model:0.52, act:0.51, said:{decision:'SKIP', stake:0, onList:false}}})];
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago', viewport:{width:1400,height:1000}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(L=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.log',JSON.stringify(L)); }catch(e){} }, LOG);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1200);
  const txt=s=>String(s||'').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();

  // ---- E1: the price shown is the price paid ----
  const P=await p.evaluate(()=>Object.fromEntries(['kx','pm','nv'].map(id=>{ const x=logged.find(y=>y.id===id); return [id, {odds:x.odds, pl:betProfit(x)}]; })));
  check('E1: profits unchanged: Kalshi +$13.99, Polymarket US +$28.02, Novig +$15.00; saved odds still +150 / +300 / +150', P.kx.pl===13.99 && P.pm.pl===28.02 && P.nv.pl===15 && P.kx.odds==='+150' && P.pm.odds==='+300' && P.nv.odds==='+150', P);
  await p.click('.tab[data-view="v-log"]'); await p.waitForTimeout(400);
  const row=await p.evaluate(()=>Object.fromEntries(['kx','pm','nv'].map(id=>{ const i=logged.findIndex(y=>y.id===id), tr=document.querySelector('#logBody button.kill.edit[data-i="'+i+'"]').closest('tr');
    return [id, {odds:tr.cells[3].innerText.replace(/\s+/g,' ').trim(), line:tr.cells[1].querySelector('.meta').textContent.replace(/\s+/g,' ').trim()}]; })));
  check('E1: Bet log row, Kalshi: Odds "+140" with "40¢ + fee" under it; the bet line says +140', /^\+140 40¢ \+ fee$/.test(row.kx.odds) && /\+140$/.test(row.kx.line), row.kx);
  check('E1: Bet log row, Polymarket US: Odds "+280" with "25¢ + fee" under it', /^\+280 25¢ \+ fee$/.test(row.pm.odds) && /\+280$/.test(row.pm.line), row.pm);
  check('E1: Bet log row, Novig (no fee): "+150" as saved', row.nv.odds==='+150' && /\+150$/.test(row.nv.line), row.nv);
  const rp=await p.evaluate(()=>{ const L=['kx','pm','nv'].map(id=>logged.find(y=>y.id===id)); const d=document.createElement('div'); d.innerHTML=rpListHtml(L,false,true);
    return [...d.querySelectorAll('td[data-l="Odds"]')].map(td=>[...td.childNodes].map(n=>n.textContent).join(' ').replace(/\s+/g,' ').trim()).concat([...d.querySelectorAll('td[data-l="Profit"]')].map(td=>td.textContent.replace(/[^\d.+−-]/g,''))); });
  check('E1: Reports settled table: +140 (40¢ + fee) +$13.99, +280 (25¢ + fee) +$28.02, +150 +$15.00', rp[0]==='+140 40¢ + fee' && rp[1]==='+280 25¢ + fee' && rp[2]==='+150' && /13\.99/.test(rp[3]) && /28\.02/.test(rp[4]) && /15\.00/.test(rp[5]), rp);

  // ---- E2: the daily-max meter counts what the Hard stop counts ----
  await p.evaluate(()=>{ document.getElementById('bank').value='1000'; document.getElementById('dayMaxPct').value='10'; lcDay=ctDay(Date.now()); lcRender(); });
  const M=await p.evaluate(d=>({meter:document.getElementById('lcMaxL').textContent, hard:+(dayStats()[d].staked).toFixed(2), max:cfgRead().dayMax, bar:document.getElementById('lcMax').value}), DAY);
  check('E2: meter "$65.01 of your $100.00 daily max · $34.99 left" = the Hard stop’s $65.01 (singles $45 + entries $10.00 + $10.01; the free $5 bet is $0)', /^\$65\.01 of your \$100\.00 daily max · \$34\.99 left$/.test(M.meter) && M.hard===65.01 && M.max===100 && Math.abs(M.bar-65.01)<1e-9, M);

  // ---- E4 (older bets, display): TODAY reads an own bet with no fair price as not priced ----
  await p.evaluate(()=>{ renderTodayLine(); });
  const T=await p.evaluate(d=>{ const x=dayStats()[d]; return {line:document.getElementById('todayLine').textContent.replace(/\s+/g,' '), against:x.against, unpriced:x.unpriced, saved:logged.find(y=>y.id==='un').snap.said.decision}; }, DAY);
  check('E4: TODAY: 1 against the screener (the priced SKIP), 1 of your own not priced (the old SKIP with no fair price; its record still says SKIP)', T.against===1 && T.unpriced===1 && /1 against the screener/.test(T.line) && /1 of your own not priced/.test(T.line) && T.saved==='SKIP', T);

  // ---- E3: the Bet log's Add a parlay panel ----
  await p.evaluate(()=>{ document.getElementById('parlayPanel').open=true; }); await p.waitForTimeout(200);
  const has=await p.evaluate(()=>!!document.getElementById('plKind') && !!document.getElementById('plFree'));
  check('E3: the panel has Entry type (Power / Flex) and the Free entry tick', has, has);
  if(has){
    await p.selectOption('#plBook','PrizePicks'); await p.selectOption('#plKind','power'); await p.fill('#plPicks','4'); await p.fill('#plStake','5'); await p.waitForTimeout(100);
    let v=await p.evaluate(()=>({all:document.getElementById('plAll').value, flex:getComputedStyle(document.getElementById('plM1').closest('.field')).display}));
    check('E3: PrizePicks Power, 4 picks, $5 → Pays if all hit $50.00 (10x); the Flex payouts hidden', v.all==='50.00' && v.flex==='none', v);
    await p.selectOption('#plKind','flex'); await p.fill('#plPicks','5'); await p.fill('#plStake','10'); await p.waitForTimeout(100);
    v=await p.evaluate(()=>({all:plAll.value, m1:plM1.value, m2:plM2.value, flex:getComputedStyle(plM1.closest('.field')).display}));
    check('E3: Flex, 5 picks, $10 → $100.00 / $20.00 / $4.00 (10x / 2x / 0.4x), the Flex payouts shown', v.all==='100.00' && v.m1==='20.00' && v.m2==='4.00' && v.flex!=='none', v);
    await p.fill('#plAll','90'); await p.fill('#plPicks','4'); await p.waitForTimeout(100);
    v=await p.evaluate(()=>({all:plAll.value, m1:plM1.value}));
    check('E3: a Pays if all hit you typed ($90) is kept when Picks changes; the Flex payout you did not type follows (4 picks: $15.00)', v.all==='90' && v.m1==='15.00', v);
    // a free Power entry: $5, pays $50
    await p.selectOption('#plKind','power'); await p.fill('#plAll',''); await p.fill('#plStake','5'); await p.check('#plFree'); await p.waitForTimeout(100);
    const note=await p.$eval('#plNote',e=>e.textContent);
    const n0=await p.evaluate(()=>logged.length); await p.click('#plAdd'); await p.waitForTimeout(300);
    const F=await p.evaluate(n=>{ const x=logged[logged.length-1]; if(logged.length===n) return null; const w=Object.assign({},x,{result:'win'}), l=Object.assign({},x,{result:'loss'});
      return {free:x.free, stake:x.stake, all:x.parlay.pays.all, m1:x.parlay.pays.m1, win:betProfit(Object.assign({},w,{parlay:Object.assign({},x.parlay,{payout:50,hits:4})})), loss:betProfit(l), tick:plFree.checked, staked:+dayStats()[gameDayOf(x)].staked.toFixed(2)}; }, n0);
    check('E3: free entry saved with free:true, entry $5, pays $50.00, no partial payouts (Power); a win is +$45.00, a miss $0.00; the tick clears', F && F.free===true && F.stake===5 && F.all===50 && F.m1===0 && F.win===45 && F.loss===0 && F.tick===false, F);
    check('E3: the free entry adds $0 to the day (the Hard stop and the meter): still $65.01', F && F.staked===65.01, F&&F.staked);
    check('E3: the free entry note says what it costs and wins', /Free entry: it costs you \$0/.test(note) && /\$45\.00 \(the \$5\.00 entry does not come back\)/.test(note), note);
    await p.fill('#plPicks','13'); await p.fill('#plStake','5'); await p.fill('#plAll','60'); await p.click('#plAdd'); await p.waitForTimeout(150);
    const m13=await p.$eval('#plMsg',e=>e.textContent);
    check('E3: Picks 2 to 12, as + Add a bet (13 is refused)', m13==='Picks: 2 to 12.', m13);
    await p.fill('#plPicks','4');
    // layout at 4 widths: no box runs over the next field, the Book list fits its longest name
    for(const W of [390,1000,1280,1960]){ await p.setViewportSize({width:W, height:900}); await p.selectOption('#plKind','flex'); await p.waitForTimeout(150);
      const Lr=await p.evaluate(()=>{ const f=[...document.querySelectorAll('#parlayPanel .pl-form > .field')].filter(e=>e.offsetParent); let over=[];
        f.forEach(e=>{ const r=e.getBoundingClientRect(); e.querySelectorAll('input,select').forEach(i=>{ const q=i.getBoundingClientRect(); if(q.right>r.right+0.5 || q.left<r.left-0.5) over.push(i.id+' '+Math.round(q.right-r.right)); }); });
        const sel=document.getElementById('plBook'), c=document.createElement('canvas').getContext('2d'); c.font=getComputedStyle(sel).font; const need=Math.max(...[...sel.options].map(o=>c.measureText(o.text).width))+44;
        return {over, book:Math.round(sel.getBoundingClientRect().width), need:Math.round(need)}; });
      check('E3 at '+W+' px: no box wider than its field; Book list '+Lr.book+' px wide for its longest name ('+Lr.need+' px with padding and arrow)', !Lr.over.length && Lr.book>=Lr.need, Lr); }
    await p.setViewportSize({width:1400, height:1000});
  }

  // ---- E1 form + E4 new save: + Add a bet, a Kalshi bet with no fair price ----
  await p.evaluate(()=>document.querySelector('.tab[data-view="v-add"]').click()); await p.waitForTimeout(300);
  await p.selectOption('#abSport','NBA'); await p.waitForTimeout(900); await p.waitForSelector('#abHost .editor');
  await p.selectOption('#abType','moneyline'); await p.fill('#abGameFree','SAC @ UTA'); await p.dispatchEvent('#abGameFree','input'); await p.waitForTimeout(150);
  await p.fill('#abDate','2026-11-16'); if(await p.isVisible('#abTeam')) await p.selectOption('#abTeam',{index:1}).catch(()=>{}); else await p.fill('#abTeamFree','UTA');
  const form=async(book,pc)=>{ await p.selectOption('#abHost .eb-book',book); await p.selectOption('#abHost .eb-mode','pct'); await p.fill('#abHost .eb-win',''); await p.fill('#abHost .eb-cost','10'); await p.fill('#abHost .eb-pct',pc); await p.waitForTimeout(150); return p.$eval('#abHost .eb-calc',e=>e.textContent); };
  const fk=await form('Kalshi','40'), fp=await form('Polymarket US','25'), fn=await form('Novig','40');
  check('E1: the form: Kalshi $10 at 40% says "= 40¢ + fee = +140 paid"', /^= 40¢ \+ fee = \+140 paid/.test(fk), fk);
  check('E1: the form: Polymarket US $10 at 25% says "= 25¢ + fee = +280 paid"', /^= 25¢ \+ fee = \+280 paid/.test(fp), fp);
  check('E1: the form: Novig $10 at 40% (no fee) says "= +150"', /^= \+150 \(/.test(fn), fn);
  await form('Kalshi','40'); await p.fill('#abHost .eb-win',''); await p.waitForTimeout(100);
  const verdict=await p.$eval('#abVerdict',e=>e.textContent.replace(/\s+/g,' ')).catch(()=>'');
  const n1=await p.evaluate(()=>logged.length); for(let i=0;i<4 && await p.evaluate(()=>logged.length)===n1;i++){ await p.click('#abHost .eb-save'); await p.waitForTimeout(400); }
  const S=await p.evaluate(n=>{ if(logged.length===n) return {notSaved:document.querySelector('#abHost .eb-msg')&&document.querySelector('#abHost .eb-msg').textContent}; const x=logged[logged.length-1];
    return {odds:x.odds, stake:x.stake, fee:x.snap.fee, said:x.snap.said, inSc:inScorecard(x), shown:typeof oddsShownTxt==='function'?oddsShownTxt(x):x.odds, win:betProfit(Object.assign({},x,{result:'win'}))}; }, n1);
  check('E4: the card said "Can’t judge it yet"', /Can.t judge it yet/.test(verdict), verdict.slice(0,60));
  check('E4: saved as NO FAIR PRICE (unpriced, not on the list, stake 0), not SKIP; still in the Scorecard population', S.said && S.said.decision==='NO FAIR PRICE' && S.said.unpriced===true && S.said.onList===false && S.inSc===true, S);
  check('E1: the bet saved: odds +150, stake $10, fee 0.042 (as before); shown +140; a win +$13.99', S.odds==='+150' && S.stake===10 && S.fee===0.042 && S.shown==='+140' && S.win===13.99, S);
  const T2=await p.evaluate(()=>{ const x=logged[logged.length-1], d=dayStats()[gameDayOf(x)]; return {against:d.against, unpriced:d.unpriced}; });
  check('E4: the new one counts as not priced on its day, not against', T2.against===0 && T2.unpriced===1, T2);

  check('no page errors', !errs.length, errs.slice(0,3));
  console.log('\n'+pass+' passed, '+fail+' failed'); await b.close(); process.exit(fail?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
