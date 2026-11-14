// node tests/v480-test.js — v4.80 (owner, Thu 11/12: "Yes all across. And what you seems better."):
// 1. near-misses, option A: no 🍀 Just missed offers on the board; the row stays a 👀 Watch row (no money). EXTRAS.nearMiss=false.
// 2. Show › ◎ Perfectas lists the Perfectas of EVERY tab.
// 3. Kalshi (Los Chismosos): an underdog spread is NO on the favourite's "wins by over X" market (as the Worker reads its price); a Draw row gets no strip.
// 4. A soccer Draw card says "Draw (tie)", with no home-team code or logo.
// 5. 🔔 level 1: Settings › "Tell me when a new ◎ Perfecta shows up": a banner (fixed), a sound and a browser notification, once per new Perfecta;
//    turning it on takes the board as it is (no burst). Nothing is read from any API for it.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,700)); };
const NOW=Date.parse('2026-11-10T19:00:00Z'), iso=ms=>new Date(ms).toISOString(), DAY='2026-11-10', KO=Date.parse('2026-11-11T01:15:00Z'), H=3600e3;
const T=(ha,abbr,loc,nick)=>({ha,id:abbr,abbr,name:loc+' '+nick,loc,nick,logo:'',rec:'',color:'333333',alt:'ffffff'});
const GI=(start,id,a,h)=>({state:'pre',startISO:iso(start),eventId:id,timeCT:'',detail:'',teams:[T('away',a[0],a[1],a[2]),T('home',h[0],h[1],h[2])]});
const G1=GI(KO,'401001',['BUF','Buffalo','Bills'],['MIN','Minnesota','Vikings']), G2=GI(KO+2*H,'401002',['NYI','New York','Islanders'],['SJ','San Jose','Sharks']);
const G3=GI(KO+H,'401003',['CAR','Carolina','Hurricanes'],['SEA','Seattle','Kraken']), G4=GI(KO-6*H,'740001',['CHE','Chelsea','FC'],['ARS','Arsenal','FC']);
const am=p=>p>=0.5?String(Math.round(-100*p/(1-p))):'+'+Math.round(100*(1-p)/p);
const prop=(id,name,team,market,side,price,fair,mkt,gi,sport,extra)=>Object.assign({name,team,game:gi.teams[0].abbr+' @ '+gi.teams[1].abbr,matchup:gi.teams[0].abbr+' @ '+gi.teams[1].abbr,side,sport,market,kind:'prop',book:'Novig',
  offeredRaw:am(price),offeredProb:price,fairProb:fair,fairRaw:am(fair),mktProb:mkt,stars:4,evModel:'projection',projValue:10,gameInfo:gi,src:'api:'+sport+':props',apiKey:id,loadedAt:iso(NOW-60e3)},extra||{});
const ROWS=[
  prop('perf','Justin Jefferson','MIN','75.5 Receiving Yards','O',0.54,0.60,0.585,G1,'NFL'),                                  // ◎ 6 of 6 (🪙 Volado)
  prop('five','Dalton Kincaid','BUF','40.5 Receiving Yards','O',0.54,0.60,0.585,G1,'NFL',{loadedAt:iso(NOW-14*60e3)}),         // 5 of 6: price 14 min old
  prop('lucky','Will Cuylle','SJ','1.5 Shots','O',0.535,0.5546,0.526,G2,'NHL'),                                               // just missed (La Contadora +0.2%)
  prop('leg','Victor Eklund','NYI','0.5 Shots','O',0.705,0.74,0.725,G2,'NHL'),                                                // 💪 Machín, not a Perfecta
  Object.assign(prop('kxsp','Seattle Kraken','SEA','+1.5 Spread','',0.62,0.70,0.68,G3,'NHL'),{kind:'spread',book:'Kalshi',src:'api:NHL:lines'}),   // Kalshi underdog spread
  Object.assign(prop('draw','Draw','ARS','Moneyline','',0.278,0.31,0.30,G4,'EPL'),{kind:'moneyline',src:'api:EPL:lines',matchup:'ARS vs CHE'})];  // a soccer Draw (team = home)
async function open(b, W, init){ const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:W,height:900}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(([R,d])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig, Kalshi',bank:'500',cfgVer:3.03})); localStorage.setItem('mbev.cards','1');
    localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows:R})); }catch(e){} },[ROWS,DAY]);
  if(init) await ctx.addInitScript(init);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.addInitScript(()=>{ window._barOpen=true; }) /* v4.95: these checks read the notes behind Filters, so Filters is open */; await p.goto('http://app.test/'); await p.waitForTimeout(1300); return {ctx,p,errs}; }
