import { useState } from "react";
import { getRecipe, searchRecipes } from "../api.js";
import { RecipeCard } from "../components/RecipeCard.jsx";

export function SearchPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("idle");
  const [matches, setMatches] = useState([]);
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState("");

  async function submitSearch(event) {
    event.preventDefault();
    setStatus("loading");
    setError("");
    setRecipe(null);

    try {
      const results = await searchRecipes(query);
      setMatches(results);
      setStatus(results.length > 0 ? "matches" : "not-found");
    } catch (requestError) {
      setError(requestError.message);
      setStatus("error");
    }
  }

  async function openRecipe(id) {
    setStatus("loading");
    setError("");

    try {
      const openedRecipe = await getRecipe(id);
      setRecipe(openedRecipe);
      setStatus("recipe");
    } catch (requestError) {
      setError(requestError.message);
      setStatus("error");
    }
  }

  return (
    <section aria-labelledby="search-heading">
      <h1 id="search-heading">Search recipes</h1>
      <form onSubmit={submitSearch}>
        <label htmlFor="dish-name">Dish name</label>
        <input
          id="dish-name"
          name="dishName"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          type="search"
        />
        <button type="submit">Search</button>
      </form>

      {status === "idle" ? <p>Search your saved recipes by dish name.</p> : null}
      {status === "loading" ? <p role="status">Loading…</p> : null}

      {status === "matches" ? (
        <section aria-labelledby="matches-heading">
          <h2 id="matches-heading">Matching recipes</h2>
          <ul>
            {matches.map((match) => (
              <li key={match.id}>
                <button type="button" onClick={() => openRecipe(match.id)}>
                  {match.name}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {status === "recipe" && recipe ? <RecipeCard recipe={recipe} /> : null}

      {status === "not-found" ? (
        <p role="status">No saved recipes matched “{query}”.</p>
      ) : null}

      {status === "error" ? (
        <p role="alert">We couldn’t complete that search. {error}</p>
      ) : null}
    </section>
  );
}
