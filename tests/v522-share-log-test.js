// node tests/v522-share-log-test.js — v5.22 (owner 11/18: "you should be able to look at the bets as well ... Build what you need to get it done").
// Bet log › More › "📤 Send my log to El Capataz": POSTs a copy of the log (notes left out) to the Worker's /share with the passphrase header,
// shows the code to paste and a Copy button; a refusal or an old Worker says so calmly; the log itself is unchanged.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,500)); };
const LOG=[{id:'b1', kind:'prop', name:'Player One', market:'Points', side:'O', line:20.5, book:'Novig', stake:2, odds:'-120', result:'win', notes:'private note'}, {id:'b2', kind:'prop', name:'Player Two', market:'Rebounds', side:'U', line:8.5, book:'Kalshi', stake:3, odds:'+105', result:null}];
const CODE='a'.repeat(64);
(async()=>{ const b=await chromium.launch(); const errs=[];
  for(const [label,answer] of [['ok',{status:200, body:{ok:true, code:CODE, count:2, at:'x', expires:'y'}}],['locked',{status:401, body:{ok:false, error:'locked'}}],['old',{status:404, body:{error:'not found'}}]]){
    for(const W of (label==='ok'?[390,1280]:[1280])){
      const ctx=await b.newContext({timezoneId:'America/Chicago', viewport:{width:W,height:900}});
      await ctx.addInitScript(([L])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.mode',JSON.stringify({mode:'safe'})); localStorage.setItem('mbev.pass','test-pass'); localStorage.setItem('mbev.log',JSON.stringify(L)); }catch(e){} },[LOG]);
      const p=await ctx.newPage(); p.on('pageerror',e=>errs.push(label+' '+W+': '+e.message)); let sent=null;
      await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
        if(/\/share$/.test(u) && r.request().method()==='POST'){ sent={headers:r.request().headers(), body:JSON.parse(r.request().postData()||'{}')}; return r.fulfill({status:answer.status, contentType:'application/json', body:JSON.stringify(answer.body)}); }
        if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
      await p.goto('http://app.test/'); await p.waitForTimeout(1200);
      await p.evaluate(()=>{ const d=document.getElementById('shareLog').closest('details'); if(d) d.open=true; document.getElementById('shareLog').click(); }); await p.waitForTimeout(800);
      const R=await p.evaluate(()=>({st:document.getElementById('shareStatus').textContent, copy:(()=>{ const c=document.getElementById('shareCopy'); if(!c) return null; return {h:parseFloat(getComputedStyle(c).minHeight)||0}; })(), log:JSON.parse(localStorage.getItem('mbev.log')||'[]')}));
      if(label==='ok'){
        check(W+' px: it sends the log with the passphrase header and the app version', !!sent && sent.headers['x-screener-pass']==='test-pass' && Array.isArray(sent.body.rows) && sent.body.rows.length===2 && /^v\d/.test(sent.body.app), sent&&{h:sent.headers['x-screener-pass'], n:sent.body.rows.length, app:sent.body.app});
        check(W+' px: free-text notes are left out of the copy; the bet fields stay', !!sent && !('notes' in sent.body.rows[0]) && sent.body.rows[0].name==='Player One' && sent.body.rows[0].odds==='-120', sent&&sent.body.rows[0]);
        check(W+' px: it shows "Sent 2 bets" and the line to paste with the code', /Sent 2 bets/.test(R.st) && R.st.includes('El Capataz, read my log: '+'a'.repeat(64)), R.st);
        check(W+' px: the Copy button is at least 44 px tall', R.copy && R.copy.h>=44, R.copy);
        check(W+' px: the saved log is unchanged (the note is still there)', R.log.length===2 && R.log[0].notes==='private note', R.log[0]);
      } else if(label==='locked'){
        check('a wrong passphrase: "Not sent: the Worker did not accept the passphrase", no code shown', /did not accept the passphrase/.test(R.st) && !/read my log/.test(R.st), R.st);
      } else {
        check('a Worker without /share yet: says it needs the v3.48 update', /needs the v3\.48 update/.test(R.st), R.st);
      }
      await ctx.close(); } }
  check('no page errors', !errs.length, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
