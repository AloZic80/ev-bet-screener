// v5.24 (Easy, step 3b): La Guardia's 15 safety requirements for the Easy app, made executable wherever the built app can show them (judge-guardia.md). Each check names its requirement (R1 to R15).
// R6 (an age and place check before first use) is not built: it needs El Licenciado (a real lawyer), so it is printed as a note, not a pass.
// The customer build is this same file with DEV_APP set to false (a text replace in memory), as a paid build would be.
const path=require('path'), fs=require('fs');
const { chromium } = require('playwright');
const html=fs.readFileSync(process.argv[2]||path.join(__dirname,'..','index.html'),'utf8');
const cust=html.replace('const DEV_APP=true','const DEV_APP=false'); if(cust===html) throw new Error('the DEV_APP flag was not found');
const K=require('./v524-easy-kit.js')(html), { T, FORBID, GODONLY, EMOJI, PROMISE, inView, rect }=K, R=K.mk(), check=R.check;
const GOD_DEV=new RegExp(GODONLY.source.replace('|God|','|'));   // the dev app says God mode on purpose (the banner, the dev row, "press Load"): the customer build is scanned for it too
const TABS=/\b(Tranqui|Parejo|Volado|Perfecta|Boring|Sentinel)\b/;
const bad=(t,dev)=>{ const m=[ (t.match(FORBID)||[])[0], (t.match(dev?GOD_DEV:GODONLY)||[])[0], (t.match(PROMISE)||[])[0], (t.match(TABS)||[])[0], EMOJI.test(t)?'emoji':'' ].filter(Boolean); return m; };
const HONEST='Any single bet can lose. The edge only shows over many bets.';
const HELP=/Betting should stay fun\. Only use money you set aside and can afford to lose\. Help: 1-800-GAMBLER \(placeholder, to be confirmed by a lawyer\)\./;
const honestIn=p=>p.evaluate(()=>[...document.querySelectorAll('.view.on .ez-honest')].filter(e=>e.getClientRects().length).some(e=>{ const r=e.getBoundingClientRect(); if(!(r.top>=0 && r.bottom<=innerHeight+0.5 && r.width>0)) return false; const t=document.elementFromPoint(r.left+r.width/2, r.top+r.height/2); return !!t && e.contains(t); }));

