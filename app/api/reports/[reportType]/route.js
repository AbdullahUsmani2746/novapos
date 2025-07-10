// app/api/reports/[reportType]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { REPORT_CONFIG } from "@/components/Reports/config";
import { format } from "date-fns";

export async function GET(request, { params }) {
  const { reportType } = await params;
  console.log(reportType);
  const config = REPORT_CONFIG[reportType];

  if (!config) {
    return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const filters = {};

  // Process filters based on config
  config.filters.forEach((filter) => {
    const value = searchParams.get(filter.name);
    if (value !== null && value !== "") {
      filters[filter.name] = value;
    }
  });

  console.log(config);

  try {
    let data = [];
    let summary = {};

    switch (reportType) {
      case "purchase":
        data = await getPurchaseReport(filters);
        summary = calculatePurchaseSummary(data);
        break;
      case "purchaseReturn":
        data = await getPurchaseReturnReport(filters);
        summary = calculatePurchaseReturnSummary(data);
        break;
      case "sale":
        data = await getSaleReport(filters);
        summary = calculateSaleSummary(data);
        break;
      case "saleReturn":
        data = await getSaleReturnReport(filters);
        summary = calculateSaleReturnSummary(data);
        break;
      case "stock":
        data = await getStockReport(filters);
        summary = calculateStockSummary(data);
        break;
      case "stockActivity":
        data = await getStockActivityReport(filters);
        summary = calculateStockActivitySummary(data);

        break;
      case "stockLedger":
        data = await getStockLedgerReport(filters);
        summary = calculateStockLedgerSummary(data);
        break;
      case "posTransactions":
        data = await getPOSTransactionsReport(filters);
        summary = calculatePOSSummary(data);
        break;
      case "tradingMargin":
        data = await getTradingMarginReport(filters);
        summary = calculateTradingMarginSummary(data);
        break;
      default:
        return NextResponse.json(
          { error: "Invalid report type" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      data,
      summary,
      config: {
        title: config.title,
        description: config.description,
        columns: config.columns,
        detailColumns: config.detailColumns,
        exportOptions: config.exportOptions,
      },
    });
  } catch (error) {
    console.error(`Error generating ${reportType} report:`, error);
    return NextResponse.json(
      { error: "Failed to generate report", details: error.message },
      { status: 500 }
    );
  }
}

// Helper functions for each report type
async function getPurchaseReport(filters) {
  const where = {
    tran_code: 4, // Purchase transaction code
    dateD: {
      gte: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
      lte: filters.dateTo ? new Date(filters.dateTo) : undefined,
    },
  };

  console.log("filyter Vendor: ", filters.vendor);
  if (filters.vendor) {
    where.pycd = filters.vendor;
  }

  if (filters.godown) {
    where.godown = parseInt(filters.godown);
  }

  const transactions = await prisma.transactionsMaster.findMany({
    where,
    include: {
      acno: true,
      godownDetails: true,
      transactions: {
        include: {
          itemDetails: true,
          godownDetails: true,
        },
      },
    },
    orderBy: {
      dateD: "desc",
    },
  });

  return transactions.map((t) => {
    // Filter sub_tran_id within each transactions array
    const filteredTransactions = t.transactions.filter((tran) =>
      [1, 2].includes(tran.sub_tran_id)
    );

    return {
      ...t,
      transactions: filteredTransactions,
      dateD: new Date(t.dateD).toLocaleDateString(),
      total_qty: filteredTransactions.reduce(
        (sum, line) => sum + (line.qty || 0),
        0
      ),
      total_amount: filteredTransactions.reduce(
        (sum, line) => sum + (line.camt || 0),
        0
      ),
    };
  });
}

function calculatePurchaseSummary(data) {
  return {
    total_qty: data.reduce((sum, t) => sum + t.total_qty, 0),
    total_gross_amount: data.reduce(
      (sum, t) =>
        sum +
        t.transactions.reduce((sum, line) => sum + (line.gross_amount || 0), 0),
      0
    ),
    total_tax: data.reduce(
      (sum, t) =>
        sum +
        t.transactions.reduce((sum, line) => sum + (line.st_amount || 0), 0),
      0
    ),
    total_amount: data.reduce((sum, t) => sum + t.total_amount, 0),
  };
}

async function getPurchaseReturnReport(filters) {
  const where = {
    tran_code: 9, // Purchase return transaction code
    dateD: {
      gte: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
      lte: filters.dateTo ? new Date(filters.dateTo) : undefined,
    },
  };

  if (filters.vendor) {
    where.pycd = filters.vendor;
  }

  if (filters.godown) {
    where.godown = parseInt(filters.godown);
  }

  const transactions = await prisma.transactionsMaster.findMany({
    where,
    include: {
      acno: true,
      godownDetails: true,
      transactions: {
        include: {
          itemDetails: true,
          godownDetails: true,
        },
      },
    },
    orderBy: {
      dateD: "desc",
    },
  });

  return transactions.map((t) => {
    // Filter sub_tran_id within each transactions array
    const filteredTransactions = t.transactions.filter((tran) =>
      [1, 2].includes(tran.sub_tran_id)
    );

    return {
      ...t,
      transactions: filteredTransactions,
      dateD: new Date(t.dateD).toLocaleDateString(),
      total_qty: filteredTransactions.reduce(
        (sum, line) => sum + (line.qty || 0),
        0
      ),
      total_amount: filteredTransactions.reduce(
        (sum, line) => sum + (line.camt || 0),
        0
      ),
    };
  });
}

function calculatePurchaseReturnSummary(data) {
  return {
    total_qty: data.reduce((sum, t) => sum + t.total_qty, 0),
    total_gross_amount: data.reduce(
      (sum, t) =>
        sum +
        t.transactions.reduce((sum, line) => sum + (line.gross_amount || 0), 0),
      0
    ),
    total_tax: data.reduce(
      (sum, t) =>
        sum +
        t.transactions.reduce((sum, line) => sum + (line.st_amount || 0), 0),
      0
    ),
    total_amount: data.reduce((sum, t) => sum + t.total_amount, 0),
  };
}

async function getSaleReport(filters) {
  const where = {
    tran_code: 6, // Sale transaction code
    dateD: {
      gte: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
      lte: filters.dateTo ? new Date(filters.dateTo) : undefined,
    },
  };

  if (filters.customer) {
    where.pycd = filters.customer;
  }

  if (filters.godown) {
    where.godown = parseInt(filters.godown);
  }

  const transactions = await prisma.transactionsMaster.findMany({
    where,
    include: {
      acno: true,
      godownDetails: true,
      transactions: {
        include: {
          itemDetails: true,
          godownDetails: true,
        },
      },
    },
    orderBy: {
      dateD: "desc",
    },
  });

  return transactions.map((t) => {
    // Filter sub_tran_id within each transactions array
    const filteredTransactions = t.transactions.filter((tran) =>
      [1, 2].includes(tran.sub_tran_id)
    );

    return {
      ...t,
      transactions: filteredTransactions,
      dateD: new Date(t.dateD).toLocaleDateString(),
      total_qty: filteredTransactions.reduce(
        (sum, line) => sum + (line.qty || 0),
        0
      ),
      total_amount: filteredTransactions.reduce(
        (sum, line) => sum + (line.damt || 0),
        0
      ),
    };
  });
}

function calculateSaleSummary(data) {
  return {
    total_qty: data.reduce((sum, t) => sum + t.total_qty, 0),
    total_gross_amount: data.reduce(
      (sum, t) =>
        sum +
        t.transactions.reduce((sum, line) => sum + (line.gross_amount || 0), 0),
      0
    ),
    total_tax: data.reduce(
      (sum, t) =>
        sum +
        t.transactions.reduce((sum, line) => sum + (line.st_amount || 0), 0),
      0
    ),
    total_amount: data.reduce((sum, t) => sum + t.total_amount, 0),
  };
}

async function getSaleReturnReport(filters) {
  const where = {
    tran_code: 10, // Sale return transaction code
    dateD: {
      gte: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
      lte: filters.dateTo ? new Date(filters.dateTo) : undefined,
    },
  };

  if (filters.customer) {
    where.pycd = filters.customer;
  }

  if (filters.godown) {
    where.godown = parseInt(filters.godown);
  }

  const transactions = await prisma.transactionsMaster.findMany({
    where,
    include: {
      acno: true,
      godownDetails: true,
      transactions: {
        include: {
          itemDetails: true,
          godownDetails: true,
        },
      },
    },
    orderBy: {
      dateD: "desc",
    },
  });

  return transactions.map((t) => {
    // Filter sub_tran_id within each transactions array
    const filteredTransactions = t.transactions.filter((tran) =>
      [1, 2].includes(tran.sub_tran_id)
    );

    return {
      ...t,
      transactions: filteredTransactions,
      dateD: new Date(t.dateD).toLocaleDateString(),
      total_qty: filteredTransactions.reduce(
        (sum, line) => sum + (line.qty || 0),
        0
      ),
      total_amount: filteredTransactions.reduce(
        (sum, line) => sum + (line.damt || 0),
        0
      ),
    };
  });
}

function calculateSaleReturnSummary(data) {
  return {
    total_qty: data.reduce((sum, t) => sum + t.total_qty, 0),
    total_gross_amount: data.reduce(
      (sum, t) =>
        sum +
        t.transactions.reduce((sum, line) => sum + (line.gross_amount || 0), 0),
      0
    ),
    total_tax: data.reduce(
      (sum, t) =>
        sum +
        t.transactions.reduce((sum, line) => sum + (line.st_amount || 0), 0),
      0
    ),
    total_amount: data.reduce((sum, t) => sum + t.total_amount, 0),
  };
}

async function getStockReport(filters) {
  const where = {};

  if (filters.category) {
    where.ic_id = parseInt(filters.category);
  }

  if (filters.showZero === "false") {
    where.stock = { gt: 0 };
  }

  const items = await prisma.item.findMany({
    where,
    include: {
      itemCategories: true,
    },
    orderBy: {
      item: "asc",
    },
  });

  return items;
}

function calculateStockSummary(data) {
  return {
    total_items: data.length,
    total_stock: data.reduce((sum, item) => sum + (item.stock || 0), 0),
    total_value: data.reduce(
      (sum, item) => sum + (item.stock || 0) * (item.price || 0),
      0
    ),
  };
}

async function getStockActivityReport(filters) {
  console.log("Activity Entered");
  console.log("Filters: ", filters);

  const where = {
    ...(filters.dateFrom || filters.dateTo
      ? {
          dateD: {
            ...(filters.dateFrom && { gte: new Date(filters.dateFrom) }),
            ...(filters.dateTo && { lte: new Date(filters.dateTo) }),
          },
        }
      : {}),
    ...(filters.godown && { godown: parseInt(filters.godown) }),
    ...(filters.product && {
      transactions: {
        some: {
          itcd: parseInt(filters.product),
          NOT: { sub_tran_id: 3 },
        },
      },
    }),
  };

  const transactions = await prisma.transactionsMaster.findMany({
    where,
    include: {
      transactions: {
        ...(filters.product
          ? {
              where: {
                itcd: parseInt(filters.product),
                NOT: { sub_tran_id: 3 },
              },
            }
          : {
              where: {
                NOT: { sub_tran_id: 3 },
              },
            }),
        include: {
          itemDetails: {
            include: {
              itemCategories: true,
            },
          },
        },
      },
    },
    orderBy: { dateD: "asc" },
  });

  const formattedData = [];

  // Get opening stock: single value or map
  const openingData = await getOpeningStock(
    filters.product,
    filters.godown,
    filters.dateFrom
  );

  let runningBalanceMap = {}; // only needed when all products

  transactions.forEach((t) => {
    (t.transactions || []).forEach((line) => {
      const productId = line.itcd;
      const qty = line.qty || 0;

      const openingStock = filters.product
        ? openingData
        : (openingData[productId] || 0);

      // Initialize running balance per product
      if (!runningBalanceMap[productId]) {
        runningBalanceMap[productId] = openingStock;
      }

      const record = {
        tranCode: t.tran_code,
        date: t.dateD,
        product_code: productId,
        product_name: line.itemDetails?.item || "",
        category: line.itemDetails?.itemCategories?.ic_name || "",
        opening_stock: runningBalanceMap[productId],
        purchase_qty: 0,
        purchase_ret_qty: 0,
        total_qty: 0,
        sale_qty: 0,
        sale_ret_qty: 0,
        pos_qty: 0,
        stock_balance: 0,
      };

      switch (t.tran_code) {
        case 4:
          record.purchase_qty = qty;
          break;
        case 9:
          record.purchase_ret_qty = qty;
          break;
        case 6:
          record.sale_qty = qty;
          break;
        case 10:
          record.sale_ret_qty = qty;
          break;
        case 5:
          record.pos_qty = qty;
          break;
      }

      const qty_in = record.purchase_qty + record.sale_ret_qty;
      const qty_out =
        record.sale_qty + record.purchase_ret_qty + record.pos_qty;

      record.total_qty = qty_in - qty_out;

      runningBalanceMap[productId] += record.total_qty;
      record.stock_balance = runningBalanceMap[productId];

      formattedData.push(record);
    });
  });

  console.log("Final Stock Report:", formattedData.length, "rows");
  return formattedData;
}

function calculateStockActivitySummary(data) {
  const total_in = data
    .filter((item) => item.tranCode === 4 || item.tranCode === 10)
    .reduce((sum, item) => sum + (item.qty || 0), 0);

  const total_out = data
    .filter((item) => item.tranCode === 6 || item.tranCode === 9)
    .reduce((sum, item) => sum + (item.qty || 0), 0);

  return {
    total_in,
    total_out,
    net_movement: total_in - total_out,
    total_amount: data.reduce((sum, item) => sum + (item.amount || 0), 0),
  };
}

async function getTradingMarginReport(filters) {
  const where = {
    dateD: {
      gte: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
      lte: filters.dateTo ? new Date(filters.dateTo) : undefined,
    },
  };

  if (filters.item) {
    where.transactions = {
      some: {
        itcd: parseInt(filters.item),
      },
    };
  }

  // Get all purchase and sale transactions
  const purchaseTransactions = await prisma.transactionsMaster.findMany({
    where: {
      ...where,
      tran_code: 4, // Purchase
    },
    include: {
      transactions: {
        include: {
          itemDetails: {
            include: {
              itemCategories: true,
            },
          },
        },
      },
    },
  });

  const saleTransactions = await prisma.transactionsMaster.findMany({
    where: {
      ...where,
      tran_code: 6, // Sale
    },
    include: {
      transactions: {
        include: {
          itemDetails: {
            include: {
              itemCategories: true,
            },
          },
        },
      },
    },
  });

  // Group by item
  const itemMap = new Map();

  // Process purchases
  purchaseTransactions.forEach((t) => {
    t.transactions.forEach((line) => {
      if (!line.itcd) return;

      const itemId = line.itcd;
      if (!itemMap.has(itemId)) {
        itemMap.set(itemId, {
          itemDetails: line.itemDetails,
          purchase_qty: 0,
          purchase_amount: 0,
          sale_qty: 0,
          sale_amount: 0,
        });
      }

      const itemData = itemMap.get(itemId);
      itemData.purchase_qty += line.qty || 0;
      itemData.purchase_amount += line.camt || 0;
    });
  });

  // Process sales
  saleTransactions.forEach((t) => {
    t.transactions.forEach((line) => {
      if (!line.itcd) return;

      const itemId = line.itcd;
      if (!itemMap.has(itemId)) {
        itemMap.set(itemId, {
          itemDetails: line.itemDetails,
          purchase_qty: 0,
          purchase_amount: 0,
          sale_qty: 0,
          sale_amount: 0,
        });
      }

      const itemData = itemMap.get(itemId);
      itemData.sale_qty += line.qty || 0;
      itemData.sale_amount += line.damt || 0;
    });
  });

  console.log("YESSSSSSSSSSSSSSSSSS");

  // Convert to array and calculate margins
  const marginData = Array.from(itemMap.values()).map((item) => {
    const avg_purchase_rate =
      item.purchase_qty > 0 ? item.purchase_amount / item.purchase_qty : 0;
    const avg_sale_rate =
      item.sale_qty > 0 ? item.sale_amount / item.sale_qty : 0;
    const margin = item.sale_amount - item.purchase_amount;
    const margin_percent =
      item.purchase_amount > 0 ? (margin / item.purchase_amount) * 100 : 0;

    return {
      ...item,
      avg_purchase_rate,
      avg_sale_rate,
      margin,
      margin_percent,
    };
  });

  // Filter by category if specified
  if (filters.category) {
    const categoryId = parseInt(filters.category);
    return marginData.filter(
      (item) => item.itemDetails?.itemCategories?.id === categoryId
    );
  }

  return marginData;
}

function calculateTradingMarginSummary(data) {
  const total_purchase_qty = data.reduce(
    (sum, item) => sum + item.purchase_qty,
    0
  );
  const total_purchase_amount = data.reduce(
    (sum, item) => sum + item.purchase_amount,
    0
  );
  const total_sale_qty = data.reduce((sum, item) => sum + item.sale_qty, 0);
  const total_sale_amount = data.reduce(
    (sum, item) => sum + item.sale_amount,
    0
  );
  const total_margin = total_sale_amount - total_purchase_amount;
  const avg_margin_percent =
    total_purchase_amount > 0
      ? (total_margin / total_purchase_amount) * 100
      : 0;

  return {
    total_purchase_qty,
    total_purchase_amount,
    total_sale_qty,
    total_sale_amount,
    total_margin,
    avg_margin_percent,
  };
}

async function getStockLedgerReport(filters) {
  if (!filters.item) {
    throw new Error("Item is required for stock ledger report");
  }

  // Get opening balance as of dateFrom
  const openingBalance = await getOpeningBalance(
    filters.item,
    filters.godown,
    filters.dateFrom
  );

  // Get all transactions for the item
  const where = {
    dateD: {
      gte: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
      lte: filters.dateTo ? new Date(filters.dateTo) : undefined,
    },
    transactions: {
      some: {
        itcd: parseInt(filters.item),
      },
    },
  };

  if (filters.godown) {
    where.godown = parseInt(filters.godown);
  }

  const transactions = await prisma.transactionsMaster.findMany({
    where,
    include: {
      acno: true,
      godownDetails: true,
      transactions: {
        where: { itcd: parseInt(filters.item) },
        include: {
          itemDetails: true,
          godownDetails: true,
        },
      },
    },
    orderBy: {
      dateD: "asc",
    },
  });

  // Format the data
  const ledgerData = [];
  let runningBalance = openingBalance;

  // Add opening balance row
  ledgerData.push({
    date: format(new Date(filters.dateFrom), "dd-MM-yyyy"),
    transaction_no: "OPENING",
    transaction_type: "Opening Balance",
    vendor_customer: "",
    opening_qty: runningBalance,
    qty_in: 0,
    qty_out: 0,
    closing_qty: runningBalance,
    rate: 0,
    amount: 0,
  });

  // Process each transaction
  transactions.forEach((t) => {
    t.transactions
      .filter((tran) => tran.sub_tran_id !== 3)
      .forEach((line) => {
        const opening = runningBalance;
        let qtyIn = 0;
        let qtyOut = 0;

        if (t.tran_code === 4 || t.tran_code === 10) {
          // Purchase or Sale Return
          qtyIn = line.qty || 0;
        } else if (t.tran_code === 6 || t.tran_code === 9) {
          // Sale or Purchase Return
          qtyOut = line.qty || 0;
        }

        runningBalance += qtyIn - qtyOut;

        ledgerData.push({
          date: format(t.dateD, "dd-MM-yyyy"),
          transaction_no: t.vr_no,
          transaction_type: getTransactionTypeLabel(t.tran_code),
          vendor_customer: t.acno?.acname || "",
          opening_qty: opening,
          qty_in: qtyIn,
          qty_out: qtyOut,
          closing_qty: runningBalance,
          rate: line.rate,
          amount:
            t.tran_code === 4 || t.tran_code === 9 ? line.camt : line.damt,
        });
      });
  });

  return ledgerData;
}

async function getOpeningBalance(itemId, godownId, dateFrom) {
  // Implement logic to get opening balance for the item
  // This is a placeholder - implement your actual logic
  const openingTransactions = await prisma.transactionsMaster.findMany({
    where: {
      dateD: {
        lt: new Date(dateFrom),
      },
      transactions: {
        some: {
          itcd: parseInt(itemId),
          ...(godownId ? { godown: parseInt(godownId) } : {}),
        },
      },
    },
    include: {
      transactions: {
        where: {
          itcd: parseInt(itemId),
          ...(godownId ? { godown: parseInt(godownId) } : {}),
        },
      },
    },
  });

  let balance = 0;

  openingTransactions.forEach((t) => {
    t.transactions
      .filter((tran) => tran.sub_tran_id !== 3)
      .forEach((line) => {
        if (t.tran_code === 4 || t.tran_code === 10) {
          // Purchase or Sale Return
          balance += line.qty || 0;
        } else if (t.tran_code === 6 || t.tran_code === 9) {
          // Sale or Purchase Return
          balance -= line.qty || 0;
        }
      });
  });

  return balance;
}

function calculateStockLedgerSummary(data) {
  const total_in = data.reduce((sum, item) => sum + (item.qty_in || 0), 0);
  const total_out = data.reduce((sum, item) => sum + (item.qty_out || 0), 0);

  return {
    total_in,
    total_out,
    net_movement: total_in - total_out,
    closing_balance: data.length > 0 ? data[data.length - 1].closing_qty : 0,
  };
}

async function getPOSTransactionsReport(filters) {
  const where = {
    tran_code: 5, // POS transaction code
    dateD: {
      gte: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
      lte: filters.dateTo ? new Date(filters.dateTo) : undefined,
    },
  };

  if (filters.customer && filters.customer !== "all") {
    where.pycd = filters.customer;
  }

  if (filters.paymentMode && filters.paymentMode !== "all") {
    where.payment_mode = filters.paymentMode;
  }

  const transactions = await prisma.transactionsMaster.findMany({
    where,
    include: {
      acno: true,
      transactions: {
        include: {
          itemDetails: true,
        },
      },
    },
    orderBy: {
      dateD: "desc",
    },
  });

  return transactions.map((t) => {
    const filteredTransactions = t.transactions.filter((tran) =>
      [1, 2].includes(tran.sub_tran_id)
    );

    return {
      ...t,
      transactions: filteredTransactions,
      dateD: new Date(t.dateD).toLocaleDateString(),
      customer_name: t.acno?.acname || "Walk-in Customer",
      payment_mode: t.payment_mode || "Cash",
      total_qty: filteredTransactions.reduce(
        (sum, line) => sum + (line.qty || 0),
        0
      ),
      total_amount: filteredTransactions.reduce(
        (sum, line) => sum + (line.gross_amount || 0),
        0
      ),
      discount: t.discount || 0,
      net_amount: filteredTransactions.reduce(
        (sum, line) => sum + (line.damt || 0),
        0
      ),
    };
  });
}

function calculatePOSSummary(data) {
  return {
    total_transactions: data.length,
    total_qty: data.reduce((sum, t) => sum + t.total_qty, 0),
    total_amount: data.reduce((sum, t) => sum + t.total_amount, 0),
    total_discount: data.reduce((sum, t) => sum + (t.discount || 0), 0),
    total_net_amount: data.reduce((sum, t) => sum + t.net_amount, 0),
  };
}

// Helper functions
function getTransactionCodesForType(type) {
  switch (type) {
    case "purchase":
      return [4];
    case "sale":
      return [6];
    case "purchaseReturn":
      return [9];
    case "saleReturn":
      return [10];
    default:
      return [4, 6, 9, 10]; // All
  }
}

function getTransactionTypeLabel(tran_code) {
  switch (tran_code) {
    case 4:
      return "Purchase";
    case 6:
      return "Sale";
    case 9:
      return "Purchase Return";
    case 10:
      return "Sale Return";
    default:
      return "Other";
  }
}

async function getOpeningStock(productId, godownId, dateFrom) {
  console.log("Getting opening stock...");
  console.log("Product ID:", productId);
  console.log("Godown ID:", godownId);
  console.log("Before Date:", dateFrom);

  const transactions = await prisma.transactionsMaster.findMany({
    where: {
      ...(dateFrom && {
        dateD: {
          lt: new Date(dateFrom),
        },
      }),
      ...(godownId && {
        godown: parseInt(godownId),
      }),
      ...(productId && {
        transactions: {
          some: {
            itcd: parseInt(productId),
            NOT: { sub_tran_id: 3 },
          },
        },
      }),
    },
    include: {
      transactions: productId
        ? {
            where: {
              itcd: parseInt(productId),
              NOT: { sub_tran_id: 3 },
            },
          }
        : {
            where: {
              NOT: { sub_tran_id: 3 },
            },
          },
    },
  });

  const stockMap = {};

  transactions.forEach((tranMaster) => {
    (tranMaster.transactions || []).forEach((tran) => {
      const pid = tran.itcd;
      const qty = tran.qty || 0;

      if (!stockMap[pid]) {
        stockMap[pid] = 0;
      }

      switch (tranMaster.tran_code) {
        case 4: // Purchase
        case 10: // Sale Return
          stockMap[pid] += qty;
          break;
        case 6: // Sale
        case 9: // Purchase Return
        case 5: // POS
          stockMap[pid] -= qty;
          break;
      }
    });
  });

  if (productId) {
    return stockMap[parseInt(productId)] || 0;
  } else {
    return stockMap;
  }
}


