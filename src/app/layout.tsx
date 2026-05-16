import type { Metadata, Viewport } from "next";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Inter } from "next/font/google";
import LocalFont from "next/font/local";

import { ParticlesBackground } from "@/components";
import { ANIMATION } from "@/shared";

import "./globals.css";

export const metadata: Metadata = {
  description:
    "Founder and lead developer of librerss.com, specializing in web, software, and cloud development",
  icons: {
    shortcut: "/favicon.png",
  },
  openGraph: {
    description:
      "Founder and lead developer of librerss.com, specializing in web, software, and cloud development",
    images: [
      {
        height: 1080,
        url: "https://evanschoffstall.me/og.png",
        width: 1920,
      },
    ],
    locale: "en-US",
    siteName: "evanschoffstall.me",
    title: "evanschoffstall.me",
    type: "website",
    url: "https://evanschoffstall.me",
  },
  other: {
    "darkreader-lock": "true",
  },
  robots: {
    follow: true,
    googleBot: {
      follow: true,
      index: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
    index: true,
  },
  title: {
    default: "evanschoffstall.me",
    template: "%s | evanschoffstall.me",
  },
  twitter: {
    card: "summary_large_image",
    title: "evanschoffstall",
  },
};

/**
 * Declares this site as natively dark so browsers and browser extensions such
 * as Dark Reader treat it as already dark-mode aware and skip any automatic
 * color augmentation that would invert or recolor the canvas particle layer.
 */
export const viewport: Viewport = {
  colorScheme: "dark",
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const calSans = LocalFont({
  src: "../../public/fonts/CalSans-SemiBold.ttf",
  variable: "--font-calsans",
});

/**
 * Child subtree rendered inside the app's root HTML shell.
 */
interface RootLayoutProps {
  children: React.ReactNode;
}

/**
 * Renders the root HTML shell and shared background layers for the site.
 * @param props - The application subtree rendered inside the root layout.
 * @returns The document shell for the App Router.
 */
export default function RootLayout(props: RootLayoutProps) {
  const { children } = props;

  return (
    <html className={[inter.variable, calSans.variable].join(" ")} lang="en">
      <body
        className={[
          "bg-black",
          process.env.NODE_ENV === "development" ? "debug-screens" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <ParticlesBackground quantity={ANIMATION.DEFAULT_PARTICLE_QUANTITY} />
        <div
          className="
          pointer-events-none fixed inset-0 bg-linear-to-tr from-zinc-900/20
          via-black to-zinc-800/20
        "
        />
        <div
          className="
          pointer-events-none fixed inset-0
          bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))]
          from-zinc-800/5 via-transparent to-transparent
        "
        />
        <div className="relative">{children}</div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
