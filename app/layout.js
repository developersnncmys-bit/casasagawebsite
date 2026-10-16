import { Cormorant_Garamond, Manrope } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ContentProvider } from "@/components/ContentProvider";
import SourceTracker from "@/components/SourceTracker";
import { getContent } from "@/lib/content";
import "./globals.css";
import "./pages.css";

// Re-check the CasaSaga API at least this often (seconds) — keep in step with lib/content.js
export const revalidate = 60;

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});
const sans = Manrope({ subsets: ["latin"], variable: "--font-sans" });

export const metadata = {
  title: { default: "CasaSaga — Bangalore's Most Intimate Retreat", template: "%s · CasaSaga" },
  description:
    "A boutique romantic hideaway in Bangalore with themed suites, private jacuzzis, a plunge pool under the skylights and in-house celebration decor.",
};

export default async function RootLayout({ children }) {
  const content = await getContent();
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      {/* Browser extensions (e.g. ColorZilla's cz-shortcut-listen) add attributes to <body> before React loads */}
      <body suppressHydrationWarning>
        <ContentProvider content={content}>
          <SourceTracker />
          <SmoothScroll>
            <Navbar />
            <main>{children}</main>
            <Footer />
          </SmoothScroll>
        </ContentProvider>
      </body>
    </html>
  );
}
