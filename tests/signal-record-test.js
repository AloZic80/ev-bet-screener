// node tests/signal-record-test.js — v4.52. Owner, 11/10, showing OddsJam's Momentum ad: "this is what the sentinels do or want them to do ... make sure
// it is doing the same" → the ⚡ signal: the market's own move (how big, how long ago) and a book that has not followed, on the card, in the score and the
// sort. And from ChatGPT's review he pasted: Perfecta against the other best bets as a DIFFERENCE with a game-clustered bootstrap range, stages by bets and
// games, the sport / market mix; every Just-missed Watch bet as a shadow record next to the ones he chose.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,700)); };
const NOW=Date.parse('2026-11-10T19:00:00Z'), iso=ms=>new Date(ms).toISOString(), DAY='2026-11-10', KO=Date.parse('2026-11-11T01:15:00Z');
const T=(ha,abbr,loc,nick)=>({ha,id:abbr,abbr,name:loc+' '+nick,loc,nick,logo:'',rec:'',color:'333333',alt:'ffffff'});
const G1={state:'pre',startISO:iso(KO),eventId:'401001',timeCT:'',detail:'',teams:[T('away','SEA','Seattle','Kraken'),T('home','CGY','Calgary','Flames')]};
const am=p=>p>=0.5?String(Math.round(-100*p/(1-p))):'+'+Math.round(100*(1-p)/p);
const prop=(id,name,market,price,fair,mkt)=>({name,team:'CGY',game:'SEA @ CGY',matchup:'SEA @ CGY',side:'U',sport:'NHL',market,kind:'prop',book:'Novig',offeredRaw:am(price),offeredProb:price,fairProb:fair,fairRaw:am(fair),mktProb:mkt,stars:4,evModel:'projection',projValue:1,gameInfo:G1,src:'api:NHL:props',apiKey:id,loadedAt:iso(NOW-60e3)});
// three plays with the same numbers now (price 44.4%, model 50%, market 50%): only their history differs
const ROWS=[prop('frost','Morgan Frost','1.5 Shots',0.444,0.50,0.50), prop('back','Mikael Backlund','2.5 Shots',0.444,0.50,0.50), prop('grid','Matvei Gridin','3.5 Shots',0.444,0.50,0.50)];
const ring=(n)=>({n,of:6,miss:[]});
const B=(id,game,odds,res,rg,extra)=>Object.assign({id,key:id,name:'P '+id,sport:'NFL',kind:'prop',market:'1.5 Receptions',side:'O',book:'Bovada',game,odds,offeredRaw:odds,stake:10,fee:0,date:'2026-11-08',dateSet:true,start:'2026-11-08T23:00:00Z',result:res,gradedBy:'manual',closing:'',snap:{at:iso(NOW-2*86400e3),said:{decision:'BET',onList:true},ring:ring(rg)}},extra||{});
// Perfectas: 6 bets in 3 games, 4 won at +100 → +$40 − $20 = +$20 on $60 (+33.3%). Others: 6 bets in 3 games, 2 won → +$20 − $40 = −$20 on $60 (−33.3%). Difference +66.7 pts.
const LOG=[B('a1','BUF @ MIA','+100','win',6,{closing:'-110'}),B('a2','BUF @ MIA','+100','win',6,{closing:'-105'}),B('a3','KC @ DEN','+100','win',6),B('a4','KC @ DEN','+100','loss',6),B('a5','DAL @ NYG','+100','win',6),B('a6','DAL @ NYG','+100','loss',6),
  B('o1','SF @ LAR','+100','win',4,{sport:'NBA',market:'22.5 Points',closing:'+105'}),B('o2','SF @ LAR','+100','loss',4,{sport:'NBA',market:'22.5 Points',closing:'+110'}),B('o3','GB @ CHI','+100','loss',5),B('o4','GB @ CHI','+100','loss',5),B('o5','PHI @ WSH','+100','win',3),B('o6','PHI @ WSH','+100','loss',3)];
