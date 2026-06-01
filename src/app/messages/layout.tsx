import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Messages — hyp",
  description: "Chat with your friends and connect in real-life group messages on hyp.",
  alternates: {
    canonical: "/messages",
  },
};

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
