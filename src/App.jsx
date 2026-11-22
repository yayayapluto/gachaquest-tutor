import { Badge } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Divider } from "@astryxdesign/core/Divider";
import { DropdownMenu } from "@astryxdesign/core/DropdownMenu";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { ProgressBar } from "@astryxdesign/core/ProgressBar";
import { Text } from "@astryxdesign/core/Text";
import { Theme } from "@astryxdesign/core/theme";
import { VStack } from "@astryxdesign/core/VStack";
import { BarChart } from "echarts/charts";
import { GridComponent, TooltipComponent } from "echarts/components";
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { defaultThemeSlug, themes } from "../astryx-themes.js";
import { JOURNEY } from "./data/journey.js";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Moon, MoreHorizontal, Sun, X } from "./icons.jsx";

echarts.use([BarChart, GridComponent, TooltipComponent, CanvasRenderer]);

const KEY = "gachaquest-tutor-v1";

const THEME_META = {
  light: { label: "Tema: terang", icon: <Sun /> },
  dark: { label: "Tema: gelap", icon: <Moon /> },
};

const SCREEN_TITLES = {
  "01-menu-utama": "Menu Utama",
  "02-game-baru-nama": "Game Baru, nama pemain",
  "03-game-baru-seed": "Game Baru, seed dunia",
  "04-load-game": "Load Game",
  "05-hub": "Hub",
  "06-status": "Status",
  "07-battle": "Battle",
  "08-game-over": "GAME OVER",
  "09-gacha": "Gacha",
  "10-gacha-hasil-10x": "Hasil Gacha 10x",
  "11-inventory-kosong": "Inventory kosong",
  "12-inventory": "Inventory berisi",
  "13-equip-item": "Equip Item",
  "14-shop": "Shop",
  "15-jual-item": "Jual Item",
  "16-dungeon": "Dungeon",
  "17-simpan-game": "Simpan Game",
  "18-leaderboard": "Leaderboard",
};

/* ---------- penyimpanan ---------- */

function readStore() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { names: {}, done: {}, theme: "light" };
    const parsed = JSON.parse(raw);
    const theme = parsed?.theme === "dark" ? "dark" : "light";
    return { names: parsed?.names ?? {}, done: parsed?.done ?? {}, theme };
  } catch {
    return { names: {}, done: {}, theme: "light" };
  }
}

function writeStore(value) {
  try {
    localStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    /* mode memori bila localStorage ditolak */
  }
}

/* ---------- util data ---------- */

const screenNo = (id) => id.slice(0, 2).replace(/^0/, "");
const screenTitle = (id) => SCREEN_TITLES[id] ?? id;

function phasesOf(member) {
  return [{ ...JOURNEY.foundation, steps: JOURNEY.foundation.steps }, ...member.phases];
}

function allSteps(member) {
  return phasesOf(member).flatMap((phase) => phase.steps);
}

function findStep(member, id) {
  for (const phase of phasesOf(member)) {
    const step = phase.steps.find((item) => item.id === id);
    if (step) return { phase, step };
  }
  return null;
}

function displayCommand(member, step) {
  if (!step.command) return null;
  let code = step.command.code;
  if (step.id.startsWith("f0-")) code = code.replaceAll("feat/scaffold-ui", member.branch);
  return { label: step.command.label, code };
}

/* ---------- progress ring (native <progress>) ---------- */

function ProgressRing({ pct, label }) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.style.setProperty("--ring-value", String(pct));
  }, [pct]);
  return (
    <div className="ring-wrap">
      <progress
        ref={ref}
        className="ring"
        value={pct}
        max={100}
        aria-label={label}
        aria-valuetext={`${pct} persen selesai`}
      />
      <span className="ring-text" aria-hidden="true">
        {pct}%
      </span>
    </div>
  );
}

/* ---------- chart ECharts ---------- */

