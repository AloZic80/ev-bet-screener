// Practice-copy fixtures: a fake Sunday 2026-11-15, 12:00 PM CT (18:00Z). Everything here is invented.
const NOW = Date.parse('2026-11-15T18:00:00Z'), H = 3600e3, M = 60e3, DAY = '2026-11-15';
const iso = ms => new Date(ms).toISOString();
const at = (iso0) => Date.parse(iso0);
const am2p = a => a < 0 ? -a / (-a + 100) : 100 / (a + 100);
const p2am = p => p >= 0.5 ? String(Math.round(-100 * p / (1 - p))) : '+' + Math.round(100 * (1 - p) / p);

// ---- teams / games (ESPN shape) ------------------------------------------------------------
const TEAMS = {
  ATL: ['1', 'Atlanta', 'Falcons', 'a71930', '000000'], IND: ['11', 'Indianapolis', 'Colts', '003b75', 'ffffff'],
  DET: ['8', 'Detroit', 'Lions', '0076b6', 'b0b7bc'], CHI: ['3', 'Chicago', 'Bears', '0b162a', 'c83803'],
  BUF: ['2', 'Buffalo', 'Bills', '00338d', 'c60c30'], MIA: ['15', 'Miami', 'Dolphins', '008e97', 'fc4c02'],
  KC: ['12', 'Kansas City', 'Chiefs', 'e31837', 'ffb612'], DEN: ['7', 'Denver', 'Broncos', '0a2343', 'fc4c02'],
  SEA: ['26', 'Seattle', 'Seahawks', '002244', '69be28'], SF: ['25', 'San Francisco', '49ers', 'aa0000', 'b3995d'],
  BOS: ['2', 'Boston', 'Celtics', '008348', 'ffffff'], NY: ['18', 'New York', 'Knicks', '006bb6', 'f58426'],
  ORL: ['19', 'Orlando', 'Magic', '0077c0', 'c4ced4'], IND_: ['11', 'Indiana', 'Pacers', '002d62', 'fdbb30'],
  MIA_: ['14', 'Miami', 'Heat', '98002e', 'f9a01b'], CHA: ['30', 'Charlotte', 'Hornets', '1d1160', '00788c'],
  GS: ['9', 'Golden State', 'Warriors', '1d428a', 'ffc72c'], LAL: ['13', 'Los Angeles', 'Lakers', '552583', 'fdb927'],
  DAL: ['6', 'Dallas', 'Mavericks', '0064b1', '000000'], PHX: ['21', 'Phoenix', 'Suns', '1d1160', 'e56020'],
};
const T = (code, ha, nbaIndiana) => { const k = (code === 'IND' && nbaIndiana) ? 'IND_' : (code === 'MIA' && nbaIndiana) ? 'MIA_' : code; const t = TEAMS[k]; return { ha, id: t[0], abbr: code, name: t[2], loc: t[1], nick: t[2], logo: '', rec: '', color: t[3], alt: t[4] }; };
// g(id, sport, away, home, startISO, state, ...)
const GAMES = [
  { id: '401900101', sport: 'NFL', away: 'ATL', home: 'IND', start: '2026-11-15T14:30:00Z', state: 'post', detail: 'Final', score: [20, 27], tv: 'NFLN' },
  { id: '401900102', sport: 'NFL', away: 'DET', home: 'CHI', start: '2026-11-15T18:00:00Z', state: 'in', detail: '14:02 - 1st Quarter', period: 1, clock: '14:02', score: [0, 0], tv: 'FOX' },
  { id: '401900103', sport: 'NFL', away: 'KC', home: 'DEN', start: '2026-11-15T21:05:00Z', state: 'pre', detail: '3:05 PM CT', score: [0, 0], tv: 'CBS' },
  { id: '401900104', sport: 'NFL', away: 'BUF', home: 'MIA', start: '2026-11-15T21:25:00Z', state: 'pre', detail: '3:25 PM CT', score: [0, 0], tv: 'CBS' },
  { id: '401900105', sport: 'NFL', away: 'SEA', home: 'SF', start: '2026-11-16T01:20:00Z', state: 'pre', detail: '7:20 PM CT', score: [0, 0], tv: 'NBC' },
  { id: '401900201', sport: 'NBA', away: 'ORL', home: 'IND', start: '2026-11-15T15:00:00Z', state: 'post', detail: 'Final', score: [104, 112], tv: 'NBA TV' },
  { id: '401900202', sport: 'NBA', away: 'BOS', home: 'NY', start: '2026-11-15T17:00:00Z', state: 'in', detail: '5:41 - 2nd Quarter', period: 2, clock: '5:41', score: [48, 44], tv: 'ABC' },
  { id: '401900203', sport: 'NBA', away: 'MIA', home: 'CHA', start: '2026-11-15T23:00:00Z', state: 'pre', detail: '5:00 PM CT', score: [0, 0], tv: 'BSN' },
  { id: '401900204', sport: 'NBA', away: 'GS', home: 'LAL', start: '2026-11-16T00:30:00Z', state: 'pre', detail: '6:30 PM CT', score: [0, 0], tv: 'NBA TV' },
  { id: '401900205', sport: 'NBA', away: 'DAL', home: 'PHX', start: '2026-11-16T01:00:00Z', state: 'pre', detail: '7:00 PM CT', score: [0, 0], tv: 'ESPN' },
];
const GBY = {}; GAMES.forEach(g => { GBY[g.away + '@' + g.home] = g; });
const gameInfo = (away, home) => { const g = GBY[away + '@' + home]; const nba = g.sport === 'NBA';
  return { state: g.state, detail: g.detail, timeCT: '', eventId: g.id, startISO: g.start, teams: [T(away, 'away', nba), T(home, 'home', nba)], tv: g.tv }; };

