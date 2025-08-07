"use client";
import React, { useState } from "react";

import { generateVoucherPDF } from "@/components/Template/Payment";
import { generateUnifiedPDF } from "@/components/Template/UnifiedReport";
import { generateOrderBalancePDF } from "@/components/Template/OrderBalance";
import { generateSalesBalancePDF } from "@/components/Template/SalesBalance";
import { generateCustomerAgingPDF } from "@/components/Template/CustomerAging";


const PDF = () => {
const [isDownloading, setIsDownloading] = useState(false);

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

 
  const handleDownload1 = () => {
    const doc = generateVoucherPDF();
    doc.save("payment-voucher.pdf");
  };
 

 
  const handleDownload5 = () => {
    const doc = generateUnifiedPDF(voucher)
    doc.save("delivery-invoice.pdf");
  };
  const handleDownload7 = () => {
    const doc = generateOrderBalancePDF()
    doc.save("order-balance.pdf");
  };
 const handleDownload8 = async () => {
  setIsDownloading(true);
  try {
    const doc = await generateSalesBalancePDF();
    console.log("Sales Balance PDF generated successfully: ",doc);
    doc.save("salesOrder-balance.pdf");
  } finally {
    setIsDownloading(false);
  }
};
  const handleDownload9 = () => {
    const doc = generateCustomerAgingPDF()
    doc.save("customer-aging.pdf");
  };

  return (
    <div className="p-4">
    
      <button
        onClick={handleDownload1}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        voucher 2
      </button>
     
      <div className="p-4">
      
      
        <button
          onClick={handleDownload5}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          invoice 3
        </button>
      </div>
      <div className="p-4">
        <button
          onClick={handleDownload7}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          sales order balance
        </button>
        <button
          onClick={handleDownload8}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          sales balance
        </button>
        <button
          onClick={handleDownload9}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          customer aging
        </button>
       
      </div>
    </div>
  );
};

export default PDF;
