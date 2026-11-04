// node tests/a11y-report.js <index.html> — WCAG 2.1 AA checks written for this app (no third-party engine)
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium, devices } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
const seed=require('./seed.js');
const TABS=['v-board','v-parlay','v-add','v-log','v-perf','v-live','v-settings'];
async function open(b,opt,theme){ const ctx=await b.newContext(opt); await ctx.addInitScript(seed);
  await ctx.addInitScript(t=>{ try{ localStorage.setItem('mbev.theme',t); }catch(e){} }, theme);
  const p=await ctx.newPage();
  await p.route('**/*',r=>{const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/espn\.com.*scoreboard/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort();});
  await p.goto('http://app.test/'); await p.waitForTimeout(1200); return {ctx,p}; }
const go=(p,v)=>p.evaluate(v=>{ document.querySelector('.tab[data-view="'+v+'"]').click(); document.querySelectorAll('#'+v+' details').forEach(d=>d.open=true); },v);
// ---- contrast, names, alt, mouse-only, placeholders: run in page
const inPage=()=>{
  const vis=el=>{ const c=getComputedStyle(el); if(c.display==='none'||c.visibility==='hidden') return false; const r=el.getBoundingClientRect(); return r.width>0&&r.height>0&&(el.offsetParent!==null||c.position==='fixed'); };
  const parse=s=>{ const m=String(s).match(/rgba?\(([^)]+)\)/); if(!m) return null; const a=m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return {r:a[0],g:a[1],b:a[2],a:a.length>3?a[3]:1}; };
  const over=(f,b)=>({r:f.r*f.a+b.r*(1-f.a), g:f.g*f.a+b.g*(1-f.a), b:f.b*f.a+b.b*(1-f.a), a:1});
  const lum=c=>{ const f=v=>{ v/=255; return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4); }; return 0.2126*f(c.r)+0.7152*f(c.g)+0.0722*f(c.b); };
  const ratio=(a,b)=>{ const x=lum(a), y=lum(b); return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05); };
  const hex=c=>'#'+[c.r,c.g,c.b].map(v=>Math.round(v).toString(16).padStart(2,'0')).join('');
  const bgOf=el=>{ const stack=[]; let complex=false;
    for(let a=el;a;a=a.parentElement){ const c=getComputedStyle(a); if(c.backgroundImage&&c.backgroundImage!=='none') complex=true; const b=parse(c.backgroundColor); if(b&&b.a>0){ stack.push(b); if(b.a>=1) break; } }
    let bg={r:255,g:255,b:255,a:1}; const page=parse(getComputedStyle(document.body).backgroundColor); if(page&&page.a>=1) bg=page;
    for(let i=stack.length-1;i>=0;i--) bg=over(stack[i],bg); return {bg,complex}; };
  const opac=el=>{ let o=1; for(let a=el;a;a=a.parentElement) o*=parseFloat(getComputedStyle(a).opacity)||1; return o; };
  const cls=el=>el.tagName.toLowerCase()+(el.id?'#'+el.id:'')+(typeof el.className==='string'&&el.className.trim()?'.'+el.className.trim().split(/\s+/).slice(0,2).join('.'):'');
  const out={contrast:{}, names:[], alt:[], mouseOnly:[], placeholderOnly:[], phContrast:{}};
  // text contrast
  for(const el of document.querySelectorAll('body *')){
    if(!vis(el) || el.closest('script,style,svg,option') || el.closest('[disabled]')) continue;
    const own=[...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()); if(!own) continue;
    const c=getComputedStyle(el); const f=parse(c.color); if(!f) continue;
    const {bg,complex}=bgOf(el); if(complex) continue;
    const o=opac(el); const fg=over({...f,a:f.a*o},bg);
    const r=ratio(fg,bg), size=parseFloat(c.fontSize), bold=parseInt(c.fontWeight)>=700, large=size>=24||(size>=18.66&&bold), need=large?3:4.5;
    if(r+0.005<need){ const k=hex(fg)+' on '+hex(bg)+' '+cls(el); const t=[...el.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent.trim()).join(' ').slice(0,40);
      out.contrast[k]=out.contrast[k]||{ratio:+r.toFixed(2), need, n:0, text:t, dim:o<1}; out.contrast[k].n++; }
  }
  // placeholder contrast
  for(const el of document.querySelectorAll('input[placeholder],textarea[placeholder]')){ if(!vis(el)||el.value) continue;
    const f=parse(getComputedStyle(el,'::placeholder').color); if(!f) continue; const {bg}=bgOf(el); const fg=over(f,bg); const r=ratio(fg,bg);
    if(r<4.5){ const k=hex(fg)+' on '+hex(bg); out.phContrast[k]=out.phContrast[k]||{ratio:+r.toFixed(2),n:0,ex:el.placeholder}; out.phContrast[k].n++; } }
  // accessible names
  const nameOf=el=>{ const al=el.getAttribute('aria-label'); if(al&&al.trim()) return al.trim();
    const lb=el.getAttribute('aria-labelledby'); if(lb){ const t=lb.split(/\s+/).map(id=>(document.getElementById(id)||{}).textContent||'').join(' ').trim(); if(t) return t; }
    if(el.labels&&el.labels.length){ const t=[...el.labels].map(l=>l.innerText).join(' ').trim(); if(t) return t; }
    if(/^(BUTTON|A|SUMMARY)$/.test(el.tagName)||el.getAttribute('role')==='button'){ const t=(el.innerText||'').trim(); if(t) return t; const im=el.querySelector('img[alt]'); if(im&&im.alt.trim()) return im.alt.trim(); }
    const ti=el.getAttribute('title'); if(ti&&ti.trim()) return '(title) '+ti.trim();
    return ''; };
  for(const el of document.querySelectorAll('button,a[href],select,input:not([type=hidden]),textarea,summary,[role=button]')){ if(!vis(el)) continue;
    const n=nameOf(el), ph=el.getAttribute('placeholder');
    if(!n){ if(ph) out.placeholderOnly.push(cls(el)+' "'+ph+'"'); else out.names.push(cls(el)+' (no name)'); }
    else if(!/[A-Za-z0-9]/.test(n.replace(/^\(title\) /,''))) out.names.push(cls(el)+' named only "'+n+'"');
    else if(/^(BUTTON|SUMMARY)$/.test(el.tagName) && !el.getAttribute('aria-label') && !/[A-Za-z0-9]/.test((el.innerText||'')) && (el.innerText||'').trim()) out.names.push(cls(el)+' shows only "'+el.innerText.trim()+'" (title is not read as its name)'); }
  for(const im of document.querySelectorAll('img')){ if(!vis(im)) continue; if(!im.hasAttribute('alt')) out.alt.push(cls(im)+' '+(im.src||'').slice(-40)); }
  // clickable but not focusable (mouse-only)
  for(const el of document.querySelectorAll('body *')){ if(!vis(el)) continue; const c=getComputedStyle(el); if(c.cursor!=='pointer') continue;
    if(el.matches('button,a,input,select,textarea,summary,label,[tabindex],[role=button]')||el.closest('button,a,summary,label')) continue;
    if(el.parentElement&&getComputedStyle(el.parentElement).cursor==='pointer'&&!el.parentElement.matches('button,a,summary,label')) continue;
    out.mouseOnly.push(cls(el)+' "'+(el.innerText||'').trim().replace(/\s+/g,' ').slice(0,40)+'"'); }
  return out; };
