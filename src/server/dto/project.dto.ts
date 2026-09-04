import { z } from "zod";
import { ProjectStatus } from "@prisma/client";

export const projectSchema = z.object({
  name: z.string().min(1, { message: "Nama proyek wajib diisi" }),
  clientId: z.string().min(1, { message: "Klien wajib dipilih" }),
  contractValue: z.coerce.number().min(0, "Nilai kontrak tidak boleh negatif"),
  estimatedCost: z.coerce.number().min(0, "Estimasi biaya tidak boleh negatif"),
  deadline: z.string().min(1, "Deadline wajib diisi"),
  status: z.nativeEnum(ProjectStatus).default("PLANNING"),
});

export type ProjectInput = z.infer<typeof projectSchema>;
