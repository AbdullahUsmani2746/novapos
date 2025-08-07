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
        required: true,
      },
      {
        name: "dateTo",
        label: "To Date",
        type: "date",
        required: true,
      },
      {
        name: "vendor",
        label: "Vendor",
        valueKey: "acno",
        type: "select",
        nameKey: "acname",
        options: "vendors",
        apiEndpoint: "/api/accounts/acno?macno=006",
        clearable: true,
      },
      {
        name: "godown",
        label: "Godown",
        nameKey: "godown",

        type: "select",
        options: "godowns",
        apiEndpoint: "/api/setup/godowns",
        clearable: true,
      },
    ],
    columns: [
      { field: "dateD", headerName: "Date", width: 32, type: "date" },
      { field: "vr_no", headerName: "Voucher No", width: 32 },
      { field: "invoice_no", headerName: "Invoice No", width: 32 },
      {
        field: "vendor_name",
        headerName: "Vendor",
        width: 48,
        valueGetter: (params) => params.row.acno?.acname || "",
      },
      {
        field: "godown_name",
        headerName: "Godown",
        width: 52,
        valueGetter: (params) => params.row.godownDetails?.godown || "",
      },
      {
        field: "total_qty",
        headerName: "Total Qty",
        width: 32,
        type: "number",
      },
      {
        field: "total_amount",
        headerName: "Total Amount",
        width: 52,
        type: "currency",
      },
    ],
    detailColumns: [
      {
        field: "item",
        headerName: "Item",
        width: 90,
        valueGetter: (params) => params.row.itemDetails?.item || "",
      },
      { field: "qty", headerName: "Qty", width: 20, type: "number" },
      { field: "rate", headerName: "Rate", width: 20, type: "currency" },
      {
        field: "gross_amount",
        headerName: "Gross Amt",
        width: 30,
        type: "currency",
      },
      { field: "st_rate", headerName: "ST Rate", width: 20, type: "number" },
      {
        field: "st_amount",
        headerName: "ST Amt",
        width: 20,
        type: "currency",
      },
      {
        field: "additional_tax",
        headerName: "Add Tax",
        width: 20,
        type: "currency",
      },
      { field: "camt", headerName: "Amount", width: 20, type: "currency" },
    ],
    summaryFields: [
      { field: "total_qty", label: "Total Quantity", type: "number" },
      {
        field: "total_gross_amount",
        label: "Total Gross Amount",
        type: "currency",
      },
      { field: "total_tax", label: "Total Tax", type: "currency" },
      { field: "total_amount", label: "Total Net Amount", type: "currency" },
    ],
    exportOptions: {
      pdf: true,
      excel: true,
      csv: true,
    },
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
        required: true,
      },
      {
        name: "dateTo",
        label: "To Date",
        type: "date",
        required: true,
      },
      {
        name: "vendor",
        nameKey: "acname",
        valueKey: "acno",
        label: "Vendor",
        type: "select",
        options: "vendors",
        apiEndpoint: "/api/accounts/acno?macno=006",
        clearable: true,
      },
      {
        name: "godown",
        nameKey: "godown",
        label: "Godown",
        type: "select",
        options: "godowns",
        apiEndpoint: "/api/setup/godowns",
        clearable: true,
      },
    ],
    columns: [
      { field: "dateD", headerName: "Date", width: 120, type: "date" },
      { field: "vr_no", headerName: "Voucher No", width: 120 },
      { field: "invoice_no", headerName: "Invoice No", width: 150 },
      {
        field: "vendor_name",
        headerName: "Vendor",
        width: 200,
        valueGetter: (params) => params.row.acno?.acname || "",
      },
      {
        field: "godown_name",
        headerName: "Godown",
        width: 150,
        valueGetter: (params) => params.row.godownDetails?.godown || "",
      },
      {
        field: "total_qty",
        headerName: "Total Qty",
        width: 120,
        type: "number",
      },
      {
        field: "total_amount",
        headerName: "Total Amount",
        width: 150,
        type: "currency",
      },
      { field: "rmk", headerName: "Narration", width: 200 },
    ],
    detailColumns: [
      {
        field: "item",
        headerName: "Item",
        width: 90,
        valueGetter: (params) => params.row.itemDetails?.item || "",
      },
      { field: "qty", headerName: "Qty", width: 20, type: "number" },
      { field: "rate", headerName: "Rate", width: 20, type: "currency" },
      {
        field: "gross_amount",
        headerName: "Gross Amt",
        width: 30,
        type: "currency",
      },
      { field: "st_rate", headerName: "ST Rate", width: 20, type: "number" },
      {
        field: "st_amount",
        headerName: "ST Amt",
        width: 20,
        type: "currency",
      },
      {
        field: "additional_tax",
        headerName: "Add Tax",
        width: 20,
        type: "currency",
      },
      { field: "amount", headerName: "Amount", width: 20, type: "currency" },
    ],
    summaryFields: [
      { field: "total_qty", label: "Total Quantity", type: "number" },
      {
        field: "total_gross_amount",
        label: "Total Gross Amount",
        type: "currency",
      },
      { field: "total_tax", label: "Total Tax", type: "currency" },
      { field: "total_amount", label: "Total Net Amount", type: "currency" },
    ],
    exportOptions: {
      pdf: true,
      excel: true,
      csv: true,
    },
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
        required: true,
      },
      {
        name: "dateTo",
        label: "To Date",
        type: "date",
        required: true,
      },
      {
        name: "customer",
        label: "Customer",
        type: "select",
        nameKey: "acname",
        valueKey: "acno",
        options: "customers",
        apiEndpoint: "/api/accounts/acno?macno=001",
        clearable: true,
      },
      {
        name: "godown",
        label: "Godown",
        nameKey: "godown",
        type: "select",
        options: "godowns",
        apiEndpoint: "/api/setup/godowns",
        clearable: true,
      },
    ],
    columns: [
      { field: "dateD", headerName: "Date", width: 120, type: "date" },
      { field: "vr_no", headerName: "Voucher No", width: 120 },
      { field: "invoice_no", headerName: "Invoice No", width: 150 },
      {
        field: "customer_name",
        headerName: "Customer",
        width: 200,
        valueGetter: (params) => params.row.acno?.acname || "",
      },
      {
        field: "godown_name",
        headerName: "Godown",
        width: 150,
        valueGetter: (params) => params.row.godownDetails?.godown || "",
      },
      {
        field: "total_qty",
        headerName: "Total Qty",
        width: 120,
        type: "number",
      },
      {
        field: "total_amount",
        headerName: "Total Amount",
        width: 150,
        type: "currency",
      },
      { field: "rmk", headerName: "Narration", width: 200 },
    ],
    detailColumns: [
      {
        field: "item",
        headerName: "Item",
        width: 90,
        valueGetter: (params) => params.row.itemDetails?.item || "",
      },
      { field: "qty", headerName: "Qty", width: 20, type: "number" },
      { field: "rate", headerName: "Rate", width: 20, type: "currency" },
      {
        field: "gross_amount",
        headerName: "Gross Amount",
        width: 30,
        type: "currency",
      },
      { field: "st_rate", headerName: "ST Rate", width: 20, type: "number" },
      {
        field: "st_amount",
        headerName: "ST Amt",
        width: 20,
        type: "currency",
      },
      {
        field: "additional_tax",
        headerName: "Add Tax",
        width: 20,
        type: "currency",
      },
      { field: "amount", headerName: "Amount", width: 20, type: "currency" },
    ],
    summaryFields: [
      { field: "total_qty", label: "Total Quantity", type: "number" },
      {
        field: "total_gross_amount",
        label: "Total Gross Amount",
        type: "currency",
      },
      { field: "total_tax", label: "Total Tax", type: "currency" },
      { field: "total_amount", label: "Total Net Amount", type: "currency" },
    ],
    exportOptions: {
      pdf: true,
      excel: true,
      csv: true,
    },
  },
  payment: {
    title: "Payment Report",
    description: "Detailed report of all payment transactions",
    apiEndpoint: "/api/reports/payment",
    filters: [
      { name: "dateFrom", label: "From Date", type: "date", required: true },
      { name: "dateTo", label: "To Date", type: "date", required: true },
      {
        name: "paidfrom",
        label: "Paid From",
        type: "select",
        nameKey: "acname",
        valueKey: "acno",
        options: "vendors",
        apiEndpoint: "/api/accounts/acno?macno=003,004",
        clearable: true,
      },
    ],
    columns: [
      { field: "date", headerName: "Date", width: 120, type: "date" },
      { field: "vr_no", headerName: "Voucher No", width: 120 },
      {
        field: "account",
        headerName: "Paid From",
        width: 200,
        // valueGetter: (params) => params.row.acno?.acname || "",
      },
      { field: "amount", headerName: "Amount", width: 150, type: "currency" },
      { field: "narration", headerName: "Remarks", width: 200 },
    ],
    summaryFields: [
      {
        field: "total_transactions",
        label: "Total Transactions",
        type: "number",
      },
      { field: "total_net", label: "Total Net Amount", type: "currency" },
    ],
    exportOptions: { pdf: true, excel: true, csv: true },
  },
  receipt: {
    title: "Receipt Report",
    description: "Detailed report of all receipt transactions",
    apiEndpoint: "/api/reports/receipt",
    filters: [
      { name: "dateFrom", label: "From Date", type: "date", required: true },
      { name: "dateTo", label: "To Date", type: "date", required: true },
      {
        name: "receivedat",
        label: "Recieved At",
        type: "select",
        nameKey: "acname",
        valueKey: "acno",
        options: "customers",
        apiEndpoint: "/api/accounts/acno?macno=003,004",
        clearable: true,
      },
    ],
    columns: [
      { field: "date", headerName: "Date", width: 50, type: "date" },
      { field: "vr_no", headerName: "Voucher No", width: 50 },
      {
        field: "account",
        headerName: "Received At",
        width: 50,
        // valueGetter: (params) => params.row.acno?.acname || "",
      },
      { field: "amount", headerName: "Amount", width: 50, type: "currency" },
      { field: "narration", headerName: "Remarks", width: 75 },
    ],
    summaryFields: [
      {
        field: "total_transactions",
        label: "Total Transactions",
        type: "number",
      },
      { field: "total_net", label: "Total Net Amount", type: "currency" },
    ],
    exportOptions: { pdf: true, excel: true, csv: true },
  },
  journal: {
    title: "Journal Voucher Report",
    description: "Detailed report of all journal vouchers",
    apiEndpoint: "/api/reports/journal",
    filters: [
      { name: "dateFrom", label: "From Date", type: "date", required: true },
      { name: "dateTo", label: "To Date", type: "date", required: true },
    ],
    columns: [
      { field: "date", headerName: "Date", width: 50, type: "date" },
      { field: "vr_no", headerName: "Voucher No", width: 50 },
      { field: "damt", headerName: "Debit", width: 50, type: "currency" },
      { field: "camt", headerName: "Credit", width: 50, type: "currency" },
      { field: "narration", headerName: "Narration", width: 75 },
    ],
    summaryFields: [
      {
        field: "total_transactions",
        label: "Total Transactions",
        type: "number",
      },
      { field: "total_damt", label: "Total Debit", type: "currency" },
      { field: "total_camt", label: "Total Credit", type: "currency" },
    ],
    exportOptions: { pdf: true, excel: true, csv: true },
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
        required: true,
      },
      {
        name: "dateTo",
        label: "To Date",
        type: "date",
        required: true,
      },
      {
        name: "customer",
        label: "Customer",
        type: "select",
        nameKey: "acname",
        valueKey: "acno",
        options: "customers",
        apiEndpoint: "/api/accounts/acno?macno=001",
        clearable: true,
      },
      {
        name: "godown",
        label: "Godown",
        type: "select",
        nameKey: "godown",
        options: "godowns",
        apiEndpoint: "/api/setup/godowns",
        clearable: true,
      },
    ],
    columns: [
      { field: "dateD", headerName: "Date", width: 40, type: "date" },
      { field: "vr_no", headerName: "Voucher No", width: 40 },
      { field: "invoice_no", headerName: "Invoice No", width: 30 },
      {
        field: "customer_name",
        headerName: "Customer",
        width: 200,
        valueGetter: (params) => params.row.acno?.acname || "",
      },
      {
        field: "godown_name",
        headerName: "Godown",
        width: 150,
        valueGetter: (params) => params.row.godownDetails?.godown || "",
      },
      {
        field: "total_qty",
        headerName: "Total Qty",
        width: 120,
        type: "number",
      },
      {
        field: "total_amount",
        headerName: "Total Amount",
        width: 150,
        type: "currency",
      },
      { field: "rmk", headerName: "Narration", width: 200 },
    ],
    detailColumns: [
      {
        field: "item",
        headerName: "Item",
        width:90,
        valueGetter: (params) => params.row.itemDetails?.item || "",
      },
      { field: "qty", headerName: "Qty", width: 20, type: "number" },
      { field: "rate", headerName: "Rate", width: 20, type: "currency" },
      {
        field: "gross_amount",
        headerName: "Gross Amt",
        width: 25,
        type: "currency",
      },
      { field: "st_rate", headerName: "ST Rate", width: 20, type: "number" },
      {
        field: "st_amount",
        headerName: "ST Amount",
        width: 20,
        type: "currency",
      },
      {
        field: "additional_tax",
        headerName: "Additional Tax",
        width: 20,
        type: "currency",
      },
      { field: "amount", headerName: "Amount", width: 20, type: "currency" },
    ],
    summaryFields: [
      { field: "total_qty", label: "Total Quantity", type: "number" },
      {
        field: "total_gross_amount",
        label: "Total Gross Amount",
        type: "currency",
      },
      { field: "total_tax", label: "Total Tax", type: "currency" },
      { field: "total_amount", label: "Total Net Amount", type: "currency" },
    ],
    exportOptions: {
      pdf: true,
      excel: true,
      csv: true,
    },
  },
  stock: {
    title: "Stock Report",
    description: "Comprehensive stock analysis with purchase/sale data",
    apiEndpoint: "/api/reports/stock",
    filters: [
      {
        name: "category",
        label: "Category",
        nameKey: "ic_name",
        type: "select",
        options: "itemCategories",
        apiEndpoint: "/api/setup/item_categories",
        clearable: true,
      },
      {
        name: "godown",
        label: "Godown",
        type: "select",
        nameKey: "godown",
        options: "godowns",
        apiEndpoint: "/api/setup/godowns",
        clearable: true,
      },
      {
        name: "showZero",
        label: "Show Zero Stock",
        type: "checkbox",
        default: false,
      },
    ],
    columns: [
      { field: "item", headerName: "Item", width: 140 },
      { field: "sku", headerName: "SKU", width: 30 },
      {
        field: "category",
        headerName: "Category",
        width: 40,
        valueGetter: (params) => params.row.itemCategories?.ic_name || "",
      },
      // Current Stock Information
      {
        field: "currentStock",
        headerName: "Current Stock",
        width: 30,
        type: "number",
        valueGetter: (params) =>
          params.row.stockAnalysis?.currentStock || params.row.stock || 0,
      },
      {
        field: "currentStockValue",
        headerName: "Stock Value",
        width: 30,
        type: "currency",
        valueGetter: (params) =>
          params.row.stockAnalysis?.currentStockValue || 0,
      },
      // {
      //   field: "potentialSaleValue",
      //   headerName: "Potential Sale Value",
      //   width: 160,
      //   type: "currency",
      //   valueGetter: (params) => params.row.stockAnalysis?.potentialSaleValue || 0,
      // },

      // // Purchase Analysis
      // {
      //   field: "netPurchased",
      //   headerName: "Net Purchased",
      //   width: 130,
      //   type: "number",
      //   valueGetter: (params) => params.row.stockAnalysis?.totalPurchased || 0,
      // },
      // {
      //   field: "avgPurchaseRate",
      //   headerName: "Avg Purchase Rate",
      //   width: 150,
      //   type: "currency",
      //   valueGetter: (params) => params.row.stockAnalysis?.avgPurchaseRate || 0,
      // },
      // {
      //   field: "netPurchaseValue",
      //   headerName: "Total Purchase Value",
      //   width: 160,
      //   type: "currency",
      //   valueGetter: (params) => params.row.stockAnalysis?.totalPurchaseValue || 0,
      // },

      // // Sales Analysis
      // {
      //   field: "netSold",
      //   headerName: "Net Sold",
      //   width: 120,
      //   type: "number",
      //   valueGetter: (params) => params.row.stockAnalysis?.netSold || 0,
      // },
      // {
      //   field: "avgSaleRate",
      //   headerName: "Avg Sale Rate",
      //   width: 140,
      //   type: "currency",
      //   valueGetter: (params) => params.row.stockAnalysis?.avgSaleRate || 0,
      // },
      // {
      //   field: "netSaleValue",
      //   headerName: "Total Sale Value",
      //   width: 150,
      //   type: "currency",
      //   valueGetter: (params) => params.row.stockAnalysis?.netSaleValue || 0,
      // },

      // // Performance Metrics
      // {
      //   field: "profitMargin",
      //   headerName: "Profit Margin (%)",
      //   width: 140,
      //   type: "number",
      //   valueGetter: (params) => params.row.stockAnalysis?.profitMargin || 0,
      //   cellRenderer: (params) => `${params.value}%`,
      // },
      // {
      //   field: "stockTurnover",
      //   headerName: "Stock Turnover (%)",
      //   width: 150,
      //   type: "number",
      //   valueGetter: (params) => params.row.stockAnalysis?.stockTurnover || 0,
      //   cellRenderer: (params) => `${params.value}%`,
      // },

      // // Transaction Counts
      // {
      //   field: "purchaseCount",
      //   headerName: "Purchase Transactions",
      //   width: 160,
      //   type: "number",
      //   valueGetter: (params) => params.row.stockAnalysis?.transactionCounts?.purchases || 0,
      // },
      // {
      //   field: "saleCount",
      //   headerName: "Sale Transactions",
      //   width: 140,
      //   type: "number",
      //   valueGetter: (params) => params.row.stockAnalysis?.transactionCounts?.sales || 0,
      // },
      // {
      //   field: "returnCount",
      //   headerName: "Returns",
      //   width: 100,
      //   type: "number",
      //   valueGetter: (params) => {
      //     const analysis = params.row.stockAnalysis?.transactionCounts;
      //     return (analysis?.purchaseReturns || 0) + (analysis?.saleReturns || 0);
      //   },
      // },
    ],

    // Column Groups for better organization
    // columnGroups: [
    //   {
    //     groupId: "basic",
    //     headerName: "Basic Info",
    //     children: ["item", "sku", "category"]
    //   },
    //   {
    //     groupId: "stock",
    //     headerName: "Current Stock",
    //     children: ["currentStock", "currentStockValue", "potentialSaleValue"]
    //   },
    //   {
    //     groupId: "purchase",
    //     headerName: "Purchase Analysis",
    //     children: ["netPurchased", "avgPurchaseRate", "netPurchaseValue"]
    //   },
    //   {
    //     groupId: "sales",
    //     headerName: "Sales Analysis",
    //     children: ["netSold", "avgSaleRate", "netSaleValue"]
    //   },
    //   {
    //     groupId: "performance",
    //     headerName: "Performance Metrics",
    //     children: ["profitMargin", "stockTurnover"]
    //   },
    //   {
    //     groupId: "transactions",
    //     headerName: "Transaction Summary",
    //     children: ["purchaseCount", "saleCount", "returnCount"]
    //   }
    // ],

    // Default visible columns (others can be toggled)
    defaultVisibleColumns: [
      "item",
      "sku",
      "category",
      "currentStock",
      "currentStockValue",
      "avgPurchaseRate",
      "avgSaleRate",
      "profitMargin",
    ],

    drillDown: {
      enabled: true,
      label: "View Stock Ledger",
      modalTitle: "View Stock Ledger Details",
      fields: [
        {
          name: "dateTo",
          label: "To Date",
          type: "date",
          required: true,
        },
      ],
      linkBuilder: (row, filters) =>
        `/accounting/reports/stockLedger?item=${row.itcd}&godown=${
          filters.godown ? filters.godown : 1
        }&dateFrom=2000-01-01T11%3A00%3A00.000Z&dateTo=${new Date(filters.dateTo).toISOString()}`,
    },

    summaryFields: [
      { field: "total_items", label: "Total Items", type: "number" },
      { field: "total_stock", label: "Total Current Stock", type: "number" },
      { field: "total_value", label: "Total Stock Value", type: "currency" },
      // { field: "total_potential_value", label: "Total Potential Sale Value", type: "currency" },
      // { field: "total_purchase_value", label: "Total Purchase Value", type: "currency" },
      // { field: "total_sale_value", label: "Total Sale Value", type: "currency" },
      // { field: "overall_profit_margin", label: "Overall Profit Margin (%)", type: "percentage" },
      // { field: "total_transactions", label: "Total Transactions", type: "number" },
    ],

    // Enhanced export options
    exportOptions: {
      pdf: {
        enabled: true,
        orientation: "landscape", // Due to many columns
        title: "Stock Analysis Report",
      },
      excel: {
        enabled: true,
        worksheets: [
          {
            name: "Stock Analysis",
            includeAll: true,
          },
          {
            name: "Summary",
            summaryOnly: true,
          },
        ],
      },
      csv: {
        enabled: true,
        filename: "stock_analysis_report",
      },
    },

    // Additional configuration for better UX
    pagination: {
      defaultPageSize: 50,
      pageSizeOptions: [25, 50, 100, 200],
    },

    sorting: {
      defaultSort: [{ field: "item", sort: "asc" }],
      multiSort: true,
    },

    filtering: {
      enabled: true,
      quickFilter: true,
    },
  },
  stockActivity: {
    title: "Stock Activity Report",
    description: "Product-wise stock movement analysis",
    apiEndpoint: "/api/reports/stockActivity",
    filters: [
      {
        name: "dateFrom",
        label: "From Date",
        type: "date",
        required: true,
      },
      {
        name: "dateTo",
        label: "To Date",
        type: "date",
        required: true,
      },
      {
        name: "product",
        label: "Product",
        type: "select",
        options: "products",
        apiEndpoint: "/api/setup/items",
        valueKey: "itcd",
        nameKey: "item",
        clearable: true,
      },
      {
        name: "category",
        label: "Category",
        type: "select",
        options: "itemCategories",
        apiEndpoint: "/api/setup/item_categories",
        nameKey: "ic_name",
        clearable: true,
      },
      {
        name: "godown",
        label: "Godown",
        type: "select",
        nameKey: "godown",
        options: "godowns",
        apiEndpoint: "/api/setup/godowns",
        clearable: true,
      },
    ],
    columns: [
      { field: "product_code", headerName: "Code", width: 15 },
      { field: "product_name", headerName: "Product Name", width: 80 },
      { field: "category", headerName: "Category", width: 30 },
      {
        field: "opening_stock",
        headerName: "Open Stock",
        width: 15,
        type: "number",
      },
      {
        field: "purchase_qty",
        headerName: "Pur Qty",
        width: 15,
        type: "number",
      },
      {
        field: "purchase_ret_qty",
        headerName: "P.R Qty",
        width: 15,
        type: "number",
      },
      {
        field: "transfer_in_qty",
        headerName: "T-IN QTY",
        width: 15,
        type: "number",
      },
      {
        field: "transfer_out_qty",
        headerName: "T-OUT QTY",
        width: 15,
        type: "number",
      },
      { field: "sale_qty", headerName: "Sa QTY", width: 15, type: "number" },
      {
        field: "sale_ret_qty",
        headerName: "SALE RET QTY",
        width: 15,
        type: "number",
      },
      { field: "pos_qty", headerName: "POS QTY", width: 15, type: "number" },
      {
        field: "pos_ret_qty",
        headerName: "POS-R QTY",
        width: 15,
        type: "number",
      },
      {
        field: "stock_balance",
        headerName: "St Bal",
        width: 15,
        type: "number",
      },
    ],

    summaryFields: [
      { field: "total_in", label: "Total In", type: "number" },
      { field: "total_out", label: "Total Out", type: "number" },

      { field: "total_stock", label: "Total Stock", type: "number" },
    ],
    exportOptions: {
      pdf: true,
      excel: true,
      csv: true,
    },
  },
  tradingMargin: {
    title: "Trading Margin Report",
    description:
      "Profitability analysis by item (Purchase, Sales, Returns, POS)",
    apiEndpoint: "/api/reports/tradingMargin",
    filters: [
      {
        name: "dateFrom",
        label: "From Date",
        type: "date",
        required: true,
      },
      {
        name: "dateTo",
        label: "To Date",
        type: "date",
        required: true,
      },
      {
        name: "item",
        valueKey: "itcd",
        nameKey: "item",
        label: "Item",
        type: "select",
        options: "items",
        apiEndpoint: "/api/setup/items",
        clearable: true,
      },
      {
        name: "category",
        label: "Category",
        nameKey: "ic_name",
        type: "select",
        options: "itemCategories",
        apiEndpoint: "/api/setup/item_categories",
        clearable: true,
      },
    ],
    columns: [
      {
        field: "item",
        headerName: "Item",
        width: 50,
        valueGetter: (params) => params.row.itemDetails?.item || "",
      },
      {
        field: "category",
        headerName: "Cat",
        width: 200,
        valueGetter: (params) =>
          params.row.itemDetails?.itemCategories?.ic_name || "",
      },

      // --- Purchases ---
      {
        field: "purchase_qty",
        headerName: "Pur Qty",
        width: 130,
        type: "number",
      },
      {
        field: "purchase_amount",
        headerName: "Pur Amt",
        width: 150,
        type: "currency",
      },
      {
        field: "purchase_return_qty",
        headerName: "P.R Qty",
        width: 160,
        type: "number",
      },
      {
        field: "purchase_return_amount",
        headerName: "P.R Amt",
        width: 170,
        type: "currency",
      },

      // --- Sales ---
      { field: "sale_qty", headerName: "Sa Qty", width: 120, type: "number" },
      {
        field: "sale_amount",
        headerName: "Sa Amt",
        width: 150,
        type: "currency",
      },
      {
        field: "sale_return_qty",
        headerName: "S.R Qty",
        width: 150,
        type: "number",
      },
      {
        field: "sale_return_amount",
        headerName: "S.R Amt",
        width: 160,
        type: "currency",
      },

      // --- POS ---
      { field: "pos_qty", headerName: "Pos Qty", width: 110, type: "number" },
      {
        field: "pos_amount",
        headerName: "POS Amt",
        width: 140,
        type: "currency",
      },

      // --- Averages and Margins ---
      {
        field: "avg_purchase_rate",
        headerName: "Avg P.Rate",
        width: 150,
        type: "currency",
      },
      {
        field: "avg_sale_rate",
        headerName: "Avg S.Rate",
        width: 150,
        type: "currency",
      },
      { field: "margin", headerName: "Margin", width: 120, type: "currency" },
      {
        field: "margin_percent",
        headerName: "Margin %",
        width: 20,
        type: "percent",
      },
    ],
    summaryFields: [
      {
        field: "total_purchase_qty",
        label: "Total Purchase Qty",
        type: "number",
      },
      {
        field: "total_purchase_amount",
        label: "Total Purchase Amount",
        type: "currency",
      },
      {
        field: "total_purchase_return_qty",
        label: "Total Purchase Return Qty",
        type: "number",
      },
      {
        field: "total_purchase_return_amount",
        label: "Total Purchase Return Amt",
        type: "currency",
      },

      { field: "total_sale_qty", label: "Total Sale Qty", type: "number" },
      {
        field: "total_sale_amount",
        label: "Total Sale Amount",
        type: "currency",
      },
      {
        field: "total_sale_return_qty",
        label: "Total Sale Return Qty",
        type: "number",
      },
      {
        field: "total_sale_return_amount",
        label: "Total Sale Return Amt",
        type: "currency",
      },

      { field: "total_pos_qty", label: "Total POS Qty", type: "number" },
      {
        field: "total_pos_amount",
        label: "Total POS Amount",
        type: "currency",
      },

      { field: "total_margin", label: "Total Margin", type: "currency" },
      { field: "avg_margin_percent", label: "Avg Margin %", type: "percent" },
    ],
    exportOptions: {
      pdf: true,
      excel: true,
      csv: true,
    },
  },
  stockLedger: {
    showSummary : true,
    title: "Stock Ledger Report",
    description: "Detailed movement of stock items over time",
    apiEndpoint: "/api/reports/stockLedger",
    filters: [
      {
        name: "dateFrom",
        label: "From Date",
        type: "date",
        required: true,
      },
      {
        name: "dateTo",
        label: "To Date",
        type: "date",
        required: true,
      },
      {
        name: "item",
        label: "Item",
        type: "select",
        nameKey: "item",
        valueKey: "itcd",
        options: "items",
        apiEndpoint: "/api/setup/items",
        required: true,
      },
      {
        name: "godown",
        label: "Godown",
        type: "select",
        nameKey: "godown",
        options: "godowns",
        apiEndpoint: "/api/setup/godowns",
        clearable: true,
      },
    ],
    columns: [
      { field: "date", headerName: "Date", width: 20, type: "date" },
      { field: "transaction_no", headerName: "Trans No", width: 20 },
      { field: "transaction_type", headerName: "Trans Type", width: 35 },
      { field: "vendor_customer", headerName: "Vendor/Customer", width: 100 },
      {
        field: "opening_qty",
        headerName: "Qty Opening",
        width: 25,
        type: "number",
      },
      { field: "qty_in", headerName: "Qty In", width: 25, type: "number" },
      { field: "qty_out", headerName: "Qty Out", width: 25, type: "number" },
      {
        field: "closing_qty",
        headerName: "Qty Closing",
        width: 25,
        type: "number",
      },
    ],
    detailColumns: [
      {
        field: "item",
        headerName: "Item",
        width: 200,
        valueGetter: (params) => params.row.itemDetails?.item || "",
      },
      { field: "qty", headerName: "Qty", width: 100, type: "number" },
      { field: "rate", headerName: "Rate", width: 100, type: "currency" },
      {
        field: "gross_amount",
        headerName: "Gross Amount",
        width: 150,
        type: "currency",
      },
      { field: "st_rate", headerName: "ST Rate", width: 100, type: "number" },
      {
        field: "st_amount",
        headerName: "ST Amount",
        width: 150,
        type: "currency",
      },
      {
        field: "additional_tax",
        headerName: "Additional Tax",
        width: 150,
        type: "currency",
      },
      { field: "camt", headerName: "Amount", width: 150, type: "currency" },
    ],
    summaryFields: [
      { field: "total_in", label: "Total In", type: "number" },
      { field: "total_out", label: "Total Out", type: "number" },
      { field: "net_movement", label: "Net Movement", type: "number" },
      { field: "closing_balance", label: "Closing Balance", type: "number" },
    ],
    exportOptions: {
      pdf: true,
      excel: true,
      csv: true,
    },
  },
  posTransactions: {
    showSummary : true,
    title: "POS Transactions Report",
    description: "Detailed report of all Point of Sale transactions",
    apiEndpoint: "/api/reports/posTransactions",
    filters: [
      {
        name: "dateFrom",
        label: "From Date",
        type: "date",
        required: true,
      },
      {
        name: "dateTo",
        label: "To Date",
        type: "date",
        required: true,
      },
      {
        name: "customer",
        label: "Customer",
        type: "select",
        nameKey: "acname",
        valueKey: "acno",
        options: "customers",
        apiEndpoint: "/api/accounts/acno?macno=001",
        clearable: true,
      },
      {
        name: "paymentMode",
        label: "Payment Mode",
        type: "select",
        options: [
          { value: "all", label: "All" },
          { value: "cash", label: "Cash" },
          { value: "card", label: "Card" },
          { value: "upi", label: "UPI" },
          { value: "credit", label: "Credit" },
        ],
        default: "all",
      },
    ],
    columns: [
      { field: "dateD", headerName: "Date", width: 20, type: "date" },
      { field: "vr_no", headerName: "Vr #", width: 20 },
      { field: "invoice_no", headerName: "Invoice No", width: 35 },
      {
        field: "customer_name",
        headerName: "Customer",
        width: 40,
        valueGetter: (params) => params.row.acno?.acname || "Walk-in Customer",
      },
      { field: "payment_mode", headerName: "Payment Mode", width: 40 },
      {
        field: "total_qty",
        headerName: "Total Qty",
        width: 20,
        type: "number",
      },
      {
        field: "total_amount",
        headerName: "Total Amount",
        width: 40,
        type: "currency",
      },
      {
        field: "discount",
        headerName: "Discount",
        width: 20,
        type: "currency",
      },
      {
        field: "net_amount",
        headerName: "Net Amount",
        width: 40,
        type: "currency",
      },
    ],
    detailColumns: [
      {
        field: "item",
        headerName: "Item",
        width: 200,
        valueGetter: (params) => params.row.itemDetails?.item || "",
      },
      { field: "qty", headerName: "Qty", width: 100, type: "number" },
      { field: "rate", headerName: "Rate", width: 100, type: "currency" },
      {
        field: "gross_amount",
        headerName: "Amount",
        width: 150,
        type: "currency",
      },
      {
        field: "discount",
        headerName: "Line Discount",
        width: 150,
        type: "currency",
      },
    ],
    summaryFields: [
      {
        field: "total_transactions",
        label: "Total Transactions",
        type: "number",
      },
      { field: "total_qty", label: "Total Quantity", type: "number" },
      { field: "total_amount", label: "Total Amount", type: "currency" },
      { field: "total_discount", label: "Total Discount", type: "currency" },
      {
        field: "total_net_amount",
        label: "Total Net Amount",
        type: "currency",
      },
    ],
    exportOptions: {
      pdf: true,
      excel: true,
      csv: true,
    },
  },
  accountLedger: {
    showSummary : true,
    title: "Account Ledger",
    description:
      "Detailed ledger entries for a specific account showing running balance",
    apiEndpoint: "/api/reports/accountLedger",
    filters: [
      { name: "dateFrom", label: "From Date", type: "date", required: true },
      { name: "dateTo", label: "To Date", type: "date", required: true },
      {
        name: "account",
        label: "Account",
        type: "select",
        nameKey: "acname",
        valueKey: "acno",
        options: "accounts",
        apiEndpoint: "/api/accounts/acno",
        required: true,
      },
    ],
    columns: [
      { field: "date", headerName: "Date", width: 40, type: "date" },
      { field: "vr_no", headerName: "Voucher No", width: 40 },
      { field: "tran_type", headerName: "Type", width: 75 },
      { field: "debit", headerName: "Debit", width: 40, type: "currency" },
      { field: "credit", headerName: "Credit", width: 40, type: "currency" },
      { field: "balance", headerName: "Balance", width: 40, type: "currency" },
    ],
    summaryFields: [
      {
        field: "debit",
        label: "Total Debit",
        type: "currency",
      },
      {
        field: "credit",
        label: "Total Credit",
        type: "currency",
      },
      {
        field: "closing",
        label: "Balance",
        type: "currency",
      },
    ],
    detailColumns: [
      {
        field: "item",
        headerName: "Item",
        width: 200,
        valueGetter: (params) => params.row.itemDetails?.item || "",
      },
      { field: "qty", headerName: "Qty", width: 100, type: "number" },
      { field: "rate", headerName: "Rate", width: 100, type: "currency" },
      {
        field: "gross_amount",
        headerName: "Gross Amount",
        width: 150,
        type: "currency",
      },
      { field: "st_rate", headerName: "ST Rate", width: 100, type: "number" },
      {
        field: "st_amount",
        headerName: "ST Amount",
        width: 150,
        type: "currency",
      },
      {
        field: "additional_tax",
        headerName: "Additional Tax",
        width: 150,
        type: "currency",
      },
      { field: "camt", headerName: "Amount", width: 150, type: "currency" },
    ],

    exportOptions: { pdf: true, excel: true, csv: true },
  },

  accountsActivity: {
    title: "Accounts Activity Report",
    description:
      "Summarized activity for all accounts showing opening, transactions, and closing",
    apiEndpoint: "/api/reports/accountsActivity",
    filters: [
      { name: "dateFrom", label: "From Date", type: "date", required: true },
      { name: "dateTo", label: "To Date", type: "date", required: true },
    ],
    columns: [
      { field: "account", headerName: "Account", width: 115 },
      {
        field: "opening_balance",
        headerName: "Opening Balance",
        width: 40,
        type: "currency",
      },
      { field: "debit", headerName: "Debit", width: 40, type: "currency" },
      { field: "credit", headerName: "Credit", width: 40, type: "currency" },
      {
        field: "closing_balance",
        headerName: "Closing Balance",
        width: 40,
        type: "currency",
      },
    ],

    summaryFields: [
      {
        field: "total_accounts",
        label: "Total Accounts",
        type: "text",
      },
      {
        field: "total_debit",
        label: "Total Debit",
        type: "currency",
      },
      {
        field: "total_credit",
        label: "Total Credit",
        type: "currency",
      },
    ],
    exportOptions: { pdf: true, excel: true, csv: true },
  },

  trialBalance: {
    title: "Trial Balance",
    description:
      "A summary of all ledger accounts with debit and credit totals to verify ledger integrity",
    apiEndpoint: "/api/reports/trialBalance",
    filters: [
      { name: "dateTo", label: "As of Date", type: "date", required: true },
    ],
    columns: [
      { field: "account", field2: "acname", headerName: "Account", width: 155 },
      { field: "debit", headerName: "Debit", width: 40, type: "currency" },
      { field: "credit", headerName: "Credit", width: 40, type: "currency" },
      { field: "balance", headerName: "Balance", width: 40, type: "currency" },
    ],

    summaryFields: [
      {
        field: "total_debit",
        label: "Total Debit",
        type: "currency",
      },
      {
        field: "total_credit",
        label: "Total Credit",
        type: "currency",
      },
    ],
    drillDown: {
      enabled: true,
      label: "View Ledger",
      modalTitle: "View Account Ledger Details",
      // fields: [
      //   {
      //     name: "dateTo",
      //     label: "To Date",
      //     type: "date",
      //     required: true,
      //   },
      // ],
      linkBuilder: (row, filters) =>
        `/accounting/reports/accountLedger?account=${
          row.acno
        }&dateFrom=2000-01-01T11%3A00%3A00.000Z&dateTo=${new Date(filters.dateTo).toISOString()}`,
    },
    exportOptions: { pdf: true, excel: true, csv: true },
  },
  // config.js
  stockMetrics: {
    title: "Stock Metrics by Godown",
    description: "Detailed view of stock quantities across all godowns",
    apiEndpoint: "/api/reports/stockMetrics",
    filters: [
      {
        name: "category",
        label: "Category",
        nameKey: "ic_name",
        type: "select",
        options: "itemCategories",
        apiEndpoint: "/api/setup/item_categories",
        clearable: true,
      },
      {
        name: "showZero",
        label: "Show Zero Stock",
        type: "checkbox",
        default: false,
      },
    ],
    dynamicColumns: true, // Flag to indicate we'll generate columns dynamically
    columns: [
      { field: "item", headerName: "Item", width: 105 },
      { field: "sku", headerName: "SKU", width: 30 },
      {
        field: "category",
        headerName: "Category",
        width: 50,
        valueGetter: (params) => params.row.itemCategories?.ic_name || "",
      },
      {
        field: "totalStock",
        headerName: "Total Stock",
        width: 30,
        type: "number",
        valueGetter: (params) => params.row.totalStock || 0,
      },
    ],
    summaryFields: [
      { field: "total_items", label: "Total Items", type: "number" },
      { field: "total_stock", label: "Total Current Stock", type: "number" },
    ],
    exportOptions: {
      pdf: true,
      excel: true,
      csv: true,
    },
  },

 orderBalance: {
    title: "Order Balance Report",
    apiEndpoint: "/api/reports/orderBalance",
    description: "Shows the balance between ordered and received/delivered quantities",
    filters: [
      { name: "dateFrom", type: "date", label: "From Date" },
      { name: "dateTo", type: "date", label: "To Date" },
      { name: "orderType", type: "select", label: "Order Type", 
        options: [
          { value: "all", label: "All" },
          { value: "4", label: "Purchase Order" },
          { value: "6", label: "Sales Order" }
        ] 
      },
       
      {
        name: "account",
        label: "Account",
        type: "select",
        nameKey: "acname",
        valueKey: "acno",
        options: "accounts",
        apiEndpoint: "/api/accounts/acno?macno=001,006",
        required: true,
      },
      {
        name: "godown",
        nameKey: "godown",
        label: "Godown",
        type: "select",
        options: "godowns",
        apiEndpoint: "/api/setup/godowns",
        clearable: true,
      },
    ],
    columns: [
      { field: "customer", headerName: "Customer", width: 40},
      { field: "orderNo", headerName: "Order No", width: 20},
      { field: "orderDate", headerName: "Date", width: 30, valueGetter: (params) => new Date(params.row.orderDate).toLocaleDateString() },
      { field: "totalOrdered", headerName: "Total Ordered", width: 30 },
      { field: "totalPurchased", headerName: "Total Received", width: 30 },
      { field: "totalReturned", headerName: "total Returned", width: 30 },
      { field: "totalNetReceived", headerName: "Total Net", width: 40 },
      { field: "totalPending", headerName: "Total Pending", width: 40 },
    ],
    summaryFields: [
      { field: "totalPurchased", label: "Total Purchased", type: "number" },
      { field: "totalNetReceived", label: "Total Net Received", type: "number" },
    ],
    exportOptions: {
      pdf: true,
      excel: true,
      
    },
  },
  customerAging: {
  title: "Customer Aging Report",
  description: "Aging analysis of customer accounts to track outstanding balances by time periods",
  apiEndpoint: "/api/reports/customerAging",
  filters: [
    { 
      name: "reportDate", 
      label: "As of Date", 
      type: "date", 
      required: true 
    },
    {
      name: "customer",
      label: "Customer",
      type: "select",
      nameKey: "acname",
      valueKey: "acno",
      options: "accounts",
      apiEndpoint: "/api/accounts/acno?macno=001",
      required: true,
    },
  ],
  columns: [
    { field: "customerName", headerName: "Customer", width: 200 },
    { field: "invoiceNo", headerName: "Invoice No", width: 120 },
    { field: "invoiceDate", headerName: "Invoice Date", width: 120, 
      valueGetter: (params) => new Date(params.row.invoiceDate).toLocaleDateString() 
    },
    { field: "dueDate", headerName: "Due Date", width: 120, 
      valueGetter: (params) => new Date(params.row.dueDate).toLocaleDateString() 
    },
    { field: "invoiceAmount", headerName: "Invoice Amount", width: 150, type: "currency" },
    { field: "outstandingAmount", headerName: "Outstanding", width: 150, type: "currency" },
    { field: "daysOutstanding", headerName: "Days Outstanding", width: 130, type: "number" },
    { field: "currentAmount", headerName: "Current", width: 120, type: "currency" },
    { field: "days1To30", headerName: "1-30 Days", width: 120, type: "currency" },
    { field: "days31To60", headerName: "31-60 Days", width: 120, type: "currency" },
    { field: "days61To90", headerName: "61-90 Days", width: 120, type: "currency" },
    { field: "days91To120", headerName: "91-120 Days", width: 130, type: "currency" },
    { field: "daysOver120", headerName: "Over 120 Days", width: 130, type: "currency" },
  ],
  summaryFields: [
    {
      field: "totalInvoiceAmount",
      label: "Total Invoice Amount",
      type: "currency",
    },
    {
      field: "totalOutstanding",
      label: "Total Outstanding",
      type: "currency",
    },
    {
      field: "currentAmount",
      label: "Current (Not Due)",
      type: "currency",
    },
    {
      field: "days1To30",
      label: "1-30 Days",
      type: "currency",
    },
    {
      field: "days31To60",
      label: "31-60 Days",
      type: "currency",
    },
    {
      field: "days61To90",
      label: "61-90 Days",
      type: "currency",
    },
    {
      field: "days91To120",
      label: "91-120 Days",
      type: "currency",
    },
    {
      field: "daysOver120",
      label: "Over 120 Days",
      type: "currency",
    },
    {
      field: "averageDaysOutstanding",
      label: "Average Days Outstanding",
      type: "number",
    },
  ],
  drillDown: {
    enabled: true,
    label: "View Customer Ledger",
    modalTitle: "View Customer Account Details",
    linkBuilder: (row, filters) =>
      `/accounting/reports/accountLedger?account=${
        row.customer || row.customerCode
      }&dateFrom=2000-01-01T11%3A00%3A00.000Z&dateTo=${new Date(filters.reportDate).toISOString()}`,
  },
  exportOptions: { 
    pdf: true, 
    excel: true
  },
}
};
