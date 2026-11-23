// node tests/v514-labels-test.js [index.html] — v5.14 (owner 11/15: "Go ahead with 5.14"; Las Karens review 2, items 1 to 3). Display only: no stake,
// floor, fee or decision changes. Runs on the practice copy (tests/practice-copy.js + tests/practice-fixtures.js, an invented Sunday 2026-11-15 board and log).
// L1 + Add a bet's "Today $X of $Y daily max" is the Hard stop's number (dayStats().staked), as the Bet log strip: today's singles $11 + $12 + the Kalshi
//    fill $15 + the PrizePicks entry $5 = $43.00 of $200.00 (10% of $2,000). Before: $38.00 (the entry left out).
// L2 the model's number is called Model, not Fair, and the three chances read in order Market (no-vig) · Model · La Contadora:
//    the card's Why this play? tiles (Kelce: market 54.5%, model 59.0% (-144), La Contadora min(0.59, 0.545 + 0.35 × 0.045) = 56.075% → "56.1%");
//    + Add a bet's working lines (a 60% cover %, no market: "Model 60.0% (-150) from your cover % · La Contadora 60.0% (-150) (no market: the model alone)");
//    the Bet log column "Model then".
// L3 exchange prices with the fee: the Also at chips (Kalshi −122 = 55.0%, fee 0.07 × 0.45 = 3.15%: 55.0% × 1.0315 = 56.73% → "55.0% → 56.7% with fee";
//    Polymarket US +100 = 50.0%, fee 0.0695 × 0.5 = 3.475%: 51.74% → "50.0% → 51.7% with fee"); the card strips (Kalshi limit 48¢: 48 × (1 + 0.07 × 0.52) = 49.75
//    → "48¢ → 49.7¢ with fee", "Shares 11.43 (Kalshi takes 0.01 shares)"; Polymarket US limit 50¢ → 51.7¢, 12 whole shares: $6.34 ÷ 0.517375 = 12.25 → 12,
//    12 × 0.517375 = $6.2085 → "Cost ≤ $6.21 of your $6.34", the card's own $6.34); no page wider than the screen at 390, 1000, 1280 and 1960 px.
const path=require('path'), fs=require('fs');
const { chromium } = require('playwright');
require('./practice-fixtures.js').CFG.gameCapPct='20';   // v5.26 (STAKE-1, Build B): the game cap now holds over the board's own rows of a game; the practice board's KC @ DEN had $56 on its $40 cap (Pacheco listed), so the cap is raised here as in v517-tabrows (the caps are not what this test is about)
const { openPractice } = require('./practice-copy.js');
const html=fs.readFileSync(process.argv[2]||path.join(__dirname,'..','index.html'),'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const am2p=a=>a<0?-a/(-a+100):100/(a+100);
// two more prices for Travis Kelce Over 5.5 Receptions (DraftKings −105 on the board): Kalshi −122 and Polymarket US +100, so his card has Also at chips
const rows=B=>{ const k=B.find(r=>r.name==='Travis Kelce');
  B.push(Object.assign({},k,{book:'Kalshi', offeredRaw:'-122', offeredProb:am2p(-122), apiKey:'v514kx'}), Object.assign({},k,{book:'Polymarket US', offeredRaw:'+100', offeredProb:0.5, apiKey:'v514pm'})); return B; };
const T=s=>String(s||'').replace(/\s+/g,' ').trim();
(async()=>{
  const browser=await chromium.launch();
  const { page:p, errors } = await openPractice(browser,{html, width:1280, height:900, rows, settleMs:2500});
  await p.evaluate(()=>setMode('volado')); await p.waitForTimeout(500);
  const card=async name=>{ await p.evaluate(N=>{ const r=lastRows.find(x=>x.pass && String(x.name||'').includes(N)); if(r){ const f=passFam(r), m=f==='hail'?'clair':f; if(m!==betMode) setMode(m); } /* v5.16 (owner: more tabs): open the chance tab that lists this card */ }, name); await p.waitForTimeout(200); return p.evaluate(name=>{ const c=[...document.querySelectorAll('#placeCards .sc-card')].find(x=>x.textContent.includes(name)); if(!c) return null;
    const d=c.querySelector('details.sc-why'); if(d && !d.open){ d.open=true; }
    return {text:c.textContent.replace(/\s+/g,' '), kx:(c.querySelector('.sc-kx')||{}).textContent||'', how:((c.querySelector('.kx-how')||{}).textContent||'').replace(/\s+/g,' '),
      alts:[...c.querySelectorAll('.sc-alt')].map(a=>a.textContent.replace(/\s+/g,' ').trim()), tiles:[...c.querySelectorAll('.sc-grid2 .sc-t')].map(t=>({k:(t.querySelector('.sc-tk')||{}).textContent, v:(t.querySelector('b')||{}).textContent, s:(t.querySelector('.sc-ts')||{}).textContent||''}))}; }, name); };

  // ---- L2: the card tiles ----
  const K=await card('Travis Kelce');
  const keys=K?K.tiles.map(t=>t.k):[];
  check('L2 card: the first three tiles are Market · Model · La Contadora (was La Contadora EV, Model EV, Fair, OK up to, Market)', keys.slice(0,3).join('|')==='Market|Model|La Contadora', keys);
  check('L2 card: no tile is called Fair; the model’s 59.0% (-144) is the Model tile, the market 54.5% no-vig, La Contadora 56.1% "the chance the bet uses"',
    K && !keys.includes('Fair') && K.tiles[0].v==='54.5%' && /no-vig/.test(K.tiles[0].s) && K.tiles[1].v==='59.0%' && /^-144 · the model’s chance$/.test(K.tiles[1].s) && K.tiles[2].v==='56.1%' && K.tiles[2].s==='the chance the bet uses', K&&K.tiles.slice(0,3));
  // ---- L3: Also at chips ----
  const kxChip=(K&&K.alts||[]).find(a=>/^-122/.test(a))||'', pmChip=(K&&K.alts||[]).find(a=>/^\+100/.test(a))||'';
  check('L3 Also at: Kalshi −122 shows "55.0% → 56.7% with fee · over" (its fee pushes it past La Contadora’s 56.075%: the listed 55.0% alone would be under it)', /^-12255\.0% → 56\.7% with fee · over/.test(kxChip), kxChip);
  check('L3 Also at: Polymarket US +100 shows "50.0% → 51.7% with fee · OK ✓"', /^\+10050\.0% → 51\.7% with fee · OK ✓/.test(pmChip), pmChip);
  // ---- L3: the strips ----
  const KX=await card('Christian McCaffrey'), PM=await card('Anthony Davis');
  check('L3 Kalshi strip: "Shares 11.43 (Kalshi takes 0.01 shares)" and "Limit 48¢ → 49.7¢ with fee", Max cost $5.69 = the card’s $5.69',
    KX && /Shares 11\.43 \(Kalshi takes 0\.01 shares\)/.test(KX.kx) && /Limit 48¢ → 49\.7¢ with fee/.test(KX.kx) && /Max cost \$5\.69/.test(KX.kx) && /\$5\.69wins/.test(KX.text), KX&&KX.kx);
  check('L3 Kalshi Why this play?: the limit box says "48¢ with the fee" → 49.7¢', KX && /49\.7¢ with the fee/.test(KX.how), KX&&KX.how.slice(0,300));
  check('L3 Polymarket strip: "Limit 50¢ → 51.7¢ with fee", "Shares 12 (whole shares)", "Cost ≤ $6.21 of your $6.34" and the card says $6.34',
    PM && /Limit 50¢ → 51\.7¢ with fee/.test(PM.kx) && /Shares 12 \(whole shares\)/.test(PM.kx) && /Cost ≤ \$6\.21 of your \$6\.34/.test(PM.kx) && /\$6\.34wins/.test(PM.text), PM&&PM.kx);
  check('L3 Polymarket Why this play?: "Cost ≤ $6.21" with "of your $6.34 bet: whole shares at 50¢ + fee", the limit box "51.7¢ with the fee"',
    PM && /Cost ≤ \$6\.21of your \$6\.34 bet: whole shares at 50¢ \+ fee/.test(PM.how) && /51\.7¢ with the fee/.test(PM.how), PM&&PM.how);

  // ---- layouts ----
  for(const W of [390,1000,1280,1960]){ await p.setViewportSize({width:W, height:900}); await p.waitForTimeout(300);
    const L=await p.evaluate(()=>{ document.querySelectorAll('#placeCards details.sc-why').forEach(d=>d.open=true); const vw=document.documentElement.clientWidth;
      const out=[...document.querySelectorAll('#placeCards .sc-kx-i, #placeCards .sc-alt, #placeCards .sc-t, #placeCards .kx-b')].filter(e=>e.offsetParent).map(e=>{ const r=e.getBoundingClientRect(), c=e.closest('.sc-card').getBoundingClientRect(); return {t:e.textContent.slice(0,40), over:r.right>c.right+1||r.left<c.left-1}; }).filter(x=>x.over);
      return {page:document.documentElement.scrollWidth-vw, out}; });
    check('layout at '+W+' px: the page is not wider than the screen, and no strip box, chip or tile runs past its card', L.page<=0 && !L.out.length, L); }
  await p.setViewportSize({width:1280, height:900});

  // ---- L1: daily max ----
  await p.click('.tab[data-view="v-log"]'); await p.waitForTimeout(500);
  const strip=await p.evaluate(()=>({meter:document.getElementById('lcMaxL').textContent, hard:+((dayStats()[ctDay(Date.now())]||{}).staked||0).toFixed(2)}));
  const ab=async(cov)=>{ await p.evaluate(async(cov)=>{ document.querySelector('.tab[data-view="v-add"]').click(); const d=document.getElementById('addBetPanel'); if(d && !d.open){ d.open=true; d.dispatchEvent(new Event('toggle')); }
      for(let i=0;i<30 && !document.querySelector('#abHost .editor');i++) await new Promise(r=>setTimeout(r,100));
      const m=document.getElementById('abMore'); if(m) m.open=true; const c=document.getElementById('abCover'); c.value=String(cov); c.dispatchEvent(new Event('input',{bubbles:true}));
      const o=document.querySelector('#abHost .eb-odds'); o.value='+120'; o.dispatchEvent(new Event('input',{bubbles:true})); }, cov); await p.waitForTimeout(500);
    return p.evaluate(()=>document.getElementById('abVerdict').textContent.replace(/\s+/g,' ')); };
  const V=await ab(60);
  const today=(V.match(/Today \$[\d.]+ of \$[\d.]+ daily max/)||[''])[0];
  check('L1 + Add a bet: "Today $43.00 of $200.00 daily max", the Bet log strip’s and the Hard stop’s number (parlay entry included; it said $38.00)', today==='Today $43.00 of $200.00 daily max' && /^\$43\.00 of your \$200\.00 daily max/.test(strip.meter) && strip.hard===43, {today, strip});
  // ---- L2: + Add a bet ----
  check('L2 + Add a bet: "Model 60.0% (-150) from your cover % · La Contadora 60.0% (-150) (no market: the model alone)", no "Fair 60.0%"',
    /Model 60\.0% \(-150\) from your cover % · La Contadora 60\.0% \(-150\) \(no market: the model alone\)/.test(V) && !/Fair 60\.0%/.test(V), V.slice(0,600));
  // ---- L2: Bet log column ----
  const th=await p.evaluate(()=>[...document.querySelectorAll('#v-log thead th')].map(x=>x.textContent.trim()));
  check('L2 Bet log: the column is "Model then" (was "Fair then")', th.includes('Model then') && !th.includes('Fair then'), th);

  check('no page errors', !errors.length, errors.slice(0,3));
  console.log('\n'+pass+' passed, '+fail+' failed'); await browser.close(); process.exit(fail?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
