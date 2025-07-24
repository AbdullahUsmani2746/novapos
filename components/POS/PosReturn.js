"use client";
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Search,
  Filter,
  Calendar,
  DollarSign,
  Receipt,
  Eye,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ArrowLeft,
  Package,
  User,
  Clock,
  X,
  Minus,
  Plus,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  ShoppingCart,
  FileText,
  History,
} from "lucide-react";
import axios from "axios";
import { useSession } from "next-auth/react";

const ModernPOSReturnSystem = () => {
    const {data:session} = useSession();
      const userId = session?.user?.id;
  // States
  const [activeTab, setActiveTab] = useState("search"); // 'search', 'returns'
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [returnItems, setReturnItems] = useState([]);
  const [returnReason, setReturnReason] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Mock data for original orders
  const mockOrders = [
    {
      tran_id: 1,
      invoice_no: "POS-1640995200000",
      dateD: new Date("2024-01-15T14:30:00"),
      customer: "John Doe",
      customer_phone: "+1-555-0123",
      total_amount: 277.94,
      sync_status: "completed",
      user: { name: "Sales Rep 1" },
      transactions: [
        {
          id: 1,
          itcd: "ITEM001",
          item: "Wireless Headphones",
          qty: 2,
          rate: 99.99,
          gross_amount: 199.98,
        },
        {
          id: 2,
          itcd: "ITEM002",
          item: "Phone Case",
          qty: 1,
          rate: 29.99,
          gross_amount: 29.99,
        },
        {
          id: 3,
          itcd: "ITEM003",
          item: "Screen Protector",
          qty: 3,
          rate: 15.99,
          gross_amount: 47.97,
        },
      ],
    },
    {
      tran_id: 2,
      invoice_no: "POS-1640995300000",
      dateD: new Date("2024-01-14T16:45:00"),
      customer: "Jane Smith",
      customer_phone: "+1-555-0124",
      total_amount: 105.97,
      sync_status: "completed",
      user: { name: "Sales Rep 2" },
      transactions: [
        {
          id: 4,
          itcd: "ITEM004",
          item: "Bluetooth Speaker",
          qty: 1,
          rate: 79.99,
          gross_amount: 79.99,
        },
        {
          id: 5,
          itcd: "ITEM005",
          item: "USB Cable",
          qty: 2,
          rate: 12.99,
          gross_amount: 25.98,
        },
      ],
    },
    {
      tran_id: 3,
      invoice_no: "POS-1640995400000",
      dateD: new Date("2024-01-13T09:15:00"),
      customer: "Bob Wilson",
      customer_phone: "+1-555-0125",
      total_amount: 89.97,
      sync_status: "completed",
      user: { name: "Manager" },
      transactions: [
        {
          id: 6,
          itcd: "ITEM006",
          item: "T-Shirt Large",
          qty: 2,
          rate: 29.99,
          gross_amount: 59.98,
        },
        {
          id: 7,
          itcd: "ITEM007",
          item: "Coffee Mug",
          qty: 1,
          rate: 29.99,
          gross_amount: 29.99,
        },
      ],
    },
  ];

  // Mock returns data
  const mockReturns = [
    {
      tran_id: 101,
      invoice_no: "RET-1640995200000",
      dateD: new Date("2024-01-15T15:30:00"),
      originalInvoice: "POS-1640995200000",
      customer: "John Doe",
      sync_status: "completed",
      return_reason: "Defective product - headphones not working",
      user: { name: "Admin User" },
      return_amount: 99.99,
      transactions: [
        {
          id: 1,
          itcd: "ITEM001",
          item: "Wireless Headphones",
          qty: -1,
          rate: 99.99,
          gross_amount: -99.99,
        },
      ],
    },
  ];

  // Search orders
  //   const handleSearchOrders = async () => {
  //     if (!searchTerm.trim()) {
  //       alert("Please enter an invoice number or customer name");
  //       return;
  //     }

  //     setIsLoading(true);

  //     // Simulate API call
  //     setTimeout(() => {
  //       const filteredOrders = mockOrders.filter(
  //         (order) =>
  //           order.invoice_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //           order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //           order.customer_phone?.includes(searchTerm)
  //       );
  //       setOrders(filteredOrders);
  //       setIsLoading(false);
  //     }, 1000);
  //   };
  const handleSearchOrders = async () => {
    if (!searchTerm.trim()) {
      alert("Please enter an invoice number");
      return;
    }

    setIsLoading(true);

    try {
      // API call to search orders using axios
      const response = await axios.get(
        "/api/pos/orders/search",
        {
          searchTerm: searchTerm.trim(),
          // Add other search parameters if needed
          // searchType: 'invoice_or_customer'
        },
        {
          headers: {
            "Content-Type": "application/json",
            // Add authentication headers if needed
            // 'Authorization': `Bearer ${token}`
          },
        }
      );

      const data = response.data;

      // Assuming API returns: { success: true, orders: [...] }
      if (data) {
        setOrders(data.orders || []);
      } else {
        alert(data.message || "Failed to search orders");
        setOrders([]);
      }
    } catch (error) {
      console.error("Error searching orders:", error);

      // Handle axios errors
      if (error.response) {
        // Server responded with error status
        alert(
          `Error: ${error.response.data?.message || "Failed to search orders"}`
        );
      } else if (error.request) {
        // Request made but no response
        alert("Network error. Please check your connection.");
      } else {
        // Something else happened
        alert("Failed to search orders. Please try again.");
      }
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load returns
//   const loadReturns = () => {
//     setIsLoading(true);
//     setTimeout(() => {
//       setReturns(mockReturns);
//       setIsLoading(false);
//     }, 500);
//   };

const loadReturns = async () => {
  setIsLoading(true);
  
  try {
    // API call to get return history using axios
    const response = await axios.get('/api/pos/returns', {
      headers: {
        'Content-Type': 'application/json',
        // Add authentication headers if needed
        // 'Authorization': `Bearer ${token}`
      }
    });

    const data = response.data;
    
    // Assuming API returns: { success: true, returns: [...] }
    if (data) {
      setReturns(data.returns || []);
    } else {
      alert(data.message || 'Failed to load returns');
      setReturns([]);
    }
  } catch (error) {
    console.error('Error loading returns:', error);
    
    // Handle axios errors
    if (error.response) {
      // Server responded with error status
      alert(`Error: ${error.response.data?.message || 'Failed to load returns'}`);
    } else if (error.request) {
      // Request made but no response
      alert('Network error. Please check your connection.');
    } else {
      // Something else happened
      alert('Failed to load returns. Please try again.');
    }
    setReturns([]);
  } finally {
    setIsLoading(false);
  }
};

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "returns") {
      loadReturns();
    } else {
      setOrders([]);
      setSearchTerm("");
    }
  };

  // Initialize return process
  const handleInitiateReturn = (order) => {
    setSelectedOrder(order);
    setReturnItems(
      order.transactions
      .filter((t) => t.sub_tran_id !== 3)
      .map((item) => ({
        ...item,
        returnQty: 0,
        maxReturnQty: item.qty,
        returnAmount: 0,
      }))
    );
    setReturnReason("");
    setShowReturnModal(true);
  };

  // Update return quantity
  const updateReturnQty = (itemId, change) => {
    setReturnItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newQty = Math.max(
            0,
            Math.min(item.maxReturnQty, item.returnQty + change)
          );
          return {
            ...item,
            returnQty: newQty,
            returnAmount: newQty * item.rate,
          };
        }
        return item;
      })
    );
  };

  // Calculate totals
  const getTotalReturnAmount = () => {
    return returnItems.reduce((sum, item) => sum + item.returnAmount, 0);
  };

  const getReturnItemsCount = () => {
    return returnItems.filter((item) => item.returnQty > 0).length;
  };

  // Process return
