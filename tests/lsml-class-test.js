// node tests/lsml-class-test.js — v4.69 (agreed with ChatGPT, owner: "ok, after you check > BUILD"): which logged moneyline counts toward the
// 3 long-shot moneylines a game day. First answer wins: (1) La Contadora's chance saved with the bet; (2) the latest board reading of the exact bet
// seen at or before the time you placed it and before kickoff; (3) the model's fair chance under 45% OR the price you paid under 45%.
// A 45%-or-more answer from (1) or (2) stops there. The source is saved on the bet. Every expected number is worked here by hand.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,700)); };
const NOW=Date.parse('2026-11-11T19:00:00Z'), H=3600e3, iso=ms=>new Date(ms).toISOString(), DAY='2026-11-11', KO=Date.parse('2026-11-12T01:00:00Z');   // kickoff Wed 7:00 PM CT
const ml=(id,team,o)=>Object.assign({id,key:id,sport:'NBA',kind:'moneyline',name:team,team,game:team+' @ OPP'+id,market:'Moneyline',side:'',betnow:team+' ML',book:'Novig',odds:'-110',fair:'',stake:1,date:DAY,dateSet:true,start:iso(KO),placedAt:iso(NOW-3*H),result:'pending',snap:{at:iso(NOW-3*H)}},o);
// By hand: +150 → 100/250 = 40.0%; −110 → 110/210 = 52.4%; +123 → 100/223 = 44.84% (under 45%); +122 → 100/222 = 45.05% (not); +200 → 33.3%.
// Board readings: model 42%, market 38% → La Contadora 0.38 + 0.35 × 0.04 = 39.4%. Model 52%, market 49% → 0.49 + 0.35 × 0.03 = 50.05%.
const LOG=[ml('s1','AAA',{snap:{at:iso(NOW-3*H),act:0.40}}),              // 1: saved 40% → counts
  ml('s2','BBB',{snap:{at:iso(NOW-3*H),act:0.46},odds:'+200',fair:'+150'}), // 1: saved 46% → not, and the +200 price and 40% fair are not asked
  ml('b1','CCC'),                                                         // 2: reading before placement 39.4% → counts (a later reading is ignored)
  ml('b2','DDD'),                                                         // 2: only a reading after placement → skipped; −110, no fair → not
  ml('b3','EEE',{odds:'+200'}),                                           // 2: reading before placement 50.05% → not, the +200 price is not asked
  ml('f1','FFF',{fair:'+150'}),                                           // 3: model 40% → counts (model_fair_fallback)
  ml('p1','GGG',{odds:'+123'}),                                           // 3: paid 44.84% → counts (paid_price_inferred)
  ml('p2','HHH',{odds:'+122'}),                                           // 3: paid 45.05% → not
  ml('fp','III',{fair:'+150',odds:'+200'}),                               // 3: both → counts (model_fair_and_paid_price)
  ml('t1','JJJ',{placedAt:undefined}),                                    // no placedAt: the board reading is not used; −110 → not
  ml('t2','KKK',{start:undefined})];                                      // no kickoff: same
const T=(ha,abbr)=>({ha,id:abbr,abbr,name:abbr+' Team',loc:abbr,nick:'Team',logo:'',rec:'',color:'333333',alt:'ffffff'});
// one long-shot moneyline on the board: La Contadora 39.4% at 36% (+9.44%); five are logged today, so it must hit the limit
const ROW={name:'ZZZ',team:'ZZZ',game:'ZZZ @ YYY',matchup:'ZZZ @ YYY',side:'',sport:'NBA',market:'Moneyline',kind:'moneyline',book:'Novig',offeredRaw:'+178',offeredProb:0.36,fairProb:0.42,fairRaw:'',mktProb:0.38,stars:null,evModel:'market',
  gameInfo:{state:'pre',startISO:iso(KO),eventId:'55501',timeCT:'',detail:'',teams:[T('away','ZZZ'),T('home','YYY')]},src:'api:NBA:lines',apiKey:'Z',loadedAt:iso(NOW-60e3)};
