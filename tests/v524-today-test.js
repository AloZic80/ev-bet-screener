// v5.24 (Easy, step 3a): Easy Today and the pick page. Boots the practice copy (tests/practice-copy.js: 35 invented rows, 16 invented bets, Sunday 2026-11-15 12:00 PM CT) with Easy on,
// and checks what a customer sees: five cards that equal the God board's picks, every figure from the engine, the pick page (three parts, a pinned bar above the dock), I placed it (the same bet
// as the God "I bet this" tap, Undo), Not for me, a price that moved, a quiet day, no board, the welcome, keyboard order, words, sizes, contrast, no key or email on screen.
// Screenshots (390 and 1280, light and dark) go to SHOTS when the environment variable EASY_SHOTS is a folder.
const path=require('path'), fs=require('fs');
const { chromium } = require('playwright');
require('./practice-fixtures.js').CFG.gameCapPct='20';   // v5.26 (STAKE-1, Build B): the game cap now holds over the board's own rows of a game; the practice board's KC @ DEN had $56 on its $40 cap (Pacheco listed), so the cap is raised here as in v517-tabrows (the caps are not what this test is about)
const { openPractice, fixtures: F } = require('./practice-copy.js');
const html=fs.readFileSync(process.argv[2]||path.join(__dirname,'..','index.html'),'utf8');
const SHOTS=process.env.EASY_SHOTS||'';
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,700)); };

const EXROWS=rs=>{ rs.forEach(r=>{ if(r.name==='Anthony Davis' && /poly/i.test(r.book)){ r.fairProb=0.645; r.mktProb=0.62; r.offeredProb=0.57; r.offeredRaw='-133'; } }); return rs; };   // a Polymarket US pick at 62.9%: it takes the fifth place, the Lakers wait
async function open(b, W, H, o){ o=o||{}; const A=await openPractice(b,Object.assign({html,width:W,height:H||844,settleMs:2500},o.practice||{})); const p=A.page;
  await p.evaluate(()=>{ const M={'Luka Doncic':/^4\.5 Rebounds/,'Bam Adebayo':/^7\.5 Rebounds/,'Zach Charbonnet':/^3\.5 Receptions/,'Isiah Pacheco':/^10\.5 Rushing/}; window.gN=n=>lastRows.find(r=>r.name===n && (!M[n] || M[n].test(r.market))); });
  if(o.exactLive) await A.ctx.route(u=>/0xbeta|workers\.dev/.test(u.hostname)&&u.pathname==='/live', r=>{ let bets=[]; try{ bets=JSON.parse(new URL(r.request().url()).searchParams.get('bets')||'[]'); }catch(e){} const R={}; bets.forEach(d=>{ R[d.id]={ok:true, src:d.book, price:o.exactLive, bid:o.exactLive-0.01, ask:o.exactLive, title:d.name, ref:'PRACTICE-'+d.id, at:new Date().toISOString(), url:'https://polymarket.us/practice'}; });   // the live price equals the card (a stub for the one Polymarket pick)
      r.fulfill({status:200, contentType:'application/json', headers:{'access-control-allow-origin':'*','access-control-allow-credentials':'true','access-control-allow-headers':'*'}, body:JSON.stringify({at:new Date().toISOString(), results:R})}); });
  A.consoleBad=[]; p.on('console',m=>{ if(m.type()==='error' && !/Failed to load resource/.test(m.text())) A.consoleBad.push(m.text()); });
  if(o.god) await o.god(p);
  if(o.easy!==false){ await p.evaluate(w=>{ if(w) localStorage.setItem('mbev.easy','{"welcomed":1}'); easySetLevel('easy'); }, o.welcome!==true); await p.waitForTimeout(500); }
  return A; }
const T=s=>String(s||'').replace(/\s+/g,' ').trim();
const cardsOf=p=>p.evaluate(()=>{ const T0=e=>e?e.innerText.replace(/\s+/g,' ').trim():''; return [...document.querySelectorAll('#ezList .ez-card:not(.moved)')].map(c=>({key:c.dataset.key, sentence:T0(c.querySelector('.ez-sent')), txt:c.innerText.replace(/\s+/g,' ').trim(), vals:[...c.querySelectorAll('.ez-v')].map(e=>e.innerText.trim()), s:[...c.querySelectorAll('.ez-s')].map(e=>e.innerText.trim())})); });
// sizes, tap targets and contrast of every text node under a root (in the page)
const MEASURE=rootSel=>{ const root=document.querySelector(rootSel); const res={nodes:0, minFont:99, under12:[], smallBody:[], tapSmall:[], minContrast:99, worst:null, overX:document.documentElement.scrollWidth-innerWidth};
  const parse=c=>{ const m=String(c).match(/rgba?\(([^)]+)\)/); if(!m) return [0,0,0,1]; const a=m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return [a[0],a[1],a[2],a.length>3?a[3]:1]; };
  const comp=(top,under)=>[0,1,2].map(i=>top[i]*top[3]+under[i]*(1-top[3]));
  const bgOf=el=>{ const layers=[]; for(let e=el;e;e=e.parentElement){ const c=parse(getComputedStyle(e).backgroundColor); if(c[3]>0){ layers.push(c); if(c[3]>=1) break; } } let base=parse(getComputedStyle(document.documentElement).backgroundColor); if(base[3]<1) base=[255,255,255,1]; let cur=base.slice(0,3); if(layers.length && layers[layers.length-1][3]>=1) cur=layers.pop().slice(0,3); while(layers.length){ cur=comp(layers.pop(),cur); } return cur; };
  const lum=c=>{ const a=c.map(v=>{ v/=255; return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4); }); return .2126*a[0]+.7152*a[1]+.0722*a[2]; };
  const walker=document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n;
  while((n=walker.nextNode())){ const t=n.nodeValue.replace(/\s+/g,' ').trim(); if(!t) continue; const el=n.parentElement; if(!el || el.closest('[hidden]') || !el.getClientRects().length) continue; const cs=getComputedStyle(el); if(cs.visibility==='hidden') continue;
    res.nodes++; const fs=parseFloat(cs.fontSize); if(fs<res.minFont) res.minFont=fs; if(fs<12) res.under12.push([t.slice(0,30),fs]); if(fs<16 && !el.closest('.ez-meta,.ez-l,.ez-k,.ez-pp-head')) res.smallBody.push([t.slice(0,30),fs,el.className]);
    const fg=parse(cs.color), bg=bgOf(el), fgc=fg[3]<1?comp(fg,bg):fg.slice(0,3), L1=lum(fgc), L2=lum(bg), cr=(Math.max(L1,L2)+.05)/(Math.min(L1,L2)+.05); if(cr<res.minContrast){ res.minContrast=cr; res.worst=[t.slice(0,40),+cr.toFixed(2),cs.color,bg.map(Math.round).join(',')]; } }
  root.querySelectorAll('button,a[href],[role=button]').forEach(e=>{ if(e.closest('[hidden]') || !e.getClientRects().length) return; const r=e.getBoundingClientRect(); if(r.width<=0) return; if(r.height<43.5 || r.width<43.5) res.tapSmall.push([T1(e.innerText).slice(0,24), Math.round(r.width), Math.round(r.height)]); });
  function T1(s){ return String(s).replace(/\s+/g,' ').trim(); }
  res.minContrast=+res.minContrast.toFixed(2); return res; };
