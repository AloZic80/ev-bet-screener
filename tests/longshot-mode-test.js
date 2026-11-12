// node tests/longshot-mode-test.js — v4.74 (Alonzo, USC +251 and Kraken +251 under Safe at 28.5%: "Safe are leans and such ... Have them only where
// they belong"): a bet La Contadora approves with a chance under 45% is listed under 🔮 Clairvoyant ("edge · long shot"), not 🛡️ Safe. Only where it
// is listed: its stake and the math do not change. By hand: model 42%, market 38% → 0.38 + 0.35 × 0.04 = 39.4% at 36% (+9.44%): a long shot.
// Model 58%, market 56% → 56.7% at 52% (+9.0%): a lean, stays in Safe.
// v4.76 (five tabs by La Contadora’s chance): Clairvoyant is 🔮 Brujo; the 56.7% lean is listed under 🪙 Volado (50–60%); the app opens on 💪 Machín (key safe, 60–75%).
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,600)); };
const NOW=Date.parse('2026-11-12T19:00:00Z'), DAY='2026-11-12', TIP=Date.parse('2026-11-13T01:00:00Z'), iso=ms=>new Date(ms).toISOString();
const T=(ha,abbr)=>({ha,id:abbr,abbr,name:abbr+' Team',loc:abbr,nick:'Team',logo:'',rec:'',color:'333333',alt:'ffffff'});
const am=p=>p>=0.5?String(Math.round(-100*p/(1-p))):'+'+Math.round(100*(1-p)/p);
const row=(id,team,opp,price,fair,mkt,kind)=>({name:team,team,game:team+' @ '+opp,matchup:team+' @ '+opp,side:kind==='prop'?'O':'',sport:'NHL',market:kind==='prop'?'1.5 Shots On Goal':'Moneyline',kind:kind||'moneyline',book:'Novig',offeredRaw:am(price),offeredProb:price,fairProb:fair,fairRaw:'',mktProb:mkt,stars:null,evModel:'market',
  gameInfo:{state:'pre',startISO:iso(TIP),eventId:'6600'+id,timeCT:'',detail:'',teams:[T('away',team),T('home',opp)]},src:'api:NHL:lines',apiKey:id,loadedAt:iso(NOW-60e3)});
const ROWS=[row('L','SEA','CAR',0.36,0.42,0.38), row('S','BOS','NYR',0.52,0.58,0.56)];
(async()=>{ const b=await chromium.launch();
  for(const W of [1280,390]){
    const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:W,height:1000}}); await ctx.clock.install({time:new Date(NOW)});
    await ctx.addInitScript(([R,d])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig',bank:'500',cfgVer:3.03})); localStorage.setItem('mbev.cards','1'); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows:R})); }catch(e){} },[ROWS,DAY]);
    const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
    await p.goto('http://app.test/'); await p.waitForTimeout(1300);
    const R=await p.evaluate(()=>Object.fromEntries(lastRows.map(r=>[r.apiKey,{act:+r.actProb.toFixed(4), stake:r.stake, pass:!!r.pass, fam:modeFamOf(r)}])));
    check(W+' px: SEA at 39.4% passes with its stake ($1.00) and belongs to Clairvoyant (v4.76: 🔮 Brujo, family hail); BOS at 56.7% passes and stays in Safe (v4.76: with the leans, under 🪙 Volado, 50–60%)', R.L.pass && R.L.stake===1 && Math.abs(R.L.act-0.394)<1e-4 && R.L.fam==='hail' && R.S.pass && R.S.stake>0 && Math.abs(R.S.act-0.567)<1e-4 && R.S.fam==='volado', R);
    const look=async()=>p.evaluate(()=>({safe:(document.querySelector('[data-mode="safe"]')||document.body).textContent.replace(/\s+/g,' ').trim(), volado:(document.querySelector('[data-mode="volado"]')||document.body).textContent.replace(/\s+/g,' ').trim(), clair:(document.querySelector('[data-mode="clair"]')||document.body).textContent.replace(/\s+/g,' ').trim(),
      list:[...document.querySelectorAll('#placeCards .sc-card, #tbody tr:not(.group-row)')].map(x=>x.textContent).join(' | '), head:(document.querySelector('#placeCards .pc-head')||{}).textContent||''}));
    const vM=await look();   // 💪 Machín (key safe, 60–75%), where the app opens
    await p.evaluate(()=>setMode('volado')); await p.waitForTimeout(400); let v=await look();   /* v4.76: BOS at 56.7% is listed under 🪙 Volado (50–60%); Machín lists neither bet */
    check(W+' px: Safe lists BOS and not SEA; the Safe button says 1 (v4.76: 🪙 Volado lists BOS and not SEA, its button says 1; 💪 Machín, where the app opens, lists neither and says 0)', /BOS/.test(v.list) && !/SEA/.test(v.list) && /Volado\s*1/.test(v.volado) && !/SEA/.test(vM.list) && !/BOS/.test(vM.list) && /Machín\s*0/.test(vM.safe), {machin:{safe:vM.safe, list:vM.list.slice(0,200)}, volado:v.volado, list:v.list.slice(0,200)});
    await p.evaluate(()=>setMode('clair')); await p.waitForTimeout(400); v=await look();
    check(W+' px: Clairvoyant (v4.76: 🔮 Brujo) lists SEA under "Place these · 🔮 edge · long shots", at $1.00; not BOS; its button counts it', /SEA/.test(v.list) && !/BOS/.test(v.list) && /edge · long shots/.test(v.head) && /Brujo\s*[1-9]/.test(v.clair), {head:v.head, clair:v.clair, list:v.list.slice(0,200)});
    // a long shot freed from Skipping Jail by a Sentinels press (🔓) is listed under Clairvoyant too, never Safe; a freed lean stays in Safe
    /* v4.76: Clairvoyant is 🔮 Brujo; the lean BOS (56.7%) is under 🪙 Volado, so Volado is read as well as Machín (key safe) */
    const fj=await p.evaluate(()=>{ lastRows.forEach(r=>{ r.freed=true; }); setMode('safe'); const safeList=[...document.querySelectorAll('#placeCards .sc-card, #tbody tr:not(.group-row)')].map(x=>x.textContent).join(' | ');
      setMode('volado'); const voladoList=[...document.querySelectorAll('#placeCards .sc-card, #tbody tr:not(.group-row)')].map(x=>x.textContent).join(' | ');
      setMode('clair'); const clairList=[...document.querySelectorAll('#placeCards .sc-card, #tbody tr:not(.group-row)')].map(x=>x.textContent).join(' | ');
      return {safeSEA:/SEA/.test(safeList), voladoSEA:/SEA/.test(voladoList), voladoBOS:/BOS/.test(voladoList), clairSEA:/SEA/.test(clairList), freed:/out of Skipping Jail/.test(clairList)}; });
    check(W+' px: out of Skipping Jail: the freed long shot (SEA) shows under Clairvoyant (v4.76: 🔮 Brujo) with "🔓 out of Skipping Jail", not under Safe (v4.76: not under 💪 Machín or 🪙 Volado); the freed lean (BOS) stays in Safe (v4.76: in 🪙 Volado)', !fj.safeSEA && !fj.voladoSEA && fj.voladoBOS && fj.clairSEA && fj.freed, fj);
    const st=await p.evaluate(()=>lastRows.find(r=>r.apiKey==='L').stake);
    check(W+' px: the stake did not change ($1.00)', st===1, st);
    check('no page errors ('+W+')', !errs.length, errs); await ctx.close(); }
  await b.close(); console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(fail?1:0); })();