function ProgressChart({ rows, theme }) {
  const box = useRef(null);
  const rowsRef = useRef(rows);
  rowsRef.current = rows;
  const signature = rows.map((row) => `${row.code}:${row.pct}`).join("|");
  const [scheme, setScheme] = useState(0);

  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setScheme((value) => value + 1);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    // signature, scheme, dan theme hanya kunci repaint saat data atau tema berubah.
    void signature;
    void scheme;
    void theme;
    const node = box.current;
    if (!node) return undefined;
    const chart = echarts.init(node);
    const resolve = (name, fallback) => {
      const probe = document.createElement("span");
      probe.style.cssText = `display:none;color:var(${name})`;
      document.body.appendChild(probe);
      const rgb = getComputedStyle(probe).color;
      probe.remove();
      return rgb && rgb !== "rgba(0, 0, 0, 0)" ? rgb : fallback;
    };
    const accent = resolve("--color-accent", "#4f46e5");
    const ink = resolve("--color-text-secondary", "#475569");
    const line = resolve("--color-border", "#d7dbe3");
    const track = line;
    const data = rowsRef.current;

    chart.setOption({
      animationDuration: 300,
      animationEasing: "cubicOut",
      tooltip: { trigger: "item", formatter: (params) => `${params.name}: ${params.value}% selesai` },
      xAxis: {
        type: "value",
        max: 100,
        axisLabel: { color: ink, formatter: "{value}%" },
        splitLine: { lineStyle: { color: line } },
      },
      yAxis: {
        type: "category",
        data: data.map((row) => row.code),
        axisLabel: { color: ink, fontWeight: 700, fontSize: 14 },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      series: [
        {
          type: "bar",
          data: data.map((row) => row.pct),
          barWidth: 18,
          showBackground: true,
          backgroundStyle: { color: track, borderRadius: 6 },
          itemStyle: { color: accent, borderRadius: [0, 6, 6, 0] },
          label: { show: true, position: "right", color: ink, formatter: "{c}%" },
        },
      ],
    });

    const observer = new ResizeObserver(() => chart.resize());
    observer.observe(node);
    return () => {
      observer.disconnect();
      chart.dispose();
    };
  }, [signature, scheme, theme]);

  return (
    <div
      ref={box}
      className="chart"
      role="img"
      aria-label={`Progres tiap anggota: ${rows.map((row) => `${row.code} ${row.pct} persen`).join(", ")}`}
    />
  );
}

/* ---------- dialog nama ---------- */

function NameDialog({ open, initial, member, isEntry, onCancel, onSubmit }) {
  const ref = useRef(null);
  const input = useRef(null);
  const [value, setValue] = useState(initial);

  useEffect(() => {
    if (member) setValue(initial);
  }, [member, initial]);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (open && !node.open) {
      node.showModal();
      requestAnimationFrame(() => input.current?.focus());
    }
    if (!open && node.open) node.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="dlg"
      onClose={onCancel}
      aria-label={isEntry ? "Pilih nama panggilan" : "Ganti nama panggilan"}
    >
      <form
        method="dialog"
        className="dlg-body"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(value.trim().slice(0, 24));
        }}
      >
        <Heading level={2}>
          {isEntry ? "Nama panggilanmu?" : `Ganti nama panggilan, ${member ? member.code : "anggota"}`}
        </Heading>
        <p className="muted">
          {isEntry
            ? `Kamu masuk sebagai ${member ? member.code : "anggota"}. Nama ini hanya untuk sapaan; kosongkan untuk tetap memakai kode.`
            : "Nama dipakai untuk sapaan di journey. Kosongkan untuk memakai kode anggota."}
        </p>
        <label className="field">
          <span>Nama panggilan</span>
          <input
            ref={input}
            type="text"
            maxLength={24}
            autoComplete="nickname"
            placeholder="Farros"
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
        </label>
        <div className="dlg-actions">
          <HStack gap={1} justify="end">
            <Button label="Batal" variant="ghost" type="button" onClick={onCancel} />
            <Button label="Simpan nama" variant="primary" type="submit" />
          </HStack>
        </div>
      </form>
    </dialog>
  );
}

/* ---------- dialog reset ---------- */

function ResetDialog({ member, onCancel, onConfirm }) {
  const ref = useRef(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (member && !node.open) node.showModal();
    if (!member && node.open) node.close();
  }, [member]);

  return (
    <dialog ref={ref} className="dlg" onClose={onCancel} aria-label="Konfirmasi reset progres">
      <div className="dlg-body">
        <Heading level={2}>Reset progres?</Heading>
        <p className="muted">
          Semua centang milestone untuk {member ? `${member.code} ${member.role}` : "anggota ini"} dihapus.
          Nama dan anggota tetap.
        </p>
        <div className="dlg-actions">
          <HStack gap={1} justify="end">
            <Button label="Batal" variant="ghost" onClick={onCancel} />
            <Button label="Reset progres" variant="destructive" onClick={onConfirm} />
          </HStack>
        </div>
      </div>
    </dialog>
  );
}

/* ---------- lightbox screenshot ---------- */

