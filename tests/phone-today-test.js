// node tests/phone-today-test.js — v4.64 (Alonzo, phone, a screenshot of the Today card: "Even this"): on a phone the Today card is one line, closed
// every time the app opens: the day, what was bet, the record, what is in play and bets to check; a tap opens the whole card (‹ › days, by book).
// At 1000, 1280 and 1960 px nothing changes.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,600)); };
const NOW=Date.parse('2026-11-05T18:00:00Z'), H=3600e3, iso=ms=>new Date(ms).toISOString(), DAY='2026-11-05';
const bet=(id,o)=>Object.assign({id,key:id,sport:'NBA',kind:'prop',book:'Novig',odds:'+100',stake:2,date:DAY,dateSet:true,manual:true,game:'LAL @ BOS',name:'Player '+id,side:'O',market:'10.5 Points',betnow:'O 10.5 +100',snap:{at:iso(NOW-5*H)}},o);
const LOG=[bet('won',{stake:3,odds:'-150',result:'win',gradedBy:'manual',start:iso(NOW-4*H)}), bet('lost',{stake:1.5,result:'loss',gradedBy:'manual',start:iso(NOW-4*H)}), bet('playing',{stake:2,start:iso(NOW-H)}), bet('later',{stake:4,start:iso(NOW+5*H)})];
async function open(b,W,log){ const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:W,height:900}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(L=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.log',JSON.stringify(L)); }catch(e){} }, log);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1500); return {ctx,p,errs}; }
const vis=(p,sel)=>p.evaluate(s=>{ const e=document.querySelector(s); if(!e) return null; const r=e.getBoundingClientRect(); return r.width>0 && r.height>0 && getComputedStyle(e).display!=='none'; }, sel);
const txt=(p,sel)=>p.evaluate(s=>document.querySelector(s).textContent.replace(/\s+/g,' ').trim(), sel);
(async()=>{ const b=await chromium.launch();
  let {ctx,p,errs}=await open(b,390,LOG);
  check('phone, as the app opens: the Today card is one line; the card itself is folded away', await vis(p,'#tbFoldBtn') && await vis(p,'#todayBar')===false, null);
  const card=await p.evaluate(()=>document.getElementById('todayBar').textContent.replace(/\s+/g,' '));
  const t=await txt(p,'#tbFoldBtn'), tot=await p.evaluate(()=>document.querySelector('#todayBar .tb-k .tb-tot').textContent);
  check('the line says the day, what was bet ('+tot+', 4 bets), the record (1–1) and what is in play ($2.00)', /^TODAY/.test(t) && t.includes(tot) && /4 bets/.test(t) && /1–1/.test(t) && /\$2\.00 in play/.test(t) && /▾$/.test(t), t);
  await p.click('#tbFoldBtn'); await p.waitForTimeout(150);
  check('a tap opens the whole card (‹ › days, played, won and lost, by book)', await vis(p,'#todayBar')===true && await vis(p,'#todayBar .tb-day[data-d="-1"]')===true && await vis(p,'#todayBar .tb-more')===true && /▴$/.test(await txt(p,'#tbFoldBtn')), null);
  await p.click('#todayBar .tb-day[data-d="-1"]'); await p.waitForTimeout(200);
  const t2=await txt(p,'#tbFoldBtn');
  check('going back a day changes the line to that day, with no bets', !/^TODAY/.test(t2) && /no bets/.test(t2), t2);
  await p.reload(); await p.waitForTimeout(1500);
  check('the app opened again: the card is closed', await vis(p,'#todayBar')===false && await p.evaluate(()=>document.getElementById('tbFoldBtn').getAttribute('aria-expanded')==='false'), null);
  await p.evaluate(()=>{ document.querySelector('.tab[data-view="v-log"]').click(); }); await p.waitForTimeout(200);
  check('on the Bet log tab the line does not show', await vis(p,'#tbFoldBtn')===false, null);
  check('no page errors (phone)', !errs.length, errs); await ctx.close();
  ({ctx,p,errs}=await open(b,390,[]));
  const te=await txt(p,'#tbFoldBtn');
  check('a day with no bets: "TODAY · no bets ▾"', /^TODAY\s*no bets\s*▾$/.test(te), te);
  check('no page errors (no bets)', !errs.length, errs); await ctx.close();
  for(const W of [1000,1280,1960]){ ({ctx,p,errs}=await open(b,W,LOG));
    check(W+' px: v4.96 (Alonzo: “i only need the TODAY but across”): the same one line as the phone, the card folded until tapped', await vis(p,'#tbFoldBtn')===true && await vis(p,'#todayBar')===false, null);
    check('no page errors ('+W+')', !errs.length, errs); await ctx.close(); }
  await b.close(); console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(fail?1:0); })();
