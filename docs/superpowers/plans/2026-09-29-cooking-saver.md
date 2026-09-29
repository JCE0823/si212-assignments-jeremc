# Cooking Saver Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local React recipe finder that searches SQLite, manages recipes, records persistent view counts, and generates reviewable recipe drafts through U-M GPT when no saved recipe matches.

**Architecture:** One Express process serves a Vite-built React application and a JSON API. Focused server modules own database setup, recipe persistence, validation, and AI generation; React pages consume only the HTTP API. Production and restart tests use the same server entry point and SQLite behavior as the running app.

**Tech Stack:** JavaScript, Node.js 24, React, Vite, Express, better-sqlite3, Zod, OpenAI-compatible SDK, Vitest, Supertest, React Testing Library

**Spec:** `docs/superpowers/specs/2026-09-29-cooking-saver-design.md`

## Global Constraints

- The project lives in `ps2-web-app`; the spec stays at the repository-level path above.
- `npm start` from `ps2-web-app` builds and starts the complete app on one port.
- `npm test` from `ps2-web-app` runs all automated tests.
- The app uses React, a Node server, and SQLite, all on localhost for PS2.
- Searches are partial and case-insensitive.
- AI output is an editable, unsaved preview until the user explicitly saves it.
- The U-M GPT key stays server-side in `.env`, and `.env` is ignored by Git.
- Viewing a recipe increments a view count that survives process restarts.
- The restart test writes and reads through the HTTP API and restarts the server process between them.
- `REFLECTION.md` remains for the student to complete by hand.

## File map

- `ps2-web-app/package.json` — scripts and dependencies.
- `ps2-web-app/index.html` — Vite entry document.
- `ps2-web-app/.gitignore` and `.env.example` — secret and generated-file policy.
- `ps2-web-app/server/index.js` — process entry point and startup message.
- `ps2-web-app/server/app.js` — Express assembly, API routing, error responses, and static files.
- `ps2-web-app/server/db.js` — SQLite connection, schema, and starter seeding.
- `ps2-web-app/server/recipe-schema.js` — shared server-side recipe validation.
- `ps2-web-app/server/recipe-repository.js` — SQL operations and transaction boundaries.
- `ps2-web-app/server/recipe-routes.js` — recipe HTTP handlers.
- `ps2-web-app/server/ai-generator.js` — U-M GPT request and structured-response validation.
- `ps2-web-app/server/generation-route.js` — unsaved generation-preview endpoint.
- `ps2-web-app/src/main.jsx` and `src/App.jsx` — React startup and route shell.
- `ps2-web-app/src/api.js` — browser HTTP client.
- `ps2-web-app/src/pages/SearchPage.jsx` — search, match choice, recipe display, and generation flow.
- `ps2-web-app/src/pages/RecipesPage.jsx` — saved-recipe management.
- `ps2-web-app/src/components/RecipeCard.jsx` — full recipe display.
- `ps2-web-app/src/components/RecipeForm.jsx` — reusable manual/edit/preview form.
- `ps2-web-app/src/styles.css` — responsive visual system.
- `ps2-web-app/test/*.test.js` — server, persistence, AI, and React behavior tests.
- `ps2-web-app/README.md` — setup, startup, tests, and feature walkthrough.

---

### Task 1: Runnable server, database, and starter recipes

**Files:**
- Create: `ps2-web-app/package.json`
- Create: `ps2-web-app/index.html`
- Create: `ps2-web-app/.gitignore`
- Create: `ps2-web-app/.env.example`
- Create: `ps2-web-app/server/index.js`
- Create: `ps2-web-app/server/app.js`
- Create: `ps2-web-app/server/db.js`
- Create: `ps2-web-app/test/db.test.js`

**Interfaces:**
- Produces: `openDatabase(databasePath): Database`, `createApp(options): Express`, and a server process that prints `LISTENING <port>`.
- Consumes: no earlier task interfaces.

- [ ] **Step 1: Add the project manifest and test dependencies**

Create `package.json` with ESM enabled and these scripts:

```json
{
  "name": "cooking-saver",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "vite build",
    "start": "npm run build && node server/index.js",
    "dev": "vite",
    "test": "vitest run"
  },
  "dependencies": {
    "better-sqlite3": "latest",
    "dotenv": "latest",
    "express": "latest",
    "openai": "latest",
    "react": "latest",
    "react-dom": "latest",
    "react-router-dom": "latest",
    "zod": "latest"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "latest",
    "@testing-library/react": "latest",
    "@testing-library/user-event": "latest",
    "@vitejs/plugin-react": "latest",
    "jsdom": "latest",
    "supertest": "latest",
    "vite": "latest",
    "vitest": "latest"
  }
}
```

