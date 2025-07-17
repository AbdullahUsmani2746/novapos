import OrderList from '@/components/POS/OrderList';
import { motion } from 'framer-motion';
import React from 'react';

const OrdersPage = ()=> {
  return (
    <div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4">
      {/* <h2 className="text-2xl font-bold mb-4">Orders</h2> */}
      <OrderList />
    </div>
  );
}
export default OrdersPage;