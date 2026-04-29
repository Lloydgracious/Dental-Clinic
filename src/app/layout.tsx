import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lumiere - Dental Clinic Management",
  description: "Modern dental clinic management software",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Myanmar:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="flex h-screen overflow-hidden text-accent-charcoal print:block print:h-auto print:overflow-visible print:bg-white">
        <Providers>
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 bg-background print:block print:bg-white print:w-full">
            <Header />
            <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 pb-24 md:pb-6 no-scrollbar relative print:p-0 print:overflow-visible print:block print:w-full w-full">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
