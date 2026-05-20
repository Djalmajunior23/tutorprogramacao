import { z } from 'zod';

export const CreateStudentSchema = z.object({
  name: z.string().min(2, "Nome muito curto"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  classId: z.string().optional(),
  registration: z.string().optional(),
  phone: z.string().optional(),
  active: z.boolean().default(true),
});

export const UpdateStudentSchema = z.object({
  name: z.string().min(2, "Nome muito curto").optional(),
  email: z.string().email("Email inválido").optional(),
  classId: z.string().optional(),
  registration: z.string().optional(),
  phone: z.string().optional(),
  active: z.boolean().optional(),
});

export const ResetPasswordSchema = z.object({
  password: z.string().min(6, "Nova senha deve ter no mínimo 6 caracteres"),
});
