import { ArrowRight, Code2, Github, Linkedin, Mail, Rss, Terminal, Twitter, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "./components/card";
import Particles from "./components/particles";

const navigation = [
  { name: "Projects", href: "/projects" }
];

const socials = [
  { icon: <Github className="w-4 h-4" />, href: "https://github.com/evanschoffstall", label: "GitHub" },
  { icon: <Linkedin className="w-4 h-4" />, href: "https://www.linkedin.com/in/evan-schoffstall-2a9531163/", label: "LinkedIn" },
  { icon: <Twitter className="w-4 h-4" />, href: "https://twitter.com/evnschoffstall", label: "Twitter" },
  { icon: <Mail className="w-4 h-4" />, href: "mailto:hello@evanschoffstall.me", label: "Email" },
];

const highlights = [
  {
    icon: <Terminal className="w-4 h-4" />,
    title: "15+ Years Engineering",
    description: "Ground floor to executive, enriched multi-industry experience across the full stack.",
  },
  {
    icon: <Code2 className="w-4 h-4" />,
    title: "Full-Stack Expertise",
    description: "TypeScript, Python, Java, C#, PHP, SQL, Bash, PowerShell, and modern frameworks.",
  },
  {
    icon: <Rss className="w-4 h-4" />,
    title: "Founder of LibreRSS",
    description: "Reviving the extant tradition of free cloud news aggregation.",
  },
  {
    icon: <Users className="w-4 h-4" />,
    title: "Service-Oriented",
    description: "Extensive history serving users, employees, employers, clients, and customers alike.",
  },
];

export default function Home() {
  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-gradient-to-tl from-black via-zinc-600/20 to-black">
      <Particles className="absolute inset-0 -z-10 animate-fade-in" quantity={200} />

      {/* Nav */}
      <nav className="absolute top-0 left-0 right-0 animate-fade-in z-20">
        <div className="flex items-center justify-end px-6 py-4">
          <div className="flex items-center gap-4">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors duration-200">
                {item.name}
              </Link>
            ))}
            <span className="w-px h-3 bg-zinc-800" />
            {socials.map((s) => (
              <Link
                key={s.label}
                href={s.href}
                target="_blank"
                aria-label={s.label}
                className="text-zinc-600 hover:text-zinc-300 transition-colors duration-200">
                {s.icon}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Centered stack: name + tagline + card */}
      <div className="flex flex-col items-center justify-center min-h-screen px-6 py-20">
        <h1 className="z-10 text-4xl text-transparent bg-white cursor-default text-edge-outline animate-title font-display sm:text-6xl md:text-7xl lg:text-9xl whitespace-nowrap bg-clip-text">
          Evan Schoffstall
        </h1>

        <p className="mt-4 max-w-lg text-center text-sm text-zinc-500 animate-fade-in leading-relaxed">
          Software engineer. Currently building{" "}
          <Link
            target="_blank"
            href="https://librerss.com"
            className="text-zinc-300 underline underline-offset-4 decoration-zinc-700 hover:decoration-zinc-500 transition-colors duration-300">
            librerss.com
          </Link>
        </p>

        {/* About card */}
        <div className="w-full max-w-3xl mt-10 animate-fade-in-up ease-in-out">
          <Card>
            {/* Card header */}
            <div className="flex items-center gap-5 p-5 md:p-6 border-b border-zinc-800/50">
              <Image
                src="/pfp.png"
                alt="Evan Schoffstall"
                width={56}
                height={56}
                className="rounded-full ring-1 ring-zinc-800 shrink-0"
              />
              <div>
                <h2 className="text-sm font-medium text-zinc-100">Evan Schoffstall</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Full-Stack Engineer & Founder</p>
              </div>
              <div className="ml-auto hidden sm:block">
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 hover:border-zinc-700 transition-all duration-200 shadow-sm">
                  View projects
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Highlights grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-zinc-800/50">
              {highlights.map((item, i) => (
                <div
                  key={item.title}
                  className={`p-5 md:p-6 ${i >= 2 ? "border-t border-zinc-800/50" : ""}`}>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="flex items-center justify-center w-7 h-7 rounded-md bg-zinc-800/40 text-zinc-500">
                      {item.icon}
                    </div>
                    <h3 className="text-sm font-medium text-zinc-300">{item.title}</h3>
                  </div>
                  <p className="text-[13px] leading-relaxed text-zinc-600 pl-[38px]">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Mobile CTA */}
            <div className="p-4 border-t border-zinc-800/50 sm:hidden">
              <Link
                href="/projects"
                className="flex items-center justify-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-all duration-200 w-full">
                View projects
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
