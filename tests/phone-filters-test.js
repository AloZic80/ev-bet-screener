// node tests/phone-filters-test.js — v4.60 (Alonzo, phone: "I think this can be on a drop down?", "Also this", "For now only on phone"):
// on a phone (390 px) the board bar shows only the search box, Filters and Send the Sentinels; Show, Sort, Sport, the book chips, the tick boxes,
// Show all notes and Cards fold behind Filters. The button says what is hiding bets. At 1000, 1280 and 1960 px nothing changes.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,600)); };
const NOW=Date.parse('2026-11-11T18:00:00Z'), iso=ms=>new Date(ms).toISOString(), KO=Date.parse('2026-11-12T01:15:00Z');
const T=(ha,abbr)=>({ha,id:abbr,abbr,name:abbr+' Team',loc:abbr,nick:'Team',logo:'',rec:'',color:'333333',alt:'ffffff'});
const row=(id,name,g,book,sport)=>({name,team:'A'+g,game:'A'+g+' @ H'+g,matchup:'A'+g+' @ H'+g,side:'O',sport:sport||'NBA',market:'20.5 Points',kind:'prop',book,offeredRaw:'-108',offeredProb:0.52,fairProb:0.58,fairRaw:'-138',mktProb:0.56,stars:4,evModel:'projection',projValue:22,gameInfo:{state:'pre',startISO:iso(KO+g*60e3),eventId:'60600'+g,timeCT:'',detail:'',teams:[T('away','A'+g),T('home','H'+g)]},src:'api:NBA:props',apiKey:id,loadedAt:iso(NOW-60e3)});
const R=[row('a','One Guy',1,'Novig'), row('b','Two Guy',2,'Bovada'), row('c','Three Guy',3,'Novig','NFL')];
const IDS=['todayLine','cvLegendT','boardView','sortBy','filterSport','swOnly','showRejects','onlyMyGames','notesAll','cardsOn'];   /* v4.96: bookChips left out: they stay on the board (Alonzo: "if anything, we need this") */   // v4.62: the Today's games line and Cover bands too
async function open(b,W){ const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:W,height:900}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(([R])=>{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig, Bovada, Kalshi',bank:'500',cfgVer:3.03})); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:'2026-11-11',rows:R})); },[R]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1300); await p.evaluate(()=>setMode('volado')); await p.waitForTimeout(150);   /* v4.76: the three bets (La Contadora min(58%, 56% + 0.35 × 2 pts) = 56.7%) are 🪙 Volado bets now, not in the default 💪 Machín (60 to 75%), which shows "All 0" and no cards: their tab is opened (and remembered over the reload), so the board, its book chips and its cards are the ones this test always read */
  await p.evaluate(()=>{ const c=document.querySelector('.board-panel .cv-legend-box'); if(c) c.id='cvLegendT'; }); return {ctx,p,errs}; }   /* the test names Cover bands so it can find it */
const seen=(p,ids)=>p.evaluate(ids=>Object.fromEntries(ids.map(id=>{ const e=document.getElementById(id); if(!e) return [id,null]; const r=e.getBoundingClientRect(); return [id, r.width>0 && r.height>0 && getComputedStyle(e).display!=='none']; })), ids);
const pos=(p,ids)=>p.evaluate(ids=>Object.fromEntries(ids.map(id=>{ const r=document.getElementById(id).getBoundingClientRect(); return [id,{x:Math.round(r.left),y:Math.round(r.top)}]; })), ids);
const tog=p=>p.evaluate(()=>{ const b=document.getElementById('barMoreBtn'); if(b.offsetParent) b.click(); else document.querySelector('#boardMoreList button[data-f]').click(); });   /* v4.96: Filters opens from More, closes from its own button */
(async()=>{ const b=await chromium.launch();
  let {ctx,p,errs}=await open(b,390);
  let v=await seen(p,['filterPlayer','barMoreBtn','shopBtn',...IDS]);
  check('phone, closed: only Send the Sentinels shows; Filters is in More ▾ (v4.96, Alonzo: “only Send the Sentinels button” … “put it on More”)', !v.barMoreBtn && v.shopBtn && await p.evaluate(()=>!!document.querySelector('#boardMoreList button[data-f]')), v);
  check('phone, closed: the Today’s games line, Cover bands, Show, Sort, Sport, the book chips, the tick boxes, Show all notes and Cards are folded away (v4.62: the first two were left out)', IDS.every(id=>v[id]===false), v);
  let ps=await pos(p,['filterPlayer','barMoreBtn','shopBtn']);
  const before=(a,c)=>a.y<c.y-2 || (Math.abs(a.y-c.y)<=2 && a.x<c.x);
  check('phone: Send the Sentinels shows, and under it the book chips (v4.96: “if anything, we need this”)', ps.shopBtn.y>0 && (await seen(p,['bookChips'])).bookChips===true, ps);
  let t=await p.evaluate(()=>document.getElementById('barMoreBtn').textContent.trim());
  check('nothing on: the button reads "Filters ▾"', t==='Filters ▾', t);
  await tog(p); await p.waitForTimeout(200);
  v=await seen(p,IDS);
  check('one tap opens all of them', IDS.every(id=>v[id]===true), v);
  ps=await pos(p,['shopBtn','todayLine','cvLegendT','boardView','cardsOn']);
  check('opened: they sit below Send the Sentinels, the Today’s games line first, then Cover bands, then Show', ps.todayLine.y>ps.shopBtn.y && ps.cvLegendT.y>ps.todayLine.y && ps.boardView.y>ps.cvLegendT.y && ps.cardsOn.y>ps.shopBtn.y, ps);
  const tl=await p.evaluate(()=>document.getElementById('todayLine').textContent);
  check('the Today’s games line still has its numbers inside the drop-down', /Today/.test(tl) && /bets/.test(tl), tl.slice(0,120));
  await p.click('#swOnly'); await p.waitForTimeout(150);
  t=await p.evaluate(()=>document.getElementById('barMoreBtn').textContent.trim());
  check('Only sweet spot ticked: "Filters · Sweet spot ▴"', t==='Filters · Sweet spot ▴', t);
  await p.selectOption('#filterSport','NFL'); await p.waitForTimeout(150);
  t=await p.evaluate(()=>document.getElementById('barMoreBtn').textContent.trim());
  check('and NFL: "Filters · NFL · Sweet spot ▴"', t==='Filters · NFL · Sweet spot ▴', t);
  await p.click('#bookChips .bchip[data-book="Novig"]'); await p.waitForTimeout(150);
  t=await p.evaluate(()=>document.getElementById('barMoreBtn').textContent.trim());
  check('and the Novig chip: three things on, "Filters · 3 on ▴", and the tooltip names them', t==='Filters · 3 on ▴' && /On: NFL, Novig, Sweet spot/.test(await p.evaluate(()=>document.getElementById('barMoreBtn').title)), t);
  await tog(p); await p.waitForTimeout(150);
  v=await seen(p,IDS); t=await p.evaluate(()=>document.getElementById('barMoreBtn').textContent.trim());
  check('closed again: all folded, and the button still says what is on: "Filters · 3 on ▾"', IDS.every(id=>v[id]===false) && t==='Filters · 3 on ▾', {t,v});
  await tog(p); await p.waitForTimeout(150);   /* left open, as on the owner's phone */
  await p.evaluate(()=>{ localStorage.setItem('mbev.barMore','1'); });   /* and the old remembered "open" from before v4.62 */
  await p.reload(); await p.waitForTimeout(1300); await p.evaluate(()=>{ const c=document.querySelector('.board-panel .cv-legend-box'); if(c) c.id='cvLegendT'; });
  v=await seen(p,IDS);
  check('Filters left open, then the app opened again: it starts closed, everything folded (v4.62: it remembered "open", so the owner’s phone kept showing everything)', IDS.every(id=>v[id]===false) && await p.evaluate(()=>document.getElementById('barMoreBtn').getAttribute('aria-expanded')==='false' && localStorage.getItem('mbev.barMore')===null), v);
  t=await p.evaluate(()=>document.getElementById('barMoreBtn').textContent.trim());
  check('after a reload the button still names what stays on (the books and the sweet spot are remembered; the sport is not)', /^Filters · (Novig · Sweet spot|2 on) ▾$/.test(t), t);
  // v4.61: the pasted board does not use Sport, Only sweet spot or Only games I already bet, so the button does not name them there
  const pv=await p.evaluate(()=>{ const s=document.getElementById('filterSport'); s.value='NFL'; s.dispatchEvent(new Event('change',{bubbles:true})); const api=document.getElementById('barMoreBtn').textContent.trim(); showBoardSrc('paste'); barSumPaint(); const paste=document.getElementById('barMoreBtn').textContent.trim(); showBoardSrc('api'); barSumPaint(); return {api, paste, back:document.getElementById('barMoreBtn').textContent.trim()}; });
  check('on the pasted board the button names only what that board filters on: "Filters · 3 on ▾" becomes "Filters · Novig ▾", and comes back', pv.api==='Filters · 3 on ▾' && pv.paste==='Filters · Novig ▾' && pv.back==='Filters · 3 on ▾', pv);
  const old=await p.evaluate(()=>{ const keep=boardBooks.slice(); boardBooks.length=0; boardBooks.push('Bovada','Novig'); barSumPaint(); const t=document.getElementById('barMoreBtn').title; boardBooks.length=0; keep.forEach(x=>boardBooks.push(x)); barSumPaint(); return t; });
  check('the books named are the ones the board is really showing (not only what was saved)', /2 books/.test(old), old);
  await tog(p); await p.waitForTimeout(150);
  const sm=await p.evaluate(()=>{ document.getElementById('shopMsg').textContent='🦑 Sentinels are back'; const y=id=>Math.round(document.getElementById(id).getBoundingClientRect().top); return {btn:y('shopBtn'), msg:y('shopMsg'), show:y('boardView'), ctl:document.getElementById('barMoreBtn').getAttribute('aria-controls')}; });
  check('opened: the Sentinels’ status line stays right under its button, above Show; and the button names everything it opens', sm.msg>=sm.btn && sm.msg<sm.show && /boardView/.test(sm.ctl) && /cardsOn/.test(sm.ctl), sm);
  await tog(p); await p.waitForTimeout(150);
  await p.setViewportSize({width:1280,height:900}); await p.waitForTimeout(300);
  const wide=await p.evaluate(()=>{ const bar=document.querySelector('.board-panel .board-bar'); return {tlIn:document.getElementById('todayLine').parentNode===bar, cvIn:document.getElementById('cvLegendT').parentNode===bar}; });
  await p.setViewportSize({width:390,height:900}); await p.waitForTimeout(300);
  const narrow=await p.evaluate(()=>{ const bar=document.querySelector('.board-panel .board-bar'); return {tlIn:document.getElementById('todayLine').parentNode===bar, cvIn:document.getElementById('cvLegendT').parentNode===bar}; });
  check('v4.94 (Alonzo: "all this should be together, minus sentinels"): turning the screen wide keeps the Today’s games line and Cover bands folded in with the rest', wide.tlIn && wide.cvIn && narrow.tlIn && narrow.cvIn, {wide, narrow});
  const over=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  check('phone: no sideways scroll', over<=0, over);
  check('no page errors (phone)', !errs.length, errs); await ctx.close();
  for(const W of [1000,1280,1960]){ ({ctx,p,errs}=await open(b,W));
    v=await seen(p,['filterPlayer','barMoreBtn','shopBtn',...IDS]);
    const pp=await pos(p,['bookChips','filterPlayer','shopBtn']);
    const place=await p.evaluate(()=>{ const bar=document.querySelector('.board-panel .board-bar'), tl=document.getElementById('todayLine'), cv=document.getElementById('cvLegendT'); return {tlOut:tl.parentNode!==bar, cvOut:cv.parentNode!==bar, order:!!(tl.compareDocumentPosition(cv)&Node.DOCUMENT_POSITION_FOLLOWING) && !!(cv.compareDocumentPosition(bar)&Node.DOCUMENT_POSITION_FOLLOWING)}; });
    check(W+' px: v4.96: the same as the phone: only Send the Sentinels shows (Filters is in More), the rest (search, chips, Show, Sort, Today’s games, Cover bands) folded behind Filters until it is opened', v.barMoreBtn===false && v.shopBtn && v.filterPlayer===false && IDS.every(id=>v[id]===false) && !place.tlOut && !place.cvOut, {v,pp,place});
    check('no page errors ('+W+')', !errs.length, errs); await ctx.close(); }
  await b.close(); console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(fail?1:0); })();
