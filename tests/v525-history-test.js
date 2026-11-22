// node tests/v525-history-test.js — v5.25 (Build A): Bet log › More › 🔎 Check my history, read-only. Each settled single is graded again on a copy from its
// own game day (stubbed ESPN), and the bets whose new grade differs are listed (here: two flipped by the old Check results on a rematch, and a prop saved
// as a loss exactly on a whole-number line). Nothing changes until a tap; "Use the new result" changes that one bet only (result, regradedFrom,
// regradedAt; the snapshot never); "Keep mine" marks it as your own result. One scoreboard read per sport and day; a day ESPN could not answer is said.
// Round 2 (review HS-2, HS-3, HS-4, HS-6): an unreadable own day is skipped, a right Push on a postponed game is not listed, book-settled bets are left out,
// and a row never overwrites a result set after the list was drawn.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const H={'access-control-allow-origin':'*'};
const ev=(id,date,away,home,as,hs)=>({id,date,status:{type:{state:'post',completed:true,name:'STATUS_FINAL',shortDetail:'Final'}},
  competitions:[{competitors:[{homeAway:'away',score:String(as),team:{abbreviation:away}},{homeAway:'home',score:String(hs),team:{abbreviation:home}}]}]});
const OLD='2026-10-18T23:00:00Z';
const nhl=(id,x)=>Object.assign({id,key:id,sport:'NHL',game:'PHI @ NYR',book:'DraftKings',odds:'-110',stake:10,date:'2026-10-18',start:OLD,snap:{at:'2026-10-18T17:00:00Z',fair:0.52}},x);
const LOG=[
  nhl('ml-old',{kind:'moneyline',name:'PHI',team:'PHI',market:'Moneyline',betnow:'PHI ML',result:'loss'}),     // PHI won 3-1 on 10/18: flipped by the old button
  nhl('tot-old',{kind:'total',name:'PHI @ NYR',market:'4.5 Total',side:'U',betnow:'U 4.5',result:'loss'}),       // 4 goals: the Under won
  nhl('ok-old',{kind:'moneyline',name:'NYR',team:'NYR',market:'Moneyline',betnow:'NYR ML',result:'loss'}),       // right: not listed
  nhl('hand-old',{kind:'moneyline',name:'NYR',team:'NYR',market:'Moneyline',betnow:'NYR ML',result:'win',gradedBy:'manual',resultSrc:'you'}),   // yours: never checked
  {id:'k1',key:'k1',sport:'NBA',kind:'prop',game:'LAL @ DEN',name:'Nikola Jokic',market:'27 Points',side:'O',betnow:'O 27',book:'Novig',odds:'+100',stake:10,date:'2026-10-25',start:'2026-10-26T01:00:00Z',snap:{at:'2026-10-25T18:00:00Z'},result:'loss'},
  {id:'dark',key:'dark',sport:'NBA',kind:'moneyline',game:'MIA @ BOS',name:'MIA',team:'MIA',market:'Moneyline',betnow:'MIA ML',book:'DraftKings',odds:'-110',stake:10,date:'2026-10-20',start:'2026-10-21T00:00:00Z',snap:{at:'2026-10-20T17:00:00Z'},result:'win'}];
const SB={'hockey/nhl|20261018':{events:[ev('o18',OLD,'PHI','NYR',3,1)]}, 'hockey/nhl|20261105':{events:[ev('n05','2026-11-06T00:00Z','PHI','NYR',2,3)]},
  'basketball/nba|20261025':{events:[ev('jok','2026-10-26T01:00Z','LAL','DEN',100,113)]}};
