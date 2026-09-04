"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { clientSchema, ClientInput } from "../dto/client.dto";

export async function getClients() {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return { data: clients, error: null };
  } catch (error) {
    return { data: null, error: "Gagal mengambil data klien" };
  }
}

export async function createClient(input: ClientInput) {
  try {
    const validatedData = clientSchema.parse(input);
    const newClient = await prisma.client.create({
      data: {
        name: validatedData.name,
        company: validatedData.company,
        email: validatedData.email || null,
        phone: validatedData.phone,
        address: validatedData.address,
        notes: validatedData.notes,
      },
    });
    
    revalidatePath("/clients");
    return { data: newClient, error: null };
  } catch (error) {
    return { data: null, error: "Gagal membuat data klien" };
  }
}

export async function updateClient(id: string, input: ClientInput) {
  try {
    const validatedData = clientSchema.parse(input);
    const updatedClient = await prisma.client.update({
      where: { id },
      data: {
        name: validatedData.name,
        company: validatedData.company,
        email: validatedData.email || null,
        phone: validatedData.phone,
        address: validatedData.address,
        notes: validatedData.notes,
      },
    });
    
    revalidatePath("/clients");
    return { data: updatedClient, error: null };
  } catch (error) {
    return { data: null, error: "Gagal memperbarui data klien" };
  }
}

export async function deleteClient(id: string) {
  try {
    await prisma.client.delete({
      where: { id },
    });
    revalidatePath("/clients");
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: "Gagal menghapus data klien" };
  }
}
