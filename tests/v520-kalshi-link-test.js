// node tests/v520-kalshi-link-test.js [index.html] — v5.20 (owner 11/18: "Kalshi links, to open prefilled, are wrong. its never the same play."; fix agreed: "Oh, nice. yes. great idea.").
// Kalshi has no prefilled link: the Worker's url is the whole GAME page. So a tap on any Kalshi entry point (the card's "open Kalshi game ↗", the price box, an "also at" chip) first
// copies Kalshi's exact market title (without the "NO · " prefix) and shows a calm toast with the side and limit the Kalshi strip shows. The page it opens is unchanged. NO side says NO.
// A Novig link copies nothing. The labels say what the link does. It must FAIL on the v5.19 file and PASS on this one.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,900)); };
const NOW=Date.parse('2026-11-07T18:00:00Z'), H=3600e3, iso=ms=>new Date(ms).toISOString(), DAY='2026-11-07';
const team=(ha,abbr)=>({ha,id:abbr,abbr,name:abbr,loc:abbr,nick:abbr,logo:'',rec:'',color:'333333',alt:'ffffff'});
const gi=(a,h)=>({state:'pre',startISO:iso(NOW+5*H),timeCT:'',detail:'',teams:[team('away',a),team('home',h)]});
const row=(o)=>Object.assign({name:'Miami (OH) RedHawks',team:'M-OH',game:'OHIO @ M-OH',matchup:'M-OH vs OHIO',side:'',sport:'NCAAF',market:'Moneyline',kind:'moneyline',book:'Kalshi',offeredRaw:'-108',offeredProb:0.519,fairProb:0.551,fairRaw:'',mktProb:0.551,stars:null,evModel:'market',
  gameInfo:gi('OHIO','M-OH'),src:'api:oddsapi:NCAAF',apiKey:'k1',loadedAt:iso(NOW-60e3)},o||{});
const ROWS=[row(),
  row({name:'Jaylen Brown',team:'BOS',game:'LAL @ BOS',matchup:'LAL @ BOS',sport:'NBA',kind:'prop',market:'24.5 Points',side:'U',offeredRaw:'-108',offeredProb:0.519,fairProb:0.62,mktProb:0.58,gameInfo:gi('LAL','BOS'),apiKey:'k2'}),
  row({name:'Bam Adebayo',team:'MIA',game:'MIA @ BOS',matchup:'MIA @ BOS',sport:'NBA',kind:'prop',market:'7.5 Rebounds',side:'O',book:'Novig',offeredRaw:'-233',offeredProb:0.70,fairProb:0.75,mktProb:0.72,gameInfo:gi('MIA','BOS'),apiKey:'k3'})];
