// node tests/v504b-test.js — v5.04 (El Diseñador round 3, build plan step "v5.04 ▲/▼ next to signed gains and losses"): every signed gain or loss
// gets a ▲ or ▼ before it (CSS ::before on .d-up / .d-dn, from dCls / dClsR), so a gain and a loss differ by more than colour. The arrow follows the
// sign as shown: zero, null and NaN get none, and ROI / CLV get one only when the shown rounding is not zero. Muted (not actionable) EV gets none.
// Left out on purpose (named in the plan): WON/LOST badges, the Performance day cells (dayCells) and the Bet log calendar amounts (.lc-d small, v5.09).
// Display only: no chance, EV, stake, floor or grade is touched; colours are unchanged (wins green, losses red).
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,600)); };
const NOW=Date.parse('2026-11-14T22:00:00Z'), H=3600e3, iso=ms=>new Date(ms).toISOString(), DAY='2026-11-14';
const VIEWS=[['v-board','api'],['v-log'],['v-perf'],['v-reports'],['v-parlay'],['v-money']];
// one win and one loss today (two books, each with a closing price), one open bet tonight, a win and a loss on an earlier day (Scorecard, Reports, calendar)
const bet=(id,book,odds,stake,res,startMs,day,closing,extra)=>Object.assign({id,key:id,date:day,dateSet:true,name:'Player '+id,sport:'NBA',market:'1.5 Threes',betnow:'Over 1.5',book,game:'CHA @ PHX',odds,stake,kind:'prop',side:'O',
  start:iso(startMs),manual:true,snap:{at:iso(startMs-3*H),act:0.55,actNet:0.04},fair:'-120',net:0.05},res?{result:res,gradedBy:'manual',resultSrc:'you'}:{},closing?{closing}:{},extra||{});
const LOG=[bet('w1','DraftKings','+100',10,'win',NOW-5*H,DAY,'-125'), bet('l1','FanDuel','-110',5,'loss',NOW-4*H,DAY,'+105'), bet('o1','Novig','+120',4,null,NOW+3*H,DAY,null),
  bet('w2','DraftKings','+150',6,'win',NOW-50*H,'2026-11-12','+130'), bet('l2','Novig','-120',3,'loss',NOW-49*H,'2026-11-12','-110')];
// one board row, so the card checks start from a real row the app has read (then evA is set to null, 0, an outlier, a gain and a loss)
const T=(ha,abbr)=>({ha,id:abbr,abbr,name:abbr+' Team',loc:abbr,nick:'Team',logo:'',rec:'',color:'333333',alt:'ffffff'});
const ROWS=[{name:'Card Test',team:'PHX',game:'CHA @ PHX',matchup:'CHA @ PHX',side:'O',sport:'NBA',market:'2.5 Threes',kind:'prop',book:'DraftKings',offeredRaw:'+110',offeredProb:0.476,fairProb:0.55,fairRaw:'',mktProb:0.52,stars:3,evModel:'market',
  gameInfo:{state:'pre',startISO:iso(NOW+5*H),eventId:'g1',timeCT:'',detail:'',teams:[T('away','CHA'),T('home','PHX')]},src:'api:NBA:props',apiKey:'ct',loadedAt:iso(NOW-60e3)}];
const SEED=([L,R])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.log',JSON.stringify(L)); localStorage.setItem('mbev.tbBooks','1');
  localStorage.setItem('mbev.cfg',JSON.stringify({books:'DraftKings,FanDuel,Novig',bank:'1000',cfgVer:3.03})); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:'2026-11-14',rows:R})); }catch(e){} };
