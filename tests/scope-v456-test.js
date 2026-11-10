// node tests/scope-v456-test.js — v4.56, the scope Claude Code and ChatGPT agreed and the owner approved ("BUILD", 11/10):
// pick'em entries with unchecked lines are provisional and ask once before logging; a fixed settlement note; model-only picks never in a recommended
// entry (allowed by hand, with a warning); a best-book claim expires after 3 minutes (90 s within 5 minutes of kickoff) with no new price reads;
// the 0.3-point margin is skipped when the current exchange could not be read; nothing readable = no winner; open orders measured, not counted.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,700)); };
const NOW=Date.parse('2026-11-10T19:00:00Z'), iso=ms=>new Date(ms).toISOString(), DAY='2026-11-10', KO=Date.parse('2026-11-11T01:15:00Z');
const T=(ha,abbr)=>({ha,id:abbr,abbr,name:abbr+' Team',loc:abbr,nick:'Team',logo:'',rec:'',color:'333333',alt:'ffffff'});
const GI=(i,ko)=>({state:'pre',startISO:iso(ko||KO+i*10*60e3),eventId:'40400'+i,timeCT:'',detail:'',teams:[T('away','A'+i),T('home','H'+i)]});
const am=p=>p>=0.5?String(Math.round(-100*p/(1-p))):'+'+Math.round(100*(1-p)/p);
const prop=(id,name,stat,price,fair,mkt,g,book,ko)=>({name,team:'A'+g,game:'A'+g+' @ H'+g,matchup:'A'+g+' @ H'+g,side:'O',sport:'NBA',market:'20.5 '+stat,kind:'prop',book:book||'Novig',offeredRaw:am(price),offeredProb:price,fairProb:fair,fairRaw:am(fair),mktProb:mkt,stars:4,evModel:'projection',projValue:22,gameInfo:GI(g,ko),src:'api:NBA:props',apiKey:id,loadedAt:iso(NOW-60e3)});
const PK=[1,2,3,4,5,6].map(i=>prop('m'+i,'Market Pick '+i,'Points',0.55,0.64+i*0.002,0.62,i)).concat([prop('mo7','Model Only 7','Points',0.55,0.72,null,7), prop('mo8','Model Only 8','Points',0.55,0.71,null,8)]);
async function open(b, rows, extra){ const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:1280,height:900}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(([R,d])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig, Kalshi, PrizePicks',bank:'500',cfgVer:3.03})); localStorage.setItem('mbev.cards','0');
    localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows:R})); }catch(e){} },[rows,DAY]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); const calls=[];
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/\/live\?/.test(u)){ calls.push(u); const bets=JSON.parse(decodeURIComponent(u.split('bets=')[1])); const R={}; bets.forEach(d=>{ const q=extra&&extra.live&&extra.live(d); if(q) R[d.id]=q; }); return r.fulfill({contentType:'application/json',body:JSON.stringify({results:R})}); }
    if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1300);
  return {ctx,p,errs,calls}; }
