// node tests/sentinel-gone-test.js — v4.75 (agreed with ChatGPT, owner "we keep building" 11/12): a Sentinels press now tells "gone" from
// "couldn't read". Only two answers are certain today, and only from the book the card shows: NO OFFER (Kalshi/Polymarket found the exact market,
// nobody selling) and GONE · line moved (they list the player at other lines). Then: another of your books that clears the floor takes the card;
// else stake $0 and out of Place these, until a later press finds it. Novig "no market at your line", not found, busy, errors: unchanged (v4.57).
// By hand: model 58%, market 56% → 0.567. Kalshi 53%: fee 0.07 × 0.47 = 0.0329 → EV +3.57%. Novig 53%: +6.98%. Floor 1.5%.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,600)); };
const NOW=Date.parse('2026-11-12T19:00:00Z'), iso=ms=>new Date(ms).toISOString(), DAY='2026-11-12', KO=Date.parse('2026-11-13T01:15:00Z');
const T=(ha,abbr)=>({ha,id:abbr,abbr,name:abbr+' Team',loc:abbr,nick:'Team',logo:'',rec:'',color:'333333',alt:'ffffff'});
const am=p=>p>=0.5?String(Math.round(-100*p/(1-p))):'+'+Math.round(100*(1-p)/p);
const prop=(id,name,price,book)=>({name,team:'AAA',game:'AAA @ HHH',matchup:'AAA @ HHH',side:'O',sport:'NBA',market:'1.5 Assists',kind:'prop',book,offeredRaw:am(price),offeredProb:price,fairProb:0.58,fairRaw:am(0.58),mktProb:0.56,stars:4,evModel:'projection',projValue:3,
  gameInfo:{state:'pre',startISO:iso(KO),eventId:'9'+id.charCodeAt(0),timeCT:'',detail:'',teams:[T('away','AAA'),T('home','HHH')]},src:'api:NBA:props',apiKey:id,loadedAt:iso(NOW-60e3)});
async function open(b, rows, live){ const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:1280,height:900}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(([R,d])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig, Kalshi, Polymarket',bank:'500',cfgVer:3.03})); localStorage.setItem('mbev.cards','0');
    localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows:R})); }catch(e){} },[rows,DAY]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); const S={ctx,p,errs,live};
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/\/live\?/.test(u)){ const bets=JSON.parse(decodeURIComponent(u.split('bets=')[1])); const R={}; bets.forEach(d=>{ const [kind,idx,bk]=d.id.split(':'); const a=S.live(d.id.split(':')[1],bk);
        if(typeof a==='number') R[d.id]={ok:true, price:a, bid:a-0.02, at:Date.now()}; else if(a) R[d.id]=Object.assign({ok:false},a); }); return r.fulfill({contentType:'application/json',body:JSON.stringify({results:R})}); }
    if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1200); return S; }
