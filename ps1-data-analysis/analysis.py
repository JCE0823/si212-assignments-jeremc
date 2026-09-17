"""Analyze the MovieLens data and generate results.json and report.md."""

from __future__ import annotations

import json
from itertools import combinations
from pathlib import Path

import pandas as pd


ROOT = Path(__file__).resolve().parent
DATA = ROOT / "movielens"
NO_GENRE = "(no genres listed)"


def markdown_table(headers: list[str], rows: list[list[object]]) -> str:
    """Return a small Markdown table."""
    header = "| " + " | ".join(headers) + " |"
    divider = "| " + " | ".join("---" for _ in headers) + " |"
    body = ["| " + " | ".join(str(value) for value in row) + " |" for row in rows]
    return "\n".join([header, divider, *body])


def task1_highest_rated(ratings: pd.DataFrame, movies: pd.DataFrame) -> list[dict]:
    summary = (
        ratings.groupby("movieId")["rating"]
        .agg(rating_count="count", average_rating="mean")
        .reset_index()
    )
    eligible = summary.loc[summary["rating_count"] >= 50]
    top = (
        eligible.merge(movies[["movieId", "title"]], on="movieId", how="left")
        .sort_values(
            ["average_rating", "rating_count", "movieId"],
            ascending=[False, False, True],
        )
        .head(10)
    )
    return [
        {
            "movieId": int(row.movieId),
            "title": row.title,
            "rating_count": int(row.rating_count),
            "average_rating": float(row.average_rating),
        }
        for row in top.itertuples(index=False)
    ]


def task2_broadest_taste(ratings: pd.DataFrame, movies: pd.DataFrame) -> list[dict]:
    rating_counts = ratings.groupby("userId").size()
    eligible_users = set(rating_counts.loc[rating_counts <= 25].index)

    movie_genres = {
        int(row.movieId): {
            genre for genre in str(row.genres).split("|") if genre != NO_GENRE
        }
        for row in movies.itertuples(index=False)
    }
    genres_by_user = {int(user_id): set() for user_id in eligible_users}
    for row in ratings.loc[ratings["userId"].isin(eligible_users)].itertuples(index=False):
        genres_by_user[int(row.userId)].update(movie_genres.get(int(row.movieId), set()))

    ranked = sorted(
        ((user_id, len(genres)) for user_id, genres in genres_by_user.items()),
        key=lambda item: (-item[1], item[0]),
    )[:3]
    return [
        {"userId": int(user_id), "genre_count": int(genre_count)}
        for user_id, genre_count in ranked
    ]


def task3_shared_habits(ratings: pd.DataFrame) -> dict:
    movies_by_user = {
        int(user_id): set(group["movieId"].astype(int))
        for user_id, group in ratings.groupby("userId")
    }

    naive_rows: list[tuple[int, int, int]] = []
    jaccard_rows: list[tuple[int, int, float]] = []
    for first, second in combinations(sorted(movies_by_user), 2):
        first_movies = movies_by_user[first]
        second_movies = movies_by_user[second]
        shared = len(first_movies & second_movies)
        if shared == 0:
            continue
        naive_rows.append((first, second, shared))
        union_size = len(first_movies | second_movies)
        jaccard_rows.append((first, second, shared / union_size))

    naive_rows.sort(key=lambda row: (-row[2], row[0], row[1]))
    jaccard_rows.sort(key=lambda row: (-row[2], row[0], row[1]))

    return {
        "naive": [
            {"users": [first, second], "movies_in_common": int(shared)}
            for first, second, shared in naive_rows[:5]
        ],
        "alternative": {
            "measure": (
                "Jaccard similarity: the number of movies both users rated divided by "
                "the number of distinct movies rated by either user."
            ),
            "pairs": [
                {"users": [first, second], "score": float(score)}
                for first, second, score in jaccard_rows[:5]
            ],
        },
    }


def build_report(results: dict) -> str:
    template = (ROOT / "report-template.md").read_text(encoding="utf-8")

    task1_table = markdown_table(
        ["Rank", "Movie", "Ratings", "Average rating"],
        [
            [index, row["title"], row["rating_count"], f'{row["average_rating"]:.3f}']
            for index, row in enumerate(results["task1"], start=1)
        ],
    )
    task2_table = markdown_table(
        ["Rank", "User", "Different genres"],
        [
            [index, row["userId"], row["genre_count"]]
            for index, row in enumerate(results["task2"], start=1)
        ],
    )
    naive_table = markdown_table(
        ["Rank", "Users", "Movies in common"],
        [
            [index, f'{row["users"][0]} and {row["users"][1]}', row["movies_in_common"]]
            for index, row in enumerate(results["task3"]["naive"], start=1)
        ],
    )
    alternative_table = markdown_table(
        ["Rank", "Users", "Jaccard score"],
        [
            [index, f'{row["users"][0]} and {row["users"][1]}', f'{row["score"]:.4f}']
            for index, row in enumerate(results["task3"]["alternative"]["pairs"], start=1)
        ],
    )

    return (
        template.replace("{{TASK1_TABLE}}", task1_table)
        .replace("{{TASK2_TABLE}}", task2_table)
        .replace("{{TASK3_NAIVE_TABLE}}", naive_table)
        .replace("{{TASK3_ALTERNATIVE_TABLE}}", alternative_table)
    )


def main() -> None:
    ratings = pd.read_csv(DATA / "ratings.csv")
    movies = pd.read_csv(DATA / "movies.csv")

    results = {
        "task1": task1_highest_rated(ratings, movies),
        "task2": task2_broadest_taste(ratings, movies),
        "task3": task3_shared_habits(ratings),
    }

    (ROOT / "results.json").write_text(
        json.dumps(results, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    (ROOT / "report.md").write_text(build_report(results), encoding="utf-8")

    print(f"Read {len(ratings)} ratings from {ratings['userId'].nunique()} users.")
    print(f"Read {len(movies)} movies.")
    print("Wrote results.json and report.md.")


if __name__ == "__main__":
    main()
