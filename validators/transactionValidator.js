import z from 'zod';
export const transactionSchema = z.object({
  acno: z.string().min(1, 'Account is required').max(4),
  ccno: z.number().int().optional(),
  itcd: z.number().int().optional(),
  godown: z.number().int().optional(),
  narration1: z.string().max(150).optional(),
  narration2: z.string().max(150).optional(),
  narration3: z.string().max(150).optional(),
  narration4: z.string().max(150).optional(),
  narration5: z.string().max(150).optional(),
  chno: z.string().max(150).optional(),
  check_date: z
    .string()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: 'Invalid check date format',
    })
    .optional(),
  party_name: z.string().max(150).optional(),
  damt: z.number().min(0).default(0),
  camt: z.number().min(0).default(0),
  qty: z.number().min(0).default(0),
  rate: z.number().min(0).default(1),
  wht_rate: z.number().min(0).default(0),
  st_rate: z.number().min(0).default(0),
  invoice_no: z.string().max(150).optional(),
  sub_tran_id: z.number().int().min(1).max(2),
  currency: z.string().min(1, 'Currency is required').max(50),
  fc_amount: z.number().min(0).default(0),
});

// import { z } from 'zod';

// export const transactionSchema = z.object({
//   acno: z.string().min(1, 'Account is required'),
//   acname: z.string().optional(),
//   ccno: z.number().optional(),
//   coname: z.string().optional(),
//   invoice_no: z.string().optional(),
//   wht_rate: z.number().min(0, 'WHT rate cannot be negative').optional(),
//   check_no: z.string().optional(),
//   narration1: z.string().max(150).optional(),
//   narration2: z.string().max(150).optional(),
//   narration3: z.string().max(150).optional(),
//   narration4: z.string().max(150).optional(),
//   narration5: z.string().max(150).optional(),
//   currency: z.string().min(1, 'Currency is required'),
//   rate: z.number().min(0, 'Rate cannot be negative'),
//   fc_amount: z.number().min(0, 'Foreign currency amount cannot be negative'),
//   damt: z.number().min(0, 'Debit amount cannot be negative'),
//   camt: z.number().min(0, 'Credit amount cannot be negative'),
// });