const cards=p=>p.evaluate(()=>[...document.querySelectorAll('#placeCards .sc-card')].map(c=>(lastRows.find(r=>r.idx===+c.dataset.idx)||{}).apiKey));
// a stand-in Notification: records what the page asks for (headless browsers show nothing)
const NOTIF=()=>{ window._notes=[]; window.Notification=class{ constructor(t,o){ window._notes.push({t, body:(o||{}).body, tag:(o||{}).tag}); } static get permission(){ return 'granted'; } static requestPermission(){ return Promise.resolve('granted'); } }; };
(async()=>{ const b=await chromium.launch(); let S;
  // ================= 1. near-misses: option A =================
  S=await open(b,1280);
  const nm=await S.p.evaluate(()=>{ const r=lastRows.find(x=>x.apiKey==='lucky'); return {off:EXTRAS.nearMiss===false, xc:r.xc||'', tier:r.tier||'', fit:r.xFit||'', watch:!!r.watch, act:+(r.actNet||0).toFixed(4)}; });
  check('near-misses are not offered (EXTRAS.nearMiss false): Cuylle (La Contadora +0.2%, under the 1.5% floor) is a 👀 Watch row: no offer and no stake; v4.81: he keeps his kind (🍀) for the record', nm.off && nm.watch && nm.xc==='lucky' && nm.tier==='' && nm.fit==='' && Math.abs(nm.act-0.002)<0.0015, nm);
  const placed=await S.p.evaluate(()=>{ addToLog(lastRows.find(x=>x.apiKey==='lucky')); const b=logged[logged.length-1]; const t=b.tier; logged.pop(); return t; });
  check('v4.81 (Los Chismosos): a near-miss you place anyway is saved as one (tier lucky), so it stays out of the Scorecard as before', placed==='lucky', placed);
  await S.p.evaluate(()=>setMode('lucky')); await S.p.waitForTimeout(300);
  const lk=await S.p.evaluate(()=>({cards:[...document.querySelectorAll('#placeCards .sc-card')].length, heads:[...document.querySelectorAll('#placeCards .pc-head')].map(h=>h.textContent.replace(/\s+/g,' ').trim()), info:(document.getElementById('contadora')||{}).textContent.replace(/\s+/g,' ')}));
  check('🍀 Suertudo: no Just missed card or header; La Contadora says the near-misses are a NO and not offered, 👀 Watch keeps their record', !lk.cards && !lk.heads.some(h=>/Just missed/i.test(h)) && /The ones that just missed my floor are a NO, so they are not offered: 👀 Watch keeps their record\./.test(lk.info) && /🍀 no Coin Flip right now · near-misses: 👀 Watch only/.test(lk.info), lk);
  await S.p.evaluate(()=>{ setMode('safe'); }); await S.p.evaluate(()=>{ if(!window._barOpen){ window._barOpen=true; barMoreApply(); } }) /* v4.94: the board controls are behind Filters; tap it first */; await S.p.selectOption('#boardView','watch'); await S.p.waitForTimeout(300);
  const wt=await S.p.evaluate(()=>[...document.querySelectorAll('#tbody tr:not(.group-row):not(.notes-row) .pick')].map(x=>x.textContent.trim()).concat([...document.querySelectorAll('#placeCards .sc-card')].map(c=>c.textContent)).join(' | '));
  await S.p.evaluate(()=>{ if(!window._barOpen){ window._barOpen=true; barMoreApply(); } }) /* v4.94: the board controls are behind Filters; tap it first */; await S.p.selectOption('#boardView','all'); await S.p.waitForTimeout(200);
  // ================= 2. Show › ◎ Perfectas, every tab =================
  const per={};
  for(const m of ['boring','safe','volado','lucky','clair']){ await S.p.evaluate(m=>setMode(m), m); await S.p.waitForTimeout(150); await S.p.evaluate(()=>{ if(!window._barOpen){ window._barOpen=true; barMoreApply(); } }) /* v4.94: the board controls are behind Filters; tap it first */; await S.p.selectOption('#boardView','perf'); await S.p.waitForTimeout(250); per[m]=(await cards(S.p)).join(); await S.p.evaluate(()=>{ if(!window._barOpen){ window._barOpen=true; barMoreApply(); } }) /* v4.94: the board controls are behind Filters; tap it first */; await S.p.selectOption('#boardView','all'); await S.p.waitForTimeout(150); }
  check('Show › ◎ Perfectas lists both Perfectas in every tab: Jefferson (a 🪙 Volado bet) and the Kalshi SEA +1.5 (a 💪 Machín bet, 68.7%), not only in their own tab', Object.values(per).every(v=>v.split(',').sort().join()==='kxsp,perf'), per);
  // ================= 3. Kalshi spreads and the Draw =================
  await S.p.evaluate(()=>setMode('safe')); await S.p.waitForTimeout(300);   // SEA +1.5 at 68.7%: a 💪 Machín bet
  const K=await S.p.evaluate(()=>{ const r=lastRows.find(x=>x.apiKey==='kxsp'), mx=maxPriceFor(okProbR(r), r.book, cfgRead().eMin), k=kalshiHow(r,+r.stake,r.offeredProb,mx);
    const fav=kalshiHow(Object.assign({}, r, {team:'CAR', name:'Carolina Hurricanes', market:'-1.5 Spread'}), 5, 0.4, 0.45), dr=kalshiHow(lastRows.find(x=>x.apiKey==='draw'), 5, 0.3, 0.3);
    const c=[...document.querySelectorAll('#placeCards .sc-card')].find(x=>/Seattle Kraken/.test(x.textContent)), line=c&&c.querySelector('.sc-kx'); let how=null;
    if(c){ const d=c.querySelector('details.sc-why'); if(d){ d.open=true; const h=c.querySelector('.kx-how'); how=h?h.innerText.replace(/\s+/g,' '):null; d.open=false; } }
    return {pass:r.pass, stake:+r.stake, fam:modeFamOf(r), k, fav, dr, line:line?line.innerText.replace(/\s+/g,' '):null, how}; });
  check('Kalshi, SEA +1.5 (an underdog spread): press NO on "CAR wins by over 1.5", not YES', K.pass && K.stake>0 && K.k && K.k.btn==='NO' && K.k.what==='CAR wins by over 1.5 (= SEA +1.5)' && K.k.on==='CAR wins by over 1.5', K);
  check('the card line and Why this play? say it: "On Kalshi NO on CAR wins by over 1.5 … Limit …¢" and "1 · Press NO CAR wins by over 1.5 (= SEA +1.5)"', /^On Kalshi NO on CAR wins by over 1\.5 Shares [\d.]+ Limit \d+¢ Cost ≈ \$/i.test(K.line||'') && /1 · Press NO CAR wins by over 1\.5 \(= SEA \+1\.5\)/i.test(K.how||''), {line:K.line, how:K.how});
  check('a favourite\'s spread (CAR -1.5) is YES on its own market: "CAR wins by over 1.5 (CAR -1.5)"; a Draw row gets no Kalshi strip', K.fav && K.fav.btn==='YES' && K.fav.what==='CAR wins by over 1.5 (CAR -1.5)' && K.dr===null, {fav:K.fav, dr:K.dr});
  // ================= 4. a Draw card =================
  await S.p.evaluate(()=>setMode('clair')); await S.p.waitForTimeout(300);
  const D=await S.p.evaluate(()=>{ const r=lastRows.find(x=>x.apiKey==='draw'), c=[...document.querySelectorAll('#placeCards .sc-card')].find(x=>x.querySelector('.sc-pick') && /Draw/.test(x.querySelector('.sc-pick').textContent));
    return {pass:r.pass, stake:+r.stake, fam:modeFamOf(r), pick:c?c.querySelector('.sc-pick').firstChild.textContent:null, logo:c?!!c.querySelector('img.pc-cl'):null, code:c?/\bARS\b/.test((c.querySelector('.sc-pick')||{}).textContent||''):null}; });
  check('a soccer Draw card says "Draw (tie)", not "ARS to win", and shows no home-team logo', D.pick==='Draw (tie)' && D.logo===false && D.code===false, D);
  const LD=await S.p.evaluate(()=>({draw:liveDesc(Object.assign(rowAsBet(lastRows.find(x=>x.apiKey==='draw')),{book:'Kalshi', id:'t1'})), spread:!!liveDesc(Object.assign(rowAsBet(lastRows.find(x=>x.apiKey==='kxsp')),{id:'t2'}))}));
  check('the Sentinels never ask the Worker for a Draw (it read a Draw as the home team); a team spread is still asked', LD.draw===null && LD.spread===true, LD);
  check('no page errors (near-misses, Perfectas, Kalshi, Draw)', !S.errs.length, S.errs); await S.ctx.close();
  // ================= 5. 🔔 notifications, level 1 =================
  for(const W of [1280,390]){
    S=await open(b,W,NOTIF);
    const on=await S.p.evaluate(()=>{ const c=document.getElementById('cPerfNotify'); c.checked=true; c.dispatchEvent(new Event('change',{bubbles:true})); return {stored:localStorage.getItem('mbev.perfNotify'), note:(document.getElementById('perfNotifyNote')||{}).textContent||''}; });
    await S.p.waitForTimeout(400);
    const n0=await S.p.evaluate(()=>({notes:window._notes.length, banner:!!document.querySelector('#perfAlert.on'), seen:Object.keys(JSON.parse(localStorage.getItem('mbev.perfSeen')||'{}')).filter(k=>k!=='_init').length}));
    if(W===1280) check('turning it on takes the board as it is: Jefferson and the Kalshi spread are already there, so no banner and no notification (no burst); the note says "On: banner, sound and a notification."', on.stored==='1' && /^On: banner, sound and a notification\.$/.test(on.note) && n0.notes===0 && !n0.banner && n0.seen===2, {on, n0});
    // Kincaid's price is read fresh: he turns 6 of 6, a new Perfecta
    await S.p.evaluate(()=>{ const r=lastRows.find(x=>x.apiKey==='five'); r.loadedAt=new Date().toISOString(); refresh(); }); await S.p.waitForTimeout(500);
    const n1=await S.p.evaluate(()=>{ const el=document.querySelector('#perfAlert'), r=el&&el.getBoundingClientRect(); return {notes:window._notes.slice(), ring:(lastRows.find(x=>x.apiKey==='five').ring||{}).n, banner:el&&el.classList.contains('on')?el.innerText.replace(/\s+/g,' '):null, box:r?{l:Math.round(r.left), r:Math.round(r.right), t:Math.round(r.top)}:null, fixed:el?getComputedStyle(el).position:null, over:document.documentElement.scrollWidth-innerWidth}; });
    check(W+' px: Kincaid turns 6 of 6: one banner "◎ New Perfecta" with what to do, and one notification with the same words', n1.ring===6 && n1.notes.length===1 && n1.notes[0].t==='◎ New Perfecta' && /^Dalton Kincaid Over 40\.5 Receiving Yards · Novig · OK up to [−+-]?\d+/.test(n1.notes[0].body||'') && /◎ New Perfecta/.test(n1.banner||'') && (n1.banner||'').includes(n1.notes[0].body), n1);
    check(W+' px: the banner is fixed at the top, inside the screen (it never moves the board), no sideways scroll', n1.fixed==='fixed' && n1.box && n1.box.l>=0 && n1.box.r<=W && n1.box.t>=0 && n1.over<=0, {box:n1.box, fixed:n1.fixed, over:n1.over});
    await S.p.evaluate(()=>{ document.querySelector('#perfAlert .pa-x').click(); refresh(); }); await S.p.waitForTimeout(400);
    const n2=await S.p.evaluate(()=>({notes:window._notes.length, banner:!!document.querySelector('#perfAlert.on')}));
    if(W===1280) check('once each: the next redraw does not alert again for Kincaid (the × closed the banner)', n2.notes===1 && !n2.banner, n2);
    if(W===1280){ const kt=await S.p.evaluate(()=>perfAlertText(lastRows.find(x=>x.apiKey==='kxsp')));
      check('on Kalshi or Polymarket the words say the button and the Limit (v4.81, Los Chismosos): "SEA +1.5 · Kalshi · press NO on CAR wins by over 1.5 · a Limit at 66¢, not Market"', /^SEA \+1\.5 · Kalshi · press NO on CAR wins by over 1\.5 · a Limit at 66¢, not Market$/.test(kt), kt);
      await S.p.evaluate(()=>{ perfBanner(['test']); }); await S.p.evaluate(()=>document.querySelector('#perfAlert .pa-show').click()); await S.p.waitForTimeout(400);
      const sv=await S.p.evaluate(()=>({view:document.getElementById('boardView').value, banner:!!document.querySelector('#perfAlert.on')}));
      check('"Show them" closes the banner and switches the board to Show › ◎ Perfectas', sv.view==='perf' && !sv.banner, sv); }
    check('no page errors (🔔 '+W+')', !S.errs.length, S.errs); await S.ctx.close(); }
  // off by default: nothing is asked for and nothing alerts
  S=await open(b,1280,NOTIF);
  await S.p.evaluate(()=>{ const r=lastRows.find(x=>x.apiKey==='five'); r.loadedAt=new Date().toISOString(); refresh(); }); await S.p.waitForTimeout(400);
  const off=await S.p.evaluate(()=>({on:perfNotifyOn(), notes:window._notes.length, banner:!!document.querySelector('#perfAlert.on'), checked:document.getElementById('cPerfNotify').checked}));
  check('off by default: the switch is unticked and a new Perfecta gives no banner and no notification', !off.on && !off.checked && off.notes===0 && !off.banner, off);
  check('no page errors (off)', !S.errs.length, S.errs); await S.ctx.close();
  await b.close(); console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(fail?1:0); })();
