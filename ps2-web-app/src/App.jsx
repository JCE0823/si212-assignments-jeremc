import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { SearchPage } from "./pages/SearchPage.jsx";
import { RecipesPage } from "./pages/RecipesPage.jsx";

export function App() {
  return (
    <BrowserRouter>
      <div>
        <header>
          <nav aria-label="Main navigation">
            <Link to="/">Search</Link>
            <Link to="/recipes">My Recipes</Link>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<SearchPage />} />
            <Route path="/recipes" element={<RecipesPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
