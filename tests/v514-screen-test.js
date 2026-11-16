// node tests/v514-screen-test.js [index.html] — v5.14 (owner 11/15: "Go ahead with 5.14 and removing the Daily bet goal 20, as its probably more per day. REmove math pick."),
// from the Las Karens review (agent-notes/karens-review_2026-11-15_v2.md).
// A. the Daily bet goal is gone (Settings field, "N / 20" and its bars in Today's games, Bets by game day and Reports); an old saved dayGoal does not break anything; the daily MAX stays.
// B. the "#1 math pick ... Show it" banner and the "#1 MATH PICK" card label are gone; the card order is the same.
// C. Parole fits a phone (360, 390, 414: the page does not scroll sideways; its table scrolls inside its own box); no change at 1000+.
// D. phone: Load and Refresh fit in the bottom bar, More ▾ has a close ×, "Placed at" has the full row, tap targets are 40 px; none of it changes the computer layout.
// E. words: the Novig fee line, the Parlay "no stake" cap, Reports "Is the model honest?", the Boring card wording, the calm Parlay headline, the Paste Sample, the free entry hint,
//    "wins $" rounded to the cent.
// Fails on the v5.13 file, passes on the new one.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,600)); };
const NOW=Date.parse('2026-11-15T18:00:00Z'), H=3600e3, iso=ms=>new Date(ms).toISOString(), DAY='2026-11-15';   // Sun 12:00 PM CT
const T=(ha,abbr,loc,nick)=>({ha,id:abbr,abbr,name:loc+' '+nick,loc,nick,logo:'',rec:'',color:'333333',alt:'ffffff'});
const TEAMS=[T('away','LAC','Los Angeles','Clippers'),T('home','MIN','Minnesota','Timberwolves')];
const prop=(name,market,stars,p,fair,mkt,k,book,raw)=>({name,team:'MIN',game:'LAC @ MIN',matchup:'LAC @ MIN',side:'O',sport:'NBA',market,kind:'prop',book:book||'Novig',offeredRaw:raw||'-108',offeredProb:p,fairProb:fair,fairRaw:'',mktProb:mkt,stars,evModel:'market',
  gameInfo:{state:'pre',startISO:iso(NOW+6*H),timeCT:'',detail:'',teams:TEAMS},src:'api:NBA:props',apiKey:k,loadedAt:iso(NOW-60e3)});
const VOLADO=[prop('Five Star','16.5 Points',5,0.52,0.54,0.535,'k1'), prop('Three Star','8.5 Rebounds',3,0.45,0.52,0.51,'k2'), prop('Four Star','4.5 Assists',4,0.50,0.535,0.53,'k3')];   // 53% chances: all under Volado, none under the default Machín
const FAV=[prop('Cheap Fav','16.5 Points',4,230/330,0.75,0.72,'k9','DraftKings','-230')];   // a $10 bet at -230 wins $4.3478
const bet=(id,o)=>Object.assign({id,key:id,sport:'NFL',kind:'prop',book:'Novig',odds:'+100',stake:2,date:DAY,dateSet:true,manual:true,game:'KC @ BUF',name:'Player '+id,side:'O',market:'10.5 Points',betnow:'O 10.5 +100',snap:{at:iso(NOW-5*H)}},o);
const LOG=[ bet('a',{stake:3,odds:'-150',result:'win',gradedBy:'manual',start:iso(NOW-4*H)}), bet('b',{stake:1.5,result:'loss',gradedBy:'manual',start:iso(NOW-4*H)}), bet('c',{stake:2,start:iso(NOW+3*H)}) ];
const ALLERR=[];
async function open(b, o){ o=o||{}; const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:o.w||1280,height:o.h||900},isMobile:(o.w||1280)<700,hasTouch:(o.w||1280)<700}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(([R,L,cfg,dark])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify(cfg||{books:'Novig,DraftKings',cfgVer:3.03}));
      if(R) localStorage.setItem('mbev.board',JSON.stringify({rows:R,at:Date.now()})); if(L) localStorage.setItem('mbev.log',JSON.stringify(L)); if(dark) localStorage.setItem('mbev.theme','dark'); }catch(e){} }, [o.rows||null,o.log||null,o.cfg||null,!!o.dark]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>{ errs.push(e.message); ALLERR.push(e.message); });
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1500); if(o.dark) await p.evaluate(()=>{ document.documentElement.setAttribute('data-theme','dark'); });
  return {ctx,p,errs}; }
