import { z } from "zod";

export const incomeSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi"),
  amount: z.coerce.number().min(1, "Jumlah harus lebih besar dari 0"),
  date: z.string().min(1, "Tanggal wajib diisi"),
  projectId: z.string().optional().or(z.literal("")),
  source: z.string().optional(),
  description: z.string().optional(),
});

export type IncomeInput = z.infer<typeof incomeSchema>;
