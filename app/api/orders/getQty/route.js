import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
// /api/orders/[orderNo]/items/[itemCode].js
export async function GET(req) {
    const { searchParams } = new URL(req.url)
    const orderNo = searchParams.get('orderNo')
    const item = searchParams.get('item');
    const type = searchParams.get('type'); // "purchase" or "sale"

  console.log("Fetching order item details for:", { orderNo, item, type });
  
  try {
    // Get original order quantity
    const orderDetail = await prisma.orderDetail.findFirst({
      where: {
        order_no: parseInt(orderNo),
        itcd: parseInt(item)
      }
    });

    if (!orderDetail) {
      return NextResponse.json({ 
        success: false, 
        message: 'Item not found in order' 
      });
    }

    const originalQty = orderDetail.no_of_packs * orderDetail.qty_per_pack;

    // Get consumed quantity from transactions
    const consumedTransactions = await prisma.transactions.findMany({
      where: {
        itcd: parseInt(item),
        transactionsMaster: {
          ...(type === "purchase" ? { po_no: parseInt(orderNo) } : { so_no: parseInt(orderNo) }),
          tran_code: type === "purchase" ? { in: [4] } : { in: [6] } // Purchase/GRN or Sale/Dispatch codes
        }
      },
      select: {
        qty: true
      }
    });

    const consumedQty = consumedTransactions.reduce((sum, t) => sum + (t.qty || 0), 0);
    const availableQty = originalQty - consumedQty;
    console.log("Order Detail:", {
         itcd: orderDetail.itcd,
        rate: orderDetail.rate,
        original_qty: originalQty,
        consumed_qty: consumedQty,
        available_qty: Math.max(0, availableQty),
        no_of_packs: orderDetail.no_of_packs,
        qty_per_pack: orderDetail.qty_per_pack
    });

   return NextResponse.json({
      success: true,
      item: {
        itcd: orderDetail.itcd,
        rate: orderDetail.rate,
        original_qty: originalQty,
        consumed_qty: consumedQty,
        available_qty: Math.max(0, availableQty),
        no_of_packs: orderDetail.no_of_packs,
        qty_per_pack: orderDetail.qty_per_pack
      }
    });

  } catch (error) {
    console.error('Error fetching order item details:', error);
   return NextResponse.json({ 
      success: false, 
      status: 500,
      message: 'Internal server error' 
    });
  }
}