# Problem Set 2: React App with SQL Backend

## What you are doing

**Design and build a React app of your own choosing, with a server and a SQL database behind
it.** It runs on your laptop only. Nothing is deployed and nothing is public. Problem Set 3 will deploy
this same app publicly, so build something you are willing to keep looking at for a few weeks and will be proud to share with friends and family.

You pick what the app is. Part of the assignment is thinking about what a fun or useful app would be.

If you're using the U-M API key, note before and after work sessions what your balance is, at `toolkit.umgpt.umich.edu`, to monitor your spend.

Use Superpowers to guide you through the brainstorming process and let it do the implementation for you.

## How big

**At least the size of the app you built in Thursday's lab**. More ambitious is fine!

Minimum requirements:

1. **Somebody can put data in, change it, and remove it.** All three, not just adding.
2. **Something else in the app reads that data back** and does something with it that is not
   just listing it.
3. **Something the app records about what the user did survives a restart.** Not just the data
   they typed in: something the app itself noticed and wrote down.


## The tech stack

React on the front, a Node server in the middle, a SQL database at the back. All three on
localhost.

**Use SQLite unless you have a reason not to.** There is nothing to install and nothing to start. Anything else
is fine if the whole app still starts with one command.

## The three things that are fixed

Everything else about how you organize this is yours. These three are not.

### `npm test` runs your tests, from this folder

Whatever test runner you and your agent pick is fine. The command is what is fixed.

### One of those tests proves the data survives a restart

**The test restarts the server process between writing and reading.** Write something, stop the
server, start it again, read it back, assert it is there.

**It writes and reads through your app's own HTTP API**, not with SQL straight into the database
file. A test that writes with SQL and reads with SQL proves that SQLite works, which nobody
doubted. It tells you nothing about your app.

You do not need a headless browser for this. It is a Node test making HTTP requests. It is OK to also have separate tests that use a headless browser.

### `npm start` starts everything

`npm start` should bring the whole thing up, server and front end together. Problem Set 3 will
deploy this app and it will start it the same way. Put the command in your `README.md` either
way.

## What you hand in

Everything lives in this folder, with one exception, and the exception is the design file.

| file              | what it is                                                          |
| ----------------- | ------------------------------------------------------------------- |
| the app           | source, organized however you and your agent see fit                 |
| `README.md`       | what the app is, how to start it, how to exercise the main features  |
| `REFLECTION.md`   | five questions, answered by hand. The template is in this folder.    |
| your tests        | including the restart test above                                     |

**The design file lives at the top of your repository, not in this folder.** Superpowers writes
it to `docs/superpowers/specs/`, beside `ps1-data-analysis` and `ps2-web-app` rather than inside
either. That is where it belongs and that is where it gets graded from. Leave it there.

**The design file is the spec you approved, not a description written afterwards.** Those read
differently and it is easy to tell them apart. A spec says what the app will do and what was
decided; a write-up says what the app does. Hand in the first one.

**Write the reflection file by hand, in your own voice.**

I don't have a check for whether you use AI for this and there is no direct penalty if you do. But you can expect follow-up questions on mini-quizzes or the midterm. The easiest way to be sure you understand the contents of your reflection file is to write it yourself!

There are no marks for length. A few sentences for each question is good.

## Grading

| criterion                                                                        | share |
| -------------------------------------------------------------------------------- | ----- |
| `npm test` runs, and the tests pass                                              | 25%   |
| a test restarts the server and goes through your own API                         | 25%   |
| the app clears all three clauses under **How big**                               | 30%   |
| design file present, and it reads as a spec rather than a write-up               | 10%   |
| `REFLECTION.md` present, all five answered, answers responsive to what was asked | 10%   |

**The reflection is marked for being answered, not for what the answer says.**

## Submitting

Commit as you go, and push. On Canvas, submit the URL of your assignments repository. What gets
graded is whatever is on `main` in your GitHub repo.

Due **Wed Sep 30, 11:59 PM**.
