// node tests/weather-test.js — the weather tag (v3.79): outdoor NFL, college football and MLB games get 🌬️ wind, 🌧️ rain,
// ❄️ snow or 🥶 cold when it can move scoring; domes never. ESPN (indoor, city, its own sky and temperature) and
// Open-Meteo (geocoding, hourly wind, gusts, rain chance at kickoff) are stubbed in their real shapes.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const now=Date.now(), H=3600e3, kick=Math.round((now+30*H)/H)*H, iso=ms=>new Date(ms).toISOString(), day=new Date(now).toLocaleDateString('en-CA',{timeZone:'America/Chicago'});
const team=(ha,abbr)=>({ha,id:abbr,abbr,name:abbr,loc:abbr,nick:abbr,logo:'',rec:'',color:'333333',alt:'ffffff'});
const row=(name,game,o)=>Object.assign({name,game,matchup:game,side:'O',sport:'NFL',market:'225.5 Passing Yards',kind:'prop',book:'DraftKings',offeredRaw:'-110',offeredProb:.524,fairProb:.60,fairRaw:'-150',mktProb:.60,stars:3,evModel:'projection',stake:5,
  gameInfo:{state:'pre',startISO:iso(kick),timeCT:'',detail:'',teams:[team('away',game.split(' @ ')[0]),team('home',game.split(' @ ')[1])]},src:'api:NFL:props',apiKey:name},o||{});
const BOARD=[row('Windy QB','JAX @ BAL'), row('Dome QB','DAL @ IND'), row('Calm QB','NYJ @ KC'), row('Snow QB','CLE @ GB'),
  row('Full Total','Jacksonville Jaguars @ Baltimore Ravens',{kind:'total',market:'39.5 Total',gameInfo:{state:'pre',startISO:iso(kick),eventId:'1',timeCT:'',detail:'',teams:[]}}),   // v3.80: full names, ESPN id on the row
  row('Full Names','Cleveland Browns @ Green Bay Packers',{gameInfo:{state:'pre',startISO:iso(kick),timeCT:'',detail:'',teams:[]}})];   // v3.80: full names, no id
const FULLN={CLE:['Cleveland','Browns'], GB:['Green Bay','Packers']};
const c=(ha,ab)=>({homeAway:ha, score:'0', team:{abbreviation:ab, displayName:FULLN[ab]?FULLN[ab].join(' '):ab, location:FULLN[ab]?FULLN[ab][0]:ab, name:FULLN[ab]?FULLN[ab][1]:ab}});
const ev=(id,a,h,city,st,indoor,w)=>({id, date:iso(kick), status:{type:{state:'pre'}}, weather:w, competitions:[{competitors:[c('away',a),c('home',h)], venue:{fullName:h+' Stadium', indoor, address:{city, state:st, country:'USA'}}}]});
const SB={week:{number:10}, events:[ev('1','JAX','BAL','Baltimore','MD',false,{displayValue:'Cloudy',temperature:66}), ev('2','DAL','IND','Indianapolis','IN',true,{displayValue:'Mostly sunny',temperature:53}),
  ev('3','NYJ','KC','Kansas City','MO',false,{displayValue:'Sunny',temperature:61}), ev('4','CLE','GB','Green Bay','WI',false,{displayValue:'Snow',temperature:27})]};
