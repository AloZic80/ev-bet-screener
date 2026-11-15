// node tests/v505-test.js — v5.05 (Sally agreed, owner "bUILD" 2026-11-14 ~3:30 PM CT). Two things:
// K. Kalshi takes 0.01-share quantities (the owner's History: 3.01, 10.09, 1.81). The Kelly / cap stake is a CASH BUDGET and is no longer cut to whole
//    contracts. Limit = La Contadora's most (OK up to) rounded down to whole cents. Shares = the largest q in 0.01 steps with
//    q × L + ceil-to-cent(rate × q × L × (1 − L)) <= the budget; that cent rounding is a sizing buffer only. EV and the floor stay on the smooth fee.
//    One helper (kalshiFractionalFit / kalshiFitRow) for the board, the daily trim, Hail Marys, Just missed, the bet form, + Add a bet, card and strip.
//    A saved Kalshi bet gets snap.kalshiFee. Polymarket, Novig and other books: unchanged.
// P. Price wording on the cards: "Price fell 4.5 pts" / "Price rose 4.5 pts" (title keeps "58.0% → 53.5% in N min"); "Price just read",
//    "Price 8m old", "Price stale · re-check" (30 min or more, amber), "Price time unknown · check book" (amber). The ◎ fresh check is unchanged.
// Every expected number is worked out by hand in this file (not with the page's own functions), unless a check says it compares two page values.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,900)); };
const NOW=Date.parse('2026-11-14T19:00:00Z'), DAY='2026-11-14', TIP=Date.parse('2026-11-15T02:00:00Z'), iso=ms=>new Date(ms).toISOString();
const T=(ha,abbr)=>({ha,id:abbr,abbr,name:abbr+' Team',loc:abbr,nick:'Team',logo:'',rec:'',color:'333333',alt:'ffffff'});
const am=p=>p>=0.5?String(Math.round(-100*p/(1-p))):'+'+Math.round(100*(1-p)/p);
const row=(id,player,price,fair,mkt,o)=>Object.assign({name:player,team:'T'+id,game:'T'+id+' @ H'+id,matchup:'T'+id+' @ H'+id,side:'O',sport:'NHL',market:'1.5 Shots On Goal',kind:'prop',book:'Kalshi',offeredRaw:am(price),offeredProb:price,fairProb:fair,fairRaw:'',mktProb:mkt,stars:3,evModel:'market',
  gameInfo:{state:'pre',startISO:iso(TIP),eventId:'8'+id,timeCT:'',detail:'',teams:[T('away','T'+id),T('home','H'+id)]},src:'api:NHL:props',apiKey:id,loadedAt:iso(NOW-20e3)}, o||{});
const ROWS=[row('k','Kal Kelly',0.55,0.62,0.60),                                     // a Kalshi best bet: her chance 60.7%, EV on the smooth fee +6.99%
  row('p','Poly Same',0.55,0.62,0.60,{book:'Polymarket US'}),                       // the same bet at Polymarket US (K10: whole shares, unchanged)
  row('n','Novi Same',0.55,0.62,0.60,{book:'Novig'}),                               // and at Novig (no shares)
  row('h','Hail Kal',0.125,0.10,0.10,{market:'0.5 Goals'}),                         // +700 at Kalshi: a 🔮 Hail Mary ($1)
  row('e','Eight Min',0.55,0.62,0.60,{book:'Novig',loadedAt:iso(NOW-8*60e3)}),      // price ages for P2
  row('f','Forty Five',0.55,0.62,0.60,{book:'Novig',loadedAt:iso(NOW-45*60e3)}),
  row('u','Unk Time',0.55,0.62,0.60,{book:'Novig',loadedAt:undefined}),
  // fixer (Los Desconfiados): a Kelly amount ending in more than half a cent ($4.3478): the board, I bet this and + Add a bet all round it DOWN to $4.34
  row('r','Kal Half',0.50,0.56,0.55),
  // fixer: a Kalshi bet whose game has started: $0 stake, so no Kalshi fit is left on it for a fill to save
  row('s','Kal Started',0.55,0.62,0.60,{gameInfo:{state:'in',startISO:iso(NOW-40*60e3),eventId:'8s',timeCT:'',detail:'',teams:[T('away','Ts'),T('home','Hs')]}})];
