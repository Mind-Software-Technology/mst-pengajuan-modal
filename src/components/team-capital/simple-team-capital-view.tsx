"use client";

import React, { useState, useTransition } from "react";
import { 
  Plus, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye, 
  Trash2, 
  Check, 
  DollarSign, 
  Users, 
  Briefcase, 
  FileText,
  Building,
  ArrowRight,
  Filter
} from "lucide-react";
import { createExpense, updateExpenseStatus, deleteExpense } from "@/server/actions/expense.action";

type ExpenseItem = {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: string;
  status: string;
  description?: string | null;
  submitter: { id: string; name: string };
};

interface SimpleTeamCapitalViewProps {
  initialExpenses: ExpenseItem[];
  users: { id: string; name: string }[];
  isHistory?: boolean;
}

export function SimpleTeamCapitalView({ initialExpenses, users, isHistory = false }: SimpleTeamCapitalViewProps) {
  const [showModalForm, setShowModalForm] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedItem, setSelectedItem] = useState<ExpenseItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState({
    submitterId: users[0]?.id || "",
    submitterName: "",
    teamDivision: "Tim IT & Dev",
    title: "",
    amount: "",
    description: "",
  });

  // Sync with active PIN session - pengajuan otomatis atas nama user yang sedang login
  React.useEffect(() => {
    const saved = sessionStorage.getItem("mst_team_session");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setForm((prev) => ({
          ...prev,
          submitterId: parsed.userId || prev.submitterId,
          submitterName: parsed.personName || prev.submitterName,
        }));
      } catch (e) {}
    }
  }, []);

  // Riwayat hanya menampilkan pengajuan yang statusnya sudah final (disetujui/ditolak)
  const baseExpenses = isHistory
    ? initialExpenses.filter((e) => e.status !== "PENDING")
    : initialExpenses;

  // Calculations
  const totalDiajukan = baseExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalDisetujui = baseExpenses
    .filter((e) => e.status === "APPROVED_FINANCE" || e.status === "APPROVED_FOUNDER")
    .reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalMenunggu = baseExpenses
    .filter((e) => e.status === "PENDING")
    .reduce((acc, curr) => acc + Number(curr.amount), 0);
  const countMenunggu = baseExpenses.filter((e) => e.status === "PENDING").length;
  const countDitolak = baseExpenses.filter((e) => e.status === "REJECTED").length;

  const filtered = baseExpenses.filter((item) => {
    const matchSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      item.submitter?.name.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      statusFilter === "ALL" ? true :
      statusFilter === "PENDING" ? item.status === "PENDING" :
      statusFilter === "APPROVED" ? (item.status === "APPROVED_FINANCE" || item.status === "APPROVED_FOUNDER") :
      item.status === "REJECTED";

    return matchSearch && matchStatus;
  });

  const formatRupiah = (val: string | number) => {
    const numeric = String(val).replace(/[^0-9]/g, "");
    if (!numeric) return "";
    return "Rp " + Number(numeric).toLocaleString("id-ID");
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
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
      projectId: ""
    });

    setIsSubmitting(false);

    if (res.error) {
      alert(res.error);
    } else {
      setShowModalForm(false);
      setForm({
        submitterId: users[0]?.id || "",
        submitterName: users[0]?.name || "",
        teamDivision: "Tim IT & Dev",
        title: "",
        amount: "",
        description: "",
      });
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: "APPROVED_FINANCE" | "REJECTED") => {
    const isApprove = newStatus === "APPROVED_FINANCE";
    if (!confirm(`Yakin ingin ${isApprove ? "menyetujui & mencairkan" : "menolak"} pengajuan ini?`)) return;

    setActionLoadingId(id);
    const res = await updateExpenseStatus(id, newStatus);
    setActionLoadingId(null);
    if (res.error) {
      alert(res.error);
    } else {
      if (selectedItem?.id === id) {
        setSelectedItem(null);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus pengajuan ini?")) return;
    setActionLoadingId(id);
    const res = await deleteExpense(id);
    setActionLoadingId(null);
    if (res.error) alert(res.error);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#241B3A] tracking-tight">
            {isHistory ? "Riwayat & Pencairan" : "Pengajuan Modal Tim"}
          </h1>
          <p className="text-xs text-[#6B6B73] mt-0.5">
            {isHistory
              ? "Daftar pengajuan yang sudah selesai diproses: disetujui & dicairkan, atau ditolak."
              : "Sistem pengajuan dan persetujuan dana modal kebutuhan operasional antar tim internal."}
          </p>
        </div>

        {!isHistory && (
          <button
            onClick={() => setShowModalForm(true)}
            className="inline-flex items-center gap-2 rounded-md bg-[#241B3A] hover:bg-[#1B142C] px-4 py-2.5 text-xs font-semibold text-white transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Buat Pengajuan Modal</span>
          </button>
        )}
      </div>

      {/* 2. Three Clean Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border border-[#E5E5E8] bg-white p-5 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8A8A91]">
            {isHistory ? "Total Riwayat" : "Total Diajukan Tim"}
          </span>
          <div className="text-2xl font-bold text-zinc-900 mt-1">
            Rp {totalDiajukan.toLocaleString("id-ID")}
          </div>
          <p className="text-[11px] text-[#6B6B73] mt-1">{baseExpenses.length} pengajuan tercatat</p>
        </div>

        <div className="rounded-lg border border-[#E5E5E8] bg-white p-5 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8A8A91]">
            Modal Telah Disetujui
          </span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">
            Rp {totalDisetujui.toLocaleString("id-ID")}
          </div>
          <p className="text-[11px] text-[#6B6B73] mt-1">Telah disetujui pemegang kas</p>
        </div>

        {isHistory ? (
          <div className="rounded-lg border border-[#E5E5E8] bg-white p-5 shadow-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8A8A91]">
              Ditolak
            </span>
            <div className="text-2xl font-bold text-rose-700 mt-1">
              {countDitolak}
            </div>
            <p className="text-[11px] text-[#6B6B73] mt-1">pengajuan tidak disetujui</p>
          </div>
        ) : (
          <div className="rounded-lg border border-[#E5E5E8] bg-white p-5 shadow-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8A8A91]">
              Menunggu Persetujuan
            </span>
            <div className="text-2xl font-bold text-[#241B3A] mt-1">
              Rp {totalMenunggu.toLocaleString("id-ID")}
            </div>
            <p className="text-[11px] text-[#6B6B73] mt-1">{countMenunggu} pengajuan perlu ditinjau</p>
          </div>
        )}
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-lg border border-[#E5E5E8]">
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="h-4 w-4 text-[#8A8A91] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari kebutuhan, tim, atau pemohon..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-[#D1D1D6] py-1.5 pl-9 pr-3 text-xs text-zinc-900 focus:outline-none focus:border-[#241B3A] focus:ring-1 focus:ring-[#241B3A]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-[#D1D1D6] py-1.5 px-3 text-xs font-medium text-zinc-800 bg-white focus:outline-none focus:border-[#241B3A]"
          >
            <option value="ALL">{isHistory ? "Semua Riwayat" : "Semua Status"}</option>
            {!isHistory && <option value="PENDING">Menunggu Persetujuan</option>}
            <option value="APPROVED">Sudah Disetujui</option>
            <option value="REJECTED">Ditolak</option>
          </select>
        </div>

        <div className="text-xs text-[#6B6B73]">
          Menampilkan <span className="font-bold text-zinc-900">{filtered.length}</span> permohonan modal
        </div>
      </div>

      {/* 4. Submissions Table */}
      <div className="rounded-lg border border-[#E5E5E8] bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E5E5E8] bg-[#F8F9FA] text-[#6B6B73] font-semibold">
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Kebutuhan Modal</th>
                <th className="py-3 px-4">Pemohon</th>
                <th className="py-3 px-4">Nominal</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Persetujuan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E8]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-zinc-500">
                    <p className="font-semibold text-zinc-700">
                      {isHistory ? "Belum ada riwayat pengajuan" : "Belum ada data pengajuan modal"}
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      {isHistory
                        ? "Pengajuan yang sudah disetujui atau ditolak akan muncul di sini."
                        : 'Klik tombol "Buat Pengajuan Modal" untuk mengajukan permohonan dana kebutuhan tim.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const isPending = item.status === "PENDING";
                  const isApproved = item.status === "APPROVED_FINANCE" || item.status === "APPROVED_FOUNDER";

                  return (
                    <tr key={item.id} className="hover:bg-[#F8F9FA] transition-colors">
                      <td className="py-3 px-4 text-[#6B6B73]">
                        {new Date(item.date).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-zinc-900 truncate max-w-sm">{item.title}</p>
                        <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded bg-[#F3F3F5] text-zinc-600 text-[10px] font-medium border border-[#E5E5E8]">
                          {item.category || "Operasional Tim"}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-zinc-800">
                        {item.submitter?.name}
                      </td>
                      <td className="py-3 px-4 font-bold text-[#241B3A]">
                        Rp {Number(item.amount).toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold ${
                            isPending
                              ? "bg-[#241B3A]/10 text-[#241B3A] border border-[#241B3A]/20"
                              : isApproved
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {isPending ? "Menunggu Persetujuan" : isApproved ? "Disetujui" : "Ditolak"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Tombol yang megang uang: Setujui & Tolak */}
                          {isPending ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleStatusUpdate(item.id, "APPROVED_FINANCE")}
                                disabled={actionLoadingId === item.id}
                                title="Setujui Modal (Oleh Pemegang Kas)"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#241B3A] hover:bg-[#1B142C] text-white text-[11px] font-semibold cursor-pointer shadow-xs"
                              >
                                <Check className="h-3 w-3" />
                                <span>Setujui</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusUpdate(item.id, "REJECTED")}
                                disabled={actionLoadingId === item.id}
                                title="Tolak Pengajuan"
                                className="px-2 py-1 rounded border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-[11px] font-semibold cursor-pointer"
                              >
                                Tolak
                              </button>
                            </>
                          ) : (
                            <span className="text-[11px] text-[#8A8A91] italic pr-2">
                              {isApproved ? "Sudah Dicairkan" : "Dibatalkan"}
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => setSelectedItem(item)}
                            title="Detail"
                            className="p-1 rounded border border-[#E5E5E8] text-zinc-600 hover:bg-[#F3F3F5] cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            disabled={actionLoadingId === item.id}
                            title="Hapus"
                            className="p-1 rounded text-zinc-400 hover:text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Simple Modal Dialog: Form Pengajuan Baru */}
      {showModalForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl border border-[#E5E5E8] bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E5E8] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#241B3A]">Form Pengajuan Modal Tim</h3>
                <p className="text-xs text-[#6B6B73]">Isi formulir ringkas untuk permohonan dana kebutuhan tim Anda.</p>
              </div>
              <button 
                onClick={() => setShowModalForm(false)}
                className="text-zinc-400 hover:text-zinc-700 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
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
                  onClick={() => setShowModalForm(false)}
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

      {/* 6. Detail View Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl border border-[#E5E5E8] bg-white p-6 shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#E5E5E8] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#241B3A]">Rincian Pengajuan Modal Tim</h3>
                <span className="text-[10px] text-[#8A8A91]">#MOD-{selectedItem.id.slice(-4).toUpperCase()}</span>
              </div>
              <button 
                onClick={() => setSelectedItem(null)}
                className="text-zinc-400 hover:text-zinc-700 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 bg-[#F8F9FA] rounded-md border border-[#E5E5E8]">
                <span className="text-[10px] text-[#6B6B73] uppercase tracking-wider font-semibold">Nominal Dibutuhkan:</span>
                <p className="text-lg font-bold text-[#241B3A] mt-0.5">
                  Rp {Number(selectedItem.amount).toLocaleString("id-ID")}
                </p>
              </div>

              <div>
                <span className="text-[#6B6B73] font-semibold">Keperluan:</span>
                <p className="font-bold text-zinc-900 mt-0.5">{selectedItem.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-[#6B6B73]">Pemohon:</span>
                  <p className="font-semibold text-zinc-900">{selectedItem.submitter?.name}</p>
                </div>
                <div>
                  <span className="text-[#6B6B73]">Divisi / Kategori:</span>
                  <p className="font-semibold text-zinc-900">{selectedItem.category}</p>
                </div>
              </div>

              {selectedItem.description && (
                <div className="pt-1">
                  <span className="text-[#6B6B73] font-semibold">Rincian / Keterangan:</span>
                  <p className="mt-1 p-2.5 bg-[#F8F9FA] rounded border border-[#E5E5E8] text-zinc-800 leading-relaxed">
                    {selectedItem.description}
                  </p>
                </div>
              )}

              <div className="pt-2">
                <span className="text-[#6B6B73] font-semibold">Status Persetujuan:</span>
                <div className="mt-1">
                  <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                    selectedItem.status === "PENDING"
                      ? "bg-[#241B3A]/10 text-[#241B3A]"
                      : selectedItem.status === "APPROVED_FINANCE" || selectedItem.status === "APPROVED_FOUNDER"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-700"
                  }`}>
                    {selectedItem.status === "PENDING" ? "Menunggu Persetujuan Pemegang Kas" : selectedItem.status === "REJECTED" ? "Pengajuan Ditolak" : "Disetujui & Siap Dicairkan"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5E5E8]">
              {selectedItem.status === "PENDING" && (
                <>
                  <button
                    onClick={() => handleStatusUpdate(selectedItem.id, "REJECTED")}
                    className="px-3 py-1.5 rounded-md border border-rose-200 text-xs font-semibold text-rose-700 hover:bg-rose-50 cursor-pointer"
                  >
                    Tolak
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedItem.id, "APPROVED_FINANCE")}
                    className="px-4 py-1.5 rounded-md bg-[#241B3A] text-xs font-semibold text-white hover:bg-[#1B142C] cursor-pointer"
                  >
                    Setujui & Cairkan
                  </button>
                </>
              )}
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-1.5 rounded-md border border-[#D1D1D6] text-xs font-semibold text-zinc-700 hover:bg-[#F3F3F5] cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
