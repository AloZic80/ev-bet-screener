// node tests/book-choice-v461-test.js — v4.61, the fixes from the recheck of v4.57 (owner: "I had already said build"):
// a book-swap card follows the same rule as any card when its book cannot be read; a card is not moved to a Kalshi price that fails the floor after
// Kalshi's fee rounding; a cached board answer is not a fresh price; the last press's result wins over the age label; "live" only while it was read;
// the saved age of an unread price; clearing Books I bet undoes swaps; a failed request leaves the unasked bets alone; true tooltips; a true count.
// And the price's age on the card, the ◎ fresh check and the score (owner: "You can decide if you think it's the best thing to do", "Ok fix it and build"):
// a saved answer counts from when it was fetched, and only a read of the book the card shows makes its price new.
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
  await ctx.addInitScript(([R,d,bk,xc,cards])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify(Object.assign({books:bk,bank:'500',cfgVer:3.03}, xc||{}))); localStorage.setItem('mbev.cards',cards||'0');
    localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows:R})); }catch(e){} },[rows,DAY,books,(extra&&extra.cfg)||null,(extra&&extra.cards)||null]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); const S={ctx,p,errs,live,calls:0};
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/\/live\?/.test(u)){ S.calls++; const bets=JSON.parse(decodeURIComponent(u.split('bets=')[1])); if(S.fail && S.fail(bets)) return r.fulfill({status:500,contentType:'application/json',body:'{"error":"boom"}'});
      const R={}; bets.forEach(d=>{ const [kind,idx,bk]=d.id.split(':'); const pr=S.live&&S.live(kind,+idx,bk); if(pr) R[d.id]={ok:true, price:pr, bid:pr-0.02, at:Date.now()}; }); return r.fulfill({contentType:'application/json',body:JSON.stringify({results:R})}); }
    if(/\/props\?/.test(u) && extra && extra.props) return r.fulfill({contentType:'application/json',body:JSON.stringify(extra.props())});
    if(/\/src\/odds\?/.test(u) && extra && extra.sgo) return r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*','access-control-expose-headers':'x-src-quota, x-src-cached, x-src-at','x-src-cached':'1','x-src-at':extra.sgoAt},body:JSON.stringify(extra.sgo)});
    if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1300); return S; }
