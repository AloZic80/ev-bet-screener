// node tests/v489-test.js — v4.89 (agreed with Sally, owner "BUILD NOW" Fri 11/13; Alonzo: "a tab just for Reports ... daily, monthly or all time ...
// it changes dynamically"): Reports, step 1. Worked out from the log each time (nothing saved but the choices), game day by default (the Bet
// calendar's day, same money as its totals), date placed from the saved time only, settled ROI only, to play and in play apart, filters, singles
// and parlays, the open and settled lists, and a CSV of exactly the bets shown.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,700)); };
const NOW=Date.parse('2026-11-13T19:00:00Z'), iso=ms=>new Date(ms).toISOString(), H=3600e3;
const bet=(id,o)=>Object.assign({id,key:id,sport:'NBA',kind:'prop',book:'Novig',stake:2,date:'2026-11-12',dateSet:true,game:'SAC @ POR',team:'POR',name:'P '+id,side:'O',market:'1.5 Threes',odds:'-110',start:'2026-11-13T02:00:00Z',snap:{at:'2026-11-12T18:00:00Z', act:0.62}},o);
const LOG=[bet('a',{name:'Won Guy', result:'win', gradedBy:'espn'}),
  bet('b',{name:'Lost Guy', sport:'NHL', book:'DraftKings', team:'DAL', stake:3, result:'loss', gradedBy:'espn', snap:{at:'2026-11-11T20:00:00Z', act:0.55}}),   // placed on 11/11, game day 11/12
  bet('c',{name:'Tonight Guy', date:'2026-11-13', start:iso(NOW+7*H), stake:4, snap:{at:iso(NOW-H), act:0.66}}),   // to play
  bet('d',{name:'Dallas Cowboys', kind:'moneyline', sport:'NFL', book:'Kalshi', team:'DAL', date:'2026-11-13', start:iso(NOW-H), stake:5, odds:'+120', snap:{at:iso(NOW-3*H), act:0.48}}),   // in play
  bet('e',{name:'Parlay', kind:'parlay', stake:1, result:'loss', gradedBy:'manual', parlay:{legs:3}, snap:undefined}),   // no saved placed time
  bet('f',{name:'Free Guy', free:true, odds:'+100', result:'win', gradedBy:'espn'}),
  bet('oct',{name:'October Guy', date:'2026-10-30', start:'2026-10-31T00:00:00Z', stake:2, result:'loss', gradedBy:'espn', snap:{at:'2026-10-30T18:00:00Z', act:0.6}})];
