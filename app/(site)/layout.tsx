import { Ticker, Nav, Footer, type PublicSettings } from "@/components/Chrome";
import ContentRefreshBridge from "@/components/ContentRefreshBridge";
import CookieConsent from "@/components/seo/CookieConsent";
import { getCachedPublicSettings, getSitePage } from "@/lib/public-cache";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  let publicSettings: PublicSettings = {};
  let launchPublished = false;
  try {
    const [settings, launch] = await Promise.all([getCachedPublicSettings(), getSitePage("lansman")]);
    publicSettings = settings as PublicSettings;
    launchPublished = !!launch;
  } catch {
    // Public shell must stay reachable even during a transient DB/cache outage.
  }
  return (
    <>
      <ContentRefreshBridge />
      <Ticker settings={publicSettings} />
      <Nav settings={publicSettings} flags={{ launchPublished }} />
      <main id="icerik">{children}<CookieConsent/></main>
      <Footer settings={publicSettings} flags={{ launchPublished }} />
    </>
  );
}