const rect=(p,sel)=>p.evaluate(s=>{ const e=document.querySelector(s); if(!e) return null; const r=e.getBoundingClientRect(); return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,w:r.width,h:r.height,vh:innerHeight,vw:innerWidth}; },sel);
const inView=r=>r && r.top>=0 && r.bottom<=r.vh+0.5 && r.w>0;
const FORBID=/\b(guaranteed|sure|lock|can[’']t lose|free money|hot|hurry|last chance|streak|countdown|luck evens out|I found|balance|deposit|wallet)\b|\bonly \d+ left\b/i;
const GODONLY=/\b(EV|CLV|Kelly|hold|vig|juice|stale|outlier|Sentinels?|moneyline|O\/U|model|odds)\b|\bNaN\b|undefined|\[object/;
const shot=async(p,name)=>{ if(SHOTS) await p.screenshot({path:path.join(SHOTS,name)}); };
const bodyText=p=>p.evaluate(()=>document.body.innerText);

(async()=>{
 const b=await chromium.launch();

 // ---------- 1. Today at 390x844: five cards = the God board's picks and order; every figure from the engine ----------
 { const A=await open(b,390,844,{god:async p=>{ const god=[]; for(const m of ['boring','tranqui','safe','parejo']){ await p.evaluate(m=>setMode(m),m); await p.waitForTimeout(450);
       god.push(...await p.evaluate(()=>[...document.querySelectorAll('#placeCards .sc-card:not(.sc-x)')].filter(c=>c.querySelector('.bet-btn')).map(c=>c.dataset.pck))); } await p.evaluate(g=>{ window._god=g; },god); }}), p=A.page;
   const C=await cardsOf(p), E=await p.evaluate(()=>({god:window._god, list:easyList().picks.map(x=>({key:x.key, sentence:easySentence(x.r,true), chance:x.chance, pay:x.nums.pay, back:x.nums.back})), view:(document.querySelector('.view.on')||{}).id,
     heading:(document.querySelector('#ezList .ez-h')||{}).innerText, level:easyLevel(), tabs:[...document.querySelectorAll('.tabs .tab')].filter(t=>t.getClientRects().length).map(t=>t.textContent.trim().replace(/\s+\d+$/,''))}));
   check('1a: Easy Today lists five cards', C.length===5 && E.view==='v-etoday' && E.tabs.join('|')==='Today|My bets|Learn|Settings', {n:C.length, view:E.view, tabs:E.tabs});
   check('1b: the five cards equal the God board\'s picks and their order (same keys as the God cards)', C.map(c=>c.key).join('|')===E.god.join('|') && C.map(c=>c.key).join('|')===E.list.map(x=>x.key).join('|'), {cards:C.map(c=>c.sentence)});
   check('1c: the heading counts what is listed: "5 prices worth paying today"', T(E.heading)==='5 prices worth paying today', E.heading);
   C.forEach((c,i)=>{ const x=E.list[i], N=Math.round(x.chance*100);
     check('1d: card '+(i+1)+' ('+x.sentence.slice(0,30)+'): sentence, chance, You pay and You get back are the engine\'s', c.sentence===x.sentence && c.txt.includes('About '+N+' in 100') && c.vals.includes('$'+x.pay.toFixed(2)) && c.vals.includes('$'+x.back.toFixed(2)) && c.s.join('|')==='lost if it misses|if it happens', {c:c.vals, e:[N,x.pay,x.back]}); });
   const fsz=await p.evaluate(()=>{ const c=document.querySelector('#ezList .ez-card'), g=sel=>parseFloat(getComputedStyle(c.querySelector(sel)).fontSize), ss=[...c.querySelectorAll('.ez-s')], vs=[...c.querySelectorAll('.ez-v')]; return {loss:ss[0].innerText, gain:ss[1].innerText, lossSz:parseFloat(getComputedStyle(ss[0]).fontSize), gainSz:parseFloat(getComputedStyle(ss[1]).fontSize), payV:parseFloat(getComputedStyle(vs[1]).fontSize), backV:parseFloat(getComputedStyle(vs[2]).fontSize), wt:[getComputedStyle(vs[1]).fontWeight,getComputedStyle(vs[2]).fontWeight]}; });
   check('1e: "lost if it misses" has the same size as "if it happens", and what you pay the same as what you get back', fsz.lossSz===fsz.gainSz && fsz.payV===fsz.backV && fsz.wt[0]===fsz.wt[1] && fsz.lossSz>=16, fsz);
   const hon=await rect(p,'#ezList .ez-honest'), tx=T(await p.evaluate(()=>document.querySelector('#ezList .ez-honest').innerText));
   check('1f: the honest box is inside the viewport without scrolling (390x844) and says the exact line', inView(hon) && tx==='Any single bet can lose. The edge only shows over many bets.', {hon, tx});
   const M=await p.evaluate(MEASURE,'#v-etoday');
   check('1g: Today: nothing under 12 px, body text 16 px or more (only the small labels are smaller), tap targets 44 px or more, contrast 4.5 or more, no sideways scroll', M.under12.length===0 && M.smallBody.length===0 && M.tapSmall.length===0 && M.minContrast>=4.5 && M.overX<=0, M);
   const cp=await p.evaluate(()=>({help:/Betting should stay fun\. Only use money you set aside and can afford to lose\. Help: 1-800-GAMBLER \(placeholder, to be confirmed by a lawyer\)\./.test(document.getElementById('ezList').innerText), ago:(document.querySelector('.ez-ago')||{}).innerText, newest:Math.max(...lastRows.map(r=>rowSeenAt(r))), now:Date.now()}));
   check('1h: help footer and "Prices checked N minutes ago" (from the newest price time)', cp.help && cp.ago==='Prices checked '+Math.floor((cp.now-cp.newest)/60000)+' minutes ago.', {help:cp.help, ago:cp.ago});
   const txt=await bodyText(p), wide=await p.evaluate(()=>document.getElementById('ezList').innerText);
   check('1i: the whole Easy screen has none of the words the brief forbids, and none of the God-only words', !FORBID.test(txt) && !GODONLY.test(txt), {f:(txt.match(FORBID)||[])[0], g:(txt.match(GODONLY)||[])[0]});
   const sec=await p.evaluate(()=>{ const h=document.getElementById('v-etoday').outerHTML+document.body.innerText; return /passphrase|sync key|api key|x-sync|@[a-z0-9-]+\.[a-z]{2,}|practice/i.test(h) && h.match(/passphrase|sync key|api key|x-sync|@[a-z0-9-]+\.[a-z]{2,}|practice/i)[0]; });
   check('1j: no key, passphrase or email in the Easy DOM', sec===false, sec);
   check('1k: no page errors, no console errors', A.errors.length===0 && A.consoleBad.length===0, {e:A.errors, c:A.consoleBad}); await shot(p,'b3a-today-light-390.png'); await A.ctx.close(); }

 // ---------- 2. the pick page at 390: header, three parts, the pinned bar above the dock, keyboard order ----------
 { const A=await open(b,390,844), p=A.page; const list=await p.evaluate(()=>easyList().picks.map(x=>({key:x.key, name:x.r.name, strict:x.strict.text, fam:easyFairText(x.r), edge:easyEdgeLines(x.r), type:easyTypeThis(x.r), nums:x.nums})));
   const names=list.map(x=>x.name);
   for(let i=0;i<5;i++){ const x=list[i];
     await p.click('#ezList .ez-card:nth-of-type('+(i+1)+') [data-ez="open"]'.replace(':nth-of-type('+(i+1)+')','[data-key="'+x.key.replace(/"/g,'\\"')+'"]')); await p.waitForTimeout(250);
     const st=await p.evaluate(()=>({title:(document.getElementById('ezPickTitle')||{}).innerText, chips:[...document.querySelectorAll('#ezPick .ez-chip')].map(c=>[c.innerText.trim(),c.getAttribute('aria-pressed')]), ovl:document.getElementById('v-etoday').classList.contains('ez-ovl'),
       bar:(()=>{ const r=document.querySelector('#ezPick .ez-bar').getBoundingClientRect(), d=document.getElementById('apiDock').getBoundingClientRect(); return {bTop:r.top,bBottom:r.bottom,dockTop:d.top,vh:innerHeight}; })(),
       btns:[...document.querySelectorAll('#ezPick .ez-bar .ez-btn')].map(e=>({t:e.innerText.trim(), r:(()=>{ const r=e.getBoundingClientRect(); return {top:r.top,bottom:r.bottom,w:r.width,h:r.height,l:r.left}; })(), fs:getComputedStyle(e).fontSize, fw:getComputedStyle(e).fontWeight}))}));
     check('2a: pick '+(i+1)+': header "Pick '+(i+1)+' of 5", the three parts, opens on What happens, full screen on a phone', st.title==='Pick '+(i+1)+' of 5' && st.chips.map(c=>c[0]).join('|')==='What happens|Is the price fair?|How to type it' && st.chips[0][1]==='true' && st.ovl, st);
     check('2b: pick '+(i+1)+': the pinned bar is above the dock (no overlap) and fully in view', st.bar.bBottom<=st.bar.dockTop+0.5 && st.bar.bTop>0 && st.bar.bBottom<=st.bar.vh, st.bar);
     check('2c: pick '+(i+1)+': Open <book> is on its own row and does not wrap; I placed it and Not for me are equal (same size, weight and width)', st.btns.length===3 && /^Open /.test(st.btns[0].t) && st.btns[0].r.h<=52 && st.btns[0].r.w>300 && st.btns[1].t==='I placed it' && st.btns[2].t==='Not for me' && Math.abs(st.btns[1].r.w-st.btns[2].r.w)<1 && st.btns[1].fs===st.btns[2].fs && st.btns[1].fw===st.btns[2].fw && Math.abs(st.btns[1].r.h-st.btns[2].r.h)<1, st.btns);
     for(const seg of ['what','fair','type']){ await p.click('#ezPick [data-ez="seg"][data-seg="'+seg+'"]'); await p.waitForTimeout(120);
       const hon=await rect(p,'#ezPick .ez-honest'), body=await p.evaluate(()=>document.querySelector('#ezPick .ez-pp-body').innerText.replace(/\s+/g,' ').trim());
       check('2d: pick '+(i+1)+' / '+seg+': the honest box is inside the viewport without scrolling', inView(hon), hon);
       if(seg==='what') check('2e: pick '+(i+1)+': What happens has the sentence, the three columns, La Contadora named once, the two money lines', body.includes(T(x.name?'':'')) && body.includes('La Contadora (Spanish for the accountant) is the part of the app that checks each price.') && (body.match(/Spanish for the accountant/g)||[]).length===1 && body.includes('About '+Math.round((x.edge.chance))+' in 100') && body.includes('You pay') && body.includes('lost if it misses') && body.includes('You get back') && body.includes('If it does not happen, you lose the $'+x.nums.pay.toFixed(2)+'.'), body.slice(0,300));
       if(seg==='fair') check('2f: pick '+(i+1)+': Is the price fair? has the price in dollars, the two edge lines and the strict price from the engine (never worse than '+x.strict+')', body.includes(x.fam.mean) && body.includes(x.fam.here) && body.includes(x.edge.line1) && body.includes(x.edge.line2) && body.includes(x.fam.rule) && body.includes(x.strict) && /A price is what it costs to try to win \$1\./.test(body), body.slice(0,400));
       if(seg==='type'){ const steps=await p.evaluate(()=>[...document.querySelectorAll('#ezPick ol.ez-steps li')].map(l=>l.innerText.trim()));
         const lak=x.name==='Los Angeles Lakers';
         check('2g: pick '+(i+1)+': Type this shows numbered steps 1-5 from the engine (strict price '+x.strict+') and the In money line first', steps.length===5 && steps.every((s,k)=>lak&&k===1 ? /^Pick the bet on who wins the game and choose “Los Angeles Lakers”\./.test(s) : s===x.type.steps[k]) && /^In money: bet \$/.test(body.replace(/^.*?(In money)/,'$1')) && body.indexOf('In money')<body.indexOf('Open ')+1 && steps[3].includes(x.strict) && body.includes('The app does not place bets for you.'), {steps, body:body.slice(0,200)}); } }
     const M=await p.evaluate(MEASURE,'#ezPick'); check('2h: pick '+(i+1)+': sizes, tap targets and contrast on the pick page', M.under12.length===0 && M.smallBody.length===0 && M.tapSmall.length===0 && M.minContrast>=4.5 && M.overX<=0, M);
     if(i===0){ await p.click('#ezPick [data-ez="seg"][data-seg="what"]');
       // the keyboard: focus lands on the pick title; the tab order is Back, the three parts, Open, I placed it, Not for me; the list behind is not reachable
       const order=await p.evaluate(()=>{ const pane=document.getElementById('ezPick'); const f=[...pane.querySelectorAll('button,a[href],[tabindex="0"]')].filter(e=>e.getClientRects().length).map(e=>e.getAttribute('data-k')); return {f, listInert:document.getElementById('ezList').inert}; });
       check('2i: keyboard order on the pick page: Back, the three parts, the scrollable page, Open, I placed it, Not for me; the list behind it is inert', order.f.join('|')==='back|seg:what|seg:fair|seg:type|body|book|placed|skip' && order.listInert===true, order);
       await p.focus('#ezPickTitle'); const seq=[]; for(let k=0;k<8;k++){ await p.keyboard.press('Tab'); seq.push(await p.evaluate(()=>{ const a=document.activeElement; return a&&a.getAttribute?a.getAttribute('data-k')||a.id||a.tagName:null; })); }
       check('2j: pressing Tab from the title goes through the three parts, the scrollable page, Open, I placed it, Not for me', seq.slice(0,7).join('|')==='seg:what|seg:fair|seg:type|body|book|placed|skip' && seq[7]!==null && !/^(open|type|gl|unskip|dismiss):/.test(seq[7]||''), seq);
       await p.keyboard.press('Escape'); await p.waitForTimeout(250);
       const bk=await p.evaluate(()=>({ovl:document.getElementById('v-etoday').classList.contains('ez-ovl'), focus:document.activeElement.getAttribute('data-k')}));
       check('2k: Escape closes the pick page and puts focus back on the card\'s See this pick', bk.ovl===false && /^open:/.test(bk.focus||''), bk);
       await p.click('#ezList [data-ez="open"]'); await p.waitForTimeout(200); }
     await p.click('#ezPick [data-ez="back"]'); await p.waitForTimeout(200); }
   // Type this from the card opens on Type this
   await p.click('#ezList .ez-card [data-ez="type"]'); await p.waitForTimeout(200);
   const tt=await p.evaluate(()=>({pressed:[...document.querySelectorAll('#ezPick .ez-chip')].map(c=>c.getAttribute('aria-pressed')).join(','), title:document.getElementById('ezPickTitle').innerText}));
   check('2l: the card\'s "Type this" opens the pick page on Type this', tt.pressed==='false,false,true' && tt.title==='Pick 1 of 5', tt); await shot(p,'b3a-pick-type-light-390.png');
   check('2m: no page errors, no console errors', A.errors.length===0 && A.consoleBad.length===0, {e:A.errors, c:A.consoleBad}); await A.ctx.close(); }

 // ---------- 3. an exchange pick (Polymarket US): labeled rows, In money above the fold, Expires on one line, the Good til canceled note on its own line ----------
 { const A=await open(b,390,844,{practice:{rows:EXROWS}}), p=A.page; const C=await cardsOf(p); const ex=await p.evaluate(()=>{ const x=easyList().picks.find(q=>q.book==='Polymarket US'); return x && {key:x.key, T:easyTypeThis(x.r), nums:x.nums, sentence:x.sentence, fam:easyFairText(x.r), waiting:easyList().waiting.length}; });
   check('3a: a Polymarket US pick is among the five and the Lakers wait', !!ex && C.length===5 && ex.waiting===1, {n:C.length, waiting:ex&&ex.waiting});
   const sel='#ezList .ez-card[data-key="'+ex.key.replace(/"/g,'\\"')+'"]';
   const card=await p.evaluate(s=>document.querySelector(s).innerText.replace(/\s+/g,' '),sel);
   check('3b: its card says "Up to $X" you pay and the payout from the ticket', card.includes('Up to $'+ex.nums.pay.toFixed(2)) && card.includes('$'+ex.nums.back.toFixed(2)) && card.includes('Polymarket US'), card);
   await p.click(sel+' [data-ez="type"]'); await p.waitForTimeout(250);
   const R=await p.evaluate(()=>({flds:[...document.querySelectorAll('#ezPick .ez-fld')].map(f=>({k:f.querySelector('.ez-k').innerText, v:f.querySelector('.ez-val').innerText, m:(f.querySelector('.ez-m')||{}).innerText||''})), inMoney:(()=>{ const e=document.querySelector('#ezPick .ez-inmoney'); const r=e.getBoundingClientRect(); return {t:e.innerText, bottom:r.bottom, vh:innerHeight}; })(),
     exp:(()=>{ const v=[...document.querySelectorAll('#ezPick .ez-fld')].find(f=>f.querySelector('.ez-k').innerText.toLowerCase()==='expires'), r=v.querySelector('.ez-val').getBoundingClientRect(), g=document.querySelector('#ezPick .ez-gtc'); return {lines:Math.round(r.height/parseFloat(getComputedStyle(v.querySelector('.ez-val')).lineHeight)), gtc:g.innerText, sep:g.parentElement===v?false:true}; })(), pressed:[...document.querySelectorAll('#ezPick .ez-chip')].map(c=>c.getAttribute('aria-pressed')).join(',')}));
   const want=ex.T.rows.map(r=>r.label), got=R.flds.map(f=>f.k.toLowerCase()); const lab=s=>s.toLowerCase();
   check('3c: labeled rows, one thing per row, each with its plain meaning under it (the engine\'s rows, in the book\'s order)', ex.T.rows.every(r=>R.flds.some(f=>lab(f.k)===lab(r.label)&&(r.label==='Expires'?true:f.v===r.value&&f.m===r.note))) && R.flds[0].k.toLowerCase()==='where', {want, got});
   check('3d: the In money line is above the fold, and says the cost and the payout from the ticket', R.inMoney.bottom<R.inMoney.vh-80 && R.inMoney.t.includes('$'+ex.nums.cost.toFixed(2)) && R.inMoney.t.includes('$'+ex.nums.payout.toFixed(2)), R.inMoney);
   check('3e: Expires is one short line; the Good til canceled note is its own small line', R.exp.lines===1 && /^Expires before \d+:\d\d [AP]M CT$/.test(R.flds.find(f=>f.k.toLowerCase()==='expires').v) && /Good ’til canceled/.test(R.exp.gtc) && R.exp.sep, R.exp);
   const body=T(await p.evaluate(()=>document.querySelector('#ezPick .ez-pp-body').innerText)); check('3f: the page says the app never places a bet (once, small) and no God words', /The app does not place bets for you/.test(body) && !GODONLY.test(body) && !FORBID.test(body), body.slice(-200));
   const M=await p.evaluate(MEASURE,'#ezPick'); check('3g: sizes, tap targets and contrast on the exchange ticket', M.under12.length===0 && M.smallBody.length===0 && M.tapSmall.length===0 && M.minContrast>=4.5, M); await shot(p,'b3a-exchange-light-390.png');
   // the waiting pick: a plain row, "See it" opens it as an extra pick
   await p.click('#ezPick [data-ez="back"]'); await p.waitForTimeout(200);
   const w=await p.evaluate(()=>{ const e=document.querySelector('#ezList .ez-wait'); return {t:e.innerText.replace(/\s+/g,' ').trim(), btn:e.querySelector('button').innerText, isLink:e.querySelector('button').classList.contains('link')}; });
   check('3h: the sixth waits as plain text "1 more waiting." with a quiet See next link', /^1 more waiting\. See next$/.test(w.t) && w.isLink, w);
   await p.click('#ezList .ez-wait [data-ez="open"]'); await p.waitForTimeout(250); const xt=await p.evaluate(()=>document.getElementById('ezPickTitle').innerText);
   check('3i: See next opens it as "Extra pick (outside the five)"', xt==='Extra pick (outside the five)', xt);
   check('3j: no page errors', A.errors.length===0 && A.consoleBad.length===0, {e:A.errors,c:A.consoleBad});
   await A.ctx.close(); }

 // ---------- 4. I placed it: the same bet as the God "I bet this" tap; the pick leaves Today; Undo brings it back ----------
 const strip=o=>{ const j=JSON.parse(JSON.stringify(o)); const walk=(x)=>{ if(Array.isArray(x)) return x.map(walk); if(x && typeof x==='object'){ const y={}; Object.keys(x).sort().forEach(k=>{ y[k]=walk(x[k]); }); return y; } if(typeof x==='string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d/.test(x) && !/^\d{4}-\d\d-\d\dT00:00:00/.test(x)) return '<time>'; return x; }; const w=walk(j); delete w.id; return w; };
 const flat=(o,pre,out)=>{ out=out||{}; if(Array.isArray(o)||(o&&typeof o==='object')){ Object.keys(o).forEach(k=>flat(o[k],(pre?pre+'.':'')+k,out)); } else out[pre]=o; return out; };
 { const A=await open(b,390,844,{god:async p=>{ await p.evaluate(()=>setMode('volado')); await p.waitForTimeout(300); }}), p=A.page, G=await open(b,1280,900,{easy:false}), g=G.page;   // the God tab that is open is Volado, not the pick's own tab
   const before=await p.evaluate(()=>({n:logged.length, keys:easyList().picks.map(x=>x.key), mode:betMode, ver:SCREENER_VERSION})); const lukaKey=before.keys[0];
   await p.click('#ezList [data-ez="open"]'); await p.waitForTimeout(250); await p.click('#ezPlaced'); await p.waitForSelector('#ezPick .ez-conf',{timeout:8000}); await p.waitForTimeout(300);
   const after=await p.evaluate(()=>({n:logged.length, rec:JSON.parse(JSON.stringify(logged[logged.length-1])), title:document.getElementById('ezPickTitle').innerText, conf:document.querySelector('#ezPick .ez-conf').innerText.replace(/\s+/g,' ').trim(), keys:easyList().picks.map(x=>x.key), cards:[...document.querySelectorAll('#ezList .ez-card')].map(c=>c.dataset.key), heading:document.querySelector('#ezList .ez-h').innerText, fam:window._easyFam, mode:betMode, bar:!!document.querySelector('#ezPick .ez-bar')}));
   await g.evaluate(()=>setMode('boring')); await g.waitForTimeout(450); const idx=await g.evaluate(()=>String(gN('Luka Doncic').idx)); const n0=await g.evaluate(()=>logged.length);
   await g.click('#placeCards .sc-card[data-idx="'+idx+'"] .bet-btn'); await g.waitForSelector('#placeCards .editor .eb-save'); await g.waitForFunction(()=>{ const l=document.querySelector('#placeCards .editor .eb-live'); return !l || !/checking/.test(l.textContent); },null,{timeout:8000}); await g.waitForTimeout(200);
   await g.click('#placeCards .editor .eb-save'); await g.waitForFunction(k=>logged.length>k,n0,{timeout:5000}); await g.waitForTimeout(200); const real=await g.evaluate(()=>JSON.parse(JSON.stringify(logged[logged.length-1])));
   const a=flat(strip(after.rec)), c=flat(strip(real)), keys=[...new Set(Object.keys(a).concat(Object.keys(c)))], diff=keys.filter(k=>JSON.stringify(a[k])!==JSON.stringify(c[k]));
   check('4a: I placed it saves exactly one bet and shows the confirmation (title Saved, no pinned bar)', after.n===before.n+1 && after.title==='Saved' && !after.bar && /Saved to My bets/.test(after.conf), {n:[before.n,after.n], t:after.title});
   check('4b: the saved record equals the real God "I bet this" tap, field by field ('+keys.length+' fields), with Volado open instead of the pick\'s own Boring tab', diff.length===0 && keys.length>60 && before.mode==='volado', {fields:keys.length, diff:diff.map(k=>[k,a[k],c[k]]).slice(0,6)});
   check('4c: the saved record says the pick\'s own tab (Boring) in snap.mode and snap.listed.tab, though Volado was open; the helper is cleared', after.rec.snap.mode==='boring' && after.rec.snap.mode===real.snap.mode && after.rec.snap.listed.tab==='boring' && after.rec.snap.listed.tab===real.snap.listed.tab && after.fam==null && after.mode==='volado', {m:after.rec.snap.mode, tab:after.rec.snap.listed.tab, real:real.snap.mode, fam:after.fam, open:after.mode});
   check('4d: the confirmation has Undo ("I did not place it. Undo"), "Where it went", and the wording that the app never places a bet', /I did not place it\. Undo/.test(after.conf) && /Where it went: My bets, In play\./.test(after.conf) && /“I placed it” only saves a note in My bets\. The app never places a bet for you\. The bet itself is your own tap at the book\./.test(after.conf) && /Luka Doncic.* grabs 5 or more rebounds\./.test(after.conf), after.conf.slice(0,420));
   check('4e: the pick left Today at once (four cards, "4 prices", not in the engine list)', after.cards.length===4 && !after.cards.includes(lukaKey) && after.keys.length===4 && /^4 prices worth paying today$/.test(T(after.heading)), {cards:after.cards.length, h:after.heading});
   await shot(p,'b3a-saved-light-390.png');
   const mb=await p.evaluate(()=>({inPlay:easyInPlay().count, labels:easyInPlay().bets.map(x=>x.label)}));
   check('4f: it shows in My bets as in play (the engine\'s list), not won or lost', mb.inPlay===3 && mb.labels.some(l=>/Luka Doncic/.test(l)), mb);
   await p.click('#ezPick [data-ez="undo"]'); await p.waitForTimeout(350);
   const U=await p.evaluate(()=>({n:logged.length, cards:[...document.querySelectorAll('#ezList .ez-card')].map(c=>c.dataset.key), toast:document.getElementById('ezToast').innerText, ovl:document.getElementById('v-etoday').classList.contains('ez-ovl'), rm:removedBets.length, h:document.querySelector('#ezList .ez-h').innerText}));
   check('4g: Undo removes the bet, the pick is back on Today in its place, a quiet note says so', U.n===before.n && U.cards.join('|')===before.keys.join('|') && /Removed from My bets\. The pick is back on Today\./.test(U.toast) && U.ovl===false && /^5 prices/.test(U.h), U);
   check('4h: no page errors', A.errors.length===0 && A.consoleBad.length===0 && G.errors.length===0, {e:A.errors,c:A.consoleBad,g:G.errors}); await A.ctx.close(); await G.ctx.close(); }

 // ---------- 4b. the saved record for a Volado pick says Volado with Boring open; a plain God save is unchanged; the money shown equals what is saved ----------
 { const A=await open(b,1280,900,{easy:false}), p=A.page;
   const R=await p.evaluate(async()=>{ setMode('boring'); await new Promise(r=>setTimeout(r,400)); const vr=lastRows.find(r=>scApproved(r) && liveState(r)==='open' && tabOfChance(r.actProb)==='volado' && easyFamily(r)); if(!vr) return {none:true, rows:lastRows.filter(r=>scApproved(r)).map(r=>[r.name,tabOfChance(r.actProb)])}; const n0=logged.length; const res=await easyPlacedSave(pxKey(vr)); const b=logged[logged.length-1];
     return {saved:res.saved, name:vr.name, mode:b&&b.snap&&b.snap.mode, tab:b&&b.snap&&b.snap.listed&&b.snap.listed.tab, open:betMode, fam:window._easyFam, n:logged.length-n0}; });
   check('4i: a Volado pick placed from Easy with the Boring God tab open records Volado in snap.mode and snap.listed.tab; the helper is cleared', R.saved===true && R.mode==='volado' && R.tab==='volado' && R.open==='boring' && R.fam==null && R.n===1, R);
   const R2=await p.evaluate(async()=>{ setMode('boring'); await new Promise(r=>setTimeout(r,300)); const n0=logged.length; const luka=gN('Luka Doncic'); addToLog(Object.assign({},luka)); return {mode:logged[logged.length-1].snap.mode, open:betMode, fam:window._easyFam==null}; });
   check('4j: a plain God save is unchanged: snap.mode is the open tab', R2.mode==='boring' && R2.open==='boring' && R2.fam, R2); await A.ctx.close(); }

 // ---------- 5. the money shown is the money saved: for every pick, the shown wins equal betProfit of the bet easyPlacedSave saves (as a win) ----------
 for(const [label,o] of [['the five sportsbook picks',{}],['a Polymarket US pick',{practice:{rows:EXROWS}, exactLive:0.57}]]){ const A=await open(b,1280,900,Object.assign({easy:false},o)), p=A.page;
   const R=await p.evaluate(async()=>{ const out=[]; const keys=easyList().picks.concat(easyList().waiting).map(x=>x.key); for(const k of keys){ const x=easyList().picks.concat(easyList().waiting).find(q=>q.key===k); const nums=x.nums, F=easyFairText(x.r), cost=nums.cost, T=easyTypeThis(x.r); const res=await easyPlacedSave(k); const bet=logged.find(q=>q.id===res.id);
       if(!bet){ out.push({name:x.r.name, res}); continue; } const wins=betProfit(Object.assign({},bet,{result:'win'})); out.push({name:x.r.name, kind:nums.kind, saved:res.saved, stake:+bet.stake, shownStake:nums.st, shownWins:nums.wins, savedWins:wins, shownBack:nums.back, savedBack:+(+bet.stake+wins).toFixed(2), text:(F.here||'')+' '+(T.inMoney||''), exStake:cost}); } return out; });
   R.forEach(x=>{ const ex=x.kind==='kalshi'||x.kind==='poly'; check('5: '+label+': '+x.name+': shown wins $'+x.shownWins+' equal the saved bet\'s profit as a win $'+x.savedWins+(ex?'':', and the shown back $'+x.shownBack+' equals stake plus profit')+(ex?' (v5.73: the gap is closed: the exchange form now saves what the ticket shows, the cost with the fee, $9.87, and wins $6.13, no longer the God money-line $10.00 and $7.01)':''), x.saved===true && (ex ? (Math.abs(x.shownWins-6.13)<0.005 && Math.abs(x.savedWins-x.shownWins)<0.005 && Math.abs(x.stake-x.exStake)<0.005 && x.text.includes('$'+x.shownWins.toFixed(2))) : (Math.abs(x.shownWins-x.savedWins)<0.005 && Math.abs(x.shownBack-x.savedBack)<0.005 && x.stake===x.shownStake && x.text.includes('$'+x.shownWins.toFixed(2)))), x); });
   check('5: '+label+': no page errors', A.errors.length===0, A.errors); await A.ctx.close(); }

 // ---------- 6. Not for me and Bring it back ----------
 { const A=await open(b,390,844,{practice:{rows:EXROWS}}), p=A.page; const k0=(await p.evaluate(()=>easyList().picks.map(x=>x.key)));
   await p.click('#ezList [data-ez="open"]'); await p.waitForTimeout(200); const bar=await p.evaluate(()=>[...document.querySelectorAll('#ezPick .ez-bar .ez-btn')].map(e=>[e.innerText.trim(), e.getBoundingClientRect().height]));
   await p.click('#ezPick [data-ez="skip"]'); await p.waitForTimeout(300);
   const S=await p.evaluate(()=>({store:JSON.parse(localStorage.getItem('mbev.easy')), day:ctDay(Date.now()), cards:[...document.querySelectorAll('#ezList .ez-card')].map(c=>c.dataset.key), h:document.querySelector('#ezList .ez-h').innerText, wait:[...document.querySelectorAll('#ezList .ez-wait')].map(e=>e.innerText.replace(/\s+/g,' ').trim()), ovl:document.getElementById('v-etoday').classList.contains('ez-ovl'), toast:document.getElementById('ezToast').innerText, n:logged.length, keys:Object.keys(localStorage).filter(k=>/^mbev\.easy/.test(k))}));
   check('6a: Not for me hides the pick for today (mbev.easy {skipped:{key:day}, welcomed:1}), nothing is logged, and says so quietly', S.store.skipped[k0[0]]===S.day && S.store.welcomed===1 && Object.keys(S.store).sort().join()==='skipped,welcomed' && !S.cards.includes(k0[0]) && S.ovl===false && /Skipped for today\. Nothing else happens\./.test(S.toast) && S.keys.join()==='mbev.easy', S);
   check('6b: the sixth pick moves up: still "5 prices", and a quiet "You skipped 1. Bring it back" row', /^5 prices worth paying today$/.test(T(S.h)) && S.cards.length===5 && S.wait.some(w=>/^You skipped 1 today\. Bring it back$/.test(w)), {h:S.h, wait:S.wait});
   await p.click('#ezList [data-ez="unskip"]'); await p.waitForTimeout(250); const U=await p.evaluate(()=>({cards:[...document.querySelectorAll('#ezList .ez-card')].map(c=>c.dataset.key), store:JSON.parse(localStorage.getItem('mbev.easy'))}));
   check('6c: Bring it back puts it back in its place; the skip is gone from mbev.easy', U.cards.join('|')===k0.join('|') && Object.keys(U.store.skipped).length===0, U);
   check('6d: Not for me is as plain as I placed it (same size, weight, width and height)', bar[1][0]==='I placed it' && bar[2][0]==='Not for me' && Math.abs(bar[1][1]-bar[2][1])<1, bar);
   // a skip from yesterday does not hide anything today
   await p.evaluate(k=>{ localStorage.setItem('mbev.easy', JSON.stringify({skipped:{[k]:'2026-11-14'}, welcomed:1})); easyPaintToday(); }, k0[1]); await p.waitForTimeout(200); const Y=await p.evaluate(()=>document.querySelectorAll('#ezList .ez-card').length);
   check('6e: a skip from another day hides nothing', Y===5, Y);
   // skip does not write while Performance/Reports render: nothing in the app writes mbev.easy except the two buttons and the welcome
   const W=await p.evaluate(()=>{ const set=Storage.prototype.setItem, hits=[]; Storage.prototype.setItem=function(k,v){ if(k==='mbev.easy') hits.push(new Error().stack.split('\n')[2]); return set.apply(this,arguments); }; try{ renderPerf(); renderLog(); easyPaintToday(); }catch(e){} Storage.prototype.setItem=set; return hits.length; });
   check('6f: painting Today, the Bet log and Performance never writes mbev.easy', W===0, W); check('6g: no page errors', A.errors.length===0, A.errors); await A.ctx.close(); }

 // ---------- 7. a price that moved ----------
 { const A=await open(b,390,844), p=A.page;
   await p.evaluate(()=>{ const r=gN('Bam Adebayo'); r.offeredRaw='-260'; r.offeredProb=toProb('-260'); refresh(); }); await p.waitForTimeout(500);
   const Mv=await p.evaluate(()=>({moved:easyMovedList().map(m=>({price:m.oldPrice+'>'+m.newPrice, be:m.breakEven, most:m.most})), card:(document.querySelector('#ezList .ez-card.moved')||{innerText:''}).innerText.replace(/\s+/g,' ').trim(), h:document.querySelector('#ezList .ez-h').innerText, n:document.querySelectorAll('#ezList .ez-card:not(.moved)').length, order:[...document.querySelectorAll('#ezList .ez-card')].map(c=>c.classList.contains('moved')?'moved':'pick').join(',')}));
   check('7a: a dashed "Not worth it now" card shows the old price, the new price in dollars, the break-even against La Contadora\'s most, and "Skip it, or check back later."', /Not worth it now/.test(Mv.card) && Mv.card.includes('Price before -230') && Mv.card.includes('Price now -260') && Mv.card.includes('-260 means you bet $260 to win $100.') && Mv.card.includes('-230 means you bet $230 to win $100.') && /needs a 72\.2% chance to break even/.test(Mv.card) && /most La Contadora would pay is 71\.\d%/.test(Mv.card) && /Skip it, or check back later\./.test(Mv.card), Mv.card);
   check('7b: the heading counts only the picks (4) and the moved card sits as plain as a pick', /^4 prices worth paying today$/.test(T(Mv.h)) && Mv.n===4 && Mv.order==='pick,pick,pick,pick,moved', Mv);
   const mc=await p.evaluate(MEASURE,'#ezList .ez-card.moved'); check('7c: the moved card is not amber text: contrast 4.5 or more, tap targets and sizes', mc.minContrast>=4.5 && mc.tapSmall.length===0 && mc.under12.length===0, mc);
   await shot(p,'b3a-moved-light-390.png');
   const D=await p.evaluate(()=>({btn:document.querySelectorAll('#ezList .ez-card.moved [data-ez="dismiss"], #ezList .ez-card.moved button').length, words:/Skip it, or check back later\./.test(document.querySelector('#ezList .ez-card.moved').innerText)})); check('7d (step 6, Karens 9): a Not worth it card says Skip it in words and has no button of its own (skipping is not another decision)', D.btn===0 && D.words, D);
   check('7e: no page errors', A.errors.length===0, A.errors); await A.ctx.close(); }

 // ---------- 8. a quiet day, no board, an old board ----------
 { const A=await open(b,390,844), p=A.page;
   await p.evaluate(()=>{ document.getElementById('books').value='NoSuchBook'; refresh(); }); await p.waitForTimeout(500);
   const Q=await p.evaluate(()=>({t:document.getElementById('ezList').innerText.replace(/\s+/g,' ').trim(), cards:document.querySelectorAll('#ezList .ez-card').length, hon:!!document.querySelector('#ezList .ez-honest'), help:/1-800-GAMBLER/.test(document.getElementById('ezList').innerText)}));
   check('8a: a quiet day says "Nothing worth paying today. That is a normal day." calmly, with the honest box, the freshness line and the help line, and no cards', /Nothing worth paying today\. That is a normal day\./.test(Q.t) && /Prices checked \d+ minutes? ago\./.test(Q.t) && Q.cards===0 && Q.hon && Q.help && !FORBID.test(Q.t) && !GODONLY.test(Q.t), Q.t.slice(0,300));
   const qh=await rect(p,'#ezList .ez-honest'); check('8b: the honest box is in view on a quiet day', inView(qh), qh); await shot(p,'b3a-quiet-light-390.png');
   await p.evaluate(()=>{ document.getElementById('books').value=''; refresh(); lastRows.forEach(r=>{ r.loadedAt=new Date(Date.now()-13*3600e3).toISOString(); delete r.priceAt; }); easyPaintToday(); }); await p.waitForTimeout(400);
   const O=await p.evaluate(()=>({t:document.getElementById('ezList').innerText.replace(/\s+/g,' ').trim(), cards:document.querySelectorAll('#ezList .ez-card').length}));
   check('8c: an old board (newest price 13 hours old) says "The prices on this screen are not fresh", lists nothing, and in the dev app says to press Load in God mode', /The prices on this screen are not fresh/.test(O.t) && /Dev app: switch to God mode and press Load\./.test(O.t) && O.cards===0 && /13 hours ago/.test(O.t), O.t.slice(0,300));
   check('8d: no page errors', A.errors.length===0, A.errors); await A.ctx.close();
   const N=await open(b,390,844,{practice:{rows:()=>[]}}), q=N.page; const NB=await q.evaluate(()=>({t:document.getElementById('ezList').innerText.replace(/\s+/g,' ').trim(), cards:document.querySelectorAll('#ezList .ez-card').length, rows:lastRows.length, hon:!!document.querySelector('#ezList .ez-honest')}));
   check('8e: no board at all: the same calm "not fresh" words, the dev line, the honest box, nothing listed', NB.rows===0 && /The prices on this screen are not fresh/.test(NB.t) && /Dev app: switch to God mode and press Load\./.test(NB.t) && NB.cards===0 && NB.hon, NB.t.slice(0,300)); await shot(q,'b3a-noboard-light-390.png');
   const sh=await q.evaluate(()=>{ window.DEV_APP_BACKUP=1; return typeof DEV_APP; }); check('8f: no page errors (no board)', N.errors.length===0, N.errors); await N.ctx.close(); }

 // ---------- 9. the welcome, once ----------
 { const A=await open(b,390,844,{welcome:true}), p=A.page;
   const W=await p.evaluate(()=>({t:document.getElementById('ezList').innerText.replace(/\s+/g,' ').trim(), cards:document.querySelectorAll('#ezList .ez-card').length, store:localStorage.getItem('mbev.easy'), hon:!!document.querySelector('#ezList .ez-honest')}));
   check('9a: first open: the welcome (three lines, no "odds"), the honest box, no cards, nothing saved yet', /This app checks the price of a bet and shows you the few that cost less than they should\. It never places a bet for you\. Any single bet can lose\./.test(W.t) && /A price is what it costs to try to win \$1\./.test(W.t) && !/odds/i.test(W.t) && W.cards===0 && W.store===null && W.hon, W);
   const wm=await p.evaluate(MEASURE,'#v-etoday'); check('9b: the welcome: sizes, tap targets, contrast', wm.under12.length===0 && wm.tapSmall.length===0 && wm.minContrast>=4.5, wm); await shot(p,'b3a-welcome-light-390.png');
   await p.click('#ezList [data-ez="welcome"]'); await p.waitForTimeout(250); const G=await p.evaluate(()=>({store:JSON.parse(localStorage.getItem('mbev.easy')), cards:document.querySelectorAll('#ezList .ez-card').length}));
   check('9c: "Got it" sets mbev.easy welcomed and shows the picks', G.store.welcomed===1 && G.cards===5, G);
   await p.reload(); await p.waitForTimeout(1800); const R=await p.evaluate(()=>({cards:document.querySelectorAll('#ezList .ez-card').length, welcome:!!document.querySelector('#ezList .ez-welcome')}));
   check('9d: after a reload the welcome does not come back', R.cards===5 && !R.welcome, R); check('9e: no page errors', A.errors.length===0, A.errors); await A.ctx.close(); }

 // ---------- 10. layouts: 1000, 1280, 1960 (the pick page is the right half), light and dark; screenshots at 390 and 1280 ----------
 for(const [W,H,theme] of [[1000,800,null],[1280,900,null],[1960,1000,null],[1280,900,'dark'],[390,844,'dark']]){ const A=await open(b,W,H,{practice:{theme, rows:EXROWS}}), p=A.page; const tag=(theme||'light')+'-'+W;
   if(theme) await p.evaluate(t=>{ document.documentElement.setAttribute('data-theme',t); }, theme); await p.waitForTimeout(200);
   const wide=W>=760;
   const L=await p.evaluate(()=>{ const r=e=>{ const q=document.querySelector(e); if(!q) return null; const b=q.getBoundingClientRect(); return {l:b.left,r:b.right,t:b.top,b:b.bottom}; }; return {list:r('#ezList'), pane:r('#ezPick'), bar:r('#ezPick .ez-bar'), dock:r('#apiDock'), hon:r('#ezList .ez-honest'), honPane:r('#ezPick .ez-honest'), vh:innerHeight, vw:innerWidth, sw:document.documentElement.scrollWidth-innerWidth, paneShown:getComputedStyle(document.getElementById('ezPick')).display, cards:document.querySelectorAll('#ezList .ez-card').length}; });
   if(wide){ check('10: '+tag+': the pick page is the right half (to the right of the list), its pinned bar is above the dock, the honest box is in view in both, no sideways scroll', L.paneShown==='flex' && L.pane.l>=L.list.r && L.bar.b<=L.dock.t+0.5 && L.bar.t>0 && L.hon.b<=L.vh && L.honPane.b<=L.vh && L.sw<=0 && L.cards===5, L); }
   else check('10: '+tag+': no sideways scroll, five cards, the honest box in view', L.sw<=0 && L.cards===5 && L.hon.b<=L.vh, L);
   const M=await p.evaluate(MEASURE,'#v-etoday'); check('10: '+tag+': Today sizes, tap targets and contrast', M.under12.length===0 && M.smallBody.length===0 && M.tapSmall.length===0 && M.minContrast>=4.5 && M.overX<=0, M);
   if(wide){ await p.click('#ezPick [data-ez="seg"][data-seg="type"]'); await p.waitForTimeout(200); await p.evaluate(()=>window.scrollTo(0,300)); await p.waitForTimeout(300);
     const S=await p.evaluate(()=>{ const b=document.querySelector('#ezPick .ez-bar').getBoundingClientRect(), d=document.getElementById('apiDock').getBoundingClientRect(), pn=document.getElementById('ezPick').getBoundingClientRect(); return {bBottom:b.bottom, dockTop:d.top, paneTop:pn.top, paneBottom:pn.bottom, vh:innerHeight}; });
     check('10: '+tag+': scrolled down, the pane keeps its pinned bar above the dock and fills the height', S.bBottom<=S.dockTop+0.5 && S.paneTop<=12 && S.paneBottom<=S.dockTop+4 && S.paneBottom>S.dockTop-30, S); await p.evaluate(()=>window.scrollTo(0,0)); await p.waitForTimeout(200); }
   else { await p.click('#ezList [data-ez="open"]'); await p.waitForTimeout(250); await p.click('#ezPick [data-ez="seg"][data-seg="type"]'); await p.waitForTimeout(150); }
   const M2=await p.evaluate(MEASURE,'#ezPick'); check('10: '+tag+': pick page (Type this) sizes, tap targets and contrast', M2.under12.length===0 && M2.smallBody.length===0 && M2.tapSmall.length===0 && M2.minContrast>=4.5 && M2.overX<=0, M2);
   if(W===1280||W===390){ await p.click('#ezPick [data-ez="seg"][data-seg="what"]'); await p.waitForTimeout(150); await shot(p,'b3a-pick-'+tag+'.png'); if(wide) await p.evaluate(()=>window.scrollTo(0,0)); await shot(p,'b3a-today-'+tag+'.png'); }
   check('10: '+tag+': no page errors', A.errors.length===0 && A.consoleBad.length===0, {e:A.errors,c:A.consoleBad}); await A.ctx.close(); }

 // ---------- 11. the exchange form: What filled? (v5.24 step 4 replaced the God form here); a changed live price is said calmly, and the form is still used ----------
 { const A=await open(b,390,844,{practice:{rows:EXROWS}}), p=A.page; const k=await p.evaluate(()=>easyList().picks.find(x=>x.book==='Polymarket US').key);
   await p.click('#ezList .ez-card[data-key="'+k.replace(/"/g,'\\"')+'"] [data-ez="open"]'); await p.waitForTimeout(250); const n0=await p.evaluate(()=>logged.length);
   await p.click('#ezPlaced'); await p.waitForSelector('#ezHost .ez-fillf'); await p.waitForFunction(()=>/The price changed/.test((document.getElementById('ezFNote')||{}).innerText||''),null,{timeout:9000});
   const F=await p.evaluate(()=>({n:logged.length, note:(document.getElementById('ezFNote')||{}).innerText||'', form:!!document.querySelector('#ezHost .ez-fillf'), god:!!document.querySelector('#ezHost .editor'), btn:document.getElementById('ezPlaced').innerText, title:document.getElementById('ezPickTitle').innerText}));
   check('11a: when the live price is not the card\'s price, nothing is saved, the calm message shows, and What filled? opens inside the pick page (no God form)', F.n===n0 && /The price changed\. Check the price at the book, then tell us what filled\./.test(F.note) && F.form && !F.god && F.btn==='I placed it', F);
   await shot(p,'b3a-form-light-390.png');
   // a repaint while the form is open does not destroy it
   await p.evaluate(()=>{ easyPaintToday(); refresh(); }); await p.waitForTimeout(300); const keep=await p.evaluate(()=>!!document.querySelector('#ezHost .ez-fillf')); check('11b: a repaint while What filled? is open leaves the form alone', keep, keep);
   check('11c: no page errors', A.errors.length===0, A.errors); await A.ctx.close(); }

 // ---------- 12. God stays as it was ----------
 { const A=await open(b,1280,900,{easy:false}), p=A.page; const G=await p.evaluate(()=>({level:easyLevel(), view:(document.querySelector('.view.on')||{}).id, ez:getComputedStyle(document.getElementById('v-etoday')).display, cards:document.querySelectorAll('#placeCards .sc-card').length, easyKey:localStorage.getItem('mbev.easy'), keys:Object.keys(localStorage).filter(k=>/easy|viewAs/.test(k)), ezReady:!!window._ezReady, list:document.getElementById('ezList').innerHTML.length}));
   check('12a: God: Today is hidden, the Board is open, nothing about Easy is saved, the Easy list paints nothing', G.level==='god' && G.view==='v-board' && G.ez==='none' && G.cards>0 && G.easyKey===null && G.keys.length===0 && G.list===0, G);
   check('12b: God: no page errors', A.errors.length===0, A.errors); await A.ctx.close(); }

 await b.close();
 console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(fail?1:0);
})();
