'use client';
import { motion } from 'framer-motion';

export default function AnimatedWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 rounded-2xl shadow-lg bg-white"
    >
      {children}
    </motion.div>
  );
}
