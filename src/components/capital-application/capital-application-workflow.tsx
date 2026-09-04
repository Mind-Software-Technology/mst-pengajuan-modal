"use client";

import React, { useState, useTransition } from "react";
import { 
  FileText, 
  Check, 
  ChevronRight, 
  UploadCloud, 
  CheckCircle2, 
  Building2, 
  Clock, 
  User, 
  ArrowLeft, 
  ArrowRight, 
  DollarSign, 
  ShieldCheck, 
  AlertCircle,
  FileCheck,
  Download,
  Eye,
  RefreshCw,
  Plus
} from "lucide-react";
import { createExpense } from "@/server/actions/expense.action";

interface CapitalApplicationWorkflowProps {
  users: { id: string; name: string }[];
  onSubmissionSuccess?: () => void;
}

export function CapitalApplicationWorkflow({ users, onSubmissionSuccess }: CapitalApplicationWorkflowProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [agreed, setAgreed] = useState<boolean>(false);
  const [submittedData, setSubmittedData] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Informasi Pengajuan
    applicantName: users[0]?.name || "Budi Santoso",
    businessName: "PT Sentosa Solusi Mandiri",
    businessType: "Perseroan Terbatas (PT)",
    nominalAmount: "50000000",
    capitalPurpose: "Pengadaan perangkat server, lisensi infrastruktur cloud, dan operasional kerja untuk ekspansi kuartal berjalan.",
    tenorMonths: "12 Bulan",
    estimatedMonthlyRevenue: "35000000",

    // Step 2: Informasi Usaha
    establishedYear: "2021",
    industryCategory: "Teknologi Informasi & Perangkat Lunak",
    employeeCount: "6 - 20 Karyawan",
    monthlyTurnover: "40000000",
    businessAddress: "Gd. Mind Technology, Lantai 4, Jl. Sukarno Hatta No. 88, Bandung",

    // Step 3: Dokumen
    documents: {
      ktp: { name: "KTP_Direktur_Utama.pdf", uploaded: true, size: "1.2 MB" },
      npwp: { name: "NPWP_Perusahaan_PT_Sentosa.pdf", uploaded: true, size: "850 KB" },
      legalitas: { name: "NIB_Akta_Kemenkumham.pdf", uploaded: true, size: "2.4 MB" },
      rekeningKoran: { name: "Rekening_Koran_3Bulan_Mandiri.pdf", uploaded: true, size: "3.8 MB" },
      proposal: { name: "Proposal_Penggunaan_Modal_2026.pdf", uploaded: true, size: "4.1 MB" },
    }
  });

  const steps = [
    { num: 1, label: "Data Pengajuan" },
    { num: 2, label: "Data Usaha" },
    { num: 3, label: "Dokumen" },
    { num: 4, label: "Review" },
    { num: 5, label: "Selesai" },
  ];

  // Currency Formatter Helper
  const formatRupiah = (value: string | number) => {
    const numeric = String(value).replace(/[^0-9]/g, "");
    if (!numeric) return "";
    return "Rp " + Number(numeric).toLocaleString("id-ID");
  };

  const handleNominalChange = (field: string, rawVal: string) => {
    const cleanNum = rawVal.replace(/[^0-9]/g, "");
    setFormData((prev) => ({ ...prev, [field]: cleanNum }));
  };

  const handleDocumentToggle = (docKey: keyof typeof formData.documents) => {
    setFormData((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,
        [docKey]: {
          ...prev.documents[docKey],
          uploaded: !prev.documents[docKey].uploaded
        }
      }
    }));
  };

  const handleSubmit = async () => {
    if (!agreed) {
      alert("Harap centang persetujuan keabsahan data terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);
    const amountVal = Number(formData.nominalAmount) || 50000000;
    
    // Save to server database via createExpense
    const res = await createExpense({
      title: `Pengajuan Modal: ${formData.businessName} (${formData.capitalPurpose.slice(0, 45)}...)`,
      amount: amountVal,
      date: new Date().toISOString().split("T")[0],
      category: formData.industryCategory || "Modal Usaha",
      description: `Jenis Usaha: ${formData.businessType}\nTujuan: ${formData.capitalPurpose}\nJangka Waktu: ${formData.tenorMonths}\nOmzet: Rp ${Number(formData.monthlyTurnover).toLocaleString("id-ID")}\nAlamat: ${formData.businessAddress}`,
      submittedById: users[0]?.id || "",
      projectId: ""
    });

    setIsSubmitting(false);

    if (res.error) {
      alert("Gagal menyimpan pengajuan: " + res.error);
    } else {
      const appNumber = `PM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setSubmittedData({
        appNumber,
        date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
        nominal: amountVal,
        businessName: formData.businessName,
        applicantName: formData.applicantName
      });
      setCurrentStep(5);
      if (onSubmissionSuccess) onSubmissionSuccess();
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#241B3A] tracking-tight">
          Pengajuan Modal
        </h1>
        <p className="mt-1 text-sm text-[#6B6B73] max-w-2xl">
          Lengkapi formulir dan dokumen persyaratan untuk pengajuan modal usaha Anda melalui platform resmi MIND / MST Capital.
        </p>
      </div>

      {/* 2. Minimal Horizontal Step Progress Indicator */}
      <div className="bg-white rounded-lg border border-[#E5E5E8] p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          {steps.map((step, idx) => {
            const isCompleted = step.num < currentStep || currentStep === 5;
            const isCurrent = step.num === currentStep;

            return (
              <React.Fragment key={step.num}>
                <div className="flex items-center gap-3">
                  <div 
                    className={`h-7 w-7 rounded-md flex items-center justify-center text-xs font-bold transition-colors ${
                      isCurrent
                        ? "bg-[#241B3A] text-white ring-2 ring-[#241B3A]/20"
                        : isCompleted
                          ? "bg-[#241B3A] text-white"
                          : "bg-[#F3F3F5] text-[#8A8A91] border border-[#E5E5E8]"
                    }`}
                  >
                    {isCompleted && step.num !== 5 && !isCurrent ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      step.num
                    )}
                  </div>
                  <span 
                    className={`text-xs font-semibold hidden md:inline transition-colors ${
                      isCurrent
                        ? "text-[#241B3A] font-bold"
                        : isCompleted
                          ? "text-zinc-800"
                          : "text-[#8A8A91]"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {idx < steps.length - 1 && (
                  <div className={`flex-1 mx-2 sm:mx-4 h-0.5 transition-colors ${
                    step.num < currentStep ? "bg-[#241B3A]" : "bg-[#E5E5E8]"
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 3. Form Content Container */}
      <div className="bg-white rounded-xl border border-[#E5E5E8] p-6 sm:p-8 shadow-xs">
        {/* STEP 1: INFORMASI PENGAJUAN */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="border-b border-[#E5E5E8] pb-4">
              <h2 className="text-lg font-bold text-[#241B3A]">Informasi Pengajuan</h2>
              <p className="text-xs text-[#6B6B73] mt-0.5">Tentukan nominal kebutuhan modal dan rencana penggunaan dana usaha.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1.5">Nama Pengaju</label>
                <input
                  type="text"
                  value={formData.applicantName}
                  onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full rounded-md border border-[#D1D1D6] px-3.5 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-[#241B3A] focus:ring-1 focus:ring-[#241B3A] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1.5">Nama Usaha</label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="Contoh: PT Sentosa Solusi Mandiri"
                  className="w-full rounded-md border border-[#D1D1D6] px-3.5 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-[#241B3A] focus:ring-1 focus:ring-[#241B3A] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1.5">Jenis Usaha</label>
                <select
                  value={formData.businessType}
                  onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                  className="w-full rounded-md border border-[#D1D1D6] px-3.5 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-[#241B3A] focus:ring-1 focus:ring-[#241B3A] transition-colors bg-white"
                >
                  <option value="Perseroan Terbatas (PT)">Perseroan Terbatas (PT)</option>
                  <option value="Persekutuan Komanditer (CV)">Persekutuan Komanditer (CV)</option>
                  <option value="Perorangan / UMKM">Perorangan / UMKM</option>
                  <option value="Firma">Firma</option>
                  <option value="Koperasi">Koperasi</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1.5">Nominal Modal yang Diajukan</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formatRupiah(formData.nominalAmount)}
                    onChange={(e) => handleNominalChange("nominalAmount", e.target.value)}
                    placeholder="Rp 50.000.000"
                    className="w-full rounded-md border border-[#D1D1D6] px-3.5 py-2.5 text-sm font-semibold text-zinc-900 focus:outline-none focus:border-[#241B3A] focus:ring-1 focus:ring-[#241B3A] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1.5">Jangka Waktu (Tenor)</label>
                <select
                  value={formData.tenorMonths}
                  onChange={(e) => setFormData({ ...formData, tenorMonths: e.target.value })}
                  className="w-full rounded-md border border-[#D1D1D6] px-3.5 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-[#241B3A] focus:ring-1 focus:ring-[#241B3A] transition-colors bg-white"
                >
                  <option value="6 Bulan">6 Bulan</option>
                  <option value="12 Bulan">12 Bulan</option>
                  <option value="18 Bulan">18 Bulan</option>
                  <option value="24 Bulan">24 Bulan</option>
                  <option value="36 Bulan">36 Bulan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1.5">Estimasi Pendapatan Bulanan</label>
                <input
                  type="text"
                  value={formatRupiah(formData.estimatedMonthlyRevenue)}
                  onChange={(e) => handleNominalChange("estimatedMonthlyRevenue", e.target.value)}
                  placeholder="Rp 35.000.000"
                  className="w-full rounded-md border border-[#D1D1D6] px-3.5 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-[#241B3A] focus:ring-1 focus:ring-[#241B3A] transition-colors"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-zinc-800 mb-1.5">Tujuan Penggunaan Modal</label>
                <textarea
                  rows={4}
                  value={formData.capitalPurpose}
                  onChange={(e) => setFormData({ ...formData, capitalPurpose: e.target.value })}
                  placeholder="Jelaskan secara rinci tujuan pengajuan modal, alokasi kebutuhan inventaris/operasional, serta estimasi dampak terhadap pertumbuhan usaha..."
                  className="w-full rounded-md border border-[#D1D1D6] px-3.5 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-[#241B3A] focus:ring-1 focus:ring-[#241B3A] transition-colors"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-[#E5E5E8]">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="inline-flex items-center gap-2 rounded-md bg-[#241B3A] hover:bg-[#1B142C] px-5 py-2.5 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                <span>Lanjut ke Data Usaha</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: INFORMASI USAHA */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="border-b border-[#E5E5E8] pb-4">
              <h2 className="text-lg font-bold text-[#241B3A]">Informasi Usaha</h2>
              <p className="text-xs text-[#6B6B73] mt-0.5">Lengkapi profil legalitas dan operasional bisnis Anda.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1.5">Nama Usaha / Perusahaan</label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full rounded-md border border-[#D1D1D6] px-3.5 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-[#241B3A] focus:ring-1 focus:ring-[#241B3A] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1.5">Tahun Berdiri</label>
                <input
                  type="number"
                  value={formData.establishedYear}
                  onChange={(e) => setFormData({ ...formData, establishedYear: e.target.value })}
                  placeholder="2021"
                  className="w-full rounded-md border border-[#D1D1D6] px-3.5 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-[#241B3A] focus:ring-1 focus:ring-[#241B3A] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1.5">Bidang Usaha</label>
                <select
                  value={formData.industryCategory}
                  onChange={(e) => setFormData({ ...formData, industryCategory: e.target.value })}
                  className="w-full rounded-md border border-[#D1D1D6] px-3.5 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-[#241B3A] focus:ring-1 focus:ring-[#241B3A] transition-colors bg-white"
                >
                  <option value="Teknologi Informasi & Perangkat Lunak">Teknologi Informasi & Perangkat Lunak</option>
                  <option value="Perdagangan & Retail">Perdagangan & Retail</option>
                  <option value="Makanan & Minuman (F&B)">Makanan & Minuman (F&B)</option>
                  <option value="Jasa Profesional & Konsultan">Jasa Profesional & Konsultan</option>
                  <option value="Manufaktur & Produksi">Manufaktur & Produksi</option>
                  <option value="Kesehatan & Farmasi">Kesehatan & Farmasi</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1.5">Jumlah Karyawan</label>
                <select
                  value={formData.employeeCount}
                  onChange={(e) => setFormData({ ...formData, employeeCount: e.target.value })}
                  className="w-full rounded-md border border-[#D1D1D6] px-3.5 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-[#241B3A] focus:ring-1 focus:ring-[#241B3A] transition-colors bg-white"
                >
                  <option value="1 - 5 Karyawan">1 - 5 Karyawan</option>
                  <option value="6 - 20 Karyawan">6 - 20 Karyawan</option>
                  <option value="21 - 50 Karyawan">21 - 50 Karyawan</option>
                  <option value="> 50 Karyawan">&gt; 50 Karyawan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1.5">Omzet Rata-rata Bulanan</label>
                <input
                  type="text"
                  value={formatRupiah(formData.monthlyTurnover)}
                  onChange={(e) => handleNominalChange("monthlyTurnover", e.target.value)}
                  placeholder="Rp 40.000.000"
                  className="w-full rounded-md border border-[#D1D1D6] px-3.5 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-[#241B3A] focus:ring-1 focus:ring-[#241B3A] transition-colors"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-zinc-800 mb-1.5">Alamat Lengkap Usaha</label>
                <textarea
                  rows={3}
                  value={formData.businessAddress}
                  onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                  placeholder="Alamat kantor / tempat usaha..."
                  className="w-full rounded-md border border-[#D1D1D6] px-3.5 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-[#241B3A] focus:ring-1 focus:ring-[#241B3A] transition-colors"
                />
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-[#E5E5E8]">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="inline-flex items-center gap-2 rounded-md border border-[#D1D1D6] bg-white px-5 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-[#F3F3F5] transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Kembali</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="inline-flex items-center gap-2 rounded-md bg-[#241B3A] hover:bg-[#1B142C] px-5 py-2.5 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                <span>Lanjut ke Dokumen</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: UPLOAD DOKUMEN */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="border-b border-[#E5E5E8] pb-4">
              <h2 className="text-lg font-bold text-[#241B3A]">Dokumen Persyaratan</h2>
              <p className="text-xs text-[#6B6B73] mt-0.5">Unggah salinan dokumen resmi untuk keperluan verifikasi dan uji kelayakan.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: "ktp", title: "KTP Direktur / Pemilik Usaha", desc: "Format PDF atau JPG maks. 5MB" },
                { key: "npwp", title: "NPWP Perusahaan / Pribadi", desc: "Format PDF atau JPG maks. 5MB" },
                { key: "legalitas", title: "Dokumen Legalitas Usaha (NIB / SIUP / Akta)", desc: "Dokumen legalitas resmi pendirian usaha" },
                { key: "rekeningKoran", title: "Rekening Koran (3 Bulan Terakhir)", desc: "Mutasi rekening koran operasional usaha" },
                { key: "proposal", title: "Proposal Penggunaan Modal", desc: "Rincian alokasi biaya dan proyeksi bisnis" },
              ].map((doc) => {
                const docState = (formData.documents as any)[doc.key];
                const isUploaded = docState?.uploaded;

                return (
                  <div 
                    key={doc.key}
                    className="p-4 rounded-lg border border-[#E5E5E8] bg-[#F8F9FA] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-md bg-white border border-[#E5E5E8] flex items-center justify-center text-[#241B3A] flex-shrink-0 mt-0.5">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-zinc-900 truncate">{doc.title}</p>
                        <p className="text-[11px] text-[#6B6B73] mt-0.5 truncate">{doc.desc}</p>
                        {isUploaded && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded mt-1.5 border border-emerald-200">
                            <Check className="h-3 w-3" /> Terunggah: {docState.name} ({docState.size})
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDocumentToggle(doc.key as any)}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex-shrink-0 cursor-pointer ${
                        isUploaded 
                          ? "bg-white border border-[#D1D1D6] text-zinc-700 hover:bg-[#F3F3F5]" 
                          : "bg-[#241B3A] text-white hover:bg-[#1B142C]"
                      }`}
                    >
                      {isUploaded ? "Ubah File" : "Unggah"}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between pt-4 border-t border-[#E5E5E8]">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="inline-flex items-center gap-2 rounded-md border border-[#D1D1D6] bg-white px-5 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-[#F3F3F5] transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Kembali</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="inline-flex items-center gap-2 rounded-md bg-[#241B3A] hover:bg-[#1B142C] px-5 py-2.5 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                <span>Lanjut ke Review</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW & SUBMIT */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="border-b border-[#E5E5E8] pb-4">
              <h2 className="text-lg font-bold text-[#241B3A]">Review Pengajuan</h2>
              <p className="text-xs text-[#6B6B73] mt-0.5">Periksa kembali data pengajuan modal sebelum dikirimkan ke tim verifikasi finansial.</p>
            </div>

            {/* Summary Grid */}
            <div className="bg-[#F8F9FA] rounded-lg border border-[#E5E5E8] p-5 divide-y divide-[#E5E5E8]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                <div>
                  <span className="text-[11px] font-semibold text-[#8A8A91] uppercase tracking-wider">Nama Pengaju</span>
                  <p className="text-sm font-bold text-zinc-900 mt-0.5">{formData.applicantName}</p>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-[#8A8A91] uppercase tracking-wider">Nama Usaha & Jenis</span>
                  <p className="text-sm font-bold text-zinc-900 mt-0.5">{formData.businessName} ({formData.businessType})</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                <div>
                  <span className="text-[11px] font-semibold text-[#8A8A91] uppercase tracking-wider">Nominal Modal</span>
                  <p className="text-lg font-extrabold text-[#241B3A] mt-0.5">
                    {formatRupiah(formData.nominalAmount)}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-[#8A8A91] uppercase tracking-wider">Jangka Waktu</span>
                  <p className="text-sm font-bold text-zinc-900 mt-0.5">{formData.tenorMonths}</p>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-[#8A8A91] uppercase tracking-wider">Estimasi Pendapatan</span>
                  <p className="text-sm font-bold text-zinc-900 mt-0.5">{formatRupiah(formData.estimatedMonthlyRevenue)} / bln</p>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <div>
                  <span className="text-[11px] font-semibold text-[#8A8A91] uppercase tracking-wider">Tujuan Penggunaan Modal</span>
                  <p className="text-xs text-zinc-700 mt-1 leading-relaxed bg-white p-3 rounded-md border border-[#E5E5E8]">
                    {formData.capitalPurpose}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-[#8A8A91] uppercase tracking-wider">Dokumen Dilampirkan</span>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {Object.entries(formData.documents).map(([key, val]) => (
                      <span key={key} className="inline-flex items-center gap-1 text-[11px] font-medium bg-white px-2.5 py-1 rounded border border-[#E5E5E8] text-zinc-800">
                        <Check className="h-3 w-3 text-emerald-600" />
                        {val.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Agreement Checkbox */}
            <div className="p-4 rounded-md border border-[#E5E5E8] bg-white flex items-start gap-3">
              <input
                type="checkbox"
                id="agreement"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="h-4 w-4 mt-0.5 rounded border-[#D1D1D6] text-[#241B3A] focus:ring-[#241B3A] cursor-pointer"
              />
              <label htmlFor="agreement" className="text-xs text-zinc-700 leading-relaxed cursor-pointer select-none">
                <span className="font-bold text-zinc-900">Pernyataan Komitmen: </span>
                Saya menyatakan bahwa data dan dokumen yang saya berikan adalah benar, sah, dan dapat dipertanggungjawabkan untuk diproses dalam uji kelayakan modal usaha oleh MIND / MST Capital.
              </label>
            </div>

            <div className="flex justify-between pt-4 border-t border-[#E5E5E8]">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="inline-flex items-center gap-2 rounded-md border border-[#D1D1D6] bg-white px-5 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-[#F3F3F5] transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Kembali</span>
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="inline-flex items-center gap-2 rounded-md bg-[#241B3A] hover:bg-[#1B142C] px-6 py-2.5 text-xs font-semibold text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Memproses Pengajuan...</span>
                  </>
                ) : (
                  <>
                    <span>Ajukan Permohonan</span>
                    <CheckCircle2 className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: SELESAI & LIVE STATUS TRACKING */}
        {currentStep === 5 && submittedData && (
          <div className="space-y-6">
            <div className="p-6 rounded-lg bg-[#F8F9FA] border border-[#E5E5E8] text-center space-y-2">
              <div className="h-12 w-12 rounded-full bg-[#241B3A] text-white mx-auto flex items-center justify-center">
                <Check className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-[#241B3A]">Permohonan Berhasil Diajukan</h2>
              <p className="text-xs text-[#6B6B73] max-w-md mx-auto">
                Pengajuan modal Anda telah masuk ke sistem kami dan sedang dalam antrean verifikasi oleh komite pemegang dana.
              </p>
            </div>

            {/* Status Card */}
            <div className="rounded-lg border border-[#E5E5E8] p-6 bg-white space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E5E8] pb-4">
                <div>
                  <span className="text-[11px] font-semibold text-[#8A8A91] uppercase tracking-wider">Status Pengajuan</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <h3 className="text-lg font-bold text-[#241B3A]">{submittedData.businessName}</h3>
                    <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-[#241B3A] text-white">
                      Sedang Diproses
                    </span>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[11px] font-semibold text-[#8A8A91] uppercase tracking-wider">Nomor Pengajuan</span>
                  <p className="text-sm font-mono font-bold text-zinc-900">{submittedData.appNumber}</p>
                </div>
              </div>

              {/* Status Meta Data */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-[11px] text-[#6B6B73]">Nominal Pengajuan</span>
                  <p className="text-base font-bold text-[#241B3A] mt-0.5">
                    Rp {submittedData.nominal.toLocaleString("id-ID")}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-[#6B6B73]">Tanggal Pengajuan</span>
                  <p className="text-xs font-semibold text-zinc-900 mt-0.5">{submittedData.date}</p>
                </div>
                <div>
                  <span className="text-[11px] text-[#6B6B73]">Pemohon</span>
                  <p className="text-xs font-semibold text-zinc-900 mt-0.5">{submittedData.applicantName}</p>
                </div>
                <div>
                  <span className="text-[11px] text-[#6B6B73]">Tahap Saat Ini</span>
                  <p className="text-xs font-bold text-[#241B3A] mt-0.5">Verifikasi Dokumen</p>
                </div>
              </div>

              {/* 5-Step Corporate Timeline */}
              <div className="pt-4 border-t border-[#E5E5E8]">
                <span className="text-xs font-bold text-[#241B3A] block mb-4">Proses Tahapan Pengajuan Modal:</span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { label: "Pengajuan Diterima", active: true, done: true },
                    { label: "Verifikasi Dokumen", active: true, current: true },
                    { label: "Analisis Kelayakan", active: false },
                    { label: "Persetujuan", active: false },
                    { label: "Pencairan Dana", active: false },
                  ].map((stage, sIdx) => (
                    <div 
                      key={sIdx}
                      className={`p-3 rounded-md border text-center transition-colors ${
                        stage.current
                          ? "border-[#241B3A] bg-[#241B3A] text-white"
                          : stage.done
                            ? "border-[#241B3A]/30 bg-[#F3F3F5] text-[#241B3A]"
                            : "border-[#E5E5E8] bg-white text-[#8A8A91]"
                      }`}
                    >
                      <div className="text-[10px] font-semibold opacity-70 mb-0.5">Tahap {sIdx + 1}</div>
                      <div className="text-xs font-bold leading-tight">{stage.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#E5E5E8]">
                <button
                  type="button"
                  onClick={() => alert("Bukti tanda terima pengajuan diunduh")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-[#D1D1D6] bg-white text-xs font-semibold text-zinc-700 hover:bg-[#F3F3F5] cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Unduh Tanda Terima PDF</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep(1);
                      setAgreed(false);
                      setSubmittedData(null);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#241B3A] text-xs font-semibold text-white hover:bg-[#1B142C] cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Buat Pengajuan Baru</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
