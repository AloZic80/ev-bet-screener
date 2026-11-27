// node tests/v540-alerts-test.js — v5.40 (owner 2026-11-26: "POPUP alerts on my phone"): the control page's Phone alerts card, against a FAKE Worker and a FAKE phone (no network, no real push).
// Enable asks the phone's permission, reads the Worker's public key, subscribes (userVisibleOnly, with that key) and sends only the subscription to the Worker; a refused permission, a missing key on the Worker and a browser without push each say what to do; Test, Turn off, the two built-in reminders and the owner's own reminders
// (add and remove) call the right Worker routes; no key or push address is ever shown on the page. No page errors.
const path=require('path'); const L=require('./v527-jarvis-lib.js'); const {chromium,check}=L; const FILE='file://'+path.join(__dirname,'..','control.html');
const b64u=(buf)=>Buffer.from(buf).toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
(async()=>{ const b=await chromium.launch(); const calls=[]; let keySet=true, reminders=[], settings={proceed:true,summary:true}, devices=0, testSent=1;
  const PUB=b64u(Buffer.concat([Buffer.from([4]),Buffer.alloc(64,7)]));
  const mk=async(opts)=>{ const ctx=await b.newContext(); const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
    await p.route(/api\.0xbeta\.dev\//,r=>{ const q=r.request(), pth=new URL(q.url()).pathname, cors={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'GET,POST,OPTIONS'};
      if(q.method()==='OPTIONS') return r.fulfill({status:204,headers:cors}); const body=q.postData()?JSON.parse(q.postData()):null; calls.push({path:pth,method:q.method(),body});
      let out={ok:true};
      if(pth==='/autobet/status') out={ok:true,mode:'LIVE',killed:false,requireArm:true,armed:true,budget:10,reserved:1,left:9,orders:[]};
      else if(pth==='/samson/log') out={ok:true,entries:[]};
      else if(pth==='/push/key') out={ok:true,set:keySet,key:keySet?PUB:null};
      else if(pth==='/push/status') out={ok:true,set:keySet,devices:Array.from({length:devices},()=>({device:'iPhone',host:'web.push.apple.com'})),reminders,settings};
      else if(pth==='/push/subscribe'){ devices=1; out={ok:true,devices:1}; }
      else if(pth==='/push/unsubscribe'){ devices=0; out={ok:true,devices:0}; }
      else if(pth==='/push/test') out={ok:testSent>0,sent:testSent,failed:0,removed:0};
      else if(pth==='/push/reminders'){ reminders=body.list; out={ok:true,reminders}; }
      else if(pth==='/push/settings'){ settings=body; out={ok:true,settings}; }
      r.fulfill({status:200,headers:cors,contentType:'application/json',body:JSON.stringify(out)}); });
    await p.addInitScript((o)=>{ localStorage.setItem('mbev.pass','pass1234'); localStorage.setItem('mbev.ctl.tab','all'); localStorage.setItem('mbev.syncKey','abcdef');
      if(!o.push){ try{ delete window.PushManager; }catch(e){} }   /* a browser with no push (Chromium has it built in) */
      if(o.push){ window.__subs=[]; window.PushManager=function(){}; window.Notification={permission:'default', requestPermission:async()=>o.perm};
        const sub={endpoint:'https://web.push.apple.com/wp/SECRETENDPOINT', toJSON(){ return {endpoint:this.endpoint, keys:{p256dh:'SECRETP256DH', auth:'SECRETAUTH'}}; }, async unsubscribe(){ window.__unsub=true; return true; }};
        const reg={showNotification:async(t,o)=>{ window.__shown=(window.__shown||[]).concat([{t,o}]); }, pushManager:{ subscribe:async(x)=>{ window.__subOpts={userVisibleOnly:x.userVisibleOnly, keyLen:x.applicationServerKey.length, key0:x.applicationServerKey[0]}; window.__has=true; return sub; }, getSubscription:async()=>window.__has?sub:null }};
        Object.defineProperty(navigator,'serviceWorker',{value:{ready:Promise.resolve(reg), register:async()=>reg, addEventListener:(n,f)=>{ if(n==='message') window.__swl=f; }},configurable:true}); } }, opts);
    await p.goto(FILE); await p.waitForTimeout(700); await p.evaluate(()=>{ var d=document.getElementById('alBox'); if(d) d.open=true; }); p.__errs=errs; return p; };   /* v5.58: the alerts box is a closed dropdown */
  const last=(p)=>calls.filter((c)=>c.path===p).slice(-1)[0];
  { calls.length=0; const p=await mk({push:true,perm:'granted'});
    check('the Phone alerts card shows, says no phone is on yet, and shows the saved settings', /Alerts are not on for any device yet/.test(await p.textContent('#alState')) && (await p.isChecked('#alProceed')) && (await p.isChecked('#alSummary')), await p.textContent('#alState'));
    await p.click('#alOn'); await p.waitForTimeout(700);
    const so=await p.evaluate(()=>window.__subOpts), sub=last('/push/subscribe');
    check('Enable subscribes with userVisibleOnly and the Worker\'s public key (65 bytes, starting 0x04)', so && so.userVisibleOnly===true && so.keyLen===65 && so.key0===4, so);
    check('only the subscription (address and keys) and a device name go to the Worker', sub && sub.body.subscription.endpoint==='https://web.push.apple.com/wp/SECRETENDPOINT' && sub.body.subscription.keys.p256dh==='SECRETP256DH' && sub.body.device && Object.keys(sub.body).sort().join()==='device,subscription', sub);
    check('afterwards it says alerts are on for 1 device', /on for 1 device/.test(await p.textContent('#alState')), await p.textContent('#alState'));
    const page=await p.evaluate(()=>document.body.innerText); check('no push address or key appears anywhere on the page', !/SECRETENDPOINT|SECRETP256DH|SECRETAUTH/.test(page) && !page.includes(PUB), null);
    await p.click('#alTest'); await p.waitForTimeout(400); check('Send a test calls /push/test and says how many devices it went to', !!last('/push/test') && /Sent to 1 device/.test(await p.textContent('#alMsg')), await p.textContent('#alMsg'));
    check('v5.42: the status line names the push service ("(Apple)") so you can tell which browser signed up', /\(Apple\)/.test(await p.textContent('#alState')), await p.textContent('#alState'));
    await p.click('#alLocal'); await p.waitForTimeout(400); const shown=await p.evaluate(()=>window.__shown||[]); check('v5.42: "Show a popup here" shows a popup straight from the page (no Worker call) and says what a "nothing" would mean', shown.length===1 && shown[0].t==='0xBeta local test' && /Asked this device/.test(await p.textContent('#alMsg')) && !calls.some((c)=>c.path==='/push/test' && calls.indexOf(c)>calls.length-1), [shown, await p.textContent('#alMsg')]);
    check('v5.42: before any push arrives the page says so', /No push received by this device yet/.test(await p.textContent('#alLast')), await p.textContent('#alLast'));
    await p.evaluate(()=>window.__swl({data:{type:'push', at:Date.now()}})); check('v5.42: when the service worker reports a push, the page shows the time it arrived', /Last push received by this device: /.test(await p.textContent('#alLast')), await p.textContent('#alLast'));
    testSent=0; await p.click('#alTest'); await p.waitForTimeout(400); check('v5.42: a test with no device signed up says so in plain words (not "The Worker said no")', /No device is signed up for alerts yet/.test(await p.textContent('#alMsg')), await p.textContent('#alMsg')); testSent=1;
    await p.fill('#alTime','12:05'); await p.fill('#alText','Fanatics window ends soon'); await p.click('#alAdd'); await p.waitForTimeout(400);
    const rm=last('/push/reminders'); check('Add saves the reminder (hour, minute, text, an id) and lists it', rm && rm.body.list.length===1 && rm.body.list[0].h===12 && rm.body.list[0].m===5 && rm.body.list[0].text==='Fanatics window ends soon' && !!rm.body.list[0].id && /12:05 · Fanatics window ends soon/.test(await p.textContent('#alList')), rm);
    await p.click('#alAdd'); check('Add with nothing typed says so and saves nothing more', /Pick a time/.test(await p.textContent('#alMsg')), await p.textContent('#alMsg'));
    await p.click('#alList button'); await p.waitForTimeout(400); check('Remove saves the list without it', last('/push/reminders').body.list.length===0 && /None yet/.test(await p.textContent('#alList')), last('/push/reminders'));
    await p.uncheck('#alProceed'); await p.waitForTimeout(300); const se=last('/push/settings'); check('unticking the Proceed reminder saves it off, the summary stays on', se && se.body.proceed===false && se.body.summary===true, se);
    await p.click('#alOff'); await p.waitForTimeout(500); check('Turn off unsubscribes this device and tells the Worker', (await p.evaluate(()=>window.__unsub))===true && !!last('/push/unsubscribe') && /off for this device/.test(await p.textContent('#alMsg')), await p.textContent('#alMsg'));
    check('no page errors (alerts card)', p.__errs.length===0, p.__errs.slice(0,3)); }
  { calls.length=0; const p=await mk({push:true,perm:'denied'}); await p.click('#alOn'); await p.waitForTimeout(400); check('a refused permission says how to allow it and subscribes to nothing', /blocked/i.test(await p.textContent('#alMsg')) && !last('/push/subscribe') && !(await p.evaluate(()=>window.__subOpts)), await p.textContent('#alMsg')); }
  { calls.length=0; keySet=false; const p=await mk({push:true,perm:'granted'}); check('with no keys on the Worker the card says they are added once, by you', /no alert keys yet/.test(await p.textContent('#alState')), await p.textContent('#alState')); await p.click('#alOn'); await p.waitForTimeout(500); check('...and Enable stops there (no subscribe) with the same words', /no alert keys yet/.test(await p.textContent('#alMsg')) && !last('/push/subscribe'), await p.textContent('#alMsg')); keySet=true; }
  { calls.length=0; const p=await mk({push:false}); await p.click('#alOn'); await p.waitForTimeout(300); check('a browser without push says to add the page to the Home Screen on an iPhone', /Home Screen/.test(await p.textContent('#alMsg')), await p.textContent('#alMsg')); }
  await b.close(); const r=L.res(); console.log('\n'+r.pass+' passed, '+r.fail+' failed'); process.exit(r.fail?1:0); })();
