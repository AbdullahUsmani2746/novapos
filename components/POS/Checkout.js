"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import React from 'react';

const Checkout = () => {
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Assume cart is passed via local storage or context
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
  }, []);

  const handleCheckout = async () => {
    try {
      const response = await fetch('/pos/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems: cart,
          customer,
          total: cart.reduce((sum, item) => sum + item.quantity * item.price, 0),
        }),
      });
      if (response.ok) {
        localStorage.removeItem('cart');
        toast.success('Order placed successfully');
        router.push('/pos/orders');
      } else {
        toast.error('Failed to place order');
      }
    } catch (error) {
      toast.error('Checkout error');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Checkout</h2>
      {cart.length === 0 ? (
        <p>No items in cart</p>
      ) : (
        <div className="space-y-4">
          {cart.map(item => (
            <div key={item.itcd} className="flex justify-between">
              <span>{item.item}</span>
              <span>{item.quantity} x {formatCurrency(item.price)}</span>
            </div>
          ))}
          <p>Total: {formatCurrency(cart.reduce((sum, item) => sum + item.quantity * item.price, 0))}</p>
          <div>
            <Label htmlFor="customer">Customer Name</Label>
            <Input id="customer" value={customer} onChange={(e) => setCustomer(e.target.value)} />
          </div>
          <Button onClick={handleCheckout}>Complete Order</Button>
        </div>
      )}
    </motion.div>
  );
}
export default Checkout;