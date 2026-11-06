// node tests/edit-date-test.js — editing a saved bet can fix its game day (v3.88). Alonzo: "when I edit, it gives me the date,
// but if I mess up and want to edit, it doesn't allow me to edit the date again."
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const CT=ms=>new Date(ms).toLocaleDateString('en-CA',{timeZone:'America/Chicago'}), now=Date.now(), D=86400e3;
const D1=CT(now+2*D), D2=CT(now+3*D);   // a game two days out, typed with the wrong day; it is really the next day
const at=(d,h)=>new Date(d+'T'+String(h).padStart(2,'0')+':00:00-06:00').toISOString();
const LOG=[
  {id:'t1',key:'t1',sport:'NBA',kind:'moneyline',book:'FanDuel',odds:'-110',stake:10,date:D1,dateSet:true,manual:true,game:'SAC @ UTAH',name:'SAC',team:'SAC',market:'Moneyline',betnow:'SAC ML',snap:{at:new Date(now).toISOString()}},   // typed game, no start time
  {id:'t2',key:'t2',sport:'NBA',kind:'moneyline',book:'FanDuel',odds:'+120',stake:5,date:D1,game:'LAL @ BOS',name:'BOS',team:'BOS',market:'Moneyline',betnow:'BOS ML',start:at(D1,19),snap:{at:new Date(now).toISOString()}}];   // with a start time
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago', viewport:{width:1400,height:1000}});
  await ctx.addInitScript(L=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.log',JSON.stringify(L)); }catch(e){} }, LOG);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1200); await p.click('.tab[data-view="v-log"]'); await p.waitForTimeout(300);
  for(const id of ['t1','t2']){
    const i=await p.evaluate(id=>logged.findIndex(x=>x.id===id), id);
    await p.click('#logBody button.kill.edit[data-i="'+i+'"]'); await p.waitForTimeout(300);
    const shown=await p.$eval('#logBody tr.editor .eb-date', x=>x.value);
    check(id+': the editor shows its game day', shown===D1, shown);
    await p.fill('#logBody tr.editor .eb-date', D2);
    await p.click('#logBody tr.editor .eb-save'); await p.waitForTimeout(400);
  }
  const r=await p.evaluate(()=>logged.map(x=>({id:x.id, date:x.date, day:gameDayOf(x), start:x.start||null, edits:(x.edits||[]).length})));
  check('a typed game moves to the new day', r[0].day===D2 && r[0].date===D2, r[0]);
  check('a game with a start time keeps its kickoff time on the new day (7:00 PM)', r[1].day===D2 && new Date(r[1].start).toLocaleTimeString('en-US',{timeZone:'America/Chicago',hour:'numeric',minute:'2-digit'})==='7:00 PM', r[1]);
  check('each change is kept in the bet\'s edit history', r.every(x=>x.edits===1), r.map(x=>x.edits));
  const days=await p.$$eval('#logBody .log-day-btn',x=>x.map(y=>y.dataset.day));
  check('the Bet log lists them under the new day', days.includes(D2) && !days.includes(D1), days);
  await p.reload(); await p.waitForTimeout(1200);
  check('the new day survives a reload', await p.evaluate(d=>logged.every(x=>gameDayOf(x)===d), D2), true);
  check('no page errors', !errs.length, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
