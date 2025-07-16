// /app/api/vouchers/getById/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const id = parseInt(url.searchParams.get("id"));

    if (!id || isNaN(id)) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    const voucher = await prisma.transactionsMaster.findUnique({
      where: { tran_id: id },
      include: {
        acno: true,
        godownDetails: true,
        user: true,
        transactions: {
          include: {
            itemDetails: true,
            acnoDetails: true,
            costCenter: true,
            currencyDetails: true,
            godownDetails: true,
          },
        },
      },
    });

    if (!voucher) {
      return NextResponse.json({ message: "Voucher not found" }, { status: 404 });
    }

    return NextResponse.json({ data: voucher, status: 200 });
  } catch (error) {
    console.error("Error fetching voucher by ID:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
