
import { z } from 'zod';

export const voucherSchema = z.object({
  company_id: z.string().min(1, 'Company ID is required'),
  date_d: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  tran_code: z.number().min(1, 'Transaction code is required'),
  vr_no: z.number().min(1, 'Voucher number is required'),
  tran_id: z.number().optional(),
  pycd: z.string().min(1, 'Main account is required'),
  narration: z.string().optional(),
  check_no: z.string().optional(),
  check_date: z.string().optional(),
  export_in: z.string().optional(),
  fwo_control: z.string().optional(),
  check_ref: z.string().optional(),
  check_date_rmk: z.string().optional(),
  user_id: z.string().min(1, 'User ID is required'),
  rmk: z.string().max(150).optional(),
  rmk1: z.string().max(150).optional(),
  rmk2: z.string().max(150).optional(),
  rmk3: z.string().max(150).optional(),
  rmk4: z.string().max(150).optional(),
  rmk5: z.string().max(150).optional(),
});