function ShotDialog({ shots, index, onClose, onStep }) {
  const ref = useRef(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (shots && !node.open) node.showModal();
    if (!shots && node.open) node.close();
  }, [shots]);

  const id = shots ? shots[index] : null;

  return (
    <dialog
      ref={ref}
      className="dlg dlg-shot"
      onClose={onClose}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          onStep(-1);
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          onStep(1);
        }
      }}
      aria-label="Pratinjau screenshot"
    >
      {id ? (
        <div className="shot-wrap">
          <div className="shot-bar">
            <Heading level={2}>
              {screenNo(id)} · {screenTitle(id)}
            </Heading>
            <HStack gap={1} align="center">
              <Button
                label="Screenshot sebelumnya"
                icon={<ArrowLeft />}
                variant="ghost"
                size="sm"
                isIconOnly
                tooltip="Screenshot sebelumnya"
                onClick={() => onStep(-1)}
              />
              <Text type="supporting">
                {index + 1} / {shots.length}
              </Text>
              <Button
                label="Screenshot berikutnya"
                icon={<ArrowRight />}
                variant="ghost"
                size="sm"
                isIconOnly
                tooltip="Screenshot berikutnya"
                onClick={() => onStep(1)}
              />
              <Button label="Tutup" variant="ghost" size="sm" onClick={onClose} />
            </HStack>
          </div>
          <img
            className="shot-img"
            src={`/assets/screens/${id}.png`}
            alt={`Screenshot ${screenNo(id)}: ${screenTitle(id)}`}
          />
          <p className="muted">
            Target layar dari galeri expected result. Panah kiri/kanan untuk pindah, Esc untuk menutup.
          </p>
        </div>
      ) : null}
    </dialog>
  );
}

/* ---------- kartu anggota ---------- */

function MemberCard({ member, progress, onPick }) {
  return (
    <button
      className="member-card"
      type="button"
      onClick={onPick}
      aria-label={`${member.code} ${member.role}, ${progress.done} dari ${progress.total} langkah selesai`}
    >
      <div className="member-inner">
        <div className="member-top">
          <div>
            <span className="member-code">{member.code}</span>
            <span className="member-role">{member.role}</span>
          </div>
          <ProgressRing pct={progress.pct} label={`Progres ${member.code}`} />
        </div>
        <Badge label={`Level ${member.level}`} variant="neutral" />
        <div className="member-meta">
          <span>
            Branch <code>{member.branch}</code>
          </span>
          <span>
            Langkah {progress.done}/{progress.total}
          </span>
          <span>Target {member.screens.length} layar</span>
        </div>
        <div className="member-foot">
          <span>{progress.done === progress.total && progress.total > 0 ? "Selesai" : "Buka journey"}</span>
          <span aria-hidden="true">
            <ArrowRight size={18} />
          </span>
        </div>
      </div>
    </button>
  );
}

/* ---------- thumbnails ---------- */

function Thumbs({ ids, onOpen, compact = false }) {
  return (
    <div className={compact ? "thumbs compact" : "thumbs"}>
      {ids.map((id) => (
        <button
          key={id}
          className="thumb"
          type="button"
          onClick={() => onOpen(ids, ids.indexOf(id))}
          aria-label={`Buka screenshot ${screenNo(id)}: ${screenTitle(id)}`}
        >
          <img src={`/assets/screens/${id}.png`} alt="" loading="lazy" width="160" height="100" />
          <span>
            {screenNo(id)} · {screenTitle(id)}
          </span>
        </button>
      ))}
    </div>
  );
}

/* ---------- kursor halus (pointer presisi saja) ---------- */

const HOT_TARGET = "button, a, input, summary, .thumb, .step-btn, .member-card";

