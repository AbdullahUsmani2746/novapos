import Checkout from '@/components/POS/Checkout';
import { motion } from 'framer-motion';
import React from 'react';

const CheckoutPage = ()=> {
  return (
    <div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4">
      <h2 className="text-2xl font-bold mb-4">Checkout</h2>
      <Checkout />
    </div>
  );
}
export default CheckoutPage;