import ProductList from '@/components/POS/ProductList';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';
import React from 'react';

const ProductsPage = () => {
  return (
    <div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4">
      <div className="flex justify-between mb-4">
        <h2 className="text-2xl font-bold">Products</h2>
        <Link href="/pos/products/create"><Button>Create Product</Button></Link>
      </div>
      <ProductList />
    </div>
  );
}
export default ProductsPage;