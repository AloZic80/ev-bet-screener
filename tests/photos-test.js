// node tests/photos-test.js — pictures: player photos on the "Place these" cards AND on every board row, Parlays pick and
// Bet log bet: FantasyPros by the player's ID first, ESPN's own headshot when that fails or there is no ID (college, WNBA,
// soccer), and only on an exact name match on the game's two ESPN rosters. No exact match, or the same name on both teams,
// means no photo (the team logo stays). A team bet shows its team's logo; a game total both. Images are stubbed.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const PNG=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==','base64');
const now=Date.now(), H=3600e3, iso=ms=>new Date(ms).toISOString(), day=new Date(now).toLocaleDateString('en-CA',{timeZone:'America/Chicago'});
const hs=(lg,id)=>'https://a.espncdn.com/i/headshots/'+lg+'/players/full/'+id+'.png';
const team=(ha,id,abbr)=>({ha,id,abbr,name:abbr,loc:abbr,nick:abbr,logo:'https://a.espncdn.com/i/teamlogos/x/500/'+abbr+'.png',rec:'',color:'333333',alt:'ffffff'});
const gi=(h,a,b)=>({state:'pre',startISO:iso(now+h*H),timeCT:'',detail:'',teams:[a,b]});
const prop=(name,sport,game,h,teams,o)=>Object.assign({name,game,matchup:game,side:'O',sport,market:'24.5 Points',kind:'prop',book:'DraftKings',offeredRaw:'-110',offeredProb:.524,fairProb:.6,fairRaw:'-150',mktProb:.56,stars:4,evModel:'projection',gameInfo:gi(h,...teams),src:'api:'+sport+':props',apiKey:name},o||{});
const BOARD=[
  prop('Josh Allen','NFL','BUF @ MIA',20,[team('away','2','BUF'),team('home','15','MIA')],{pid:'111',team:'BUF'}),          // FantasyPros photo loads
  prop('Tyreek Hill','NFL','KC @ DEN',21,[team('away','12','KC'),team('home','7','DEN')],{pid:'222',team:'KC'}),           // FantasyPros fails → ESPN
  prop('Lionel Messi','MLS','MIA @ NYC',22,[team('away','20232','MIA'),team('home','17606','NYC')],{market:'2.5 Shots'}),        // soccer: ESPN only, no team picked (no logo)
  prop('Nic Claxton','NBA','BKN @ BOS',23,[team('away','17','BKN'),team('home','2','BOS')],{team:'BKN'}),                    // roster says Nicolas: no exact match
  prop('Jalen Williams','NBA','OKC @ DEN',24,[team('away','25','OKC'),team('home','7','DEN')],{team:'OKC'}),                 // same name on both rosters
  prop('Luka Doncic','NBA','DAL @ LAL',25,[team('away','6','DAL'),team('home','13','LAL')],{team:'LAL'}),                    // roster spells it Dončić
  prop('Marvin Harrison Jr.','NFL','ARI @ SEA',26,[team('away','22','ARI'),team('home','26','SEA')],{pid:'777',team:'ARI'}),   // FantasyPros fails; ESPN has "Marvin Harrison Jr."
];
const ROSTERS={   // ESPN: football comes in groups, basketball flat
  'football/nfl/2':{athletes:[{position:'offense',items:[{fullName:'Josh Allen',displayName:'Josh Allen',headshot:{href:hs('nfl',3918298)}}]}]},
  'football/nfl/12':{athletes:[{position:'offense',items:[{fullName:'Tyreek Hill',displayName:'Tyreek Hill',headshot:{href:hs('nfl',3116406)}}]}]},
  'soccer/usa.1/20232':{athletes:[{fullName:'Lionel Messi',displayName:'Lionel Messi',headshot:{href:hs('soccer',45843)}}]},
  'basketball/nba/17':{athletes:[{fullName:'Nicolas Claxton',displayName:'Nicolas Claxton',headshot:{href:hs('nba',4278067)}}]},
  'basketball/nba/25':{athletes:[{fullName:'Jalen Williams',displayName:'Jalen Williams',headshot:{href:hs('nba',4593803)}}]},
  'basketball/nba/7':{athletes:[{fullName:'Jalen Williams',displayName:'Jalen Williams',headshot:{href:hs('nba',9999999)}}]},
  'basketball/nba/13':{athletes:[{fullName:'Luka Dončić',displayName:'Luka Dončić',headshot:{href:hs('nba',3945274)}}]},
  'football/nfl/22':{athletes:[{position:'offense',items:[{fullName:'Marvin Harrison Jr.',displayName:'Marvin Harrison Jr.',headshot:{href:hs('nfl',4432708)}}]}]},
};
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago', viewport:{width:1400,height:3000}});
  await ctx.addInitScript(([rows,d])=>{ try{ if(sessionStorage.getItem('seeded')) return; sessionStorage.setItem('seeded','1'); localStorage.clear();
    localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows})); }catch(e){} }, [BOARD,day]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); const rosterHits=[];
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    const m=u.match(/site\.api\.espn\.com\/apis\/site\/v2\/sports\/(.+?)\/teams\/([^/]+)\/roster/);
    if(m){ rosterHits.push(m[1]+'/'+m[2]); const j=ROSTERS[m[1]+'/'+m[2]]; return j ? r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(j)}) : r.fulfill({status:404,body:''}); }
    if(/espn\.com.*scoreboard/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'});
    if(/images\.fantasypros\.com\/images\/players\/nfl\/111\//.test(u)) return r.fulfill({contentType:'image/webp',body:PNG});   // loads
    if(/images\.fantasypros\.com/.test(u)) return r.fulfill({status:404,body:''});                                                // the rest fail
    if(/a\.espncdn\.com\//.test(u)) return r.fulfill({contentType:'image/png',body:PNG});
    return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(2500);
  await p.evaluate(()=>setMode('volado')); await p.waitForTimeout(2500);   /* v4.76: every sample prop is at La Contadora 57.4% (model 60%, market 56%: min(.60, .56 + .35 × .04)), so its card is under 🪙 Volado (50–60%), not the opening tab; rosters are asked for once the cards are on screen */
  const cards=await p.evaluate(()=>[...document.querySelectorAll('#placeCards .pcard')].map(c=>{ const box=c.querySelector('[data-pcidx]'), r=lastRows.find(x=>x.idx===+(box&&box.dataset.pcidx)); const img=c.querySelector('img.pc-hs');
    return {name:r&&r.name, src:img?img.getAttribute('src'):null, logo:!!c.querySelector('img.pc-cl'), loaded:img?img.complete&&img.naturalWidth>0:null}; }));
  const C=n=>cards.find(x=>x.name===n)||{};
  check('all 7 player cards are shown', cards.length===7, cards.map(x=>x.name));
  check('FantasyPros photo by the player’s ID when it loads (Josh Allen)', /images\.fantasypros\.com\/images\/players\/nfl\/111\/headshot/.test(C('Josh Allen').src||'') && C('Josh Allen').loaded, C('Josh Allen'));
  check('FantasyPros fails → ESPN’s headshot (Tyreek Hill)', C('Tyreek Hill').src===ROSTERS['football/nfl/12'].athletes[0].items[0].headshot.href && C('Tyreek Hill').loaded, C('Tyreek Hill'));
  check('soccer player (FantasyPros has none): ESPN’s headshot, on a card that had no team logo (Lionel Messi)', C('Lionel Messi').src===ROSTERS['soccer/usa.1/20232'].athletes[0].headshot.href && C('Lionel Messi').loaded, C('Lionel Messi'));
  check('no exact name match → no photo, team logo stays (Nic Claxton vs Nicolas Claxton)', C('Nic Claxton').src===null && C('Nic Claxton').logo, C('Nic Claxton'));
  check('same name on both teams → no photo (Jalen Williams)', C('Jalen Williams').src===null, C('Jalen Williams'));
  check('accents ignored (Luka Doncic = Luka Dončić)', C('Luka Doncic').src===ROSTERS['basketball/nba/13'].athletes[0].headshot.href, C('Luka Doncic'));
  check('Jr. handled, FantasyPros fallback to ESPN (Marvin Harrison Jr.)', C('Marvin Harrison Jr.').src===ROSTERS['football/nfl/22'].athletes[0].items[0].headshot.href, C('Marvin Harrison Jr.'));
  const uniq=new Set(rosterHits);
  check('each team roster asked once, even ones ESPN does not have', rosterHits.length===uniq.size && uniq.size===14, rosterHits.length+' calls, '+uniq.size+' teams');
  await p.reload(); await p.evaluate(()=>setMode('volado')); await p.waitForTimeout(2000);   /* v4.76: the same 7 cards on screen again (Volado), so a missing roster would be asked for */
  check('rosters are kept on the device: no new calls after a reload', rosterHits.length===uniq.size, rosterHits.length);
  // the same pictures on the board's rows (cards off), the Parlays picks and the Bet log
  await p.evaluate(()=>{ const c=document.getElementById('cardsOn'); c.checked=false; c.dispatchEvent(new Event('change')); });
  await p.evaluate(()=>{ lastRows.push(Object.assign({},lastRows[0],{idx:900,name:'BUF',team:'BUF',kind:'moneyline',market:'Moneyline',side:'',pid:null,apiKey:'ml'}),
      Object.assign({},lastRows[0],{idx:901,name:'BUF @ MIA',team:null,kind:'total',market:'47.5 Total',side:'O',pid:null,apiKey:'tot'})); refresh(); });
  await p.waitForTimeout(1800);
  const rowPic=await p.evaluate(()=>{ const o={}; document.querySelectorAll('#tbody tr').forEach(tr=>{ const av=tr.querySelector('.av'); const nm=(tr.querySelector('.pick')||{}).textContent; if(!av||!nm) return;
      const hs=av.querySelector('.av-hs'); o[nm]={kind:[...av.classList].filter(c=>c!=='av').join(' '), photo:hs?hs.getAttribute('src'):null, logos:av.querySelectorAll('img:not(.av-hs)').length}; }); return o; });
  const R=n=>rowPic[n]||{};
  check('board rows: FantasyPros photo by ID (Josh Allen)', /fantasypros\.com\/images\/players\/nfl\/111\//.test(R('Josh Allen').photo||''), R('Josh Allen'));
  check('board rows: ESPN photo when FantasyPros fails or has none (Tyreek Hill, Lionel Messi, Luka Doncic)', /espncdn/.test(R('Tyreek Hill').photo||'') && /espncdn/.test(R('Lionel Messi').photo||'') && /espncdn/.test(R('Luka Doncic').photo||''), [R('Tyreek Hill'),R('Lionel Messi'),R('Luka Doncic')]);
  check('board rows: no exact match or a name on both teams → the team logo, no photo', R('Nic Claxton').photo===null && R('Nic Claxton').logos===1 && R('Jalen Williams').photo===null, [R('Nic Claxton'),R('Jalen Williams')]);
  check('board rows: a team bet shows the team logo; a game total both teams', /av-team/.test(R('BUF').kind) && R('BUF').logos===1 && /av-pair/.test(R('BUF @ MIA').kind) && R('BUF @ MIA').logos===2, [R('BUF'),R('BUF @ MIA')]);
  await p.click('.tab[data-view="v-parlay"]'); await p.waitForTimeout(1200);
  const pk=await p.evaluate(()=>[...document.querySelectorAll('#pkPool tr')].map(tr=>{ const hs=tr.querySelector('.av .av-hs'); return [(tr.querySelector('b')||{}).textContent, hs?hs.getAttribute('src'):null]; }).filter(x=>x[0]));
  check('Parlays picks have the same pictures', pk.length>=5 && pk.some(x=>x[0]==='Josh Allen' && /fantasypros/.test(x[1]||'')) && pk.some(x=>x[0]==='Luka Doncic' && /espncdn/.test(x[1]||'')), pk);
  // a bet logged from the board keeps the player's ID, so its photo stays in the Bet log
  await p.click('.tab[data-view="v-board"]'); await p.waitForTimeout(300);
  const idx=await p.evaluate(()=>lastRows.find(r=>r.name==='Josh Allen').idx);
  await p.click('#tbody button.bet-btn[data-idx="'+idx+'"]'); await p.waitForTimeout(200); await p.fill('#tbody tr.editor .eb-stake','5'); await p.click('#tbody tr.editor .eb-save'); await p.waitForTimeout(300);
  if(await p.$('#tbody tr.editor')){ await p.click('#tbody tr.editor .eb-save'); await p.waitForTimeout(300); }
  await p.click('.tab[data-view="v-log"]'); await p.waitForTimeout(1200);
  const lg=await p.evaluate(()=>{ const i=logged.findIndex(b=>b.name==='Josh Allen'), tr=i>=0&&document.querySelector('#logBody button.kill.edit[data-i="'+i+'"]').closest('tr'), hs=tr&&tr.querySelector('.av .av-hs'); return {pid:i>=0?logged[i].pid:null, photo:hs?hs.getAttribute('src'):null}; });
  check('Bet log: the bet keeps the player ID and shows the photo', lg.pid==='111' && /fantasypros/.test(lg.photo||''), lg);
  check('no page errors', errs.length===0, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
