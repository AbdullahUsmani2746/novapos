// app/api/pos/returns/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Adjust path as needed

export async function POST(request) {
  try {
    const { 
      originalOrderId, 
      returnItems, 
      returnReason, 
      userId 
    } = await request.json();

    // Validate input
    if (!originalOrderId || !returnItems || returnItems.length === 0) {
      return NextResponse.json(
        { error: "Missing required data" },
        { status: 400 }
      );
    }

    // Get original order to validate and get customer info
    const originalOrder = await prisma.transactionsMaster.findUnique({
      where: { tran_id: originalOrderId },
      include: { transactions: true }
    });

    if (!originalOrder) {
      return NextResponse.json(
        { error: "Original order not found" },
        { status: 404 }
      );
    }

    // Validate return quantities don't exceed original quantities
    for (const returnItem of returnItems) {
      const originalItem = originalOrder.transactions.find(
        t => t.itcd === returnItem.itcd
      );
      
      if (!originalItem) {
        return NextResponse.json(
          { error: `Item ${returnItem.itcd} not found in original order` },
          { status: 400 }
        );
      }

      if (returnItem.returnQty > originalItem.qty) {
        return NextResponse.json(
          { error: `Return quantity exceeds original quantity for item ${returnItem.itcd}` },
          { status: 400 }
        );
      }
    }

    // Get items with their categories to fetch acno
    const itemsWithCategory = await Promise.all(
      returnItems.map(async (item) => {
        const itemData = await prisma.item.findUnique({
          where: { itcd: item.itcd },
          include: { itemCategories: true }
        });
        return {
          ...item,
          categoryAcno: itemData?.itemCategories?.pos_acno || 15,
          itemName: itemData?.item || 'Unknown Item'
        };
      })
    );

    // Calculate total return amount
    const totalReturnAmount = returnItems.reduce(
      (sum, item) => sum + item.returnAmount, 
      0
    );

    // Create return transaction master record with tran_code: 12
    const returnOrder = await prisma.transactionsMaster.create({
      data: {
        dateD: new Date(),
        time: new Date(),
        tran_code: 12, // Return transaction code
        godown: 1,
        pycd: originalOrder.pycd, // Same customer as original order
        userId: userId,
        vr_no: Math.floor(Math.random() * 1000000),
        invoice_no: `RET-${Date.now()}`,
        sync_status: "pending",
        // Link to original order
        reference_id: originalOrderId,
        narration1: `Return for order ${originalOrder.invoice_no}`,
        narration2: returnReason,
        transactions: {
          create: itemsWithCategory.map((item) => ({
            itcd: item.itcd,
            qty: -item.returnQty, // Negative quantity for returns
            rate: item.returnAmount / item.returnQty, // Calculate rate from return amount
            acno: String(item.categoryAcno).padStart(4, '0'),
            gross_amount: -item.returnAmount, // Negative amount for returns
            camt: -item.returnAmount,
            narration1: `POS Return: ${item.itemName}`,
            narration2: returnReason,
          })),
        },
      },
      include: { transactions: true },
    });

    // Update stock - add back returned items
    for (const item of returnItems) {
      await prisma.item.update({
        where: { itcd: item.itcd },
        data: { 
          stock: { increment: item.returnQty },
          sync_status: "pending" 
        },
      });
    }

    // Create auto entry for customer refund (debit customer account)
    const customerRefundEntry = {
      tran_id: returnOrder.tran_id,
      sub_tran_id: 3,
      narration1: "Customer Refund - Auto Entry",
      narration2: returnReason,
      damt: 0, // Credit customer (they get money back)
      camt: totalReturnAmount, // Credit amount
      acno: returnOrder.pycd || null,
    };

    await prisma.transactions.create({ data: customerRefundEntry });
    console.log("Customer refund auto entry created:", customerRefundEntry);

    // Create cash/payment auto entry (credit cash account - money going out)
    const cashEntry = {
      tran_id: returnOrder.tran_id,
      sub_tran_id: 4,
      narration1: "Cash Refund - Auto Entry",
      narration2: returnReason,
      damt: totalReturnAmount, // Debit cash (money going out)
      camt: 0,
      acno: "0001", // Assuming cash account code
    };

    await prisma.transactions.create({ data: cashEntry });
    console.log("Cash refund auto entry created:", cashEntry);

    // Optional: Update original order status or add return reference
    await prisma.transactionsMaster.update({
      where: { tran_id: originalOrderId },
      data: {
        narration2: originalOrder.narration2 
          ? `${originalOrder.narration2} | Partial Return: ${returnOrder.invoice_no}`
          : `Partial Return: ${returnOrder.invoice_no}`
      }
    });

    // Return the created return order
    return NextResponse.json({
      success: true,
      returnOrder,
      totalReturnAmount,
      message: "Return processed successfully"
    });

  } catch (error) {
    console.error("POS Return error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch return history
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 1000000000000;
    const search = searchParams.get('search') || '';
    
    const skip = (page - 1) * limit;

    const where = {
      tran_code: 5, // Return transactions only
      ...(search && {
        OR: [
          { invoice_no: { contains: search, mode: 'insensitive' } },
          { narration1: { contains: search, mode: 'insensitive' } },
        ]
      })
    };

    const [returns, totalCount] = await Promise.all([
      prisma.transactionsMaster.findMany({
        where,
        include: {
          transactions: true,
          user: { select: { name: true } }, // Assuming you have user relation
        },
        orderBy: { dateD: 'desc' },
        skip,   
        take: limit,
      }),
      prisma.transactionsMaster.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return NextResponse.json({
      returns,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNext,
        hasPrev,
        startItem: skip + 1,
        endItem: Math.min(skip + limit, totalCount),
      }
    });

  } catch (error) {
    console.error("GET returns error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Search orders for returns
export async function PUT(request) {
  try {
    const { searchTerm } = await request.json();

    if (!searchTerm || searchTerm.trim().length < 3) {
      return NextResponse.json(
        { error: "Search term must be at least 3 characters" },
        { status: 400 }
      );
    }

    const orders = await prisma.transactionsMaster.findMany({
      where: {
        tran_code: 5, // Original POS sales only
        sync_status: 'completed', // Only completed orders can be returned
        OR: [
          { invoice_no: { contains: searchTerm, mode: 'insensitive' } },
          { narration1: { contains: searchTerm, mode: 'insensitive' } },
        ]
      },
      include: {
        transactions: {
          where: {
            qty: { gt: 0 } // Only positive quantities (exclude auto entries)
          }
        }
      },
      orderBy: { dateD: 'desc' },
      take: 10 // Limit search results
    });

    // Add customer names if you have customer table
    const ordersWithCustomer = await Promise.all(
      orders.map(async (order) => {
        let customerName = 'Walk-in Customer';
        
        if (order.pycd) {
          try {
            const customer = await prisma.customer.findUnique({
              where: { id: order.pycd },
              select: { name: true }
            });
            customerName = customer?.name || `Customer ${order.pycd}`;
          } catch (err) {
            console.log("Customer lookup failed:", err);
          }
        }

        return {
          ...order,
          customer: customerName
        };
      })
    );

    return NextResponse.json({ orders: ordersWithCustomer });

  } catch (error) {
    console.error("Search orders error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}