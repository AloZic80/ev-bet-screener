// node tests/pickem-books-test.js — v5.09 (owner, 11/15: "you dont even have PrizePicks"): the Bet log's "Add a parlay / Pick 6" book list
// keeps every old option in its old order and adds the pick-em apps at the end (PrizePicks, Underdog, Sleeper, Betr, ParlayPlay).
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
let pass = 0, fail = 0; const check = (name, ok, info) => { if (ok) { pass++; console.log('PASS ' + name); } else { fail++; console.log('FAIL ' + name + (info !== undefined ? '  → ' + JSON.stringify(info) : '')); } };
const m = html.match(/<select id="plBook">([\s\S]*?)<\/select>/);
const opts = m ? [...m[1].matchAll(/<option>([^<]*)<\/option>/g)].map(x => x[1]) : [];
check('the parlay form has its book list', opts.length > 0, opts);
check('the old options keep their order', JSON.stringify(opts.slice(0, 10)) === JSON.stringify(['DraftKings Pick 6','DraftKings','DraftKings Predictions','FanDuel Predicts','Novig','Kalshi','Polymarket','Underdog Predict','Other','Bovada']), opts.slice(0, 10));
check('PrizePicks, Underdog, Sleeper, Betr and ParlayPlay are added at the end', JSON.stringify(opts.slice(10)) === JSON.stringify(['PrizePicks','Underdog','Sleeper','Betr','ParlayPlay']), opts.slice(10));
check('each option appears once', new Set(opts).size === opts.length, opts);
console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
