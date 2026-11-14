// node tests/board-book-test.js — v4.13 / v4.24. Alonzo: "give me the option to only choose by book" (v4.13, one menu), then "add buttons so
// that I can only choose certain books to display, instead of All or just a certain one" (v4.24). The board has a row of book chips with
// counts: tap one or several to show only their bets (table and Place these); All clears; the choice is remembered on the device.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const NOW=Date.parse('2026-11-07T18:00:00Z'), H=3600e3, iso=ms=>new Date(ms).toISOString(), DAY='2026-11-07';
const team=(ha,abbr)=>({ha,id:abbr,abbr,name:abbr,loc:abbr,nick:abbr,logo:'',rec:'',color:'333333',alt:'ffffff'});
const row=(t,o,book,k)=>({name:t,team:t,game:o+' @ '+t,matchup:t+' vs '+o,side:'',sport:'NCAAF',market:'Moneyline',kind:'moneyline',book,offeredRaw:'-105',offeredProb:0.512,fairProb:0.55,fairRaw:'',mktProb:0.55,stars:null,evModel:'market',
  gameInfo:{state:'pre',startISO:iso(NOW+5*H),timeCT:'',detail:'',teams:[team('away',o),team('home',t)]},src:'api:oddsapi:NCAAF',apiKey:k});
const ROWS=[row('AKR','KENT','Kalshi','k1'), row('BGSU','TOL','Kalshi','k2'), row('BALL','NIU','Novig','k3'), row('EMU','CMU','Bovada','k4')];
(async()=>{
  const b=await chromium.launch();
  for(const W of [390,1280]){
    const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:W,height:900}}); await ctx.clock.install({time:new Date(NOW)});
    await ctx.addInitScript(([rows,d])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows})); }catch(e){} }, [ROWS,DAY]);
    const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
    await p.goto('http://app.test/'); await p.waitForTimeout(800);
    await p.evaluate(()=>{ const i=document.getElementById('books'); i.value='Kalshi, Novig, Bovada'; i.dispatchEvent(new Event('input',{bubbles:true})); }); await p.waitForTimeout(1200);
    await p.evaluate(()=>setMode('volado')); await p.waitForTimeout(300);   /* v4.76: the four bets (model = market = 55%) are 🪙 Volado bets (50 to 60%), not in the opening tab, 💪 Machín; the book chips count the open tab's bets */
    const see=()=>p.evaluate(()=>({chips:[...document.querySelectorAll('#bookChips .bchip')].map(c=>c.textContent.replace(/\s+/g,' ').trim()+(c.classList.contains('on')?' *':'')),
      cards:[...document.querySelectorAll('#placeCards .pcard')].map(c=>{ const nm=((c.querySelector('.pc-nm')||{}).textContent||'').trim(); return ['AKR','BGSU','BALL','EMU'].find(t=>nm.startsWith(t))||'?'; }),
      saved:localStorage.getItem('mbev.boardBooks'), vw:document.documentElement.clientWidth, sw:document.documentElement.scrollWidth, right:Math.max(...[...document.querySelectorAll('#bookChips .bchip')].map(e=>e.getBoundingClientRect().right)), boxRight:document.getElementById('bookChips').getBoundingClientRect().right, rowScrolls:(b=>b.scrollWidth>b.clientWidth && /auto|scroll/.test(getComputedStyle(b).overflowX))(document.getElementById('bookChips'))}));   // v5.04: the chip row and whether it scrolls sideways
    const tap=b=>p.evaluate(b=>{ [...document.querySelectorAll('#bookChips .bchip')].find(c=>(c.dataset.book||'')===b).click(); }, b).then(()=>p.waitForTimeout(400));
    const A=await see();
    check(W+' px: a chip per book on the board, with counts, All on', JSON.stringify(A.chips)==='["All 4 *","Kalshi 2","Bovada 1","Novig 1"]' && A.cards.length===4, A.chips);
    await tap('Novig'); const B=await see();
    check(W+' px: tap Novig: only the Novig bet; Novig on, All off', JSON.stringify(B.cards)==='["BALL"]' && B.chips.includes('Novig 1 *') && B.chips[0]==='All 4', B);
    await tap('Kalshi'); const C=await see();
    check(W+' px: tap Kalshi too: Kalshi and Novig bets (3), both chips on, Bovada off', C.cards.length===3 && !C.cards.includes('EMU') && C.chips.includes('Kalshi 2 *') && C.chips.includes('Novig 1 *') && C.chips.includes('Bovada 1'), C);
    check(W+' px: the counts stay for every book, so you can switch', /Bovada 1/.test(C.chips.join('|')), C.chips);
    check(W+' px: nothing runs off the screen: the chips wrap, or on a phone they sit in one row that scrolls sideways inside the screen (v5.04)', C.sw<=C.vw+1 && (C.right<=C.vw+1 || (C.rowScrolls && C.boxRight<=C.vw+1)), {vw:C.vw, sw:C.sw, right:C.right, boxRight:C.boxRight, rowScrolls:C.rowScrolls});
    await p.reload(); await p.waitForTimeout(1500); await p.evaluate(()=>setMode('volado')); await p.waitForTimeout(300); const D=await see();   /* v4.76: their tab, 🪙 Volado, again (the book chips are what this checks) */
    check(W+' px: after a reload Kalshi and Novig are still the ones shown', D.cards.length===3 && !D.cards.includes('EMU') && D.saved==='["Novig","Kalshi"]', D);
    await tap('Novig'); const E=await see();
    check(W+' px: tap Novig again to turn it off: Kalshi only', JSON.stringify(E.cards.sort())==='["AKR","BGSU"]', E.cards);
    await tap(''); const F=await see();
    check(W+' px: All brings every bet back and is on', F.cards.length===4 && F.chips[0]==='All 4 *' && F.saved==='[]', F);
    check(W+' px: no page errors', !errs.length, errs);
    await ctx.close();
  }
  // v4.13's one saved book carries over
  { const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:1280,height:900}}); await ctx.clock.install({time:new Date(NOW)});
    await ctx.addInitScript(([rows,d])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows})); localStorage.setItem('mbev.boardBook','Novig'); }catch(e){} }, [ROWS,DAY]);
    const p=await ctx.newPage(); await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
    await p.goto('http://app.test/'); await p.waitForTimeout(800);
    await p.evaluate(()=>{ const i=document.getElementById('books'); i.value='Kalshi, Novig, Bovada'; i.dispatchEvent(new Event('input',{bubbles:true})); }); await p.waitForTimeout(1200);
    await p.evaluate(()=>setMode('volado')); await p.waitForTimeout(300);   /* v4.76: all four bets (55%) are under 🪙 Volado, so the one Novig card is counted there */
    const n=await p.evaluate(()=>document.querySelectorAll('#placeCards .pcard').length);
    check('a book chosen in v4.13 (one menu) carries over as the one chip on', n===1, n);
    await ctx.close(); }
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
