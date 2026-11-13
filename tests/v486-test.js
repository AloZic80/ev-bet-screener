// node tests/v486-test.js — v4.86 (agreed with Sally, owner "BUILD" Fri 11/13): each new bet freezes what it was when taken (snap.listed: the tab
// of its chance, approved / extra / own / override, the classification, live / old_price / awol); the CSV shows them in new columns (the old
// "mode" keeps its meaning as "mode (old)"; an old bet gets only a labelled derived tab); the Scorecard shows "Own / unverified" apart, without
// taking those bets out of the headline.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,700)); };
const NOW=Date.parse('2026-11-13T19:00:00Z'), DAY='2026-11-13', TIP=Date.parse('2026-11-14T02:00:00Z'), iso=ms=>new Date(ms).toISOString();
const T=(ha,abbr,loc,nick)=>({ha,id:abbr,abbr,name:loc+' '+nick,loc,nick,logo:'',rec:'',color:'333333',alt:'ffffff'});
const GI={state:'pre',startISO:iso(TIP),eventId:'401900',timeCT:'',detail:'',teams:[T('away','CHA','Charlotte','Hornets'),T('home','PHX','Phoenix','Suns')]};
const am=p=>p>=0.5?String(Math.round(-100*p/(1-p))):'+'+Math.round(100*(1-p)/p);
const row=(id,name,market,price,c,extra)=>Object.assign({name,team:'PHX',game:'CHA @ PHX',matchup:'CHA @ PHX',side:'O',sport:'NBA',market,kind:'prop',book:'Novig',offeredRaw:am(price),offeredProb:price,fairProb:c,fairRaw:'',mktProb:c,stars:3,evModel:'market',
  gameInfo:GI,src:'api:NBA:props',apiKey:id,loadedAt:iso(NOW-60e3)},extra||{});
// La Contadora = c (model = market). Machín: 64% at 58%. A long shot: 42% at 35% (EV +20%), approved, under 45%: 🔮 Brujo.
const ROWS=[row('m','Collin Gillespie','1.5 Threes',0.58,0.64), row('l','Long Shot','2.5 Steals',0.35,0.42), row('a','Ghost Card','3.5 Assists',0.58,0.64)];
const OLD={id:'old',key:'old',sport:'NBA',kind:'prop',book:'Novig',odds:'-120',stake:2,date:'2026-11-01',dateSet:true,game:'CHA @ PHX',name:'Old Timer',side:'O',market:'1.5 Threes',betnow:'O 1.5 -120',result:'win',gradedBy:'manual',srcType:'api',
  snap:{at:'2026-11-01T18:00:00Z', act:0.57, screener:'v4.70'}, start:'2026-11-02T00:00:00Z'};
