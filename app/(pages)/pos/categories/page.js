import CategoryManager from '@/components/POS/CategoryManager';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';
import React from 'react'

  const CategoriesPage = () => {

  return (
    <div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4">
      <div className="flex justify-between mb-4">
        <h2 className="text-2xl font-bold">Categories</h2>
        <Link href="/pos/categories/create"><Button>Create Category</Button></Link>
      </div>
      <CategoryManager />
    </div>
  );
}
export default CategoriesPage
