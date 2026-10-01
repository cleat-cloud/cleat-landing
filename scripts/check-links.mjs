#!/usr/bin/env node
/**
 * Fail if an internal href/src/hx-get in the landing HTML points at a missing file.
 * External URLs (http, mailto, #) are ignored.
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const st = statSync(path);
    if (st.isDirectory()) walk(path, acc);
    else if (name.endsWith(".html")) acc.push(path);
  }
  return acc;
}

const attrRe = /\b(?:href|src|hx-get)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
let failed = 0;

for (const file of walk(root).filter((p) => !p.includes("node_modules"))) {
  const html = readFileSync(file, "utf8");
  const rel = relative(root, file);
  let match;
  while ((match = attrRe.exec(html))) {
    const url = match[1] ?? match[2];
    if (!url || url.startsWith("#") || url.startsWith("mailto:") || url.startsWith("https:") || url.startsWith("http:")) {
      continue;
    }
    const path = url.split("?")[0].split("#")[0];
    if (!path.startsWith("/")) continue;
    const onDisk = join(root, path.replace(/^\//, ""));
    if (!existsSync(onDisk)) {
      console.error(`${rel}: missing ${url}`);
      failed += 1;
    }
  }
}

if (failed > 0) {
  console.error(`${failed} missing internal link(s)`);
  process.exit(1);
}

console.log("internal links ok");
