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
      <body className="flex h-screen overflow-hidden text-accent-charcoal">
        <Providers>
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 bg-[#F9FAFB]">
            <Header />
            <main className="flex-1 overflow-auto p-4 md:p-8 no-scrollbar relative">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
