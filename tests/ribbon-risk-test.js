// node tests/ribbon-risk-test.js — v4.26. Alonzo, 11/8: "Let's do this! Can we? On the ESPN banner?" Each game tile on the score ribbon
// says how many of your open bets are on it and what they risk (ESPN's "1 Bet risking $1.26"), and 🎯 My games lists only those games.
// Open = no result yet, not sold, not a parlay. A free bet counts as a bet but risks $0. A settled bet on the same game is not in it.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const now=Date.now(), iso=ms=>new Date(ms).toISOString();
const DAY=new Date(now).toLocaleDateString('en-CA',{timeZone:'America/Chicago'});
const team=(ha,ab,sc)=>({homeAway:ha, score:String(sc), team:{abbreviation:ab, displayName:ab, logo:''}});
const game=(id,a,h,sa,sh,state,det)=>({id, date:iso(now-3600e3), status:{type:{state, shortDetail:det}}, competitions:[{competitors:[team('away',a,sa),team('home',h,sh)], situation:{}}]});
const SB={'basketball/nba':{events:[game('401','LAL','BOS',70,78,'in','3rd 5:12'), game('402','MIA','NYK',0,0,'pre','')]}};
const B=(id,o)=>Object.assign({id,key:id,name:'BOS',sport:'NBA',kind:'moneyline',market:'Moneyline',side:'',team:'BOS',game:'LAL @ BOS',matchup:'LAL @ BOS',book:'DraftKings',odds:'-110',offeredRaw:'-110',stake:3,date:DAY,dateSet:true,start:iso(now-3600e3),gameInfo:{state:'in',startISO:iso(now-3600e3),teams:[]}},o);
const LOG=[B('a',{stake:3}), B('b',{stake:2.5,book:'Kalshi'}), B('f',{stake:5,free:true,book:'Bovada'}), B('s',{stake:4,result:'win',gradedBy:'manual',resultSrc:'you',manual:true})];
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago', viewport:{width:1280,height:900}});
  await ctx.addInitScript(([L])=>{ try{ if(sessionStorage.getItem('seeded')) return; sessionStorage.setItem('seeded','1'); localStorage.clear(); localStorage.setItem('mbev.log',JSON.stringify(L)); localStorage.setItem('mbev.ssSport','NBA'); }catch(e){} }, [LOG]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    const m=u.match(/sports\/(.+?)\/scoreboard/); if(m) return r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(SB[m[1]]||{events:[]})});
    return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1500);
  const tiles=()=>p.evaluate(()=>[...document.querySelectorAll('#ssGames .ss-g')].map(t=>({key:t.dataset.key, text:t.innerText.replace(/\s+/g,' ').trim(), right:Math.round(t.getBoundingClientRect().right), risk:(t.querySelector('.ss-risk')||{}).innerText||null, riskRight:(t.querySelector('.ss-risk')?Math.round(t.querySelector('.ss-risk').getBoundingClientRect().right):null)})));
  const menu=await p.$$eval('#ssSport option',o=>o.map(x=>x.value));
  check('v4.30: the menu has 🎯 My games first and every sport again (NBA, NFL, MLB, Top events)', menu[0]==='MINE' && ['NBA','NFL','MLB','TOP'].every(v=>menu.includes(v)) && menu.length>=60, {first:menu[0], n:menu.length});
  let T=await tiles();
  const lal=T.find(t=>/LAL/.test(t.text)), mia=T.find(t=>/MIA/.test(t.text));
  check('the Lakers tile says what your open bets risk: 3 bets (one free) risking $5.50, not the settled bet and not the free $5', lal && lal.risk==='3 bets risking $5.50', lal&&lal.risk);
  check('a game with no bet of yours shows no risk line', mia && mia.risk===null, mia&&mia.risk);
  try{ await p.selectOption('#ssSport','MINE'); }catch(e){ console.log('  (no 🎯 My games choice: '+e.message.split('\n')[0]+')'); }
  await p.waitForTimeout(900); T=await tiles();
  check('🎯 My games lists only the games with your open bets (one tile, the Lakers game)', T.length===1 && /LAL/.test(T[0].text), T.map(t=>t.key));
  await p.setViewportSize({width:390,height:844}); await p.waitForTimeout(300);
  T=await tiles();
  const l2=T.find(t=>/LAL/.test(t.text));
  check('on a phone the risk line stays inside its tile', l2 && l2.risk && l2.riskRight<=l2.right+1, l2&&{riskRight:l2.riskRight, right:l2.right});
  check('no page errors', !errs.length, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
