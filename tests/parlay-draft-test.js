// node tests/parlay-draft-test.js — v4.37. Alonzo: "build" (Augi's screens, step 4: Parlay). Every entry card shows what it pays for each way it
// can finish, in dollars at the stake typed (Flex: Augi's partial return), with the chance of each, and has Copy draft (plain text: the picks,
// where they play, the stake, the payouts and chances; places nothing). Numbers checked by hand against the legs' chances.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const now=Date.now(), H=3600e3, iso=ms=>new Date(ms).toISOString(), day=new Date(now).toLocaleDateString('en-CA',{timeZone:'America/Chicago'});
const gi=(h,a,b)=>({state:'pre',startISO:iso(now+h*H),timeCT:'',detail:'',teams:[{ha:'away',abbr:a},{ha:'home',abbr:b}]});
const prop=(name,a,b,h,p)=>({name,game:a+' @ '+b,matchup:a+' @ '+b,side:'O',sport:'NBA',market:'24.5 Points',kind:'prop',book:'PrizePicks',offeredRaw:'-110',offeredProb:.524,
  fairProb:p,fairRaw:'-150',mktProb:p,stars:3,evModel:'projection',projValue:27,gameInfo:gi(h,a,b),src:'api:NBA:props',apiKey:name});
const BOARD=[prop('Leg One','AAA','BBB',20,0.60),prop('Leg Two','CCC','DDD',21,0.59),prop('Leg Three','EEE','FFF',22,0.585),prop('Leg Four','GGG','HHH',23,0.57)];
const dist=ps=>{ let d=[1]; ps.forEach(p=>{ const n=new Array(d.length+1).fill(0); d.forEach((v,k)=>{ n[k]+=v*(1-p); n[k+1]+=v*p; }); d=n; }); return d; };
const pc=x=>(x*100).toFixed(1)+'%';
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago', viewport:{width:1280,height:1000}, permissions:['clipboard-read','clipboard-write']});
  await ctx.addInitScript(([rows,d])=>{ try{ if(sessionStorage.getItem('seeded')) return; sessionStorage.setItem('seeded','1'); localStorage.clear();
    localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows})); }catch(e){} }, [BOARD,day]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/espn\.com.*scoreboard/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1200);
  await p.click('.tab[data-view="v-parlay"]'); await p.waitForTimeout(400);
  await p.evaluate(()=>{ pkState.app='PrizePicks'; pkState.play='power'; pkState.minP=0.5; pkState.oneGame=true; renderParlays(); });
  for(const k of ['leg one|points','leg two|points','leg three|points','leg four|points']){ await p.check('.pk-pick[data-k="'+k+'"]'); await p.waitForTimeout(60); }
  const D=dist([.6,.59,.585,.57]);
  const rows=()=>p.evaluate(()=>[...document.querySelectorAll('#pkMine .pk-ret tr')].map(tr=>[...tr.children].map(td=>td.innerText.trim()).join('|')));
  await p.fill('#pkMine .pk-stake','5'); await p.waitForTimeout(100);
  let R=await rows();
  check('Power 4 picks at $5: all 4 hit pays 10x = $50.00, '+pc(D[4])+' of the time; anything less $0', R.length===2 && R[0]==='All 4 hit|10x|$50.00|'+pc(D[4]) && R[1]==='Less than that|0x|$0.00|'+pc(1-D[4]), R);
  await p.fill('#pkMine .pk-stake','2'); await p.waitForTimeout(100); R=await rows();
  check('the dollars follow the stake you type ($2 → $20.00)', R[0]==='All 4 hit|10x|$20.00|'+pc(D[4]), R[0]);
  await p.click('#pkPlay button[data-v="flex"]'); await p.waitForTimeout(250);
  await p.fill('#pkMine .pk-stake','5'); await p.waitForTimeout(100); R=await rows();
  check('Flex 4 picks at $5: all hit 5x $25.00, 3 of 4 1.5x $7.50 (the partial return), with the chance of each', R.length===3 && R[0]==='All 4 hit|5x|$25.00|'+pc(D[4]) && R[1]==='3 of 4 hit|1.5x|$7.50|'+pc(D[3]) && R[2]==='Less than that|0x|$0.00|'+pc(1-D[4]-D[3]), R);
  await p.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true, value:{writeText:t=>{ window._clip=t; return Promise.resolve(); }}}));   // the test page is not https, so it has no clipboard: catch what is written
  await p.click('#pkMine .pk-copy'); await p.waitForTimeout(300);
  const clip=await p.evaluate(()=>window._clip||''), btn=await p.textContent('#pkMine .pk-copy'), msg=await p.textContent('#pkMsg');
  const L=clip.split('\n');
  check('Copy draft: the app, Flex, 4 picks, and "check every line" on the first line', L[0]==='PrizePicks · Flex · 4 picks · draft (check every line in the app)', L[0]);
  check('each pick with its line, chance and where it plays', /^1\. Leg One Over 24\.5 Pts( -110)? — 60\.0% to hit · NBA/.test(L[1]) && /AAA @ BBB|AAA/.test(L[1]) && L.filter(x=>/^\d\. /.test(x)).length===4, L.slice(1,5));
  check('the stake and each payout with its chance', L.includes('Stake $5.00') && L.includes('All 4 hit: $25.00 (5x, '+pc(D[4])+' of the time)') && L.includes('3 of 4 hit: $7.50 (1.5x, '+pc(D[3])+' of the time)'), L.slice(5));
  check('it says nothing is placed', /^Not placed\. Place it in the app, then press Log this entry\.$/.test(L[L.length-1]) && /Expected return [+−]\d/.test(L[L.length-2]), L.slice(-2));
  check('the button says Copied and the note says nothing is placed', btn==='✓ Copied' && /Nothing is placed/.test(msg), {btn,msg});
  check('copying logs nothing', await p.evaluate(()=>logged.length)===0, null);
  // the copy is blocked (some in-app browsers): the draft shows in a box to copy by hand
  await p.evaluate(()=>{ navigator.clipboard.writeText=()=>Promise.reject(new Error('blocked')); document.execCommand=()=>false; });
  await p.click('#pkMine .pk-copy'); await p.waitForTimeout(300);
  const box=await p.evaluate(()=>{ const t=document.querySelector('#pkMine .pk-draft'); return t?{v:t.value.split('\n')[0], ro:t.readOnly}:null; });
  check('copy blocked: the draft shows in a read-only box to copy by hand, and the note says so', box && box.ro && /^PrizePicks · Flex/.test(box.v) && /blocked/.test(await p.textContent('#pkMsg')), box);
  check('the best-entry cards have the payout table and Copy draft too', await p.evaluate(()=>[...document.querySelectorAll('#pkCards .pk-card:not(.empty)')].every(c=>c.querySelector('.pk-ret') && c.querySelector('.pk-copy'))), null);
  check('no page errors', !errs.length, errs);
  // phone: the table fits the card
  await p.setViewportSize({width:390,height:900}); await p.waitForTimeout(300);
  const fit=await p.evaluate(()=>({sw:document.documentElement.scrollWidth, t:document.querySelector('#pkMine .pk-ret').getBoundingClientRect().right, c:document.querySelector('#pkMine .pk-card').getBoundingClientRect().right}));
  check('phone (390): the payout table fits inside the card, no sideways scroll', fit.sw<=390 && fit.t<=fit.c+1, fit);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
