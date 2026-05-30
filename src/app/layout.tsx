import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "hyp — Stay connected with real life",
  description: "hyp is a social platform focused on real-life connections — stories, posts, and life updates from the people you care about.",
  keywords: ["social media", "friends", "family", "life updates", "stories", "posts"],
  openGraph: {
    title: "hyp — Stay connected with real life",
    description: "Stories, posts, and life updates from the people you care about.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-[#F8FAFC] font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
