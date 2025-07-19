"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  BarChart3,
  FileText,
  Calendar,
  Filter,
  Download,
  Search,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  RefreshCw,
  Eye,
  Activity,
  BookOpen,
  DollarSign,
  Hash,
  Clock,
  Building,
  User,
  Warehouse,
  AlertCircle,
  CheckCircle,
  Loader2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Info,
  Undo,
  RotateCcw,
  PackageX,
  Receipt,
  UserCheck,
} from "lucide-react";
import PurchaseReturnReport from "@/components/POS/PurchaseReturn";
import SaleReturnReport from "@/components/POS/SaleReturn";

const StockReportsSystem = () => {
  const [currentView, setCurrentView] = useState("selection"); // selection, activity, ledger
  const [selectedReport, setSelectedReport] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [filters, setFilters] = useState({
    itemId: "",
    categoryId: "",
    companyId: "",
    godownId: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [summaryData, setSummaryData] = useState({});
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Mock data for demonstration
  const mockStockActivity = [
    {
      id: 1,
      date: "2024-06-10",
      time: "14:30:00",
      item: "Laptop Dell XPS 13",
      sku: "DELL-XPS-001",
      category: "Electronics",
      type: "Sale",
      quantity: -2,
      rate: 1200.0,
      amount: -2400.0,
      reference: "INV-2024-001",
      user: "John Doe",
      godown: "Main Store",
      balance: 48,
    },
    {
      id: 2,
      date: "2024-06-10",
      time: "10:15:00",
      item: "Laptop Dell XPS 13",
      sku: "DELL-XPS-001",
      category: "Electronics",
      type: "Purchase",
      quantity: 10,
      rate: 1000.0,
      amount: 10000.0,
      reference: "PO-2024-005",
      user: "Admin",
      godown: "Main Store",
      balance: 50,
    },
    {
      id: 3,
      date: "2024-06-09",
      time: "16:45:00",
      item: "Wireless Mouse",
      sku: "MS-WIRE-002",
      category: "Accessories",
      type: "Adjustment",
      quantity: -1,
      rate: 25.0,
      amount: -25.0,
      reference: "ADJ-2024-003",
      user: "Stock Manager",
      godown: "Main Store",
      balance: 99,
    },
  ];

  const mockStockLedger = [
    {
      id: 1,
      item: "Laptop Dell XPS 13",
      sku: "DELL-XPS-001",
      category: "Electronics",
      openingBalance: 40,
      openingValue: 40000.0,
      purchases: 10,
      purchaseValue: 10000.0,
      sales: 2,
      salesValue: 2400.0,
      adjustments: 0,
      adjustmentValue: 0.0,
      closingBalance: 48,
      closingValue: 47600.0,
      avgRate: 991.67,
      movements: [
        {
          date: "2024-06-10",
          type: "Purchase",
          qty: 10,
          rate: 1000.0,
          balance: 50,
        },
        {
          date: "2024-06-10",
          type: "Sale",
          qty: -2,
          rate: 1200.0,
          balance: 48,
        },
      ],
    },
    {
      id: 2,
      item: "Wireless Mouse",
      sku: "MS-WIRE-002",
      category: "Accessories",
      openingBalance: 100,
      openingValue: 2500.0,
      purchases: 0,
      purchaseValue: 0.0,
      sales: 0,
      salesValue: 0.0,
      adjustments: -1,
      adjustmentValue: -25.0,
      closingBalance: 99,
      closingValue: 2475.0,
      avgRate: 25.0,
      movements: [
        {
          date: "2024-06-09",
          type: "Adjustment",
          qty: -1,
          rate: 25.0,
          balance: 99,
        },
      ],
    },
  ];

  const reportTypes = [
    {
      id: "activity",
      title: "Stock Activity Report",
      subtitle: "Track all inventory movements and transactions",
      icon: Activity,
      color: "from-blue-600 to-indigo-600",
      description:
        "View detailed stock movements including purchases, sales, adjustments, and transfers with complete transaction history.",
      features: [
        "Real-time movements",
        "Transaction details",
        "User tracking",
        "Reference numbers",
      ],
    },
    {
      id: "ledger",
      title: "Stock Ledger Report",
      subtitle: "Complete inventory ledger with running balances",
      icon: BookOpen,
      color: "from-emerald-600 to-teal-600",
      description:
        "Comprehensive stock ledger showing opening balances, all movements, and closing balances with valuation.",
      features: [
        "Opening/Closing balances",
        "Valuation tracking",
        "Movement summary",
        "Average rates",
      ],
    },
    {
      id: "sale",
      title: "Sale Return Report",
      subtitle: "Track returned items from customers",
      icon: Undo,
      color: "from-pink-600 to-rose-600",
      description:
        "Monitor all returned items from sales, including reason codes, quantities, and value impact on stock.",
      features: [
        "Customer returns",
        "Return reasons",
        "Stock adjustments",
        "Credit notes",
      ],
    },
    {
      id: "purchase",
      title: "Purchase Return Report",
      subtitle: "Track returned items to vendors",
      icon: RotateCcw,
      color: "from-yellow-600 to-amber-600",
      description:
        "Keep track of items returned to suppliers with full audit trails and stock value changes.",
      features: [
        "Vendor returns",
        "Audit trail",
        "Return quantity/value",
        "Debit notes",
      ],
    },
    {
      id: "sales-summary",
      title: "Sales Summary Report",
      subtitle: "Overview of sales performance",
      icon: BarChart3,
      color: "from-sky-600 to-cyan-600",
      description:
        "Summarized view of sales over time, helping identify sales trends and performance metrics.",
      features: [
        "Date-wise breakdown",
        "Total sales amount",
        "Discounts applied",
        "Payment methods",
      ],
    },
    {
      id: "top-products",
      title: "Top Selling Products",
      subtitle: "Identify best performing products",
      icon: TrendingUp,
      color: "from-indigo-600 to-violet-600",
      description:
        "Lists the most popular items by volume or revenue, helping to optimize stock and marketing.",
      features: [
        "Top SKUs",
        "Revenue contribution",
        "Sales trends",
        "Fast-moving alerts",
      ],
    },
    {
      id: "low-stock",
      title: "Low Stock Report",
      subtitle: "Monitor items nearing out of stock",
      icon: PackageX,
      color: "from-red-600 to-orange-600",
      description:
        "Shows products that are below stock alert levels, helping avoid out-of-stock situations.",
      features: [
        "Current stock levels",
        "Reorder thresholds",
        "Category filter",
        "Restock suggestions",
      ],
    },
    {
      id: "profit-loss",
      title: "Profit & Loss Report",
      subtitle: "Track profitability over time",
      icon: DollarSign,
      color: "from-green-600 to-emerald-600",
      description:
        "Calculate gross profit, net profit, and cost of goods sold based on your sales and purchases.",
      features: [
        "Gross/net profit",
        "COGS analysis",
        "Sales vs. expenses",
        "Profit by product",
      ],
    },
    {
      id: "tax",
      title: "Tax Report",
      subtitle: "Overview of tax collected",
      icon: FileText,
      color: "from-purple-600 to-fuchsia-600",
      description:
        "Summarizes tax collected on each invoice, categorized by tax type and date.",
      features: [
        "Tax breakdown",
        "GST/VAT report",
        "Export-ready format",
        "Date filtering",
      ],
    },
    {
      id: "cashier",
      title: "Cashier Shift Report",
      subtitle: "Track performance by cashier or shift",
      icon: UserCheck,
      color: "from-gray-600 to-slate-600",
      description:
        "Detailed activity log per cashier or shift, including cash movements, sales, and voids.",
      features: [
        "Cash in/out",
        "Sales by user",
        "Voids and returns",
        "Shift open/close",
      ],
    },
  ];

  const fetchReportData = async (reportType) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (reportType === "activity") {
        setReportData(mockStockActivity);
        setSummaryData({
          totalMovements: 15,
          totalValue: 25000.0,
          purchases: 8,
          sales: 5,
          adjustments: 2,
        });
      } else {
        setReportData(mockStockLedger);
        setSummaryData({
          totalItems: 45,
          totalValue: 125000.0,
          totalPurchases: 18500.0,
          totalSales: 12300.0,
        });
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReportSelect = async (reportId) => {
    setSelectedReport(reportId);
    setCurrentView(reportId);
    await fetchReportData(reportId);
  };

  const toggleRowExpansion = (id) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case "sale":
        return "text-red-600 bg-red-100";
      case "purchase":
        return "text-green-600 bg-green-100";
      case "adjustment":
        return "text-yellow-600 bg-yellow-100";
      case "transfer":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const ReportSelection = () => (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="text-center">
            <div className="bg-primary from-blue-600 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="text-white w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Stock Reports</h1>
            <p className="text-md">
              Comprehensive inventory reporting and analysis
            </p>
          </div>
        </motion.div>

        {/* Report Type Selection */}
        <div className="grid md:grid-cols-2 gap-8">
          {reportTypes.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-white rounded-2xl shadow-lg hover:bg-secondary overflow-hidden cursor-pointer group transition-all duration-300"
              onClick={() => handleReportSelect(report.id)}
            >
              <div
                className={`h-2 bg-gradient-to-r ${report.color} transition-colors duration-300 group-hover:from-primary group-hover:to-primary`}
              />

              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div
                    className={`bg-gradient-to-r ${report.color} p-4 rounded-xl transition-all duration-300 group-hover:from-primary group-hover:to-primary`}
                  >
                    <report.icon className="text-white w-8 h-8" />
                  </div>

                  <ChevronRight className="text-gray-400 w-6 h-6 group-hover:text-primary transition-colors" />
                </div>

                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {report.title}
                </h3>
                <p className="text-gray-600 mb-6">{report.subtitle}</p>

                <p className="text-gray-700 mb-6 leading-relaxed">
                  {report.description}
                </p>

                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-800 text-sm">
                    Key Features:
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {report.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  const ReportFilters = () => (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white rounded-2xl shadow-lg p-6 mb-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          Filters & Options
        </h3>
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fetchReportData(selectedReport)}
            className="bg-primary text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-primary text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </motion.button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) =>
              setDateRange({ ...dateRange, startDate: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date
          </label>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) =>
              setDateRange({ ...dateRange, endDate: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Items
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by item name or SKU"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={filters.categoryId}
            onChange={(e) =>
              setFilters({ ...filters, categoryId: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
          >
            <option value="">All Categories</option>
            <option value="1">Electronics</option>
            <option value="2">Accessories</option>
            <option value="3">Software</option>
          </select>
        </div>
      </div>
    </motion.div>
  );

  const StockActivityReport = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {[
          {
            label: "Total Movements",
            value: summaryData.totalMovements || 0,
            icon: Activity,
            color: "blue",
          },
          {
            label: "Total Value",
            value: formatCurrency(summaryData.totalValue || 0),
            icon: DollarSign,
            color: "green",
          },
          {
            label: "Purchases",
            value: summaryData.purchases || 0,
            icon: TrendingUp,
            color: "emerald",
          },
          {
            label: "Sales",
            value: summaryData.sales || 0,
            icon: TrendingDown,
            color: "red",
          },
          {
            label: "Adjustments",
            value: summaryData.adjustments || 0,
            icon: AlertCircle,
            color: "yellow",
          },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-lg p-4"
          >
            <div className="flex flex-col items-center gap-1">
              <div className={`bg-secondary p-3 rounded-lg`}>
                <stat.icon className={`w-6 h-6 text-primary`} />
              </div>
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Activity Table */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-2xl shadow-xl sm:overflow-x-auto"
      >
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">
            Stock Activity Details
          </h3>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                  Date/Time
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                  Item Details
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                  Type
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">
                  Quantity
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">
                  Rate
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">
                  Amount
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">
                  Balance
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                  Reference
                </th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((activity, index) => (
                <motion.tr
                  key={activity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-800">{activity.date}</div>
                    <div className="text-xs text-gray-500">{activity.time}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-800">
                      {activity.item}
                    </div>
                    <div className="text-xs text-gray-500">
                      SKU: {activity.sku}
                    </div>
                    <div className="text-xs text-blue-600">
                      {activity.category}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(
                        activity.type
                      )}`}
                    >
                      {activity.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`font-medium ${
                        activity.quantity > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {activity.quantity > 0 ? "+" : ""}
                      {activity.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-800">
                    {formatCurrency(activity.rate)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`font-medium ${
                        activity.amount > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {formatCurrency(activity.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium text-gray-800">
                    {activity.balance}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-blue-600">
                      {activity.reference}
                    </div>
                    <div className="text-xs text-gray-500">{activity.user}</div>
                    <div className="text-xs text-gray-500">
                      {activity.godown}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );

  const StockLedgerReport = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-4">
        {[
          {
            label: "Total Items",
            value: summaryData.totalItems || 0,
            icon: Package,
            color: "blue",
          },
          {
            label: "Total Value",
            value: formatCurrency(summaryData.totalValue || 0),
            icon: DollarSign,
            color: "green",
          },
          {
            label: "Purchase Value",
            value: formatCurrency(summaryData.totalPurchases || 0),
            icon: TrendingUp,
            color: "emerald",
          },
          {
            label: "Sales Value",
            value: formatCurrency(summaryData.totalSales || 0),
            icon: TrendingDown,
            color: "red",
          },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-lg p-4"
          >
            <div className="flex flex-col items-center gap-1">
              <div className={`bg-secondary p-3 rounded-lg`}>
                <stat.icon className={`w-6 h-6 text-primary`} />
              </div>
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Ledger Table */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-2xl shadow-xl overflow-x-auto"
      >
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">
            Stock Ledger Summary
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                  Item Details
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">
                  Opening
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">
                  Purchases
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">
                  Sales
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">
                  Adjustments
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">
                  Closing
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">
                  Avg Rate
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((ledger, index) => (
                <React.Fragment key={ledger.id}>
                  <motion.tr
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-800">
                        {ledger.item}
                      </div>
                      <div className="text-xs text-gray-500">
                        SKU: {ledger.sku}
                      </div>
                      <div className="text-xs text-blue-600">
                        {ledger.category}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-sm font-medium text-gray-800">
                        {ledger.openingBalance}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatCurrency(ledger.openingValue)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-sm font-medium text-green-600">
                        {ledger.purchases}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatCurrency(ledger.purchaseValue)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-sm font-medium text-red-600">
                        {ledger.sales}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatCurrency(ledger.salesValue)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-sm font-medium text-yellow-600">
                        {ledger.adjustments}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatCurrency(ledger.adjustmentValue)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-sm font-bold text-gray-800">
                        {ledger.closingBalance}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatCurrency(ledger.closingValue)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-800">
                      {formatCurrency(ledger.avgRate)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleRowExpansion(ledger.id)}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-2 rounded-lg transition-colors"
                      >
                        {expandedRows.has(ledger.id) ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </motion.button>
                    </td>
                  </motion.tr>

                  <AnimatePresence>
                    {expandedRows.has(ledger.id) && (
                      <motion.tr
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-gray-50"
                      >
                        <td colSpan="8" className="px-6 py-4">
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                              <Activity className="w-4 h-4 mr-2" />
                              Recent Movements
                            </h4>
                            <div className="space-y-2">
                              {ledger.movements.map((movement, idx) => (
                                <div
                                  key={idx}
                                  className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                                >
                                  <div className="flex items-center space-x-3">
                                    <span
                                      className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(
                                        movement.type
                                      )}`}
                                    >
                                      {movement.type}
                                    </span>
                                    <span className="text-sm text-gray-600">
                                      {movement.date}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-4 text-sm">
                                    <span
                                      className={
                                        movement.qty > 0
                                          ? "text-green-600"
                                          : "text-red-600"
                                      }
                                    >
                                      {movement.qty > 0 ? "+" : ""}
                                      {movement.qty}
                                    </span>
                                    <span className="text-gray-600">
                                      @ {formatCurrency(movement.rate)}
                                    </span>
                                    <span className="font-medium text-gray-800">
                                      Bal: {movement.balance}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );

  const ReportHeader = () => (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white rounded-2xl shadow-xl p-6 mb-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentView("selection")}
            className="bg-primary text-white p-2 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {reportTypes.find((r) => r.id === selectedReport)?.title}
            </h2>
            <p className="text-gray-600">
              {reportTypes.find((r) => r.id === selectedReport)?.subtitle}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-gray-500">
            {dateRange.startDate} to {dateRange.endDate}
          </div>
        </div>
      </div>
    </motion.div>
  );

  const LoadingState = () => (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl p-12 text-center"
      >
        <div className="bg-primary from-blue-600 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Loader2 className="text-white w-8 h-8 animate-spin" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Loading Report Data
        </h3>
        <p className="text-gray-600">
          Please wait while we fetch your stock report...
        </p>
        <div className="mt-6 bg-gray-200 rounded-full h-2 overflow-hidden">
          <motion.div
            className="bg-primary from-blue-600 to-indigo-600 h-full rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </div>
  );

  // Main render logic
  if (isLoading) {
    return <LoadingState />;
  }

  if (currentView === "selection") {
    return <ReportSelection />;
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-4">
      <div className="max-w-[800px] mx-auto">
        <ReportHeader />
        <ReportFilters />

        <AnimatePresence mode="wait">
          {currentView === "activity" && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <StockActivityReport />
            </motion.div>
          )}

          {currentView === "ledger" && (
            <motion.div
              key="ledger"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <StockLedgerReport />
            </motion.div>
          )}

          {currentView === "purchase" && (
            <motion.div
              key="purchase"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <PurchaseReturnReport />
            </motion.div>
          )}

          {currentView === "sale" && (
            <motion.div
              key="sale"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <SaleReturnReport />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StockReportsSystem;
