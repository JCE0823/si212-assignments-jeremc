# Cooking Saver Design

## Purpose

Cooking Saver is a local web app for finding and keeping recipes. A user searches for a dish by entering all or part of its name. The app returns saved matches from its own database. If no recipe matches, the user may ask U-M GPT to generate one, review and edit the result, and decide whether to save it.

The app is designed for one user on one computer. It will run locally for Problem Set 2 and remain suitable for public deployment in Problem Set 3.

## Required outcomes

Cooking Saver will satisfy the assignment requirements as follows:

- Users can create, edit, and delete recipes.
- Searching reads the saved recipes and uses them to find and display a useful result rather than merely listing every database row.
- The app automatically records how many times each recipe is viewed, and that count survives a restart.
- `npm start`, run from `ps2-web-app`, starts the complete application.
- `npm test`, run from `ps2-web-app`, runs the automated tests.
- A test writes through the HTTP API, restarts the server process, reads through the HTTP API, and proves that saved data survives.

## Architecture

The application will use three layers:

1. A React interface for search, recipe display, generation review, and recipe management.
2. A Node and Express server that serves the built React application and exposes the HTTP API.
3. A SQLite database that stores recipes, ingredients, instructions, and view counts.

One Express process will serve both the API and the built React files. This avoids coordinating separate production servers, gives the application one port, and makes the required one-command startup and future deployment straightforward.

Only the Express server will communicate with U-M GPT. The API key will come from a local environment variable in a `.env` file. The `.env` file will be excluded from Git and the key will never be sent to the browser or committed to the repository.

## Interface

The React application will have two main pages.

### Search

The home page will center on a search field. Searches will be partial and case-insensitive. If exactly one saved recipe matches, the app will display it. If several recipes match, the app will show a concise set of results from which the user can choose.

If no saved recipe matches, the page will offer to generate one with U-M GPT. A generated recipe will appear in an editable preview and will not be saved automatically. The user can approve and save it, revise it before saving, or discard it.

A displayed recipe will show its name, ingredients with quantities, numbered instructions, preparation time, cooking time, servings, optional notes, source, and view count.

### My Recipes

The My Recipes page will let the user browse saved recipes and add, edit, or delete them. Recipe forms will support the same fields used in generated recipe previews. Deletion will require an explicit confirmation in the interface.

## Main data flow

1. The user submits a dish name from the Search page.
2. React requests matching recipes from the Express API.
3. Express searches SQLite using partial, case-insensitive matching.
4. For a chosen saved recipe, Express increments its view count in SQLite and returns the complete recipe.
5. If there are no matches, React offers AI generation.
6. When the user accepts, Express sends the dish name and a structured recipe request to U-M GPT.
7. Express validates the generated response and returns it as an unsaved preview.
8. The user edits, saves, or discards the preview.
9. Saving sends the reviewed recipe through the normal recipe-creation API and writes it to SQLite.

Viewing a recipe, not merely seeing it in search results, will increment the view count.

## Data model

The database will use related tables with foreign keys enabled.

### Recipes

- `id`: primary key
- `name`: required dish name
- `prep_minutes`: nonnegative integer
- `cook_minutes`: nonnegative integer
- `servings`: positive integer
- `notes`: optional text
- `source`: `starter`, `manual`, or `ai`
- `view_count`: nonnegative integer, initially zero
- `created_at`: creation timestamp
- `updated_at`: last-update timestamp

### Ingredients

- `id`: primary key
- `recipe_id`: recipe foreign key
- `position`: order within the recipe
- `quantity`: quantity and unit as user-facing text
- `name`: ingredient name

### Instructions

- `id`: primary key
- `recipe_id`: recipe foreign key
- `position`: step number
- `text`: instruction text

Deleting a recipe will cascade to its ingredients and instructions. The application will seed a small starter collection only when initializing an empty database.

## HTTP API

The server will provide endpoints with these responsibilities:

- Search recipes by partial name.
- Fetch one complete recipe and record its view.
- Create a reviewed recipe.
- Update a saved recipe.
- Delete a saved recipe.
- Request an AI-generated recipe preview without saving it.

API responses will use JSON. Validation errors will return clear field-level messages. The React interface will use these messages to preserve the user's current input and explain what needs correction.

## AI generation

The generation request will instruct U-M GPT to return structured recipe data containing exactly the fields the application supports. The server will parse and validate that response before returning it to React.

AI-generated recipes will be labeled as such. The preview will remind users to review ingredients, allergy concerns, food-safety guidance, and cooking times. A failed, timed-out, malformed, or incomplete AI response will never be written to SQLite. The interface will explain the failure and allow a retry.

Automated tests will use a fake generator rather than contacting U-M GPT, so the test suite requires no API key and incurs no cost.

## Validation and errors

The server will validate all recipe writes, whether they come from manual forms or AI previews. A valid recipe requires a nonempty name, at least one ingredient, at least one instruction, nonnegative preparation and cooking times, and at least one serving.

Database failures will produce a general error without exposing internal details. The interface will retain search text and unsaved form content where practical and offer the user a retry. Missing AI configuration will disable generation with a setup message while leaving saved-recipe features usable.

## Testing

`npm test` will use an isolated temporary SQLite database and cover:

- Creating, retrieving, updating, and deleting recipes through the HTTP API.
- Partial, case-insensitive search and multiple-result behavior.
- Incrementing a view count only when a recipe is opened.
- Persisting the view count across server restarts.
- Rejecting invalid recipe writes.
- Successful and failed generation behavior through a fake AI service.
- The React search-results and generate-review-save interactions where interface-level coverage adds value.

The required restart test will launch the real server as a child process with a temporary database path, create a recipe through the HTTP API, stop the process, launch a new server process with the same database, retrieve the recipe through the HTTP API, and assert that the recipe remains. The test will also open the recipe before the restart and verify afterward that the automatically recorded view count remains.

## Startup and documentation

From `ps2-web-app`, `npm start` will build the React application if needed and start the Express server that serves both the interface and API. The README will describe the app, required environment setup, startup command, and steps for exercising search, generation review, and recipe management. It will not contain an API key.

The student will complete `REFLECTION.md` by hand after implementation, as required by the assignment.