(async()=>{ const b=await chromium.launch(); const R={contrast:{}, ph:{}, names:new Set(), alt:new Set(), mouse:new Set(), phOnly:new Set()};
  for(const theme of ['light','dark']){ const {ctx,p}=await open(b,{viewport:{width:1280,height:900}},theme);
    for(const v of TABS){ await go(p,v); await p.waitForTimeout(350); const o=await p.evaluate(inPage);
      for(const [k,x] of Object.entries(o.contrast)){ const key=theme+' | '+k; R.contrast[key]=R.contrast[key]||{...x,tabs:new Set()}; R.contrast[key].tabs.add(v.slice(2)); }
      for(const [k,x] of Object.entries(o.phContrast)){ R.ph[theme+' | '+k]=x; }
      if(theme==='light'){ o.names.forEach(x=>R.names.add(x)); o.alt.forEach(x=>R.alt.add(x)); o.mouseOnly.forEach(x=>R.mouse.add(x)); o.placeholderOnly.forEach(x=>R.phOnly.add(x)); } }
    // keyboard focus visibility (tab through 60 stops on the Board, light only)
    if(theme==='light'){ await go(p,'v-board'); await p.evaluate(()=>{ document.activeElement&&document.activeElement.blur(); window.scrollTo(0,0); });
      const st=()=>p.evaluate(()=>{ const e=document.activeElement; if(!e||e===document.body) return null; const c=getComputedStyle(e); return {k:(e.id?'#'+e.id:'')+'|'+e.tagName+'|'+(e.className||'')+'|'+(e.innerText||e.value||'').trim().slice(0,20), o:c.outlineStyle!=='none'&&parseFloat(c.outlineWidth)>0?c.outlineStyle+' '+c.outlineWidth+' '+c.outlineColor:'', s:c.boxShadow, b:c.borderColor, bg:c.backgroundColor}; });
      const seen=[]; let noRing=0, total=0, ex=[];
      for(let i=0;i<60;i++){ await p.keyboard.press('Tab'); const f=await st(); if(!f) continue; total++;
        const prev=seen[seen.length-1]; seen.push(f);
        if(!f.o){ // compare with the same element when it isn't focused
          const un=await p.evaluate(k=>{ const e=document.activeElement; const c=getComputedStyle(e); return null; },f.k);
          if(f.s==='none') { noRing++; if(ex.length<6) ex.push(f.k.split('|').filter(Boolean).join(' ').slice(0,60)); } } }
      R.focus={total,noRing,ex}; }
    await ctx.close(); }
  // phone: touch targets, reflow at 320px
  { const {ctx,p}=await open(b,devices['iPhone 13'],'light'); const small24=new Set(), small44={n:0,total:0};
    for(const v of TABS){ await go(p,v); await p.waitForTimeout(300);
      const r=await p.evaluate(()=>{ const out=[]; let n44=0,tot=0; for(const el of document.querySelectorAll('button,a[href],select,input:not([type=hidden]),summary,[role=button],label>input[type=checkbox]')){
          const c=getComputedStyle(el); if(c.display==='none'||c.visibility==='hidden'||el.offsetParent===null&&c.position!=='fixed') continue; if(el.closest('p')&&el.tagName==='A') continue;
          const r=el.getBoundingClientRect(); if(!r.width) continue; tot++; if(r.width<44||r.height<44) n44++;
          if(r.width<24||r.height<24) out.push((el.id?'#'+el.id:el.tagName.toLowerCase()+'.'+(el.className||'').toString().split(' ')[0])+' "'+((el.innerText||el.value||el.title||'').trim().slice(0,18))+'" '+Math.round(r.width)+'×'+Math.round(r.height)); }
        return {out,n44,tot}; });
      r.out.forEach(x=>small24.add(x)); small44.n+=r.n44; small44.total+=r.tot; }
    R.small24=[...small24]; R.small44=small44; await ctx.close(); }
  { const ctx=await b.newContext({viewport:{width:320,height:700}}); await ctx.addInitScript(seed); const p=await ctx.newPage();
    await p.route('**/*',r=>{const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); return r.abort();});
    await p.goto('http://app.test/'); await p.waitForTimeout(1000); R.reflow={};
    for(const v of TABS){ await go(p,v); await p.waitForTimeout(300); R.reflow[v.slice(2)]=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth); }
    // structure
    R.struct=await p.evaluate(()=>({lang:document.documentElement.lang, h1:document.querySelectorAll('h1').length, landmarks:['main','nav','header','footer'].map(t=>t+':'+document.querySelectorAll(t+',[role='+(t==='main'?'main':t==='nav'?'navigation':t==='header'?'banner':'contentinfo')+']').length).join(' '),
      tabRoles:document.querySelectorAll('.tab[role=tab]').length+'/'+document.querySelectorAll('.tab').length, tablist:!!document.querySelector('[role=tablist]'), ariaSelected:document.querySelectorAll('.tab[aria-selected]').length,
      live:document.querySelectorAll('[aria-live],[role=status],[role=alert]').length, headings:[...document.querySelectorAll('h1,h2,h3')].slice(0,6).map(h=>h.tagName+': '+h.innerText.trim().slice(0,30))}));
    await ctx.close(); }
  await b.close();
  const css=html.match(/<style>[\s\S]*?<\/style>/g).join('\n'); R.cssOutlineNone=(css.match(/outline\s*:\s*(none|0)\b/g)||[]).length; R.cssFocusVisible=(css.match(/:focus-visible/g)||[]).length; R.cssFocus=(css.match(/:focus\b/g)||[]).length;
  const ser=JSON.stringify(R,(k,v)=>v instanceof Set?[...v]:v,1); fs.writeFileSync(require('os').tmpdir()+'/a11y-report.json',ser);
  // summary
  const C=Object.entries(R.contrast).sort((a,b)=>a[1].ratio-b[1].ratio);
  console.log('CONTRAST failures: '+C.length+' distinct colour pairs'); C.slice(0,40).forEach(([k,x])=>console.log(`  ${x.ratio}:1 (needs ${x.need}) ×${x.n} ${x.dim?'[dimmed]':''} ${k}  "${x.text}"  [${[...x.tabs].join(',')}]`));
  console.log('PLACEHOLDER contrast <4.5: '+JSON.stringify(R.ph));
  console.log('NAMES: '+R.names.size); [...R.names].slice(0,30).forEach(x=>console.log('  '+x));
  console.log('PLACEHOLDER-ONLY inputs: '+R.phOnly.size); [...R.phOnly].slice(0,20).forEach(x=>console.log('  '+x));
  console.log('IMG no alt: '+R.alt.size); [...R.alt].slice(0,10).forEach(x=>console.log('  '+x));
  console.log('MOUSE-ONLY clickables: '+R.mouse.size); [...R.mouse].slice(0,15).forEach(x=>console.log('  '+x));
  console.log('FOCUS: '+JSON.stringify(R.focus)+' | css outline:none rules='+R.cssOutlineNone+' :focus-visible rules='+R.cssFocusVisible+' :focus rules='+R.cssFocus);
  console.log('TOUCH phone: <24px: '+R.small24.length+' | under 44px: '+R.small44.n+' of '+R.small44.total); R.small24.slice(0,25).forEach(x=>console.log('  '+x));
  console.log('REFLOW at 320px (extra width): '+JSON.stringify(R.reflow));
  console.log('STRUCTURE: '+JSON.stringify(R.struct));
})();
