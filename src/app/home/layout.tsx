import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home — hyp",
  description: "View updates, stories, and posts from the people you care about on hyp.",
  alternates: {
    canonical: "/home",
  },
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
