// node tests/v523-ticket-test.js — v5.23 (owner 11/18, Draymond Green on Polymarket US: "what shares or how many? you see, that is what you need to also show on
// the app to bet"; "build"). The exchange line on a card is a "Type this" ticket: the book's own order (side, Limit price, Shares, then the cost), one field
// a row, plus an Expires row (before the start). Same numbers as the line. Display only. Checked at 390, 1000, 1280 and 1960 px.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,600)); };
const NOW=Date.parse('2026-11-12T19:00:00Z'), DAY='2026-11-12', TIP=Date.parse('2026-11-13T01:00:00Z'), iso=ms=>new Date(ms).toISOString();   // tip 7:00 PM CT
const T=(ha,abbr)=>({ha,id:abbr,abbr,name:abbr+' Team',loc:abbr,nick:'Team',logo:'',rec:'',color:'333333',alt:'ffffff'});
const am=p=>p>=0.5?String(Math.round(-100*p/(1-p))):'+'+Math.round(100*(1-p)/p);
const row=(id,name,team,opp,book,price,fair,mkt,o)=>Object.assign({name,team,game:team+' @ '+opp,matchup:team+' @ '+opp,side:'O',sport:'NHL',market:'0.5 Assists',kind:'prop',book,offeredRaw:am(price),offeredProb:price,fairProb:fair,fairRaw:'',mktProb:mkt,stars:4,evModel:'projection',projValue:0.8,
  gameInfo:{state:'pre',startISO:iso(TIP),eventId:'88'+id,timeCT:'',detail:'',teams:[T('away',team),T('home',opp)]},src:'api:NHL:props',apiKey:id,loadedAt:iso(NOW-60e3)},o||{});
const ROWS=[row('aho','Sebastian Aho','CAR','SEA','Polymarket US',0.44,0.56,0.47), row('kx','Quinn Hughes','VAN','PHI','Kalshi',0.53,0.60,0.57,{market:'1.5 Shots'}), row('nv','Jonathan Lekkerimaki','DAL','MIN','Novig',0.519,0.5546,0.526,{market:'1.5 Shots'})];
const S='/tmp/claude-0/-home-user/c5370435-0dbc-56b4-aaf1-597d242c119b/scratchpad';
(async()=>{ const b=await chromium.launch(); const errs=[];
  for(const W of [390,1000,1280,1960]){
    const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:W,height:1000}}); await ctx.clock.install({time:new Date(NOW)});
    await ctx.addInitScript(([R,d])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig, Kalshi, Polymarket',bank:'500',cfgVer:3.03})); localStorage.setItem('mbev.mode',JSON.stringify({mode:'safe'})); localStorage.setItem('mbev.cards','1'); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows:R})); }catch(e){} },[ROWS,DAY]);
    const p=await ctx.newPage(); p.on('pageerror',e=>errs.push(W+': '+e.message));
    await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
    await p.goto('http://app.test/'); await p.waitForTimeout(1300);
    const get=async(name)=>{ await p.evaluate(N=>{ const r=lastRows.find(x=>x.pass && String(x.name||'').includes(N)); if(r){ const f=passFam(r), m=f==='hail'?'clair':f; if(m!==betMode) setMode(m); } }, name); await p.waitForTimeout(300);
      return p.evaluate(n=>{ const c=[...document.querySelectorAll('#placeCards .sc-card')].find(x=>x.textContent.includes(n)); if(!c) return null; const t=c.querySelector('.sc-tkt'); if(!t) return {none:true};
        const cr=c.getBoundingClientRect(), tr=t.getBoundingClientRect(), rows=[...t.querySelectorAll('.sc-kx-i, .sc-tkt-exp')].map(e=>({t:e.innerText.replace(/\s+/g,' ').trim(), top:Math.round(e.getBoundingClientRect().top), r:e.getBoundingClientRect().right}));
        return {h:t.querySelector('.sc-tkt-h').textContent, rows, inCard:tr.left>=cr.left-1 && tr.right<=cr.right+1 && rows.every(x=>x.r<=cr.right+1), line:t.querySelector('.sc-kx').innerText.replace(/\s+/g,' ').trim()}; }, name); };
    const A=await get('Sebastian Aho');
    const ord=A && A.rows && A.rows.map(x=>x.t.split(' ')[0]);
    check(W+' px: Polymarket card shows a "Type this" ticket', A && A.h==='Type this', A);
    check(W+' px: in Polymarket’s order: Limit (not Market) → YES → Limit price → Shares → Cost → Expires, one row each, top to bottom', A && ord && ord.join(' ')==='Limit, YES Limit Shares Cost Expires' && A.rows.every((x,i)=>!i || x.top>A.rows[i-1].top), {ord, tops:A&&A.rows&&A.rows.map(x=>x.top)});
    check(W+' px: Expires says before the start, 7:00 PM CT', A && A.rows && /^Expires before 7:00 PM CT/.test(A.rows[A.rows.length-1].t), A&&A.rows&&A.rows[A.rows.length-1]);
    check(W+' px: the ticket fits inside the card', A && A.inCard, A&&A.inCard);
    const K=await get('Quinn Hughes');
    check(W+' px: Kalshi card gets the ticket too, with Shares, Limit, Max cost and Expires', K && K.h==='Type this' && /Shares/.test(K.line) && /Limit \d+¢/.test(K.line) && /Max cost/.test(K.line) && K.rows.some(x=>/^Expires before 7:00 PM CT/.test(x.t)) && K.inCard, K);
    const N=await get('Jonathan Lekkerimaki');
    check(W+' px: Novig has no what-to-type ticket (unchanged)', N && N.none, N);
    if(W===390 || W===1280){ await p.evaluate(N=>{ const r=lastRows.find(x=>x.pass && String(x.name||'').includes(N)); if(r){ const f=passFam(r), m=f==='hail'?'clair':f; if(m!==betMode) setMode(m); } }, 'Sebastian Aho'); await p.waitForTimeout(300);
      const c=await p.$('#placeCards .sc-card:has-text("Sebastian Aho")'); if(c) await c.screenshot({path:S+'/v523-ticket-'+W+'.png'}); }
    await ctx.close(); }
  // after the start: no Expires row
  check('no page errors', !errs.length, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
