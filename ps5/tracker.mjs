import { createHash, randomUUID } from 'node:crypto';
import {
  linkSync, lstatSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync,
} from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual, TextDecoder } from 'node:util';

const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const VERDICTS = ['explore', 'needs_review', 'skip'];
const DATE_KINDS = ['application_deadline', 'program_start', 'program_end', 'graduation_window', 'other'];
const DEADLINE_NOTE = /\b(?:deadlines?|(?:application|apply|submission) (?:closing date|date|window|cutoff))\b/i;
const REQUIREMENTS_NOTE = /\b(?:requirements?|qualifications?|prerequisites?|eligibility)\b/i;
const DATES_NOTE = /\b(?:dates|timelines?|timing|schedule|start|end|graduation window)\b/i;
const UNCERTAINTY = /\b(?:unknown|unclear|uncertain|unspecified|unavailable|missing|unverified|undetermined|unconfirmed|unpublished|unstated|omitted|absent|tbd|yet to be (?:confirmed|verified|determined))\b/i;
const NEGATED_DISCLOSURE = /\b(?:not|never|cannot|can't|couldn't|doesn't|didn't)\s+(?:be |been )?(?:available|capture[ds]?|confirm(?:ed)?|contain(?:ed|s)?|determine[ds]?|disclose[ds]?|establish(?:ed)?|give[ns]?|include[ds]?|known|list(?:ed|s)?|mention(?:ed|s)?|present|provide[ds]?|report(?:ed|s)?|show(?:n|s)?|specif(?:y|ied)|state[ds]?|verif(?:y|ied))\b/i;
const SHA256 = /^[a-f0-9]{64}$/;
const REPORT_COMMAND = 'node ps5/tracker.mjs report';

function validate(condition, message) {
  if (!condition) throw new Error(message);
}

function requireRoot(root) {
  validate(typeof root === 'string' && isAbsolute(root), 'Use an absolute PS5 directory.');
}

function requireId(id) {
  validate(typeof id === 'string' && id === id.trim() && ID.test(id),
    'Invalid ID. Use lowercase letters or digits, with single hyphens between words.');
}

