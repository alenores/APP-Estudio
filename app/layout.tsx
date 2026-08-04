import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { PreventViewportZoom } from "@/components/prevent-viewport-zoom";
import { AppLaunchSplash } from "@/components/pwa/app-launch-splash";
import { StandaloneStartRedirect } from "@/components/pwa/standalone-start-redirect";
import { EstudioDataRoot } from "@/components/shared/data/estudio-data-root";
import { DesarrollosDataRoot } from "@/components/shared/data/desarrollos-data-root";
import { OfflineShellWarmup } from "@/components/shared/offline/offline-shell-warmup";
import { NAV_STAGE_MAIN_CLASS } from "@/lib/nav-stage";
import { ServiceWorkerRegister } from "./sw-register";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "APP Estudio",
  description: "Gestión personal del estudio en Platzi.",
  applicationName: "APP Estudio",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "APP Estudio",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#08090b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} h-full antialiased`}
    >
      <head>
        <meta name="application-name" content="APP Estudio" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="APP Estudio" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#08090b" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(window.matchMedia("(display-mode: standalone)").matches||window.navigator.standalone===true){localStorage.setItem("pwa-installed-v1","1");localStorage.setItem("pwa-ever-standalone-v1","1");}}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${NAV_STAGE_MAIN_CLASS} min-h-full text-ink`}>
        <PreventViewportZoom />
        <ServiceWorkerRegister />
        <OfflineShellWarmup />
        <StandaloneStartRedirect />
        <AppLaunchSplash />
        <EstudioDataRoot>
          <DesarrollosDataRoot>{children}</DesarrollosDataRoot>
        </EstudioDataRoot>
      </body>
    </html>
  );
}
