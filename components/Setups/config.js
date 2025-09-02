// config/entityConfig.js

const entityConfig = {
  companies: {
    title: "Companies",
    endpoint: "/api/setup/companies",
    buttonText: "Add Company",
    fields: [
      {
        name: "company",
        label: "Company",
        fieldType: "text",
        required: true,
        sortable: true,
      },
      {
        name: "addr1",
        label: "Address 1",
        fieldType: "text",
        required: true,
        sortable: true,
      },
      { name: "addr2", label: "Address 2", fieldType: "text", sortable: true },
      {
        name: "city",
        label: "City",
        fieldType: "text",
        required: true,
        sortable: true,
      },
      {
        name: "phone",
        label: "Phone",
        fieldType: "text",
        required: true,
        sortable: true,
      },
      { name: "fax", label: "Fax", fieldType: "text", sortable: true },
      {
        name: "email",
        label: "Email",
        fieldType: "email",
        required: true,
        sortable: true,
      },
    ],
  },

  currencies: {
    title: "Currencies",
    endpoint: "/api/setup/currencies",
    buttonText: "Add Currency",
    fields: [
      {
        name: "currency",
        label: "Currency",
        fieldType: "text",
        required: true,
        sortable: true,
      },
    ],
  },

  godowns: {
    title: "Godowns",
    endpoint: "/api/setup/godowns",
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
        sortable: false,
      },
    ],
  },

  product_master_categories: {
    title: "Product Master Categories",
    endpoint: "/api/setup/product_master_categories",
    buttonText: "Add Product Master Category",
    fields: [
      {
        name: "pmc_name",
        label: "Product Master Category Name",
        fieldType: "text",
        required: true,
        sortable: true,
      },
    ],
  },

  product_groups: {
    title: "Product Groups",
    endpoint: "/api/setup/product_groups",
    buttonText: "Add Product Group",
    fields: [
      {
        name: "pg_name",
        label: "Product Group Name",
        fieldType: "text",
        required: true,
        sortable: true,
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
    endpoint: "/api/setup/items",
    buttonText: "Add Item",
    fields: [
      {
        name: "item_name",
        label: "Item Name",
        fieldType: "text",
        required: true,
        sortable: true,
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

  subtrates: {
    title: "Subtrates",
    endpoint: "/api/setup/subtrates",
    buttonText: "Add Subtrate",
    fields: [
      {
        name: "subtrate",
        label: "Subrate Name",
        fieldType: "text",
        required: true,
      },
      {
        name: "description",
        label: "Description",
        fieldType: "text",
        required: true,
      },
    ],
  },

  financial_years: {
    title: "Financial Years",
    endpoint: "/api/setup/financial_years",
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
        sortable: true,
      },
      {
        name: "date_to",
        label: "End Date",
        fieldType: "date",
        required: true,
        sortable: true,
      },
      {
        name: "status",
        label: "Status",
        fieldType: "select",
        options: [
          { value: "open", label: "Open" },
          { value: "closed", label: "Closed" },
        ],
        required: true,
        sortable: true,
      },
    ],
  },

  seasons: {
    title: "Seasons",
    endpoint: "/api/setup/seasons",
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
        sortable: false,
      },
      {
        name: "date_from",
        label: "Start Date",
        fieldType: "date",
        required: true,
        sortable: true,
      },
      {
        name: "date_to",
        label: "End Date",
        fieldType: "date",
        required: true,
        sortable: true,
      },
      {
        name: "status",
        label: "Status",
        fieldType: "select",
        options: [
          { value: "open", label: "Open" },
          { value: "closed", label: "Closed" },
        ],
        required: true,
        sortable: true,
      },
    ],
  },

  purchase_product_categories: {
    title: "PO Product Categories",
    endpoint: "/api/setup/purchase_product_categories",
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
        sortable: false,
      },
      {
        name: "category_name",
        label: "Category Name",
        fieldType: "text",
        required: true,
        sortable: true,
      },
    ],
  },

  delivery_modes: {
    title: "Delivery Modes",
    endpoint: "/api/setup/delivery_modes",
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
        sortable: false,
      },
      {
        name: "delivery_mode",
        label: "Delivery Mode",
        fieldType: "text",
        required: true,
        sortable: true,
      },
      {
        name: "rate_kg",
        label: "Rate",
        fieldType: "number",
        required: true,
        sortable: true,
      },
    ],
  },

  delivery_terms: {
    title: "Delivery Terms",
    endpoint: "/api/setup/delivery_terms",
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
        sortable: false,
      },
      {
        name: "delivery_term",
        label: "Delivery Term",
        fieldType: "text",
        required: true,
        sortable: true,
      },
    ],
  },

  commission_terms: {
    title: "Commission Terms",
    endpoint: "/api/setup/commission_terms",
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
        sortable: false,
      },
      {
        name: "commission_term",
        label: "Commission Term",
        fieldType: "text",
        required: true,
        sortable: true,
      },
    ],
  },

  departments: {
    title: "Departments",
    endpoint: "/api/setup/departments",
    buttonText: "Add Department",
    fields: [
      {
        name: "dept_name",
        label: "Dept Name",
        fieldType: "text",
        required: true,
        sortable: true,
      },
      // {
      //   relation: "company",
      //   relationName: "company",
      //   name: "company_id",
      //   label: "Company",
      //   fieldType: "select",
      //   fetchFrom: "/api/setup/companies",
      //   optionLabelKey: "company",
      //   optionValueKey: "id",
      //   required: true,
      // },
      {
        name: "dept_description",
        label: "Description",
        fieldType: "text",
        required: false,
        sortable: true,
      },
    ],
  },

  cost_centers: {
    title: "Cost Centers",
    endpoint: "/api/setup/cost_centers",
    buttonText: "Add Cost Center",
    fields: [
      {
        name: "ccname",
        label: "CC Name",
        fieldType: "text",
        required: true,
        sortable: true,
      },
      {
        name: "cc_description",
        label: "Description",
        fieldType: "text",
        required: false,
        sortable: true,
      },
    ],
  },

  work_locations: {
    title: "Work Locations",
    endpoint: "/api/setup/work_locations",
    buttonText: "Add Work Location",
    fields: [
      {
        name: "location_name",
        label: "Work Location",
        fieldType: "text",
        required: false,
        sortable: true,
      },
      {
        name: "location_description",
        label: "Description",
        fieldType: "text",
        required: false,
        sortable: true,
      },
    ],
  },

  banks: {
    title: "Banks",
    endpoint: "/api/setup/banks",
    buttonText: "Add Bank",
    fields: [
      {
        name: "bank_name",
        label: "Bank",
        fieldType: "text",
        required: false,
        sortable: true,
      },
      {
        name: "bank_description",
        label: "Description",
        fieldType: "text",
        required: false,
        sortable: true,
      },
    ],
  },

  job_titles: {
    title: "Job Titles",
    endpoint: "/api/setup/job_titles",
    buttonText: "Add Job Title",
    fields: [
      {
        name: "job_title",
        label: "Job Title",
        fieldType: "text",
        required: true,
        sortable: true,
      },
      {
        relation: "department",
        relationName: "dept_name",
        name: "department_id",
        label: "Department",
        fieldType: "select",
        fetchFrom: "/api/setup/departments",
        optionLabelKey: "dept_name",
        optionValueKey: "id",
        required: true,
        sortable: false,
      },
      {
        name: "job_title_description",
        label: "Description",
        fieldType: "text",
        required: true,
        sortable: true,
      },
    ],
  },

  allowances: {
    title: "Allowances",
    endpoint: "/api/setup/allowances",
    buttonText: "Add Allowance",
    fields: [
      {
        name: "allowance",
        label: "Allowance",
        fieldType: "text",
        required: true,
        sortable: true,
      },
      {
        name: "allowance_description",
        label: "Description",
        fieldType: "text",
        required: true,
        sortable: true,
      },
      {
        name: "rate",
        label: "Rate",
        fieldType: "text",
        required: true,
        sortable: true,
      },
    ],
  },

  deductions: {
    title: "Deductions",
    endpoint: "/api/setup/deductions",
    buttonText: "Add Deduction",
    fields: [
      {
        name: "deduction",
        label: "Deduction",
        fieldType: "text",
        required: true,
        sortable: true,
      },
      {
        name: "deduction_description",
        label: "Description",
        fieldType: "text",
        required: true,
        sortable: true,
      },
      {
        name: "rate",
        label: "Rate",
        fieldType: "text",
        required: true,
        sortable: true,
      },
    ],
  },

  leaves: {
    title: "Leaves",
    endpoint: "/api/setup/leaves",
    buttonText: "Add Leave",
    fields: [
      {
        name: "leave",
        label: "Leave",
        fieldType: "text",
        required: true,
        sortable: true,
      },
      {
        name: "leave_description",
        label: "Description",
        fieldType: "text",
        required: true,
        sortable: true,
      },
      {
        name: "balance",
        label: "Balance",
        fieldType: "number",
        required: false,
        sortable: true,
      },
      {
        name: "maxCarryForward",
        label: "Max Carry Forward",
        fieldType: "number",
        required: false,
        sortable: true,
      },
    ],
  },

  managers: {
    title: "Managers",
    endpoint: "/api/setup/managers",
    buttonText: "Add Manager",
    tableFields: [
      { name: "manager", label: "Manager Name", sortable: true },
      {
        name: "department",
        label: "Department",
        sortable: true,
        relationKey: "dept_name",
      },
      {
        name: "employee",
        label: "Employee",
        sortable: true,
        relationKey: "firstName",
      },
    ],
    fields: [
      {
        relation: "department",
        relationName: "department",
        name: "department_id",
        label: "Department",
        fieldType: "select",
        fetchFrom: "/api/setup/departments",
        optionLabelKey: "dept_name",
        optionValueKey: "id",
        required: true,
      },
      {
        relation: "employee",
        relationName: "employee",
        name: "employeeId",
        label: "Employee (Manager)",
        fieldType: "select",
        // Department ke basis par employees filter karo
        fetchFrom: (formData) => {
          if (formData.department_id) {
            return `/api/setup/employees?departmentId=${formData.department_id}&status=ACTIVE`;
          }
          return "/api/setup/employees?status=ACTIVE";
        },
        // Full name display karo
        optionLabelKey: (item) => {
          const middleName = item.middleName ? ` ${item.middleName}` : "";
          return `${item.firstName}${middleName} ${item.surname}`;
        },
        optionValueKey: "id",
        required: true,
        dependsOn: ["department_id"],
      },
      {
        name: "manager",
        label: "Manager Name",
        fieldType: "text",
        required: true,
        readOnly: true,
        placeholder: "Will be auto-filled when employee is selected",
      },
    ],
  },

  employees: {
    title: "Employees",
    endpoint: "/api/setup/employees",
    buttonText: "Add Employee",
    tableFields: [
      { name: "firstName", label: "Name", sortable: true },
      { name: "emailAddress", label: "Email", sortable: true },
      { name: "phoneNumber", label: "Phone", sortable: true },
      { name: "status", label: "Status", sortable: true },
    ],
    fields: [
      {
        name: "firstName",
        label: "First Name",
        fieldType: "text",
        required: true,
        sortable: true,
      },
      {
        name: "surname",
        label: "Surname",
        fieldType: "text",
        required: true,
        sortable: true,
      },
      {
        name: "dob",
        label: "Date of Birth",
        fieldType: "date",
        required: true,
        sortable: true,
      },
      {
        name: "hireDate",
        label: "Hire Date",
        fieldType: "date",
        required: true,
        sortable: true,
      },
      {
        name: "gender",
        label: "Gender",
        fieldType: "select",
        options: [
          { value: "Male", label: "Male" },
          { value: "Female", label: "Female" },
        ],
        required: true,
        sortable: true,
      },
      {
        name: "phoneNumber",
        label: "Phone Number",
        fieldType: "text",
        sortable: true,
      },
      {
        name: "emailAddress",
        label: "Email",
        fieldType: "email",
        required: true,
        sortable: true,
      },
      {
        relation: "jobTitle",
        relationName: "jobTitle",
        name: "jobTitleId",
        label: "Job Title",
        fieldType: "select",
        fetchFrom: "/api/setup/job_titles",
        optionLabelKey: "job_title",
        optionValueKey: "id",
        required: true,
        sortable: true,
      },
      {
        relation: "department",
        relationName: "department",
        name: "departmentId",
        label: "Department",
        fieldType: "select",
        fetchFrom: "/api/setup/departments",
        optionLabelKey: "dept_name",
        optionValueKey: "id",
        required: true,
        sortable: true,
      },
      {
        relation: "workLocation",
        relationName: "workLocation",
        name: "workLocationId",
        label: "Work Location",
        fieldType: "select",
        fetchFrom: "/api/setup/work_locations",
        optionLabelKey: "location_name",
        optionValueKey: "id",
        required: true,
        sortable: true,
      },
      {
        relation: "manager",
        relationName: "manager",
        name: "managerId",
        label: "Manager",
        fieldType: "select",
        fetchFrom: "/api/setup/managers",
        optionLabelKey: "manager",
        optionValueKey: "id",
        sortable: true,
      },
      {
        name: "status",
        label: "Status",
        fieldType: "select",
        options: [
          { value: "ACTIVE", label: "ACTIVE" },
          { value: "INACTIVE", label: "INACTIVE" },
        ],
        required: true,
        sortable: true,
      },
      {
        name: "paymentMethod",
        label: "Payment Method",
        fieldType: "select",
        options: [
          { value: "CASH", label: "CASH" },
          { value: "DIRECT_DEPOSIT", label: "DIRECT_DEPOSIT" },
          { value: "CHEQUE", label: "CHEQUE" },
        ],
        required: true,
      },
      {
        relation: "bank",
        relationName: "bank",
        name: "bankId",
        label: "Bank",
        fieldType: "select",
        fetchFrom: "/api/setup/banks",
        optionLabelKey: "bank_name",
        optionValueKey: "id",
      },
      {
        name: "accountName",
        label: "Account Name",
        fieldType: "text",
      },
      {
        name: "accountNumber",
        label: "Account Number",
        fieldType: "text",
      },
      {
        name: "payType",
        label: "Pay Type",
        fieldType: "select",
        options: [
          { value: "SALARY", label: "SALARY" },
          { value: "HOUR", label: "HOUR" },
        ],
        required: true,
      },
      {
        name: "rate",
        label: "Rate",
        fieldType: "number",
        required: true,
      },
      {
        name: "payFrequency",
        label: "Pay Frequency",
        fieldType: "select",
        options: [
          { value: "MONTHLY", label: "MONTHLY" },
          { value: "FORTNIGHTLY", label: "FORTNIGHTLY" },
          { value: "WEEKLY", label: "WEEKLY" },
        ],
        required: true,
      },
      {
        relation: "costCenter",
        relationName: "costCenter",
        name: "costCenterId",
        label: "Cost Center",
        fieldType: "select",
        fetchFrom: "/api/setup/cost_centers",
        optionLabelKey: "ccname",
        optionValueKey: "ccno",
        required: true,
      },
    ],
  },

