"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Wallet, 
  CreditCard, 
  FileText, 
  Settings,
  Receipt
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Pengajuan Modal", href: "/expenses", icon: CreditCard },
  { name: "Pengaturan", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-zinc-950 text-white">
      <div className="flex h-16 items-center px-6 border-b border-zinc-800">
        <h1 className="text-xl font-bold tracking-tight text-white">Sistem Pengajuan Modal</h1>
      </div>
      <nav className="flex-1 space-y-1 px-4 py-6">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                isActive
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white",
                "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors"
              )}
            >
              <Icon
                className={cn(
                  isActive ? "text-white" : "text-zinc-400 group-hover:text-white",
                  "mr-3 h-5 w-5 flex-shrink-0"
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-zinc-800 p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-medium">
            AD
          </div>
          <div>
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-zinc-400">Super Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
}