function espnEvent(g) {
  const nba = g.sport === 'NBA', st = g.state;
  const comp = (code, ha, sc) => { const t = T(code, ha, nba); return { id: t.id, uid: 's:' + g.id + ':' + t.id, type: 'team', order: ha === 'home' ? 0 : 1, homeAway: ha, winner: st === 'post' ? sc > g.score[ha === 'home' ? 0 : 1] : undefined,
    team: { id: t.id, location: t.loc, name: t.nick, abbreviation: code, displayName: t.loc + ' ' + t.nick, shortDisplayName: t.nick, color: t.color, alternateColor: t.alt, logo: '' }, score: String(sc),
    records: [{ name: 'overall', type: 'total', summary: nba ? '7-4' : '6-3' }] }; };
  return { id: g.id, uid: 's:0~e:' + g.id, date: g.start.replace(/:00Z$/, 'Z'), name: TEAMS[g.away][1] + ' ' + TEAMS[g.away][2] + ' at ' + TEAMS[g.home][1] + ' ' + TEAMS[g.home][2], shortName: g.away + ' @ ' + g.home,
    season: { year: 2026, type: 2, slug: 'regular-season' }, week: nba ? undefined : { number: 10 },
    status: { clock: 0, displayClock: g.clock || '0:00', period: g.period || (st === 'post' ? (nba ? 4 : 4) : 0), type: { id: st === 'post' ? '3' : st === 'in' ? '2' : '1', name: st === 'post' ? 'STATUS_FINAL' : st === 'in' ? 'STATUS_IN_PROGRESS' : 'STATUS_SCHEDULED', state: st, completed: st === 'post', description: st === 'post' ? 'Final' : st === 'in' ? 'In Progress' : 'Scheduled', detail: g.detail, shortDetail: g.detail } },
    competitions: [{ id: g.id, uid: 's:0~e:' + g.id + '~c:' + g.id, date: g.start.replace(/:00Z$/, 'Z'), neutralSite: false, conferenceCompetition: false, playByPlayAvailable: st !== 'pre',
      competitors: [comp(g.home, 'home', g.score[1]), comp(g.away, 'away', g.score[0])], broadcasts: [{ market: 'national', names: [g.tv] }],
      status: { clock: 0, displayClock: g.clock || '0:00', period: g.period || 0, type: { id: '2', name: 'x', state: st, completed: st === 'post', description: g.detail, detail: g.detail, shortDetail: g.detail } } }],
    links: [{ rel: ['summary'], href: 'https://www.espn.com/' + (nba ? 'nba' : 'nfl') + '/game/_/gameId/' + g.id }] };
}
function scoreboard(sport) { const evs = GAMES.filter(g => g.sport === sport).map(espnEvent);
  return sport === 'NFL' ? { leagues: [{ abbreviation: 'NFL' }], season: { year: 2026, type: 2 }, week: { number: 10 }, events: evs } : { leagues: [{ abbreviation: 'NBA' }], season: { year: 2026, type: 2 }, day: { date: '2026-11-15' }, events: evs }; }

