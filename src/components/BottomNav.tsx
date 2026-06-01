"use client";

import Link from "next/link";
import { Home, Camera, Mic, MessageSquare, User, Settings } from "lucide-react";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/home", icon: Home, label: "Home" },
  { href: "/create", icon: Camera, label: "Camera" },
  { href: "/messages/groups", icon: Mic, label: "Talkie" },
  { href: "/messages", icon: MessageSquare, label: "Messages" },
  { href: "/profile", icon: User, label: "Profile" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed z-50 transition-all duration-300
      /* Mobile: floating horizontal pill at the bottom */
      bottom-4 left-4 right-4 h-14 bg-[#E5E7EB] border border-[#CBD5E1] rounded-2xl flex items-center justify-around shadow-md max-w-md mx-auto
      /* Desktop: vertical floating pill on the right side */
      md:fixed md:bottom-auto md:left-auto md:right-8 md:top-1/2 md:-translate-y-1/2 md:w-14 md:h-80 md:flex-col md:py-6 md:px-2 md:rounded-3xl"
    >
      {navItems.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href || (href !== "/home" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center p-2.5 rounded-xl transition-all duration-200 group cursor-pointer ${
              isActive ? "text-[#2563EB]" : "text-[#1F2937] hover:text-[#2563EB]"
            }`}
            aria-label={label}
          >
            <Icon
              size={24}
              className={`transition-transform duration-200 group-hover:scale-110 ${
                isActive ? "stroke-[2.5px]" : "stroke-[1.8px]"
              }`}
            />
          </Link>
        );
      })}
    </nav>
  );
}
