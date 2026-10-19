import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Plan 80",
    short_name: "Plan 80",
    description: "Plan 88 → 80 kg",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f2ed",
    theme_color: "#f4f2ed",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
