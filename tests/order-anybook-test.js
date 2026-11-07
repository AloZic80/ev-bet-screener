// node tests/order-anybook-test.js — v4.20. Alonzo: "you have the Kalshi API and should be able to get my bets even if not filled, and put an
// identifier on the bets if still showing". Orders were only checked against cards priced at that same exchange. Now any card, at any book,
// gets the tag: a Kalshi order on Bowling Green tonight marks the Bowling Green card at Novig (ORDER WAITING on Kalshi); a Kalshi order on
// Oklahoma St. marks a Bovada card with no ESPN team codes ("Oklahoma State Cowboys"); a Kalshi player prop order marks the same prop at Bovada.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const NOW=Date.parse('2026-11-07T14:00:00Z'), iso=ms=>new Date(ms).toISOString(), DAY='2026-11-07', TODAY=Date.parse('2026-11-07T23:00:00Z'), SAT14=Date.parse('2026-11-14T17:00:00Z');
const T=(ha,abbr,loc,nick,short)=>({ha,id:abbr,abbr,name:short,loc,nick,logo:'',rec:'',color:'333333',alt:'ffffff'});
const gl=(team,away,home,teams,book,k,start)=>({name:team,team,game:away+' @ '+home,matchup:away+' @ '+home,side:'',sport:'NCAAF',market:'Moneyline',kind:'moneyline',book,offeredRaw:'+104',offeredProb:0.49,fairProb:0.52,fairRaw:'',mktProb:0.52,stars:null,evModel:'market',
  gameInfo:{state:'pre',startISO:iso(start),timeCT:'',detail:'',teams},src:'api:oddsapi:NCAAF',apiKey:k});
const ROWS=[gl('Bowling Green Falcons','Kent State Golden Flashes','Bowling Green Falcons',[T('away','KENT','Kent State','Golden Flashes','Kent State'),T('home','BGSU','Bowling Green','Falcons','Bowling Green')],'Novig','k1',TODAY),
  gl('Oklahoma State Cowboys','Texas Tech Red Raiders','Oklahoma State Cowboys',[],'Bovada','k2',SAT14),
  {name:'Devin Singletary',team:'NYG',game:'NYG @ PHI',matchup:'NYG @ PHI',side:'U',sport:'NFL',market:'15.5 Rushing Attempts',kind:'prop',book:'Bovada',offeredRaw:'+105',offeredProb:0.488,fairProb:0.53,fairRaw:'',mktProb:0.53,stars:null,evModel:'market',
   gameInfo:{state:'pre',startISO:iso(TODAY+20*3600e3),teams:[T('away','NYG','New York','Giants','Giants'),T('home','PHI','Philadelphia','Eagles','Eagles')]},src:'api:NFL:props',apiKey:'k3'}];
const ORD={orders:[
  {id:'o1',book:'kalshi',ref:'KXNCAAFGAME-26NOV07KENTBGSU-BGSU',side:'yes',action:'buy',price:0.37,qty:3,title:'Kent St. vs Bowling Green',bet:{sport:'NCAAF',kind:'moneyline',team:'BGSU',teamsCode:'KENTBGSU',start:iso(TODAY)}},
  {id:'o2',book:'kalshi',ref:'KXNCAAFGAME-26NOV07OKSTKSU-OKST',side:'yes',action:'buy',price:0.49,qty:2,title:'Oklahoma St. vs Kansas St.',bet:{sport:'NCAAF',kind:'moneyline',team:'OKST',teamsCode:'OKSTKSU',start:iso(TODAY)}},
  {id:'o3',book:'kalshi',ref:'KXNFLRSHATT-26NOV08NYGPHI-NYGDSINGLETARY16',side:'no',action:'buy',price:0.5,qty:2,title:'Devin Singletary: 16+ rushing attempts',bet:{sport:'NFL',kind:'prop',player:'Devin Singletary',statText:'rushing attempts',line:15.5,side:'U',teamsCode:'NYGPHI',start:iso(TODAY+20*3600e3)}}]};
(async()=>{
  const b=await chromium.launch();
  for(const W of [390,1280]){
    const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:W,height:900}}); await ctx.clock.install({time:new Date(NOW)});
    await ctx.addInitScript(([rows,d])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows})); }catch(e){} }, [ROWS,DAY]);
    const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
      if(/\/mine\/orders/.test(u)) return r.fulfill({contentType:'application/json',body:JSON.stringify(ORD)});
      if(/\/mine\/fills/.test(u)) return r.fulfill({contentType:'application/json',body:JSON.stringify({fills:[]})});
      if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
    await p.goto('http://app.test/'); await p.waitForTimeout(800);
    await p.evaluate(()=>{ const i=document.getElementById('books'); i.value='Novig, Bovada, Kalshi'; i.dispatchEvent(new Event('input',{bubbles:true})); }); await p.waitForTimeout(600);
    await p.evaluate(()=>syncOrders(true)); await p.waitForTimeout(900);
    const R=await p.evaluate(()=>{ const tag=re=>{ const els=[...document.querySelectorAll('#placeCards .pcard, #tbody tr')].filter(x=>re.test(x.textContent) && x.querySelector('.ord-tag')); return els.length?els[0].querySelector('.ord-tag').textContent:null; };
      const card=re=>!![...document.querySelectorAll('#placeCards .pcard')].find(x=>re.test(x.textContent)); const vw=document.documentElement.clientWidth;
      return {bg:tag(/Bowling Green/), bgCard:card(/Bowling Green/), ok:tag(/Oklahoma State/), sing:tag(/Singletary/), singCard:card(/Singletary/), sw:document.documentElement.scrollWidth, vw}; });
    check(W+' px: Bowling Green at Novig, Kalshi order on this game: "ORDER WAITING on Kalshi: 3 at 37¢", out of Place these', /ORDER WAITING on Kalshi: 3 at 37¢, not filled/.test(R.bg||'') && !R.bgCard, {tag:R.bg, card:R.bgCard});
    check(W+' px: Oklahoma State at Bovada with no ESPN team codes: "You have a Kalshi order on this team … another game"', /You have a Kalshi order on this team: “Oklahoma St\. vs Kansas St\.”.*another game/.test(R.ok||''), R.ok);
    check(W+' px: Singletary Under 15.5 at Bovada, Kalshi order NO on 16+: ORDER WAITING on Kalshi, out of Place these', /ORDER WAITING on Kalshi: 2 at 50¢/.test(R.sing||'') && !R.singCard, {tag:R.sing, card:R.singCard});
    check(W+' px: nothing runs off the screen', R.sw<=R.vw+1, {sw:R.sw, vw:R.vw});
    check(W+' px: no page errors', !errs.length, errs);
    await ctx.close();
  }
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
