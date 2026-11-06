// node tests/slip-app-test.js — v4.04. Alonzo: "when I press to prefill, can it open the app instead of the website? Not doing it
// on my iPhone." An iPhone opens a book's app only from a tap on the link itself; the slip used to load in a tab the page had opened
// and pointed there after the price check, so it stayed in Safari. On a phone the slip now waits in a bar as a real link.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium, devices } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const NOW=Date.parse('2026-11-06T18:00:00Z'), iso=ms=>new Date(ms).toISOString();
const BET={id:'nv1',key:'nv1',sport:'NHL',kind:'prop',book:'Novig',odds:'-106',stake:4.35,date:'2026-11-06',game:'NSH @ STL',matchup:'NSH @ STL',name:"Ryan O'Reilly",side:'O',market:'1.5 Shots On Goal',betnow:'O 1.5 -106',start:iso(NOW+5*3600e3),snap:{at:iso(NOW-3600e3)}};
async function run(ctxOpt, betOver){
  const b=await chromium.launch(); const ctx=await b.newContext(Object.assign({timezoneId:'America/Chicago'},ctxOpt)); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(L=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.log',JSON.stringify(L)); }catch(e){} }, [Object.assign({},BET,betOver||{})]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); let asked=0;
  await ctx.route('**/*',r=>{ const u=r.request().url(), H={'access-control-allow-origin':'*'};
    if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/\/live\?bets=/.test(u)){ asked++; const ds=JSON.parse(decodeURIComponent(u.split('bets=')[1])); const R={}; ds.forEach(d=>R[d.id]={ok:true, src:'novig', price:0.515, outcome:'o-123', ref:'m-1', at:new Date().toISOString()});
      return r.fulfill({contentType:'application/json',headers:H,body:JSON.stringify({results:R})}); }
    if(/espn/.test(u)) return r.fulfill({contentType:'application/json',headers:H,body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1200);
  await p.evaluate(()=>document.querySelector('.tab[data-view="v-log"]').click()); await p.waitForTimeout(300);
  const pages0=ctx.pages().length;
  await p.evaluate(()=>{ const i=document.querySelector('#logBody tr img.blogo')||document.querySelector('#logBody tr .book'); i.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true})); }); await p.waitForTimeout(800);
  const st=await p.evaluate(()=>{ const el=document.getElementById('slipGo'), a=el&&el.querySelector('.slip-go-a'), w=el&&el.querySelector('.slip-go-w'); return {shown:!!el && !el.hidden && el.getBoundingClientRect().height>0, href:a&&a.getAttribute('href'), text:el&&el.innerText.replace(/\s+/g,' '), web:w&&w.getAttribute('href'), fits:el?el.getBoundingClientRect().right<=window.innerWidth:null}; });
  const out={st, newPages:ctx.pages().length-pages0, asked, errs};
  await b.close(); return out;
}
(async()=>{
  const ph=await run(devices['iPhone 13']);
  check('iPhone: tapping the Novig logo shows "Novig slip is ready · Open in Novig ›" as a real link, and opens no blank tab', ph.st.shown && /Novig slip is ready/.test(ph.st.text) && /Open in Novig/.test(ph.st.text) && ph.newPages===0, ph);
  check('iPhone: the link is the Novig app link with the slip prefilled ($4.35), plus the website as a fallback', ph.st.href==='novigapp://events/o-123/novig/4.35' && ph.st.web==='https://novig.com/events/o-123/novig/4.35', [ph.st.href, ph.st.web]);
  check('iPhone: the bar fits the screen', ph.st.fits===true, ph.st.fits);
  const pp=await run(devices['iPhone 13'], {book:'PrizePicks'});
  check('iPhone: PrizePicks too: "Open in PrizePicks ›" (its app or site; PrizePicks has no prefilled slip)', pp.st.shown && /Open in PrizePicks/.test(pp.st.text) && pp.st.href==='https://app.prizepicks.com/' && pp.newPages===0, pp.st);
  const dk=await run(devices['iPhone 13'], {book:'DraftKings'});
  check('iPhone: DraftKings: "Open in DraftKings ›"', dk.st.shown && /Open in DraftKings/.test(dk.st.text) && dk.st.href==='https://sportsbook.draftkings.com/', dk.st);
  const mac=await run({viewport:{width:1400,height:1000}});
  check('Mac: unchanged, the slip opens in the side window (no bar)', mac.newPages===1 && !mac.st.shown, mac);
  check('no page errors', !ph.errs.length && !mac.errs.length, [ph.errs, mac.errs]);
  console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail?1:0);
})();
