// node tests/model-only-parlay-test.js — v4.55. Owner, 11/10, passing on ChatGPT's reply to v4.54:
// 1 Parlay picks use La Contadora's chance (min(model, blend)), not the blend. 2 An outlier Make must still beat the market. 3 A new book must beat the
// current one by 0.3 points of her EV to switch. 4 Bets with no market price: five a game day, one a game, their own label.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,700)); };
const NOW=Date.parse('2026-11-10T19:00:00Z'), iso=ms=>new Date(ms).toISOString(), DAY='2026-11-10', KO=Date.parse('2026-11-11T01:15:00Z');
const T=(ha,abbr)=>({ha,id:abbr,abbr,name:abbr+' Team',loc:abbr,nick:'Team',logo:'',rec:'',color:'333333',alt:'ffffff'});
const GI=i=>({state:'pre',startISO:iso(KO+i*10*60e3),eventId:'40300'+i,timeCT:'',detail:'',teams:[T('away','A'+i),T('home','H'+i)]});
const am=p=>p>=0.5?String(Math.round(-100*p/(1-p))):'+'+Math.round(100*(1-p)/p);
const prop=(id,name,market,price,fair,mkt,g)=>({name,team:'A'+g,game:'A'+g+' @ H'+g,matchup:'A'+g+' @ H'+g,side:'O',sport:'NHL',market,kind:'prop',book:'Novig',offeredRaw:am(price),offeredProb:price,fairProb:fair,fairRaw:am(fair),mktProb:mkt,stars:4,evModel:'projection',projValue:2,gameInfo:GI(g),src:'api:NHL:props',apiKey:id,loadedAt:iso(NOW-60e3)});
// seven model-only bets (no market price) in games 1 to 6, two of them in game 1; her EV = the model's: 53+i ÷ 50 − 1
const MO=[1,2,3,4,5,6].map(i=>prop('mo'+i,'Model Only '+i,'1.5 Shots',0.50,0.53+i*0.002,null,i)).concat([prop('mo1b','Second In Game','2.5 Shots',0.50,0.531,null,1)]);
const ROWS=MO.concat([prop('below','Ben Below','2.5 Points',0.52,0.56,0.60,7), prop('above','Adam Above','1.5 Points',0.52,0.55,0.525,8)]);
const LOGGED=n=>Array.from({length:n},(_,i)=>({id:'m'+i,key:'m'+i,name:'Held '+i,sport:'NBA',kind:'prop',market:'9.5 Points',side:'O',book:'Bovada',odds:'-110',offeredRaw:'-110',stake:1,fee:0,date:DAY,dateSet:true,start:iso(KO),snap:{at:iso(NOW-3600e3),modelOnly:true,said:{decision:'BET',onList:true}}}));
async function open(b,log){ const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:1280,height:900}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(([R,d,L])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig, Kalshi, Bovada',bank:'500',cfgVer:3.03})); localStorage.setItem('mbev.cards','0');
    localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows:R})); if(L) localStorage.setItem('mbev.log',JSON.stringify(L)); }catch(e){} },[ROWS,DAY,log||null]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1300);
  const rows=()=>p.evaluate(()=>lastRows.map(r=>({k:r.apiKey, stake:+(+r.stake||0).toFixed(2), noMkt:!!r.noMkt, act:r.actNet, moN:r.moN||0, warn:(r.flags||[]).filter(f=>f[0]==='warn').map(f=>f[1]).join(' | '), dec:(document.createElement('div').innerHTML=decisionHtml(r,cfgRead()), decisionHtml(r,cfgRead()).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim())})));
  return {ctx,p,errs,rows}; }
