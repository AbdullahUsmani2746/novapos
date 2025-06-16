
"use client"
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  Receipt, 
  Package, 
  User, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Edit3,
  Save,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { useRouter } from 'next/navigation'


const OrderDetail = ({ orderId }) => {

  const router = useRouter(); 
  const handleBack = () => {
    router.back();
  };

  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Mock data for demonstration
  // useEffect(() => {
  //   // Simulate API call
  //   setTimeout(() => {
  //     const mockOrder = {
  //       invoice_no: 'INV-2024-001',
  //       dateD: '2024-05-23T10:30:00Z',
  //       rmk: 'processing',
  //       customer: {
  //         name: 'John Doe',
  //         email: 'john.doe@example.com',
  //         phone: '+1 (555) 123-4567',
  //         address: '123 Main St, New York, NY 10001'
  //       },
  //       transactions: [
  //         {
  //           id: 1,
  //           itemDetails: { item: 'Premium Coffee Blend' },
  //           qty: 2,
  //           rate: 15.99,
  //           gross_amount: 31.98
  //         },
  //         {
  //           id: 2,
  //           itemDetails: { item: 'Chocolate Croissant' },
  //           qty: 3,
  //           rate: 4.50,
  //           gross_amount: 13.50
  //         },
  //         {
  //           id: 3,
  //           itemDetails: { item: 'Organic Green Tea' },
  //           qty: 1,
  //           rate: 12.99,
  //           gross_amount: 12.99
  //         }
  //       ]
  //     };
  //     setOrder(mockOrder);
  //     setStatus(mockOrder.rmk || 'processing');
  //     setIsLoading(false);
  //   }, 1000);
  // }, [orderId]);

    useEffect(() => {
    fetch(`/api/pos/orders/${orderId}`)
      .then(res => res.json())
      .then(data => {
        data.customer = {
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1 (555) 123-4567',
          address: '123 Main St, New York, NY 10001'
        }
        console.log("data", data)
        setOrder(data);
        setStatus(data.rmk || 'processing');
        setIsLoading(false);
      });
  }, [orderId]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleUpdateStatus = async () => {
    setIsUpdating(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setOrder({ ...order, rmk: status });
      
      // Show success toast (simulated)
      const toastElement = document.createElement('div');
      toastElement.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
      toastElement.textContent = 'Order status updated successfully!';
      document.body.appendChild(toastElement);
      
      setTimeout(() => {
        toastElement.style.transform = 'translateX(0)';
      }, 100);
      
      setTimeout(() => {
        toastElement.style.transform = 'translateX(full)';
        setTimeout(() => document.body.removeChild(toastElement), 300);
      }, 3000);
      
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'completed':
        return { 
          icon: CheckCircle2, 
          color: 'text-emerald-600', 
          bg: 'bg-emerald-50 border-emerald-200',
          label: 'Completed'
        };
      case 'cancelled':
        return { 
          icon: XCircle, 
          color: 'text-red-600', 
          bg: 'bg-red-50 border-red-200',
          label: 'Cancelled'
        };
      case 'processing':
      default:
        return { 
          icon: Clock, 
          color: 'text-amber-600', 
          bg: 'bg-amber-50 border-amber-200',
          label: 'Processing'
        };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
        <div className="max-w-full mx-auto">
          <div className="animate-pulse space-y-6">
            {/* Header skeleton */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="h-8 bg-gray-200 rounded-lg w-64"></div>
            </div>
            
            {/* Cards skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex justify-between items-center">
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Order not found</h3>
          <p className="text-gray-600">The order you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.rmk || status);
  const StatusIcon = statusInfo.icon;
  const totalAmount = order.transactions.reduce((sum, t) => sum + t.gross_amount, 0);
  const itemCount = order.transactions.reduce((sum, t) => sum + t.qty, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-full mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              className="w-10 h-10 rounded-full hover:bg-gray-100 transition-all duration-200"
              onClick={handleBack}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Order #{order.invoice_no.split('-').pop()}
              </h1>
              <p className="text-gray-600 text-sm">
                Order details and management
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-full mx-auto p-4 pb-8">
        {/* Status Header Card */}
        <Card className="mb-6 overflow-hidden bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full ${statusInfo.bg} border flex items-center justify-center`}>
                  <StatusIcon className={`w-6 h-6 ${statusInfo.color}`} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{statusInfo.label}</h2>
                  <p className="text-gray-600 flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4" />
                    {new Date(order.dateD).toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">
                  {formatCurrency(totalAmount)}
                </div>
                <p className="text-gray-600 text-sm">{itemCount} items total</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-2xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Package className="w-6 h-6 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-900">Order Items</h3>
                </div>
                
                <div className="space-y-4">
                  {order.transactions.map((transaction, index) => (
                    <div 
                      key={transaction.id}
                      className="group flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 border border-gray-100"
                      style={{
                        animationDelay: `${index * 100}ms`
                      }}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                          <Receipt className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                            {transaction.itemDetails?.item}
                          </h4>
                          <p className="text-gray-600 text-sm">
                            Quantity: {transaction.qty} × {formatCurrency(transaction.rate)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900 text-lg">
                          {formatCurrency(transaction.gross_amount)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                    </div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Customer Information */}
            {order.customer && (
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-2xl overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <User className="w-6 h-6 text-purple-600" />
                    <h3 className="text-xl font-bold text-gray-900">Customer Information</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                      <User className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-900">{order.customer.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                      <Mail className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-700">{order.customer.email}</span>
                    </div>
                    
                    <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                      <Phone className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-700">{order.customer.phone}</span>
                    </div>
                    
                    <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                      <MapPin className="w-5 h-5 text-gray-600 mt-0.5" />
                      <span className="text-gray-700">{order.customer.address}</span>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Status Management */}
          <div className="space-y-6">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-2xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Edit3 className="w-6 h-6 text-orange-600" />
                  <h3 className="text-xl font-bold text-gray-900">Update Status</h3>
                </div>
                
                <div className="space-y-4">
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-full h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="processing">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-600" />
                          Processing
                        </div>
                      </SelectItem>
                      <SelectItem value="completed">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Completed
                        </div>
                      </SelectItem>
                      <SelectItem value="cancelled">
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-600" />
                          Cancelled
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Button 
                    onClick={handleUpdateStatus}
                    disabled={isUpdating || status === order.rmk}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isUpdating ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Updating...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        Update Status
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-2xl overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-12 rounded-xl border-gray-200 hover:bg-gray-50 transition-all duration-200"
                  >
                    <Receipt className="w-4 h-4 mr-2" />
                    Print Receipt
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-12 rounded-xl border-gray-200 hover:bg-gray-50 transition-all duration-200"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-12 rounded-xl border-gray-200 hover:bg-gray-50 transition-all duration-200"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Track Order
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .space-y-4 > div {
          animation: slideInUp 0.5s ease-out forwards;
          opacity: 0;
        }
        
        .space-y-4 > div:nth-child(1) { animation-delay: 0.1s; }
        .space-y-4 > div:nth-child(2) { animation-delay: 0.2s; }
        .space-y-4 > div:nth-child(3) { animation-delay: 0.3s; }
        .space-y-4 > div:nth-child(4) { animation-delay: 0.4s; }
      `}</style>
    </div>
  );
};

export default OrderDetail;