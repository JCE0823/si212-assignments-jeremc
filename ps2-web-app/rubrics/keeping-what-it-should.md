# Rubrics: Keeping what it should

Answers for `tasks/keeping-what-it-should.md`. **Do not read this before attempting the
questions.**

### q-describe-your-app

- **type:** free
- **answer:** for example: a flashcard app where a teacher writes decks of cards and students
  practise them, with scores kept per student. The deck editor is meant for the teacher only,
  though nothing stops a student from opening it, since the app has no login.
- **credit:** full credit needs both halves: (a) a one-sentence description specific enough to
  say what the app does and who it is for, and (b) a clear answer on whether some features are
  meant for an admin or every feature is for every user, consistent with the description. Either
  answer to (b) is fine, and so is "meant for an admin, but nothing enforces it". Half credit for
  one of the two. No credit for (a) if it names only the technology ("a React app with a SQLite
  database") or a genre with nothing about this app ("a productivity app").


### q-fix-after-first-round

- **type:** free
- **answer:** for example: the scores page listed every attempt rather than each student's best
  score. I told the agent the page should show one row per student with their best score, and to
  write a failing test for that first; it changed the query and the test passed.
- **credit:** full credit needs both halves: (a) a specific element of the app and what was wrong
  with it, and (b) what the student actually did to get it fixed: what they told the agent, or a
  change they made to the spec, plan or code. Half credit for one of the two, and half credit for
  (b) that is only "I asked it to fix it" with nothing about what they asked for. An answer that
  says everything came out as intended earns half credit at most, and only if it names something
  specific the student checked.


### q-review-spec-or-plan

- **type:** free
- **answer:** the spec. It records what the app will do and the decisions that are mine to make,
  and the plan is worked out from it, so a mistake in the spec carries into everything built after
  it. The plan is mostly the agent's instructions to itself about how to build, and a mistake there
  tends to show up as a failing test or a bug that can be fixed without changing what the app is.
- **credit:** full credit for the spec with a reason along those lines: it holds the decisions
  that are the student's own, or the plan follows from it, so a mistake in the spec carries
  through. Half credit for the spec with no reason, or with a reason that would fit either file
  equally ("it is shorter", "it is important"). No credit for the plan, both equally, or neither.


### q-how-finished

- **type:** free
- **answer:** for example: once the tests passed I used it myself. I made a deck, practised it,
  stopped the app and started it again, and checked my scores were still there. Then I went down
  the spec's list of features and tried each one.
- **credit:** full credit for something the student checked themselves, named specifically:
  using a feature, restarting the app and looking for their data, going through the spec. Passing
  tests can be part of the answer but are not enough on their own. Half credit for "the tests
  passed" or "the agent said it was done" on its own, or for a self-check described only vaguely
  ("I tested it", "it worked"). An honest "I ran out of time" earns half credit if it says what
  was left unchecked.
