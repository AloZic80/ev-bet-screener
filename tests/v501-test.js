// node tests/v501-test.js — v5.01, Sally's 8 (agreed 11/14, owner: "Ok, build"): the outlier names its trigger; a far-off "also at" price says
// ⚠ VERIFY LINE/MARKET and is never OK ✓; the same bet at a worse book says PRICE PASSES · better at …; the Moneylines page is price research only;
// the stake names the limit that cut it; Said vs won (calibration-v1) in Reports. Labels and a report only: no stake, floor or fee changed.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,600)); };
const NOW=Date.parse('2026-11-13T19:00:00Z'), H=3600e3, iso=ms=>new Date(ms).toISOString(), TIP=Date.parse('2026-11-14T02:00:00Z');
const T=(ha,abbr)=>({ha,id:abbr,abbr,name:abbr+' Team',loc:abbr,nick:'Team',logo:'',rec:'',color:'333333',alt:'ffffff'});
const GI=e=>({state:'pre',startISO:iso(TIP),eventId:e,timeCT:'',detail:'',teams:[T('away','CHA'),T('home','PHX')]});
const am=p=>p>=0.5?String(Math.round(-100*p/(1-p))):'+'+Math.round(100*(1-p)/p);
const row=(id,name,book,price,fair,mkt,extra)=>Object.assign({name,team:'PHX',game:'CHA @ PHX',matchup:'CHA @ PHX',side:'O',sport:'NBA',market:'1.5 Threes',kind:'prop',book,offeredRaw:am(price),offeredProb:price,fairProb:fair,fairRaw:'',mktProb:mkt,stars:3,evModel:'market',gameInfo:GI('g1'),src:'api:NBA:props',apiKey:id,loadedAt:iso(NOW-60e3)},extra||{});
const ROWS=[
  row('both','Both Outlier','Novig',0.60,0.80,0.62,{market:'0.5 Blocks'}),            // model EV +33%, gap 18 pts
  row('gap','Gap Outlier','Novig',0.66,0.70,0.60,{market:'0.5 Steals'}),              // model EV +6%, gap 10 pts
  row('ev','Ev Outlier','Novig',0.50,0.60,0.56,{market:'4.5 Assists'}),               // model EV +20%, gap 4 pts
  row('nov','Same Bet','Novig',0.54,0.60,0.585,{market:'2.5 Threes'}),                // the same bet at two books: Novig is the better price
  row('dk','Same Bet','DraftKings',0.555,0.60,0.585,{market:'2.5 Threes'}),
  row('far','Far Pick','Novig',0.55,0.60,0.59,{market:'6.5 Rebounds'}),
  row('farx','Far Pick','DraftKings',0.45,0.60,0.59,{market:'6.5 Rebounds'})];         // 14 pts from the market: verify the line
