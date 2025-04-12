import prisma from '@/lib/prisma';

module.exports = {
  async create(data) {
    return await prisma.costCenter.create({ data });
  },

  async getAll() {
    return await prisma.costCenter.findMany();
  },

  async getById(ccno) {
    return await prisma.costCenter.findUnique({
      where: { ccno: Number(ccno) },
      include: { company: true }
    });
  },

  async getByCompany(company_id) {
    return await prisma.costCenter.findMany({
      where: { company_id }
    });
  },

  async update(ccno, data) {
    return await prisma.costCenter.update({
      where: { ccno: Number(ccno) },
      data
    });
  },

  async delete(ccno) {
    return await prisma.costCenter.delete({
      where: { ccno: Number(ccno) }
    });
  }
};