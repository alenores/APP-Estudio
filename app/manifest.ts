import type { MetadataRoute } from "next";
import { PWA_HOME_ICON_LABEL } from "@/lib/pwa-home-label";
import { PUBLIC_STATIC_IMAGE_QUERY } from "@/lib/public-static-image-query";

export default function manifest(): MetadataRoute.Manifest {
  const q = PUBLIC_STATIC_IMAGE_QUERY;

  return {
    id: "/",
    scope: "/",
    name: "APP Estudio",
    short_name: PWA_HOME_ICON_LABEL,
    description: "Gestión personal del estudio en Platzi.",
    start_url: "/",
    display: "standalone",
    display_override: ["standalone", "browser"],
    orientation: "portrait",
    background_color: "#0f172a",
    theme_color: "#4f46e5",
    lang: "es-AR",
    icons: [
      {
        src: `/icon-192x192.png${q}`,
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: `/icon-192x192.png${q}`,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: `/icon-512x512.png${q}`,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: `/icon-512x512.png${q}`,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
