import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

process.env.DATABASE_URL ||=
  "postgresql://prisma:prisma@localhost:5432/mangystau_trails?schema=public";

const prismaCli = fileURLToPath(import.meta.resolve("prisma/build/index.js"));
const result = spawnSync(process.execPath, [prismaCli, "generate"], {
  stdio: "inherit",
  env: process.env,
});

process.exit(result.status ?? 1);
