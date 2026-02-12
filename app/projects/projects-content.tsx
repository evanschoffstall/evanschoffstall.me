"use client";

import type { Project } from "contentlayer/generated";
import { motion } from "framer-motion";
import { ArrowRight, Eye } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Card } from "../components/card";
import { Article } from "./article";

type Props = {
  featured: Project;
  top2: Project;
  top3: Project;
  sorted: Project[];
  sortedContributions: Project[];
  sortedLegacy: Project[];
  views: Record<string, number>;
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8, ease: "easeOut" } },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: "easeOut" } },
};

const dividerSlide = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: { scaleX: 1, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } },
};

export function ProjectsContent({ featured, top2, top3, sorted, sortedContributions, sortedLegacy, views }: Props) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="px-6 mx-auto space-y-8 max-w-7xl lg:px-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <h2 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
          Projects
        </h2>
        <p className="mt-4 text-zinc-400">
          Some of the projects are from work and some are on my own time.
        </p>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <motion.div
          className="w-full h-px bg-zinc-800"
          style={{ transformOrigin: "left" }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </motion.div>

      {/* Featured hero row */}
      <motion.div
        className="grid grid-cols-1 gap-4 md:grid-cols-3"
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
      >
        <motion.div className="relative" variants={fadeInUp}>
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/20 via-transparent to-zinc-700/20 rounded-lg blur-xl" />
          <Card>
            <Link href={`/projects/${featured.slug}`}>
              <article className="relative flex flex-col justify-between h-full p-4 md:p-6">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center rounded-md bg-zinc-800/50 px-2 py-0.5 text-[11px] font-medium text-zinc-500 ring-1 ring-inset ring-zinc-700/50 group-hover:text-zinc-400 group-hover:ring-zinc-600 transition-colors duration-300">
                      {featured.date ? (
                        <time dateTime={new Date(featured.date).toISOString()}>
                          {Intl.DateTimeFormat(undefined, {
                            dateStyle: "medium",
                          }).format(new Date(featured.date))}
                        </time>
                      ) : (
                        "SOON"
                      )}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-zinc-500 tabular-nums group-hover:text-zinc-400 transition-colors duration-300">
                      <Eye className="w-3.5 h-3.5" />{" "}
                      {Intl.NumberFormat("en-US", { notation: "compact" }).format(
                        views[featured.slug] ?? 0
                      )}
                    </span>
                  </div>

                  <h2
                    id="featured-post"
                    className="mt-3 text-xl font-bold tracking-tight text-zinc-100 group-hover:text-white sm:text-2xl font-display"
                  >
                    {featured.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400 group-hover:text-zinc-300 line-clamp-3 transition-colors duration-300">
                    {featured.description}
                  </p>
                </div>
                <div className="flex items-center gap-1 mt-4 text-xs font-medium text-zinc-500 group-hover:text-zinc-300 transition-colors duration-300">
                  <span>Read more</span>
                  <ArrowRight className="w-3.5 h-3.5 translate-x-0 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </article>
            </Link>
          </Card>
        </motion.div>
        {[top2, top3].map((project) => (
          <motion.div key={project.slug} className="relative" variants={fadeInUp}>
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/20 via-transparent to-zinc-700/20 rounded-lg blur-xl" />
            <Card>
              <Link href={`/projects/${project.slug}`}>
                <article className="relative flex flex-col justify-between h-full p-4 md:p-6">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center rounded-md bg-zinc-800/50 px-2 py-0.5 text-[11px] font-medium text-zinc-500 ring-1 ring-inset ring-zinc-700/50 group-hover:text-zinc-400 group-hover:ring-zinc-600 transition-colors duration-300">
                        {project.date ? (
                          <time dateTime={new Date(project.date).toISOString()}>
                            {Intl.DateTimeFormat(undefined, {
                              dateStyle: "medium",
                            }).format(new Date(project.date))}
                          </time>
                        ) : (
                          "SOON"
                        )}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-zinc-500 tabular-nums group-hover:text-zinc-400 transition-colors duration-300">
                        <Eye className="w-3.5 h-3.5" />{" "}
                        {Intl.NumberFormat("en-US", { notation: "compact" }).format(
                          views[project.slug] ?? 0
                        )}
                      </span>
                    </div>

                    <h2 className="mt-3 text-xl font-bold tracking-tight text-zinc-100 group-hover:text-white sm:text-2xl font-display">
                      {project.title}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-400 group-hover:text-zinc-300 line-clamp-3 transition-colors duration-300">
                      {project.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 mt-4 text-xs font-medium text-zinc-500 group-hover:text-zinc-300 transition-colors duration-300">
                    <span>Read more</span>
                    <ArrowRight className="w-3.5 h-3.5 translate-x-0 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </article>
              </Link>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Other projects — compact list */}
      {sorted.length > 0 && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          <motion.div
            className="w-full h-px bg-zinc-800"
            style={{ transformOrigin: "left" }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
          <motion.div
            className="space-y-2 mt-8"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.05,
                },
              },
            }}
          >
            {sorted.map((project) => (
              <motion.div key={project.slug} className="relative" variants={fadeInUp}>
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/20 via-transparent to-zinc-700/20 rounded-lg blur-xl" />
                <Card>
                  <Article project={project} views={views[project.slug] ?? 0} />
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}

      {/* Contributions — compact list */}
      {sortedContributions.length > 0 && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          <div className="flex items-center gap-4 pt-4">
            <h3 className="text-lg font-semibold tracking-tight text-zinc-100 shrink-0">
              Contributions
            </h3>
            <motion.div
              className="w-full h-px bg-zinc-800"
              style={{ transformOrigin: "left" }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <motion.div
            className="space-y-2 mt-8"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.05,
                },
              },
            }}
          >
            {sortedContributions.map((project) => (
              <motion.div key={project.slug} className="relative" variants={fadeInUp}>
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/20 via-transparent to-zinc-700/20 rounded-lg blur-xl" />
                <Card>
                  <Article project={project} views={views[project.slug] ?? 0} />
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}

      {/* Legacy — compact list */}
      {sortedLegacy.length > 0 && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          <div className="flex items-center gap-4 pt-4">
            <h3 className="text-lg font-semibold tracking-tight text-zinc-100 shrink-0">
              Legacy
            </h3>
            <motion.div
              className="w-full h-px bg-zinc-800"
              style={{ transformOrigin: "left" }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <motion.div
            className="space-y-2 mt-8"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.05,
                },
              },
            }}
          >
            {sortedLegacy.map((project) => (
              <motion.div key={project.slug} className="relative" variants={fadeInUp}>
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/20 via-transparent to-zinc-700/20 rounded-lg blur-xl" />
                <Card>
                  <Article project={project} views={views[project.slug] ?? 0} />
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
