"use client"
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  ShoppingCart
} from 'lucide-react';

const ModernPOSReturnSystem = () => {
  const [returns, setReturns] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedReturnOrder, setSelectedReturnOrder] = useState(null);
  const [returnItems, setReturnItems] = useState([]);
  const [returnReason, setReturnReason] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
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

  // Mock data for returns list
  const mockReturns = [
    {
      tran_id: 101,
      invoice_no: 'RET-1640995200000',
      dateD: new Date('2024-01-15T14:30:00'),
      reference_id: 1,
      originalInvoice: 'POS-1234567890',
      customer: 'John Doe',
      sync_status: 'completed',
      narration2: 'Defective product',
      user: { name: 'Admin User' },
      transactions: [
        { 
          id: 1, 
          itcd: 'ITEM001', 
          item: 'Wireless Headphones', 
          qty: -1, 
          rate: 99.99, 
          gross_amount: -99.99,
          narration1: 'POS Return: Wireless Headphones'
        }
      ]
    },
    {
      tran_id: 102,
      invoice_no: 'RET-1640995300000',
      dateD: new Date('2024-01-14T16:45:00'),
      reference_id: 2,
      originalInvoice: 'POS-1234567891',
      customer: 'Jane Smith',
      sync_status: 'pending',
      narration2: 'Customer changed mind',
      user: { name: 'Sales Rep' },
      transactions: [
        { 
          id: 2, 
          itcd: 'ITEM004', 
          item: 'Bluetooth Speaker', 
          qty: -1, 
          rate: 79.99, 
          gross_amount: -79.99,
          narration1: 'POS Return: Bluetooth Speaker'
        }
      ]
    },
    {
      tran_id: 103,
      invoice_no: 'RET-1640995400000',
      dateD: new Date('2024-01-13T09:15:00'),
      reference_id: 3,
      originalInvoice: 'POS-1234567892',
      customer: 'Bob Wilson',
      sync_status: 'completed',
      narration2: 'Wrong size ordered',
      user: { name: 'Manager' },
      transactions: [
        { 
          id: 3, 
          itcd: 'ITEM010', 
          item: 'T-Shirt Large', 
          qty: -2, 
          rate: 29.99, 
          gross_amount: -59.98,
          narration1: 'POS Return: T-Shirt Large'
        }
      ]
    }
  ];

  // Mock data for original orders (for returns)
  const mockOriginalOrders = [
    {
      tran_id: 1,
      invoice_no: 'POS-1234567890',
      dateD: new Date('2024-01-15'),
      customer: 'John Doe',
      sync_status: 'completed',
      transactions: [
        { id: 1, itcd: 'ITEM001', item: 'Wireless Headphones', qty: 2, rate: 99.99, gross_amount: 199.98 },
        { id: 2, itcd: 'ITEM002', item: 'Phone Case', qty: 1, rate: 29.99, gross_amount: 29.99 },
        { id: 3, itcd: 'ITEM003', item: 'Screen Protector', qty: 3, rate: 15.99, gross_amount: 47.97 }
      ]
    },
    {
      tran_id: 2,
      invoice_no: 'POS-1234567891',
      dateD: new Date('2024-01-14'),
      customer: 'Jane Smith',
      sync_status: 'completed',
      transactions: [
        { id: 4, itcd: 'ITEM004', item: 'Bluetooth Speaker', qty: 1, rate: 79.99, gross_amount: 79.99 },
        { id: 5, itcd: 'ITEM005', item: 'USB Cable', qty: 2, rate: 12.99, gross_amount: 25.98 }
      ]
    }
  ];

  const fetchReturns = async (page = 1) => {
  try {
    setIsLoading(true);
    
    const response = await fetch(`/api/pos/returns?page=${page}&limit=${pagination.limit}&search=${searchTerm}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch returns');
    }
    
    const data = await response.json();
    
    setReturns(data.returns);
    setPagination(data.pagination);
    
  } catch (error) {
    console.error('Error fetching returns:', error);
    alert('Failed to load returns. Please try again.');
  } finally {
    setIsLoading(false);
  }
};
  useEffect(() => {
    fetchReturns(1);
  }, [searchTerm]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchReturns(newPage);
    }
  };

  const handleRefresh = () => {
    fetchReturns(pagination.currentPage);
  };

const handleInitiateReturn = async (returnItem) => {
  try {
    setIsLoading(true);
    
    // Search for the original order
    const response = await fetch('/api/pos/returns', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        searchTerm: returnItem.originalInvoice || returnItem.invoice_no 
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to find original order');
    }

    const data = await response.json();
    const originalOrder = data.orders?.[0];
    
    if (originalOrder) {
      setSelectedReturnOrder(originalOrder);
      setReturnItems(originalOrder.transactions.map(item => ({
        ...item,
        returnQty: 0,
        maxReturnQty: item.qty,
        returnAmount: 0
      })));
      setReturnReason('');
      setShowReturnModal(true);
    } else {
      alert('Original order not found');
    }
    
  } catch (error) {
    console.error('Error finding original order:', error);
    alert('Failed to find original order. Please try again.');
  } finally {
    setIsLoading(false);
  }
};

  const updateReturnQty = (itemId, change) => {
    setReturnItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const newQty = Math.max(0, Math.min(item.maxReturnQty, item.returnQty + change));
        return {
          ...item,
          returnQty: newQty,
          returnAmount: newQty * item.rate
        };
      }
      return item;
    }));
  };

  const getTotalReturnAmount = () => {
    return returnItems.reduce((sum, item) => sum + item.returnAmount, 0);
  };

  const getReturnItemsCount = () => {
    return returnItems.filter(item => item.returnQty > 0).length;
  };

const handleProcessReturn = async () => {
  const itemsToReturn = returnItems.filter(item => item.returnQty > 0);
  
  if (itemsToReturn.length === 0) {
    alert('Please select at least one item to return');
    return;
  }

  if (!returnReason.trim()) {
    alert('Please provide a reason for the return');
    return;
  }

  setIsLoading(true);
  
  try {
    const returnData = {
      originalOrderId: selectedReturnOrder.tran_id,
      returnItems: itemsToReturn.map(item => ({
        itcd: item.itcd,
        returnQty: item.returnQty,
        returnAmount: item.returnAmount,
      })),
      returnReason,
      userId: 'current-user-id', // Replace with actual user ID from auth context
    };

    const response = await fetch('/api/pos/returns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(returnData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to process return');
    }

    const result = await response.json();
    
    setIsLoading(false);
    setShowReturnModal(false);
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
      setSelectedReturnOrder(null);
      setReturnItems([]);
      setReturnReason('');
      fetchReturns(pagination.currentPage); // Refresh the list
    }, 3000);

  } catch (error) {
    console.error('Error processing return:', error);
    alert(`Failed to process return: ${error.message}`);
    setIsLoading(false);
  }
};
  const formatDate = (date) => {
    console.log("date: ",date)
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(amount));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const calculateReturnTotal = (transactions) => {
    return transactions.reduce((total, transaction) => total + Math.abs(transaction.gross_amount), 0);
  };

  // Success Modal
  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <Card className="max-w-md mx-auto text-center p-8 bg-white shadow-2xl rounded-3xl border-0">
          <div className="w-20 h-20 bg-emerald-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Return Processed Successfully!</h2>
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
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" className="p-2 hover:bg-slate-100 rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">POS Returns</h1>
                <p className="text-slate-600">Manage returns and refunds</p>
              </div>
            </div>
          </div>
          
          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search returns, invoices, customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-slate-900 placeholder-slate-500"
              />
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" className="rounded-xl border-slate-200 hover:bg-slate-50">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                className="rounded-xl border-slate-200 hover:bg-slate-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg rounded-3xl hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Total Returns</p>
                <p className="text-3xl font-bold text-slate-900">{pagination.totalCount}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <Receipt className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg rounded-3xl hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Return Value</p>
                <p className="text-3xl font-bold text-red-600">
                  ${mockReturns.reduce((total, returnItem) => 
                    total + calculateReturnTotal(returnItem.transactions), 0
                  ).toFixed(2)}
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
                <p className="text-sm font-medium text-slate-600 mb-1">Today&apos;s Returns</p>
                <p className="text-3xl font-bold text-slate-900">
                  {mockReturns.filter(r => 
                    r.dateD.toDateString() === new Date().toDateString()
                  ).length}
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
            <h2 className="text-xl font-semibold text-slate-900">Return Transactions</h2>
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
                <div key={returnItem.tran_id} className="p-6 hover:bg-slate-50/50 transition-all">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    {/* Main Return Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center">
                            <TrendingDown className="w-6 h-6 text-red-600" />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-slate-900">
                              {returnItem.invoice_no}
                            </h3>
                            <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(returnItem.sync_status)}`}>
                              {returnItem.sync_status}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                              <Receipt className="w-4 h-4" />
                              <span>Original: {returnItem.originalInvoice}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span>{returnItem.customer}</span>
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
                          
                          {returnItem.narration2 && (
                            <p className="text-sm text-slate-500 mt-2 bg-slate-50 rounded-lg p-2">
                              <strong>Reason:</strong> {returnItem.narration2}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Items and Actions */}
                    <div className="lg:text-right">
                      <div className="mb-4">
                        <p className="text-2xl font-bold text-red-600">
                          -{formatCurrency(calculateReturnTotal(returnItem.transactions))}
                        </p>
                        <p className="text-sm text-slate-500">
                          {returnItem.transactions.length} item(s)
                        </p>
                      </div>
                      
                      {/* Items List */}
                      <div className="space-y-1 mb-4">
                        {returnItem.transactions.map((transaction) => (
                          <div key={transaction.id} className="text-sm text-slate-600 flex items-center gap-2 bg-slate-50 rounded-lg p-2">
                            <Package className="w-4 h-4" />
                            <span>{transaction.item} (×{Math.abs(transaction.qty)})</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="rounded-xl">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          onClick={() => handleInitiateReturn(returnItem)}
                          size="sm" 
                          className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
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
          )}
          
          {/* Pagination */}
          {!isLoading && returns.length > 0 && (
            <div className="p-6 border-t border-slate-200/50 bg-slate-50/50 flex items-center justify-between">
              <div className="text-sm text-slate-700">
                Showing {pagination.startItem} to {pagination.endItem} of {pagination.totalCount} returns
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className="rounded-xl"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <span className="text-sm text-slate-700 px-3">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className="rounded-xl"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Return Modal */}
      {showReturnModal && selectedReturnOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <RotateCcw className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Process Return</h2>
                    <p className="text-blue-100">Invoice: #{selectedReturnOrder.invoice_no.split('-').pop()}</p>
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
                    <h3 className="text-lg font-semibold mb-4 text-slate-900">Order Items</h3>
                    
                    <div className="space-y-4">
                      {returnItems.map((item) => (
                        <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-md transition-all">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-slate-900 mb-1">{item.item}</h4>
                              <p className="text-sm text-slate-600 mb-1">Code: {item.itcd}</p>
                              <p className="text-sm text-slate-600">
                                Original: {item.qty} × {formatCurrency(item.rate)} = {formatCurrency(item.gross_amount)}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateReturnQty(item.id, -1)}
                                  disabled={item.returnQty === 0}
                                  className="w-10 h-10 p-0 rounded-xl"
                                >
                                  <Minus className="w-4 h-4" />
                                </Button>
                                
                                <div className="text-center min-w-[80px]">
                                  <div className="font-medium text-lg">{item.returnQty}</div>
                                  <div className="text-xs text-slate-500">of {item.maxReturnQty}</div>
                                </div>
                                
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateReturnQty(item.id, 1)}
                                  disabled={item.returnQty >= item.maxReturnQty}
                                  className="w-10 h-10 p-0 rounded-xl"
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                              
                              <div className="text-right min-w-[100px]">
                                <div className="font-medium text-emerald-600 text-lg">
                                  {formatCurrency(item.returnAmount)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Return Reason */}
                  <Card className="p-6 bg-slate-50/50 rounded-2xl border-0">
                    <h3 className="text-lg font-semibold mb-4 text-slate-900">Return Reason</h3>
                    <textarea
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      placeholder="Please provide a detailed reason for this return..."
                      className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none text-slate-900 placeholder-slate-500"
                      rows="4"
                    />
                  </Card>
                </div>

                {/* Return Summary */}
                <div className="space-y-6">
                  <Card className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border-0 sticky top-6">
                    <h3 className="text-lg font-semibold mb-4 text-slate-900">Return Summary</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="w-4 h-4 text-slate-600" />
                          <span className="text-slate-600">Items Selected</span>
                        </div>
                        <span className="font-semibold text-slate-900">{getReturnItemsCount()}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-slate-600" />
                          <span className="text-slate-600">Return Amount</span>
                        </div>
                        <span className="font-semibold text-emerald-600 text-lg">
                          {formatCurrency(getTotalReturnAmount())}
                        </span>
                      </div>
                      
                      <div className="pt-4 border-t border-slate-200">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">Customer</span>
                          <span className="font-medium text-slate-900">{selectedReturnOrder.customer}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Original Date</span>
                        <span className="font-medium text-slate-900">
                          {formatDate(selectedReturnOrder.dateD)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-slate-200">
                      <Button
                        onClick={handleProcessReturn}
                        disabled={isLoading || getReturnItemsCount() === 0 || !returnReason.trim()}
                        className="w-full py-4 text-lg font-semibold rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all"
                      >
                        {isLoading ? (
                          <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                        ) : (
                          <CheckCircle className="w-5 h-5 mr-2" />
                        )}
                        {isLoading ? 'Processing...' : 'Process Return'}
                      </Button>
                      
                      {(getReturnItemsCount() === 0 || !returnReason.trim()) && (
                        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-600" />
                            <span className="text-sm text-amber-800">
                              {getReturnItemsCount() === 0 
                                ? 'Select at least one item to return' 
                                : 'Please provide a return reason'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
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