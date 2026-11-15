// node tests/v513-modes-test.js [index.html] — v5.13 (owner, 11/15: "Remove the suertudo or brujo daily allowed. Since I shouldn't be doing any unless I see or now
// something from my end."): Hail Marys become 👀 Watch only, the way v4.80 made the near-misses Watch only (EXTRAS.hailBets false): listed in 🔮 Brujo with no
// stake, no place / slip offer and no daily count. No words on screen promise "N a day", "$1 each" or "the smallest bet" for 🍀 Suertudo or 🔮 Brujo.
// Unchanged: a bet La Contadora approves keeps its stake in every tab (an approved long shot under 45% in Brujo, an approved Coin Flip in Suertudo).
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,700)); };
const NOW=Date.parse('2026-11-10T19:00:00Z'), iso=ms=>new Date(ms).toISOString(), DAY='2026-11-10', KO=Date.parse('2026-11-11T01:15:00Z'), H=3600e3;
const T=(ha,abbr,loc,nick)=>({ha,id:abbr,abbr,name:loc+' '+nick,loc,nick,logo:'',rec:'',color:'333333',alt:'ffffff'});
const GI=(start,id,a,h)=>({state:'pre',startISO:iso(start),eventId:id,timeCT:'',detail:'',teams:[T('away',a[0],a[1],a[2]),T('home',h[0],h[1],h[2])]});
const G1=GI(KO,'401001',['BUF','Buffalo','Bills'],['MIN','Minnesota','Vikings']), G2=GI(KO+2*H,'401002',['NYI','New York','Islanders'],['SJ','San Jose','Sharks']), G3=GI(KO+H,'401003',['CAR','Carolina','Hurricanes'],['SEA','Seattle','Kraken']);
const am=p=>p>=0.5?String(Math.round(-100*p/(1-p))):'+'+Math.round(100*(1-p)/p);
const prop=(id,name,team,market,side,price,fair,mkt,gi,sport,extra)=>Object.assign({name,team,game:gi.teams[0].abbr+' @ '+gi.teams[1].abbr,matchup:gi.teams[0].abbr+' @ '+gi.teams[1].abbr,side,sport,market,kind:'prop',book:'Novig',
  offeredRaw:am(price),offeredProb:price,fairProb:fair,fairRaw:am(fair),mktProb:mkt,stars:4,evModel:'projection',projValue:10,gameInfo:gi,src:'api:'+sport+':props',apiKey:id,loadedAt:iso(NOW-60e3)},extra||{});
const ROWS=[
  prop('hmw','Stefon Diggs','BUF','99.5 Receiving Yards','O',0.20,0.21,0.19,G1,'NFL'),      // +400: model +5%, La Contadora 19.7% (−1.5%): a Watch long shot (old: a $1 Hail Mary)
  prop('hmn','Josh Allen','BUF','2.5 Rushing TDs','O',0.20,0.18,0.18,G1,'NFL'),              // +400: the math says no (model −10%): old: a $1 Hail Mary all the same
  prop('ls','Ty Smith','BUF','45.5 Receiving Yards','O',0.36,0.40,0.40,G1,'NFL'),           // approved long shot: La Contadora 40% (+11.1%): 🔮 Brujo, a best bet with a stake
  prop('cf','Adam Boqvist','SJ','2.5 Shots','O',0.44,0.50,0.48,G2,'NHL'),                    // approved Coin Flip: La Contadora 48.7% (+10.7%): 🍀 Suertudo
  prop('lucky','Will Cuylle','SJ','1.5 Shots','O',0.535,0.5546,0.526,G2,'NHL'),              // a near-miss (v4.80: 👀 Watch only)
  prop('mach','Seth Jarvis','CAR','0.5 Points','O',0.62,0.70,0.68,G3,'NHL')];                // 💪 Machín
async function open(b, W){ const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:W,height:900}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(([R,d])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig',bank:'500',cfgVer:3.03})); localStorage.setItem('mbev.cards','1');
    localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows:R})); }catch(e){} },[ROWS,DAY]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.addInitScript(()=>{ window._barOpen=true; }); await p.goto('http://app.test/'); await p.waitForTimeout(1300); return {ctx,p,errs}; }
// everything a mode puts on screen: La Contadora's line, the tab titles, the cards, the table, Settings › Your rules at a glance
const words=p=>p.evaluate(()=>{ const t=s=>[...document.querySelectorAll(s)].map(e=>(e.innerText||e.textContent||'').replace(/\s+/g,' ').trim()).join(' | ');
  return {contadora:t('#contadora'), tabs:[...document.querySelectorAll('#modeBar button')].map(b=>b.title).join(' | '), cards:t('#placeCards'), table:t('#tbody'), empty:t('#emptyMsg'), rules:(document.querySelector('#rulesGlance .hint')||{}).textContent||''}; });
