import { z } from 'zod'

export const companySchema = z.object({
  company_code: z.coerce.number().int().min(1, 'Codigo obligatorio'),
  name: z.string().min(1, 'Nombre obligatorio'),
  cif: z.string().min(1, 'CIF obligatorio'),
  fiscal_address: z.string().optional(),
  physical_address: z.string().optional(),
  email: z.string().email('Email invalido').optional().or(z.literal('')),
})

export const updateCompanySchema = companySchema.omit({ company_code: true }).partial()
