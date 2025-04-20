'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import VoucherForm from './VoucherForm';

export function VoucherTable({ data, type }) {
  const [open, setOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const router = useRouter();

  const handleEdit = (voucher) => {
    setSelectedVoucher(voucher);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/vouchers/${id}`, { method: 'DELETE' });
      router.refresh();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>VR No</TableHead>
              {type !== 'journal' && <TableHead>Account</TableHead>}
              {type !== 'journal' && <TableHead>Check/Ref No</TableHead>}
              <TableHead>Amount</TableHead>
              {type === 'journal' && <TableHead>Remarks</TableHead>}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((voucher) => (
              <TableRow key={voucher.tran_id}>
                <TableCell>{new Date(voucher.dateD).toLocaleDateString()}</TableCell>
                <TableCell>{voucher.vr_no}</TableCell>
                {type !== 'journal' && <TableCell>{voucher.pycd}</TableCell>}
                {type !== 'journal' && <TableCell>{voucher.check_no}</TableCell>}
                <TableCell>
                  {voucher.transactions.reduce((sum, t) => sum + (t.damt || t.camt || 0), 0)}
                </TableCell>
                {type === 'journal' && <TableCell>{voucher.rmk1}</TableCell>}
                <TableCell>
                  <Button onClick={() => handleEdit(voucher)}>Edit</Button>
                  <Button variant="destructive" onClick={() => handleDelete(voucher.tran_id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <VoucherForm
            type={type}
            initialData={selectedVoucher}
            onSuccess={() => {
              setOpen(false);
              router.refresh();
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}