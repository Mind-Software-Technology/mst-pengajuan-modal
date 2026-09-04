"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { expenseSchema, ExpenseInput } from "../dto/expense.dto";

export async function getExpenses() {
  try {
    const expenses = await prisma.expense.findMany({
      include: { project: true, submitter: true },
      orderBy: { date: 'desc' }
    });
    return { data: expenses, error: null };
  } catch (error) {
    return { data: null, error: "Gagal mengambil data pengeluaran" };
  }
}

export async function getDashboardStats() {
  const [totalExpenseResult, approvedExpenseResult, pendingExpenseResult, recentExpenses, countApproved, countPending, countRejected] = await Promise.all([
    prisma.expense.aggregate({ _sum: { amount: true } }),
    prisma.expense.aggregate({
      _sum: { amount: true },
      where: { status: { in: ["APPROVED_FINANCE", "APPROVED_FOUNDER"] } }
    }),
    prisma.expense.aggregate({
      _sum: { amount: true },
      where: { status: "PENDING" }
    }),
    prisma.expense.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { submitter: true }
    }),
    prisma.expense.count({ where: { status: { in: ["APPROVED_FINANCE", "APPROVED_FOUNDER"] } } }),
    prisma.expense.count({ where: { status: "PENDING" } }),
    prisma.expense.count({ where: { status: "REJECTED" } }),
  ]);

  return {
    totalPengajuan: Number(totalExpenseResult._sum.amount || 0),
    totalDisetujui: Number(approvedExpenseResult._sum.amount || 0),
    totalPending: Number(pendingExpenseResult._sum.amount || 0),
    countApproved,
    countPending,
    countRejected,
    countTotal: countApproved + countPending + countRejected,
    recentExpenses: recentExpenses.map((e) => ({
      id: e.id,
      title: e.title,
      amount: Number(e.amount),
      status: e.status,
      submitter: { name: e.submitter.name },
    })),
  };
}

export async function createExpense(input: ExpenseInput) {
  try {
    const validatedData = expenseSchema.parse(input);
    const newExpense = await prisma.expense.create({
      data: {
        title: validatedData.title,
        amount: validatedData.amount,
        date: new Date(validatedData.date),
        projectId: validatedData.projectId || null,
        category: validatedData.category,
        description: validatedData.description,
        status: "PENDING", // Default approval status
        submitterId: validatedData.submittedById,
      },
    });
    
    revalidatePath("/expenses");
    revalidatePath("/dashboard");
    return { success: true, error: null };
  } catch (error: any) {
    console.error("Create Expense Error:", error);
    return { data: null, error: error.message || "Gagal mencatat pengeluaran" };
  }
}

export async function updateExpense(id: string, input: ExpenseInput) {
  try {
    const validatedData = expenseSchema.parse(input);
    const updatedExpense = await prisma.expense.update({
      where: { id },
      data: {
        title: validatedData.title,
        amount: validatedData.amount,
        date: new Date(validatedData.date),
        projectId: validatedData.projectId || null,
        category: validatedData.category,
        description: validatedData.description,
        submitterId: validatedData.submittedById,
      },
    });
    
    revalidatePath("/expenses");
    revalidatePath("/dashboard");
    return { success: true, error: null };
  } catch (error: any) {
    console.error("Update Expense Error:", error);
    return { data: null, error: error.message || "Gagal memperbarui pengeluaran" };
  }
}

export async function deleteExpense(id: string) {
  try {
    await prisma.expense.delete({
      where: { id },
    });
    revalidatePath("/expenses");
    revalidatePath("/dashboard");
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: "Gagal menghapus pengeluaran" };
  }
}

export async function updateExpenseStatus(id: string, status: "PENDING" | "APPROVED_FINANCE" | "APPROVED_FOUNDER" | "REJECTED") {
  try {
    await prisma.expense.update({
      where: { id },
      data: { status },
    });
    revalidatePath("/expenses");
    revalidatePath("/dashboard");
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: "Gagal memperbarui status pengajuan" };
  }
}
