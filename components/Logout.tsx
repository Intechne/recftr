"use client";
import { useRouter } from "next/navigation";
import { FigmaIcon } from "@/components/FigmaIcon";
import { useState } from "react";

export default function Logout() {
  const router = useRouter();
  const [error, setError] = useState("");
  return (
    <><button
      onClick={async () => { const response = await fetch("/api/auth", { method: "DELETE" }); if (!response.ok) { setError("Çıkış tamamlanamadı. Yeniden deneyin."); return; } router.push("/giris"); router.refresh(); }}
      className="inline-flex items-center gap-1.5 rounded-md border-[1.5px] border-ink/20 px-3 py-1.5 font-display text-[11px] font-bold text-ink/60 transition-colors hover:border-red-500 hover:text-red-600 [--figma-icon-accent:currentColor]">
      <FigmaIcon name="logout" className="h-3.5 w-3.5" /> ÇIKIŞ
    </button>{error && <span role="alert" className="text-red-700">{error}</span>}</>
  );
}
