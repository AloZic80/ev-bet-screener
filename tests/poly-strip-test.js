// node tests/poly-strip-test.js — v4.79 (Alonzo, 11/12, the Sebastian Aho 1+ assists bet on Polymarket US: card "44.0% · OK to 47.5%, $4.61";
// Polymarket's Market order for $4.61 said "High slippage": the book had too little at 44¢, so the order kept buying higher, about 53¢ on average,
// over La Contadora's most. "so, PUT IT" / "with High Slippage?"). Every approved Polymarket US card now says what to type, like Kalshi's:
// Limit (not Market), YES or NO, the limit price = La Contadora's most in whole cents (rounded down), whole shares = stake ÷ (limit + the fee),
// and the most it can cost. What-to-type only: no stake, floor or fee changes. Every expected number is worked here by hand.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,700)); };
const NOW=Date.parse('2026-11-12T19:00:00Z'), DAY='2026-11-12', TIP=Date.parse('2026-11-13T17:00:00Z'), iso=ms=>new Date(ms).toISOString();
const T=(ha,abbr)=>({ha,id:abbr,abbr,name:abbr+' Team',loc:abbr,nick:'Team',logo:'',rec:'',color:'333333',alt:'ffffff'});
const am=p=>p>=0.5?String(Math.round(-100*p/(1-p))):'+'+Math.round(100*(1-p)/p);
const row=(id,name,team,opp,book,price,fair,mkt,o)=>Object.assign({name,team,game:team+' @ '+opp,matchup:team+' @ '+opp,side:'O',sport:'NHL',market:'0.5 Assists',kind:'prop',book,offeredRaw:am(price),offeredProb:price,fairProb:fair,fairRaw:'',mktProb:mkt,stars:4,evModel:'projection',projValue:0.8,
  gameInfo:{state:'pre',startISO:iso(TIP),eventId:'88'+id,timeCT:'',detail:'',teams:[T('away',team),T('home',opp)]},src:'api:NHL:props',apiKey:id,loadedAt:iso(NOW-60e3)},o||{});
// La Contadora by hand: Aho, model 56%, market 47%: min(0.56, 0.47 + 0.35 × 0.09) = 50.15% (🪙 Volado). Polymarket US fee 6.95% × (1 − price).
// Her EV at 47¢: (0.5015/0.47 − 1 − 0.0695 × 0.53) / 1.03684 = +2.9%; at 48¢: +0.8%, under the 1.5% floor. So her most is between 47 and 48¢: Limit 47¢.
const ROWS=[row('aho','Sebastian Aho','CAR','SEA','Polymarket US',0.44,0.56,0.47),
  row('jar','Seth Jarvis','BOS','NYR','Polymarket US',0.45,0.60,0.50,{side:'U'}),                  // an Under: NO on "1+"
  row('kx','Quinn Hughes','VAN','PHI','Kalshi',0.53,0.60,0.57,{market:'1.5 Shots'}),               // Kalshi keeps its own line
  row('nv','Jonathan Lekkerimaki','DAL','MIN','Novig',0.519,0.5546,0.526,{market:'1.5 Shots'})];   // Novig: no what-to-type strip
const strip=(p,name)=>p.evaluate(n=>{ const c=[...document.querySelectorAll('#placeCards .sc-card')].find(x=>x.textContent.includes(n)); if(!c) return null;
  const s=c.querySelector('.sc-px'), k=c.querySelector('.sc-kx:not(.sc-px):not(.sc-xline)'), d=c.querySelector('details.sc-why'); if(d) d.open=true;
  const h=c.querySelector('.px-how'), cr=c.getBoundingClientRect(), box=e=>{ if(!e) return null; const r=e.getBoundingClientRect(); return {in:r.left>=cr.left-1 && r.right<=cr.right+1, w:Math.round(r.width), h:Math.round(r.height)}; };
  const t=e=>e?e.innerText.replace(/\s+/g,' ').trim():null;
  const out={line:t(s), kalshi:t(k), how:t(h), lineBox:box(s), howBox:box(h), boxes:h?[...h.querySelectorAll('.kx-b')].map(t):[]}; if(d) d.open=false; return out; }, name);