// ---- box scores (summary?event=) -----------------------------------------------------------
const NFLCATS = (rows) => [
  { name: 'passing', labels: ['C/ATT', 'YDS', 'AVG', 'TD', 'INT', 'SACKS', 'QBR', 'RTG'], athletes: rows.pass || [] },
  { name: 'rushing', labels: ['CAR', 'YDS', 'AVG', 'TD', 'LONG'], athletes: rows.rush || [] },
  { name: 'receiving', labels: ['REC', 'YDS', 'AVG', 'TD', 'LONG', 'TGTS'], athletes: rows.rec || [] }];
const ath = (name, stats) => ({ athlete: { id: String(Math.abs(name.split('').reduce((a, c) => a * 31 + c.charCodeAt(0), 7)) % 90000 + 1000), displayName: name }, stats });
const NBALABELS = ['MIN', 'PTS', 'FG', '3PT', 'FT', 'REB', 'AST', 'TO', 'STL', 'BLK', 'OREB', 'DREB', 'PF', '+/-'];
const nba = (name, min, pts, reb, ast) => ath(name, [String(min), String(pts), '7-15', '2-6', '4-5', String(reb), String(ast), '2', '1', '0', '1', String(reb - 1), '2', '+3']);
function summary(g) {
  const ev = espnEvent(g), st = ev.status.type; const base = { header: { id: g.id, competitions: [{ id: g.id, status: { type: st }, competitors: ev.competitions[0].competitors }] }, boxscore: { teams: [], players: [] } };
  const t = (code, ha) => ({ team: { id: T(code, ha, g.sport === 'NBA').id, abbreviation: code, displayName: TEAMS[code === 'IND' && g.sport === 'NBA' ? 'IND_' : code][1] } });
  if (g.id === '401900101') { // ATL @ IND final
    base.boxscore.players = [
      Object.assign(t('ATL', 'away'), { statistics: NFLCATS({ pass: [ath('Michael Penix Jr.', ['22/36', '241', '6.7', '1', '1', '2', '51.0', '84.1'])], rush: [ath('Bijan Robinson', ['17', '84', '4.9', '1', '19'])], rec: [ath('Drake London', ['7', '96', '13.7', '1', '31', '10']), ath('Darnell Mooney', ['4', '52', '13.0', '0', '22', '6'])] }) }),
      Object.assign(t('IND', 'home'), { statistics: NFLCATS({ pass: [ath('Daniel Jones', ['25/33', '287', '8.7', '2', '0', '1', '71.4', '115.7'])], rush: [ath('Jonathan Taylor', ['24', '131', '5.5', '1', '33'])], rec: [ath('Michael Pittman Jr.', ['6', '71', '11.8', '1', '27', '8']), ath('Josh Downs', ['8', '88', '11.0', '1', '25', '10'])] }) })];
  } else if (g.id === '401900102') { // DET @ CHI live
    base.boxscore.players = [
      Object.assign(t('DET', 'away'), { statistics: NFLCATS({ pass: [ath('Jared Goff', ['0/1', '0', '0.0', '0', '0', '0', '0.0', '39.6'])], rush: [ath('Jahmyr Gibbs', ['2', '11', '5.5', '0', '7'])], rec: [] }) }),
      Object.assign(t('CHI', 'home'), { statistics: NFLCATS({ pass: [], rush: [ath('D’Andre Swift', ['1', '3', '3.0', '0', '3'])], rec: [] }) })];
  } else if (g.id === '401900201') { // ORL @ IND final
    base.boxscore.players = [
      Object.assign(t('ORL', 'away'), { statistics: [{ name: 'starters', labels: NBALABELS, athletes: [nba('Paolo Banchero', 36, 27, 8, 5), nba('Franz Wagner', 34, 21, 5, 4)] }] }),
      Object.assign(t('IND', 'home'), { statistics: [{ name: 'starters', labels: NBALABELS, athletes: [nba('Tyrese Haliburton', 35, 19, 4, 12), nba('Pascal Siakam', 33, 24, 9, 3)] }] })];
  } else if (g.id === '401900202') { // BOS @ NY live
    base.boxscore.players = [
      Object.assign(t('BOS', 'away'), { statistics: [{ name: 'starters', labels: NBALABELS, athletes: [nba('Jayson Tatum', 17, 15, 4, 2), nba('Jaylen Brown', 16, 11, 2, 1)] }] }),
      Object.assign(t('NY', 'home'), { statistics: [{ name: 'starters', labels: NBALABELS, athletes: [nba('Jalen Brunson', 17, 14, 1, 5), nba('Karl-Anthony Towns', 16, 12, 7, 1)] }] })];
  }
  return base;
}

