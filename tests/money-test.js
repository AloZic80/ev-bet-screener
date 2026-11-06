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
  bet('boost',{book:'Bovada',stake:1,odds:'+1000',result:'win',gradedBy:'manual',start:iso(NOW-4*H),name:'Boosted'})];  // boosted: paid more than the odds
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
  check('Today: won vs lost, money playing (at risk) and to play (not counted)', /played \$5\.50 → won \$12\.00 vs lost \$1\.50/.test(c.t) && /playing \$2\.00 at risk/.test(c.t) && /to play \$4\.00: not counted/.test(c.t), c.t);
  check('the day is down by won − lost − money already playing (2 + 10 − 1.50 − 2 = +8.50), the not-started $4 is not counted', c.pill==='+$8.50', c.pill);
  check('Novig: $10.50 · 4 bets · 1–1, 2 played · 1 playing · 1 to play, won $2.00 vs lost $1.50', /\$10\.50 · 4 bets 1–1/.test(c.novig) && /✓ 2 played ▶ 1 playing ⏳ 1 to play/.test(c.novig) && /won \$2\.00 vs lost \$1\.50/.test(c.novig), c.novig);
  check('Bovada: the free bet shows as 🎁 and adds nothing to the money staked', /\$1\.00 · 2 bets/.test(c.bovada) && /🎁 \$5\.00/.test(c.bovada), c.bovada);
  const spill=async()=>p.evaluate(()=>{ const bad=[]; document.querySelectorAll('#todayBar > .tb-t, #todayBar > .tb-k').forEach(t=>{ const r=t.getBoundingClientRect(); t.querySelectorAll('span,b,div,img').forEach(e=>{ const q=e.getBoundingClientRect(); if(q.width && (q.right>r.right+1 || q.left<r.left-1)) bad.push(e.textContent.slice(0,30)); }); }); return bad; });
  for(const w of [1960,1280,1000,390]){ await p.setViewportSize({width:w,height:1000}); await p.waitForTimeout(150); const sp=await spill(); check('v3.98: at '+w+' px wide, no Today card text runs into the next tile', !sp.length, sp.slice(0,4)); }
  await p.setViewportSize({width:1400,height:1000});
  const ds=await p.evaluate(d=>{ const x=dayStats()[d]; return {staked:x.staked, profit:+x.profit.toFixed(2)}; }, DAY);
  check('Performance by day: staked leaves out the free bet; the not-started bet is not a loss', ds.staked===11.5 && ds.profit===8.5, ds);
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
