// node tests/modes-perfecta-test.js — v4.50. Owner, 11/10: "Safe was meant for the best bets, Feeling Lucky are the ones that just missed it, but if I want
// to bet a few, it's fine. And Clairvoyant are bets that are Hail Marys ... a dream of the Sports Gods"; "sweet spots will always be on the Safe bets";
// "what is the perfect bet ... a circle around the bet ... passes EVERYTHING"; "the background of the bet can change a bit, to distinguish as a BET NOW";
// "some that are just better to use as parlays"; "it says Novig 53, but I can't even see the ones rejected". Then: "build - and check everything again".
// Safe = the best bets, the same cards and stakes in every mode. Feeling Lucky adds 🍀 Just missed (smallest bet, 5 a day). Clairvoyant adds 🔮 Hail
// Marys ($1, 3 a day, by game, what the math thinks). ◎ PERFECTA = six checks; 5 of 6 names the miss. 🎟 parlay legs. Each kind on its own record.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,700)); };
const NOW=Date.parse('2026-11-10T19:00:00Z'), iso=ms=>new Date(ms).toISOString(), DAY='2026-11-10', KO=Date.parse('2026-11-11T01:15:00Z'), H=3600e3;
const T=(ha,abbr,loc,nick)=>({ha,id:abbr,abbr,name:loc+' '+nick,loc,nick,logo:'',rec:'',color:'333333',alt:'ffffff'});
const GI=(start,id,a,h)=>({state:'pre',startISO:iso(start),eventId:id,timeCT:'',detail:'',teams:[T('away',a[0],a[1],a[2]),T('home',h[0],h[1],h[2])]});
const G1=GI(KO,'401001',['BUF','Buffalo','Bills'],['MIN','Minnesota','Vikings']), G2=GI(KO+2*H,'401002',['NYI','New York','Islanders'],['SJ','San Jose','Sharks']);
const am=p=>p>=0.5?String(Math.round(-100*p/(1-p))):'+'+Math.round(100*(1-p)/p);
const prop=(id,name,team,market,side,price,fair,mkt,gi,sport,extra)=>Object.assign({name,team,game:gi.teams[0].abbr+' @ '+gi.teams[1].abbr,matchup:gi.teams[0].abbr+' @ '+gi.teams[1].abbr,side,sport,market,kind:'prop',book:'Novig',
  offeredRaw:am(price),offeredProb:price,fairProb:fair,fairRaw:am(fair),mktProb:mkt,stars:4,evModel:'projection',projValue:10,gameInfo:gi,src:'api:'+sport+':props',apiKey:id,loadedAt:iso(NOW-60e3)},extra||{});
const ROWS=[
  prop('perf','Justin Jefferson','MIN','75.5 Receiving Yards','O',0.54,0.60,0.585,G1,'NFL'),                                 // 6 of 6
  prop('five','Dalton Kincaid','BUF','40.5 Receiving Yards','O',0.54,0.60,0.585,G1,'NFL',{loadedAt:iso(NOW-14*60e3)}),         // 5 of 6: the price is 14 min old
  prop('plain','James Cook','BUF','15.5 Rushing Attempts','O',0.53,0.56,0.545,G1,'NFL'),                                       // 4 of 6: edge +3.8%, room 2.0
  prop('leg','Victor Eklund','NYI','0.5 Shots','O',0.705,0.74,0.725,G2,'NHL'),                                                 // 73% chance: a parlay leg (5 of 6: edge +3.6%)
  prop('sweetno','Anders Lee','NYI','2.5 Shots','O',0.525,0.545,0.528,G2,'NHL'),                                               // model +3.8% (old sweet spot), La Contadora +1.7% (not one)
  prop('lucky','Will Cuylle','SJ','1.5 Shots','O',0.535,0.5546,0.526,G2,'NHL'),                                                // Watch, La Contadora +0.2%: just missed
  prop('watchneg','Mario Ferraro','SJ','1.5 Blocked Shots','O',0.535,0.56,0.50,G2,'NHL'),                                      // Watch, La Contadora −2.6%: not offered
  prop('td1','Jordan Mason','MIN','Anytime TD','O',0.2222,0.20,0.19,G1,'NFL'),                                                 // +350, no math edge
  prop('td2','Dawson Knox','BUF','Anytime TD','O',0.10,0.12,0.11,G1,'NFL'),                                                    // +900 (past the +500 odds range), the math agrees
  prop('td3','Justin Jefferson','MIN','Anytime TD','O',0.20,0.19,0.185,G1,'NFL'),                                              // +400 on a player with a best bet
  prop('goal','Bo Horvat','NYI','Anytime Goal Scorer','O',0.25,0.22,0.23,G2,'NHL'),                                            // +300
  Object.assign(prop('ml','San Jose Sharks','SJ','Moneyline','',0.238,0.21,0.22,G2,'NHL'),{kind:'moneyline'}),                // +320 underdog
];
const LB=(id,name,market,tier,extra)=>Object.assign({id,key:id,name,sport:'NFL',kind:'prop',market,side:'O',team:null,game:'BUF @ MIN',matchup:'BUF @ MIN',book:'Novig',odds:'+300',offeredRaw:'+300',stake:1,fee:0,
  date:DAY,dateSet:true,start:iso(KO),tier,snap:{at:iso(NOW-H),said:{decision:tier==='lucky'?'JUST MISSED':'HAIL MARY',onList:false,tier}}},extra||{});
