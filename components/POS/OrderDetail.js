"use client"
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils';
import React from 'react';

const OrderDetail = ({ orderId }) =>  {
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetch(`/pos/api/orders/${orderId}`)
      .then(res => res.json())
      .then(data => {
        setOrder(data);
        setStatus(data.rmk || 'processing');
      });
  }, [orderId]);

  const handleUpdateStatus = async () => {
    try {
      const response = await fetch(`/pos/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        toast.success('Order status updated');
        setOrder({ ...order, rmk: status });
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      toast.error('Error updating status');
    }
  };

  if (!order) return <div>Loading...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Order #{order.invoice_no}</h2>
      <div className="space-y-4">
        <p>Date: {new Date(order.dateD).toLocaleDateString()}</p>
        <p>Total: {formatCurrency(order.transactions.reduce((sum, t) => sum + t.gross_amount, 0))}</p>
        <div>
          {order.transactions.map(t => (
            <div key={t.id} className="flex justify-between">
              <span>{t.itemDetails?.item}</span>
              <span>{t.qty} x {formatCurrency(t.rate)}</span>
            </div>
          ))}
        </div>
        <div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleUpdateStatus} className="mt-2">Update Status</Button>
        </div>
      </div>
    </motion.div>
  );
}
export default OrderDetail;