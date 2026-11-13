// node tests/v490-test.js — v4.90 (agreed with Sally 11/13, owner "BUILD"): Reports step 2. Breakdowns, the price paid all in (never a
// forecast; Sally's ten checks), the profit line, month tiles, Best / Worst behind the sample gates.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,700)); };
const NOW=Date.parse('2026-11-13T19:00:00Z');
const bet=(id,o)=>Object.assign({id,key:id,sport:'NBA',kind:'prop',book:'DraftKings',stake:2,date:'2026-11-10',dateSet:true,game:'BOS @ NYK',team:'MSC',name:'P '+id,side:'O',market:'1.5 Threes',odds:'-110',start:'2026-11-11T00:00:00Z',result:'win',gradedBy:'espn',snap:{at:'2026-11-10T18:00:00Z', act:0.6}},o);
const LOG=[
  bet('k1',{book:'Kalshi', name:'Fee In', odds:'-113', fillCost:5.30, fillQty:10, stake:5.30, autoFrom:'kalshi', fee:0.02}),   // the cost holds the fee: 53.0%, never 53% + fee
  bet('k2',{book:'Kalshi', name:'Fee On Top', odds:'-113', fee:0.02, stake:2}),   // no fill: the price 53.05% + 2% fee, once
  bet('k3',{book:'Kalshi', name:'Partial', odds:'-120', fillCost:2.20, fillQty:4, stake:2.20, autoFrom:'kalshi'}),   // 4 of 10 shares filled: 55%
  bet('s1',{name:'Plain Odds', odds:'-110'}),
  bet('s2',{name:'Saved Payout', odds:'-110', towin:1.82}),   // same economics: 2 ÷ 3.82
  bet('s3',{name:'Boosted', odds:'-110', towin:3}),   // a boost: 2 ÷ 5 = 40.0%, the 40–<50 band (half-open)
  bet('b1',{name:'Edge Fifty', odds:'+100'}), bet('b2',{name:'Edge Sixty', odds:'-150', result:'loss'}), bet('b3',{name:'Edge Seventy', book:'Novig', fillCost:7, fillQty:10, stake:7, autoFrom:'novig'}),
  bet('u1',{name:'Parlay', kind:'parlay', odds:'+600', parlay:{legs:3}, result:'loss'}), bet('u2',{name:'No Price', odds:''}),
  bet('oct',{name:'October', date:'2026-10-20', start:'2026-10-21T00:00:00Z', team:'MIA', game:'MIA @ ORL', result:'loss'})];
