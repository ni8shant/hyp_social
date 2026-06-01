import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile — hyp",
  description: "View updates, stories, highlights, and posts of users on hyp.",
  alternates: {
    canonical: "/profile",
  },
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
