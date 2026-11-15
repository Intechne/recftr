import { unstable_cache } from "next/cache";
import { cache } from "react";
import {
  getEvent,
  getFoundingCount,
  getNews,
  getPage,
  getProgram,
  getPublicHomeSnapshot,
  getSettings,
  listDocuments,
  listEvents,
  listMedia,
  listNews,
  listPrograms,
  listPartners,
  listPublicStaff,
  listTeams,
} from "@/lib/db";
import { applyTokens, publishable, sitePage } from "@/lib/site-pages";
import { worldChampionship } from "@/lib/site-config";
import { PUBLIC_SETTING_KEYS } from "@/lib/content-consistency";
import { FALLBACK_PROGRAMS, fallbackProgram } from "@/lib/program-fallback";
import { publicTickerMessages } from "@/lib/public-announcements";
import { correctAchieveContent, publicEvent } from "@/lib/public-content";

import { currentContactEmails, currentContactSettings } from "@/lib/public-contact";

const TTL = 300;
const TAG = "public-content";
const plainRows = (rows: any) => Array.isArray(rows) ? rows.map((row: any) => row && typeof row === "object" ? { ...row } : row) : [];

const publicSettingsData = unstable_cache(
  async () => getSettings(PUBLIC_SETTING_KEYS),
  ["public-settings-v314"],
  { revalidate: TTL, tags: [TAG] },
);
const foundingCountData = unstable_cache(async () => getFoundingCount(), ["public-founding-count-v1"], { revalidate: TTL, tags: [TAG] });
/** Founding 100 sayısı (aktif onaylı takım, en fazla 100). Hata durumunda null. */
export const getCachedFoundingCount = cache(async () => { try { return await foundingCountData(); } catch { return null; } });

export const getCachedPublicSettings = cache(async () => {
  const founding = await getCachedFoundingCount();
  try { const settings=await publicSettingsData(); return {...currentContactSettings(settings),ticker:JSON.stringify(publicTickerMessages(settings.ticker,Date.now(),founding))}; } catch { return {...currentContactSettings({}),ticker:JSON.stringify(publicTickerMessages(undefined,Date.now(),founding))}; }
});
/** World Championship bilgisi — tek kaynak: CMS ayarı, yoksa site-config ortak bilgisi. */
export async function getWorldChampionship(){ try{return worldChampionship(await publicSettingsData());}catch{return worldChampionship({});} }

const homeSnapshotData = unstable_cache(
  async () => getPublicHomeSnapshot(PUBLIC_SETTING_KEYS),
  ["public-home-snapshot-v314"],
  { revalidate: TTL, tags: [TAG] },
);
export async function getCachedHomeSnapshot(){
  try { const data = await homeSnapshotData(); return { ...data, settings: currentContactSettings(data.settings), programs: data.programs.map(correctAchieveContent), events: data.events.map((e:any) => publicEvent(e)) }; }
  catch { return {programs:[],events:[],news:[],recfNews:[],teamCities:[],media:[],settings:currentContactSettings({}),stats:{teams:0,cities:0,events:0,students:0,programs:0,founding:0}}; }
}

const programsData = unstable_cache(async () => listPrograms(false), ["public-programs-v314"], { revalidate: TTL, tags: [TAG] });
export async function getCachedPrograms(){ try{const r=await programsData();return ((Array.isArray(r)&&r.length)?r:FALLBACK_PROGRAMS).map(correctAchieveContent);}catch{return FALLBACK_PROGRAMS.map(correctAchieveContent);} }

const programData = unstable_cache(async (slug:string) => getProgram(slug), ["public-program-v314"], { revalidate: TTL, tags: [TAG] });
export async function getCachedProgram(slug:string){ let program;try{program=(await programData(slug))??fallbackProgram(slug);}catch{program=fallbackProgram(slug);}return program?correctAchieveContent(program):null; }

const eventsData = unstable_cache(async () => plainRows(await listEvents(false)), ["public-events-v314"], { revalidate: TTL, tags: [TAG] });
export async function getCachedEvents(){ try{return (await eventsData()).map((e:any)=>publicEvent(e));}catch{return [];} }

