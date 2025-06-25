// app/api/reports/[reportType]/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { REPORT_CONFIG } from '@/components/Reports/config';

export async function GET(request, { params }) {
  const { reportType } = await params;
  console.log(reportType)
  const config = REPORT_CONFIG[reportType];
  
  if (!config) {
    return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const filters = {};
  
  // Process filters based on config
  config.filters.forEach(filter => {
    const value = searchParams.get(filter.name);
    if (value !== null && value !== '') {
      filters[filter.name] = value;
    }
  });

  console.log(config)

  try {
    let data = [];
    let summary = {};

    switch (reportType) {
      case 'purchase':
        data = await getPurchaseReport(filters);
        summary = calculatePurchaseSummary(data);
        break;
      case 'purchaseReturn':
        data = await getPurchaseReturnReport(filters);
        summary = calculatePurchaseReturnSummary(data);
        break;
      case 'sale':
        data = await getSaleReport(filters);
        summary = calculateSaleSummary(data);
        break;
      case 'saleReturn':
        data = await getSaleReturnReport(filters);
        summary = calculateSaleReturnSummary(data);
        break;
      case 'stock':
        data = await getStockReport(filters);
        summary = calculateStockSummary(data);
        break;
      case 'stockActivity':
        data = await getStockActivityReport(filters);
        summary = calculateStockActivitySummary(data);
        break;
      case 'tradingMargin':
        data = await getTradingMarginReport(filters);
        summary = calculateTradingMarginSummary(data);
        break;
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }

    return NextResponse.json({ 
      data, 
      summary,
      config: {
        title: config.title,
        description: config.description,
        columns: config.columns,
        detailColumns: config.detailColumns,
        exportOptions: config.exportOptions
      }
    });
  } catch (error) {
    console.error(`Error generating ${reportType} report:`, error);
    return NextResponse.json(
      { error: 'Failed to generate report', details: error.message },
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
      lte: filters.dateTo ? new Date(filters.dateTo) : undefined
    }
  };

  console.log("filyter Vendor: ",filters.vendor)
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
          godownDetails: true
        }
      }
    },
    orderBy: {
      dateD: 'desc'
    }
  });

 return transactions.map(t => {
  // Filter sub_tran_id within each transactions array
  const filteredTransactions = t.transactions.filter(tran =>
    [1, 2].includes(tran.sub_tran_id)
  );

  return {
    ...t,
    transactions: filteredTransactions,
    dateD:new Date(t.dateD).toLocaleDateString(),
    total_qty: filteredTransactions.reduce((sum, line) => sum + (line.qty || 0), 0),
    total_amount: filteredTransactions.reduce((sum, line) => sum + (line.camt || 0), 0)
  };
})
}

function calculatePurchaseSummary(data) {
  return {
    total_qty: data.reduce((sum, t) => sum + t.total_qty, 0),
    total_gross_amount: data.reduce((sum, t) => sum + t.transactions.reduce((sum, line) => sum + (line.gross_amount || 0), 0), 0),
    total_tax: data.reduce((sum, t) => sum + t.transactions.reduce((sum, line) => sum + (line.st_amount || 0), 0),0),
    total_amount: data.reduce((sum, t) => sum + t.total_amount, 0)
  };
}

async function getPurchaseReturnReport(filters) {
  const where = {
    tran_code: 9, // Purchase return transaction code
    dateD: {
      gte: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
      lte: filters.dateTo ? new Date(filters.dateTo) : undefined
    }
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
          godownDetails: true
        }
      }
    },
    orderBy: {
      dateD: 'desc'
    }
  });

   return transactions.map(t => {
  // Filter sub_tran_id within each transactions array
  const filteredTransactions = t.transactions.filter(tran =>
    [1, 2].includes(tran.sub_tran_id)
  );

  return {
    ...t,
    transactions: filteredTransactions,
    dateD:new Date(t.dateD).toLocaleDateString(),
    total_qty: filteredTransactions.reduce((sum, line) => sum + (line.qty || 0), 0),
    total_amount: filteredTransactions.reduce((sum, line) => sum + (line.camt || 0), 0)
  };
})
}

function calculatePurchaseReturnSummary(data) {
  return {
    total_qty: data.reduce((sum, t) => sum + t.total_qty, 0),
    total_gross_amount: data.reduce((sum, t) => sum + t.transactions.reduce((sum, line) => sum + (line.gross_amount || 0), 0), 0),
    total_tax: data.reduce((sum, t) => sum + t.transactions.reduce((sum, line) => sum + (line.st_amount || 0), 0),0),
    total_amount: data.reduce((sum, t) => sum + t.total_amount, 0)
  };
}

