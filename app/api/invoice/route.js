import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { BadgeCent } from "lucide-react";

// GET method
export async function GET(req, { params }) {
   try {
    const invoices = await prisma.transactionsMaster.findMany({
      where: {
        invoice_no: {
          not: null
        }
      },
      select: {
        invoice_no: true,
        pycd: true,
        acno: {
          select: {
            acname: true
          }
        }
      },
      distinct: ['invoice_no'],
      orderBy: {
        invoice_no: 'asc'
      }
    });

    const formattedInvoices = invoices.map(invoice => ({
      invoice_no: invoice.invoice_no,
      pycd: invoice.pycd,
      pycd_name: invoice.acno?.acname || 'Unknown',
      display: `Account: ${invoice.acno?.acname || 'Unknown'} - Invoice No: ${invoice.invoice_no}`
    }));

    return NextResponse.json({
      success: true,
      count: formattedInvoices.length,
      data: formattedInvoices
    });

  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch invoices',
        error: error.message
      },
      { status: 500 }
    );
  }
}
