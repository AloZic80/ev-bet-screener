// node tests/order-tag-test.js — v4.18. Alonzo: "put the note on the bet that is technically still open, I need an identifier so I won't bet
// twice". The card itself (and the table row) now says when you already have an order on that team: this game (ORDER WAITING, even when
// Kalshi's team code is not ESPN's), another game ("this one is not placed"), or the other team in this game. Phone (390) and computer (1280).
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const NOW=Date.parse('2026-11-07T14:00:00Z'), iso=ms=>new Date(ms).toISOString(), DAY='2026-11-07', SAT14=Date.parse('2026-11-14T17:00:00Z'), TODAY=Date.parse('2026-11-07T23:00:00Z');
const T=(ha,abbr,loc,nick,short)=>({ha,id:abbr,abbr,name:short,loc,nick,logo:'',rec:'',color:'333333',alt:'ffffff'});
const row=(team,away,home,teams,k,start)=>({name:team,team,game:away+' @ '+home,matchup:away+' @ '+home,side:'',sport:'NCAAF',market:'Moneyline',kind:'moneyline',book:'Kalshi',offeredRaw:'+104',offeredProb:0.49,fairProb:0.52,fairRaw:'',mktProb:0.52,stars:null,evModel:'market',
  gameInfo:{state:'pre',startISO:iso(start),timeCT:'',detail:'',teams},src:'api:oddsapi:NCAAF',apiKey:k});
const OK=[T('away','TTU','Texas Tech','Red Raiders','Texas Tech'),T('home','OKST','Oklahoma State','Cowboys','Oklahoma St')], BG=[T('away','KENT','Kent State','Golden Flashes','Kent State'),T('home','BGSU','Bowling Green','Falcons','Bowling Green')], NC=[T('away','LOU','Louisville','Cardinals','Louisville'),T('home','UNC','North Carolina','Tar Heels','North Carolina')];
const ROWS=[row('Oklahoma State Cowboys','Texas Tech Red Raiders','Oklahoma State Cowboys',OK,'k1',SAT14), row('Bowling Green Falcons','Kent State Golden Flashes','Bowling Green Falcons',BG,'k2',TODAY), row('North Carolina Tar Heels','Louisville Cardinals','North Carolina Tar Heels',NC,'k3',TODAY)];
const ORD={orders:[
  {id:'o1',book:'kalshi',ref:'KXNCAAFGAME-26NOV07OKSTKSU-OKST',side:'yes',action:'buy',price:0.49,qty:2,title:null,bet:{sport:'NCAAF',kind:'moneyline',team:'OKST',teamsCode:'OKSTKSU',start:iso(TODAY)}},          // another game, no title (ticker only)
  {id:'o2',book:'kalshi',ref:'KXNCAAFGAME-26NOV07KENTBG-BG',side:'yes',action:'buy',price:0.37,qty:3,title:'Kent St. vs Bowling Green',bet:{sport:'NCAAF',kind:'moneyline',team:'BG',teamsCode:'KENTBG',start:iso(TODAY)}},   // THIS game, Kalshi code BG (ESPN BGSU)
  {id:'o3',book:'kalshi',ref:'KXNCAAFGAME-26NOV07LOUUNC-LOU',side:'yes',action:'buy',price:0.55,qty:1,title:'Louisville at North Carolina',bet:{sport:'NCAAF',kind:'moneyline',team:'LOU',teamsCode:'LOUUNC',start:iso(TODAY)}}]};   // the other team
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
    await p.evaluate(()=>{ const i=document.getElementById('books'); i.value='Kalshi'; i.dispatchEvent(new Event('input',{bubbles:true})); }); await p.waitForTimeout(600);
    await p.evaluate(()=>syncOrders(true)); await p.waitForTimeout(900);
    const R=await p.evaluate(()=>{ const card=re=>{ const c=[...document.querySelectorAll('#placeCards .pcard')].find(x=>re.test(x.textContent)); return c?((c.querySelector('.ord-tag')||{}).textContent||'(no tag)'):null; };
      const row=re=>{ const t=[...document.querySelectorAll('#tbody tr')].find(x=>re.test(x.textContent) && x.querySelector('.ord-tag')); return t?t.querySelector('.ord-tag').textContent:null; };
      const vw=document.documentElement.clientWidth; return {ok:card(/Oklahoma State/), bg:card(/Bowling Green/), bgRow:row(/Bowling Green/), nc:card(/North Carolina/), spill:[...document.querySelectorAll('.ord-tag')].some(e=>e.getBoundingClientRect().right>vw+1), sw:document.documentElement.scrollWidth, vw}; });
    check(W+' px: Oklahoma State (11/14): "You have a Kalshi order on this team … (Sat, 11/7), 2 at 49¢, not filled. That is another game: this one is not placed"', /You have a Kalshi order on this team: “KXNCAAFGAME-26NOV07OKSTKSU-OKST” \(Sat, 11\/7\), 2 at 49¢, not filled\. That is another game: this one is not placed/.test(R.ok||''), R.ok);
    check(W+' px: Bowling Green, the same game, Kalshi code BG (not ESPN\'s BGSU): ORDER WAITING, out of Place these, tagged on its row', R.bg===null && /ORDER WAITING on Kalshi: 3 at 37¢, not filled\. Already placed: do not bet it again/.test(R.bgRow||''), {card:R.bg, row:R.bgRow});
    check(W+' px: North Carolina: your order in this game is on the other team (Louisville)', /Your Kalshi order in this game is on the other team: “Louisville at North Carolina”, 1 at 55¢, not filled/.test(R.nc||''), R.nc);
    check(W+' px: the tags wrap, nothing runs off the screen', !R.spill && R.sw<=R.vw+1, {sw:R.sw, vw:R.vw});
    check(W+' px: no page errors', !errs.length, errs);
    await ctx.close();
  }
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
