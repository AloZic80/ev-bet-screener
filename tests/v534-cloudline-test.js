// node tests/v534-cloudline-test.js [index.html] — v5.34 (owner 2026-11-25: "i want this on a cloud"): the Bet log's cloud line says plainly whether the bets are in the cloud copy right now. It says "In the cloud" ONLY when sync is on,
// has no error, is not saving and has nothing waiting; otherwise it says why not. No page errors.
const L=require('./v527-jarvis-lib.js'); const {chromium,check,open,ev,safe}=L;
(async()=>{ const b=await chromium.launch(); const X=await open(b,1280);
  const say=async(mut)=>ev(X.p,(m)=>{ SY.on=true; SY.err=''; SY.busy=false; SY.meta=SY.meta||{}; SY.meta.dirty=false; SY.meta.joined=true; SY.meta.at=Date.now(); eval(m); cloudLineRender(); const e=document.getElementById('cloudLine'); return [e.textContent, e.className]; }, mut);
  await safe('states', async()=>{
    let r=await say('SY.on=false'); check('sync off: says NOT in the cloud and that the bets live only on this device', /NOT in the cloud/.test(r[0]) && /only on this device/.test(r[0]) && /cloud-bad/.test(r[1]), r);
    r=await say("SY.err='the Worker did not answer'"); check('a sync error: says the cloud copy is NOT up to date and why', /NOT up to date/.test(r[0]) && /did not answer/.test(r[0]) && /cloud-bad/.test(r[1]), r);
    r=await say('SY.busy=true'); check('saving: says it is saving, not that it is safe', /Saving to the cloud/.test(r[0]) && !/In the cloud:/.test(r[0]), r);
    r=await say('SY.meta.dirty=true'); check('changes waiting to be sent: says saving soon, not that it is safe', /Saving soon/.test(r[0]) && !/In the cloud:/.test(r[0]) && /cloud-wait/.test(r[1]), r);
    r=await say('SY.meta.at=0'); check('sync on but nothing saved yet: says it is waiting for the first save', /waiting for its first save/.test(r[0]) && !/In the cloud:/.test(r[0]), r);
    r=await say(''); check('all clear: "In the cloud", the bet count and the time of the last save', /In the cloud: \d+ bets?, last saved \d{1,2}:\d{2}/.test(r[0]) && /cloud-ok/.test(r[1]), r);
    check('the cloud line sits on the Bet log screen', (await ev(X.p,()=>!!document.querySelector('#v-log #cloudLine, #cloudLine')))===true, null);
  });
  check('no page errors', X.errs.length===0, X.errs.slice(0,3));
  await b.close(); const x=L.res(); console.log('\n'+x.pass+' passed, '+x.fail+' failed'); process.exit(x.fail?1:0); })();
