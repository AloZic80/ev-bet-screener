// node tests/money-test.js — v3.98 (Alonzo): real money on a bet (Got back with the stake, or Winnings without it: boosts), the amount
// really lost, free bets (not your money: a loss costs $0), and the Today card: played / playing / to play in bets and in money, per
// book, with games not started not counted as lost.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const NOW=Date.parse('2026-11-05T18:00:00Z'), H=3600e3, iso=ms=>new Date(ms).toISOString(), DAY='2026-11-05';
const bet=(id,o)=>Object.assign({id,key:id,sport:'NBA',kind:'prop',book:'Novig',odds:'+100',stake:2,date:DAY,dateSet:true,manual:true,game:'LAL @ BOS',name:'Player '+id,side:'O',market:'10.5 Points',betnow:'O 10.5 +100',snap:{at:iso(NOW-5*H)}},o);
const LOG=[
  bet('won',{stake:3,odds:'-150',result:'win',gradedBy:'manual',start:iso(NOW-4*H)}),          // -150: $3 wins $2
  bet('lost',{stake:1.5,result:'loss',gradedBy:'manual',start:iso(NOW-4*H)}),
  bet('playing',{stake:2,start:iso(NOW-H)}),                                                      // game started, no result
  bet('later',{stake:4,start:iso(NOW+5*H)}),                                                      // not started
  bet('free',{book:'Bovada',stake:5,free:true,start:iso(NOW+5*H)}),                               // a free bet, not started
  bet('boost',{book:'Bovada',stake:1,odds:'+1000',result:'win',gradedBy:'manual',start:iso(NOW-4*H),name:'Boosted'}),
  bet('tmrw',{date:'2026-11-06',stake:3,start:iso(NOW+30*H)})];   // v4.00: tomorrow, not started  // boosted: paid more than the odds
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago', viewport:{width:1400,height:1000}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(L=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.log',JSON.stringify(L)); }catch(e){} }, LOG);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1200);
  const card=()=>p.evaluate(()=>{ const el=document.getElementById('todayBar'); const t=el.innerText.replace(/\s+/g,' ');
    const tile=nm=>{ const x=[...el.querySelectorAll('.tb-t')].find(d=>(d.querySelector('img')||{}).alt===nm); return x?x.innerText.replace(/\s+/g,' '):''; };
    return {t, novig:tile('Novig'), bovada:tile('Bovada'), pill:(el.querySelector('.tb-k .tb-pill')||{}).textContent}; });
  let c=await card();
  check('Today: your money staked ($3 + $1.50 + $2 + $4 + $1 = $11.50; the $5 free bet is not your money) and 6 bets', /\$11\.50/.test(c.t) && /6 bets/.test(c.t) && /🎁 \$5\.00 free/.test(c.t), c.t);
  check('Today: 3 played · 1 playing · 2 to play', /✓ 3 played/.test(c.t) && /▶ 1 playing/.test(c.t) && /⏳ 2 to play/.test(c.t), c.t);
  check('Today: won vs lost, money playing (at risk) and to play (not counted)', /played \$5\.50 → won \$12\.00 vs lost \$1\.50/.test(c.t) && /IN PLAY \$2\.00 not won or lost yet/.test(c.t) && /to play \$4\.00: not counted/.test(c.t), c.t);
  check('v4.07: the day counts only what is settled (2 + 10 − 1.50 = +$10.50); the $2 playing is IN PLAY in grey, not a loss; the $4 not started is not counted', c.pill==='+$10.50' && /IN PLAY \$2\.00/.test(c.t), [c.pill]);
  const ipCol=await p.evaluate(()=>{ const e=document.querySelector('#todayBar .tb-k .tb-pill.inplay'); return e?getComputedStyle(e).color===getComputedStyle(document.querySelector('#todayBar .tb-k .tb-n')).color:null; });
  check('v4.07: the IN PLAY pill is grey (the same grey as "6 bets"), not red', ipCol===true, ipCol);
  check('Novig: $10.50 · 4 bets · 1–1, 2 played · 1 playing · 1 to play, won $2.00 vs lost $1.50, UP +$0.50 and IN PLAY $2.00 (no DOWN)', /\$10\.50 · 4 bets 1–1/.test(c.novig) && /✓ 2 played ▶ 1 playing ⏳ 1 to play/.test(c.novig) && /won \$2\.00 vs lost \$1\.50/.test(c.novig) && /UP \+\$0\.50/.test(c.novig) && /IN PLAY \$2\.00/.test(c.novig) && !/DOWN/.test(c.novig), c.novig);
  check('Bovada: the free bet shows as 🎁 and adds nothing to the money staked', /\$1\.00 · 2 bets/.test(c.bovada) && /🎁 \$5\.00/.test(c.bovada), c.bovada);
  const spill=async()=>p.evaluate(()=>{ const bad=[]; document.querySelectorAll('#todayBar > .tb-t, #todayBar > .tb-k').forEach(t=>{ const r=t.getBoundingClientRect(); t.querySelectorAll('span,b,div,img').forEach(e=>{ const q=e.getBoundingClientRect(); if(q.width && (q.right>r.right+1 || q.left<r.left-1)) bad.push(e.textContent.slice(0,30)); }); }); return bad; });
  for(const w of [1960,1280,1000,390]){ await p.setViewportSize({width:w,height:1000}); await p.waitForTimeout(150); const sp=await spill(); check('v3.98: at '+w+' px wide, no Today card text runs into the next tile', !sp.length, sp.slice(0,4)); }
  await p.setViewportSize({width:1400,height:1000});
  // v4.02 (Alonzo: "on the Performance tab we do not need the API info"): the BettingPros bar and Sources show on the Board only, and Results by day comes first
  const seen=()=>p.evaluate(()=>{ const v=sel=>{ const e=document.querySelector(sel); return !!e && e.getBoundingClientRect().height>0; }; return {bp:v('.loadbar'), src:v('#srcBar'), count:v('.statbox')}; });
  let sn=await seen(); check('v4.02: on the Board, the BettingPros bar, Sources and the board count are there', sn.bp && sn.src && sn.count, sn);
  await p.click('.tab[data-view="v-perf"]'); await p.waitForTimeout(300); sn=await seen();
  const order=await p.evaluate(()=>{ const c=document.getElementById('calPanel'), s=document.getElementById('scorePanel'); return !!(c.compareDocumentPosition(s) & Node.DOCUMENT_POSITION_FOLLOWING); });
  check('v4.02: on Performance they are gone, and Results by day comes before the Scorecard', !sn.bp && !sn.src && !sn.count && order, {sn, order});
  for(const v of ['v-log','v-parlay','v-live','v-settings']){ await p.click('.tab[data-view="'+v+'"]'); await p.waitForTimeout(100); }
  sn=await seen(); check('v4.02: and on the other tabs (Bet log, Parlays, Live, Settings)', !sn.bp && !sn.src, sn);
  await p.click('.tab[data-view="v-board"][data-src="api"]'); await p.waitForTimeout(200); sn=await seen();
  check('v4.02: back on the Board they come back', sn.bp && sn.src && sn.count, sn);
  // v4.01 (Alonzo: "toggle between days, a button to go back and forth")
  const day=()=>p.evaluate(()=>({k:document.querySelector('#todayBar .tb-k > span').innerText.replace(/\s+/g,' '), t:document.getElementById('todayBar').innerText.replace(/\s+/g,' '), log:document.getElementById('v-log').classList.contains('on')}));
  await p.click('#todayBar .tb-day[data-d="-1"]'); await p.waitForTimeout(150); let dv=await day();
  check('v4.01: ‹ goes to the day before: WED, 11/4, no bets, and it stays on the Board', /^WED, 11\/4/.test(dv.k) && /No bets on Wed, 11\/4\./.test(dv.t) && !dv.log, dv);
  await p.click('#todayBar .tb-day[data-d="1"]'); await p.click('#todayBar .tb-day[data-d="1"]'); await p.waitForTimeout(150); dv=await day();
  check('v4.01: › › goes to tomorrow, FRI, 11/6: $3.00 · 1 bet, ⏳ 1 to play, with a Today button', /^FRI, 11\/6/.test(dv.k) && /\$3\.00 1 bet/.test(dv.t) && /⏳ 1 to play/.test(dv.t) && /Today/.test(dv.k), dv);
  await p.click('#todayBar .tb-back'); await p.waitForTimeout(150); dv=await day();
  check('v4.01: Today brings it back to today', /^TODAY/.test(dv.k) && /\$11\.50/.test(dv.t) && !/Today/.test(dv.k.replace('TODAY','')), dv.k);
  const ds=await p.evaluate(d=>{ const x=dayStats()[d]; return {staked:x.staked, profit:+x.profit.toFixed(2)}; }, DAY);
  check('Performance by day: staked leaves out the free bet; the not-started bet is not a loss', ds.staked===11.5 && ds.profit===10.5, ds);
  // v4.00 (Alonzo): the Performance calendar shows money on games not started in grey: not green, not red, not a worst day
  await p.click('.tab[data-view="v-perf"]'); await p.waitForTimeout(400);
  const cal=await p.evaluate(()=>{ const c=d=>{ const e=document.querySelector('.cal-c[data-day="'+d+'"]'); return e?{cls:e.className, v:e.querySelector('.v').innerText.replace(/\s+/g,' ')}:null; };
    return {today:c('2026-11-05'), tmrw:c('2026-11-06'), big:document.getElementById('calToday').innerText.replace(/\s+/g,' '), foot:document.getElementById('calFoot').innerText.replace(/\s+/g,' ')}; });
  check('calendar, today: +$10.50 (settled), then in grey ▶ $2.00 in play and ⏳ $4.00 to play', /\+\$10\.50/.test(cal.today.v) && /▶ \$2\.00 in play/.test(cal.today.v) && /⏳ \$4\.00 to play/.test(cal.today.v) && / w\b/.test(cal.today.cls), cal.today);
  check('calendar, a day whose games have not started: $3.00 in grey, neither won nor lost', cal.tmrw && /\$3\.00/.test(cal.tmrw.v) && !/ w\b| l\b/.test(cal.tmrw.cls) && / tp\b/.test(cal.tmrw.cls), cal.tmrw);
  check('a day with games not started is not the month\'s worst day (worst stays +$10.50, not $0.00)', /worst \+\$10\.50/.test(cal.foot), cal.foot);
  check('today at the top: +$10.50 · $2.00 in play · $4.00 to play', /\+\$10\.50 today · \$2\.00 in play · \$4\.00 to play/.test(cal.big), cal.big);
  for(const w of [1280,390]){ await p.setViewportSize({width:w,height:1000}); await p.waitForTimeout(200);
    const sp=await p.evaluate(()=>{ const bad=[]; document.querySelectorAll('.cal-c.has').forEach(c=>{ const r=c.getBoundingClientRect(); c.querySelectorAll('.v, .v *').forEach(e=>{ const q=e.getBoundingClientRect(); if(q.width && (q.right>r.right+0.5 || q.left<r.left-0.5)) bad.push(c.dataset.day+': '+e.textContent.slice(0,20)); }); }); return bad; });
    check('v4.00: at '+w+' px wide, every calendar amount fits inside its day', !sp.length, sp.slice(0,4)); }
  await p.setViewportSize({width:1400,height:1000});
  await p.click('.tab[data-view="v-log"]'); await p.waitForTimeout(300);
  // the boosted bet: it paid $13.66 back on a $1 stake (the odds alone say $11)
  await p.click('.tab[data-view="v-log"]'); await p.waitForTimeout(300);
  const edit=async id=>{ const i=await p.evaluate(id=>logged.findIndex(x=>x.id===id), id); await p.evaluate(i=>document.querySelector('#logBody button.kill.edit[data-i="'+i+'"]').click(), i); await p.waitForTimeout(300); };
  await edit('boost');
  const pre=await p.evaluate(()=>({back:document.querySelector('#logBody .eb-back').value, prof:document.querySelector('#logBody .eb-prof').value}));
  check('the editor shows what the odds pay now: Got back $11.00, Winnings $10.00', pre.back==='11.00' && pre.prof==='10.00', pre);
  await p.fill('#logBody .eb-back','13.66'); await p.waitForTimeout(100);
  const prof=await p.$eval('#logBody .eb-prof', x=>x.value);
  check('typing Got back $13.66 (stake included) fills Winnings $12.66 (stake not included)', prof==='12.66', prof);
  await p.evaluate(()=>document.querySelector('#logBody tr.editor .eb-save').click()); await p.waitForTimeout(400);
  const bo=await p.evaluate(()=>{ const x=logged.find(y=>y.id==='boost'); return {pl:betProfit(x), towin:x.towin, real:x.paidReal}; });
  check('saved: the bet made $12.66 (what the book paid, not the odds)', bo.pl===12.66 && bo.real===true, bo);
  // the other way round: type Winnings
  await edit('won'); await p.fill('#logBody .eb-prof','2.40'); await p.waitForTimeout(100);
  check('typing Winnings $2.40 fills Got back $5.40 on a $3 stake', await p.$eval('#logBody .eb-back', x=>x.value)==='5.40', await p.$eval('#logBody .eb-back', x=>x.value));
  await p.evaluate(()=>document.querySelector('#logBody tr.editor .eb-save').click()); await p.waitForTimeout(400);
  // the amount really lost (a partial cash-out)
  await edit('lost'); await p.fill('#logBody .eb-lostamt','0.75'); await p.evaluate(()=>document.querySelector('#logBody tr.editor .eb-save').click()); await p.waitForTimeout(400);
  // a free bet that lost costs nothing
  await edit('playing'); await p.check('#logBody .eb-free'); await p.evaluate(()=>document.querySelector('#logBody tr.editor .eb-save').click()); await p.waitForTimeout(400);
  await p.evaluate(()=>{ const x=logged.find(y=>y.id==='playing'); x.result='loss'; x.gradedBy='manual'; saveLog(); renderLog(); renderTodayBar(); });
  const R=await p.evaluate(()=>Object.fromEntries(logged.map(x=>[x.id, betProfit(x)])));
  check('Winnings typed: +$2.40 · lost typed: −$0.75 · a free bet that lost: $0.00', R.won===2.4 && R.lost===-0.75 && R.playing===0, R);
  c=await card();
  check('Today after the edits: won $2.40 + $12.66 vs lost $0.75; up +$14.31', /\+\$14\.31/.test(c.pill) && /vs lost \$0\.75/.test(c.t), [c.pill, c.t]);
  await p.reload(); await p.waitForTimeout(1200);
  check('everything survives a reload', await p.evaluate(()=>{ const g=id=>logged.find(y=>y.id===id); return betProfit(g('boost'))===12.66 && betProfit(g('lost'))===-0.75 && g('playing').free===true; }), true);
  check('no page errors', !errs.length, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