function nonempty(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function requireRecord(record, label) {
  validate(record !== null && typeof record === 'object' && !Array.isArray(record),
    `${label} must be a JSON object.`);
}

function requireSchema(record, label) {
  requireRecord(record, label);
  validate(record.schema_version === 1, `${label}.schema_version must be 1.`);
}

function readJson(path) {
  try {
    const bytes = readFileSync(path);
    const json = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    return { bytes, record: JSON.parse(json) };
  } catch (error) {
    throw new Error(`${path}: ${error.message}`, { cause: error });
  }
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function requireHttps(value, label) {
  const message = `${label} must be a valid HTTPS URL.`;
  validate(typeof value === 'string' && /^https:\/\/[^/\\\s]/i.test(value) && !/\s/u.test(value), message);
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(message);
  }
  validate(url.protocol === 'https:', message);
}

function requireCalendarDate(value, label) {
  const date = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(value)
    : null;
  validate(date && Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value,
    `${label} must be a real calendar date in YYYY-MM-DD format.`);
}

function validateInput(input, id) {
  requireSchema(input, 'input');
  validate(input.id === id, 'input.id must match the requested ID.');
  for (const key of ['title', 'company', 'capture_method', 'text']) {
    validate(nonempty(input[key]), `input.${key} must be a nonempty string.`);
  }
  requireHttps(input.url, 'input.url');
  requireCalendarDate(input.captured_on, 'input.captured_on');
}

function hasLimitation(notes, topic) {
  // Match the topic and uncertainty in the same clause.
  const absentTopic = new RegExp(`\\b(?:no|lack(?:s|ed|ing)?)\\s+(?:(?:a|an|clear|exact|known|specific|confirmed)\\s+){0,2}${topic.source}`, 'i');
  return notes.some((note) => note.split(/[.!?;\r\n]|\b(?:but|however|although)\b/i)
    .some((clause) => topic.test(clause) &&
      (UNCERTAINTY.test(clause) || NEGATED_DISCLOSURE.test(clause) || absentTopic.test(clause))));
}

function validateReview(review, sourceUrl, sourceText) {
  requireSchema(review, 'review');
  validate(VERDICTS.includes(review.verdict), `review.verdict must be one of ${VERDICTS.join(', ')}.`);
  validate(review.eligibility === 'unverified', 'review.eligibility must be unverified.');
  const rationale = typeof review.rationale === 'string' ? review.rationale.trim() : '';
  // This is a minimum description check. The operator still judges the rationale.
  const words = rationale.match(/\p{L}[\p{L}\p{N}]*/gu) ?? [];
  validate(rationale.length >= 12 && words.length >= 3 && !/^(?:placeholder|todo|tbd)\b/i.test(rationale),
    'review.rationale must explain the verdict in at least three words and 12 characters.');
  requireHttps(review.apply_url, 'review.apply_url');
  validate(review.apply_url === sourceUrl, 'review.apply_url must match the source URL.');

  for (const field of ['requirements', 'dates', 'unknowns']) {
    validate(Array.isArray(review[field]), `review.${field} must be an array.`);
  }
  validate(review.unknowns.every(nonempty), 'review.unknowns must contain nonempty strings.');

  function requireEvidence(item, label) {
    requireRecord(item, label);
    validate(nonempty(item.evidence), `${label}.evidence must be nonempty.`);
    if (sourceText !== undefined) {
      validate(sourceText.includes(item.evidence), `${label}.evidence must quote the capture exactly.`);
    }
  }

  review.requirements.forEach((requirement, index) => {
    const label = `review.requirements[${index}]`;
    requireEvidence(requirement, label);
    validate(nonempty(requirement.text), `${label}.text must be a nonempty string.`);
  });
  review.dates.forEach((date, index) => {
    const label = `review.dates[${index}]`;
    requireEvidence(date, label);
    validate(DATE_KINDS.includes(date.kind), `${label}.kind must be one of ${DATE_KINDS.join(', ')}.`);
    validate(nonempty(date.value) && date.evidence.includes(date.value),
      `${label}.value must appear exactly in its evidence.`);
  });

  if (!review.dates.some((date) => date.kind === 'application_deadline')) {
    validate(hasLimitation(review.unknowns, DEADLINE_NOTE),
      'review.unknowns must flag that the application deadline is unknown.');
  }
  if (review.requirements.length === 0) {
    validate(hasLimitation(review.unknowns, REQUIREMENTS_NOTE),
      'review.unknowns must explain the missing requirements.');
  }
  if (review.dates.length === 0) {
    validate(hasLimitation(review.unknowns, DATES_NOTE),
      'review.unknowns must explain the missing dates.');
  }
}

function readOutput(path, id) {
  validate(lstatSync(path).isFile(), `${path} must be a regular file.`);
  const { record: output } = readJson(path);
  try {
    requireSchema(output, 'output');
    validate(output.id === id, 'output.id must match its example directory.');
    validate(nonempty(output.title) && nonempty(output.company),
      'output.title and output.company must be nonempty strings.');
    requireHttps(output.source_url, 'output.source_url');
    requireCalendarDate(output.captured_on, 'output.captured_on');
    for (const key of ['input_sha256', 'criteria_sha256']) {
      validate(typeof output[key] === 'string' && output[key].length === 64 && SHA256.test(output[key]),
        `output.${key} must be a SHA-256 hash.`);
    }
    const date = typeof output.processed_at === 'string' ? new Date(output.processed_at) : null;
    validate(date && Number.isFinite(date.getTime()) && date.toISOString() === output.processed_at,
      'output.processed_at must be an ISO timestamp.');
    validate(output.human_review === 'pending', 'output.human_review must be pending.');
    validateReview(output.review, output.source_url);
  } catch (error) {
    throw new Error(`${path}: ${error.message}`, { cause: error });
  }
  return output;
}

function publishFile(path, content, publish) {
  const temp = join(dirname(path), `.tracker-${randomUUID()}.tmp`);
  try {
    writeFileSync(temp, content, { flag: 'wx', flush: true });
    publish(temp, path);
  } finally {
    rmSync(temp, { force: true });
  }
}

export function saveReview(root, id) {
  requireRoot(root);
  requireId(id);
  const folder = join(root, 'examples', id);
  validate(lstatSync(folder).isDirectory(), `${folder} must be an example directory.`);

  const { bytes: criteriaBytes, record: criteria } = readJson(join(root, 'criteria.json'));
  requireSchema(criteria, 'criteria');
  if (criteria.eligibility_policy !== undefined) {
    validate(criteria.eligibility_policy === 'unverified', 'criteria.eligibility_policy must be unverified.');
  }
  const { bytes: inputBytes, record: input } = readJson(join(folder, 'input.json'));
  validateInput(input, id);
  const { record: review } = readJson(join(folder, 'review.json'));
  validateReview(review, input.url, input.text);

  const candidate = {
    schema_version: 1,
    id,
    title: input.title,
    company: input.company,
    source_url: input.url,
    captured_on: input.captured_on,
    input_sha256: sha256(inputBytes),
    criteria_sha256: sha256(criteriaBytes),
    processed_at: new Date().toISOString(),
    human_review: 'pending',
    review,
  };
  const path = join(folder, 'output.json');
  let status = 'saved';
  let output = candidate;
  try {
    // A hard link publishes the complete file and fails if another save owns the path.
    publishFile(path, JSON.stringify(candidate, null, 2) + '\n', linkSync);
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
    output = readOutput(path, id);
    validate(output.input_sha256 === candidate.input_sha256 &&
      output.criteria_sha256 === candidate.criteria_sha256 &&
      isDeepStrictEqual(output.review, candidate.review),
    `Evidence already exists for ${id} with different input, criteria or review. Use a new ID.`);
    status = 'unchanged';
  }

  try {
    writeShortlist(root);
  } catch (error) {
    const evidence = status === 'saved' ? 'Evidence saved' : 'Evidence already saved';
    throw new Error(
      `${evidence} for ${id}, but report refresh failed. Fix the problem and rerun ${REPORT_COMMAND}: ${error.message}`,
      { cause: error },
    );
  }
  return { status, output };
}

function markdownText(value) {
  // Collapse line breaks and encode punctuation that could create Markdown or HTML.
  return value.replace(/[\s\u0000-\u001f\u007f]+/gu, ' ').trim()
    .replace(/[!"#&'()*+:<>\[\]\\_`{|}~]/gu, (character) => `&#${character.codePointAt(0)};`)
    .replace(/^-+/u, (hyphens) => '&#45;'.repeat(hyphens.length))
    .replace(/^(\d{1,9})\.(?=\s|$)/u, '$1&#46;');
}

function requirePendingFiles(folder) {
  let hasPendingFile = false;
  for (const name of ['input.json', 'review.json']) {
    const path = join(folder, name);
    const stats = lstatSync(path, { throwIfNoEntry: false });
    if (stats) {
      validate(stats.isFile(), `${path} must be a regular file.`);
      hasPendingFile = true;
    }
  }
  validate(hasPendingFile, `${folder} is missing output.json, input.json and review.json.`);
}

function renderShortlist(root) {
  const examples = join(root, 'examples');
  const ids = readdirSync(examples, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() || entry.isSymbolicLink())
    .map((entry) => entry.name)
    .sort();
  const saved = [];
  const pending = [];
  for (const id of ids) {
    requireId(id);
    const folder = join(examples, id);
    validate(lstatSync(folder).isDirectory(), `Example ${id} must be a directory.`);
    const path = join(folder, 'output.json');
    if (lstatSync(path, { throwIfNoEntry: false })) {
      saved.push(readOutput(path, id));
    } else {
      requirePendingFiles(folder);
      pending.push(id);
    }
  }

  const lines = [
    '# Internship shortlist',
    '',
    'Source captures are partial. Recommendations and eligibility are unverified.',
    '',
    `Saved reviews: ${saved.length}. Captures awaiting a saved review: ${pending.length}.`,
  ];
  if (pending.length) {
    lines.push('', `Pending capture IDs: ${pending.map(markdownText).join(', ')}.`);
  }
  for (const output of saved) {
    const { review } = output;
    const url = new URL(output.source_url).href.replaceAll('&', '&amp;')
      .replaceAll('<', '%3C').replaceAll('>', '%3E').replaceAll('\\', '%5C');
    lines.push(
      '',
      `## ${markdownText(output.company)} — ${markdownText(output.title)}`,
      '',
      `ID: ${markdownText(output.id)}`,
      '',
      `Source: [Open posting](<${url}>) (partial capture, ${output.captured_on})`,
      '',
      `Verdict is ${review.verdict}. Eligibility is ${review.eligibility}. Human review is ${output.human_review}.`,
      '',
      `Rationale: ${markdownText(review.rationale)}`,
      '',
      'Requirements',
      '',
    );
    if (!review.requirements.length) lines.push('- None extracted from this capture.');
    for (const requirement of review.requirements) {
      lines.push(`- ${markdownText(requirement.text)} (evidence: ${markdownText(requirement.evidence)})`);
    }
    lines.push('', 'Dates', '');
    if (!review.dates.length) lines.push('- None extracted from this capture.');
    for (const date of review.dates) {
      lines.push(`- \`${date.kind}\` — ${markdownText(date.value)} (evidence: ${markdownText(date.evidence)})`);
    }
    lines.push('', 'Unknowns', '');
    if (!review.unknowns.length) lines.push('- None recorded.');
    for (const note of review.unknowns) lines.push(`- ${markdownText(note)}`);
  }
  return lines.join('\n') + '\n';
}

export function writeShortlist(root) {
  requireRoot(root);
  const path = join(root, 'data', 'shortlist.md');
  mkdirSync(dirname(path), { recursive: true });

  let report = renderShortlist(root);
  while (true) {
    publishFile(path, report, renameSync);
    // If another save landed during the refresh, replace any stale snapshot we just wrote.
    const latest = renderShortlist(root);
    if (latest === report) return report;
    report = latest;
  }
}

function main([command, ...args]) {
  const root = dirname(fileURLToPath(import.meta.url));
  if (command === 'save' && args.length === 1) {
    const { status } = saveReview(root, args[0]);
    console.log(`Review ${status} for ${args[0]}. Shortlist refreshed.`);
    return;
  }
  if (command === 'report' && args.length === 0) {
    writeShortlist(root);
    console.log('Refreshed ps5/data/shortlist.md.');
    return;
  }
  throw new Error(`Usage: node ps5/tracker.mjs save <id> | ${REPORT_COMMAND}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
