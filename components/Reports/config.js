// reports/reportConfig.js
export const REPORT_CONFIG = {
  purchase: {
    title: "Purchase Report",
    description: "Detailed report of all purchase transactions",
    apiEndpoint: "/api/reports/purchase",
    filters: [
      {
        name: "dateFrom",
        label: "From Date",
        type: "date",
        required: true
      },
      {
        name: "dateTo",
        label: "To Date",
        type: "date",
        required: true
      },
      {
        name: "vendor",
        label: "Vendor",
        valueKey:"acno",
        type: "select",
        nameKey:"acname",
        options: "vendors",
        apiEndpoint: "/api/accounts/acno?macno=006",
        clearable: true
      },
      {
        name: "godown",
        label: "Godown",
        nameKey:"godown",
        
        type: "select",
        options: "godowns",
        apiEndpoint: "/api/setup/godowns",
        clearable: true
      }
    ],
    columns: [
      { field: "dateD", headerName: "Date", width: 120, type: "date" },
      { field: "vr_no", headerName: "Voucher No", width: 120 },
      { field: "invoice_no", headerName: "Invoice No", width: 150 },
      { 
        field: "vendor_name", 
        headerName: "Vendor", 
        width: 200,
        valueGetter: (params) => params.row.acno?.acname || ''
      },
      { 
        field: "godown_name", 
        headerName: "Godown", 
        width: 150,
        valueGetter: (params) => params.row.godownDetails?.godown || ''
      },
      { field: "total_qty", headerName: "Total Qty", width: 120, type: "number" },
      { field: "total_amount", headerName: "Total Amount", width: 150, type: "currency" },
    ],
    detailColumns: [
      { field: "item", headerName: "Item", width: 200, valueGetter: (params) => params.row.itemDetails?.item || '' },
      { field: "qty", headerName: "Qty", width: 100, type: "number" },
      { field: "rate", headerName: "Rate", width: 100, type: "currency" },
      { field: "gross_amount", headerName: "Gross Amount", width: 150, type: "currency" },
      { field: "st_rate", headerName: "ST Rate", width: 100, type: "number" },
      { field: "st_amount", headerName: "ST Amount", width: 150, type: "currency" },
      { field: "additional_tax", headerName: "Additional Tax", width: 150, type: "currency" },
      { field: "camt", headerName: "Amount", width: 150, type: "currency" }
    ],
    summaryFields: [
      { field: "total_qty", label: "Total Quantity", type: "number" },
      { field: "total_gross_amount", label: "Total Gross Amount", type: "currency" },
      { field: "total_tax", label: "Total Tax", type: "currency" },
      { field: "total_amount", label: "Total Net Amount", type: "currency" }
    ],
    exportOptions: {
      pdf: true,
      excel: true,
      csv: true
    }
  },
  purchaseReturn: {
    title: "Purchase Return Report",
    description: "Detailed report of all purchase return transactions",
    apiEndpoint: "/api/reports/purchaseReturn",
    filters: [
      {
        name: "dateFrom",
        label: "From Date",
        type: "date",
        required: true
      },
      {
        name: "dateTo",
        label: "To Date",
        type: "date",
        required: true
      },
      {
        name: "vendor",
        nameKey:"acname",
        valueKey:"acno",
        label: "Vendor",
        type: "select",
        options: "vendors",
        apiEndpoint: "/api/accounts/acno?macno=006",
        clearable: true
      },
      {
        name: "godown",
        nameKey:"godown",
        label: "Godown",
        type: "select",
        options: "godowns",
        apiEndpoint: "/api/setup/godowns",
        clearable: true
      }
    ],
    columns: [
      { field: "dateD", headerName: "Date", width: 120, type: "date" },
      { field: "vr_no", headerName: "Voucher No", width: 120 },
      { field: "invoice_no", headerName: "Invoice No", width: 150 },
      { 
        field: "vendor_name", 
        headerName: "Vendor", 
        width: 200,
        valueGetter: (params) => params.row.acno?.acname || ''
      },
      { 
        field: "godown_name", 
        headerName: "Godown", 
        width: 150,
        valueGetter: (params) => params.row.godownDetails?.godown || ''
      },
      { field: "total_qty", headerName: "Total Qty", width: 120, type: "number" },
      { field: "total_amount", headerName: "Total Amount", width: 150, type: "currency" },
      { field: "rmk", headerName: "Narration", width: 200 }
    ],
    detailColumns: [
      { field: "item", headerName: "Item", width: 200, valueGetter: (params) => params.row.itemDetails?.item || '' },
      { field: "qty", headerName: "Qty", width: 100, type: "number" },
      { field: "rate", headerName: "Rate", width: 100, type: "currency" },
      { field: "gross_amount", headerName: "Gross Amount", width: 150, type: "currency" },
      { field: "st_rate", headerName: "ST Rate", width: 100, type: "number" },
      { field: "st_amount", headerName: "ST Amount", width: 150, type: "currency" },
      { field: "additional_tax", headerName: "Additional Tax", width: 150, type: "currency" },
      { field: "amount", headerName: "Amount", width: 150, type: "currency" }
    ],
    summaryFields: [
      { field: "total_qty", label: "Total Quantity", type: "number" },
      { field: "total_gross_amount", label: "Total Gross Amount", type: "currency" },
      { field: "total_tax", label: "Total Tax", type: "currency" },
      { field: "total_amount", label: "Total Net Amount", type: "currency" }
    ],
    exportOptions: {
      pdf: true,
      excel: true,
      csv: true
    }
  },
  sale: {
    title: "Sales Report",
    description: "Detailed report of all sales transactions",
    apiEndpoint: "/api/reports/sale",
    filters: [
      {
        name: "dateFrom",
        label: "From Date",
        type: "date",
        required: true
      },
      {
        name: "dateTo",
        label: "To Date",
        type: "date",
        required: true
      },
      {
        name: "customer",
        label: "Customer",
        type: "select",
        nameKey:"acname",
        valueKey:"acno",
        options: "customers",
        apiEndpoint: "/api/accounts/acno?macno=001",
        clearable: true
      },
      {
        name: "godown",
        label: "Godown",
        nameKey:"godown",
        type: "select",
        options: "godowns",
        apiEndpoint: "/api/setup/godowns",
        clearable: true
      }
    ],
    columns: [
      { field: "dateD", headerName: "Date", width: 120, type: "date" },
      { field: "vr_no", headerName: "Voucher No", width: 120 },
      { field: "invoice_no", headerName: "Invoice No", width: 150 },
      { 
        field: "customer_name", 
        headerName: "Customer", 
        width: 200,
        valueGetter: (params) => params.row.acno?.acname || ''
      },
      { 
        field: "godown_name", 
        headerName: "Godown", 
        width: 150,
        valueGetter: (params) => params.row.godownDetails?.godown || ''
      },
      { field: "total_qty", headerName: "Total Qty", width: 120, type: "number" },
      { field: "total_amount", headerName: "Total Amount", width: 150, type: "currency" },
      { field: "rmk", headerName: "Narration", width: 200 }
    ],
    detailColumns: [
      { field: "item", headerName: "Item", width: 200, valueGetter: (params) => params.row.itemDetails?.item || '' },
      { field: "qty", headerName: "Qty", width: 100, type: "number" },
      { field: "rate", headerName: "Rate", width: 100, type: "currency" },
      { field: "gross_amount", headerName: "Gross Amount", width: 150, type: "currency" },
      { field: "st_rate", headerName: "ST Rate", width: 100, type: "number" },
      { field: "st_amount", headerName: "ST Amount", width: 150, type: "currency" },
      { field: "additional_tax", headerName: "Additional Tax", width: 150, type: "currency" },
      { field: "amount", headerName: "Amount", width: 150, type: "currency" }
    ],
    summaryFields: [
      { field: "total_qty", label: "Total Quantity", type: "number" },
      { field: "total_gross_amount", label: "Total Gross Amount", type: "currency" },
      { field: "total_tax", label: "Total Tax", type: "currency" },
      { field: "total_amount", label: "Total Net Amount", type: "currency" }
    ],
    exportOptions: {
      pdf: true,
      excel: true,
      csv: true
    }
  },
  saleReturn: {
    title: "Sales Return Report",
    description: "Detailed report of all sales return transactions",
    apiEndpoint: "/api/reports/saleReturn",
    filters: [
      {
        name: "dateFrom",
        label: "From Date",
        type: "date",
        required: true
      },
      {
        name: "dateTo",
        label: "To Date",
        type: "date",
        required: true
      },
      {
        name: "customer",
        label: "Customer",
        type: "select",
        nameKey:"acname",
        valueKey:"acno",
        options: "customers",
        apiEndpoint: "/api/accounts/acno?macno=001",
        clearable: true
      },
      {
        name: "godown",
        label: "Godown",
        type: "select",
        nameKey:"godown",
        options: "godowns",
        apiEndpoint: "/api/setup/godowns",
        clearable: true
      }
    ],
    columns: [
      { field: "dateD", headerName: "Date", width: 120, type: "date" },
      { field: "vr_no", headerName: "Voucher No", width: 120 },
      { field: "invoice_no", headerName: "Invoice No", width: 150 },
      { 
        field: "customer_name", 
        headerName: "Customer", 
        width: 200,
        valueGetter: (params) => params.row.acno?.acname || ''
      },
      { 
        field: "godown_name", 
        headerName: "Godown", 
        width: 150,
        valueGetter: (params) => params.row.godownDetails?.godown || ''
      },
      { field: "total_qty", headerName: "Total Qty", width: 120, type: "number" },
      { field: "total_amount", headerName: "Total Amount", width: 150, type: "currency" },
      { field: "rmk", headerName: "Narration", width: 200 }
    ],
    detailColumns: [
      { field: "item", headerName: "Item", width: 200, valueGetter: (params) => params.row.itemDetails?.item || '' },
      { field: "qty", headerName: "Qty", width: 100, type: "number" },
      { field: "rate", headerName: "Rate", width: 100, type: "currency" },
      { field: "gross_amount", headerName: "Gross Amount", width: 150, type: "currency" },
      { field: "st_rate", headerName: "ST Rate", width: 100, type: "number" },
      { field: "st_amount", headerName: "ST Amount", width: 150, type: "currency" },
      { field: "additional_tax", headerName: "Additional Tax", width: 150, type: "currency" },
      { field: "amount", headerName: "Amount", width: 150, type: "currency" }
    ],
    summaryFields: [
      { field: "total_qty", label: "Total Quantity", type: "number" },
      { field: "total_gross_amount", label: "Total Gross Amount", type: "currency" },
      { field: "total_tax", label: "Total Tax", type: "currency" },
      { field: "total_amount", label: "Total Net Amount", type: "currency" }
    ],
    exportOptions: {
      pdf: true,
      excel: true,
      csv: true
    }
  },
  stock: {
    title: "Stock Report",
    description: "Current stock levels for all items",
    apiEndpoint: "/api/reports/stock",
    filters: [
      {
        name: "category",
        label: "Category",
        nameKey:"ic_name",
        type: "select",
        options: "itemCategories",
        apiEndpoint: "/api/setup/item_categories",
        clearable: true
      },
      {
        name: "showZero",
        label: "Show Zero Stock",
        type: "checkbox",
        default: false
      }
    ],
    columns: [
      { field: "item", headerName: "Item", width: 250 },
      { field: "sku", headerName: "SKU", width: 150 },
      { 
        field: "category", 
        headerName: "Category", 
        width: 200,
        valueGetter: (params) => params.row.itemCategories?.ic_name || ''
      },
      { field: "stock", headerName: "Current Stock", width: 150, type: "number" },
      { field: "price", headerName: "Price", width: 120, type: "currency" },
      { 
        field: "value", 
        headerName: "Stock Value", 
        width: 150, 
        type: "currency",
        valueGetter: (params) => (params.row.stock || 0) * (params.row.price || 0)
      }
    ],
    summaryFields: [
      { field: "total_items", label: "Total Items", type: "number" },
      { field: "total_stock", label: "Total Stock", type: "number" },
      { field: "total_value", label: "Total Stock Value", type: "currency" }
    ],
    exportOptions: {
      pdf: true,
      excel: true,
      csv: true
    }
  },
  stockActivity: {
    title: "Stock Activity Report",
    description: "Movement of stock items over time",
    apiEndpoint: "/api/reports/stockActivity",
    filters: [
      {
        name: "dateFrom",
        label: "From Date",
        type: "date",
        required: true
      },
      {
        name: "dateTo",
        label: "To Date",
        type: "date",
        required: true
      },
      {
        name: "item",
        label: "Item",
        nameKey:"item",
        valueKey:"itcd",
        type: "select",
        options: "items",
        apiEndpoint: "/api/setup/items",
        clearable: true
      },
      {
        name: "category",
        label: "Category",
        namekey:"ic_name",
        type: "select",
        options: "itemCategories",
        apiEndpoint: "/api/setup/item_categories",
        clearable: true
      },
      {
        name: "godown",
        label: "Godown",
        nameKey:"godown",
        type: "select",
        options: "godowns",
        apiEndpoint: "/api/setup/godowns",
        clearable: true
      },
      {
        name: "transactionType",
        label: "Transaction Type",
        type: "select",
        options: [
          { value: "all", label: "All" },
          { value: "purchase", label: "Purchase" },
          { value: "sale", label: "Sale" },
          { value: "purchaseReturn", label: "Purchase Return" },
          { value: "saleReturn", label: "Sale Return" }
        ],
        default: "all"
      }
    ],
    columns: [
      { field: "date", headerName: "Date", width: 120, type: "date" },
      { field: "voucher_no", headerName: "Voucher No", width: 120 },
      { field: "type", headerName: "Type", width: 120 },
      { field: "item", headerName: "Item", width: 200, valueGetter: (params) => params.row.itemDetails?.item || '' },
      { field: "qty", headerName: "Quantity", width: 120, type: "number" },
      { field: "rate", headerName: "Rate", width: 120, type: "currency" },
      { field: "amount", headerName: "Amount", width: 150, type: "currency" },
      { field: "godown", headerName: "Godown", width: 150, valueGetter: (params) => params.row.godownDetails?.godown || '' },
      { field: "party", headerName: "Party", width: 200, valueGetter: (params) => params.row.pycd?.acname || '' },
      { field: "narration", headerName: "Narration", width: 200 }
    ],
    summaryFields: [
      { field: "total_in", label: "Total In Quantity", type: "number" },
      { field: "total_out", label: "Total Out Quantity", type: "number" },
      { field: "net_movement", label: "Net Movement", type: "number" },
      { field: "total_amount", label: "Total Amount", type: "currency" }
    ],
    exportOptions: {
      pdf: true,
      excel: true,
      csv: true
    }
  },
  tradingMargin: {
    title: "Trading Margin Report",
    description: "Profitability analysis by item",
    apiEndpoint: "/api/reports/tradingMargin",
    filters: [
      {
        name: "dateFrom",
        label: "From Date",
        type: "date",
        required: true
      },
      {
        name: "dateTo",
        label: "To Date",
        type: "date",
        required: true
      },
      {
        name: "item",
        valueKey:"itcd",
        nameKey:"item",
        label: "Item",
        type: "select",
        options: "items",
        apiEndpoint: "/api/setup/items",
        clearable: true
      },
      {
        name: "category",
        label: "Category",
        nameKey:"ic_name",
        type: "select",
        options: "itemCategories",
        apiEndpoint: "/api/setup/item_categories",
        clearable: true
      }
    ],
    columns: [
      { field: "item", headerName: "Item", width: 250, valueGetter: (params) => params.row.itemDetails?.item || '' },
      { field: "category", headerName: "Category", width: 200, valueGetter: (params) => params.row.itemDetails?.itemCategories?.ic_name || '' },
      { field: "purchase_qty", headerName: "Purchase Qty", width: 120, type: "number" },
      { field: "purchase_amount", headerName: "Purchase Amount", width: 150, type: "currency" },
      { field: "avg_purchase_rate", headerName: "Avg Purchase Rate", width: 150, type: "currency" },
      { field: "sale_qty", headerName: "Sale Qty", width: 120, type: "number" },
      { field: "sale_amount", headerName: "Sale Amount", width: 150, type: "currency" },
      { field: "avg_sale_rate", headerName: "Avg Sale Rate", width: 150, type: "currency" },
      { field: "margin", headerName: "Margin", width: 120, type: "currency" },
      { field: "margin_percent", headerName: "Margin %", width: 120, type: "percent" }
    ],
    summaryFields: [
      { field: "total_purchase_qty", label: "Total Purchase Qty", type: "number" },
      { field: "total_purchase_amount", label: "Total Purchase Amount", type: "currency" },
      { field: "total_sale_qty", label: "Total Sale Qty", type: "number" },
      { field: "total_sale_amount", label: "Total Sale Amount", type: "currency" },
      { field: "total_margin", label: "Total Margin", type: "currency" },
      { field: "avg_margin_percent", label: "Avg Margin %", type: "percent" }
    ],
    exportOptions: {
      pdf: true,
      excel: true,
      csv: true
    }
  }
};