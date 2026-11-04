// Usage: node tests/towin-test.js [timezone] [clock ISO, e.g. 2026-11-03T02:30:00Z = save the bet during the game]   (reads ../index.html)
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright');
const fs=require('fs');
const html=fs.readFileSync(INDEX,'utf8');
const TZ=process.argv[2]||'UTC', CLOCK=process.argv[3]||null;
const ev={ id:'401900001', date:'2026-11-03T00:00Z', name:'Charlotte Hornets at Detroit Pistons', shortName:'CHA @ DET',
  status:{type:{state:'post',completed:true,name:'STATUS_FINAL',detail:'Final',shortDetail:'Final'}},
  competitions:[{ competitors:[
    {homeAway:'home',score:'112',winner:true,team:{abbreviation:'DET',shortDisplayName:'Pistons',name:'Pistons',location:'Detroit'}},
    {homeAway:'away',score:'104',winner:false,team:{abbreviation:'CHA',shortDisplayName:'Hornets',name:'Hornets',location:'Charlotte'}} ],
    status:{type:{state:'post',completed:true}} }] };
let pass=0, fail=0; const check=(name,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+name+'  → '+JSON.stringify(got)); };
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:TZ}); const p=await ctx.newPage();
  if(CLOCK) await p.clock.setSystemTime(new Date(CLOCK));
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*', r=>{ const u=r.request().url();
    if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/site\.api\.espn\.com.*\/basketball\/nba\/scoreboard/.test(u)){
      const m=u.match(/dates=(\d{8})/), day=m&&m[1];
      return r.fulfill({contentType:'application/json',body:JSON.stringify({events:(!day||day==='20261102')?[ev]:[]})}); }
    if(/espn\.com/.test(u) && /scoreboard/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'});
    return r.abort(); });   // BettingPros, Worker, CDNs, etc. blocked
  await p.goto('http://app.test/index.html'); await p.waitForTimeout(1000);
  await p.click('.tab[data-view="v-add"]'); await p.waitForTimeout(500);
  await p.selectOption('#abSport','NBA'); await p.waitForTimeout(1500);
  console.log('game options:', JSON.stringify(await p.$$eval('#abGame option',o=>o.map(x=>x.textContent))));
  async function addBet(stake, towin){
    await p.selectOption('#abGame','401900001');
    await p.selectOption('#abType','moneyline'); await p.waitForTimeout(200);
    await p.selectOption('#abTeam','DET');
    await p.waitForSelector('#abHost .editor',{timeout:5000});
    await p.selectOption('#abHost .eb-book','DraftKings');
    await p.selectOption('#abHost .eb-mode','odds');
    await p.fill('#abHost .eb-odds','');
    await p.fill('#abHost .eb-stake',stake);
    await p.fill('#abHost .eb-win-o',towin);
    await p.waitForTimeout(300);
    const n0=await p.evaluate(()=>logged.length);
    for(let i=0;i<3;i++){ if(await p.evaluate(()=>logged.length)>n0) break;
      await p.click('#abHost .eb-save'); await p.waitForTimeout(400); }
    await p.waitForTimeout(800);
  }
  await addBet('1.00','0.99');
  await addBet('10.00','9.95');
  const show=L=>L.map(x=>({date:x.date,dateSet:x.dateSet,start:x.start,game:x.game,team:x.team,kind:x.kind,odds:x.odds,stake:x.stake,towin:x.towin,fee:x.fee,result:x.result}));
  const L=await p.evaluate(()=>JSON.parse(localStorage.getItem('mbev.log')||'[]'));
  console.log('saved after Save bet:', JSON.stringify(show(L),null,1));
  check('two bets saved', L.length===2, L.length);
  check('bet 1 towin 0.99', L[0]&&L[0].towin===0.99, L[0]&&L[0].towin);
  check('bet 1 date 2026-11-02', L[0]&&L[0].date==='2026-11-02', L[0]&&L[0].date);
  check('bet 2 towin 9.95', L[1]&&L[1].towin===9.95, L[1]&&L[1].towin);
  check('bet 2 date 2026-11-02', L[1]&&L[1].date==='2026-11-02', L[1]&&L[1].date);
  const pre=await p.evaluate(()=>logged.map(x=>({result:x.result, profit:betProfit(x), ifWin:betProfit(Object.assign({},x,{result:'win'}))})));
  console.log('right after save:', JSON.stringify(pre));
  check('bet 1 profit-if-win 0.99', pre[0].ifWin===0.99, pre[0].ifWin);
  check('bet 2 profit-if-win 9.95', pre[1].ifWin===9.95, pre[1].ifWin);
  // grading: autoGradeLog runs on page load (and on the ⟳ buttons), not on save
  await p.reload(); await p.waitForTimeout(3000);
  const post=await p.evaluate(()=>logged.map(x=>({result:x.result, why:x.why, profit:betProfit(x)})));
  console.log('after reload (autoGradeLog):', JSON.stringify(post));
  check('bet 1 graded win', post[0].result==='win', post[0].result);
  check('bet 2 graded win', post[1].result==='win', post[1].result);
  check('bet 1 settled profit 0.99', post[0].profit===0.99, post[0].profit);
  check('bet 2 settled profit 9.95', post[1].profit===9.95, post[1].profit);
  const rows=await p.$$eval('#logBody tr', t=>t.map(e=>e.innerText.replace(/\s+/g,' ').slice(0,140)));
  console.log('log rows:', JSON.stringify(rows,null,1));
  console.log('page errors:', errs);
  console.log(`\n${pass} passed, ${fail} failed (TZ ${TZ}, clock ${CLOCK||'real'})`);
  await b.close(); process.exit(fail?1:0);
})();
