// node tests/injury-test.js — the 🚑 injury flag (v3.78): a player prop whose player is on ESPN's injury report is tagged
// (OUT, IR, DOUBTFUL, QUESTIONABLE, DTD) on the board and on Place these, with ESPN's note on hover. Exact names only.
// ESPN's /injuries is stubbed in its real shape (teams > injuries > athlete, status, shortComment, date).
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const now=Date.parse('2026-11-05T18:00:00Z'), H=3600e3,   // a fixed noon (CT) clock: after midnight the board hid tomorrow-night games and this failed
     iso=ms=>new Date(ms).toISOString(), day=new Date(now).toLocaleDateString('en-CA',{timeZone:'America/Chicago'});
const team=(ha,abbr)=>({ha,id:abbr,abbr,name:abbr,loc:abbr,nick:abbr,logo:'',rec:'',color:'333333',alt:'ffffff'});
const prop=(name,o)=>Object.assign({name,game:'ATL @ WSH',matchup:'ATL @ WSH',side:'O',sport:'NBA',market:'14.5 Points',kind:'prop',book:'DraftKings',
  offeredRaw:'-110',offeredProb:.524,fairProb:.60,fairRaw:'-150',mktProb:.60,stars:3,evModel:'projection',stake:5,
  gameInfo:{state:'pre',startISO:iso(now+20*H),timeCT:'',detail:'',teams:[team('away','ATL'),team('home','WSH')]},src:'api:NBA:props',apiKey:name},o||{});
const BOARD=[prop('Asa Newell'), prop('Trae Young',{gameInfo:{state:'in',startISO:iso(now-H),timeCT:'',detail:'Q2',teams:[team('away','ATL'),team('home','WSH')]}}), prop('Jalen Johnson'), prop('Healthy Guy'), prop('Kristaps Porziņģis')];
const inj=(name,status,abbr,note)=>({status, shortComment:note, date:iso(now-H), athlete:{displayName:name, team:{abbreviation:abbr}}});
const INJ={injuries:[{displayName:'Atlanta Hawks', injuries:[inj('Asa Newell','Day-To-Day','ATL','Newell will not return (toe).'), inj('Jalen Johnson','Out','ATL','Johnson (ankle) is out.'), inj('Trae Young','Questionable','ATL','Young is questionable (knee).'), inj('Kristaps Porzingis','Doubtful','ATL','Porzingis (illness) is doubtful.'), inj('Someone Active','Active','ATL','Back from IR.')]}]};
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago', viewport:{width:1400,height:1000}}); await ctx.clock.install({time:new Date(now)});
  await ctx.addInitScript(([rows,d])=>{ try{ if(sessionStorage.getItem('seeded')) return; sessionStorage.setItem('seeded','1'); localStorage.clear();
    localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows})); }catch(e){} }, [BOARD,day]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); let asked=0;
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/basketball\/nba\/injuries/.test(u)){ asked++; return r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(INJ)}); }
    if(/espn\.com/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(2000);
  const tags=await p.evaluate(()=>{ const o={}; document.querySelectorAll('#tbody span.inj, #placeCards span.inj').forEach(e=>{ const tr=e.closest('tr,.pcard'); const n=(tr.querySelector('.pick')||tr.querySelector('.pc-nm')).firstChild.textContent.trim(); (o[n]=o[n]||[]).push({t:e.textContent, c:e.className, title:e.title}); }); return o; });
  const T=n=>((tags[n]||[]).find(x=>x.t)||{});
  check('OUT is red, with ESPN\'s note on hover', T('Jalen Johnson').t==='🚑 OUT' && /out/.test(T('Jalen Johnson').c) && /ESPN injury report: Out · ATL .*Johnson \(ankle\) is out\./.test(T('Jalen Johnson').title), T('Jalen Johnson'));
  check('QUESTIONABLE and DTD (day-to-day) are amber', T('Trae Young').t==='🚑 QUESTIONABLE' && / q$/.test(T('Trae Young').c) && T('Asa Newell').t==='🚑 DTD', [T('Trae Young'), T('Asa Newell')]);
  check('a healthy player has no tag; "Active" on the report is not flagged', !T('Healthy Guy').t && !Object.values(tags).some(a=>a.some(x=>/ACTIVE/.test(x.t))), tags['Healthy Guy']);
  check('exact names only: a different spelling is not guessed (Porziņģis vs Porzingis)', !T('Kristaps Porziņģis').t, tags['Kristaps Porziņģis']);
  const both=await p.evaluate(()=>({board:[...document.querySelectorAll('#tbody span.inj')].filter(e=>e.textContent).length, cards:[...document.querySelectorAll('#placeCards span.inj')].filter(e=>e.textContent).length, cardsShown:document.getElementById('placeCards').style.display!=='none'}));
  check('tagged on the board rows and on Place these', both.board>=1 && both.cardsShown && both.cards>=2, both);
  const sw=await p.evaluate(()=>{ const h=document.getElementById('swipeHint'), pc=document.getElementById('placeCards'), t=document.querySelector('.scroll.board'); return {belowCards:!!(pc.compareDocumentPosition(h)&Node.DOCUMENT_POSITION_FOLLOWING), aboveTable:!!(h.compareDocumentPosition(t)&Node.DOCUMENT_POSITION_FOLLOWING), hasHint:!!h, shownWithRows:h.style.display!=='none'}; });
  check('v3.80: the swipe hint sits on the table (below the cards), where the swiping is', sw.hasHint && sw.belowCards && sw.aboveTable && sw.shownWithRows, sw);
  const n1=asked; await p.reload(); await p.waitForTimeout(1800);
  check('ESPN\'s list is kept 30 minutes: a reload does not ask again', asked===n1 && asked===1, {asked});
  check('no page errors', errs.length===0, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
