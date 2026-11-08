// node tests/math-audit-test.js — v4.24. Independent arithmetic against the app's own functions, run inside the page: odds ↔ chance both ways,
// EV after fees against the plain definition (pay p·(1+fee) per $1 of payout), La Contadora's most (maxPriceFor) against brute force, the
// Kalshi shares / limit / cost, the Kelly stake the board gives, betProfit for wins / losses / free bets / boosts, and the parlay distribution
// against brute force. The point of the app is a positive edge over many bets, so these numbers must be right.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:1280,height:900}});
  await ctx.addInitScript(()=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); }catch(e){} });
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(800);
  const R=await p.evaluate(()=>{
    const out={}, close=(a,b,t=1e-9)=>Math.abs(a-b)<=t, cfg=cfgRead(), fees=cfg.fees;
    out.prob230=toProb('+230'); out.probm110=toProb('-110'); out.even=toProb('EVEN'); out.am50=americanOf(0.5); out.am230=americanOf(100/330); out.amm110=americanOf(110/210);
    let rt=true, rtAt=null; for(let o=-5000;o<=5000;o+=7){ if(Math.abs(o)<100) continue; if(americanOf(toProb(o))!==o){ rt=false; rtAt=o; break; } } out.rt=rt; out.rtAt=rtAt;
    out.ev=[['Kalshi',0.52,0.551],['Polymarket US',0.36,0.40],['Novig',0.45,0.48],['Bovada',0.5,0.53]].map(([bk,p,fair])=>{ const f=feeRate(bk,p,fees), net=((fair/p-1)-f)/(1+f), honest=fair/(p*(1+f))-1; return {bk, f, net, honest, ok:close(net,honest,1e-12)}; });
    out.kFee=feeRate('Kalshi',0.52,fees); out.kPct=fees.kalshi; out.nvPre=feeRate('Novig',0.5,fees); out.nvLive=feeRate('Novig',0.4,fees,true);
    out.mx=[['Kalshi',0.551],['Polymarket US',0.40],['Novig',0.48],['Bovada',0.53]].map(([bk,fair])=>{ const mx=maxPriceFor(fair,bk,cfg.eMin); let brute=null; for(let q=0.01;q<0.99;q+=0.0001){ const f=feeRate(bk,q,fees); if(((fair/q-1)-f)/(1+f)>=cfg.eMin) brute=q; } const f=feeRate(bk,mx,fees); return {bk, mx, brute, evAt:((fair/mx-1)-f)/(1+f), ok:mx!=null && close(mx,brute,2e-4)}; });
    out.eMin=cfg.eMin;
    { const k=kalshiHow({side:'',kind:'moneyline',team:'M-OH',name:'M-OH',market:'Moneyline'},3.22,0.519,0.5254), L=k.lim/100, per=L*(1+feeRate('Kalshi',L,fees));
      out.k={k, per, sharesOk:close(k.shares, Math.floor(3.22/per*100)/100), costOk:k.cost<=3.22+1e-9 && 3.22-k.cost<0.02, payOk:k.payout===k.shares, limOk:k.lim===52};
      const u=kalshiHow({side:'U',kind:'prop',name:'J. Brown',market:'24.5 Points'},2,0.48,0.49); out.kU={btn:u.btn, what:u.what}; }
    { const c=Object.assign({},cfg,{bank:500, kelly:0.25, shrink:0.5, sMin:1, sMax:25, eMin:0.02, books:['Bovada']}); const row={name:'X',team:'X',game:'A @ X',matchup:'A @ X',side:'O',sport:'NBA',market:'24.5 Points',kind:'prop',book:'Bovada',offeredRaw:'-110',offeredProb:110/210,fairProb:0.58,fairRaw:'',mktProb:0.57,stars:3,evModel:'market',gameInfo:{state:'pre',startISO:new Date(Date.now()+5*3600e3).toISOString(),teams:[]},src:'api:NBA:props',apiKey:'kk'};
      const [a]=audit([row],c); const p=a.offeredProb, f=a.fee||0, bl=a.blendProb, bnet=((bl/p-1)-f)/(1+f), bOdds=1/p-1, expect=Math.min(25, 500*0.25*(bnet*0.5)/bOdds);
      out.kelly={stake:a.stake, expect:+expect.toFixed(2), blend:bl, bnet, pass:a.pass, flags:a.flags}; }
    out.bp={ win:betProfit({odds:'+150',stake:2,result:'win'}), loss:betProfit({odds:'+150',stake:2,result:'loss'}), push:betProfit({odds:'+150',stake:2,result:'push'}),
      freeLoss:betProfit({odds:'+150',stake:5,result:'loss',free:true}), freeWin:betProfit({odds:'+150',stake:5,result:'win',free:true}), boost:betProfit({odds:'+150',stake:2,result:'win',towin:9}), kalshiWin:betProfit({odds:'+100',stake:2,result:'win',fee:0.035}), open:betProfit({odds:'+150',stake:2}) };
    { const ps=[0.55,0.6,0.52,0.58], d=pkDist(ps), brute=[0,0,0,0,0]; for(let m=0;m<16;m++){ let pr=1,h=0; ps.forEach((q,i)=>{ if(m&(1<<i)){ pr*=q; h++; } else pr*=1-q; }); brute[h]+=pr; }
      out.pk={distOk:d.every((v,i)=>close(v,brute[i],1e-12)), ev:pkEV(ps,[10,0,0,0,0]), evExp:10*brute[4]-1, be:pkBreakEven(4,[10,0,0,0,0]), beExp:Math.pow(0.1,0.25), kelly0:pkKelly([0.5,0.5,0.5,0.5],[10,0,0,0,0])}; }
    out.pct=pct(0.5254); out.fmt=[fmtOdds(230),fmtOdds(-110)];
    return out; });
  check('odds → chance: +230 = 30.3%, −110 = 52.4%, EVEN = 50%', Math.abs(R.prob230-100/330)<1e-12 && Math.abs(R.probm110-110/210)<1e-12 && R.even===0.5, R);
  check('chance → odds: 50% = −100, 30.3% = +230, 52.4% = −110; every price from −5000 to +5000 round-trips', R.am50===-100 && R.am230===230 && R.amm110===-110 && R.rt, {am50:R.am50, am230:R.am230, amm110:R.amm110, rt:R.rt, rtAt:R.rtAt});
  check('EV after fees = fair ÷ (price × (1 + fee)) − 1, at Kalshi, Polymarket, Novig and a sportsbook', R.ev.every(x=>x.ok), R.ev);
  check('Kalshi fee at 52¢ = '+R.kPct+'% × (1 − 0.52) of the cost; Novig 0 pre-game, 6% × (1 − p) live', Math.abs(R.kFee-(R.kPct/100)*0.48)<1e-12 && R.nvPre===0 && Math.abs(R.nvLive-0.06*0.6)<1e-12, {kFee:R.kFee, nvPre:R.nvPre, nvLive:R.nvLive});
  check('La Contadora\'s most (OK up to) equals brute force at every book, and the EV right at it is the floor ('+(R.eMin*100)+'%)', R.mx.every(x=>x.ok && Math.abs(x.evAt-R.eMin)<1e-6), R.mx);
  check('Kalshi: limit 52¢, shares = floor(stake ÷ (limit + fee)), cost ≤ stake within 2¢, max payout = shares × $1; an Under is NO on the Over', R.k.limOk && R.k.sharesOk && R.k.costOk && R.k.payOk && R.kU.btn==='NO' && /Over 24\.5 Points/.test(R.kU.what), {k:R.k.k, kU:R.kU});
  check('the board\'s stake is Kelly: bank × fraction × (edge × shrink) ÷ b, capped at the max ($'+R.kelly.expect+')', R.kelly.pass && Math.abs(R.kelly.stake-R.kelly.expect)<0.011, R.kelly);
  check('betProfit: +150 for $2 wins $3, loses −$2, push $0; a free bet loses $0 and wins its winnings; a typed boost (towin) wins what you typed; a Kalshi win takes the fee off; open = null', R.bp.win===3 && R.bp.loss===-2 && R.bp.push===0 && R.bp.freeLoss===0 && R.bp.freeWin===7.5 && R.bp.boost===9 && Math.abs(R.bp.kalshiWin-(2*(1-0.035)/1.035))<0.01 && R.bp.open===null, R.bp);
  check('parlays: hit distribution = brute force; 4-leg 10× (table [all-hit, 1 miss, …]) EV = 10·P(all) − 1; break-even = 10^(−¼) = 56.2%; Kelly 0 when EV ≤ 0', R.pk.distOk && Math.abs(R.pk.ev-R.pk.evExp)<1e-12 && Math.abs(R.pk.be-R.pk.beExp)<1e-9 && R.pk.kelly0<=1e-9, R.pk);
  check('pct(0.5254) = "52.5%"; fmtOdds +230 / −110', R.pct==='52.5%' && R.fmt[0]==='+230' && R.fmt[1]==='-110', {pct:R.pct, fmt:R.fmt});
  check('no page errors', !errs.length, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
