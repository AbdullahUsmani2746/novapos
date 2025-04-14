import prisma from '@/lib/prisma';

export async function createCostCenter(data) {
  return prisma.costCenter.create({ data });
}

export async function getAllCostCenters() {
  return prisma.costCenter.findMany();
}

export async function getCostCenterById(ccno) {
  if (!ccno) {
    throw new Error('Cost center number is required.');
  }

  return prisma.costCenter.findUnique({
    where: { ccno: Number(ccno) },
    include: { company: true },
  });
}

export async function getCostCentersByCompany(company_id) {
  if (!company_id) {
    throw new Error('Company ID is required.');
  }

  return prisma.costCenter.findMany({
    where: { company_id },
  });
}

export async function updateCostCenter(ccno, data) {
  if (!ccno) {
    throw new Error('Cost center number is required.');
  }

  return prisma.costCenter.update({
    where: { ccno: Number(ccno) },
    data,
  });
}

export async function deleteCostCenter(ccno) {
  if (!ccno) {
    throw new Error('Cost center number is required.');
  }

  return prisma.costCenter.delete({
    where: { ccno: Number(ccno) },
  });
}
