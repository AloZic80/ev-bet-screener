// node tests/ribbon-test.js — the score ribbon (v3.77): ⭐ Top events (ESPN's header), 🔴 Live now in every league, every
// league in the menu, and ESPN sports with no home and away team (F1, golf, tennis, UFC). ESPN is stubbed.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const iso=ms=>new Date(ms).toISOString(), now=Date.now();
const team=(ha,ab,sc)=>({homeAway:ha, score:String(sc), team:{abbreviation:ab, displayName:ab, logo:''}});
const game=(id,a,h,sa,sh,state,det)=>({id, date:iso(now-3600e3), status:{type:{state, shortDetail:det}}, competitions:[{competitors:[team('away',a,sa),team('home',h,sh)], situation:{}}]});
let TOP_OK=true;
const HEADER={sports:[{name:'Basketball', leagues:[{abbreviation:'NBA', events:[{id:'h1', date:iso(now-3600e3), status:'in', summary:'Q3 5:12', competitors:[{homeAway:'away',abbreviation:'LAL',score:'70'},{homeAway:'home',abbreviation:'BOS',score:'78'}]}]}]},
  {name:'Racing', leagues:[{abbreviation:'F1', events:[{id:'h2', date:iso(now+86400e3), status:'pre', shortName:'Las Vegas GP', competitors:[]}]}]}]};
const F1={events:[{id:'f1', name:'Las Vegas Grand Prix', shortName:'Las Vegas GP', date:iso(now-1800e3), status:{type:{state:'in', shortDetail:'Lap 30/50'}},
  competitions:[{competitors:[{order:2, athlete:{shortName:'L. Norris'}},{order:1, athlete:{shortName:'M. Verstappen'}},{order:3, athlete:{shortName:'C. Leclerc'}},{order:4, athlete:{shortName:'O. Piastri'}}]}]}]};
const ATP={events:[{id:'t1', name:'Paris Masters', date:iso(now-3600e3), status:{type:{state:'in'}}, groupings:[{competitions:[{date:iso(now-1800e3), status:{type:{state:'in', shortDetail:'2nd set'}},
  competitors:[{athlete:{shortName:'C. Alcaraz'}, linescores:[{value:6},{value:3}]},{athlete:{shortName:'J. Sinner'}, linescores:[{value:4},{value:4}]}]}]}]}]};
const SB={'basketball/nba':{events:[game('401','LAL','BOS',70,78,'in','3rd 5:12')]}, 'soccer/eng.1':{events:[game('501','CHE','ARS',0,1,'in',"55'")]}, 'racing/f1':F1, 'tennis/atp':ATP};
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago', viewport:{width:1400,height:1000}});
  await ctx.addInitScript(()=>{ try{ if(sessionStorage.getItem('seeded')) return; sessionStorage.setItem('seeded','1'); localStorage.clear(); }catch(e){} });
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/scoreboard\/header/.test(u)) return TOP_OK ? r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(HEADER)}) : r.fulfill({status:500,body:''});
    const m=u.match(/sports\/(.+?)\/scoreboard/); if(m) return r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(SB[m[1]]||{events:[]})});
    return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1500);
  await p.check('#ssAll').catch(()=>{}); await p.waitForTimeout(500);   // v4.26: the full league menu is behind All sports
  const opts=await p.$$eval('#ssSport option',o=>o.map(x=>({v:x.value,t:x.textContent})));
  const has=v=>opts.some(o=>o.v===v);
  check('the menu has Top events, Live now, every league the app knows and more of ESPN', has('TOP') && has('ALL') && has('NFL') && has('UCL') && has('EREDIVISIE') && has('X:F1') && has('X:ATP') && has('X:UFCX') && has('X:PGA') && opts.length>=60, {n:opts.length, some:opts.slice(0,4)});
  const tiles=async()=>p.$$eval('#ssGames .ss-g',g=>g.map(x=>x.innerText.replace(/\s+/g,' ').trim()));
  const pick=async v=>{ await p.selectOption('#ssSport',v); await p.waitForTimeout(600); return tiles(); };
  let t=await pick('TOP');
  check('⭐ Top events: ESPN\'s own list, live first, each with its league', t.length===2 && /Q3 5:12 NBA LAL 70 BOS 78/.test(t[0]) && /F1 Las Vegas GP/.test(t[1]), t);
  TOP_OK=false; t=await pick('ALL'); await p.selectOption('#ssSport','TOP'); await p.waitForTimeout(600);
  const fb=await p.evaluate(()=>({note:(document.querySelector('#ssGames .ss-note')||{}).textContent||'', n:document.querySelectorAll('#ssGames .ss-g').length}));
  check('if ESPN\'s top events do not answer, it says so and shows every league live now', /did not answer/.test(fb.note) && fb.n>=3, fb);
  await p.evaluate(()=>leQuiet.clear()); t=await pick('ALL');
  check('🔴 Live now: live games from every league, F1 and tennis too, each labelled', t.some(x=>/NBA/.test(x)&&/LAL 70/.test(x)) && t.some(x=>/EPL/.test(x)&&/ARS 1/.test(x)) && t.some(x=>/Formula 1/.test(x)) && t.some(x=>/ATP/.test(x)&&/Alcaraz/.test(x)), t);
  t=await pick('X:F1');
  check('F1: the race with the top 3 in order', t.length===1 && /Lap 30\/50 Formula 1 1 M\. Verstappen 2 L\. Norris 3 C\. Leclerc/.test(t[0]) && !/Piastri/.test(t[0]), t);
  t=await pick('X:ATP');
  check('Tennis: each match, both players and their sets', t.length===1 && /C\. Alcaraz 6 3/.test(t[0]) && /J\. Sinner 4 4/.test(t[0]), t);
  t=await pick('EPL');
  check('a soccer league from the menu shows its games', t.length===1 && /CHE/.test(t[0]) && /ARS/.test(t[0]), t);
  await p.setViewportSize({width:390,height:844}); await p.waitForTimeout(300);
  check('phone: the page does not scroll sideways', await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1), true);
  check('no page errors', errs.length===0, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
