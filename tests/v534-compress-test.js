// node tests/v534-compress-test.js [index.html] — v5.34 (owner 2026-11-25: "fix then"; the browser's space was 99% full): the bet log is stored compressed once it is big. Round trips on thousands of strings (empty, one byte, repeats, unicode,
// random, JSON of bets, a string long enough to clear the code table), the size drop on a log of real shape, the self-check (a value is packed only if it decodes back to itself), both formats are read, a small log stays plain
// (so nothing else changes), a bad packed value is never read as a log and is kept aside, and the page saves and reloads a big log without losing a bet. No page errors.
const fs=require('fs'), path=require('path'); const L=require('./v527-jarvis-lib.js'); const {chromium,check,open,ev,safe}=L;
const html=fs.readFileSync(process.argv[2]||path.join(__dirname,'..','index.html'),'utf8');
const blk=html.slice(html.indexOf('/* LZ-BEGIN'), html.indexOf('/* LZ-END */'));
const store={}; const localStorage={getItem:(k)=>Object.prototype.hasOwnProperty.call(store,k)?store[k]:null, setItem:(k,v)=>{ store[k]=String(v); }};
const api=new Function('localStorage', blk+'; return {lzEnc, lzDec, lsPack, lsPlain};')(localStorage); const {lzEnc,lzDec,lsPack,lsPlain}=api;
let seed=12345; const rnd=()=>{ seed=(seed*1103515245+12345)&0x7fffffff; return seed/0x7fffffff; };
const rt=(s)=>{ try{ return lzDec(lzEnc(s))===s; }catch(e){ return false; } };
const bet=(i)=>({id:'b'+i, name:'Player '+(i%97)+' Over '+(i%9)+'.5 '+['Shots','Points','Rebounds','Yards'][i%4], book:['Novig','Kalshi','DraftKings','FanDuel'][i%4], odds:-110+(i%60), stake:1+(i%7)*0.5, result:['won','lost','open','void'][i%4], at:'2026-11-'+String(1+i%28).padStart(2,'0')+'T1'+(i%10)+':'+String(i%60).padStart(2,'0')+':00Z',
  snap:{fair:0.5+(i%40)/100, model:0.52+(i%30)/100, market:0.49+(i%35)/100, ev:(i%20)/100, flags:['ok','fresh','novig'], note:'La Contadora: the conservative chance is '+(40+i%30)+'% at this price, sized to the minimum.'}});
