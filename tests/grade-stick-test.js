// node tests/grade-stick-test.js — v3.93. Alonzo: "Why do I keep getting that one back when I already graded it?" (Saquon Barkley
// Over 53.5 Rush Yds, Novig, $5.00, Sun 11/1, back in Look out). A result you set is kept on its own and put back: on the same bet
// if its result was lost (an old copy from sync, a failed save), and on a second copy of the same bet.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const SAQ={id:'sq1',key:'sq1',sport:'NFL',kind:'prop',book:'Novig',odds:'+120',stake:5,date:'2026-11-01',dateSet:true,manual:true,game:'PHI @ WSH',name:'Saquon Barkley',side:'O',market:'53.5 Rushing Yards',betnow:'O 53.5 +120',snap:{at:'2026-11-01T15:00:00Z'}};
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago', viewport:{width:1400,height:1000}});
  await ctx.addInitScript(L=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.log',JSON.stringify(L)); }catch(e){} }, [SAQ]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1200); await p.click('.tab[data-view="v-log"]'); await p.waitForTimeout(300);
  const look=()=>p.evaluate(()=>({n:document.querySelectorAll('#lookOut .lo-row').length, r:logged.map(x=>x.id+':'+(x.result||'-')).join(' ')}));
  check('Saquon is in Look out (game day passed, no result)', (await look()).n===1, await look());
  await p.click('#lookOut .lo-res[data-res="win"]'); await p.waitForTimeout(300);
  check('Won: it leaves Look out', (await look()).n===0, await look());
  // the result goes missing (an older copy of the bet from another device, a save that did not land) and a second copy appears
  await p.evaluate(()=>{ const L=JSON.parse(localStorage.getItem('mbev.log')); delete L[0].result; delete L[0].gradedBy; delete L[0].resultSrc;
    L.push(Object.assign({},L[0],{id:'sq2',key:'sq2'})); localStorage.setItem('mbev.log',JSON.stringify(L)); });
  await p.reload(); await p.waitForTimeout(1200); await p.click('.tab[data-view="v-log"]'); await p.waitForTimeout(300);
  const a=await look();
  check('after a reload with the result lost and a second copy: both are Won, nothing in Look out', a.n===0 && a.r==='sq1:win sq2:win', a);
  check('Check results again keeps it', await (async()=>{ await p.click('#checkResults'); await p.waitForTimeout(1200); const x=await look(); return x.n===0 && x.r==='sq1:win sq2:win'; })(), await look());
  // Clear in the editor forgets it, so you can change your mind
  const i=await p.evaluate(()=>logged.findIndex(x=>x.id==='sq1'));
  await p.evaluate(i=>document.querySelector('#logBody button.kill.edit[data-i="'+i+'"]').click(), i); await p.waitForTimeout(300);   // its day may be folded
  const clr=await p.$('#logBody tr.editor button.eb-clear');
  if(clr){ await p.evaluate(()=>document.querySelector('#logBody tr.editor button.eb-clear').click()); await p.waitForTimeout(300); }
  check('Clear in the editor: that bet is back to no result and stays so', !!clr && await p.evaluate(()=>!logged.find(x=>x.id==='sq1').result), await look());
  check('no page errors', !errs.length, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
