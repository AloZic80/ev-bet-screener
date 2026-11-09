// node tests/books-test.js — a sportsbook and its prediction app are different books: DraftKings, DraftKings Predictions,
// DraftKings Pick 6, FanDuel and FanDuel Predicts. Checks + Add a bet, the Bet log, fees, the Today card, the calendar,
// your "Books you bet" list on the board, and the names the Sportsbook API uses.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago', viewport:{width:1400,height:1000}});
  await ctx.addInitScript(()=>{ try{ if(sessionStorage.getItem('seeded')) return; sessionStorage.setItem('seeded','1'); localStorage.clear(); }catch(e){} });
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/espn\.com.*scoreboard/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1200);
  await p.evaluate(()=>document.querySelector('.tab[data-view="v-add"]').click())   /* v4.29: under its main tab now */; await p.waitForTimeout(300); await p.selectOption('#abSport','NBA'); await p.waitForTimeout(800); await p.waitForSelector('#abHost .editor');
  const books=await p.$$eval('#abHost .eb-book option',o=>o.map(x=>({v:x.value,t:x.textContent})));
  const has=v=>books.some(x=>x.v===v);
  check('+ Add a bet lists each one on its own', ['DraftKings','DraftKings Predictions','DraftKings Pick 6','FanDuel','FanDuel Predicts'].every(has), books.filter(x=>/draftkings|fanduel/i.test(x.v)));
  const modeFor=async v=>{ await p.selectOption('#abHost .eb-book',v); await p.waitForTimeout(80); return p.$eval('#abHost .eb-mode',e=>e.value); };
  const modes={dk:await modeFor('DraftKings'), dkp:await modeFor('DraftKings Predictions'), fd:await modeFor('FanDuel'), fdp:await modeFor('FanDuel Predicts')};
  check('sportsbooks start in odds, prediction apps in % (cents)', modes.dk==='odds' && modes.fd==='odds' && modes.dkp==='pct' && modes.fdp==='pct', modes);
  async function add(team,book,o){
    await p.selectOption('#abType','moneyline'); await p.fill('#abGameFree','CHA @ DET'); await p.dispatchEvent('#abGameFree','input'); await p.fill('#abDate',new Date(Date.now()+86400e3).toLocaleDateString('en-CA',{timeZone:'America/Chicago'}));
    await p.waitForTimeout(200); await p.selectOption('#abTeam',team);
    await p.selectOption('#abHost .eb-book',book); await p.selectOption('#abHost .eb-mode',o.mode);
    if(o.mode==='odds'){ await p.fill('#abHost .eb-odds',o.odds); await p.fill('#abHost .eb-stake',o.stake); }
    else { await p.fill('#abHost .eb-pct',o.pct||''); await p.fill('#abHost .eb-cost',o.cost); await p.fill('#abHost .eb-win',o.win||''); }
    const n0=await p.evaluate(()=>logged.length); for(let i=0;i<3 && await p.evaluate(()=>logged.length)===n0;i++){ await p.click('#abHost .eb-save'); await p.waitForTimeout(400); }
    return p.evaluate(n=>logged.length>n ? (x=>({book:x.book, odds:x.odds, stake:x.stake, towin:x.towin, fee:x.fee}))(logged[logged.length-1]) : null, n0);
  }
  const S={ dk: await add('DET','DraftKings',{mode:'odds',odds:'-110',stake:'10'}),
    dkp: await add('DET','DraftKings Predictions',{mode:'pct',cost:'5.50',win:'10'}),
    fdp: await add('CHA','FanDuel Predicts',{mode:'pct',pct:'45',cost:'4.50'}),
    pk6: await add('CHA','DraftKings Pick 6',{mode:'odds',odds:'+100',stake:'5'}) };
  check('each saves under its own name', S.dk&&S.dk.book==='DraftKings' && S.dkp&&S.dkp.book==='DraftKings Predictions' && S.fdp&&S.fdp.book==='FanDuel Predicts' && S.pk6&&S.pk6.book==='DraftKings Pick 6', S);
  check('a Predictions slip keeps what it pays: $5.50 for $10 back = To win $4.50', S.dkp.towin===4.5, S.dkp);
  const fees=await p.evaluate(()=>{ const c=cfgRead().fees; return {fdp:+feeRate('FanDuel Predicts',0.45,c).toFixed(4), fd:feeRate('FanDuel',0.45,c), dk:feeRate('DraftKings',0.45,c), dkp:feeRate('DraftKings Predictions',0.45,c), setFdp:c.fdp}; });
  check('fees: FanDuel Predicts has its own (2% of the payout by default = 4.44% of a 45¢ stake); the sportsbooks have none', Math.abs(fees.fdp-0.0444)<0.0001 && fees.fd===0 && fees.dk===0, fees);
  await p.click('.tab[data-view="v-log"]'); await p.waitForTimeout(300);
  const tags=await p.evaluate(()=>logged.map((x,i)=>{ const tr=document.querySelector('#logBody button.kill.edit[data-i="'+i+'"]').closest('tr'); return {book:x.book, shown:tr.querySelector('.book').textContent, tag:!!tr.querySelector('.pred-tag')}; }));
  const T=k=>tags.find(x=>x.book===k);
  check('Bet log: DK Predictions and FD Predicts carry a PREDICTS tag; DraftKings and Pick 6 do not', T('DraftKings Predictions').shown==='DK Predictions' && T('DraftKings Predictions').tag && T('FanDuel Predicts').shown==='FD Predicts' && T('FanDuel Predicts').tag && !T('DraftKings').tag && !T('DraftKings Pick 6').tag, tags);
  const rib=await p.evaluate(()=>{ const r=()=>logged.map(x=>ribbonBook(x.book)); const a=r(); localStorage.setItem('mbev.dkGroup','0'); const s=r(); localStorage.removeItem('mbev.dkGroup'); return {grouped:a, split:s}; });
  check('Today card: DraftKings apps together by default, apart when you untick the box; FD Predicts always its own', rib.grouped.join()==='DraftKings,DraftKings,FD Predicts,DraftKings' && rib.split.join()==='DraftKings,DK Predictions,FD Predicts,DK Pick 6', rib);
  const cal=await p.evaluate(()=>{ const n=k=>Object.values(calDays(k)).reduce((t,d)=>t+d.n,0); return {fdp:n('FD Predicts'), dk:n('DraftKings'), all:n('All')}; });
  check('Performance calendar can show FD Predicts alone', cal.fdp===1 && cal.all===4, cal);
  const mine=await p.evaluate(()=>({sbOnApp:bookIsMine('DraftKings','DraftKings Predictions'), appOnSb:bookIsMine('DraftKings Predictions','DraftKings'), fdShort:bookIsMine('FanDuel Predicts','FD Predicts'), dkShort:bookIsMine('DraftKings Predictions','DK Predictions'), fdOnDk:bookIsMine('FanDuel Predicts','DK Predictions'), sb:bookIsMine('DraftKings','DraftKings')}));
  check('board: ticking DraftKings never lets a Predictions price through, and the other way round', !mine.sbOnApp && !mine.appOnSb && mine.fdShort && mine.dkShort && !mine.fdOnDk && mine.sb, mine);
  const fm=await p.evaluate(()=>({sbOnApp:bookIsMine('Fanatics Markets','Fanatics'), appOnSb:bookIsMine('Fanatics','Fanatics Markets'), app:bookIsMine('Fanatics Markets','Fanatics Markets'), sb:bookIsMine('Fanatics','Fanatics')}));
  check('Fanatics and Fanatics Markets are kept apart too', !fm.sbOnApp && !fm.appOnSb && fm.app && fm.sb, fm);
  const sb=await p.evaluate(()=>[sbBook('FAN_DUEL'),sbBook('FAN_DUEL_PREDICTS'),sbBook('DRAFT_KINGS'),sbBook('DRAFT_KINGS_PREDICTIONS')]);
  check('Sportsbook API names map to the right book', sb.join()==='FanDuel,FanDuel Predicts,DraftKings,DraftKings Predictions', sb);
  check('no page errors', errs.length===0, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