(async()=>{ const b=await chromium.launch(); const errs=[];
  const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:1280,height:900}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(R=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig,DraftKings',bank:'5000',cfgVer:3.03})); localStorage.setItem('mbev.cards','1'); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:'2026-11-13',rows:R})); }catch(e){} },ROWS);
  const p=await ctx.newPage(); p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1500);
  check('version v5.01 or later in the three places', await p.evaluate(()=>/^v5\.\d\d$/.test(SCREENER_VERSION) && SCREENER_VERSION>='v5.01' && document.title.includes(SCREENER_VERSION) && document.getElementById('verTag').textContent===SCREENER_VERSION));
  // ---- 2. outlier wording ----
  const O=await p.evaluate(()=>{ const f=k=>{ const r=lastRows.find(x=>x.apiKey===k); return {out:!!r.outlier, why:r.outlierWhy||'', flag:(r.flags.find(x=>/OUTLIER/.test(x[1]))||[,''])[1]}; }; return {both:f('both'), gap:f('gap'), ev:f('ev')}; });
  check('2. both triggers: "OUTLIER · model EV above 15% and model–market gap above 8 pts"', O.both.out && O.both.why==='OUTLIER · model EV above 15% and model–market gap above 8 pts' && /stake capped at the minimum$/.test(O.both.flag), O.both);
  check('2. the gap alone: "MODEL–MARKET OUTLIER · model 70.0%, market 60.0% · gap 10.0 pts exceeds your 8-pt limit"', O.gap.out && O.gap.why==='MODEL–MARKET OUTLIER · model 70.0%, market 60.0% · gap 10.0 pts exceeds your 8-pt limit', O.gap);
  check('2. the model EV alone names it model-only, and gives La Contadora’s EV beside it', O.ev.out && /^MODEL EV OUTLIER · model-only EV \+20\.0% exceeds your 15% trust limit · La Contadora EV [+−-]?\d+\.\d%$/.test(O.ev.why), O.ev);
  // ---- 3. far-off also-at price ----
  const A=await p.evaluate(()=>{ const r=lastRows.find(x=>x.apiKey==='far'), al=altBooksOf(r), d=al.find(a=>/DraftKings/.test(a.book)); return {n:al.length, far:d&&d.far, ok:d&&d.ok, gap:d&&+d.gap.toFixed(3), vl:(lastRows.find(x=>x.apiKey==='farx').verifyLine)||null, html:altBooksHtml(r)}; });
  check('3. a price 14 pts from the market: ⚠ verify line, never OK ✓, the gap saved on the row', A.far===true && A.ok===false && A.gap===0.14 && A.vl && A.vl.gap===0.14 && A.vl.book==='DraftKings' && /⚠ verify line/.test(A.html) && /VERIFY LINE\/MARKET · price 45\.0%, market 59\.0% · gap 14\.0 pts/.test(A.html) && !/OK ✓/.test(A.html), {far:A.far, ok:A.ok, gap:A.gap, vl:A.vl});
  const A2=await p.evaluate(()=>{ const r=lastRows.find(x=>x.apiKey==='nov'), al=altBooksOf(r); return al.map(a=>({b:a.book, far:a.far})); });
  check('3. a near price (1.5 pts off) gets no flag', A2.length===1 && A2[0].far===false, A2);
  const A3=await p.evaluate(()=>{ const r=Object.assign({},lastRows.find(x=>x.apiKey==='far'),{mktProb:null}); return altBooksOf(r).map(a=>a.far); });
  check('3. no market price → no distance flag', A3.length && A3.every(x=>x===false), A3);
  // ---- 4. price passes, better at ----
  const D=await p.evaluate(()=>{ const r=lastRows.find(x=>x.apiKey==='dk'), n=lastRows.find(x=>x.apiKey==='nov'); return {dk:decisionHtml(r,cfgRead()).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim(), conf:!!r.glConflict, nov:n.stake}; });
  check('4. the same bet at the worse book: "PRICE PASSES · better at Novig", not SKIP', D.conf && /^PRICE PASSES better at Novig/.test(D.dk) && !/SKIP/.test(D.dk) && D.nov>0, D);
  // ---- 8. cap wording ----
  const C=await p.evaluate(()=>{ const r=lastRows.find(x=>x.apiKey==='nov'), cfg=cfgRead(); return {by:r.capBy, raw:r.kellyRaw, max:cfg.sMax, st:r.stake, dec:decisionHtml(r,cfg), det:capDetail(r,cfg)}; });
  check('8. a stake cut by Settings max: "capped at your max bet", detail "Uncapped Kelly $X → Settings max reduced it to $Y"', C.by==='max' && C.raw>C.max && /capped at your max bet/.test(C.dec) && C.det==='Uncapped Kelly $'+C.raw.toFixed(2)+' → Settings max reduced it to $'+C.st.toFixed(2), C);
  const C2=await p.evaluate(()=>{ const r=lastRows.find(x=>x.apiKey==='gap'); return {by:r.capBy, st:r.stake, det:capDetail(r)}; });
  check('8. an outlier names the outlier minimum as the binding limit, max bet listed as also applied when it was', !C2.st || (C2.by==='outlier' && /the outlier minimum reduced it to/.test(C2.det)), C2);
  // ---- 5. Moneylines ----
  const M=await p.evaluate(()=>({ban:document.getElementById('mlResearch').textContent.replace(/\s+/g,' ').trim(), head:[...document.querySelectorAll('#v-money th')].map(t=>t.textContent).join('|'), lab:document.querySelector('label[for="moneyMinEv"]').textContent, src:renderMoneylines.toString()}));
  check('5. Moneylines: "PRICE RESEARCH ONLY · decisions and stakes are on the Board", no Bet Now column, the edge box is a filter, links say Open book ↗', M.ban==='PRICE RESEARCH ONLY · decisions and stakes are on the Board' && !/Bet Now/.test(M.head) && /Hide lines under edge %/.test(M.lab) && /Open book ↗/.test(M.src) && !/>Bet<\/a>/.test(M.src), {ban:M.ban, lab:M.lab});
  // ---- 7. Said vs won ----
  const K=await p.evaluate(()=>{ const st=iso=>iso, mk=(i,act,res,g)=>({id:'c'+i, kind:'prop', name:'P'+i, market:'1.5 Threes', side:'O', sport:'NBA', game:'G'+g+' @ H', start:'2026-11-10T02:00:00Z', date:'2026-11-09', stake:2, odds:'-110', result:res, snap:{at:'2026-11-09T20:00:00Z', act}});
    const L=[]; for(let i=0;i<40;i++) L.push(mk(i, 0.62, i<20?'win':'loss', i%20));   // 40 outcomes, 20 games, said 62%, won 50%
    L.push(Object.assign(mk(0,0.70,'win',0),{id:'dup', snap:{at:'2026-11-09T21:00:00Z', act:0.70}}));   // a later ticket on outcome 0: does not count
    const C=saidWonRows(L), w=wilson95(5,10); return {n:C.n, games:C.games, rows:C.rows.map(r=>({lo:r.lo, n:r.n, k:r.k, avg:+r.avg.toFixed(3), side:r.side, word:r.word})), w:[+w.lo.toFixed(4), +w.hi.toFixed(4)], html:rpCalHtml({L}).replace(/<[^>]+>/g,' ').replace(/\s+/g,' '), w30:calWord(30,15), w99:calWord(99,60), w100:calWord(100,50), w29:calWord(29,40), g14:calWord(200,14)}; });
  check('7. one forecast per outcome (the earliest ticket), 5-point bands: 40 outcomes in the 60–65% band, 20 wins', K.n===40 && K.games===20 && K.rows.length===1 && K.rows[0].lo===60 && K.rows[0].n===40 && K.rows[0].k===20 && K.rows[0].avg===0.62, K.rows);
  check('7. Wilson 95%: 5 of 10 → 23.66% to 76.34%', K.w[0]===0.2366 && K.w[1]===0.7634, K.w);
  check('7. sample words: under 30 or under 15 games "too few to read"; 30–99 "early sample"; 100+ and 50+ games "readable, still uncertain"', K.w29==='too few to read' && K.g14==='too few to read' && K.w30==='early sample' && K.w99==='early sample' && K.w100==='readable, still uncertain', K);
  check('7. "said too high" only when the range leaves out her average (50% won, range ~35–65%, said 62%: inside → no verdict)', K.rows[0].side==='' && !/· said too/.test(K.html) && /early sample/.test(K.html) && /calibration-v1/.test(K.html), K.html.slice(0,300));
  await p.click('.tab[data-view="v-reports"]').catch(()=>{}); await p.evaluate(()=>{ const t=document.querySelector('.tab[data-view="v-reports"]')||document.querySelector('[data-view="v-reports"]'); if(t) t.click(); }); await p.waitForTimeout(400);
  check('7. the Reports page has the Said vs won section', await p.evaluate(()=>!!document.getElementById('rpCal') && /Said vs won/.test(document.getElementById('v-reports').textContent)));
  check('no page errors', !errs.length, errs);
  await b.close(); console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(fail?1:0); })();
