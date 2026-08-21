"use client";
import {useEffect} from "react";

type BrandSettings={favicon_url?:string;apple_touch_icon_url?:string;site_name?:string};
function ensureLink(rel:string,id:string,href:string){let el=document.getElementById(id) as HTMLLinkElement|null;if(!el){el=document.createElement("link");el.id=id;el.rel=rel;document.head.appendChild(el)}el.href=href}
export default function BrandHead(){useEffect(()=>{fetch('/api/settings').then(r=>r.ok?r.json():{}).then((s:BrandSettings)=>{if(s.favicon_url)ensureLink('icon','cms-favicon',s.favicon_url);if(s.apple_touch_icon_url)ensureLink('apple-touch-icon','cms-apple-icon',s.apple_touch_icon_url);if(s.site_name&&document.title.startsWith('RECF Türkiye'))document.title=document.title.replace('RECF Türkiye',s.site_name)}).catch(()=>{})},[]);return null}
