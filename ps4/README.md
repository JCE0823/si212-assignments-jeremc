# Zombie shelter food simulation

## Question

How does the amount of food in a zombie shelter affect the chance that one survivor reaches 30 days?

## How to run

From a fresh clone, open `ps4/index.html` in a web browser. Enter values for the four inputs and select **Run**. The page needs no installation or server.

## The model

Each simulated run follows one survivor for at most 30 days, starting with the chosen number of stored meals. At the start of each day, spoilage happens with the chosen daily chance. If it happens, the chosen number of meals is lost, up to the food that remains. If fewer than two meals remain, the survivor does not survive that day. Otherwise, the survivor eats two meals and survives one more day. Reaching 30 days counts as surviving.

The model uses a new random spoilage check each day. It follows one survivor and assumes this survivor needs two meals each day. It leaves out new food, different appetites, and other dangers. It also does not model what happens after 30 days.

## Parameters and outputs

| parameter | range | default | meaning |
| --------- | ----- | ------- | ------- |
| Meals stored | 0 to 120 whole meals | 60 | Food available to the survivor at the start. |
| Daily chance of spoilage | 0 to 20 percent | 5 | Chance spoilage occurs on each day. |
| Meals lost when spoilage occurs | 1 to 10 whole meals | 3 | Number of meals removed when spoilage occurs, up to the amount remaining. |
| Runs to simulate | 10 to 20,000 whole runs | 2,000 | Number of independent 30-day runs used for the estimates. |

| output | what it is | spread shown |
| ------ | ---------- | ------------ |
| Survived all 30 days | Fraction of runs that reach day 30. | 95% Wilson score interval for the estimated fraction. |
| Days survived | Average number of days survived, counting a successful run as 30. | Middle 80% of runs, from the 10th to the 90th percentile. |
| Meals remaining after surviving 30 days | Average meals left among runs that survive all 30 days; shows “No successful runs” if none survive. | Middle 80% among successful runs; not applicable if none survive. |

## One suspicious outcome

With 60 meals stored, a 0% daily chance of spoilage, 3 meals lost when spoilage occurs, and 20,000 runs, I expect the survivor to reach 30 days in every run, average 30 days survived, and have 0 meals remaining. The survivor uses exactly 60 meals over 30 days. Any run that ends early or has food left would make me suspect a mistake.

## Answer

I ran 20,000 simulations for each setting, with a 5% daily spoilage chance and 3 meals lost when spoilage happens. With 60 starting meals (seed 11), the survivor reached all 30 days in 21.5% of runs; the 95% interval was 21.0% to 22.1%. The survivor lasted 27.7 days on average, and successful runs ended with 0.0 meals on average. With 70 meals (seed 12), the survivor reached 30 days in 94.0% of runs (95% interval 93.7% to 94.4%), lasted 29.9 days on average, and successful runs had 6.0 meals left on average. With 80 meals (seed 13), the survivor reached 30 days in 99.9% of runs (95% interval 99.9% to 100.0%), lasted 30.0 days on average, and successful runs had 15.5 meals left on average.

These runs suggest that having more food makes the survivor's chance of reaching 30 days much higher. With 70 meals, the survivor almost always made it, and with 80 meals the survivor reached 30 days in nearly every run. The remaining-meals average only includes runs where the survivor reached day 30.
