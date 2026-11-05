// node tests/sentinels-parlay-test.js — the Sentinels send the Parlays tab the props that are not good as a single bet
// but clear what a 2- to 6-pick entry needs per pick (PrizePicks Power: 57.7%, 58.5%, 56.2%, 54.9%, 54.7%; 4 is the
// target). A single bet worth placing stays on the board; a pick below every break-even stays out. Live prices are stubbed.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const now=Date.now(), H=3600e3, iso=ms=>new Date(ms).toISOString(), day=new Date(now).toLocaleDateString('en-CA',{timeZone:'America/Chicago'});
const team=(ha,abbr)=>({ha,id:abbr,abbr,name:abbr,loc:abbr,nick:abbr,logo:'',rec:'',color:'333333',alt:'ffffff'});
// p = the board's chance (market = model here, so the blend is exact). offered above p = not worth it as a single bet.
const prop=(name,g,h,p,offered,o)=>Object.assign({name,game:g,matchup:g,side:'O',sport:'NBA',market:'24.5 Points',kind:'prop',book:'DraftKings',
  offeredRaw:'-110',offeredProb:offered,fairProb:p,fairRaw:'-150',mktProb:p,stars:3,evModel:'projection',
  gameInfo:{state:'pre',startISO:iso(now+h*H),timeCT:'',detail:'',teams:[team('away',g.split(' @ ')[0]),team('home',g.split(' @ ')[1])]},src:'api:NBA:props',apiKey:name},o||{});
