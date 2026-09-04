"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { invoiceSchema, InvoiceInput } from "../dto/invoice.dto";

export async function getInvoices() {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        project: {
          include: { client: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return { data: invoices, error: null };
  } catch (error) {
    return { data: null, error: "Gagal mengambil data invoice" };
  }
}

export async function createInvoice(input: InvoiceInput) {
  try {
    const validatedData = invoiceSchema.parse(input);
    const newInvoice = await prisma.invoice.create({
      data: {
        invoiceNumber: validatedData.invoiceNumber,
        projectId: validatedData.projectId,
        amount: validatedData.amount,
        dueDate: new Date(validatedData.dueDate),
        status: validatedData.status,
        pdfUrl: validatedData.pdfUrl,
      },
    });
    
    revalidatePath("/invoices");
    return { success: true, error: null };
  } catch (error) {
    return { data: null, error: "Gagal membuat invoice (Mungkin nomor invoice sudah ada)" };
  }
}

export async function updateInvoice(id: string, input: InvoiceInput) {
  try {
    const validatedData = invoiceSchema.parse(input);
    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: {
        invoiceNumber: validatedData.invoiceNumber,
        projectId: validatedData.projectId,
        amount: validatedData.amount,
        dueDate: new Date(validatedData.dueDate),
        status: validatedData.status,
        pdfUrl: validatedData.pdfUrl,
      },
    });
    
    revalidatePath("/invoices");
    return { success: true, error: null };
  } catch (error) {
    return { data: null, error: "Gagal memperbarui invoice" };
  }
}

export async function deleteInvoice(id: string) {
  try {
    await prisma.invoice.delete({
      where: { id },
    });
    revalidatePath("/invoices");
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: "Gagal menghapus invoice" };
  }
}
