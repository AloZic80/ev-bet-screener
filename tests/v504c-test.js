// node tests/v504c-test.js — v5.04 (El Diseñador round 3b, build plan step "v5.05 Price age in words on every card"): every board card says how old its
// price is in words, top right: "Price under 1 min old", "Price 40 min old", "Price 13 h old"; a card with no price time says "Price time unknown".
// A dot in the accent colour, hollow when old (over 30 min, the same amber rule as before) or unknown. Display only: no chance, EV, stake or rule changes.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,700)); };
const NOW=Date.parse('2026-11-14T19:00:00Z'), DAY='2026-11-14', H=3600e3, TIP=Date.parse('2026-11-15T02:00:00Z'), iso=ms=>new Date(ms).toISOString();
const T=(ha,abbr)=>({ha,id:abbr,abbr,name:abbr+' Team',loc:abbr,nick:'Team',logo:'',rec:'',color:'333333',alt:'ffffff'});
const am=p=>p>=0.5?String(Math.round(-100*p/(1-p))):'+'+Math.round(100*(1-p)/p);
const row=(id,player,age,o)=>{ const r=Object.assign({name:player,team:'T'+id,game:'T'+id+' @ H'+id,matchup:'T'+id+' @ H'+id,side:'O',sport:'NHL',market:'1.5 Shots On Goal',kind:'prop',book:'Novig',offeredRaw:am(0.58),offeredProb:0.58,fairProb:0.62,fairRaw:'',mktProb:0.62,stars:3,evModel:'market',
  gameInfo:{state:'pre',startISO:iso(TIP),eventId:'7'+id,timeCT:'',detail:'',teams:[T('away','T'+id),T('home','H'+id)]},src:'api:NHL:props',apiKey:id}, o||{}); if(age!=null) r.loadedAt=iso(NOW-age); return r; };
const ROWS=[row('a','Fresh Anders',20e3), row('b','Four Bergman',4*60e3), row('c','Forty Castillo',40*60e3), row('d','Thirteen Dahl',13*H), row('e','Unknown Eriksen',null),
  row('f','Capped Fuentes',30e3,{sport:'NBA',market:'2.5 Threes',offeredRaw:am(0.54),offeredProb:0.54,fairProb:0.60,mktProb:0.585})];   // v5.04 review: a capped bet with a two-line money note, to test the 390 px bet row
