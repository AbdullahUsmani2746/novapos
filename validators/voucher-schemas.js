import { z } from 'zod';

const baseSchema = z.object({
  dateD: z.date(),
  vr_no: z.number().min(1),
  userId: z.string().min(1),
  company_id: z.string().min(1)
});

export const PaymentVoucherSchema = baseSchema.extend({
  tran_code: z.literal(2),
  pycd: z.string().min(1),
  check_no: z.string().optional(),
  check_date: z.date().optional(),
  transactions: z.array(
    z.object({
      acno: z.string().min(1),
      camt: z.number().min(0),
      damt: z.number().min(0).optional()
    })
  )
});

export const ReceiptVoucherSchema = baseSchema.extend({
  tran_code: z.literal(1),
  pycd: z.string().min(1),
  check_no: z.string().optional(),
  check_date: z.date().optional(),
  transactions: z.array(
    z.object({
      acno: z.string().min(1),
      damt: z.number().min(0),
      camt: z.number().min(0).optional()
    })
  )
});

export const JournalVoucherSchema = baseSchema.extend({
  tran_code: z.literal(3),
  rmk1: z.string().optional(),
  transactions: z.array(
    z.object({
      acno: z.string().min(1),
      damt: z.number().min(0).optional(),
      camt: z.number().min(0).optional()
    })
  )
});