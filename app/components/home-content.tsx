"use client";
import { motion } from "framer-motion";
import { ArrowRight, Code2, Github, Linkedin, Mail, Rss, Terminal, Twitter, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";
import { Card } from "./card";
import { HeroName } from "./hero-name";

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
    title: "15+ Years",
    description: "Ground floor to executive across government, enterprise, and startups.",
  },
  {
    icon: <Code2 className="w-4 h-4" />,
    title: "Full Stack",
    description: "Web, cloud, and systems. TypeScript to Rust, React to Kubernetes.",
  },
  {
    icon: <Users className="w-4 h-4" />,
    title: "Builder & Leader",
    description: "From solo projects to team operations. Technical and business ownership.",
  },
  {
    icon: <Rss className="w-4 h-4" />,
    title: "Open Source",
    description: "LibreRSS, resh, and contributions to OpenEmu & Wineskin.",
  },
];

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8, ease: "easeOut" } },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: "easeOut" } },
};

export function HomeContent() {
  const [nameSettled, setNameSettled] = useState(false);

  const handleSettled = useCallback(() => {
    setNameSettled(true);
  }, []);

  return (
    <>
      {/* Nav */}
      <motion.nav
        className="absolute top-0 left-0 right-0 z-20"
        initial="hidden"
        animate={nameSettled ? "visible" : "hidden"}
        variants={fadeIn}
      >
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
      </motion.nav>

      {/* Centered stack: name + tagline + card */}
      <div className="flex flex-col items-center justify-center min-h-screen px-6 py-20">
        <HeroName onSettled={handleSettled} />

        {/* About card */}
        <motion.div
          className="w-full max-w-3xl mt-10 relative"
          initial="hidden"
          animate={nameSettled ? "visible" : "hidden"}
          variants={fadeInUp}
        >
          {/* Subtle glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/20 via-transparent to-zinc-700/20 rounded-lg blur-xl" />
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
                <p className="text-xs text-zinc-500 mt-0.5">Technologist, Engineer, and Business Officer</p>
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

            {/* Professional Summary */}
            <motion.div
              className="p-5 md:p-6 border-b border-zinc-800/50"
              initial={{ opacity: 0, y: 10 }}
              animate={nameSettled ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{
                duration: 0.5,
                delay: 0.6,
                ease: "easeOut",
              }}
            >
              <p className="text-[13px] leading-relaxed text-zinc-400">
                Technologist, engineer, and business officer with expertise spanning code to teams to revenue.
                Currently contributing to state-level public procurement systems and procurement operations. Previously facilitated compliant data science
                initiatives at a national utility and drove a local winery's technical operations from inception to multi-million dollar success.
              </p>
            </motion.div>

            {/* Highlights grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-zinc-800/50">
              {highlights.map((item, i) => (
                <motion.div
                  key={item.title}
                  className={`p-5 md:p-6 ${i >= 2 ? "border-t border-zinc-800/50" : ""}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={nameSettled ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.7 + i * 0.1,
                    ease: "easeOut",
                  }}
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="flex items-center justify-center w-7 h-7 rounded-md bg-zinc-800/40 text-zinc-500 shadow-lg shadow-zinc-950/50">
                      {item.icon}
                    </div>
                    <h3 className="text-sm font-medium text-zinc-300">{item.title}</h3>
                  </div>
                  <p className="text-[13px] leading-relaxed text-zinc-600 pl-[38px]">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Skills & Technologies */}
            <motion.div
              className="p-5 md:p-6 border-t border-zinc-800/50"
              initial={{ opacity: 0, y: 10 }}
              animate={nameSettled ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{
                duration: 0.5,
                delay: 1.1,
                ease: "easeOut",
              }}
            >
              <h3 className="text-sm font-medium text-zinc-300 mb-3">Core Stack</h3>
              <div className="space-y-2.5">
                <div className="flex items-start gap-3">
                  <span className="text-xs text-zinc-500 min-w-[80px] pt-0.5">Primary</span>
                  <p className="text-[13px] text-zinc-400 leading-relaxed">
                    TypeScript, Python, Rust, C# • React, Next.js, Node.js, .NET
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xs text-zinc-500 min-w-[80px] pt-0.5">Infrastructure</span>
                  <p className="text-[13px] text-zinc-400 leading-relaxed">
                    Docker, Kubernetes • AWS, Azure • CI/CD automation
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xs text-zinc-500 min-w-[80px] pt-0.5">Data</span>
                  <p className="text-[13px] text-zinc-400 leading-relaxed">
                    PostgreSQL, Redis • SAP ERP • Data pipelines & analytics
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xs text-zinc-500 min-w-[80px] pt-0.5">Also</span>
                  <p className="text-[13px] text-zinc-400 leading-relaxed">
                    Java, Go, C++, Swift, PHP • MySQL, MariaDB • OpenShift, Vercel, Jenkins
                  </p>
                </div>
              </div>
            </motion.div>

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
        </motion.div>
      </div>
    </>
  );
}
