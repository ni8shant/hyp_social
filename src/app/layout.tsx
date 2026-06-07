import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  metadataBase: new URL("https://hyp-social.vercel.app"),
  title: "hyp — Stay connected with real life",
  description: "hyp is a social platform focused on real-life connections — stories, posts, and life updates from the people you care about.",
  alternates: {
    canonical: "/",
  },
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
    <html lang="en">
      <body className="min-h-screen bg-[#F8FAFC] font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