// Best / Worst: BOS 22 tickets on 11 games (ranked); LAL 12 tickets, 6 outcomes (listed, not ranked); PHX 3 tickets (too few)
for(let i=0;i<22;i++) LOG.push(bet('bos'+i,{name:'Bos Player '+i, team:'BOS', game:'BOS @ G'+(i%11), date:'2026-11-0'+(1+(i%11)%9), start:'2026-11-0'+(1+(i%11)%9)+'T23:00:00Z', snap:{at:'2026-11-01T12:00:00Z', act:0.6}, result:i%3?'win':'loss', stake:1}));
for(let i=0;i<12;i++) LOG.push(bet('lal'+i,{name:'Lal Player '+(i%6), team:'LAL', game:'LAL @ G'+(i%6), result:i%2?'win':'loss', stake:1, odds:'+100'}));
for(let i=0;i<3;i++) LOG.push(bet('phx'+i,{name:'Phx Player', team:'PHX', game:'PHX @ DEN', result:'win', stake:1}));
(async()=>{ const b=await chromium.launch();
  const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:1280,height:1000}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(L=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.log',JSON.stringify(L)); }catch(e){} }, LOG);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1300);
  const E=await p.evaluate(()=>{ const by=id=>logged.find(x=>x.id===id), e=id=>{ const x=entryPInfo(by(id)); return x?{p:+x.p.toFixed(4), src:x.src}:null; };
    return {k1:e('k1'), k2:e('k2'), k3:e('k3'), s1:e('s1'), s2:e('s2'), s3:e('s3'), band:['s3','b1','b2','b3','u1','u2'].map(i=>rpPxBand(by(i)))}; });
  check('1. Kalshi fill whose cost holds the fee: 5.30 ÷ 10 = 53.0%, no second fee', E.k1.p===0.53 && E.k1.src==='fill_cost_includes_fee', E.k1);
  check('2. Kalshi with no fill: the price plus the 2% fee, once (53.05% × 1.02)', Math.abs(E.k2.p-0.5305*1.02)<0.0005 && E.k2.src==='paid_odds', E.k2);
  check('3. a partial fill uses the filled shares only (2.20 ÷ 4 = 55%)', E.k3.p===0.55, E.k3);
  check('4. ordinary −110 and the saved payout agree (52.4%)', Math.abs(E.s1.p-E.s2.p)<0.001 && E.s2.src==='stake_to_win', {s1:E.s1, s2:E.s2});
  check('5. a boost (to win $3 on $2) lands in its true band: 40.0%, 40–<50', E.s3.p===0.4 && E.band[0]==='p2', E.s3);
  check('6. exact edges are half-open: 40% → 40–<50, 50% → 50–<60, 60% → 60–<70, 70% → 70%+', E.band.slice(0,4).join(',')==='p2,p3,p4,p5', E.band);
  check('9. a parlay and a bet with no price stay Unknown', E.band[4]==='u' && E.band[5]==='u', E.band);
  await p.evaluate(()=>{ document.querySelector('.tab[data-view="v-reports"]').click(); }); await p.waitForTimeout(300);
  await p.evaluate(()=>{ RP.per='all'; RP.f={}; RP.by='price'; RP.px='chance'; rpRender(); });
  const rows=async()=>p.evaluate(()=>[...document.querySelectorAll('#rpBreak tbody tr')].map(r=>({k:r.children[0].textContent, n:+r.children[1].textContent, pr:r.children[5].textContent})));
  const ch=await rows(); await p.evaluate(()=>{ RP.px='american'; rpRender(); }); const am=await rows();
  const tot=await p.evaluate(()=>+document.querySelector('#rpHead .rp-k strong').textContent);
  const sum=a=>a.reduce((t,x)=>t+x.n,0);
  check('7. both price views hold every ticket once (same total as the headline) and are labelled "not a forecast"', sum(ch)===tot && sum(am)===tot && await p.evaluate(()=>/Price paid · all-in break-even chance · not a forecast/.test(document.getElementById('rpBreak').textContent)), {ch:sum(ch), am:sum(am), tot});
  const fc=await p.evaluate(()=>{ const out={}; Object.keys(RP_ODDS).concat(['u']).forEach(k=>{ RP.f={odds:k}; out[k]=rpSet().L.length; }); RP.f={}; return out; });
  const amMap=Object.fromEntries(am.map(r=>[r.k,r.n]));
  check('8. the odds filter and the American view put every ticket in the same range', await p.evaluate(([fc,amMap])=>Object.keys(RP_ODDS).every(k=>(fc[k]||0)===(amMap[RP_ODDS[k]]||0)) && fc.u===(amMap[RP_PX.u]||0), [fc,amMap]), {fc, amMap});
  const cal=await p.evaluate(()=>{ const a=calibrationPoints(logged).length; RP.by='price'; rpRender(); return a===calibrationPoints(logged).length && !String(calibrationPoints).includes('entryP'); });
  check('10. price bands never enter calibration (or expected wins, Brier, the Scorecard)', cal && await p.evaluate(()=>!String(scoreSet).includes('entryP')), cal);
  // breakdown by sport adds up
  await p.evaluate(()=>{ RP.by='sport'; rpRender(); }); const sp=await rows();
  check('by sport: the rows add up to the headline tickets, with outcomes and a sample label', sum(sp)===tot && await p.evaluate(()=>document.querySelectorAll('#rpBreak thead th').length===8), sp);
  // chart and months
  const cm=await p.evaluate(()=>({svg:!!document.querySelector('#rpChart svg polyline'), cap:(document.querySelector('#rpChart figcaption')||{}).textContent||'', prof:[...document.querySelectorAll('#rpHead .rp-k')].find(k=>k.children[0].textContent==='Settled profit').children[1].textContent, mo:[...document.querySelectorAll('#rpMonths .rp-mo span')].map(x=>x.textContent)}));
  check('the profit line ends at the settled profit; open bets do not move it', cm.svg && cm.cap.includes('now '+cm.prof) && /open bets do not move it/.test(cm.cap), cm);
  check('month tiles in All: Oct 26 and Nov 26', cm.mo.join(',')==='Oct 26,Nov 26', cm.mo);
  await p.evaluate(()=>{ document.querySelector('#rpMonths [data-mo="2026-10"]').click(); }); const lab=await p.evaluate(()=>document.getElementById('rpLabel').textContent);
  check('a month tile opens that month', lab==='October 2026', lab);
  // best / worst
  await p.evaluate(()=>{ RP.per='all'; RP.bwWho='teams'; RP.bwDir='best'; RP.small=false; rpRender(); });
  const bw=async()=>p.evaluate(()=>({rows:[...document.querySelectorAll('#rpBw tbody tr')].map(r=>r.children[0].textContent), note:[...document.querySelectorAll('#rpBw p')].map(x=>x.textContent).join(' ')}));
  const b1=await bw();
  check('Best teams, default: only BOS is ranked (22 tickets, 22 outcomes, 11 games); the others are counted in a note', b1.rows.length===1 && /^BOS22 tickets · 22 unique outcomes · 11 games$/.test(b1.rows[0]) && /fewer settled bets than that\. Tick "Show small samples"/.test(b1.note), b1);
  await p.evaluate(()=>{ document.getElementById('rpSmall').click(); }); const b2=await bw();
  const sm=await p.evaluate(()=>[...document.querySelectorAll('#rpBw tbody tr')].map(r=>r.children[0].textContent+'|'+r.children[4].textContent));
  check('Show small samples: LAL (12 tickets, 6 outcomes) and PHX (3 tickets) appear, each "too few to rank" (under 10 outcomes)', sm.some(x=>/^LAL12 tickets · 6 unique outcomes · 6 games\|too few to rank$/.test(x)) && sm.some(x=>/^PHX.*\|too few to rank$/.test(x)), sm);
  check('repeated tickets count once as outcomes: PHX 3 tickets · 1 unique outcome · 1 game', b2.rows.some(r=>/^PHX3 tickets · 1 unique outcome · 1 game$/.test(r)), b2.rows);
  await p.evaluate(()=>{ document.querySelector('#rpBwDir [data-d="worst"]').click(); }); const w=await p.evaluate(()=>[...document.querySelectorAll('#rpBw tbody tr td:nth-child(3)')].map(x=>x.textContent));
  const nums=w.map(t=>(t[0]==='−'?-1:1)*+t.replace(/[^\d.]/g,''));
  check('Worst sorts by profit, lowest first', nums.length>1 && nums.every((x,i)=>!i||x>=nums[i-1]), w);
  for(const W of [390,1000,1280,1960]){ await p.setViewportSize({width:W,height:900}); await p.waitForTimeout(150);
    const r=await p.evaluate(()=>({side:document.documentElement.scrollWidth>innerWidth, out:[...document.querySelectorAll('#rpPanel .rp-tw, #rpPanel .rp-chart, #rpPanel .rp-months, #rpPanel .rp-ctl')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).length}));
    check(W+' px: no sideways scroll, every new block inside the screen', !r.side && !r.out, r); }
  check('no page errors', !errs.length, errs);
  await b.close(); console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(fail?1:0); })();
