// Usage: node tests/add-bet-test.js [index.html path] — "already happened" bets, any price format, fee rule, push, hidden tabs, phone tab bar
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium, devices } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const route=r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
  if(/espn\.com/.test(u)&&/scoreboard/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); };
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago', viewport:{width:1280,height:900}}); const p=await ctx.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message)); await p.route('**/*',route);
  await p.goto('http://app.test/'); await p.waitForTimeout(1000);
  const ver=await p.evaluate(()=>SCREENER_VERSION);   // the one version number, shown in the tab title and the header
  check('version is the same everywhere ('+ver+')', /^v\d+\.\d+$/.test(ver) && (await p.title())==='0xBeta Screener '+ver && (await p.textContent('#verTag'))===ver, [await p.title(), await p.textContent('#verTag')]);
  const vis=await p.$$eval('.tab',t=>t.filter(x=>x.offsetParent!==null).map(x=>x.textContent.trim()));
  check('Pasted and Paste a board hidden, Board shown', !vis.some(x=>/^Pasted|Paste a board/.test(x)) && vis.includes('Board'), vis);
  check('Paste ▸ link hidden', await p.$eval('#pasteLink',e=>e.offsetParent===null), true);
  check('ESPN score strip still shown', await p.$eval('#scoreStrip',e=>e.offsetParent!==null && e.getBoundingClientRect().height>0), true);
  check('Today card: one-line empty state', await p.$eval('#todayBar',e=>!!e.querySelector('.tb-empty') && !e.querySelector('.tb-t')), await p.$eval('#todayBar',e=>e.innerText.replace(/\s+/g,' ')));
  await p.click('.tab[data-view="v-add"]'); await p.waitForTimeout(400); await p.selectOption('#abSport','NBA'); await p.waitForTimeout(800);
  async function add({game,team,teamFree,book,odds,stake,towin,result,date}){
    await p.selectOption('#abType','moneyline'); await p.fill('#abGameFree',game); await p.fill('#abDate',date||'2026-10-20'); await p.waitForTimeout(250);
    if(team) await p.selectOption('#abTeam',team); if(teamFree) await p.fill('#abTeamFree',teamFree);
    await p.waitForSelector('#abHost .editor'); await p.selectOption('#abHost .eb-book',book); await p.selectOption('#abHost .eb-mode','odds');
    await p.fill('#abHost .eb-odds',odds||''); await p.fill('#abHost .eb-stake',stake); await p.fill('#abHost .eb-win-o',towin||'');
    await p.selectOption('#abResult',result); await p.waitForTimeout(250);
    const n0=await p.evaluate(()=>logged.length); await p.click('#abHost .eb-save'); await p.waitForTimeout(700);
    const n=await p.evaluate(()=>logged.length); if(n===n0) return {notSaved: await p.$eval('#abHost .eb-msg',e=>e.textContent).catch(()=>'')};
    return p.evaluate(()=>{ const x=logged[logged.length-1]; return {date:x.date, game:x.game, team:x.team, name:x.name, book:x.book, odds:x.odds, stake:x.stake, towin:x.towin, fee:x.fee, result:x.result, gradedBy:x.gradedBy, profit:betProfit(x)}; });
  }
  const teamOpts=async g=>{ await p.selectOption('#abType','moneyline'); await p.fill('#abGameFree',g); await p.waitForTimeout(200); return p.$$eval('#abTeam option',o=>o.map(x=>x.value)); };
  check('typed game LAL @ BOS fills the Team list', JSON.stringify(await teamOpts('LAL @ BOS'))==='["LAL","BOS"]', await teamOpts('LAL @ BOS'));
  let r=await add({game:'LAL @ BOS',team:'BOS',book:'FanDuel',odds:'1.91',stake:'10',result:'win'});
  console.log('decimal 1.91, won:',JSON.stringify(r));
  check('past moneyline on typed game saves, graded WIN by you', r.result==='win' && r.gradedBy==='manual' && r.date==='2026-10-20' && r.team==='BOS', r);
  check('decimal 1.91 → -110, profit 9.09', r.odds==='-110' && r.profit===9.09, [r.odds,r.profit]);
  r=await add({game:'LAL @ BOS',team:'LAL',book:'DraftKings',odds:'52.4%',stake:'10',result:'loss'});
  console.log('52.4%, lost:',JSON.stringify(r));
  check('percentage 52.4% → -110, lost → -10', r.odds==='-110' && r.result==='loss' && r.profit===-10, [r.odds,r.result,r.profit]);
  r=await add({game:'Lakers vs Celtics',teamFree:'lal',book:'BetMGM',odds:'+150',stake:'4',result:'push'});
  console.log('unparseable game, typed team, push:',JSON.stringify(r));
  check('free-text team saves (LAL), push → profit 0', r.team==='LAL' && r.result==='push' && r.profit===0 && r.odds==='+150', r);
  r=await add({game:'NYK @ MIA',team:'NY',book:'Kalshi',odds:'',stake:'5',towin:'4.70',result:'win'});
  console.log('Kalshi (fee book), To win 4.70, won:',JSON.stringify(r));
  const withFee=await p.evaluate(()=>betProfit(Object.assign({},logged[logged.length-1],{fee:0.035})));   // a fee is stored when a bet is edited
  check('fee book: typed To win is the profit (4.70), also with a 3.5% fee stored', r.towin===4.7 && r.profit===4.7 && withFee===4.7, [r.towin,r.profit,withFee]);
  const old=await add({game:'NYK @ MIA',team:'MIA',book:'DraftKings',odds:'-120',stake:'6',result:'',date:new Date(Date.now()-40*86400e3).toLocaleDateString('en-CA',{timeZone:'America/Chicago'})});
  check('Result left blank on a game more than 30 days back: asks for the Result (v3.97: grading reaches 30 days)', !!old.notSaved && /more than 30 days ago/.test(old.notSaved), old);
  const yday=new Date(Date.now()-86400e3).toLocaleDateString('en-CA',{timeZone:'America/Chicago'});
  r=await add({game:'NYK @ MIA',team:'MIA',book:'DraftKings',odds:'-120',stake:'6',result:'',date:yday});
  check('Result left blank → not graded', r.result===undefined && r.profit===null, r);
  check('Result box resets after a save', (await p.inputValue('#abResult'))==='', await p.inputValue('#abResult'));
  // Mark PUSH from the log editor
  await p.click('.tab[data-view="v-log"]'); await p.waitForTimeout(300);
  const last=await p.evaluate(()=>logged.length-1);
  await p.evaluate(i=>document.querySelector('#logBody button.kill.edit[data-i="'+i+'"]').click(), last); await p.waitForTimeout(300);
  check('edit shows a Mark PUSH button', !!(await p.$('#logBody tr.editor button.eb-res[data-res="push"]')), true);
  await p.evaluate(()=>document.querySelector('#logBody tr.editor button.eb-res[data-res="push"]').click()); await p.waitForTimeout(300);
  r=await p.evaluate(i=>({result:logged[i].result, profit:betProfit(logged[i])}), last);
  check('Mark PUSH → push, profit 0', r.result==='push' && r.profit===0, r);
  // results you set survive a reload (the ESPN grader leaves them alone)
  const before=await p.evaluate(()=>logged.map(x=>x.result||null)); await p.reload(); await p.waitForTimeout(2500);
  const after=await p.evaluate(()=>logged.map(x=>x.result||null));
  check('results kept after reload + auto-grade', JSON.stringify(before)===JSON.stringify(after), after);
  check('no page errors (desktop)', errs.length===0, errs);
  // phone: tabs pinned to the bottom of the screen, in view without scrolling
  const ph=await (await b.newContext(devices['iPhone 13'])).newPage(); const perr=[]; ph.on('pageerror',e=>perr.push(e.message)); await ph.route('**/*',route);
  await ph.goto('http://app.test/'); await ph.waitForTimeout(1000);
  const bar=await ph.$eval('.tabs',e=>{ const r=e.getBoundingClientRect(); return {pos:getComputedStyle(e).position, top:Math.round(r.top), bottom:Math.round(r.bottom), vh:innerHeight}; });
  check('phone: tab bar fixed at the bottom, in view', bar.pos==='fixed' && bar.bottom===bar.vh && bar.top>bar.vh-90, bar);
  await ph.click('.tab[data-view="v-log"]'); await ph.waitForTimeout(300);
  check('phone: tapping a tab switches view', await ph.$eval('#v-log',e=>e.offsetParent!==null), true);
  const vm=await ph.evaluate(()=>{ const e=document.getElementById('verM'), r=e.getBoundingClientRect(), d=document.querySelector('.head .date').getBoundingClientRect(); return {text:e.textContent, shown:e.offsetParent!==null&&r.width>0, inRow:r.top>=d.top-1&&r.bottom<=d.bottom+1, fits:r.right<=innerWidth}; });
  check('phone: the version shows next to the date', vm.shown && vm.text===(await ph.evaluate(()=>SCREENER_VERSION)) && vm.inRow && vm.fits, vm);
  check('no page errors (phone)', perr.length===0, perr);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
