// node tests/v573-exchange-form-test.js — v5.73 (owner 2026-11-27: "its not the same things i can manually put"; "build, keep the Limit field"): on an exchange the bet form asks Shares, Limit and Filled at (the same words as TYPE THIS) and works out Cost, the price and Pays back.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+(ok?'':'  → '+JSON.stringify(got))); };
(async()=>{ const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago', viewport:{width:1400,height:1000}});
  await ctx.addInitScript(()=>{ try{ if(sessionStorage.getItem('seeded')) return; sessionStorage.setItem('seeded','1'); localStorage.clear(); }catch(e){} });
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/espn\.com.*scoreboard/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1200);
  await p.evaluate(()=>document.querySelector('.tab[data-view="v-add"]').click()); await p.waitForTimeout(300); await p.selectOption('#abSport','NBA'); await p.waitForTimeout(150);
  await p.selectOption('#abType','moneyline'); await p.fill('#abGameFree','CHA @ DET'); await p.dispatchEvent('#abGameFree','input'); await p.fill('#abDate',new Date(Date.now()+86400e3).toLocaleDateString('en-CA',{timeZone:'America/Chicago'})); await p.waitForTimeout(200); await p.selectOption('#abTeam','DET');
  const vis=async sel=>p.evaluate(s=>{ const e=document.querySelector(s); if(!e) return false; if(e.classList.contains('eb-fill')) return !e.hidden; const r=e.getBoundingClientRect(); return r.width>0 && r.height>0 && !e.closest('[hidden]'); },sel);
  await p.selectOption('#abHost .eb-book','DraftKings'); check('a sportsbook does not get the What filled? row (its form is unchanged)', !(await vis('#abHost .eb-fill')), 0);
  await p.selectOption('#abHost .eb-book','Polymarket US'); await p.waitForTimeout(150);
  check('Polymarket US gets What filled? with Shares, Limit ¢ and Filled at ¢', await vis('#abHost .eb-fill') && await vis('#abHost .eb-fsh') && await vis('#abHost .eb-flim') && await vis('#abHost .eb-fat'), 0);
  await p.fill('#abHost .eb-fsh','4'); await p.fill('#abHost .eb-flim','58'); await p.waitForTimeout(150);
  let v=await p.evaluate(()=>({fat:document.querySelector('#abHost .eb-fat').value, cost:document.querySelector('#abHost .eb-cost').value, pct:document.querySelector('#abHost .eb-pct').value, win:document.querySelector('#abHost .eb-win').value, note:document.querySelector('#abHost .eb-fill-note').textContent}));
  check('typing the Limit starts Filled at the same; 4 shares at 58¢ cost $2.39 with the fee and pay back $4.00 (the TYPE THIS numbers)', v.fat==='58' && v.cost==='2.39' && v.pct==='58' && v.win==='4.00', v);
  await p.fill('#abHost .eb-fat','55'); await p.waitForTimeout(150);
  v=await p.evaluate(()=>({lim:document.querySelector('#abHost .eb-flim').value, cost:document.querySelector('#abHost .eb-cost').value, pct:document.querySelector('#abHost .eb-pct').value, win:document.querySelector('#abHost .eb-win').value, note:document.querySelector('#abHost .eb-fill-note').textContent}));
  check('Filled at 55¢: the Limit stays 58, the cost drops to $2.27, the price box says 55 and it still pays $4.00', v.lim==='58' && v.cost==='2.27' && v.pct==='55' && v.win==='4.00' && /4 shares at 55¢ = \$2\.27 with the fee; pays back \$4\.00/.test(v.note), v);
  await p.fill('#abHost .eb-fsh','4.5'); await p.waitForTimeout(100); check('a part share on Polymarket US is refused plainly (it sells whole shares) and the boxes are left alone', /whole shares/.test(await p.evaluate(()=>document.querySelector('#abHost .eb-fill-note').textContent)) && (await p.evaluate(()=>document.querySelector('#abHost .eb-cost').value))==='2.27', 0);
  await p.fill('#abHost .eb-fsh','4'); await p.waitForTimeout(100);
  const n0=await p.evaluate(()=>logged.length); for(let i=0;i<3 && await p.evaluate(()=>logged.length)===n0;i++){ await p.click('#abHost .eb-save'); await p.waitForTimeout(400); }
  const L=await p.evaluate(n=>logged.length>n ? (x=>({book:x.book, stake:x.stake, towin:x.towin, limitC:x.limitC}))(logged[logged.length-1]) : null, n0);
  check('Save keeps what the slip said: the cost $2.27 as the stake, To win $1.73 (pays back $4.00), and the limit 58¢ with the bet', L && L.book==='Polymarket US' && L.stake===2.27 && Math.abs(L.towin-1.73)<0.006 && L.limitC===58, L);
  await p.selectOption('#abHost .eb-book','Kalshi'); await p.waitForTimeout(150); check('Kalshi gets the row too (the same boxes, with its own fee math)', await vis('#abHost .eb-fill'), 0);
  await p.fill('#abHost .eb-fsh','3.5'); await p.fill('#abHost .eb-fat','40'); await p.waitForTimeout(150); const k=await p.evaluate(()=>({cost:document.querySelector('#abHost .eb-cost').value, win:document.querySelector('#abHost .eb-win').value}));
  check('Kalshi takes part shares: 3.5 shares at 40¢ cost a little over $1.40 (the fee) and the payout box says 3.50', +k.cost>1.4 && +k.cost<1.6 && k.win==='3.50', k);
  await p.selectOption('#abHost .eb-book','Novig'); await p.waitForTimeout(150); await p.fill('#abHost .eb-fsh','10'); await p.fill('#abHost .eb-fat','52'); await p.waitForTimeout(150);
  const n=await p.evaluate(()=>({cost:document.querySelector('#abHost .eb-cost').value, win:document.querySelector('#abHost .eb-win').value})); check('Novig: 10 shares at 52¢ cost $5.20 (no fee on Novig) and pay $10.00', n.cost==='5.20' && n.win==='10.00', n);
  await p.selectOption('#abHost .eb-mode','odds'); await p.waitForTimeout(100); check('switching to odds hides the row again (the form is as before)', !(await vis('#abHost .eb-fill')), 0);
  { const out=await p.evaluate(()=>{ const tr=document.createElement('div'); tr.className='pcard'; document.body.appendChild(tr);
      const r={name:'Isaiah Joe',book:'Polymarket US',offeredRaw:'-122',offeredProb:0.55,fairProb:0.612,mktProb:0.58,stake:2.5,kind:'prop',market:'3.5 Threes',side:'U',sport:'NBA',game:'MIL @ DET',team:'DET',src:'api:NBA:props'};
      openBetEditor(tr,r,{}); const g=s=>{ const e=tr.querySelector(s); return e?e.value:null; }; const o={hidden:tr.querySelector('.eb-fill').hidden, sh:g('.eb-fsh'), lim:g('.eb-flim'), fat:g('.eb-fat'), cost:g('.eb-cost'), pct:g('.eb-pct'), win:g('.eb-win')}; tr.remove(); return o; });
    check('I bet this on a card pre-fills Shares and Limit from the card\u2019s TYPE THIS numbers (whole shares, the limit, Filled at = the limit) and works out cost and payout, never over the card\u2019s $2.50', out.hidden===false && +out.sh>=1 && +out.sh===Math.floor(+out.sh) && +out.lim>=1 && out.fat===out.lim && +out.cost>0 && +out.cost<=2.5 && +out.win===+out.sh, out); }
  check('no page errors', !errs.length, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0); })();
