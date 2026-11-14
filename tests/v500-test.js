// node tests/v500-test.js — v5.00, Las Karens round 2, sections A and B (owner: "Both"): the TODAY line never calls "worst" money "in play";
// one #1 MATH PICK across every tab; book chips count bets to place like the tab; Save and Cancel above the bottom bar on a 664 px phone;
// every field 16px on a phone; a tab opens at the top. Display only: no math changed.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,600)); };
const NOW=Date.parse('2026-11-13T19:00:00Z'), H=3600e3, iso=ms=>new Date(ms).toISOString(), TIP=Date.parse('2026-11-14T02:00:00Z'), DAY='2026-11-13';
const T=(ha,abbr)=>({ha,id:abbr,abbr,name:abbr+' Team',loc:abbr,nick:'Team',logo:'',rec:'',color:'333333',alt:'ffffff'});
const GI=e=>({state:'pre',startISO:iso(TIP),eventId:e,timeCT:'',detail:'',teams:[T('away','CHA'),T('home','PHX')]});
const am=p=>p>=0.5?String(Math.round(-100*p/(1-p))):'+'+Math.round(100*(1-p)/p);
const row=(id,name,book,price,fair,mkt,extra)=>Object.assign({name,team:'PHX',game:'CHA @ PHX',matchup:'CHA @ PHX',side:'O',sport:'NBA',market:'1.5 Threes',kind:'prop',book,offeredRaw:am(price),offeredProb:price,fairProb:fair,fairRaw:'',mktProb:mkt,stars:3,evModel:'market',gameInfo:GI(id),src:'api:NBA:props',apiKey:id,loadedAt:iso(NOW-60e3)},extra||{});
const ROWS=[row('vol','Clean Pick','Novig',0.54,0.585,0.575), row('vol2','Second Pick','Novig',0.55,0.585,0.575,{market:'2.5 Threes'}), row('saf','Safe Pick','Novig',0.62,0.69,0.67,{market:'3.5 Rebounds'})];
// settled bets and one not started: nothing is in play, so the line must not say "in play"
const bet=(id,o)=>Object.assign({id,key:id,sport:'NBA',kind:'prop',book:'Novig',odds:'+100',stake:2,date:DAY,dateSet:true,manual:true,game:'LAL @ BOS',name:'P '+id,side:'O',market:'10.5 Points',betnow:'O 10.5 +100',snap:{at:iso(NOW-5*H)}},o);
const LOG=[bet('w',{stake:3,odds:'-150',result:'win',gradedBy:'manual',start:iso(NOW-4*H)}), bet('l',{stake:1.5,result:'loss',gradedBy:'manual',start:iso(NOW-4*H)}), bet('later',{stake:4,start:iso(NOW+5*H)})];
(async()=>{ const b=await chromium.launch(); const errs=[];
  for(const [W,Ht] of [[390,664],[1280,900]]){ const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:W,height:Ht}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(([R,L])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig',bank:'500',cfgVer:3.03})); localStorage.setItem('mbev.cards','1'); localStorage.setItem('mbev.log',JSON.stringify(L)); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:'2026-11-13',rows:R})); }catch(e){} },[ROWS,LOG]);
  const p=await ctx.newPage(); p.on('pageerror',e=>errs.push(W+': '+e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1500);
  const line=await p.evaluate(()=>document.getElementById('tbFoldBtn').textContent.replace(/\s+/g,' ').trim());
  check(W+' px: the TODAY line does not say "in play" when nothing is in play (it used to copy the grey "worst" number)', !/in play/i.test(line) && /3 bets/.test(line), line);
  const cw=await p.evaluate(()=>({now:+document.getElementById('count').textContent, where:(document.getElementById('countWhere')||{}).textContent||''}));
  const sum=(cw.where.match(/\d+/g)||[]).reduce((a,x)=>a+(+x),0);
  check(W+' px: v5.00 (Alonzo: "it says 24 bets to bet now...i dont see that amount"): under the number, where they are by tab, and they add up to it', cw.now>0 && /^in /.test(cw.where) && sum===cw.now, cw);
  const tops=await p.evaluate(async()=>{ const n=[]; for(const m of Object.keys(MODES)){ setMode(m); await new Promise(r=>setTimeout(r,120)); n.push(...[...document.querySelectorAll('.sc-mathtop')].map(()=>m)); } setMode('safe'); return n; });
  check(W+' px: one ✅ #1 MATH PICK across every tab (not one per tab)', tops.length===1, tops);
  await p.evaluate(()=>setMode('volado')); await p.waitForTimeout(250);
  const chips=await p.evaluate(()=>{ const all=document.querySelector('#bookChips .bchip[data-book=""] small'); const cards=[...document.querySelectorAll('#placeCards .sc-card')].filter(c=>c.querySelector('.bet-btn')).length; return {all:all?+all.textContent:null, cards}; });
  check(W+' px: the "All" book chip counts the bets to place on this tab, the same as the cards', chips.all===chips.cards && chips.cards>=1, chips);
  await p.evaluate(()=>{ const c=[...document.querySelectorAll('.sc-card')].find(x=>x.textContent.includes('Clean Pick')); window.scrollTo(0, c.getBoundingClientRect().top+scrollY-20); c.querySelector('.bet-btn').click(); }); await p.waitForTimeout(600);
  const ed=await p.evaluate(()=>{ const e=document.querySelector('.sc-card .editor'), d=document.getElementById('apiDock').getBoundingClientRect(), s=e.querySelector('.eb-save').getBoundingClientRect(), c=e.querySelector('.eb-cancel').getBoundingClientRect(); return {save:Math.round(s.bottom), cancel:Math.round(c.bottom), dock:Math.round(d.top), small:[...e.querySelectorAll('input:not([type=checkbox]):not([type=radio]), select')].filter(x=>x.offsetParent && parseFloat(getComputedStyle(x).fontSize)<16).length}; });
  check(W+' px: "I bet this": Save and Cancel are both above the bottom bar', ed.save<=ed.dock && ed.cancel<=ed.dock, ed);
  if(W===390) check('phone: no field in the bet form is under 16px (the Book and "Enter as" menus were 13px)', ed.small===0, ed);
  await p.evaluate(()=>window.scrollTo(0,1200)); await p.click('.tab[data-view="v-settings"]'); await p.waitForTimeout(250);
  check(W+' px: a tab opens at the top, not where the last page was scrolled', await p.evaluate(()=>scrollY)===0, await p.evaluate(()=>scrollY));
  if(W===390){ await p.evaluate(()=>window.scrollTo(0,900)); await p.evaluate(()=>document.querySelector('.tab[data-view="v-add"]').click()); await p.waitForTimeout(800);
    const ab=await p.evaluate(()=>({small:[...document.querySelectorAll('#addBetPanel input:not([type=checkbox]):not([type=radio]), #addBetPanel select')].filter(x=>x.offsetParent && parseFloat(getComputedStyle(x).fontSize)<16).length, sport:Math.round(document.getElementById('abSport').getBoundingClientRect().top)}));
    check('phone: + Add a bet opens with Sport in view, and no field under 16px', ab.small===0 && ab.sport>=0 && ab.sport<500, ab); }
  const over=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth); check(W+' px: no sideways scroll', over<=0, over);
  await ctx.close(); }
  check('no page errors', !errs.length, errs);
  await b.close(); console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(fail?1:0); })();
