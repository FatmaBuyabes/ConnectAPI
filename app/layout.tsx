import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Arabic Quiz Game",
  description: "Test your knowledge in Arabic and English",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${cairo.variable} font-cairo bg-bg-light min-h-screen`}>
        <LanguageProvider>
          <div className="flex justify-center min-h-screen">
            <div className="w-full max-w-[480px] relative">
              {children}
            </div>
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
