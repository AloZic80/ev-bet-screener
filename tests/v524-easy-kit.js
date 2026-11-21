// v5.24 (Easy, step 3b): helpers shared by v524-easy-screens-test.js and v524-safety-test.js. Boots the practice copy (tests/practice-copy.js) with Easy on at a chosen width.
const fs=require('fs'), path=require('path');
const { openPractice } = require('./practice-copy.js');
module.exports=function kit(html){
  const K={};
  K.T=s=>String(s||'').replace(/\s+/g,' ').trim();
  K.EXROWS=rs=>{ rs.forEach(r=>{ if(r.name==='Anthony Davis' && /poly/i.test(r.book)){ r.fairProb=0.645; r.mktProb=0.62; r.offeredProb=0.57; r.offeredRaw='-133'; } }); return rs; };   // a Polymarket US pick at 62.9%: an exchange pick among the five
  K.open=async function(b, W, H, o){ o=o||{}; const A=await openPractice(b,Object.assign({html:o.html||html,width:W,height:H||844,settleMs:2500},o.practice||{})); const p=A.page;
    A.consoleAll=[]; A.requests=[]; A.dialogs=[]; p.on('console',m=>A.consoleAll.push(m.type()+': '+m.text())); A.ctx.on('request',r=>A.requests.push({u:r.url(), m:r.method(), h:r.headers()}));
    A.consoleBad=[]; p.on('console',m=>{ if(m.type()==='error' && !/Failed to load resource/.test(m.text())) A.consoleBad.push(m.text()); });
    await p.evaluate(()=>{ const M={'Luka Doncic':/^4\.5 Rebounds/,'Bam Adebayo':/^7\.5 Rebounds/,'Zach Charbonnet':/^3\.5 Receptions/,'Isiah Pacheco':/^10\.5 Rushing/}; window.gN=n=>lastRows.find(r=>r.name===n && (!M[n] || M[n].test(r.market))); });
    if(o.pre) await o.pre(p);
    if(o.easy!==false){ await p.evaluate(w=>{ if(w) localStorage.setItem('mbev.easy','{"welcomed":1}'); easySetLevel('easy'); }, o.welcome!==true); await p.waitForTimeout(500); }
    if(o.dark) await p.evaluate(()=>easySetTheme('dark'));
    return A; };
  K.tab=async function(p, view){ await p.click('.tabs .tab[data-view="'+view+'"]'); await p.waitForTimeout(350); };
  // sizes, tap targets and contrast of every text node under a root (in the page)
  K.MEASURE=(rootSel,allowSel)=>{ const root=document.querySelector(rootSel); const res={nodes:0, minFont:99, under12:[], smallBody:[], tapSmall:[], minContrast:99, worst:null, overX:document.documentElement.scrollWidth-innerWidth};
    const parse=c=>{ const m=String(c).match(/rgba?\(([^)]+)\)/); if(!m) return [0,0,0,1]; const a=m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return [a[0],a[1],a[2],a.length>3?a[3]:1]; };
    const comp=(top,under)=>[0,1,2].map(i=>top[i]*top[3]+under[i]*(1-top[3]));
    const bgOf=el=>{ const layers=[]; for(let e=el;e;e=e.parentElement){ const c=parse(getComputedStyle(e).backgroundColor); if(c[3]>0){ layers.push(c); if(c[3]>=1) break; } } let base=parse(getComputedStyle(document.documentElement).backgroundColor); if(base[3]<1) base=[255,255,255,1]; let cur=base.slice(0,3); if(layers.length && layers[layers.length-1][3]>=1) cur=layers.pop().slice(0,3); while(layers.length){ cur=comp(layers.pop(),cur); } return cur; };
    const lum=c=>{ const a=c.map(v=>{ v/=255; return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4); }); return .2126*a[0]+.7152*a[1]+.0722*a[2]; };
    const T1=s=>String(s).replace(/\s+/g,' ').trim();
    const walker=document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n;
    while((n=walker.nextNode())){ const t=n.nodeValue.replace(/\s+/g,' ').trim(); if(!t) continue; const el=n.parentElement; if(!el || el.closest('[hidden]') || !el.getClientRects().length) continue; const cs=getComputedStyle(el); if(cs.visibility==='hidden') continue;
      res.nodes++; const fs=parseFloat(cs.fontSize); if(fs<res.minFont) res.minFont=fs; if(fs<12) res.under12.push([t.slice(0,30),fs]); if(fs<16 && !(allowSel && el.closest(allowSel))) res.smallBody.push([t.slice(0,30),fs,el.className]);
      const fg=parse(cs.color), bg=bgOf(el), fgc=fg[3]<1?comp(fg,bg):fg.slice(0,3), L1=lum(fgc), L2=lum(bg), cr=(Math.max(L1,L2)+.05)/(Math.min(L1,L2)+.05); if(cr<res.minContrast){ res.minContrast=cr; res.worst=[t.slice(0,40),+cr.toFixed(2),cs.color,bg.map(Math.round).join(',')]; } }
    root.querySelectorAll('button,a[href],[role=button],input').forEach(e=>{ if(e.closest('[hidden]') || !e.getClientRects().length) return; const r=e.getBoundingClientRect(); if(r.width<=0) return; if(r.height<43.5 || r.width<43.5) res.tapSmall.push([T1(e.innerText||e.id).slice(0,24), Math.round(r.width), Math.round(r.height)]); });
    res.minContrast=+res.minContrast.toFixed(2); return res; };
  K.rect=(p,sel)=>p.evaluate(s=>{ const e=document.querySelector(s); if(!e) return null; const r=e.getBoundingClientRect(); return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,w:r.width,h:r.height,vh:innerHeight,vw:innerWidth}; },sel);
  K.inView=r=>r && r.top>=0 && r.bottom<=r.vh+0.5 && r.w>0;
  K.FORBID=/\b(guaranteed|sure|lock|can[’']t lose|free money|hot|hurry|last chance|streak|countdown|luck evens out|I found|balance|deposit|wallet)\b|\bonly \d+ left\b|\b(grab|lock in|bet now)\b/i;
  K.GODONLY=/\b(EV|CLV|Kelly|hold|vig|juice|stale|outlier|Sentinels?|moneyline|O\/U|model|odds|God|NaN|undefined)\b|\[object/;
  K.EMOJI=/[\u{1F525}\u{1F389}\u{1F38A}\u{2728}\u{1F4B0}\u{1F911}\u{1F680}\u{1F4A5}]/u;
  K.PROMISE=/\b(will (win|profit|make money)|you will be ahead|always profit|never lose)\b/i;
  K.shot=async(p,name)=>{ if(process.env.EASY_SHOTS) await p.screenshot({path:path.join(process.env.EASY_SHOTS,name)}); };
  K.bodyText=p=>p.evaluate(()=>document.body.innerText);
  K.screenText=p=>p.evaluate(()=>{ const b=document.getElementById('easyBanner'), bt=b?b.innerText:''; return document.body.innerText.replace(bt,''); });   // the page text without the dev banner (which says God mode by design)
  K.mk=()=>{ const r={pass:0, fail:0}; r.check=(n,ok,got)=>{ ok?r.pass++:r.fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,700)); }; return r; };
  return K; };
