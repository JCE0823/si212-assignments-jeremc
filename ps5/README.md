# Local internship tracker

## What it does

The tracker helps you decide which internships to investigate. Each run starts
when you select a posting.

1. Save the posting's URL, capture date and a short source summary.
2. Ask an AI agent to follow `ps5/skills/assess-posting/SKILL.md`. The agent makes
   a recommendation about relevance, extracts requirements and dates, and
   explains missing information in a draft.
3. Run `ps5/tracker.mjs` to check the draft against the capture and save the
   evidence. The program checks that the draft explicitly marks absent
   deadlines and empty requirements or dates, then regenerates the shortlist.
4. Review the saved recommendation and the explanations for missing information.
   Open the original source to check whether it is still available, confirm
   application dates and requirements, and make your own decision about applying.

The ten examples summarize real public posting sources, including historical
previews where identified. Each capture is partial, and each recommendation is
unverified and awaits human review. An `explore` verdict means the subject of the
internship is worth investigating.

## How to run

Start at the assignments repository root with Node.js 22 or newer. The program
uses Node's built-in modules.

Choose a fresh ID with lowercase letters or digits, with single hyphens between
words. Save the capture in `ps5/examples/<id>/input.json`. This sample uses a
placeholder URL. Record the actual source, date and capture method for your posting.

```json
{
  "schema_version": 1,
  "id": "test-role",
  "title": "Test Internship",
  "company": "Test Employer",
  "url": "https://example.com/internship",
  "captured_on": "2026-11-18",
  "capture_method": "Partial source summary",
  "text": "Python required. Internship starts June 2027."
}
```

Send your agent this prompt.

> Follow `ps5/skills/assess-posting/SKILL.md` for the posting ID `test-role`.
> Assess the saved capture against the criteria and show me the saved result
> and the original posting URL.

The skill includes the save command. To save a prepared draft yourself, run
`save` with the posting ID. Use `report` to rebuild the shortlist, and
`node --test` to run the checks.

```powershell
node ps5/tracker.mjs save test-role
node ps5/tracker.mjs report
node --test ps5/tracker.test.mjs
```

Repeating a valid save with identical input and criteria bytes and the same
review leaves the existing output intact. A changed input, criteria file or
review for an existing ID is rejected. Use a new ID for a revised run and keep
the original evidence. If validation fails before saving, fix the reported
problem and retry. If the command says evidence was saved but the report
refresh failed, fix the reported problem and rerun `report`.

## Where its data lives

- `ps5/criteria.json` holds the exploration criteria and eligibility policy.
- `ps5/examples/<id>/input.json` holds the capture and its source details.
- `ps5/examples/<id>/review.json` holds the AI agent's draft, including
  its `missing_fields` list and plain-language explanations in `unknowns`.
- `ps5/examples/<id>/output.json` holds the accepted review, hashes of the
  input and criteria, the processing time and the pending human-review status.
- `ps5/data/shortlist.md` is regenerated from the saved outputs. Example IDs
  with no saved output are listed as pending captures. A corrupt saved record
  causes the report command to fail with the relevant file path.
- `ps5/workflow.bpmn` shows who does each step and which files they use.

The initial design (diagram, skill and spec) is in commit
`f4dcfb87e53db25f40ee84953ceb405b0e9b83ba`. Setting that hash in
`ps5/CHANGES.md` is still pending. The installed `changes.mjs` tool has no
initializer, and the course instructions reserve direct edits for the
student. Two qualifying student-guided revisions, writeups in the student's
own words, and attestation remain.
