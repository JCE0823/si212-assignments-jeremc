# Test datasets

One row per way the analysis could be wrong, and the small dataset that would reveal it. The
first row is an example.

| Potential analysis error | Description of artificial dataset |
| --- | --- |
| Task 1's "at least 50 ratings" filter could be implemented incorrectly as *more than 50*, rather than *50 or more*. So a movie with exactly 50 ratings is dropped instead of kept. | Three movies. Every rating in the file is 5.0, so all three have identical averages and the filter is the only thing that can change the answer. One movie has 49 ratings, one has exactly 50, one has 51. The correct result lists the 50 and the 51, but omits the 49. |
| Task 2 could treat a pipe-separated label such as `Animation|Children` as one genre instead of two. | One eligible user rates two movies: one labeled `Animation|Children` and one labeled `Drama`. The correct genre count is 3. Code that does not split the first movie's genres reports only 2. |
| Task 2's "25 or fewer" filter could be implemented as fewer than 25, or could accidentally include users above the limit. | Three users rate 24, 25, and 26 movies. Give their movies distinct genres so their inclusion is visible. The correct eligible users are the ones with 24 and exactly 25 ratings; the user with 26 ratings must be excluded. |
| Task 3's naive count and Jaccard alternative could be implemented so that they rank pairs the same way or divide by the wrong total. | Pair A shares 10 movies but has 100 distinct movies in its combined history. Pair B shares 8 movies but has only 10 distinct movies in its combined history. The naive measure must rank Pair A first, while Jaccard must rank Pair B first because its scores are 0.1 and 0.8 respectively. |

When you asked the agent to create the artificial datasets and run tests, did it find any errors in the analysis you had previously run? How quickly was it able to correct them?

The four artificial datasets did not find any errors in the existing analysis. All four tests
passed on their first run, so no correction was needed.
