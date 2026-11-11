// node tests/book-choice-v461-test.js — v4.61, the fixes from the recheck of v4.57 (owner: "I had already said build"):
// a book-swap card follows the same rule as any card when its book cannot be read; a card is not moved to a Kalshi price that fails the floor after
// Kalshi's fee rounding; a cached board answer is not a fresh price; the last press's result wins over the age label; "live" only while it was read;
// the saved age of an unread price; clearing Books I bet undoes swaps; a failed request leaves the unasked bets alone; true tooltips; a true count.
// Every expected number is worked here by hand, not with the page's functions.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,700)); };
const NOW=Date.parse('2026-11-11T19:00:00Z'), iso=ms=>new Date(ms).toISOString(), DAY='2026-11-11', KO=Date.parse('2026-11-12T01:15:00Z');
const T=(ha,abbr)=>({ha,id:abbr,abbr,name:abbr+' Team',loc:abbr,nick:'Team',logo:'',rec:'',color:'333333',alt:'ffffff'});
const GI=g=>({state:'pre',startISO:iso(KO+g*10*60e3),eventId:'80800'+g,timeCT:'',detail:'',teams:[T('away','A'+g),T('home','H'+g)]});
const am=p=>p>=0.5?String(Math.round(-100*p/(1-p))):'+'+Math.round(100*(1-p)/p);
const prop=(id,name,stat,price,g,book,loadedAgo)=>({name,team:'A'+g,game:'A'+g+' @ H'+g,matchup:'A'+g+' @ H'+g,side:'O',sport:'NBA',market:'20.5 '+stat,kind:'prop',book,offeredRaw:am(price),offeredProb:price,fairProb:0.58,fairRaw:am(0.58),mktProb:0.56,stars:4,evModel:'projection',projValue:22,gameInfo:GI(g),src:'api:NBA:props',apiKey:id,loadedAt:iso(NOW-loadedAgo)});
// La Contadora by hand: chance = min(0.58, 0.56 + 0.35 × 0.02) = 0.567. EV at price p with fee f = ((0.567/p − 1) − f)/(1 + f).
// Fees (Settings defaults): Novig 0 before the game; Kalshi 7% × (1 − p); Polymarket US 6.95% × (1 − p).
const Q=0.567, ev=(p,f)=>((Q/p-1)-(f||0))/(1+(f||0)), kf=p=>0.07*(1-p), pf=p=>0.0695*(1-p);
async function open(b, rows, books, live, extra){ const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:1280,height:900}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(([R,d,bk])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books:bk,bank:'500',cfgVer:3.03})); localStorage.setItem('mbev.cards','0');
    localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows:R})); }catch(e){} },[rows,DAY,books]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); const S={ctx,p,errs,live,calls:0};
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/\/live\?/.test(u)){ S.calls++; const bets=JSON.parse(decodeURIComponent(u.split('bets=')[1])); if(S.fail && S.fail(bets)) return r.fulfill({status:500,contentType:'application/json',body:'{"error":"boom"}'});
      const R={}; bets.forEach(d=>{ const [kind,idx,bk]=d.id.split(':'); const pr=S.live&&S.live(kind,+idx,bk); if(pr) R[d.id]={ok:true, price:pr, bid:pr-0.02, at:Date.now()}; }); return r.fulfill({contentType:'application/json',body:JSON.stringify({results:R})}); }
    if(/\/props\?/.test(u) && extra && extra.props) return r.fulfill({contentType:'application/json',body:JSON.stringify(extra.props())});
    if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1300); return S; }
