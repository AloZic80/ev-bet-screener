// node tests/board-book-test.js — v4.13. Alonzo: "give me the option to only choose by book: if I see Kalshi, I can choose Kalshi, Novig".
// The board's Book menu lists the books on the board with their counts; picking one shows only its bets (table and Place these cards),
// it is remembered on the device, and All books brings everything back. Phone (390) and computer (1280).
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const NOW=Date.parse('2026-11-07T18:00:00Z'), H=3600e3, iso=ms=>new Date(ms).toISOString(), DAY='2026-11-07';
const team=(ha,abbr)=>({ha,id:abbr,abbr,name:abbr,loc:abbr,nick:abbr,logo:'',rec:'',color:'333333',alt:'ffffff'});
const row=(t,o,book,k)=>({name:t,team:t,game:o+' @ '+t,matchup:t+' vs '+o,side:'',sport:'NCAAF',market:'Moneyline',kind:'moneyline',book,offeredRaw:'-105',offeredProb:0.512,fairProb:0.55,fairRaw:'',mktProb:0.55,stars:null,evModel:'market',
  gameInfo:{state:'pre',startISO:iso(NOW+5*H),timeCT:'',detail:'',teams:[team('away',o),team('home',t)]},src:'api:oddsapi:NCAAF',apiKey:k});
const ROWS=[row('AKR','KENT','Kalshi','k1'), row('BGSU','TOL','Kalshi','k2'), row('BALL','NIU','Novig','k3')];
(async()=>{
  const b=await chromium.launch();
  for(const W of [390,1280]){
    const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:W,height:900}}); await ctx.clock.install({time:new Date(NOW)});
    await ctx.addInitScript(([rows,d])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows})); }catch(e){} }, [ROWS,DAY]);
    const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
    await p.goto('http://app.test/'); await p.waitForTimeout(800);
    await p.evaluate(()=>{ const i=document.getElementById('books'); i.value='Kalshi, Novig'; i.dispatchEvent(new Event('input',{bubbles:true})); }); await p.waitForTimeout(1200);
    const see=()=>p.evaluate(()=>({opts:[...document.querySelectorAll('#boardBook option')].map(o=>o.textContent), val:document.getElementById('boardBook').value,
      cards:[...document.querySelectorAll('#placeCards .pcard')].map(c=>/AKR/.test(c.textContent)?'AKR':/BGSU/.test(c.textContent)?'BGSU':/BALL/.test(c.textContent)?'BALL':'?'),
      rows:[...document.querySelectorAll('#tbody tr[data-idx], #tbody tr')].filter(t=>!t.classList.contains('editor')).length,
      vw:document.documentElement.clientWidth, sw:document.documentElement.scrollWidth}));
    const A=await see();
    check(W+' px: the Book menu lists the books on the board with their counts', JSON.stringify(A.opts)==='["All books · 3","Kalshi · 2","Novig · 1"]' && A.cards.length===3, A);
    await p.selectOption('#boardBook','Novig'); await p.waitForTimeout(400);
    const B=await see();
    check(W+' px: Novig shows only the Novig bet (Place these cards)', JSON.stringify(B.cards)==='["BALL"]' && B.val==='Novig', B);
    check(W+' px: the counts stay, so you can switch to another book', JSON.stringify(B.opts)==='["All books · 3","Kalshi · 2","Novig · 1"]', B.opts);
    check(W+' px: nothing runs off the screen', B.sw<=B.vw+1, {vw:B.vw, sw:B.sw});
    await p.reload(); await p.waitForTimeout(1500);
    const C=await see();
    check(W+' px: after a reload it is still on Novig', C.val==='Novig' && JSON.stringify(C.cards)==='["BALL"]', C);
    await p.selectOption('#boardBook',''); await p.waitForTimeout(400);
    const D=await see();
    check(W+' px: All books brings every bet back', D.cards.length===3 && D.val==='', D);
    check(W+' px: no page errors', !errs.length, errs);
    await ctx.close();
  }
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
