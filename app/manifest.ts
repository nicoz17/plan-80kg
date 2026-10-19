import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Plan 80",
    short_name: "Plan 80",
    description: "Plan 88 → 80 kg",
    start_url: "/",
    display: "standalone",
    background_color: "#2541d8",
    theme_color: "#2541d8",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
