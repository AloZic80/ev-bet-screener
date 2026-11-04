// node tests/parlay-test.js — the Parlays tab: the math checked against independent brute force, then the tab on a sample board.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
// ---- independent math (no code shared with the app)
const brute=(ps,arr)=>{ const n=ps.length; let ev=0, total=0; for(let m=0;m<(1<<n);m++){ let pr=1,k=0; for(let i=0;i<n;i++){ if(m>>i&1){ pr*=ps[i]; k++; } else pr*=1-ps[i]; } total+=pr; const i=n-k; ev+=pr*(arr[i]!=null?arr[i]:0); } return {ev:ev-1,total}; };
const growthBest=(ps,arr)=>{ const n=ps.length, outs=[]; for(let m=0;m<(1<<n);m++){ let pr=1,k=0; for(let i=0;i<n;i++){ if(m>>i&1){ pr*=ps[i]; k++; } else pr*=1-ps[i]; } outs.push([pr, arr[n-k]!=null?arr[n-k]:0]); }
  let best=0, bestG=0; for(let f=0; f<0.999; f+=0.0001){ const g=outs.reduce((s,[p,mm])=>s+p*Math.log(1+f*(mm-1)),0); if(g>bestG){ bestG=g; best=f; } } return best; };
const POWER={2:[3],3:[5],4:[10],5:[20],6:[37.5]}, FLEX={3:[2.25,1.25],4:[5,1.5],5:[10,2,0.4],6:[25,2,0.4]};
// ---- sample board: 7 good legs in 6 games (two share BUF @ MIA), one player at both PrizePicks and DraftKings, a started game, a weak pick
const soon=h=>new Date(Date.now()+h*3600e3).toISOString();
const gi=(h,state)=>({state:state||'pre', startISO:soon(h), timeCT:'', detail:'', teams:[]});
const leg=(name,game,market,book,mkt,fair,h,state,side)=>({name,game,matchup:game,side:side||'O',sport:'NFL',market,kind:'prop',book,offeredRaw:'-119',offeredProb:0.5434,fairProb:fair,fairRaw:'-130',mktProb:mkt,stars:3,evModel:'projection',gameInfo:gi(h,state),src:'api:NFL:props',apiKey:name+book});
const ROWS=[ leg('Josh Allen','BUF @ MIA','245.5 Passing Yards','PrizePicks',.58,.62,5), leg('Stefon Diggs','HOU @ IND','5.5 Receptions','PrizePicks',.60,.66,6),
  leg('Bijan Robinson','ATL @ NO','74.5 Rushing Yards','PrizePicks',.57,.60,7), leg('Puka Nacua','LAR @ SEA','68.5 Receiving Yards','PrizePicks',.56,.63,8),
  leg('Tyreek Hill','BUF @ MIA','71.5 Receiving Yards','PrizePicks',.59,.64,5), leg('CeeDee Lamb','DAL @ PHI','6.5 Receptions','PrizePicks',.55,.57,9),
  leg('Lamar Jackson','BAL @ CIN','55.5 Rushing Yards','PrizePicks',.545,.55,10), leg('Puka Nacua','LAR @ SEA','70.5 Receiving Yards','DraftKings',.62,.66,8),
  leg('Started Guy','KC @ DEN','50.5 Receiving Yards','PrizePicks',.65,.70,-1,'in'), leg('Low Guy','NYJ @ NE','40.5 Rushing Yards','PrizePicks',.50,.51,11) ];
