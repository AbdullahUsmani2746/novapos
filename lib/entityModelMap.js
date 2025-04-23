// lib/entityModelMap.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const entityModelMap = {
  departments: {
    model: prisma.department,
    include: { company: true },
    fields: (body) => ({
      dept_name: body.dept_name,
      company_id: parseInt(body.company_id),
    }),
  },
  product_master_categories: {
    model: prisma.productMasterCategory,
    fields: (body) => ({
      name: body.pmc_name,
    }),
  },
  product_groups: {
    model: prisma.productGroup,
    include: { ProductMasterCategories: true },
    fields: (body) => ({
      name: body.pg_name,
      productMasterCategoryId: parseInt(body.pmc_id),
    }),
  },
  product_categories: {
    model: prisma.productCategory,
    include: { ProductGroups: true },
    fields: (body) => ({
      name: body.pg_name,
      productGroupId: parseInt(body.pg_id),
    }),
  },
  main_categories: {
    model: prisma.mainCategory,
    include: { productCategories: true },
    fields: (body) => ({
      name: body.mc_name,
      productCategoryId: parseInt(body.pc_id),
    }),
  },
  item_categories: {
    model: prisma.itemCategory,
    include: { mainCategories: true },
    fields: (body) => ({
      name: body.ic_name,
      mainCategoryId: parseInt(body.mc_id),
    }),
  },
  items: {
    model: prisma.item,
    include: { itemCategories: true },
    fields: (body) => ({
      name: body.item,
      itemCategoryId: parseInt(body.ic_id),
    }),
  },
  // Add more entities here...
};

export default entityModelMap;
