const test = require('node:test');
const assert = require('node:assert');
const Z = require('./sim');

const p = (x = {}) => ({ ...Z.defaults(), ...x });

test('defaults are valid and match the parameter specs', () => {
  assert.deepStrictEqual(Z.defaults(), {
    storedMeals: 60,
    spoilageChance: 5,
    mealsLost: 3,
    replications: 2000,
  });
  assert.deepStrictEqual(Z.validate(Z.defaults()), []);
});

test('validation rejects non-numbers', () => {
  for (const value of ['60', NaN, Infinity, null]) {
    assert.notDeepStrictEqual(Z.validate(p({ storedMeals: value })), []);
  }
});

test('validation rejects fractional meal and replication values', () => {
  for (const key of ['storedMeals', 'mealsLost', 'replications']) {
    assert.notDeepStrictEqual(Z.validate(p({ [key]: p()[key] + 0.5 })), []);
  }
});

test('validation rejects every out-of-range value', () => {
  for (const [key, values] of Object.entries({
    storedMeals: [-1, 121],
    spoilageChance: [-1, 21],
    mealsLost: [0, 11],
    replications: [9, 20001],
  })) {
    for (const value of values) {
      assert.notDeepStrictEqual(Z.validate(p({ [key]: value })), [], `${key}=${value}`);
    }
  }
});

test('60 meals lasts 30 days', () => assert.deepStrictEqual(
  Z.runOne(p({ spoilageChance: 0 }), () => 0.99),
  { survived: true, daysSurvived: 30, mealsRemaining: 0 },
));

test('59 meals completes 29 days with 1 meal left', () => assert.deepStrictEqual(
  Z.runOne(p({ storedMeals: 59, spoilageChance: 0 }), () => 0.99),
  { survived: false, daysSurvived: 29, mealsRemaining: 1 },
));

test('spoilage loss is clamped at zero before checking the daily ration', () => {
  let calls = 0;
  const result = Z.runOne(p({ storedMeals: 2, spoilageChance: 20, mealsLost: 10 }), () => {
    calls++;
    return 0;
  });
  assert.deepStrictEqual(result, { survived: false, daysSurvived: 0, mealsRemaining: 0 });
  assert.strictEqual(calls, 1);
});

test('makeRandom repeats a seeded sequence', () => {
  const a = Z.makeRandom(42);
  const b = Z.makeRandom(42);
  assert.deepStrictEqual([a(), a(), a()], [b(), b(), b()]);
});

test('simulate repeats with one seed', () => assert.deepStrictEqual(
  Z.simulate(p({ replications: 200 }), 7),
  Z.simulate(p({ replications: 200 }), 7),
));

test('120 meals with no spoilage guarantees survival', () => {
  const result = Z.simulate(p({ storedMeals: 120, spoilageChance: 0 }), 3);
  assert.strictEqual(result.survival.estimate, 1);
  assert.ok(result.survival.low < 1 && result.survival.high === 1);
  assert.deepStrictEqual(result.daysSurvived, { mean: 30, low: 30, high: 30 });
  assert.deepStrictEqual(result.mealsRemaining, { mean: 60, low: 60, high: 60 });
});

test('no success is explicit', () => {
  const result = Z.simulate(p({ storedMeals: 0, replications: 10 }), 2);
  assert.equal(result.survival.estimate, 0);
  assert.ok(result.survival.low === 0 && result.survival.high > 0);
  assert.equal(result.mealsRemaining, null);
});

test('Wilson interval has expected bounds for ten identical outcomes', () => {
  const fail = Z.simulate(p({ storedMeals: 0, replications: 10 }), 2).survival;
  const pass = Z.simulate(p({ storedMeals: 120, spoilageChance: 0, replications: 10 }), 2).survival;
  assert.ok(Math.abs(fail.high - 0.27754) < 0.00001);
  assert.ok(Math.abs(pass.low - 0.72246) < 0.00001);
});

test('all endpoint combinations produce finite bounded summaries', () => {
  for (const storedMeals of [0, 120]) for (const spoilageChance of [0, 20])
    for (const mealsLost of [1, 10]) for (const replications of [10, 20000]) {
      const result = Z.simulate(p({ storedMeals, spoilageChance, mealsLost, replications }), 5);
      for (const [summary, center, max] of [
        [result.survival, 'estimate', 1], [result.daysSurvived, 'mean', 30],
        [result.mealsRemaining, 'mean', 60],
      ]) {
        if (summary === null) continue;
        for (const key of [center, 'low', 'high']) {
          assert.ok(Number.isFinite(summary[key]) && summary[key] >= 0 && summary[key] <= max);
        }
        assert.ok(summary.low <= summary.high);
      }
      assert.equal(result.mealsRemaining === null, result.survival.estimate === 0);
    }
});

test('20% spoilage with 10-meal losses lowers survival than no spoilage', () => {
  const baseline = Z.simulate(p({ storedMeals: 60, spoilageChance: 0 }), 11);
  const spoiled = Z.simulate(p({ storedMeals: 60, spoilageChance: 20, mealsLost: 10 }), 11);
  assert.ok(spoiled.survival.estimate < baseline.survival.estimate);
});

test('every summary range contains its estimate or mean', () => {
  const result = Z.simulate(p({ replications: 1000 }), 17);
  for (const [key, center] of [['survival', 'estimate'], ['daysSurvived', 'mean'], ['mealsRemaining', 'mean']]) {
    const summary = result[key];
    assert.ok(summary.low <= summary[center], `${key}.low <= ${center}`);
    assert.ok(summary[center] <= summary.high, `${key}.${center} <= high`);
  }
});
