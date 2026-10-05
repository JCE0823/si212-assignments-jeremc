import express from "express";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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

  // Keep these options available for the API routes added in later tasks.
  void db;
  void generateRecipe;

  return app;
}
