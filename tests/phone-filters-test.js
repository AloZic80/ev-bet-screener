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
const IDS=['boardView','sortBy','filterSport','bookChips','swOnly','showRejects','onlyMyGames','notesAll','cardsOn'];
async function open(b,W){ const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:W,height:900}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(([R])=>{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig, Bovada, Kalshi',bank:'500',cfgVer:3.03})); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:'2026-11-11',rows:R})); },[R]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1300); return {ctx,p,errs}; }
const seen=(p,ids)=>p.evaluate(ids=>Object.fromEntries(ids.map(id=>{ const e=document.getElementById(id); if(!e) return [id,null]; const r=e.getBoundingClientRect(); return [id, r.width>0 && r.height>0 && getComputedStyle(e).display!=='none']; })), ids);
const pos=(p,ids)=>p.evaluate(ids=>Object.fromEntries(ids.map(id=>{ const r=document.getElementById(id).getBoundingClientRect(); return [id,{x:Math.round(r.left),y:Math.round(r.top)}]; })), ids);
(async()=>{ const b=await chromium.launch();
  let {ctx,p,errs}=await open(b,390);
  let v=await seen(p,['filterPlayer','barMoreBtn','shopBtn',...IDS]);
  check('phone, closed: the search box, Filters and Send the Sentinels show', v.filterPlayer && v.barMoreBtn && v.shopBtn, v);
  check('phone, closed: Show, Sort, Sport, the book chips, the tick boxes, Show all notes and Cards are folded away', IDS.every(id=>v[id]===false), v);
  let ps=await pos(p,['filterPlayer','barMoreBtn','shopBtn']);
  const before=(a,c)=>a.y<c.y-2 || (Math.abs(a.y-c.y)<=2 && a.x<c.x);
  check('phone: in that order: search, Filters, Send the Sentinels', before(ps.filterPlayer,ps.barMoreBtn) && before(ps.barMoreBtn,ps.shopBtn), ps);
  let t=await p.evaluate(()=>document.getElementById('barMoreBtn').textContent.trim());
  check('nothing on: the button reads "Filters ▾"', t==='Filters ▾', t);
  await p.click('#barMoreBtn'); await p.waitForTimeout(200);
  v=await seen(p,IDS);
  check('one tap opens all of them', IDS.every(id=>v[id]===true), v);
  ps=await pos(p,['shopBtn','boardView','cardsOn']);
  check('opened: they sit below Send the Sentinels', ps.boardView.y>ps.shopBtn.y && ps.cardsOn.y>ps.shopBtn.y, ps);
  await p.click('#swOnly'); await p.waitForTimeout(150);
  t=await p.evaluate(()=>document.getElementById('barMoreBtn').textContent.trim());
  check('Only sweet spot ticked: "Filters · Sweet spot ▴"', t==='Filters · Sweet spot ▴', t);
  await p.selectOption('#filterSport','NFL'); await p.waitForTimeout(150);
  t=await p.evaluate(()=>document.getElementById('barMoreBtn').textContent.trim());
  check('and NFL: "Filters · NFL · Sweet spot ▴"', t==='Filters · NFL · Sweet spot ▴', t);
  await p.click('#bookChips .bchip[data-book="Novig"]'); await p.waitForTimeout(150);
  t=await p.evaluate(()=>document.getElementById('barMoreBtn').textContent.trim());
  check('and the Novig chip: three things on, "Filters · 3 on ▴", and the tooltip names them', t==='Filters · 3 on ▴' && /On: NFL, Novig, Sweet spot/.test(await p.evaluate(()=>document.getElementById('barMoreBtn').title)), t);
  await p.click('#barMoreBtn'); await p.waitForTimeout(150);
  v=await seen(p,IDS); t=await p.evaluate(()=>document.getElementById('barMoreBtn').textContent.trim());
  check('closed again: all folded, and the button still says what is on: "Filters · 3 on ▾"', IDS.every(id=>v[id]===false) && t==='Filters · 3 on ▾', {t,v});
  await p.reload(); await p.waitForTimeout(1300);
  t=await p.evaluate(()=>document.getElementById('barMoreBtn').textContent.trim());
  check('after a reload the button still names what stays on (the books and the sweet spot are remembered; the sport is not)', /^Filters · (Novig · Sweet spot|2 on) ▾$/.test(t), t);
  const over=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  check('phone: no sideways scroll', over<=0, over);
  check('no page errors (phone)', !errs.length, errs); await ctx.close();
  for(const W of [1000,1280,1960]){ ({ctx,p,errs}=await open(b,W));
    v=await seen(p,['filterPlayer','barMoreBtn','shopBtn',...IDS]);
    const pp=await pos(p,['bookChips','filterPlayer','shopBtn']);
    check(W+' px: unchanged: every control shows, no Filters button, the search box still after the book chips', v.barMoreBtn===false && v.filterPlayer && v.shopBtn && IDS.every(id=>v[id]===true) && pp.filterPlayer.y>=pp.bookChips.y, {v,pp});
    check('no page errors ('+W+')', !errs.length, errs); await ctx.close(); }
  await b.close(); console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(fail?1:0); })();
