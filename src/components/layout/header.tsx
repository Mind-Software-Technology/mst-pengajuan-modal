"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Bell, ChevronRight, HelpCircle } from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const [session, setSession] = useState<{ personName?: string; email?: string } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("mst_team_session");
    if (saved) {
      try {
        setSession(JSON.parse(saved));
      } catch (e) {}
    }
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

        <div className="relative">
          <button 
            title="Notifikasi"
            className="h-8 w-8 rounded-md border border-[#E5E5E8] flex items-center justify-center text-[#6B6B73] hover:text-[#241B3A] hover:bg-[#F3F3F5] transition-colors"
          >
            <Bell className="h-4 w-4" />
          </button>
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[#241B3A]" />
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
