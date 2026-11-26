// node tests/v539-swiftbar-test.js — v5.39 (owner 2026-11-26: "a Swiftbar of sorts, but i can see it all the time"): the menu bar plugin (no browser needed).
// --demo prints a menu bar line and a dropdown from fake numbers; the script has no sign-in in it, reads the Keychain, only calls the read-only status route, and has no way to place, stop or resume. Without Keychain items it says it is not set up (never crashes).
const fs=require('fs'), path=require('path'), {spawnSync}=require('child_process'); const L=require('./v527-jarvis-lib.js'); const {check}=L;
const f=path.join(__dirname,'..','tools','swiftbar','0xbeta.30s.py'); const src=fs.readFileSync(f,'utf8');
const PY=spawnSync('which',['python3'],{encoding:'utf8'}).stdout.trim()||'python3';
const run=(args,env)=>spawnSync(PY,[f].concat(args||[]),{encoding:'utf8',env:Object.assign({},process.env,env||{})});
const d=run(['--demo']); const lines=d.stdout.split('\n');
check('--demo runs and the first line is the menu bar text (dot, order count, money left)', d.status===0 && /^0xβ (🟢|🟠|🔴) \d+ · /.test(lines[0]) && /\$9\.00 left/.test(lines[0]), lines[0]);
check('the dropdown says the mode, armed, used of budget, and lists the order with 2.08 contracts (not 208)', /REAL money/.test(d.stdout) && /Armed for today/.test(d.stdout) && /\$1\.00 used of \$10\.00/.test(d.stdout) && /2\.08 contracts at up to 48\.0%/.test(d.stdout) && !/208 contracts/.test(d.stdout), d.stdout.slice(0,300));
check('it has links to the control page and the screener, and a refresh line', /href=https:\/\/props\.0xbeta\.dev\/control\.html/.test(d.stdout) && /refresh=true/.test(d.stdout), null);
const n=run([],{PATH:'/nonexistent'}); check('with no Keychain items it says it is not set up and does not crash', /0xβ \?/.test(n.stdout) && /Not set up yet/.test(n.stdout), n.stdout.slice(0,200)+n.stderr.slice(0,100));
check('the file holds no sign-in: it reads the Keychain by name, and only the read-only status route is called (no POST, no place/stop/resume)', /security.*find-generic-password/.test(src) && /\/autobet\/status/.test(src) && !/method\s*=\s*['"]POST['"]/i.test(src) && !/\/autobet\/(kill|arm)|\/autobet['"]/.test(src.replace(/\/autobet\/status/g,'')), null);
check('the README tells you to type the sign-in yourself in your own Terminal (nothing is passed through anyone)', /You type these, in your own Terminal/.test(fs.readFileSync(path.join(__dirname,'..','tools','swiftbar','README.md'),'utf8')), null);
const r=L.res(); console.log('\n'+r.pass+' passed, '+r.fail+' failed'); process.exit(r.fail?1:0);
