// node tests/pass-where-test.js — v4.76 (Alonzo, 11/12, twice: "i see 72, but the rest? look at the tabs on board...6 + 1 + 27...but that doesnt
// equal 72"; "i had already chosen all the apps to bet, but, i dont see them displaying"). The header counts every approved bet; the tabs count only
// what you can bet now, under your filters and book chips, plus the extras offered (🍀 just missed, 🔮 Hail Marys, not approved). "N in the tabs ▸"
// lists where each approved bet is, under the first reason it is not in a tab, so the lines add up to the header. Counting only.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,700)); };
const NOW=Date.parse('2026-11-12T19:00:00Z'), DAY='2026-11-12', TIP=Date.parse('2026-11-13T01:00:00Z'), iso=ms=>new Date(ms).toISOString();
const T=(ha,abbr)=>({ha,id:abbr,abbr,name:abbr+' Team',loc:abbr,nick:'Team',logo:'',rec:'',color:'333333',alt:'ffffff'});
const am=p=>p>=0.5?String(Math.round(-100*p/(1-p))):'+'+Math.round(100*(1-p)/p);
const row=(id,player,c,price,o)=>Object.assign({name:player,team:'T'+id,game:'T'+id+' @ H'+id,matchup:'T'+id+' @ H'+id,side:'O',sport:'NHL',market:'1.5 Shots On Goal',kind:'prop',book:'Novig',offeredRaw:am(price),offeredProb:price,fairProb:c,fairRaw:'',mktProb:c,stars:3,evModel:'market',
  gameInfo:{state:'pre',startISO:iso(TIP),eventId:'7'+id,timeCT:'',detail:'',teams:[T('away','T'+id),T('home','H'+id)]},src:'api:NHL:props',apiKey:id,loadedAt:iso(NOW-60e3)}, o||{});
// one approved bet per place it can be, and one Hail Mary (+700, the math says no: not approved, offered in 🔮 Brujo). India Tiny: Kalshi at 52¢ against
// 62% is too far from the market (an outlier: the $1.00 minimum), and one whole contract costs $0.54: a $0 stake
const ROWS=[row('a','Alpha Machin',0.62,0.58), row('b','Bravo Volado',0.55,0.51),
  row('c','Charlie Started',0.62,0.58,{gameInfo:{state:'in',startISO:iso(NOW-40*60e3),eventId:'7c',timeCT:'',detail:'',teams:[T('away','Tc'),T('home','Hc')]}}),
  row('d','Delta Bet',0.62,0.58), row('e','Echo Nba',0.62,0.58,{sport:'NBA',market:'4.5 Assists',src:'api:NBA:props'}), row('f','Foxtrot Kalshi',0.62,0.58,{book:'Kalshi'}), row('i','India Tiny',0.62,0.52,{book:'Kalshi'}),
  row('g','Golf NoTime',0.62,0.58,{gameInfo:{state:'pre',eventId:'',timeCT:'',detail:'',teams:[]}}), row('h','Hotel Hail',0.10,0.125,{market:'0.5 Goals'})];
