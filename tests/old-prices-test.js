// node tests/old-prices-test.js — v4.77 (Alonzo, 11/11: "could we put the older bets in another category. or Tab in itself. If sentinels takes them
// out of jail, then good. but, lets not mix them with our regular tabs"). A card whose price was read more than 12 hours ago is listed under ⏱ Old,
// whatever its chance; a Sentinels press that reads a fresh price sends it back to its tab. A bet you hold stays where it is. Listing only: same stakes.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,700)); };
const NOW=Date.parse('2026-11-12T19:00:00Z'), DAY='2026-11-12', TIP=Date.parse('2026-11-13T01:00:00Z'), iso=ms=>new Date(ms).toISOString(), H=3600e3;
const T=(ha,abbr)=>({ha,id:abbr,abbr,name:abbr+' Team',loc:abbr,nick:'Team',logo:'',rec:'',color:'333333',alt:'ffffff'});
const am=p=>p>=0.5?String(Math.round(-100*p/(1-p))):'+'+Math.round(100*(1-p)/p);
const row=(id,player,c,price,age,o)=>Object.assign({name:player,team:'T'+id,game:'T'+id+' @ H'+id,matchup:'T'+id+' @ H'+id,side:'O',sport:'NHL',market:'1.5 Shots On Goal',kind:'prop',book:'Novig',offeredRaw:am(price),offeredProb:price,fairProb:c,fairRaw:'',mktProb:c,stars:3,evModel:'market',
  gameInfo:{state:'pre',startISO:iso(TIP),eventId:'7'+id,timeCT:'',detail:'',teams:[T('away','T'+id),T('home','H'+id)]},src:'api:NHL:props',apiKey:id,loadedAt:iso(NOW-age)}, o||{});
const ROWS=[row('a','Fresh Machin',0.62,0.58,60e3), row('b','Stale Machin',0.62,0.58,13*H), row('c','Stale Brujo',0.40,0.36,5*24*H), row('d','Eleven Volado',0.55,0.51,11*H),
  row('e','Stale Hail',0.10,0.125,20*H,{market:'0.5 Goals'}), row('f','Fresh Hail',0.10,0.125,60e3,{market:'0.5 Goals'}), row('g','Held Old',0.62,0.58,2*24*H)];
(async()=>{ const b=await chromium.launch();
  for(const W of [1280,390,1000,1960]){
    const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:W,height:1000}}); await ctx.clock.install({time:new Date(NOW)});
    await ctx.addInitScript(([R,d])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig',bank:'500',cfgVer:3.03})); localStorage.setItem('mbev.cards','1'); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows:R})); }catch(e){} },[ROWS,DAY]);
    const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); let fresh=false;
    await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
      if(/\/live\?/.test(u)){ const bets=JSON.parse(decodeURIComponent(u.split('bets=')[1])), R={}; bets.forEach(d=>{ if(fresh && d.name==='Stale Machin' && d.book==='novig') R[d.id]={ok:true, price:0.58, bid:0.56, at:Date.now()}; }); return r.fulfill({contentType:'application/json',body:JSON.stringify({results:R})}); }
      if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
    await p.goto('http://app.test/'); await p.waitForTimeout(1300);
    await p.evaluate(()=>{ addToLog(lastRows.find(r=>r.name==='Held Old')); refresh(); }); await p.waitForTimeout(300);
    const tabs=()=>p.evaluate(()=>[...document.querySelectorAll('#modeBar button')].map(x=>x.textContent.replace(/\s+/g,' ').trim()));
    const t1=await tabs();
    if(W===1280){
      check('six tabs: ⏱ Old after 🔮 Brujo; it holds 3 (Stale Machin 13 h, Stale Brujo 5 d, the Stale Hail Hail Mary 20 h)', t1.length===6 && /^⏱ Old 3$/.test(t1[5]) && /^💪 Machín 1$/.test(t1[1]) && /^🪙 Volado 1$/.test(t1[2]) && /^🔮 Brujo 1$/.test(t1[4]), t1);
      const st=await p.evaluate(()=>{ const g=n=>lastRows.find(r=>r.name===n); return {fresh:g('Fresh Machin').stake, stale:g('Stale Machin').stake, held:modeFamOf(g('Held Old')), eleven:modeFamOf(g('Eleven Volado'))}; });
      check('listing only: Stale Machin keeps the same stake as Fresh Machin (same chance, same price)', st.stale>0 && Math.abs(st.stale-st.fresh)<1e-9, st);
      check('a bet you hold stays where it is (Held Old, 2 days old, already bet: 💪 Machín); 11 hours is not old (🪙 Volado)', st.held==='safe' && st.eleven==='volado', st);
      await p.evaluate(()=>setMode('old')); await p.waitForTimeout(400);
      const v=await p.evaluate(()=>{ const t=x=>x?x.textContent.replace(/\s+/g,' ').trim():null; return {cards:[...document.querySelectorAll('#placeCards .sc-card')].map(c=>(c.textContent.match(/(Fresh Machin|Stale Machin|Stale Brujo|Eleven Volado|Stale Hail|Fresh Hail|Held Old)/)||[])[1]),
        heads:[...document.querySelectorAll('#placeCards .pc-head')].map(t), contadora:t(document.getElementById('contadora'))}; });
      check('⏱ Old lists Stale Machin, Stale Brujo and the Stale Hail Hail Mary, nothing fresh', JSON.stringify(v.cards.slice().sort())===JSON.stringify(['Stale Brujo','Stale Hail','Stale Machin']), v.cards);
      check('its Place these says what YES means here: "⏱ Read more than 12 hours ago: La Contadora said YES at these prices. Check each price at the book first …"', /Place these · ⏱ old prices · 2/.test(v.heads[0]||'') && /⏱ Read more than 12 hours ago: La Contadora said YES at these prices\. Check each price at the book first/.test(v.heads[0]||''), v.heads);
      check('La Contadora says to check them first', /more than 12 hours old\. I said yes at those prices, not at today’s\. Check each one first/.test(v.contadora||''), v.contadora);
      const pw=await p.evaluate(()=>[...document.querySelectorAll('#cuts .pass-where .cut-list > div')].map(x=>x.textContent.trim()));
      check('"N elsewhere ▸" says how many approved bets are in ⏱ Old (and 2 to bet now: Fresh Machin, Eleven Volado)', pw.includes('2 in ⏱ Old: read more than 12 hours ago, check each price first') && pw.some(x=>/^2 to bet now: 💪 1 · 🪙 1\./.test(x)), pw);
      // a Sentinels press reads a fresh Novig price for Stale Machin: back to 💪 Machín
      fresh=true; await p.evaluate(async()=>{ await shopExchanges(); }); await p.waitForTimeout(400);
      const t2=await tabs();
      check('after a Sentinels press reads Stale Machin fresh at Novig, it is back under 💪 Machín (2); ⏱ Old 2', /^💪 Machín 2$/.test(t2[1]) && /^⏱ Old 2$/.test(t2[5]), t2); }
    const over=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth); check(W+' px: six tabs, no sideways scroll', over<=0 && t1.length===6, {over, n:t1.length});
    check('no page errors ('+W+')', !errs.length, errs); await ctx.close(); }
  await b.close(); console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(fail?1:0); })();