Run: `npm install`

Expected: dependencies install and `package-lock.json` is created.

- [ ] **Step 2: Write the failing database initialization test**

```js
import { afterEach, describe, expect, it } from "vitest";
import { openDatabase } from "../server/db.js";

let db;
afterEach(() => db?.close());

describe("openDatabase", () => {
  it("creates the schema and starter recipes in an empty database", () => {
    db = openDatabase(":memory:");
    const recipes = db.prepare("SELECT name, view_count FROM recipes ORDER BY name").all();
    expect(recipes.length).toBeGreaterThanOrEqual(3);
    expect(recipes.every((recipe) => recipe.view_count === 0)).toBe(true);
  });
});
```

- [ ] **Step 3: Run the test and verify the expected failure**

Run: `npm test -- test/db.test.js`

Expected: FAIL because `server/db.js` does not exist.

- [ ] **Step 4: Implement schema creation and idempotent starter seeding**

Implement `openDatabase(databasePath)` using `better-sqlite3`. Enable foreign keys and create `recipes`, `ingredients`, and `instructions` with the fields and cascade behavior in the spec. In one transaction, seed Pancakes, Spaghetti Aglio e Olio, and Vegetable Stir-Fry only when `SELECT COUNT(*) FROM recipes` returns zero.

```js
export function openDatabase(databasePath) {
  const db = new Database(databasePath);
  db.pragma("foreign_keys = ON");
  db.exec(SCHEMA_SQL);
  seedStarterRecipes(db);
  return db;
}
```

Create `.gitignore`:

```gitignore
node_modules/
dist/
.env
*.sqlite
*.sqlite-shm
*.sqlite-wal
coverage/
```

Create `.env.example` without a real secret:

```dotenv
UMGPT_API_KEY=
UMGPT_MODEL=
DATABASE_PATH=./data/cooking-saver.sqlite
PORT=3000
```

Implement `createApp({ db, generateRecipe })` with `express.json()`, `GET /api/health` returning `{ "ok": true }`, and static `dist` serving when that directory exists. Implement `server/index.js` to load `.env`, open `DATABASE_PATH`, create the app, listen on `PORT || 3000`, and print the actual bound port as `LISTENING <port>`.

- [ ] **Step 5: Run the focused test and production startup smoke check**

Run: `npm test -- test/db.test.js`

Expected: PASS.

Run: `npm run build`

Expected: Vite produces `dist` after the minimal `index.html` entry is present.

- [ ] **Step 6: Commit the runnable foundation**

```bash
git add ps2-web-app/package.json ps2-web-app/package-lock.json ps2-web-app/index.html ps2-web-app/.gitignore ps2-web-app/.env.example ps2-web-app/server ps2-web-app/test/db.test.js
git commit -m "build: create Cooking Saver server and database"
```

### Task 2: Recipe validation and CRUD API

**Files:**
- Create: `ps2-web-app/server/recipe-schema.js`
- Create: `ps2-web-app/server/recipe-repository.js`
- Create: `ps2-web-app/server/recipe-routes.js`
- Modify: `ps2-web-app/server/app.js`
- Create: `ps2-web-app/test/recipes-api.test.js`

**Interfaces:**
- Consumes: `openDatabase(databasePath)` and `createApp({ db, generateRecipe })`.
- Produces: `recipeInputSchema`, `createRecipeRepository(db)`, and `/api/recipes` CRUD endpoints.

- [ ] **Step 1: Write failing API tests for create, update, and delete**

```js
const validRecipe = {
  name: "Tomato Soup",
  prepMinutes: 10,
  cookMinutes: 25,
  servings: 4,
  notes: "Serve warm.",
  source: "manual",
  ingredients: [{ quantity: "4", name: "tomatoes" }],
  instructions: ["Chop the tomatoes.", "Simmer until tender."]
};

it("creates, updates, and deletes a complete recipe", async () => {
  const created = await request(app).post("/api/recipes").send(validRecipe).expect(201);
  expect(created.body.name).toBe("Tomato Soup");
  expect(created.body.ingredients).toEqual(validRecipe.ingredients);

  const updated = await request(app)
    .put(`/api/recipes/${created.body.id}`)
    .send({ ...validRecipe, servings: 6 })
    .expect(200);
  expect(updated.body.servings).toBe(6);

  await request(app).delete(`/api/recipes/${created.body.id}`).expect(204);
  await request(app).get(`/api/recipes/${created.body.id}`).expect(404);
});

it("rejects a recipe without ingredients", async () => {
  const response = await request(app)
    .post("/api/recipes")
    .send({ ...validRecipe, ingredients: [] })
    .expect(400);
  expect(response.body.error).toBe("validation_failed");
});
```

