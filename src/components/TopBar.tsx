"use client";

import Link from "next/link";
import { Bell, Search, Settings } from "lucide-react";

interface TopBarProps {
  showSearch?: boolean;
  showNotification?: boolean;
  title?: string;
}

export default function TopBar({
  showSearch = true,
  showNotification = true,
  title,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#E5E7EB]">
      <div className="flex items-center gap-3 px-4 h-14 max-w-2xl mx-auto">
        {/* Logo */}
        <Link href="/home" className="flex-shrink-0">
          <span className="text-2xl font-extrabold tracking-tight text-[#7C3AED]">
            hyp
          </span>
        </Link>

        {/* Search bar */}
        {showSearch && (
          <div className="flex-1 relative">
            <label htmlFor="topbar-search" className="sr-only">Search friends</label>
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]"
            />
            <input
              id="topbar-search"
              type="text"
              placeholder="search @your_friends"
              className="w-full pl-9 pr-4 py-2 bg-[#F3F4F6] rounded-full text-sm text-[#111827] placeholder-[#6B7280] outline-none focus:ring-2 focus:ring-[#2563EB]/30 transition-all"
            />
          </div>
        )}

        {/* Spacer / Title */}
        {!showSearch && (
          title ? (
            <h1 className="flex-1 text-lg font-bold text-[#111827]">{title}</h1>
          ) : (
            <div className="flex-1" />
          )
        )}

        {/* Notification icon */}
        {showNotification && (
          <Link href="/notifications" className="relative flex-shrink-0" aria-label="Notifications">
            <Bell
              size={22}
              className="text-[#374151] hover:text-[#2563EB] transition-colors"
            />
            {/* Unread badge */}
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#EF4444]" aria-hidden="true" />
          </Link>
        )}

        {/* Settings gear icon for desktop */}
        <Link href="/settings" className="hidden md:block flex-shrink-0" aria-label="Settings">
          <Settings
            size={22}
            className="text-[#374151] hover:text-[#2563EB] transition-colors"
          />
        </Link>
      </div>
    </header>
  );
}
