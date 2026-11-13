// node tests/v488-test.js — v4.88 (agreed with Sally, owner "BUILD" Fri 11/13; Alonzo: the Lillard U3.5 at −138 was filed "Heavy Favorite" by the
// model's 75.8% while La Contadora sized it at 64.4%): every cover band follows La Contadora's chance when taken (snap.act), then a typed cover,
// then the model (marked), never the price. The Bet result study can switch to the model; calibration still scores the model. Also (Alonzo: "no
// total bets so far, staked, profit"): the bet calendar shows the month so far and all time.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,700)); };
const NOW=Date.parse('2026-11-13T19:00:00Z'), iso=ms=>new Date(ms).toISOString(), H=3600e3, TIP=Date.parse('2026-11-14T02:00:00Z');
const bet=(id,o)=>Object.assign({id,key:id,sport:'NBA',kind:'prop',book:'Polymarket US',stake:1,date:'2026-11-12',dateSet:true,game:'SAC @ POR',name:'P '+id,side:'U',market:'3.5 Threes',odds:'-138',snap:{at:iso(NOW-30*H)},start:iso(NOW-24*H),result:'win',gradedBy:'espn'},o);
const LOG=[bet('lil',{name:'Damian Lillard', fair:'-313', snap:{at:iso(NOW-30*H), act:0.644, market:0.583}}),   // La Contadora 64.4% (Lean), model 75.8% (Heavy Favorite)
  bet('typ',{name:'Typed One', odds:'+110', cover:{p:0.52, pre:true}, result:'loss'}),   // no snap.act: the typed 52% (On the Line)
  bet('mod',{name:'Model Only', odds:'-120', fair:'-150'}),   // older: only the model's 60% (Lean, marked model)
  bet('oct',{name:'October Bet', date:'2026-10-30', start:'2026-10-31T00:00:00Z', fair:'-110', stake:2, result:'loss'})];
const T=(ha,abbr)=>({ha,id:abbr,abbr,name:abbr+' Team',loc:abbr,nick:'Team',logo:'',rec:'',color:'333333',alt:'ffffff'});
const ROW={name:'Board Guy',team:'PHX',game:'CHA @ PHX',matchup:'CHA @ PHX',side:'O',sport:'NBA',market:'1.5 Threes',kind:'prop',book:'Novig',offeredRaw:'-122',offeredProb:0.55,fairProb:0.70,fairRaw:'',mktProb:0.55,stars:3,evModel:'market',
  gameInfo:{state:'pre',startISO:iso(TIP),eventId:'1',timeCT:'',detail:'',teams:[T('away','CHA'),T('home','PHX')]},src:'api:NBA:props',apiKey:'bg',loadedAt:iso(NOW-60e3)};   // La Contadora min(.70, .55+.35×.15) = 60.25% (Lean); model 70% (Strong)
