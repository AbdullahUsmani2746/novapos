"use client";
import React from "react";
import { generateAdjustmentPDF } from "@/components/Template/Adjustment";
import { generateVoucherPDF } from "@/components/Template/Payment";
import { generateReceiptPDF } from "@/components/Template/Receipt";
import { generateSalesInvoicePDF } from "@/components/Template/SalesInvoice";
import { generateCommisionPDF } from "@/components/Template/Commision";
import { generateDeliveryPDF } from "@/components/Template/Delivery";
import { generateUnifiedPDF } from "@/components/Template/UnifiedReport";

const PDF = () => {

  const voucher = {
  documentType: 'commission', // or 'delivery' or 'sales'
  dateD: new Date(),
  vr_no: '12345',
  customer: {
    name: 'MUNDIA EXPORTS-EICL',
    strn: '12345',
    ntn: '67890',
    address: 'Customer Address'
  },
  invoice: {
    number: '13',
    date: '02-07-2024',
    po: 'PO-12345'
  },
  entries: [
    ['1', '0565D DILUENT', '4365', '225', 'KG', '754.02', '169,655'],
    ['2', '5639NT P-CYAN', '', '24', 'KG', '754.02', '18,096'],
    ['3', '5011GXF ROYAL BLUE', '3900', '25', 'KG', '754.02', '18,850'],
    ['4', '5011GXF ROYAL BLUE', '3900', '25', 'KG', '754.02', '18,850'],
    ['5', '5011GXF ROYAL BLUE', '3900', '25', 'KG', '754.02', '18,850'],
      ['1', '0565D DILUENT', '4365', '225', 'KG', '754.02', '169,655'],
    ['2', '5639NT P-CYAN', '', '24', 'KG', '754.02', '18,096'],
    ['3', '5011GXF ROYAL BLUE', '3900', '25', 'KG', '754.02', '18,850'],
    ['4', '5011GXF ROYAL BLUE', '3900', '25', 'KG', '754.02', '18,850'],
    ['5', '5011GXF ROYAL BLUE', '3900', '25', 'KG', '754.02', '18,850'],
    ['6', '5011GXF ROYAL BLUE', '3900', '25', 'KG', '754.02', '18,850'],
    ['7', '5011GXF ROYAL BLUE', '3900', '25', 'KG', '754.02', '18,850'],
    ['8', '5011GXF ROYAL BLUE', '3900', '25', 'KG', '754.02', '18,850'],
    ['9', '5011GXF ROYAL BLUE', '3900', '25', 'KG', '754.02', '18,850'],
    ['10','5011GXF ROYAL BLUE','3900','25','KG','754.02','18,850']
    // ... more entries
  ],
  // entries: [
  //     ["1", "0565D DILUENT", "4365", "25 X 9 = 225"],
  //     ["2", "5639NT P-CYAN", "", "24 X 1 = 24"],
  //     ["3", "5011GXF ROYAL BLUE", "3900", "25 X 1 = 25 KG"],
  //     ["4", "5011GXF ROYAL BLUE", "3900", "25 X 1 = 25 KG"],
  //     ["5", "5011GXF ROYAL BLUE", "3900", "25 X 1 = 25 KG"],
  //     ["6", "5011GXF ROYAL BLUE", "3900", "25 X 1 = 25 KG"],
  //     ["7", "5011GXF ROYAL BLUE", "3900", "25 X 1 = 25 KG"],
  //     ["8", "5011GXF ROYAL BLUE", "3900", "25 X 1 = 25 KG"],
  //     ["9", "5011GXF ROYAL BLUE", "3900", "25 X 1 = 25 KG"],
  //     ["10", "5011GXF ROYAL BLUE", "3900", "25 X 1 = 25 KG"],
  //     ["5", "5011GXF ROYAL BLUE", "3900", "25 X 1 = 25 KG"],
  //     ["6", "5011GXF ROYAL BLUE", "3900", "25 X 1 = 25 KG"],
  //     ["7", "5011GXF ROYAL BLUE", "3900", "25 X 1 = 25 KG"],
  //     ["8", "5011GXF ROYAL BLUE", "3900", "25 X 1 = 25 KG"],  
  //     ["9", "5011GXF ROYAL BLUE", "3900", "25 X 1 = 25 KG"],
  //     ["10", "5011GXF ROYAL BLUE", "3900", "25 X 1 = 25 KG"]


  //   ],
    
  totals: {
    amount: '243,930',
    tax: { value: '43,907', percentage: '18' },
    grandTotal: { value: '287,837', weight: '274' }
  }
};

  const handleDownload = () => {
    const doc = generateAdjustmentPDF();
    doc.save("adjustment-voucher.pdf");
  };
  const handleDownload1 = () => {
    const doc = generateVoucherPDF();
    doc.save("payment-voucher.pdf");
  };
  const handleDownload2 = () => {
    const doc = generateReceiptPDF();
    doc.save("receipt-voucher.pdf");
  };
  const handleDownload3 = () => {
    const doc = generateSalesInvoicePDF();
    doc.save("sales-invoice.pdf");
  };
  const handleDownload4 = () => {
    const doc = generateCommisionPDF();
    doc.save("commision-invoice.pdf");
  };
  const handleDownload5 = () => {
    const doc = generateUnifiedPDF(voucher)
    doc.save("delivery-invoice.pdf");
  };

  return (
    <div className="p-4">
      <button
        onClick={handleDownload}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        voucher 1
      </button>
      <button
        onClick={handleDownload1}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        voucher 2
      </button>
      <button
        onClick={handleDownload2}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        voucher 3
      </button>
      <div className="p-4">
        <button
          onClick={handleDownload3}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          invoice 1
        </button>
        <button
          onClick={handleDownload4}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          invoice 2
        </button>
        <button
          onClick={handleDownload5}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          invoice 3
        </button>
      </div>
    </div>
  );
};

export default PDF;
