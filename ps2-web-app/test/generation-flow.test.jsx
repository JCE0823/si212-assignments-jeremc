import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchPage } from "../src/pages/SearchPage.jsx";
import * as api from "../src/api.js";

const aiPreview = {
  name: "Ethiopian Lentil Stew",
  prepMinutes: 15,
  cookMinutes: 35,
  servings: 4,
  notes: "Serve with crusty bread.",
  source: "ai",
  ingredients: [{ quantity: "1 cup", name: "brown lentils" }],
  instructions: ["Simmer the lentils until tender."]
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

async function searchFor(query) {
  await userEvent.type(screen.getByLabelText(/dish name/i), query);
  await userEvent.click(screen.getByRole("button", { name: /search/i }));
}

describe("AI recipe generation flow", () => {
  it("lets the user edit an AI preview before saving it", async () => {
    vi.spyOn(api, "searchRecipes").mockResolvedValue([]);
    vi.spyOn(api, "generateRecipe").mockResolvedValue(aiPreview);
    const save = vi.spyOn(api, "createRecipe").mockResolvedValue({ ...aiPreview, id: 9 });

    render(<SearchPage />);
    await searchFor("Ethiopian lentil stew");
    await userEvent.click(screen.getByRole("button", { name: /generate recipe/i }));

    expect(await screen.findByText(/review this ai-generated recipe/i)).toBeVisible();
    await userEvent.clear(screen.getByLabelText(/notes/i));
    await userEvent.type(screen.getByLabelText(/notes/i), "Add lemon before serving.");
    expect(save).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: /save recipe/i }));
    expect(save).toHaveBeenCalledWith(expect.objectContaining({
      notes: "Add lemon before serving.",
      source: "ai"
    }));
  });
});
