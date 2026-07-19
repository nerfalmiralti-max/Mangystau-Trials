import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

process.env.DATABASE_URL ||=
  "postgresql://prisma:prisma@localhost:5432/mangystau_trails?schema=public";
process.env.DIRECT_URL ||= process.env.DATABASE_URL;

const prismaCli = fileURLToPath(import.meta.resolve("prisma/build/index.js"));
const command = process.argv[2] === "validate" ? "validate" : "generate";
const result = spawnSync(process.execPath, [prismaCli, command], {
  stdio: "inherit",
  env: process.env,
});

process.exit(result.status ?? 1);
