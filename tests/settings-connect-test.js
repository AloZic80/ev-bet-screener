// node tests/settings-connect-test.js — v4.38. Alonzo: "Build" (Augi's screens, step 5: Settings). Augi's Connect card: the Worker, whether a passphrase
// is saved, and Test connection (the Worker's free /src/status: no provider is called; 401 = wrong passphrase). His API credits page: each source's last
// reported allowance from what the app keeps, Refresh asks only free paths. His rules layout: every rule La Contadora uses in one card, live.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const NOW=Date.parse('2026-11-09T18:00:00Z'), DAY='2026-11-09';
const SOURCES=[{id:'bettingpros',name:'BettingPros',key:true,secret:'BP',free:'50/day',loads:true},{id:'oddsapi',name:'The Odds API',key:true,secret:'ODDS',free:'500/mo',loads:true,testable:true},{id:'sgo',name:'SportsGameOdds',key:false,secret:'SGO',free:'2,500 games/mo',loads:false,testable:true},{id:'sbapi',name:'Sportsbook API',key:true,secret:'SB',free:'150/day',loads:true}];
async function run(width){
  const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width,height:1000}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(([d,now])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear();
    localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig, Kalshi',bank:'1000',cfgVer:3.03}));
    localStorage.setItem('mbev.oaq',JSON.stringify({left:412,at:now-5*60e3})); localStorage.setItem('mbev.sbq',JSON.stringify({left:140,limit:150,day:d}));
    localStorage.setItem('mbev.lePinn',JSON.stringify({day:d,n:3})); localStorage.setItem('mbev.wk',JSON.stringify({d,n:1234,p:{'/live':900,'/mine/fills':200,'/budget':134},pause:0,why:''})); }catch(e){} }, [DAY,NOW]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); const calls=[];
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/api\.0xbeta\.dev/.test(u)){ const pth=new URL(u).pathname, h=r.request().headers(); if(r.request().method()!=='OPTIONS') calls.push(pth);
      if(h['x-screener-pass']!=='right') return r.fulfill({status:401,contentType:'application/json',body:'{"error":"locked"}'});
      if(pth==='/src/status') return r.fulfill({contentType:'application/json',body:JSON.stringify({sources:SOURCES})});
      if(pth==='/budget') return r.fulfill({contentType:'application/json',body:JSON.stringify({limit:50,used:12,window:'24h'})});
      if(pth==='/oddspapi/usage') return r.fulfill({contentType:'application/json',body:JSON.stringify({limit:250,left:200})});
      return r.fulfill({contentType:'application/json',body:'{}'}); }
    if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1000);
  await p.click('.tab[data-view="v-settings"]'); await p.waitForTimeout(300);
  return {b,p,errs,calls};
}
(async()=>{
  const {b,p,errs,calls}=await run(1280);
  check('Connect shows the Worker and "no passphrase yet"', (await p.textContent('#cnHost'))==='api.0xbeta.dev' && (await p.textContent('#cnPassChip'))==='no passphrase yet', [await p.textContent('#cnHost'), await p.textContent('#cnPassChip')]);
  await p.click('#cnTest'); await p.waitForTimeout(150);
  check('Test with no passphrase asks for it first', /Type the passphrase above and press Save first/.test(await p.textContent('#cnStatus')), await p.textContent('#cnStatus'));
  await p.fill('#screenerPass','wrong'); await p.click('#passSave'); await p.waitForTimeout(300);
  check('after Save the chip says "passphrase saved"', (await p.textContent('#cnPassChip'))==='passphrase saved', await p.textContent('#cnPassChip'));
  await p.click('#cnTest'); await p.waitForTimeout(300);
  check('a wrong passphrase: the Worker answered but it does not match', /does not match its SCREENER_PASS/.test(await p.textContent('#cnStatus')) && await p.getAttribute('#cnStatus','class')==='cn-status bad', await p.textContent('#cnStatus'));
  await p.fill('#screenerPass','right'); await p.click('#passSave'); await p.waitForTimeout(300); calls.length=0;
  await p.click('#cnTest'); await p.waitForTimeout(300);
  const st=await p.textContent('#cnStatus');
  check('the right one: connected, keys set and missing listed, no provider called', /^✓ Connected in \d+ ms\. Keys set: BettingPros, The Odds API, Sportsbook API\. No key yet: SportsGameOdds\. No provider was called\.$/.test(st), st);
  const PAID=['/props','/moneyline','/spread','/total','/src/test','/src/odds','/src/sbapi','/oddspapi/totals','/oddspapi/board','/pinnapi/live','/bp/sports','/bp/peek'];
  check('the test asked /src/status and nothing that costs a provider call (background fills and orders checks may run)', calls.includes('/src/status') && !calls.some(x=>PAID.includes(x)), calls);
  calls.length=0; await p.click('#crRefresh'); await p.waitForTimeout(400);
  check('Refresh asks the free paths (/budget, /src/status, /oddspapi/usage) and nothing paid', ['/budget','/src/status','/oddspapi/usage'].every(x=>calls.includes(x)) && !calls.some(x=>PAID.includes(x)), calls);
  const cards=await p.evaluate(()=>Object.fromEntries([...document.querySelectorAll('#crGrid .cr-card')].map(c=>[c.querySelector('h3').textContent, c.innerText.replace(/\s+/g,' ').trim()])));
  check('BettingPros: 38 left of 50 in any 24 hours, 12 used', /38 left of 50 calls in any 24 hours/.test(cards['BettingPros']) && /12 used/.test(cards['BettingPros']), cards['BettingPros']);
  check('The Odds API: 412 left, reported 5 min ago, key set', /412 left credits, reported 5 min ago key set/.test(cards['The Odds API']), cards['The Odds API']);
  check('Sportsbook API: 140 left of 150 today', /140 left of 150 today/.test(cards['Sportsbook API']), cards['Sportsbook API']);
  check('OddsPapi: 200 left of 250 this month', /200 left of 250 this month/.test(cards['OddsPapi']), cards['OddsPapi']);
  check('Pinnacle live: 37 of 40 Scan presses left today', /37 left of 40 Scan presses today/.test(cards['Pinnacle live (pinnapi)']), cards['Pinnacle live (pinnapi)']);
  check('SportsGameOdds: no key yet', /no key yet/.test(cards['SportsGameOdds']), cards['SportsGameOdds']);
  const wk=cards['Your Worker (Cloudflare)']||'', wn=+((wk.match(/([\d,]+) calls/)||[])[1]||'0').replace(/,/g,'');
  check('Your Worker: today\'s calls (1,234 and the ones this test made) and the busiest paths', wn>=1234 && wn<1260 && /\/live 9\d\d/.test(wk), wk);
  const rg=()=>p.evaluate(()=>Object.fromEntries([...document.querySelectorAll('#rgGrid .rg-t')].map(t=>[t.querySelector('span').textContent, t.querySelector('b').textContent+(t.querySelector('small')?' | '+t.querySelector('small').textContent:'')])));
  let R=await rg();
  check('rules at a glance: odds, EV floor, bankroll, Kelly, bets, daily max, fees', R['Odds']==='-300 to +500' && R['Net EV floor']==='1.5% | after fees' && R['Bankroll']==='$1000.00' && /^0\.25 \| × edge after a 0\.5 haircut$/.test(R['Kelly']) && R['Bets']==='$1.00 to $10.00' && R['Daily max']==='10% | $100.00 · the Hard stop asks past it' && R['Kalshi']==='7% of price | × (1 − price)' && R['Books you bet']==='2 books | novig, kalshi', R);
  await p.fill('#bank','500'); await p.waitForTimeout(150); R=await rg();
  check('it follows what you type: bankroll $500 → per game $10.00, daily max $50.00', R['Bankroll']==='$500.00' && R['Per game']==='2% | $10.00' && /^10% \| \$50\.00/.test(R['Daily max']), [R['Bankroll'],R['Per game'],R['Daily max']]);
  check('no page errors', !errs.length, errs);
  await b.close();
  const ph=await run(390);
  const fit=await ph.p.evaluate(()=>({sw:document.documentElement.scrollWidth, cw:document.documentElement.clientWidth, cr:document.getElementById('crGrid').getBoundingClientRect().right, rg:document.getElementById('rgGrid').getBoundingClientRect().right}));
  check('phone (390): Connect, credits and rules fit, no sideways scroll', fit.sw<=fit.cw && fit.cr<=390 && fit.rg<=390, fit);
  check('no page errors (phone)', !ph.errs.length, ph.errs);
  await ph.b.close();
  console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail?1:0);
})();
