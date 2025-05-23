import ProductList from '@/components/POS/ProductList';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';
import React from 'react';

const ProductsPage = () => {
  return (
    <div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4">
      
      <ProductList />
    </div>
  );
}
export default ProductsPage;