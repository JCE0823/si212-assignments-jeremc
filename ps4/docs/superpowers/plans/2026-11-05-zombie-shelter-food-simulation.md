# Zombie Shelter Food Simulation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a browser simulation estimating whether one person survives 30 days on stored meals when random spoilage makes food unusable.

**Architecture:** A standalone `ZombieFood` module serves both the browser and Node tests. The page validates four inputs, runs independent replications, and renders three summaries. The README documents the same model and evidence.

**Tech Stack:** Plain HTML and JavaScript, Node `node:test`, no dependencies.

**Spec:** `docs/superpowers/specs/2026-11-05-zombie-shelter-food-simulation-design.md`

## Global Constraints

- One survivor; 30 days; two meals per completed day.
- Only stored food; spoilage occurs before eating and food never goes below zero.
- Ranges: meals 0–120, spoilage 0%–20%, loss 1–10, runs 10–20,000.
- Open `index.html` directly; preserve all six README headings; never change `tennis-example/`.

---

### Task 1: Validated single-run model

**Files:** Create `ps4/package.json`, `ps4/sim.js`, `ps4/sim.test.js`.

**Interfaces:** Export `PARAMETERS`, `defaults()`, `validate(params)`, `makeRandom(seed)`, and `runOne(params, random)`. A run returns `{survived, daysSurvived, mealsRemaining}`.

- [ ] **Step 1: Write failing tests**

Use Node's test runner. Test valid defaults; rejection of non-numbers, non-whole meal/run values, and every out-of-range value; 60 meals/no spoilage succeeds with 30 days and 0 left; 59 meals completes 29 days with 1 left; a forced spoilage event on 2 meals loses 10 but clamps at 0 and completes 0 days.

```js
const test=require('node:test'), assert=require('node:assert'), Z=require('./sim');
const p=(x={})=>({...Z.defaults(),...x});
test('60 meals lasts',()=>assert.deepStrictEqual(
  Z.runOne(p({spoilageChance:0}),()=>.99),
  {survived:true,daysSurvived:30,mealsRemaining:0}));
test('59 meals does not',()=>assert.deepStrictEqual(
  Z.runOne(p({storedMeals:59,spoilageChance:0}),()=>.99),
  {survived:false,daysSurvived:29,mealsRemaining:1}));
```

- [ ] **Step 2: Verify red**

Run `cd ps4; npm test`. Expected: FAIL because `sim.js` is absent.

- [ ] **Step 3: Implement minimally**

Define parameter specs: `storedMeals {0,120,60,integer}`, `spoilageChance {0,20,5}`, `mealsLost {1,10,3,integer}`, `replications {10,20000,2000,integer}`. Copy seeded Mulberry32 from the example. Each day: maybe spoil, clamp, fail if fewer than 2, otherwise consume 2 and increment days. Export for browser and CommonJS.

- [ ] **Step 4: Verify green**

Run `cd ps4; npm test`. Expected: all Task 1 tests PASS.

- [ ] **Step 5: Commit**

`git add ps4/package.json ps4/sim.js ps4/sim.test.js; git commit -m "feat(ps4): model stored food and spoilage"`

### Task 2: Replication summaries

**Files:** Modify `ps4/sim.js`, `ps4/sim.test.js`.

**Interfaces:** Add `simulate(params, seed)` returning `survival:{estimate,low,high}`, `daysSurvived:{mean,low,high}`, and `mealsRemaining:{mean,low,high}|null`.

- [ ] **Step 1: Write failing tests**

Test repeatability with one seed; guaranteed survival for 120 meals/no spoilage; null remaining-meals summary for zero successes; lower survival under 20%/10-meal spoilage than 0% spoilage; and nested checks of every range endpoint.

```js
test('no success is explicit',()=>{
 const r=Z.simulate(p({storedMeals:0,replications:10}),2);
 assert.equal(r.survival.estimate,0); assert.equal(r.mealsRemaining,null);
});
test('seed repeats',()=>assert.deepStrictEqual(
 Z.simulate(p({replications:200}),7),Z.simulate(p({replications:200}),7)));
```

- [ ] **Step 2: Verify red**

Run `cd ps4; npm test`. Expected: FAIL because `simulate` is absent.

- [ ] **Step 3: Implement minimally**

Validate first and run exactly N trials. Use mean and nearest-ranked 10th/90th percentiles. The survival 95% margin is `1.96*Math.sqrt((p*(1-p))/n)`, clamped to 0–1. Summarize remaining meals only among successes; return null if none.

- [ ] **Step 4: Verify green**

Run `cd ps4; npm test`. Expected: all model tests PASS.

- [ ] **Step 5: Commit**

`git add ps4/sim.js ps4/sim.test.js; git commit -m "feat(ps4): summarize repeated survival runs"`

### Task 3: Browser page

**Files:** Create `ps4/index.html`.

**Interfaces:** Consume the four public model functions and produce four inputs plus three result rows.

- [ ] **Step 1: Build the plain page**

Follow the example's layout. Input IDs exactly match model keys, and min/max/step match their specs. Include `<div id="output" aria-live="polite">`; load `sim.js` before page code.

- [ ] **Step 2: Wire behavior**

Set defaults. On submit, turn blanks into `NaN`, render validation problems, show “Running…”, then run after 20 ms. Render survival percent plus 95% interval, mean days plus middle 80%, and successful runs' mean meals plus middle 80% or “No successful runs / Not applicable.” Show run count.

- [ ] **Step 3: Verify page and tests**

Open `index.html`; check defaults, normal output, blank-input error, and zero-success output. Run `cd ps4; npm test`; expect PASS.

- [ ] **Step 4: Commit**

`git add ps4/index.html; git commit -m "feat(ps4): add zombie shelter simulation page"`

### Task 4: README and final evidence

**Files:** Modify `ps4/README.md`.

**Interfaces:** Produce all six required sections and tables matching the page.

- [ ] **Step 1: Generate evidence**

Run fixed-seed, 20,000-replication scenarios at 60, 70, and 80 starting meals using:

`node -e "const Z=require('./sim'); console.log(Z.simulate({...Z.defaults(),storedMeals:70,replications:20000},12))"`

Repeat with 60/seed 11 and 80/seed 13; record exact output.

- [ ] **Step 2: Complete README**

Keep headings in order. Describe the exact daily sequence and exclusions. Tables must list the four inputs and three outputs. Suspicious run: 60 meals, 0% spoilage, 3 lost, 20,000 runs must yield 100% survival, 30 days, 0 meals. Answer in the student's words using all three evidence runs.

- [ ] **Step 3: Final verification**

Run tests. In the page, run each parameter at both endpoints one at a time. Confirm no crash and table labels match README. Run `rg -n '^## ' ps4/README.md` and `git status --short`; expect six headings in order and only intended PS4 changes.

- [ ] **Step 4: Commit**

`git add ps4/README.md; git commit -m "docs(ps4): explain zombie food simulation results"`

