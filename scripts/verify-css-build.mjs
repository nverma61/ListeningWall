/**
 * Ensures `next build` produced at least one CSS chunk under .next/static/css.
 * Without this, a broken PostCSS/Tailwind setup can still "build" and ship an unstyled app.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cssDir = path.join(__dirname, "..", ".next", "static", "css");

if (!fs.existsSync(cssDir)) {
  console.error(
    "[verify-css] Missing .next/static/css — run `npm run build` and ensure Tailwind/PostCSS runs."
  );
  process.exit(1);
}

const files = fs.readdirSync(cssDir).filter((f) => f.endsWith(".css"));
if (files.length === 0) {
  console.error(
    "[verify-css] No *.css files in .next/static/css — global styles did not compile."
  );
  process.exit(1);
}

console.log(`[verify-css] OK — ${files.length} stylesheet chunk(s).`);
