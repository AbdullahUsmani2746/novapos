'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Form from './Form'
import { PlusIcon, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function VoucherModal({ type }) {
  const [open, setOpen] = useState(false)
  const overlayRef = useRef(null)

  // Handle click outside to close
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      setOpen(false)
    }
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2 font-medium"
      >
        <PlusIcon size={16} />
        <span>Create {type} Voucher</span>
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4"
            onClick={handleOverlayClick}
            ref={overlayRef}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ 
                type: "spring", 
                damping: 15, 
                stiffness: 300 
              }}
              className="bg-background w-full max-w-10xl rounded-xl shadow-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-b p-4 sm:p-6">
                <div className="flex justify-between items-center">
                    <Dialog>
                  <DialogTitle className="text-xl font-semibold capitalize">
                    {type} Voucher
                  </DialogTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-8 w-8"
                    onClick={() => setOpen(false)}
                  >
                    <X size={18} />
                  </Button>
                  </Dialog>
                </div>
              </div>

              <div className="p-4 sm:p-6 max-h-[80vh] overflow-y-auto">
                <Form type={type} onClose={() => setOpen(false)} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}