async function getSaleReport(filters) {
  const where = {
    tran_code: 6, // Sale transaction code
    dateD: {
      gte: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
      lte: filters.dateTo ? new Date(filters.dateTo) : undefined
    }
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
          godownDetails: true
        }
      }
    },
    orderBy: {
      dateD: 'desc'
    }
  });

   return transactions.map(t => {
  // Filter sub_tran_id within each transactions array
  const filteredTransactions = t.transactions.filter(tran =>
    [1, 2].includes(tran.sub_tran_id)
  );

  return {
    ...t,
    transactions: filteredTransactions,
    dateD:new Date(t.dateD).toLocaleDateString(),
    total_qty: filteredTransactions.reduce((sum, line) => sum + (line.qty || 0), 0),
    total_amount: filteredTransactions.reduce((sum, line) => sum + (line.damt || 0), 0)
  };
})
}

function calculateSaleSummary(data) {
  return {
    total_qty: data.reduce((sum, t) => sum + t.total_qty, 0),
    total_gross_amount: data.reduce((sum, t) => sum + t.transactions.reduce((sum, line) => sum + (line.gross_amount || 0), 0), 0),
    total_tax: data.reduce((sum, t) => sum + t.transactions.reduce((sum, line) => sum + (line.st_amount || 0), 0),0),
    total_amount: data.reduce((sum, t) => sum + t.total_amount, 0)
  };
}

async function getSaleReturnReport(filters) {
  const where = {
    tran_code: 10, // Sale return transaction code
    dateD: {
      gte: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
      lte: filters.dateTo ? new Date(filters.dateTo) : undefined
    }
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
          godownDetails: true
        }
      }
    },
    orderBy: {
      dateD: 'desc'
    }
  });

   return transactions.map(t => {
  // Filter sub_tran_id within each transactions array
  const filteredTransactions = t.transactions.filter(tran =>
    [1, 2].includes(tran.sub_tran_id)
  );

  return {
    ...t,
    transactions: filteredTransactions,
    dateD:new Date(t.dateD).toLocaleDateString(),
    total_qty: filteredTransactions.reduce((sum, line) => sum + (line.qty || 0), 0),
    total_amount: filteredTransactions.reduce((sum, line) => sum + (line.damt || 0), 0)
  };
})
}

function calculateSaleReturnSummary(data) {
  return {
    total_qty: data.reduce((sum, t) => sum + t.total_qty, 0),
    total_gross_amount: data.reduce((sum, t) => sum + t.transactions.reduce((sum, line) => sum + (line.gross_amount || 0), 0), 0),
    total_tax: data.reduce((sum, t) => sum + t.transactions.reduce((sum, line) => sum + (line.st_amount || 0), 0),0),
    total_amount: data.reduce((sum, t) => sum + t.total_amount, 0)
  };
}

async function getStockReport(filters) {
  const where = {};
  
  if (filters.category) {
    where.ic_id = parseInt(filters.category);
  }

  if (filters.showZero === 'false') {
    where.stock = { gt: 0 };
  }

  const items = await prisma.item.findMany({
    where,
    include: {
      itemCategories: true
    },
    orderBy: {
      item: 'asc'
    }
  });

  return items;
}

function calculateStockSummary(data) {
  return {
    total_items: data.length,
    total_stock: data.reduce((sum, item) => sum + (item.stock || 0), 0),
    total_value: data.reduce((sum, item) => sum + ((item.stock || 0) * (item.price || 0)), 0)
  };
}

async function getStockActivityReport(filters) {
    console.log("YES ENTERED")
  const where = {
    dateD: {
      gte: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
      lte: filters.dateTo ? new Date(filters.dateTo) : undefined
    },
    tran_code: {
      in: getTransactionCodesForType(filters.transactionType)
    }
  };

  if (filters.item) {
    where.transactions = {
      some: {
        itcd: parseInt(filters.item)
      }
    };
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
        where: filters.item ? { itcd: parseInt(filters.item) } : undefined,
        include: {
          itemDetails: true,
          godownDetails: true,
          acnoDetails:true,
        }
      }
    },
    orderBy: {
      dateD: 'desc'
    }
  });

  console.log("Transaction ty: ",transactions.transactions);

  // Flatten the data to show each line item as a separate row
  const activityData = [];
  
  transactions.forEach(t => {
    t.transactions.filter(t=>t.sub_tran_id !== 3).forEach(line => {
      activityData.push({
        date: new Date(t.dateD).toLocaleDateString(),
        voucher_no: t.vr_no,
        type: getTransactionTypeLabel(t.tran_code),
        itemDetails: line.itemDetails,
        qty: line.qty,
        rate: line.rate,
        amount: t.tran_code === 4 || t.tran_code === 9 ? line.camt : line.damt,
        godownDetails: t.godownDetails,
        pycd: line.acnoDetails,
        narration: line.narration1 || t.rmk
      });
    });
  });

  return activityData;
}

