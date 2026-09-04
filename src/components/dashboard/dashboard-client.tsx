"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  XCircle,
} from "lucide-react";
import { createExpense, getDashboardStats } from "@/server/actions/expense.action";

type DashboardStats = {
  totalPengajuan: number;
  totalDisetujui: number;
  totalPending: number;
  countApproved: number;
  countPending: number;
  countRejected: number;
  countTotal: number;
  recentExpenses: {
    id: string;
    title: string;
    amount: number;
    status: string;
    submitter: { name: string };
  }[];
};

const POLL_INTERVAL_MS = 8000;

export function DashboardClient({
  initialStats,
  users,
}: {
  initialStats: DashboardStats;
  users: { id: string; name: string }[];
}) {
  const [stats, setStats] = useState(initialStats);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    submitterId: users[0]?.id || "",
    teamDivision: "Tim IT & Dev",
    title: "",
    amount: "",
    description: "",
  });

  const refreshStats = useCallback(async () => {
    const fresh = await getDashboardStats();
    setStats(fresh);
  }, []);

  useEffect(() => {
    const id = setInterval(refreshStats, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [refreshStats]);

  // Sync with active PIN session - pengajuan otomatis atas nama user yang sedang login
  useEffect(() => {
    const saved = localStorage.getItem("mst_team_session");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.userId) {
          setForm((prev) => ({ ...prev, submitterId: parsed.userId }));
        }
      } catch (e) {}
    }
  }, []);

  const formatRupiah = (val: string) => {
    const numeric = val.replace(/[^0-9]/g, "");
    if (!numeric) return "";
    return "Rp " + Number(numeric).toLocaleString("id-ID");
  };

  const pct = (n: number) => (stats.countTotal === 0 ? 0 : Math.round((n / stats.countTotal) * 100));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.amount) {
      alert("Harap isi judul kebutuhan dan nominal modal.");
      return;
    }

    setIsSubmitting(true);
    const cleanAmount = Number(form.amount.replace(/[^0-9]/g, "")) || 0;

    const res = await createExpense({
      title: form.title,
      amount: cleanAmount,
      date: new Date().toISOString().split("T")[0],
      category: form.teamDivision,
      description: form.description || "Pengajuan kebutuhan operasional tim.",
      submittedById: form.submitterId || users[0]?.id || "",
      projectId: "",
    });

    setIsSubmitting(false);

    if (res.error) {
      alert(res.error);
      return;
    }

    setShowForm(false);
    setForm({
      submitterId: users[0]?.id || "",
      teamDivision: "Tim IT & Dev",
      title: "",
      amount: "",
      description: "",
    });
    refreshStats();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#241B3A] tracking-tight">
            Dashboard Modal Tim
          </h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 rounded-md bg-[#241B3A] hover:bg-[#1B142C] px-4 py-2.5 text-xs font-semibold text-white transition-colors cursor-pointer shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Ajukan Modal Tim</span>
        </button>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border border-[#E5E5E8] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#8A8A91] mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Modal Diajukan</span>
            <div className="h-7 w-7 rounded-md bg-[#F3F3F5] flex items-center justify-center text-[#241B3A]">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-900 tracking-tight">
            Rp {Number(stats.totalPengajuan).toLocaleString("id-ID")}
          </div>
        </div>

        <div className="rounded-lg border border-[#E5E5E8] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#8A8A91] mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Modal Disetujui</span>
            <div className="h-7 w-7 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-700 tracking-tight">
            Rp {Number(stats.totalDisetujui).toLocaleString("id-ID")}
          </div>
        </div>

        <div className="rounded-lg border border-[#E5E5E8] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#8A8A91] mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Menunggu Persetujuan</span>
            <div className="h-7 w-7 rounded-md bg-[#241B3A]/10 flex items-center justify-center text-[#241B3A]">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#241B3A] tracking-tight">
            Rp {Number(stats.totalPending).toLocaleString("id-ID")}
          </div>
          <p className="text-[11px] text-[#6B6B73] mt-1">{stats.countPending} pengajuan</p>
        </div>
      </div>

      {/* Status Breakdown & Recent Submissions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Status Breakdown */}
        <div className="lg:col-span-2 rounded-lg border border-[#E5E5E8] bg-white p-5 shadow-xs">
          <div className="mb-4 border-b border-[#E5E5E8] pb-3">
            <h2 className="text-sm font-bold text-[#241B3A]">Status Pengajuan</h2>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="flex items-center gap-1.5 font-semibold text-zinc-700">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Disetujui
                </span>
                <span className="text-[#6B6B73]">{stats.countApproved} pengajuan &middot; {pct(stats.countApproved)}%</span>
              </div>
              <div className="h-2 rounded-full bg-[#F3F3F5] overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct(stats.countApproved)}%` }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="flex items-center gap-1.5 font-semibold text-zinc-700">
                  <Clock className="h-3.5 w-3.5 text-[#241B3A]" /> Menunggu Persetujuan
                </span>
                <span className="text-[#6B6B73]">{stats.countPending} pengajuan &middot; {pct(stats.countPending)}%</span>
              </div>
              <div className="h-2 rounded-full bg-[#F3F3F5] overflow-hidden">
                <div className="h-full bg-[#241B3A] rounded-full transition-all" style={{ width: `${pct(stats.countPending)}%` }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="flex items-center gap-1.5 font-semibold text-zinc-700">
                  <XCircle className="h-3.5 w-3.5 text-rose-500" /> Ditolak
                </span>
                <span className="text-[#6B6B73]">{stats.countRejected} pengajuan &middot; {pct(stats.countRejected)}%</span>
              </div>
              <div className="h-2 rounded-full bg-[#F3F3F5] overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full transition-all" style={{ width: `${pct(stats.countRejected)}%` }} />
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[#E5E5E8] text-xs text-[#6B6B73]">
            Total <span className="font-bold text-zinc-900">{stats.countTotal}</span> pengajuan modal tercatat
          </div>
        </div>

        {/* Right 1 Col: Recent Team Requests */}
        <div className="rounded-lg border border-[#E5E5E8] bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-[#E5E5E8] pb-2.5">
              <h2 className="text-sm font-bold text-[#241B3A]">Pengajuan Tim Terkini</h2>
              <Link href="/expenses" className="text-xs font-semibold text-[#241B3A] hover:underline flex items-center gap-1">
                Buka Semua <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="divide-y divide-[#E5E5E8]">
              {stats.recentExpenses.length === 0 ? (
                <p className="text-xs text-zinc-500 py-6 text-center">Belum ada pengajuan tim</p>
              ) : (
                stats.recentExpenses.map((item) => (
                  <div key={item.id} className="py-2.5 first:pt-0 last:pb-0 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-zinc-900 truncate max-w-[160px]">{item.title}</span>
                      <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                        item.status === "PENDING"
                          ? "bg-[#241B3A]/10 text-[#241B3A]"
                          : item.status === "REJECTED"
                            ? "bg-rose-50 text-rose-700"
                            : "bg-emerald-50 text-emerald-700"
                      }`}>
                        {item.status === "PENDING" ? "Menunggu" : item.status === "REJECTED" ? "Ditolak" : "Disetujui"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#6B6B73] mt-1">
                      <span>{item.submitter?.name}</span>
                      <span className="font-bold text-[#241B3A]">
                        Rp {Number(item.amount).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[#E5E5E8] mt-4">
            <button
              onClick={() => setShowForm(true)}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-md bg-[#241B3A] text-xs font-semibold text-white hover:bg-[#1B142C] transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Buat Pengajuan Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl border border-[#E5E5E8] bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E5E8] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#241B3A]">Form Pengajuan Modal Tim</h3>
                <p className="text-xs text-[#6B6B73]">Isi formulir ringkas untuk permohonan dana kebutuhan tim Anda.</p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="text-zinc-400 hover:text-zinc-700 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-800 mb-1">Judul / Keperluan Modal</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pembelian lisensi Figma tim desain 6 bulan"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-md border border-[#D1D1D6] px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-[#241B3A]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-800 mb-1">Divisi / Tim</label>
                  <select
                    value={form.teamDivision}
                    onChange={(e) => setForm({ ...form, teamDivision: e.target.value })}
                    className="w-full rounded-md border border-[#D1D1D6] px-3 py-2 text-xs text-zinc-900 bg-white focus:outline-none focus:border-[#241B3A]"
                  >
                    <option value="Tim IT & Dev">Tim IT & Dev</option>
                    <option value="Tim Marketing & Ads">Tim Marketing & Ads</option>
                    <option value="Tim Desain & Kreatif">Tim Desain & Kreatif</option>
                    <option value="Tim Operasional & Lapangan">Tim Operasional & Lapangan</option>
                    <option value="Tim Finansial / Umum">Tim Finansial / Umum</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-800 mb-1">Nominal Dana (Rp)</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 1.500.000"
                    value={formatRupiah(form.amount)}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full rounded-md border border-[#D1D1D6] px-3 py-2 text-xs font-bold text-zinc-900 focus:outline-none focus:border-[#241B3A]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-800 mb-1">Keterangan (opsional)</label>
                <textarea
                  rows={2}
                  placeholder="Rincian singkat penggunaan modal, jika perlu..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-md border border-[#D1D1D6] px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-[#241B3A]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5E5E8]">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-md border border-[#D1D1D6] text-xs font-semibold text-zinc-700 hover:bg-[#F3F3F5] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-md bg-[#241B3A] hover:bg-[#1B142C] text-xs font-semibold text-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Kirim Pengajuan Modal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