//   const handleProcessReturn = async () => {
//     const itemsToReturn = returnItems.filter((item) => item.returnQty > 0);

//     if (itemsToReturn.length === 0) {
//       alert("Please select at least one item to return");
//       return;
//     }

//     if (!returnReason.trim()) {
//       alert("Please provide a reason for the return");
//       return;
//     }

//     setIsLoading(true);

//     // Simulate API call
//     setTimeout(() => {
//       setIsLoading(false);
//       setShowReturnModal(false);
//       setShowSuccess(true);

//       setTimeout(() => {
//         setShowSuccess(false);
//         setSelectedOrder(null);
//         setReturnItems([]);
//         setReturnReason("");
//         setActiveTab("returns");
//         loadReturns();
//       }, 3000);
//     }, 2000);
//   };

const handleProcessReturn = async () => {
  const itemsToReturn = returnItems.filter((item) => item.returnQty > 0);

  if (itemsToReturn.length === 0) {
    alert("Please select at least one item to return");
    return;
  }

  if (!returnReason.trim()) {
    alert("Please provide a reason for the return");
    return;
  }

  setIsLoading(true);

  try {
    // Prepare return data
    const returnData = {
      originalOrderId: selectedOrder.tran_id,
      returnReason: returnReason.trim(),
      userId:userId,
      returnItems: itemsToReturn.map(item => ({
        itcd: item.itcd,
        returnQty: item.returnQty,
        rate: item.rate,
        returnAmount: item.returnAmount
      })),
    };

    // API call to process return using axios
    const response = await axios.post('/api/pos/returns', returnData, {
      headers: {
        'Content-Type': 'application/json',
        // Add authentication headers if needed
        // 'Authorization': `Bearer ${token}`
      }
    });

    const data = response.data;
    
    if (data) {
      // Success - show success modal
      setIsLoading(false);
      setShowReturnModal(false);
      setShowSuccess(true);

      // Auto close success modal and refresh data
      setTimeout(() => {
        setShowSuccess(false);
        setSelectedOrder(null);
        setReturnItems([]);
        setReturnReason("");
        setActiveTab("returns");
        loadReturns(); // Refresh returns list
      }, 3000);
    } else {
      throw new Error(data.message || 'Failed to process return');
    }
  } catch (error) {
    console.error('Error processing return:', error);
    
    // Handle axios errors
    let errorMessage = 'Failed to process return. Please try again.';
    
    if (error.response) {
      // Server responded with error status
      errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
    } else if (error.request) {
      // Request made but no response
      errorMessage = 'Network error. Please check your connection.';
    } else if (error.message) {
      // Custom error message
      errorMessage = error.message;
    }
    
    alert(errorMessage);
    setIsLoading(false);
  }
};

  // Utility functions
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Math.abs(amount));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  // Success Modal
  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <Card className="max-w-md mx-auto text-center p-8 bg-white shadow-2xl rounded-3xl border-0">
          <div className="w-20 h-20 bg-emerald-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Return Processed Successfully!
          </h2>
          <p className="text-slate-600 mb-6">
            Return amount: {formatCurrency(getTotalReturnAmount())}
          </p>
          <div className="animate-spin w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full mx-auto"></div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-40">
        <div className="max-w-full mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-slate-100 rounded-xl"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  POS Returns
                </h1>
                <p className="text-slate-600">
                  Search orders and process returns
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 p-1 rounded-2xl max-w-full">
            <button
              onClick={() => handleTabChange("search")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === "search"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Search className="w-4 h-4" />
              Search Orders
            </button>
            <button
              onClick={() => handleTabChange("returns")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === "returns"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <History className="w-4 h-4" />
              Return History
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-full mx-auto p-6">
        {/* Search Orders Tab */}
        {activeTab === "search" && (
          <div className="space-y-6">
            {/* Search Section */}
            <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg rounded-3xl">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                Find Customer Order
              </h2>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Enter invoice number, customer name, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleSearchOrders()
                    }
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-slate-900 placeholder-slate-500"
                  />
                </div>
                <Button
                  onClick={handleSearchOrders}
                  disabled={isLoading}
                  className="px-8 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Search className="w-5 h-5 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Search Results */}
            {orders.length > 0 && (
              <Card className="overflow-hidden bg-white/70 backdrop-blur-sm border-0 shadow-lg rounded-3xl">
                <div className="p-6 border-b border-slate-200/50">
                  <h2 className="text-xl font-semibold text-slate-900">
                    Search Results ({orders.length})
                  </h2>
                </div>

                <div className="divide-y divide-slate-200/50">
                  {orders.map((order) => (
                    <div
                      key={order.tran_id}
                      className="p-6 hover:bg-slate-50/50 transition-all"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        {/* Order Info */}
                        <div className="flex-1">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center">
                              <Receipt className="w-6 h-6 text-blue-600" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-slate-900">
                                  {order.invoice_no}
                                </h3>
                                <span
                                  className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                                    order.sync_status
                                  )}`}
                                >
                                  {order.sync_status}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600">
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                  <span>{order.acno.acname}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  <span>{formatDate(order.dateD)}</span>
                                </div>
                                {order.customer_phone && (
                                  <div className="flex items-center gap-2">
                                    <Receipt className="w-4 h-4" />
                                    <span>{order.customer_phone}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                  <span>By: {order.user.name}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Items and Actions */}
                        <div className="lg:text-right">
                          <div className="mb-4">
                            <p className="text-2xl font-bold text-slate-900">
                              {formatCurrency(order.transactions.
                                filter(t=>t.sub_tran_id!==3)
                                .reduce((sum, rate) => sum + rate.camt, 0))}
                            </p>
                            <p className="text-sm text-slate-500">
                              {order.transactions
                              .filter((t) => t.sub_tran_id !== 3)
                              .length} item(s)
                            </p>
                          </div>

                          {/* Items Preview */}
                          <div className="space-y-1 mb-4">
                            {order.transactions
                              .filter((t) => t.sub_tran_id !== 3)
                              .slice(0, 3)
                              .map((transaction) => (
                                <div
                                  key={transaction.id}
                                  className="text-sm text-slate-600 flex items-center gap-2 bg-slate-50 rounded-lg p-2"
                                >
                                  <Package className="w-4 h-4" />
                                  <span>
                                    {transaction.itemDetails.item} (×{transaction.qty})
                                  </span>
                                </div>
                              ))}
                            {order.transactions.length > 3 && (
                              <div className="text-xs text-slate-500 text-center py-1">
                                +{order.transactions.length - 3} more items
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2 justify-end">
                            {/* <Button
                              variant="outline"
                              size="sm"
                              className="rounded-xl"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button> */}
                            <Button
                              onClick={() => handleInitiateReturn(order)}
                              size="sm"
                              className="rounded-xl bg-red-600 hover:bg-red-700 text-white"
                            >
                              <RotateCcw className="w-4 h-4 mr-1" />
                              Return
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* No Results */}
            {searchTerm && orders.length === 0 && !isLoading && (
              <Card className="p-12 text-center bg-white/70 backdrop-blur-sm border-0 shadow-lg rounded-3xl">
                <FileText className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No Orders Found
                </h3>
                <p className="text-slate-500">
                  No orders found matching &quot;{searchTerm}&quot;. Please
                  check the invoice number or customer details.
                </p>
              </Card>
            )}
          </div>
        )}

        {/* Returns History Tab */}
        {activeTab === "returns" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg rounded-3xl hover:shadow-xl transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">
                      Total Returns
                    </p>
                    <p className="text-3xl font-bold text-slate-900">
                      {returns.length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                    <TrendingDown className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg rounded-3xl hover:shadow-xl transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">
                      Return Value
                    </p>
                    <p className="text-3xl font-bold text-red-600">
                      {formatCurrency(
                        returns.map(tran=>tran.transactions.filter(t=>t.sub_tran_id!==3).reduce(
                          (total, ret) => total + ret.damt,
                          0
                        )
                      ))}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg rounded-3xl hover:shadow-xl transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">
                      Today&apos;s Returns
                    </p>
                    <p className="text-3xl font-bold text-slate-900">
                      {
                        returns.filter(
                          (r) =>
                            new Date(r.dateD).toDateString() ===
                            new Date().toDateString()
                        ).length
                      }
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Returns List */}
            <Card className="overflow-hidden bg-white/70 backdrop-blur-sm border-0 shadow-lg rounded-3xl">
              <div className="p-6 border-b border-slate-200/50">
                <h2 className="text-xl font-semibold text-slate-900">
                  Return History
                </h2>
              </div>

              {isLoading ? (
                <div className="p-12 text-center">
                  <RefreshCw className="w-10 h-10 animate-spin mx-auto mb-4 text-slate-400" />
                  <p className="text-slate-500">Loading returns...</p>
                </div>
              ) : returns.length === 0 ? (
                <div className="p-12 text-center">
                  <TrendingDown className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                  <p className="text-slate-500 text-lg">No returns found</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200/50">
                  {returns.map((returnItem) => (
                    <div
                      key={returnItem.tran_id}
                      className="p-6 hover:bg-slate-50/50 transition-all"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center">
                              <TrendingDown className="w-6 h-6 text-red-600" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-slate-900">
                                  {returnItem.invoice_no}
                                </h3>
                                <span
                                  className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                                    returnItem.sync_status
                                  )}`}
                                >
                                  {returnItem.sync_status}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600">
                                {/* <div className="flex items-center gap-2">
                                  <Receipt className="w-4 h-4" />
                                  <span>
                                    Original: {returnItem.originalInvoice}
                                  </span>
                                </div> */}
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                  <span>{returnItem.acno.acname}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  <span>{formatDate(returnItem.dateD)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                  <span>By: {returnItem.user.name}</span>
                                </div>
                              </div>

                              {returnItem.rmk1 && (
                                <p className="text-sm text-slate-500 mt-2 bg-slate-50 rounded-lg p-2">
                                  <strong>Reason:</strong>{" "}
                                  {returnItem.rmk1}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="lg:text-right">
                          <div className="mb-4">
                            <p className="text-2xl font-bold text-red-600">
                              -{formatCurrency(returnItem.transactions.filter(t=>t.sub_tran_id!==3).reduce((sum,rate)=>sum + rate.damt,0))}
                            </p>
                            <p className="text-sm text-slate-500">
                              {returnItem.transactions.filter(t=>t.sub_tran_id!==3).length} item(s)
                            </p>
                          </div>

                          <div className="space-y-1 mb-4">
                            {returnItem.transactions.filter(t=>t.sub_tran_id!==3).map((transaction) => (
                              <div
                                key={transaction.id}
                                className="text-sm text-slate-600 flex items-center gap-2 bg-slate-50 rounded-lg p-2"
                              >
                                <Package className="w-4 h-4" />
                                <span>
                                  {transaction.itemDetails.item} (×
                                  {Math.abs(transaction.qty)})
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button> */}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
      </div>

      {/* Return Processing Modal */}
      {showReturnModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <RotateCcw className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Process Return</h2>
                    <p className="text-red-100">
                      Invoice: {selectedOrder.invoice_no}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReturnModal(false)}
                  className="text-white hover:bg-white/20 rounded-xl"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>
            </div>

            <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Items List */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="p-6 bg-slate-50/50 rounded-2xl border-0">
                    <h3 className="text-lg font-semibold mb-4 text-slate-900">
                      Select Items to Return
                    </h3>

                    <div className="space-y-4">
                      {returnItems.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-md transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-slate-900 mb-1">
                                {item.itemDetails.item}
                              </h4>
                              <p className="text-sm text-slate-600 mb-2">
                                Code: {item.itcd} | Rate:{" "}
                                {formatCurrency(item.rate)}
                              </p>
                              <p className="text-sm text-slate-500">
                                Original Qty: {item.maxReturnQty} | Available:{" "}
                                {item.maxReturnQty - item.returnQty}
                              </p>
                            </div>

                            <div className="text-right">
                              <div className="flex items-center gap-3 mb-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateReturnQty(item.id, -1)}
                                  disabled={item.returnQty === 0}
                                  className="w-8 h-8 p-0 rounded-lg"
                                >
                                  <Minus className="w-4 h-4" />
                                </Button>

                                <span className="text-lg font-semibold text-slate-900 min-w-[3rem] text-center">
                                  {item.returnQty}
                                </span>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateReturnQty(item.id, 1)}
                                  disabled={item.returnQty >= item.maxReturnQty}
                                  className="w-8 h-8 p-0 rounded-lg"
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>

                              <p className="text-lg font-bold text-red-600">
                                {formatCurrency(item.returnAmount)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Return Reason */}
                  <Card className="p-6 bg-slate-50/50 rounded-2xl border-0">
                    <h3 className="text-lg font-semibold mb-4 text-slate-900">
                      Return Reason
                    </h3>
                    <textarea
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      placeholder="Please provide a detailed reason for the return..."
                      className="w-full h-24 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none"
                    />
                  </Card>
                </div>

                {/* Summary Panel */}
                <div className="space-y-6">
                  {/* Order Summary */}
                  <Card className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border-0">
                    <h3 className="text-lg font-semibold mb-4 text-slate-900">
                      Order Details
                    </h3>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Customer:</span>
                        <span className="font-medium text-slate-900">
                          {selectedOrder.acno.acname}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Date:</span>
                        <span className="font-medium text-slate-900">
                          {formatDate(selectedOrder.dateD)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Original Total:</span>
                        <span className="font-medium text-slate-900">
                          {formatCurrency(selectedOrder.transactions
                          .filter(t=>t.sub_tran_id!==3)
                          .reduce((sum, rate) => sum + rate.camt, 0))}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Sales Rep:</span>
                        <span className="font-medium text-slate-900">
                          {selectedOrder.user.name}
                        </span>
                      </div>
                    </div>
                  </Card>

                  {/* Return Summary */}
                  <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl border-0">
                    <h3 className="text-lg font-semibold mb-4 text-slate-900">
                      Return Summary
                    </h3>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Items Selected:</span>
                        <span className="font-medium text-slate-900">
                          {getReturnItemsCount()}
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Total Qty:</span>
                        <span className="font-medium text-slate-900">
                          {returnItems.reduce(
                            (sum, item) => sum + item.returnQty,
                            0
                          )}
                        </span>
                      </div>

                      <div className="border-t border-red-200 pt-3">
                        <div className="flex justify-between">
                          <span className="text-lg font-semibold text-slate-900">
                            Return Amount:
                          </span>
                          <span className="text-2xl font-bold text-red-600">
                            {formatCurrency(getTotalReturnAmount())}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button
                      onClick={handleProcessReturn}
                      disabled={
                        isLoading ||
                        getReturnItemsCount() === 0 ||
                        !returnReason.trim()
                      }
                      className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-lg font-semibold"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                          Processing Return...
                        </>
                      ) : (
                        <>
                          <RotateCcw className="w-5 h-5 mr-2" />
                          Process Return (
                          {formatCurrency(getTotalReturnAmount())})
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => setShowReturnModal(false)}
                      disabled={isLoading}
                      className="w-full py-4 rounded-2xl text-lg font-semibold"
                    >
                      Cancel
                    </Button>
                  </div>

                  {/* Validation Messages */}
                  {getReturnItemsCount() === 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                        <p className="text-sm text-amber-800">
                          Please select at least one item to return
                        </p>
                      </div>
                    </div>
                  )}

                  {!returnReason.trim() && getReturnItemsCount() > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                        <p className="text-sm text-amber-800">
                          Please provide a reason for the return
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernPOSReturnSystem;
