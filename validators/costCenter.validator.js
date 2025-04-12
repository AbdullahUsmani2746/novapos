import { z } from "zod";

const costCenterSchema = z.object({
  ccno: z.number().int(),
  company_id: z.string().length(2, "Company ID must be exactly 2 characters"),
  ccname: z.string().max(50).optional()
});

function validateCostCenter(data) {
  return costCenterSchema.safeParse(data);
}

module.exports = {
  costCenterSchema,
  validateCostCenter
};