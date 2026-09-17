# MovieLens analysis

## Task 1. Highest rated movies

| Rank | Movie | Ratings | Average rating |
| --- | --- | --- | --- |
| 1 | Shawshank Redemption, The (1994) | 317 | 4.429 |
| 2 | Godfather, The (1972) | 192 | 4.289 |
| 3 | Fight Club (1999) | 218 | 4.273 |
| 4 | Cool Hand Luke (1967) | 57 | 4.272 |
| 5 | Dr. Strangelove or: How I Learned to Stop Worrying and Love the Bomb (1964) | 97 | 4.268 |
| 6 | Rear Window (1954) | 84 | 4.262 |
| 7 | Godfather: Part II, The (1974) | 129 | 4.260 |
| 8 | Departed, The (2006) | 107 | 4.252 |
| 9 | Goodfellas (1990) | 126 | 4.250 |
| 10 | Casablanca (1942) | 100 | 4.240 |

This looks plausible because every movie shown has at least 50 ratings, so the result is not
being driven by only a few people. The top movie has 317 ratings and an average of about 4.4,
which is very good without looking suspiciously perfect.

## Task 2. Broadest taste

| Rank | User | Different genres |
| --- | --- | --- |
| 1 | 127 | 17 |
| 2 | 478 | 17 |
| 3 | 507 | 17 |

This result seems possible because one movie can belong to several genres, so a user who rated
21 or 22 movies could cover 17 different genres. I am less certain about this result than Task
1, because the output alone cannot show whether the pipe-separated genre lists were split and
counted correctly; that needs a small test dataset.

## Task 3. User pairs with shared viewing habits

### The naive measure: movies rated by both

| Rank | Users | Movies in common |
| --- | --- | --- |
| 1 | 414 and 599 | 1338 |
| 2 | 414 and 474 | 1077 |
| 3 | 68 and 414 | 950 |
| 4 | 414 and 448 | 914 |
| 5 | 274 and 414 | 856 |

### Why this might give an uninteresting result
The raw count favors users who rated a very large number of movies. A prolific user such as
414 can match with many different people simply because there are many chances for overlap,
even when the shared movies are only a modest part of either person's overall viewing. This
can hide two users whose smaller, niche movie lists are very similar to each other.

### An alternative measure

| Rank | Users | Jaccard score |
| --- | --- | --- |
| 1 | 130 and 145 | 0.7000 |
| 2 | 130 and 574 | 0.7000 |
| 3 | 130 and 468 | 0.6944 |
| 4 | 126 and 379 | 0.6818 |
| 5 | 242 and 468 | 0.6585 |

This alternative seems more useful because sharing more movies does not necessarily mean two
users have similar taste; they may simply both watch and rate many movies. Dividing the shared
movies by all movies rated by either user measures how much of their viewing actually overlaps.
The result can favor users with smaller movie lists, because sharing a modest number of movies
can represent a large proportion of a small combined list.


