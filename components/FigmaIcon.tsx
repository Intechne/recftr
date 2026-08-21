import type { SVGProps, ReactNode } from "react";

export type FigmaIconName =
  | "robot" | "drone" | "kupa" | "plaka" | "saha" | "kumanda" | "kod" | "defter"
  | "duduk" | "takvim" | "konum" | "mentor" | "ittifak" | "rozet" | "zaman" | "rota"
  | "bayrak" | "yildiz" | "kayit" | "yayin" | "guven" | "anons" | "istatistik" | "ayarlar";

const cyan="#29B9E5";

export function FigmaIcon({name,className="h-5 w-5",...props}:{name:FigmaIconName;className?:string}&Omit<SVGProps<SVGSVGElement>,"name">){
  const common={viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",className,"aria-hidden":true,...props};
  const ink="currentColor";
  const C=({children}:{children:ReactNode})=><svg {...common}>{children}</svg>;
  switch(name){
    case "robot": return <C><path fill={ink} d="M5 6h3l1.5-2h5L16 6h3v2h2v8h-2v2H5v-2H3V8h2V6Zm3 4 2 2-2 2-2-2 2-2Zm8 0 2 2-2 2-2-2 2-2ZM9 16h6v-2H9v2Z"/><path fill={cyan} d="m12 1.5 1.5 1.5L12 4.5 10.5 3 12 1.5Zm-4 8L10.5 12 8 14.5 5.5 12 8 9.5Z"/></C>;
    case "drone": return <C><path fill={ink} d="M4 3h6v2H8l4 5 4-5h-2V3h6v2h-2l-4 6 4 5h2v2h-6v-2h2l-4-4-4 4h2v2H4v-2h2l4-5-4-6H4V3Z"/><path fill={cyan} d="m12 9 2 2-2 2-2-2 2-2Z"/></C>;
    case "kupa": return <C><path fill={ink} d="M5 4h14v3c0 3-2 5-5 5.8V16h3v2H7v-2h3v-3.2C7 12 5 10 5 7V4Zm-2 1h2v4H3V5Zm16 0h2v4h-2V5Z"/><path fill={cyan} d="m12 7 2 2-2 2-2-2 2-2Z"/></C>;
    case "plaka": return <C><path fill={ink} d="M4 5h16l2 3v8l-2 3H4l-2-3V8l2-3Zm3 5h3v5H7v-5Zm5 0h3v5h-3v-5Zm5 0h3v5h-3v-5Z"/><path fill={cyan} d="M4 5h16l2 3H2l2-3Z"/></C>;
    case "saha": return <C><path fill={ink} d="m12 2 10 10-10 10L2 12 12 2Zm0 3.2L5.2 12 12 18.8 18.8 12 12 5.2Z"/><path fill={cyan} d="m12 8 2 4-2 4-2-4 2-4Z"/></C>;
    case "kumanda": return <C><path fill={ink} d="M5 8h14l3 3-2 6h-5l-2-2h-2l-2 2H4l-2-6 3-3Zm2 2v2H5v2h2v2h2v-2h2v-2H9v-2H7Z"/><circle cx="16" cy="12" r="1.2" fill={cyan}/><circle cx="19" cy="15" r="1.2" fill={cyan}/></C>;
    case "kod": return <C><path fill={ink} d="m8 5-6 7 6 7 2-2-4-5 4-5-2-2Zm8 0-2 2 4 5-4 5 2 2 6-7-6-7Z"/><path fill={cyan} d="m13.5 3-3 18h3l3-18h-3Z"/></C>;
    case "defter": return <C><path fill={ink} d="M5 3h14v18H5V3Zm3 4h8v2H8V7Zm0 4h8v2H8v-2Zm0 4h6v2H8v-2ZM2 6h3v2H2V6Zm0 4h3v2H2v-2Zm0 4h3v2H2v-2Z"/><path fill={cyan} d="m16 15 3 2-3 2-3-2 3-2Z"/></C>;
    case "duduk": return <C><path fill={ink} d="M4 7h9v3h3l3 3-4 4h-3a5 5 0 1 1-8-10Zm5 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"/><path fill={cyan} d="m17 5 1.5 1.5L17 8l-1.5-1.5L17 5Zm3 3 1 1-1 1-1-1 1-1Z"/></C>;
    case "takvim": return <C><path fill={ink} d="M4 5h16v16H4V5Zm3 6v3h3v-3H7Zm5 0v3h3v-3h-3Zm-5 5v3h3v-3H7Zm5 0v3h3v-3h-3Z"/><path fill={cyan} d="M4 5h16v4H4V5Z"/><path fill={ink} d="M7 2h2v5H7V2Zm8 0h2v5h-2V2Z"/></C>;
    case "konum": return <C><path fill={ink} d="M12 2c4 0 7 3 7 7 0 5-7 13-7 13S5 14 5 9c0-4 3-7 7-7Zm0 4-4 3 4 3 4-3-4-3Z"/><path fill={cyan} d="m12 7 2 2-2 2-2-2 2-2Z"/></C>;
    case "mentor": return <C><circle cx="9" cy="7" r="4" fill={ink}/><path fill={ink} d="M4 20h10l-1.5-7h-7L4 20Z"/><path fill={cyan} d="M15 6h4l-1.5-1.5L19 3l4 4-4 4-1.5-1.5L19 8h-4V6Z"/></C>;
    case "ittifak": return <C><path fill="#EF3340" d="m3 12 6-6 6 6-6 6-6-6Z"/><path fill="#2F5BFF" d="m9 12 6-6 6 6-6 6-6-6Z"/></C>;
    case "rozet": return <C><path fill={ink} d="M12 2 18 5v7l-2 3v6l-4-2-4 2v-6l-2-3V5l6-3Zm0 4-4 2v3l4 3 4-3V8l-4-2Z"/><path fill={cyan} d="m12 8 2 2-2 2-2-2 2-2Z"/></C>;
    case "zaman": return <C><circle cx="12" cy="13" r="8" fill={ink}/><circle cx="12" cy="13" r="5" fill="white"/><path fill={ink} d="M11 2h3v3h-3V2Zm6 3 2 2-1.4 1.4-2-2L17 5Z"/><path fill={cyan} d="M12 9h1v4h-4v-1h3V9Z"/></C>;
    case "rota": return <C><path fill={ink} d="m4 16 3-3 3 3-3 3-3-3Zm13-11 2 1-1 2-2-1 1-2Zm-8 9 1.5-1.2 1.2 1.5-1.5 1.2L9 14Zm3-2 1.5-1.2 1.2 1.5-1.5 1.2L12 12Zm3-2 1.5-1.2 1.2 1.5-1.5 1.2L15 10Z"/><path fill={cyan} d="m12 12 2 2-2 2-2-2 2-2Zm7-8 3 1-2 3-1-4Z"/></C>;
    case "bayrak": return <C><path fill={ink} d="M6 3h2v18H6V3Zm2 1c4-2 7 2 12 0v7c-5 2-8-2-12 0V4Z"/><path fill={cyan} d="m7 19 2 2-2 2-2-2 2-2Z"/></C>;
    case "yildiz": return <C><path fill={ink} d="m12 2 2.3 6.3L21 10l-5 4 1 7-5-4-5 4 1-7-5-4 6.7-1.7L12 2Z"/><path fill={cyan} d="m12 8 3 3-3 3-3-3 3-3Zm8-3 1 1-1 1-1-1 1-1Z"/></C>;
    case "kayit": return <C><path fill={ink} d="m6 18 9-14 4 3-9 14H6v-3Z"/><path fill={cyan} d="m5 17 4 4H5v-4Zm11-14 4 3-1 2-4-3 1-2Z"/><path fill={ink} d="M11 20h10v2H11z"/></C>;
    case "yayin": return <C><path fill={ink} d="M10 21h4l-1-10h-2l-1 10Zm2-17 2 2-2 2-2-2 2-2Z"/><path fill={cyan} d="M7 7a7 7 0 0 0 0 10l1.5-1.5a5 5 0 0 1 0-7L7 7Zm10 0-1.5 1.5a5 5 0 0 1 0 7L17 17a7 7 0 0 0 0-10Z"/></C>;
    case "guven": return <C><path fill={ink} d="m12 2 8 3v6c0 5-3 9-8 11-5-2-8-6-8-11V5l8-3Z"/><path fill={cyan} d="m8 12 2.5 2.5L16 9l2 2-7.5 7.5L6 14l2-2Z"/></C>;
    case "anons": return <C><path fill={ink} d="M3 9h5l8-4v14l-8-4H3V9Zm5 6 2 5H7l-2-5h3Z"/><path fill={cyan} d="m18 7 2-1 1 2-2 1-1-2Zm1 4h3v2h-3v-2Zm-1 4 1-2 2 1-1 2-2-1Z"/></C>;
    case "istatistik": return <C><path fill={ink} d="M3 20h18v2H3v-2Zm2-7h3v6H5v-6Zm5-4h3v10h-3V9Zm5-4h3v14h-3V5Z"/><path fill={cyan} d="m5 10 5-4 4 2 5-5 2 2-6 6-4-2-4 3-2-2Z"/></C>;
    case "ayarlar": return <C><path fill={ink} d="m12 2 7 4v8l-7 4-7-4V6l7-4Zm0 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/><circle cx="12" cy="10" r="2" fill={cyan}/><path fill={cyan} d="m12 1 1 1-1 1-1-1 1-1Z"/></C>;
  }
}
