// node tests/v541-math-test.js — v5.41, Hands-Free Stage 1 (owner 2026-11-26: "start building all the way till you get the Hands Free Stage 1. i want to test it already"): the "Check the Worker's math" button in the Autopilot card.
// It sends the board's priced rows to the Worker's /contadora/score with this page's own settings and compares every number (chance, fee, EV, OK up to, Kelly) with the page's own functions. Agreement says so with the count; one different number is named;
// no board, sync off, a Worker without the route (404) and a locked Worker each say what to do. It sends no passphrase or key in the body, and places and saves nothing. (The math itself is proven in the Worker repo against 6,000 vectors from this page's functions.) No page errors.
const L=require('./v527-jarvis-lib.js'); const {chromium,check,open,ev,safe}=L;
(async()=>{ const b=await chromium.launch(); const X=await open(b,1280); let mode='agree', tamper=null, posts=[];
  await X.p.route(/api\.0xbeta\.dev\/contadora\/score/,async r=>{ const q=r.request(), cors={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'GET,POST,OPTIONS'};
    if(q.method()==='OPTIONS') return r.fulfill({status:204,headers:cors}); const body=JSON.parse(q.postData()||'{}'); posts.push({body, headers:q.headers()});
    if(mode==='404') return r.fulfill({status:404,headers:cors,contentType:'application/json',body:'{}'}); if(mode==='401') return r.fulfill({status:401,headers:cors,contentType:'application/json',body:'{"error":"locked"}'});
    const results=await X.p.evaluate((rows)=>rows.map((x,i)=>{ const cfg=cfgRead(), p=okProb(x.model,x.market), fee=feeRate(x.book,x.price,cfg.fees,false), net=actNetOf(x.model,x.market,x.price,fee), mx=p==null?null:maxPriceFor(p,x.book,cfg.eMin), k=net==null?null:kellyFor(cfg,net,x.price); return {id:x.id, actProb:p, fee, net, okUpTo:mx, kelly:k}; }), body.rows);
    if(tamper!=null) results[tamper].net=(results[tamper].net||0)+0.01;
    r.fulfill({status:200,headers:cors,contentType:'application/json',body:JSON.stringify({ok:true,n:results.length,results})}); });
  await safe('math check', async()=>{
    await ev(X.p,()=>{ document.querySelector('.tab[data-view="v-settings"]').click(); const d=document.getElementById('apPanel'); if(d) d.open=true; });
    await X.p.waitForTimeout(300);
    await ev(X.p,()=>{ lastRows=[]; }); await X.p.click('#apMathBtn'); await X.p.waitForTimeout(200); check('with nothing on the board it says to press Load', /no priced rows/i.test(await X.p.textContent('#apMath')), await X.p.textContent('#apMath'));
    await ev(X.p,()=>{ lastRows=[{name:'A over', fairProb:0.5546, mktProb:0.526, offeredProb:108/208, book:'Novig'},{name:'B under', fairProb:0.6, mktProb:null, offeredProb:0.55, book:'Kalshi'},{name:'C ml', fairProb:0.41, mktProb:0.45, offeredProb:0.4, book:'FanDuel Predicts'},{name:'bad', fairProb:null, offeredProb:0.5, book:'Novig'}]; SY=null; });
    await X.p.click('#apMathBtn'); await X.p.waitForTimeout(200); check('with sync off it says to turn sync on (and calls nothing)', /Sync is off/.test(await X.p.textContent('#apMath')) && posts.length===0, await X.p.textContent('#apMath'));
    await ev(X.p,()=>{ SY={on:true, key:'SYNCKEYSECRET', meta:{}}; });
    posts=[]; mode='agree'; tamper=null; await X.p.click('#apMathBtn'); await X.p.waitForTimeout(800); const t=await X.p.textContent('#apMath');
    check('when the Worker gives the same numbers it says so, with the count (3 priced rows; the row with no model is left out)', /agrees with this page on 3 of 3 board rows/.test(t) && /Nothing was placed or saved/.test(t), t);
    const p=posts[0]; check('only the settings and the rows go in the body (no passphrase, no sync key), each row with id, model, market, price, book and live false', p && Object.keys(p.body).sort().join()==='cfg,rows' && p.body.rows.length===3 && p.body.rows[0].model===0.5546 && p.body.rows[1].market===null && p.body.rows[0].live===false && !/SYNCKEYSECRET|pass/i.test(JSON.stringify(p.body)) && p.body.cfg.mWeight>=0 && p.body.cfg.fees && 'kalshi' in p.body.cfg.fees, p && p.body);
    posts=[]; tamper=1; await X.p.click('#apMathBtn'); await X.p.waitForTimeout(800); const d=await X.p.textContent('#apMath'); check('one different number is named: "disagree on 1 of 3", the row and which number', /disagree on 1 of 3 rows/.test(d) && /B under/.test(d) && /EV/.test(d), d); tamper=null;
    mode='404'; await X.p.click('#apMathBtn'); await X.p.waitForTimeout(500); check('a Worker without the route says so', /does not have the math route yet/.test(await X.p.textContent('#apMath')), await X.p.textContent('#apMath'));
    mode='401'; await X.p.click('#apMathBtn'); await X.p.waitForTimeout(500); check('a locked Worker says to check the passphrase and sync password', /locked/.test(await X.p.textContent('#apMath')), await X.p.textContent('#apMath'));
    check('the button never places a bet: no call to /autobet was made', !posts.some(x=>/autobet/.test(JSON.stringify(x))), null);
  });
  check('no page errors', X.errs.length===0, X.errs.slice(0,3));
  await b.close(); const r=L.res(); console.log('\n'+r.pass+' passed, '+r.fail+' failed'); process.exit(r.fail?1:0); })();