const NAMES=['Fresh Anders','Four Bergman','Forty Castillo','Thirteen Dahl','Unknown Eriksen'];
(async()=>{ const b=await chromium.launch();
  for(const [W,theme] of [[390,'light'],[390,'dark'],[1000,'light'],[1280,'light'],[1280,'dark'],[1960,'light']]){
    const tag=W+' px '+theme;
    const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:W,height:1000},colorScheme:theme}); await ctx.clock.install({time:new Date(NOW)});
    await ctx.addInitScript(([R,d,th])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig',bank:'5000',cfgVer:3.03})); localStorage.setItem('mbev.cards','1'); localStorage.setItem('mbev.theme',th); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows:R})); }catch(e){} },[ROWS,DAY,theme]);
    const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
      if(/\/live\?/.test(u)) return r.fulfill({contentType:'application/json',body:'{"results":{}}'});
      if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
    await p.goto('http://app.test/'); await p.waitForTimeout(1300);
    if(W===390 && theme==='light'){
      const U=await p.evaluate(()=>({n:ageWords(null), nan:ageWords(NaN), s0:ageWords(0), s59:ageWords(59e3), m1:ageWords(60e3), m4:ageWords(4*60e3), m40:ageWords(40*60e3), h13:ageWords(13*3600e3), d3:ageWords(3*86400e3), txt:ageTxt(55e3), txtm:ageTxt(40*60e3)}));
      check('ageWords: "" for no time; "under 1 min", "1 min", "4 min", "40 min", "13 h", "3 d" (same steps as ageTxt)', U.n==='' && U.nan==='' && U.s0==='under 1 min' && U.s59==='under 1 min' && U.m1==='1 min' && U.m4==='4 min' && U.m40==='40 min' && U.h13==='13 h' && U.d3==='3 d', U);
      check('ageTxt is unchanged for the tooltips, the ring and the Sentinel bars ("55s", "40m")', U.txt==='55s' && U.txtm==='40m', U);
    }
    // every mode tab, every card: read the age pill
    const all={}, perCard=[];
    const modes=await p.evaluate(()=>[...document.querySelectorAll('#modeBar button')].length);
    for(let i=0;i<Math.max(1,modes);i++){
      await p.evaluate(i=>{ const bt=document.querySelectorAll('#modeBar button')[i]; if(bt) bt.click(); }, i); await p.waitForTimeout(250);
      const got=await p.evaluate(()=>[...document.querySelectorAll('#placeCards .sc-card')].map(c=>{ const P=[...c.querySelectorAll('.sc-pill.age')], a=P[0], d=a&&a.querySelector('.age-dot'), cs=d&&getComputedStyle(d);
        const nm=(c.textContent.match(/(Fresh Anders|Four Bergman|Forty Castillo|Thirteen Dahl|Unknown Eriksen|Capped Fuentes)/)||[])[1]||null;
        let inside=null, overlaps=null; if(a){ const r=a.getBoundingClientRect(), cr=c.getBoundingClientRect(); inside=r.left>=cr.left-1 && r.right<=cr.right+1;
          overlaps=[...c.querySelectorAll('*')].filter(e=>!a.contains(e) && !e.contains(a) && e.children.length===0 && e.textContent.trim()).some(e=>{ const q=e.getBoundingClientRect(); return q.width && q.height && q.left<r.right-1 && q.right>r.left+1 && q.top<r.bottom-1 && q.bottom>r.top+1; }); }
        /* v5.04 review: the age pill is the last pill in the score row and sits at the right end of the line it lands on */
        const top=c.querySelector('.sc-top'), last=top&&top.lastElementChild===a; let atEnd=null; if(a&&top){ const r=a.getBoundingClientRect(), tr=top.getBoundingClientRect(), pr=parseFloat(getComputedStyle(top).paddingRight)||0; atEnd=Math.abs((tr.right-pr)-r.right)<=1.5; }
        /* v5.04 review: at a narrow card, the "wins … · back …" money line never covers the "price … · OK to …" text */
        const m=c.querySelector('.sc-money span'), pe=[...c.querySelectorAll('.sc-bet *')].filter(e=>/OK to/.test(e.textContent)&&!e.contains(m)).pop(); let moneyHit=null;
        if(m&&pe){ const mr=m.getBoundingClientRect(), rg=document.createRange(); rg.selectNodeContents(pe); moneyHit=[...rg.getClientRects()].some(q=>q.width&&q.left<mr.right-0.5&&mr.left<q.right-0.5&&q.top<mr.bottom-0.5&&mr.top<q.bottom-0.5); }
        const lim=c.querySelector('.sc-money .sc-lim');
        return {nm, n:P.length, last, atEnd, moneyHit, capped:!!lim, moneyLines:m?Math.round(m.getBoundingClientRect().height/14):0, t:a?a.textContent.trim():null, cls:a?a.className:'', title:a?a.title:'', dot:!!d, dotBg:cs?cs.backgroundColor:null, dotBd:cs?cs.borderTopColor:null, accent:getComputedStyle(c).getPropertyValue('--accent').trim(), inside, overlaps}; }));
      got.forEach(g=>{ perCard.push(g); if(g.nm) all[g.nm]=g; });
    }
    check(tag+': every card on every tab has exactly one age pill, and it starts "Price "', perCard.length>0 && perCard.every(g=>g.n===1 && /^Price /.test(g.t||'')), perCard.map(g=>[g.nm,g.n,g.t]));
    check(tag+': all five test cards were seen', NAMES.every(n=>all[n]), Object.keys(all));
    const A=all['Fresh Anders']||{}, B=all['Four Bergman']||{}, C=all['Forty Castillo']||{}, D=all['Thirteen Dahl']||{}, E=all['Unknown Eriksen']||{};
    check(tag+': a price read 20 s ago reads "Price under 1 min old", not old, dot filled', A.t==='Price under 1 min old' && !/\bold\b/.test(A.cls) && A.dot && A.dotBg!=='rgba(0, 0, 0, 0)', A);
    check(tag+': a price read 4 min ago reads "Price 4 min old", not old', B.t==='Price 4 min old' && !/\bold\b/.test(B.cls), B);
    check(tag+': a price read 40 min ago reads "Price 40 min old" with .old (amber, as before) and a hollow dot; the tooltip still says when and what to do', C.t==='Price 40 min old' && /\bold\b/.test(C.cls) && C.dotBg==='rgba(0, 0, 0, 0)' && /This price was read 40m ago/.test(C.title), C);
    check(tag+': a 13 h row (⏱ Old tab) reads "Price 13 h old" with .old', D.t==='Price 13 h old' && /\bold\b/.test(D.cls), D);
    check(tag+': a row with no price time reads "Price time unknown" (.unk, hollow dot, tooltip says to check the price)', E.t==='Price time unknown' && /\bunk\b/.test(E.cls) && !/\bold\b/.test(E.cls) && E.dotBg==='rgba(0, 0, 0, 0)' && /Check it at the book/.test(E.title), E);
    check(tag+': no card shows the old "⏱ 55s"-style age', perCard.every(g=>!/^⏱/.test(g.t||'')), perCard.map(g=>g.t));
    check(tag+': the age pill stays inside its card and covers no other text (v4.84 no-overlap rule)', perCard.every(g=>g.inside && !g.overlaps), perCard.map(g=>[g.nm,g.inside,g.overlaps]));
    check(tag+': the age pill is the last pill in the score row and ends at the row’s right edge (top right of the pill area)', perCard.every(g=>g.last && g.atEnd), perCard.map(g=>[g.nm,g.last,g.atEnd]));
    check(tag+': the “wins … · back …” money line covers no part of “price … · OK to …” on any card (and the capped test card was seen)', perCard.every(g=>g.moneyHit===false) && perCard.some(g=>g.nm==='Capped Fuentes' && g.capped), perCard.map(g=>[g.nm,g.moneyHit,g.capped,g.moneyLines]));
    if(W===390) check(tag+': no sideways scroll', await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    check(tag+': no page errors', !errs.length, errs); await ctx.close(); }
  await b.close(); console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(fail?1:0); })();
