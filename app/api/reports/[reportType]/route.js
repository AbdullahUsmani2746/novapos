// app/api/reports/[reportType]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { REPORT_CONFIG } from "@/components/Reports/config";
import { format } from "date-fns";
import { Prisma } from "@prisma/client";
import { months } from "moment/moment";
import { custom } from "zod";
import { da } from "date-fns/locale";

export async function GET(request, { params }) {
  const { reportType } = await params;
  const config = REPORT_CONFIG[reportType];

  if (!config) {
    return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);

  // Extract pagination parameters
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 10;
  const offset = (page - 1) * limit;

  // Extract search parameters
  const search = searchParams.get("search") || "";
  const searchColumn = searchParams.get("searchColumn") || "";

  // Extract sorting parameters
  const sortBy = searchParams.get("sortBy") || "";
  const sortOrder = searchParams.get("sortOrder") || "asc";

  // Extract filters
  const filters = {};
  config.filters.forEach((filter) => {
    const value = searchParams.get(filter.name);
    if (value !== null && value !== "") {
      filters[filter.name] = value;
    }
  });

  // Add pagination, search, and sort to filters
  const queryOptions = {
    ...filters,
    pagination: {
      page,
      limit,
      offset,
    },
    search: {
      term: search,
      column: searchColumn,
      searchableColumns: getSearchableColumns(config.columns),
    },
    sort: {
      column: sortBy,
      order: sortOrder,
      sortableColumns: getSortableColumns(config.columns),
    },
  };

  try {
    let data = [];
    let summary = {};
    let totalRecords = 0;

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
      case "stockMetrics":
        data = await getStockMetricsReport(filters);
        summary = calculateStockMetricsSummary(data);
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
      case "payment":
        data = await getTransactionReport(2, filters);
        summary = calculateTransactionSummary(data);
        break;
      case "receipt":
        data = await getTransactionReport(1, filters);
        summary = calculateTransactionSummary(data);
        break;
      case "journal":
        data = await getTransactionReport(3, filters);
        summary = calculateTransactionSummary(data);
        break;
      case "accountLedger":
        data = await getAccountLedger(filters);
        summary = calculateAccountLedgerSummary(data);
        break;
      case "accountsActivity":
        data = await getAccountActivity(filters);
        summary = calculateAccountActivitySummary(data);
        break;
      case "trialBalance":
        data = await getTrialBalance(filters);
        summary = calculateTrialBalanceSummary(data);
        break;
      case "orderBalance":
        data = await getOrderBalanceReport(filters);
        summary = calculateOrderBalanceSummary(data);
        break;
      case "customerAging":
        data = await getCustomerAgingReport(filters);
        summary = calculateAgingSummary(data);
        break;
      default:
        return NextResponse.json(
          { error: "Invalid report type" },
          { status: 400 }
        );
    }

    // Calculate pagination info
    const totalPages = Math.ceil(
      reportType === "stockMetrics" ? data?.items.length : data.length / limit
    );
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      data:
        reportType === "stockMetrics"
          ? data?.items.slice(offset, offset + limit)
          : data.slice(offset, offset + limit),
      summary,
      pagination: {
        currentPage: page,
        pageSize: limit,
        total: reportType === "stockMetrics" ? data?.items.length : data.length,
        totalPages,
        hasNextPage,
        hasPrevPage,
        startRecord: offset + 1,
        endRecord: Math.min(
          offset + limit,
          reportType === "stockMetrics" ? data?.items.length : data.length
        ),
      },
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

// Helper functions
function getSearchableColumns(columns) {
  return columns
    .filter((col) => col.searchable !== false)
    .map((col) => col.field);
}

function getSortableColumns(columns) {
  return columns
    .filter((col) => col.sortable !== false)
    .map((col) => col.field);
}

// Helper functions for each report type
async function getPurchaseReport(filters) {
  const where = {
    tran_code: 4, // Purchase transaction code
    dated: {
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
      dated: "desc",
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
      dated: new Date(t.dated).toLocaleDateString(),
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
    dated: {
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
      dated: "desc",
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
      dated: new Date(t.dated).toLocaleDateString(),
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
    dated: {
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
      dated: "desc",
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
      dated: new Date(t.dated).toLocaleDateString(),
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
    dated: {
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
      dated: "desc",
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
      dated: new Date(t.dated).toLocaleDateString(),
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

export async function getStockReport(filters = {}) {
  try {
    const results = await prisma.$queryRaw`
      SELECT 
    i.itcd,
    i.item,
    i.ic_id,
    ic.ic_name as ItemCategory,
	  ic.id,

    COALESCE(SUM(
      CASE
        WHEN tm.tran_code IN (4, 10, 12) THEN t.qty
        WHEN tm.tran_code IN (6, 9, 5) THEN -t.qty
        ELSE 0
      END
    ), 0) AS "actualStock",

    SUM(CASE WHEN tm.tran_code = 4 THEN t.qty ELSE 0 END) 
      - SUM(CASE WHEN tm.tran_code = 9 THEN t.qty ELSE 0 END) AS "totalPurchased",

    SUM(CASE WHEN tm.tran_code = 4 THEN COALESCE(t.damt,0)::numeric ELSE 0 END) 
      - SUM(CASE WHEN tm.tran_code = 9 THEN COALESCE(t.camt,0)::numeric ELSE 0 END) AS "totalPurchaseValue",

    SUM(CASE WHEN tm.tran_code IN (5,6) THEN t.qty ELSE 0 END) 
      - SUM(CASE WHEN tm.tran_code = 10 THEN t.qty ELSE 0 END) AS "totalSold",

    SUM(CASE WHEN tm.tran_code IN (5,6) THEN COALESCE(t.camt,0)::numeric ELSE 0 END) 
      - SUM(CASE WHEN tm.tran_code = 10 THEN COALESCE(t.damt,0)::numeric ELSE 0 END) AS "totalSaleValue",

    CASE 
      WHEN (SUM(CASE WHEN tm.tran_code = 4 THEN t.qty ELSE 0 END) 
            - SUM(CASE WHEN tm.tran_code = 9 THEN t.qty ELSE 0 END)) > 0
      THEN (
        (SUM(CASE WHEN tm.tran_code = 4 THEN COALESCE(t.damt,0)::numeric ELSE 0 END) 
         - SUM(CASE WHEN tm.tran_code = 9 THEN COALESCE(t.camt,0)::numeric ELSE 0 END))
        /
        NULLIF((SUM(CASE WHEN tm.tran_code = 4 THEN t.qty ELSE 0 END) 
         - SUM(CASE WHEN tm.tran_code = 9 THEN t.qty ELSE 0 END)),0)
      )
      ELSE 0
    END AS "avgPurchaseRate",

    CASE 
      WHEN (SUM(CASE WHEN tm.tran_code IN (5,6) THEN t.qty ELSE 0 END) 
            - SUM(CASE WHEN tm.tran_code = 10 THEN t.qty ELSE 0 END)) > 0
      THEN (
        (SUM(CASE WHEN tm.tran_code IN (5,6) THEN COALESCE(t.camt,0)::numeric ELSE 0 END) 
         - SUM(CASE WHEN tm.tran_code = 10 THEN COALESCE(t.damt,0)::numeric ELSE 0 END))
        /
        NULLIF((SUM(CASE WHEN tm.tran_code IN (5,6) THEN t.qty ELSE 0 END) 
         - SUM(CASE WHEN tm.tran_code = 10 THEN t.qty ELSE 0 END)),0)
      )
      ELSE 0
    END AS "avgSaleRate",

    (COALESCE(SUM(
      CASE
        WHEN tm.tran_code IN (4, 10, 12) THEN t.qty
        WHEN tm.tran_code IN (6, 9, 5) THEN -t.qty
        ELSE 0
      END
    ), 0) *
    CASE 
      WHEN (SUM(CASE WHEN tm.tran_code = 4 THEN t.qty ELSE 0 END) 
            - SUM(CASE WHEN tm.tran_code = 9 THEN t.qty ELSE 0 END)) > 0
      THEN (
        (SUM(CASE WHEN tm.tran_code = 4 THEN COALESCE(t.damt,0)::numeric ELSE 0 END) 
         - SUM(CASE WHEN tm.tran_code = 9 THEN COALESCE(t.camt,0)::numeric ELSE 0 END))
        /
        NULLIF((SUM(CASE WHEN tm.tran_code = 4 THEN t.qty ELSE 0 END) 
         - SUM(CASE WHEN tm.tran_code = 9 THEN t.qty ELSE 0 END)),0)
      )
      ELSE 0
    END) AS "currentStockValue",

    (COALESCE(SUM(
      CASE
        WHEN tm.tran_code IN (4, 10, 12) THEN t.qty
        WHEN tm.tran_code IN (6, 9, 5) THEN -t.qty
        ELSE 0
      END
    ), 0) *
    CASE 
      WHEN (SUM(CASE WHEN tm.tran_code IN (5,6) THEN t.qty ELSE 0 END) 
            - SUM(CASE WHEN tm.tran_code = 10 THEN t.qty ELSE 0 END)) > 0
      THEN (
        (SUM(CASE WHEN tm.tran_code IN (5,6) THEN COALESCE(t.camt,0)::numeric ELSE 0 END) 
         - SUM(CASE WHEN tm.tran_code = 10 THEN COALESCE(t.damt,0)::numeric ELSE 0 END))
        /
        NULLIF((SUM(CASE WHEN tm.tran_code IN (5,6) THEN t.qty ELSE 0 END) 
         - SUM(CASE WHEN tm.tran_code = 10 THEN t.qty ELSE 0 END)),0)
      )
      ELSE 0
    END) AS "potentialSaleValue",

    CASE 
      WHEN (
        (SUM(CASE WHEN tm.tran_code = 4 THEN t.qty ELSE 0 END) 
         - SUM(CASE WHEN tm.tran_code = 9 THEN t.qty ELSE 0 END))
      ) > 0
      THEN ROUND((
        (
          (SUM(CASE WHEN tm.tran_code IN (5,6) THEN COALESCE(t.camt,0)::numeric ELSE 0 END) 
           - SUM(CASE WHEN tm.tran_code = 10 THEN COALESCE(t.damt,0)::numeric ELSE 0 END))
          /
          NULLIF((SUM(CASE WHEN tm.tran_code IN (5,6) THEN t.qty ELSE 0 END) 
           - SUM(CASE WHEN tm.tran_code = 10 THEN t.qty ELSE 0 END)),0)
        )
        -
        (
          (SUM(CASE WHEN tm.tran_code = 4 THEN COALESCE(t.damt,0)::numeric ELSE 0 END) 
           - SUM(CASE WHEN tm.tran_code = 9 THEN COALESCE(t.camt,0)::numeric ELSE 0 END))
          /
          NULLIF((SUM(CASE WHEN tm.tran_code = 4 THEN t.qty ELSE 0 END) 
           - SUM(CASE WHEN tm.tran_code = 9 THEN t.qty ELSE 0 END)),0)
        )
      )::numeric / 
      NULLIF((
        (SUM(CASE WHEN tm.tran_code = 4 THEN COALESCE(t.damt,0)::numeric ELSE 0 END) 
         - SUM(CASE WHEN tm.tran_code = 9 THEN COALESCE(t.camt,0)::numeric ELSE 0 END))
        /
        NULLIF((SUM(CASE WHEN tm.tran_code = 4 THEN t.qty ELSE 0 END) 
         - SUM(CASE WHEN tm.tran_code = 9 THEN t.qty ELSE 0 END)),0)
      ),0)::numeric * 100,2)
      ELSE 0
    END AS "profitMargin",

    CASE 
      WHEN (SUM(CASE WHEN tm.tran_code = 4 THEN t.qty ELSE 0 END) 
            - SUM(CASE WHEN tm.tran_code = 9 THEN t.qty ELSE 0 END)) > 0
      THEN ROUND((
        (
          (SUM(CASE WHEN tm.tran_code IN (5,6) THEN t.qty ELSE 0 END) 
           - SUM(CASE WHEN tm.tran_code = 10 THEN t.qty ELSE 0 END))::numeric
          /
          NULLIF((SUM(CASE WHEN tm.tran_code = 4 THEN t.qty ELSE 0 END) 
           - SUM(CASE WHEN tm.tran_code = 9 THEN t.qty ELSE 0 END)),0)::numeric
        ) * 100
      )::numeric,2)
      ELSE 0
    END AS "stockTurnover"

FROM "Transactions" t
JOIN "TRANSACTIONS_MASTER" tm ON t.tran_id = tm.tran_id
JOIN "Item" i ON t.itcd = i.itcd
LEFT JOIN "ItemCategory" ic ON i.ic_id = ic.id
WHERE t.itcd IS NOT NULL
  AND t.qty IS NOT NULL
  ${
    filters?.category
      ? Prisma.sql`AND i.ic_id = ${parseInt(filters.category)}`
      : Prisma.empty
  }
GROUP BY i.itcd, i.item, i.ic_id,ic.ic_name , ic.id
ORDER BY i.item ASC;
    `;

    return results ?? [];
  } catch (err) {
    console.error("[getStockReport] ERROR:", err);
    return [];
  }
}

function calculateStockSummary(data) {
  return {
    total_items: data.length,
    total_stock: data.reduce((sum, item) => sum + (item.actualStock || 0), 0),
    total_value: data.reduce(
      (sum, item) => sum + (item.currentStockValue || 0),
      0
    ),
  };
}

async function getStockActivityReport(filters = {}) {
  try {
    const results = await prisma.$queryRaw`
      SELECT 
        i.itcd AS product_code,
        i.item AS product_name,
        ic.ic_name AS category,

        -- Opening stock (up to dateFrom)
        COALESCE((
          SELECT SUM(
            CASE
              WHEN tm2.tran_code IN (4,10,12) THEN t2.qty
              WHEN tm2.tran_code IN (6,9,5) THEN -t2.qty
              WHEN tm2.tran_code = 11 THEN 
                CASE 
                  WHEN ${
                    filters.godown
                      ? Prisma.sql`${filters.godown}`
                      : Prisma.sql`NULL`
                  } = tm2.godown2 
                  THEN t2.qty
                  WHEN ${
                    filters.godown
                      ? Prisma.sql`${filters.godown}`
                      : Prisma.sql`NULL`
                  } = tm2.godown
                  THEN -t2.qty
                  ELSE 0
                END
              ELSE 0
            END
          )
          FROM "Transactions" t2
          JOIN "TRANSACTIONS_MASTER" tm2 ON t2.tran_id = tm2.tran_id
          WHERE t2.itcd = i.itcd
            AND t2.qty IS NOT NULL
            ${
              filters.dateFrom
                ? Prisma.sql`AND tm2.dated < ${filters.dateFrom}`
                : Prisma.empty
            }
        ),0) AS opening_stock,

        -- Purchases
        SUM(CASE WHEN tm.tran_code = 4 THEN t.qty ELSE 0 END) AS purchase_qty,
        SUM(CASE WHEN tm.tran_code = 9 THEN t.qty ELSE 0 END) AS purchase_ret_qty,

        -- Sales
        SUM(CASE WHEN tm.tran_code = 6 THEN t.qty ELSE 0 END) AS sale_qty,
        SUM(CASE WHEN tm.tran_code = 10 THEN t.qty ELSE 0 END) AS sale_ret_qty,

        -- POS
        SUM(CASE WHEN tm.tran_code = 5 THEN t.qty ELSE 0 END) AS pos_qty,
        SUM(CASE WHEN tm.tran_code = 12 THEN t.qty ELSE 0 END) AS pos_ret_qty,

        -- Transfers
        SUM(
          CASE WHEN tm.tran_code = 11 AND ${
            filters.godown ? Prisma.sql`${filters.godown}` : Prisma.sql`NULL`
          } = tm.godown2 
               THEN t.qty ELSE 0 END
        ) AS transfer_in_qty,
        SUM(
          CASE WHEN tm.tran_code = 11 AND ${
            filters.godown ? Prisma.sql`${filters.godown}` : Prisma.sql`NULL`
          } = tm.godown 
               THEN t.qty ELSE 0 END
        ) AS transfer_out_qty,

        -- Total Qty
        (
          SUM(CASE WHEN tm.tran_code = 4 THEN t.qty ELSE 0 END) +
          SUM(CASE WHEN tm.tran_code = 10 THEN t.qty ELSE 0 END) +
          SUM(CASE WHEN tm.tran_code = 12 THEN t.qty ELSE 0 END) +
          SUM(CASE WHEN tm.tran_code = 11 AND ${
            filters.godown ? Prisma.sql`${filters.godown}` : Prisma.sql`NULL`
          } = tm.godown2 THEN t.qty ELSE 0 END) -
          SUM(CASE WHEN tm.tran_code = 6 THEN t.qty ELSE 0 END) -
          SUM(CASE WHEN tm.tran_code = 9 THEN t.qty ELSE 0 END) -
          SUM(CASE WHEN tm.tran_code = 5 THEN t.qty ELSE 0 END) -
          SUM(CASE WHEN tm.tran_code = 11 AND ${
            filters.godown ? Prisma.sql`${filters.godown}` : Prisma.sql`NULL`
          } = tm.godown THEN t.qty ELSE 0 END)
        ) AS total_qty,

        -- Stock Balance = Opening + Total
        (
          COALESCE((
            SELECT SUM(
              CASE
                WHEN tm2.tran_code IN (4,10,12) THEN t2.qty
                WHEN tm2.tran_code IN (6,9,5) THEN -t2.qty
                WHEN tm2.tran_code = 11 THEN 
                  CASE 
                    WHEN ${
                      filters.godown
                        ? Prisma.sql`${filters.godown}`
                        : Prisma.sql`NULL`
                    } = tm2.godown2 
                    THEN t2.qty
                    WHEN ${
                      filters.godown
                        ? Prisma.sql`${filters.godown}`
                        : Prisma.sql`NULL`
                    } = tm2.godown
                    THEN -t2.qty
                    ELSE 0
                  END
                ELSE 0
              END
            )
            FROM "Transactions" t2
            JOIN "TRANSACTIONS_MASTER" tm2 ON t2.tran_id = tm2.tran_id
            WHERE t2.itcd = i.itcd
              AND t2.qty IS NOT NULL
              ${
                filters.dateFrom
                  ? Prisma.sql`AND tm2.dated < ${filters.dateFrom}`
                  : Prisma.empty
              }
          ),0)
          +
          (
            SUM(CASE WHEN tm.tran_code = 4 THEN t.qty ELSE 0 END) +
            SUM(CASE WHEN tm.tran_code = 10 THEN t.qty ELSE 0 END) +
            SUM(CASE WHEN tm.tran_code = 12 THEN t.qty ELSE 0 END) +
            SUM(CASE WHEN tm.tran_code = 11 AND ${
              filters.godown ? Prisma.sql`${filters.godown}` : Prisma.sql`NULL`
            } = tm.godown2 THEN t.qty ELSE 0 END) -
            SUM(CASE WHEN tm.tran_code = 6 THEN t.qty ELSE 0 END) -
            SUM(CASE WHEN tm.tran_code = 9 THEN t.qty ELSE 0 END) -
            SUM(CASE WHEN tm.tran_code = 5 THEN t.qty ELSE 0 END) -
            SUM(CASE WHEN tm.tran_code = 11 AND ${
              filters.godown ? Prisma.sql`${filters.godown}` : Prisma.sql`NULL`
            } = tm.godown THEN t.qty ELSE 0 END)
          )
        ) AS stock_balance

      FROM "Transactions" t
      JOIN "TRANSACTIONS_MASTER" tm ON t.tran_id = tm.tran_id
      JOIN "Item" i ON t.itcd = i.itcd
      LEFT JOIN "ItemCategory" ic ON i.ic_id = ic.id

      WHERE t.itcd IS NOT NULL
        AND t.qty IS NOT NULL
        ${
          filters.dateFrom
            ? Prisma.sql`AND tm.dated >= ${filters.dateFrom}`
            : Prisma.empty
        }
        ${
          filters.dateTo
            ? Prisma.sql`AND tm.dated <= ${filters.dateTo}`
            : Prisma.empty
        }
        ${
          filters.godown
            ? Prisma.sql`AND (tm.godown = ${filters.godown} OR tm.godown2 = ${filters.godown})`
            : Prisma.empty
        }
        ${
          filters.product
            ? Prisma.sql`AND t.itcd = ${filters.product}`
            : Prisma.empty
        }

      GROUP BY i.itcd, i.item, ic.ic_name
      ORDER BY i.item ASC;
    `;

    return results;
  } catch (err) {
    console.error("Error generating stock activity report:", err);
    return [];
  }
}

function calculateStockActivitySummary(data) {
  const total_in = data.reduce(
    (sum, item) =>
      sum +
      (item.purchase_qty || 0) +
      (item.pos_ret_qty || 0) +
      (item.transfer_in_qty || 0) +
      (item.sale_ret_qty || 0),
    0
  );

  const total_out = data.reduce(
    (sum, item) =>
      sum +
      (item.sale_qty || 0) +
      (item.pos_qty || 0) +
      (item.transfer_out_qty || 0) +
      (item.purchase_ret_qty || 0),
    0
  );

  const total_stock = data.reduce((sum, total) => sum + total.stock_balance, 0);
  return {
    total_stock,
    total_in,
    total_out,
  };
}

// Updated version of the getTradingMarginReport to include:
// - Purchase (4), Purchase Return (9), Sale (6), Sale Return (10), POS (5)
async function getTradingMarginReport(filters) {
  const where = {
    dated: {
      ...(filters.dateFrom && { gte: new Date(filters.dateFrom) }),
      ...(filters.dateTo && { lte: new Date(filters.dateTo) }),
    },
  };

  if (filters.item) {
    where.transactions = {
      some: {
        itcd: parseInt(filters.item),
      },
    };
  }
  // Fetch all relevant transactions (4, 5, 6, 9, 10)
  const allTransactions = await prisma.transactionsMaster.findMany({
    where,
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

  const itemMap = new Map();


  allTransactions.forEach((t) => {
    t.transactions.forEach((line) => {
      if (!line.itcd) return;

      const itemId = line.itcd;
      if (!itemMap.has(itemId)) {
        itemMap.set(itemId, {
          itemDetails: line.itemDetails,

          // Quantities
          purchase_qty: 0,
          purchase_return_qty: 0,
          sale_qty: 0,
          sale_return_qty: 0,
          pos_qty: 0,

          // Amounts
          purchase_amount: 0,
          purchase_return_amount: 0,
          sale_amount: 0,
          sale_return_amount: 0,
          pos_amount: 0,
        });
      }

      const itemData = itemMap.get(itemId);

      switch (t.tran_code) {
        case 4: // Purchase
          itemData.purchase_qty += line.qty || 0;
          itemData.purchase_amount += line.damt || 0;
          break;

        case 9: // Purchase Return
          itemData.purchase_return_qty += line.qty || 0;
          itemData.purchase_return_amount += line.camt || 0;
          break;

        case 6: // Sale
          itemData.sale_qty += line.qty || 0;
          itemData.sale_amount += line.camt || 0;
          break;

        case 10: // Sale Return
          itemData.sale_return_qty += line.qty || 0;
          itemData.sale_return_amount += line.damt || 0;
          break;

        case 5: // POS
          itemData.pos_qty += line.qty || 0;
          itemData.pos_amount += line.gross_amount || 0;
          break;
      }
    });
  });

  const marginData = Array.from(itemMap.values()).map((item) => {
    const total_purchase_qty = item.purchase_qty - item.purchase_return_qty;

    const total_purchase_amount =
      item.purchase_amount - item.purchase_return_amount;

    const total_sale_qty = item.sale_qty + item.pos_qty - item.sale_return_qty;

    const total_sale_amount =
      item.sale_amount + item.pos_amount - item.sale_return_amount;

    const avg_purchase_rate =
      total_purchase_qty > 0 ? total_purchase_amount / total_purchase_qty : 0;

    const avg_sale_rate =
      total_sale_qty > 0 ? total_sale_amount / total_sale_qty : 0;

    const margin = total_sale_amount - total_purchase_amount;

    const margin_percent =
      total_purchase_amount > 0 ? (margin / total_purchase_amount) * 100 : 0;

    return {
      ...item,
      avg_purchase_rate,
      avg_sale_rate,
      margin,
      margin_percent,
    };
  });

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

  const total_pos_qty = data.reduce((sum, item) => sum + item.pos_qty, 0);
  const total_pos_amount = data.reduce((sum, item) => sum + item.pos_amount, 0);
  const total_sale_return_qty = data.reduce(
    (sum, item) => sum + item.sale_return_qty,
    0
  );
  const total_sale_return_amount = data.reduce(
    (sum, item) => sum + item.sale_return_amount,
    0
  );
  const total_purchase_return_qty = data.reduce(
    (sum, item) => sum + item.purchase_return_qty,
    0
  );
  const total_purchase_return_amount = data.reduce(
    (sum, item) => sum + item.purchase_return_amount,
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
    total_pos_qty,
    total_pos_amount,
    total_sale_return_qty,
    total_sale_return_amount,
    total_purchase_return_qty,
    total_purchase_return_amount,

    total_sale_qty,
    total_sale_amount,
    total_margin,
    avg_margin_percent,
  };
}

async function getStockLedgerReport(filters) {

  let {item, dateFrom, dateTo} = filters;

  if(!dateFrom ) dateFrom = '2000-01-01';
  if(!dateTo) dateTo =new Date().toISOString().split('T')[0];
  if(!item) item = 1000004;

  // Get opening balance using raw query as of dateFrom
  const openingBalance = await getOpeningBalanceRaw(
    item,
    filters.godown,
    dateFrom,
    dateTo
  );

  const godownValue = parseInt(filters.godown);

  // Get all transactions for the item
  const where = {
    dated: {
      gte: dateFrom ? new Date(dateFrom) : undefined,
      lte:dateTo ? new Date(dateTo) : undefined,
    },
    transactions: {
      some: {
        itcd: parseInt(item),
      },
    },
    OR: [{ godown: godownValue }, { godown2: godownValue }],
  };

  // if (filters.godown) {
  //   where.godown = parseInt(filters.godown);
  // }


  const transactions = await prisma.transactionsMaster.findMany({
    where,
    include: {
      acno: true,
      godownDetails: true,
      transactions: {
        where: { itcd: parseInt(item) },
        include: {
          itemDetails: true,
          godownDetails: true,
        },
      },
    },
    orderBy: {
      dated: "asc",
    },
  });

  // Format the data
  const ledgerData = [];
  let runningBalance = openingBalance;

  // Add opening balance row
  ledgerData.push({
    date: format(new Date(dateFrom), "dd-MM-yyyy"),
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

        // Use the same logic as raw query for stock calculation
        if (t.tran_code === 4 || t.tran_code === 10 || t.tran_code === 12) {
          // Purchase or Sale Return (add to stock)
          qtyIn = line.qty || 0;
        } else if (
          t.tran_code === 6 ||
          t.tran_code === 9 ||
          t.tran_code === 5
        ) {
          // Sale or Purchase Return (remove from stock)
          qtyOut = line.qty || 0;
        } else if (t.tran_code === 11) {
          // Transfer handling
          if (filters.godown) {
            if (t.godown2 === parseInt(filters.godown)) {
              // Transfer in to this godown
              qtyIn = line.qty || 0;
            } else if (t.godown === parseInt(filters.godown)) {
              // Transfer out from this godown
              qtyOut = line.qty || 0;
            }
          }
          // If no specific godown, transfers cancel out in ledger
        }

        runningBalance += qtyIn - qtyOut;

        ledgerData.push({
          date: format(t.dated, "dd-MM-yyyy"),
          transaction_no: t.vr_no,
          transaction_type: getTransactionTypeLabel(t.tran_code),
          vendor_customer: t.acno?.acname || "",
          transactions: Array(line),
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

// Updated opening balance function using raw query
async function getOpeningBalanceRaw(itemId, godown, dateFrom, dateTo) {
  const itcd = parseInt(itemId);
  const fromDate = new Date(dateFrom);
  const toDate = new Date(dateTo);

  if (godown) {
    const stockResult = await prisma.$queryRaw`
      SELECT SUM(
        CASE 
          WHEN tm.tran_code IN (4, 10, 12) AND tm.godown = ${Number(
            godown
          )} THEN t.qty  -- Purchase, Sale Return (add to stock)
          WHEN tm.tran_code IN (6, 9, 5) AND tm.godown = ${Number(
            godown
          )} THEN -t.qty  -- Sale, Purchase Return (remove from stock)
          WHEN tm.tran_code = 11 AND tm.godown = ${Number(
            godown
          )} THEN -t.qty  -- Transfer out
          WHEN tm.tran_code = 11 AND tm.godown2 = ${Number(
            godown
          )} THEN t.qty   -- Transfer in
          ELSE 0
        END
      ) as stock
      FROM "Transactions" t
      JOIN "TRANSACTIONS_MASTER" tm ON t.tran_id = tm.tran_id
      WHERE t.itcd = ${itcd} 
      AND tm.dated <= ${fromDate}::timestamp
      AND (tm.godown2 = ${Number(godown)} OR tm.godown = ${Number(godown)})
    `;
    return stockResult[0]?.stock || 0;
  } else {
    // Calculate opening balance across all godowns
    const stockResult = await prisma.$queryRaw`
      SELECT SUM(
        CASE 
          WHEN tm.tran_code IN (4, 10, 12) THEN t.qty  -- Purchase, Sale Return (add to stock)
          WHEN tm.tran_code IN (6, 9, 5) THEN -t.qty  -- Sale, Purchase Return (remove from stock)
          WHEN tm.tran_code = 11 THEN 0  -- Transfers cancel out when summing all godowns
          ELSE 0
        END
      ) as stock
      FROM "Transactions" t
      JOIN "TRANSACTIONS_MASTER" tm ON t.tran_id = tm.tran_id
      WHERE t.itcd = ${itcd} 
      AND tm.dated < ${fromDate}
    `;
    return stockResult[0]?.stock || 0;
  }
}

async function getOpeningBalance(itemId, godownId, dateFrom) {
  // Implement logic to get opening balance for the item
  // This is a placeholder - implement your actual logic
  const openingTransactions = await prisma.transactionsMaster.findMany({
    where: {
      dated: {
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
        } else if (
          t.tran_code === 6 ||
          t.tran_code === 9 ||
          t.tran_code === 5
        ) {
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
    dated: {
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
      dated: "desc",
    },
  });

  return transactions.map((t) => {
    const filteredTransactions = t.transactions.filter((tran) =>
      [1, 2].includes(tran.sub_tran_id)
    );

    return {
      ...t,
      transactions: filteredTransactions,
      dated: new Date(t.dated).toLocaleDateString(),
      customer_name: t.acno?.acname || "Walk-in Customer",
      payment_mode: t.pycd === "0001" ? "Cash" : "Card",
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
        (sum, line) => sum + (line.gross_amount || 0), //damt
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

// Helper function to get transaction type label
function getTransactionTypeLabel(tranCode, subTranId = null) {
  const tranTypes = {
    1: subTranId === 2 ? "Receipt Deduction" : "Receipt",
    2: subTranId === 2 ? "Payment Deduction" : "Payment",
    3: "Journal",
    4: "Purchase Invoice",
    5: "POS",
    6: "Sale Invoice",
    9: "Purchase Return",
    10: "Sale Return",
    11: "Inter-Godown Transfer",
    12: "POS Sale Return",
  };
  return tranTypes[tranCode] || "Unknown";
}

async function getOpeningStock(productId, godownId, dateFrom) {

  const transactions = await prisma.transactionsMaster.findMany({
    where: {
      ...(dateFrom && {
        dated: {
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

async function getTransactionReport(tran_code, filters) {
  const where = {
    tran_code,
    dated: {
      ...(filters.dateFrom && { gte: new Date(filters.dateFrom) }),
      ...(filters.dateTo && { lte: new Date(filters.dateTo) }),
    },
  };

  if (filters.account) {
    where.acno_code = filters.account;
  }

  const transactions = await prisma.transactionsMaster.findMany({
    where,
    include: {
      acno: true,
      transactions: true,
    },
    orderBy: {
      dated: "desc",
    },
  });

  return transactions.map((t) => {
    let totalDamt = 0;
    let totalCamt = 0;

    // Loop through child transactions
    t.transactions
      ?.filter((t) => t.sub_tran_id !== 3)
      .forEach((tran) => {
        totalDamt += tran.damt || 0;
        totalCamt += tran.camt || 0;
      });

    // Optionally calculate net amount
    let netAmount;
    if (t.tran_code === 1) {
      netAmount = totalCamt - totalDamt; // For receipts, net is credit - debit
    } else if (t.tran_code === 2) {
      netAmount = totalDamt - totalCamt; // For payments, net is debit - credit
    }

    return {
      date: new Date(t.dated).toLocaleDateString(),
      vr_no: t.vr_no || "",
      account: t.acno?.acname || "",
      amount: netAmount || 0,
      damt: totalDamt,
      camt: totalCamt,
      narration: t.rmk || t.rmk1 || "",
    };
  });
}

function calculateTransactionSummary(data) {

  const totalDamt = data.reduce((sum, t) => sum + (t.damt || 0), 0);
  const totalCamt = data.reduce((sum, t) => sum + (t.camt || 0), 0);
  const totalNet = data.reduce((sum, t) => sum + (t.amount || 0), 0);

  return {
    total_transactions: data.length,
    total_damt: totalDamt,
    total_camt: totalCamt,
    total_net: totalNet,
  };
}

export async function getAccountLedger(filters) {
  let { dateFrom, dateTo, account } = filters;

  if (!account) {
    account = 2; // Default to Cash account if not provided
  }

  if(account) account = Number(account);

  if (!dateFrom) dateFrom = "2000-01-01";
  if (!dateTo) dateTo = new Date().toISOString().split("T")[0];

  const results = await prisma.$queryRaw`
    WITH txn AS ( 
      SELECT 
        t.acno,
        tm.dated,
        tm.vr_no,
        tm.tran_code,
        t.sub_tran_id,
        t.damt,
        t.camt,
        tm.rmk,
        
        -- Debit calculation (your helper logic in SQL)
        CASE 
          WHEN tm.tran_code = 1 AND t.sub_tran_id IN (2,3) THEN COALESCE(t.damt,0)
          WHEN tm.tran_code = 2 AND t.sub_tran_id = 1 THEN COALESCE(t.damt,0)
          WHEN tm.tran_code IN (3,4,5,6,9,10,12) THEN COALESCE(t.damt,0)
          ELSE 0
        END AS debit_amount,

        -- Credit calculation (your helper logic in SQL)
        CASE 
          WHEN tm.tran_code = 1 AND t.sub_tran_id = 1 THEN COALESCE(t.camt,0)
          WHEN tm.tran_code = 2 AND t.sub_tran_id IN (2,3) THEN COALESCE(t.camt,0)
          WHEN tm.tran_code IN (3,4,5,6,9,10,12) THEN COALESCE(t.camt,0)
          ELSE 0
        END AS credit_amount,

        -- Transaction type label
        CASE 
          WHEN tm.tran_code = 1 THEN 'Receipt'
          WHEN tm.tran_code = 2 THEN 'Payment'
          WHEN tm.tran_code = 3 THEN 'Journal'
          WHEN tm.tran_code = 4 THEN 'Purchase Invoice'
          WHEN tm.tran_code = 5 THEN 'POS'
          WHEN tm.tran_code = 6 THEN 'Sale Invoice'
          WHEN tm.tran_code = 9 THEN 'Purchase Return'
          WHEN tm.tran_code = 10 THEN 'Sale Return'
          WHEN tm.tran_code = 12 THEN 'POS Return'
          ELSE 'Other'
        END AS tran_type

      FROM "Transactions" t
      INNER JOIN "TRANSACTIONS_MASTER" tm ON t.tran_id = tm.tran_id
      WHERE t.acno = ${account}
        AND tm.tran_code IN (1,2,3,4,5,6,9,10,12)
    ),
    opening AS (
      SELECT 
        acno,
        SUM(debit_amount - credit_amount) AS opening_balance
      FROM txn
      WHERE dated < ${dateFrom}::date
      GROUP BY acno
    ),
    period_txn AS (
      SELECT 
        acno,
        dated,
        vr_no,
        tran_code,
        tran_type,
        sub_tran_id,
        debit_amount,
        credit_amount,
        rmk,
        SUM(debit_amount - credit_amount) OVER (
          PARTITION BY acno 
          ORDER BY dated, vr_no, sub_tran_id
          ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) AS balance_movement
      FROM txn
      WHERE dated BETWEEN ${dateFrom}::date AND ${dateTo}::date
    )
    SELECT 
      p.acno,
      p.dated,
      p.vr_no,
      p.tran_type,
      p.sub_tran_id,
      p.debit_amount AS debit,
      p.credit_amount AS credit,
      (COALESCE(o.opening_balance,0) + p.balance_movement) AS balance,
      p.rmk AS narration
    FROM period_txn p
    LEFT JOIN opening o ON o.acno = p.acno
    ORDER BY p.dated, p.vr_no, p.sub_tran_id;
  `;

  // Add an artificial "Opening Balance" row at top
  const openingBalance = await prisma.$queryRaw`
    SELECT COALESCE(SUM(
      CASE 
        WHEN tm.tran_code = 1 AND t.sub_tran_id IN (2,3) THEN COALESCE(t.damt,0)
        WHEN tm.tran_code = 2 AND t.sub_tran_id = 1 THEN COALESCE(t.damt,0)
        WHEN tm.tran_code IN (3,4,5,6,9,10,12) THEN COALESCE(t.damt,0)
        ELSE 0 END
      - CASE 
        WHEN tm.tran_code = 1 AND t.sub_tran_id = 1 THEN COALESCE(t.camt,0)
        WHEN tm.tran_code = 2 AND t.sub_tran_id IN (2,3) THEN COALESCE(t.camt,0)
        WHEN tm.tran_code IN (3,4,5,6,9,10,12) THEN COALESCE(t.camt,0)
        ELSE 0 END
    ),0) AS opening_balance
    FROM "Transactions" t
    INNER JOIN "TRANSACTIONS_MASTER" tm ON t.tran_id = tm.tran_id
    WHERE t.acno = ${account}
      AND tm.tran_code IN (1,2,3,4,5,6,9,10,12)
      AND tm.dated < ${dateFrom}::date;
  `;

  return [
    {
      date: dateFrom,
      vr_no: "Opening",
      tran_type: "Opening Balance",
      narration: "",
      debit: null,
      credit: null,
      balance: openingBalance[0].opening_balance,
    },
    ...results,
  ];
}


function calculateAccountLedgerSummary(data) {
  const debit = data.reduce((sum, t) => sum + (t.debit || 0), 0);
  const credit = data.reduce((sum, t) => sum + (t.credit || 0), 0);
  const closing = data.length > 0 ? data[data.length - 1].balance : 0;

  return { debit, credit, closing };
}


async function getAccountActivity(filters) {
  let { dateFrom, dateTo } = filters;

  if (!dateFrom) dateFrom = "2000-01-01";
  if (!dateTo) dateTo = new Date().toISOString().split("T")[0];

  const results = await prisma.$queryRaw`
    WITH txn AS (
      SELECT 
        t.acno,
        a.acname,
        tm.tran_code,
        t.sub_tran_id,
        
        -- Apply calculateAmounts logic here
        CASE 
          WHEN tm.tran_code = 1 AND t.sub_tran_id = 1 THEN 0
          WHEN tm.tran_code = 1 AND t.sub_tran_id IN (2,3) THEN COALESCE(t.damt,0)
          WHEN tm.tran_code = 2 AND t.sub_tran_id = 1 THEN COALESCE(t.damt,0)
          WHEN tm.tran_code = 2 AND t.sub_tran_id IN (2,3) THEN 0
          WHEN tm.tran_code IN (3,4,5,6,9,10,12) THEN COALESCE(t.damt,0)
          ELSE 0
        END AS debit_amount,

        CASE 
          WHEN tm.tran_code = 1 AND t.sub_tran_id = 1 THEN COALESCE(t.camt,0)
          WHEN tm.tran_code = 1 AND t.sub_tran_id IN (2,3) THEN 0
          WHEN tm.tran_code = 2 AND t.sub_tran_id = 1 THEN 0
          WHEN tm.tran_code = 2 AND t.sub_tran_id IN (2,3) THEN COALESCE(t.camt,0)
          WHEN tm.tran_code IN (3,4,5,6,9,10,12) THEN COALESCE(t.camt,0)
          ELSE 0
        END AS credit_amount,

        tm.dated
      FROM "Transactions" t
      INNER JOIN "TRANSACTIONS_MASTER" tm ON t.tran_id = tm.tran_id
      LEFT JOIN "acno" a ON t.acno = a.acno
      WHERE tm.tran_code IN (1,2,3,4,5,6,9,10,12)
    )
    SELECT 
      acno,
      COALESCE(acname, 'Unknown') AS account,
      
      -- Opening balance (before dateFrom)
      SUM(CASE WHEN dated < ${dateFrom}::date THEN debit_amount - credit_amount ELSE 0 END) AS opening_balance,
      
      -- Period debit & credit
      SUM(CASE WHEN dated BETWEEN ${dateFrom}::date AND ${dateTo}::date THEN debit_amount ELSE 0 END) AS debit,
      SUM(CASE WHEN dated BETWEEN ${dateFrom}::date AND ${dateTo}::date THEN credit_amount ELSE 0 END) AS credit,
      
      -- Closing balance = opening + period
      SUM(CASE WHEN dated <= ${dateTo}::date THEN debit_amount - credit_amount ELSE 0 END) AS closing_balance

    FROM txn
    GROUP BY acno, acname
    HAVING 
      SUM(CASE WHEN dated < ${dateFrom}::date THEN debit_amount - credit_amount ELSE 0 END) <> 0 OR
      SUM(CASE WHEN dated BETWEEN ${dateFrom}::date AND ${dateTo}::date THEN debit_amount ELSE 0 END) <> 0 OR
      SUM(CASE WHEN dated BETWEEN ${dateFrom}::date AND ${dateTo}::date THEN credit_amount ELSE 0 END) <> 0 OR
      SUM(CASE WHEN dated <= ${dateTo}::date THEN debit_amount - credit_amount ELSE 0 END) <> 0
    ORDER BY account ASC;
  `;

  return results;
}


function calculateAccountActivitySummary(data) {
  return {
    total_accounts: new Set(data.map((t) => t.account)).size,
    total_debit: data.reduce((sum, t) => sum + t.debit, 0),
    total_credit: data.reduce((sum, t) => sum + t.credit, 0),
  };
}

async function getTrialBalance(filters) {
  let { dateTo } = filters;

  if (!dateTo) {
    dateTo = new Date().toISOString().split("T")[0]; // default to today
  }

  const results = await prisma.$queryRaw`
    WITH txn AS (
  SELECT 
    t.acno,
    a.acname,
    tm.tran_code,
    t.sub_tran_id,
    -- Apply the same logic from calculateAmounts
    CASE 
      WHEN tm.tran_code = 1 AND t.sub_tran_id = 1 THEN 0
      WHEN tm.tran_code = 1 AND t.sub_tran_id IN (2,3) THEN COALESCE(t.damt,0)
      WHEN tm.tran_code = 2 AND t.sub_tran_id = 1 THEN COALESCE(t.damt,0)
      WHEN tm.tran_code = 2 AND t.sub_tran_id IN (2,3) THEN 0
      WHEN tm.tran_code IN (3,4,5,6,9,10,12) THEN COALESCE(t.damt,0)
      ELSE 0
    END AS debit_amount,

    CASE 
      WHEN tm.tran_code = 1 AND t.sub_tran_id = 1 THEN COALESCE(t.camt,0)
      WHEN tm.tran_code = 1 AND t.sub_tran_id IN (2,3) THEN 0
      WHEN tm.tran_code = 2 AND t.sub_tran_id = 1 THEN 0
      WHEN tm.tran_code = 2 AND t.sub_tran_id IN (2,3) THEN COALESCE(t.camt,0)
      WHEN tm.tran_code IN (3,4,5,6,9,10,12) THEN COALESCE(t.camt,0)
      ELSE 0
    END AS credit_amount

  FROM "Transactions" t
  INNER JOIN "TRANSACTIONS_MASTER" tm ON t.tran_id = tm.tran_id
  LEFT JOIN "acno" a ON t.acno = a.acno
  WHERE tm.dated <= ${dateTo}::date
    AND tm.tran_code IN (1,2,3,4,5,6,9,10,12)
)
SELECT 
  acno,
  COALESCE(acname, 'Unknown') AS account,
  GREATEST(SUM(debit_amount - credit_amount), 0) AS debit,
  GREATEST(SUM(credit_amount - debit_amount), 0) AS credit,
  SUM(debit_amount - credit_amount) AS balance
FROM txn
GROUP BY acno, acname
ORDER BY account ASC;

  `;

  return results;
}

function calculateTrialBalanceSummary(data) {
  const total_debit = data.reduce((sum, a) => sum + a.debit, 0);
  const total_credit = data.reduce((sum, a) => sum + a.credit, 0);
  return { total_debit, total_credit, diff: total_debit - total_credit };
}

// route.js
async function getStockMetricsReport(filters = {}) {
  try {
    const results = await prisma.$queryRaw`
      WITH stock_calc AS (
        SELECT 
          i.itcd,
          i.item,
          ic.ic_name AS category,
          g.id AS godown_id,
          g.godown,
          SUM(
            CASE 
              WHEN tm.tran_code IN (4,10,12) AND tm.godown = g.id THEN t.qty  -- Purchases / Sale Returns
              WHEN tm.tran_code IN (6,9,5) AND tm.godown = g.id THEN -t.qty  -- Sales / Purchase Returns / POS
              WHEN tm.tran_code = 11 AND tm.godown = g.id THEN -t.qty        -- Transfer Out
              WHEN tm.tran_code = 11 AND tm.godown2 = g.id THEN t.qty        -- Transfer In
              ELSE 0
            END
          ) AS stock
        FROM "Item" i
        LEFT JOIN "ItemCategory" ic ON i.ic_id = ic.id
        CROSS JOIN "Godown" g
        LEFT JOIN "Transactions" t ON t.itcd = i.itcd
        LEFT JOIN "TRANSACTIONS_MASTER" tm ON t.tran_id = tm.tran_id
        WHERE 1=1
          ${
            filters.category
              ? Prisma.sql`AND i.ic_id = ${parseInt(filters.category)}`
              : Prisma.empty
          }
        GROUP BY i.itcd, i.item, ic.ic_name, g.id, g.godown
      )
      SELECT 
        itcd,
        item,
        category,
        jsonb_object_agg(godown_id, stock) AS godownStocks,
        SUM(stock) AS totalStock
      FROM stock_calc
      GROUP BY itcd, item, category
      ${
        filters.showZero === "false"
          ? Prisma.sql`HAVING SUM(stock) > 0`
          : Prisma.empty
      }
      ORDER BY item ASC;
    `;

    // Also fetch godowns list for dynamic column headers
    const godowns = await prisma.godown.findMany({
      orderBy: { godown: "asc" },
    });

    return {
      items: results,
      godowns,
    };
  } catch (err) {
    console.error("Error generating stock metrics report:", err);
    return { items: [], godowns: [] };
  }
}

function calculateStockMetricsSummary(data) {
  const { items, godowns } = data;

  // Calculate total stock across all items and godowns
  const totalStock = items.reduce((sum, item) => sum + item.totalStock, 0);

  // Calculate godown-wise totals
  const godownTotals = {};
  godowns.forEach((godown) => {
    godownTotals[godown.id] = items.reduce(
      (sum, item) => sum + (item.godownstocks[godown.id] || 0),
      0
    );
  });

  return {
    total_items: items.length,
    total_stock: totalStock,
    godown_totals: godownTotals,
  };
}

async function getOrderBalanceReport(filters) {
  let { dateFrom, dateTo, orderType, customer, godown } = filters;
  // const { dateFrom, dateTo } = filters;

  // const orderType = "4";
  // const godown = "2";
  // const customer = "0013";

  // Validate required parameters
  if (!orderType) {
    orderType = 4; // Default to purchase orders if not provided
    // throw new Error("Order type is required (4 for purchase, 6 for sales)");
  }

  if (!dateFrom) dateFrom = "2000-01-01";
  if (!dateTo) dateTo = new Date().toISOString().split("T")[0];

  if(orderType) orderType = Number(orderType);
  if(godown) godown = Number(godown);
  if(customer) customer = Number(customer);


  // Determine if it's purchase order (4) or sales order (6)
  const isPurchaseOrder = parseInt(orderType) === 4;

  try {
    // Updated query based on the new PO verification approach
    const orderBalances = await prisma.$queryRaw`
      WITH po_verification AS (
        SELECT 
          om.order_no,
          om.dated as order_date,
          om.party_code,
          a.acname as customer_name,
          om.delivery_location,
          od.itcd,
          i.item as item_name,
          od.rate,
          od.amount,
          CONCAT('Verification for PO ', om.order_no, ', Item ', od.itcd) as description,
          od.qty as ordered_qty,
          
          -- Received quantity (purchases) - tran_code = 4
          COALESCE(SUM(CASE WHEN tm.tran_code = 4 THEN t.qty ELSE 0 END), 0) as purchased_qty,
          
          -- Returned quantity - tran_code = 9  
          COALESCE(SUM(CASE WHEN tm.tran_code = 9 THEN t.qty ELSE 0 END), 0) as returned_qty,
          
          -- Net received (purchases - returns)
          COALESCE(SUM(
            CASE 
              WHEN tm.tran_code = 4 THEN t.qty
              WHEN tm.tran_code = 9 THEN -t.qty
              ELSE 0
            END
          ), 0) as net_received
          
        FROM "OrderMaster" om
        JOIN "OrderDetail" od ON om.order_no = od.order_no
        JOIN "Item" i ON od.itcd = i.itcd
        LEFT JOIN "acno" a ON om.party_code = a.acno
        LEFT JOIN "TRANSACTIONS_MASTER" tm ON tm.po_no = om.order_no
        LEFT JOIN "Transactions" t ON t.tran_id = tm.tran_id AND t.itcd = od.itcd
        
        WHERE om.order_catagory = ${parseInt(orderType)}
          ${
            customer
              ? Prisma.sql`AND om.party_code = ${Number(customer)}`
              : Prisma.empty
          }
          ${
            godown
              ? Prisma.sql`AND om.godown = ${parseInt(godown)}`
              : Prisma.empty
          }
          ${
            dateFrom
              ? Prisma.sql`AND om.dated >= ${new Date(dateFrom)}::timestamp`
              : Prisma.empty
          }
          ${
            dateTo
              ? Prisma.sql`AND om.dated <= ${new Date(dateTo)}::timestamp`
              : Prisma.empty
          }
          AND (tm.tran_code IN (4, 9) OR tm.tran_code IS NULL)
        
        GROUP BY om.order_no, om.dated, om.party_code, a.acname, om.delivery_location, 
                 od.itcd, i.item, od.rate, od.amount, od.qty
      )
      SELECT 
        order_no,
        order_date,
        party_code,
        customer_name,
        delivery_location,
        itcd,
        item_name,
        rate::numeric as rate,
        amount::numeric as amount,
        description,
        ordered_qty::numeric as ordered_qty,
        purchased_qty::numeric as purchased_qty,
        returned_qty::numeric as returned_qty,
        net_received::numeric as net_received,
        
        -- Additional verification columns
        (ordered_qty - net_received)::numeric as pending_qty,
        
        CASE 
          WHEN net_received = ordered_qty THEN 'COMPLETE'
          WHEN net_received > ordered_qty THEN 'OVER_RECEIVED'
          WHEN net_received < ordered_qty AND net_received > 0 THEN 'PARTIAL'
          WHEN net_received = 0 THEN 'PENDING'
          ELSE 'ERROR'
        END as status,
        
        ROUND(
          CASE 
            WHEN ordered_qty > 0 THEN (net_received * 100.0 / ordered_qty)::numeric
            ELSE 0
          END, 2
        ) as completion_percentage
        
      FROM po_verification
      -- WHERE (ordered_qty - net_received) != 0  -- Only show items with balance
      ORDER BY order_no, itcd
    `;


    // Group by order for the final response
    const ordersMap = new Map();

    orderBalances.forEach((row) => {
      const orderNo = parseInt(row.order_no);

      if (!ordersMap.has(orderNo)) {
        ordersMap.set(orderNo, {
          orderNo: orderNo,
          orderDate: row.order_date,
          partyCode: row.party_code,
          customer: row.customer_name,
          deliveryLocation: row.delivery_location,
          items: [],
          totalOrdered: 0,
          totalPurchased: 0,
          totalReturned: 0,
          totalNetReceived: 0,
          totalPending: 0,
          totalAmount: 0,
        });
      }

      const order = ordersMap.get(orderNo);
      const orderedQty = parseFloat(row.ordered_qty) || 0;
      const purchasedQty = parseFloat(row.purchased_qty) || 0;
      const returnedQty = parseFloat(row.returned_qty) || 0;
      const netReceived = parseFloat(row.net_received) || 0;
      const pendingQty = parseFloat(row.pending_qty) || 0;
      const amount = parseFloat(row.amount) || 0;
      const completionPercentage = parseFloat(row.completion_percentage) || 0;

      order.items.push({
        itemCode: parseInt(row.itcd),
        itemName: row.item_name,
        description: row.description,
        orderedQty: orderedQty,
        purchasedQty: purchasedQty,
        returnedQty: returnedQty,
        netReceived: netReceived,
        pendingQty: pendingQty,
        status: row.status,
        completionPercentage: completionPercentage,
        rate: parseFloat(row.rate) || 0,
        amount: amount,
      });

      order.totalOrdered += orderedQty;
      order.totalPurchased += purchasedQty;
      order.totalReturned += returnedQty;
      order.totalNetReceived += netReceived;
      order.totalPending += pendingQty;
      order.totalAmount += amount;
    });

    const result = Array.from(ordersMap.values());

    return result;
    // {

    //   // success: true,
    //   result,
    //   // summary: {
    //   //   totalOrders: result.length,
    //   //   totalItems: orderBalances.length,
    //   //   orderType: isPurchaseOrder ? 'Purchase Orders' : 'Sales Orders'
    //   // }
    // };
  } catch (error) {
    console.error("Error in getOrderBalanceReport:", error);
    throw new Error(
      `Failed to generate order balance report: ${error.message}`
    );
  }
}

function calculateOrderBalanceSummary(data) {
  return {
    totalOrders: data?.length,
    totalOrdered: data?.reduce((sum, o) => sum + o.totalOrdered, 0),
    totalPurchased: data?.reduce((sum, o) => sum + o.totalPurchased, 0),
    totalReturned: data?.reduce((sum, o) => sum + o.totalReturned, 0),
    totalNetReceived: data?.reduce((sum, o) => sum + o.totalNetReceived, 0),
    totalPending: data?.reduce((sum, o) => sum + o.totalPending, 0),

    // Status-based metrics
    completeOrders: data?.filter((o) =>
      o.items.every((item) => item.status === "COMPLETE")
    ).length,
    partialOrders: data?.filter((o) =>
      o.items.some((item) => item.status === "PARTIAL")
    ).length,
    pendingOrders: data?.filter((o) =>
      o.items.every((item) => item.status === "PENDING")
    ).length,
    overReceivedOrders: data?.filter((o) =>
      o.items.some((item) => item.status === "OVER_RECEIVED")
    ).length,

    // Average completion percentage
    averageCompletion:
      data?.length > 0
        ? data.reduce(
            (sum, o) => sum + (o.totalNetReceived / o.totalOrdered) * 100,
            0
          ) / data.length
        : 0,
  };
}

async function getCustomerAgingReport(filters) {
  let { reportDate, customer } = filters;

  // Set default report date to current date if not provided
  const asOfDate = reportDate ? new Date(reportDate) : new Date();

  // Validate required parameters
  if (!customer) {
    customer =27;

    // throw new Error("Customer is required for aging report");
  }

  if(customer) customer = Number(customer);

  try {
    // Customer aging report query with corrected customer matching logic
    const agingReport = await prisma.$queryRaw`
      WITH customer_info AS (
        -- Get customer details for the party_code
        SELECT DISTINCT
          a.acno,
          a.acname AS customer_name
        FROM "acno" a
        WHERE a.acno = ${customer}
      ),

      sales_invoices AS (
        -- Get all sales invoices for the customer
        -- Customer code is in tm.pycd for sales invoices
        SELECT
          tm.tran_id,
          tm.dated AS invoice_date,
          tm.vr_no AS voucher_no,
          tm.tran_code,
          tm.invoice_no,
          tm.pycd AS customer_code,  -- Customer in pycd for sales
          COALESCE(SUM(t.damt), 0) AS invoice_amount,
          (tm.dated + INTERVAL '30 days') AS due_date
        FROM "TRANSACTIONS_MASTER" tm
        INNER JOIN "Transactions" t ON t.tran_id = tm.tran_id
        WHERE tm.pycd = ${customer}  -- Match customer in pycd
          AND tm.tran_code = 6  -- Sales Invoice
          AND tm.dated <= ${asOfDate}::date
          AND t.damt > 0
        GROUP BY tm.tran_id, tm.dated, tm.vr_no, tm.tran_code, tm.invoice_no, tm.pycd
      ),

      direct_receipts AS (
        -- Get receipts that are directly allocated to specific invoices
        -- For receipts: t.acno should match the customer who is paying
        SELECT
          t.invoice_no,
          t.acno AS customer_code,  -- Customer making payment (should equal sales invoice pycd)
          COALESCE(SUM(t.camt), 0) AS direct_receipt_amount
        FROM "TRANSACTIONS_MASTER" tm
        INNER JOIN "Transactions" t ON t.tran_id = tm.tran_id
        WHERE tm.tran_code = 1  -- Receipt Voucher
          AND tm.dated <= ${asOfDate}::date
          AND t.camt > 0
          AND t.acno = ${customer}  -- Receipt from this customer
          AND t.invoice_no IS NOT NULL  -- Only receipts with invoice numbers
          AND t.invoice_no != ''        -- Non-empty invoice numbers
        GROUP BY t.invoice_no, t.acno
      ),

      invoice_with_direct_receipts AS (
        -- Match invoices with their direct receipts only
        SELECT
          si.*,
          ci.customer_name,
          COALESCE(dr.direct_receipt_amount, 0) AS direct_receipts,
          
          -- Outstanding amount is simply invoice amount minus direct receipts
          si.invoice_amount - COALESCE(dr.direct_receipt_amount, 0) AS outstanding_amount,
          
          -- Calculate days outstanding from due date
          EXTRACT(DAY FROM (${asOfDate}::date - due_date)) AS days_outstanding
          
        FROM sales_invoices si
        LEFT JOIN customer_info ci ON ci.acno = si.customer_code
        LEFT JOIN direct_receipts dr ON dr.invoice_no = si.invoice_no 
                                      AND dr.customer_code = si.customer_code
      ),

      final_aging AS (
        SELECT
          *,
          -- Only show invoices with outstanding amounts (minimum threshold)  
          CASE WHEN outstanding_amount > 0.01 THEN outstanding_amount ELSE 0 END AS final_outstanding
        FROM invoice_with_direct_receipts
        WHERE outstanding_amount > 0.01  -- Only outstanding invoices
      )

      -- Final result with aging buckets
      SELECT
        customer_name,
        invoice_date,
        voucher_no,
        COALESCE(invoice_no, voucher_no::text) AS invoice_no,
        due_date,
        invoice_amount::numeric as invoice_amount,
        direct_receipts::numeric as direct_receipts,
        final_outstanding::numeric as outstanding_amount,
        days_outstanding::numeric as days_outstanding,
        
        -- Aging buckets
        CASE 
          WHEN days_outstanding <= 0 THEN final_outstanding::numeric
          ELSE 0 
        END AS current_amount,
        
        CASE 
          WHEN days_outstanding BETWEEN 1 AND 30 THEN final_outstanding::numeric
          ELSE 0 
        END AS days_1_30,
        
        CASE 
          WHEN days_outstanding BETWEEN 31 AND 60 THEN final_outstanding::numeric
          ELSE 0 
        END AS days_31_60,
        
        CASE 
          WHEN days_outstanding BETWEEN 61 AND 90 THEN final_outstanding::numeric
          ELSE 0 
        END AS days_61_90,
        
        CASE 
          WHEN days_outstanding BETWEEN 91 AND 120 THEN final_outstanding::numeric
          ELSE 0 
        END AS days_91_120,
        
        CASE 
          WHEN days_outstanding > 120 THEN final_outstanding::numeric
          ELSE 0 
        END AS days_over_120

      FROM final_aging
      ORDER BY invoice_date, voucher_no
    `;


    // Process the results
    const processedResults = agingReport.map((row) => ({
      customerName: row.customer_name,
      invoiceDate: row.invoice_date,
      voucherNo: parseInt(row.voucher_no),
      invoiceNo: row.invoice_no,
      dueDate: row.due_date,
      invoiceAmount: parseFloat(row.invoice_amount) || 0,
      directReceipts: parseFloat(row.direct_receipts) || 0,
      outstandingAmount: parseFloat(row.outstanding_amount) || 0,
      daysOutstanding: parseInt(row.days_outstanding) || 0,
      currentAmount: parseFloat(row.current_amount) || 0,
      days1To30: parseFloat(row.days_1_30) || 0,
      days31To60: parseFloat(row.days_31_60) || 0,
      days61To90: parseFloat(row.days_61_90) || 0,
      days91To120: parseFloat(row.days_91_120) || 0,
      daysOver120: parseFloat(row.days_over_120) || 0,
    }));

    return processedResults;
  } catch (error) {
    console.error("Error in getCustomerAgingReport:", error);
    throw new Error(
      `Failed to generate customer aging report: ${error.message}`
    );
  }
}

function calculateAgingSummary(data) {
  if (!data || data.length === 0) {
    return {
      totalInvoices: 0,
      totalInvoiceAmount: 0,
      totalDirectReceipts: 0,
      totalOutstanding: 0,
      currentAmount: 0,
      days1To30: 0,
      days31To60: 0,
      days61To90: 0,
      days91To120: 0,
      daysOver120: 0,
      averageDaysOutstanding: 0,
      oldestInvoiceDays: 0,
    };
  }

  const summary = {
    totalInvoices: data.length,
    totalInvoiceAmount: data.reduce((sum, item) => sum + item.invoiceAmount, 0),
    totalDirectReceipts: data.reduce(
      (sum, item) => sum + item.directReceipts,
      0
    ),
    totalOutstanding: data.reduce(
      (sum, item) => sum + item.outstandingAmount,
      0
    ),
    currentAmount: data.reduce((sum, item) => sum + item.currentAmount, 0),
    days1To30: data.reduce((sum, item) => sum + item.days1To30, 0),
    days31To60: data.reduce((sum, item) => sum + item.days31To60, 0),
    days61To90: data.reduce((sum, item) => sum + item.days61To90, 0),
    days91To120: data.reduce((sum, item) => sum + item.days91To120, 0),
    daysOver120: data.reduce((sum, item) => sum + item.daysOver120, 0),

    // Calculate average days outstanding (weighted by outstanding amount)
    averageDaysOutstanding:
      data.length > 0
        ? data.reduce(
            (sum, item) => sum + item.daysOutstanding * item.outstandingAmount,
            0
          ) / data.reduce((sum, item) => sum + item.outstandingAmount, 0) || 0
        : 0,

    // Find oldest invoice
    oldestInvoiceDays:
      data.length > 0
        ? Math.max(...data.map((item) => item.daysOutstanding))
        : 0,
  };

  // Round all numeric values to 2 decimal places
  Object.keys(summary).forEach((key) => {
    if (typeof summary[key] === "number") {
      summary[key] = Math.round(summary[key] * 100) / 100;
    }
  });

  return summary;
}
