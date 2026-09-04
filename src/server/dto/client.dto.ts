import { z } from "zod";

export const clientSchema = z.object({
  name: z.string().min(1, { message: "Nama klien wajib diisi" }),
  company: z.string().optional(),
  email: z.string().email({ message: "Format email tidak valid" }).optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export type ClientInput = z.infer<typeof clientSchema>;
