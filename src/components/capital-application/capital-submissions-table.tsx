"use client";

import React, { useState } from "react";
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  Eye, 
  Trash2, 
  Check,
  Building2,
  Calendar
} from "lucide-react";
import { updateExpenseStatus, deleteExpense } from "@/server/actions/expense.action";

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

export function CapitalSubmissionsTable({ 
  expenses, 
  onRefresh 
}: { 
  expenses: ExpenseItem[]; 
  onRefresh?: () => void;
}) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedDetail, setSelectedDetail] = useState<ExpenseItem | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = expenses.filter((item) => {
    const matchSearch = 
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      item.submitter?.name.toLowerCase().includes(search.toLowerCase());

    const matchStatus = 
      filterStatus === "ALL" ? true :
      filterStatus === "PENDING" ? item.status === "PENDING" :
      filterStatus === "APPROVED" ? (item.status === "APPROVED_FINANCE" || item.status === "APPROVED_FOUNDER") :
      item.status === "REJECTED";

    return matchSearch && matchStatus;
  });

  const handleStatusChange = async (id: string, status: "APPROVED_FINANCE" | "REJECTED") => {
    const isApprove = status === "APPROVED_FINANCE";
    if (!confirm(`Apakah Anda yakin ingin ${isApprove ? "menyetujui dan mencairkan" : "menolak"} pengajuan ini?`)) return;

    setLoadingId(id);
    const res = await updateExpenseStatus(id, status);
    setLoadingId(null);
    if (res.error) {
      alert(res.error);
    } else {
      if (selectedDetail?.id === id) {
        setSelectedDetail(null);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus data pengajuan modal ini?")) return;
    setLoadingId(id);
    const res = await deleteExpense(id);
    setLoadingId(null);
    if (res.error) alert(res.error);
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-lg border border-[#E5E5E8]">
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="h-4 w-4 text-[#8A8A91] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari pengajuan usaha, pemohon..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-[#D1D1D6] py-1.5 pl-9 pr-3 text-xs focus:outline-none focus:border-[#241B3A] focus:ring-1 focus:ring-[#241B3A]"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-md border border-[#D1D1D6] py-1.5 px-3 text-xs font-medium text-zinc-800 bg-white focus:outline-none focus:border-[#241B3A]"
          >
            <option value="ALL">Semua Status</option>
            <option value="PENDING">Sedang Diproses</option>
            <option value="APPROVED">Disetujui</option>
            <option value="REJECTED">Ditolak</option>
          </select>
        </div>

        <div className="text-xs text-[#6B6B73] font-medium">
          Menampilkan <span className="font-bold text-zinc-900">{filtered.length}</span> pengajuan
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-lg border border-[#E5E5E8] bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E5E5E8] bg-[#F8F9FA] text-[#6B6B73] font-semibold">
                <th className="py-3 px-4">No. Pengajuan</th>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Nama Usaha / Keperluan</th>
                <th className="py-3 px-4">Pemohon</th>
                <th className="py-3 px-4">Nominal Modal</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E8]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500">
                    Tidak ada data pengajuan yang sesuai.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const isPending = item.status === "PENDING";
                  const isApproved = item.status === "APPROVED_FINANCE" || item.status === "APPROVED_FOUNDER";

                  return (
                    <tr key={item.id} className="hover:bg-[#F8F9FA] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#241B3A]">
                        #PM-{item.id.slice(-4).toUpperCase()}
                      </td>
                      <td className="py-3.5 px-4 text-[#6B6B73]">
                        {new Date(item.date).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-zinc-900 truncate max-w-xs">{item.title}</p>
                        <span className="text-[10px] text-[#6B6B73]">{item.category}</span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-zinc-800">
                        {item.submitter?.name}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#241B3A]">
                        Rp {Number(item.amount).toLocaleString("id-ID")}
                      </td>
                      <td className="py-3.5 px-4">
                        <span 
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            isPending
                              ? "bg-[#241B3A]/10 text-[#241B3A] border border-[#241B3A]/20"
                              : isApproved
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {isPending ? "Sedang Diproses" : isApproved ? "Disetujui" : "Ditolak"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedDetail(item)}
                            title="Lihat Detail"
                            className="p-1.5 rounded border border-[#E5E5E8] bg-white text-zinc-700 hover:bg-[#F3F3F5] cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>

                          {isPending && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(item.id, "APPROVED_FINANCE")}
                                disabled={loadingId === item.id}
                                title="Setujui Modal"
                                className="p-1.5 rounded bg-[#241B3A] text-white hover:bg-[#1B142C] cursor-pointer"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(item.id, "REJECTED")}
                                disabled={loadingId === item.id}
                                title="Tolak"
                                className="p-1.5 rounded border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 cursor-pointer"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            disabled={loadingId === item.id}
                            title="Hapus"
                            className="p-1.5 rounded border border-[#E5E5E8] text-zinc-400 hover:text-rose-600 hover:border-rose-200 cursor-pointer"
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

      {/* Detail Modal Dialog */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-lg border border-[#E5E5E8] bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E5E8] pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#8A8A91]">
                  #PM-{selectedDetail.id.slice(-4).toUpperCase()}
                </span>
                <h3 className="text-base font-bold text-[#241B3A] mt-0.5">Rincian Pengajuan Modal</h3>
              </div>
              <button 
                onClick={() => setSelectedDetail(null)}
                className="text-zinc-400 hover:text-zinc-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 bg-[#F8F9FA] rounded-md border border-[#E5E5E8]">
                <div>
                  <span className="text-[#6B6B73]">Pemohon:</span>
                  <p className="font-bold text-zinc-900 mt-0.5">{selectedDetail.submitter?.name}</p>
                </div>
                <div>
                  <span className="text-[#6B6B73]">Nominal:</span>
                  <p className="font-bold text-[#241B3A] mt-0.5">
                    Rp {Number(selectedDetail.amount).toLocaleString("id-ID")}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-[#6B6B73] font-semibold">Tujuan Pengajuan:</span>
                <p className="mt-1 p-2.5 bg-white border border-[#E5E5E8] rounded text-zinc-800 leading-relaxed whitespace-pre-line">
                  {selectedDetail.title}
                  {selectedDetail.description && `\n\n${selectedDetail.description}`}
                </p>
              </div>

              <div>
                <span className="text-[#6B6B73] font-semibold">Status Saat Ini:</span>
                <div className="mt-1">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#241B3A] text-white">
                    {selectedDetail.status === "PENDING" ? "Sedang Diproses" : selectedDetail.status === "REJECTED" ? "Ditolak" : "Disetujui"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5E5E8]">
              {selectedDetail.status === "PENDING" && (
                <>
                  <button
                    onClick={() => handleStatusChange(selectedDetail.id, "REJECTED")}
                    className="px-4 py-2 rounded-md border border-rose-300 text-xs font-semibold text-rose-700 hover:bg-rose-50 cursor-pointer"
                  >
                    Tolak
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedDetail.id, "APPROVED_FINANCE")}
                    className="px-4 py-2 rounded-md bg-[#241B3A] text-xs font-semibold text-white hover:bg-[#1B142C] cursor-pointer"
                  >
                    Setujui & Cairkan
                  </button>
                </>
              )}
              <button
                onClick={() => setSelectedDetail(null)}
                className="px-4 py-2 rounded-md border border-[#D1D1D6] text-xs font-semibold text-zinc-700 hover:bg-[#F3F3F5] cursor-pointer"
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
