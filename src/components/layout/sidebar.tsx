"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  FileEdit, 
  History, 
  Activity, 
  FolderLock, 
  User, 
  Settings, 
  LogOut,
  Building2
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Pengajuan Modal Tim", href: "/expenses", icon: FileEdit },
  { name: "Riwayat & Pencairan", href: "/expenses?tab=history", icon: History },
  { name: "Pengaturan Tim", href: "/settings", icon: Settings },
];

function SidebarNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams?.get("tab");

  return (
    <nav className="flex-1 space-y-1 px-3">
      {navigation.map((item) => {
        let isActive = false;
        if (item.href.includes("?tab=")) {
          const targetTab = item.href.split("?tab=")[1];
          isActive = pathname.startsWith("/expenses") && currentTab === targetTab;
        } else if (item.href === "/expenses") {
          isActive = pathname.startsWith("/expenses") && !currentTab;
        } else if (item.href === "/dashboard") {
          isActive = pathname.startsWith("/dashboard");
        } else if (item.href === "/settings") {
          isActive = pathname.startsWith("/settings");
        }

        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "group flex items-center rounded-md px-3 py-2.5 text-xs font-medium transition-colors",
              isActive
                ? "bg-white/15 text-white font-semibold shadow-xs"
                : "text-[#8A8A91] hover:bg-white/5 hover:text-white"
            )}
          >
            <Icon
              className={cn(
                "mr-3 h-4 w-4 flex-shrink-0 transition-colors",
                isActive ? "text-white" : "text-[#8A8A91] group-hover:text-white"
              )}
            />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  const [session, setSession] = React.useState<{ personName?: string; email?: string } | null>(null);

  React.useEffect(() => {
    const saved = localStorage.getItem("mst_team_session");
    if (saved) {
      try {
        setSession(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const handleLogout = () => {
    if (confirm("Keluar dari sesi tim ini?")) {
      localStorage.removeItem("mst_team_session");
      window.location.href = "/login";
    }
  };

  return (
    <aside className="flex h-screen w-64 flex-col bg-[#241B3A] text-white border-r border-[#1B142C] select-none flex-shrink-0">
      {/* Brand & Logo Area */}
      <div className="flex h-16 items-center px-6 border-b border-white/10 gap-3">
        <div className="h-8 w-8 rounded-md bg-white/10 border border-white/20 flex items-center justify-center text-white">
          <Building2 className="h-4 w-4 text-white" />
        </div>
        <div>
          <span className="text-sm font-bold tracking-wide uppercase text-white">MIND / MST</span>
          <p className="text-[10px] text-[#8A8A91] tracking-wider uppercase font-medium">Capital Platform</p>
        </div>
      </div>

      {/* Navigation List */}
      <div className="px-3 py-4 text-[11px] font-semibold uppercase tracking-wider text-[#8A8A91]">
        Menu Utama
      </div>

      <React.Suspense fallback={<nav className="flex-1 space-y-1 px-3" />}>
        <SidebarNav />
      </React.Suspense>

      {/* User Profile & Logout Bottom Area */}
      <div className="border-t border-white/10 p-3 space-y-2">
        <div className="flex items-center gap-3 px-2 py-2 rounded-md bg-white/5 border border-white/5">
          <div className="h-8 w-8 rounded-full bg-white/15 border border-white/25 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {session?.personName ? session.personName.slice(0, 2).toUpperCase() : "MST"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">
              {session?.personName || "Anggota Tim"}
            </p>
            <p className="text-[10px] text-[#8A8A91] truncate">
              {session?.email || "Sesi PIN Aktif"}
            </p>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-[#8A8A91] hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Ganti PIN / Logout</span>
        </button>
      </div>
    </aside>
  );
}
