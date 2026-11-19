import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs, {
  copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync,
} from 'node:fs';
import { syncBuiltinESMExports } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { saveReview, writeShortlist } from './tracker.mjs';

function writeJson(path, record) {
  writeFileSync(path, JSON.stringify(record, null, 2) + '\n');
}

function addExample(root, id, overrides = {}) {
  const example = join(root, 'examples', id);
  const inputPath = join(example, 'input.json');
  const reviewPath = join(example, 'review.json');
  const outputPath = join(example, 'output.json');
  const input = {
    schema_version: 1,
    id,
    title: 'Test Internship',
    company: 'Test Employer',
    url: 'https://example.com/internship',
    captured_on: '2026-11-18',
    capture_method: 'Partial source summary',
    text: 'Python required. Internship starts June 2027.',
    ...overrides.input,
  };
  const review = {
    schema_version: 1,
    verdict: 'explore',
    eligibility: 'unverified',
    rationale: 'The role is relevant to software exploration.',
    requirements: [{ text: 'Python experience', evidence: 'Python required' }],
    dates: [{
      kind: 'program_start', value: 'June 2027', evidence: 'Internship starts June 2027',
    }],
    missing_fields: ['application_deadline'],
    unknowns: ['Application deadline unknown'],
    apply_url: input.url,
    ...overrides.review,
  };
  mkdirSync(example, { recursive: true });
  writeJson(inputPath, input);
  writeJson(reviewPath, review);
  return { input, review, inputPath, reviewPath, outputPath };
}