(async()=>{ const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:1280,height:1000}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(([L,R])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig,Polymarket US',bank:'500',cfgVer:3.03})); localStorage.setItem('mbev.cards','1'); localStorage.setItem('mbev.log',JSON.stringify(L)); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:'2026-11-13',rows:[R]})); }catch(e){} }, [LOG, ROW]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1300);
  const v=await p.evaluate(()=>{ const by=n=>logged.find(x=>x.name===n), chip=n=>{ const t=document.createElement('div'); t.innerHTML=logBandChip(by(n)); const e=t.firstElementChild; return {t:t.textContent, title:e?e.title:''}; };
    return {lil:chip('Damian Lillard'), typ:chip('Typed One'), mod:chip('Model Only'), cal:calibrationPoints().map(x=>Math.round(x.cover*1000)/1000).sort()}; });
  check('Lillard: "Lean" by La Contadora’s 64.4% (it was Heavy Favorite by the model); the tooltip says the model said 75.8%', v.lil.t==='Lean' && /^La Contadora 64\.4%/.test(v.lil.title) && /the model said 75\.8% \(Heavy Favorite\)/.test(v.lil.title), v.lil);
  check('no La Contadora chance saved: a typed cover is used (52%: On the Line) and says it was typed', v.typ.t==='On the Line' && /^Cover you typed 52\.0%/.test(v.typ.title), v.typ);
  check('an older bet with only the model: "Lean" by the model, and the tooltip says so', v.mod.t==='Lean' && /^Model \(no La Contadora chance saved\) 60\.0%/.test(v.mod.title), v.mod);
  check('calibration panels are untouched: they read the grade history (model and market), never the new band', Array.isArray(v.cal) && !v.cal.includes(0.644), v.cal);
  // Bet result study: La Contadora by default, Model on the switch
  await p.evaluate(()=>{ document.querySelector('.tab[data-view="v-perf"]').click(); }); await p.waitForTimeout(400);
  const st=async()=>p.evaluate(()=>({sum:document.getElementById('studySum').textContent, rows:[...document.querySelectorAll('#studyRows tr')].map(r=>r.children[0].textContent.replace(/\s+/g,' ').trim()+' | '+r.children[1].textContent)}));
  const s1=await st();
  check('study (La Contadora): "Band source: La Contadora · 1 La Contadora · 1 typed · 2 model"; Lean holds Lillard and the model-only bet', /^Band source: La Contadora · 1 La Contadora · 1 typed · 2 model/.test(s1.sum) && s1.rows.some(r=>/^Lean 60–<65% \| 2$/.test(r)) && !s1.rows.some(r=>/^Heavy Favorite/.test(r)), s1);
  await p.evaluate(()=>{ const s=document.getElementById('studyBand'); s.value='model'; s.dispatchEvent(new Event('change')); }); await p.waitForTimeout(300);
  const s2=await st();
  check('study (Model): Lillard is back in Heavy Favorite; nothing saved changes', /^Band source: Model/.test(s2.sum) && s2.rows.some(r=>/^Heavy Favorite 75–<80% \| 1$/.test(r)), s2);
  const hitRange=await p.evaluate(()=>[...document.querySelectorAll('#studyRows .meta')].map(x=>x.textContent).find(t=>/^\d+–\d+%$/.test(t))||null);
  check('each graded band shows a 95% range under its hit rate', !!hitRange, hitRange);
  // CSV: band by La Contadora, with its source
  const csv=await p.evaluate(()=>logCsv('')); const parse=line=>{ const out=[]; let cur='', q=false; for(let i=0;i<line.length;i++){ const ch=line[i]; if(q){ if(ch==='"'){ if(line[i+1]==='"'){ cur+='"'; i++; } else q=false; } else cur+=ch; } else if(ch==='"') q=true; else if(ch===','){ out.push(cur); cur=''; } else cur+=ch; } out.push(cur); return out; };
  const L=csv.replace(/^\ufeff/,'').split('\r\n'), head=parse(L[0]), lil=parse(L.find(x=>/Damian Lillard/.test(x)));
  check('CSV: band "Lean", band source "La Contadora"', lil[head.indexOf('band')]==='Lean' && lil[head.indexOf('band source')]==='La Contadora', {band:lil[head.indexOf('band')], src:lil[head.indexOf('band source')]});
  // board chip and a new bet's frozen band
  await p.evaluate(()=>{ document.querySelector('.tab[data-view="v-board"]').click(); }); await p.waitForTimeout(400);
  const bc=await p.evaluate(()=>{ const c=[...document.querySelectorAll('#placeCards .sc-card')].find(x=>/Board Guy/.test(x.textContent)); const ch=c&&c.querySelector('.sc-tags .cv-chip'); addToLog(lastRows.find(r=>r.apiKey==='bg')); const s=logged[logged.length-1].snap.bandSnapshot; return {chip:ch?ch.textContent:null, title:ch?ch.title:'', snap:s}; });
  check('board card: "Lean" by La Contadora’s 60.3% (the model’s 70% would say Strong)', bc.chip==='Lean' && /^La Contadora 60\.3%/.test(bc.title) && /the model says 70\.0% \(Strong\)/.test(bc.title), bc);
  check('a new bet freezes its band: p 0.6025, source act, pregame, cover-bands-v1, act-v2, bands-act-v1, v4.88', bc.snap && bc.snap.p===0.6025 && bc.snap.source==='act' && bc.snap.pregame===true && bc.snap.thresholdsPolicy==='cover-bands-v1' && bc.snap.selectionPolicy==='act-v2' && bc.snap.displayPolicy==='bands-act-v1' && bc.snap.appVersion==='v4.88', bc.snap);
  // calendar totals
  await p.evaluate(()=>{ document.querySelector('.tab[data-view="v-log"]').click(); }); await p.waitForTimeout(400);
  const tot=await p.evaluate(()=>{ lcRender(); return [...document.querySelectorAll('#lcTotals .lc-tot')].map(x=>[...x.children].map(c=>c.textContent).join(' ')); });
  check('bet calendar: "November so far · 4 bets · 2–1–0 · staked $4.00 · settled …" and "All time · 5 bets" (October included)', /^November so far 4 bets 2–1–0 staked \$\d+\.\d\d settled \+\$0\.55 ROI \+18\.3% 1 open$/.test(tot[0]||'') && /^All time 5 bets 2–2–0 staked \$\d+\.\d\d settled −\$1\.45 ROI −29\.0% 1 open$/.test(tot[1]||''), tot);
  check('no page errors', !errs.length, errs);
  await b.close(); console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(fail?1:0); })();
