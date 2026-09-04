import { z } from "zod";

export const debtSchema = z.object({
  title: z.string().min(1, "Judul utang wajib diisi"),
  amount: z.coerce.number().min(1, "Jumlah harus lebih dari 0"),
  date: z.string().min(1, "Tanggal wajib diisi"),
  projectId: z.string().optional().nullable(),
  description: z.string().optional(),
  receiptUrl: z.string().optional(),
  submitterId: z.string().min(1, "Pengaju wajib diisi"),
});

export type DebtInput = z.infer<typeof debtSchema>;
