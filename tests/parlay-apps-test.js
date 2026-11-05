// node tests/parlay-apps-test.js — Parlays for every app you play: tick the apps (pick'em: PrizePicks, Pick6, Underdog,
// Sleeper; combos: Kalshi, Novig, Polymarket US, DK and FD Predictions, Fliff, Bovada…). A combo pays the legs' odds
// multiplied (fee off each leg) and only uses legs that app offers. The Sentinels' size can be tapped (4 by default).
// A discounted pick gets its chance from the projection; a promo boost sets what all-hit pays.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const now=Date.now(), H=3600e3, iso=ms=>new Date(ms).toISOString(), day=new Date(now).toLocaleDateString('en-CA',{timeZone:'America/Chicago'});
const gi=(h,a,b)=>({state:'pre',startISO:iso(now+h*H),timeCT:'',detail:'',teams:[{ha:'away',abbr:a},{ha:'home',abbr:b}]});
const prop=(name,a,b,h,p,o)=>Object.assign({name,game:a+' @ '+b,matchup:a+' @ '+b,side:'O',sport:'NBA',market:'24.5 Points',kind:'prop',book:'PrizePicks',offeredRaw:'-110',offeredProb:.524,
  fairProb:p,fairRaw:'-150',mktProb:p,stars:3,evModel:'projection',projValue:27,gameInfo:gi(h,a,b),src:'api:NBA:props',apiKey:name},o||{});
const ml=(team,a,b,h,p,q)=>({name:team,team,game:a+' @ '+b,matchup:team+' vs ?',side:'',sport:'NBA',market:'Moneyline',kind:'moneyline',book:'Kalshi',offeredRaw:String(Math.round(-100*q/(1-q))),offeredProb:q,
  fairProb:p,fairRaw:'-150',mktProb:p,evModel:'market',gameInfo:gi(h,a,b),src:'api:sbapi:ev',apiKey:'k'+team});