(async()=>{
  // ---- static: the helpers, the CSS and where they are used
  const style=html.slice(html.indexOf('<style>')+7, html.indexOf('</style>')), mk=style.indexOf('/* v5.04 (plan step: ▲/▼'), mkEnd=(i=>i>mk?i:style.length)(style.indexOf('/* v5.04 (plan step v5.05'));   /* v5.04 (price age step): a later block may follow the ▲/▼ block; read the ▲/▼ block only, up to it */
  check('the ▲/▼ CSS is a v5.04 block near the end of the first <style> (v5.04 price-age step: the age-pill block may follow it; the no-colour check reads the ▲/▼ block only): .d-up::before "▲\\00a0", .d-dn::before "▼\\00a0" (a non-breaking space, so the arrow never ends a line alone), font-size .8em, no colour set', mk>0 && /\.d-up::before\{content:"▲\\00a0"; font-size:\.8em\}\s*\.d-dn::before\{content:"▼\\00a0"; font-size:\.8em\}\s*@media \(max-width:640px\)\{ \.rp-t td\[data-l\]\.d-up::before\{content:attr\(data-l\) ": ▲\\00a0"\} \.rp-t td\[data-l\]\.d-dn::before\{content:attr\(data-l\) ": ▼\\00a0"\} \}/.test(style.slice(mk,mkEnd)) && !/color/.test(style.slice(mk,mkEnd).replace(/\/\*[\s\S]*?\*\//g,'')), style.slice(mk).slice(-160));
  check('dCls and dClsR are hoisted function declarations, declared once', (html.match(/\nfunction dCls\(x\)\{/g)||[]).length===1 && (html.match(/\nfunction dClsR\(x,step\)\{/g)||[]).length===1);
  const b=await chromium.launch(); const errs=[];
  const open=async(w,log)=>{ const ctx=await b.newContext({viewport:{width:w,height:900},timezoneId:'America/Chicago'}); await ctx.clock.install({time:new Date(NOW)}); await ctx.addInitScript(SEED, [log||LOG,ROWS]);
    const p=await ctx.newPage(); p.on('pageerror',e=>errs.push(w+': '+e.message));
    await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); return r.abort(); });
    await p.goto('http://app.test/'); await p.waitForTimeout(1400); return {ctx,p}; };
  const {ctx,p}=await open(1280);
  // ---- unit: dCls / dClsR, rpCls / rpClvCls
  const U=await p.evaluate(()=>({ z:dCls(0), n:dCls(null), nan:dCls(NaN), u:dCls(undefined), pos:dCls(0.2), neg:dCls(-3),
    r1:dClsR(0.004,0.01), r2:dClsR(0.006,0.01), r3:dClsR(-0.006,0.01), r4:dClsR(0.005,0.01),
    roiS:rpPct(0.0004), roiC:rpCls(0.0004,0.001), roiS2:rpPct(0.004), roiC2:rpCls(0.004,0.001), roiS3:rpPct(-0.004), roiC3:rpCls(-0.004,0.001),
    clvS:rpPctP(0.00004), clvC:rpClvCls(0.00004), clvS2:rpPctP(0.0004), clvC2:rpClvCls(0.0004), clvS3:rpPctP(-0.0004), clvC3:rpClvCls(-0.0004), clvN:rpClvCls(null),
    usd:rpCls(0.004), usd2:rpCls(12.5), usd3:rpCls(-2), usdS:lcUsd(0.004), colour:[rpCls(0.003,0.001), rpClvCls(0.0005)] }));
  check('dCls: zero, null, NaN and undefined give no class; a gain " d-up", a loss " d-dn"', U.z===''&&U.n===''&&U.nan===''&&U.u===''&&U.pos===' d-up'&&U.neg===' d-dn', U);
  check('dClsR takes the arrow from the value as shown: $0.004 shows $0.00 (none), $0.006 shows +$0.01 (▲), exactly $0.005 (lcUsd shows no sign) none', U.r1===''&&U.r2===' d-up'&&U.r3===' d-dn'&&U.r4==='', [U.r1,U.r2,U.r3,U.r4]);
  check('ROI at +0.04% shows "+0.0%" and gets no arrow; +0.4% gets ▲, −0.4% gets ▼ (rpCls with the 0.1% step)', U.roiS==='+0.0%' && !/d-up|d-dn/.test(U.roiC) && U.roiS2==='+0.4%' && /d-up/.test(U.roiC2) && U.roiS3==='−0.4%' && /d-dn/.test(U.roiC3), {roi:[U.roiS,U.roiC,U.roiS2,U.roiC2,U.roiS3,U.roiC3]});
  check('CLV at +0.004% shows "0.00%" and gets no arrow; +0.04% gets ▲, −0.04% gets ▼; no CLV gets nothing (rpClvCls with the 0.01% step)', U.clvS==='0.00%' && !/d-up|d-dn/.test(U.clvC) && U.clvS2==='+0.04%' && /d-up/.test(U.clvC2) && U.clvS3==='−0.04%' && /d-dn/.test(U.clvC3) && U.clvN==='', {clv:[U.clvS,U.clvC,U.clvS2,U.clvC2,U.clvS3,U.clvC3]});
  check('Reports $ amounts: $0.004 shows "$0.00", no arrow; +$12.50 ▲ and green, −$2.00 ▼ and red (colour rule unchanged: 0.3% ROI and 0.05% CLV stay uncoloured)', U.usdS==='$0.00' && U.usd==='' && U.usd2==='pl-up d-up' && U.usd3==='pl-down d-dn' && !/pl-/.test(U.colour[0]) && !/pl-/.test(U.colour[1]), U);
  // ---- rendered: every '+$' element has ▲ and every '−$' element has ▼; no d-up shows a minus, no d-dn shows a plus
  const SCAN=()=>{ const vis=el=>{ const c=getComputedStyle(el); if(c.display==='none'||c.visibility==='hidden') return false; const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    // left out, named: the Bet log calendar day boxes (.lc-d, v5.09), the Performance day table (dayCells, #daysBody) and its calendar day boxes (#rbdBody .cal-c),
    // (Performance's month totals #calToday / #calMonthTot / #calFoot and the band study table #studyRows carry arrows since the review round, so they are scanned too)
    const skip=el=>!!(el.closest('.lc-d') || el.closest('#daysBody,#daysFoot,#rbdBody') || el.closest('script,style,option,select,input,textarea'));
    const bef=el=>getComputedStyle(el,'::before').content; const out={plus:0, minus:0, bad:[], wrong:[], arrows:0};
    for(const el of document.querySelectorAll('body *')){ if(skip(el) || !vis(el)) continue; const t=el.textContent.replace(/\s+/g,' ').trim();
      const m=t.match(/^([+−])\$(\d[\d,]*\.\d\d)/); if(m && +m[2].replace(/,/g,'')>0){
        const ch=[...el.children].find(c=>c.textContent.replace(/\s+/g,' ').trim()===t); if(ch) continue;   // the innermost element carrying the text is the one checked
        if(m[1]==='+'){ out.plus++; if(!/▲\u00a0"$/.test(bef(el))) out.bad.push('+ no ▲: '+el.tagName.toLowerCase()+'.'+String(el.className).trim().replace(/\s+/g,'.')+' "'+t.slice(0,40)+'" in '+((el.closest('[id]')||{}).id||'')); }
        else { out.minus++; if(!/▼\u00a0"$/.test(bef(el))) out.bad.push('− no ▼: '+el.tagName.toLowerCase()+'.'+String(el.className).trim().replace(/\s+/g,'.')+' "'+t.slice(0,40)+'" in '+((el.closest('[id]')||{}).id||'')); } } }
    for(const el of document.querySelectorAll('.d-up,.d-dn')){ if(!vis(el)) continue; out.arrows++; const t=el.textContent.replace(/\s+/g,' ').trim(), up=el.classList.contains('d-up');
      if(up ? /−|-(?=\d|\$)/.test(t) : /\+/.test(t)) out.wrong.push((up?'d-up':'d-dn')+' "'+t.slice(0,40)+'"');
      if(!(up?/▲\u00a0"$/:/▼\u00a0"$/).test(bef(el))) out.wrong.push('no arrow drawn on '+(up?'d-up':'d-dn')+' "'+t.slice(0,30)+'"'); }
    return out; };
  const TOT={plus:0,minus:0,arrows:0,bad:[],wrong:[]}, per={};
  for(const w of [390,1000,1280,1960]){ const P=w===1280?{ctx,p}:await open(w);
    for(const [v,src] of VIEWS){ await P.p.evaluate(([v,src])=>{ const t=document.querySelector('.tab[data-view="'+v+'"]'+(src?'[data-src="'+src+'"]':''))||document.querySelector('[data-view="'+v+'"]'); if(t) t.click(); document.querySelectorAll('details').forEach(d=>d.open=true); const f=document.getElementById('tbFoldBtn'); if(v==='v-board' && f && f.getAttribute('aria-expanded')==='false') f.click(); },[v,src]); await P.p.waitForTimeout(350);
      const R=await P.p.evaluate(SCAN); per[w+' '+v]=R.plus+'+/'+R.minus+'−'; TOT.plus+=R.plus; TOT.minus+=R.minus; TOT.arrows+=R.arrows; R.bad.forEach(x=>TOT.bad.push(w+' '+v+': '+x)); R.wrong.forEach(x=>TOT.wrong.push(w+' '+v+': '+x)); }
    {
      // ---- the per-book pills in the TODAY bar fit at every width
      await P.p.evaluate(()=>{ const t=document.querySelector('.tab[data-view="v-board"]'); if(t) t.click(); const f=document.getElementById('tbFoldBtn'); if(f && f.getAttribute('aria-expanded')==='false') f.click(); }); await P.p.waitForTimeout(300);
      const F=await P.p.evaluate(()=>{ const bar=document.getElementById('todayBar'); const out={pills:0, arrowPills:0, out:[], sw:document.documentElement.scrollWidth-innerWidth};
        for(const pl of bar.querySelectorAll('.tb-pill')){ const r=pl.getBoundingClientRect(); if(!r.width) continue; out.pills++; if(/d-up|d-dn/.test(pl.className)) out.arrowPills++;
          const box=pl.closest('.tb-t')||pl.closest('.tb-k')||bar, br=box.getBoundingClientRect(); if(r.right>br.right+0.5 || r.left<br.left-0.5 || r.right>innerWidth) out.out.push(pl.textContent.trim()+' right '+Math.round(r.right)+' box '+Math.round(br.right));
          if(pl.scrollWidth>pl.clientWidth+1 || r.height>40) out.out.push(pl.textContent.trim()+' wraps or clips ('+Math.round(r.height)+'px tall)'); }
        return out; });
      check(w+': the TODAY pills (all and per book) carry the arrow and fit their tiles, no sideways scroll', F.pills>=3 && F.arrowPills>=3 && !F.out.length && F.sw<=0, F);
      if(w!==1280) await P.ctx.close(); } }
  if(process.env.V504B_DEBUG) console.log(TOT.bad.concat(TOT.wrong).join('\n'));
  check('every visible "+$" amount has a ▲ before it and every "−$" amount a ▼ (390, 1000, 1280 and 1960, Board TODAY, Bet log, Scorecard, Reports; calendar day cells left out)', TOT.plus>=8 && TOT.minus>=6 && !TOT.bad.length, {plus:TOT.plus, minus:TOT.minus, per, bad:TOT.bad.slice(0,40)});
  check('no ▲ element shows a minus and no ▼ element shows a plus, and each draws its arrow', TOT.arrows>=14 && !TOT.wrong.length, {arrows:TOT.arrows, wrong:TOT.wrong.slice(0,10)});
  // ---- named places
  await p.evaluate(()=>{ document.querySelector('.tab[data-view="v-board"]').click(); }); await p.waitForTimeout(250);
  const N=await p.evaluate(()=>{ const q=s=>[...document.querySelectorAll(s)].map(e=>e.className); return {tl:q('#todayLine .d-up,#todayLine .d-dn'), scen:document.querySelector('#todayBar .tb-scen')?document.querySelector('#todayBar .tb-scen').innerHTML:'',
    lc:q('#lcSum .d-up,#lcSum .d-dn,#lcTotals .d-up,#lcTotals .d-dn,#lcPerf .d-up,#lcPerf .d-dn'), lcd:q('.lc-d .d-up,.lc-d .d-dn'), sc:q('#scoreBody .d-up,#scoreBody .d-dn'), rp:q('#rpHead .d-up,#rpHead .d-dn'),
    logDay:q('.log-day-btn .d-up,.log-day-btn .d-dn'), days:q('#daysBody .d-up,#daysBody .d-dn') }; });
  check('the TODAY line net (+$5.00 today) has ▲ (renderTodayLine)', N.tl.length===1 && /pl-up d-up/.test(N.tl[0]), N.tl);
  check('the TODAY bar: Settled ▲ and Open upside ▲ (renderTodayBar money spans)', /Settled <span class="tb-up d-up">\+\$5\.00<\/span>/.test(N.scen) && /Open upside <span class="tb-up d-up">\+\$4\.80<\/span>/.test(N.scen), N.scen.replace(/^.*?">/,'').slice(0,300));
  check('Bet log calendar: the day, month and all-time settled and Track by profit carry arrows; the day boxes (.lc-d small, v5.09) do not', N.lc.length>=3 && N.lcd.length===0, N);
  check('Bet log day rows: each settled day net has an arrow', N.logDay.length>=2, N.logDay);
  check('Scorecard: profit, ROI and the week rows carry arrows', N.sc.length>=3, N.sc);
  check('Reports headline: settled profit and ROI carry arrows', N.rp.length>=2, N.rp);
  check('Performance day cells (dayCells) are left out (plan), as are the WON/LOST badges', N.days.length===0 && !/d-up|d-dn/.test(await p.evaluate(()=>[...document.querySelectorAll('.badge,.res-badge')].map(e=>e.className).join(' '))), N.days);
  // ---- cards: evA null, evA 0 and an outlier_untrusted EV get no arrow; a positive actionable EV gets ▲ on the pill and the tile
  const C=await p.evaluate(()=>{ const base=Object.assign({}, lastRows.find(x=>x.apiKey==='ct'));
    const cfg=cfgRead(), host=document.createElement('div'); host.id='v504bHost'; document.body.appendChild(host);
    const one=(lab,r)=>{ let h=''; try{ h=placeCardHtml(r,cfg,{}); }catch(e){ return {lab, err:e.message}; } host.innerHTML=h;
      const pill=host.querySelector('.sc-pill.ev b'), tile=[...host.querySelectorAll('.sc-t')].find(t=>/La Contadora EV/.test(t.textContent)), tb=tile&&tile.querySelector('b');
      const a=el=>el?getComputedStyle(el,'::before').content:'(none)';
      return {lab, st:evDisplayState(r), pill:pill?pill.textContent.trim().slice(0,30):'', pillCls:pill?pill.className:'', pillB:a(pill), tile:tb?tb.textContent.trim():'', tileCls:tb?tb.className:'', tileB:a(tb)}; };
    const out=[one('pos',Object.assign({},base,{actNet:0.045,net:0.06,outlier:false})), one('null',Object.assign({},base,{actNet:null,net:null,outlier:false})), one('zero',Object.assign({},base,{actNet:0,net:0,outlier:false})),
      one('outlier',Object.assign({},base,{actNet:0.12,net:0.3,outlier:true,outlierWhy:'OUTLIER'})), one('neg',Object.assign({},base,{actNet:-0.02,net:-0.01,outlier:false}))];
    host.remove(); return out; });
  const c=k=>C.find(x=>x.lab===k)||{}, none=x=>!/d-up|d-dn/.test((x.pillCls||'')+' '+(x.tileCls||'')) && x.pillB!=='"▲\u00a0"' && x.pillB!=='"▼\u00a0"' && x.tileB!=='"▲\u00a0"' && x.tileB!=='"▼\u00a0"';
  check('card: an actionable +4.5% EV has ▲ on the EV pill and on the La Contadora EV tile', c('pos').st==='actionable' && c('pos').pillB==='"▲\u00a0"' && c('pos').tileB==='"▲\u00a0"' && /^\+4\.5%/.test(c('pos').tile), c('pos'));
  check('card: an actionable −2.0% EV has ▼ on both', c('neg').st==='actionable' && c('neg').pillB==='"▼\u00a0"' && c('neg').tileB==='"▼\u00a0"', c('neg'));
  check('card with evA null ("—"): no arrow (the old up/down class would have said ▼ —)', c('null').st==='actionable' && /—/.test(c('null').pill) && none(c('null')), c('null'));
  check('card with evA 0 ("0.0%"): no arrow (the old class would have said ▼ 0.0%)', c('zero').st==='actionable' && /0\.0%/.test(c('zero').pill) && none(c('zero')), c('zero'));
  check('card with an outlier_untrusted EV (muted EST. EV): no arrow on the pill or the tile', c('outlier').st==='outlier_untrusted' && /EST\. EV/.test(c('outlier').pill) && none(c('outlier')), c('outlier'));
  // ---- parlay expected return and My books (no fills in this test: drawn from the code)
  const K=await p.evaluate(()=>{ let r={}; try{ const host=document.createElement('div'); document.body.appendChild(host); const legs=p=>[{name:'A',p,book:'PrizePicks',own:true,sport:'NBA'},{name:'B',p,book:'PrizePicks',own:true,sport:'NBA'}], E=p=>pkEntry(legs(p),[3],cfgRead());
      const show=(ev,p)=>{ const en=Object.assign({},E(p),ev==null?{}:{ev}); host.innerHTML=pkCard('Test',legs(p),en,'t',false); const e=host.querySelector('.pk-ev'); return e?{cls:e.className, b:getComputedStyle(e,'::before').content, t:e.textContent.trim().slice(0,8)}:null; };
      r={up:show(null,0.6), dn:show(null,0.5), z:show(0,0.6)}; host.remove(); }catch(e){ r.err=e.message; } r.src=/dCls\(e\.ev\)/.test(pkCard.toString()); r.mb=/settled <b class="'\+\(pl>=0\?'tb-up':'tb-down'\)\+dClsR\(pl,0\.01\)\+'">/.test(renderMyBooks.toString()); return r; });
  check('parlay expected return: +8.0% ▲, −25.0% ▼, 0 none (pkCard uses dCls(e.ev))', K.src && !K.err && ((K.up && /d-up/.test(K.up.cls) && K.up.b==='"▲\u00a0"' && K.dn && /d-dn/.test(K.dn.cls) && K.z && !/d-up|d-dn/.test(K.z.cls))), K);
  check('My books: the settled P/L per book uses dClsR(pl,0.01) (the arrow from the cent as shown)', K.mb);
  // ---- Performance (month totals, best / worst days, band study) and the Reports ROI cells carry arrows too (added in the review round)
  const PF=await p.evaluate(async()=>{ document.querySelector('[data-view="v-perf"]').click(); await new Promise(r=>setTimeout(r,300)); const q=s=>[...document.querySelectorAll(s)].map(e=>e.className+' '+e.textContent.trim().slice(0,14));
    const perf={today:q('#calToday.d-up,#calToday.d-dn'), month:q('#calMonthTot.d-up,#calMonthTot.d-dn'), foot:q('#calFoot .d-up,#calFoot .d-dn'), study:q('#studyRows .d-up,#studyRows .d-dn')};
    document.querySelector('[data-view="v-reports"]').click(); await new Promise(r=>setTimeout(r,300)); perf.roi=q('.rp-t td[data-l="ROI"].d-up,.rp-t td[data-l="ROI"].d-dn'); perf.roiZero=[...document.querySelectorAll('.rp-t td[data-l="ROI"]')].filter(td=>/^[+−]0\.0%$/.test(td.textContent.trim()) && /d-up|d-dn/.test(td.className)).length; return perf; });
  check('Performance: today (+$5.00), the month total, best / worst days and the band study net carry ▲/▼', PF.today.length===1 && PF.month.length===1 && PF.foot.length>=2 && PF.study.length>=1, PF);
  check('Reports: the ROI cells in the tables carry ▲/▼ from the shown 0.1% (none on ±0.0%)', PF.roi.length>=2 && PF.roiZero===0, PF.roi.slice(0,6));
  // ---- a float residue: 0.10 + 0.20 − 0.30 settles to about 5.6e-17 (and a −1e-15 day), shown as $0.00, so no arrow on the day net, Scorecard profit, week profit, Performance month total
  { const R=[bet('r1','DraftKings','+100',0.1,'win',NOW-5*H,DAY,null), bet('r2','DraftKings','+100',0.2,'win',NOW-5*H,DAY,null), bet('r3','FanDuel','+100',0.3,'loss',NOW-4*H,DAY,null)];
    const P=await open(390,R);
    const Z=await P.p.evaluate(async()=>{ const sum=logged.reduce((a,b)=>a+(betProfit(b)||0),0); const q=s=>[...document.querySelectorAll(s)].map(e=>e.className+' '+e.textContent.trim().slice(0,30));
      const out={sum, unit:[dClsR(5.6e-17,0.01), dClsR(-1e-15,0.01), dClsR(0.01,0.01)], tl:q('#todayLine .d-up,#todayLine .d-dn'), tlText:(document.getElementById('todayLine')||{}).textContent||''};
      document.querySelector('[data-view="v-log"]').click(); await new Promise(r=>setTimeout(r,300)); document.querySelectorAll('details').forEach(d=>d.open=true); await new Promise(r=>setTimeout(r,200));
      out.sc=[...document.querySelectorAll('#scoreBody .sc-box')].filter(x=>/^(Profit|ROI)$/.test(((x.querySelector('.k')||{}).textContent||'').trim())).map(x=>x.querySelector('.v')).filter(v=>v&&/d-up|d-dn/.test(v.className)).map(v=>v.className+' '+v.textContent.trim())
        .concat(q('#scoreBody table .d-up,#scoreBody table .d-dn'));   /* the worst drawdown (−$0.30: the high was +$0.30) is a real loss and keeps its ▼ */
      out.dd=q('#scoreBody .sc-box .v.pl-down.d-dn'); out.logDay=q('.log-day-btn .d-up,.log-day-btn .d-dn');
      document.querySelector('[data-view="v-perf"]').click(); await new Promise(r=>setTimeout(r,300)); out.perf=q('#calToday.d-up,#calToday.d-dn,#calMonthTot.d-up,#calMonthTot.d-dn,#calFoot .d-up,#calFoot .d-dn,#studyRows .d-up,#studyRows .d-dn');
      return out; });
    check('a float residue (0.1+0.2−0.3 ≈ '+Z.sum+') shows $0.00 and gets no arrow: TODAY line, Bet log day, Scorecard profit, ROI and week rows, Performance (the −$0.30 drawdown keeps ▼); dClsR(−1e-15) none, dClsR(0.01) ▲', Math.abs(Z.sum)<1e-12 && Z.unit[0]==='' && Z.unit[1]==='' && Z.unit[2]===' d-up' && /\+\$0\.00/.test(Z.tlText) && !Z.tl.length && !Z.sc.length && Z.dd.length===1 && !Z.logDay.length && !Z.perf.length, Z);
    await P.ctx.close(); }
  check('no page errors', !errs.length, errs.slice(0,5));
  await ctx.close(); await b.close(); console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(fail?1:0);
})();
