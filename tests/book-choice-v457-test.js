// node tests/book-choice-v457-test.js — v4.57, the scope Claude Code and ChatGPT agreed and the owner approved ("BUILD", 11/10):
// Send the Sentinels compares against the book SHOWN NOW (the Pull book is only the "was" label); a fresh shown price keeps the 0.3-point margin;
// an exchange that could not be read gives way to the best fresh price that clears the floor; a stale sportsbook price (board loaded over 3 minutes ago, 90 s within 5 minutes
// of the start) gives way to a fresh exchange price that clears the floor; nothing fresh = no winner; a book-swap card expires like a best-book claim;
// a bet saves both books, their ages, their EV, the margin and the reason. Every expected number is worked here by hand, not with the page's functions.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,700)); };
const NOW=Date.parse('2026-11-10T19:00:00Z'), iso=ms=>new Date(ms).toISOString(), DAY='2026-11-10', KO=Date.parse('2026-11-11T01:15:00Z');
const T=(ha,abbr)=>({ha,id:abbr,abbr,name:abbr+' Team',loc:abbr,nick:'Team',logo:'',rec:'',color:'333333',alt:'ffffff'});
const GI=(i,ko)=>({state:'pre',startISO:iso(ko||KO+i*10*60e3),eventId:'40400'+i,timeCT:'',detail:'',teams:[T('away','A'+i),T('home','H'+i)]});
const am=p=>p>=0.5?String(Math.round(-100*p/(1-p))):'+'+Math.round(100*(1-p)/p);
const prop=(id,name,stat,price,g,book,loadedAgo,ko)=>({name,team:'A'+g,game:'A'+g+' @ H'+g,matchup:'A'+g+' @ H'+g,side:'O',sport:'NBA',market:'20.5 '+stat,kind:'prop',book,offeredRaw:am(price),offeredProb:price,fairProb:0.58,fairRaw:am(0.58),mktProb:0.56,stars:4,evModel:'projection',projValue:22,gameInfo:GI(g,ko),src:'api:NBA:props',apiKey:id,loadedAt:iso(NOW-loadedAgo)});
// La Contadora by hand: chance = min(0.58, 0.56 + 0.35 × 0.02) = 0.567; EV at price p with fee f = ((0.567/p − 1) − f) / (1 + f). Novig and Bovada: no fee. Kalshi: 0.07 × (1 − p).
const Q=Math.min(0.58, 0.56+0.35*0.02), ev=(p,f)=>((Q/p-1)-(f||0))/(1+(f||0)), kf=p=>0.07*(1-p);
async function open(b, rows, books, live){ const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:1280,height:900}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(([R,d,bk])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books:bk,bank:'500',cfgVer:3.03})); localStorage.setItem('mbev.cards','0');
    localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows:R})); }catch(e){} },[rows,DAY,books]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); const calls=[]; const S={ctx,p,errs,calls,live};
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/\/live\?/.test(u)){ calls.push(u); const bets=JSON.parse(decodeURIComponent(u.split('bets=')[1])); const R={}; bets.forEach(d=>{ const [kind,idx,bk]=d.id.split(':'); const pr=S.live&&S.live(kind,+idx,bk); if(pr) R[d.id]={ok:true, price:pr, bid:pr-0.02, at:Date.now()}; }); return r.fulfill({contentType:'application/json',body:JSON.stringify({results:R})}); }
    if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1300);
  return S; }