const BOARD=[prop('Leg One','AAA','BBB',20,0.60),prop('Leg Two','CCC','DDD',21,0.59),prop('Leg Three','EEE','FFF',22,0.585),prop('Leg Four','GGG','HHH',23,0.57),prop('Leg Five','III','JJJ',24,0.565),
  ml('LAL','LAL','BOS',25,0.60,0.55), ml('NY','NY','MIA',26,0.58,0.52), ml('DEN','DEN','PHX',27,0.40,0.45), ml('UTAH','UTAH','SAC',28,0.15,0.10)];   // UTAH: a longshot with an edge
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago', viewport:{width:1400,height:1100}});
  await ctx.addInitScript(([rows,d])=>{ try{ if(sessionStorage.getItem('seeded')) return; sessionStorage.setItem('seeded','1'); localStorage.clear();
    localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows})); }catch(e){} }, [BOARD,day]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/espn\.com.*scoreboard/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1300);
  await p.click('.tab[data-view="v-parlay"]'); await p.waitForTimeout(500);
  const apps=await p.$$eval('#pkApp button',b=>b.map(x=>x.textContent));
  check('the apps you play show (pick’em and combos)', ['PrizePicks','Pick6','Underdog','Sleeper','Kalshi','Novig','Polymarket US','DK Predictions','FD Predicts','Fliff','Bovada'].every(a=>apps.includes(a)), apps);
  await p.evaluate(()=>document.querySelector('.pk-apps-box').open=true); await p.uncheck('.pk-app-on[value="Sleeper"]'); await p.waitForTimeout(200);
  check('untick an app and it is gone; tick it and it is back', !(await p.$$eval('#pkApp button',b=>b.map(x=>x.textContent))).includes('Sleeper'), true);
  await p.check('.pk-app-on[value="Sleeper"]'); await p.waitForTimeout(200);
  // the Sentinels' size: tap 2
  await p.evaluate(()=>{ pkSentAt=Date.now(); renderParlays(); });
  await p.click('#pkSent .pk-be-i[data-n="2"]'); await p.waitForTimeout(200);
  const s2=await p.evaluate(()=>({t:[...document.querySelectorAll('#pkSent .pk-card .pk-h b')].map(b=>b.textContent), why:(document.querySelector('#pkSent .pk-sent-why')||{}).textContent}));
  check('tap 2 picks in the Sentinels’ section and it shows the 2-pick entry', s2.t[0]==='The Sentinels’ 2 picks' && /You chose 2 picks/.test(s2.why), s2);
  await p.click('#pkSent .pk-be-i[data-n="4"]'); await p.waitForTimeout(200);
  // discount and boost on your entry (PrizePicks)
  for(const k of ['leg one|points','leg two|points','leg three|points','leg four|points']){ await p.check('.pk-pick[data-k="'+k+'"]'); await p.waitForTimeout(80); }
  const before=await p.evaluate(()=>window._pkCards.mine.e.ev);
  await p.fill('.pk-disc-line[data-k="leg four|points"]','22.5'); await p.dispatchEvent('.pk-disc-line[data-k="leg four|points"]','change'); await p.waitForTimeout(200);
  const disc=await p.evaluate(()=>({p:pkState.adj['leg four|points'].p, est:pkState.adj['leg four|points'].est, ev:window._pkCards.mine.e.ev, title:document.querySelector('#pkMine .pk-h b').textContent}));
  check('a discounted line (24.5 → 22.5) raises that pick’s chance, estimated from the projection, and the entry’s value', disc.p>0.57 && disc.est && disc.ev>before && /with your promos/.test(disc.title), {before, ...disc});
  await p.fill('.pk-boost','12'); await p.dispatchEvent('.pk-boost','change'); await p.waitForTimeout(200);
  const bo=await p.evaluate(()=>({all:window._pkCards.mine.e.arr[0], txt:document.querySelector('#pkMine .pk-h .meta').textContent}));
  check('a promo boost sets what all-hit pays (12x instead of 10x)', bo.all===12 && /12x/.test(bo.txt), bo);
  // ready-made slips: tap 3-Leg; players can repeat across slips, or not
  await p.click('.pk-slipn[data-n="3"]'); await p.waitForTimeout(300);
  const sl=()=>p.evaluate(()=>[...document.querySelectorAll('#pkSlips .pk-card')].map(c=>({t:c.querySelector('.pk-h b').textContent, legs:[...c.querySelectorAll('.pk-legs li')].map(li=>li.firstChild.textContent.split(' Over')[0].trim()), log:!!c.querySelector('.pk-log')})));
  let S1=await sl(); const all=S1.flatMap(x=>x.legs), rep=all.length!==new Set(all).size;
  check('3-Leg: several ready-made slips, 3 picks each, each one loggable, a player can repeat across slips', S1.length>=2 && S1.every(x=>x.legs.length===3 && x.log && new Set(x.legs).size===3) && rep && /^Slip 1 · 3-Leg/.test(S1[0].t), S1);
  await p.uncheck('#pkSlipRep'); await p.waitForTimeout(300);
  S1=await sl(); const all2=S1.flatMap(x=>x.legs);
  check('untick it and no player repeats across slips', S1.length>=1 && all2.length===new Set(all2).size, S1);
  await p.check('#pkSlipRep'); await p.click('.pk-slipn[data-n="4"]'); await p.waitForTimeout(200);
  // a Kalshi combo
  await p.click('#pkApp button[data-v="Kalshi"]'); await p.waitForTimeout(300);
  const k=await p.evaluate(()=>{ const c=window._pkCards.n2, f=cfgRead().fees; return c?{legs:c.legs.map(l=>l.name), mult:+c.e.arr[0].toFixed(4), want:+c.legs.reduce((x,l)=>x/(l.r.offeredProb*(1+feeRate('Kalshi',l.r.offeredProb,f))),1).toFixed(4), ev:c.e.ev}:null; });
  check('Kalshi combo: only Kalshi legs with an edge, paying their odds multiplied (fee off each)', k && k.legs.sort().join()==='LAL,NY' && k.mult===k.want && k.ev>0, k);
  const lg=await p.evaluate(()=>pkLegs(window._pkRows).map(l=>({n:l.name, ok:pkComboOk(l), where:pkWhere(l)})));
  check('no home runs: a 15% longshot with an edge is kept out (each pick at least 20%), and every leg says its game and why it is a good bet', lg.find(x=>x.n==='UTAH').ok===false && lg.find(x=>x.n==='LAL').ok && /LAL @ BOS/.test(lg.find(x=>x.n==='LAL').where) && /\+EV alone|good alone|outlier|small risk/.test(lg.find(x=>x.n==='LAL').where), lg);
  await p.click('.pk-slipn[data-n="2"]'); await p.waitForTimeout(300);
  const sl2=await p.evaluate(()=>[...document.querySelectorAll('#pkSlips .pk-card')].map(c=>({t:c.querySelector('.pk-h b').textContent, hit:c.innerText})));
  check('Kalshi slips: most likely to win first, with "about 1 in N"', sl2.length>=1 && /most likely to win/.test(sl2[0].t) && /about 1 in \d+/.test(sl2[0].hit), sl2);
  const n0=await p.evaluate(()=>logged.length); await p.click('#pkSlips .pk-log'); await p.waitForTimeout(250); await p.click('#pkSlips .pk-log',{force:true}).catch(()=>{}); await p.waitForTimeout(250);
  const lg2=await p.evaluate(n0=>({added:logged.length-n0, btn:document.querySelector('#pkSlips .pk-log').textContent, msg:(document.querySelector('#pkSlips .pk-logged-msg')||{}).textContent||''}),n0);
  check('Log this entry: saved once (a second press does nothing), and the slip itself says so with a link to the Bet log', lg2.added===1 && /Logged/.test(lg2.btn) && /Saved in the Bet log/.test(lg2.msg), lg2);
  check('combos hide the payout table and Power/Flex', await p.evaluate(()=>document.querySelector('.pk-pays-box').hidden && document.getElementById('pkPlay').hidden), true);
  check('no page errors', errs.length===0, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
