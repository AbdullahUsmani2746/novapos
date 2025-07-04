import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const tran_code = parseInt(searchParams.get("tran_code"));

  if (!date || !tran_code) {
    return NextResponse.json(
      { message: "Date and tran_code are required" },
      { status: 400 }
    );
  }

  try {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const transactions = await prisma.transactionsMaster.findMany({
      where: {
        tran_code,
        dateD: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        transactions: {
          where: {
            sub_tran_id: 1 // Only main lines
          },
        include: {
        itemDetails: true // Include item details if needed
      }
    },
    acno: true // Include account details
      },
      orderBy: {
        dateD: 'desc'
      }
    });

    return NextResponse.json({
      data: transactions,
      status: 200
    });
  } catch (error) {
    console.error("Error fetching original transactions:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}