- [ ] **Step 2: Run the tests and verify endpoint failures**

Run: `npm test -- test/recipes-api.test.js`

Expected: FAIL with 404 responses because recipe routes are not mounted.

- [ ] **Step 3: Implement exact validation and repository transactions**

Define `recipeInputSchema` with Zod:

```js
export const recipeInputSchema = z.object({
  name: z.string().trim().min(1),
  prepMinutes: z.number().int().nonnegative(),
  cookMinutes: z.number().int().nonnegative(),
  servings: z.number().int().positive(),
  notes: z.string().trim().default(""),
  source: z.enum(["starter", "manual", "ai"]),
  ingredients: z.array(z.object({
    quantity: z.string().trim().min(1),
    name: z.string().trim().min(1)
  })).min(1),
  instructions: z.array(z.string().trim().min(1)).min(1)
});
```

Implement repository methods `list()`, `getById(id)`, `create(input)`, `update(id, input)`, and `remove(id)`. Wrap each multi-table write in `db.transaction()`. Map snake-case SQL columns to the camel-case JSON fields above. Preserve `view_count` when updating recipe content.

- [ ] **Step 4: Implement and mount CRUD routes**

Expose:

```text
GET    /api/recipes
GET    /api/recipes/:id
POST   /api/recipes
PUT    /api/recipes/:id
DELETE /api/recipes/:id
```

Parse numeric IDs strictly. Return `404 { "error": "recipe_not_found" }` for missing records and `400 { "error": "validation_failed", "fields": ... }` for invalid bodies. Do not increment views in `GET /api/recipes/:id` yet; Task 3 owns that behavior.

- [ ] **Step 5: Run API and database tests**

Run: `npm test -- test/db.test.js test/recipes-api.test.js`

Expected: PASS.

- [ ] **Step 6: Commit the CRUD API**

```bash
git add ps2-web-app/server ps2-web-app/test/recipes-api.test.js
git commit -m "feat: add recipe CRUD API"
```

### Task 3: Partial search and persistent view counts

**Files:**
- Modify: `ps2-web-app/server/recipe-repository.js`
- Modify: `ps2-web-app/server/recipe-routes.js`
- Create: `ps2-web-app/test/search-and-views.test.js`

**Interfaces:**
- Consumes: `createRecipeRepository(db)` and the recipe JSON shape from Task 2.
- Produces: `search(query)` and `getByIdAndRecordView(id)` repository methods; `GET /api/recipes/search?q=`.

- [ ] **Step 1: Write failing search and view-count tests**

```js
it("searches by partial name without case sensitivity", async () => {
  await createRecipe(app, { ...validRecipe, name: "Chicken Alfredo" });
  await createRecipe(app, { ...validRecipe, name: "Chicken Curry" });
  const response = await request(app).get("/api/recipes/search?q=CHICKEN").expect(200);
  expect(response.body.map((recipe) => recipe.name)).toEqual([
    "Chicken Alfredo",
    "Chicken Curry"
  ]);
});

it("increments only when a full recipe is opened", async () => {
  const created = await createRecipe(app, validRecipe);
  await request(app).get("/api/recipes/search?q=tomato").expect(200);
  const opened = await request(app).get(`/api/recipes/${created.id}`).expect(200);
  expect(opened.body.viewCount).toBe(1);
  const openedAgain = await request(app).get(`/api/recipes/${created.id}`).expect(200);
  expect(openedAgain.body.viewCount).toBe(2);
});
```

- [ ] **Step 2: Run the tests and verify the failures**

Run: `npm test -- test/search-and-views.test.js`

Expected: FAIL because the search route is missing and views remain zero.

- [ ] **Step 3: Implement escaped partial search and atomic view recording**

