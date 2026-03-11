import { z } from 'zod'

export const createUserSchema = z.object({
  email: z.string().email('Email invalido'),
  password: z.string().min(6, 'Minimo 6 caracteres'),
  first_name: z.string().min(1, 'Nombre obligatorio'),
  last_name: z.string().min(1, 'Apellido obligatorio'),
  user_type: z.enum(['admin', 'user']),
  company_access: z.array(z.number()).default([]),
})

export const updateUserSchema = z.object({
  first_name: z.string().min(1, 'Nombre obligatorio'),
  last_name: z.string().min(1, 'Apellido obligatorio'),
  user_type: z.enum(['admin', 'user']),
  company_access: z.array(z.number()).default([]),
})
