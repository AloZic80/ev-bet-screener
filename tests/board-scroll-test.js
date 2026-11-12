// node tests/board-scroll-test.js — v4.23. Alonzo: "when I am on the board it refreshes and the board goes up, which makes me lose the bet and
// then I have to scroll down again". A background redraw empties and rebuilds the cards and the table; the card you were looking at must stay
// where it is on the screen. Phone (390) and computer (1280), cards and table.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const NOW=Date.parse('2026-11-07T18:00:00Z'), H=3600e3, iso=ms=>new Date(ms).toISOString(), DAY='2026-11-07';
const team=(ha,abbr)=>({ha,id:abbr,abbr,name:abbr,loc:abbr,nick:abbr,logo:'',rec:'',color:'333333',alt:'ffffff'});
const T=['AKR','BGSU','BALL','KENT','TOL','NIU','EMU','WMU','CMU','OHIO','BUFF','MASS'];
const ROWS=T.map((t,i)=>({name:t,team:t,game:'X'+i+' @ '+t,matchup:t+' vs X'+i,side:'',sport:'NCAAF',market:'Moneyline',kind:'moneyline',book:'Kalshi',offeredRaw:'-105',offeredProb:0.512,fairProb:0.55,fairRaw:'',mktProb:0.55,stars:null,evModel:'market',
  gameInfo:{state:'pre',startISO:iso(NOW+(5+i)*H),timeCT:'',detail:'',teams:[team('away','X'+i),team('home',t)]},src:'api:oddsapi:NCAAF',apiKey:'k'+i}));
(async()=>{
  const b=await chromium.launch();
  for(const [W,cards,safari] of [[390,true,false],[1280,true,false],[1280,false,false],[390,true,true],[1280,true,true],[1280,false,true]]){
    const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:W,height:800}}); await ctx.clock.install({time:new Date(NOW)});
    await ctx.addInitScript(([rows,d,c])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows})); localStorage.setItem('mbev.cards',c?'1':'0'); }catch(e){} }, [ROWS,DAY,cards]);
    const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
    await p.goto('http://app.test/'); await p.waitForTimeout(800);
    await p.addStyleTag({content:'body{padding-bottom:2400px}'});   // room below, like a full board
    if(safari) await p.addStyleTag({content:'html,body,*{overflow-anchor:none !important}'});   // Safari (iPhone, Mac) has no scroll anchoring: the page jumps as the board is rebuilt
    await p.evaluate(()=>{ const i=document.getElementById('books'); i.value='Kalshi'; i.dispatchEvent(new Event('input',{bubbles:true})); }); await p.waitForTimeout(800);
    await p.evaluate(()=>setMode('volado')); await p.waitForTimeout(400);   /* v4.76: the 12 bets (La Contadora 55%, 50 to 60%) are listed under 🪙 Volado; the redraws below keep it (cfgRead reads the tab) */
    const sel=cards?'#placeCards .sc-card':'#tbody tr';
    // scroll so the 7th bet sits near the top of the screen
    const before=await p.evaluate(sel=>{ const T=/(AKR|BGSU|BALL|KENT|TOL|NIU|EMU|WMU|CMU|OHIO|BUFF|MASS)/, all=[...document.querySelectorAll(sel)].filter(e=>T.test(e.textContent) && e.querySelector('[data-idx]'));
      const tgt=all.find(e=>/WMU/.test(e.textContent)); tgt.scrollIntoView({block:'start'}); window.scrollBy(0,-60);
      const el=all.find(e=>e.getBoundingClientRect().top>=0);   // the bet at the top of the screen: the one you are looking at
      const r=el.getBoundingClientRect(); return {name:el.textContent.match(T)[1], top:Math.round(r.top), y:Math.round(scrollY)}; }, sel);
    // background redraws (live prices, fills, the Sentinels): audit and draw again, three times
    await p.evaluate(sel=>{ for(let i=0;i<3;i++){ lastRows.forEach(r=>{ r.offeredProb=Math.max(0.45, r.offeredProb-0.001); }); const c=cfgRead(); render(audit(lastRows,c),c); }
      // a moment later the photos, injury and weather tags fill in: the bets above you grow (as they do after every redraw)
      setTimeout(()=>{ [...document.querySelectorAll(sel)].slice(0,3).forEach(el=>{ const d=document.createElement(el.tagName==='TR'?'td':'div'); d.style.height='40px'; d.textContent='filled in later'; el.appendChild(d); }); },150); }, sel);
    await p.waitForTimeout(700);
    const after=await p.evaluate(([sel,n])=>{ const el=[...document.querySelectorAll(sel)].find(e=>{ const m=e.textContent.match(/(AKR|BGSU|BALL|KENT|TOL|NIU|EMU|WMU|CMU|OHIO|BUFF|MASS)/); return m && m[1]===n && e.querySelector('[data-idx]'); }); const r=el.getBoundingClientRect(); return {top:Math.round(r.top), y:Math.round(scrollY)}; }, [sel,before.name]);
    check(W+' px, '+(cards?'cards':'table')+(safari?', like Safari':'')+': after background refreshes, '+before.name+' is still where it was on the screen (not sent back up)', Math.abs(after.top-before.top)<=2 && before.y>200, {before, after});
    check(W+' px, '+(cards?'cards':'table')+(safari?', like Safari':'')+': no page errors', !errs.length, errs);
    await ctx.close();
  }
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