(async()=>{ const b=await chromium.launch();
  for(const W of [1280,390,1000,1960]){
    const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:W,height:1000}}); await ctx.clock.install({time:new Date(NOW)});
    await ctx.addInitScript(([R,d])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig, Kalshi, Polymarket',bank:'500',cfgVer:3.03})); localStorage.setItem('mbev.cards','1'); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows:R})); }catch(e){} },[ROWS,DAY]);
    const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
    await p.goto('http://app.test/'); await p.waitForTimeout(1300);
    await p.evaluate(()=>setMode('volado')); await p.waitForTimeout(300);   // every sample bet is 50 to 60% for La Contadora: 🪙 Volado
    const A=await strip(p,'Sebastian Aho');
    if(W===1280){
      const M=await p.evaluate(()=>{ const r=lastRows.find(x=>x.apiKey==='aho'), c=cfgRead(), mx=maxPriceFor(okProbR(r), r.book, c.eMin);
        return {poly:c.fees.poly, eMin:c.eMin, act:+okProbR(r).toFixed(4), mx, stake:+r.stake, pass:r.pass, k:polyHow(r,+r.stake,mx)}; });
      check('by hand: Polymarket US fee 6.95% × (1 − price); La Contadora 50.15%; her most is between 47 and 48¢', M.poly===6.95 && M.act===0.5015 && M.mx>0.47 && M.mx<0.48, M);
      const per=0.47*(1+0.0695*0.53), sh=Math.floor(M.stake/per+1e-6);
      check('the board card: Limit 47¢, whole shares = $'+M.stake.toFixed(2)+' ÷ (47¢ + fee 1.73¢) = '+sh+', the most it costs never over the stake', M.pass && M.k && M.k.lim===47 && M.k.shares===sh && M.k.cost<=M.stake+1e-9 && (sh+1)*per>M.stake && M.k.btn==='YES' && M.k.plus==='1+', M);
      check('the card line says it in Polymarket words: "On Polymarket · Limit, not Market · YES on 1+ · Limit 47¢ · Shares N · Cost ≤ $"', A && new RegExp('^On Polymarket Limit, not Market YES on 1\\+ Limit 47¢ Shares '+sh+' Cost ≤ \\$'+M.k.cost.toFixed(2)+'$','i').test(A.line||''), A&&A.line);
      check('Why this play? opened: "On Polymarket US, enter": 1 · Order type Limit · 2 · Press YES (Aho Over 0.5 Assists, “1+” on Polymarket) · 3 · Limit price 47¢ · 4 · Shares · Then check Cost ≤ / Pays', A && A.boxes.length===5 && /^1 · Order type Limit tap Market ⌄ and pick Limit\. Never Market$/.test(A.boxes[0]) && /^2 · Press YES Sebastian Aho Over 0\.5 Assists \(“1\+” on Polymarket\) in /.test(A.boxes[1]) && /^3 · Limit price 47¢ La Contadora’s most, never higher$/.test(A.boxes[2]) && new RegExp('^4 · Shares '+sh+' if it asks for dollars: \\$'+(sh*0.47).toFixed(2)+'$').test(A.boxes[3]) && new RegExp('^Then check Cost ≤ \\$'+M.k.cost.toFixed(2)+' Pays \\$'+sh.toFixed(2)+' if it wins$').test(A.boxes[4]), A&&A.boxes);
      check('it says what "High slippage" means and what to do: a Limit order buys up to 47¢ and waits; cancel it if not filled by the start', A && /“High slippage” means a Market order would pay more than the price shown: the book is thin, so it keeps buying higher\. A Limit order buys what is offered up to 47¢ and waits for the rest\. Not filled by the start\? Cancel it\./.test(A.how||''), A&&A.how);
      // Alonzo's own numbers: $4.61 at "OK to 47.5%": 9 shares at 47¢ = $4.23, about $4.39 with the fee, pays $9.00
      const O=await p.evaluate(()=>polyHow({kind:'prop', name:'Sebastian Aho', market:'0.5 Assists', side:'O'}, 4.61, 0.475));
      check('Alonzo\'s Aho slip ($4.61, OK to 47.5%): Limit 47¢, 9 shares (if it asks for dollars: $4.23), Cost ≤ $4.39, pays $9.00', O && O.lim===47 && O.shares===9 && O.amt===4.23 && O.cost===4.39 && O.payout===9 && O.btn==='YES' && O.plus==='1+', O);
      const J=await strip(p,'Seth Jarvis');
      check('an Under is NO on "1+" ("NO on the Over = the Under")', J && /^On Polymarket Limit, not Market NO on 1\+ Limit \d+¢ Shares \d+ Cost ≤ \$\d+\.\d\d$/i.test(J.line||'') && /^2 · Press NO Seth Jarvis Over 0\.5 Assists \(“1\+” on Polymarket\) \(NO on the Over = the Under\) in /.test(J.boxes[1]||''), J);
      const G=await p.evaluate(()=>polyHow({kind:'moneyline', team:'Carolina Hurricanes', name:'Carolina Hurricanes', market:'Moneyline', side:''}, 5, 0.6));
      check('a moneyline: YES on "Carolina Hurricanes wins" (or the team’s own button), no "1+"', G && G.btn==='YES' && G.what==='Carolina Hurricanes wins' && G.team===true && G.plus==='', G);
      const K=await strip(p,'Quinn Hughes'), N=await strip(p,'Jonathan Lekkerimaki');
      check('a Kalshi card keeps the Kalshi line (On Kalshi … Limit …¢) and gets no Polymarket strip', K && /^On Kalshi YES Shares [\d.]+ Limit \d+¢ Cost ≈ \$/i.test(K.kalshi||'') && K.line===null && K.how===null, K);
      check('a Novig card has no what-to-type strip', N && N.line===null && N.how===null && N.kalshi===null, N);
      const X=await p.evaluate(()=>{ const r=Object.assign({}, lastRows.find(x=>x.apiKey==='aho'), {offeredProb:0.48, offeredRaw:'+108'}); return {line:scPolyLine(r), how:polyHowHtml(r)}; });
      check('a Polymarket price over La Contadora\'s most (48¢): no strip, nothing to type', X.line==='' && X.how==='', X);
      const st=await p.evaluate(()=>lastRows.map(r=>r.apiKey+':'+(+r.stake).toFixed(2)).join(' '));
      check('stakes are untouched by the strip (each row keeps the stake the board gave it)', /aho:\d+\.\d\d/.test(st) && !/aho:0\.00/.test(st), st); }
    const over=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
    check(W+' px: the Polymarket line and its Why this play? strip sit inside the card, no sideways scroll', A && A.lineBox && A.lineBox.in && A.howBox && A.howBox.in && over<=0, {line:A&&A.lineBox, how:A&&A.howBox, over});
    if((W===1280 || W===390) && process.env.SHOT){ { await p.evaluate(()=>{ const c=[...document.querySelectorAll('#placeCards .sc-card')].find(x=>x.textContent.includes('Sebastian Aho')); const d=c&&c.querySelector('details.sc-why'); if(d) d.open=true; c&&c.scrollIntoView({block:'start'}); }); await p.waitForTimeout(200); const el=await p.$$('#placeCards .sc-card'); for(const e of el){ if((await e.textContent()).includes('Sebastian Aho')){ await e.screenshot({path:process.env.SHOT+'-'+W+'.png'}); break; } } } }
    check('no page errors ('+W+')', !errs.length, errs); await ctx.close(); }
  await b.close(); console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(fail?1:0); })();
