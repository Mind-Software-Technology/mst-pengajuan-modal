"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { userSchema, UserInput } from "../dto/user.dto";
// Jika menggunakan better-auth, idealnya kita menggunakan admin plugin,
// Tapi untuk sekarang kita simpan langsung ke database

export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return { data: users, error: null };
  } catch (error) {
    return { data: null, error: "Gagal mengambil data pengguna" };
  }
}

export async function createUser(input: UserInput) {
  try {
    const validatedData = userSchema.parse(input);
    const newUser = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        role: validatedData.role,
        // password bisa dihash jika perlu, tapi karena ini dummy create user, kita lewati hash kompleks untuk sekarang
      },
    });
    
    revalidatePath("/settings");
    revalidatePath("/expenses");
    return { data: newUser, error: null };
  } catch (error) {
    return { data: null, error: "Gagal membuat pengguna baru (Email mungkin sudah terdaftar)" };
  }
}

export async function updateUser(id: string, input: UserInput, requesterId: string) {
  try {
    if (!requesterId) {
      return { data: null, error: "Sesi tidak valid. Silakan login ulang." };
    }

    // Hanya diri sendiri yang bisa mengedit profil
    if (requesterId !== id) {
      return { data: null, error: "Akses ditolak. Anda hanya dapat mengedit profil diri sendiri." };
    }

    const validatedData = userSchema.parse(input);

    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    });

    if (!existingUser) {
      return { data: null, error: "Pengguna tidak ditemukan." };
    }

    // Hanya SUPER_ADMIN yang berhak mengubah role; user biasa tidak dapat menaikkan hak aksesnya sendiri
    const allowedRole = existingUser.role === "SUPER_ADMIN" ? validatedData.role : existingUser.role;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: validatedData.name,
        email: validatedData.email,
        role: allowedRole,
        ...(validatedData.password ? { password: validatedData.password } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
    
    revalidatePath("/settings");
    revalidatePath("/expenses");
    revalidatePath("/dashboard");
    return { data: updatedUser, error: null };
  } catch (error: any) {
    return { data: null, error: error?.message || "Gagal memperbarui pengguna" };
  }
}

export async function deleteUser(id: string, requesterId: string) {
  try {
    if (!requesterId) {
      return { success: false, error: "Sesi tidak valid. Silakan login ulang." };
    }

    const requester = await prisma.user.findUnique({
      where: { id: requesterId },
      select: { role: true },
    });

    if (!requester || requester.role !== "SUPER_ADMIN") {
      return { success: false, error: "Akses ditolak. Hanya Super Admin yang dapat menghapus data pengguna." };
    }

    await prisma.user.delete({
      where: { id },
    });
    revalidatePath("/settings");
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: "Gagal menghapus data pengguna" };
  }
}
