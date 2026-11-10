// node tests/board-notes-test.js — v4.34. Alonzo: "BUILD" (Augi's screens on our engine, step 1: the Board). Augi's Show menu (all / passing / outliers /
// already bet / skipped), his cover legend, and a note of your own on each line (📝 on cards and table rows), kept on this device and shown on the line.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const NOW=Date.parse('2026-11-09T18:00:00Z'), H=3600e3, iso=ms=>new Date(ms).toISOString(), DAY='2026-11-09';
const T=(ha,abbr,loc,nick)=>({ha,id:abbr,abbr,name:loc+' '+nick,loc,nick,logo:'',rec:'',color:'333333',alt:'ffffff'});
const TEAMS=[T('away','LAC','Los Angeles','Clippers'),T('home','MIN','Minnesota','Timberwolves')];
const prop=(name,team,market,p,fair,mkt,k)=>({name,team,game:'LAC @ MIN',matchup:'LAC @ MIN',side:'O',sport:'NBA',market,kind:'prop',book:'Novig',offeredRaw:'-108',offeredProb:p,fairProb:fair,fairRaw:'',mktProb:mkt,stars:4,evModel:'market',
  gameInfo:{state:'pre',startISO:iso(NOW+6*H),timeCT:'',detail:'',teams:TEAMS},src:'api:NBA:props',apiKey:k,loadedAt:iso(NOW-60e3)});
const ROWS=[prop('Naz Reid','MIN','16.5 Points',0.52,0.545,0.54,'k1'), prop('Rudy Gobert','MIN','11.5 Rebounds',0.50,0.535,0.53,'k2'),
  prop('Anthony Edwards','MIN','25.5 Points',0.52,0.545,0.54,'k3'), prop('Kris Dunn','LAC','5.5 Assists',0.60,0.50,0.50,'k4')];   // Edwards: already bet; Dunn: no edge (skipped)
const LOG=[{id:'p1',key:'p1',name:'Anthony Edwards',sport:'NBA',kind:'prop',market:'25.5 Points',side:'O',book:'Novig',odds:'-110',offeredRaw:'-110',stake:3,date:DAY,dateSet:true,start:iso(NOW+6*H),gameInfo:{state:'pre',startISO:iso(NOW+6*H),teams:[]}}];
(async()=>{
  const b=await chromium.launch();
  for(const W of [1280,390]){
    const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:W,height:900}}); await ctx.clock.install({time:new Date(NOW)});
    await ctx.addInitScript(([R,L,d])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig',cfgVer:3.03})); localStorage.setItem('mbev.log',JSON.stringify(L)); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows:R})); }catch(e){} }, [ROWS,LOG,DAY]);
    const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/api\.0xbeta\.dev/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
    await p.goto('http://app.test/'); await p.waitForTimeout(1200);
    const seen=()=>p.evaluate(()=>({cards:[...document.querySelectorAll('#placeCards .sc-card .pc-nm')].map(e=>e.textContent.trim()), rows:[...document.querySelectorAll('#tbody tr:not(.group-row):not(.notes-row)')].map(t=>(t.querySelector('.pick')||{}).textContent||'').filter(Boolean).map(s=>s.trim())}));
    const view=async v=>{ await p.selectOption('#boardView',v); await p.waitForTimeout(300); return seen(); };
    if(W===1280){
      let s=await seen();
      check('All groups (the default): the two passing bets as cards, Edwards under Already bet', s.cards.length===2 && s.rows.some(x=>/Edwards/.test(x)), s);
      s=await view('pass'); check('Show › Passing: only the cards, no already-bet or skipped rows', s.cards.length===2 && !s.rows.some(x=>/Edwards|Dunn/.test(x)), s);
      s=await view('prior'); check('Show › Already bet: only Edwards', !s.cards.length && s.rows.length===1 && /Edwards/.test(s.rows[0]), s);
      s=await view('skip'); check('Show › Skipped: Kris Dunn (no edge), even with Show rejected off', !s.cards.length && s.rows.some(x=>/Dunn/.test(x)) && !s.rows.some(x=>/Edwards/.test(x)), s);
      await p.reload(); await p.waitForTimeout(1000);
      check('the Show choice is remembered after a reload', await p.$eval('#boardView',e=>e.value)==='skip', null);
      await view('all');
      const leg=await p.evaluate(()=>[...document.querySelectorAll('.cv-legend .cv-chip')].map(c=>c.textContent));
      check('the cover legend has Augi\'s nine bands, Unlikely to High Cover (v4.51: "Long Shot" and "Feeling Lucky" are Unlikely and Coin Flip, so they do not share names with the modes)', leg.length===9 && /^Unlikely/.test(leg[0]) && /^Coin Flip/.test(leg[1]) && /^High Cover/.test(leg[8]), leg);
    }
    // a note on a card
    await p.evaluate(()=>{ const c=[...document.querySelectorAll('#placeCards .sc-card')].find(x=>/Naz Reid/.test(x.textContent)); c.querySelector('.ln-btn').click(); }); await p.waitForTimeout(200);
    await p.fill('.ln-ed .ln-txt','Check his minutes; lineup news at 6 PM');
    await p.evaluate(()=>{ const r=lastRows.find(x=>/Naz/.test(x.name)); r.name='Naz Reid'; const c=cfgRead(); render(audit(lastRows,c),c); }); await p.waitForTimeout(300);
    check(W+' px: a background redraw waits while the note box is open (your typing stays)', await p.evaluate(()=>{ const t=document.querySelector('.ln-ed .ln-txt'); return t?t.value:null; })==='Check his minutes; lineup news at 6 PM', null);
    await p.evaluate(()=>document.querySelector('.ln-ed .ln-save').click()); await p.waitForTimeout(500);
    const card=()=>p.evaluate(()=>{ const c=[...document.querySelectorAll('#placeCards .sc-card')].find(x=>/Naz Reid/.test(x.textContent)); return c?{note:(c.querySelector('.ln-text')||{}).textContent||'', btn:c.querySelector('.ln-btn').textContent}:null; });
    let c=await card();
    check(W+' px: Save note: the note shows on the card and the button says Note', c && /lineup news at 6 PM/.test(c.note) && /Note$/.test(c.btn.trim()), c);
    await p.reload(); await p.waitForTimeout(1200); c=await card();
    check(W+' px: the note is still there after a reload (this device)', c && /lineup news/.test(c.note), c);
    if(W===1280){
      await p.uncheck('#cardsOn'); await p.waitForTimeout(400);
      const row=await p.evaluate(()=>{ const t=[...document.querySelectorAll('#tbody tr')].find(x=>/Naz Reid/.test(x.textContent)); return t?(t.querySelector('.ln-text')||{}).textContent||'':null; });
      check('with Cards off, the same note shows on the table row', /lineup news/.test(row||''), row);
      await p.evaluate(()=>{ const t=[...document.querySelectorAll('#tbody tr')].find(x=>/Naz Reid/.test(x.textContent)); t.querySelector('.ln-btn').click(); }); await p.waitForTimeout(200);
      await p.evaluate(()=>document.querySelector('.ln-ed .ln-del').click()); await p.waitForTimeout(400);
      const gone=await p.evaluate(()=>!document.querySelector('#tbody .ln-text') && !JSON.parse(localStorage.getItem('mbev.lineNotes')||'{}')[Object.keys(JSON.parse(localStorage.getItem('mbev.lineNotes')||'{}'))[0]]);
      check('Delete note removes it from the row and from the device', gone, gone);
    }
    check(W+' px: no page errors', !errs.length, errs);
    await ctx.close();
  }
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
