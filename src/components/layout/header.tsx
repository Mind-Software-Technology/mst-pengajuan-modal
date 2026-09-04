"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, ChevronRight, HelpCircle } from "lucide-react";
import { getPendingNotifications } from "@/server/actions/expense.action";

type NotificationItem = {
  id: string;
  title: string;
  amount: number;
  submitterName: string;
  createdAt: string;
};

const POLL_INTERVAL_MS = 15000;

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<{ personName?: string; email?: string } | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("mst_team_session");
    if (saved) {
      try {
        setSession(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      const res = await getPendingNotifications();
      setNotifications(res.data);
    };
    fetchNotifications();
    const id = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getBreadcrumbTitle = () => {
    if (pathname.startsWith("/expenses")) return "Pengajuan Modal Tim";
    if (pathname.startsWith("/dashboard")) return "Dashboard";
    if (pathname.startsWith("/settings")) return "Pengaturan Tim";
    return "Beranda";
  };

  const displayName = session?.personName || "Anggota Tim";
  const displayTeam = session?.email || "Tim Internal MST";
  const initials = session?.personName ? session.personName.slice(0, 2).toUpperCase() : "TM";

  return (
    <header className="sticky top-0 z-20 flex h-16 flex-shrink-0 items-center justify-between border-b border-[#E5E5E8] bg-white px-6 sm:px-8">
      {/* Breadcrumb Area */}
      <div className="flex items-center gap-2 text-xs text-[#6B6B73]">
        <span className="hover:text-zinc-900 transition-colors">MIND Capital</span>
        <ChevronRight className="h-3.5 w-3.5 text-[#8A8A91]" />
        <span className="font-semibold text-[#241B3A]">{getBreadcrumbTitle()}</span>
      </div>

      {/* User Profile / Status on the right */}
      <div className="flex items-center gap-4">
        <button 
          title="Bantuan & Panduan"
          className="h-8 w-8 rounded-md border border-[#E5E5E8] flex items-center justify-center text-[#6B6B73] hover:text-[#241B3A] hover:bg-[#F3F3F5] transition-colors"
        >
          <HelpCircle className="h-4 w-4" />
        </button>

        <div className="relative" ref={notifRef}>
          <button
            type="button"
            title="Notifikasi"
            onClick={() => setShowNotifications((v) => !v)}
            className="h-8 w-8 rounded-md border border-[#E5E5E8] flex items-center justify-center text-[#6B6B73] hover:text-[#241B3A] hover:bg-[#F3F3F5] transition-colors cursor-pointer"
          >
            <Bell className="h-4 w-4" />
          </button>
          {notifications.length > 0 && (
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-rose-500" />
          )}

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-lg border border-[#E5E5E8] bg-white shadow-lg z-30 overflow-hidden">
              <div className="px-3.5 py-2.5 border-b border-[#E5E5E8]">
                <p className="text-xs font-bold text-zinc-900">Menunggu Persetujuan</p>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-[#E5E5E8]">
                {notifications.length === 0 ? (
                  <p className="text-[11px] text-zinc-400 text-center py-6">Tidak ada pengajuan yang perlu ditinjau.</p>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => {
                        setShowNotifications(false);
                        router.push("/expenses");
                      }}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-[#F8F9FA] cursor-pointer"
                    >
                      <p className="text-xs font-semibold text-zinc-900 truncate">{n.title}</p>
                      <div className="flex items-center justify-between text-[11px] text-[#6B6B73] mt-0.5">
                        <span>{n.submitterName}</span>
                        <span className="font-bold text-[#241B3A]">Rp {n.amount.toLocaleString("id-ID")}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-[#E5E5E8]" />

        {/* Dynamic Team User Profile Box */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-zinc-900 leading-tight">{displayName}</p>
            <p className="text-[10px] text-[#6B6B73] leading-tight">{displayTeam}</p>
          </div>
          <div className="h-8 w-8 rounded-full bg-[#241B3A] text-white flex items-center justify-center text-xs font-bold ring-1 ring-[#241B3A]/20">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
