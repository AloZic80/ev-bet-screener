// node tests/csv-parlay-tags-test.js — v4.16. Alonzo: "download in CSV, by day or ALL"; "Send the Sentinels on Parlays, only a few have
// the option"; "put something on a parlay where we say we bet on the leg". CSV: the day menu, one row per bet, profit like Performance,
// a real file. Parlays: Send the Sentinels on combo apps too; a leg you hold as a single or in a logged parlay says "✓ you bet this".
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const NOW=Date.parse('2026-11-07T20:00:00Z'), H=3600e3, iso=ms=>new Date(ms).toISOString();
const B=(id,o)=>Object.assign({id,name:'X',kind:'prop',market:'1.5 Shots On Goal',side:'O',book:'Novig',odds:'+127',stake:2,sport:'NHL',date:'2026-11-07',start:iso(NOW+3*H),loggedAt:iso(NOW-6*H)},o.result?{gradedBy:'manual'}:{},o);
const LOG=[B('a',{name:'Kris Letang',result:'win'}), B('b',{name:'Tyler Bertuzzi',odds:'+138',result:'loss',date:'2026-11-06',start:iso(NOW-20*H)}),
  B('c',{name:'Free one',odds:'+100',stake:5,free:true,result:'win',date:'2026-11-06',start:iso(NOW-22*H)}),
  {id:'p',kind:'parlay',name:'Novig combo · 2 picks',market:'2-pick parlay',book:'Novig',odds:'+143',stake:1,date:'2026-11-07',start:iso(NOW+2*H),parlay:{legs:'Oklahoma State OKST Moneyline -212; Sidney Crosby Over 2.5 Shots On Goal +110',picks:2}}];
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:1280,height:900},acceptDownloads:true}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(L=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.log',JSON.stringify(L)); }catch(e){} }, LOG);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1200);
  const opts=await p.evaluate(()=>{ csvDays(); return [...document.querySelectorAll('#csvDay option')].map(o=>o.textContent); });
  check('the Download menu: All days, then each game day with its count, newest first', JSON.stringify(opts)==='["All days · 4 bets","Sat, 11/7/2026 · 2","Fri, 11/6/2026 · 2"]', opts);
  const all=await p.evaluate(()=>logCsv('')), day=await p.evaluate(()=>logCsv('2026-11-06'));
  const L=all.replace(/^﻿/,'').split('\r\n'), D=day.replace(/^﻿/,'').split('\r\n');
  check('All days: a header and one row per bet (4), starting with the UTF-8 mark for Excel', all.charCodeAt(0)===0xFEFF && L.length===5 && /^game day,placed,bet,pick,sport,type,book,odds,implied %,stake \$,free bet,result,profit \$/.test(L[0]), L.slice(0,2));
  check('one day (11/6): only its 2 bets; the loss is -2.00 and the free bet win counts its winnings only (+5.00)', D.length===3 && D.some(x=>/Tyler Bertuzzi/.test(x) && /,loss,-2\.00,/.test(x)) && D.some(x=>/Free one/.test(x) && /,yes,win,5\.00,/.test(x)), D);
  check('a parlay row keeps its legs; an open bet has no profit yet', L.some(x=>/Novig combo/.test(x) && /,open,,/.test(x) && /Oklahoma State OKST Moneyline -212; Sidney Crosby/.test(x)), L.filter(x=>/combo/.test(x)));
  await p.evaluate(()=>{ const s=document.getElementById('csvDay'); s.value='2026-11-06'; });
  const [dl]=await Promise.all([p.waitForEvent('download'), p.evaluate(()=>document.getElementById('csvDl').click())]);
  const fp=await dl.path(), txt=fs.readFileSync(fp,'utf8');
  check('⬇ CSV downloads a file named for the day, with that day\'s rows', dl.suggestedFilename()==='0xbeta-bets-2026-11-06.csv' && txt.split('\r\n').length===3, {name:dl.suggestedFilename(), lines:txt.split('\r\n').length});
  // Parlays: legs you already bet
  const T=await p.evaluate(()=>{ const row=o=>Object.assign({idx:90,kind:'prop',sport:'NHL',book:'Novig',side:'O',market:'2.5 Shots On Goal',name:'Sidney Crosby',team:'PIT',game:'PIT @ NYR'},o);
    const single={prior:{stake:1.5,book:'Kalshi'}};
    return { inParlay:pkBetTag({r:row({})}), single:pkBetTag({r:row(Object.assign({name:'Someone Else'},single))}), team:pkBetTag({r:row({kind:'moneyline',market:'Moneyline',side:'',name:'Oklahoma State Cowboys',team:'Oklahoma State Cowboys',
      gameInfo:{teams:[{ha:'away',abbr:'TTU',loc:'Texas Tech',nick:'Red Raiders',name:'Texas Tech'},{ha:'home',abbr:'OKST',loc:'Oklahoma State',nick:'Cowboys',name:'Oklahoma St'}]}})}),
      otherLine:pkBetTag({r:row({market:'3.5 Shots On Goal'})}), none:pkBetTag({r:row({name:'Nobody Here'})}) }; });
  check('a leg inside a logged parlay says "✓ you bet this: in your Novig parlay (2 picks)"', /✓ you bet this: in your Novig parlay \(2 picks\)/.test(T.inParlay), T.inParlay);
  check('a leg you hold as a single says "single $1.50 on Kalshi"', /✓ you bet this: single \$1\.50 on Kalshi/.test(T.single), T.single);
  check('a team leg ("Oklahoma State Cowboys") matches "Oklahoma State OKST Moneyline" in the parlay', /in your Novig parlay/.test(T.team), T.team);
  check('another line (3.5) or another player is not marked', T.otherLine==='' && T.none==='', {o:T.otherLine, n:T.none});
  // Send the Sentinels on a combo app
  const S=await p.evaluate(()=>{ pkState.app='Kalshi'; return pkSentHtml({},cfgRead(),'Kalshi'); });
  check('Send the Sentinels is on combo apps too (Kalshi)', /id="pkSentGo"/.test(S) && /Send the Sentinels/.test(S), S.slice(0,300));
  check('no page errors', !errs.length, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