const WO=(k,actNet,res,price)=>({k,pk:k,sport:'NHL',name:'W '+k,market:'1.5 Shots',side:'O',book:'Novig',price,fee:0,model:0.56,mkt:0.53,blend:0.5405,net:0.04,actNet,first:NOW-86400e3,start:iso(NOW-20*3600e3),gk:'g'+k,result:res});
const WATCH=[WO('w1',0.004,'win',0.5),WO('w2',0.010,'loss',0.5),WO('w3',-0.02,'win',0.5),WO('w4',0.000,'win',0.5)];   // three are Just missed (0% or better): 2 won at +100, 1 lost → ROI +33.3%
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:1280,height:900}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(([R,d,L,W])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig, Kalshi',bank:'500',cfgVer:3.03}));
    localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows:R})); localStorage.setItem('mbev.log',JSON.stringify(L)); localStorage.setItem('mbev.watchObs',JSON.stringify(W)); }catch(e){} }, [ROWS,DAY,LOG,WATCH]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1300);
  const base=await p.evaluate(()=>lastRows.map(r=>({k:r.apiKey, sc:sentScore(r), pt:pxSeries(r).slice(-1)[0]})));
  check('with no history there is no signal: the three plays score the same, with no bonus; each new history point keeps the market’s chance and which market it is (4th and 5th values: 0.5, "c" for consensus)', base.length===3 && base.every(x=>x.sc.s===0 && !x.sc.sig && x.sc.total===base[0].sc.total) && base.every(x=>x.pt.length===5 && x.pt[3]===0.5 && x.pt[4]==='c'), base.map(x=>[x.k,x.sc.total,x.pt]));
  // history: Frost's market went 45.5% → 50% twenty minutes ago and Novig stayed at 44.4%; Backlund's market did the same but Novig moved with it; Gridin's moved 3 hours ago
  await p.evaluate(()=>{ const S=pxAll(), m=Math.floor(Date.now()/60000), K=k=>pxKey(lastRows.find(r=>r.apiKey===k));
    S[K('frost')]=[[m-40,0.444,0.50,0.455,'c'],[m-20,0.444,0.50,0.50,'c']];
    S[K('back')]=[[m-40,0.40,0.50,0.455,'c'],[m-20,0.444,0.50,0.50,'c']];
    S[K('grid')]=[[m-240,0.444,0.50,0.455,'c'],[m-180,0.444,0.50,0.50,'c']];
    refresh(); }); await p.waitForTimeout(400);
  const sg=await p.evaluate(()=>Object.fromEntries(lastRows.map(r=>{ const c=document.querySelector('#placeCards .sc-card[data-idx="'+r.idx+'"]'), pill=c&&c.querySelector('.sc-pill.sig'); return [r.apiKey,{sc:sentScore(r), pill:pill?pill.textContent:'', good:!!(pill&&pill.classList.contains('good')), tip:pill?pill.title:''}]; })));
  const b0=base[0].sc.total;
  check('Frost: the consensus market moved +4.5 pts his way (45.5% → 50.0%), seen 20 min ago, and Novig has not followed: "⚡ market +4.5 pts · 20m" (not "sharp"), bonus 5 × 1 × (1 − 5/105) × 0.4 = 1.9 → +2 (ChatGPT: a consensus move counts at most 2)', /^⚡ market \+4\.5 pts · 20m$/.test(sg.frost.pill) && sg.frost.good && sg.frost.sc.s===2 && sg.frost.sc.total===Math.min(100,b0+2) && Math.abs(sg.frost.sc.sig.rise-0.045)<1e-9 && sg.frost.sc.sig.mins===20 && sg.frost.sc.sig.behind && !sg.frost.sc.sig.sharp && !sg.frost.sc.sig.sampled && /from 45\.5% to 50\.0%, seen 20m ago\. Novig has not followed yet\. Seen between your loads, not live\./.test(sg.frost.tip), sg.frost);
  check('Backlund: the same market move, but Novig moved with it (40.0% → 44.4%): the pill shows without the green, and no bonus', /^⚡ market \+4\.5 pts · 20m$/.test(sg.back.pill) && !sg.back.good && sg.back.sc.s===0 && sg.back.sc.total===b0 && !sg.back.sc.sig.behind && /Novig has already moved with it\./.test(sg.back.tip), sg.back);
  check('Gridin: the move was 3 hours ago: outside the 2 hours a signal is scored on, so no pill and no bonus', sg.grid.pill==='' && sg.grid.sc.s===0 && !sg.grid.sc.sig, sg.grid);
  const why=await p.evaluate(()=>{ const r=lastRows.find(x=>x.apiKey==='frost'), c=document.querySelector('#placeCards .sc-card[data-idx="'+r.idx+'"]'); c.querySelector('details.sc-why').open=true; return c.innerText.replace(/\s+/g,' '); });
  check('Why this play? lists the ⚡ Signal part with the reason; the score chip says "signal +2"', /⚡ Signal/.test(why) && /the market moved \+4\.5 pts this way, seen 20m ago; Novig has not followed \(a bonus of up to 5 for a sharp market, 2 for the consensus/.test(why) && await p.evaluate(()=>[...document.querySelectorAll('#placeCards .sc-score')].some(x=>/signal \+2/.test(x.title))), why.slice(why.indexOf('⚡ Signal'),why.indexOf('⚡ Signal')+170));
  await p.selectOption('#sortBy','signal'); await p.waitForTimeout(300);
  const order=await p.evaluate(()=>[...document.querySelectorAll('#placeCards .sc-card')].map(c=>(lastRows.find(r=>r.idx===+c.dataset.idx)||{}).apiKey));
  check('Sort › ⚡ Signal: Frost first (fresh, book behind), then Backlund (book already moved), then Gridin (no signal)', order.join()==='frost,back,grid', order);
  await p.selectOption('#sortBy','math'); await p.waitForTimeout(200);
  // the rules, straight on sigMove (series written by hand; the last point is "now")
  const rules=await p.evaluate(()=>{ const r=lastRows.find(x=>x.apiKey==='frost'), k=pxKey(r), S=pxAll(), m=Math.floor(Date.now()/60000), keep=S[k], T=A=>{ S[k]=A; const g=sigMove(r), s=sigPts(r).s; return g?{rise:+g.rise.toFixed(4), mins:g.mins, behind:g.behind, sharp:g.sharp, sampled:g.sampled, retr:g.retr, s}:null; };
    const out={ sharp:T([[m-30,0.444,0.5,0.46,'s'],[m-10,0.444,0.5,0.50,'s'],[m,0.444,0.5,0.50,'s']]),
      source:T([[m-30,0.444,0.5,0.46,'c'],[m,0.444,0.5,0.50,'s']]),
      rebound:T([[m-100,0.444,0.5,0.55,'c'],[m-60,0.444,0.5,0.50,'c'],[m,0.444,0.5,0.52,'c']]),
      retrace:T([[m-60,0.444,0.5,0.46,'s'],[m-30,0.444,0.5,0.52,'s'],[m,0.444,0.5,0.50,'s']]),
      sampled:T([[m-90,0.444,0.5,0.46,'s'],[m-10,0.444,0.5,0.50,'s'],[m,0.444,0.5,0.50,'s']]),
      nomkt:T([[m-30,0.444,0.5,0.46,'c'],[m-10,0.444,0.5,0.50,'c'],[m,0.444,0.5,null,null]]),
      stale:T([[m-200,0.444,0.5,0.46,'c'],[m-130,0.444,0.5,0.50,'c']]),
      old3:T([[m-30,0.444,0.5],[m,0.444,0.5]]) }; S[k]=keep; return out; });
  check('a sharp market move of +4 pts seen 10 min ago, book behind: the full +5 (ChatGPT: "+10 is too influential"; sharp at most 5)', rules.sharp && rules.sharp.sharp && rules.sharp.s===5 && rules.sharp.mins===10 && rules.sharp.behind, rules.sharp);
  check('a change of market source (consensus → the sharp price) is not a move: no signal', rules.source===null, rules.source);
  check('a rebound after a bigger drop (55% → 50% → 52%) is not "moved this way": no signal', rules.rebound===null, rules.rebound);
  check('the market came back more than half a point from its high (46% → 52% → 50%): shown, but not "book behind" and no bonus', rules.retrace && rules.retrace.retr && !rules.retrace.behind && rules.retrace.s===0, rules.retrace);
  check('loads 80 minutes apart around the move: marked "sampled" (when it moved is not known)', rules.sampled && rules.sampled.sampled && rules.sampled.mins===10, rules.sampled);
  check('no market number on the latest load, a latest point over 2 hours old, or history from before v4.52 (3 numbers): no signal', rules.nomkt===null && rules.stale===null && rules.old3===null, rules);
  // ---------- records
  const rec=await p.evaluate(async()=>{ document.querySelector('.tab[data-view="v-perf"]').click(); await new Promise(z=>setTimeout(z,500));
    const S=logged.filter(x=>x.kind!=='parlay'), rg=x=>x.snap.ring, c=tierCmp(S.filter(x=>rg(x).n===6), S.filter(x=>rg(x).n<6)), c2=tierCmp(S.filter(x=>rg(x).n===6), S.filter(x=>rg(x).n<6));
    let a=0x9E3779B9; const rnd=()=>{ a=(a+0x6D2B79F5)|0; let t=Math.imul(a^(a>>>15),1|a); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; }, buckets=Array(10).fill(0); for(let i=0;i<200000;i++) buckets[Math.floor(rnd()*10)]++;
    return {c, buckets, same:JSON.stringify(c.ciRoi)===JSON.stringify(c2.ciRoi), txt:[...document.querySelectorAll('#tierBody .tier-cmp')].map(d=>d.innerText.replace(/\s+/g,' '))}; });
  const c=rec.c, clvOf=(mine,close)=>close/mine-1, pr=o=>{ const a=parseFloat(o); return a<0?(-a)/(100-a):100/(100+a); };
  const dC=(clvOf(0.5,pr('-110'))+clvOf(0.5,pr('-105')))/2-(clvOf(0.5,pr('+105'))+clvOf(0.5,pr('+110')))/2;
  check('Perfecta minus the others, by hand: ROI +33.3% − (−33.3%) = +66.7 pts on 6 against 6 bets, 3 and 3 games; CLV on the 2 and 2 bets with a close (too few for a CLV range: it says it needs 5 in each group)', c.n.join()==='6,6' && c.games.join()==='3,3' && Math.abs(c.dRoi-(20/60+20/60))<1e-9 && c.nc.join()==='2,2' && Math.abs(c.dClv-dC)<1e-9 && c.ciClv===null && /5 bets with a closing line in each group/.test(c.whyClv), {dRoi:c.dRoi, dClv:c.dClv, byHand:dC});
  check('the range comes from resampling whole games (5,000 times, seeded: the same log gives the same range; Perfecta-only and other-only games are resampled apart, so each resample keeps 3 and 3), and it contains the difference', c.ciRoi && c.ciRoi[0]<=c.dRoi+1e-9 && c.ciRoi[1]>=c.dRoi-1e-9 && c.ciRoi[0]<c.ciRoi[1] && rec.same && c.boot===5000 && c.ciRoi[0]>=-1e-9, c.ciRoi);
  check('the random numbers do not repeat early (the first generator cycled after about 10,000 draws): 200,000 draws from it are spread evenly over 10 buckets (each within 2% of 20,000)', rec.buckets.every(x=>Math.abs(x-20000)<400), rec.buckets);
  check('stage: 6 bets in each group is "descriptive only" (ChatGPT: under 100 bets or 50 games) and flagged extremely preliminary; the mix is shown (Perfectas NFL 100%, others NFL 67%, NBA 33%)', c.stage==='descriptive' && c.prelim && c.mix[0].sport==='NFL 100%' && c.mix[1].sport==='NFL 67%, NBA 33%' && c.mix[1].market==='Receptions 67%, Points 33%', {stage:c.stage, mix:c.mix});
  check('Performance › ◎ Rings and extras shows it: "ROI difference: +66.7 pts (95% range …", "Stage: descriptive only", the mix, "frozen since v4.50"', rec.txt.length===2 && /◎ Perfecta minus the other best bets settled singles · 6 against 6 bets, 3 and 3 games/.test(rec.txt[0]) && /ROI difference: \+66\.7 pts \(95% range .* to .*, 5,000 resamples of whole games\)/.test(rec.txt[0]) && /Extremely preliminary: this only shows the method works, it is not evidence yet\./.test(rec.txt[0]) && /CLV difference \(the better early read\): /.test(rec.txt[0]) && /Stage: descriptive only: under 100 bets or 50 games in a group\./.test(rec.txt[0]) && /Mix · Perfectas: NFL 100% · Receptions 100% \| others: NFL 67%, NBA 33%/.test(rec.txt[0]) && /frozen since v4\.50/.test(rec.txt[0]), rec.txt[0]);
  check('every Just-missed Watch bet, chosen or not (ChatGPT: "two distinct reports", and both prices kept apart): the 3 with La Contadora’s EV at 0% or better (not the −2% one): 3 graded, 2 won at +100 → ROI +33.3%', /Every Just-missed Watch bet, chosen or not/.test(rec.txt[1]) && /At the price when first seen .*: 3 seen, 3 graded \(2 won\) · ROI \+33\.3% · Brier: model 0\.\d{3}, market 0\.\d{3}/.test(rec.txt[1]) && /At the price 5 minutes before kickoff, one pick a game .*: none graded yet \(a pick needs a sighting in the last 30 minutes before the game; the first price is never used in its place\)/.test(rec.txt[1]) && /only the ones you placed/.test(rec.txt[1]), rec.txt[1]);
  for(const w of [390,1960]){ await p.setViewportSize({width:w,height:900}); await p.waitForTimeout(200); const o=await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth); check(w+' px: Performance has no sideways scroll', o<=0, o); }
  await p.evaluate(()=>document.querySelector('.tab[data-view="v-board"]').click()); await p.waitForTimeout(300);
  for(const w of [390,1000,1280,1960]){ await p.setViewportSize({width:w,height:900}); await p.waitForTimeout(250); const o=await p.evaluate(()=>({o:document.documentElement.scrollWidth-document.documentElement.clientWidth, bad:[...document.querySelectorAll('#placeCards .sc-card')].filter(c=>c.scrollWidth>c.clientWidth+1).length, pills:document.querySelectorAll('#placeCards .sc-pill.sig').length})); check(w+' px: the board with the ⚡ pills: no sideways scroll, no card overflowing', o.o<=0 && o.bad===0 && o.pills===2, o); }
  check('no page errors', !errs.length, errs); await b.close();
  console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail?1:0);
})();
