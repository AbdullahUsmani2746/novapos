// "use client"
// import { useEffect, useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Button } from '@/components/ui/button';
// import { Card } from '@/components/ui/card';
// import { useRouter } from 'next/navigation';
// import { formatCurrency } from '@/lib/utils';
// import React from 'react';

// const OrderList = () => {
//   const [orders, setOrders] = useState([]);
//   const router = useRouter();

//   useEffect(() => {
//     fetch('/pos/api/orders')
//       .then(res => res.json())
//       .then(data => setOrders(data));
//   }, []);

//   return (
//     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
//       <AnimatePresence>
//         {orders.map(order => (
//           <motion.div key={order.tran_id} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}>
//             <Card className="p-4">
//               <h3 className="text-lg font-semibold">Order #{order.invoice_no}</h3>
//               <p>Date: {new Date(order.dateD).toLocaleDateString()}</p>
//               <p>Total: {formatCurrency(order.transactions.reduce((sum, t) => sum + t.gross_amount, 0))}</p>
//               <Button onClick={() => router.push(`/pos/orders/${order.tran_id}`)}>View</Button>
//             </Card>
//           </motion.div>
//         ))}
//       </AnimatePresence>
//     </motion.div>
//   );
// }
// export default OrderList;

"use client"
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Filter, Calendar, DollarSign, Receipt, Eye, ArrowRight, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const router = useRouter();

  // Mock data for demonstration
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
    
     
   const fetchOrders = async () => {
  try {
    const response = await axios.get('/api/pos/orders');
    setOrders(response.data);
  } catch (error) {
    toast.error('Failed to fetch orders');
  }
};
fetchOrders();

      setIsLoading(false);
    }, 1000);
  }, []);

  const handleView = (order) => {
     router.push(`/pos/orders/${order.tran_id}`)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredOrders = orders.filter(order => 
    order.invoice_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
        <div className="max-w-full mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded-lg w-48"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header Section */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-full mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Order Management
              </h1>
              <p className="text-gray-600 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                {orders.length} total orders
              </p>
            </div>
            
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3 lg:w-auto w-full">
              <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search orders or customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/90 backdrop-blur-sm"
                />
              </div>
              <Button variant="outline" className="px-6 py-3 rounded-xl border-gray-200 hover:bg-gray-50 transition-all duration-200">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="max-w-full mx-auto p-4 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
          {filteredOrders.map((order, index) => {
            const totalAmount = order.transactions.reduce((sum, t) => sum + t.gross_amount, 0);
            
            return (
              <div
                key={order.id}
                className="group cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
                style={{
                  animationDelay: `${index * 100}ms`
                }}
                onClick={() => setSelectedOrder(order)}
              >
                <Card 
                 onClick={() => router.push(`/pos/orders/${order.tran_id}`)}

                className="relative overflow-hidden bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl">
                  {/* Gradient Accent */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                  
                  <div className="p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <Receipt className="w-5 h-5 text-blue-600" />
                          #{order.invoice_no.split('-').pop()}
                        </h3>
                        <p className="text-sm text-gray-600 font-medium">{order.customer}</p>
                      </div>
                      
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                        {order.sync_status.charAt(0).toUpperCase() + order.sync_status.slice(1)}
                      </div>
                    </div>

                    {/* Date and Items */}
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(order.dateD).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      <span className="bg-gray-100 px-2 py-1 rounded-lg font-medium">
                        {order.items} items
                      </span>
                    </div>

                    {/* Amount */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <span className="text-2xl font-bold text-gray-900">
                          {formatCurrency(totalAmount)}
                        </span>
                      </div>
                      
                      <Button 
                        size="sm"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-xl transform transition-all duration-200 hover:scale-105 group-hover:shadow-lg"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                        <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" />
                      </Button>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          order.status === 'completed' 
                            ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                            : 'bg-gradient-to-r from-amber-400 to-orange-500'
                        }`}
                        style={{ 
                          width: order.status === 'completed' ? '100%' : '65%',
                          animationDelay: `${index * 200 + 500}ms`
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredOrders.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Receipt className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search terms or filters</p>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl">
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <Button 
          size="lg"
          className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl hover:shadow-3xl transform transition-all duration-300 hover:scale-110"
        >
          <Receipt className="w-6 h-6" />
        </Button>
      </div>

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
        
        .grid > div:nth-child(1) { animation-delay: 0.1s; }
        .grid > div:nth-child(2) { animation-delay: 0.2s; }
        .grid > div:nth-child(3) { animation-delay: 0.3s; }
        .grid > div:nth-child(4) { animation-delay: 0.4s; }
        .grid > div:nth-child(5) { animation-delay: 0.5s; }
        .grid > div:nth-child(6) { animation-delay: 0.6s; }
      `}</style>
    </div>
  );
};

export default OrderList;