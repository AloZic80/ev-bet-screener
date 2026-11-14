// node tests/math-pick-test.js — v4.28. Alonzo: "I am still confused on the green, blue and school-bus yellow. Tell me THIS one is what the math
// says to bet on. Also the sort, stars is not always the best bets, so what is it?" Three passing props: 5 stars with a small edge, 3 stars with a
// big edge, 4 stars in between. Sort › Math is the default and puts the biggest edge first; that card says "✅ #1 MATH PICK"; every score has a
// word (STRONG / GOOD / THIN); the header says the math says bet every card. Stars (Top bets) is still in the menu.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const NOW=Date.parse('2026-11-08T18:00:00Z'), H=3600e3, iso=ms=>new Date(ms).toISOString(), DAY='2026-11-08';
const T=(ha,abbr,loc,nick)=>({ha,id:abbr,abbr,name:loc+' '+nick,loc,nick,logo:'',rec:'',color:'333333',alt:'ffffff'});
const TEAMS=[T('away','LAC','Los Angeles','Clippers'),T('home','MIN','Minnesota','Timberwolves')];
const prop=(name,team,market,stars,p,fair,mkt,k)=>({name,team,game:'LAC @ MIN',matchup:'LAC @ MIN',side:'O',sport:'NBA',market,kind:'prop',book:'Novig',offeredRaw:'-108',offeredProb:p,fairProb:fair,fairRaw:'',mktProb:mkt,stars,evModel:'market',
  gameInfo:{state:'pre',startISO:iso(NOW+6*H),timeCT:'',detail:'',teams:TEAMS},src:'api:NBA:props',apiKey:k,loadedAt:iso(NOW-60e3)});
const ROWS=[prop('Five Star','MIN','16.5 Points',5,0.52,0.54,0.535,'k1'), prop('Three Star','LAC','8.5 Rebounds',3,0.45,0.52,0.51,'k2'), prop('Four Star','MIN','4.5 Assists',4,0.50,0.535,0.53,'k3')];
(async()=>{
  const b=await chromium.launch();
  for(const W of [1280,390]){
    const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:W,height:900}}); await ctx.clock.install({time:new Date(NOW)});
    await ctx.addInitScript(([R,d])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig',cfgVer:3.03})); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows:R})); }catch(e){} }, [ROWS,DAY]);
    const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/api\.0xbeta\.dev/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
    await p.addInitScript(()=>{ window._barOpen=true; }) /* v4.95: these checks read the notes behind Filters, so Filters is open */; await p.goto('http://app.test/'); await p.waitForTimeout(1200);
    await p.evaluate(()=>setMode('volado')); await p.waitForTimeout(300);   /* v4.76: the three sample props are approved at La Contadora min(model, market + 0.35 × (model − market)): Five Star 53.7% (min(.54, .535 + .35 × .005)), Four Star 53.2%, Three Star 51.4%, all in the On the Line band, so their cards are under 🪙 Volado (50–60%), not the opening tab */
    const st=await p.evaluate(()=>({sort:document.getElementById('sortBy').value, cards:[...document.querySelectorAll('#placeCards .sc-card')].map(c=>({name:(c.querySelector('.sc-who')||c).innerText.split('\n').find(t=>/Star/.test(t))||'', top:!!c.querySelector('.sc-mathtop'), word:(c.querySelector('.sc-word')||{}).textContent||''})),
      edge:lastRows.map(r=>({n:r.name, k:mathKey(r)})).sort((a,b)=>b.k-a.k).map(x=>x.n), head:(document.querySelector('#placeCards .pc-head')||{}).innerText||'', opts:[...document.querySelectorAll('#sortBy option')].map(o=>o.value)}));
    if(W===1280){
      check('Sort opens on ✅ Math: best edge first (Top bets by stars is still in the menu)', st.sort==='math' && st.opts[0]==='math' && st.opts.includes('top'), {sort:st.sort, opts:st.opts});
      const nm=st.cards.map(c=>c.name.replace(/ [A-Z]{2,3}$/,''));
      check('the cards are in math order (edge after blending, outliers last), not the stars order (5, 4, 3)', st.cards.length===3 && nm.join()===st.edge.join() && nm.join()!=='Five Star,Four Star,Three Star', {cards:nm, math:st.edge});
      check('exactly one card says ✅ #1 MATH PICK, the first', st.cards.filter(c=>c.top).length===1 && st.cards[0].top, st.cards.map(c=>c.top));
      check('every score says what its colour means: STRONG / GOOD / THIN (v4.93: OUTLIER or STALE in grey when the card is not trusted as shown)', st.cards.every(c=>/^(STRONG|GOOD|THIN|OUTLIER|STALE|OUTLIER · STALE)$/.test(c.word)) && st.cards.some(c=>/^(STRONG|GOOD|THIN)$/.test(c.word)), st.cards.map(c=>c.word));
      check('the header says the math says bet every card, best first, down to the daily max, and what the colours mean', /math says bet every card/i.test(st.head) && /daily max/.test(st.head) && /STRONG/.test(st.head) && /THIN/.test(st.head), st.head.slice(0,200));
      await p.evaluate(()=>{ if(!window._barOpen){ window._barOpen=true; barMoreApply(); } }) /* v4.94: the board controls are behind Filters; tap it first */; await p.selectOption('#sortBy','top'); await p.waitForTimeout(400);
      const t2=await p.evaluate(()=>[...document.querySelectorAll('#placeCards .sc-card')].map(c=>({top:!!c.querySelector('.sc-mathtop'), five:/Five Star/.test(c.innerText)})));
      check('sorted by stars, 5 stars comes first, and the #1 MATH PICK badge stays on the math pick (not the first card)', t2[0].five && !t2[0].top && t2.filter(c=>c.top).length===1, t2);
    } else {
      const fit=await p.evaluate(()=>{ const c=document.querySelector('#placeCards .sc-card'), b=c&&c.querySelector('.sc-mathtop'); return b?{r:Math.round(b.getBoundingClientRect().right), cr:Math.round(c.getBoundingClientRect().right)}:null; });
      check('on a phone the #1 MATH PICK badge fits inside its card', fit && fit.r<=fit.cr, fit);
    }
    check(W+' px: no page errors', !errs.length, errs);
    await ctx.close();
  }
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
