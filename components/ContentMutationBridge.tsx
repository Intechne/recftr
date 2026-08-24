"use client";

import { useEffect } from "react";
import { notifyPublicContentChanged } from "@/lib/content-client";

const METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * Announces successful same-origin CMS/portal mutations to other browser tabs.
 * It does not alter the request or response and is purely a preview synchronization aid.
 */
export default function ContentMutationBridge() {
  useEffect(() => {
    const original = window.fetch.bind(window);
    const patched: typeof window.fetch = async (input, init) => {
      const response = await original(input, init);
      try {
        const method = String(init?.method || (input instanceof Request ? input.method : "GET")).toUpperCase();
        const raw = typeof input === "string" || input instanceof URL ? String(input) : input.url;
        const url = new URL(raw, window.location.href);
        if (response.ok && METHODS.has(method) && url.origin === window.location.origin && url.pathname.startsWith("/api/")) {
          notifyPublicContentChanged();
        }
      } catch {}
      return response;
    };
    window.fetch = patched;
    return () => { window.fetch = original; };
  }, []);
  return null;
}