(async()=>{
  const b=await chromium.launch(); let S=await open(b), R=await S.rows(); const g=k=>R.find(x=>x.k===k)||{};
  const mo=R.filter(x=>x.noMkt), got=mo.filter(x=>x.stake>0).map(x=>x.k);
  check('model-only bets: five a game day keep their $1.00, the best by her EV first (games 6, 5, 4, 3, 2: +7.4% down to +5.8%)', got.length===5 && ['mo6','mo5','mo4','mo3','mo2'].every(k=>g(k).stake===1) && mo.filter(x=>x.stake>0).every(x=>x.stake===1), mo.map(x=>[x.k,x.stake,+(x.act*100).toFixed(1)]));
  check('the sixth is skipped: "model-only limit reached (5 a day, no market confirmation)"; the cell reads SKIP · model-only limit (5 a day)', g('mo1').stake===0 && /model-only limit reached \(5 a day, no market confirmation\)/.test(g('mo1').warn) && /SKIP model-only limit \(5 a day\)/.test(g('mo1').dec), g('mo1'));
  check('each kept one is labelled on its own, not as an outlier: "MODEL ONLY $1.00 · no market confirmation · n of 5 today", counting 1 to 5 in her order', /^MODEL ONLY \$1\.00 no market confirmation 1 of 5 today$/.test(g('mo6').dec) && /5 of 5 today$/.test(g('mo2').dec) && !/OUTLIER/.test(g('mo6').dec), [g('mo6').dec, g('mo2').dec]);
  check('market-checked bets are not counted or capped by it (Ben $5.21, Adam $1.79)', g('below').stake===5.21 && g('above').stake===1.79 && !g('below').noMkt, [g('below').stake, g('above').stake]);
  check('no page errors (1)', !S.errs.length, S.errs); await S.ctx.close();
  // one a game: drop the cap pressure (only games 1 and 2) so the game rule is what decides
  S=await open(b, LOGGED(3)); R=await S.rows();
  const got2=R.filter(x=>x.noMkt && x.stake>0).map(x=>x.k);
  check('three model-only bets already logged on today’s games: only two more are given (games 6 and 5), labelled "4 of 5" and "5 of 5"', got2.join()===['mo5','mo6'].join() || got2.join()===['mo6','mo5'].join(), {got2, dec:[g('mo6').dec, g('mo5').dec]});
  check('…and their labels count the logged ones', /4 of 5 today$/.test(g('mo6').dec) && /5 of 5 today$/.test(g('mo5').dec), [g('mo6').dec, g('mo5').dec]);
  await S.ctx.close();
  S=await open(b); const one=await S.p.evaluate(()=>{ const rows=lastRows.filter(r=>r.apiKey==='mo1'||r.apiKey==='mo1b'||r.apiKey==='below').map(r=>Object.assign({},r)); const out=audit(rows,cfgRead()); return out.map(r=>({k:r.apiKey, stake:+(+r.stake||0).toFixed(2), warn:(r.flags||[]).filter(f=>f[0]==='warn').map(f=>f[1]).join(' | ')})); });
  const o=k=>one.find(x=>x.k===k)||{};
  check('one a game: two model-only props in game 1 (+6.4% and +6.2%): the better keeps $1.00, the other says "model only: one a game, and a better one is in this game"', o('mo1').stake===1 && o('mo1b').stake===0 && /model only: one a game, and a better one is in this game/.test(o('mo1b').warn), one);
  // parlays on her chance
  const pk=await S.p.evaluate(()=>{ refresh(); const r=lastRows.find(x=>x.apiKey==='below'), a=lastRows.find(x=>x.apiKey==='above'), n=lastRows.find(x=>x.apiKey==='mo6'); pkState.app='PrizePicks';
    const L=pkLegs(lastRows), f=k=>(L.find(l=>l.name===lastRows.find(x=>x.apiKey===k).name)||{}).p;
    return {below:pkProbOf(r), blend:r.blendProb, above:pkProbOf(a), nomkt:pkProbOf(n), legBelow:f('below'), legAbove:f('above'), src:/policy:'actProb-v2'/.test(document.documentElement.innerHTML)}; });
  check('Parlays: a pick’s chance is La Contadora’s. Ben (model 56%, market 60%): 56%, not the blend’s 58.6%; Adam (model above the market): the blend 53.375%, as before; no market: the model', Math.abs(pk.below-0.56)<1e-9 && Math.abs(pk.blend-0.586)<1e-9 && Math.abs(pk.above-0.53375)<1e-9 && Math.abs(pk.nomkt-0.542)<1e-9, pk);
  check('the pick list on the Parlays tab carries those chances, and a logged entry is saved with policy "actProb-v2"', Math.abs(pk.legBelow-0.56)<1e-9 && Math.abs(pk.legAbove-0.53375)<1e-9 && pk.src, {legBelow:pk.legBelow, legAbove:pk.legAbove, src:pk.src});
  // rules kept (ChatGPT: keep them): outlier Makes must beat the market; 0.3-point switch
  const kept=await S.p.evaluate(()=>{ const cfg=cfgRead(), fee=p=>makerFee('Novig',p), act=okProb(0.62,0.50), capAct=priceForNet(act,fee,cfg.eMin), capMkt=priceForNet(0.50,fee,0.0005);
    return {act, capAct, capMkt, src:document.documentElement.innerHTML.includes('if(outlierMode && capMkt!=null) cap=Math.min(cap,capMkt)') && document.documentElement.innerHTML.includes('if(out && mNet!=null && mNet<=0) return;'), hyst:(document.documentElement.innerHTML.match(/nt>best\.net\+0\.003/g)||[]).length}; });
  check('an outlier Make must still beat the market: model 62%, market 50% → her chance 54.2%; her cap alone would allow 53.4%, the market’s breakeven is 49.98%, and the lower one wins', Math.abs(kept.act-0.542)<1e-9 && Math.abs(kept.capAct-0.542/1.015)<1e-6 && kept.capMkt<0.5 && kept.capMkt<kept.capAct && kept.src, kept);
  check('a new book must beat the current one by 0.3 points of her EV to switch (both the Sentinels and the book swap)', kept.hyst===2, kept.hyst);
  check('no page errors (2)', !S.errs.length, S.errs); await S.ctx.close(); await b.close();
  console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail?1:0);
})();
