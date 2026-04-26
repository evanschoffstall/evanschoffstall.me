"use client";

import { useCallback, useState } from "react";

/**
 * Owns replay and settled state for the animated home hero name.
 * @param skipInitialAnimations - When true, initialize the hero in its settled state.
 * @returns State and callbacks used to drive the home hero animation.
 */
export function useHomeHeroState(skipInitialAnimations = false) {
  const [nameSettled, setNameSettled] = useState(skipInitialAnimations);
  const [heroRunId, setHeroRunId] = useState(0);

  const handleSettled = useCallback(() => {
    setNameSettled(true);
  }, []);

  const handleReplayHero = useCallback(() => {
    setNameSettled(false);
    setHeroRunId((runId) => runId + 1);
  }, []);

  return {
    handleReplayHero,
    handleSettled,
    heroRunId,
    nameSettled,
  };
}