const BX={header:{competitions:[{status:{type:{state:'post',completed:true}}}]},boxscore:{players:[{team:{abbreviation:'DEN'},statistics:[{labels:['MIN','PTS','REB','AST'],athletes:[{athlete:{displayName:'Nikola Jokic'},stats:['36','27','12','9']}]}]}]}};
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago'});
  await ctx.addInitScript(L=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.log',JSON.stringify(L)); }catch(e){} }, LOG);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); const hits=[];
  await p.clock.setFixedTime(new Date('2026-11-06T05:00:00Z'));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/espn/.test(u)){ const m=u.match(/sports\/([a-z]+\/[a-z]+)\/scoreboard\?dates=(\d{8})/); if(m) hits.push(m[1]+'|'+m[2]);
      if(m && m[2]==='20261020') return r.fulfill({status:500,headers:H,contentType:'application/json',body:'{}'});
      if(m) return r.fulfill({contentType:'application/json',headers:H,body:JSON.stringify(SB[m[1]+'|'+m[2]]||{events:[]})});
      if(/summary/.test(u) && /jok/.test(u)) return r.fulfill({contentType:'application/json',headers:H,body:JSON.stringify(BX)});
      return r.fulfill({contentType:'application/json',headers:H,body:'{"events":[]}'}); }
    return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(2500);
  await p.click('.tab[data-view="v-log"]'); await p.waitForTimeout(400);
  const stored=()=>p.evaluate(()=>localStorage.getItem('mbev.log'));
  const before=await stored();
  const hasBtn=await p.evaluate(()=>!!document.getElementById('histCheck'));
  check('Bet log › More has 🔎 Check my history', hasBtn, hasBtn);
  if(!hasBtn){ console.log(`\n${pass} passed, ${fail+1} failed`); await b.close(); process.exit(1); }
  await p.click('details[data-help="log-more"] > summary'); await p.waitForTimeout(200);
  hits.length=0; await p.click('#histCheck'); await p.waitForTimeout(3000);
  const view=await p.evaluate(()=>({st:document.getElementById('histStatus').textContent, rows:[...document.querySelectorAll('#histOut .hist-row')].map(r=>r.dataset.id), txt:document.getElementById('histOut').textContent}));
  check('it lists the two bets flipped by a rematch and the prop on its whole-number line, and nothing else', view.rows.slice().sort().join(',')==='k1,ml-old,tot-old', view.rows);
  check('a calm summary: bets checked, how many would change, nothing changes until you tap', /5 bets checked · 3 would change/.test(view.st) && /Nothing changes until you tap/.test(view.st), view.st);
  check('each row says the saved and the new result, the score and the game’s date (ml-old: Lost → Won, PHI 3 @ NYR 1, 10/18)', /Saved: Lost · Graded again: Won/.test(view.txt) && /PHI 3 @ NYR 1 · 10\/18\/26/.test(view.txt), view.txt.slice(0,400));
  check('the whole-number prop says Push, exactly on the line', /Graded again: Push \(27 on a line of 27\) exactly on the line/.test(view.txt), view.txt);
  check('ESPN could not be read for a day: said plainly', /ESPN could not be read for NBA 2026-10-20/.test(view.txt), view.txt.slice(0,200));
  const dup=hits.filter((h,i)=>hits.indexOf(h)!==i);
  check('one scoreboard read per sport and day during the run', hits.length>0 && !dup.length, hits);
  check('nothing is saved by the check itself', (await stored())===before, 'unchanged');
  await p.click('#histOut .hist-use[data-id="ml-old"]'); await p.waitForTimeout(400);
  const after=JSON.parse(await stored()), B0=JSON.parse(before), F=['result','gradedBy','resultSrc','regradedFrom','regradedAt','snap','stake','odds','towin','start','game','market'], diff=after.map((x,i)=>F.some(k=>JSON.stringify(x[k])!==JSON.stringify(B0[i][k]))?x.id:null).filter(Boolean);   // the app’s own one-time markers (fix96, lsmlCls) are not results
  const ml=after.find(x=>x.id==='ml-old');
  if(process.env.DBG) after.forEach((x,i)=>{ const y=B0[i]; const k=[...new Set(Object.keys(x).concat(Object.keys(y)))].filter(k=>JSON.stringify(x[k])!==JSON.stringify(y[k])); if(k.length) console.log(x.id,k.map(z=>z+'='+JSON.stringify(y[z])+'>'+JSON.stringify(x[z])).join(' ')); });
  check('one tap on Use the new result changes exactly that bet, and it is saved', diff.join(',')==='ml-old' && ml.result==='win' && ml.regradedFrom==='loss' && !isNaN(Date.parse(ml.regradedAt)), {diff, r:ml.result, from:ml.regradedFrom, at:ml.regradedAt});
  check('its snapshot is not touched', JSON.stringify(ml.snap)===JSON.stringify(B0.find(x=>x.id==='ml-old').snap), ml.snap);
  await p.click('#histOut .hist-keep[data-id="tot-old"]'); await p.waitForTimeout(400);
  const a2=JSON.parse(await stored()), tot=a2.find(x=>x.id==='tot-old');
  check('Keep mine keeps the saved result and marks it as yours', tot.result==='loss' && tot.gradedBy==='manual', {r:tot.result, by:tot.gradedBy});
  await p.click('#histCheck'); await p.waitForTimeout(2500);
  const v2=await p.evaluate(()=>[...document.querySelectorAll('#histOut .hist-row')].map(r=>r.dataset.id));
  check('a second check lists only the bet still open to a decision (the prop)', v2.join(',')==='k1', v2);
  // ================= v5.25 round 2 (review HS-2, HS-3, HS-4, HS-6) =================
  { const L2=[
      nhl('bd',{kind:'moneyline',name:'PHI',team:'PHI',market:'Moneyline',betnow:'PHI ML',date:'2026-10-20',start:undefined,snap:{at:'2026-10-20T17:00:00Z'},result:'win'}),   // its day cannot be read; the next day is a rematch PHI lost
      {id:'ppd',key:'ppd',sport:'NBA',kind:'total',game:'LAL @ DEN',name:'LAL @ DEN',market:'220.5 Total',side:'U',betnow:'U 220.5',book:'DraftKings',odds:'-110',stake:10,date:'2026-10-25',start:'2026-10-26T02:00:00Z',snap:{at:'2026-10-25T18:00:00Z'},result:'push'},   // postponed, saved Push: right
      nhl('kx',{kind:'moneyline',name:'PHI',team:'PHI',market:'Moneyline',betnow:'PHI ML',book:'Kalshi',fillBook:'kalshi',fillRef:'KX1',result:'loss',resultSrc:'Kalshi'}),   // the book’s settlement stands
      nhl('kxb',{kind:'moneyline',name:'PHI',team:'PHI',market:'Moneyline',betnow:'PHI ML',book:'Novig',result:'loss',gradedBy:'book'}),
      nhl('flip',{kind:'moneyline',name:'PHI',team:'PHI',market:'Moneyline',betnow:'PHI ML',result:'loss'})];   // listed; then set by hand before the tap
    const SB2={'hockey/nhl|20261018':{events:[ev('o18',OLD,'PHI','NYR',3,1)]}, 'hockey/nhl|20261021':{events:[ev('o21','2026-10-21T23:00Z','PHI','NYR',1,4)]},
      'basketball/nba|20261025':{events:[{id:'pp',date:'2026-10-26T02:00Z',status:{type:{id:'6',name:'STATUS_POSTPONED',state:'post',completed:false,detail:'Postponed'}},competitions:[{competitors:[{homeAway:'away',score:'0',team:{abbreviation:'LAL'}},{homeAway:'home',score:'0',team:{abbreviation:'DEN'}}]}]}]}};
    const c2=await b.newContext({timezoneId:'America/Chicago'});
    await c2.addInitScript(L=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.log',JSON.stringify(L)); }catch(e){} }, L2);
    const q=await c2.newPage(); q.on('pageerror',e=>errs.push(e.message)); await q.clock.setFixedTime(new Date('2026-11-06T05:00:00Z'));
    await q.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
      if(/espn/.test(u)){ const m=u.match(/sports\/([a-z]+\/[a-z]+)\/scoreboard\?dates=(\d{8})/);
        if(m && m[2]==='20261020') return r.fulfill({status:503,headers:H,contentType:'application/json',body:'{}'});
        if(m) return r.fulfill({contentType:'application/json',headers:H,body:JSON.stringify(SB2[m[1]+'|'+m[2]]||{events:[]})});
        return r.fulfill({contentType:'application/json',headers:H,body:'{"events":[]}'}); }
      return r.abort(); });
    await q.goto('http://app.test/'); await q.waitForTimeout(2500); await q.click('.tab[data-view="v-log"]'); await q.waitForTimeout(300);
    await q.click('details[data-help="log-more"] > summary'); await q.waitForTimeout(200); await q.click('#histCheck'); await q.waitForTimeout(3000);
    const v=await q.evaluate(()=>({st:document.getElementById('histStatus').textContent, rows:[...document.querySelectorAll('#histOut .hist-row')].map(r=>r.dataset.id)}));
    check('HS-2: a bet whose own day ESPN could not read is skipped, never graded from the next day’s rematch', !v.rows.includes('bd') && /could not be checked again/.test(v.st), v);
    check('HS-3: a Push saved on a postponed game is not listed (the tap would write the same Push)', !v.rows.includes('ppd'), v.rows);
    check('HS-6 / G-6: bets settled by the book (Kalshi, gradedBy book) are not offered "Use the new result"', !v.rows.includes('kx') && !v.rows.includes('kxb') && v.rows.includes('flip'), v.rows);
    await q.evaluate(()=>{ const x=logged.find(y=>y.id==='flip'); x.result='loss'; x.gradedBy='manual'; x.resultSrc='you'; saveLog(); });
    await q.click('#histOut .hist-use[data-id="flip"]'); await q.waitForTimeout(400);
    const f=await q.evaluate(()=>{ const x=JSON.parse(localStorage.getItem('mbev.log')).find(y=>y.id==='flip'); return {r:x.result, by:x.gradedBy, from:x.regradedFrom||null, rows:[...document.querySelectorAll('#histOut .hist-row')].map(r=>r.dataset.id)}; });
    check('HS-4: a result you set after the list was drawn is never overwritten by its open row', f.r==='loss' && f.by==='manual' && !f.from && !f.rows.includes('flip'), f);
    await c2.close(); }
  check('no page errors', !errs.length, errs.slice(0,3));
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
