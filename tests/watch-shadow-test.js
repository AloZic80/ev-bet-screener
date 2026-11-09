// node tests/watch-shadow-test.js — v4.44. Alonzo, passing on ChatGPT: "record every Watch bet as a shadow observation, without counting it as a wager,
// stake, profit or loss", "compare probability accuracy on the identical Watch sample (Brier, log loss), resample by game". One frozen record per Watch bet,
// graded like your bets, compared in Performance › Watch bets. Never a bet.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const NOW=Date.parse('2026-11-09T19:00:00Z'), iso=ms=>new Date(ms).toISOString(), DAY='2026-11-09', TIP=Date.parse('2026-11-10T02:30:00Z');
const T=(ha,abbr,loc,nick)=>({ha,id:abbr,abbr,name:loc+' '+nick,loc,nick,logo:'',rec:'',color:'333333',alt:'ffffff'});
const row=(id,name,team,price,fair,mkt)=>({name,team,game:team+' @ X'+id,matchup:team+' @ X'+id,side:'O',sport:'NHL',market:'1.5 Shots',kind:'prop',book:'Novig',offeredRaw:String(Math.round(-100*price/(1-price))),offeredProb:price,fairProb:fair,fairRaw:'',mktProb:mkt,stars:4,evModel:'projection',projValue:2.1,
  gameInfo:{state:'pre',startISO:iso(TIP),timeCT:'',detail:'',teams:[T('away',team,team,team),T('home','X'+id,'X'+id,'X'+id)]},src:'api:NHL:props',apiKey:id,loadedAt:iso(NOW-60e3)});