async function open(b, mode, o){ o=o||{};
  const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:o.w||1280,height:900}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(([R,d,m,L,cards,md])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig, Kalshi',bank:'500',cfgVer:3.03}));
    localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows:R})); if(L) localStorage.setItem('mbev.log',JSON.stringify(L)); if(m && m!=='safe') localStorage.setItem('mbev.mode',JSON.stringify({mode:m,day:md||d})); if(cards===false) localStorage.setItem('mbev.cards','0'); }catch(e){} }, [o.rows||ROWS,DAY,mode,o.log||null,o.cards,o.modeDay||null]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1300);
  const rows=()=>p.evaluate(()=>lastRows.map(r=>({k:r.apiKey, stake:+(+r.stake||0).toFixed(2), tier:r.tier||'', xc:r.xc||'', x:r.xStake||0, ring:r.ring?r.ring.n:null, miss:r.ring?r.ring.miss:[], leg:!!r.leg, act:r.actNet, prior:!!r.prior, flags:(r.flags||[]).map(f=>f[1]).join(' | ')})));
  const cards=()=>p.evaluate(()=>[...document.querySelectorAll('#placeCards .sc-card')].map(c=>({cls:c.className, k:(lastRows.find(r=>r.idx===+c.dataset.idx)||{}).apiKey, t:c.innerText.replace(/\s+/g,' ')})));
  const heads=()=>p.evaluate(()=>[...document.querySelectorAll('#placeCards .pc-head')].map(h=>h.innerText.replace(/\s+/g,' ')));
  return {ctx,p,errs,rows,cards,heads};
}
(async()=>{
  const b=await chromium.launch();
  // ================= Safe: the best bets, the ring, the parlay leg, the sweet spot =================
  let S=await open(b,'safe'); let R=await S.rows(), C=await S.cards(), Hd=await S.heads(); const g=(L,k)=>L.find(x=>x.k===k)||{};
  const safeStakes=R.filter(x=>x.stake>0).map(x=>x.k+':'+x.stake).join(',');
  check('Safe: Place these has the 5 best bets, no 🍀 or 🔮 card, no extra group', C.length===5 && !C.some(c=>/sc-x/.test(c.cls)) && Hd.length===1 && /Place these · 5/i.test(Hd[0]), {n:C.length, heads:Hd.map(h=>h.slice(0,40))});
  const mb=await S.p.evaluate(()=>[...document.querySelectorAll('#modeBar button')].map(x=>x.textContent.replace(/\s+/g,' ').trim()));
  check('Safe: the mode buttons say what each mode would add: Feeling Lucky +1, Clairvoyant +6 (1 just missed + 5 Hail Marys)', /Feeling Lucky \+1$/.test(mb[1]) && /Clairvoyant \+6$/.test(mb[2]) && /Safe$/.test(mb[0]), mb);
  check('candidates are marked whatever the mode: Cuylle just missed (La Contadora +0.2%); Ferraro at −2.6% is not; five long shots (Jefferson’s TD among them)', g(R,'lucky').xc==='lucky' && g(R,'watchneg').xc==='' && ['td1','td2','goal','ml','td3'].every(k=>g(R,k).xc==='hail') && R.every(x=>!x.tier), R.map(x=>x.k+':'+x.xc));
  const cJ=g(C,'perf'), cK=g(C,'five'), cC=g(C,'plain'), cE=g(C,'leg');
  check('◎ PERFECTA: Jefferson passes 6 of 6: gold card, "◎ PERFECTA · BET NOW", "6 of 6 · price read 1m ago"', g(R,'perf').ring===6 && /sc-perf(\s|$)/.test(cJ.cls) && /◎ PERFECTA · BET NOW 6 of 6 · price read 1m ago/.test(cJ.t), {ring:g(R,'perf').ring, cls:cJ.cls, t:(cJ.t||'').slice(0,80)});
  check('5 of 6 names the miss: Kincaid "price 14m old: re-check" (not BET NOW); Eklund "edge +3.6% with the market: under +4%"', g(R,'five').ring===5 && /sc-perf5/.test(cK.cls) && /◎ 5 of 6 · price 14m old: re-check/.test(cK.t) && !/BET NOW/.test(cK.t) && /◎ 5 of 6 · edge \+3\.6% with the market: under \+4%/.test(cE.t), {five:(cK.t||'').slice(0,60), leg:(cE.t||'').slice(0,70)});
  check('4 of 6 (Cook: edge +3.8%, room 2.0 pts) gets no ring on the card', g(R,'plain').ring===4 && !/sc-perf/.test(cC.cls) && !/◎ (5|PERFECTA)/.test(cC.t) && g(R,'plain').miss.length===2 && /under \+4%/.test(g(R,'plain').miss[0]) && /room for error 2\.0 pts: under 2\.5/.test(g(R,'plain').miss[1]), g(R,'plain'));
  const why=await S.p.evaluate(()=>{ const r=lastRows.find(x=>x.apiKey==='perf'), c=document.querySelector('#placeCards .sc-card[data-idx="'+r.idx+'"]'); const d=c.querySelector('details.sc-why'); d.open=true; return [...c.querySelectorAll('.sc-ringl li')].map(li=>li.className+':'+li.textContent); });
  const byHand={p:0.585+0.35*(0.60-0.585), ev:(0.585+0.35*(0.60-0.585))/0.54-1};
  check('Why this play? lists the six checks with the numbers: La Contadora 59.0% (= 58.5 + 0.35 × 1.5), edge +9.3%, room 5.0 pts, model ≥ market > price, fresh, clean', why.length===6 && why.every(x=>/^ok:✓/.test(x)) && /La Contadora gives 59\.0% \(50 to 75%\)/.test(why[0]) && /edge \+9\.3% with the market/.test(why[1]) && /room for error 5\.0 pts/.test(why[2]) && /model 60\.0% ≥ market 58\.5% > price 54\.0%/.test(why[3]) && /price read 1m ago/.test(why[4]) && /^ok:✓ clean/.test(why[5]) && Math.abs(byHand.p-0.59025)<1e-9 && Math.abs(g(R,'perf').act-byHand.ev)<1e-9, why);
  check('🎟 PARLAY LEG on Eklund only (La Contadora 73.0%); the tip says a 4-pick PrizePicks Power entry needs about 56.2% a pick', g(R,'leg').leg && R.filter(x=>x.leg).length===1 && /🎟 PARLAY LEG/.test(cE.t) && !/PARLAY LEG/.test(cJ.t) && await S.p.evaluate(()=>/73\.0%/.test(document.querySelector('#placeCards .leg-tag').title) && /56\.2% a pick/.test(document.querySelector('#placeCards .leg-tag').title)), {legs:R.filter(x=>x.leg).map(x=>x.k)});
  const sw=C.map(c=>c.k+':'+/SWEET SPOT/.test(c.t));
  check('🎯 sweet spot is judged on La Contadora’s EV: Lee (model +3.8%, hers +1.7%, under your 2%) is not one any more; Jefferson (+9.3%) and Cook (+3.8%) are; Eklund (−239) is outside the odds', Math.abs(g(R,'sweetno').act-0.017048)<2e-4 && sw.includes('sweetno:false') && sw.includes('perf:true') && sw.includes('plain:true') && sw.includes('leg:false'), sw);
  // the Show menu
  const sel=async v=>{ await S.p.selectOption('#boardView',v); await S.p.waitForTimeout(200); return {cards:(await S.cards()).map(c=>c.k), rows:await S.p.evaluate(()=>[...document.querySelectorAll('#tbody tr:not(.group-row):not(.notes-row)')].length)}; };
  const vPerf=await sel('perf'), vLegs=await sel('legs'); await sel('all');
  check('Show › ◎ Perfectas lists only Jefferson; Show › 🎟 Parlay legs lists only Eklund', vPerf.cards.join()==='perf' && vPerf.rows===0 && vLegs.cards.join()==='leg' && vLegs.rows===0, {vPerf, vLegs});
  // book chips count what you see
  const chipsAll=await S.p.evaluate(()=>[...document.querySelectorAll('#bookChips .bchip')].map(c=>c.textContent.replace(/\s+/g,' ').trim()));
  await S.p.evaluate(()=>{ const cb=document.getElementById('swOnly'); cb.checked=true; cb.dispatchEvent(new Event('change',{bubbles:true})); }); await S.p.waitForTimeout(250);
  const chipsSw=await S.p.evaluate(()=>({chips:[...document.querySelectorAll('#bookChips .bchip')].map(c=>c.textContent.replace(/\s+/g,' ').trim()), cards:document.querySelectorAll('#placeCards .sc-card').length, rows:[...document.querySelectorAll('#tbody tr:not(.group-row):not(.notes-row)')].length}));
  check('book chips count what you can see: 7 listed (5 cards + 2 Watch rows) → "Novig 7"; with Only sweet spot ticked, 3 cards → "All 3", "Novig 3" (before: 7 either way)', chipsAll.join('|')==='All 7|Novig 7' && chipsSw.cards===3 && chipsSw.rows===0 && chipsSw.chips.join('|')==='All 3|Novig 3', {chipsAll, chipsSw});
  const kx=await S.p.evaluate(()=>{ const c=cfgRead(); return {lucky:extrasKalshi({offeredProb:0.535},1,c,true), hail:extrasKalshi({offeredProb:0.10},1,c,false)}; });
  check('on Kalshi an extra is whole contracts: Just missed at 53.5¢ = 2 contracts, $1.07 + 4¢ fee = $1.11 (not under the $1 smallest bet); a Hail Mary at 10¢ = 9 contracts, 90¢ + 6¢ fee = $0.96 (inside $1)', kx.lucky.N===2 && kx.lucky.stake===1.11 && kx.hail.N===9 && kx.hail.stake===0.96, kx);
  check('no page errors (Safe)', !S.errs.length, S.errs); await S.ctx.close();
  // ================= Feeling Lucky =================
  let L=await open(b,'lucky'); R=await L.rows(); C=await L.cards(); Hd=await L.heads();
  check('Feeling Lucky: the best bets are the same cards with the same stakes as in Safe (no bigger Kelly, no higher daily max)', R.filter(x=>x.stake>0).map(x=>x.k+':'+x.stake).join(',')===safeStakes && await L.p.evaluate(()=>{ const c=cfgRead(), bb=cfgReadBase(); return c.kelly===bb.kelly && c.dayMax===bb.bank*bb.dayMaxPct/100 && c.gameCap===bb.bank*bb.gameCapPct/100 && c.dayMax===50; }), safeStakes);
  const cL=g(C,'lucky');
  check('🍀 Just missed has its own group under Place these: Cuylle, $1.00 (the smallest bet), "missed your 1.5% floor by 1.3 pts", La Contadora +0.2%', Hd.length===2 && /🍀 JUST MISSED · 1/i.test(Hd[1]) && /up to 5 a game day/.test(Hd[1]) && /sc-x lucky/.test(cL.cls) && /🍀 JUST MISSED · missed your 1\.5% floor by 1\.3 pts/.test(cL.t) && /\$1\.00/.test(cL.t) && /the smallest bet/.test(cL.t) && /La Contadora \+0\.2%, your floor is 1\.5%/.test(cL.t) && g(R,'lucky').x===1 && g(R,'lucky').stake===0, {heads:Hd.map(h=>h.slice(0,60)), card:(cL.t||'').slice(0,160)});
  check('Ferraro (La Contadora −2.6%) is not offered: still Watch; no Hail Mary in Feeling Lucky; an extra never gets the sweet spot, the ring or #1', g(R,'watchneg').tier==='' && !C.some(c=>c.k==='watchneg') && !C.some(c=>/sc-x hail/.test(c.cls)) && !/SWEET SPOT|PERFECTA|MATH PICK/.test(cL.t) && C.filter(c=>/sc-x/.test(c.cls)).length===1, C.map(c=>c.k));
  // I bet this on the just-missed card
  const ed=await L.p.evaluate(async()=>{ const r=lastRows.find(x=>x.apiKey==='lucky'), c=document.querySelector('#placeCards .sc-card[data-idx="'+r.idx+'"]'); c.querySelector('button.bet-btn').click(); await new Promise(z=>setTimeout(z,150));
    const e=c.querySelector('.editor'); return {cost:e.querySelector('.eb-cost').value, stake:e.querySelector('.eb-stake').value, check:e.querySelector('.eb-check').textContent, rec:e.querySelector('.eb-rec').textContent}; });
  check('I bet this on it opens at $1.00 and says what it is: "🍀 Just missed: La Contadora +0.2%, your floor is 1.5%"', ed.cost==='1.00' && ed.stake==='1.00' && /🍀 Just missed: La Contadora \+0\.2%, your floor is 1\.5%/.test(ed.check) && /just missed: the smallest bet, \$1\.00/.test(ed.rec), ed);
  const sv=await L.p.evaluate(async()=>{ document.querySelector('#placeCards .editor .eb-save').click(); await new Promise(z=>setTimeout(z,300)); const B=logged[logged.length-1]; return {n:logged.length, tier:B&&B.tier, stake:B&&B.stake, said:B&&B.snap&&B.snap.said, ring:B&&B.snap&&B.snap.ring||null, line:document.getElementById('todayLine').textContent}; });
  R=await L.rows(); C=await L.cards();
  check('Save logs it as a real bet marked 🍀 (tier lucky, $1, said JUST MISSED, not "against the screener"): the Today line says "1 🍀🔮 extra"; the card is now ALREADY BET', sv.n===1 && sv.tier==='lucky' && sv.stake===1 && sv.said.decision==='JUST MISSED' && sv.said.tier==='lucky' && sv.ring===null && /1 🍀🔮 extra/.test(sv.line) && !/against the screener/.test(sv.line) && g(R,'lucky').prior && !C.some(c=>c.k==='lucky'), sv);
  check('no page errors (Feeling Lucky)', !L.errs.length, L.errs); await L.ctx.close();
  // the 5-a-day count
  L=await open(b,'lucky',{log:[1,2,3,4,5].map(i=>LB('l'+i,'Somebody '+i,'1.5 Receptions','lucky'))}); R=await L.rows(); Hd=await L.heads();
  check('5 just-missed bets already on today’s games: no more are offered ("🍀 Just missed: 5 a day, and you have 5 …"), no group', g(R,'lucky').tier==='' && /🍀 Just missed: 5 a day, and you have 5 on/.test(g(R,'lucky').flags) && Hd.length===1, {flags:g(R,'lucky').flags, heads:Hd.length}); await L.ctx.close();
  // ================= Clairvoyant =================
  let Cv=await open(b,'clair'); R=await Cv.rows(); C=await Cv.cards(); Hd=await Cv.heads();
  check('Clairvoyant: the best bets and their stakes are still the same as in Safe; Just missed is there too', R.filter(x=>x.stake>0).map(x=>x.k+':'+x.stake).join(',')===safeStakes && /🍀 JUST MISSED · 1/i.test(Hd[1]) && Hd.length===3, Hd.map(h=>h.slice(0,50)));
  const games=await Cv.p.evaluate(()=>[...document.querySelectorAll('#placeCards details.hm-game')].map(d=>({open:d.open, sum:d.querySelector('summary').innerText.replace(/\s+/g,' '), n:d.querySelectorAll('.sc-card').length})));
  check('🔮 Hail Marys: 5 in 2 games, grouped by game ("NFL · Buffalo @ Minnesota … 3 long shots · up to +900 · ✓ the math agrees on 1"), $1 each, 3 a day', /🔮 HAIL MARYS · 5 in 2 games/i.test(Hd[2]) && /\$1 each, up to 3 a game day/.test(Hd[2]) && games.length===2 && games[0].open && games[0].n===3 && games[1].open && games[1].n===2 && /NFL · Buffalo @ Minnesota/.test(games[0].sum) && /3 long shots · up to \+900 · ✓ the math agrees on 1/.test(games[0].sum) && /NHL · New York @ San Jose/.test(games[1].sum), {head:Hd[2].slice(0,60), games});
  const h1=g(C,'td1'), h2=g(C,'td2'), hm=g(C,'ml');
  check('each card says what the math thinks: Mason +350 "the math says −12.9%", "La Contadora gives 19.4%; +350 needs 22.2%", $1.00, "Yes" (not a bare Over)', /sc-x hail/.test(h1.cls) && /🔮 HAIL MARY · the math says −12\.9%/.test(h1.t) && /La Contadora gives 19\.4%; \+350 needs 22\.2%/.test(h1.t) && /Yes \$1\.00 pays \$4\.50 a Hail Mary/.test(h1.t) && g(R,'td1').x===1, (h1.t||'').slice(0,260));
  check('a long shot past your +500 odds range is listed too, and says when the math agrees: Knox +900 "✓ the math agrees: +13.5%"; the Sharks +320 moneyline is one as well', /🔮 HAIL MARY · ✓ the math agrees: \+13\.5%/.test(h2.t) && /La Contadora gives 11\.3%; \+900 needs 10\.0%/.test(h2.t) && /SJ to win/.test(hm.t) && /the math says −11\.8%/.test(hm.t), {knox:(h2.t||'').slice(0,90), sj:(hm.t||'').slice(0,60)});
  check('Jefferson’s own +400 TD is offered too while nothing is bet on him (a best bet on a player does not hide his Hail Mary until one is placed)', g(R,'td3').tier==='hail', g(R,'td3'));
  // save a Hail Mary the math does not like: one more press
  const hs=await Cv.p.evaluate(async()=>{ const r=lastRows.find(x=>x.apiKey==='td1'), c=document.querySelector('#placeCards .sc-card[data-idx="'+r.idx+'"]'); c.querySelector('button.bet-btn').click(); await new Promise(z=>setTimeout(z,150));
    const e=c.querySelector('.editor'), cost=e.querySelector('.eb-cost').value, chk=e.querySelector('.eb-check').textContent; e.querySelector('.eb-save').click(); await new Promise(z=>setTimeout(z,150));
    const msg=e.querySelector('.eb-msg').textContent, n1=logged.length, btn=e.querySelector('.eb-save').textContent; e.querySelector('.eb-save').click(); await new Promise(z=>setTimeout(z,300)); const B=logged[logged.length-1];
    return {cost, chk, msg, n1, btn, n2:logged.length, tier:B&&B.tier, stake:B&&B.stake, said:B&&B.snap&&B.snap.said}; });
  check('I bet this on a Hail Mary opens at $1.00; the math says no, so the first press asks ("🔮 Hail Mary: the math says no … Your call"), the second saves it as tier hail', hs.cost==='1.00' && /🔮 Hail Mary: La Contadora gives 19\.4%; \+350 needs 22\.2%/.test(hs.chk) && /🔮 Hail Mary: the math says no/.test(hs.msg) && /Your call: press Save bet anyway/.test(hs.msg) && hs.n1===0 && /Save bet anyway/.test(hs.btn) && hs.n2===1 && hs.tier==='hail' && hs.stake===1 && hs.said.decision==='HAIL MARY', hs);
  check('no page errors (Clairvoyant)', !Cv.errs.length, Cv.errs); await Cv.ctx.close();
  // 3 a day; a held Hail Mary does not block a best bet on that player, but blocks another extra on him
  Cv=await open(b,'clair',{log:[LB('h1','Justin Jefferson','Anytime TD','hail',{odds:'+400',offeredRaw:'+400',gameInfo:G1})]}); R=await Cv.rows(); C=await Cv.cards();
  check('you hold a $1 Hail Mary on Jefferson to score: his best bet (Over 75.5 yards) is still a best bet with its stake, and says "Same game as your Jefferson …"', g(R,'perf').stake>0 && /Same game as your Jefferson/.test(g(R,'perf').flags) && !/PLAYER EXPOSURE/.test(g(R,'perf').flags) && C.some(c=>c.k==='perf' && /🔗 Same game as your Jefferson/.test(c.t)), g(R,'perf'));
  check('that Hail Mary itself is ALREADY BET; 1 of 3 used: the header says "1 used today"', g(R,'td3').prior && /1 used today/.test((await Cv.heads())[2]||''), {prior:g(R,'td3').prior, head:((await Cv.heads())[2]||'').slice(-80)}); await Cv.ctx.close();
  Cv=await open(b,'clair',{log:['a','b','c'].map(i=>LB('h'+i,'Somebody '+i,'Anytime TD','hail'))}); R=await Cv.rows(); Hd=await Cv.heads();
  check('3 Hail Marys already on today’s games: no more are offered ("🔮 Hail Marys: 3 a day, and you have 3 …"); Just missed still is', ['td1','td2','goal','ml'].every(k=>g(R,k).tier==='' && /🔮 Hail Marys: 3 a day, and you have 3 on/.test(g(R,k).flags)) && Hd.length===2 && /JUST MISSED/i.test(Hd[1]), {flags:g(R,'td1').flags, heads:Hd.length}); await Cv.ctx.close();
  Cv=await open(b,'clair',{modeDay:'2026-11-09'});
  check('Clairvoyant picked yesterday is back to Safe today', await Cv.p.evaluate(()=>betMode)==='safe' && (await Cv.heads()).length===1, await Cv.p.evaluate(()=>betMode)); await Cv.ctx.close();
  // ================= the ring follows the clock; a logged best bet keeps its ring =================
  S=await open(b,'safe');
  const kept=await S.p.evaluate(async()=>{ const r=lastRows.find(x=>x.apiKey==='perf'), c=document.querySelector('#placeCards .sc-card[data-idx="'+r.idx+'"]'); c.querySelector('button.bet-btn').click(); await new Promise(z=>setTimeout(z,150));
    c.querySelector('.editor .eb-save').click(); await new Promise(z=>setTimeout(z,300)); const B=logged[logged.length-1]; return {tier:B.tier||null, ring:B.snap.ring, said:B.snap.said.decision, tag:tierTagHtml(B).replace(/<[^>]+>/g,'')}; });
  check('a best bet you log keeps its ◎ checks from that moment (6 of 6, no tier); the Bet log tags it "◎ Perfecta"', kept.tier===null && kept.ring && kept.ring.n===6 && kept.ring.of===6 && kept.said==='BET' && kept.tag==='◎ Perfecta', kept);
  await S.p.clock.fastForward(10*60e3+35e3); await S.p.waitForTimeout(400);
  const later=await S.p.evaluate(()=>{ const r=lastRows.find(x=>x.apiKey==='five'), c=document.querySelector('#placeCards .sc-card[data-idx="'+r.idx+'"]'); return {n:[...document.querySelectorAll('#placeCards .sc-card.sc-perf')].length, plain:(lastRows.find(x=>x.apiKey==='plain').ring||{}).n, five:r.ring.n, t:c?c.innerText.replace(/\s+/g,' ').slice(0,60):''}; });
  check('11 minutes later, with no reload: no card says BET NOW any more (every price is over 10 minutes old); Cook drops from 4 to 3 of 6', later.n===0 && later.plain===3, later);
  check('no page errors (clock)', !S.errs.length, S.errs); await S.ctx.close();
  // ================= records: the Scorecard keeps the extras out; ◎ Rings and extras lists each kind =================
  const day0='2026-11-08', st0='2026-11-08T23:00:00Z', base=(id,odds,res,extra)=>Object.assign({id,key:id,name:'P '+id,sport:'NFL',kind:'prop',market:'1.5 Receptions',side:'O',book:'Bovada',odds,offeredRaw:odds,stake:2,fee:0,date:day0,dateSet:true,start:st0,result:res,gradedBy:'manual',snap:{at:iso(NOW-2*86400e3),said:{decision:'BET',onList:true}}},extra||{});
  const LOG=[ Object.assign(base('p1','+100','win'),{snap:{at:iso(NOW-2*86400e3),said:{decision:'BET',onList:true},ring:{n:6,of:6,miss:[]}}}),
    Object.assign(base('p2','+100','loss'),{snap:{at:iso(NOW-2*86400e3),said:{decision:'BET',onList:true},ring:{n:6,of:6,miss:[]}}}),
    Object.assign(base('f1','-110','win'),{snap:{at:iso(NOW-2*86400e3),said:{decision:'BET',onList:true},ring:{n:5,of:6,miss:['price 14m old: re-check']}}}),
    Object.assign(base('o1','-110','loss'),{snap:{at:iso(NOW-2*86400e3),said:{decision:'BET',onList:true},ring:{n:3,of:6,miss:['a','b','c']}}}),
    base('old','-110','win'),
    Object.assign(base('lk','+100','win'),{tier:'lucky',stake:1,snap:{at:iso(NOW-2*86400e3),said:{decision:'JUST MISSED',onList:false,tier:'lucky'}}}),
    Object.assign(base('hm1','+900','loss'),{tier:'hail',stake:1,snap:{at:iso(NOW-2*86400e3),said:{decision:'HAIL MARY',onList:false,tier:'hail'}}}),
    Object.assign(base('hm2','+900','win'),{tier:'hail',stake:1,snap:{at:iso(NOW-2*86400e3),said:{decision:'HAIL MARY',onList:false,tier:'hail'}}}) ];
  S=await open(b,'safe',{log:LOG});
  const rec=await S.p.evaluate(async()=>{ document.querySelector('.tab[data-view="v-perf"]').click(); await new Promise(z=>setTimeout(z,400));
    const T=[...document.querySelectorAll('#tierBody tbody tr')].map(tr=>[...tr.children].map(td=>td.innerText.replace(/\s+/g,' ').trim())), sc=scoreSet(logged), ds=dayStats()['2026-11-08'];
    return {T, note:(document.querySelector('#tierBody p')||{}).innerText||'', scN:sc.settled.length, scIds:sc.settled.map(x=>x.b.id).join(','), scNote:/Just missed and 🔮 Hail Marys \(3 logged\) are kept out/.test(document.getElementById('scoreBody').innerText), on:ds.on, against:ds.against, extra:ds.extra, staked:ds.staked}; });
  const row=n=>rec.T[n]||[];
  check('Performance › ◎ Rings and extras: Perfecta 2 bets 1–1–0, $0.00 on $4.00 (0.0%); 5 of 6: 1–0–0 +$1.82 on $2.00 (+91.0%, from the cents paid); other best bets 0–1–0 −$2.00', /Perfecta \(6 of 6\)/.test(row(0)[0]) && row(0)[1]==='2' && row(0)[3]==='1–1–0' && row(0)[4]==='$4.00' && /\$0\.00/.test(row(0)[5]) && row(1)[3]==='1–0–0' && row(1)[5]==='+$1.82' && row(1)[6]==='+91.0%' && row(2)[3]==='0–1–0' && row(2)[5]==='−$2.00', rec.T.slice(0,3));
  check('🍀 Just missed 1–0–0 +$1.00 on $1.00 (+100.0%); 🔮 Hail Marys 1–1–0: +$9.00 − $1.00 = +$8.00 on $2.00 (+400.0%); the bet with no ring recorded is counted apart', /Just missed/.test(row(3)[0]) && row(3)[3]==='1–0–0' && row(3)[5]==='+$1.00' && row(3)[6]==='+100.0%' && /Hail Marys/.test(row(4)[0]) && row(4)[3]==='1–1–0' && row(4)[5]==='+$8.00' && row(4)[6]==='+400.0%' && /1 other single .*no ring recorded/.test(rec.note), {T:rec.T.slice(3), note:rec.note});
  check('the Scorecard (the 1,000-bet test) judges the best bets only: 5 settled, the 3 extras are out and it says so; the money still counts them (day: $13.00 staked, 5 on, 0 against, 3 extra)', rec.scN===5 && rec.scIds==='p1,p2,f1,o1,old' && rec.scNote && rec.on===5 && rec.against===0 && rec.extra===3 && Math.abs(rec.staked-13)<1e-9, {scN:rec.scN, ids:rec.scIds, note:rec.scNote, on:rec.on, against:rec.against, extra:rec.extra, staked:rec.staked});
  check('no page errors (records)', !S.errs.length, S.errs); await S.ctx.close();
  // ================= layouts: cards and table, phone and computer =================
  for(const w of [390,1000,1280,1960]){ const X=await open(b,'clair',{w}); const ov=await X.p.evaluate(()=>({o:document.documentElement.scrollWidth-document.documentElement.clientWidth, cards:document.querySelectorAll('#placeCards .sc-card').length, bad:[...document.querySelectorAll('#placeCards .sc-card')].filter(c=>c.scrollWidth>c.clientWidth+1).length}));
    check(w+' px, Clairvoyant with every group: no sideways scroll, 11 cards (5 best, 1 just missed, 5 Hail Marys), none overflowing', ov.o<=0 && ov.cards===11 && ov.bad===0 && !X.errs.length, ov); await X.ctx.close(); }
  const Tb=await open(b,'clair',{cards:false, w:390}); const tb=await Tb.p.evaluate(()=>({groups:[...document.querySelectorAll('#tbody tr.group-row')].map(r=>r.innerText.replace(/\s+/g,' ')), chips:[...document.querySelectorAll('#tbody .x-chip')].map(c=>c.textContent), ring:[...document.querySelectorAll('#tbody .ring-chip')].map(c=>c.textContent), leg:document.querySelectorAll('#tbody .leg-tag').length, dec:[...document.querySelectorAll('#tbody .dec')].map(d=>d.textContent).filter(t=>/JUST MISSED|HAIL MARY/.test(t)), o:document.documentElement.scrollWidth-document.documentElement.clientWidth}));
  check('Cards off: the table lists the same groups in order (Place these, 🍀 Just missed, 🔮 Hail Marys, Watch) with chips, ◎ marks, the 🎟 tag and "🍀 JUST MISSED $1.00" / "🔮 HAIL MARY $1.00"', /^PLACE THESE/i.test(tb.groups[0]) && /JUST MISSED/i.test(tb.groups[1]) && /HAIL MARYS/i.test(tb.groups[2]) && /^WATCH/i.test(tb.groups[3]) && tb.chips.filter(t=>/HAIL MARY/.test(t)).length===5 && tb.chips.filter(t=>/JUST MISSED/.test(t)).length===1 && tb.ring.join('|')==='◎ PERFECTA|◎ 5 of 6|◎ 5 of 6' && tb.leg===1 && tb.dec.filter(t=>/🔮 HAIL MARY \$1\.00/.test(t)).length===5 && tb.dec.some(t=>/🍀 JUST MISSED \$1\.00/.test(t)) && tb.o<=0 && !Tb.errs.length, tb);
  await Tb.ctx.close(); await b.close();
  console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail?1:0);
})();