const tab=async(p,v)=>{ await p.evaluate(v=>{ document.querySelector('.tab[data-view="'+v+'"]').click(); },v); await p.waitForTimeout(500); };
// the Parole table, drawn by the app's own renderParole from one jailed bet (its two helpers answer with fixed numbers)
const paroleFx=()=>{ const rungs=[0.58,0.57,0.56].map((p,i)=>({p,sweet:i===1,net:0.05+i*0.01,mNet:0.02,stake:2.5,payout:4.3,chance:'about 1 in 4'}));
  window.paroleCandidates=()=>[{idx:991,name:'Test Player',side:'O',market:'16.5 Points',game:'LAC @ MIN',gameInfo:{},fairProb:0.6,mktProb:0.55,flags:[['warn','below the minimum']],_par:1,pass:false}];
  window.paroleOf=()=>({rungs,src:'novig',q:null,ask:0.6,max:0.58,total:7.5,outlierMode:false,research:false,shrinkWhy:'',take:false,why:''});
  renderParole(); };
(async()=>{
  const b=await chromium.launch();
  // ================= A. no Daily bet goal =================
  let S=await open(b,{w:1280,h:900,log:LOG,rows:VOLADO,cfg:{books:'Novig',cfgVer:3.03,dayGoal:'20',bank:'1500'}});
  let a=await S.p.evaluate(()=>({field:!!document.getElementById('dayGoal'), lab:/Daily bet goal/i.test(document.getElementById('v-settings').innerText+document.getElementById('v-settings').innerHTML), bank:document.getElementById('bank').value, cfgGoal:cfgRead().dayGoal, dayMax:cfgRead().dayMax}));
  check('A1. Settings has no "Daily bet goal" field (an old saved dayGoal 20 is read without error and ignored; the bank still loads)', !a.field && !a.lab && a.bank==='1500' && a.cfgGoal===undefined, a);
  check('A2. the daily MAX is untouched: $1500 × 10% = $150 and its field is still there', a.dayMax===150 && await S.p.evaluate(()=>!!document.getElementById('dayMaxPct')), a);
  const t1=await S.p.evaluate(()=>{ renderTodayLine(); renderDays(); return {line:document.getElementById('todayLine').textContent.replace(/\s+/g,' '), days:document.getElementById('daysBody').innerText.replace(/\s+/g,' '), foot:document.getElementById('daysFoot').innerText.replace(/\s+/g,' '), bars:document.querySelectorAll('.goalbar').length}; });
  check('A3. Today\'s games says "3 bets" with no "/ 20"; Bets by game day (rows and Last 7 days) has no "/ 20" and no bar', /Today's games: 3 bets/.test(t1.line) && !/\/ ?\d+ bets|\/ 20/.test(t1.line) && !/\/ 20|\/ 140/.test(t1.days+t1.foot) && t1.bars===0, t1);
  await tab(S.p,'v-reports'); const rp=await S.p.evaluate(()=>document.getElementById('rgGrid')?document.getElementById('rgGrid').innerText.replace(/\s+/g,' '):'');
  check('A4. Reports "Limits" lists Per game and Daily max, no "Daily bet goal"', /Per game/.test(rp) && /Daily max/.test(rp) && !/Daily bet goal/i.test(rp), rp.slice(rp.indexOf('Limits'), rp.indexOf('Limits')+160));
  check('A5. no page errors', !S.errs.length, S.errs); await S.ctx.close();

  // ================= B. no #1 math pick =================
  S=await open(b,{w:390,h:844,rows:VOLADO,cfg:{books:'Novig',cfgVer:3.03}});
  let m=await S.p.evaluate(()=>({mode:betMode, banner:!!document.querySelector('#topHint:not([hidden]), .top-hint-go'), txt:document.body.innerText.includes('#1 math pick')}));
  check('B1. Machín (nothing here, the bets are under Volado) shows no "#1 math pick is under ... Show it ›" banner', m.mode==='safe' && !m.banner && !m.txt, m);
  await S.p.evaluate(()=>setMode('volado')); await S.p.waitForTimeout(400);
  m=await S.p.evaluate(()=>({cards:[...document.querySelectorAll('#placeCards .sc-card')].map(c=>(c.querySelector('.sc-who')||c).innerText.split('\n').find(t=>/Star/.test(t))||''), top:document.querySelectorAll('.sc-mathtop').length, txt:/MATH PICK/i.test(document.body.innerText), order:lastRows.map(r=>({n:r.name,k:mathKey(r)})).sort((x,y)=>y.k-x.k).map(x=>x.n)}));
  check('B2. Volado lists its three cards in the same order as before (best edge first), with no "#1 MATH PICK" label anywhere', m.cards.length===3 && m.cards.map(c=>c.replace(/ [A-Z]{2,3}$/,'')).join()===m.order.join() && m.top===0 && !m.txt, m);
  await S.ctx.close();

  // ================= C. Parole fits the phone =================
  for(const W of [360,390,414,1000,1280]){
    S=await open(b,{w:W,h:844,rows:VOLADO}); await S.p.evaluate(paroleFx); await tab(S.p,'v-parole');
    const pr=await S.p.evaluate(()=>{ const bx=document.querySelector('#parList .par-scroll'), t=document.querySelector('#parList .par-tbl'); return {sw:document.documentElement.scrollWidth, iw:innerWidth, tbl:!!t, tW:t?Math.round(t.getBoundingClientRect().width):0, box:bx?{ov:getComputedStyle(bx).overflowX, cw:bx.clientWidth, sw:bx.scrollWidth}:null, srcRight:Math.round(Math.max(0,...[...document.querySelectorAll('#parList *')].map(e=>e.getBoundingClientRect().right)))}; });
    if(W<700) check('C. '+W+' px: Parole does not make the page wider than the screen; the table scrolls inside its own box', pr.tbl && pr.sw<=pr.iw && pr.box && /auto|scroll/.test(pr.box.ov) && pr.box.sw>=pr.box.cw, pr);
    else check('C. '+W+' px: Parole is as before (no sideways page scroll, the table is whole inside its box)', pr.tbl && pr.sw<=pr.iw && pr.box && pr.box.sw<=pr.box.cw+1, pr);
    await S.ctx.close(); }

  // ================= D. phone =================
  for(const W of [390,360]){
    S=await open(b,{w:W,h:844,log:LOG,rows:VOLADO});
    const d=await S.p.evaluate(()=>{ const r=id=>{ const e=document.getElementById(id), x=e.getBoundingClientRect(); return {l:Math.round(x.left), r:Math.round(x.right), h:Math.round(x.height), t:e.textContent.replace(/\s+/g,' ').trim()}; }; return {load:r('loadApi'), refresh:r('refreshApi'), iw:innerWidth}; });
    check('D1. '+W+' px: Load and ⟳ Refresh sit whole inside the bottom bar without scrolling it (right edge within the screen)', d.load.r<=d.iw && d.refresh.r<=d.iw-4 && d.refresh.l>=0, d);
    if(W===390){
      await S.p.evaluate(()=>{ document.querySelector('.tab[data-view="v-board"]').click(); document.getElementById('boardMore').open=true; }); await S.p.waitForTimeout(250);
      const mx=await S.p.evaluate(()=>{ const x=document.querySelector('#boardMoreList .bm-x'); if(!x) return null; const r=x.getBoundingClientRect(), hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2); return {txt:x.textContent.trim(), h:Math.round(r.height), hit:hit===x||x.contains(hit), n:document.querySelectorAll('#boardMoreList button').length}; });
      await S.p.evaluate(()=>{ const x=document.querySelector('#boardMoreList .bm-x'); if(x) x.click(); });
      check('D2. More ▾ shows a visible "✕ Close" (40 px tall, tappable, above the items); tapping it closes the menu; the item buttons are unchanged (Filters, Leagues, Parole, Moneylines)', mx && /✕/.test(mx.txt) && mx.h>=40 && mx.hit && mx.n===4 && !(await S.p.evaluate(()=>document.getElementById('boardMore').open)), mx);
      await tab(S.p,'v-log'); await S.p.evaluate(()=>{ document.querySelector('#subTabs .tab[data-view="v-add"]').click(); }); await S.p.waitForTimeout(400);
      const pa=await S.p.evaluate(()=>{ const i=document.getElementById('abPlaced'), f=i.closest('.field').getBoundingClientRect(), r=i.getBoundingClientRect(); return {w:Math.round(r.width), fieldW:Math.round(f.width), right:Math.round(r.right), iw:innerWidth}; });
      check('D3. 390 px: "Placed at" has the full row (about 300 px, its date and time are not cut), inside the screen', pa.w>=250 && pa.right<=pa.iw, pa);
      const tp=await S.p.evaluate(async()=>{ const o={}; const h=(k,e)=>{ if(!e) return; const r=e.getBoundingClientRect(); if(r.width>0) o[k]=Math.round(r.height); };
        document.querySelector('.tab[data-view="v-board"]').click(); await new Promise(z=>setTimeout(z,300)); h('bookChip',document.querySelector('#bookChips .bchip'));
        document.querySelector('.tab[data-view="v-log"]').click(); await new Promise(z=>setTimeout(z,400)); h('subNavLog',document.querySelector('#subTabs .tab[data-view="v-add"]')); h('subNavPerf',document.querySelector('#subTabs .tab[data-view="v-perf"]')); h('subNavReports',document.querySelector('#subTabs .tab[data-view="v-reports"]')); h('calDay',document.querySelector('#lcCal .lc-d'));
        document.querySelector('.tab[data-view="v-log"]').click(); document.querySelector('#subTabs .tab[data-view="v-perf"]').click(); await new Promise(z=>setTimeout(z,500)); h('calSeg',document.querySelector('.cal-seg button')); h('perfSummary',document.querySelector('#v-perf .panel > details > summary'));
        return o; });
      check('D4. 390 px tap targets are 40 px tall or more: a book chip, the sub-nav (+ Add a bet, Performance, Reports), a calendar day, the Chart / Calendar switch', tp.bookChip>=40 && tp.subNavLog>=40 && tp.subNavPerf>=40 && tp.subNavReports>=40 && tp.calDay>=40 && tp.calSeg>=40, tp);
    }
    check('D. '+W+' px: no sideways page scroll on the Board', await S.p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth), null);
    await S.ctx.close(); }
  S=await open(b,{w:1280,h:900,rows:VOLADO}); const dk=await S.p.evaluate(()=>({api:document.getElementById('refreshApi').textContent.replace(/\s+/g,' ').trim(), x:(x=>x?getComputedStyle(x).display:'none')(document.querySelector('#boardMoreList .bm-x'))}));
  check('D5. 1280 px (computer): Refresh still reads "⟳ Refresh (API)", no extra × in More ▾', /Refresh \(API\)/.test(dk.api) && dk.x==='none', dk); await S.ctx.close();

  // ================= E. words =================
  S=await open(b,{w:1280,h:900,log:LOG,rows:VOLADO,cfg:{books:'Novig,DraftKings',cfgVer:3.03}});
  await tab(S.p,'v-reports'); const fees=await S.p.evaluate(()=>{ const t=document.getElementById('rgGrid').innerText.replace(/\s+/g,' '); const i=t.indexOf('Novig'); return t.slice(i,i+130); });
  check('E1. Reports\' Novig fee line is one clear sentence: no fee before the game; once it has started 6% × (1 − price) of what you put up (feeRate: cfg.novig + 0.06 × (1 − price) when live)', /Novig\s*No fee before the game\s*once the game has started: 6% × \(1 − price\) of what you put up/.test(fees) && !/only that extra|0% extra/.test(fees), fees);
  const why=await S.p.evaluate(()=>{ const r=fl=>({flags:fl.map(t=>['warn',t]),pass:true,stake:0}); return {daily:pkNoStakeWhy(r(['daily max reached — $100 for everything on Sun 11/15\'s games'])), game:pkNoStakeWhy(r(['game cap reached ($20.00 on this game)'])), player:pkNoStakeWhy(r(['PLAYER EXPOSURE · already hold X: no additional stake'])), mini:pkNoStakeWhy(r(['stake under the $1.00 minimum — skip'])), other:pkNoStakeWhy(r([]))}; });
  check('E2. Parlay "no stake" names the cap: daily max, per-game cap, one per player, the minimum (the old line listed all three)', /daily max/.test(why.daily) && !/per game/.test(why.daily) && /per-game cap/.test(why.game) && !/daily/.test(why.game) && /one per player/.test(why.player) && /minimum/.test(why.mini) && /cap or limit/.test(why.other), why);
  const cal=await S.p.evaluate(()=>{ renderCalibration(); return document.getElementById('calEmpty').textContent; });
  check('E3. Reports "Is the model honest?" with 2 graded bets that carry no model cover: says "2 of your bets are graded, but none has the model\'s cover % saved" and points to the study (no "Nothing graded yet")', /2 of your bets are graded/.test(cal) && /cover %/.test(cal) && !/^Nothing graded yet/.test(cal), cal);
  const ring=await S.p.evaluate(()=>{ const z=x=>ringOf({actProb:x,fairProb:x,offeredProb:0.6,fee:0,actNet:0.08,net:0.08,flags:[]},cfgRead()).checks.find(c=>c.k==='zone').t; return {boring:z(0.8), low:z(0.4), mid:z(0.6)}; });
  check('E4. a Boring card (80%) says it is Boring, 75% or better as in Settings, not "not 50 to 75%"; under 50% says below; inside says "in the zone"', /Boring \(75% or better/.test(ring.boring) && !/not 50 to 75%/.test(ring.boring+ring.low) && /below the ◎ zone/.test(ring.low) && /in the zone/.test(ring.mid), ring);
  const pk=await S.p.evaluate(()=>{ const host=document.createElement('div'); document.body.appendChild(host); const legs=p=>[{name:'A',p,book:'PrizePicks',own:true,sport:'NBA'},{name:'B',p,book:'PrizePicks',own:true,sport:'NBA'}];
    host.innerHTML=pkCard('Test',legs(0.78),pkEntry(legs(0.78),[3],cfgRead()),'t',false); const c=host.querySelector('.pk-calm'), e=host.querySelector('.pk-ev'), cs=e&&getComputedStyle(e); const out={calm:c&&c.textContent, ev:e&&e.textContent, size:cs&&parseFloat(cs.fontSize), weight:cs&&cs.fontWeight, color:cs&&cs.color, soft:getComputedStyle(document.body).getPropertyValue('--soft')}; host.remove(); return out; });
  check('E5. the Parlay card leads with calm words "Needs 57.7% a pick to break even · these average 78.0% (model)"; the expected return is a small plain line, not 24 px green', /^Needs [\d.]+% a pick to break even · these average 78\.0% \(model\)$/.test(pk.calm||'') && /expected return/.test(pk.ev||'') && pk.size<=14 && !/^rgb\(\s*(2[0-9]|3[0-9]|4[0-9]),/.test(pk.color) && pk.weight<=500, pk);
  await S.ctx.close();
  S=await open(b,{w:1280,h:900,log:null,rows:null,cfg:{books:'Novig,DraftKings',cfgVer:3.03}});
  await S.p.evaluate(()=>{ document.querySelector('.tab[data-view="v-board"]').click(); const e=document.getElementById('emptyPaste'); if(e) e.click(); }); await S.p.waitForTimeout(300);
  await S.p.evaluate(()=>document.getElementById('demo').click()); await S.p.waitForTimeout(700);
  const sm=await S.p.evaluate(()=>{ const d=document.getElementById('diag').innerText.replace(/\s+/g,' '), n=+((d.match(/(\d+) pass every screen/)||[])[1]), shown=lastRows.filter(r=>isPasteRow(r) && r.pass && r.stake>0 && !r.prior).length, cards=document.querySelectorAll('#placeCards .sc-card').length, em=(document.getElementById('emptyMsg')||{}).innerText||'', noStake=lastRows.filter(r=>isPasteRow(r) && r.pass && !(r.stake>0)).length;
    return {d:d.slice(0,420), n, shown, cards, em:em.slice(0,200), noStake}; });
  check('E6. the Paste Sample\'s "N pass every screen" equals the bets listed, and the list never says "Every bet failed a screen" while some pass (they pass with no market price, so no stake: said plainly)', sm.n===sm.cards && !(/Every bet failed a screen/.test(sm.em) && sm.noStake>0) && (sm.noStake===0 || (/no market price/.test(sm.d) && /no market price/.test(sm.em))), sm);
  await S.ctx.close();
  S=await open(b,{w:1280,h:900,log:LOG,rows:VOLADO});
  const fe=await S.p.evaluate(async()=>{ document.querySelector('.tab[data-view="v-log"]').click(); await new Promise(z=>setTimeout(z,300)); const p=document.getElementById('parlayPanel'); p.open=true; const pl=document.getElementById('plStake'); pl.value='5'; const f=document.getElementById('plFree'); f.checked=true; f.dispatchEvent(new Event('change',{bubbles:true})); pl.dispatchEvent(new Event('input',{bubbles:true})); document.getElementById('plAll').value='50'; document.getElementById('plAll').dispatchEvent(new Event('input',{bubbles:true}));
    await new Promise(z=>setTimeout(z,200)); return {note:document.getElementById('plNote').textContent, tipP:document.querySelector('label.pl-free').title, tipA:document.querySelector('label.ab-par-free').title}; });
  await S.p.evaluate(()=>{ document.querySelector('#subTabs .tab[data-view="v-add"]').click(); }); await S.p.waitForTimeout(300);
  await S.p.selectOption('#abType','parlay'); await S.p.fill('#abParStake','5'); await S.p.fill('#abParAll','50'); await S.p.setChecked('#abParFree',true); await S.p.waitForTimeout(200);
  const fa=await S.p.$eval('#abParNote',e=>e.textContent);
  check('E7. a free entry says it is typed at its face value (not $0), in both parlay forms (the Bet log panel and + Add a bet), note and tooltip', /face value/.test(fe.note) && /face value/.test(fa) && /face value/.test(fe.tipP) && /face value/.test(fe.tipA), {pl:fe.note, ab:fa});
  await S.ctx.close();
  S=await open(b,{w:1280,h:900,rows:FAV,cfg:{books:'DraftKings',bank:'1000',cfgVer:3.03}});
  const wn=await S.p.evaluate(()=>{ const r=lastRows[0], t=[...document.querySelectorAll('.sc-money')].map(e=>e.innerText.replace(/\s+/g,' ')).join(' | '); const m=t.match(/wins \$([\d.]+)/); return {stake:r&&r.stake, txt:t, wins:m&&m[1], exact:r?(r.stake*100/230).toFixed(2):null}; });
  check('E8. a $10 bet at -230 says "wins $4.35" (10 × 100 / 230 = 4.3478, to the cent), not $4.34', wn.stake===10 && wn.wins==='4.35' && wn.wins===wn.exact, wn);
  await S.ctx.close();

  // ================= light and dark, five widths: no page errors, no sideways scroll on each main page =================
  for(const dark of [false,true]) for(const W of [360,390,1000,1280,1960]){
    S=await open(b,{w:W,h:W<700?844:900,log:LOG,rows:VOLADO,dark}); const wide=[];
    for(const v of ['v-board','v-live','v-parlay','v-log','v-settings','v-parole','v-add','v-perf','v-reports']){ await tab(S.p,v); const o=await S.p.evaluate(()=>document.documentElement.scrollWidth-innerWidth); if(o>1) wide.push(v+'+'+o); }
    check((dark?'dark ':'light ')+W+' px: every main page fits the width, no page errors', !wide.length && !S.errs.length, {wide, errs:S.errs}); await S.ctx.close(); }
  check('no page errors anywhere in this file', !ALLERR.length, ALLERR.slice(0,5));
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
