// node tests/startup-test.js — v4.16. Alonzo, 11/7: "NO information is on the app. Please tell me you didn't delete." v4.15 stopped the page
// halfway on startup ("Cannot access 'nrm' before initialization"): a bet from his books with a full team name and ESPN's game drew the Bet
// log before a helper existed. The data was fine; the board, Sources, budget and Today card never loaded. This loads a log and a board
// like his (book fills with full names, a book parlay, Odds API rows, a waiting Kalshi order) and checks the whole page comes up.
const path=require('path'); const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||path.join(__dirname,'..','index.html'),'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const NOW=Date.parse('2026-11-07T20:30:00Z'), H=3600e3, iso=ms=>new Date(ms).toISOString(), DAY='2026-11-07';
const T=(ha,abbr,loc,nick,short)=>({ha,id:abbr,abbr,name:short,loc,nick,logo:'',rec:'',color:'333333',alt:'ffffff'});
const gl=(team,away,home,teams,book,k,start)=>({name:team,team,game:away+' @ '+home,matchup:away+' @ '+home,side:'',sport:'NCAAF',market:'Moneyline',kind:'moneyline',book,offeredRaw:'+104',offeredProb:0.49,fairProb:0.52,fairRaw:'',mktProb:0.52,stars:null,evModel:'market',gameInfo:{state:'pre',startISO:iso(start),timeCT:'',detail:'',teams},src:'api:oddsapi:NCAAF',apiKey:k});
const prop=(n,k,book)=>({name:n,team:'BOS',game:'LAL @ BOS',matchup:'LAL @ BOS',side:'O',sport:'NBA',market:'24.5 Points',kind:'prop',book,offeredRaw:'-110',offeredProb:0.524,fairProb:0.57,fairRaw:'',mktProb:0.57,stars:3,evModel:'market',gameInfo:{state:'pre',startISO:iso(NOW+3*H),teams:[T('away','LAL','Los Angeles','Lakers','Lakers'),T('home','BOS','Boston','Celtics','Celtics')]},src:'api:NBA:props',apiKey:k});
const ROWS=[gl('Oklahoma State Cowboys','Texas Tech Red Raiders','Oklahoma State Cowboys',[T('away','TTU','Texas Tech','Red Raiders','Texas Tech'),T('home','OKST','Oklahoma State','Cowboys','Oklahoma St')],'Kalshi','k1',NOW+7*24*H),
  gl('North Carolina Tar Heels','Louisville Cardinals','North Carolina Tar Heels',[T('away','LOU','Louisville','Cardinals','Louisville'),T('home','UNC','North Carolina','Tar Heels','North Carolina')],'Kalshi','k2',NOW+7*24*H),
  prop('Jaylen Brown','k3','Novig'), prop('Jayson Tatum','k4','DraftKings'), Object.assign(prop('No Game','k5','Bovada'),{gameInfo:null})];
const B=(id,o)=>Object.assign({id,kind:'prop',book:'Novig',odds:'+127',stake:1,sport:'NHL',date:DAY,start:iso(NOW+H),autoFrom:'novig',fillBook:'novig',fillRef:'m'+id,fills:['f'+id]},o);
const LOG=[B('1',{name:'Nashville Predators',kind:'spread',market:'-1.5 Spread',team:'NSH',game:'NSH @ X'}),B('2',{name:'Brooklyn Nets @ Atlanta Hawks',kind:'total',market:'223.5 Total Pts',side:'U'}),
 B('3',{name:'Washington Wizards',kind:'moneyline',market:'Moneyline',book:'Polymarket US',team:'WAS'}),{id:'p',kind:'parlay',name:'Novig combo · 2 picks',market:'2-pick parlay',book:'Novig',odds:'+143',stake:1,date:DAY,parlay:{legs:'Oklahoma State OKST Moneyline -212; New York Giants NYG Moneyline -153',picks:2}},
 B('4',{name:'Tyler Bertuzzi',market:'1.5 Shots On Goal',side:'O'}),B('5',{name:'San José State Spartans',kind:'spread',market:'-11.5 Spread',team:'San José State Spartans',sport:'NCAAF',game:'San José State Spartans @ Wyoming Cowboys',book:'Kalshi',gameInfo:{state:'pre',startISO:iso(NOW+H),teams:[T('away','SJSU','San José State','Spartans','San José St'),T('home','WYO','Wyoming','Cowboys','Wyoming')]}})];
const ORD={orders:[{id:'o1',book:'kalshi',ref:'KXNCAAFGAME-26NOV07KSUOKST-OKST',side:'yes',action:'buy',price:0.49,qty:2,title:'Oklahoma St. vs Kansas St.',bet:{sport:'NCAAF',kind:'moneyline',team:'OKST',teamsCode:'KSUOKST',start:iso(NOW)}},{id:'o9',book:'novig',ref:'x',side:null,price:null,qty:null,title:null,bet:null},{id:'o8',book:'kalshi',ref:'KX',side:'yes',price:0.3,qty:1,title:'Weird',bet:{kind:'prop'}}]};
(async()=>{ const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:1400,height:900}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(([rows,d,L])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows})); localStorage.setItem('mbev.log',JSON.stringify(L)); localStorage.setItem('mbev.pass','x'); localStorage.setItem('mbev.boardBook',''); }catch(e){} }, [ROWS,DAY,LOG]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/\/mine\/orders/.test(u)) return r.fulfill({contentType:'application/json',body:JSON.stringify(ORD)});
    if(/\/mine\/fills/.test(u)) return r.fulfill({contentType:'application/json',body:JSON.stringify({fills:[]})});
    if(/\/budget/.test(u)) return r.fulfill({contentType:'application/json',body:JSON.stringify({limit:50,used:20,left:30})});
    if(/\/live\?/.test(u)) return r.fulfill({contentType:'application/json',body:JSON.stringify({results:{}})});
    if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.fulfill({status:404,body:'{}'}); });
  await p.goto('http://app.test/'); await p.waitForTimeout(4000);
  const R=await p.evaluate(()=>({rows:lastRows.length, cards:document.querySelectorAll('#placeCards .pcard').length, today:(document.getElementById('todayBar')||{}).innerText||'', budget:(document.getElementById('apiBudget')||{}).textContent, log:document.querySelectorAll('#logBody tr').length}));
  check('no startup error (v4.15: Cannot access nrm before initialization)', !errs.length, errs);
  check('the saved board comes back (rows and Place these cards)', R.rows>=4 && R.cards>=1, {rows:R.rows, cards:R.cards});
  check('the Today card is drawn', /TODAY/.test(R.today) && /bets/.test(R.today), R.today.slice(0,80));
  check('the BettingPros budget loads (startup reached the end)', /20 \/ 50/.test(R.budget||''), R.budget);
  check('the Bet log is drawn', R.log>0, R.log);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0); })();
