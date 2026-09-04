import { z } from "zod";
import { Role } from "@prisma/client";

export const userSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Format email tidak valid"),
  role: z.nativeEnum(Role).default("TEAM_MEMBER"),
  password: z.string().min(6, "Password minimal 6 karakter").optional().or(z.literal("")),
});

export type UserInput = z.infer<typeof userSchema>;
