import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Post — hyp",
  description: "Share normal posts or create beautiful Life Update Cards on hyp.",
  alternates: {
    canonical: "/create",
  },
};

export default function CreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