// ---- by hand
const ceil2=x=>Math.ceil(x*100-1e-9)/100;
const fitBy=(S,L,rate)=>{ rate=rate==null?0.07:rate; let n=Math.floor(S/L*100+1e-6); const mc=q=>q*L+ceil2(rate*q*L*(1-L)); while(n>0 && mc(n/100)>S+1e-9) n--; return {q:n/100, max:mc(n/100), buf:ceil2(rate*(n/100)*L*(1-L))}; };
const evAt=(q,p,rate)=>{ const f=(rate==null?0.07:rate)*(1-p); return ((q/p-1)-f)/(1+f); };
const mostAt=(q,eMin)=>{ let lo=0.01, hi=0.99; for(let i=0;i<60;i++){ const m=(lo+hi)/2; if(evAt(q,m)>=eMin) lo=m; else hi=m; } return lo; };
(async()=>{ const b=await chromium.launch();
  for(const W of [1280,390]){
    const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:W,height:1000}}); await ctx.clock.install({time:new Date(NOW)});
    await ctx.addInitScript(([R,d])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig, Kalshi, Polymarket US',bank:'500',cfgVer:3.03})); localStorage.setItem('mbev.cards','1'); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows:R})); }catch(e){} },[ROWS.map(r=>JSON.parse(JSON.stringify(r))),DAY]);
    const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
      if(/\/live\?/.test(u)) return r.fulfill({contentType:'application/json',body:'{"results":{}}'});
      if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
    await p.goto('http://app.test/'); await p.waitForTimeout(1300);
    const C=await p.evaluate(()=>{ const c=cfgRead(); return {bank:c.bank, kelly:c.kelly, shrink:c.shrink, eMin:c.eMin, sMin:c.sMin, sMax:c.sMax, w:c.mWeight, kal:c.fees.kalshi}; });
    if(W===1280){
      // ================= K1–K3, K6: the helper, the scope's own examples =================
      const H=await p.evaluate(()=>{ const c=cfgRead(), c10=Object.assign({},c,{fees:Object.assign({},c.fees,{kalshi:10})});
        return {a:kalshiFractionalFit(4.46,0.60,0.645,null,c), b:kalshiFractionalFit(4.50,0.60,0.645,null,c), r10:kalshiFractionalFit(4.46,0.60,0.645,null,c10),
          tiny:kalshiFractionalFit(0.005,0.60,0.645,null,c), none:kalshiFractionalFit(4.46,0.60,null,null,c),
          walk:kalshiFractionalFit(4.46,0.60,0.649,0.66,c), walkNo:kalshiFractionalFit(4.46,0.60,0.649,0.66,c,null),
          hail:kalshiFitRow({offeredProb:0.10},1,c), jm:kalshiFitRow({offeredProb:0.535},c.sMin,c), jmS:c.sMin, kfr:typeof kalshiFit, kex:typeof extrasKalshi}; });
      check('K3 by hand: budget $4.46 at a 64¢ limit (OK up to 64.5% rounded down) = 6.79 shares: 6.79 × 0.64 = 4.3456, buffer fee 7% × 6.79 × 0.64 × 0.36 = 0.1095 → $0.11, most $4.4556 (6.80 would be 4.352 + 0.11 = $4.462 > $4.46)', fitBy(4.46,0.64).q===6.79 && Math.abs(fitBy(4.46,0.64).max-4.4556)<1e-9 && fitBy(4.46,0.64).buf===0.11 && 6.80*0.64+ceil2(0.07*6.80*0.64*0.36)>4.46, fitBy(4.46,0.64));
      check('K1–K3: kalshiFractionalFit($4.46, ask 60¢, OK up to 64.5%) = 6.79 shares at 64¢, maximum cost 4.4556 (shown $4.46, not over the budget), buffer fee $0.11, budget kept at $4.46', H.a && H.a.shares===6.79 && H.a.limitCents===64 && H.a.limit===0.64 && Math.abs(H.a.maximumCost-4.4556)<1e-9 && ceil2(H.a.maximumCost)===4.46 && H.a.budgetCheckFee===0.11 && H.a.budget===4.46 && H.a.roundingPolicy==='ceil-fee-to-cent-v1' && H.a.evFeePolicy==='smooth-curve-v1', H.a);
      check('K3: budget $4.50 at 64¢ = 6.84 shares (6.84 × 0.64 = 4.3776 + 0.1103 → $0.12 = $4.4976; 6.85 = 4.384 + 0.12 = $4.504 > $4.50)', H.b && H.b.shares===6.84 && Math.abs(H.b.maximumCost-4.4976)<1e-9 && fitBy(4.50,0.64).q===6.84, H.b);
      check('K3: the estimate at the current 60¢ ask uses the smooth fee, not rounded: 6.79 × 0.60 = 4.074 + 7% × 6.79 × 0.60 × 0.40 = 0.114072 → about $4.188072', Math.abs(H.a.estimatedFee-0.114072)<1e-9 && Math.abs(H.a.estimatedCurrentCost-4.188072)<1e-9, {fee:H.a.estimatedFee, cost:H.a.estimatedCurrentCost});
      check('K3: the fee rate is Settings (fees.kalshi / 100), not a hard-coded 7%: at 10%, $4.46 at 64¢ = '+fitBy(4.46,0.64,0.10).q+' shares (by hand)', H.r10 && H.r10.shares===fitBy(4.46,0.64,0.10).q && H.r10.shares===6.71 /* 6.71 × 0.64 = 4.2944 + 10% × 6.71 × 0.64 × 0.36 = 0.1546 → 0.16 = $4.4544; 6.72 = $4.4608 */ && C.kal===7, {r10:H.r10&&H.r10.shares, byHand:fitBy(4.46,0.64,0.10).q, kal:C.kal});
      check('K3: no fit when the budget is under 0.01 shares or there is no limit', H.tiny===null && H.none===null, {tiny:H.tiny, none:H.none});
      { const at64=evAt(0.66,0.64), at63=evAt(0.66,0.63);   // her chance 66%: by hand EV at 64¢ and 63¢
        const L=(()=>{ let l=64; while(l>=1 && evAt(0.66,l/100)<C.eMin-1e-9) l--; return l; })();
        check('K4: the limit walks down 1¢ at a time while her EV at the limit (smooth fee) is under the floor: her chance 66%, max limit 64.9¢ → '+L+'¢ by hand (EV at 64¢ '+(at64*100).toFixed(2)+'%, at 63¢ '+(at63*100).toFixed(2)+'%, floor '+(C.eMin*100).toFixed(1)+'%); with floor null it stays at 64¢', H.walk && H.walk.limitCents===L && H.walk.limitActNet>=C.eMin-1e-9 && H.walkNo && H.walkNo.limitCents===64 && Math.abs(H.walk.limitActNet-evAt(0.66,L/100))<1e-9 && Math.abs(H.walk.currentActNet-evAt(0.66,0.60))<1e-9, {walk:H.walk&&[H.walk.limitCents,H.walk.limitActNet,H.walk.shares], L, walkNo:H.walkNo&&H.walkNo.limitCents}); }
      check('K6: a 🔮 Hail Mary at 10¢ with its $1 cap = 9.40 shares at 10¢ (9.40 × 0.10 = 0.94 + 0.0592 → $0.06 = $1.00; 9.41 = $1.001), no longer 9 whole contracts', H.hail && H.hail.shares===9.4 && H.hail.limitCents===10 && fitBy(1,0.10).q===9.4 && Math.abs(H.hail.maximumCost-1)<1e-9, H.hail);
      check('K6: 🍀 Just missed at 53.5¢ with the smallest bet ($'+H.jmS.toFixed(2)+') as the budget = '+fitBy(H.jmS,0.54).q+' shares at 54¢ (the ask rounded up so it can fill; it does not clear the floor, so no OK up to), not "at least 1 contract"', H.jm && H.jm.limitCents===54 && H.jm.shares===fitBy(H.jmS,0.54).q && H.jm.budget===+H.jmS.toFixed(2), H.jm);
      check('K6: one helper: kalshiFit and extrasKalshi (whole contracts) are gone', H.kfr==='undefined' && H.kex==='undefined', {kalshiFit:H.kfr, extrasKalshi:H.kex});
      // ================= K1, K4, K5: the board row =================
      const R=await p.evaluate(()=>{ const r=lastRows.find(x=>x.apiKey==='k'), P=lastRows.find(x=>x.apiKey==='p'), N=lastRows.find(x=>x.apiKey==='n');
        return {stake:r.stake, n:r.contracts, fee:r.fee, act:r.actNet, actP:r.actProb, pass:r.pass, capBy:r.capBy, flags:(r.flags||[]).map(f=>f[1]), fit:r.kalshiFit, mx:maxPriceFor(okProbR(r),r.book,cfgRead().eMin),
          poly:{stake:P.stake, n:P.contracts}, nov:{stake:N.stake, n:N.contracts===undefined?null:N.contracts}}; });
      const act=Math.min(0.62, 0.60+C.w*(0.62-0.60)), ev=evAt(act,0.55), kel=Math.floor(Math.min(C.sMax, C.bank*C.kelly*(ev*C.shrink)/(1/0.55-1))*100+1e-6)/100 /* fixer: the budget is rounded DOWN to the cent */, L=Math.floor(mostAt(act,C.eMin)*100+1e-9)/100, F=fitBy(kel,L);
      check('K1 by hand: her chance = min(62%, 60% + 0.35 × 2) = 60.7%; EV at 55¢ on the smooth fee (7% × 0.45 = 3.15%) = +'+(ev*100).toFixed(2)+'%; Kelly budget $'+kel.toFixed(2)+'; OK up to → '+Math.round(L*100)+'¢; '+F.q+' shares, most $'+F.max.toFixed(4), Math.abs(act-0.607)<1e-12 && Math.abs(ev-0.069927)<1e-5 && F.q>0, {act, ev, kel, L, F});
      check('K1: the board stake is the cash budget (the Kelly $'+kel.toFixed(2)+', not cut to whole contracts) and the row holds '+F.q+' shares', R.pass && R.stake===kel && R.n===F.q && R.fit && R.fit.limit===L && R.fit.budget===kel, R);
      check('K4: EV and the fee on the row stay on the smooth fee (fee 3.15%, her EV +'+(ev*100).toFixed(2)+'%): no recompute from the rounded fee, no "after Kalshi fee rounding" flag, no whole-contracts minimum rule, no "exchange" cap label', Math.abs(R.fee-0.0315)<1e-12 && Math.abs(R.act-ev)<1e-9 && !R.flags.some(f=>/fee rounding|whole contracts/.test(f)) && R.capBy!=='exchange', {fee:R.fee, act:R.act, flags:R.flags, capBy:R.capBy});
      check('K10: Polymarket US keeps whole shares from the stake (floor(stake ÷ price)); Novig has none', R.poly.stake>0 && R.poly.n===Math.floor(R.poly.stake/0.55) && R.nov.n===null, {poly:R.poly, nov:R.nov});
      // ================= K5: a budget that whole contracts left under the minimum =================
      const K5=await p.evaluate(()=>{ const c=Object.assign({},cfgRead(),{sMin:2.5}); return kalshiFitRow({offeredProb:0.67, fairProb:0.75, mktProb:0.75},2.5,c); });
      check('K5: $2.50 at 67¢ (the old "3 × $0.67 = $2.06, under the minimum — skip" case) is now '+fitBy(2.5,(K5&&K5.limit)||0.67).q+' shares inside $2.50 at the limit, a bet', K5 && K5.budget===2.5 && K5.shares===fitBy(2.5,K5.limit).q && K5.maximumCost<=2.5+1e-9 && K5.shares>3, K5);
      // ================= K7: card, strip and Why this play? =================
      const findCard=async(name)=>{ const n=await p.evaluate(()=>document.querySelectorAll('#modeBar button').length); for(let i=0;i<Math.max(1,n);i++){ await p.evaluate(i=>{ const bt=document.querySelectorAll('#modeBar button')[i]; if(bt) bt.click(); }, i); await p.waitForTimeout(200);
          const ok=await p.evaluate(nm=>{ const c=[...document.querySelectorAll('#placeCards .sc-card')].find(x=>x.textContent.includes(nm)); if(!c) return false; const d=c.querySelector('details.sc-why'); if(d) d.open=true; return true; }, name); if(ok) return true; } return false; };
      await findCard('Kal Kelly');
      const K=await p.evaluate(()=>{ const c=[...document.querySelectorAll('#placeCards .sc-card')].find(x=>x.textContent.includes('Kal Kelly')); if(!c) return null; const t=e=>e?e.innerText.replace(/\s+/g,' ').trim():null;
        return {money:t(c.querySelector('.sc-money')), line:t(c.querySelector('.sc-kx')), how:t(c.querySelector('.kx-how')), buf:t(c.querySelector('.kx-buf')), why:t(c.querySelector('.sc-kfee')), all:c.innerText.replace(/\s+/g,' '),
          inStrip:!!c.querySelector('.kx-how .sc-kfee'), loose:!!c.querySelector('.sc-why-b > .sc-kfee')}; });
      const maxS=ceil2(F.max).toFixed(2), estS=ceil2(F.q*0.55+0.07*F.q*0.55*0.45).toFixed(2);
      check('K7: the card money line says BET $'+kel.toFixed(2)+' (the budget) and "back $'+F.q.toFixed(2)+'" (Kalshi pays $1 a share: the same shares as the strip)', K && new RegExp('^\\$'+kel.toFixed(2)+' ?wins \\$'+(F.q-kel).toFixed(2)+' · back \\$'+F.q.toFixed(2)).test(K.money||''), K&&K.money);
      check('K7: the card line: On Kalshi YES · Shares '+F.q.toFixed(2)+' · Limit '+Math.round(L*100)+'¢ · Max cost $'+maxS, K && (K.line||'').toLowerCase()==='on kalshi yes shares '+F.q.toFixed(2)+' limit '+Math.round(L*100)+'¢ max cost $'+maxS, K&&K.line);
      check('K7: the strip: Shares '+F.q.toFixed(2)+' (not '+kel.toFixed(2)+': that is dollars, the most it can cost) · Limit price '+Math.round(L*100)+'¢ (the maximum) · Maximum cost $'+maxS+' (≤ the budget) · At the current 55¢ ask about $'+estS, K && new RegExp('2 · Shares '+F.q.toFixed(2)+' not '+kel.toFixed(2)+': that is dollars, the most it can cost').test(K.how||'') && new RegExp('3 · Limit price '+Math.round(L*100)+'¢ the maximum').test(K.how||'') && (K.how||'').includes('Maximum cost $'+maxS+' At the current 55¢ ask about $'+estS) && +maxS<=kel+1e-9, K&&K.how);
      check('K3/K7: the strip labels the cent rounding as a sizing safety buffer, and never says "Kalshi fee charged"', K && K.buf==='Order-cost safety buffer: fee rounded up to the next cent for sizing only (Kalshi’s own rounding unverified; one taker order showed no round-up)' && !/Kalshi fee charged/i.test(K.all), K&&K.buf);
      check('K7: Why this play? has the one fee line', K && K.why==='Kalshi EV uses the published smooth fee curve. Order size keeps a ≤1¢ safety buffer. Fractional fees checked on one taker order; Kalshi’s exact rounding is unverified.', K&&K.why);
      check('K7: no "contracts" wording for Kalshi on its card', K && !/contract/i.test(K.all), null);
      check('K7 (fixer): the fee line sits inside the "On Kalshi, enter" strip, under the buffer note (on its own it took the strip\'s place in the two columns on a computer)', K && K.inStrip && !K.loose, K&&{inStrip:K.inStrip, loose:K.loose});
      // ================= K6: the bet form (I bet this) =================
      await p.evaluate(()=>{ const c=[...document.querySelectorAll('#placeCards .sc-card')].find(x=>x.textContent.includes('Kal Kelly')); (c.querySelector('.bet-btn')||c.querySelector('button')).click(); }); await p.waitForTimeout(400);
      const rec=await p.evaluate(()=>{ const e=document.querySelector('.editor .eb-rec'); return e?e.textContent:null; });
      check('K6: I bet this says the same: "recommended at this price: $'+kel.toFixed(2)+' · '+F.q.toFixed(2)+' shares at a limit of '+Math.round(L*100)+'¢ (most it can cost $'+maxS+', about $'+estS+' at 55¢)"', rec==='recommended at this price: $'+kel.toFixed(2)+' · '+F.q.toFixed(2)+' shares at a limit of '+Math.round(L*100)+'¢ (most it can cost $'+maxS+', about $'+estS+' at 55¢)', rec);   // fixer: + "about $Y at P¢" (the Cost box)
      // fixer (Los Desconfiados, must-fix): the form's own boxes show that order: Max payout = its shares (Kalshi pays $1 a share), Cost = about what they cost at 55¢
      const box=()=>p.evaluate(()=>{ const e=document.querySelector('.editor'), v=c=>(e.querySelector(c)||{}).value; return {cost:v('.eb-cost'), win:v('.eb-win'), pct:v('.eb-pct')}; });
      const B0=await box();
      check('K6 (fixer): the form\'s Max payout box shows the same '+F.q.toFixed(2)+' shares, and Cost about $'+estS+' (what they cost at the 55¢ ask), not $'+kel.toFixed(2)+' spent at 55¢ (that was '+(Math.floor(kel/(0.55*1.0315)*100+1e-6)/100).toFixed(2)+' shares)', B0.win===F.q.toFixed(2) && B0.cost===estS, B0);
      await p.evaluate(()=>{ const s=document.querySelector('.editor .eb-book'); s.value='Novig'; s.dispatchEvent(new Event('change',{bubbles:true})); }); await p.waitForTimeout(250); const B1=await box();
      await p.evaluate(()=>{ const s=document.querySelector('.editor .eb-book'); s.value='Kalshi'; s.dispatchEvent(new Event('change',{bubbles:true})); }); await p.waitForTimeout(250); const B2=await box();
      check('K10 (fixer): another book in the form puts the card\'s $'+kel.toFixed(2)+' back in Cost; back on Kalshi, the order again', B1.cost===kel.toFixed(2) && B2.cost===estS && B2.win===F.q.toFixed(2), {B1, B2});
      const FS=await p.evaluate(()=>new Promise(res=>{ document.querySelector('.editor .eb-save').click(); setTimeout(()=>{ const L=logged[logged.length-1]; res(L?{stake:L.stake, odds:L.odds, k:L.snap.kalshiFee}:null); },400); }));
      check('K8 (fixer): saved from the form unchanged: $'+estS+' at 55¢ (−122), and snap.kalshiFee keeps the '+F.q+' shares at '+Math.round(L*100)+'¢ the form showed (worked out again from $'+estS+' it would say '+fitBy(+estS,L).q+')', FS && FS.stake===+estS && FS.odds==='-122' && FS.k && FS.k.shares===F.q && FS.k.limit===L && fitBy(+estS,L).q!==F.q, FS);
      await p.evaluate(()=>{ logged.splice(0); saveLog(); refresh(); }); await p.waitForTimeout(400);
      // fixer: another line in the form (2.5 instead of 1.5) has no recommended order: the boxes go back to the card's budget, and the bet saved there keeps its own fit, not the card's
      await findCard('Kal Kelly'); await p.evaluate(()=>{ const c=[...document.querySelectorAll('#placeCards .sc-card')].find(x=>x.textContent.includes('Kal Kelly')); (c.querySelector('.bet-btn')||c.querySelector('button')).click(); }); await p.waitForTimeout(400);
      await p.evaluate(()=>{ const l=document.querySelector('.editor .eb-line'); l.value='2.5'; l.dispatchEvent(new Event('input',{bubbles:true})); }); await p.waitForTimeout(250); const BM=await box();
      const MS=await p.evaluate(()=>new Promise(res=>{ const s=document.querySelector('.editor .eb-save'); s.click(); setTimeout(()=>{ const s2=document.querySelector('.editor .eb-save'); if(s2) s2.click(); setTimeout(()=>{ const L=logged[logged.length-1]; res(L?{market:L.market, stake:L.stake, k:L.snap.kalshiFee}:null); },400); },300); }));
      const mF=fitBy(kel,0.55);   // no chance for the new line: the limit is the 55¢ ask itself
      check('K6/K8 (fixer): on another line (2.5) Cost goes back to the card\'s $'+kel.toFixed(2)+' with no shares line; saved there, snap.kalshiFee is its own '+mF.q+' shares at 55¢, not the card\'s '+F.q+' at '+Math.round(L*100)+'¢', BM.cost===kel.toFixed(2) && MS && MS.market==='2.5 Shots On Goal' && MS.stake===kel && MS.k && MS.k.shares===mF.q && MS.k.limit===0.55, {BM, MS});
      await p.evaluate(()=>{ logged.splice(0); saveLog(); refresh(); }); await p.waitForTimeout(400);
      // + Add a bet's ask panel (abStake)
      const AB=await p.evaluate(()=>{ const a=abStake({fair:0.62, mkt:0.60, p:0.55, fee:feeRate('Kalshi',0.55,cfgRead().fees), book:'Kalshi', game:'X @ Y'}), m=abStake({fair:0.62, mkt:0.60, p:0.55, fee:feeRate('Kalshi',0.55,cfgRead().fees), book:'Kalshi', game:'X @ Y', make:true});
        return {s:a.s, n:a.n, lim:a.kal&&a.kal.limitCents, ms:m.s, mn:m.n, mlim:m.kal&&m.kal.limitCents}; });
      check('K6: + Add a bet sizes Kalshi the same way: $'+kel.toFixed(2)+' → '+F.q.toFixed(2)+' shares at '+Math.round(L*100)+'¢; a Make at its own 55¢ price → '+fitBy(AB.ms,0.55).q+' shares at 55¢', AB.s===kel && AB.n===F.q && AB.lim===Math.round(L*100) && AB.mn===fitBy(AB.ms,0.55).q && AB.mlim===55, AB);
      // fixer (Los Desconfiados): a Kelly amount ending in more than half a cent: one rounding (down) on the board, in I bet this and in + Add a bet
      { const hq=Math.min(0.56, 0.55+C.w*(0.56-0.55)), hk=Math.min(C.sMax, C.bank*C.kelly*(evAt(hq,0.50)*C.shrink)/(1/0.50-1)), hkel=Math.floor(hk*100+1e-6)/100, hL=Math.floor(mostAt(hq,C.eMin)*100+1e-9)/100, hF=fitBy(hkel,hL);
        const RH=await p.evaluate(()=>{ const r=lastRows.find(x=>x.apiKey==='r'), a=abStake({fair:0.56, mkt:0.55, p:0.50, fee:feeRate('Kalshi',0.50,cfgRead().fees), book:'Kalshi', game:'Q @ R'}); return {stake:r.stake, n:r.contracts, ab:a.s, abn:a.n}; });
        await findCard('Kal Half'); await p.evaluate(()=>{ const c=[...document.querySelectorAll('#placeCards .sc-card')].find(x=>x.textContent.includes('Kal Half')); (c.querySelector('.bet-btn')||c.querySelector('button')).click(); }); await p.waitForTimeout(400);
        const recH=await p.evaluate(()=>{ const e=document.querySelector('.editor .eb-rec'), t=e?e.textContent:null, x=document.querySelector('.editor .eb-cancel'); if(x) x.click(); return t; }); await p.waitForTimeout(200);
        check('K6 (fixer): Kelly $'+hk.toFixed(4)+' (over half a cent) → $'+hkel.toFixed(2)+' and '+hF.q+' shares at '+Math.round(hL*100)+'¢ on the board, in I bet this and in + Add a bet alike (rounded down, never over the Kelly amount; the board rounded to $'+hk.toFixed(2)+')', hk*100-Math.floor(hk*100)>=0.5 && hkel<=hk && RH.stake===hkel && RH.n===hF.q && RH.ab===hkel && RH.abn===hF.q && (recH||'').startsWith('recommended at this price: $'+hkel.toFixed(2)+' · '+hF.q.toFixed(2)+' shares at a limit of '+Math.round(hL*100)+'¢'), {hk, hkel, hF, RH, recH}); }
      // ================= K8: the saved bet =================
      const SV=await p.evaluate(()=>{ const n0=logged.length; addToLog(lastRows.find(x=>x.apiKey==='k')); const k=logged[logged.length-1]; addToLog(lastRows.find(x=>x.apiKey==='p')); const pl=logged[logged.length-1]; addToLog(lastRows.find(x=>x.apiKey==='n')); const nv=logged[logged.length-1];
        const st=JSON.parse(localStorage.getItem('mbev.log')||'[]'), ks=st.find(x=>x.id===k.id);
        return {k:k.snap.kalshiFee, stake:k.stake, stored:ks&&ks.snap&&ks.snap.kalshiFee, poly:pl.snap.kalshiFee===undefined, nov:nv.snap.kalshiFee===undefined, n:logged.length-n0}; });
      const estFee=+(0.07*F.q*0.55*0.45).toFixed(4);
      check('K8: a saved Kalshi bet carries snap.kalshiFee = {evFeePolicy smooth-curve-v1, sizingBufferPolicy ceil-fee-to-cent-v1, shares '+F.q+', limit '+L+', estimatedFee '+estFee+' (smooth, at the 55¢ ask), budgetCheckFee '+F.buf+' (rounded, at the limit), evidence one_fractional_taker_order}, in storage too', SV.n===3 && SV.stake===kel && SV.k && SV.k.evFeePolicy==='smooth-curve-v1' && SV.k.sizingBufferPolicy==='ceil-fee-to-cent-v1' && SV.k.shares===F.q && SV.k.limit===L && SV.k.estimatedFee===estFee && SV.k.budgetCheckFee===F.buf && SV.k.evidence==='one_fractional_taker_order' && JSON.stringify(SV.stored)===JSON.stringify(SV.k), SV);
      check('K8/K10: Polymarket US and Novig bets get no kalshiFee', SV.poly && SV.nov, SV);
      // fixer (Los Desconfiados, must-fix): a Kalshi fit is kept only while the row's stake uses it; a fill saves the board's fit only then; a Make fill saves none
      const ST=await p.evaluate(()=>{ const s=lastRows.find(x=>x.apiKey==='s'), k=lastRows.find(x=>x.apiKey==='k'), o={sStake:s.stake, sFit:!!s.kalshiFit, kFit:!!k.kalshiFit};
        autoAddFromRow(s,{book:'kalshi',id:'fs1',price:0.55,cost:4.90,fee:0.15,qty:9.1,ts:Date.now()}); o.sNone=logged[logged.length-1].snap.kalshiFee===undefined;
        autoAddFromRow(k,{book:'kalshi',id:'fk1',price:0.55,cost:4.91,fee:0.15,qty:8.93,ts:Date.now()}); const kk=logged[logged.length-1].snap.kalshiFee; o.kSnap=kk?{shares:kk.shares, limit:kk.limit}:null;
        autoAddFromPost({id:'pm1', name:'Make Me', sport:'NHL', market:'1.5 Shots On Goal', side:'O', team:'TM', game:'TM @ HM', kind:'prop', fair:0.62, mkt:0.60, start:new Date(Date.now()+6*3600e3).toISOString(), rungs:[{k:1,p:0.53,stake:3,qty:5}]},{book:'kalshi',id:'mf1',price:0.53,cost:2.65,fee:0.02,qty:5});
        const M=logged[logged.length-1]; o.make={made:!!M.made, none:M.snap.kalshiFee===undefined}; return o; });
      check('K8 (fixer): a Kalshi bet whose game started has $0 and no Kalshi fit left, and a fill on it saves no kalshiFee; a fill on a staked row saves the board\'s '+F.q+' shares at '+Math.round(L*100)+'¢; a Make fill (its own posted price, the maker fee) saves none', ST.sStake===0 && !ST.sFit && ST.kFit && ST.sNone && ST.kSnap && ST.kSnap.shares===F.q && ST.kSnap.limit===L && ST.make.made && ST.make.none, ST);
      // ================= K6: the Hail Mary on the board =================
      await p.evaluate(()=>{ logged.splice(0); saveLog(); setMode('clair'); }); await p.waitForTimeout(400);
      const HM=await p.evaluate(()=>{ const r=lastRows.find(x=>x.apiKey==='h'); return {tier:r.tier, xStake:r.xStake, xN:r.xContracts, fit:r.xKalshiFit&&{limit:r.xKalshiFit.limitCents, max:r.xKalshiFit.maximumCost}}; });
      const hF=fitBy(1,0.13);
      check('K6: the 🔮 Hail Mary at Kalshi 12.5¢ keeps its $1.00 and is '+hF.q+' shares at a 13¢ limit (by hand: '+hF.q+' × 0.13 + '+hF.buf.toFixed(2)+' = $'+hF.max.toFixed(4)+')', HM.tier==='hail' && HM.xStake===1 && HM.xN===hF.q && HM.fit && HM.fit.limit===13, HM);
      await findCard('Hail Kal');
      const HC=await p.evaluate(()=>{ const c=[...document.querySelectorAll('#placeCards .sc-card')].find(x=>x.textContent.includes('Hail Kal')); return c?(c.querySelector('.sc-money')||{}).textContent.replace(/\s+/g,' ').trim():null; });
      check('K7: its card says "'+hF.q.toFixed(2)+' shares · a Hail Mary", not contracts', HC && HC.includes(hF.q.toFixed(2)+' shares · a Hail Mary') && !/contract/.test(HC), HC);
      const HW=await p.evaluate(()=>{ const c=[...document.querySelectorAll('#placeCards .sc-card')].find(x=>x.textContent.includes('Hail Kal')); return c?{loose:!!c.querySelector('.sc-why-b > .sc-kfee'), strip:!!c.querySelector('.kx-how')}:null; });
      check('K7 (fixer): a Kalshi card with no strip (this Hail Mary) still has the fee line in Why this play?, on its own', HW && HW.loose && !HW.strip, HW);
      // fixer: its form shows the same 7.23 shares (Max payout), Cost about what they cost at 12.5¢, and saves that fit
      await p.evaluate(()=>{ const c=[...document.querySelectorAll('#placeCards .sc-card')].find(x=>x.textContent.includes('Hail Kal')); (c.querySelector('.bet-btn')||c.querySelector('button')).click(); }); await p.waitForTimeout(400);
      const HF=await p.evaluate(()=>{ const e=document.querySelector('.editor'), v=c=>(e.querySelector(c)||{}).value; const o={cost:v('.eb-cost'), win:v('.eb-win'), rec:(e.querySelector('.eb-rec')||{}).textContent}; const x=e.querySelector('.eb-cancel'); if(x) x.click(); return o; });
      const hEst=ceil2(hF.q*0.125+0.07*hF.q*0.125*0.875).toFixed(2);
      const hRec='a Hail Mary: $1.00 · '+hF.q.toFixed(2)+' shares at a limit of 13¢ (most it can cost $'+ceil2(hF.max).toFixed(2)+', about $'+hEst+' at 13¢)';
      check('K6 (fixer): the Hail Mary form: Max payout '+hF.q.toFixed(2)+' (the card\'s shares), Cost about $'+hEst+' at 12.5¢, and "'+hRec+'"', HF.win===hF.q.toFixed(2) && HF.cost===hEst && HF.rec===hRec, HF);
      // ================= P1: the price-move pill =================
      const MV=await p.evaluate(()=>{ const keep=window.pxMove, r=lastRows.find(x=>x.apiKey==='n'), cfg=cfgRead(), get=()=>{ const d=document.createElement('div'); d.innerHTML=placeCardHtml(r,cfg,{}); const e=d.querySelector('.sc-pill.mv'); return e?{t:e.textContent, title:e.title, cls:e.className}:null; };
        window.pxMove=()=>({dp:-0.045, df:null, mins:42, from:0.58, to:0.535}); const fell=get(); window.pxMove=()=>({dp:0.045, df:null, mins:12, from:0.535, to:0.58}); const rose=get(); window.pxMove=keep; return {fell, rose}; });
      check('P1: a fall reads "Price fell 4.5 pts" (no arrow, no minus), green class kept; the title keeps the endpoints "58.0% → 53.5% in 42 min"', MV.fell && MV.fell.t==='Price fell 4.5 pts' && /\bgood\b/.test(MV.fell.cls) && /58\.0% → 53\.5% in 42 min/.test(MV.fell.title), MV.fell);
      check('P1: a rise reads "Price rose 4.5 pts", amber class kept; title "53.5% → 58.0% in 12 min"', MV.rose && MV.rose.t==='Price rose 4.5 pts' && /\bbad\b/.test(MV.rose.cls) && /53\.5% → 58\.0% in 12 min/.test(MV.rose.title), MV.rose);
      const MK=await p.evaluate(()=>{ const keep=window.pxMove, r=lastRows.find(x=>x.apiKey==='k'), cfg=cfgRead(); window.pxMove=()=>({dp:-0.045, df:null, mins:44, from:0.645, to:0.60}); const d=document.createElement('div'); d.innerHTML=placeCardHtml(r,cfg,{}); const e=d.querySelector('.sc-pill.mv'); window.pxMove=keep; return e?{t:e.textContent, title:e.title}:null; });
      check('P1 (fixer): on a Kalshi card the title keeps one decimal too, in cents: "64.5¢ → 60.0¢", so it matches "4.5 pts" (it said 65¢ → 60¢)', MK && MK.t==='Price fell 4.5 pts' && MK.title==='The price fell: 64.5¢ → 60.0¢ in 44 min', MK);
      // ================= P2 / P3: the price-age pill =================
      const AG=await p.evaluate(()=>({j0:agePillTxt(0), j59:agePillTxt(59e3), m1:agePillTxt(60e3), m8:agePillTxt(8*60e3+30e3), m29:agePillTxt(29*60e3+59e3), m30:agePillTxt(30*60e3), h13:agePillTxt(13*3600e3), l45:ageLong(45*60e3), l1:ageLong(60e3), l22:ageLong(22e3), lh:ageLong(2*3600e3)}));
      check('P2: the words: under 1 min "Price just read"; 1 to 29 min "Price 8m old" (1m, 8m, 29m); 30 min or more "Price stale · re-check"', AG.j0==='Price just read' && AG.j59==='Price just read' && AG.m1==='Price 1m old' && AG.m8==='Price 8m old' && AG.m29==='Price 29m old' && AG.m30==='Price stale · re-check' && AG.h13==='Price stale · re-check', AG);
      check('P2: the tooltip words: "45 minutes", "1 minute", "22 seconds", "2 hours"', AG.l45==='45 minutes' && AG.l1==='1 minute' && AG.l22==='22 seconds' && AG.lh==='2 hours', AG);
      const PC=await p.evaluate(()=>{ const cfg=cfgRead(), get=k=>{ const r=lastRows.find(x=>x.apiKey===k), d=document.createElement('div'); d.innerHTML=placeCardHtml(r,cfg,{}); document.body.appendChild(d); const e=d.querySelector('.sc-pill.age'), o={t:e.textContent, title:e.title, cls:e.className, color:getComputedStyle(e).color}; d.remove(); return o; };
        const ring=k=>{ const r=lastRows.find(x=>x.apiKey===k); return (ringOf(r,cfg).checks.find(c=>c.k==='fresh')||{}).ok; };
        return {k:get('k'), e:get('e'), f:get('f'), u:get('u'), ringU:ring('u'), ringK:ring('k')}; });
      check('P2: a price read about 20 s ago: "Price just read", not amber; tooltip "Price was last read N seconds ago" (the page clock keeps running, so any number of seconds under a minute: fixer, it needed 2x and could fail on a slow run)', PC.k.t==='Price just read' && !/\b(old|unk)\b/.test(PC.k.cls) && /^Price was last read \d+ seconds? ago/.test(PC.k.title), PC.k);
      check('P2: 8 minutes: "Price 8m old", not amber; tooltip "Price was last read 8 minutes ago"', PC.e.t==='Price 8m old' && !/\bold\b/.test(PC.e.cls) && /^Price was last read 8 minutes ago/.test(PC.e.title), PC.e);
      check('P2: 45 minutes: "Price stale · re-check" with the amber .old class; tooltip "Price was last read 45 minutes ago" plus the existing Sentinels hint (Novig is an exchange)', PC.f.t==='Price stale · re-check' && /\bold\b/.test(PC.f.cls) && /^Price was last read 45 minutes ago\. Send the Sentinels for a fresh one\./.test(PC.f.title), PC.f);
      check('P2: no price time: "Price time unknown · check book", amber like a stale price (same colour as the .old pill)', PC.u.t==='Price time unknown · check book' && /\bunk\b/.test(PC.u.cls) && PC.u.color===PC.f.color && PC.u.color!==PC.k.color, {u:PC.u, f:PC.f.color, k:PC.k.color});
      check('P3: the ◎ fresh check is unchanged: an unknown price time still fails it; a 20-second-old price passes', PC.ringU===false && PC.ringK===true, {u:PC.ringU, k:PC.ringK});
      // fixer (Los Desconfiados): the Settings fee note said Kalshi rounds each fee up and the board counts whole contracts
      const SH=await p.evaluate(()=>{ const h=[...document.querySelectorAll('p.hint')].find(x=>/Kalshi runs on a curve/.test(x.textContent)); return h?h.textContent:null; });
      check('K3/K7 (fixer): the Settings fee note says Kalshi’s own rounding is unverified and the cent is a sizing buffer on 0.01 shares (no "rounds each order’s fee up", no "whole contracts")', SH && /rounding of that fee is unverified/.test(SH) && /0\.01 shares/.test(SH) && /safety buffer/.test(SH) && /EV uses the smooth curve/.test(SH) && !/whole contracts|rounds each order/.test(SH), SH&&SH.slice(0,500));
      // fixer (Los Desconfiados): at 880 px (the computer layout's narrow score column) "Price stale · re-check" stays in its column: it wraps, before "re-check"
      await p.setViewportSize({width:880,height:1000}); await p.waitForTimeout(300); await p.evaluate(()=>{ setMode('safe'); }); await p.waitForTimeout(300); await findCard('Forty Five');
      const NP=await p.evaluate(()=>{ const c=[...document.querySelectorAll('#placeCards .sc-card')].find(x=>x.textContent.includes('Forty Five')); if(!c) return null; const top=c.querySelector('.sc-top'), tr=top.getBoundingClientRect(), cs=getComputedStyle(top), e=c.querySelector('.sc-pill.age'), r=e.getBoundingClientRect();
        return {t:e.textContent, right:Math.round(r.right), colRight:Math.round(tr.right-parseFloat(cs.paddingRight)), h:Math.round(r.height), items:e.children.length, ws:getComputedStyle(e).whiteSpace}; });
      check('P2 (fixer): at 880 px "Price stale · re-check" wraps inside the score column (it ran 18 to 34 px into the next one), the dot and one line of words', NP && NP.t==='Price stale · re-check' && NP.right<=NP.colRight+1 && NP.ws==='normal' && NP.items===2 && NP.h<56, NP);
    } else {
      // 390 px: the Kalshi card and its strip stay inside the card; the unknown-age pill too; no sideways scroll
      const n=await p.evaluate(()=>document.querySelectorAll('#modeBar button').length); const seen={};
      for(let i=0;i<Math.max(1,n);i++){ await p.evaluate(i=>{ const bt=document.querySelectorAll('#modeBar button')[i]; if(bt) bt.click(); }, i); await p.waitForTimeout(200);
        Object.assign(seen, await p.evaluate(()=>{ const o={}; document.querySelectorAll('#placeCards .sc-card').forEach(c=>{ const d=c.querySelector('details.sc-why'); if(d) d.open=true; const cr=c.getBoundingClientRect();
          const inside=[...c.querySelectorAll('.kx-how, .kx-buf, .sc-kfee, .sc-kx, .sc-pill.age')].every(e=>{ const r=e.getBoundingClientRect(); return !r.width || (r.left>=cr.left-1 && r.right<=cr.right+1); });
          const nm=(c.textContent.match(/(Kal Kelly|Unk Time|Forty Five|Eight Min)/)||[])[1]; if(nm) o[nm]=inside; }); return o; })); }
      check('390 px: the Kalshi strip, its buffer line, the fee line and the age pills stay inside their cards', Object.keys(seen).length>=2 && Object.values(seen).every(Boolean), seen);
      check('390 px: no sideways scroll', await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    }
    check(W+' px: no page errors', !errs.length, errs); await ctx.close(); }
  await b.close(); console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(fail?1:0); })();
