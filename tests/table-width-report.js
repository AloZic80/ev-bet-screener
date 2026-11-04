// node tests/table-width-report.js <index.html> — how far each visible scroll box overflows, per tab and width
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs'); const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
const seed=require('./seed.js');
(async()=>{ const b=await chromium.launch();
  for(const w of [1440,1280,1100,1024,900]){ const ctx=await b.newContext({viewport:{width:w,height:900}}); await ctx.addInitScript(seed); const p=await ctx.newPage();
    await p.route('**/*',r=>{const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/espn\.com.*scoreboard/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort();});
    await p.goto('http://app.test/'); await p.waitForTimeout(1200); const line=[];
    for(const v of ['v-board','v-parlay','v-log','v-perf','v-live','v-money']){ await p.evaluate(v=>document.querySelector('.tab[data-view="'+v+'"]').click(),v); await p.waitForTimeout(400);
      const o=await p.evaluate(v=>[...document.querySelectorAll('#'+v+' .scroll')].filter(s=>s.offsetParent).map(s=>s.scrollWidth-s.clientWidth).filter(x=>x>2),v);
      if(o.length) line.push(v+' +'+o.join('/+')+'px'); }
    console.log(w+'px: '+(line.join('  ')||'no sideways scrolling')); await ctx.close(); }
  await b.close(); })();