Implement search with SQLite `LIKE ... ESCAPE '\\'`, escaping `%`, `_`, and `\` in user input before surrounding it with `%`. Return lightweight result objects containing `id`, `name`, `prepMinutes`, `cookMinutes`, `servings`, `source`, and `viewCount`, ordered by case-insensitive name.

Implement `getByIdAndRecordView(id)` as a transaction:

```js
const getByIdAndRecordView = db.transaction((id) => {
  const changed = db.prepare(
    "UPDATE recipes SET view_count = view_count + 1 WHERE id = ?"
  ).run(id).changes;
  return changed === 0 ? null : getById(id);
});
```

Mount `/search` before `/:id` so Express does not treat `search` as an ID.

- [ ] **Step 4: Run all server tests**

Run: `npm test -- test/db.test.js test/recipes-api.test.js test/search-and-views.test.js`

Expected: PASS.

- [ ] **Step 5: Commit search and activity recording**

```bash
git add ps2-web-app/server/recipe-repository.js ps2-web-app/server/recipe-routes.js ps2-web-app/test/search-and-views.test.js
git commit -m "feat: add recipe search and view tracking"
```

### Task 4: Required process-restart persistence test

**Files:**
- Modify: `ps2-web-app/server/index.js`
- Create: `ps2-web-app/test/restart-persistence.test.js`

**Interfaces:**
- Consumes: the server process protocol `LISTENING <port>` and recipe API from Tasks 1–3.
- Produces: reusable test helpers `startServer(databasePath)` and `stopServer(child)` inside the test file.

- [ ] **Step 1: Write the restart test through the HTTP API**

```js
it("keeps recipe data and app-recorded views after a server restart", async () => {
  const databasePath = join(tempDirectory, "restart.sqlite");
  let server = await startServer(databasePath);

  const created = await postJson(server.url, "/api/recipes", validRecipe);
  const viewed = await getJson(server.url, `/api/recipes/${created.id}`);
  expect(viewed.viewCount).toBe(1);

  await stopServer(server.child);
  server = await startServer(databasePath);

  const afterRestart = await getJson(server.url, `/api/recipes/${created.id}`);
  expect(afterRestart.name).toBe("Tomato Soup");
  expect(afterRestart.viewCount).toBe(2);

  await stopServer(server.child);
});
```

`startServer` must spawn `process.execPath` with `server/index.js`, set `PORT=0` and `DATABASE_PATH` in the child environment, and resolve only after parsing `LISTENING <port>` from stdout. `stopServer` must wait for the child `exit` event after sending the platform-appropriate normal termination signal.

- [ ] **Step 2: Run the restart test and confirm its first failure**

Run: `npm test -- test/restart-persistence.test.js`

Expected: FAIL if `server/index.js` does not report the actual port, close cleanly, or preserve the selected database.

- [ ] **Step 3: Make production startup deterministic and testable**

Ensure `server/index.js` uses `server.address().port` in its startup message and closes the database after the HTTP server closes:

```js
const server = app.listen(port, () => {
  console.log(`LISTENING ${server.address().port}`);
});

