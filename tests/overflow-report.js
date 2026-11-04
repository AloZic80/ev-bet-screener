// node tests/overflow-report.js <index.html> [json] — finds text that runs off its box or pushes the page sideways, per tab and width
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium, devices } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8'); const asJson=process.argv[3]==='json';
const seed=require('./seed.js');
(async()=>{ const b=await chromium.launch(); const out={};
  for(const [tag,opt] of [['1440',{viewport:{width:1440,height:900}}],['1100',{viewport:{width:1100,height:900}}],['820',{viewport:{width:820,height:1100}}],['390',devices['iPhone 13']]]){
    const ctx=await b.newContext(opt); await ctx.addInitScript(seed); const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    await p.route('**/*',r=>{const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
      if(/espn\.com.*scoreboard/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort();});
    await p.goto('http://app.test/'); await p.waitForTimeout(1500);
    const tabs=await p.$$eval('.tab',t=>t.filter(x=>x.offsetParent!==null).map(x=>x.dataset.view));
    for(const v of [...new Set(tabs)]){
      await p.evaluate(v=>document.querySelector('.tab[data-view="'+v+'"]').click(),v); await p.waitForTimeout(500);
      await p.evaluate(()=>document.querySelectorAll('#v-settings details, #v-perf details, #v-log details, #v-add details').forEach(d=>d.open=true)); await p.waitForTimeout(200);
      const r=await p.evaluate(()=>{
        const W=innerWidth, res=[], seen=new Set();
        const scrollAnc=el=>{ for(let a=el.parentElement;a;a=a.parentElement){ const c=getComputedStyle(a); if(/(auto|scroll)/.test(c.overflowX)) return a; } return null; };
        const name=el=>el.tagName.toLowerCase()+(el.id?'#'+el.id:'')+(el.className&&typeof el.className==='string'?'.'+el.className.trim().split(/\s+/).slice(0,2).join('.'):'');
        const pageWide=document.documentElement.scrollWidth>W+1;
        for(const el of document.querySelectorAll('body *')){
          if(el.offsetParent===null && getComputedStyle(el).position!=='fixed') continue;
          if(el.closest('.tabs')||el.closest('script,style,svg,option,datalist')) continue;
          const txt=(el.innerText||'').replace(/\s+/g,' ').trim(); if(!txt) continue;
          const rc=el.getBoundingClientRect(); if(!rc.width) continue;
          const sa=scrollAnc(el);
          const c=getComputedStyle(el);
          let why=null;
          if(!sa && rc.right>W+1 && el.children.length===0) why='off-screen →'+Math.round(rc.right-W)+'px';
          else if(el.children.length===0 && /hidden|clip/.test(c.overflowX) && el.scrollWidth>el.clientWidth+2 && el.tagName!=='INPUT' && el.tagName!=='SELECT') why='cut off'+(c.textOverflow==='ellipsis'?' (…)':'');
          else if(el.children.length===0 && !sa && el.parentElement && el.scrollWidth<=el.clientWidth+2){ const pr=el.parentElement.getBoundingClientRect(); const pc=getComputedStyle(el.parentElement);
            if(rc.right>pr.right+2 && !/(auto|scroll)/.test(pc.overflowX) && pc.position!=='absolute') why='spills out of its box by '+Math.round(rc.right-pr.right)+'px'; }
          if(!why) continue;
          const k=name(el)+'|'+why.split(' ')[0]; if(seen.has(k)) continue; seen.add(k);
          res.push({el:name(el), why, text:txt.slice(0,70), inScroller:!!sa});
        }
        // boxes that scroll sideways because text is kept on one line
        for(const sc of document.querySelectorAll('body *')){
          if(sc.offsetParent===null || sc.closest('.tabs')) continue; const c=getComputedStyle(sc);
          if(!/(auto|scroll)/.test(c.overflowX) || sc.scrollWidth<=sc.clientWidth+4) continue;
          let worst=null; sc.querySelectorAll('*').forEach(el=>{ if(el.children.length) return; const t=(el.innerText||'').replace(/\s+/g,' ').trim(); if(t.length<25) return;
            let nw=false; for(let a=el;a&&a!==sc;a=a.parentElement){ if(/nowrap|pre$/.test(getComputedStyle(a).whiteSpace)){ nw=true; break; } }
            if(nw && (!worst || t.length>worst.length)) worst=t; });
          if(worst) res.push({el:name(sc), why:'scrolls sideways +'+(sc.scrollWidth-sc.clientWidth)+'px', text:'longest one-line text: '+worst.slice(0,60), inScroller:true});
        }
        return {pageWide, docW:document.documentElement.scrollWidth, W, items:res};
      });
      out[tag+' '+v]=r;
    }
    if(errs.length) out[tag+' errors']=errs;
    await ctx.close();
  }
  await b.close();
  if(asJson) return console.log(JSON.stringify(out));
  for(const [k,r] of Object.entries(out)){ if(Array.isArray(r)){ console.log(k,r); continue; }
    if(!r.pageWide && !r.items.length) continue;
    console.log('\n## '+k+(r.pageWide?'  ⚠ PAGE SCROLLS SIDEWAYS ('+r.docW+' > '+r.W+')':''));
    r.items.forEach(x=>console.log('  - '+x.why.padEnd(28)+' '+x.el.padEnd(34)+' "'+x.text+'"')); }
})();
