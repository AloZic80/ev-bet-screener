// node tests/v518-scout-test.js [index.html] — v5.18 (owner, 11/16: "have a button just for that ... Or perhaps by time ... NHL props come out at 11Am ...
// So, i can program it. And send the sentinels Every 30 minutes or so, and have the AI alert me if theres any picks that passes Sally's screening?";
// then "i have to tell it 'program' it what API and what settings for search though").
// 1. 🔭 Scout now: only sports with a game in the next 12 hours, soonest first, BettingPros props at the Scout's own pages, inside the daily scout cap and the
//    calls left today, then the Sentinels once; one calm result line. Nothing with games: says so, spends nothing.
// 2. ⏰ Schedule rows (sport, source, its search settings, time CT, days, a max): fires once at its time, only that sport, not twice, not outside its days;
//    a row whose cost is over its max loads nothing; a SportsGameOdds row's Run now asks exactly that path (league, 10 games); an Odds API row warns about credits.
// 3. 🛰️ Auto Sentinels every N minutes, only with games ahead.
// 4. 🔔 Alert me: one notification per NEW approved card, not for an already-bet, outside-plan (with the option) or untrusted card; a banner when notifications
//    are blocked; stakes and decisions unchanged. 5. Phone 390: the button fits. No page errors.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,600)); };
const NOW=Date.parse('2026-11-10T19:00:00Z') /* Tue 1:00 PM CT */, iso=ms=>new Date(ms).toISOString(), DAY='2026-11-10', KO=Date.parse('2026-11-11T01:15:00Z'), H=3600e3, M=60e3;
const T=(ha,abbr,loc,nick)=>({ha,id:abbr,abbr,name:loc+' '+nick,loc,nick,logo:'',rec:'',color:'333333',alt:'ffffff'});
const GI=(start,id,a,h)=>({state:'pre',startISO:iso(start),eventId:id,timeCT:'',detail:'',teams:[T('away',a[0],a[1],a[2]),T('home',h[0],h[1],h[2])]});
const G1=GI(KO,'401001',['BUF','Buffalo','Bills'],['MIN','Minnesota','Vikings']), G2=GI(KO+2*H,'401002',['NYI','New York','Islanders'],['SJ','San Jose','Sharks']);
const am=p=>p>=0.5?String(Math.round(-100*p/(1-p))):'+'+Math.round(100*(1-p)/p);
const prop=(id,name,team,market,side,price,fair,mkt,gi,sport,extra)=>Object.assign({name,team,game:gi.teams[0].abbr+' @ '+gi.teams[1].abbr,matchup:gi.teams[0].abbr+' @ '+gi.teams[1].abbr,side,sport,market,kind:'prop',book:'Novig',
  offeredRaw:am(price),offeredProb:price,fairProb:fair,fairRaw:am(fair),mktProb:mkt,stars:4,evModel:'projection',projValue:10,gameInfo:gi,src:'api:seed:'+sport,apiKey:id,loadedAt:iso(NOW-60e3)},extra||{});
const ROWS=[
  prop('perf','Justin Jefferson','MIN','75.5 Receiving Yards','O',0.54,0.60,0.585,G1,'NFL'),      // a 🪙 Volado bet (under 60%)
  prop('leg','Victor Eklund','NYI','0.5 Shots','O',0.705,0.74,0.725,G2,'NHL'),                    // a 🛋️/💪 bet (over 60%)
  prop('bet2','Bo Horvat','NYI','1.5 Shots','O',0.705,0.74,0.725,G2,'NHL'),                       // will be bet (already bet)
  prop('aw','Mathew Barzal','NYI','0.5 Assists','O',0.705,0.74,0.725,G2,'NHL')];                  // will be 👻 AWOL (price not trusted)
