"use client";
import { useEffect } from "react";
import { trackEvent, type FunnelEvent } from "@/components/analytics/track";

/** Sayfa görüntülendiğinde bir kez olay gönderir. */
export default function TrackView({ event, props }: { event: FunnelEvent; props?: Record<string, string> }) {
  const key = JSON.stringify(props || {});
  useEffect(() => { trackEvent(event, JSON.parse(key)); }, [event, key]);
  return null;
}
