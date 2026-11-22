# AGENTS.md

**Project:** GachaQuest web tutor, React 19 + Vite single-page guide for the UAS team, styled with Astryx (`@astryxdesign/core` + neutral theme), charted with ECharts, and vendored skills under `.agents/skills/`. Entry: `index.html` → `src/main.jsx` → `src/App.jsx`; journey data in `src/data/journey.js`; screenshots in `public/assets/screens/`. Toolchain: Bun + Biome.

## Skill routing

Read the row that matches the task. Do not preload every skill.

| Task                                                                                                                        | Skill                       | Notes                                                                                                                                                                                     |
| --------------------------------------------------------------------------------------------------------------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Any HTML, CSS, or client-side JavaScript change (layout, forms, dialogs, scroll, theming, accessibility, performance)       | `modern-web-guidance`       | Run first, before writing markup or styles. Prefers platform APIs over libraries. Not for backend, CI, or tooling-only tasks.                                                             |
| Build, modify, debug, or publish a Chrome extension (Manifest V3, extension APIs)                                           | `chrome-extensions`         | Chrome extensions only; not for ordinary web pages.                                                                                                                                       |
| Design, redesign, critique, audit, or polish a web/mobile UI                                                                | `impeccable`                | UI and frontend only. Pair with `modern-web-guidance` for the actual HTML/CSS.                                                                                                            |
| Build a new animation or transition (theme switch, dialog, timeline, hover, smooth scroll)                                  | `animate`                   | Decides purpose, property, curve, duration, interruption before writing code. Vendored from `emilkowalski/skills`. For critiquing existing motion use `review-animations`.                |
| Animation stutters, drops frames, or feels heavy                                                                            | `animation-performance`     | Same source. Fix transform/opacity, compositor, layout thrash.                                                                                                                            |
| Sequence or stagger several elements entering/leaving                                                                       | `choreograph`               | Same source. Not for single-element tweens.                                                                                                                                               |
| Polish press/hover/focus states and interaction detail on an existing component                                             | `emil-design-eng`           | Same source. Calls the specific technique (press scale, popover origin, reduced motion).                                                                                                  |
| Audit or improve motion across the whole app                                                                                | `improve-animations`        | Same source, produces a ranked roadmap. Not for a single new animation.                                                                                                                   |
| Unsure which motion skill applies                                                                                           | `ask-emil`                  | Router over the vendored Emil skills.                                                                                                                                                     |
| Produce an architecture, flow, sequence, ER, or data diagram                                                                | `diagram-design`            | Diagram generation. Do not use for interactive charts.                                                                                                                                    |
| Add or change an interactive chart on the page                                                                              | `echarts`                   | ECharts 6 is a dependency (`echarts/core` + `BarChart` + `CanvasRenderer`). Read the token resolution note in `src/App.jsx`. Not for static diagrams.                                     |
| Rewrite English text that an agent or parser must not misread (tool descriptions, error messages, inter-agent instructions) | `asd-ste100`                | English only. Not for creative or marketing copy.                                                                                                                                         |
| Code review of a diff, commit, branch, or PR using OCR's own model pipeline                                                 | `open-code-review`          | Requires the `ocr` CLI on PATH. Not installed here.                                                                                                                                       |
| Code review of a diff, commit, branch, or PR using this agent's model with OCR's file selection and rules                   | `open-code-review-delegate` | Requires the `ocr` CLI on PATH. Not installed here.                                                                                                                                       |
| Security review, vulnerability scan, threat model, or pen-test request                                                      | `security-audit`            | Run the full workflow only for explicit audit or pen-test requests. Required before calling any public-facing web or API work done.                                                       |
| Build or change UI in this Astryx project                                                                                   | `astryx`                    | Astryx 0.7.17 is adopted. Read `astryx component <Name>` before using a component. Layout-only flex wrappers may stay as plain elements; interactive controls must use Astryx components. |
| Investigate a production incident or alert across logs, metrics, traces, and deploys                                        | `opensre`                   | Requires the `opensre` CLI on PATH. Not installed here; investigate manually instead.                                                                                                     |
| Get a human review of a plan, spec, or diff through a browser annotation surface                                            | `plannotator`               | Requires the `plannotator` CLI on PATH. Not installed here; fall back to a written plan plus chat review.                                                                                 |