(async()=>{
  const fixed=['', 'a', 'ab', 'aaaaaaaaaaaaaaaaaaaaaaaa', 'abababababababababab', 'é', '日本語のテキスト', '😀😀😀 mixed 😀', 'a'.repeat(100000), '{"a":1}'.repeat(50000), '\u0000\u0001\u007f', 'x\ny\r\nz\t'];
  check('round trip: empty, one character, repeats, accents, Japanese, emoji, a 100,000 repeat, control characters', fixed.every(rt), fixed.filter((x)=>!rt(x)).map((x)=>x.slice(0,10)));
  let bad=0; for(let i=0;i<400;i++){ let s=''; const n=Math.floor(rnd()*3000); for(let j=0;j<n;j++) s+=String.fromCharCode(32+Math.floor(rnd()*(rnd()<0.1?60000:90))); if(!/[\ud800-\udfff]/.test(s) && !rt(s)) bad++; }
  check('round trip: 400 random strings of random length (some with wide characters)', bad===0, bad);
  const big=JSON.stringify(Array.from({length:3000},(_,i)=>bet(i))); const z=lzEnc(big);
  check('round trip: a log of 3,000 bets', lzDec(z)===big, [big.length, z.length]);
  check('a log of real shape shrinks to under a third (so 99% full becomes about a third)', z.length<big.length/3, [big.length, z.length, (big.length/z.length).toFixed(1)+'x']);
  check('every output character is a valid character below U+D800 (safe to store)', [...z].every((c)=>c.charCodeAt(0)<0xD800), null);
  const long=JSON.stringify(Array.from({length:30000},(_,i)=>bet(i*7919))); check('a string long enough to clear the code table many times still round trips', lzDec(lzEnc(long))===long, long.length);
  check('a small value stays plain (nothing else changes: tests, small logs)', lsPack(JSON.stringify([bet(1)]))===JSON.stringify([bet(1)]), null);
  const packed=lsPack(big.repeat(1)+' '.repeat(0)); const bigEnough=JSON.stringify(Array.from({length:2500},(_,i)=>bet(i)));
  const pk=lsPack(bigEnough); check('a big log is packed ("z1:") and reads back exactly', pk.slice(0,3)==='z1:' && pk.length<bigEnough.length/2 && (store['k']=pk, lsPlain('k')===bigEnough), [bigEnough.length, pk.length]);
  store['plain']=bigEnough; check('the old plain format is still read', lsPlain('plain')===bigEnough, null);
  store['bad']='z1:'+String.fromCharCode(5000,5001,99999>>4); let threw=false; try{ lsPlain('bad'); }catch(e){ threw=true; } check('a damaged packed value is refused (an error), never read as a log', threw, null);
  const orig=lzEnc; check('the self-check: the packed text decodes to the original (never a silently different log)', lzDec(pk.slice(3))===bigEnough, null);

  const b=await chromium.launch(); const X=await open(b,1280);
  await safe('in the page', async()=>{
    const r=await ev(X.p,(arr)=>{ const n0=logged.length; logged=arr; const ok=lsSafeSet('mbev.log', JSON.stringify(logged)); const raw=localStorage.getItem('mbev.log'); const sizeRaw=raw.length; logged=[]; loadLog(); return {ok, z:raw.slice(0,3), sizeRaw, back:logged.length, same:JSON.stringify(logged)===JSON.stringify(arr)}; }, Array.from({length:2500},(_,i)=>bet(i)));
    check('the page saves a big log compressed ("z1:"), reads it back, and every bet is there and identical', r.ok && r.z==='z1:' && r.back===2500 && r.same, r);
    check('the compressed copy is under 40% of the plain size', r.sizeRaw<JSON.stringify(Array.from({length:2500},(_,i)=>bet(i))).length*0.4, r.sizeRaw);
    const s2=await ev(X.p,()=>{ saveLog(); const a=localStorage.getItem('mbev.log').slice(0,3); window._logSaveBad; return {a, bad:window._logSaveBad===true}; });
    check('saveLog on a big log stays compressed and is not marked as a failed save', s2.a==='z1:' && s2.bad===false, s2);
    const s3=await ev(X.p,()=>{ logged=logged.slice(0,5); saveLog(); return {a:localStorage.getItem('mbev.log').slice(0,3), n:JSON.parse(localStorage.getItem('mbev.log')).length}; });
    check('a small log is saved plain again (JSON text), so other tools can read it', s3.a==='[{"' && s3.n===5, s3);
    const s4=await ev(X.p,()=>{ localStorage.setItem('mbev.log','z1:'+String.fromCharCode(5000,5001)); loadLog(); return {n:logged.length, kept:(localStorage.getItem('mbev.log.unreadable')||'').slice(0,3)}; });
    check('an unreadable packed log is kept aside (mbev.log.unreadable) before anything can overwrite it', s4.kept==='z1:' && s4.n===0, s4);
    const s6=await X.p.evaluate((arr)=>{ localStorage.setItem('mbev.log', JSON.stringify(arr)); return {before:localStorage.getItem('mbev.log').length}; }, Array.from({length:2500},(_,i)=>bet(i)));
    await X.p.reload(); await X.p.waitForTimeout(1200);
    const s7=await ev(X.p,()=>({a:localStorage.getItem('mbev.log').slice(0,3), n:logged.length, bad:window._logSaveBad===true}));
    check('a big PLAIN log is packed once when the page opens, and every bet is still there', s6.before>400000 && s7.a==='z1:' && s7.n===2500 && !s7.bad, [s6, s7]);
    const s5=await ev(X.p,(arr)=>{ logged=arr; saveLog(); const q=storageUseInfo(); return {pct:q.pct}; }, Array.from({length:6000},(_,i)=>bet(i)));
    check('a log of 6,000 bets uses a small share of the browser space', s5.pct<30, s5);
  });
  check('no page errors', X.errs.length===0, X.errs.slice(0,3));
  await b.close(); const r=L.res(); console.log('\n'+r.pass+' passed, '+r.fail+' failed'); process.exit(r.fail?1:0); })();
