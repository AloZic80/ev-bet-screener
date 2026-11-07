// node tests/sentinel-card-test.js — v4.21. Alonzo, showing OddsJam's Momentum: "I want it like this", "they call it Momentum, we call it
// Sentinels", "we already know La Contadora allowed the bet, so we might not need all the info, unless they want it, or a drop-down", "you
// decide, make a nice GUI, phone and Mac". Each Place these card is short: score, book + edge, freshness, kickoff, who / what / game, the bet
// (pick, stake, pays, price chip), the order and other tags, I bet this. "Why this play?" (closed, remembered per bet) has the rest: tiles,
// the score's parts, the price chart (history kept on the device), the Kalshi steps, notes, Share. Checked at 390, 1000, 1280 and 1960 px.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const NOW=Date.parse('2026-11-07T18:50:00Z'), H=3600e3, M=60e3, iso=ms=>new Date(ms).toISOString(), DAY='2026-11-07';
const T=(ha,abbr,loc,nick,short)=>({ha,id:abbr,abbr,name:short,loc,nick,logo:'',rec:'',color:'333333',alt:'ffffff'});
const LAC=[T('away','LAC','Los Angeles','Clippers','LA Clippers'),T('home','MIN','Minnesota','Timberwolves','Minnesota')];
const prop=(name,team,market,side,book,odds,p,fair,mkt,k,start,extra)=>Object.assign({name,team,game:'LAC @ MIN',matchup:'LAC @ MIN',side,sport:'NBA',market,kind:'prop',book,offeredRaw:odds,offeredProb:p,fairProb:fair,fairRaw:'',mktProb:mkt,stars:4,evModel:'market',
  gameInfo:{state:'pre',startISO:iso(start),timeCT:'',detail:'',teams:LAC},src:'api:NBA:props',apiKey:k},extra||{});
const ROWS=[prop('Rui Hachimura','LAC','4.5 Rebounds','O','Polymarket US','+177',0.36,0.40,0.395,'k1',NOW+7*H,{loadedAt:iso(NOW-55*1000)}),
            prop('Naz Reid','MIN','16.5 Points','O','Novig','-108',0.52,0.545,0.54,'k2',NOW+6*H,{loadedAt:iso(NOW-40*M)})];
