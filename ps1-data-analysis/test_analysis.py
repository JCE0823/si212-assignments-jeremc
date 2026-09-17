"""Small, hand-checkable datasets for the Problem Set 1 analysis."""

import unittest

import pandas as pd

from analysis import task1_highest_rated, task2_broadest_taste, task3_shared_habits


class AnalysisTests(unittest.TestCase):
    def test_task1_includes_exactly_fifty_ratings(self):
        movies = pd.DataFrame(
            [
                {"movieId": 1, "title": "Forty-nine", "genres": "Drama"},
                {"movieId": 2, "title": "Exactly fifty", "genres": "Drama"},
                {"movieId": 3, "title": "Fifty-one", "genres": "Drama"},
            ]
        )
        ratings = pd.DataFrame(
            [
                {"userId": user, "movieId": movie, "rating": 5.0}
                for movie, count in [(1, 49), (2, 50), (3, 51)]
                for user in range(1, count + 1)
            ]
        )

        result = task1_highest_rated(ratings, movies)

        self.assertEqual({row["movieId"] for row in result}, {2, 3})

    def test_task2_splits_pipe_separated_genres(self):
        movies = pd.DataFrame(
            [
                {"movieId": 1, "title": "First", "genres": "Animation|Children"},
                {"movieId": 2, "title": "Second", "genres": "Drama"},
            ]
        )
        ratings = pd.DataFrame(
            [
                {"userId": 1, "movieId": 1, "rating": 4.0},
                {"userId": 1, "movieId": 2, "rating": 4.0},
            ]
        )

        result = task2_broadest_taste(ratings, movies)

        self.assertEqual(result, [{"userId": 1, "genre_count": 3}])

    def test_task2_includes_twenty_five_but_excludes_twenty_six(self):
        rows = []
        movie_rows = []
        movie_id = 1
        for user_id, count in [(24, 24), (25, 25), (26, 26)]:
            for _ in range(count):
                rows.append({"userId": user_id, "movieId": movie_id, "rating": 4.0})
                movie_rows.append(
                    {"movieId": movie_id, "title": f"Movie {movie_id}", "genres": "Drama"}
                )
                movie_id += 1
        ratings = pd.DataFrame(rows)
        movies = pd.DataFrame(movie_rows)

        result = task2_broadest_taste(ratings, movies)

        self.assertEqual({row["userId"] for row in result}, {24, 25})

    def test_task3_raw_count_and_jaccard_rank_different_pairs(self):
        pair_a_first = set(range(1, 56))
        pair_a_second = set(range(1, 11)) | set(range(56, 101))
        pair_b_first = set(range(1001, 1010))
        pair_b_second = set(range(1001, 1009)) | {1010}
        ratings = pd.DataFrame(
            [
                {"userId": user_id, "movieId": movie_id, "rating": 4.0}
                for user_id, movies in [
                    (1, pair_a_first),
                    (2, pair_a_second),
                    (3, pair_b_first),
                    (4, pair_b_second),
                ]
                for movie_id in movies
            ]
        )

        result = task3_shared_habits(ratings)

        self.assertEqual(result["naive"][0]["users"], [1, 2])
        self.assertEqual(result["naive"][0]["movies_in_common"], 10)
        self.assertEqual(result["alternative"]["pairs"][0]["users"], [3, 4])
        self.assertAlmostEqual(result["alternative"]["pairs"][0]["score"], 0.8)


if __name__ == "__main__":
    unittest.main()