// ---- the board -----------------------------------------------------------------------------
const LOADED = iso(NOW - 2 * M);
let _k = 0;
// prop(name, team, 'AWAY@HOME', market, side, book, American price, model chance, market (sharp) chance, extra)
function prop(name, team, g, market, side, book, price, model, mkt, extra) {
  const [a, h] = g.split('@'), gi = gameInfo(a, h), sport = GBY[g].sport, off = am2p(price);
  const key = 'pr' + (++_k);
  return Object.assign({ name, team, game: a + ' @ ' + h, matchup: a + ' @ ' + h, side, sport, market, kind: 'prop', book, offeredRaw: price > 0 ? '+' + price : String(price), offeredProb: off, fairProb: model, fairRaw: p2am(model), mktProb: mkt,
    stars: model - mkt > 0.05 ? 5 : model - mkt > 0.03 ? 4 : 3, evModel: 'projection', projValue: parseFloat(market) + (side === 'O' ? 6.5 : -6.5) * (sport === 'NFL' ? 1 : 0.4), l15Hit: +(0.52 + (model - 0.5) * 0.8).toFixed(2), l15N: 15, seasonHit: +(0.5 + (model - 0.5) * 0.7).toFixed(2), seasonN: sport === 'NFL' ? 9 : 12,
    gameInfo: gi, src: 'api:' + sport + ':props', apiKey: key, loadedAt: LOADED }, extra || {});
}
// line(kind, name, team, game, market, side, book, price, model, mkt)
function line(kind, name, team, g, market, side, book, price, model, mkt, extra) {
  const [a, h] = g.split('@'), gi = gameInfo(a, h), sport = GBY[g].sport, key = 'gl' + (++_k);
  return Object.assign({ name, team, game: a + ' @ ' + h, matchup: a + ' @ ' + h, side, sport, market, kind, book, offeredRaw: price > 0 ? '+' + price : String(price), offeredProb: am2p(price), fairProb: model, fairRaw: p2am(model), mktProb: mkt, stars: null, evModel: 'market',
    gameInfo: gi, src: 'api:oddsapi:' + sport, apiKey: key, loadedAt: LOADED }, extra || {});
}
const BOARD_ROWS = () => { _k = 0; return [
  // NFL props (later today)
  prop('Patrick Mahomes', 'KC', 'KC@DEN', '262.5 Passing Yards', 'O', 'FanDuel', -115, 0.600, 0.545),
  prop('Travis Kelce', 'KC', 'KC@DEN', '5.5 Receptions', 'O', 'DraftKings', -105, 0.590, 0.545),
  prop('Bo Nix', 'DEN', 'KC@DEN', '1.5 Passing TDs', 'O', 'FanDuel', 130, 0.480, 0.450),
  prop('Courtland Sutton', 'DEN', 'KC@DEN', '52.5 Receiving Yards', 'U', 'DraftKings', -125, 0.570, 0.560),
  prop('Josh Allen', 'BUF', 'BUF@MIA', '244.5 Passing Yards', 'O', 'DraftKings', -115, 0.590, 0.545),   // already bet (see the log)
  prop('James Cook', 'BUF', 'BUF@MIA', '58.5 Rushing Yards', 'U', 'Novig', 104, 0.560, 0.525),
  prop('Jaylen Waddle', 'MIA', 'BUF@MIA', '58.5 Receiving Yards', 'O', 'Bovada', -110, 0.565, 0.535),
  prop('Jonnu Smith', 'MIA', 'BUF@MIA', 'Anytime TD', 'O', 'Bovada', 350, 0.250, 0.235),                // +350 long shot
  prop('Christian McCaffrey', 'SF', 'SEA@SF', '17.5 Rushing Attempts', 'O', 'Kalshi', 108, 0.530, 0.500),
  prop('Brock Purdy', 'SF', 'SEA@SF', '233.5 Passing Yards', 'U', 'FanDuel', -110, 0.520, 0.520),
  prop('Jaxon Smith-Njigba', 'SEA', 'SEA@SF', '69.5 Receiving Yards', 'O', 'Polymarket US', 92, 0.560, 0.530),   // near-miss
  prop('Kenneth Walker III', 'SEA', 'SEA@SF', 'Anytime TD', 'O', 'DraftKings', 105, 0.470, 0.480),
  prop('Isiah Pacheco', 'KC', 'KC@DEN', '10.5 Rushing Attempts', 'O', 'DraftKings', -200, 0.720, 0.680),
  prop('Zach Charbonnet', 'SEA', 'SEA@SF', '3.5 Receptions', 'U', 'FanDuel', -190, 0.700, 0.665),
  // NFL live game (already started)
  prop('Jahmyr Gibbs', 'DET', 'DET@CHI', '64.5 Rushing Yards', 'O', 'DraftKings', -110, 0.570, 0.540),   // pending bet in the log
  // NFL game lines
  line('total', 'KC @ DEN', null, 'KC@DEN', '44.5 Total', 'U', 'Bovada', -105, 0.545, 0.530),
  line('moneyline', 'Denver Broncos', 'DEN', 'KC@DEN', 'Moneyline', '', 'Novig', 138, 0.460, 0.445),
  line('spread', 'Seattle Seahawks', 'SEA', 'SEA@SF', '-2.5 Spread', '', 'DraftKings', -110, 0.530, 0.525),
  line('total', 'BUF @ MIA', null, 'BUF@MIA', '47.5 Total', 'O', 'FanDuel', -110, 0.555, 0.525),
  line('moneyline', 'San Francisco 49ers', 'SF', 'SEA@SF', 'Moneyline', '', 'Kalshi', -128, 0.575, 0.560),
  // NBA props
  prop('Stephen Curry', 'GS', 'GS@LAL', '27.5 Points', 'O', 'DraftKings', -115, 0.600, 0.550),
  prop('LeBron James', 'LAL', 'GS@LAL', '7.5 Assists', 'U', 'Novig', 100, 0.570, 0.530),
  prop('Anthony Davis', 'LAL', 'GS@LAL', '12.5 Rebounds', 'O', 'Polymarket US', 100, 0.550, 0.520),
  prop('Luka Doncic', 'DAL', 'DAL@PHX', '8.5 Assists', 'O', 'FanDuel', -120, 0.610, 0.560),
  prop('Devin Booker', 'PHX', 'DAL@PHX', '25.5 Points', 'U', 'DraftKings', -110, 0.525, 0.520),
  prop('LaMelo Ball', 'CHA', 'MIA@CHA', '3.5 Threes Made', 'O', 'Bovada', 125, 0.500, 0.460),
  prop('Bam Adebayo', 'MIA', 'MIA@CHA', '10.5 Rebounds', 'O', 'Kalshi', 112, 0.500, 0.470),
  prop('Kevin Durant', 'PHX', 'DAL@PHX', '4.5 Assists', 'O', 'FanDuel', 150, 0.410, 0.400),
  prop('Bam Adebayo', 'MIA', 'MIA@CHA', '7.5 Rebounds', 'O', 'FanDuel', -230, 0.750, 0.715),
  prop('LaMelo Ball', 'CHA', 'MIA@CHA', '1.5 Threes Made', 'O', 'Bovada', -300, 0.800, 0.770),
  prop('Luka Doncic', 'DAL', 'DAL@PHX', '4.5 Rebounds', 'O', 'DraftKings', -300, 0.820, 0.780),
  // NBA game lines
  line('spread', 'Miami Heat', 'MIA', 'MIA@CHA', '+4.5 Spread', '', 'FanDuel', -110, 0.550, 0.540),
  line('total', 'GS @ LAL', null, 'GS@LAL', '228.5 Total', 'O', 'Bovada', -110, 0.500, 0.500),
  line('moneyline', 'Los Angeles Lakers', 'LAL', 'GS@LAL', 'Moneyline', '', 'DraftKings', -150, 0.620, 0.610),
  line('moneyline', 'Phoenix Suns', 'PHX', 'DAL@PHX', 'Moneyline', '', 'Polymarket US', 118, 0.480, 0.462),
]; };