const eventData = unstable_cache(async (slug:string) => getEvent(slug), ["public-event-v314"], { revalidate: TTL, tags: [TAG] });
export async function getCachedEvent(slug:string){ try{const e=await eventData(slug);return e?publicEvent(e):null;}catch{return null;} }

const newsData = unstable_cache(async () => plainRows(await listNews(false)), ["public-news-v314"], { revalidate: TTL, tags: [TAG] });
export async function getCachedNews(){ try{return await newsData();}catch{return [];} }

const newsItemData = unstable_cache(async (slug:string) => getNews(slug), ["public-news-item-v314"], { revalidate: TTL, tags: [TAG] });
export async function getCachedNewsItem(slug:string){ try{return await newsItemData(slug);}catch{return null;} }

const documentsData = unstable_cache(async () => plainRows(await listDocuments(false)), ["public-documents-v314"], { revalidate: TTL, tags: [TAG] });
export async function getCachedDocuments(){ try{return await documentsData();}catch{return [];} }

const teamsData = unstable_cache(async () => plainRows(await listTeams(false)), ["public-teams-v314"], { revalidate: TTL, tags: [TAG] });
export async function getCachedTeams(){ try{return await teamsData();}catch{return [];} }

const mediaData = unstable_cache(async () => plainRows(await listMedia(false)), ["public-media-v314"], { revalidate: TTL, tags: [TAG] });
export async function getCachedMedia(){ try{return await mediaData();}catch{return [];} }

const staffData = unstable_cache(async () => plainRows(await listPublicStaff()), ["public-staff-v314"], { revalidate: TTL, tags: [TAG] });
export async function getCachedStaff(){ try{return await staffData();}catch{return [];} }

const pageData = unstable_cache(async (slug:string) => getPage(slug), ["public-page-v314"], { revalidate: TTL, tags: [TAG] });
export async function getCachedPage(slug:string){ try{const page=await pageData(slug);return page?{...page,body:currentContactEmails(String(page.body||""))}:null;}catch{return null;} }

const pageRecordData = unstable_cache(async (slug:string) => { const row:any=await getPage(slug,true); return row?{slug:row.slug,title:String(row.title||""),body:String(row.body||""),published:!!row.published}:null; }, ["public-page-record-v1"], { revalidate: TTL, tags: [TAG] });

const partnersData = unstable_cache(async () => plainRows(await listPartners(false)), ["public-partners-v1"], { revalidate: TTL, tags: [TAG] });
export async function getCachedPartners(){ try{return await partnersData();}catch{return [];} }

/** Program yaş gruplarını CMS program verisinden tek cümleye çevirir (SSS belirteci). */
export async function programAgesSentence(lang:"tr"|"en"="tr"){
  const programs:any[]=await getCachedPrograms();
  return programs.map(p=>`${p.name}: ${lang==="en"?(p.age||p.age_detail):(p.age_detail||p.age)}`).filter(x=>!/:\s*$/.test(x)).join(" · ");
}

/**
 * CMS'ten düzenlenebilen site sayfası. CMS kaydı varsa o, yoksa kod içindeki varsayılan kullanılır.
 * Yayında olmayan veya yer tutucu içeren sayfa `null` döner (public rota 404 verir).
 */
export async function getSitePage(slug:string){
  const def=sitePage(slug); if(!def)return null;
  let record:{title:string;body:string;published:boolean}|null=null;
  try{record=await pageRecordData(slug);}catch{record=null;}
  const title=record?.title?.trim()||def.title, rawBody=record?record.body:def.body;
  const published=record?record.published:def.defaultPublished;
  if(!published||!publishable(title,rawBody))return null;
  const [programAges,wc,foundingCount]=await Promise.all([rawBody.includes("{{program_ages")?programAgesSentence(def.lang):Promise.resolve(""),getWorldChampionship(),getCachedFoundingCount()]);
  return {...def,title,body:currentContactEmails(applyTokens(rawBody,{lang:def.lang,programAges,wc,foundingCount:foundingCount??undefined})),fromCms:!!record};
}
