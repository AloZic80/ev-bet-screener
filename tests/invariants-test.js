// node tests/invariants-test.js — v4.53. Owner, 11/10, passing on ChatGPT's code review ("Yes—build it"): ONE number for every actionable decision.
// La Contadora's EV (actNet: the EV at min(model, market + 0.35 × (model − market)) after the fee) must drive the floor, OK up to, the stake, the Math
// order and the daily fill, the editor's and + Add a bet's stake, the score's Edge and the EV shown. Before v4.53 the stake and the order used the blend,
// which is higher than her number whenever the model is BELOW the market, and Kalshi re-checked the floor on the model's EV after its fee rounding.
// Every expected number below is worked out by hand in this file, not with the page's own functions.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,700)); };
const NOW=Date.parse('2026-11-10T19:00:00Z'), iso=ms=>new Date(ms).toISOString(), DAY='2026-11-10', KO=Date.parse('2026-11-11T01:15:00Z'), H=3600e3;
const T=(ha,abbr,loc,nick)=>({ha,id:abbr,abbr,name:loc+' '+nick,loc,nick,logo:'',rec:'',color:'333333',alt:'ffffff'});
const GI=(i)=>({state:'pre',startISO:iso(KO+i*20*60e3),eventId:'40200'+i,timeCT:'',detail:'',teams:[T('away','A'+i,'Away'+i,'Aways'),T('home','H'+i,'Home'+i,'Homes')]});
const am=p=>p>=0.5?String(Math.round(-100*p/(1-p))):'+'+Math.round(100*(1-p)/p);
const prop=(id,name,market,price,fair,mkt,g,book)=>{ const gi=GI(g); return {name,team:'A'+g,game:'A'+g+' @ H'+g,matchup:'A'+g+' @ H'+g,side:'O',sport:'NHL',market,kind:'prop',book:book||'Novig',offeredRaw:am(price),offeredProb:price,fairProb:fair,fairRaw:am(fair),mktProb:mkt,stars:4,evModel:'projection',projValue:2,gameInfo:gi,src:'api:NHL:props',apiKey:id,loadedAt:iso(NOW-60e3)}; };
const ROWS=[
  prop('above','Adam Above','1.5 Shots',0.52,0.55,0.525,1),                 // model above the market (the usual case): her chance is the blend
  prop('below','Ben Below','2.5 Shots',0.52,0.56,0.60,2),                   // model BELOW the market: her chance is the model, the blend is higher
  prop('watch','Will Watch','3.5 Shots',0.535,0.5546,0.526,3),              // the model clears the floor, she does not: Watch
  prop('nomkt','Nora Nomarket','0.5 Points',0.50,0.53,null,4),              // no market price: the model alone, held to the smallest bet
  prop('krnd','Kal Rounding','1.5 Points',0.52,0.58,0.5295,5,'Kalshi'),     // Kalshi: clears the floor before the fee is rounded up per order, not after
  prop('kok','Kal Okay','2.5 Points',0.52,0.60,0.58,6,'Kalshi'),            // Kalshi: clears it after rounding too
  prop('leg','Lee Leg','0.5 Shots',0.705,0.74,0.725,7),                     // 73% and +3.6%: a parlay leg
  prop('legno','Lou Legno','0.5 Blocked Shots',0.80,0.76,0.77,8),           // 76% but a losing price: not a leg
];
const W=0.35, ok=(m,k)=>k==null?m:Math.min(m,k+W*(m-k)), ev=(q,p,f)=>((q/p-1)-f)/(1+f);
async function open(b, o){ o=o||{};
  const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:o.w||1280,height:900}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(([R,d,L,cards])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig, Kalshi, Bovada',bank:'500',cfgVer:3.03}));
    localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows:R})); if(L) localStorage.setItem('mbev.log',JSON.stringify(L)); if(cards===false) localStorage.setItem('mbev.cards','0'); }catch(e){} }, [o.rows||ROWS,DAY,o.log||null,o.cards]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1300);
  const rows=()=>p.evaluate(()=>lastRows.map(r=>({k:r.apiKey, pass:r.pass, watch:!!r.watch, stake:+(+r.stake||0).toFixed(2), n:r.contracts||0, fee:r.fee, net:r.net, act:r.actNet, actP:r.actProb, blend:r.blendNet, price:r.offeredProb, leg:!!r.leg, out:(r.flags||[]).filter(f=>f[0]==='out').map(f=>f[1]).join(' | '), warn:(r.flags||[]).filter(f=>f[0]==='warn').map(f=>f[1]).join(' | '), mk:mathKey(r), mx:maxPriceFor(okProbR(r), r.book, cfgRead().eMin)})));
  return {ctx,p,errs,rows};
}
(async()=>{
  const b=await chromium.launch();
  let S=await open(b); let R=await S.rows(); const g=k=>R.find(x=>x.k===k)||{};
  const C=await S.p.evaluate(()=>{ const c=cfgRead(); return {bank:c.bank, kelly:c.kelly, shrink:c.shrink, eMin:c.eMin, sMin:c.sMin, sMax:c.sMax, w:c.mWeight, kal:c.fees.kalshi/100, dayMax:c.dayMax}; });
  check('the settings this file works with: $500 bankroll, quarter Kelly on half the edge, 1.5% floor, $1 to $10 bets, model weight 0.35, $50 a day', C.bank===500 && C.kelly===0.25 && C.shrink===0.5 && C.eMin===0.015 && C.sMin===1 && C.sMax===10 && C.w===W && C.dayMax===50, C);
  const stakeOf=(a,p)=>Math.min(C.sMax, C.bank*C.kelly*(a*C.shrink)/(1/p-1));
  // ---- the model above the market: nothing changes (her chance was already the blend)
  const aAbove=ev(ok(0.55,0.525),0.52,0);   // blend 53.375% → +2.644%
  check('model above the market (55% vs 52.5%, price 52%): her chance is the blend 53.375%, her EV +2.64%, the stake 500 × 0.25 × (2.644% × 0.5) ÷ 0.923 = $1.79 (as before v4.53)', Math.abs(g('above').actP-0.53375)<1e-9 && Math.abs(g('above').act-aAbove)<1e-9 && Math.abs(aAbove-0.026442)<1e-6 && g('above').stake===+stakeOf(aAbove,0.52).toFixed(2) && g('above').stake===1.79, g('above'));
  // ---- the model BELOW the market: the stake uses the model (her number), not the higher blend
  const aBelow=ev(ok(0.56,0.60),0.52,0), blBelow=ev(0.60+W*(0.56-0.60),0.52,0);   // min(56%, 58.6%) = 56% → +7.69%; the blend would be +12.69%
  check('model BELOW the market (56% vs 60%, price 52%): her chance is the model, 56% (the blend is 58.6%); her EV +7.69%, not the blend’s +12.69%', Math.abs(g('below').actP-0.56)<1e-9 && Math.abs(g('below').act-aBelow)<1e-9 && Math.abs(aBelow-0.076923)<1e-6 && Math.abs(g('below').blend-blBelow)<1e-9 && Math.abs(blBelow-0.126923)<1e-6, {act:g('below').act, blend:g('below').blend});
  check('its stake is sized on her EV: 500 × 0.25 × (7.692% × 0.5) ÷ 0.923 = $5.21 (v4.52 sized it on the blend: $8.59)', g('below').stake===+stakeOf(aBelow,0.52).toFixed(2) && g('below').stake===5.21 && +stakeOf(blBelow,0.52).toFixed(2)===8.59, {stake:g('below').stake, wasOnBlend:+stakeOf(blBelow,0.52).toFixed(2)});
  // ---- invariants over every row
  const staked=R.filter(x=>x.pass && x.stake>0);
  check('INVARIANT: a bet with a stake has La Contadora’s EV at or over the floor (every staked row)', staked.length>=4 && staked.every(x=>x.act>=C.eMin-1e-9), staked.map(x=>[x.k,+(x.act*100).toFixed(2)]));
  check('INVARIANT: a bet with a stake costs no more than "OK up to" (price ≤ her most at that book, after its fee)', staked.every(x=>x.mx!=null && x.price<=x.mx+1e-9), staked.map(x=>[x.k,x.price,+x.mx.toFixed(4)]));
  check('INVARIANT: Watch = the model clears the floor and she does not (Will: model +3.7%, hers +0.2%), no stake', g('watch').watch && !g('watch').pass && g('watch').stake===0 && g('watch').net>=C.eMin && g('watch').act<C.eMin && Math.abs(g('watch').act-ev(ok(0.5546,0.526),0.535,0))<1e-9 && R.filter(x=>x.watch).every(x=>x.net>=C.eMin && x.act<C.eMin), g('watch'));
  check('no market price: her EV is the model’s (+6.0%), and the stake is held to the smallest bet ($1.00)', Math.abs(g('nomkt').act-0.06)<1e-9 && g('nomkt').act===g('nomkt').net && g('nomkt').stake===1, g('nomkt'));
  // ---- Kalshi: the fee really charged is rounded up to the cent per order; her EV is re-checked with it
  const kPre=ev(ok(0.58,0.5295),0.52,C.kal*0.48), kStake=stakeOf(kPre,0.52), N=Math.floor(kStake/0.52), feeTot=Math.ceil(C.kal*N*0.52*0.48*100-1e-9)/100, kFee=feeTot/(N*0.52), kPost=ev(ok(0.58,0.5295),0.52,kFee), kModel=ev(0.58,0.52,kFee);
  check('Kalshi, by hand: before rounding her EV is +1.8% (stake $1.22 → 2 contracts); the fee really charged is 4¢ on $1.04 (3.85%, not 3.36%), so her EV is +1.33%: under the floor, while the model alone still says +7.4%', Math.abs(kPre-0.018053)<2e-5 && N===2 && feeTot===0.04 && Math.abs(kPost-0.013287)<2e-5 && kPost<C.eMin && kModel>0.07, {kPre, N, feeTot, kPost, kModel});
  check('INVARIANT: that row is out after the rounding ("net EV under the floor after Kalshi fee rounding"), with no stake; v4.52 re-checked the model’s EV only and kept it at $1.08', !g('krnd').pass && g('krnd').stake===0 && /net EV under the floor after Kalshi fee rounding/.test(g('krnd').out) && Math.abs(g('krnd').act-kPost)<1e-9 && Math.abs(g('krnd').fee-kFee)<1e-12, g('krnd'));
  { const pre=ev(ok(0.60,0.58),0.52,C.kal*0.48), st=stakeOf(pre,0.52), n=Math.floor(st/0.52); let nn=n; const F=q=>Math.ceil(C.kal*q*0.52*0.48*100-1e-9)/100; while(nn>0 && nn*0.52+F(nn)>st+1e-9) nn--; const fee=F(nn)/(nn*0.52), post=ev(ok(0.60,0.58),0.52,fee);
    check('a Kalshi bet that clears the floor after rounding keeps its stake in whole contracts, and its EV on the board is the one at the fee really charged', g('kok').pass && g('kok').n===nn && g('kok').stake===+(nn*0.52+F(nn)).toFixed(2) && Math.abs(g('kok').act-post)<1e-9 && post>=C.eMin, {n:g('kok').n, stake:g('kok').stake, act:g('kok').act, byHand:{nn, post}}); }
  // ---- the Math order and what the board shows
  /* v4.76: Place these is split into five tabs by La Contadora's chance and, inside a tab, grouped by cover band (highest first); Sort › Math applies inside each band.
     By hand: Lee 73.0% is under 💪 Machín (Strong 70–75%); Kal Okay 58.7% and Ben 56% under 🪙 Volado (Slight Lean 55–60%); Adam 53.4% and Nora 53% under 🪙 Volado (On the Line 50–55%).
     The tabs are read highest chance first and combined (Place these only, not the 🍀 card of Will under Suertudo); the band is worked out here from her chance, 5-point bands from 45% to 80%. */
  const TABS=['boring','safe','volado','lucky','clair'], band=a=>[0.45,0.50,0.55,0.60,0.65,0.70,0.75,0.80].filter(t=>a>=t).length;
  const order=[]; for(const m of TABS){ await S.p.evaluate(m=>setMode(m),m); await S.p.waitForTimeout(300); order.push(...await S.p.evaluate(()=>[...document.querySelectorAll('#placeCards .sc-card:not(.sc-x)')].map(c=>(lastRows.find(r=>r.idx===+c.dataset.idx)||{}).apiKey))); }
  const want=staked.slice().sort((x,y)=>(band(y.actP)-band(x.actP))||((x.k==='nomkt')-(y.k==='nomkt'))||(y.act-x.act)).map(x=>x.k);   // v4.54: market-checked bets first, then the model-only one   /* v4.76: inside each cover band, highest band first */
  check('INVARIANT: Sort › Math lists the cards by her EV, best first (Ben, at +7.7%, is no longer ahead of a bet she likes more because of his blend); v4.54: the model-only bet (Nora, +6%) comes after every market-checked one (v4.76: inside each cover band; tabs and bands highest chance first)', order.join()===want.join() && staked.every(x=>Math.abs(x.mk-x.act-(x.k==='nomkt'?-0.5:0))<1e-12), {order, want});
  /* v4.76: each staked card is read in the tab that lists it (Lee under 💪 Machín, the other four under 🪙 Volado): the five tabs are read and combined */
  const shown={}; for(const m of TABS){ await S.p.evaluate(m=>setMode(m),m); await S.p.waitForTimeout(300);
    Object.assign(shown, await S.p.evaluate(()=>Object.fromEntries(lastRows.filter(r=>r.pass&&r.stake>0&&document.querySelector('#placeCards .sc-card[data-idx="'+r.idx+'"]')).map(r=>{ const c=document.querySelector('#placeCards .sc-card[data-idx="'+r.idx+'"]'), pill=c.querySelector('.sc-pill.ev'); c.querySelector('details.sc-why').open=true; const tiles=[...c.querySelectorAll('.sc-t')].map(t=>t.innerText.replace(/\s+/g,' ')); return [r.apiKey,{pill:pill.textContent.trim(), tip:pill.title, tiles:tiles.filter(t=>/EV/.test(t)), score:sentScore(r)}]; })))); }
  check('the green number on a card is La Contadora’s EV (Adam: +2.6%, not the model’s +5.8%); Why this play? shows both, and says the model’s is not used for the stake', /\+2\.6%$/.test(shown.above.pill) && /La Contadora’s EV after fees at Novig \(with the market\): the number the stake, the order and the score use\. Model EV: \+5\.8%/.test(shown.above.tip) && shown.above.tiles.some(t=>/^La Contadora EV \+2\.6% after fees, with the market/i.test(t)) && shown.above.tiles.some(t=>/^Model EV \+5\.8% projection model · not used for the stake/i.test(t)), shown.above);
  const eOf=x=>Math.round(50*Math.max(0,Math.min(1,x/0.06)));
  check('the score’s Edge is on her EV: Adam 50 × 2.644 ÷ 6 = 22 (it was 48 on the model’s +5.8%); the old total is kept beside it to see which bands moved (61 GOOD now, 87 STRONG before)', shown.above.score.e===eOf(aAbove) && shown.above.score.e===22 && shown.above.score.e1===eOf(ev(0.55,0.52,0)) && shown.above.score.e1===48 && shown.above.score.total===61 && shown.above.score.total1===87, shown.above.score);
  check('a bet with the model below the market scores the same as before (its Edge was already her number): Ben 96 both ways', shown.below.score.total===shown.below.score.total1 && shown.below.score.e===50, shown.below.score);
  // ---- the parlay leg
  check('INVARIANT: every 🎟 parlay leg clears the floor on her EV (Lee: 73%, +3.6%); Lou (76%, −5.0%) is not one', R.filter(x=>x.leg).length===1 && g('leg').leg && R.filter(x=>x.leg).every(x=>x.act>=C.eMin-1e-9) && !g('legno').leg && g('legno').act<0, R.filter(x=>x.leg||x.k==='legno').map(x=>[x.k,x.leg,+(x.act*100).toFixed(2)]));
  // ---- the bet editor and + Add a bet go through the same two helpers
  await S.p.evaluate(()=>setMode('volado')); await S.p.waitForTimeout(300);   /* v4.76: Ben (56%) and Adam (53.4%) are under 🪙 Volado: their cards are opened there */
  const ed=await S.p.evaluate(async()=>{ const r=lastRows.find(x=>x.apiKey==='below'), c=document.querySelector('#placeCards .sc-card[data-idx="'+r.idx+'"]'); c.querySelector('button.bet-btn').click(); await new Promise(z=>setTimeout(z,150));
    const e=c.querySelector('.editor'), rec0=e.querySelector('.eb-rec').textContent, chk0=e.querySelector('.eb-check').textContent, pc=e.querySelector('.eb-pct'); pc.value='55.5'; pc.dispatchEvent(new Event('input',{bubbles:true})); await new Promise(z=>setTimeout(z,100)); const rec1=e.querySelector('.eb-rec').textContent, chk=e.querySelector('.eb-check').textContent;
    e.querySelector('.eb-cancel')&&e.querySelector('.eb-cancel').click(); return {rec0, rec1, chk0, chk}; });
  check('I bet this on Ben recommends $5.21 at the board’s price; at 55.5% her EV is +0.9% (56 ÷ 55.5 − 1), under the floor, so it recommends $0.00', /recommended at this price: \$5\.21/.test(ed.rec0) && /recommended at this price: \$0\.00/.test(ed.rec1), ed);
  check('the editor’s check line speaks her EV too: "Worth it: +7.7% EV · board said +7.7%" at the board’s price; at 55.5% "Thin: +0.9% EV, under your 1.5% floor" (not "Worth it")', /Worth it: \+7\.7% EV · board said \+7\.7%/.test(ed.chk0) && /Thin: \+0\.9% EV, under your 1\.5% floor · board said \+7\.7%/.test(ed.chk) && !/Worth it/.test(ed.chk), {chk0:ed.chk0, chk:ed.chk});
  const ed2=await S.p.evaluate(async()=>{ const z=ms=>new Promise(r=>setTimeout(r,ms)); document.querySelectorAll('#placeCards .editor').forEach(x=>x.remove()); refresh(); await z(200);
    const r=lastRows.find(x=>x.apiKey==='above'), c=document.querySelector('#placeCards .sc-card[data-idx="'+r.idx+'"]'); c.querySelector('button.bet-btn').click(); await z(150);
    const e=c.querySelector('.editor'), chk0=e.querySelector('.eb-check').textContent, pc=e.querySelector('.eb-pct'); pc.value='53'; pc.dispatchEvent(new Event('input',{bubbles:true})); await z(100);
    const chk1=e.querySelector('.eb-check').textContent, rec1=e.querySelector('.eb-rec').textContent; e.remove(); refresh(); await z(150); return {chk0, chk1, rec1}; });
  check('when the model is above the market the line names both: "Worth it: +2.6% EV (model alone +5.8%) · board said +2.6%"; at 53% her EV is +0.7% (53.375 ÷ 53 − 1) while the model alone still says +3.8%: "Thin", $0.00 recommended (it used to say "Worth it: +3.8% EV")', /Worth it: \+2\.6% EV \(model alone \+5\.8%\) · board said \+2\.6%/.test(ed2.chk0) && /Thin: \+0\.7% EV, under your 1\.5% floor \(model alone \+3\.8%\) · board said \+2\.6%/.test(ed2.chk1) && /recommended at this price: \$0\.00/.test(ed2.rec1), ed2);
  const ab=await S.p.evaluate(()=>({ take:abStake({fair:0.55,mkt:0.525,p:0.52,fee:0,book:'Novig'}), below:abStake({fair:0.56,mkt:0.60,p:0.52,fee:0,book:'Novig'}), watch:abStake({fair:0.5546,mkt:0.526,p:0.535,fee:0,book:'Novig'}), make:abStake({fair:0.5546,mkt:0.526,p:0.535,fee:0,book:'Novig',make:true}), helper:[actNetOf(0.56,0.60,0.52,0), actNetOf(0.53,null,0.5,0), kellyFor(cfgRead(),0.076923,0.52)] }));
  check('+ Add a bet sizes the same way: $1.79 for Adam’s numbers and $5.20 for Ben’s ($5.2083: it cuts to the cent where the board rounds, as before); a price that only the model likes (Will’s) is a SKIP "with the market it is +0.2%, under your 1.5% floor" (it used to say BET)', ab.take.s===1.79 && ab.below.s===5.2 && ab.watch.s===0 && /^with the market it is \+0\.2%, under your 1\.5% floor$/.test(ab.watch.why), {take:ab.take.s, below:ab.below.s, watch:ab.watch});
  check('v4.54 (ChatGPT: "half-sizing does not make a bad price acceptable"): a Make at a price only the model likes is refused too: "with the market it is +0.2%, under your 1.5% floor"', ab.make.s===0 && /^with the market it is \+0\.2%, under your 1\.5% floor$/.test(ab.make.why||''), ab.make);
  check('the two helpers, by hand: actNetOf(56%, 60%, 52%) = +7.69%; with no market it is the model’s (53 ÷ 50 − 1 = +6%); kellyFor(+7.69% at 52%) = $5.21', Math.abs(ab.helper[0]-aBelow)<1e-9 && Math.abs(ab.helper[1]-0.06)<1e-9 && Math.abs(ab.helper[2]-5.2083)<1e-3, ab.helper);
  // ---- a new bet keeps her numbers and the policy; an old bet is left as it is
  const OLD={id:'old1',key:'old1',name:'Old Bet',sport:'NFL',kind:'prop',market:'1.5 Receptions',side:'O',book:'Bovada',odds:'-110',offeredRaw:'-110',stake:2,fee:0,date:'2026-11-08',dateSet:true,start:'2026-11-08T23:00:00Z',result:'win',gradedBy:'manual',snap:{at:iso(NOW-2*86400e3),model:0.56,market:0.53,sizedAt:0.5405,said:{decision:'BET',onList:true}}};
  await S.ctx.close(); S=await open(b,{log:[OLD]});
  await S.p.evaluate(()=>setMode('volado')); await S.p.waitForTimeout(300);   /* v4.76: Ben (56%) is under 🪙 Volado: his card is opened there */
  const sv=await S.p.evaluate(async()=>{ const r=lastRows.find(x=>x.apiKey==='below'), c=document.querySelector('#placeCards .sc-card[data-idx="'+r.idx+'"]'); c.querySelector('button.bet-btn').click(); await new Promise(z=>setTimeout(z,150));
    c.querySelector('.editor .eb-save').click(); await new Promise(z=>setTimeout(z,300)); const B=logged[logged.length-1], O=logged.find(x=>x.id==='old1'), saved=JSON.parse(localStorage.getItem('mbev.log')).find(x=>x.id==='old1');
    return {n:logged.length, stake:B.stake, snap:{act:B.snap.act, actNet:B.snap.actNet, policy:B.snap.policy, sizedAt:B.snap.sizedAt, model:B.snap.model, market:B.snap.market, sent:B.snap.sent}, old:O.snap, oldSaved:saved.snap, POLICY}; });
  check('a bet logged now keeps her chance (56%), her EV (+7.69%), the math policy "act-v2" and the score with its policy "v3-actNet-nomkt" (v4.54) (96, and 96 the old way)', sv.n===2 && sv.stake===5.21 && sv.snap.act===0.56 && Math.abs(sv.snap.actNet-0.0769)<1e-9 && sv.snap.policy==='act-v2' && sv.snap.sizedAt===0.56 && sv.snap.sent && sv.snap.sent.pol==='v3-actNet-nomkt' && sv.snap.sent.t===96 && sv.snap.sent.t1===96 && sv.POLICY.math==='act-v2', sv.snap);
  check('an older bet’s snapshot is not rewritten: no act, actNet, policy or score is added to it, in memory or in storage', sv.old.act===undefined && sv.old.actNet===undefined && sv.old.policy===undefined && sv.old.sent===undefined && sv.old.sizedAt===0.5405 && sv.oldSaved.policy===undefined && sv.oldSaved.sizedAt===0.5405, {old:sv.old, saved:sv.oldSaved});
  check('no page errors', !S.errs.length, S.errs); await S.ctx.close();
  // ---- the daily max is filled in her order, and a bet that does not fit does not stop the fill
  const HELD=(id,st)=>({id,key:id,name:'Held '+id,sport:'NBA',kind:'prop',market:'9.5 Points',side:'O',book:'Bovada',odds:'-110',offeredRaw:'-110',stake:st,fee:0,date:DAY,dateSet:true,start:iso(KO),snap:{at:iso(NOW-H),said:{decision:'BET',onList:true}}});
  S=await open(b,{log:[HELD('h1',10),HELD('h2',10),HELD('h3',10),HELD('h4',10),HELD('h5',8)]}); R=await S.rows();   // $48 of $50 already on today's games: $2.00 of room
  const fill=R.filter(x=>x.pass).map(x=>[x.k,x.stake,/daily max reached/.test(x.warn)]);
  check('$2.00 left under the daily max: the room goes to her best bet (Kal Okay or Ben, whichever she likes more), trimmed to fit; the others say "daily max reached"; nothing is given past $50', R.filter(x=>x.stake>0).reduce((t,x)=>t+x.stake,0)<=2+1e-9 && R.filter(x=>x.stake>0).length>=1 && (()=>{ const best=R.filter(x=>x.pass && x.act!=null).sort((x,y)=>y.act-x.act)[0]; return best.stake>0; })() && R.filter(x=>x.pass && x.stake===0 && x.k!=='nomkt' ).every(x=>/daily max reached|Kalshi whole contracts|minimum/.test(x.warn)), fill);
  await S.ctx.close();
  // ---- v4.54: no-market score, Make caps, best book
  const v54=await (async()=>{ const X=await open(b); const o=await X.p.evaluate(()=>{ const r=lastRows.find(x=>x.apiKey==='nomkt'), z=sentScore(r), cfg=cfgRead();
      const fee=p=>makerFee('Novig',p), mxAct=priceForNet(okProb(0.55,0.525),fee,cfg.eMin), mxMdl=priceForNet(0.55,fee,cfg.eMin);
      const lad=abMakeLadder({fair:0.55}, 0.55, 0.525, 'Novig', null, ()=>false, false);
      const best=(()=>{ const F=(bk,p)=>feeRate(bk,p,cfg.fees), A=[['Novig',0.52],['Kalshi',0.515]].map(([bk,p])=>({bk,p,a:actNetOf(0.55,0.525,p,F(bk,p)),m:((0.55/p-1)-F(bk,p))/(1+F(bk,p))})); return A; })();
      return {z:{t:z.total,e:z.e,m:z.m,f:z.f,noM:z.noM,word:scWord(z.total)}, mxAct, mxMdl, rungs:(abMakeLadder.last&&abMakeLadder.last.rungs||[]).map(g=>({p:g.p,net:g.net})), head:lad.head, best}; }); await X.ctx.close(); return o; })();
  check('v4.54: a bet with no market price has its Edge counted half: Nora +6% → 50 × 0.5 = 25, + 8 + 20 = 53: GOOD, never STRONG (it was 78 STRONG)', v54.z.noM && v54.z.e===25 && v54.z.t===53 && v54.z.word==='GOOD', v54.z);
  check('v4.54: INVARIANT: a Make’s highest price clears the floor on her chance: 53.375% ÷ 1.015 = 52.59% at Novig (no maker fee), not the model’s 55% ÷ 1.015 = 54.19%; every rung clears it', Math.abs(v54.mxAct-0.53375/1.015)<1e-6 && Math.abs(v54.mxMdl-0.55/1.015)<1e-6 && v54.rungs.length>0 && v54.rungs.every(g=>g.p<=v54.mxAct+1e-9 && g.net>=0.015-1e-9), {mxAct:v54.mxAct, mxMdl:v54.mxMdl, rungs:v54.rungs, head:v54.head});
  check('v4.54: books are compared on her EV after each fee: Novig at 52% (+2.64%) beats Kalshi at 51.5% (her EV after the 3.40% fee is +0.27%), whichever price is lower', (()=>{ const n=v54.best.find(x=>x.bk==='Novig'), k=v54.best.find(x=>x.bk==='Kalshi'); return Math.abs(n.a-0.026442)<1e-5 && k.a<n.a && Math.abs(k.a-(((0.53375/0.515-1)-0.07*0.485)/(1+0.07*0.485)))<1e-9; })(), v54.best);
  const shopSrc=html.includes("const netAt=(book,p)=>{ const f=feeRate(book,p,cfg.fees), a=actNetOf(r.fairProb, r.mktProb, p, f);");
  check('v4.54: the Sentinels’ best-book choice uses that same number (actNetOf with each book’s fee)', shopSrc, shopSrc);
  // ---- the Bet log: remove has its own handler; void, + ticket and vs Pinnacle do not open the remove prompt
  const LB={id:'t1',key:'t1',name:'Game Total',sport:'NFL',kind:'total',market:'44.5 Total Points',side:'O',book:'Bovada',game:'BUF @ MIN',odds:'-110',offeredRaw:'-110',stake:2,fee:0,date:DAY,dateSet:true,start:iso(KO),snap:{at:iso(NOW-H),said:{decision:'BET',onList:true}}};
  S=await open(b,{log:[LB]});
  const bl=await S.p.evaluate(async()=>{ const z=ms=>new Promise(r=>setTimeout(r,ms)); document.querySelector('.tab[data-view="v-log"]').click(); await z(400);
    document.querySelectorAll('#logBody details, #v-log details').forEach(d=>{ d.open=true; }); await z(100);
    const q=s=>document.querySelector('#v-log button.kill'+s), cls=[...document.querySelectorAll('#v-log button.kill')].map(x=>x.className).join(' | ');
    const ask=()=>document.querySelectorAll('tr.rm-ask').length;
    q('.void').click(); await z(250); const afterVoid={ask:ask(), voided:!!logged[0].voided};
    q('.void').click(); await z(250); const afterUnvoid={ask:ask(), voided:!!logged[0].voided};
    q('.copy').click(); await z(250); const afterCopy={ask:ask(), n:logged.length};
    q('.remove').click(); await z(200); const afterRemove={ask:ask(), n:logged.length};
    return {cls, afterVoid, afterUnvoid, afterCopy, afterRemove}; });
  check('Bet log: void and unvoid mark the bet and open no remove prompt; + ticket adds one and opens none; remove (its own class) opens the prompt and removes nothing until you choose', /kill remove/.test(bl.cls) && bl.afterVoid.ask===0 && bl.afterVoid.voided && bl.afterUnvoid.ask===0 && !bl.afterUnvoid.voided && bl.afterCopy.ask===0 && bl.afterCopy.n===2 && bl.afterRemove.ask===1 && bl.afterRemove.n===2, bl);
  const sel=await S.p.evaluate(()=>{ const src=document.documentElement.innerHTML; return {old:/button\.kill:not\(\.sell\):not\(\.edit\)'\)\.forEach/.test(src), now:/querySelectorAll\('button\.kill\.remove'\)/.test(src)}; });
  check('the handler is bound to button.kill.remove, not to "every kill button that is not sell or edit"', sel.now && !sel.old, sel);
  check('no page errors (Bet log)', !S.errs.length, S.errs); await S.ctx.close();
  // ---- layouts: the table's +EV column with the model line under it
  for(const w of [390,1280]){ const X=await open(b,{w, cards:false}); const tv={o:-Infinity, cells:[]};   /* v4.76: the table is split into the five tabs too (Adam and Ben under 🪙 Volado, Lee under 💪 Machín): each tab is read and combined, and the widest sideways overflow of the five counts */
    for(const m of TABS){ await X.p.evaluate(m=>setMode(m),m); await X.p.waitForTimeout(300); const t=await X.p.evaluate(()=>({o:document.documentElement.scrollWidth-document.documentElement.clientWidth, cells:[...document.querySelectorAll('#tbody tr:not(.group-row):not(.notes-row)')].filter(tr=>tr.querySelector('.net.ev-big')).map(tr=>{ const td=tr.querySelector('.net.ev-big').closest('td'); return td.innerText.replace(/\s+/g,' ').trim(); })})); tv.o=Math.max(tv.o,t.o); tv.cells.push(...t.cells); }
    check(w+' px, cards off: the +EV column shows her EV with the model’s under it ("2.6% model 5.8% proj."; Ben, whose model is her number, shows one line: "7.7% proj."), and nothing scrolls sideways', tv.o<=0 && tv.cells.some(t=>/^2\.6% model 5\.8% proj\.$/.test(t)) && tv.cells.some(t=>/^7\.7% proj\.$/.test(t)) && !X.errs.length, tv); await X.ctx.close(); }
  await b.close();
  console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail?1:0);
})();
