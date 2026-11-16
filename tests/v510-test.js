// node tests/v510-test.js — v5.10 (owner, Sun 11/15 ~12:40 AM CT: "id say 11/11. So, do your other recommendations to tell the other Brujo and such apart.
// BUILD IT ALL"; scope v5.10 P1–P4, display only). P1: Settings › My plan, "La Contadora’s chance at least [50]% · since [2026-11-11]", saved like the
// other settings (mbev.cfg). P2: a calm "Outside your plan · you bet 50% and up since 11/11" line on board cards and table rows whose La Contadora chance
// (actProb, the chance the tabs use) is under the plan, "· outside your plan" on the 🍀 Suertudo and 🔮 Brujo tabs (any chance tab whose whole range is
// under it) and on their Place these heading, and the same line in the bet form (I bet this, + Add a bet, Bet log edit). Stakes and BET / SKIP identical
// with the plan on, off and at 99%. P3: Performance › Your 1,000-bet blocks (from 11/11): the Scorecard’s own bets placed since the plan date, in the
// order placed, 1,000 a block; each block judged by the Scorecard’s own functions (scoreSet, scBoots, scVerdict) on that block alone; progress, pace,
// fill date, the head-start note. P4: Reports › By › Band, 2.5% steps (exploratory). The Scorecard and Said vs won are pinned to the page before v5.10.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,700)); };
const NOW=Date.parse('2026-11-15T18:00:00Z'), H=3600e3, DAY='2026-11-15', TIP=Date.parse('2026-11-16T01:00:00Z'), iso=ms=>new Date(ms).toISOString();   // Sun 11/15, 12:00 PM CT
const fnv=s=>{ let h=0x811c9dc5; s=String(s); for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,0x01000193); } return h>>>0; };   // FNV-1a, written here on its own
const LINE='Outside your plan · you bet 50% and up since 11/11';
// ---- board rows: model = market = the chance, so La Contadora’s chance is exactly it (tabs-v476’s fixture); price 4 points under it at Novig (no fee)
const T=(ha,abbr)=>({ha,id:abbr,abbr,name:abbr+' Team',loc:abbr,nick:'Team',logo:'',rec:'',color:'333333',alt:'ffffff'});
const am=p=>p>=0.5?String(Math.round(-100*p/(1-p))):'+'+Math.round(100*(1-p)/p);
const row=(id,player,c)=>({name:player,team:'T'+id,game:'T'+id+' @ H'+id,matchup:'T'+id+' @ H'+id,side:'O',sport:'NHL',market:'1.5 Shots On Goal',kind:'prop',book:'Novig',offeredRaw:am(c-0.04),offeredProb:+(c-0.04).toFixed(4),fairProb:c,fairRaw:'',mktProb:c,stars:3,evModel:'market',
  gameInfo:{state:'pre',startISO:iso(TIP),eventId:'7'+id,timeCT:'',detail:'',teams:[T('away','T'+id),T('home','H'+id)]},src:'api:NHL:props',apiKey:id,loadedAt:iso(NOW-60e3)});
const ROWS=[row('c','Charlie Strong',0.62), row('e','Echo Slight',0.55), row('g','Golf Coin',0.47), row('h','Hotel Unlikely',0.40)];
// ---- three open bets in the Bet log for the edit form: 47% placed 11/12 (line), 40% placed 11/9 (before the plan: no line), 55% placed 11/13 (no line)
const lb=(id,act,placed,o)=>Object.assign({id, key:id, kind:'prop', sport:'NBA', book:'Novig', name:'Log '+id, market:'1.5 Threes', side:'O', odds:'+100', stake:2, game:'L'+id+' @ M'+id, start:iso(Date.parse(placed)+5*H), date:iso(Date.parse(placed)+5*H).slice(0,10), placedAt:placed, snap:{at:placed, act, actNet:0.04, model:act, market:act}, fair:'+100', manual:true}, o||{});
const LOGA=[lb('p47',0.47,'2026-11-12T20:00:00Z'), lb('p40old',0.40,'2026-11-09T20:00:00Z'), lb('p55',0.55,'2026-11-13T20:00:00Z')];
// ---- 2,050 Scorecard bets since 11/11 for the blocks (positions in the order placed; the log holds them in another order)
// position 0 placed 11/11 12:30 AM CT (the plan’s first day), 1–31 every 2.5 h from 11/11 9 AM CT, games 2 h later (11/11 to 11/14): 23 won at $2.00 and 9 lost
// at $1.48 = +$32.68, the head start; 32–2,049 placed on 11/15 from 12:05 AM CT, games 1 minute after (game day 11/15). Block 1 (positions 0–999): 60% won at
// +100, every close −110 (CLV +4.76%); block 2 (1,000–1,999): half won, closes −110 / +110 by pairs (median CLV 0); block 3 (2,000–2,049): 30 settled, 20 open.
const LOSE32=new Set([3,7,11,15,19,23,27,30,31]);
function blk(pos){ let pl; if(pos===0) pl=Date.parse('2026-11-11T06:30:00Z'); else if(pos<32) pl=Date.parse('2026-11-11T15:00:00Z')+(pos-1)*2.5*H; else pl=Date.parse('2026-11-15T06:05:00Z')+(pos-32)*19e3;
  const g=Math.floor(pos/2), st=pl+(pos<32?2*H:60e3), b={id:'bk'+pos, key:'bk'+pos, kind:'prop', sport:'NBA', book:'Novig', name:'Block '+pos, market:'1.5 Threes', side:'O', odds:'+100', stake:1, game:'G'+g+' @ K'+g, start:iso(st), date:iso(st).slice(0,10), placedAt:iso(pl), snap:{at:iso(pl+30e3), act:0.55, actNet:0.04}, closing:'-110'};
  if(pos<32){ const lost=LOSE32.has(pos); b.stake=lost?1.48:2; b.result=lost?'loss':'win'; }
  else if(pos<1000) b.result=(pos%5)<3?'win':'loss';
  else if(pos<2000){ b.result=pos%2?'loss':'win'; b.closing=(pos>>1)%2?'+110':'-110'; }
  else if(pos<2030) b.result=pos%3?'loss':'win';
  if(b.result) b.gradedBy='manual';
  if(pos===40){ delete b.placedAt; }   // no book time: snap.at
  if(pos===41){ delete b.placedAt; b.snap={act:0.55}; b.date='2026-11-15'; b.start=undefined; }   // nothing but its date: 11/15 12:00 AM CT, first of that day
  return b; }
function logB(){ const P=[]; for(let i=0;i<2050;i++) P.push(blk(i));
  P[501].placedAt=P[500].placedAt;   // a tie: same time; the one earlier in the log goes first
  const L=[]; for(let i=0;i<2050;i++) L.push(P[(i*737)%2050]);   // 737 and 2050 share no factor: every bet once, in a scrambled order
  // never in a block: placed 11/10 11:59 PM CT, a free bet, a parlay, a research bet, a 🔮 extra, a $0 stake
  const x=(id,o)=>Object.assign({id, key:id, kind:'prop', sport:'NBA', book:'Novig', name:'X '+id, market:'1.5 Threes', side:'O', odds:'+100', stake:1, game:'X'+id+' @ Y'+id, start:'2026-11-12T02:00:00Z', date:'2026-11-11', placedAt:'2026-11-12T00:00:00Z', snap:{at:'2026-11-12T00:00:00Z', act:0.55}, result:'win', gradedBy:'manual'}, o||{});
  L.push(x('pre', {placedAt:'2026-11-11T05:59:00Z', snap:{at:'2026-11-11T05:59:00Z', act:0.55}}), x('free', {free:true}), x('par', {kind:'parlay', sport:'PARLAY', market:'2-pick parlay', parlay:{legs:2}, odds:'+260'}), x('res', {research:true}), x('tier', {tier:'hail', odds:'+400'}), x('zero', {stake:0}));
  return {L, P}; }
