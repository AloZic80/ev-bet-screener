// node tests/cover-study-test.js — v4.31. Alonzo: "Augi did some changes for stats that I would like to see on mine; his features, with our math".
// Augi's 5-point cover bands: a chip on the board's Cover cell and on each Sentinels card, and Performance › Bet result study: per band, logged,
// pending, W–L–P, average prediction, hit rate, difference and profit, from our graded singles. Numbers checked by hand below.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const NOW=Date.parse('2026-11-09T18:00:00Z'), H=3600e3, iso=ms=>new Date(ms).toISOString(), DAY='2026-11-09';
const B=(id,fair,odds,stake,result)=>Object.assign({id,key:id,name:'Player '+id,sport:'NBA',kind:'prop',market:'10.5 Points',side:'O',book:'Novig',odds,offeredRaw:odds,stake,fair,date:DAY,dateSet:true,start:iso(NOW-4*H)},result?{result,gradedBy:'manual',resultSrc:'you',manual:true}:{});
// Lean (60%): a win at -110 ($10 → +$9.09), a loss ($10 → −$10), one pending. Unlikely (40%; "Long Shot" before v4.51): a win at +200 ($5 → +$10). High Cover (80%): a push.
const LOG=[B('a','-150','-110',10,'win'),B('b','-150','-110',10,'loss'),B('c','-150','-110',10,null),B('d','+150','+200',5,'win'),B('e','-400','-110',4,'push')];
const T=(ha,abbr,loc,nick)=>({ha,id:abbr,abbr,name:loc+' '+nick,loc,nick,logo:'',rec:'',color:'333333',alt:'ffffff'});
const ROWS=[{name:'Naz Reid',team:'MIN',game:'LAC @ MIN',matchup:'LAC @ MIN',side:'O',sport:'NBA',market:'16.5 Points',kind:'prop',book:'Novig',offeredRaw:'-108',offeredProb:0.52,fairProb:0.62,fairRaw:'',mktProb:0.6,stars:4,evModel:'market',
  gameInfo:{state:'pre',startISO:iso(NOW+6*H),timeCT:'',detail:'',teams:[T('away','LAC','Los Angeles','Clippers'),T('home','MIN','Minnesota','Timberwolves')]},src:'api:NBA:props',apiKey:'k1',loadedAt:iso(NOW-60e3)}];
(async()=>{
  const b=await chromium.launch();
  const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:1280,height:900}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(([L,R,d])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.log',JSON.stringify(L)); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig',cfgVer:3.03})); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows:R})); }catch(e){} }, [LOG,ROWS,DAY]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/api\.0xbeta\.dev/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1200);
  const card=await p.evaluate(()=>[...document.querySelectorAll('#placeCards .sc-card .cv-chip')].map(c=>c.textContent));
  await p.uncheck('#cardsOn'); await p.waitForTimeout(400);   // Cards off: the same bet is a table row
  const chips={card, cell:await p.evaluate(()=>[...document.querySelectorAll('#tbody td .cv-chip')].map(c=>c.textContent))};
  await p.check('#cardsOn'); await p.waitForTimeout(200);
  check('a 62% pick says "Lean" (60–<65%) on its Sentinels card and in the board\'s Cover cell', chips.card.includes('Lean') && chips.cell.includes('Lean'), chips);
  await p.evaluate(()=>document.querySelector('.tab[data-view="v-perf"]').click()); await p.waitForTimeout(500);
  const rows=await p.evaluate(()=>[...document.querySelectorAll('#studyRows tr')].map(tr=>[...tr.children].map(td=>td.innerText.replace(/\s+/g,' ').trim())));
  const row=n=>rows.find(r=>r[0].startsWith(n))||null;
  const lean=row('Lean'), ls=row('Unlikely'), hc=row('High Cover');
  check('Lean: 3 logged, 1 pending, 1–1–0, predicted 60.0%, hit 50.0%, −10.0 pts, profit −$0.91 (+9.09 − 10)', lean && lean.slice(1).join('|')==='3|1|1–1–0|60.0%|50.0%|−10.0 pts|−$0.91', lean);
  check('Unlikely (v4.51: the band that was "Long Shot"): 1–0–0, predicted 40.0%, hit 100.0%, +60.0 pts, +$10.00', ls && ls.slice(1).join('|')==='1|0|1–0–0|40.0%|100.0%|+60.0 pts|+$10.00', ls);
  check('High Cover: a push is logged but not in the hit rate (—), profit $0', hc && hc.slice(1).join('|')==='1|0|0–0–1|—|—|—|+$0.00', hc);
  check('bands with no bets are left out (3 rows)', rows.length===3, rows.map(r=>r[0]));
  const sum=await p.evaluate(()=>document.getElementById('studySum').textContent);
  check('the summary counts 5 singles, 4 settled tickets (4 outcomes, 4 games), 3 graded, and says it is an early sample', /^5 singles · 4 settled tickets · 4 unique outcomes · 4 unique games · 3 graded/.test(sum)   /* v4.68: tickets, outcomes and games */ && /early sample/.test(sum), sum);
  await p.selectOption('#studyScope','day'); await p.waitForTimeout(200);
  const n2=await p.evaluate(()=>document.querySelectorAll('#studyRows tr').length);
  check('Today keeps them (all on today\'s game day)', n2===3, n2);
  check('no page errors', !errs.length, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
