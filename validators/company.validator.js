import { z } from 'zod';

export const companySchema = z.object({
  company_id: z
    .string()
    .length(2, 'Company ID must be exactly 2 characters'),
  company: z.string().max(100).optional(),
  addr1: z.string().max(100).optional(),
  addr2: z.string().max(100).optional(),
  city: z.string().max(50).optional(),
  phone: z.string().max(50).optional(),
  fax: z.string().max(50).optional(),
  email: z.string().email().max(50).optional(),
});

export function validateCompany(data) {
  return companySchema.safeParse(data);
}

