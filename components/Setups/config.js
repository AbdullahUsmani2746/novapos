// config/entityConfig.js

import { Currency } from "lucide-react";

const entityConfig = {
    // departments: {
    //   title: "Departments",
    //   endpoint: "departments",
    //   buttonText: "Add Department",
    //   fields: [
    //     { name: "dept_name", label: "Dept Name", fieldType: "text", required: true },
    //     {
    //       relation: "company",
    //       relationName: "company",
    //       name: "company_id",
    //       label: "Company",
    //       fieldType: "select",
    //       fetchFrom: "/api/companies", // used to fetch dropdown data
    //       optionLabelKey: "company",
    //       optionValueKey: "id",
    //     },
    //   ],
    // },
    product_master_categories: {
      title: "Product Master Categories",
      endpoint: "product_master_categories",
      buttonText: "Add Product Master Category",
      fields: [
        { name: "pmc_name", label: "Product Master Category Name", fieldType: "text", required: true },
      ],
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
            fetchFrom: "/api/product_master_categories",
            optionLabelKey: "pmc_name",
            optionValueKey: "id",
          },
        ],
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
          fetchFrom: "/api/item_categories",
          optionLabelKey: "name",
          optionValueKey: "id",
        },
      ],
    },
    cost_centers: {
      "title": "Cost Centers",
      "endpoint": "cost-centers",
      "fields": [
        {
          "name": "ccno",
          "label": "CCNO",
          "fieldType": "text",
          "required": true
        },
        {
          "name": "ccname",
          "label": "CC Name",
          "fieldType": "text",
          "required": true
        },
        {
          "relation": "company",
          "relationName": "company",
          "name": "company_id",
          "label": "Company",
          "fieldType": "select",
          "options": "companies.map((company) => ({ value: company.id, label: company.company }))",
          "required": true
        }
      ],
      "buttonText": "Add Cost Center"
    },   
    companies: {
      title: "Companies",
      endpoint: "companies",
      fields: [
        { name: 'company', label: 'Company', fieldType: 'text', required: true },
        { name: 'addr1', label: 'Address 1', fieldType: 'text', required: true },
        { name: 'addr2', label: 'Address 2', fieldType: 'text' },
        { name: 'city', label: 'City', fieldType: 'text', required: true },
        { name: 'phone', label: 'Phone', fieldType: 'text', required: true },
        { name: 'fax', label: 'Fax', fieldType: 'text' },
        { name: 'email', label: 'Email', fieldType: 'email', required: true },
      ],
      buttonText: "Add Company"
    },
    currencies: {
      title: "Currencies",
      endpoint: "currencies",
      buttonText: "Add Currency",
      fields: [
        { name: 'currency', label: 'Currency', fieldType: 'text', required: true },
      ],
    },
    departments: {
      "title": "Departments",
      "endpoint": "departments",
      "fields": [
        {
          "name": "dept_name",
          "label": "Dept Name",
          "fieldType": "text",
          "required": true
        },
        {
          "relation": "company",
          "relationName": "company",
          "name": "company_id",
          "label": "Company",
          "fieldType": "select",
          "options": "companies.map((company) => ({ value: company.id, label: company.company }))"
        }
      ],
      "buttonText": "Add Department"
    },    
    // godowns: {
    //   "title": "Godowns",
    //   "endpoint": "godowns",
    //   "fields": [
    //     {
    //       "name": "godown",
    //       "label": "Godown",
    //       "fieldType": "text",
    //       "required": true
    //     },
    //     {
    //       "relation": "company",
    //       "relationName": "company",
    //       "name": "company_id",
    //       "label": "Company",
    //       "fieldType": "select",
    //       "required": true,
    //       "options": "companies.map((company) => ({ value: company.id, label: company.company }))"
    //     }
    //   ],
    //   "buttonText": "Add Godown"
    // },
    godowns: {
      title: "Godowns",
      endpoint: "godowns",
      buttonText: "Add Godown",
      fields: [
        { name: "godown", label: "Godown Name", fieldType: "text", required: true },
        {
          relation: "company",
          relationName: "company",
          name: "company_id",
          label: "Company",
          fieldType: "select",
          fetchFrom: "/api/companies", // used to fetch dropdown data
          optionLabelKey: "company",
          optionValueKey: "id",
        },
      ],
    },
    financial_years: {
      "title": "Financial Years",
      "endpoint": "financial-years",
      "fields": [
        {
          "name": "date_from",
          "label": "Start Date",
          "fieldType": "date",
          "required": true
        },
        {
          "name": "date_to",
          "label": "End Date",
          "fieldType": "date",
          "required": true
        },
        {
          "name": "status",
          "label": "Status",
          "fieldType": "select",
          "required": true,
          "options": [
            {
              "value": "open",
              "label": "Open"
            },
            {
              "value": "closed",
              "label": "Closed"
            }
          ]
        }
      ],
      "buttonText": "Add Financial Year"
    },
    seasons: {
      "title": "Seasons",
      "endpoint": "seasons",
      "fields": [
        {
          "name": "date_from",
          "label": "Start Date",
          "fieldType": "date",
          "required": true
        },
        {
          "name": "date_to",
          "label": "End Date",
          "fieldType": "date",
          "required": true
        },
        {
          "name": "status",
          "label": "Status",
          "fieldType": "select",
          "required": true,
          "options": [
            {
              "value": "open",
              "label": "Open"
            },
            {
              "value": "closed",
              "label": "Closed"
            }
          ]
        }
      ],
      "buttonText": "Add Season"
    },
    purchase_product_categories: {
      "title": "PO Product Categories",
      "endpoint": "po-prd-cats",
      "fields": [
        {
          "name": "category_name",
          "label": "Category Name",
          "fieldType": "text",
          "required": true
        }
      ],
      "buttonText": "Add PO Product Category"
    },        
    delivery_modes: {
      "title": "Delivery Modes",
      "endpoint": "delivery-modes",
      "fields": [
        {
          "name": "delivery_mode",
          "label": "Delivery Mode",
          "fieldType": "text",
          "required": true
        },
        {
          "name": "rate_kg",
          "label": "Rate",
          "fieldType": "number",
          "required": true
        }
      ],
      "buttonText": "Add Delivery Mode"
    },
    delivery_terms: {
      "title": "Delivery Terms",
      "endpoint": "delivery-terms",
      "fields": [
        {
          "name": "delivery_term",
          "label": "Delivery Term",
          "fieldType": "text",
          "required": true
        }
      ],
      "buttonText": "Add Delivery Term"
    },
    commission_terms: {
      "title": "Commission Terms",
      "endpoint": "commission-terms",
      "fields": [
        {
          "name": "commission_term",
          "label": "Commission Term",
          "fieldType": "text",
          "required": true
        }
      ],
      "buttonText": "Add Commission Term"
    },
    employees: {
      "title": "Employees",
      "endpoint": "employees",
      "fields": [
        { "name": "first_name", "label": "First Name", "fieldType": "text", "required": true },
        { "name": "middle_name", "label": "Middle Name", "fieldType": "text" },
        { "name": "surname", "label": "Surname", "fieldType": "text", "required": true },
        { "name": "dob", "label": "Date of Birth", "fieldType": "date", "required": true },
        { 
          "name": "gender", 
          "label": "Gender", 
          "fieldType": "select", 
          "options": [
            { "value": "MALE", "label": "Male" },
            { "value": "FEMALE", "label": "Female" },
            { "value": "OTHER", "label": "Other" }
          ]
        },
        { "name": "phone_number", "label": "Phone Number", "fieldType": "text", "required": true },
        { "name": "npf_number", "label": "NPF Number", "fieldType": "text", "required": true },
        { "name": "email_address", "label": "Email Address", "fieldType": "email", "required": true },
        { "name": "village", "label": "Village", "fieldType": "text", "required": true },
        { 
          "name": "status", 
          "label": "Status", 
          "fieldType": "select", 
          "options": [
            { "value": "ACTIVE", "label": "Active" },
            { "value": "INACTIVE", "label": "Inactive" }
          ]
        },
        { "name": "hire_date", "label": "Hire Date", "fieldType": "date", "required": true },
        { "name": "job_title", "label": "Job Title", "fieldType": "text", "required": true },
        { "name": "department", "label": "Department", "fieldType": "text", "required": true },
        { "name": "work_location", "label": "Work Location", "fieldType": "text", "required": true },
    
        // {
        //   "relation": "manager",
        //   "relationName": "manager",
        //   "name": "manager_id",
        //   "label": "Manager",
        //   "fieldType": "select",
        //   "options": "managers.map((manager) => ({ value: manager.id, label: manager.id }))"
        // },
    
        // {
        //   "relation": "employer",
        //   "relationName": "employer",
        //   "name": "client_id",
        //   "label": "Employer",
        //   "fieldType": "select",
        //   "options": "employers.map((employer) => ({ value: employer.employer_id, label: employer.employer_id }))",
        //   "required": true
        // },
    
        { "name": "employee_id", "label": "Employee ID", "fieldType": "text", "required": true },
    
        // { 
        //   "name": "payment_method", 
        //   "label": "Payment Method", 
        //   "fieldType": "select", 
        //   "options": [
        //     { "value": "CASH", "label": "Cash" },
        //     { "value": "DIRECT_DEPOSIT", "label": "Direct Deposit" },
        //     { "value": "CHEQUE", "label": "Cheque" }
        //   ]
        // },
    
        { "name": "bank_name", "label": "Bank Name", "fieldType": "text" },
        { "name": "account_name", "label": "Account Name", "fieldType": "text" },
        { "name": "account_number", "label": "Account Number", "fieldType": "text" },
        { 
          "name": "pay_type", 
          "label": "Pay Type", 
          "fieldType": "select", 
          "options": [
            { "value": "HOUR", "label": "Hourly" },
            { "value": "SALARY", "label": "Salary" }
          ]
        },
        { "name": "rate_per_hour", "label": "Rate Per Hour", "fieldType": "number", "required": true },
        { 
          "name": "pay_frequency", 
          "label": "Pay Frequency", 
          "fieldType": "select", 
          "options": [
            { "value": "Monthly", "label": "Monthly" },
            { "value": "Fortnightly", "label": "Fortnightly" },
            { "value": "Weekly", "label": "Weekly" }
          ]
        },
        { "name": "employee_type", "label": "Employee Type", "fieldType": "text", "required": true },
        { "name": "cost_center", "label": "Cost Center", "fieldType": "text", "required": true },
        { "name": "allownces", "label": "Allowances", "fieldType": "text", "required": false },
    
        // { "name": "allownce_eligible", "label": "Allowance Eligible", "fieldType": "checkbox" },
    
        { "name": "deductions", "label": "Deductions", "fieldType": "text", "required": false },
    
        // { "name": "profile_image", "label": "Profile Image", "fieldType": "file" }
      ],
      "buttonText": "Add Employee"
    },    
    
  };
  
  export default entityConfig;
  