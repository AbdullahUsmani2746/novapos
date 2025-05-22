import Cart from '@/components/POS/Cart';
import { motion } from 'framer-motion';

import React from 'react'

  const CartPage = () => {
  return (
    <div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4">
      <h2 className="text-2xl font-bold mb-4">Cart</h2>
      <Cart />
    </div>
  );
}
export default CartPage
