// node tests/editor-stays-test.js — v4.12. Alonzo: "if I press I bet this, do not move it so it goes to the next thing. I can not even
// make a bet" / "refreshes". Background redraws (live prices, book swap, fills, grading) wiped the open I bet this box and moved the page.
// Now they wait while the box is open and run once it is saved or closed; your own taps outside it still redraw. Phone and computer.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const NOW=Date.parse('2026-11-07T18:00:00Z'), H=3600e3, iso=ms=>new Date(ms).toISOString(), DAY='2026-11-07';
const team=(ha,abbr)=>({ha,id:abbr,abbr,name:abbr,loc:abbr,nick:abbr,logo:'',rec:'',color:'333333',alt:'ffffff'});
const row=(o)=>Object.assign({name:'Miami (OH) RedHawks',team:'M-OH',game:'OHIO @ M-OH',matchup:'M-OH vs OHIO',side:'',sport:'NCAAF',market:'Moneyline',kind:'moneyline',book:'Kalshi',offeredRaw:'-108',offeredProb:0.519,fairProb:0.551,fairRaw:'',mktProb:0.551,stars:null,evModel:'market',
  gameInfo:{state:'pre',startISO:iso(NOW+5*H),timeCT:'',detail:'',teams:[team('away','OHIO'),team('home','M-OH')]},src:'api:oddsapi:NCAAF',apiKey:'k1'},o||{});
const ROWS=[row(), row({name:'Akron Zips',team:'AKR',game:'AKR @ KENT',matchup:'AKR @ KENT',offeredRaw:'-105',offeredProb:0.512,fairProb:0.55,mktProb:0.55,apiKey:'k2',gameInfo:{state:'pre',startISO:iso(NOW+6*H),timeCT:'',detail:'',teams:[team('away','AKR'),team('home','KENT')]}})];
(async()=>{
  const b=await chromium.launch();
  for(const W of [390,1280]){
    const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:W,height:900}}); await ctx.clock.install({time:new Date(NOW)});
    await ctx.addInitScript(([rows,d])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows})); }catch(e){} }, [ROWS,DAY]);
    const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
    await p.goto('http://app.test/'); await p.waitForTimeout(1500);
    await p.evaluate(()=>setMode('volado')); await p.waitForTimeout(300);   /* v4.76: both bets (model = market: M-OH 55.1%, AKR 55%) are 🪙 Volado bets (50 to 60%), not in the opening tab, 💪 Machín; the redraws below keep it (cfgRead reads the tab) */
    const nCards=await p.evaluate(()=>document.querySelectorAll('#placeCards .pcard').length);
    // open I bet this on the second card, type a stake
    await p.evaluate(()=>{ const c=[...document.querySelectorAll('#placeCards .pcard')].find(x=>/AKR @ KENT/.test(x.textContent)); c.scrollIntoView({block:'center'}); (c.querySelector('.bet-btn')).click(); });
    await p.waitForTimeout(300);
    await p.evaluate(()=>{ const s=document.querySelector('#placeCards .editor .eb-stake'); s.value='3.33'; s.dispatchEvent(new Event('input',{bubbles:true})); });
    const before=await p.evaluate(()=>({y:scrollY, top:Math.round(document.querySelector('#placeCards .editor').getBoundingClientRect().top)}));
    // the background redraws: a live price moves, the board is audited and drawn again, several times
    await p.evaluate(()=>{ const r=lastRows.find(x=>x.team==='M-OH'); r.name='M-OH LIVE'; for(let i=0;i<3;i++){ const c=cfgRead(); render(audit(lastRows,c),c); } });
    await p.waitForTimeout(1200);
    const mid=await p.evaluate(()=>{ const e=document.querySelector('#placeCards .editor'); return {open:!!e, stake:e&&e.querySelector('.eb-stake').value, inAkron:!!(e&&/AKR @ KENT/.test(e.closest('.pcard').textContent)), y:scrollY, top:e?Math.round(e.getBoundingClientRect().top):null, live:/LIVE/.test(document.getElementById('placeCards').textContent)}; });
    check(W+' px: background redraws leave the open I bet this box alone (still open, on AKR, $3.33 kept)', nCards===2 && mid.open && mid.inAkron && mid.stake==='3.33', {nCards, mid});
    check(W+' px: the page does not move', mid.y===before.y && mid.top===before.top, {before, mid});
    check(W+' px: the redraw waits (the new price is not drawn yet)', !mid.live, mid);
    // Cancel → the waiting redraw runs
    await p.evaluate(()=>document.querySelector('#placeCards .editor .eb-cancel').click()); await p.waitForTimeout(900);
    const after=await p.evaluate(()=>/LIVE/.test(document.getElementById('placeCards').textContent));
    check(W+' px: closing the box runs the waiting redraw', after, after);
    // your own tap outside the box still redraws: open again, then press Show rejected
    await p.evaluate(()=>{ const c=[...document.querySelectorAll('#placeCards .pcard')].find(x=>/AKR @ KENT/.test(x.textContent)); c.querySelector('.bet-btn').click(); }); await p.waitForTimeout(200);
    await p.evaluate(()=>{ const r=lastRows.find(x=>x.team==='AKR'); r.name='AKR NOW'; });
    await p.evaluate(()=>{ const b=document.getElementById('barMoreBtn'); if(b && getComputedStyle(b).display!=='none' && b.getAttribute('aria-expanded')!=='true') b.click(); });   // v4.25: on a phone the tick boxes are behind Filters
    await p.click('#showRejects').catch(()=>{}); await p.waitForTimeout(400);
    const own=await p.evaluate(()=>/AKR NOW/.test(document.body.textContent));
    check(W+' px: a tap of your own outside the box (Show rejected) still redraws at once', own, own);
    check(W+' px: no page errors', !errs.length, errs);
    await ctx.close();
  }
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
