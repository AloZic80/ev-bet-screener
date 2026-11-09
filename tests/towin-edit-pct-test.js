// Usage: node tests/towin-edit-pct-test.js [index.html path]   — % mode To win + editing a saved bet's To win
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright');
const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
const ev={ id:'401900001', date:'2026-11-03T00:00Z', shortName:'CHA @ DET',
  status:{type:{state:'post',completed:true,name:'STATUS_FINAL',detail:'Final',shortDetail:'Final'}},
  competitions:[{ competitors:[
    {homeAway:'home',score:'112',winner:true,team:{abbreviation:'DET',shortDisplayName:'Pistons',name:'Pistons',location:'Detroit'}},
    {homeAway:'away',score:'104',winner:false,team:{abbreviation:'CHA',shortDisplayName:'Hornets',name:'Hornets',location:'Charlotte'}} ] }] };
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
(async()=>{
  const b=await chromium.launch(); const p=await (await b.newContext({timezoneId:'UTC'})).newPage();
  await p.clock.setSystemTime(new Date('2026-11-03T02:30:00Z'));
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*', r=>{ const u=r.request().url();
    if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/site\.api\.espn\.com.*\/basketball\/nba\/scoreboard/.test(u)){ const m=u.match(/dates=(\d{8})/), d=m&&m[1];
      return r.fulfill({contentType:'application/json',body:JSON.stringify({events:(!d||d==='20261102')?[ev]:[]})}); }
    if(/espn\.com/.test(u)&&/scoreboard/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'});
    return r.abort(); });
  await p.goto('http://app.test/index.html'); await p.waitForTimeout(1000);
  await p.evaluate(()=>document.querySelector('.tab[data-view="v-add"]').click())   /* v4.29: under its main tab now */; await p.waitForTimeout(500);
  await p.selectOption('#abSport','NBA'); await p.waitForTimeout(1500);
  async function setup(book, mode){
    await p.selectOption('#abGame','401900001'); await p.selectOption('#abType','moneyline'); await p.waitForTimeout(200);
    await p.selectOption('#abTeam','DET'); await p.waitForSelector('#abHost .editor');
    await p.selectOption('#abHost .eb-book',book); await p.selectOption('#abHost .eb-mode',mode); }
  async function save(){ const n0=await p.evaluate(()=>logged.length);
    for(let i=0;i<3;i++){ if(await p.evaluate(()=>logged.length)>n0) break; await p.click('#abHost .eb-save'); await p.waitForTimeout(400); }
    await p.waitForTimeout(800); }
  const st=i=>p.evaluate(i=>{ const x=logged[i]; return {odds:x.odds, stake:x.stake, fee:x.fee, towin:x.towin, book:x.book, ifWin:betProfit(Object.assign({},x,{result:'win'}))}; }, i);
  // --- % mode: Cost + To win (total payout), @ % left blank
  for(const [cost,win,exp] of [['10.00','15.50',5.5],['7.00','12.40',5.4],['2.50','1.43',1.43]]){   // last one: To win below cost = profit
    await setup('Polymarket','pct');
    await p.fill('#abHost .eb-pct',''); await p.fill('#abHost .eb-cost',cost); await p.fill('#abHost .eb-win',win); await p.waitForTimeout(300);
    await save(); const i=await p.evaluate(()=>logged.length-1), s=await st(i);
    console.log('% mode cost',cost,'to win',win,'saved:',JSON.stringify(s));
    check(`% mode ${cost}/${win}: towin ${exp}`, s.towin===exp, s.towin);
    check(`% mode ${cost}/${win}: profit-if-win ${exp}`, s.ifWin===exp, s.ifWin);
  }
  // --- odds-mode bet to edit: $1 to win $0.99
  await setup('DraftKings','odds'); await p.fill('#abHost .eb-odds',''); await p.fill('#abHost .eb-stake','1.00'); await p.fill('#abHost .eb-win-o','0.99'); await p.waitForTimeout(300); await save();
  const E=await p.evaluate(()=>logged.length-1);
  check('edit base: towin 0.99', (await st(E)).towin===0.99, (await st(E)).towin);
  async function edit(fn){ await p.evaluate(i=>{ document.querySelector('#logBody button.kill.edit[data-i="'+i+'"]').click(); }, E);
    await p.waitForTimeout(300); await fn(); await p.evaluate(()=>document.querySelector('#logBody tr.editor .eb-save').click()); await p.waitForTimeout(500); }
  const q=s=>'#logBody tr.editor '+s; await p.click('.tab[data-view="v-log"]'); await p.waitForTimeout(400);
  await edit(async()=>{ await p.selectOption(q('.eb-book'),'FanDuel'); });
  let s=await st(E); console.log('edit book only:',JSON.stringify(s)); check('edit book only: towin kept 0.99', s.towin===0.99 && s.book==='FanDuel', s);
  await edit(async()=>{ await p.fill(q('.eb-stake'),'2.00'); });
  s=await st(E); console.log('edit stake 2, To win blank:',JSON.stringify(s)); check('edit stake only: stale towin dropped, profit from odds', s.towin===undefined && s.ifWin===1.98, s);
  await edit(async()=>{ await p.fill(q('.eb-stake'),'2.00'); await p.fill(q('.eb-win-o'),'1.95'); });
  s=await st(E); console.log('edit To win 1.95:',JSON.stringify(s)); check('edit with To win 1.95: saved, profit 1.95', s.towin===1.95 && s.ifWin===1.95, s);
  console.log('page errors:',errs); if(errs.length) fail++;
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
