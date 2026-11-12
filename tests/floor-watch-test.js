// node tests/floor-watch-test.js — v4.43. Alonzo: "build", after ChatGPT's review: "move the actionable screen floor to the same conservative chance used
// by OK up to and stake sizing; keep model EV as a separate diagnostic". A row the model passes but the conservative chance does not is WATCH (its own
// group, not placed). Example: model 55.46%, market 52.6%, weight 0.35 → blend 53.60%; at 53.5% the model says +3.7%, the blend +0.2%.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const NOW=Date.parse('2026-11-09T19:00:00Z'), iso=ms=>new Date(ms).toISOString(), DAY='2026-11-09', TIP=Date.parse('2026-11-10T02:30:00Z');
const T=(ha,abbr,loc,nick)=>({ha,id:abbr,abbr,name:loc+' '+nick,loc,nick,logo:'',rec:'',color:'333333',alt:'ffffff'});
const row=(id,name,team,price,fair,mkt)=>({name,team,game:team+' @ X'+id,matchup:team+' @ X'+id,side:'O',sport:'NHL',market:'1.5 Shots',kind:'prop',book:'Novig',offeredRaw:String(Math.round(-100*price/(1-price))),offeredProb:price,fairProb:fair,fairRaw:'',mktProb:mkt,stars:4,evModel:'projection',projValue:2.1,
  gameInfo:{state:'pre',startISO:iso(TIP),timeCT:'',detail:'',teams:[T('away',team,team,team),T('home','X'+id,'X'+id,'X'+id)]},src:'api:NHL:props',apiKey:id,loadedAt:iso(NOW-60e3)});
const ROWS=[row('lek','Jonathan Lekkerimaki','VAN',0.519,0.5546,0.526),   // blend +3.2%: placed
            row('mid','Will Cuylle','NYR',0.535,0.5546,0.526),             // model +3.7%, blend +0.2%: WATCH
            row('nomkt','Elias Pettersson','VAN',0.535,0.5546,null),       // no market: the model alone, as before
            row('low','Quinn Hughes','VAN',0.55,0.5546,0.526)];            // model +0.8%: under the floor, a plain skip (not watch)
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:1280,height:900}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(([R,d])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig, Kalshi',bank:'500',cfgVer:3.03})); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows:R})); }catch(e){} }, [ROWS,DAY]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1300);
  const R=await p.evaluate(()=>Object.fromEntries(lastRows.map(r=>[r.apiKey,{pass:r.pass, stake:+(r.stake||0).toFixed(2), watch:!!r.watch, net:+(r.net*100).toFixed(2), act:r.actNet!=null?+(r.actNet*100).toFixed(2):null, why:(r.flags||[]).filter(f=>f[0]==='out').map(f=>f[1]).join(' | ')}])));
  check('Lekkerimaki: model +6.9%, with the market +3.2%: passes and is staked', R.lek.pass && R.lek.stake>0 && !R.lek.watch && Math.abs(R.lek.act-3.2)<0.1, R.lek);
  check('Cuylle at 53.5%: model +3.7% but +0.2% with the market: WATCH, not passed, no stake, and the reason says both numbers', !R.mid.pass && R.mid.watch && R.mid.stake===0 && /^WATCH · the model likes it \(\+3\.7%\), but with the market it is \+0\.2%, under your 1\.5% floor$/.test(R.mid.why), R.mid);
  check('Pettersson, no market price: the model alone decides, as before (passes, stake capped at the minimum)', R.nomkt.pass && !R.nomkt.watch && R.nomkt.stake>0 && R.nomkt.stake<=1, R.nomkt);
  check('Hughes: model +0.8% is under the floor: a plain skip, not watch', !R.low.pass && !R.low.watch && /net EV under the floor/.test(R.low.why), R.low);
  /* v4.76: Place these is split into the tabs by La Contadora's chance (Lekkerimaki 53.6% and Pettersson 55.5% are under 🪙 Volado, 50 to 60%): read it in every tab and combine. Only its own cards: the 🍀 Just missed and 🔮 Hail Mary cards (.sc-x) are the extras of their tab, not Place these (before v4.76 they were never in Safe's list) */
  const cards=[]; for(const m of ['boring','safe','volado','lucky','clair']){ await p.evaluate(m=>setMode(m),m); await p.waitForTimeout(300); cards.push(...await p.evaluate(()=>[...document.querySelectorAll('#placeCards .sc-card:not(.sc-x)')].map(c=>c.textContent.match(/Lekkerimaki|Cuylle|Pettersson|Hughes/)?.[0]))); }
  check('Place these: Lekkerimaki and Pettersson only (no Cuylle)', cards.includes('Lekkerimaki') && cards.includes('Pettersson') && !cards.includes('Cuylle') && !cards.includes('Hughes'), cards);
  await p.uncheck('#cardsOn'); await p.waitForTimeout(300);
  /* v4.76: Safe's best bets are now split into 😴 Boring, 💪 Machín (Safe's key, the default tab) and 🪙 Volado (where these two are): read the three and combine */
  const safeG={g:[], cu:false}; for(const m of ['boring','safe','volado']){ await p.evaluate(m=>setMode(m),m); await p.waitForTimeout(300); const t=await p.evaluate(()=>({g:[...document.querySelectorAll('#tbody tr.group-row')].map(g=>g.innerText.replace(/\s+/g,' ').trim()), cu:/Cuylle/.test(document.getElementById('tbody').textContent)})); safeG.g.push(...t.g); safeG.cu=safeG.cu||t.cu; }
  check('v4.51: the best-bet tabs (Boring, Machín, Volado; was Safe) list only the best bets: no Watch group and no Cuylle (he is under Suertudo)', !safeG.g.some(g=>/^Watch|JUST MISSED/i.test(g)) && !safeG.cu, safeG);
  await p.evaluate(()=>setMode('lucky')); await p.waitForTimeout(300);
  const groups=await p.evaluate(()=>[...document.querySelectorAll('#tbody tr.group-row')].map(g=>g.innerText.replace(/\s+/g,' ').trim()));
  check('v4.51: 🍀 Suertudo (was Feeling Lucky) lists him, as 🍀 Just missed (his EV with the market is +0.2%, 0% or better), and no Place these there', groups.length===1 && /JUST MISSED/i.test(groups[0]) && await p.evaluate(()=>/Cuylle/.test(document.getElementById('tbody').textContent) && !/Lekkerimaki/.test(document.getElementById('tbody').textContent)), groups);
  await p.selectOption('#boardView','watch'); await p.waitForTimeout(300);
  const only=await p.evaluate(()=>[...document.querySelectorAll('#tbody tr:not(.group-row)')].map(t=>t.textContent.match(/Lekkerimaki|Cuylle|Pettersson|Hughes/)?.[0]).filter(Boolean));
  check('Show › 👀 Watch lists only the watch rows (Cuylle)', only.length===1 && only[0]==='Cuylle', only);
  check('no page errors', !errs.length, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