const look=S=>S.p.evaluate(()=>Object.fromEntries(lastRows.map(r=>[r.apiKey,{book:r.book, price:r.offeredProb, shop:r.shop?{bypass:r.shop.bypass||null, same:r.shop.same, from:r.shop.orig.book}:null, chk:r.shopChk?{inc:r.shopChk.inc.book, incNet:r.shopChk.inc.net, incReadable:r.shopChk.inc.readable, incAge:r.shopChk.inc.age, ch:r.shopChk.ch&&r.shopChk.ch.book, chNet:r.shopChk.ch&&r.shopChk.ch.net, margin:r.shopChk.margin, bypass:r.shopChk.bypass||null, none:r.shopChk.none||null}:null, swap:r.swap?{from:r.swap.orig.book, at:r.swap.at}:null, stale:!!shopStale(r), tag:shopTagHtml(r).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim()}])));
const near=(a,b)=>Math.abs(a-b)<1e-6;
(async()=>{
  const b=await chromium.launch();
  // ================= a sportsbook is the book shown =================
  const rows=[prop('a','Fresh Close','Points',0.52,1,'Bovada',60e3), prop('b','Fresh Far','Rebounds',0.52,2,'Bovada',60e3), prop('c','Stale Good','Assists',0.52,3,'Bovada',10*60e3),
    prop('d','Stale Poor','Steals',0.52,4,'Bovada',10*60e3), prop('e','Stale Alone','Blocks',0.52,5,'Bovada',10*60e3), prop('f','Near Kick','Threes',0.52,6,'Bovada',100e3,NOW+4*60e3), prop('g','Far Kick','Turnovers',0.52,7,'Bovada',100e3)];
  const P1={0:0.519, 1:0.515, 2:0.522, 3:0.56, 5:0.522, 6:0.522};
  let S=await open(b, rows, 'Novig, Kalshi, Bovada', (kind,idx,bk)=>kind==='shop' && bk==='novig' ? P1[idx] : null);
  const floor=await S.p.evaluate(()=>cfgRead().eMin);
  await S.p.evaluate(async()=>{ await shopExchanges(); }); let v=await look(S);
  const dA=ev(0.519)-ev(0.52), dB=ev(0.515)-ev(0.52);
  check('by hand: La Contadora’s chance is 56.7%; Bovada 52% gives EV '+(ev(0.52)*100).toFixed(2)+'%, Novig 51.9% is '+(dA*100).toFixed(2)+' points better (under 0.3), Novig 51.5% is '+(dB*100).toFixed(2)+' points better (over 0.3)', near(Q,0.567) && dA>0 && dA<0.003 && dB>0.003, {Q, dA, dB});
  check('Fresh Close: the Bovada price loaded 1 minute ago is fresh, so it keeps the 0.3-point margin: Novig, 0.21 points better, does not take it', v.a.book==='Bovada' && !v.a.shop && v.a.chk.margin==='applied' && v.a.chk.incReadable===true && !v.a.chk.bypass && !v.a.chk.none && near(v.a.chk.incNet,ev(0.52)) && near(v.a.chk.chNet,ev(0.519)), v.a);
  check('Fresh Far: Novig is 1.06 points better than a fresh Bovada price: it moves to Novig at 51.5%, the margin applied, no bypass', v.b.book==='Novig' && near(v.b.price,0.515) && v.b.shop && !v.b.shop.bypass && v.b.shop.from==='Bovada' && v.b.chk.margin==='applied', v.b);
  check('by hand: Novig 52.2% is WORSE than Bovada 52% (EV '+(ev(0.522)*100).toFixed(2)+'% against '+(ev(0.52)*100).toFixed(2)+'%) and clears the floor ('+(floor*100).toFixed(1)+'%); Novig 56% (EV '+(ev(0.56)*100).toFixed(2)+'%) does not', ev(0.522)<ev(0.52) && ev(0.522)>=floor && ev(0.56)<floor && floor>0, {floor});
  check('Stale Good: the Bovada price was loaded 10 minutes ago (stale, cannot be read again): the fresh Novig 52.2% replaces it with no 0.3 points, saved as sportsbook_stale_unrefreshable, and the card says "sportsbook price stale and not refreshable"', v.c.book==='Novig' && near(v.c.price,0.522) && v.c.shop && v.c.shop.bypass==='sportsbook_stale_unrefreshable' && v.c.chk.margin==='bypassed' && v.c.chk.incReadable===false && v.c.chk.incAge>=600e3 && v.c.chk.incAge<605e3 && /was Bovada .* · sportsbook price stale and not refreshable/.test(v.c.tag), v.c);
  check('Stale Poor: the only fresh price (Novig 56%) does not clear the floor: nothing moves, and it says "No current best book confirmed · sportsbook price is stale · check the book manually"', v.d.book==='Bovada' && near(v.d.price,0.52) && !v.d.shop && v.d.chk.none==='sportsbook_stale' && /No current best book confirmed · sportsbook price is stale · check the book manually/.test(v.d.tag), v.d);
  check('Stale Alone: no exchange answered: no winner, the same words', v.e.book==='Bovada' && !v.e.shop && v.e.chk.none==='sportsbook_stale' && /No current best book confirmed · sportsbook price is stale · check the book manually/.test(v.e.tag), v.e);
  check('a price loaded 100 seconds ago: stale when the game starts in 4 minutes (the limit is 90 seconds: Novig, although worse, takes it), fresh when it starts hours later (Bovada stays)', v.f.book==='Novig' && v.f.shop.bypass==='sportsbook_stale_unrefreshable' && v.g.book==='Bovada' && v.g.chk.margin==='applied' && !v.g.shop, {f:v.f, g:v.g});
  const saved=await S.p.evaluate(()=>{ const r=lastRows.find(x=>x.apiKey==='c'); addToLog(Object.assign({},r,{stake:1})); const d=lastRows.find(x=>x.apiKey==='d'); addToLog(Object.assign({},d,{stake:1})); return [logged[logged.length-2].snap.shop, logged[logged.length-1].snap.shop]; });
  const s0=saved[0]||{}, k0=s0.chk||{}, s1=saved[1]||{};
  check('a bet taken from Stale Good saves: the Pull book (Bovada), the shown book before (Bovada, 52%, EV '+(ev(0.52)*100).toFixed(2)+'%, 10 minutes old, not readable), the new one (Novig, 52.2%, EV '+(ev(0.522)*100).toFixed(2)+'%, read now), "bypassed" and the reason', s0.from==='Bovada' && s0.bypass==='sportsbook_stale_unrefreshable' && k0.margin==='bypassed' && k0.incumbent && k0.incumbent.book==='Bovada' && k0.incumbent.p===0.52 && k0.incumbent.readable===false && k0.incumbent.age>=600e3 && k0.incumbent.age<605e3 && Math.abs(k0.incumbent.actNet-ev(0.52))<1e-4 && k0.challenger && k0.challenger.book==='Novig' && k0.challenger.p===0.522 && k0.challenger.readable===true && k0.challenger.age===0 && Math.abs(k0.challenger.actNet-ev(0.522))<1e-4, s0);
  check('a bet taken from Stale Poor saves that no best book was confirmed (sportsbook_stale) and the Novig price that fell short', s1.chk && s1.chk.none==='sportsbook_stale' && s1.chk.challenger && s1.chk.challenger.book==='Novig' && s1.from==='Bovada' && !s1.bypass, s1);
  // the board is refreshed: the same price is fresh again and the margin is back
  await S.p.evaluate(()=>{ const now=new Date().toISOString(); lastRows.forEach(r=>{ if(r.shop){ r.book=r.shop.orig.book; r.offeredProb=r.shop.orig.offeredProb; r.offeredRaw=r.shop.orig.offeredRaw; delete r.shop; } r.loadedAt=now; }); });
  await S.p.evaluate(async()=>{ await shopExchanges(); }); v=await look(S);
  check('after the board is loaded again the Bovada price is fresh: Stale Good stays at Bovada (Novig is worse) and the margin applies again', v.c.book==='Bovada' && !v.c.shop && v.c.chk.margin==='applied' && !v.c.chk.none && !/stale/.test(v.c.tag), v.c);
  check('no page errors (sportsbook)', !S.errs.length, S.errs); await S.ctx.close();
  // ================= the book shown is the one to beat, not the Pull book =================
  const kN=ev(0.515), kK=ev(0.498,kf(0.498));
  let step=1; S=await open(b, [prop('k','Kal Row','Points',0.52,1,'Kalshi',60e3)], 'Novig, Kalshi, Bovada', (kind,idx,bk)=>{ if(kind!=='shop') return null; if(step===1) return bk==='novig'?0.515:null; if(step===2) return bk==='novig'?0.515:bk==='kalshi'?0.498:null; if(step===3) return bk==='kalshi'?0.498:null; if(step===5) return bk==='novig'?0.56:null; return null; });
  const floor2=await S.p.evaluate(()=>cfgRead().eMin);
  await S.p.evaluate(async()=>{ await shopExchanges(); }); v=await look(S);
  check('scan 1: Kalshi (the Pull book) cannot be read, Novig 51.5% can: the bet moves to Novig (exchange_unreadable)', v.k.book==='Novig' && near(v.k.price,0.515) && v.k.shop.bypass==='exchange_unreadable' && v.k.shop.from==='Kalshi', v.k);
  step=2; await S.p.evaluate(async()=>{ await shopExchanges(); }); v=await look(S);
  check('by hand: Novig 51.5% gives EV '+(kN*100).toFixed(2)+'%; Kalshi 49.8% after its fee ('+(kf(0.498)*100).toFixed(2)+'%) gives '+(kK*100).toFixed(2)+'%: '+((kN-kK)*100).toFixed(2)+' points apart, inside 0.3 either way', Math.abs(kN-kK)<0.003 && kN>kK, {kN, kK});
  check('scan 2: both read. Novig is the book shown, so it is the one to beat and Kalshi is not 0.3 points better: it stays at Novig (measured against the Pull book, Kalshi, it went back)', v.k.book==='Novig' && near(v.k.price,0.515) && v.k.chk.inc==='Novig' && v.k.chk.ch==='Kalshi' && v.k.chk.margin==='applied' && near(v.k.chk.incNet,kN) && near(v.k.chk.chNet,kK) && v.k.shop.from==='Kalshi' && /was Kalshi/.test(v.k.tag), v.k);
  step=3; await S.p.evaluate(async()=>{ await shopExchanges(); }); v=await look(S);
  check('scan 3: Novig (shown) cannot be read, Kalshi can: the fresh Kalshi 49.8% takes its place although it is 0.11 points lower (it clears the floor); back at the Pull book, it shows as its live price', v.k.book==='Kalshi' && near(v.k.price,0.498) && v.k.shop && v.k.shop.same===true && v.k.chk.bypass==='exchange_unreadable' && v.k.chk.margin==='bypassed' && v.k.chk.inc==='Novig' && v.k.chk.incReadable===false, v.k);
  step=5; await S.p.evaluate(async()=>{ await shopExchanges(); }); v=await look(S);
  const kLow=ev(0.56);
  check('by hand: Novig 56% gives EV '+(kLow*100).toFixed(2)+'%, under the floor', kLow<floor2 && kLow>0, {kLow, floor2});
  check('scan 3b: Kalshi (shown) cannot be read and the only fresh price, Novig 56%, does not clear the floor: nothing moves, "No current best book confirmed · shown exchange unavailable · fresh prices do not clear your floor", saved as exchange_unreadable_no_actionable_quote', v.k.book==='Kalshi' && near(v.k.price,0.498) && v.k.chk.none==='exchange_unreadable_no_actionable_quote' && v.k.chk.bypass==='exchange_unreadable_no_actionable_quote' && v.k.chk.ch==='Novig' && near(v.k.chk.chNet,kLow) && /No current best book confirmed · shown exchange unavailable · fresh prices do not clear your floor/.test(v.k.tag), v.k);
  const sk=await S.p.evaluate(()=>{ const r=lastRows.find(x=>x.apiKey==='k'); return shopSnap(r); });
  check('what a bet would save then: the reason, no winner, and the Novig price that fell short', sk && sk.bypass==='exchange_unreadable_no_actionable_quote' && sk.chk.none==='exchange_unreadable_no_actionable_quote' && sk.chk.challenger.book==='Novig' && sk.chk.incumbent.readable===false, sk);
  step=4; await S.p.evaluate(async()=>{ await shopExchanges(); }); v=await look(S);
  check('scan 4: nothing can be read: no winner, nothing moves, "no price could be read · refresh prices"', v.k.book==='Kalshi' && near(v.k.price,0.498) && v.k.chk.none==='nothing_readable' && /no price could be read · refresh prices/.test(v.k.tag), v.k);
  check('no page errors (shown book)', !S.errs.length, S.errs); await S.ctx.close();
  // ================= a book-swap card (a book you do not bet) =================
  let alt={novig:0.515}; S=await open(b, [prop('s','Swap Row','Points',0.52,1,'DraftKings',60e3)], 'Novig, Kalshi, Bovada', (kind,idx,bk)=>alt[bk]||null);
  await S.p.waitForTimeout(600); v=await look(S);
  check('a DraftKings row (not your book) with a live Novig price becomes a swap card "for you: Novig (was DraftKings …)", stamped with the time the price was read', v.s.book==='Novig' && near(v.s.price,0.515) && v.s.swap && v.s.swap.from==='DraftKings' && Math.abs(v.s.swap.at-NOW)<5000 && /for you: Novig \(was DraftKings/.test(v.s.tag) && !v.s.stale, v.s);
  const n0=S.calls.length; await S.p.clock.fastForward(3*60e3+20e3); await S.p.waitForTimeout(400); v=await look(S);
  check('3 minutes 20 seconds later the swap has run out like any best-book claim: "⏱ 3m · best book no longer confirmed · Send the Sentinels", and no price was read again by itself', v.s.stale && /⏱ 3m · best book no longer confirmed · Send the Sentinels/.test(v.s.tag) && S.calls.length===n0, {tag:v.s.tag, calls:S.calls.length-n0});
  alt={novig:0.515, kalshi:0.498}; await S.p.evaluate(async()=>{ await shopExchanges(); }); await S.p.waitForTimeout(300); v=await look(S);
  check('Send the Sentinels reads the prices again: the swap is fresh, and Novig (the book shown) keeps its place because Kalshi is not 0.3 points better', !v.s.stale && v.s.book==='Novig' && near(v.s.price,0.515) && v.s.swap.at>=NOW+200e3 && !/no longer confirmed/.test(v.s.tag), v.s);
  alt={kalshi:0.47}; await S.p.evaluate(async()=>{ await shopExchanges(); }); await S.p.waitForTimeout(300); v=await look(S);
  check('next scan Novig cannot be read and Kalshi 47% can: the swap moves to Kalshi at the fresh price', v.s.book==='Kalshi' && near(v.s.price,0.47) && v.s.swap.from==='DraftKings' && !v.s.stale, v.s);
  await S.p.clock.fastForward(3*60e3+20e3); await S.p.waitForTimeout(400);
  const sv=await S.p.evaluate(()=>{ const r=lastRows.find(x=>x.apiKey==='s'); addToLog(Object.assign({},r,{stake:1})); return logged[logged.length-1].snap.shop; });
  check('a bet taken from the swap after it ran out again saves it: from DraftKings, a swap, stale, over 200 seconds old', sv && sv.from==='DraftKings' && sv.swap===true && sv.stale===true && sv.age>=200e3, sv);
  check('no page errors (swap)', !S.errs.length, S.errs); await S.ctx.close();
  await b.close();
  console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(fail?1:0);
})();
