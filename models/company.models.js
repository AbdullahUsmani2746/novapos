import prisma from '@/lib/prisma';

module.exports = {
  async create(data) {
    return await prisma.company.create({ data });
  },

  async getAll() {
    return await prisma.company.findMany();
  },

  async getById(company_id) {
    return await prisma.company.findUnique({
      where: { company_id },
      include: { costCenters: true }
    });
  },

  async update(company_id, data) {
    return await prisma.company.update({
      where: { company_id },
      data
    });
  },

  async delete(company_id) {
    return await prisma.company.delete({
      where: { company_id }
    });
  }
};