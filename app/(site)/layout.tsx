import { Ticker, Nav, Footer, type PublicSettings } from "@/components/Chrome";
import ContentRefreshBridge from "@/components/ContentRefreshBridge";
import { getCachedPublicSettings } from "@/lib/public-cache";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  let publicSettings: PublicSettings = {};
  try {
    publicSettings = (await getCachedPublicSettings()) as PublicSettings;
  } catch {
    // Public shell must stay reachable even during a transient DB/cache outage.
  }
  return (
    <>
      <ContentRefreshBridge />
      <Ticker settings={publicSettings} />
      <Nav settings={publicSettings} />
      <main>{children}</main>
      <Footer settings={publicSettings} />
    </>
  );
}
