"use client";

import { Bell, Heart, MessageCircle, UserPlus, AtSign, Loader2 } from "lucide-react";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { timeAgo } from "@/lib/data";

export default function NotificationsPage() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("notifications")
        .select(`
          id,
          type,
          is_read,
          created_at,
          actor_id,
          actor:profiles!notifications_actor_id_fkey (
            username,
            full_name
          )
        `)
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const realNotifications = (data || []).filter((notif: any) => {
        const actorId = notif.actor_id?.toString() || "";
        const idStr = notif.id?.toString() || "";
        return !actorId.startsWith("user_") && !idStr.startsWith("seed_");
      });

      setNotifications(realNotifications);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [profile]);

  const markAllRead = async () => {
    if (!profile) return;
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", profile.id);

      if (error) throw error;
      
      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Failed to mark notifications as read:", err);
    }
  };

  const getNotificationDetails = (notif: any) => {
    const actorName = notif.actor?.full_name || notif.actor?.username || "Someone";
    switch (notif.type) {
      case "like":
        return {
          text: `${actorName} liked your post`,
          icon: Heart,
          iconColor: "text-[#EF4444]",
          iconBg: "bg-red-50",
        };
      case "follow":
        return {
          text: `${actorName} started following you`,
          icon: UserPlus,
          iconColor: "text-[#2563EB]",
          iconBg: "bg-blue-50",
        };
      case "comment":
        return {
          text: `${actorName} commented on your post`,
          icon: MessageCircle,
          iconColor: "text-[#7C3AED]",
          iconBg: "bg-purple-50",
        };
      default:
        return {
          text: `${actorName} interacted with you`,
          icon: Bell,
          iconColor: "text-[#9CA3AF]",
          iconBg: "bg-slate-50",
        };
    }
  };


  return (
    <div className="min-h-screen bg-[#F8FAFC] max-w-2xl mx-auto">
      <TopBar showSearch={false} showNotification={false} />

      <main className="pb-20 px-4 pt-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-[#111827]">Notifications</h1>
          <button
            onClick={markAllRead}
            disabled={notifications.length === 0}
            className="text-sm font-medium text-[#2563EB] hover:underline disabled:opacity-40 cursor-pointer"
          >
            Mark all read
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 text-[#6B7280]">
              <Bell size={40} className="mx-auto mb-3 opacity-30 animate-pulse" />
              <p className="font-medium">All caught up!</p>
              <p className="text-sm mt-1">No new notifications here.</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const details = getNotificationDetails(notif);
              const Icon = details.icon;
              return (
                <div
                  key={notif.id}
                  className={`flex items-center gap-3 bg-white rounded-2xl p-4 border transition-all ${
                    !notif.is_read
                      ? "border-[#BFDBFE] shadow-sm shadow-blue-50"
                      : "border-[#E5E7EB]"
                  }`}
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-full ${details.iconBg} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={18} className={details.iconColor} />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notif.is_read ? "font-semibold text-[#111827]" : "text-[#374151]"}`}>
                      {details.text}
                    </p>
                    <p className="text-xs text-[#9CA3AF] mt-0.5">{timeAgo(notif.created_at)}</p>
                  </div>

                  {/* Unread dot */}
                  {!notif.is_read && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] flex-shrink-0" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