function CursorGlow() {
  const node = useRef(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const element = node.current;
    if (!element || !fine.matches || reduced.matches) return undefined;

    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;
    let raf = 0;
    let visible = false;

    const onMove = (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
      if (!visible) {
        visible = true;
        x = targetX;
        y = targetY;
        element.classList.add("is-live");
      }
      const hot = event.target instanceof Element && event.target.closest(HOT_TARGET);
      element.classList.toggle("is-hot", Boolean(hot));
    };

    const onLeave = () => {
      visible = false;
      element.classList.remove("is-live", "is-hot");
    };

    const tick = () => {
      x += (targetX - x) * 0.18;
      y += (targetY - y) * 0.18;
      element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <div ref={node} className="cursor-glow" aria-hidden="true" />;
}

/* ---------- app ---------- */

function TimelinePanel({ member, stepId, doneOf, unlockedIds, onSelect }) {
  const done = doneOf(member.code);
  return (
    <Card padding={2} elevation="low">
      {phasesOf(member).map((phase) => (
        <div className="phase" key={phase.id}>
          <div className="phase-head">
            <Text type="label">
              {phase.id} · {phase.title}
            </Text>
            {phase.tag ? <Badge label={phase.tag} variant="purple" /> : null}
          </div>
          <ul className="step-list">
            {phase.steps.map((step) => {
              const isDone = done.has(step.id);
              const isLocked = !unlockedIds.has(step.id);
              return (
                <li key={step.id}>
                  <button
                    type="button"
                    className={`step-btn${isDone ? " is-done" : ""}${isLocked ? " is-locked" : ""}`}
                    aria-current={step.id === stepId ? "step" : undefined}
                    title={
                      isLocked
                        ? "Bisa dibaca. Selesaikan langkah sebelumnya untuk menandai selesai."
                        : undefined
                    }
                    onClick={() => onSelect(step.id)}
                  >
                    <span className="step-dot" aria-hidden="true">
                      {isDone ? <Check size={11} /> : null}
                    </span>
                    <span className="step-title">{step.title}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </Card>
  );
}

function ContextPanel({ member, nameOf, onShot }) {
  return (
    <Card padding={3} elevation="low">
      <VStack gap={2}>
        <VStack gap={0.5}>
          <Text type="body" weight="bold">
            Halo, {nameOf(member)}
          </Text>
          <Text type="supporting">
            {member.code} · {member.role}
          </Text>
          <code className="branch">{member.branch}</code>
        </VStack>
        <Divider />
        <VStack gap={1}>
          <Text type="label">File milikmu</Text>
          <div className="chips">
            {member.filesOwned.map((file) => (
              <code key={file}>{file}</code>
            ))}
          </div>
        </VStack>
        <Divider />
        <VStack gap={1}>
          <Text type="label">Target akhir</Text>
          <div className="targets">
            <span>
              <Text type="supporting">Driver</Text>
              <strong>{member.drivers.join(", ")}</strong>
            </span>
            <span>
              <Text type="supporting">Skenario</Text>
              <strong>{member.scenarios.join(", ")}</strong>
            </span>
            <span>
              <Text type="supporting">Layar</Text>
              <strong>{member.screens.length} target</strong>
            </span>
          </div>
        </VStack>
        <Divider />
        <VStack gap={1}>
          <Text type="label">Expected result</Text>
          <Thumbs ids={member.screens} onOpen={onShot} compact />
        </VStack>
        <Divider />
        <VStack gap={1}>
          <Text type="label">Larangan</Text>
          <ul className="dont-list">
            {member.larangan.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </VStack>
      </VStack>
    </Card>
  );
}

export default function App() {
  const [store, setStore] = useState(readStore);
  const [view, setView] = useState("picker");
  const [memberCode, setMemberCode] = useState(null);
  const [stepId, setStepId] = useState(null);
  const [nameAsk, setNameAsk] = useState(null);
  const [resetAsk, setResetAsk] = useState(null);
  const [shot, setShot] = useState(null);
  const [copied, setCopied] = useState(false);
  const [drawer, setDrawer] = useState(null);
  const detailRef = useRef(null);
  const drawerRef = useRef(null);
  const stepsTriggerRef = useRef(null);
  const infoTriggerRef = useRef(null);
  const resolvedTheme = store.theme;

  const member = useMemo(
    () => JOURNEY.members.find((item) => item.code === memberCode) ?? null,
    [memberCode],
  );

  const doneOf = useCallback(
    (code) => new Set(Array.isArray(store.done[code]) ? store.done[code] : []),
    [store],
  );

  const progressOf = useCallback(
    (target) => {
      const total = allSteps(target).length;
      const done = doneOf(target.code).size;
      return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
    },
    [doneOf],
  );

  const steps = useMemo(() => (member ? allSteps(member) : []), [member]);

  const unlockedIds = useMemo(() => {
    if (!member) return new Set();
    const done = doneOf(member.code);
    const ids = new Set();
    let open = true;
    for (const step of steps) {
      if (open) ids.add(step.id);
      if (!done.has(step.id)) open = false;
    }
    return ids;
  }, [doneOf, member, steps]);

  const save = useCallback((next) => {
    setStore(next);
    writeStore(next);
  }, []);

  const reducedMotion = useCallback(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);

  const transition = useCallback(
    (apply) => {
      if (typeof document.startViewTransition === "function" && !reducedMotion()) {
        document.startViewTransition(apply);
      } else {
        apply();
      }
    },
    [reducedMotion],
  );

  const goToPicker = useCallback(
    () =>
      transition(() => {
        setView("picker");
        setMemberCode(null);
        setDrawer(null);
      }),
    [transition],
  );

  const themeMeta = THEME_META[store.theme];
  const themeAction = store.theme === "light" ? "Ganti ke tema gelap" : "Ganti ke tema terang";

  const cycleTheme = useCallback(() => {
    const order = ["light", "dark"];
    const next = order[(order.indexOf(store.theme) + 1) % order.length];
    const apply = () => {
      flushSync(() => save({ ...store, theme: next }));
    };
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (typeof document.startViewTransition === "function" && !reduced) document.startViewTransition(apply);
    else apply();
  }, [save, store]);

  const nameOf = useCallback(
    (target) => {
      const saved = store.names?.[target.code];
      return typeof saved === "string" && saved.trim() ? saved.trim() : target.code;
    },
    [store],
  );

  const enter = useCallback(
    (target) =>
      transition(() => {
        setMemberCode(target.code);
        setView("journey");
        setStepId(null);
        setCopied(false);
        setDrawer(null);
      }),
    [transition],
  );

  const pick = useCallback((target) => {
    setNameAsk({ member: target, enter: true });
  }, []);

  const active = member && stepId ? findStep(member, stepId) : null;
  const activeIndex = active ? steps.findIndex((item) => item.id === active.step.id) : -1;
  const activeDone = active ? doneOf(member.code).has(active.step.id) : false;
  const prevStep = activeIndex > 0 ? steps[activeIndex - 1] : null;
  const nextStep = activeIndex >= 0 && activeIndex < steps.length - 1 ? steps[activeIndex + 1] : null;
  const canToggle = active ? activeDone || unlockedIds.has(active.step.id) : false;
  const canGoNext = Boolean(nextStep) && activeDone && unlockedIds.has(active.step.id);

  useEffect(() => {
    if (!stepId) return;
    detailRef.current?.scrollTo({ top: 0, behavior: reducedMotion() ? "auto" : "smooth" });
  }, [reducedMotion, stepId]);

  useEffect(() => {
    if (!member) return;
    if (!stepId || !findStep(member, stepId)) {
      const next = allSteps(member).find((item) => !doneOf(member.code).has(item.id)) ?? allSteps(member)[0];
      setStepId(next.id);
    }
  }, [member, stepId, doneOf]);

  useEffect(() => {
    const el = drawerRef.current;
    if (!el) return;
    if (drawer && !el.open) el.showModal();
    if (!drawer && el.open) el.close();
  }, [drawer]);

  const closeDrawer = useCallback(() => {
    drawerRef.current?.close();
  }, []);

  const selectStep = useCallback((id) => {
    setStepId(id);
    setCopied(false);
    setDrawer(null);
  }, []);

  const toggle = (id) => {
    if (!member) return;
    const set = doneOf(member.code);
    const index = steps.findIndex((item) => item.id === id);
    if (!set.has(id) && index > 0 && !steps.slice(0, index).every((item) => set.has(item.id))) return;
    if (set.has(id)) set.delete(id);
    else set.add(id);
    save({ ...store, done: { ...store.done, [member.code]: [...set] } });
  };

  const submitName = (name) => {
    const ask = nameAsk;
    setNameAsk(null);
    if (!ask) return;
    const target = ask.member;
    if (name) save({ ...store, names: { ...store.names, [target.code]: name } });
    if (ask.enter) enter(target);
  };

  const progress = member ? progressOf(member) : null;

  useEffect(() => {
    const onKey = (event) => {
      if (document.querySelector("dialog[open]")) return;
      const tag = (event.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      if (view === "journey") {
        if (event.key === "Escape") {
          goToPicker();
        }
        return;
      }
      const index = Number(event.key) - 1;
      if (Number.isInteger(index) && index >= 0 && index < JOURNEY.members.length) {
        pick(JOURNEY.members[index]);
      }
    };
    window.addEventListener("keydown", onKey);
  }, [goToPicker, pick, view]);

  const chartRows = JOURNEY.members.map((item) => ({ code: item.code, pct: progressOf(item).pct }));

  return (
    <Theme theme={themes[defaultThemeSlug]} mode={store.theme}>
      <div className="page">
        <header className="topbar">
          <div className="topbar-inner">
            <div className="brand">
              <span className="brand-mark" aria-hidden="true">
                GQ
              </span>
              <VStack gap={0}>
                <Text type="body" weight="bold">
                  GachaQuest
                </Text>
                <Text type="supporting">Tutor Tim</Text>
              </VStack>
            </div>

            <div className="topbar-progress">
              {member && progress ? (
                <ProgressBar
                  label={`Progres ${member.code}`}
                  value={progress.done}
                  max={progress.total}
                  hasValueLabel
                  formatValueLabel={(value, max) => `${value}/${max} langkah`}
                />
              ) : null}
            </div>

            <div className="topbar-actions">
              {member ? (
                <HStack gap={0.5} align="center">
                  <Button label="Pilih anggota" variant="ghost" size="sm" onClick={goToPicker} />
                  <Button
                    label="Ganti nama"
                    variant="ghost"
                    size="sm"
                    onClick={() => setNameAsk({ member, enter: false })}
                  />
                  <DropdownMenu
                    button={{
                      label: "Aksi lain",
                      tooltip: "Aksi lain",
                      icon: <MoreHorizontal />,
                      variant: "ghost",
                      size: "sm",
                      isIconOnly: true,
                    }}
                    hasChevron={false}
                    placement="below"
                    alignment="end"
                    items={[
                      {
                        id: "reset-progress",
                        label: "Reset progres",
                        variant: "destructive",
                        onClick: () => setResetAsk(member),
                      },
                    ]}
                  />
                </HStack>
              ) : null}
              <Button
                className="topbar-theme"
                label={themeAction}
                tooltip={themeAction}
                icon={themeMeta.icon}
                variant="ghost"
                size="sm"
                isIconOnly
                onClick={cycleTheme}
              />
            </div>
          </div>
        </header>

        <main className="main">
          {view === "picker" || !member || !progress ? (
            <div className="picker">
              <VStack gap={4}>
                <div className="hero">
                  <VStack gap={1}>
                    <Text type="label">Panduan kerja tim · UAS Dasar Pemrograman</Text>
                    <Heading level={1} type="display-1">
                      Pilih anggota, ikuti journey, buktikan hasil.
                    </Heading>
                    <p className="hero-sub">
                      Lima peran, satu program. Setiap kartu memuat langkah dari baca panduan, tulis modul,
                      jalankan test, sampai expected result yang bisa ditunjukkan saat demo.
                    </p>
                  </VStack>
                </div>

                <div className="overview">
                  <div className="chart-card">
                    <Card padding={3} elevation="low">
                      <VStack gap={1}>
                        <Heading level={2}>Progres tiap anggota</Heading>
                        <p className="muted">
                          Angka diambil dari centang milestone yang kamu simpan di browser.
                        </p>
                        <ProgressChart rows={chartRows} theme={resolvedTheme} />
                      </VStack>
                    </Card>
                  </div>
                  <div className="diagram-card">
                    <Card padding={3} elevation="low">
                      <VStack gap={1}>
                        <Heading level={2}>Alur fase proyek</Heading>
                        <p className="muted">
                          F0 fondasi dikerjakan semua orang, lalu modul paralel, integrasi, dan rilis.
                        </p>
                        <img
                          className="diagram-img"
                          src={`/assets/journey-flow-${resolvedTheme}.svg`}
                          alt="Diagram alur fase: contract-v1, ui-ready, modul paralel, integrasi, rilis"
                          width="918"
                          height="416"
                        />
                      </VStack>
                    </Card>
                  </div>
                </div>

                <div className="member-grid">
                  {JOURNEY.members.map((item) => (
                    <MemberCard
                      key={item.code}
                      member={item}
                      progress={progressOf(item)}
                      onPick={() => pick(item)}
                    />
                  ))}
                </div>
                <p className="muted">
                  Tip: tekan <kbd>1</kbd>–<kbd>5</kbd> untuk memilih anggota.
                </p>
              </VStack>
            </div>
          ) : (
            <div className="journey">
              <VStack gap={3}>
                <div className="journey-head">
                  <HStack gap={2} align="center" justify="between" wrap="wrap">
                    <HStack gap={2} align="center">
                      <Button
                        label="Pilih anggota"
                        icon={<ArrowLeft />}
                        variant="ghost"
                        onClick={goToPicker}
                      />
                      <VStack gap={0}>
                        <Heading level={1}>Halo, {nameOf(member)}</Heading>
                        <Text type="supporting">
                          {member.code} · {member.role} · {progress.done} dari {progress.total} langkah
                          selesai
                        </Text>
                      </VStack>
                    </HStack>
                    <div className="journey-score">
                      <Text type="label">Progres journey</Text>
                      <span className="score-value">{progress.pct}%</span>
                      <ProgressBar
                        label="Progres journey anggota"
                        value={progress.pct}
                        max={100}
                        isLabelHidden
                      />
                    </div>
                  </HStack>
                  <div className="drawer-trigger" ref={stepsTriggerRef}>
                    <Button
                      label="Langkah"
                      variant="secondary"
                      size="sm"
                      onClick={() => setDrawer("steps")}
                    />
                  </div>
                  <div className="drawer-trigger" ref={infoTriggerRef}>
                    <Button label="Info" variant="secondary" size="sm" onClick={() => setDrawer("context")} />
                  </div>
                </div>

                <div className="journey-layout">
                  <div className="timeline">
                    <TimelinePanel
                      member={member}
                      stepId={stepId}
                      doneOf={doneOf}
                      unlockedIds={unlockedIds}
                      onSelect={selectStep}
                    />
                  </div>

                  <div className="detail" id="detail" ref={detailRef}>
                    <Card padding={3} elevation="low">
                      {active ? (
                        <Detail
                          member={member}
                          phase={active.phase}
                          step={active.step}
                          isDone={activeDone}
                          canToggle={canToggle}
                          canGoNext={canGoNext}
                          position={{ index: activeIndex + 1, total: steps.length }}
                          copied={copied}
                          onCopy={async (code) => {
                            try {
                              await navigator.clipboard.writeText(code);
                            } catch {
                              /* clipboard ditolak; tombol tetap memberi umpan balik */
                            }
                            setCopied(true);
                            setTimeout(() => setCopied(false), 1600);
                          }}
                          onToggle={() => toggle(active.step.id)}
                          onPrev={prevStep ? () => selectStep(prevStep.id) : undefined}
                          onNext={nextStep ? () => selectStep(nextStep.id) : undefined}
                          onShot={(ids, index) => setShot({ ids, index })}
                        />
                      ) : null}
                    </Card>
                  </div>

                  <div className="context">
                    <ContextPanel
                      member={member}
                      nameOf={nameOf}
                      onShot={(ids, index) => setShot({ ids, index })}
                    />
                  </div>
                </div>

                {drawer ? (
                  <dialog
                    ref={drawerRef}
                    className="drawer"
                    aria-label={drawer === "steps" ? "Daftar langkah" : "Konteks anggota"}
                    onClose={() => setDrawer(null)}
                    onClick={(event) => {
                      if (event.target === event.currentTarget) closeDrawer();
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") closeDrawer();
                    }}
                  >
                    <div className="drawer-head">
                      <Text type="label">{drawer === "steps" ? "Daftar langkah" : "Konteks anggota"}</Text>
                      <Button
                        label="Tutup"
                        icon={<X />}
                        variant="ghost"
                        size="sm"
                        isIconOnly
                        onClick={closeDrawer}
                      />
                    </div>
                    <div className="drawer-body">
                      {drawer === "steps" ? (
                        <TimelinePanel
                          member={member}
                          stepId={stepId}
                          doneOf={doneOf}
                          unlockedIds={unlockedIds}
                          onSelect={selectStep}
                        />
                      ) : (
                        <ContextPanel
                          member={member}
                          nameOf={nameOf}
                          onShot={(ids, index) => setShot({ ids, index })}
                        />
                      )}
                    </div>
                  </dialog>
                ) : null}
              </VStack>
            </div>
          )}
        </main>
        <CursorGlow />

        <NameDialog
          open={Boolean(nameAsk)}
          member={nameAsk?.member}
          isEntry={Boolean(nameAsk?.enter)}
          initial={nameAsk ? (store.names[nameAsk.member.code] ?? "") : ""}
          onCancel={() => setNameAsk(null)}
          onSubmit={submitName}
        />
        <ResetDialog
          member={resetAsk}
          onCancel={() => setResetAsk(null)}
          onConfirm={() => {
            if (!resetAsk) return;
            save({ ...store, done: { ...store.done, [resetAsk.code]: [] } });
            setResetAsk(null);
          }}
        />
        <ShotDialog
          shots={shot?.ids}
          index={shot?.index ?? 0}
          onClose={() => setShot(null)}
          onStep={(delta) => {
            setShot((current) => {
              if (!current) return current;
              const next = (current.index + delta + current.ids.length) % current.ids.length;
              return { ...current, index: next };
            });
          }}
        />
      </div>
    </Theme>
  );
}

/* ---------- detail step ---------- */

function Detail({
  member,
  phase,
  step,
  isDone,
  copied,
  canToggle,
  canGoNext,
  position,
  onCopy,
  onToggle,
  onPrev,
  onNext,
  onShot,
}) {
  const docBase = step.id.startsWith("f0-") ? JOURNEY.foundation : member;
  const docLink = step.anchor ? `${docBase.href}#${step.anchor}` : docBase.href;
  const command = displayCommand(member, step);

  return (
    <VStack gap={3}>
      <HStack gap={0.5} align="center" wrap="wrap">
        <Badge label={`${phase.id} · ${phase.title}`} variant="purple" />
        {phase.tag ? <Badge label={phase.tag} variant="neutral" /> : null}
        <Badge label={member.code} variant="info" />
      </HStack>

      <Heading level={2}>{step.title}</Heading>

      {step.materi?.length ? (
        <section className="detail-section">
          <Text type="label">Materi kuliah</Text>
          <div className="chips">
            {step.materi.map((item) => (
              <Badge key={item} label={item} variant="neutral" />
            ))}
          </div>
        </section>
      ) : null}

      <section className="detail-section">
        <Text type="label">Baca dulu</Text>
        <div className="read-links">
          <a className="read-link" href={docLink} target="_blank" rel="noopener noreferrer">
            <code>{docBase.doc}</code>
            <span aria-hidden="true">
              <ArrowUpRight />
            </span>
          </a>
        </div>
        <ul className="baca-list">
          {step.baca.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="detail-section">
        <Text type="label">Langkah kerja</Text>
        <ol className="work-list">
          {step.kerja.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ol>
      </section>

      {command ? (
        <section className="detail-section">
          <Text type="label">Perintah</Text>
          <HStack gap={1} align="center" justify="between">
            <Text type="supporting">{command.label}</Text>
            <Button
              label={copied ? "Tersalin" : "Salin"}
              variant="secondary"
              size="sm"
              onClick={() => onCopy(command.code)}
            />
          </HStack>
          <pre className="code">
            <code>{command.code}</code>
          </pre>
        </section>
      ) : null}

      <section className="detail-section">
        <Text type="label">Expected result</Text>
        <Card variant="green" padding={3}>
          <pre className="expected">{step.expected.text}</pre>
        </Card>
      </section>

      {step.expected.screens?.length ? (
        <section className="detail-section">
          <Text type="label">Layar target</Text>
          <Thumbs ids={step.expected.screens} onOpen={onShot} />
        </section>
      ) : null}

      {step.bukti ? (
        <Card variant="yellow" padding={3}>
          <p className="bukti">
            <strong>Bukti selesai: </strong>
            {step.bukti}
          </p>
        </Card>
      ) : null}

      <div className="detail-actions">
        <HStack gap={1.5} align="center" wrap="wrap">
          <Button
            label={isDone ? "Batalkan centang" : "Tandai selesai"}
            icon={isDone ? undefined : <Check />}
            variant={isDone ? "secondary" : "primary"}
            isDisabled={!canToggle}
            tooltip={!canToggle ? "Selesaikan langkah sebelumnya dulu." : undefined}
            onClick={onToggle}
          />
          {isDone ? (
            <HStack gap={0.5} align="center">
              <Check size={14} />
              <Text type="supporting">Langkah ini selesai</Text>
            </HStack>
          ) : (
            <Text type="supporting">{canToggle ? "Belum selesai" : "Terkunci oleh langkah sebelumnya"}</Text>
          )}
        </HStack>
        <div className="detail-nav">
          <HStack gap={1} align="center" justify="between" wrap="wrap">
            <Button
              label="Langkah sebelumnya"
              icon={<ArrowLeft />}
              variant="ghost"
              size="sm"
              isDisabled={!onPrev}
              onClick={onPrev}
            />
            <Text type="supporting">
              Langkah {position.index} dari {position.total}
            </Text>
            <Button
              label={position.index === position.total ? "Langkah terakhir" : "Langkah berikutnya"}
              icon={<ArrowRight />}
              variant="secondary"
              size="sm"
              isDisabled={!canGoNext}
              tooltip={
                !canGoNext && position.index < position.total ? "Tandai langkah ini selesai dulu." : undefined
              }
              onClick={onNext}
            />
          </HStack>
        </div>
      </div>
    </VStack>
  );
}
