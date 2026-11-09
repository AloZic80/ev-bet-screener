// node tests/game-hub-test.js — v4.35. Alonzo: "Build" (Augi's screens, step 2: Live Games). Augi's Game Hub on our data: sport buttons, Scheduled / Live /
// Final with counts, a day, game cards (bets risking, props on the board); tap a game: score, ESPN's line with the vig out, last plays, your bets in
// it, the board's props for that exact game with La Contadora's decision and a search; See on Board fills the board search. ESPN stubbed; no Worker.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const NOW=Date.parse('2026-11-09T19:30:00Z'), H=3600e3, iso=ms=>new Date(ms).toISOString(), DAY='2026-11-09';
const team=(ha,ab,name,sc)=>({homeAway:ha, score:String(sc), team:{abbreviation:ab, displayName:name, logo:''}});
const game=(id,a,an,h,hn,sa,sh,state,det,t)=>({id, date:iso(t), status:{type:{state, shortDetail:det, detail:det}}, competitions:[{competitors:[team('away',a,an,sa),team('home',h,hn,sh)]}]});
const SB={events:[game('401','LAC','LA Clippers','MIN','Minnesota Timberwolves',61,68,'in','3rd 5:12',NOW-H), game('402','MIA','Miami Heat','NY','New York Knicks',0,0,'pre','',NOW+3*H), game('403','PHI','Philadelphia 76ers','CHI','Chicago Bulls',101,99,'post','Final',NOW-5*H)]};
const SUM={pickcenter:[{provider:{name:'ESPN BET'}, details:'MIN -4.5', overUnder:221.5, awayTeamOdds:{moneyLine:150}, homeTeamOdds:{moneyLine:-170}}], plays:[{text:'Edwards makes 3-pt jump shot',clock:{displayValue:'5:40'},period:{number:3}},{text:'Reid defensive rebound',clock:{displayValue:'5:12'},period:{number:3}}]};
const T=(ha,abbr,loc,nick)=>({ha,id:abbr,abbr,name:loc+' '+nick,loc,nick,logo:'',rec:'',color:'333333',alt:'ffffff'});
const prop=(name,team,market,p,fair,mkt,k)=>({name,team,game:'LAC @ MIN',matchup:'LAC @ MIN',side:'O',sport:'NBA',market,kind:'prop',book:'Novig',offeredRaw:'-108',offeredProb:p,fairProb:fair,fairRaw:'',mktProb:mkt,stars:4,evModel:'market',
  gameInfo:{state:'pre',startISO:iso(NOW+2*H),eventId:'401',timeCT:'',detail:'',teams:[T('away','LAC','Los Angeles','Clippers'),T('home','MIN','Minnesota','Timberwolves')]},src:'api:NBA:props',apiKey:k,loadedAt:iso(NOW-60e3)});
const ROWS=[prop('Naz Reid','MIN','16.5 Points',0.52,0.545,0.54,'k1'), prop('Rudy Gobert','MIN','11.5 Rebounds',0.50,0.535,0.53,'k2'), prop('Kris Dunn','LAC','5.5 Assists',0.60,0.50,0.50,'k3'),
  Object.assign(prop('Jalen Brunson','NY','25.5 Points',0.52,0.545,0.54,'k4'),{game:'MIA @ NY',matchup:'MIA @ NY',gameInfo:{state:'pre',startISO:iso(NOW+3*H),eventId:'402',timeCT:'',detail:'',teams:[T('away','MIA','Miami','Heat'),T('home','NY','New York','Knicks')]}})];
