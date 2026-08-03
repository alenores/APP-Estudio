import { execSync } from "node:child_process";
import type { NextConfig } from "next";
import withPWAInit from "next-pwa";
import cachePresets from "next-pwa/cache";

function gitShortSha(): string {
  if (process.env.VERCEL_GIT_COMMIT_SHA) {
    return process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7);
  }
  try {
    return execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
  } catch {
    return "sin-git";
  }
}

/** Caché de assets estáticos de la app (shell PWA); no datos de negocio. Ver ADR 001. */
const STATIC_ASSET_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

const BRAND_STATIC_MAX_AGE_SECONDS = 365 * 24 * 60 * 60;

/**
 * Los documentos HTML los atiende `worker/index.js` (ADR 012), por eso se quita
 * el preset `others` de next-pwa: dejaría navegaciones y payloads RSC en una
 * caché de 32 entradas / 24 h, insuficiente para consultar sin conexión.
 */
const defaultCachePresets = (cachePresets as Array<{ options?: { cacheName?: string } }>).filter(
  (entry) => entry.options?.cacheName !== "others",
);

const withPWA = withPWAInit({
  dest: "public",
  register: false,
  skipWaiting: true,
  clientsClaim: true,
  disable: process.env.NODE_ENV === "development",
  cacheOnFrontEndNav: true,
  /** El documento de `/` lo cachea el custom worker junto al resto (ADR 012). */
  cacheStartUrl: false,
  fallbacks: {
    document: "/offline",
  },
  runtimeCaching: [
    /**
     * Chunks y CSS con caché propia y tope alto: la app tiene una ruta por
     * pantalla y el preset genérico `.js` (32 entradas / 24 h) los desalojaba,
     * dejando documentos cacheados sin su JavaScript.
     */
    {
      urlPattern: /\/_next\/static\/chunks\/.+\.js$/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "app-static-chunks",
        expiration: {
          maxEntries: 384,
          maxAgeSeconds: STATIC_ASSET_MAX_AGE_SECONDS,
        },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    {
      urlPattern: /\/_next\/static\/css\/.+\.css$/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "app-static-css",
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: STATIC_ASSET_MAX_AGE_SECONDS,
        },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    /** Fuentes del build (`next/font`): el preset de fuentes guarda solo 4 / 7 días. */
    {
      urlPattern: /\/_next\/static\/media\/.+$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "app-static-media",
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: BRAND_STATIC_MAX_AGE_SECONDS,
        },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    /**
     * Payloads RSC de navegación cliente (`?_rsc=`). Con `ignoreVary` porque la
     * respuesta varía por `Next-Router-State-Tree` y nunca reencontraría su entrada.
     */
    {
      urlPattern: ({ url }: { url: URL }) =>
        self.origin === url.origin && url.searchParams.has("_rsc"),
      handler: "NetworkFirst",
      options: {
        cacheName: "app-rsc-payloads",
        networkTimeoutSeconds: 4,
        matchOptions: { ignoreVary: true },
        expiration: {
          maxEntries: 128,
          maxAgeSeconds: STATIC_ASSET_MAX_AGE_SECONDS,
        },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    {
      urlPattern: ({ url }: { url: URL }) => {
        const p = url.pathname;
        return (
          p === "/logo-identidad.png" ||
          p === "/icon-192x192.png" ||
          p === "/icon-512x512.png" ||
          p === "/favicon.ico" ||
          p === "/icon.png" ||
          p === "/apple-icon.png"
        );
      },
      handler: "CacheFirst",
      options: {
        cacheName: "brand-static-png",
        expiration: {
          maxEntries: 16,
          maxAgeSeconds: BRAND_STATIC_MAX_AGE_SECONDS,
        },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    /** API Supabase: siempre red (online-first). */
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\//i,
      handler: "NetworkOnly",
      options: {},
    },
    ...defaultCachePresets,
  ],
});

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_DEPLOY_SHA: gitShortSha(),
  },
  async headers() {
    const brandAssets = [
      "/favicon.ico",
      "/logo-identidad.png",
      "/icon-192x192.png",
      "/icon-512x512.png",
      "/manifest.webmanifest",
    ];
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
      ...brandAssets.map((src) => ({
        source: src,
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      })),
    ];
  },
};

export default withPWA(nextConfig);