const GEO={Baltimore:[39.29,-76.61,'MD'], 'Kansas City':[39.10,-94.58,'MO'], 'Green Bay':[44.51,-88.01,'WI'], Indianapolis:[39.77,-86.16,'IN']};
const WX={'39.29':{w:21,g:33,p:20,t:60,s:0}, '39.1':{w:6,g:10,p:5,t:61,s:0}, '44.51':{w:9,g:14,p:80,t:27,s:0.4}};
let OM_OK=true; const asked={geo:0, om:0};
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago', viewport:{width:1400,height:1000}});
  await ctx.addInitScript(([rows,d])=>{ try{ if(sessionStorage.getItem('seeded')) return; sessionStorage.setItem('seeded','1'); localStorage.clear();
    localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows})); }catch(e){} }, [BOARD,day]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  const J=(r,o)=>r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(o)});
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/geocoding-api\.open-meteo\.com/.test(u)){ asked.geo++; const n=decodeURIComponent(u.match(/name=([^&]+)/)[1]), g=GEO[n]; return J(r,{results:g?[{name:n,latitude:g[0],longitude:g[1],country_code:'US',admin1_code:g[2]},{name:n,latitude:1,longitude:1,country_code:'US',admin1_code:'ZZ'}]:[]}); }
    if(/api\.open-meteo\.com\/v1\/forecast/.test(u)){ asked.om++; if(!OM_OK) return r.fulfill({status:503,body:''}); const lat=String(+u.match(/latitude=([\d.-]+)/)[1]), x=WX[lat]||{w:3,g:5,p:0,t:70,s:0};
      const T=[], k=Math.floor((now-2*H)/H)*H; for(let t=k;t<k+60*H;t+=H) T.push(new Date(t).toISOString().slice(0,16));
      const at=t=>Date.parse(t+':00Z')===kick; return J(r,{hourly:{time:T, temperature_2m:T.map(t=>at(t)?x.t:70), precipitation_probability:T.map(t=>at(t)?x.p:0), precipitation:T.map(()=>0), snowfall:T.map(t=>at(t)?x.s:0), wind_speed_10m:T.map(t=>at(t)?x.w:2), wind_gusts_10m:T.map(t=>at(t)?x.g:4)}}); }
    if(/football\/nfl\/scoreboard/.test(u)) return J(r,SB);
    if(/espn\.com/.test(u)) return J(r,{events:[]}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(2500);
  const read=()=>p.evaluate(()=>{ const o={}; document.querySelectorAll('span.wx').forEach(e=>{ const card=e.closest('.pcard,tr'); const n=(card.querySelector('.pc-nm')||card.querySelector('.pick')).firstChild.textContent.trim(); if(e.textContent) o[n]={t:e.textContent, c:e.className, title:e.title}; }); return o; });
  let W=await read();
  check('wind at kickoff (21 mph, gusts 33) in Baltimore', W['Windy QB'] && W['Windy QB'].t==='🌬️ 21 mph · gusts 33' && /in Baltimore \(Open-Meteo\): wind 21 mph, gusts 33/.test(W['Windy QB'].title), W['Windy QB']);
  check('snow and cold in Green Bay', W['Snow QB'] && /❄️ snow 80%/.test(W['Snow QB'].t) && /🥶 27°F/.test(W['Snow QB'].t), W['Snow QB']);
  check('v3.81: a dome says 🏟️ dome, calm weather a quiet chip (temperature and wind), neither in colour', W['Dome QB'] && W['Dome QB'].t==='🏟️ dome' && /calm/.test(W['Dome QB'].c) && W['Calm QB'] && W['Calm QB'].t==='☀️ 61°F · 6 mph' && /calm/.test(W['Calm QB'].c), [W['Dome QB'], W['Calm QB']]);
  check('v3.80: a game written in full names is found too (by ESPN id, or by the teams\' full names)', W['Full Total'] && /21 mph/.test(W['Full Total'].t) && W['Full Names'] && /snow/.test(W['Full Names'].t), [W['Full Total'], W['Full Names']]);
  check('the right city: the US state from ESPN picks among same-name places', asked.geo===3, asked);
  const g0=asked.geo; await p.reload(); await p.waitForTimeout(2200);
  check('cities and forecasts are kept: a reload asks again for neither', asked.geo===g0 && asked.om===3 && Object.keys(await read()).length===6, asked);
  OM_OK=false; await p.evaluate(()=>{ localStorage.removeItem('mbev.wx'); }); await p.reload(); await p.waitForTimeout(2200);
  W=await read();
  check('if Open-Meteo does not answer, ESPN\'s own forecast still flags snow and cold', W['Snow QB'] && /❄️ snow/.test(W['Snow QB'].t) && /🥶 27°F/.test(W['Snow QB'].t) && /calm/.test((W['Windy QB']||{}).c||'calm'), W);
  check('no page errors', errs.length===0, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
