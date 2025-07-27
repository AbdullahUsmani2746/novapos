import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const invoice_no = url.searchParams.get("invoice_no");
    const damt = url.searchParams.get("damt") || "false";
    const camt = url.searchParams.get("camt") || "false";

    const amount = parseFloat(url.searchParams.get("amount"));

    // Validate required parameters
    if (!invoice_no || isNaN(amount)) {
      return NextResponse.json(
        { 
          message: "Missing or invalid required query parameters (tran_code, pycd, invoice_no, amount)" 
        },
        { status: 400 }
      );
    }

    // First check if the invoice exists in transactionsMaster
    const existingInvoice = await prisma.transactionsMaster.findFirst({
      where: {
        invoice_no,
      },
    });

    if (!existingInvoice) {
      return NextResponse.json({
        exists: false,
        message: "Invoice not found",
        status: 404,
      });
    }

    // Get transaction details with sub_tran_id = 3 to calculate available balance
    const transactionSub = await prisma.transactions.findFirst({
      where: {
        transactionsMaster: {
          invoice_no,
        },
        sub_tran_id: 3,
      },
    });

    if (!transactionSub) {
      return NextResponse.json({
        exists: true,
        valid: false,
        message: "Transaction sub record with sub_tran_id 3 not found",
        status: 404,
      });
    }

    // Calculate available balance (camt - damt)
    const creditAmount = parseFloat(transactionSub.camt) || 0;
    const debitAmount = parseFloat(transactionSub.damt) || 0;
    const availableBalance = damt==="true" ? debitAmount : camt==="true" ? creditAmount : 0;

    // Check if the requested amount is greater than available balance
    const isValid = amount <= availableBalance;

    return NextResponse.json({
      exists: true,
      valid: isValid,
      requestedAmount: amount,
      availableBalance,
      creditAmount,
      debitAmount,
      message: isValid 
        ? "Amount is valid" 
        : `Amount ${amount} exceeds available balance ${availableBalance}`,
      status: 200,
    });

  } catch (error) {
    console.error("Amount validation error:", error);
    return NextResponse.json(
      { 
        message: "Server error", 
        error: error.message 
      },
      { status: 500 }
    );
  }
}
