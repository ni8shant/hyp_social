"use client";

import Link from "next/link";
import { Home, Search, PlusCircle, MessageCircle, UserCircle } from "lucide-react";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/home", icon: Home, label: "Home" },
  { href: "/search", icon: Search, label: "Search" },
  { href: "/create", icon: PlusCircle, label: "Create" },
  { href: "/messages", icon: MessageCircle, label: "Messages" },
  { href: "/profile", icon: UserCircle, label: "Profile" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E5E7EB] max-w-2xl mx-auto">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 rounded-xl transition-all duration-200 group ${
                isActive ? "text-[#2563EB]" : "text-[#6B7280] hover:text-[#2563EB]"
              }`}
              aria-label={label}
            >
              <Icon
                size={24}
                className={`transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? "stroke-[2.5px]" : "stroke-[1.8px]"
                }`}
              />
              <span className={`text-[10px] font-medium ${isActive ? "text-[#2563EB]" : ""}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