const ROWS=[row('lek','Jonathan Lekkerimaki','VAN',0.519,0.5546,0.526), row('mid','Will Cuylle','NYR',0.535,0.5546,0.526)];
// graded records for the comparison: game A (2 props), B, C, D
const O=(k,g,model,mkt,price,result)=>({k, at:iso(NOW-86400e3), ver:'v4.44', sport:'NHL', kind:'prop', name:k, market:'1.5 Shots', side:'O', game:g, date:'2026-11-08', start:'2026-11-08T23:00:00Z', book:'Novig', price, fee:0, model, mkt, blend:+(mkt+0.35*(model-mkt)).toFixed(4), net:0, actNet:0, result});
const SEED=[O('a1','A',0.60,0.52,0.52,'win'),O('a2','A',0.58,0.50,0.50,'loss'),O('b1','B',0.62,0.55,0.55,'win'),O('c1','C',0.57,0.53,0.53,'loss'),O('d1','D',0.59,0.51,0.51,'push'),O('e1','E',0.6,0.52,0.52,null)];
async function page(seed){
  const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:1280,height:900}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(([R,d,w])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig, Kalshi',bank:'500',cfgVer:3.03})); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows:R})); if(w) localStorage.setItem('mbev.watchObs',JSON.stringify(w)); }catch(e){} }, [ROWS,DAY,seed||null]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1300); return {b,p,errs};
}
(async()=>{
  // 1. recording
  let {b,p,errs}=await page(null);
  let W=await p.evaluate(()=>JSON.parse(localStorage.getItem('mbev.watchObs')||'[]'));
  check('the Watch bet (Cuylle at 53.5%) is saved once, with the shown price and the model, market and blend chances; the placed one is not', W.length===1 && W[0].name==='Will Cuylle' && W[0].price===0.535 && W[0].model===0.5546 && W[0].mkt===0.526 && Math.abs(W[0].blend-0.536)<0.0005 && W[0].result===null && /NHL\|will cuylle\|/.test(W[0].k) && /^v4\.(4[4-9]|[5-9]\d)$/.test(W[0].ver), W[0]);   // v4.45: the key also has the stat family, line and start
  await p.evaluate(()=>{ refresh(); refresh(); }); await p.waitForTimeout(200);
  W=await p.evaluate(()=>JSON.parse(localStorage.getItem('mbev.watchObs')||'[]'));
  check('redraws do not add copies (still 1)', W.length===1, W.length);
  check('it is not a bet: the Bet log is empty', await p.evaluate(()=>logged.length)===0, null);
  // 2. grading, with the same code as bets (ESPN stubbed here)
  const g=await p.evaluate(async()=>{ const A=watchAll(); A[0].start=new Date(Date.now()-8*3600e3).toISOString();
    window.findBetGame=async o=>({id:'ev1'}); window.gameStatusOf=ev=>({state:'post', eventId:'ev1', teams:[]}); window.fetchBoxscore=async()=>({}); window.gradeBet=(o,box)=>({won:true, push:false});
    const n=await watchGrade(); return {n, r:A[0].result, saved:JSON.parse(localStorage.getItem('mbev.watchObs'))[0].result}; });
  check('after the game it is graded (win here) and saved', g.n===1 && g.r==='win' && g.saved==='win', g);
  check('no page errors (1)', !errs.length, errs); await b.close();
  // 3. the comparison, checked by hand
  ({b,p,errs}=await page(SEED));
  const S=await p.evaluate(()=>watchStats());
  const G=SEED.filter(o=>o.result==='win'||o.result==='loss'), y=o=>o.result==='win'?1:0, br=(q,yy)=>(q-yy)**2, mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
  const bm=mean(G.map(o=>br(o.model,y(o)))), bk=mean(G.map(o=>br(o.mkt,y(o)))), bb=mean(G.map(o=>br(o.blend,y(o)))), roi=mean(G.map(o=>y(o)?1/o.price-1:-1));
  check('7 saved (6 seeded + the board\'s own Watch bet), 4 graded win or loss (1 push and 2 pending left out), 3 games', S.n===7 && S.graded===4 && S.pushes===1 && S.games===3, {n:S.n,g:S.graded,p:S.pushes,games:S.games});
  check('Brier scores match a hand calculation (model, market, blend)', Math.abs(S.brier.model-bm)<1e-9 && Math.abs(S.brier.market-bk)<1e-9 && Math.abs(S.brier.blend-bb)<1e-6, [S.brier, bm, bk, bb]);
  check('market − model Brier bet by bet (v4.45: dBet; d is now game by game) and the $1 ROI at the shown price match by hand', Math.abs(S.dBet-(bk-bm))<1e-9 && Math.abs(S.roi-roi)<1e-9, [S.d, bk-bm, S.roi, roi]);
  check('under 100 graded: "Descriptive only", and no 95% range under 20', /^Descriptive only/.test(S.stage) && S.ci===null, S.stage);
  await p.evaluate(()=>document.querySelector('.tab[data-view="v-perf"]').click()); await p.waitForTimeout(400);
  const txt=await p.evaluate(()=>document.getElementById('watchStudy').innerText.replace(/\s+/g,' '));
  check('Performance › Watch bets shows the counts, the stage, the three forecasts and the simulated ROI', /7 Watch bets · \d+ games · 4 graded win or loss in 3 games · 1 pushes left out/.test(txt) && /Descriptive only/.test(txt) && /Model .*Market .*Blend/.test(txt) && /\$1 bet each/.test(txt) && /All Watch bets, at the first price seen/.test(txt), txt.slice(0,300));
  // 4. the 95% range by game, with enough records
  const ci=await p.evaluate(()=>{ const A=[]; for(let i=0;i<60;i++){ const m=0.6, k=0.5, w=i%3!==0; A.push({k:'x'+i, sport:'NHL', game:'G'+(i%25), date:'2026-11-08', model:m, mkt:k, blend:k+0.35*(m-k), price:0.5, fee:0, result:w?'win':'loss'}); } return watchStats(A); });
  check('with 60 graded in 25 games: a 95% range around the mean difference, and the stage still descriptive', ci.ci && ci.ci[0]<=ci.d && ci.d<=ci.ci[1] && ci.graded===60, {d:ci.d, ci:ci.ci});
  check('no page errors (3)', !errs.length, errs); await b.close();
  console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail?1:0);
})();
