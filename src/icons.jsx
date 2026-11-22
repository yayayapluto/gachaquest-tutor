/* Ikon UI: SVG inline, mewarisi `currentColor`, ukuran via prop.
   Tidak memakai glyph ASCII/emoji agar konsisten di semua font. */

const base = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true",
  focusable: "false",
};

export function ArrowLeft({ size = 16 }) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M19 12H5" />
      <path d="m11 18-6-6 6-6" />
    </svg>
  );
}

export function ArrowRight({ size = 16 }) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export function ArrowUpRight({ size = 14 }) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}

export function Check({ size = 14 }) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="m4 12.5 5 5L20 6.5" />
    </svg>
  );
}

export function X({ size = 16 }) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export function Sun({ size = 16 }) {
  return (
    <svg {...base} width={size} height={size}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

export function Moon({ size = 16 }) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  );
}

export function MoreHorizontal({ size = 16 }) {
  return (
    <svg {...base} width={size} height={size}>
      <circle cx="5" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
    </svg>
  );
}
