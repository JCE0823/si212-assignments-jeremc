# Problem Set 1: Data Analysis and Testing

## What you are doing

You will analyze the MovieLens dataset and produce a written report answering three questions.

**Your code generates the report.** 

An agent will write Python and JavaScript code for you. The code will run and produce the report. You have to figure out whether it got it right.


## The analysis tasks

### Task 1. Highest rated movies

Which movies have the highest average rating, counting only movies with at least 50 ratings? Report the top 10 movies.

### Task 2. Broadest taste

Which users rated movies from the largest number of different genres, counting only users who
rated 25 or fewer movies? Report the top 3 users.

A single movie can belong to more than one genre. That is what makes this harder than it looks.

### Task 3. User pairs with shared viewing habits

Which pairs of users had the highest overlap in the movies they rated? Report the top 5 pairs.

First compute this in a naive way, as the pairs with the highest count of movies that both of them rated.

Then, in your report, write a little explanation of why this might provide an uninteresting result. (Hint: think about a pair of users with very niche tastes, but the same niche; will this approach surface that pair?)

Finally, propose an alternative measure of "overlap", implement that, and see whether you get the same pairs that you got from the naive approach. Be prepared to answer questions about your overlap measure in class.

## How you know it is right

This is the actual subject of the assignment.

In class, you'll discuss three general techniques. You'll instantiate them for this assignment.

**The smell test.** Look at the answer and ask whether it could possibly be right. It is the
cheapest of the three, the only one that works on the full dataset, and the one to start with. It
is also one-sided: an answer that smells wrong tells you a great deal, an answer that smells fine
tells you very little. Write what you notice in the reflection slots in `report-template.md`.

**Small datasets whose answers you worked out by hand.** You will do the conceptual part of this
in class on Tuesday, in a table exercise, and it works best if you come having already done
the analysis. **Aim to have the assignment essentially finished before Tuesday**, and come ready to share your experience, in two kinds:

- **errors that you already discovered** with the initial implementation (whether you fixed them already or not).
- **things that you imagine could go wrong in this data analysis** that you'd like to rule out.

At the table on Tuesday, 9/15, you will turn those into descriptions of the smallest artificial datasets the analysis code could run on that would reveal those problems. Then that night you'll ask your agent to convert your descriptions into actual datasets and tests based on those datasets. If they reveal any problems in your implementation, the agent can fix them.

You will hand in `TEST-DATASETS.md`. The template is already in the repository, with the columns
you will need and one row filled in as an example of how specific a description has to be before
an agent can build anything from it.

**A second implementation, in a different language.** Solve **task 2** a second time in
JavaScript, in a file called `task2.mjs`, run with `node task2.mjs`. Then write a test, in a file
called `check_agreement.py`, that runs both versions against the real data and checks whether they
produce the same answer. To keep this manageable, do it just for task 2.

Those two file names are required, and they are the one part of this you do not get to choose.
The grader runs them by name. `python check_agreement.py` must exit 0 when the two
implementations agree and non-zero when they do not, and it should say what differed. Everything
else about it is yours: how it invokes the two versions, what it compares, how it reports.

You want this second implementation to be as independent as possible of the first version. So start a new chat session, tell it not to look at the code in your python implementation, and have it implement in a different language javascript. You already have node installed (it was part of the Installation 1 task).

The two implementations cannot pass a DataFrame between them, so they have to agree on what the
answer *is* as data. Have the JavaScript version print its answer as JSON and have the test
compare that against the Python one. Keep both implementations in the repository.

If they disagree, that disagreement is the most useful thing that will happen to you this week. You can work with your agent to analyze the difference and decide which version got it right.

## What we give you

### The data

See the `movielens/` folder. **Read `movielens/README.txt` before you write anything.** It describes how the data was
collected, and at least one of the tasks above means something different once you have read it.

Your code should read the data from `movielens/`. Do not move it, rename it, or hardcode a path from
your own machine. This instruction exists so that the auto-grader can substitute different data in that directory and test your code on it.

### `report-template.md`

This template has placeholders for your text. And placeholders that your script should replace with results from an analysis run. 

### `TEST-DATASETS.md`

A template for you to fill in during class discussion on Tuesday.

### `RESULTS-FORMAT.md`
This specifies the format the script should use for the `results.json` file it produces. This is meant for you to feed to your AI coding agent, so it knows the right format to produce.


## What you hand in

| file                     | what it is                                                        |
| ------------------------ | ----------------------------------------------------------------- |
| `analysis.py`            | running it performs the analysis, writing `results.json` and combining the results with `report-template.md` to produce `report.md` |
| `results.json`           | generated by `analysis.py`       |
| `report.md`              | generated by `analysis.py`                        |
| `task2.mjs`              | task 2, done again in JavaScript. See above. The name is required. |
| `check_agreement.py`     | runs both task 2 implementations and compares them. Exits 0 if they agree. The name is required. |
| `TEST-DATASETS.md`       | hand-written, not generated. A template is in the repository.     |
| `report-template.md`      | hand-edited to replace the parts ...between ellipses... |

**Those file names are the only structure required.** Name your functions whatever you like,
split them across as many modules as you want, organize it however you and your agent see fit.

`python analysis.py` must regenerate `report.md` and `results.json` from the data. Don't hand edit
either of them. This is checked by grading what you handed in, then deleting both, running your
code, and grading again. The two runs have to give the same answers.

Nothing here depends on the two being byte-identical, so a timestamp, or a number formatted to a
different number of decimal places, costs you nothing.

`report-template.md` is where your prose lives. Your script reads it, substitutes the computed
values into the placeholders, and writes `report.md`. You do not have to use it, but the report
has to come out of a run rather than out of your editor, and writing paragraphs inside a Python
string is painful.

`results.json` exists because a person reads the report and a program grades it, and those want
different things. Its shape is given in `RESULTS-FORMAT.md`.

## Grading

Automated, on the artifact you hand in. **There are no points for process.** No work log, no
reflections file, no marks for your commit history.

| criterion                                                                 | share |
| ------------------------------------------------------------------------- | ----- |
| What you handed in and a fresh run of your code give the same answers     | 20%    |
| Task 1 answers correct                                                     | 20%   |
| Task 2 answers correct                                                     | 20%   |
| Task 3 naive answer correct; alternative measure implemented and reported | 20%   |
| `task2.mjs` present, and `python check_agreement.py` exits 0                | 15%   |
| `TEST-DATASETS.md` present, rows and closing question filled in            | 5%    |

## Questions you must be able to answer in class (discussion or mini-quiz)

`QUESTIONS.md`, published with this assignment.

Some of them will be discussed in class before the assignment is due. Some of them may appear on the
mini-quiz afterwards. It's fine to ask your agent to help you work through them. That's studying. But you have to get to the point where you can write them and speak them out loud without the agent's help.

## Submitting

Commit as you go, and push. On Canvas, submit the URL of your personal assignments repository,
`https://github.com/<your-github-username>/si212-assignments-<your-uniqname>`. What gets graded is
whatever is on `main` at the deadline, so work you have not pushed has not been handed in.

Due **Wed Sep 16, 11:59 PM**.
