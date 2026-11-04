// Builds a STAGING bundle: real Shopify cart/checkout, no Meta Pixel, noindex, robots disallow-all.
import { spawnSync } from "node:child_process";
import fs from "node:fs";

const env = { ...process.env, VITE_RS_STAGING: "1" };
delete env.VITE_RS_PREVIEW;
delete env.VITE_RS_ALLOW_LIVE;
const result = spawnSync("npx", ["vite", "build"], { stdio: "inherit", env, shell: true });
if (result.status !== 0) process.exit(result.status ?? 1);
fs.writeFileSync("dist/client/robots.txt", "User-agent: *\nDisallow: /\n");
console.log("staging build ready (dist/): real cart + checkout, no Pixel, noindex");
