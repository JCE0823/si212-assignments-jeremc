# Local internship tracker

## What it does

The tracker helps you decide which internships to investigate. Each run starts
when a posting is selected.

The current profile is a four-year bachelor's program. Major, current class
standing and expected graduation are unknown. The agent checks mandatory
degree enrollment before recommending a role; graduate-only enrollment is
a mismatch with this profile. Other eligibility remains unverified. Original
examples retain their earlier criteria hashes. See the [revision comparisons](examples/REVISIONS.md)
for new runs under the revised rules.

1. Give the agent an employer posting URL or delegate selection. The agent
   follows `ps5/skills/capture-posting/SKILL.md` to save the posting and its
   source details under a fresh ID.
2. The agent follows `ps5/skills/assess-posting/SKILL.md` and makes
   a recommendation about relevance, extracts requirements and dates, and
   explains missing information in a draft.
3. Run `ps5/tracker.mjs` to check the draft against the capture and save the
   evidence. The program checks that the draft explicitly marks absent
   deadlines and empty requirements or dates, then regenerates the shortlist.
4. Review the saved recommendation and the explanations for missing information.
   Open the original source to check whether it is still available, confirm
   application dates and requirements, and make your own decision about applying.

The [ten examples](examples/INDEX.md) summarize real public posting sources, including historical
previews where identified. Each capture is partial, and each recommendation is
unverified and awaits human review. An `explore` verdict means the subject of the
internship is worth investigating.

## How to run

Start at the assignments repository root with Node.js 22 or newer. The program
uses Node's built-in modules.

For a new posting, send your agent this prompt with the employer URL, or omit
it to delegate selection.

> Follow `ps5/skills/capture-posting/SKILL.md` for this employer posting URL,
> or select one public employer posting that matches the tracker criteria.
> Save the capture and follow `ps5/skills/assess-posting/SKILL.md`. Show me
> the saved result, original source and details I need to verify.

The capture lives in `ps5/examples/<id>/input.json` under a fresh ID with
lowercase letters or digits and single hyphens between words. This sample uses
a placeholder URL. Record the actual source, date and capture method. Before
the first save, write the input and any revised criteria as UTF-8 without a BOM
and with LF line endings, so Git preserves the exact bytes used for replay.
The tracker rejects a BOM or carriage returns in either file before saving
evidence and names the file to fix.

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

If you already have a saved capture, send your agent this prompt.

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
problem in the unsaved run and retry. If the command says evidence was saved
or already saved but the report refresh failed, keep the saved output and
draft, fix the reported problem, and rerun `node ps5/tracker.mjs report`.

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
student. Requested revisions are being saved as separate commits and new
example IDs. The change record still needs attribution, writeups in the
student's own words and attestation before submission.
