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
  Clock
} from 'lucide-react';

const POSReturnList = () => {
  const [returns, setReturns] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
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

  // Mock data for demonstration
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
    },
    {
      tran_id: 104,
      invoice_no: 'RET-1640995500000',
      dateD: new Date('2024-01-12T11:20:00'),
      reference_id: 4,
      originalInvoice: 'POS-1234567893',
      customer: 'Alice Johnson',
      sync_status: 'failed',
      narration2: 'Item damaged in shipping',
      user: { name: 'Support Staff' },
      transactions: [
        { 
          id: 4, 
          itcd: 'ITEM015', 
          item: 'Coffee Maker', 
          qty: -1, 
          rate: 149.99, 
          gross_amount: -149.99,
          narration1: 'POS Return: Coffee Maker'
        }
      ]
    }
  ];

  const fetchReturns = async (page = 1) => {
    try {
      setIsLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Filter returns based on search term
      const filteredReturns = mockReturns.filter(returnItem => 
        returnItem.invoice_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
        returnItem.originalInvoice.toLowerCase().includes(searchTerm.toLowerCase()) ||
        returnItem.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        returnItem.narration2.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      // Pagination logic
      const startIndex = (page - 1) * pagination.limit;
      const endIndex = startIndex + pagination.limit;
      const paginatedReturns = filteredReturns.slice(startIndex, endIndex);
      
      const totalPages = Math.ceil(filteredReturns.length / pagination.limit);
      
      setReturns(paginatedReturns);
      setPagination(prev => ({
        ...prev,
        currentPage: page,
        totalPages,
        totalCount: filteredReturns.length,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        startItem: startIndex + 1,
        endItem: Math.min(endIndex, filteredReturns.length)
      }));
      
    } catch (error) {
      console.error('Error fetching returns:', error);
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

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
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
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateReturnTotal = (transactions) => {
    return transactions.reduce((total, transaction) => total + Math.abs(transaction.gross_amount), 0);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="sm" className="p-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <TrendingDown className="w-6 h-6 text-red-600" />
            <h1 className="text-2xl font-bold text-gray-900">POS Returns</h1>
          </div>
        </div>
        
        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search returns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Returns</p>
              <p className="text-2xl font-bold text-gray-900">{pagination.totalCount}</p>
            </div>
            <Receipt className="w-8 h-8 text-blue-600" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Return Value</p>
              <p className="text-2xl font-bold text-red-600">
                ${mockReturns.reduce((total, returnItem) => 
                  total + calculateReturnTotal(returnItem.transactions), 0
                ).toFixed(2)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-red-600" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today&apos;s Returns</p>
              <p className="text-2xl font-bold text-gray-900">
                {mockReturns.filter(r => 
                  r.dateD.toDateString() === new Date().toDateString()
                ).length}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-green-600" />
          </div>
        </Card>
      </div>

      {/* Returns List */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b bg-white">
          <h2 className="text-lg font-semibold text-gray-900">Return Transactions</h2>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Loading returns...</p>
          </div>
        ) : returns.length === 0 ? (
          <div className="p-8 text-center">
            <TrendingDown className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No returns found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {returns.map((returnItem) => (
              <div key={returnItem.tran_id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Main Return Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <TrendingDown className="w-5 h-5 text-red-600" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-gray-900">
                            {returnItem.invoice_no}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(returnItem.sync_status)}`}>
                            {returnItem.sync_status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Receipt className="w-3 h-3" />
                            <span>Original: {returnItem.originalInvoice}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{returnItem.customer}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatDate(returnItem.dateD)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>By: {returnItem.user.name}</span>
                          </div>
                        </div>
                        
                        {returnItem.narration2 && (
                          <p className="text-sm text-gray-500 mt-1">
                            Reason: {returnItem.narration2}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Items and Amount */}
                  <div className="lg:text-right">
                    <div className="mb-2">
                      <p className="text-lg font-bold text-red-600">
                        -{formatCurrency(calculateReturnTotal(returnItem.transactions))}
                      </p>
                      <p className="text-sm text-gray-500">
                        {returnItem.transactions.length} item(s)
                      </p>
                    </div>
                    
                    {/* Items List */}
                    <div className="space-y-1 mb-3">
                      {returnItem.transactions.map((transaction) => (
                        <div key={transaction.id} className="text-xs text-gray-600 flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          <span>{transaction.item} (×{Math.abs(transaction.qty)})</span>
                        </div>
                      ))}
                    </div>
                    
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Pagination */}
        {!isLoading && returns.length > 0 && (
          <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {pagination.startItem} to {pagination.endItem} of {pagination.totalCount} returns
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrev}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <span className="text-sm text-gray-700">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNext}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default POSReturnList;