vendors: {
  title: "Vendor Master",
  endpoint: "/api/setup/vendors",
  tableFields: [
    { name: "acno", label: "Code", sortable: true },
    { name: "acname", label: "Name", sortable: true },
    { name: "city", label: "City", sortable: true },
    { name: "email", label: "Email", sortable: true },
    { name: "category", label: "Category", sortable: true },
  ],
  fields: [
    { name: "acno", label: "Code", fieldType: "text", required: true, readOnly: true },
    { name: "acname", label: "Name", fieldType: "text", required: true },
    { name: "address", label: "Detail Address", fieldType: "text" },
    { name: "area", label: "Area", fieldType: "text" },
    { name: "city", label: "City", fieldType: "text" },
    { name: "phoneFax", label: "Phone/Fax", fieldType: "text" },
    { name: "salesArea", label: "Sales Person", fieldType: "text" },
    { name: "contactPerson", label: "Contact Person", fieldType: "text" },
    { name: "isDisabled", label: "Disabled", fieldType: "checkbox" },
    { name: "type", label: "Type", fieldType: "select", options: [{ value: "regular", label: "Regular" }] },
  ],
  allowAdd: false,   // add disable
  allowEdit: true,   // sirf edit khulega
  allowDelete: false // delete bhi disable
},

};

export default entityConfig;
