import CompanyModel from '@/models/company.models';
import { validateCompany } from '@/validators/company.validator';

module.exports = {
  createCompany: async (input) => {
    const validation = validateCompany(input);
    if (!validation.success) {
      throw new Error(validation.error.errors.map(e => e.message).join(', '));
    }
    return await CompanyModel.create(validation.data);
  },

  getCompanies: async () => {
    return await CompanyModel.getAll();
  },

  getCompany: async (company_id) => {
    return await CompanyModel.getById(company_id);
  },

  updateCompany: async (company_id, input) => {
    const validation = validateCompany(input);
    if (!validation.success) {
      throw new Error(validation.error.errors.map(e => e.message).join(', '));
    }
    return await CompanyModel.update(company_id, validation.data);
  },

  deleteCompany: async (company_id) => {
    return await CompanyModel.delete(company_id);
  }
};