# Cooking Saver

Cooking Saver is a local recipe finder and notebook. Search saved recipes by a full or partial dish name, open a recipe to record a view, and manage your collection from My Recipes. When AI generation is configured, a missing recipe can be generated as an editable preview before it is saved.

## Setup
1. Run `npm install`.
2. Copy `.env.example` to `.env`.
3. Set `UMGPT_API_KEY` and `UMGPT_MODEL` for AI generation.

Saved-recipe features still work without AI configuration. The `.env` file contains local secrets and must never be committed.

## Start
Run `npm start`, then open the printed localhost address.

## Test
Run `npm test`.

## Main features
- Search using a full or partial dish name.
- Open a saved recipe to record a persistent view.
- Generate and review a missing recipe before saving it.
- Use My Recipes to add, edit, and delete recipes.
