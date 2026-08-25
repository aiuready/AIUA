import type { Metadata } from "next";
import { Poppins, Open_Sans } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

// Global type system (design-system/MASTER.md): Poppins for headings,
// Open Sans for body — chosen for "modern professional approachable",
// readable at small sizes on cheap Android screens (PRD §4 performance).
const poppins = Poppins({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const openSans = Open_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "AI University Africa — Learn. Build. Earn with AI.",
    template: "%s · AI University Africa",
  },
  description:
    "AI University Africa (AIUA) teaches practical AI skills across eight schools, with publicly verifiable certificates. Learn. Build. Earn with AI.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${openSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background font-body text-foreground">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
