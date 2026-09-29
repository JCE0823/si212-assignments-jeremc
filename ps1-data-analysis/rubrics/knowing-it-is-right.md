# Rubrics: Knowing it is right

Answers for `tasks/knowing-it-is-right.md`. **Do not read this before attempting the
questions.**

### q-missing-filter

- **type:** free
- **answer:** the top of the list fills with movies that have very few ratings, often a single
  5.0, so the visible signature is a run of perfect or near-perfect averages attached to titles
  nobody recognises. It is spottable from the output because a 5.0 average is not something
  fifty independent raters produce, and because the rating counts, if the report shows them,
  are 1 or 2 rather than 50-odd.
- **credit:** full credit needs both halves: (a) the top fills with tiny-count movies at the
  ceiling, and (b) something in the output itself that gives it away, a 5.0 average, a rating
  count of one, or unrecognisable titles. Half credit for one of the two. Do not require the
  word "threshold", and accept "movies rated by one person" as (a).



### q-undatasettable

- **type:** free
- **answer:** in the expected results, which come from your own reading of the task. Each row's
  right-hand column says what the correct answer should be, and you wrote it. A test can only
  catch a disagreement between the code and that expectation, so if you misread what the task
  asks, or misunderstood what a column in the data means, the code and the test data share the
  misreading, agree with each other, and pass. Concrete instances: computing the right answer to
  the wrong question, or both the code and the test data sharing a wrong belief about what
  `genres` contains.
- **credit:** full credit for both halves: the problem is in the expectation (your understanding
  of the task or of the data), and the tests were built from that same expectation, so they
  cannot disagree with it. Half credit for a concrete example of a misreading with no account of
  why the tests pass anyway. No credit for another implementation error or a row nobody thought
  of, which the question has already ruled out, or for errors in the data, which it has also
  ruled out.


### q-different-language

- **type:** free
- **answer:** independence. A different language forces different libraries and different
  idioms, so a bug that lives in the tooling rather than in the logic cannot replicate: a
  groupby that silently drops nulls, a shared helper, the same off-by-one idiom reached for
  twice. A second Python version tends to reuse the same functions and the same mental model,
  which is most of what you were trying to test.
- **credit:** full credit for the independence point in any wording, that it breaks the shared
  library or shared idiom failure mode. Accept "so it cannot just copy the same approach". Half
  credit for "to check the answer twice" with no mechanism.


### q-similarity-definition

- **type:** free
- **answer:** for example, Jaccard similarity: the number of movies both users rated, divided by
  the number of movies either of them rated. The naive count grows with how many movies each
  user rated, so it mostly measures how active the two users are: all five naive top pairs
  include user 414, who rated 2,698 movies, and every user in them is among the seven heaviest
  raters. Two users who share a small niche can never reach counts like that. Dividing by the
  size of their two lists asks what share of their viewing they have in common, so a pair of
  light raters can come out on top.
- **credit:** the measure is the student's own, so grade the reasoning, not the choice. Full
  credit needs both halves: (a) a measure defined precisely enough to compute, which for a ratio
  means saying what it is divided by, and (b) why it is more interesting: the naive count
  rewards users who rated a lot, and the alternative corrects for how many movies each user
  rated, or counts a shared rare movie for more than a shared popular one. Half credit for one
  of the two. Jaccard, cosine on the sets of movies rated, and the overlap coefficient (movies in
  common over the smaller list) are the common choices, and any is fine. Half credit for (a) for
  "the percentage in common" that does not say of what. No credit for (b) if the measure cannot
  change the ranking, such as the count divided by the number of movies in the dataset, or if
  it only repeats the hint's conclusion, that it surfaces the niche pair, without the reason it
  would.
