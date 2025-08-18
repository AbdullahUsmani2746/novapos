import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
// /api/orders/[orderNo]/items/[itemCode].js
export default async function Get(req, res) {
  const { orderNo, itemCode } = req.query;
  const { type } = req.query; // "purchase" or "sale"
  
  try {
    // Get original order quantity
    const orderDetail = await prisma.orderDetail.findFirst({
      where: {
        order_no: parseInt(orderNo),
        itcd: parseInt(itemCode)
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
        itcd: parseInt(itemCode),
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

   NextResponse.json({
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
   NextResponse.json({ 
      success: false, 
      status: 500,
      message: 'Internal server error' 
    });
  }
}