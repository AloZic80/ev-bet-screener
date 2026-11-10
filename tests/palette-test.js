// node tests/palette-test.js — v4.33. Alonzo: "with an option to change the colour palette, in case I want blue, red, etc., but as a scheme".
// Settings › Layout › Colours: Green (Augi's), Blue, Red, Purple, Graphite. Each is a full set for light and dark. Checked here for every scheme and
// both themes: the active tab is the scheme's colour, white on it and accent text on the page and panels pass 4.5:1, ink and muted text pass 4.5:1,
// the choice is remembered after a reload, and wins stay green.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
(async()=>{
  const b=await chromium.launch();
  for(const theme of ['light','dark']){
    const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:1280,height:900},colorScheme:theme});
    await ctx.addInitScript(t=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.theme',t); }catch(e){} }, theme);
    const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
    await p.goto('http://app.test/'); await p.waitForTimeout(800);
    for(const pal of ['green','blue','red','purple','graphite']){
      await p.evaluate(v=>document.querySelector('#paletteSeg [data-p="'+v+'"]').click(), pal); await p.waitForTimeout(80);
      const m=await p.evaluate(()=>{ const cs=getComputedStyle(document.documentElement), v=k=>cs.getPropertyValue(k).trim();
        const hex=h=>{ h=h.replace('#',''); return [0,2,4].map(i=>parseInt(h.substr(i,2),16)); }, lum=c=>{ const a=c.map(x=>{ x/=255; return x<=.03928?x/12.92:Math.pow((x+.055)/1.055,2.4); }); return .2126*a[0]+.7152*a[1]+.0722*a[2]; };
        const cr=(x,y)=>{ const A=lum(hex(x)), B=lum(hex(y)); return +((Math.max(A,B)+.05)/(Math.min(A,B)+.05)).toFixed(2); };
        return {tab:getComputedStyle(document.querySelector('.tabs .tab.on')).backgroundColor, brand:v('--brand'),
          white:cr('#FFFFFF',v('--brand')), accPage:cr(v('--accent'),v('--page')), accPanel:cr(v('--accent'),v('--panel')), accBg:cr(v('--accent'),v('--accent-bg')),
          ink:cr(v('--ink'),v('--page')), soft:cr(v('--soft'),v('--page')), softPanel:cr(v('--soft'),v('--panel')), gain:v('--gain')}; });
      const toRgb=h=>{ h=h.replace('#',''); return 'rgb('+[0,2,4].map(i=>parseInt(h.substr(i,2),16)).join(', ')+')'; };
      const ok=m.tab===toRgb(m.brand) && m.white>=4.5 && m.accPage>=4.5 && m.accPanel>=4.5 && m.accBg>=4.5 && m.ink>=4.5 && m.soft>=4.5 && m.softPanel>=4.5;
      check(theme+' · '+pal+': the active tab is the scheme colour; white on it, accent text, ink and muted text all pass 4.5:1', ok, m);
    }
    // v4.37: Custom: any colour (wheel or grid); the scheme is toned so every pair still passes 4.5:1, for awkward colours too
    for(const c of ['#FFD400','#00BCD4','#FF00FF','#7FFF00','#808080','#000000','#FFFFFF','#8B4513','#E4572E','#14213D','#0F172A']){   /* v4.58: dark navies (the owner’s phone) */
      await p.evaluate(c=>{ const k=document.getElementById('palPick'); k.value=c.toLowerCase(); k.dispatchEvent(new Event('input',{bubbles:true})); }, c); await p.waitForTimeout(60);
      const m=await p.evaluate(()=>{ const cs=getComputedStyle(document.documentElement), v=k=>cs.getPropertyValue(k).trim();
        const hex=h=>{ h=h.replace('#',''); return [0,2,4].map(i=>parseInt(h.substr(i,2),16)); }, lum=c=>{ const a=c.map(x=>{ x/=255; return x<=.03928?x/12.92:Math.pow((x+.055)/1.055,2.4); }); return .2126*a[0]+.7152*a[1]+.0722*a[2]; };
        const cr=(x,y)=>{ const A=lum(hex(x)), B=lum(hex(y)); return +((Math.max(A,B)+.05)/(Math.min(A,B)+.05)).toFixed(2); };
        return {pal:document.documentElement.getAttribute('data-palette'), tab:getComputedStyle(document.querySelector('.tabs .tab.on')).backgroundColor, brand:v('--brand'),
          white:cr('#FFFFFF',v('--brand')), accPage:cr(v('--accent'),v('--page')), accPanel:cr(v('--accent'),v('--panel')), accBg:cr(v('--accent'),v('--accent-bg')),
          ink:cr(v('--ink'),v('--page')), soft:cr(v('--soft'),v('--page')), softPanel:cr(v('--soft'),v('--panel')), brandPage:cr(v('--brand'),v('--page')), brandPanel:cr(v('--brand'),v('--panel'))}; });
      const toRgb=h=>{ h=h.replace('#',''); return 'rgb('+[0,2,4].map(i=>parseInt(h.substr(i,2),16)).join(', ')+')'; };
      const ok=m.pal==='custom' && m.tab===toRgb(m.brand) && m.white>=4.5 && m.accPage>=4.5 && m.accPanel>=4.5 && m.accBg>=4.5 && m.ink>=4.5 && m.soft>=4.5 && m.softPanel>=4.5 && m.brandPage>=3 && m.brandPanel>=3;
      check(theme+' · Custom '+c+': the tab takes a toned version of it; white on it, accent, ink and muted text all pass 4.5:1; the tab and buttons stand out 3:1 from the page and panel (v4.58)', ok, m);
    }
    await p.evaluate(()=>document.querySelector('#palGrid .pal-sw[data-c="#0E7490"]').click()); await p.reload(); await p.waitForTimeout(700);
    const kc=await p.evaluate(()=>({pal:document.documentElement.getAttribute('data-palette'), on:(document.querySelector('#paletteSeg .on')||{}).dataset, pick:document.getElementById('palPick').value, sw:document.querySelector('#palGrid .pal-sw[aria-pressed="true"]')&&document.querySelector('#palGrid .pal-sw[aria-pressed="true"]').dataset.c, css:!!document.getElementById('palCustomCss')}));
    check(theme+': a colour from the grid (#0E7490) is remembered after a reload: Custom on, the picker and the grid show it', kc.pal==='custom' && kc.on && kc.on.p==='custom' && kc.pick==='#0e7490' && kc.sw==='#0E7490' && kc.css, kc);
    await p.evaluate(()=>document.querySelector('#paletteSeg [data-p="red"]').click()); await p.reload(); await p.waitForTimeout(700);
    const kept=await p.evaluate(()=>({pal:document.documentElement.getAttribute('data-palette'), on:(document.querySelector('#paletteSeg .on')||{}).dataset, gain:getComputedStyle(document.documentElement).getPropertyValue('--gain').trim()}));
    check(theme+': Red is remembered after a reload, and wins stay green (--gain) in the red scheme', kept.pal==='red' && kept.on && kept.on.p==='red' && /^#(0B7A3B|3ED98A)$/i.test(kept.gain), kept);
    check(theme+': no page errors', !errs.length, errs);
    await ctx.close();
  }
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