const PROMISE=/\$1 each|\bup to \d+ a (game )?day|\d+ a (game )?day|smallest bet|of \d+ used today|no more today/i;
(async()=>{ const b=await chromium.launch();
  for(const W of [1280, 390]){
    const S=await open(b,W), p=S.p;
    await p.evaluate(()=>setMode('clair')); await p.waitForTimeout(400);
    const R=await p.evaluate(()=>{ const g=k=>{ const r=lastRows.find(x=>x.apiKey===k); return {pass:!!r.pass, stake:+(+r.stake||0).toFixed(2), tier:r.tier||'', xc:r.xc||'', xFit:r.xFit||'', xStake:r.xStake||0, fam:modeFamOf(r)}; }; return {hmw:g('hmw'), hmn:g('hmn'), ls:g('ls'), off:EXTRAS.hailBets===false}; });
    check(W+' px: 🔮 Brujo: both +400 long shots La Contadora does not approve (Diggs, a Watch row; Allen, the math says no) are listed in Brujo with no offer: no tier, no stake, no Hail Mary amount (EXTRAS.hailBets false)',
      R.off && ['hmw','hmn'].every(k=>R[k].xc==='hail' && R[k].fam==='hail' && !R[k].tier && !R[k].xFit && !R[k].xStake && !R[k].stake), R);
    const B=await p.evaluate(()=>{ const rowOf=name=>{ const tr=[...document.querySelectorAll('#tbody tr:not(.group-row):not(.notes-row)')].find(x=>x.textContent.includes(name)); return tr?{dec:(tr.querySelector('.dec')||{}).textContent||'', txt:tr.innerText.replace(/\s+/g,' ')}:null; };
      const cardOf=name=>[...document.querySelectorAll('#placeCards .sc-card')].find(c=>c.textContent.includes(name));
      return {diggs:rowOf('Stefon Diggs'), allen:rowOf('Josh Allen'), diggsCard:!!cardOf('Stefon Diggs'), allenCard:!!cardOf('Josh Allen'), groups:[...document.querySelectorAll('#tbody tr.group-row')].map(g=>g.textContent.replace(/\s+/g,' ').trim()),
        heads:[...document.querySelectorAll('#placeCards .pc-head')].map(h=>h.textContent.replace(/\s+/g,' ').trim()), lsCard:(()=>{ const c=cardOf('Ty Smith'); return c?c.innerText.replace(/\s+/g,' '):null; })(), lsStake:+(+lastRows.find(x=>x.apiKey==='ls').stake||0).toFixed(2)}; });
    check(W+' px: 🔮 Brujo lists them under "👀 Watch · long shots, not offered as bets", each "👀 WATCH" with no $ amount, no card and no BET NOW / Place at / slip',
      B.diggs && B.allen && !B.diggsCard && !B.allenCard && B.groups.some(g=>/^👀 Watch · long shots, not offered as bets: La Contadora only offers the bets she approves · 2$/.test(g))
      && [B.diggs, B.allen].every(r=>/^👀 WATCH$/.test(r.dec) && !/\$\d/.test(r.dec) && !/BET NOW|Place at|slip|HAIL MARY/i.test(r.txt)), B);
    check(W+' px: the 🔮 Hail Marys header is one plain line: "👀 Watch only", not offered as bets, the app only offers the bets La Contadora approves, + Add a bet to log one yourself',
      B.heads.some(h=>/🔮 Hail Marys · 👀 Watch only/.test(h) && /Not offered as bets: the app only offers the bets La Contadora approves\./.test(h) && /log it with \+ Add a bet\./.test(h)), B.heads);
    check(W+' px: an approved long shot (Ty Smith, La Contadora 40%) is still a best bet in 🔮 Brujo with its stake on its card', R.ls.pass && R.ls.stake>0 && R.ls.fam==='hail' && B.lsCard && B.lsCard.includes('$'+B.lsStake.toFixed(2)), {ls:R.ls, card:B.lsCard});
    const wB=await words(p);
    check(W+' px: no words in 🔮 Brujo promise a daily count, "$1 each" or the smallest bet (La Contadora, tab titles, cards, table, Settings)', !Object.values(wB).some(t=>PROMISE.test(t)), Object.fromEntries(Object.entries(wB).map(([k,v])=>[k,(v.match(PROMISE)||[''])[0]+' … '+v.slice(0,160)])));
    check(W+' px: La Contadora in 🔮 Brujo says Hail Marys are not offered: "🔮 1 approved long shot on the board · Hail Marys: 👀 Watch only"', /not offered as bets/.test(wB.contadora) && /🔮 1 approved long shot on the board · Hail Marys: 👀 Watch only/.test(wB.contadora), wB.contadora);
    await p.evaluate(()=>setMode('lucky')); await p.waitForTimeout(400);
    const L=await p.evaluate(()=>{ const r=lastRows.find(x=>x.apiKey==='cf'), c=[...document.querySelectorAll('#placeCards .sc-card')].find(x=>x.textContent.includes('Adam Boqvist')); return {pass:!!r.pass, stake:+(+r.stake||0).toFixed(2), act:r.actProb, card:c?c.innerText.replace(/\s+/g,' '):null}; });
    check(W+' px: an approved Coin Flip (Boqvist, La Contadora 48.7%) is still a best bet in 🍀 Suertudo with its stake on its card', L.pass && L.stake>0 && L.act>0.45 && L.act<0.5 && L.card && L.card.includes('$'+L.stake.toFixed(2)), L);
    const wL=await words(p);
    check(W+' px: no words in 🍀 Suertudo promise a daily count, "$1 each" or the smallest bet', !Object.values(wL).some(t=>PROMISE.test(t)), Object.fromEntries(Object.entries(wL).map(([k,v])=>[k,(v.match(PROMISE)||[''])[0]+' … '+v.slice(0,160)])));
    const st=await p.evaluate(()=>{ const r=lastRows.find(x=>x.apiKey==='mach'); return {stake:+r.stake, pass:!!r.pass}; });
    check(W+' px: the 💪 Machín best bet keeps its stake', st.pass && st.stake>0, st);
    check(W+' px: no page errors', !S.errs.length, S.errs); await S.ctx.close();
  }
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
