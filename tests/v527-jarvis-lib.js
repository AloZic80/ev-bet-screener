// node tests/v527-jarvis-test.js [index.html] — v5.27 🤖 Jarvis (owner 11/22: "i want my scout to think for me and tell me what to bet, based off La Conta' but still to do the work for me ...
// i still need to click and make the bet, but for it to do pop ups"; "approved only ... a near miss if it feels it"; "time would be dynamic ... during the week, its based off lunch or
// break, meetings, etc, and weekend its almost ALL DAY"; "sound on"). A fake board and a fake Worker (no real API). Covers: the windows by weekday and time (inside, outside, the end minute,
// past midnight, a day off, Talk now, Quiet for 1 hour); a new approved pick pops once, in La Contadora's order; the numbers on the pop-up are the card's (stake, OK up to, the Kalshi
// ticket); I bet this opens the card's own form, saves through the normal path, and the pick never pops again; Not now (30 min) and Skip today; the near-miss rule, its cap of 2 and its
// words; the "While you were away" digest; the Scout reused inside windows only; sound and notification; the spend line; nothing in Easy or with DEV_APP false; no AI call with the AI
// off or the Worker paused; stakes and decisions the same with Jarvis on and off; 390, 1000, 1280 and 1960 px fit. No page errors.
// The shared setup of the 🤖 Jarvis tests (v5.27), split in three files so each runs well under run-all.js's 300 s per file:
//   v527-jarvis-test.js (sections 1–2) and v527-jarvis2-test.js (3–6): the round-1 build; v527-jarvis3-test.js (7–8): review rounds 2 and 3; v527-jarvis4-test.js (9–10): rounds 4 to 6.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,700)); };
const NOW=Date.parse('2026-11-10T18:10:00Z') /* Tue 12:10 PM CT */, iso=ms=>new Date(ms).toISOString(), DAY='2026-11-10', KO=Date.parse('2026-11-11T01:15:00Z'), H=3600e3, M=60e3;
const T=(ha,abbr,loc,nick)=>({ha,id:abbr,abbr,name:loc+' '+nick,loc,nick,logo:'',rec:'',color:'333333',alt:'ffffff'});
const GI=(start,id,a,h)=>({state:'pre',startISO:iso(start),eventId:id,timeCT:'',detail:'',teams:[T('away',a[0],a[1],a[2]),T('home',h[0],h[1],h[2])]});
const G4=GI(KO+3*H,'401004',['NYR','New York','Rangers'],['PIT','Pittsburgh','Penguins']), G1=GI(KO,'401001',['BUF','Buffalo','Bills'],['MIN','Minnesota','Vikings']), G2=GI(KO+2*H,'401002',['NYI','New York','Islanders'],['SJ','San Jose','Sharks']), G3=GI(KO+H,'401003',['BOS','Boston','Bruins'],['TOR','Toronto','Maple Leafs']);
const am=p=>p>=0.5?String(Math.round(-100*p/(1-p))):'+'+Math.round(100*(1-p)/p);
const prop=(id,name,team,market,side,price,fair,mkt,gi,sport,extra)=>Object.assign({name,team,game:gi.teams[0].abbr+' @ '+gi.teams[1].abbr,matchup:gi.teams[0].abbr+' @ '+gi.teams[1].abbr,side,sport,market,kind:'prop',book:'Novig',
  offeredRaw:am(price),offeredProb:price,fairProb:fair,fairRaw:am(fair),mktProb:mkt,stars:4,evModel:'projection',projValue:10,gameInfo:gi,src:'api:seed:'+sport,apiKey:id,loadedAt:iso(NOW-60e3)},extra||{});
const ROWS=[
  prop('a','Justin Jefferson','MIN','75.5 Receiving Yards','O',0.54,0.62,0.60,G1,'NFL'),
  prop('b','Artemi Panarin','NYR','0.5 Points','O',0.62,0.68,0.66,G4,'NHL'),
  prop('k','Bo Horvat','NYI','1.5 Shots','O',0.52,0.60,0.585,G2,'NHL',{book:'Kalshi'}),
  prop('n1','David Pastrnak','BOS','3.5 Shots','O',0.60,0.62,0.599,G3,'NHL'),       // near misses: the model likes them, her EV with the market is 0% or better but under the floor
  prop('n2','Brad Marchand','BOS','2.5 Shots','O',0.60,0.62,0.599,G3,'NHL'),
  prop('n3','Auston Matthews','TOR','3.5 Shots','O',0.60,0.62,0.599,G3,'NHL')];
