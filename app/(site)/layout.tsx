import { Ticker, Nav, Footer } from "@/components/Chrome";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Ticker />
      <Nav />
      <main>{children}</main>
      <Footer />
    </>
  );
}
