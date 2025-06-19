import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const tran_code = parseInt(url.searchParams.get("tran_code"));
    const pycd = url.searchParams.get("pycd");
    const invoice_no = url.searchParams.get("invoice_no");

    if (!tran_code || !pycd || !invoice_no) {
      return NextResponse.json(
        { message: "Missing required query parameters" },
        { status: 400 }
      );
    }

    const existingInvoice = await prisma.transactionsMaster.findFirst({
      where: {
        tran_code,
        pycd,
        invoice_no,
      },
    });

    if (existingInvoice) {
      let nextInvoiceNo = parseInt(invoice_no) + 1;

      let existsNext = await prisma.transactionsMaster.findFirst({
        where: {
          tran_code,
          pycd,
          invoice_no: nextInvoiceNo.toString(),
        },
      });

      // Keep incrementing until a free invoice_no is found
      while (existsNext) {
        nextInvoiceNo++;
        existsNext = await prisma.transactionsMaster.findFirst({
          where: {
            tran_code,
            pycd,
            invoice_no: nextInvoiceNo.toString(),
          },
        });
      }

      return NextResponse.json({
        exists: true,
        nextInvoiceNo,
        status: 200,
      });
    }

    return NextResponse.json({ exists: false, status: 200 });
  } catch (error) {
    console.error("Invoice check error:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
