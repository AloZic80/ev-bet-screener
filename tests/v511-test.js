// node tests/v511-test.js — v5.11 (owner 11/15, about 12:50 AM: "remember, Add a Bet needs to allow me to do Parlay. I did a PrizePick parlay and won, and i want
// to add it."; agreed scope Q1). + Add a bet's Type gets "Parlay / pick'em (2+ picks)": the single-bet fields go out of sight (what you typed in them stays) and
// the parlay fields show: App / book, Entry type (Power / Flex), Picks, Entry $ with Free entry, Pays if all hit $ and To win $ (linked both ways by v5.09's
// ebTwWire), the Flex payouts, Game day, Placed at, Legs, Result and Paid $. Save writes the record the Bet log's "Add a parlay / Pick 6" panel writes
// (parlayRecord), plus the placed time (placedSet, as the single form: user_entered when typed, placed_now from the button, with the time zone), free:true for a
// free entry, and the result in the Bet log's "how many hit" fields (parlay.hits / parlay.payout). No value check; not in the daily max or the Scorecard.
// Checked here: every case the scope lists, with exact money; the same record as the panel for the same inputs (field by field, ignoring the id and the save
// time); graded like the Bet log's "how many hit" list; a reload and a sync merge keep every field; switching back to a single-bet Type gives the same form,
// verdict and saved bet as never leaving it (and, with a second file, the same bet as that file); the layout at 390, 1000, 1280 and 1960 px; no page errors.
// v5.11 review (before release): the Game day typed is the bet's day (dateSet); a Paid $ on a Won entry is its Pays too, so the Bet log row, "how many hit"
// and the parlay edit keep it; a free entry's Paid $ is the winnings (Paid $20 → +$20.00); Won refuses a Paid $ at or under the entry; a Partial's Paid $
// must be a Flex payout typed; Paid $ is emptied when the Result or Free entry changes; on a phone the selects take the whole row, the buttons are 44 px and a
// Save warning stays above the bottom bars; the parlay's own subtitle.
// Usage: node tests/v511-test.js [index.html] [an index.html from before v5.11, optional: the single bet is compared with the one it saves]
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium, devices } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8'), baseHtml=process.argv[3]?fs.readFileSync(process.argv[3],'utf8'):null;
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,700)); };
const NOW=Date.parse('2026-11-15T18:00:00Z');   // Sun 12:00 PM CT
const ev={ id:'401909001', date:'2026-11-16T01:00Z', shortName:'CHA @ DET',   // tonight 7 PM CT, not started
  status:{type:{state:'pre',completed:false,name:'STATUS_SCHEDULED',detail:'Sun, November 15th at 8:00 PM EST',shortDetail:'11/15 - 8:00 PM EST'}},
  competitions:[{ competitors:[
    {homeAway:'home',score:'0',team:{abbreviation:'DET',shortDisplayName:'Pistons',name:'Pistons',location:'Detroit'}},
    {homeAway:'away',score:'0',team:{abbreviation:'CHA',shortDisplayName:'Hornets',name:'Hornets',location:'Charlotte'}} ] }] };
const LEGS='Mahomes O 1.5 TD; Bijan O 70.5 rush; Kelce O 4.5 rec';
// a record as JSON with sorted keys; ign: key names left out at any depth (the id and the save times)
const canon=(o,ign)=>{ const f=x=>Array.isArray(x)?x.map(f):(x&&typeof x==='object')?Object.keys(x).sort().filter(k=>!(ign||[]).includes(k)&&x[k]!==undefined).reduce((a,k)=>(a[k]=f(x[k]),a),{}):x; return JSON.stringify(f(o)); };
const diffs=(a,b,ign,pre)=>{ const out=[], A=JSON.parse(canon(a,ign)), B=JSON.parse(canon(b,ign)); (function d(x,y,p){ if(x&&y&&typeof x==='object'&&typeof y==='object'&&!Array.isArray(x)){ new Set(Object.keys(x).concat(Object.keys(y))).forEach(k=>d(x[k],y[k],p?p+'.'+k:k)); } else if(JSON.stringify(x)!==JSON.stringify(y)) out.push((pre||'')+p); })(A,B,''); return out; };
async function newPage(b, file, W, dev){
  const ctx=await b.newContext(Object.assign(dev?Object.assign({},devices[dev]):{viewport:{width:W||1280,height:900}}, {timezoneId:'America/Chicago'})); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(()=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.log','[]'); }catch(e){} });
  const p=await ctx.newPage(), errs=[], live=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('request',r=>{ if(/\/live\?/.test(r.url())) live.push(r.url()); });
  await p.route('**/*', r=>{ const u=r.request().url();
    if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:file});
    if(/site\.api\.espn\.com.*\/basketball\/nba\/scoreboard/.test(u)){ const m=u.match(/dates=(\d{8})/), d=m&&m[1]; return r.fulfill({contentType:'application/json',body:JSON.stringify({events:(!d||d==='20261115')?[ev]:[]})}); }
    if(/espn\.com/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'});
    if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:'{}'});
    return r.abort(); });
  await p.goto('http://app.test/index.html'); await p.waitForTimeout(1500);
  return {ctx, p, errs, live}; }
