// Post-build script to remove server-only modules from client preloads
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverOnlyModules = ["@navikt/oasis", "prom-client"];

const manifestDir = path.join(__dirname, "../.output/server/chunks/build");
const files = fs
  .readdirSync(manifestDir)
  .filter((f) => f.startsWith("_tanstack-start-manifest"));

for (const file of files) {
  const filePath = path.join(manifestDir, file);
  let content = fs.readFileSync(filePath, "utf-8");

  for (const mod of serverOnlyModules) {
    // Remove module from preloads arrays (handles various URL formats)
    const regex = new RegExp(
      `"[^"]*/${mod.replace("/", "\\/")}[^"]*",?\\s*`,
      "g",
    );
    content = content.replace(regex, "");
  }

  // Clean up trailing commas in arrays
  content = content.replace(/,\s*\]/g, "]");

  fs.writeFileSync(filePath, content);
  console.log(`Fixed ${file}`);
}
