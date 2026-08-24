import { revalidatePath } from "next/cache";
import { getContentRevision, touchContentRevision } from "@/lib/db";

export const PUBLIC_SETTING_KEYS = [
  "site_name","hero_title","hero_accent_title","hero_description","hero_image","ticker",
  "contact_team","contact_info","contact_phone","instagram","youtube","linkedin","maintenance",
  "site_logo","site_mark","favicon_url","apple_touch_icon_url","og_image","season_label",
  "season_route_title","season_route","home_cta_title","home_cta_description","home_cta_plate",
  "home_show_programs","home_show_route","home_show_stats","home_show_events","home_show_news",
  "home_show_gallery","home_show_cta"
] as const;

export async function publishContentChange(paths: string[] = [], existingRevision?: string) {
  const revision = existingRevision || await touchContentRevision();
  // Root layout holds the public shell (brand/ticker/nav/footer). Revalidate it every time
  // public CMS content changes so server-rendered content cannot drift behind the database.
  revalidatePath("/", "layout");
  for (const path of new Set(paths.filter(Boolean))) revalidatePath(path);
  return revision;
}

export async function currentContentRevision() {
  return getContentRevision();
}
