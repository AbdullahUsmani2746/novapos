import ProductDetail from '@/components/POS/ProductDetail';
import { motion } from 'framer-motion';
import React from 'react';

const ProductDetailPage = ({ params }) => {
  return (
    <div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4">
      <ProductDetail productId={params.id} />
    </div>
  );
}
export default ProductDetailPage;