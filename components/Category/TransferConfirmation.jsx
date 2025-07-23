// TransferConfirmation.jsx
"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function TransferConfirmation({ 
  isOpen, 
  onConfirm, 
  onCancel,
  fromGodown,
  toGodown,
  items 
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Godown Transfer</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium">From Godown:</h4>
              <p>{fromGodown}</p>
            </div>
            <div>
              <h4 className="font-medium">To Godown:</h4>
              <p>{toGodown}</p>
            </div>
          </div>
          
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2">Items to Transfer:</h4>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span>{item.item}</span>
                  <span>{item.qty} units</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            Confirm Transfer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}