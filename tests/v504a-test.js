// node tests/v504a-test.js — v5.04 (El Diseñador round 3, build plan step "v5.03 Tabular digits and a 12 px text floor"): every number lines up
// (tabular digits) and no text the app writes is under 12px, at 390, 1000, 1280 and 1960 px, light and dark, on every page with every drop-down open.
// Exceptions (not raised, each named in the v5.04 CSS block): the 7px decorative timeout dots (.lteam .tos, aria-hidden), SVG chart text (checked
// for overlapping labels instead), the phone day amounts of Performance's Results by day (.cal-c .v and .cal-tp-s, 640px and under: the v4.08 rule) and the Bet log calendar amounts
// (.lc-d small, lifted in a later step). Display only: no number, stake, floor or rule is touched.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
const seed=require('./seed.js');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,600)); };
const VIEWS=[['v-board','api'],['v-live'],['v-parlay'],['v-log'],['v-add'],['v-perf'],['v-reports'],['v-leagues'],['v-parole'],['v-money'],['v-settings']];
const WIDTHS=[390,1000,1280,1960], THEMES=['light','dark'];
const NOW=Date.parse('2026-11-14T18:00:00Z'), iso=ms=>new Date(ms).toISOString();
// a second board with cards to place (the seeded board has none), set up like sentinel-card-test, so the card tiles (.sc-t b) are measured too
const CNOW=Date.parse('2026-11-07T18:50:00Z'), H=3600e3, M=60e3, CDAY='2026-11-07';
const T=(ha,abbr,loc,nick,short)=>({ha,id:abbr,abbr,name:short,loc,nick,logo:'',rec:'',color:'333333',alt:'ffffff'});
const LAC=[T('away','LAC','Los Angeles','Clippers','LA Clippers'),T('home','MIN','Minnesota','Timberwolves','Minnesota')];
const prop=(name,team,market,side,book,odds,p,fair,mkt,k,start,extra)=>Object.assign({name,team,game:'LAC @ MIN',matchup:'LAC @ MIN',side,sport:'NBA',market,kind:'prop',book,offeredRaw:odds,offeredProb:p,fairProb:fair,fairRaw:'',mktProb:mkt,stars:4,evModel:'market',
  gameInfo:{state:'pre',startISO:iso(start),timeCT:'',detail:'',teams:LAC},src:'api:NBA:props',apiKey:k},extra||{});
const CARD_ROWS=[prop('Rui Hachimura','LAC','4.5 Rebounds','O','Polymarket US','+177',0.36,0.40,0.395,'k1',CNOW+7*H,{loadedAt:iso(CNOW-55*1000)}),
                 prop('Naz Reid','MIN','16.5 Points','O','Novig','-108',0.52,0.545,0.54,'k2',CNOW+6*H,{loadedAt:iso(CNOW-40*M)})];
