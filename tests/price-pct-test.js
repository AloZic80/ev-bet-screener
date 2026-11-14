// node tests/price-pct-test.js — v4.10. Alonzo: "+230 on X, what does that mean in %? put a hint on the bet, so we know it is better
// to look elsewhere". Each price shows its % (+230 = 100 / 330 = 30.3%): green "OK to" La Contadora's most when it passes, amber
// "need ≤ … · look elsewhere" when the price costs more. Board and Place these cards, phone (390) and computer (1280) widths.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const NOW=Date.parse('2026-11-07T18:00:00Z'), H=3600e3, iso=ms=>new Date(ms).toISOString(), DAY='2026-11-07';
const team=(ha,abbr)=>({ha,id:abbr,abbr,name:abbr,loc:abbr,nick:abbr,logo:'',rec:'',color:'333333',alt:'ffffff'});
const row=(o)=>Object.assign({name:'Ja Morant',team:'MEM',game:'MEM @ DAL',matchup:'MEM @ DAL',side:'O',sport:'NBA',market:'2.5 Threes',kind:'prop',book:'Bovada',offeredRaw:'+230',offeredProb:100/330,fairProb:0.33,fairRaw:'',mktProb:0.33,stars:null,evModel:'market',
  gameInfo:{state:'pre',startISO:iso(NOW+5*H),timeCT:'',detail:'',teams:[team('away','MEM'),team('home','DAL')]},src:'api:oddsapi:NBA',apiKey:'k1'},o||{});
const ROWS=[row(), row({name:'Luka Doncic',team:'DAL',market:'4.5 Threes',fairProb:0.29,mktProb:0.29,apiKey:'k2'})];
(async()=>{
  const b=await chromium.launch();
  for(const W of [390,1000,1280,1960]){
    const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:W,height:1000}}); await ctx.clock.install({time:new Date(NOW)});
    await ctx.addInitScript(([rows,d])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows})); }catch(e){} }, [ROWS,DAY]);
    const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
    await p.goto('http://app.test/'); await p.waitForTimeout(1500);
    await p.evaluate(()=>setMode('clair')); await p.waitForTimeout(300);   /* v4.74: these sample bets are approved long shots (under 45%), listed under Clairvoyant */
    await p.evaluate(()=>{ const i=document.getElementById('books'); i.value='Bovada, Kalshi'; i.dispatchEvent(new Event('input',{bubbles:true})); }); await p.waitForTimeout(1500);
    const R=await p.evaluate(()=>{ const t=n=>{ const d=document.createElement('div'); d.innerHTML=impTagHtml(lastRows.find(x=>x.name===n)); const s=d.firstChild; return s?{text:s.textContent,cls:s.className,tip:s.title}:null; };
      const imps=[...document.querySelectorAll('.imp')], vw=document.documentElement.clientWidth;
      return {ok:t('Ja Morant'), over:t('Luka Doncic'), shown:imps.map(x=>x.textContent), spill:imps.filter(x=>{ const r=x.getBoundingClientRect(); return r.width>0 && (r.right>vw+1 || r.left<-1); }).length, scroll:document.documentElement.scrollWidth>vw+1}; });
    if(W===1280){
      check('+230 reads 30.3%, green, with how much La Contadora allows', R.ok && /^price 30\.3% · OK to \d+\.\d%$/.test(R.ok.text) && /\bok\b/.test(R.ok.cls) && /100 \/ \(230 \+ 100\)/.test(R.ok.tip), R.ok);
      check('the same +230 on a 29% bet: amber "need ≤ … · look elsewhere"', R.over && /^price 30\.3%( · need ≤ \d+\.\d%)? · look elsewhere$/.test(R.over.text) && /\bover\b/.test(R.over.cls) && /lower %/.test(R.over.tip), R.over);
    }
    check(W+' px: the % shows on the bets and nothing spills off the screen', R.shown.some(s=>/^price 30\.3%/.test(s)) && !R.spill && !R.scroll, R);
    if(W===390){
      await p.evaluate(()=>{ const t=[...document.querySelectorAll('#placeCards .pcard')].find(x=>/Morant/.test(x.textContent)); (t.querySelector('.bet-btn')||t.querySelector('button')).click(); }); await p.waitForTimeout(400);
      const tag=async v=>{ await p.evaluate(v=>{ const i=document.querySelector('.editor .eb-odds'); i.value=v; i.dispatchEvent(new Event('input',{bubbles:true})); },v); await p.waitForTimeout(150); return p.evaluate(()=>(document.querySelector('.editor .eb-check')||{}).textContent||''); };
      const g=await tag('+230'), w=await tag('+180');
      const sp=await p.evaluate(()=>{ const t=document.querySelector('.editor .eb-check .tag'), r=t.getBoundingClientRect(); return {right:Math.round(r.right), vw:document.documentElement.clientWidth}; });
      check('I bet this on a phone: the price line wraps, it does not run off the screen', sp.right<=sp.vw, sp);
      check('I bet this: typing +230 says "+230 = 30.3%" and worth it', /^\+230 = 30\.3% · Worth it/.test(g), g);
      check('I bet this: typing +180 (35.7%, over the 33% fair) says not worth it · need ≤ 32.5% · look elsewhere', /^\+180 = 35\.7% · Not worth it.* · need ≤ 32\.5% · look elsewhere$/.test(w), w);
    }
    check(W+' px: no page errors', !errs.length, errs);
    await ctx.close();
  }
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