const press=async S=>{ await S.p.evaluate(async()=>{ await shopExchanges(); }); await S.p.waitForTimeout(250); };
const look=(S,key)=>S.p.evaluate(k=>{ const r=lastRows.find(x=>x.apiKey===k); return {book:r.book, price:r.offeredProb, pass:!!r.pass, stake:r.stake, flags:(r.flags||[]).map(f=>f[1]), shop:r.shop?{bypass:r.shop.bypass||null, same:!!r.shop.same, from:r.shop.from||null, orig:r.shop.orig.book}:null,
  chk:r.shopChk?{inc:r.shopChk.inc&&r.shopChk.inc.book, incAge:r.shopChk.inc&&r.shopChk.inc.age, incReadable:r.shopChk.inc&&r.shopChk.inc.readable, bypass:r.shopChk.bypass||null, none:r.shopChk.none||null, skip:r.shopChk.skip||null, margin:r.shopChk.margin}:null,
  swap:r.swap?{from:r.swap.orig.book, at:r.swap.at, bypass:r.swap.bypass||null}:null, swapNone:r.swapNone||null, stale:!!shopStale(r),
  tag:shopTagHtml(r).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim(), titles:[...shopTagHtml(r).matchAll(/title="([^"]*)"/g)].map(m=>m[1]), msg:(document.getElementById('shopMsg')||{}).textContent||''}; }, key);
const near=(a,b)=>Math.abs(a-b)<1e-6;
(async()=>{
  const b=await chromium.launch();
  let S, v;
  // ================= 1, 9, 12: a book-swap card =================
  { let alt={novig:0.515};
    S=await open(b, [prop('s','Swap Row','Points',0.52,1,'DraftKings',60e3)], 'Novig, Kalshi, Polymarket, Bovada', (k,i,bk)=>alt[bk]||null);
    const floor=await S.p.evaluate(()=>cfgRead().eMin), fees=await S.p.evaluate(()=>cfgRead().fees);
    check('the fees used by hand are the Settings defaults (Kalshi 7, Polymarket US 6.95, Novig 0) and the floor is '+(floor*100).toFixed(1)+'%', fees.kalshi===7 && fees.poly===6.95 && !fees.novig && floor>0, {fees, floor});
    await S.p.waitForTimeout(600); v=await look(S,'s');
    check('a DraftKings row (not your book) shows "for you: Novig" at 51.5% (EV '+(ev(0.515)*100).toFixed(2)+'%)', v.book==='Novig' && near(v.price,0.515) && v.swap && v.swap.from==='DraftKings', v);
    alt={kalshi:0.56};
    check('by hand: Kalshi 56% after its fee is EV '+(ev(0.56,kf(0.56))*100).toFixed(2)+'%, under the floor', ev(0.56,kf(0.56))<floor, null);
    await press(S); v=await look(S,'s');
    check('press: Novig cannot be read and the only fresh price (Kalshi 56%) is under the floor: the card stays at Novig 51.5%, "No current best book confirmed · shown exchange unavailable · fresh prices do not clear your floor" (v4.57 moved it to Kalshi and jailed it)', v.book==='Novig' && near(v.price,0.515) && v.swapNone==='exchange_unreadable_no_actionable_quote' && /No current best book confirmed · shown exchange unavailable · fresh prices do not clear your floor/.test(v.tag) && !/Send the Sentinels/.test(v.tag), v);
    alt={}; await press(S); await S.p.clock.fastForward(4*60e3); await S.p.waitForTimeout(400); v=await look(S,'s');
    check('press with nothing readable, 4 minutes later: still Novig 51.5%, "no price could be read · refresh prices", and not "Send the Sentinels" (the press was just made)', v.book==='Novig' && near(v.price,0.515) && v.swapNone==='nothing_readable' && /no price could be read · refresh prices/.test(v.tag) && !/Send the Sentinels/.test(v.tag), v);
    alt={poly:0.53};
    check('by hand: Polymarket US 53% after its fee is EV '+(ev(0.53,pf(0.53))*100).toFixed(2)+'%, over the floor', ev(0.53,pf(0.53))>=floor, null);
    await press(S); v=await look(S,'s');
    check('press: Novig still cannot be read, Polymarket US 53% clears the floor: the card moves there, with no 0.3 points, saved as exchange_unreadable', v.book==='Polymarket US' && near(v.price,0.53) && v.swap.bypass==='exchange_unreadable' && v.swap.from==='DraftKings' && !v.swapNone, v);
    const sv=await S.p.evaluate(()=>shopSnap(lastRows.find(x=>x.apiKey==='s')));   /* what addToLog saves (not logged here: a logged bet would mark the card already bet) */
    check('a bet taken from it saves the reason (exchange_unreadable) and that it was a swap from DraftKings', sv && sv.bypass==='exchange_unreadable' && sv.swap===true && sv.from==='DraftKings', sv);
    const pn=ev(0.53,pf(0.53)), nIn=Q/(1+pn+0.0015), nOut=Q/(1+pn+0.006);
    check('by hand: next to Polymarket US 53% (EV '+(pn*100).toFixed(3)+'%), Novig at '+(nIn*100).toFixed(3)+'% is 0.15 points better and Novig at '+(nOut*100).toFixed(3)+'% is 0.6 points better', near(ev(nIn)-pn,0.0015) && near(ev(nOut)-pn,0.006), null);
    alt={poly:0.53, novig:nIn}; await press(S); v=await look(S,'s');
    check('press: both read; Novig is better by only 0.15 points, so the book shown (Polymarket US) keeps its place', v.book==='Polymarket US' && near(v.price,0.53) && !v.swap.bypass, v);
    alt={poly:0.53, novig:nOut}; await press(S); v=await look(S,'s');
    check('press: Novig is better by 0.6 points: the card moves to Novig', v.book==='Novig' && near(v.price,nOut), v);
    // 7: clearing Books I bet undoes the swap
    await S.p.evaluate(()=>{ const c=JSON.parse(localStorage.getItem('mbev.cfg')); c.books=''; localStorage.setItem('mbev.cfg',JSON.stringify(c)); const i=document.getElementById('books'); if(i){ i.value=''; i.dispatchEvent(new Event('input',{bubbles:true})); } refresh(); }); await S.p.waitForTimeout(300); v=await look(S,'s');
    check('Books I bet cleared: the swap is undone, the card is the DraftKings row again (it stayed at the old swap price before)', v.book==='DraftKings' && near(v.price,0.52) && !v.swap, v);
    check('no page errors (swap)', !S.errs.length, S.errs); await S.ctx.close(); }
  // ================= 2: Kalshi's fee rounding =================
  { S=await open(b, [prop('k','Kal Test','Points',0.53,1,'Novig',60e3)], 'Novig, Kalshi, Polymarket, Bovada', (k,i,bk)=>({kalshi:0.5405, poly:0.541})[bk]||null);
    const floor=await S.p.evaluate(()=>cfgRead().eMin);
    const ek=ev(0.5405,kf(0.5405)), ep=ev(0.541,pf(0.541)), F2=Math.ceil(0.07*2*0.5405*0.4595*100-1e-9)/100, ek2=ev(0.5405,F2/(2*0.5405));
    check('by hand: Kalshi 54.05% at its listed fee is EV '+(ek*100).toFixed(2)+'% (over the floor, and the best); Polymarket US 54.1% is '+(ep*100).toFixed(2)+'%; on 2 Kalshi contracts the fee rounds up to $'+F2.toFixed(2)+', EV '+(ek2*100).toFixed(2)+'% (under the floor)', ek>=floor && ek>ep && ep>=floor && ek2<floor, {ek,ep,F2,ek2,floor});
    await press(S); v=await look(S,'k');
    check('press: Novig cannot be read; the card is not left at Kalshi failing the floor after the rounding: it shows Polymarket US 54.1% (v4.57 moved it to Kalshi and jailed it)', v.book==='Polymarket US' && near(v.price,0.541) && v.chk.skip==='kalshi_fee_rounding' && v.shop && v.shop.bypass==='exchange_unreadable' && !v.flags.some(f=>/after Kalshi fee rounding/.test(f)), v);
    check('no page errors (Kalshi)', !S.errs.length, S.errs); await S.ctx.close(); }
  // ================= 3: a cached board answer =================
  { const P=(fromCache)=>({props:[{player:'Cache Guy', game:'A1 @ H1', side:'over', line:20.5, market:'Points', book:'BetMGM', odds:-108, prob:0.58, mkt_prob:0.56, rating:4, ev_model:'projection', proj:22, team:'A1'}], _meta:fromCache?{from_cache:true, fetched_at:iso(NOW-20*60e3)}:{}});
    let cacheOn=true; S=await open(b, [], 'Novig, Kalshi, Polymarket, BetMGM', (k,i,bk)=>bk==='novig'?0.522:null, {props:()=>P(cacheOn)});
    const floor=await S.p.evaluate(()=>cfgRead().eMin);
    check('by hand: Novig 52.2% (EV '+(ev(0.522)*100).toFixed(2)+'%) is worse than BetMGM −108 (52%, EV '+(ev(0.52)*100).toFixed(2)+'%) and clears the floor', ev(0.522)<ev(0.52) && ev(0.522)>=floor, null);
    const load=async()=>{ await S.p.evaluate(async()=>{ window._loadAnyway='NBA'; await loadApi(false,'NBA'); }); await S.p.waitForTimeout(300); return S.p.evaluate(gi=>{ const r=lastRows.find(x=>x.name==='Cache Guy'); if(!r) return null; r.apiKey='cg'; r.gameInfo=gi; refresh(); return r.apiKey; }, GI(1)); };   /* the ESPN stub has no games: the test gives the row its game */
    await load(); v=await look(S,'cg');
    const kept=await S.p.evaluate(()=>slimRow(lastRows.find(x=>x.name==='Cache Guy')).priceAt);
    check('Load answered from the Worker’s cache (fetched 20 minutes ago): the board keeps that time, and saving the board keeps it too', !!kept && Math.abs(Date.parse(kept)-(NOW-20*60e3))<5000, kept);
    await press(S); v=await look(S,'cg');
    check('press: the BetMGM price is 20 minutes old, so it is stale: the fresh Novig price that clears the floor replaces it, saved as sportsbook_stale_unrefreshable, its age about 20 minutes (v4.57 called it fresh)', v.book==='Novig' && v.shop && v.shop.bypass==='sportsbook_stale_unrefreshable' && v.chk.incAge>=19.9*60e3 && v.chk.incAge<21*60e3, v);
    check('its tooltip says why, not "Novig beats BetMGM"', v.titles.some(t=>/The BetMGM price on the board was too old and cannot be read again here; Novig is the best fresh price that clears your floor/.test(t)) && !v.titles.some(t=>/Line shopping/.test(t)), v.titles);
    cacheOn=false; await load(); await press(S); v=await look(S,'cg');
    check('a fresh Load: the same BetMGM price is fresh, the 0.3 points apply and it stays', v.book==='BetMGM' && !v.shop && v.chk.margin==='applied', v);
    await S.p.evaluate(()=>{ const r=lastRows.find(x=>x.name==='Cache Guy'); r.priceAt='unknown'; }); await press(S); v=await look(S,'cg');
    check('a saved answer with no time (SportsGameOdds, The Odds API) counts as stale too', v.book==='Novig' && v.shop && v.shop.bypass==='sportsbook_stale_unrefreshable', v);
    check('no page errors (cache)', !S.errs.length, S.errs); await S.ctx.close(); }
  // ================= 4, 5, 6, 10, 11: an exchange row =================
  { let live={novig:0.515}; S=await open(b, [prop('x','Ex Row','Points',0.52,1,'Kalshi',10*60e3)], 'Novig, Kalshi, Polymarket, Bovada', (k,i,bk)=>live[bk]||null);
    await press(S); v=await look(S,'x');
    check('press: Kalshi (loaded 10 minutes ago) cannot be read, Novig can: it moves to Novig; the Kalshi price is saved as about 10 minutes old, not 0 (v4.57 saved 0)', v.book==='Novig' && v.chk.inc==='Kalshi' && v.chk.incReadable===false && v.chk.incAge>=595e3 && v.chk.incAge<610e3, v);
    check('its tooltip: "Kalshi could not be read on that scan; Novig is the best fresh price that clears your floor"', v.titles.some(t=>/Kalshi could not be read on that scan; Novig is the best fresh price that clears your floor/.test(t)), v.titles);
    check('the status line counts 1 repriced', /\b1<?\/?b?>? ?repriced|1 repriced/.test(v.msg), v.msg);
    await press(S); v=await look(S,'x');
    check('press again, Novig at the same 51.5%: nothing changed, "0 repriced" (v4.57 said 1)', v.book==='Novig' && /\b0 repriced/.test(v.msg), v.msg);
    await S.p.clock.fastForward(4*60e3); await S.p.waitForTimeout(300); live={}; await press(S); v=await look(S,'x');
    check('4 minutes later nothing can be read: "no price could be read · refresh prices", and not "Send the Sentinels" (the button just pressed)', v.book==='Novig' && /no price could be read · refresh prices/.test(v.tag) && !/Send the Sentinels/.test(v.tag), v.tag);
    check('no page errors (exchange)', !S.errs.length, S.errs); await S.ctx.close(); }
  { let live={kalshi:0.498}; S=await open(b, [prop('l','Live Row','Points',0.52,1,'Kalshi',60e3)], 'Novig, Kalshi, Polymarket, Bovada', (k,i,bk)=>live[bk]||null);
    await press(S); v=await look(S,'l');
    check('press: Kalshi reads 49.8%: "live · was −108"', v.book==='Kalshi' && near(v.price,0.498) && v.shop.same && /live · was -108/.test(v.tag), v.tag);
    await S.p.clock.fastForward(20*60e3); await S.p.waitForTimeout(300); live={}; await press(S); v=await look(S,'l');
    check('20 minutes later Kalshi cannot be read: it no longer says "live": "last read 20m ago · was −108", and the tooltip says the last scan could not read it', /last read 20m ago · was -108/.test(v.tag) && !/live · was/.test(v.tag) && v.titles.some(t=>/read 20m ago; the last scan could not read it/.test(t)), {tag:v.tag, titles:v.titles});
    check('no page errors (live)', !S.errs.length, S.errs); await S.ctx.close(); }
  // ================= 8: a failed request =================
  { const rows=[prop('a','Row A','Points',0.52,1,'Novig',60e3), prop('b2','Row B','Rebounds',0.52,2,'Novig',60e3), prop('c','Row C','Assists',0.52,3,'Novig',60e3)];
    S=await open(b, rows, 'Novig, Kalshi, Polymarket', (k,i,bk)=>({novig:0.52, kalshi:0.47, poly:0.53})[bk]||null);
    S.fail=bets=>bets.length===1;   // 3 rows × 3 exchanges = 9 jobs: the second request (the 9th job alone) fails
    await press(S); const c=await look(S,'c'), a=await look(S,'a');
    check('the second request fails: the bet whose price was not asked (Row C) stays exactly as it was, no move and no "could not be read" (v4.57 moved it with no 0.3)', c.book==='Novig' && near(c.price,0.52) && !c.shop && !c.chk, c);
    check('the error stays on screen: "exchange check failed (500) · 1 bet not checked, left as it was"', /exchange check failed \(500\) · 1 bet not checked, left as it was/.test(c.msg), c.msg);
    check('the bets that were read are decided as usual (Row A: Kalshi 47% is far better, it moves)', a.book==='Kalshi' && near(a.price,0.47), a);
    check('no page errors (failed request)', !S.errs.length, S.errs); await S.ctx.close(); }
  await b.close();
  console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(fail?1:0);
})();
