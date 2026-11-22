import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { JOURNEY } from "../src/data/journey.js";

const root = fileURLToPath(new URL("..", import.meta.url));
const phases = [JOURNEY.foundation, ...JOURNEY.members.flatMap((member) => member.phases)];
const steps = phases.flatMap((phase) => phase.steps);

assert.deepEqual(
  JOURNEY.members.map((member) => member.code),
  ["P1", "P2", "P3", "P4", "P5"],
  "kode anggota harus P1 sampai P5",
);
assert.ok(steps.length > 0, "journey tidak punya langkah");

for (const step of steps) {
  assert.ok(step.id && step.title, `langkah tanpa id atau judul: ${step.id}`);
  assert.ok(typeof step.expected?.text === "string", `expected result hilang: ${step.id}`);
  assert.ok(typeof step.bukti === "string" && step.bukti, `bukti hilang: ${step.id}`);
}

const screens = new Set([
  ...JOURNEY.members.flatMap((member) => member.screens),
  ...steps.flatMap((step) => step.expected.screens ?? []),
]);
assert.equal(screens.size, 18, `jumlah screenshot unik ${screens.size}, bukan 18`);

const verifyDist = process.argv.includes("--dist");
const publicAssets = join(root, "public", "assets");

for (const name of screens) {
  assert.ok(existsSync(join(publicAssets, "screens", `${name}.png`)), `screenshot hilang: ${name}.png`);
}
for (const theme of ["light", "dark"]) {
  assert.ok(
    existsSync(join(publicAssets, `journey-flow-${theme}.svg`)),
    `diagram hilang: journey-flow-${theme}.svg`,
  );
}

if (verifyDist) {
  const distAssets = join(root, "dist", "assets");
  for (const name of screens) {
    assert.ok(
      existsSync(join(distAssets, "screens", `${name}.png`)),
      `dist tidak memuat screenshot: ${name}.png`,
    );
  }
  for (const theme of ["light", "dark"]) {
    assert.ok(
      existsSync(join(distAssets, `journey-flow-${theme}.svg`)),
      `dist tidak memuat diagram: journey-flow-${theme}.svg`,
    );
  }
}

console.log(`smoke: ${steps.length} langkah, ${screens.size} screenshot, 2 diagram OK`);
