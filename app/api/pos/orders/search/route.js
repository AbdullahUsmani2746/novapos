import prisma from "@/lib/prisma";
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
        user:true,
        acno:true,
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