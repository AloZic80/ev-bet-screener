// node tests/live-batch-test.js — v4.25. Owner: "Yes, BUILD". (1) Novig game lines travel together: the fetch wrapper groups them by league and
// kickoff (up to 6 per /live request, was one each), and a Live edges scan asks the Worker once per 3 games instead of once per 8 bets however
// they fell; a failed or busy answer is asked again after a minute (not kept 3). (2) Polling only runs in the tab you are looking at: a hidden
// page makes no Worker calls. (3) Drop-downs: the explanations on every tab are closed to start and remembered when opened; on a phone the
// board's tick boxes fold behind "Filters" and the Today card's book tiles behind "by book"; on a computer both stay open; the Bet log's
// once-a-month buttons sit under "More".
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const NOW=Date.parse('2026-11-07T20:00:00Z'), H=3600e3, M=60e3, iso=ms=>new Date(ms).toISOString(), DAY='2026-11-07';
const B=(id,o)=>Object.assign({id,kind:'prop',book:'Novig',odds:'+127',stake:1,sport:'NHL',date:DAY,start:iso(NOW+5*H),name:'Kris Letang',market:'1.5 Shots On Goal',side:'O',team:'PIT',game:'PIT @ NYR',autoFrom:'novig',fillBook:'novig',fillRef:'m'+id,fills:['f'+id]},o);
const LOG=[B('1'),B('2',{name:'Tyler Bertuzzi',start:iso(NOW+30*M)})];
const T=(ha,abbr,loc,nick,short)=>({ha,id:abbr,abbr,name:short,loc,nick,logo:'',rec:'',color:'333333',alt:'ffffff'});
const LAC=[T('away','LAC','Los Angeles','Clippers','LA Clippers'),T('home','MIN','Minnesota','Timberwolves','Minnesota')];
const prop=(name,team,market,side,book,odds,p,fair,mkt,k,start)=>({name,team,game:'LAC @ MIN',matchup:'LAC @ MIN',side,sport:'NBA',market,kind:'prop',book,offeredRaw:odds,offeredProb:p,fairProb:fair,fairRaw:'',mktProb:mkt,stars:4,evModel:'market',gameInfo:{state:'pre',startISO:iso(start),timeCT:'',detail:'',teams:LAC},src:'api:NBA:props',apiKey:k,loadedAt:iso(NOW-60e3)});
const ROWS=[prop('Rui Hachimura','LAC','4.5 Rebounds','O','Polymarket US','+177',0.36,0.40,0.395,'k1',NOW+7*H), prop('Naz Reid','MIN','16.5 Points','O','Novig','-108',0.52,0.545,0.54,'k2',NOW+6*H)];
// five NBA games in progress: three tip-offs at the same time, two at another
const ev=(id,a,h,t)=>({id, date:iso(t), status:{type:{state:'in',completed:false,detail:'3rd'},period:3,displayClock:'5:00'}, competitions:[{competitors:[{homeAway:'away',team:{abbreviation:a,displayName:a,name:a,id:a},score:'10'},{homeAway:'home',team:{abbreviation:h,displayName:h,name:h,id:h},score:'14'}],situation:{lastPlay:{id:'p1'}}}]});
const GAMES=[ev('e1','DAL','PHI',NOW-H),ev('e2','MIA','NYK',NOW-H),ev('e3','LAL','BOS',NOW-H),ev('e4','DEN','GSW',NOW-H+40*M),ev('e5','SAS','HOU',NOW-H+40*M)];
async function open(b, W, opts){
  const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:W,height:900}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(([L,R,d,o])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.log',JSON.stringify(L)); localStorage.setItem('mbev.pass','secret1'); localStorage.setItem('mbev.cfg',JSON.stringify({books:['Kalshi','Novig']})); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows:R})); Object.keys(o.ls||{}).forEach(k=>localStorage.setItem(k,o.ls[k])); }catch(e){} }, [LOG,ROWS,DAY,opts||{}]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  const hits=[], live=[]; const S={busy:new Set()};
  await p.route('**/*',r=>{ const u=r.request().url();
    if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/api\.0xbeta\.dev/.test(u)){ const pth=new URL(u).pathname; hits.push({t:Date.now(), p:pth});
      if(pth==='/budget') return r.fulfill({contentType:'application/json',body:JSON.stringify({limit:50,used:20,left:30})});
      if(pth==='/mine/fills') return r.fulfill({contentType:'application/json',body:JSON.stringify({fills:[]})});
      if(pth==='/mine/orders') return r.fulfill({contentType:'application/json',body:JSON.stringify({orders:[]})});
      if(pth==='/live'){ const bets=JSON.parse(new URL(u).searchParams.get('bets')||'[]'); live.push(bets); const R={}; bets.forEach(x=>{ R[x.id]=S.busy.has(x.id)?{ok:false,busy:true,note:'Novig: busy'}:{ok:true,src:x.book,price:0.45,bid:0.44,ask:0.45,title:x.name,ref:'R'+x.id,at:new Date().toISOString()}; }); return r.fulfill({contentType:'application/json',body:JSON.stringify({results:R})}); }
      return r.fulfill({contentType:'application/json',body:'{}'}); }
    if(/espn.*basketball\/nba\/scoreboard/.test(u)) return r.fulfill({contentType:'application/json',body:JSON.stringify({events:GAMES})});
    if(/espn.*\/probabilities/.test(u)) return r.fulfill({contentType:'application/json',body:JSON.stringify({pageCount:1, items:[{homeWinPercentage:0.62, awayWinPercentage:0.38}]})});
    if(/espn.*\/summary/.test(u)) return r.fulfill({contentType:'application/json',body:JSON.stringify({header:{competitions:[{status:{type:{state:'in'}}}]}})});
    if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(900);
  return {ctx,p,hits,live,S,errs};
}
const heavyOk=(live,n)=>live.filter(g=>g.some(b=>b.book==='novig'&&/^(moneyline|spread|total)$/.test(b.kind))).every(g=>g.length<=n && new Set(g.map(b=>b.sport+'|'+b.start)).size===1);
(async()=>{
  const b=await chromium.launch();
  // ---- 1. the fetch wrapper: Novig game lines grouped by league + kickoff, 6 per request ----
  { const {ctx,p,hits,live,errs}=await open(b,1280);
    live.length=0;
    const got=await p.evaluate(async ([t1,t2])=>{ const mk=(id,team,start,book,kind)=>({id,book,sport:'NBA',kind,market:kind==='prop'?'Points':'Moneyline',name:team,team,away:'A',home:'B',game:'A @ B',start});
      const bets=[mk('k1','DAL',t1,'kalshi','prop'),mk('k2','PHI',t1,'kalshi','prop')];
      ['DAL','PHI','MIA','NYK','LAL','BOS'].forEach((t,i)=>bets.push(mk('n'+i,t,t1,'novig','moneyline')));
      ['DEN','GSW'].forEach((t,i)=>bets.push(mk('m'+i,t,t2,'novig','moneyline')));
      const r=await fetch(API_BASE+'/live?bets='+encodeURIComponent(JSON.stringify(bets)),{headers:apiHeaders()}); const j=await r.json(); return Object.keys(j.results||{}).length; }, [iso(NOW-H), iso(NOW-H+40*M)]);
    check('10 bets (2 Kalshi props + 6 Novig moneylines at one tip-off + 2 at another) go as 3 requests: the props, then the Novig lines per kickoff (was 9 requests: one per Novig line)', live.length===3 && got===10 && heavyOk(live,6), {requests:live.length, sizes:live.map(g=>g.length), answered:got});
    // 7 lines at one kickoff → 6 + 1
    live.length=0;
    await p.evaluate(async t1=>{ const bets=['DAL','PHI','MIA','NYK','LAL','BOS','ORL'].map((t,i)=>({id:'x'+i,book:'novig',sport:'NBA',kind:'moneyline',market:'Moneyline',name:t,team:t,away:'A',home:'B',game:'A @ B',start:t1}));
      await fetch(API_BASE+'/live?bets='+encodeURIComponent(JSON.stringify(bets)),{headers:apiHeaders()}); }, iso(NOW-H));
    check('7 Novig lines at one kickoff go as 6 + 1 (the Worker reads a catalogue page once per request, but its budget is 45 calls)', live.length===2 && live.map(g=>g.length).sort().join(',')==='1,6', live.map(g=>g.length));
    check('no page errors', !errs.length, errs);
    await ctx.close(); }
  // ---- 2. a Live edges scan: one call per 3 games; busy answers asked again after a minute ----
  { const {ctx,p,hits,live,S,errs}=await open(b,1280);
    await p.evaluate(()=>{ document.querySelector('.tab[data-view="v-live"]').click(); }); await p.waitForTimeout(300);
    for(let i=0;i<40;i++){ if(await p.evaluate(()=>!leBusy && !!leData)) break; await p.waitForTimeout(250); }   // the tab's own first scan
    await p.evaluate(()=>{ document.getElementById('liveEvery').value='0'; });   // Auto-refresh off: only the scans below
    await p.clock.fastForward(185000);   // every price is now over 3 minutes old: the next scan asks for all of them
    const scan=()=>live.filter(g=>g.some(b=>/^le:/.test(b.id)));   // the scan's requests only (your open bets' live prices also go to /live)
    live.length=0; S.busy.add('le:e2:MIA:novig');
    await p.evaluate(()=>leScan(true)); await p.waitForTimeout(1800);
    const ids=[].concat(...scan()).map(x=>x.id), n1=scan().length;
    check('5 games in progress, Kalshi + Novig: 20 bets asked in 4 requests (3 games then 2: Kalshi lines together, Novig lines together); before, 8 bets a request and each Novig line alone made about 10', n1===4 && ids.length===20 && new Set(ids).size===20 && heavyOk(scan(),6), {requests:n1, sizes:scan().map(g=>g.length)});
    const stamp=()=>p.evaluate(()=>(document.getElementById('leStamp')||{}).textContent||'');
    await p.clock.fastForward(65000); S.busy.clear(); live.length=0;
    await p.evaluate(()=>leScan(true)); await p.waitForTimeout(1500);
    const again=[].concat(...scan()).map(x=>x.id), st=await stamp();
    check('a minute later, ESPN unchanged: the busy Novig answer is asked again (alone), the 19 good prices are kept', again.length===1 && again[0]==='le:e2:MIA:novig' && /19 prices kept/.test(st), {again, st});
    check('no page errors', !errs.length, errs);
    await ctx.close(); }
  // ---- 3. a hidden tab makes no Worker calls ----
  { const {ctx,p,hits,errs}=await open(b,1280);
    await p.waitForTimeout(2500); await p.mouse.wheel(0,10);
    await p.evaluate(()=>{ Object.defineProperty(document,'visibilityState',{value:'hidden',configurable:true}); document.dispatchEvent(new Event('visibilitychange')); });
    const h0=hits.length; await p.clock.fastForward(5*60e3); await p.waitForTimeout(400); const h1=hits.length;
    check('the page is hidden (another tab, the phone locked): five minutes pass and the Worker is not called once', h1===h0, {calls:h1-h0});
    await p.evaluate(()=>{ delete document.visibilityState; document.dispatchEvent(new Event('visibilitychange')); }); await p.mouse.wheel(0,10);
    await p.clock.fastForward(65000); await p.waitForTimeout(400); const h2=hits.length;
    check('back in view and in use: the checks resume within a minute', h2>h1, {calls:h2-h1});
    await ctx.close(); }
  // ---- 4. drop-downs ----
  { const {ctx,p,errs}=await open(b,390);
    const vis=sel=>p.evaluate(s=>{ const e=document.querySelector(s); if(!e) return null; if([...document.querySelectorAll('details:not([open])')].some(d=>d.contains(e) && !d.firstElementChild.contains(e))) return false; const r=e.getBoundingClientRect(); return r.width>0 && r.height>0 && getComputedStyle(e).display!=='none'; }, sel);   // Chromium keeps a box for the content of a closed details
    const allClosed=await p.evaluate(()=>({n:document.querySelectorAll('details.help').length, open:[...document.querySelectorAll('details.help[open]')].map(d=>d.dataset.help)}));
    check('phone: every explanation is a closed drop-down to start ('+allClosed.n+' of them)', allClosed.n>=15 && !allClosed.open.length, allClosed);
    check('phone: the board tick boxes are folded behind "Filters ▾"; Send the Sentinels stays (v4.60, owner: Cards folds too)', (await vis('#barMoreBtn'))===true && (await vis('#swOnly'))===false && (await vis('#notesAll'))===false && (await vis('#shopBtn'))===true && (await vis('#cardsOn'))===false, null);
    await p.click('#barMoreBtn'); await p.waitForTimeout(150);
    check('a tap opens them (Only sweet spot, Show rejected, Only games I already bet, Show all notes, and since v4.60 Cards)', (await vis('#swOnly'))===true && (await vis('#showRejects'))===true && (await vis('#onlyMyGames'))===true && (await vis('#notesAll'))===true && (await vis('#cardsOn'))===true, null);
    check('phone: the Today card shows the day and All; the book tiles wait behind "by book ▾"', (await vis('#todayBar .tb-t.all'))===true && (await vis('#todayBar .tb-t:not(.all)'))===false && (await vis('#todayBar .tb-more'))===true, null);
    await p.click('#todayBar .tb-more'); await p.waitForTimeout(200);
    const after=await p.evaluate(()=>({tiles:[...document.querySelectorAll('#todayBar .tb-t:not(.all)')].filter(t=>t.getBoundingClientRect().height>0).length, log:document.getElementById('v-log').classList.contains('on'), btn:(document.querySelector('#todayBar .tb-more')||{}).textContent}));
    check('"by book" shows the tiles and does not open the Bet log (the card itself does)', after.tiles>=1 && !after.log && /▴/.test(after.btn), after);
    await p.evaluate(()=>{ document.querySelector('.tab[data-view="v-live"]').click(); document.querySelector('details.help[data-help="live-edges"] summary').click(); }); await p.waitForTimeout(200);
    await p.reload(); await p.waitForTimeout(1200);
    const mem=await p.evaluate(()=>({help:[...document.querySelectorAll('details.help[open]')].map(d=>d.dataset.help), filters:document.getElementById('barMoreBtn').getAttribute('aria-expanded'), tiles:[...document.querySelectorAll('#todayBar .tb-t:not(.all)')].filter(t=>t.getBoundingClientRect().height>0).length}));
    check('after a reload the ones you opened are still open (How Live edges works, Filters, by book) and nothing else', mem.help.join()==='live-edges' && mem.filters==='true' && mem.tiles>=1, mem);
    await p.evaluate(()=>{ document.querySelector('.tab[data-view="v-log"]').click(); }); await p.waitForTimeout(300);
    const lg={csv:await vis('#csvDl'), chk:await vis('#checkResults'), wipe:await vis('#wipe'), bak:await vis('#backupLog')};
    check('Bet log: Download, ⬇ CSV and Check results are on the panel; Show as CSV, Grab closing lines, Back up, Restore and Delete wait under "More"', lg.csv===true && lg.chk===true && lg.wipe===false && lg.bak===false, lg);
    await p.evaluate(()=>{ document.querySelector('details.help[data-help="log-more"] summary').click(); }); await p.waitForTimeout(150);
    check('open More: the five buttons are there', (await vis('#wipe'))===true && (await vis('#backupLog'))===true && (await vis('#restoreLog'))===true && (await vis('#grabClose'))===true && (await vis('#csvBtn'))===true, null);
    // the drawn legends keep their state across a redraw
    await p.evaluate(()=>{ renderPerf(); const d=document.querySelector('#scoreBody details.help[data-help="sc-stages"]'); d.open=true; d.dispatchEvent(new Event('toggle')); renderPerf(); });
    const sc=await p.evaluate(()=>{ const d=document.querySelector('#scoreBody details.help[data-help="sc-stages"]'); return d?d.open:null; });
    check('the Scorecard\'s "What the stages mean" is a drop-down that stays open through a redraw', sc===true, sc);
    await p.evaluate(()=>{ document.querySelector('.tab[data-view="v-parlay"]').click(); }); await p.waitForTimeout(600);
    const pk=await p.evaluate(()=>{ const d=document.querySelector('#pkSent details.help[data-help="pk-legend"]'); return d?{open:d.open, txt:d.textContent.slice(0,40)}:null; });
    check('Parlays: "What the circles mean" is a closed drop-down in the Good in a parlay box', pk && !pk.open && /circles/.test(pk.txt), pk);
    check('no page errors', !errs.length, errs);
    await ctx.close(); }
  { const {ctx,p,errs}=await open(b,1280);
    const vis=sel=>p.evaluate(s=>{ const e=document.querySelector(s); if(!e) return null; if([...document.querySelectorAll('details:not([open])')].some(d=>d.contains(e) && !d.firstElementChild.contains(e))) return false; const r=e.getBoundingClientRect(); return r.width>0 && r.height>0 && getComputedStyle(e).display!=='none'; }, sel);   // Chromium keeps a box for the content of a closed details
    check('computer: the tick boxes and the book tiles are simply there, no Filters or by book button', (await vis('#swOnly'))===true && (await vis('#notesAll'))===true && (await vis('#barMoreBtn'))===false && (await vis('#todayBar .tb-t:not(.all)'))===true && (await vis('#todayBar .tb-more'))===false, null);
    check('no page errors', !errs.length, errs);
    await ctx.close(); }
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