const NOTIF=perm=>`window._notes=[]; window.Notification=class{ constructor(t,o){ window._notes.push({t, body:(o||{}).body, tag:(o||{}).tag}); } close(){} static get permission(){ return '${perm}'; } static requestPermission(){ window._askedPerm=1; return Promise.resolve('${perm}'); } };`;
async function open(b, W, opt){ opt=opt||{};
  const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:W,height:opt.h||900}}); await ctx.clock.install({time:new Date(opt.at||NOW)});
  await ctx.addInitScript(([R,d,o])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig, Kalshi',bank:'500',cfgVer:3.03})); localStorage.setItem('mbev.cards','1');
    localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows:R})); localStorage.setItem('mbev.jarvis',JSON.stringify(o.jarvis||{}));   /* a test browser opts in (round 3, N4) */
    if(o.ai){ localStorage.setItem('mbev.ai.on','1'); localStorage.setItem('mbev.ai.status',JSON.stringify({setUp:true, spentToday:0, spentMonth:0, capDay:5, capMonth:90, at:Date.now()})); localStorage.setItem('mbev.pass','pw'); }
    if(o.log) localStorage.setItem('mbev.ai.log',JSON.stringify(o.log)); }catch(e){} },[ROWS,DAY,{jarvis:opt.jarvis||null, ai:!!opt.ai, log:opt.aiLog||null}]);
  await ctx.addInitScript(NOTIF(opt.notif||'default')); if(opt.init) await ctx.addInitScript(opt.init);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  const S={ai:[], news:opt.news||'ok', live:0, props:0};
  await (opt.ctxRoute?ctx:p).route('**/*',r=>{ const req=r.request(), u=req.url();
    if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:opt.html||html});
    if(/api\.0xbeta\.dev\/ai\/status/.test(u)) return r.fulfill({contentType:'application/json',body:JSON.stringify({setUp:!!opt.ai, spentToday:0.2, spentMonth:3.1, capDay:5, capMonth:90})});
    if(/api\.0xbeta\.dev\/ai$/.test(u)){ if(req.method()==='OPTIONS') return r.fulfill({status:204, headers:{'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'POST, GET, OPTIONS'}});
      let body={}; try{ body=JSON.parse(req.postData()||'{}'); }catch(e){} S.ai.push(body);
      const st=typeof S.news==='function'?S.news(body):S.news;
      return r.fulfill({contentType:'application/json',body:JSON.stringify({ok:true, job:body.job, out:{status:st, summary:st==='ok'?'Expected to play.':'Listed questionable.', sources:[]}, usd:0.04, spentToday:0.24, spentMonth:3.14})}); }
    if(/api\.0xbeta\.dev\/budget/.test(u)) return r.fulfill({contentType:'application/json',body:JSON.stringify({limit:50,used:10,left:40})});
    if(/api\.0xbeta\.dev\/props/.test(u) && new URL(u).searchParams.get('cache_only')==='1') return r.fulfill({contentType:'application/json',body:JSON.stringify({props:[],_meta:{cache_only_empty:true}})});   /* v5.68: the Board opening asks for saved loads only (cache_only): not a provider call */ 
    if(/api\.0xbeta\.dev\/props/.test(u)){ S.props++; return r.fulfill({contentType:'application/json',body:JSON.stringify({props:[],source_count:0,debug:{}})}); }
    if(/api\.0xbeta\.dev\/live/.test(u)){ S.live++; return r.fulfill({contentType:'application/json',body:JSON.stringify({at:new Date().toISOString(),results:{}})}); }
    if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'});
    if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'});
    return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1300);
  // the Scout and the Sentinels are counted, not run (the fake Worker has no prices): Jarvis must call them the existing way (scRunRow) and only inside a window
  await p.evaluate(()=>{ window._runs=[]; scRunRow=async(row,how)=>{ window._runs.push(row.src+':'+how); return 'ok'; }; window._beeps=0; perfBeep=()=>{ window._beeps++; }; });
  return {ctx,p,errs,S}; }
const ev=async(p,fn,arg)=>{ try{ return await p.evaluate(fn,arg); }catch(e){ return {evalError:String(e.message||e).slice(0,300)}; } };
const safe=async(name,f)=>{ try{ await f(); }catch(e){ check(name+' (threw)', false, String(e.message||e).slice(0,300)); } };
const pop=p=>ev(p,()=>{ const el=document.getElementById('jvPop'); if(!el || el.hidden) return null; const q=s=>{ const x=el.querySelector(s); return x?x.textContent.trim():null; };
  const kv={}; el.querySelectorAll('.jv-k').forEach(k=>{ kv[k.querySelector('span').textContent]=k.querySelector('b').textContent; });
  return {head:q('.jv-t'), pick:q('.jv-pick'), more:q('.jv-n'), kv, ok:q('.jv-ok'), nm:q('.jv-nm'), ai:q('.jv-ai'), tkt:(el.querySelector('.sc-tkt')||{}).outerHTML||null, btns:[...el.querySelectorAll('.jv-b button, .jv-b a, .jv-self')].map(x=>x.textContent.trim()), key:(window._jvCur||{}).k||null, near:!!(window._jvCur||{}).near, digest:!!(window._jvCur||{}).digest, dl:[...el.querySelectorAll('.jv-dl li')].map(x=>x.textContent)}; });
const tick=p=>ev(p,()=>{ jvTick(); });
const click=async(p,sel)=>{ await ev(p,s=>{ const b=document.querySelector(s); if(b) b.click(); },sel); await p.waitForTimeout(120); };
const fresh=p=>ev(p,()=>{ localStorage.removeItem('mbev.jarvisRun'); window._jvRunMem=null; window._jvRunLast=null; jvClose(true); window._jvWasOpen=false; jvTick(); });
const cardSave=(p,k)=>ev(p,k=>{ const r=lastRows.find(x=>pxKey(x)===k && scApproved(x)); const w=document.createElement('div'); w.id='fakeCards'; w.innerHTML=placeCardHtml(r,cfgRead(),{}); document.body.appendChild(w); const c=w.firstElementChild; openBetEditor(c, r); c.querySelector('.eb-save').click(); w.remove(); return logged.length; }, k);
module.exports={chromium, html, check, open, ev, safe, pop, tick, click, fresh, cardSave, NOW, DAY, KO, H, M, iso, ROWS, res:()=>({pass, fail})};
