"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Calendar as CalendarIcon } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Search,
  Filter,
  Calendar,
  DollarSign,
  Receipt,
  Eye,
  ArrowRight,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";

import React, { forwardRef } from "react";

const CustomDateInput = forwardRef(({ value, onClick, placeholder }, ref) => (
  <input
    onClick={onClick}
    ref={ref}
    readOnly
    placeholder={placeholder}
    value={value}
    className="w-full px-4 py-2 rounded-md border border-gray-300 cursor-pointer bg-white"
  />
));
CustomDateInput.displayName = "CustomDateInput";

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 9,
    hasNext: false,
    hasPrev: false,
    startItem: 0,
    endItem: 0,
  });
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const router = useRouter();

  const fetchOrders = async (page = 1, filterWithDate = false) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        search: searchTerm,
      });

      if (filterWithDate && dateRange[0].startDate && dateRange[0].endDate) {
        params.append("startDate", dateRange[0].startDate.toISOString());
        params.append("endDate", dateRange[0].endDate.toISOString());
      }

      const response = await axios.get(`/api/pos/orders?${params}`);
      setOrders(response.data.orders);
      setPagination(response.data.pagination);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setIsLoading(false);
    }
  };

  const clearDateFilter = () => {
    setDateRange([
      {
        startDate: null,
        endDate: null,
        key: "selection",
      },
    ]);
    fetchOrders(1, false); // Don't apply date filter
  };

  useEffect(() => {
    fetchOrders(1);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchOrders(1);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handlePageChange = (newPage) => {
    fetchOrders(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleView = (order) => {
    router.push(`/pos/orders/${order.tran_id}`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatCustomDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = d.toLocaleString("en-US", { month: "long" });
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const PaginationComponent = () => {
    const {
      currentPage,
      totalPages,
      hasNext,
      hasPrev,
      startItem,
      endItem,
      totalCount,
    } = pagination;

    const getPageNumbers = () => {
      const pages = [];
      const delta = 2;

      if (currentPage - delta > 1) {
        pages.push(1);
        if (currentPage - delta > 2) {
          pages.push("...");
        }
      }

      for (
        let i = Math.max(1, currentPage - delta);
        i <= Math.min(totalPages, currentPage + delta);
        i++
      ) {
        pages.push(i);
      }

      if (currentPage + delta < totalPages) {
        if (currentPage + delta < totalPages - 1) {
          pages.push("...");
        }
        pages.push(totalPages);
      }

      return pages;
    };

    if (totalPages <= 1) return null;

    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {startItem} to {endItem} of {totalCount} orders
          </div>

          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!hasPrev}
              className={`p-2 rounded-lg transition-colors ${
                hasPrev
                  ? "bg-blue-50 hover:bg-blue-100 text-primary"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.button>

            {getPageNumbers().map((page) => (
              <React.Fragment key={`page-${page}`}>
                {page === "..." ? (
                  <span className="px-3 py-2">...</span>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      page === currentPage
                        ? "bg-primary text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    {page}
                  </motion.button>
                )}
              </React.Fragment>
            ))}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!hasNext}
              className={`p-2 rounded-lg transition-colors ${
                hasNext
                  ? "bg-blue-50 hover:bg-blue-100 text-primary"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-4">
        <div className="max-w-full mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded-lg w-48"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                >
                  <div className="space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="sticky top-0 z-10 bg-white backdrop-blur-md shadow-lg rounded-md">
        <div className="max-w-full mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Order Management</h1>
              <p className="text-primary font-bold flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                {pagination.totalCount} total orders
              </p>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3 lg:w-auto w-full">
              <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 z-10 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search orders by Invoice No..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/90 backdrop-blur-sm z-0 relative"
                />
              </div>

              <div className="relative mt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDateFilter(!showDateFilter)}
                  className="px-6 py-3 rounded-xl border-gray-200 hover:bg-primary transition-all duration-200"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>

                <AnimatePresence>
                  {showDateFilter && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="absolute right-0 mt-2 z-20 bg-white rounded-xl shadow-xl border border-gray-200 p-4 w-[300px]"
                    >
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">
                          Filter by Date Range
                        </h4>
                        <DatePicker
                          selected={dateRange[0]?.startDate}
                          onChange={(date) =>
                            setDateRange([{ ...dateRange[0], startDate: date }])
                          }
                          selectsStart
                          startDate={dateRange[0]?.startDate}
                          endDate={dateRange[0]?.endDate}
                          maxDate={new Date()}
                          placeholderText="Start Date"
                          dateFormat="dd/MMMM/yyyy"
                          customInput={
                            <CustomDateInput
                              value={formatCustomDate(dateRange[0]?.startDate)}
                              placeholder="Start Date"
                            />
                          }
                        />

                        <DatePicker
                          selected={dateRange[0]?.endDate}
                          onChange={(date) =>
                            setDateRange([{ ...dateRange[0], endDate: date }])
                          }
                          selectsEnd
                          startDate={dateRange[0]?.startDate}
                          endDate={dateRange[0]?.endDate}
                          minDate={dateRange[0]?.startDate}
                          maxDate={new Date()}
                          placeholderText="End Date"
                          dateFormat="dd/MMMM/yyyy"
                          customInput={
                            <CustomDateInput
                              value={formatCustomDate(dateRange[0]?.endDate)}
                              placeholder="End Date"
                            />
                          }
                        />

                        <div className="flex justify-between">
                          <Button
                            variant="outline"
                            onClick={() => {
                              clearDateFilter();
                              setShowDateFilter(false);
                            }}
                            className="text-gray-700 hover:bg-primary"
                          >
                            Clear
                          </Button>
                          <Button
                            onClick={() => {
                              fetchOrders(1, true);
                              setShowDateFilter(false);
                            }}
                            className="bg-primary text-white"
                          >
                            Apply
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="max-w-full mx-auto p-4 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
          {orders.map((order, index) => {
            const totalAmount = order.transactions.reduce(
              (sum, t) => sum + t.gross_amount,
              0
            );

            return (
              <div
                key={`${order.id}-${index}`}
                className="group cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
                onClick={() => setSelectedOrder(order)}
              >
                <Card
                  onClick={() => router.push(`/pos/orders/${order.tran_id}`)}
                  className="relative overflow-hidden bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl"
                >
                  {/* Gradient Accent */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-primary from-blue-500 via-purple-500 to-pink-500"></div>

                  <div className="p-6 space-y-4">
                    {/* Header - Improved layout with better spacing */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <Receipt className="flex-shrink-0 w-5 h-5 text-primary" />
                          <h3 className="text-lg font-bold text-gray-900 truncate">
                            #{order.invoice_no.split("-").pop()}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600 font-medium truncate">
                          {order.customer || "No customer"}
                        </p>
                      </div>

                      <div
                        className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                          order.status
                        )} whitespace-nowrap`}
                      >
                        {order.sync_status.charAt(0).toUpperCase() +
                          order.sync_status.slice(1)}
                      </div>
                    </div>

                    {/* Date and Items - Improved alignment */}
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 flex-shrink-0 text-primary" />
                        <span className="whitespace-nowrap">
                          {new Date(order.dateD).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <span className="bg-gray-100 px-2 py-1 rounded-lg font-medium whitespace-nowrap">
                        {order.items || 0} items
                      </span>
                    </div>

                    {/* Amount - Improved button alignment */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <span className="text-2xl font-bold text-gray-900 truncate">
                          {formatCurrency(totalAmount)}
                        </span>
                      </div>

                      <Button
                        size="sm"
                        className="flex-shrink-0 bg-primary from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-xl transform transition-all duration-200 hover:scale-105 group-hover:shadow-lg"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Progress Bar - Unchanged */}
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          order.status === "completed"
                            ? "bg-gradient-to-r from-green-400 to-emerald-500"
                            : "bg-gradient-to-r from-amber-400 to-orange-500"
                        }`}
                        style={{
                          width: order.status === "completed" ? "100%" : "65%",
                          animationDelay: `${index * 200 + 500}ms`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-secondary to-secondary opacity-0 group-hover:opacity-15 transition-opacity duration-300 rounded-2xl"></div>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        <PaginationComponent />

        {/* Empty State */}
        {orders.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Receipt className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No orders found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search terms or filters
            </p>
            <Button
              onClick={clearDateFilter}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      {/* <div className="fixed bottom-6 right-6">
        <Button 
          size="lg"
          className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl hover:shadow-3xl transform transition-all duration-300 hover:scale-110"
        >
          <Receipt className="w-6 h-6" />
        </Button>
      </div> */}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .grid > div {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }

        .grid > div:nth-child(1) {
          animation-delay: 0.1s;
        }
        .grid > div:nth-child(2) {
          animation-delay: 0.2s;
        }
        .grid > div:nth-child(3) {
          animation-delay: 0.3s;
        }
        .grid > div:nth-child(4) {
          animation-delay: 0.4s;
        }
        .grid > div:nth-child(5) {
          animation-delay: 0.5s;
        }
        .grid > div:nth-child(6) {
          animation-delay: 0.6s;
        }
      `}</style>
    </div>
  );
};

export default OrderList;