function shutdown() {
  server.close(() => {
    db.close();
    process.exit(0);
  });
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
```

- [ ] **Step 4: Run the complete server test suite**

Run: `npm test -- test/db.test.js test/recipes-api.test.js test/search-and-views.test.js test/restart-persistence.test.js`

Expected: PASS, including a real stop and restart between API calls.

- [ ] **Step 5: Commit the restart proof**

```bash
git add ps2-web-app/server/index.js ps2-web-app/test/restart-persistence.test.js
git commit -m "test: prove recipes survive server restart"
```

### Task 5: U-M GPT recipe preview service

**Files:**
- Create: `ps2-web-app/server/ai-generator.js`
- Create: `ps2-web-app/server/generation-route.js`
- Modify: `ps2-web-app/server/app.js`
- Modify: `ps2-web-app/server/index.js`
- Create: `ps2-web-app/test/generation-api.test.js`

**Interfaces:**
- Consumes: `recipeInputSchema` from Task 2.
- Produces: `createAiGenerator({ apiKey, model, baseURL }) -> async (dishName) => RecipeInput` and `POST /api/generate` returning an unsaved recipe preview.

- [ ] **Step 1: Write failing route tests with an injected fake generator**

```js
it("returns a validated unsaved AI preview", async () => {
  const generateRecipe = vi.fn().mockResolvedValue({
    ...validRecipe,
    name: "Ethiopian Lentil Stew",
    source: "ai"
  });
  const app = createApp({ db, generateRecipe });
  const response = await request(app)
    .post("/api/generate")
    .send({ dishName: "Ethiopian lentil stew" })
    .expect(200);
  expect(response.body.id).toBeUndefined();
  expect(response.body.source).toBe("ai");
  expect(db.prepare("SELECT COUNT(*) AS count FROM recipes WHERE source = 'ai'").get().count).toBe(0);
});

it("turns generator failure into a retryable response", async () => {
  const generateRecipe = vi.fn().mockRejectedValue(new Error("timeout"));
  const app = createApp({ db, generateRecipe });
  const response = await request(app)
    .post("/api/generate")
    .send({ dishName: "Soup" })
    .expect(502);
  expect(response.body).toEqual({ error: "generation_failed" });
});
```

- [ ] **Step 2: Run the tests and verify the route is missing**

Run: `npm test -- test/generation-api.test.js`

Expected: FAIL with 404 responses.

- [ ] **Step 3: Implement the unsaved generation route**

Validate `dishName` as a trimmed string of 1–100 characters. Call the injected generator, force `source: "ai"`, validate the complete result with `recipeInputSchema`, and return it without writing to the repository. Return `503 { "error": "generation_unavailable" }` when no generator is configured and `502 { "error": "generation_failed" }` for provider or response failures.

- [ ] **Step 4: Implement the U-M GPT adapter**

Create an OpenAI-compatible client with:

```js
const client = new OpenAI({
  apiKey,
  baseURL: "https://api.toolkit.umgpt.umich.edu/v1"
});
```

Require both `UMGPT_API_KEY` and `UMGPT_MODEL` for production generation. Ask the selected model for JSON matching the recipe fields exactly, parse the returned JSON, and pass it through `recipeInputSchema`. The prompt must say that quantities belong in `quantity`, ingredient names belong in `name`, instructions are short ordered strings, times are integer minutes, and the model must not add unsupported fields.

- [ ] **Step 5: Run AI tests without using the network**

Run: `npm test -- test/generation-api.test.js`

Expected: PASS, with the fake generator proving that no API key or paid request is used by tests.

- [ ] **Step 6: Commit generation support**

```bash
git add ps2-web-app/server ps2-web-app/test/generation-api.test.js
git commit -m "feat: add reviewable AI recipe generation"
```

### Task 6: React search, results, and recipe display

**Files:**
- Create: `ps2-web-app/src/main.jsx`
- Create: `ps2-web-app/src/App.jsx`
- Create: `ps2-web-app/src/api.js`
- Create: `ps2-web-app/src/pages/SearchPage.jsx`
- Create: `ps2-web-app/src/pages/RecipesPage.jsx`
- Create: `ps2-web-app/src/components/RecipeCard.jsx`
- Create: `ps2-web-app/test/setup.js`
- Create: `ps2-web-app/test/search-page.test.jsx`
- Modify: `ps2-web-app/package.json`
- Modify: `ps2-web-app/index.html`

**Interfaces:**
- Consumes: `GET /api/recipes/search?q=` and `GET /api/recipes/:id`.
- Produces: `searchRecipes(query)`, `getRecipe(id)`, `SearchPage`, and `RecipeCard`.

- [ ] **Step 1: Configure jsdom and write the failing search-page test**

Configure Vitest with `environment: "jsdom"` for `*.test.jsx` and load `@testing-library/jest-dom` from `test/setup.js`.

```jsx
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
```

- [ ] **Step 2: Run the component test and verify the import failure**

Run: `npm test -- test/search-page.test.jsx`

Expected: FAIL because the React modules do not exist.

- [ ] **Step 3: Implement the browser API client and search states**

`src/api.js` must centralize JSON requests and throw an error containing the server's `error` code for non-2xx responses. `SearchPage` must represent explicit `idle`, `loading`, `matches`, `recipe`, `not-found`, and `error` states. Keep the typed query when a request fails.

`RecipeCard` must render ingredients, numbered instructions, preparation and cooking times, servings, notes when present, source label, and `Viewed N time(s)`.

- [ ] **Step 4: Add the React route shell**

Use `BrowserRouter` with navigation links and these routes:

```jsx
<Routes>
  <Route path="/" element={<SearchPage />} />
  <Route path="/recipes" element={<RecipesPage />} />
</Routes>
```

Create `RecipesPage` with a heading and a short empty-state message stating that recipe management is coming in the next task; Task 8 replaces that complete component.

- [ ] **Step 5: Run the component and server tests**

Run: `npm test -- test/search-page.test.jsx`

Expected: PASS.

Run: `npm run build`

Expected: PASS and `dist/index.html` is created.

- [ ] **Step 6: Commit the searchable React interface**

```bash
git add ps2-web-app/src ps2-web-app/test/setup.js ps2-web-app/test/search-page.test.jsx ps2-web-app/package.json ps2-web-app/index.html
git commit -m "feat: add recipe search interface"
```

### Task 7: Generate, review, edit, and save an AI preview

**Files:**
- Create: `ps2-web-app/src/components/RecipeForm.jsx`
- Modify: `ps2-web-app/src/api.js`
- Modify: `ps2-web-app/src/pages/SearchPage.jsx`
- Create: `ps2-web-app/test/generation-flow.test.jsx`

**Interfaces:**
- Consumes: `POST /api/generate`, `POST /api/recipes`, and the recipe input shape.
- Produces: `generateRecipe(dishName)`, `createRecipe(recipe)`, and reusable `RecipeForm({ initialRecipe, submitLabel, onSubmit, onCancel })`.

- [ ] **Step 1: Write the failing review-before-save test**

```jsx
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
```

- [ ] **Step 2: Run the test and verify the missing controls**

Run: `npm test -- test/generation-flow.test.jsx`

Expected: FAIL because generation and preview UI are absent.

- [ ] **Step 3: Implement the reusable recipe form**

The form must expose labeled controls for name, prep minutes, cook minutes, servings, notes, every ingredient quantity/name pair, and every instruction. Include Add/Remove Ingredient and Add/Remove Step buttons while preventing removal of the final row. Convert numeric inputs to numbers before calling `onSubmit`.

- [ ] **Step 4: Implement the not-found generation flow**

When search returns no matches, show `Generate recipe for “<query>”`. While generating, disable duplicate submissions. On success, render the editable form with a visible AI review and food-safety notice. Saving must call the normal creation endpoint; discarding must return to the not-found state without writing. Display retry controls for `generation_failed` and setup guidance for `generation_unavailable`.

- [ ] **Step 5: Run generation UI and API tests**

Run: `npm test -- test/generation-flow.test.jsx test/generation-api.test.js`

Expected: PASS.

- [ ] **Step 6: Commit the generation review flow**

```bash
git add ps2-web-app/src ps2-web-app/test/generation-flow.test.jsx
git commit -m "feat: add AI recipe review and save flow"
```

### Task 8: My Recipes management page

**Files:**
- Modify: `ps2-web-app/src/pages/RecipesPage.jsx`
- Modify: `ps2-web-app/src/api.js`
- Modify: `ps2-web-app/src/App.jsx`
- Create: `ps2-web-app/test/recipes-page.test.jsx`

**Interfaces:**
- Consumes: `GET/POST/PUT/DELETE /api/recipes` and `RecipeForm`.
- Produces: `listRecipes()`, `updateRecipe(id, recipe)`, `deleteRecipe(id)`, and `RecipesPage`.

- [ ] **Step 1: Write failing management tests**

```jsx
it("edits a saved recipe", async () => {
  vi.spyOn(api, "listRecipes").mockResolvedValue([summary]);
  vi.spyOn(api, "getRecipe").mockResolvedValue(recipe);
  const update = vi.spyOn(api, "updateRecipe").mockResolvedValue({ ...recipe, servings: 6 });
  render(<RecipesPage />);
  await userEvent.click(await screen.findByRole("button", { name: /edit tomato soup/i }));
  await userEvent.clear(screen.getByLabelText(/servings/i));
  await userEvent.type(screen.getByLabelText(/servings/i), "6");
  await userEvent.click(screen.getByRole("button", { name: /save changes/i }));
  expect(update).toHaveBeenCalledWith(recipe.id, expect.objectContaining({ servings: 6 }));
});

it("requires confirmation before deleting", async () => {
  vi.spyOn(api, "listRecipes").mockResolvedValue([summary]);
  const remove = vi.spyOn(api, "deleteRecipe").mockResolvedValue();
  render(<RecipesPage />);
  await userEvent.click(await screen.findByRole("button", { name: /delete tomato soup/i }));
  expect(remove).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole("button", { name: /yes, delete/i }));
  expect(remove).toHaveBeenCalledWith(summary.id);
});
```

- [ ] **Step 2: Run the tests and verify the incomplete-page failure**

Run: `npm test -- test/recipes-page.test.jsx`

Expected: FAIL because the management page is not implemented.

- [ ] **Step 3: Implement list, manual creation, and editing**

Show saved recipe summaries with source and view count. Provide an Add Recipe action that opens an empty `RecipeForm` with `source: "manual"`. Editing must fetch the full recipe and reuse the same form. After a successful write, refresh the list and show a concise success message.

- [ ] **Step 4: Implement explicit delete confirmation**

The first Delete action must open a confirmation panel naming the recipe. Only `Yes, delete` calls the API; Cancel closes the panel. On API failure, keep the recipe visible and show a retryable error.

- [ ] **Step 5: Run page and full test suites**

Run: `npm test -- test/recipes-page.test.jsx`

Expected: PASS.

Run: `npm test`

Expected: all tests PASS.

- [ ] **Step 6: Commit recipe management**

```bash
git add ps2-web-app/src ps2-web-app/test/recipes-page.test.jsx
git commit -m "feat: add saved recipe management"
```

### Task 9: Responsive styling and complete handoff documentation

**Files:**
- Create: `ps2-web-app/src/styles.css`
- Modify: `ps2-web-app/src/main.jsx`
- Create: `ps2-web-app/README.md`
- Modify: `ps2-web-app/.env.example`
- Create: `ps2-web-app/test/app.test.jsx`
- Test: all `ps2-web-app/test/*`

**Interfaces:**
- Consumes: every user-visible component and command from Tasks 1–8.
- Produces: a readable responsive interface and exact setup/run instructions.

- [ ] **Step 1: Add a smoke assertion for accessible navigation**

```jsx
it("offers navigation to search and recipe management", () => {
  render(<App />);
  expect(screen.getByRole("link", { name: /search/i })).toHaveAttribute("href", "/");
  expect(screen.getByRole("link", { name: /my recipes/i })).toHaveAttribute("href", "/recipes");
});
```

- [ ] **Step 2: Run the smoke test before final styling**

Run: `npm test -- test/app.test.jsx`

Expected: FAIL until the test file and accessible shell are finalized.

- [ ] **Step 3: Apply the visual system**

Create mobile-first CSS with a warm food-inspired palette, a centered content width, clear keyboard focus indicators, readable form spacing, responsive ingredient rows, distinct primary/destructive buttons, and cards for search matches and recipes. Respect `prefers-reduced-motion`. Import the stylesheet once from `main.jsx`.

- [ ] **Step 4: Write the README**

Document exactly:

```markdown
# Cooking Saver

## Setup
1. Run `npm install`.
2. Copy `.env.example` to `.env`.
3. Set `UMGPT_API_KEY` and `UMGPT_MODEL` for AI generation.

## Start
Run `npm start`, then open the printed localhost address.

## Test
Run `npm test`.

## Main features
- Search using a full or partial dish name.
- Open a saved recipe to record a persistent view.
- Generate and review a missing recipe before saving it.
- Use My Recipes to add, edit, and delete recipes.
```

Also explain that saved-recipe features still work without AI configuration and that `.env` must never be committed.

- [ ] **Step 5: Verify every assignment command and repository check**

Run: `npm test`

Expected: all tests PASS, including the process-restart test.

Run: `npm start`

Expected: build succeeds and the server prints `LISTENING <port>`; manually open the printed URL and exercise search, a saved recipe view, an AI preview when configured, manual creation, editing, and deletion.

Run: `git status --short`

Expected: only the intended Task 9 files are modified; `.env`, SQLite files, `dist`, and `node_modules` are absent.

- [ ] **Step 6: Commit the finished experience and documentation**

```bash
git add ps2-web-app/src/styles.css ps2-web-app/src/main.jsx ps2-web-app/README.md ps2-web-app/.env.example ps2-web-app/test/app.test.jsx
git commit -m "docs: finish Cooking Saver experience"
```

## Completion check

After Task 9, verify the following against the spec:

- Search supports partial, case-insensitive matching and multiple choices.
- Opening a recipe increments a persistent view count.
- Manual and AI-reviewed recipes support create, edit, and delete.
- AI failure never saves partial data, and saved-recipe features remain usable.
- The API key exists only in the ignored `.env` file.
- `npm test` passes, including the real process-restart API test.
- `npm start` builds and serves the complete application.
- The README explains setup and the main features.
- The student, not the agent, completes `REFLECTION.md`.
