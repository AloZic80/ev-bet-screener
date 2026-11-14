// node tests/v493-test.js — v4.93 (agreed with Sally 11/13, CC-2026-11-13-21/22; owner "BUILD, all"; Alonzo: "at 39.2, how do i have edge on a coin flip?"):
// an outlier, a stale price or a card the book does not show keeps its numbers but loses the green: "95 OUTLIER", "EST. EV +x% · not trusted — outlier",
// "LAST-SEEN EV +x% · ⏱ price stale", "no current price"; such a card is never #1 MATH PICK. actNet, stakes and the order are unchanged.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,600)); };
const NOW=Date.parse('2026-11-13T19:00:00Z'), iso=ms=>new Date(ms).toISOString(), TIP=Date.parse('2026-11-14T02:00:00Z');
const T=(ha,abbr)=>({ha,id:abbr,abbr,name:abbr+' Team',loc:abbr,nick:'Team',logo:'',rec:'',color:'333333',alt:'ffffff'});
const GI={state:'pre',startISO:iso(TIP),eventId:'1',timeCT:'',detail:'',teams:[T('away','CHA'),T('home','PHX')]};
const am=p=>p>=0.5?String(Math.round(-100*p/(1-p))):'+'+Math.round(100*(1-p)/p);
const row=(id,name,price,fair,mkt,extra)=>Object.assign({name,team:'PHX',game:'CHA @ PHX',matchup:'CHA @ PHX',side:'O',sport:'NBA',market:'1.5 Threes',kind:'prop',book:'Novig',offeredRaw:am(price),offeredProb:price,fairProb:fair,fairRaw:'',mktProb:mkt,stars:3,evModel:'market',gameInfo:GI,src:'api:NBA:props',apiKey:id,loadedAt:iso(NOW-60e3)},extra||{});
const ROWS=[row('ok','Plain Good',0.58,0.66,0.64), row('out','Way Off',0.55,0.68,0.57), row('old','Old Price',0.60,0.66,0.65,{loadedAt:iso(NOW-13*3600e3)}), row('aw','Ghost',0.58,0.68,0.66)];
(async()=>{ const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:1280,height:1000}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(([R])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig',bank:'500',cfgVer:3.03})); localStorage.setItem('mbev.cards','1'); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:'2026-11-13',rows:R})); }catch(e){} },[ROWS]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1300);
  const st=await p.evaluate(()=>{ const g=k=>lastRows.find(r=>r.apiKey===k); g('aw').awol={book:'Novig', note:'Novig: no market at your line', at:Date.now()}; refresh();
    return {ok:evDisplayState(g('ok')), out:evDisplayState(g('out')), outlier:!!g('out').outlier, old:evDisplayState(g('old')), aw:evDisplayState(g('aw')), net:+(g('out').actNet||0).toFixed(3), stake:g('out').stake}; });
  check('states: a fresh normal card is actionable; the outlier is outlier_untrusted; the 13-hour price is stale_last_seen; AWOL is unavailable', st.ok==='actionable' && st.out==='outlier_untrusted' && st.outlier && st.old==='stale_last_seen' && st.aw==='unavailable', st);
  const card=async name=>p.evaluate(n=>{ const c=[...document.querySelectorAll('.sc-card')].find(x=>x.querySelector('.sc-id') && x.textContent.includes(n)); if(!c) return null; const s=c.querySelector('.sc-score'), e=c.querySelector('.sc-pill.ev b'); return {score:s?s.textContent:'', muted:s?s.classList.contains('muted'):null, ev:e?e.textContent:'', top:!!c.querySelector('.sc-mathtop')}; }, name);
  const tabs=['boring','safe','volado','lucky','hail','old','awol']; const C={};
  for(const t of tabs){ await p.evaluate(m=>{ try{ setMode(m); }catch(e){} }, t); await p.waitForTimeout(250); for(const n of ['Plain Good','Way Off','Old Price','Ghost']){ if(!C[n]){ const c=await card(n); if(c) C[n]=c; } } }
  check('the normal card keeps its green score word and EV', C['Plain Good'] && /STRONG|GOOD|THIN/.test(C['Plain Good'].score) && !C['Plain Good'].muted && /^\+\d/.test(C['Plain Good'].ev), C['Plain Good']);
  if(C['Way Off']) check('the outlier: score kept, "OUTLIER", grey; "EST. EV +x% · not trusted — outlier"', /OUTLIER/.test(C['Way Off'].score) && C['Way Off'].muted && /^EST\. EV \+\d.*not trusted — outlier/.test(C['Way Off'].ev) && !C['Way Off'].top, C['Way Off']);
  else check('the outlier card is on the board somewhere (a capped stake keeps it listed)', false, Object.keys(C));
  check('the 13-hour price: "STALE", "LAST-SEEN EV … · ⏱ price stale", never #1', C['Old Price'] && /STALE/.test(C['Old Price'].score) && C['Old Price'].muted && /^LAST-SEEN EV .*price stale/.test(C['Old Price'].ev) && !C['Old Price'].top, C['Old Price']);
  check('the AWOL card: no strength word, "no current price"', C['Ghost'] && /—/.test(C['Ghost'].score) && C['Ghost'].ev==='no current price' && !C['Ghost'].top, C['Ghost']);
  const st2=await p.evaluate(()=>({net:+(lastRows.find(r=>r.apiKey==='out').actNet||0).toFixed(3), stake:lastRows.find(r=>r.apiKey==='out').stake}));
  check('nothing in the math moved: the outlier keeps its actNet and its capped stake', st2.net===st.net && st2.stake===st.stake, {before:st, after:st2});
  check('no page errors', !errs.length, errs);
  await b.close(); console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(fail?1:0); })();