const NOTIF=perm=>`window._notes=[]; window.Notification=class{ constructor(t,o){ window._notes.push({t, body:(o||{}).body, tag:(o||{}).tag}); } static get permission(){ return '${perm}'; } static requestPermission(){ return Promise.resolve('${perm}'); } };`;
async function open(b, W, opt){ opt=opt||{};
  const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:W,height:900}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(([R,d,sched])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig, Kalshi',bank:'500',cfgVer:3.03})); localStorage.setItem('mbev.cards','1');
    localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows:R})); if(sched) localStorage.setItem('mbev.sched',JSON.stringify(sched)); }catch(e){} },[ROWS,DAY,opt.sched||null]);
  if(opt.notif) await ctx.addInitScript(NOTIF(opt.notif));
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  const S={left:12, props:[], live:0, src:[]};
  await p.route('**/*',r=>{ const u=r.request().url();
    if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/api\.0xbeta\.dev\/budget/.test(u)) return r.fulfill({contentType:'application/json',body:JSON.stringify({limit:50,used:50-S.left,left:S.left})});
    if(/api\.0xbeta\.dev\/props/.test(u) && new URL(u).searchParams.get('cache_only')==='1') return r.fulfill({contentType:'application/json',body:JSON.stringify({props:[],_meta:{cache_only_empty:true}})});   /* v5.68: the Board opening asks for saved loads only (cache_only): not a provider call */ 
    if(/api\.0xbeta\.dev\/props/.test(u)){ const q=new URL(u).searchParams, pg=+q.get('pages'); S.props.push(q.get('sport')+':'+pg); S.left-=pg; return r.fulfill({contentType:'application/json',body:JSON.stringify({props:[],source_count:0,debug:{}})}); }
    if(/api\.0xbeta\.dev\/live/.test(u)){ S.live++; return r.fulfill({contentType:'application/json',body:JSON.stringify({at:new Date().toISOString(),results:{}})}); }
    if(/api\.0xbeta\.dev\/src\/odds/.test(u)){ S.src.push(new URL(u).search); return r.fulfill({contentType:'application/json',body:JSON.stringify({data:[]})}); }
    if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'});
    if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'});
    return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1300);
  return {ctx,p,errs,S}; }
