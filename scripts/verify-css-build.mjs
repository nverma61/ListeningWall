/**
 * Ensures `next build` emitted at least one CSS file under `.next/static/**`.
 * Without this, a broken PostCSS/Tailwind setup can still "build" and ship an unstyled app.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const staticRoot = path.join(__dirname, "..", ".next", "static");

function walkCssFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) out.push(...walkCssFiles(full));
    else if (name.endsWith(".css")) out.push(full);
  }
  return out;
}

if (process.env.SKIP_VERIFY_CSS === "1") {
  console.warn("[verify-css] Skipped (SKIP_VERIFY_CSS=1).");
  process.exit(0);
}

const files = walkCssFiles(staticRoot);
if (files.length === 0) {
  console.error(
    "[verify-css] No *.css under .next/static — run `npm run build` and ensure Tailwind/PostCSS runs."
  );
  process.exit(1);
}

console.log(`[verify-css] OK — ${files.length} stylesheet file(s) under .next/static.`);
