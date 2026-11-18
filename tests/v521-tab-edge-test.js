// node tests/v521-tab-edge-test.js — v5.21 (owner 11/17: "If you see that im on an Edge from all bets on ... Machin, Parejo, VOlado ... highlight"; "this is an
// ONGOING survey and go with the stats we go now ... See this as a Dev app"). Each chance tab shows how his settled single bets whose La Contadora chance (snap.act)
// falls in its range are doing so far. Ahead (profit > 0 and wins ≥ expected) = green ring, NO minimum sample; behind = a muted note; always the count. Label only.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,600)); };
const AT='2026-11-15T20:00:00Z', ST='2026-11-16T01:00:00Z';
let i=0; const bet=(act,odds,result,extra)=>Object.assign({id:'b'+(++i), kind:'prop', sport:'NBA', name:'Player '+i, market:'Points', side:'O', line:20.5, book:'Novig', stake:2, odds, result, start:ST, date:'2026-11-15', dateSet:true, snap:{act, at:AT}}, extra||{});
const LOG=[
  // Parejo (60–65%): 2 wins, 1 loss at −150 → +$1.33 +$1.33 −$2 = +$0.66; expected 0.62+0.63+0.61 = 1.86, won 2 → ahead
  bet(0.62,'-150','win'), bet(0.63,'-150','win'), bet(0.61,'-150','loss'),
  // Volado (55–60%): 1 win, 2 losses at −130 → +$1.54 −$4 = −$2.46 → behind
  bet(0.57,'-130','win'), bet(0.58,'-130','loss'), bet(0.56,'-130','loss'),
  // Dado (50–55%): one bet, a win: ahead with a single bet (no minimum sample in dev mode)
  bet(0.52,'+100','win',{closing:'-110'}),
  // ignored: open bet, parlay, a bet with no saved La Contadora chance, a void
  bet(0.62,'-150',null), {id:'p1', kind:'parlay', stake:5, result:'win', parlay:{payout:20}, snap:{act:0.62, at:AT}}, bet(null,'-150','win',{snap:{model:0.6, at:AT}}), bet(0.62,'-150','void'),
];
(async()=>{ const b=await chromium.launch(); const errs=[];
  for(const W of [390,1280]){
    const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:W,height:800}});
    await ctx.addInitScript(([L])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig',bank:'500',cfgVer:3.03})); localStorage.setItem('mbev.mode',JSON.stringify({mode:'safe'})); localStorage.setItem('mbev.log',JSON.stringify(L)); }catch(e){} },[LOG]);
    const p=await ctx.newPage(); p.on('pageerror',e=>errs.push(W+': '+e.message));
    await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
    await p.goto('http://app.test/'); await p.waitForTimeout(1500);
    await p.evaluate(()=>{ try{ tabEdgePaint(); }catch(e){} });
    const R=await p.evaluate(()=>{ const o={}; document.querySelectorAll('#modeBar button[data-mode]').forEach(b=>{ const e=b.querySelector('.mode-edge'); o[b.dataset.mode]={up:b.classList.contains('edge-up'), down:b.classList.contains('edge-down'), txt:e?e.textContent:'', tip:e?e.title:''}; }); o._stats=tabEdgeStats(logged); return o; });
    const P=R.parejo, V=R.volado, D=R.dado, S=R._stats;
    check(W+' px: Parejo (2 wins, 1 loss; +$0.66; won 2, expected 1.9) is ahead: green ring, "▲ +$1 · 3"', P.up && !P.down && /▲ \+\$1 · 3/.test(P.txt), P);
    check(W+' px: Parejo counts only its 3 settled singles (open, parlay, no-chance and void bets are left out)', S.parejo && S.parejo.n===3 && S.parejo.w===2 && Math.abs(S.parejo.exp-1.86)<1e-6 && S.parejo.profit===0.66, S.parejo);
    check(W+' px: the tip says it is a running survey with the count, the profit, ROI and wins vs expected', /So far · 3 settled bets: \+\$0\.66 \(ROI \+11\.0%\) · won 2, the math expected 1\.9/.test(P.tip) && /running survey, not proof \(dev mode\)/.test(P.tip) && /Nothing here changes a bet/.test(P.tip), P.tip);
    check(W+' px: Volado (1 win, 2 losses; −$2.46) is behind: no ring, a muted "▼ −$2 · 3"', !V.up && V.down && /▼ −\$2 · 3/.test(V.txt), V);
    check(W+' px: Dado with ONE winning bet is ahead (no minimum sample in dev mode), and its tip shows CLV', D.up && /· 1$/.test(D.txt) && /CLV/.test(D.tip), D);
    check(W+' px: tabs with no settled bets show nothing (Boring, Tranqui, Machín, Suertudo, Brujo)', ['boring','tranqui','safe','lucky','clair'].every(m=>!R[m].txt && !R[m].up && !R[m].down), ['boring','tranqui','safe','lucky','clair'].map(m=>R[m]));
    const before=await p.evaluate(()=>betMode); await p.evaluate(()=>{ try{ tabEdgePaint(); }catch(e){} });
    check(W+' px: painting the badges does not change the tab you are on', (await p.evaluate(()=>betMode))===before, before);
    if(W===390){ const ov=await p.evaluate(()=>{ const bar=document.getElementById('modeBar'); return bar? bar.scrollWidth - bar.clientWidth : 0; }); check('390 px: the tab bar is not pushed wider by more than it already scrolls', ov>=0, ov); }
    await ctx.close(); }
  check('no page errors', !errs.length, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
