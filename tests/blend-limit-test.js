// node tests/blend-limit-test.js — v4.41. An outside math check (Alonzo: "Fix and build"): "OK up to" used the model's chance (55.5%) while the stake is
// sized on the blend (market 52.6% pulled toward the model by the 0.35 weight = 53.6%), so a price between the two was "OK" where La Contadora would size
// almost $0. Now every "OK up to", the price tag, Kalshi's limit price and + Add a bet use the blend (or the model when lower); no market price: the model.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const NOW=Date.parse('2026-11-09T19:00:00Z'), H=3600e3, iso=ms=>new Date(ms).toISOString(), DAY='2026-11-09', TIP=Date.parse('2026-11-10T02:30:00Z');
const T=(ha,abbr,loc,nick)=>({ha,id:abbr,abbr,name:loc+' '+nick,loc,nick,logo:'',rec:'',color:'333333',alt:'ffffff'});
const row=(id,name,book,price,fair,mkt,extra)=>Object.assign({name,team:'VAN',game:'PHI @ VAN',matchup:'PHI @ VAN',side:'O',sport:'NHL',market:'1.5 Shots',kind:'prop',book,offeredRaw:String(Math.round(-100*price/(1-price))),offeredProb:price,fairProb:fair,fairRaw:'',mktProb:mkt,stars:4,evModel:'projection',projValue:2.1,
  gameInfo:{state:'pre',startISO:iso(TIP),timeCT:'',detail:'',teams:[T('away','PHI','Philadelphia','Flyers'),T('home','VAN','Vancouver','Canucks')]},src:'api:NHL:props',apiKey:id,loadedAt:iso(NOW-60e3)},extra||{});
// fair 55.46%, market 52.6% → blend 52.6 + 0.35 × 2.86 = 53.60%; floor 1.5% → OK to 53.60 / 1.015 = 52.81% (the model alone: 54.64%)
const ROWS=[row('lek','Jonathan Lekkerimaki','Novig',0.519,0.5546,0.526),
            row('mid','Will Cuylle','Novig',0.535,0.5546,0.526,{team:'NYR',game:'NYR @ MTL',matchup:'NYR @ MTL'}),          // between the two limits: the model says OK, the blend does not
            row('nomkt','Elias Pettersson','Novig',0.519,0.5546,null,{evModel:'projection'}),                             // no market price: the model's limit
            row('kx','Quinn Hughes','Kalshi',0.53,0.60,0.57,{team:'VAN'})];                                                             // Kalshi: the limit price follows the blend
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:1280,height:900}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(([R,d])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig, Kalshi',bank:'500',cfgVer:3.03})); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows:R})); }catch(e){} }, [ROWS,DAY]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1300);
  const m=await p.evaluate(()=>{ const R=Object.fromEntries(lastRows.map(r=>[r.apiKey,r])), c=cfgRead();
    const tag=k=>{ const d=document.createElement('div'); d.innerHTML=impTagHtml(R[k]); return d.textContent; };
    return {w:c.mWeight, blend:+(okProbR(R.lek)*100).toFixed(2), model:+(maxPriceFor(R.lek.fairProb,'Novig',c.eMin)*100).toFixed(2), ok:+(maxPriceFor(okProbR(R.lek),'Novig',c.eMin)*100).toFixed(2),
      lek:tag('lek'), mid:tag('mid'), nomkt:tag('nomkt'), midStake:R.mid.stake, lekStake:R.lek.stake, midPass:R.mid.pass, kxOk:maxPriceFor(okProbR(R.kx),'Kalshi',c.eMin), kxModel:maxPriceFor(R.kx.fairProb,'Kalshi',c.eMin)}; });
  check('the conservative chance is the blend: 52.6 + 0.35 × (55.46 − 52.6) = 53.60%', m.w===0.35 && m.blend===53.6, m);
  check('Lekkerimaki at 51.9%: "OK to 52.8%" (the blend), not 54.6% (the model)', /^51\.9% · OK to 52\.8%$/.test(m.lek) && Math.abs(m.model-54.64)<0.02, m.lek);
  check('a price of 53.5%: the model would say OK, the blend says "need ≤ 52.8% · look elsewhere"', /^53\.5% · need ≤ 52\.8% · look elsewhere$/.test(m.mid), m.mid);
  check('with no market price the model\'s own limit stays: OK to 54.6%', /OK to 54\.6%$/.test(m.nomkt), m.nomkt);
  check('Kalshi: the limit price comes from the blend, lower than the model\'s', m.kxOk<m.kxModel && m.kxOk>0.5, [m.kxOk,m.kxModel]);
  const kx=await p.evaluate(()=>{ const c=[...document.querySelectorAll('#placeCards .sc-card')].find(x=>/Quinn Hughes/.test(x.textContent)); const k=c&&c.querySelector('.sc-kx'); return k?k.textContent:null; });
  const lim=Math.floor(m.kxOk*100+1e-9);
  check('the Kalshi line on the card says Limit '+lim+'¢ (the blend\'s, in whole cents rounded down)', kx && kx.includes('Limit '+lim+'¢'), kx);
  // + Add a bet's verdict also uses the blend
  const ab=await p.evaluate(()=>maxPriceFor(okProb(0.5546,0.526),'Novig',cfgRead().eMin));
  check('+ Add a bet: the same blend limit (52.8%) for the same chances', Math.abs(ab*100-52.81)<0.02, ab);
  const wd=await p.evaluate(()=>({head:(document.querySelector('#placeCards .sc-sub')||{}).textContent||'', src:String(renderScorecard)}));
  check('wording: Place these says THIN "still clears your estimated EV floor" (not "still +EV"); the Scorecard says evidence, not proof', /THIN \(yellow: still clears your estimated EV floor/.test(wd.head) && !/still \+EV/.test(wd.head) && /good evidence of an edge \(evidence, not proof\)/.test(wd.src) && !/Passed the 1,000-bet test/.test(wd.src), wd.head);
  check('no page errors', !errs.length, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
