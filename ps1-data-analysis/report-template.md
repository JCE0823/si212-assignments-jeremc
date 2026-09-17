# MovieLens analysis

## Task 1. Highest rated movies

{{TASK1_TABLE}}

This looks plausible because every movie shown has at least 50 ratings, so the result is not
being driven by only a few people. The top movie has 317 ratings and an average of about 4.4,
which is very good without looking suspiciously perfect.

## Task 2. Broadest taste

{{TASK2_TABLE}}

This result seems possible because one movie can belong to several genres, so a user who rated
21 or 22 movies could cover 17 different genres. I am less certain about this result than Task
1, because the output alone cannot show whether the pipe-separated genre lists were split and
counted correctly; that needs a small test dataset.

## Task 3. User pairs with shared viewing habits

### The naive measure: movies rated by both

{{TASK3_NAIVE_TABLE}}

### Why this might give an uninteresting result
The raw count favors users who rated a very large number of movies. A prolific user such as
414 can match with many different people simply because there are many chances for overlap,
even when the shared movies are only a modest part of either person's overall viewing. This
can hide two users whose smaller, niche movie lists are very similar to each other.

### An alternative measure

{{TASK3_ALTERNATIVE_TABLE}}

This alternative seems more useful because sharing more movies does not necessarily mean two
users have similar taste; they may simply both watch and rate many movies. Dividing the shared
movies by all movies rated by either user measures how much of their viewing actually overlaps.
The result can favor users with smaller movie lists, because sharing a modest number of movies
can represent a large proportion of a small combined list.


