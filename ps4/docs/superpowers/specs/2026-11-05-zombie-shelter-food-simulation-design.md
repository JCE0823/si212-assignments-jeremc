# Zombie Shelter Food Simulation Design

## Purpose

Build a plain web-page simulation that answers: **How likely is one person to survive 30 days sheltering at home during a zombie apocalypse using only stored food?** The model focuses on food availability and random spoilage. It does not model water, illness, nutrition differences, zombie attacks, or scavenging.

## Simulation model

Each replication starts with one survivor and the selected number of stored meals. The survivor needs exactly two meals per day for 30 days.

For each day:

1. Randomly determine whether a spoilage event occurs using the selected daily probability.
2. If spoilage occurs, remove the selected number of meals, stopping at zero.
3. Try to consume two meals.
4. If fewer than two meals remain, record failure on that day and end the replication.

A replication succeeds when the survivor eats two meals on every one of the 30 days. Because spoilage occurs before the day's meals are eaten, food ruined that day cannot be consumed.

## Parameters

| parameter | valid range | default | meaning |
| --- | --- | --- | --- |
| Stored meals | 0–120 whole meals | 60 | Meals available at the beginning of day 1 |
| Daily spoilage chance | 0%–20% | 5% | Chance that a spoilage event occurs on each day |
| Meals lost per event | 1–10 whole meals | 3 | Meals made unusable whenever spoilage occurs |
| Replications | 10–20,000 whole runs | 2,000 | Independent 30-day scenarios to simulate |

The survivor count, 30-day duration, and two meals per day are fixed assumptions rather than adjustable parameters.

## Outputs

| output | definition | spread shown |
| --- | --- | --- |
| Survive all 30 days | Percentage of replications in which all 60 required meals are eaten | 95% confidence interval for the estimated percentage |
| Days survived | Number of complete days on which two meals are eaten, averaged across replications | Middle 80% of replications |
| Meals remaining after survival | Meals left at the end of day 30, among successful replications only | Middle 80% of successful replications; shown as not applicable when no run succeeds |

## Page and code structure

- `index.html` provides labeled numeric inputs, their valid ranges, a Run button, validation messages, and results.
- `sim.js` contains parameter definitions, validation, seeded random-number support, one-replication logic, and aggregation. Both the page and tests use this same model.
- `sim.test.js` tests the model with Node's built-in test runner.
- `package.json` supplies an `npm test` command without third-party dependencies.
- `README.md` retains the assignment's six required headings and documents the final model and results.

The page will use plain HTML and JavaScript and will open directly in a browser without installation.

## Validation and edge cases

All values must be numeric and within their stated ranges. Meal counts, meals lost, and replications must be whole numbers. Invalid values produce a clear message rather than running the model.

The implementation must handle every range endpoint without crashing. Removing spoiled food cannot make the stored-meal count negative. If the survivor cannot eat both daily meals, the run fails without partially crediting that day. When no replication succeeds, the meals-remaining output explicitly says that no successful runs occurred.

## Testing

Automated tests will cover:

- valid defaults and rejection of malformed or out-of-range inputs;
- all endpoints of every parameter range;
- guaranteed survival with enough food and zero spoilage;
- guaranteed failure with fewer than 60 meals and zero spoilage;
- identical results from identical random seeds;
- lower survival when spoilage is made sufficiently more severe; and
- finite, correctly bounded output values, including the no-success case.

Before submission, the page will also be run at every parameter endpoint and at the suspicious-outcome settings documented in the README.
