// node tests/photos-test.js — player photos on the "Place these" cards: FantasyPros by the player's ID first, ESPN's own
// headshot when that fails or there is no ID (college, WNBA, soccer), and only on an exact name match on the game's two
// ESPN rosters. No exact match, or the same name on both teams, means no photo (the team logo stays). Images are stubbed.
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
  await p.reload(); await p.waitForTimeout(2000);
  check('rosters are kept on the device: no new calls after a reload', rosterHits.length===uniq.size, rosterHits.length);
  check('no page errors', errs.length===0, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
