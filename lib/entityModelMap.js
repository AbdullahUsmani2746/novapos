// lib/entityModelMap.js
import prisma from "@/lib/prisma"; // Import Prisma client

const entityModelMap = {
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
    defaultSort: { itcd: "asc" },
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

  // Cost Centers
  cost_centers: {
    model: prisma.costCenter,
    searchableFields: ["ccname"],
    defaultSort: { ccname: "asc" },
    include: { company: true },
    id: "ccno", // Use ccno as the identifier
    fields: (body) => ({
      ccname: body.ccname,
      cc_description: body.cc_description,
      company_id: parseInt(body.company_id),
    }),
  },

  // Departments
  departments: {
    model: prisma.department,
    searchableFields: ["dept_name"],
    defaultSort: { dept_name: "asc" },
    include: { company: true },
    fields: (body) => ({
      dept_name: body.dept_name,
      dept_description: body.dept_description,
      company_id: parseInt(body.company_id),
    }),
  },

  // Work Locations
  work_locations: {
    model: prisma.workLocation,
    searchableFields: ["location_name"],
    defaultSort: { location_name: "asc" },
    include: { company: true },
    fields: (body) => ({
      location_name: body.location_name,
      location_description: body.location_description,
      company_id: 1,
    }),
  },

  // Banks
  banks: {
    model: prisma.bank,
    include: { company: true },
    searchableFields: ["bank_name"],
    defaultSort: { bank_name: "asc" },
    fields: (body) => ({
      bank_name: body.bank_name,
      bank_description: body.bank_description,
      company_id: 1,
    }),
  },

  // Job Titles
  job_titles: {
    model: prisma.jobTitle,
    searchableFields: ["job_title"],
    defaultSort: { job_title: "asc" },
    include: { department: true, company: true },
    fields: (body) => ({
      job_title: body.job_title,
      job_title_description: body.job_title_description,
      department_id: parseInt(body.department_id),
      company_id: 1,
    }),
  },

  // Allowances
  allowances: {
    model: prisma.allowance,
    searchableFields: ["allowance"],
    defaultSort: { allowance: "asc" },
    include: { company: true },
    fields: (body) => ({
      allowance: body.allowance,
      allowance_description: body.allowance_description,
      rate: body.rate,
      company_id: 1,
    }),
  },

  // Deductions
  deductions: {
    model: prisma.deduction,
    searchableFields: ["deduction"],
    defaultSort: { deduction: "asc" },
    include: { company: true },
    fields: (body) => ({
      deduction: body.deduction,
      deduction_description: body.deduction_description,
      rate: body.rate,
      company_id: 1,
    }),
  },

  // Leaves
  leaves: {
    model: prisma.leave,
    searchableFields: ["leave"],
    defaultSort: { leave: "asc" },
    include: { company: true },
    fields: (body) => ({
      leave: body.leave,
      leave_description: body.leave_description,
      balance: body.balance ? Number(body.balance) : 0,
      maxCarryForward: body.maxCarryForward ? Number(body.maxCarryForward) : 15,
      company_id: 1,
    }),
  },

  // Managers
  managers: {
    model: prisma.manager,
    include: { department: true, company: true },
    searchableFields: ["manager"],
    defaultSort: { manager: "asc" },
    fields: (body) => ({
      manager: body.manager,
      department_id: parseInt(body.department_id),
      company_id: 1,
    }),
  },

  employees: {
    model: prisma.employee,
    include: {
      company: true,
      jobTitle: true,
      department: true,
      workLocation: true,
      manager: true,
      bank: true,
      costCenter: true,
      allowances: true,
      deductions: true,
    },
    searchableFields: ["firstName", "surname"],
    defaultSort: { firstName: "asc" },
    fields: (body) => ({
      firstName: body.firstName,
      middleName: body.middleName || null,
      surname: body.surname,
      dob: body.dob ? new Date(body.dob) : null,
      gender: body.gender,
      phoneNumber: body.phoneNumber,
      emailAddress: body.emailAddress,
      status: body.status || "ACTIVE",
      hireDate: body.hireDate ? new Date(body.hireDate) : null,
      jobTitleId: body.jobTitleId ? parseInt(body.jobTitleId) : null,
      departmentId: body.departmentId ? parseInt(body.departmentId) : null,
      workLocationId: body.workLocationId
        ? parseInt(body.workLocationId)
        : null,
      costCenterId: body.costCenterId ? parseInt(body.costCenterId) : null,

      managerId: body.managerId ? parseInt(body.managerId) : null,
      company_id: 1,
      paymentMethod: body.paymentMethod,
      bankId: body.bankId ? parseInt(body.bankId) : null,
      accountName: body.accountName || null,
      accountNumber: body.accountNumber || null,
      payType: body.payType,
      rate: body.rate ? parseFloat(body.rate) : null,
      payFrequency: body.payFrequency,
    }),
  },
  // Add more entities here...
};

export default entityModelMap;
