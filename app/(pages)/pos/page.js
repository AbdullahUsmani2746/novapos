import { Card } from '@/components/ui/card';
// import { AnimatePresence, motion } from "framer-motion";

import React from 'react'

const page = () => {
  return (
    <div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">POS Dashboard</h2>
        <p>Welcome to the Point of Sale system. Use the sidebar to navigate to products, categories, cart, or orders.</p>
      </Card>
    </div>
  );
}

export default page;
