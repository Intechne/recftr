import { Ticker, Nav, Footer, type PublicSettings } from "@/components/Chrome";
import ContentRefreshBridge from "@/components/ContentRefreshBridge";
import { getSettings } from "@/lib/db";
import { currentContentRevision, PUBLIC_SETTING_KEYS } from "@/lib/content-consistency";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, revision] = await Promise.all([
    getSettings(PUBLIC_SETTING_KEYS),
    currentContentRevision().catch(() => "0"),
  ]);
  const publicSettings = settings as PublicSettings;
  return (
    <>
      <ContentRefreshBridge initialRevision={revision} />
      <Ticker settings={publicSettings} />
      <Nav settings={publicSettings} />
      <main>{children}</main>
      <Footer settings={publicSettings} />
    </>
  );
}
