"use client"
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import React from 'react';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetch('/pos/api/orders')
      .then(res => res.json())
      .then(data => setOrders(data));
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      <AnimatePresence>
        {orders.map(order => (
          <motion.div key={order.tran_id} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}>
            <Card className="p-4">
              <h3 className="text-lg font-semibold">Order #{order.invoice_no}</h3>
              <p>Date: {new Date(order.dateD).toLocaleDateString()}</p>
              <p>Total: {formatCurrency(order.transactions.reduce((sum, t) => sum + t.gross_amount, 0))}</p>
              <Button onClick={() => router.push(`/pos/orders/${order.tran_id}`)}>View</Button>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
export default OrderList;