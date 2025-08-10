// config/entityConfig.js

const entityConfig = {
  companies: {
    title: "Companies",
    endpoint: "companies",
    buttonText: "Add Company",
    fields: [
      { name: "company", label: "Company", fieldType: "text", required: true },
      { name: "addr1", label: "Address 1", fieldType: "text", required: true },
      { name: "addr2", label: "Address 2", fieldType: "text" },
      { name: "city", label: "City", fieldType: "text", required: true },
      { name: "phone", label: "Phone", fieldType: "text", required: true },
      { name: "fax", label: "Fax", fieldType: "text" },
      { name: "email", label: "Email", fieldType: "email", required: true },
    ],
  },

  currencies: {
    title: "Currencies",
    endpoint: "currencies",
    buttonText: "Add Currency",
    fields: [
      {
        name: "currency",
        label: "Currency",
        fieldType: "text",
        required: true,
      },
    ],
  },

  departments: {
    title: "Departments",
    endpoint: "departments",
    buttonText: "Add Department",
    fields: [
      {
        name: "dept_name",
        label: "Dept Name",
        fieldType: "text",
        required: true,
      },
      {
        relation: "company",
        relationName: "company",
        name: "company_id",
        label: "Company",
        fieldType: "select",
        fetchFrom: "/api/setup/companies",
        optionLabelKey: "company",
        optionValueKey: "id",
        required: true,
      },
    ],
  },

  cost_centers: {
    title: "Cost Centers",
    endpoint: "cost_centers",
    buttonText: "Add Cost Center",
    fields: [
      { name: "ccname", label: "CC Name", fieldType: "text", required: true },
      {
        relation: "company",
        relationName: "company",
        name: "company_id",
        label: "Company",
        fieldType: "select",
        options: true,
        fetchFrom: "/api/setup/companies",
        optionLabelKey: "company",
        optionValueKey: "id",
        required: true,
      },
    ],
  },

  godowns: {
    title: "Godowns",
    endpoint: "godowns",
    buttonText: "Add Godown",
    fields: [
      { name: "godown", label: "Godown", fieldType: "text", required: true },
      {
        relation: "company",
        relationName: "company",
        name: "company_id",
        label: "Company",
        fieldType: "select",
        fetchFrom: "/api/setup/companies",
        optionLabelKey: "company",
        optionValueKey: "id",
        required: true,
      },
    ],
  },

  product_master_categories: {
    title: "Product Master Categories",
    endpoint: "product_master_categories",
    buttonText: "Add Product Master Category",
    fields: [
      {
        name: "pmc_name",
        label: "Product Master Category Name",
        fieldType: "text",
        required: true,
      },
    ],
  },

  product_groups: {
    title: "Product Groups",
    endpoint: "product_groups",
    buttonText: "Add Product Group",
    fields: [
      {
        name: "pg_name",
        label: "Product Group Name",
        fieldType: "text",
        required: true,
      },
      {
        relation: "ProductMasterCategories",
        relationName: "pmc_name",
        name: "pmc_id",
        label: "Product Master Category",
        fieldType: "select",
        fetchFrom: "/api/setup/product_master_categories",
        optionLabelKey: "pmc_name",
        optionValueKey: "id",
        required: true,
      },
    ],
  },

  items: {
    title: "Items",
    endpoint: "items",
    buttonText: "Add Item",
    fields: [
      {
        name: "item_name",
        label: "Item Name",
        fieldType: "text",
        required: true,
      },
      {
        relation: "item_category",
        relationName: "item_category",
        name: "ic_id",
        label: "Item Category",
        fieldType: "select",
        fetchFrom: "/api/setup/item_categories",
        optionLabelKey: "name",
        optionValueKey: "id",
        required: true,
      },
    ],
  },

  financial_years: {
    title: "Financial Years",
    endpoint: "financial_years",
    buttonText: "Add Financial Year",
    fields: [
      {
        relation: "company",
        relationName: "company",
        name: "company_id",
        label: "Company",
        fieldType: "select",
        fetchFrom: "/api/setup/companies",
        optionLabelKey: "company",
        optionValueKey: "id",
        required: true,
      },
      {
        name: "date_from",
        label: "Start Date",
        fieldType: "date",
        required: true,
      },
      { name: "date_to", label: "End Date", fieldType: "date", required: true },
      {
        name: "status",
        label: "Status",
        fieldType: "select",
        options: [
          { value: "open", label: "Open" },
          { value: "closed", label: "Closed" },
        ],
        required: true,
      },
    ],
  },

  seasons: {
    title: "Seasons",
    endpoint: "seasons",
    buttonText: "Add Season",
    fields: [
      {
        relation: "company",
        relationName: "company",
        name: "company_id",
        label: "Company",
        fieldType: "select",
        fetchFrom: "/api/setup/companies",
        optionLabelKey: "company",
        optionValueKey: "id",
        required: true,
      },
      {
        name: "date_from",
        label: "Start Date",
        fieldType: "date",
        required: true,
      },
      { name: "date_to", label: "End Date", fieldType: "date", required: true },
      {
        name: "status",
        label: "Status",
        fieldType: "select",
        options: [
          { value: "open", label: "Open" },
          { value: "closed", label: "Closed" },
        ],
        required: true,
      },
    ],
  },

  purchase_product_categories: {
    title: "PO Product Categories",
    endpoint: "purchase_product_categories",
    buttonText: "Add PO Product Category",
    fields: [
      {
        relation: "company",
        relationName: "company",
        name: "company_id",
        label: "Company",
        fieldType: "select",
        fetchFrom: "/api/setup/companies",
        optionLabelKey: "company",
        optionValueKey: "id",
        required: true,
      },
      {
        name: "category_name",
        label: "Category Name",
        fieldType: "text",
        required: true,
      },
    ],
  },

  delivery_modes: {
    title: "Delivery Modes",
    endpoint: "delivery_modes",
    buttonText: "Add Delivery Mode",
    fields: [
      {
        relation: "company",
        relationName: "company",
        name: "company_id",
        label: "Company",
        fieldType: "select",
        fetchFrom: "/api/setup/companies",
        optionLabelKey: "company",
        optionValueKey: "id",
        required: true,
      },
      {
        name: "delivery_mode",
        label: "Delivery Mode",
        fieldType: "text",
        required: true,
      },
      { name: "rate_kg", label: "Rate", fieldType: "number", required: true },
    ],
  },

  delivery_terms: {
    title: "Delivery Terms",
    endpoint: "delivery_terms",
    buttonText: "Add Delivery Term",
    fields: [
      {
        relation: "company",
        relationName: "company",
        name: "company_id",
        label: "Company",
        fieldType: "select",
        fetchFrom: "/api/setup/companies",
        optionLabelKey: "company",
        optionValueKey: "id",
        required: true,
      },
      {
        name: "delivery_term",
        label: "Delivery Term",
        fieldType: "text",
        required: true,
      },
    ],
  },

  commission_terms: {
    title: "Commission Terms",
    endpoint: "commission_terms",
    buttonText: "Add Commission Term",
    fields: [
      {
        relation: "company",
        relationName: "company",
        name: "company_id",
        label: "Company",
        fieldType: "select",
        fetchFrom: "/api/setup/companies",
        optionLabelKey: "company",
        optionValueKey: "id",
        required: true,
      },
      {
        name: "commission_term",
        label: "Commission Term",
        fieldType: "text",
        required: true,
      },
    ],
  },

  employees: {
    title: "Employees",
    endpoint: "employees",
    buttonText: "Add Employee",
    fields: [
      {
        relation: "company",
        relationName: "company",
        name: "company_id",
        label: "Company",
        fieldType: "select",
        fetchFrom: "/api/setup/companies",
        optionLabelKey: "company",
        optionValueKey: "id",
        required: true,
      },
      {
        name: "first_name",
        label: "First Name",
        fieldType: "text",
        required: true,
      },
      { name: "middle_name", label: "Middle Name", fieldType: "text" },
      { name: "surname", label: "Surname", fieldType: "text", required: true },
      {
        name: "dob",
        label: "Date of Birth",
        fieldType: "date",
        required: true,
      },
      {
        name: "hire_date",
        label: "Hire Date",
        fieldType: "date",
        required: true,
      },
      {
        name: "gender",
        label: "Gender",
        fieldType: "select",
        options: [
          { value: "MALE", label: "Male" },
          { value: "FEMALE", label: "Female" },
          { value: "OTHER", label: "Other" },
        ],
        required: true,
      },
      {
        name: "phone_number",
        label: "Phone Number",
        fieldType: "text",
        required: true,
      },
    ],
  },

  job_titles: {
    title: "Job Titles",
    endpoint: "job_titles",
    buttonText: "Add Job Title",
    fields: [
      {
        name: "job_title",
        label: "Job Title",
        fieldType: "text",
        required: true,
      },
      {
        name: "description",
        label: "Description",
        fieldType: "textarea",
        required: false,
      },
      {
        relation: "company",
        relationName: "company",
        name: "company_id",
        label: "Company",
        fieldType: "select",
        options: true,
        fetchFrom: "/api/setup/companies",
        optionLabelKey: "company",
        optionValueKey: "id",
        required: true,
      },
    ],
  },

  work_locations: {
    title: "Work Locations",
    endpoint: "work_locations",
    buttonText: "Add Work Location",
    fields: [
      {
        name: "work_location",
        label: "Work Location",
        fieldType: "text",
        required: true,
      },
      {
        name: "work_location_description",
        label: "Description",
        fieldType: "textarea",
        required: false,
      },
      {
        relation: "company",
        relationName: "company",
        name: "company_id",
        label: "Company",
        fieldType: "select",
        options: true,
        fetchFrom: "/api/setup/companies",
        optionLabelKey: "company",
        optionValueKey: "id",
        required: true,
      },
    ],
  },
  allowances: {
    title: "Allowances",
    endpoint: "allowances",
    buttonText: "Add Allowance",
    fields: [
      {
        name: "allownce",
        label: "Allowance Name",
        fieldType: "text",
        required: true,
      },
      {
        name: "allownce_description",
        label: "Description",
        fieldType: "textarea",
        required: true,
      },
      {
        name: "rate",
        label: "Rate",
        fieldType: "text",
        required: true,
      },
      {
        relation: "company",
        relationName: "company",
        name: "company_id",
        label: "Company",
        fieldType: "select",
        options: true,
        fetchFrom: "/api/setup/companies",
        optionLabelKey: "company",
        optionValueKey: "id",
        required: true,
      },
    ],
  },

  deductions: {
    title: "Deductions",
    endpoint: "deductions",
    buttonText: "Add Deduction",
    fields: [
      { name: "title", label: "Title", fieldType: "text", required: true },
      { name: "email", label: "Email", fieldType: "email", required: true },
      {
        name: "phoneNumber",
        label: "Phone Number",
        fieldType: "text",
        required: true,
      },
      {
        name: "address",
        label: "Address",
        fieldType: "textarea",
        required: true,
      },

      {
        name: "holdingAccount",
        label: "Holding Account",
        fieldType: "select",
        options: [
          { label: "Bank", value: "Bank" },
          { label: "Wages", value: "Wages" },
          { label: "Savings", value: "Savings" },
          { label: "Loans", value: "Loans" },
        ],
        required: true,
      },

      {
        name: "calculation",
        label: "Calculation Type",
        fieldType: "select",
        options: [
          { label: "Amount Per Pay Period", value: "Amount_Per_Pay_Period" },
          { label: "Percentage", value: "Percentage" },
          { label: "Time Rate", value: "Time_x_Rate" },
          { label: "Earning Rate", value: "Earning_Rate" },
        ],
        required: true,
      },

      {
        name: "payslipYTD",
        label: "Include in Payslip YTD",
        fieldType: "checkbox",
      },

      {
        name: "statutory",
        label: "Is Statutory",
        fieldType: "checkbox",
      },

      {
        name: "bank",
        label: "Bank Type",
        fieldType: "select",
        options: [
          { label: "ANZ", value: "ANZ" },
          { label: "BSP", value: "BSP" },
          { label: "NBS", value: "NBS" },
          { label: "SCB", value: "SCB" },
        ],
        required: true,
      },

      {
        name: "accountName",
        label: "Account Name",
        fieldType: "text",
        required: true,
      },
      {
        name: "accountNumber",
        label: "Account Number",
        fieldType: "text",
        required: true,
      },
      { name: "country", label: "Country", fieldType: "text", required: true },
      {
        name: "employerNumberAtFund",
        label: "Employer # at Fund",
        fieldType: "text",
        required: true,
      },

      {
        relation: "company",
        relationName: "company",
        name: "company_id",
        label: "Company",
        fieldType: "select",
        options: true,
        fetchFrom: "/api/setup/companies",
        optionLabelKey: "company",
        optionValueKey: "id",
        required: true,
      },
    ],
  },

  periodic_attendances: {
    title: "Periodic Attendance",
    endpoint: "periodic_attendances",
    buttonText: "Add Periodic Attendance",
    fields: [
      {
        name: "clientId",
        label: "Client ID",
        fieldType: "number",
        required: true,
      },
      {
        relation: "employee",
        relationName: "employee",
        name: "employeeId",
        label: "Employee",
        fieldType: "select",
        options: true,
        fetchFrom: "/api/setup/employees",
        optionLabelKey: "full_name", // adjust if needed
        optionValueKey: "id",
        required: true,
      },
      {
        name: "dateRange",
        label: "Date Range",
        fieldType: "text", // optionally use date-range picker in frontend
        required: true,
      },
      {
        name: "totalBreakHours",
        label: "Total Break Hours",
        fieldType: "text",
        defaultValue: "0",
        required: true,
      },
      {
        name: "totalWorkingHours",
        label: "Total Working Hours",
        fieldType: "text",
        required: true,
      },
      {
        name: "totalDoubleTimeHours",
        label: "Total Double Time Hours",
        fieldType: "text",
        defaultValue: "0",
        required: true,
      },
      {
        name: "numberOfDays",
        label: "Number of Days",
        fieldType: "text",
        defaultValue: "0",
        required: true,
      },
      {
        name: "status",
        label: "Status",
        fieldType: "select",
        options: [
          { label: "Pending", value: "Pending" },
          { label: "Approved", value: "Approved" },
          { label: "Rejected", value: "Rejected" },
        ],
        required: true,
      },
      {
        name: "rejectionReason",
        label: "Rejection Reason",
        fieldType: "textarea",
        showIf: {
          field: "status",
          equals: "Rejected",
        },
      },
    ],
  },
};

export default entityConfig;
