"use client";
import { useRouter } from "next/navigation";
import { FigmaIcon } from "@/components/FigmaIcon";

export default function Logout() {
  const router = useRouter();
  return (
    <button
      onClick={async () => { await fetch("/api/auth", { method: "DELETE" }); router.push("/giris"); router.refresh(); }}
      className="inline-flex items-center gap-1.5 rounded-md border-[1.5px] border-ink/20 px-3 py-1.5 font-display text-[11px] font-bold text-ink/60 transition-colors hover:border-red-500 hover:text-red-600 [--figma-icon-accent:currentColor]">
      <FigmaIcon name="logout" className="h-3.5 w-3.5" /> ÇIKIŞ
    </button>
  );
}
