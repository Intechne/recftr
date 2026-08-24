"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Keeps already-open public tabs in sync with CMS writes.
 * The page is hard-reloaded only when the server-side content revision changes.
 * This intentionally remounts legacy client pages too, so every /api/* GET is re-fetched.
 */
export default function ContentRefreshBridge({ initialRevision }: { initialRevision: string }) {
  const revisionRef = useRef(initialRevision || "0");
  const checkingRef = useRef(false);
  const reloadingRef = useRef(false);

  const check = useCallback(async () => {
    if (checkingRef.current || reloadingRef.current || document.visibilityState === "hidden") return;
    checkingRef.current = true;
    try {
      const response = await fetch("/api/content-revision", {
        cache: "no-store",
        credentials: "same-origin",
        headers: { "Cache-Control": "no-cache" },
      });
      if (!response.ok) return;
      const data = await response.json().catch(() => null) as { revision?: string } | null;
      const next = String(data?.revision || "0");
      if (next !== "0" && next !== revisionRef.current) {
        reloadingRef.current = true;
        window.location.reload();
        return;
      }
      revisionRef.current = next;
    } catch {
      // A transient network error must never replace fresh content with defaults.
    } finally {
      checkingRef.current = false;
    }
  }, []);

  useEffect(() => {
    const onFocus = () => { void check(); };
    const onVisibility = () => { if (document.visibilityState === "visible") void check(); };
    const onStorage = (event: StorageEvent) => {
      if (event.key === "recf-content-changed") void check();
    };
    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisibility);
    const timer = window.setInterval(() => { void check(); }, 60_000);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisibility);
      window.clearInterval(timer);
    };
  }, [check]);

  return null;
}
