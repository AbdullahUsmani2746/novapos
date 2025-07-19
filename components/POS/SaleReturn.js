import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCcw,
  Package,
  DollarSign,
  TrendingDown,
  Calendar,
  Filter,
  Download,
  Search,
  RefreshCw,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  FileX,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Building,
  Hash,
  Eye,
  ExternalLink,
} from "lucide-react";

const SaleReturnReport = ({ onBack }) => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [filters, setFilters] = useState({
    customerId: "",
    categoryId: "",
    status: "",
    reason: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [summaryData, setSummaryData] = useState({});
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Mock data for Sale Returns
  const mockSaleReturns = [
    {
      id: 1,
      returnNumber: "SR-2024-001",
      date: "2024-06-12",
      time: "14:20:00",
      originalSO: "SO-2024-007",
      customer: "John Smith",
      customerId: "CUS-001",
      status: "Completed",
      reason: "Defective Product",
      totalItems: 2,
      totalQuantity: 4,
      totalAmount: 1800.0,
      processedBy: "Sales Associate",
      approvedBy: "Sales Manager",
      items: [
        {
          id: 1,
          item: "Smartphone Galaxy S23",
          sku: "SAM-S23-001",
          category: "Electronics",
          returnQty: 1,
          unitPrice: 1500.0,
          totalPrice: 1500.0,
          reason: "Battery issue",
          condition: "Defective",
        },
        {
          id: 2,
          item: "Phone Case",
          sku: "CASE-S23-001",
          category: "Accessories",
          returnQty: 3,
          unitPrice: 100.0,
          totalPrice: 300.0,
          reason: "Wrong color",
          condition: "Good",
        },
      ],
      notes: "Customer reported issues with battery life. Replacement issued.",
      refundStatus: "Processed",
      refundAmount: 1800.0,
    },
    {
      id: 2,
      returnNumber: "SR-2024-002",
      date: "2024-06-10",
      time: "10:15:00",
      originalSO: "SO-2024-004",
      customer: "Emma Johnson",
      customerId: "CUS-002",
      status: "Pending",
      reason: "Changed Mind",
      totalItems: 1,
      totalQuantity: 2,
      totalAmount: 200.0,
      processedBy: "Customer Service",
      approvedBy: "Pending",
      items: [
        {
          id: 3,
          item: "Headphones Wireless",
          sku: "HP-WIRE-001",
          category: "Electronics",
          returnQty: 2,
          unitPrice: 100.0,
          totalPrice: 200.0,
          reason: "Customer preference",
          condition: "Good",
        },
      ],
      notes: "Awaiting manager approval for refund.",
      refundStatus: "Pending",
      refundAmount: 0.0,
    },
    {
      id: 3,
      returnNumber: "SR-2024-003",
      date: "2024-06-07",
      time: "16:45:00",
      originalSO: "SO-2024-002",
      customer: "Bright Retail",
      customerId: "CUS-003",
      status: "Cancelled",
      reason: "Out of Return Period",
      totalItems: 1,
      totalQuantity: 1,
      totalAmount: 300.0,
      processedBy: "Sales Clerk",
      approvedBy: "N/A",
      items: [
        {
          id: 4,
          item: "Smartwatch Series 5",
          sku: "WATCH-S5-001",
          category: "Wearables",
          returnQty: 1,
          unitPrice: 300.0,
          totalPrice: 300.0,
          reason: "Return requested after 30 days",
          condition: "Good",
        },
      ],
      notes: "Return rejected due to policy violation.",
      refundStatus: "Rejected",
      refundAmount: 0.0,
    },
  ];

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setReportData(mockSaleReturns);
      setSummaryData({
        totalReturns: mockSaleReturns.length,
        totalValue: mockSaleReturns.reduce(
          (sum, item) => sum + item.totalAmount,
          0
        ),
        completedReturns: mockSaleReturns.filter(
          (item) => item.status === "Completed"
        ).length,
        pendingReturns: mockSaleReturns.filter(
          (item) => item.status === "Pending"
        ).length,
        totalRefunded: mockSaleReturns.reduce(
          (sum, item) => sum + item.refundAmount,
          0
        ),
        avgReturnValue:
          mockSaleReturns.reduce((sum, item) => sum + item.totalAmount, 0) /
          mockSaleReturns.length,
      });
    } catch (error) {
      console.error("Error fetching report data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  const toggleRowExpansion = (id) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      case "processing":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getReasonColor = (reason) => {
    switch (reason?.toLowerCase()) {
      case "defective product":
        return "text-red-600 bg-red-100";
      case "changed mind":
        return "text-orange-600 bg-orange-100";
      case "out of return period":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-blue-600 bg-blue-100";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const ReportFilters = () => (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white rounded-2xl shadow-xl p-6 mb-6"
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
            onClick={fetchReportData}
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

      <div className="grid lg:grid-cols-5 md:grid-cols-3 gap-4">
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
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Return number, customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
          >
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customer
          </label>
          <select
            value={filters.customerId}
            onChange={(e) =>
              setFilters({ ...filters, customerId: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
          >
            <option value="">All Customers</option>
            <option value="CUS-001">John Smith</option>
            <option value="CUS-002">Emma Johnson</option>
            <option value="CUS-003">Bright Retail</option>
          </select>
        </div>
      </div>
    </motion.div>
  );

  const SummaryCards = () => (
    <div className="grid lg:grid-cols-6 md:grid-cols-3 sm:grid-cols-2 gap-4 mb-6">
      {[
        {
          label: "Total Returns",
          value: summaryData.totalReturns || 0,
          icon: RotateCcw,
          color: "blue",
        },
        {
          label: "Total Value",
          value: formatCurrency(summaryData.totalValue || 0),
          icon: DollarSign,
          color: "purple",
        },
        {
          label: "Completed",
          value: summaryData.completedReturns || 0,
          icon: CheckCircle,
          color: "green",
        },
        {
          label: "Pending",
          value: summaryData.pendingReturns || 0,
          icon: Clock,
          color: "yellow",
        },
        {
          label: "Total Refunded",
          value: formatCurrency(summaryData.totalRefunded || 0),
          icon: TrendingDown,
          color: "red",
        },
        {
          label: "Avg Return Value",
          value: formatCurrency(summaryData.avgReturnValue || 0),
          icon: Package,
          color: "indigo",
        },
      ].map((stat, index) => (
        <motion.div
          key={index}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex flex-col items-center gap-1">
            <div className={`bg-secondary p-3 rounded-lg`}>
              <stat.icon className={`w-6 h-6 text-primary`} />
            </div>
            <p className="text-sm text-gray-600 truncate">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const ReturnsTable = () => (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white rounded-2xl shadow-xl overflow-hidden"
    >
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800">
          Sale Returns Details
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                Return Info
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                Customer
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                Status
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                Reason
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">
                Items/Qty
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">
                Amount
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">
                Refund Status
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((returnItem, index) => (
              <React.Fragment key={returnItem.id}>
                <motion.tr
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-blue-600">
                      {returnItem.returnNumber}
                    </div>
                    <div className="text-xs text-gray-500">
                      {returnItem.date} {returnItem.time}
                    </div>
                    <div className="text-xs text-gray-500">
                      SO: {returnItem.originalSO}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-800">
                      {returnItem.customer}
                    </div>
                    <div className="text-xs text-gray-500">
                      {returnItem.customerId}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        returnItem.status
                      )}`}
                    >
                      {returnItem.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getReasonColor(
                        returnItem.reason
                      )}`}
                    >
                      {returnItem.reason}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-sm font-medium text-gray-800">
                      {returnItem.totalItems} items
                    </div>
                    <div className="text-xs text-gray-500">
                      {returnItem.totalQuantity} qty
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-sm font-bold text-gray-800">
                      {formatCurrency(returnItem.totalAmount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-sm font-medium text-gray-800">
                      {returnItem.refundStatus}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatCurrency(returnItem.refundAmount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleRowExpansion(returnItem.id)}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-2 rounded-lg transition-colors"
                      >
                        {expandedRows.has(returnItem.id) ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>

                <AnimatePresence>
                  {expandedRows.has(returnItem.id) && (
                    <motion.tr
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-gray-50"
                    >
                      <td colSpan="8" className="px-6 py-4">
                        <div className="bg-white rounded-lg p-6 border border-gray-200">
                          <div className="grid md:grid-cols-2 gap-6">
                            {/* Return Details */}
                            <div>
                              <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                                <FileX className="w-4 h-4 mr-2" />
                                Return Details
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">
                                    Processed By:
                                  </span>
                                  <span className="text-gray-800">
                                    {returnItem.processedBy}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">
                                    Approved By:
                                  </span>
                                  <span className="text-gray-800">
                                    {returnItem.approvedBy}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Notes:</span>
                                  <span className="text-gray-800 text-right max-w-xs">
                                    {returnItem.notes}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Items Details */}
                            <div>
                              <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                                <Package className="w-4 h-4 mr-2" />
                                Returned Items
                              </h4>
                              <div className="space-y-3">
                                {returnItem.items.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="bg-gray-50 rounded-lg p-3"
                                  >
                                    <div className="flex justify-between items-start mb-2">
                                      <div>
                                        <div className="font-medium text-gray-800">
                                          {item.item}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          SKU: {item.sku}
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <div className="font-medium text-gray-800">
                                          {formatCurrency(item.totalPrice)}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          Qty: {item.returnQty}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-xs space-y-1">
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">
                                          Reason:
                                        </span>
                                        <span className="text-gray-800">
                                          {item.reason}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">
                                          Condition:
                                        </span>
                                        <span
                                          className={`${
                                            item.condition === "Defective"
                                              ? "text-red-600"
                                              : "text-green-600"
                                          }`}
                                        >
                                          {item.condition}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
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
  );

  const ReportHeader = () => (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white rounded-2xl shadow-lg p-6 mb-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="bg-primary text-white p-2 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Sale Return Report
            </h2>
            <p className="text-gray-600">Track and manage all sale returns</p>
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-12 text-center"
        >
          <div className="bg-primary from-purple-600 to-pink-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <RotateCcw className="text-white w-8 h-8 animate-spin" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Loading Sale Returns
          </h3>
          <p className="text-gray-600">
            Please wait while we fetch your return data...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-0 py-4">
      <div className="max-w-[800px] mx-auto">
        <ReportHeader />
        <ReportFilters />
        <SummaryCards />
        <ReturnsTable />
      </div>
    </div>
  );
};

export default SaleReturnReport;
