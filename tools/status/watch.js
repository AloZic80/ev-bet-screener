// node tools/status/watch.js <test-output-file> [total] — El Capataz runs this beside a test run. No model tokens: it reads the test output, updates status/status.json,
// and pushes only when the count moved by 15 or more, a test failed, or the run ended (so the branch history stays short).
const fs=require('fs'), cp=require('child_process'), path=require('path'); const ROOT=path.join(__dirname,'..','..'), F=path.join(ROOT,'status','status.json');
const OUT=process.argv[2], TOTAL=+process.argv[3]||176; let lastPushed=-99, lastFail=0, ended=false;
const ct=()=>new Date().toLocaleString('en-US',{timeZone:'America/Chicago',weekday:'short',month:'2-digit',day:'2-digit',hour:'numeric',minute:'2-digit'}).replace(',', ' ·').replace(/(\d+\/\d+) · /,'$1 · ')+' CT';
const sh=c=>cp.execSync(c,{cwd:ROOT,stdio:'pipe'}).toString();
function tick(){ let t=''; try{ t=fs.readFileSync(OUT,'utf8'); }catch(e){ return; }
  const done=(t.match(/^PASS/gm)||[]).length, fail=(t.match(/^FAIL/gm)||[]).length, pass=/All tests passed/.test(t); ended=pass||(!!fail&&/\n\d+ of \d+|failed/i.test(t.split('\n').slice(-3).join('\n'))&&false);
  const j=JSON.parse(fs.readFileSync(F,'utf8')), it=(j.items||[]).find(x=>/El Juez/.test(x.name)); if(!it) return;
  it.done=done; it.total=TOTAL; it.state=pass?'done':(fail?'failed':'working'); it.note=pass?'All tests passed':(fail?fail+' failed: see the chat':'0 failed so far'); j.updated=ct(); j.headline=pass?'El Juez: all tests passed':(fail?'A test failed':'El Juez running');
  fs.writeFileSync(F,JSON.stringify(j,null,2)+'\n');
  if(pass||fail!==lastFail||done-lastPushed>=15){ try{ sh('git add status/status.json && git commit -q -m "status: tests '+done+'/'+TOTAL+'" -- status/status.json && git push -q origin HEAD'); lastPushed=done; lastFail=fail; }catch(e){ /* a lock or a busy push: next tick tries again */ } }
  if(pass) process.exit(0); }
tick(); setInterval(tick,30000);