const blend=(r,w)=>r.mktProb+w*(r.fairProb-r.mktProb);
(async()=>{ const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:1440,height:1000}});
  await ctx.addInitScript(rows=>{ try{ if(sessionStorage.getItem('seeded')) return; sessionStorage.setItem('seeded','1'); localStorage.clear();
    const day=new Date().toLocaleDateString('en-CA',{timeZone:'America/Chicago'}); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:day,rows})); }catch(e){} }, ROWS);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/espn\.com.*scoreboard/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort();});
  await p.goto('http://app.test/'); await p.waitForTimeout(1500);
  // --- math against brute force
  const close=(a,b,t)=>Math.abs(a-b)<=(t||1e-9);
  const be=await p.evaluate(()=>[2,3,4,5,6].map(n=>pkBreakEven(n,{2:[3],3:[5],4:[10],5:[20],6:[37.5]}[n])));
  const closed=[2,3,4,5,6].map(n=>Math.pow(POWER[n][0],-1/n));
  check('Power break-evens equal the closed form p = payout^(-1/n)', be.every((x,i)=>close(x,closed[i],1e-7)), be.map(x=>+(x*100).toFixed(2)));
  const fbe=await p.evaluate(()=>[3,4,5,6].map(n=>{ const arr={3:[2.25,1.25],4:[5,1.5],5:[10,2,0.4],6:[25,2,0.4]}[n], b=pkBreakEven(n,arr); return [b, pkEV(new Array(n).fill(b),arr)]; }));
  check('Flex break-evens: the entry is worth exactly 0 there', fbe.every(([b0,ev])=>Math.abs(ev)<1e-7), fbe.map(([b0])=>+(b0*100).toFixed(2)));
  let rnd=1; const R=()=>{ rnd=(rnd*16807)%2147483647; return rnd/2147483647; };
  const cases=[]; for(let t=0;t<40;t++){ const n=2+(t%5), ps=Array.from({length:n},()=>0.35+R()*0.4), flex=!!(t%2)&&n>=3; cases.push({ps,arr:(flex?FLEX:POWER)[n]}); }
  const got=await p.evaluate(cs=>cs.map(c=>({ev:pkEV(c.ps,c.arr), tot:pkDist(c.ps).reduce((a,b)=>a+b,0), k:pkKelly(c.ps,c.arr)})), cases);
  check('40 random entries: chances of 0..n hits add up to 1', got.every(g=>close(g.tot,1,1e-12)), got.length);
  check('40 random entries: value equals brute force over all 2^n outcomes', got.every((g,i)=>close(g.ev,brute(cases[i].ps,cases[i].arr).ev,1e-12)), got.length);
  const kg=got.map((g,i)=>[g.k, growthBest(cases[i].ps,cases[i].arr), g.ev]);
  check('Kelly stake share matches a 0.0001-step search of log growth', kg.every(([k,g])=>Math.abs(k-g)<0.0003), kg.filter(x=>x[2]>0).slice(0,4).map(([k,g])=>[+k.toFixed(4),+g.toFixed(4)]));
  check('Kelly is 0 whenever the entry is worth less than it costs', kg.every(([k,,ev])=>ev>0 || k===0), kg.filter(x=>x[2]<=0).length+' losing entries');
  const kb=await p.evaluate(()=>{ const ps=[.62,.6,.61,.59], P=ps.reduce((a,b)=>a*b,1); return [pkKelly(ps,[10]), (P*10-1)/9]; });
  check('Power Kelly equals the textbook (p·payout − 1)/(payout − 1)', close(kb[0],kb[1],2e-4), kb.map(x=>+x.toFixed(5)));
  // --- the tab on the sample board
  const w=await p.evaluate(()=>cfgRead().mWeight), cfg=await p.evaluate(()=>{ const c=cfgRead(); return {bank:c.bank,kelly:c.kelly,shrink:c.shrink,sMin:c.sMin,sMax:c.sMax}; });
  const P=Object.fromEntries(ROWS.filter(r=>r.book==='PrizePicks').map(r=>[r.name,blend(r,w)]));
  check('board: PrizePicks rows are skipped as singles and point to Parlays', await p.evaluate(()=>lastRows.filter(r=>/prizepicks/i.test(r.book)).every(r=>(r.flags||[]).some(f=>f[0]==='out'&&/see Parlays/.test(f[1])))), true);
  check('tab badge: 7 picks at 54% or better (started game left out, Puka once)', (await p.textContent('#pkTabN'))==='7', await p.textContent('#pkTabN'));
  await p.click('.tab[data-view="v-parlay"]'); await p.waitForTimeout(500);
  const pool=await p.$$eval('#pkPool tr',t=>t.map(r=>[...r.cells].slice(1,5).map(c=>c.innerText.trim())));
  check('pool: 8 picks, no started game, best first', pool.length===8 && !pool.some(r=>/Started/.test(r[0])) && pool[0][0].startsWith('Stefon Diggs'), pool.map(r=>r[0]+' '+r[2]));
  const puka=pool.find(r=>/Puka/.test(r[0]));
  const why=await p.$$eval('#pkPool tr',t=>t.map(r=>r.cells[5]&&r.cells[5].innerText.trim()));
  check('pool reason for PrizePicks rows reads as a pick’em line, not "see Parlays"', why.slice(0,3).every(w=>w==='PrizePicks pick’em line'), why.slice(0,3));
  check('PrizePicks picked over DraftKings for the same player and stat (its own line)', puka && /68\.5/.test(puka[1]) && /PrizePicks/.test(puka[3]), puka);
  const cards=await p.$$eval('#pkCards .pk-card',cs=>cs.map(c=>({t:c.querySelector('.pk-h b').textContent, ev:(c.querySelector('.pk-ev')||{}).textContent||'', legs:[...c.querySelectorAll('.pk-legs li')].map(l=>l.firstChild.firstChild.textContent.trim()), h:c.querySelector('.pk-h').innerText, stake:(c.querySelector('.pk-stake')||{}).value, best:c.classList.contains('best')})));
  const order=['Stefon Diggs','Tyreek Hill','Puka Nacua','Bijan Robinson','CeeDee Lamb','Lamar Jackson'];
  check('best entries: top picks, one per game (Josh Allen shares Tyreek Hill’s game)', [2,3,4,5,6].every((n,i)=>JSON.stringify(cards[i].legs)===JSON.stringify(order.slice(0,n))), cards.map(c=>c.legs.length));
  const exp4=brute(order.slice(0,4).map(n=>P[n]),[10]).ev;
  check('payout labels read right (10x, 20x, 37.5x)', /pays 10x/.test(cards[2].h) && /pays 20x/.test(cards[3].h) && /pays 37\.5x/.test(cards[4].h), cards.map(c=>c.h.split('\n')[1]));
  check('4-pick Power value matches brute force', cards[2].ev.startsWith((exp4>0?'+':'−')+(Math.abs(exp4)*100).toFixed(1)+'%'), [cards[2].ev, +(exp4*100).toFixed(2)]);
  const be4=Math.pow(10,-1/4), adj=order.slice(0,4).map(n=>be4+(1-cfg.shrink)*(P[n]-be4)), f4=growthBest(adj,[10]);
  const st4=Math.min(cfg.sMax,Math.max(cfg.sMin,cfg.kelly*f4*cfg.bank));
  check('4-pick suggested stake = Kelly fraction × haircut Kelly × bankroll, within smallest/largest bet', Math.abs(parseFloat(cards[2].stake)-st4)<0.02, [cards[2].stake, +st4.toFixed(2)]);
  // best = most bankroll growth at the suggested stake, on haircut chances (independent computation)
  const grow=cards.map((c,i)=>{ const n=i+2, arr=POWER[n], bn=Math.pow(arr[0],-1/n), ps=order.slice(0,n).map(x=>bn+(1-cfg.shrink)*(P[x]-bn)), fr=parseFloat(c.stake)/cfg.bank;
    let g=0; for(let m=0;m<(1<<n);m++){ let pr=1,k=0; for(let j=0;j<n;j++){ if(m>>j&1){ pr*=ps[j]; k++; } else pr*=1-ps[j]; } g+=pr*Math.log(1+fr*((k===n?arr[0]:0)-1)); } return g; });
  const bi=grow.indexOf(Math.max(...grow));
  check('"Best for your bankroll" goes to the entry that grows the bankroll most at its stake', cards[bi].best && cards.filter(c=>c.best).length===1, {highlighted:cards.findIndex(c=>c.best)+2, growthPerEntry:grow.map(x=>+(x*1e4).toFixed(2))});
  // your entry
  for(const n of ['Stefon Diggs','Puka Nacua','Lamar Jackson']) await p.click('#pkPool tr:has-text("'+n+'") input.pk-pick');
  await p.waitForTimeout(300);
  const mine=await p.$eval('#pkMine',e=>({t:(e.querySelector('.pk-h b')||{}).textContent, ev:(e.querySelector('.pk-ev')||{}).textContent}));
  const expM=brute(['Stefon Diggs','Puka Nacua','Lamar Jackson'].map(n=>P[n]),[5]).ev;
  check('your entry: 3 ticked picks priced at 5x', mine.t==='Your 3 picks' && mine.ev.startsWith((expM>0?'+':'−')+(Math.abs(expM)*100).toFixed(1)+'%'), [mine, +(expM*100).toFixed(2)]);
  // log the 4-pick entry
  const n0=await p.evaluate(()=>logged.length);
  await p.click('#pkCards .pk-card:nth-child(3) .pk-log'); await p.waitForTimeout(300);
  const L=await p.evaluate(()=>logged[logged.length-1]);
  check('Log this entry: a 4-pick PrizePicks parlay in the Bet log, pays 10× the stake', (await p.evaluate(()=>logged.length))===n0+1 && L.kind==='parlay' && L.book==='PrizePicks' && L.parlay.picks===4 && Math.abs(L.parlay.pays.all-L.stake*10)<0.01 && L.odds==='+900' && L.parlay.pk.legs.length===4, {book:L.book,picks:L.parlay.picks,stake:L.stake,pays:L.parlay.pays,odds:L.odds});
  // Flex
  await p.click('#pkPlay button[data-v="flex"]'); await p.waitForTimeout(300);
  const f5=await p.$eval('#pkCards .pk-card:nth-child(3)',c=>({h:c.querySelector('.pk-h').innerText, ev:(c.querySelector('.pk-ev')||{}).textContent||''}));
  const expF=brute(order.slice(0,5).map(n=>P[n]),[10,2,0.4]).ev;
  check('Flex 5 picks: pays 10x / 2x / 0.4x and the value matches brute force', /pays 10x, 2x with one miss, 0\.4x with two/.test(f5.h) && f5.ev.startsWith((expF>0?'+':'−')+(Math.abs(expF)*100).toFixed(1)+'%'), [f5, +(expF*100).toFixed(2)]);
  // edit a payout, then reset
  await p.click('#pkPlay button[data-v="power"]'); await p.evaluate(()=>document.querySelector('.pk-pays-box').open=true); await p.waitForTimeout(200);
  await p.fill('.pk-pay-in[data-n="4"][data-i="0"]','12'); await p.dispatchEvent('.pk-pay-in[data-n="4"][data-i="0"]','change'); await p.waitForTimeout(300);
  const ev12=await p.$eval('#pkCards .pk-card:nth-child(3) .pk-ev',e=>e.textContent), exp12=brute(order.slice(0,4).map(n=>P[n]),[12]).ev;
  const saved=await p.evaluate(()=>JSON.parse(localStorage.getItem('mbev.pk')).pays.PrizePicks.power[4]);
  check('editing a payout reprices the entry and is saved on this device', ev12.startsWith('+'+(exp12*100).toFixed(1)+'%') && saved[0]===12, [ev12, saved]);
  await p.click('#pkPayReset'); await p.waitForTimeout(300);
  check('reset puts PrizePicks payouts back', await p.$eval('.pk-pay-in[data-n="4"][data-i="0"]',e=>e.value)==='10', await p.$eval('.pk-pay-in[data-n="4"][data-i="0"]',e=>e.value));
  // DraftKings Pick6
  await p.click('#pkApp button[data-v="DraftKings Pick 6"]'); await p.waitForTimeout(300);
  const pk6=await p.evaluate(()=>({flexHidden:document.querySelector('#pkPlay button[data-v="flex"]').hidden, note:document.getElementById('pkNote').textContent, puka:[...document.querySelectorAll('#pkPool tr')].map(r=>r.innerText).find(t=>/Puka/.test(t))}));
  check('Pick6: no Flex, a note to check lines, DraftKings line preferred', pk6.flexHidden && /Pick6/.test(pk6.note) && /70\.5/.test(pk6.puka||''), pk6);
  check('no page errors', errs.length===0, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
