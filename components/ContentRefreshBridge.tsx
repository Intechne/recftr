"use client";

import { useEffect, useRef } from "react";

/**
 * Keeps a public tab in sync with CMS writes made in another tab of the same browser
 * without polling the database. Server-side cache invalidation is still handled by
 * revalidateTag/revalidatePath; this bridge only provides immediate editor preview UX.
 */
export default function ContentRefreshBridge() {
  const seenRef = useRef(0);
  const reloadingRef = useRef(false);

  useEffect(() => {
    const readRevision = () => {
      const n = Number(localStorage.getItem("recf-content-changed") || 0);
      return Number.isFinite(n) ? n : 0;
    };
    seenRef.current = readRevision();

    const maybeReload = () => {
      if (reloadingRef.current) return;
      const next = readRevision();
      if (next > seenRef.current) {
        reloadingRef.current = true;
        window.location.reload();
      }
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key === "recf-content-changed") maybeReload();
    };
    const onFocus = () => maybeReload();
    const onVisibility = () => {
      if (document.visibilityState === "visible") maybeReload();
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return null;
}