(async()=>{
  const b=await chromium.launch();
  // ================= pick'em =================
  let S=await open(b, PK);
  const pk=await S.p.evaluate(async()=>{ pkState.app='PrizePicks'; pkState.play='power'; pkState.minP=0.57; pkState.oneGame=true; document.querySelector('.tab[data-view="v-parlay"]').click(); await new Promise(z=>setTimeout(z,300)); renderParlays(); await new Promise(z=>setTimeout(z,200));
    const cards=[...document.querySelectorAll('#pkCards .pk-card:not(.empty)')].map(c=>({id:c.dataset.id, text:c.innerText.replace(/\s+/g,' '), best:!!c.querySelector('.pk-best'), prov:!!c.querySelector('.pk-best.prov')}));
    const slips=[...document.querySelectorAll('#pkSlips .pk-card')].map(c=>c.innerText.replace(/\s+/g,' '));
    const legs=pkLegs(window._pkRows), pool=[...document.querySelectorAll('#pkPool tr')].map(t=>t.innerText.replace(/\s+/g,' '));
    return {cards, slips, sent:pkSentLegs().map(l=>l.name), legs:legs.map(l=>[l.name,l.dfs,l.mo,+l.p.toFixed(4)]), pool}; });
  const inCards=pk.cards.map(c=>c.text).join(' | ');
  check('the two model-only picks (72% and 71%, the highest chances) are in no recommended entry, ready-made slip or Sentinels’ pick list', !/Model Only/.test(inCards) && !pk.slips.some(t=>/Model Only/.test(t)) && !pk.sent.some(n=>/Model Only/.test(n)) && pk.legs.filter(l=>l[2]).length===2, {cards:pk.cards.map(c=>c.id), sent:pk.sent});
  check('in the pick list they stay, marked "MODEL ONLY · no market check · excluded from recommended entries"', pk.pool.filter(t=>/Model Only/.test(t)).every(t=>/MODEL ONLY · no market check · excluded from recommended entries/.test(t)) && pk.pool.filter(t=>/Model Only/.test(t)).length===2, pk.pool.filter(t=>/Model Only/.test(t)));
  const best=pk.cards.find(c=>c.best);
  check('every pick here is at Novig, so no line is checked in PrizePicks: the best entry says "PROVISIONAL BEST · check that the app has this exact line", and its EV and stake say "if every line matches"', best && best.prov && /PROVISIONAL BEST · check that the app has this exact line/.test(best.text) && /expected return if every line matches/.test(best.text) && /Stake \$ \(if every line matches\)/.test(best.text) && !/Best for your bankroll/.test(best.text), best&&best.text.slice(0,300));
  check('every pick’em entry carries the settlement note: ties, DNPs and cancelled players follow the app’s rules; the EV assumes plain wins and losses', pk.cards.every(c=>/Ties, DNPs and cancelled players follow this app’s rules, not sportsbook push rules\. The EV shown assumes every pick settles as a plain win or loss; a reboot or a smaller entry can change the payout\./.test(c.text)), pk.cards.length);
  const lg=await S.p.evaluate(async(id)=>{ const z=ms=>new Promise(r=>setTimeout(r,ms)), n0=logged.length, btn=()=>document.querySelector('#pkCards .pk-card[data-id="'+id+'"] .pk-log');
    btn().click(); await z(150); const a={n:logged.length-n0, txt:btn().textContent, msg:document.getElementById('pkMsg').textContent};
    btn().click(); await z(250); const x=logged[logged.length-1]; return {a, n:logged.length-n0, pk:x&&x.parlay&&x.parlay.pk}; }, best.id);
  check('Log this entry: the first press logs nothing and asks "I checked: every line in the app matches"; the second logs it', lg.a.n===0 && lg.a.txt==='I checked: every line in the app matches' && /Open the app, check each one/.test(lg.a.msg) && lg.n===1, lg.a);
  check('the entry saves that you checked and when, how many lines were unchecked, the app, its payout table and the settlement assumption', lg.pk && lg.pk.lineVerifiedByUser===true && /^2026-11-10T19:/.test(lg.pk.verifiedAt) && lg.pk.unchecked>=2 && lg.pk.app==='PrizePicks' && Array.isArray(lg.pk.pays) && lg.pk.settle==='plain-win-loss-v1' && lg.pk.policy==='actProb-v2' && !lg.pk.modelOnly, lg.pk);
  const man=await S.p.evaluate(async()=>{ const z=ms=>new Promise(r=>setTimeout(r,ms)); const L=pkLegs(window._pkRows); pkState.mine=[L.find(l=>l.name==='Model Only 7').key, L.find(l=>!l.mo).key];   /* a market pick not in the entry just logged (logged picks leave the pool) */ renderParlays(); await z(150);
    const c=document.querySelector('#pkMine .pk-card'); return c?{text:c.innerText.replace(/\s+/g,' '), best:!!c.querySelector('.pk-best')}:null; });
  check('a model-only pick added by hand: the entry is priced, warns "Model Only 7: model only, no market check. Not a recommended entry." and is never called best', man && /Model Only 7: model only, no market check\. Not a recommended entry\./.test(man.text) && !man.best, man&&man.text.slice(0,220));
  check('no page errors (pick’em)', !S.errs.length, S.errs); await S.ctx.close();
  // ================= book choice =================
  // Kalshi row (its own exchange) and Novig quotes. Case A: Kalshi unreadable, Novig readable at a price only 0.1 point better → switches (no 0.3 needed).
  const K=prop('k1','Kal Row','Rebounds',0.52,0.58,0.56,9,'Kalshi'), N=prop('n1','Nov Row','Assists',0.52,0.58,0.56,10,'Novig'), Z=prop('z1','Nobody Row','Steals',0.52,0.58,0.56,11,'Kalshi');
  const live=d=>{ if(/^shop:/.test(d.id)){ const [,idx,bk]=d.id.split(':');
      if(idx==='0' && bk==='novig') return {ok:true, price:0.515, bid:0.50, at:Date.now()};   // Kal Row: Kalshi gives nothing, Novig a hair better
      if(idx==='1' && bk==='novig') return {ok:true, price:0.52, bid:0.50, at:Date.now()};    // Nov Row: its own price
      if(idx==='1' && bk==='kalshi') return {ok:true, price:0.518, bid:0.50, at:Date.now()};  // Kalshi 0.2 cents cheaper, but its fee makes it worse
    } return null; };
  S=await open(b, [K,N,Z], {live});
  await S.p.evaluate(async()=>{ await shopExchanges(); });
  const sh=await S.p.evaluate(()=>Object.fromEntries(lastRows.map(r=>[r.apiKey,{book:r.book, price:r.offeredProb, shop:r.shop?{bypass:r.shop.bypass||null, same:r.shop.same, from:r.shop.orig.book}:null, none:!!r.shopNone, tag:shopTagHtml(r).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim()}])));
  const her=(q,p,f)=>((q/p-1)-f)/(1+f), q=Math.min(0.58,0.56+0.35*0.02);
  check('Kalshi could not be read for Kal Row, Novig could: it moves to Novig at 51.5% although that is only '+((her(q,0.515,0)-her(q,0.52,0.07*0.48))*100).toFixed(2)+' points better than the Pull price, and it saves why (exchange_unreadable)', sh.k1.book==='Novig' && Math.abs(sh.k1.price-0.515)<1e-9 && sh.k1.shop && sh.k1.shop.bypass==='exchange_unreadable', sh.k1);
  check('Nov Row: both read in the same scan; Kalshi’s cheaper 51.8% loses after its fee, so it stays at Novig with no bypass', sh.n1.book==='Novig' && !(sh.n1.shop && sh.n1.shop.bypass), sh.n1);
  check('Nobody Row: no exchange answered for it: no winner, it says "no price could be read · refresh prices"', sh.z1.book==='Kalshi' && sh.z1.none && /no price could be read · refresh prices/.test(sh.z1.tag), sh.z1);
  const nCalls=S.calls.length;
  await S.p.clock.fastForward(3*60e3+20e3); await S.p.waitForTimeout(400);
  const st=await S.p.evaluate(()=>{ const r=lastRows.find(x=>x.apiKey==='k1'); return {tag:shopTagHtml(r).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim(), stale:!!shopStale(r)}; });
  check('3 minutes 20 seconds later the claim has run out: "Price 3m old · best book no longer confirmed · Send the Sentinels", and no price was read again by itself', st.stale && /Price 3m old · best book no longer confirmed · Send the Sentinels/.test(st.tag) && S.calls.length===nCalls, {st, calls:S.calls.length-nCalls});
  const kick=await S.p.evaluate(()=>{ const now=Date.now(), mk=(koIn,age)=>({shop:{same:false, at:new Date(now-age).toISOString(), orig:{book:'Kalshi'}}, gameInfo:{startISO:new Date(now+koIn).toISOString()}});
    return {far60:!!shopStale(mk(60*60e3,100e3)), near100:!!shopStale(mk(4*60e3,100e3)), near80:!!shopStale(mk(4*60e3,80e3)), same:!!shopStale({shop:{same:true, at:new Date(now-600e3).toISOString()}})}; });
  check('within 5 minutes of kickoff the claim lasts 90 seconds (100 s old: stale; 80 s: not); an hour before, 100 s is still fine; a same-book live price makes no best-book claim', !kick.far60 && kick.near100 && !kick.near80 && !kick.same, kick);
  const saved=await S.p.evaluate(()=>{ const r=lastRows.find(x=>x.apiKey==='k1'); addToLog(Object.assign({},r,{stake:1})); return logged[logged.length-1].snap.shop; });
  check('a bet taken from it saves where the best book came from, its age, that it was stale, and why the 0.3 points were skipped', saved && saved.from==='Kalshi' && saved.stale===true && saved.age>=200e3 && saved.bypass==='exchange_unreadable', saved);
  check('no page errors (books)', !S.errs.length, S.errs); await S.ctx.close();
  // ================= open orders: measured only =================
  S=await open(b, [prop('mo1','Model Only','Points',0.52,0.58,null,12,'Kalshi'), prop('mk1','With Market','Points',0.52,0.58,0.56,13,'Kalshi')]);
  const od=await S.p.evaluate(()=>{ const a=lastRows.find(r=>r.apiKey==='mo1'), c=lastRows.find(r=>r.apiKey==='mk1'), o1={book:'kalshi',price:0.5,qty:2}, o2={book:'kalshi',price:0.5,qty:3}, o3={book:'kalshi',price:0.4,qty:1};
    window.myOrders={orders:[o1,o2,o3]}; a.waitOrder=o1; c.waitOrder=o2; const d=orderDiag(); crPaint(); const card=[...document.querySelectorAll('#crGrid .cr-card')].find(x=>/Open orders/.test(x.innerText)); return {d, card:card?card.innerText.replace(/\s+/g,' '):''}; });
  check('open orders are measured from what is already read: 3 open, 2 matched to a board row, 1 of them model-only, 1 unmatched; the card says they are not counted yet', od.d.open===3 && od.d.matched===2 && od.d.modelOnly===1 && od.d.unmatched===1 && /3 open/.test(od.card) && /2 matched to a board row, of them 1 model-only · 1 unmatched/.test(od.card) && /not counted against the model-only limit yet/.test(od.card), od);
  check('no page errors (orders)', !S.errs.length, S.errs); await S.ctx.close(); await b.close();
  console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail?1:0);
})();