const key=(n,m,s,st)=>['NBA',n,m,s,new Date(st).toISOString().slice(0,10)].join('|'), t=Math.floor(NOW/60000);
const PX={[key('rui hachimura','4 5 rebounds','O',NOW+7*H)]:[[t-50,0.405,0.40],[t-30,0.39,0.40],[t-6,0.36,0.40]]};
(async()=>{
  const b=await chromium.launch();
  for(const W of [390,1000,1280,1960]){
    const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:W,height:1000}}); await ctx.clock.install({time:new Date(NOW)});
    await ctx.addInitScript(([rows,d,px])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows})); localStorage.setItem('mbev.px',JSON.stringify(px)); }catch(e){} }, [ROWS,DAY,PX]);
    const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
      if(/\/live\?/.test(u)) return r.fulfill({contentType:'application/json',body:JSON.stringify({results:{}})});
      if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
    await p.goto('http://app.test/'); await p.waitForTimeout(800);
    await p.evaluate(()=>{ const i=document.getElementById('books'); i.value='Novig, Polymarket US'; i.dispatchEvent(new Event('input',{bubbles:true})); }); await p.waitForTimeout(700);
    const card=n=>p.evaluate(n=>{ const c=[...document.querySelectorAll('#placeCards .sc-card')].find(x=>x.textContent.includes(n)); if(!c) return null; const d=c.querySelector('details.sc-why'), r=c.getBoundingClientRect();
      return {text:c.innerText.replace(/\s+/g,' '), score:+(c.querySelector('.sc-score')||{}).textContent, open:!!(d&&d.open), price:(c.querySelector('.sc-price')||{}).className, bet:!!c.querySelector('.sc-act .bet-btn'), w:Math.round(r.width), right:Math.round(r.right),
        age:(c.querySelector('.sc-pill.age')||{}).className||'', mv:(c.querySelector('.sc-pill.mv')||{}).textContent||'', chart:!!c.querySelector('.sc-svg .l-p'), leg:(c.querySelector('.sc-leg')||{}).textContent||''}; }, n);
    const R=await card('Hachimura'), N=await card('Naz Reid');
    if(W===390){
      check('the short card: score, book + edge after fees, ⏱ 55s, kickoff and game, who / what, the bet, stake, pays, price chip, I bet this', R && R.score>0 && /\+6\.4%/.test(R.text) && /⏱ 5\ds/.test(R.text) && /Today 7:50 PM CT/.test(R.text) && /Los Angeles @ Minnesota/.test(R.text) && /Rui Hachimura LAC/.test(R.text) && /Rebounds/.test(R.text) && /Over 4\.5/.test(R.text) && /\$\d+\.\d\d pays \$\d+\.\d\d/.test(R.text) && /\+178 36¢/.test(R.text) && R.bet, R&&R.text);
      check('Why this play? is closed: the tiles, score parts and chart are not on the short card', R && !R.open && !/EV AFTER FEES/i.test(R.text) && !/Score \d+ of 100/i.test(R.text), R&&R.open);
      // the score: Edge 50·min(1, EV/6%) + Market (vs the market price after fees) + Fresh (≤3 min 20, 0 at 90)
      const S=await p.evaluate(()=>{ const r=lastRows.find(x=>/Hachimura/.test(x.name)), n=lastRows.find(x=>/Naz/.test(x.name)); return {r:sentScore(r), n:sentScore(n), rNet:r.net, rM:r.mktNet, rSharp:!!r.mktSharp, nNet:n.net, nM:n.mktNet, nSharp:!!n.mktSharp}; });
      const exp=(net,mn,sharp,ageMs)=>{ const e=Math.round(50*Math.max(0,Math.min(1,net/0.06))); let m=mn==null?8:(mn>0?20+10*Math.min(1,mn/0.04):20*Math.max(0,1+mn/0.03)); if(mn!=null && !sharp) m*=0.85; m=Math.round(m);
        const f=ageMs<=3*M?20:ageMs>=90*M?0:Math.round(20*(1-(ageMs-3*M)/(87*M))); return {total:e+m+f, e, m, f}; };
      const eR=exp(S.rNet,S.rM,S.rSharp,55e3), eN=exp(S.nNet,S.nM,S.nSharp,40*M);
      check('the score adds up: edge + market + fresh, worked out here on its own (Rui '+eR.total+', Naz '+eN.total+')', S.r.total===eR.total && S.r.e===eR.e && S.r.m===eR.m && S.r.f===eR.f && S.n.total===eN.total && S.n.f===eN.f && R.score===eR.total, {S, eR, eN});
      check('a price read 40 min ago is marked old (amber), with "Send the Sentinels" on hover', /\bold\b/.test(N.age) && /⏱ 40m/.test(N.text), N.age);
      check('the price fell 4.5 points in the last hour: "↘ −4.5 pts" on the card', /↘ −4\.5 pts/.test(R.mv), R.mv);
      // open it: tiles, the score's parts, the chart with its legend in the card's units
      await p.evaluate(()=>{ const c=[...document.querySelectorAll('#placeCards .sc-card')].find(x=>/Hachimura/.test(x.textContent)); c.querySelector('details.sc-why summary').click(); }); await p.waitForTimeout(250);
      const O=await card('Hachimura');
      check('Why this play? opens: EV after fees, Fair, OK up to, Market, Consensus, Projection, Rating, Hit rate; Score n of 100 with Edge / Market / Fresh', O.open && /EV AFTER FEES/i.test(O.text) && /FAIR/i.test(O.text) && /OK UP TO/i.test(O.text) && new RegExp('Score '+eR.total+' of 100','i').test(O.text) && /Edge \d+\/50/.test(O.text) && /Market \d+\/30/.test(O.text) && /Fresh 20\/20/.test(O.text), O.text.slice(0,600));
      check('the price chart: the price line, the fair line and "OK to" in cents like the card (Polymarket)', O.chart && /Polymarket US price/.test(O.leg) && /fair \(La Contadora\)/.test(O.leg) && /OK to \d+¢/.test(O.leg), O.leg);
      // remembered: a background redraw and a reload keep it open
      await p.evaluate(()=>{ const c=cfgRead(); render(audit(lastRows,c),c); }); await p.waitForTimeout(500);
      const A1=await card('Hachimura');
      await p.reload(); await p.waitForTimeout(1500);
      const A2=await card('Hachimura');
      check('it stays open after a redraw and after a reload (remembered on this device)', A1.open && A2 && A2.open, {redraw:A1.open, reload:A2&&A2.open});
      // a new price is saved for the chart
      const n0=await p.evaluate(()=>pxSeries(lastRows.find(x=>/Naz/.test(x.name))).length);
      await p.clock.fastForward(120000);   // the chart keeps one point a minute
      await p.evaluate(()=>{ const r=lastRows.find(x=>/Naz/.test(x.name)); r.offeredProb=0.5; r.offeredRaw='+100'; pxNote(r); });
      const n1=await p.evaluate(()=>pxSeries(lastRows.find(x=>/Naz/.test(x.name))).length);
      check('a new price is saved for the chart (one more point)', n1===n0+1, {n0, n1});
      // a price read live by the Sentinels makes it fresh
      await p.evaluate(()=>{ const r=lastRows.find(x=>/Naz/.test(x.name)); r._liveAt=Date.now(); const c=cfgRead(); render(audit(lastRows,c),c); }); await p.waitForTimeout(400);
      const N2=await card('Naz Reid');
      check('after a live check the age is "⏱ 0s" and no longer old', /⏱ 0s/.test(N2.text) && !/\bold\b/.test(N2.age), N2.age);
      // I bet this opens under the buttons
      await p.click('#placeCards .sc-card .sc-act .bet-btn'); await p.waitForTimeout(250);
      check('I bet this opens its box under the card\'s buttons', await p.evaluate(()=>!!document.querySelector('#placeCards .sc-card .sc-act + .editor')), true);
      await p.evaluate(()=>{ const c=document.querySelector('#placeCards .editor .eb-cancel'); if(c) c.click(); }); await p.waitForTimeout(500);
      // sort by the score
      await p.selectOption('#sortBy','score'); await p.waitForTimeout(400);
      const order=await p.evaluate(()=>[...document.querySelectorAll('#placeCards .sc-card')].map(c=>+c.querySelector('.sc-score').textContent));
      check('Sort › Sentinel score puts the highest score first', order.length===2 && order[0]>=order[1], order);
    }
    if(W===1280){
      // the price chip opens the slip at the book (an exchange): the side window opens
      const opened=await p.evaluate(async()=>{ let n=0; window.open=()=>{ n++; return {location:{}, closed:false}; }; const c=[...document.querySelectorAll('#placeCards .sc-card')].find(x=>/Hachimura/.test(x.textContent)); c.querySelector('.sc-price').click(); await new Promise(r=>setTimeout(r,400)); return n; });
      check('tapping the price chip opens the slip at the book (Polymarket US)', opened===1 && /\bgo\b/.test(R.price), {opened, cls:R.price});
    }
    const L=await p.evaluate(()=>{ const cs=[...document.querySelectorAll('#placeCards .sc-card')], R=cs.map(c=>c.getBoundingClientRect()), tops=new Set(R.map(r=>Math.round(r.top)));
      const c=cs[0], mid=e=>{ const r=c.querySelector(e).getBoundingClientRect(); return r.top+r.height/2; }, xs=['.sc-top','.sc-who','.sc-bet','.sc-act'].map(e=>Math.round(c.querySelector(e).getBoundingClientRect().left));
      return {n:cs.length, perRow:cs.length-tops.size+1, vw:document.documentElement.clientWidth, sw:document.documentElement.scrollWidth, right:Math.max(...R.map(r=>r.right)),
        row:Math.max(...['.sc-who','.sc-bet','.sc-act'].map(mid))-Math.min(...['.sc-who','.sc-bet','.sc-act'].map(mid)), lr:xs.every((x,i)=>i===0||x>xs[i-1])}; });
    // v4.22 (Alonzo: "on a computer, one per line, and side to side"): one card per line everywhere; on a computer its parts sit in a row
    check(W+' px: one card per line'+(W<600?'':', its parts side by side (score | who | the bet | buttons)')+', nothing runs off the screen', L.sw<=L.vw+1 && L.right<=L.vw+1 && L.perRow===1 && (W<600 || (L.lr && L.row<40)), L);
    check(W+' px: no page errors', !errs.length, errs);
    await ctx.close();
  }
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