// every Easy screen in a context: Today, every pick in its three parts, My bets, each Learn lesson, Settings. Returns [{n, t, hon}]
async function walk(p, W, o){ o=o||{}; const out=[]; const add=async n=>out.push({n, t:await K.screenText(p), hon:W===390 ? await honestIn(p) : null});
  await K.tab(p,'v-etoday'); await add('today'); const keys=await p.evaluate(()=>easyList().picks.map(x=>x.key));
  for(let i=0;i<keys.length;i++){ const back=await p.$('#ezPick [data-ez="back"]'); if(back && await back.isVisible()){ await back.click(); await p.waitForTimeout(150); }
    await p.click('#ezList [data-ez="open"][data-key="'+keys[i].replace(/"/g,'\\"')+'"]'); await p.waitForTimeout(250);
    for(const seg of ['what','fair','type']){ await p.click('#ezPick [data-ez="seg"][data-seg="'+seg+'"]'); await p.waitForTimeout(120); await add('pick '+(i+1)+' / '+seg); } }
  const back=await p.$('#ezPick [data-ez="back"]'); if(back && await back.isVisible()){ await back.click(); await p.waitForTimeout(150); }
  await K.tab(p,'v-ebets'); await add('my bets');
  await K.tab(p,'v-elearn'); for(let n=1;n<=10;n++){ await p.click('#exLb'+n); await p.waitForTimeout(80); await add('learn '+n); }
  await K.tab(p,'v-esettings'); await add('settings'); await p.fill('#easyBank','3'); await p.press('#easyBank','Tab'); await p.waitForTimeout(150); await add('settings with a refused number');
  await K.tab(p,'v-etoday'); return out; }

(async()=>{
 const b=await chromium.launch();

 // ---------- R3, R2, R5, R15 on every screen at 390 and 1280 (the owner's dev app, which is the same Easy screens) ----------
 const STATES=[]; // [name, W, H, open options, prepare]
 for(const [W,H] of [[390,844],[1280,900]]){
   { const A=await K.open(b,W,H,{practice:{rows:K.EXROWS}}), p=A.page; const S=await walk(p,W); STATES.push({W, name:'a normal day with an exchange pick', S}); 
     const tp=await p.evaluate(()=>({types:[...document.querySelectorAll('.ez-card')].length, heading:(document.querySelector('#ezList .ez-h')||{}).innerText, exch:easyList().picks.some(x=>/poly|kalshi|novig/i.test(x.r.book))}));
     check('R3 setup ('+W+'): the walk reached '+S.length+' screens, including an exchange pick\'s ticket', S.length>=29 && tp.exch, {n:S.length, tp}); await A.ctx.close(); }
   { const A=await K.open(b,W,H,{pre:p=>p.evaluate(()=>{})}), p=A.page; await p.evaluate(()=>{ const r=gN('Bam Adebayo'); r.offeredRaw='-260'; r.offeredProb=toProb('-260'); refresh(); }); await p.waitForTimeout(500);
     const out=[]; await K.tab(p,'v-etoday'); out.push({n:'a price that moved', t:await K.screenText(p), hon:W===390?await honestIn(p):null}); STATES.push({W, name:'a price that moved', S:out});
     const card=await p.evaluate(()=>(document.querySelector('#ezList .ez-card.moved')||{innerText:''}).innerText.replace(/\s+/g,' ').trim());
     check('R13 ('+W+'): a price that moved shows "Not worth it now" with the price before, the price now and the break-even chance', /Not worth it now/.test(card) && /Price before -230/.test(card) && /Price now -260/.test(card) && /needs a \d+\.\d% chance to break even/.test(card), card.slice(0,300)); await A.ctx.close(); }
   { const A=await K.open(b,W,H), p=A.page; await p.evaluate(()=>{ document.getElementById('books').value='NoSuchBook'; refresh(); }); await p.waitForTimeout(500);
     const out=[{n:'a quiet day', t:await K.screenText(p), hon:W===390?await honestIn(p):null}]; STATES.push({W, name:'a quiet day', S:out}); await A.ctx.close(); }
   { const A=await K.open(b,W,H), p=A.page; await p.evaluate(()=>{ document.getElementById('books').value=''; refresh(); lastRows.forEach(r=>{ r.loadedAt=new Date(Date.now()-13*3600e3).toISOString(); delete r.priceAt; }); easyPaintToday(); }); await p.waitForTimeout(400);
     const t=await K.screenText(p); STATES.push({W, name:'prices older than the allowed age', S:[{n:'old board', t, hon:W===390?await honestIn(p):null}]});
     check('R13 ('+W+'): prices older than the allowed age are not listed as placeable and Today says how old the newest one is', /The prices on this screen are not fresh/.test(t) && /13 hours ago/.test(t) && (await p.evaluate(()=>document.querySelectorAll('#ezList .ez-card').length))===0, T(t).slice(0,200)); await A.ctx.close(); }
   { const A=await K.open(b,W,H,{practice:{rows:()=>[]}}), p=A.page; STATES.push({W, name:'no board', S:[{n:'no board', t:await K.screenText(p), hon:W===390?await honestIn(p):null}]}); await A.ctx.close(); }
   { const A=await K.open(b,W,H,{welcome:true}), p=A.page; STATES.push({W, name:'the welcome', S:[{n:'welcome', t:await K.screenText(p), hon:W===390?await honestIn(p):null}]}); await A.ctx.close(); }
 }
 const all=[]; STATES.forEach(s=>s.S.forEach(x=>all.push(Object.assign({W:s.W, state:s.name},x))));
 const badOnes=all.map(x=>({w:x.W, s:x.state, n:x.n, m:bad(x.t,true)})).filter(x=>x.m.length);
 check('R3 + R15: no forbidden word, no God-only word, no other chance-tab name, no profit promise, no flame or confetti on ANY Easy screen ('+all.length+' screens at 390 and 1280: Today, the pick page in all three parts for every pick, the exchange ticket, the moved, quiet, old-price and no-board states, the welcome, My bets, every Learn lesson opened, Settings)', badOnes.length===0 && all.length>=60, badOnes.slice(0,5));
 const hon390=all.filter(x=>x.W===390 && x.hon!==null && !/^(my bets|learn|settings)/.test(x.n));
 check('R2: the honest line is inside the 390x844 screen, not covered, without scrolling, on Today and on every pick page (all three parts, every pick) and in the moved, quiet, old-price, no-board and welcome states ('+hon390.length+' screens)', hon390.length>=20 && hon390.every(x=>x.hon===true), hon390.filter(x=>!x.hon).map(x=>x.state+' / '+x.n));
 check('R2: the honest line is on every Easy screen in the exact words ('+all.length+' screens)', all.every(x=>x.t.includes(HONEST)), all.filter(x=>!x.t.includes(HONEST)).map(x=>x.state+' / '+x.n).slice(0,5));
 const help=all.filter(x=>/^(today|my bets|settings)/.test(x.n) && x.state==='a normal day with an exchange pick');
 check('R5: the help line (placeholder number, to be confirmed by a lawyer) is on Today, My bets and Settings at 390 and 1280', ['today','my bets','settings'].every(n=>[390,1280].every(W=>help.some(x=>x.n===n && x.W===W && HELP.test(x.t.replace(/\s+/g,' '))))), help.map(x=>[x.W,x.n,HELP.test(x.t.replace(/\s+/g,' '))]));
 const tick=all.filter(x=>/ \/ type$/.test(x.n));
 check('R9: every Type this page says "The app does not place bets for you."', tick.length>=10 && tick.every(x=>/The app does not place bets for you\./.test(x.t)), tick.filter(x=>!/The app does not place bets for you\./.test(x.t)).map(x=>x.n));
 console.log('NOTE R6: an age and place check before first use is NOT built (it needs El Licenciado, a real lawyer): Today still shows picks to anyone. Not tested, not passed.');

 // ---------- R4 and R11, R14, R15 on Today and the pick page (390) ----------
 { const A=await K.open(b,390,844), p=A.page;
   const C=await p.evaluate(()=>[...document.querySelectorAll('#ezList .ez-card:not(.moved)')].map(c=>{ const ss=[...c.querySelectorAll('.ez-s')], vs=[...c.querySelectorAll('.ez-v')], cs=e=>getComputedStyle(e); return {loss:ss[0].innerText, gain:ss[1].innerText, a:[cs(ss[0]).fontSize,cs(ss[1]).fontSize], v:[cs(vs[1]).fontSize,cs(vs[2]).fontSize], w:[cs(vs[1]).fontWeight,cs(vs[2]).fontWeight], chance:vs[0].innerText}; }));
   check('R4: every card shows what you pay and "lost if it misses" at the same size as what you get back and "if it happens" (5 cards)', C.length===5 && C.every(c=>c.loss==='lost if it misses' && c.a[0]===c.a[1] && c.v[0]===c.v[1] && c.w[0]===c.w[1] && parseFloat(c.a[0])>=16), C[0]);
   await p.click('#ezList [data-ez="open"]'); await p.waitForTimeout(250);
   const P=await p.evaluate(()=>{ const ss=[...document.querySelectorAll('#ezPick .ez-s')].filter(e=>/lost if it misses|if it happens/.test(e.innerText)), cs=e=>getComputedStyle(e); const bar=[...document.querySelectorAll('#ezPick .ez-bar .ez-btn')].map(e=>({t:e.innerText.trim(), fs:cs(e).fontSize, fw:cs(e).fontWeight, w:Math.round(e.getBoundingClientRect().width), h:Math.round(e.getBoundingClientRect().height)})); return {n:ss.length, sizes:ss.map(e=>cs(e).fontSize), bar}; });
   check('R4: on the pick page the loss line is the same size as the payout line wherever both are shown', P.n===0 || new Set(P.sizes).size===1, P);
   const pl=P.bar.find(x=>x.t==='I placed it'), sk=P.bar.find(x=>x.t==='Not for me');
   check('R11: Not for me is as plain as I placed it (same size, weight, width and height); no urgency verbs anywhere', pl && sk && pl.fs===sk.fs && pl.fw===sk.fw && Math.abs(pl.w-sk.w)<1 && pl.h===sk.h, P.bar);
   await A.ctx.close(); }
 { const A=await K.open(b,390,844,{practice:{rows:K.EXROWS}}), p=A.page; const h=await p.evaluate(()=>{ const w=document.querySelector('#ezList .ez-wait'); return {head:document.querySelector('#ezList .ez-h').innerText, cards:document.querySelectorAll('#ezList .ez-card:not(.moved)').length, wait:w?w.innerText.replace(/\s+/g,' ').trim():null, waitBtns:w?[...w.querySelectorAll('button,a')].map(e=>e.innerText.trim()):[], total:easyList().picks.length+easyList().waiting.length}; });
   check('R14: the heading count equals the cards listed, and the sixth shows only as "1 more waiting." with a plain See next link (no add-more button)', /^5 prices worth paying today$/.test(T(h.head)) && h.cards===5 && h.total===6 && /^1 more waiting\. See next$/.test(h.wait) && h.waitBtns.join()==='See next' && !/\b(add|load|show) more\b/i.test(h.wait), h);
   const N=await p.evaluate(()=>{ const rows=easyList().picks; return rows.map((x,i)=>({n:+(document.querySelectorAll('#ezList .ez-card:not(.moved)')[i].querySelectorAll('.ez-v')[0].innerText.match(/About (\d+) in 100/)||[])[1], act:Math.round(x.r.actProb*100), model:Math.round(x.r.fairProb*100), market:Math.round(x.r.mktProb*100)})); });
   check('R15: the chance on every card is La Contadora\'s careful chance (not the model\'s, not the market\'s)', N.every(x=>x.n===x.act) && N.some(x=>x.act!==x.model || x.act!==x.market), N);
   await A.ctx.close(); }

 // ---------- R9, R10, R12: placing, undo, and what travels ----------
 { const A=await K.open(b,390,844), p=A.page;
   await p.evaluate(()=>{ window._w={keys:[], add:0}; const si=Storage.prototype.setItem; Storage.prototype.setItem=function(k,v){ window._w.keys.push(k); return si.apply(this,arguments); }; const ad=window.addToLog; window.addToLog=function(){ window._w.add++; return ad.apply(this,arguments); }; });
   const n0=A.requests.length, before=await p.evaluate(()=>({n:logged.length, keys:easyList().picks.map(x=>x.key), cards:document.querySelectorAll('#ezList .ez-card:not(.moved)').length}));
   await p.click('#ezList [data-ez="open"]'); await p.waitForTimeout(250); await p.click('#ezPlaced'); await p.waitForSelector('#ezPick .ez-conf',{timeout:8000}); await p.waitForTimeout(400);
   const W=await p.evaluate(()=>({keys:[...new Set(window._w.keys)], add:window._w.add, n:logged.length, conf:document.querySelector('#ezPick .ez-conf').innerText.replace(/\s+/g,' ').trim(), cards:[...document.querySelectorAll('#ezList .ez-card:not(.moved)')].map(c=>c.dataset.key), saved:JSON.parse(localStorage.getItem('mbev.log')).length, undo:document.querySelectorAll('#ezPick [data-ez="undo"]').length}));
   const reqs=A.requests.slice(n0), orderish=reqs.filter(r=>(r.m!=='GET' && r.m!=='HEAD' && r.m!=='OPTIONS') || /\/(order|orders|place|trade|buy|bet)\b/i.test(new URL(r.u).pathname) && !/\/mine\/orders$/.test(new URL(r.u).pathname) || /kalshi\.com|polymarket|novig\.|prophetx/i.test(r.u));
   check('R9: I placed it writes the bet through the app\'s own save (one addToLog, the Bet log saved, one more bet) and nothing else is written but the log, the board copy and the app\'s own notes', W.add===1 && W.n===before.n+1 && W.saved===before.n+1 && W.keys.includes('mbev.log') && !W.keys.some(k=>/pass|sync|key|token/i.test(k)), {keys:W.keys, add:W.add});
   check('R9: while it saved, the page made '+reqs.length+' network call(s) and none is an order, a trade, a place call, a non-read call or a call to an exchange', orderish.length===0, {n:reqs.length, paths:[...new Set(reqs.map(r=>r.m+' '+new URL(r.u).pathname))].slice(0,12), orderish:orderish.map(r=>r.m+' '+r.u)});
   check('R9: the confirmation says it only saves a note and the app never places a bet; R10: the pick left Today at once and Undo is offered', /“?I placed it”? only saves a note in My bets\. The app never places a bet for you\./.test(W.conf) && !W.cards.includes(before.keys[0]) && W.undo===1, {conf:W.conf.slice(0,200), cards:W.cards.length});
   await p.click('#ezPick [data-ez="undo"]'); await p.waitForTimeout(400); const U=await p.evaluate(()=>({n:logged.length, keys:easyList().picks.map(x=>x.key), cards:[...document.querySelectorAll('#ezList .ez-card:not(.moved)')].map(c=>c.dataset.key)}));
   check('R10: Undo removes the saved bet and the pick is back on Today in its place', U.n===before.n && U.cards[0]===before.keys[0] && U.cards.length===before.cards, U);
   await A.ctx.close(); }
 { // the money set aside: floor, maximum, no stake above it, saved stakes untouched, no wrong words
   const A=await K.open(b,390,844), p=A.page; await K.tab(p,'v-esettings'); const base=await p.evaluate(()=>JSON.stringify(logged)); const res=[];
   for(const v of ['5','100001','10','50','200','2000','100000']){ await p.fill('#easyBank',v); await p.press('#easyBank','Tab'); await p.waitForTimeout(250); res.push(await p.evaluate(v=>({v, bank:cfgRead().bank, max:Math.max(0,...easyList().picks.map(x=>x.nums.pay)), n:easyList().picks.length, past:JSON.stringify(logged)}),v)); }
   check('R7: the number set aside accepts $10 to $100,000 only (5 and 100001 are refused and the number stays); the app\'s listed stakes never exceed it', res[0].bank===2000 && res[1].bank===2000 && res.slice(2).every(r=>r.bank===+r.v && r.max<=r.bank), res.map(r=>[r.v,r.bank,r.max,r.n]));
   check('R7: changing it never raises or changes a past stake (the saved log is byte for byte the same)', res.every(r=>r.past===base), null);
   const st=await p.evaluate(()=>document.getElementById('v-esettings').innerText+document.getElementById('v-ebets').innerText);
   check('R7: it is called the person\'s own number, "not an account", and the words balance, deposit and wallet appear nowhere', /Your own number, not an account/.test(st) && !/\b(balance|deposit|wallet)\b/i.test(st) && !/\b(balance|deposit|wallet)\b/i.test(all.map(x=>x.t).join(' ')), null); await A.ctx.close(); }
 { // R8: open bets are in play, never won or lost
   const A=await K.open(b,390,844), p=A.page; await K.tab(p,'v-ebets');
   const a=await p.evaluate(()=>({so:easySoFar(), ip:easyInPlay().atRisk, n:easyInPlay().count}));
   await p.evaluate(()=>{ const o=logged.find(x=>easyStatusOf(x)==='open' && x.kind!=='parlay'); const c1=JSON.parse(JSON.stringify(o)); c1.id='open-extra-1'; c1.result='pending'; c1.stake=25; const c2=JSON.parse(JSON.stringify(o)); c2.id='open-extra-2'; c2.result='?'; c2.stake=5; logged.push(c1,c2); saveLog(); refresh(); easyPaintBets(); }); await p.waitForTimeout(400);
   const z=await p.evaluate(()=>({so:easySoFar(), ip:easyInPlay().atRisk, n:easyInPlay().count, tags:[...document.querySelectorAll('#exBets .ex-row[data-id^="open-extra"] .ex-tag')].map(e=>e.innerText), sofar:document.querySelector('#exBets .ex-sofar').innerText.replace(/\s+/g,' '), strip:[...document.querySelectorAll('#exBets .ex-strip .ex-v')].map(e=>e.innerText), filters:[...document.querySelectorAll('#exBets .ex-f')].map(e=>e.innerText).join('|'), pend:document.getElementById('exBets').innerText.includes('Result not found yet.')}));
   check('R8: two more open bets (waiting and result not found) change In play (+$30.00) and the In play count (+2) and nothing in So far, Won or Lost', z.n===a.n+2 && Math.abs(z.ip-(a.ip+30))<0.001 && JSON.stringify(z.so)===JSON.stringify(a.so) && z.tags.join()==='In play,In play' && z.pend && z.filters.includes('In play ('+z.n+')'), {a:a.so, z:z.so, tags:z.tags, strip:z.strip});
   check('R8: So far counts settled bets only and says how many ("So far: N bets · won W · lost L")', new RegExp('^So far: '+a.so.bets+' bets · won '+a.so.won+' · lost '+a.so.lost+' · ').test(z.sofar) && a.so.bets===a.so.won+a.so.lost+a.so.push+a.so.sold, z.sofar); await A.ctx.close(); }
 { // R12: no key, passphrase, email or sync password on screen, in the console or in a URL (canary values)
   const A=await K.open(b,390,844,{pre:async p=>{ await p.evaluate(()=>{ localStorage.setItem('mbev.pass','CANARY-PASS-7781'); localStorage.setItem('mbev.syncKey','CANARY-SYNC-9912'); }); await p.reload(); await p.waitForTimeout(2500); }, practice:{rows:K.EXROWS}}), p=A.page;
   const S=await walk(p,390); const dom=await p.evaluate(()=>['v-etoday','v-ebets','v-elearn','v-esettings'].map(id=>document.getElementById(id).outerHTML).join('')+document.querySelector('.tabs').outerHTML+document.body.innerText);
   const CAN=/CANARY-(PASS|SYNC)-\d+|x-screener-pass|x-sync|passphrase|sync password|api[ _-]?key/i, EMAIL=/[\w.+-]+@[\w-]+\.[a-z]{2,}/i;
   const urls=A.requests.map(r=>r.u).concat([p.url()]), cons=A.consoleAll.join('\n');
   check('R12: no key, passphrase, sync password or email in any Easy screen or its HTML ('+S.length+' screens walked)', !CAN.test(dom) && !EMAIL.test(dom) && S.every(x=>!CAN.test(x.t) && !EMAIL.test(x.t)), {dom:(dom.match(CAN)||dom.match(EMAIL)||[])[0]});
   check('R12: none in the console ('+A.consoleAll.length+' messages) and none in any of the '+urls.length+' addresses the page asked for (the app\'s own header to its own Worker is not an address)', !/CANARY/.test(cons) && !EMAIL.test(cons) && urls.every(u=>!/CANARY|[?&](pass|key|token|passphrase|sync)=/i.test(u)), {c:(cons.match(/CANARY[^\n]*/)||[])[0], u:urls.filter(u=>/CANARY|[?&](pass|key|token)=/i.test(u)).slice(0,2)});
   check('R12: no page errors in the whole walk', A.errors.length===0 && A.consoleBad.length===0, {e:A.errors, c:A.consoleBad}); await A.ctx.close(); }

 // ---------- R1: the customer build ----------
 for(const [W,H] of [[390,844],[1280,900]]){
   const A=await K.open(b,W,H,{html:cust, easy:false, practice:{rows:K.EXROWS}, pre:async p=>{ await p.evaluate(()=>{ localStorage.setItem('mbev.viewAs','god'); localStorage.setItem('mbev.easy','{"welcomed":1}'); }); await p.reload(); await p.waitForTimeout(2500); }}), p=A.page;
   const L=await p.evaluate(()=>({level:easyLevel(), attr:document.documentElement.getAttribute('data-viewas'), stored:localStorage.getItem('mbev.viewAs'), tabs:[...document.querySelectorAll('.tabs .tab')].filter(t=>t.getClientRects().length).map(t=>t.textContent.trim().replace(/\s+\d+$/,'')), view:(document.querySelector('.view.on')||{}).id, devApp:DEV_APP}));
   check('R1 ('+W+'): a customer build with a forged mbev.viewAs="god" is still Easy: easyLevel() is "easy", the page says easy, the four Easy tabs are the only tabs, Today is open', L.devApp===false && L.level==='easy' && L.attr==='easy' && L.tabs.join('|')==='Today|My bets|Learn|Settings' && L.view==='v-etoday', L);
   await p.evaluate(()=>{ easySetLevel('god'); }); await p.waitForTimeout(200); const g=await p.evaluate(()=>({level:easyLevel(), attr:document.documentElement.getAttribute('data-viewas'), god:[...document.querySelectorAll('.tabs .tab:not(.etab)')].filter(t=>t.getClientRects().length).length}));
   check('R1 ('+W+'): asking for God from the page changes nothing (no way back, no visible God tab)', g.level==='easy' && g.attr==='easy' && g.god===0, g);
   await p.goto('http://app.test/?viewas=god#god'); await p.waitForTimeout(2500); const u=await p.evaluate(()=>({level:easyLevel(), attr:document.documentElement.getAttribute('data-viewas')}));
   check('R1 ('+W+'): a God address (?viewas=god) does not make a customer see God', u.level==='easy' && u.attr==='easy', u);
   const scan=async()=>p.evaluate(()=>{ const c=document.body.cloneNode(true); c.querySelectorAll('script,style,template,noscript').forEach(e=>e.remove()); const t=c.textContent.replace(/\s+/g,' ');
       return {ids:['easyBanner','easyBack','easyBack2','easyDevRow','easySwitchBox','easyWho','easyLvPlus','easyLabelsBtn'].filter(i=>document.getElementById(i)), lv:document.querySelectorAll('[data-level]').length, banner:document.querySelectorAll('.easy-banner').length,
         text:['Back to God mode','Dev app only','Customer view','View as','Who sees what','Plus (later)'].filter(s=>t.includes(s)), godWord:/\bGod\b/.test(t)&&t.match(/.{30}\bGod\b.{30}/)?.[0]}; });
   let D=await scan(); for(const v of ['v-etoday','v-ebets','v-elearn','v-esettings']){ await K.tab(p,v); const d=await scan(); if(d.ids.length||d.lv||d.banner||d.text.length||d.godWord) D=d; }
   check('R1 ('+W+'): the customer build has no element, text or button for Back to God mode, Dev app only, the Customer view banner, View as, Who sees what or Plus, on any of the four screens', !D.ids.length && !D.lv && !D.banner && !D.text.length, D);
   const S=await walk(p,W); const txt=S.map(x=>x.t).join(' ');
   check('R1 ('+W+'): across '+S.length+' screens of the customer build the word God never appears and every other safety scan is clean', !/\bGod\b/.test(txt) && !/Dev app/.test(txt) && S.every(x=>bad(x.t,false).length===0), S.filter(x=>bad(x.t,false).length||/God|Dev app/.test(x.t)).map(x=>x.n).slice(0,5));
   await p.evaluate(()=>{ document.getElementById('books').value=''; refresh(); lastRows.forEach(r=>{ r.loadedAt=new Date(Date.now()-13*3600e3).toISOString(); delete r.priceAt; }); easyPaintToday(); }); await p.waitForTimeout(400); await K.tab(p,'v-etoday');
   const old=await K.screenText(p); check('R1 ('+W+'): even when the board is old the customer build never says to switch to God mode', /not fresh/.test(old) && !/God|Dev app/.test(old), T(old).slice(0,160));
   check('R1 ('+W+'): no page errors', A.errors.length===0 && A.consoleBad.length===0, {e:A.errors, c:A.consoleBad}); await A.ctx.close(); }
 { // the dev app, for contrast: the same scan finds the controls
   const A=await K.open(b,390,844), p=A.page; await K.tab(p,'v-esettings'); const D=await p.evaluate(()=>({ids:['easyBanner','easyBack','easyBack2','easyDevRow'].filter(i=>document.getElementById(i))}));
   check('R1 (control): in the owner\'s dev app the same scan finds the banner, Back to God mode and the dev row (so the scan above can fail)', D.ids.length===4, D); await A.ctx.close(); }

 await b.close(); console.log('\n'+R.pass+' passed, '+R.fail+' failed'); process.exit(R.fail?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
