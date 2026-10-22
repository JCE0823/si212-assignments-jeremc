# Problem Set 4: Simulation

## What you are doing

**Pose a question that interests you, and have your agent build a simulation that answers it.**
The simulation runs in a web page: an input for each of the model's parameters, a run button, and
the results. Then you answer your question in your own words.

Your agent can help you with the modelling choices, but it's likely to need some guidance in order to make a model that answers the question you had in mind. In the superpowers design process you will want to think through carefully what the parameters of the model are (what values you can vary), what the outcomes are, and what are the best way to present those outcomes to users. 

The agent will build the actual simulation for you. You are responsible for guiding its choices of what to build, and understanding what it has built.

**Start with the worked example** in [`tennis-example/`](tennis-example/README.md). It is a complete
submission for this problem set, about tennis. Open its `index.html`, try some values, and read
its README. In Tuesday 10/27's class you'll make predictions about outcomes with certain parameter values.

## Choosing your question

Any question you care about, where the answer depends on a process you can describe: a game, a
queue, a market, an epidemic, a schedule, a sport. Some kinds of questions a simulation is good at:

| kind of question             | example                                                    |
| ---------------------------- | ---------------------------------------------------------- |
| What outcomes are likely?    | Federer's chance of reaching a Grand Slam final            |
| Can it happen at all?        | a traffic jam forming with no accident or bottleneck       |
| Which option is better?      | coaching a player's serve, or hiring a sports psychologist |
| Where is the tipping point?  | how big a serve edge makes tie-breaks common               |
| How bad can it get?          | the 100-year flood                                         |
| What would have happened if? | a past season under different scoring rules                |

Your question can combine kinds.

**Bring two or three candidate questions to Thursday 10/29's class**, each tagged with its kind.
The tables will help you sharpen them, and you'll leave with your question written down.

## What you build

**A web page** with an input for each of the model's parameters, a run button, and a display of results.

- **The run button runs many replications** if your model has randomness in it, and shows the
  average of each result and its spread.
- **Each parameter has a stated valid range**, and the page handles any value in that range
  without crashing. The limits, such as 0, are fair game at the demo, and they are often the best
  questions to ask a model.
- **Keep the page plain**: inputs, a run button, results. Styling and polish earn nothing (no penalty for polish, though!). Spend your time on the model.

It can be built with anything that runs on your laptop. A single `index.html` that needs no
install, like the example's, is the simplest. A React app is a natural choice, too, especially if you have a complicated results display.

## The README

Your simulation goes in `ps4/`, beside `tennis-example/`. Fill in the `README.md` already in
`ps4/`: it has these six sections, with these headings, in this order, and you keep them. The
tennis example's README has the same six, and is the model to follow.

1. **`## Question`**: your question.
2. **`## How to run`**: the commands to run the page, starting from a fresh clone of your
   repository.
3. **`## The model`**: what it simulates, and the simplifications it makes. Every model leaves
   things out, and what it leaves out shapes the answer.
4. **`## Parameters and outputs`**: two tables. One lists each parameter, its valid range, its
   default and what it means. The other lists each output, what it is, and how its spread is
   shown. A program reads this section, so keep it as tables.
5. **`## One suspicious outcome`**: one result, for one set of parameter values, that would make
   you suspect a mistake in the model or its implementation. Say the values and say what outcomes you would expect instead.
6. **`## Answer`**: the answer to your question, in your own words, with the runs that support
   it.

## Check it yourself before you hand it in

- Run it with your suspicious-outcome values. If you see the suspicious outcome, find out why.
- Set each parameter to the ends of its range, one at a time, and run. Nothing should crash, and
  you should be able to say why each result came out the way it did.
- Pick a parameter, guess which way each output will move when you change it, then change it and
  run. Where you guessed wrong, find out why.

## The demo

**Bring your simulation to Thursday 11/5's class.** At your table, a classmate sets any parameter
to any value in its range. You predict what will happen, then run it, and explain any gap between
your prediction and the result. The prediction doesn't have to be right. The explanation is the
point.

## The quiz

**Tuesday 11/10's mini-quiz will have one question about your own simulation**, in the same form: if
this parameter were set to this value, what would happen? It is written from your README's
`Parameters and outputs` section, so that section needs to be accurate.

## What you hand in

| what                                      | where                    |
| ----------------------------------------- | ------------------------ |
| the simulation and its page               | `ps4/`                   |
| `README.md`, with the six sections        | `ps4/README.md`          |

Leave `tennis-example/` as it is.

## Grading

| criterion                                                                                          | share |
| -------------------------------------------------------------------------------------------------- | ----- |
| the page runs by following `How to run`, with an input for each parameter in your table and a run button | 20%   |
| every parameter, set to each end of its range, runs without crashing                               | 20%   |
| the run button runs many replications and shows each output's average and spread                   | 15%   |
| the README has the six sections, and its two tables match the page                                 | 15%   |
| the suspicious outcome gives a full set of parameter values and the result you would expect        | 10%   |
| the answer addresses your question, with each run's settings stated, and the page agrees at those settings | 20%   |

**A model with no randomness** has nothing to replicate. It gets the replications row if each
output is shown and the README says why there is no spread.

**The demo and the quiz question are graded separately**, and do not count toward this problem
set.

## Submitting

Commit as you go, and push. On Canvas, submit the URL of your assignments repository. What gets
graded is whatever is on `main` when it gets graded.

Due **Wed Nov 4, 11:59 PM**.