function fixture(t, overrides) {
  const root = mkdtempSync(join(tmpdir(), 'ps5-tracker-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const criteriaPath = join(root, 'criteria.json');
  writeJson(criteriaPath, {
    schema_version: 1,
    purpose: 'Explore software internships',
    preference_status: 'Exploration defaults',
    confirmed_qualifications: {},
    eligibility_policy: 'unverified',
  });
  const reportPath = join(root, 'data', 'shortlist.md');
  return { root, criteriaPath, reportPath, ...addExample(root, 'test-role', overrides) };
}

function hashFile(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

test('stores evidence with byte hashes, source metadata and actual processing time', (t) => {
  const { root, input, inputPath, criteriaPath, review, outputPath, reportPath } = fixture(t);
  const before = Date.now();
  const { status, output } = saveReview(root, 'test-role');
  assert.equal(status, 'saved');
  const processedAt = Date.parse(output.processed_at);
  assert.ok(processedAt >= before && processedAt <= Date.now());
  assert.equal(new Date(processedAt).toISOString(), output.processed_at);
  assert.deepEqual(output, {
    schema_version: 1,
    id: input.id,
    title: input.title,
    company: input.company,
    source_url: input.url,
    captured_on: input.captured_on,
    input_sha256: hashFile(inputPath),
    criteria_sha256: hashFile(criteriaPath),
    processed_at: output.processed_at,
    human_review: 'pending',
    review,
  });
  assert.deepEqual(JSON.parse(readFileSync(outputPath, 'utf8')), output);
  assert.match(readFileSync(reportPath, 'utf8'), /Test Employer/);
});

test('validates URLs without URL.parse for Node 22.0 compatibility', (t) => {
  const { root } = fixture(t);
  const parse = Object.getOwnPropertyDescriptor(URL, 'parse');
  Reflect.deleteProperty(URL, 'parse');
  try {
    assert.equal(saveReview(root, 'test-role').status, 'saved');
    assert.match(writeShortlist(root), /https:\/\/example\.com\/internship/);
  } finally {
    if (parse) Object.defineProperty(URL, 'parse', parse);
  }
});

test('identical replay preserves original evidence bytes', (t) => {
  const { root, outputPath, reviewPath, review } = fixture(t);
  assert.equal(saveReview(root, 'test-role').status, 'saved');
  const first = readFileSync(outputPath);
  assert.equal(saveReview(root, 'test-role').status, 'unchanged');
  writeJson(reviewPath, {
    apply_url: review.apply_url,
    ...review,
    requirements: [{ evidence: review.requirements[0].evidence, text: review.requirements[0].text }],
  });
  assert.equal(saveReview(root, 'test-role').status, 'unchanged');
  assert.deepEqual(readFileSync(outputPath), first);
});

test('a changed rationale cannot replace saved evidence', (t) => {
  const { root, outputPath, reviewPath, review } = fixture(t);
  saveReview(root, 'test-role');
  const first = readFileSync(outputPath);
  writeJson(reviewPath, { ...review, rationale: 'Different reason supported by the source.' });
  assert.throws(() => saveReview(root, 'test-role'), /already|different/i);
  assert.deepEqual(readFileSync(outputPath), first);
});

test('a changed criteria hash conflicts with saved evidence', (t) => {
  const { root, outputPath, criteriaPath } = fixture(t);
  saveReview(root, 'test-role');
  const first = readFileSync(outputPath);
  writeFileSync(criteriaPath, '\n', { flag: 'a' });
  assert.throws(() => saveReview(root, 'test-role'), /already|different/i);
  assert.deepEqual(readFileSync(outputPath), first);
});

const invalidCases = [
  ['requirement evidence absent from source', {
    review: { requirements: [{ text: 'Python experience', evidence: 'not in input' }] },
  }, /evidence/i],
  ['date value absent from evidence', {
    review: { dates: [{
      kind: 'program_start', value: 'July 2027', evidence: 'Internship starts June 2027',
    }] },
  }, /date.*value/i],
  ['eligibility claim', { review: { eligibility: 'qualified' } }, /eligibility/i],
  ['mismatching input ID', { input: { id: 'different-role' } }, /id/i],
  ['nonexistent calendar date', { input: { captured_on: '2027-02-29' } }, /captured_on/i],
  ['invalid capture date syntax', { input: { captured_on: '2027-2-09' } }, /captured_on/i],
  ['insecure source URL', { input: { url: 'http://example.com/internship' } }, /https/i],
  ['malformed source URL', { input: { url: 'https:/example.com/internship' } }, /https/i],
  ['different apply URL', { review: { apply_url: 'https://example.com/other' } }, /apply_url/i],
  ['unknown input schema version', { input: { schema_version: 2 } }, /schema_version/i],
  ['unknown draft schema version', { review: { schema_version: 2 } }, /schema_version/i],
  ['empty capture text', { input: { text: '   ' } }, /text/i],
  ['empty rationale', { review: { rationale: '  ' } }, /rationale/i],
  ['one-character rationale', { review: { rationale: 'x' } }, /rationale/i],
  ['placeholder rationale', { review: { rationale: 'TODO write this rationale later' } }, /rationale/i],
  ['omitted missing_fields even with explanatory notes', {
    review: { missing_fields: undefined },
  }, /missing_fields.*array/i],
  ['non-array missing_fields', {
    review: { missing_fields: 'application_deadline' },
  }, /missing_fields.*array/i],
  ['omitted deadline marker despite a note about the deadline', {
    review: { missing_fields: [], unknowns: ['Application deadline is confirmed, location unknown'] },
  }, /missing_fields.*application_deadline/i],
  ['omitted requirements marker when requirements are empty', {
    review: { requirements: [] },
  }, /missing_fields.*requirements/i],
  ['omitted dates marker when dates are empty', {
    review: { dates: [] },
  }, /missing_fields.*dates/i],
  ['extra missing_fields marker when requirements were extracted', {
    review: { missing_fields: ['application_deadline', 'requirements'] },
  }, /missing_fields/i],
  ['duplicate missing_fields markers', {
    review: { missing_fields: ['application_deadline', 'application_deadline'] },
  }, /missing_fields.*duplicate/i],
  ['unrecognized missing_fields marker', {
    review: { missing_fields: ['application_deadline', 'location'] },
  }, /missing_fields.*location/i],
  ['missing notes when missing_fields is nonempty', {
    review: { unknowns: [] },
  }, /unknowns/i],
  ['blank explanatory note when missing_fields is nonempty', {
    review: { unknowns: ['  '] },
  }, /unknowns/i],
];

for (const [name, overrides, error] of invalidCases) {
  test(`rejects ${name} without creating output`, (t) => {
    const { root, outputPath } = fixture(t, overrides);
    assert.throws(() => saveReview(root, 'test-role'), error);
    assert.equal(existsSync(outputPath), false);
  });
}

test('rejects a path traversal ID before using it', (t) => {
  const { root, outputPath } = fixture(t);
  assert.throws(() => saveReview(root, '../other'), /id/i);
  assert.equal(existsSync(outputPath), false);
  assert.equal(existsSync(join(root, 'other', 'output.json')), false);
});

test('accepts exact missing_fields and explanations in varied wording', (t) => {
  const { root } = fixture(t, {
    input: { text: 'Summer internship with the software group.' },
    review: {
      requirements: [],
      dates: [],
      missing_fields: ['dates', 'requirements', 'application_deadline'],
      unknowns: [
        'The application deadline is unavailable in the captured text.',
        'The capture gives no mandatory qualifications.',
        'Program dates do not appear in the capture.',
      ],
    },
  });
  const { status, output } = saveReview(root, 'test-role');
  assert.equal(status, 'saved');
  assert.deepEqual(output.review.missing_fields, ['dates', 'requirements', 'application_deadline']);
  assert.match(writeShortlist(root), /Missing from the extraction: dates, requirements, application deadline/);
});

test('accepts empty missing_fields and notes when an explicit deadline was extracted', (t) => {
  const deadline = {
    kind: 'application_deadline',
    value: 'May 1, 2027',
    evidence: 'Apply by May 1, 2027',
  };
  const { root, reviewPath, review, outputPath } = fixture(t, {
    input: { text: 'Python required. Apply by May 1, 2027.' },
    review: { dates: [deadline], missing_fields: [], unknowns: [] },
  });
  writeJson(reviewPath, { ...review, missing_fields: ['application_deadline'] });
  assert.throws(() => saveReview(root, 'test-role'), /missing_fields/i);
  assert.equal(existsSync(outputPath), false);
  writeJson(reviewPath, review);
  const result = saveReview(root, 'test-role');
  assert.equal(result.status, 'saved');
  assert.deepEqual(result.output.review.missing_fields, []);
});

test('a competing creator cannot be overwritten', (t) => {
  const { root, outputPath, review } = fixture(t);
  const { output } = saveReview(root, 'test-role');
  rmSync(outputPath);
  const competingOutput = {
    ...output,
    review: { ...review, rationale: 'The other process wrote this review.' },
  };
  const originalLink = fs.linkSync;
  let attemptedCreate = false;
  fs.linkSync = (from, to) => {
    if (to === outputPath) {
      attemptedCreate = true;
      writeJson(to, competingOutput);
    }
    return originalLink(from, to);
  };
  syncBuiltinESMExports();
  try {
    assert.throws(() => saveReview(root, 'test-role'), /already|different/i);
  } finally {
    fs.linkSync = originalLink;
    syncBuiltinESMExports();
  }
  assert.equal(attemptedCreate, true);
  assert.deepEqual(JSON.parse(readFileSync(outputPath, 'utf8')), competingOutput);
});

test('regenerates in ID order from saved output after live files are changed', (t) => {
  const { root, inputPath, reviewPath, reportPath } = fixture(t);
  saveReview(root, 'test-role');
  addExample(root, 'first-role', { input: { title: 'First in ID order' } });
  saveReview(root, 'first-role');
  writeFileSync(inputPath, 'changed input');
  rmSync(reviewPath);
  rmSync(reportPath);

  const report = writeShortlist(root);
  assert.deepEqual(readFileSync(reportPath, 'utf8'), report);
  assert.ok(report.indexOf('First in ID order') < report.indexOf('Test Internship'));
  for (const text of [
    'Python experience', 'Python required', 'program_start', 'June 2027',
    'Application deadline unknown', 'pending', 'explore', 'Test Employer',
    'The role is relevant to software exploration.', 'partial', 'unverified',
  ]) {
    assert.ok(report.includes(text), text);
  }
});

test('lists pending captures separately from saved records', (t) => {
  const { root } = fixture(t);
  const inputOnly = addExample(root, 'input-only');
  const draftOnly = addExample(root, 'draft-only');
  rmSync(inputOnly.reviewPath);
  rmSync(draftOnly.inputPath);
  const report = writeShortlist(root);
  assert.match(report, /Captures awaiting a saved review: 3/);
  assert.match(report, /draft-only, input-only, test-role/);
  assert.doesNotMatch(report, /Test Internship/);
  assert.equal(saveReview(root, 'test-role').status, 'saved');
});

test('rejects an empty example directory without replacing the report', (t) => {
  const { root, reportPath } = fixture(t);
  const original = writeShortlist(root);
  mkdirSync(join(root, 'examples', 'empty-role'));
  assert.throws(() => writeShortlist(root), /empty-role.*input\.json.*review\.json/i);
  assert.equal(readFileSync(reportPath, 'utf8'), original);
});

test('rejects a draft directory placeholder even when there is a real input', (t) => {
  const { root, reviewPath } = fixture(t);
  rmSync(reviewPath);
  mkdirSync(reviewPath);
  assert.throws(() => writeShortlist(root), /review\.json.*regular file/i);
});

test('escapes Markdown and HTML from saved text', (t) => {
  const { root } = fixture(t, {
    input: { title: 'Test | Internship <img src=x>' },
    review: {
      rationale: 'Example [link](https://example.com)\n# inject heading',
      unknowns: ['Application deadline unknown', '---', '- nested bullet', '1. nested list'],
    },
  });
  const { status } = saveReview(root, 'test-role');
  assert.equal(status, 'saved');
  const report = writeShortlist(root);
  assert.doesNotMatch(report, /<img|\[link\]\(|\n# inject heading|Test \| Internship/);
  assert.doesNotMatch(report, /\n- (?:---|- nested bullet|1\. nested list)(?:\n|$)/);
  assert.match(report, /&#45;/);
  assert.match(report, /1&#46; nested list/);
});

test('fails visibly for a corrupt stored output without replacing the report', (t) => {
  const { root, outputPath, reportPath } = fixture(t);
  const { output } = saveReview(root, 'test-role');
  const originalReport = readFileSync(reportPath);
  writeFileSync(outputPath, 'invalid JSON');
  assert.throws(() => writeShortlist(root), /output\.json/i);
  writeJson(outputPath, { ...output, review: null });
  assert.throws(() => writeShortlist(root), /review/i);
  writeJson(outputPath, { ...output, review: { ...output.review, missing_fields: [] } });
  assert.throws(() => writeShortlist(root), /output\.json.*missing_fields/i);
  assert.deepEqual(readFileSync(reportPath), originalReport);
});

test('keeps evidence and reports the failed refresh so report can be retried', (t) => {
  const { root, outputPath, reportPath } = fixture(t);
  mkdirSync(reportPath, { recursive: true });
  assert.throws(() => saveReview(root, 'test-role'), /evidence saved.*report.*failed/i);
  const saved = readFileSync(outputPath);
  rmSync(reportPath, { recursive: true });
  const report = writeShortlist(root);
  assert.match(report, /Test Internship/);
  assert.deepEqual(readFileSync(outputPath), saved);
});

test('CLI rejects invalid usage and saves against its own PS5 directory', (t) => {
  const { root, outputPath } = fixture(t);
  const trackerPath = join(root, 'tracker.mjs');
  copyFileSync(new URL('./tracker.mjs', import.meta.url), trackerPath);
  const run = (args) => spawnSync(process.execPath, [trackerPath, ...args], { encoding: 'utf8' });
  for (const args of [[], ['bad'], ['save'], ['save', 'test-role', 'extra'], ['report', 'extra']]) {
    const result = run(args);
    assert.notEqual(result.status, 0, args.join(' '));
    assert.match(result.stderr, /usage/i);
  }
  assert.equal(existsSync(outputPath), false);
  const saved = run(['save', 'test-role']);
  assert.equal(saved.status, 0, saved.stderr);
  assert.equal(existsSync(outputPath), true);
  const report = run(['report']);
  assert.equal(report.status, 0, report.stderr);
});
