import { useState } from "react";

const emptyRecipe = {
  name: "",
  prepMinutes: 0,
  cookMinutes: 0,
  servings: 1,
  notes: "",
  source: "manual",
  ingredients: [{ quantity: "", name: "" }],
  instructions: [""]
};

function formValue(recipe) {
  return {
    ...emptyRecipe,
    ...recipe,
    ingredients: recipe?.ingredients?.length
      ? recipe.ingredients.map((ingredient) => ({ ...ingredient }))
      : [{ quantity: "", name: "" }],
    instructions: recipe?.instructions?.length ? [...recipe.instructions] : [""]
  };
}

export function RecipeForm({
  initialRecipe,
  submitLabel = "Save Recipe",
  onSubmit,
  onCancel
}) {
  const [recipe, setRecipe] = useState(() => formValue(initialRecipe));

  function updateField(field, value) {
    setRecipe((current) => ({ ...current, [field]: value }));
  }

  function updateIngredient(index, field, value) {
    setRecipe((current) => ({
      ...current,
      ingredients: current.ingredients.map((ingredient, ingredientIndex) =>
        ingredientIndex === index ? { ...ingredient, [field]: value } : ingredient
      )
    }));
  }

  function updateInstruction(index, value) {
    setRecipe((current) => ({
      ...current,
      instructions: current.instructions.map((instruction, instructionIndex) =>
        instructionIndex === index ? value : instruction
      )
    }));
  }

  function addIngredient() {
    setRecipe((current) => ({
      ...current,
      ingredients: [...current.ingredients, { quantity: "", name: "" }]
    }));
  }

  function removeIngredient(index) {
    setRecipe((current) => {
      if (current.ingredients.length <= 1) return current;
      return {
        ...current,
        ingredients: current.ingredients.filter((_, ingredientIndex) => ingredientIndex !== index)
      };
    });
  }

  function addInstruction() {
    setRecipe((current) => ({
      ...current,
      instructions: [...current.instructions, ""]
    }));
  }

  function removeInstruction(index) {
    setRecipe((current) => {
      if (current.instructions.length <= 1) return current;
      return {
        ...current,
        instructions: current.instructions.filter((_, instructionIndex) => instructionIndex !== index)
      };
    });
  }

  function submit(event) {
    event.preventDefault();
    onSubmit({
      name: recipe.name,
      prepMinutes: Number(recipe.prepMinutes),
      cookMinutes: Number(recipe.cookMinutes),
      servings: Number(recipe.servings),
      notes: recipe.notes,
      source: recipe.source,
      ingredients: recipe.ingredients.map((ingredient) => ({
        quantity: ingredient.quantity,
        name: ingredient.name
      })),
      instructions: [...recipe.instructions]
    });
  }

  return (
    <form onSubmit={submit}>
      <label htmlFor="recipe-name">Name</label>
      <input
        id="recipe-name"
        name="name"
        value={recipe.name}
        onChange={(event) => updateField("name", event.target.value)}
        required
      />

      <label htmlFor="prep-minutes">Prep minutes</label>
      <input
        id="prep-minutes"
        name="prepMinutes"
        type="number"
        min="0"
        value={recipe.prepMinutes}
        onChange={(event) => updateField("prepMinutes", event.target.value)}
        required
      />

      <label htmlFor="cook-minutes">Cook minutes</label>
      <input
        id="cook-minutes"
        name="cookMinutes"
        type="number"
        min="0"
        value={recipe.cookMinutes}
        onChange={(event) => updateField("cookMinutes", event.target.value)}
        required
      />

      <label htmlFor="servings">Servings</label>
      <input
        id="servings"
        name="servings"
        type="number"
        min="1"
        value={recipe.servings}
        onChange={(event) => updateField("servings", event.target.value)}
        required
      />

      <label htmlFor="notes">Notes</label>
      <textarea
        id="notes"
        name="notes"
        value={recipe.notes}
        onChange={(event) => updateField("notes", event.target.value)}
      />

      <fieldset>
        <legend>Ingredients</legend>
        {recipe.ingredients.map((ingredient, index) => (
          <div key={`ingredient-${index}`}>
            <label htmlFor={`ingredient-quantity-${index}`}>
              Ingredient {index + 1} quantity
            </label>
            <input
              id={`ingredient-quantity-${index}`}
              value={ingredient.quantity}
              onChange={(event) => updateIngredient(index, "quantity", event.target.value)}
              required
            />
            <label htmlFor={`ingredient-name-${index}`}>
              Ingredient {index + 1} name
            </label>
            <input
              id={`ingredient-name-${index}`}
              value={ingredient.name}
              onChange={(event) => updateIngredient(index, "name", event.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => removeIngredient(index)}
              disabled={recipe.ingredients.length <= 1}
            >
              Remove Ingredient
            </button>
          </div>
        ))}
        <button type="button" onClick={addIngredient}>Add Ingredient</button>
      </fieldset>

      <fieldset>
        <legend>Instructions</legend>
        {recipe.instructions.map((instruction, index) => (
          <div key={`instruction-${index}`}>
            <label htmlFor={`instruction-${index}`}>Step {index + 1} instruction</label>
            <textarea
              id={`instruction-${index}`}
              value={instruction}
              onChange={(event) => updateInstruction(index, event.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => removeInstruction(index)}
              disabled={recipe.instructions.length <= 1}
            >
              Remove Step
            </button>
          </div>
        ))}
        <button type="button" onClick={addInstruction}>Add Step</button>
      </fieldset>

      <button type="submit">{submitLabel}</button>
      {onCancel ? (
        <button type="button" onClick={onCancel}>Discard</button>
      ) : null}
    </form>
  );
}
