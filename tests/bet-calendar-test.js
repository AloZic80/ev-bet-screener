// node tests/bet-calendar-test.js — v4.36. Alonzo: "build" (Augi's screens, step 3: the Bet log). Augi's bet calendar on our log: a month of game
// days with settled profit (grey while open), tap a day for its summary and the daily max bar, his cover range breakdown, Track by Daily /
// Weekly / Monthly (settled profit and ROI only), and his bet-import file, checked ticket by ticket. Numbers worked out by hand below.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const NOW=Date.parse('2026-11-09T18:00:00Z'), H=3600e3, iso=ms=>new Date(ms).toISOString();
const B=(id,day,fair,odds,stake,result,start)=>Object.assign({id,key:id,name:'Player '+id,sport:'NBA',kind:'prop',market:'10.5 Points',side:'O',book:'Novig',odds,offeredRaw:odds,stake,fair,date:day,dateSet:true,start,snap:{at:iso(NOW-30*H)}},result?{result,gradedBy:'manual',resultSrc:'you',manual:true}:{});
// Mon 11/9: a Lean (60%) win at +150 $10 → +$15, a Lean loss $10 → −$10, a Long Shot (40%) $5 not started, a 2-pick parlay $2 (legs 58%, 72%) not started.
// Sun 11/8: a win at +200 $5 → +$10.
const PL={id:'pl1',kind:'parlay',date:'2026-11-09',dateSet:true,start:null,name:'Parlay · 2 picks',sport:'PARLAY',market:'2-pick parlay',book:'Kalshi',odds:'+250',fair:'',stake:2,result:'pending',closing:'',
  parlay:{picks:2,legs:'Player x O 20.5 Points; Player y O 5.5 Assists',pays:{all:7,m1:0,m2:0},hits:null,payout:null,pk:{legs:[{name:'Player x',p:.58},{name:'Player y',p:.72}]}},snap:{at:iso(NOW-H)}};
const LOG=[B('a','2026-11-09','-150','+150',10,'win',iso(NOW-4*H)),B('b','2026-11-09','-150','-110',10,'loss',iso(NOW-4*H)),B('c','2026-11-09','+150','-110',5,null,iso(NOW+4*H)),PL,B('d','2026-11-08','+150','+200',5,'win',iso(NOW-28*H))];
const IMP={type:'augi-bet-import',v:1,importId:'t1',notes:'From two screenshots.',singles:[
  {day:'2026-11-09',game:'LAC @ MIN',player:'Player a',team:'MIN',market:'Points',outcome:'Over',point:10.5,sport:'NBA',book:'Novig',stake:10,quotedPayout:25,placedDate:'2026-11-09'},
  {day:'2026-11-10',game:'BOS @ NY',player:'Jalen Brunson',team:'NY',market:'Assists',outcome:'Under',point:7.5,sport:'NBA',book:'PrizePicks',stake:4,quotedPayout:10,placedDate:'2026-11-09',note:'from a screenshot'}],
  parlays:[{platform:'PrizePicks',stake:5,quotedPayout:50,placedDate:'2026-11-09',legs:[
    {day:'2026-11-10',game:'BOS @ NY',player:'Jayson Tatum',market:'Points',outcome:'Over',point:26.5,sport:'NBA'},
    {day:'2026-11-10',game:'BOS @ NY',player:'Karl-Anthony Towns',market:'Rebounds',outcome:'Over',point:11.5,sport:'NBA'}]}]};
