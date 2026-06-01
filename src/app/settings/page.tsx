"use client";

import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  Bell,
  UserX,
  Trash2,
  Download,
  ChevronRight,
  ArrowLeft,
  Moon,
  Globe,
  Users,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";

type ToggleProps = {
  id: string;
  checked: boolean;
  onChange: () => void;
};

function Toggle({ id, checked, onChange }: ToggleProps) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`w-11 h-6 rounded-full transition-all duration-300 relative flex-shrink-0 ${checked ? "bg-[#2563EB]" : "bg-[#D1D5DB]"
        }`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 ${checked ? "left-5" : "left-0.5"
          }`}
      />
    </button>
  );
}

interface SettingSection {
  title: string;
  icon: React.ElementType;
  iconColor: string;
  items: SettingItem[];
}

interface SettingItem {
  id: string;
  label: string;
  description?: string;
  type: "toggle" | "link" | "danger";
  href?: string;
}

const settingSections: SettingSection[] = [
  {
    title: "Account Privacy",
    icon: Globe,
    iconColor: "text-[#2563EB] bg-blue-50",
    items: [
      { id: "private-account", label: "Private Account", description: "Only followers can see your posts", type: "toggle" },
      { id: "hide-dob", label: "Hide Date of Birth", type: "toggle" },
      { id: "hide-online", label: "Hide Online Status", type: "toggle" },
      { id: "hide-read", label: "Hide Read Receipts", type: "toggle" },
    ],
  },
  {
    title: "Who Can Message You",
    icon: Users,
    iconColor: "text-[#7C3AED] bg-purple-50",
    items: [
      { id: "msg-everyone", label: "Everyone", type: "link" },
      { id: "msg-followers", label: "Followers Only (recommended)", type: "link" },
      { id: "msg-nobody", label: "Nobody", type: "link" },
    ],
  },
  {
    title: "Security",
    icon: Lock,
    iconColor: "text-[#059669] bg-emerald-50",
    items: [
      { id: "two-factor", label: "Two-Factor Authentication", description: "Add an extra layer of security", type: "link" },
      { id: "active-sessions", label: "Active Sessions", description: "Manage your logged-in devices", type: "link" },
      { id: "change-password", label: "Change Password", type: "link" },
    ],
  },
  {
    title: "Notifications",
    icon: Bell,
    iconColor: "text-[#F59E0B] bg-amber-50",
    items: [
      { id: "notif-likes", label: "Likes", type: "toggle" },
      { id: "notif-comments", label: "Comments", type: "toggle" },
      { id: "notif-follows", label: "New Followers", type: "toggle" },
      { id: "notif-messages", label: "Messages", type: "toggle" },
    ],
  },
  {
    title: "Content Visibility",
    icon: Eye,
    iconColor: "text-[#0891B2] bg-cyan-50",
    items: [
      { id: "story-everyone", label: "Show Stories to Everyone", type: "toggle" },
      { id: "post-visibility", label: "Post Visibility", description: "Control who sees your posts", type: "link" },
    ],
  },
  {
    title: "Data & Account",
    icon: Download,
    iconColor: "text-[#374151] bg-gray-100",
    items: [
      { id: "download-data", label: "Download My Data", type: "link" },
      { id: "delete-account", label: "Delete Account", description: "Permanently remove your account and data", type: "danger" },
    ],
  },
];

export default function SettingsPage() {
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    "private-account": false,
    "hide-dob": false,
    "hide-online": false,
    "hide-read": false,
    "notif-likes": true,
    "notif-comments": true,
    "notif-follows": true,
    "notif-messages": true,
    "story-everyone": true,
  });

  const flip = (id: string) => setToggles((p) => ({ ...p, [id]: !p[id] }));

  return (
    <div className="min-h-screen bg-[#F8FAFC] max-w-2xl mx-auto">
      <TopBar showSearch={false} />

      <main className="pb-20 px-4 pt-4">
        <div className="flex items-center gap-2 mb-5">
          <h1 className="text-2xl font-bold text-[#111827]">Settings & Privacy</h1>
        </div>

        <div className="flex flex-col gap-4">
          {settingSections.map((section) => {
            const SectionIcon = section.icon;
            return (
              <div key={section.title} className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
                {/* Section header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-[#F3F4F6]">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${section.iconColor}`}>
                    <SectionIcon size={16} />
                  </div>
                  <p className="font-semibold text-[#111827] text-sm">{section.title}</p>
                </div>

                {/* Items */}
                {section.items.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between px-4 py-3.5 ${idx < section.items.length - 1 ? "border-b border-[#F9FAFB]" : ""
                      }`}
                  >
                    <div className="flex-1 min-w-0 mr-4">
                      <p
                        className={`text-sm font-medium ${item.type === "danger" ? "text-[#EF4444]" : "text-[#111827]"
                          }`}
                      >
                        {item.label}
                      </p>
                      {item.description && (
                        <p className="text-xs text-[#9CA3AF] mt-0.5">{item.description}</p>
                      )}
                    </div>
                    {item.type === "toggle" ? (
                      <Toggle
                        id={item.id}
                        checked={toggles[item.id] ?? false}
                        onChange={() => flip(item.id)}
                      />
                    ) : (
                      <ChevronRight
                        size={18}
                        className={item.type === "danger" ? "text-[#EF4444]" : "text-[#9CA3AF]"}
                      />
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