(async()=>{
  const b=await chromium.launch();
  const {ctx, p, errs, live}=await newPage(b, html, 1280);
  const pause=(ms)=>p.waitForTimeout(ms||200);
  const setv=(sel,val)=>p.evaluate(([s,v])=>{ const e=document.querySelector(s); e.value=v; if(s==='#abParPlaced'){ delete e.dataset.at; delete e.dataset.v; } }, [sel,val]);   // a box out of sight: set quietly
  const shown=s=>p.evaluate(s=>{ const e=document.querySelector(s); return !!(e && e.offsetParent!==null); }, s);
  const toAdd=async()=>{ await p.evaluate(()=>document.querySelector('.tab[data-view="v-add"]').click()); await pause(400); };
  // fill the parlay form (every box set, so nothing is left from the case before) and press Save parlay
  async function par(o){
    if(await p.inputValue('#abType')!=='parlay'){ await p.selectOption('#abType','parlay'); await pause(); }
    await p.selectOption('#abParBook', o.book||'PrizePicks'); await p.selectOption('#abParKind', o.kind||'power'); await pause(100);
    await p.fill('#abParPicks', o.picks==null?'':String(o.picks)); await p.fill('#abParStake', o.stake==null?'':String(o.stake));
    await setv('#abParAll',''); await setv('#abParWin',''); await p.evaluate(()=>{ const g=document.getElementById('abType').closest('.ab-grid'); if(g._own) g._own.pay=''; });
    if(o.all!=null) await p.fill('#abParAll', String(o.all)); if(o.win!=null) await p.fill('#abParWin', String(o.win));
    if((o.kind||'power')==='flex'){ await p.fill('#abParM1', o.m1==null?'':String(o.m1)); await p.fill('#abParM2', o.m2==null?'':String(o.m2)); }
    await p.fill('#abParDay', o.day||'2026-11-15'); await setv('#abParPlaced',''); if(o.placed) await p.fill('#abParPlaced', o.placed); if(o.now) await p.click('#abParPlacedNow');
    await p.fill('#abParLegs', o.legs==null?'':o.legs); await p.setChecked('#abParFree', !!o.free);
    await p.selectOption('#abParResult', o.result||''); await pause(100);
    if(await shown('#abParPaid')) await p.fill('#abParPaid', o.paid==null?'':String(o.paid)); else await setv('#abParPaid','');
    await pause(100); const n0=await p.evaluate(()=>logged.length), clickAt=await p.evaluate(()=>Date.now()), note=await p.$eval('#abParNote',e=>e.textContent);   // v5.11 (review): the note as it reads before Save
    if(o.dbl) await p.dblclick('#abParSave'); else await p.click('#abParSave'); await pause(300);
    return p.evaluate(([n0,clickAt,note])=>{ const x=logged.length>n0?logged[logged.length-1]:null;
      return {saved:logged.length-n0, rec:x?JSON.parse(JSON.stringify(x)):null, i:x?logged.length-1:-1, profit:x?betProfit(x):null, msg:document.getElementById('abParMsg').textContent, ab:document.getElementById('abMsg').textContent, clickAt, note}; }, [n0,clickAt,note]); }

  // ---- 1. Choosing Parlay / pick'em: the single-bet fields go, the parlay fields show; the lists and the hint
  await toAdd(); await p.selectOption('#abSport','NBA'); await pause(1500);
  const opt=await p.evaluate(()=>[...document.querySelectorAll('#abType option')].map(o=>o.value+'='+o.textContent));
  check('Type has "Parlay / pick\'em (2+ picks)" after the four single-bet types', JSON.stringify(opt)===JSON.stringify(['prop=Player prop','spread=Spread','total=Game total','moneyline=Moneyline',"parlay=Parlay / pick'em (2+ picks)"]), opt);
  const SINGLE=['abSport','abGame','abGameFree','abDate','abPlaced','abPlacedNow','abPlayer','abStat','abPick','abLine','abResult','abHost','abMore','abVerdict','abAsk','abMode'];
  const PAR=['abParBook','abParKind','abParPicks','abParStake','abParFree','abParAll','abParWin','abParDay','abParPlaced','abParPlacedNow','abParLegs','abParResult','abParSave'];
  const vis=()=>p.evaluate(([S,P])=>{ const v=id=>{ const e=document.getElementById(id); return !!(e && e.offsetParent!==null); }; return {single:S.filter(v), par:P.filter(v), flex:['abParM1','abParM2'].filter(v), paid:v('abParPaid')}; }, [SINGLE,PAR]);
  const v0=await vis();
  check('Player prop (as before): the single-bet fields show, no parlay field', v0.par.length===0 && !v0.flex.length && !v0.paid && ['abSport','abGame','abDate','abPlaced','abPlayer','abStat','abPick','abLine','abResult','abHost','abAsk'].every(id=>v0.single.includes(id)), v0);
  await p.selectOption('#abType','parlay'); await pause();
  const v1=await vis();
  check('Parlay: game, player, stat, line, pick, the book price row, the verdict, Model numbers and What should I bet? are out of sight; the parlay fields show (no Flex payouts or Paid $ yet)', v1.single.length===0 && v1.par.length===PAR.length && !v1.flex.length && !v1.paid, v1);
  const lists=await p.evaluate(()=>({book:[...document.querySelectorAll('#abParBook option')].map(o=>o.value), kind:[...document.querySelectorAll('#abParKind option')].map(o=>o.textContent), res:[...document.querySelectorAll('#abParResult option')].map(o=>o.textContent),
    hint:[...document.querySelectorAll('#addBetPanel .ab-par-foot .hint')].filter(e=>e.offsetParent!==null).map(e=>e.textContent)[0]||'', day:document.getElementById('abParDay').value,
    labels:[...document.querySelectorAll('#addBetPanel .ab-par label')].filter(e=>e.offsetParent!==null).map(e=>e.textContent.trim())}));
  check('App / book: PrizePicks first, the scope\'s list, then Underdog Predict (also in the Bet log panel) and Other', JSON.stringify(lists.book)===JSON.stringify(['PrizePicks','Underdog','Sleeper','DraftKings Pick 6','Betr','ParlayPlay','Bovada','Novig','Kalshi','Polymarket','DraftKings Predictions','FanDuel Predicts','DraftKings','Underdog Predict','Other']), lists.book);
  check('Entry type "Power (all must hit)" / "Flex (pays if 1 or 2 miss)"; Result "Not played yet / Won (all hit) / Lost / Partial payout (Flex)"', JSON.stringify(lists.kind)===JSON.stringify(['Power (all must hit)','Flex (pays if 1 or 2 miss)']) && JSON.stringify(lists.res)===JSON.stringify(['Not played yet','Won (all hit)','Lost','Partial payout (Flex)']), lists);
  check('the labels in plain words (To win before Pays if all hit, as v5.09\'s To win | Total payout, so the Flex payouts follow Pays), and Game day starts at today (11/15)', JSON.stringify(lists.labels)===JSON.stringify(['App / book','Entry type','Picks','Entry $','🎁 Free entry','To win $','Pays if all hit $','Game day','Placed at','Result','Legs (optional note)']) && lists.day==='2026-11-15', lists.labels.concat([lists.day]));
  check('the hint: "The screener only prices single bets, so a parlay gets no value check."', lists.hint.startsWith('The screener only prices single bets, so a parlay gets no value check.'), lists.hint);
  await p.selectOption('#abParKind','flex'); await p.selectOption('#abParResult','win'); await pause();
  const v2=await vis(); const ph1=await p.evaluate(()=>document.getElementById('abParPaid').placeholder);
  await p.selectOption('#abParResult','partial'); await pause(); const v3=await vis();
  await p.selectOption('#abParResult','loss'); await pause(); const v4=await vis();
  check('Flex shows "…if 1 misses $" and "…if 2 miss $"; Won and Partial show Paid $, Lost does not', v2.flex.length===2 && v2.paid && v3.paid && !v4.paid, {v2, v3, v4, ph1});
  await p.selectOption('#abParKind','power'); await p.selectOption('#abParResult',''); await pause();
  check('Power again: the Flex payouts go', !(await vis()).flex.length, await vis());

  // ---- 2. Pays if all hit and To win, linked both ways (v5.09's ebTwWire); the free-entry note; a pay under the entry
  const tw=async()=>({win:await p.inputValue('#abParWin'), all:await p.inputValue('#abParAll'), note:await p.$eval('#abParNote',e=>e.textContent), warn:await p.$eval('#abParNote',e=>e.classList.contains('warn'))});
  await p.fill('#abParStake','5'); await p.fill('#abParAll','25'); await pause(100); let t=await tw();
  check('Entry $5, Pays if all hit $25 → To win fills $20.00 (Pays − Entry)', t.win==='20.00' && t.all==='25' && t.note==='', t);
  await p.fill('#abParWin','30'); await pause(100); t=await tw();
  check('To win $30 typed → Pays if all hit fills $35.00 (To win + Entry)', t.all==='35.00', t);
  await p.fill('#abParStake','10'); await pause(100); t=await tw();
  check('Entry changed to $10 after typing To win: To win stays $30, Pays $40.00 (as v5.09)', t.win==='30' && t.all==='40.00', t);
  await p.fill('#abParAll','50'); await pause(100); await p.fill('#abParStake','5'); await pause(100); t=await tw();
  check('Pays $50 typed, then Entry $5: Pays stays $50, To win $45.00', t.all==='50' && t.win==='45.00', t);
  await p.setChecked('#abParFree',true); await pause(100); t=await tw();
  check('Free entry ticked: To win stays Pays − Entry ($45.00, the app\'s free-parlay rule) and the note says what it means', t.win==='45.00' && t.note==='🎁 Free entry: it costs you $0, and a miss costs $0. If all hit you get the winnings, $45.00 (the $5.00 entry does not come back).' && !t.warn, t);
  await p.setChecked('#abParFree',false); await p.fill('#abParAll','4'); await pause(100); t=await tw();
  check('Pays $4 under the $5 entry: To win $0.00 (never below 0) and a calm warning in the parlay\'s words', t.win==='0.00' && t.warn && t.note==='Pays if all hit is less than the entry: it is everything you get back if every pick hits, your entry included.', t);
  const noAsk=live.length;

  // ---- 3. The scope's cases, with exact money
  const W1=await par({picks:3, stake:5, all:25, result:'win', placed:'2026-11-15T10:30', legs:LEGS});
  const r1=W1.rec||{}, P1=r1.parlay||{};
  check('PrizePicks 3-pick Power $5 paying $25, Won: one Bet log parlay, stake 5, payout 25, profit +$20.00, result win, book PrizePicks, 3 of 3 hit',
    W1.saved===1 && r1.kind==='parlay' && r1.book==='PrizePicks' && r1.stake===5 && P1.pays && P1.pays.all===25 && P1.payout===25 && P1.hits===3 && W1.profit===20 && r1.result==='win' && r1.odds==='+400' && r1.name==='Parlay · 3 picks' && r1.market==='3-pick parlay' && r1.date==='2026-11-15' && P1.legs===LEGS && P1.picks===3, W1);
  check('Placed at 10:30 AM typed: placedAt 2026-11-15T16:30:00.000Z, placedAtSource user_entered (typed, the app\'s word), placedTz America/Chicago', r1.placedAt==='2026-11-15T16:30:00.000Z' && r1.placedAtSource==='user_entered' && r1.placedTz==='America/Chicago', [r1.placedAt, r1.placedAtSource, r1.placedTz]);
  check('nothing else added: no free, no manual / srcType / gradedBy (the single-bet watcher left it alone)', !('free' in r1) && !('manual' in r1) && !('srcType' in r1) && !('gradedBy' in r1) && !('towin' in r1), Object.keys(r1));
  check('the message says it calmly: "Saved: Parlay · 3 picks · $5.00 at PrizePicks · WON +$20.00. It is in your Bet log."', W1.ab==='Saved: Parlay · 3 picks · $5.00 at PrizePicks · WON +$20.00. It is in your Bet log.' && W1.msg==='', W1.ab);
  const after1=await p.evaluate(()=>({stake:document.getElementById('abParStake').value, all:document.getElementById('abParAll').value, legs:document.getElementById('abParLegs').value, res:document.getElementById('abParResult').value, placed:document.getElementById('abParPlaced').value, book:document.getElementById('abParBook').value, picks:document.getElementById('abParPicks').value, day:document.getElementById('abParDay').value}));
  check('after Save: Entry, Pays, Legs, Result and Placed at are empty for the next one; App, Picks and Game day stay', after1.stake==='' && after1.all==='' && after1.legs==='' && after1.res==='' && after1.placed==='' && after1.book==='PrizePicks' && after1.picks==='3' && after1.day==='2026-11-15', after1);
  const L1=await par({picks:3, stake:5, all:25, result:'loss'}); const rl=L1.rec||{};
  check('the same entry Lost: profit −$5.00, result loss, payout 0, 0 hit', L1.saved===1 && rl.result==='loss' && rl.parlay.payout===0 && rl.parlay.hits===0 && L1.profit===-5 && rl.stake===5, L1);
  const F1=await par({kind:'flex', picks:3, stake:5, all:25, m1:2, result:'partial', paid:2}); const rf=F1.rec||{};
  check('3-pick Flex $5 (pays $25, $2 if 1 misses), Partial payout with Paid $2: profit −$3.00, result win (the scope), payout 2, 2 of 3 hit', F1.saved===1 && rf.result==='win' && rf.parlay.payout===2 && rf.parlay.hits===2 && F1.profit===-3 && rf.parlay.pays.m1===2 && rf.parlay.pays.m2===0, F1);
  const F2=await par({kind:'flex', picks:5, stake:5, all:50, m1:10, m2:2, result:'partial', paid:2}); const rf2=F2.rec||{};
  check('5-pick Flex ($10 if 1 misses, $2 if 2 miss), Paid $2: 3 of 5 hit (the nearest Flex payout), profit −$3.00', F2.saved===1 && rf2.parlay.hits===3 && rf2.parlay.payout===2 && F2.profit===-3, F2);
  const FR1=await par({picks:3, stake:5, all:25, result:'win', free:true}); const rfr=FR1.rec||{};
  check('Free entry $5 paying $25, Won: free:true, payout 25, profit +$20.00 (the app\'s free-parlay rule, betProfit: max(0, payout − entry); the entry does not come back)', FR1.saved===1 && rfr.free===true && rfr.stake===5 && rfr.parlay.payout===25 && FR1.profit===20 && rfr.result==='win', FR1);
  const FR2=await par({picks:3, stake:5, all:25, result:'loss', free:true});
  check('Free entry Lost: $0.00 (a miss costs nothing)', FR2.saved===1 && FR2.rec.free===true && FR2.profit===0 && FR2.rec.result==='loss', FR2);
  const N1=await par({picks:4, stake:10, all:100, result:'', now:true, legs:'a; b; c; d'}); const rn=N1.rec||{};
  check('Not played yet: pending, no hits or payout, profit not counted yet; "Placed now" saves placed_now at the moment pressed', N1.saved===1 && rn.result==='pending' && rn.parlay.hits===null && rn.parlay.payout===null && N1.profit===null && rn.placedAtSource==='placed_now' && Math.abs(Date.parse(rn.placedAt)-N1.clickAt)<5000, N1);
  check('Not played yet, the message: "… · not played yet. It is in your Bet log: when it is over, set how many hit there."', N1.ab==='Saved: Parlay · 4 picks · $10.00 at PrizePicks · not played yet. It is in your Bet log: when it is over, set how many hit there.', N1.ab);
  const W2=await par({picks:2, stake:5, all:15, win:null, result:'win', paid:16.5, book:'Underdog', legs:'Brunson O 26.5 pts; Jokic O 11.5 reb'});
  check('Won with Paid $16.50 typed (more than Pays $15): payout 16.50, profit +$11.50, at Underdog; the Pays saved is $16.50 too, odds +230 (v5.11 review: the Bet log row, its edit and "how many hit" keep that money)', W2.saved===1 && W2.rec.parlay.payout===16.5 && W2.rec.parlay.pays.all===16.5 && W2.rec.odds==='+230' && W2.profit===11.5 && W2.rec.book==='Underdog' && W2.rec.parlay.hits===2, W2);
  check('… and before Save the note said so: "Paid $16.50 is not the $15.00 it pays if all hit. Save keeps +$11.50: fix Paid $ if that is a typo."', W2.note==='Paid $16.50 is not the $15.00 it pays if all hit. Save keeps +$11.50: fix Paid $ if that is a typo.', W2.note);
  const PW=await par({picks:3, stake:5, all:25, win:20, result:'win'});
  check('only To win typed ($20 on $5): Pays if all hit $25 is what is saved', PW.saved===1 && PW.rec.parlay.pays.all===25 && PW.profit===20, PW.rec&&PW.rec.parlay);
  const DT=await par({picks:2, stake:3, all:9, result:'', dbl:true, book:'Betr'});   // Not played yet: nothing on the form moves after Save, so the second tap lands on the button
  check('a double tap on Save parlay saves it once (Betr, $3 paying $9, not played yet), with no warning after it', DT.saved===1 && DT.msg==='' && DT.rec.book==='Betr' && DT.rec.result==='pending' && DT.rec.parlay.pays.all===9, {saved:DT.saved, msg:DT.msg});
  check('a parlay stays out of the Scorecard and the daily max (as the panel\'s)', await p.evaluate(i=>{ const x=logged[i]; return !inScorecard(x) && poolOf(x)==='parlay'; }, W1.i), true);
  // what the form will not save
  const bad=[
    ['Partial on a Power entry', {picks:3, stake:5, all:25, result:'partial', paid:2}, 'A partial payout is for a Flex entry: choose Flex (pays if 1 or 2 miss) and type what it pays.'],
    ['Partial with no Flex payout typed', {kind:'flex', picks:3, stake:5, all:25, result:'partial', paid:2}, 'Type what it pays if 1 misses (or if 2 miss), so the Bet log can show how many hit.'],
    ['Partial with no Paid $', {kind:'flex', picks:3, stake:5, all:25, m1:2, result:'partial'}, 'Type what it paid in Paid $. If it paid nothing, choose Lost.'],
    ['Partial paying the all-hit amount', {kind:'flex', picks:3, stake:5, all:25, m1:2, result:'partial', paid:25}, 'A partial payout is less than what it pays if all hit ($25.00). If every pick hit, choose Won.'],
    ['13 picks', {picks:13, stake:5, all:25}, 'Picks: 2 to 12.'],
    ['1 pick', {picks:1, stake:5, all:25}, 'Picks: 2 to 12.'],
    ['Pays no more than the entry', {picks:3, stake:5, all:5}, 'Enter the entry and what it pays if all hit (more than the entry).'],
    ['no entry', {picks:3, all:25}, 'Enter the entry and what it pays if all hit (more than the entry).'],
    ['a placed time in the future (1:30 PM, now 12:00)', {picks:3, stake:5, all:25, placed:'2026-11-15T13:30'}, 'The placed time is in the future: check Placed at.'],
    // v5.11 (review): Won with a Paid $ at or under the entry; a Partial whose Paid $ is not a Flex payout typed; a free Partial with the total typed in Paid $
    ['Won with Paid $3 on a $5 entry (it saved WON −$2.00)', {picks:2, stake:5, all:15, result:'win', paid:3}, 'Won means every pick hit, so it paid back more than the $5.00 entry. Leave Paid $ empty to use Pays if all hit ($15.00), or type everything the app paid back.'],
    ['Won with the $5 entry typed in Paid $ (it saved WON $0.00)', {picks:3, stake:5, all:25, result:'win', paid:5}, 'Won means every pick hit, so it paid back more than the $5.00 entry. Leave Paid $ empty to use Pays if all hit ($25.00), or type everything the app paid back.'],
    ['Partial with Paid $6 where 1 miss pays $6.25 (the row read "2 of 3 — $6.25" next to +$1.00)', {kind:'flex', picks:3, stake:5, all:11.25, m1:6.25, result:'partial', paid:6}, 'Paid $6.00 is not the payout if 1 misses ($6.25). Check Paid $ and the Flex payouts, so the Bet log shows how many hit.'],
    ['Partial with Paid $4 on a 5-pick Flex ($10 if 1 misses, $2 if 2 miss)', {kind:'flex', picks:5, stake:5, all:50, m1:10, m2:2, result:'partial', paid:4}, 'Paid $4.00 is not the payout if 1 misses ($10.00) or the payout if 2 miss ($2.00). Check Paid $ and the Flex payouts, so the Bet log shows how many hit.'],
    ['a free Partial with Paid $3 where 1 miss wins $1.25', {kind:'flex', picks:3, stake:5, all:11.25, m1:6.25, result:'partial', paid:3, free:true}, 'Paid $3.00 is not the winnings if 1 misses ($1.25). Check Paid $ and the Flex payouts, so the Bet log shows how many hit.'],
    ['a free Partial with the $6.25 total typed in Paid $ (the winnings are $1.25)', {kind:'flex', picks:3, stake:5, all:11.25, m1:6.25, result:'partial', paid:6.25, free:true}, 'Paid $ for a free entry is the winnings: what it paid, less the $5.00 entry. A partial payout is less than the $6.25 it wins if all hit; if every pick hit, choose Won.'],
    ['a free Won with Paid $0', {picks:3, stake:5, all:25, result:'win', paid:0, free:true}, 'Won means every pick hit, so the free entry paid you winnings. Leave Paid $ empty to use $20.00 (what it pays if all hit, less the entry), or type the winnings the app paid you.']];
  const badGot=[]; for(const [n,o,want] of bad){ const r=await par(o); badGot.push({n, saved:r.saved, msg:r.msg, ok:r.saved===0 && r.msg===want}); }
  check('not saved, with a message that says what to do: '+bad.map(x=>x[0]).join(' · '), badGot.every(x=>x.ok), badGot.filter(x=>!x.ok));
  const warnBox=await p.evaluate(()=>{ const m=document.getElementById('abParMsg'), r=m.getBoundingClientRect(); return {warn:m.classList.contains('warn'), seen:r.width>100 && r.height>20, fs:parseFloat(getComputedStyle(m).fontSize)}; });
  check('the message is a box you can see (14 px, as the bet form\'s own warning)', warnBox.warn && warnBox.seen && warnBox.fs>=14, warnBox);
  check('no exchange price asked for while the Type is a parlay (no Worker /live calls)', live.length===noAsk && noAsk===0, live);

  // ---- 3b. v5.11 review (before release): the Game day typed is the bet's day; a free entry's Paid $ is the winnings; Paid $ is emptied when the Result or
  //      the Free entry tick changes; Paid $ says what to type; a Paid $ on a Won entry that is not Pays if all hit is said before Save
  const D14=await par({picks:3, stake:5, all:25, result:'win', day:'2026-11-14', placed:'2026-11-14T20:05', legs:LEGS});
  const d14=await p.evaluate(i=>{ const x=logged[i], ds=dayStats()['2026-11-14']||{}; renderLog(); const s=document.querySelector('#logBody select.pl-hit[data-i="'+i+'"]'), tr=s&&s.closest('tr');
    return {dateSet:x.dateSet, day:gameDayOf(x), bets14:ds.bets||0, profit14:ds.profit, row:tr?tr.dataset.day:null}; }, D14.i);
  check('Game day Sat 11/14, logged Sun 11/15 (placed 8:05 PM 11/14, Won $5 paying $25): it counts on 11/14 (dateSet; gameDayOf 2026-11-14; the 11/14 calendar day has it, +$20.00; its Bet log row is under 11/14), not on the day it was saved',
    D14.saved===1 && d14.dateSet===true && d14.day==='2026-11-14' && d14.bets14===1 && d14.profit14===20 && d14.row==='2026-11-14' && D14.rec.placedAt==='2026-11-15T02:05:00.000Z', d14);
  const FP=await par({picks:3, stake:5, all:25, result:'win', free:true, paid:20});
  check('free entry $5 paying $25, Won, Paid $20 typed (the winnings the note says you get): the record keeps $25 with the entry, profit +$20.00 (it was +$15.00)', FP.saved===1 && FP.rec.free===true && FP.rec.parlay.payout===25 && FP.rec.parlay.pays.all===25 && FP.profit===20 && FP.ab==='Saved: Parlay · 3 picks · $5.00 free entry at PrizePicks · WON +$20.00. It is in your Bet log.', FP);
  const FX=await par({kind:'flex', picks:3, stake:5, all:11.25, m1:6.25, result:'partial', paid:1.25, free:true});
  check('free 3-pick Flex $5 (pays $11.25, $6.25 if 1 misses), Partial, Paid $1.25 (the winnings): 2 of 3 hit, payout $6.25, profit +$1.25 (it was $0.00), "PARTIAL PAYOUT +$1.25"', FX.saved===1 && FX.rec.free===true && FX.rec.parlay.hits===2 && FX.rec.parlay.payout===6.25 && FX.profit===1.25 && / · PARTIAL PAYOUT \+\$1\.25\. It is in your Bet log\.$/.test(FX.ab), FX);
  const tip=()=>p.evaluate(()=>({ph:document.getElementById('abParPaid').placeholder, tip:document.querySelector('#addBetPanel label[for="abParPaid"]').title}));
  await p.selectOption('#abParKind','power'); await p.fill('#abParPicks','3'); await p.fill('#abParStake','5'); await p.fill('#abParAll','25'); await p.setChecked('#abParFree',true); await p.selectOption('#abParResult','win'); await pause(100); const phF=await tip();
  await p.selectOption('#abParResult','partial'); await pause(100); const phFp=await tip();
  await p.setChecked('#abParFree',false); await p.selectOption('#abParResult','win'); await pause(100); const phP=await tip();
  await p.selectOption('#abParResult','partial'); await pause(100); const phPp=await tip();
  check('Paid $ says what to type: a free entry, Won: "20.00" (the winnings), Partial: "the winnings", tip "the winnings the app paid you"; a paid entry, Won: "25.00", Partial: "it paid back", tip "your entry included"',
    phF.ph==='20.00' && phFp.ph==='the winnings' && /the winnings the app paid you/.test(phF.tip) && phP.ph==='25.00' && phPp.ph==='it paid back' && /your entry included/.test(phP.tip), {free:[phF,phFp], paid:[phP,phPp]});
  await p.selectOption('#abParKind','flex'); await p.fill('#abParM1','2'); await p.fill('#abParPaid','2'); await pause(100);
  await p.selectOption('#abParResult','win'); await pause(100); const left=await p.inputValue('#abParPaid');
  const LW=await (async()=>{ const n0=await p.evaluate(()=>logged.length); await p.click('#abParSave'); await pause(300); return p.evaluate(n0=>{ const x=logged.length>n0?logged[logged.length-1]:null; return x?{payout:x.parlay.payout, hits:x.parlay.hits, profit:betProfit(x), result:x.result}:null; }, n0); })();
  check('Flex Partial with Paid $2, then Result changed to Won: Paid $ is emptied, so Save keeps the Won entry at $25.00, +$20.00 (it saved WON −$3.00)', left==='' && LW && LW.payout===25 && LW.hits===3 && LW.profit===20 && LW.result==='win', {left, LW});
  await p.selectOption('#abParKind','power'); await p.fill('#abParPicks','3'); await p.fill('#abParStake','5'); await p.fill('#abParAll','25'); await p.selectOption('#abParResult','win'); await p.fill('#abParPaid','25'); await pause(100);
  await p.setChecked('#abParFree',true); await pause(100); const leftF=await p.inputValue('#abParPaid'); await p.setChecked('#abParFree',false); await p.selectOption('#abParResult',''); await pause(100);
  check('Paid $25 typed, then 🎁 Free entry ticked: Paid $ is emptied (for a free entry it means the winnings, so the $25 total is not read as $25 won)', leftF==='', leftF);
  const BIG=await par({picks:3, stake:5, all:25, result:'win', paid:250});
  check('Won with Paid $250 (a slip for $25): the note says it before Save, "Paid $250.00 is not the $25.00 it pays if all hit. Save keeps +$245.00: fix Paid $ if that is a typo." (a gentle line: Save keeps what was typed, its Pays too)', BIG.note==='Paid $250.00 is not the $25.00 it pays if all hit. Save keeps +$245.00: fix Paid $ if that is a typo.' && BIG.saved===1 && BIG.rec.parlay.pays.all===250 && BIG.profit===245, {note:BIG.note, saved:BIG.saved});

  // ---- 4. The same record as the Bet log's "Add a parlay / Pick 6" panel for the same inputs
  async function panel(o){ await p.evaluate(()=>{ document.querySelector('.tab[data-view="v-log"]').click(); document.getElementById('parlayPanel').open=true; }); await pause(400);
    await p.selectOption('#plBook', o.book); await p.fill('#plPicks', String(o.picks)); await p.fill('#plStake', String(o.stake)); await p.fill('#plAll', String(o.all));
    await p.fill('#plM1', o.m1==null?'':String(o.m1)); await p.fill('#plM2', o.m2==null?'':String(o.m2)); await p.fill('#plDay', o.day); await p.fill('#plLegs', o.legs||'');
    const n0=await p.evaluate(()=>logged.length); await p.click('#plAdd'); await pause(300);
    return p.evaluate(n0=>logged.length>n0?{rec:JSON.parse(JSON.stringify(logged[logged.length-1])), i:logged.length-1}:null, n0); }
  const IGN=['id','at'], IGD=IGN.concat(['dateSet']);   // v5.11 (review): the form also keeps the Game day typed (dateSet), which the panel leaves out (asked of the owner)
  const PP=await panel({book:'PrizePicks', picks:3, stake:5, all:25, day:'2026-11-15', legs:LEGS});
  await toAdd(); const AP=await par({picks:3, stake:5, all:25, day:'2026-11-15', legs:LEGS});
  check('Not played yet, nothing else set: the very record the panel saves (field by field, ignoring the id and the save time), plus dateSet: true (the Game day typed is its day)', PP && AP.rec && canon(AP.rec,IGD)===canon(PP.rec,IGD) && AP.rec.dateSet===true, {panel:PP&&PP.rec, form:AP.rec, diff:PP&&AP.rec?diffs(PP.rec,AP.rec,IGN):null});
  const PF=await panel({book:'Sleeper', picks:5, stake:4, all:40, m1:8, m2:1.6, day:'2026-11-14', legs:'x; y; z; w; v'});
  await toAdd(); const AF=await par({book:'Sleeper', kind:'flex', picks:5, stake:4, all:40, m1:8, m2:1.6, day:'2026-11-14', legs:'x; y; z; w; v'});
  const afDay=await p.evaluate(i=>gameDayOf(logged[i]), AF.i);
  check('a 5-pick Flex at Sleeper with both Flex payouts and another game day (11/14): the panel\'s record too, plus dateSet, so it counts on 11/14', PF && AF.rec && canon(AF.rec,IGD)===canon(PF.rec,IGD) && AF.rec.dateSet===true && afDay==='2026-11-14', {diff:PF&&AF.rec?diffs(PF.rec,AF.rec,IGN):null, day:afDay});
  await p.selectOption('#abParKind','flex'); await p.fill('#abParM1','9'); await p.fill('#abParM2','3'); await pause(100);
  const AH=await par({picks:3, stake:5, all:25, legs:LEGS});   // Power: the Flex boxes still hold 9 and 3, out of sight
  check('a Power entry ignores Flex payouts left in the boxes (m1 and m2 0, as the panel with them blank)', AH.rec && canon(AH.rec,IGD)===canon(PP.rec,IGD), AH.rec&&AH.rec.parlay);
  const AW=JSON.parse(JSON.stringify(W1.rec)), extra=diffs(PP.rec, AW, IGN);
  check('Won with a placed time: the panel\'s record plus only dateSet, placedAt, placedAtSource, placedTz, the result and the "how many hit" fields', JSON.stringify(extra.sort())===JSON.stringify(['dateSet','parlay.hits','parlay.payout','placedAt','placedAtSource','placedTz','result']), extra);
  // graded the way the Bet log's "how many hit" list grades the panel's parlay
  await p.evaluate(()=>document.querySelector('.tab[data-view="v-log"]').click()); await pause(400);
  const hitSel=async(i,v)=>{ await p.selectOption('#logBody select.pl-hit[data-i="'+i+'"]', v); await pause(300); return p.evaluate(i=>{ const x=logged[i]; return {result:x.result, hits:x.parlay.hits, payout:x.parlay.payout, profit:betProfit(x)}; }, i); };
  const g3=await hitSel(PP.i,'3'), fW={result:r1.result, hits:P1.hits, payout:P1.payout, profit:W1.profit};
  check('Won: the same result, hits, payout and profit as the panel\'s parlay set to "all 3 hit" in the Bet log', JSON.stringify(g3)===JSON.stringify(fW), {list:g3, form:fW});
  const g0=await hitSel(PP.i,'0'), fL={result:rl.result, hits:rl.parlay.hits, payout:rl.parlay.payout, profit:L1.profit};
  check('Lost: the same as the panel\'s parlay set to "lost — $0"', JSON.stringify(g0)===JSON.stringify(fL), {list:g0, form:fL});
  const PQ=await panel({book:'PrizePicks', picks:3, stake:5, all:25, m1:2, day:'2026-11-15', legs:LEGS}); await p.evaluate(()=>document.querySelector('.tab[data-view="v-log"]').click()); await pause(300);
  const g2=await hitSel(PQ.i,'2');
  check('Partial: the same hits (2), payout ($2) and profit (−$3.00) as "2 of 3 — $2.00" in the Bet log; result win as the scope says (the list itself calls a payout under the entry a loss)', g2.hits===rf.parlay.hits && g2.payout===rf.parlay.payout && g2.profit===F1.profit && rf.result==='win' && g2.result==='loss', {list:g2, form:{result:rf.result, hits:rf.parlay.hits, payout:rf.parlay.payout, profit:F1.profit}});
  // the Bet log shows each like any other parlay
  const rows=await p.evaluate(ids=>ids.map(id=>{ const i=logged.findIndex(x=>x.id===id), s=document.querySelector('#logBody select.pl-hit[data-i="'+i+'"]'), pr=s&&s.parentElement.querySelector('.pl-up, .pl-down');
    return {sel:s?s.value:null, txt:s?s.options[s.selectedIndex].textContent:null, pr:pr?pr.textContent:null}; }), [W1.rec.id, L1.rec.id, F1.rec.id, N1.rec.id, FR1.rec.id]);
  check('Bet log rows: Won "all 3 hit — $25.00" +$20.00 · Lost "lost — $0" −$5.00 · Partial "2 of 3 — $2.00" −$3.00 · Not played "pending" · free Won +$20.00',
    JSON.stringify(rows)===JSON.stringify([{sel:'3',txt:'all 3 hit — $25.00',pr:'+$20.00'},{sel:'0',txt:'lost — $0',pr:'−$5.00'},{sel:'2',txt:'2 of 3 — $2.00',pr:'−$3.00'},{sel:'',txt:'pending',pr:null},{sel:'3',txt:'all 3 hit — $25.00',pr:'+$20.00'}]), rows);
  const free=await p.evaluate(id=>{ const i=logged.findIndex(x=>x.id===id), s=document.querySelector('#logBody select.pl-hit[data-i="'+i+'"]'), tr=s&&s.closest('tr'); return !!(tr && tr.querySelector('.eb-freetag')); }, FR1.rec.id);
  check('the free entry shows "🎁 free bet" in the Bet log, as a free parlay does', free, free);
  const rp=await p.evaluate(()=>{ document.querySelector('.tab[data-view="v-reports"]').click(); return true; }); await pause(900);
  const rpRow=await p.evaluate(()=>[...document.querySelectorAll('#rpPanel tr')].map(tr=>tr.textContent.replace(/\s+/g,' ')).filter(t=>/PrizePicks/.test(t) && /\+\$20\.00/.test(t) && /won/.test(t)).length);
  check('Reports lists the Won PrizePicks parlay like any other: won, +$20.00', rp && rpRow>=1, rpRow);

  // ---- 5. A reload keeps every field; a sync merge keeps them too
  const KEEP=[W1,L1,F1,F2,FR1,FR2,N1,W2,PW,D14,FP,FX], ids=KEEP.map(x=>x.rec.id), saved0={}; KEEP.forEach(x=>{ saved0[x.rec.id]=x.rec; });   // v5.11 (review): with the 11/14 Game day, the free Paid $20 and the free Partial
  const beforeRl=await p.evaluate(ids=>ids.map(id=>JSON.stringify(logged.find(x=>x.id===id))), ids), panelBefore=await p.evaluate(id=>JSON.parse(JSON.stringify(logged.find(x=>x.id===id))), PP.rec.id);
  check('until the reload nothing touched them: each parlay is still the record Save made', ids.every((id,k)=>canon(JSON.parse(beforeRl[k]))===canon(saved0[id])), ids.map((id,k)=>diffs(saved0[id], JSON.parse(beforeRl[k]))));
  await p.reload(); await p.waitForTimeout(1800);
  const afterRl=await p.evaluate(ids=>ids.map(id=>{ const x=logged.find(y=>y.id===id); return x?JSON.parse(JSON.stringify(x)):null; }), ids), panelAfter=await p.evaluate(id=>logged.find(x=>x.id===id), PP.rec.id);
  const kept=ids.map((id,k)=>{ const a=afterRl[k], s=saved0[id]; return !a ? 'missing' : Object.keys(s).filter(f=>JSON.stringify(a[f])!==JSON.stringify(s[f])).join(',') || 'ok'; });
  check('after a reload every parlay saved here is there with every field it was saved with, unchanged (placedAt, placedAtSource, placedTz, result, hits, payout, free, dateSet)', kept.every(x=>x==='ok'), kept);
  const added=ids.map((id,k)=>afterRl[k]?Object.keys(afterRl[k]).filter(f=>!(f in saved0[id])).sort().join(','):'missing'), panelAdded=Object.keys(panelAfter).filter(f=>!(f in panelBefore)).sort().join(',');
  check('… and the reload adds only the app\'s two one-time startup marks (fix96, fixPlus40), the same ones the Bet log panel\'s parlay gets', added.every(x=>x==='fix96,fixPlus40') && panelAdded==='fix96,fixPlus40', {added:[...new Set(added)], panel:panelAdded});
  const sy=await p.evaluate(id=>{ const r=JSON.parse(JSON.stringify(logged.find(x=>x.id===id))), C=v=>JSON.stringify(v, Object.keys(JSON.parse(JSON.stringify(v))).sort());
    const st=()=>({S:{},T:{},B:{},H:{}});
    const a=syncMergeColl([], {[id]:{v:syncStrip(r), m:1000}}, {}, st(), false), got=a.out.find(x=>x[0]===id);   // another device gets it from the cloud
    const s2=st(); s2.S[id]=900; const b2=syncMergeColl([[id, syncStrip(r)]], {}, {}, s2, false);   // only on this device: kept and sent up
    const base=JSON.parse(JSON.stringify(r)); delete base.placedAt; delete base.placedAtSource; delete base.placedTz; base.result='pending'; base.parlay.hits=null; base.parlay.payout=null;
    const here=Object.assign(JSON.parse(JSON.stringify(base)), {placedAt:r.placedAt, placedAtSource:r.placedAtSource, placedTz:r.placedTz});   // this device typed the placed time
    const cloud=JSON.parse(JSON.stringify(base)); cloud.result=r.result; cloud.parlay.hits=r.parlay.hits; cloud.parlay.payout=r.parlay.payout;   // another device set how many hit
    const s3=st(); s3.S[id]=2000; s3.B[id]={q:syncQuick(base), f:syncFieldsStr(base)};
    const c=syncMergeColl([[id, here]], {[id]:{v:cloud, m:3000}}, {}, s3, false), m=c.out.find(x=>x[0]===id)[1];
    const same=(x,y)=>JSON.stringify(x)===JSON.stringify(y);
    return {strip:same(syncStrip(r), r), fromCloud:!!got && same(got[1], r), onlyHere:!!b2.out.find(x=>x[0]===id) && b2.push && same(b2.out[0][1], r),
      merged:{placedAt:m.placedAt===r.placedAt, src:m.placedAtSource===r.placedAtSource, result:m.result===r.result, hits:m.parlay.hits===r.parlay.hits, payout:m.parlay.payout===r.parlay.payout, whole:same(Object.keys(m).sort(), Object.keys(r).sort())}}; }, W1.rec.id);
  check('sync: nothing in it is left out of the upload (no live-price field); a device without it gets it whole from the cloud; one only here is kept and sent up', sy.strip && sy.fromCloud && sy.onlyHere, sy);
  check('sync: the placed time typed on one device and "how many hit" set on another merge into one record with both', Object.values(sy.merged).every(Boolean), sy.merged);
  // v5.11 (review): Won with Paid $16.50 on Pays $15: the Bet log row, "how many hit" and the parlay edit keep $16.50 (they went back to $15.00, +$10.00)
  await p.evaluate(()=>document.querySelector('.tab[data-view="v-log"]').click()); await pause(500);
  const w2row=await p.evaluate(id=>{ const i=logged.findIndex(x=>x.id===id), s=document.querySelector('#logBody select.pl-hit[data-i="'+i+'"]'), pr=s&&s.parentElement.querySelector('.pl-up, .pl-down'); return {i, txt:s?s.options[s.selectedIndex].textContent:null, pr:pr?pr.textContent:null}; }, W2.rec.id);
  const w2pick=await hitSel(w2row.i,'2');
  await p.evaluate(i=>{ const s=document.querySelector('#logBody select.pl-hit[data-i="'+i+'"]'), b=s&&s.closest('tr').querySelector('button.pl-edit'); if(b) b.click(); }, w2row.i); await pause(300);
  const w2open=await p.evaluate(()=>{ const e=document.querySelector('#logBody .pl-ed'); return e?{pay:e.querySelector('.pl-pay').value, legs:e.querySelectorAll('.pl-leg').length}:null; });
  await p.evaluate(()=>{ const s=document.querySelector('#logBody .pl-ed .pl-save'); if(s) s.click(); }); await pause(400);
  const w2ed=await p.evaluate(id=>{ const x=logged.find(y=>y.id===id); return {payout:x.parlay.payout, all:x.parlay.pays.all, profit:betProfit(x), result:x.result, edited:(x.edits||[]).length}; }, W2.rec.id);
  check('Won with Paid $16.50: the Bet log row reads "all 2 hit — $16.50" next to +$11.50; "all 2 hit" picked again and the parlay edit\'s Save with nothing changed both keep $16.50, +$11.50',
    w2row.txt==='all 2 hit — $16.50' && w2row.pr==='+$11.50' && w2pick.payout===16.5 && w2pick.profit===11.5 && w2open && w2open.pay==='16.50' && w2open.legs===2 && w2ed.edited===1 && w2ed.payout===16.5 && w2ed.all===16.5 && w2ed.profit===11.5 && w2ed.result==='win', {row:w2row, pick:w2pick, editor:w2open, edit:w2ed});

  // ---- 6. Layout at 390, 1000, 1280 and 1960 px: Flex, Partial, a free entry and a message all showing
  for(const W of [390,1000,1280,1960]){ await p.setViewportSize({width:W,height:900}); await toAdd();
    if(await p.inputValue('#abType')!=='parlay'){ await p.selectOption('#abType','parlay'); await pause(); }
    await p.selectOption('#abParKind','flex'); await p.selectOption('#abParResult','partial'); await pause(100);
    await p.fill('#abParPicks','5'); await p.fill('#abParStake','5'); await p.fill('#abParAll','100'); await p.setChecked('#abParFree',true); await p.fill('#abParPaid',''); await p.fill('#abParM1',''); await p.fill('#abParM2','');
    await p.click('#abParSave'); await pause(250);
    const L=await p.evaluate(W=>{ const P=document.getElementById('addBetPanel'), on=e=>e.getClientRects().length>0;
      const els=[...P.querySelectorAll('.ab-par label, .ab-par input, .ab-par select, .ab-par button, .ab-par-note, .ab-par .hint, .ab-par-msg')].filter(on);
      const out=els.filter(e=>{ const r=e.getBoundingClientRect(); return r.left<-0.5 || r.right>innerWidth+0.5; }).map(e=>e.id||e.className||e.tagName);
      const txt=[...P.querySelectorAll('.ab-par label, .ab-par-note, .ab-par .hint, .ab-par-msg, .ab-par button')].filter(on).map(e=>parseFloat(getComputedStyle(e).fontSize));
      const inp=[...P.querySelectorAll('.ab-par input:not([type=checkbox]), .ab-par select')].filter(on).map(e=>parseFloat(getComputedStyle(e).fontSize));
      const over=[...P.querySelectorAll('.ab-par .field')].filter(on).filter(f=>[...f.querySelectorAll('input:not([type=checkbox]),select')].some(i=>{ const a=i.getBoundingClientRect(), b=f.getBoundingClientRect(); return a.right>b.right+0.5; })).map(f=>f.querySelector('label').textContent);
      const single=['abSport','abGame','abDate','abPlaced','abPlayer','abResult','abHost','abVerdict','abAsk'].filter(id=>{ const e=document.getElementById(id); return e && e.offsetParent!==null; });
      return {side:document.documentElement.scrollWidth>innerWidth, n:els.length, out, over, minTxt:Math.min(...txt), minInp:Math.min(...inp), single, msg:document.getElementById('abParMsg').textContent, note:document.getElementById('abParNote').textContent.slice(0,40)}; }, W);
    check(W+' px, Parlay (Flex, Partial, free entry, a message): no sideways scroll, every box and line inside the screen and its field, text 12 px or more'+(W<=760?', boxes 16 px (the phone size)':''),
      !L.side && L.n>=25 && !L.out.length && !L.over.length && L.minTxt>=12 && (W>760 ? L.minInp>=12 : L.minInp>=16) && !L.single.length && /^Type what it paid in Paid \$/.test(L.msg) && /^🎁 Free entry/.test(L.note), L);
    if(W===390){   // v5.11 (review): a phone cut "Parlay / pick'e", "Power (all mus", "Partial payout"; Save parlay was 37 px tall; a Save warning sat under the bottom bars
      const M=await p.evaluate(()=>{ const cv=document.createElement('canvas').getContext('2d'), grid=document.getElementById('abType').closest('.ab-grid').getBoundingClientRect();
        const fit=id=>{ const e=document.getElementById(id), cs=getComputedStyle(e), f=e.closest('.field').getBoundingClientRect(); cv.font=cs.fontStyle+' '+cs.fontWeight+' '+cs.fontSize+' '+cs.fontFamily;
          const need=Math.max(...[...e.options].map(o=>cv.measureText(o.textContent).width)), has=e.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight)-(cs.appearance!=='none'?18:0);
          return {id, whole:Math.abs(f.width-grid.width)<2, fits:need<=has+1, need:Math.round(need), has:Math.round(has)}; };
        const h=s=>{ const e=document.querySelector(s); return e?Math.round(e.getBoundingClientRect().height):0; };
        return {sel:['abType','abParBook','abParKind','abParResult'].map(fit), save:h('#abParSave'), now:h('#abParPlacedNow'), free:h('#addBetPanel .ab-par-free')}; });
      check('390 px: Type, App / book, Entry type and Result take the whole row and show their longest choice in full ("Parlay / pick\'em (2+ picks)", "DraftKings Predictions", "Flex (pays if 1 or 2 miss)", "Partial payout (Flex)"); Save parlay, Placed now and the 🎁 Free entry tick are 44 px tall',
        M.sel.every(x=>x.whole && x.fits) && M.save>=44 && M.save<=48 && M.now>=44 && M.now<=48 && M.free>=44, M);
      const bars=()=>p.evaluate(()=>Math.round(Math.min(...[...document.querySelectorAll('.tabs, #apiDock')].filter(e=>e.getClientRects().length).map(e=>e.getBoundingClientRect().top))));
      const top0=await bars(); await p.evaluate(t=>{ const r=document.getElementById('abParSave').getBoundingClientRect(); window.scrollBy(0, r.bottom-(t-6)); }, top0); await pause(200);
      await p.click('#abParSave'); await pause(400);
      const WB=await p.evaluate(()=>{ const m=document.getElementById('abParMsg'), r=m.getBoundingClientRect(); return {top:Math.round(r.top), bottom:Math.round(r.bottom), text:m.textContent}; }); WB.bars=await bars();
      check('390 px: Save parlay pressed just above the bottom bars: its warning box comes up fully above them', WB.top>=0 && WB.bottom<=WB.bars && /^Type what it paid in Paid \$/.test(WB.text), WB); }
    if(W===1280){ const sub=await p.evaluate(()=>[...document.querySelectorAll('#addBetPanel summary .sub')].filter(e=>e.getClientRects().length).map(e=>e.textContent));
      check('1280 px: while the Type is a parlay, the panel\'s subtitle is the parlay\'s own (the BET or SKIP one is for single bets)', sub.length===1 && sub[0].startsWith('log a parlay or pick\'em entry — no value check'), sub); } }
  await p.setViewportSize({width:1280,height:900});
  check('no page errors (main page)', !errs.length, errs);
  await ctx.close();
  // ---- 6b. A phone: back on + Add a bet with the Type left on Parlay, the form starts where it does for a single bet (v5.00 brings Sport into view; a parlay hides Sport, so its Type box, in the same row)
  { const S=await newPage(b, html, 0, 'iPhone 13'), q=S.p, pos=()=>q.evaluate(()=>({type:Math.round(document.getElementById('abType').getBoundingClientRect().top), sport:Math.round(document.getElementById('abSport').getBoundingClientRect().top)}));
    await q.evaluate(()=>document.querySelector('.tab[data-view="v-add"]').click()); await q.waitForTimeout(1200); const one=await pos();
    await q.selectOption('#abType','parlay'); await q.waitForTimeout(200);
    await q.evaluate(()=>document.querySelector('.tab[data-view="v-log"]').click()); await q.waitForTimeout(500); await q.evaluate(()=>window.scrollTo(0,900)); await q.waitForTimeout(200);
    await q.evaluate(()=>document.querySelector('.tab[data-view="v-add"]').click()); await q.waitForTimeout(800); const two=await pos();
    check('phone (iPhone 13): back on + Add a bet with the Type left on Parlay, the Type row comes into view where Sport does for a single bet', one.sport===two.type && two.type>=0 && two.type<=120 && two.sport===0, {single:one, parlay:two});
    check('no page errors (phone)', !S.errs.length, S.errs); await S.ctx.close(); }

  // ---- 7. Back to a single-bet Type: the same form, verdict and saved bet as never leaving it
  async function single(file, detour){
    const S=await newPage(b, file, 1280), q=S.p, pz=ms=>q.waitForTimeout(ms||250);
    await q.evaluate(()=>document.querySelector('.tab[data-view="v-add"]').click()); await pz(500);
    await q.selectOption('#abSport','NBA'); await pz(1500);
    await q.selectOption('#abGame','401909001'); await q.selectOption('#abType','moneyline'); await pz(); await q.selectOption('#abTeam','DET'); await q.waitForSelector('#abHost .editor');
    await q.selectOption('#abHost .eb-book','Bovada'); await pz();
    await q.fill('#abHost .eb-odds','+100'); await q.fill('#abHost .eb-stake','1.52'); await q.fill('#abHost .eb-win-o','1.52'); await q.fill('#abPlaced','2026-11-15T11:05'); await pz(1800);   // the exchange check (1.2 s) has answered
    const snap=()=>q.evaluate(()=>{ const v=id=>{ const e=document.getElementById(id); return e?e.value:null; }, h=document.getElementById('abHost'), e=c=>h.querySelector(c), on=e=>!!(e && e.offsetParent!==null);
      return {vals:['abSport','abType','abGame','abGameFree','abDate','abPlaced','abPlayer','abTeam','abTeamFree','abStat','abPick','abLine','abResult','abProj','abCover','abCons'].map(id=>id+'='+v(id)),
        ed:['.eb-book','.eb-mode','.eb-odds','.eb-stake','.eb-win-o','.eb-tot-o'].map(c=>c+'='+(e(c)?e(c).value:null)),
        shown:['abSport','abType','abGame','abDate','abPlaced','abTeam','abLine','abResult','abHost','abMore','abVerdict','abAsk','abPlayer','abStat','abPick'].filter(id=>on(document.getElementById(id))),
        par:[...document.querySelectorAll('#addBetPanel .ab-par')].filter(on).length, verdict:document.getElementById('abVerdict').innerHTML,
        sub:[...document.querySelectorAll('#addBetPanel summary .sub')].filter(e=>e.getClientRects().length).map(e=>e.textContent)}; });   // v5.11 (review): the panel's subtitle
    const before=await snap(), liveBefore=S.live.length; let liveIn=null;   // the moneyline typed above has asked the exchanges (the lookup this test watches for)
    if(detour){ const n=S.live.length; await q.selectOption('#abType','parlay'); await pz();
      await q.fill('#abParPicks','3'); await q.fill('#abParStake','7'); await q.fill('#abParAll','30'); await q.check('#abParFree'); await q.fill('#abParLegs','a; b; c'); await q.selectOption('#abParResult','win'); await pz(1800);
      liveIn=S.live.length-n; await q.selectOption('#abType','moneyline'); await pz(600); }
    const after=await snap();
    const n0=await q.evaluate(()=>logged.length);
    for(let i=0;i<3;i++){ if(await q.evaluate(()=>logged.length)>n0) break; await q.click('#abHost .eb-save'); await q.waitForTimeout(450); }
    await q.waitForTimeout(800);
    const rec=await q.evaluate(n0=>logged.length>n0?JSON.parse(JSON.stringify(logged[logged.length-1])):null, n0);
    const out={before, after, liveBefore, liveIn, rec, n:await q.evaluate(()=>logged.length), errs:S.errs.slice()}; await S.ctx.close(); return out; }
  const A=await single(html,false), B=await single(html,true), IG=['id','at','enteredAt'];
  check('Moneyline typed, then Parlay (with a free entry and a result), then Moneyline again: every single-bet field, the book, odds, stake and To win are as they were', JSON.stringify(B.before.vals)===JSON.stringify(B.after.vals) && JSON.stringify(B.before.ed)===JSON.stringify(B.after.ed), {before:B.before.vals.concat(B.before.ed), after:B.after.vals.concat(B.after.ed)});
  check('… the same fields show (and no parlay field), the verdict is the same, and so is the panel\'s subtitle ("take a price or post your own …")', JSON.stringify(B.before.shown)===JSON.stringify(B.after.shown) && B.after.par===0 && B.before.verdict===B.after.verdict && B.after.verdict.length>20 && JSON.stringify(B.before.sub)===JSON.stringify(B.after.sub) && B.after.sub.length===1 && B.after.sub[0].startsWith('take a price or post your own'), {before:B.before.shown, after:B.after.shown, par:B.after.par, same:B.before.verdict===B.after.verdict, sub:[B.before.sub, B.after.sub]});
  check('… and no exchange price asked for while it was a parlay (the moneyline before it did ask)', B.liveIn===0 && B.liveBefore>=1, {before:B.liveBefore, whileParlay:B.liveIn});
  check('Save bet then saves the very bet it saves without the parlay detour: one single (Moneyline DET at Bovada, +100, $1.52, to win 1.52, placed 11:05 AM typed, no free bet, not a parlay)',
    A.rec && B.rec && A.n===1 && B.n===1 && canon(B.rec,IG)===canon(A.rec,IG) && B.rec.kind==='moneyline' && B.rec.book==='Bovada' && B.rec.odds==='+100' && B.rec.stake===1.52 && B.rec.towin===1.52 && B.rec.placedAt==='2026-11-15T17:05:00.000Z' && B.rec.placedAtSource==='user_entered' && !('free' in B.rec) && B.rec.manual===true,
    A.rec&&B.rec?{diff:diffs(A.rec,B.rec,IG), rec:B.rec}:{A:A.rec, B:B.rec});
  if(baseHtml){ const O=await single(baseHtml,false);
    check('the single bet saved here is the one the file before v5.11 saves for the same inputs', O.rec && A.rec && canon(O.rec,IG)===canon(A.rec,IG), O.rec&&A.rec?diffs(O.rec,A.rec,IG):{O:O.rec}); }
  check('no page errors (single-bet pages)', !A.errs.length && !B.errs.length, A.errs.concat(B.errs));
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
