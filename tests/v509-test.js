// node tests/v509-test.js — v5.09 (owner 11/15: "i want it to show both. Because it does say, TOTAL WIN or To Win."). Bovada's bet history says "Winnings +$3.04"
// for a $1.52 bet at 2.00: that is the total return (stake back included), and it went into To win (Trent Walker, 11/13). The sportsbook boxes of the bet form
// (+ Add a bet, I bet this, Bet log › edit) now show To win (the profit, what is saved as towin, unchanged) and Total payout (stake included), linked both ways;
// a new Stake keeps the one typed last and moves the other; a free bet's Total payout = To win; a To win that equals Stake × decimal odds says it looks like a
// total payout, and "Use $X" moves it. The % boxes (Cost, @ %, Pays back / Max payout) are unchanged. The Bet log row of an open single and Reports › Open bets
// show "$1.52 · total $3.04". Display and input only: Save, betProfit and the saved fields do not change.
// v5.09 review fixes: emptying a Total payout that was filled in for you keeps the To win you typed (S14), emptying To win empties both; the pair wraps together;
// the free-bet note sits on the line under the boxes; the boxes are 108 px on a phone; in Bet log › edit on a phone the new lines and the Real money box start at the left.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,500)); };
const NOW=Date.parse('2026-11-15T18:00:00Z'), H=3600e3, iso=ms=>new Date(ms).toISOString();   // Sun 12:00 CT
const ev={ id:'401909001', date:'2026-11-16T01:00Z', shortName:'CHA @ DET',   // tonight 7 PM CT, not started
  status:{type:{state:'pre',completed:false,name:'STATUS_SCHEDULED',detail:'Sun, November 15th at 8:00 PM EST',shortDetail:'11/15 - 8:00 PM EST'}},
  competitions:[{ competitors:[
    {homeAway:'home',score:'0',team:{abbreviation:'DET',shortDisplayName:'Pistons',name:'Pistons',location:'Detroit'}},
    {homeAway:'away',score:'0',team:{abbreviation:'CHA',shortDisplayName:'Hornets',name:'Hornets',location:'Charlotte'}} ] }] };
// two board rows (as editor-stays-test): 🪙 Volado bets on Kalshi, so a card has I bet this
const team=(ha,abbr)=>({ha,id:abbr,abbr,name:abbr,loc:abbr,nick:abbr,logo:'',rec:'',color:'333333',alt:'ffffff'});
const row=(o)=>Object.assign({name:'Miami (OH) RedHawks',team:'M-OH',game:'OHIO @ M-OH',matchup:'M-OH vs OHIO',side:'',sport:'NCAAF',market:'Moneyline',kind:'moneyline',book:'Kalshi',offeredRaw:'-108',offeredProb:0.519,fairProb:0.551,fairRaw:'',mktProb:0.551,stars:null,evModel:'market',
  gameInfo:{state:'pre',startISO:iso(NOW+5*H),timeCT:'',detail:'',teams:[team('away','OHIO'),team('home','M-OH')]},src:'api:oddsapi:NCAAF',apiKey:'k1'},o||{});
