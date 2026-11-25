// node tools/menubar/render.js — turns status/status.json into status/status.png (the card the Mac menu-bar plugin shows) and status/title.txt (the words in the menu bar).
// Run by El Capataz at each step. The PNG is 2x with a 144 dpi mark, so the Mac shows it at 440 points wide, sharp.
const fs=require('fs'), path=require('path'), zlib=require('zlib'); const ROOT=path.join(__dirname,'..','..');
const j=JSON.parse(fs.readFileSync(path.join(ROOT,'status','status.json'),'utf8')), items=j.items||[];
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const frac=it=>+it.total>0?Math.max(0,Math.min(1,(+it.done||0)/+it.total)):(it.state==='done'?1:0);
const fill=it=>it.state==='done'?'#7fe0a4':it.state==='failed'?'#ff7b7b':'#b0b0f8';
const right=it=>+it.total>0?Math.round(frac(it)*100)+'% done':(it.state==='done'?'done':it.state==='failed'?'failed':it.state==='working'?'working':'waiting');
const rows=items.map(it=>`<div class="r"><div class="l"><b>${esc(it.name)}</b><span>${esc(right(it))}</span></div><div class="t"><i style="width:${(frac(it)*100).toFixed(1)}%;background:${fill(it)}"></i></div><div class="n">${(+it.total>0?esc((it.done||0)+' / '+it.total)+' · ':'')+esc(it.note||it.state)}</div></div>`).join('');
const html=`<!doctype html><meta charset="utf-8"><style>
body{margin:0;background:transparent}
.c{width:440px;box-sizing:border-box;background:#1c1c1e;color:#f2f2f2;border-radius:18px;padding:18px 22px 14px;font:13px/1.35 "DejaVu Sans Mono",Menlo,monospace}
h1{font-size:15px;margin:0 0 12px;color:#fff}.r{margin:0 0 13px}.l{display:flex;justify-content:space-between;gap:10px}.l b{font-size:14px}.l span{color:#cfcff8;white-space:nowrap}
.t{height:11px;background:#4f4f78;border-radius:6px;margin:5px 0 4px;overflow:hidden}.t i{display:block;height:100%;border-radius:6px}
.n{color:#9a9aa6;font-size:11.5px}.f{color:#77778a;font-size:11px;margin-top:4px}</style>
<div class="c" id="c"><h1>${esc(j.headline||'Builds')}</h1>${rows}<div class="f">Updated ${esc(j.updated||'unknown')}</div></div>`;
(async()=>{ const {chromium}=require('playwright'); const b=await chromium.launch(); const p=await b.newPage({viewport:{width:480,height:800},deviceScaleFactor:2});
  await p.setContent(html); const buf=await p.locator('#c').screenshot({omitBackground:true,type:'png'}); await b.close();
  // add a pHYs chunk (144 dpi = 5669 pixels per metre) so the Mac sizes the picture at half its pixels
  const crc=(()=>{ const T=new Int32Array(256).map((_,n)=>{ let c=n; for(let k=0;k<8;k++) c=c&1?0xEDB88320^(c>>>1):c>>>1; return c; }); return b=>{ let c=-1; for(const x of b) c=T[(c^x)&255]^(c>>>8); return (c^-1)>>>0; }; })();
  const data=Buffer.alloc(9); data.writeUInt32BE(5669,0); data.writeUInt32BE(5669,4); data[8]=1; const type=Buffer.from('pHYs'), len=Buffer.alloc(4); len.writeUInt32BE(9); const cr=Buffer.alloc(4); cr.writeUInt32BE(crc(Buffer.concat([type,data])));
  const at=8+4+4+13+4; const out=Buffer.concat([buf.subarray(0,at),len,type,data,cr,buf.subarray(at)]);
  fs.writeFileSync(path.join(ROOT,'status','status.png'),out);
  const run=items.find(i=>i.state==='working'&&+i.total>0), bad=items.some(i=>i.state==='failed'), all=items.length>0&&items.every(i=>i.state==='done');
  fs.writeFileSync(path.join(ROOT,'status','title.txt'),(bad?'⚠️ ':all?'✅ ':'🔨 ')+(run?(run.done||0)+'/'+run.total:(all?'done':'working'))+'\n');
  console.log('wrote status/status.png ('+out.length+' bytes) and status/title.txt'); })();