const LOG=[{id:'b1',key:'b1',name:'MIN',sport:'NBA',kind:'moneyline',market:'Moneyline',side:'',team:'MIN',game:'LAC @ MIN',matchup:'LAC @ MIN',book:'Kalshi',odds:'-150',offeredRaw:'-150',stake:4,date:DAY,dateSet:true,start:iso(NOW-H)}];
(async()=>{
  const b=await chromium.launch();
  for(const W of [1280,390]){
    const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:W,height:900}}); await ctx.clock.install({time:new Date(NOW)});
    await ctx.addInitScript(([R,L,d])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig',cfgVer:3.03})); localStorage.setItem('mbev.log',JSON.stringify(L)); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows:R})); }catch(e){} }, [ROWS,LOG,DAY]);
    const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); const worker=[];
    await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
      if(/api\.0xbeta\.dev/.test(u)){ worker.push(u); return r.fulfill({contentType:'application/json',body:'{}'}); }
      if(/basketball\/nba\/scoreboard/.test(u)) return r.fulfill({contentType:'application/json',body:JSON.stringify(SB)});
      if(/basketball\/nba\/summary\?event=401/.test(u)) return r.fulfill({contentType:'application/json',body:JSON.stringify(SUM)});
      if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
    await p.goto('http://app.test/'); await p.waitForTimeout(1000);
    await p.click('.tabs .tab[data-view="v-live"]'); await p.waitForTimeout(800);
    await p.evaluate(()=>document.querySelector('#hubSports [data-sp="NBA"]').click()); await p.waitForTimeout(500);
    const top=await p.evaluate(()=>({sports:[...document.querySelectorAll('#hubSports [data-sp]')].map(x=>x.textContent), filt:[...document.querySelectorAll('#hubFilter [data-f]')].map(x=>x.textContent.trim()), cards:[...document.querySelectorAll('#hubGames .hub-card')].map(c=>c.innerText.replace(/\s+/g,' '))}));
    check(W+' px: sport buttons, and Scheduled · 1 / Live · 1 / Final · 1 for the day', top.sports.includes('NBA') && top.sports.includes('NFL') && top.filt.join('|')==='Scheduled · 1|Live · 1|Final · 1', top);
    check(W+' px: Scheduled shows Miami at New York with its tip-off time', top.cards.length===1 && /MIA/.test(top.cards[0]) && /NY/.test(top.cards[0]) && /CT/.test(top.cards[0]), top.cards);
    await p.evaluate(()=>document.querySelector('#hubFilter [data-f="live"]').click()); await p.waitForTimeout(500);
    const live=await p.evaluate(()=>[...document.querySelectorAll('#hubGames .hub-card')].map(c=>c.innerText.replace(/\s+/g,' ')));
    check(W+' px: Live shows Clippers at Wolves 61–68, 3rd 5:12, your bet risking $4.00, 3 props on your board', live.length===1 && /61/.test(live[0]) && /68/.test(live[0]) && /3rd 5:12/.test(live[0]) && /1 bet risking \$4\.00/.test(live[0]) && /3 props on your board/.test(live[0]), live);
    await p.evaluate(()=>document.querySelector('#hubGames .hub-card').click()); await p.waitForTimeout(600);
    const g=await p.evaluate(()=>document.getElementById('hubGame').innerText.replace(/\s+/g,' '));
    check(W+' px: the game: ESPN line LAC +150 (38.2% no-vig) and MIN -170 (61.8%), spread and total', /LAC \+150 \(38\.\d% no-vig\)/.test(g) && /MIN -170 \(61\.\d% no-vig\)/.test(g) && /MIN -4\.5/.test(g) && /total 221\.5/.test(g), g.slice(0,300));
    check(W+' px: last plays, newest first', /Reid defensive rebound.*Edwards makes 3-pt/.test(g), g.match(/Last plays.*?Your bets/)?.[0]);
    check(W+' px: your bet in this game (MIN moneyline, $4.00, Kalshi, open)', /Your bets in this game MIN/.test(g) && /\$4\.00/.test(g) && /open/.test(g), g.match(/Your bets in this game.*?Props on/)?.[0]);
    check(W+' px: the board props for this exact game (3, not Brunson from another game), each marked STARTED: the game is on', /3 of 3 on your board/.test(g) && /STARTED Naz Reid/.test(g) && /STARTED Rudy Gobert/.test(g) && /STARTED Kris Dunn/.test(g) && !/Brunson/.test(g), g.match(/Props on your board.*$/)?.[0].slice(0,300));
    await p.fill('#hubQ','reb'); await p.waitForTimeout(400);
    const q=await p.evaluate(()=>({items:[...document.querySelectorAll('#hubGame .hub-list:last-of-type li')].map(l=>l.innerText.replace(/\s+/g,' ')), focus:document.activeElement&&document.activeElement.id}));
    check(W+' px: the exact-game search "reb" keeps only Gobert\'s rebounds, and the box keeps the cursor', q.items.length===1 && /Gobert/.test(q.items[0]) && q.focus==='hubQ', q);
    const keepQ=await p.evaluate(()=>1);
    await p.evaluate(()=>document.querySelector('#hubFilter [data-f="scheduled"]').click()); await p.waitForTimeout(400);
    await p.evaluate(()=>document.querySelector('#hubGames .hub-card').click()); await p.waitForTimeout(500);
    const g2=await p.evaluate(()=>{ const q=document.getElementById('hubQ'); if(q && q.value){ q.value=''; q.dispatchEvent(new Event('input',{bubbles:true})); } return 1; }); await p.waitForTimeout(400);
    const pre=await p.evaluate(()=>document.getElementById('hubGame').innerText.replace(/\s+/g,' '));
    check(W+' px: the scheduled game (Miami at New York): Brunson is a BET with La Contadora\'s stake', /BET \$\d+\.\d\d Jalen Brunson/.test(pre), pre.match(/Props on your board.*$/)?.[0].slice(0,200));
    await p.evaluate(()=>document.querySelector('#hubGame .hub-see').click()); await p.waitForTimeout(500);
    const bd=await p.evaluate(()=>({view:(document.querySelector('.view.on')||{}).id, q:document.getElementById('filterPlayer').value}));
    check(W+' px: See on Board opens the Board with the player in its search', bd.view==='v-board' && bd.q==='Jalen Brunson', bd);
    check(W+' px: the hub made no Worker calls', !worker.some(u=>/summary|scoreboard|hub/.test(u)), worker.length);
    if(W===390){ const fit=await p.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1); check('390 px: nothing scrolls sideways', fit, fit); }
    check(W+' px: no page errors', !errs.length, errs);
    await ctx.close();
  }
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
