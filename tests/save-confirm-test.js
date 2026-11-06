// node tests/save-confirm-test.js — when Save needs a second press (a price worse than fair, a limit reached) or a field is
// missing, it says so in a box you can see and the button reads "Save bet anyway" (v3.89). Alonzo: "I pressed the button,
// I made this bet, and then saved, and it didn't save?"
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium, devices } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const now=Date.now(), H=3600e3, iso=ms=>new Date(ms).toISOString(), day=new Date(now).toLocaleDateString('en-CA',{timeZone:'America/Chicago'});
const team=(ha,abbr)=>({ha,id:abbr,abbr,name:abbr,loc:abbr,nick:abbr,logo:'',rec:'',color:'333333',alt:'ffffff'});
const ROW={name:'Ryan O\'Reilly',game:'NSH @ STL',matchup:'NSH @ STL',side:'O',sport:'NHL',market:'1.5 Shots On Goal',kind:'prop',book:'DraftKings',offeredRaw:'-110',offeredProb:.524,fairProb:.56,fairRaw:'-127',mktProb:.56,stars:3,evModel:'projection',stake:5,
  gameInfo:{state:'pre',startISO:iso(now+5*H),timeCT:'',detail:'',teams:[team('away','NSH'),team('home','STL')]},src:'api:NHL:props',apiKey:'or1'};
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({...devices['iPhone 13'], timezoneId:'America/Chicago'});
  await ctx.addInitScript(([rows,d])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows})); }catch(e){} }, [[ROW],day]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1500);
  await p.evaluate(()=>document.querySelector('.bet-btn').click()); await p.waitForTimeout(400);
  const save=()=>p.evaluate(()=>document.querySelector('.eb-save').click());
  const msg=()=>p.evaluate(()=>{ const m=document.querySelector('.eb-msg'); const r=m.getBoundingClientRect(); return {txt:m.textContent, warn:m.classList.contains('eb-warn'), btn:document.querySelector('.eb-save').textContent, seen:r.height>20 && r.width>100, n:logged.length}; });
  const pct=await p.evaluate(()=>{ const m=document.querySelector('.eb-mode'); return !!m && m.value==='pct'; });
  // 1. a missing field says which one, in a box you can see
  if(pct){ await p.fill('.eb-cost',''); await p.fill('.eb-pct',''); await p.fill('.eb-win',''); } else { await p.fill('.eb-odds',''); await p.fill('.eb-stake',''); await p.fill('.eb-win-o',''); }
  await save(); await p.waitForTimeout(300);
  let s=await msg();
  check('a missing field: nothing saved, and a clear box says what to fill in', s.n===0 && s.warn && s.seen && /Enter|Type/.test(s.txt), s);
  // 2. a price far worse than fair: not saved on the first press, the box says why, the button says "Save bet anyway"
  if(pct){ await p.fill('.eb-cost','4.35'); await p.fill('.eb-pct','70'); } else { await p.fill('.eb-odds','-250'); await p.fill('.eb-stake','4.35'); }
  await save(); await p.waitForTimeout(300);
  s=await msg();
  check('a price worse than fair: a clear note says why, and the button says "Save bet anyway"', s.n===0 && s.warn && s.seen && /anyway/.test(s.txt) && s.btn==='Save bet anyway', s);
  await save(); await p.waitForTimeout(400);
  check('the second press saves it', await p.evaluate(()=>logged.length===1 && logged[0].name==='Ryan O\'Reilly'), true);
  check('no page errors', !errs.length, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
