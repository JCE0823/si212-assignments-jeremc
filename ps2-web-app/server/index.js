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
  const address = server.address();
  const boundPort = typeof address === "object" && address ? address.port : port;
  console.log(`LISTENING ${boundPort}`);
});

function closeServer() {
  server.close(() => db.close());
}

process.once("SIGINT", closeServer);
process.once("SIGTERM", closeServer);
