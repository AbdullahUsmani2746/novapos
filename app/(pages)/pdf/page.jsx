"use client";
import React from "react";
import { generateAdjustmentPDF } from "@/components/Template/Adjustment";
import { generatePaymentPDF } from "@/components/Template/Payment";
import { generateReceiptPDF } from "@/components/Template/Receipt";
import { generateSalesInvoicePDF } from "@/components/Template/SalesInvoice";
import { generateCommisionPDF } from "@/components/Template/Commision";
import { generateDeliveryPDF } from "@/components/Template/Delivery";

const PDF = () => {
  const handleDownload = () => {
    const doc = generateAdjustmentPDF();
    doc.save("adjustment-voucher.pdf");
  };
  const handleDownload1 = () => {
    const doc = generatePaymentPDF();
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
    const doc = generateDeliveryPDF();
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