const BOARD=[
  prop('Alone Good','AAA @ BBB',20,0.62,0.524),                                   // a single bet worth placing: stays on the board
  prop('Pick Em','CCC @ DDD',21,0.60,0.524,{book:'PrizePicks'}),                  // PrizePicks' own line: never a single bet
  prop('Four Fit','EEE @ FFF',22,0.57,0.60),                                      // not worth it alone; clears 4, 5, 6
  prop('Five Six','GGG @ HHH',23,0.55,0.58),                                      // clears 5 and 6 only
  prop('Too Low','III @ JJJ',24,0.53,0.56),                                       // under every break-even
  prop('Top Leg','KKK @ LLL',25,0.59,0.62),                                       // clears 2 to 6
  prop('Second Leg','MMM @ NNN',26,0.585,0.61),                                   // clears 2 to 6 (just)
];
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago', viewport:{width:1400,height:1000}});
  await ctx.addInitScript(([rows,d])=>{ try{ if(sessionStorage.getItem('seeded')) return; sessionStorage.setItem('seeded','1'); localStorage.clear();
    localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows})); }catch(e){} }, [BOARD,day]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/api\.0xbeta\.dev\/live\?/.test(u)) return r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:'{"results":{}}'});
    if(/espn\.com.*scoreboard/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1500);
  await p.click('#shopBtn'); await p.waitForTimeout(1500);
  const msg=await p.textContent('#shopMsg');
  check('the Sentinels come back with picks for a parlay', /🎟️\s*6 good in a parlay/.test(msg), msg);
  await p.click('#shopMsg .pk-sent-go'); await p.waitForTimeout(500);
  check('the link opens the Parlays tab at those picks', await p.evaluate(()=>document.getElementById('v-parlay').classList.contains('on') && !!document.querySelector('#pkSent .pk-sent-list')), true);
  const S=await p.evaluate(()=>[...document.querySelectorAll('#pkSent .pk-sent-list li')].map(li=>({name:li.querySelector('.pk-sl-who b').textContent, p:li.querySelector('.pk-sl-p').textContent,
    fits:[...li.querySelectorAll('.pk-fits i.on')].map(i=>+i.textContent), alone:li.querySelector('.pk-sl-who .meta:last-child').textContent})));
  const F=n=>(S.find(x=>x.name===n)||{}).fits||[];
  check('every pick that clears a break-even, good alone or not, best first (a single bet stays on the board too)', S.map(x=>x.name).join()==='Alone Good,Pick Em,Top Leg,Second Leg,Four Fit,Five Six', S.map(x=>x.name+' '+x.p));
  check('which entry sizes each clears (2, 3, 4, 5, 6)', F('Top Leg').join()==='2,3,4,5,6' && F('Four Fit').join()==='4,5,6' && F('Five Six').join()==='5,6', S.map(x=>x.name+': '+x.fits.join(' ')));
  check('each says it is good alone too, or why it is not a single bet', /good alone too/.test(S[0].alone) && /pick’em line/.test(S[1].alone) && S.slice(2).every(x=>/alone: /.test(x.alone)), S.map(x=>x.alone));
  const wh=await p.evaluate(()=>({sent:[...document.querySelectorAll('#pkSent .pk-sent-list .pk-where')].map(x=>x.textContent), card:[...document.querySelectorAll('#pkSent .pk-card .pk-where')].map(x=>x.textContent), legend:!!document.querySelector('#pkSent .pk-legend')}));
  check('every pick says its sport and game (and team when known), on the list and on the slip; the circles are explained', wh.sent.length===6 && wh.sent.every(t=>/^NBA · [A-Z]{3} @ [A-Z]{3}/.test(t)) && wh.card.length>=4 && wh.card.every(t=>/^NBA · /.test(t)) && wh.legend, wh);
  const be=await p.evaluate(()=>[...document.querySelectorAll('#pkSent .pk-be-i')].map(x=>x.textContent));
  check('the break-even of each size is shown, 4 starred', be.length===5 && /★ 4 picks 56\.2%/.test(be.join('|')) && /2 picks 57\.7%/.test(be[0]) && /6 picks 54\.7%/.test(be[4]), be);
  const card=await p.evaluate(()=>{ const c=document.querySelector('#pkSent .pk-card'); return c?{title:c.querySelector('.pk-h b').textContent, best:!!c.querySelector('.pk-best'), ev:c.querySelector('.pk-ev').textContent, legs:[...c.querySelectorAll('.pk-legs li')].length}:null; });
  check('a ready 4-pick from these, starred, priced, with its stake to log (not called best: that is the cards below)', card && card.title==='★ The Sentinels’ 4 picks' && card.legs===4 && /^\+/.test(card.ev) && !card.best, card);
  const why=await p.evaluate(()=>{ const n=document.querySelector('#pkSent .pk-sent-why'), cards=[...document.querySelectorAll('#pkSent .pk-card .pk-h b')].map(b=>b.textContent); return {why:n?n.textContent:'', cards}; });
  const more=/grows your bankroll more/.test(why.why);
  check('4 picks is labelled your target; a size that grows the bankroll more is shown next to it, not hidden', /4 picks is your target/.test(why.why) && (more ? why.cards.length===2 && why.cards[0]==='★ The Sentinels’ 4 picks' && /^The Sentinels’ [2356] picks$/.test(why.cards[1]) : why.cards.length===1), why);
  await p.click('#pkSent .pk-sent-add[data-k="top leg|points"]'); await p.waitForTimeout(300);
  const mine=await p.evaluate(()=>({mine:pkState.mine, btn:document.querySelector('#pkSent .pk-sent-add[data-k="top leg|points"]').textContent}));
  check('+ Add puts it in Your entry', mine.mine.includes('top leg|points') && /In your entry/.test(mine.btn), mine);
  await p.click('#pkSent .pk-log'); await p.waitForTimeout(300);
  const lg=await p.evaluate(()=>{ const x=logged[logged.length-1]; return x?{kind:x.kind, book:x.book, picks:x.parlay&&x.parlay.picks}:null; });
  check('Log this entry saves the 4-pick to the Bet log', lg && lg.kind==='parlay' && lg.picks===4 && lg.book==='PrizePicks', lg);
  await p.setViewportSize({width:390,height:844}); await p.waitForTimeout(300);
  const ph=await p.evaluate(()=>{ const el=document.getElementById('pkSent'), r=el.getBoundingClientRect(); return {left:r.left, right:r.right, w:innerWidth, overflow:document.documentElement.scrollWidth>innerWidth+1}; });
  check('phone: the section fits the screen', ph.left>=0 && ph.right<=ph.w+1 && !ph.overflow, ph);
  check('no page errors', errs.length===0, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
