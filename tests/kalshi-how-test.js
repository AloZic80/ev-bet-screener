// node tests/kalshi-how-test.js — v4.09. Alonzo's Miami (OH) RedHawks moneyline on Kalshi (−108 = 51.9%, fair 55.1%, BET $1.62, OK up to
// 52.5%): he typed 1.62 in Kalshi's Shares box and bought $0.88. The card now says what to type, in Kalshi's words: the button, Shares
// (= stake ÷ (limit + fee)), Limit price (La Contadora's most, whole cents, rounded down), and what Cost and Max payout should read.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const NOW=Date.parse('2026-11-07T18:00:00Z'), H=3600e3, iso=ms=>new Date(ms).toISOString(), DAY='2026-11-07';
const team=(ha,abbr)=>({ha,id:abbr,abbr,name:abbr,loc:abbr,nick:abbr,logo:'',rec:'',color:'333333',alt:'ffffff'});
const row=(o)=>Object.assign({name:'Miami (OH) RedHawks',team:'M-OH',game:'OHIO @ M-OH',matchup:'M-OH vs OHIO',side:'',sport:'NCAAF',market:'Moneyline',kind:'moneyline',book:'Kalshi',offeredRaw:'-108',offeredProb:0.519,fairProb:0.551,fairRaw:'',mktProb:0.551,stars:null,evModel:'market',
  gameInfo:{state:'pre',startISO:iso(NOW+5*H),timeCT:'',detail:'',teams:[team('away','OHIO'),team('home','M-OH')]},src:'api:oddsapi:NCAAF',apiKey:'k1'},o||{});
const ROWS=[row(), row({name:'Jaylen Brown',team:'BOS',game:'LAL @ BOS',matchup:'LAL @ BOS',sport:'NBA',kind:'prop',market:'24.5 Points',side:'U',apiKey:'k2'})];
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:1400,height:1000}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(([rows,d])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows})); }catch(e){} }, [ROWS,DAY]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1500);
  await p.evaluate(()=>setMode('volado')); await p.waitForTimeout(300);   /* v4.76: both sample bets (model = market = 55.1%) are 🪙 Volado bets (50 to 60%), not in the opening tab, 💪 Machín: the M-OH card and its I bet this are read there */
  const R=await p.evaluate(()=>{ const r=lastRows.find(x=>x.kind==='moneyline'), cfg=cfgRead(), mx=maxPriceFor(r.fairProb,r.book,cfg.eMin), k=kalshiHow(r,+r.stake,r.offeredProb,mx);
    // v4.21: the card is short now: one line says what to type; the four steps, explained, open in Why this play?
    const el=[...document.querySelectorAll('#placeCards .pcard')].find(x=>/M-OH/.test(x.textContent) && /On Kalshi/i.test(x.textContent));
    const short=el?el.innerText.replace(/\s+/g,' '):'';
    if(el){ const d=el.querySelector('details.sc-why'); if(d) d.open=true; }
    const card=el?el.innerText.replace(/\s+/g,' '):'';
    return {stake:+r.stake, mx, k, card, short, fee:feeRate('Kalshi',(k?k.lim:0)/100,cfg.fees)}; });
  const k=R.k, per=k?(k.lim/100)*(1+R.fee):0;
  check('the limit is La Contadora\'s most in whole cents, rounded down (OK up to '+(R.mx*100).toFixed(1)+'% → '+(k&&k.lim)+'¢)', k && k.lim===Math.floor(R.mx*100+1e-9) && k.lim/100<=R.mx, {lim:k&&k.lim, mx:R.mx});
  check('shares = the stake ÷ (limit + Kalshi\'s fee), so Cost comes out at the stake, not half of it', k && Math.abs(k.cost-R.stake)<=0.02 && Math.abs(k.shares-Math.floor(R.stake/per*100)/100)<1e-9 && k.shares>R.stake*1.7, {stake:R.stake, shares:k&&k.shares, cost:k&&k.cost});
  check('v4.21: the short card says what to type in one line: On Kalshi · YES · Shares N · Limit N¢ · Cost ≈ $ (the stake)', new RegExp('On Kalshi YES Shares '+k.shares.toFixed(2)+' Limit '+k.lim+'¢ Cost ≈ \\$'+k.cost.toFixed(2),'i').test(R.short) && !/On Kalshi, enter/i.test(R.short), R.short.slice(0,400));
  check('Why this play? opened: On Kalshi, enter · Press YES · (the team) wins · Shares N (not the cost) · Limit price N¢ · Cost about $ · Max payout $', /On Kalshi, enter/i.test(R.card) && /1 · Press YES M-OH wins/.test(R.card) && new RegExp('2 · Shares '+k.shares.toFixed(2)+' not '+R.stake.toFixed(2)).test(R.card) && new RegExp('3 · Limit price '+k.lim+'¢').test(R.card) && /Max payout \$/.test(R.card), R.card.slice(0,400));
  const U=await p.evaluate(()=>{ const r=lastRows.find(x=>x.name==='Jaylen Brown'); const mx=maxPriceFor(r.fairProb,r.book,cfgRead().eMin); return kalshiHow(r,+r.stake||2,r.offeredProb,mx); });
  check('an Under is NO on the Over', U && U.btn==='NO' && /Over 24\.5 Points/.test(U.what), U);
  // I bet this → the form uses Kalshi's words
  await p.evaluate(()=>{ const t=[...document.querySelectorAll('#placeCards .pcard')].find(x=>/M-OH/.test(x.textContent) && /wins/.test(x.textContent)); (t.querySelector('.bet-btn')||t.querySelector('button')).click(); }); await p.waitForTimeout(400);
  const L=await p.evaluate(()=>({pct:(document.querySelector('.editor .eb-pct-l')||{}).textContent, unit:(document.querySelector('.editor .eb-pct-u')||{}).textContent, win:(document.querySelector('.editor .eb-win-l')||{}).textContent}));
  check('I bet this on Kalshi: the form says Price ¢ and Max payout $ (Kalshi\'s words)', L.pct==='Price' && L.unit==='¢' && L.win==='Max payout $', L);
  check('no page errors', !errs.length, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
