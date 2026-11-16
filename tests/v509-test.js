// node tests/v509-test.js — v5.09 (Alonzo, 11/13, a Hard Rock card at 69.7% "OK to 70.2%": "novig is at 70%, so, you can do that also?"; "best bet on
// top, then the other under ... but only the part of same but 70%"; agreed with Sally CC-2026-11-15-01/02; owner "Build", "As you think is best").
// "also at" now also shows the exchange prices the Sentinels read and a one-tap check of Novig, Kalshi and Polymarket US. Confirmed (fresh, a book you
// bet, near the market, inside her OK to at that book) = OK ✓, ordered by La Contadora's EV after that book's fee; over; ⚠ verify (8 pts); last seen
// (old, or a later check could not read it); books you do not bet on a "reference only" line. Only "no offer" / "line moved" remove an older price.
// Display only. Every expected number is worked here by hand.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,900)); };
const NOW=Date.parse('2026-11-15T01:00:00Z'), H=3600e3, M=60e3, iso=ms=>new Date(ms).toISOString(), DAY='2026-11-14';
const T=(ha,abbr,loc,nick)=>({ha,id:abbr,abbr,name:loc,loc,nick,logo:'',rec:'',color:'333333',alt:'ffffff'});
const TEAMS=[T('away','NSH','Nashville','Predators'),T('home','VGK','Vegas','Golden Knights')];
const row=(extra)=>Object.assign({name:'Shane Wright',team:'NSH',game:'NSH @ VGK',matchup:'NSH @ VGK',side:'U',sport:'NHL',market:'0.5 Points',kind:'prop',book:'Hard Rock',offeredRaw:'-230',offeredProb:230/330,fairProb:0.73,fairRaw:'',mktProb:0.705,stars:3,evModel:'market',
  gameInfo:{state:'pre',startISO:iso(NOW+2*H),timeCT:'',detail:'',teams:TEAMS},src:'api:NHL:props',apiKey:'hr',loadedAt:iso(NOW-60e3)},extra||{});
/* By hand. Her chance = min(0.73, 0.705 + 0.35 × 0.025) = 0.71375; floor 1.5%. EV at p with fee f = ((0.71375/p − 1) − f)/(1 + f).
   Kalshi fee 0.07(1 − p), Polymarket US 0.0695(1 − p), Novig and Hard Rock 0. Her most: no fee 0.71375/1.015; fee c(1 − p): smaller root of
   c·p² − (1 + c)·p + 0.71375/1.015 = 0. */
const ACT=0.71375, FLOOR=0.015, P0=230/330, ev=(p,f)=>((ACT/p-1)-(f||0))/(1+(f||0)), kf=p=>0.07*(1-p), pf=p=>0.0695*(1-p);
const most0=ACT/(1+FLOOR), mostC=c=>((1+c)-Math.sqrt((1+c)*(1+c)-4*c*ACT/(1+FLOOR)))/(2*c), near=(a,b)=>Math.abs(a-b)<1e-6;
async function open(b, o){ o=o||{}; const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:o.W||1280,height:1100}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(([rows,d,bk])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books:bk,bank:'500',cfgVer:3.03})); localStorage.setItem('mbev.cards','1');
    localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows})); }catch(e){} }, [o.rows||[row()], DAY, o.books||'Hard Rock, Novig, Kalshi, Polymarket US']);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); const S={ctx,p,errs,calls:[],live:o.live||(()=>null),fail:null};
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/\/live\?/.test(u)){ const bets=JSON.parse(decodeURIComponent(u.split('bets=')[1])); S.calls.push(bets.map(d=>d.id));
      if(S.fail && bets.some(d=>/^alt:/.test(d.id))) return r.fulfill({status:S.fail,contentType:'application/json',body:'{}'});
      const R={}; bets.forEach(d=>{ const [kind,,bk]=d.id.split(':'); const a=S.live(kind,bk); if(a==null) return; R[d.id]=typeof a==='number'?{ok:true, src:bk, price:a, at:new Date(Date.now()).toISOString(), url:bk==='novig'?undefined:'https://'+(bk==='kalshi'?'kalshi.com':'polymarket.us')+'/m/x', outcome:bk==='novig'?'out-1':undefined}:a; });
      return r.fulfill({contentType:'application/json',body:JSON.stringify({at:new Date(Date.now()).toISOString(),results:R})}); }
    if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1300);
  for(const t of ['safe','boring','tranqui','parejo','volado','dado','lucky','hail'] /* v5.16 (owner: more tabs) */){ const has=await p.evaluate(()=>!!document.querySelector('#placeCards .sc-card .sc-alts')); if(has) break; await p.evaluate(m=>{ try{ setMode(m); }catch(e){} }, t); await p.waitForTimeout(250); }
  return S; }
