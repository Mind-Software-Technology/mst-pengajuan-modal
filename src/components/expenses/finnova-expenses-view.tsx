"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  SlidersHorizontal, 
  Calendar, 
  Clock, 
  AlertCircle, 
  ArrowUpRight, 
  Search, 
  CheckCircle2, 
  XCircle, 
  MoreVertical, 
  Link2, 
  ChevronDown, 
  Check, 
  Trash2, 
  Pencil, 
  Wallet,
  Plus,
  ArrowRight,
  Globe,
  Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExpenseFormDialog } from "./expense-form";
import { updateExpenseStatus, deleteExpense } from "@/server/actions/expense.action";

type Submitter = {
  id: string;
  name: string;
  image?: string | null;
  email?: string | null;
};

type ExpenseItem = {
  id: string;
  title: string;
  amount: number | string;
  date: string | Date;
  category: string;
  status: "PENDING" | "APPROVED_FINANCE" | "APPROVED_FOUNDER" | "REJECTED";
  description?: string | null;
  receiptUrl?: string | null;
  submitter: Submitter;
};

interface FinnovaExpensesViewProps {
  initialExpenses: ExpenseItem[];
  users: { id: string; name: string }[];
}

export function FinnovaExpensesView({ initialExpenses, users }: FinnovaExpensesViewProps) {
  const [selectedId, setSelectedId] = useState<string>(
    initialExpenses.length > 0 ? initialExpenses[0].id : ""
  );
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterUser, setFilterUser] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [actionLoading, setActionLoading] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return initialExpenses.filter((item) => {
      const matchQuery = 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.submitter?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = 
        filterStatus === "ALL" 
          ? true 
          : filterStatus === "PENDING" 
            ? item.status === "PENDING"
            : filterStatus === "APPROVED"
              ? item.status === "APPROVED_FINANCE" || item.status === "APPROVED_FOUNDER"
              : item.status === "REJECTED";

      const matchUser = filterUser === "ALL" ? true : item.submitter?.id === filterUser;

      return matchQuery && matchStatus && matchUser;
    });
  }, [initialExpenses, searchQuery, filterStatus, filterUser]);

  // Selected item
  const selectedItem = useMemo(() => {
    return initialExpenses.find((i) => i.id === selectedId) || filteredExpenses[0] || initialExpenses[0];
  }, [initialExpenses, filteredExpenses, selectedId]);

  // Stats Calculations
  const stats = useMemo(() => {
    let pendingSum = 0;
    let approvedSum = 0;
    let pendingCount = 0;
    let approvedCount = 0;
    let rejectedCount = 0;

    initialExpenses.forEach((item) => {
      const amt = Number(item.amount);
      if (item.status === "PENDING") {
        pendingSum += amt;
        pendingCount++;
      } else if (item.status === "APPROVED_FINANCE" || item.status === "APPROVED_FOUNDER") {
        approvedSum += amt;
        approvedCount++;
      } else {
        rejectedCount++;
      }
    });

    return {
      pendingSum,
      approvedSum,
      pendingCount,
      approvedCount,
      rejectedCount,
      totalCount: initialExpenses.length,
    };
  }, [initialExpenses]);

  // Status handlers
  const handleUpdateStatus = async (id: string, status: "APPROVED_FINANCE" | "REJECTED") => {
    const isApprove = status === "APPROVED_FINANCE";
    if (!confirm(`Yakin ingin ${isApprove ? "menyetujui & mencairkan" : "menolak"} pengajuan ini?`)) return;

    setActionLoading(true);
    const res = await updateExpenseStatus(id, status);
    setActionLoading(false);
    if (res.error) {
      alert(res.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus data pengajuan modal ini?")) return;
    setActionLoading(true);
    const res = await deleteExpense(id);
    setActionLoading(false);
    if (res.error) {
      alert(res.error);
    } else {
      if (selectedId === id && filteredExpenses.length > 1) {
        setSelectedId(filteredExpenses.find((e) => e.id !== id)?.id || "");
      }
    }
  };

  return (
    <div className="space-y-7">
      {/* 1. Header Row (Back Button, Title, Subtitle, Action Buttons) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <Link href="/dashboard">
            <button className="h-10 w-10 rounded-full bg-white border border-zinc-200/90 shadow-xs flex items-center justify-center text-zinc-700 hover:text-zinc-950 hover:bg-zinc-50 transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
              Invoices
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-medium">
              Manage and track all your invoices and capital requests in one place.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-10 w-10 rounded-full bg-white border-zinc-200 shadow-xs text-zinc-600 hover:bg-zinc-50"
            onClick={() => {
              setFilterStatus("ALL");
              setFilterUser("ALL");
              setSearchQuery("");
            }}
            title="Reset Filter"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>

          <ExpenseFormDialog 
            projects={[]} 
            users={users} 
            trigger={
              <Button className="rounded-full bg-[#5452ee] hover:bg-[#4340e6] text-white font-bold px-6 py-2.5 shadow-md shadow-indigo-500/25 flex items-center gap-2 cursor-pointer transition-transform hover:scale-[1.02]">
                <Plus className="h-4 w-4" />
                <span>+ Create an invoice</span>
              </Button>
            }
          />
        </div>
      </div>

      {/* 2. Four Stat Cards Row (Finnova Signature Layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Overdue / Menunggu Persetujuan */}
        <div className="bg-white rounded-3xl p-5 border border-zinc-200/60 shadow-xs flex flex-col justify-between group hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-600">Overdue</span>
              <div className="h-5 w-5 rounded-full bg-rose-50 text-rose-500 border border-rose-200 flex items-center justify-center font-bold text-xs">
                !
              </div>
            </div>
            <div className="text-2xl sm:text-[28px] font-black text-zinc-900 tracking-tight">
              Rp {stats.pendingSum.toLocaleString("id-ID")}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-rose-500 font-bold">
              <span>↑ 12.5%</span>
              <span className="text-zinc-400 font-normal">from last month</span>
            </div>
          </div>
          {/* Elegant minimalist workspace photo / visual matching the reference image */}
          <div className="h-24 w-full rounded-2xl overflow-hidden mt-4 shadow-inner relative bg-zinc-100">
            <img 
              src="https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=500&auto=format&fit=crop&q=80" 
              alt="Workspace" 
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>

        {/* Card 2: Due within next month */}
        <div className="bg-white rounded-3xl p-5 border border-zinc-200/60 shadow-xs flex flex-col justify-between group hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-600">Due within next month</span>
              <div className="h-5 w-5 rounded-full bg-indigo-50 text-[#5452ee] flex items-center justify-center">
                <Calendar className="h-3 w-3" />
              </div>
            </div>
            <div className="text-2xl sm:text-[28px] font-black text-zinc-900 tracking-tight">
              Rp {(stats.pendingSum + stats.approvedSum).toLocaleString("id-ID")}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-[#5452ee] font-bold">
              <span>↑ 8.2%</span>
              <span className="text-zinc-400 font-normal">from last month</span>
            </div>
          </div>
          {/* Mini Bar Chart with month labels Jul - Dec exactly like the image */}
          <div className="mt-4 pt-1">
            <div className="flex items-end justify-between gap-2 h-16 px-1">
              {[
                { label: "Jul", h: 40 },
                { label: "Aug", h: 60 },
                { label: "Sep", h: 35 },
                { label: "Sep", h: 80 },
                { label: "Oct", h: 50 },
                { label: "Nov", h: 90 },
                { label: "Dec", h: 70 },
              ].map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <div 
                    className="w-full rounded-sm bg-[#5452ee] group-hover:bg-[#4340e6] transition-colors"
                    style={{ height: `${item.h}%` }}
                  />
                  <span className="text-[9px] font-semibold text-zinc-400 mt-1">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 3: Average time to get paid */}
        <div className="bg-white rounded-3xl p-5 border border-zinc-200/60 shadow-xs flex flex-col justify-between group hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-600">Average time to get paid</span>
              <div className="h-5 w-5 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center">
                <Clock className="h-3 w-3" />
              </div>
            </div>
            <div className="text-2xl sm:text-[28px] font-black text-zinc-900 tracking-tight">
              16 <span className="text-base font-semibold text-zinc-500">days</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-cyan-600 font-bold">
              <span>↓ 2 days</span>
              <span className="text-zinc-400 font-normal">from last month</span>
            </div>
          </div>
          {/* Sparkline curve with dots mockup */}
          <div className="mt-4 flex items-center justify-between h-20 px-1">
            <svg className="w-full h-14 overflow-visible" viewBox="0 0 120 40">
              <path
                d="M 5,32 Q 25,28 45,22 T 85,25 T 115,10"
                fill="none"
                stroke="#5452ee"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="5" cy="32" r="2.5" fill="#5452ee" />
              <circle cx="30" cy="28" r="2.5" fill="#5452ee" />
              <circle cx="55" cy="20" r="2.5" fill="#5452ee" />
              <circle cx="85" cy="25" r="2.5" fill="#5452ee" />
              <circle cx="102" cy="18" r="2.5" fill="#5452ee" />
              <circle cx="115" cy="10" r="3.5" fill="#5452ee" />
            </svg>
          </div>
        </div>

        {/* Card 4: Available for Instant Payout */}
        <div className="bg-white rounded-3xl p-5 border border-zinc-200/60 shadow-xs flex flex-col justify-between group hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-600">Available for Instant Payout</span>
              <div className="flex items-center gap-1.5">
                <div className="h-5 w-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Wallet className="h-3 w-3" />
                </div>
                <div className="h-5 w-5 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600">
                  <ArrowUpRight className="h-3 w-3" />
                </div>
              </div>
            </div>
            <div className="text-2xl sm:text-[28px] font-black text-zinc-900 tracking-tight">
              Rp {stats.approvedSum.toLocaleString("id-ID")}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-zinc-400 font-medium">
              <span>Expects </span>
              <span className="font-bold text-zinc-700">{stats.approvedCount} transfers</span>
            </div>
          </div>
          {/* Bank chips row and Payout now button */}
          <div className="mt-4 pt-2 flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1">
              <div className="px-2 py-1 rounded-xl bg-zinc-100 text-[10px] text-zinc-600 font-bold flex flex-col items-center">
                <span>.... 4242</span>
                <span className="text-[8px] text-zinc-400">Visa</span>
              </div>
              <div className="px-2 py-1 rounded-xl bg-[#5452ee] text-white text-[10px] font-bold flex flex-col items-center shadow-xs">
                <span>.... 6789</span>
                <span className="text-[8px] text-indigo-200">Stripe</span>
              </div>
              <div className="px-2 py-1 rounded-xl bg-zinc-100 text-[10px] text-zinc-600 font-bold flex flex-col items-center">
                <span>.... 1234</span>
                <span className="text-[8px] text-zinc-400">PayPal</span>
              </div>
            </div>
            <button className="px-3 py-2 rounded-full bg-[#13141a] text-white text-[11px] font-bold hover:bg-zinc-800 transition-colors cursor-pointer">
              Payout now
            </button>
          </div>
        </div>
      </div>

      {/* 3. Filter Bar Row (Finnova exact layout) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-zinc-200/70 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Active filters badge */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 text-xs font-bold text-zinc-700">
            <span>Active filters</span>
            <span className="h-4 w-4 rounded-full bg-zinc-900 text-white text-[10px] flex items-center justify-center font-bold">
              {filterStatus !== "ALL" || filterUser !== "ALL" ? "2" : "0"}
            </span>
          </div>

          {/* Submitter Dropdown */}
          <div className="relative">
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="appearance-none bg-zinc-50 hover:bg-zinc-100/70 border border-zinc-200 text-xs font-semibold text-zinc-700 py-1.5 pl-3.5 pr-8 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5452ee] transition-colors"
            >
              <option value="ALL">All customers</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
            <ChevronDown className="h-3 w-3 text-zinc-400 absolute right-3 top-2.5 pointer-events-none" />
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none bg-zinc-50 hover:bg-zinc-100/70 border border-zinc-200 text-xs font-semibold text-zinc-700 py-1.5 pl-3.5 pr-8 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5452ee] transition-colors"
            >
              <option value="ALL">All statuses</option>
              <option value="PENDING">Unpaid / Menunggu</option>
              <option value="APPROVED">Paid / Disetujui</option>
              <option value="REJECTED">Cancelled / Ditolak</option>
            </select>
            <ChevronDown className="h-3 w-3 text-zinc-400 absolute right-3 top-2.5 pointer-events-none" />
          </div>

          {/* Date Picker Pills */}
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 text-xs font-semibold text-zinc-700 px-3.5 py-1.5 rounded-full">
              <span>November 2026</span>
              <Calendar className="h-3 w-3 text-zinc-400" />
            </div>
            <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 text-xs font-semibold text-zinc-700 px-3.5 py-1.5 rounded-full">
              <span>Desember 2026</span>
              <Calendar className="h-3 w-3 text-zinc-400" />
            </div>
          </div>
        </div>

        {/* Search Box */}
        <div className="relative min-w-[220px] flex-1 sm:flex-initial">
          <input
            type="text"
            placeholder="Enter invoice # or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200 text-xs text-zinc-800 py-2 pl-4 pr-8 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5452ee] transition-all"
          />
          <Search className="h-3.5 w-3.5 text-zinc-400 absolute right-3.5 top-2.5" />
        </div>
      </div>

      {/* 4. The Dark Master-Detail Container (Finnova Core View) */}
      <div className="bg-[#13141a] rounded-[32px] p-6 lg:p-7 text-white shadow-2xl border border-zinc-800/90">
        {/* Top Header of Dark Container */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-800/80">
          <div>
            <h2 className="text-lg font-extrabold text-white tracking-tight">
              Unpaid Invoices
            </h2>
          </div>

          {/* Status Tabs Pills (Exact match with reference) */}
          <div className="flex items-center bg-[#1c1d25] rounded-full p-1 border border-zinc-700/60">
            <button
              onClick={() => setFilterStatus("ALL")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                filterStatus === "ALL" ? "bg-[#5452ee] text-white shadow-sm" : "text-zinc-400 hover:text-white"
              }`}
            >
              All Invoices
            </button>
            <button
              onClick={() => setFilterStatus("REJECTED")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                filterStatus === "REJECTED" ? "bg-[#5452ee] text-white shadow-sm" : "text-zinc-400 hover:text-white"
              }`}
            >
              <span>Draft</span>
              <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px] font-bold">
                {stats.rejectedCount}
              </span>
            </button>
            <button
              onClick={() => setFilterStatus("PENDING")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                filterStatus === "PENDING" ? "bg-[#5452ee] text-white shadow-sm" : "text-zinc-400 hover:text-white"
              }`}
            >
              <span>Unpaid</span>
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-bold">
                {stats.pendingCount}
              </span>
            </button>
          </div>

          {/* Right Icon options */}
          <div className="hidden sm:flex items-center gap-2 text-zinc-400">
            <button className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center hover:text-white">
              <SlidersHorizontal className="h-3.5 w-3.5" />
            </button>
            <button className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center hover:text-white">
              <MoreVertical className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Master-Detail Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6 min-h-[500px]">
          {/* Left Column: Master List (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-2 overflow-y-auto max-h-[620px] pr-1">
            {filteredExpenses.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-zinc-900/50 border border-zinc-800 text-zinc-400">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-zinc-600" />
                <p className="text-sm font-bold text-zinc-300">Belum ada invoice ditemukan</p>
                <p className="text-xs text-zinc-500 mt-1">Gunakan tombol + Create an invoice untuk menambah pengajuan baru.</p>
              </div>
            ) : (
              filteredExpenses.map((item) => {
                const isSelected = selectedItem?.id === item.id;
                const formattedDate = new Date(item.date).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short"
                });

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={`rounded-2xl p-4 cursor-pointer transition-all duration-200 flex items-center justify-between border ${
                      isSelected
                        ? "bg-[#5452ee] text-white border-indigo-400/40 shadow-xl shadow-indigo-500/25 scale-[1.01]"
                        : "bg-[#181921] hover:bg-[#20222d] text-zinc-300 border-zinc-800/60"
                    }`}
                  >
                    {/* Submitter Avatar & Info */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="h-10 w-10 rounded-full overflow-hidden bg-zinc-800 flex-shrink-0 border-2 border-white/20">
                        <img
                          src={
                            item.submitter?.image || 
                            `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80`
                          }
                          alt={item.submitter?.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold truncate ${isSelected ? "text-white" : "text-zinc-200"}`}>
                            # INV-{item.id.slice(-4).toUpperCase()}
                          </span>
                        </div>
                        <p className={`text-[11px] truncate mt-0.5 ${isSelected ? "text-indigo-100" : "text-zinc-400"}`}>
                          In 2 days • {item.title}
                        </p>
                      </div>
                    </div>

                    {/* Status Pill & Amount */}
                    <div className="text-right flex-shrink-0 ml-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold mb-1 ${
                          isSelected
                            ? "bg-white text-zinc-900"
                            : item.status === "PENDING"
                              ? "bg-zinc-800 text-zinc-300"
                              : item.status === "APPROVED_FINANCE" || item.status === "APPROVED_FOUNDER"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : "bg-rose-500/20 text-rose-300"
                        }`}
                      >
                        {item.status === "PENDING" ? "Unsent" : item.status === "REJECTED" ? "Draft" : "Viewed"}
                      </span>
                      <div className="text-xs font-extrabold tracking-tight">
                        Rp {Number(item.amount).toLocaleString("id-ID")}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Detail View Panel (lg:col-span-7) */}
          <div className="lg:col-span-7">
            {selectedItem ? (
              <div className="h-full rounded-3xl bg-gradient-to-br from-[#5352ed] via-[#5c54ec] to-[#483fd8] p-6 sm:p-8 text-white shadow-2xl flex flex-col justify-between relative overflow-hidden border border-indigo-300/30">
                {/* Decorative background flare */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />

                {/* Top Section */}
                <div>
                  {/* Row 1: Invoice Details, Company, Customer */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-6 border-b border-white/20 items-start">
                    {/* Invoice ID & Status */}
                    <div>
                      <span className="text-[11px] text-indigo-200 font-medium">Invoice details</span>
                      <div className="flex items-center gap-2 mt-1">
                        <h3 className="text-2xl font-black text-white tracking-tight">
                          # INV-{selectedItem.id.slice(-4).toUpperCase()}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white backdrop-blur-sm">
                          {selectedItem.status === "PENDING" ? "Unsent" : selectedItem.status === "REJECTED" ? "Draft" : "Viewed"}
                        </span>
                      </div>
                    </div>

                    {/* Company */}
                    <div>
                      <span className="text-[11px] text-indigo-200 font-medium">Company</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-lg font-extrabold text-white tracking-tight">BrightWave</span>
                        <Globe className="h-4 w-4 text-indigo-200" />
                      </div>
                    </div>

                    {/* Customer */}
                    <div>
                      <span className="text-[11px] text-indigo-200 font-medium">Customer</span>
                      <div className="flex items-center gap-2.5 mt-1">
                        <div className="h-8 w-8 rounded-full overflow-hidden bg-white/20 border border-white/30 flex-shrink-0">
                          <img 
                            src={
                              selectedItem.submitter?.image || 
                              `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80`
                            } 
                            alt={selectedItem.submitter?.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white leading-tight">{selectedItem.submitter?.name || "James Carter"}</p>
                          <p className="text-[10px] text-indigo-200">Marketing Director</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Purpose / Title Box */}
                  <div className="my-5 p-4 rounded-2xl bg-black/15 border border-white/10 backdrop-blur-xs">
                    <p className="text-xs font-bold text-indigo-200 mb-1">Keperluan & Keterangan:</p>
                    <p className="text-sm font-semibold text-white leading-relaxed">
                      {selectedItem.title}
                    </p>
                    {selectedItem.description && (
                      <p className="mt-1 text-xs text-indigo-100 font-normal">
                        {selectedItem.description}
                      </p>
                    )}
                  </div>

                  {/* 3 Breakdown Cards Row (Exact replica of Finnova) */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 my-5">
                    {/* Card 1 */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 hover:bg-white/15 transition-all">
                      <div className="flex items-center justify-between text-indigo-200">
                        <span className="text-sm font-black text-white">
                          Rp {(Number(selectedItem.amount) * 0.4).toLocaleString("id-ID")}
                        </span>
                        <ArrowUpRight className="h-4 w-4 text-white/80" />
                      </div>
                      <p className="text-[11px] text-indigo-200 font-medium mt-2 truncate">UI/UX Design</p>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 hover:bg-white/15 transition-all">
                      <div className="flex items-center justify-between text-indigo-200">
                        <span className="text-sm font-black text-white">
                          Rp {(Number(selectedItem.amount) * 0.35).toLocaleString("id-ID")}
                        </span>
                        <ArrowUpRight className="h-4 w-4 text-white/80" />
                      </div>
                      <p className="text-[11px] text-indigo-200 font-medium mt-2 truncate">Development</p>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 hover:bg-white/15 transition-all">
                      <div className="flex items-center justify-between text-indigo-200">
                        <span className="text-sm font-black text-white">
                          Rp {(Number(selectedItem.amount) * 0.25).toLocaleString("id-ID")}
                        </span>
                        <ArrowUpRight className="h-4 w-4 text-white/80" />
                      </div>
                      <p className="text-[11px] text-indigo-200 font-medium mt-2 truncate">QA & Testing</p>
                    </div>

                    {/* Card 4: Add item */}
                    <div 
                      onClick={() => setIsEditDialogOpen(true)}
                      className="bg-white/5 border border-dashed border-white/25 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/10 transition-all group"
                    >
                      <Plus className="h-4 w-4 text-indigo-200 group-hover:scale-110 transition-transform mb-1" />
                      <span className="text-[11px] font-bold text-white">Add item</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Totals & Action Buttons (Exact Finnova match) */}
                <div className="pt-6 border-t border-white/20 mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                  <div className="flex items-center gap-6 sm:gap-8">
                    <div>
                      <span className="text-[10px] text-indigo-200 font-medium">Sub Total</span>
                      <div className="text-base sm:text-lg font-black text-white">
                        Rp {Number(selectedItem.amount).toLocaleString("id-ID")}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-indigo-200 font-medium">Total</span>
                      <div className="text-base sm:text-lg font-black text-white">
                        Rp {Number(selectedItem.amount).toLocaleString("id-ID")}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-indigo-200 font-medium">Balance Due</span>
                      <div className="text-base sm:text-lg font-black text-white">
                        Rp {Number(selectedItem.amount).toLocaleString("id-ID")}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => handleDelete(selectedItem.id)}
                      disabled={actionLoading}
                      title="Hapus"
                      className="h-10 w-10 rounded-full bg-white/10 hover:bg-rose-600 text-white flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <button
                      title="Copy link"
                      onClick={() => alert("Link invoice disalin ke clipboard")}
                      className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Link2 className="h-4 w-4" />
                    </button>

                    <button
                      title="Calendar"
                      className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Calendar className="h-4 w-4" />
                    </button>

                    {selectedItem.status === "PENDING" ? (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(selectedItem.id, "REJECTED")}
                          disabled={actionLoading}
                          className="px-4 py-2.5 rounded-full bg-white/15 hover:bg-rose-600 text-white font-bold text-xs transition-colors cursor-pointer"
                        >
                          Tolak
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(selectedItem.id, "APPROVED_FINANCE")}
                          disabled={actionLoading}
                          className="px-6 py-2.5 rounded-full bg-white hover:bg-zinc-100 text-zinc-950 font-black text-xs shadow-xl transition-all hover:scale-105 cursor-pointer"
                        >
                          Payout now
                        </button>
                      </>
                    ) : selectedItem.status === "APPROVED_FINANCE" || selectedItem.status === "APPROVED_FOUNDER" ? (
                      <div className="px-5 py-2.5 rounded-full bg-white text-emerald-700 font-black text-xs flex items-center gap-1.5 shadow-md">
                        <Check className="h-4 w-4" />
                        <span>Paid & Approved</span>
                      </div>
                    ) : (
                      <div className="px-5 py-2.5 rounded-full bg-rose-500 text-white font-black text-xs flex items-center gap-1.5">
                        <XCircle className="h-4 w-4" />
                        <span>Cancelled</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Edit Form Dialog */}
                <ExpenseFormDialog
                  expense={{
                    ...selectedItem,
                    amount: Number(selectedItem.amount),
                    projectId: "",
                    submittedById: selectedItem.submitter?.id
                  }}
                  projects={[]}
                  users={users}
                  open={isEditDialogOpen}
                  onOpenChange={setIsEditDialogOpen}
                  trigger={null}
                />
              </div>
            ) : (
              <div className="h-full rounded-3xl bg-zinc-900 border border-zinc-800 p-8 flex items-center justify-center text-zinc-500">
                Select an invoice to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
