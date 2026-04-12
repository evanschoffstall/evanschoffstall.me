import { useAnimationControls } from "framer-motion";

interface RunHomeHeroSequenceOptions {
  controls: ReturnType<typeof useAnimationControls>;
  onSettled?: () => void;
  placeholder: HTMLDivElement | null;
  setSettled: (value: boolean) => void;
}

/** Executes the intro hero animation from centered title to settled page title. */
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

/** Small delay between hero animation phases to preserve pacing. */
function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

/** Resolves once the browser has loaded the document and fonts for the hero. */
function waitForPageReady(): Promise<void> {
  return new Promise((resolve) => {
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