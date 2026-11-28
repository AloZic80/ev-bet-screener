// node tests/v571-props-card-test.js — v5.71 (owner 2026-11-27: "Build Stage B and need to setup the limits"): the props that pass La Contadora (report only) and the limits for them, on the control page.
const path=require('path'); const { chromium } = require('playwright'); const FILE='file://'+path.join(__dirname,'..','control.html');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+(ok?'':'  → '+JSON.stringify(got))); };
(async()=>{ const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:1280,height:900}}); const p=await ctx.newPage(); const errs=[], posts=[]; p.on('pageerror',e=>errs.push(String(e))); p.on('dialog',d=>d.accept());
  const NOW=Date.now(); let mode='ok'; let L={on:true,floor:0.03,ceiling:0.12,priceMin:0.15,priceMax:0.85,maxPerDay:5,quietFrom:22,quietTo:8,sports:['NFL','NBA'],books:['Novig','Kalshi'],bank:0,kelly:0.25,shrink:0.5,sMax:5,mWeight:0.35,maxAgeH:6,fees:{}};
  await p.route(/api\.0xbeta\.dev\//,r=>{ const u=new URL(r.request().url()); let out={ok:true}; const m=r.request().method();
    if(/props-screen\/list/.test(u.pathname)) out=mode==='404'?null:{ok:true,report_only:true,on:true,day:'2026-11-27',alerted:2,maxPerDay:5,lastRun:new Date(NOW-120000).toISOString(),screened:150,loads:[{sport:'NFL',at:NOW,n:100},{sport:'NBA',at:NOW,n:50}],
      picks:[{key:'a',sport:'NFL',player:'Max Hurleman',game:'DEN @ PIT',market:'0.5 Rec Yds',side:'O',book:'Novig',odds:-108,net:0.093,okUpToOdds:-123,stake:3.2,at:NOW-60000},{key:'b',sport:'NBA',player:'Jalen Smith',game:'IND @ BOS',market:'5.5 Rebounds',side:'U',book:'Kalshi',odds:122,net:0.051,okUpToOdds:110,stake:null,at:NOW-30000}],why:{'EV under your floor':90,'not a book you bet':40,'price outside 15 to 85%':3}};
    if(/props-screen\/limits/.test(u.pathname)){ if(m==='POST'){ posts.push(r.request().postData()); L={...L,...JSON.parse(r.request().postData()).limits}; } out={ok:true,limits:L}; }
    if(/props-screen\/run/.test(u.pathname)){ posts.push('run'); out={ok:true,added:1,alerted:1}; }
    if(out===null) return r.fulfill({status:404,contentType:'application/json',body:'{}'});
    r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*','access-control-allow-headers':'*'},body:JSON.stringify(out)}); });
  await p.addInitScript(()=>{ localStorage.setItem('mbev.pass','pass1234'); localStorage.setItem('mbev.syncKey','abcdef'); localStorage.setItem('mbev.ctl.tab','all'); });
  await p.goto(FILE); await p.waitForTimeout(1300);
  const sum=await p.evaluate(()=>document.getElementById('psSum').textContent);
  check('the closed line shows how many pass today, the alerts used of the daily limit and when it last screened', /Props · 2 pass today · alerts 2 of 5 · last screened/.test(sum), sum);
  await p.evaluate(()=>{ document.getElementById('psBox').open=true; document.getElementById('psLim').open=true; });
  const t=await p.evaluate(()=>document.getElementById('psList').innerText);
  check('each pass shows the player, side, market, sport, book, odds, the edge and the price to type (or better, up to the OK up to price)', /Max Hurleman Over 0\.5 Rec Yds · NFL · Novig -108 · edge \+9\.3% · type -108 or better, up to -123/.test(t) && /Jalen Smith Under 5\.5 Rebounds · NBA · Kalshi \+122 · edge \+5\.1% · type \+122 or better, up to \+110/.test(t), t);
  check('the stake appears only when La Contadora sized one (bankroll set), the game is shown and the time it was listed', /stake about \$3\.20/.test(t) && !/Jalen Smith[^\n]*stake/.test(t) && /DEN @ PIT · listed/.test(t), t);
  check('it says why the rest were turned down, biggest first', /Turned down: 90 EV under your floor · 40 not a book you bet · 3 price outside 15 to 85%/.test(t), t);
  const f=await p.evaluate(()=>({floor:document.getElementById('ps-floor').value,ceil:document.getElementById('ps-ceiling').value,pmin:document.getElementById('ps-priceMin').value,alerts:document.getElementById('ps-maxPerDay').value,sports:document.getElementById('ps-sports').value,books:document.getElementById('ps-books').value,on:document.getElementById('ps-on').checked,bank:document.getElementById('ps-bank').value}));
  check('the limits form shows the Worker\'s values in plain units (3 for 3%, 15 for 15%) with the sports and books lists', f.floor==='3' && f.ceil==='12' && f.pmin==='15' && f.alerts==='5' && f.sports==='NFL, NBA' && f.books==='Novig, Kalshi' && f.on===true && f.bank==='0', f);
  await p.fill('#ps-floor','5'); await p.fill('#ps-bank','800'); await p.fill('#ps-books','Novig, Kalshi, ProphetX'); await p.click('#psSave'); await p.waitForTimeout(500);
  const sent=JSON.parse(posts.find(x=>/limits/.test(x||'')||/floor/.test(x||''))||'{}').limits||{};
  check('Save sends the values back in the Worker\'s units (0.05, 800, the three books) after a confirm', sent.floor===0.05 && sent.bank===800 && sent.books.join()==='Novig,Kalshi,ProphetX' && sent.on===true, sent);
  await p.click('#psRun'); await p.waitForTimeout(400); check('Screen now asks the Worker once', posts.filter(x=>x==='run').length===1, posts);
  mode='404'; await p.reload(); await p.waitForTimeout(1000); check('on an older Worker the card says so plainly', /not on the Worker yet/.test(await p.evaluate(()=>document.getElementById('psSum').textContent)), 0);
  check('no page errors', !errs.length, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0); })();
