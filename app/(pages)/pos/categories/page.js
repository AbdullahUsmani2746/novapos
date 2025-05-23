import CategoryManager from '@/components/POS/CategoryManager';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';
import React from 'react'

  const CategoriesPage = () => {

  return (
    <div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4">
      
      <CategoryManager />
    </div>
  );
}
export default CategoriesPage