// ---- the bet log ---------------------------------------------------------------------------
let _b = 0;
function logBet(o) { const id = 'p' + (++_b), d = o.date, odds = o.odds, p = am2p(parseFloat(odds));
  const snapAt = o.snapAt || iso(Date.parse(d + 'T15:00:00Z') - 6 * H);
  return Object.assign({ id, key: o.key || [d, o.name, o.market, o.book, odds].join('|'), date: d, name: o.name, sport: o.sport, market: o.market, betnow: o.betnow || ('' + (o.side ? o.side + ' ' : '') + odds), book: o.book, game: o.game, odds, fair: '', gross: 0.06, net: 0.05, stake: o.stake, mkt: +(p - 0.01).toFixed(3),
    kind: o.kind || 'prop', closing: '', srcType: 'api', side: o.side || null, team: o.team || null, apiKey: 'old' + id, start: o.start || iso(Date.parse(d + 'T18:00:00Z')),
    snap: { at: snapAt, screener: '5.12', book: o.book, price: odds, model: +(p + 0.05).toFixed(3), market: +(p + 0.015).toFixed(3), act: +(p + 0.025).toFixed(3), actNet: 0.04, stars: 4, evModel: 'projection', said: { decision: 'BET', onList: true }, mode: 'safe' } }, o.extra || {}, { result: o.result }); }
