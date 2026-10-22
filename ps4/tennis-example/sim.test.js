// Run with: node --test
const test = require('node:test');
const assert = require('node:assert');
const Tennis = require('./sim.js');

function params(overrides) {
  return { ...Tennis.defaults(), ...overrides };
}

function freshTally() {
  return { points: 0, pointsA: 0, sets: 0, tiebreaks: 0 };
}

test('the defaults are valid', () => {
  assert.deepStrictEqual(Tennis.validate(Tennis.defaults()), []);
});

test('out-of-range and malformed values are refused, not run', () => {
  assert.ok(Tennis.validate(params({ serveA: 0 })).length);
  assert.ok(Tennis.validate(params({ serveB: 100 })).length);
  assert.ok(Tennis.validate(params({ pressureA: 21 })).length);
  assert.ok(Tennis.validate(params({ bestOf: 4 })).length);
  assert.ok(Tennis.validate(params({ matches: 10.5 })).length);
  assert.ok(Tennis.validate(params({ serveA: NaN })).length);
  assert.throws(() => Tennis.simulate(params({ serveA: 0 })));
});

test('a point chance is held between 1% and 99%', () => {
  const p = params({ serveA: 99, serveB: 1, pressureA: 20 });
  assert.strictEqual(Tennis.pointChance(p, 'A', true), 0.99);
  assert.strictEqual(Tennis.pointChance(p, 'B', true), 0.01);
  assert.strictEqual(Tennis.pointChance(p, 'A', false), 0.99);
});

test('pressure helps A on both serves and does nothing on ordinary points', () => {
  const p = params({ serveA: 60, serveB: 60, pressureA: 10 });
  assert.strictEqual(Tennis.pointChance(p, 'A', true), 0.7);
  assert.strictEqual(Tennis.pointChance(p, 'B', true), 0.5);
  assert.strictEqual(Tennis.pointChance(p, 'B', false), 0.6);
});

test('a game is first to four points, ahead by two', () => {
  const random = Tennis.makeRandom(1);
  for (let i = 0; i < 2000; i++) {
    const tally = freshTally();
    Tennis.playGame(params({}), random, 'A', tally);
    const loser = tally.points - Math.max(tally.pointsA, tally.points - tally.pointsA);
    const winner = tally.points - loser;
    assert.ok(winner >= 4, `winner had ${winner}`);
    assert.ok(winner - loser >= 2, `${winner}-${loser}`);
    if (winner > 4) assert.strictEqual(winner - loser, 2, `${winner}-${loser} went on too long`);
  }
});

test('a tie-break is first to its target, ahead by two', () => {
  const random = Tennis.makeRandom(2);
  for (const target of [7, 10]) {
    for (let i = 0; i < 2000; i++) {
      const tally = freshTally();
      Tennis.playTiebreak(params({}), random, 'B', target, tally);
      const high = Math.max(tally.pointsA, tally.points - tally.pointsA);
      const low = tally.points - high;
      assert.ok(high >= target && high - low >= 2);
      if (high > target) assert.strictEqual(high - low, 2);
    }
  }
});

test('a server who never loses a point holds every game to love', () => {
  const tally = freshTally();
  const winner = Tennis.playGame(params({ serveA: 99 }), () => 0, 'A', tally);
  assert.strictEqual(winner, 'A');
  assert.strictEqual(tally.points, 4);
});

test('the same seed gives the same results', () => {
  const p = params({ matches: 200 });
  assert.deepStrictEqual(Tennis.simulate(p, 7), Tennis.simulate(p, 7));
});

test('equal players each win about half the matches', () => {
  const r = Tennis.simulate(params({ serveA: 64, serveB: 64, matches: 20000 }), 3);
  assert.ok(Math.abs(r.matchWin.estimate - 0.5) < 0.02, `A won ${r.matchWin.estimate}`);
  assert.ok(Math.abs(r.pointShare.mean - 0.5) < 0.01);
});

test('the better server wins more often in best of five than best of three', () => {
  const three = Tennis.simulate(params({ serveA: 66, serveB: 62, bestOf: 3, matches: 20000 }), 4);
  const five = Tennis.simulate(params({ serveA: 66, serveB: 62, bestOf: 5, matches: 20000 }), 4);
  assert.ok(five.matchWin.estimate > three.matchWin.estimate);
});

test('the extremes of every range finish without crashing', () => {
  for (const serveA of [1, 99]) {
    for (const serveB of [1, 99]) {
      for (const pressureA of [-20, 0, 20]) {
        const r = Tennis.simulate(params({ serveA, serveB, pressureA, bestOf: 5, matches: 10 }), 5);
        assert.ok(r.matchWin.estimate >= 0 && r.matchWin.estimate <= 1);
        assert.ok(Number.isFinite(r.matchLength.mean));
      }
    }
  }
});

test('two servers who almost never lose serve play a tie-break in nearly every set', () => {
  const r = Tennis.simulate(params({ serveA: 99, serveB: 99, matches: 200 }), 6);
  assert.ok(r.tiebreakSets.estimate > 0.9, `only ${r.tiebreakSets.estimate}`);
});
