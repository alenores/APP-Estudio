import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { PreventViewportZoom } from "@/components/prevent-viewport-zoom";
import { DeployShaFooter } from "@/components/deploy-sha-footer";
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
    statusBarStyle: "default",
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
  themeColor: "#2c5282",
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
        <meta name="theme-color" content="#2c5282" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(window.matchMedia("(display-mode: standalone)").matches||window.navigator.standalone===true){localStorage.setItem("pwa-installed-v1","1");localStorage.setItem("pwa-ever-standalone-v1","1");}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-paper text-ink">
        <PreventViewportZoom />
        <ServiceWorkerRegister />
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        <DeployShaFooter />
      </body>
    </html>
  );
}
