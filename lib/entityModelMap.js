// lib/entityModelMap.js
import prisma from '@/lib/prisma'; // Import Prisma client

const entityModelMap = {
  departments: {
    model: prisma.department,
    include: { company: true },
    fields: (body) => ({
      dept_name: body.dept_name,
      company_id: parseInt(body.company_id),
    }),
  },
  currencies: {
    model: prisma.currency,
    fields: (body) => ({
      currency: body.currency,
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
    include: { mainCategory: true },
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
  companies: {
    model: prisma.company,
    fields: (body) => ({
      company: body.company,
      addr1: body.addr1,
      addr2: body.addr2,
      city: body.city,
      phone: body.phone,
      fax: body.fax,
      email: body.email,
    }),
  },
  cost_centers: {
    model: prisma.costCenter,
    include: { company: true },
    fields: (body) => ({
      ccname: body.ccname,
      company_id: parseInt(body.company_id),
    }),
  },
  godowns: {
    model: prisma.godown,
    include: { company: true },
    fields: (body) => ({
      godown: body.godown,
      company_id: parseInt(body.company_id),
    }),
  },  
  financial_years: {
    model: prisma.financialYear,
    include: { company: true },
    fields: (body) => ({
      date_from: new Date(body.date_from),
      date_to: new Date(body.date_to),
      status: body.status,
      company_id: parseInt(body.company_id),
    }),
  },
  
  seasons: {
    model: prisma.season,
    include: { company: true },
    fields: (body) => ({
      date_from: new Date(body.date_from),
      date_to: new Date(body.date_to),
      status: body.status,
      company_id: parseInt(body.company_id),
    }),
  },
  
  purchase_product_categories: {
    model: prisma.PoPrdCat,
    include: { company: true },
    fields: (body) => ({
      category_name: body.category_name,
      company_id: parseInt(body.company_id),
    }),
  },
  
  delivery_modes: {
    model: prisma.deliveryMode,
    include: { company: true },
    fields: (body) => ({
      delivery_mode: body.delivery_mode,
      rate_kg: parseFloat(body.rate_kg),
      company_id: parseInt(body.company_id),
    }),
  },
  
  delivery_terms: {
    model: prisma.deliveryTerm,
    include: { company: true },
    fields: (body) => ({
      delivery_term: body.delivery_term,
      company_id: parseInt(body.company_id),
    }),
  },
  
  commission_terms: {
    model: prisma.commissionTerm,
    include: { company: true },
    fields: (body) => ({
      commission_term: body.commission_term,
      company_id: parseInt(body.company_id),
    }),
  },
  
  employees: {
    model: prisma.employee,
    include: { company: true },
    fields: (body) => ({
      first_name: body.first_name,
      middle_name: body.middle_name,
      surname: body.surname,
      dob: new Date(body.dob),
      hire_date: new Date(body.hire_date),
      job_title: body.job_title,
      gender: body.gender,
      phone_number: body.phone_number,
      npf_number: body.npf_number,
      email_address: body.email_address,
      village: body.village,
      employee_id: body.employee_id,
      bank_name: body.bank_name,
      account_name: body.account_name,
      account_number: body.account_number,
      pay_type: body.pay_type,
      rate_per_hour: parseFloat(body.rate_per_hour),
      pay_frequency: body.pay_frequency,
      employee_type: body.employee_type,
      cost_center: body.cost_center,
      allownces: body.allownces,
      deductions: body.deductions,
      company_id: parseInt(body.company_id),
      // manager_id: body.manager_id, // (commented)
      // client_id: body.client_id, // (commented)
      // payment_method: body.payment_method, // (commented)
      // allownce_eligible: body.allownce_eligible, // (commented)
      // profile_image: body.profile_image, // (commented)
    }),
  },
  
  // Add more entities here...
};

export default entityModelMap;
