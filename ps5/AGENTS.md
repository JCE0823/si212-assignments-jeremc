# Problem Set 5

Instructions for an agent working in `ps5/`. The student's instructions are `INSTRUCTIONS.md`.

## After every change to the diagram or a skill, offer a record entry

**Once `ps5/CHANGES.md` names an initial design**, its first line reading `Initial design:`
followed by a commit hash rather than `<commit hash>`, then after any change to
`ps5/workflow.bpmn` or to a `ps5/skills/*/SKILL.md`, follow `record-change`:

    <course-materials>/workflows/record/skills/record-change/SKILL.md

where `<course-materials>` is the folder `~/.codex/AGENTS.md` names. It asks the student whether
the change goes in their record, and who noticed the problem and who chose the fix. Do not
decide either for them, and never write the own-words parts of an entry yourself.

Before the initial design is named, changes do not go in the record. Do not offer one.

## Never edit `CHANGES.md` by hand

Every read and write of it goes through the tool those skills run, `changes.mjs`. The student may
edit it; you do not.

## Where things go

- the diagram: `ps5/workflow.bpmn`, drawn with `draw-workflow`
- skills: `ps5/skills/<name>/SKILL.md`
- evidence of runs: `ps5/examples/<id>/input.<ext>` and `ps5/examples/<id>/output.<ext>`, one
  folder per input, committed as the runs happen
