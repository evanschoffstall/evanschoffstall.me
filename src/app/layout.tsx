import { Metadata } from "next";
import { Inter } from "next/font/google";
import LocalFont from "next/font/local";
import "../global.css";

export const metadata: Metadata = {
  title: {
    default: "evanschoffstall.me",
    template: "%s | evanschoffstall.me",
  },
  description:
    "Founder and lead developer of librerss.com, specializing in web, software, and cloud development",
  openGraph: {
    title: "evanschoffstall.me",
    description:
      "Founder and lead developer of librerss.com, specializing in web, software, and cloud development",
    url: "https://evanschoffstall.me",
    siteName: "evanschoffstall.me",
    images: [
      {
        url: "https://evanschoffstall.me/og.png",
        width: 1920,
        height: 1080,
      },
    ],
    locale: "en-US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  twitter: {
    title: "evanschoffstall",
    card: "summary_large_image",
  },
  icons: {
    shortcut: "/favicon.png",
  },
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
    <html lang="en" className={[inter.variable, calSans.variable].join(" ")}>
      <body
        className={[
          "bg-black",
          process.env.NODE_ENV === "development" ? "debug-screens" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="fixed inset-0 bg-gradient-to-tr from-zinc-900/20 via-black to-zinc-800/20 pointer-events-none" />
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-800/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative">{children}</div>
      </body>
    </html>
  );
}
