# Problem Set 5

Instructions for an agent working in `ps5/`. The student's instructions are `INSTRUCTIONS.md`.

## After a change worth recording, offer a record entry

**Once `ps5/CHANGES.md` names an initial design**, its first line reading `Initial design:`
followed by a commit hash rather than `<commit hash>`, then after a change to
`ps5/workflow.bpmn` or to a `ps5/skills/*/SKILL.md` that is worth recording, follow
`record-change`:

    <course-materials>/workflows/record/skills/record-change/SKILL.md

where `<course-materials>` is the folder `~/.codex/AGENTS.md` names.

**A change is worth recording when both of these hold:**

- **It changes how the workflow behaves:** a step added, removed or reordered, a step moved to a
  different lane, or a change to what a skill tells the agent to do. Rewording that keeps the
  meaning, formatting, typo fixes, renames and diagram layout do not count.
- **It came from something the student saw or was told:** a run on an input, or design critique.
  A change you made on your own while building does not count.

When you are not sure, do not offer. Asking after every small edit teaches the student to answer
no without reading, and `find-changes` lists every commit to the diagram or a skill, so a change
you pass over can still be recorded later.

Whether to offer is your call. Whether the change goes in the record, who noticed the problem
and who chose the fix are the student's: `record-change` asks them, and you never decide those
for them or write the own-words parts of an entry yourself.

**Do not offer the same change twice.** Once the student declines one, it stays out unless they
bring it up. If they ask you to stop offering, stop for the rest of the session.

Before the initial design is named, changes do not go in the record. Do not offer one.

## Never edit `CHANGES.md` by hand

Every read and write of it goes through the tool those skills run, `changes.mjs`. The student may
edit it; you do not.

## Where things go

- the diagram: `ps5/workflow.bpmn`, drawn with `draw-workflow`
- skills: `ps5/skills/<name>/SKILL.md`
- evidence of runs: `ps5/examples/<id>/input.<ext>` and `ps5/examples/<id>/output.<ext>`, one
  folder per input, committed as the runs happen
