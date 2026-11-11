// node tests/placed-at-test.js — v4.73 (agreed with ChatGPT, owner "Build then" 11/11): "Placed at" and "Placed now" for bets you add by hand.
// Saved with where the time came from (placed_now, user_entered, book_fill, ticket_import). Placed now keeps the moment it was pressed, not the save.
// A book's fill time is never replaced by a weaker one and replaces a typed one; a change keeps the old time in the edits. The long-shot moneyline
// check then reads the board as it was before the bet (board reading 4 h before kickoff: model 42%, market 38% → 39.4%, a long shot).
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,600)); };
const NOW=Date.parse('2026-11-11T19:00:00Z'), H=3600e3, KO=Date.parse('2026-11-12T01:00:00Z');
(async()=>{ const b=await chromium.launch();
  for(const W of [1280,390]){
    const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:W,height:1000}}); await ctx.clock.install({time:new Date(NOW)});
    await ctx.addInitScript(()=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig',bank:'500',cfgVer:3.03})); }catch(e){} });
    const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); return r.abort(); });
    await p.goto('http://app.test/'); await p.waitForTimeout(1000);
    // the + Add a bet form shows the field and the button, inside the screen
    await p.evaluate(()=>{ const t=document.querySelector('.tab[data-view="v-add"]'); if(t) t.click(); }); await p.waitForTimeout(300);
    const ui=await p.evaluate(()=>{ const d=document.getElementById('addBetPanel'); if(d) d.open=true; const i=document.getElementById('abPlaced'), bt=document.getElementById('abPlacedNow'); const r=i.getBoundingClientRect(), r2=bt.getBoundingClientRect();
      return {vis:r.width>0 && r2.width>0, in:r.right<=innerWidth && r2.right<=innerWidth, over:document.documentElement.scrollWidth-innerWidth}; });
    check(W+' px: + Add a bet has "Placed at" and "Placed now", inside the screen, no sideways scroll', ui.vis && ui.in && ui.over<=0, ui);
    if(W===1280){
      // Placed now: the moment it is pressed (1:00 PM CT), not when the bet is saved 10 minutes later
      const pn=await p.evaluate(async()=>{ document.getElementById('abPlacedNow').click(); const i=document.getElementById('abPlaced'); const at=i.dataset.at;
        await new Promise(r=>setTimeout(r,10)); return {at, read:placedRead(i), shown:i.value}; });
      await p.clock.fastForward(10*60e3);
      const later=await p.evaluate(()=>placedRead(document.getElementById('abPlaced')));
      check('Placed now keeps the moment it was pressed (1:00 PM CT, a second or two after the page opened) even when read 10 minutes later; source placed_now; time zone kept', Date.parse(pn.at)-Date.parse('2026-11-11T19:00:00Z')<5000 && later.iso===pn.at && later.src==='placed_now' && later.tz==='America/Chicago' && pn.shown==='2026-11-11T13:00', {pn, later});
      // typing another time makes it user_entered, read in your time zone
      const ty=await p.evaluate(()=>{ const i=document.getElementById('abPlaced'); i.value='2026-11-11T12:30'; return placedRead(i); });
      check('typing 12:30 PM (your time, Chicago) saves 18:30 UTC as user_entered', ty.iso==='2026-11-11T18:30:00.000Z' && ty.src==='user_entered', ty);
      const fut=await p.evaluate(()=>{ const i=document.getElementById('abPlaced'); delete i.dataset.at; i.value='2026-11-12T12:00'; return placedRead(i); });
      check('a time in the future is refused', fut && fut.err==='the placed time is in the future', fut);
      // book fill time wins, and is never replaced by a weaker source; changes keep the old time
      const bf=await p.evaluate(()=>{ const x={id:'x'}; placedSet(x,'2026-11-11T18:30:00Z','user_entered','America/Chicago');
        const a=notePlaced(x,{ts:Date.parse('2026-11-11T18:20:00Z')}); const after={at:x.placedAt, src:x.placedAtSource, edits:(x.edits||[]).map(e=>e.before.placedAt)};
        const c=placedSet(x,'2026-11-11T18:45:00Z','user_entered'); const d=placedSet(x,'2026-11-11T18:45:00Z','ticket_import');
        return {after, c, d, at:x.placedAt, src:x.placedAtSource}; });
      check('the book’s own fill time (12:20 PM) replaces the typed 12:30 PM and keeps 12:30 in the edits', bf.after.at==='2026-11-11T18:20:00.000Z' && bf.after.src==='book_fill' && bf.after.edits[0]==='2026-11-11T18:30:00.000Z', bf.after);
      check('after that, a typed or imported time cannot replace the book’s', !bf.c && !bf.d && bf.at==='2026-11-11T18:20:00.000Z' && bf.src==='book_fill', bf);
      // the long-shot check reads the board before the bet: reading at 3 PM CT (4 h before kickoff) gives 39.4%
      const ls=await p.evaluate(([KO,H])=>{ const m=t=>Math.floor(t/60000);
        const bet={id:'ls',kind:'moneyline',sport:'NBA',name:'AAA',team:'AAA',market:'Moneyline',side:'',odds:'-110',fair:'',start:new Date(KO).toISOString(),date:'2026-11-11'};
        pxAll()[pxKey({sport:bet.sport,name:bet.name,market:bet.market,side:'',gameInfo:{startISO:bet.start}})]=[[m(KO-4*H),0.36,0.42,0.38]];
        const before=lsmlClass(bet).src; placedSet(bet,new Date(KO-3*H).toISOString(),'placed_now'); const c=lsmlClass(bet);
        const late={...bet}; delete late.placedAt; delete late.placedAtSource; placedSet(late,new Date(KO-5*H).toISOString(),'user_entered'); const c2=lsmlClass(late);
        return {before, src:c.src, p:c.p, ls:c.lsml, late:c2.src}; },[KO,H]);
      check('a hand-added −110 moneyline with no placed time: board reading not used (not a long shot); placed 3 h before kickoff: the reading 4 h before is used, 39.4%, a long shot', ls.before==='not_long_shot' && ls.src==='pregame_board_act' && Math.abs(ls.p-0.394)<1e-4 && ls.ls, ls);
      check('placed 5 h before kickoff, before that reading: the reading is not used', ls.late==='not_long_shot', ls);
      // a bet added through + Add a bet: the editor saves it with the placed time
      const ab=await p.evaluate(async()=>{ const L={id:'m',key:'m',name:'Manual',team:'MAN',sport:'NBA',book:'Novig',stake:1,odds:'+150',fair:'',kind:'moneyline',market:'Moneyline',side:'',betnow:'MAN ML +150',game:'MAN @ OPP',date:'2026-11-11',dateSet:true,manual:true,result:'pending',snap:{at:'2026-11-11T18:00:00Z'},start:'2026-11-12T01:00:00Z'}; logged.push(L); saveLog(); renderLog(); return true; });
      await p.click('.tab[data-view="v-log"]'); await p.waitForTimeout(300);
      const i=await p.evaluate(()=>logged.findIndex(x=>x.id==='m')); await p.click('#logBody button.kill.edit[data-i="'+i+'"]'); await p.waitForTimeout(250);
      await p.fill('#logBody tr.editor .eb-placed','2026-11-11T11:15'); await p.click('#logBody tr.editor .eb-save'); await p.waitForTimeout(300);
      const ed=await p.evaluate(()=>{ const L=logged.find(x=>x.id==='m'); return {at:L.placedAt, src:L.placedAtSource, tz:L.placedTz}; });
      check('the bet editor: typing 11:15 AM saves 17:15 UTC, user_entered, Chicago', ed.at==='2026-11-11T17:15:00.000Z' && ed.src==='user_entered' && ed.tz==='America/Chicago', ed);
      const bk=await p.evaluate(()=>{ const L=logged.find(x=>x.id==='m'); placedSet(L,'2026-11-11T17:00:00Z','book_fill'); renderLog(); return true; });
      const i2=await p.evaluate(()=>logged.findIndex(x=>x.id==='m')); await p.click('#logBody button.kill.edit[data-i="'+i2+'"]'); await p.waitForTimeout(250);
      const ro=await p.evaluate(()=>({input:!!document.querySelector('#logBody tr.editor .eb-placed'), txt:document.querySelector('#logBody tr.editor').textContent.match(/Placed [^(]*\(book\)/)?.[0]||null}));
      check('a bet with the book’s time shows it read-only ("Placed … (book)"), no box to change it', !ro.input && /^Placed 11\/11, 11:00 AM \(book\)$/.test(ro.txt||''), ro);
      // import v2: an explicit placedAt only
      const im=await p.evaluate(()=>{ const d=lcParse({type:'augi-bet-import',v:2,singles:[{day:'2026-11-11',book:'Novig',kind:'moneyline',team:'AAA',stake:1,americanOdds:150,placedAt:'2026-11-11T16:00:00Z'},{day:'2026-11-11',book:'Novig',kind:'moneyline',team:'BBB',stake:1,americanOdds:150,at:'2026-11-11T16:00:00Z'}],parlays:[]});
        const a=lcRecord(d.tickets[0]), c=lcRecord(d.tickets[1]); return {a:[a.placedAt,a.placedAtSource], c:c.placedAt||null}; });
      check('import: a ticket with placedAt gets it as ticket_import; one with only its save time (at) gets none', im.a[0]==='2026-11-11T16:00:00.000Z' && im.a[1]==='ticket_import' && im.c===null, im);
    }
    check('no page errors ('+W+')', !errs.length, errs); await ctx.close(); }
  await b.close(); console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(fail?1:0); })();
