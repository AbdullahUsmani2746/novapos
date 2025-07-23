// /api/voucher/check-stock/route.js
import { NextResponse } from 'next/server'
import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const { productIds, godown } = await req.json()
    console.log("Master: ",godown)

    // If you want to check if godown is an empty object, use:
    if (!productIds || !Array.isArray(productIds)) {
      return NextResponse.json(
        { message: 'Missing or invalid product IDs' }, 
        { status: 400 }
      )
    }

    if (!godown) {
      return NextResponse.json(
        { message: 'Missing required parameter: godown' }, 
        { status: 400 }
      )
    }

    // Get current stock for all requested products using the new calculation method
    const stockLevels = {}

    for (const productId of productIds) {
      const itcd = parseInt(productId)
      
      const stock = await prisma.$queryRaw`
        SELECT SUM(
          CASE 
            WHEN tm.tran_code IN (4, 10) AND tm.godown = ${godown} THEN t.qty  -- Purchase, Sale Return (add to stock)
            WHEN tm.tran_code IN (6, 9, 5) AND tm.godown = ${godown} THEN -t.qty  -- Sale, Purchase Return (remove from stock)
            WHEN tm.tran_code = 11 AND tm.godown = ${godown} THEN -t.qty  -- Transfer out
            WHEN tm.tran_code = 11 AND tm.godown2 = ${godown} THEN t.qty   -- Transfer in
            ELSE 0
          END
        ) as stock
        FROM "Transactions" t
        JOIN "TRANSACTIONS_MASTER" tm ON t.tran_id = tm.tran_id
        WHERE t.itcd = ${itcd} 
        AND (tm.godown = ${godown} OR tm.godown2 = ${godown})
      `
      
      stockLevels[itcd] = stock[0]?.stock || 0
    }

    return NextResponse.json(stockLevels)
  } catch (error) {
    console.error('Stock check error:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to fetch stock levels' },
      { status: 500 }
    )
  }
}