import express from "express";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRecipeRouter } from "./recipe-routes.js";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export function createApp({ db, generateRecipe } = {}) {
  const app = express();
  app.use(express.json());

  app.get("/api/health", (_request, response) => {
    response.json({ ok: true });
  });

  const distPath = path.join(projectRoot, "dist");
  if (existsSync(distPath)) {
    app.use(express.static(distPath));
  }

  if (db) {
    app.use("/api/recipes", createRecipeRouter({ db }));
  }

  // Keep this option available for the API routes added in later tasks.
  void generateRecipe;

  return app;
}