## Planning

- A plan that governs implementation lives in `docs/plan-<topic>.md`.
- With the `plannotator` CLI available, open the plan through its review surface; annotations come back as decisions appended to the plan under a dated heading (for example `## Decisions 2026-11-22`).
- Implementation starts only after the user approves the plan file.
- A plan that exists only in chat is not approved and does not authorize edits.

## Toolchain

Detected in this repository on 2026-11-23:

| Concern          | Status                                   | Command                                                  |
| ---------------- | ---------------------------------------- | -------------------------------------------------------- |
| Package manager  | Bun 1.3.14 (`bun.lock`, no npm lockfile) | `bun install`                                            |
| Dev server       | Vite 8                                   | `bun run dev` (port 5183)                                |
| Production build | Vite                                     | `bun run build` → `dist/`                                |
| Preview          | Vite                                     | `bun run preview`                                        |
| Flow diagram     | pele + post-process                      | `bun run diagram` → `docs/journey-flow-{light,dark}.svg` |
| Linter           | Biome 2.6.8                              | `bun run lint`                                           |
| Formatter        | Biome 2.6.8                              | `bun run format` / `bun run check`                       |
| Typechecker      | Not configured (plain JSX)               | tidak ada                                                |
| Test runner      | Smoke check lewat Bun dan Node assert    | `bun run smoke`                                          |
| Pre-commit hook  | Aktif, menjalankan smoke sebelum commit  | `.git/hooks/pre-commit`                                  |
| Version control  | Git repo aktif di direktori ini          | `git status`                                             |

## Precedence

Direct user instruction > this `AGENTS.md` > skill instructions > user-level agent rules.

## Order of operations

- **UI task:** `modern-web-guidance` (API and pattern check) → `impeccable` (design pass) → `diagram-design` or `echarts` only if the task includes a diagram or chart → `security-audit` if the change adds or alters a public-facing surface.
- **Code review or release:** `open-code-review` or `open-code-review-delegate` for defect review → `security-audit` for public-facing changes → `plannotator` for human sign-off on the plan or diff when the CLI is available.
- **Plan approval:** write `docs/plan-<topic>.md` → review through `plannotator` if installed, otherwise review in chat → fold annotations back as dated decisions → implement.

## Skills are vendored copies

Each directory below is a copy of upstream content. To update, replace the whole directory; never edit vendored skill bodies in place. Project copies take precedence over same-named user-level skills.

| Directory                   | Upstream                                            | Version / commit                                |
| --------------------------- | --------------------------------------------------- | ----------------------------------------------- |
| `asd-ste100`                | https://github.com/danyuchn/asd-ste100-skill        | v0.4.0, commit `65c8ab6`                        |
| `astryx`                    | https://github.com/meta/astryx                      | commit `9f0f023`                                |
| `chrome-extensions`         | https://github.com/GoogleChrome/modern-web-guidance | v1.0.1, commit `64a6d70`                        |
| `modern-web-guidance`       | https://github.com/GoogleChrome/modern-web-guidance | v1.0.1, commit `64a6d70`                        |
| `diagram-design`            | https://github.com/cathrynlavery/diagram-design     | v2.6, commit `d7b0176`                          |
| `echarts`                   | https://github.com/apache/echarts                   | Local wrapper; no upstream skill                |
| `impeccable`                | https://github.com/pbakaus/impeccable               | skill-v4.10.0, commit `b49177d`                 |
| `open-code-review`          | https://github.com/alibaba/open-code-review         | commit `9285d1b`                                |
| `open-code-review-delegate` | https://github.com/alibaba/open-code-review         | commit `9285d1b`                                |
| `opensre`                   | https://github.com/Tracer-Cloud/opensre             | Local wrapper; commit `75f248f` at wrapper time |
| `plannotator`               | https://github.com/backnotprop/plannotator          | Local wrapper; commit `55b1c97` at wrapper time |
| `security-audit`            | https://github.com/cloudflare/security-audit-skill  | commit `c1c8a8c`                                |

