// node tests/leagues-test.js — the 🌍 Leagues tab: every league the app knows, and which ones have games in the next 3 days
// from what the sources say (ESPN's schedule, The Odds API's own league and game lists when the Worker has them, the
// Sportsbook API's last load). One tap loads a league's odds. A league The Odds API lists that the app has never heard of
// shows up by itself. ESPN and the Worker are stubbed; no credits are spent.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const now=Date.now(), H=3600e3, CT=ms=>new Date(ms).toLocaleDateString('en-CA',{timeZone:'America/Chicago'}), iso=ms=>new Date(ms).toISOString();
const TMRW=CT(now+24*H).replace(/-/g,''), TODAY=CT(now).replace(/-/g,'');
const ev=(id,t,a,h)=>({id,date:iso(t),status:{type:{state:'pre'}},competitions:[{competitors:[{homeAway:'home',team:{abbreviation:h}},{homeAway:'away',team:{abbreviation:a}}]}]});
const SOURCES={sources:[{id:'oddsapi',name:'The Odds API',key:true,loads:true}]};
const SB_ROW={name:'Galatasaray',game:'GS @ FB',matchup:'GS vs FB',side:'',sport:'SUPERLIG',market:'Moneyline',kind:'moneyline',book:'Novig',offeredRaw:'+120',offeredProb:.45,fairProb:.47,fairRaw:'+113',mktProb:.47,
  gameInfo:{state:'pre',startISO:iso(now+40*H),timeCT:'',detail:'',teams:[]},src:'api:sbapi:ev',apiKey:'sb1'};
