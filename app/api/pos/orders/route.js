import prisma from "@/lib/prisma";
import { syncOrderToWooCommerce } from "@/services/wooCommerceSync";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Get pagination parameters
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10000000;
    const search = searchParams.get("search") || "";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build where clause for filtering
    const whereClause = {
      tran_code: 5,
    };

    // Search filter
    if (search) {
      whereClause.OR = [
        { invoice_no: { contains: search, mode: "insensitive" } }
      ];
    }

    // Date range filter
    if (startDate && endDate) {
      whereClause.dateD = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    // Get total count for pagination info
    const totalCount = await prisma.transactionsMaster.count({
      where: whereClause,
    });

    // Get orders with pagination
    const orders = await prisma.transactionsMaster.findMany({
      where: whereClause,
      include: {
        transactions: {
          include: {
            itemDetails: true,
          },
        },
      },
      orderBy: {
        dateD: "desc",
      },
      skip: offset,
      take: limit,
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return NextResponse.json({
      orders,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNext,
        hasPrev,
        startItem: offset + 1,
        endItem: Math.min(offset + limit, totalCount),
      },
    });
  } catch (error) {
    console.error("GET orders error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { cartItems, customer, total, id } = await request.json();

    const order = await prisma.transactionsMaster.create({
      data: {
        dateD: new Date(),
        time: new Date(),
        tran_code: 5,
        pycd: customer,
        userId: id,
        vr_no: Math.floor(Math.random() * 1000000),
        invoice_no: `POS-${Date.now()}`,
        sync_status: "pending",
        transactions: {
          create: cartItems.map((item) => ({
            itcd: item.itcd,
            qty: item.quantity,
            rate: item.price,
            acno: customer,
            gross_amount: item.quantity * item.price,
            damt:item.quantity * item.price,
            narration1: `POS Sale: ${item.item}`,
          })),
        },
      },
      include: { transactions: true },
    });

    for (const item of cartItems) {
      await prisma.item.update({
        where: { itcd: item.itcd },
        data: { stock: { decrement: item.quantity }, sync_status: "pending" },
      });
    }

    // Uncomment this if syncing is needed
    // await syncOrderToWooCommerce(order);

    return NextResponse.json(order);
  } catch (error) {
    console.error("POST order error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
