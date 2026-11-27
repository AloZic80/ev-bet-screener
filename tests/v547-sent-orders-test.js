// node tests/v547-sent-orders-test.js — v5.47 (owner 2026-11-26: Autopilot bet LSU -7.5 and, 29 minutes later, SMU +6.5 on the same game; "BUILD"): the board counts an order Autopilot just sent as already bet for that game and axis, without waiting for the fill to reach the Bet log.
// sentHeldFor is checked case by case: the other side of the same game, the same game's total (a different axis), another game, an order Novig did not take, an order from more than 40 hours ago, a prop; and the page source: both order paths keep the game and the kind, and the one-bet-per-game rule in the audit asks sentHeldFor. No page errors.
const fs=require('fs'), path=require('path'); const L=require('./v527-jarvis-lib.js'); const {chromium,check,open,ev,safe}=L; const SRC=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
(async()=>{ const b=await chromium.launch(); const X=await open(b,1280);
  await safe('sent orders', async()=>{
    const R=await ev(X.p,()=>{ const now=Date.now(), iso=ms=>new Date(ms).toISOString(), put=(a)=>localStorage.setItem('mbev.autobet',JSON.stringify(a)), t={};
      put([{t:iso(now-29*60e3),pick:'LSU Tigers -7.5',game:'SMU @ LSU',kind:'spread',ok:true,auto:true}]);
      t.other=sentHeldFor({game:'SMU @ LSU',kind:'spread'},'side'); t.sameGameOtherTeamName=sentHeldFor({game:'LSU vs SMU'},'side'); t.total=sentHeldFor({game:'SMU @ LSU',kind:'total'},'total'); t.otherGame=sentHeldFor({game:'DUKE @ UNC'},'side');
      put([{t:iso(now-60e3),pick:'LSU Tigers -7.5',game:'SMU @ LSU',kind:'spread',ok:false}]); t.refused=sentHeldFor({game:'SMU @ LSU'},'side');
      put([{t:iso(now-50*3600e3),pick:'LSU Tigers -7.5',game:'SMU @ LSU',kind:'spread',ok:true}]); t.old=sentHeldFor({game:'SMU @ LSU'},'side');
      put([{t:iso(now-60e3),pick:'J Brown over 24.5',game:'SMU @ LSU',kind:'prop',ok:true}]); t.prop=sentHeldFor({game:'SMU @ LSU'},'side');
      put([{t:iso(now-60e3),pick:'Over 171.5',game:'SMU @ LSU',kind:'total',ok:true}]); t.totalSent=sentHeldFor({game:'SMU @ LSU'},'total'); t.totalVsSide=sentHeldFor({game:'SMU @ LSU'},'side');
      localStorage.setItem('mbev.autobet','not json'); t.junk=sentHeldFor({game:'SMU @ LSU'},'side'); localStorage.removeItem('mbev.autobet'); t.none=sentHeldFor({game:'SMU @ LSU'},'side'); return t; });
    check('the OTHER side of the same game (SMU +6.5 after LSU -7.5) is counted as already bet, named by the order Autopilot sent', R.other && /LSU Tigers -7\.5/.test(R.other.name), R.other);
    check('the same game written another way (LSU vs SMU) is the same game', !!R.sameGameOtherTeamName, R.sameGameOtherTeamName);
    check('the total of the same game is a different axis: not held; another game: not held', R.total===null && R.otherGame===null, [R.total,R.otherGame]);
    check('an order Novig did not take is not a bet; an order from over 40 hours ago is not counted; a prop is not a game line', R.refused===null && R.old===null && R.prop===null, [R.refused,R.old,R.prop]);
    check('a total sent holds the game\'s total axis, and does not hold its side axis', !!R.totalSent && R.totalVsSide===null, [R.totalSent,R.totalVsSide]);
    check('a broken or empty Autopilot list never breaks the board (no answer, no error)', R.junk===null && R.none===null, [R.junk,R.none]);
    check('both order paths keep the game and the kind with each sent order, and the one-bet-per-game rule in the audit asks sentHeldFor', (SRC.match(/game:r\.game\|\|null, kind:r\.kind\|\|null, ok/g)||[]).length===2 && /\|\| sentHeldFor\(r, ax\)/.test(SRC) && /^function sentHeldFor\(/m.test(SRC), null);
    check('no page errors (sent orders)', X.errs.length===0, X.errs.slice(0,3));
  });
  await b.close(); const r=L.res(); console.log('\n'+r.pass+' passed, '+r.fail+' failed'); process.exit(r.fail?1:0); })();
