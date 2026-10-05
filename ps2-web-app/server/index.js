import "dotenv/config";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createApp } from "./app.js";
import { openDatabase } from "./db.js";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const databasePath = path.resolve(projectRoot, process.env.DATABASE_PATH || "./data/cooking-saver.sqlite");
mkdirSync(path.dirname(databasePath), { recursive: true });

const db = openDatabase(databasePath);
const app = createApp({ db });
const port = Number(process.env.PORT || 3000);

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
