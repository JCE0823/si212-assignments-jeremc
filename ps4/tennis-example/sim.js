// The tennis model. No page code here, so the page, the command line and the tests all run the
// same simulation. Loaded by index.html as a plain script, and by Node with require().
// Everything is inside one function so that the page sees only the name `Tennis`.
const Tennis = (() => {

  const PARAMETERS = {
    serveA:    { min: 1,   max: 99,    default: 64,   integer: false },
    serveB:    { min: 1,   max: 99,    default: 64,   integer: false },
    pressureA: { min: -20, max: 20,    default: 0,    integer: false },
    bestOf:    { min: 3,   max: 5,     default: 3,    integer: true, choices: [3, 5] },
    matches:   { min: 10,  max: 20000, default: 2000, integer: true },
  };

  // Every chance of winning a point is kept between 1% and 99%. Without that, two players who
  // always win their own serve could play a tie-break that never ends.
  const MIN_POINT_CHANCE = 0.01;
  const MAX_POINT_CHANCE = 0.99;

  function defaults() {
    const out = {};
    for (const [name, spec] of Object.entries(PARAMETERS)) out[name] = spec.default;
    return out;
  }

  // Returns a list of problems, empty when every parameter is a number in its range.
  function validate(params) {
    const problems = [];
    for (const [name, spec] of Object.entries(PARAMETERS)) {
      const value = params[name];
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        problems.push(`${name} must be a number`);
      } else if (spec.choices && !spec.choices.includes(value)) {
        problems.push(`${name} must be one of ${spec.choices.join(' or ')}`);
      } else if (value < spec.min || value > spec.max) {
        problems.push(`${name} must be between ${spec.min} and ${spec.max}`);
      } else if (spec.integer && !Number.isInteger(value)) {
        problems.push(`${name} must be a whole number`);
      }
    }
    return problems;
  }

  // A small seeded generator (mulberry32), so a run can be repeated exactly. Unseeded runs use
  // Math.random.
  function makeRandom(seed) {
    if (seed === undefined || seed === null) return Math.random;
    let state = seed >>> 0;
    return function () {
      state = (state + 0x6d2b79f5) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function clamp(x, lo, hi) {
    return Math.min(hi, Math.max(lo, x));
  }

  // The chance that the server wins this point. Players are 'A' and 'B'.
  function pointChance(params, server, isPressurePoint) {
    let percent = server === 'A' ? params.serveA : params.serveB;
    if (isPressurePoint) percent += server === 'A' ? params.pressureA : -params.pressureA;
    return clamp(percent / 100, MIN_POINT_CHANCE, MAX_POINT_CHANCE);
  }

  function other(player) {
    return player === 'A' ? 'B' : 'A';
  }

  // First to `target` points, ahead by two. A pressure point is one that can end it: someone is
  // one point from winning and ahead. `serverFor(i)` says who serves the i-th point.
  function playRace(params, random, target, serverFor, tally) {
    const score = { A: 0, B: 0 };
    for (let i = 0; ; i++) {
      const server = serverFor(i);
      const returner = other(server);
      const pressure =
        (score.A >= target - 1 && score.A > score.B) || (score.B >= target - 1 && score.B > score.A);
      const winner = random() < pointChance(params, server, pressure) ? server : returner;
      score[winner]++;
      tally.points++;
      if (winner === 'A') tally.pointsA++;
      if (Math.max(score.A, score.B) >= target && Math.abs(score.A - score.B) >= 2) {
        return score.A > score.B ? 'A' : 'B';
      }
    }
  }

  function playGame(params, random, server, tally) {
    return playRace(params, random, 4, () => server, tally);
  }

  // One point for the first server, then two each, alternating.
  function playTiebreak(params, random, firstServer, target, tally) {
    return playRace(params, random, target, (i) => (i % 4 === 0 || i % 4 === 3 ? firstServer : other(firstServer)), tally);
  }

  // Returns the set's winner and who serves the game after it. Serve alternates every game, and
  // the tie-break counts as one game for that.
  function playSet(params, random, firstServer, isDecidingSet, tally) {
    const games = { A: 0, B: 0 };
    let server = firstServer;
    for (;;) {
      if (games.A === 6 && games.B === 6) {
        tally.tiebreaks++;
        const winner = playTiebreak(params, random, server, isDecidingSet ? 10 : 7, tally);
        return { winner, nextServer: other(server) };
      }
      const winner = playGame(params, random, server, tally);
      games[winner]++;
      server = other(server);
      if (Math.max(games.A, games.B) >= 6 && Math.abs(games.A - games.B) >= 2) {
        return { winner, nextServer: server };
      }
    }
  }

  function playMatch(params, random) {
    const setsToWin = (params.bestOf + 1) / 2;
    const sets = { A: 0, B: 0 };
    const tally = { points: 0, pointsA: 0, sets: 0, tiebreaks: 0 };
    let server = random() < 0.5 ? 'A' : 'B';
    while (sets.A < setsToWin && sets.B < setsToWin) {
      const deciding = sets.A === setsToWin - 1 && sets.B === setsToWin - 1;
      const result = playSet(params, random, server, deciding, tally);
      sets[result.winner]++;
      tally.sets++;
      server = result.nextServer;
    }
    return { winner: sets.A > sets.B ? 'A' : 'B', ...tally };
  }

  // The value below which `fraction` of the sorted list falls.
  function percentile(sorted, fraction) {
    const index = Math.min(sorted.length - 1, Math.max(0, Math.round(fraction * (sorted.length - 1))));
    return sorted[index];
  }

  // Half the width of a 95% interval for a proportion estimated from n trials.
  function margin(proportion, n) {
    return 1.96 * Math.sqrt((proportion * (1 - proportion)) / n);
  }

  // Plays `matches` matches and summarises them. Every output is a proportion between 0 and 1
  // or a count of points.
  function simulate(params, seed) {
    const problems = validate(params);
    if (problems.length) throw new Error(problems.join('; '));
    const random = makeRandom(seed);

    let winsA = 0;
    let sets = 0;
    let tiebreaks = 0;
    const shares = [];
    const lengths = [];
    for (let m = 0; m < params.matches; m++) {
      const match = playMatch(params, random);
      if (match.winner === 'A') winsA++;
      sets += match.sets;
      tiebreaks += match.tiebreaks;
      shares.push(match.pointsA / match.points);
      lengths.push(match.points);
    }
    shares.sort((a, b) => a - b);
    lengths.sort((a, b) => a - b);

    const n = params.matches;
    const matchWin = winsA / n;
    const matchWinMargin = margin(matchWin, n);
    const tiebreakShare = tiebreaks / sets;
    const mean = (xs) => xs.reduce((s, x) => s + x, 0) / xs.length;

    return {
      matchWin: { estimate: matchWin, low: Math.max(0, matchWin - matchWinMargin), high: Math.min(1, matchWin + matchWinMargin) },
      sixInARow: {
        estimate: matchWin ** 6,
        low: Math.max(0, matchWin - matchWinMargin) ** 6,
        high: Math.min(1, matchWin + matchWinMargin) ** 6,
      },
      pointShare: { mean: mean(shares), low: percentile(shares, 0.1), high: percentile(shares, 0.9) },
      tiebreakSets: {
        estimate: tiebreakShare,
        low: Math.max(0, tiebreakShare - margin(tiebreakShare, sets)),
        high: Math.min(1, tiebreakShare + margin(tiebreakShare, sets)),
      },
      matchLength: { mean: mean(lengths), low: percentile(lengths, 0.1), high: percentile(lengths, 0.9) },
    };
  }

  return { PARAMETERS, defaults, validate, simulate, playMatch, playGame, playTiebreak, makeRandom, pointChance };
})();

if (typeof module !== 'undefined') module.exports = Tennis;
