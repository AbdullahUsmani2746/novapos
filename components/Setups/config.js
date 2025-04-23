// config/entityConfig.js

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
  };
  
  export default entityConfig;
  