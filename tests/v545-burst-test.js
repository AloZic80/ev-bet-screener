// node tests/v545-burst-test.js — v5.45 (owner 2026-11-26: "BUILD"): the control page's "Go play for 15 min" button against a FAKE Worker.
// It starts the burst (POST /handsfree/burst {on:true}), shows the stop time in the mode line, turns into "Stop the burst", stops it, and says plainly when hands-free is Off or the Worker has no burst yet. It changes no limit. No page errors.
const path=require('path'); const L=require('./v527-jarvis-lib.js'); const {chromium,check}=L; const FILE='file://'+path.join(__dirname,'..','control.html');
(async()=>{ const b=await chromium.launch(); const calls=[]; let burstUntil=0, burstCode=200, mode='shadow';
  const ctx=await b.newContext(); const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.route(/api\.0xbeta\.dev\//,r=>{ const q=r.request(), pth=new URL(q.url()).pathname+(new URL(q.url()).search||''), cors={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'GET,POST,OPTIONS'};
    if(q.method()==='OPTIONS') return r.fulfill({status:204,headers:cors}); const body=q.postData()?JSON.parse(q.postData()):null; calls.push({path:pth,method:q.method(),body}); let out={ok:true}, st=200;
    if(/^\/handsfree\/burst/.test(pth)){ if(burstCode!==200){ st=burstCode; out=burstCode===409?{ok:false,error:'off',code:'mode_off'}:{ok:false,error:'nope'}; } else { burstUntil=body&&body.on?Date.now()+15*60e3:0; out={ok:true,burst:burstUntil>0,until:burstUntil||null,minutes:15,perLook:6}; } }
    else if(/^\/handsfree\/scan/.test(pth)) out={ok:true,mode,burst:burstUntil>Date.now(),burstUntil:burstUntil||null,config:{eMin:0.03,eMax:0.12,pMin:0.12,pMax:0.88,leadMin:20,stake:1},games:[],log:[]};
    else if(/^\/autobet\/status/.test(pth)) out={ok:true,mode:'LIVE',killed:false,requireArm:true,armed:true,budget:10,reserved:0,left:10,orders:[]}; else if(/samson/.test(pth)) out={ok:true,entries:[]}; else if(/^\/push\/status/.test(pth)) out={ok:true,set:true,devices:[],reminders:[],settings:{}};
    r.fulfill({status:st,headers:cors,contentType:'application/json',body:JSON.stringify(out)}); });
  await p.addInitScript(()=>{ localStorage.setItem('mbev.pass','pass1234'); localStorage.setItem('mbev.syncKey','abcdef'); }); await p.goto(FILE); await p.waitForTimeout(800); await p.evaluate(()=>{ var d=document.getElementById('hfTools'); if(d) d.open=true; });
  const last=(re)=>calls.filter((c)=>re.test(c.path)).slice(-1)[0];
  check('the card has a "Go play for 15 min" button and nothing is running at first', /Go play for 15 min/.test(await p.textContent('#hfBurst')) && !/BURST/.test(await p.textContent('#hfMode')), await p.textContent('#hfMode'));
  calls.length=0; await p.click('#hfBurst'); await p.waitForTimeout(500);
  check('pressing it asks the Worker to start the burst (POST /handsfree/burst {on:true})', last(/handsfree\/burst/) && last(/handsfree\/burst/).method==='POST' && last(/handsfree\/burst/).body.on===true, calls);
  const t=await p.textContent('#hfMode'); check('the mode line says it is looking every minute, 6 games at a time, until a clock time, then back to every 5 minutes', /BURST: looking every minute, 6 games at a time, until \d{1,2}:\d\d/.test(t) && /back to every 5 minutes/.test(t), t);
  check('the message says limits and Proceed are unchanged', /limits and Proceed are unchanged/.test(await p.textContent('#hfMsg')), await p.textContent('#hfMsg'));
  check('the button now reads "Stop the burst"', /Stop the burst/.test(await p.textContent('#hfBurst')), await p.textContent('#hfBurst'));
  calls.length=0; await p.click('#hfBurst'); await p.waitForTimeout(500);
  check('pressing it again stops the burst (POST {on:false}) and the line goes back to normal', last(/handsfree\/burst/).body.on===false && !/BURST/.test(await p.textContent('#hfMode')) && /Go play for 15 min/.test(await p.textContent('#hfBurst')), await p.textContent('#hfMode'));
  check('the burst sends no limit, stake, budget or key (only {on})', calls.filter(c=>/burst/.test(c.path)).every(c=>JSON.stringify(c.body)==='{"on":false}'), calls);
  burstCode=409; await p.click('#hfBurst'); await p.waitForTimeout(400); check('with hands-free Off it says to choose Shadow or Live first', /Hands-free is Off: choose Shadow or Live first/.test(await p.textContent('#hfMsg')), await p.textContent('#hfMsg'));
  burstCode=404; await p.click('#hfBurst'); await p.waitForTimeout(400); check('a Worker without the burst says so', /does not have the burst yet/.test(await p.textContent('#hfMsg')), await p.textContent('#hfMsg'));
  check('no page errors (burst button)', errs.length===0, errs.slice(0,3));
  await b.close(); const r=L.res(); console.log('\n'+r.pass+' passed, '+r.fail+' failed'); process.exit(r.fail?1:0); })();
