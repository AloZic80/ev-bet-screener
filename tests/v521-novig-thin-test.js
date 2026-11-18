// node tests/v521-novig-thin-test.js — v5.21 (owner 11/17: "please fix"). Mamukelashvili O1.5 threes at Novig: the card said 55.0% and Novig filled him at
// 55%, but Novig's peer book read "Yes 65%" (1 − the 35¢ No bid) with his own side's bid at 43.5¢: a 21.5-point gap. I bet this filled 65.0% (−186) and said
// skip. A gap over 10 points is a thin reading: it never fills the form, is not shown as "Novig now", and is not used as a hold. Label only.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,600)); };
const NOW=Date.parse('2026-11-17T23:00:00Z'), iso=ms=>new Date(ms).toISOString(), TIP=Date.parse('2026-11-18T01:00:00Z');
const T=(ha,abbr)=>({ha,id:abbr,abbr,name:abbr+' Team',loc:abbr,nick:'Team',logo:'',rec:'',color:'333333',alt:'ffffff'});
const GI=(e)=>({state:'pre',startISO:iso(TIP),eventId:e,timeCT:'',detail:'',teams:[T('away','SAS'),T('home','POR')]});
const am=p=>p>=0.5?String(Math.round(-100*p/(1-p))):'+'+Math.round(100*(1-p)/p);
const ROWS=[{name:'Sidy Mamukelashvili',team:'SAS',game:'SAS @ POR',matchup:'SAS @ POR',side:'O',sport:'NBA',market:'1.5 Threes',kind:'prop',book:'Novig',offeredRaw:am(0.54),offeredProb:0.54,fairProb:0.585,fairRaw:'',mktProb:0.575,stars:3,evModel:'market',gameInfo:GI('g1'),src:'api:NBA:props',apiKey:'g1',loadedAt:iso(NOW-60e3)}];
const MODES=['boring','tranqui','safe','parejo','volado','dado','lucky','clair'];
(async()=>{ const b=await chromium.launch(); const errs=[];
  // unit checks of the rule
  { const ctx=await b.newContext(); const p=await ctx.newPage(); p.on('pageerror',e=>errs.push(e.message));
    await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
    await p.goto('http://app.test/'); await p.waitForTimeout(1000);
    const U=await p.evaluate(()=>({owner:thinQ({ok:true,src:'novig',price:0.65,bid:0.435}), normal:thinQ({ok:true,src:'novig',price:0.56,bid:0.54}), edge10:thinQ({ok:true,src:'kalshi',price:0.60,bid:0.50}), noBid:thinQ({ok:true,src:'novig',price:0.6,bid:null}), flagged:thinQ({ok:true,src:'novig',price:0.6,bid:0.58,thin:true}), notOk:thinQ({ok:false,price:0.65,bid:0.4})}));
    check('the owner’s example (ask 65.0%, own bid 43.5%, a 21.5-point gap) is thin', U.owner===true, U);
    check('a normal book (56% vs 54%) is not thin', U.normal===false, U);
    check('exactly 10 points is not thin (over 10 is)', U.edge10===false, U);
    check('no bid on your side: not called thin by the app (no guess)', U.noBid===false, U);
    check('a quote the Worker marks thin is thin', U.flagged===true, U);
    check('a failed read is not thin', U.notOk===false, U);
    await ctx.close(); }
  // the form, with the owner's exact numbers and with a normal book
  for(const [label,Q] of [['thin',{price:0.65,bid:0.435}],['normal',{price:0.56,bid:0.54}]]){
    const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:1280,height:900}}); await ctx.clock.install({time:new Date(NOW)});
    await ctx.addInitScript(([R])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig',bank:'500',cfgVer:3.03})); localStorage.setItem('mbev.cards','1'); localStorage.setItem('mbev.mode',JSON.stringify({mode:'safe'})); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:'2026-11-17',rows:R})); }catch(e){} },[ROWS]);
    const p=await ctx.newPage(); p.on('pageerror',e=>errs.push(label+': '+e.message));
    await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
      if(/\/live\?/.test(u)){ const bets=JSON.parse(decodeURIComponent(u.split('bets=')[1])), R={}; bets.forEach(d=>{ R[d.id]=/novig/i.test(d.book)?Object.assign({ok:true,src:'novig',at:new Date(NOW).toISOString(),outcome:'o1',title:'Mamukelashvili 1.5+ threes · Yes',ref:'m1'},Q):{ok:false,note:'no market at your line'}; }); return r.fulfill({contentType:'application/json',body:JSON.stringify({results:R})}); }
      if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
    await p.goto('http://app.test/'); await p.waitForTimeout(1500);
    const found=await p.evaluate(async(M)=>{ for(const m of M){ try{ setMode(m); }catch(e){} await new Promise(r=>setTimeout(r,250)); const c=[...document.querySelectorAll(".sc-card")].find(x=>x.textContent.includes("Mamukel")); (window._dbg=window._dbg||[]).push(m+":"+document.querySelectorAll(".sc-card").length+":"+JSON.stringify((lastRows||[]).map(r=>({pass:r.pass,st:r.stake,ok:r.actProb,fl:(r.flags||[]).map(f=>f[1]),am:r.amer})))); if(c&&c.querySelector(".bet-btn")){ c.querySelector(".bet-btn").click(); return m; } } return window._dbg.join(" "); }, MODES);
    await p.waitForTimeout(1200);
    const F=await p.evaluate(()=>{ const e=document.querySelector('.editor'); if(!e) return null; const live=e.querySelector('.eb-live'), pct=e.querySelector('.eb-pct'); return {live:live?live.textContent:'', pct:pct?pct.value:null, thinEl:!!e.querySelector('.eb-thin')}; });
    check(label+': the card opens I bet this (found on a tab)', !!found && !!F, {found,F});
    if(label==='thin'){
      check('thin: the form says Novig’s book read 65.0%, far from the card’s 53.9% (−117 here), check your slip', !!F && F.thinEl && /65\.0%/.test(F.live) && /card’s 53\.9%/.test(F.live) && /check your slip/.test(F.live), F);
      check('thin: it is not shown as "Novig now 65.0%" and the % box is not filled with 65.0', !!F && !/now 65\.0%/.test(F.live) && F.pct!=='65.0', F);
      check('thin: no "too high — skip" verdict from the thin reading', !!F && !/65\.0% is too high/.test(F.live), F);
    } else {
      check('normal: the form shows "Novig now 56.0%" as before', !!F && /Novig now 56\.0%/.test(F.live) && !F.thinEl, F);
    }
    await ctx.close(); }
  check('no page errors', !errs.length, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