const LOG_ROWS = () => { _b = 0; return [
  logBet({ date: '2026-11-08', name: 'Josh Allen', sport: 'NFL', market: '259.5 Passing Yards', side: 'O', book: 'DraftKings', odds: '-115', stake: 12, game: 'BUF @ NYJ', result: 'win' }),
  logBet({ date: '2026-11-08', name: 'Derrick Henry', sport: 'NFL', market: '88.5 Rushing Yards', side: 'U', book: 'FanDuel', odds: '-110', stake: 11, game: 'BAL @ CIN', result: 'loss' }),
  logBet({ date: '2026-11-09', name: 'Jayson Tatum', sport: 'NBA', market: '26.5 Points', side: 'O', book: 'Novig', odds: '+102', stake: 10, game: 'BOS @ CLE', result: 'win', extra: { fillBook: 'novig' } }),
  logBet({ date: '2026-11-10', name: 'Nikola Jokic', sport: 'NBA', market: '11.5 Rebounds', side: 'O', book: 'DraftKings', odds: '-120', stake: 12, game: 'DEN @ UTAH', result: 'win' }),
  logBet({ date: '2026-11-10', name: 'Victor Wembanyama', sport: 'NBA', market: '3.5 Blocks', side: 'O', book: 'Bovada', odds: '+105', stake: 8, game: 'SA @ HOU', result: 'loss' }),
  logBet({ date: '2026-11-11', name: 'Boston Celtics', sport: 'NBA', market: 'Moneyline', side: '', team: 'BOS', book: 'Kalshi', odds: '-135', stake: 20, game: 'BOS @ CHI', kind: 'moneyline', result: 'win' }),
  logBet({ date: '2026-11-12', name: 'Lamar Jackson', sport: 'NFL', market: '221.5 Passing Yards', side: 'U', book: 'FanDuel', odds: '-112', stake: 11, game: 'BAL @ PIT', result: 'win' }),
  logBet({ date: '2026-11-12', name: 'Tyreek Hill', sport: 'NFL', market: '64.5 Receiving Yards', side: 'O', book: 'DraftKings', odds: '-105', stake: 10, game: 'MIA @ LAR', result: 'loss' }),
  logBet({ date: '2026-11-13', name: 'Cade Cunningham', sport: 'NBA', market: '8.5 Assists', side: 'O', book: 'Polymarket US', odds: '+108', stake: 10, game: 'DET @ ATL', result: 'win' }),
  logBet({ date: '2026-11-14', name: 'Anthony Edwards', sport: 'NBA', market: '27.5 Points', side: 'O', book: 'FanDuel', odds: '-110', stake: 11, game: 'MIN @ POR', result: 'loss' }),
  logBet({ date: '2026-11-14', name: 'Over', sport: 'NBA', market: '224.5 Total', side: 'O', book: 'Bovada', odds: '-108', stake: 10, game: 'OKC @ LAC', kind: 'total', result: 'win' }),
  logBet({ date: '2026-11-15', name: 'Michael Pittman Jr.', sport: 'NFL', market: '54.5 Receiving Yards', side: 'O', book: 'DraftKings', odds: '-110', stake: 11, game: 'ATL @ IND', start: '2026-11-15T14:30:00Z', result: 'win' }),
  // one PrizePicks parlay, settled
  { id: 'pp1', key: 'pp1', kind: 'parlay', sport: 'PARLAY', book: 'PrizePicks', name: 'Parlay · 3 picks', market: '3-pick parlay', odds: '+500', stake: 10, date: '2026-11-13', dateSet: true,
    parlay: { picks: 3, legs: 'Caleb Williams O 211.5 pass yds; Bijan Robinson O 71.5 rush yds; Ja’Marr Chase O 74.5 rec yds', pays: { all: 50, m1: 0, m2: 0 }, hits: 2, payout: null }, result: 'loss', snap: { at: '2026-11-13T15:00:00Z', screener: '5.12' } },
  // pending
  logBet({ date: DAY, name: 'Josh Allen', sport: 'NFL', market: '244.5 Passing Yards', side: 'O', book: 'DraftKings', odds: '-115', stake: 12, game: 'BUF @ MIA', start: '2026-11-15T21:25:00Z', result: 'pending', snapAt: iso(NOW - 3 * H), key: DAY + '|Josh Allen|244.5 Passing Yards|DraftKings|-115' }),
  { id: 'pp2', key: 'pp2', kind: 'parlay', sport: 'PARLAY', book: 'PrizePicks', name: 'Parlay · 2 picks', market: '2-pick parlay', odds: '+200', stake: 5, date: DAY, dateSet: true,
    parlay: { picks: 2, legs: 'Jahmyr Gibbs O 64.5 rush yds; Stephen Curry O 27.5 pts', pays: { all: 15, m1: 0, m2: 0 }, hits: null, payout: null }, result: 'pending', snap: { at: iso(NOW - 2 * H), screener: '5.12' } },
  logBet({ date: DAY, name: 'Kansas City Chiefs', sport: 'NFL', market: 'Moneyline', side: '', team: 'KC', book: 'Kalshi', odds: '-122', stake: 15, game: 'KC @ DEN', kind: 'moneyline', start: '2026-11-15T21:05:00Z', result: 'pending', snapAt: iso(NOW - 4 * H), key: DAY + '|Kansas City Chiefs|Moneyline|Kalshi|-122',
    extra: { autoFrom: 'kalshi', fillBook: 'kalshi', fillRef: 'KXNFLGAME-26NOV15KCDEN-KC', fills: ['k-fill-1'], fillCost: 15 } }),
]; };

const CFG = { books: 'DraftKings, FanDuel, Kalshi, Novig, Polymarket US, Bovada', bank: '2000', cfgVer: 3.03 };

module.exports = { NOW, DAY, GAMES, GBY, scoreboard, summary, BOARD_ROWS, LOG_ROWS, CFG, iso, am2p, p2am };
