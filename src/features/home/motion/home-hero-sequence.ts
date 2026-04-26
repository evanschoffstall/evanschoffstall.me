import type { useAnimationControls } from "framer-motion";

/**
 * Animation controls and DOM anchors required to move the intro title into its settled home layout.
 */
interface RunHomeHeroSequenceOptions {
  controls: ReturnType<typeof useAnimationControls>;
  onSettled?: () => void;
  placeholder: HTMLDivElement | null;
  setSettled: (value: boolean) => void;
}

/**
 * Executes the intro hero animation from centered title to settled page title.
 * @param options - Animation controls, measurement anchor, and completion callbacks
 * for the home hero sequence.
 * @returns A promise that resolves after the title has settled into place.
 */
export async function runHomeHeroSequence(
  options: RunHomeHeroSequenceOptions,
): Promise<void> {
  const { controls, onSettled, placeholder, setSettled } = options;

  await waitForPageReady();
  await controls.start({
    letterSpacing: "0.02em",
    lineHeight: "100%",
    opacity: 1,
    transition: {
      duration: 2.2,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  });
  await delay(500);

  if (placeholder) {
    const rect = placeholder.getBoundingClientRect();

    await controls.start({
      left: rect.left + rect.width / 2,
      letterSpacing: "-0.02em",
      top: rect.top + rect.height / 2,
      transition: {
        duration: 2,
        ease: [0.22, 1, 0.36, 1],
      },
    });
  }

  setSettled(true);
  onSettled?.();
}

/**
 * Small delay between hero animation phases to preserve pacing.
 * @param milliseconds - The amount of time to wait before continuing the sequence.
 * @returns A promise that resolves after the requested delay.
 */
function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

/**
 * Resolves once the browser has loaded the document and fonts for the hero.
 * @returns A promise that resolves after document and font readiness are both satisfied.
 */
function waitForPageReady(): Promise<void> {
  return new Promise((resolve) => {
    /**
     * Continues once the browser reports both document and font readiness.
     */
    const proceed = () => {
      void document.fonts.ready.then(() => {
        resolve();
      });
    };

    if (document.readyState === "complete") {
      proceed();
    } else {
      window.addEventListener("load", proceed, { once: true });
    }
  });
}
