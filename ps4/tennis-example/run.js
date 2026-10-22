// Runs the simulation from the command line, with the same parameters as the page.
//   node run.js --serveA 68 --serveB 62 --bestOf 5 --matches 20000
// Any parameter left out takes its default. Add --seed N to repeat a run exactly, and --json
// for machine-readable output.
const Tennis = require('./sim.js');

const args = process.argv.slice(2);
const params = Tennis.defaults();
let seed;
let json = false;
for (let i = 0; i < args.length; i++) {
  const name = args[i].replace(/^--/, '');
  if (name === 'json') {
    json = true;
  } else if (name === 'seed') {
    seed = Number(args[++i]);
  } else if (name in Tennis.PARAMETERS) {
    params[name] = Number(args[++i]);
  } else {
    console.error(`Unknown option ${args[i]}. Parameters: ${Object.keys(Tennis.PARAMETERS).join(', ')}`);
    process.exit(2);
  }
}

const problems = Tennis.validate(params);
if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(2);
}

const r = Tennis.simulate(params, seed);
if (json) {
  console.log(JSON.stringify({ params, results: r }, null, 2));
} else {
  const pct = (x) => `${(100 * x).toFixed(1)}%`;
  console.log(params);
  console.log(`A wins the match:            ${pct(r.matchWin.estimate)}  (95% interval ${pct(r.matchWin.low)} to ${pct(r.matchWin.high)})`);
  console.log(`A wins six matches in a row: ${pct(r.sixInARow.estimate)}  (95% interval ${pct(r.sixInARow.low)} to ${pct(r.sixInARow.high)})`);
  console.log(`A's share of points:         ${pct(r.pointShare.mean)} on average  (middle 80% of matches ${pct(r.pointShare.low)} to ${pct(r.pointShare.high)})`);
  console.log(`Sets ending in a tie-break:  ${pct(r.tiebreakSets.estimate)}  (95% interval ${pct(r.tiebreakSets.low)} to ${pct(r.tiebreakSets.high)})`);
  console.log(`Points in a match:           ${r.matchLength.mean.toFixed(0)} on average  (middle 80% of matches ${r.matchLength.low} to ${r.matchLength.high})`);
}
