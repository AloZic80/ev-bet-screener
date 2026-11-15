// node tests/v512-screen-test.js [path/to/index.html] — v5.12 bug fixes (screen and words; owner 11/15: "ok").
// (1) the pop-up message ("✓ Saved") reads at 4.5:1 or more in dark mode (it was about 1.8:1); light mode is as before. (2) the parlay form's "Paid $" says "Paid back $".
// (3) Betr / Betr Picks are one book (Polymarket and Polymarket US stay two: owner 11/15, different books) in the chips, Reports and the Scorecard split (saved bets are not rewritten).
// (4) the TODAY ribbon gives a pick'em app (PrizePicks, Underdog, Sleeper, Betr, ParlayPlay) a tile of its own when the day has an entry from it.
// (5) Reports › Open bets: a pending parlay shows its To win (Pays if all hit − entry, as betProfit pays it). (6) the calendar leaves parlays out of "against the screener".
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,700)); };
const NOW=Date.parse('2026-11-15T18:00:00Z'), H=3600e3, iso=ms=>new Date(ms).toISOString();   // Sun 12:00 PM CT
const par=(id,book,all,extra)=>Object.assign({id, kind:'parlay', sport:'PARLAY', book, name:'Parlay · 3 picks', market:'3-pick parlay', odds:'+400', stake:5, date:'2026-11-15', dateSet:true,
  parlay:{picks:3, legs:'a; b; c', pays:{all, m1:0, m2:0}, hits:null, payout:null}, result:'pending', snap:{at:iso(NOW-H), said:{decision:'PARLAY', onList:false}}}, extra||{});
const single=(id,book)=>({id, kind:'prop', sport:'NFL', book, name:'Player '+id, market:'Over 1.5 TD', side:'O', odds:'+100', stake:5, date:'2026-11-15', dateSet:true, result:'pending', snap:{at:iso(NOW-H), said:{decision:'BET', onList:true}}});
const LOG=[par('p1','PrizePicks',25), par('p2','Betr Picks',30), par('p3','Underdog',20,{free:true}), par('p4','ParlayPlay',18), par('p5','Sleeper',12), par('p6','Betr',16),
  single('s1','Betr'), single('s2','Betr Picks'), single('s3','Polymarket'), single('s4','Polymarket US'), single('s5','DraftKings')];
