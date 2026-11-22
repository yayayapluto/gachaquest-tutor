/* Build flow SVG untuk dua tema: light + dark.
   Sumber tunggal docs/journey-flow.mmd; pele mengeluarkan token var(--_*),
   lalu skrip ini menggantinya dengan warna literal per tema.
   Jalankan: bun run diagram */
import { execFileSync } from "node:child_process";
import { copyFileSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const docs = import.meta.dirname;
const root = join(docs, "..");
const src = join(docs, "journey-flow.mmd");
const render = join(homedir(), ".omp", "tools", "pele", "render.mjs");

/* Token pele → palet tema. Surface = isi node, border = garis node,
   line = edge, fg = teks, accent tidak dipakai flowchart ini. */
const THEMES = {
  light: {
    bg: "#ffffff",
    fg: "#1f2328",
    muted: "#5d646e",
    line: "#8b95a3",
    surface: "#f4f6f8",
    alt: "#e7eaee",
    border: "#8b95a3",
    accent: "#4f46e5",
  },
  dark: {
    bg: "#1b1b1b",
    fg: "#e8e8e8",
    muted: "#a6a6a6",
    line: "#6b7280",
    surface: "#262626",
    alt: "#303030",
    border: "#6b7280",
    accent: "#a5b4fc",
  },
};

function renderTheme(name) {
  const out = join(docs, `journey-flow-${name}.svg`);
  execFileSync(process.execPath, [render, src, "-o", out], { stdio: "inherit" });
  let svg = readFileSync(out, "utf8");
  const palette = THEMES[name];
  const map = {
    "var(--_bg)": palette.bg,
    "var(--_fg)": palette.fg,
    "var(--_m)": palette.muted,
    "var(--_l)": palette.line,
    "var(--_s)": palette.surface,
    "var(--_a)": palette.alt,
    "var(--_b)": palette.border,
    "var(--_c)": palette.accent,
  };
  for (const [token, literal] of Object.entries(map)) {
    svg = svg.split(token).join(literal);
  }
  writeFileSync(out, svg);
  copyFileSync(out, join(root, "public", "assets", `journey-flow-${name}.svg`));
  console.log(`build-flow: ${name} → ${out}`);
}

renderTheme("light");
renderTheme("dark");