(async()=>{ const b=await chromium.launch();
  for(const W of [1280,390,1000,1960]){
    const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:W,height:1000}}); await ctx.clock.install({time:new Date(NOW)});
    await ctx.addInitScript(([R,d])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig, Kalshi',bank:'500',cfgVer:3.03})); localStorage.setItem('mbev.cards','1'); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows:R})); }catch(e){} },[ROWS,DAY]);
    const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
    await p.goto('http://app.test/'); await p.waitForTimeout(1300);
    // Delta: already bet. NHL only (the sport menu). Book chips: Novig only.
    await p.evaluate(()=>{ addToLog(lastRows.find(r=>r.name==='Delta Bet')); filterSport='NHL'; boardBooks=['Novig']; refresh(); }); await p.waitForTimeout(400);
    const v=await p.evaluate(()=>{ const t=x=>x?x.textContent.replace(/\s+/g,' ').trim():null, d=document.querySelector('#cuts .pass-where');
      return {count:t(document.getElementById('count')), sum:t(d&&d.querySelector('summary')), lines:d?[...d.querySelectorAll('.cut-list > div')].map(t):[],
        tabs:[...document.querySelectorAll('#modeBar button')].map(t), pass:lastRows.filter(r=>r.pass).map(r=>r.name).sort(), hail:(lastRows.find(r=>r.name==='Hotel Hail')||{}).xFit||null}; });
    if(W===1280){
      check('eight approved bets (Hotel Hail is a Hail Mary, not approved): the header says 8', v.count==='8' && v.pass.length===8 && !v.pass.includes('Hotel Hail') && v.hail==='hail', {count:v.count, pass:v.pass, hail:v.hail});
      check('the tabs hold 2 of them (💪 Machín 1, 🪙 Volado 1); 🔮 Brujo shows 1, the Hail Mary', /Machín 1$/.test(v.tabs[1]) && /Volado 1$/.test(v.tabs[2]) && /Brujo 1$/.test(v.tabs[4]) && /Boring( 0)?$/.test(v.tabs[0]) && /Suertudo( 0)?$/.test(v.tabs[3]), v.tabs);
      check('next to the header: "2 in the tabs ▸"', v.sum==='2 in the tabs ▸', v.sum);
      const want=['Where the 8 approved bets are:','2 in the tabs, to bet now: 💪 1 · 🪙 1','1 in games that started or closed: can’t bet now','1 already bet (or an order waiting)','1 can’t confirm the game on ESPN: check the app','1 $0 stake: daily max, game cap, one per player or under the minimum',
        '1 hidden by your filters (sport, search, Settings, only my games, only sweet spot)','1 hidden by the book chips: tap All','The tab buttons also count 1 🔮 Hail Mary offered to you: not approved by La Contadora, so not in the 8.'];
      check('it lists each one under why it is not in a tab: started, already bet, can’t confirm, $0 stake, sport filter, book chips; and says what else the tab buttons count', JSON.stringify(v.lines)===JSON.stringify(want), v.lines);
      const sum=v.lines.map(x=>+(x.match(/^(\d+) (?!🔮|🍀)/)||[])[1]||0).reduce((a,b)=>a+b,0);
      check('the lines add up to the header: 2 + 1 + 1 + 1 + 1 + 1 + 1 = 8', sum===8, sum);
      await p.evaluate(()=>{ boardBooks=[]; filterSport=''; refresh(); }); await p.waitForTimeout(300);
      const v2=await p.evaluate(()=>{ const d=document.querySelector('#cuts .pass-where'); return {sum:d&&d.querySelector('summary').textContent.trim(), lines:d?[...d.querySelectorAll('.cut-list > div')].map(x=>x.textContent.trim()):[]}; });
      check('with every book chip and every sport: Echo (NBA, 💪) and Foxtrot (Kalshi, 💪) are in the tabs: "4 in the tabs ▸"', v2.sum==='4 in the tabs ▸' && v2.lines[1]==='4 in the tabs, to bet now: 💪 3 · 🪙 1', v2); }
    // the list opens on screen, at every width (on a phone, inside the opened top box)
    await p.evaluate(()=>{ const f=document.getElementById('sbFoldBtn'); const h=f&&f.closest('.head'); if(h && getComputedStyle(f).display!=='none' && !h.classList.contains('sb-open')) f.click(); const d=document.querySelector('#cuts .pass-where'); if(d) d.open=true; }); await p.waitForTimeout(250);
    const L=await p.evaluate(()=>{ const l=document.querySelector('#cuts .pass-where .cut-list'), r=l&&l.getBoundingClientRect(); return {over:document.documentElement.scrollWidth-innerWidth, left:r?Math.round(r.left):null, right:r?Math.round(r.right):null, vw:innerWidth, shown:!!(r&&r.width)}; });
    check(W+' px: the list opens inside the screen, no sideways scroll', L.shown && L.over<=0 && L.left>=0 && L.right<=L.vw, L);
    check('no page errors ('+W+')', !errs.length, errs); await ctx.close(); }
  await b.close(); console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(fail?1:0); })();