async function run(withList){
  const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago', viewport:{width:1400,height:1000}});
  await ctx.addInitScript(([row,d])=>{ try{ if(sessionStorage.getItem('seeded')) return; sessionStorage.setItem('seeded','1'); localStorage.clear();
    localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows:[row]})); }catch(e){} }, [SB_ROW, CT(now)]);
  const p=await ctx.newPage(); const errs=[], odds=[]; p.on('pageerror',e=>errs.push(e.message));
  const J=(r,j,st)=>r.fulfill({status:st||200,contentType:'application/json',headers:{'access-control-allow-origin':'*','access-control-expose-headers':'x-src-quota,x-src-cached'},body:JSON.stringify(j)});
  await p.route('**/*',r=>{ const u=decodeURIComponent(r.request().url()); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/0xbeta\.dev\/src\/status/.test(u)) return J(r,SOURCES);
    if(/src=oddsapi_sports/.test(u)) return withList ? J(r,[{key:'soccer_finland_veikkausliiga',group:'Soccer',title:'Veikkausliiga - Finland',active:true},{key:'soccer_spain_la_liga',group:'Soccer',title:'La Liga - Spain',active:true},{key:'golf_masters_tournament_winner',group:'Golf',title:'Masters',active:true}]) : J(r,{error:'not found'},404);
    if(/src=oddsapi_events/.test(u)){ if(!withList) return J(r,{error:'not found'},404); return J(r, /veikkausliiga/.test(u) ? [{id:'f1',commence_time:iso(now+20*H)}] : []); }
    if(/src=oddsapi&/.test(u)){ odds.push(u.split('?')[1]); return J(r,[]); }
    if(/0xbeta\.dev/.test(u)) return J(r,{});
    const m=u.match(/sports\/(.+?)\/scoreboard\?dates=(\d{8})/);
    if(m){ const E = m[1]==='soccer/esp.1' && m[2]===TMRW ? [ev('l1',now+26*H,'RMA','BAR'),ev('l2',now+28*H,'ATM','SEV')] : m[1]==='basketball/nba' && m[2]===TODAY ? [ev('n1',now+2*H,'LAL','BOS')] : [];
      return r.fulfill({contentType:'application/json',body:JSON.stringify({events:E})}); }
    if(/espn\.com/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'});
    return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1500);
  await p.evaluate(()=>document.querySelector('.tab[data-view="v-leagues"]').click())   /* v4.29: under its main tab now */; await p.waitForTimeout(3500);
  const st=await p.evaluate(()=>{ const rows=[...document.querySelectorAll('#lgBody > .lg-list .lg-row, #lgBody > ul .lg-row')].map(li=>({name:li.querySelector('.lg-who b').textContent, src:[...li.querySelectorAll('.lg-b')].map(x=>x.textContent), load:!!li.querySelector('.lg-load'), bp:!!li.querySelector('.lg-bp')}));
    const off=[...document.querySelectorAll('#lgBody .lg-off')].map(d=>({sum:d.querySelector('summary').textContent, names:[...d.querySelectorAll('.lg-who b')].map(b=>b.textContent).concat((d.querySelector('.lg-names')||{textContent:''}).textContent.split(' · ').filter(Boolean))}));
    return {rows, off, msg:document.getElementById('lgMsg').textContent, tab:document.getElementById('lgTabN').textContent}; });
  await p.setViewportSize({width:390,height:844}); await p.waitForTimeout(200);
  const phone=await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1); await p.setViewportSize({width:1400,height:1000});
  return {b,p,st,odds,errs,phone};
}
(async()=>{
  // A: today's Worker (no league list or game list route yet)
  let {b,p,st,odds,errs,phone}=await run(false);
  const R=n=>st.rows.find(x=>x.name===n)||{};
  check('leagues with games come first: La Liga (ESPN, 2 games), NBA (1), Turkish Super Lig (a Sportsbook API pick)', /ESPN: 2 games/.test(R('La Liga').src.join()) && /ESPN: 1 game/.test(R('NBA').src.join()) && /Sportsbook API: 1 pick/.test(R('Turkish Super Lig').src.join()), st.rows.map(x=>x.name+': '+x.src.join(', ')));
  check('each has Load odds; BettingPros leagues also have their board button', R('La Liga').load && R('NBA').load && R('NBA').bp && !R('La Liga').bp, [R('La Liga'),R('NBA')]);
  const unk=(st.off.find(o=>/Not checked/.test(o.sum))||{names:[]}).names, none=(st.off.find(o=>/No games/.test(o.sum))||{names:[]}).names;
  check('no free schedule (KBO, IPL): listed as not checked, still loadable; checked with no games (Eredivisie): listed apart', unk.includes('KBO (Korea)') && unk.includes('IPL') && none.includes('Eredivisie') && !unk.includes('Eredivisie'), {unk:unk.slice(0,6), none:none.slice(0,6)});
  check('it says what the Worker does not have yet, and the count is on the tab', /built in until the Worker/.test(st.msg) && /game list: after the Worker update/.test(st.msg) && +st.tab===st.rows.length, {msg:st.msg, tab:st.tab});
  await p.click('.lg-row:has(b:text-is("La Liga")) .lg-load'); await p.waitForTimeout(800);
  check('Load odds loads La Liga from The Odds API, on the board', odds.some(q=>/sport=soccer_spain_la_liga&markets=h2h/.test(q)) && await p.evaluate(()=>document.getElementById('v-board').classList.contains('on')), odds);
  check('phone: fits the screen', phone, phone);
  check('no page errors', errs.length===0, errs); await b.close();
  // B: once the Worker passes The Odds API's free lists through, a league the app never heard of shows up by itself
  ({b,p,st,odds,errs,phone}=await run(true));
  const F=st.rows.find(x=>/Veikkausliiga/.test(x.name))||{};
  check('a new league from The Odds API list, with its game, appears by itself (Finland)', /The Odds API: 1 game/.test((F.src||[]).join()) && F.load, F);
  check('outright-only markets (Masters winner) are left out', !JSON.stringify(st).includes('Masters'), true);
  await p.click('.lg-row:has(b:text-is("Veikkausliiga - Finland")) .lg-load'); await p.waitForTimeout(800);
  check('Load odds for it uses its own key', odds.some(q=>/sport=soccer_finland_veikkausliiga/.test(q)), odds);
  check('no page errors (with the lists)', errs.length===0, errs); await b.close();
  console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail?1:0);
})();
