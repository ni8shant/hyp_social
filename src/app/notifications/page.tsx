"use client";

import { Bell, Heart, MessageCircle, UserPlus, AtSign } from "lucide-react";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";

const mockNotifications = [
  {
    id: "1",
    type: "like",
    icon: Heart,
    iconColor: "text-[#EF4444]",
    iconBg: "bg-red-50",
    text: "rahul_k liked your post",
    time: "2m ago",
    unread: true,
  },
  {
    id: "2",
    type: "follow",
    icon: UserPlus,
    iconColor: "text-[#2563EB]",
    iconBg: "bg-blue-50",
    text: "priya.m started following you",
    time: "15m ago",
    unread: true,
  },
  {
    id: "3",
    type: "comment",
    icon: MessageCircle,
    iconColor: "text-[#7C3AED]",
    iconBg: "bg-purple-50",
    text: "aman_t commented: \"Amazing! 🔥\"",
    time: "1h ago",
    unread: false,
  },
  {
    id: "4",
    type: "mention",
    icon: AtSign,
    iconColor: "text-[#059669]",
    iconBg: "bg-emerald-50",
    text: "sejal_r mentioned you in a story",
    time: "3h ago",
    unread: false,
  },
];

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] max-w-2xl mx-auto">
      <TopBar showSearch={false} showNotification={false} />

      <main className="pb-20 px-4 pt-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-[#111827]">Notifications</h1>
          <button className="text-sm font-medium text-[#2563EB] hover:underline">
            Mark all read
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {mockNotifications.map((notif) => {
            const Icon = notif.icon;
            return (
              <div
                key={notif.id}
                className={`flex items-center gap-3 bg-white rounded-2xl p-4 border transition-all ${
                  notif.unread
                    ? "border-[#BFDBFE] shadow-sm shadow-blue-50"
                    : "border-[#E5E7EB]"
                }`}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-full ${notif.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={18} className={notif.iconColor} />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${notif.unread ? "font-semibold text-[#111827]" : "text-[#374151]"}`}>
                    {notif.text}
                  </p>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">{notif.time}</p>
                </div>

                {/* Unread dot */}
                {notif.unread && (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
