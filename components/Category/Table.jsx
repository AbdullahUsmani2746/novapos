"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import VoucherModal from "./Modal"; // Adjust path as needed;
import { VOUCHER_CONFIG } from "./constants";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Eye,
  Calendar,
  DollarSign,
  FileText,
  User,
  Hash,
  X,
  Download,
  Filter,
  RefreshCw,
  Clock,
  Building,
  CheckCircle,
  Edit,
  Delete,
  Printer,
} from "lucide-react";
import axios from "axios";
import { createPortal } from "react-dom";
import { generateVoucherPDF } from "@/components/Template/Payment"; // update path as needed
import { generateUnifiedPDF } from "../Template/UnifiedReport";
import { generateSalesOrderPDF } from "../Template/SalesOrder";
import { generatePurchaseOrderPDF } from "../Template/PurchaseOrder";

// Status badge component
const StatusBadge = ({ status }) => {
  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "synced":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyle(
        status
      )}`}
    >
      {status === "synced" && <CheckCircle className="h-3 w-3 mr-1" />}
      {status === "pending" && <Clock className="h-3 w-3 mr-1" />}
      {status === "failed" && <AlertCircle className="h-3 w-3 mr-1" />}
      {status}
    </span>
  );
};

// Transaction item component
const TransactionItem = ({ transaction, index }) => {
  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-900">
          Transaction #{index + 1}
        </h4>
        <span className="text-xs text-gray-500">ID: {transaction.id}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        {transaction.acno && (
          <div>
            <span className="font-medium text-gray-600">Account No:</span>
            <span className="ml-2 text-gray-900">
              {transaction.acnoDetails.acname}
            </span>
          </div>
        )}

        {transaction.itcd && (
          <div>
            <span className="font-medium text-gray-600">Item Code:</span>
            <span className="ml-2 text-gray-900">
              {transaction.itemDetails.item}
            </span>
          </div>
        )}

        {transaction.ccno && (
          <div>
            <span className="font-medium text-gray-600">Cost Center:</span>
            <span className="ml-2 text-gray-900">{transaction.ccno}</span>
          </div>
        )}

        {transaction.damt && (
          <div>
            <span className="font-medium text-gray-600">Debit:</span>
            <span className="ml-2 text-gray-900 font-semibold text-green-600">
              $
              {Number(transaction.damt).toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
        )}

        {transaction.camt && (
          <div>
            <span className="font-medium text-gray-600">Credit:</span>
            <span className="ml-2 text-gray-900 font-semibold text-red-600">
              $
              {Number(transaction.camt).toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
        )}

        {(transaction.narration1 || transaction.narration2) && (
          <div className="col-span-2">
            <span className="font-medium text-gray-600">Narration:</span>
            <div className="mt-1 text-gray-900">
              {transaction.narration1 && <div>{transaction.narration1}</div>}
              {transaction.narration2 && <div>{transaction.narration2}</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main DataViewModal component
const DataViewModal = ({ data, isOpen, onClose }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState("");
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

  if (!isOpen || !data) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateOnly = (dateString) => {
    if (!dateString) return "N/A";
    console.log(dateString);
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  function prepareVoucherForPDF(voucher, documentType = "sales") {
    const customer = {
      name: voucher.acno?.acname || "Unknown",
      strn: "Not Available",
      ntn: "Not Available",
      address: voucher.godownDetails?.godown || "Not Provided",
    };

    const entries = voucher.transactions
      .filter((t) => t.sub_tran_id !== 3)
      .map((t, idx) => {
        const itemName = t.itemDetails?.item || "Unknown Item";
        const batchNo = t.chno || "-";
        const qty = t.qty ?? 0;
        const unit = "KG"; // or t.unit if you have it
        const rate = t.rate ?? 0;
        const amount = (t.qty ?? 0) * (t.rate ?? 0);

        if (documentType === "delivery") {
          return [
            idx + 1,
            itemName,
            batchNo,
            `${t.no_of_pack}x${t.qty_per_pack}=${qty}`,
          ];
        }

        return [idx + 1, itemName, batchNo, qty, unit, rate, amount];
      });

    const totalAmount = entries.reduce(
      (acc, row) => acc + (row.at(-1) || 0),
      0
    );

    // Calculate total sales tax from all transactions
    const totalSalesTax = voucher.transactions
      .filter((t) => t.sub_tran_id !== 3)
      .reduce((acc, t) => {
        const amount = (t.qty ?? 0) * (t.rate ?? 0);
        const taxRate = (t.st_rate ?? 0) + (t.additional_tax ?? 0);
        return acc + amount * (taxRate / 100);
      }, 0);

    const grandTotal = totalAmount + totalSalesTax;

    const totals = {
      amount: totalAmount,
      tax: {
        label: "SALES TAX",
        value: totalSalesTax,
      },
      grandTotal: {
        label: "GRAND TOTAL",
        value: grandTotal,
      },
    };

    const invoice = {
      number: voucher.invoice_no || `INV-${voucher.vr_no}`,
      date: voucher.dateD
        ? new Date(voucher.dateD).toLocaleDateString("en-GB")
        : new Date().toLocaleDateString("en-GB"),
      po: "-",
      dueDate: "30 Days",
    };

    return {
      dateD: voucher.dateD,
      tran_code: voucher.tran_code,
      vr_no: voucher.vr_no,
      userId: voucher.userId,
      rmk: voucher.rmk,
      rmk1: voucher.rmk1,
      transactions: voucher.transactions,
      acno: voucher.acno,
      documentType,
      customer,
      entries,
      totals,
      invoice,
    };
  }

  const handleOnExport = async (type) => {
    setIsExporting(true);
    setExportType(type);

    try {
      const res = await axios.get(`/api/voucher/getById?id=${data.tran_id}`);
      const resData = await res.data.data;
      const mapped = prepareVoucherForPDF(resData, type);
      const doc = generateUnifiedPDF(mapped);
      doc.save(`${type}_invoice.pdf`);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
      setExportType("");
    }
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Transaction Details
                </h2>
                <p className="text-sm text-gray-600">
                  Voucher #{data.vr_no} | Transaction ID: {data.tran_id}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-6 space-y-6">
            {/* Main Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Date Information */}
              <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Transaction Date
                  </p>
                  <p className="text-sm text-blue-700">
                    {formatDateOnly(data.dateD)}
                  </p>
                </div>
              </div>

              {/* Check Date */}
              {data.check_date && (
                <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-900">
                      Check Date
                    </p>
                    <p className="text-sm text-green-700">
                      {formatDateOnly(data.check_date)}
                    </p>
                  </div>
                </div>
              )}

              {/* Sync Status */}
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <RefreshCw className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Sync Status
                  </p>
                  <StatusBadge status={data.sync_status} />
                </div>
              </div>

              {/* Transaction Code */}
              <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
                <Hash className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-purple-900">
                    Transaction Code
                  </p>
                  <p className="text-sm text-purple-700">{data.tran_code}</p>
                </div>
              </div>

              {/* Payment Code */}
              {data.pycd && (
                <div className="flex items-center space-x-3 p-4 bg-orange-50 rounded-lg">
                  <DollarSign className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium text-orange-900">
                      Payment Code
                    </p>
                    <p className="text-sm text-orange-700">
                      {data.acno.acname}
                    </p>
                  </div>
                </div>
              )}

              {/* Check Number */}
              {data.check_no && (
                <div className="flex items-center space-x-3 p-4 bg-indigo-50 rounded-lg">
                  <FileText className="h-5 w-5 text-indigo-600" />
                  <div>
                    <p className="text-sm font-medium text-indigo-900">
                      Check Number
                    </p>
                    <p className="text-sm text-indigo-700">{data.check_no}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Invoice Information */}
              {data.invoice_no && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    Invoice Number
                  </p>
                  <p className="text-sm text-gray-700">
                    {data.invoice_no.trim()}
                  </p>
                </div>
              )}

              {/* Godown */}
              {data.godown && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    Godown
                  </p>
                  <p className="text-sm text-gray-700">
                    {data.godownDetails.godown}
                  </p>
                </div>
              )}
            </div>

            {/* Remarks Section */}
            {data.rmk && (
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm font-medium text-yellow-900 mb-2">
                  Remarks
                </p>
                <p className="text-sm text-yellow-800 leading-relaxed">
                  {data.rmk}
                </p>
              </div>
            )}

            {/* Additional Remarks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[2, 3, 4, 5].map((num) => {
                const remarkKey = `rmk${num}`;
                const remarkValue = data[remarkKey];
                if (!remarkValue) return null;

                return (
                  <div key={remarkKey} className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900 mb-2">
                      Remark {num}
                    </p>
                    <p className="text-sm text-gray-700">{remarkValue}</p>
                  </div>
                );
              })}
            </div>

            {/* Sync Information */}
            {data.last_sync && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-2">
                  Last Synchronized
                </p>
                <p className="text-sm text-blue-700">
                  {formatDate(data.last_sync)}
                </p>
              </div>
            )}

            {/* Transactions Section */}
            {data.transactions && data.transactions.length > 0 && (
              <div className="space-y-4">
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-blue-600" />
                    Associated Transactions ({data.transactions.length})
                  </h3>
                  <div className="space-y-3">
                    {data.transactions.map((transaction, index) => (
                      <TransactionItem
                        key={transaction.id}
                        transaction={transaction}
                        index={index}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end space-x-3 rounded-b-xl">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isExporting}
              className="text-gray-700 hover:bg-gray-50"
            >
              Close
            </Button>

            {(data.tran_code === 4 ||
              data.tran_code === 6 ||
              data.tran_code === 9 ||
              data.tran_code === 10) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={isExporting}
                  >
                    {isExporting ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Exporting {exportType}...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={() => handleOnExport("sales")}
                    disabled={isExporting}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Sales Invoice
                    {isExporting && exportType === "sales" && (
                      <RefreshCw className="w-4 h-4 ml-auto animate-spin" />
                    )}
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => handleOnExport("delivery")}
                    disabled={isExporting}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Delivery Note
                    {isExporting && exportType === "delivery" && (
                      <RefreshCw className="w-4 h-4 ml-auto animate-spin" />
                    )}
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => handleOnExport("commission")}
                    disabled={isExporting}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Commission Invoice
                    {isExporting && exportType === "commission" && (
                      <RefreshCw className="w-4 h-4 ml-auto animate-spin" />
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

// Main table component
export default function VoucherTable({
  type = "voucher",
  refreshTrigger = 0,
  isLoading = true,
  category = "",
  onSuccess,
}) {
  const TABLE_FIELDS = VOUCHER_CONFIG[type]?.tableFields || [];
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(isLoading);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRow, setSelectedRow] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [isEditModal, setIsEditModal] = useState(false);
  const [focusedRowIndex, setFocusedRowIndex] = useState(-1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

  const downloadVoucherPDF = async (
    tranId,
    tran_code,
    orderId,
    order_catagory,
    orderData = null
  ) => {
    setIsDownloadingPDF(true);

    try {
      // Sales Order

      if (order_catagory === 6) {
        if (!orderData) {
          const res = await axios.get(`/api/orders/${orderId}?category=6`);
          orderData = res.data;
        }
        const doc = await generateSalesOrderPDF({ data: [orderData] });
        doc.save(`SalesOrder_${orderData.order_no}.pdf`);
      }

      // Purchase Order
      else if (order_catagory === 4) {
        if (!orderData) {
          const res = await axios.get(`/api/orders/${orderId}?category=4`);
          orderData = res.data;
        }
        const doc = await generatePurchaseOrderPDF({ data: [orderData] });
        doc.save(`PurchaseOrder_${orderData.order_no}.pdf`);
      }

      // Vouchers
      else {
        if (!tranId) {
          throw new Error("Transaction ID is required for vouchers");
        }
        const res = await axios.get(`/api/voucher/getById?id=${tranId}`);
        const data = await res.data.data;

        const doc = generateVoucherPDF(data);
        const name =
          tran_code === 2
            ? "PaymentVoucher"
            : tran_code === 1
            ? "ReceiptVoucher"
            : "JournalVoucher";
        doc.save(`${name}_${data.vr_no}.pdf`);
      }
    } catch (err) {
      console.error("Error downloading PDF:", err);
      alert(`Failed to download PDF: ${err.message}`);
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  // Fetch voucher data with pagination
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log();
      const api =
        VOUCHER_CONFIG[type].tran_code === 400 ||
        VOUCHER_CONFIG[type].tran_code === 600
          ? "/api/orders/"
          : "/api/voucher/";
      const response = await axios.get(`${api}${type}`, {
        params: { page, limit },
      });
      setData(response.data.data || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      setError("Failed to load data. Please try again.");
      console.error(err);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  }, [type, page, limit, refreshTrigger]);

  // Simulate API call with mock data
  useEffect(() => {
    // const fetchData = async () => {
    //   setLoading(true)
    //   setError(null)

    //   // Simulate API delay
    //   await new Promise(resolve => setTimeout(resolve, 800))

    //   try {
    //     // Simulate pagination
    //     const startIndex = (page - 1) * limit
    //     const endIndex = startIndex + limit
    //     const paginatedData = MOCK_VOUCHER_DATA.slice(startIndex, endIndex)

    //     setData(paginatedData)
    //     setTotalPages(Math.ceil(MOCK_VOUCHER_DATA.length / limit))
    //   } catch (err) {
    //     setError('Failed to load data. Please try again.')
    //   } finally {
    //     setLoading(false)
    //   }
    // }

    fetchData();
  }, [page, limit, refreshTrigger]);

  const formatCellContent = useCallback((value, field) => {
    if (value === null || value === undefined) return "-";

    switch (field.type) {
      case "date":
        return new Date(value).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      case "currency":
        return `$${Number(value).toLocaleString("en-US", {
          minimumFractionDigits: 2,
        })}`;
      case "status":
        return <StatusBadge status={value} />;
      default:
        return value.toString();
    }
  }, []);

  const handleRowClick = (rowData, index) => {
    setSelectedRow(rowData);
    setViewModalOpen(true);
    setFocusedRowIndex(index);
  };

  const handleDeleteClick = async (rowData) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this voucher?"
    );
    if (!confirmDelete) return;
    const api =
      type !== "purchaseOrder" && type !== "saleOrder"
        ? "/api/voucher/"
        : "/api/orders/";
    try {
      const res = await axios.delete(`${api}${type}`, {
        data: {
          ...(type !== "purchaseOrder" && type !== "saleOrder"
            ? { tran_id: rowData.tran_id }
            : { order_no: rowData.order_no }),
        },
      });

      alert("Deleted successfully");

      // Optionally update local state/UI
      setData((prev) => prev.filter((row) => row.tran_id !== rowData.tran_id));
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete voucher");
    }
  };

  const handleModal = (rowData, index) => {
    setSelectedRow(rowData); // Set fresh selectedRow
    console.log("Rowdata: ", rowData);
    setFocusedRowIndex(index);
    setIsEditModal(true);
    console.log("Selected Row for Edit:", JSON.stringify(rowData, null, 2)); // Debug
  };

  const handleKeyDown = (e, rowData, index) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleRowClick(rowData, index);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextIndex = Math.min(index + 1, data.length - 1);
      const nextRow = document.querySelector(`[data-row-index="${nextIndex}"]`);
      nextRow?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevIndex = Math.max(index - 1, 0);
      const prevRow = document.querySelector(`[data-row-index="${prevIndex}"]`);
      prevRow?.focus();
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      setFocusedRowIndex(-1);
    }
  };

  const handleLimitChange = (value) => {
    setLimit(Number(value));
    setPage(1);
    setFocusedRowIndex(-1);
  };

  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }, [page, totalPages]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="p-6 bg-secondary "
    >
      <div className="flex flex-col justify-between">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            {String(type).charAt(0).toUpperCase() + String(type).slice(1)}{" "}
            Management
          </h1>
          <p className="text-primary">
            Manage and track your {type}s efficiently
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Alert
              variant="destructive"
              className="mb-6 border-primary bg-primary"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="text-red-800">Error</AlertTitle>
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              className="bg-primary text-white hover:bg-secondary hover:text-primary border-0"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-primary">Show:</span>
            <Select value={limit.toString()} onValueChange={handleLimitChange}>
              <SelectTrigger className="w-20 h-9 border-primary focus:border-primary focus:ring-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 25, 50].map((value) => (
                  <SelectItem key={value} value={value.toString()}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-primary">entries</span>
          </div>
        </div>

        {/* Table Card */}
        <Card className="overflow-hidden shadow-lg border-0 bg-white/70 backdrop-blur-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-primary to-primary border-none">
                  {TABLE_FIELDS.map((field, index) => (
                    <TableHead
                      key={index}
                      className="font-semibold text-sm text-white px-6 py-4 whitespace-nowrap"
                    >
                      {field.label}
                    </TableHead>
                  ))}
                  <TableHead className="font-semibold text-sm text-white px-6 py-4 text-center">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              {loading ? (
                <TableBody>
                  {[...Array(limit)].map((_, idx) => (
                    <TableRow key={idx} className="border-gray-200">
                      {TABLE_FIELDS.map((field, index) => (
                        <TableCell key={index} className="px-6 py-4">
                          <Skeleton className="h-5 w-full bg-gray-200 text-primary" />
                        </TableCell>
                      ))}
                      <TableCell className="px-6 py-4">
                        <Skeleton className="h-8 w-16 bg-gray-200 mx-auto text-primary" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              ) : (
                <TableBody>
                  {data.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={TABLE_FIELDS.length + 1}
                        className="text-center py-12 text-primary"
                      >
                        <div className="flex flex-col items-center space-y-3">
                          <FileText className="h-12 w-12 text-primary" />
                          <div>
                            <p className="text-lg font-medium">
                              No vouchers found
                            </p>
                            <p className="text-sm">
                              Create your first voucher to get started
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.map((entry, idx) => (
                      <motion.tr
                        key={idx}
                        data-row-index={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="border-gray-200 hover:bg-blue-50/50 transition-all duration-200 cursor-pointer focus:outline-none focus:bg-blue-100/70 focus:ring-2 focus:ring-blue-500/50"
                        tabIndex={0}
                        onClick={() => handleRowClick(entry, idx)}
                        onKeyDown={(e) => handleKeyDown(e, entry, idx)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        {TABLE_FIELDS.map((field, index) => (
                          <TableCell
                            key={index}
                            className="px-6 py-4 text-primary font-medium"
                          >
                            {field.options
                              ? entry[field.value1]?.[field.value2] || "-"
                              : field.isTotal
                              ? // Extract total from transactions where sub_tran_id === 3
                                entry.transactions
                                  ?.filter((tran) => tran.sub_tran_id === 3)
                                  ?.reduce(
                                    (sum, tran) =>
                                      sum +
                                      ((tran.damt > 0 && tran.damt) ||
                                        (tran.camt > 0 && tran.camt) ||
                                        0),
                                    0
                                  )
                                  ?.toLocaleString()
                              : formatCellContent(entry[field.name], field)}
                          </TableCell>
                        ))}
                        <TableCell className="px-6 py-4 text-center">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-primary focus:bg-primary group"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRowClick(entry, idx);
                            }}
                          >
                            <Eye className="h-4 w-4 text-primary group-hover:text-white" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-primary focus:bg-primary group"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleModal(entry, idx);
                            }}
                          >
                            <Edit className="h-4 w-4 text-primary group-hover:text-white" />
                          </Button>

                          {(entry.tran_code === 1 ||
                            entry.tran_code === 2 ||
                            entry.tran_code === 3 ||
                            entry.order_catagory === 6 ||
                            entry.order_catagory === 4) && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 hover:bg-primary focus:bg-primary group"
                              disabled={isDownloadingPDF}
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadVoucherPDF(
                                  entry.tran_id, // For vouchers
                                  entry.tran_code, // For vouchers
                                  entry.order_no, // For orders
                                  entry.order_catagory, // For orders
                                  entry.order_catagory === 6 ||
                                    entry.order_catagory === 4
                                    ? entry
                                    : null
                                );
                              }}
                            >
                              {isDownloadingPDF ? (
                                <RefreshCw className="h-4 w-4 text-primary group-hover:text-white animate-spin" />
                              ) : (
                                <Printer className="h-4 w-4 text-primary group-hover:text-white" />
                              )}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-primary focus:bg-primary group"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(entry, idx);
                            }}
                          >
                            <Delete className="h-4 w-4 text-primary group-hover:text-white" />
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                </TableBody>
              )}
            </Table>
          </div>
        </Card>
      </div>
      {/* Pagination */}
      <AnimatePresence>
        {!loading && data.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between mt-8 px-2"
          >
            <div className="text-sm text-primary">
              Showing {(page - 1) * limit + 1} to{" "}
              {Math.min(page * limit, data.length)} of {data.length} entries
            </div>

            <Pagination className=" block mx-0">
              <PaginationContent className="space-x-1 justify-end">
                <PaginationItem>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="h-9 px-3 border-gray-300 hover:bg-primary hover:text-white disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                </PaginationItem>

                {pageNumbers.map((num, index) => (
                  <PaginationItem key={index}>
                    <PaginationLink
                      onClick={() => handlePageChange(num)}
                      isActive={num === page}
                      className={`h-9 w-9 text-sm border ${
                        num === page
                          ? "bg-primary text-white border-primary hover:bg-secondary hover:text-primary"
                          : "border-gray-300 hover:bg-primary"
                      }`}
                    >
                      {num}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="h-9 px-3 border-gray-300 hover:bg-primary hover:text-white disabled:opacity-50"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </motion.div>
        )}
      </AnimatePresence>
      {/* {isRefreshing && (
        <div className="fixed top-4 right-4 z-50">
          <div className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
            <RefreshCw className="animate-spin h-5 w-5 mr-2" />
            Refreshing data...
          </div>
        </div>
      )} */}
      {/* Data View Modal */}
      <DataViewModal
        data={selectedRow}
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedRow(null);
        }}
      />
      {/* The Modal */}
      {isEditModal && (
        <VoucherModal
          type={type}
          category={category}
          editModes={isEditModal}
          onSuccess={onSuccess}
          onCloseEdit={() => {
            setIsEditModal(false);
            setSelectedRow(null); // Clear selectedRow to avoid stale data
            setFocusedRowIndex(-1);
          }}
          existingData={{
            voucherId: selectedRow?.tran_id || selectedRow?.id || "",

            master: selectedRow
              ? {
                  ...Object.fromEntries(
                    Object.entries(selectedRow).filter(
                      ([key]) =>
                        ![
                          "acno",
                          "transactions",
                          "godownDetails",
                          "orderDetails",
                        ].includes(key)
                    )
                  ),
                }
              : {},

            lines:
              type !== "purchaseOrder" && type !== "saleOrder"
                ? selectedRow?.transactions
                    ?.filter((t) => t.sub_tran_id === 1)
                    .map(
                      ({
                        itemDetails,
                        acnoDetails,
                        godownDetails,
                        currencyDetails,
                        costCenter,
                        ...rest
                      }) => rest
                    ) || []
                : selectedRow?.orderDetails.map(({ items, ...rest }) => rest) ||
                  [],

            deductions:
              selectedRow?.transactions
                ?.filter((t) => t.sub_tran_id === 2)
                .map(
                  ({
                    itemDetails,
                    acnoDetails,
                    godownDetails,
                    currencyDetails,
                    costCenter,
                    ...rest
                  }) => rest
                ) || [],
          }}
        />
      )}
    </motion.div>
  );
}
