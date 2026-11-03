// Builds a PUBLIC PREVIEW bundle: safe mode forced on, noindex, robots.txt disallow-all.
import { spawnSync } from "node:child_process";
import fs from "node:fs";

const env = { ...process.env, VITE_RS_PREVIEW: "1" };
delete env.VITE_RS_ALLOW_LIVE;
const result = spawnSync("npx", ["vite", "build"], { stdio: "inherit", env, shell: true });
if (result.status !== 0) process.exit(result.status ?? 1);
fs.writeFileSync("dist/client/robots.txt", "User-agent: *\nDisallow: /\n");
console.log("preview build ready (dist/), robots.txt = Disallow all");
