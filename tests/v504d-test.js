// node tests/v504d-test.js — v5.04 (El Diseñador round 3b, build plan step "v5.06 Book chips at 44 px"): the board's book chips are a 44 px tap target
// (rounder, 0 14px padding, even-width counts) at 390, 1000, 1280 and 1960 px, light and dark. CSS only: on every tab the chip counts still add up to All,
// and All is the number of cards with a Bet button; on a phone the chips still sit right under Send the Sentinels, above the cards, in the first screen.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,700)); };
const NOW=Date.parse('2026-11-14T19:00:00Z'), DAY='2026-11-14', iso=ms=>new Date(ms).toISOString(), TIP=Date.parse('2026-11-15T02:00:00Z');
const T=(ha,abbr)=>({ha,id:abbr,abbr,name:abbr+' Team',loc:abbr,nick:'Team',logo:'',rec:'',color:'333333',alt:'ffffff'});
const am=p=>p>=0.5?String(Math.round(-100*p/(1-p))):'+'+Math.round(100*(1-p)/p);
const row=(id,name,book,price,fair,mkt,extra)=>Object.assign({name,team:'H'+id,game:'A'+id+' @ H'+id,matchup:'A'+id+' @ H'+id,side:'O',sport:'NBA',market:'1.5 Threes',kind:'prop',book,offeredRaw:am(price),offeredProb:price,fairProb:fair,fairRaw:'',mktProb:mkt,stars:3,evModel:'market',
  gameInfo:{state:'pre',startISO:iso(TIP),eventId:'8'+id.charCodeAt(0),timeCT:'',detail:'',teams:[T('away','A'+id),T('home','H'+id)]},src:'api:NBA:props',apiKey:id,loadedAt:iso(NOW-60e3)},extra||{});
// three books, bets on more than one tab (the v5.00 test's Volado and Safe prices), plus a row that does not pass (counted by no chip)
const ROWS=[row('a','Ann Novig','Novig',0.54,0.585,0.575), row('b','Ben Novig','Novig',0.55,0.585,0.575,{market:'2.5 Threes'}), row('c','Cal Bovada','Bovada',0.54,0.585,0.575),
  row('d','Dee Safe','Novig',0.62,0.69,0.67,{market:'3.5 Rebounds'}), row('e','Eve Safe','Bovada',0.62,0.69,0.67,{market:'4.5 Rebounds'}), row('f','Fay Draft','DraftKings',0.62,0.69,0.67,{market:'5.5 Rebounds'}),
  row('g','Gus Nope','Bovada',0.60,0.58,0.58)];