// ---- Reports › Band, 2.5% steps: La Contadora’s chance at the edges of the steps
function logC(){ const st=Date.parse('2026-11-14T01:00:00Z'), pre=iso(st-3*H), post=iso(st+30*60e3);
  const c=(id,act,o)=>Object.assign({id, key:id, kind:'prop', sport:'NBA', book:'Novig', name:'C '+id, market:'1.5 Threes', side:'O', odds:'+100', stake:1, game:'C'+id+' @ D'+id, start:iso(st), date:'2026-11-13', result:'win', gradedBy:'manual', snap:{at:pre, act, actNet:0.04}}, o||{});
  return [c('a50',0.5), c('a5249',0.5249), c('a525',0.525), c('a4749',0.4749), c('a475',0.475,{result:'loss'}), c('a999',0.999), c('a001',0.01,{result:'loss'}),
    c('post',0.55,{snap:{at:post, act:0.55, actNet:0.04}}), c('par',null,{kind:'parlay', sport:'PARLAY', market:'2-pick parlay', parlay:{legs:2}, odds:'+260', snap:{at:pre}}), c('none',null,{snap:{at:pre}}), c('open',0.51,{result:undefined, gradedBy:undefined, start:iso(NOW+5*H), date:DAY})]; }
async function open(B, o){ o=o||{}; const ctx=await B.newContext({timezoneId:'America/Chicago', viewport:{width:o.width||1280, height:1000}}); await ctx.clock.install({time:new Date(o.now||NOW)});   // v5.10 (fixer): o.now, a later clock (section D)
  await ctx.addInitScript(([L,R,cfg])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.log',JSON.stringify(L||[])); localStorage.setItem('mbev.cfg',JSON.stringify(cfg));
    localStorage.setItem('mbev.cards','1'); if(R) localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:'2026-11-15',rows:R})); }catch(e){} }, [o.log||[], o.rows||null, Object.assign({books:'Novig',bank:'500',cfgVer:3.03}, o.cfg||{})]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.addInitScript(()=>{ window._barOpen=true; }); await p.goto('http://app.test/'); await p.waitForTimeout(1300); return {ctx, p, errs}; }
const tx=s=>String(s||'').replace(/\s+/g,' ').trim();
const TABS=()=>[...document.querySelectorAll('#modeBar button')].map(x=>x.textContent.replace(/\s+/g,' ').trim());
const CARDS=()=>[...document.querySelectorAll('#placeCards .sc-card')].map(c=>({n:(c.querySelector('.pc-nm')||{}).textContent.replace(/\s+[A-Z]{2}$/,''), plan:(c.querySelector('.plan-out')||{}).textContent||null, inTags:!!c.querySelector('.sc-tags > .plan-out')}));
const HEAD=()=>((document.querySelector('#placeCards .pc-head')||{}).firstChild?[...document.querySelector('#placeCards .pc-head').childNodes].filter(n=>!(n.classList&&n.classList.contains('sc-sub'))).map(n=>n.textContent).join(''):'').replace(/\s+/g,' ').trim();
const DEC=()=>JSON.stringify(lastRows.map(r=>({k:r.apiKey, pass:!!r.pass, stake:r.stake, xs:r.xStake||0, tier:r.tier||'', fam:modeFamOf(r), dec:decisionHtml(r,cfgRead()), cap:r.capBy||''})).sort((a,b)=>a.k<b.k?-1:1));
const setPlan=async(p, min, since)=>{ await p.evaluate(([min,since])=>{ const a=document.getElementById('planMin'), b=document.getElementById('planSince'); if(min!=null){ a.value=String(min); a.dispatchEvent(new Event('input',{bubbles:true})); } if(since!=null){ b.value=since; b.dispatchEvent(new Event('change',{bubbles:true})); } }, [min, since]); await p.waitForTimeout(350); };
// the 12 px floor and sideways overflow for the new parts (as v504a / v507 check whole pages)
const NEWLAYOUT=sel=>{ const out={side:document.documentElement.scrollWidth-innerWidth, small:[], outside:[], n:0};
  const vis=e=>{ const r=e.getBoundingClientRect(), cs=getComputedStyle(e); return r.width>0 && r.height>0 && cs.visibility!=='hidden' && cs.display!=='none'; };
  document.querySelectorAll(sel).forEach(root=>{ if(!vis(root)) return; out.n++; const rr=root.getBoundingClientRect(); if(rr.right>innerWidth+1 || rr.left<-1) out.outside.push(root.className+' '+Math.round(rr.left)+'–'+Math.round(rr.right));
    [root, ...root.querySelectorAll('*')].forEach(el=>{ if(!vis(el)) return; if([...el.childNodes].some(n=>n.nodeType===3 && n.textContent.trim()) && parseFloat(getComputedStyle(el).fontSize)<12) out.small.push((el.className||el.tagName)+' '+getComputedStyle(el).fontSize);
      const r=el.getBoundingClientRect(); if(r.width && (r.right>innerWidth+1)) out.outside.push((el.className||el.tagName)+' right '+Math.round(r.right)); }); });
  return out; };
