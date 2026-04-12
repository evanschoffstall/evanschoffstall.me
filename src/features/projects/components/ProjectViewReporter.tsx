"use client";

import { useEffect } from "react";

const ANALYTICS_ENDPOINT = "/api/views";
const JSON_CONTENT_TYPE = "application/json";
const REQUEST_IDLE_TIMEOUT_MS = 1000;
const REQUEST_IDLE_FALLBACK_MS = 250;

export function ProjectViewReporter({ slug }: { slug: string }) {
  useEffect(() => {
    let isCanceled = false;
    const requestBody = JSON.stringify({ slug });

    const reportView = () => {
      if (isCanceled) {
        return;
      }

      if (typeof navigator.sendBeacon === "function") {
        const payload = new Blob([requestBody], { type: JSON_CONTENT_TYPE });
        if (navigator.sendBeacon(ANALYTICS_ENDPOINT, payload)) {
          return;
        }
      }

      fetch(ANALYTICS_ENDPOINT, {
        body: requestBody,
        headers: {
          "Content-Type": JSON_CONTENT_TYPE,
        },
        keepalive: true,
        method: "POST",
      }).catch(() => {
        // Silently ignore analytics reporting failures to prevent user-facing errors.
      });
    };

    if (hasRequestIdleCallback()) {
      const idleCallbackId = window.requestIdleCallback(reportView, {
        timeout: REQUEST_IDLE_TIMEOUT_MS,
      });

      return () => {
        isCanceled = true;
        window.cancelIdleCallback(idleCallbackId);
      };
    }

    const timeoutId = window.setTimeout(reportView, REQUEST_IDLE_FALLBACK_MS);

    return () => {
      isCanceled = true;
      window.clearTimeout(timeoutId);
    };
  }, [slug]);

  return null;
}

function hasRequestIdleCallback(): boolean {
  return typeof window.requestIdleCallback === "function";
}