const TITLE={ 'M-OH':'Miami (OH) wins', 'Jaylen Brown':'Jaylen Brown: 25+ points', 'Bam Adebayo':'Bam Adebayo: 8+ rebounds' };
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:1400,height:1000}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(([rows,d])=>{ try{ if(!sessionStorage.getItem('s')){ sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig, Kalshi, Polymarket US',bank:'500',cfgVer:3.03})); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows})); } }catch(e){}
    window._clip=[]; window._opens=[]; window._hrefs=[];
    Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:t=>{ window._clip.push(String(t)); return Promise.resolve(); }}});
    window.open=function(){ window._opens.push(String(arguments[0]||'')); return {closed:false, focus(){}, close(){}, location:{set href(v){ window._hrefs.push(String(v)); }}, document:{write(){}, close(){}}}; }; }, [ROWS,DAY]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  const KURL=n=>'https://kalshi.com/markets/kxtest/x/ev-'+n;
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/\/live\?/.test(u)){ const bets=JSON.parse(decodeURIComponent(u.split('bets=')[1])); const R={}, at=new Date(Date.now()).toISOString();
      bets.forEach(dd=>{ const id=String(dd.id), nm=id.split(':').slice(-1)[0], key=Object.keys(TITLE).find(k=>JSON.stringify(dd).includes(k.split(' ')[0]));
        if(/kalshi/i.test(nm)){ const no=/Brown/.test(JSON.stringify(dd)), pr=/Adebayo/.test(JSON.stringify(dd))?0.70:0.519;
          R[id]={ok:true, src:'kalshi', price:pr, bid:pr-0.01, ask:pr, at, title:(no?'NO · ':'')+(TITLE[key]||'Miami (OH) wins'), ref:'KXTEST-'+(key||'x').slice(0,3).toUpperCase(), url:KURL(key?key.slice(0,3):'x'), size:50}; } });
      return r.fulfill({contentType:'application/json',body:JSON.stringify({at:new Date(Date.now()).toISOString(),results:R})}); }
    if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1500);
  const findCard=async(nm)=>{ for(const m of ['safe','volado','boring','tranqui','parejo','dado','lucky','hail','machin']){ const has=await p.evaluate(n=>!![...document.querySelectorAll('#placeCards .sc-card')].find(x=>x.textContent.includes(n)),nm); if(has) return true; await p.evaluate(mm=>{ try{ setMode(mm); }catch(e){} }, m); await p.waitForTimeout(250); } return p.evaluate(n=>!![...document.querySelectorAll('#placeCards .sc-card')].find(x=>x.textContent.includes(n)),nm); };
  const reset=()=>p.evaluate(()=>{ window._clip.length=0; window._opens.length=0; window._hrefs.length=0; const t=document.getElementById('kalToast'); if(t) t.hidden=true; });
  const tag=(nm,sel,k)=>p.evaluate(([n,s,kk])=>{ const c=[...document.querySelectorAll('#placeCards .sc-card')].find(x=>x.textContent.includes(n)); const e=c&&c.querySelector(s); if(e) e.setAttribute('data-t520',kk); return e?{text:e.textContent.trim().slice(0,60), title:e.getAttribute('title')||''}:null; },[nm,sel,k]);
  const state=()=>p.evaluate(()=>{ const t=document.getElementById('kalToast'); return {clip:window._clip.slice(), hrefs:window._hrefs.slice(), opens:window._opens.length, toast:t&&!t.hidden?t.textContent:'', errs:0}; });
  const strip=nm=>p.evaluate(n=>{ const r=lastRows.find(x=>x.name===n), mx=maxPriceFor(okProbR(r),r.book,cfgRead().eMin), k=kalshiHow(r,+r.stake,r.offeredProb,mx); return k?{btn:k.btn,lim:k.lim,stake:+r.stake}:null; },nm);

  // 1. Miami (YES): the card's own "open slip" link
  check('Miami card found', await findCard('M-OH'));
  const sM=await strip('M-OH'); const ppM=await tag('M-OH','.pp-open','m1');
  check('the Kalshi strip exists for Miami (YES, a limit in cents)', !!sM && sM.btn==='YES' && sM.lim>0, sM);
  check('the label says what the link does: "open Kalshi game ↗", hover "Opens the game on Kalshi · pick … · YES · limit N¢"', !!ppM && /open Kalshi game/.test(ppM.text) && new RegExp('^Opens the game on Kalshi · pick [^·]+ · YES · limit '+(sM&&sM.lim)+'¢$').test(ppM.title), ppM);
  await reset(); await p.click('[data-t520="m1"]'); await p.waitForTimeout(700);
  let S=await state();
  check('tap "open slip": the exact market title is copied once', S.clip.length===1 && S.clip[0]==='Miami (OH) wins', S);
  check('the toast says the market, YES and the same limit as the strip', S.toast==='Copied “Miami (OH) wins”. On Kalshi, paste it in Search, pick YES, limit '+(sM&&sM.lim)+'¢.', S.toast);
  check('the page opened is the Worker\'s url, unchanged', S.hrefs.length===1 && S.hrefs[0]===KURL('M-O'), S.hrefs);

  // 2. the price box (class book) on the same card
  await reset(); const pr=await tag('M-OH','.sc-price','m2'); await p.click('[data-t520="m2"]'); await p.waitForTimeout(700); S=await state();
  check('tap the price box: copies the same title, same toast, same url', S.clip[0]==='Miami (OH) wins' && /pick YES, limit/.test(S.toast) && S.hrefs[0]===KURL('M-O') && /Opens the game on Kalshi/.test((pr||{}).title||''), {S, pr});

  // 3. Brown (an Under = NO): "NO · " is removed from the copied name; the toast says NO
  check('Brown card found', await findCard('Jaylen Brown'));
  const sB=await strip('Jaylen Brown'); const ppB=await tag('Jaylen Brown','.pp-open','b1');
  check('the strip says NO for the Under', !!sB && sB.btn==='NO' && sB.lim>0, sB);
  await reset(); await p.click('[data-t520="b1"]'); await p.waitForTimeout(700); S=await state();
  check('NO side: copies "Jaylen Brown: 25+ points" (no "NO · " in the clipboard)', S.clip.length===1 && S.clip[0]==='Jaylen Brown: 25+ points', S.clip);
  check('NO side: the toast says pick NO and the strip limit', S.toast==='Copied “Jaylen Brown: 25+ points”. On Kalshi, paste it in Search, pick NO, limit '+(sB&&sB.lim)+'¢.' && /^Opens the game on Kalshi · pick [^·]+ · NO · limit /.test((ppB||{}).title||''), {t:S.toast, ppB});
  check('NO side: the url opened is unchanged', S.hrefs[0]===KURL('Jay'), S.hrefs);

  // 4. Novig card: its own link copies nothing; the Kalshi "also at" chip copies the Kalshi title
  check('Bam Adebayo (Novig) card found', await findCard('Bam Adebayo'));
  const ppN=await tag('Bam Adebayo','.pp-open','n1');
  check('a Novig label is unchanged: "open slip ↗"', !!ppN && /open slip ↗/.test(ppN.text) && !/Kalshi/.test(ppN.title), ppN);
  await reset(); await p.click('[data-t520="n1"]'); await p.waitForTimeout(700); S=await state();
  check('Novig: nothing copied, no Kalshi toast, a slip still opens', S.clip.length===0 && S.toast==='' && S.hrefs.length+S.opens>=1, S);
  await p.evaluate(()=>{ const c=[...document.querySelectorAll('#placeCards .sc-card')].find(x=>x.textContent.includes('Bam Adebayo')); const btn=c&&c.querySelector('.sc-alt-chk'); if(btn) btn.click(); }); await p.waitForTimeout(900);
  const chip=await p.evaluate(()=>{ const c=[...document.querySelectorAll('#placeCards .sc-card')].find(x=>x.textContent.includes('Bam Adebayo')); if(!c) return null;
    const k=[...c.querySelectorAll('.sc-alts a.sc-alt')].find(x=>/kalshi\.com/.test(x.getAttribute('href')||'')); if(!k) return {none:true, alts:(c.querySelector('.sc-alts')||{}).textContent||''}; k.setAttribute('data-t520','c1'); return {href:k.getAttribute('href'), title:k.getAttribute('title')}; });
  check('the Kalshi "also at" chip is a link and its hover is the short form "Kalshi game page · copies the market"', !!chip && !chip.none && /Kalshi game page · copies the market/.test(chip.title), chip);
  if(chip && chip.href){ await reset(); await p.click('[data-t520="c1"]'); await p.waitForTimeout(700); S=await state();
    check('tap the chip: copies "Bam Adebayo: 8+ rebounds", the toast names YES and the url is unchanged', S.clip.length===1 && S.clip[0]==='Bam Adebayo: 8+ rebounds' && /^Copied “Bam Adebayo: 8\+ rebounds”\. On Kalshi, paste it in Search, pick YES/.test(S.toast) && S.hrefs.includes(chip.href), S); }
  else check('chip tapped', false, chip);
  check('no page errors', !errs.length, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
