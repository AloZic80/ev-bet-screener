// node tests/texas-swap-test.js — v4.05. Alonzo, in Texas: "I can't bet DraftKings or FanDuel regular bets: look for the closest allowed
// by La Contadora" (Bovada, Novig, Kalshi, Polymarket US, DK Predictions). A row at a book you do not bet takes the same bet at your best
// book (another board row, or a live exchange price) and is screened at that price; with no such price it stays skipped.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const NOW=Date.parse('2026-11-07T18:00:00Z'), H=3600e3, iso=ms=>new Date(ms).toISOString(), DAY='2026-11-07';
const team=(ha,abbr)=>({ha,id:abbr,abbr,name:abbr,loc:abbr,nick:abbr,logo:'',rec:'',color:'333333',alt:'ffffff'});
const row=(name,book,odds,prob,fair,o)=>Object.assign({name,game:'LAL @ BOS',matchup:'LAL @ BOS',side:'O',sport:'NBA',market:'20.5 Points',kind:'prop',book,offeredRaw:odds,offeredProb:prob,fairProb:fair,fairRaw:'',mktProb:fair,stars:4,evModel:'projection',
  gameInfo:{state:'pre',startISO:iso(NOW+6*H),timeCT:'',detail:'',teams:[team('away','LAL'),team('home','BOS')]},src:'api:NBA:props',apiKey:name+book},o||{});
const ROWS=[
  row('Austin Reaves','DraftKings','-110',0.524,0.60),                                   // also on the board at Bovada
  row('Austin Reaves','Bovada','-120',0.545,0.60,{src:'api:sgo:NBA',apiKey:'sgo-1'}),
  row('Jaylen Brown','DraftKings','-110',0.524,0.60,{market:'6.5 Rebounds'}),             // Novig has it, inside the limit
  row('Jayson Tatum','FanDuel','-110',0.524,0.56,{market:'8.5 Rebounds'}),                // Novig has it, but too expensive
  row('Derrick White','FanDuel','-110',0.524,0.60,{market:'2.5 Threes'})];               // nowhere you can bet
const NOVIG={'Jaylen Brown':0.55,'Jayson Tatum':0.60};
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:1400,height:1000}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(([rows,d])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows})); }catch(e){} }, [ROWS,DAY]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); let bp=null;
  await p.route('**/*',r=>{ const u=r.request().url(), H={'access-control-allow-origin':'*'};
    if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/\/live\?bets=/.test(u)){ const ds=JSON.parse(decodeURIComponent(u.split('bets=')[1])), R={};
      ds.forEach(d=>{ const nm=Object.keys(NOVIG).find(n=>JSON.stringify(d).includes(n)); if(nm && /novig/i.test(d.id)) R[d.id]={ok:true,src:'novig',price:NOVIG[nm],outcome:'o',ref:'m',at:new Date().toISOString()}; });
      return r.fulfill({contentType:'application/json',headers:H,body:JSON.stringify({results:R})}); }
    if(/\/props\?/.test(u)){ bp=u; return r.fulfill({contentType:'application/json',headers:H,body:JSON.stringify({props:[]})}); }
    if(/espn/.test(u)) return r.fulfill({contentType:'application/json',headers:H,body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1200);
  await p.evaluate(()=>{ const i=document.getElementById('books'); i.value='Bovada, Novig, DraftKings Predictions, Kalshi, Polymarket'; i.dispatchEvent(new Event('input',{bubbles:true})); }); await p.waitForTimeout(1500);
  const R=await p.evaluate(()=>Object.fromEntries(lastRows.map(r=>[r.name+'|'+(r.swap?r.swap.orig.book:r.book), {book:r.book, odds:r.offeredRaw, hidden:!!r.hiddenDup, pass:!!r.pass, out:(r.flags||[]).filter(f=>f[0]==='out').map(f=>f[1])}])));
  check('Reaves: DraftKings row hidden, the same bet at Bovada (on the board) is the one shown', R['Austin Reaves|DraftKings'].hidden && !R['Austin Reaves|Bovada'].hidden, [R['Austin Reaves|DraftKings'], R['Austin Reaves|Bovada']]);
  check('Brown: DraftKings → Novig at its live price (−122), inside La Contadora\'s limit: playable', R['Jaylen Brown|DraftKings'].book==='Novig' && R['Jaylen Brown|DraftKings'].pass, R['Jaylen Brown|DraftKings']);
  check('Tatum: FanDuel → Novig, but at −150 it is past the limit: skipped for the price (not for the book)', R['Jayson Tatum|FanDuel'].book==='Novig' && !R['Jayson Tatum|FanDuel'].pass && R['Jayson Tatum|FanDuel'].out.some(x=>/floor/.test(x)) && !R['Jayson Tatum|FanDuel'].out.some(x=>/book/.test(x)), R['Jayson Tatum|FanDuel']);
  check('White: nowhere you can bet: stays FanDuel, skipped as not a book you bet', R['Derrick White|FanDuel'].book==='FanDuel' && !R['Derrick White|FanDuel'].pass && R['Derrick White|FanDuel'].out.some(x=>/not a book you bet/.test(x)), R['Derrick White|FanDuel']);
  const tag=await p.evaluate(()=>{ const t=[...document.querySelectorAll('#tbody tr, #placeCards .pcard')].filter(tr=>/Jaylen Brown/.test(tr.textContent)).map(x=>x.textContent).join(' '); return t.replace(/\s+/g,' '); });
  check('the row says where it came from: "↪ for you: Novig (was DraftKings −110)"', /for you: Novig \(was DraftKings -110\)/.test(tag), tag.slice(0,200));
  // BettingPros is now asked for DraftKings Predictions (book 74)
  await p.evaluate(()=>{ document.getElementById('apiSport').value='NBA'; document.getElementById('loadApi').click(); }); await p.waitForTimeout(800);
  await p.evaluate(()=>{ const a=document.getElementById('loadAnyway'); if(a) a.click(); }); await p.waitForTimeout(800);
  const ids=decodeURIComponent((String(bp||'').match(/bp_books=([^&]*)/)||[])[1]||'');
  check('BettingPros is asked for DraftKings Predictions (74), Novig (60), Kalshi (68), Polymarket (73, 75), and not the DraftKings sportsbook (12)', /\b74\b/.test(ids) && /\b60\b/.test(ids) && !/\b12\b/.test(ids), ids);
  check('no page errors', !errs.length, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
