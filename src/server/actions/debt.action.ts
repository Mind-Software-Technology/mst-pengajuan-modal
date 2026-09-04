"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { debtSchema, DebtInput } from "../dto/debt.dto";

export async function getDebts() {
  try {
    const debts = await prisma.debt.findMany({
      include: { project: true, submitter: true },
      orderBy: { date: 'desc' }
    });
    return { data: debts, error: null };
  } catch (error) {
    return { data: null, error: "Gagal mengambil data utang" };
  }
}

export async function createDebt(input: DebtInput) {
  try {
    const validatedData = debtSchema.parse(input);
    await prisma.debt.create({
      data: {
        title: validatedData.title,
        amount: validatedData.amount,
        date: new Date(validatedData.date),
        projectId: validatedData.projectId || null,
        description: validatedData.description,
        receiptUrl: validatedData.receiptUrl,
        status: "PENDING", 
        submitterId: validatedData.submitterId,
      },
    });
    
    revalidatePath("/debts");
    revalidatePath("/dashboard");
    return { success: true, error: null };
  } catch (error: any) {
    console.error("Create Debt Error:", error);
    return { success: false, error: error.message || "Gagal mencatat pengajuan utang" };
  }
}

export async function updateDebt(id: string, input: DebtInput) {
  try {
    const validatedData = debtSchema.parse(input);
    await prisma.debt.update({
      where: { id },
      data: {
        title: validatedData.title,
        amount: validatedData.amount,
        date: new Date(validatedData.date),
        projectId: validatedData.projectId || null,
        description: validatedData.description,
        receiptUrl: validatedData.receiptUrl,
        submitterId: validatedData.submitterId,
      },
    });
    
    revalidatePath("/debts");
    revalidatePath("/dashboard");
    return { success: true, error: null };
  } catch (error: any) {
    console.error("Update Debt Error:", error);
    return { success: false, error: error.message || "Gagal memperbarui pengajuan utang" };
  }
}

export async function updateDebtStatus(id: string, status: "PENDING" | "APPROVED" | "REJECTED" | "PAID") {
  try {
    await prisma.debt.update({
      where: { id },
      data: { status },
    });
    
    revalidatePath("/debts");
    revalidatePath("/dashboard");
    return { success: true, error: null };
  } catch (error: any) {
    console.error("Update Debt Status Error:", error);
    return { success: false, error: "Gagal memperbarui status utang" };
  }
}

export async function deleteDebt(id: string) {
  try {
    await prisma.debt.delete({
      where: { id },
    });
    revalidatePath("/debts");
    revalidatePath("/dashboard");
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: "Gagal menghapus pengajuan utang" };
  }
}
