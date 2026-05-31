import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search — hyp",
  description: "Search for friends and connect with real-life profiles on hyp.",
  alternates: {
    canonical: "/search",
  },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