// the ESPN schedule is faked by setting sportNext (as bp-several-test does); _scScanAt far ahead keeps the Scout from asking the (empty) fake ESPN again
const setNext=(p,o)=>p.evaluate(([o,N,H])=>{ sportNext={}; Object.keys(o).forEach(k=>{ sportNext[k]=o[k]==null?null:N+o[k]*H; }); window._scScanAt=Date.now()+30*864e5; scanSportTimes=async()=>{}; /* the app re-reads ESPN every 30 min: kept on this fake schedule */ },[o,NOW,H]);
const msg=p=>p.evaluate(()=>(document.getElementById('scoutMsg')||{}).textContent||'');
const safe=async(name,f)=>{ try{ await f(); }catch(e){ check(name+' (threw)', false, String(e.message||e).slice(0,300)); } };
(async()=>{ const b=await chromium.launch(); let X;
  // ================= 1. 🔭 Scout now =================
  X=await open(b,1280);
  await safe('scout', async()=>{
    const has=await X.p.evaluate(()=>{ const s=document.getElementById('scoutBtn'); return !!s && s.getClientRects().length>0 && /🔭 Scout now/.test(s.textContent); });
    check('the board shows a "🔭 Scout now" button next to Send the Sentinels', has, has);
    await setNext(X.p,{NBA:5, NHL:3, NFL:20, MLB:null});
    await X.p.click('#scoutBtn'); await X.p.waitForTimeout(2500);
    const m1=await msg(X.p);
    check('Scout loads only the sports with a game in 12 hours, soonest first (NHL then NBA), BettingPros props at 2 pages each; not NFL (20 h) or MLB', JSON.stringify(X.S.props)==='["NHL:2","NBA:2"]', X.S.props);
    check('then sends the Sentinels once', X.S.live>=1, X.S.live);
    check('one calm line: "Scouted 1:00 PM: loaded NHL, NBA (4 calls, 6 left of your scout cap) · Sentinels sent · N approved"', /^Scouted 1:0\d PM: loaded NHL, NBA \(4 calls, 6 left of your scout cap\) · Sentinels sent · \d+ approved$/.test(m1), m1);
    const ty=await X.p.evaluate(()=>({t:document.getElementById('apiType').value, pg:document.getElementById('apiPages').value}));
    check('the BettingPros panel keeps its own choices (bet type, pages)', ty.t==='props' && ty.pg==='5', ty);
    // the daily scout cap: 6 left; NHL loads 2 (4 left), then set cap so only one fits
    X.S.props=[]; X.S.live=0;
    await X.p.evaluate(()=>{ const G=JSON.parse(localStorage.getItem('mbev.sched')||'{}'); G.cap=7; localStorage.setItem('mbev.sched',JSON.stringify(G)); });   // 4 used: 3 left of 7
    await X.p.click('#scoutBtn'); await X.p.waitForTimeout(2500);
    const m2=await msg(X.p);
    check('the scout cap holds: with 3 left of 7, NHL loads (2 calls) and NBA does not ("scout cap reached")', JSON.stringify(X.S.props)==='["NHL:2"]' && /loaded NHL \(2 calls, 1 left of your scout cap\)/.test(m2) && /not loaded: NBA \(scout cap reached\)/.test(m2), {props:X.S.props, m2});
    // calls left today: 1 BettingPros call left
    X.S.props=[]; X.S.left=1;
    await X.p.evaluate(()=>{ const G=JSON.parse(localStorage.getItem('mbev.sched')||'{}'); G.cap=50; localStorage.setItem('mbev.sched',JSON.stringify(G)); });
    await X.p.click('#scoutBtn'); await X.p.waitForTimeout(2500);
    const m3=await msg(X.p);
    check('never over what is left today: 1 BettingPros call left, nothing loaded ("1 BettingPros call left today")', X.S.props.length===0 && /NHL \(1 BettingPros call left today\)/.test(m3), {props:X.S.props, m3});
    // nothing to scout
    X.S.props=[]; X.S.live=0; X.S.left=40; await setNext(X.p,{NBA:null, NHL:null, NFL:30});
    await X.p.click('#scoutBtn'); await X.p.waitForTimeout(1500);
    const m4=await msg(X.p);
    check('nothing with games in 12 hours: it says so and spends nothing (no BettingPros call, no Sentinels)', X.S.props.length===0 && X.S.live===0 && /no game starts in the next 12 hours, nothing loaded \(no calls\)/.test(m4), {m4, live:X.S.live});
  });
  // ================= 2. ⏰ Schedule rows =================
  await safe('schedule', async()=>{
    await X.p.evaluate(()=>{ localStorage.removeItem('mbev.schedRun'); const t=document.querySelector('.tab[data-view="v-settings"]'); t.click(); document.getElementById('schedPanel').open=true; });
    await X.p.waitForTimeout(200);
    await X.p.click('#schedPanel [data-sc="ex"]'); await X.p.waitForTimeout(150);
    const line=await X.p.evaluate(()=>[...document.querySelectorAll('#schedRows .sc-row-t')].map(x=>x.textContent));
    check('one tap adds the example as one readable line: "NHL · BettingPros props · 40 props (2 calls) · 11:00 AM · every day · max 2 calls"', line.length===1 && line[0]==='NHL · BettingPros props · 40 props (2 calls) · 11:00 AM · every day · max 2 calls', line);
    // the editor: an Odds API row warns about credits
    await X.p.click('#schedPanel [data-sc="add"]'); await X.p.waitForTimeout(100);
    await X.p.selectOption('#schedEd [data-f="src"]','oddsapi'); await X.p.waitForTimeout(100);
    const warn=await X.p.evaluate(()=>{ const w=document.querySelector('#schedEd .sc-warn'); return w?w.textContent:''; });
    check('an Odds API row shows the credits warning in the editor', /⚠ Uses The Odds API credits: about 1 credit each run/.test(warn), warn);
    await X.p.click('#schedEd [data-sc="edSave"]'); await X.p.waitForTimeout(100);
    const l2=await X.p.evaluate(()=>[...document.querySelectorAll('#schedRows .sc-row-t')].map(x=>x.textContent));
    check('…and in its saved line ("⚠ uses credits")', l2.length===2 && /The Odds API game lines · moneyline \(about 1 credit\) · ⚠ uses credits/.test(l2[1]), l2);
    // programmed rows: NHL 1:30 PM every day (2 pages, max 2) · NBA 1:30 PM weekends · NFL 1:45 PM, 3 pages but max 2 · SGO NHL 10 games
    X.S.props=[]; X.S.live=0; X.S.src=[]; X.S.left=40;
    await setNext(X.p,{NHL:3, NBA:5, NFL:4});
    await X.p.evaluate(()=>{ const G=JSON.parse(localStorage.getItem('mbev.sched')||'{}'); G.cap=20;
      G.rows=[{id:'a',sp:'NHL',src:'bp_props',pages:2,t:'13:30',days:'all',cap:2},{id:'b',sp:'NBA',src:'bp_props',pages:3,t:'13:30',days:'we',cap:3},{id:'c',sp:'NFL',src:'bp_props',pages:3,t:'13:45',days:[2],cap:2},
        {id:'d',sp:'NHL',src:'sgo',n:10,props:true,gl:false,t:'20:00',days:'all',cap:1},{id:'e',sp:'NHL',src:'sgo',n:20,t:'20:00',days:'we',cap:1}];
      localStorage.setItem('mbev.sched',JSON.stringify(G)); localStorage.removeItem('mbev.schedRun'); scPaint(); });
    const nx=await X.p.evaluate(()=>document.getElementById('schedNext').textContent);
    check('the panel says what is next: "next: NHL at 1:30 PM"', nx==='next: NHL at 1:30 PM', nx);
    await X.p.clock.runFor(29*M); await X.p.waitForTimeout(200);
    check('before 1:30 PM nothing runs', X.S.props.length===0, X.S.props);
    await X.p.clock.runFor(2*M); await X.p.waitForTimeout(2500);
    check('at 1:30 PM the NHL row fires: NHL only, 2 pages (its own setting); not the NBA row (weekends only, this is a Tuesday)', JSON.stringify(X.S.props)==='["NHL:2"]', X.S.props);
    const ms=await X.p.evaluate(()=>document.getElementById('schedMsg').textContent);
    check('its line starts "⏰ Scouted 1:3x PM: loaded NHL (2 calls, …)"', /^⏰ Scouted 1:3\d PM: loaded NHL \(2 calls, 18 left of your scout cap\) · Sentinels sent · \d+ approved$/.test(ms), ms);
    await X.p.clock.runFor(8*M); await X.p.waitForTimeout(500);
    check('it does not fire twice in its 10-minute window', JSON.stringify(X.S.props)==='["NHL:2"]', X.S.props);
    await X.p.clock.runFor(7*M); await X.p.waitForTimeout(2500);
    const mc=await X.p.evaluate(()=>document.getElementById('schedMsg').textContent);
    check('1:45 PM: the NFL row (Tuesdays) costs 3 calls, over its max of 2: nothing loaded, and it says why', JSON.stringify(X.S.props)==='["NHL:2"]' && /not loaded: NFL \(max 2 calls for this row\)/.test(mc), {props:X.S.props, mc});
    // Run now on the SportsGameOdds row: exactly that path and settings; the 20-game row is over its max
    X.S.src=[];
    await X.p.evaluate(()=>{ scPaint(); document.querySelector('#schedRows .sc-row[data-id="d"] [data-sc="run"]').click(); }); await X.p.waitForTimeout(2500);
    check('Run now on "NHL · SportsGameOdds props · 10 games" asks /src/odds with src=sgo, league NHL, 10 games (one request)', X.S.src.length===1 && /src=sgo&league=NHL&limit=10/.test(X.S.src[0]), X.S.src);
    X.S.src=[];
    await X.p.evaluate(()=>{ document.querySelector('#schedRows .sc-row[data-id="e"] [data-sc="run"]').click(); }); await X.p.waitForTimeout(2000);
    const me=await X.p.evaluate(()=>document.getElementById('schedMsg').textContent);
    check('a 20-game SportsGameOdds row (2 requests) with a max of 1 asks nothing', X.S.src.length===0 && /max 1 request for this row/.test(me), {src:X.S.src, me});
    const R=await X.p.evaluate(()=>{ const G=JSON.parse(localStorage.getItem('mbev.sched')); return {rows:G.rows.length, syncs:typeof SYNC_SETS!=='undefined' && SYNC_SETS.sched==='mbev.sched'}; });
    check('rows are saved in mbev.sched, which sync carries', R.rows===5 && R.syncs, R);
    // duplicate and remove
    await X.p.evaluate(()=>{ document.querySelector('#schedRows .sc-row[data-id="a"] [data-sc="dup"]').click(); });
    const nDup=await X.p.evaluate(()=>JSON.parse(localStorage.getItem('mbev.sched')).rows.length);
    await X.p.evaluate(()=>{ document.querySelector('#schedRows .sc-row[data-id="a"] [data-sc="del"]').click(); });
    const nDel=await X.p.evaluate(()=>JSON.parse(localStorage.getItem('mbev.sched')).rows.map(r=>r.sp+'|'+r.t));
    check('Duplicate adds a copy; Remove takes the row away (the copy stays)', nDup===6 && nDel.length===5 && nDel[0]==='NHL|13:30', {nDup, nDel});
    const note=await X.p.evaluate(()=>document.getElementById('schedPanel').textContent);
    check('the honest note: "Runs while this page is open. On iPhone, keep the app on screen; Safari pauses pages in the background."', note.includes('Runs while this page is open. On iPhone, keep the app on screen; Safari pauses pages in the background.'), null);
    // the Scout's own settings open from the board
    await X.p.evaluate(()=>{ document.querySelector('.tab[data-view="v-board"]').click(); }); await X.p.waitForTimeout(150);
    await X.p.click('#scoutSet'); await X.p.waitForTimeout(200);
    const se=await X.p.evaluate(()=>({open:document.getElementById('schedPanel').open, ed:(document.querySelector('#schedEd .sc-ed-h')||{}).textContent||'', line:(document.querySelector('#schedEd .sc-ed-line')||{}).textContent||''}));
    check('⚙ settings next to the Scout opens the same row editor for its default (every sport with a game in 12 h, BettingPros props, 40 props, max 10, then the Sentinels)', se.open && /Scout now settings/.test(se.ed) && se.line==='Every sport with a game in the next 12 hours, soonest first · BettingPros props · 40 props (2 calls) · max 10 calls · then the Sentinels', se);
  });
  // ================= 3. 🛰️ Auto Sentinels =================
  await safe('auto', async()=>{
    await X.p.evaluate(()=>{ const G=JSON.parse(localStorage.getItem('mbev.sched')); G.rows=[]; localStorage.setItem('mbev.sched',JSON.stringify(G)); window._scEd=null; scPaint();
      const a=document.getElementById('schedAutoMin'); a.value='15'; const c=document.getElementById('schedAutoOn'); c.checked=true; c.dispatchEvent(new Event('change',{bubbles:true})); });
    X.S.live=0; X.S.props=[];
    await X.p.clock.runFor(10*M); await X.p.waitForTimeout(300);
    check('Auto Sentinels (every 15 min): nothing in the first 10 minutes', X.S.live===0, X.S.live);
    await X.p.clock.runFor(6*M); await X.p.waitForTimeout(1500);
    const n1=X.S.live, an=await X.p.evaluate(()=>document.getElementById('schedAutoNote').textContent);
    check('after 15 minutes the Sentinels go out once (no BettingPros call); the panel shows last and next', n1>=1 && X.S.props.length===0 && /Last: \d+:\d\d PM\. Next: \d+:\d\d PM\./.test(an), {n1, an});
    await X.p.clock.runFor(16*M); await X.p.waitForTimeout(1500);
    check('and again 15 minutes later', X.S.live>n1, X.S.live);
    const n2=X.S.live;
    await X.p.evaluate(()=>{ lastRows.forEach(r=>{ if(r.gameInfo) r.gameInfo=Object.assign({}, r.gameInfo, {state:'in'}); }); });
    await X.p.clock.runFor(16*M); await X.p.waitForTimeout(1500);
    const an2=await X.p.evaluate(()=>document.getElementById('schedAutoNote').textContent);
    check('with no game ahead it does not send them, and says so', X.S.live===n2 && /no cards with games ahead/.test(an2), {live:X.S.live, an2});
    check('no page errors (scout, schedule, auto)', !X.errs.length, X.errs);
  });
  await X.ctx.close();
  // ================= 4. 🔔 Alert me =================
  await safe('alerts', async()=>{
    X=await open(b,1280,{notif:'granted', sched:{alert:{on:true, plan:true}}});
    await setNext(X.p,{NHL:3});
    const pre=await X.p.evaluate(()=>{ document.getElementById('planSince').value='2026-11-01'; document.getElementById('planMin').value='60'; document.getElementById('planMin').dispatchEvent(new Event('input',{bubbles:true})); document.getElementById('planMin').dispatchEvent(new Event('change',{bubbles:true}));
      addToLog(lastRows.find(x=>x.apiKey==='bet2')); const a=lastRows.find(x=>x.apiKey==='aw'); a.awol={book:'Novig', note:'not found', at:Date.now()}; refresh();
      return lastRows.map(r=>({k:r.apiKey, pass:!!r.pass, stake:+r.stake||0, act:+(r.actProb||0).toFixed(3), prior:!!r.prior, ok:scApproved(r), out:planOut(r.actProb)})); });
    check('setup: Jefferson and Eklund approved; Horvat already bet; Barzal 👻 AWOL; Jefferson under the 60% plan', pre.find(x=>x.k==='perf').ok && pre.find(x=>x.k==='leg').ok && !pre.find(x=>x.k==='bet2').ok && pre.find(x=>x.k==='bet2').prior && !pre.find(x=>x.k==='aw').ok && pre.find(x=>x.k==='perf').out && !pre.find(x=>x.k==='leg').out, pre);
    const LOAD=async()=>{ await X.p.evaluate(()=>loadApi(false,'NHL')); await X.p.waitForTimeout(1200); };   // a BettingPros load (the fake answers no props; the seeded cards stay)
    await LOAD();
    const n1=await X.p.evaluate(()=>window._notes.slice());
    check('after a load: one notification, for Eklund only (not the already-bet, the AWOL one or Jefferson outside My plan)', n1.length===1 && /Victor Eklund Over 0\.5 Shots, Novig -\d+, \$\d+\.\d\d · \S+/.test(n1[0].body) && n1[0].t==='✅ New approved bet', n1);
    await LOAD();
    check('loading again does not alert the same card twice', (await X.p.evaluate(()=>window._notes.length))===1, null);
    await X.p.evaluate(()=>{ const c=document.getElementById('schedAlertPlan'); c.checked=false; c.dispatchEvent(new Event('change',{bubbles:true})); });
    await LOAD();
    const n3=await X.p.evaluate(()=>window._notes.slice(1));
    check('with "only inside My plan" off, Jefferson is alerted next (once)', n3.length===1 && /^Justin Jefferson Over 75\.5 Receiving Yards, Novig -\d+, \$\d+\.\d\d · \S+$/.test(n3[0].body), n3);
    const st=await X.p.evaluate(()=>{ const snap=()=>lastRows.map(r=>r.apiKey+':'+(!!r.pass)+':'+(+r.stake||0).toFixed(2)+':'+r.idx).join(','); const a=snap();
      const G=JSON.parse(localStorage.getItem('mbev.sched')); G.alert.on=false; localStorage.setItem('mbev.sched',JSON.stringify(G)); refresh(); const b=snap(); return {a, b, same:a===b}; });
    check('stakes, decisions and order are the same with alerts on and off', st.same, st);
    const news=await X.p.evaluate(()=>{ const c=document.getElementById('schedAlertNews'); return {exists:!!c, shown:!!(c && c.getClientRects().length)}; });
    check('the news-check option exists and is hidden while the AI helper is off', news.exists && !news.shown, news);
    check('no page errors (alerts)', !X.errs.length, X.errs);
    await X.ctx.close();
    // notifications blocked: a calm banner with the list; turning alerts on takes the board as it is
    X=await open(b,1280,{notif:'denied'});
    await X.p.evaluate(()=>{ document.querySelector('.tab[data-view="v-settings"]').click(); document.getElementById('schedPanel').open=true; const c=document.getElementById('schedAlertOn'); c.checked=true; c.dispatchEvent(new Event('change',{bubbles:true})); });
    await setNext(X.p,{NHL:3}); await X.p.evaluate(()=>loadApi(false,'NHL')); await X.p.waitForTimeout(1200);
    const b0=await X.p.evaluate(()=>({on:!!document.querySelector('#scAlert.on'), notes:window._notes.length, note:document.getElementById('schedAlertNote').textContent}));
    check('turning alerts on takes the board as it is (no burst); the note says notifications are blocked, a banner instead', !b0.on && b0.notes===0 && /blocks notifications for this site/.test(b0.note), b0);
    await X.p.evaluate(()=>{ localStorage.removeItem('mbev.alertSeen'); return loadApi(false,'NHL'); }); await X.p.waitForTimeout(1500);
    const b1=await X.p.evaluate(()=>({on:!!document.querySelector('#scAlert.on'), txt:(document.getElementById('scAlert')||{}).textContent||'', notes:window._notes.length}));
    check('blocked notifications: a calm banner lists the new approved bets instead', b1.on && b1.notes===0 && /✅ New approved bets \(\d\)/.test(b1.txt) && /Victor Eklund Over 0\.5 Shots, Novig/.test(b1.txt), b1);
    check('no page errors (banner)', !X.errs.length, X.errs);
    await X.ctx.close();
  });
  // ================= 5. phone 390 =================
  await safe('phone', async()=>{
    X=await open(b,390);
    const P=await X.p.evaluate(()=>{ const s=document.getElementById('scoutBtn'), r=s.getBoundingClientRect(); return {vis:s.getClientRects().length>0, l:r.left, r:r.right, vw:innerWidth, sw:document.documentElement.scrollWidth}; });
    check('390 px: the Scout button is on the board and inside the screen, nothing runs off', P.vis && P.l>=0 && P.r<=P.vw+1 && P.sw<=P.vw+1, P);
    await X.p.evaluate(()=>{ document.querySelector('.tab[data-view="v-settings"]').click(); document.getElementById('schedPanel').open=true; document.querySelector('#schedPanel [data-sc="ex"]').click(); document.querySelector('#schedPanel [data-sc="add"]').click(); });
    await X.p.waitForTimeout(200);
    const Q=await X.p.evaluate(()=>({sw:document.documentElement.scrollWidth, vw:innerWidth, right:Math.max(...[...document.querySelectorAll('#schedPanel, #schedPanel *')].filter(x=>x.getClientRects().length).map(x=>x.getBoundingClientRect().right))}));
    check('390 px: the ⏰ Schedule panel and its editor fit', Q.sw<=Q.vw+1 && Q.right<=Q.vw+1, Q);
    check('no page errors (phone)', !X.errs.length, X.errs);
    await X.ctx.close();
  });
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
