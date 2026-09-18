import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const tagline = Newsreader({
  variable: "--font-tagline",
  subsets: ["latin"],
  style: ["italic"],
  weight: ["500", "600"],
});

export const metadata: Metadata = {
  title: "Nuzio — News on go.",
  description: "Personalised audio news for busy professionals, curated every morning.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${tagline.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ink text-text-primary">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