const REM=[{id:'rm1', lost:1.5, date:'2026-11-12', dateSet:true, start:'2026-11-12T23:00:00Z', name:'Cancelled', kind:'prop', sport:'NBA', book:'Novig', snap:{at:'2026-11-12T17:00:00Z'}}];
(async()=>{ const b=await chromium.launch();
  const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:1280,height:1000}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(([L,R])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.log',JSON.stringify(L)); localStorage.setItem('mbev.removed',JSON.stringify(R)); }catch(e){} }, [LOG, REM]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1300);
  const logBefore=await p.evaluate(()=>localStorage.getItem('mbev.log'));
  const cal=await p.evaluate(()=>{ lcMonth='2026-11'; lcRender(); return [...document.querySelectorAll('#lcTotals .lc-tot')].map(x=>[...x.children].map(c=>c.textContent).join(' ')); });
  await p.evaluate(()=>{ document.querySelector('.tab[data-view="v-reports"]').click(); }); await p.waitForTimeout(400);
  const rd=()=>p.evaluate(()=>({line:(document.querySelector('#rpHead .rp-line')||{}).textContent||'', ks:Object.fromEntries([...document.querySelectorAll('#rpHead .rp-k')].map(k=>[k.children[0].textContent,k.children[1].textContent])), lab:document.getElementById('rpLabel').textContent, cover:document.getElementById('rpCover').textContent, asof:document.getElementById('rpAsOf').textContent,
    split:[...document.querySelectorAll('#rpSplit tbody tr')].map(r=>[...r.children].map(c=>c.textContent.trim()).join('|')), open:[...document.querySelectorAll('#rpOpen tbody tr')].map(r=>r.children[1].querySelector('b').textContent+'|'+r.children[6].textContent), set:[...document.querySelectorAll('#rpSettled tbody tr')].map(r=>r.children[1].querySelector('b').textContent)}));
  await p.evaluate(()=>{ RP.anchor='2026-11-13'; RP.per='month'; rpRender(); });
  const m=await rd();
  check('the Reports tab opens on the month (game day): "November 2026 so far", the as-of line says game day', /^November 2026 so far$/.test(m.lab) && /counted by game day \(as the Bet calendar\)/.test(m.asof) && /7 tickets in the current log/.test(m.asof), {lab:m.lab, asof:m.asof});
  const calNov=cal[0]||'', st=(calNov.match(/settled ([−+]?\$[\d.]+)/)||[])[1], roi=(calNov.match(/ROI ([−+][\d.]+%)/)||[])[1];
  check('the month matches the Bet calendar to the cent: same tickets, W–L–P, settled profit and ROI (cancelled loss included)', m.ks['Tickets']==='6' && calNov.startsWith('November so far 6 bets '+m.ks['W–L–P']) && m.ks['Settled profit']===st && m.ks['ROI']===roi, {ks:m.ks, cal:calNov});
  check('headline: "Settled: $X risked, ±$Y · To play: $4.00 · In play: $5.00"; open money is not in the ROI', /^Settled: \$6\.00 risked, /.test(m.line) && /To play: \$4\.00 · In play: \$5\.00$/.test(m.line) && m.ks['Settled risked']==='$6.00' && m.ks['Open total']==='$9.00 · 2 open', {line:m.line, ks:m.ks});
  check('Month view: the custom dates are hidden, the ‹ › arrows show; the cancelled loss reads "lost $1.50"', await p.evaluate(()=>getComputedStyle(document.getElementById('rpCustom')).display==='none' && getComputedStyle(document.getElementById('rpNav')).display!=='none' && /lost \$1\.50 \(counted/.test(document.getElementById('rpHead').textContent)), null);
  check('a small sample says so ("too few to rank")', await p.evaluate(()=>/too few to rank/.test(document.getElementById('rpHead').textContent)), null);
  check('singles and parlays apart: Overall 6, Singles 5, Parlays 1 (the parlay lost $1)', m.split.length===3 && /^Overall\|6\|/.test(m.split[0]) && /^· Singles\|5\|/.test(m.split[1]) && /^· Parlays\|1\|0–1–0\|\$1\.00\|−\$1\.00\|/.test(m.split[2]), m.split);
  check('open list: Tonight Guy to play, Dallas Cowboys in play; settled list holds the four settled', m.open.join(',')==='Dallas Cowboys|▶ in play,Tonight Guy|⏳ to play' /* soonest start first */ && m.set.length===4, {open:m.open, set:m.set});
  // day view and arrows
  await p.evaluate(()=>{ document.querySelector('#rpPer [data-p="day"]').click(); }); const d1=await rd();
  await p.evaluate(()=>{ document.getElementById('rpPrev').click(); }); const d0=await rd();
  check('Day view: today 11/13 holds the two open bets; ‹ goes to 11/12 with the four settled', /Nov 13, 2026 · today/.test(d1.lab) && d1.ks['Tickets']==='2' && /Nov 12, 2026/.test(d0.lab) && d0.ks['Tickets']==='4', {d1:[d1.lab,d1.ks.Tickets], d0:[d0.lab,d0.ks.Tickets]});
  // date placed
  await p.evaluate(()=>{ const s=document.getElementById('rpBasis'); s.value='placed'; s.dispatchEvent(new Event('change',{bubbles:true})); }); const pl=await rd();
  check('Date placed, 11/12: the bet placed on 11/11 leaves, the parlay with no saved time is never guessed and the coverage line says so', pl.ks['Tickets']==='2' && !pl.set.includes('Lost Guy') && !pl.set.includes('Parlay') && pl.cover==='1 bet has no saved placed time: not in this view (never guessed).', {ks:pl.ks, set:pl.set, cover:pl.cover});
  await p.evaluate(()=>{ document.getElementById('rpPrev').click(); }); const pl11=await rd();
  check('Date placed, 11/11: Lost Guy is there', pl11.set.join(',')==='Lost Guy', pl11.set);
  // all time + filters
  await p.evaluate(()=>{ const s=document.getElementById('rpBasis'); s.value='game'; s.dispatchEvent(new Event('change',{bubbles:true})); document.querySelector('#rpPer [data-p="all"]').click(); }); const al=await rd();
  check('All time: 7 tickets (October included); no arrows on All', al.ks['Tickets']==='7' && al.lab==='All time' && await p.evaluate(()=>getComputedStyle(document.getElementById('rpNav')).display==='none'), al.ks);
  await p.evaluate(()=>{ const s=document.getElementById('rpSport'); s.value='NBA'; s.dispatchEvent(new Event('change',{bubbles:true})); }); const fN=await rd();
  await p.evaluate(()=>{ const s=document.getElementById('rpBook'); s.value='Novig'; s.dispatchEvent(new Event('change',{bubbles:true})); const t=document.getElementById('rpTeam'); t.value='por'; t.dispatchEvent(new Event('change',{bubbles:true})); }); const fT=await rd();
  check('filters: NBA keeps 5 (the NHL and NFL bets leave); + Novig + team "por" still 5; the count of filters shows', fN.ks['Tickets']==='5' && fT.ks['Tickets']==='5' && /3 filters on/.test(fT.asof), {nba:fN.ks.Tickets, t:fT.ks.Tickets, asof:fT.asof});
  await p.evaluate(()=>{ const s=document.getElementById('rpTab'); s.value='volado'; s.dispatchEvent(new Event('change',{bubbles:true})); }); const fV=await rd();
  check('tab filter by La Contadora’s chance when taken: Volado (50–60%) holds no NBA Novig bet here (they are 60–66%)', fV.ks['Tickets']===undefined && /No bets in this report/.test(await p.evaluate(()=>document.getElementById('rpHead').textContent)), fV.ks);
  await p.evaluate(()=>{ const s=document.getElementById('rpTab'); s.value='machin'; s.dispatchEvent(new Event('change',{bubbles:true})); }); const fM=await rd();
  check('tab Machín (60–75%): Won Guy, Tonight Guy, Free Guy, October Guy', fM.ks['Tickets']==='4', fM);
  // CSV of exactly these bets
  const csv=await p.evaluate(()=>{ const S=rpSet(); return logCsv('', new Set(S.L), {basis:'game day', range:'r', filters:'f', at:'t'}); });
  const parse=line=>{ const out=[]; let cur='', q=false; for(let i=0;i<line.length;i++){ const ch=line[i]; if(q){ if(ch==='"'){ if(line[i+1]==='"'){ cur+='"'; i++; } else q=false; } else cur+=ch; } else if(ch==='"') q=true; else if(ch===','){ out.push(cur); cur=''; } else cur+=ch; } out.push(cur); return out; };
  const CL=csv.replace(/^﻿/,'').split('\r\n'), head=parse(CL[0]), rows=CL.slice(1).map(parse);
  check('CSV: exactly the 4 filtered bets, each with ticket id, report basis, range, filters and time; the plain CSV is unchanged', rows.length===4 && head.slice(-5).join('|')==='ticket id|report basis|report range|report filters|report generated' && rows.every(r=>r.length===head.length) && rows.map(r=>r[head.indexOf('ticket id')]).sort().join(',')==='a,c,f,oct' && await p.evaluate(()=>{ const h=logCsv('').split('\r\n')[0]; return /band source$/.test(h); }), {head:head.slice(-5), n:rows.length});
  // saved: only the choices; the log untouched
  const ui=await p.evaluate(()=>JSON.parse(localStorage.getItem('mbev.reportsUi')||'null')), logAfter=await p.evaluate(()=>localStorage.getItem('mbev.log'));
  check('only the choices are saved (basis, period, filters); no totals; the bet log is byte-for-byte the same', ui && ui.basis==='game' && ui.per==='all' && ui.f.sport==='NBA' && Object.keys(ui).every(k=>['basis','per','f','from','to','by','px','bwWho','bwDir','small'].includes(k)) /* v4.90: the step-2 choices; never a total */ && logAfter===logBefore, {ui});
  // live: settle a bet and the open report follows
  await p.evaluate(()=>{ document.getElementById('rpReset').click(); }); const pre=await rd();
  await p.evaluate(()=>{ const t=logged.find(x=>x.id==='d'); t.result='win'; t.gradedBy='manual'; saveLog(); }); await p.waitForTimeout(200); const post=await rd();
  check('live: grading the Cowboys moves $5 from in play into settled, without reopening the tab', /In play: \$5\.00/.test(pre.line) && /In play: \$0\.00/.test(post.line) && pre.ks['Settled risked']==='$8.00' && post.ks['Settled risked']==='$13.00', {pre:pre.line, post:post.line});
  const rv=await p.evaluate(()=>{ RP.f={}; RP.per='month'; RP.anchor='2026-11-13'; RP.basis='game'; rpRender(); const S=rpSet();
    const c=logCsv('', new Set(S.L), {basis:'game day', range:'r', filters:'none', at:'t', cancelled:S.Rm}).split('\r\n');
    const canc=c.find(l=>/,cancelled,/.test(l))||'';
    const note=(document.querySelector('#rpSettled .rp-canc')||{}).textContent||'';
    RP.f={book:'Gone Book'}; rpRender(); const stale=Object.keys(RP.f).length; const savedStale=JSON.parse(localStorage.getItem('mbev.reportsUi')).f;
    RP.per='custom'; RP.from='2026-11-01'; RP.to=''; const hi=rpRange().hi; RP.per='month'; RP.from=''; rpRender();
    return {rows:c.length-1, canc, note, stale, savedStale, hi, own:rpTabOf({kind:'prop', snap:{listed:{status:'own', tab:null}, act:0.62}}), win:+rpToWin({kind:'prop', odds:'-100', stake:1.1, fee:0.1}).toFixed(4)}; });
  check('Los Chismosos: the CSV and the Settled list carry the cancelled bet that lost $1.50, so they add up to the headline', rv.rows===7 && /Cancelled/.test(rv.canc) && /,-1\.50,/.test(rv.canc) && /Cancelled · Novig · 2026-11-12 · −\$1\.50/.test(rv.note), {rows:rv.rows, canc:rv.canc.slice(0,120), note:rv.note});
  check('Los Chismosos: a saved filter no menu can show (a book no longer in the log) is dropped, not left on unseen', rv.stale===0 && Object.keys(rv.savedStale||{}).length===0, {stale:rv.stale, saved:rv.savedStale});
  check('Los Chismosos: a custom range with no To date ends today, as its label says', rv.hi==='2026-11-13', rv.hi);
  check('Los Chismosos: an own bet has no tab (as in the CSV), even with a chance saved', rv.own==='', rv.own);
  check('Los Chismosos: "To win" takes the fee off like betProfit ($1.10 at even money with a 10% fee wins $0.90)', rv.win===0.9, rv.win);
  // widths
  for(const W of [390,1000,1280,1960]){ await p.setViewportSize({width:W,height:900}); await p.evaluate(()=>{ document.querySelector('.rp-filt').open=true; document.querySelector('#rpPer [data-p="month"]').click(); }); await p.waitForTimeout(150);
    const r=await p.evaluate(()=>{ const out=[...document.querySelectorAll('#rpPanel .rp-ks, #rpPanel .rp-fg, #rpPanel .rp-seg, #rpPanel .rp-tw, #rpPanel .rp-line')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).map(e=>e.className); return {side:document.documentElement.scrollWidth>innerWidth, out}; });
    check(W+' px: no sideways scroll, every block inside the screen', !r.side && !r.out.length, r); }
  check('no page errors', !errs.length, errs);
  await b.close(); console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(fail?1:0); })();
