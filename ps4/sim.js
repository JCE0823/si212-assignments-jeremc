// Shared by the browser and Node: the only global exposed in a browser is ZombieShelter.
const ZombieShelter = (() => {
  const PARAMETERS = {
    storedMeals: { min: 0, max: 120, default: 60, integer: true },
    spoilageChance: { min: 0, max: 20, default: 5, integer: false },
    mealsLost: { min: 1, max: 10, default: 3, integer: true },
    replications: { min: 10, max: 20000, default: 2000, integer: true },
  };

  function defaults() {
    const out = {};
    for (const [name, spec] of Object.entries(PARAMETERS)) out[name] = spec.default;
    return out;
  }

  // Returns a list of problems, empty when every parameter is a number in its range.
  function validate(params) {
    const problems = [];
    for (const [name, spec] of Object.entries(PARAMETERS)) {
      const value = params?.[name];
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        problems.push(`${name} must be a number`);
      } else if (value < spec.min || value > spec.max) {
        problems.push(`${name} must be between ${spec.min} and ${spec.max}`);
      } else if (spec.integer && !Number.isInteger(value)) {
        problems.push(`${name} must be a whole number`);
      }
    }
    return problems;
  }

  // Mulberry32 seeded generator, copied from the course tennis example.
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

  function runOne(params, random) {
    const problems = validate(params);
    if (problems.length) throw new Error(problems.join('; '));
    if (typeof random !== 'function') throw new Error('random must be a function');

    let mealsRemaining = params.storedMeals;
    let daysSurvived = 0;
    while (daysSurvived < 30) {
      if (random() < params.spoilageChance / 100) {
        mealsRemaining = Math.max(0, mealsRemaining - params.mealsLost);
      }
      if (mealsRemaining < 2) {
        return { survived: false, daysSurvived, mealsRemaining };
      }
      mealsRemaining -= 2;
      daysSurvived++;
    }
    return { survived: true, daysSurvived, mealsRemaining };
  }

  function percentile(values, fraction) {
    const ordered = [...values].sort((a, b) => a - b);
    return ordered[Math.max(0, Math.ceil(fraction * ordered.length) - 1)];
  }

  function summarize(values) {
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    return { mean, low: percentile(values, 0.1), high: percentile(values, 0.9) };
  }

  function simulate(params, seed) {
    const problems = validate(params);
    if (problems.length) throw new Error(problems.join('; '));

    const random = makeRandom(seed);
    const results = Array.from({ length: params.replications }, () => runOne(params, random));
    const successes = results.filter(result => result.survived);
    const estimate = successes.length / params.replications;
    // Wilson score interval retains uncertainty even when every run has the same outcome.
    const n = params.replications;
    const z = 1.96;
    const denominator = 1 + z * z / n;
    const center = (estimate + z * z / (2 * n)) / denominator;
    const margin = z * Math.sqrt(estimate * (1 - estimate) / n + z * z / (4 * n * n)) / denominator;

    return {
      survival: {
        estimate,
        low: estimate === 0 ? 0 : Math.max(0, center - margin),
        high: estimate === 1 ? 1 : Math.min(1, center + margin),
      },
      daysSurvived: summarize(results.map(result => result.daysSurvived)),
      mealsRemaining: successes.length
        ? summarize(successes.map(result => result.mealsRemaining))
        : null,
    };
  }

  return { PARAMETERS, defaults, validate, makeRandom, runOne, simulate };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = ZombieShelter;
if (typeof globalThis !== 'undefined') globalThis.ZombieShelter = ZombieShelter;