(async()=>{ const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:1280,height:900}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(([L,R,d])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig',bank:'500',cfgVer:3.03})); localStorage.setItem('mbev.cards','0');
    localStorage.setItem('mbev.log',JSON.stringify(L)); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows:R})); }catch(e){} },[LOG,[ROW],DAY]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1300);
  // board readings ([minute, price, model, market]): before placement (NOW − 4 h) and after it (NOW − 1 h)
  await p.evaluate(([NOW,H])=>{ const m=t=>Math.floor(t/60000), S=pxAll(), key=id=>{ const b=logged.find(x=>x.id===id); return pxKey({sport:b.sport,name:b.name,market:b.market,side:b.side||'',gameInfo:{startISO:b.start||'2026-11-12T01:00:00.000Z'}}); };
    S[key('b1')]=[[m(NOW-4*H),0.36,0.42,0.38],[m(NOW-1*H),0.50,0.60,0.55]];
    S[key('b2')]=[[m(NOW-1*H),0.36,0.42,0.38]];
    S[key('b3')]=[[m(NOW-4*H),0.48,0.52,0.49]];
    S[key('t1')]=[[m(NOW-4*H),0.36,0.42,0.38]]; S[key('t2')]=[[m(NOW-4*H),0.36,0.42,0.38]];
    refresh(); },[NOW,H]); await p.waitForTimeout(500);
  const C=await p.evaluate(()=>Object.fromEntries(logged.map(b=>{ const c=lsmlClass(b); return [b.id,{src:c.src, p:c.p!=null?+(+c.p).toFixed(4):null, lsml:c.lsml, obsAt:c.obsAt||null, saved:b.lsmlCls?b.lsmlCls.src:null}]; })));
  const is=(id,src,lsml,pp)=>C[id].src===src && C[id].lsml===lsml && (pp==null || Math.abs(C[id].p-pp)<1e-4);
  check('s1: La Contadora 40% saved with the bet → counts (snapshot_act)', is('s1','snapshot_act',true,0.40), C.s1);
  check('s2: saved 46% → not a long shot, and the +200 price (33.3%) and the 40% fair are not asked', is('s2','snapshot_act',false,0.46), C.s2);
  check('b1: the board reading 4 h before (model 42%, market 38% → 39.4%) is used, not the one 1 h before kickoff (after you placed it) → counts', is('b1','pregame_board_act',true,0.394) && C.b1.obsAt===new Date(Math.floor((NOW-4*H)/60000)*60000).toISOString(), C.b1);
  check('b2: the only reading came after you placed it → not used; −110 and no fair → not a long shot', is('b2','not_long_shot',false), C.b2);
  check('b3: the reading before placement gives 50.05% → not, and the +200 price is not asked', is('b3','pregame_board_act',false,0.5005), C.b3);
  check('f1: no saved chance, no reading, model fair +150 = 40% → counts (model_fair_fallback)', is('f1','model_fair_fallback',true,0.40), C.f1);
  check('p1: only the price you paid, +123 = 44.84% → counts (paid_price_inferred)', is('p1','paid_price_inferred',true,0.4484), C.p1);
  check('p2: +122 = 45.05% → not a long shot', C.p2.lsml===false && C.p2.src==='not_long_shot', C.p2);
  check('fp: model 40% and paid +200 (33.3%) → counts (model_fair_and_paid_price)', is('fp','model_fair_and_paid_price',true,0.40), C.fp);
  check('t1 (no placed time) and t2 (no kickoff): the board reading is not used; −110 → not a long shot', is('t1','not_long_shot',false) && is('t2','not_long_shot',false), {t1:C.t1, t2:C.t2});
  check('the source is saved on every moneyline bet (lsmlCls)', Object.values(C).every(c=>c.saved===c.src), Object.fromEntries(Object.entries(C).map(([k,v])=>[k,v.saved])));
  const Z=await p.evaluate(()=>{ const r=lastRows.find(x=>x.apiKey==='Z'); return {stake:r.stake, flags:(r.flags||[]).map(f=>f[1]).filter(t=>/LONG-SHOT/.test(t))}; });
  check('five logged today count (s1, b1, f1, p1, fp): the board long shot at +9.44% is past the 3 a day, no stake', Z.stake===0 && Z.flags.some(t=>/^LONG-SHOT ML limit reached/.test(t)), Z);
  await p.click('.tab[data-view="v-log"]'); await p.waitForTimeout(300);
  const tags=await p.evaluate(()=>Object.fromEntries([...document.querySelectorAll('#logBody tr')].filter(t=>t.querySelector('.pick')).map(t=>[t.querySelector('.pick').textContent,(t.querySelector('.lsml-tag')||{}).textContent||null])));
  check('the Bet log tags each counted bet with its source; only the price-only one says "inferred from paid price · no forecast snapshot"',
    tags.GGG==='LONG-SHOT ML · inferred from paid price · no forecast snapshot' && tags.AAA==='LONG-SHOT ML · La Contadora 40.0% when you took it' && tags.CCC==='LONG-SHOT ML · board before you placed it: La Contadora 39.4%' && tags.FFF==='LONG-SHOT ML · model 40.0% · not La Contadora’s chance' && tags.III==='LONG-SHOT ML · model 40.0% and the price you paid 33.3%' && tags.BBB===null && tags.HHH===null, tags);
  // the readings are kept 3 days: once they are gone, b1 keeps its saved classification
  await p.evaluate(()=>{ Object.keys(pxAll()).forEach(k=>delete pxAll()[k]); refresh(); }); await p.waitForTimeout(400);
  const b1=await p.evaluate(()=>{ const c=lsmlClass(logged.find(x=>x.id==='b1')); return {src:c.src, p:c.p, lsml:c.lsml}; });
  check('b1 after its board readings are gone: still pregame_board_act 39.4% (saved on the bet)', b1.src==='pregame_board_act' && Math.abs(b1.p-0.394)<1e-4 && b1.lsml, b1);
  check('no page errors', !errs.length, errs);
  await b.close(); console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(fail?1:0); })();