const pxKey=(n,m,sd,st)=>['NBA',n,m,sd,new Date(st).toISOString().slice(0,10)].join('|'), tm=Math.floor(CNOW/60000);
const CARD_PX={[pxKey('rui hachimura','4 5 rebounds','O',CNOW+7*H)]:[[tm-50,0.405,0.40],[tm-30,0.39,0.40],[tm-6,0.36,0.40]]};   // a price history, so the card draws its chart
const cardsInit=([rows,d,px])=>{ try{ if(sessionStorage.getItem('c')) return; sessionStorage.setItem('c','1'); localStorage.clear(); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows})); localStorage.setItem('mbev.px',JSON.stringify(px)); }catch(e){} };
const PASSES=[{name:'seeded', views:VIEWS}, {name:'cards', views:[['v-board','api']]}];
// ---- static: every 7–11.5px rule in the first <style> is either an exception or raised in the v5.04 block (same @media), selectors copied exactly
function cssRules(css){ css=css.replace(/\/\*[\s\S]*?\*\//g,m=>m.replace(/[^\n]/g,' ')); const out=[], stack=[]; let i=0, buf='';
  while(i<css.length){ const c=css[i];
    if(c==='{'){ const pre=buf.trim(); if(pre.startsWith('@')){ stack.push(pre.replace(/\s+/g,' ')); buf=''; i++; continue; }
      const j=css.indexOf('}',i); out.push({at:stack.join(' '), sel:pre.replace(/\s+/g,' '), body:css.slice(i+1,j)}); buf=''; i=j+1; continue; }
    if(c==='}'){ stack.pop(); buf=''; i++; continue; } buf+=c; i++; }
  return out; }
const SMALL=/^(7|9|9\.5|10|10\.5|11|11\.5)px$/;
const sizeOf=body=>{ for(const d of body.split(';')){ const m=d.match(/^\s*font-size\s*:\s*([^!]+?)\s*(!important)?\s*$/); if(m) return m[1]; const f=d.match(/^\s*font\s*:\s*(.+?)\s*$/); if(f){ const k=f[1].match(/(?:^|\s)(\d+(?:\.\d+)?px)(?:\/|\s|$)/); if(k) return k[1]; } } return null; };
const style=html.slice(html.indexOf('<style>')+7, html.indexOf('</style>'));
const mark=style.indexOf('/* v5.04 (El Diseñador round 3');
const EXC=new Set(['.lteam .tos','.lf-pintx','.lf-num','.lspark text','.sc-svg text','.lc-d small']);
(async()=>{
  check('the v5.04 block sits just before the first </style>', mark>0 && !/\/\* v\d\.(?!04)\d\d/.test(style.slice(mark)) && /small\{font-size:max\(12px, calc\(1em \/ 1\.2\)\)\}/.test(style.slice(mark)), mark);
  const before=cssRules(style.slice(0,mark)), after=cssRules(style.slice(mark));
  const raised=new Set(); for(const r of after) if(sizeOf(r.body)==='12px') for(const s of r.sel.split(/\s*,\s*/)) raised.add(r.at+'|'+s);
  const missing=[], wrongExc=[]; let n=0;
  for(const r of before){ if(/keyframes/.test(r.at)) continue; const sz=sizeOf(r.body); if(!sz||!SMALL.test(sz)) continue; n++;
    for(const s of r.sel.split(/\s*,\s*/)){
      if(EXC.has(s)) continue;
      if(r.at==='@media (max-width:640px)' && /^\.cal-c \.v( \.cal-tp-s)?$/.test(s)) continue;          // v5.04: the phone day amounts (Results by day, the v4.08 rule)
      const key=(s==='.cal-c .v .cal-tp-s' && !r.at ? '@media (min-width:641px)' : r.at)+'|'+s;      // its base rule: raised above 640px only (the .t and .n counts are raised at every width)
      if(!raised.has(key)) missing.push(key); } }
  check('every rule under 12px (font-size 7–11.5px and the font: shorthands, 121 today) is raised to 12px in the same @media, or is a named exception', n>=121 && !missing.length, {n, missing});
  const exNow=[...after].filter(r=>[...EXC].some(e=>r.sel.split(/\s*,\s*/).includes(e)) && sizeOf(r.body)==='12px');
  check('the exceptions are not raised (.lteam .tos, SVG text, .lc-d small, phone .cal-c)', !exNow.length && !after.some(r=>r.at==='@media (max-width:640px)' && /\.cal-c \.v/.test(r.sel) && sizeOf(r.body)==='12px'), exNow.map(r=>r.sel));
  check('tabular digits on body, button, input, select, textarea, svg text, and again on the font: shorthand rules (.pk-draft, the live field and spark text)',
    /body, button, input, select, textarea, svg text\{font-variant-numeric:tabular-nums\}/.test(style) && /\.pk-draft, \.lf-pintx, \.lf-pilltx, \.lf-num, \.lspark text\{font-variant-numeric:tabular-nums\}/.test(style));
  check('inline sizes set in the script are 12px: #fillsRaw and the three playedHtml lines (no 11px or 11.5px left)',
    /<pre id="fillsRaw" style="[^"]*font-size:12px/.test(html) && (playedHtmlSrc().match(/font-size:12px/g)||[]).length===3 && !/font-size:11(\.5)?px/.test(playedHtmlSrc()), playedHtmlSrc().match(/font-size:[\d.]+px/g));
  check('the decorative timeout dots are aria-hidden', /<span class="tos" aria-hidden="true" title=/.test(html));
  const after1671=html.slice(html.indexOf('</style>'));
  const left=(after1671.match(/font-size: ?(1[01](\.5)?|[6-9](\.5)?)px/g)||[]);
  check('no other 6–11.5px inline font-size left in the page after the first </style>', !left.length, left);

  // ---- rendered: every page, 4 widths × 2 themes
  const b=await chromium.launch(); const errs=[]; const under={}, tabOk={}, tabBad=[], scroll={}, overlaps=[], svgSeen=new Set(); let views=0, pkSeen=0; const pkOut=[];
  for(const PS of PASSES) for(const theme of THEMES) for(const w of WIDTHS){
    const ctx=await b.newContext({viewport:{width:w,height:900},timezoneId:'America/Chicago'}); await ctx.clock.install({time:new Date(PS.name==='seeded'?NOW:CNOW)});
    if(PS.name==='seeded') await ctx.addInitScript(seed); else await ctx.addInitScript(cardsInit, [CARD_ROWS,CDAY,CARD_PX]);
    await ctx.addInitScript(t=>{ try{ localStorage.setItem('mbev.theme',t); }catch(e){} }, theme);
    const p=await ctx.newPage(); p.on('pageerror',e=>errs.push(theme+' '+w+': '+e.message));
    await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/espn\.com.*scoreboard/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
    await p.goto('http://app.test/'); await p.waitForTimeout(1200);
    await p.evaluate(()=>{ const t=document.getElementById('tbFoldBtn'); if(t) t.click(); }); await p.waitForTimeout(250);
    if(PS.name==='cards'){ await p.evaluate(()=>{ const i=document.getElementById('books'); i.value='Novig, Polymarket US'; i.dispatchEvent(new Event('input',{bubbles:true})); }); await p.waitForTimeout(700); await p.evaluate(()=>document.querySelector('#modeBar button[data-mode="clair"]').click()); await p.waitForTimeout(400); }   // 🔮 Brujo holds the card   // open the TODAY line, so its pills are measured too
    for(const [v,src] of PS.views){
      await p.evaluate(([v,src])=>{ const t=document.querySelector('.tab[data-view="'+v+'"]'+(src?'[data-src="'+src+'"]':'')); t.click(); document.querySelectorAll('details').forEach(d=>d.open=true); },[v,src]); await p.waitForTimeout(350); views++;
      const R=await p.evaluate(w=>{ const out={small:[], tab:{}, sw:document.documentElement.scrollWidth-innerWidth, ov:[], svgs:[], pk:0, pkOut:[]};
        const vis=el=>{ const c=getComputedStyle(el); if(c.display==='none'||c.visibility==='hidden') return false; const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
        const exc=el=>!!(el.closest('.tos') || el.closest('.lc-d small') || (w<=640 && el.closest('.cal-c .v')));
        for(const el of document.querySelectorAll('body *')){ if(el.closest('script,style,svg,option,noscript')) continue;
          if(![...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())) continue; if(!vis(el)) continue;
          const fs=parseFloat(getComputedStyle(el).fontSize); if(fs<11.99 && !exc(el)) out.small.push(fs+'px '+el.tagName.toLowerCase()+(el.className&&typeof el.className==='string'?'.'+el.className.trim().split(/\s+/).join('.'):'')+' "'+el.textContent.trim().slice(0,24)+'"'); }
        const samp={'.sc-t b':'.sc-t b', '.tb-pill':'.tb-pill', 'Reports td.num':'#v-reports td.num', 'a button':'button.log, .tab'};
        for(const [k,s] of Object.entries(samp)){ const el=[...document.querySelectorAll(s)].find(vis); if(el) out.tab[k]=getComputedStyle(el).fontVariantNumeric; }
        for(const svg of document.querySelectorAll('svg')){ if(!vis(svg)) continue; const T=[...svg.querySelectorAll('text')].filter(t=>t.textContent.trim()).map(t=>({t:t.textContent.trim(), r:t.getBoundingClientRect()})).filter(x=>x.r.width>0); if(T.length>1) out.svgs.push(svg.getAttribute('class')||'svg');
          for(let i=0;i<T.length;i++) for(let j=i+1;j<T.length;j++){ const a=T[i].r, c=T[j].r; const ox=Math.min(a.right,c.right)-Math.max(a.left,c.left), oy=Math.min(a.bottom,c.bottom)-Math.max(a.top,c.top);
            if(ox>1 && oy>1) out.ov.push((svg.getAttribute('class')||'svg')+': "'+T[i].t+'" / "'+T[j].t+'"'); } }
        for(const b of document.querySelectorAll('.pk-legs li > b')){ if(!vis(b)) continue; const c=b.closest('.pk-card'), li=b.closest('li'); if(!c||!li) continue; out.pk++;   // v5.04: a leg's chance stays inside its card and its row
          const r=b.getBoundingClientRect(), cr=c.getBoundingClientRect(), lr=li.getBoundingClientRect(); if(r.right>cr.right-1 || r.left<cr.left || r.right>lr.right+0.5) out.pkOut.push(b.textContent.trim()+' right '+Math.round(r.right)+' card '+Math.round(cr.right)+' row '+Math.round(lr.right)); }
        return out; }, w);
      const key=PS.name+' '+theme+' '+w+' '+v.slice(2);
      for(const s of R.small){ under[s]=under[s]||[]; under[s].push(key); }
      for(const [k,val] of Object.entries(R.tab)){ if(/tabular-nums/.test(val)) tabOk[k]=(tabOk[k]||0)+1; else tabBad.push(key+' '+k+'='+val); }
      if(R.sw>0) scroll[key]=R.sw;
      pkSeen+=R.pk; R.pkOut.forEach(x=>pkOut.push(key+' '+x));
      R.ov.forEach(o=>overlaps.push(key+' '+o)); R.svgs.forEach(x=>svgSeen.add(x));
    }
    await ctx.close(); }
  await b.close();
  check('opened all 11 pages at 4 widths in light and dark, plus a board with cards to place ('+views+' page views)', views===(VIEWS.length+1)*WIDTHS.length*THEMES.length, views);
  check('no visible text the app writes is under 12px, outside the named exceptions (SVG text exempt)', !Object.keys(under).length, Object.entries(under).slice(0,12).map(([k,v])=>k+' @ '+v.slice(0,3).join(', ')));
  check('sampled numbers have tabular digits: a card tile (.sc-t b), a TODAY pill, a Reports number cell, a button', tabOk['.sc-t b']>0 && tabOk['.tb-pill']>0 && tabOk['Reports td.num']>0 && tabOk['a button']>0 && !tabBad.length, {tabOk, tabBad:tabBad.slice(0,6)});
  check('no sideways page scroll on any page, width or theme', !Object.keys(scroll).length, scroll);
  check('SVG chart labels do not overlap (SVG text keeps its size, so it is checked for overlap instead)', svgSeen.size>0 && !overlaps.length, {charts:[...svgSeen], overlaps:[...new Set(overlaps)].slice(0,8)});
  check('Parlay: every leg chance (.pk-legs li > b) sits inside its card and its row, at every width and theme', pkSeen>0 && !pkOut.length, {pkSeen, out:pkOut.slice(0,8)});
  check('no page errors', !errs.length, errs.slice(0,5));
  console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(fail?1:0);
})();
function playedHtmlSrc(){ const i=html.indexOf('function playedHtml(b){'); return html.slice(i, html.indexOf('\n}\n', i)); }
