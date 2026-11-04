// node tests/log-test.js — the Bet log: newest on top, one row per game day that opens and closes (and stays as you left it),
// the Look out list (bets not graded yet, automatically or by you) with its count on the Bet log tab, and a board bet saved
// with its result once its game has started. Dates are relative to now, so it never goes stale.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const H=3600e3, D=24*H, now=Date.now(), CT=ms=>new Date(ms).toLocaleDateString('en-CA',{timeZone:'America/Chicago'});
const day=n=>CT(now+n*D), at=(d,h)=>new Date(d+'T'+String(h).padStart(2,'0')+':00:00-06:00').toISOString(), iso=ms=>new Date(ms).toISOString();
const TODAY=day(0), YDAY=day(-1), D2=day(-2), D3=day(-3), D4=day(-4), D5=day(-5), T1DAY=CT(now+5*H);   // today's game may start after midnight
const bet=(id,o)=>Object.assign({id, key:id, sport:'NBA', kind:'moneyline', book:'FanDuel', odds:'-110', stake:10, closing:'', snap:{at:iso(now-H)}}, o);
const LOG=[
  bet('d3a',{date:D3, name:'BOS', team:'BOS', market:'Moneyline', betnow:'BOS ML', game:'LAL @ BOS', start:at(D3,18), result:'loss', snap:{at:at(D3,12)}}),
  bet('d3b',{date:D3, name:'LAL', team:'LAL', market:'Moneyline', betnow:'LAL ML', game:'LAL @ BOS', start:at(D3,18), result:'win', snap:{at:at(D3,13)}}),
  bet('y1', {date:YDAY, name:'MIA', team:'MIA', market:'Moneyline', betnow:'MIA ML', game:'NY @ MIA', start:at(YDAY,18), result:'win', snap:{at:at(YDAY,10)}}),
  bet('y2', {date:YDAY, name:'NY', team:'NY', market:'Moneyline', betnow:'NY ML', game:'NY @ MIA', start:at(YDAY,18), snap:{at:at(YDAY,11)}}),   // over, never graded
  bet('t1', {date:TODAY, name:'DET', team:'DET', market:'Moneyline', betnow:'DET ML', game:'CHA @ DET', start:iso(now+5*H), snap:{at:iso(now-60e3)}}),   // newest
  {id:'p4', key:'p4', date:D4, dateSet:true, name:'4-pick Pick 6', sport:'NFL', kind:'parlay', book:'DraftKings Pick 6', odds:'+900', stake:5, parlay:{picks:4, pays:{all:50}}, snap:{at:at(D4,9)}},   // parlay, day passed
  bet('d5', {date:D5, dateSet:true, manual:true, name:'SAC', team:'SAC', market:'Moneyline', betnow:'SAC ML', game:'SAC @ UTAH', book:'BetMGM', snap:{at:at(D5,9)}}),   // typed game, day passed
  bet('q2', {date:D2, name:'Josh Allen', sport:'NFL', kind:'prop', side:'O', market:'245.5 Passing Yards', betnow:'Over 245.5', game:'BUF @ MIA', start:at(D2,12), result:'?', why:{reason:'player not in the box score'}, snap:{at:at(D2,8)}}),
];
const gi=(st,ms)=>({state:st, startISO:iso(ms), timeCT:'', detail:st==='post'?'Final':'', teams:[]});
const BOARD=[
  {name:'Jalen Brunson',game:'NY @ MIA',matchup:'NY @ MIA',side:'O',sport:'NBA',market:'27.5 Points',kind:'prop',book:'DraftKings',offeredRaw:'-110',offeredProb:.524,fairProb:.58,fairRaw:'-138',mktProb:.55,stars:3,evModel:'projection',gameInfo:gi('post',now-6*H),src:'api:NBA:props',apiKey:'b1'},
  {name:'Cade Cunningham',game:'CHA @ DET',matchup:'CHA @ DET',side:'O',sport:'NBA',market:'8.5 Assists',kind:'prop',book:'DraftKings',offeredRaw:'-110',offeredProb:.524,fairProb:.58,fairRaw:'-138',mktProb:.55,stars:3,evModel:'projection',gameInfo:gi('pre',now+5*H),src:'api:NBA:props',apiKey:'b2'},
];
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago', viewport:{width:1400,height:1000}});
  await ctx.addInitScript(([L,rows,d])=>{ try{ if(sessionStorage.getItem('seeded')) return; sessionStorage.setItem('seeded','1'); localStorage.clear();
    localStorage.setItem('mbev.log',JSON.stringify(L)); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows})); }catch(e){} }, [LOG,BOARD,TODAY]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/espn\.com.*scoreboard/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1500);
  check('Bet log tab shows 4 bets to check', (await p.textContent('#logTabN'))==='4', await p.textContent('#logTabN'));
  check('the Today card says so too', ((await p.textContent('#todayBar .tb-look'))||'').trim()==='⚠ 4 to check', await p.textContent('#todayBar .tb-look').catch(()=>null));
  await p.click('#todayBar .tb-look'); await p.waitForTimeout(300);
  check('and opens the Bet log at the Look out list', await p.evaluate(()=>document.getElementById('v-log').classList.contains('on') && !document.getElementById('lookOut').hidden), true);
  await p.click('.tab[data-view="v-log"]'); await p.waitForTimeout(400);
  const lo=await p.$$eval('#lookOut .lo-row',r=>r.map(x=>x.querySelector('.lo-why').textContent));
  check('Look out lists them, each with why', lo.length===4 && lo.some(t=>/game over, no result yet/.test(t)) && lo.some(t=>/parlay: set how many legs hit/.test(t)) && lo.some(t=>/game day passed/.test(t)) && lo.some(t=>/cannot grade it automatically: \w/.test(t)), lo);
  check('nothing open or settled is on it (today’s game, won and lost bets)', await p.$$eval('#lookOut .lo-res',b=>!b.some(x=>['t1','y1','d3a','d3b'].includes(logged[+x.dataset.i].id))), true);
  const view=()=>p.evaluate(()=>[...document.querySelectorAll('#logBody tr')].filter(t=>!t.classList.contains('editor')).map(t=>t.classList.contains('log-day')
    ? {day:t.querySelector('.log-day-btn').dataset.day, open:t.querySelector('.log-day-btn').getAttribute('aria-expanded')==='true', txt:t.innerText.replace(/\s+/g,' ').trim()}
    : {id:(logged[+((t.querySelector('[data-i]')||{}).dataset||{}).i]||{}).id, hidden:t.hidden}));
  let v=await view(); const heads=v.filter(x=>x.day!==undefined);
  check('one row per game day, newest day first', JSON.stringify(heads.map(h=>h.day))===JSON.stringify([T1DAY,YDAY,D2,D3,D4,D5]), heads.map(h=>h.day));
  check('newest bet on top', v[1] && v[1].id==='t1', v.slice(0,2));
  const order=v.filter(x=>x.id).map(x=>x.id);
  check('newest first inside a day too (yesterday: NY saved after MIA)', order.indexOf('y2')<order.indexOf('y1') && order.indexOf('d3b')<order.indexOf('d3a'), order);
  check('today, yesterday and days with a bet to check start open; an older settled day starts closed', heads.filter(h=>h.open).map(h=>h.day).join()===[T1DAY,YDAY,D2,D4,D5].join() && v.filter(x=>x.id==='d3a'||x.id==='d3b').every(x=>x.hidden), heads.map(h=>h.day+':'+h.open));
  check('day row sums it up (3 days ago: 2 bets, 1–1–0)', /2 bets · 1–1–0/.test(heads.find(h=>h.day===D3).txt) && /⚠ 1 to check/.test(heads.find(h=>h.day===YDAY).txt), [heads.find(h=>h.day===D3).txt, heads.find(h=>h.day===YDAY).txt]);
  // open a closed day: it stays open after a reload
  await p.click('#logBody .log-day-btn[data-day="'+D3+'"]'); await p.waitForTimeout(200);
  v=await view(); check('a tap opens a closed day', v.filter(x=>x.id==='d3a'||x.id==='d3b').every(x=>!x.hidden) && v.find(x=>x.day===D3).open, v.filter(x=>x.day===D3));
  check('keyboard focus stays on that day', await p.evaluate(()=>document.activeElement && document.activeElement.dataset && document.activeElement.dataset.day), D3);
  await p.click('#logBody .log-day-btn[data-day="'+T1DAY+'"]'); await p.waitForTimeout(200);
  await p.reload(); await p.waitForTimeout(1500); await p.click('.tab[data-view="v-log"]'); await p.waitForTimeout(300);
  v=await view(); check('days stay as you left them after a reload (3 days ago open, the newest day closed)', v.find(x=>x.day===D3).open && !v.find(x=>x.day===T1DAY).open && v.find(x=>x.id==='t1').hidden, v.filter(x=>x.day).map(x=>x.day+':'+x.open));
  // mark one from Look out
  await p.click('#lookOut .lo-res[data-res="win"][data-i="'+(await p.evaluate(()=>logged.findIndex(x=>x.id==='y2')))+'"]'); await p.waitForTimeout(300);
  const y2=await p.evaluate(()=>{ const x=logged.find(b=>b.id==='y2'); return {result:x.result, by:x.gradedBy, src:x.resultSrc}; });
  check('Won on the Look out list grades it as yours, and the count drops to 3 (tab and Today card)', y2.result==='win' && y2.by==='manual' && y2.src==='you' && (await p.textContent('#logTabN'))==='3' && (await p.$$eval('#lookOut .lo-row',r=>r.length))===3 && /3 to check/.test(await p.textContent('#todayBar .tb-look')), [y2, await p.textContent('#logTabN'), await p.textContent('#todayBar .tb-look')]);
  // Find it: opens the day and shows the row
  await p.click('#logBody .log-day-btn[data-day="'+D5+'"]'); await p.waitForTimeout(200);   // close it first
  await p.click('#lookOut .lo-find[data-i="'+(await p.evaluate(()=>logged.findIndex(x=>x.id==='d5')))+'"]'); await p.waitForTimeout(300);
  const found=await p.evaluate(()=>{ const i=logged.findIndex(x=>x.id==='d5'); const tr=document.querySelector('#logBody [data-i="'+i+'"]').closest('tr'); const r=tr.getBoundingClientRect(); return {hidden:tr.hidden, flash:tr.classList.contains('lo-flash'), inView:r.top>=0 && r.bottom<=innerHeight}; });
  check('Find it opens that day and scrolls to the bet', !found.hidden && found.flash && found.inView, found);
  // the calendar's one-day view still works
  const one=await p.evaluate(d=>{ logDayFilter=d; renderLog(); const r=[...document.querySelectorAll('#logBody tr.log-day')].map(t=>t.querySelector('.log-day-btn').dataset.day); logDayFilter=null; renderLog(); return r; }, D3);
  check('calendar day filter shows just that day', one.join()===D3, one);
  // a board bet whose game is over: Result in the editor, saved graded, no second press
  await p.click('.tab[data-view="v-board"]'); await p.waitForTimeout(500);
  const btns=await p.$$eval('button.bet-btn',b=>b.map(x=>({i:+x.dataset.idx, name:lastRows.find(r=>r.idx===+x.dataset.idx).name, where:x.closest('#placeCards')?'Place these':'table'})));
  const over=btns.find(x=>x.name==='Jalen Brunson'), pre=btns.find(x=>x.name==='Cade Cunningham');
  check('both board rows have I bet this (the open game under Place these, the finished one in the table)', !!over && !!pre && pre.where==='Place these' && over.where==='table', btns);
  await p.click('#placeCards button.bet-btn[data-idx="'+pre.i+'"]'); await p.waitForTimeout(300);
  check('not started: the usual box (odds or %, stake, To win), no Result box', !!(await p.$('#placeCards .editor .eb-win-o')) && !(await p.$('#placeCards .editor .eb-res-new')), true);
  await p.click('#placeCards .editor .eb-cancel'); await p.click('#tbody button.bet-btn[data-idx="'+over.i+'"]'); await p.waitForTimeout(300);
  const ed=await p.evaluate(()=>({res:!!document.querySelector('#tbody tr.editor .eb-res-new'), late:(document.querySelector('#tbody tr.editor .eb-late')||{}).textContent||''}));
  check('game over: Result box, and a note that it will not grade itself (started over 4 hours ago)', ed.res && /will not grade itself/.test(ed.late), ed);
  await p.selectOption('#tbody tr.editor .eb-mode','odds'); await p.fill('#tbody tr.editor .eb-odds','+150'); await p.fill('#tbody tr.editor .eb-stake','4'); await p.selectOption('#tbody tr.editor .eb-res-new','loss');
  const n0=await p.evaluate(()=>logged.length); await p.click('#tbody tr.editor .eb-save'); await p.waitForTimeout(500);
  const L=await p.evaluate(n=>logged.length>n ? (x=>({name:x.name, result:x.result, by:x.gradedBy, odds:x.odds, stake:x.stake, start:!!x.start}))(logged[logged.length-1]) : null, n0);
  check('saved in one press as LOST, graded by you, odds +150, $4, game time kept', L && L.name==='Jalen Brunson' && L.result==='loss' && L.by==='manual' && L.odds==='+150' && L.stake===4 && L.start, L);
  await p.click('.tab[data-view="v-log"]'); await p.waitForTimeout(300);
  const st=await p.evaluate(()=>{ const i=logged.length-1, tr=document.querySelector('#logBody button.kill.edit[data-i="'+i+'"]').closest('tr'); return tr.cells[0].querySelector('[title="game day"]').textContent; });
  check('the log says it was played', /^played /.test(st), st);
  // phone: the day rows and the count fit
  await p.setViewportSize({width:390,height:844}); await p.waitForTimeout(300);
  const ph=await p.evaluate(()=>{ const b=document.querySelector('#logBody .log-day-btn'), r=b.getBoundingClientRect(), t=document.querySelector('.tab[data-view="v-log"]'), n=document.getElementById('logTabN');
    return {btnLeft:r.left, btnRight:r.right, w:innerWidth, overflow:document.documentElement.scrollWidth>innerWidth+1, tabN:n.textContent, tabNvisible:n.getBoundingClientRect().width>0 && t.getBoundingClientRect().bottom<=innerHeight+1}; });
  check('phone: the day row is on screen, the page does not scroll sideways, the count shows in the tab bar', ph.btnLeft>=0 && ph.btnLeft<ph.w && !ph.overflow && ph.tabNvisible, ph);
  const hrs=await p.evaluate(()=>({nfl:overAfterH({sport:'NFL'}), mlb:overAfterH({sport:'MLB'}), test:overAfterH({sport:'TESTCRICKET'}), odi:overAfterH({sport:'ODI'}), mma:overAfterH({sport:'MMA'}),
    golf:overAfterH({sport:'GOLF'}), tennis:overAfterH({sport:'ATP_PARIS_MASTERS'}), testLook:lookOutWhy({sport:'TESTCRICKET', kind:'moneyline', start:new Date(Date.now()-30*3600e3).toISOString(), date:'x'})}));
  check('"surely over" fits the sport: 5 h, baseball and tennis 7, fights 8, one-day cricket 11, golf 100, a Test 130 (not on Look out a day in)', hrs.nfl===5 && hrs.mlb===7 && hrs.tennis===7 && hrs.mma===8 && hrs.odi===11 && hrs.golf===100 && hrs.test===130 && hrs.testLook==='', hrs);
  check('no page errors', errs.length===0, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
