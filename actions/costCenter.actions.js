import CostCenterModel from '@/models/costCenter.models';
import { validateCostCenter } from '@/validators/costCenter.validator';

module.exports = {
  createCostCenter: async (input) => {
    const validation = validateCostCenter(input);
    if (!validation.success) {
      throw new Error(validation.error.errors.map(e => e.message).join(', '));
    }
    return await CostCenterModel.create(validation.data);
  },

  getCostCenters: async () => {
    return await CostCenterModel.getAll();
  },

  getCostCenter: async (ccno) => {
    return await CostCenterModel.getById(ccno);
  },

  getCompanyCostCenters: async (company_id) => {
    return await CostCenterModel.getByCompany(company_id);
  },

  updateCostCenter: async (ccno, input) => {
    const validation = validateCostCenter(input);
    if (!validation.success) {
      throw new Error(validation.error.errors.map(e => e.message).join(', '));
    }
    return await CostCenterModel.update(ccno, validation.data);
  },

  deleteCostCenter: async (ccno) => {
    return await CostCenterModel.delete(ccno);
  }
};