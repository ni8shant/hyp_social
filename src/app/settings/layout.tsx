import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings & Privacy — hyp",
  description: "Manage your hyp account settings, notifications, privacy, and security preferences.",
  alternates: {
    canonical: "/settings",
  },
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
