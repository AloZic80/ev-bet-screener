// node tests/v575-prophetx-card-test.js — v5.75 (owner 2026-11-28: "build NOW"): the ProphetX card on the control page (read only, from Worker v3.90).
const path=require('path'); const { chromium } = require('playwright'); const FILE='file://'+path.join(__dirname,'..','control.html');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+(ok?'':'  → '+JSON.stringify(got))); };
(async()=>{ const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:1280,height:900}}); const p=await ctx.newPage(); const errs=[], hits=[]; p.on('pageerror',e=>errs.push(String(e))); p.on('dialog',d=>d.dismiss());
  let mode='ok';
  await p.route(/api\.0xbeta\.dev\//,r=>{ const u=new URL(r.request().url()); const m=r.request().method(); let out={ok:true};
    if(/mine\/prophetx/.test(u.pathname)){ hits.push(m+' '+u.pathname); if(mode==='404') return r.fulfill({status:404,contentType:'application/json',body:'{}'});
      if(/selftest/.test(u.pathname)) out={version:'v3.90',counts:{orders:2},errors:{},balance:{balance:100},sample:{promo:{transaction_sub_type:'PROMOTION',amount:25,user_id:'SECRET-USER-ID',details:'SECRET-DETAILS'}}};
      else if(mode==='partial') out={balance:{available:100,matched:20,unmatched:3,credit:0},orders:[],open:[],fills:[],promos:[],errors:{orders:'ProphetX 401 nope'},calls:4};
      else out={balance:{available:100,matched:20,unmatched:3,credit:5},orders:[{},{}],open:[{}],fills:[{}],promos:[{at:Date.parse('2026-11-27T12:00:00Z'),amount:25,text:'Sign-up bonus'}],errors:{},calls:4}; }
    r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*','access-control-allow-headers':'*'},body:JSON.stringify(out)}); });
  await p.addInitScript(()=>{ localStorage.setItem('mbev.pass','pass1234'); localStorage.setItem('mbev.syncKey','abcdef'); localStorage.setItem('mbev.ctl.tab','all'); });
  await p.goto(FILE); await p.waitForTimeout(1200);
  check('nothing is asked of ProphetX until the button is pressed', hits.length===0, hits);
  await p.click('#pxGo'); await p.waitForTimeout(500);
  const t=await p.evaluate(()=>({sum:document.getElementById('pxSum').textContent,out:document.getElementById('pxOut').textContent,open:document.getElementById('pxBox').open}));
  check('the line says the cash and that all four answered, and the card opens', /\$100\.00 available/.test(t.sum) && /all four answered/.test(t.sum) && t.open, t);
  check('it lists cash, matched, held, credit, orders (1 open), fills and the bonus in words', /Cash available \$100\.00/.test(t.out) && /matched \$20\.00/.test(t.out) && /held for open orders \$3\.00/.test(t.out) && /Orders in the last 3 days: 2 \(1 still open\)/.test(t.out) && /fills: 1/.test(t.out) && /Bonus lines: \$25\.00/.test(t.out) && /Sign-up bonus/.test(t.out), t.out);
  check('only GET to the ProphetX page', hits.every(h=>/^GET /.test(h)), hits);
  await p.click('#pxRaw'); await p.waitForTimeout(500); check('the raw button opens the card so the answer is seen', await p.evaluate(()=>document.getElementById('pxBox').open && document.getElementById('pxPre').offsetHeight>0), 0);
  const raw=await p.evaluate(()=>({txt:document.getElementById('pxPre').textContent,copy:document.getElementById('pxCopy').style.display}));
  check('the raw answer shows, without the user id or details', /PROMOTION/.test(raw.txt) && !/SECRET-USER-ID|SECRET-DETAILS/.test(raw.txt) && raw.copy==='', raw);
  mode='partial'; await p.click('#pxGo'); await p.waitForTimeout(500);
  const t2=await p.evaluate(()=>({sum:document.getElementById('pxSum').textContent,out:document.getElementById('pxOut').textContent,cls:document.getElementById('pxSum').className}));
  check('when one list fails it says which, in plain words, and marks the line orange', /1 problem/.test(t2.sum) && t2.cls==='full' && /Could not read orders: ProphetX did not accept the keys/.test(t2.out), t2);
  mode='404'; await p.click('#pxGo'); await p.waitForTimeout(500);
  check('on an older Worker it says so plainly', /not on the Worker yet/.test(await p.evaluate(()=>document.getElementById('pxSum').textContent)), 0);
  check('no page errors', !errs.length, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0); })();