## External CLIs (not installed)

A global install changes the machine outside this repository and requires explicit user approval.

| CLI           | Needed by                                       | Install command                                                                                                                                                  |
| ------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `astryx`      | `astryx`                                        | `npm i -g @astryxdesign/cli`                                                                                                                                     |
| `ocr`         | `open-code-review`, `open-code-review-delegate` | `npm i -g @alibaba-group/open-code-review@latest`                                                                                                                |
| `opensre`     | `opensre`                                       | macOS/Linux: `curl -fsSL https://install.opensre.com \| bash -s -- -gh`; Windows: `& ([scriptblock]::Create((irm https://install.opensre.com/install.ps1))) -gh` |
| `plannotator` | `plannotator`                                   | macOS/Linux: `curl -fsSL https://plannotator.ai/install.sh \| bash`; Windows: `irm https://plannotator.ai/install.ps1 \| iex`                                    |

<!-- ASTRYX:START -->
Astryx v0.7.17 · 174 components
CLI: run every command as `astryx <cmd>` (shown below as `astryx ...`).

SETUP (once, in app entry e.g. main.tsx) — without these, components render unstyled:
import "@astryxdesign/core/reset.css";
import "@astryxdesign/core/astryx.css";

WORKFLOW — start every page from a template, never from scratch:

1. `astryx build "<idea>"` — names the template to scaffold from and the parts it lacks.
2. `astryx template <name> <path>` — scaffold it; keep its frame, gap and padding; replace the content.
3. `astryx component <Name>` to read props before using one; `astryx template <Block>` prints a block example to read for a part it lacks. Astryx names differ from other libraries: buttons, badges, tokens and tabs take their text in `label` (Text, Heading and Link take children), booleans start with `is` or `has` (`isOpen`, `isDisabled`), and every input takes `value` and `onChange`.
   Changing an existing page? Keep it: skip step 2 and add components inside its sections; read a block example when it helps.

RULES:

- No <div> — components handle all layout and spacing.
- Read `astryx docs layout` before changing a template's frame.
- Dense data = rows (Table, List/Item), not Card-wrapped lists. Badge = counts only.
- Style with component props first, then tokens (var(--color-_|--spacing-_|--radius-*)). No raw hex/px. No StyleX/Tailwind compiler here — don't use xstyle/utility classes directly. Some templates use StyleX and need a compiler plugin; see `astryx docs styling-overview`.
- THEMES: palettes and custom colors go through the theme, never :root overrides; so does a denser or roomier app (`editor set <name> spacing tight`), never gap and padding changes page by page. A change to one kind of part (the sidebar, its selected item, the gaps in a form) is a theme change too, not props on one page: `editor how "<ask>"` names the `set … --on <part>` line. No app yet: `astryx experimental theme preview app <dir>` makes a starter app that shows the theme. To make or change a theme (colors, fonts, corners, spacing, a look from a picture), prefer the experimental theme editor over hand-written theme files: `astryx experimental theme editor new <name> --like neutral`, then `editor set <name> <thing> <value>` or `editor how "<what you want>"`; wire it with `astryx theme add <name>`; after each change look at it with `astryx experimental theme editor show <name> --png` (takes pictures of real components) and open the PNGs it writes; a theme change is not done until you have looked at the pictures. In code, extend an imported theme to customize it; `theme eject <slug>` only forks source. See `astryx docs theme`.
- SELF-CHECK: re-read the file; replace any raw <div>/<span>, imported .css/@apply, or hardcoded #hex/px with the component or a token.

`astryx help` lists every command. Key ones beyond the workflow:
search "<query>" find any component / hook / doc / template
discover <words> integrations you could add
docs <topic> getting-started, principles, tokens, theme … (`astryx docs` lists all)
docs cli commands and API reference
docs authoring build an integration package, and every field it holds
upgrade --from <old version> --apply run after a dependency bump
To remove this block, run `astryx init --remove-agents`, which removes it from the agent files at the project root and in the folder you run it in; from any other file it leaves, delete everything from ASTRYX:START to ASTRYX:END.
<!-- ASTRYX:END -->