(async()=>{ const B=await chromium.launch();
  // ================= A: Settings › My plan, the board, the tabs, the bet form =================
  { const {ctx, p, errs}=await open(B, {rows:ROWS, log:LOGA});
    const A1=await p.evaluate(()=>({min:document.getElementById('planMin').value, since:document.getElementById('planSince').value, cfg:planCfg(), txt:document.getElementById('planPanel').textContent.replace(/\s+/g,' ').trim(),
      lbl:[...document.querySelectorAll('#planPanel label')].map(l=>l.textContent+'→'+l.htmlFor), inSettings:!!document.querySelector('#v-settings #planPanel'), at:Date.parse('2026-11-15T00:40:00-06:00')===PLAN_SET_AT}));
    check('P1 · Settings › My plan: "La Contadora’s chance at least [50]% · since [2026-11-11]" (defaults), its two labels tied to their fields, the plain line "A reminder only: cards below it say ‘Outside your plan’. Stakes and BET / SKIP do not change."; PLAN_SET_AT = 11/15 12:40 AM CT',
      A1.min==='50' && A1.since==='2026-11-11' && A1.cfg.pc===50 && A1.cfg.since==='2026-11-11' && A1.cfg.on===true && A1.inSettings && A1.at && A1.txt==='My plan a reminder only La Contadora’s chance at least%·since A reminder only: cards below it say ‘Outside your plan’. Stakes and BET / SKIP do not change.' && A1.lbl.join('|')==='La Contadora’s chance at least→planMin|since→planSince', A1);
    const t0=await p.evaluate(TABS);
    check('P2 · the tabs: 🍀 Suertudo and 🔮 Brujo say "· outside your plan" after their count; Boring, Machín, Volado, Old and AWOL do not', JSON.stringify(t0)===JSON.stringify(['😴 Boring 0','💪 Machín 1','🪙 Volado 1','🍀 Suertudo 1 · outside your plan','🔮 Brujo 1 · outside your plan','⏱ Old 0','👻 AWOL 0']), t0);
    const V={}; for(const m of ['safe','volado','lucky','clair']){ await p.evaluate(m=>setMode(m), m); await p.waitForTimeout(300); V[m]=await p.evaluate(([c,h])=>({cards:(eval(c))(), head:(eval(h))()}), ['('+CARDS.toString()+')', '('+HEAD.toString()+')']); }
    check('P2 · the 40% card (🔮 Brujo) and the 47% card (🍀 Suertudo) show "'+LINE+'" under her chance (in the card’s tags, after the band chip); the 55% (🪙 Volado) and 62% (💪 Machín) cards do not',
      V.clair.cards.length===1 && V.clair.cards[0].n==='Hotel Unlikely' && V.clair.cards[0].plan===LINE && V.clair.cards[0].inTags && V.lucky.cards.length===1 && V.lucky.cards[0].n==='Golf Coin' && V.lucky.cards[0].plan===LINE
      && V.volado.cards.length===1 && V.volado.cards[0].n==='Echo Slight' && V.volado.cards[0].plan===null && V.safe.cards.length===1 && V.safe.cards[0].n==='Charlie Strong' && V.safe.cards[0].plan===null, V);
    check('P2 · the Place these heading: "· outside your plan" in 🍀 Suertudo and 🔮 Brujo only', V.clair.head==='🦑 The Sentinels · Place these · 🔮 edge · long shots · 1 · outside your plan' && V.lucky.head==='🦑 The Sentinels · Place these · 1 · outside your plan' && V.volado.head==='🦑 The Sentinels · Place these · 1' && V.safe.head==='🦑 The Sentinels · Place these · 1', [V.clair.head, V.lucky.head, V.volado.head, V.safe.head]);
    // v5.10 (fixer): the #1 math pick banner (v4.97) on 💪 Machín names the 40% 🔮 Brujo card: My plan’s words, muted; the same #1 with the plan off
    const HINT=async()=>{ await p.evaluate(()=>setMode('safe')); await p.waitForTimeout(300); return p.evaluate(()=>{ const h=document.getElementById('topHint'), w=h&&h.querySelector('.th-plan'); return h?{t:h.textContent.replace(/\s+/g,' ').trim(), w:w?getComputedStyle(w).fontWeight+'|'+(getComputedStyle(w).color===getComputedStyle(document.querySelector('#planPanel .hint')).color):null}:null; }); };
    const HB50=await HINT(); await setPlan(p, 0); const HB0=await HINT(); await setPlan(p, 50);
    check('P2 · v5.14 (owner 11/15: "REmove math pick"): the #1 math pick banner is gone on 💪 Machín, with the plan at 50 and off (the plan words are not shown anywhere on the board)', HB50===null && HB0===null, {HB50, HB0});
    const look=async()=>p.evaluate(([d])=>({dec:(eval(d))(), n:document.querySelectorAll('.plan-out').length, tabs:[...document.querySelectorAll('#modeBar .mode-plan')].map(x=>x.parentNode.dataset.mode)}), ['('+DEC.toString()+')']);
    await p.evaluate(()=>setMode('clair')); await p.waitForTimeout(300);
    const D50=await look(); await setPlan(p, 0); const D0=await look(); await setPlan(p, 99); const D99=await look(); const L99=await p.evaluate(()=>(document.querySelector('#placeCards .plan-out')||{}).textContent);
    await setPlan(p, 50, '2026-11-16'); const Dfut=await look(); await setPlan(p, 50, '2026-11-11'); const Dback=await look();
    check('P2 · display only: every row’s approval, stake, extra stake, tab and decision are identical with the plan at 50%, off (0), at 99% and dated in the future (off until then); 0 and a future date show no line and no tab label; 99% labels Machín, Volado, Suertudo and Brujo (not Boring) and the card says "99% and up"',
      D50.dec===D0.dec && D50.dec===D99.dec && D50.dec===Dfut.dec && D50.dec===Dback.dec && D0.n===0 && D0.tabs.length===0 && Dfut.n===0 && Dfut.tabs.length===0 && D99.tabs.join(',')==='safe,volado,lucky,clair' && L99==='Outside your plan · you bet 99% and up since 11/11' && D50.n===1 && D50.tabs.join(',')==='lucky,clair' && Dback.n===1,
      {n:[D50.n,D0.n,D99.n,Dfut.n,Dback.n], tabs:[D50.tabs,D99.tabs], L99, same:[D50.dec===D0.dec, D50.dec===D99.dec, D50.dec===Dfut.dec]});
    await setPlan(p, 60); await p.evaluate(()=>setMode('volado')); await p.waitForTimeout(300);
    const A60=await p.evaluate(([c])=>({tabs:[...document.querySelectorAll('#modeBar button')].map(x=>x.textContent.replace(/\s+/g,' ').trim()), cards:(eval(c))(), saved:JSON.parse(localStorage.getItem('mbev.cfg')||'{}')}), ['('+CARDS.toString()+')']);
    check('P1/P2 · the numbers come from the setting: at 60% the 55% card says "Outside your plan · you bet 60% and up since 11/11", 🪙 Volado (50–60%) is outside too, 💪 Machín is not; saved in mbev.cfg like the other settings (planMin "60", planSince "2026-11-11")',
      A60.cards.length===1 && A60.cards[0].plan==='Outside your plan · you bet 60% and up since 11/11' && A60.tabs[2]==='🪙 Volado 1 · outside your plan' && A60.tabs[1]==='💪 Machín 1' && A60.saved.planMin==='60' && A60.saved.planSince==='2026-11-11' && A60.saved.bank==='500', A60);
    await setPlan(p, 55, '2026-11-12'); await p.reload(); await p.waitForTimeout(1300);
    await p.evaluate(()=>setMode('clair')); await p.waitForTimeout(300);
    const A5=await p.evaluate(([c])=>({min:document.getElementById('planMin').value, since:document.getElementById('planSince').value, cards:(eval(c))()}), ['('+CARDS.toString()+')']);
    check('P1 · after a reload My plan comes back from mbev.cfg (55%, 2026-11-12) and the line follows it: "Outside your plan · you bet 55% and up since 11/12"', A5.min==='55' && A5.since==='2026-11-12' && A5.cards[0].plan==='Outside your plan · you bet 55% and up since 11/12', A5);
    await setPlan(p, 50, '2026-11-11');
    // the table: the Place these label and the row line (not on a greyed-out row)
    await p.evaluate(()=>{ localStorage.setItem('mbev.cards','0'); const cb=document.getElementById('cardsOn'); cb.checked=false; cb.dispatchEvent(new Event('change')); }); await p.waitForTimeout(400);
    const TB={}; for(const m of ['clair','volado']){ await p.evaluate(m=>setMode(m), m); await p.waitForTimeout(300); TB[m]=await p.evaluate(()=>({g:[...document.querySelectorAll('#tbody tr.group-row:not(.band-row)')].map(x=>x.textContent.replace(/\s+/g,' ').trim()), rows:[...document.querySelectorAll('#tbody .plan-out')].map(x=>x.closest('tr').querySelector('.pick').textContent.trim()+': '+x.textContent+' | '+x.title)})); }   // v5.10 (fixer): + the tooltip
    check('P2 · the table: 🔮 Brujo’s Place these label ends "✅ La Contadora: YES · outside your plan" and the 40% row says "Outside your plan" under its game time (the narrow column’s short form: 2 lines, not 5), the whole line "'+LINE+'" on hover; 🪙 Volado’s label and row do not',   // v5.10 (fixer)
      TB.clair.g[0]==='Place these · 🔮 edge · long shots · 1 · ✅ La Contadora: YES · outside your plan' && TB.clair.rows.length===1 && TB.clair.rows[0]==='Hotel Unlikely: Outside your plan | '+LINE+'. A reminder from Settings › My plan. Stakes and BET / SKIP do not change.' && TB.volado.g[0]==='Place these · 1 · ✅ La Contadora: YES' && TB.volado.rows.length===0, TB);
    await p.evaluate(()=>{ localStorage.setItem('mbev.cards','1'); const cb=document.getElementById('cardsOn'); cb.checked=true; cb.dispatchEvent(new Event('change')); }); await p.waitForTimeout(400);
    // the bet form: I bet this
    const form=async(m)=>{ await p.evaluate(m=>{ document.querySelectorAll('.editor').forEach(e=>e.remove()); setMode(m); }, m); await p.waitForTimeout(300);
      await p.evaluate(()=>{ const b=document.querySelector('#placeCards .sc-card .bet-btn'); if(b) b.click(); }); await p.waitForTimeout(300);
      return p.evaluate(()=>{ const e=document.querySelector('#placeCards .editor'); return e?{plan:(e.querySelector('.eb-plan')||{}).textContent, check:(e.querySelector('.eb-check')||{}).textContent, stake:(e.querySelector('.eb-stake')||{}).value, cost:(e.querySelector('.eb-cost')||{}).value, rec:(e.querySelector('.eb-rec')||{}).textContent, order:[...e.querySelector('.editor-row').children].map(c=>c.className).filter(c=>/eb-(check|plan|rec)/.test(c)).join(',')}:null; }); };
    const F40=await form('clair'), F55=await form('volado'); await setPlan(p, 0); const F40off=await form('clair'); await setPlan(p, 50);
    check('P2 · I bet this: on the 40% card the form says "'+LINE+'" right after the chance and decision line (eb-check, eb-plan, then the recommended stake); on the 55% card nothing; with the plan off the same form has no line and the same stake, cost, check and recommendation (no block, no extra click)',
      F40 && F40.plan===LINE && F40.order==='eb-check,eb-plan,meta eb-rec' && F55 && F55.plan==='' && F40off && F40off.plan==='' && F40off.stake===F40.stake && F40off.cost===F40.cost && F40off.check===F40.check && F40off.rec===F40.rec, {F40, F55, F40off});
    // the bet form: Bet log › edit (a saved bet: its saved chance, when placed since the plan date)
    const ed=await p.evaluate(()=>{ document.querySelector('.tab[data-view="v-log"]').click(); const out={}; for(const k of ['p47','p40old','p55']){ document.querySelectorAll('.editor').forEach(e=>e.remove()); const i=logged.findIndex(b=>b.key===k), btn=document.querySelector('#logBody button.kill.edit[data-i="'+i+'"]');
      if(btn) btn.click(); else { const tr=document.createElement('tr'); document.getElementById('logBody').appendChild(tr); openBetEditor(tr, rowFromBet(logged[i]), {edit:logged[i], cols:11}); }
      const e=document.querySelector('#logBody .editor'); out[k]={btn:!!btn, plan:e?(e.querySelector('.eb-plan')||{}).textContent:null}; } document.querySelectorAll('.editor').forEach(e=>e.remove()); return out; });
    check('P2 · Bet log › edit: the 47% bet placed 11/12 shows the line; the 40% bet placed 11/9 (before the plan) and the 55% bet do not', ed.p47.plan===LINE && ed.p40old.plan==='' && ed.p55.plan==='', ed);
    // the bet form: + Add a bet (its verdict; the form’s own line is not doubled there)
    const ab=async(cov)=>{ await p.evaluate(async(cov)=>{ document.querySelector('.tab[data-view="v-add"]').click(); const d=document.getElementById('addBetPanel'); if(!d.open){ d.open=true; d.dispatchEvent(new Event('toggle')); }
        for(let i=0;i<30 && !document.querySelector('#abHost .editor');i++) await new Promise(r=>setTimeout(r,100));
        const m=document.getElementById('abMore'); if(m) m.open=true; const c=document.getElementById('abCover'); c.value=String(cov); c.dispatchEvent(new Event('input',{bubbles:true}));
        const o=document.querySelector('#abHost .eb-odds'); o.value='+180'; o.dispatchEvent(new Event('input',{bubbles:true})); }, cov); await p.waitForTimeout(400);
      return p.evaluate(()=>{ const v=document.getElementById('abVerdict'); return {plan:(v.querySelector('.plan-out')||{}).textContent||null, head:(v.querySelector('.ab-h')||{}).textContent, formPlan:getComputedStyle(document.querySelector('#abHost .eb-plan')).display, formTxt:document.querySelector('#abHost .eb-plan').textContent}; }); };
    const B40=await ab(40), B55=await ab(55); await setPlan(p, 0); const B40off=await ab(40); await setPlan(p, 50);
    check('P2 · + Add a bet: a 40% cover gives "'+LINE+'" under the verdict, a 55% cover does not; the verdict (BET and the amount) is the same with the plan off; the form’s own line stays empty there (said once)',
      B40.plan===LINE && B55.plan===null && B40off.plan===null && B40off.head===B40.head && /BET \$/.test(B40.head) && B40.formTxt==='' && B40.formPlan==='none', {B40, B55, B40off});
    // v5.10 (fixer): no price typed, the exchanges’ other side best (🔎 What should I bet?, set by hand): the line follows the side the verdict bets
    const abx=async(cov, under)=>p.evaluate(async([cov, under])=>{ document.querySelector('.tab[data-view="v-add"]').click(); const d=document.getElementById('addBetPanel'); if(!d.open){ d.open=true; d.dispatchEvent(new Event('toggle')); }
        for(let i=0;i<30 && !document.querySelector('#abHost .editor');i++) await new Promise(r=>setTimeout(r,100));
        const m=document.getElementById('abMore'); if(m) m.open=true; const c=document.getElementById('abCover'); c.value=String(cov); c.dispatchEvent(new Event('input',{bubbles:true}));
        const o=document.querySelector('#abHost .eb-odds'); o.value=''; o.dispatchEvent(new Event('input',{bubbles:true})); await new Promise(r=>setTimeout(r,200));
        abX={key:abKey(abRowFields()), at:Date.now(), me:[], op:[{src:'novig', book:'Novig', q:{ok:true, price:under, bid:0}}], mid:null, from:'', notes:[]}; abUpdate94();
        const v=document.getElementById('abVerdict'), first=[...v.children].find(x=>x.tagName==='DIV' && !x.classList.contains('ab-h'));
        return {head:(v.querySelector('.ab-h')||{}).textContent, plan:(v.querySelector('.plan-out')||{}).textContent||null, first:first?first.textContent:null, me:abSideTxt(abRowFields(),false), op:abSideTxt(abRowFields(),true)}; }, [cov, under]);
    const X40=await abx(40, 0.52), X60=await abx(60, 0.30); await setPlan(p, 0); const X60off=await abx(60, 0.30); await setPlan(p, 50);
    check('P2 · + Add a bet with no price typed: a 40% Over with the Under at Novig 52% bets the Under (60%): no line; a 60% Over with the Under at 30% bets the Under (40%): the line; the verdict is the same with the plan off',
      /^🟢 BET \$[\d.]+ — \+15\.4% net$/.test(X40.head) && X40.plan===null && X40.first.startsWith(X40.op+' at Novig') && /^🟢 BET \$/.test(X60.head) && X60.plan===LINE && X60.first.startsWith(X60.op+' at Novig') && X60off.plan===null && X60off.head===X60.head && X60off.first===X60.first, {X40, X60, X60off});
    // layout: Settings, the board cards, the form, at four widths
    for(const W of [390,1000,1280,1960]){ await p.setViewportSize({width:W, height:900}); await p.evaluate(()=>{ document.querySelector('.tab[data-view="v-settings"]').click(); }); await p.waitForTimeout(250);
      const S=await p.evaluate(([f])=>(eval(f))('#planPanel'), ['('+NEWLAYOUT.toString()+')']);
      await p.evaluate(()=>{ document.querySelector('.tab[data-view="v-board"]').click(); setMode('clair'); }); await p.waitForTimeout(350);
      const Bd=await p.evaluate(([f])=>{ const L=(eval(f))('#placeCards .sc-card, #modeBar'); const c=document.querySelector('#placeCards .sc-card'), po=c&&c.querySelector('.plan-out'); const r=po?po.getBoundingClientRect():null, cr=c?c.getBoundingClientRect():null; L.inCard=!!(r && cr && r.left>=cr.left-1 && r.right<=cr.right+1); return L; }, ['('+NEWLAYOUT.toString()+')']);
      check('Layout '+W+' px: My plan and the board (tabs, cards with the line) inside the screen, no sideways scroll, no new text under 12 px; the line sits inside its card', S.n===1 && !S.small.length && !S.outside.length && S.side<=0 && Bd.n>=2 && !Bd.small.length && !Bd.outside.length && Bd.side<=0 && Bd.inCard, {S, Bd});
      // v5.10 (fixer): the tab bar keeps its rows (390 px: 3, was 5 with the words in the buttons; 1,000 px: 1, was 2)
      const BAR=()=>{ const bs=[...document.querySelectorAll('#modeBar button')].map(b=>b.getBoundingClientRect()).sort((a,b)=>a.top-b.top); let rows=0, bot=-1e9; bs.forEach(r=>{ if(r.top>=bot-1){ rows++; bot=r.bottom; } else bot=Math.max(bot, r.bottom); });
        const ln=document.querySelector('#modeBar .mode-plan-line'); return {rows, line:ln && getComputedStyle(ln).display!=='none' ? ln.textContent : null, lineFs:ln?getComputedStyle(ln).fontSize:null, words:[...document.querySelectorAll('#modeBar .mode-plan')].map(x=>x.getBoundingClientRect().width>1?getComputedStyle(x).display:'hidden').join(',')}; };
      const BOn=await p.evaluate(BAR); await setPlan(p, 0); const BOff=await p.evaluate(BAR); await setPlan(p, 50);
      check('Layout '+W+' px: the tab bar has as many rows with My plan as without ('+BOff.rows+'); '+(W<=640?'on a phone the words leave the buttons (kept for screen readers) for one muted 12 px line under them, "🍀 Suertudo and 🔮 Brujo are outside your plan"':'the words sit under each tab name (no line under the bar)'),
        BOn.rows===BOff.rows && BOff.line===null && (W<=640 ? (BOn.line==='🍀 Suertudo and 🔮 Brujo are outside your plan' && BOn.lineFs==='12px' && BOn.words==='hidden,hidden') : (BOn.line===null && BOn.words==='block,block')), {BOn, BOff}); }
    await p.setViewportSize({width:1280, height:1000});
    check('A: no page errors', !errs.length, errs); await ctx.close(); }
  // ================= B: the 1,000-bet blocks =================
  { const {L, P}=logB(); const {ctx, p, errs}=await open(B, {log:L});
    // placement order worked out here on its own: book time, else the save time, else the date at midnight CT; ties keep the log’s order
    const ms=b=>{ let t=Date.parse(b.placedAt); if(!isNaN(t)) return t; t=Date.parse(b.snap&&b.snap.at); if(!isNaN(t)) return t; return Date.parse(b.date+'T00:00:00-06:00'); };
    const mem=L.map((b,i)=>({b,i})).filter(({b})=>b.kind!=='parlay' && !b.research && !b.tier && !b.free && b.stake>0 && ms(b)>=Date.parse('2026-11-11T06:00:00Z'));
    const want=mem.sort((x,y)=>(ms(x.b)-ms(y.b))||(x.i-y.i)).map(x=>x.b.id);
    await p.evaluate(()=>{ document.querySelector('.tab[data-view="v-perf"]').click(); }); await p.waitForTimeout(900);
    const M=await p.evaluate(()=>{ const M=planBlocksModel(logged); return {order:M.order.map(b=>b.id), sizes:M.blocks.map(s=>s.placed), n:M.blocks.map(s=>s.n), N:M.N, K:M.K, days:M.days, pace:M.pace, head:M.head, fill:M.blocks.map(s=>s.fillAt), vt:M.blocks.map(s=>s.vt), vc:M.blocks.map(s=>s.vc)}; });
    check('P3 · membership by the order placed: 2,050 Scorecard bets since 11/11 (the scrambled log put back in time order; the 11/10 11:59 PM, free, parlay, research, 🔮 extra and $0 bets left out; a bet with no book time by its save time, one with only a date at 12:00 AM CT; the tie in the log’s order)',
      M.N===2050 && JSON.stringify(M.order)===JSON.stringify(want) && M.order[0]==='bk0' && M.order.indexOf('bk41')===32 && M.order.indexOf('bk501')<M.order.indexOf('bk500') === (L.indexOf(P[501])<L.indexOf(P[500])) && !M.order.some(id=>/^(pre|free|par|res|tier|zero)$/.test(id)),
      {N:M.N, first:M.order.slice(0,3), at41:M.order.indexOf('bk41'), tie:[M.order.indexOf('bk500'), M.order.indexOf('bk501'), L.indexOf(P[500]), L.indexOf(P[501])]});
    check('P3 · a log of 2,050 Scorecard bets gives blocks of 1,000 / 1,000 / 50 (three shown); settled 1,000 / 1,000 / 30', M.K===3 && M.sizes.join('/')==='1000/1000/50' && M.n.join('/')==='1000/1000/30', {sizes:M.sizes, n:M.n});
    // each block’s verdict = the Scorecard run on that block alone (logged = the block’s bets, in the log’s order)
    const SC=await p.evaluate(()=>{ const keep=logged, M=planBlocksModel(keep), out=[];
      M.blocks.forEach((s,k)=>{ const ids=new Set(M.order.slice(k*1000,(k+1)*1000).map(b=>b.id)); logged=keep.filter(b=>ids.has(b.id)); renderScorecard(); const v=document.querySelector('#scoreBody .sc-verdict');
        const cv=document.querySelector('#planBlocks .pb-card[data-block="'+(k+1)+'"] .sc-verdict')||{};
        out.push({sc:v.innerHTML, scCls:v.className, blk:s.vt, blkCls:'sc-verdict '+s.vc, n:logged.length, card:cv.innerHTML, cardCls:cv.className}); });   // v5.10 (fixer): the whole verdict, not its first line
      logged=keep; renderScorecard(); return out; });
    const L1=x=>x.split('<br>')[0];   // v5.10 (fixer): the whole verdict box is compared (the read of a bad stretch included); L1 = its first line
    check('P3 · each block’s whole verdict is the Scorecard’s own verdict box run on that block alone (same HTML and class, the read of a bad stretch included): block 1 "✅ … good evidence of an edge (evidence, not proof).", block 2 "❌ 1000 bets in, no clear evidence of an edge yet: median CLV range still touches zero · ROI range still includes losing." and its "⚠ The last 100 bets are not beating the closing price", block 3 "Not yet — 970 more settled bets …" and its "📉 Down … normal bad luck"',
      SC.length===3 && SC.every(x=>x.sc===x.blk && x.card===x.blk && x.scCls===x.blkCls && x.cardCls===x.blkCls) && SC[0].blk==='✅ After 1,000+ bets, the profit range and the closing-line range are both above zero: good evidence of an edge (evidence, not proof).' && SC[0].blkCls==='sc-verdict good'
      && L1(SC[1].blk)==='❌ 1000 bets in, no clear evidence of an edge yet: median CLV range still touches zero · ROI range still includes losing.' && /<br>⚠ The last 100 bets are <b>not beating the closing price<\/b> \(median /.test(SC[1].blk) && SC[1].blkCls==='sc-verdict bad'
      && L1(SC[2].blk)==='Not yet — 970 more settled bets before raising stakes or claiming anything.' && /<br>📉 Down \$[\d.,]+ in the last 30 days, but still beating the close/.test(SC[2].blk) && SC.map(x=>x.n).join('/')==='1000/1000/50', SC);
    const U=await p.evaluate(()=>{ const a=scoreSet(logged.slice(0,400)), b=scBoots(a.settled, a.withClose), c=scBoots(a.settled, a.withClose, true); return {same:JSON.stringify(b.roiB)===JSON.stringify(c.roiB) && JSON.stringify(b.medB)===JSON.stringify(c.medB), mean:!!b.meanB, noMean:c.meanB===null,
      v1:scVerdict(999,{lo:1},{lo25:1}).vt, v2:scVerdict(1000,{lo:0.01},{lo25:0}).vt, v3:scVerdict(1000,{lo:-0.01},{lo25:0.01}).vt, src:String(renderScorecard).includes('scVerdict(n, roiB, medB, S, C)') && String(renderScorecard).includes('scBoots(S, C)') && !String(renderScorecard).includes('last30') && String(scVerdict).includes('last30')}; });   // v5.10 (fixer): the read of a bad stretch moved into scVerdict
    check('P3 · scVerdict keeps the Scorecard’s thresholds and words (999 bets: not yet; 1,000 with the median CLV 95% low end at 0: touches zero; ROI 90% low end under 0: includes losing); renderScorecard calls scVerdict and scBoots; a block skips only the mean CLV range',
      U.v1==='Not yet — 1 more settled bets before raising stakes or claiming anything.' && U.v2==='❌ 1000 bets in, no clear evidence of an edge yet: median CLV range still touches zero.' && U.v3==='❌ 1000 bets in, no clear evidence of an edge yet: ROI range still includes losing.' && U.src && U.same && U.mean && U.noMean, U);
    // the page’s clock runs on from NOW (Playwright’s installed clock is not paused), so the pace and the fill date are worked out here from the time the panel was drawn
    const PG=await p.evaluate(()=>{ const t0=Date.now(); renderPlanBlocks(true); const q=s=>[...document.querySelectorAll('#planBlocks '+s)].map(x=>x.textContent.replace(/\s+/g,' ').trim()); return {t0, h2:q('h2')[0], words:q('p.pb-l')[0], pace:q('.pb-pace')[0], heads:q('.pb-card h3'), prog:q('.pb-card .pb-prog'), placed:[...document.querySelectorAll('#planBlocks .pb-card')].map(c=>c.querySelector('.pb-l .meta').textContent), bars:[...document.querySelectorAll('#planBlocks .pb-card .sc-prog i')].map(i=>i.style.width), fill:q('.pb-fill'), note:q('.pb-note')[0], money:q('.pb-money'), help:q('details.help .meta')[0]}; });
    const days=(PG.t0-Date.parse('2026-11-11T06:00:00Z'))/86400e3, pace=2050/days, eta=new Date(PG.t0+(3000-2050)/pace*86400e3).toLocaleDateString('en-US',{timeZone:'America/Chicago', month:'short', day:'numeric', year:'numeric'});
    check('P3 · the panel: "Your 1,000-bet blocks (from 11/11)", the words "Block 1 starts the record · Block 2 confirms · Block 3 reconfirms. Each block is judged on its own; the rules stay frozen inside a block.", the progress "1,000 of 1,000 settled" / "30 of 1,000 settled" with bars, placed counts',
      /^Your 1,000-bet blocks \(from 11\/11\)/.test(PG.h2) && PG.words==='Block 1 starts the record · Block 2 confirms · Block 3 reconfirms. Each block is judged on its own; the rules stay frozen inside a block.' && PG.heads.join('|')==='Block 1 · starts the record bets 1–1,000|Block 2 · confirms bets 1,001–2,000|Block 3 · reconfirms bets 2,001–3,000'
      && PG.prog.join('|')==='1,000 of 1,000 settled|1,000 of 1,000 settled|30 of 1,000 settled' && PG.placed.join('|')==='· 1,000 placed|· 1,000 placed|· 50 placed' && PG.bars.join('|')==='100%|100%|3%', PG);
    check('P3 · pace and fill: "2,050 Scorecard bets placed since 11/11 · about '+pace.toFixed(1)+' a day · 4.5 days of data (rough: under 14 days)" (2,050 bets since 11/11 12:00 AM CT, 4.5 days ago); blocks 1 and 2 complete; block 3 "At your pace its 3,000th bet lands about '+eta+' (rough)."',
      PG.pace==='2,050 Scorecard bets placed since 11/11 · about '+pace.toFixed(1)+' a day · 4.5 days of data (rough: under 14 days)' && PG.fill.join('|')==='Complete: all 1,000 settled.|Complete: all 1,000 settled.|At your pace its 3,000th bet lands about '+eta+' (rough).' && Math.abs(M.days-4.5)<0.01 && Math.abs(M.pace-2050/4.5)<1 && days>=4.5 && days<4.51, {pace:PG.pace, fill:PG.fill, want:eta, days});
    check('P3 · "Which bets count" says only the date changes the blocks: "Change the date in Settings › My plan (the chance there does not change which bets count)."', PG.help.includes('The pace is the bets placed a day since 11/11. Change the date in Settings › My plan (the chance there does not change which bets count).'), PG.help);   // v5.10 (fixer)
    check('P3 · the head-start note, worked out from the log: block 1’s 32 settled bets on games before 11/15 (23 won at $2.00, 9 lost at $1.48) = +$32.68: "Block 1 starts 11/11, a date chosen after a good first week: its first 32 settled bets (+$32.68) were already known, a small head start. Blocks 2 and 3 have no such head start."',
      M.head.n===32 && Math.abs(M.head.profit-32.68)<1e-9 && M.head.day==='2026-11-15' && PG.note==='Block 1 starts 11/11, a date chosen after a good first week: its first 32 settled bets (+$32.68) were already known, a small head start. Blocks 2 and 3 have no such head start.', {head:M.head, note:PG.note});
    // a block-2 bet open again: "Full", 999 of 1,000, and the Scorecard’s "Not yet — 1 more"
    const F=await p.evaluate(()=>{ const b=planBlocksModel(logged).order[1500], keep=b.result; delete b.result; renderPlanBlocks(true); const c=document.querySelector('#planBlocks .pb-card[data-block="2"]');
      const out={prog:c.querySelector('.pb-prog').textContent, fill:c.querySelector('.pb-fill').textContent, v:c.querySelector('.sc-verdict').innerHTML.split('<br>')[0] /* v5.10 (fixer): its first line (block 2 also has the read of a bad stretch) */, at:new Date(planBlocksModel(logged).blocks[1].fillAt).toISOString()}; b.result=keep; renderPlanBlocks(true); return out; });
    check('P3 · a block not yet settled: "999 of 1,000 settled", "Full: its 2,000th bet was placed Nov 15, 2026." (the day its 2,000th bet was placed), "Not yet — 1 more settled bets …"', F.prog==='999 of 1,000 settled' && F.fill==='Full: its 2,000th bet was placed Nov 15, 2026.' && F.v==='Not yet — 1 more settled bets before raising stakes or claiming anything.' && F.at===iso(Date.parse(P[1999].placedAt)), F);
    // the Scorecard and Said vs won pinned to the page before v5.10 (same log, same clock)
    const PIN=await p.evaluate(()=>{ renderPerf(); const d=document.createElement('div'); d.innerHTML=rpCalHtml(rpSet()); return {sc:(document.getElementById('scoreBody')||{}).innerHTML||'', sw:JSON.stringify(saidWonRows(logged)), cal:d.textContent.replace(/\s+/g,' ').trim()}; });
    const PIN0={sc:[4123245908, 3137], sw:[1407465709, 231], cal:[1794458886, 834]};   // taken on the page before v5.10 (main at 1a64fd4) with this log and clock
    check('P3 · the Scorecard is unchanged: #scoreBody hash '+PIN0.sc[0]+' / '+PIN0.sc[1]+' characters on this log, as on the page before v5.10 (scoreSet, the ranges and the verdict moved into functions, byte for byte)', fnv(PIN.sc)===PIN0.sc[0] && PIN.sc.length===PIN0.sc[1], [fnv(PIN.sc), PIN.sc.length]);
    check('P3 · Said vs won is unchanged: saidWonRows JSON hash '+PIN0.sw[0]+' / '+PIN0.sw[1]+' and its panel text hash '+PIN0.cal[0]+' / '+PIN0.cal[1]+' (calibration-v1)', fnv(PIN.sw)===PIN0.sw[0] && PIN.sw.length===PIN0.sw[1] && fnv(PIN.cal)===PIN0.cal[0] && PIN.cal.length===PIN0.cal[1], [fnv(PIN.sw), PIN.sw.length, fnv(PIN.cal), PIN.cal.length]);
    const LZ=await p.evaluate(()=>{ const o=window.planBlocksModel; let n=0; window.planBlocksModel=function(){ n++; return o.apply(this, arguments); }; try{ document.querySelector('.tab[data-view="v-board"]').click(); renderPerf(); const away=n; document.querySelector('.tab[data-view="v-perf"]').click(); return {away, open:n}; } finally { window.planBlocksModel=o; } });
    check('P3 · worked out only when Performance is open: renderPerf on another tab works out no block; opening Performance does', LZ.away===0 && LZ.open>=1, LZ);
    await p.waitForTimeout(300);
    for(const W of [390,1000,1280,1960]){ await p.setViewportSize({width:W, height:900}); await p.waitForTimeout(250); const Ly=await p.evaluate(([f])=>(eval(f))('#planBlocksPanel'), ['('+NEWLAYOUT.toString()+')']);
      const cols=await p.evaluate(()=>{ const c=[...document.querySelectorAll('#planBlocks .pb-card')].map(x=>Math.round(x.getBoundingClientRect().top)); return new Set(c).size; });
      check('Layout '+W+' px: the blocks panel inside the screen, no sideways scroll, no text under 12 px; '+(W<=640?'one block a row':'the blocks side by side'), Ly.n===1 && !Ly.small.length && !Ly.outside.length && Ly.side<=0 && (W<=640?cols===3:cols===1), {Ly, rows:cols}); }
    await p.setViewportSize({width:1280, height:1000});
    check('B: no page errors', !errs.length, errs); await ctx.close(); }
  // ================= C: Reports › By › Band, 2.5% steps (exploratory) =================
  { const {ctx, p, errs}=await open(B, {log:logC()});
    await p.evaluate(()=>{ document.querySelector('.tab[data-view="v-reports"]').click(); }); await p.waitForTimeout(350);
    const R=await p.evaluate(()=>{ RP.per='all'; RP.f={}; RP.basis='game'; RP.by='band25'; rpRender(); const o=document.querySelector('#rpBy option[value="band25"]');
      return {opt:o?o.textContent:null, opts:[...document.querySelectorAll('#rpBy option')].map(x=>x.value).join(','), rows:[...document.querySelectorAll('#rpBreak tbody tr')].map(r=>r.querySelector('td.rp-bet').textContent+'='+r.querySelector('td[data-l="Tickets (incl. open)"]').textContent+'|'+r.querySelector('td[data-l="Read"]').textContent),
        notes:[...document.querySelectorAll('#rpBreak > p')].map(x=>x.textContent), card:(document.getElementById('rpSoFar')||{}).textContent.slice(0,60), keys:[rpBand25Txt(20), rpBand25Txt(0), rpBand25Txt(39)]}; });
    check('P4 · By lists "Band, 2.5% steps (exploratory)" after the other eight', R.opt==='Band, 2.5% steps (exploratory)' && R.opts==='sport,book,kind,price,tab,band,market,stm,band25', R.opts);
    check('P4 · the rows: La Contadora’s chance saved before the game in 2.5-point steps, highest first (99.9% → 97.5–100.0%, 52.5% → 52.5–55.0%, 50.0% and 52.49% → 50.0–52.5% with the open 51%, 47.5% → 47.5–50.0%, 47.49% → 45.0–47.5%, 1% → 0.0–2.5%); saved after the start, a parlay and none saved → "No La Contadora chance"; every row has its Read word',
      R.rows.join(' ; ')==='97.5–100.0%=1|Too few to read ; 52.5–55.0%=1|Too few to read ; 50.0–52.5%=3|Too few to read ; 47.5–50.0%=1|Too few to read ; 45.0–47.5%=1|Too few to read ; 0.0–2.5%=1|Too few to read ; No La Contadora chance=3|Too few to read' && R.keys.join(',')==='50.0–52.5%,0.0–2.5%,97.5–100.0%', R.rows);
    check('P4 · the header note: "Exploratory: leads, not proof. The official bands stay 5% wide (calibration-v1). A cut you like here becomes a written guess, tested on the NEXT bets before anything changes (the band study plan)." and the So far card follows the grouping',
      R.notes[0].startsWith('Exploratory: leads, not proof. The official bands stay 5% wide (calibration-v1). A cut you like here becomes a written guess, tested on the NEXT bets before anything changes (the band study plan).') && R.notes.length===2 && R.card.startsWith('So far · by Band, 2.5% steps (exploratory)'), {notes:R.notes[0], card:R.card});
    for(const W of [390,1000,1280,1960]){ await p.setViewportSize({width:W, height:900}); await p.waitForTimeout(250); const Ly=await p.evaluate(([f])=>{ const o=(eval(f))('#rpBreak, #rpSoFar'); const tw=document.querySelector('#rpBreak .rp-tw'); o.inner=tw?tw.scrollWidth-tw.clientWidth:null; return o; }, ['('+NEWLAYOUT.toString()+')']);
      check('Layout '+W+' px: Reports by Band, 2.5% steps: no sideways scroll, nothing outside the screen or under 12 px, no scroll inside the table', Ly.n>=2 && !Ly.small.length && !Ly.outside.length && Ly.side<=0 && Ly.inner===0, Ly); }
    check('C: no page errors', !errs.length, errs); await ctx.close(); }
  // ================= D (v5.10 fixer): the head-start note when My plan’s date is changed later; the read of a bad stretch on a block =================
  const NOW2=Date.parse('2026-11-25T18:00:00Z');   // Wed 11/25, 12:00 PM CT: ten days after the plan was set
  const NOTE=async p=>p.evaluate(()=>{ renderPlanBlocks(true); const n=document.querySelector('#planBlocks .pb-note'); return {t:n?n.textContent.replace(/\s+/g,' ').trim():null, title:n?n.title:null}; });
  const money2=x=>(x<0?'−':(x>0?'+':''))+'$'+Math.abs(x).toFixed(2);   // the page’s money(x, true), written here on its own
  { const {L, P}=logB(); const {ctx, p, errs}=await open(B, {log:L, now:NOW2});
    await p.evaluate(()=>{ document.querySelector('.tab[data-view="v-perf"]').click(); }); await p.waitForTimeout(900);
    const D0=await NOTE(p);
    check('D · ten days later the date never changed: still "Block 1 starts 11/11, a date chosen after a good first week: its first 32 settled bets (+$32.68) were already known, a small head start. Blocks 2 and 3 have no such head start." (the plan set 11/15 12:40 AM)',
      D0.t==='Block 1 starts 11/11, a date chosen after a good first week: its first 32 settled bets (+$32.68) were already known, a small head start. Blocks 2 and 3 have no such head start.' && /the day the plan was set \(11\/15, 12:40\sAM\)/.test(D0.title), D0);
    await setPlan(p, null, '2026-11-12'); await setPlan(p, null, '2026-11-11');   // changed and back: 11/11 chosen again on 11/25, with every block’s results known
    const prof=b=>b.result==='win'?b.stake:b.result==='loss'?-b.stake:0, kn=(a,z)=>P.slice(a,z).filter(b=>b.result), sum=a=>a.reduce((t,b)=>t+prof(b),0);
    const K1=kn(0,1000), K2=kn(1000,2000), K3=kn(2000,2050);
    const D1=await NOTE(p), DM=await p.evaluate(()=>{ const M=planBlocksModel(logged); return {heads:M.heads.map(h=>[h.n, +h.profit.toFixed(2)]), setDef:M.setDef, setSaved:M.setSaved, cfg:JSON.parse(localStorage.getItem('mbev.cfg')||'{}'), now:Date.now()}; });
    const want1='Block 1 starts 11/11, a date chosen when 1,000 of its settled bets ('+money2(sum(K1))+') were already known: a head start of 1,000 of its 1,000 bets. Block 2 had 1,000 settled bets ('+money2(sum(K2))+') already known. Block 3 had 30 settled bets ('+money2(sum(K3))+') already known.';
    check('D · the date changed on 11/25 (to 11/12 and back to 11/11): the moment is saved with the settings (planSetAt) and every block counts the results known then: block 1 1,000 ('+money2(sum(K1))+'), block 2 1,000 ('+money2(sum(K2))+'), block 3 30 ('+money2(sum(K3))+'); plain words, no “good first week”, no “small”, no “Blocks 2 and 3 have no such head start”',
      K1.length===1000 && K2.length===1000 && K3.length===30 && D1.t===want1 && JSON.stringify(DM.heads)===JSON.stringify([[1000,+sum(K1).toFixed(2)],[1000,+sum(K2).toFixed(2)],[30,+sum(K3).toFixed(2)]]) && DM.setDef===false && DM.setSaved===true
      && DM.cfg.planSince==='2026-11-11' && Math.abs(Date.parse(DM.cfg.planSetAt)-DM.now)<120e3 && /the day its date was last changed in Settings › My plan \(11\/25, 12:0\d\sPM\)/.test(D1.title), {D1, want1, DM});
    await p.reload(); await p.waitForTimeout(1300); await p.evaluate(()=>{ document.querySelector('.tab[data-view="v-perf"]').click(); }); await p.waitForTimeout(900);
    const D2=await NOTE(p);
    check('D · after a reload the saved moment holds: the same note', D2.t===want1, D2);
    check('D (2,050 bets): no page errors', !errs.length, errs); await ctx.close(); }
  { // 150 Scorecard bets placed 11/20–11/24 at +100, every close +110 (CLV −4.8%): 120 settled, 70 won (+$20.00)
    const st0=Date.parse('2026-11-20T15:00:00Z'), L=[]; for(let i=0;i<150;i++){ const pl=st0+i*38.4*60e3, b={id:'w'+i, key:'w'+i, kind:'prop', sport:'NBA', book:'Novig', name:'Week '+i, market:'1.5 Threes', side:'O', odds:'+100', stake:1, game:'W'+i+' @ V'+i, start:iso(pl+2*H), date:iso(pl+2*H).slice(0,10), placedAt:iso(pl), snap:{at:iso(pl+30e3), act:0.55, actNet:0.04}, closing:'+110'};
      if(i<120){ b.result=(i%12)<7?'win':'loss'; b.gradedBy='manual'; } L.push(b); }
    const {ctx, p, errs}=await open(B, {log:L, now:NOW2});
    await p.evaluate(()=>{ document.querySelector('.tab[data-view="v-perf"]').click(); }); await p.waitForTimeout(900);
    const W1=await p.evaluate(()=>{ const v=document.querySelector('#scoreBody .sc-verdict'), c=document.querySelector('#planBlocks .pb-card[data-block="1"] .sc-verdict'); return {sc:v.innerHTML, scCls:v.className, card:c.innerHTML, cardCls:c.className}; });
    check('D · the read of a bad stretch on a block: 150 bets, 120 settled, none beating the close: block 1’s card shows the Scorecard’s own verdict box, red (“bad”) before 1,000 bets: "Not yet — 880 more settled bets …" and "⚠ The last 100 bets are not beating the closing price (median −4.8%)"',
      W1.card===W1.sc && W1.cardCls===W1.scCls && W1.cardCls==='sc-verdict bad' && W1.card.startsWith('Not yet — 880 more settled bets before raising stakes or claiming anything.<br>⚠ The last 100 bets are <b>not beating the closing price</b> (median −4.8%).'), W1);
    const E0=await NOTE(p); await setPlan(p, null, '2026-11-20'); const E1=await NOTE(p);
    check('D · bets placed 11/20–11/24: with 11/11 (set 11/15) none was known: "Block 1 starts 11/11: none of its bets had settled when the plan was set (11/15, 12:40 AM), so it has no head start. Blocks 2 and 3 have none either."; the date changed to 11/20 on 11/25: "Block 1 starts 11/20, a date chosen when 120 of its settled bets (+$20.00) were already known: a head start of 120 of its 1,000 bets. Blocks 2 and 3 have no such head start."',
      E0.t==='Block 1 starts 11/11: none of its bets had settled when the plan was set (11/15, 12:40 AM), so it has no head start. Blocks 2 and 3 have none either.' && E1.t==='Block 1 starts 11/20, a date chosen when 120 of its settled bets (+$20.00) were already known: a head start of 120 of its 1,000 bets. Blocks 2 and 3 have no such head start.', {E0, E1});
    check('D (150 bets): no page errors', !errs.length, errs); await ctx.close(); }
  await B.close(); console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(fail?1:0); })().catch(e=>{ console.error(e); process.exit(1); });