(async()=>{ const b=await chromium.launch();
  for(const [W,theme] of [[390,'light'],[390,'dark'],[1000,'light'],[1000,'dark'],[1280,'light'],[1280,'dark'],[1960,'light'],[1960,'dark']]){
    const tag=W+' px '+theme;
    const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:W,height:W===390?844:1000},colorScheme:theme}); await ctx.clock.install({time:new Date(NOW)});
    await ctx.addInitScript(([R,d,th])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig, Bovada, DraftKings',bank:'500',cfgVer:3.03})); localStorage.setItem('mbev.cards','1'); localStorage.setItem('mbev.theme',th); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows:R})); }catch(e){} },[ROWS,DAY,theme]);
    const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
      if(/\/live\?/.test(u)) return r.fulfill({contentType:'application/json',body:'{"results":{}}'});
      if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
    await p.goto('http://app.test/'); await p.waitForTimeout(1300);
    if(W===390){   /* v5.04 review: measured on a tab that has bets (the first one with All above 0), scrolled to the top, so a card must be there */
      const fold=await p.evaluate(async()=>{ const B=[...document.querySelectorAll('#modeBar button')]; let tab='';
        for(const bt of B){ bt.click(); await new Promise(r=>setTimeout(r,250)); const a=document.querySelector('#bookChips .bchip[data-book=""] small'); if(a && +a.textContent>0){ tab=bt.textContent.trim().slice(0,24); break; } }
        window.scrollTo(0,0); await new Promise(r=>setTimeout(r,100));
        const y=e=>e?e.getBoundingClientRect():null, s=y(document.getElementById('shopBtn')), c=y(document.getElementById('bookChips')), card=y(document.querySelector('#placeCards .sc-card')), more=document.getElementById('barMoreBtn');
        return {tab, shop:s&&Math.round(s.bottom), chipsTop:c&&Math.round(c.top), chipsBottom:c&&Math.round(c.bottom), card:card&&Math.round(card.top), vh:innerHeight, filtersHidden:!more.offsetParent}; });
      check(tag+': phone-filters order holds on a tab with bets: Send the Sentinels, then the book chips, then the cards, and the chips and the first card start in the first screen', fold.tab!=='' && fold.shop!=null && fold.card!=null && fold.chipsTop>=fold.shop-1 && fold.card>=fold.chipsBottom && fold.chipsBottom<=fold.vh && fold.card<fold.vh && fold.filtersHidden, fold);
    }
    // every mode tab: chip sizes, and the counts against the cards
    const tabs=[]; const modes=await p.evaluate(()=>document.querySelectorAll('#modeBar button').length);
    for(let i=0;i<Math.max(1,modes);i++){
      await p.evaluate(i=>{ const bt=document.querySelectorAll('#modeBar button')[i]; if(bt) bt.click(); }, i); await p.waitForTimeout(250);
      tabs.push(await p.evaluate(()=>{ const C=[...document.querySelectorAll('#bookChips .bchip')], all=C.find(c=>(c.dataset.book||'')===''), others=C.filter(c=>c!==all);
        const box=document.getElementById('bookChips'), sz=C.map(c=>{ box.scrollLeft+=c.getBoundingClientRect().left-box.getBoundingClientRect().left-4; const r=c.getBoundingClientRect(), cs=getComputedStyle(c), sm=c.querySelector('small'); return {b:c.dataset.book||'All', h:Math.round(r.height*10)/10, vis:r.width>0&&r.height>0&&cs.display!=='none', rad:cs.borderTopLeftRadius, pad:cs.paddingLeft+' '+cs.paddingRight+' '+cs.paddingTop, num:sm?getComputedStyle(sm).fontVariantNumeric:null, inView:r.left>=-0.5 && r.right<=innerWidth+0.5}; }); box.scrollLeft=0;   /* v5.04 review: on a phone the chips scroll sideways in one row, so each chip is scrolled to before it is measured */
        const n=c=>{ const s=c&&c.querySelector('small'); return s?+s.textContent:NaN; };
        return {tab:(document.querySelector('#modeBar button.on, #modeBar button[aria-pressed="true"]')||{}).textContent||'', sz, all:n(all), sum:others.reduce((a,c)=>a+n(c),0), cards:[...document.querySelectorAll('#placeCards .sc-card')].filter(c=>c.querySelector('.bet-btn')).length}; }));
    }
    const S=tabs.flatMap(t=>t.sz);
    check(tag+': every book chip on every tab is at least 44 px tall (was about 27 px) and visible', S.length>0 && S.every(s=>s.vis && s.h>=44), S.map(s=>[s.b,s.h,s.vis]));
    check(tag+': the chips are pill-round (22 px corners) with 14 px side padding', S.every(s=>s.rad==='22px' && /^14px 14px /.test(s.pad)), S.slice(0,4).map(s=>[s.b,s.rad,s.pad]));
    check(tag+': the chip counts use even-width (tabular) digits', S.every(s=>/tabular-nums/.test(s.num||'')), S.map(s=>s.num));
    check(tag+': no chip runs past the right edge of the screen (on a phone: once the chip row is scrolled to it)', S.every(s=>s.inView), S.filter(s=>!s.inView));
    check(tag+': on each tab the chip counts add up to All, and All is the number of cards with a Bet button (counts unchanged)', tabs.every(t=>Number.isFinite(t.all) && t.sum===t.all && t.all===t.cards), tabs.map(t=>[t.tab.trim().slice(0,24),t.all,t.sum,t.cards]));
    check(tag+': the test board has bets to place on more than one tab and on more than one book', tabs.filter(t=>t.all>0).length>=2 && new Set(S.filter(s=>s.b!=='All').map(s=>s.b)).size>=2, tabs.map(t=>[t.tab.trim().slice(0,24),t.all]));
    // picking one book still shows only its cards, and its number still matches
    const pick=await p.evaluate(async()=>{ for(const bt of document.querySelectorAll('#modeBar button')){ bt.click(); await new Promise(r=>setTimeout(r,200)); const c=[...document.querySelectorAll('#bookChips .bchip')].find(x=>x.dataset.book && +x.querySelector('small').textContent>0); if(c){ const want=+c.querySelector('small').textContent, bk=c.dataset.book; c.click(); await new Promise(r=>setTimeout(r,300));
        const cards=[...document.querySelectorAll('#placeCards .sc-card')].filter(x=>x.querySelector('.bet-btn')).length, h=document.querySelector('#bookChips .bchip[data-book="'+bk+'"]').getBoundingClientRect().height;
        document.querySelector('#bookChips .bchip[data-book=""]').click(); await new Promise(r=>setTimeout(r,300)); return {bk,want,cards,h}; } } return null; });
    check(tag+': tapping a book chip still filters the board: its number equals the cards shown, and the chip is still 44 px when on', pick && pick.want===pick.cards && pick.h>=44, pick);
    if(W===390){
      check(tag+': no sideways scroll', await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    }
    check(tag+': no page errors', !errs.length, errs); await ctx.close(); }
  // v5.04 review: the owner's real book list (10 books, each with a bet on one tab) at 390 px. Before the fix the 44 px chips wrapped to 5 rows (244 px) and pushed the first card below the first screen;
  // on a phone they now sit in one row that scrolls sideways. Reports where the chips end and where the first card starts.
  const BIG=['Novig','Bovada','DraftKings','FanDuel','BetMGM','Caesars','ESPN Bet','Kalshi','Polymarket US','Pinnacle'], BROWS=BIG.map((k,i)=>row('m'+i,'Big '+i,k,0.54,0.585,0.575,{market:(i+1.5)+' Threes'}));
  for(const theme of ['light','dark']){ const tag='390 px '+theme+', 10 books';
    const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:390,height:844},colorScheme:theme}); await ctx.clock.install({time:new Date(NOW)});
    await ctx.addInitScript(([R,d,th,bk])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books:bk,bank:'500',cfgVer:3.03})); localStorage.setItem('mbev.cards','1'); localStorage.setItem('mbev.theme',th); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows:R})); }catch(e){} },[BROWS,DAY,theme,BIG.join(', ')]);
    const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
      if(/\/live\?/.test(u)) return r.fulfill({contentType:'application/json',body:'{"results":{}}'});
      if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
    await p.goto('http://app.test/'); await p.waitForTimeout(1300);
    const m=await p.evaluate(async()=>{ let tab='';
      for(const bt of document.querySelectorAll('#modeBar button')){ bt.click(); await new Promise(r=>setTimeout(r,250)); const a=document.querySelector('#bookChips .bchip[data-book=""] small'); if(a && +a.textContent>=8){ tab=bt.textContent.trim().slice(0,24); break; } }
      window.scrollTo(0,0); await new Promise(r=>setTimeout(r,100));
      const box=document.getElementById('bookChips'), br=box.getBoundingClientRect(), C=[...box.querySelectorAll('.bchip')], n=c=>{ const s=c&&c.querySelector('small'); return s?+s.textContent:NaN; }, all=C.find(c=>(c.dataset.book||'')==='');
      const top0=C.length?Math.round(C[0].getBoundingClientRect().top):null, oneRow=C.every(c=>Math.abs(c.getBoundingClientRect().top-top0)<1);
      const reach=C.map(c=>{ box.scrollLeft+=c.getBoundingClientRect().left-br.left-4; const r=c.getBoundingClientRect(); return {b:c.dataset.book||'All', ok:r.left>=-0.5 && r.right<=innerWidth+0.5 && r.height>=44}; }); box.scrollLeft=0;
      const card=document.querySelector('#placeCards .sc-card'), dock=document.getElementById('apiDock');
      return {tab, chips:C.length, all:n(all), sum:C.filter(c=>c!==all).reduce((a,c)=>a+n(c),0), cards:[...document.querySelectorAll('#placeCards .sc-card')].filter(c=>c.querySelector('.bet-btn')).length,
        oneRow, chipsTop:Math.round(br.top), chipsBottom:Math.round(br.bottom), chipsH:Math.round(br.height), card:card&&Math.round(card.getBoundingClientRect().top), dockTop:dock&&dock.getBoundingClientRect().height>0?Math.round(dock.getBoundingClientRect().top):null, vh:innerHeight,
        reach:reach.filter(x=>!x.ok), pageW:document.documentElement.scrollWidth, iw:innerWidth}; });
    console.log('  '+tag+': chips '+m.chipsTop+' to '+m.chipsBottom+' px ('+m.chipsH+' px tall), first card starts at '+m.card+' px, the dock starts at '+m.dockTop+' px, screen '+m.vh+' px');
    check(tag+': a tab has 8 or more bets on different books, and all 10 books plus All have a chip', m.tab!=='' && m.chips===11, [m.tab,m.chips]);
    check(tag+': the chips stay in one row (one 44 px chip tall, not 5 rows) and every chip can be scrolled to, inside the screen, at 44 px', m.oneRow && m.chipsH<=56 && !m.reach.length, [m.oneRow,m.chipsH,m.reach]);
    check(tag+': the chips and the top of the first card are in the first screen', m.card!=null && m.chipsBottom<=m.card && m.card<m.vh, [m.chipsBottom,m.card,m.vh]);
    check(tag+': the counts still add up: chips to All, All to the cards with a Bet button', Number.isFinite(m.all) && m.sum===m.all && m.all===m.cards, [m.all,m.sum,m.cards]);
    check(tag+': the page does not scroll sideways (only the chip row does)', m.pageW<=m.iw, [m.pageW,m.iw]);
    check(tag+': no page errors', !errs.length, errs); await ctx.close(); }
  await b.close(); console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(fail?1:0); })();
