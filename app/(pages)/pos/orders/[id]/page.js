import OrderDetail from '@/components/POS/OrderDetail';
import { motion } from 'framer-motion';
import React from 'react';

const OrderDetailPage = ({ params }) => {
  return (
    <div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4">
      <OrderDetail orderId={params.id} />
    </div>
  );
}
export default OrderDetailPage;