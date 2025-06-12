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
  ExternalLink
} from "lucide-react";

const PurchaseReturnReport = ({ onBack }) => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [filters, setFilters] = useState({
    supplierId: "",
    categoryId: "",
    status: "",
    reason: ""
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [summaryData, setSummaryData] = useState({});
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Mock data for Purchase Returns
  const mockPurchaseReturns = [
    {
      id: 1,
      returnNumber: "PR-2024-001",
      date: "2024-06-10",
      time: "15:30:00",
      originalPO: "PO-2024-005",
      supplier: "Tech Solutions Ltd",
      supplierId: "SUP-001",
      status: "Completed",
      reason: "Defective Items",
      totalItems: 3,
      totalQuantity: 5,
      totalAmount: 2500.00,
      processedBy: "Stock Manager",
      approvedBy: "Purchase Manager",
      items: [
        {
          id: 1,
          item: "Laptop Dell XPS 13",
          sku: "DELL-XPS-001",
          category: "Electronics",
          returnQty: 2,
          unitPrice: 1000.00,
          totalPrice: 2000.00,
          reason: "Screen flickering",
          condition: "Defective"
        },
        {
          id: 2,
          item: "Wireless Mouse",
          sku: "MS-WIRE-002",
          category: "Accessories",
          returnQty: 3,
          unitPrice: 25.00,
          totalPrice: 75.00,
          reason: "Wrong model",
          condition: "Good"
        }
      ],
      notes: "Items returned due to quality issues. Supplier agreed to replace.",
      refundStatus: "Processed",
      refundAmount: 2500.00
    },
    {
      id: 2,
      returnNumber: "PR-2024-002",
      date: "2024-06-08",
      time: "11:20:00",
      originalPO: "PO-2024-003",
      supplier: "Office Supplies Co",
      supplierId: "SUP-002",
      status: "Pending",
      reason: "Wrong Items Delivered",
      totalItems: 2,
      totalQuantity: 10,
      totalAmount: 150.00,
      processedBy: "Warehouse Clerk",
      approvedBy: "Pending",
      items: [
        {
          id: 3,
          item: "A4 Paper Pack",
          sku: "PAP-A4-001",
          category: "Stationery",
          returnQty: 10,
          unitPrice: 15.00,
          totalPrice: 150.00,
          reason: "Ordered A3, received A4",
          condition: "Good"
        }
      ],
      notes: "Waiting for supplier confirmation for exchange.",
      refundStatus: "Pending",
      refundAmount: 0.00
    },
    {
      id: 3,
      returnNumber: "PR-2024-003",
      date: "2024-06-05",
      time: "09:45:00",
      originalPO: "PO-2024-001",
      supplier: "Electronics Hub",
      supplierId: "SUP-003",
      status: "Cancelled",
      reason: "Supplier Rejected",
      totalItems: 1,
      totalQuantity: 1,
      totalAmount: 500.00,
      processedBy: "Purchase Officer",
      approvedBy: "N/A",
      items: [
        {
          id: 4,
          item: "Tablet Samsung Galaxy",
          sku: "TAB-SAM-001",
          category: "Electronics",
          returnQty: 1,
          unitPrice: 500.00,
          totalPrice: 500.00,
          reason: "Beyond return period",
          condition: "Good"
        }
      ],
      notes: "Return rejected by supplier due to policy violations.",
      refundStatus: "Rejected",
      refundAmount: 0.00
    }
  ];

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setReportData(mockPurchaseReturns);
      setSummaryData({
        totalReturns: mockPurchaseReturns.length,
        totalValue: mockPurchaseReturns.reduce((sum, item) => sum + item.totalAmount, 0),
        completedReturns: mockPurchaseReturns.filter(item => item.status === "Completed").length,
        pendingReturns: mockPurchaseReturns.filter(item => item.status === "Pending").length,
        totalRefunded: mockPurchaseReturns.reduce((sum, item) => sum + item.refundAmount, 0),
        avgReturnValue: mockPurchaseReturns.reduce((sum, item) => sum + item.totalAmount, 0) / mockPurchaseReturns.length
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
      case "completed": return "text-green-600 bg-green-100";
      case "pending": return "text-yellow-600 bg-yellow-100";
      case "cancelled": return "text-red-600 bg-red-100";
      case "processing": return "text-blue-600 bg-blue-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getReasonColor = (reason) => {
    switch (reason?.toLowerCase()) {
      case "defective items": return "text-red-600 bg-red-100";
      case "wrong items delivered": return "text-orange-600 bg-orange-100";
      case "damaged in transit": return "text-red-600 bg-red-100";
      case "supplier rejected": return "text-gray-600 bg-gray-100";
      default: return "text-blue-600 bg-blue-100";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
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
            className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-xl transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-xl transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </motion.button>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Return number, supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
          <select
            value={filters.supplierId}
            onChange={(e) => setFilters({...filters, supplierId: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="">All Suppliers</option>
            <option value="SUP-001">Tech Solutions Ltd</option>
            <option value="SUP-002">Office Supplies Co</option>
            <option value="SUP-003">Electronics Hub</option>
          </select>
        </div>
      </div>
    </motion.div>
  );

  const SummaryCards = () => (
    <div className="grid lg:grid-cols-6 md:grid-cols-3 sm:grid-cols-2 gap-4 mb-6">
      {[
        { label: "Total Returns", value: summaryData.totalReturns || 0, icon: RotateCcw, color: "blue" },
        { label: "Total Value", value: formatCurrency(summaryData.totalValue || 0), icon: DollarSign, color: "purple" },
        { label: "Completed", value: summaryData.completedReturns || 0, icon: CheckCircle, color: "green" },
        { label: "Pending", value: summaryData.pendingReturns || 0, icon: Clock, color: "yellow" },
        { label: "Total Refunded", value: formatCurrency(summaryData.totalRefunded || 0), icon: TrendingDown, color: "red" },
        { label: "Avg Return Value", value: formatCurrency(summaryData.avgReturnValue || 0), icon: Package, color: "indigo" }
      ].map((stat, index) => (
        <motion.div
          key={index}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            </div>
            <div className={`bg-${stat.color}-100 p-3 rounded-lg`}>
              <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
            </div>
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
        <h3 className="text-xl font-semibold text-gray-800">Purchase Returns Details</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Return Info</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Supplier</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Reason</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Items/Qty</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Amount</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Refund Status</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Actions</th>
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
                    <div className="text-sm font-medium text-blue-600">{returnItem.returnNumber}</div>
                    <div className="text-xs text-gray-500">{returnItem.date} {returnItem.time}</div>
                    <div className="text-xs text-gray-500">PO: {returnItem.originalPO}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-800">{returnItem.supplier}</div>
                    <div className="text-xs text-gray-500">{returnItem.supplierId}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(returnItem.status)}`}>
                      {returnItem.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getReasonColor(returnItem.reason)}`}>
                      {returnItem.reason}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-sm font-medium text-gray-800">{returnItem.totalItems} items</div>
                    <div className="text-xs text-gray-500">{returnItem.totalQuantity} qty</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-sm font-bold text-gray-800">{formatCurrency(returnItem.totalAmount)}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-sm font-medium text-gray-800">{returnItem.refundStatus}</div>
                    <div className="text-xs text-gray-500">{formatCurrency(returnItem.refundAmount)}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleRowExpansion(returnItem.id)}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-2 rounded-lg transition-colors"
                      >
                        {expandedRows.has(returnItem.id) ? 
                          <ChevronUp className="w-4 h-4" /> : 
                          <ChevronDown className="w-4 h-4" />
                        }
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
                                  <span className="text-gray-600">Processed By:</span>
                                  <span className="text-gray-800">{returnItem.processedBy}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Approved By:</span>
                                  <span className="text-gray-800">{returnItem.approvedBy}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Notes:</span>
                                  <span className="text-gray-800 text-right max-w-xs">{returnItem.notes}</span>
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
                                  <div key={idx} className="bg-gray-50 rounded-lg p-3">
                                    <div className="flex justify-between items-start mb-2">
                                      <div>
                                        <div className="font-medium text-gray-800">{item.item}</div>
                                        <div className="text-xs text-gray-500">SKU: {item.sku}</div>
                                      </div>
                                      <div className="text-right">
                                        <div className="font-medium text-gray-800">{formatCurrency(item.totalPrice)}</div>
                                        <div className="text-xs text-gray-500">Qty: {item.returnQty}</div>
                                      </div>
                                    </div>
                                    <div className="text-xs space-y-1">
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Reason:</span>
                                        <span className="text-gray-800">{item.reason}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Condition:</span>
                                        <span className={`${item.condition === 'Defective' ? 'text-red-600' : 'text-green-600'}`}>
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
      className="bg-white rounded-2xl shadow-xl p-6 mb-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-3 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Purchase Return Report</h2>
            <p className="text-gray-600">Track and manage all purchase returns</p>
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-12 text-center"
        >
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <RotateCcw className="text-white w-8 h-8 animate-spin" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Purchase Returns</h3>
          <p className="text-gray-600">Please wait while we fetch your return data...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <ReportHeader />
        <ReportFilters />
        <SummaryCards />
        <ReturnsTable />
      </div>
    </div>
  );
};

export default PurchaseReturnReport;