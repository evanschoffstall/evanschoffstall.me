"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import {
  consumeProjectsScrollPosition,
  registerProjectsViewport,
} from "@/features/projects/browser";

/** Hash-driven state machine for switching between the home and projects views. */
export function useProjectsSectionState() {
  const [hasResolvedInitialHash, setHasResolvedInitialHash] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const [skipHomeIntro, setSkipHomeIntro] = useState(false);
  const [skipInitialProjectsEnter, setSkipInitialProjectsEnter] =
    useState(false);
  const projectsViewportRef = useRef<HTMLDivElement>(null);

  const handleViewProjects = useCallback(() => {
    setSkipHomeIntro(true);
    setSkipInitialProjectsEnter(false);
    setShowProjects(true);
    window.history.replaceState(null, "", "#projects");
  }, []);

  const handleBack = useCallback(() => {
    setSkipHomeIntro(true);
    setShowProjects(false);
    window.history.replaceState(null, "", window.location.pathname);
  }, []);

  useLayoutEffect(() => {
    const hasProjectsHash = isProjectsHash();
    setSkipHomeIntro((previous) => previous || hasProjectsHash);
    setSkipInitialProjectsEnter((previous) => previous || hasProjectsHash);
    setShowProjects(hasProjectsHash);
    setHasResolvedInitialHash(true);
  }, []);

  useEffect(() => {
    const syncFromHash = () => {
      const hasProjectsHash = isProjectsHash();
      setSkipHomeIntro((previous) => previous || hasProjectsHash);
      setSkipInitialProjectsEnter((previous) => previous || hasProjectsHash);
      setShowProjects(hasProjectsHash);
    };

    window.addEventListener("hashchange", syncFromHash);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("hashchange", syncFromHash);
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (!showProjects) {
      registerProjectsViewport(null);
      return;
    }

    registerProjectsViewport(projectsViewportRef.current);

    const storedPosition = consumeProjectsScrollPosition();
    if (storedPosition === null) {
      return;
    }

    requestAnimationFrame(() => {
      if (projectsViewportRef.current) {
        projectsViewportRef.current.scrollTop = storedPosition;
      }
    });
  }, [showProjects]);

  return {
    handleBack,
    handleViewProjects,
    hasResolvedInitialHash,
    projectsViewportRef,
    showProjects,
    skipHomeIntro,
    skipInitialProjectsEnter,
  };
}

function isProjectsHash(): boolean {
  return typeof window !== "undefined" && window.location.hash === "#projects";
}