const ROWS=[row(), row({name:'Akron Zips',team:'AKR',game:'AKR @ KENT',matchup:'AKR @ KENT',offeredRaw:'-105',offeredProb:0.512,fairProb:0.55,mktProb:0.55,apiKey:'k2',gameInfo:{state:'pre',startISO:iso(NOW+6*H),timeCT:'',detail:'',teams:[team('away','AKR'),team('home','KENT')]}})];
// a parlay already in the log (open, with a typed To win): Reports shows its To win with no total (parlays unchanged)
const LOG=[{id:'pl1', key:'pl1', kind:'parlay', sport:'NBA', book:'DraftKings', name:'3-pick parlay', market:'Parlay', odds:'+600', stake:5, towin:30, date:'2026-11-15', dateSet:true, parlay:{picks:3, pays:{all:35}, legs:'a; b; c'}, snap:{at:iso(NOW-H)}}];
const TW_TIP='The profit only (your stake not included). Some books call it To Win.';
const TT_TIP='What comes back if it wins: your stake plus the profit. Some books call it Total Win, Payout, Return or (Bovada) Winnings.';
(async()=>{
  const b=await chromium.launch();
  const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:1280,height:900}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(([rows,L,d])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows})); localStorage.setItem('mbev.log',JSON.stringify(L)); }catch(e){} }, [ROWS,LOG,'2026-11-15']);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*', r=>{ const u=r.request().url();
    if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/site\.api\.espn\.com.*\/basketball\/nba\/scoreboard/.test(u)){ const m=u.match(/dates=(\d{8})/), d=m&&m[1];
      return r.fulfill({contentType:'application/json',body:JSON.stringify({events:(!d||d==='20261115')?[ev]:[]})}); }
    if(/espn\.com/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'});
    if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:'{}'});
    return r.abort(); });
  await p.goto('http://app.test/index.html'); await p.waitForTimeout(1500);
  const q=s=>'#abHost '+s, v=s=>p.$eval(q(s),e=>e.value), T=s=>p.$eval(q(s),e=>e.textContent.trim()), pause=()=>p.waitForTimeout(250);
  const fill=async(s,x)=>{ await p.fill(q(s),x); await pause(); };
  const pay=()=>p.evaluate(()=>{ const e=document.querySelector('#abHost .editor'); return e&&e._own?e._own.pay:null; });
  // ---- + Add a bet: a moneyline on tonight's game, at Bovada, in odds
  await p.evaluate(()=>document.querySelector('.tab[data-view="v-add"]').click()); await p.waitForTimeout(500);
  await p.selectOption('#abSport','NBA'); await p.waitForTimeout(1500);
  async function setup(book){ await p.selectOption('#abGame','401909001'); await p.selectOption('#abType','moneyline'); await p.waitForTimeout(200);
    await p.selectOption('#abTeam','DET'); await p.waitForSelector('#abHost .editor'); await p.selectOption(q('.eb-book'),book); await pause(); }
  async function save(){ const n0=await p.evaluate(()=>logged.length);
    for(let i=0;i<3;i++){ if(await p.evaluate(()=>logged.length)>n0) break; await p.click(q('.eb-save')); await p.waitForTimeout(400); }
    await p.waitForTimeout(800); return p.evaluate(n0=>{ if(logged.length<=n0) return null; const x=logged[logged.length-1]; return {odds:x.odds, stake:x.stake, towin:x.towin, book:x.book, ifWin:betProfit(Object.assign({},x,{result:'win'}))}; }, n0); }
  await setup('Bovada');
  const ui=await p.evaluate(()=>{ const h=document.getElementById('abHost'), lab=c=>{ const i=h.querySelector(c), l=i&&i.closest('label'); return l?{t:l.textContent.trim(), tip:l.title}:null; };
    return {mode:h.querySelector('.eb-mode').value, win:lab('.eb-win-o'), tot:lab('.eb-tot-o'), freeHidden:!h.querySelector('.eb-tot-free'), chk:h.querySelector('.eb-tw-chk').textContent, chkShown:getComputedStyle(h.querySelector('.eb-tw-chk')).display!=='none'}; });   // v5.09 (review): the free-bet note is only there (in the check line) when Free bet is ticked
  check('+ Add a bet, odds: To win $ and Total payout $ side by side, with the tips the scope gives', ui.mode==='odds' && ui.win && ui.win.t==='To win $' && ui.win.tip===TW_TIP && ui.tot && ui.tot.t==='Total payout $' && ui.tot.tip===TT_TIP, ui);
  check('nothing typed: no free-bet note, no check line', ui.freeHidden && ui.chk==='' && !ui.chkShown, ui);
  await fill('.eb-odds','+100'); await fill('.eb-stake','1.52');
  await fill('.eb-win-o','1.52');
  let s={win:await v('.eb-win-o'), tot:await v('.eb-tot-o'), pay:await pay(), chk:await T('.eb-tw-chk')};
  check('type To win 1.52 on $1.52 → Total payout fills 3.04 (Stake + To win)', s.win==='1.52' && s.tot==='3.04' && s.pay==='win' && s.chk==='', s);
  await fill('.eb-stake','2.00');
  s={win:await v('.eb-win-o'), tot:await v('.eb-tot-o')};
  check('Stake changed to 2.00 after typing To win: To win stays 1.52, Total payout 3.52', s.win==='1.52' && s.tot==='3.52', s);
  await fill('.eb-tot-o','5.00');
  s={win:await v('.eb-win-o'), tot:await v('.eb-tot-o'), pay:await pay()};
  check('type Total payout 5.00 on $2.00 → To win fills 3.00 (Total − Stake)', s.win==='3.00' && s.tot==='5.00' && s.pay==='tot', s);
  await fill('.eb-stake','2.50');
  s={win:await v('.eb-win-o'), tot:await v('.eb-tot-o')};
  check('Stake changed to 2.50 after typing Total payout: Total stays 5.00, To win 2.50', s.win==='2.50' && s.tot==='5.00', s);
  await fill('.eb-odds','-110');
  s={win:await v('.eb-win-o'), tot:await v('.eb-tot-o'), chk:await T('.eb-tw-chk')};
  check('Odds changed: the pair stays (To win 2.50, Total 5.00), no check line', s.win==='2.50' && s.tot==='5.00' && s.chk==='', s);
  await fill('.eb-tot-o','2.00');
  s={win:await v('.eb-win-o'), tot:await v('.eb-tot-o'), chk:await T('.eb-tw-chk')};
  check('Total payout 2.00 under the $2.50 stake: To win 0.00 (never below 0) and the warning', s.win==='0.00' && s.tot==='2.00' && /less than the stake: a total payout includes the stake/.test(s.chk), s);
  await fill('.eb-tot-o','');
  s={win:await v('.eb-win-o'), tot:await v('.eb-tot-o'), pay:await pay(), chk:await T('.eb-tw-chk')};
  check('Total payout emptied: To win (which came from it) empties too, no line', s.win==='' && s.tot==='' && s.pay==='' && s.chk==='', s);
  // v5.09 (review S14, Los Desconfiados): To win typed (a boost), then the Total payout that was filled in for you is emptied: the To win you typed stays, and Save keeps it
  await fill('.eb-odds','-110'); await fill('.eb-stake','10'); await fill('.eb-win-o','9.50');
  const b14={tot:await v('.eb-tot-o'), pay:await pay()};
  await fill('.eb-tot-o','');
  const a14={win:await v('.eb-win-o'), tot:await v('.eb-tot-o'), pay:await pay(), chk:await T('.eb-tw-chk')};
  check('review S14: -110, $10, To win 9.50 → Total 19.50; emptying that Total payout keeps To win 9.50 (Total stays empty, no line)', b14.tot==='19.50' && b14.pay==='win' && a14.win==='9.50' && a14.tot==='' && a14.pay==='win' && a14.chk==='', {b14, a14});
  await fill('.eb-stake','11');
  const r14={win:await v('.eb-win-o'), tot:await v('.eb-tot-o')};
  check('review S14: a new Stake fills Total payout again ($11: To win 9.50, Total 20.50)', r14.win==='9.50' && r14.tot==='20.50', r14);
  await fill('.eb-stake','10');
  // the other way: Total payout typed (To win filled in), then To win emptied: To win is what Save keeps, so both empty and the screen shows what Save will keep
  await fill('.eb-tot-o','19.50'); const b2={win:await v('.eb-win-o'), pay:await pay()};
  await fill('.eb-win-o',''); const a2={win:await v('.eb-win-o'), tot:await v('.eb-tot-o'), pay:await pay()};
  check('review: Total 19.50 typed → To win 9.50; emptying To win empties both (To win is what Save keeps)', b2.win==='9.50' && b2.pay==='tot' && a2.win==='' && a2.tot==='' && a2.pay==='', {b2, a2});
  await fill('.eb-win-o','9.50'); await fill('.eb-tot-o','');
  const s14=await save();
  check('review S14: Save after emptying that Total payout keeps towin 9.5 at -110 (if it wins +$9.50, not the $9.09 the odds pay)', s14 && s14.towin===9.5 && s14.stake===10 && s14.odds==='-110' && s14.ifWin===9.5, s14);
  await setup('Bovada');
  // the Bovada case: $3.04 typed into To win for $1.52 at +100
  await fill('.eb-odds','+100'); await fill('.eb-stake','1.52'); await fill('.eb-win-o','3.04');
  s={win:await v('.eb-win-o'), tot:await v('.eb-tot-o'), chk:await T('.eb-tw-chk'), btn:await p.$eval(q('.eb-tw-chk'),e=>{ const x=e.querySelector('button.eb-tw-use'); return x?x.textContent:null; })};
  check('To win 3.04 on $1.52 at +100 (= Stake × 2.00): "This looks like the total payout (stake included). To win would be $1.52." with Use $1.52', s.chk.startsWith('This looks like the total payout (stake included). To win would be $1.52.') && s.btn==='Use $1.52' && s.tot==='4.56', s);
  await p.click(q('.eb-tw-use')); await pause();
  s={win:await v('.eb-win-o'), tot:await v('.eb-tot-o'), pay:await pay(), chk:await T('.eb-tw-chk')};
  check('Use $1.52 moves 3.04 to Total payout: To win 1.52, Total 3.04, the line is gone', s.win==='1.52' && s.tot==='3.04' && s.pay==='tot' && s.chk==='', s);
  let sv=await save();
  check('Save: towin 1.52 is saved (the profit), $1.52 at +100; if it wins +$1.52', sv && sv.towin===1.52 && sv.stake===1.52 && sv.odds==='+100' && sv.ifWin===1.52, sv);
  // decimal and -110: the same check reads the price as typed
  await setup('Bovada'); await fill('.eb-odds','2.00'); await fill('.eb-stake','1.52'); await fill('.eb-win-o','3.04');
  const dec=await T('.eb-tw-chk');
  await fill('.eb-odds','-110'); await fill('.eb-stake','10'); await fill('.eb-win-o','19.09');
  const m110=await T('.eb-tw-chk'); await fill('.eb-win-o','9.09'); const ok110=await T('.eb-tw-chk');
  check('decimal 2.00 typed: the same line; -110: $19.09 on $10 says To win would be $9.09, $9.09 says nothing', /To win would be \$1\.52\./.test(dec) && /To win would be \$9\.09\./.test(m110) && ok110==='', {dec, m110, ok110});
  // type Total payout, Save: To win is what is saved
  await fill('.eb-win-o',''); await fill('.eb-odds','+150'); await fill('.eb-stake','2.00'); await fill('.eb-tot-o','5.00');
  s={win:await v('.eb-win-o'), tot:await v('.eb-tot-o')};
  sv=await save();
  check('type Total payout 5.00 on $2.00 at +150 → To win 3.00, and Save keeps towin 3 (if it wins +$3.00)', s.win==='3.00' && s.tot==='5.00' && sv && sv.towin===3 && sv.stake===2 && sv.ifWin===3, {s, sv});
  // odds left blank: Stake + Total payout still give the price (through To win, as v3.47)
  await setup('Bovada'); await fill('.eb-odds',''); await fill('.eb-stake','4.00'); await fill('.eb-tot-o','10.00');
  sv=await save();
  check('Odds blank, Stake 4.00 and Total payout 10.00: saved at +150 with towin 6', sv && sv.odds==='+150' && sv.towin===6 && sv.stake===4, sv);
  // ---- exchange mode unchanged: Polymarket opens in %, the sportsbook boxes are hidden, Cost + Pays back as before
  await setup('Polymarket');
  const pm=await p.evaluate(()=>{ const h=document.getElementById('abHost'), vis=c=>{ const e=h.querySelector(c); return !!(e && e.offsetParent!==null); };
    return {mode:h.querySelector('.eb-mode').value, tot:vis('.eb-tot-o'), win:vis('.eb-win-o'), cost:vis('.eb-cost'), pct:vis('.eb-pct'), payL:(h.querySelector('.eb-win-l')||{}).textContent, chk:vis('.eb-tw-chk')}; });
  check('exchange mode (Polymarket, %): Cost, @ % and Pays back $ as before; To win and Total payout hidden', pm.mode==='pct' && pm.cost && pm.pct && pm.payL==='Pays back $' && !pm.tot && !pm.win && !pm.chk, pm);
  await fill('.eb-pct',''); await fill('.eb-cost','10.00'); await fill('.eb-win','15.50');
  sv=await save();
  check('% mode Save unchanged: Cost 10 + Pays back 15.50 → towin 5.5', sv && sv.towin===5.5 && sv.stake===10, sv);
  // ---- 390 px: the form wraps inside the phone screen, with the check line showing
  await p.setViewportSize({width:390,height:860}); await setup('Bovada'); await fill('.eb-odds','+100'); await fill('.eb-stake','1.52'); await fill('.eb-win-o','3.04');
  const ph=await p.evaluate(()=>{ const e=document.querySelector('#abHost .editor'), r=e.getBoundingClientRect(), out=[...e.querySelectorAll('label,.eb-tw-chk,button')].filter(x=>x.offsetParent!==null && x.getBoundingClientRect().right>innerWidth+1).map(x=>x.className||x.textContent.trim().slice(0,20));
    const small=[...e.querySelectorAll('.eb-tw-chk, .eb-tot-l')].map(x=>parseFloat(getComputedStyle(x).fontSize));
    return {side:document.documentElement.scrollWidth>innerWidth, right:Math.round(r.right), inner:innerWidth, out, small, chk:!!e.querySelector('.eb-tw-chk button')}; });
  check('390 px: + Add a bet with Total payout and the check line: no sideways scroll, every box inside the screen, text 12 px or more', !ph.side && ph.right<=ph.inner && !ph.out.length && ph.chk && ph.small.every(x=>x>=12), ph);
  const pw=await p.evaluate(()=>{ const e=document.querySelector('#abHost .editor'), f=e.getBoundingClientRect(), w=e.querySelector('.eb-win-o').getBoundingClientRect(), t=e.querySelector('.eb-tot-o').getBoundingClientRect(); return {wW:Math.round(w.width), tW:Math.round(t.width), inside:w.left>=f.left && t.left>=f.left && w.right<=f.right && t.right<=f.right}; });
  check('390 px, + Add a bet: the To win and Total payout boxes are 104 px or wider ("optional" fits at the phone type size), inside the form', pw.wW>=104 && pw.tW>=104 && pw.inside, pw);   // v5.09 (review)
  await fill('.eb-win-o',''); await p.setViewportSize({width:1280,height:900});
  // ---- I bet this on a board card: the same pair (the Kalshi card switched to odds)
  await p.evaluate(()=>{ document.querySelector('.tab[data-view="v-board"]').click(); setMode('volado'); }); await p.waitForTimeout(500);
  const card=await p.evaluate(()=>{ const c=[...document.querySelectorAll('#placeCards .pcard')].find(x=>/AKR @ KENT/.test(x.textContent)); if(!c) return false; c.querySelector('.bet-btn').click(); return true; }); await pause();
  const cq=s=>'#placeCards .editor '+s;
  if(card){ await p.selectOption(cq('.eb-mode'),'odds'); await pause(); await p.fill(cq('.eb-odds'),'+100'); await p.fill(cq('.eb-stake'),'2.00'); await p.fill(cq('.eb-win-o'),'2.00'); await pause(); }
  const ib=card?await p.evaluate(()=>{ const e=document.querySelector('#placeCards .editor'); return {tot:e.querySelector('.eb-tot-o').value, chk:e.querySelector('.eb-tw-chk').textContent}; }):null;
  if(card){ await p.fill(cq('.eb-tot-o'),'4.40'); await pause(); }
  const ib2=card?await p.evaluate(()=>{ const e=document.querySelector('#placeCards .editor'); const x={win:e.querySelector('.eb-win-o').value}; e.querySelector('.eb-cancel').click(); return x; }):null;
  check('I bet this (card, odds): To win 2.00 on $2.00 → Total payout 4.00; Total 4.40 → To win 2.40', card && ib && ib.tot==='4.00' && ib.chk==='' && ib2 && ib2.win==='2.40', {card, ib, ib2});
  // ---- Bet log: the open single shows to win · total; edit it as a free bet
  await p.evaluate(()=>document.querySelector('.tab[data-view="v-log"]').click()); await p.waitForTimeout(600);
  const lg=await p.evaluate(()=>{ const i=logged.findIndex(x=>x.towin===1.52 && x.book==='Bovada'); const btn=document.querySelector('#logBody button.kill.edit[data-i="'+i+'"]'), tr=btn&&btn.closest('tr'), tw=tr&&tr.querySelector('.lg-tw');
    const pl=logged.findIndex(x=>x.kind==='parlay'), ptr=document.querySelector('#logBody .pl-edit[data-i="'+pl+'"]'); return {i, txt:tw?tw.textContent.replace(/ /g,' '):null, size:tw?parseFloat(getComputedStyle(tw).fontSize):null, parlay:ptr?!!ptr.closest('tr').querySelector('.lg-tw'):null}; });
  check('Bet log row of the open $1.52 bet: "to win $1.52 · total $3.04" in small print (12 px); the parlay row has none', lg.txt==='to win $1.52 · total $3.04' && lg.size>=12 && lg.parlay===false, lg);
  await p.evaluate(i=>document.querySelector('#logBody button.kill.edit[data-i="'+i+'"]').click(), lg.i); await pause();
  const eq=s=>'#logBody tr.editor '+s;
  const e0=await p.evaluate(()=>{ const e=document.querySelector('#logBody tr.editor'); return {win:e.querySelector('.eb-win-o').value, tot:e.querySelector('.eb-tot-o').value, freeHidden:!e.querySelector('.eb-tot-free')}; });   // v5.09 (review): the note lives in the check line, only while Free bet is ticked
  check('Bet log › edit: To win and Total payout start empty (as To win did), no free note', e0.win==='' && e0.tot==='' && e0.freeHidden, e0);
  await p.check(eq('.eb-free')); await pause();
  await p.fill(eq('.eb-win-o'),'1.52'); await pause();
  const e1=await p.evaluate(()=>{ const e=document.querySelector('#logBody tr.editor'); return {tot:e.querySelector('.eb-tot-o').value, note:(e.querySelector('.eb-tw-chk .eb-tot-free')||{}).textContent||null, chk:e.querySelector('.eb-tw-chk').textContent}; });
  check('free bet: To win 1.52 → Total payout 1.52 (the stake does not come back), with the note on the line under the boxes (and nothing else there)', e1.tot==='1.52' && e1.note==='(free bet: the stake does not come back)' && e1.chk==='(free bet: the stake does not come back)', e1);   // v5.09 (review): the note moved to the check line
  await p.fill(eq('.eb-win-o'),'3.04'); await pause();
  const e2=await p.evaluate(()=>{ const e=document.querySelector('#logBody tr.editor'); return {tot:e.querySelector('.eb-tot-o').value, chk:e.querySelector('.eb-tw-chk').textContent}; });
  await p.fill(eq('.eb-tot-o'),'1.00'); await pause();
  const e3=await p.evaluate(()=>{ const e=document.querySelector('#logBody tr.editor'); return {win:e.querySelector('.eb-win-o').value, chk:e.querySelector('.eb-tw-chk').textContent}; });
  check('free bet: no "looks like the total payout" line, Total 1.00 under the stake → To win 1.00 and no warning (only the free-bet note)', e2.tot==='3.04' && e2.chk==='(free bet: the stake does not come back)' && e3.win==='1.00' && e3.chk==='(free bet: the stake does not come back)', {e2, e3});   // v5.09 (review): the note sits in the check line
  await p.uncheck(eq('.eb-free')); await pause();
  const e4=await p.evaluate(()=>{ const e=document.querySelector('#logBody tr.editor'); return {win:e.querySelector('.eb-win-o').value, tot:e.querySelector('.eb-tot-o').value, freeHidden:!e.querySelector('.eb-tot-free'), chk:e.querySelector('.eb-tw-chk').textContent}; });
  check('free bet ticked off again: Total 1.00 (typed last) stays, To win 0.00 and the "less than the stake" warning', e4.tot==='1.00' && e4.win==='0.00' && e4.freeHidden && /less than the stake/.test(e4.chk), e4);
  await p.fill(eq('.eb-tot-o'),'3.04'); await pause();
  await p.evaluate(()=>document.querySelector('#logBody tr.editor .eb-save').click()); await p.waitForTimeout(700);
  const ed=await p.evaluate(i=>({towin:logged[i].towin, free:!!logged[i].free, stake:logged[i].stake}), lg.i);
  check('Bet log › edit, Save with Total payout 3.04: towin 1.52, not free', ed.towin===1.52 && !ed.free && ed.stake===1.52, ed);
  // ---- Reports › Open bets: a single's To win shows its total, a parlay's does not
  await p.evaluate(()=>document.querySelector('.tab[data-view="v-reports"]').click()); await p.waitForTimeout(800);
  const rp=await p.evaluate(()=>[...document.querySelectorAll('#rpOpen tr')].map(tr=>{ const td=tr.querySelector('td[data-l="To win"]'), t=tr.querySelector('.tw-tot'); return td?{bet:tr.querySelector('.rp-bet').textContent, txt:td.textContent.replace(/ /g,' '), size:t?parseFloat(getComputedStyle(t).fontSize):null}:null; }).filter(Boolean));
  const one=rp.find(x=>/\$1\.52/.test(x.txt)), par=rp.find(x=>/parlay/i.test(x.bet));
  check('Reports › Open bets: "$1.52 · total $3.04" (total in 12 px small print); the parlay shows $30.00 only', one && one.txt==='$1.52 · total $3.04' && one.size>=12 && par && par.txt==='$30.00', rp);
  // ---- widths: no sideways scroll on the Bet log, Reports and + Add a bet (with the check line) at 390, 1000, 1280, 1960
  for(const W of [390,1000,1280,1960]){ await p.setViewportSize({width:W,height:900}); const out={};
    for(const view of ['v-log','v-reports','v-add']){ await p.evaluate(vw=>document.querySelector('.tab[data-view="'+vw+'"]').click(), view); await p.waitForTimeout(350);
      if(view==='v-add'){ await setup('Bovada'); await fill('.eb-odds','+100'); await fill('.eb-stake','1.52'); await fill('.eb-win-o','3.04'); }
      out[view]=await p.evaluate(vw=>{ const sel=vw==='v-add'?'#abHost .editor':vw==='v-reports'?'#rpPanel .rp-tw':null, e=sel?document.querySelector(sel):null; const o={side:document.documentElement.scrollWidth>innerWidth, right:e?Math.round(e.getBoundingClientRect().right):null};
        if(vw==='v-add' && e){ const w=e.querySelector('.eb-win-o').closest('label').getBoundingClientRect(), t=e.querySelector('.eb-tot-o').closest('label').getBoundingClientRect(); o.pair={same:Math.abs(w.top-t.top)<4, gap:Math.round(t.left-w.right)}; }   // v5.09 (review): where the pair sits
        return o; }, view); }
    check(W+' px: no sideways scroll on the Bet log, Reports and + Add a bet; the form and the Reports table inside the screen', Object.values(out).every(o=>!o.side && (o.right==null || o.right<=W)), out);
    if(W>=1000) check(W+' px, + Add a bet: To win $ and Total payout $ on one line, next to each other', !!out['v-add'].pair && out['v-add'].pair.same && out['v-add'].pair.gap>=0 && out['v-add'].pair.gap<=12, out['v-add']); }   // v5.09 (review): the pair was split across two rows at 1000 px
  // ---- I bet this on a card (v5.09 review: there the pair was split, To win at the end of one row and Total payout at the start of the next): side by side on a computer;
  //      at 390 px the two boxes are 104 px or wider and inside the card
  for(const W of [390,1000,1280,1960]){ await p.setViewportSize({width:W,height:900});
    await p.evaluate(()=>{ document.querySelector('.tab[data-view="v-board"]').click(); setMode('volado'); }); await p.waitForTimeout(500);
    const ok=await p.evaluate(()=>{ const c=[...document.querySelectorAll('#placeCards .pcard')].find(x=>/AKR @ KENT/.test(x.textContent)); if(!c) return false; if(!c.querySelector('.editor')) c.querySelector('.bet-btn').click(); return !!c.querySelector('.editor'); }); await pause();
    if(ok){ await p.selectOption(cq('.eb-mode'),'odds'); await pause(); }
    const pr=ok?await p.evaluate(()=>{ const e=document.querySelector('#placeCards .editor'), f=e.getBoundingClientRect(), wi=e.querySelector('.eb-win-o'), ti=e.querySelector('.eb-tot-o'), w=wi.closest('label').getBoundingClientRect(), t=ti.closest('label').getBoundingClientRect();
      const x={same:Math.abs(w.top-t.top)<4, gap:Math.round(t.left-w.right), wW:Math.round(wi.getBoundingClientRect().width), tW:Math.round(ti.getBoundingClientRect().width), inside:w.left>=f.left && t.left>=f.left && w.right<=f.right && t.right<=f.right}; e.querySelector('.eb-cancel').click(); return x; }):null;
    check(W+' px, I bet this on a card: '+(W<=390?'the To win and Total payout boxes are 104 px or wider, inside the card':'To win $ and Total payout $ on one line, next to each other'), !!(ok && pr && pr.inside && (W<=390 ? pr.wW>=104 && pr.tW>=104 : pr.same && pr.gap>=0 && pr.gap<=12)), {ok, pr}); }
  // ---- 390 px, Bet log › edit (the log table scrolls sideways; v5.09 review): the two boxes, the check line, the free-bet note and the Real money box start at the left,
  //      inside the part of the table you can see (the boxes had run off the right edge, the check line lost 19 px, the note and the Real money box were pushed off the screen)
  await p.setViewportSize({width:390,height:860}); await p.evaluate(()=>document.querySelector('.tab[data-view="v-log"]').click()); await p.waitForTimeout(400);
  await p.evaluate(i=>document.querySelector('#logBody button.kill.edit[data-i="'+i+'"]').click(), lg.i); await pause();
  const geo=()=>p.evaluate(()=>{ const e=document.querySelector('#logBody tr.editor'); let a=e.parentElement; while(a && a!==document.body){ const o=getComputedStyle(a).overflowX; if(o==='auto'||o==='scroll') break; a=a.parentElement; } a.scrollLeft=0;
    const R=a.getBoundingClientRect(), vis={l:Math.round(R.left+a.clientLeft), r:Math.round(R.left+a.clientLeft+a.clientWidth)};
    const box=s=>{ const x=e.querySelector(s); if(!x || !x.getClientRects().length) return null; const r=x.getBoundingClientRect(); return {l:Math.round(r.left), r:Math.round(r.right), t:Math.round(r.top), b:Math.round(r.bottom), w:Math.round(r.width)}; };
    const mb=box('.eb-money'); let prevB=-1e9; for(const c of e.querySelectorAll('.editor-row label, .editor-row .eb-tw-chk, .editor-row > b')){ if(c.closest('.eb-money')) continue; const r=c.getBoundingClientRect(); if(r.height>0 && r.bottom<=mb.t+1) prevB=Math.max(prevB,r.bottom); }
    return {vis, win:box('.eb-win-o'), tot:box('.eb-tot-o'), chk:box('.eb-tw-chk>span'), note:box('.eb-tw-chk .eb-tot-free'), txt:(e.querySelector('.eb-tw-chk')||{}).textContent||'', money:mb, rowL:box('.editor-row>b').l, gapAbove:Math.round(mb.t-prevB), side:document.documentElement.scrollWidth>innerWidth}; });
  const inVis=(g,x)=>!!x && x.l>=g.vis.l && x.r<=g.vis.r;
  const g0=await geo();
  await p.fill(eq('.eb-win-o'),'3.04'); await pause(); const g1=await geo();
  await p.fill(eq('.eb-win-o'),''); await p.check(eq('.eb-free')); await pause(); await p.fill(eq('.eb-win-o'),'1.52'); await pause(); const g2=await geo();
  await p.uncheck(eq('.eb-free')); await pause(); await p.evaluate(()=>document.querySelector('#logBody tr.editor .eb-cancel').click());
  check('390 px, Bet log › edit: To win and Total payout inside the part of the table you can see, 104 px or wider; no sideways scroll', [g0,g1,g2].every(g=>inVis(g,g.win) && inVis(g,g.tot) && !g.side) && g0.win.w>=104 && g0.tot.w>=104, g0);
  check('390 px, Bet log › edit: "This looks like the total payout" under the boxes, inside the part you can see (nothing cut at the right)', /^This looks like the total payout/.test(g1.txt) && inVis(g1,g1.chk) && g1.chk.t>=g1.tot.b-1, g1);
  check('390 px, Bet log › edit, Free bet ticked: "(free bet: the stake does not come back)" under the boxes, inside the part you can see', g2.txt==='(free bet: the stake does not come back)' && inVis(g2,g2.note) && g2.note.t>=g2.tot.b-1, g2);
  check('390 px, Bet log › edit: the Real money box starts its own line at the left (not pushed sideways by the new lines), 14 px under the line above, as before', [g0,g1,g2].every(g=>!!g.money && g.money.l===g.rowL && g.gapAbove===14), [g0,g1,g2].map(g=>({money:g.money, rowL:g.rowL, gap:g.gapAbove})));
  // ---- v5.09 (final check): the board shown as a table (cards off) on a phone: I bet this on a table row. Its scrolling area is 42 px in on both sides and the
  //      line starts 9 px into the cell, so "This looks like the total payout" lost 13 to 27 px at the right; it now ends inside the part you can see
  { const c2=await b.newContext({timezoneId:'America/Chicago',viewport:{width:390,height:900}}); await c2.clock.install({time:new Date(NOW)});
    await c2.addInitScript(([rows,d])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows})); localStorage.setItem('mbev.log','[]'); localStorage.setItem('mbev.cards','0'); }catch(e){} }, [ROWS,'2026-11-15']);
    const p2=await c2.newPage(); p2.on('pageerror',e=>errs.push('table view: '+e.message));
    await p2.route('**/*', r=>{ const u=r.request().url();
      if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
      if(/espn\.com/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'});
      if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:'{}'});
      return r.abort(); });
    await p2.goto('http://app.test/index.html'); await p2.waitForTimeout(1500);
    await p2.evaluate(()=>{ const t=document.querySelector('.tab[data-view="v-board"]'); if(t) t.click(); setMode('volado'); }); await p2.waitForTimeout(400);
    const tg=[];
    for(const W of [360,390,414]){ await p2.setViewportSize({width:W,height:900}); await p2.waitForTimeout(200);
      const opened=await p2.evaluate(()=>{ if(document.querySelector('#tbody tr.editor')) return true; const x=[...document.querySelectorAll('#tbody button.bet-btn')].find(x=>x.offsetParent!==null); if(!x) return false; x.click(); return true; }); await p2.waitForTimeout(300);
      if(!opened || !(await p2.$('#tbody tr.editor .eb-odds'))){ tg.push({W, opened:false}); continue; }
      await p2.selectOption('#tbody tr.editor .eb-mode','odds'); await p2.waitForTimeout(150);
      await p2.fill('#tbody tr.editor .eb-odds','+100'); await p2.fill('#tbody tr.editor .eb-stake','1.52'); await p2.fill('#tbody tr.editor .eb-win-o','3.04'); await p2.waitForTimeout(300);
      tg.push(await p2.evaluate(W=>{ const e=document.querySelector('#tbody tr.editor'); let a=e.parentElement; while(a && a!==document.body){ const o=getComputedStyle(a).overflowX; if(o==='auto'||o==='scroll') break; a=a.parentElement; }
        const sc=a&&a!==document.body?a:null; if(sc) sc.scrollLeft=0; const R=sc?sc.getBoundingClientRect():{left:0,right:innerWidth}, vis={l:Math.round(R.left), r:Math.round(Math.min(R.right,innerWidth))};
        const x=e.querySelector('.eb-tw-chk>span'), r=x&&x.getBoundingClientRect();
        return {W, vis, chk:r?{l:Math.round(r.left), r:Math.round(r.right)}:null, txt:(e.querySelector('.eb-tw-chk')||{}).textContent||'', side:document.documentElement.scrollWidth>innerWidth}; }, W)); }
    check('board as a table on a phone (360, 390, 414 px), I bet this: "This looks like the total payout" ends inside the part of the table you can see; no sideways scroll',
      tg.length===3 && tg.every(g=>g.chk && /^This looks like the total payout/.test(g.txt) && g.chk.l>=g.vis.l && g.chk.r<=g.vis.r && !g.side), tg);
    await c2.close(); }
  check('no page errors', !errs.length, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