function calculateStockActivitySummary(data) {
  const total_in = data
    .filter(item => item.type === 'Purchase' || item.type === 'Sale Return')
    .reduce((sum, item) => sum + (item.qty || 0), 0);

  const total_out = data
    .filter(item => item.type === 'Sale' || item.type === 'Purchase Return')
    .reduce((sum, item) => sum + (item.qty || 0), 0);

  return {
    total_in,
    total_out,
    net_movement: total_in - total_out,
    total_amount: data.reduce((sum, item) => sum + (item.amount || 0), 0)
  };
}

async function getTradingMarginReport(filters) {
  const where = {
    dateD: {
      gte: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
      lte: filters.dateTo ? new Date(filters.dateTo) : undefined
    }
  };

  if (filters.item) {
    where.transactions = {
      some: {
        itcd: parseInt(filters.item)
      }
    };
  }

  // Get all purchase and sale transactions
  const purchaseTransactions = await prisma.transactionsMaster.findMany({
    where: {
      ...where,
      tran_code: 4 // Purchase
    },
    include: {
      transactions: {
        include: {
          itemDetails: {
            include: {
              itemCategories: true
            }
          }
        }
      }
    }
  });

  const saleTransactions = await prisma.transactionsMaster.findMany({
    where: {
      ...where,
      tran_code: 6 // Sale
    },
    include: {
      transactions: {
        include: {
          itemDetails: {
            include: {
              itemCategories: true
            }
          }
        }
      }
    }
  });

  // Group by item
  const itemMap = new Map();

  // Process purchases
  purchaseTransactions.forEach(t => {
    t.transactions.forEach(line => {
      if (!line.itcd) return;
      
      const itemId = line.itcd;
      if (!itemMap.has(itemId)) {
        itemMap.set(itemId, {
          itemDetails: line.itemDetails,
          purchase_qty: 0,
          purchase_amount: 0,
          sale_qty: 0,
          sale_amount: 0
        });
      }
      
      const itemData = itemMap.get(itemId);
      itemData.purchase_qty += line.qty || 0;
      itemData.purchase_amount += line.camt || 0;
    });
  });

  // Process sales
  saleTransactions.forEach(t => {
    t.transactions.forEach(line => {
      if (!line.itcd) return;
      
      const itemId = line.itcd;
      if (!itemMap.has(itemId)) {
        itemMap.set(itemId, {
          itemDetails: line.itemDetails,
          purchase_qty: 0,
          purchase_amount: 0,
          sale_qty: 0,
          sale_amount: 0
        });
      }
      
      const itemData = itemMap.get(itemId);
      itemData.sale_qty += line.qty || 0;
      itemData.sale_amount += line.damt || 0;
    });
  });

  console.log("YESSSSSSSSSSSSSSSSSS")

  // Convert to array and calculate margins
  const marginData = Array.from(itemMap.values()).map(item => {
    const avg_purchase_rate = item.purchase_qty > 0 ? item.purchase_amount / item.purchase_qty : 0;
    const avg_sale_rate = item.sale_qty > 0 ? item.sale_amount / item.sale_qty : 0;
    const margin = item.sale_amount - item.purchase_amount;
    const margin_percent = item.purchase_amount > 0 ? (margin / item.purchase_amount) * 100 : 0;

    return {
      ...item,
      avg_purchase_rate,
      avg_sale_rate,
      margin,
      margin_percent
    };
  });

  // Filter by category if specified
  if (filters.category) {
    const categoryId = parseInt(filters.category);
    return marginData.filter(item => 
      item.itemDetails?.itemCategories?.id === categoryId
    );
  }

  return marginData;
}

function calculateTradingMarginSummary(data) {
  const total_purchase_qty = data.reduce((sum, item) => sum + item.purchase_qty, 0);
  const total_purchase_amount = data.reduce((sum, item) => sum + item.purchase_amount, 0);
  const total_sale_qty = data.reduce((sum, item) => sum + item.sale_qty, 0);
  const total_sale_amount = data.reduce((sum, item) => sum + item.sale_amount, 0);
  const total_margin = total_sale_amount - total_purchase_amount;
  const avg_margin_percent = total_purchase_amount > 0 ? (total_margin / total_purchase_amount) * 100 : 0;

  return {
    total_purchase_qty,
    total_purchase_amount,
    total_sale_qty,
    total_sale_amount,
    total_margin,
    avg_margin_percent
  };
}

// Helper functions
function getTransactionCodesForType(type) {
  switch (type) {
    case 'purchase': return [4];
    case 'sale': return [6];
    case 'purchaseReturn': return [9];
    case 'saleReturn': return [10];
    default: return [4, 6, 9, 10]; // All
  }
}

function getTransactionTypeLabel(tran_code) {
  switch (tran_code) {
    case 4: return 'Purchase';
    case 6: return 'Sale';
    case 9: return 'Purchase Return';
    case 10: return 'Sale Return';
    default: return 'Other';
  }
}