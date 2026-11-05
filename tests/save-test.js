// node tests/save-test.js — the bet log is never lost in silence (v3.82). With the browser's storage full, a result set in
// Look out is still saved (the app's own caches make room) and survives a reload; if nothing can make room, a red note says so.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const at=(d,h)=>new Date(d+'T'+String(h).padStart(2,'0')+':00:00-05:00').toISOString();
const bet=(id,o)=>Object.assign({id,key:id,sport:'NBA',kind:'moneyline',book:'Novig',odds:'-110',stake:10,date:'2026-10-31',game:'LAL @ BOS',name:'BOS',team:'BOS',market:'Moneyline',betnow:'BOS ML',start:at('2026-10-31',18),snap:{at:at('2026-10-31',12)}},o);
const LOG=[bet('n1'), bet('n2',{name:'LAL',team:'LAL',betnow:'LAL ML'}), bet('n3',{game:'NY @ MIA',name:'MIA',team:'MIA',betnow:'MIA ML'})];
async function run(fillKey){
  const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago'});
  await ctx.addInitScript(([L,k])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.log',JSON.stringify(L));
    let n=0; for(const size of [256*1024, 4096, 64]){ const chunk='x'.repeat(size); try{ for(let i=0;i<400;i++) localStorage.setItem(k+(n++?'.'+n:''), chunk); }catch(e){} }   // fill the storage to the brim
    }catch(e){} }, [LOG, fillKey]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1500); await p.click('.tab[data-view="v-log"]'); await p.waitForTimeout(300);
  for(const r of ['win','win','push']){ await p.click('#lookOut .lo-res[data-res="'+r+'"]'); await p.waitForTimeout(250); }
  const note=await p.evaluate(()=>(document.getElementById('saveFail')||{}).textContent||'');
  await p.reload(); await p.waitForTimeout(1500);
  const after=await p.evaluate(()=>({res:logged.map(x=>x.result||'-').join(','), look:document.querySelectorAll('#lookOut .lo-row').length}));
  await b.close(); return {note, after, errs};
}
(async()=>{
  // storage full of the app's own rosters cache (as a phone can end up)
  let R=await run('mbev.rosters');
  check('storage full of caches: Won, Won, Push are still saved and survive a reload', R.after.res==='win,win,push' && R.after.look===0 && !R.note, R);
  // v3.83: From your books, Ignore with the storage full: it stays ignored after a reload
  { const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago'});
    await ctx.addInitScript(()=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear();
      localStorage.setItem('mbev.fillPending',JSON.stringify([{book:'novig',id:'f1',price:.5,qty:10,cost:5,fee:0,ts:Date.now()-86400e3,bet:{name:'BOS',stat:'Moneyline'}},{book:'novig',id:'f2',price:.5,qty:10,cost:5,fee:0,ts:Date.now()-86400e3,bet:{name:'LAL',stat:'Moneyline'}}]));
      let n=0; for(const size of [256*1024, 4096, 64]){ const chunk='x'.repeat(size); try{ for(let i=0;i<400;i++) localStorage.setItem('mbev.rosters'+(n++?'.'+n:''), chunk); }catch(e){} } }catch(e){} });
    const p=await ctx.newPage(); await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
    await p.goto('http://app.test/'); await p.waitForTimeout(1500);
    const before=await p.evaluate(()=>fillPending.length);
    const clicked=await p.evaluate(()=>{ renderFromBooks(); const b=document.querySelector('#fromBooks .fb-ign'); if(b) b.click(); return !!b; }); await p.waitForTimeout(300);
    await p.reload(); await p.waitForTimeout(1500);
    const after=await p.evaluate(()=>fillPending.length); await b.close();
    check('v3.83: From your books, Ignore with the storage full is kept after a reload', clicked && before===2 && after===1, {clicked, before, after}); }
  // storage full of something the app may not delete
  R=await run('somethingelse');
  check('storage full and nothing to free: a red note says the log could not be saved', /could not be saved on this device/.test(R.note), R.note.slice(0,90));
  check('no page errors', !R.errs.length, R.errs);
  console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail?1:0);
})();
