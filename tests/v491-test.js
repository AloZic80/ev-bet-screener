// node tests/v491-test.js — v4.91 (agreed with Sally 11/13, owner "BUILD"): Reports step 3, the edge checks. Closing line (CLV, "even" within
// 0.1 point, the value proxy, never "expected earnings"), La Contadora's expected profit vs actual, expected wins by unique outcome, the
// game-resampled range, the stage labels, and no verdict.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,700)); };
const NOW=Date.parse('2026-11-13T19:00:00Z');
const bet=(id,o)=>Object.assign({id,key:id,sport:'NBA',kind:'prop',book:'Novig',stake:2,date:'2026-11-10',dateSet:true,game:'BOS @ NYK',team:'BOS',name:'P '+id,side:'O',market:'1.5 Threes',odds:'+100',start:'2026-11-11T00:00:00Z',result:'win',gradedBy:'espn',snap:{at:'2026-11-10T18:00:00Z', act:0.6, actNet:0.05}},o);
const LOG=[
  bet('a',{name:'Beat', closing:'-125', result:'win'}),            // close 55.6% vs paid 50%: CLV +11.1%
  bet('b',{name:'Even', closing:'+100', result:'loss'}),           // CLV 0
  bet('c',{name:'Missed', closing:'+125', result:'win', game:'MIA @ ORL'}),   // close 44.4%: CLV −11.1%
  bet('d',{name:'No Close', result:'loss', game:'MIA @ ORL'}),
  bet('f',{name:'Free', free:true, closing:'-125', result:'win', game:'DAL @ HOU'}),   // in expected wins; not in expected profit; weighs 0
  bet('s',{name:'Sold', sold:{price:2.5}, game:'DAL @ HOU'}),
  bet('late',{name:'Late', snap:{at:'2026-11-11T01:00:00Z', act:0.6, actNet:0.05}, game:'DAL @ HOU'}),   // saved after the start: not judged
  bet('r1',{name:'Repeat', snap:{at:'2026-11-10T17:00:00Z', act:0.55, actNet:0.04}, game:'PHX @ DEN'}), bet('r2',{name:'Repeat', snap:{at:'2026-11-10T19:00:00Z', act:0.70, actNet:0.08}, game:'PHX @ DEN'}),   // one outcome, earliest speaks
  bet('pu',{name:'Push', result:'push', game:'PHX @ DEN'}),
  bet('pl',{name:'Parlay', kind:'parlay', odds:'+600', parlay:{legs:3}, result:'loss'})];
(async()=>{ const b=await chromium.launch();
  const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:1280,height:1000}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(L=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.log',JSON.stringify(L)); }catch(e){} }, LOG);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1300);
  await p.evaluate(()=>{ document.querySelector('.tab[data-view="v-reports"]').click(); }); await p.waitForTimeout(300);
  await p.evaluate(()=>{ RP.per='all'; RP.f={}; rpRender(); });
  const v=await p.evaluate(()=>({clv:document.getElementById('rpClv').textContent.replace(/\s+/g,' '), ks:Object.fromEntries([...document.querySelectorAll('#rpClv .rp-k')].map(k=>[k.children[0].textContent,k.children[1].textContent])),
    grp:[...document.querySelectorAll('#rpClv tbody tr')].map(r=>[...r.children].map(c=>c.textContent).join('|')), edge:document.getElementById('rpEdge').textContent.replace(/\s+/g,' ')}));
  check('closing line: 4 of the 10 settled singles have a closing price (the parlay is left out)', v.ks['With a closing price']==='4 of 10', v.ks);
  check('average CLV = mean of +11.1%, 0, −11.1%, +11.1% = +2.78%; median +5.56%', v.ks['Average CLV']==='+2.78%' && v.ks['Median CLV']==='+5.56%', v.ks);
  check('stake-weighted CLV: the free bet weighs 0 → mean of +11.1, 0, −11.1 = 0.00%', /^[+−]0\.00%$/.test(v.ks['Stake-weighted CLV']), v.ks);
  check('beat / even (within 0.1 point) / missed: 2 / 1 / 1', v.grp[0].startsWith('Beat the close|2|50.0%') && v.grp[1].startsWith('Even (within 0.1 point)|1|25.0%') && v.grp[2].startsWith('Missed the close|1|25.0%'), v.grp);
  check('the proxy is labelled "if the closing price were fair", never "expected earnings": 2×0.111 + 2×0 − 2×0.111 = $0.00', /CLV value proxy · if the closing price were fair: \$0\.00/.test(v.clv) && !/expected earnings/i.test(v.clv), v.clv.slice(0,300));
  // expected profit: eligible = a, b, c, d, r1, r2, pu (not free, sold, late, parlay) = 7 of 10
  check('expected profit: 7 of 10 settled singles eligible (free, sold and the bet saved after the start are out)', /Expected \+\$0\.\d\d · actual [+−]\$\d+\.\d\d · 7 of 10 settled singles eligible/.test(v.edge), v.edge.slice(0,260));
  const ep=await p.evaluate(()=>{ const L=['a','b','c','d','r1','r2','pu'].map(i=>logged.find(x=>x.id===i)); return {E:L.reduce((t,b)=>t+b.stake*b.snap.actNet,0), A:L.reduce((t,b)=>t+betProfit(b),0)}; });
  check('expected = Σ stake × frozen EV ($0.68), actual = Σ profit of the same bets', v.edge.includes('Expected +$'+ep.E.toFixed(2)+' · actual '+(ep.A>=0?'+':'−')+'$'+Math.abs(ep.A).toFixed(2)), ep);
  // expected wins: outcomes a,b,c,d,f,Repeat(r1 canonical) = 6; push and sold out; Σ p = 0.6×5 + 0.55 = 3.55; actual wins a,c,f,r1 = 4
  check('expected wins by unique outcome: 3.5 (0.6×5 + 0.55: the earlier Repeat ticket speaks) vs actual 4 · 6 eligible outcomes from 10 settled tickets', /Expected 3\.[56] · actual 4 · 6 eligible outcomes from 10 settled single tickets/.test(v.edge), v.edge.slice(260,600));
  check('the main range resamples whole games; the independent SD sits in a labelled detail', /95% range by game \(resampling whole games, 4 games\)/.test(v.edge) && /ignores same-game correlation; not a confidence range/.test(v.edge), v.edge.slice(0,900));
  check('stage label under 30 outcomes, and no verdict before 100', /extremely preliminary/.test(v.edge) && /No verdict before 100 eligible outcomes/.test(v.edge), null);
  for(const W of [390,1280]){ await p.setViewportSize({width:W,height:900}); await p.waitForTimeout(150);
    const r=await p.evaluate(()=>({side:document.documentElement.scrollWidth>innerWidth, out:[...document.querySelectorAll('#rpClv .rp-tw, #rpClv .rp-ks, #rpEdge .rp-box')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).length}));
    check(W+' px: no sideways scroll', !r.side && !r.out, r); }
  check('no page errors', !errs.length, errs);
  await b.close(); console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(fail?1:0); })();
