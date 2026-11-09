// node tests/layout-test.js [repo dir] — Layout toggle: Auto / Phone (phone.html frame on a computer) / Desktop (on a phone)
const { chromium, devices } = require('playwright'); const fs=require('fs'), path=require('path');
const dir=process.argv[2]||path.join(__dirname,'..');
const files={'/':'index.html','/index.html':'index.html','/phone.html':'phone.html'};
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const serve=async ctx=>ctx.route('**/*',r=>{ const u=new URL(r.request().url());
  if(u.host==='app.test'){ const f=files[u.pathname]; return f?r.fulfill({contentType:'text/html',body:fs.readFileSync(path.join(dir,f),'utf8')}):r.fulfill({status:404,body:'nf'}); }
  if(/espn\.com.*scoreboard/.test(u.href)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
(async()=>{ const b=await chromium.launch(); const errs=[];
  // --- computer
  { const ctx=await b.newContext({viewport:{width:1440,height:950}}); await serve(ctx); const p=await ctx.newPage(); p.on('pageerror',e=>errs.push('desk: '+e.message));
    await p.goto('http://app.test/'); await p.waitForTimeout(900);
    const lb=await p.$eval('#layoutBtn',e=>({label:e.getAttribute('aria-label'), svg:!!e.querySelector('svg')}));
    check('computer: header button offers the phone layout', lb.label==='Show the phone layout' && lb.svg, lb);
    await p.click('.tab[data-view="v-settings"]'); await p.waitForTimeout(300);
    const seg=await p.$$eval('#layoutSeg button',bs=>bs.map(x=>x.dataset.l+':'+x.getAttribute('aria-checked')));
    check('Settings shows Auto selected', seg.join()==='auto:true,phone:false,desktop:false', seg);
    await Promise.all([p.waitForURL('**/phone.html'), p.click('#layoutBtn')]); await p.waitForTimeout(1500);
    check('header button opens phone.html', p.url().endsWith('/phone.html'), p.url());
    check('phone.html runs no app of its own', await p.evaluate(()=>!document.getElementById('v-board')), true);
    const fr=p.frame({url:/embed=phone/}); 
    const inside=fr && await fr.evaluate(()=>({w:innerWidth, tabs:getComputedStyle(document.querySelector('.tabs')).position, layout:document.documentElement.getAttribute('data-layout'), btn:document.getElementById('layoutBtn').getAttribute('aria-label')}));
    check('framed app is 390px wide with the phone tab bar', inside && inside.w===390 && inside.tabs==='fixed' && inside.layout==='embed', inside);
    check('inside the frame the button offers the full layout', inside && inside.btn==='Show the full layout', inside&&inside.btn);
    await p.click('.sizes button[data-w="430"]'); await p.waitForTimeout(400);
    check('Large size: frame becomes 430px', await fr.evaluate(()=>innerWidth)===430, await fr.evaluate(()=>innerWidth));
    await p.click('.sizes button[data-w="390"]'); await p.waitForTimeout(300);
    await p.goto('http://app.test/'); await p.waitForTimeout(1500);
    check('Phone is remembered: opening the site goes to phone.html', p.url().endsWith('/phone.html'), p.url());
    await Promise.all([p.waitForURL(u=>!String(u).endsWith('phone.html')), p.click('#back')]); await p.waitForTimeout(1000);
    check('Back to the full layout', !p.url().endsWith('phone.html') && await p.evaluate(()=>localStorage.getItem('mbev.layout'))==='auto', p.url());
    // from inside the frame
    await p.evaluate(()=>localStorage.setItem('mbev.layout','phone')); await p.goto('http://app.test/phone.html'); await p.waitForTimeout(1500);
    const fr2=p.frame({url:/embed=phone/}); await Promise.all([p.waitForURL(u=>!String(u).endsWith('phone.html')), fr2.click('#layoutBtn')]); await p.waitForTimeout(900);
    check('button inside the frame returns the whole window to the full layout', !p.url().endsWith('phone.html') && await p.evaluate(()=>!!document.getElementById('v-board')), p.url());
    await ctx.close(); }
  // --- phone
  { const ctx=await b.newContext(devices['iPhone 13']); await serve(ctx); const p=await ctx.newPage(); p.on('pageerror',e=>errs.push('phone: '+e.message));
    await p.goto('http://app.test/'); await p.waitForTimeout(900);
    let st=await p.evaluate(()=>({w:innerWidth, tabs:getComputedStyle(document.querySelector('.tabs')).position, btn:document.getElementById('layoutBtn').getAttribute('aria-label')}));
    check('phone (Auto): phone layout, button offers desktop', st.w===390 && st.tabs==='fixed' && st.btn==='Show the desktop layout', st);
    await Promise.all([p.waitForNavigation(), p.tap('#layoutBtn')]); await p.waitForTimeout(1200);
    st=await p.evaluate(()=>({w:innerWidth, tabs:getComputedStyle(document.querySelector('.tabs')).position, btn:document.getElementById('layoutBtn').getAttribute('aria-label'), mode:localStorage.getItem('mbev.layout')}));
    check('phone (Desktop): full 1280px layout; v4.30: the tabs stay pinned to the bottom at every width (owner: "the bar does not stay on the bottom")', st.w===1280 && st.tabs==='fixed' && st.mode==='desktop', st);
    check('phone (Desktop): button offers the phone layout back', st.btn==='Show the phone layout', st.btn);
    await p.goto('http://app.test/phone.html'); await p.waitForTimeout(800);
    check('phone.html on a phone just opens the app', !p.url().endsWith('phone.html'), p.url());
    await p.evaluate(()=>localStorage.setItem('mbev.layout','desktop')); await p.reload(); await p.waitForTimeout(900);
    await Promise.all([p.waitForNavigation(), p.tap('#layoutBtn')]); await p.waitForTimeout(1200);
    st=await p.evaluate(()=>({w:innerWidth, mode:localStorage.getItem('mbev.layout')}));
    check('phone: back to Auto', st.w===390 && st.mode==='auto', st);
    await ctx.close(); }
  check('no page errors', errs.length===0, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
