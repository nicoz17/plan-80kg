type P = { className?: string };

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const IcHoy = (p: P) => (
  <svg {...base} {...p}>
    <path d="M3 10h3v4H3zM18 10h3v4h-3zM6 12h12M7 7v10M17 7v10" />
  </svg>
);

export const IcPeso = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 18 9 12l4 3 7-9" />
    <path d="M15 6h5v5" />
  </svg>
);

export const IcCompras = (p: P) => (
  <svg {...base} {...p}>
    <path d="M5 8h14l-1.4 11H6.4z" />
    <path d="M9 8a3 3 0 0 1 6 0" />
  </svg>
);

export const IcGuia = (p: P) => (
  <svg {...base} {...p}>
    <path d="M5 4h10a4 4 0 0 1 4 4v12H9a4 4 0 0 1-4-4z" />
    <path d="M9 9h6M9 13h4" />
  </svg>
);

export const IcCam = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
    <circle cx="12" cy="13" r="3.5" />
  </svg>
);

export const IcCheck = (p: P) => (
  <svg {...base} strokeWidth={3} {...p}>
    <path d="m5 12.5 4.5 4.5L19 7" />
  </svg>
);

export const IcX = (p: P) => (
  <svg {...base} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const IcPlato = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="7" />
    <circle cx="12" cy="12" r="3.5" />
  </svg>
);

export const IcFlecha = ({ dir, ...p }: P & { dir: "l" | "r" }) => (
  <svg {...base} {...p}>
    <path d={dir === "l" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
  </svg>
);
