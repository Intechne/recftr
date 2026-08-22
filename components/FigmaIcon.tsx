import type { SVGProps, ReactNode } from "react";

/**
 * RECF Türkiye — Figma Icon System v3.1 (Refined)
 * Source design page: “🧩 Icon System v3.1 — Refined”
 *
 * UI rules:
 * - 24×24 optical grid
 * - consistent 1.8px line weight
 * - dark/foreground structure via currentColor
 * - one restrained cyan brand accent
 * - compact enough for 16/20/24/32px UI use
 */
export type FigmaIconName =
  | "home" | "programs" | "events" | "news" | "documents" | "teams" | "gallery" | "about" | "location" | "route"
  | "dashboard" | "media" | "pages" | "applications" | "registrations" | "requirements" | "payments" | "inbox" | "users" | "audit" | "settings"
  | "upload" | "edit" | "delete" | "save" | "search" | "filter"
  | "profile" | "members" | "portal-events" | "portal-docs" | "portal-payments" | "security" | "logout"
  // Legacy aliases kept so older site modules remain compatible.
  | "robot" | "drone" | "kupa" | "plaka" | "saha" | "kumanda" | "kod" | "defter"
  | "duduk" | "takvim" | "konum" | "mentor" | "ittifak" | "rozet" | "zaman" | "rota"
  | "bayrak" | "yildiz" | "kayit" | "yayin" | "guven" | "anons" | "istatistik" | "ayarlar";

type Props = {
  name: FigmaIconName;
  className?: string;
  accent?: string;
  title?: string;
} & Omit<SVGProps<SVGSVGElement>, "name">;

const CYAN = "#29B9E5";

function alias(name:FigmaIconName):FigmaIconName {
  const map:Partial<Record<FigmaIconName,FigmaIconName>> = {
    kupa:"programs", takvim:"events", konum:"location", rota:"route", defter:"documents",
    kayit:"applications", yayin:"media", guven:"security", anons:"news", istatistik:"dashboard",
    ayarlar:"settings", mentor:"users", plaka:"profile", rozet:"registrations"
  };
  return map[name] || name;
}