async function run(width){
  const b=await chromium.launch();
  const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width,height:900}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(([L])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.log',JSON.stringify(L)); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig',cfgVer:3.03})); }catch(e){} }, [LOG]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/api\.0xbeta\.dev/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1000);
  await p.click('.tab[data-view="v-log"]'); await p.waitForTimeout(500);
  return {b,p,errs};
}
(async()=>{
  const {b,p,errs}=await run(1280);
  const cell=d=>p.evaluate(d=>{ const c=document.querySelector('#lcCal .lc-d[data-day="'+d+'"]'); return c?c.innerText.replace(/\s+/g,' ').trim():null; },d);
  check('the calendar shows November 2026', (await p.textContent('#lcTitle'))==='November 2026', await p.textContent('#lcTitle'));
  check('Mon 11/9: 4 bets, settled +$5.00 (the open $7 is not counted)', (await cell('2026-11-09'))==='9 4 bets +$5.00', await cell('2026-11-09'));
  check('Sun 11/8: 1 bet, +$10.00', (await cell('2026-11-08'))==='8 1 bet +$10.00', await cell('2026-11-08'));
  check('a day with no bets is just its number', (await cell('2026-11-03'))==='3', await cell('2026-11-03'));
  check('today is selected', await p.getAttribute('#lcCal .lc-d[data-day="2026-11-09"]','aria-pressed')==='true', null);
  const sum=await p.evaluate(()=>[...document.querySelectorAll('#lcSum>div')].map(d=>d.innerText.replace(/\s+/g,' ').trim()));
  check('the day: 4 bets, $27.00 staked, settled +$5.00, $0.00 in play, $7.00 to play, 2 open', sum.join('|')==='Bets 4|Staked $27.00|Settled profit +$5.00|▶ In play $0.00|⏳ To play $7.00|Open bets 2', sum);
  const mx=await p.evaluate(()=>({l:document.getElementById('lcMaxL').innerText, max:cfgRead().dayMax, v:document.getElementById('lcMax').value, hid:document.getElementById('lcMax').hidden}));
  check('the daily max bar: $27.00 of your daily max, with what is left', mx.max>27 ? (new RegExp('^\\$27\\.00 of your \\$'+mx.max.toFixed(2).replace('.','\\.')+' daily max · \\$'+(mx.max-27).toFixed(2).replace('.','\\.')+' left$').test(mx.l) && mx.v===27 && !mx.hid) : /reached/.test(mx.l), mx);
  const bands=await p.evaluate(()=>[...document.querySelectorAll('#lcBands .lc-band')].map(r=>r.innerText.replace(/\s+/g,' ').trim()));
  const band=n=>bands.find(x=>x.startsWith(n))||'';
  check('cover bands for 11/9: 5 picks (3 singles + 2 parlay legs)', (await p.textContent('#lcBandSub'))==='· 5 picks', await p.textContent('#lcBandSub'));
  check('Lean 2 · 40.0%, Long Shot 1 · 20.0%, Slight Lean 1 · 20.0%, Strong 1 · 20.0%', /2 · 40\.0%$/.test(band('Lean')) && /1 · 20\.0%$/.test(band('Long Shot')) && /1 · 20\.0%$/.test(band('Slight Lean')) && /1 · 20\.0%$/.test(band('Strong')), bands);
  check('nine bands listed (Unknown left out when it is 0)', bands.length===9, bands.length);
  const perf=()=>p.evaluate(()=>[...document.querySelectorAll('#lcPerf tr')].map(tr=>[...tr.children].map(td=>td.innerText.trim()).join('|')));
  let rows=await perf();
  check('Daily: Mon 11/9 4 bets, 2 pending, 1–1–0, $27.00, +$5.00, ROI +25.0% (on the $20 settled)', rows[0]==='Mon, 11/9|4|2|1–1–0|$27.00|+$5.00|+25.0%', rows);
  check('Daily: Sun 11/8 +$10.00, ROI +200.0%', rows[1]==='Sun, 11/8|1|0|1–0–0|$5.00|+$10.00|+200.0%', rows);
  await p.selectOption('#lcPeriod','week'); await p.waitForTimeout(150); rows=await perf();
  check('Weekly (from Monday): week of 11/9 and week of 11/2 (Sunday 11/8)', rows.length===2 && rows[0].startsWith('Week of Mon, 11/9|4|') && rows[1].startsWith('Week of Mon, 11/2|1|'), rows);
  await p.selectOption('#lcPeriod','month'); await p.waitForTimeout(150); rows=await perf();
  check('Monthly: November 2026, 5 bets, 2 pending, 2–1–0, $32.00, +$15.00, ROI +60.0%', rows[0]==='November 2026|5|2|2–1–0|$32.00|+$15.00|+60.0%', rows);
  check('Track by is remembered', await p.evaluate(()=>localStorage.getItem('mbev.lcPeriod'))==='month', null);
  await p.click('#lcCal .lc-d[data-day="2026-11-08"]'); await p.waitForTimeout(150);
  check('tap 11/8: its summary', (await p.textContent('#lcDayTitle')).startsWith('Sunday, Nov 8') && (await p.evaluate(()=>document.querySelector('#lcSum>div').innerText.replace(/\s+/g,' ')))==='Bets 1', await p.textContent('#lcDayTitle'));
  await p.click('#lcShow'); await p.waitForTimeout(300);
  const lf=await p.evaluate(()=>({on:getComputedStyle(document.getElementById('logFilter')).display!=='none', t:document.getElementById('logFilter').innerText}));
  check('Show this day filters Bets you took to 11/8', lf.on && /Sun, 11\/8/.test(lf.t), lf);
  await p.click('#lcNext'); await p.waitForTimeout(100);
  check('› goes to December', (await p.textContent('#lcTitle'))==='December 2026', null);
  await p.click('#lcToday'); await p.waitForTimeout(100);
  check('Today comes back to 11/9', (await p.textContent('#lcTitle'))==='November 2026' && await p.getAttribute('#lcCal .lc-d[data-day="2026-11-09"]','aria-pressed')==='true', null);
  // import
  await p.evaluate(()=>{ const d=document.querySelector('details[data-help="lc-import"]'); d.open=true; });
  await p.setInputFiles('#lcFile',{name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{"type":"other"}')}); await p.waitForTimeout(200);
  check('a wrong file says so and saves nothing', /^Could not read the file: Choose an Odds Board bet-import file/.test(await p.textContent('#lcImpMsg')) && await p.isHidden('#lcImpSave'), await p.textContent('#lcImpMsg'));
  await p.setInputFiles('#lcFile',{name:'imp.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(IMP))}); await p.waitForTimeout(200);
  const msg=await p.textContent('#lcImpMsg'), ticks=await p.evaluate(()=>[...document.querySelectorAll('#lcImpList .lc-on')].map(c=>c.checked));
  check('read: 2 singles and 1 parlay, 1 already in the log', /^2 singles and 1 parlay read · 1 already in your log \(unticked\)/.test(msg), msg);
  check('the ticket already logged (Player a Over 10.5 Points on 11/9) is unticked', JSON.stringify(ticks)==='[false,true,true]', ticks);
  const n0=await p.evaluate(()=>logged.length);
  await p.fill('#lcImpList .lc-imp[data-i="1"] .lc-st','3'); await p.click('#lcImpSave'); await p.waitForTimeout(300);
  const after=await p.evaluate(()=>({n:logged.length, s:logged.find(b=>b.id==='imp-t1-s1'), pl:logged.find(b=>b.id==='imp-t1-p0'), saved:JSON.parse(localStorage.getItem('mbev.log')).length, msg:document.getElementById('lcImpMsg').textContent}));
  check('2 tickets saved (the logged one left out), also in mbev.log', after.n===n0+2 && after.saved===n0+2 && /^Saved 2 tickets to your Bet log · 1 left out/.test(after.msg), after.msg);
  check('the single: Jalen Brunson U 7.5 Assists, PrizePicks, game day 11/10, cost edited to $3 → $10 back = +233, no result', after.s && after.s.name==='Jalen Brunson' && after.s.side==='U' && after.s.market==='7.5 Assists' && after.s.book==='PrizePicks' && after.s.date==='2026-11-10' && after.s.dateSet && after.s.stake===3 && after.s.odds==='+233' && after.s.result==null && after.s.manual, after.s);
  check('the parlay: 2 picks, $5 pays $50, its legs written out, game day 11/10', after.pl && after.pl.kind==='parlay' && after.pl.parlay.picks===2 && after.pl.parlay.pays.all===50 && after.pl.stake===5 && after.pl.parlay.legs==='Jayson Tatum O 26.5 Points; Karl-Anthony Towns O 11.5 Rebounds' && after.pl.date==='2026-11-10', after.pl&&after.pl.parlay);
  check('the calendar jumps to 11/10 with the new bets', await p.getAttribute('#lcCal .lc-d[data-day="2026-11-10"]','aria-pressed')==='true' && /^10 2 bets/.test(await cell('2026-11-10')), await cell('2026-11-10'));
  await p.setInputFiles('#lcFile',{name:'imp.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(IMP))}); await p.waitForTimeout(200);
  check('the same file again: all three already in the log, none ticked', /3 already in your log/.test(await p.textContent('#lcImpMsg')) && (await p.evaluate(()=>[...document.querySelectorAll('#lcImpList .lc-on')].every(c=>!c.checked))), await p.textContent('#lcImpMsg'));
  check('no page errors (computer)', !errs.length, errs);
  await b.close();
  // phone: the calendar fits, no page scroll sideways
  const ph=await run(390);
  const fit=await ph.p.evaluate(()=>({sw:document.documentElement.scrollWidth, cw:document.documentElement.clientWidth, cal:document.getElementById('lcCal').getBoundingClientRect().width, d:document.querySelector('#lcCal .lc-d').getBoundingClientRect().width}));
  check('phone (390): the calendar fits, no sideways scroll, day boxes at least 40 px', fit.sw<=fit.cw && fit.cal<=390 && fit.d>=40, fit);
  const fitT=await ph.p.evaluate(()=>[...document.querySelectorAll('#lcCal .lc-d small')].filter(x=>getComputedStyle(x).display!=='none').map(x=>({t:x.innerText, cut:x.scrollWidth>x.clientWidth+1})));
  check('phone: the day amounts fit whole, without the $ (+5.00 on 11/9, +10.00 on 11/8)', fitT.length>=2 && fitT.every(x=>!x.cut) && fitT.some(x=>x.t==='+5.00') && fitT.some(x=>x.t==='+10.00'), fitT);
  check('no page errors (phone)', !ph.errs.length, ph.errs);
  await ph.b.close();
  console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail?1:0);
})();