const press=async S=>{ await S.p.evaluate(async()=>{ await shopExchanges(); }); await S.p.waitForTimeout(250); };
const look=(S,key)=>S.p.evaluate(k=>{ const r=lastRows.find(x=>x.apiKey===k); return {book:r.book, price:r.offeredProb, pass:!!r.pass, stake:r.stake, flags:(r.flags||[]).map(f=>f[1]), shop:r.shop?{bypass:r.shop.bypass||null, same:!!r.shop.same, from:r.shop.from||null, orig:r.shop.orig.book}:null,
  place:isPlace(r), freed:!!r.freed, jailed:!!r.jailed,
  chk:r.shopChk?{inc:r.shopChk.inc&&r.shopChk.inc.book, incAge:r.shopChk.inc&&r.shopChk.inc.age, incReadable:r.shopChk.inc&&r.shopChk.inc.readable, bypass:r.shopChk.bypass||null, none:r.shopChk.none||null, skip:r.shopChk.skip||null, margin:r.shopChk.margin}:null,
  swap:r.swap?{from:r.swap.orig.book, at:r.swap.at, bypass:r.swap.bypass||null, was:r.swap.from||null}:null, swapNone:r.swapNone||null, stale:!!shopStale(r),
  seenAge:(t=>t?Date.now()-t:null)(rowSeenAt(r)), fresh:(x=>x?{ok:x.ok, t:x.t}:null)(ringOf(r,cfgRead()).checks.find(c=>c.k==='fresh')), snap:shopSnap(r)||null,
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
    check('and its price is not called fresh because Kalshi answered: it is as old as the Novig read (about 1 second here, not 0), and 4 minutes later it will say 4 minutes', v.seenAge!=null && v.seenAge>=500 && v.fresh && /price read/.test(v.fresh.t), {seenAge:v.seenAge, fresh:v.fresh});
    check('press: Novig cannot be read and the only fresh price (Kalshi 56%) is under the floor: the card stays at Novig 51.5%, "No current best book confirmed · shown exchange unavailable · fresh prices do not clear your floor" (v4.57 moved it to Kalshi and jailed it)', v.book==='Novig' && near(v.price,0.515) && v.swapNone==='exchange_unreadable_no_actionable_quote' && /No current best book confirmed · shown exchange unavailable · fresh prices do not clear your floor/.test(v.tag) && !/Send the Sentinels/.test(v.tag), v);
    alt={}; await press(S); await S.p.clock.fastForward(4*60e3); await S.p.waitForTimeout(400); v=await look(S,'s');
    check('press with nothing readable, 4 minutes later: still Novig 51.5%, "no price could be read · refresh prices", and not "Send the Sentinels" (the press was just made)', v.book==='Novig' && near(v.price,0.515) && v.swapNone==='nothing_readable' && /no price could be read · refresh prices/.test(v.tag) && !/Send the Sentinels/.test(v.tag), v);
    check('after that press the Novig price is 4 minutes old on the card too (the ◎ fresh check counts from when Novig was read)', v.seenAge>=4*60e3 && v.seenAge<5*60e3, {seenAge:v.seenAge, fresh:v.fresh});
    alt={kalshi:0.5405};   /* clears the floor at Kalshi’s listed fee, fails it after the fee is rounded up on 2 contracts (worked by hand in the Kalshi section) */
    await press(S); v=await look(S,'s');
    check('press: Novig cannot be read; Kalshi 54.05% fails the floor after its fee rounding: the card stays at Novig 51.5% and says "shown exchange unavailable · fresh prices do not clear your floor", not "no price could be read" (a price was read)', v.book==='Novig' && near(v.price,0.515) && v.swapNone==='exchange_unreadable_no_actionable_quote' && /shown exchange unavailable · fresh prices do not clear your floor/.test(v.tag) && !/no price could be read/.test(v.tag) && v.snap && v.snap.skip==='kalshi_fee_rounding', v);
    alt={poly:0.53};
    check('by hand: Polymarket US 53% after its fee is EV '+(ev(0.53,pf(0.53))*100).toFixed(2)+'%, over the floor', ev(0.53,pf(0.53))>=floor, null);
    await press(S); v=await look(S,'s');
    check('press: Novig still cannot be read, Polymarket US 53% clears the floor: the card moves there, with no 0.3 points, saved as exchange_unreadable', v.book==='Polymarket US' && near(v.price,0.53) && v.swap.bypass==='exchange_unreadable' && v.swap.from==='DraftKings' && !v.swapNone, v);
    const sv=await S.p.evaluate(()=>shopSnap(lastRows.find(x=>x.apiKey==='s')));   /* what addToLog saves (not logged here: a logged bet would mark the card already bet) */
    check('a bet taken from it saves the reason (exchange_unreadable), that it was a swap from DraftKings, and the book that could not be read (Novig)', sv && sv.bypass==='exchange_unreadable' && sv.swap===true && sv.from==='DraftKings' && sv.swapFrom==='Novig', sv);
    check('its tooltip says so: "Novig could not be read on the last scan; Polymarket US is the best fresh price that clears your floor"', v.titles.some(t=>/Novig could not be read on the last scan; Polymarket US is the best fresh price that clears your floor/.test(t)), v.titles);
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
  { S=await open(b, [prop('k2','Kal Only','Points',0.53,1,'Novig',60e3)], 'Novig, Kalshi, Polymarket, Bovada', (k,i,bk)=>bk==='kalshi'?0.5405:null);
    await press(S); v=await look(S,'k2');
    check('the same with Kalshi the only book that answers: the card stays at Novig 53% and says "No current best book confirmed · shown exchange unavailable · fresh prices do not clear your floor", not "no price could be read"; saved as exchange_unreadable_no_actionable_quote with the Kalshi skip', v.book==='Novig' && near(v.price,0.53) && v.chk.none==='exchange_unreadable_no_actionable_quote' && v.chk.skip==='kalshi_fee_rounding' && /shown exchange unavailable · fresh prices do not clear your floor/.test(v.tag) && !/no price could be read/.test(v.tag), v);
    check('no page errors (Kalshi only)', !S.errs.length, S.errs); await S.ctx.close(); }
  // ================= 3: a cached board answer =================
  { const P=(fromCache)=>({props:[{player:'Cache Guy', game:'A1 @ H1', side:'over', line:20.5, market:'Points', book:'BetMGM', odds:-108, prob:0.58, mkt_prob:0.56, rating:4, ev_model:'projection', proj:22, team:'A1'}], _meta:fromCache?{from_cache:true, fetched_at:iso(NOW-20*60e3)}:{}});
    const SGO={data:[{eventID:'E1', status:{startsAt:iso(KO), started:false, cancelled:false}, teams:{home:{teamID:'H', names:{short:'H1', long:'H1 Team'}}, away:{teamID:'A', names:{short:'A1', long:'A1 Team'}}}, players:{P1:{name:'Sgo Guy', teamID:'A'}},
      odds:{o1:{oddID:'o1', statID:'points', statEntityID:'P1', periodID:'game', betTypeID:'ou', sideID:'over', fairOdds:'-138', fairOverUnder:'20.5', byBookmaker:{betmgm:{odds:'-108', overUnder:'20.5', available:true}}}}}]};
    let cacheOn=true; S=await open(b, [], 'Novig, Kalshi, Polymarket, BetMGM', (k,i,bk)=>bk==='novig'?0.522:null, {props:()=>P(cacheOn), sgo:SGO, sgoAt:iso(NOW-7*60e3)});
    const sg=await S.p.evaluate(async()=>{ document.body.insertAdjacentHTML('beforeend','<div id="sgoTestBox" style="display:none"><select id="sgoSport"><option value="NBA" selected>NBA</option></select><select id="sgoN"><option value="10" selected>10</option></select><input type="checkbox" id="sgoProps" checked><input type="checkbox" id="sgoGl" checked></div>');
      await loadOddsSrc('sgo'); const r=lastRows.find(x=>x.name==='Sgo Guy'); const out=r?{priceAt:r.priceAt, age:Date.now()-rowSeenAt(r), fresh:ringOf(r,cfgRead()).checks.find(c=>c.k==='fresh').t}:null; lastRows=lastRows.filter(x=>x.name!=='Sgo Guy'); refresh(); return out; });
    check('a SportsGameOdds answer the Worker had saved 7 minutes ago: the bet keeps that time (the Worker sends it), so the card says the price is 7 minutes old', sg && sg.priceAt===iso(NOW-7*60e3) && sg.age>=7*60e3 && sg.age<8*60e3 && /price read 7m ago/.test(sg.fresh), sg);
    const op=await S.p.evaluate(()=>{ const g=at=>({startTime:new Date(Date.now()+3600e3).toISOString(), away:'AAA', home:'BBB', at, books:{'bovada.lv':{'45.5':{Over:1.9,Under:1.9}}}, sharp:{'45.5':{Over:0.5,Under:0.5}}}); return [opToRows([g()],'NFL').rows.map(r=>r.priceAt), opToRows([g('2026-11-11T18:50:00Z')],'NFL').rows.map(r=>r.priceAt)]; });
    check('OddsPapi totals (the Worker keeps each game 15 minutes and does not say when it was read) carry no time: "unknown"; a time on the game is used if one is sent', op[0].length===2 && op[0].every(x=>x==='unknown') && op[1].length===2 && op[1].every(x=>x==='2026-11-11T18:50:00.000Z'), op);
    const floor=await S.p.evaluate(()=>cfgRead().eMin);
    check('by hand: Novig 52.2% (EV '+(ev(0.522)*100).toFixed(2)+'%) is worse than BetMGM −108 (52%, EV '+(ev(0.52)*100).toFixed(2)+'%) and clears the floor', ev(0.522)<ev(0.52) && ev(0.522)>=floor, null);
    const load=async()=>{ await S.p.evaluate(async()=>{ window._loadAnyway='NBA'; await loadApi(false,'NBA'); }); await S.p.waitForTimeout(300); return S.p.evaluate(gi=>{ const r=lastRows.find(x=>x.name==='Cache Guy'); if(!r) return null; r.apiKey='cg'; r.gameInfo=gi; refresh(); return r.apiKey; }, GI(1)); };   /* the ESPN stub has no games: the test gives the row its game */
    await load(); v=await look(S,'cg');
    const kept=await S.p.evaluate(()=>slimRow(lastRows.find(x=>x.name==='Cache Guy')).priceAt);
    check('Load answered from the Worker’s cache (fetched 20 minutes ago): the board keeps that time, and saving the board keeps it too', !!kept && Math.abs(Date.parse(kept)-(NOW-20*60e3))<5000, kept);
    v=await look(S,'cg');
    check('the card itself says the price is 20 minutes old: the ◎ fresh check reads "⏱ 20m: re-check" (it said "fresh: price read 0s ago")', v.seenAge>=19.9*60e3 && v.seenAge<21*60e3 && v.fresh && v.fresh.ok===false && /⏱ 20m: re-check/.test(v.fresh.t), {seenAge:v.seenAge, fresh:v.fresh});
    const ex=await S.p.evaluate(()=>{ const r=lastRows.find(x=>x.name==='Cache Guy'); r.exOpen={p:0.52, at:Date.now()}; const a=Date.now()-rowSeenAt(r); delete r.exOpen; return a; });
    check('the open-market check (it reads the exchange but leaves the card’s price as it was) does not make that price new: still 20 minutes old', ex>=19.9*60e3 && ex<21*60e3, ex);
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
    await S.p.clock.fastForward(5*60e3); await S.p.waitForTimeout(300); v=await look(S,'l');
    check('5 minutes later, with no new press, it no longer says "live": "read 5m ago · was −108", and the tooltip says to send the Sentinels to read it again', /read 5m ago · was -108/.test(v.tag) && !/live · was/.test(v.tag) && v.titles.some(t=>/Kalshi price read 5m ago \(was -108 at the Pull\)\. Send the Sentinels to read it again/.test(t)), {tag:v.tag, titles:v.titles});
    const dom=()=>S.p.evaluate(()=>document.getElementById('v-board').innerText.replace(/\s+/g,' '));
    check('and the page itself was redrawn by the clock: it shows "read 5m ago · was -108"', /read 5m ago · was -108/.test(await dom()), null);
    await press(S); const d1=await dom(); await S.p.clock.fastForward(4*60e3); await S.p.waitForTimeout(400); const d2=await dom();
    check('press again (Kalshi read at the same 49.8%): the page says "live · was" again; 4 minutes later the clock redraws it to "read 4m ago · was" (the redraw compared a count, which could match by chance)', /live · was -108/.test(d1) && /read 4m ago · was -108/.test(d2) && !/live · was/.test(d2), {d1:(d1.match(/(live|read \d+m ago) · was -108/)||[])[0], d2:(d2.match(/(live|read \d+m ago) · was -108/)||[])[0]});
    await S.p.clock.fastForward(11*60e3); await S.p.waitForTimeout(300); live={}; await press(S); v=await look(S,'l');
    check('15 minutes after that read Kalshi cannot be read: it no longer says "live": "last read 15m ago · was −108", and the tooltip says the last scan could not read it', /last read 15m ago · was -108/.test(v.tag) && !/live · was/.test(v.tag) && v.titles.some(t=>/read 15m ago; the last scan could not read it/.test(t)), {tag:v.tag, titles:v.titles});
    check('no page errors (live)', !S.errs.length, S.errs); await S.ctx.close(); }
  // ================= freshness: only a read of the book shown makes its price new (owner: "Ok fix it and build") =================
  { const rows=[prop('f','Old Bovada','Points',0.52,1,'Bovada',12*60e3), prop('g','Old Kalshi','Rebounds',0.52,2,'Kalshi',12*60e3), prop('h','Kept Row','Assists',0.52,3,'Bovada',60e3)];
    let hOff=false; S=await open(b, rows, 'Novig, Kalshi, Polymarket, Bovada', (k,i,bk)=>i===0?(bk==='novig'?0.56:null):i===1?(bk==='kalshi'?0.52:null):((bk==='novig' && !hOff)?0.515:null));
    v=await look(S,'f');
    check('before any press: a Bovada price loaded 12 minutes ago fails the ◎ fresh check ("⏱ 12m: re-check")', v.fresh && v.fresh.ok===false && /⏱ 12m: re-check/.test(v.fresh.t), v.fresh);
    await press(S); v=await look(S,'f');
    check('press: Novig answers for that bet (56%, under the floor) but Bovada itself was not read: the card stays at Bovada, says the sportsbook price is stale, and the ◎ fresh check still says "⏱ 12m: re-check" (it said "fresh: price read 0s ago")', v.book==='Bovada' && v.chk.none==='sportsbook_stale' && v.fresh.ok===false && /⏱ 12m: re-check/.test(v.fresh.t) && v.seenAge>=12*60e3, {fresh:v.fresh, seenAge:v.seenAge, tag:v.tag});
    v=await look(S,'g');
    check('a Kalshi bet whose own price was read again (the same 52%) is fresh: "fresh: price read … ago"', v.book==='Kalshi' && v.fresh.ok===true && v.seenAge<5000, {fresh:v.fresh, seenAge:v.seenAge});
    v=await look(S,'h');
    check('Kept Row moved from a fresh Bovada to Novig 51.5% (1.06 points better): tooltip "Line shopping: Novig beats Bovada after fees", and its price is fresh', v.book==='Novig' && v.titles.some(t=>/Line shopping: Novig beats Bovada after fees/.test(t)) && v.fresh.ok===true, {titles:v.titles, fresh:v.fresh});
    await press(S); v=await look(S,'h');
    check('press again, same prices: Novig keeps its place; the tooltip says "Novig was read again … ago and kept its place", not "Novig beats Novig"', v.book==='Novig' && v.titles.some(t=>/Novig was read again \d+s ago and kept its place: no other fresh price was 0\.3 points better after fees \(the Pull price was Bovada -108\)/.test(t)) && !v.titles.some(t=>/beats Novig/.test(t)), v.titles);
    hOff=true; await S.p.clock.fastForward(4*60e3); await S.p.waitForTimeout(300); await press(S); v=await look(S,'h');
    check('4 minutes later nothing can be read for it (the Bovada price is too old to take it back): the tooltip no longer says it was read again: "Novig price read 4m ago; the last scan could not read it (the Pull price was Bovada -108)"', v.book==='Novig' && v.chk.none==='nothing_readable' && v.titles.some(t=>/Novig price read 4m ago; the last scan could not read it \(the Pull price was Bovada -108\)/.test(t)) && !v.titles.some(t=>/kept its place/.test(t)), v.titles);
    check('no page errors (freshness)', !S.errs.length, S.errs); await S.ctx.close(); }
  // ================= the read time belongs to the price shown =================
  { let kal=0.47; S=await open(b, [prop('w','Win Back','Points',0.52,1,'Bovada',90e3)], 'Kalshi, Bovada', (k,i,bk)=>bk==='kalshi'?kal:null);
    await press(S); v=await look(S,'w');
    check('press 1: Kalshi 47% takes the bet from a fresh Bovada 52%; the card’s price was read just now', v.book==='Kalshi' && near(v.price,0.47) && v.seenAge<5000, {book:v.book, seenAge:v.seenAge});
    await S.p.clock.fastForward(60e3); kal=0.60; await press(S); v=await look(S,'w');
    check('a minute later Kalshi is 60% and the Bovada price (loaded about 2m30s ago, inside the 3 minutes) wins the bet back: the card is as old as the board load, not as the Kalshi read a minute ago', v.book==='Bovada' && near(v.price,0.52) && !v.shop && v.seenAge>=150e3 && v.seenAge<170e3, {book:v.book, seenAge:v.seenAge});
    // a best-book label that runs out while a bet editor is open asks for one redraw, not one on every 30-second tick
    kal=0.47; await press(S); v=await look(S,'w');
    const ticks=await S.p.evaluate(async()=>{ window._aN=0; const a=window.audit; window.audit=function(){ window._aN++; return a.apply(this,arguments); }; const btn=[...document.querySelectorAll('.bet-btn')].pop(); if(btn) btn.click(); await new Promise(z=>setTimeout(z,150)); return {editor:!!document.querySelector('.editor'), n0:window._aN}; });
    for(let i=0;i<10;i++){ await S.p.clock.fastForward(30e3); await S.p.waitForTimeout(60); }
    const after=await S.p.evaluate(()=>({n:window._aN, stale:!!shopStale(lastRows.find(x=>x.apiKey==='w'))}));
    check('Kalshi takes the bet again; with the I bet this box open, 5 minutes pass (the best-book claim runs out): the board is re-screened for it at most twice, not on every tick (it was 10 times)', v.book==='Kalshi' && ticks.editor && after.stale && (after.n-ticks.n0)<=2, {v:v.book, ticks, after});
    check('no page errors (win back)', !S.errs.length, S.errs); await S.ctx.close(); }
  { let nv=0.52; S=await open(b, [prop('n','Novig Row','Points',0.52,1,'Novig',25*60e3)], 'Novig, Kalshi, Bovada', (k,i,bk)=>bk==='novig'?nv:null);
    await press(S); v=await look(S,'n');
    check('a Novig bet loaded 25 minutes ago is read again at the same 52% (nothing to change): the card is fresh', v.book==='Novig' && !v.shop && v.seenAge<5000, {seenAge:v.seenAge});
    await S.p.clock.fastForward(2*60e3); nv=null; await press(S); v=await look(S,'n');
    check('2 minutes later Novig cannot be read: the record says the shown price is 2 minutes old (the press that read it), not 27 (the board load)', v.chk.none==='nothing_readable' && v.chk.incAge>=120e3 && v.chk.incAge<135e3 && v.snap.chk.incumbent.age>=120e3 && v.snap.chk.incumbent.age<135e3, v.chk);
    check('no page errors (saved age)', !S.errs.length, S.errs); await S.ctx.close(); }
  // ================= the Kalshi re-decision repeats when a re-screen makes another card fail the rounding =================
  { const KAL={a:0.5412, b:0.539}; let idxKey={};
    S=await open(b, [prop('a','Player A','Points',0.536,1,'Bovada',20*60e3), prop('b','Player B','Rebounds',0.5583,2,'Bovada',60e3)], 'Bovada, Polymarket, Novig, Kalshi', (k,i,bk)=>bk==='kalshi'?KAL[idxKey[i]]:null, {cfg:{bank:'1000', dayMaxPct:'0.955'}});
    idxKey=await S.p.evaluate(()=>Object.fromEntries(lastRows.map(r=>[r.idx,r.apiKey])));
    const b0=await look(S,'b'); await press(S); const A=await look(S,'a'), B=await look(S,'b');
    check('before the press Player B is a placeable Bovada bet (the day’s max is $9.55)', b0.book==='Bovada' && b0.place && b0.stake>0, {stake:b0.stake});
    check('press: Kalshi fails the floor after its fee rounding for Player A (decided again: back at Bovada), and that re-screen trims Player B, moved to Kalshi on this press, until it fails the rounding too: Player B is decided again as well and ends at Bovada, still placeable (it was left at Kalshi, rejected)', A.book==='Bovada' && B.book==='Bovada' && B.place && B.stake>0 && B.chk.skip==='kalshi_fee_rounding' && !B.flags.some(f=>/Kalshi fee rounding/.test(f)) && !B.jailed, {A:{book:A.book, stake:A.stake, skip:A.chk&&A.chk.skip}, B:{book:B.book, stake:B.stake, place:B.place, skip:B.chk&&B.chk.skip, flags:B.flags}});
    check('no page errors (Kalshi rounds)', !S.errs.length, S.errs); await S.ctx.close(); }
  // ================= a pasted board: the age pill’s advice =================
  { const pr=Object.assign(prop('fd','Fan Duel Row','Points',0.52,1,'FanDuel',45*60e3),{src:'paste'});
    S=await open(b, [pr], 'FanDuel, Novig', null, {cards:'1'});
    const pill=await S.p.evaluate(()=>{ boardSrc='paste'; refresh(); const c=document.querySelector('.sc-card .sc-pill.age'); return c?{t:c.title, x:c.textContent}:null; });
    check('a pasted FanDuel bet, 45 minutes old: the age pill says "Paste the board again for a fresh one (the Sentinels read the exchanges, not FanDuel)" (it said "Refresh the board")', pill && /45m/.test(pill.x) && /Paste the board again for a fresh one \(the Sentinels read the exchanges, not FanDuel\)/.test(pill.t) && !/Refresh the board/.test(pill.t), pill);
    check('no page errors (pasted)', !S.errs.length, S.errs); await S.ctx.close(); }
  // ================= 8: a failed request =================
  { const rows=[prop('a','Row A','Points',0.52,1,'Novig',60e3), prop('b2','Row B','Rebounds',0.52,2,'Novig',60e3), prop('c','Row C','Assists',0.52,3,'Novig',60e3)];
    S=await open(b, rows, 'Novig, Kalshi, Polymarket', (k,i,bk)=>({novig:0.52, kalshi:0.47, poly:0.53})[bk]||null);
    S.fail=bets=>bets.length===1;   // 3 rows × 3 exchanges = 9 jobs: the second request (the 9th job alone) fails
    await press(S); const c=await look(S,'c'), a=await look(S,'a');
    check('the second request fails: the bet whose price was not asked (Row C) stays exactly as it was, no move and no "could not be read" (v4.57 moved it with no 0.3)', c.book==='Novig' && near(c.price,0.52) && !c.shop && !c.chk, c);
    check('the error stays on screen: "exchange check failed (500) · 1 bet not checked, left as it was"', /exchange check failed \(500\) · 1 bet not checked, left as it was/.test(c.msg), c.msg);
    check('the bets that were read are decided as usual (Row A: Kalshi 47% is far better, it moves)', a.book==='Kalshi' && near(a.price,0.47), a);
    check('the count covers only the bets that were checked: 6 live prices (Row C’s two half-read prices are not counted or kept)', /\b6 live prices/.test(c.msg) && await S.p.evaluate(()=>!lastRows.find(x=>x.apiKey==='c')._shopQ), c.msg);
    S.fail=null; await press(S); const c1=await look(S,'c'); const st0=await S.p.evaluate(()=>({sent:pkSentAt, q:Object.keys(lastRows.find(x=>x.apiKey==='c')._shopQ||{}).sort().join()}));
    check('a press that works: Row C moves to Kalshi 47% and the Parlays tab is stamped', c1.book==='Kalshi' && near(c1.price,0.47) && /Kalshi/.test(st0.q) && st0.sent>0, {book:c1.book, st0});
    await S.p.clock.fastForward(60e3); S.fail=bets=>bets.length===1; await press(S); const c2=await look(S,'c'); const st1=await S.p.evaluate(()=>({sent:pkSentAt, q:Object.keys(lastRows.find(x=>x.apiKey==='c')._shopQ||{}).sort().join()}));
    check('then a press whose second request fails: Row C stays at Kalshi 47% with the prices read for it before (they were wiped), and the Parlays tab is not stamped "checked at live prices" again', c2.book==='Kalshi' && near(c2.price,0.47) && st1.q===st0.q && st1.q.length>0 && st1.sent===st0.sent, {c2:c2.book, st0, st1});
    check('no page errors (failed request)', !S.errs.length, S.errs); await S.ctx.close(); }
  { let idxKey={}, nov={};
    S=await open(b, [prop('p0','Player Zero','Points',0.553,1,'Bovada',30e3), prop('p1','Player One','Points',0.553,2,'Bovada',30e3), prop('p2','Player Two','Points',0.57,3,'Bovada',30e3), prop('p3','Player Three','Points',0.565,4,'Bovada',30e3)],
      'Bovada, Polymarket, Novig, Kalshi', (k,i,bk)=>bk==='novig'?nov[idxKey[i]]:null, {cfg:{bank:'1000', dayMaxPct:'1.2'}});
    idxKey=await S.p.evaluate(()=>Object.fromEntries(lastRows.map(r=>[r.idx,r.apiKey])));
    nov={p3:0.55}; await press(S); let p3=await look(S,'p3');
    check('with a $12 day max: a press moves Player Three to Novig 55% and it comes out of Skipping Jail (🔓)', p3.book==='Novig' && p3.place && p3.freed && !p3.jailed, {book:p3.book, place:p3.place, freed:p3.freed});
    nov={p0:0.53, p1:0.53}; S.fail=bets=>bets.length===4; await press(S); p3=await look(S,'p3');
    check('next press: the second request fails, so Players Two and Three are not checked; the first two take the day’s room and Player Three’s stake drops out. It gets no new 🔒 tag (its price was never read), the 🔓 tag that is no longer true goes, and it is not counted as "sent to Skipping Jail"', !p3.place && !p3.jailed && !p3.freed && /2 bets not checked, left as they were/.test(p3.msg) && !/sent to Skipping Jail/.test(p3.msg), {place:p3.place, freed:p3.freed, jailed:p3.jailed, msg:p3.msg});
    check('no page errors (failed scan, jail tags)', !S.errs.length, S.errs); await S.ctx.close(); }
  await b.close();
  console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(fail?1:0);
})();