export function FigmaIcon({name,className="h-5 w-5",accent=`var(--figma-icon-accent, ${CYAN})`,title,...props}:Props){
  const n=alias(name);
  const common={
    viewBox:"0 0 24 24", fill:"none", xmlns:"http://www.w3.org/2000/svg", className,
    role:title?"img":undefined, "aria-hidden":title?undefined:true, ...props
  } as SVGProps<SVGSVGElement>;
  const line={stroke:"currentColor",strokeWidth:1.8,strokeLinecap:"round" as const,strokeLinejoin:"round" as const,vectorEffect:"non-scaling-stroke" as const};
  const a=accent;
  const D=({x,y,s=1.55}:{x:number;y:number;s?:number})=><path d={`M${x} ${y-s}L${x+s} ${y}L${x} ${y+s}L${x-s} ${y}Z`} fill={a}/>;
  const Dot=({cx,cy,r=1.35}:{cx:number;cy:number;r?:number})=><circle cx={cx} cy={cy} r={r} fill={a}/>;
  const S=({children}:{children:ReactNode})=><svg {...common}>{title&&<title>{title}</title>}{children}</svg>;

  switch(n){
    case "home": return <S><path {...line} d="M4.5 10.8 12 4.5l7.5 6.3v8.7h-5.1v-5.4H9.6v5.4H4.5v-8.7Z"/><D x={18.1} y={6.6} s={1.25}/></S>;
    case "programs": return <S><path {...line} d="M4.5 4.5h6v6h-6v-6Zm9 0h6v6h-6v-6Zm-9 9h6v6h-6v-6Zm9 0h6v6h-6v-6Z"/><D x={16.5} y={7.5} s={1.15}/></S>;
    case "events": return <S><path {...line} d="M4.5 6.7h15v12.8h-15V6.7Zm3-3v5m9-5v5m-12 2.2h15"/><path {...line} d="M8 14h2.5m3 0H16m-8 3h2.5"/><D x={17.3} y={17} s={1.15}/></S>;
    case "news": return <S><path {...line} d="M5 5.5h10l4 4v9H5v-13Zm10 0v4h4M8 12h7m-7 3h8m-8 3h5"/><D x={18.2} y={5.3} s={1.15}/></S>;
    case "documents": return <S><path {...line} d="M6 4.5h9l3.5 3.5v11.5H6v-15Zm9 0V8h3.5M9 11h6m-6 3h6m-6 3h4"/><D x={7.9} y={7.2} s={1.1}/></S>;
    case "teams": return <S><circle {...line} cx="8.7" cy="8" r="3"/><path {...line} d="M3.8 19.2v-2.6c0-3.1 2.3-5.2 4.9-5.2s4.9 2.1 4.9 5.2v2.6"/><path {...line} d="M15 6.2a3 3 0 0 1 0 5.8m-.3 1.5c3.3 0 5.5 1.8 5.5 4.7v1"/><D x={16.7} y={8.9} s={1.05}/></S>;
    case "gallery": return <S><path {...line} d="M4.5 5h15v14h-15V5Z"/><circle {...line} cx="15.3" cy="9" r="1.6"/><path {...line} d="m6.8 16 4-4 3.1 3.1 2.3-2.4 3.3 3.3"/><D x={7.5} y={8.4} s={1.05}/></S>;
    case "about": return <S><circle {...line} cx="12" cy="12" r="8"/><path {...line} d="M12 10.8v5.1m0-8v.2"/><D x={17.4} y={6.7} s={1.05}/></S>;
    case "location": return <S><path {...line} d="M12 20s6-5.7 6-11a6 6 0 1 0-12 0c0 5.3 6 11 6 11Z"/><circle {...line} cx="12" cy="9" r="2.2"/><D x={15.6} y={14.7} s={1.05}/></S>;
    case "route": return <S><path {...line} d="m4.8 17.8 4.3-4.2 4.1 2.6 6-7"/><path {...line} d="M16.6 9.2h2.6v2.7"/><circle {...line} cx="4.8" cy="17.8" r="1.25"/><circle {...line} cx="9.1" cy="13.6" r="1.25"/><D x={19.2} y={9.2} s={1.1}/></S>;

    case "dashboard": return <S><path {...line} d="M4.5 4.5h6v6h-6v-6Zm9 0h6v3.8h-6V4.5Zm0 6.8h6v8.2h-6v-8.2Zm-9 2.7h6v5.5h-6V14Z"/><D x={16.5} y={8.3} s={1.05}/></S>;
    case "media": return <S><path {...line} d="M4.5 5.5h15v13h-15v-13Z"/><path {...line} d="m6.5 16 3.7-3.7 3.3 3.3 2.2-2.4 3.8 3.6"/><circle {...line} cx="15" cy="9.5" r="1.5"/><D x={7.2} y={8.7} s={1.05}/></S>;
    case "pages": return <S><path {...line} d="M6.5 4.5h11v14h-11v-14ZM9 8h6m-6 3h6m-6 3h4"/><path {...line} d="M4.5 6.5v14h11"/><D x={17.5} y={5.2} s={1.05}/></S>;
    case "applications": return <S><path {...line} d="M5.5 4.5h10l3 3v12h-13v-15Zm10 0v3h3"/><path {...line} d="m8.5 13 2.1 2.1 4.7-4.7"/><D x={17.2} y={16.8} s={1.05}/></S>;
    case "registrations": return <S><path {...line} d="M4.5 6.5h15v13h-15v-13Zm3-3v5m9-5v5m-12 2.1h15"/><path {...line} d="m8 15 1.8 1.8 4.3-4.3"/><D x={17.3} y={16.7} s={1.05}/></S>;
    case "requirements": return <S><path {...line} d="M6 4.5h12v15H6v-15ZM9 8h6m-6 3h6m-6 3h3"/><path {...line} d="m13.7 16.5 1.5 1.5 3.1-3.2"/><D x={17.4} y={6.2} s={1.05}/></S>;
    case "payments": return <S><path {...line} d="M4 7h16v10H4V7Zm0 3.3h16M7 14h4"/><D x={17.2} y={14} s={1.2}/></S>;
    case "inbox": return <S><path {...line} d="M4.5 6h15v12h-15V6Z"/><path {...line} d="m5 7 7 5.5L19 7"/><D x={17.4} y={17.1} s={1.05}/></S>;
    case "users": return <S><circle {...line} cx="8.7" cy="8" r="3"/><path {...line} d="M3.8 19v-2.4c0-3 2.3-5 4.9-5s4.9 2 4.9 5V19"/><circle {...line} cx="16.3" cy="9" r="2.2"/><path {...line} d="M15.1 13.4c3.4 0 5.1 1.7 5.1 4.2V19"/><D x={16.3} y={9} s={.82}/></S>;
    case "audit": return <S><path {...line} d="M6 4.5h12v15H6v-15ZM9 8h6m-6 3h6m-6 3h4"/><path {...line} d="m14 17 1.4 1.4 3-3"/><D x={17.3} y={6.1} s={1.05}/></S>;
    case "settings": return <S><circle {...line} cx="12" cy="12" r="3.2"/><path {...line} d="M12 3.5v2.1m0 12.8v2.1M3.5 12h2.1m12.8 0h2.1M6 6l1.5 1.5M16.5 16.5 18 18m0-12-1.5 1.5M7.5 16.5 6 18"/><D x={18.6} y={5.2} s={1.05}/></S>;
    case "upload": return <S><path {...line} d="M12 15V4.5m-3.4 3.4L12 4.5l3.4 3.4"/><path {...line} d="M5 14v5.5h14V14"/><D x={17.4} y={17.2} s={1.05}/></S>;
    case "edit": return <S><path {...line} d="m5 18.5 1.1-4.2L15.7 4.7l3.6 3.6-9.6 9.6L5 18.5Z"/><path {...line} d="m13.8 6.6 3.6 3.6"/><D x={6.7} y={15.5} s={.95}/></S>;
    case "delete": return <S><path {...line} d="M6.8 7h10.4m-8.3 0V4.7h6.2V7m-7 0 .7 12h6.4l.7-12M10.7 10.5v5m2.6-5v5"/><D x={17.9} y={5.5} s={.95}/></S>;
    case "save": return <S><path {...line} d="M5 4.5h11l3 3v12H5v-15Z"/><path {...line} d="M8 4.5v5h7v-5M8 19.5v-6h8v6"/><D x={17.3} y={7.5} s={.95}/></S>;
    case "search": return <S><circle {...line} cx="10.5" cy="10.5" r="5.4"/><path {...line} d="m14.5 14.5 4.8 4.8"/><D x={18.2} y={18.2} s={.95}/></S>;
    case "filter": return <S><path {...line} d="M4.5 5.5h15l-5.7 6.2v5.5L10.5 19v-7.3L4.5 5.5Z"/><D x={17.3} y={7.4} s={.95}/></S>;

    case "profile": return <S><path {...line} d="m12 3.8 7 3.1v10.2l-7 3.1-7-3.1V6.9L12 3.8Z"/><circle {...line} cx="12" cy="10" r="2.6"/><path {...line} d="M8.5 16.5c0-2.2 1.5-3.6 3.5-3.6s3.5 1.4 3.5 3.6"/><D x={17} y={7.2} s={1.0}/></S>;
    case "members": return <S><circle {...line} cx="8.2" cy="8.2" r="2.8"/><circle {...line} cx="16" cy="9" r="2.2"/><path {...line} d="M3.7 19v-2.3c0-3 2-4.9 4.5-4.9s4.5 1.9 4.5 4.9V19m1.5-5.8c3.5 0 5.8 1.8 5.8 4.8v1"/><D x={16} y={9} s={.82}/></S>;
    case "portal-events": return <S><path {...line} d="M4.5 6.5h15v13h-15v-13Zm3-3v5m9-5v5m-12 2.1h15M8 14h5m-5 3h3"/><D x={17.2} y={15.4} s={1.05}/></S>;
    case "portal-docs": return <S><path {...line} d="M6 4.5h9l3.5 3.5v11.5H6v-15Zm9 0V8h3.5M9 12h6m-6 3h4"/><D x={16.9} y={17.4} s={1.05}/></S>;
    case "portal-payments": return <S><path {...line} d="M4 7h16v10H4V7Zm0 3.3h16M7 14h4"/><D x={17.2} y={14} s={1.2}/></S>;
    case "security": return <S><path {...line} d="m12 3.5 7 3v5.3c0 4-2.6 7.1-7 8.7-4.4-1.6-7-4.7-7-8.7V6.5l7-3Z"/><path {...line} d="m8.8 12 2.1 2.1 4.4-4.5"/><D x={16.9} y={7.6} s={1.0}/></S>;
    case "logout": return <S><path {...line} d="M10 5H5v14h5m4-10 5 3-5 3m5-3H9"/><D x={19} y={12} s={1.05}/></S>;

    // Legacy STEM-specific glyphs retained in the refined line language.
    case "robot": return <S><path {...line} d="M7 7.2h10l2 2v7.3l-2 2H7l-2-2V9.2l2-2Z"/><path {...line} d="M9 4.5h6M12 4.5V2.8"/><circle cx="9.2" cy="12" r="1.1" fill={a}/><circle cx="14.8" cy="12" r="1.1" fill={a}/><path {...line} d="M9.3 15.4h5.4"/><D x={12} y={2.8} s={.8}/></S>;
    case "drone": return <S><path {...line} d="M8.5 9.5 12 12l3.5-2.5M12 12v4.5M7 8 4.8 5.8m12.2 2.2 2.2-2.2M7 16l-2.2 2.2m12.2-2.2 2.2 2.2"/><circle {...line} cx="5" cy="5" r="2.2"/><circle {...line} cx="19" cy="5" r="2.2"/><circle {...line} cx="5" cy="19" r="2.2"/><circle {...line} cx="19" cy="19" r="2.2"/><D x={12} y={12} s={1.05}/></S>;
    case "saha": return <S><path {...line} d="m12 3.5 8.5 8.5-8.5 8.5L3.5 12 12 3.5Z"/><path {...line} d="M7.5 12h9M12 7.5v9"/><D x={12} y={12} s={1.0}/></S>;
    case "kumanda": return <S><path {...line} d="M6.3 8.5h11.4l2.3 2.4-1.5 5.6h-4.1L12.7 15h-1.4l-1.7 1.5H5.5L4 10.9l2.3-2.4Z"/><path {...line} d="M7.2 11.2v3m-1.5-1.5h3"/><Dot cx={15.6} cy={11.6} r={.9}/><Dot cx={17.6} cy={13.7} r={.9}/></S>;
    case "kod": return <S><path {...line} d="m8.2 7-4 5 4 5m7.6-10 4 5-4 5M13.6 5.5l-3.2 13"/><D x={12} y={12} s={.9}/></S>;
    case "duduk": return <S><path {...line} d="M5.5 8.5h8.2l3 2.8-3.3 3.7h-2.5a4.2 4.2 0 1 1-5.4-6.5Z"/><circle {...line} cx="8.4" cy="13.4" r="1.6"/><D x={18.1} y={7.4} s={.9}/></S>;
    case "ittifak": return <S><path d="m4.5 12 4.5-4.5 4.5 4.5L9 16.5 4.5 12Z" fill="#EF3340"/><path d="m10.5 12 4.5-4.5 4.5 4.5-4.5 4.5-4.5-4.5Z" fill="#2F5BFF"/></S>;
    case "zaman": return <S><circle {...line} cx="12" cy="12.5" r="7"/><path {...line} d="M12 8.7v4.1h3M9.5 3.5h5"/><D x={17.8} y={6.1} s={.9}/></S>;
    case "bayrak": return <S><path {...line} d="M6.5 4v16m0-14.5c3.5-2 6.5 1.7 11 0v7.2c-4.5 1.7-7.5-2-11 0"/><D x={6.5} y={19.1} s={.9}/></S>;
    case "yildiz": return <S><path {...line} d="m12 4 2.1 4.7 5.1.5-3.8 3.5 1.1 5-4.5-2.6-4.5 2.6 1.1-5-3.8-3.5 5.1-.5L12 4Z"/><D x={12} y={11.7} s={1.0}/></S>;
    default: return <S><circle {...line} cx="12" cy="12" r="7"/><Dot cx={12} cy={12}/></S>;
  }
}
