// v5.24 (Easy, step 2): the Easy engine (pure functions, no screens). Boots the practice copy (tests/practice-copy.js, 35 invented rows, 16 invented bets,
// Sunday 2026-11-15 12:00 PM CT) and checks every easy* function against the app's own numbers: the God board, the God cards' text, the "Type this" ticket, the Bet log.
const path=require('path'), fs=require('fs');
const { chromium } = require('playwright');
const { openPractice } = require('./practice-copy.js');
const html=fs.readFileSync(process.argv[2]||path.join(__dirname,'..','index.html'),'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,700)); };
const open=async(b,o)=>{ const A=await openPractice(b,Object.assign({html,width:1280,height:900,settleMs:2500},o||{})); await A.page.waitForTimeout(300); await A.page.evaluate(()=>{ const M={'Luka Doncic':/^4\.5 Rebounds/,'Bam Adebayo':/^7\.5 Rebounds/,'Zach Charbonnet':/^3\.5 Receptions/,'Isiah Pacheco':/^10\.5 Rushing/}; window.gN=n=>lastRows.find(r=>r.name===n && (!M[n] || M[n].test(r.market))); }); return A; };   // gN: a row by name; some players have two rows on the invented board, the pick is the one named here
const names=L=>L.map(p=>p.r.name);

(async()=>{
 const b=await chromium.launch();

 // ---------- 1. the picks: equal the God board at 60%+, in its order; every number equals the God card ----------
 { const A=await open(b), p=A.page;
   const E=await p.evaluate(()=>{ const L=easyList(); return {total:L.total, picks:L.picks.map(x=>({key:x.key,name:x.r.name,chance:x.chance,edge:x.edge,nums:{st:x.nums.st,pay:x.nums.pay,back:x.nums.back,wins:x.nums.wins},sentence:x.sentence,fam:x.family,book:x.book,price:x.price})), waiting:L.waiting.length, ver:SCREENER_VERSION}; });
   check('1a: five picks, none waiting', E.picks.length===5 && E.waiting===0 && E.total===5, {n:E.picks.length, w:E.waiting});
   check('1b: the order is the God board order at 60%+ (Luka, Bam, Pacheco, Charbonnet, Lakers)', E.picks.map(x=>x.name).join('|')==='Luka Doncic|Bam Adebayo|Isiah Pacheco|Zach Charbonnet|Los Angeles Lakers', E.picks.map(x=>x.name));
   // the God board: the four tabs from 60% up, each tab's own cards ($ above 0), in the tab order Boring, Tranqui, Machin, Parejo
   const god=[]; for(const m of ['boring','tranqui','safe','parejo']){ await p.evaluate(m=>setMode(m),m); await p.waitForTimeout(450);
     god.push(...await p.evaluate(()=>[...document.querySelectorAll('#placeCards .sc-card:not(.sc-x)')].filter(c=>c.querySelector('.bet-btn')).map(c=>({pck:c.dataset.pck, nm:(c.querySelector('.pc-nm')||{}).childNodes[0].textContent.trim(), money:(c.querySelector('.sc-money')||{}).textContent, cv:(c.querySelector('.cv-her')||{}).textContent, ev:(c.querySelector('.sc-pill.ev b')||{}).textContent})))); }
   check('1c: the God board lists the same five, in the same order', god.map(g=>g.nm).join('|')===E.picks.map(x=>x.name).join('|'), god.map(g=>g.nm));
   check('1d: every pick is keyed by pxKey (the God card key), not by idx', E.picks.every((x,i)=>x.key===god[i].pck), E.picks.map(x=>x.key));
   const money=g=>{ const m=String(g.money).match(/^\$([\d.]+)wins \$([\d.]+)(?: · back \$([\d.]+))?/); return m?{st:+m[1],wins:+m[2],back:m[3]?+m[3]:null}:null; };
   E.picks.forEach((x,i)=>{ const g=god[i], m=money(g), r2=v=>Math.round(v*100)/100;
     check('1e: '+x.name+': stake, wins and back equal the God card text ('+g.money.slice(0,30)+')', m && r2(x.nums.st)===m.st && x.nums.wins===m.wins && (m.back==null || x.nums.back===m.back), {easy:x.nums, card:m});
     check('1f: '+x.name+': chance and edge equal the God card ('+g.cv+', '+g.ev+')', g.cv==='chance '+(x.chance*100).toFixed(1)+'%' && g.ev===(x.edge>=0?'+':'-')+(Math.abs(x.edge)*100).toFixed(1)+'%', {cv:g.cv, ev:g.ev, c:x.chance, e:x.edge}); });
   check('1g: no page errors', A.errors.length===0, A.errors); await A.ctx.close(); }

 // ---------- 2. who is left out ----------
 const cases=[
  ['Draw row', ()=>{ const r=gN('Los Angeles Lakers'); r.name='Draw'; r.side=''; refresh(); }, 'Los Angeles Lakers', 'Draw'],
  ['WNBA prop', ()=>{ const r=gN('Luka Doncic'); r.sport='WNBA'; refresh(); }, 'Luka Doncic'],
  ['whole-number prop line', ()=>{ const r=gN('Luka Doncic'); r.market='5 Rebounds'; refresh(); }, 'Luka Doncic'],
  ['pasted row', ()=>{ const r=gN('Luka Doncic'); r.src='paste:mev'; refresh(); }, 'Luka Doncic'],
  ['a price older than 12 hours', ()=>{ const r=gN('Zach Charbonnet'); r.loadedAt=new Date(Date.now()-13*3600e3).toISOString(); delete r.priceAt; refresh(); }, 'Zach Charbonnet'],
  ['AWOL (its book could not find it)', ()=>{ const r=gN('Bam Adebayo'); r.awol={book:r.book, note:'FanDuel: not found', at:Date.now()}; refresh(); }, 'Bam Adebayo'],
  ['already bet (logged through the app)', ()=>{ const r=gN('Isiah Pacheco'); addToLog(Object.assign({},r)); saveLog(); refresh(); }, 'Isiah Pacheco'],
  ['an order waiting (the row keeps its stake)', ()=>syncOrders(true), 'Zach Charbonnet'],
  ['a book the person does not have (FanDuel only)', ()=>{ document.getElementById('books').value='FanDuel'; refresh(); }, 'Luka Doncic|Isiah Pacheco|Los Angeles Lakers'],
  ['a price past her most that the board has not re-audited yet', ()=>{ const r=gN('Bam Adebayo'); r.offeredRaw='-300'; r.offeredProb=toProb('-300'); }, 'Bam Adebayo'],
  ['the game started', ()=>{ const r=gN('Isiah Pacheco'); r.gameInfo.state='in'; refresh(); }, 'Isiah Pacheco'],
 ];
 for(const [label, mut, gone, extra] of cases){ const A=await open(b), p=A.page;
   const before=await p.evaluate(()=>easyList().picks.map(x=>x.r.name));
   if(/order waiting/.test(label)) await A.ctx.route(u=>/0xbeta|workers\.dev/.test(u.hostname)&&u.pathname==='/mine/orders', r=>r.fulfill({status:200, contentType:'application/json', headers:{'access-control-allow-origin':'*','access-control-allow-credentials':'true','access-control-allow-headers':'*'}, body:JSON.stringify({orders:[{book:'kalshi',action:'buy',side:'no',price:0.5,qty:3,title:'Charbonnet receptions',bet:{kind:'prop',sport:'NFL',player:'Zach Charbonnet',statText:'Receptions',line:3.5,side:'U',start:'2026-11-16T01:20:00.000Z'}}]})}));   // the Worker reports an open Kalshi order on this bet
   await p.evaluate(mut); await p.waitForTimeout(900);
   const after=await p.evaluate(()=>{ const L=easyList(); return {names:L.picks.map(x=>x.r.name), waiting:L.waiting.length, stakeKept:(()=>{ const r=gN('Zach Charbonnet'); return r?{stake:r.stake, wait:!!r.waitOrder}:null; })()}; });
   const goneList=gone.split('|'), nm=extra||gone;
   check('2: '+label+' → not in the list, the rest stay ('+after.names.length+' left)', before.length===5 && goneList.every(g=>!after.names.includes(g) && !after.names.includes(nm)) && after.names.length===5-goneList.length, {before, after:after.names});
   if(/order waiting/.test(label)) check('2: the order-waiting row still has a stake (stake>0 alone would have shown it)', after.stakeKept && after.stakeKept.stake>0 && after.stakeKept.wait, after.stakeKept);
   if(/FanDuel only/.test(label)) check('2: FanDuel only keeps exactly Bam and Charbonnet', after.names.join('|')==='Bam Adebayo|Zach Charbonnet', after.names);
   check('2: '+label+': no page errors', A.errors.length===0, A.errors); await A.ctx.close(); }

 // ---------- 3. the words ----------
 { const A=await open(b), p=A.page;
   const R=await p.evaluate(()=>{
     const base=gN('Luka Doncic'), lak=gN('Los Angeles Lakers'), kc=gN('Isiah Pacheco'), mia=gN('Bam Adebayo');
     const mk=(src,o)=>Object.assign({}, src, o);
     const rows=[
      ['Luka over 4.5 rebounds', mk(base,{}), 'Luka Doncic (Dallas) grabs 5 or more rebounds.'],
      ['Luka under 3.5 rebounds', mk(base,{market:'3.5 Rebounds', side:'U'}), 'Luka Doncic (Dallas) grabs 3 or fewer rebounds.'],
      ['Pacheco rushing attempts', mk(kc,{}), 'Isiah Pacheco (Kansas City) runs with the ball 11 or more times.'],
      ['Charbonnet under 3.5 receptions', mk(gN('Zach Charbonnet'),{}), 'Zach Charbonnet (Seattle) catches 3 or fewer passes.'],
      ['Lakers moneyline', mk(lak,{}), 'The Los Angeles Lakers win their game against Golden State.'],
      ['Draymond over 0.5 steals', mk(lak,{name:'Draymond Green', team:'GS', kind:'prop', market:'0.5 Steals', side:'O'}), 'Draymond Green (Golden State) gets at least 1 steal.'],
      ['Draymond under 0.5 steals', mk(lak,{name:'Draymond Green', team:'GS', kind:'prop', market:'0.5 Steals', side:'U'}), 'Draymond Green (Golden State) gets no steals.'],
      ['an ambiguous city says the whole name', mk(lak,{name:'Anthony Davis', team:'LAL', kind:'prop', market:'12.5 Rebounds', side:'O'}), 'Anthony Davis (Los Angeles Lakers) grabs 13 or more rebounds.'],
      ['points + rebounds + assists', mk(base,{market:'38.5 Points + Rebounds + Assists'}), 'Luka Doncic (Dallas) gets 39 or more points, rebounds and assists added together.'],
      ['receiving yards', mk(kc,{market:'54.5 Receiving Yards', side:'O'}), 'Isiah Pacheco (Kansas City) gains 55 or more yards catching passes.'],
      ['hockey shots on goal', mk(lak,{sport:'NHL', name:'Nathan MacKinnon', team:'GS', kind:'prop', market:'2.5 Shots On Goal', side:'O'}), 'Nathan MacKinnon (Golden State) takes 3 or more shots on goal.'],
      ['spread -2.5', mk(lak,{kind:'spread', market:'-2.5 Spread', side:''}), 'The Los Angeles Lakers win their game by 3 or more points.'],
      ['spread +4.5', mk(lak,{kind:'spread', market:'+4.5 Spread', side:''}), 'The Los Angeles Lakers win their game, or lose by 4 or fewer points.'],
      ['hockey spread -1.5 says goals', mk(lak,{sport:'NHL', kind:'spread', market:'-1.5 Spread', side:''}), 'The Los Angeles Lakers win their game by 2 or more goals.'],
      ['total under', mk(lak,{kind:'total', name:'GS @ LAL', market:'224.5 Total', side:'U'}), 'The Golden State Warriors and Los Angeles Lakers score 224 or fewer points together.'],
      ['total over (baseball says runs)', mk(lak,{sport:'MLB', kind:'total', name:'GS @ LAL', market:'8.5 Total', side:'O'}), 'The Golden State Warriors and Los Angeles Lakers score 9 or more runs together.'],
      ['a name with & and <', mk(base,{name:'A&B <i>'}), 'A&amp;B &lt;i&gt; (Dallas) grabs 5 or more rebounds.'],
     ];
     const out=rows.map(([n,r,exp])=>{ const esc=easySentence(r), raw=easySentence(r,true); return {n, got:esc, exp, ok:esc===exp || (n==='a name with & and <' ? esc===exp : raw===exp)}; });
     const nulls=[
      ['WNBA prop', mk(base,{sport:'WNBA'})], ['Threes Made', mk(base,{market:'3.5 Threes Made'})], ['Total Bases (MLB)', mk(base,{sport:'MLB', market:'1.5 Total Bases'})], ['MLB strikeouts', mk(base,{sport:'MLB', market:'5.5 Strikeouts'})],
      ['whole-number prop line', mk(base,{market:'5 Rebounds'})], ['whole-number total', mk(lak,{kind:'total', name:'GS @ LAL', market:'225 Total', side:'U'})], ['whole-number spread', mk(lak,{kind:'spread', market:'-3 Spread', side:''})], ['pick-em spread', mk(lak,{kind:'spread', market:'0 Spread', side:''})],
      ['quarter line', mk(base,{market:'1.5 1st Quarter Points', side:'O'})], ['alternate line', mk(base,{market:'10.5 Alt Rebounds'})], ['half line', mk(base,{market:'12.5 1st Half Points'})], ['power play', mk(lak,{sport:'NHL', market:'0.5 Power Play Points', kind:'prop', side:'O', name:'X', team:'GS'})],
      ['parlay leg', mk(base,{kind:'parlay'})], ['Draw row', mk(lak,{name:'Draw', side:''})], ['soccer moneyline', mk(lak,{sport:'MLS'})], ['tennis moneyline', mk(lak,{sport:'TENNIS'})], ['pasted row', mk(base,{src:'paste:mev'})],
      ['Anytime TD', mk(kc,{market:'Anytime TD', side:'O'})], ['double double', mk(base,{market:'0.5 Double Double', side:'O'})], ['no side', mk(base,{side:''})], ['under 0.5 attempts (no times)', mk(kc,{market:'0.5 Rushing Attempts', side:'U'})], ['a team we cannot find', mk(lak,{team:'ZZZ', name:'Zed Nobody', kind:'moneyline', gameInfo:undefined})],
      ['interceptions (the passer is not known)', mk(kc,{market:'0.5 Interceptions', side:'O'})]];
     const nul=nulls.map(([n,r])=>({n, fam:easyFamily(r), s:easySentence(r)}));
     const cnt=[[4.5,'O'],[3.5,'U'],[0.5,'O'],[0.5,'U'],[1.5,'U'],[25,'O'],[4.5,''],[-1,'O']].map(([l,s])=>{ const c=easyCount(l,s); return c?c.text:null; });
     return {out, nul, cnt}; });
   R.out.forEach(x=>check('3a: sentence: '+x.n, x.got===x.exp, {got:x.got}));
   R.nul.forEach(x=>check('3b: not worded (null): '+x.n, x.fam===null && x.s===null || (x.n==='a team we cannot find' && x.s===null), {fam:x.fam&&x.fam.id, s:x.s}));
   check('3c: easyCount: Over 4.5 = 5 or more; Under 3.5 = 3 or fewer; Over 0.5 = at least 1; Under 0.5 = no; Under 1.5 = 1 or fewer; a whole number, no side and a negative line = null', JSON.stringify(R.cnt)===JSON.stringify(['5 or more','3 or fewer','at least 1','no','1 or fewer',null,null,null]), R.cnt);
   const G=await p.evaluate(()=>{ const r=gN('Luka Doncic'), pa=gN('Isiah Pacheco'), dav=gN('Anthony Davis'); return {luka:easyGlossKeys(r), pa:easyGlossKeys(pa), dav:easyGlossKeys(dav), reb:easyGloss('rebound'), steal:easyGloss('steal'), rush:easyGloss('rushing attempt'), rec:easyGloss('reception'), none:easyGloss('nonsense'), lak:easyGlossKeys(gN('Los Angeles Lakers')), allHave:[].concat(easyGlossKeys(r),easyGlossKeys(pa),easyGlossKeys(dav)).every(k=>!!easyGloss(k)), contadora:easyGloss('la-contadora')}; });
   check('3d: gloss keys: Luka rebound; Pacheco rushing attempt; Lakers moneyline; Polymarket adds share and limit order; every key has a line', G.luka.join()==='rebound' && G.pa.join()==='rushing attempt' && G.lak.join()==='moneyline' && G.dav.join()==='rebound,share,limit order' && G.allHave && G.none===null, G);
   check('3e: gloss lines are plain (rebound, steal, rushing attempt, reception, La Contadora)', /missed shot/.test(G.reb) && /away from the other team/.test(G.steal) && /handed the ball/.test(G.rush) && /catching a pass/.test(G.rec) && /Spanish for the accountant/.test(G.contadora), G);
   check('3f: no page errors', A.errors.length===0, A.errors); await A.ctx.close(); }

 // ---------- 4. never worse than: strict rounding ----------
 { const A=await open(b), p=A.page;
   const S=await p.evaluate(()=>{ const f=(mx,c)=>{ const s=easyStrictFrom(mx,!!c); return s&&{t:s.text,v:s.value,imp:s.implied,nw:s.nextWorse.text}; };
     const impl=a=>a>0?100/(a+100):-a/(-a+100);
     const bound=[]; [253,358,216,200,152,110,500].forEach(N=>{ const mx=N/(N+100); bound.push({N, exact:f(mx), below:f(mx-1e-9), above:f(mx+1e-9)}); });
     const hand={'78.2% (-358.72)':f(0.782), '71.7% (-253.36)':f(0.717), '68.4% (-216.46)':f(0.684), '66.7% (-200.3)':f(0.667), '60.4% (-152.53)':f(0.604), '45.37%':f(0.4537), '50%':f(0.5), '58.9c':f(0.589,true), '57.99c':f(0.5799,true), '40%':f(0.4), '53.7%':f(0.537), '2%':f(0.02), '98%':f(0.98)};
     let bad=[], n=0; let seed=12345; const rnd=()=>{ seed=(seed*1664525+1013904223)%4294967296; return seed/4294967296; };
     for(let i=0;i<20000;i++){ const mx=0.02+rnd()*0.96; const s=easyStrictFrom(mx,false); n++;
       const okAcc = s.kind==='american' && (s.value>0 ? 100 <= mx*(s.value+100) : -s.value*(1-mx) <= 100*mx);   /* implied <= most, by cross-multiplying (not the function's own formula) */
       const w=s.nextWorse.value, okWorse = w>0 ? 100 > mx*(w+100) : -w*(1-mx) > 100*mx;                           /* one step looser is over her most */
       const c=easyStrictFrom(mx,true), okC = c ? (c.value/100<=mx && (c.value+1)/100>mx) : mx<0.01;
       if(!(okAcc && okWorse && okC)) bad.push({mx, s:s.text, w:s.nextWorse.text, c:c&&c.text}); }
     return {bound, hand, n, bad:bad.slice(0,5), nbad:bad.length}; });
   check('4a: boundary both ways: a most that is exactly -N keeps -N; a hair under it gives the price one step stricter; a hair over keeps -N (until -(N+1) fits)', S.bound.every(x=>x.exact.v===-x.N && x.below.v===-(x.N-1) && x.above.v===-x.N && x.below.imp<=x.N/(x.N+100)), S.bound);
   check('4b: hand values: 78.2% is -358 (never -359), 71.7% is -253, 68.4% -216, 66.7% -200, 60.4% -152; 45.37% is +121; 50% is +100', S.hand['78.2% (-358.72)'].t==='-358' && S.hand['71.7% (-253.36)'].t==='-253' && S.hand['68.4% (-216.46)'].t==='-216' && S.hand['66.7% (-200.3)'].t==='-200' && S.hand['60.4% (-152.53)'].t==='-152' && S.hand['45.37%'].t==='+121' && S.hand['50%'].t==='+100' && S.hand['58.9c'].t==='58¢' && S.hand['57.99c'].t==='57¢', S.hand);
   check('4c: property test, '+S.n+' random exact values: the accepted price never charges more than her most, one step looser always does, cents round down', S.nbad===0, {nbad:S.nbad, bad:S.bad});
   const P=await p.evaluate(()=>{ const L=easyList().picks; const o={}; L.forEach(x=>{ o[x.r.name]={t:x.strict.text, mx:easyMostOf(x.r), imp:x.strict.implied, shown:fmtOdds(Math.round(americanOf(easyMostOf(x.r))))}; });
     const dav=gN('Anthony Davis'), mc=gN('Christian McCaffrey'), cfg=cfgRead();
     const ph=polyHow(dav, +dav.stake, easyMostOf(dav)), kh=kalshiHow(mc, +mc.stake, mc.offeredProb, easyMostOf(mc));
     return {o, dav:{s:easyStrictPrice(dav).text, lim:ph.lim}, mc:{s:easyStrictPrice(mc).text, lim:kh.lim}}; });
   check('4d: the five picks on the practice board: -359, -252, -216, -200, -152 (each at or under her exact most)', P.o['Luka Doncic'].t==='-359' && P.o['Bam Adebayo'].t==='-252' && P.o['Isiah Pacheco'].t==='-216' && P.o['Zach Charbonnet'].t==='-200' && P.o['Los Angeles Lakers'].t==='-152' && Object.values(P.o).every(x=>x.imp<=x.mx+1e-12), P.o);
   check('4e: the God tile rounds to the nearest price, so it can sit past her most (Bam: tile -253, her most allows -252; Luka tile -359 fits)', P.o['Bam Adebayo'].shown==='-253' && P.o['Luka Doncic'].shown==='-359' , {bam:P.o['Bam Adebayo'], luka:P.o['Luka Doncic']});
   check('4f: exchanges: the limit in whole cents equals the ticket\'s own limit (Polymarket 50, Kalshi 48)', P.dav.s==='50¢' && P.dav.lim===50 && P.mc.s==='48¢' && P.mc.lim===48, P);
   check('4g: no page errors', A.errors.length===0, A.errors); await A.ctx.close(); }

 // ---------- 5. the edge lines, the money lines, the ticket numbers ----------
 { const A=await open(b), p=A.page;
   const E=await p.evaluate(()=>{ const L=easyList().picks, o={}; L.forEach(x=>{ const e=easyEdgeLines(x.r), f=easyFairText(x.r); o[x.r.name]={l1:e.line1, l2:e.line2, f, be:easyBreakEven(x.r), pts:e.points, chance:e.chance, assumes:e.assumes, edge:e.edge}; });
     const dav=gN('Anthony Davis'), mc=gN('Christian McCaffrey');
     const nums=(r)=>{ const n=easyNums(r); return {ok:n.ok,st:n.st,pay:n.pay,back:n.back,wins:n.wins,shares:n.shares,limit:n.limit,cost:n.cost,payout:n.payout}; };
     return {o, dav:{nums:nums(dav), e:easyEdgeLines(dav), f:easyFairText(dav), ph:polyHow(dav,+dav.stake,easyMostOf(dav)), fee:feeRate(dav.book,dav.offeredProb,cfgRead().fees), ap:dav.actProb, p:dav.offeredProb}, mc:{nums:nums(mc), kh:kalshiHow(mc,+mc.stake,mc.offeredProb,easyMostOf(mc)), f:easyFairText(mc), contracts:mc.contracts}}; });
   const luka=E.o['Luka Doncic'];
   check('5a: Luka edge line 1 and 2 (79.4% vs 75.0%, 4.4 points above; Edge +5.9%, about 5.9 cents back for each $1)', luka.l1==='La Contadora’s chance (79.4%) is 4.4 points above what the price assumes (75.0%).' && luka.l2==='Edge +5.9%: about 5.9 cents back for each $1 put in, on average, over many bets.', luka);
   check('5b: the points are the difference of the two numbers shown, for all five picks', Object.values(E.o).every(x=>Math.abs((x.chance-x.assumes)-x.pts)<1e-9 && x.l1.includes(Math.abs(x.pts).toFixed(1)+' points above') && !/gap is the edge/i.test(x.l1+x.l2)), Object.values(E.o).map(x=>x.l1));
   check('5c: the edge is La Contadora\'s EV (Bam +4.3, Pacheco +4.1, Charbonnet +3.4, Lakers +2.2) and not the difference of the chances', E.o['Bam Adebayo'].l2.startsWith('Edge +4.3%') && E.o['Isiah Pacheco'].l2.startsWith('Edge +4.1%') && E.o['Zach Charbonnet'].l2.startsWith('Edge +3.4%') && E.o['Los Angeles Lakers'].l2.startsWith('Edge +2.2%') && E.o['Bam Adebayo'].pts===3, {bam:E.o['Bam Adebayo'].l1+' '+E.o['Bam Adebayo'].l2});
   check('5d: the money line: "-300 means you bet $300 to win $100. Here: bet $10.00 to win $3.33 (you get $13.33 back)." + the smaller-minus rule from the computed price', luka.f.mean==='-300 means you bet $300 to win $100.' && luka.f.here==='Here: bet $10.00 to win $3.33 (you get $13.33 back).' && /smaller minus number is a better price/.test(luka.f.rule) && /-359/.test(luka.f.rule), luka.f);
   check('5e: Lakers money line says $8.44 to win $5.62, back $14.06 (the God card\'s own arithmetic)', E.o['Los Angeles Lakers'].f.here==='Here: bet $8.44 to win $5.62 (you get $14.06 back).', E.o['Los Angeles Lakers'].f.here);
   const d=E.dav;
   check('5f: Polymarket US: easyNums are the ticket\'s (12 whole shares, limit 50, most it can cost $6.21, pays $12.00), not the God money line (back $12.25)', d.nums.ok && d.nums.shares===d.ph.shares && d.nums.shares===12 && d.nums.limit===50 && d.nums.cost===6.21 && d.nums.payout===12 && d.nums.back===12 && d.nums.back!==12.25, d);
   check('5g: exchange edge line: the price assumed includes the fee (50¢ x (1 + 3.475%) = 51.7%), chance 53.1%', d.e.assumes===+((d.p*(1+d.fee))*100).toFixed(1) && d.e.assumes===51.7 && d.e.line1.includes('(51.7%)') && d.e.line2.startsWith('Edge +2.5%'), d.e);
   check('5h: Kalshi: shares, limit, most it can cost and pays equal kalshiHow and the God card\'s own Max cost $5.69 and Shares 11.43', E.mc.nums.shares===11.43 && E.mc.nums.shares===E.mc.contracts && E.mc.nums.limit===48 && E.mc.nums.cost===5.69 && E.mc.nums.payout===11.43, E.mc);
   check('5i: exchange fair text: a share costs 48¢ and pays $1; shares cost at most $5.69 and pay $11.43; limit rule uses 48¢', /costs 48¢ and pays \$1/.test(E.mc.f.mean) && /11\.43 shares cost at most \$5\.69/.test(E.mc.f.here) && /limit of 48¢ or lower/.test(E.mc.f.rule), E.mc.f);
   // the God cards' own ticket text (Dado tab holds both exchange picks)
   await p.evaluate(()=>setMode('dado')); await p.waitForTimeout(450);
   const T=await p.evaluate(()=>{ const t={}; document.querySelectorAll('#placeCards .sc-card').forEach(c=>{ const k=c.querySelector('.sc-tkt'); if(k) t[c.querySelector('.pc-nm').childNodes[0].textContent.trim()]=k.textContent; }); return t; });
   check('5j: the God ticket says Shares 12 / Cost ≤ $6.21 (Polymarket) and Shares 11.43 / Max cost $5.69 (Kalshi): the same numbers as easyNums', /Shares 12 \(whole shares\)/.test(T['Anthony Davis']) && /Cost ≤ \$6\.21/.test(T['Anthony Davis']) && /Limit 50¢/.test(T['Anthony Davis']) && /Shares 11\.43/.test(T['Christian McCaffrey']) && /Max cost \$5\.69/.test(T['Christian McCaffrey']) && /Limit 48¢/.test(T['Christian McCaffrey']), T);
   check('5k: no page errors', A.errors.length===0, A.errors); await A.ctx.close(); }

 // ---------- 6. Type this ----------
 { const A=await open(b), p=A.page;
   const Y=await p.evaluate(()=>{ const g=n=>gN(n);
     const dk=easyTypeThis(g('Luka Doncic')), ml=easyTypeThis(g('Los Angeles Lakers')), po=easyTypeThis(g('Anthony Davis')), ka=easyTypeThis(g('Christian McCaffrey')), nv=easyTypeThis(g('James Cook')), un=easyTypeThis(g('Zach Charbonnet')), sp=easyTypeThis(g('Miami Heat')), tot=easyTypeThis(g('KC @ DEN'));
     return {dk, ml, po, ka, nv, un, sp, tot, ex:easyExpires(g('Anthony Davis'))}; });
   check('6a: a sportsbook pick has five steps: open the app, pick the side, type the stake, check the price, place it', Y.dk.kind==='book' && Y.dk.steps.length===5 && /^Open DraftKings and find Luka Doncic/.test(Y.dk.steps[0]) && /“Over 4\.5”/.test(Y.dk.steps[1]) && /Rebounds/.test(Y.dk.steps[1]) && /\$10\.00/.test(Y.dk.steps[2]) && /-359 or a smaller minus number/.test(Y.dk.steps[3]) && /showed -300/.test(Y.dk.steps[3]) && /I placed it/.test(Y.dk.steps[4]) && /does not place bets/.test(Y.dk.none), Y.dk);
   check('6b: a moneyline says the team, a spread the team and the line, a total the game and the side', /pick the “Moneyline” bet|“Moneyline” bet and choose “Los Angeles Lakers”/.test(Y.ml.steps[1]) && /“Spread” bet and choose “Miami Heat \+4\.5”/.test(Y.sp.steps[1]) && /“Game total” bet and choose “Under 44\.5”/.test(Y.tot.steps[1]) && /Kansas City Chiefs at Denver Broncos/.test(Y.tot.steps[0]), {ml:Y.ml.steps[1], sp:Y.sp.steps[1], tot:Y.tot.steps[1], f:Y.tot.steps[0]});
   const lab=x=>x.rows.map(r=>r.label);
   check('6c: Polymarket rows in the book\'s order: Order type Limit, Side YES on 13+, Limit price 50¢, Shares 12, Most it can cost $6.21, Pays $12.00, Expires before 6:30 PM CT', lab(Y.po).join('|')==='Order type|Side|Limit price|Shares|Most it can cost|Pays if it happens|Expires' && Y.po.rows[0].value==='Limit' && Y.po.rows[1].value==='YES on 13+' && Y.po.rows[2].value==='50¢' && Y.po.rows[3].value==='12' && Y.po.rows[4].value==='$6.21' && Y.po.rows[5].value==='$12.00' && Y.po.rows[6].value==='before 6:30 PM CT' && /1\.4|13 or more rebounds/.test(Y.po.rows[1].note), Y.po.rows);
   check('6d: Kalshi rows: Order type, Side YES, Shares 11.43, Limit price 48¢ (49.7¢ with the fee), Max cost $5.69, Pays $11.43, Expires 7:20 PM CT', lab(Y.ka).join('|')==='Order type|Side|Shares|Limit price|Most it can cost|Pays if it happens|Expires' && Y.ka.rows[1].value==='YES' && Y.ka.rows[2].value==='11.43' && Y.ka.rows[3].value==='48¢' && /49\.7¢/.test(Y.ka.rows[3].note) && Y.ka.rows[4].value==='$5.69' && Y.ka.rows[5].value==='$11.43' && Y.ka.rows[6].value==='before 7:20 PM CT', Y.ka.rows);
   check('6e: the In money line states the cost, the payout, the profit and the loss', Y.po.inMoney==='In money: pay at most $6.21 now. If it happens you get $12.00 back (a profit of $5.79). If it does not, you lose the $6.21.', Y.po.inMoney);
   check('6f: the exchange side note says what the button means in plain words; Expires has its Good til canceled note', /^This button means: Anthony Davis \(Los Angeles Lakers\) grabs 13 or more rebounds\.$/.test(Y.po.rows[1].note) && /Good ’til canceled/.test(Y.po.rows[6].note) && Y.ex.text==='before 6:30 PM CT', {n:Y.po.rows[1].note, e:Y.ex});
   check('6g: a Novig pick (no ticket at the app) gets the five steps in dollars; an Under prop says Under', Y.nv.kind==='book' && Y.nv.steps.length===5 && /Open Novig/.test(Y.nv.steps[0]) && /“Under 58\.5”/.test(Y.nv.steps[1]) && /\$10\.00/.test(Y.nv.steps[2]) && /Under 3\.5/.test(Y.un.steps[1]), {nv:Y.nv.steps, un:Y.un.steps[1]});
   check('6h: no page errors', A.errors.length===0, A.errors); await A.ctx.close(); }

 // ---------- 7. a price that moved: remembered, then "not worth it now" ----------
 { const A=await open(b), p=A.page;
   const M=await p.evaluate(async()=>{ const rem=easyRemember(), out={rem};
     const bam=gN('Bam Adebayo'); out.before=easyMovedList().length;
     bam.offeredRaw='-260'; bam.offeredProb=toProb('-260'); refresh(); out.afterNames=easyList().picks.map(x=>x.r.name); out.moved=easyMovedList().map(m=>({s:m.sentence, o:m.oldPrice, n:m.newPrice, be:+(m.breakEven*100).toFixed(1), most:+(m.most*100).toFixed(1), why:m.why, book:m.book}));
     out.stillRemembered=Object.keys(easySeen()).length;
     return out; });
   check('7a: five picks remembered; nothing moved before the move', M.rem===5 && M.before===0, M);
   check('7b: Bam -230 → -260 leaves the list, the other four stay', M.afterNames.join('|')==='Luka Doncic|Isiah Pacheco|Zach Charbonnet|Los Angeles Lakers', M.afterNames);
   check('7c: the moved list names Bam: old price -230, new price -260, needs 72.2% but her most is 71.7%, "Not worth it now"', M.moved.length===1 && /Bam Adebayo \(Miami\) grabs 8 or more rebounds\./.test(M.moved[0].s) && M.moved[0].o==='-230' && M.moved[0].n==='-260' && M.moved[0].be===72.2 && M.moved[0].most===71.7 && M.moved[0].why==='Not worth it now', M.moved);
   const B2=await p.evaluate(async()=>{ const g=n=>gN(n);
     // a price that comes back inside her most is a pick again and leaves the moved list
     const bam=g('Bam Adebayo'); bam.offeredRaw='-233'; bam.offeredProb=toProb('-233'); refresh(); const back=easyList().picks.map(x=>x.r.name).includes('Bam Adebayo'), movedBack=easyMovedList().length;
     // a pick that is placed is never "moved"; Charbonnet is moved while Luka is placed
     const luka=g('Luka Doncic'); const res=await easyPlacedSave(luka); const ch=g('Zach Charbonnet'); ch.offeredRaw='-260'; ch.offeredProb=toProb('-260'); refresh();
     const luka2=g('Luka Doncic'); luka2.offeredRaw='-420'; luka2.offeredProb=toProb('-420'); refresh();
     const mv=easyMovedList().map(m=>m.r.name);
     return {back, movedBack, saved:res.saved, mv}; });
   check('7d: back inside her most (-233) it is a pick again and not "moved"', B2.back && B2.movedBack===0, B2);
   check('7e: a pick that was placed is never listed as moved, even when its price moves; one not placed is', B2.saved===true && B2.mv.join('|')==='Zach Charbonnet', B2);
   check('7f: no page errors', A.errors.length===0, A.errors); await A.ctx.close(); }

 // ---------- 8. I placed it: identical to a real "I bet this" tap; exchange changes open the full form; Undo ----------
 const strip=o=>{ const j=JSON.parse(JSON.stringify(o)); const walk=(x)=>{ if(Array.isArray(x)) return x.map(walk); if(x && typeof x==='object'){ const y={}; Object.keys(x).sort().forEach(k=>{ y[k]=walk(x[k]); }); return y; } if(typeof x==='string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d/.test(x) && !/^\d{4}-\d\d-\d\dT00:00:00/.test(x)) return '<time>'; return x; };
   const w=walk(j); delete w.id; return w; };
 const flat=(o,pre,out)=>{ out=out||{}; if(Array.isArray(o)||(o&&typeof o==='object')){ Object.keys(o).forEach(k=>flat(o[k],(pre?pre+'.':'')+k,out)); } else out[pre]=o; return out; };
 const realTap=async(p,name,mode)=>{ await p.evaluate(m=>setMode(m),mode); await p.waitForTimeout(450);
   const idx=await p.evaluate(n=>String(gN(n).idx),name); const n0=await p.evaluate(()=>logged.length);
   await p.click('#placeCards .sc-card[data-idx="'+idx+'"] .bet-btn'); await p.waitForSelector('#placeCards .editor .eb-save');
   await p.waitForFunction(()=>{ const l=document.querySelector('#placeCards .editor .eb-live'); return !l || !/checking/.test(l.textContent); },null,{timeout:8000}); await p.waitForTimeout(200);
   await p.click('#placeCards .editor .eb-save'); await p.waitForFunction(k=>logged.length>k,n0,{timeout:5000}); await p.waitForTimeout(200);
   return p.evaluate(()=>JSON.parse(JSON.stringify(logged[logged.length-1]))); };
 for(const [label,name,mode] of [['DraftKings (Luka Doncic)','Luka Doncic','boring'],['Novig (James Cook)','James Cook','dado']]){
   const A1=await open(b), A2=await open(b);
   await A1.page.evaluate(m=>setMode(m),mode); await A1.page.waitForTimeout(450);
   const R=await A1.page.evaluate(async n=>{ const r=gN(n), n0=logged.length; const res=await easyPlacedSave(r); return {res, n0, n1:logged.length, rec:JSON.parse(JSON.stringify(logged[logged.length-1])), inLog:logged.some(x=>x.id===res.id), prior:!!gN(n).prior, inList:easyList().picks.some(x=>x.r.name===n), hosts:document.querySelectorAll('.pcard .editor').length}; }, name);
   const real=await realTap(A2.page,name,mode);
   const a=flat(strip(R.rec)), c=flat(strip(real)), keys=[...new Set(Object.keys(a).concat(Object.keys(c)))], diff=keys.filter(k=>JSON.stringify(a[k])!==JSON.stringify(c[k]));
   check('8a: '+label+': Easy "I placed it" saves ('+R.res.saved+') and adds exactly one bet', R.res.saved===true && R.n1===R.n0+1 && R.inLog && R.res.id===R.rec.id, R.res);
   check('8b: '+label+': the saved record is identical to a real "I bet this" tap with no edits ('+keys.length+' fields compared; ids and clock times aside)', diff.length===0 && keys.length>60, {fields:keys.length, diff:diff.map(k=>[k,a[k],c[k]]).slice(0,8)});
   check('8c: '+label+': the row is now ALREADY BET and the pick left the list; no hidden form left behind', R.prior===true && R.inList===false && R.hosts===0, {prior:R.prior, inList:R.inList, hosts:R.hosts});
   const U=await A1.page.evaluate(async(n)=>{ const id=logged[logged.length-1].id, before=JSON.stringify(logged.slice(0,-1)), rb=removedBets.length; const u=easyUndo(id); const again=easyUndo(id);
     return {u, again, same:JSON.stringify(logged)===before, n:logged.length, rb:removedBets.length, rb0:rb, ls:JSON.parse(localStorage.getItem('mbev.log')).length, lsRm:JSON.parse(localStorage.getItem('mbev.removed')||'[]').length, prior:!!gN(n).prior, removedFlag:!!gN(n).removed, inList:easyList().picks.some(x=>x.r.name===n)||easyList().waiting.some(x=>x.r.name===n), scAppr:scApproved(gN(n))}; }, name);
   check('8d: '+label+': Undo removes the bet (log and storage back to 16, nothing left on the removed list) and a second Undo does nothing', U.u.removed===true && U.again.removed===false && U.same && U.n===16 && U.ls===16 && U.rb===U.rb0 && U.lsRm===U.rb0, U);
   check('8e: '+label+': after Undo the row is bettable again (no ALREADY BET, no BET REMOVED)'+(name==='Luka Doncic'?' and back on Today':''), U.prior===false && U.removedFlag===false && U.scAppr===true && (name!=='Luka Doncic' || U.inList), U);
   check('8f: '+label+': no page errors', A1.errors.length===0 && A2.errors.length===0, A1.errors.concat(A2.errors)); await A1.ctx.close(); await A2.ctx.close(); }
 { // exchange picks that need a look: a changed live price, a thin book, a bet already on the board, a started game
   const A=await open(b), p=A.page;
   await p.evaluate(()=>setMode('dado')); await p.waitForTimeout(450);
   const X=await p.evaluate(async()=>{ const host=document.createElement('div'); host.className='pcard'; document.body.appendChild(host); const n0=logged.length;
     const dav=gN('Anthony Davis'), mc=gN('Christian McCaffrey');
     const a=await easyPlacedSave(dav,{host}); const formOpen=!!host.querySelector('.editor'); host.remove();
     const b2=await easyPlacedSave(mc); const cook=gN('James Cook');
     const c=await easyPlacedSave('NO SUCH KEY');
     const aStart=gN('Isiah Pacheco'); aStart.gameInfo.state='in'; const d=await easyPlacedSave(aStart);
     return {a,formOpen,b2,c,d,n1:logged.length,n0, hosts:document.querySelectorAll('.pcard .editor').length}; });
   check('8g: Polymarket US row: the live price differs from the card, so nothing is saved and the full bet form opens in the host', X.a.saved===false && X.a.reason==='moved' && X.a.formOpen===true && X.formOpen===true && /live price is 50\.5% \(card 50\.0%\)/.test(X.a.msg), X.a);
   check('8h: Kalshi row with a changed live price: nothing saved, reason moved', X.b2.saved===false && X.b2.reason==='moved' && X.n1===X.n0, X.b2);
   check('8i: an unknown pick and a game that started save nothing (gone / notpick)', X.c.reason==='gone' && X.d.reason==='notpick' && X.n1===X.n0 && X.hosts===0, {c:X.c, d:X.d});
   // a thin book: the live read says its book is thin
   await A.ctx.route(u=>/0xbeta|workers\.dev/.test(u.hostname)&&u.pathname==='/live', async route=>{ const u=new URL(route.request().url()); let bets=[]; try{ bets=JSON.parse(u.searchParams.get('bets')||'[]'); }catch(e){}
     const R={}; bets.forEach(d=>{ R[d.id]={ok:true, src:d.book, price:0.49, bid:0.2, ask:0.49, thin:true, title:d.name, ref:'THIN', at:new Date().toISOString(), outcome:'out-1'}; });
     await route.fulfill({status:200, contentType:'application/json', headers:{'access-control-allow-origin':'*','access-control-allow-credentials':'true','access-control-allow-headers':'*'}, body:JSON.stringify({at:new Date().toISOString(), results:R})}); });
   const T=await p.evaluate(async()=>{ const host=document.createElement('div'); host.className='pcard'; document.body.appendChild(host); const n0=logged.length; const cook=gN('James Cook'); const a=await easyPlacedSave(cook,{host}); const thin=!!host.querySelector('.editor'); host.remove(); return {a, thin, n:logged.length-n0}; });
   check('8j: a thin Novig book: nothing saved, reason thin, the full form opens', T.a.saved===false && T.a.reason==='thin' && T.thin===true && T.n===0, T);
   check('8k: no page errors', A.errors.length===0, A.errors); await A.ctx.close(); }
 { // the form's own verdict is not "Worth it" (the price is over her most): nothing is saved without a look
   const A=await open(b), p=A.page;
   const C=await p.evaluate(async()=>{ const r=gN('Luka Doncic'); r.offeredRaw='-400'; r.offeredProb=toProb('-400'); const n0=logged.length; const host=document.createElement('div'); host.className='pcard'; document.body.appendChild(host); const res=await easyPlacedSave(r,{host}); const open=!!host.querySelector('.editor'); host.remove(); return {res, open, n:logged.length-n0}; });
   check('8m: a price the form calls "Not worth it": nothing saved, reason check, the full form opens', C.res.saved===false && C.res.reason==='check' && C.open===true && C.n===0, C);
   await A.ctx.close(); }
 { // a bet already logged or waiting at a book is never saved a second time
   const A=await open(b), p=A.page;
   const Z=await p.evaluate(async()=>{ const g=n=>gN(n); const r1=await easyPlacedSave(g('Isiah Pacheco')); const r2=await easyPlacedSave(g('Isiah Pacheco')); const n=logged.length;
     const ch=g('Zach Charbonnet'); myOrders={orders:[{book:'kalshi',action:'buy',side:'no',price:0.5,qty:3,title:'x',bet:{kind:'prop',sport:'NFL',player:'Zach Charbonnet',statText:'Receptions',line:3.5,side:'U',start:ch.gameInfo.startISO}}]}; refresh();
     const r3=await easyPlacedSave(gN('Zach Charbonnet')); return {r1:r1.saved, r2, r3, n, n2:logged.length}; });
   check('8l: tapping twice saves one bet; a bet with an order waiting is not saved', Z.r1===true && Z.r2.saved===false && Z.r2.reason==='already' && Z.r3.reason==='already' && Z.n===Z.n2, Z); await A.ctx.close(); }

 // ---------- 9. My bets ----------
 { const A=await open(b), p=A.page;
   const Q=await p.evaluate(()=>{ const led=easyLedger(), ip=easyInPlay(), sf=easySoFar(), g=lcStats(logged), par=logged.filter(x=>x.kind==='parlay');
     const parSettled=par.filter(x=>betProfit(x)!=null), parOpen=par.filter(x=>betProfit(x)==null);
     return {n:led.length, won:led.filter(x=>x.status==='won').length, lost:led.filter(x=>x.status==='lost').length, push:led.filter(x=>x.status==='push').length, sf, ip:{count:ip.count, atRisk:ip.atRisk, par:ip.parlaysNotShown, labels:ip.bets.map(x=>x.label)}, lc:{n:g.n,w:g.w,l:g.l,p:g.p,pend:g.pend,profit:+g.profit.toFixed(2)}, parProfit:+parSettled.reduce((t,x)=>t+betProfit(x),0).toFixed(2), parSettledN:parSettled.length, parOpenStake:+parOpen.reduce((t,x)=>t+(+x.stake||0),0).toFixed(2), sumRows:+led.reduce((t,x)=>t+x.profit,0).toFixed(2), noParlay:[...led, ...ip.bets].every(x=>x.bet.kind!=='parlay'), dates:led.map(x=>x.day)}; });
   check('9a: singles only: 12 settled (8 won, 4 lost, 0 push), profit +$45.32, counts come from the same list', Q.n===12 && Q.won===8 && Q.lost===4 && Q.push===0 && Q.sf.bets===12 && Q.sf.won===8 && Q.sf.lost===4 && Q.sf.profit===45.32 && Q.sumRows===45.32 && Q.noParlay, {n:Q.n, sf:Q.sf});
   check('9b: in play: 2 open singles with $27.00 at risk (Josh Allen $12, Chiefs $15); 1 open parlay is not shown and said so', Q.ip.count===2 && Q.ip.atRisk===27 && Q.ip.par===1, Q.ip);
   check('9c: it adds up to the Bet log tab: singles + the one settled parlay = the log\'s 8–5–0 and +$35.32; open $27 + parlay $5 = the log\'s $32.00 open', Q.sf.won===Q.lc.w && Q.sf.lost+Q.parSettledN===Q.lc.l && +(Q.sf.profit+Q.parProfit).toFixed(2)===Q.lc.profit && Q.lc.profit===35.32 && Q.lc.pend===3 && +(Q.ip.atRisk+Q.parOpenStake).toFixed(2)===32, {sf:Q.sf, lc:Q.lc, parProfit:Q.parProfit, parOpenStake:Q.parOpenStake});
   await p.evaluate(()=>document.querySelector('.tab[data-view="v-log"]').click()); await p.waitForTimeout(500);
   const L=await p.evaluate(()=>{ const t=document.getElementById('v-log').innerText.replace(/\s+/g,' '); const m=t.match(/All time \| ?(\d+) bets \| ?(\d+)–(\d+)–(\d+) \| ?staked \$([\d.,]+) \| ?settled ([+−-])\$([\d.,]+)/) || t.match(/All time\s*(\d+) bets\s*(\d+)–(\d+)–(\d+)\s*staked \$([\d.,]+)\s*settled ([+−-])\$([\d.,]+)/); return m?{bets:+m[1], w:+m[2], l:+m[3], p:+m[4], staked:m[5], profit:(m[6]==='−'||m[6]==='-'?-1:1)*parseFloat(m[7].replace(',',''))}:{t:t.slice(t.indexOf('All time'), t.indexOf('All time')+120)}; });
   check('9d: the Bet log tab prints the same totals the model reproduces: 16 bets, 8–5–0, settled +$35.32', L.bets===16 && L.w===8 && L.l===5 && L.p===0 && L.profit===35.32 && Q.sf.won===L.w && +(Q.sf.profit+Q.parProfit).toFixed(2)===L.profit, L);
   console.log('INFO My bets on the practice log: settled '+Q.n+' (won '+Q.won+', lost '+Q.lost+', push '+Q.push+'), profit so far '+Q.sf.profit+'; in play '+Q.ip.count+' singles, $'+Q.ip.atRisk+' at risk, '+Q.ip.par+' open parlay not shown');
   // a bet in the log is never a pick: log every pick through the app, none stay on the list and all appear in play
   const K=await p.evaluate(async()=>{ const before=easyInPlay(), keys=easyList().picks.map(x=>x.key); for(const k of keys){ await easyPlacedSave(k); } const after=easyInPlay(), L=easyList();
     return {nKeys:keys.length, left:L.total, inPlayN:after.count-before.count, atRisk:+(after.atRisk-before.atRisk).toFixed(2), bad:L.picks.concat(L.waiting).filter(x=>x.r.prior).length}; });
   check('9e: after "I placed it" on all five, none is on the list, all five are in play (+$48.44 at risk: $10 x4 + $8.44)', K.nKeys===5 && K.left===0 && K.inPlayN===5 && K.atRisk===48.44 && K.bad===0, K);
   check('9f: no page errors', A.errors.length===0, A.errors); await A.ctx.close(); }

 // ---------- 10. nothing changed that should not: no new storage key, names are unique ----------
 { const A=await open(b), p=A.page;
   const S=await p.evaluate(async()=>{ const k0=Object.keys(localStorage).sort().join(); easyRemember(); easyList(); easyMovedList(); await easyPlacedSave(gN('Isiah Pacheco')); const k1=Object.keys(localStorage).sort().join(); return {same:k0===k1, k0, k1, ss:Object.keys(sessionStorage)}; });
   check('10a: the engine adds no localStorage key (it uses memory and this tab\'s session storage only)', S.same && !/easy/i.test(S.k1), S);
   const dup=[...html.matchAll(/\nfunction (easy\w+)\(/g)].map(m=>m[1]), uniq=new Set(dup);
   check('10b: every easy function is declared once, as a hoisted declaration ('+dup.length+' functions)', dup.length===uniq.size && dup.length>=40, dup.length);
   const i0=html.indexOf('function scTicket(r){'), i1=html.indexOf('function easyIsPaste('), i2=html.indexOf('function easySoFar('), i3=html.indexOf('function scPolyLine(r){');
   check('10c: the whole block is contiguous, right after scTicket and before scPolyLine', i0>0 && i1>i0 && /^function scTicket\(r\)\{[^\n]*\n\/\* v5\.24 \(Easy, step 2 of 2/.test(html.slice(i0, i1+1)) && i2>i1 && i3>i2 && !/\nfunction (?!easy)/.test(html.slice(i1, i2)), {a:html.slice(i0,i1).split('\n').length});
   check('10d: no page errors', A.errors.length===0, A.errors); await A.ctx.close(); }

 await b.close();
 console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail?1:0);
})();
