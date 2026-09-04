import { z } from "zod";
import { InvoiceStatus } from "@prisma/client";

export const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1, "Nomor Invoice wajib diisi"),
  projectId: z.string().min(1, "Proyek wajib dipilih"),
  amount: z.coerce.number().min(0, "Jumlah tidak boleh negatif"),
  dueDate: z.string().min(1, "Tenggat waktu (Due Date) wajib diisi"),
  status: z.nativeEnum(InvoiceStatus).default("PENDING"),
  pdfUrl: z.string().optional(),
});

export type InvoiceInput = z.infer<typeof invoiceSchema>;