(async()=>{ const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:1280,height:1000}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(([R,d,L])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig',bank:'500',cfgVer:3.03})); localStorage.setItem('mbev.cards','1'); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows:R})); localStorage.setItem('mbev.log',JSON.stringify(L)); }catch(e){} },[ROWS,DAY,[OLD]]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1300);
  const L=await p.evaluate(()=>{ const g=k=>lastRows.find(r=>r.apiKey===k);
    g('a').awol={book:'Novig', note:'Novig: no market at your line', at:Date.now()}; refresh();
    const pre={m:{pass:g('m').pass, stake:g('m').stake}, l:{pass:g('l').pass, stake:g('l').stake, act:g('l').actProb}, a:{hold:g('a').hold||null}};
    addToLog(g('m')); addToLog(g('l')); addToLog(g('a')); addToLog(Object.assign({}, g('m'), {tier:'hail', name:'Extra Hail'}));
    addToLog({name:'Typed By Hand', sport:'NBA', kind:'prop', market:'0.5 Blocks', side:'O', team:'PHX', game:'CHA @ PHX', book:'Novig', offeredRaw:'+150', offeredProb:0.4, stake:3, src:'manual', gameInfo:g('m').gameInfo});
    addToLog(Object.assign({}, g('m'), {name:'Moved Line', lineMoved:true, actFair:0.43, actMkt:0.43}));   /* the bet editor: you changed the line, where her chance is 43% */
    addToLog(Object.assign({}, g('m'), {name:'Filled At Book', _fill:true}));   /* a book fill matched to the card */
    const old=Object.assign({}, g('l'), {name:'Stale Price', loadedAt:new Date(Date.now()-13*3600e3).toISOString(), moved:{book:'Novig'}}); addToLog(old);   /* "Add this line too" on a 13-hour-old price */
    const by=n=>logged.find(x=>x.name===n), s=n=>(by(n).snap||{}).listed||null;
    return {pre, m:s('Collin Gillespie'), l:s('Long Shot'), a:s('Ghost Card'), x:s('Extra Hail'), own:s('Typed By Hand'), old:s('Old Timer'), mv:s('Moved Line'), fl:s('Filled At Book'), st:s('Stale Price')}; });
  check('an approved Machín card (64% at 58%): tab machin, approved, no classification, live, policy tabs-v476', L.m && L.m.tab==='machin' && L.m.status==='approved' && L.m.classification===null && L.m.availability==='live' && L.m.policy==='tabs-v476', L);
  check('an approved long shot (42%): tab brujo, approved, classification approved_longshot', L.pre.l.pass && L.l && L.l.tab==='brujo' && L.l.status==='approved' && L.l.classification==='approved_longshot', {pre:L.pre.l, l:L.l});
  check('a card placed from 👻 AWOL ($0, held): its chance tab (machin), status override, availability awol', L.pre.a.hold && L.a && L.a.tab==='machin' && L.a.status==='override' && L.a.availability==='awol', {pre:L.pre.a, a:L.a});
  check('an extra (Hail Mary): status extra, classification hail_mary', L.x && L.x.status==='extra' && L.x.classification==='hail_mary', L.x);
  check('a bet typed by hand: status own, no tab, no availability', L.own && L.own.status==='own' && L.own.tab===null && L.own.availability===null, L.own);
  check('a bet from before v4.86 is never given a record afterwards', L.old===null, L.old);
  check('Los Chismosos: a line you changed in the editor records its own chance (43%: brujo) and override, not the card’s approval', L.mv && L.mv.tab==='brujo' && L.mv.status==='override', L.mv);
  check('Los Chismosos: a book fill matched to a card is your own bet (own), as before v4.86', L.fl && L.fl.status==='own', L.fl);
  check('Los Chismosos: "Add this line too" on a 13-hour-old price: override, old_price', L.st && L.st.status==='override' && L.st.availability==='old_price', L.st);
  const csv=await p.evaluate(()=>logCsv(''));
  const parse=line=>{ const out=[]; let cur='', q=false; for(let i=0;i<line.length;i++){ const ch=line[i]; if(q){ if(ch==='"'){ if(line[i+1]==='"'){ cur+='"'; i++; } else q=false; } else cur+=ch; } else if(ch==='"') q=true; else if(ch===','){ out.push(cur); cur=''; } else cur+=ch; } out.push(cur); return out; };
  const lines=csv.replace(/^﻿/,'').split('\r\n'), head=parse(lines[0]), rows=lines.slice(1).map(parse), col=(r,n)=>r[head.indexOf(n)], by=n=>rows.find(r=>col(r,'bet')===n);
  check('CSV: "mode (old)" keeps its old meaning, and six columns come last: listed tab, selection, classification, availability, in Scorecard, derived tab (tabs-v476)', head.includes('mode (old)') && head.slice(-7,-1).join('|')==='listed tab|selection|classification|availability|in Scorecard|derived tab (tabs-v476)' && head[head.length-1]==='band source' /* v4.88 */ && rows.every(r=>r.length===head.length), head.slice(-7));
  const cv=n=>['listed tab','selection','classification','availability','in Scorecard','derived tab (tabs-v476)'].map(h=>col(by(n),h)).join('|');
  check('CSV rows: Machín approved live yes · Brujo approved approved_longshot · Machín override awol · Hail Mary extra not in the Scorecard · typed own', cv('Collin Gillespie')==='Machín|approved||live|yes|' && cv('Long Shot')==='Brujo|approved|approved_longshot|live|yes|' && cv('Ghost Card')==='Machín|override||awol|yes|' && cv('Extra Hail')==='Machín|extra|hail_mary|live|no|' && cv('Typed By Hand')==='|own|||yes|',
    {m:cv('Collin Gillespie'), l:cv('Long Shot'), a:cv('Ghost Card'), x:cv('Extra Hail'), own:cv('Typed By Hand')});
  check('CSV: the old bet (57% when taken) has no record; only the labelled derived column says "Volado (derived)"', cv('Old Timer')==='||||yes|Volado (derived)', cv('Old Timer'));
  // Scorecard: the typed bet settles; it is shown apart and stays in the headline
  const fr=await p.evaluate(()=>{ const t=logged.find(x=>x.name==='Collin Gillespie'); t.free=true; saveLog(); const c=logCsv(''); t.free=false; saveLog(); return c.includes('CLV only (free bet)'); });
  check('Los Chismosos: a free bet says "CLV only (free bet)" in the in Scorecard column', fr, fr);
  const sc=await p.evaluate(()=>{ const t=logged.find(x=>x.name==='Typed By Hand'); t.result='win'; t.gradedBy='manual'; saveLog(); renderScorecard(); const el=document.querySelector('#scoreBody .sc-own'); const n=scoreSet(logged).settled.length; return {t:el?el.textContent:null, n}; });
  check('Scorecard: "Own / unverified: 1 of the 2 settled bets …, currently included in the headline under the existing policy"; the headline still counts both', sc.t && /^✍️ Own \/ unverified: 1 of the 2 settled bets above was typed by you, came from a book fill or an import, not taken from a board card/.test(sc.t) && /Currently included in the headline under the existing policy\./.test(sc.t) && sc.n===2, sc);
  check('no page errors', !errs.length, errs);
  await b.close(); console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(fail?1:0); })();
