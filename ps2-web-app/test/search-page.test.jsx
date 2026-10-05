// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchPage } from "../src/pages/SearchPage.jsx";
import * as api from "../src/api.js";

const recipe = {
  id: 1,
  name: "Recipe",
  prepMinutes: 10,
  cookMinutes: 20,
  servings: 4,
  notes: "Serve warm.",
  source: "manual",
  ingredients: [{ quantity: "2", name: "tomatoes" }],
  instructions: ["Chop the tomatoes."],
  viewCount: 0
};

afterEach(() => vi.restoreAllMocks());

describe("SearchPage", () => {
  it("shows multiple matches and opens the chosen recipe", async () => {
    vi.spyOn(api, "searchRecipes").mockResolvedValue([
      { id: 1, name: "Chicken Alfredo" },
      { id: 2, name: "Chicken Curry" }
    ]);
    vi.spyOn(api, "getRecipe").mockResolvedValue({ ...recipe, name: "Chicken Curry", viewCount: 1 });

    render(<SearchPage />);
    await userEvent.type(screen.getByLabelText(/dish name/i), "chicken");
    await userEvent.click(screen.getByRole("button", { name: /search/i }));
    await userEvent.click(await screen.findByRole("button", { name: "Chicken Curry" }));

    expect(await screen.findByRole("heading", { name: "Chicken Curry" })).toBeVisible();
    expect(screen.getByText(/viewed 1 time/i)).toBeVisible();
  });
});
