// node tests/hard-stop-test.js — v4.27. Alonzo: "build the Hard Stop. I still have the option to go on, but at least it is there for me to
// say and think... ok, mejor no". Bankroll $500, daily max 10% = $50, $48 already staked today: I bet this with $3 stops on the first press
// ("Hard stop ... makes $51.00", button reads Save bet anyway, nothing saved); the second press saves. A $1.50 bet (total $49.50) saves at once.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const NOW=Date.parse('2026-11-08T19:00:00Z'), H=3600e3, iso=ms=>new Date(ms).toISOString(), DAY='2026-11-08';
const T=(ha,abbr,loc,nick)=>({ha,id:abbr,abbr,name:loc+' '+nick,loc,nick,logo:'',rec:'',color:'333333',alt:'ffffff'});
const prop=(name,team,k)=>({name,team,game:'LAC @ MIN',matchup:'LAC @ MIN',side:'O',sport:'NBA',market:'16.5 Points',kind:'prop',book:'Novig',offeredRaw:'-108',offeredProb:0.52,fairProb:0.56,fairRaw:'',mktProb:0.55,stars:4,evModel:'market',gameInfo:{state:'pre',startISO:iso(NOW+6*H),timeCT:'',detail:'',teams:[T('away','LAC','Los Angeles','Clippers'),T('home','MIN','Minnesota','Timberwolves')]},src:'api:NBA:props',apiKey:k,loadedAt:iso(NOW-60e3)});
const ROWS=[prop('Naz Reid','MIN','k1'),prop('Rudy Gobert','MIN','k2')];
const B=(id,stake)=>({id,key:id,name:'Old Bet '+id,sport:'NBA',kind:'prop',market:'10.5 Points',side:'O',book:'Novig',odds:'-110',offeredRaw:'-110',stake,date:DAY,dateSet:true,start:iso(NOW+2*H),gameInfo:{state:'pre',startISO:iso(NOW+2*H),teams:[]}});
const LOG=[B('a',20),B('b',28)];
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:1280,height:900}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(([L,R,d])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.log',JSON.stringify(L)); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig',bank:'500',dayMaxPct:'10',sMin:'1',sMax:'10',cfgVer:3.03}));   /* as saveCfg writes it: cfgVer, so the v2.53 migration leaves the $500 alone */ localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows:R})); }catch(e){} }, [LOG,ROWS,DAY]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/api\.0xbeta\.dev/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1200);
  const open=async n=>{ const r=await p.evaluate(n=>{ const c=[...document.querySelectorAll('#placeCards .sc-card')].find(x=>x.textContent.includes(n)); if(!c) return {card:false, cards:document.querySelectorAll('#placeCards .sc-card').length, stat:(document.querySelector('.statbox')||{}).innerText, rows:lastRows.map(r=>r.name+':'+(r.flags||[]).map(f=>f[1].slice(0,40)).join('|'))}; const b=c.querySelector('.sc-act .bet-btn'); if(!b) return {card:true, btn:false, html:c.innerText.slice(0,200)}; b.click(); return {card:true, btn:true}; }, n);
    for(let i=0;i<10;i++){ if(await p.evaluate(()=>!!document.querySelector('#placeCards .editor .eb-save'))) break; await p.waitForTimeout(200); }
    if(!(await p.evaluate(()=>!!document.querySelector('#placeCards .editor .eb-save')))) console.log('  editor not open:', JSON.stringify(r)); };
  const setStake=async v=>p.evaluate(v=>{ const e=document.querySelector('#placeCards .editor'); ['.eb-stake','.eb-cost'].forEach(c=>{ const i=e.querySelector(c); if(i){ i.value=v; i.dispatchEvent(new Event('input',{bubbles:true})); } }); }, v);   // Novig is a % book: the Cost box is the stake
  const save=async()=>{ await p.evaluate(()=>document.querySelector('#placeCards .editor .eb-save').click()); await p.waitForTimeout(300); };
  const state=()=>p.evaluate(()=>{ const e=document.querySelector('#placeCards .editor'); return {open:!!e, msg:e?(e.querySelector('.eb-msg')||{}).textContent:'', btn:e?(e.querySelector('.eb-save')||{}).textContent:'', n:JSON.parse(localStorage.getItem('mbev.log')||'[]').length}; });
  await open('Naz Reid'); await setStake('3'); await save(); let st=await state();
  check('$48 staked today of a $50 max: a $3 bet stops on the first press and says so (today $48.00, this $3.00 makes $51.00), nothing saved', st.open && /Hard stop/.test(st.msg) && /\$48\.00/.test(st.msg) && /\$51\.00/.test(st.msg) && /Save bet anyway/.test(st.btn) && st.n===2, st);
  await save(); st=await state();
  check('the second press saves it: your call', !st.open && st.n===3, st);
  const gob=await p.evaluate(()=>{ const r=lastRows.find(x=>/Gobert/.test(x.name)); return {card:[...document.querySelectorAll('#placeCards .sc-card')].some(c=>/Gobert/.test(c.textContent)), flags:(r.flags||[]).map(f=>f[1]).join(' | ')}; });
  check('the day is at $51 now: the board itself keeps the next bet out of Place these (daily max reached)', !gob.card && /daily max reached/.test(gob.flags), gob);
  await p.evaluate(()=>{ const L=JSON.parse(localStorage.getItem('mbev.log')); L.splice(0,2); localStorage.setItem('mbev.log',JSON.stringify(L)); }); await p.reload(); await p.waitForTimeout(1200);
  await open('Rudy Gobert'); await setStake('1.5'); await save(); st=await state();
  check('with $3 staked today, a $1.50 bet saves on the first press (no stop)', !st.open && st.n===2, st);
  check('no page errors', !errs.length, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