const press=async S=>{ await S.p.evaluate(async()=>{ await shopExchanges(); }); await S.p.waitForTimeout(250); };
const look=(S,k)=>S.p.evaluate(k=>{ const r=lastRows.find(x=>x.apiKey===k); return {book:r.book, price:r.offeredProb, market:r.market, stake:r.stake, pass:!!r.pass, place:isPlace(r), q:r.qGone||null, out:(r.flags||[]).filter(f=>f[0]==='out').map(f=>f[1]), snap:(shopSnap(r)||{}).chk||null, dec:decisionHtml(r,cfgRead()).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim()}; },k);
const NO='Kalshi: no offer to buy right now', MOVED='Polymarket lists Card Two at 2.5+, 3.5+ — not your 2+';
(async()=>{ const b=await chromium.launch(); let S, v;
  // 1, 10, 11: the card is at Kalshi; Kalshi says no offer; Novig and Polymarket have nothing
  S=await open(b,[prop('k','Card One',0.53,'Kalshi')], (i,bk)=>bk==='kalshi'?{note:NO}:null);
  v=await look(S,'k'); check('before any press: the Kalshi card at 53% (+3.57% after its fee) is in Place these', v.place && v.stake>0, v);
  await press(S); v=await look(S,'k');
  check('1: Kalshi found the market, nobody selling: stake $0, out of Place these, "NO OFFER at Kalshi · exact market found, but nobody is selling this side now"', !v.place && v.stake===0 && v.out[0]==='NO OFFER at Kalshi · exact market found, but nobody is selling this side now', v);
  check('11: the reason is saved: state no_offer, code no_ask, the raw Kalshi text, decision stake_zero', v.snap && v.snap.q && v.snap.q.state==='no_offer' && v.snap.q.code==='no_ask' && v.snap.q.raw===NO && v.snap.q.decision==='stake_zero', v.snap&&v.snap.q);
  await press(S); const v2=await look(S,'k');
  check('12: the same press again gives the same result', JSON.stringify([v2.place,v2.stake,v2.out])===JSON.stringify([v.place,v.stake,v.out]), v2);
  // 5: liquidity returns: Kalshi 53% again on the next press
  S.live=(i,bk)=>bk==='kalshi'?0.53:null; await press(S); v=await look(S,'k');
  check('5: a later press that reads Kalshi at 53% brings it back to Place these, no NO OFFER', v.place && v.stake>0 && !v.q && !v.out.length, v);
  check('no page errors (no offer)', !S.errs.length, S.errs); await S.ctx.close();
  // 2, 6: Polymarket card; the line moved
  S=await open(b,[prop('m','Card Two',0.53,'Polymarket US')], (i,bk)=>bk==='poly'?{note:MOVED}:null);
  await press(S); v=await look(S,'m');
  check('2: Polymarket lists the player at 2.5+ and 3.5+, not 2+: "GONE at Polymarket US · your 2+ moved to 2.5+, 3.5+", stake $0', !v.place && v.stake===0 && v.out[0]==='GONE at Polymarket US · your 2+ moved to 2.5+, 3.5+' && v.snap.q.state==='gone_line_moved', v);
  check('6: the card is not turned into a 2.5 bet: still 1.5 Assists at 53%', v.market==='1.5 Assists' && Math.abs(v.price-0.53)<1e-9, {m:v.market, p:v.price});
  check('no page errors (moved)', !S.errs.length, S.errs); await S.ctx.close();
  // 3: no offer at Kalshi, but Novig has it at 53% (+6.98%): the card moves to Novig
  S=await open(b,[prop('a','Card Three',0.53,'Kalshi')], (i,bk)=>bk==='kalshi'?{note:NO}:bk==='novig'?0.53:null);
  await press(S); v=await look(S,'a');
  check('3: Kalshi has no offer; Novig 53% clears the floor: the card moves to Novig and stays in Place these; saved as moved', v.book==='Novig' && v.place && !v.q && v.snap.q && v.snap.q.decision==='moved', v);
  check('no page errors (moved to Novig)', !S.errs.length, S.errs); await S.ctx.close();
  // 7, 8: Novig "no market at your line" and a busy answer stay unreadable (v4.57: the card stays)
  S=await open(b,[prop('n','Card Four',0.53,'Novig'), prop('z','Card Five',0.53,'Kalshi')], (i,bk)=>bk==='novig'?{note:'Novig: no market at your line'}:bk==='kalshi'?{busy:true,note:'Kalshi: busy'}:null);
  await press(S); const vn=await look(S,'n'), vz=await look(S,'z');
  check('7: Novig "no market at your line" proves nothing: the card stays in Place these, no NO OFFER / GONE', vn.place && !vn.q && !vn.out.length, vn);
  check('8: a busy answer proves nothing either', vz.place && !vz.q, vz);
  check('no page errors (unreadable)', !S.errs.length, S.errs); await S.ctx.close();
  // 9: the card is at Novig and Novig reads 53%; a challenger (Kalshi) has no offer: nothing changes
  S=await open(b,[prop('c','Card Six',0.53,'Novig')], (i,bk)=>bk==='novig'?0.53:bk==='kalshi'?{note:NO}:null);
  await press(S); v=await look(S,'c');
  check('9: Kalshi (not the book shown) says no offer: the Novig card stays in Place these', v.book==='Novig' && v.place && !v.q && !v.out.length, v);
  check('no page errors (challenger)', !S.errs.length, S.errs); await S.ctx.close();
  // 10: placed bets are not asked about (a bet you hold is never re-priced)
  S=await open(b,[prop('h','Card Seven',0.53,'Kalshi')], (i,bk)=>bk==='kalshi'?{note:NO}:null);
  await S.p.evaluate(()=>{ const r=lastRows.find(x=>x.apiKey==='h'); addToLog(r); refresh(); }); await S.p.waitForTimeout(300); await press(S);
  const hv=await S.p.evaluate(()=>{ const r=lastRows.find(x=>x.apiKey==='h'), L=logged[logged.length-1]; return {prior:!!r.prior, q:r.qGone||null, stake:L.stake, res:L.result||null}; });
  check('10: a bet you placed is untouched: no NO OFFER mark, its saved stake and result unchanged', hv.prior && !hv.q && hv.stake>0 && (hv.res==null||hv.res==='pending'), hv);
  check('no page errors (placed)', !S.errs.length, S.errs); await S.ctx.close();
  // the classifier by itself
  const c=await (async()=>{ const S2=await open(b,[],()=>null); const r=await S2.p.evaluate(()=>[qFailState({note:'Kalshi: no offer to buy right now'}).state, qFailState({note:'Polymarket lists X at 3+ — not your 2+'}).state, qFailState({note:'Kalshi: game not found (KXNBA)'}).state, qFailState({note:'Polymarket: X not listed'}).state, qFailState({note:'Novig: no market at your line'}).state, qFailState({busy:true,note:'Novig: busy'}).state, qFailState({note:'Kalshi: this stat/market isn\'t mapped'}).state]); await S2.ctx.close(); return r; })();
  check('the classifier: no offer → no_offer; lists other lines → gone_line_moved; game not found, not listed, Novig no market, busy, not mapped → unreadable', JSON.stringify(c)===JSON.stringify(['no_offer','gone_line_moved','unreadable','unreadable','unreadable','unreadable','unreadable']), c);
  await b.close(); console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(fail?1:0); })();
