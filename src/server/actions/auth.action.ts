"use server";

import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase-admin";

const PIN_REGEX = /^\d{6}$/;

export async function findUserByPin(pin: string) {
  if (!PIN_REGEX.test(pin)) {
    return { data: null, error: "PIN harus 6 digit angka." };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { pin },
      select: { id: true, name: true, email: true, role: true, pin: true },
    });
    return { data: user, error: null };
  } catch (error) {
    return { data: null, error: "Gagal memeriksa PIN." };
  }
}

// Daftar nama & email dari web utama (Supabase) - dipakai saat pendaftaran PIN baru
export async function getDirectoryFromSupabase(search: string = "") {
  try {
    let query = supabaseAdmin.from("users").select("name, email").limit(20);
    if (search.trim()) {
      query = query.ilike("name", `%${search.trim()}%`);
    }
    const { data, error } = await query;
    if (error) {
      return { data: [], error: error.message };
    }
    return { data: data || [], error: null };
  } catch (error: any) {
    return { data: [], error: error.message || "Gagal mengambil daftar nama dari Supabase." };
  }
}

export async function registerPin(input: { pin: string; name: string; email: string }) {
  const pin = input.pin.trim();
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();

  if (!PIN_REGEX.test(pin)) {
    return { data: null, error: "PIN harus 6 digit angka." };
  }
  if (!name) {
    return { data: null, error: "Nama wajib diisi." };
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { data: null, error: "Email tidak valid." };
  }

  try {
    const pinTaken = await prisma.user.findUnique({ where: { pin } });
    if (pinTaken) {
      return { data: null, error: "PIN ini sudah terdaftar. Gunakan PIN lain." };
    }

    // Satu email = satu identitas. Kalau email sudah ada di database lokal, tinggal tempelkan PIN-nya.
    const user = await prisma.user.upsert({
      where: { email },
      update: { pin, name },
      create: { email, name, pin },
      select: { id: true, name: true, email: true, role: true, pin: true },
    });

    return { data: user, error: null };
  } catch (error: any) {
    return { data: null, error: error.message || "Gagal mendaftarkan PIN baru." };
  }
}