async function open(b, log, w){ const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:w||1280,height:1000}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(([L])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.log',JSON.stringify(L)); }catch(e){} }, [log]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1300); return {ctx,p,errs}; }
const tab=async(p,v)=>{ await p.evaluate(v=>document.querySelector('.tab[data-view="'+v+'"]').click(), v); await p.waitForTimeout(600); };
(async()=>{
  const b=await chromium.launch();
  let S=await open(b,LOG); const p=S.p;
  // (1) the pop-up message, light and dark
  const contrast=async theme=>p.evaluate(theme=>{ document.documentElement.setAttribute('data-theme',theme); savedToast('✓ Saved: test'); const el=document.getElementById('savedToast'); el.style.transition='none';
    const rgb=s=>s.match(/[\d.]+/g).slice(0,3).map(Number), L=c=>{ const a=c.map(v=>{ v/=255; return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4); }); return 0.2126*a[0]+0.7152*a[1]+0.0722*a[2]; };
    const cs=getComputedStyle(el), f=L(rgb(cs.color)), g=L(rgb(cs.backgroundColor)); return {fg:cs.color, bg:cs.backgroundColor, ratio:+((Math.max(f,g)+0.05)/(Math.min(f,g)+0.05)).toFixed(2)}; }, theme);
  const dk=await contrast('dark'); check('dark mode: the pop-up message reads at 4.5:1 or more', dk.ratio>=4.5, dk);
  const lt=await contrast('light'); check('light mode: the pop-up message is as before (white on the green, no change)', lt.fg==='rgb(255, 255, 255)' && lt.ratio>=3, lt);
  await p.evaluate(()=>document.documentElement.setAttribute('data-theme','light'));
  // (2) Paid back $
  const lab=await p.evaluate(()=>{ const l=document.querySelector('#addBetPanel label[for="abParPaid"]'); return {text:l&&l.textContent.trim(), ids:!!document.getElementById('abParPaid')}; });
  check('+ Add a bet › Parlay: the label says "Paid back $" and the box keeps its id', lab.text==='Paid back $' && lab.ids, lab);
  const noOld=await p.evaluate(()=>[...document.querySelectorAll('#addBetPanel label, #parlayPanel label')].map(l=>l.textContent.trim()).filter(t=>/^Paid \$/.test(t)));
  check('no parlay form label still says "Paid $"', noOld.length===0, noOld);
  // (3) books
  const names=await p.evaluate(()=>({a:bookLabel('Betr Picks'), b:bookLabel('Betr'), c:bookLabel('Polymarket'), d:bookLabel('Polymarket US'), kept:logged.filter(x=>x.book==='Betr Picks'||x.book==='Polymarket').length}));
  check('bookLabel groups Betr Picks with Betr, but not Polymarket with Polymarket US (different books); the saved bets keep their own names', names.a===names.b && names.c!==names.d && names.kept===3, names);
  const split=await p.evaluate(()=>{ const t=document.querySelector('#v-perf')? document.body.innerText:''; return null; });
  await tab(p,'v-reports');
  const opts=await p.evaluate(()=>[...document.querySelectorAll('#rpBook option')].map(o=>o.textContent));
  check('Reports › Book menu lists Betr once and Polymarket and Polymarket US apart', opts.filter(x=>/^Betr/.test(x)).length===1 && opts.filter(x=>/^Polymarket/.test(x)).length===2, opts);
  // (5) Reports › Open bets, To win of a pending parlay
  const rows=await p.evaluate(()=>[...document.querySelectorAll('#rpOpen tbody tr')].map(tr=>[...tr.children].map(td=>td.textContent.trim()).join(' | ')).filter(t=>/Parlay/.test(t)));
  const tw=await p.evaluate(()=>[...document.querySelectorAll('#rpOpen tbody tr')].filter(tr=>/Parlay/.test(tr.textContent)).map(tr=>[tr.children[2].textContent.trim(), tr.querySelector('td[data-l="To win"]').textContent.trim()]));
  const m={}; tw.forEach(x=>{ m[x[0]]=m[x[0]]||[]; m[x[0]].push(x[1]); });
  check('Reports › Open bets: a pending parlay shows To win (PrizePicks $25 − $5 entry = $20.00; the free Underdog $20 − $5 = $15.00, as betProfit pays it)', tw.length>=5 && m['PrizePicks'] && m['PrizePicks'][0]==='$20.00' && m['Underdog'] && m['Underdog'][0]==='$15.00' && !tw.some(x=>x[1]==='—'), tw);
  // (6) calendar
  await tab(p,'v-log');
  const cal=await p.evaluate(()=>{ const t=document.getElementById('daysBody').innerText.replace(/\s+/g,' '); return t; });
  const n=(cal.match(/(\d+) against the screener/)||[])[1];
  check('Bet log calendar: 6 parlays (saved onList false) and 5 singles that were on the list: nothing is "against the screener"', !/against/.test(cal) && /5 on/.test(cal), cal.slice(0,300));
  // (4) TODAY ribbon tiles
  const tiles=await p.evaluate(()=>[...document.querySelectorAll('#todayBar .tb-t')].map(t=>(t.querySelector('.nm')?t.querySelector('.nm').textContent:(t.querySelector('img')?t.querySelector('img').alt:t.querySelector('.tb-l1 b')&&'All'))+':'+(t.querySelector('.tb-l1 .open')?'':'')+((t.getAttribute('title')||'').match(/(\d+) bets?/)||[])[1]));
  const names2=await p.evaluate(()=>[...document.querySelectorAll('#todayBar .tb-t')].map(t=>t.getAttribute('title')||t.className));
  const joined=names2.join(' / ');
  check('TODAY ribbon: PrizePicks, Underdog, Sleeper, Betr, ParlayPlay each have their own tile (Betr and Betr Picks together: 4 bets)', ['PrizePicks: 1 bet','Underdog: 1 bet','Sleeper: 1 bet','ParlayPlay: 1 bet','Betr: 4 bets'].every(s=>names2.some(t=>t.startsWith(s))) && !/Other/.test(joined), names2);
  check('no page errors', !S.errs.length, S.errs); await S.ctx.close();
  // layouts at 390 and 1280
  for(const w of [390,1280]){ const T=await open(b,LOG,w); await tab(T.p,'v-reports');
    const ov=await T.p.evaluate(()=>({sw:document.documentElement.scrollWidth, cw:document.documentElement.clientWidth}));
    check('Reports at '+w+' px: no sideways scrolling of the page', ov.sw<=ov.cw+1, ov);
    await tab(T.p,'v-log'); const ov2=await T.p.evaluate(()=>({sw:document.documentElement.scrollWidth, cw:document.documentElement.clientWidth}));
    check('Bet log at '+w+' px: no sideways scrolling of the page', ov2.sw<=ov2.cw+1, ov2);
    await T.p.screenshot({path:'/tmp/claude-0/-home-user/c5370435-0dbc-56b4-aaf1-597d242c119b/scratchpad/bugs-work/v512-'+w+'.png'});
    await T.ctx.close(); }
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
