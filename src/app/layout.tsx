import type { Metadata, Viewport } from "next";

import { Inter } from "next/font/google";
import LocalFont from "next/font/local";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        <div className="
          pointer-events-none fixed inset-0 bg-gradient-to-tr from-zinc-900/20
          via-black to-zinc-800/20
        " />
        <div className="
          pointer-events-none fixed inset-0
          bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))]
          from-zinc-800/5 via-transparent to-transparent
        " />
        <div className="relative">{children}</div>
      </body>
    </html>
  );
}
