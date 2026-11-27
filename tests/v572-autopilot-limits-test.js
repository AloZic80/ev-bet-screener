// node tests/v572-autopilot-limits-test.js — v5.72 (owner 2026-11-27: "i want to be able to change myself manually"): the Autopilot limits card.
const path=require('path'); const { chromium } = require('playwright'); const FILE='file://'+path.join(__dirname,'..','control.html');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+(ok?'':'  → '+JSON.stringify(got))); };
(async()=>{ const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:1280,height:900}}); const p=await ctx.newPage(); const errs=[], posts=[], dialogs=[]; p.on('pageerror',e=>errs.push(String(e))); p.on('dialog',d=>{ dialogs.push(d.message()); d.accept(); });
  const NOW=Date.now(); let mode='ok', now={daily:10,order:1}, pend=[];
  await p.route(/api\.0xbeta\.dev\//,r=>{ const u=new URL(r.request().url()); let out={ok:true}; const m=r.request().method();
    if(/autopilot\/limits/.test(u.pathname)){ if(mode==='404') return r.fulfill({status:404,contentType:'application/json',body:'{}'});
      if(m==='POST'){ const bd=JSON.parse(r.request().postData()); posts.push(bd); const ch=[]; if(bd.daily!=null){ if(bd.daily>now.daily){ pend.push({field:'daily',to:bd.daily,from:new Date(NOW+8*3600e3).toISOString()}); ch.push('daily budget $'+now.daily+' → $'+bd.daily+' (from midnight Chicago)'); } else { ch.push('daily budget $'+now.daily+' → $'+bd.daily+' (at once)'); now.daily=bd.daily; } } out={ok:true,changed:ch}; }
      out=Object.assign({ok:true,now:now,pending:pend,ceiling:{daily:25,order:5},floor:{daily:1,order:1},usingDefaults:false,log:[{at:new Date(NOW-60000).toISOString(),device:'Control page',change:'order size $1 → $1 (at once)'}]},out,{ok:true}); }
    r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*','access-control-allow-headers':'*'},body:JSON.stringify(out)}); });
  await p.addInitScript(()=>{ localStorage.setItem('mbev.pass','pass1234'); localStorage.setItem('mbev.syncKey','abcdef'); localStorage.setItem('mbev.ctl.tab','all'); });
  await p.goto(FILE); await p.waitForTimeout(1300); await p.evaluate(()=>{ document.getElementById('apLBox').open=true; });
  let sum=await p.evaluate(()=>document.getElementById('apLSum').textContent), body=await p.evaluate(()=>document.getElementById('apLNow').textContent);
  check('the closed line shows what is in force', /Limits · \$10 a day · \$1 an order/.test(sum), sum);
  check('the card says what is in force, and the rails (ceiling $25 a day, $5 an order, floor $1)', /In force now: \$10 a day and \$1 for each order/.test(body) && /never allow more than \$25 a day or \$5 an order/.test(await p.evaluate(()=>document.getElementById('apLRails').textContent)), body);
  check('the change log shows what changed, when and from which device', /Control page · order size \$1 → \$1/.test(await p.evaluate(()=>document.getElementById('apLLog').textContent)), 0);
  await p.fill('#apLDaily','6'); await p.click('#apLSave'); await p.waitForTimeout(500);
  check('LOWERING asks first, showing the change and "(at once)", then sends only what changed', dialogs.length===1 && /Daily budget \$10 → \$6 \(at once\)/.test(dialogs[0]) && !/One order/.test(dialogs[0]) && posts.length===1 && posts[0].daily===6 && posts[0].order===undefined, [dialogs,posts]);
  check('and the line now shows $6 a day', /\$6 a day/.test(await p.evaluate(()=>document.getElementById('apLSum').textContent)), await p.evaluate(()=>document.getElementById('apLSum').textContent));
  await p.fill('#apLDaily','20'); await p.click('#apLSave'); await p.waitForTimeout(500);
  check('RAISING says "(from midnight Chicago)" in the confirm', /Daily budget \$6 → \$20 \(from midnight Chicago\)/.test(dialogs[1]||''), dialogs);
  const t2=await p.evaluate(()=>({sum:document.getElementById('apLSum').textContent,cls:document.getElementById('apLSum').className,now:document.getElementById('apLNow').textContent}));
  check('then the card says a raise is waiting for midnight (orange), what is in force is unchanged, and when it starts', /a raise is waiting for midnight/.test(t2.sum) && t2.cls==='full' && /\$6 a day/.test(t2.now) && /Waiting: daily budget → \$20 from/.test(t2.now), t2);
  dialogs.length=0; posts.length=0; await p.click('#apLSave'); await p.waitForTimeout(300); check('saving with nothing changed says so and asks nothing', dialogs.length===0 && posts.length===0 && /Nothing changed/.test(await p.evaluate(()=>document.getElementById('apLMsg').textContent)), 0);
  mode='404'; await p.reload(); await p.waitForTimeout(1000); check('on an older Worker the card says so plainly', /not on the Worker yet/.test(await p.evaluate(()=>document.getElementById('apLSum').textContent)), 0);
  check('no page errors', !errs.length, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0); })();
