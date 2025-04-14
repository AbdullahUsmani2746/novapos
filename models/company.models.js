import CompanyModel from '@/models/company.models';
import { validateCompany } from '@/validators/company.validator';

export async function createCompany(input) {
  const validation = validateCompany(input);
  if (!validation.success) {
    const errorMessages = validation.error.errors.map((e) => e.message).join(', ');
    throw new Error(`Validation failed: ${errorMessages}`);
  }

  return CompanyModel.create(validation.data);
}

export async function getCompanies() {
  return CompanyModel.getAll();
}

export async function getCompany(companyId) {
  if (!companyId) {
    throw new Error('Company ID is required.');
  }

  return CompanyModel.getById(companyId);
}

export async function updateCompany(companyId, input) {
  if (!companyId) {
    throw new Error('Company ID is required.');
  }

  const validation = validateCompany(input);
  if (!validation.success) {
    const errorMessages = validation.error.errors.map((e) => e.message).join(', ');
    throw new Error(`Validation failed: ${errorMessages}`);
  }

  return CompanyModel.update(companyId, validation.data);
}

export async function deleteCompany(companyId) {
  if (!companyId) {
    throw new Error('Company ID is required.');
  }

  return CompanyModel.delete(companyId);
}