const chkCalls=S=>S.calls.filter(ids=>ids.some(id=>/^alt:/.test(id)));
const look=S=>S.p.evaluate(()=>{ const c=[...document.querySelectorAll('#placeCards .sc-card')].find(x=>x.textContent.includes('Shane Wright')), tx=x=>x?x.textContent.replace(/\s+/g,' ').trim():null, r=lastRows.find(x=>x.apiKey==='hr');
  const S=c&&c.querySelector('.sc-alts'), chip=x=>({txt:[tx(x.querySelector('b')),tx(x.querySelector('small'))].join(' · '), ok:x.classList.contains('ok'), seen:x.classList.contains('seen'), far:x.classList.contains('far'), href:x.getAttribute('href')});
  return {has:!!S, main:S?[...S.querySelectorAll(':scope > .sc-alt, :scope > details .sc-alt')].map(chip):[], ref:S?[...S.querySelectorAll('.sc-alts-ref .sc-alt')].map(chip):[], notes:S?[...S.querySelectorAll('.sc-alt-n')].map(tx):[], btn:S?tx(S.querySelector('.sc-alt-chk')):null,
    card:{book:r.book, p:r.offeredProb, stake:r.stake, actNet:r.actNet, pass:r.pass, shop:r.shop||null}}; });
const press=async S=>{ await S.p.evaluate(()=>{ const b=[...document.querySelectorAll('#placeCards .sc-card')].find(x=>x.textContent.includes('Shane Wright')).querySelector('.sc-alt-chk'); b.click(); }); await S.p.waitForTimeout(600); };
const books=v=>v.main.map(c=>c.txt.replace(' · ','|'));
(async()=>{
  const b=await chromium.launch();
  check('by hand: her chance 71.375%; her most with no fee '+(most0*100).toFixed(3)+'%, with Kalshi’s fee '+(mostC(0.07)*100).toFixed(3)+'%; EV Hard Rock '+(ev(P0)*100).toFixed(2)+'%, Novig 70% '+(ev(0.70)*100).toFixed(2)+'%, Kalshi 70% '+(ev(0.70,kf(0.70))*100).toFixed(2)+'%',
    near(Math.min(0.73,0.705+0.35*0.025),ACT) && Math.abs(most0-0.703202)<1e-6 && Math.abs(mostC(0.07)-0.688181)<1e-6 && near(ev(mostC(0.07),kf(mostC(0.07))),FLOOR) && ev(0.70)>FLOOR && ev(0.70,kf(0.70))<0, {most0, mk:mostC(0.07)});

  // ===== 1. the owner's case: the Sentinels read Novig at 70.0%, a little worse than Hard Rock: it was never shown =====
  let S=await open(b, {live:(kind,bk)=>kind==='shop'&&bk==='novig'?0.70:kind==='shop'&&bk==='kalshi'?0.70:null});
  let v=await look(S); const before=JSON.stringify(v.card);
  check('before any read: the card has an "also at" strip with ↻ check exchanges and no prices yet', v.has && v.btn==='↻ check exchanges' && v.main.length===0 && chkCalls(S).length===0, v);
  await S.p.evaluate(async()=>{ await shopExchanges(); }); await S.p.waitForTimeout(400); v=await look(S);
  check('Send the Sentinels: Novig 70.0% stays off the card (Hard Rock is fresh and better) but now shows under it: "-233 · 70.0% · OK ✓"; Kalshi 70.0% is over her OK to there (fee) and comes second',
    v.card.book==='Hard Rock' && JSON.stringify(books(v))===JSON.stringify(['-233|70.0% · OK ✓','-233|70.0% → 71.5% with fee · over']) /* v5.14 (owner: Karens review 2): Kalshi with its fee, 70 × (1 + 0.07 × 0.30) = 71.47% */ && v.main[0].ok && v.main[1].ok===false && /novig\.com/.test(v.main[0].href||''), {main:v.main, card:v.card});
  check('Novig’s chip opens its slip (no stake filled); Kalshi’s opens its market', v.main[0].href==='https://novig.com/events/out-1/novig' && v.main[1].href==='https://kalshi.com/m/x', v.main.map(x=>x.href));
  check('no "better" line: Novig’s EV '+(ev(0.70)*100).toFixed(2)+'% is under the card’s '+(ev(P0)*100).toFixed(2)+'%', !v.notes.some(n=>/Better confirmed/.test(n)), v.notes);
  // ===== 2. the one-tap check =====
  S.live=(kind,bk)=>kind!=='alt'?null:bk==='poly'?0.66:bk==='kalshi'?{ok:false, note:'Kalshi: no offer to buy right now'}:{ok:false, busy:true, note:'Novig: busy — too many markets to read in one go, try again in a minute'};
  await press(S); v=await look(S);
  check('one tap = ONE Worker call for this bet at the three exchanges', chkCalls(S).length===1 && chkCalls(S)[0].length===3, chkCalls(S));
  check('Polymarket US at 66.0% (EV '+(ev(0.66,pf(0.66))*100).toFixed(2)+'% after its fee) goes FIRST, OK ✓; the card’s EV is lower by more than 0.3 pts, so "Better confirmed price at Polymarket US · Send the Sentinels to update the card"',
    v.main[0] && /^-194 · 66\.0% → 67\.6% with fee · OK ✓/.test(v.main[0].txt) /* v5.14 (owner: Karens review 2): 66 × (1 + 0.0695 × 0.34) = 67.56% */ && v.main[0].ok && v.notes.includes('Better confirmed price at Polymarket US · Send the Sentinels to update the card') && ev(0.66,pf(0.66))>ev(P0)+0.003, {main:v.main, notes:v.notes});
  check('Kalshi said "no offer": its older 70.0% is removed and it says "Kalshi · no offer now"', !v.main.some(c=>/over/.test(c.txt) && /-233/.test(c.txt) && !c.seen) && v.notes.includes('Kalshi · no offer now') && v.main.length===2, {main:v.main, notes:v.notes});
  check('Novig was busy: its older 70.0% stays, grey, no ✓: "last seen · was OK · could not refresh"', v.main[1] && v.main[1].seen && !v.main[1].ok && /70\.0% · last seen · was OK · could not refresh/.test(v.main[1].txt), v.main[1]);
  check('display only: the card did not move (book, price, stake, EV, no best-book claim)', JSON.stringify(v.card)===before, v.card);
  S.fail=500; await press(S); v=await look(S);
  check('a check that fails keeps what the last good one found and says so', v.main.length===2 && v.main[0].ok && /Polymarket|-194/.test(v.main[0].txt) && v.notes.some(n=>/could not read the exchanges \(the Worker answered 500\)/.test(n)), {main:v.main, notes:v.notes});
  check('no page errors (1)', !S.errs.length, S.errs); await S.ctx.close();

  // ===== 3. old prices, far prices, reference only =====
  S=await open(b, {books:'Hard Rock, Novig', rows:[row(), row({apiKey:'dk', book:'DraftKings', offeredRaw:'-163', offeredProb:0.62, loadedAt:iso(NOW-60e3)}), row({apiKey:'nv', book:'Novig', offeredRaw:'-233', offeredProb:0.70, loadedAt:iso(NOW-11*M)})],
    live:(kind,bk)=>kind==='alt'&&bk==='kalshi'?0.60:null});
  v=await look(S);
  check('a board price read 11 min ago (over the 3-min window) is "last seen · was OK · ⏱ 11 min", grey, no ✓', v.main.length===1 && v.main[0].seen && !v.main[0].ok && /70\.0% · last seen · was OK · ⏱ 11 min/.test(v.main[0].txt), v.main);
  check('DraftKings (not in your books) is on the "reference only" line, never OK ✓ (and 8.5 pts from the market: verify)', v.ref.length===1 && /reference only/.test(await S.p.evaluate(()=>document.querySelector('.sc-alts-ref').textContent)) && !v.ref[0].ok && /62\.0% · ⚠ verify line/.test(v.ref[0].txt), v.ref);
  await press(S); v=await look(S);
  check('Kalshi at 60.0% read now is 10.5 pts from the market (70.5%): "⚠ verify line", never OK ✓, never first, and on the reference line (not in your books)', v.ref.some(c=>/60\.0% → 61\.7% with fee · ⚠ verify line/.test(c.txt) /* v5.14 (owner: Karens review 2): 60 × (1 + 0.07 × 0.40) = 61.68% */ && !c.ok) && !v.main.some(c=>/60\.0%/.test(c.txt)), {main:v.main, ref:v.ref});
  check('no enabled book confirmed: "No enabled book currently inside La Contadora’s limit besides this card"', v.notes.includes('No enabled book currently inside La Contadora’s limit besides this card'), v.notes);
  await S.ctx.close();
  S=await open(b, {books:'Novig, Kalshi'});   /* a card at a book you do not bet never reaches Place these (it moves to your book or stays off), so the strip is read directly */
  const rc=await S.p.evaluate(()=>altBooksHtml(lastRows.find(x=>x.apiKey==='hr')).replace(/<[^>]+>/g,'|'));
  check('the card’s own book not in your books: "this card · not in your books" on the reference line', /reference only · not in your books\|*-230\|*69\.7% · this card · not in your books/.test(rc), rc);
  check('no page errors (3)', !S.errs.length, S.errs); await S.ctx.close();

  // ===== 4. layout =====
  for(const W of [390,1000,1280,1960]){
    S=await open(b, {W, live:(kind,bk)=>kind!=='alt'?null:bk==='novig'?0.70:bk==='kalshi'?0.70:0.66}); await press(S);
    const L=await S.p.evaluate(()=>{ const c=[...document.querySelectorAll('#placeCards .sc-card')].find(x=>x.textContent.includes('Shane Wright')), cr=c.getBoundingClientRect();
      const parts=[...c.querySelectorAll('.sc-alts .sc-alt, .sc-alt-chk, .sc-alt-n')].filter(x=>x.offsetParent).map(x=>x.getBoundingClientRect());
      return {over:document.documentElement.scrollWidth-innerWidth, inCard:parts.every(r=>r.left>=cr.left-1 && r.right<=cr.right+1), tall:[...c.querySelectorAll('.sc-alts > .sc-alt, .sc-alt-chk')].every(x=>x.getBoundingClientRect().height>=32), n:parts.length}; });
    check(W+' px: the strip fits in the card, chips and the check button are 32 px or taller, no sideways scroll', L.over<=0 && L.inCard && L.tall && L.n>=4, L);
    check('no page errors ('+W+')', !S.errs.length, S.errs); await S.ctx.close(); }
  const dup=(html.match(/\nfunction (\w+)\(|\nasync function (\w+)\(/g)||[]).map(x=>x.replace(/\n(async )?function /,'').replace('(','')), seen={}, twice=dup.filter(n=>(seen[n]=(seen[n]||0)+1)===2);
  check('no function declared twice', !twice.length, twice);
  await b.close(); console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(fail?1:0); })();
