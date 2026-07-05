import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

process.env.DATABASE_URL ||= "file:./dev.db";

const prismaCli = fileURLToPath(import.meta.resolve("prisma/build/index.js"));
const result = spawnSync(process.execPath, [prismaCli, "generate"], {
  stdio: "inherit",
  env: process.env,
});

process.exit(result.status ?? 1);
