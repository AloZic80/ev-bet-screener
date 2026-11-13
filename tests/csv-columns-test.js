// node tests/csv-columns-test.js — v4.67 (owner: "Yes to all", after the analysis of his CSV found no stat and no mode in it): the CSV keeps every old
// column in its place and adds five at the end: stat (a sacks bet said only "O 0.5"), mode (Safe / Feeling Lucky / Clairvoyant), source, the cover band
// and La Contadora's EV when the bet was taken (the "EV after fees %" column is the model's own).
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,700)); };
const NOW=Date.parse('2026-11-11T18:00:00Z'), H=3600e3, iso=ms=>new Date(ms).toISOString(), DAY='2026-11-11';
const bet=(id,o)=>Object.assign({id,key:id,sport:'NFL',kind:'prop',book:'Bovada',odds:'+225',stake:1.45,date:DAY,dateSet:true,game:'WSH @ NYG',name:'Player '+id,side:'O',market:'0.5 Defense Sacks',betnow:'O 0.5 +225',snap:{at:iso(NOW-5*H)},start:iso(NOW-4*H),result:'win',gradedBy:'manual'},o);
const LOG=[bet('sack',{name:'Montez Sweat',fair:'+191',srcType:'api',snap:{at:iso(NOW-5*H),actNet:0.0812}}),
  bet('lucky',{name:'Lucky One',market:'20.5 Points',sport:'NBA',fair:'-110',tier:'lucky',srcType:'api'}), bet('hail',{name:'Hail One',market:'Moneyline',kind:'moneyline',sport:'NBA',odds:'+471',fair:'+415',tier:'hail',srcType:'api'}),
  bet('hand',{name:'By Hand',market:'1.5 Shots on Goal',sport:'NHL',fair:'',manual:true}),
  {id:'pl1',key:'pl1',kind:'parlay',date:DAY,dateSet:true,start:null,name:'Parlay · 2 picks',sport:'PARLAY',market:'2-pick parlay',book:'Kalshi',odds:'+250',fair:'',stake:2,result:'pending',closing:'',parlay:{legs:'A; B',picks:2}}];
(async()=>{ const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:1280,height:900}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(L=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.log',JSON.stringify(L)); }catch(e){} }, LOG);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1300);
  const csv=await p.evaluate(()=>logCsv(''));
  const parse=line=>{ const out=[]; let cur='', q=false; for(let i=0;i<line.length;i++){ const ch=line[i]; if(q){ if(ch==='"'){ if(line[i+1]==='"'){ cur+='"'; i++; } else q=false; } else cur+=ch; } else if(ch==='"') q=true; else if(ch===','){ out.push(cur); cur=''; } else cur+=ch; } out.push(cur); return out; };
  const lines=csv.replace(/^﻿/,'').split('\r\n'), head=parse(lines[0]), rows=lines.slice(1).map(parse), col=(r,name)=>r[head.indexOf(name)], by=n=>rows.find(r=>col(r,'bet')===n);
  const OLD=['game day','placed','bet','pick','sport','type','book','odds','implied %','stake $','free bet','result','profit $','fair %','EV after fees %','closing','CLV %','game','kickoff (CT)','legs'];
  check('the old columns keep their places, and five come at the end: stat, mode, source, band, La Contadora EV %', OLD.every((h,i)=>head[i]===h) && head.slice(20,25).join('|')==='stat|mode (old)|source|band|La Contadora EV %' /* v4.86: mode keeps its meaning as "mode (old)" */   /* v4.68 adds four more after these (scope-v468-test) */, head);
  const s=by('Montez Sweat');
  check('the sacks bet now says what it was: stat "0.5 Defense Sacks", mode Safe, source API, band Unlikely (+191 = 100/291 = 34.4%), La Contadora EV 8.12', col(s,'stat')==='0.5 Defense Sacks' && col(s,'mode (old)')==='Safe' && col(s,'source')==='API' && col(s,'band')==='Unlikely' && col(s,'La Contadora EV %')==='8.12', s.slice(20));
  check('a just-missed bet says "Suertudo (just missed)" (−110 = 110/210 = 52.4%: On the Line); a Hail Mary says "Brujo (Hail Mary)" (+415 = 19.4%: Unlikely)', col(by('Lucky One'),'mode (old)')==='Suertudo (just missed)' && col(by('Hail One'),'mode (old)')==='Brujo (Hail Mary)' && col(by('Lucky One'),'band')==='On the Line' && col(by('Hail One'),'band')==='Unlikely', [by('Lucky One').slice(20), by('Hail One').slice(20)]);   /* v4.76: the tabs were renamed: Feeling Lucky is 🍀 Suertudo, Clairvoyant is 🔮 Brujo (approved bets still say "Safe" in the CSV) */
  check('a bet added by hand with no fair odds: source "by hand", band "no cover saved", no La Contadora EV', col(by('By Hand'),'source')==='by hand' && col(by('By Hand'),'band')==='no cover saved' && col(by('By Hand'),'La Contadora EV %')==='', by('By Hand').slice(20));
  check('a parlay leaves stat, mode and band empty', ['stat','mode (old)','band'].every(h=>col(by('Parlay · 2 picks'),h)===''), by('Parlay · 2 picks').slice(20));
  check('every row has as many columns as the header', rows.every(r=>r.length===head.length), rows.map(r=>r.length));
  check('no page errors', !errs.length, errs);
  await b.close(); console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(fail?1:0); })();
