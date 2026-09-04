"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Delete,
  Search,
  UserPlus,
  Loader2,
} from "lucide-react";
import { findUserByPin, getDirectoryFromSupabase, registerPin } from "@/server/actions/auth.action";

type DirectoryEntry = { name: string; email: string };

export default function PinLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"pin" | "register">("pin");
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Register step state
  const [search, setSearch] = useState("");
  const [directory, setDirectory] = useState<DirectoryEntry[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Cari nama & email dari web utama (Supabase) saat user mengetik
  useEffect(() => {
    if (step !== "register") return;
    const timer = setTimeout(async () => {
      setIsSearching(true);
      const res = await getDirectoryFromSupabase(search);
      setDirectory(res.data as DirectoryEntry[]);
      setIsSearching(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [search, step]);

  const fullPin = pin.join("");

  const handleDigitChange = (index: number, val: string) => {
    const char = val.slice(-1);
    if (char && !/^\d$/.test(char)) return;

    const newPin = [...pin];
    newPin[index] = char;
    setPin(newPin);
    setErrorMsg("");

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (char && index === 5) {
      verifyPin(newPin.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleKeypadPress = (digit: string) => {
    const emptyIndex = pin.findIndex((d) => d === "");
    if (emptyIndex !== -1) {
      handleDigitChange(emptyIndex, digit);
    }
  };

  const handleKeypadBackspace = () => {
    for (let i = 5; i >= 0; i--) {
      if (pin[i] !== "") {
        const newPin = [...pin];
        newPin[i] = "";
        setPin(newPin);
        inputRefs.current[i]?.focus();
        break;
      }
    }
  };

  const saveSessionAndGo = (user: { id: string; name: string; email: string; role: string; pin: string | null }) => {
    localStorage.setItem(
      "mst_team_session",
      JSON.stringify({
        userId: user.id,
        pin: user.pin,
        personName: user.name,
        email: user.email,
        role: user.role,
      })
    );
    router.push("/dashboard");
  };

  const verifyPin = async (value: string) => {
    if (value.length !== 6) {
      setErrorMsg("Harap masukkan 6 digit PIN secara lengkap.");
      return;
    }

    setIsChecking(true);
    setErrorMsg("");
    const res = await findUserByPin(value);
    setIsChecking(false);

    if (res.error) {
      setErrorMsg(res.error);
      return;
    }

    if (res.data) {
      setSuccessMsg(`PIN Valid! Masuk sebagai ${res.data.name}...`);
      setTimeout(() => saveSessionAndGo(res.data as any), 400);
    } else {
      // PIN belum terdaftar -> lanjut ke tahap pilih/buat nama
      setStep("register");
    }
  };

  const handleSelectDirectoryEntry = (entry: DirectoryEntry) => {
    setName(entry.name);
    setEmail(entry.email);
    setShowManualForm(true);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsRegistering(true);
    const res = await registerPin({ pin: fullPin, name, email });
    setIsRegistering(false);

    if (res.error) {
      setErrorMsg(res.error);
      return;
    }

    setSuccessMsg(`PIN berhasil didaftarkan untuk ${res.data!.name}!`);
    setTimeout(() => saveSessionAndGo(res.data as any), 400);
  };

  const resetToPinStep = () => {
    setStep("pin");
    setPin(["", "", "", "", "", ""]);
    setSearch("");
    setDirectory([]);
    setShowManualForm(false);
    setName("");
    setEmail("");
    setErrorMsg("");
    setSuccessMsg("");
    setTimeout(() => inputRefs.current[0]?.focus(), 0);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8F9FA] p-4 font-sans text-zinc-900">
      <div className="w-full max-w-md rounded-2xl border border-[#E5E5E8] bg-white p-7 sm:p-8 shadow-sm space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-xl bg-[#241B3A] text-white mx-auto flex items-center justify-center shadow-xs">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold text-[#241B3A] tracking-tight">
            {step === "pin" ? "Masuk dengan PIN 6 Digit" : "PIN Baru Terdeteksi"}
          </h1>
          <p className="text-xs text-[#6B6B73] max-w-xs mx-auto">
            {step === "pin"
              ? "Tanpa akun & password. Cukup masukkan PIN 6 digit Anda untuk mengakses platform pengajuan modal."
              : "Ini pertama kalinya PIN ini dipakai. Pilih nama Anda, atau daftarkan nama & email baru."}
          </p>
        </div>

        {step === "pin" ? (
          <>
            {/* 6 Digit PIN Boxes */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-800">Masukkan 6 Digit PIN:</span>
                <button
                  type="button"
                  onClick={() => {
                    setPin(["", "", "", "", "", ""]);
                    setErrorMsg("");
                    inputRefs.current[0]?.focus();
                  }}
                  className="text-[11px] text-[#6B6B73] hover:text-[#241B3A] cursor-pointer"
                >
                  Bersihkan
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                {pin.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { inputRefs.current[idx] = el; }}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    disabled={isChecking}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className={`h-12 w-11 sm:h-13 sm:w-12 rounded-lg border text-center text-lg font-bold transition-all focus:outline-none ${
                      digit
                        ? "border-[#241B3A] bg-[#241B3A]/5 text-[#241B3A]"
                        : "border-[#D1D1D6] bg-white focus:border-[#241B3A] focus:ring-1 focus:ring-[#241B3A]"
                    }`}
                  />
                ))}
              </div>

              {isChecking && (
                <p className="text-[11px] text-[#6B6B73] font-medium text-center flex items-center justify-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Memeriksa PIN...
                </p>
              )}

              {errorMsg && (
                <p className="text-[11px] text-rose-600 font-medium text-center">{errorMsg}</p>
              )}

              {successMsg && (
                <p className="text-[11px] text-emerald-700 font-bold text-center flex items-center justify-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{successMsg}</span>
                </p>
              )}
            </div>

            {/* Interactive Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto pt-1">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeypadPress(num)}
                  className="h-11 rounded-lg border border-[#E5E5E8] bg-white hover:bg-[#F3F3F5] text-base font-bold text-zinc-900 transition-colors cursor-pointer shadow-xs active:scale-95"
                >
                  {num}
                </button>
              ))}
              <div />
              <button
                type="button"
                onClick={() => handleKeypadPress("0")}
                className="h-11 rounded-lg border border-[#E5E5E8] bg-white hover:bg-[#F3F3F5] text-base font-bold text-zinc-900 transition-colors cursor-pointer shadow-xs active:scale-95"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleKeypadBackspace}
                className="h-11 rounded-lg border border-[#E5E5E8] bg-[#F8F9FA] hover:bg-zinc-200 flex items-center justify-center text-zinc-700 cursor-pointer active:scale-95"
              >
                <Delete className="h-4 w-4" />
              </button>
            </div>

            {/* Action Button */}
            <button
              type="button"
              onClick={() => verifyPin(fullPin)}
              disabled={isChecking}
              className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-[#241B3A] hover:bg-[#1B142C] py-2.5 text-xs font-semibold text-white transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              <span>Masuk ke Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="pt-2 border-t border-[#E5E5E8] text-center text-[11px] text-[#6B6B73]">
              <span>💡 </span>
              <span className="font-semibold text-zinc-800">Tips: </span>
              Jika PIN belum pernah dipakai, Anda akan diminta memilih atau membuat nama baru.
            </div>
          </>
        ) : (
          <>
            {/* Register Step */}
            <button
              type="button"
              onClick={resetToPinStep}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#6B6B73] hover:text-[#241B3A] cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Ganti PIN
            </button>

            <div className="rounded-md bg-[#F3F3F5] border border-[#E5E5E8] px-3 py-2 text-center text-xs font-bold tracking-[0.3em] text-[#241B3A]">
              {fullPin}
            </div>

            {!showManualForm ? (
              <div className="space-y-3">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1 text-xs">Cari nama Anda</label>
                  <div className="relative">
                    <Search className="h-3.5 w-3.5 text-[#8A8A91] absolute left-3 top-2.5" />
                    <input
                      type="text"
                      autoFocus
                      placeholder="Ketik nama Anda..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full rounded-md border border-[#D1D1D6] py-2 pl-9 pr-3 text-xs text-zinc-900 focus:outline-none focus:border-[#241B3A] focus:ring-1 focus:ring-[#241B3A]"
                    />
                  </div>
                </div>

                <div className="max-h-48 overflow-y-auto rounded-md border border-[#E5E5E8] divide-y divide-[#E5E5E8]">
                  {isSearching ? (
                    <p className="text-[11px] text-zinc-400 text-center py-4">Mencari...</p>
                  ) : directory.length === 0 ? (
                    <p className="text-[11px] text-zinc-400 text-center py-4">
                      {search ? "Nama tidak ditemukan." : "Ketik untuk mencari nama Anda."}
                    </p>
                  ) : (
                    directory.map((entry) => (
                      <button
                        key={entry.email}
                        type="button"
                        onClick={() => handleSelectDirectoryEntry(entry)}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-[#F8F9FA] cursor-pointer"
                      >
                        <p className="font-semibold text-zinc-900">{entry.name}</p>
                        <p className="text-[10px] text-[#6B6B73]">{entry.email}</p>
                      </button>
                    ))
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setShowManualForm(true)}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-md border border-dashed border-[#D1D1D6] py-2 text-xs font-semibold text-[#241B3A] hover:bg-[#F8F9FA] cursor-pointer"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Nama saya tidak ada / buat nama baru
                </button>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="Contoh: Budi Santoso"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-md border border-[#D1D1D6] px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-[#241B3A]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-md border border-[#D1D1D6] px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-[#241B3A]"
                  />
                </div>

                {errorMsg && (
                  <p className="text-[11px] text-rose-600 font-medium text-center">{errorMsg}</p>
                )}
                {successMsg && (
                  <p className="text-[11px] text-emerald-700 font-bold text-center flex items-center justify-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{successMsg}</span>
                  </p>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowManualForm(false)}
                    className="px-3 py-2 rounded-md border border-[#D1D1D6] text-xs font-semibold text-zinc-700 hover:bg-[#F3F3F5] cursor-pointer"
                  >
                    Kembali
                  </button>
                  <button
                    type="submit"
                    disabled={isRegistering}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-[#241B3A] hover:bg-[#1B142C] py-2 text-xs font-semibold text-white transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isRegistering ? "Mendaftarkan..." : "Daftarkan PIN Ini"}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
