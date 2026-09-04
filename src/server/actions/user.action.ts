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

export async function updateUser(id: string, input: UserInput) {
  try {
    const validatedData = userSchema.parse(input);
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: validatedData.name,
        email: validatedData.email,
        role: validatedData.role,
      },
    });
    
    revalidatePath("/settings");
    revalidatePath("/expenses");
    return { data: updatedUser, error: null };
  } catch (error) {
    return { data: null, error: "Gagal memperbarui pengguna" };
  }
}

export async function deleteUser(id: string) {
  try {
    await prisma.user.delete({
      where: { id },
    });
    revalidatePath("/settings");
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: "Gagal menghapus data pengguna" };
  }
}
