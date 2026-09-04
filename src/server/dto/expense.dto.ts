import { z } from "zod";

export const expenseSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi"),
  amount: z.coerce.number().min(1, "Jumlah harus lebih besar dari 0"),
  date: z.string().min(1, "Tanggal wajib diisi"),
  projectId: z.string().optional().or(z.literal("")),
  category: z.string().min(1, "Kategori wajib diisi"),
  description: z.string().optional(),
  submittedById: z.string().min(1, "Pengaju wajib dipilih"),
});

export type ExpenseInput = z.infer<typeof expenseSchema>;
