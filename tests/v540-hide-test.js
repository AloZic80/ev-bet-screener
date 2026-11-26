// node tests/v540-hide-test.js — v5.40 (owner 2026-11-26: "i need for the Tony Pollard Hook/Taker to be removed. its taken already on Novig"): a Hide button on each order in the orange "Make waiting for a taker" bar.
// Hide removes that one order from THAT BAR only (kept on this device, undone by "Show hidden"); the order still counts everywhere that protects him: the Bet log's waiting list, the pull-it alerts and the Already-bet marks. No page errors.
const L=require('./v527-jarvis-lib.js'); const {chromium,check,open,ev,safe}=L;
(async()=>{ const b=await chromium.launch(); const X=await open(b,1280);
  await safe('hide', async()=>{
    const r=await ev(X.p,()=>{ localStorage.removeItem('mbev.mkHide');
      myOrders={orders:[{book:'novig', id:'ordP', ref:'mktP', outcome:'ocP', action:'buy', price:0.48, qty:7.52, title:'Tony Pollard Under 54.5 Rushing Yards', bet:{sport:'NFL', kind:'prop', player:'Tony Pollard', statText:'Rushing Yards', line:54.5, side:'U'}},
                       {book:'novig', id:'ordQ', ref:'mktQ', outcome:'ocQ', action:'buy', price:0.4, qty:2, title:'Other player Over 1.5 Shots', bet:{sport:'NHL', kind:'prop', player:'Other Player', statText:'Shots', line:1.5, side:'O'}}]};
      const bar=document.getElementById('makesBar'); renderMakes(); const t1=bar.textContent, hides1=bar.querySelectorAll('.mk-hide').length;
      bar.querySelector('.mk-hide').click(); const t2=bar.textContent, hides2=bar.querySelectorAll('.mk-hide').length, stored=localStorage.getItem('mbev.mkHide');
      const logWait=(function(){ renderLogOrders(); const l=document.getElementById('logOrders'); return l?l.textContent:''; })();
      const top=document.getElementById('ordersTop')?document.getElementById('ordersTop').textContent:'';
      bar.querySelector('.mk-unhide').click(); const t3=bar.textContent;
      return {t1,hides1,t2,hides2,stored,logWait,top,t3}; });
    check('before hiding: both orders are in the bar, each with a Hide button', /2 Makes waiting/.test(r.t1) && r.hides1===2, [r.t1.slice(0,160), r.hides1]);
    check('Hide removes just that order from the bar (1 left, the other still has its Hide) and remembers it on this device', /1 Make waiting/.test(r.t2) && r.hides2===1 && /Show hidden \(1\)/.test(r.t2) && /novig:ordP|novig:ordQ/.test(r.stored||''), [r.t2.slice(0,200), r.stored]);
    check('the hidden order is still counted in the top "waiting" line (nothing protective is hidden)', /2 orders? waiting/.test(r.top), r.top);
    check('Show hidden brings it back', /2 Makes waiting/.test(r.t3) && !/Show hidden/.test(r.t3), r.t3.slice(0,160));
    const r2=await ev(X.p,()=>{ localStorage.removeItem('mbev.mkHide'); const bar=document.getElementById('makesBar'); renderMakes(); bar.querySelectorAll('.mk-hide')[0].click(); renderMakes(); bar.querySelectorAll('.mk-hide')[0].click(); const t=bar.textContent, vis=bar.style.display; return {t, vis}; });
    check('hiding every order leaves one small "hidden Makes · Show hidden" line so nothing is lost', /2 hidden Makes/.test(r2.t) && /Show hidden/.test(r2.t) && r2.vis!=='none', r2);
    const r4=await ev(X.p,()=>{ localStorage.removeItem('mbev.mkHide'); window._myFills=[{book:'novig', id:'f1', ref:'mktP', outcome:'ocP', order:'ordP', action:'buy', cost:0.51, ts:Date.now()-60000, bet:{kind:'prop'}}];
      const P={book:'novig', id:'ordP', ref:'mktP', outcome:'ocP', action:'buy', price:0.48, qty:7.52, title:'Tony Pollard Under 54.5 Rushing Yards', bet:{sport:'NFL', kind:'prop', player:'Tony Pollard', statText:'Rushing Yards', line:54.5, side:'U'}};
      const Q={book:'novig', id:'ordQ', ref:'mktQ', outcome:'ocQ', action:'buy', price:0.4, qty:2, title:'Other player Over 1.5 Shots', bet:{sport:'NHL', kind:'prop', player:'Other Player', statText:'Shots', line:1.5, side:'O'}};
      const bar=document.getElementById('makesBar'); myOrders={orders:[P]}; renderMakes(); const only=bar.style.display;
      myOrders={orders:[P,Q]}; renderMakes(); const both=bar.textContent; const top=document.getElementById('ordersTop')?document.getElementById('ordersTop').textContent:''; window._myFills=[]; return {only, both, top}; });
    check('an order that already has a taker takes NO room in the bar: when it is the only one the bar is gone', r4.only==='none', r4.only);
    check('with another order that has no taker, the bar shows just that one (1 Make, no Pollard), and the top waiting line counts only that one too', /1 Make waiting for a taker/.test(r4.both) && !/Pollard/.test(r4.both) && /Other Player|Other player/.test(r4.both) && /1 order waiting/.test(r4.top), [r4.both.slice(0,200), r4.top]);
    const r5=await ev(X.p,()=>{ window._myFills=[{book:'novig', id:'f1', ref:'mktP', outcome:'ocP', order:'ordP', action:'buy', cost:0.51, ts:Date.now()-60000, bet:{kind:'prop'}}];
      const P={book:'novig', id:'ordP', ref:'mktP', outcome:'ocP', action:'buy', price:0.48, qty:7.52, title:'Tony Pollard Under 54.5 Rushing Yards', bet:{sport:'NFL', kind:'prop', player:'Tony Pollard', statText:'Rushing Yards', line:54.5, side:'U'}}, Q={book:'novig', id:'ordQ', ref:'mktQ', outcome:'ocQ', action:'buy', price:0.4, qty:2, title:'Other player Over 1.5 Shots', bet:{sport:'NHL', kind:'prop', player:'Other Player', statText:'Shots', line:1.5, side:'O'}};
      const top=document.getElementById('ordersTop'), log=document.getElementById('logOrders'); myOrders={orders:[P]}; renderLogOrders(); const onlyHidden=top.hidden, logTxt=log.hidden?'':log.textContent;
      myOrders={orders:[P,Q]}; renderLogOrders(); const both=top.textContent; window._myFills=[]; return {onlyHidden, logTxt, both}; });
    check('the top "waiting" line leaves out an order that has a taker: with only that one, the line is gone', r5.onlyHidden===true, r5);
    check('...but the Bet log\'s waiting list still lists it (nothing protective is hidden)', /Pollard/.test(r5.logTxt), r5.logTxt.slice(0,200));
    check('...and with another untouched order the top line counts only that one (1 order, $0.80 held)', /1 order waiting/.test(r5.both) && /\$0\.80 held/.test(r5.both) && !/matched bet/.test(r5.both), r5.both);
    const r3=await ev(X.p,()=>{ myOrders={orders:[]}; localStorage.removeItem('mbev.mkHide'); renderMakes(); return document.getElementById('makesBar').style.display; });
    check('with no orders at all the bar is hidden as before', r3==='none', r3);
  });
  check('no page errors', X.errs.length===0, X.errs.slice(0,3));
  await b.close(); const r=L.res(); console.log('\n'+r.pass+' passed, '+r.fail+' failed'); process.exit(r.fail?1:0); })();
