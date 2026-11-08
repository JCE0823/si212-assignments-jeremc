# Problem Set 5: Putting an Agent in a Workflow

## What you are doing

**Design and build a workflow you would actually use, with an AI agent doing at least one of its
steps.** It runs on your own laptop, on data you can reach from there. Some steps will be done by
a program, some by an agent following a skill file you write, and some by you. Then you run it
on real inputs, notice where it goes wrong, and change the design or the skills because of what
you noticed.

This is the course's central skill: dividing a workflow into steps, and deciding whether each one
is best done by a program, an agent or a person. Your agent will do most of the building. You are
responsible for the design, for judging the outputs, and for deciding what to change.

You will keep a record of those changes in `ps5/CHANGES.md`. It counts only changes that **you**
noticed or guided, so it is a record of your judgment, not of your agent's.

## Choosing your workflow

**The default is a tracker that helps you pick internship and job postings you want to respond
to.** If you don't arrive with a workflow of your own, use this one. It has three phases, and
each one can go wrong in its own way:

- **Acquire** postings, by hand or with automation you build.
- **Assess** each posting: is this one for me?
- **Extract** what matters: the application deadline, any other dates, the requirements, how to
  apply.

**Get postings from sources that allow it**: Handshake, company career pages, or pages you save
by hand. LinkedIn's terms forbid scraping, and pointing a browser automation tool at it puts your
account at risk.

**A workflow of your own is welcome if it passes three tests:**

1. **Some step needs judgment that an agent can get wrong.** If a program could do every step
   perfectly, your skill will never break, and you will have nothing to notice.
2. **The inputs vary enough that the next one can surprise you.**
3. **You have at least ten real inputs to run it on.** And it has to be small enough to build and
   run in about a week.

You do not need approval. If you are unsure whether yours passes, bring it to class on Tuesday
11/10 and ask your table.

## Designing it

**Design with Superpowers.** Tell your agent you want to design a workflow for Problem Set 5, and
it will brainstorm it with you into a spec. Your agent draws `ps5/workflow.bpmn` as you go, and
you view it by double-clicking it to open it in Camunda. The diagram shows each step, who does it
(you, an AI agent following a skill file, or a program), what triggers the workflow, and where
its state is kept.

**Your initial design is expected by Thursday 11/12's class**: the diagram, a first draft of each
skill file in `ps5/skills/`, and the spec, committed and pushed. It is expected to be rough. In
class we will critique each other's designs.

**Name your initial design on the first line of `ps5/CHANGES.md`.** When you consider the design
frozen, find that commit's hash (`git log --oneline` shows it, or ask your agent), and replace
the placeholder so the line reads `Initial design: <that hash>`. A commit cannot contain its own
hash, so this line goes in a later commit. Every change after the named commit is a change your
record can count.

## Building and running it

- **Skills go in `ps5/skills/<name>/SKILL.md`**, one folder per skill. The skill can be run by
  hand, by asking your agent to follow it, or called from a program. Either is fine, and your
  diagram says which.
- **Save every run's evidence in `ps5/examples/`**: one folder per input, holding the input as
  `input.<ext>` and what the workflow produced from it as `output.<ext>`. Commit them as the runs
  happen. You need at least ten.
- **Use real data.** If an input has someone's personal details in it, replace them with made-up
  ones before you commit it. Postings are fine as they are.
- **Fill in `ps5/README.md`**: what the workflow does, how to run it, and where its data lives.

## The change record

`ps5/CHANGES.md` records changes made after your initial design, prompted by running the workflow
on real data or by design critique from classmates or Paul. Two kinds count:

- **a change to the workflow**, which shows up as a change to the diagram
- **a change to what a skill file says**

Bug fixes to programs don't count. Neither does a change your agent noticed and fixed on its own
while you only approved it.

| who noticed the problem | who chose the fix                                | in the record? |
| ----------------------- | ------------------------------------------------ | -------------- |
| you                     | you                                              | yes            |
| you                     | your agent, from your description                | yes            |
| a classmate or Paul, in design critique | you                              | yes            |
| your agent              | you, choosing among its options or redirecting it | yes           |
| your agent              | your agent, with you approving                   | no             |

**Your agent will offer you an entry after each change** to the diagram or a skill once your
initial design is named, because `ps5/AGENTS.md` tells it to. It asks you who noticed the problem
and who chose the fix; it does not decide that for you. If it lands on the table's last row, no
entry is made.

**Two parts of each entry are in your own words:** what you noticed was wrong, and why you chose
that fix. Your agent asks you for each one, and a tool copies your answer into the record exactly
as you typed it. Be specific: name the input or the critique that prompted it, and what was
wrong. "I improved the prompt" is not specific.

**If you made changes without recording them**, ask your agent to **find changes for your
record**. It lists the commits since your initial design that changed the diagram or a skill and
are not in the record yet, and asks which ones you want to add.

## Check it yourself before you hand it in

**Ask your agent whether Problem Set 5 is ready to submit.** It checks everything below that a
program can check, including that your work is committed and pushed, then shows you each
own-words part of your record in turn and asks whether you wrote it yourself. A yes is recorded in `CHANGES.md` with the date. If you say no, rewrite that part in
your own words, and it will ask you again.

Also check, yourself, that the diagram matches what you built: every step, who does it, and the
trigger.

## The demo

**Bring your workflow to Thursday 11/19's class.** At your table, a classmate or Paul picks one
entry in your change record, or one difference between your initial design and your final one.
You walk through it: the input or critique that showed the problem, what you changed, and what
happened next.

## The quiz

**A mini-quiz after the due date will ask you about your own change record**, without an agent:
what went wrong in one of your changes, and what you changed. It is graded against the record you
submitted, so the own-words parts need to be accurate.

## What you hand in

| what                                                  | where                     |
| ----------------------------------------------------- | ------------------------- |
| the diagram                                           | `ps5/workflow.bpmn`       |
| the skills                                            | `ps5/skills/<name>/SKILL.md` |
| any programs, and the Superpowers spec                | `ps5/`                    |
| at least ten inputs, each with its output             | `ps5/examples/<id>/`      |
| the README                                            | `ps5/README.md`           |
| the change record                                     | `ps5/CHANGES.md`          |

## Grading

| criterion                                                                                          | share |
| -------------------------------------------------------------------------------------------------- | ----- |
| `CHANGES.md` names an initial design commit, and that commit has a diagram and at least one skill file | 10% |
| the final diagram matches the workflow as built: each step, its lane (program, agent or person), and the trigger | 20% |
| an agent step follows a skill file in `ps5/`, and at least one step is done by a program or by you | 10% |
| at least ten real inputs, each saved with the output the workflow produced from it                  | 20% |
| at least two entries in `CHANGES.md` that qualify: each touches the diagram or a skill file, checked against its commit, and is not on the table's last row | 20% |
| each entry's own-words parts are specific, naming the input or critique that prompted it and what was wrong, and are attested | 20% |

**Not graded:** whether the workflow is clever or a skill is good, how well the own-words parts
are written, and code quality. "Specific" is the only bar on the own-words parts.

**When you made your initial design commit is not graded**, only that `CHANGES.md` names one.
But a design frozen late leaves you less time to make changes worth recording.

**The demo and the quiz question are graded separately**, and do not count toward this problem
set.

## Submitting

Commit as you go, and push. On Canvas, submit the URL of your assignments repository. What gets
graded is whatever is on `main` when it gets graded.

Due **Wed Nov 18, 11:59 PM**.
