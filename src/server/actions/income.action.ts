"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { incomeSchema, IncomeInput } from "../dto/income.dto";

export async function getIncomes() {
  try {
    const incomes = await prisma.income.findMany({
      include: { project: true },
      orderBy: { date: 'desc' }
    });
    return { data: incomes, error: null };
  } catch (error) {
    return { data: null, error: "Gagal mengambil data pemasukan" };
  }
}

export async function createIncome(input: IncomeInput) {
  try {
    const validatedData = incomeSchema.parse(input);
    const newIncome = await prisma.income.create({
      data: {
        title: validatedData.title,
        amount: validatedData.amount,
        date: new Date(validatedData.date),
        projectId: validatedData.projectId || null,
        category: "Pemasukan",
        source: validatedData.source || "Internal",
        description: validatedData.description,
      },
    });
    
    revalidatePath("/incomes");
    revalidatePath("/dashboard");
    return { success: true, error: null };
  } catch (error) {
    return { data: null, error: "Gagal mencatat pemasukan" };
  }
}

export async function updateIncome(id: string, input: IncomeInput) {
  try {
    const validatedData = incomeSchema.parse(input);
    const updatedIncome = await prisma.income.update({
      where: { id },
      data: {
        title: validatedData.title,
        amount: validatedData.amount,
        date: new Date(validatedData.date),
        projectId: validatedData.projectId || null,
        category: "Pemasukan",
        source: validatedData.source || "Internal",
        description: validatedData.description,
      },
    });
    
    revalidatePath("/incomes");
    revalidatePath("/dashboard");
    return { success: true, error: null };
  } catch (error) {
    return { data: null, error: "Gagal memperbarui pemasukan" };
  }
}

export async function deleteIncome(id: string) {
  try {
    await prisma.income.delete({
      where: { id },
    });
    revalidatePath("/incomes");
    revalidatePath("/dashboard");
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: "Gagal menghapus pemasukan" };
  }
}
