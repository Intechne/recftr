import { unstable_cache } from "next/cache";
import { cache } from "react";
import {
  getEvent,
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
  listPublicStaff,
  listTeams,
} from "@/lib/db";
import { PUBLIC_SETTING_KEYS } from "@/lib/content-consistency";
import { FALLBACK_PROGRAMS, fallbackProgram } from "@/lib/program-fallback";

const TTL = 300;
const TAG = "public-content";
const plainRows = (rows: any) => Array.isArray(rows) ? rows.map((row: any) => row && typeof row === "object" ? { ...row } : row) : [];

const publicSettingsData = unstable_cache(
  async () => getSettings(PUBLIC_SETTING_KEYS),
  ["public-settings-v314"],
  { revalidate: TTL, tags: [TAG] },
);
export const getCachedPublicSettings = cache(async () => {
  try { return await publicSettingsData(); } catch { return {}; }
});

const homeSnapshotData = unstable_cache(
  async () => getPublicHomeSnapshot(PUBLIC_SETTING_KEYS),
  ["public-home-snapshot-v314"],
  { revalidate: TTL, tags: [TAG] },
);
export async function getCachedHomeSnapshot(){
  try { return await homeSnapshotData(); }
  catch { return {programs:[],events:[],news:[],media:[],settings:{},stats:{teams:0,cities:0,events:0,students:0,programs:0}}; }
}

const programsData = unstable_cache(async () => listPrograms(false), ["public-programs-v314"], { revalidate: TTL, tags: [TAG] });
export async function getCachedPrograms(){ try{const r=await programsData();return (Array.isArray(r)&&r.length)?r:FALLBACK_PROGRAMS;}catch{return FALLBACK_PROGRAMS;} }

const programData = unstable_cache(async (slug:string) => getProgram(slug), ["public-program-v314"], { revalidate: TTL, tags: [TAG] });
export async function getCachedProgram(slug:string){ try{return (await programData(slug))??fallbackProgram(slug);}catch{return fallbackProgram(slug);} }

const eventsData = unstable_cache(async () => plainRows(await listEvents(false)), ["public-events-v314"], { revalidate: TTL, tags: [TAG] });
export async function getCachedEvents(){ try{return await eventsData();}catch{return [];} }

const eventData = unstable_cache(async (slug:string) => getEvent(slug), ["public-event-v314"], { revalidate: TTL, tags: [TAG] });
export async function getCachedEvent(slug:string){ try{return await eventData(slug);}catch{return null;} }

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
export async function getCachedPage(slug:string){ try{return await pageData(slug);}catch{return null;} }

const registrationPricingData = unstable_cache(
  async () => getSettings([
    "registration_fee_engage",
    "registration_fee_achieve",
    "registration_fee_inspire",
    "registration_fee_adc",
    "registration_fee_adc-pro",
    "field_kit_fee",
    "registration_discount",
  ]),
  ["public-registration-pricing-v314"],
  { revalidate: TTL, tags: [TAG] },
);
export async function getCachedRegistrationPricing(){ try{return await registrationPricingData();}catch{return {};} }
