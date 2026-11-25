// node tests/v531-delete-twice-test.js [index.html] — v5.31 (owner 2026-11-25: "on the Delete ones, make sure to not just delete but ask confirmation 2 times"): "Delete every logged bet" and "Clear every bet from the board"
// ask twice. Cancel on the first box or on the second keeps everything; two OKs delete; each box says what is at stake. A fake Worker (no real API). No page errors.
const L=require('./v527-jarvis-lib.js'); const {chromium,check,open,ev,safe}=L;
(async()=>{ const b=await chromium.launch(); const X=await open(b,1280); const asked=[]; let plan=[];
  X.p.on('dialog',d=>{ asked.push(d.message()); const ok=plan.length?plan.shift():true; return ok?d.accept():d.dismiss(); });
  const seed=()=>ev(X.p,()=>{ logged=[{id:'t1',name:'A Player',market:'1.5 Shots',side:'O',odds:'-110',stake:5,book:'Novig',placedAt:new Date().toISOString()},{id:'t2',name:'B Player',market:'2.5 Points',side:'O',odds:'+100',stake:3,book:'Novig',placedAt:new Date().toISOString()}]; return logged.length; });
  const n=()=>ev(X.p,()=>logged.length); const wipe=async()=>{ await ev(X.p,()=>{ document.getElementById('wipe').click(); }); await X.p.waitForTimeout(250); };
  await safe('wipe', async()=>{
    await seed(); asked.length=0; plan=[false]; await wipe();
    check('Delete every logged bet: Cancel on the first box keeps both bets (one box seen)', (await n())===2 && asked.length===1, {left:await n(), boxes:asked.length});
    await seed(); asked.length=0; plan=[true,false]; await wipe();
    check('Cancel on the second box keeps both bets (two boxes seen)', (await n())===2 && asked.length===2, {left:await n(), boxes:asked.length});
    await seed(); asked.length=0; plan=[true,true]; await wipe();
    check('two OKs delete them, after exactly two boxes', (await n())===0 && asked.length===2, {left:await n(), boxes:asked.length});
    check('the boxes say how many are at stake and point to Back up bet log', /Delete all 2 logged bets/.test(asked[0]||'') && /Really delete all 2/.test(asked[1]||'') && /Back up bet log/.test(asked[1]||''), asked);
  });
  await safe('board', async()=>{
    asked.length=0; plan=[true,false]; const before=await ev(X.p,()=>lastRows.length);
    await ev(X.p,()=>{ const b=document.getElementById('clearBoard')||[...document.querySelectorAll('button')].find(x=>/clear.*board/i.test(x.textContent)||/Clear every/i.test(x.title||'')); if(b) b.click(); }); await X.p.waitForTimeout(250);
    const after=await ev(X.p,()=>lastRows.length);
    check('Clear the board: Cancel on the second box keeps the board', before>0 && after===before && asked.length===2, {before, after, boxes:asked.length});
  });
  check('no page errors', X.errs.length===0, X.errs.slice(0,3));
  await b.close(); const r=L.res(); console.log('\n'+r.pass+' passed, '+r.fail+' failed'); process.exit(r.fail?1:0); })();
