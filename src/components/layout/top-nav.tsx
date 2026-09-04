"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Bell, Search, Settings, CreditCard, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Pengajuan Modal", href: "/expenses", icon: CreditCard },
  { name: "Pengaturan", href: "/settings", icon: Settings },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-zinc-200/80 shadow-xs">
      <div className="w-full max-w-[1520px] mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-10 py-3">
        <div className="flex items-center gap-4 lg:gap-7">
          {/* Logo area */}
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#4f46e5] to-[#7c3aed] flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              F
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-zinc-900 leading-none">FINNOVA</h1>
              <p className="text-[10.5px] text-zinc-400 font-medium tracking-tight mt-0.5">Smart Finances, Better Business</p>
            </div>
          </Link>

          {/* Counter Badge like in Finnova image "80" */}
          <div className="hidden sm:flex items-center justify-center h-7 px-3 rounded-full bg-zinc-100/80 border border-zinc-200/60 text-xs font-bold text-zinc-700">
            80
          </div>
          
          {/* Pill Navigation Container */}
          <nav className="hidden md:flex items-center bg-[#14151b] rounded-full p-1 shadow-inner gap-0.5">
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 flex items-center gap-1.5",
                    isActive 
                      ? "bg-[#5452ee] text-white shadow-sm" 
                      : "text-zinc-400 hover:text-white"
                  )}
                >
                  <span className="text-[10px] opacity-70">+</span>
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Icons Bar */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link href="/expenses" className="hidden sm:flex">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-white shadow-xs border border-zinc-200/80 text-zinc-600 hover:bg-zinc-100">
              <CreditCard className="h-3.5 w-3.5" />
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-white shadow-xs border border-zinc-200/80 text-zinc-600 hover:bg-zinc-100">
            <Search className="h-3.5 w-3.5" />
          </Button>
          <div className="relative">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-white shadow-xs border border-zinc-200/80 text-zinc-600 hover:bg-zinc-100">
              <Bell className="h-3.5 w-3.5" />
            </Button>
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </div>
          <Link href="/settings">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-white shadow-xs border border-zinc-200/80 text-zinc-600 hover:bg-zinc-100">
              <Settings className="h-3.5 w-3.5" />
            </Button>
          </Link>
          <div className="h-8 w-8 rounded-full overflow-hidden ml-1 border-2 border-white shadow-sm ring-1 ring-zinc-200 cursor-pointer">
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" 
              alt="User" 
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
