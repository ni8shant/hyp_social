import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications — hyp",
  description: "Stay updated on who liked, commented, or mentioned you in real life on hyp.",
  alternates: {
    canonical: "/notifications",
  },
};

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
