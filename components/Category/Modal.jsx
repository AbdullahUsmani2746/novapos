"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Form from "./Form";
import { PlusIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function VoucherModal({ type, category, editModes = false, onCloseEdit, existingData={}, onSuccess}) {
  console.log("Exisitng Data: ",existingData)
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(editModes);
  const overlayRef = useRef(null);

// Single useEffect to handle editModes changes
  useEffect(() => {
    setEditMode(editModes);
    setOpen(editModes);
    console.log("VoucherModal existingData:", JSON.stringify(existingData, null, 2)); // Debug
  }, [editModes]);

// Handle click outside to close
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      handleClose();
    }
  };

  // Handle modal close
  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
    onCloseEdit?.();
  };

  // Handle opening the modal for creating a new voucher
  const handleOpen = () => {
    setOpen(true);
    setEditMode(false);
  };

return (
    <>
      {!editMode && (
        <Button
          onClick={handleOpen}
          className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2 font-medium"
        >
          <PlusIcon className="h-4 w-4" />
          Create {type.charAt(0).toUpperCase() + type.slice(1) }
        </Button>
      )}

      <AnimatePresence>
        {open && (
          <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent
              className="sm:max-w-full bg-white max-h-[99%] overflow-scroll"
              ref={overlayRef}
              onClick={handleOverlayClick}
            >
              <DialogHeader className="border-b pb-4">
                <DialogTitle className="text-xl font-semibold">
                  {editMode ? `Edit ${type.charAt(0).toUpperCase()+type.slice(1)} ${category.charAt(0).toUpperCase()+category.slice(1)}` : `Create ${type.charAt(0).toUpperCase()+type.slice(1)} ${category.charAt(0).toUpperCase()+category.slice(1)}`}
                </DialogTitle>
              </DialogHeader>
              <div className="pt-4 overflow-auto">
                <Form
                  type={type}
                  editMode={editMode}
                  onClose={handleClose}
                  existingData={editMode ? existingData : {}}
                  onSuccess={onSuccess} // Pass this through
                />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
}

