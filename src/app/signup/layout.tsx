import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account — hyp",
  description: "Join hyp today and share stories, posts, and real-life updates with your friends and family.",
  alternates: {
    canonical: "/signup",
  },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
