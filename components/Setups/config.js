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

  departments: {
    title: "Departments",
    endpoint: "departments",
    buttonText: "Add Department",
    fields: [
      { name: "dept_name", label: "Dept Name", fieldType: "text", required: true },
      {
        relation: "company",
        relationName: "company",
        name: "company_id",
        label: "Company",
        fieldType: "select",
        fetchFrom: "/api/setup/companies",
        optionLabelKey: "company",
        optionValueKey: "id",
        required: true
      }
    ]
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
        options:true,
        fetchFrom: "/api/setup/companies",
        optionLabelKey: "company",
        optionValueKey: "id",
        required: true
      }
    ]
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
        required: true
      }
    ]
  },

  product_master_categories: {
    title: "Product Master Categories",
    endpoint: "product_master_categories",
    buttonText: "Add Product Master Category",
    fields: [
      { name: "pmc_name", label: "Product Master Category Name", fieldType: "text", required: true }
    ]
  },

  product_groups: {
    title: "Product Groups",
    endpoint: "product_groups",
    buttonText: "Add Product Group",
    fields: [
      { name: "pg_name", label: "Product Group Name", fieldType: "text", required: true },
      {
        relation: "ProductMasterCategories",
        relationName: "pmc_name",
        name: "pmc_id",
        label: "Product Master Category",
        fieldType: "select",
        fetchFrom: "/api/setup/product_master_categories",
        optionLabelKey: "pmc_name",
        optionValueKey: "id",
        required: true
      }
    ]
  },

  items: {
    title: "Items",
    endpoint: "items",
    buttonText: "Add Item",
    fields: [
      { name: "item_name", label: "Item Name", fieldType: "text", required: true },
      {
        relation: "item_category",
        relationName: "item_category",
        name: "ic_id",
        label: "Item Category",
        fieldType: "select",
        fetchFrom: "/api/setup/item_categories",
        optionLabelKey: "name",
        optionValueKey: "id",
        required: true
      }
    ]
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
        required: true
      },
      { name: "date_from", label: "Start Date", fieldType: "date", required: true },
      { name: "date_to", label: "End Date", fieldType: "date", required: true },
      {
        name: "status",
        label: "Status",
        fieldType: "select",
        options: [
          { value: "open", label: "Open" },
          { value: "closed", label: "Closed" }
        ],
        required: true
      }
    ]
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
        required: true
      },
      { name: "date_from", label: "Start Date", fieldType: "date", required: true },
      { name: "date_to", label: "End Date", fieldType: "date", required: true },
      {
        name: "status",
        label: "Status",
        fieldType: "select",
        options: [
          { value: "open", label: "Open" },
          { value: "closed", label: "Closed" }
        ],
        required: true
      }
    ]
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
        required: true
      },
      { name: "category_name", label: "Category Name", fieldType: "text", required: true }
    ]
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
        required: true
      },
      { name: "delivery_mode", label: "Delivery Mode", fieldType: "text", required: true },
      { name: "rate_kg", label: "Rate", fieldType: "number", required: true }
    ]
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
        required: true
      },
      { name: "delivery_term", label: "Delivery Term", fieldType: "text", required: true }
    ]
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
        required: true
      },
      { name: "commission_term", label: "Commission Term", fieldType: "text", required: true }
    ]
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
        required: true
      },
      { name: "first_name", label: "First Name", fieldType: "text", required: true },
      { name: "middle_name", label: "Middle Name", fieldType: "text" },
      { name: "surname", label: "Surname", fieldType: "text", required: true },
      { name: "dob", label: "Date of Birth", fieldType: "date", required: true },
      { name: "hire_date", label: "Hire Date", fieldType: "date", required: true },
      {
        name: "gender",
        label: "Gender",
        fieldType: "select",
        options: [
          { value: "MALE", label: "Male" },
          { value: "FEMALE", label: "Female" },
          { value: "OTHER", label: "Other" }
        ],
        required: true
      },
      { name: "phone_number", label: "Phone Number", fieldType: "text", required: true }
    ]
  }
};

export default entityConfig;
