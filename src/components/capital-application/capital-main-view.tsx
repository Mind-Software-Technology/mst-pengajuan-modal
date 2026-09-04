"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { CapitalApplicationWorkflow } from "./capital-application-workflow";
import { CapitalSubmissionsTable } from "./capital-submissions-table";
import { 
  FileEdit, 
  History, 
  Activity, 
  FolderLock, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Download,
  Building2,
  HelpCircle,
  ExternalLink,
  ShieldCheck
} from "lucide-react";

interface CapitalMainViewProps {
  initialExpenses: any[];
  users: { id: string; name: string }[];
}

export function CapitalMainView({ initialExpenses, users }: CapitalMainViewProps) {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "form";
  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  // Active submission for Status Tab (latest pending or approved)
  const latestSubmission = initialExpenses[0];

  return (
    <div className="space-y-6">
      {/* Tab Navigation Strip */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E5E5E8] pb-3">
        <button
          onClick={() => setActiveTab("form")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === "form"
              ? "bg-[#241B3A] text-white shadow-xs"
              : "text-[#6B6B73] hover:text-[#241B3A] hover:bg-[#F3F3F5]"
          }`}
        >
          <FileEdit className="h-4 w-4" />
          <span>Formulir Pengajuan Modal</span>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === "history"
              ? "bg-[#241B3A] text-white shadow-xs"
              : "text-[#6B6B73] hover:text-[#241B3A] hover:bg-[#F3F3F5]"
          }`}
        >
          <History className="h-4 w-4" />
          <span>Riwayat Pengajuan</span>
          <span className={`px-1.5 py-0.2 rounded text-[10px] ${
            activeTab === "history" ? "bg-white/20 text-white" : "bg-zinc-200 text-zinc-700 font-bold"
          }`}>
            {initialExpenses.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("status")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === "status"
              ? "bg-[#241B3A] text-white shadow-xs"
              : "text-[#6B6B73] hover:text-[#241B3A] hover:bg-[#F3F3F5]"
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>Status & Tracking</span>
        </button>

        <button
          onClick={() => setActiveTab("documents")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === "documents"
              ? "bg-[#241B3A] text-white shadow-xs"
              : "text-[#6B6B73] hover:text-[#241B3A] hover:bg-[#F3F3F5]"
          }`}
        >
          <FolderLock className="h-4 w-4" />
          <span>Dokumen Persyaratan</span>
        </button>
      </div>

      {/* TAB CONTENT 1: FORM WORKFLOW */}
      {activeTab === "form" && (
        <CapitalApplicationWorkflow 
          users={users} 
          onSubmissionSuccess={() => {
            // Can switch or remain in step 5
          }}
        />
      )}

      {/* TAB CONTENT 2: RIWAYAT / TABLE */}
      {activeTab === "history" && (
        <div className="space-y-4">
          <div className="border-b border-[#E5E5E8] pb-3">
            <h2 className="text-xl font-bold text-[#241B3A]">Riwayat Pengajuan Modal</h2>
            <p className="text-xs text-[#6B6B73] mt-0.5">Daftar seluruh pengajuan modal usaha yang telah masuk dan status persetujuannya.</p>
          </div>
          <CapitalSubmissionsTable expenses={initialExpenses} />
        </div>
      )}

      {/* TAB CONTENT 3: STATUS TRACKING */}
      {activeTab === "status" && (
        <div className="space-y-6">
          <div className="border-b border-[#E5E5E8] pb-3">
            <h2 className="text-xl font-bold text-[#241B3A]">Status Pengajuan Terkini</h2>
            <p className="text-xs text-[#6B6B73] mt-0.5">Pantau tahapan verifikasi berkas pengajuan modal usaha Anda secara real-time.</p>
          </div>

          {latestSubmission ? (
            <div className="rounded-xl border border-[#E5E5E8] p-6 bg-white space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E5E8] pb-4">
                <div>
                  <span className="text-[11px] font-semibold text-[#8A8A91] uppercase tracking-wider">Status Pengajuan</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <h3 className="text-lg font-bold text-[#241B3A]">{latestSubmission.title}</h3>
                    <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                      latestSubmission.status === "PENDING"
                        ? "bg-[#241B3A] text-white"
                        : latestSubmission.status === "APPROVED_FINANCE" || latestSubmission.status === "APPROVED_FOUNDER"
                          ? "bg-emerald-700 text-white"
                          : "bg-rose-700 text-white"
                    }`}>
                      {latestSubmission.status === "PENDING" ? "Sedang Diproses" : latestSubmission.status === "REJECTED" ? "Ditolak" : "Disetujui"}
                    </span>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[11px] font-semibold text-[#8A8A91] uppercase tracking-wider">Nomor Pengajuan</span>
                  <p className="text-sm font-mono font-bold text-zinc-900">#PM-{latestSubmission.id.slice(-4).toUpperCase()}</p>
                </div>
              </div>

              {/* Status Meta */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-[11px] text-[#6B6B73]">Nominal Pengajuan</span>
                  <p className="text-base font-bold text-[#241B3A] mt-0.5">
                    Rp {Number(latestSubmission.amount).toLocaleString("id-ID")}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-[#6B6B73]">Tanggal Diajukan</span>
                  <p className="text-xs font-semibold text-zinc-900 mt-0.5">
                    {new Date(latestSubmission.date).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    })}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-[#6B6B73]">Pemohon</span>
                  <p className="text-xs font-semibold text-zinc-900 mt-0.5">{latestSubmission.submitter?.name}</p>
                </div>
                <div>
                  <span className="text-[11px] text-[#6B6B73]">Tahap Saat Ini</span>
                  <p className="text-xs font-bold text-[#241B3A] mt-0.5">
                    {latestSubmission.status === "PENDING" ? "Verifikasi Dokumen & Analisis" : "Selesai (Pencairan Disetujui)"}
                  </p>
                </div>
              </div>

              {/* 5-Step Corporate Timeline */}
              <div className="pt-4 border-t border-[#E5E5E8]">
                <span className="text-xs font-bold text-[#241B3A] block mb-4">Tahapan Pengajuan Modal:</span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { label: "Pengajuan Diterima", done: true },
                    { 
                      label: "Verifikasi Dokumen", 
                      done: latestSubmission.status !== "PENDING", 
                      current: latestSubmission.status === "PENDING" 
                    },
                    { 
                      label: "Analisis Kelayakan", 
                      done: latestSubmission.status === "APPROVED_FINANCE" || latestSubmission.status === "APPROVED_FOUNDER",
                      current: false 
                    },
                    { 
                      label: "Persetujuan Komite", 
                      done: latestSubmission.status === "APPROVED_FINANCE" || latestSubmission.status === "APPROVED_FOUNDER",
                      current: false
                    },
                    { 
                      label: "Pencairan Modal", 
                      done: latestSubmission.status === "APPROVED_FINANCE" || latestSubmission.status === "APPROVED_FOUNDER",
                      current: false
                    },
                  ].map((stage, idx) => (
                    <div 
                      key={idx}
                      className={`p-3 rounded-md border text-center transition-colors ${
                        stage.current
                          ? "border-[#241B3A] bg-[#241B3A] text-white"
                          : stage.done
                            ? "border-[#241B3A]/30 bg-[#F3F3F5] text-[#241B3A]"
                            : "border-[#E5E5E8] bg-white text-[#8A8A91]"
                      }`}
                    >
                      <div className="text-[10px] font-semibold opacity-70 mb-0.5">Tahap {idx + 1}</div>
                      <div className="text-xs font-bold leading-tight">{stage.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-lg border border-[#E5E5E8] bg-white text-center text-zinc-500">
              Belum ada pengajuan yang sedang diproses. Silakan ajukan melalui tab formulir.
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 4: DOKUMEN PERSYARATAN */}
      {activeTab === "documents" && (
        <div className="space-y-6">
          <div className="border-b border-[#E5E5E8] pb-3">
            <h2 className="text-xl font-bold text-[#241B3A]">Panduan Dokumen Persyaratan</h2>
            <p className="text-xs text-[#6B6B73] mt-0.5">Daftar kelengkapan berkas resmi yang disyaratkan untuk pengajuan permodalan usaha.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: "1. Identitas Diri (KTP Direktur / Pemilik Usaha)",
                desc: "Salinan KTP berwarna yang masih berlaku. Pastikan foto dan NIK terbaca dengan jelas.",
                badge: "Wajib"
              },
              {
                title: "2. NPWP Perusahaan / Wajib Pajak Badan",
                desc: "Nomor Pokok Wajib Pajak atas nama badan usaha atau perseorangan pemilik usaha.",
                badge: "Wajib"
              },
              {
                title: "3. Dokumen Legalitas (NIB / SIUP / Akta Pendirian)",
                desc: "Nomor Induk Berusaha (NIB) berbasis risiko dan SK Kemenkumham akta pendirian.",
                badge: "Wajib"
              },
              {
                title: "4. Rekening Koran Operasional (3 Bulan Terakhir)",
                desc: "Laporan mutasi rekening bank aktif yang digunakan untuk operasional transaksi bisnis.",
                badge: "Wajib"
              },
              {
                title: "5. Proposal Penggunaan Modal & Proyeksi Keuangan",
                desc: "Rencana alokasi anggaran, rencana pengembalian, serta proyeksi pertumbuhan bisnis.",
                badge: "Wajib"
              },
              {
                title: "6. Laporan Laba Rugi / Neraca Sederhana",
                desc: "Laporan keuangan tahunan atau laporan neraca keuangan usaha terakhir.",
                badge: "Pendukung"
              }
            ].map((doc, idx) => (
              <div key={idx} className="p-5 rounded-lg border border-[#E5E5E8] bg-white space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#241B3A]">{doc.title}</h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    doc.badge === "Wajib" ? "bg-[#241B3A] text-white" : "bg-[#F3F3F5] text-[#6B6B73] border border-[#E5E5E8]"
                  }`}>
                    {doc.badge}
                  </span>
                </div>
                <p className="text-xs text-[#6B6B73] leading-relaxed">{doc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
